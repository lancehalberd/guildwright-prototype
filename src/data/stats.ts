import type {BaseStats, Element, StatKey, StatValues} from '../engine/types';

// Every stat an item or material can carry. Items are plain sums of these; "increased" stats are
// separate keys rather than percent modifiers, so caps and display work the same way for all of them.
export interface StatDef {
    key: StatKey
    // Short label used after a number, such as "+4 fire dmg".
    label: string
    group: 'core' | 'life' | 'defense' | 'offense'
    // Percent stats are stored as fractions: 0.05 shows as 5%.
    format: 'number' | 'percent'
    // Base values of these stats are scaled by the item type's damage or armor multiplier.
    scale?: 'weaponDamage' | 'defenseRating'
    description: string
}

const list: StatDef[] = [
    {key: 'str', label: 'Str', group: 'core', format: 'number', description: '+2 max HP, 1% increased minimum damage and 2% increased maximum damage each, for every damage type.'},
    {key: 'dex', label: 'Dex', group: 'core', format: 'number', description: '+1 evasion and +2 accuracy each. Accuracy drives multihits: after a hit lands, another hit is rolled at 1/2 accuracy, then 1/3, and so on until one misses.'},
    {key: 'int', label: 'Int', group: 'core', format: 'number', description: '+1 ward and +1% crit chance each, with no cap. Crits chain: a crit rolls again at 1/2 the crit chance, then 1/3, and each crit level adds the crit multiplier bonus once more.'},

    {key: 'maxHealth', label: 'max HP', group: 'life', format: 'number', description: 'Added to max HP.'},
    {key: 'increasedMaxHealth', label: 'increased max HP', group: 'life', format: 'percent', description: 'Multiplies max HP.'},
    {key: 'lifeRegen', label: 'life regen/s', group: 'life', format: 'number', scale: 'defenseRating', description: 'HP regained each second, in fights and while resting. Shortens rests.'},
    {key: 'lifeRegenPercent', label: 'of max HP regen/s', group: 'life', format: 'percent', description: 'Share of max HP regained each second, added to life regen.'},
    {key: 'lifeLeech', label: 'life leech', group: 'life', format: 'percent', description: 'Share of the damage you deal that comes back as HP.'},
    {key: 'lifeOnHit', label: 'life on hit', group: 'life', format: 'number', description: 'HP regained each time one of your hits lands.'},

    {key: 'armor', label: 'armor', group: 'defense', format: 'number', scale: 'defenseRating', description: 'Reduces physical hits. Each half of a hit covered by armor halves it.'},
    {key: 'increasedArmor', label: 'increased armor', group: 'defense', format: 'percent', description: 'Multiplies armor.'},
    {key: 'evasion', label: 'evasion', group: 'defense', format: 'number', scale: 'defenseRating', description: 'Chance to dodge, against the attacker\'s accuracy.'},
    {key: 'increasedEvasion', label: 'increased evasion', group: 'defense', format: 'percent', description: 'Multiplies evasion.'},
    {key: 'blockChance', label: 'block', group: 'defense', format: 'percent', description: 'Chance to take no damage from a hit that lands. Capped at 75%.'},
    {key: 'ward', label: 'ward', group: 'defense', format: 'number', scale: 'defenseRating', description: 'Absorbs damage of any kind before HP, and refills at the start of each encounter. Adds to the ward from Int.'},
    {key: 'wardOnDodge', label: 'ward on dodge', group: 'defense', format: 'number', description: 'Ward gained each time a monster\'s attack misses you entirely, up to your max ward.'},
    {key: 'wardOnDodgePercent', label: 'of max ward on dodge', group: 'defense', format: 'percent', description: 'Share of your max ward gained each time a monster\'s attack misses you entirely.'},
    {key: 'wardOnBlock', label: 'ward on block', group: 'defense', format: 'number', description: 'Ward gained each time you block a hit, up to your max ward.'},
    {key: 'wardOnBlockPercent', label: 'of max ward on block', group: 'defense', format: 'percent', description: 'Share of your max ward gained each time you block a hit.'},
    {key: 'hpLostAsWard', label: 'of HP lost gained as ward', group: 'defense', format: 'percent', description: 'When a hit takes HP, you gain this share of the HP lost as ward, up to your max ward. Over 100% gives back more ward than the HP you lost.'},
    {key: 'fireResist', label: 'fire res', group: 'defense', format: 'percent', description: 'Reduces fire damage taken. Capped at 75%.'},
    {key: 'coldResist', label: 'cold res', group: 'defense', format: 'percent', description: 'Reduces cold damage taken. Capped at 75%.'},
    {key: 'lightningResist', label: 'lightning res', group: 'defense', format: 'percent', description: 'Reduces lightning damage taken. Capped at 75%.'},

    {key: 'physicalDamage', label: 'phys dmg', group: 'offense', format: 'number', scale: 'weaponDamage', description: 'Added to each hit. Reduced by the target\'s armor.'},
    {key: 'fireDamage', label: 'fire dmg', group: 'offense', format: 'number', scale: 'weaponDamage', description: 'Added to each hit. Ignores armor, reduced by fire resistance.'},
    {key: 'coldDamage', label: 'cold dmg', group: 'offense', format: 'number', scale: 'weaponDamage', description: 'Added to each hit. Ignores armor, reduced by cold resistance.'},
    {key: 'lightningDamage', label: 'lightning dmg', group: 'offense', format: 'number', scale: 'weaponDamage', description: 'Added to each hit. Ignores armor, reduced by lightning resistance.'},
    {key: 'physicalToFire', label: 'phys converted to fire', group: 'offense', format: 'percent', description: 'Share of physical damage dealt as fire instead. It ignores armor and uses elemental scaling.'},
    {key: 'physicalToCold', label: 'phys converted to cold', group: 'offense', format: 'percent', description: 'Share of physical damage dealt as cold instead. It ignores armor and uses elemental scaling.'},
    {key: 'physicalToLightning', label: 'phys converted to lightning', group: 'offense', format: 'percent', description: 'Share of physical damage dealt as lightning instead. It ignores armor and uses elemental scaling.'},
    {key: 'healthAsFire', label: 'of max HP added as fire dmg', group: 'offense', format: 'percent', description: 'Each hit adds this share of your max HP as fire damage, before increased damage. Best on heroes built for life.'},
    {key: 'evasionAsCold', label: 'of evasion added as cold dmg', group: 'offense', format: 'percent', description: 'Each hit adds this share of your evasion rating as cold damage, before increased damage. Best on heroes built for evasion.'},
    {key: 'wardAsLightning', label: 'of max ward added as lightning dmg', group: 'offense', format: 'percent', description: 'Each hit adds this share of your max ward as lightning damage, before increased damage. Best on heroes built for ward.'},
    {key: 'increasedDamage', label: 'increased dmg', group: 'offense', format: 'percent', description: 'Multiplies all damage.'},
    {key: 'increasedPhysicalDamage', label: 'increased phys dmg', group: 'offense', format: 'percent', description: 'Multiplies physical damage.'},
    {key: 'increasedElementalDamage', label: 'increased elemental dmg', group: 'offense', format: 'percent', description: 'Multiplies fire, cold and lightning damage.'},
    {key: 'attackSpeed', label: 'attack speed', group: 'offense', format: 'percent', description: 'Multiplies the weapon\'s attacks per second.'},
    {key: 'accuracy', label: 'accuracy', group: 'offense', format: 'number', description: 'Chance to hit, against the target\'s evasion.'},
    {key: 'critChance', label: 'crit chance', group: 'offense', format: 'percent', description: 'Chance for a hit to crit. Over 100% guarantees the first crit level.'},
    {key: 'critMultiplier', label: 'crit multiplier', group: 'offense', format: 'percent', description: 'Added to the +50% each crit level adds.'},
    {key: 'igniteChance', label: 'chance to ignite', group: 'offense', format: 'percent', description: 'Added to the 25% chance that a hit carrying fire damage sets the target burning.'},
    {key: 'chillChance', label: 'chance to chill', group: 'offense', format: 'percent', description: 'Added to the 25% chance that a hit carrying cold damage chills the target.'},
    {key: 'shockChance', label: 'chance to shock', group: 'offense', format: 'percent', description: 'Added to the 25% chance that a hit carrying lightning damage shocks the target.'},
    {key: 'ailmentEffect', label: 'ailment effect', group: 'offense', format: 'percent', description: 'Makes your burns deal more damage, and your chills and shocks stronger. Chill and Shock still stop at their 50% caps.'},
];

