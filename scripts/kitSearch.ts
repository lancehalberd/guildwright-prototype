// Kit search for the balance sims: picks gear for a class, stage and quest (and modifiers) by how
// well the whole kit does against that quest's actual monsters, instead of by fixed stat weights.
//
// 1. Candidates: for each slot, the best crafts under several weight profiles (the archetype's own,
//    offense-heavy, defense-heavy, resist-heavy, sustain-heavy), from kitBuilder's craft search.
// 2. Fit: questFit() plays the quest out on paper. Per encounter: time to kill each monster in turn
//    at the hero's DPS against that monster's armor, resistances and evasion; damage taken from
//    every monster still alive, after evasion, block, armor and resistances; ward (refilled each
//    encounter), regen, leech, life on hit and life per encounter. HP carries between encounters.
// 3. Search: start from the greedy kit, then swap one slot at a time to the candidate that most
//    improves the fit, until no swap helps.
// It ignores ailments and class passives with conditions (Fury, Cleave, Riposte, Follow-through):
// they don't change which gear is best by much, and the real sim still decides clear rates.
import {itemTypes} from '../src/data/items';
import {AILMENT_CHANCE, BURN_SECONDS, BURN_SHARE} from '../src/engine/ailments';
import {quests} from '../src/data/quests';
import {elements} from '../src/data/stats';
import {encounterLineup, getMonsterStats, type MonsterStats} from '../src/engine/runner';
import {expectedCritMultiplier, getAdventurerStats, hitRating, invalidateStats, mitigateByType, type AdventurerStats} from '../src/engine/stats';
import type {DamageMap, DamageType, GameState, ItemTypeKey, SlotKey, StatKey} from '../src/engine/types';
import {accessorySlots, armorSlots, bestCraft, buildKit, stageMaterials, zoneWeights, type Archetype, type Stage, type Weights} from './kitBuilder';
import {setup, type Gear} from './simSetup';

// Hits landed per attack, counting the miss-streak rule: after n whole attacks miss in a row, the
// next first hit rolls with accuracy × (1 + n). Without it, high evasion looks near-perfect.
const hitsCache = new Map<string, number>();
export function hitsPerAttack(accuracy: number, evasion: number): number {
    const key = `${accuracy.toFixed(2)}|${evasion.toFixed(2)}`;
    const cached = hitsCache.get(key);
    if (cached !== undefined) return cached;
    const rating = hitRating(accuracy, evasion);
    // Hits in a chain once the first lands: hit n lands with rating / n.
    let p = 1, chain = 1;
    for (let n = 2; n <= 50; n++) { p *= Math.min(1, rating / n); chain += p; if (p < 1e-9) break; }
    // Attacks until the first hit lands.
    let miss = 1, attacks = 0;
    for (let streak = 0; streak < 500 && miss > 1e-9; streak++) {
        attacks += miss;
        miss *= 1 - Math.min(1, streak ? hitRating(accuracy * (1 + streak), evasion) : rating);
    }
    const out = chain / attacks;
    hitsCache.set(key, out);
    return out;
}
// Share of attacks that miss entirely, with the same rule.
function missShare(accuracy: number, evasion: number): number {
    const rating = hitRating(accuracy, evasion);
    let p = 1, chain = 1;
    for (let n = 2; n <= 50; n++) { p *= Math.min(1, rating / n); chain += p; if (p < 1e-9) break; }
    return 1 - hitsPerAttack(accuracy, evasion) / chain;
}

const sum = (m: DamageMap) => Object.values(m).reduce((a, b) => a + (b ?? 0), 0);

export interface Fit {
    // Encounters cleared on paper, plus the share of the next one (or of HP left, after a full clear).
    score: number
    cleared: number
}

