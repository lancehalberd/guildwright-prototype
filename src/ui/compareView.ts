import {slotNames} from '../data/items';
import {familyLabel, formatStat, statFamily} from '../data/stats';
import {compareGear, comparisonSlots, type Comparison} from '../engine/compare';
import type {Adventurer, CraftedItem, GameState, ItemRef, SlotKey, StatKey} from '../engine/types';
import {h, num} from './dom';

// Gear comparison in the UI: a one-line summary (DPS and toughness change) under each gear option,
// with the exact stat changes on hover or focus, and a fuller column on the crafting bench.

// Comparisons are cached on everything they depend on, since lists re-render often.
const cache = new Map<string, Comparison>();
function cached(state: GameState, hero: Adventurer, slot: SlotKey, ref: ItemRef | CraftedItem | null): Comparison {
    const refKey = !ref ? '-' : 'itemType' in ref ? `p:${ref.itemType}:${ref.base.join(',')}:${ref.decorations.join(',')}` : ref.kind === 'crafted' ? 'c:' + ref.id : 'm:' + ref.key;
    const key = [hero.id, hero.level, hero.classKey, JSON.stringify(hero.equipment), JSON.stringify(hero.passives ?? []), JSON.stringify(hero.bonuses ?? {}), JSON.stringify(state.trophySlots ?? []), slot, refKey].join('|');
    let c = cache.get(key);
    if (!c) {
        if (cache.size > 400) cache.clear();
        c = compareGear(state, hero, slot, ref);
        cache.set(key, c);
    }
    return c;
}

function pctChange(before: number, after: number): number {
    if (before <= 0) return after > 0 ? Infinity : 0;
    return after / before - 1;
}

function chip(label: string, before: number, after: number): HTMLElement {
    const change = pctChange(before, after);
    const small = Math.abs(change) < 0.005;
    const text = small ? `±0% ${label}` : change === Infinity ? `+${label}` : `${change > 0 ? '+' : '−'}${num(Math.abs(change) * 100, Math.abs(change) < 0.1 ? 1 : 0)}% ${label}`;
    return h('span', {class: 'dchip ' + (small ? 'same' : change > 0 ? 'up' : 'down')}, text);
}

// Weapon speed isn't a gear stat, so show it when it changes.
function speedRow(c: Comparison): HTMLElement | null {
    const aps = c.changes.find(x => x.key === 'attacksPerSecond');
    return aps ? h('div', {class: 'row small'}, h('span', {class: 'grow'}, 'Attacks/s'), h('span', {class: 'num'}, `${num(aps.before)} → ${num(aps.after)}`)) : null;
}

function detail(c: Comparison): HTMLElement {
    return h('div', {class: 'delta-detail', role: 'tooltip'},
        h('div', {class: 'row'}, h('span', {class: 'grow'}, 'DPS'), h('span', {class: 'num'}, `${num(c.dps.before, 1)} → ${num(c.dps.after, 1)}`)),
        h('div', {class: 'row'}, h('span', {class: 'grow'}, 'Toughness'), h('span', {class: 'num'}, `${num(c.toughness.before, 1)}s → ${num(c.toughness.after, 1)}s`)),
        speedRow(c),
        c.gear.length ? h('div', {class: 'dstats'}, ...c.gear.map(g => h('span', {class: g.after > g.before ? 'up' : 'down'}, formatStat(g.stat, g.after - g.before)))) : h('div', {class: 'muted'}, 'No stat changes.'),
        h('div', {class: 'muted'}, `Against a typical level-matched monster. Toughness is how long the hero lasts against it, counting regeneration, while its damage grows 10% every 10 seconds.${c.replacing ? ` Replaces ${c.replacing}.` : ''}`),
    );
}

// One comparison line. label names the slot when an item could go in more than one.
export function deltaLine(state: GameState, hero: Adventurer, slot: SlotKey, ref: ItemRef | CraftedItem | null, label?: string, action?: HTMLElement | null): HTMLElement {
    const c = cached(state, hero, slot, ref);
    return h('div', {class: 'delta small', tabindex: '0'},
        label ? h('span', {class: 'dlabel'}, label) : null,
        chip('DPS', c.dps.before, c.dps.after),
        chip('toughness', c.toughness.before, c.toughness.after),
        action ?? null,
        detail(c),
    );
}

