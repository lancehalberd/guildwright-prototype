// Battle view backgrounds: one diorama per quest plus the guild bedroom for resting, inlined like the
// monster sprites. Drawn on the arena's pixel grid, cropped to the diorama and 540 pixels wide, so at 2x and 3x its
// sides run past the view's edges and the battlefield gets the room.
const files = import.meta.glob('../assets/backgrounds/*.webp', {eager: true, query: '?inline', import: 'default'}) as Record<string, string>;
const urls: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
    const m = /bg-(\w+)\.webp$/.exec(path);
    if (m) urls[m[1]] = url;
}
export function backgroundUrl(key: string): string | undefined {
    return urls[key];
}
// Arena pixels per background pixel: 1 puts the background on the sprites' pixel grid.
export const BG_PIXEL = 1;
// Where the fighters stand in each background, as a share of its height: this row lines up with the
// arena's middle. Unlisted backgrounds use the default.
const floors: Record<string, number> = {brambleRoad: 0.56, guild: 0.7, hollowMines: 0.54,
    ashenPeaks: 0.56, sunkenMarsh: 0.55, thunderheadCrags: 0.48, sunderedRift: 0.52,
    amberHive: 0.5, duskgraveNecropolis: 0.51, ironboundFoundry: 0.55, skyspireAerie: 0.46, shatteredThrone: 0.57};
export function backgroundFloor(key: string): number {
    return floors[key] ?? 0.6;
}