export function questFit(stats: AdventurerStats, questKey: string, mods: string[] = []): Fit {
    const quest = quests[questKey];
    const crit = expectedCritMultiplier(stats.critChance, stats.critBonus);
    const avgRoll = (stats.rollMin + stats.rollMax) / 2;
    const perHit = (damage: Record<DamageType, number>, m: MonsterStats) => Math.max(1, sum(mitigateByType(damage, m.armor, m.resist)));
    const dpsAgainst = (m: MonsterStats) => {
        const raw = stats.strikes
            ? stats.strikes.reduce((s, st) => s + perHit(st.damage, m), 0) / stats.strikes.reduce((s, st) => s + 1 / st.attacksPerSecond, 0)
            : perHit(stats.damage, m) * stats.attacksPerSecond;
        return raw * hitsPerAttack(stats.accuracy, m.evasion) * crit * avgRoll;
    };
    const g = stats.gear;
    const takenPerSecond = (m: MonsterStats) => {
        const hit: DamageMap = {};
        for (const [type, share] of Object.entries(m.damageTypes) as [DamageType, number][]) hit[type] = m.damage * share;
        const landed = hitsPerAttack(m.accuracy, stats.evasion) * (1 - stats.blockChance);
        // Ward won back on dodges and blocks offsets damage while the hero has ward.
        const dodgeWard = (g.wardOnDodge ?? 0) + (g.wardOnDodgePercent ?? 0) * stats.maxWard;
        const blockWard = (g.wardOnBlock ?? 0) + (g.wardOnBlockPercent ?? 0) * stats.maxWard;
        const wardBack = stats.maxWard > 0 ? missShare(m.accuracy, stats.evasion) * dodgeWard + hitsPerAttack(m.accuracy, stats.evasion) * stats.blockChance * blockWard : 0;
        return Math.max(0, sum(mitigateByType(hit, stats.armor, stats.resist)) * landed - wardBack) * m.attacksPerSecond;
    };
    // Ailments, as averages: each landed hit carrying an element has a 25% (plus gear) chance to
    // burn (20% of the fire part per second for 2s), or to add chill or shock in proportion to the
    // element's share of the target's health, capped at 50% and decaying 10% per second.
    const bonus = (k: 'igniteChance' | 'chillChance' | 'shockChance') => AILMENT_CHANCE + (g[k] ?? 0);
    const effect = 1 + (g.ailmentEffect ?? 0);
    const buildUp = (perSecond: number, seconds: number) => Math.min(0.5, perSecond / 0.1) * Math.min(1, seconds / 10);
    const heroHit = (m: MonsterStats) => sum(mitigateByType(stats.damage, m.armor, m.resist));
    let hp = stats.maxHealth;
    for (let i = 0; i < quest.encounters.length; i++) {
        const lineup = encounterLineup(quest, i, mods).map(k => getMonsterStats(quest, i, k, mods));
        // Monsters die in order; each attacks until its death.
        let t = 0, incoming = 0, dealt = 0, hitsLanded = 0;
        const heroLanded = (m: MonsterStats) => stats.attacksPerSecond * hitsPerAttack(stats.accuracy, m.evasion);
        // The hero's own ailments on the monster being fought.
        const mitigated = (m: MonsterStats) => mitigateByType(stats.damage, m.armor, m.resist);
        // Shock from the monsters, built up over the encounter, raises all damage the hero takes;
        // their chill slows the hero's attacks.
        const lightningIn = lineup.reduce((a, m) => a + (m.damageTypes.lightning ?? 0) * m.damage * m.attacksPerSecond * hitsPerAttack(m.accuracy, stats.evasion) * (1 - stats.blockChance), 0);
        const coldIn = lineup.reduce((a, m) => a + (m.damageTypes.cold ?? 0) * m.damage * m.attacksPerSecond * hitsPerAttack(m.accuracy, stats.evasion) * (1 - stats.blockChance), 0);
        for (const m of lineup) {
            const hit = mitigated(m);
            const landed = heroLanded(m);
            const shockOn = buildUp(bonus('shockChance') * effect * (hit.lightning ?? 0) * landed / m.hp, m.hp / Math.max(1e-6, dpsAgainst(m)));
            const burn = bonus('igniteChance') * BURN_SHARE * BURN_SECONDS * effect * (hit.fire ?? 0) / Math.max(1, heroHit(m));
            const chillOn = buildUp(bonus('chillChance') * effect * (hit.cold ?? 0) * landed / m.hp, m.hp / Math.max(1e-6, dpsAgainst(m)));
            const chillMe = buildUp(AILMENT_CHANCE * coldIn * (1 - Math.min(0.75, stats.resist.cold ?? 0)) / stats.maxHealth, t + 5);
            const kill = m.hp / Math.max(1e-6, dpsAgainst(m) * (1 + shockOn) * (1 + burn) * (1 - chillMe));
            t += kill;
            const shockMe = buildUp(AILMENT_CHANCE * lightningIn * (1 - Math.min(0.75, stats.resist.lightning ?? 0)) / stats.maxHealth, t);
            const burnMe = 1 + AILMENT_CHANCE * BURN_SHARE * BURN_SECONDS * (m.damageTypes.fire ?? 0) * (1 - Math.min(0.75, stats.resist.fire ?? 0));
            incoming += takenPerSecond(m) * (1 + shockMe) * burnMe * (1 - chillOn) * t;
            dealt += m.hp;
            hitsLanded += kill * stats.attacksPerSecond * (1 - missShare(stats.accuracy, m.evasion));
        }
        const sustain = stats.lifeRegen * t + stats.lifeLeech * dealt + stats.lifeOnHit * hitsLanded;
        const loss = Math.max(0, incoming - stats.maxWard) - sustain;
        if (loss >= hp) return {score: i + Math.max(0, hp / Math.max(1, loss)), cleared: i};
        hp = Math.min(stats.maxHealth, hp - loss);
    }
    return {score: quest.encounters.length + hp / stats.maxHealth, cleared: quest.encounters.length};
}

