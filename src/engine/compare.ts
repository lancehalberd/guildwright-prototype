import {itemTypes} from '../data/items';
import {ACCURACY_GROWTH, EVASION_GROWTH, monsterBaseline, powerForLevel} from '../data/quests';
import {elements, statOrder} from '../data/stats';
import {expectedCritMultiplier, expectedHits, getAdventurerStats, hitChance, mitigateByType, resolveItemRef, type AdventurerStats} from './stats';
import type {Adventurer, CraftedItem, DamageMap, DamageType, GameState, ItemRef, SlotKey, StatKey} from './types';

// Gear comparison: what equipping something would change for a hero. Two computed figures sum it
// up, both against a reference monster at the hero's level: DPS, and toughness (how much of that
// monster's damage the hero can take). Neither predicts a quest; they only compare gear.

// A plain monster whose encounter level matches the hero's. Its hits are mostly physical with a
// little of each element, so resistances count for something.
export function referenceMonster(level: number) {
    const power = powerForLevel(level);
    return {
        damage: monsterBaseline.damage * power,
        damageTypes: {physical: 0.7, fire: 0.1, cold: 0.1, lightning: 0.1} as DamageMap,
        attacksPerSecond: 1,
        armor: monsterBaseline.armor * power,
        accuracy: monsterBaseline.accuracy * Math.pow(power, ACCURACY_GROWTH),
        evasion: monsterBaseline.evasion * Math.pow(power, EVASION_GROWTH),
    };
}

export interface GearPower {
    dps: number
    toughness: number
}

function sumDamage(map: DamageMap): number {
    return (map.physical ?? 0) + elements.reduce((s, e) => s + (map[e] ?? 0), 0);
}

export function gearPower(stats: AdventurerStats, level: number): GearPower {
    const m = referenceMonster(level);
    const avgRoll = (stats.rollMin + stats.rollMax) / 2;
    const perHit = (damage: Record<DamageType, number>) => Math.max(1, sumDamage(mitigateByType(damage, m.armor, {})));
    const hits = expectedHits(stats.accuracy, m.evasion);
    const crit = expectedCritMultiplier(stats.critChance, stats.critBonus);
    // Alternating swings: damage of a pair over the time a pair takes.
    const strikeDps = stats.strikes
        ? stats.strikes.reduce((s, st) => s + perHit(st.damage), 0) / stats.strikes.reduce((s, st) => s + 1 / st.attacksPerSecond, 0)
        : perHit(stats.damage) * stats.attacksPerSecond;
    const dps = strikeDps * hits * crit * avgRoll;
    // Damage one monster attack does on average, after evasion, block, armor and resistances.
    const hit: DamageMap = {};
    for (const [type, share] of Object.entries(m.damageTypes) as [DamageType, number][]) hit[type] = m.damage * share;
    const landed = expectedHits(m.accuracy, stats.evasion) * (1 - stats.blockChance);
    const taken = Math.max(0.01, sumDamage(mitigateByType(hit, stats.armor, stats.resist)) * landed);
    // Ward won back on dodges and blocks counts like regeneration (while the hero has ward to fill).
    const g = stats.gear;
    const dodgeWard = (g.wardOnDodge ?? 0) + (g.wardOnDodgePercent ?? 0) * stats.maxWard;
    const blockWard = (g.wardOnBlock ?? 0) + (g.wardOnBlockPercent ?? 0) * stats.maxWard;
    const wardBack = m.attacksPerSecond * ((1 - hitChance(m.accuracy, stats.evasion)) * dodgeWard + expectedHits(m.accuracy, stats.evasion) * stats.blockChance * blockWard);
    // Seconds the hero lasts against the monster, counting regeneration and ward won back.
    const pool = stats.maxHealth + stats.maxWard;
    // Leech and life on hit heal from the hero's own hits: every hit of a multi-hit attack counts.
    const hitsPerSecond = hits * (stats.strikes
        ? stats.strikes.length / stats.strikes.reduce((s, st) => s + 1 / st.attacksPerSecond, 0)
        : stats.attacksPerSecond);
    const recovery = stats.lifeRegen + (stats.maxWard > 0 ? wardBack : 0) + stats.lifeLeech * dps + stats.lifeOnHit * hitsPerSecond;
    const toughness = survivalSeconds(pool, taken * m.attacksPerSecond, recovery);
    return {dps, toughness};
}

// The reference monster enrages: its damage grows by this share every ENRAGE_STEP seconds,
// compounding, so recovery slows the hero's fall without ever making them unkillable. Early on it
// barely matters: without recovery, a 20 second toughness becomes about 18.
export const ENRAGE_GROWTH = 0.1;
export const ENRAGE_STEP = 10;
const ENRAGE_RATE = Math.log(1 + ENRAGE_GROWTH) / ENRAGE_STEP;

