import {h} from './dom';
import {trophySizes} from './trophySizes';
import {trophyTierName, type TrophyDef} from '../data/trophies';

// Trophy sprites (src/assets/trophies, cut by art/trophies/process_trophies.py). Each slotted trophy
// is its object (class-*, clear-*, or the Empty Vessel's stone for its tier) standing on a shared
// pedestal per tier (base-0..3, larger and fancier each tier) inside a glass case. Endless trophies are
// banners: a cloth per tier (banner-0..3) with the quest's emblem (emblem-<quest>) on it.
// Sprites are drawn at half their pixel size, so they stay sharp on 2x screens.
const files = import.meta.glob('../assets/trophies/*.webp', {eager: true, query: '?inline', import: 'default'}) as Record<string, string>;
const art: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) art[path.replace(/^.*\//, '').replace(/\.webp$/, '')] = url;

function sprite(name: string, cls: string): HTMLElement | null {
    const url = art[name], size = trophySizes[name];
    return url && size ? h('img', {class: cls, src: url, alt: '', draggable: 'false', width: size[0] / 2, height: size[1] / 2}) : null;
}

function objectName(def: TrophyDef, tier: number): string {
    return def.key === 'class-emptyVessel' ? `stone-${tier}` : def.key;
}

// The glass case for a slotted trophy: pedestal and object, or an empty case.
export function trophyCase(def: TrophyDef | undefined, tier: number): HTMLElement {
    return h('div', {class: 'tcase' + (def ? ' tier' + tier : ' empty'), 'aria-hidden': 'true'},
        h('div', {class: 'tcase-glass'}),
        def ? h('div', {class: 'tcase-stand'},
            sprite(objectName(def, tier), 'tcase-obj'),
            sprite(`base-${tier}`, 'tcase-base')) : null,
        h('div', {class: 'tcase-shine'}));
}

// An Endless banner: tier cloth with the quest emblem on it.
export function trophyBanner(def: TrophyDef, tier: number): HTMLElement {
    const quest = def.key.replace(/^endless-/, '');
    return h('div', {class: 'tbanner tier' + tier, 'aria-hidden': 'true'},
        sprite(`banner-${tier}`, 'tbanner-cloth'),
        sprite(`emblem-${quest}`, 'tbanner-emblem'));
}

export function trophyLabel(def: TrophyDef, tier: number): string {
    return `${def.name} · ${trophyTierName(def, tier)}`;
}
