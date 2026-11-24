import type {ItemTypeKey, SlotKey} from '../engine/types';
import {isPremium, plainKey} from '../data/materials';
import {monsters} from '../data/quests';
import {iconVariant, namingMaterial, wornMaterialFor} from '../data/itemIcons';

// Small line icons, drawn on a 24×24 grid in the same style as the map glyphs. Each is fixed markup
// from this file. They use currentColor, so a color class or the surrounding text sets the color.

const P = (d: string) => `<path d="${d}"/>`;
const C = (cx: number, cy: number, r: number) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;

const shapes: Record<string, string> = {
    // ---- Classes ----
    warrior: P('M4 4l11 11M15 15l2.5 2.5M13.5 18.5l5-5M20 4L9 15M9 15l-2.5 2.5M10.5 18.5l-5-5'),
    ranger: P('M7 3c7 3 7 15 0 18M7 3v18M3 12h16M16 9l3 3-3 3'),
    priest: P('M12 4v16M7 9h10') + C(12, 9, 6.5),
    reaver: P('M6 21 16 6M12.5 4.5c3-1.5 7.5 0 7.5 5.5-3-1.2-5.5-1.5-7.5-2.8z'),
    spellblade: P('M4 20l9-9M11 9l4 4M13 11l5-5 1.5-.5-.5 1.5-5 5M19 15v5M16.5 17.5h5'),
    battlemage: P('M5 21l9-9M14 12l2-2M18 3l.6 1.8L20.5 5.5l-1.9.7L18 8l-.6-1.8-1.9-.7 1.9-.7z') + C(16.5, 8.5, 2.5),
    monk: P('M7 11V8a2 2 0 0 1 4 0v2M11 10V7a2 2 0 0 1 4 0v3M15 10a2 2 0 0 1 4 0v4c0 4-3 7-7 7h-1c-3 0-5-2-5-5v-3a2 2 0 0 1 4-1v2'),
    ninja: P('M12 2.5l2 7.5 7.5 2-7.5 2-2 7.5-2-7.5-7.5-2 7.5-2z') + C(12, 12, 1.5),
    wizard: P('M3 20h18M6.5 20 12 3l5.5 17M9 13.5h6M15 6l1-2 1 2'),
    gladiator: P('M9 4l5 2v4c0 4-2.5 6-5 7.5C6.5 16 4 14 4 10V6zM14 15l6-6M18 7l2 2M15.5 18.5l-2-2'),
    saboteur: C(10, 14, 6) + P('M14.5 9.5 18 6M18 6l1.5-1.5M20 3v2M22 4.5h-2'),
    bloodmage: P('M12 3c-3 5-6 8-6 11a6 6 0 0 0 12 0c0-3-3-6-6-11zM9.5 14a2.5 2.5 0 0 0 2.5 2.5'),
    berserker: P('M5 21 15 6M11.5 4.5c3-1.5 7 0 7 5-3-1-5-1.5-7-2.5zM19 21 9 6M12.5 4.5c-3-1.5-7 0-7 5 3-1 5-1.5 7-2.5z'),
    marksman: C(12, 12, 7) + C(12, 12, 1.5) + P('M12 2v5M12 17v5M2 12h5M17 12h5'),
    warlock: P('M3 12c3-5 15-5 18 0-3 5-15 5-18 0z') + C(12, 12, 2.5),
    champion: P('M4 19h16M4 19 3 8l5 4 4-7 4 7 5-4-1 11'),
    vagabond: P('M4 21 17 8M15.5 3.5c3 0 5 2 5 4.5 0 2-2 3.5-4 3.5s-4-1.5-4-4 1-4 3-4z'),

    // ---- Item types ----
    sword: P('M5 19 17 7l2-2v2L7 19M7.5 13.5l3 3M3.5 20.5l2-2'),
    axe: P('M6 21 16 6M12.5 4.5c3-1.5 7.5 0 7.5 5.5-3-1.2-5.5-1.5-7.5-2.8z'),
    dagger: P('M7 17l7-7 2-1-1 2-7 7M8 14l2 2M4.5 19.5l2-2'),
    wand: P('M4 20 14 10M17 3v4M15 5h4M19 9.5v2M18 10.5h2'),
    greatsword: P('M6 18 18 6l2.5-2.5v2.5L8 19M4 13.5l6.5 6.5M3 21l2.5-2.5'),
    bow: P('M8 3c7 3 7 15 0 18M8 3v18'),
    staff: P('M6 21 14 9') + C(16, 6.5, 3),
    shield: P('M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z'),
    helmet: P('M5 16v-4a7 7 0 0 1 14 0v4M4 16h16M9 16v4M15 16v4'),
    bodyArmor: P('M8 4 4 7l2 5 2-1v9h8v-9l2 1 2-5-4-3-2 2h-4z'),
    gloves: P('M8 21v-6l-2-4V7a1 1 0 0 1 2 0v3M8 9V4.5a1 1 0 0 1 2 0V9M10 8.5V3.5a1 1 0 0 1 2 0V9M12 9V5a1 1 0 0 1 2 0v6l2-2a1.4 1.4 0 0 1 2 2l-4 5v5'),
    boots: P('M8 3h5v9l5 2a2.5 2.5 0 0 1 2 2.5V20H6V3zM6 17h14'),
    belt: P('M3 10h18v4H3zM10 8.5h4v7h-4z'),
    ring: C(12, 14.5, 5.5) + P('M10 6.5 12 4l2 2.5-2 2z'),
    amulet: P('M6 3c0 6 3 9 6 9s6-3 6-9M12 12l3 4-3 5-3-5z'),

    // ---- Material kinds ----
    ore: P('M4 17 7 9l6-4 6 5 1 7-6 3H8zM7 9l5 3 1-7M12 12l8 5M12 12l-4 8'),
    ingot: P('M3 17l3-6h12l3 6zM6 11l2-3h8l2 3'),
    hide: P('M6 4c2 1 4 1 6 0 2 1 4 1 6 0l-1 5 2 4-3 1-1 6c-2-1-4-1-6 0l-1-6-3-1 2-4z'),
    cloth: P('M6 4h12M6 20h12M8 4v16M16 4v16M8 8l8 3M8 12l8 3'),
    plant: P('M5 19C5 10 10 5 19 5c0 9-5 14-14 14zM5 19l8-8'),
    log: P('M5 8h11M5 17h11M5 8v9') + C(16, 12.5, 4.5) + C(16, 12.5, 1.5),
    gem: P('M6 4h12l3 5-9 11L3 9zM3 9h18M9 4l3 5 3-5'),
    shard: P('M12 2l5 8-5 12-5-12zM7 10h10'),
    feather: P('M19 4C11 4 6 10 6 18l-2 2M6 18c6 0 11-4 13-14M9 15h5M11 12h5'),
    fang: P('M6 4h12c0 7-3 13-6 16C9 17 6 11 6 4zM9 4c0 5 1.5 9 3 11'),
    bone: P('M8 16 16 8M6.5 18.5a2 2 0 1 1-1.5-3.5 2 2 0 1 1 3.5-1.5M17.5 5.5a2 2 0 1 1 1.5 3.5 2 2 0 1 1-3.5 1.5'),
    flask: P('M10 3h4M10 3v5L5 18a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-10V3M7 15h10'),
    scale: P('M4 9c2-3 6-3 8 0 2-3 6-3 8 0M4 9c0 5 4 9 8 11 4-2 8-6 8-11M8 13c1.3 1.3 2.7 1.3 4 0 1.3 1.3 2.7 1.3 4 0'),
    heart: P('M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z'),
    crown: P('M4 18h16M4 18 3 8l5 4 4-7 4 7 5-4-1 10'),
    pearl: C(12, 12, 7) + P('M9 9a4 4 0 0 1 3-1.5'),
    eye: P('M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z') + C(12, 12, 3),
    key: C(8, 12, 4) + P('M12 12h9M18 12v3M21 12v4'),
    flame: P('M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-6 1 2 2 3 3 3 0-3-1-5 0-8z'),

    // ---- Monster families ----
    beast: P('M6.5 16.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5c0 2.5-2.5 3.5-5.5 3.5s-5.5-1-5.5-3.5z') + C(6, 10, 1.6) + C(9.5, 6.5, 1.6) + C(14.5, 6.5, 1.6) + C(18, 10, 1.6),
    humanoid: P('M12 3a5 5 0 0 1 5 5v3H7V8a5 5 0 0 1 5-5zM7 11h10M9.5 11v3.5M14.5 11v3.5M5 21c1-4 3.5-6 7-6s6 2 7 6'),
    undead: P('M12 3a7 7 0 0 0-7 7c0 3 1 4 2 5v3h10v-3c1-1 2-2 2-5a7 7 0 0 0-7-7zM10 18v3M14 18v3') + C(9.2, 11, 1.6) + C(14.8, 11, 1.6),
    construct: P('M7 3h10v6H7zM5 9h14v8H5zM8 17v4M16 17v4M10 6h.01M14 6h.01'),
    wisp: P('M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-6 1 2 2 3 3 3 0-3-1-5 0-8z'),
    spider: C(12, 13, 3.2) + C(12, 7.5, 2) + P('M9 11 4 7M9 13H3M9 15l-5 4M15 11l5-4M15 13h6M15 15l5 4'),
    flyer: P('M3 13c4-6 9-7 9-7s5 1 9 7c-3-1-5 0-6 2-1-2-2-2-3-2s-2 0-3 2c-1-2-3-3-6-2z'),
    serpent: P('M3 18c3 0 3-4 6-4s3 4 6 4 3-6 2-9-3-4-5-4M17 5h2'),
};