export function kitFit(gear: Gear, stage: Stage, classKey: string, mods: string[] = []): Fit {
    const state: GameState = setup(stage.level, gear, classKey);
    invalidateStats();
    return questFit(getAdventurerStats(state, state.adventurers[0]), stage.quest, mods);
}

const scaleKeys = (w: Weights, keys: StatKey[], by: number): Weights => {
    const out = {...w};
    for (const k of keys) if (out[k] !== undefined) out[k] = out[k]! * by;
    return out;
};
const OFFENSE: StatKey[] = ['physicalDamage', 'fireDamage', 'coldDamage', 'lightningDamage', 'attackSpeed', 'critChance', 'critMultiplier', 'increasedDamage', 'increasedPhysicalDamage', 'increasedElementalDamage', 'accuracy', 'physicalToFire', 'physicalToCold', 'physicalToLightning', 'str', 'dex', 'int'];
const DEFENSE: StatKey[] = ['armor', 'evasion', 'maxHealth', 'increasedMaxHealth', 'blockChance', 'ward', 'hpLostAsWard', 'increasedArmor', 'increasedEvasion'];
const SUSTAIN: StatKey[] = ['lifeRegen', 'lifeRegenPercent', 'lifeOnHit', 'lifeLeech'];
const RESIST: StatKey[] = elements.map(e => `${e}Resist` as StatKey);

interface Piece {type: ItemTypeKey, base: string[], deco: string[]}

// The best crafts of a type under each weight profile, without duplicates.
function candidates(type: ItemTypeKey, pool: string[], base: number, deco: number, profiles: Weights[]): Piece[] {
    const out: Piece[] = [];
    for (const w of profiles) {
        const c = bestCraft(type, pool, base, deco, {}, w);
        if (c && !out.some(o => o.base.join() === c.base.join() && o.deco.join() === c.deco.join())) out.push({type, base: c.base, deco: c.deco});
    }
    return out;
}

// Searched kit for an archetype at a stage, against its quest with these modifiers.
export function searchKit(archetype: Archetype, stage: Stage, mods: string[] = []): {gear: Gear, fit: Fit, start: Fit} {
    const pool = stageMaterials(stage);
    const tuned = zoneWeights(archetype.weights, stage.quest);
    const profiles = [tuned, scaleKeys(tuned, OFFENSE, 2), scaleKeys(tuned, DEFENSE, 2), scaleKeys(tuned, RESIST, 3), scaleKeys(tuned, SUSTAIN, 3), zoneWeights(archetype.weights, null)];
    const s = stage.slots;
    const options = new Map<SlotKey, (Piece | null)[]>();
    options.set('mainHand', archetype.weapons.flatMap(t => candidates(t, pool, s.base, s.deco, profiles)));
    const offTypes = archetype.weapons.length ? archetype.offHand ?? ['shield'] : [];
    options.set('offHand', [null, ...offTypes.flatMap(t => candidates(t, pool, s.base, s.deco, profiles))]);
    for (const [slot, type] of armorSlots) options.set(slot, candidates(type, pool, s.base, s.deco, profiles));
    const accCache = new Map<ItemTypeKey, Piece[]>();
    for (const [slot, type] of accessorySlots) {
        if (!accCache.has(type)) accCache.set(type, candidates(type, pool, s.accBase, s.accDeco, profiles));
        options.set(slot, accCache.get(type)!);
    }

    // Start from the zone-tuned greedy kit.
    const kit = new Map<SlotKey, Piece | null>();
    for (const [slot, type, base, deco] of buildKit(archetype, stage, true)) kit.set(slot, {type, base, deco: deco ?? []});
    const toGear = (k: typeof kit): Gear => {
        const main = k.get('mainHand');
        const twoHanded = main && itemTypes[main.type].twoHanded;
        return [...k.entries()].filter(([slot, p]) => p && !(slot === 'offHand' && twoHanded)).map(([slot, p]) => [slot, p!.type, p!.base, p!.deco]);
    };
    const fitOf = (k: typeof kit) => kitFit(toGear(k), stage, archetype.classKey, mods);
    const start = fitOf(kit);
    let best = start;
    for (let pass = 0; pass < 4; pass++) {
        let improved = false;
        for (const [slot, opts] of options) {
            let keep = kit.get(slot) ?? null;
            for (const o of opts) {
                if (o === keep) continue;
                const before = kit.get(slot) ?? null;
                kit.set(slot, o);
                const f = fitOf(kit);
                if (f.score > best.score + 1e-6) { best = f; keep = o; improved = true; } else kit.set(slot, before);
            }
            kit.set(slot, keep);
        }
        if (!improved) break;
    }
    return {gear: toGear(kit), fit: best, start};
}
