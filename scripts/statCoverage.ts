// Which item types can get each stat, from bases (B) and decorations (D), with the lowest power
// that gives it. Run: npx tsx scripts/statCoverage.ts
import {itemTypeOrder} from '../src/data/items';
import {materialOrder, requireMaterial} from '../src/data/materials';
import {statOrder} from '../src/data/stats';
import {getBaseStats, getDecorationStats} from '../src/engine/crafting';

const short: Record<string, string> = {sword: 'swd', axe: 'axe', dagger: 'dag', wand: 'wnd', greatsword: 'gsw', bow: 'bow', staff: 'stf', shield: 'shd', helmet: 'hlm', bodyArmor: 'bdy', gloves: 'glv', boots: 'bts', belt: 'blt', ring: 'rng', amulet: 'amu'};
console.log('stat'.padEnd(26) + itemTypeOrder.map(t => short[t].padEnd(8)).join(''));
for (const stat of statOrder) {
    const cells = itemTypeOrder.map(t => {
        let b = 0, d = 0;
        for (const key of materialOrder) {
            const m = requireMaterial(key);
            if (getBaseStats(m, t)?.stats[stat] !== undefined && (!b || m.power < b)) b = m.power;
            if (getDecorationStats(m, t)?.[stat] !== undefined && (!d || m.power < d)) d = m.power;
        }
        return ((b ? `B${b}` : '') + (d ? `D${d}` : '') || '.').padEnd(8);
    });
    console.log(stat.padEnd(26) + cells.join(''));
}
