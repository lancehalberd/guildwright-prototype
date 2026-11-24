// Farming check: how fast each stopping point gathers drops, counting fights and rests.
// Usage: npm run farm [-- minutes]
import {quests} from '../src/data/quests';
import {invalidateStats} from '../src/engine/stats';
import {getQuestProgress} from '../src/engine/state';
import {assignQuest, getRestSeconds, setStopAt, tickAdventurer, TICK_SECONDS} from '../src/engine/runner';
import {getCachedStats} from '../src/engine/stats';
import type {GameState, Tier} from '../src/engine/types';
import {commonGear, fireResistGear, mulberry32, rareGear, setup, uncommonGear, type Gear} from './simSetup';

declare const process: {argv: string[]};

const minutes = Number(process.argv[2] ?? 60);
const scenarios: {name: string, level: number, gear: Gear, quest: string}[] = [
    {name: 'L7, all common crafts', level: 7, gear: commonGear, quest: 'brambleRoad'},
    {name: 'L9, all common crafts', level: 9, gear: commonGear, quest: 'brambleRoad'},
    {name: 'L9, some uncommon crafts', level: 9, gear: uncommonGear, quest: 'brambleRoad'},
    {name: 'L11, rare crafts + Garnet armor, Quest 2', level: 11, gear: fireResistGear, quest: 'hollowMines'},
];

function farm(template: GameState, questKey: string, stopAt: number, seed: number, modifiers: string[] = []) {
    const state: GameState = structuredClone(template);
    invalidateStats();
    const hero = state.adventurers[0];
    const progress = getQuestProgress(state, questKey);
    progress.bestModifiedClear = 5;
    progress.activeModifiers = modifiers;
    hero.xp = -1e9;
    setStopAt(hero, questKey, stopAt);
    assignQuest(state, hero, questKey);
    const rng = mulberry32(seed);
    const quest = quests[questKey];
    const tierOf: Record<string, Tier> = {};
    for (const tier of ['C', 'U', 'R', 'M'] as Tier[]) for (const e of quest.pools[tier]) tierOf[e.material] ??= tier;
    const before = {...state.obtained};
    let defeats = 0, wasDefeated = false;
    const gold0 = state.gold;
    for (let t = 0; t < minutes * 60; t += TICK_SECONDS) {
        tickAdventurer(state, hero, TICK_SECONDS, rng);
        const defeated = hero.activity.kind === 'resting' && hero.activity.defeated;
        if (defeated && !wasDefeated) defeats++;
        wasDefeated = defeated;
    }
    const drops: Record<Tier, number> = {C: 0, U: 0, R: 0, M: 0};
    for (const [key, n] of Object.entries(state.obtained)) {
        if (tierOf[key]) drops[tierOf[key]] += n - (before[key] ?? 0);
    }
    return {drops, defeats, gold: state.gold - gold0};
}

const shape = quests.brambleRoad.encounters.map(e => e.tier).join('');
console.log(`Shape ${shape}. ${minutes} simulated minutes per row, including rests. Drops are material counts per 10 minutes.\n`);
for (const s of scenarios) {
    const template = setup(s.level, s.gear);
    const quest = quests[s.quest];
    console.log(`${s.name} (${quest.name})`);
    console.log('  stop after'.padEnd(16) + 'C/10m'.padStart(7) + 'U/10m'.padStart(7) + 'R/10m'.padStart(7) + 'gold/10m'.padStart(10) + 'defeats'.padStart(9));
    quest.encounters.forEach((e, i) => {
        if (e.tier === 'C' && quest.encounters[i + 1]?.tier !== 'U') return;
        const r = farm(template, s.quest, i, 99 + i);
        const per = (n: number) => (n * 10 / minutes).toFixed(1).padStart(7);
        console.log(`  ${e.tier}${i + 1}`.padEnd(16) + per(r.drops.C) + per(r.drops.U) + per(r.drops.R) + (r.gold * 10 / minutes).toFixed(0).padStart(10) + String(r.defeats).padStart(9));
    });
}

// Time each encounter costs on full runs: fight seconds plus the rest needed for the HP it took.
function encounterCosts(template: GameState, questKey: string, runs: number) {
    const quest = quests[questKey];
    const n = quest.encounters.length;
    const fight = new Array(n).fill(0), rest = new Array(n).fill(0), reached = new Array(n).fill(0);
    const rng = mulberry32(7);
    for (let r = 0; r < runs; r++) {
        const state: GameState = structuredClone(template);
        invalidateStats();
        const hero = state.adventurers[0];
        hero.xp = -1e9;
        setStopAt(hero, questKey, n - 1);
        assignQuest(state, hero, questKey);
        const maxHp = getCachedStats(state, hero).maxHealth;
        let index = -1, hpAtStart = hero.hp;
        while (hero.activity.kind === 'fighting' || hero.activity.kind === 'traveling') {
            const a = hero.activity;
            if (a.kind === 'fighting' && a.encounterIndex !== index) {
                if (index >= 0) rest[index] += getRestSeconds(maxHp, maxHp - Math.max(0, hpAtStart - hero.hp), false);
                index = a.encounterIndex;
                hpAtStart = hero.hp;
                reached[index]++;
            }
            tickAdventurer(state, hero, TICK_SECONDS, rng);
            if (a.kind === 'fighting') fight[index] += TICK_SECONDS;
        }
        if (index >= 0) rest[index] += getRestSeconds(maxHp, maxHp - Math.max(0, hpAtStart - hero.hp), false);
    }
    return quest.encounters.map((e, i) => ({tier: e.tier, fight: fight[i] / Math.max(1, reached[i]), rest: rest[i] / Math.max(1, reached[i]), reached: reached[i] / runs}));
}

console.log('\nSeconds per encounter on full runs (fight + rest for HP lost):');
for (const s of scenarios) {
    const costs = encounterCosts(setup(s.level, s.gear), s.quest, 100);
    console.log(`  ${s.name}`);
    console.log('    ' + costs.map((c, i) => `${c.tier}${i + 1}`.padStart(6)).join(''));
    console.log('    ' + costs.map(c => (c.fight + c.rest).toFixed(1).padStart(6)).join(''));
}

// Each modifier alone, and a few stacks, for a build that clears Bramble Road reliably.
console.log('\nModifiers on Bramble Road, L13 with uncommon + rare crafts, stopping after the final encounter (per 10 min):');
{
    const template = setup(13, rareGear);
    const last = quests.brambleRoad.encounters.length - 1;
    const sets: string[][] = [[], ['hardened'], ['swift'], ['burning'], ['brutal'], ['elite'], ['hardened', 'swift'], ['hardened', 'swift', 'burning'], ['hardened', 'swift', 'burning', 'brutal', 'elite']];
    console.log('  modifiers'.padEnd(40) + 'C'.padStart(7) + 'U'.padStart(7) + 'R'.padStart(7) + 'M'.padStart(7) + 'net gold'.padStart(10) + 'defeats'.padStart(9));
    for (const mods of sets) {
        const r = farm(template, 'brambleRoad', last, 5, mods);
        const per = (n: number) => (n * 10 / minutes).toFixed(1).padStart(7);
        console.log(`  ${mods.join(' + ') || 'none'}`.padEnd(40) + per(r.drops.C) + per(r.drops.U) + per(r.drops.R) + per(r.drops.M) + (r.gold * 10 / minutes).toFixed(0).padStart(10) + String(r.defeats).padStart(9));
    }
}
