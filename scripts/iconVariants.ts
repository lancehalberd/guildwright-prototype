// Lists, for each item type, the materials that name items of that type, with the icon variant each
// name would get: tier band (from the naming material's power) and its base's core defense or
// weapon element. Run: npx tsx scripts/iconVariants.ts [--detail]
import {materialOrder, requireMaterial} from '../src/data/materials';
import {itemTypeOrder} from '../src/data/items';
import {getBaseStats} from '../src/engine/crafting';
import {iconVariant} from '../src/data/itemIcons';

declare const process: {argv: string[]};
const detail = process.argv.includes('--detail');
const counts: Record<string, number> = {};
for (const t of itemTypeOrder) {
    for (const k of materialOrder) {
        const m = requireMaterial(k);
        const base = getBaseStats(m, t);
        if (!base) continue;
        const v = iconVariant(t, k);
        counts[v] = (counts[v] ?? 0) + 1;
        if (detail) console.log(t.padEnd(11), `P${m.power}`.padEnd(4), m.name.padEnd(22), v.padEnd(26), JSON.stringify(base.stats));
    }
}
console.log(Object.entries(counts).sort().map(([k, n]) => `${k} ${n}`).join('\n'));
console.log('variants', Object.keys(counts).length);
