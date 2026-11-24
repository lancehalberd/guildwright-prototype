// Registry of attack animations (on the attacker) and hit effects (on the target). The art
// preview lists these, so a new entry shows up there to test. Fights use 'auto' and 'flash'.
import type {AbilityEffect} from '../engine/types';

export type Side = 'hero' | 'monster';

export interface AttackAnim {
    key: string;
    label: string;
    // Whether this attacker can play it (the swing needs a strip drawn for the hero's sprite).
    available: (attacker: HTMLElement, side: Side) => boolean;
    // The class that plays it on the attacker, and when the blow lands (ms at 1x).
    cls: string | ((attacker: HTMLElement, side: Side) => string | null);
    impact: number;
}

export interface HitEffect {
    key: string;
    label: string;
    // A class restarted on the target, or an overlay drawn over it in the floaters layer.
    cls?: string;
    overlay?: string;
    // An ability effect strip (assets/fx) played over the target.
    fx?: AbilityEffect;
}

const hasSwing = (el: HTMLElement) => !!el.querySelector('.swing');

export const ATTACK_ANIMS: AttackAnim[] = [
    {key: 'auto', label: 'Auto (as in a fight)', available: () => true, cls: el => hasSwing(el) ? 'swinging' : 'lunge', impact: 110},
    {key: 'swing', label: 'Sword swing strip', available: (el, side) => side === 'hero' && hasSwing(el), cls: 'swinging', impact: 120},
    {key: 'lunge', label: 'Lunge', available: () => true, cls: 'lunge', impact: 80},
    {key: 'none', label: 'None (hit only)', available: () => true, cls: () => null, impact: 0},
];

export const HIT_EFFECTS: HitEffect[] = [
    {key: 'auto', label: "Auto (the ability's own effect)"},
    {key: 'flash', label: 'Flash only', cls: 'struck'},
    {key: 'shake', label: 'Flash + shake', cls: 'struck shaking'},
    {key: 'slash', label: 'Flash + slash mark', cls: 'struck', overlay: 'fx-slash'},
    {key: 'burst', label: 'Flash + impact burst', cls: 'struck', overlay: 'fx-burst'},
    {key: 'fx-fire', label: 'Fire burst sprite', cls: 'struck', fx: 'fire'},
    {key: 'fx-ice', label: 'Frost shard sprite', cls: 'struck', fx: 'ice'},
    {key: 'fx-lightning', label: 'Lightning bolt sprite', cls: 'struck', fx: 'lightning'},
    {key: 'fx-earth', label: 'Rock slam sprite', cls: 'struck', fx: 'earth'},
    {key: 'fx-chill', label: 'Chill aura sprite', cls: 'struck', fx: 'chill'},
    {key: 'fx-kindle', label: 'Kindle aura sprite', cls: 'struck', fx: 'kindle'},
    {key: 'fx-static', label: 'Static aura sprite', cls: 'struck', fx: 'static'},
    {key: 'fx-scratch', label: 'Claw scratch sprite', cls: 'struck', fx: 'scratch'},
    {key: 'fx-bite', label: 'Bite sprite', cls: 'struck', fx: 'bite'},
    {key: 'fx-slash', label: 'Blade slash sprite', cls: 'struck', fx: 'slash'},
    {key: 'fx-stab', label: 'Stab sprite', cls: 'struck', fx: 'stab'},
    {key: 'fx-smash', label: 'Smash impact sprite', cls: 'struck', fx: 'smash'},
    {key: 'fx-lash', label: 'Whip lash sprite', cls: 'struck', fx: 'lash'},
    {key: 'fx-sting', label: 'Sting sprite', cls: 'struck', fx: 'sting'},
    {key: 'fx-talon', label: 'Talon rake sprite', cls: 'struck', fx: 'talon'},
    {key: 'fx-slam', label: 'Body slam sprite', cls: 'struck', fx: 'slam'},
    {key: 'fx-throw', label: 'Thrown bone sprite', cls: 'struck', fx: 'throw'},
    {key: 'fx-vines', label: 'Root vines sprite', cls: 'struck', fx: 'vines'},
    {key: 'fx-web', label: 'Web shot sprite', cls: 'struck', fx: 'web'},
    {key: 'fx-sonar', label: 'Sonar screech sprite', cls: 'struck', fx: 'sonar'},
    {key: 'fx-heal', label: 'Healing sprite', cls: 'struck', fx: 'heal'},
    {key: 'fx-hatch', label: 'Egg hatching sprite', cls: 'struck', fx: 'hatch'},
    {key: 'fx-curse', label: 'Weakening curse sprite', cls: 'struck', fx: 'curse'},
    {key: 'fx-dust', label: 'Blinding dust sprite', cls: 'struck', fx: 'dust'},
    {key: 'fx-bleed', label: 'Bleeding sprite', cls: 'struck', fx: 'bleed'},
    {key: 'fx-drain', label: 'Life drain sprite', cls: 'struck', fx: 'drain'},
    {key: 'fx-rally', label: 'War cry sprite', cls: 'struck', fx: 'rally'},
    {key: 'fx-water', label: 'Drowning grasp sprite', cls: 'struck', fx: 'water'},
    {key: 'fx-gust', label: 'Wing buffet sprite', cls: 'struck', fx: 'gust'},
    {key: 'fx-thump', label: 'Punch thump sprite', cls: 'struck', fx: 'thump'},
    {key: 'fx-shield', label: 'Shield bubble sprite', cls: 'struck', fx: 'shield'},
    {key: 'fx-acid', label: 'Acid splash sprite', cls: 'struck', fx: 'acid'},
    {key: 'fx-chains', label: 'Chains sprite', cls: 'struck', fx: 'chains'},
    {key: 'fx-steam', label: 'Steam burst sprite', cls: 'struck', fx: 'steam'},
    {key: 'fx-prism', label: 'Prismatic beam sprite', cls: 'struck', fx: 'prism'},
    {key: 'fx-starfall', label: 'Star rain sprite', cls: 'struck', fx: 'starfall'},
    {key: 'fx-shimmer', label: 'Phase shimmer sprite', cls: 'struck', fx: 'shimmer'},
    {key: 'fx-mirror', label: 'Mirror shimmer sprite', cls: 'struck', fx: 'mirror'},
    {key: 'fx-dive', label: 'Dive streak sprite', cls: 'struck', fx: 'dive'},
    {key: 'fx-poison', label: 'Poison cloud sprite', cls: 'struck', fx: 'poison'},
    {key: 'none', label: 'None'},
];

