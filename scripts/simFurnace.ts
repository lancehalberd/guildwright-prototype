// Forgeheart (Titan's Furnace) build study: the same hero with a plain kit, a kit built around the
// Furnace, then trophies and other worn mythics on top. Usage: npx tsx scripts/simFurnace.ts [runs] [stage]
import {requireMaterial} from '../src/data/materials';
import {itemTypes} from '../src/data/items';
import {quests} from '../src/data/quests';
import {equip, getQuestProgress} from '../src/engine/state';
import {getAdventurerStats, invalidateStats} from '../src/engine/stats';
import {assignQuest, tickAdventurer, TICK_SECONDS} from '../src/engine/runner';
import type {GameState, SlotKey} from '../src/engine/types';
import {archetypes, buildKit, stages, type Archetype} from './kitBuilder';
import {mulberry32, setup} from './simSetup';

declare const process: {argv: string[]};
const runs = Number(process.argv[2] ?? 8);
const stageName = process.argv[3] ?? 'Foundry late';
const LEVEL = 48;

function attempt(template: GameState, questKey: string, seed: number) {
    const state: GameState = structuredClone(template);
    invalidateStats();
    const rng = mulberry32(seed);
    const hero = state.adventurers[0];
    hero.xp = -1e9;
    assignQuest(state, hero, questKey);
    const last = quests[questKey].encounters.length - 1;
    let t = 0;
    for (; t < 3600; t += TICK_SECONDS) {
        tickAdventurer(state, hero, TICK_SECONDS, rng);
        if (getQuestProgress(state, questKey).bestEncounter >= last) break;
        if (hero.run?.defeatedAt !== undefined || (hero.run && hero.run.number > 1)) break;
    }
    const best = getQuestProgress(state, questKey).bestEncounter;
    const st = hero.run?.stats;
    const dps = st && st.fightSeconds ? Object.values(st.dealt).reduce((a, b) => a + (b ?? 0), 0) / st.fightSeconds : 0;
    return {cleared: best >= last, reached: best + 1, dps, fight: st?.fightSeconds ?? 0};
}

function summarize(template: GameState, questKey: string) {
    let c = 0, reached = 0, dps = 0, fight = 0;
    for (let i = 0; i < runs; i++) {
        const r = attempt(template, questKey, 1000 + i);
        if (r.cleared) c++;
        reached += r.reached; dps += r.dps; fight += r.fight;
    }
    return `${String(Math.round(100 * c / runs)).padStart(3)}% clear ${(reached / runs).toFixed(1).padStart(5)} enc ${Math.round(dps / runs).toString().padStart(6)} dps ${Math.round(fight / runs).toString().padStart(4)}s fighting`;
}

function wear(state: GameState, key: string, slot?: SlotKey) {
    const hero = state.adventurers[0];
    const s = slot ?? itemTypes[requireMaterial(key).equip!.itemType].slots[0];
    state.materials[key] = (state.materials[key] ?? 0) + 1;
    invalidateStats();
    if (!equip(state, hero, {kind: 'material', key}, s)) throw new Error('could not equip ' + key);
}

function withTrophies(state: GameState, keys: string[]) {
    state.trophies ??= {};
    for (const k of keys) state.trophies[k] = 3;
    state.trophySlots = keys;
}

function report(label: string, state: GameState, questKey: string) {
    invalidateStats();
    const hero = state.adventurers[0];
    const s = getAdventurerStats(state, hero);
    hero.hp = s.maxHealth;
    const pool = s.maxHealth + s.maxWard;
    const g = (k: string) => (s.gear as Record<string, number>)[k] ?? 0;
    const self = 0.9 * pool * (1 - s.resist.fire) * (1 - g('lessElementalDamageTaken')) * (1 - g('lessDamageTaken')) * (1 - g('reducedDamageOverTimeTaken'));
    const regen = s.lifeRegen * (1 + g('increasedRecovery'));
    console.log(`${label.padEnd(44)} ${summarize(state, questKey)} | HP ${s.maxHealth} ward ${s.maxWard} fireRes ${Math.round(100 * s.resist.fire)}% burn ${Math.round(self)}/s regen ${Math.round(regen)}/s`);
}

const stage = stages.find(s => s.name === stageName)!;
const st = {...stage, level: LEVEL};
const furnaceWeights = {fireResist: 400, lifeRegen: 6, lifeRegenPercent: 2500, maxHealth: 2, increasedMaxHealth: 120, ward: 1.5, increasedWard: 60};
const trophySet = [
    'clear-ashenPeaks', 'clear-sunderedRift', 'clear-duskgraveNecropolis', 'clear-skyspireAerie',
    'class-battlemage', 'class-bloodmage', 'class-warrior', 'class-priest', 'clear-shatteredThrone', 'class-wizard',
];
console.log(`${stageName} at level ${LEVEL}, ${runs} runs each.`);
for (const classKey of ['bloodmage', 'battlemage', 'berserker']) {
    const base = archetypes.find(a => a.classKey === classKey)!;
    const plain = setup(LEVEL, buildKit(base, st, true), classKey);
    report(`${classKey}: plain kit, no Forgeheart`, structuredClone(plain), stage.quest);
    const p1 = structuredClone(plain); wear(p1, 'forgeheart');
    report(`${classKey}: plain kit + Forgeheart`, p1, stage.quest);
    const built: Archetype = {...base, weights: {...base.weights, ...furnaceWeights}};
    const fk = setup(LEVEL, buildKit(built, st, true), classKey);
    wear(fk, 'forgeheart');
    report(`${classKey}: Furnace kit`, structuredClone(fk), stage.quest);
    const ft = structuredClone(fk); withTrophies(ft, trophySet);
    report(`${classKey}: Furnace kit + trophies`, structuredClone(ft), stage.quest);
    const fp = structuredClone(ft); wear(fp, 'paleCrown');
    report(`${classKey}: + Pale Crown`, structuredClone(fp), stage.quest);
    const fx = structuredClone(ft); wear(fx, 'phoenixFeather');
    report(`${classKey}: + Phoenix Charm`, structuredClone(fx), stage.quest);
}