// Seconds until damage taken minus recovery uses up the pool: the T where
// incoming × (e^(kT) − 1) / k − recovery × T = pool. One root, found by bisection.
export function survivalSeconds(pool: number, incoming: number, recovery: number): number {
    const k = ENRAGE_RATE;
    const lost = (t: number) => incoming * Math.expm1(k * t) / k - recovery * t;
    let hi = 1;
    while (lost(hi) < pool && hi < 1e6) hi *= 2;
    let lo = 0;
    for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2;
        if (lost(mid) < pool) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
}

const PREVIEW_ID = '__preview';

// The same hero with this change of gear, following equip()'s rules: a two-hander frees the off
// hand, and an item worn in another slot leaves it.
function withGear(adventurer: Adventurer, slot: SlotKey, ref: ItemRef | null, twoHanded: boolean): Adventurer {
    const equipment = {...adventurer.equipment};
    if (ref?.kind === 'crafted') {
        for (const k of Object.keys(equipment) as SlotKey[]) {
            const r = equipment[k];
            if (r?.kind === 'crafted' && r.id === ref.id) delete equipment[k];
        }
    }
    if (ref) equipment[slot] = ref; else delete equipment[slot];
    if (slot === 'mainHand' && twoHanded) delete equipment.offHand;
    return {...adventurer, equipment};
}

// Core figures and the stats they come from, for showing changes.
const shownStats: (keyof AdventurerStats)[] = ['str', 'dex', 'int', 'maxHealth', 'damagePerHit', 'attacksPerSecond', 'accuracy', 'armor', 'evasion', 'blockChance', 'critChance', 'critBonus', 'maxWard', 'lifeRegen', 'lifeLeech', 'lifeOnHit'];

export interface StatChange {
    key: string
    before: number
    after: number
}

export interface Comparison {
    slot: SlotKey
    replacing?: string
    dps: {before: number, after: number}
    toughness: {before: number, after: number}
    // Hero stats that change (attributes, health, damage, defenses...).
    changes: StatChange[]
    // Gear stat totals that change, for the exact item-level deltas.
    gear: {stat: StatKey, before: number, after: number}[]
}

// Compares the hero's current gear with this ref (or a crafted item that isn't made yet) in this slot.
export function compareGear(state: GameState, adventurer: Adventurer, slot: SlotKey, ref: ItemRef | CraftedItem | null): Comparison {
    let previewState = state;
    let itemRef: ItemRef | null;
    if (ref && 'itemType' in ref) {
        previewState = {...state, craftedItems: [...state.craftedItems, {...ref, id: PREVIEW_ID}]};
        itemRef = {kind: 'crafted', id: PREVIEW_ID};
    } else {
        itemRef = ref;
    }
    const resolved = itemRef ? resolveItemRef(previewState, itemRef) : undefined;
    const twoHanded = !!resolved && !!itemTypes[resolved.itemType].twoHanded;
    const before = getAdventurerStats(state, adventurer);
    const after = getAdventurerStats(previewState, withGear(adventurer, slot, itemRef, twoHanded));
    const pb = gearPower(before, adventurer.level), pa = gearPower(after, adventurer.level);
    const current = adventurer.equipment[slot];
    const changes: StatChange[] = [];
    for (const key of shownStats) {
        const b = before[key] as number, a = after[key] as number;
        if (Math.abs(a - b) > 1e-9) changes.push({key, before: b, after: a});
    }
    for (const e of elements) {
        if (Math.abs(after.resist[e] - before.resist[e]) > 1e-9) changes.push({key: e + 'Resist', before: before.resist[e], after: after.resist[e]});
    }
    const gear: Comparison['gear'] = [];
    for (const stat of statOrder) {
        const b = before.gear[stat] ?? 0, a = after.gear[stat] ?? 0;
        if (Math.abs(a - b) > 1e-9) gear.push({stat, before: b, after: a});
    }
    return {
        slot,
        replacing: current ? resolveItemRef(state, current)?.name : undefined,
        dps: {before: pb.dps, after: pa.dps},
        toughness: {before: pb.toughness, after: pa.toughness},
        changes,
        gear,
    };
}

// The slots worth comparing an item against when no slot was chosen: every slot it fits, but when
// one of them is empty, only that one (equipping fills it first). Weapons always show the main hand.
export function comparisonSlots(state: GameState, adventurer: Adventurer, slots: SlotKey[]): SlotKey[] {
    const usable = slots.filter(s => !(s === 'offHand' && isTwoHanded(state, adventurer)));
    const open = usable.filter(s => !adventurer.equipment[s]);
    const shown = open.length ? [open[0]] : usable;
    // A weapon in an empty off hand means dual wielding, so also show it replacing the main hand.
    if (usable.includes('mainHand') && !shown.includes('mainHand')) shown.unshift('mainHand');
    return shown;
}
function isTwoHanded(state: GameState, adventurer: Adventurer): boolean {
    const r = adventurer.equipment.mainHand;
    const item = r ? resolveItemRef(state, r) : undefined;
    return !!item && !!itemTypes[item.itemType].twoHanded;
}
