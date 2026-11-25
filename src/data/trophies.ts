import {classes, endlessKey, questHiddenOnMap, quests, unlockMet} from './quests';
import type {GameState, StatKey, StatValues} from '../engine/types';

// Trophies: guild achievements along one axis each, upgraded through tiers (bronze, silver, ...).
// Every tier grants fame once. An equipped trophy gives its current tier's bonus to the guild.

export const tierNames = ['Bronze', 'Silver', 'Gold', 'Platinum'];

export interface TrophyBonus {
    // Added to every adventurer's gear stats.
    stats?: StatValues
    // Extra gold and XP from quest encounters, as a share (0.1 = +10%).
    gold?: number
    xp?: number
}

export interface TrophyTier {
    target: number
    fame: number
    bonus: TrophyBonus
}

export interface TrophyDef {
    key: string
    name: string
    // Shown as "<goal> <target>", e.g. "Reach level" 25.
    goal: (target: number) => string
    tiers: TrophyTier[]
    value(state: GameState): number
    // Whether to list it under upcoming achievements yet.
    relevant(state: GameState): boolean
    bonusText(bonus: TrophyBonus): string
}

const pct = (v: number) => `${Math.round(v * 100)}%`;
// Keeps one decimal for half percents (0.5%, 1.5%).
const fmtPct = (v: number) => `${Math.round(v * 1000) / 10}%`;

function questClearTrophy(questKey: string, name: string, fame: number[], kind: 'gold' | 'xp', amounts: number[]): TrophyDef {
    const quest = quests[questKey];
    return {
        key: 'clear-' + questKey,
        name,
        goal: t => t === 0 ? `Fully clear ${quest.name}` : `Fully clear ${quest.name} with ${t} modifier${t > 1 ? 's' : ''} active`,
        // Bronze for a full clear, then silver, gold and platinum with 2, 4 and 6 modifiers active.
        tiers: [0, 2, 4, 6].map((target, i) => ({target, fame: fame[i], bonus: {[kind]: amounts[i]}})),
        // -1 = never cleared; otherwise the most modifiers on a full clear.
        value: s => {
            const p = s.questProgress[questKey];
            return Math.max(p?.bestModifiedClear ?? -1, (p?.fullClears ?? 0) > 0 ? 0 : -1);
        },
        relevant: s => s.fame >= quest.fameToUnlock && unlockMet(s.achievements, quest) && !questHiddenOnMap(s, questKey),
        bonusText: b => kind === 'gold' ? `+${pct(b.gold ?? 0)} gold from quests` : `+${pct(b.xp ?? 0)} XP from quests`,
    };
}

function endlessTrophy(questKey: string, name: string, fame: number[], bonus: (i: number) => TrophyBonus, text: (b: TrophyBonus) => string): TrophyDef {
    const quest = quests[questKey];
    return {
        key: 'endless-' + questKey,
        name,
        goal: t => `Reach encounter ${t} in ${quest.name}: Endless`,
        tiers: [20, 50, 100].map((target, i) => ({target, fame: fame[i], bonus: bonus(i)})),
        value: s => (s.questProgress[endlessKey(questKey)]?.bestEncounter ?? -1) + 1,
        relevant: s => s.achievements.includes('clear-' + questKey),
        bonusText: text,
    };
}

const coreAmounts = [2, 6, 12, 20];
const CLASS_FAME = [5, 15, 30, 50];
// Classes from tier 3 up are hired at higher levels, so their first tiers start later.
const targetsFor = (tier: number) => tier >= 3 ? [30, 45, 60, 75] : [5, 25, 50, 75];
// One trophy per class, for raising a hero of that class. Its bonus defaults to the class's core stat.
function classTrophy(classKey: string, name: string, bonus?: {stats: (i: number) => StatValues, text: (b: TrophyBonus) => string} | {xp: number[]}): TrophyDef {
    const cls = classes[classKey];
    const stat = cls.coreStat.toUpperCase();
    const bonusFor = (i: number): TrophyBonus => !bonus ? {stats: {[cls.coreStat]: coreAmounts[i]}}
        : 'xp' in bonus ? {xp: bonus.xp[i]} : {stats: bonus.stats(i)};
    return {
        key: 'class-' + classKey,
        name,
        goal: t => `Raise a ${cls.name} to level ${t}`,
        tiers: targetsFor(cls.tier).map((target, i) => ({target, fame: CLASS_FAME[i], bonus: bonusFor(i)})),
        value: s => Math.max(0, ...s.adventurers.filter(a => a.classKey === classKey).map(a => a.level)),
        relevant: s => s.adventurers.some(a => a.classKey === classKey),
        bonusText: b => !bonus ? `+${b.stats?.[cls.coreStat] ?? 0} ${stat} for everyone`
            : 'xp' in bonus ? `+${pct(b.xp ?? 0)} XP from quests` : bonus.text(b),
    };
}
// A class trophy whose bonus is one stat, at amounts[i] for tier i.
function statBonus(key: StatKey, amounts: number[], text: (v: number) => string) {
    return {stats: (i: number) => ({[key]: amounts[i]}), text: (b: TrophyBonus) => `${text(b.stats?.[key] ?? 0)} for everyone`};
}

