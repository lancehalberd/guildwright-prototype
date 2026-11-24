import type {ItemType, ItemTypeKey, SlotKey} from '../engine/types';

export const slotNames: Record<SlotKey, string> = {
    mainHand: 'Main hand',
    offHand: 'Off hand',
    head: 'Head',
    body: 'Body',
    gloves: 'Gloves',
    boots: 'Boots',
    belt: 'Belt',
    amulet: 'Amulet',
    ring1: 'Ring',
    ring2: 'Ring',
};
export const slotOrder: SlotKey[] = ['mainHand', 'offHand', 'head', 'body', 'gloves', 'boots', 'belt', 'amulet', 'ring1', 'ring2'];

const list: ItemType[] = [
    // Weapons. Each favors its own mix of core attributes through the materials that craft it:
    // greatsword Str, bow Dex, wand Int, axe Str+Dex, dagger Dex+Int, staff Int+Str, sword all three.
    // One-handed weapons. One in each hand is dual wielding: swings alternate between them at 1.5x the pace.
    // Each leans a little toward its own stats through statMultipliers.
    {key: 'sword', name: 'Sword', noun: 'Sword', slots: ['mainHand', 'offHand'], tags: ['sword', 'oneHanded', 'weapon'], attacksPerSecond: 1.4, damageMultiplier: 1,
        statMultipliers: {accuracy: 1.15, attackSpeed: 1.1}},
    {key: 'axe', name: 'Axe', noun: 'Axe', slots: ['mainHand', 'offHand'], tags: ['axe', 'oneHanded', 'weapon'], attacksPerSecond: 1.2, damageMultiplier: 1.2,
        statMultipliers: {critMultiplier: 1.2, lifeLeech: 1.15, accuracy: 0.9}},
    {key: 'dagger', name: 'Dagger', noun: 'Dagger', slots: ['mainHand', 'offHand'], tags: ['dagger', 'oneHanded', 'weapon'], attacksPerSecond: 1.8, damageMultiplier: 0.75,
        statMultipliers: {critChance: 1.25, lifeLeech: 0.8}},
    {key: 'wand', name: 'Wand', noun: 'Wand', slots: ['mainHand', 'offHand'], tags: ['wand', 'oneHanded', 'weapon'], attacksPerSecond: 1.3, damageMultiplier: 0.9,
        statMultipliers: {increasedElementalDamage: 1.15, igniteChance: 1.25, chillChance: 1.25, shockChance: 1.25}},
    // Two-handed weapons block the off hand, so their secondary stats and decorations count for
    // about 1.6 times as much: roughly what a second item in the off hand would add.
    {key: 'greatsword', name: 'Greatsword', noun: 'Greatsword', slots: ['mainHand'], tags: ['greatsword', 'twoHanded', 'weapon'], twoHanded: true, attacksPerSecond: 0.9, damageMultiplier: 2,
        secondaryMultiplier: 1.6, statMultipliers: {critMultiplier: 2, str: 1.8, lifeLeech: 1.8, maxHealth: 1.8, attackSpeed: 1.3, accuracy: 1.4}},
    {key: 'bow', name: 'Bow', noun: 'Bow', slots: ['mainHand'], tags: ['bow', 'twoHanded', 'weapon'], twoHanded: true, attacksPerSecond: 1.1, damageMultiplier: 1.6,
        secondaryMultiplier: 1.6, statMultipliers: {accuracy: 2, critChance: 1.9, dex: 1.8, attackSpeed: 1.7, igniteChance: 1.8, chillChance: 1.8, shockChance: 1.8, lifeLeech: 1.3}},
    {key: 'staff', name: 'Staff', noun: 'Staff', slots: ['mainHand'], tags: ['staff', 'twoHanded', 'weapon'], twoHanded: true, attacksPerSecond: 1, damageMultiplier: 1.7,
        secondaryMultiplier: 1.6, statMultipliers: {int: 2, increasedElementalDamage: 2, ailmentEffect: 2, critChance: 1.5, attackSpeed: 1.3, lifeLeech: 1.3}},
    // Off hand.
    {key: 'shield', name: 'Shield', noun: 'Shield', slots: ['offHand'], tags: ['shield', 'offHand', 'armor'], armorMultiplier: 0.8},
    // Armor. Material armor values are "body armor equivalents" scaled per piece.
    {key: 'helmet', name: 'Helmet', noun: 'Helm', slots: ['head'], tags: ['helmet', 'smallArmor', 'armor'], armorMultiplier: 0.6},
    {key: 'bodyArmor', name: 'Body armor', noun: 'Armor', slots: ['body'], tags: ['bodyArmor', 'armor'], armorMultiplier: 1},
    {key: 'gloves', name: 'Gloves', noun: 'Gloves', slots: ['gloves'], tags: ['gloves', 'smallArmor', 'armor'], armorMultiplier: 0.4},
    {key: 'boots', name: 'Boots', noun: 'Boots', slots: ['boots'], tags: ['boots', 'smallArmor', 'armor'], armorMultiplier: 0.5},
    // Accessories.
    {key: 'belt', name: 'Belt', noun: 'Belt', slots: ['belt'], tags: ['belt', 'accessory'], armorMultiplier: 0.5},
    {key: 'ring', name: 'Ring', noun: 'Ring', slots: ['ring1', 'ring2'], tags: ['ring', 'accessory']},
    {key: 'amulet', name: 'Amulet', noun: 'Amulet', slots: ['amulet'], tags: ['amulet', 'accessory'], armorMultiplier: 0.8},
];

export const itemTypes = Object.fromEntries(list.map(t => [t.key, t])) as Record<ItemTypeKey, ItemType>;
export const itemTypeOrder: ItemTypeKey[] = list.map(t => t.key);
