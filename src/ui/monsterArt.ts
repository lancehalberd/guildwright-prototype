import {spriteHeadroom} from './spriteBounds';
// Monster and boss sprites: pixel art built into the page, keyed by monster key. Monsters
// without art keep their vector family icon.
const files = import.meta.glob('../assets/monsters/*.webp', {eager: true, query: '?inline', import: 'default'}) as Record<string, string>;
const urls: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
    const m = /monster-(\w+)\.webp$/.exec(path);
    if (m) urls[m[1]] = url;
}

export function monsterArtUrl(key: string): string | undefined {
    return urls[key];
}

// Bosses (every quest's rare final boss, the ambition bosses and the rite boss) are drawn at 192px,
// twice the 96px of ordinary monsters. Sprites always show at their native size.
const BOSSES = new Set(['troll', 'briarKing', 'broodmother', 'stormveinColossus', 'ashenWyrm', 'wyrmqueen', 'bogHag', 'mireMother',
    'thunderbird', 'tempestRoc', 'riftWarden', 'riftTyrant', 'veiledOracle', 'hiveQueen', 'amberEmpress', 'paleLich', 'duskRegent',
    'forgeTitan', 'ironOverseer', 'skySovereign', 'stormHerald', 'shatteredKing', 'pretender']);
// Empty rows above a monster sprite's head (sprites stand on their bottom edge).
export function monsterHeadroom(key: string): number {
    return spriteHeadroom[`monster-${key}`] ?? 0;
}
export function monsterArtSize(key: string): number {
    return BOSSES.has(key) ? 192 : 96;
}

// The sprite size the fight view uses for an encounter of n monsters (see .avatar.sprite in style.css).
export function spriteSize(n: number): number {
    return n > 5 ? 24 : n >= 3 ? 48 : n === 2 ? 64 : 96;
}

// How a line-up is laid out: in a featured fight (a rare encounter or a boss) the first monster is
// the boss and keeps full size, apart from its minions; otherwise everyone shares the space.
export function spriteLayout(keys: string[], featured: boolean): {lead: boolean, size: number}[] {
    const n = keys.length;
    if (!featured || n < 2 || keys.every(k => k === keys[0])) {
        return keys.map(() => ({lead: false, size: spriteSize(n)}));
    }
    const leads = keys.filter(k => k === keys[0]).length;
    const leadSize = n > 5 ? 48 : leads > 1 ? 64 : 96;
    const minionSize = Math.min(48, spriteSize(n - leads));
    return keys.map(k => k === keys[0] ? {lead: true, size: leadSize} : {lead: false, size: minionSize});
}
// spriteLayout, with monsters that have art at their native size (they overlap instead of shrinking).
export function fightLayout(keys: string[], featured: boolean): {lead: boolean, size: number}[] {
    return spriteLayout(keys, featured).map((l, i) => monsterArtUrl(keys[i]) ? {...l, size: monsterArtSize(keys[i])} : l);
}
