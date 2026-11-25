import type {Adventurer, Applicant, CoreStat} from '../engine/types';

// Core passives: one rule each class is built around. The 333 class rolls one of them enhanced; the
// 111 wildcard rolls three of them. The runner looks effects up through passiveLevel().

export type PassiveKey = 'fury' | 'followThrough' | 'siphonWard' | 'cleave' | 'riposte' | 'spellward' | 'martialArts' | 'dualMastery' | 'elementalMastery'
    | 'counterstrike' | 'exploit' | 'bloodPact' | 'rampage' | 'deadeye' | 'hex';

export interface PassiveDef {
    key: PassiveKey
    name: string
    description: string
    // The stronger version a 333 class can roll.
    enhanced: string
}

export const passives: Record<PassiveKey, PassiveDef> = {
    fury: {key: 'fury', name: 'Fury',
        description: '+1 physical damage for every 5 missing life.',
        enhanced: '+1 physical damage for every 3 missing life.'},
    followThrough: {key: 'followThrough', name: 'Follow-through',
        description: 'When a chain of hits kills its target, the remaining hits carry on to the next monster.',
        enhanced: 'When a chain of hits kills its target, the remaining hits carry on to the next monster with +50% damage.'},
    siphonWard: {key: 'siphonWard', name: 'Siphon ward',
        description: '1.5x max ward. Each hit you take restores 5% of max ward afterward.',
        enhanced: '1.75x max ward. Each hit you take restores 7.5% of max ward afterward.'},
    cleave: {key: 'cleave', name: 'Cleave',
        description: 'Each hit also deals 30% of its damage to every other monster.',
        enhanced: 'Each hit also deals 50% of its damage to every other monster.'},
    riposte: {key: 'riposte', name: 'Riposte',
        description: '+50% crit chance for each attack you dodged in the last 2 seconds. Crit chance past 100% can crit more than once.',
        enhanced: '+50% crit chance for each attack you dodged in the last 3 seconds. Crit chance past 100% can crit more than once.'},
    spellward: {key: 'spellward', name: 'Spellward',
        description: 'Healing past full HP becomes ward, up to twice max ward. Ward returns to max at the next encounter.',
        enhanced: 'Healing past full HP becomes ward, up to three times max ward. Ward returns to max at the next encounter.'},
    martialArts: {key: 'martialArts', name: 'Martial arts',
        description: 'With nothing in either hand (no weapon or shield), attacks add your full core attribute as damage instead of half, attack 1.5 times a second, and gain +15% crit chance, +50% crit multiplier and 15% block chance.',
        enhanced: 'With nothing in either hand (no weapon or shield), attacks add your full core attribute as damage instead of half, attack 1.5 times a second, and gain +30% crit chance, +100% crit multiplier and 15% block chance.'},
    dualMastery: {key: 'dualMastery', name: 'Dual mastery',
        description: 'Dual wielding swings at the full doubled speed instead of 75% of it, and deals 25% more damage.',
        enhanced: 'Dual wielding swings at the full doubled speed instead of 75% of it, and deals 50% more damage.'},
    elementalMastery: {key: 'elementalMastery', name: 'Elemental mastery',
        description: 'Doubles fire, cold and lightning damage.',
        enhanced: 'Triples fire, cold and lightning damage.'},
    counterstrike: {key: 'counterstrike', name: 'Counterstrike',
        description: 'Each blocked hit earns a free attack at 50% damage.',
        enhanced: 'Each blocked hit earns a free attack at full damage.'},
    exploit: {key: 'exploit', name: 'Exploit',
        description: 'Hits deal +20% damage for each different ailment on the target, up to +60%. Your burns last twice as long, and your chill and shock can build to 75% instead of 50%.',
        enhanced: 'Hits deal +35% damage for each different ailment on the target, up to +105%. Your burns last twice as long, and your chill and shock can build to 75% instead of 50%.'},
    bloodPact: {key: 'bloodPact', name: 'Blood pact',
        description: 'You have 5% life leech. Each attack costs 2% of current HP. Life leech heals over 1 second instead of at once. You deal +10% more damage at 1 HP regenerated per second, leech included, and the bonus doubles each time your regeneration quadruples (+20% at 4/s, +100% at 100/s, +200% at 400/s).',
        enhanced: 'You have 5% life leech. Each attack costs 2% of current HP. Life leech heals over 1 second instead of at once. You deal +15% more damage at 1 HP regenerated per second, leech included, and the bonus doubles each time your regeneration quadruples (+30% at 4/s, +150% at 100/s, +300% at 400/s).'},
    rampage: {key: 'rampage', name: 'Rampage',
        description: '+1% damage and attack speed for every 10 damage taken in the last 4 seconds.',
        enhanced: '+1% damage and attack speed for every 10 damage taken in the last 6 seconds.'},
    deadeye: {key: 'deadeye', name: 'Deadeye',
        description: 'All the hits of an attack land as one combined hit. Each hit still rolls its own crit, and if any hit rolls an ailment, the combined hit inflicts it.',
        enhanced: 'Every attack lands one extra hit, so it never misses entirely. All the hits land as one combined hit; each still rolls its own crit, and if any hit rolls an ailment, the combined hit inflicts it.'},
    hex: {key: 'hex', name: 'Hex',
        description: 'Monsters deal 4% less damage and take 4% more for each second of ailments left on them, adding burn, chill and shock. They deal at most 80% less.',
        enhanced: 'Monsters deal 6% less damage and take 6% more for each second of ailments left on them, adding burn, chill and shock. They deal at most 80% less.'},
};

// Strength of a passive on this hero: 0 = none, 1 = normal, 2 = enhanced.
// Blood pact: more damage by the square root of HP regenerated per second (leech included), so the
// bonus doubles each time regeneration quadruples. Level 2 is the enhanced passive.
export const BLOOD_PACT_STEP = [0, 0.1, 0.15];
export function bloodPactBonus(level: number, regenPerSecond: number): number {
    return (BLOOD_PACT_STEP[level] ?? 0) * Math.sqrt(Math.max(0, regenPerSecond));
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

export function bonusMultiplier(hero: Pick<Adventurer, 'bonuses'> | Pick<Applicant, 'bonuses'>, key: BonusKey): number {
    return 1 + BONUS_STEP * (hero.bonuses?.[key] ?? 0);
}

export function bonusText(bonuses: Partial<Record<BonusKey, number>> | undefined): string[] {
    return bonusOrder.filter(k => bonuses?.[k]).map(k => `×${(1 + BONUS_STEP * bonuses![k]!).toFixed(1)} ${bonusDefs[k].label}`);
}

export function rollBonuses(slots: number, rng: () => number): Partial<Record<BonusKey, number>> {
    const out: Partial<Record<BonusKey, number>> = {};
    const total = bonusOrder.reduce((sum, k) => sum + bonusDefs[k].weight, 0);
    for (let i = 0; i < slots; i++) {
        if (rng() >= BONUS_SLOT_CHANCE) continue;
        let r = rng() * total;
        const key = bonusOrder.find(k => (r -= bonusDefs[k].weight) < 0) ?? bonusOrder[0];
        out[key] = (out[key] ?? 0) + 1;
    }
    return out;
}
