import type {BaseRole, BaseStats, CoreStat, MaterialDef, StatKey, StatValues, Tag} from '../engine/types';
import {isCappedStat} from './stats';

// ---------------- Crafting templates ----------------
//
// Weapons and armor. A weapon's core stat is its flat damage; armor's are armor, evasion, ward and
// block. Those, and flat weapon damage, are capped by the highest cap among the bases in a craft
// (they should always be the biggest part of an item). Every other stat adds up with no cap,
// including core stats like hpLostAsWard. A strong craft
// with several base slots usually looks like:
//   1. One base with a high cap for the core stat (role 'cap').
//   2. A few bases with a high core value to fill toward that cap in as few slots as possible
//      (role 'value').
//   3. Optionally, a base with more decoration slots than the rest (role 'decor').
//   4. The remaining slots for the secondary stats you want most (role 'secondary'), then the
//      decorations.
// Or trade a little core stat for a base that does a bit of both (roles 'balanced', 'capMixed').
//
// Every weapon and armor base has a core stat and one of the roles below. Values come from the
// material's tier, so "high" always means high for its tier. Two bases for the same slot and tier
// with the same core stat get different roles or different secondaries, so neither is strictly
// better. scripts/checkMaterials.ts checks both rules.
//
// Accessories. Belts, rings and amulets carry no core stat as their point, so they have their
// own template: one stat at full strength (role 'focused'), two stats at about half strength
// each (role 'paired'), or a weaker stat with an extra decoration slot (role 'decor'). Their
// numbers are set by hand below.

// Core value of a typical base at each tier (index = power), before the item type's multiplier.
// Physical damage is one-handed-sword equivalent, armor/evasion/ward body-armor equivalent.
const PHYS = [0, 3, 6, 9, 13, 18, 24, 30, 36, 43, 50, 58, 66, 75, 85, 96];
// Armor and evasion per tier: the cap role on body armor reaches about 300 at P15 (80 x 3.75).
const DEFENSE = [0, 3, 6, 8, 11, 17, 21, 25, 30, 36, 41, 48, 55, 63, 72, 80];
const BLOCK = [0, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18];
// Flat elemental damage ignores armor, so a weapon carries less of it.
const ELEMENTAL_SHARE = 0.45;
// Max HP from a medium secondary at power 1: 50% more than the HP from the same tier's Str (2 HP each).
const HP_UNIT = 3;
// Ward soaks any damage and refills every encounter. Like armor and evasion, it scales with the armor
// piece (and 0.8x on amulets, 0.5x on belts).
const DECORATIONS = [0, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 6, 6, 6, 7, 7];

function coreValue(stat: StatKey, power: number): number {
    switch (stat) {
        case 'physicalDamage': return PHYS[power];
        case 'fireDamage': case 'coldDamage': case 'lightningDamage': return PHYS[power] * ELEMENTAL_SHARE;
        case 'blockChance': return BLOCK[power];
        // Ward is 0.6x armor and evasion (0.3x here, doubled with the gear pool below).
        case 'ward': return 0.3 * DEFENSE[power];
        case 'hpLostAsWard': return BLOCK[power];
        default: return DEFENSE[power];
    }
}

// A medium secondary at power 1. Flat stats grow with power; percent stats grow more slowly.
const SECONDARY: Partial<Record<StatKey, [number, 'flat' | 'percent']>> = {
    str: [1, 'flat'], dex: [1, 'flat'], int: [1, 'flat'],
    accuracy: [3, 'flat'], maxHealth: [HP_UNIT, 'flat'],
    critChance: [0.03, 'percent'], attackSpeed: [0.03, 'percent'], lifeLeech: [0.012, 'percent'], lifeRegenPercent: [0.005, 'percent'], critMultiplier: [0.1, 'percent'],
    fireResist: [0.04, 'percent'], coldResist: [0.04, 'percent'], lightningResist: [0.04, 'percent'],
    increasedElementalDamage: [0.06, 'percent'], increasedDamage: [0.04, 'percent'],
};
// Life leech: don't add new sources (on materials, decorations or anything else); use another stat.
// Life on hit and life regen follow set curves: the top amount at each tier (a focused source) is the
// table value, and a medium secondary is half of it. Life regen is at least 4x life on hit at every
// tier. Hand-set regen follows the same rule: a focused accessory at least 4x the tier's top life on
// hit, decorations and paired accessories at least 2x (Hive Wax set to 20, the low end of that).
// Flat ward on dodge and on block decorations use the life on hit values.
// Life on hit climbs to its cap over all 15 tiers (it used to reach it at P10).
export const LIFE_ON_HIT_TOP = [0, 0.5, 0.75, 1, 1.5, 2, 3, 5, 7, 11, 17, 24, 31, 40, 50, 60];
export const LIFE_REGEN_TOP = [0, 2, 3, 4, 6, 10, 20, 40, 60, 90, 120, 140, 160, 180, 200, 220];
const CURVED: Partial<Record<StatKey, number[]>> = {lifeOnHit: LIFE_ON_HIT_TOP, lifeRegen: LIFE_REGEN_TOP};
function secondaryValue(stat: StatKey, power: number): number {
    const curve0 = CURVED[stat];
    if (curve0) return curve0[power] / 2;
    const [unit, curve] = SECONDARY[stat] ?? [0, 'flat'];
    return unit * (curve === 'flat' ? power : (power + 2) / 3);
}

// Defenses as damage (max HP as fire, evasion as cold, max ward as lightning). One source is worth a
// weapon decoration of flat elemental damage at its tier (0.3x PHYS) for a hero with a typical
// amount of that defense, so heroes built around it come out well ahead. Typical amounts by tier:
// HP 15 x P^1.75 (at least 28), evasion 4x DEFENSE + 1.5 per level, ward 2.4x DEFENSE + 1.5 per
// level (level = the tier's gear level). HP runs highest and ward lowest, so the percentages run
// the other way.
// The values are rounded to 0.5% and set by hand so each stat rises with tier (the fair value above
// falls for HP as tiers rise, because HP grows faster than flat damage). Fair values for comparison:
// HP P2 3.6%, P7 2.0%, P12 1.7%; evasion P4 6.6%, P8 7.1%, P11 7.3%; ward P5 9.0%, P7 10.2%, P11 10.8%.
const DEFENSE_AS_DAMAGE: Record<'healthAsFire' | 'evasionAsCold' | 'wardAsLightning', Record<number, number>> = {
    healthAsFire: {2: 0.015, 7: 0.02, 12: 0.025},
    evasionAsCold: {4: 0.065, 8: 0.07, 11: 0.075},
    wardAsLightning: {5: 0.09, 7: 0.1, 11: 0.11},
};
export function fairDefenseAsDamage(stat: 'healthAsFire' | 'evasionAsCold' | 'wardAsLightning', power: number): number {
    const level = 1 + 3 * (power - 1);
    const typical = stat === 'healthAsFire' ? Math.max(28, 15 * Math.pow(power, 1.75))
        : stat === 'evasionAsCold' ? 4 * DEFENSE[power] + 1.5 * level
        : 2.4 * DEFENSE[power] + 1.5 * level;
    return 0.3 * PHYS[power] / typical;
}
export function defenseAsDamage(stat: 'healthAsFire' | 'evasionAsCold' | 'wardAsLightning', power: number): number {
    return DEFENSE_AS_DAMAGE[stat][power] ?? Math.round(200 * fairDefenseAsDamage(stat, power)) / 200;
}

// How each role sets the core value, the core cap (both as multiples of the tier's core value),
// the secondary budget (1 = medium) and decoration slots against the tier's usual count.
const ROLES: Record<string, {value: number, cap: number, secondary: number, decorations: number}> = {
    cap: {value: 0.6, cap: 3.75, secondary: 0, decorations: 0},
    value: {value: 1.5, cap: 2.5, secondary: 0, decorations: 0},
    decor: {value: 0.7, cap: 2, secondary: 0.5, decorations: 1},
    secondary: {value: 0.4, cap: 1.5, secondary: 2, decorations: 0},
    balanced: {value: 1, cap: 2.5, secondary: 1, decorations: 0},
    capMixed: {value: 0.5, cap: 3.25, secondary: 0.75, decorations: 0},
};

function round(value: number, percent: boolean): number {
    if (percent) return Math.round(value * 100) / 100;
    return value < 3 ? Math.round(value * 10) / 10 : Math.round(value);
}
const isPercent = (stat: StatKey) => stat === 'blockChance' || stat === 'hpLostAsWard' || SECONDARY[stat]?.[1] === 'percent';

interface CraftOptions {
    // Mythics and legendaries sit a step above their tier.
    boost?: number
    itemLabel?: string
    labelPriority?: number
    // Adds the attribute that pairs with this armor piece's defense (STR with armor, DEX with
    // evasion, INT with ward): 1 at P1 rising to 20 at P15.
    attr?: CoreStat
}
export const PAIRED_ATTRIBUTE = [0, 1, 2, 4, 5, 6, 8, 9, 11, 12, 13, 15, 16, 18, 19, 20];

// A weapon or armor base. core: core stats and their share (1 = all of the role's value; split
// across two for hybrids). secondary: other stats and their share of the role's secondary budget.
function craft(power: number, role: BaseRole, core: Partial<Record<StatKey, number>>, secondary: Partial<Record<StatKey, number>> = {}, options: CraftOptions = {}): BaseStats {
    const r = ROLES[role];
    const boost = options.boost ?? 1;
    const stats: BaseStats['stats'] = {};
    for (const [stat, share] of Object.entries(core) as [StatKey, number][]) {
        const v = coreValue(stat, power) * share * boost;
        const value = round(v * r.value, isPercent(stat));
        stats[stat] = isCappedStat(stat) ? [value, round(v * r.cap, isPercent(stat))] : value;
    }
    for (const [stat, share] of Object.entries(secondary) as [StatKey, number][]) {
        stats[stat] = round(secondaryValue(stat, power) * r.secondary * share * boost, isPercent(stat));
    }
    if (options.attr) stats[options.attr] = (typeof stats[options.attr] === 'number' ? stats[options.attr] as number : 0) + PAIRED_ATTRIBUTE[power];
    const base: BaseStats = {stats, maxDecorations: DECORATIONS[power] + r.decorations, role};
    if (options.itemLabel) base.itemLabel = options.itemLabel;
    if (options.labelPriority !== undefined) base.labelPriority = options.labelPriority;
    return base;
}

// A base with extra hand-set stats on top of a craft.
function withStats(base: BaseStats, extra: BaseStats['stats']): BaseStats {
    return {...base, stats: {...base.stats, ...extra}};
}
// Ward on an amulet: the body armor value for the tier with no cap (the amulet scales it to 0.8x).
const amuletWard = (power: number, boost = 1) => Math.round(0.3 * DEFENSE[power] * boost);

// An accessory base, set by hand.
function accessory(role: BaseRole, stats: BaseStats['stats'], maxDecorations: number, itemLabel?: string): BaseStats {
    return itemLabel ? {stats, maxDecorations, role, itemLabel} : {stats, maxDecorations, role};
}

export const roleLabel: Record<BaseRole, string> = {
    cap: 'High cap', value: 'High value', decor: 'Extra decorations', secondary: 'High secondary',
    balanced: 'Balanced', capMixed: 'High cap + secondary', focused: 'Focused', paired: 'Paired',
};
export const roleHint: Record<BaseRole, string> = {
    cap: 'Low core value but a high cap: one of these lets the rest of the craft fill higher.',
    value: 'High core value for its tier, so you reach the cap in fewer slots.',
    decor: 'More decoration slots than most of its tier.',
    secondary: 'Light on the core stat, heavy on a secondary stat.',
    balanced: 'Some core stat, some secondary stat.',
    capMixed: 'A high cap and some secondary stat, with a low core value.',
    focused: 'One stat at full strength.',
    paired: 'Two stats at about half strength each.',
};

const MYTHIC = 1.15, LEGENDARY = 1.25;

