// Runs exported build recipes (Dev menu → Export build) against quests.
// Usage: npx tsx scripts/simRecipe.ts recipe.json [more.json...] [runs] [--quests=ashenPeaks,sunkenMarsh] [--mods=key,key]
// Without --quests it runs the recipe's own quest; --quests=all runs every quest. The recipe's own
// modifiers apply unless --mods is given (--mods= for none).
// @ts-ignore: Node's fs, for this script only (the project has no Node types).
import {readFileSync} from 'fs';
import {questOrder, quests} from '../src/data/quests';
import {equip, getQuestProgress, setActiveModifiers} from '../src/engine/state';
import {getAdventurerStats, invalidateStats} from '../src/engine/stats';
import {assignQuest, tickAdventurer, TICK_SECONDS} from '../src/engine/runner';
import type {BuildRecipe} from '../src/engine/buildExport';
import type {GameState, SlotKey} from '../src/engine/types';
import {questFit} from './kitSearch';
import {mulberry32, setup, type Gear} from './simSetup';

declare const process: {argv: string[]};
const args = process.argv.slice(2);
const files = args.filter(a => a.endsWith('.json'));
const runs = Number(args.find(a => /^\d+$/.test(a)) ?? 40);
const questArg = args.find(a => a.startsWith('--quests='))?.slice(9);
const modArg = args.find(a => a.startsWith('--mods='));

// A ready state with the recipe's hero, gear, passives and bench limits.
export function recipeState(recipe: BuildRecipe): GameState {
    const gear: Gear = [];
    for (const [slot, s] of Object.entries(recipe.slots) as [SlotKey, NonNullable<BuildRecipe['slots'][SlotKey]>][]) {
        if (s.itemType) gear.push([slot, s.itemType, s.base ?? [], s.decorations ?? []]);
    }
    const state = setup(recipe.level, gear, recipe.classKey);
    const hero = state.adventurers[0];
    if (recipe.passives) hero.passives = recipe.passives;
    if (recipe.bonuses) hero.bonuses = recipe.bonuses;
    for (const [slot, s] of Object.entries(recipe.slots) as [SlotKey, NonNullable<BuildRecipe['slots'][SlotKey]>][]) {
        if (s.material) {
            state.materials[s.material] = (state.materials[s.material] ?? 0) + 1;
            equip(state, hero, {kind: 'material', key: s.material}, slot);
        }
    }
    invalidateStats();
    hero.hp = getAdventurerStats(state, hero).maxHealth;
    return state;
}

function attempt(template: GameState, questKey: string, mods: string[], seed: number): {cleared: boolean, reached: number} {
    const state: GameState = structuredClone(template);
    invalidateStats();
    const rng = mulberry32(seed);
    const hero = state.adventurers[0];
    hero.xp = -1e9;
    setActiveModifiers(hero, questKey, mods);
    assignQuest(state, hero, questKey);
    const last = quests[questKey].encounters.length - 1;
    for (let t = 0; t < 3600; t += TICK_SECONDS) {
        tickAdventurer(state, hero, TICK_SECONDS, rng);
        if (getQuestProgress(state, questKey).bestEncounter >= last) break;
        if (hero.run?.defeatedAt !== undefined || (hero.run && hero.run.number > 1)) break;
    }
    const best = getQuestProgress(state, questKey).bestEncounter;
    return {cleared: best >= last, reached: best + 1};
}

for (const file of files) {
    const recipe = JSON.parse(readFileSync(file, 'utf8')) as BuildRecipe;
    const template = recipeState(recipe);
    const stats = getAdventurerStats(template, template.adventurers[0]);
    console.log(`${recipe.name} (${file})${recipe.notes ? `: ${recipe.notes}` : ''}`);
    // A rebuild that doesn't match the game's own numbers means something didn't carry over.
    if (recipe.summary.maxHealth !== stats.maxHealth) console.log(`  note: rebuilt max HP ${stats.maxHealth}, recipe says ${recipe.summary.maxHealth} (trophies and guild bonuses aren't carried over)`);
    const questKeys = questArg === 'all' ? questOrder : questArg ? questArg.split(',') : recipe.quest ? [recipe.quest.key] : questOrder;
    for (const questKey of questKeys) {
        const mods = modArg !== undefined ? modArg.slice(7).split(',').filter(Boolean) : questKey === recipe.quest?.key ? recipe.quest.modifiers : [];
        let cleared = 0, reached = 0;
        for (let i = 0; i < runs; i++) {
            const r = attempt(template, questKey, mods, 1000 + i);
            if (r.cleared) cleared++;
            reached += r.reached;
        }
        const fit = questFit(stats, questKey, mods);
        console.log(`  ${quests[questKey].name.padEnd(18)}${mods.length ? `[${mods.join(',')}] ` : ''}${String(Math.round(100 * cleared / runs)).padStart(3)}% clear, ${(reached / runs).toFixed(1)} encounters on average, paper fit ~${fit.score.toFixed(1)}`);
    }
}
