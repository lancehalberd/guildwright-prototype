import type {ClassDef, EncounterDef, EncounterTier, GameState, MonsterDef, QuestDef} from '../engine/types';
import {questModifiers, riteModifier} from './modifiers';
import {passives} from './passives';

// Classes come in tiers that open with applicant tiers. Each tier grows one more attribute point
// per level than the one before, spread evenly across its three classes: 211, 221, 411, 331, 422,
// and at the top a balanced 333 and a 111 wildcard that rolls three core passives.
export const classes: Record<string, ClassDef> = {
    warrior: {key: 'warrior', suits: {weapons: ['sword', 'axe', 'greatsword'], defenses: ['armor', 'blockChance']}, name: 'Warrior', coreStat: 'str', tier: 0, growth: {str: 2, dex: 1, int: 1}, starterWeapon: 'sword', names: ['Brenna', 'Garrick', 'Hild', 'Bram', 'Petra'],
        description: 'Grows Str: more HP and physical damage. Starts with a wooden sword and a free off hand.',
        passiveKey: 'fury', passive: {name: passives.fury.name, description: passives.fury.text(1)}},
    ranger: {key: 'ranger', suits: {weapons: ['bow'], defenses: ['evasion']}, name: 'Ranger', coreStat: 'dex', tier: 0, growth: {str: 1, dex: 2, int: 1}, starterWeapon: 'bow', names: ['Ryn', 'Tamsin', 'Wren', 'Corin', 'Ash'],
        description: 'Grows Dex: evasion and accuracy. Starts with a wooden longbow.',
        passiveKey: 'followThrough', passive: {name: passives.followThrough.name, description: passives.followThrough.text(1)}},
    priest: {key: 'priest', suits: {weapons: ['staff', 'wand'], defenses: ['ward']}, name: 'Priest', coreStat: 'int', tier: 0, growth: {str: 1, dex: 1, int: 2}, starterWeapon: 'staff', names: ['Isolde', 'Mirek', 'Sable', 'Odo', 'Vesna'],
        description: 'Grows Int: crit chance and elemental damage. Starts with a wooden staff.',
        passiveKey: 'siphonWard', passive: {name: passives.siphonWard.name, description: passives.siphonWard.text(1)}},
    reaver: {key: 'reaver', suits: {weapons: ['axe', 'greatsword'], defenses: ['armor', 'evasion']}, name: 'Reaver', coreStat: 'str', tier: 1, growth: {str: 2, dex: 2, int: 1}, starterWeapon: 'axe', names: ['Hask', 'Torva', 'Grim', 'Ulla', 'Bjorn'],
        description: 'Grows Str and Dex: HP, damage, evasion and accuracy. Starts with a wooden axe.',
        passiveKey: 'cleave', passive: {name: passives.cleave.name, description: passives.cleave.text(1)}},
    spellblade: {key: 'spellblade', suits: {weapons: ['dagger', 'sword'], defenses: ['evasion', 'ward']}, name: 'Spellblade', coreStat: 'dex', tier: 1, growth: {str: 1, dex: 2, int: 2}, starterWeapon: 'dagger', names: ['Lys', 'Corvin', 'Ilsa', 'Maren', 'Quill'],
        description: 'Grows Dex and Int: evasion, accuracy, crit chance and ward. Starts with a wooden dagger.',
        passiveKey: 'riposte', passive: {name: passives.riposte.name, description: passives.riposte.text(1)}},
    battlemage: {key: 'battlemage', suits: {weapons: ['staff', 'wand'], defenses: ['ward', 'armor']}, name: 'Battlemage', coreStat: 'int', tier: 1, growth: {str: 2, dex: 1, int: 2}, starterWeapon: 'staff', names: ['Aldric', 'Seren', 'Tobin', 'Ysolde', 'Kael'],
        description: 'Grows Int and Str: ward, HP and damage. Starts with a wooden staff.',
        passiveKey: 'spellward', passive: {name: passives.spellward.name, description: passives.spellward.text(1)}},
    monk: {key: 'monk', suits: {weapons: [], defenses: ['armor', 'evasion'], note: 'Empty hands, no shield'}, name: 'Monk', coreStat: 'str', tier: 2, growth: {str: 4, dex: 1, int: 1}, names: ['Shen', 'Ilka', 'Doran', 'Mei', 'Tarek'],
        description: 'Grows Str: HP and damage. Fights with empty hands, and starts with nothing in them.',
        passiveKey: 'martialArts', passive: {name: passives.martialArts.name, description: passives.martialArts.text(1)}},
    ninja: {key: 'ninja', suits: {weapons: ['dagger'], defenses: ['evasion'], note: 'Dual wielded'}, name: 'Ninja', coreStat: 'dex', tier: 2, growth: {str: 1, dex: 4, int: 1}, starterWeapon: 'dagger', starterOffHand: 'dagger', names: ['Kaede', 'Sorrel', 'Jin', 'Nyx', 'Hollis'],
        description: 'Grows Dex: evasion and accuracy. Starts with a wooden dagger in each hand.',
        passiveKey: 'dualMastery', passive: {name: passives.dualMastery.name, description: passives.dualMastery.text(1)}},
    wizard: {key: 'wizard', suits: {weapons: ['wand', 'staff'], defenses: ['ward']}, name: 'Wizard', coreStat: 'int', tier: 2, growth: {str: 1, dex: 1, int: 4}, starterWeapon: 'wand', names: ['Alaric', 'Morwen', 'Zephyr', 'Ondine', 'Cyprian'],
        description: 'Grows Int: crit chance, ward and elemental damage. Starts with a wooden wand.',
        passiveKey: 'elementalMastery', passive: {name: passives.elementalMastery.name, description: passives.elementalMastery.text(1)}},
    gladiator: {key: 'gladiator', suits: {weapons: ['sword', 'axe'], defenses: ['blockChance', 'armor', 'evasion'], note: 'With a shield'}, name: 'Gladiator', coreStat: 'str', tier: 3, growth: {str: 3, dex: 3, int: 1}, starterWeapon: 'sword', starterOffHand: 'shield', names: ['Varro', 'Lucia', 'Draco', 'Brisa', 'Maximo'],
        description: 'Grows Str and Dex: HP, damage, evasion and accuracy. Starts with a wooden sword and shield.',
        passiveKey: 'counterstrike', passive: {name: passives.counterstrike.name, description: passives.counterstrike.text(1)}},
    saboteur: {key: 'saboteur', suits: {weapons: ['dagger', 'wand'], defenses: ['evasion', 'ward'], note: 'Ignite, chill and shock'}, name: 'Saboteur', coreStat: 'dex', tier: 3, growth: {str: 1, dex: 3, int: 3}, starterWeapon: 'dagger', names: ['Vex', 'Nettle', 'Rask', 'Sienna', 'Tobias'],
        description: 'Grows Dex and Int: evasion, accuracy, crit chance and ward. Starts with a wooden dagger.',
        passiveKey: 'exploit', passive: {name: passives.exploit.name, description: passives.exploit.text(1)}},
    bloodmage: {key: 'bloodmage', suits: {weapons: ['staff', 'greatsword'], defenses: ['armor', 'ward'], note: 'Life regen and leech'}, name: 'Bloodmage', coreStat: 'int', tier: 3, growth: {str: 3, dex: 1, int: 3}, starterWeapon: 'staff', names: ['Morrigan', 'Sanguin', 'Ilyra', 'Corvus', 'Ezra'],
        description: 'Grows Int and Str: ward, HP and damage. Starts with a wooden staff.',
        passiveKey: 'bloodPact', passive: {name: passives.bloodPact.name, description: passives.bloodPact.text(1)}},
    berserker: {key: 'berserker', suits: {weapons: ['axe', 'greatsword'], defenses: ['armor'], note: 'Dual wielded axes; big HP and recovery'}, name: 'Berserker', coreStat: 'str', tier: 4, growth: {str: 4, dex: 2, int: 2}, starterWeapon: 'axe', starterOffHand: 'axe', names: ['Ragna', 'Thorvald', 'Ysra', 'Gunnar', 'Sigrun'],
        description: 'Grows Str most: HP and damage. Starts with a wooden axe in each hand.',
        passiveKey: 'rampage', passive: {name: passives.rampage.name, description: passives.rampage.text(1)}},
    marksman: {key: 'marksman', suits: {weapons: ['bow'], defenses: ['evasion'], note: 'Accuracy for big single hits'}, name: 'Marksman', coreStat: 'dex', tier: 4, growth: {str: 2, dex: 4, int: 2}, starterWeapon: 'bow', names: ['Hawke', 'Linnea', 'Orrin', 'Talia', 'Severin'],
        description: 'Grows Dex most: evasion and accuracy. Starts with a wooden longbow.',
        passiveKey: 'deadeye', passive: {name: passives.deadeye.name, description: passives.deadeye.text(1)}},
    warlock: {key: 'warlock', suits: {weapons: ['wand', 'staff'], defenses: ['ward'], note: 'Ignite, chill and shock'}, name: 'Warlock', coreStat: 'int', tier: 4, growth: {str: 2, dex: 2, int: 4}, starterWeapon: 'wand', names: ['Malachai', 'Ysmay', 'Drust', 'Hespera', 'Oren'],
        description: 'Grows Int most: crit chance, ward and elemental damage. Starts with a wooden wand.',
        passiveKey: 'hex', passive: {name: passives.hex.name, description: passives.hex.text(1)}},
    champion: {key: 'champion', suits: {weapons: ['sword', 'greatsword', 'bow'], defenses: ['armor', 'evasion', 'ward']}, name: 'Champion', coreStat: 'str', tier: 5, growth: {str: 3, dex: 3, int: 3}, starterWeapon: 'sword', names: ['Aurelia', 'Cassian', 'Thea', 'Leander', 'Isra'],
        description: 'Grows every attribute evenly. Starts with a wooden sword.',
        special: 'enhanced', passive: {name: 'Paragon', description: 'Rolls one core passive from another class, enhanced.'}},
    vagabond: {key: 'vagabond', suits: {weapons: [], defenses: [], note: 'Whatever its rolled passives favor'}, name: 'Vagabond', coreStat: 'str', tier: 5, growth: {str: 1, dex: 1, int: 1}, starterWeapon: 'sword', names: ['Pip', 'Moss', 'Rook', 'Juniper', 'Fen'],
        description: 'Grows slowly, but knows a bit of everything. Starts with a wooden sword.',
        special: 'wildcard', passive: {name: 'Jack of all trades', description: 'Rolls three different core passives from other classes.'}},
    // Never rolled as a class: an applicant whose five rare bonuses all come up cursed becomes one.
    emptyVessel: {key: 'emptyVessel', suits: {weapons: [], defenses: [], note: 'Nothing in particular'}, name: 'Empty Vessel', coreStat: 'str', tier: 5, growth: {str: 0, dex: 0, int: 0}, names: ['Hollow', 'Wick', 'Ash', 'Nobody', 'Echo'],
        description: 'Grows nothing on its own. Whatever it becomes, its gear makes it.',
        hidden: true, passive: {name: 'Emptiness', description: 'No core passive.'}},
};
// The attributes a class grows fastest; their average adds to damage.
export function damageStats(cls: ClassDef): ('str' | 'dex' | 'int')[] {
    const top = Math.max(cls.growth.str, cls.growth.dex, cls.growth.int);
    return (['str', 'dex', 'int'] as const).filter(k => cls.growth[k] === top);
}
export function classPassive(classKey: string) {
    return classes[classKey]?.passiveKey;
}