// ---------------- Gems ----------------
// Decoration-only gems. Weapons and accessories take the attribute; armor pieces take the resistance.
// Single gems pair an attribute with a resistance (ruby: STR and fire, sapphire: INT and lightning,
// emerald: DEX and cold) in four grades. Combination stones carry two of each at a little less per
// stat but more in all, a grade later.
const GEMS: {key: string, name: string, attrs: CoreStat[], resists: StatKey[], text: string}[] = [
    {key: 'ruby', name: 'Ruby', attrs: ['str'], resists: ['fireResist'], text: 'Red as a forge mouth. It hardens the arm, or the skin against fire.'},
    {key: 'sapphire', name: 'Sapphire', attrs: ['int'], resists: ['lightningResist'], text: 'Deep blue and still. It clears the mind, or grounds a storm.'},
    {key: 'emerald', name: 'Emerald', attrs: ['dex'], resists: ['coldResist'], text: 'Green and quick with light. It steadies the hand, or keeps out the cold.'},
    {key: 'tigerEye', name: 'Tiger\'s Eye', attrs: ['str', 'dex'], resists: ['fireResist', 'coldResist'], text: 'Banded gold and brown. Strength and speed, or shelter from fire and frost.'},
    {key: 'sunstone', name: 'Sunstone', attrs: ['str', 'int'], resists: ['fireResist', 'lightningResist'], text: 'Warm to the touch and bright inside. Strength and wit, or shelter from fire and storm.'},
    {key: 'opal', name: 'Opal', attrs: ['int', 'dex'], resists: ['lightningResist', 'coldResist'], text: 'Every color at once. Wit and speed, or shelter from storm and frost.'},
];
// [key prefix, name prefix, name suffix, power, attribute, resistance] per grade.
const SINGLE_GRADES: [string, string, string, number, number, number][] = [
    ['', '', ' Shard', 2, 2, 0.05], ['', '', '', 5, 4, 0.1], ['flawless', 'Flawless ', '', 8, 8, 0.2], ['radiant', 'Radiant ', '', 12, 12, 0.3],
];
const COMBO_GRADES: [string, string, string, number, number, number][] = [
    ['rough', 'Rough ', '', 3, 1.5, 0.03], ['', '', '', 6, 3, 0.06], ['polished', 'Polished ', '', 10, 6, 0.12], ['brilliant', 'Brilliant ', '', 13, 8, 0.16],
];
export function gemKey(gem: string, grade: string, suffix = ''): string {
    const base = grade ? grade + gem[0].toUpperCase() + gem.slice(1) : gem;
    return suffix ? base + suffix.trim() : base;
}
function gemMaterials(): MaterialDef[] {
    return GEMS.flatMap(g => (g.attrs.length > 1 ? COMBO_GRADES : SINGLE_GRADES).map(([grade, before, after, power, attr, resist]) => {
        const attrs = Object.fromEntries(g.attrs.map(a => [a, attr]));
        const resists = Object.fromEntries(g.resists.map(r => [r, resist]));
        return {
            key: gemKey(g.key, grade, after), name: before + g.name + after, prefix: before + g.name, power,
            description: g.text,
            decoration: {weapon: attrs, accessory: attrs, armor: resists},
        };
    }));
}