// One SVG element per call.
export function icon(name: string, className = ''): SVGSVGElement {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('viewBox', '0 0 24 24');
    el.setAttribute('class', 'ic' + (className ? ' ' + className : ''));
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = shapes[name] ?? shapes.gem;
    return el;
}

export function classIcon(classKey: string, className = ''): SVGSVGElement {
    return icon(shapes[classKey] ? classKey : 'warrior', className);
}

export function itemTypeIcon(itemType: ItemTypeKey, className = ''): SVGSVGElement {
    return icon(itemType, className);
}

// Painted item type icons (assets/itemTypes/<key>.webp) for the bench's type picker; the line icon when missing.
const itemTypeArtUrls: Record<string, string> = {};
for (const [path, url] of Object.entries(import.meta.glob('../assets/itemTypes/*.webp', {eager: true, query: '?inline', import: 'default'}) as Record<string, string>)) {
    const m = /\/(\w+)\.webp$/.exec(path);
    if (m) itemTypeArtUrls[m[1]] = url;
}
// Variant pictures (assets/itemIcons/<variant>.webp, see data/itemIcons.ts) for crafted items.
const variantArtUrls: Record<string, string> = {};
for (const [path, url] of Object.entries(import.meta.glob('../assets/itemIcons/*.webp', {eager: true, query: '?inline', import: 'default'}) as Record<string, string>)) {
    const m = /\/([\w-]+)\.webp$/.exec(path);
    if (m) variantArtUrls[m[1]] = url;
}
// A crafted (or previewed, or shop) item's picture: the naming material's own art when that material
// is worn directly as this type, else the variant for its tier and core stat, else the type's picture.
export function itemArt(itemType: ItemTypeKey, baseKeys: string[] | undefined, className = ''): Element {
    const naming = baseKeys ? namingMaterial(itemType, baseKeys) : undefined;
    if (naming && wornMaterialFor(itemType, naming)) return materialIcon(naming, 'typeart' + (className ? ' ' + className : ''));
    const url = naming ? variantArtUrls[iconVariant(itemType, naming)] : undefined;
    if (!url) return itemTypeArt(itemType, className);
    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.className = 'ic typeart' + (className ? ' ' + className : '');
    img.setAttribute('aria-hidden', 'true');
    return img;
}
export function itemTypeArt(itemType: ItemTypeKey, className = ''): Element {
    const art = itemTypeArtUrls[itemType];
    if (!art) return icon(itemType, className);
    const img = document.createElement('img');
    img.src = art;
    img.alt = '';
    img.className = 'ic typeart' + (className ? ' ' + className : '');
    img.setAttribute('aria-hidden', 'true');
    return img;
}

