// Headless balance check: runs setups many times and reports how far the adventurer gets.
// Usage: npm run sim [-- runs]
import {endlessKey, quests} from '../src/data/quests';
import {getQuestProgress} from '../src/engine/state';
import {getAdventurerStats, invalidateStats} from '../src/engine/stats';
import {assignQuest, tickAdventurer, TICK_SECONDS} from '../src/engine/runner';
import type {GameState} from '../src/engine/types';
import {ashenStarterGear, minesGear, commonGear, commonRecoveryGear, fireGear, fireResistGear, mulberry32, partialCommonGear, rareGear, setup, uncommonGear, uncommonRecoveryGear, type Gear} from './simSetup';

declare const process: {argv: string[]};

// Runs one attempt from full HP and returns the last encounter index cleared (-1 = none).
function runOnce(template: GameState, questKey: string, rng: () => number): {cleared: number, seconds: number} {
    const state: GameState = structuredClone(template);
    invalidateStats();
    const hero = state.adventurers[0];
    // Keep the level fixed for the test.
    hero.xp = -1e9;
    assignQuest(state, hero, questKey);
    let seconds = 0;
    while ((hero.activity.kind === 'fighting' || hero.activity.kind === 'traveling') && seconds < 3600) {
        tickAdventurer(state, hero, TICK_SECONDS, rng);
        seconds += TICK_SECONDS;
    }
    return {cleared: getQuestProgress(state, questKey).bestEncounter, seconds};
}

const runs = Number(process.argv[2] ?? 300);
const scenarios: {name: string, level: number, gear: Gear, quest: string, classKey?: string}[] = [
    {name: 'Fresh L1, wooden sword', level: 1, gear: [], quest: 'brambleRoad'},
    {name: 'L5, wooden sword', level: 5, gear: [], quest: 'brambleRoad'},
    {name: 'L5 Ranger, wooden longbow', level: 5, gear: [], quest: 'brambleRoad', classKey: 'ranger'},
    {name: 'L5 Priest, wooden staff', level: 5, gear: [], quest: 'brambleRoad', classKey: 'priest'},
    {name: 'L5, 4 common crafts', level: 5, gear: partialCommonGear, quest: 'brambleRoad'},
    {name: 'L7, all common crafts', level: 7, gear: commonGear, quest: 'brambleRoad'},
    {name: 'L9, all common crafts', level: 9, gear: commonGear, quest: 'brambleRoad'},
    {name: 'L7, common recovery crafts', level: 7, gear: commonRecoveryGear, quest: 'brambleRoad'},
    {name: 'L9, some uncommon crafts', level: 9, gear: uncommonGear, quest: 'brambleRoad'},
    {name: 'L9, uncommon recovery crafts', level: 9, gear: uncommonRecoveryGear, quest: 'brambleRoad'},
    {name: 'L11, uncommon + rare crafts, Quest 2', level: 11, gear: rareGear, quest: 'hollowMines'},
    {name: 'L11, same with Garnet armor, Quest 2', level: 11, gear: fireResistGear, quest: 'hollowMines'},
    {name: 'L11, Garnet armor and sword, Quest 2', level: 11, gear: fireGear, quest: 'hollowMines'},
    {name: 'L9, some uncommon crafts, Quest 2', level: 9, gear: uncommonGear, quest: 'hollowMines'},
    {name: 'L16, Hollow Mines crafts, Quest 2', level: 16, gear: minesGear, quest: 'hollowMines'},
    {name: 'L14, Hollow Mines crafts, Quest 3', level: 14, gear: minesGear, quest: 'ashenPeaks'},
    {name: 'L17, Hollow Mines crafts, Quest 3', level: 17, gear: minesGear, quest: 'ashenPeaks'},
    {name: 'L17, early Ashen kit, Quest 3', level: 17, gear: ashenStarterGear, quest: 'ashenPeaks'},
    {name: 'L20, early Ashen kit, Quest 3', level: 20, gear: ashenStarterGear, quest: 'ashenPeaks'},
];

