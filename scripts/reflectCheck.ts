// Runs a strong hero in the Ironbound Foundry and reports reflected hits: events, run stats, and
// the share of damage dealt that came back. Run: npx tsx scripts/reflectCheck.ts [level]
import {assignQuest, drainCombatEvents, tickAdventurer, TICK_SECONDS} from '../src/engine/runner';
import {mulberry32, rareGear, setup} from './simSetup';

declare const process: {argv: string[]};
const level = Number(process.argv[2] ?? 60);
const state = setup(level, rareGear);
const hero = state.adventurers[0];
for (const q of ['brambleRoad', 'hollowMines', 'ashenPeaks', 'sunkenMarsh', 'thunderheadCrags', 'sunderedRift']) state.achievements.push('clear-' + q);
state.fame = 99999;
state.gold = 99999;
assignQuest(state, hero, 'ironboundFoundry');
const rng = mulberry32(7);
let reflected = 0, dealt = 0, back = 0, dodged = 0, blocked = 0;
for (let i = 0; i < 600 / TICK_SECONDS; i++) {
    tickAdventurer(state, hero, TICK_SECONDS, rng);
    for (const e of drainCombatEvents()) {
        if (e.side === 'monster' && e.kind === 'hit') dealt += e.amount ?? 0;
        if (!e.reflected) continue;
        if (e.kind === 'hit') { reflected++; back += (e.amount ?? 0) + (e.ward ?? 0); }
        if (e.kind === 'miss') dodged++;
        if (e.kind === 'block') blocked++;
    }
}
console.log({level, reflectedHits: reflected, dodged, blocked, dealt: Math.round(dealt), back: Math.round(back), share: (back / Math.max(1, dealt)).toFixed(4), runStats: hero.run?.stats?.reflected ?? hero.previousRunStats?.reflected});
