import {itemTypes} from '../data/items';
import {requireMaterial} from '../data/materials';
import {quests} from '../data/quests';
import {addStats, baseEntry, isCoreStat, roundStat, statDefs, statOrder} from '../data/stats';
import type {EncounterTier, BaseStats, CraftedItem, GameState, ItemStats, ItemTypeKey, MaterialDef, StatKey, StatValues, Tag} from './types';

// Finds the most specific tag on the item type's path that the material defines.
export function resolveTag<T>(table: Partial<Record<Tag, T>> | undefined, itemType: ItemTypeKey): {tag: Tag, value: T} | undefined {
    if (!table) {
        return undefined;
    }
    for (const tag of itemTypes[itemType].tags) {
        const value = table[tag];
        if (value) {
            return {tag, value};
        }
    }
    return undefined;
}

// The base with its decoration slots set by decorationSlots (the material tables' own counts are
// not used), cached per material and item type.
const baseCache = new Map<string, BaseStats | null>();
export function getBaseStats(material: MaterialDef, itemType: ItemTypeKey): BaseStats | undefined {
    const id = material.key + '|' + itemType;
    let cached = baseCache.get(id);
    if (cached === undefined) {
        const raw = resolveTag(material.base, itemType)?.value;
        cached = raw ? {...raw, maxDecorations: decorationSlots(material, itemType, raw)} : null;
        baseCache.set(id, cached);
    }
    return cached ?? undefined;
}

// ---------------- Decoration slots ----------------
// Equipment tops out at 5, belts and amulets at 4 and rings at 3 (the guild unlocks up to 5 and 4). Each kind has a usual
// count by power and a higher count for special materials, which reach each new count a few tiers
// before the usual one: equipment 3 slots from P4 (usual from P5), 4 from P6 (P8), 5 from P10 (P13).
// Special equipment materials: the decoration role, mythic drops and legendaries (rare).
// Special accessory materials: the decoration role, rare and mythic drops and legendaries (occasional).
// Accessories: belts get 2 slots usually from P3 and 3 from P7 (special) or P9 (usual), amulets
// 2 from P4 and 3 from P9 or P11, rings 2 from P5 and 3 from P11 or P13.
// Belts and amulets reach a 4th slot late: special from `four`, usual a tier later. Rings stop at 3.
export const ACCESSORY_SLOT_TIERS: Partial<Record<ItemTypeKey, {two: number, three: number, four?: number}>> = {
    belt: {two: 3, three: 7, four: 11},
    amulet: {two: 4, three: 9, four: 13},
    ring: {two: 5, three: 11},
};
const DROP_RANK: Record<EncounterTier | 'M', number> = {C: 0, U: 1, R: 2, M: 3};
let dropTiers: Map<string, number> | null = null;
// The best (most common) pool a material drops from: 0 common to 3 mythic, or undefined.
function commonestDrop(key: string): number | undefined {
    if (!dropTiers) {
        dropTiers = new Map();
        for (const q of Object.values(quests)) {
            for (const [tier, pool] of Object.entries(q.pools) as [EncounterTier | 'M', {material: string}[]][]) {
                for (const e of pool) {
                    const rank = DROP_RANK[tier];
                    if (!dropTiers.has(e.material) || rank < dropTiers.get(e.material)!) dropTiers.set(e.material, rank);
                }
            }
        }
    }
    return dropTiers.get(key.replace(/^premium:/, ''));
}
export function decorationSlots(material: MaterialDef, itemType: ItemTypeKey, base: BaseStats): number {
    const p = material.power;
    const drop = commonestDrop(material.key);
    const acc = isAccessory(itemType);
    const special = base.role === 'decor' || !!material.legendary || (drop !== undefined && drop >= (acc ? 2 : 3));
    if (acc) {
        const t = ACCESSORY_SLOT_TIERS[itemType] ?? {two: 4, three: 9};
        const four = t.four ?? Infinity;
        const usual = p >= four + 1 ? 4 : p >= t.three + 2 ? 3 : p >= t.two ? 2 : 1;
        return special ? Math.max(usual, p >= four ? 4 : p >= t.three ? 3 : p >= t.two - 1 ? 2 : 1) : usual;
    }
    const usual = p >= 13 ? 5 : p >= 8 ? 4 : p >= 5 ? 3 : p >= 3 ? 2 : 1;
    return special ? Math.max(usual, p >= 10 ? 5 : p >= 6 ? 4 : p >= 4 ? 3 : 2) : usual;
}
export function getDecorationStats(material: MaterialDef, itemType: ItemTypeKey): StatValues | undefined {
    return resolveTag(material.decoration, itemType)?.value;
}