const list: MaterialDef[] = [
    // ---- Power 1: Quest 1 commons ----
    {
        key: 'wood', name: 'Wood', prefix: 'Wooden', power: 1,
        description: 'Light and cheap. Steadies a weapon and makes a fair shield.',
        base: {
            weapon: craft(1, 'balanced', {physicalDamage: 1}, {accuracy: 1}),
            // A wooden bow outshoots other wooden weapons, and a staff carries a little focus.
            bow: craft(1, 'value', {physicalDamage: 1}, {}, {itemLabel: 'Wooden Longbow'}),
            staff: craft(1, 'balanced', {physicalDamage: 1}, {int: 0.5, str: 0.5}),
            wand: craft(1, 'balanced', {physicalDamage: 1}, {int: 1}, {itemLabel: 'Wooden Wand'}),
            shield: craft(1, 'decor', {armor: 1, blockChance: 1}),
        },
        decoration: {weapon: {accuracy: 4}, shield: {blockChance: 0.01}},
    },
    {
        key: 'copperOre', name: 'Copper Ore', prefix: 'Copper', power: 1,
        description: 'A soft metal that carries a spark. Heavy for its size.',
        base: {
            weapon: craft(1, 'value', {physicalDamage: 1}),
            // A copper-banded bow: low damage, high cap, for wood to fill (the wooden longbow is the value bow).
            bow: craft(1, 'cap', {physicalDamage: 1}),
            armor: craft(1, 'value', {armor: 1}),
            bodyArmor: craft(1, 'value', {armor: 1}, {}, {itemLabel: 'Copper Mail'}),
            accessory: accessory('focused', {lightningResist: 0.12}, 1),
        },
        decoration: {weapon: {physicalToLightning: 0.25}, armor: {lightningResist: 0.04}},
    },
    {
        key: 'roughHide', name: 'Rough Hide', prefix: 'Hide', power: 1,
        description: 'Light armor that favors dodging over soaking hits.',
        base: {
            armor: craft(1, 'value', {evasion: 1}),
            bodyArmor: craft(1, 'value', {evasion: 1}, {}, {itemLabel: 'Hide Vest'}),
            belt: accessory('focused', {maxHealth: 8}, 1),
        },
        decoration: {armor: {maxHealth: 3}},
        equip: {itemType: 'bodyArmor', name: 'Hide Wrap', stats: {evasion: 1}},
    },
    {
        key: 'boneShard', name: 'Bone Shard', prefix: 'Bone', power: 1,
        description: 'Sharp splinters for charms and crude blades.',
        base: {
            dagger: craft(1, 'balanced', {physicalDamage: 1}, {critChance: 0.5, int: 0.5}),
            accessory: accessory('decor', {critChance: 0.02}, 2),
            ring: accessory('focused', {critMultiplier: 0.15}, 1, 'Bone Charm'),
            amulet: accessory('decor', {int: 2}, 2),
            // Bramble Road's first ward and INT for casters' helmets and shields.
            helmet: craft(1, 'balanced', {ward: 1}, {}, {attr: 'int', itemLabel: 'Bone Circlet'}),
            shield: craft(1, 'balanced', {ward: 1}, {}, {attr: 'int', itemLabel: 'Bone Ward'}),
        },
        decoration: {weapon: {critMultiplier: 0.08}, armor: {ward: 1}, accessory: {critChance: 0.02}},
        equip: {itemType: 'dagger', name: 'Bone Shiv', stats: {physicalDamage: 2}},
    },
    {
        key: 'flint', name: 'Flint', prefix: 'Flint', power: 1,
        description: 'Knaps to a wicked edge. Axes and daggers made from it find weak spots.',
        base: {
            axe: craft(1, 'balanced', {physicalDamage: 1}, {critChance: 0.5, dex: 0.5}),
            dagger: craft(1, 'secondary', {physicalDamage: 1}, {critChance: 0.5, dex: 0.5}),
        },
        decoration: {weapon: {critChance: 0.02}, ring: {fireDamage: 1}},
    },
    {
        key: 'hawkFeather', name: 'Hawk Feather', prefix: 'Feathered', power: 1,
        description: 'Fletching for true arrows, and a light step in boots.',
        base: {
            bow: craft(1, 'secondary', {physicalDamage: 1}, {accuracy: 0.5, dex: 0.5}),
            boots: craft(1, 'balanced', {evasion: 1}, {}, {attr: 'dex'}),
        },
        decoration: {bow: {dex: 1, accuracy: 3}, weapon: {accuracy: 2, dex: 1}, helmet: {accuracy: 3}, boots: {evasion: 2}},
    },
    {
        key: 'healingMoss', name: 'Healing Moss', prefix: 'Mossy', power: 1,
        description: 'Soft green moss that knits small wounds, even between fights.',
        base: {
            armor: craft(1, 'secondary', {evasion: 1}, {lifeRegen: 1}),
            belt: accessory('paired', {maxHealth: 4, lifeRegen: 1}, 1),
        },
        decoration: {armor: {lifeRegen: 1}},
    },
    {
        key: 'sinew', name: 'Sinew', prefix: 'Sinew', power: 1,
        description: 'Tough cord from wolves and boars. Binds a grip that bites back.',
        base: {
            gloves: craft(1, 'secondary', {evasion: 1}, {accuracy: 0.5, lifeOnHit: 0.5}),
            ring: accessory('focused', {dex: 2}, 1),
        },
        decoration: {weapon: {lifeOnHit: 0.5}, axe: {lifeOnHit: 0.5, dex: 1}, dagger: {lifeOnHit: 0.5, dex: 1}, gloves: {accuracy: 3}, accessory: {dex: 1}},
    },
    // ---- Power 2: Quest 1 uncommons, Quest 2 commons ----
    {
        key: 'ironOre', name: 'Iron Ore', prefix: 'Iron', power: 2,
        description: 'Plain, heavy and dependable. Holds up under a lot of work.',
        base: {
            weapon: craft(2, 'cap', {physicalDamage: 1}),
            armor: craft(2, 'cap', {armor: 1}),
            bodyArmor: craft(2, 'cap', {armor: 1}, {}, {itemLabel: 'Iron Mail', attr: 'str'}),
            shield: craft(2, 'cap', {armor: 1, blockChance: 1}),
            accessory: accessory('focused', {str: 2}, 1),
            belt: craft(2, 'balanced', {armor: 1}, {}, {attr: 'str'}),
        },
        decoration: {weapon: {physicalDamage: 2}, greatsword: {physicalDamage: 2, str: 1}, axe: {physicalDamage: 2, str: 1}, armor: {armor: 3}, belt: {str: 1}},
    },
    {
        key: 'tannedLeather', name: 'Tanned Leather', prefix: 'Leather', power: 2,
        description: 'Supple armor for quick fighters, with room for plenty of trim.',
        base: {
            armor: craft(2, 'decor', {evasion: 1}),
            gloves: craft(2, 'decor', {evasion: 1}, {accuracy: 1}, {attr: 'dex'}),
            bodyArmor: craft(2, 'decor', {evasion: 1}, {}, {itemLabel: 'Leather Armor'}),
            belt: accessory('focused', {maxHealth: 15}, 2),
        },
        decoration: {armor: {evasion: 3}, gloves: {dex: 2}, accessory: {evasion: 3}},
    },
    {
        key: 'wolfFang', name: 'Wolf Fang', prefix: 'Fang', power: 2,
        description: 'A predator\'s tooth. Quickens the hand that wears it.',
        base: {
            dagger: craft(2, 'balanced', {physicalDamage: 1}, {attackSpeed: 0.5, dex: 0.5}),
            accessory: accessory('focused', {physicalDamage: [3, 6]}, 2),
            ring: accessory('focused', {attackSpeed: 0.06}, 2, 'Fang Ring'),
        },
        decoration: {weapon: {physicalDamage: 3}, axe: {physicalDamage: 2, dex: 1}, accessory: {attackSpeed: 0.03}},
        equip: {itemType: 'dagger', name: 'Wolf Fang', stats: {physicalDamage: 5}},
    },
    {
        key: 'thornvine', name: 'Thornvine', prefix: 'Thorned', power: 2,
        description: 'A barbed vine that drinks a little from every scratch it makes.',
        base: {
            weapon: craft(2, 'secondary', {physicalDamage: 1}, {lifeOnHit: 1}),
            gloves: craft(2, 'balanced', {evasion: 1}, {lifeOnHit: 1}),
        },
        decoration: {weapon: {lifeOnHit: 0.5, physicalDamage: 1}, gloves: {lifeOnHit: 0.5}},
    },
    {
        key: 'whetstone', name: 'Whetstone', prefix: 'Honed', power: 2,
        description: 'Bandits carry these to keep a keen edge and a steady aim.',
        base: {
            sword: craft(2, 'balanced', {physicalDamage: 1}, {accuracy: 1}),
            gloves: craft(2, 'secondary', {armor: 1}, {accuracy: 0.6, str: 0.4}),
            helmet: craft(2, 'balanced', {armor: 1}, {accuracy: 1}),
        },
        decoration: {weapon: {increasedPhysicalDamage: 0.06, accuracy: 3}, gloves: {accuracy: 6}, helmet: {accuracy: 6}},
    },
    {
        key: 'trollBlood', name: 'Troll Blood', prefix: 'Trollblood', power: 2,
        description: 'Thick, green and still trying to heal whatever it touches.',
        base: {
            armor: craft(2, 'secondary', {armor: 1}, {lifeRegen: 0.6, maxHealth: 0.4}),
            belt: accessory('paired', {str: 2, lifeRegen: 1.5}, 2),
        },
        decoration: {weapon: {healthAsFire: defenseAsDamage('healthAsFire', 2)}, armor: {lifeRegen: 1.5}, accessory: {lifeRegen: 1.5}},
    },
    // ---- Power 3: Quest 1 rares ----
    {
        key: 'silverOre', name: 'Silver Ore', prefix: 'Silver', power: 3,
        description: 'A bright, dense metal that wards off frost.',
        base: {
            weapon: craft(3, 'value', {physicalDamage: 1}),
            sword: craft(3, 'balanced', {physicalDamage: 1}, {str: 0.5, dex: 0.5, int: 0.5}, {itemLabel: 'Silver Blade'}),
            armor: craft(3, 'balanced', {armor: 1}, {coldResist: 1}),
            bodyArmor: craft(3, 'balanced', {armor: 1}, {coldResist: 1}, {itemLabel: 'Silver Mail', attr: 'str'}),
            accessory: accessory('paired', {maxHealth: 12, increasedDamage: 0.06}, 3),
        },
        decoration: {weapon: {physicalDamage: 2, coldDamage: 1}, sword: {str: 1, dex: 1, int: 1}, armor: {coldResist: 0.06}, accessory: {coldResist: 0.06}},
    },
    {
        key: 'moonstone', name: 'Moonstone', prefix: 'Moonstone', power: 3,
        description: 'A cold, glowing gem. Sharpens the mind and shields it.',
        base: {
            staff: craft(3, 'balanced', {coldDamage: 1}, {int: 1}),
            wand: craft(3, 'balanced', {coldDamage: 1}, {int: 1}),
            armor: craft(3, 'balanced', {ward: 1, hpLostAsWard: 1}, {int: 1}),
            accessory: accessory('paired', {int: 4, critChance: 0.04}, 3),
            amulet: accessory('paired', {int: 4, ward: amuletWard(3)}, 3),
        },
        decoration: {weapon: {coldDamage: 2, physicalToCold: 0.2}, staff: {int: 2, physicalToCold: 0.2}, wand: {int: 2, physicalToCold: 0.2}, dagger: {int: 1, coldDamage: 1}, armor: {ward: 1, hpLostAsWard: 0.02}, accessory: {ward: 2, increasedMaxHealth: 0.03}},
    },
    {
        key: 'bloodstone', name: 'Bloodstone', prefix: 'Bloodstone', power: 3,
        description: 'A dark red gem that pulls life back from every wound you deal.',
        base: {
            weapon: craft(3, 'secondary', {physicalDamage: 1}, {lifeOnHit: 1}),
            gloves: craft(3, 'secondary', {evasion: 1}, {accuracy: 0.4, lifeRegenPercent: 0.6}),
            ring: accessory('focused', {lifeRegenPercent: 0.012}, 3),
        },
        decoration: {weapon: {lifeRegenPercent: 0.004}, gloves: {lifeRegenPercent: 0.004}, accessory: {maxHealth: 8}},
    },
    {
        key: 'amber', name: 'Amber', prefix: 'Amber', power: 3,
        description: 'Golden resin with a wasp trapped inside. Steadies the eye.',
        base: {
            bow: craft(3, 'balanced', {physicalDamage: 1}, {dex: 0.5, accuracy: 0.5}),
            dagger: craft(3, 'balanced', {physicalDamage: 1}, {dex: 0.5, int: 0.5}, {itemLabel: 'Amber Kris'}),
            helmet: craft(3, 'balanced', {evasion: 1}, {accuracy: 1}),
            accessory: accessory('paired', {dex: 4, accuracy: 6}, 3),
        },
        decoration: {weapon: {accuracy: 8}, armor: {dex: 1, accuracy: 4}, accessory: {dex: 1, accuracy: 4}},
    },
    // ---- Power 4: Quest 2 uncommons ----
    {
        key: 'steelIngot', name: 'Steel Ingot', prefix: 'Steel', power: 4,
        description: 'Refined iron. Takes a finer edge and a thicker plate than anything before it.',
        base: {
            weapon: craft(4, 'value', {physicalDamage: 1}),
            armor: craft(4, 'value', {armor: 1}),
            bodyArmor: craft(4, 'value', {armor: 1}, {}, {itemLabel: 'Steel Plate', attr: 'str'}),
            shield: craft(4, 'value', {armor: 1, blockChance: 1}),
        },
        decoration: {weapon: {physicalDamage: 4}, greatsword: {physicalDamage: 3, str: 2}, armor: {armor: 5}, gloves: {increasedPhysicalDamage: 0.05}},
    },
    {
        key: 'trollHide', name: 'Troll Hide', prefix: 'Trollhide', power: 4,
        description: 'Thick, stubborn hide. Light enough to dodge in and tough enough to soak hits.',
        base: {
            armor: craft(4, 'balanced', {evasion: 1}, {maxHealth: 1}),
            bodyArmor: craft(4, 'balanced', {evasion: 1}, {maxHealth: 1}, {itemLabel: 'Trollhide Coat'}),
            belt: accessory('focused', {maxHealth: 30}, 3),
        },
        decoration: {armor: {maxHealth: 12}, belt: {lifeRegen: 3}, accessory: {increasedMaxHealth: 0.05}},
    },
    {
        key: 'garnet', name: 'Garnet', prefix: 'Garnet', power: 4,
        description: 'A fiery gem with a different gift in every slot.',
        base: {
            weapon: craft(4, 'value', {fireDamage: 1}),
            armor: craft(4, 'secondary', {armor: 1}, {fireResist: 0.625}),
            accessory: accessory('focused', {str: 5}, 3),
        },
        decoration: {weapon: {fireDamage: 4}, armor: {fireResist: 0.08}, accessory: {str: 1, fireResist: 0.04}, amulet: {increasedElementalDamage: 0.1}},
    },
    {
        key: 'spiderSilk', name: 'Spider Silk', prefix: 'Silken', power: 4,
        description: 'Fine, strong thread from the mine\'s spiders. Makes the best bowstrings.',
        base: {
            bow: craft(4, 'capMixed', {physicalDamage: 1}, {dex: 1}),
            dagger: craft(4, 'capMixed', {physicalDamage: 1}, {dex: 0.5, int: 0.5}, {itemLabel: 'Silken Stiletto'}),
            gloves: craft(4, 'balanced', {evasion: 1}, {accuracy: 1}, {attr: 'dex'}),
            armor: craft(4, 'capMixed', {evasion: 1}, {dex: 1}),
            bodyArmor: craft(4, 'capMixed', {evasion: 1}, {dex: 1}, {itemLabel: 'Silk Robe'}),
        },
        decoration: {weapon: {accuracy: 10}, armor: {evasion: 5}, accessory: {dex: 3}},
    },
    {
        key: 'ancientBone', name: 'Ancient Bone', prefix: 'Bonewrought', power: 4,
        description: 'Bones of old miners, hard as stone and too stubborn to stay down.',
        base: {
            weapon: craft(4, 'cap', {physicalDamage: 1}),
            axe: craft(4, 'capMixed', {physicalDamage: 1}, {str: 1}),
            greatsword: craft(4, 'capMixed', {physicalDamage: 1}, {str: 1}),
            staff: craft(4, 'capMixed', {physicalDamage: 1}, {str: 0.5, int: 0.5}),
            helmet: craft(4, 'balanced', {armor: 1}, {lifeRegen: 1}),
            boots: craft(4, 'balanced', {armor: 1}, {lifeRegen: 1}),
        },
        decoration: {weapon: {str: 2, lifeOnHit: 0.5}, helmet: {lifeRegen: 3}, boots: {lifeRegen: 3}, accessory: {str: 2, lifeRegen: 3}},
    },
    {
        key: 'ritualAsh', name: 'Ritual Ash', prefix: 'Ashen', power: 4,
        description: 'Ash from kobold fire rites, still warm. Feeds a caster\'s mind and wards it.',
        base: {
            staff: craft(4, 'capMixed', {fireDamage: 1}, {int: 0.5, str: 0.5}),
            wand: craft(4, 'capMixed', {fireDamage: 1}, {int: 1}),
            helmet: craft(4, 'secondary', {ward: 1, hpLostAsWard: 1}, {fireResist: 0.4}, {attr: 'int'}),
            armor: craft(4, 'value', {ward: 1}),
            amulet: accessory('paired', {int: 4, increasedElementalDamage: 0.08}, 3),
        },
        decoration: {weapon: {fireDamage: 2, int: 2}, helmet: {int: 3, hpLostAsWard: 0.03}, accessory: {int: 4}},
    },
    // ---- Power 5: Quest 2 rare ----
    {
        key: 'mithril', name: 'Mithril', prefix: 'Mithril', power: 5,
        description: 'Light as leather and harder than steel. Takes fine work well.',
        base: {
            weapon: craft(5, 'decor', {physicalDamage: 1}, {attackSpeed: 1}),
            armor: craft(5, 'decor', {armor: 0.6, evasion: 0.6}),
            bodyArmor: craft(5, 'decor', {armor: 0.6, evasion: 0.6}, {}, {itemLabel: 'Mithril Mail'}),
            accessory: accessory('paired', {maxHealth: 25, physicalDamage: [6, 12]}, 4),
        },
        decoration: {weapon: {physicalDamage: 6}, armor: {armor: 4}, accessory: {increasedPhysicalDamage: 0.08}},
    },
    {
        key: 'broodfang', name: 'Broodfang', prefix: 'Broodfang', power: 5,
        description: 'A fang from the Broodmother herself. It drinks deep.',
        base: {
            dagger: craft(5, 'secondary', {physicalDamage: 1}, {critChance: 0.5, lifeOnHit: 0.5}),
            weapon: craft(5, 'balanced', {physicalDamage: 1}, {lifeOnHit: 1}),
            gloves: craft(5, 'secondary', {armor: 1}, {lifeRegenPercent: 0.5, lifeOnHit: 0.5}),
        },
        decoration: {weapon: {lifeOnHit: 1}, gloves: {lifeOnHit: 1}, accessory: {maxHealth: 15}},
    },
    // ---- Tier 3 area commons: one per area, alongside the shared Hollow Mines uncommons. ----
    {
        key: 'brimstone', name: 'Brimstone', prefix: 'Brimstone', power: 4,
        description: 'Yellow stone that smoulders on the Ashen slopes. Hot to work, hotter to be hit with.',
        base: {
            weapon: craft(4, 'balanced', {fireDamage: 1}, {increasedElementalDamage: 1}),
            armor: craft(4, 'balanced', {armor: 1}, {fireResist: 0.5, maxHealth: 0.5}),
        },
        decoration: {weapon: {fireDamage: 3, physicalToFire: 0.15, igniteChance: 0.05}, armor: {fireResist: 0.06}},
    },
    {
        key: 'marshReed', name: 'Marsh Reed', prefix: 'Reedwoven', power: 4,
        description: 'Tough reeds from the Sunken Marsh. Woven tight, they keep the cold out.',
        base: {
            bow: craft(4, 'secondary', {physicalDamage: 1}, {coldResist: 0.5, accuracy: 0.5}),
            smallArmor: craft(4, 'secondary', {evasion: 1}, {coldResist: 1}),
        },
        decoration: {weapon: {accuracy: 5, chillChance: 0.04}, armor: {coldResist: 0.04, evasion: 4}, accessory: {evasionAsCold: defenseAsDamage('evasionAsCold', 4)}},
    },
    {
        key: 'thunderhorn', name: 'Thunder Crab Claw', prefix: 'Crabclaw', power: 4,
        description: 'A claw from the thunder crabs of Stormwrack Coast. Struck, it rings like a bell.',
        base: {
            axe: craft(4, 'balanced', {physicalDamage: 1}, {critMultiplier: 1}),
            helmet: craft(4, 'secondary', {armor: 1}, {lightningResist: 1}),
        },
        decoration: {weapon: {lightningDamage: 3}, armor: {lightningResist: 0.06}},
    },
    // ---- Tier 3, shared: drop as uncommons and rares in every tier 3 area. ----
    {
        key: 'quicksilver', name: 'Quicksilver', prefix: 'Quicksilver', power: 5,
        description: 'Metal that will not sit still. Edges made with it find the gaps.',
        base: {
            weapon: craft(5, 'secondary', {physicalDamage: 1}, {critChance: 1}),
            gloves: craft(5, 'secondary', {evasion: 1}, {critChance: 0.5, attackSpeed: 0.5}),
            accessory: accessory('paired', {critChance: 0.05, attackSpeed: 0.05}, 3),
            amulet: accessory('paired', {attackSpeed: 0.05, dex: 4}, 3),
        },
        decoration: {weapon: {critChance: 0.03}, accessory: {critMultiplier: 0.12}},
    },
    {
        key: 'runedSlate', name: 'Runed Slate', prefix: 'Runed', power: 5,
        description: 'Slate cut with old warding signs. It catches harm before it lands.',
        base: {
            armor: craft(5, 'cap', {ward: 1}),
            bodyArmor: craft(5, 'cap', {ward: 1}, {}, {itemLabel: 'Runed Robe'}),
            shield: craft(5, 'balanced', {blockChance: 1, ward: 1}, {}, {attr: 'int'}),
            staff: craft(5, 'secondary', {physicalDamage: 1}, {int: 1}),
        },
        decoration: {weapon: {wardAsLightning: defenseAsDamage('wardAsLightning', 5)}, armor: {ward: 2, int: 2}, shield: {wardOnBlock: 5}, accessory: {ward: 2, int: 4}},
    },
    {
        key: 'wyvernLeather', name: 'Wyvern Leather', prefix: 'Wyvernhide', power: 5,
        description: 'Supple hide from the wyverns that roam all three wilds. Light and tough.',
        base: {
            smallArmor: craft(5, 'value', {evasion: 1}),
            bodyArmor: craft(5, 'value', {evasion: 1}, {}, {itemLabel: 'Wyvernhide Jerkin'}),
            belt: accessory('paired', {maxHealth: 30, dex: 4}, 3),
        },
        decoration: {armor: {evasion: 4}, belt: {maxHealth: 8, fireResist: 0.04}},
    },
    {
        key: 'skyshard', name: 'Skyshard', prefix: 'Skyshard', power: 6,
        description: 'A fallen star, still warm. Every tier 3 wild has a few.',
        base: {
            weapon: craft(6, 'decor', {physicalDamage: 1}, {increasedDamage: 1}),
            armor: craft(6, 'decor', {armor: 0.5, ward: 0.5}),
            accessory: accessory('decor', {increasedDamage: 0.08}, 5),
        },
        decoration: {weapon: {increasedDamage: 0.08}, armor: {increasedMaxHealth: 0.06}, accessory: {increasedDamage: 0.06}},
    },
    // ---- Sunken Marsh: accuracy, life leech and lightning resistance, for answering Stormwrack Coast. ----
    {
        key: 'bogIron', name: 'Bog Iron', prefix: 'Bog Iron', power: 5,
        description: 'Iron pulled from the peat. Pitted, heavy, and it never misses its mark.',
        base: {
            weapon: craft(5, 'balanced', {physicalDamage: 1}, {accuracy: 1}),
            gloves: craft(5, 'balanced', {armor: 1}, {accuracy: 1}),
        },
        decoration: {weapon: {accuracy: 15}, gloves: {accuracy: 10}, accessory: {accuracy: 8}},
    },
    {
        key: 'leechSac', name: 'Leech Sac', prefix: 'Leechling', power: 5,
        description: 'A swollen leech, still hungry. Whatever it is bound to drinks.',
        base: {
            weapon: craft(5, 'capMixed', {physicalDamage: 1}, {lifeOnHit: 1}),
            accessory: accessory('paired', {lifeRegenPercent: 0.012, maxHealth: 18}, 3),
        },
        decoration: {weapon: {lifeRegenPercent: 0.005}, accessory: {lifeRegenPercent: 0.005}},
    },
    {
        key: 'eelskin', name: 'Eelskin', prefix: 'Eelskin', power: 5,
        description: 'Slick hide from the marsh eels, which shrug off lightning.',
        base: {
            smallArmor: craft(5, 'balanced', {evasion: 1}, {lightningResist: 1}),
            bodyArmor: craft(5, 'secondary', {evasion: 1}, {lightningResist: 1}, {itemLabel: 'Eelskin Coat'}),
            accessory: accessory('paired', {lightningResist: 0.15, dex: 4}, 3),
        },
        decoration: {armor: {lightningResist: 0.06, evasion: 4}, accessory: {lightningResist: 0.06}},
    },
    {
        key: 'peatmoss', name: 'Peat Moss', prefix: 'Mossbound', power: 5,
        description: 'Cold, damp and alive. Wounds packed with it close by themselves.',
        base: {
            armor: craft(5, 'secondary', {ward: 1}, {lifeRegen: 0.5, coldResist: 0.5}),
            belt: accessory('paired', {lifeRegen: 6, coldResist: 0.12}, 3),
            accessory: accessory('paired', {coldResist: 0.15, lifeRegen: 8}, 3),
        },
        decoration: {armor: {coldResist: 0.05, maxHealth: 4}, belt: {lifeRegen: 4}, accessory: {coldResist: 0.05}},
    },
    {
        key: 'hagstone', name: 'Hagstone', prefix: 'Hagstone', power: 6,
        description: 'A stone with a hole worn through it. Look through it and nothing hides.',
        base: {
            bow: craft(6, 'capMixed', {physicalDamage: 1}, {accuracy: 1}),
            helmet: craft(6, 'capMixed', {evasion: 1}, {accuracy: 1}),
            accessory: accessory('paired', {accuracy: 30, critChance: 0.06}, 4),
            amulet: accessory('focused', {accuracy: 45}, 4),
        },
        decoration: {weapon: {accuracy: 20}, accessory: {accuracy: 12}},
    },
    {
        key: 'drownedSteel', name: 'Drowned Steel', prefix: 'Drowned', power: 6,
        description: 'Armor from knights the marsh took long ago. Cold to the touch, and it bleeds the living.',
        base: {
            weapon: craft(6, 'balanced', {physicalDamage: 1}, {lifeOnHit: 2}),
            armor: craft(6, 'capMixed', {armor: 1}, {coldResist: 0.5, lightningResist: 0.5}),
            bodyArmor: craft(6, 'capMixed', {armor: 1}, {coldResist: 0.5, lightningResist: 0.5}, {itemLabel: 'Drowned Plate', attr: 'str'}),
        },
        decoration: {weapon: {lifeOnHit: 1, coldDamage: 6, chillChance: 0.05}, armor: {lightningResist: 0.08, coldResist: 0.08}},
    },
    // ---- Stormwrack Coast: evasion, block, attack speed and fire resistance, for answering Ashen Peaks. ----
    {
        key: 'galeFeather', name: 'Gale Feather', prefix: 'Galewing', power: 5,
        description: 'A pinion from the storm harpies. Arrows fletched with it fly before you loose them.',
        base: {
            bow: craft(5, 'balanced', {physicalDamage: 1}, {attackSpeed: 1}),
            dagger: craft(5, 'balanced', {physicalDamage: 1}, {attackSpeed: 1}),
            boots: craft(5, 'balanced', {evasion: 1}, {attackSpeed: 1}, {attr: 'dex'}),
        },
        decoration: {weapon: {attackSpeed: 0.05}, boots: {evasion: 4, wardOnDodge: 5}, accessory: {attackSpeed: 0.05}},
    },
    {
        key: 'stormhide', name: 'Stormhide', prefix: 'Stormhide', power: 5,
        description: 'Shell from the thunder crabs. Scorched a hundred times and never burnt through.',
        base: {
            armor: craft(5, 'balanced', {evasion: 1}, {fireResist: 1}),
            bodyArmor: craft(5, 'balanced', {evasion: 1}, {fireResist: 1}, {itemLabel: 'Stormhide Vest'}),
            accessory: accessory('paired', {fireResist: 0.15, dex: 4}, 3),
        },
        decoration: {armor: {fireResist: 0.06, lightningResist: 0.05}, accessory: {fireResist: 0.03, lightningResist: 0.03}},
    },
    {
        key: 'cragGranite', name: 'Wrackstone', prefix: 'Wrack', power: 5,
        description: 'Cliff stone worn smooth by a thousand storms. Heavy, and it turns every blow aside.',
        base: {
            shield: craft(5, 'value', {armor: 1, blockChance: 1}),
            helmet: craft(5, 'value', {armor: 1}),
        },
        decoration: {shield: {blockChance: 0.04, wardOnBlock: 5}, armor: {armor: 3, lightningResist: 0.03}, accessory: {blockChance: 0.02}},
    },
    {
        key: 'ozoneShard', name: 'Ozone Shard', prefix: 'Ozone', power: 5,
        description: 'Crystal grown where lightning strikes twice. It hums in the hand.',
        base: {
            weapon: craft(5, 'value', {lightningDamage: 1}),
            wand: craft(5, 'balanced', {lightningDamage: 1}, {int: 1}),
            accessory: accessory('paired', {lightningDamage: [5, 10], attackSpeed: 0.04}, 3),
        },
        decoration: {weapon: {lightningDamage: 5, physicalToLightning: 0.25, shockChance: 0.06}, armor: {lightningResist: 0.05, ward: 2}},
    },
    {
        key: 'rocPlume', name: 'Roc Plume', prefix: 'Rocplume', power: 6,
        description: 'A plume from the great birds of the storm cliffs. Wear it and you are never quite where they strike.',
        base: {
            smallArmor: craft(6, 'capMixed', {evasion: 1}, {attackSpeed: 1}),
            bodyArmor: craft(6, 'capMixed', {evasion: 1}, {attackSpeed: 1}, {itemLabel: 'Rocplume Cloak'}),
            accessory: accessory('paired', {attackSpeed: 0.05, dex: 6}, 4),
            belt: craft(6, 'balanced', {evasion: 1}, {attackSpeed: 0.5}),
        },
        decoration: {armor: {evasion: 5, wardOnDodge: 10}, accessory: {increasedEvasion: 0.1, wardOnDodgePercent: 0.03}},
    },
    {
        key: 'thunderstone', name: 'Thunderstone', prefix: 'Thunder', power: 6,
        description: 'A stone that crackles when struck. Shields made with it strike back.',
        base: {
            shield: craft(6, 'capMixed', {blockChance: 1}, {lightningResist: 0.5, fireResist: 0.5}),
            staff: craft(6, 'balanced', {lightningDamage: 1}, {increasedElementalDamage: 1}),
        },
        decoration: {shield: {blockChance: 0.04, wardOnBlockPercent: 0.04}, weapon: {lightningDamage: 7, increasedElementalDamage: 0.08, shockChance: 0.05}, armor: {lightningResist: 0.12}},
    },
    // ---- Mythics: only from rarity upgrades. A step above their tier, with effects normal crafting
    // can't reach yet, so they stay worth farming instead of being outgrown. ----
    {
        key: 'thornheart', name: 'Thornheart', prefix: 'Thornheart', power: 4,
        description: 'A knot of living bramble that turns blows aside. Worn as a charm, it blocks like a shield.',
        base: {
            shield: craft(4, 'capMixed', {armor: 0.5, blockChance: 1.4}, {maxHealth: 1}, {boost: MYTHIC}),
        },
        decoration: {shield: {blockChance: 0.03}, armor: {blockChance: 0.02}, accessory: {blockChance: 0.03}},
        equip: {itemType: 'amulet', name: 'Thornheart Charm', stats: {blockChance: 0.15, maxHealth: 8}},
    },
    {
        key: 'wolfkingPelt', name: 'Wolfking Pelt', prefix: 'Wolfking', power: 4,
        description: 'The pelt of the pack leader. Whoever wears it moves like a wolf.',
        base: {
            bodyArmor: craft(4, 'balanced', {evasion: 1}, {attackSpeed: 1}, {boost: MYTHIC, itemLabel: 'Wolfking Mantle'}),
            boots: craft(4, 'balanced', {evasion: 1}, {attackSpeed: 1}, {boost: MYTHIC, attr: 'dex'}),
        },
        decoration: {boots: {attackSpeed: 0.04}, armor: {evasion: 4, maxHealth: 5}},
        equip: {itemType: 'bodyArmor', name: 'Wolfking Mantle', stats: {evasion: 8, attackSpeed: 0.08, accuracy: 6}},
    },
    {
        key: 'deepfireCore', name: 'Deepfire Core', prefix: 'Deepfire', power: 6,
        description: 'A coal that never cools, from the bottom of the mines.',
        base: {
            accessory: accessory('paired', {fireDamage: [8, 16], fireResist: 0.15}, 3),
        },
        decoration: {weapon: {increasedElementalDamage: 0.15, physicalToFire: 0.3}, armor: {fireResist: 0.12}},
        equip: {itemType: 'ring', name: 'Deepfire Ring', stats: {fireDamage: 8, fireResist: 0.15}},
    },
    {
        key: 'golemHeart', name: 'Golem Heart', prefix: 'Golemheart', power: 6,
        description: 'The stone heart of an ore golem, still slowly beating.',
        base: {
            belt: withStats(craft(6, 'balanced', {armor: 1}, {}, {attr: 'str'}), {increasedMaxHealth: 0.1}),
        },
        decoration: {armor: {increasedArmor: 0.1}, belt: {increasedMaxHealth: 0.06}},
        equip: {itemType: 'belt', name: 'Golem Heart Girdle', stats: {armor: 12, increasedMaxHealth: 0.1}},
    },
    // ---- Ashen Peaks: fire resistance, armor and cold damage, for answering fire and armored foes. ----
    {
        key: 'obsidian', name: 'Obsidian', prefix: 'Obsidian', power: 5,
        description: 'Volcanic glass. Brittle alone, brutal when bound into a blade or plate.',
        base: {
            weapon: craft(5, 'cap', {physicalDamage: 1}),
            armor: craft(5, 'cap', {armor: 1}),
            bodyArmor: craft(5, 'cap', {armor: 1}, {}, {itemLabel: 'Obsidian Plate'}),
            shield: craft(5, 'cap', {armor: 1, blockChance: 1}),
        },
        decoration: {weapon: {physicalDamage: 3, critMultiplier: 0.1}, armor: {armor: 3, fireResist: 0.04}, shield: {blockChance: 0.03}},
    },
    {
        key: 'salamanderScale', name: 'Salamander Scale', prefix: 'Salamander', power: 5,
        description: 'Scales that shrug off flame. The surest answer to the peaks.',
        base: {
            armor: craft(5, 'secondary', {armor: 1}, {fireResist: 1}),
            bodyArmor: craft(5, 'secondary', {armor: 1}, {fireResist: 1}, {itemLabel: 'Salamander Hauberk'}),
            accessory: accessory('paired', {fireResist: 0.15, maxHealth: 18}, 3),
        },
        decoration: {armor: {fireResist: 0.06, lifeRegen: 4}, accessory: {fireResist: 0.06}},
    },
    {
        key: 'rimecoal', name: 'Rimecoal', prefix: 'Rimecoal', power: 5,
        description: 'Coal that burns cold. The fire creatures of the peaks hate it.',
        base: {
            weapon: craft(5, 'value', {coldDamage: 1}),
            staff: craft(5, 'balanced', {coldDamage: 1}, {int: 1}),
            wand: craft(5, 'balanced', {coldDamage: 1}, {int: 1}),
            armor: craft(5, 'capMixed', {ward: 1, hpLostAsWard: 1}, {coldResist: 1}),
            accessory: accessory('paired', {coldDamage: [5, 10], int: 4}, 3),
        },
        decoration: {weapon: {coldDamage: 5, physicalToCold: 0.25, chillChance: 0.06}, armor: {coldResist: 0.06, lifeRegen: 4}},
    },
    {
        key: 'cinderwool', name: 'Cinderwool', prefix: 'Cinderwool', power: 5,
        description: 'Fleece from the mountain goats, singed but never burnt. Warm and forgiving.',
        base: {
            smallArmor: craft(5, 'balanced', {evasion: 1}, {lifeRegen: 1}),
            belt: accessory('paired', {maxHealth: 35, lifeRegen: 6}, 3),
        },
        decoration: {armor: {lifeRegen: 4}, accessory: {lifeRegen: 4, fireResist: 0.03}},
    },
    {
        key: 'wyrmScale', name: 'Wyrm Scale', prefix: 'Wyrmscale', power: 6,
        description: 'A scale from the Ashen Wyrm. Turns blades and flame alike.',
        base: {
            armor: craft(6, 'capMixed', {armor: 1}, {fireResist: 0.6, maxHealth: 0.4}),
            bodyArmor: craft(6, 'capMixed', {armor: 1}, {fireResist: 0.6, maxHealth: 0.4}, {itemLabel: 'Wyrmscale Armor'}),
            shield: craft(6, 'capMixed', {armor: 1, blockChance: 1}, {fireResist: 1}),
        },
        decoration: {armor: {armor: 5, fireResist: 0.05}, accessory: {increasedArmor: 0.1}},
    },
    {
        key: 'glacialHeart', name: 'Glacial Heart', prefix: 'Glacial', power: 6,
        description: 'Ice that survived the mountain\'s fire. Holds a deep, patient cold.',
        base: {
            weapon: craft(6, 'balanced', {coldDamage: 1}, {increasedElementalDamage: 1}),
            staff: craft(6, 'capMixed', {coldDamage: 1}, {increasedElementalDamage: 1}),
            wand: craft(6, 'capMixed', {coldDamage: 1}, {increasedElementalDamage: 0.5, int: 0.5}),
            armor: craft(6, 'cap', {ward: 1, hpLostAsWard: 1}),
            accessory: accessory('paired', {coldDamage: [7, 14], critChance: 0.1}, 4),
            amulet: accessory('paired', {coldDamage: [7, 14], coldResist: 0.1}, 4),
        },
        decoration: {weapon: {coldDamage: 6, physicalToCold: 0.3}, armor: {hpLostAsWard: 0.05}, amulet: {increasedElementalDamage: 0.12, hpLostAsWard: 0.06}, ring: {coldResist: 0.07}},
    },
    {
        key: 'phoenixFeather', name: 'Phoenix Feather', prefix: 'Phoenix', power: 7,
        description: 'A feather that rekindles itself. Whoever carries it keeps getting back up.',
        base: {
            accessory: accessory('paired', {lifeRegen: 24, fireResist: 0.15}, 3),
        },
        decoration: {weapon: {healthAsFire: defenseAsDamage('healthAsFire', 7)}, armor: {lifeRegen: 16}, accessory: {lifeRegen: 16}},
        equip: {itemType: 'amulet', name: 'Phoenix Charm', stats: {lifeRegen: 30, fireResist: 0.2}},
    },
    {
        key: 'blackPearl', name: 'Black Pearl', prefix: 'Black Pearl', power: 7,
        description: 'Grown in the marsh\'s deepest pool. It drinks the strength of whatever it touches.',
        base: {
            accessory: accessory('paired', {lifeRegenPercent: 0.018, lightningResist: 0.18}, 4),
        },
        decoration: {weapon: {lifeOnHit: 2}, accessory: {accuracy: 15}},
        equip: {itemType: 'ring', name: 'Black Pearl Ring', stats: {lifeLeech: 0.05, accuracy: 25, lightningResist: 0.2}},
    },
    {
        key: 'tempestQuill', name: 'Tempest Quill', prefix: 'Tempest', power: 7,
        description: 'A feather shed in the eye of a storm. Its bearer moves like the wind.',
        base: {
            accessory: accessory('paired', {attackSpeed: 0.09, dex: 7}, 4),
        },
        decoration: {weapon: {attackSpeed: 0.06}, accessory: {fireResist: 0.08}},
        equip: {itemType: 'amulet', name: 'Tempest Charm', stats: {attackSpeed: 0.1, evasion: 50, fireResist: 0.15, wardOnDodgePercent: 0.05}},
    },
    // ---- Tier 4, the Sundered Sanctum: all three elements at once, so every resistance matters. ----
    {
        key: 'riftGlass', name: 'Rift Glass', prefix: 'Riftglass', power: 6,
        description: 'Glass from where the three wilds\' storms meet. Fire, frost and lightning are all frozen in it.',
        base: {
            weapon: craft(6, 'balanced', {physicalDamage: 1}, {increasedElementalDamage: 0.5, critChance: 0.5}),
            wand: craft(6, 'value', {fireDamage: 0.34, coldDamage: 0.33, lightningDamage: 0.33}),
            armor: craft(6, 'balanced', {ward: 1}, {fireResist: 0.34, coldResist: 0.33, lightningResist: 0.33}),
        },
        decoration: {weapon: {fireDamage: 3, coldDamage: 3, lightningDamage: 3, igniteChance: 0.03, chillChance: 0.03, shockChance: 0.03}, armor: {fireResist: 0.04, coldResist: 0.04, lightningResist: 0.04}},
    },
    {
        key: 'riftsteel', name: 'Riftsteel', prefix: 'Riftsteel', power: 7,
        description: 'Steel forged in the rift\'s wild heat and sudden cold. Nothing else holds an edge so well.',
        base: {
            weapon: craft(7, 'balanced', {physicalDamage: 1}, {lifeOnHit: 2}),
            armor: craft(7, 'value', {armor: 1}),
            bodyArmor: craft(7, 'value', {armor: 1}, {}, {itemLabel: 'Riftsteel Plate'}),
            shield: craft(7, 'value', {armor: 1, blockChance: 1}),
        },
        decoration: {weapon: {physicalDamage: 9}, armor: {armor: 6}},
    },
    {
        key: 'prismShard', name: 'Prism Shard', prefix: 'Prismatic', power: 7,
        description: 'A crystal that splits any light, or any spell, into three.',
        base: {
            staff: craft(7, 'capMixed', {fireDamage: 0.34, coldDamage: 0.33, lightningDamage: 0.33}, {int: 1}),
            wand: craft(7, 'capMixed', {fireDamage: 0.34, coldDamage: 0.33, lightningDamage: 0.33}, {increasedElementalDamage: 1}),
            helmet: craft(7, 'secondary', {ward: 1}, {increasedElementalDamage: 0.5}, {attr: 'int'}),
            accessory: accessory('paired', {increasedElementalDamage: 0.14, int: 6}, 4),
        },
        decoration: {weapon: {increasedElementalDamage: 0.1, ailmentEffect: 0.15}, accessory: {int: 6, ailmentEffect: 0.1}},
    },
    {
        key: 'voidSilk', name: 'Void Silk', prefix: 'Voidsilk', power: 7,
        description: 'Thread spun by things that live between the storms. Blows pass through it like smoke.',
        base: {
            smallArmor: craft(7, 'value', {evasion: 1}),
            bodyArmor: craft(7, 'secondary', {evasion: 1}, {fireResist: 0.34, coldResist: 0.33, lightningResist: 0.33}, {itemLabel: 'Voidsilk Robe'}),
            belt: accessory('paired', {maxHealth: 45, dex: 6}, 4),
        },
        decoration: {armor: {evasion: 6, wardOnDodgePercent: 0.03}, accessory: {dex: 6}},
    },
    {
        key: 'wardenStone', name: 'Warden Stone', prefix: 'Warden', power: 7,
        description: 'A stone from the walls the rift wardens raised. It still turns aside whatever comes through.',
        base: {
            shield: craft(7, 'capMixed', {armor: 1, blockChance: 1}, {fireResist: 0.34, coldResist: 0.33, lightningResist: 0.33}),
            armor: craft(7, 'capMixed', {ward: 1}, {fireResist: 0.34, coldResist: 0.33, lightningResist: 0.33}),
            helmet: craft(7, 'balanced', {ward: 1}, {}, {attr: 'int'}),
        },
        decoration: {weapon: {wardAsLightning: defenseAsDamage('wardAsLightning', 7)}, armor: {ward: 2}, shield: {blockChance: 0.04, wardOnBlockPercent: 0.06}, accessory: {ward: 4.5}},
    },
    {
        key: 'riftEssence', name: 'Rift Essence', prefix: 'Riftborn', power: 8,
        description: 'The rift itself, bottled. It makes everything it touches a little more.',
        base: {
            weapon: craft(8, 'decor', {physicalDamage: 1}, {increasedDamage: 1}),
            armor: craft(8, 'decor', {armor: 0.5, ward: 0.5}),
            accessory: accessory('decor', {increasedDamage: 0.1}, 6),
        },
        decoration: {weapon: {increasedDamage: 0.095}, armor: {increasedMaxHealth: 0.075}, accessory: {increasedDamage: 0.075}},
    },
    {
        key: 'wardenPlate', name: 'Warden Plate', prefix: 'Wardenplate', power: 8,
        description: 'Plate from a fallen rift warden, made to stand in all three storms at once.',
        base: {
            armor: craft(8, 'capMixed', {armor: 1}, {fireResist: 0.34, coldResist: 0.33, lightningResist: 0.33}),
            bodyArmor: craft(8, 'capMixed', {armor: 1}, {fireResist: 0.34, coldResist: 0.33, lightningResist: 0.33}, {itemLabel: 'Warden Plate', attr: 'str'}),
            shield: craft(8, 'cap', {armor: 1, blockChance: 1}),
        },
        decoration: {armor: {fireResist: 0.06, coldResist: 0.06, lightningResist: 0.06}, shield: {wardOnBlock: 30, wardOnBlockPercent: 0.03}},
    },
    {
        key: 'prismaticEye', name: 'Prismatic Eye', prefix: 'Prismatic', power: 9,
        description: 'The eye of a rift warden, which saw all three storms at once. It still does.',
        base: {
            weapon: craft(9, 'secondary', {physicalDamage: 1}, {lifeOnHit: 1}),
            accessory: accessory('paired', {increasedElementalDamage: 0.18, critChance: 0.08}, 5),
        },
        decoration: {weapon: {increasedElementalDamage: 0.12}, accessory: {fireResist: 0.06, coldResist: 0.06, lightningResist: 0.06}},
        equip: {itemType: 'amulet', name: 'Prismatic Eye', stats: {increasedElementalDamage: 0.2, ailmentEffect: 0.25, fireResist: 0.15, coldResist: 0.15, lightningResist: 0.15}},
    },
    // ---- Tier 5, the Amber Hive: Corrosion. Swarms of quick strikers, so avoiding hits matters most. ----
    {
        key: 'hiveChitin', name: 'Hive Chitin', prefix: 'Chitin', power: 10,
        description: 'Plates shed by the hive\'s workers: light, hard and slick enough that stings glance off.',
        base: {
            armor: craft(10, 'balanced', {evasion: 0.5, armor: 0.5}, {maxHealth: 1}),
            shield: craft(10, 'value', {armor: 1, blockChance: 1}),
        },
        decoration: {armor: {evasion: 10, armor: 10}, shield: {blockChance: 0.06}},
    },
    {
        key: 'waspWing', name: 'Wasp Wing', prefix: 'Waspwing', power: 10,
        description: 'A wing as thin as breath. Whatever wears it moves before the swarm does.',
        base: {
            smallArmor: craft(10, 'value', {evasion: 1}),
            weapon: craft(10, 'secondary', {physicalDamage: 1}, {attackSpeed: 1}),
        },
        decoration: {weapon: {attackSpeed: 0.04, accuracy: 15}, armor: {evasion: 7, attackSpeed: 0.02}},
    },
    {
        key: 'hiveWax', name: 'Hive Wax', prefix: 'Waxen', power: 10,
        description: 'Wax the hive seals its cells with. Layered on a shield it catches stingers and holds them.',
        base: {
            shield: craft(10, 'secondary', {blockChance: 1}, {maxHealth: 1}),
            armor: craft(10, 'secondary', {evasion: 1}, {maxHealth: 1}),
        },
        decoration: {shield: {blockChance: 0.04}, accessory: {maxHealth: 20, lifeRegen: 20}},
    },
    {
        key: 'mantisScythe', name: 'Mantis Scythe', prefix: 'Mantis', power: 11,
        description: 'The forelimb of a thorn mantis. It strikes where the eye was a moment ago.',
        base: {
            weapon: craft(11, 'balanced', {physicalDamage: 1}, {critChance: 0.5, accuracy: 0.5}),
        },
        decoration: {weapon: {critChance: 0.04, accuracy: 30}},
    },
    {
        key: 'amberResin', name: 'Amber Resin', prefix: 'Amber', power: 11,
        description: 'Fresh amber from the hive walls, still soft. It sets hard around anything that strikes it.',
        base: {
            shield: craft(11, 'cap', {armor: 1, blockChance: 1}),
            armor: craft(11, 'capMixed', {evasion: 1}, {fireResist: 0.5, coldResist: 0.5}),
        },
        decoration: {shield: {blockChance: 0.05, wardOnBlockPercent: 0.04}, armor: {fireResist: 0.1, coldResist: 0.05}},
    },
    {
        key: 'stingerVenom', name: 'Stinger Venom', prefix: 'Venomous', power: 11,
        description: 'Venom milked from a brood guard. A drop on the tongue and the world slows down.',
        base: {
            accessory: accessory('paired', {attackSpeed: 0.12, accuracy: 60}, 5),
        },
        decoration: {weapon: {attackSpeed: 0.09}, accessory: {accuracy: 40}},
    },
    {
        key: 'royalJelly', name: 'Royal Jelly', prefix: 'Royal', power: 12,
        description: 'What the hive feeds its queens. It makes the body quick and hard to wound.',
        base: {
            accessory: accessory('paired', {maxHealth: 50, lifeRegenPercent: 0.01}, 5),
        },
        decoration: {armor: {evasion: 14, maxHealth: 20}, accessory: {maxHealth: 40}},
    },
    {
        key: 'queenCarapace', name: 'Queen\'s Carapace', prefix: 'Carapace', power: 12,
        description: 'A piece of the hive queen\'s shell. Acid that eats through steel beads up and rolls off it.',
        base: {
            shield: craft(12, 'capMixed', {blockChance: 1}, {fireResist: 0.5, maxHealth: 0.5}),
            bodyArmor: craft(12, 'value', {evasion: 1}, {}, {itemLabel: 'Carapace Mail'}),
        },
        decoration: {armor: {evasion: 14}, shield: {blockChance: 0.04, evasion: 8}},
    },
    {
        key: 'hiveheart', name: 'Hiveheart', prefix: 'Hiveheart', power: 13,
        description: 'The pulse at the center of the hive. Every swarm in it moves to this beat, and so does its bearer.',
        base: {
            accessory: accessory('paired', {blockChance: 0.08, increasedEvasion: 0.15}, 6),
        },
        decoration: {armor: {evasion: 16, blockChance: 0.03}, accessory: {evasion: 16}},
        equip: {itemType: 'ring', name: 'Hiveheart Signet', stats: {evasion: 150, blockChance: 0.08, attackSpeed: 0.08}},
    },
    // ---- Tier 5, Duskgrave Necropolis: Lifeless. Nothing heals, so a deep pool of life and ward wins. ----
    {
        key: 'graveIron', name: 'Grave Iron', prefix: 'Grave-iron', power: 10,
        description: 'Iron from the necropolis gates, cold to the touch for a thousand years.',
        base: {
            armor: craft(10, 'value', {armor: 1}),
            weapon: craft(10, 'balanced', {physicalDamage: 1}, {accuracy: 1}),
        },
        decoration: {armor: {armor: 7, coldResist: 0.04}, weapon: {physicalDamage: 15}},
    },
    {
        key: 'shroudCloth', name: 'Shroud Cloth', prefix: 'Shrouded', power: 10,
        description: 'Burial linen woven with old wards. The dead it wrapped never rose; the living it wraps rarely fall.',
        base: {
            armor: craft(10, 'balanced', {ward: 1}, {maxHealth: 1}),
            bodyArmor: craft(10, 'value', {ward: 1}, {}, {itemLabel: 'Shroud'}),
        },
        decoration: {armor: {ward: 3}, accessory: {ward: 6}},
    },
    {
        key: 'boneMarrow', name: 'Bone Marrow', prefix: 'Marrow', power: 10,
        description: 'Dark marrow from the necropolis ossuaries. Bitter, and it makes the body hard to kill.',
        base: {
            weapon: craft(10, 'secondary', {physicalDamage: 1}, {lifeOnHit: 1}),
            accessory: accessory('focused', {maxHealth: 90}, 5),
        },
        decoration: {weapon: {lifeOnHit: 7}, armor: {maxHealth: 18}, accessory: {maxHealth: 30}},
    },
    {
        key: 'wraithEssence', name: 'Wraith Essence', prefix: 'Wraith', power: 11,
        description: 'What a wraith leaves when it finally goes. It wraps whoever carries it in cold, unbroken light.',
        base: {
            armor: craft(11, 'cap', {ward: 1}),
            helmet: craft(11, 'balanced', {ward: 1}, {}, {attr: 'int'}),
            shield: craft(11, 'capMixed', {ward: 1}, {maxHealth: 0.5}, {attr: 'int'}),
        },
        decoration: {weapon: {wardAsLightning: defenseAsDamage('wardAsLightning', 11)}, armor: {ward: 2.5, coldResist: 0.04}, accessory: {ward: 6, coldResist: 0.03}},
    },
    {
        key: 'barrowSteel', name: 'Barrow Steel', prefix: 'Barrow', power: 11,
        description: 'Blades and plate from barrow kings, still sharp, still heavy, still waiting.',
        base: {
            weapon: craft(11, 'balanced', {physicalDamage: 1}, {increasedDamage: 0.5, lifeOnHit: 0.5}),
            bodyArmor: craft(11, 'capMixed', {armor: 1}, {maxHealth: 0.5, coldResist: 0.5}, {itemLabel: 'Barrow Plate', attr: 'str'}),
        },
        decoration: {weapon: {increasedDamage: 0.065, lifeOnHit: 5}, armor: {increasedMaxHealth: 0.09}},
    },
    {
        key: 'deathcap', name: 'Deathcap', prefix: 'Deathcap', power: 11,
        description: 'A pale mushroom that grows only on graves. Eaten in tiny amounts it hardens the flesh.',
        base: {
            accessory: accessory('paired', {increasedMaxHealth: 0.1, coldResist: 0.15}, 5),
        },
        decoration: {weapon: {evasionAsCold: defenseAsDamage('evasionAsCold', 11)}, armor: {coldResist: 0.12}, accessory: {increasedMaxHealth: 0.09}},
    },
    {
        key: 'soulGem', name: 'Soul Gem', prefix: 'Soulbound', power: 12,
        description: 'A gem with a soul asleep inside. It shields its bearer so it won\'t be woken.',
        base: {
            accessory: accessory('paired', {maxHealth: 70, int: 12}, 5),
            amulet: accessory('paired', {ward: amuletWard(12), maxHealth: 70}, 5),
            helmet: craft(12, 'capMixed', {ward: 1}, {maxHealth: 1}, {attr: 'int'}),
        },
        decoration: {weapon: {lifeOnHit: 12}, armor: {ward: 4}, accessory: {ward: 3, int: 3}},
    },
    {
        key: 'cryptPlate', name: 'Crypt Plate', prefix: 'Crypt', power: 12,
        description: 'Armor from the necropolis guardians, heavy enough to stand a thousand years of blows.',
        base: {
            armor: craft(12, 'capMixed', {armor: 1}, {maxHealth: 0.5, coldResist: 0.5}),
            shield: craft(12, 'value', {armor: 1, blockChance: 1}),
        },
        decoration: {armor: {armor: 14, maxHealth: 16}, shield: {blockChance: 0.05}},
    },
    {
        key: 'paleCrown', name: 'Pale Crown', prefix: 'Pale', power: 13,
        description: 'The Pale Lich\'s crown. It holds life in its wearer the way it held death in its maker.',
        base: {
            accessory: accessory('paired', {increasedMaxHealth: 0.15, int: 13}, 6),
            amulet: accessory('paired', {increasedMaxHealth: 0.15, ward: amuletWard(13)}, 6),
        },
        decoration: {weapon: {lifeOnHit: 16}, armor: {increasedMaxHealth: 0.08, coldResist: 0.08}, accessory: {ward: 9, increasedMaxHealth: 0.03}},
        equip: {itemType: 'amulet', name: 'Pale Crown Pendant', stats: {increasedMaxHealth: 0.15, ward: 120, coldResist: 0.2}},
    },
    // ---- Tier 5, the Ironbound Foundry: Reflection. Every blow comes back, so measured hits and tough hides win. ----
    {
        key: 'brassPlate', name: 'Brass Plate', prefix: 'Brass', power: 10,
        description: 'Polished brass from the foundry\'s automatons. It throws back light, and blows.',
        base: {
            armor: craft(10, 'balanced', {armor: 1}, {lifeRegen: 1}),
            shield: craft(10, 'balanced', {armor: 1, blockChance: 1}, {maxHealth: 1}),
        },
        decoration: {armor: {armor: 10}, shield: {blockChance: 0.02, armor: 8}},
    },
    {
        key: 'cogwheel', name: 'Cogwheel', prefix: 'Geared', power: 10,
        description: 'A toothed wheel from a broken construct. Set into a weapon, it keeps the arm turning.',
        base: {
            weapon: craft(10, 'decor', {physicalDamage: 1}, {attackSpeed: 1}),
            accessory: accessory('focused', {attackSpeed: 0.1}, 5),
        },
        decoration: {weapon: {attackSpeed: 0.075}, accessory: {attackSpeed: 0.06}},
    },
    {
        key: 'coolingOil', name: 'Cooling Oil', prefix: 'Oiled', power: 10,
        description: 'The oil that keeps the foundry\'s workers from seizing. On skin it closes wounds as they open.',
        base: {
            accessory: accessory('focused', {lifeRegen: 120}, 5),
        },
        decoration: {armor: {lifeRegen: 48}, accessory: {lifeRegen: 48}},
    },
    {
        key: 'temperedSteel', name: 'Tempered Steel', prefix: 'Tempered', power: 11,
        description: 'Steel quenched and reheated a hundred times. It bends under a blow and springs back.',
        base: {
            armor: craft(11, 'capMixed', {armor: 1}, {coldResist: 1}),
            weapon: craft(11, 'value', {physicalDamage: 1}),
        },
        decoration: {armor: {increasedArmor: 0.08}, weapon: {physicalDamage: 12}},
    },
    {
        key: 'mainspring', name: 'Mainspring', prefix: 'Wound', power: 11,
        description: 'The coiled heart of a clockwork knight. Wound tight, it keeps whatever holds it going.',
        base: {
            accessory: accessory('paired', {lifeRegen: 84, str: 10}, 5),
            belt: craft(11, 'balanced', {armor: 1}, {lifeRegen: 1}, {attr: 'str'}),
        },
        decoration: {armor: {lifeRegen: 48, armor: 5}, accessory: {armor: 12}},
    },
    {
        key: 'slagGlass', name: 'Slag Glass', prefix: 'Slag', power: 11,
        description: 'Glass skimmed off the foundry\'s slag. It shrugs off heat that melts iron.',
        base: {
            armor: craft(11, 'capMixed', {armor: 1}, {fireResist: 1}),
            helmet: craft(11, 'balanced', {armor: 1}, {fireResist: 0.5, lifeRegen: 0.5}),
        },
        decoration: {armor: {fireResist: 0.1, armor: 8}},
    },
    {
        key: 'titanAlloy', name: 'Titan Alloy', prefix: 'Titan', power: 12,
        description: 'The alloy the Forge Titan was cast from. Nothing in the foundry can dent it.',
        base: {
            armor: craft(12, 'value', {armor: 1}),
            bodyArmor: craft(12, 'capMixed', {armor: 1}, {lifeRegen: 0.5, maxHealth: 0.5}, {itemLabel: 'Titan Plate', attr: 'str'}),
        },
        decoration: {armor: {armor: 14}, shield: {blockChance: 0.03, armor: 10}},
    },
    {
        key: 'furnaceCore', name: 'Furnace Core', prefix: 'Furnace', power: 12,
        description: 'A coal that has burned since the foundry was lit. Its heat keeps the blood moving.',
        base: {
            accessory: accessory('paired', {lifeRegen: 96, maxHealth: 70}, 5),
        },
        decoration: {weapon: {healthAsFire: defenseAsDamage('healthAsFire', 12)}, armor: {lifeRegen: 64}, accessory: {lifeRegen: 62, fireResist: 0.04}},
    },
    {
        key: 'forgeheart', name: 'Forgeheart', prefix: 'Forgeheart', power: 13,
        description: 'The Forge Titan\'s heart, still glowing. Wounds close in its warmth faster than they open.',
        base: {
            accessory: accessory('paired', {lifeRegen: 108, increasedArmor: 0.2}, 6),
        },
        decoration: {armor: {lifeRegen: 80, increasedArmor: 0.05}, accessory: {lifeRegen: 80}},
        equip: {itemType: 'amulet', name: 'Forgeheart Locket', stats: {lifeRegen: 200, increasedArmor: 0.2, fireResist: 0.2}},
    },
    // ---- Tier 5, Skyspire Aerie: Karma. Every blow struck is judged, so the fewest, biggest blows win. ----
    {
        key: 'stormIron', name: 'Storm Iron', prefix: 'Stormforged', power: 10,
        description: 'Iron struck by lightning on the spire\'s peak. Blades of it fall like thunder.',
        base: {
            weapon: craft(10, 'balanced', {physicalDamage: 1}, {critMultiplier: 1}),
            armor: craft(10, 'balanced', {armor: 1}, {lightningResist: 1}),
        },
        decoration: {weapon: {physicalDamage: 7, physicalToLightning: 0.2}, armor: {lightningResist: 0.08, armor: 6}},
    },
    {
        key: 'skyFeather', name: 'Sky Feather', prefix: 'Skyfeather', power: 10,
        description: 'A feather from the spire\'s hunters. Arrows fletched with it find the heart.',
        base: {
            smallArmor: craft(10, 'balanced', {evasion: 1}, {critChance: 1}),
            boots: craft(10, 'balanced', {evasion: 1}, {critChance: 1}, {attr: 'dex'}),
            gloves: craft(10, 'balanced', {evasion: 1}, {critChance: 1}, {attr: 'dex'}),
        },
        decoration: {weapon: {critChance: 0.04}, armor: {evasion: 10}, accessory: {accuracy: 30}},
    },
    {
        key: 'galeSilk', name: 'Gale Silk', prefix: 'Galesilk', power: 10,
        description: 'Silk from the spire\'s spiders, who weave in the wind. Light enough to fly in.',
        base: {
            smallArmor: craft(10, 'capMixed', {evasion: 1}, {lightningResist: 1}),
            bodyArmor: craft(10, 'secondary', {evasion: 1}, {lightningResist: 1}, {itemLabel: 'Galesilk Robe'}),
        },
        decoration: {armor: {evasion: 6, lightningResist: 0.05}},
    },
    {
        key: 'eagleTalon', name: 'Eagle Talon', prefix: 'Taloned', power: 11,
        description: 'A talon from a thunder eagle. One strike, and the prey never knew.',
        base: {
            weapon: craft(11, 'balanced', {physicalDamage: 1}, {critChance: 1}),
        },
        decoration: {weapon: {critChance: 0.05, critMultiplier: 0.15}},
    },
    {
        key: 'thunderGlass', name: 'Thunder Glass', prefix: 'Thunderglass', power: 11,
        description: 'Sand fused by a lightning strike. It holds the instant of the strike forever.',
        base: {
            accessory: accessory('paired', {critMultiplier: 0.3, lightningResist: 0.15}, 5),
            amulet: accessory('paired', {lightningResist: 0.15, lightningDamage: [6, 18]}, 5),
            wand: craft(11, 'value', {lightningDamage: 1}),
        },
        decoration: {weapon: {critMultiplier: 0.2}, accessory: {critMultiplier: 0.08, lightningResist: 0.04}},
    },
    {
        key: 'windCrystal', name: 'Wind Crystal', prefix: 'Windborne', power: 11,
        description: 'A crystal that hums in still air. Blows struck beside it carry far more than their weight.',
        base: {
            accessory: accessory('focused', {increasedDamage: 0.18}, 5),
        },
        decoration: {weapon: {increasedDamage: 0.13}, accessory: {increasedDamage: 0.095}},
    },
    {
        key: 'sovereignPlume', name: 'Sovereign Plume', prefix: 'Sovereign', power: 12,
        description: 'A plume from the Sky Sovereign\'s crest. Its bearer sees the one blow that ends a fight.',
        base: {
            accessory: accessory('paired', {critChance: 0.1, critMultiplier: 0.35}, 5),
            amulet: accessory('paired', {accuracy: 80, increasedDamage: 0.12}, 5),
        },
        decoration: {weapon: {critChance: 0.06}, accessory: {critMultiplier: 0.15}},
    },
    {
        key: 'skyforged', name: 'Skyforged Steel', prefix: 'Skyforged', power: 12,
        description: 'Steel forged in the spire\'s storm-kilns. It carries the force of the fall.',
        base: {
            weapon: craft(12, 'balanced', {physicalDamage: 1}, {critMultiplier: 1}),
        },
        decoration: {weapon: {physicalDamage: 14, increasedPhysicalDamage: 0.06}},
    },
    {
        key: 'stormcrown', name: 'Stormcrown', prefix: 'Stormcrowned', power: 13,
        description: 'The Sky Sovereign\'s crown. Whoever wears it strikes once, and is believed.',
        base: {
            accessory: accessory('paired', {critMultiplier: 0.5, increasedDamage: 0.2}, 6),
        },
        decoration: {weapon: {critMultiplier: 0.3}, accessory: {increasedDamage: 0.115}},
        equip: {itemType: 'ring', name: 'Stormcrown Band', stats: {critMultiplier: 0.5, increasedDamage: 0.2, critChance: 0.2}},
    },
    // ---- The Oracle's Rite: the Veiled Oracle's drops, a step above tier 5's mythics. ----
    {
        key: 'oracleEye', name: 'Oracle\'s Eye', prefix: 'Oracle', power: 14,
        description: 'The Veiled Oracle\'s eye, which saw the keys before anyone found them. It shows where every blow will land.',
        base: {
            accessory: accessory('paired', {critChance: 0.12, accuracy: 160}, 6),
        },
        decoration: {weapon: {critChance: 0.06, accuracy: 50}, accessory: {accuracy: 60}},
        equip: {itemType: 'amulet', name: 'Oracle\'s Eye', stats: {critChance: 0.3, accuracy: 200, critMultiplier: 0.3}},
    },
    {
        key: 'veilSilk', name: 'Veil Silk', prefix: 'Veiled', power: 14,
        description: 'A strip of the Oracle\'s veil. Behind it, blows land on someone who was never quite there.',
        base: {
            armor: craft(14, 'capMixed', {evasion: 0.5, ward: 0.5}, {maxHealth: 1}, {boost: 1.15}),
            bodyArmor: craft(14, 'balanced', {evasion: 0.5, ward: 0.5}, {fireResist: 0.34, coldResist: 0.33, lightningResist: 0.33}, {boost: 1.15, itemLabel: 'Veil'}),
        },
        decoration: {armor: {evasion: 18, ward: 5.5}, accessory: {ward: 12}},
    },
    {
        key: 'sanctumShard', name: 'Sanctum Shard', prefix: 'Sanctified', power: 14,
        description: 'A shard of the Sanctum\'s altar, cracked when the portal first opened. It still holds the door\'s force.',
        base: {
            weapon: craft(14, 'balanced', {physicalDamage: 1}, {increasedDamage: 0.5, lifeOnHit: 0.5}, {boost: 1.15}),
            shield: craft(14, 'capMixed', {armor: 1, blockChance: 1}, {maxHealth: 1}, {boost: 1.15}),
        },
        decoration: {weapon: {physicalDamage: 18, increasedDamage: 0.08}, shield: {blockChance: 0.04, ward: 8}},
    },
    // ---- Tier 6, the Shattered Throne: past the portal. No single rule; every kind of monster at once. ----
    {
        key: 'throneStone', name: 'Throne Stone', prefix: 'Throne', power: 12,
        description: 'Stone from the broken throne room, heavy with something older than the stone.',
        base: {
            armor: craft(12, 'capMixed', {armor: 1}, {maxHealth: 1}),
            shield: craft(12, 'balanced', {armor: 1, blockChance: 1}, {maxHealth: 1}),
        },
        decoration: {armor: {armor: 12, ward: 5}},
    },
    {
        key: 'voidIron', name: 'Void Iron', prefix: 'Void', power: 12,
        description: 'Iron that fell through the portal from nowhere. It weighs nothing until it strikes.',
        base: {
            weapon: craft(12, 'balanced', {physicalDamage: 1}, {attackSpeed: 1}),
            twoHanded: craft(12, 'value', {physicalDamage: 1}),
        },
        decoration: {weapon: {physicalDamage: 14, attackSpeed: 0.04}},
    },
    {
        key: 'starSilk', name: 'Star Silk', prefix: 'Starwoven', power: 12,
        description: 'Thread spun from the cold light between the throne\'s pillars.',
        base: {
            smallArmor: craft(12, 'balanced', {evasion: 0.5, ward: 0.5}, {maxHealth: 1}),
            bodyArmor: craft(12, 'value', {ward: 1}, {}, {itemLabel: 'Starwoven Robe'}),
        },
        decoration: {armor: {evasion: 14, ward: 4}, accessory: {ward: 9}},
    },
    {
        key: 'shatterglass', name: 'Shatterglass', prefix: 'Shattered', power: 13,
        description: 'A piece of the sky that cracked when the throne fell. Every edge of it cuts.',
        base: {
            weapon: craft(13, 'balanced', {physicalDamage: 1}, {critChance: 0.5, critMultiplier: 0.5}),
            wand: craft(13, 'balanced', {fireDamage: 0.34, coldDamage: 0.33, lightningDamage: 0.33}, {critChance: 1}),
        },
        decoration: {weapon: {critChance: 0.06, accuracy: 20}},
    },
    {
        key: 'kingsSteel', name: 'King\'s Steel', prefix: 'Kingsteel', power: 13,
        description: 'Plate of the throne\'s last guard, who never left their post.',
        base: {
            armor: craft(13, 'capMixed', {armor: 1}, {fireResist: 0.34, coldResist: 0.33, lightningResist: 0.33}),
            bodyArmor: craft(13, 'capMixed', {armor: 0.5, evasion: 0.5}, {maxHealth: 1}, {itemLabel: 'Kingsguard Plate'}),
        },
        decoration: {armor: {fireResist: 0.13, coldResist: 0.13, lightningResist: 0.13}},
    },
    {
        key: 'emberOfAges', name: 'Ember of Ages', prefix: 'Ageless', power: 13,
        description: 'A coal from a fire that has burned since before the throne was built.',
        base: {
            accessory: accessory('paired', {increasedDamage: 0.18, lifeOnHit: 24}, 6),
        },
        decoration: {weapon: {increasedDamage: 0.155}, accessory: {lifeOnHit: 16}},
    },
    {
        key: 'crownShard', name: 'Crown Shard', prefix: 'Crowned', power: 14,
        description: 'A shard of the shattered crown. Whoever carries it is obeyed by their own body.',
        base: {
            accessory: accessory('paired', {increasedMaxHealth: 0.14, increasedDamage: 0.16}, 6),
            helmet: craft(14, 'balanced', {armor: 0.5, ward: 0.5}, {maxHealth: 1}, {attr: 'int'}),
        },
        decoration: {armor: {increasedMaxHealth: 0.11}, accessory: {increasedDamage: 0.13}},
    },
    {
        key: 'riftmetal', name: 'Riftmetal', prefix: 'Riftmetal', power: 14,
        description: 'Metal from the portal\'s rim, where the pocket rift meets the world. It is never quite one thing.',
        base: {
            weapon: craft(14, 'value', {physicalDamage: 1}),
            armor: craft(14, 'balanced', {armor: 0.5, evasion: 0.5}, {maxHealth: 1}),
        },
        decoration: {weapon: {physicalDamage: 20}, armor: {armor: 18, evasion: 18}},
    },
    {
        key: 'throneheart', name: 'Throneheart', prefix: 'Throneheart', power: 15,
        description: 'What the Shattered King kept in place of a heart. It beats for whoever holds it now.',
        base: {
            accessory: accessory('paired', {increasedDamage: 0.25, increasedMaxHealth: 0.2, lifeOnHit: 36}, 7),
        },
        decoration: {weapon: {increasedDamage: 0.12, lifeOnHit: 12}, armor: {increasedMaxHealth: 0.14}, accessory: {increasedDamage: 0.1, lifeOnHit: 10}},
        equip: {itemType: 'amulet', name: 'Throneheart', stats: {increasedDamage: 0.3, increasedMaxHealth: 0.2, critChance: 0.2, lifeOnHit: 40}},
    },
    // Keys: no crafting use. A set of all four opens the way to the final area (see engine/portal.ts).
    {
        key: 'amberKey', name: 'Amber Key', power: 13, keyItem: true,
        description: 'A key of amber with something still moving inside. One of four that open the way to the Shattered Throne.',
    },
    {
        key: 'graveKey', name: 'Grave Key', power: 13, keyItem: true,
        description: 'A key of black bone, cold as the crypt it locked. One of four that open the way to the Shattered Throne.',
    },
    {
        key: 'cogKey', name: 'Cog Key', power: 13, keyItem: true,
        description: 'A key of interlocking gears that turn on their own. One of four that open the way to the Shattered Throne.',
    },
    {
        key: 'galeKey', name: 'Gale Key', power: 13, keyItem: true,
        description: 'A key of storm glass that whistles in still air. One of four that open the way to the Shattered Throne.',
    },
    // ---- Legendaries: one per quest, dropped only by its ambition boss, a step above its mythics. ----
    {
        key: 'briarcrown', name: 'Briarcrown', prefix: 'Briarcrown', power: 5, legendary: true,
        description: 'The Briar King\'s crown of living thorns. It feeds on every blow its wearer lands.',
        base: {
            helmet: craft(5, 'balanced', {armor: 1}, {maxHealth: 0.5, lifeOnHit: 0.5}, {boost: LEGENDARY}),
            weapon: craft(5, 'secondary', {physicalDamage: 1}, {lifeOnHit: 1}, {boost: LEGENDARY}),
        },
        decoration: {weapon: {lifeOnHit: 1, attackSpeed: 0.03}, armor: {maxHealth: 9}, accessory: {lifeOnHit: 1}},
        equip: {itemType: 'amulet', name: 'Briarcrown Circlet', stats: {lifeOnHit: 5, maxHealth: 15, blockChance: 0.05}},
    },
    {
        key: 'stormveinHeart', name: 'Stormvein Heart', prefix: 'Stormvein', power: 7, legendary: true,
        description: 'The core of the Stormvein Colossus, still crackling. Lightning answers whoever holds it.',
        base: {
            weapon: craft(7, 'balanced', {lightningDamage: 1}, {attackSpeed: 1}, {boost: LEGENDARY}),
            accessory: accessory('paired', {lightningDamage: [9, 18], lightningResist: 0.15}, 3),
        },
        decoration: {weapon: {physicalToLightning: 0.4, increasedElementalDamage: 0.15}, armor: {lightningResist: 0.15}},
        equip: {itemType: 'ring', name: 'Stormvein Ring', stats: {lightningDamage: 12, attackSpeed: 0.08, lightningResist: 0.2}},
    },
    {
        key: 'wyrmqueenEmber', name: 'Wyrmqueen\'s Ember', prefix: 'Wyrmqueen', power: 8, legendary: true,
        description: 'A coal from the heart of the Wyrmqueen. Strikes guided by it find the weak spot.',
        base: {
            weapon: craft(8, 'balanced', {fireDamage: 1}, {critChance: 1}, {boost: LEGENDARY}),
            armor: craft(8, 'capMixed', {armor: 1}, {fireResist: 0.5, maxHealth: 0.5}, {boost: LEGENDARY}),
        },
        decoration: {weapon: {critMultiplier: 0.3, physicalToFire: 0.4}, armor: {fireResist: 0.12, maxHealth: 15}},
        equip: {itemType: 'amulet', name: 'Ember of the Wyrmqueen', stats: {critChance: 0.2, critMultiplier: 0.4, fireResist: 0.25}},
    },
    {
        key: 'mireheart', name: 'Heart of the Mire', prefix: 'Mireheart', power: 8, legendary: true,
        description: 'The Mire Mother\'s heart, still beating slow and cold. It never lets its bearer go hungry.',
        base: {
            weapon: craft(8, 'balanced', {coldDamage: 1}, {lifeOnHit: 1.5, accuracy: 0.5}, {boost: LEGENDARY}),
            armor: craft(8, 'capMixed', {evasion: 1}, {coldResist: 0.5, lifeRegen: 0.5}, {boost: LEGENDARY}),
            accessory: accessory('paired', {coldResist: 0.15, accuracy: 30}, 3),
        },
        decoration: {weapon: {lifeOnHit: 3, physicalToCold: 0.4}, armor: {coldResist: 0.12, lifeRegen: 24}, accessory: {evasionAsCold: defenseAsDamage('evasionAsCold', 8)}},
        equip: {itemType: 'amulet', name: 'Mireheart Locket', stats: {lifeLeech: 0.05, accuracy: 40, coldResist: 0.25}},
    },
    {
        key: 'tempestTalon', name: 'Tempest Talon', prefix: 'Tempest', power: 8, legendary: true,
        description: 'A talon from the Tempest Roc. Strikes made with it land before the thunder.',
        base: {
            weapon: craft(8, 'balanced', {lightningDamage: 1}, {attackSpeed: 1}, {boost: LEGENDARY}),
            shield: craft(8, 'capMixed', {blockChance: 1}, {lightningResist: 0.5, attackSpeed: 0.5}, {boost: LEGENDARY}),
        },
        decoration: {weapon: {attackSpeed: 0.08, physicalToLightning: 0.4}, armor: {evasion: 8, lightningResist: 0.1}},
        equip: {itemType: 'ring', name: 'Talon of the Tempest', stats: {attackSpeed: 0.1, evasion: 40, blockChance: 0.05}},
    },
    {
        key: 'riftheart', name: 'Heart of the Rift', prefix: 'Riftheart', power: 10, legendary: true,
        description: 'What the Rift Tyrant was made around: a knot of fire, frost and lightning that never settles.',
        base: {
            weapon: craft(10, 'balanced', {fireDamage: 0.34, coldDamage: 0.33, lightningDamage: 0.33}, {critChance: 1}, {boost: LEGENDARY}),
            armor: craft(10, 'capMixed', {ward: 1}, {fireResist: 0.34, coldResist: 0.33, lightningResist: 0.33}, {boost: LEGENDARY}),
        },
        decoration: {weapon: {physicalToFire: 0.15, physicalToCold: 0.15, physicalToLightning: 0.15}, armor: {fireResist: 0.1, coldResist: 0.1, lightningResist: 0.1}},
        equip: {itemType: 'ring', name: 'Heart of the Rift', stats: {increasedElementalDamage: 0.25, fireResist: 0.2, coldResist: 0.2, lightningResist: 0.2}},
    },
    {
        key: 'empressStinger', name: 'Empress\'s Stinger', prefix: 'Empress', power: 14, legendary: true,
        description: 'The Amber Empress\'s stinger, still dripping. Whatever it touches burns, and the wielder is gone before the answer comes.',
        base: {
            weapon: craft(14, 'balanced', {fireDamage: 1}, {attackSpeed: 1}, {boost: LEGENDARY}),
            armor: craft(14, 'capMixed', {evasion: 1}, {attackSpeed: 0.5, fireResist: 0.5}, {boost: LEGENDARY}),
        },
        decoration: {weapon: {igniteChance: 0.1, attackSpeed: 0.08}, armor: {evasion: 18}, accessory: {igniteChance: 0.08}},
        equip: {itemType: 'ring', name: 'Signet of the Empress', stats: {evasion: 180, attackSpeed: 0.1, igniteChance: 0.15}},
    },
    {
        key: 'regentPhylactery', name: 'Regent\'s Phylactery', prefix: 'Regent', power: 14, legendary: true,
        description: 'Where the Dusk Regent kept what was left of his life. It holds far more than one body should.',
        base: {
            armor: craft(14, 'capMixed', {ward: 1}, {maxHealth: 1}, {boost: LEGENDARY}),
            accessory: accessory('paired', {maxHealth: 80, int: 14, lifeOnHit: 30}, 6),
            amulet: accessory('paired', {maxHealth: 80, ward: amuletWard(14, 1.25)}, 6),
        },
        decoration: {armor: {maxHealth: 20, ward: 5.5}, accessory: {increasedMaxHealth: 0.12}, weapon: {chillChance: 0.1}},
        equip: {itemType: 'amulet', name: 'Phylactery of the Regent', stats: {increasedMaxHealth: 0.15, ward: 100, chillChance: 0.15, lifeOnHit: 30}},
    },
    {
        key: 'overseerSeal', name: 'Overseer\'s Seal', prefix: 'Overseer', power: 14, legendary: true,
        description: 'The Ironbound Overseer\'s seal of command. Blows glance off it, and the ones it returns are made to last.',
        base: {
            shield: craft(14, 'capMixed', {blockChance: 1}, {critMultiplier: 0.5, maxHealth: 0.5}, {boost: LEGENDARY}),
            weapon: craft(14, 'balanced', {physicalDamage: 1}, {accuracy: 1}, {boost: LEGENDARY}),
        },
        decoration: {weapon: {critMultiplier: 0.2, accuracy: 25}, shield: {blockChance: 0.09}, armor: {armor: 18}},
        equip: {itemType: 'amulet', name: 'Seal of the Overseer', stats: {blockChance: 0.1, increasedArmor: 0.25, critMultiplier: 0.4}},
    },
    {
        key: 'heraldBolt', name: 'Herald\'s Thunderbolt', prefix: 'Herald', power: 14, legendary: true,
        description: 'A bolt the Storm Herald never got to throw. It waits for one perfect strike.',
        base: {
            weapon: craft(14, 'balanced', {lightningDamage: 1}, {critMultiplier: 1}, {boost: LEGENDARY}),
            accessory: accessory('paired', {critMultiplier: 0.4, shockChance: 0.15}, 6),
        },
        decoration: {weapon: {critMultiplier: 0.3, physicalToLightning: 0.4}, accessory: {shockChance: 0.08}},
        equip: {itemType: 'ring', name: 'Ring of the Herald', stats: {critMultiplier: 0.5, lightningDamage: 30, shockChance: 0.15}},
    },
    {
        // Power 15 like the Throne's mythic (the tables stop there), with a bigger boost to stay a step above it.
        key: 'borrowedCrown', name: 'The Borrowed Crown', prefix: 'Usurper\'s', power: 15, legendary: true,
        description: 'The crown the Pretender took from the Shattered King. It still answers to whoever wears it, for now.',
        base: {
            helmet: craft(15, 'balanced', {armor: 0.5, evasion: 0.5}, {maxHealth: 1}, {boost: 1.4}),
            accessory: accessory('paired', {increasedDamage: 0.3, attackSpeed: 0.12}, 7),
        },
        decoration: {weapon: {increasedDamage: 0.2}, armor: {maxHealth: 25}, accessory: {attackSpeed: 0.1}},
        equip: {itemType: 'amulet', name: 'The Borrowed Crown', stats: {increasedDamage: 0.35, attackSpeed: 0.12, increasedMaxHealth: 0.15}},
    },
    ...gemMaterials(),
];

