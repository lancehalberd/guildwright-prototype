import {itemTypeOrder, itemTypes, slotNames} from '../data/items';
import {isPremium, plainKey, PREMIUM_CHANCE, premiumKey, requireMaterial, roleHint, roleLabel} from '../data/materials';
import {monsters, quests, questOrder} from '../data/quests';
import {baseStatEntries, CAP_RULE, formatStats, roundStat} from '../data/stats';
import {itemStatRound, getBaseStats, getDecorationLimit, getMaterialEquipStats, resolveTag, decorationScale, statScale} from '../engine/crafting';
import {canEquipInSlot, equip, getQuestProgress, itemLevelRequirement} from '../engine/state';
import {isTwoHandedEquipped} from '../engine/stats';
import type {BaseStats, ItemRef, ItemTypeKey, MaterialDef, SlotKey, StatKey, StatValues, Tag, Tier} from '../engine/types';
import {h, num} from './dom';
import {signatureLine} from './panels';
import {materialIcon} from './icons';
import {deltaLine} from './compareView';
import {hasBench} from '../engine/shop';
import {currentHero, type Ctx} from './panels';

const tierNames: Record<Tier, string> = {C: 'common', U: 'uncommon', R: 'rare', M: 'mythic'};

// Item types grouped by the tag that a material table resolves to for them, in item type order.
function groupByTag<T>(table: Partial<Record<Tag, T>> | undefined): {tag: Tag, value: T, types: ItemTypeKey[]}[] {
    const groups: {tag: Tag, value: T, types: ItemTypeKey[]}[] = [];
    for (const type of itemTypeOrder) {
        const resolved = resolveTag(table, type);
        if (!resolved) {
            continue;
        }
        const group = groups.find(g => g.tag === resolved.tag);
        if (group) {
            group.types.push(type);
        } else {
            groups.push({tag: resolved.tag, value: resolved.value, types: [type]});
        }
    }
    return groups;
}

// Base stats for a group of item types. When the types scale the stats differently, values are
// shown at 1× and each type lists its multiplier.
// Opens the bench on that item type with this material as the first base.
function craftLink(ctx: Ctx, key: string, type: ItemTypeKey, extra: string): HTMLElement {
    const owned = ctx.state.materials[key] ?? 0;
    const noBench = !hasBench(ctx.state);
    return h('button', {
        class: 'craftlink',
        disabled: owned <= 0 || noBench,
        title: noBench ? 'Buy the crafting bench from the merchant first' : owned > 0 ? `Craft a ${itemTypes[type].name.toLowerCase()} with ${requireMaterial(key).name} as the first base` : 'None owned',
        onclick: () => {
            ctx.ui.bench = {itemType: type, base: [key], decorations: []};
            ctx.ui.picker = null;
            ctx.ui.benchOpen = true;
            ctx.ui.materialDetail = null;
            ctx.refresh();
        },
    }, itemTypes[type].name + extra);
}

function baseGroupRow(ctx: Ctx, key: string, base: BaseStats, types: ItemTypeKey[]): HTMLElement {
    // Values as each item type scales them; types that come out the same share a line.
    const rows = clusterBy(types, t => baseStatEntries(base, stat => statScale(t, stat), (stat, v) => itemStatRound(stat, v, t)).map(e => e.text).join(', '));
    return h('div', {class: 'usage'},
        ...rows.flatMap(([text, ts]) => [
            h('div', {class: 'usage-types craftlinks'}, ...ts.map(t => craftLink(ctx, key, t, ''))),
            h('div', null, text),
        ]),
        h('div', {class: 'muted small', title: base.role ? roleHint[base.role] : undefined}, [
            base.role ? roleLabel[base.role] : '',
            slotsText(key, types),
            base.itemLabel ? `named "${base.itemLabel}"` : '',
        ].filter(Boolean).join(' · ')),
    );
}

