import type {Adventurer, Applicant, CoreStat} from '../engine/types';

// Core passives: one rule each class is built around. The 333 class rolls one of them enhanced; the
// 111 wildcard rolls three of them. Presence comes from passiveLevel(); how strong each scaling
// number is comes from passiveScale() (AdventurerStats.passiveScale).

export type PassiveKey = 'fury' | 'followThrough' | 'siphonWard' | 'cleave' | 'riposte' | 'spellward' | 'martialArts' | 'dualMastery' | 'elementalMastery'
    | 'counterstrike' | 'exploit' | 'bloodPact' | 'rampage' | 'deadeye' | 'hex';

export interface PassiveDef {
    key: PassiveKey
    name: string
    // The description at effect scale s: 1 normally, more with "increased core passive effect"
    // (an enhanced roll adds ENHANCED_EFFECT, the Champion's trophy adds its share). Only the numbers
    // that scale change; a hero with no increase reads exactly the base text.
    text(s: number): string
}

// An enhanced core passive (the Champion's roll) has this much increased effect.
export const ENHANCED_EFFECT = 0.5;

// A number for passive text: whole where it is, else up to two decimals.
const n = (v: number) => String(Math.round(v * 100) / 100);
const pc = (v: number) => `${n(v * 100)}%`;

// What each passive's effect scale multiplies (the runner and stats.ts use these constants):
export const FURY_PER_MISSING = 0.2, FURY_PER_MAX = 0.1;
export const FOLLOW_ACCURACY = 0.5;
export const SIPHON_WARD = 0.5, SIPHON_RESTORE = 0.05;
export const CLEAVE_SHARE = 0.3;
export const RIPOSTE_CRIT = 0.5;
export const SPELLWARD_HEAL = 0.05;
export const MARTIAL_CRIT = 0.15, MARTIAL_CRIT_MULTI = 0.5, MARTIAL_SPEED_PER_LEVEL = 0.01;
export const DUAL_MORE = 0.25;
export const ELEMENTAL_MORE = 1, ELEMENTAL_PENETRATION = 0.5;
export const COUNTER_DAMAGE = 0.5;
export const EXPLOIT_PER_AILMENT = 0.2;
export const BLOOD_PACT_MORE = 0.1;
export const RAMPAGE_PER_10 = 0.01;
export const DEADEYE_CRIT_MULTI = 0.2;
export const HEX_PER_SECOND = 0.04;