// For filtering: which stat a modifier is about, and how it applies. "increased armor" and "armor"
// share the family "armor", with % and + kinds. "x" is reserved for multipliers.
export type StatOp = 'x' | '%' | '+';
const familyOf: Partial<Record<StatKey, string>> = {
    increasedMaxHealth: 'maxHealth', increasedArmor: 'armor', increasedEvasion: 'evasion',
    increasedPhysicalDamage: 'physicalDamage',
};
export function statFamily(key: StatKey): string {
    return familyOf[key] ?? key;
}
export function familyLabel(family: string): string {
    return statDefs[family as StatKey]?.label ?? family;
}
export function statOp(key: StatKey): StatOp {
    return statDefs[key].format === 'percent' ? '%' : '+';
}
export const opOrder: StatOp[] = ['x', '%', '+'];
export const opLabel: Record<StatOp, string> = {x: '× more', '%': '% percent', '+': '+ flat'};

// Core stats: the primary stats of weapons and armor, scaled by the item type's damage or armor
// multiplier.
export const coreStats: StatKey[] = ['armor', 'evasion', 'blockChance', 'ward', 'hpLostAsWard', 'physicalDamage', 'fireDamage', 'coldDamage', 'lightningDamage'];
export function isCoreStat(key: StatKey): boolean {
    return coreStats.includes(key);
}
// Capped stats: the only stats capped on base materials, by the highest cap among the bases in a
// craft. Every other stat, core or not (e.g. hpLostAsWard), adds up with no cap.
export const cappedStats: StatKey[] = ['armor', 'evasion', 'blockChance', 'ward', 'physicalDamage', 'fireDamage', 'coldDamage', 'lightningDamage'];
export function isCappedStat(key: StatKey): boolean {
    return cappedStats.includes(key);
}
// A base stat entry as [value, cap]; uncapped stats get an infinite cap.
export function baseEntry(entry: [number, number] | number): [number, number] {
    return typeof entry === 'number' ? [entry, Infinity] : entry;
}