// Decoration slots for these item types: one count, or each count with its types when they differ.
function slotsText(key: string, types: ItemTypeKey[]): string {
    const material = requireMaterial(key);
    const groups = clusterBy(types, t => String(getBaseStats(material, t)?.maxDecorations ?? 0));
    const label = (n: string) => `${n} decoration slot${n === '1' ? '' : 's'}`;
    return groups.length === 1 ? label(groups[0][0]) : groups.map(([n, ts]) => `${label(n)} (${ts.map(t => itemTypes[t].name.toLowerCase()).join(', ')})`).join(', ');
}

// Groups item types by a label, keeping item type order.
function clusterBy(types: ItemTypeKey[], label: (t: ItemTypeKey) => string): [string, ItemTypeKey[]][] {
    const out: [string, ItemTypeKey[]][] = [];
    for (const t of types) {
        const text = label(t);
        const row = out.find(r => r[0] === text);
        if (row) row[1].push(t); else out.push([text, [t]]);
    }
    return out;
}

// Puts this decoration on the bench for an item type: into the first empty slot when the bench
// already holds that type, otherwise as a new craft of that type. A base can be added after.
function decorationLink(ctx: Ctx, key: string, type: ItemTypeKey): HTMLElement {
    const bench = ctx.ui.bench;
    const same = bench.itemType === type;
    const limit = getDecorationLimit(ctx.state, type);
    // Decorations fill from the top with no gaps.
    const filled = bench.decorations.filter(Boolean).length;
    const slot = same ? (filled < limit ? filled : undefined) : 0;
    const used = same ? [...bench.base, ...bench.decorations].filter(k => k === key).length : 0;
    const owned = ctx.state.materials[key] ?? 0;
    const blocked = !hasBench(ctx.state) ? 'Buy the crafting bench from the merchant first'
        : owned <= used ? (owned ? 'All of them are already on the bench' : 'None owned')
        : slot === undefined ? 'No empty decoration slot on the bench' : null;
    return h('button', {
        class: 'craftlink',
        disabled: !!blocked,
        title: blocked ?? (same ? `Add ${requireMaterial(key).name} to the ${itemTypes[type].name.toLowerCase()} on the bench` : `Start a ${itemTypes[type].name.toLowerCase()} with ${requireMaterial(key).name} as a decoration`),
        onclick: () => {
            if (same) {
                bench.decorations = [...bench.decorations.filter(Boolean), key];
            } else {
                ctx.ui.bench = {itemType: type, base: [], decorations: [key]};
            }
            ctx.ui.picker = null;
            ctx.ui.benchOpen = true;
            ctx.ui.materialDetail = null;
            ctx.refresh();
        },
    }, itemTypes[type].name + (same ? ' (on bench)' : ''));
}

function decorationGroupRow(ctx: Ctx, key: string, stats: StatValues, types: ItemTypeKey[]): HTMLElement {
    const scaled = (t: ItemTypeKey): StatValues => Object.fromEntries((Object.entries(stats) as [StatKey, number][])
        .map(([stat, v]) => [stat, roundStat(stat, itemStatRound(stat, v * decorationScale(t, stat), t))]));
    const rows = clusterBy(types, t => formatStats(scaled(t)));
    return h('div', {class: 'usage'}, ...rows.flatMap(([text, ts]) => [
        h('div', {class: 'usage-types craftlinks'}, ...ts.map(t => decorationLink(ctx, key, t))),
        h('div', null, text),
    ]));
}

