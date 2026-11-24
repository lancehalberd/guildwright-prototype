// Builds sim gear from priorities instead of by hand: for each slot, the craft that scores best for
// an archetype's stat weights, from the materials and guild slots a stage of the game offers.
// It is a reasonable player, not a perfect one: crafts are built greedily (a small beam search over
// bases, then decorations one at a time) and scored by fixed weights, not by simulating fights.
import {itemTypes} from '../src/data/items';
import {requireMaterial} from '../src/data/materials';
import {monsters, questOrder, quests} from '../src/data/quests';
import {elements, resistStat} from '../src/data/stats';
import {getBaseStats, getDecorationStats, previewCraft} from '../src/engine/crafting';
import type {Element, ItemTypeKey, SlotKey, StatKey, StatValues} from '../src/engine/types';
import type {Gear} from './simSetup';

export type Weights = Partial<Record<StatKey, number>>;

export interface Stage {
    name: string
    quest: string
    level: number
    // Highest tier of the stage's own quest whose drops are in hand (earlier quests: everything but mythics).
    tiers: ('C' | 'U' | 'R')[]
    slots: {base: number, deco: number, accBase: number, accDeco: number}
}

export const stages: Stage[] = [
    {name: 'Bramble early', quest: 'brambleRoad', level: 5, tiers: ['C'], slots: {base: 1, deco: 1, accBase: 1, accDeco: 1}},
    {name: 'Bramble late', quest: 'brambleRoad', level: 9, tiers: ['C', 'U', 'R'], slots: {base: 2, deco: 2, accBase: 1, accDeco: 1}},
    {name: 'Mines early', quest: 'hollowMines', level: 12, tiers: ['C'], slots: {base: 2, deco: 2, accBase: 1, accDeco: 2}},
    {name: 'Mines late', quest: 'hollowMines', level: 16, tiers: ['C', 'U', 'R'], slots: {base: 3, deco: 2, accBase: 2, accDeco: 2}},
    {name: 'Ashen early', quest: 'ashenPeaks', level: 18, tiers: ['C'], slots: {base: 3, deco: 3, accBase: 2, accDeco: 2}},
    {name: 'Ashen late', quest: 'ashenPeaks', level: 24, tiers: ['C', 'U', 'R'], slots: {base: 4, deco: 3, accBase: 2, accDeco: 2}},
    {name: 'Marsh early', quest: 'sunkenMarsh', level: 18, tiers: ['C'], slots: {base: 3, deco: 3, accBase: 2, accDeco: 2}},
    {name: 'Marsh late', quest: 'sunkenMarsh', level: 24, tiers: ['C', 'U', 'R'], slots: {base: 4, deco: 3, accBase: 2, accDeco: 2}},
    {name: 'Coast early', quest: 'thunderheadCrags', level: 18, tiers: ['C'], slots: {base: 3, deco: 3, accBase: 2, accDeco: 2}},
    {name: 'Coast late', quest: 'thunderheadCrags', level: 24, tiers: ['C', 'U', 'R'], slots: {base: 4, deco: 3, accBase: 2, accDeco: 2}},
    {name: 'Rift early', quest: 'sunderedRift', level: 27, tiers: ['C'], slots: {base: 4, deco: 4, accBase: 2, accDeco: 3}},
    {name: 'Rift late', quest: 'sunderedRift', level: 33, tiers: ['C', 'U', 'R'], slots: {base: 5, deco: 4, accBase: 3, accDeco: 3}},
    {name: 'Hive early', quest: 'amberHive', level: 36, tiers: ['C'], slots: {base: 5, deco: 5, accBase: 3, accDeco: 3}},
    {name: 'Hive late', quest: 'amberHive', level: 42, tiers: ['C', 'U', 'R'], slots: {base: 5, deco: 5, accBase: 3, accDeco: 3}},
    {name: 'Grave late', quest: 'duskgraveNecropolis', level: 42, tiers: ['C', 'U', 'R'], slots: {base: 5, deco: 5, accBase: 3, accDeco: 3}},
    {name: 'Foundry late', quest: 'ironboundFoundry', level: 42, tiers: ['C', 'U', 'R'], slots: {base: 5, deco: 5, accBase: 3, accDeco: 3}},
    {name: 'Aerie late', quest: 'skyspireAerie', level: 42, tiers: ['C', 'U', 'R'], slots: {base: 5, deco: 5, accBase: 3, accDeco: 3}},
    {name: 'Throne early', quest: 'shatteredThrone', level: 48, tiers: ['C'], slots: {base: 5, deco: 5, accBase: 3, accDeco: 3}},
    {name: 'Throne late', quest: 'shatteredThrone', level: 54, tiers: ['C', 'U', 'R'], slots: {base: 5, deco: 5, accBase: 3, accDeco: 3}},
];

