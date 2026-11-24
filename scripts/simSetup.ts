// Shared setup for the balance scripts: seeded RNG, gear sets, and a ready-to-run game state.
import {craftItem} from '../src/engine/crafting';
import {createAdventurer, createNewGame, equip} from '../src/engine/state';
import {getAdventurerStats, invalidateStats} from '../src/engine/stats';
import type {GameState, ItemTypeKey, SlotKey} from '../src/engine/types';

export function mulberry32(seed: number) {
    return () => {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

export type Gear = [SlotKey, ItemTypeKey, string[], string[]?][];

// Gear sets follow the starting limits: 2 base materials for weapons and armor, 1 for accessories.
export const commonGear: Gear = [
    ['mainHand', 'sword', ['copperOre', 'copperOre'], ['boneShard']],
    ['offHand', 'shield', ['copperOre', 'wood'], ['copperOre']],
    ['body', 'bodyArmor', ['copperOre', 'roughHide'], ['copperOre', 'roughHide']],
    ['head', 'helmet', ['copperOre', 'roughHide'], ['copperOre', 'roughHide']],
    ['gloves', 'gloves', ['copperOre', 'roughHide'], ['copperOre', 'roughHide']],
    ['boots', 'boots', ['copperOre', 'roughHide'], ['copperOre', 'roughHide']],
    ['belt', 'belt', ['roughHide']],
    ['amulet', 'amulet', ['boneShard'], ['boneShard', 'boneShard']],
    ['ring1', 'ring', ['copperOre'], ['boneShard']],
    ['ring2', 'ring', ['copperOre'], ['boneShard']],
];
export const partialCommonGear: Gear = commonGear.slice(0, 4);
export const uncommonGear: Gear = [
    ['mainHand', 'sword', ['ironOre', 'copperOre'], ['wolfFang', 'ironOre']],
    ['offHand', 'shield', ['ironOre', 'copperOre'], ['ironOre', 'ironOre']],
    ['body', 'bodyArmor', ['ironOre', 'tannedLeather'], ['ironOre', 'tannedLeather']],
    ...commonGear.slice(3, 6),
    ['belt', 'belt', ['tannedLeather'], ['tannedLeather']],
    ...commonGear.slice(7),
];
export const rareGear: Gear = [
    ['mainHand', 'sword', ['silverOre', 'ironOre'], ['wolfFang', 'moonstone']],
    ['offHand', 'shield', ['ironOre', 'ironOre'], ['ironOre', 'ironOre']],
    ['body', 'bodyArmor', ['ironOre', 'tannedLeather'], ['ironOre', 'tannedLeather']],
    ['head', 'helmet', ['ironOre', 'tannedLeather'], ['ironOre', 'tannedLeather']],
    ['gloves', 'gloves', ['ironOre', 'tannedLeather'], ['ironOre', 'tannedLeather']],
    ['boots', 'boots', ['ironOre', 'tannedLeather'], ['ironOre', 'tannedLeather']],
    ['belt', 'belt', ['tannedLeather'], ['tannedLeather', 'tannedLeather']],
    ['amulet', 'amulet', ['silverOre'], ['silverOre', 'wolfFang']],
    ['ring1', 'ring', ['wolfFang'], ['wolfFang', 'wolfFang']],
    ['ring2', 'ring', ['wolfFang'], ['wolfFang', 'wolfFang']],
];
// Same as rareGear, with Garnet in the armor for fire resistance against Quest 2's shamans.
export const fireResistGear: Gear = rareGear.map(([slot, type, base, deco]) =>
    ['body', 'head', 'gloves', 'boots'].includes(slot) ? [slot, type, ['ironOre', 'garnet'], deco] : [slot, type, base, deco]);
// Garnet armor plus a Garnet sword, whose fire damage ignores the Ore Golem's armor.
export const fireGear: Gear = fireResistGear.map(([slot, type, base, deco]) =>
    slot === 'mainHand' ? [slot, type, ['silverOre', 'garnet'], ['garnet', 'garnet']] : [slot, type, base, deco]);

// Common crafts that trade some armor and HP for recovery: moss armor, sinew gloves, a sinew-bound sword.
export const commonRecoveryGear: Gear = [
    ['mainHand', 'sword', ['copperOre', 'copperOre'], ['sinew']],
    ['offHand', 'shield', ['copperOre', 'wood'], ['copperOre']],
    ['body', 'bodyArmor', ['copperOre', 'healingMoss'], ['copperOre', 'healingMoss']],
    ['head', 'helmet', ['copperOre', 'roughHide'], ['copperOre', 'healingMoss']],
    ['gloves', 'gloves', ['sinew', 'roughHide'], ['sinew', 'roughHide']],
    ['boots', 'boots', ['hawkFeather', 'roughHide'], ['copperOre', 'healingMoss']],
    ['belt', 'belt', ['healingMoss']],
    ...commonGear.slice(7),
];
// Uncommon crafts leaning on Thornvine and Troll Blood.
export const uncommonRecoveryGear: Gear = [
    ['mainHand', 'sword', ['ironOre', 'thornvine'], ['thornvine', 'ironOre']],
    ['offHand', 'shield', ['ironOre', 'copperOre'], ['ironOre', 'ironOre']],
    ['body', 'bodyArmor', ['ironOre', 'trollBlood'], ['ironOre', 'trollBlood']],
    ['head', 'helmet', ['whetstone', 'roughHide'], ['copperOre', 'trollBlood']],
    ['gloves', 'gloves', ['thornvine', 'tannedLeather'], ['thornvine', 'roughHide']],
    ['boots', 'boots', ['copperOre', 'roughHide'], ['copperOre', 'trollBlood']],
    ['belt', 'belt', ['trollBlood'], ['tannedLeather']],
    ...commonGear.slice(7),
];

export function setup(level: number, gear: Gear, classKey = 'warrior'): GameState {
    const state = createNewGame();
    // A new game has no hero until the player picks a starter, so the sims make their own.
    delete state.starters;
    state.adventurers[0] = createAdventurer(state, 'Sim', classKey);
    const hero = state.adventurers[0];
    hero.level = level;
    // Most gear sets were written for 2 base and 2 decoration slots (1 base for accessories); sets
    // with more materials get the slots they use.
    const accessory = (t: ItemTypeKey) => ['belt', 'ring', 'amulet'].includes(t);
    const most = (pick: (g: Gear[number]) => number, acc: boolean, min: number) => Math.max(min, ...gear.filter(g => accessory(g[1]) === acc).map(pick));
    state.guild = {...state.guild,
        maxBaseMaterials: most(g => g[2].length, false, 2), maxAccessoryBaseMaterials: most(g => g[2].length, true, 1),
        maxDecorations: most(g => g[3]?.length ?? 0, false, 2), maxAccessoryDecorations: most(g => g[3]?.length ?? 0, true, 2)};
    for (const [slot, type, base, decorations = []] of gear) {
        for (const key of [...base, ...decorations]) {
            state.materials[key] = (state.materials[key] ?? 0) + 1;
        }
        const item = craftItem(state, type, base, decorations);
        if (typeof item === 'string') {
            throw new Error(`${slot}: ${item}`);
        }
        if (!equip(state, hero, {kind: 'crafted', id: item.id}, slot)) {
            throw new Error('Could not equip ' + item.name);
        }
    }
    invalidateStats();
    hero.hp = getAdventurerStats(state, hero).maxHealth;
    hero.xp = 0;
    state.gold = 1e6;
    state.fame = 1e6;
    state.achievements.push('clear-brambleRoad', 'clear-hollowMines', 'clear-ashenPeaks', 'clear-sunderedRift');
    return state;
}

// Hollow Mines uncommon and rare crafts: what a guild has around its first Hollow Mines clear.
export const minesGear: Gear = [
    ['mainHand', 'sword', ['steelIngot', 'mithril'], ['garnet', 'broodfang']],
    ['offHand', 'shield', ['steelIngot', 'steelIngot'], ['steelIngot', 'steelIngot']],
    ['body', 'bodyArmor', ['steelIngot', 'garnet'], ['steelIngot', 'garnet']],
    ['head', 'helmet', ['steelIngot', 'garnet'], ['steelIngot', 'trollHide']],
    ['gloves', 'gloves', ['steelIngot', 'trollHide'], ['steelIngot', 'steelIngot']],
    ['boots', 'boots', ['steelIngot', 'trollHide'], ['steelIngot', 'trollHide']],
    ['belt', 'belt', ['trollHide'], ['trollHide', 'trollHide']],
    ['amulet', 'amulet', ['mithril'], ['mithril', 'garnet']],
    ['ring1', 'ring', ['garnet'], ['garnet', 'garnet']],
    ['ring2', 'ring', ['garnet'], ['garnet', 'garnet']],
];
// The same with Rimecoal cold damage on the weapon and Salamander Scale armor: an early Ashen Peaks kit.
export const ashenStarterGear: Gear = minesGear.map(([slot, type, base, deco]) =>
    slot === 'mainHand' ? [slot, type, ['steelIngot', 'rimecoal'], ['rimecoal', 'rimecoal']]
    : ['body', 'head'].includes(slot) ? [slot, type, ['steelIngot', 'salamanderScale'], deco] : [slot, type, base, deco]);
// A finished Ashen Peaks kit with 4 base and 3 decoration slots (2 bases for accessories): an
// Obsidian cap filled with Steel, Wyrm Scale and Salamander armor, Glacial Heart cold on the weapon.
// What a guild has after expanding and farming the peaks for a while.
export const ashenEndGear: Gear = [
    ['mainHand', 'sword', ['obsidian', 'steelIngot', 'steelIngot', 'steelIngot'], ['glacialHeart', 'rimecoal', 'obsidian']],
    ['offHand', 'shield', ['wyrmScale', 'steelIngot', 'steelIngot', 'obsidian'], ['wyrmScale', 'obsidian', 'obsidian']],
    ['body', 'bodyArmor', ['wyrmScale', 'steelIngot', 'steelIngot', 'salamanderScale'], ['wyrmScale', 'salamanderScale', 'trollHide']],
    ['head', 'helmet', ['wyrmScale', 'steelIngot', 'steelIngot', 'salamanderScale'], ['wyrmScale', 'salamanderScale', 'obsidian']],
    ['gloves', 'gloves', ['obsidian', 'steelIngot', 'steelIngot', 'broodfang'], ['steelIngot', 'wyrmScale', 'obsidian']],
    ['boots', 'boots', ['wyrmScale', 'steelIngot', 'steelIngot', 'obsidian'], ['wyrmScale', 'salamanderScale', 'obsidian']],
    ['belt', 'belt', ['golemHeart', 'trollHide'], ['trollHide', 'cinderwool']],
    ['amulet', 'amulet', ['glacialHeart', 'glacialHeart'], ['glacialHeart', 'glacialHeart']],
    ['ring1', 'ring', ['salamanderScale', 'glacialHeart'], ['salamanderScale', 'salamanderScale']],
    ['ring2', 'ring', ['salamanderScale', 'glacialHeart'], ['salamanderScale', 'salamanderScale']],
];
// A Wizard in Hollow Mines gear with a staff, and the same Wizard built around ward: Moonstone and
// Ritual Ash armor that gains ward from HP lost, instead of the steel plate.
export const wizardMinesGear: Gear = minesGear.map(g => g[0] === 'mainHand' ? ['mainHand', 'staff', ['ritualAsh', 'moonstone'], ['moonstone', 'moonstone']] : g[0] === 'offHand' ? null : g).filter(Boolean) as Gear;
export const wizardWardGear: Gear = wizardMinesGear.map(([slot, type, base, deco]) =>
    slot === 'body' ? [slot, type, ['ritualAsh', 'moonstone'], ['moonstone', 'moonstone']]
    : slot === 'head' ? [slot, type, ['ritualAsh', 'moonstone'], ['ritualAsh', 'moonstone']]
    : slot === 'gloves' || slot === 'boots' ? [slot, type, ['moonstone', 'ritualAsh'], ['moonstone', 'moonstone']]
    : [slot, type, base, deco]);