// Monster stats are multipliers on an encounter's baseline, which scales with encounter power.
const monsterList: MonsterDef[] = [
    // Quest 1: Bramble Road
    {key: 'rat', name: 'Giant Rat', hp: 0.45, damage: 0.6, attacksPerSecond: 1.5, armor: 0, evasion: 1.5, abilities: [{name: 'Gnaw', every: 4, damage: 0.6, applies: {ailment: 'bleed', amount: 0.5}, effect: 'bleed'}], basics: ['bite', 'scratch']},
    {key: 'goblin', name: 'Goblin', hp: 1, damage: 1, attacksPerSecond: 1, armor: 0, abilities: [{name: 'Rusty Shiv', every: 4, damage: 0.8, applies: {ailment: 'bleed', amount: 0.5}, effect: 'bleed'}], basics: ['stab', 'slash']},
    {key: 'wolf', name: 'Wolf', hp: 0.9, damage: 1.1, attacksPerSecond: 1.3, armor: 0, evasion: 1.5, abilities: [{name: 'Pounce', every: 3, damage: 1.4, accuracy: 0.85, effect: 'bite'}], basics: ['bite']},
    {key: 'bandit', name: 'Bandit', hp: 1.2, damage: 1.2, attacksPerSecond: 1, armor: 1, accuracy: 1.2, abilities: [{name: 'Pocket Sand', every: 4, spell: true, applies: {ailment: 'blind', amount: 0.25}, effect: 'dust'}], basics: ['slash', 'stab']},
    {key: 'goblinBrute', name: 'Goblin Brute', hp: 2.2, damage: 1.4, attacksPerSecond: 0.8, armor: 1, evasion: 0.5, accuracy: 0.8, abilities: [{name: 'Heavy Swing', every: 3, damage: 1.6, accuracy: 0.75, effect: 'smash'}], basics: ['smash']},
    {key: 'alphaWolf', name: 'Alpha Wolf', hp: 1.8, damage: 1.15, attacksPerSecond: 1.3, armor: 0.5, evasion: 1.5, abilities: [{name: 'Rending Bite', every: 3, damage: 1, applies: {ailment: 'bleed', amount: 0.6}, effect: 'bleed'}], basics: ['bite', 'scratch']},
    {key: 'banditCaptain', name: 'Bandit Captain', hp: 2.5, damage: 1.6, attacksPerSecond: 1, armor: 1.5, accuracy: 1.3, abilities: [{name: 'Rally', every: 8, rally: {amount: 0.15, turns: 3}, effect: 'rally'}], basics: ['slash']},
    {key: 'troll', name: 'Bridge Troll', hp: 6, damage: 2, attacksPerSecond: 0.7, armor: 2, evasion: 0.3, accuracy: 0.8, abilities: [{name: 'Club Smash', every: 3, damage: 1.4, accuracy: 0.75, effect: 'smash'}, {name: 'Troll Blood', every: 6, heal: 0.04, effect: 'heal'}], basics: ['smash', 'slam']},
    // Quest 2: Hollow Mines
    {key: 'kobold', name: 'Kobold', hp: 0.9, damage: 1, attacksPerSecond: 1.2, armor: 0.5, abilities: [{name: 'Rock Toss', every: 3, damage: 1.3, accuracy: 0.75, effect: 'throw'}], basics: ['stab']},
    {key: 'caveSpider', name: 'Cave Spider', hp: 0.8, damage: 1.2, attacksPerSecond: 1.4, armor: 0, evasion: 2, accuracy: 1.3, abilities: [{name: 'Web Shot', every: 4, damage: 0.4, applies: {ailment: 'snare', amount: 0.15}, effect: 'web'}], basics: ['bite']},
    {key: 'skeleton', name: 'Skeleton Miner', hp: 1.3, damage: 1.1, attacksPerSecond: 1, armor: 1.5, resist: {cold: 0.5}, basics: [['throw', 'Bone Throw'], 'smash']},
    // Weak hangers-on: every monster in a group attacks all fight, so most groups pair one real
    // threat with one of these.
    {key: 'caveBat', flying: true, name: 'Cave Bat', hp: 0.45, damage: 0.6, attacksPerSecond: 1.5, armor: 0, evasion: 1.8, accuracy: 1.1, abilities: [{name: 'Sonar Screech', every: 5, spell: true, applies: {ailment: 'weaken', amount: 0.15}, effect: 'sonar'}], basics: ['bite']},
    {key: 'koboldShaman', name: 'Kobold Shaman', hp: 1.8, damage: 1.7, attacksPerSecond: 0.9, armor: 0.5, accuracy: 1.3, damageTypes: {fire: 1}, resist: {fire: 0.5}, abilities: [{name: 'Kindle', every: 4, spell: true, applies: {ailment: 'burn', amount: 0.3}, effect: 'kindle'}], basics: [['bolt', 'Fire Bolt']]},
    // Quest 3: Ashen Peaks. Fire damage and heavy armor; most of them are weak to cold.
    {key: 'emberMote', flying: true, name: 'Ember Mote', hp: 0.45, damage: 0.6, attacksPerSecond: 1.4, armor: 0, evasion: 1.5, damageTypes: {fire: 1}, resist: {fire: 0.75, cold: -0.5}, abilities: [{name: 'Blinding Flare', every: 4, spell: true, applies: {ailment: 'blind', amount: 0.2}, effect: 'dust'}], basics: [['touch', 'Ember Touch']]},
    {key: 'ashImp', name: 'Ash Imp', hp: 0.8, damage: 1, attacksPerSecond: 1.3, armor: 0.5, evasion: 1.3, damageTypes: {fire: 1}, resist: {fire: 0.5, cold: -0.3}, basics: [['scratch', 'Searing Claw'], ['bolt', 'Cinder Bolt']]},
    {key: 'cinderHound', name: 'Cinder Hound', hp: 1, damage: 1.1, attacksPerSecond: 1.2, armor: 1, damageTypes: {physical: 0.5, fire: 0.5}, resist: {fire: 0.3}, abilities: [{name: 'Flame Breath', types: ['fire'], every: 2, spell: true, effect: 'fire'}], basics: ['bite']},
    {key: 'obsidianGolem', name: 'Obsidian Golem', hp: 2.4, damage: 1.3, attacksPerSecond: 0.7, armor: 4, evasion: 0.3, accuracy: 0.8, resist: {fire: 0.5, cold: -0.3}, abilities: [{name: 'Rock Slam', every: 3, damage: 1.25, accuracy: 0.85, effect: 'earth'}], basics: ['smash']},
    {key: 'salamander', name: 'Magma Salamander', hp: 1.8, damage: 1.6, attacksPerSecond: 1, armor: 2, damageTypes: {fire: 1}, resist: {fire: 0.75, cold: -0.5}, abilities: [{name: 'Magma Spit', every: 3, damage: 0.8, spell: true, applies: {ailment: 'burn', amount: 0.15}, effect: 'fire'}], basics: [['bite', 'Searing Bite'], ['lash', 'Tail Lash']]},
    {key: 'flameKnight', name: 'Flame Knight', hp: 2.2, damage: 1.5, attacksPerSecond: 0.9, armor: 3, accuracy: 1.1, damageTypes: {physical: 0.6, fire: 0.4}, resist: {fire: 0.3}, abilities: [{name: 'Searing Slash', types: ['fire'], every: 3, spell: true, effect: 'fire'}], basics: ['slash']},
    {key: 'ashenWyrm', name: 'Ashen Wyrm', hp: 4, damage: 1.8, attacksPerSecond: 0.8, armor: 3, damageTypes: {physical: 0.4, fire: 0.6}, resist: {fire: 0.5, cold: -0.4}, abilities: [{name: 'Flame Breath', types: ['fire'], every: 2, spell: true, effect: 'fire'}, {name: 'Ash Cloud', every: 5, spell: true, applies: {ailment: 'blind', amount: 0.25}, effect: 'dust'}], basics: ['bite', ['lash', 'Tail Lash']]},
    {key: 'oreGolem', name: 'Ore Golem', hp: 3, damage: 1.4, attacksPerSecond: 0.7, armor: 3, evasion: 0.3, resist: {lightning: 0.5}, abilities: [{name: 'Rock Slam', every: 3, damage: 1.25, accuracy: 0.85, effect: 'earth'}], basics: ['smash']},
    {key: 'broodmother', name: 'Broodmother', hp: 3.6, damage: 1.6, attacksPerSecond: 1, armor: 1.5, accuracy: 0.7, damageTypes: {physical: 0.5, cold: 0.5}, resist: {cold: 0.3, fire: -0.5}, abilities: [{name: 'Web Spray', every: 3, damage: 0.4, applies: {ailment: 'snare', amount: 0.25}, effect: 'web'}, {name: 'Frost Bite', types: ['cold'], every: 2, effect: 'ice'}], summon: {at: [0.5], monster: 'caveSpider', count: 1, name: 'Hatch', hp: 0.5}, basics: ['bite', 'sting']},
    // Sunken Marsh: cold damage and evasive monsters. Weak to fire.
    {key: 'bogLeech', name: 'Bog Leech', hp: 0.5, damage: 0.6, attacksPerSecond: 1.4, armor: 0, evasion: 1.8, resist: {cold: 0.3, fire: -0.3}, abilities: [{name: 'Drain', every: 3, damage: 1, drain: 1, effect: 'drain'}], basics: ['bite']},
    {key: 'marshWisp', flying: true, name: 'Marsh Wisp', hp: 0.45, damage: 0.6, attacksPerSecond: 1.4, armor: 0, evasion: 2, damageTypes: {cold: 1}, resist: {cold: 0.75, fire: -0.5}, abilities: [{name: "Will-o'-wisp", every: 4, spell: true, applies: {ailment: 'blind', amount: 0.2}, effect: 'dust'}], basics: [['touch', 'Frost Touch']]},
    {key: 'mireStalker', name: 'Mire Stalker', hp: 1, damage: 1.1, attacksPerSecond: 1.2, armor: 0.5, evasion: 2, accuracy: 1.1, damageTypes: {physical: 0.6, cold: 0.4}, resist: {cold: 0.3}, abilities: [{name: 'Mire Fang', types: ['cold'], every: 3, spell: true, effect: 'ice'}], basics: ['scratch', 'stab']},
    {key: 'frostToad', name: 'Frost Toad', hp: 1.7, damage: 1.5, attacksPerSecond: 0.9, armor: 1, evasion: 1.3, damageTypes: {cold: 1}, resist: {cold: 0.5, fire: -0.3}, abilities: [{name: 'Sticky Tongue', every: 3, damage: 0.6, applies: {ailment: 'snare', amount: 0.2}, effect: 'lash'}], basics: [['lash', 'Tongue Lash'], ['slam', 'Body Slam']]},
    {key: 'drownedKnight', name: 'Drowned Knight', hp: 2.2, damage: 1.5, attacksPerSecond: 0.9, armor: 2.5, evasion: 1.1, damageTypes: {physical: 0.6, cold: 0.4}, resist: {cold: 0.3, fire: -0.2}, abilities: [{name: 'Tidal Slash', types: ['cold'], every: 3, spell: true, effect: 'water'}], basics: ['slash']},
    {key: 'bogHag', name: 'Bog Hag', hp: 3.6, damage: 1.7, attacksPerSecond: 1, armor: 1.5, evasion: 1.8, accuracy: 1.2, damageTypes: {physical: 0.3, cold: 0.7}, resist: {cold: 0.5, fire: -0.4}, abilities: [{name: 'Chilling Hex', every: 6, spell: true, applies: {ailment: 'chill', amount: 0.2}, effect: 'chill'}, {name: 'Hex of Frailty', every: 7, spell: true, applies: {ailment: 'weaken', amount: 0.2}, effect: 'curse'}, {name: 'Frost Shard', types: ['cold'], every: 2, spell: true, effect: 'ice'}], basics: ['scratch']},
    // Stormwrack Coast: lightning damage, fast and accurate attackers. Weak to cold.
    {key: 'sparkWisp', flying: true, name: 'Spark Wisp', hp: 0.45, damage: 0.55, attacksPerSecond: 1.7, armor: 0, evasion: 1.4, accuracy: 1.3, damageTypes: {lightning: 1}, resist: {lightning: 0.75, cold: -0.3}, abilities: [{name: 'Static Spark', every: 4, spell: true, applies: {ailment: 'shock', amount: 0.1}, effect: 'static'}], basics: [['touch', 'Shock Touch']]},
    {key: 'stormHarpy', name: 'Storm Harpy', hp: 0.8, damage: 0.9, attacksPerSecond: 1.6, armor: 0.5, evasion: 1.5, accuracy: 1.5, damageTypes: {physical: 0.5, lightning: 0.5}, resist: {lightning: 0.3}, abilities: [{name: 'Shriek', every: 5, spell: true, applies: {ailment: 'weaken', amount: 0.15}, effect: 'sonar'}, {name: 'Lightning Bolt', types: ['lightning'], every: 2, spell: true, effect: 'lightning'}], basics: ['talon']},
    {key: 'cragLynx', name: 'Wrecker', hp: 1, damage: 1, attacksPerSecond: 1.6, armor: 0.5, evasion: 1.3, accuracy: 1.5, abilities: [{name: 'Harpoon', every: 4, damage: 0.8, applies: {ailment: 'snare', amount: 0.2}, effect: 'chains'}], basics: ['smash', 'stab']},
    {key: 'thunderRam', name: 'Thunder Crab', hp: 2.2, damage: 1.5, attacksPerSecond: 1, armor: 2, accuracy: 1.3, damageTypes: {physical: 0.6, lightning: 0.4}, resist: {lightning: 0.3, cold: -0.2}, abilities: [{name: 'Lightning Bolt', types: ['lightning'], every: 3, spell: true, effect: 'lightning'}], basics: [['smash', 'Pincer']]},
    {key: 'stormcaller', name: 'Stormcaller', hp: 1.8, damage: 1.6, attacksPerSecond: 1.2, armor: 1, accuracy: 1.6, damageTypes: {lightning: 1}, resist: {lightning: 0.5, cold: -0.3}, abilities: [{name: 'Static Charge', every: 4, spell: true, applies: {ailment: 'shock', amount: 0.15}, effect: 'static'}], basics: [['bolt', 'Lightning Bolt']]},
    {key: 'thunderbird', flying: true, name: 'Thunderbird', hp: 3.6, damage: 1.5, attacksPerSecond: 1.4, armor: 1.5, evasion: 1.2, accuracy: 1.5, damageTypes: {physical: 0.4, lightning: 0.6}, resist: {lightning: 0.6, cold: -0.4}, abilities: [{name: 'Thunderclap', types: ['lightning'], every: 2, spell: true, effect: 'lightning'}, {name: 'Talon Dive', every: 4, damage: 1.5, accuracy: 0.75, effect: 'dive'}], basics: ['talon']},
    // Ambition bosses, fought after a quest's final encounter, on its baseline: about 1.5x the HP and
    // 1.1x the damage of the quest's own final monster.
    // The Sundered Sanctum: all three elements, often in one monster. Every resistance matters.
    {key: 'riftMote', flying: true, name: 'Rift Mote', hp: 0.5, damage: 0.6, attacksPerSecond: 1.5, armor: 0, evasion: 1.8, damageTypes: {fire: 0.34, cold: 0.33, lightning: 0.33}, resist: {fire: 0.5, cold: 0.5, lightning: 0.5}, abilities: [{name: 'Prismatic Spark', types: ['cold', 'lightning'], every: 2, spell: true, effect: 'prism'}], basics: ['touch']},
    {key: 'riftHound', name: 'Rift Hound', hp: 1, damage: 1.1, attacksPerSecond: 1.4, armor: 0.5, evasion: 1.4, accuracy: 1.3, damageTypes: {physical: 0.5, fire: 0.25, cold: 0.25}, resist: {fire: 0.3, cold: 0.3}, abilities: [{name: 'Rift Fang', types: ['fire', 'cold'], every: 3, effect: 'prism'}], basics: ['bite']},
    {key: 'shardGolem', name: 'Shard Golem', hp: 2.4, damage: 1.4, attacksPerSecond: 0.8, armor: 4, evasion: 0.4, accuracy: 0.9, damageTypes: {physical: 0.6, lightning: 0.4}, resist: {lightning: 0.5, cold: 0.3, fire: -0.3}, abilities: [{name: 'Rock Slam', types: ['physical'], every: 2, effect: 'earth'}], basics: [['smash', 'Static Fist']]},
    {key: 'emberRevenant', name: 'Ember Revenant', hp: 1.8, damage: 1.6, attacksPerSecond: 1, armor: 2, damageTypes: {physical: 0.4, fire: 0.6}, resist: {fire: 0.5, cold: -0.3}, abilities: [{name: 'Searing Slash', types: ['fire'], every: 2, effect: 'fire'}], basics: ['slash']},
    {key: 'frostRevenant', name: 'Frost Revenant', hp: 1.8, damage: 1.5, attacksPerSecond: 1, armor: 2, evasion: 1.2, damageTypes: {physical: 0.4, cold: 0.6}, resist: {cold: 0.5, fire: -0.3}, abilities: [{name: 'Frost Slash', types: ['cold'], every: 2, effect: 'ice'}], basics: ['slash']},
    {key: 'stormRevenant', name: 'Storm Revenant', hp: 1.6, damage: 1.5, attacksPerSecond: 1.2, armor: 1.5, accuracy: 1.5, damageTypes: {physical: 0.4, lightning: 0.6}, resist: {lightning: 0.5, cold: -0.3}, abilities: [{name: 'Storm Slash', types: ['lightning'], every: 2, effect: 'lightning'}], basics: ['slash']},
    {key: 'riftWarden', name: 'Rift Warden', hp: 4, damage: 1.8, attacksPerSecond: 1, armor: 3, evasion: 1, accuracy: 1.3, damageTypes: {physical: 0.1, fire: 0.3, cold: 0.3, lightning: 0.3}, resist: {fire: 0.4, cold: 0.4, lightning: 0.4}, abilities: [{name: 'Rift Ward', every: 7, buff: {kind: 'ward', amount: 0.15}, effect: 'shield'}, {name: 'Fire Burst', types: ['fire'], every: 5, spell: true, effect: 'fire'}, {name: 'Frost Shard', types: ['cold'], every: 5, spell: true, effect: 'ice'}, {name: 'Lightning Bolt', types: ['lightning'], every: 5, spell: true, effect: 'lightning'}], basics: ['slash']},
    // The Amber Hive (tier 5, Corrosion): many quick, light strikes, so every hit that lands wears defenses down.
    {key: 'swarmling', flying: true, name: 'Swarmling', hp: 0.35, damage: 0.35, attacksPerSecond: 2.5, armor: 0, evasion: 2, accuracy: 1.2, abilities: [{name: 'Venom Sting', every: 4, damage: 0.7, applies: {ailment: 'bleed', amount: 0.4}, effect: 'poison'}], basics: ['sting', 'bite']},
    {key: 'hiveDrone', flying: true, name: 'Hive Drone', hp: 0.55, damage: 0.45, attacksPerSecond: 2.2, armor: 0.5, evasion: 1.8, accuracy: 1.3, abilities: [{name: 'Drone Buzz', every: 5, spell: true, applies: {ailment: 'weaken', amount: 0.12}, effect: 'sonar'}], basics: ['sting']},
    {key: 'acidSpitter', name: 'Acid Spitter', hp: 0.9, damage: 0.6, attacksPerSecond: 1.8, armor: 0.5, accuracy: 1.4, damageTypes: {physical: 0.6, fire: 0.4}, resist: {fire: 0.5}, abilities: [{name: 'Acid Glob', types: ['fire'], every: 3, applies: {ailment: 'sunder', amount: 0.2}, effect: 'acid'}], basics: ['bite']},
    {key: 'thornMantis', name: 'Thorn Mantis', hp: 1.1, damage: 0.7, attacksPerSecond: 2, armor: 1, evasion: 1.5, accuracy: 1.6, abilities: [{name: 'Twin Scythes', every: 3, damage: 1, hits: 2, effect: 'slash'}], basics: ['slash', 'stab']},
    {key: 'amberBeetle', name: 'Amber Beetle', hp: 2.6, damage: 0.9, attacksPerSecond: 1.2, armor: 4, evasion: 0.4, accuracy: 1, resist: {fire: 0.3, cold: 0.3}, abilities: [{name: 'Amber Shell', every: 5, buff: {kind: 'guard', amount: 0.4, turns: 2}, effect: 'shield'}], basics: ['slam', 'bite']},
    {key: 'broodGuard', name: 'Brood Guard', hp: 2, damage: 0.8, attacksPerSecond: 1.6, armor: 2.5, evasion: 1, accuracy: 1.4, abilities: [{name: 'Impale', every: 4, damage: 1.3, accuracy: 0.8, effect: 'stab'}], basics: ['stab', 'bite']},
    {key: 'hiveQueen', name: 'The Hive Queen', hp: 3, damage: 0.55, attacksPerSecond: 1.8, armor: 2, evasion: 1.2, accuracy: 1.5, damageTypes: {physical: 0.6, fire: 0.4}, resist: {fire: 0.5}, abilities: [{name: 'Acid Spit', types: ['fire'], every: 3, spell: true, applies: {ailment: 'sunder', amount: 0.25}, effect: 'acid'}], summon: {at: [0.5], monster: 'swarmling', count: 2, name: 'Call the Swarm', hp: 0.5}, basics: ['sting']},
    // Duskgrave Necropolis (tier 5, Lifeless): steady, hard-hitting undead. Nothing heals, so every hit adds up.
    {key: 'boneThrall', name: 'Bone Thrall', hp: 1, damage: 1, attacksPerSecond: 1, armor: 1.5, resist: {cold: 0.5}, abilities: [{name: 'Bone Volley', every: 4, damage: 0.8, hits: 3, effect: 'throw'}], basics: [['throw', 'Bone Throw'], 'slash']},
    {key: 'cryptGhoul', name: 'Crypt Ghoul', hp: 1, damage: 0.9, attacksPerSecond: 1.5, armor: 0.5, evasion: 1.2, accuracy: 1.3, resist: {cold: 0.3}, abilities: [{name: 'Paralytic Claw', every: 3, damage: 0.9, applies: {ailment: 'snare', amount: 0.2}, effect: 'poison'}], basics: ['scratch', 'bite']},
    {key: 'wailingShade', flying: true, name: 'Wailing Shade', hp: 0.7, damage: 1, attacksPerSecond: 1.2, armor: 0, evasion: 2, accuracy: 1.4, damageTypes: {cold: 1}, resist: {cold: 0.75, fire: -0.3}, abilities: [{name: 'Wail', every: 4, spell: true, applies: {ailment: 'weaken', amount: 0.2}, effect: 'sonar'}], basics: [['touch', 'Frost Touch']]},
    {key: 'barrowKnight', name: 'Barrow Knight', hp: 2.4, damage: 1.5, attacksPerSecond: 0.9, armor: 3.5, accuracy: 1.2, damageTypes: {physical: 0.7, cold: 0.3}, resist: {cold: 0.5}, abilities: [{name: 'Grave Blade', types: ['cold'], every: 3, effect: 'ice'}], basics: ['slash', 'smash']},
    {key: 'plagueBearer', name: 'Plague Bearer', hp: 2, damage: 1.2, attacksPerSecond: 1, armor: 1.5, damageTypes: {physical: 0.5, cold: 0.5}, resist: {cold: 0.5, fire: -0.3}, abilities: [{name: 'Plague Cloud', every: 4, spell: true, applies: {ailment: 'bleed', amount: 0.5}, effect: 'poison'}, {name: 'Rot Touch', types: ['cold'], every: 2, effect: 'ice'}], basics: ['smash']},
    {key: 'lichAcolyte', name: 'Lich Acolyte', hp: 1.4, damage: 1.5, attacksPerSecond: 1, armor: 1, accuracy: 1.6, damageTypes: {cold: 1}, resist: {cold: 0.6, fire: -0.3}, abilities: [{name: 'Frost Nova', every: 4, spell: true, applies: {ailment: 'chill', amount: 0.15}, effect: 'chill'}], basics: [['bolt', 'Frost Bolt']]},
    {key: 'paleLich', name: 'The Pale Lich', hp: 3, damage: 1.3, attacksPerSecond: 1, armor: 2, evasion: 1, accuracy: 1.5, damageTypes: {physical: 0.3, cold: 0.7}, resist: {cold: 0.7, fire: -0.2}, abilities: [{name: 'Frost Nova', every: 3, spell: true, damage: 0.8, applies: {ailment: 'chill', amount: 0.15}, effect: 'ice'}, {name: 'Soul Drain', every: 5, spell: true, damage: 1, drain: 0.5, effect: 'drain'}], summon: {at: [0.5], monster: 'boneThrall', count: 2, name: 'Raise Dead', hp: 0.5}, basics: [['touch', 'Grave Touch']]},
    // Ironbound Foundry (tier 5, Reflection): heavily armored constructs. Hits that land are smaller, and so is what comes back.
    {key: 'cogSpider', name: 'Cog Spider', hp: 0.7, damage: 0.7, attacksPerSecond: 1.8, armor: 2, evasion: 1.4, accuracy: 1.3, abilities: [{name: 'Wire Snare', every: 4, damage: 0.4, applies: {ailment: 'snare', amount: 0.15}, effect: 'web'}], basics: ['bite', 'stab']},
    {key: 'brassSentry', name: 'Brass Sentry', hp: 1.3, damage: 1, attacksPerSecond: 1.1, armor: 4, accuracy: 1.2, abilities: [{name: 'Overclock', every: 6, rally: {amount: 0.3, turns: 3}, effect: 'steam'}], basics: ['stab', 'throw']},
    {key: 'steamHound', name: 'Steam Hound', hp: 1.1, damage: 1, attacksPerSecond: 1.4, armor: 2.5, evasion: 1.2, damageTypes: {physical: 0.6, fire: 0.4}, resist: {fire: 0.4}, abilities: [{name: 'Steam Breath', types: ['fire'], every: 3, spell: true, effect: 'steam'}], basics: ['bite']},
    {key: 'smelterGolem', name: 'Smelter Golem', hp: 2.6, damage: 1.4, attacksPerSecond: 0.8, armor: 5, evasion: 0.3, accuracy: 0.9, damageTypes: {physical: 0.5, fire: 0.5}, resist: {fire: 0.6, cold: -0.2}, abilities: [{name: 'Rock Slam', types: ['physical'], every: 2, effect: 'earth'}], basics: [['smash', 'Molten Fist']]},
    {key: 'clockworkKnight', name: 'Clockwork Knight', hp: 2, damage: 1.3, attacksPerSecond: 1.1, armor: 4.5, evasion: 0.8, accuracy: 1.3, resist: {lightning: -0.3}, abilities: [{name: 'Shield Wall', every: 5, buff: {kind: 'guard', amount: 0.4, turns: 2}, effect: 'shield'}], basics: ['slash', 'stab']},
    {key: 'forgeWarden', name: 'Forge Warden', hp: 1.8, damage: 1.5, attacksPerSecond: 1, armor: 3, accuracy: 1.4, damageTypes: {physical: 0.4, fire: 0.6}, resist: {fire: 0.5}, abilities: [{name: 'Molten Strike', types: ['fire'], every: 2, effect: 'fire'}, {name: 'Forge Hammer', every: 4, damage: 1.3, accuracy: 0.8, effect: 'earth'}], basics: ['smash']},
    {key: 'forgeTitan', name: 'The Forge Titan', hp: 3.2, damage: 1.4, attacksPerSecond: 0.8, armor: 6, evasion: 0.4, accuracy: 1.2, damageTypes: {physical: 0.6, fire: 0.4}, resist: {fire: 0.6, lightning: -0.2}, abilities: [{name: 'Hammerfall', every: 4, damage: 1.6, accuracy: 0.7, applies: {ailment: 'sunder', amount: 0.25}, effect: 'earth'}, {name: 'Molten Spray', types: ['fire'], every: 3, spell: true, applies: {ailment: 'burn', amount: 0.1}, effect: 'fire'}], basics: ['smash', 'slam']},
    // Skyspire Aerie (tier 5, Karma): quick, evasive flyers with thin hides. One clean blow beats a flurry.
    {key: 'galeKestrel', flying: true, name: 'Gale Kestrel', hp: 0.5, damage: 0.7, attacksPerSecond: 1.8, armor: 0, evasion: 2.2, accuracy: 1.4, abilities: [{name: 'Gust', every: 4, applies: {ailment: 'gale', amount: 0.2}, effect: 'gust'}], basics: ['talon']},
    {key: 'skyHarpy', flying: true, name: 'Sky Harpy', hp: 0.8, damage: 0.9, attacksPerSecond: 1.5, armor: 0.5, evasion: 1.8, accuracy: 1.5, damageTypes: {physical: 0.6, lightning: 0.4}, resist: {lightning: 0.3}, abilities: [{name: 'Storm Shriek', types: ['lightning'], every: 3, spell: true, effect: 'lightning'}], basics: ['talon', 'scratch']},
    {key: 'stormHawk', flying: true, name: 'Storm Hawk', hp: 0.7, damage: 1, attacksPerSecond: 1.6, armor: 0, evasion: 2, accuracy: 1.5, damageTypes: {lightning: 1}, resist: {lightning: 0.6}, abilities: [{name: 'Static Dive', every: 4, damage: 1.4, accuracy: 0.75, effect: 'dive'}], basics: ['talon', ['bolt', 'Lightning Bolt']]},
    {key: 'cloudSerpent', flying: true, name: 'Cloud Serpent', hp: 1.8, damage: 1.3, attacksPerSecond: 1, armor: 1.5, evasion: 1.3, damageTypes: {physical: 0.5, lightning: 0.5}, resist: {lightning: 0.5}, abilities: [{name: 'Cloud Coil', every: 4, damage: 0.6, applies: {ailment: 'snare', amount: 0.2}, effect: 'lash'}, {name: 'Thunder Breath', types: ['lightning'], every: 2, spell: true, effect: 'lightning'}], basics: ['bite', 'lash']},
    {key: 'thunderEagle', flying: true, name: 'Thunder Eagle', hp: 1.5, damage: 1.4, attacksPerSecond: 1.2, armor: 1, evasion: 1.6, accuracy: 1.6, damageTypes: {physical: 0.4, lightning: 0.6}, resist: {lightning: 0.5}, abilities: [{name: 'Thunder Dive', types: ['lightning'], every: 2, effect: 'lightning'}], basics: ['talon']},
    {key: 'windWarden', name: 'Wind Warden', hp: 2.2, damage: 1.3, attacksPerSecond: 1.1, armor: 2.5, evasion: 1.4, accuracy: 1.4, resist: {lightning: 0.3}, abilities: [{name: 'Gust', every: 4, applies: {ailment: 'gale', amount: 0.2}, effect: 'gust'}], basics: ['stab', 'slash']},
    {key: 'skySovereign', name: 'The Sky Sovereign', hp: 3, damage: 1.25, attacksPerSecond: 1.3, armor: 2, evasion: 1.6, accuracy: 1.6, damageTypes: {physical: 0.4, lightning: 0.6}, resist: {lightning: 0.6}, abilities: [{name: 'Storm Call', types: ['lightning'], every: 2, spell: true, effect: 'lightning'}, {name: 'Sovereign Dive', every: 4, damage: 1.6, accuracy: 0.7, effect: 'dive'}], basics: ['talon', 'bite']},
    // The Oracle's Rite (Sundered Sanctum): its boss shifts between the tier 5 rules as its life drops.
    {key: 'veiledOracle', name: 'The Veiled Oracle', hp: 9, damage: 2, attacksPerSecond: 1, armor: 3, evasion: 1.3, accuracy: 1.5, damageTypes: {physical: 0.25, fire: 0.25, cold: 0.25, lightning: 0.25}, resist: {fire: 0.4, cold: 0.4, lightning: 0.4}, abilities: [{name: 'Foresight', every: 5, buff: {kind: 'evade', amount: 0.5, turns: 3}, effect: 'shimmer'}, {name: 'Hex of Doom', every: 6, spell: true, applies: {ailment: 'weaken', amount: 0.25}, effect: 'curse'}, {name: 'Starfall', types: ['fire', 'cold', 'lightning'], every: 3, spell: true, effect: 'starfall'}], basics: [['touch', 'Veiled Touch']]},
    // The Shattered Throne (tier 6): a bit of everything the earlier areas threw at you, all very strong.
    {key: 'riftStalker', name: 'Rift Stalker', hp: 0.9, damage: 1, attacksPerSecond: 1.7, armor: 1, evasion: 2.2, accuracy: 1.5, abilities: [{name: 'Shadowstep', every: 5, buff: {kind: 'evade', amount: 0.5, turns: 2}, effect: 'shimmer'}], basics: ['slash', 'stab']},
    {key: 'starfallMote', flying: true, name: 'Starfall Mote', hp: 0.6, damage: 0.8, attacksPerSecond: 1.6, armor: 0, evasion: 1.8, accuracy: 1.3, damageTypes: {fire: 0.34, cold: 0.33, lightning: 0.33}, resist: {fire: 0.5, cold: 0.5, lightning: 0.5}, abilities: [{name: 'Starfall', types: ['cold', 'lightning'], every: 2, spell: true, effect: 'starfall'}], basics: ['touch']},
    {key: 'voidWraith', flying: true, name: 'Void Wraith', hp: 1.2, damage: 1.3, attacksPerSecond: 1.2, armor: 0.5, evasion: 2, accuracy: 1.5, damageTypes: {cold: 0.7, physical: 0.3}, resist: {cold: 0.6}, abilities: [{name: 'Void Touch', types: ['cold'], every: 3, drain: 0.5, effect: 'drain'}], basics: ['scratch']},
    {key: 'throneSentinel', name: 'Throne Sentinel', hp: 2.6, damage: 1.4, attacksPerSecond: 0.9, armor: 5, evasion: 0.5, accuracy: 1.2, resist: {fire: 0.3, cold: 0.3, lightning: 0.3}, abilities: [{name: 'Bulwark', every: 5, buff: {kind: 'guard', amount: 0.4, turns: 2}, effect: 'shield'}], basics: ['smash', 'stab']},
    {key: 'shatteredKnight', name: 'Shattered Knight', hp: 2, damage: 1.5, attacksPerSecond: 1.1, armor: 3, evasion: 1, accuracy: 1.5, damageTypes: {physical: 0.6, lightning: 0.4}, resist: {lightning: 0.4}, abilities: [{name: 'Storm Blade', types: ['lightning'], every: 2, effect: 'lightning'}], basics: ['slash']},
    {key: 'emberColossus', name: 'Ember Colossus', hp: 3, damage: 1.7, attacksPerSecond: 0.8, armor: 3.5, evasion: 0.4, accuracy: 1, damageTypes: {physical: 0.4, fire: 0.6}, resist: {fire: 0.6, cold: -0.2}, abilities: [{name: 'Magma Slam', types: ['fire'], every: 2, effect: 'fire'}], basics: ['smash', 'slam']},
    {key: 'shatteredKing', name: 'The Shattered King', hp: 9, damage: 1.2, attacksPerSecond: 1, armor: 3, evasion: 1.2, accuracy: 1.5, damageTypes: {physical: 0.4, fire: 0.2, cold: 0.2, lightning: 0.2}, resist: {fire: 0.4, cold: 0.4, lightning: 0.4}, abilities: [{name: "Crown's Command", every: 6, spell: true, applies: {ailment: 'weaken', amount: 0.25}, effect: 'curse'}, {name: 'Shard Storm', types: ['fire', 'cold', 'lightning'], every: 3, spell: true, effect: 'starfall'}], basics: ['slash', 'smash'],
        shatter: {at: [0.75, 0.5, 0.25], shard: 'kingShard', count: 2, damageTaken: 0.5}, risingWill: {every: 10, growth: 0.1, heal: 0.05}},
    {key: 'kingShard', name: 'Shard of the King', hp: 0.6, damage: 0.5, attacksPerSecond: 1.2, armor: 2, evasion: 1, accuracy: 1.4, damageTypes: {physical: 0.4, fire: 0.2, cold: 0.2, lightning: 0.2}, resist: {fire: 0.4, cold: 0.4, lightning: 0.4}, abilities: [{name: 'Shard Pulse', types: ['fire', 'cold', 'lightning'], every: 3, spell: true, effect: 'prism'}], basics: ['slam']},
    {key: 'briarKing', name: 'The Briar King', hp: 9, damage: 2.2, attacksPerSecond: 0.9, armor: 2.5, accuracy: 1.1, thorns: 10, abilities: [{name: 'Root Snare', every: 4, spell: true, applies: {ailment: 'snare', amount: 0.3}, effect: 'vines'}, {name: 'Bramble Lash', every: 3, damage: 1, hits: 2, effect: 'lash'}], basics: ['lash', 'slash']},
    {key: 'stormveinColossus', name: 'Stormvein Colossus', hp: 5.5, damage: 1.8, attacksPerSecond: 0.8, armor: 2.5, evasion: 0.4, damageTypes: {physical: 0.6, lightning: 0.4}, resist: {lightning: 0.6}, abilities: [{name: 'Rock Slam', types: ['physical'], every: 2, effect: 'earth'}, {name: 'Static Discharge', every: 5, spell: true, applies: {ailment: 'shock', amount: 0.2}, effect: 'static'}], basics: [['smash', 'Static Fist'], ['slam', 'Static Slam']]},
    {key: 'wyrmqueen', name: 'The Wyrmqueen', hp: 6, damage: 2, attacksPerSecond: 0.9, armor: 3, accuracy: 1.1, damageTypes: {physical: 0.4, fire: 0.6}, resist: {fire: 0.6, cold: -0.3}, abilities: [{name: 'Inferno', types: ['fire'], every: 2, spell: true, applies: {ailment: 'burn', amount: 0.08}, effect: 'fire'}, {name: 'Wing Buffet', every: 4, damage: 0.8, applies: {ailment: 'weaken', amount: 0.2}, effect: 'gust'}], basics: ['bite', ['lash', 'Tail Lash'], 'talon']},
    {key: 'mireMother', name: 'The Mire Mother', hp: 6, damage: 1.9, attacksPerSecond: 1, armor: 2, evasion: 1.8, accuracy: 1.2, damageTypes: {physical: 0.4, cold: 0.6}, resist: {cold: 0.6, fire: -0.3}, abilities: [{name: 'Drowning Grasp', every: 4, spell: true, applies: {ailment: 'snare', amount: 0.35}, effect: 'water'}, {name: 'Frost Shard', types: ['cold'], every: 2, spell: true, effect: 'ice'}], summon: {at: [0.6, 0.3], monster: 'bogLeech', count: 2, name: 'Leech Brood'}, basics: [['lash', 'Grasping Tide'], 'slam']},
    {key: 'riftTyrant', name: 'The Rift Tyrant', hp: 6.5, damage: 2, attacksPerSecond: 1, armor: 3, evasion: 1.2, accuracy: 1.3, damageTypes: {physical: 0.25, fire: 0.25, cold: 0.25, lightning: 0.25}, resist: {fire: 0.5, cold: 0.5, lightning: 0.5}, abilities: [{name: 'Prismatic Beam', types: ['fire', 'cold', 'lightning'], every: 3, spell: true, effect: 'prism'}, {name: 'Phase Shift', every: 5, buff: {kind: 'evade', amount: 0.5, turns: 2}, effect: 'shimmer'}], basics: ['slash', 'smash']},
    // Ambition bosses for the tier 5 areas and the Throne.
    {key: 'amberEmpress', name: 'The Amber Empress', hp: 6.5, damage: 1.5, attacksPerSecond: 1.6, armor: 2.5, evasion: 1.7, accuracy: 1.6, damageTypes: {physical: 0.6, fire: 0.4}, resist: {fire: 0.5}, abilities: [{name: 'Amber Prison', every: 6, spell: true, applies: {ailment: 'snare', amount: 0.4}, effect: 'chains'}, {name: 'Royal Stinger', every: 3, damage: 1, applies: {ailment: 'bleed', amount: 0.6}, effect: 'sting'}, {name: 'Molten Amber', types: ['fire'], every: 2, spell: true, effect: 'fire'}], basics: ['sting', 'slash']},
    {key: 'duskRegent', name: 'The Dusk Regent', hp: 7, damage: 2, attacksPerSecond: 0.9, armor: 3, evasion: 0.8, accuracy: 1.4, damageTypes: {physical: 0.4, cold: 0.6}, resist: {cold: 0.7, fire: -0.2}, abilities: [{name: 'Withering Curse', every: 5, spell: true, applies: {ailment: 'weaken', amount: 0.25}, effect: 'curse'}, {name: 'Blood Tithe', every: 3, damage: 1, drain: 1, effect: 'drain'}, {name: 'Night Frost', types: ['cold'], every: 2, spell: true, effect: 'ice'}], basics: ['slash', 'bite']},
    {key: 'ironOverseer', name: 'The Ironbound Overseer', hp: 7, damage: 1.6, attacksPerSecond: 0.8, armor: 7, evasion: 0.4, accuracy: 1.3, damageTypes: {physical: 0.6, fire: 0.4}, resist: {fire: 0.6, lightning: -0.2}, abilities: [{name: 'Shackles', every: 5, spell: true, applies: {ailment: 'snare', amount: 0.35}, effect: 'chains'}, {name: 'Steam Burst', types: ['fire'], every: 3, spell: true, effect: 'steam'}], summon: {at: [0.5], monster: 'brassSentry', count: 2, name: 'Call Sentries', hp: 0.5}, basics: ['lash', 'smash']},
    {key: 'stormHerald', name: 'The Storm Herald', hp: 6, damage: 1.5, attacksPerSecond: 1.4, armor: 2, evasion: 1.8, accuracy: 1.7, damageTypes: {physical: 0.3, lightning: 0.7}, resist: {lightning: 0.6, cold: -0.2}, abilities: [{name: 'Chain Lightning', types: ['lightning'], every: 3, spell: true, hits: 3, effect: 'lightning'}, {name: "Herald's Gale", every: 5, applies: {ailment: 'gale', amount: 0.25}, effect: 'gust'}, {name: 'Static Field', every: 6, spell: true, applies: {ailment: 'shock', amount: 0.2}, effect: 'static'}], basics: ['slash']},
    {key: 'pretender', name: 'The Pretender', hp: 10, damage: 1.6, attacksPerSecond: 1.1, armor: 3.5, evasion: 1.4, accuracy: 1.7, damageTypes: {physical: 0.25, fire: 0.25, cold: 0.25, lightning: 0.25}, resist: {fire: 0.5, cold: 0.5, lightning: 0.5}, abilities: [{name: 'Borrowed Crown', every: 6, buff: {kind: 'guard', amount: 0.5, turns: 2}, effect: 'mirror'}, {name: 'Mimicry', types: ['fire', 'cold', 'lightning'], every: 3, spell: true, mimic: true, effect: 'mirror'}], basics: ['slash', 'stab'],
        risingWill: {every: 12, growth: 0.08}},
    {key: 'tempestRoc', flying: true, name: 'The Tempest Roc', hp: 5.5, damage: 1.7, attacksPerSecond: 1.4, armor: 2, evasion: 1.3, accuracy: 1.5, damageTypes: {physical: 0.4, lightning: 0.6}, resist: {lightning: 0.6, cold: -0.3}, abilities: [{name: 'Chain Lightning', types: ['lightning'], every: 3, spell: true, hits: 3, effect: 'lightning'}, {name: 'Gale', every: 5, applies: {ailment: 'gale', amount: 0.25}, effect: 'gust'}], basics: ['talon', 'slam']},
];
export const monsters: Record<string, MonsterDef> = Object.fromEntries(monsterList.map(m => [m.key, m]));

