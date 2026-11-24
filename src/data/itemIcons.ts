// Painted icon variants for crafted items. An item's picture comes from the material that names it
// (the same one crafting picks for the name), whatever else went into the craft: its power sets the
// tier band, and its base's core stat for this item type sets the variant (the defense for armor, the
// element for weapons). Jewelry varies by tier only.
import type {ItemTypeKey, StatKey} from '../engine/types';
import {plainKey, requireMaterial} from './materials';
import {itemTypes} from './items';
import {getBaseStats} from '../engine/crafting';

export type IconTier = 'low' | 'mid' | 'high';
export function iconTier(power: number): IconTier {
    return power <= 5 ? 'low' : power <= 10 ? 'mid' : 'high';
}
const ARMOR_TYPES: ItemTypeKey[] = ['shield', 'helmet', 'bodyArmor', 'gloves', 'boots'];
const DEFENSE_OF: Partial<Record<StatKey, string>> = {armor: 'armor', blockChance: 'armor', increasedArmor: 'armor', evasion: 'evasion', increasedEvasion: 'evasion', ward: 'ward', hpLostAsWard: 'ward'};
const ELEMENT_OF: Partial<Record<StatKey, string>> = {fireDamage: 'fire', coldDamage: 'cold', lightningDamage: 'lightning'};

// The base's core stat: the one with a cap ([value, cap]).
function coreStat(itemType: ItemTypeKey, materialKey: string): StatKey | undefined {
    const base = getBaseStats(requireMaterial(materialKey), itemType);
    if (!base) return undefined;
    const entries = Object.entries(base.stats) as [StatKey, unknown][];
    return (entries.find(([, v]) => Array.isArray(v)) ?? entries[0])?.[0];
}

// e.g. "bodyArmor-mid-ward", "sword-high-fire", "ring-low".
export function iconVariant(itemType: ItemTypeKey, materialKey: string): string {
    const m = requireMaterial(plainKey(materialKey));
    const tier = iconTier(m.power);
    const core = coreStat(itemType, plainKey(materialKey));
    if (ARMOR_TYPES.includes(itemType)) return `${itemType}-${tier}-${(core && DEFENSE_OF[core]) ?? 'armor'}`;
    if (itemTypes[itemType].damageMultiplier) {
        const element = core && ELEMENT_OF[core];
        return element ? `${itemType}-${tier}-${element}` : `${itemType}-${tier}`;
    }
    return `${itemType}-${tier}`;
}
export function coreStatFor(itemType: ItemTypeKey, materialKey: string) { return coreStat(itemType, plainKey(materialKey)); }

// The base material that names a craft (same rule as previewCraft: highest labelPriority, else power;
// the first wins ties).
export function namingMaterial(itemType: ItemTypeKey, baseKeys: string[]): string | undefined {
    let best: string | undefined, bestPriority = -Infinity;
    for (const key of baseKeys) {
        const base = getBaseStats(requireMaterial(key), itemType);
        if (!base) continue;
        const priority = base.labelPriority ?? requireMaterial(key).power;
        if (priority > bestPriority) { bestPriority = priority; best = key; }
    }
    return best;
}
// A material worn directly as this item type: its own material picture stands in for the item.
export function wornMaterialFor(itemType: ItemTypeKey, materialKey: string | undefined): boolean {
    return !!materialKey && requireMaterial(plainKey(materialKey)).equip?.itemType === itemType;
}