// Materials a guild has at this stage: every non-mythic drop of earlier quests, plus the stage
// quest's drops up to its tier.
export function stageMaterials(stage: Stage): string[] {
    const out = new Set<string>(['wood']);
    for (const key of questOrder) {
        const quest = quests[key];
        const tiers = key === stage.quest ? stage.tiers : ['C', 'U', 'R'] as const;
        for (const tier of tiers) for (const entry of quest.pools[tier]) out.add(entry.material);
        if (key === stage.quest) break;
    }
    return [...out].filter(k => !requireMaterial(k).legendary);
}

// What a quest throws at you and how its monsters resist, weighted by monster damage and HP.
export function zoneProfile(questKey: string): {incoming: Record<string, number>, resist: Record<Element, number>, armor: number} {
    const quest = quests[questKey];
    const incoming: Record<string, number> = {physical: 0, fire: 0, cold: 0, lightning: 0};
    const resist = {fire: 0, cold: 0, lightning: 0} as Record<Element, number>;
    let hpTotal = 0, armor = 0;
    for (const encounter of quest.encounters) {
        for (const key of encounter.monsters) {
            const m = monsters[key];
            for (const [type, share] of Object.entries(m.damageTypes ?? {physical: 1})) incoming[type] += (share ?? 0) * m.damage;
            for (const e of elements) resist[e] += (m.resist?.[e] ?? 0) * m.hp;
            armor += m.armor * m.hp;
            hpTotal += m.hp;
        }
    }
    const total = Object.values(incoming).reduce((a, b) => a + b, 0);
    for (const k of Object.keys(incoming)) incoming[k] /= total;
    for (const e of elements) resist[e] /= hpTotal;
    return {incoming, resist, armor: armor / hpTotal};
}

export interface Archetype {
    name: string
    classKey: string
    // Weapon types this archetype will use: a class's signature weapon, as most players would.
    // No weapons = unarmed.
    weapons: ItemTypeKey[]
    // Off-hand types to try with a one-handed weapon. Default a shield.
    offHand?: ItemTypeKey[]
    weights: Weights
}