// Ability effect strips: four 112px frames, played over the target.
const fxFiles = import.meta.glob('../assets/fx/fx-*.webp', {eager: true, query: '?inline', import: 'default'}) as Record<string, string>;
export const FX_URLS: Record<string, string> = {};
for (const [path, url] of Object.entries(fxFiles)) {
    const m = /fx-(\w+)\.webp$/.exec(path);
    if (m) FX_URLS[m[1]] = url;
}

// Where each strip sits on its target: `feet` effects put their ground line (`ground` px down the
// 112px frame) on the target's feet; the rest put frame row `ground` on the middle of its body.
export const FX_ANCHORS: Record<string, {feet: boolean, ground: number}> = {
    fire: {feet: false, ground: 52},
    ice: {feet: true, ground: 81},
    lightning: {feet: true, ground: 93},
    earth: {feet: true, ground: 80},
    chill: {feet: true, ground: 90},
    kindle: {feet: true, ground: 86},
    static: {feet: true, ground: 85},
    chains: {feet: true, ground: 102},
    thump: {feet: false, ground: 52},
    shield: {feet: false, ground: 54},
    acid: {feet: false, ground: 47},
    steam: {feet: false, ground: 50},
    prism: {feet: false, ground: 45},
    starfall: {feet: false, ground: 49},
    shimmer: {feet: false, ground: 55},
    mirror: {feet: false, ground: 52},
    dive: {feet: false, ground: 50},
    poison: {feet: false, ground: 50},
    slam: {feet: true, ground: 104},
    vines: {feet: true, ground: 93},
    heal: {feet: true, ground: 97},
    hatch: {feet: true, ground: 86},
    rally: {feet: true, ground: 95},
    water: {feet: true, ground: 97},
    scratch: {feet: false, ground: 53},
    bite: {feet: false, ground: 55},
    slash: {feet: false, ground: 50},
    stab: {feet: false, ground: 51},
    smash: {feet: false, ground: 55},
    lash: {feet: false, ground: 48},
    sting: {feet: false, ground: 51},
    talon: {feet: false, ground: 57},
    throw: {feet: false, ground: 52},
    web: {feet: false, ground: 52},
    sonar: {feet: false, ground: 52},
    curse: {feet: false, ground: 55},
    dust: {feet: false, ground: 52},
    bleed: {feet: false, ground: 57},
    drain: {feet: false, ground: 44},
    gust: {feet: false, ground: 54},
};

// Animation names each class plays, so restartClass can tell when it has finished.
export const FX_ANIMS: Record<string, string[]> = {shaking: ['hit-shake']};
