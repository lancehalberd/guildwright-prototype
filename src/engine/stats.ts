import {itemTypes, slotOrder} from '../data/items';
import {requireMaterial} from '../data/materials';
import {classPassive, classes, damageStats} from '../data/quests';
import {bonusMultiplier, passiveLevel} from '../data/passives';
import {equippedBonuses} from '../data/trophies';
import {getCraftedItemStats, getMaterialEquipStats} from './crafting';
import {addStats, elements, resistStat} from '../data/stats';
import type {Adventurer, DamageMap, DamageType, Element, GameState, ItemRef, ItemStats, ItemTypeKey, StatKey, StatValues} from './types';

export interface ResolvedItem {
    name: string
    itemType: ItemTypeKey
    stats: ItemStats
}

export function resolveItemRef(state: GameState, ref: ItemRef): ResolvedItem | undefined {
    if (ref.kind === 'crafted') {
        const item = state.craftedItems.find(i => i.id === ref.id);
        if (!item) {
            return undefined;
        }
        return {name: item.name, itemType: item.itemType, stats: getCraftedItemStats(item)};
    }
    const material = requireMaterial(ref.key);
    const stats = getMaterialEquipStats(material);
    if (!stats || !material.equip) {
        return undefined;
    }
    return {name: material.equip.name, itemType: material.equip.itemType, stats};
}

export interface Strike {
    weaponName: string
    damage: Record<DamageType, number>
    attacksPerSecond: number
}

export interface AdventurerStats {
    str: number
    dex: number
    int: number
    maxHealth: number
    // Damage per hit by type, before the target's armor and resistances.
    damage: Record<DamageType, number>
    damagePerHit: number
    attacksPerSecond: number
    accuracy: number
    armor: number
    evasion: number
    blockChance: number
    resist: Record<Element, number>
    critChance: number
    // Damage each crit level adds, as a fraction: 0.5 = +50%, so 1.5x, then 2x, then 2.5x.
    critBonus: number
    // Each hit rolls between these multipliers of its damage. Str widens both.
    rollMin: number
    rollMax: number
    maxWard: number
    // Share of HP lost that comes back as ward.
    hpLostAsWard: number
    lifeRegen: number
    lifeLeech: number
    lifeOnHit: number
    weaponName: string
    // Dual wielding: the main-hand and off-hand swings, which alternate. Each sets its own cooldown.
    strikes?: Strike[]
    // How the hero fights: dual wielding, unarmed or one weapon, for display.
    wieldNote: string
    // Summed stats from all equipped items, for display.
    gear: StatValues
}

export const RESIST_CAP = 0.75;
export const BLOCK_CAP = 0.75;
// Block chance from a staff, dual wielding or Martial arts.
export const PARRY_BLOCK = 0.15;
export const BASE_ACCURACY = 20;