const tiers = quests.brambleRoad.encounters.map(e => e.tier).join('');
console.log(`Quest shape ${tiers}, ${runs} runs per setup. Columns: share of runs that cleared each encounter.\n`);
console.log('Setup'.padEnd(40) + quests.brambleRoad.encounters.map((e, i) => (e.tier + (i + 1)).padStart(5)).join('') + '  avg s');
for (const scenario of scenarios) {
    const template = setup(scenario.level, scenario.gear, scenario.classKey);
    const stats = getAdventurerStats(template, template.adventurers[0]);
    const rng = mulberry32(12345);
    const clearedCounts = new Array(quests[scenario.quest].encounters.length).fill(0);
    let totalSeconds = 0;
    for (let i = 0; i < runs; i++) {
        const {cleared, seconds} = runOnce(template, scenario.quest, rng);
        totalSeconds += seconds;
        for (let e = 0; e <= cleared; e++) clearedCounts[e]++;
    }
    console.log(scenario.name.padEnd(40) + clearedCounts.map(c => (Math.round(100 * c / runs) + '%').padStart(5)).join('') + (totalSeconds / runs).toFixed(0).padStart(7));
    const hit = Object.entries(stats.damage).filter(([, v]) => v > 0).map(([t, v]) => `${v.toFixed(1)} ${t}`).join(' + ');
    console.log(`    hp ${stats.maxHealth}, hit ${hit} x ${stats.attacksPerSecond.toFixed(2)}/s, acc ${stats.accuracy}, armor ${stats.armor}, eva ${stats.evasion}, block ${(stats.blockChance * 100).toFixed(0)}%, res ${Object.values(stats.resist).map(r => (r * 100).toFixed(0)).join('/')}, crit ${(stats.critChance * 100).toFixed(0)}%${stats.lifeRegen || stats.lifeLeech || stats.lifeOnHit ? `, regen ${stats.lifeRegen.toFixed(2)}/s, leech ${(stats.lifeLeech * 100).toFixed(0)}%, on hit ${stats.lifeOnHit}` : ""}`);
}

// Endless: how deep each setup gets, and how long an attempt takes.
const endlessScenarios: {name: string, level: number, gear: Gear, quest: string, classKey?: string}[] = [
    {name: 'L9, all common crafts', level: 9, gear: commonGear, quest: 'brambleRoad'},
    {name: 'L9, some uncommon crafts', level: 9, gear: uncommonGear, quest: 'brambleRoad'},
    {name: 'L9, uncommon recovery crafts', level: 9, gear: uncommonRecoveryGear, quest: 'brambleRoad'},
    {name: 'L11, uncommon + rare crafts', level: 11, gear: rareGear, quest: 'brambleRoad'},
    {name: 'L11, uncommon + rare crafts, Quest 2', level: 11, gear: rareGear, quest: 'hollowMines'},
    {name: 'L11, Garnet armor and sword, Quest 2', level: 11, gear: fireGear, quest: 'hollowMines'},
];
const endlessRuns = Math.max(20, Math.round(runs / 5));
console.log(`\nEndless, ${endlessRuns} attempts per setup: encounters cleared (10th / median / 90th percentile), average seconds.`);
for (const scenario of endlessScenarios) {
    const template = setup(scenario.level, scenario.gear, scenario.classKey);
    template.gold = 1e6;
    template.achievements.push('clear-' + scenario.quest);
    const rng = mulberry32(777);
    const depths: number[] = [];
    let totalSeconds = 0;
    for (let i = 0; i < endlessRuns; i++) {
        const state: GameState = structuredClone(template);
        invalidateStats();
        const hero = state.adventurers[0];
        hero.xp = -1e9;
        assignQuest(state, hero, endlessKey(scenario.quest));
        let seconds = 0;
        while ((hero.activity.kind === 'fighting' || hero.activity.kind === 'traveling') && seconds < 3600) {
            tickAdventurer(state, hero, TICK_SECONDS, rng);
            seconds += TICK_SECONDS;
        }
        depths.push(getQuestProgress(state, endlessKey(scenario.quest)).bestEncounter + 1);
        totalSeconds += seconds;
    }
    depths.sort((a, b) => a - b);
    const at = (q: number) => depths[Math.min(depths.length - 1, Math.floor(q * depths.length))];
    console.log(scenario.name.padEnd(40) + `${at(0.1)} / ${at(0.5)} / ${at(0.9)}`.padStart(14) + (totalSeconds / endlessRuns).toFixed(0).padStart(7));
}
