// Dev tool: every source of one stat across all materials, as a base, a decoration or worn
// directly, sorted from highest to lowest. For checking how a stat is spread through the game.
import {itemTypeOrder, itemTypes} from '../data/items';
import {isPremium, materialOrder, requireMaterial, roleLabel} from '../data/materials';
import {questOrder, quests} from '../data/quests';
import {baseEntry, formatStatValue, statDefs, statOrder} from '../data/stats';
import {itemStatRound, getBaseStats, getDecorationStats, getMaterialEquipStats, isAccessory, decorationScale, statScale} from '../engine/crafting';
import type {ItemTypeKey, StatKey} from '../engine/types';
import {h} from './dom';
import {materialIcon} from './icons';
import type {Ctx} from './panels';

export type SourceKind = 'base' | 'decoration' | 'worn';
export type ItemGroup = 'all' | 'weapon' | 'armor' | 'accessory';
export interface StatExplorerState {
    stat: StatKey
    kinds: SourceKind[]
    premium: boolean
    group: ItemGroup
    minPower: number
    maxPower: number
}
export const defaultStatExplorer = (): StatExplorerState =>
    ({stat: 'lifeOnHit', kinds: ['base', 'decoration', 'worn'], premium: false, group: 'all', minPower: 1, maxPower: 15});

interface Row {
    key: string
    power: number
    kind: SourceKind
    // As the item type scales it. Bases also show their cap.
    value: number
    cap?: number
    types: ItemTypeKey[]
    // The base's other stats, or the decoration's, for context.
    role?: string
}

const kindLabel: Record<SourceKind, string> = {base: 'Base', decoration: 'Decoration', worn: 'Worn'};

function inGroup(type: ItemTypeKey, group: ItemGroup): boolean {
    if (group === 'all') return true;
    if (group === 'accessory') return isAccessory(type);
    const weapon = itemTypes[type].tags.includes('weapon');
    return group === 'weapon' ? weapon : !weapon && !isAccessory(type);
}

// Where a material first drops, by quest order: "Hollow Mines · U". Legendaries name their boss's area.
let dropCache: Map<string, string> | null = null;
export function dropText(key: string): string {
    if (!dropCache) {
        dropCache = new Map();
        for (const q of questOrder.map(k => quests[k])) {
            for (const tier of ['C', 'U', 'R', 'M'] as const) {
                for (const e of q.pools[tier]) if (!dropCache.has(e.material)) dropCache.set(e.material, `${q.name.replace(/^The /, '')} · ${tier}`);
            }
            if (q.boss && !dropCache.has(q.boss.legendary)) dropCache.set(q.boss.legendary, `${q.name.replace(/^The /, '')} · boss`);
        }
    }
    const plain = key.replace(/^premium:/, '');
    return (dropCache.get(plain) ?? '—') + (isPremium(key) ? ' · premium' : '');
}

// Every source of the stat. Item types that give the same amount share a row.
export function statRows(s: StatExplorerState): Row[] {
    const rows = new Map<string, Row>();
    const add = (r: Omit<Row, 'types'>, type: ItemTypeKey) => {
        const id = [r.key, r.kind, r.value, r.cap ?? ''].join('|');
        const row = rows.get(id);
        if (row) row.types.push(type); else rows.set(id, {...r, types: [type]});
    };
    for (const key of materialOrder) {
        if (!s.premium && isPremium(key)) continue;
        const m = requireMaterial(key);
        if (m.power < s.minPower || m.power > s.maxPower) continue;
        for (const type of itemTypeOrder) {
            if (!inGroup(type, s.group)) continue;
            if (s.kinds.includes('base')) {
                const base = getBaseStats(m, type);
                const entry = base?.stats[s.stat];
                if (entry !== undefined) {
                    const [v, cap] = baseEntry(entry);
                    const scale = statScale(type, s.stat);
                    add({key, power: m.power, kind: 'base', value: itemStatRound(s.stat, v * scale, type), cap: Array.isArray(entry) ? itemStatRound(s.stat, cap * scale, type) : undefined, role: base!.role}, type);
                }
            }
            if (s.kinds.includes('decoration')) {
                const v = getDecorationStats(m, type)?.[s.stat];
                if (v) add({key, power: m.power, kind: 'decoration', value: itemStatRound(s.stat, v * decorationScale(type, s.stat), type)}, type);
            }
        }
        if (s.kinds.includes('worn') && m.equip && inGroup(m.equip.itemType, s.group)) {
            const v = getMaterialEquipStats(m)?.stats[s.stat];
            if (v) add({key, power: m.power, kind: 'worn', value: v}, m.equip.itemType);
        }
    }
    return [...rows.values()].sort((a, b) => b.value - a.value || b.power - a.power);
}

// How many sources each stat has (with the current filters other than the stat), for the picker.
function countFor(s: StatExplorerState, stat: StatKey): number {
    return statRows({...s, stat}).length;
}

