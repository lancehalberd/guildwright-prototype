import {itemTypes, slotOrder} from '../data/items';
import {materialOrder, requireMaterial} from '../data/materials';
import {compareGear, gearPower} from './compare';
import {canEquipInSlot, equip, isItemEquipped, unequip} from './state';
import {getAdventurerStats, invalidateStats, resolveItemRef} from './stats';
import type {Adventurer, GameState, ItemRef, SlotKey} from './types';

// Auto equip: the hands first (see equipHands), then down the rest of the hero's slots in order and puts on, in each, the free item that raises
// DPS % + toughness % the most against the current gear (as the gear picker shows them). A slot
// keeps its item when nothing scores above it. Never takes an item another member is wearing.
// Each slot is judged with the slots before it already changed, so a two-handed weapon picked
// for the main hand leaves the off hand blocked.

function pct(before: number, after: number): number {
    return before > 0 ? after / before - 1 : after > 0 ? 1 : 0;
}

export function gearScore(state: GameState, hero: Adventurer, slot: SlotKey, ref: ItemRef): number {
    const c = compareGear(state, hero, slot, ref);
    return pct(c.dps.before, c.dps.after) + pct(c.toughness.before, c.toughness.after);
}

function candidates(state: GameState, hero: Adventurer, slot: SlotKey): ItemRef[] {
    const out: ItemRef[] = [];
    for (const item of state.craftedItems) {
        const ref: ItemRef = {kind: 'crafted', id: item.id};
        if (!isItemEquipped(state, item.id) && canEquipInSlot(state, hero, ref, slot)) out.push(ref);
    }
    for (const key of materialOrder) {
        const ref: ItemRef = {kind: 'material', key};
        if ((state.materials[key] ?? 0) > 0 && requireMaterial(key).equip && canEquipInSlot(state, hero, ref, slot)) out.push(ref);
    }
    return out;
}

function isTwoHanded(state: GameState, ref: ItemRef): boolean {
    const item = resolveItemRef(state, ref);
    return !!item && !!itemTypes[item.itemType].twoHanded;
}

// The best candidate for a slot by gear score, among those passing `keep`. With `floor`, only one
// that beats the current gear by more than it.
function bestFor(state: GameState, hero: Adventurer, slot: SlotKey, keep: (ref: ItemRef) => boolean, floor: number | null): ItemRef | null {
    let best: ItemRef | null = null;
    let bestScore = floor ?? -Infinity;
    for (const ref of candidates(state, hero, slot)) {
        if (!keep(ref)) continue;
        const score = gearScore(state, hero, slot, ref);
        if (score > bestScore) {
            best = ref;
            bestScore = score;
        }
    }
    return best;
}

// DPS % + toughness % of the hero's gear in `after` against the gear they started with.
function totalScore(before: GameState, hero: Adventurer, after: GameState, changed: Adventurer): number {
    const b = gearPower(getAdventurerStats(before, hero), hero.level);
    const a = gearPower(getAdventurerStats(after, changed), changed.level);
    return pct(b.dps, a.dps) + pct(b.toughness, a.toughness);
}

// The hands, as a pair: the best one-handed weapon then the best off hand, against the best
// two-handed weapon alone. Each is tried on a copy of the game and the better one (if it beats the
// current hands) is put on for real.
function equipHands(state: GameState, hero: Adventurer): SlotKey[] {
    const heroIndex = state.adventurers.indexOf(hero);
    // Pair: one-hander, then off hand.
    const pairState = structuredClone(state);
    const pairHero = pairState.adventurers[heroIndex];
    const main = hero.equipment.mainHand;
    if (main && isTwoHanded(state, main)) unequip(pairState, pairHero, 'mainHand');
    invalidateStats();
    const oneHand = bestFor(pairState, pairHero, 'mainHand', ref => !isTwoHanded(pairState, ref), pairHero.equipment.mainHand ? 0.001 : null);
    if (oneHand) equip(pairState, pairHero, oneHand, 'mainHand');
    invalidateStats();
    const offHand = bestFor(pairState, pairHero, 'offHand', () => true, 0.001);
    if (offHand) equip(pairState, pairHero, offHand, 'offHand');
    invalidateStats();
    const pairScore = totalScore(state, hero, pairState, pairHero);
    // Two-hander alone.
    const twoState = structuredClone(state);
    const twoHero = twoState.adventurers[heroIndex];
    const twoHand = bestFor(twoState, twoHero, 'mainHand', ref => isTwoHanded(twoState, ref), null);
    if (twoHand) equip(twoState, twoHero, twoHand, 'mainHand');
    invalidateStats();
    const twoScore = twoHand ? totalScore(state, hero, twoState, twoHero) : -Infinity;
    invalidateStats();
    const changed: SlotKey[] = [];
    if (twoScore > 0.001 && twoScore >= pairScore) {
        if (equip(state, hero, twoHand!, 'mainHand')) changed.push('mainHand');
    } else if (pairScore > 0.001) {
        if (main && isTwoHanded(state, main) && oneHand) unequip(state, hero, 'mainHand');
        if (oneHand && equip(state, hero, oneHand, 'mainHand')) changed.push('mainHand');
        if (offHand && equip(state, hero, offHand, 'offHand')) changed.push('offHand');
    }
    invalidateStats();
    return changed;
}

// Returns the slots that changed.
export function autoEquip(state: GameState, hero: Adventurer): SlotKey[] {
    const changed = equipHands(state, hero);
    for (const slot of slotOrder) {
        if (slot === 'mainHand' || slot === 'offHand') continue;
        // Small floor so rounding noise never swaps an item for an equal one.
        const best = bestFor(state, hero, slot, () => true, 0.001);
        if (best && equip(state, hero, best, slot)) {
            changed.push(slot);
            invalidateStats();
        }
    }
    return changed;
}