// Empty slots show what goes there; the main hand a sword, the off hand a shield.
const slotShapes: Record<SlotKey, string> = {
    mainHand: 'sword', offHand: 'shield', head: 'helmet', body: 'bodyArmor', gloves: 'gloves', boots: 'boots',
    belt: 'belt', amulet: 'amulet', ring1: 'ring', ring2: 'ring',
};
export function slotIcon(slot: SlotKey, className = ''): SVGSVGElement {
    return icon(slotShapes[slot], className);
}

// Materials: a kind (the shape) and a color. Colors are CSS classes (.c-iron, .c-fire...).
const materialLooks: Record<string, [string, string]> = {
    rubyShard: ['shard', 'blood'], ruby: ['gem', 'blood'], flawlessRuby: ['gem', 'blood'], radiantRuby: ['gem', 'blood'], sapphireShard: ['shard', 'cold'], sapphire: ['gem', 'cold'], flawlessSapphire: ['gem', 'cold'], radiantSapphire: ['gem', 'cold'], emeraldShard: ['shard', 'green'], emerald: ['gem', 'green'], flawlessEmerald: ['gem', 'green'], radiantEmerald: ['gem', 'green'], roughTigerEye: ['shard', 'gold'], tigerEye: ['gem', 'gold'], polishedTigerEye: ['gem', 'gold'], brilliantTigerEye: ['gem', 'gold'], roughSunstone: ['shard', 'fire'], sunstone: ['gem', 'fire'], polishedSunstone: ['gem', 'fire'], brilliantSunstone: ['gem', 'fire'], roughOpal: ['shard', 'silver'], opal: ['gem', 'silver'], polishedOpal: ['gem', 'silver'], brilliantOpal: ['gem', 'silver'],
    wood: ['log', 'wood'], copperOre: ['ore', 'copper'], roughHide: ['hide', 'leather'], boneShard: ['bone', 'bone'],
    flint: ['shard', 'stone'], hawkFeather: ['feather', 'leather'], healingMoss: ['plant', 'green'], sinew: ['cloth', 'blood'],
    ironOre: ['ore', 'iron'], tannedLeather: ['hide', 'leather'], wolfFang: ['fang', 'bone'], thornvine: ['plant', 'green'],
    whetstone: ['ore', 'stone'], trollBlood: ['flask', 'blood'], silverOre: ['ore', 'silver'], moonstone: ['gem', 'arcane'],
    bloodstone: ['gem', 'blood'], amber: ['gem', 'gold'], steelIngot: ['ingot', 'iron'], trollHide: ['hide', 'green'],
    garnet: ['gem', 'blood'], spiderSilk: ['cloth', 'silver'], ancientBone: ['bone', 'bone'], ritualAsh: ['flask', 'fire'],
    mithril: ['ingot', 'silver'], broodfang: ['fang', 'blood'], brimstone: ['ore', 'fire'], marshReed: ['plant', 'green'],
    thunderhorn: ['fang', 'lightning'], quicksilver: ['flask', 'silver'], runedSlate: ['ore', 'arcane'], wyvernLeather: ['hide', 'leather'],
    skyshard: ['shard', 'gold'], bogIron: ['ingot', 'iron'], leechSac: ['flask', 'blood'], eelskin: ['hide', 'cold'],
    peatmoss: ['plant', 'green'], hagstone: ['ore', 'stone'], drownedSteel: ['ingot', 'cold'], galeFeather: ['feather', 'cold'],
    stormhide: ['hide', 'lightning'], cragGranite: ['ore', 'stone'], ozoneShard: ['shard', 'lightning'], rocPlume: ['feather', 'gold'],
    thunderstone: ['ore', 'lightning'], thornheart: ['heart', 'green'], wolfkingPelt: ['hide', 'silver'], deepfireCore: ['heart', 'fire'],
    golemHeart: ['heart', 'stone'], obsidian: ['shard', 'stone'], salamanderScale: ['scale', 'fire'], rimecoal: ['ore', 'cold'],
    cinderwool: ['cloth', 'fire'], wyrmScale: ['scale', 'fire'], glacialHeart: ['heart', 'cold'], phoenixFeather: ['feather', 'fire'],
    blackPearl: ['pearl', 'arcane'], tempestQuill: ['feather', 'lightning'], riftGlass: ['shard', 'rift'], riftsteel: ['ingot', 'rift'],
    prismShard: ['gem', 'rift'], voidSilk: ['cloth', 'arcane'], wardenStone: ['ore', 'arcane'], riftEssence: ['flask', 'rift'],
    wardenPlate: ['scale', 'silver'], prismaticEye: ['eye', 'rift'], briarcrown: ['crown', 'green'], stormveinHeart: ['heart', 'lightning'],
    wyrmqueenEmber: ['flame', 'fire'], mireheart: ['heart', 'cold'], tempestTalon: ['fang', 'lightning'], riftheart: ['heart', 'rift'],
    hiveChitin: ['scale', 'gold'], waspWing: ['feather', 'gold'], hiveWax: ['flask', 'gold'], mantisScythe: ['fang', 'green'], amberResin: ['gem', 'gold'],
    stingerVenom: ['flask', 'green'], royalJelly: ['pearl', 'gold'], queenCarapace: ['scale', 'green'], hiveheart: ['heart', 'gold'], amberKey: ['key', 'gold'],
    graveIron: ['ingot', 'iron'], shroudCloth: ['cloth', 'bone'], boneMarrow: ['bone', 'blood'], wraithEssence: ['flask', 'arcane'], barrowSteel: ['ingot', 'silver'],
    deathcap: ['plant', 'bone'], soulGem: ['gem', 'arcane'], cryptPlate: ['scale', 'iron'], paleCrown: ['crown', 'bone'], graveKey: ['key', 'bone'],
    brassPlate: ['ingot', 'gold'], cogwheel: ['ore', 'copper'], coolingOil: ['flask', 'iron'], temperedSteel: ['ingot', 'iron'], mainspring: ['ring', 'copper'],
    slagGlass: ['shard', 'fire'], titanAlloy: ['ingot', 'fire'], furnaceCore: ['flame', 'fire'], forgeheart: ['heart', 'fire'], cogKey: ['key', 'copper'],
    stormIron: ['ingot', 'lightning'], skyFeather: ['feather', 'lightning'], galeSilk: ['cloth', 'silver'], eagleTalon: ['fang', 'leather'], thunderGlass: ['shard', 'lightning'],
    windCrystal: ['gem', 'silver'], sovereignPlume: ['feather', 'gold'], skyforged: ['ingot', 'silver'], stormcrown: ['crown', 'lightning'], galeKey: ['key', 'lightning'],
    oracleEye: ['eye', 'arcane'], veilSilk: ['cloth', 'arcane'], sanctumShard: ['shard', 'rift'], throneStone: ['ore', 'stone'], voidIron: ['ingot', 'rift'], starSilk: ['cloth', 'arcane'],
    shatterglass: ['shard', 'arcane'], kingsSteel: ['ingot', 'gold'], emberOfAges: ['flame', 'fire'], crownShard: ['crown', 'gold'], riftmetal: ['ingot', 'arcane'], throneheart: ['heart', 'rift'],
};
// Materials with pixel art show it; the rest keep their line icon in the material's color.
const materialArt: Record<string, string> = {};
for (const [path, url] of Object.entries(import.meta.glob('../assets/materials/*.webp', {eager: true, query: '?inline', import: 'default'}) as Record<string, string>)) {
    const m = /\/(\w+)\.webp$/.exec(path);
    if (m) materialArt[m[1]] = url;
}
export function materialIcon(key: string, className = ''): Element {
    const [shape, color] = materialLooks[plainKey(key)] ?? ['gem', 'stone'];
    const cls = `c-${color}${isPremium(key) ? ' premium' : ''}${className ? ' ' + className : ''}`;
    const art = materialArt[plainKey(key)];
    if (art) {
        const img = document.createElement('img');
        img.src = art;
        img.alt = '';
        img.className = 'ic matart ' + cls;
        img.setAttribute('aria-hidden', 'true');
        return img;
    }
    return icon(shape, cls);
}