// Authored encounters stay at half what the engine and combat view support, so a modifier can
// double every encounter.
export const MAX_MONSTERS_PER_ENCOUNTER = 4;
export const ENGINE_MAX_MONSTERS = 8;

// The reward shape from the design notes.
// Uncommons come closer together deeper in (after 5, then 3, then right away), so pushing on
// gathers uncommons faster per encounter, not just more gold and XP.
export const questShape: EncounterTier[] = ['C', 'C', 'C', 'C', 'U', 'C', 'C', 'U', 'U', 'C', 'C', 'R'];
// Encounter power = basePower * (1 + growthPerEncounter * index) * tierMultiplier[tier].
// The difficulty is spread over the quest: commons climb from 1x to 3x the quest's base power by
// the last one, each uncommon is about 50% over the common before it, and the final rare is about
// 50% over the last uncommon.
export const growthPerEncounter = 0.2;
// The final rare (index 11) keeps the power it had under the old curve (growth 0.02, R 4.4), so
// every quest's boss fight is unchanged.
const RARE_POWER = 4.4 * (1 + 0.02 * 11);
export const tierMultiplier: Record<EncounterTier, number> = {C: 1, U: 1.4, R: RARE_POWER / (1 + growthPerEncounter * 11)};

function buildEncounters(groups: string[][]): EncounterDef[] {
    if (groups.length !== questShape.length) {
        throw new Error('Quest needs ' + questShape.length + ' encounters');
    }
    if (groups.some(g => g.length < 1 || g.length > MAX_MONSTERS_PER_ENCOUNTER)) {
        throw new Error(`Encounters need 1 to ${MAX_MONSTERS_PER_ENCOUNTER} monsters`);
    }
    return groups.map((monsters, i) => ({tier: questShape[i], monsters}));
}

