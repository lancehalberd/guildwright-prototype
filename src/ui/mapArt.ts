// Map art built into the page: the painted ground, painted scenery sprites, and pixel art for
// each site (keyed by site or quest key, plus 'locked' for a quest not yet open).
const siteFiles = import.meta.glob('../assets/map/sites/*.webp', {eager: true, query: '?inline', import: 'default'}) as Record<string, string>;
const decoFiles = import.meta.glob('../assets/map/deco/*.webp', {eager: true, query: '?inline', import: 'default'}) as Record<string, string>;
import groundUrl from '../assets/map/base.webp?inline';

function byName(files: Record<string, string>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [path, url] of Object.entries(files)) {
        const m = /\/(\w+)\.webp$/.exec(path);
        if (m) out[m[1]] = url;
    }
    return out;
}
const siteUrls = byName(siteFiles);
const decoUrls = byName(decoFiles);

export function siteArtUrl(key: string): string | undefined {
    return siteUrls[key];
}
export function decoUrl(key: string): string | undefined {
    return decoUrls[key];
}
export const mapGroundUrl = groundUrl;

// Where the painted ground sits in map coordinates. Its east edge is sea, so scenery stays west of
// SEA_X.
export const GROUND = {x: -1000, y: -420, w: 2700, h: 1519};
export const SEA_X = 1060;
// Mostly evergreens and oaks; an autumn tree now and then.
export const TREES = ['pine1', 'pine2', 'oak', 'pine3', 'pine4', 'birch', 'pine5', 'oak', 'pine2', 'pine4', 'oak', 'autumn'];
export const BUSHES = ['bush', 'berrybush'];
export const SMALL = ['grass', 'flowers'];
export const ROCKS = ['boulders', 'stump'];
// Hills and peaks in the highlands to the north-east, clear of the sites.
export const MOUNTAINS: {x: number, y: number, key: string, h: number}[] = [
    {x: 700, y: 30, key: 'peaks', h: 54}, {x: 870, y: 10, key: 'snowpeak', h: 60}, {x: 1030, y: 20, key: 'snowpeak', h: 52},
    {x: 640, y: 110, key: 'hill', h: 40}, {x: 880, y: 140, key: 'volcano', h: 44}, {x: 1020, y: 170, key: 'peaks', h: 46},
    {x: 560, y: -40, key: 'hill', h: 42}, {x: 760, y: -60, key: 'snowpeak', h: 56}, {x: 980, y: -70, key: 'peaks', h: 50},
    {x: 300, y: -70, key: 'hill', h: 40}, {x: 1180, y: -20, key: 'mesa', h: 44}, {x: 300, y: 700, key: 'hill', h: 40},
    {x: 940, y: 520, key: 'mesa', h: 40}, {x: 640, y: 690, key: 'hill', h: 38},
];
