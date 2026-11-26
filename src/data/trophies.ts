import {classes, damageStats, endlessKey, questHiddenOnMap, questOrder, quests, questTier, unlockMet} from './quests';
import {formatStat} from './stats';
import type {GameState, StatKey, StatValues} from '../engine/types';

// Trophies: guild achievements along one axis each, upgraded through tiers (bronze, silver, ...).
// Every tier grants fame once. An equipped trophy gives its current tier's bonus to the guild.

export const tierNames = ['Bronze', 'Silver', 'Gold', 'Platinum'];

export interface TrophyBonus {
    // Added to every adventurer's gear stats.
    stats?: StatValues
    // Increased gold and XP from quest encounters, as a share (0.1 = +10%).
    gold?: number
    xp?: number
    // Added to every encounter's extra reward chance (more than one material per drop roll).
    extraRewardChance?: number
    // Vagabond's Compass: chance for each rare bonus on a new applicant to come up cursed instead.
    curseChance?: number
    // The Empty Vessel's stone: quests below this campaign tier (questTier) get the Void challenge.
    voidTier?: number
}

export interface TrophyTier {
    target: number
    fame: number
    bonus: TrophyBonus
}

export type TrophyKind = 'class' | 'quest' | 'endless';

export interface TrophyDef {
    key: string
    kind: TrophyKind
    name: string
    // Tier names, when not Bronze/Silver/Gold/Platinum (the Empty Vessel's stones).
    tierNames?: string[]
    // Shown as "<goal> <target>", e.g. "Reach level" 25.
    goal: (target: number) => string
    tiers: TrophyTier[]
    value(state: GameState): number
    // Whether to list it under upcoming achievements yet.
    relevant(state: GameState): boolean
    bonusText(bonus: TrophyBonus): string
}

const pct = (v: number) => `${Math.round(v * 1000) / 10}%`;

// One line per kind, without "and" between them: the trophy's own effect first, then its core
// attribute bonus, then XP or gold. "+100 max HP, +20% increased max HP\n+10 Str, +5% increased Str\n+20% XP from quests"
// Shown with white-space: pre-line (.mods).
const CORE_KEYS = new Set<string>(['str', 'dex', 'int', 'increasedStr', 'increasedDex', 'increasedInt']);
export function trophyBonusText(b: TrophyBonus): string {
    const stats = Object.entries(b.stats ?? {}).filter(([, v]) => v);
    const own = stats.filter(([k]) => !CORE_KEYS.has(k)).map(([k, v]) => formatStat(k as StatKey, v!));
    const core = stats.filter(([k]) => CORE_KEYS.has(k)).map(([k, v]) => formatStat(k as StatKey, v!));
    if (b.extraRewardChance) own.push(`+${pct(b.extraRewardChance)} extra reward chance`);
    if (b.curseChance) own.push(`${pct(b.curseChance)} chance for each rare bonus on new applicants to be cursed`);
    if (b.voidTier) own.push(`Void challenge in ${b.voidTier > Math.max(...questOrder.filter(k => !quests[k].endless && !quests[k].portal).map(questTier)) ? 'every quest' : `quests up to ${quests[questOrder.find(k => questTier(k) === b.voidTier! - 1) ?? 'brambleRoad'].name}`}: +1000% monster life and damage, +400% premium drop chance`);
    const last = [b.xp ? `+${pct(b.xp)} XP from quests` : '', b.gold ? `+${pct(b.gold)} gold from quests` : ''].filter(Boolean);
    return [own.join(', '), core.join(', '), last.join(', ')].filter(Boolean).join('\n');
}

export function trophyTierName(def: TrophyDef, tier: number): string {
    return def.tierNames?.[tier] ?? tierNames[tier];
}

