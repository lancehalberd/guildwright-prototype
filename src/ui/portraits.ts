// Hero portraits: pixel-art busts, one female and one male per class, built into the page.
// Each hero's portrait follows the look intended for their name; heroes whose names aren't
// listed (later additions) get one picked steadily from their id.
import {h} from './dom';
import {spriteHeadroom} from './spriteBounds';

const files = import.meta.glob('../assets/portraits/*.webp', {eager: true, query: '?inline', import: 'default'}) as Record<string, string>;
const urls: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
    const m = /class-(\w+)-(female|male)\.webp$/.exec(path);
    if (m) urls[`${m[1]}-${m[2]}`] = url;
}

export type Look = 'female' | 'male';
const F: Look = 'female', M: Look = 'male';
// The look drawn for each name in the class name lists.
const looks: Record<string, Look> = {
    Brenna: F, Garrick: M, Hild: F, Bram: M, Petra: F,
    Ryn: M, Tamsin: F, Wren: F, Corin: M, Ash: M,
    Isolde: F, Mirek: M, Sable: F, Odo: M, Vesna: F,
    Hask: M, Torva: F, Grim: M, Ulla: F, Bjorn: M,
    Lys: F, Corvin: M, Ilsa: F, Maren: F, Quill: M,
    Aldric: M, Seren: F, Tobin: M, Ysolde: F, Kael: M,
    Shen: M, Ilka: F, Doran: M, Mei: F, Tarek: M,
    Kaede: F, Sorrel: F, Jin: M, Nyx: F, Hollis: M,
    Alaric: M, Morwen: F, Zephyr: M, Ondine: F, Cyprian: M,
    Varro: M, Lucia: F, Draco: M, Brisa: F, Maximo: M,
    Vex: F, Nettle: F, Rask: M, Sienna: F, Tobias: M,
    Morrigan: F, Sanguin: M, Ilyra: F, Corvus: M, Ezra: M,
    Ragna: F, Thorvald: M, Ysra: F, Gunnar: M, Sigrun: F,
    Hawke: M, Linnea: F, Orrin: M, Talia: F, Severin: M,
    Malachai: M, Ysmay: F, Drust: M, Hespera: F, Oren: M,
    Aurelia: F, Cassian: M, Thea: F, Leander: M, Isra: F,
    Pip: M, Moss: M, Rook: M, Juniper: F, Fen: F,
};

// Full-body battle sprites (96px, facing right), keyed like the portraits.
const spriteFiles = import.meta.glob('../assets/heroes/*.webp', {eager: true, query: '?inline', import: 'default'}) as Record<string, string>;
const spriteUrls: Record<string, string> = {};
for (const [path, url] of Object.entries(spriteFiles)) {
    const m = /hero-(\w+)-(female|male)\.webp$/.exec(path);
    if (m) spriteUrls[`${m[1]}-${m[2]}`] = url;
}
// Empty rows above the hero sprite's head, for placing floating numbers.
export function heroSpriteHeadroom(hero: {name: string, classKey: string, id?: string}): number {
    return spriteHeadroom[`hero-${hero.classKey}-${heroLook(hero)}`] ?? 0;
}

// Attack animations: a strip of frames (each 144 x 112, the 96px sprite box at its bottom center,
// feet lined up with the still sprite), played over the sprite on each attack.
const attackFiles = import.meta.glob('../assets/heroes/anim/attack-*.webp', {eager: true, query: '?inline', import: 'default'}) as Record<string, string>;
const attackUrls: Record<string, string> = {};
for (const [path, url] of Object.entries(attackFiles)) {
    const m = /attack-(\w+)-(female|male)\.webp$/.exec(path);
    if (m) attackUrls[`${m[1]}-${m[2]}`] = url;
}
export const ATTACK_FRAMES = 3;
export function heroAttackUrl(hero: {name: string, classKey: string, id?: string}): string | undefined {
    return attackUrls[`${hero.classKey}-${heroLook(hero)}`];
}

// Weapon-swap test (dev preview only): the battle sprite redrawn from a weapon-less body with a
// different weapon in hand. weapon-<class>-<female|male>-<weapon>.webp.
const weaponFiles = import.meta.glob('../assets/heroes/weapons/weapon-*.webp', {eager: true, query: '?inline', import: 'default'}) as Record<string, string>;
const weaponUrls: Record<string, Record<string, string>> = {};
for (const [path, url] of Object.entries(weaponFiles)) {
    const m = /weapon-(\w+)-(female|male)-(\w+)\.webp$/.exec(path);
    if (m) (weaponUrls[`${m[1]}-${m[2]}`] ??= {})[m[3]] = url;
}
export function heroWeaponSprites(hero: {name: string, classKey: string, id?: string}): Record<string, string> {
    return weaponUrls[`${hero.classKey}-${heroLook(hero)}`] ?? {};
}

export function heroSpriteUrl(hero: {name: string, classKey: string, id?: string}): string | undefined {
    return spriteUrls[`${hero.classKey}-${heroLook(hero)}`];
}

export function heroLook(hero: {name: string, id?: string}): Look {
    const base = hero.name.split(' ')[0];
    let look = looks[base];
    if (!look) {
        let n = 0;
        for (const ch of hero.id ?? hero.name) n = (n * 31 + ch.charCodeAt(0)) >>> 0;
        look = n % 2 ? F : M;
    }
    return look;
}

export function portraitUrl(hero: {name: string, classKey: string, id?: string}): string | undefined {
    const base = hero.name.split(' ')[0];
    let look = looks[base];
    if (!look) {
        let n = 0;
        for (const ch of hero.id ?? hero.name) n = (n * 31 + ch.charCodeAt(0)) >>> 0;
        look = n % 2 ? F : M;
    }
    return urls[`${hero.classKey}-${look}`];
}

// A round portrait, or null when the class has no art (callers fall back to the class icon).
export function heroPortrait(hero: {name: string, classKey: string, id?: string}, className = ''): HTMLElement | null {
    const url = portraitUrl(hero);
    return url ? h('img', {class: 'portrait ' + className, src: url, alt: '', draggable: 'false'}) : null;
}