const questList: QuestDef[] = [
    {
        key: 'brambleRoad',
        levelBand: [3, 10],
        name: 'Bramble Road',
        description: 'Goblins, wolves and bandits along an overgrown trade road.',
        basePower: 1,
        monsterScale: 1.05,
        entryFee: 0,
        fameToUnlock: 0,
        fameForFirstClear: 10,
        travelSeconds: 0,
        mapPosition: {x: 430, y: 110},
        encounters: buildEncounters([
            ['rat', 'rat'],
            ['goblin'],
            ['goblin', 'rat'],
            ['wolf', 'rat'],
            ['goblinBrute'],
            ['goblin', 'rat'],
            ['bandit', 'rat'],
            ['alphaWolf', 'rat'],
            ['banditCaptain'],
            ['bandit', 'wolf'],
            ['bandit', 'rat', 'rat'],
            ['troll'],
        ]),
        pools: {
            C: [
                {material: 'wood', weight: 3, min: 1, max: 1},
                {material: 'copperOre', weight: 3, min: 1, max: 1},
                {material: 'roughHide', weight: 3, min: 1, max: 1},
                {material: 'boneShard', weight: 2, min: 1, max: 1},
                {material: 'flint', weight: 2, min: 1, max: 1},
                {material: 'hawkFeather', weight: 2, min: 1, max: 1},
                {material: 'healingMoss', weight: 2, min: 1, max: 1},
                {material: 'sinew', weight: 2, min: 1, max: 1},
            ],
            U: [
                {material: 'rubyShard', weight: 1, min: 1, max: 1},
                {material: 'sapphireShard', weight: 1, min: 1, max: 1},
                {material: 'emeraldShard', weight: 1, min: 1, max: 1},
                {material: 'ironOre', weight: 3, min: 1, max: 1},
                {material: 'tannedLeather', weight: 3, min: 1, max: 1},
                {material: 'wolfFang', weight: 2, min: 1, max: 1},
                {material: 'thornvine', weight: 2, min: 1, max: 1},
                {material: 'whetstone', weight: 2, min: 1, max: 1},
                {material: 'trollBlood', weight: 2, min: 1, max: 1},
            ],
            R: [
                {material: 'silverOre', weight: 2, min: 1, max: 1},
                {material: 'moonstone', weight: 1, min: 1, max: 1},
                {material: 'bloodstone', weight: 1, min: 1, max: 1},
                {material: 'amber', weight: 1, min: 1, max: 1},
            ],
            // Only reached by rarity upgrades from quest modifiers.
            M: [
                {material: 'thornheart', weight: 1, min: 1, max: 1},
                {material: 'wolfkingPelt', weight: 1, min: 1, max: 1},
            ],
        },
        modifiers: questModifiers(),
        boss: {monster: 'briarKing', legendary: 'briarcrown'},
    },
    {
        key: 'hollowMines',
        levelBand: [8, 14],
        name: 'Hollow Mines',
        description: 'Abandoned mine shafts overrun by kobolds and worse things below.',
        basePower: 3.2,
        monsterScale: 1.05,
        entryFee: 20,
        fameToUnlock: 10,
        fameForFirstClear: 25,
        travelSeconds: 0,
        mapPosition: {x: 715, y: 145},
        encounters: buildEncounters([
            ['kobold', 'kobold'],
            ['caveSpider', 'kobold'],
            ['skeleton'],
            ['caveSpider', 'caveBat'],
            ['koboldShaman', 'caveBat'],
            ['skeleton', 'caveBat'],
            ['kobold', 'caveSpider'],
            ['oreGolem'],
            ['koboldShaman', 'caveBat'],
            ['skeleton', 'kobold'],
            ['skeleton', 'caveBat', 'caveBat'],
            ['broodmother'],
        ]),
        pools: {
            // Quest 1's uncommon materials are common here.
            C: [
                {material: 'ironOre', weight: 3, min: 1, max: 1},
                {material: 'tannedLeather', weight: 3, min: 1, max: 1},
                {material: 'wolfFang', weight: 2, min: 1, max: 1},
                {material: 'copperOre', weight: 1, min: 1, max: 1},
                {material: 'thornvine', weight: 2, min: 1, max: 1},
                {material: 'whetstone', weight: 2, min: 1, max: 1},
                {material: 'trollBlood', weight: 2, min: 1, max: 1},
                {material: 'sinew', weight: 1, min: 1, max: 1},
            ],
            U: [
                {material: 'roughTigerEye', weight: 1, min: 1, max: 1},
                {material: 'roughSunstone', weight: 1, min: 1, max: 1},
                {material: 'roughOpal', weight: 1, min: 1, max: 1},
                {material: 'steelIngot', weight: 3, min: 1, max: 1},
                {material: 'trollHide', weight: 2, min: 1, max: 1},
                {material: 'garnet', weight: 2, min: 1, max: 1},
                {material: 'silverOre', weight: 1, min: 1, max: 1},
                {material: 'spiderSilk', weight: 3, min: 1, max: 1},
                {material: 'ancientBone', weight: 2, min: 1, max: 1},
                {material: 'ritualAsh', weight: 2, min: 1, max: 1},
                {material: 'amber', weight: 1, min: 1, max: 1},
            ],
            R: [
                {material: 'mithril', weight: 2, min: 1, max: 1},
                {material: 'moonstone', weight: 1, min: 1, max: 1},
                {material: 'broodfang', weight: 2, min: 1, max: 1},
                {material: 'bloodstone', weight: 1, min: 1, max: 1},
            ],
            M: [
                {material: 'deepfireCore', weight: 1, min: 1, max: 1},
                {material: 'golemHeart', weight: 1, min: 1, max: 1},
            ],
        },
        modifiers: questModifiers(),
        boss: {monster: 'stormveinColossus', legendary: 'stormveinHeart'},
    },
    {
        key: 'ashenPeaks',
        levelBand: [14, 23],
        name: 'Ashen Peaks',
        description: 'Smoking slopes where fire-born beasts and burning knights guard the old wyrm\'s roost. Armor and fire resistance keep you alive; cold damage cuts through.',
        basePower: 6.5,
        monsterScale: 1.3,
        entryFee: 100,
        fameToUnlock: 0,
        unlockAchievement: 'clear-hollowMines',
        fameForFirstClear: 0,
        travelSeconds: 0,
        mapPosition: {x: 630, y: 380},
        encounters: buildEncounters([
            ['ashImp', 'ashImp'],
            ['cinderHound', 'ashImp'],
            ['obsidianGolem'],
            ['cinderHound', 'emberMote'],
            ['salamander', 'emberMote'],
            ['obsidianGolem', 'emberMote'],
            ['cinderHound', 'ashImp'],
            ['flameKnight'],
            ['salamander', 'emberMote'],
            ['obsidianGolem', 'ashImp'],
            ['flameKnight', 'emberMote', 'emberMote'],
            ['ashenWyrm'],
        ]),
        pools: {
            // Hollow Mines' uncommon materials are common in every tier 3 area, plus one of the area's own.
            C: [
                {material: 'steelIngot', weight: 3, min: 1, max: 1},
                {material: 'trollHide', weight: 2, min: 1, max: 1},
                {material: 'garnet', weight: 2, min: 1, max: 1},
                {material: 'silverOre', weight: 2, min: 1, max: 1},
                {material: 'spiderSilk', weight: 2, min: 1, max: 1},
                {material: 'ancientBone', weight: 2, min: 1, max: 1},
                {material: 'ritualAsh', weight: 2, min: 1, max: 1},
                {material: 'amber', weight: 1, min: 1, max: 1},
                {material: 'brimstone', weight: 3, min: 1, max: 1},
            ],
            // Half shared with the other tier 3 areas, half Ashen Peaks' own.
            U: [
                {material: 'ruby', weight: 1, min: 1, max: 1},
                {material: 'obsidian', weight: 2, min: 1, max: 1},
                {material: 'salamanderScale', weight: 2, min: 1, max: 1},
                {material: 'rimecoal', weight: 2, min: 1, max: 1},
                {material: 'cinderwool', weight: 2, min: 1, max: 1},
                {material: 'mithril', weight: 1, min: 1, max: 1},
                {material: 'quicksilver', weight: 2, min: 1, max: 1},
                {material: 'runedSlate', weight: 2, min: 1, max: 1},
                {material: 'wyvernLeather', weight: 2, min: 1, max: 1},
            ],
            R: [
                {material: 'sunstone', weight: 1, min: 1, max: 1},
                {material: 'wyrmScale', weight: 2, min: 1, max: 1},
                {material: 'glacialHeart', weight: 2, min: 1, max: 1},
                {material: 'skyshard', weight: 1, min: 1, max: 1},
                {material: 'broodfang', weight: 1, min: 1, max: 1},
            ],
            M: [
                {material: 'phoenixFeather', weight: 1, min: 1, max: 1},
            ],
        },
        modifiers: questModifiers(['burning']),
        boss: {monster: 'wyrmqueen', legendary: 'wyrmqueenEmber'},
    },
    {
        key: 'sunkenMarsh',
        levelBand: [14, 23],
        name: 'Sunken Marsh',
        description: 'Drowned woods where cold things slip between the reeds. Accuracy finds them; fire burns them out.',
        basePower: 6.5,
        monsterScale: 1.3,
        entryFee: 100,
        fameToUnlock: 0,
        unlockAchievement: 'clear-hollowMines',
        fameForFirstClear: 0,
        travelSeconds: 0,
        mapPosition: {x: 860, y: 275},
        encounters: buildEncounters([
            ['bogLeech', 'bogLeech'],
            ['mireStalker', 'bogLeech'],
            ['frostToad'],
            ['mireStalker', 'marshWisp'],
            ['drownedKnight', 'marshWisp'],
            ['frostToad', 'bogLeech'],
            ['mireStalker', 'marshWisp'],
            ['drownedKnight'],
            ['frostToad', 'marshWisp'],
            ['mireStalker', 'mireStalker'],
            ['drownedKnight', 'marshWisp', 'marshWisp'],
            ['bogHag'],
        ]),
        pools: {
            // Hollow Mines' uncommon materials are common in every tier 3 area, plus one of the area's own.
            C: [
                {material: 'steelIngot', weight: 3, min: 1, max: 1},
                {material: 'trollHide', weight: 2, min: 1, max: 1},
                {material: 'garnet', weight: 2, min: 1, max: 1},
                {material: 'silverOre', weight: 2, min: 1, max: 1},
                {material: 'spiderSilk', weight: 2, min: 1, max: 1},
                {material: 'ancientBone', weight: 2, min: 1, max: 1},
                {material: 'ritualAsh', weight: 2, min: 1, max: 1},
                {material: 'amber', weight: 1, min: 1, max: 1},
                {material: 'marshReed', weight: 3, min: 1, max: 1},
            ],
            U: [
                {material: 'emerald', weight: 1, min: 1, max: 1},
                {material: 'bogIron', weight: 2, min: 1, max: 1},
                {material: 'leechSac', weight: 2, min: 1, max: 1},
                {material: 'eelskin', weight: 2, min: 1, max: 1},
                {material: 'peatmoss', weight: 2, min: 1, max: 1},
                {material: 'mithril', weight: 1, min: 1, max: 1},
                {material: 'quicksilver', weight: 2, min: 1, max: 1},
                {material: 'runedSlate', weight: 2, min: 1, max: 1},
                {material: 'wyvernLeather', weight: 2, min: 1, max: 1},
            ],
            R: [
                {material: 'tigerEye', weight: 1, min: 1, max: 1},
                {material: 'hagstone', weight: 2, min: 1, max: 1},
                {material: 'drownedSteel', weight: 2, min: 1, max: 1},
                {material: 'skyshard', weight: 1, min: 1, max: 1},
                {material: 'broodfang', weight: 1, min: 1, max: 1},
            ],
            M: [
                {material: 'blackPearl', weight: 1, min: 1, max: 1},
            ],
        },
        modifiers: questModifiers(['frozen']),
        boss: {monster: 'mireMother', legendary: 'mireheart'},
    },
    {
        key: 'thunderheadCrags',
        levelBand: [14, 23],
        name: 'Stormwrack Coast',
        description: 'Sea cliffs and shipwrecks under a storm that never breaks. Everything here strikes fast and true. Evasion and block keep you standing; cold slows them down.',
        basePower: 6.5,
        monsterScale: 1.3,
        entryFee: 100,
        fameToUnlock: 0,
        unlockAchievement: 'clear-hollowMines',
        fameForFirstClear: 0,
        travelSeconds: 0,
        mapPosition: {x: 1140, y: 140},
        encounters: buildEncounters([
            ['sparkWisp', 'sparkWisp'],
            ['cragLynx', 'sparkWisp'],
            ['thunderRam'],
            ['stormHarpy', 'sparkWisp'],
            ['stormcaller', 'sparkWisp'],
            ['thunderRam', 'cragLynx'],
            ['stormHarpy', 'cragLynx'],
            ['stormcaller'],
            ['thunderRam', 'sparkWisp'],
            ['stormHarpy', 'stormHarpy'],
            ['stormcaller', 'sparkWisp', 'sparkWisp'],
            ['thunderbird'],
        ]),
        pools: {
            // Hollow Mines' uncommon materials are common in every tier 3 area, plus one of the area's own.
            C: [
                {material: 'steelIngot', weight: 3, min: 1, max: 1},
                {material: 'trollHide', weight: 2, min: 1, max: 1},
                {material: 'garnet', weight: 2, min: 1, max: 1},
                {material: 'silverOre', weight: 2, min: 1, max: 1},
                {material: 'spiderSilk', weight: 2, min: 1, max: 1},
                {material: 'ancientBone', weight: 2, min: 1, max: 1},
                {material: 'ritualAsh', weight: 2, min: 1, max: 1},
                {material: 'amber', weight: 1, min: 1, max: 1},
                {material: 'thunderhorn', weight: 3, min: 1, max: 1},
            ],
            U: [
                {material: 'sapphire', weight: 1, min: 1, max: 1},
                {material: 'galeFeather', weight: 2, min: 1, max: 1},
                {material: 'stormhide', weight: 2, min: 1, max: 1},
                {material: 'cragGranite', weight: 2, min: 1, max: 1},
                {material: 'ozoneShard', weight: 2, min: 1, max: 1},
                {material: 'mithril', weight: 1, min: 1, max: 1},
                {material: 'quicksilver', weight: 2, min: 1, max: 1},
                {material: 'runedSlate', weight: 2, min: 1, max: 1},
                {material: 'wyvernLeather', weight: 2, min: 1, max: 1},
            ],
            R: [
                {material: 'opal', weight: 1, min: 1, max: 1},
                {material: 'rocPlume', weight: 2, min: 1, max: 1},
                {material: 'thunderstone', weight: 2, min: 1, max: 1},
                {material: 'skyshard', weight: 1, min: 1, max: 1},
                {material: 'broodfang', weight: 1, min: 1, max: 1},
            ],
            M: [
                {material: 'tempestQuill', weight: 1, min: 1, max: 1},
            ],
        },
        modifiers: questModifiers(['shocking']),
        boss: {monster: 'tempestRoc', legendary: 'tempestTalon'},
    },
    {
        key: 'sunderedRift',
        levelBand: [22, 34],
        name: 'Sundered Sanctum',
        description: 'An oracle\'s ruined temple, raised where the storms of all three wilds meet and tear the world open. Its creatures burn, freeze and shock at once, so every resistance counts.',
        basePower: 14.5,
        monsterScale: 1.3,
        entryFee: 300,
        fameToUnlock: 0,
        unlockAchievement: ['clear-ashenPeaks', 'clear-sunkenMarsh', 'clear-thunderheadCrags'],
        fameForFirstClear: 0,
        travelSeconds: 0,
        mapPosition: {x: 1015, y: 410},
        encounters: buildEncounters([
            ['riftMote', 'riftMote', 'riftMote'],
            ['riftHound', 'riftMote'],
            ['shardGolem'],
            ['riftHound', 'riftHound'],
            ['emberRevenant', 'frostRevenant'],
            ['shardGolem', 'riftMote'],
            ['riftHound', 'riftMote', 'riftMote'],
            ['stormRevenant', 'frostRevenant'],
            ['emberRevenant', 'stormRevenant'],
            ['shardGolem', 'riftHound'],
            ['frostRevenant', 'riftMote', 'riftMote'],
            ['riftWarden', 'riftMote'],
        ]),
        pools: {
            // Tier 3's shared materials are common here, plus the rift's own glass.
            C: [
                {material: 'quicksilver', weight: 3, min: 1, max: 1},
                {material: 'runedSlate', weight: 2, min: 1, max: 1},
                {material: 'wyvernLeather', weight: 2, min: 1, max: 1},
                {material: 'mithril', weight: 1, min: 1, max: 1},
                {material: 'skyshard', weight: 1, min: 1, max: 1},
                {material: 'riftGlass', weight: 3, min: 1, max: 1},
            ],
            U: [
                {material: 'riftsteel', weight: 2, min: 1, max: 1},
                {material: 'prismShard', weight: 2, min: 1, max: 1},
                {material: 'voidSilk', weight: 2, min: 1, max: 1},
                {material: 'wardenStone', weight: 2, min: 1, max: 1},
            ],
            R: [
                {material: 'flawlessRuby', weight: 1, min: 1, max: 1},
                {material: 'flawlessSapphire', weight: 1, min: 1, max: 1},
                {material: 'flawlessEmerald', weight: 1, min: 1, max: 1},
                {material: 'riftEssence', weight: 2, min: 1, max: 1},
                {material: 'wardenPlate', weight: 2, min: 1, max: 1},
            ],
            M: [
                {material: 'prismaticEye', weight: 1, min: 1, max: 1},
            ],
        },
        modifiers: [...questModifiers(['burning', 'frozen', 'shocking']), riteModifier],
        boss: {monster: 'riftTyrant', legendary: 'riftheart'},
    },
    // ---- Tier 5: four areas past the Sanctum, each under one punishing rule. Each holds a key as a
    // mythic drop; all four open the way to the final area. ----
    {
        key: 'amberHive',
        levelBand: [34, 44],
        name: 'The Amber Hive',
        description: 'A hive grown over a sunken forest, humming with things that sting. Their acid eats at armor and nerve alike, so the best answer is never to be hit at all.',
        rules: ['corrosion'],
        basePower: 32,
        monsterScale: 1.3,
        entryFee: 800,
        fameToUnlock: 0,
        unlockAchievement: 'clear-sunderedRift',
        fameForFirstClear: 0,
        travelSeconds: 0,
        mapPosition: {x: 1245, y: 350},
        encounters: buildEncounters([
            ['swarmling', 'swarmling', 'hiveDrone', 'hiveDrone'],
            ['hiveDrone', 'acidSpitter', 'hiveDrone'],
            ['thornMantis', 'swarmling', 'swarmling'],
            ['amberBeetle', 'hiveDrone'],
            ['broodGuard', 'acidSpitter'],
            ['thornMantis', 'thornMantis'],
            ['acidSpitter', 'acidSpitter', 'swarmling', 'swarmling'],
            ['amberBeetle', 'thornMantis'],
            ['broodGuard', 'hiveDrone', 'hiveDrone'],
            ['swarmling', 'swarmling', 'swarmling', 'swarmling'],
            ['thornMantis', 'acidSpitter', 'hiveDrone'],
            ['hiveQueen', 'swarmling', 'swarmling'],
        ]),
        pools: {
            C: [
                {material: 'polishedTigerEye', weight: 1, min: 1, max: 1},
                {material: 'hiveChitin', weight: 3, min: 1, max: 1},
                {material: 'waspWing', weight: 3, min: 1, max: 1},
                {material: 'hiveWax', weight: 3, min: 1, max: 1},
                {material: 'riftsteel', weight: 1, min: 1, max: 1},
                {material: 'voidSilk', weight: 1, min: 1, max: 1},
            ],
            U: [
                {material: 'mantisScythe', weight: 2, min: 1, max: 1},
                {material: 'amberResin', weight: 2, min: 1, max: 1},
                {material: 'stingerVenom', weight: 2, min: 1, max: 1},
            ],
            R: [
                {material: 'royalJelly', weight: 2, min: 1, max: 1},
                {material: 'queenCarapace', weight: 2, min: 1, max: 1},
            ],
            // The key is a mythic: only reached by rarity upgrades from quest modifiers.
            M: [
                {material: 'amberKey', weight: 1, min: 1, max: 1},
                {material: 'hiveheart', weight: 1, min: 1, max: 1},
            ],
        },
        modifiers: questModifiers(),
        boss: {monster: 'amberEmpress', legendary: 'empressStinger'},
    },
    {
        key: 'duskgraveNecropolis',
        levelBand: [34, 44],
        name: 'Duskgrave Necropolis',
        description: 'A city of the dead under a sky that never brightens. Nothing heals here and ward fades for good, so a hero walks in with all the life they will get.',
        rules: ['noRecovery'],
        basePower: 32,
        monsterScale: 1.3,
        entryFee: 800,
        fameToUnlock: 0,
        unlockAchievement: 'clear-sunderedRift',
        fameForFirstClear: 0,
        travelSeconds: 0,
        mapPosition: {x: 1000, y: 605},
        encounters: buildEncounters([
            ['boneThrall', 'boneThrall', 'cryptGhoul'],
            ['wailingShade', 'boneThrall'],
            ['cryptGhoul', 'cryptGhoul'],
            ['barrowKnight'],
            ['plagueBearer', 'wailingShade'],
            ['boneThrall', 'boneThrall', 'boneThrall'],
            ['lichAcolyte', 'cryptGhoul'],
            ['barrowKnight', 'wailingShade'],
            ['plagueBearer', 'lichAcolyte'],
            ['cryptGhoul', 'wailingShade', 'boneThrall'],
            ['barrowKnight', 'boneThrall'],
            ['paleLich', 'wailingShade'],
        ]),
        pools: {
            C: [
                {material: 'polishedOpal', weight: 1, min: 1, max: 1},
                {material: 'graveIron', weight: 3, min: 1, max: 1},
                {material: 'shroudCloth', weight: 3, min: 1, max: 1},
                {material: 'boneMarrow', weight: 3, min: 1, max: 1},
                {material: 'wardenStone', weight: 1, min: 1, max: 1},
                {material: 'riftsteel', weight: 1, min: 1, max: 1},
            ],
            U: [
                {material: 'wraithEssence', weight: 2, min: 1, max: 1},
                {material: 'barrowSteel', weight: 2, min: 1, max: 1},
                {material: 'deathcap', weight: 2, min: 1, max: 1},
            ],
            R: [
                {material: 'radiantEmerald', weight: 1, min: 1, max: 1},
                {material: 'soulGem', weight: 2, min: 1, max: 1},
                {material: 'cryptPlate', weight: 2, min: 1, max: 1},
            ],
            M: [
                {material: 'graveKey', weight: 1, min: 1, max: 1},
                {material: 'paleCrown', weight: 1, min: 1, max: 1},
            ],
        },
        modifiers: questModifiers(),
        boss: {monster: 'duskRegent', legendary: 'regentPhylactery'},
    },
    {
        key: 'ironboundFoundry',
        levelBand: [34, 44],
        name: 'Ironbound Foundry',
        description: 'A foundry that never stopped working after its makers left. Its brass constructs throw every blow back at the striker, so measured hits and a tough hide win.',
        rules: ['reflect'],
        basePower: 32,
        monsterScale: 1.3,
        entryFee: 800,
        fameToUnlock: 0,
        unlockAchievement: 'clear-sunderedRift',
        fameForFirstClear: 0,
        travelSeconds: 0,
        mapPosition: {x: 1245, y: 520},
        encounters: buildEncounters([
            ['cogSpider', 'cogSpider', 'brassSentry'],
            ['steamHound', 'cogSpider'],
            ['brassSentry', 'brassSentry'],
            ['smelterGolem'],
            ['clockworkKnight', 'cogSpider'],
            ['steamHound', 'steamHound'],
            ['forgeWarden', 'brassSentry'],
            ['smelterGolem', 'cogSpider'],
            ['clockworkKnight', 'forgeWarden'],
            ['steamHound', 'cogSpider', 'cogSpider'],
            ['smelterGolem', 'brassSentry'],
            ['forgeTitan', 'cogSpider'],
        ]),
        pools: {
            C: [
                {material: 'polishedSunstone', weight: 1, min: 1, max: 1},
                {material: 'brassPlate', weight: 3, min: 1, max: 1},
                {material: 'cogwheel', weight: 3, min: 1, max: 1},
                {material: 'coolingOil', weight: 3, min: 1, max: 1},
                {material: 'riftsteel', weight: 1, min: 1, max: 1},
                {material: 'riftGlass', weight: 1, min: 1, max: 1},
            ],
            U: [
                {material: 'temperedSteel', weight: 2, min: 1, max: 1},
                {material: 'mainspring', weight: 2, min: 1, max: 1},
                {material: 'slagGlass', weight: 2, min: 1, max: 1},
            ],
            R: [
                {material: 'radiantRuby', weight: 1, min: 1, max: 1},
                {material: 'titanAlloy', weight: 2, min: 1, max: 1},
                {material: 'furnaceCore', weight: 2, min: 1, max: 1},
            ],
            M: [
                {material: 'cogKey', weight: 1, min: 1, max: 1},
                {material: 'forgeheart', weight: 1, min: 1, max: 1},
            ],
        },
        modifiers: questModifiers(),
        boss: {monster: 'ironOverseer', legendary: 'overseerSeal'},
    },
    {
        key: 'skyspireAerie',
        levelBand: [34, 44],
        name: 'Skyspire Aerie',
        description: 'A spire above the clouds where the storm gods keep watch. Every blow struck there is judged, so the fewest, heaviest blows win.',
        rules: ['karma'],
        basePower: 32,
        monsterScale: 1.3,
        entryFee: 800,
        fameToUnlock: 0,
        unlockAchievement: 'clear-sunderedRift',
        fameForFirstClear: 0,
        travelSeconds: 0,
        mapPosition: {x: 750, y: 560},
        encounters: buildEncounters([
            ['galeKestrel', 'galeKestrel', 'skyHarpy'],
            ['stormHawk', 'galeKestrel'],
            ['skyHarpy', 'skyHarpy'],
            ['cloudSerpent'],
            ['thunderEagle', 'galeKestrel'],
            ['stormHawk', 'stormHawk'],
            ['windWarden', 'skyHarpy'],
            ['cloudSerpent', 'stormHawk'],
            ['thunderEagle', 'windWarden'],
            ['galeKestrel', 'galeKestrel', 'galeKestrel'],
            ['cloudSerpent', 'skyHarpy'],
            ['skySovereign', 'galeKestrel'],
        ]),
        pools: {
            C: [
                {material: 'stormIron', weight: 3, min: 1, max: 1},
                {material: 'skyFeather', weight: 3, min: 1, max: 1},
                {material: 'galeSilk', weight: 3, min: 1, max: 1},
                {material: 'voidSilk', weight: 1, min: 1, max: 1},
                {material: 'riftGlass', weight: 1, min: 1, max: 1},
            ],
            U: [
                {material: 'eagleTalon', weight: 2, min: 1, max: 1},
                {material: 'thunderGlass', weight: 2, min: 1, max: 1},
                {material: 'windCrystal', weight: 2, min: 1, max: 1},
            ],
            R: [
                {material: 'radiantSapphire', weight: 1, min: 1, max: 1},
                {material: 'sovereignPlume', weight: 2, min: 1, max: 1},
                {material: 'skyforged', weight: 2, min: 1, max: 1},
            ],
            M: [
                {material: 'galeKey', weight: 1, min: 1, max: 1},
                {material: 'stormcrown', weight: 1, min: 1, max: 1},
            ],
        },
        modifiers: questModifiers(),
        boss: {monster: 'stormHerald', legendary: 'heraldBolt'},
    },
    // ---- Tier 6: past the portal the Oracle's Rite opens. Open only while the portal is. ----
    {
        key: 'shatteredThrone',
        levelBand: [44, 56],
        name: 'The Shattered Throne',
        description: 'A throne room adrift in a pocket of the rift, reached only through the Sanctum\'s portal. Every kind of foe the wilds hold waits here, stronger than anywhere else.',
        portal: true,
        basePower: 70,
        monsterScale: 1.3,
        entryFee: 2000,
        fameToUnlock: 0,
        fameForFirstClear: 0,
        travelSeconds: 0,
        mapPosition: {x: 1155, y: 685},
        encounters: buildEncounters([
            ['riftStalker', 'starfallMote', 'starfallMote'],
            ['voidWraith', 'riftStalker'],
            ['throneSentinel', 'starfallMote'],
            ['shatteredKnight', 'voidWraith'],
            ['emberColossus', 'riftStalker'],
            ['starfallMote', 'starfallMote', 'starfallMote', 'riftStalker'],
            ['throneSentinel', 'shatteredKnight'],
            ['voidWraith', 'voidWraith', 'starfallMote'],
            ['emberColossus', 'shatteredKnight'],
            ['riftStalker', 'riftStalker', 'voidWraith'],
            ['throneSentinel', 'emberColossus'],
            ['shatteredKing', 'shatteredKnight'],
        ]),
        pools: {
            C: [
                {material: 'throneStone', weight: 3, min: 1, max: 1},
                {material: 'voidIron', weight: 3, min: 1, max: 1},
                {material: 'starSilk', weight: 3, min: 1, max: 1},
            ],
            U: [
                {material: 'brilliantTigerEye', weight: 1, min: 1, max: 1},
                {material: 'brilliantSunstone', weight: 1, min: 1, max: 1},
                {material: 'brilliantOpal', weight: 1, min: 1, max: 1},
                {material: 'shatterglass', weight: 2, min: 1, max: 1},
                {material: 'kingsSteel', weight: 2, min: 1, max: 1},
                {material: 'emberOfAges', weight: 2, min: 1, max: 1},
            ],
            R: [
                {material: 'crownShard', weight: 2, min: 1, max: 1},
                {material: 'riftmetal', weight: 2, min: 1, max: 1},
            ],
            M: [
                {material: 'throneheart', weight: 1, min: 1, max: 1},
            ],
        },
        modifiers: questModifiers(['burning', 'frozen', 'shocking']),
        boss: {monster: 'pretender', legendary: 'borrowedCrown'},
    },
];
export const questOrder: string[] = questList.map(q => q.key);