export function getAdventurerStats(state: GameState, adventurer: Adventurer): AdventurerStats {
    const gear: StatValues = {};
    // Weapons in hand, main hand first. Two one-handed weapons is dual wielding.
    const weapons: ResolvedItem[] = [];
    for (const slot of slotOrder) {
        const ref = adventurer.equipment[slot];
        if (!ref) {
            continue;
        }
        const item = resolveItemRef(state, ref);
        if (!item) {
            continue;
        }
        if ((slot === 'mainHand' || slot === 'offHand') && itemTypes[item.itemType].tags.includes('weapon')) {
            weapons.push(item);
        }
        addStats(gear, item.stats.stats);
    }
    // Equipped trophies add to everyone's gear stats.
    for (const bonus of equippedBonuses(state)) {
        addStats(gear, bonus.stats);
    }
    const g = (key: StatKey) => gear[key] ?? 0;
    const cls = classes[adventurer.classKey];
    const level = adventurer.level;
    const pl = (key: Parameters<typeof passiveLevel>[1]) => passiveLevel(adventurer, key, classPassive);
    // Each class grows its own number of points per attribute per level. Rare bonuses multiply totals.
    const b = (key: Parameters<typeof bonusMultiplier>[1]) => bonusMultiplier(adventurer, key);
    const str = Math.floor((cls.growth.str * level + g('str')) * b('str'));
    const dex = Math.floor((cls.growth.dex * level + g('dex')) * b('dex'));
    const int = Math.floor((cls.growth.int * level + g('int')) * b('int'));
    const attr = {str, dex, int};
    // The class's fastest-growing attributes, averaged, are its core value.
    const tops = damageStats(cls);
    const coreValue = tops.reduce((sum, k) => sum + attr[k], 0) / tops.length;
    const unarmed = weapons.length === 0;
    const dual = weapons.length === 2;
    // Martial arts: with both hands empty (no weapon or shield), attacks add the full core value, at
    // 1.5 attacks a second, with extra crit.
    const emptyHands = unarmed && !adventurer.equipment.offHand;
    const martial = emptyHands ? pl('martialArts') : 0;
    // Fighters with no shield to block with parry instead: a staff, two weapons or Martial arts
    // give a flat block chance (once, not stacked).
    const parry = dual || martial || weapons.some(w => w.itemType === 'staff') ? PARRY_BLOCK : 0;

    const maxHealth = Math.floor((20 + 4 * level + 2 * str + g('maxHealth')) * (1 + g('increasedMaxHealth')) * b('maxHealth'));
    const physicalMore = 1 + g('increasedDamage') + g('increasedPhysicalDamage');
    const elementalMore = (1 + g('increasedDamage') + g('increasedElementalDamage')) * (1 + pl('elementalMastery'));
    // Conversion moves physical damage to elements before scaling. Over 100% in total is scaled down.
    const toFire = g('physicalToFire'), toCold = g('physicalToCold'), toLightning = g('physicalToLightning');
    const converted = toFire + toCold + toLightning;
    const share = converted > 1 ? 1 / converted : 1;
    const kept = 1 - Math.min(1, converted);
    const dmg = b('damage');
    type Flat = Record<DamageType, number>;
    const strike = (flat: Flat): Flat => ({
        physical: flat.physical * kept * physicalMore * dmg,
        fire: (flat.fire + flat.physical * toFire * share) * elementalMore * dmg,
        cold: (flat.cold + flat.physical * toCold * share) * elementalMore * dmg,
        lightning: (flat.lightning + flat.physical * toLightning * share) * elementalMore * dmg,
    });
    const flatKeys: Record<DamageType, StatKey> = {physical: 'physicalDamage', fire: 'fireDamage', cold: 'coldDamage', lightning: 'lightningDamage'};
    // Defenses turned into damage: a share of max HP as fire, of evasion as cold, of max ward as
    // lightning, added to every hit like flat damage from gear.
    const evasion = Math.floor((g('evasion') + dex) * (1 + g('increasedEvasion')) * b('evasion'));
    const maxWard = Math.floor((int + g('ward')) * b('ward') * (pl('siphonWard') > 1 ? 1.75 : pl('siphonWard') ? 1.5 : 1));
    const fromDefense: Record<DamageType, number> = {physical: 0, fire: g('healthAsFire') * maxHealth, cold: g('evasionAsCold') * evasion, lightning: g('wardAsLightning') * maxWard};
    const gf = (t: DamageType) => g(flatKeys[t]) + fromDefense[t];
    // Unarmed hits for 1. Half the core stat is added as flat physical damage (all of it with Martial arts).
    const coreFlat = (unarmed ? 1 : 0) + coreValue * (martial ? 1 : 0.5);
    let damage: Flat;
    const speedMore = (1 + g('attackSpeed')) * b('attackSpeed');
    let strikes: Strike[] | undefined;
    if (dual) {
        // Swings alternate main hand and off hand. Each hits with its own weapon's flat damage plus
        // everything else's, and the cooldown after it runs at 75% of twice that weapon's speed
        // (1.5x the swings in all). Dual mastery removes the speed penalty and adds damage.
        const others = Object.fromEntries((Object.keys(flatKeys) as DamageType[]).map(t =>
            [t, gf(t) - weapons.reduce((sum, w) => sum + (w.stats.stats[flatKeys[t]] ?? 0), 0)])) as Flat;
        const mastery = pl('dualMastery');
        const mult = [1, 1.25, 1.5][mastery];
        const pace = mastery ? 2 : 1.5;
        strikes = weapons.map(w => {
            const hit = strike(Object.fromEntries((Object.keys(flatKeys) as DamageType[]).map(t =>
                [t, others[t] + (w.stats.stats[flatKeys[t]] ?? 0) + (t === 'physical' ? coreFlat : 0)])) as Flat);
            return {
                weaponName: w.name,
                damage: Object.fromEntries((Object.keys(flatKeys) as DamageType[]).map(t => [t, mult * hit[t]])) as Flat,
                attacksPerSecond: pace * (w.stats.attacksPerSecond ?? 1) * speedMore,
            };
        });
        // The average swing, for display and anything that reads one damage figure.
        damage = Object.fromEntries((Object.keys(flatKeys) as DamageType[]).map(t => [t, (strikes![0].damage[t] + strikes![1].damage[t]) / 2])) as Flat;
    } else {
        damage = strike({physical: gf('physical') + coreFlat, fire: gf('fire'), cold: gf('cold'), lightning: gf('lightning')});
    }
    // Swings per second. Dual wielding: two swings per pair of cooldowns.
    const attacksPerSecond = strikes ? 2 / strikes.reduce((sum, st) => sum + 1 / st.attacksPerSecond, 0)
        : (martial ? 1.5 : unarmed ? 1 : weapons[0].stats.attacksPerSecond ?? 1) * speedMore;
    const resist = Object.fromEntries(elements.map(e => [e, Math.min(RESIST_CAP, g(resistStat[e]))])) as Record<Element, number>;
    return {
        str, dex, int, maxHealth, damage,
        damagePerHit: damage.physical + damage.fire + damage.cold + damage.lightning,
        attacksPerSecond,
        strikes,
        accuracy: Math.floor((BASE_ACCURACY + 2 * level + 2 * dex + g('accuracy')) * b('accuracy')),
        armor: Math.floor(g('armor') * (1 + g('increasedArmor')) * b('armor')),
        evasion,
        blockChance: Math.min(BLOCK_CAP, g('blockChance') + parry),
        resist,
        critChance: (int / 100 + g('critChance') + 0.15 * martial) * b('critChance'),
        critBonus: 0.5 + g('critMultiplier') + 0.5 * martial,
        rollMin: 0.85 * (1 + str / 100),
        rollMax: 1.15 * (1 + 2 * str / 100),
        // Siphon ward (the Priest's passive) also raises max ward: 1.5x, or 1.75x enhanced.
        maxWard,
        hpLostAsWard: g('hpLostAsWard'),
        // Percent regen counts toward life regen, so rests and Blood pact use it too.
        lifeRegen: (g('lifeRegen') + g('lifeRegenPercent') * maxHealth) * b('lifeRegen'),
        // Blood pact carries 5% life leech of its own.
        lifeLeech: (g('lifeLeech') + (pl('bloodPact') ? 0.05 : 0)) * b('lifeLeech'),
        lifeOnHit: g('lifeOnHit'),
        weaponName: weapons.map(w => w.name).join(' & ') || 'Unarmed',
        wieldNote: dual ? `dual wielding, alternating swings${pl('dualMastery') ? `, ${[100, 125, 150][pl('dualMastery')]}% damage` : ''}, +15% block` : martial ? 'unarmed, Martial arts, +15% block' : unarmed && pl('martialArts') ? 'unarmed, but the off hand item turns off Martial arts' : unarmed ? 'unarmed' : parry ? 'staff, +15% block' : '',
        gear,
    };
}

