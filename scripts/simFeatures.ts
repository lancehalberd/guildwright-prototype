// Balance check for modifiers, ambition bosses and contracts. Usage: npx tsx scripts/simFeatures.ts [runs]
import {quests} from '../src/data/quests';
import {getQuestProgress, setActiveModifiers} from '../src/engine/state';
import {invalidateStats} from '../src/engine/stats';
import {assignQuest, tickAdventurer, TICK_SECONDS} from '../src/engine/runner';
import type {GameState} from '../src/engine/types';
import {ashenEndGear, ashenStarterGear, minesGear, wizardMinesGear, wizardWardGear, mulberry32, rareGear, setup, uncommonGear, type Gear} from './simSetup';

declare const process: {argv: string[]};
const runs = Number(process.argv[2] ?? 100);

function attempt(template: GameState, questKey: string, mods: string[], seed: number, boss = false): {cleared: boolean, boss: boolean, reached: number} {
    const state: GameState = structuredClone(template);
    invalidateStats();
    const rng = mulberry32(seed);
    const hero = state.adventurers[0];
    hero.xp = -1e9;
    if (boss) {
        hero.ambitions = [{kind: 'boss', quest: questKey, target: 1, mods, tier: 0, fame: 1}];
    }
    setActiveModifiers(hero, questKey, mods);
    // The quest's modifiers need unlocking; pretend the guild has cleared it with all of them.
    getQuestProgress(state, questKey).bestModifiedClear = 9;
    assignQuest(state, hero, questKey);
    let t = 0;
    const last = quests[questKey].encounters.length - 1;
    let cleared = false;
    while (t < 3600) {
        tickAdventurer(state, hero, TICK_SECONDS, rng);
        t += TICK_SECONDS;
        if (getQuestProgress(state, questKey).bestEncounter >= last) cleared = true;
        if (hero.run?.defeatedAt !== undefined) break;
        if (!boss && cleared) break;
        if (boss && hero.run?.bossEncounter === 'fought' && hero.activity.kind !== 'fighting') break;
        if (boss && cleared && !hero.run?.bossEncounter) break;
        if (hero.run && hero.run.number > 1) break;
    }
    return {cleared, boss: !!hero.records?.bosses.includes(questKey), reached: getQuestProgress(state, questKey).bestEncounter + 1};
}

// Straight to the boss at full HP, skipping the quest.
function bossOnly(template: GameState, questKey: string, mods: string[], seed: number): boolean {
    const state: GameState = structuredClone(template);
    invalidateStats();
    const rng = mulberry32(seed);
    const hero = state.adventurers[0];
    hero.xp = -1e9;
    hero.ambitions = [{kind: 'boss', quest: questKey, target: 1, mods, tier: 0, fame: 1}];
    setActiveModifiers(hero, questKey, mods);
    getQuestProgress(state, questKey).bestModifiedClear = 9;
    assignQuest(state, hero, questKey);
    hero.run!.bossEncounter = 'pending';
    hero.activity = {kind: 'resting', questKey, remaining: 0, defeated: false};
    for (let t = 0; t < 600; t += TICK_SECONDS) {
        tickAdventurer(state, hero, TICK_SECONDS, rng);
        if ((hero.run?.bossEncounter as string | undefined) === 'fought' && (hero.activity.kind as string) !== 'fighting') break;
    }
    return !!hero.records?.bosses.includes(questKey);
}
function reportBoss(name: string, level: number, gear: Gear, questKey: string, mods: string[], classKey = 'warrior') {
    const template = setup(level, gear, classKey);
    template.achievements.push('clear-ashenPeaks');
    let b = 0;
    for (let i = 0; i < runs; i++) if (bossOnly(template, questKey, mods, 2000 + i)) b++;
    console.log(`${name.padEnd(52)} boss alone ${String(Math.round(100 * b / runs)).padStart(3)}%`);
}

function report(name: string, level: number, gear: Gear, questKey: string, mods: string[], boss = false, classKey = 'warrior') {
    const template = setup(level, gear, classKey);
    template.achievements.push('clear-ashenPeaks');
    let c = 0, b = 0, reached = 0;
    for (let i = 0; i < runs; i++) {
        const r = attempt(template, questKey, mods, 1000 + i, boss);
        if (r.cleared) c++;
        if (r.boss) b++;
        reached += r.reached;
    }
    console.log(`${name.padEnd(52)} clear ${String(Math.round(100 * c / runs)).padStart(3)}%` + (boss ? `  boss ${String(Math.round(100 * b / runs)).padStart(3)}%` : '') + `  avg encounters ${(reached / runs).toFixed(1)}`);
}