const defense: Weights = {
    armor: 1, evasion: 1, maxHealth: 0.6, increasedMaxHealth: 40, lifeRegen: 1, lifeOnHit: 1.5, lifeLeech: 150, lifeRegenPercent: 400,
    blockChance: 120, ward: 0.8, hpLostAsWard: 40, increasedArmor: 30, increasedEvasion: 25,
};
const offense: Weights = {
    physicalDamage: 3, fireDamage: 3.4, coldDamage: 3.4, lightningDamage: 3.4, attackSpeed: 120, critChance: 60, critMultiplier: 15,
    increasedDamage: 80, increasedPhysicalDamage: 60, increasedElementalDamage: 50, accuracy: 0.3,
    physicalToFire: 20, physicalToCold: 20, physicalToLightning: 20,
};
export const archetypes: Archetype[] = [
    {name: 'Warrior, Str melee', classKey: 'warrior', weapons: ['sword', 'axe', 'greatsword', 'dagger'], weights: {...defense, ...offense, str: 3, dex: 1, int: 0.6}},
    {name: 'Ranger, Dex bow', classKey: 'ranger', weapons: ['bow'], weights: {...defense, ...offense, dex: 3, str: 1.5, int: 0.6, accuracy: 0.6}},
    {name: 'Priest, Int staff', classKey: 'priest', weapons: ['staff', 'wand'], weights: {...defense, ...offense, int: 3, str: 1.5, dex: 1}},
    {name: 'Reaver, Str+Dex axe', classKey: 'reaver', weapons: ['axe', 'sword', 'greatsword'], weights: {...defense, ...offense, str: 2.5, dex: 2.5, int: 0.6}},
    {name: 'Spellblade, Dex+Int', classKey: 'spellblade', weapons: ['dagger', 'wand'], weights: {...defense, ...offense, dex: 2.5, int: 2.5, str: 1.2, critChance: 30}},
    {name: 'Battlemage, Int+Str', classKey: 'battlemage', weapons: ['staff', 'wand'], weights: {...defense, ...offense, int: 2.5, str: 2.5, dex: 0.8, lifeLeech: 250, lifeOnHit: 2.5}},
    {name: 'Priest, ward', classKey: 'priest', weapons: ['staff', 'wand'], weights: {...defense, ...offense, int: 3.5, str: 1.2, dex: 0.8, ward: 2, hpLostAsWard: 150}},
    {name: 'Monk, unarmed', classKey: 'monk', weapons: [], weights: {...defense, ...offense, str: 3.5, dex: 1, int: 0.8}},
    {name: 'Ninja, dual daggers', classKey: 'ninja', weapons: ['dagger', 'sword', 'axe'], offHand: ['dagger', 'sword', 'axe', 'shield'], weights: {...defense, ...offense, dex: 3.5, str: 1, int: 0.8, accuracy: 0.6}},
    {name: 'Wizard, elemental wand', classKey: 'wizard', weapons: ['wand', 'staff'], weights: {...defense, ...offense, int: 3.5, str: 1, dex: 0.8,
        fireDamage: 6.8, coldDamage: 6.8, lightningDamage: 6.8, increasedElementalDamage: 100, physicalToFire: 45, physicalToCold: 45, physicalToLightning: 45}},
    {name: 'Gladiator, shield', classKey: 'gladiator', weapons: ['sword', 'axe'], offHand: ['shield'], weights: {...defense, ...offense, str: 2.5, dex: 2.5, int: 0.6, blockChance: 240, lifeOnHit: 4}},
    {name: 'Saboteur, ailments', classKey: 'saboteur', weapons: ['dagger', 'wand'], weights: {...defense, ...offense, dex: 2.5, int: 2.5, str: 1, igniteChance: 60, chillChance: 60, shockChance: 60, ailmentEffect: 40, physicalToFire: 35, physicalToCold: 35, physicalToLightning: 35}},
    {name: 'Bloodmage, regen', classKey: 'bloodmage', weapons: ['staff', 'greatsword'], weights: {...defense, ...offense, int: 2.5, str: 2.5, dex: 0.8, lifeRegen: 2.5, lifeRegenPercent: 700, lifeLeech: 300, increasedMaxHealth: 60}},
    {name: 'Berserker, dual axes', classKey: 'berserker', weapons: ['axe', 'greatsword'], offHand: ['axe'], weights: {...defense, ...offense, str: 3.5, dex: 1, int: 0.8, maxHealth: 1.2, ward: 1.2, lifeRegen: 8, lifeLeech: 250, armor: 0.5, evasion: 0.5}},
    {name: 'Marksman, bow', classKey: 'marksman', weapons: ['bow'], weights: {...defense, ...offense, dex: 3.5, str: 1.5, int: 0.6, accuracy: 1, critMultiplier: 30}},
    {name: 'Warlock, ailments', classKey: 'warlock', weapons: ['wand', 'staff'], weights: {...defense, ...offense, int: 3.5, str: 1, dex: 0.8, igniteChance: 60, chillChance: 60, shockChance: 60, ailmentEffect: 40, physicalToFire: 35, physicalToCold: 35, physicalToLightning: 35}},
];

// Resistances weighted by how much of the zone's damage is that element, or evenly when not tuned.
// Flat elemental damage is worth less against monsters that resist it.
export function zoneWeights(base: Weights, questKey: string | null): Weights {
    const w = {...base};
    const profile = questKey ? zoneProfile(questKey) : null;
    for (const e of elements) {
        w[resistStat[e]] = profile ? 160 * profile.incoming[e] : 35;
        const damageKey = `${e}Damage` as StatKey;
        if (profile && w[damageKey]) w[damageKey] = w[damageKey]! * (1 - profile.resist[e]);
    }
    return w;
}

const RES_CAP = 0.75, BLOCK_CAP = 0.5;
// Score of an item's stats on top of what the kit already has, so capped stats stop counting.
function score(stats: StatValues, totals: StatValues, weights: Weights, itemType: ItemTypeKey): number {
    let s = 0;
    const speed = itemTypes[itemType].attacksPerSecond;
    for (const [stat, value] of Object.entries(stats) as [StatKey, number][]) {
        let v = value;
        const cap = stat.endsWith('Resist') ? RES_CAP : stat === 'blockChance' ? BLOCK_CAP : Infinity;
        if (cap < Infinity) v = Math.max(0, Math.min(cap, (totals[stat] ?? 0) + value) - Math.min(cap, totals[stat] ?? 0));
        let w = weights[stat] ?? 0;
        // A weapon's flat damage is worth more on a faster weapon.
        if (speed && stat.endsWith('Damage') && !stat.startsWith('increased')) w *= speed / 1.2;
        s += w * v;
    }
    return s;
}