const QUEST_GOLD = [0.05, 0.1, 0.15, 0.2];
const QUEST_FAME_STEP = [1, 1.5, 2, 3];
// Bronze for a full clear, then silver, gold and platinum with 2, 4 and 6 modifiers active. Every one
// also gives increased gold. Fame per tier: 1x, 1.5x, 2x and 3x the bronze fame.
function questClearTrophy(questKey: string, name: string, bronzeFame: number, stats: (i: number) => StatValues): TrophyDef {
    const quest = quests[questKey];
    return {
        key: 'clear-' + questKey,
        kind: 'quest',
        name,
        goal: t => t === 0 ? `Fully clear ${quest.name}` : `Fully clear ${quest.name} with ${t} modifier${t > 1 ? 's' : ''} active`,
        tiers: [0, 2, 4, 6].map((target, i) => ({target, fame: Math.round(bronzeFame * QUEST_FAME_STEP[i]), bonus: {stats: stats(i), gold: QUEST_GOLD[i]}})),
        // -1 = never cleared; otherwise the most modifiers on a full clear.
        value: s => {
            const p = s.questProgress[questKey];
            return Math.max(p?.bestModifiedClear ?? -1, (p?.fullClears ?? 0) > 0 ? 0 : -1);
        },
        relevant: s => s.fame >= quest.fameToUnlock && unlockMet(s.achievements, quest) && !questHiddenOnMap(s, questKey),
        bonusText: trophyBonusText,
    };
}

// Endless banners: earned at encounters 20, 50, 80 and 100, always in effect (they need no trophy
// slot). Each gives extra reward chance, and the quest's Endless trial modifier opens with the first
// tier: one trial level for every 20 Endless encounters the guild has cleared there (see trialMax).
export const ENDLESS_TARGETS = [20, 50, 80, 100];
const ENDLESS_REWARD = [0.02, 0.04, 0.06, 0.1];
function endlessTrophy(questKey: string, name: string, bronzeFame: number): TrophyDef {
    const quest = quests[questKey];
    return {
        key: 'endless-' + questKey,
        kind: 'endless',
        name,
        goal: t => `Reach encounter ${t} in ${quest.name}: Endless`,
        tiers: ENDLESS_TARGETS.map((target, i) => ({target, fame: bronzeFame * 2 ** i, bonus: {extraRewardChance: ENDLESS_REWARD[i]}})),
        value: s => (s.questProgress[endlessKey(questKey)]?.bestEncounter ?? -1) + 1,
        relevant: s => s.achievements.includes('clear-' + questKey),
        bonusText: b => `+${pct(b.extraRewardChance ?? 0)} extra reward chance in every quest`,
    };
}

const CLASS_FAME = [5, 15, 30, 50];
// Classes from tier 3 up are hired at higher levels, so their first tiers start later.
const targetsFor = (tier: number) => tier >= 3 ? [30, 45, 60, 75] : [5, 25, 50, 75];
// Every class trophy's common bonus: its class's core attributes (flat and increased, split between
// them when it has more than one), and increased XP.
const CORE_FLAT = [2, 4, 6, 10], CORE_FLAT_SPLIT = [1, 2, 3, 5];
const CORE_INCREASED = [0.01, 0.02, 0.03, 0.05];
const CLASS_XP = [0.05, 0.1, 0.15, 0.2];
const increasedKey = {str: 'increasedStr', dex: 'increasedDex', int: 'increasedInt'} as const;
function commonClassBonus(classKey: string, i: number): StatValues {
    const cores = damageStats(classes[classKey]);
    const out: StatValues = {};
    for (const k of cores) {
        out[k] = cores.length > 1 ? CORE_FLAT_SPLIT[i] : CORE_FLAT[i];
        out[increasedKey[k]] = cores.length > 1 ? CORE_INCREASED[i] / 2 : CORE_INCREASED[i];
    }
    return out;
}
// One trophy per class, for raising a hero of that class.
function classTrophy(classKey: string, name: string, own: (i: number) => TrophyBonus, options: {common?: boolean, tierNames?: string[]} = {}): TrophyDef {
    const cls = classes[classKey];
    return {
        key: 'class-' + classKey,
        kind: 'class',
        name,
        tierNames: options.tierNames,
        goal: t => `Raise ${/^[AEIOU]/.test(cls.name) ? 'an' : 'a'} ${cls.name} to level ${t}`,
        tiers: targetsFor(cls.tier).map((target, i) => {
            const o = own(i);
            const bonus: TrophyBonus = options.common === false ? o : {...o, stats: {...commonClassBonus(classKey, i), ...o.stats}, xp: (o.xp ?? 0) + CLASS_XP[i]};
            return {target, fame: CLASS_FAME[i], bonus};
        }),
        value: s => Math.max(0, ...s.adventurers.filter(a => a.classKey === classKey).map(a => a.level)),
        relevant: s => s.adventurers.some(a => a.classKey === classKey),
        bonusText: trophyBonusText,
    };
}
const by = (values: number[]) => (i: number) => values[i];
const stat = (entries: Partial<Record<StatKey, number[]>>) => (i: number): TrophyBonus => ({stats: Object.fromEntries(Object.entries(entries).map(([k, v]) => [k, v![i]]))});
const five = [0.05, 0.1, 0.15, 0.2];

