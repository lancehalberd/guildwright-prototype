// Checks the crafting templates in data/materials.ts and prints every base by tier.
// Rules: every weapon and armor base has a core stat and a role; two bases for the same slot and
// tier with the same core stats differ in role or secondaries. Run: npx tsx scripts/checkMaterials.ts
import {materialOrder, requireMaterial} from '../src/data/materials';
import {baseEntry, isCappedStat, isCoreStat} from '../src/data/stats';
import type {StatKey} from '../src/engine/types';

declare const process: {exitCode: number};

const accessoryTags = new Set(['accessory', 'belt', 'ring', 'amulet']);
const problems: string[] = [];
const seen = new Map<string, string>();
const rows: string[] = [];
for (const key of materialOrder.filter(k => !k.startsWith('premium:'))) {
    const m = requireMaterial(key);
    for (const [tag, base] of Object.entries(m.base ?? {})) {
        if (!base) continue;
        const entries = Object.entries(base.stats) as [StatKey, [number, number] | number][];
        const core = entries.filter(([s]) => isCoreStat(s)).map(([s]) => s).sort();
        const other = entries.filter(([s]) => !isCoreStat(s)).map(([s]) => s).sort();
        const text = entries.map(([s, e]) => { const [v, c] = baseEntry(e); return c === Infinity ? `${s} ${v}` : `${s} ${v}/${c}`; }).join(', ');
        rows.push(`P${m.power} ${key.padEnd(16)} ${tag.padEnd(11)} ${(base.role ?? '-').padEnd(10)} d${base.maxDecorations}  ${text}`);
        if (accessoryTags.has(tag)) continue;
        if (!core.length) problems.push(`${key} ${tag}: no core stat`);
        if (!base.role) problems.push(`${key} ${tag}: no role`);
        for (const [s, e] of entries) {
            if (isCappedStat(s) !== Array.isArray(e)) problems.push(`${key} ${tag}: ${s} should ${isCappedStat(s) ? '' : 'not '}have a cap`);
        }
        const sig = `${tag} P${m.power} ${core.join('+')} ${base.role} ${other.join('+')}`;
        if (seen.has(sig)) problems.push(`${key} and ${seen.get(sig)} are the same kind of ${tag} base: ${sig}`);
        seen.set(sig, key);
    }
}
console.log(rows.join('\n'));
console.log(problems.length ? '\nProblems:\n' + problems.join('\n') : '\nNo problems.');
process.exitCode = problems.length ? 1 : 0;
