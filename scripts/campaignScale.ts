// Per quest: campaign tier and its HP/damage scale, the first and final encounters' lead monster
// stats, the same encounter in the quest's Endless, and the highest monster resistances.
// Run: npx tsx scripts/campaignScale.ts
import {campaignScale, endlessKey, monsters, questOrder, questTier, quests} from '../src/data/quests';
import {getMonsterStats} from '../src/engine/runner';

const r = (n: number) => n >= 100 ? Math.round(n).toString() : n.toFixed(1);
for (const k of questOrder) {
    const q = quests[k], e = quests[endlessKey(k)];
    const c = campaignScale(q);
    const last = q.encounters.length - 1;
    const first = getMonsterStats(q, 0, q.encounters[0].monsters[0]);
    const boss = getMonsterStats(q, last, q.encounters[last].monsters[0]);
    const end0 = getMonsterStats(e, 0, e.encounters[0].monsters[0]);
    const endBoss = getMonsterStats(e, last, e.encounters[last].monsters[0]);
    console.log(`T${questTier(k) + 1} ${q.name.padEnd(22)} hp x${c.hp} dmg x${c.damage} | enc1 ${first.name} hp ${r(first.hp)} dmg ${r(first.damage)} | enc${last + 1} ${boss.name} hp ${r(boss.hp)} dmg ${r(boss.damage)} | endless enc1 hp ${r(end0.hp)} dmg ${r(end0.damage)}, enc${last + 1} (${e.encounters[last].tier}) ${endBoss.name} hp ${r(endBoss.hp)} dmg ${r(endBoss.damage)}`);
}
const res = Object.entries(monsters).flatMap(([key, m]) => Object.entries(m.resist ?? {}).map(([el, v]) => ({key, name: m.name, el, v: v as number})));
for (const el of ['fire', 'cold', 'lightning']) {
    const top = res.filter(x => x.el === el).sort((a, b) => b.v - a.v).slice(0, 5);
    console.log(el, top.map(x => `${x.name} ${Math.round(100 * x.v)}%`).join(', '));
}