export function statExplorerPanel(ctx: Ctx, shell: (title: string, subtitle: string, ...body: (Node | null)[]) => HTMLElement): HTMLElement {
    const {ui} = ctx;
    const s = ui.statExplorer ??= defaultStatExplorer();
    const set = (patch: Partial<StatExplorerState>) => { Object.assign(s, patch); ctx.refresh(); };
    const rows = statRows(s);
    const fmt = (v: number) => formatStatValue(s.stat, v);

    const picker = h('select', {class: 'filteradd', 'aria-label': 'Stat', onchange: (e: Event) => set({stat: (e.target as HTMLSelectElement).value as StatKey})},
        ...statOrder.map(k => {
            const n = countFor(s, k);
            return h('option', {value: k, selected: k === s.stat ? 'selected' : undefined}, `${statDefs[k].label} (${n})`);
        }));
    const kindBox = (k: SourceKind) => h('label', {class: 'toggle small'},
        h('input', {type: 'checkbox', checked: s.kinds.includes(k), onchange: (e: Event) => set({kinds: (e.target as HTMLInputElement).checked ? [...s.kinds, k] : s.kinds.filter(x => x !== k)})}),
        ' ' + kindLabel[k]);
    const groupSel = h('select', {class: 'filteradd', 'aria-label': 'Item types', onchange: (e: Event) => set({group: (e.target as HTMLSelectElement).value as ItemGroup})},
        ...(['all', 'weapon', 'armor', 'accessory'] as ItemGroup[]).map(g => h('option', {value: g, selected: g === s.group ? 'selected' : undefined}, g === 'all' ? 'All item types' : g[0].toUpperCase() + g.slice(1) + 's')));
    const powerSel = (field: 'minPower' | 'maxPower', label: string) => h('select', {class: 'filteradd', 'aria-label': label, onchange: (e: Event) => set({[field]: Number((e.target as HTMLSelectElement).value)})},
        ...Array.from({length: 15}, (_, i) => i + 1).map(p => h('option', {value: String(p), selected: p === s[field] ? 'selected' : undefined}, `P${p}`)));

    const controls = h('div', {class: 'sx-controls'},
        h('div', {class: 'row'}, picker, groupSel),
        h('div', {class: 'row small'}, kindBox('base'), kindBox('decoration'), kindBox('worn'),
            h('label', {class: 'toggle small'}, h('input', {type: 'checkbox', checked: s.premium, onchange: (e: Event) => set({premium: (e.target as HTMLInputElement).checked})}), ' Premium'),
            h('span', {class: 'muted'}, 'Power'), powerSel('minPower', 'Lowest power'), h('span', {class: 'muted'}, 'to'), powerSel('maxPower', 'Highest power')),
        h('div', {class: 'muted small'}, statDefs[s.stat].description ?? ''),
    );

    // The best amount at each power, per kind: the curve at a glance.
    const powers = Array.from({length: s.maxPower - s.minPower + 1}, (_, i) => s.minPower + i);
    const best = (kind: SourceKind, p: number) => Math.max(0, ...rows.filter(r => r.kind === kind && r.power === p).map(r => r.value));
    const curve = h('div', {class: 'sx-curvewrap'}, h('table', {class: 'sx-curve'},
        h('thead', null, h('tr', null, h('th', null, 'Best'), ...powers.map(p => h('th', null, `P${p}`)))),
        h('tbody', null, ...s.kinds.map(kind => h('tr', null, h('th', null, kindLabel[kind]),
            ...powers.map(p => { const v = best(kind, p); return h('td', {class: v ? '' : 'muted'}, v ? fmt(v) : '·'); })))),
    ));

    const table = rows.length ? h('table', {class: 'sx-table'},
        h('thead', null, h('tr', null, ...['Amount', 'Material', 'Item type', 'Kind', 'Drops'].map(t => h('th', null, t)))),
        h('tbody', null, ...rows.map(r => {
            const m = requireMaterial(r.key);
            const types = r.kind === 'worn' ? `Worn as ${itemTypes[r.types[0]].name.toLowerCase()}`
                : r.types.length === itemTypeOrder.filter(t => inGroup(t, s.group)).length ? 'Any' : r.types.map(t => itemTypes[t].name).join(', ');
            return h('tr', {class: 'sx-' + r.kind},
                h('td', {class: 'num'}, fmt(r.value), r.cap !== undefined ? h('span', {class: 'muted'}, ` / cap ${fmt(r.cap)}`) : null),
                h('td', null, h('span', {class: 'power'}, `P${r.power}`), ' ',
                    h('button', {class: 'matlink' + (isPremium(r.key) ? ' premium' : ''), title: 'Show every use of this material',
                        onclick: () => { ui.materialDetail = r.key; ctx.refresh(); }}, materialIcon(r.key), m.name)),
                h('td', {class: 'small'}, types),
                h('td', {class: 'small'}, kindLabel[r.kind] + (r.role ? ` · ${(roleLabel as Record<string, string>)[r.role] ?? r.role}` : '')),
                h('td', {class: 'small muted'}, dropText(r.key)),
            );
        })),
    ) : h('div', {class: 'muted small'}, 'No sources with these filters.');

    return shell('Stat explorer', `${rows.length} source${rows.length === 1 ? '' : 's'} of ${statDefs[s.stat].label}, highest first. Bases show value / cap; amounts are as each item type scales them.`,
        controls, curve, table);
}