export function isTwoHandedEquipped(state: GameState, adventurer: Adventurer): boolean {
    const ref = adventurer.equipment.mainHand;
    if (!ref) {
        return false;
    }
    const item = resolveItemRef(state, ref);
    return !!item && !!itemTypes[item.itemType].twoHanded;
}

// minmaxer's curve: 10 times the sum of the first n squares.
export function totalXpForLevel(level: number): number {
    return 10 * (level - 1) * level * (2 * (level - 1) + 1) / 6;
}
export const levelCap = 100;

// Stats are cached per adventurer, and cleared whenever equipment or level changes.
const statsCache = new Map<string, AdventurerStats>();
export function invalidateStats() {
    statsCache.clear();
}
export function getCachedStats(state: GameState, adventurer: Adventurer): AdventurerStats {
    let stats = statsCache.get(adventurer.id);
    if (!stats) {
        stats = getAdventurerStats(state, adventurer);
        statsCache.set(adventurer.id, stats);
    }
    return stats;
}


// Armor halves a hit for every half of the hit's damage it has: with a 100 damage hit,
// 50 armor takes it to 50, 100 armor to 25, 150 armor to 12.5. Only physical damage is reduced.
export function armorReduce(damage: number, armor: number): number {
    if (damage <= 0) {
        return 0;
    }
    return damage * Math.pow(0.5, (2 * Math.max(0, armor)) / damage);
}