export const statDefs = Object.fromEntries(list.map(s => [s.key, s])) as Record<StatKey, StatDef>;
export const statOrder: StatKey[] = list.map(s => s.key);

export const elements: Element[] = ['fire', 'cold', 'lightning'];
export const resistStat: Record<Element, StatKey> = {fire: 'fireResist', cold: 'coldResist', lightning: 'lightningResist'};
export const damageStat = {physical: 'physicalDamage', fire: 'fireDamage', cold: 'coldDamage', lightning: 'lightningDamage'} as const;

// Rounds stored values so sums like 0.1 + 0.2 display cleanly.
export function roundStat(key: StatKey, value: number): number {
    return statDefs[key].format === 'percent' ? Math.round(value * 1000) / 1000 : Math.round(value * 10) / 10;
}

export function formatStatValue(key: StatKey, value: number): string {
    const def = statDefs[key];
    if (def.format === 'percent') {
        const pct = Math.round(value * 1000) / 10;
        return `${pct}%`;
    }
    // Small values get two decimals, so 0.04 life regen doesn't read as 0.
    if (value !== 0 && Math.abs(value) < 0.1) {
        return String(Math.round(value * 100) / 100);
    }
    return String(Math.round(value * 10) / 10);
}

export function formatStat(key: StatKey, value: number): string {
    return `${value < 0 ? '' : '+'}${formatStatValue(key, value)} ${statDefs[key].label}`;
}

// "+6 phys dmg, +4% crit chance" in registry order.
export function formatStats(values: StatValues | undefined): string {
    if (!values) {
        return '';
    }
    return statOrder.filter(k => values[k]).map(k => formatStat(k, values[k]!)).join(', ');
}

export function addStats(into: StatValues, from: StatValues | undefined, scale = 1) {
    if (!from) {
        return into;
    }
    for (const key of statOrder) {
        const v = from[key];
        if (v) {
            into[key] = (into[key] ?? 0) + v * scale;
        }
    }
    return into;
}

// Core stats show their cap; other stats have none.
export function baseStatEntries(base: BaseStats, scaleOf: (stat: StatKey) => number, roundOf: (stat: StatKey, v: number) => number = (_, v) => v): {stat: StatKey, value: number, text: string}[] {
    return (Object.entries(base.stats) as [StatKey, [number, number] | number][]).map(([stat, entry]) => {
        const [raw, rawCap] = baseEntry(entry);
        const scale = scaleOf(stat);
        const value = roundOf(stat, raw * scale), cap = rawCap === Infinity ? Infinity : roundOf(stat, rawCap * scale);
        const text = cap === Infinity ? formatStat(stat, value) : `${formatStat(stat, value)} (cap ${formatStatValue(stat, cap)})`;
        return {stat, value, text};
    });
}
export const CAP_RULE = 'Core stats (flat damage, armor, evasion, ward, block and HP lost as ward) are summed across base materials and capped by the highest cap among them. Other stats add up with no cap.';