console.log('Single modifiers on Bramble Road, L9 uncommon crafts');
for (const m of [[], ['hardened'], ['swift'], ['brutal'], ['horde'], ['elite'], ['juggernaut'], ['relentless']]) {
    report(`  ${m.join('+') || 'none'}`, 9, uncommonGear, 'brambleRoad', m);
}
console.log('Bramble Road, L12 rare crafts');
for (const m of [[], ['horde'], ['brutal', 'horde'], ['frozen'], ['shocking']]) {
    report(`  ${m.join('+') || 'none'}`, 12, rareGear, 'brambleRoad', m);
}
console.log('Hollow Mines, L18 mines crafts');
for (const m of [[], ['horde'], ['hardened']]) {
    report(`  ${m.join('+') || 'none'}`, 18, minesGear, 'hollowMines', m);
}
console.log('Priest ward build, Hollow Mines');
report('  L16 Priest, mines gear with a staff', 16, wizardMinesGear, 'hollowMines', [], false, 'priest');
report('  L16 Priest, ward armor', 16, wizardWardGear, 'hollowMines', [], false, 'priest');
report('  L20 Priest, mines gear with a staff', 20, wizardMinesGear, 'hollowMines', [], false, 'priest');
report('  L20 Priest, ward armor', 20, wizardWardGear, 'hollowMines', [], false, 'priest');
console.log('Ambition bosses (clear, then boss after resting)');
report('  Briar King, L10 uncommon, hardened', 10, uncommonGear, 'brambleRoad', ['hardened'], true);
report('  Briar King, L12 rare, hardened', 12, rareGear, 'brambleRoad', ['hardened'], true);
report('  Briar King, L12 rare, frozen', 12, rareGear, 'brambleRoad', ['frozen'], true);
report('  Briar King, L15 rare, brutal', 15, rareGear, 'brambleRoad', ['brutal'], true);
report('  Colossus, L18 mines, swift', 18, minesGear, 'hollowMines', ['swift'], true);
report('  Colossus, L22 mines, shocking', 22, minesGear, 'hollowMines', ['shocking'], true);
report('  Wyrmqueen, L25 ashen, hardened+swift', 25, ashenStarterGear, 'ashenPeaks', ['hardened', 'swift'], true);
report('  Wyrmqueen, L32 ashen, hardened+swift', 32, ashenStarterGear, 'ashenPeaks', ['hardened', 'swift'], true);
console.log('Bosses alone, at full HP');
reportBoss('  Briar King, L10 uncommon, hardened', 10, uncommonGear, 'brambleRoad', ['hardened']);
reportBoss('  Briar King, L12 rare, hardened', 12, rareGear, 'brambleRoad', ['hardened']);
reportBoss('  Colossus, L16 mines, swift', 16, minesGear, 'hollowMines', ['swift']);
reportBoss('  Colossus, L20 mines, swift', 20, minesGear, 'hollowMines', ['swift']);
reportBoss('  Colossus, L20 mines, shocking', 20, minesGear, 'hollowMines', ['shocking']);
reportBoss('  Colossus, L20 ashen kit, shocking', 20, ashenStarterGear, 'hollowMines', ['shocking']);
report('  Ashen Peaks, L25 ashen end kit, no mods', 25, ashenEndGear, 'ashenPeaks', [], false);
report('  Wyrmqueen, L25 ashen end kit, hardened+swift', 25, ashenEndGear, 'ashenPeaks', ['hardened', 'swift'], true);
report('  Wyrmqueen, L30 ashen end kit, hardened+swift', 30, ashenEndGear, 'ashenPeaks', ['hardened', 'swift'], true);
reportBoss('  Wyrmqueen, L25 ashen end kit, hardened+swift', 25, ashenEndGear, 'ashenPeaks', ['hardened', 'swift']);
reportBoss('  Wyrmqueen, L30 ashen end kit, hardened+swift', 30, ashenEndGear, 'ashenPeaks', ['hardened', 'swift']);
reportBoss('  Wyrmqueen, L20 ashen, hardened+swift', 20, ashenStarterGear, 'ashenPeaks', ['hardened', 'swift']);
reportBoss('  Wyrmqueen, L25 ashen, hardened+swift', 25, ashenStarterGear, 'ashenPeaks', ['hardened', 'swift']);
reportBoss('  Wyrmqueen, L30 ashen, hardened+swift', 30, ashenStarterGear, 'ashenPeaks', ['hardened', 'swift']);
reportBoss('  Wyrmqueen, L30 ashen, frozen+brutal', 30, ashenStarterGear, 'ashenPeaks', ['frozen', 'brutal']);
reportBoss('  Wyrmqueen, L30 ashen, hardened', 30, ashenStarterGear, 'ashenPeaks', ['hardened']);
reportBoss('  Wyrmqueen, L30 ashen, frozen', 30, ashenStarterGear, 'ashenPeaks', ['frozen']);
reportBoss('  Wyrmqueen, L40 ashen, hardened+swift', 40, ashenStarterGear, 'ashenPeaks', ['hardened', 'swift']);