// How much an item type scales a base stat: weapons scale damage, armor pieces scale armor and evasion.
// Other base stats also take the item type's secondary multiplier (see secondaryScale).
export function statScale(itemType: ItemTypeKey, stat: StatKey): number {
    const type = itemTypes[itemType];
    const scale = statDefs[stat].scale;
    const secondary = isCoreStat(stat) ? 1 : secondaryScale(itemType, stat);
    if (scale === 'weaponDamage') return (type.damageMultiplier ?? 1) * secondary;
    // Accessories scale only the defenses (armor, evasion, ward) by their multiplier, not life regen.
    if (scale === 'defenseRating') return (isAccessory(itemType) && !isCoreStat(stat) ? 1 : type.armorMultiplier ?? 1) * secondary;
    return secondary;
}

// Stats that are shares rather than amounts, which a bigger weapon shouldn't multiply.
const UNSCALED = new Set<StatKey>(['physicalToFire', 'physicalToCold', 'physicalToLightning', 'blockChance', 'hpLostAsWard']);
// How much an item type multiplies a secondary stat from its bases, or any stat from a decoration.
export function secondaryScale(itemType: ItemTypeKey, stat: StatKey): number {
    const type = itemTypes[itemType];
    return type.statMultipliers?.[stat] ?? (UNSCALED.has(stat) ? 1 : type.secondaryMultiplier ?? 1);
}

// Decorations scale like secondary stats, except crit chance and crit multiplier, which stay at
// their 10% to 20% band on every item type.
const UNSCALED_DECORATION = new Set<StatKey>(['critChance', 'critMultiplier']);
export function decorationScale(itemType: ItemTypeKey, stat: StatKey): number {
    return UNSCALED_DECORATION.has(stat) ? 1 : secondaryScale(itemType, stat);
}

// Recovery stats come in clean steps on items: 0.5, 1 and 1.5, then whole numbers. Two-handed
// weapons round up to the next whole number.
const STEPPED = new Set<StatKey>(['lifeOnHit', 'lifeRegen', 'wardOnDodge', 'wardOnBlock']);
export function itemStatRound(stat: StatKey, value: number, itemType: ItemTypeKey): number {
    if (!STEPPED.has(stat) || value <= 0) return value;
    if (itemTypes[itemType].twoHanded) return Math.ceil(value - 1e-9);
    return value < 1.75 ? Math.max(0.5, Math.round(value * 2) / 2) : Math.round(value);
}

export function isAccessory(itemType: ItemTypeKey): boolean {
    return itemTypes[itemType].tags.includes('accessory');
}

// Weapons and armor share one base material limit. Accessories have their own, since they have no caps.
export function getBaseLimit(state: GameState, itemType: ItemTypeKey): number {
    return isAccessory(itemType) ? state.guild.maxAccessoryBaseMaterials : state.guild.maxBaseMaterials;
}
// Accessories have their own decoration slots.
export function getDecorationLimit(state: GameState, itemType: ItemTypeKey): number {
    return isAccessory(itemType) ? state.guild.maxAccessoryDecorations ?? 1 : state.guild.maxDecorations;
}

// One stat on a crafted item, broken down so the bench can show what the cap is doing.
// All values are after the item type's multiplier.
export interface StatLine {
    stat: StatKey
    // Sum of the base materials, before the cap.
    raw: number
    // Infinity for stats that aren't core stats.
    cap: number
    // min(raw, cap).
    base: number
    // Added by decorations, past the cap.
    decoration: number
    total: number
}

export interface CraftPreview {
    name: string
    stats: ItemStats
    lines: StatLine[]
    maxDecorations: number
    power: number
}

// Decorations can be at most this many tiers (power) above the strongest base material, so a
// strong decoration can't turn a low level item into a top item.
export const DECORATION_TIER_LEAD = 2;

// The strongest decoration power these base materials allow (0 = no valid base yet).
export function maxDecorationPower(itemType: ItemTypeKey, baseKeys: string[]): number {
    const powers = baseKeys.map(requireMaterial).filter(m => getBaseStats(m, itemType)).map(m => m.power);
    return powers.length ? Math.max(...powers) + DECORATION_TIER_LEAD : 0;
}

