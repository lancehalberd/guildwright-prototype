// Archetype sims: each archetype's gear is built by kitBuilder for each stage of the game, then
// sent on that stage's quest. Usage: npx tsx scripts/simBuilds.ts [runs] [--kits]
import {quests} from '../src/data/quests';
import {getQuestProgress, setActiveModifiers} from '../src/engine/state';
import {getAdventurerStats, invalidateStats} from '../src/engine/stats';
import {assignQuest, tickAdventurer, TICK_SECONDS} from '../src/engine/runner';
import type {GameState, QuestRule} from '../src/engine/types';
import {archetypes, buildKit, stages} from './kitBuilder';
import {kitFit, searchKit} from './kitSearch';
import {mulberry32, setup} from './simSetup';

declare const process: {argv: string[]};
const runs = Number(process.argv[2] ?? 40);
const showKits = process.argv.includes('--kits');
// --only=warrior,reaver limits the archetypes by class.
// --search adds a column for kits picked by kitSearch (fit against the quest's monsters).
const search = process.argv.includes('--search');
// --mods=hardened,swift runs every quest with these modifiers on.
const mods = process.argv.find(a => a.startsWith('--mods='))?.slice(7).split(',') ?? [];
const only = process.argv.find(a => a.startsWith('--only='))?.slice(7).split(',');
// --rules=corrosion,karma puts every quest under these area rules (see engine/rules.ts).
const ruleArg = process.argv.find(a => a.startsWith('--rules='))?.slice(8).split(',').filter(Boolean) as QuestRule[] | undefined;
if (ruleArg) for (const q of Object.values(quests)) q.rules = ruleArg;

function attempt(template: GameState, questKey: string, seed: number, modKeys: string[] = mods): {cleared: boolean, reached: number} {
    const state: GameState = structuredClone(template);
    invalidateStats();
    const rng = mulberry32(seed);
    const hero = state.adventurers[0];
    hero.xp = -1e9;
    if (modKeys.length) setActiveModifiers(hero, questKey, modKeys);
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

console.log(`${runs} runs each. Clear % of the full quest and average encounters cleared (of 12).`);
console.log(`${'Stage'.padEnd(15)}${'Archetype'.padEnd(22)}${'generic'.padEnd(18)}${'zone-tuned'.padEnd(18)}${search ? 'searched' : ''}`);
// --stages=Rift limits the stages by name prefix.
const onlyStages = process.argv.find(a => a.startsWith('--stages='))?.slice(9).split(',');
for (const stage of stages.filter(s => !onlyStages || onlyStages.some(p => s.name.startsWith(p)))) {
    for (const archetype of archetypes.filter(a => !only || only.includes(a.classKey))) {
        const cells: string[] = [];
        for (const mode of search ? ['generic', 'tuned', 'search'] as const : ['generic', 'tuned'] as const) {
            const tuned = mode !== 'generic';
            const gear = mode === 'search' ? searchKit(archetype, stage, mods).gear : buildKit(archetype, stage, tuned);
            const template = setup(stage.level, gear, archetype.classKey);
            let c = 0, reached = 0;
            for (let i = 0; i < runs; i++) {
                const r = attempt(template, stage.quest, 1000 + i);
                if (r.cleared) c++;
                reached += r.reached;
            }
            const fit = kitFit(gear, stage, archetype.classKey, mods);
            cells.push(`${String(Math.round(100 * c / runs)).padStart(3)}%  ${(reached / runs).toFixed(1).padStart(4)} ~${fit.score.toFixed(1)}`.padEnd(18));
            if (showKits) {
                const st = getAdventurerStats(template, template.adventurers[0]);
                console.log(`  [${stage.name} / ${archetype.name} / ${mode}] hp ${st.maxHealth} ward ${st.maxWard} hit ${Math.round(st.damagePerHit)} x${st.attacksPerSecond.toFixed(2)} armor ${st.armor} eva ${st.evasion} block ${Math.round(100 * st.blockChance)}% res ${Object.values(st.resist).map(r => Math.round(100 * r)).join('/')}`);
                for (const [slot, type, base, deco] of gear) console.log(`      ${slot}: ${type} ${base.join('+')}${deco?.length ? ' | ' + deco.join('+') : ''}`);
            }
        }
        console.log(`${stage.name.padEnd(15)}${archetype.name.padEnd(22)}${cells.join('')}`);
    }
}