// A single physical hit after armor, with the 1 damage minimum. Used for display.
// Expected damage of one hit after armor (with small hits rounded up to 1 by chance, the average is
// unchanged).
export function mitigateHit(damage: number, armor: number): number {
    return damage <= 0 ? 0 : armorReduce(damage, armor);
}

// Damage a hit deals after armor (physical) and resistances (elemental). A hit under 1 deals 1 with
// that chance and 0 otherwise (0.3 is a 30% chance of 1), so tiny hits keep their average.
export function mitigateDamage(damage: DamageMap, armor: number, resist: Partial<Record<Element, number>>, rng: () => number): number {
    const m = mitigateByType(damage, armor, resist);
    const total = (m.physical ?? 0) + elements.reduce((sum, e) => sum + (m[e] ?? 0), 0);
    return total >= 1 ? total : rng() < total ? 1 : 0;
}
// Each damage type after armor (physical) or resistance (elements).
export function mitigateByType(damage: DamageMap, armor: number, resist: Partial<Record<Element, number>>): DamageMap {
    const out: DamageMap = {};
    if (damage.physical) out.physical = armorReduce(damage.physical, armor);
    for (const e of elements) {
        if (damage[e]) out[e] = damage[e]! * (1 - (resist[e] ?? 0));
    }
    return out;
}

// Accuracy against evasion gives a hit rating, which works like crit chance: hit n of an attack
// lands with chance rating / n, and the chain stops at the first miss. The rating is
// sqrt(accuracy / evasion) - 0.2: 0.8 at equal accuracy and evasion, 1 (the first hit never misses)
// at 1.44 times the evasion, and 0 at 4% of it. It has no cap.
export const HIT_RATING_EXPONENT = 0.5;
export const HIT_RATING_OFFSET = 0.2;
export function hitRating(accuracy: number, evasion: number): number {
    if (evasion <= 0) {
        return 50;
    }
    return Math.max(0, Math.pow(Math.max(0, accuracy) / evasion, HIT_RATING_EXPONENT) - HIT_RATING_OFFSET);
}

// Exposed: every attack a target dodges entirely in a row lowers its evasion against all later
// attacks, from anyone, by this factor per stack, until a hit lands. Nobody dodges forever.
export const EXPOSED_STEP = 0.85;
export function exposedEvasion(evasion: number, stacks = 0): number {
    return evasion * Math.pow(EXPOSED_STEP, stacks);
}

// Chance the first hit of an attack lands.
export function hitChance(accuracy: number, evasion: number): number {
    return Math.min(1, hitRating(accuracy, evasion));
}

// Returns the number of hits one attack lands. Nobody stays locked out by evasion: callers pass
// evasion through exposedEvasion, which shrinks it after each whole attack that misses.
export function rollHits(accuracy: number, evasion: number, rng: () => number, maxHits = 50): number {
    const rating = hitRating(accuracy, evasion);
    let hits = 0;
    while (hits < maxHits && rng() < rating / (hits + 1)) {
        hits++;
    }
    return hits;
}

// Multicrits: crit level n succeeds with crit chance / n. Returns the number of crit levels.
// Crit chance has no cap by design (Chris): past 100% it keeps adding crit levels, so it is never wasted.
export function rollCritLevels(critChance: number, rng: () => number, maxLevels = 50): number {
    let levels = 0;
    while (levels < maxLevels && rng() < critChance / (levels + 1)) {
        levels++;
    }
    return levels;
}

// Expected hits per attack and expected crit damage multiplier, for display.
export function expectedHits(accuracy: number, evasion: number): number {
    const rating = hitRating(accuracy, evasion);
    let p = 1, total = 0;
    for (let n = 1; n <= 50; n++) {
        p *= Math.min(1, rating / n);
        if (p < 1e-6) break;
        total += p;
    }
    return total;
}
export function expectedCritMultiplier(critChance: number, critBonus: number): number {
    let p = 1, levels = 0;
    for (let n = 1; n <= 50; n++) {
        p *= Math.min(1, critChance / n);
        if (p < 1e-6) break;
        levels += p;
    }
    return 1 + critBonus * levels;
}