export const materials: Record<string, MaterialDef> = Object.fromEntries(list.map(m => [m.key, m]));

// Premium materials: a rare variant of every material (0.3% of drops). As a base or decoration they
// give double the stats, except base caps, which rise by only 20%. Worn directly, their stats double
// too. Deliberately generous for now; specific stats can be reined in later.
export const PREMIUM_CHANCE = 0.002;
export const PREMIUM_STAT_MULTIPLIER = 2;
export const PREMIUM_CAP_MULTIPLIER = 1.2;
const PREMIUM = 'premium:';
export const isPremium = (key: string): boolean => key.startsWith(PREMIUM);
export const premiumKey = (key: string): string => isPremium(key) ? key : PREMIUM + key;
export const plainKey = (key: string): string => isPremium(key) ? key.slice(PREMIUM.length) : key;

const double = (stats: StatValues): StatValues =>
    Object.fromEntries(Object.entries(stats).map(([k, v]) => [k, ((v as number) ?? 0) * PREMIUM_STAT_MULTIPLIER]));
const mapTable = <T>(table: Partial<Record<Tag, T>> | undefined, fn: (value: T) => T): Partial<Record<Tag, T>> | undefined =>
    table && Object.fromEntries(Object.entries(table).map(([tag, value]) => [tag, fn(value as T)]));