// Mirrors minmaxer's createCraftedArmor/createCraftedWeapon, generalized to any stat: each stat
// is summed across base materials and capped separately, then decorations add on top.
// keepAll: an already crafted item keeps every decoration it was made with, even if its bases now
// support fewer slots (older saves).
export function previewCraft(itemType: ItemTypeKey, baseKeys: string[], decorationKeys: string[], maxGuildDecorations = Infinity, keepAll = false): CraftPreview | undefined {
    const type = itemTypes[itemType];
    const raw: StatValues = {}, caps: StatValues = {}, decoration: StatValues = {};
    let maxDecorations = 0, power = 0;
    let name = '', namePriority = -Infinity;
    let used = 0;
    for (const key of baseKeys) {
        const material = requireMaterial(key);
        const base = getBaseStats(material, itemType);
        if (!base) {
            continue;
        }
        used++;
        for (const [stat, entry] of Object.entries(base.stats) as [StatKey, [number, number] | number][]) {
            const [value, cap] = baseEntry(entry);
            raw[stat] = (raw[stat] ?? 0) + value;
            caps[stat] = Math.max(caps[stat] ?? 0, cap);
        }
        maxDecorations = Math.max(maxDecorations, base.maxDecorations);
        power = Math.max(power, material.power);
        const priority = base.labelPriority ?? material.power;
        if (priority > namePriority) {
            namePriority = priority;
            name = base.itemLabel ?? `${material.prefix ?? material.name} ${type.noun}`;
        }
    }
    if (!used) {
        return undefined;
    }
    const decorationLimit = keepAll ? decorationKeys.length : Math.min(maxDecorations, maxGuildDecorations);
    const decorationCap = power + DECORATION_TIER_LEAD;
    for (const key of decorationKeys.slice(0, decorationLimit)) {
        const material = requireMaterial(key);
        const extra = getDecorationStats(material, itemType);
        if (!extra || material.power > decorationCap) {
            continue;
        }
        // Decorations don't raise the item's power or level requirement; the tier cap keeps them in line.
        addStats(decoration, extra);
    }
    const lines: StatLine[] = [];
    const stats: StatValues = {};
    for (const stat of statOrder) {
        if (!raw[stat] && !decoration[stat]) {
            continue;
        }
        // Core stats scale by the item type's damage or armor multiplier; other base stats, and
        // all decorations, by its secondary multiplier.
        const scale = statScale(itemType, stat);
        const r = (v: number) => roundStat(stat, itemStatRound(stat, v, itemType));
        const line: StatLine = {
            stat,
            raw: r((raw[stat] ?? 0) * scale),
            cap: r((caps[stat] ?? 0) * scale),
            base: r(Math.min(raw[stat] ?? 0, caps[stat] ?? 0) * scale),
            decoration: r((decoration[stat] ?? 0) * decorationScale(itemType, stat)),
            total: 0,
        };
        line.total = roundStat(stat, line.base + line.decoration);
        lines.push(line);
        stats[stat] = line.total;
    }
    return {
        name,
        stats: {stats, attacksPerSecond: type.attacksPerSecond},
        lines,
        maxDecorations: decorationLimit,
        power,
    };
}

export function round1(value: number): number {
    return Math.round(value * 10) / 10;
}

export function getCraftedItemStats(item: CraftedItem): ItemStats {
    return previewCraft(item.itemType, item.base, item.decorations, Infinity, true)?.stats ?? {stats: {}};
}

export function getMaterialEquipStats(material: MaterialDef): ItemStats | undefined {
    if (!material.equip) {
        return undefined;
    }
    return {stats: material.equip.stats, attacksPerSecond: itemTypes[material.equip.itemType].attacksPerSecond};
}

// Gold from selling a crafted item: a value per material, scaled by how many slots the item covers.
export function getSellValue(item: CraftedItem): number {
    let value = 0;
    for (const key of [...item.base, ...item.decorations]) {
        const power = requireMaterial(key).power;
        value += 2 * power * power;
    }
    return Math.max(1, Math.round(value * (itemTypes[item.itemType].twoHanded ? 1.2 : 1)));
}

export function craftItem(state: GameState, itemType: ItemTypeKey, baseKeys: string[], decorationKeys: string[]): CraftedItem | string {
    const preview = previewCraft(itemType, baseKeys, decorationKeys, getDecorationLimit(state, itemType));
    if (!preview) {
        return 'Add at least one base material.';
    }
    if (baseKeys.length > getBaseLimit(state, itemType)) {
        return 'Too many base materials.';
    }
    const decorations = decorationKeys.slice(0, preview.maxDecorations);
    const cap = maxDecorationPower(itemType, baseKeys);
    const tooStrong = decorations.find(k => requireMaterial(k).power > cap);
    if (tooStrong) {
        return `${requireMaterial(tooStrong).name} is too strong a decoration for these base materials (P${cap} at most).`;
    }
    const needed: Record<string, number> = {};
    for (const key of [...baseKeys, ...decorations]) {
        needed[key] = (needed[key] ?? 0) + 1;
    }
    for (const [key, count] of Object.entries(needed)) {
        if ((state.materials[key] ?? 0) < count) {
            return 'Not enough ' + requireMaterial(key).name + '.';
        }
    }
    for (const [key, count] of Object.entries(needed)) {
        state.materials[key] -= count;
    }
    const item: CraftedItem = {
        id: 'item' + state.nextId++,
        itemType,
        name: preview.name,
        base: [...baseKeys],
        decorations,
        power: preview.power,
    };
    state.craftedItems.push(item);
    state.craftedCount = (state.craftedCount ?? 0) + 1;
    state.guide = {...state.guide, crafted: true, ...(decorations.length ? {decorated: true} : {})};
    return item;
}
