import type {AdventurerStats} from './stats';
import type {QuestDef, QuestRule} from './types';

// Area rules: punishing mechanics a whole quest runs under (the tier 5 areas), or that a modifier
// adds. Stacks (Corrosion, Karma) live on the run, so they carry across every encounter of a run
// and reset when the next run starts.

// Corrosion: a hit the hero takes (blocked hits don't count) may add a stack, each lowering evasion,
// armor, max ward, block chance and resistances by 1% of their value, adding up. The chance to add
// one is 1 - stacks / CORROSION_MAX, so stacks slow as they build and stop at CORROSION_MAX.
export const CORROSION_PER_STACK = 0.01;
export const CORROSION_MAX = 100;
export function corrosionStackChance(stacks: number): number {
    return Math.max(0, 1 - stacks / CORROSION_MAX);
}
// Karma: every hit the hero deals, killing blows included, adds a stack. Each stack deals this much
// physical damage a second to the hero. Armor reduces it; it can't be blocked or evaded.
export const KARMA_DPS = 10;
// Reflect: this share of every hit the hero deals comes back as a hit on the hero, in the same
// damage types. The hero's evasion is checked against their own accuracy (one roll, no chains),
// then block, armor and resistances apply as for a monster's hit.
export const REFLECT_SHARE = 0.05;

export const ruleInfo: Record<QuestRule, {name: string, text: string}> = {
    corrosion: {name: 'Corrosion', text: `Hits you take (not blocked) have a chance to add a stack of Corrosion for the rest of the run. Each stack lowers evasion, armor, max ward, block chance and resistances by ${100 * CORROSION_PER_STACK}%.`},
    karma: {name: 'Karma', text: `Every hit you deal, killing blows included, adds a stack of Karma for the rest of the run. Each stack deals ${KARMA_DPS} physical damage a second to you: armor reduces it, but it can't be blocked or evaded.`},
    reflect: {name: 'Reflection', text: `${100 * REFLECT_SHARE}% of the damage of every hit you deal is reflected back at you as a hit of the same damage types. Your evasion rolls against your own accuracy, then block, armor and resistances apply.`},
    noRecovery: {name: 'Lifeless', text: 'You recover no life or ward during a run: no regen, leech, life on hit or life after encounters, and ward doesn\'t refill between encounters or from any effect. You start the run with full life and ward.'},
};

// Rules in force: the quest's own, its modifiers', and a rite's schedule at this encounter. During
// the rite's boss fight, its phase (set by the boss's remaining life) replaces the schedule.
export function activeRules(quest: QuestDef, modifiers: QuestDef['modifiers'] = [], encounterIndex = 0, bossLife?: number): Set<QuestRule> {
    const rules = new Set<QuestRule>(quest.rules ?? []);
    for (const m of modifiers) {
        for (const r of m.rules ?? []) rules.add(r);
        if (!m.rite) continue;
        if (bossLife !== undefined) {
            for (const r of ritePhase(m.rite, bossLife)) rules.add(r);
            continue;
        }
        const step = m.rite.schedule.filter(s => s.from <= encounterIndex).pop();
        for (const r of step?.rules ?? []) rules.add(r);
    }
    return rules;
}

// The rite boss's rules at this share of its life: one phase per quarter, from full life down.
export function ritePhase(rite: NonNullable<QuestDef['modifiers'][number]['rite']>, life: number): QuestRule[] {
    const index = Math.min(rite.bossPhases.length - 1, Math.floor((1 - Math.max(0, Math.min(1, life))) * rite.bossPhases.length));
    return rite.bossPhases[Math.max(0, index)];
}

export function corrosionFactor(stacks: number): number {
    return Math.max(0, 1 - CORROSION_PER_STACK * stacks);
}

// The hero's stats with Corrosion's stacks applied.
export function corrode(stats: AdventurerStats, stacks: number): AdventurerStats {
    if (stacks <= 0) return stats;
    const f = corrosionFactor(stacks);
    const resist = {...stats.resist};
    for (const [e, v] of Object.entries(stats.resist) as [keyof AdventurerStats['resist'], number][]) resist[e] = v > 0 ? v * f : v;
    return {...stats, evasion: stats.evasion * f, armor: stats.armor * f, maxWard: stats.maxWard * f, blockChance: stats.blockChance * f, resist};
}
