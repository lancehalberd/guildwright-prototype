// Lists every material that gives a resistance to rings, amulets or belts, as a base or a
// decoration, with its power. Run: npx tsx scripts/resistSources.ts
import {materialOrder, requireMaterial} from '../src/data/materials';
import {getBaseStats, getDecorationStats} from '../src/engine/crafting';

const resists = ['fireResist', 'coldResist', 'lightningResist', 'allResist'];
for (const t of ['ring', 'amulet', 'belt'] as const) {
    console.log(`== ${t}`);
    for (const r of resists) {
        const rows: string[] = [];
        for (const key of materialOrder) {
            const m = requireMaterial(key);
            if (m.premium) continue;
            const b = getBaseStats(m, t)?.stats[r as never];
            const d = getDecorationStats(m, t)?.[r as never];
            if (b !== undefined) rows.push(`B P${m.power} ${m.name} ${JSON.stringify(b)}`);
            if (d !== undefined) rows.push(`D P${m.power} ${m.name} ${JSON.stringify(d)}`);
        }
        console.log(`  ${r} (${rows.length})`);
        for (const row of rows) console.log('    ' + row);
    }
}