export const trophyList: TrophyDef[] = [
    questClearTrophy('brambleRoad', 'Bramble Road Waystone', 10, i => ({armor: [2, 5, 10, 20][i], increasedArmor: five[i]})),
    questClearTrophy('hollowMines', 'Hollow Mines Lantern', 20, i => ({evasion: [5, 10, 15, 20][i], increasedEvasion: five[i]})),
    questClearTrophy('ashenPeaks', 'Wyrmfire Brazier', 40, i => ({fireResist: [0.05, 0.1, 0.2, 0.3][i], maxFireResist: [0.01, 0.02, 0.03, 0.05][i]})),
    questClearTrophy('sunkenMarsh', 'Mire Lantern', 40, i => ({coldResist: [0.05, 0.1, 0.2, 0.3][i], maxColdResist: [0.01, 0.02, 0.03, 0.05][i]})),
    questClearTrophy('thunderheadCrags', 'Stormglass Bell', 40, i => ({lightningResist: [0.05, 0.1, 0.2, 0.3][i], maxLightningResist: [0.01, 0.02, 0.03, 0.05][i]})),
    questClearTrophy('sunderedRift', 'Riftstone Lens', 70, i => ({lessElementalDamageTaken: five[i]})),
    questClearTrophy('amberHive', 'Amber Reliquary', 100, i => ({avoidAilmentChance: five[i]})),
    questClearTrophy('duskgraveNecropolis', 'Funeral Bell', 100, i => ({lessDamageTaken: [0.02, 0.04, 0.06, 0.1][i]})),
    questClearTrophy('ironboundFoundry', 'Brass Orrery', 100, i => ({reducedReflectedDamageTaken: [0.1, 0.2, 0.3, 0.5][i]})),
    questClearTrophy('skyspireAerie', 'Stormwatch Lantern', 100, i => ({reducedDamageOverTimeTaken: [0.1, 0.2, 0.3, 0.5][i]})),
    questClearTrophy('shatteredThrone', 'Shattered Sceptre', 200, i => ({moreDamage: five[i]})),
    endlessTrophy('brambleRoad', 'Thornheart Banner', 10),
    endlessTrophy('hollowMines', 'Deepforge Banner', 15),
    endlessTrophy('ashenPeaks', 'Ashen Banner', 20),
    endlessTrophy('sunkenMarsh', 'Drowned Banner', 20),
    endlessTrophy('thunderheadCrags', 'Thunder Banner', 20),
    endlessTrophy('sunderedRift', 'Prism Banner', 25),
    endlessTrophy('amberHive', 'Swarm Banner', 25),
    endlessTrophy('duskgraveNecropolis', 'Grave Banner', 25),
    endlessTrophy('ironboundFoundry', 'Iron Banner', 25),
    endlessTrophy('skyspireAerie', 'Gale Banner', 25),
    endlessTrophy('shatteredThrone', 'Banner of Ages', 40),
    classTrophy('warrior', "Warlord's Banner", stat({maxHealth: [10, 20, 50, 100], increasedMaxHealth: five})),
    classTrophy('ranger', "Pathfinder's Quiver", stat({accuracy: [5, 10, 20, 40], increasedAccuracy: five})),
    classTrophy('priest', "Oracle's Censer", stat({ward: [5, 10, 20, 30], increasedWard: five})),
    classTrophy('reaver', "Reaver's Cleaver", stat({physicalDamage: [2, 5, 10, 20], increasedPhysicalDamage: five})),
    classTrophy('spellblade', "Spellblade's Sigil", stat({critChance: [0.1, 0.2, 0.4, 0.6]})),
    classTrophy('battlemage', "Battlemage's Aegis", stat({lifeRegenPercent: [0.01, 0.02, 0.03, 0.05]})),
    classTrophy('monk', "Monk's Prayer Beads", stat({reducedAilmentEffectTaken: five})),
    classTrophy('ninja', "Ninja's Shuriken", stat({dodgeChance: [0.03, 0.06, 0.1, 0.15]})),
    classTrophy('wizard', "Wizard's Orrery", stat({increasedElementalDamage: five})),
    classTrophy('gladiator', "Gladiator's Laurel", stat({maxBlockChance: [0.01, 0.02, 0.03, 0.05]})),
    classTrophy('saboteur', "Saboteur's Fuse", stat({increasedAilmentLimits: five})),
    classTrophy('bloodmage', "Bloodmage's Chalice", stat({increasedRecovery: five})),
    classTrophy('berserker', "Berserker's Warpaint", stat({attackSpeed: five})),
    classTrophy('marksman', "Marksman's Scope", stat({critMultiplier: [0.1, 0.2, 0.3, 0.5]})),
    classTrophy('warlock', "Warlock's Grimoire", stat({increasedAilmentChance: [0.1, 0.2, 0.3, 0.4], ailmentEffect: five})),
    classTrophy('champion', "Champion's Standard", stat({corePassiveEffect: [0.1, 0.2, 0.3, 0.5]})),
    classTrophy('vagabond', "Vagabond's Compass", i => ({curseChance: by([0.1, 0.2, 0.3, 0.5])(i)})),
    classTrophy('emptyVessel', 'Vessel Stone', i => ({voidTier: by([1, 3, 5, 6])(i)}), {common: false, tierNames: ['Strange Stone', 'Ominous Stone', 'Cursed Stone', 'Void Stone']}),
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

// The bonuses in effect: equipped trophies, plus every Endless banner earned (always on).
export function equippedBonuses(state: GameState): TrophyBonus[] {
    const slotted = (state.trophySlots ?? []).flatMap(key => {
        const tier = key ? state.trophies?.[key] ?? -1 : -1;
        return key && tier >= 0 && trophies[key] && trophies[key].kind !== 'endless' ? [trophies[key].tiers[tier].bonus] : [];
    });
    const banners = trophyList.filter(t => t.kind === 'endless').flatMap(t => {
        const tier = state.trophies?.[t.key] ?? -1;
        return tier >= 0 ? [t.tiers[tier].bonus] : [];
    });
    return [...slotted, ...banners];
}
// Summed across the bonuses in effect.
export function trophyTotal(state: GameState, key: 'extraRewardChance' | 'curseChance' | 'voidTier'): number {
    const list = equippedBonuses(state).map(b => b[key] ?? 0);
    return key === 'voidTier' ? Math.max(0, ...list) : list.reduce((a, b) => a + b, 0);
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