// Equip the material on the selected hero, or say why not and open that slot's picker.
function equipRow(ctx: Ctx, key: string, type: ItemTypeKey): HTMLElement | null {
    const {state, ui} = ctx;
    const hero = currentHero(ctx);
    if (!hero) return null;
    const ref: ItemRef = {kind: 'material', key};
    const slots = itemTypes[type].slots;
    const slot: SlotKey = slots.find(s => !hero.equipment[s] && canEquipInSlot(state, hero, ref, s))
        ?? slots.find(s => canEquipInSlot(state, hero, ref, s)) ?? slots[0];
    const owned = state.materials[key] ?? 0;
    const level = itemLevelRequirement(state, ref);
    const why = owned < 1 ? 'None owned'
        : hero.level < level ? `${hero.name} needs level ${level} (now ${hero.level})`
        : slot === 'offHand' && isTwoHandedEquipped(state, hero) ? `${hero.name}'s two-handed weapon uses the off hand`
        : !canEquipInSlot(state, hero, ref, slot) ? `Doesn't fit ${hero.name}'s ${slotNames[slot].toLowerCase()}` : null;
    const replaces = hero.equipment[slot];
    const openSlot = () => {
        ui.panel = {kind: 'adventurer', id: hero.id};
        ui.selectedSlot = slot;
        ui.scrollTo = 'gearopt-' + key;
        ui.materialDetail = null;
        ctx.refresh();
    };
    const compare = slot === 'offHand' && isTwoHandedEquipped(state, hero) ? null : deltaLine(state, hero, slot, ref, `${hero.name} · ${slotNames[slot]}`);
    return h('div', null, h('div', {class: 'row small', style: 'margin-top:4px'},
        why
            ? h('button', {class: 'btn small', onclick: openSlot}, `Show ${hero.name}'s ${slotNames[slot].toLowerCase()}`)
            : h('button', {class: 'btn small primary', onclick: () => {
                if (equip(state, hero, ref, slot)) state.guide = {...state.guide, manualEquip: true};
                // Show the character's equipment so the result can be checked.
                ui.materialDetail = null;
                ui.panel = {kind: 'adventurer', id: hero.id};
                ui.selectedSlot = null;
                ui.scrollTo = 'equipment';
                ctx.refresh();
            }}, `Equip on ${hero.name}`),
        h('span', {class: 'grow' + (why ? ' bad' : ' muted')}, why ?? (replaces ? `Replaces what's in the ${slotNames[slot].toLowerCase()} slot` : `Goes in the empty ${slotNames[slot].toLowerCase()} slot`)),
    ), compare);
}

function foundIn(ctx: Ctx, key: string): string[] {
    const found: string[] = [];
    for (const questKey of questOrder) {
        const progress = getQuestProgress(ctx.state, questKey);
        for (const tier of ['C', 'U', 'R', 'M'] as Tier[]) {
            if (progress.revealed[tier].includes(key)) {
                found.push(`${quests[questKey].name} (${tierNames[tier]})`);
            }
        }
        const boss = quests[questKey].boss;
        if (boss?.legendary === key && (ctx.state.obtained[key] ?? 0) > 0) {
            found.push(`${monsters[boss.monster].name} in ${quests[questKey].name} (legendary, ambition boss)`);
        }
    }
    return found;
}

function unusedTypes(material: MaterialDef): ItemTypeKey[] {
    return itemTypeOrder.filter(t => !resolveTag(material.base, t) && !resolveTag(material.decoration, t)
        && material.equip?.itemType !== t);
}

