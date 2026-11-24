import {isPremium, PREMIUM_CHANCE, plainKey, premiumKey, requireMaterial} from '../data/materials';
import {questOrder, quests} from '../data/quests';
import {SALVAGE_TIER_COST} from './salvage';
import {isQuestCleared, isQuestUnlocked} from './state';
import type {GameState, Tier} from './types';

// The travelling peddler: after the first full clear of Hollow Mines, a peddler stops on the road
// for up to 15 minutes, comes back 10 to 15 minutes after leaving, and sells single rare materials from the quests the guild has
// unlocked, including ones it hasn't found yet. Visits run on play time (state.time), so time with
// the game closed never costs a visit.
//
// Stock: two main slots, each a rare-pool material or a premium common at equal odds, and a bonus
// slot on 1 visit in 4 with a mythic-pool material (from quests the guild has cleared) or a premium uncommon. Rare and mythic stock is
// premium only at the usual drop chance.
//
// Holds: an offer can be held so the next visit keeps it in its slot instead of rolling a new one.
// The first hold costs HOLD_BASE gold and each further one doubles for every hold already active.
// Releasing is free; a released offer whose visit has ended leaves the stock at once.

export const PEDDLER_UNLOCK = 'clear-hollowMines';
export const VISIT_SECONDS = 15 * 60;
// Time away between leaving and the next visit. Selling out ends a visit early.
export const VISIT_GAP: [number, number] = [10 * 60, 15 * 60];
export const BONUS_CHANCE = 0.25;
export const PRICE_MULTIPLIER = 3;
export const PREMIUM_PRICE_MULTIPLIER = 5;
// Materials found fewer than this many times cost RARE_MARKUP more.
export const RARE_FOUND = 3;
export const RARE_MARKUP = 1.5;
export const HOLD_BASE = 100;

export interface PeddlerOffer {
    material: string
    // The pool tier it came from.
    tier: Tier
    slot: 'main' | 'bonus'
    sold?: boolean
    held?: boolean
}

export interface PeddlerState {
    // Play time the next visit starts. During a visit, a provisional time after it ends.
    nextVisit: number
    // Play time the current visit ends. Unset or in the past while the peddler is away.
    leavesAt?: number
    // The last visit's stock; held offers carry over to the next visit.
    stock: PeddlerOffer[]
    visits: number
}

export function peddlerUnlocked(state: GameState): boolean {
    return state.achievements.includes(PEDDLER_UNLOCK) || !!state.peddler;
}

export function peddlerHere(state: GameState): boolean {
    const p = state.peddler;
    return !!p && p.leavesAt !== undefined && state.time < p.leavesAt;
}

function gap(rng: () => number): number {
    return VISIT_GAP[0] + rng() * (VISIT_GAP[1] - VISIT_GAP[0]);
}

// Pools the stock draws from: every unlocked quest's pool of that tier, weighted as in the quest.
// A quest's mythic pool only once the guild has cleared that quest.
function poolPick(state: GameState, tier: Tier, exclude: Set<string>, rng: () => number): string | undefined {
    const entries: {material: string, weight: number}[] = [];
    for (const key of questOrder) {
        if (!isQuestUnlocked(state, key)) continue;
        if (tier === 'M' && !isQuestCleared(state, key)) continue;
        for (const e of quests[key].pools[tier]) {
            if (!requireMaterial(e.material).keyItem && !exclude.has(e.material) && !exclude.has(premiumKey(e.material))) entries.push(e);
        }
    }
    const total = entries.reduce((s, e) => s + e.weight, 0);
    if (total <= 0) return undefined;
    let r = rng() * total;
    for (const e of entries) {
        r -= e.weight;
        if (r < 0) return e.material;
    }
    return entries[entries.length - 1].material;
}

function rollOffer(state: GameState, slot: PeddlerOffer['slot'], exclude: Set<string>, rng: () => number): PeddlerOffer | undefined {
    const [high, low]: Tier[] = slot === 'main' ? ['R', 'C'] : ['M', 'U'];
    // Half the time the high pool, plain unless the drop chance makes it premium; otherwise a premium
    // material from the low pool. Falls back to the other side if a pool is empty.
    const order = rng() < 0.5 ? [high, low] : [low, high];
    for (const tier of order) {
        const key = poolPick(state, tier, exclude, rng);
        if (!key) continue;
        const material = tier === high ? (rng() < PREMIUM_CHANCE ? premiumKey(key) : key) : premiumKey(key);
        return {material, tier, slot};
    }
    return undefined;
}