// Comparison lines for an item outside the gear picker: one per slot it could go in. When it could
// replace either of two items (two rings, two one-handed weapons), both are shown, labeled.
export function deltaLines(state: GameState, hero: Adventurer, slots: SlotKey[], ref: ItemRef | CraftedItem, action?: (slot: SlotKey) => HTMLElement | null): HTMLElement {
    const shown = comparisonSlots(state, hero, slots);
    return h('div', {class: 'deltas'}, ...shown.map(slot => deltaLine(state, hero, slot, ref,
        shown.length > 1 || slots.length > 1 ? `${hero.name} · ${slotNames[slot]}${hero.equipment[slot] ? '' : ' (empty)'}` : hero.name,
        action?.(slot))));
}

// The bench's comparison column: the full detail, always shown.
// With filters, each stat change is a link that toggles a filter on that stat's family.
export interface StatLinks {active: string[], toggle: (stat: StatKey) => void}
export function deltaColumn(state: GameState, hero: Adventurer, slots: SlotKey[], item: CraftedItem, action?: (slot: SlotKey) => HTMLElement | null, links?: StatLinks): HTMLElement {
    const statText = (stat: StatKey, before: number, after: number) => {
        const cls = after > before ? 'up' : 'down';
        if (!links) return h('span', {class: cls}, formatStat(stat, after - before));
        const on = links.active.includes(statFamily(stat));
        return h('button', {class: `statlink ${cls}${on ? ' match' : ''}`, 'aria-pressed': on ? 'true' : 'false',
            title: on ? `Remove the ${familyLabel(statFamily(stat))} filter` : `Filter materials and items by ${familyLabel(statFamily(stat))}`,
            onclick: () => links.toggle(stat)}, formatStat(stat, after - before));
    };
    const shown = comparisonSlots(state, hero, slots);
    return h('div', {class: 'comparecol'},
        h('h3', null, `Compared with ${hero.name}'s gear`),
        ...shown.map(slot => {
            const c = cached(state, hero, slot, item);
            return h('div', {class: 'comparebox'},
                h('div', {class: 'small'}, h('strong', null, slotNames[slot]), h('span', {class: 'muted'}, c.replacing ? ` · replacing ${c.replacing}` : ' · empty now')),
                h('div', {class: 'delta small static'}, chip('DPS', c.dps.before, c.dps.after), chip('toughness', c.toughness.before, c.toughness.after)),
                h('div', {class: 'small'}, `DPS ${num(c.dps.before, 1)} → ${num(c.dps.after, 1)} · Toughness ${num(c.toughness.before, 1)}s → ${num(c.toughness.after, 1)}s`),
                speedRow(c),
                c.gear.length ? h('div', {class: 'dstats small'}, ...c.gear.map(g => statText(g.stat, g.before, g.after))) : null,
                action?.(slot) ?? null,
            );
        }),
        h('div', {class: 'muted small'}, 'Against a typical monster at the hero\'s level. Toughness is how many seconds the hero lasts against it, counting regeneration, while its damage grows 10% every 10 seconds.'),
    );
}

// A one-row summary for a fixed-size card: the DPS and toughness chips for the slot where the item
// helps most, plus "+N more" when it could go in other slots too (the details popover lists them all).
export function bestDelta(state: GameState, hero: Adventurer, slots: SlotKey[], ref: ItemRef | CraftedItem): {slot: SlotKey, el: HTMLElement} | null {
    const shown = comparisonSlots(state, hero, slots);
    if (!shown.length) return null;
    const score = (c: Comparison) => {
        const d = pctChange(c.dps.before, c.dps.after), t = pctChange(c.toughness.before, c.toughness.after);
        return (Number.isFinite(d) ? d : 10) + (Number.isFinite(t) ? t : 10);
    };
    const ranked = shown.map(slot => ({slot, c: cached(state, hero, slot, ref)})).sort((a, b) => score(b.c) - score(a.c));
    const {slot, c} = ranked[0];
    return {slot, el: h('div', {class: 'delta small static oneline'},
        shown.length > 1 || slots.length > 1 ? h('span', {class: 'dlabel'}, `${slotNames[slot]}${hero.equipment[slot] ? '' : ' (empty)'}`) : null,
        chip('DPS', c.dps.before, c.dps.after),
        chip('toughness', c.toughness.before, c.toughness.after),
        shown.length > 1 ? h('span', {class: 'dlabel'}, `+${shown.length - 1} more`) : null,
    )};
}