function makePremium(m: MaterialDef): MaterialDef {
    return {
        ...m,
        key: premiumKey(m.key),
        name: 'Premium ' + m.name,
        prefix: 'Premium ' + (m.prefix ?? m.name),
        description: `A premium ${m.name.toLowerCase()}: double the stats as a base, decoration or worn directly, and base caps 20% higher.` + (m.description ? ' ' + m.description : ''),
        base: mapTable(m.base, (b: BaseStats) => ({
            ...b,
            stats: Object.fromEntries(Object.entries(b.stats).map(([k, v]) => [k, Array.isArray(v)
                ? [v[0] * PREMIUM_STAT_MULTIPLIER, v[1] * PREMIUM_CAP_MULTIPLIER]
                : (v ?? 0) * PREMIUM_STAT_MULTIPLIER])),
            labelPriority: (b.labelPriority ?? m.power) + 0.5,
        })),
        decoration: mapTable(m.decoration, double),
        equip: m.equip && {...m.equip, name: 'Premium ' + m.equip.name, stats: double(m.equip.stats)},
        premium: true,
    };
}
// Health and ward on equipment run at double the table values above (bases, caps included,
// decorations and worn-directly stats), so heroes' pools keep up with late-game damage. Shared
// stat objects are scaled once.
export const GEAR_POOL_MULTIPLIER = 2;
const POOL_STATS: StatKey[] = ['maxHealth', 'ward'];
{
    const done = new Set<object>();
    const scale = (stats: Record<string, unknown> | undefined) => {
        if (!stats || done.has(stats)) return;
        done.add(stats);
        for (const k of POOL_STATS) {
            const v = stats[k];
            if (Array.isArray(v)) stats[k] = [v[0] * GEAR_POOL_MULTIPLIER, v[1] * GEAR_POOL_MULTIPLIER];
            else if (typeof v === 'number') stats[k] = v * GEAR_POOL_MULTIPLIER;
        }
    };
    for (const m of list) {
        for (const b of Object.values(m.base ?? {})) scale((b as BaseStats).stats as Record<string, unknown>);
        for (const d of Object.values(m.decoration ?? {})) scale(d as Record<string, unknown>);
        scale(m.equip?.stats as Record<string, unknown> | undefined);
    }
}
// Crit chance and crit multiplier are compressed into fixed bands. A source's place in its band is
// half its old amount (against the other sources) and half its power, so a low-tier specialist
// doesn't land at the top. Base crafts 15% to 40% (item types scale them further, up to 80% on two-handed weapons) and
// decorations 10% to 25%. Worn-directly stats are set by hand and left alone.
const CRIT_BANDS: Record<'critChance' | 'critMultiplier', {base: [number, number, number, number], decoration: [number, number, number, number]}> = {
    // [lowest source now, highest source now, new low, new high]
    critChance: {base: [0.02, 0.15, 0.15, 0.4], decoration: [0.02, 0.06, 0.1, 0.25]},
    critMultiplier: {base: [0.15, 0.67, 0.15, 0.4], decoration: [0.08, 0.35, 0.1, 0.25]},
};
{
    const done = new Set<object>();
    const band = (stats: Record<string, unknown> | undefined, kind: 'base' | 'decoration', power: number) => {
        if (!stats || done.has(stats)) return;
        done.add(stats);
        for (const k of ['critChance', 'critMultiplier'] as const) {
            const v = stats[k];
            if (typeof v !== 'number') continue;
            const [lo, hi, a, b] = CRIT_BANDS[k][kind];
            const t = (Math.min(1, Math.max(0, (v - lo) / (hi - lo))) + (Math.min(power, 15) - 1) / 14) / 2;
            stats[k] = Math.round((a + t * (b - a)) * 100) / 100;
        }
    };
    for (const m of list) {
        for (const b of Object.values(m.base ?? {})) band((b as BaseStats).stats as Record<string, unknown>, 'base', m.power);
        for (const d of Object.values(m.decoration ?? {})) band(d as Record<string, unknown>, 'decoration', m.power);
    }
}
for (const m of list) if (!m.keyItem) materials[premiumKey(m.key)] = makePremium(m);

// Each material followed by its premium version, so lists of owned materials keep them together.
export const materialOrder: string[] = list.flatMap(m => m.keyItem ? [m.key] : [m.key, premiumKey(m.key)]);

export function requireMaterial(key: string): MaterialDef {
    const material = materials[key];
    if (!material) {
        throw new Error('Unknown material ' + key);
    }
    return material;
}