// Hidden combinations: a Vagabond (111 wildcard) can roll passives that never meet on one hero
// otherwise. Some pairs interact in ways the descriptions deliberately don't mention, so players
// only find them late in the game. Keep these out of any text a player can see before hiring their
// first Vagabond (class and passive descriptions, help, applicants of other classes). Text shown only
// for a Vagabond, such as its own hero panel or wield note, may describe them:
// - Martial arts + Dual mastery: bare fists count as dual wielding. They alternate as two strikes
//   at Dual mastery's full doubled pace (2 x 1.5 attacks a second) with its extra damage
//   (engine/stats.ts, `fists`). The hero panel's wield note shows it on such a Vagabond.
export const passives: Record<PassiveKey, PassiveDef> = {
    fury: {key: 'fury', name: 'Fury',
        text: s => `+1 physical damage for every ${n(1 / (FURY_PER_MISSING * s))} missing life and for every ${n(1 / (FURY_PER_MAX * s))} max life.`},
    followThrough: {key: 'followThrough', name: 'Follow-through',
        text: s => `${n(1 + FOLLOW_ACCURACY * s)}x accuracy. When a chain of hits kills its target, the remaining hits carry on to the next monster.`},
    siphonWard: {key: 'siphonWard', name: 'Siphon ward',
        text: s => `${n(1 + SIPHON_WARD * s)}x max ward. Each hit you take restores ${pc(SIPHON_RESTORE * s)} of max ward afterward.`},
    cleave: {key: 'cleave', name: 'Cleave',
        text: s => `Each hit also deals ${pc(CLEAVE_SHARE * s)} of its damage to every other monster.`},
    riposte: {key: 'riposte', name: 'Riposte',
        text: s => `+${pc(RIPOSTE_CRIT * s)} crit chance for each attack you dodged in the last 2 seconds. Crit chance past 100% can crit more than once.`},
    // Only the healing scales; the ward cap stays at twice max ward.
    spellward: {key: 'spellward', name: 'Spellward',
        text: s => `Healing past full HP becomes ward, up to twice max ward. Ward returns to max at the next encounter. Regenerate ${pc(SPELLWARD_HEAL * s)} of your current ward as HP each second.`},
    martialArts: {key: 'martialArts', name: 'Martial arts',
        text: s => `With nothing in either hand (no weapon or shield), attacks add your full core attribute as damage instead of half, attack 1.5 times a second with +${pc(MARTIAL_SPEED_PER_LEVEL * s)} increased attack speed per level, and gain +${pc(MARTIAL_CRIT * s)} crit chance, +${pc(MARTIAL_CRIT_MULTI * s)} crit multiplier and 15% block chance.`},
    dualMastery: {key: 'dualMastery', name: 'Dual mastery',
        text: s => `Dual wielding swings at the full doubled speed instead of 75% of it, and deals ${pc(DUAL_MORE * s)} more damage.`},
    elementalMastery: {key: 'elementalMastery', name: 'Elemental mastery',
        text: s => `${n(1 + ELEMENTAL_MORE * s)}x fire, cold and lightning damage, and monster elemental resistances count as ${pc(ELEMENTAL_PENETRATION * s)} lower against your hits, even below 0.`},
    counterstrike: {key: 'counterstrike', name: 'Counterstrike',
        text: s => `Each blocked hit earns a free attack at ${pc(COUNTER_DAMAGE * s)} damage.`},
    exploit: {key: 'exploit', name: 'Exploit',
        text: s => `Hits deal +${pc(EXPLOIT_PER_AILMENT * s)} damage for each different ailment on the target, up to +${pc(3 * EXPLOIT_PER_AILMENT * s)}. Your burns last twice as long, and your chill and shock can build to 75% instead of 50%.`},
    bloodPact: {key: 'bloodPact', name: 'Blood pact',
        text: s => `You have 5% life leech. Each attack costs 2% of current HP. Life leech heals over 1 second instead of at once. You deal +${pc(BLOOD_PACT_MORE * s)} more damage at 1 HP regenerated per second, leech included, and the bonus doubles each time your regeneration quadruples (+${pc(2 * BLOOD_PACT_MORE * s)} at 4/s, +${pc(10 * BLOOD_PACT_MORE * s)} at 100/s, +${pc(20 * BLOOD_PACT_MORE * s)} at 400/s).`},
    rampage: {key: 'rampage', name: 'Rampage',
        text: s => `+${pc(RAMPAGE_PER_10 * s)} damage and attack speed for every 10 damage taken in the last 4 seconds.`},
    deadeye: {key: 'deadeye', name: 'Deadeye',
        text: s => `All the hits of an attack land as one combined hit, with +${pc(DEADEYE_CRIT_MULTI * s)} crit multiplier. Each hit still rolls its own crit, and if any hit rolls an ailment, the combined hit inflicts it.`},
    hex: {key: 'hex', name: 'Hex',
        text: s => `Monsters deal ${pc(HEX_PER_SECOND * s)} less damage and take ${pc(HEX_PER_SECOND * s)} more for each second of ailments left on them, adding burn, chill and shock. They deal at most 80% less.`},
};

// Blood pact: more damage by the square root of HP regenerated per second (leech included), so the
// bonus doubles each time regeneration quadruples. `scale` is the passive's effect scale.
export function bloodPactBonus(scale: number, regenPerSecond: number): number {
    return BLOOD_PACT_MORE * scale * Math.sqrt(Math.max(0, regenPerSecond));
}

// The passive's effect scale on this hero: 0 without it, else 1 plus its increased effect (an
// enhanced roll's ENHANCED_EFFECT and `increased`, the guild's "increased core passive effect").
export function passiveScale(hero: Pick<Adventurer, 'classKey' | 'passives'>, key: PassiveKey, classPassive: (classKey: string) => PassiveKey | undefined, increased = 0): number {
    const own = hero.passives ?? (classPassive(hero.classKey) ? [{key: classPassive(hero.classKey)!}] : []);
    const found = own.find(p => p.key === key);
    return found ? 1 + increased + (found.enhanced ? ENHANCED_EFFECT : 0) : 0;
}

export function passiveLevel(hero: Pick<Adventurer, 'classKey' | 'passives'>, key: PassiveKey, classPassive: (classKey: string) => PassiveKey | undefined): number {
    const own = hero.passives ?? (classPassive(hero.classKey) ? [{key: classPassive(hero.classKey)!}] : []);
    const found = own.find(p => p.key === key);
    return found ? (found.enhanced ? 2 : 1) : 0;
}