// A quest's unlock: any one of its achievements (usually a clear of an earlier quest).
export function unlockKeys(quest: QuestDef): string[] {
    const u = quest.unlockAchievement;
    return !u ? [] : Array.isArray(u) ? u : [u];
}
export function unlockMet(achievements: string[], quest: QuestDef): boolean {
    const keys = unlockKeys(quest);
    return !keys.length || keys.some(k => achievements.includes(k));
}
// "Ashen Peaks, Sunken Marsh or Stormwrack Coast"
export function unlockQuestNames(quest: QuestDef): string {
    const names = unlockKeys(quest).map(k => questList.find(q => 'clear-' + q.key === k)?.name ?? 'an earlier quest');
    return names.length > 1 ? names.slice(0, -1).join(', ') + ' or ' + names[names.length - 1] : names[0] ?? '';
}
// A quest's campaign tier, from 0: quests that share a base power share a tier (the tier 3 trio).
const tierPowers = [...new Set(questList.map(q => q.basePower))].sort((a, b) => a - b);
export function questTier(questKey: string): number {
    const quest = questList.find(q => q.key === questKey);
    return quest ? tierPowers.indexOf(quest.basePower) : 0;
}

// Campaign difficulty: every monster in a quest (bosses, summons and the quest's Endless included)
// gets this much more life and damage, by the quest's campaign tier (index = questTier: 0 is Bramble
// Road, 5 the Shattered Throne).
export const CAMPAIGN_HP = [1, 1, 2, 10, 30, 100];
export const CAMPAIGN_DAMAGE = [1, 1, 1, 1.25, 1.5, 2];
export function campaignScale(quest: QuestDef): {hp: number, damage: number} {
    const tier = questTier(quest.endless?.baseKey ?? quest.key);
    return {hp: CAMPAIGN_HP[tier] ?? 1, damage: CAMPAIGN_DAMAGE[tier] ?? 1};
}