// A new visit's stock: held offers keep their places, everything else rolls again.
function rollStock(state: GameState, previous: PeddlerOffer[], rng: () => number): PeddlerOffer[] {
    const held = previous.filter(o => o.held && !o.sold);
    const used = new Set(held.map(o => plainKey(o.material)));
    const slots: PeddlerOffer['slot'][] = ['main', 'main', ...(rng() < BONUS_CHANCE ? ['bonus' as const] : [])];
    const stock: PeddlerOffer[] = [];
    for (const slot of slots) {
        const keep = held.find(o => o.slot === slot && !stock.includes(o));
        if (keep) {
            stock.push(keep);
            continue;
        }
        const offer = rollOffer(state, slot, used, rng);
        if (offer) {
            used.add(plainKey(offer.material));
            stock.push(offer);
        }
    }
    // A held bonus offer stays even on a visit that wouldn't have rolled a bonus slot.
    for (const o of held) if (!stock.includes(o)) stock.push(o);
    return stock;
}

// Starts and ends visits as play time passes. Returns 'arrived' on the tick a visit starts.
export function updatePeddler(state: GameState, rng: () => number = Math.random): 'arrived' | 'unlocked' | null {
    if (!peddlerUnlocked(state)) return null;
    if (!state.peddler) {
        // The first visit comes soon after the unlock, so the player meets the peddler right away.
        state.peddler = {nextVisit: state.time + 30, stock: [], visits: 0};
        return 'unlocked';
    }
    const p = state.peddler;
    if (p.leavesAt !== undefined && state.time < p.leavesAt) return null;
    if (state.time >= p.nextVisit) {
        p.stock = rollStock(state, p.stock, rng);
        // Starts on schedule; a visit missed in full (only possible at high game speed) starts now instead.
        p.leavesAt = state.time >= p.nextVisit + VISIT_SECONDS ? state.time + VISIT_SECONDS : p.nextVisit + VISIT_SECONDS;
        p.nextVisit = p.leavesAt + gap(rng);
        p.visits++;
        return 'arrived';
    }
    // Away: unheld and sold offers from the last visit are gone.
    if (p.stock.some(o => !o.held || o.sold)) p.stock = p.stock.filter(o => o.held && !o.sold);
    return null;
}

export function offerPrice(state: GameState, offer: PeddlerOffer): number {
    const m = requireMaterial(offer.material);
    const base = SALVAGE_TIER_COST[Math.min(SALVAGE_TIER_COST.length - 1, m.power)] * PRICE_MULTIPLIER;
    // Counted on the plain material, so a premium costs exactly 5 times its plain version.
    const scarce = (state.obtained[plainKey(offer.material)] ?? 0) < RARE_FOUND ? RARE_MARKUP : 1;
    return Math.round(base * scarce * (isPremium(offer.material) ? PREMIUM_PRICE_MULTIPLIER : 1));
}

export function holdCount(state: GameState): number {
    return state.peddler?.stock.filter(o => o.held && !o.sold).length ?? 0;
}

export function holdCost(state: GameState): number {
    return HOLD_BASE * Math.pow(2, holdCount(state));
}

export function buyOffer(state: GameState, index: number): string | null {
    const offer = state.peddler?.stock[index];
    if (!offer || offer.sold) return 'That is gone.';
    if (!peddlerHere(state)) return 'The peddler is away.';
    const price = offerPrice(state, offer);
    if (state.gold < price) return `Needs ${price} gold.`;
    state.gold -= price;
    // Bought, not found, so it doesn't count toward materials found.
    state.materials[offer.material] = (state.materials[offer.material] ?? 0) + 1;
    offer.sold = true;
    offer.held = false;
    // Sold out: the peddler packs up and the time away starts now.
    const p = state.peddler!;
    if (p.stock.every(o => o.sold)) {
        p.leavesAt = state.time;
        p.nextVisit = state.time + gap(Math.random);
    }
    return null;
}

export function holdOffer(state: GameState, index: number): string | null {
    const offer = state.peddler?.stock[index];
    if (!offer || offer.sold || offer.held) return 'That can\'t be held.';
    const cost = holdCost(state);
    if (state.gold < cost) return `Needs ${cost} gold.`;
    state.gold -= cost;
    offer.held = true;
    return null;
}

export function releaseOffer(state: GameState, index: number) {
    const p = state.peddler;
    const offer = p?.stock[index];
    if (!p || !offer) return;
    offer.held = false;
    // Its visit is over, so it leaves the stock now.
    if (!peddlerHere(state)) p.stock.splice(index, 1);
}