// Monsters: a family shape, colored by the element they hit with most (if any is at least 40%).
const monsterFamily: Record<string, string> = {
    rat: 'beast', goblin: 'humanoid', wolf: 'beast', bandit: 'humanoid', goblinBrute: 'humanoid', alphaWolf: 'beast',
    banditCaptain: 'humanoid', troll: 'humanoid', kobold: 'humanoid', caveSpider: 'spider', skeleton: 'undead', caveBat: 'flyer',
    koboldShaman: 'humanoid', emberMote: 'wisp', ashImp: 'wisp', cinderHound: 'beast', obsidianGolem: 'construct', salamander: 'serpent',
    flameKnight: 'humanoid', ashenWyrm: 'serpent', oreGolem: 'construct', broodmother: 'spider', bogLeech: 'serpent', marshWisp: 'wisp',
    mireStalker: 'beast', frostToad: 'beast', drownedKnight: 'undead', bogHag: 'humanoid', sparkWisp: 'wisp', stormHarpy: 'flyer',
    cragLynx: 'humanoid', thunderRam: 'beast', stormcaller: 'humanoid', thunderbird: 'flyer', riftMote: 'wisp', riftHound: 'beast',
    shardGolem: 'construct', emberRevenant: 'undead', frostRevenant: 'undead', stormRevenant: 'undead', riftWarden: 'humanoid',
    briarKing: 'humanoid', stormveinColossus: 'construct', wyrmqueen: 'serpent', mireMother: 'humanoid', riftTyrant: 'wisp', tempestRoc: 'flyer',
    swarmling: 'flyer', hiveDrone: 'flyer', acidSpitter: 'spider', thornMantis: 'spider', amberBeetle: 'spider', broodGuard: 'spider', hiveQueen: 'flyer',
    boneThrall: 'undead', cryptGhoul: 'undead', wailingShade: 'wisp', barrowKnight: 'undead', plagueBearer: 'undead', lichAcolyte: 'undead', paleLich: 'undead',
    cogSpider: 'spider', brassSentry: 'construct', steamHound: 'construct', smelterGolem: 'construct', clockworkKnight: 'construct', forgeWarden: 'construct', forgeTitan: 'construct',
    galeKestrel: 'flyer', skyHarpy: 'flyer', stormHawk: 'flyer', cloudSerpent: 'serpent', thunderEagle: 'flyer', windWarden: 'humanoid', skySovereign: 'flyer',
    veiledOracle: 'wisp', riftStalker: 'beast', starfallMote: 'wisp', voidWraith: 'undead', throneSentinel: 'construct', shatteredKnight: 'humanoid', emberColossus: 'construct', shatteredKing: 'humanoid', kingShard: 'construct',
    amberEmpress: 'flyer', duskRegent: 'undead', ironOverseer: 'construct', stormHerald: 'flyer', pretender: 'humanoid',
};
export function monsterColor(key: string): string {
    const types = monsters[key]?.damageTypes ?? {physical: 1};
    const elemental = (['fire', 'cold', 'lightning'] as const).filter(e => (types[e] ?? 0) >= 0.25);
    if (elemental.length >= 3) return 'rift';
    const best = elemental.sort((a, b) => (types[b] ?? 0) - (types[a] ?? 0))[0];
    return best && (types[best] ?? 0) >= 0.4 ? best : 'plain';
}
export function monsterIcon(key: string, className = ''): SVGSVGElement {
    return icon(monsterFamily[key] ?? 'beast', `c-${monsterColor(key)}${className ? ' ' + className : ''}`);
}