// Endless variants: one per quest, built from that quest's own encounters so each keeps its
// threats. A repeating CCCUCCUCCR pattern starts at the quest's opening difficulty and grows linearly.
// No items, gold or XP; it only records how deep each adventurer gets.
export const ENDLESS_PATTERN: EncounterTier[] = ['C', 'C', 'C', 'U', 'C', 'C', 'U', 'C', 'C', 'R'];
// Gold per attempt, by the base quest's campaign tier (questTier).
export const ENDLESS_FEES = [100, 500, 1000, 5000, 10000, 50000];
// Each encounter adds this share of the starting difficulty.
export const ENDLESS_GROWTH = 0.05;
// And every full pattern (10 encounters) multiplies difficulty by this, so the curve turns exponential.
export const ENDLESS_STEP = 1.1;
const ENDLESS_LENGTH = 500;
// Gentler steps than a normal quest, so a rare is a bump rather than a wall and records spread out.
export const endlessTierMultiplier: Record<EncounterTier, number> = {C: 1, U: 1.6, R: 2.4};
export function endlessKey(questKey: string): string {
    return questKey + ':endless';
}
function makeEndless(base: QuestDef): QuestDef {
    const byTier: Record<EncounterTier, string[][]> = {C: [], U: [], R: []};
    for (const e of base.encounters) {
        byTier[e.tier].push(e.monsters);
    }
    const used: Record<EncounterTier, number> = {C: 0, U: 0, R: 0};
    const encounters = Array.from({length: ENDLESS_LENGTH}, (_, i) => {
        const tier = ENDLESS_PATTERN[i % ENDLESS_PATTERN.length];
        const groups = byTier[tier].length ? byTier[tier] : byTier.C;
        return {tier, monsters: groups[used[tier]++ % groups.length]};
    });
    return {
        ...base,
        key: endlessKey(base.key),
        name: `${base.name}: Endless`,
        description: `How deep can an adventurer get? ${base.name}'s monsters, growing stronger every encounter, with no rewards.`,
        basePower: base.basePower,
        monsterScale: base.monsterScale,
        growth: ENDLESS_GROWTH,
        stepMultiplier: {every: ENDLESS_PATTERN.length, factor: ENDLESS_STEP},
        tierMultiplier: endlessTierMultiplier,
        entryFee: ENDLESS_FEES[Math.min(questTier(base.key), ENDLESS_FEES.length - 1)],
        fameForFirstClear: 0,
        encounters,
        pools: {C: [], U: [], R: [], M: []},
        modifiers: [],
        boss: undefined,
        // Endless gives nothing, so it stays open when the area's portal is closed.
        portal: undefined,
        endless: {baseKey: base.key},
    };
}
export const quests: Record<string, QuestDef> = Object.fromEntries([...questList, ...questList.map(makeEndless)].map(q => [q.key, q]));

