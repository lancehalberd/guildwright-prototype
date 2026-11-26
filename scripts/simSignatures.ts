// Signature effects (data/signatures.ts): each worn legendary or mythic against the same kit
// without it, on a quest where it would be worn. Usage: npx tsx scripts/simSignatures.ts [runs] [--only=key,key]
import {requireMaterial} from '../src/data/materials';
import {itemTypes} from '../src/data/items';
import {quests} from '../src/data/quests';
import {equip, getQuestProgress, itemLevelRequirement} from '../src/engine/state';
import {getAdventurerStats, invalidateStats} from '../src/engine/stats';
import {assignQuest, tickAdventurer, TICK_SECONDS} from '../src/engine/runner';
import type {GameState, SlotKey} from '../src/engine/types';
import {archetypes, buildKit, stages} from './kitBuilder';
import {mulberry32, setup} from './simSetup';

declare const process: {argv: string[]};
const runs = Number(process.argv[2] ?? 20);
const only = process.argv.find(a => a.startsWith('--only='))?.slice(7).split(',');
// --stage="Rift late" runs every case on that stage instead of its own.
const stageArg = process.argv.find(a => a.startsWith('--stage='))?.slice(8);

// [material, archetype class, stage name]
const cases: [string, string, string][] = [
    ['briarcrown', 'warrior', 'Mines early'], ['stormveinHeart', 'ninja', 'Ashen late'], ['wyrmqueenEmber', 'marksman', 'Coast late'],
    ['mireheart', 'bloodmage', 'Marsh late'], ['tempestTalon', 'ninja', 'Coast late'], ['riftheart', 'saboteur', 'Rift late'],
    ['empressStinger', 'saboteur', 'Hive late'], ['regentPhylactery', 'warrior', 'Grave late'], ['overseerSeal', 'gladiator', 'Foundry late'],
    ['heraldBolt', 'marksman', 'Aerie late'], ['borrowedCrown', 'ninja', 'Aerie late'],
    ['thornheart', 'warrior', 'Mines early'], ['wolfkingPelt', 'ranger', 'Mines early'], ['deepfireCore', 'saboteur', 'Mines late'],
    ['golemHeart', 'warrior', 'Ashen early'], ['phoenixFeather', 'berserker', 'Ashen late'], ['blackPearl', 'ninja', 'Marsh late'],
    ['tempestQuill', 'spellblade', 'Coast late'], ['prismaticEye', 'wizard', 'Rift late'], ['hiveheart', 'spellblade', 'Hive late'],
    ['paleCrown', 'bloodmage', 'Grave late'], ['forgeheart', 'bloodmage', 'Foundry late'], ['stormcrown', 'marksman', 'Aerie late'],
    ['throneheart', 'warrior', 'Aerie late'], ['oracleEye', 'ranger', 'Hive late'], ['veilSilk', 'ninja', 'Hive late'],
    ['sanctumShard', 'warrior', 'Foundry late'],
];

function attempt(template: GameState, questKey: string, seed: number) {
    const state: GameState = structuredClone(template);
    invalidateStats();
    const rng = mulberry32(seed);
    const hero = state.adventurers[0];
    hero.xp = -1e9;
    assignQuest(state, hero, questKey);
    const last = quests[questKey].encounters.length - 1;
    for (let t = 0; t < 3600; t += TICK_SECONDS) {
        tickAdventurer(state, hero, TICK_SECONDS, rng);
        if (getQuestProgress(state, questKey).bestEncounter >= last) break;
        if (hero.run?.defeatedAt !== undefined || (hero.run && hero.run.number > 1)) break;
    }
    const best = getQuestProgress(state, questKey).bestEncounter;
    const st = hero.run?.stats;
    const dps = st && st.fightSeconds ? Object.values(st.dealt).reduce((a, b) => a + (b ?? 0), 0) / st.fightSeconds : 0;
    return {cleared: best >= last, reached: best + 1, dps, reborn: !!hero.run?.reborn};
}

function summarize(template: GameState, questKey: string) {
    let c = 0, reached = 0, dps = 0, reborn = 0;
    for (let i = 0; i < runs; i++) {
        const r = attempt(template, questKey, 1000 + i);
        if (r.cleared) c++;
        reached += r.reached; dps += r.dps; if (r.reborn) reborn++;
    }
    return `${String(Math.round(100 * c / runs)).padStart(3)}% ${(reached / runs).toFixed(1).padStart(5)} enc ${Math.round(dps / runs).toString().padStart(6)} dps${reborn ? ` reborn ${reborn}` : ''}`;
}

console.log(`${runs} runs each: clear %, encounters reached, damage per second. Without -> with.`);
for (const [key, classKey, stageName] of cases) {
    if (only && !only.includes(key)) continue;
    const stage = stages.find(s => s.name === (stageArg ?? stageName))!;
    const archetype = archetypes.find(a => a.classKey === classKey)!;
    const material = requireMaterial(key);
    const level = Math.max(stage.level, itemLevelRequirement(setup(1, [], classKey), {kind: 'material', key}));
    const base = setup(level, buildKit(archetype, {...stage, level}, true), classKey);
    const withIt: GameState = structuredClone(base);
    const hero = withIt.adventurers[0];
    const slots = itemTypes[material.equip!.itemType].slots;
    const slot: SlotKey = slots.includes('ring1') ? 'ring1' : slots[0];
    withIt.materials[key] = (withIt.materials[key] ?? 0) + 1;
    invalidateStats();
    if (!equip(withIt, hero, {kind: 'material', key}, slot)) throw new Error('could not equip ' + key);
    invalidateStats();
    const a = getAdventurerStats(base, base.adventurers[0]), b = getAdventurerStats(withIt, hero);
    const note = `HP ${a.maxHealth}->${b.maxHealth}, ward ${a.maxWard}->${b.maxWard}, eva ${a.evasion}->${b.evasion}, aps ${a.attacksPerSecond.toFixed(2)}->${b.attacksPerSecond.toFixed(2)}, hit ${Math.round(a.damagePerHit)}->${Math.round(b.damagePerHit)}`;
    console.log(`${key.padEnd(17)} ${classKey.padEnd(10)} ${stageName.padEnd(13)} L${String(level).padEnd(3)} ${summarize(base, stage.quest)}  ->  ${summarize(withIt, stage.quest)}   ${note}`);
}
