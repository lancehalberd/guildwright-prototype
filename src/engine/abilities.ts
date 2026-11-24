import {BASICS, type BasicRef} from '../data/basics';
import {monsters} from '../data/quests';
import type {AbilityDef, AbilityEffect, DamageMap, DamageType, MonsterDef} from './types';

// A monster's kit: its abilities in priority order, then its basic attacks. `shares` is the
// damage of one use by type, as a multiple of the monster's base hit. An ability used once every
// `every` turns gets its types' share of the hit times `every`, and the basics get the remaining
// types scaled by the turns left over, so each type deals what it did over a fight. Basics take
// turns in order and each deals the full basic share (times its own damage tweak).
export interface KitEntry {
    name: string
    shares: DamageMap
    every: number
    spell: boolean
    basic: boolean
    applies?: AbilityDef['applies']
    effect?: AbilityEffect
    // Draw the effect smaller (elemental basics reuse the big spell art).
    effectScale?: number
    accuracy?: number
    damage?: number
    hits?: number
    drain?: number
    heal?: number
    rally?: AbilityDef['rally']
    buff?: AbilityDef['buff']
    mimic?: boolean
}

// Splitting a mixed hit into single-type hits makes each typed hit bigger, and armor stops less of a
// bigger physical hit. This brings split monsters back near their old danger (scripts/simFeatures).
export const KIT_DAMAGE = 0.8;

const cache = new Map<string, KitEntry[] | null>();

// Mixed-damage monsters without hand-made abilities get one spell per element, keeping physical
// (or, with no physical, their first element) for the basic attack. Cooldowns keep each spell near
// 1-1.4x a normal hit, and leave at least a fifth of the turns to the basic attack.
const DEFAULT_SPELLS: Record<string, {name: string, effect: AbilityEffect}> = {
    fire: {name: 'Fire Burst', effect: 'fire'},
    cold: {name: 'Frost Shard', effect: 'ice'},
    lightning: {name: 'Lightning Bolt', effect: 'lightning'},
};
export function defaultAbilities(types: DamageMap): AbilityDef[] {
    const entries = (Object.entries(types) as [DamageType, number][]).filter(([, v]) => v > 0);
    if (entries.length < 2) return [];
    const keep = entries.some(([t]) => t === 'physical') ? 'physical' : entries[0][0];
    const spells = entries.filter(([t]) => t !== keep).map(([t, v]) => ({t, v, every: Math.max(2, Math.round(1 / v))}));
    while (spells.reduce((sum, a) => sum + 1 / a.every, 0) > 0.8) for (const a of spells) a.every++;
    return spells.map(a => ({name: DEFAULT_SPELLS[a.t].name, types: [a.t], every: a.every, spell: true, effect: DEFAULT_SPELLS[a.t].effect}));
}

// The effect an elemental basic shows for the type it carries most.
const ELEMENT_FX: Record<DamageType, AbilityEffect> = {physical: 'smash', fire: 'fire', cold: 'ice', lightning: 'lightning'};

function basicEntries(def: MonsterDef, shares: DamageMap): KitEntry[] {
    const refs: BasicRef[] = def.basics?.length ? def.basics : ['smash'];
    const main = (Object.entries(shares) as [DamageType, number][]).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'physical';
    return refs.map(ref => {
        const [key, rename] = typeof ref === 'string' ? [ref, undefined] : ref;
        const b = BASICS[key];
        const element = b.effect === 'element';
        return {name: rename ?? b.name, shares, every: 1, spell: element, basic: true,
            effect: element ? ELEMENT_FX[main] : b.effect as AbilityEffect, effectScale: element ? 0.6 : undefined, accuracy: b.accuracy, damage: b.damage};
    });
}

// Every monster has a kit; null only for an unknown key.
export function monsterKit(key: string): KitEntry[] | null {
    if (cache.has(key)) return cache.get(key)!;
    const def = monsters[key];
    if (!def) return null;
    const types: DamageMap = def.damageTypes ?? {physical: 1};
    const abilities = def.abilities ?? defaultAbilities(types);
    // Only monsters whose mixed hit gets split by type need the armor correction.
    const split = abilities.some(a => a.types?.length) && Object.values(types).filter(v => (v ?? 0) > 0).length > 1;
    const scale = split ? KIT_DAMAGE : 1;
    const covered = new Set<DamageType>();
    const kit: KitEntry[] = abilities.map(a => {
        const shares: DamageMap = {};
        for (const t of a.types ?? []) {
            shares[t] = (types[t] ?? 0) * a.every * scale;
            covered.add(t);
        }
        return {name: a.name, shares, every: a.every, spell: !!a.spell, basic: false, applies: a.applies, effect: a.effect,
            accuracy: a.accuracy, damage: a.damage, hits: a.hits, drain: a.drain, heal: a.heal, rally: a.rally, buff: a.buff, mimic: a.mimic};
    });
    // An ability with `damage` but no `types` hits like a basic (times its damage), so it doesn't
    // take turns away from the basic share. The rest do, and the basics make up for those turns.
    const basicLike = (a: AbilityDef) => !a.types?.length && a.damage !== undefined;
    const left = Math.max(0.1, 1 - abilities.reduce((sum, a) => sum + (basicLike(a) ? 0 : 1 / a.every), 0));
    const basicShares: DamageMap = {};
    for (const [t, v] of Object.entries(types) as [DamageType, number][]) if (!covered.has(t)) basicShares[t] = v / left * scale;
    abilities.forEach((a, i) => { if (basicLike(a)) kit[i].shares = {...basicShares}; });
    kit.push(...basicEntries(def, basicShares));
    cache.set(key, kit);
    return kit;
}

// Picks this turn's kit entry and starts its cooldown. Abilities start staggered, one turn apart
// after an opening basic attack, so a fight doesn't open with every ability at once. With no
// ability ready, the basics take turns in order.
export function nextAbility(kit: KitEntry[], ready: number[] | undefined, basicTurn = 0): {index: number, ready: number[], basicTurn: number} {
    const r = ready && ready.length === kit.length ? ready : kit.map((_, i) => i + 2);
    const next = r.map(v => v - 1);
    let index = kit.findIndex((a, i) => !a.basic && next[i] <= 0);
    if (index >= 0) {
        next[index] = kit[index].every;
        return {index, ready: next, basicTurn};
    }
    const first = kit.findIndex(a => a.basic);
    const count = kit.length - first;
    index = first + (basicTurn % count);
    return {index, ready: next, basicTurn: (basicTurn + 1) % count};
}

// Total damage share of one use (for the monster info).
export function kitHit(entry: KitEntry): number {
    return Object.values(entry.shares).reduce((a, b) => a + (b ?? 0), 0);
}