// Power before the tier multiplier: how strong the quest is at this point, whatever the reward.
export function basePowerAt(quest: QuestDef, index: number): number {
    const step = quest.stepMultiplier ? Math.pow(quest.stepMultiplier.factor, Math.floor(index / quest.stepMultiplier.every)) : 1;
    return quest.basePower * (1 + (quest.growth ?? growthPerEncounter) * index) * step;
}
export function encounterPower(quest: QuestDef, index: number): number {
    const tier = quest.encounters[index].tier;
    return basePowerAt(quest, index) * (quest.tierMultiplier ?? tierMultiplier)[tier];
}

// The hero level an encounter is pitched at. Each quest has a level band: its weakest encounter is
// the band's bottom and its final rare the top, with encounters in between placed by power (on a
// log scale). Endless quests carry on past the top at the same rate. Bands overlap from tier to
// tier, and widen with each tier so heroes reach the 60s by the last one.
function questPowerRange(quest: QuestDef): {min: number, max: number} {
    const base = quest.endless ? quests[quest.endless.baseKey] : quest;
    const powers = base.encounters.map((_, i) => encounterPower(base, i));
    return {min: Math.min(...powers), max: Math.max(...powers)};
}
export function encounterLevel(quest: QuestDef, index: number): number {
    const [lo, hi] = quest.levelBand ?? [3, 10];
    const {min, max} = questPowerRange(quest);
    const t = max > min ? Math.log(encounterPower(quest, index) / min) / Math.log(max / min) : 1;
    return Math.max(1, Math.round(lo + (hi - lo) * t));
}
// A hero level's typical monster power, for comparing gear: each quest's top level against its
// final rare's power, on a log scale between them.
export function powerForLevel(level: number): number {
    const anchors: [number, number][] = [[1, 1] as [number, number], ...questList.map(q => [q.levelBand?.[1] ?? 10, questPowerRange(q).max] as [number, number])]
        .sort((a, b) => a[0] - b[0]).filter((a, i, all) => i === 0 || a[0] > all[i - 1][0]);
    let i = 1;
    while (i < anchors.length - 1 && level > anchors[i][0]) i++;
    const [l0, p0] = anchors[i - 1], [l1, p1] = anchors[i];
    return Math.exp(Math.log(p0) + (Math.log(p1) - Math.log(p0)) * (level - l0) / (l1 - l0));
}
// XP falls off against the quest's level, its highest encounter level (the final rare), so every
// encounter on a quest stops paying XP at the same hero level. Weaker encounters still pay less,
// since XP scales with each encounter's power.
export function questXpLevel(quest: QuestDef): number {
    return Math.max(...quest.encounters.map((_, i) => encounterLevel(quest, i)));
}
// XP falls off evenly for every level the hero is above the quest, reaching 0 this many levels over:
// one level per 5 quest levels, rounded up, and at least 5 (Bramble Road to the Crags 5, the
// Sanctum 7, tier 5 9, the Shattered Throne 12, so heroes can reach level 68 there).
export const XP_FALLOFF_MIN = 5;
export function xpFalloffLevels(questLevel: number): number {
    return Math.max(XP_FALLOFF_MIN, Math.ceil(questLevel / 5));
}
// Each active modifier raises the level XP is measured against by one (the falloff range stays the
// base quest's), so the Shattered Throne with 7 modifiers pays XP up to level 75.
export function xpMultiplier(heroLevel: number, questLevel: number, modifierCount = 0): number {
    const over = heroLevel - (questLevel + modifierCount);
    return Math.max(0, 1 - Math.max(0, over) / xpFalloffLevels(questLevel));
}

// Baseline monster stats at power 1, before each monster's multipliers.
export const EVASION_GROWTH = 0.7;
// Monster accuracy grows slower than power too, so hero evasion can keep chains short.
export const ACCURACY_GROWTH = 0.5;
export const monsterBaseline = {hp: 24, damage: 3, armor: 1, accuracy: 8, evasion: 24};

// Areas the map keeps hidden: the tier 5 areas and the final one until the Sundered Sanctum is
// cleared, and the Shattered Throne until a portal key turns up (or the portal is open).
export const PORTAL_KEYS = ['amberKey', 'graveKey', 'cogKey', 'galeKey'];
export function questHiddenOnMap(state: GameState, key: string): boolean {
    const quest = quests[key];
    if (!quest) return false;
    const p = state.questProgress.sunderedRift;
    const sanctumCleared = state.achievements.includes('clear-sunderedRift') || (p?.fullClears ?? 0) > 0 || (p?.bestModifiedClear ?? -1) >= 0;
    const keyFound = !!state.portal || PORTAL_KEYS.some(k => (state.materials[k] ?? 0) > 0);
    return questTier(key) >= 4 && !sanctumCleared || !!quest.portal && !keyFound;
}
