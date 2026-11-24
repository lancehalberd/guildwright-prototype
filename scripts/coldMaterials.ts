// Cold-themed materials (any cold stat anywhere) and what they give rings and amulets.
// Run: npx tsx scripts/coldMaterials.ts
import {materialOrder, requireMaterial} from '../src/data/materials';
import {getBaseStats, getDecorationStats} from '../src/engine/crafting';

for (const key of materialOrder) {
    const m = requireMaterial(key);
    if (m.premium) continue;
    const text = JSON.stringify(m);
    if (!/cold|Cold|frost|Frost|ice|Ice|snow|Snow/.test(text)) continue;
    const r = getBaseStats(m, 'ring'), a = getBaseStats(m, 'amulet');
    console.log(`P${m.power} ${key} | ring B ${JSON.stringify(r?.stats ?? null)} D ${JSON.stringify(getDecorationStats(m, 'ring') ?? null)} | amulet B ${JSON.stringify(a?.stats ?? null)} D ${JSON.stringify(getDecorationStats(m, 'amulet') ?? null)} | equip ${m.equip?.itemType ?? '-'}`);
}
