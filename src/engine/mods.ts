import type {ModValue} from './types';

// (base + sum of flat) * (1 + sum of increased) * each multiplier.
export function applyMods(base: number, mods: (ModValue | undefined)[]): number {
    let flat = 0, increased = 0, more = 1;
    for (const m of mods) {
        if (!m) continue;
        flat += m.flat ?? 0;
        increased += m.increased ?? 0;
        more *= m.more ?? 1;
    }
    return (base + flat) * (1 + increased) * more;
}

// "1.5× HP", "20% increased HP", "+5 HP". Percent-valued stats never use "increased".
export function formatMod(label: string, m: ModValue): string {
    const parts: string[] = [];
    if (m.more && m.more !== 1) parts.push(`${Math.round(m.more * 100) / 100}× ${label}`);
    if (m.increased) parts.push(`${Math.round(m.increased * 100)}% increased ${label}`);
    if (m.flat) parts.push(`${m.flat > 0 ? '+' : ''}${Math.round(m.flat * 100) / 100} ${label}`);
    return parts.join(', ');
}