export function renderMaterialDetail(ctx: Ctx): HTMLElement | null {
    const key = ctx.ui.materialDetail;
    if (!key) {
        return null;
    }
    const material = requireMaterial(key);
    const close = () => { ctx.ui.materialDetail = null; ctx.refresh(); };
    const baseGroups = groupByTag(material.base);
    const decoGroups = groupByTag(material.decoration);
    const equip = material.equip ? getMaterialEquipStats(material) : undefined;
    const premium = isPremium(key);
    const found = foundIn(ctx, plainKey(key));
    const otherKey = premium ? plainKey(key) : premiumKey(key);
    const otherOwned = (ctx.state.obtained[otherKey] ?? 0) > 0;
    const openOther = () => { ctx.ui.materialDetail = otherKey; ctx.refresh(); };
    const unused = unusedTypes(material);
    // Not obtained yet (neither it nor its premium/plain twin): no spoilers. The card keeps to its
    // name, power and where it drops, and the rest waits for the first one.
    const known = (ctx.state.obtained[key] ?? 0) > 0 || (ctx.state.obtained[otherKey] ?? 0) > 0;

    const section = (title: string, hint: string, rows: HTMLElement[]) => rows.length ? h('div', null,
        h('h3', null, title),
        h('p', {class: 'muted small', style: 'margin:0 0 6px'}, hint),
        h('div', {class: 'list'}, ...rows),
    ) : null;

    return h('div', {class: 'matdetail-backdrop', onclick: (event: MouseEvent) => { if (event.target === event.currentTarget) close(); }},
        h('section', {class: 'panel matdetail', role: 'dialog', 'aria-label': `${material.name} details`},
            h('div', {class: 'panel-head'},
                h('div', {class: 'grow'},
                    h('h2', {class: premium ? 'premium-name' : ''}, materialIcon(key), material.name, ' ', h('span', {class: 'power'}, `P${material.power}`)),
                    h('div', {class: 'muted small'}, `${ctx.state.materials[key] ?? 0} owned · ${ctx.state.obtained[key] ?? 0} gathered in total`),
                ),
                h('button', {class: 'btn', onclick: close}, 'Close'),
            ),
            h('div', {class: 'panel-body'}, ...(!known ? [
                h('div', {class: 'unknownmat'},
                    h('strong', null, 'Not found yet'),
                    h('div', {class: 'small'}, 'What it is and how it crafts are revealed once the guild obtains one.')),
                premium ? h('div', {class: 'small'}, h('button', {class: 'textlink', onclick: openOther}, `See ${requireMaterial(otherKey).name}, its plain version`),
                    ` · a ${requireMaterial(otherKey).name} drop has a ${num(PREMIUM_CHANCE * 100)}% chance to be premium`) : null,
                h('div', {class: 'muted small'}, found.length ? `Found in ${found.join(', ')}.` : 'You have not found where this drops yet.'),
            ] : [
                material.description ? h('p', {style: 'margin:0'}, material.description) : null,
                h('div', {class: 'muted small'}, premium
                    ? `Any ${requireMaterial(otherKey).name} drop has a ${num(PREMIUM_CHANCE * 100)}% chance to be premium` + (found.length ? `: ${found.join(', ')}.` : '.')
                    : found.length ? `Found in ${found.join(', ')}.` : 'You have not found where this drops yet.'),
                premium || otherOwned ? h('div', {class: 'small'},
                    h('button', {class: 'textlink' + (premium ? '' : ' premium-name'), onclick: openOther}, premium ? `Compare with ${requireMaterial(otherKey).name}` : `See ${requireMaterial(otherKey).name} (${ctx.state.materials[otherKey] ?? 0} owned)`)) : null,
                section('As a base material', CAP_RULE + ' Pick an item type to start crafting it with this material.',
                    baseGroups.map(g => baseGroupRow(ctx, key, g.value, g.types))),
                section('As a decoration', 'Added on top of the base caps. Two-handed weapons get larger values to make up for the missing off hand. Pick an item type to put it on the bench; add a base to make its slot valid.',
                    decoGroups.map(g => decorationGroupRow(ctx, key, g.value, g.types))),
                material.equip && equip ? section('Worn directly', 'Equip the material itself without crafting. It uses up one from your stock while worn.', [
                    h('div', {class: 'usage'},
                        h('div', {class: 'usage-types'}, `${material.equip.name} · ${itemTypes[material.equip.itemType].name}`),
                        h('div', null, [formatStats(equip.stats), equip.attacksPerSecond ? `${num(equip.attacksPerSecond)} attacks/s` : ''].filter(Boolean).join(' · ')),
                        signatureLine({kind: 'material', key}),
                        equipRow(ctx, key, material.equip.itemType),
                    ),
                ]) : null,
                unused.length ? h('div', {class: 'muted small'}, `No use in: ${unused.map(t => itemTypes[t].name).join(', ')}.`) : null,
            ]),
            ),
        ),
    );
}
