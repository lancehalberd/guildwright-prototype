import {requireMaterial} from '../data/materials';
import {isItemEquipped} from './state';
import type {GameState} from './types';

// Salvage yard: takes a crafted item apart to recover some of its materials. It appears with Guild
// Expansion 4 and has to be built. It starts by recovering one material per item; each later
// expansion opens an upgrade for one more, up to four. Each material past the first doubles the
// price, so four materials cost 8x.

export const SALVAGE_EXPANSION = 4;
export const SALVAGE_MAX = 4;
// Gold to build (level 1) and to upgrade to each further level. Level n needs expansion n + 3.
export const SALVAGE_LEVEL_GOLD = [0, 10000, 40000, 80000, 160000];
// Price to recover one material, by material tier (power).
export const SALVAGE_TIER_COST = [0, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000];

export function salvageLevel(state: GameState): number {
    return state.salvageLevel ?? 0;
}

// The yard shows on the map once the guild has expanded far enough.
export function salvageVisible(state: GameState): boolean {
    return salvageLevel(state) > 0 || (state.expansion ?? 0) >= SALVAGE_EXPANSION;
}

// The next build or upgrade, and what blocks it. Undefined when fully upgraded.
export function nextSalvageLevel(state: GameState): {level: number, gold: number, expansion: number, blocked: string | null} | undefined {
    const level = salvageLevel(state) + 1;
    if (level > SALVAGE_MAX) return undefined;
    const expansion = SALVAGE_EXPANSION + level - 1;
    const gold = SALVAGE_LEVEL_GOLD[level];
    const blocked = (state.expansion ?? 0) < expansion ? `Requires Guild Expansion ${expansion}` : state.gold < gold ? `Needs ${gold} gold` : null;
    return {level, gold, expansion, blocked};
}

export function upgradeSalvage(state: GameState): boolean {
    const next = nextSalvageLevel(state);
    if (!next || next.blocked) return false;
    state.gold -= next.gold;
    state.salvageLevel = next.level;
    return true;
}

// Price for recovering these materials: the priciest one's tier cost, doubled for each extra.
export function salvageCost(materials: string[]): number {
    if (!materials.length) return 0;
    const top = Math.max(...materials.map(k => SALVAGE_TIER_COST[Math.min(SALVAGE_TIER_COST.length - 1, requireMaterial(k).power)]));
    return top * Math.pow(2, materials.length - 1);
}

// The item's materials, bases then decorations, as picked by index.
export function itemMaterials(state: GameState, itemId: string): string[] {
    const item = state.craftedItems.find(i => i.id === itemId);
    return item ? [...item.base, ...item.decorations] : [];
}

export function salvageBlocked(state: GameState, itemId: string, picks: number[]): string | null {
    const level = salvageLevel(state);
    if (!level) return 'Build the salvage yard first';
    const item = state.craftedItems.find(i => i.id === itemId);
    if (!item) return 'That item is gone';
    if (isItemEquipped(state, itemId)) return 'Unequip it first';
    if (!picks.length) return 'Pick a material to recover';
    if (picks.length > level) return `The yard recovers up to ${level} material${level === 1 ? '' : 's'}`;
    const all = itemMaterials(state, itemId);
    const cost = salvageCost(picks.map(i => all[i]));
    if (state.gold < cost) return `Needs ${cost} gold`;
    return null;
}

// Destroys the item and returns the picked materials to the guild.
export function salvageItem(state: GameState, itemId: string, picks: number[]): string[] | string {
    const blocked = salvageBlocked(state, itemId, picks);
    if (blocked) return blocked;
    const all = itemMaterials(state, itemId);
    const materials = [...new Set(picks)].map(i => all[i]).filter(Boolean);
    state.gold -= salvageCost(materials);
    state.craftedItems = state.craftedItems.filter(i => i.id !== itemId);
    // Recovered, not newly found, so it doesn't count toward materials obtained.
    for (const key of materials) state.materials[key] = (state.materials[key] ?? 0) + 1;
    return materials;
}
