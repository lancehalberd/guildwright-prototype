import {itemTypeOrder, itemTypes} from '../data/items';
import {isPremium, materialOrder, requireMaterial} from '../data/materials';
import {classes, damageStats, quests, questOrder} from '../data/quests';
import {getBaseLimit, getBaseStats, getDecorationLimit, getDecorationStats, maxDecorationPower, previewCraft} from './crafting';
import {SALVAGE_TIER_COST} from './salvage';
import {levelForPower} from './state';
import type {Adventurer, CraftedItem, GameState, ItemTypeKey, StatKey} from './types';

// The merchant: ready-made gear for each member, rolled from the same materials crafting uses.
// It comes before crafting: the crafting bench itself is bought here. Each hero has their own
// stock, scaled to their level and leaning on their class's stats. Buying an item rolls a new one
// in its place, and the whole stock can be rerolled for gold, like applicants.

export const BENCH_PRICE = 20;
export const SHOP_SIZE = 4;

export interface ShopItem {
    // Bought: the slot shows it as sold until restockSold rolls its replacement.
    sold?: boolean
    itemType: ItemTypeKey
    base: string[]
    decorations: string[]
    name: string
    power: number
    price: number
    // What the stock slot sells: a weapon, armor or an accessory.
    kind: ShopKind
}
type ShopKind = 'weapon' | 'armor' | 'accessory';
const STOCK_KINDS: ShopKind[] = ['weapon', 'armor', 'armor', 'accessory'];

// Weapons each core stat favors, and the stats it wants on armor and weapons.
const WEAPONS: Record<'str' | 'dex' | 'int', ItemTypeKey[]> = {str: ['sword', 'axe', 'greatsword'], dex: ['dagger', 'bow'], int: ['wand', 'staff']};
const DEFENSE: Record<'str' | 'dex' | 'int', StatKey> = {str: 'armor', dex: 'evasion', int: 'ward'};
const OFFENSE: Record<'str' | 'dex' | 'int', StatKey[]> = {
    str: ['physicalDamage'],
    dex: ['physicalDamage', 'accuracy', 'critChance'],
    int: ['fireDamage', 'coldDamage', 'lightningDamage', 'increasedElementalDamage'],
};
const ARMOR: ItemTypeKey[] = ['helmet', 'bodyArmor', 'gloves', 'boots', 'shield'];
const ACCESSORIES: ItemTypeKey[] = ['ring', 'amulet', 'belt'];

// The rarest pool tier each material drops from. Materials that only come from mythic pools or
// bosses are never sold.
let commonTier: Record<string, number> | undefined;
function sellable(key: string): boolean {
    if (!commonTier) {
        commonTier = {};
        const order = ['C', 'U', 'R', 'M'] as const;
        for (const q of questOrder) {
            order.forEach((t, i) => {
                for (const entry of quests[q].pools[t]) commonTier![entry.material] = Math.min(commonTier![entry.material] ?? 9, i);
            });
        }
    }
    return (commonTier[key] ?? 9) <= 2;
}

// Highest material tier the guild has found: the shop never sells anything stronger.
export function shopTierCap(state: GameState): number {
    let cap = 1;
    for (const key of Object.keys(state.obtained)) {
        if ((state.obtained[key] ?? 0) > 0) cap = Math.max(cap, requireMaterial(key).power);
    }
    return cap;
}

// Price: half of what salvaging every material would cost, times a coefficient that grows from
// 20% at level 1 to 200% at level 60.
export function priceCoefficient(level: number): number {
    return 0.2 + 1.8 * Math.min(1, Math.max(0, (level - 1) / 59));
}
export function shopPrice(materials: string[], level: number): number {
    const salvage = materials.reduce((sum, k) => sum + SALVAGE_TIER_COST[Math.min(SALVAGE_TIER_COST.length - 1, requireMaterial(k).power)], 0);
    return Math.max(1, Math.round(salvage / 2 * priceCoefficient(level)));
}

function pick<T>(list: T[], weight: (t: T) => number, rng: () => number): T | undefined {
    const total = list.reduce((s, t) => s + weight(t), 0);
    if (total <= 0) return undefined;
    let r = rng() * total;
    for (const t of list) {
        r -= weight(t);
        if (r < 0) return t;
    }
    return list[list.length - 1];
}