// ---------------- Rare bonus passives ----------------
// Higher-tier recruits of a lower-tier class get a chance at these: one slot per tier the class
// sits below the recruit's tier. A repeat on the same bonus adds another +10%.

export type BonusKey = CoreStat | 'maxHealth' | 'armor' | 'evasion' | 'ward' | 'attackSpeed' | 'critChance' | 'accuracy' | 'damage' | 'lifeRegen' | 'lifeLeech';
export const BONUS_STEP = 0.1;
export const BONUS_SLOT_CHANCE = 0.5;
export const bonusDefs: Record<BonusKey, {label: string, weight: number}> = {
    str: {label: 'Str', weight: 1}, dex: {label: 'Dex', weight: 1}, int: {label: 'Int', weight: 1},
    maxHealth: {label: 'max HP', weight: 1}, armor: {label: 'armor', weight: 1}, evasion: {label: 'evasion', weight: 1}, ward: {label: 'max ward', weight: 1},
    // The strongest per 10%, so they come up half as often.
    attackSpeed: {label: 'attack speed', weight: 0.5}, damage: {label: 'damage', weight: 0.5},
    critChance: {label: 'crit chance', weight: 1}, accuracy: {label: 'accuracy', weight: 1},
    // Life leech matters to few classes, so new applicants don't roll it. Heroes who already have it keep it.
    lifeRegen: {label: 'life regen', weight: 1}, lifeLeech: {label: 'life leech', weight: 0},
};
export const bonusOrder = Object.keys(bonusDefs) as BonusKey[];

// A cursed rare bonus takes this much of the stat away instead of adding BONUS_STEP.
export const CURSE_STEP = 0.2;
// Each curse adds this much increased premium drop chance, up to CURSE_PREMIUM_CAP.
export const CURSE_PREMIUM = 1, CURSE_PREMIUM_CAP = 4;
// Five cursed bonuses turn an applicant into an Empty Vessel.
export const VESSEL_CURSES = 5;

export function bonusMultiplier(hero: Pick<Adventurer, 'bonuses' | 'curses'> | Pick<Applicant, 'bonuses' | 'curses'>, key: BonusKey): number {
    return Math.max(0.1, 1 + BONUS_STEP * (hero.bonuses?.[key] ?? 0) - CURSE_STEP * (hero.curses?.[key] ?? 0));
}
export function curseCount(hero: {curses?: Partial<Record<BonusKey, number>>}): number {
    return Object.values(hero.curses ?? {}).reduce((a, b) => a + (b ?? 0), 0);
}
// Increased premium drop chance from a hero's curses.
export function cursePremium(hero: {curses?: Partial<Record<BonusKey, number>>}): number {
    return Math.min(CURSE_PREMIUM_CAP, CURSE_PREMIUM * curseCount(hero));
}

export function bonusText(bonuses: Partial<Record<BonusKey, number>> | undefined): string[] {
    return bonusOrder.filter(k => bonuses?.[k]).map(k => `×${(1 + BONUS_STEP * bonuses![k]!).toFixed(1)} ${bonusDefs[k].label}`);
}
export function curseText(curses: Partial<Record<BonusKey, number>> | undefined): string[] {
    return bonusOrder.filter(k => curses?.[k]).map(k => `×${Math.max(0.1, 1 - CURSE_STEP * curses![k]!).toFixed(1)} ${bonusDefs[k].label}`);
}

// One roll per slot: half the slots get a bonus. With curseChance (Vagabond's Compass) each bonus
// that comes up may be cursed instead.
export function rollBonuses(slots: number, rng: () => number, curseChance = 0): {bonuses: Partial<Record<BonusKey, number>>, curses: Partial<Record<BonusKey, number>>} {
    const bonuses: Partial<Record<BonusKey, number>> = {};
    const curses: Partial<Record<BonusKey, number>> = {};
    const total = bonusOrder.reduce((sum, k) => sum + bonusDefs[k].weight, 0);
    for (let i = 0; i < slots; i++) {
        if (rng() >= BONUS_SLOT_CHANCE) continue;
        let r = rng() * total;
        const key = bonusOrder.find(k => (r -= bonusDefs[k].weight) < 0) ?? bonusOrder[0];
        const into = curseChance > 0 && rng() < curseChance ? curses : bonuses;
        into[key] = (into[key] ?? 0) + 1;
    }
    return {bonuses, curses};
}