export function bestCraft(itemType: ItemTypeKey, pool: string[], baseSlots: number, decoSlots: number, totals: StatValues, weights: Weights): {base: string[], deco: string[], score: number, stats: StatValues} | undefined {
    const bases = pool.filter(k => getBaseStats(requireMaterial(k), itemType));
    const decos = pool.filter(k => getDecorationStats(requireMaterial(k), itemType));
    const evaluate = (base: string[]) => {
        // Decorations one at a time, each the best addition.
        const deco: string[] = [];
        let preview = previewCraft(itemType, base, deco, decoSlots);
        if (!preview) return undefined;
        let current = score(preview.stats.stats, totals, weights, itemType);
        while (deco.length < preview.maxDecorations) {
            let pick: {key: string, s: number} | undefined;
            for (const key of decos) {
                const p = previewCraft(itemType, base, [...deco, key], decoSlots);
                if (!p) continue;
                const s = score(p.stats.stats, totals, weights, itemType);
                if (s > current + 1e-9 && (!pick || s > pick.s)) pick = {key, s};
            }
            if (!pick) break;
            deco.push(pick.key);
            current = pick.s;
            preview = previewCraft(itemType, base, deco, decoSlots)!;
        }
        return {base, deco, score: current, stats: preview.stats.stats};
    };
    // Beam search over base materials.
    let beam: {base: string[], deco: string[], score: number, stats: StatValues}[] = [];
    let frontier: string[][] = [[]];
    for (let n = 0; n < baseSlots; n++) {
        const next: typeof beam = [];
        const seen = new Set<string>();
        for (const partial of frontier) {
            for (const key of bases) {
                const base = [...partial, key].sort();
                const id = base.join(',');
                if (seen.has(id)) continue;
                seen.add(id);
                const r = evaluate(base);
                if (r) next.push(r);
            }
        }
        next.sort((a, b) => b.score - a.score);
        beam = [...beam, ...next].sort((a, b) => b.score - a.score).slice(0, 6);
        frontier = next.slice(0, 6).map(r => r.base);
    }
    return beam[0];
}

export const armorSlots: [SlotKey, ItemTypeKey][] = [['body', 'bodyArmor'], ['head', 'helmet'], ['gloves', 'gloves'], ['boots', 'boots']];
export const accessorySlots: [SlotKey, ItemTypeKey][] = [['amulet', 'amulet'], ['ring1', 'ring'], ['ring2', 'ring'], ['belt', 'belt']];

// A full kit: weapon (with a shield when one-handed scores better), then armor, then accessories,
// each scored on top of the items already chosen.
export function buildKit(archetype: Archetype, stage: Stage, tuned: boolean): Gear {
    const pool = stageMaterials(stage);
    const weights = zoneWeights(archetype.weights, tuned ? stage.quest : null);
    const s = stage.slots;
    const gear: Gear = [];
    const totals: StatValues = {};
    const add = (stats: StatValues) => { for (const [k, v] of Object.entries(stats) as [StatKey, number][]) totals[k] = (totals[k] ?? 0) + v; };
    let bestWeapon: {type: ItemTypeKey, craft: NonNullable<ReturnType<typeof bestCraft>>, off?: {type: ItemTypeKey, craft: NonNullable<ReturnType<typeof bestCraft>>}, total: number} | undefined;
    for (const type of archetype.weapons) {
        const craft = bestCraft(type, pool, s.base, s.deco, totals, weights);
        if (!craft) continue;
        let total = craft.score;
        let off;
        if (!itemTypes[type].twoHanded) {
            for (const offType of archetype.offHand ?? ['shield']) {
                const c = bestCraft(offType, pool, s.base, s.deco, {...totals, ...craft.stats}, weights);
                if (c && (!off || c.score > off.craft.score)) off = {type: offType, craft: c};
            }
            total += off?.craft.score ?? 0;
        }
        if (!bestWeapon || total > bestWeapon.total) bestWeapon = {type, craft, off, total};
    }
    if (bestWeapon) {
        gear.push(['mainHand', bestWeapon.type, bestWeapon.craft.base, bestWeapon.craft.deco]);
        add(bestWeapon.craft.stats);
        if (bestWeapon.off) {
            gear.push(['offHand', bestWeapon.off.type, bestWeapon.off.craft.base, bestWeapon.off.craft.deco]);
            add(bestWeapon.off.craft.stats);
        }
    } else if (!archetype.weapons.length) {
        // Unarmed: both hands stay empty, since Martial arts needs them empty.
    }
    for (const [slot, type] of armorSlots) {
        const craft = bestCraft(type, pool, s.base, s.deco, totals, weights);
        if (craft) { gear.push([slot, type, craft.base, craft.deco]); add(craft.stats); }
    }
    for (const [slot, type] of accessorySlots) {
        const craft = bestCraft(type, pool, s.accBase, s.accDeco, totals, weights);
        if (craft) { gear.push([slot, type, craft.base, craft.deco]); add(craft.stats); }
    }
    return gear;
}