export const trophyList: TrophyDef[] = [
    questClearTrophy('brambleRoad', 'Bramble Road Waystone', [10, 10, 15, 20], 'gold', [0.1, 0.2, 0.3, 0.4]),
    questClearTrophy('hollowMines', 'Hollow Mines Lantern', [25, 20, 30, 40], 'xp', [0.1, 0.2, 0.3, 0.4]),
    questClearTrophy('ashenPeaks', 'Wyrmfire Brazier', [40, 30, 45, 60], 'gold', [0.15, 0.3, 0.45, 0.6]),
    questClearTrophy('sunkenMarsh', 'Mire Lantern', [40, 30, 45, 60], 'xp', [0.15, 0.3, 0.45, 0.6]),
    questClearTrophy('thunderheadCrags', 'Stormglass Bell', [40, 30, 45, 60], 'gold', [0.15, 0.3, 0.45, 0.6]),
    questClearTrophy('sunderedRift', 'Riftstone Lens', [70, 50, 70, 95], 'xp', [0.2, 0.4, 0.6, 0.8]),
    questClearTrophy('amberHive', 'Amber Reliquary', [100, 70, 100, 135], 'gold', [0.25, 0.5, 0.75, 1]),
    questClearTrophy('duskgraveNecropolis', 'Funeral Bell', [100, 70, 100, 135], 'xp', [0.25, 0.5, 0.75, 1]),
    questClearTrophy('ironboundFoundry', 'Brass Orrery', [100, 70, 100, 135], 'gold', [0.25, 0.5, 0.75, 1]),
    questClearTrophy('skyspireAerie', 'Stormwatch Lantern', [100, 70, 100, 135], 'xp', [0.25, 0.5, 0.75, 1]),
    questClearTrophy('shatteredThrone', 'Shattered Sceptre', [200, 120, 160, 215], 'gold', [0.4, 0.8, 1.2, 1.6]),
    endlessTrophy('brambleRoad', 'Thornheart', [10, 20, 30],
        i => ({stats: {increasedMaxHealth: [0.05, 0.1, 0.15][i]}}), b => `+${pct(b.stats?.increasedMaxHealth ?? 0)} max HP for everyone`),
    endlessTrophy('hollowMines', 'Deepforge Ember', [15, 25, 40],
        i => ({stats: {increasedDamage: [0.05, 0.1, 0.15][i]}}), b => `+${pct(b.stats?.increasedDamage ?? 0)} damage for everyone`),
    endlessTrophy('ashenPeaks', 'Ashen Crown', [20, 35, 55],
        i => ({stats: {attackSpeed: [0.04, 0.08, 0.12][i]}}), b => `+${pct(b.stats?.attackSpeed ?? 0)} attack speed for everyone`),
    endlessTrophy('sunkenMarsh', 'Drowned Crown', [20, 35, 55],
        i => ({stats: {critChance: [0.02, 0.04, 0.06][i]}}), b => `+${pct(b.stats?.critChance ?? 0)} crit chance for everyone`),
    endlessTrophy('thunderheadCrags', 'Thunder Diadem', [20, 35, 55],
        i => ({stats: {increasedEvasion: [0.05, 0.1, 0.15][i]}}), b => `+${pct(b.stats?.increasedEvasion ?? 0)} evasion for everyone`),
    endlessTrophy('sunderedRift', 'Prism Crown', [25, 45, 70],
        i => ({stats: {increasedElementalDamage: [0.08, 0.16, 0.24][i]}}), b => `+${pct(b.stats?.increasedElementalDamage ?? 0)} elemental damage for everyone`),
    endlessTrophy('amberHive', 'Swarm Crown', [25, 45, 70],
        i => ({stats: {blockChance: [0.02, 0.04, 0.06][i]}}), b => `+${pct(b.stats?.blockChance ?? 0)} block chance for everyone`),
    endlessTrophy('duskgraveNecropolis', 'Grave Crown', [25, 45, 70],
        i => ({stats: {increasedMaxHealth: [0.05, 0.1, 0.15][i]}}), b => `+${pct(b.stats?.increasedMaxHealth ?? 0)} max HP for everyone`),
    endlessTrophy('ironboundFoundry', 'Iron Crown', [25, 45, 70],
        i => ({stats: {increasedArmor: [0.08, 0.16, 0.24][i]}}), b => `+${pct(b.stats?.increasedArmor ?? 0)} armor for everyone`),
    endlessTrophy('skyspireAerie', 'Gale Crown', [25, 45, 70],
        i => ({stats: {critMultiplier: [0.1, 0.2, 0.3][i]}}), b => `+${pct(b.stats?.critMultiplier ?? 0)} crit multiplier for everyone`),
    endlessTrophy('shatteredThrone', 'Crown of Ages', [40, 70, 100],
        i => ({stats: {increasedDamage: [0.05, 0.1, 0.15][i], increasedMaxHealth: [0.05, 0.1, 0.15][i]}}),
        b => `+${pct(b.stats?.increasedDamage ?? 0)} damage and +${pct(b.stats?.increasedMaxHealth ?? 0)} max HP for everyone`),
    classTrophy('warrior', "Warlord's Banner"),
    classTrophy('ranger', "Pathfinder's Quiver"),
    classTrophy('priest', "Oracle's Censer"),
    classTrophy('reaver', "Reaver's Cleaver", statBonus('increasedPhysicalDamage', [0.03, 0.06, 0.09, 0.12], v => `+${pct(v)} physical damage`)),
    classTrophy('spellblade', "Spellblade's Sigil", statBonus('wardOnDodgePercent', [0.005, 0.01, 0.015, 0.02], v => `${fmtPct(v)} of max ward on dodge`)),
    classTrophy('battlemage', "Battlemage's Aegis", statBonus('hpLostAsWard', [0.02, 0.04, 0.06, 0.08], v => `${pct(v)} of life lost gained as ward`)),
    classTrophy('monk', "Monk's Prayer Beads", statBonus('lifeOnHit', [1, 2, 3, 4], v => `+${v} life on hit`)),
    classTrophy('ninja', "Ninja's Shuriken", statBonus('attackSpeed', [0.01, 0.02, 0.03, 0.04], v => `+${pct(v)} attack speed`)),
    classTrophy('wizard', "Wizard's Orrery", {
        stats: i => { const v = [0.02, 0.04, 0.06, 0.08][i]; return {fireResist: v, coldResist: v, lightningResist: v}; },
        text: b => `+${pct(b.stats?.fireResist ?? 0)} to all elemental resistances for everyone`}),
    classTrophy('gladiator', "Gladiator's Laurel", statBonus('blockChance', [0.01, 0.02, 0.03, 0.04], v => `+${pct(v)} block chance`)),
    classTrophy('saboteur', "Saboteur's Fuse", statBonus('ailmentEffect', [0.05, 0.1, 0.15, 0.2], v => `+${pct(v)} ailment effect`)),
    classTrophy('bloodmage', "Bloodmage's Chalice", statBonus('lifeLeech', [0.005, 0.01, 0.015, 0.02], v => `+${fmtPct(v)} life leech`)),
    classTrophy('berserker', "Berserker's Warpaint", statBonus('increasedMaxHealth', [0.02, 0.04, 0.06, 0.08], v => `+${pct(v)} max HP`)),
    classTrophy('marksman', "Marksman's Scope", statBonus('accuracy', [15, 30, 45, 60], v => `+${v} accuracy`)),
    classTrophy('warlock', "Warlock's Grimoire", {
        stats: i => { const v = [0.02, 0.04, 0.06, 0.08][i]; return {igniteChance: v, chillChance: v, shockChance: v}; },
        text: b => `+${pct(b.stats?.igniteChance ?? 0)} ignite, chill and shock chance for everyone`}),
    classTrophy('champion', "Champion's Standard", {
        stats: i => { const v = [2, 4, 6, 8][i]; return {str: v, dex: v, int: v}; },
        text: b => `+${b.stats?.str ?? 0} to all attributes for everyone`}),
    classTrophy('vagabond', "Vagabond's Compass", {xp: [0.05, 0.1, 0.15, 0.2]}),
];
export const trophies: Record<string, TrophyDef> = Object.fromEntries(trophyList.map(t => [t.key, t]));

// Highest tier reached from the current value, as an index (-1 = none).
export function tierFor(def: TrophyDef, value: number): number {
    let tier = -1;
    def.tiers.forEach((t, i) => { if (value >= t.target) tier = i; });
    return tier;
}

// One free with the first trophy, plus one for each guild expansion.
export const MAX_TROPHY_SLOTS = 10;

// Sums the bonuses of equipped trophies.
export function equippedBonuses(state: GameState): TrophyBonus[] {
    return (state.trophySlots ?? []).flatMap(key => {
        const tier = key ? state.trophies?.[key] ?? -1 : -1;
        return key && tier >= 0 && trophies[key] ? [trophies[key].tiers[tier].bonus] : [];
    });
}
export function trophyGoldXp(state: GameState): {gold: number, xp: number} {
    let gold = 0, xp = 0;
    for (const b of equippedBonuses(state)) {
        gold += b.gold ?? 0;
        xp += b.xp ?? 0;
    }
    return {gold, xp};
}

// What earned a tier, e.g. "Raise a Warrior to level 25".
export function earnedText(def: TrophyDef, tier: number): string {
    return def.goal(def.tiers[tier].target);
}