// One item for this hero. Base count is the guild's limit or one less; decorations fill every slot
// the bases (and the guild) support.
export function rollShopItem(state: GameState, hero: Adventurer, kind: ShopKind, rng: () => number = Math.random): ShopItem | undefined {
    const core = damageStats(classes[hero.classKey]);
    const main = core[Math.floor(rng() * core.length)];
    const wanted = new Set<StatKey>([...core.map(c => DEFENSE[c]), ...core.flatMap(c => OFFENSE[c]), 'maxHealth']);
    const maxPower = Math.min(shopTierCap(state), Math.max(1, Math.floor((hero.level - 1) / 3) + 1));
    const candidates = materialOrder.filter(k => !isPremium(k) && sellable(k) && requireMaterial(k).power <= maxPower && levelForPower(requireMaterial(k).power) <= hero.level);
    const types = kind === 'weapon'
        ? (rng() < 0.75 ? WEAPONS[main] : itemTypeOrder.filter(t => itemTypes[t].tags.includes('weapon')))
        : kind === 'armor' ? ARMOR : ACCESSORIES;
    for (let attempt = 0; attempt < 8; attempt++) {
        const itemType = types[Math.floor(rng() * types.length)];
        // Stronger materials and the class's stats are likelier.
        const weight = (stats: string[], power: number) => (stats.some(s => wanted.has(s as StatKey)) ? 4 : 1) * Math.pow(2, power - maxPower);
        const bases = candidates.filter(k => getBaseStats(requireMaterial(k), itemType));
        if (!bases.length) continue;
        const limit = getBaseLimit(state, itemType);
        const count = Math.max(1, limit - (rng() < 0.5 ? 1 : 0));
        const base: string[] = [];
        for (let i = 0; i < count; i++) {
            const k = pick(bases, k => weight(Object.keys(getBaseStats(requireMaterial(k), itemType)!.stats), requireMaterial(k).power), rng);
            if (k) base.push(k);
        }
        const supported = Math.min(getDecorationLimit(state, itemType), Math.max(...base.map(k => getBaseStats(requireMaterial(k), itemType)!.maxDecorations)));
        const decoPower = maxDecorationPower(itemType, base);
        const decos = candidates.filter(k => getDecorationStats(requireMaterial(k), itemType) && requireMaterial(k).power <= decoPower);
        const decorations: string[] = [];
        for (let i = 0; i < supported && decos.length; i++) {
            const k = pick(decos, k => weight(Object.keys(getDecorationStats(requireMaterial(k), itemType)!), requireMaterial(k).power), rng);
            if (k) decorations.push(k);
        }
        const preview = previewCraft(itemType, base, decorations);
        if (!preview) continue;
        return {itemType, base, decorations, name: preview.name, power: preview.power, kind, price: shopPrice([...base, ...decorations], hero.level)};
    }
    return undefined;
}

// The hero's stock, rolled when first needed.
export function shopStock(state: GameState, hero: Adventurer): (ShopItem | null)[] {
    state.shop ??= {};
    let stock = state.shop[hero.id];
    if (!stock) {
        stock = STOCK_KINDS.map(kind => rollShopItem(state, hero, kind) ?? null);
        state.shop[hero.id] = stock;
    }
    return stock;
}

// While the merchant panel shows a member's stock, their level-up doesn't restock it (the UI sets
// this every frame), so the list can't change under a player about to buy. Their next New stock is
// free instead.
let holdLevelRestock: string | null = null;
export function setHoldLevelRestock(heroId: string | null) { holdLevelRestock = heroId; }
export function levelUpRestock(state: GameState, heroId: string) {
    if (!state.shop?.[heroId]) return;
    if (holdLevelRestock === heroId) {
        (state.shopFreeRefresh ??= {})[heroId] = true;
    } else {
        delete state.shop[heroId];
        if (state.shopFreeRefresh) delete state.shopFreeRefresh[heroId];
    }
}

export function shopRefreshCost(state: GameState, hero: Adventurer): number {
    if (state.shopFreeRefresh?.[hero.id]) return 0;
    const stock = shopStock(state, hero);
    return Math.max(2, Math.round(0.25 * stock.reduce((sum, i) => sum + (i && !i.sold ? i.price : 0), 0)));
}

export function refreshShop(state: GameState, hero: Adventurer): boolean {
    const cost = shopRefreshCost(state, hero);
    if (state.gold < cost) return false;
    state.gold -= cost;
    state.shop![hero.id] = STOCK_KINDS.map(kind => rollShopItem(state, hero, kind) ?? null);
    if (state.shopFreeRefresh) delete state.shopFreeRefresh[hero.id];
    return true;
}

// Buys stock slot index for this hero. The item goes to the guild's crafted items and the offer stays
// in its slot marked sold; restockSold (the UI calls it a moment later) rolls its replacement.
export function buyShopItem(state: GameState, hero: Adventurer, index: number): CraftedItem | string {
    const stock = shopStock(state, hero);
    const offer = stock[index];
    if (!offer || offer.sold) return 'Nothing to buy there.';
    if (state.gold < offer.price) return `Needs ${offer.price} gold.`;
    state.gold -= offer.price;
    const item: CraftedItem = {id: 'item' + state.nextId++, itemType: offer.itemType, name: offer.name, base: [...offer.base], decorations: [...offer.decorations], power: offer.power};
    state.craftedItems.push(item);
    stock[index] = {...offer, sold: true};
    state.guide = {...state.guide, bought: true};
    return item;
}

// Rolls a replacement, of the same kind, for every sold slot. Returns how many it replaced.
export function restockSold(state: GameState, hero: Adventurer): number {
    const stock = state.shop?.[hero.id];
    if (!stock) return 0;
    let n = 0;
    stock.forEach((offer, i) => {
        if (offer?.sold) { stock[i] = rollShopItem(state, hero, offer.kind) ?? null; n++; }
    });
    return n;
}

export function hasBench(state: GameState): boolean {
    return state.benchOwned !== false;
}

export function buyBench(state: GameState): boolean {
    if (hasBench(state) || state.gold < BENCH_PRICE) return false;
    state.gold -= BENCH_PRICE;
    state.benchOwned = true;
    return true;
}
