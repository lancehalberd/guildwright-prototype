// Build recipes: a hero's gear and what shapes it, as JSON that playtesters can copy from the Dev
// menu and report. scripts/simRecipe.ts runs a recipe against the quests, so strong player builds
// can sit next to the sims' own kits.
import {classes, quests} from '../data/quests';
import {requireMaterial} from '../data/materials';
import {slotOrder} from '../data/items';
import {gearPower} from './compare';
import {getActiveModifiers, getQuestProgress} from './state';
import {getAdventurerStats} from './stats';
import type {Adventurer, GameState, ItemTypeKey, SlotKey} from './types';

export const RECIPE_VERSION = 1;

export interface RecipeSlot {
    // A crafted item, by type and materials. Material items (worn as they are) only name the material.
    itemType?: ItemTypeKey
    base?: string[]
    decorations?: string[]
    material?: string
    name: string
}

export interface BuildRecipe {
    version: number
    // Free text for the tester: what the build is for and why it works.
    name: string
    notes: string
    classKey: string
    level: number
    passives?: Adventurer['passives']
    bonuses?: Adventurer['bonuses']
    slots: Partial<Record<SlotKey, RecipeSlot>>
    // Bench limits the guild had, so a sim can rebuild the items.
    guildSlots: {base: number, decorations: number, accessoryBase: number, accessoryDecorations: number}
    // Where the hero was pointed, for context.
    quest?: {key: string, name: string, modifiers: string[], bestEncounter: number, fullClears: number}
    // A snapshot of what the game computed, to check a sim rebuild against.
    summary: Record<string, number | string>
}

export function exportBuild(state: GameState, hero: Adventurer): BuildRecipe {
    const slots: BuildRecipe['slots'] = {};
    for (const slot of slotOrder) {
        const ref = hero.equipment[slot];
        if (!ref) continue;
        if (ref.kind === 'crafted') {
            const item = state.craftedItems.find(i => i.id === ref.id);
            if (item) slots[slot] = {itemType: item.itemType, base: [...item.base], decorations: [...item.decorations], name: item.name};
        } else {
            slots[slot] = {material: ref.key, name: requireMaterial(ref.key).name};
        }
    }
    const stats = getAdventurerStats(state, hero);
    const power = gearPower(stats, hero.level);
    const questKey = hero.assignment?.questKey ?? hero.run?.questKey;
    const quest = questKey ? quests[questKey] : undefined;
    const progress = quest ? getQuestProgress(state, quest.key) : undefined;
    const g = state.guild;
    const r = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
    return {
        version: RECIPE_VERSION,
        name: `${classes[hero.classKey].name} level ${hero.level}${quest ? ` for ${quest.name}` : ''}`,
        notes: '',
        classKey: hero.classKey,
        level: hero.level,
        ...(hero.passives?.length ? {passives: hero.passives} : {}),
        ...(hero.bonuses && Object.keys(hero.bonuses).length ? {bonuses: hero.bonuses} : {}),
        slots,
        guildSlots: {base: g.maxBaseMaterials, decorations: g.maxDecorations, accessoryBase: g.maxAccessoryBaseMaterials, accessoryDecorations: g.maxAccessoryDecorations ?? g.maxDecorations},
        ...(quest && progress ? {quest: {key: quest.key, name: quest.name, modifiers: getActiveModifiers(state, hero, quest), bestEncounter: progress.bestEncounter + 1, fullClears: progress.fullClears}} : {}),
        summary: {
            maxHealth: stats.maxHealth, maxWard: stats.maxWard, str: stats.str, dex: stats.dex, int: stats.int,
            damagePerHit: r(stats.damagePerHit), attacksPerSecond: r(stats.attacksPerSecond), accuracy: r(stats.accuracy, 0),
            critChance: r(stats.critChance), armor: r(stats.armor, 0), evasion: r(stats.evasion, 0), blockChance: r(stats.blockChance),
            fireResist: r(stats.resist.fire ?? 0), coldResist: r(stats.resist.cold ?? 0), lightningResist: r(stats.resist.lightning ?? 0),
            lifeRegen: r(stats.lifeRegen), lifeLeech: r(stats.lifeLeech), lifeOnHit: r(stats.lifeOnHit),
            dps: r(power.dps, 1), toughness: r(power.toughness, 1), wield: stats.wieldNote || stats.weaponName,
        },
    };
}
