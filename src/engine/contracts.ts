import {encounterLevel, questOrder, quests, questTier} from '../data/quests';
import {PREMIUM_CHANCE, premiumKey, requireMaterial} from '../data/materials';
import {bossAmbitionFor} from './ambitions';
import {isQuestCleared, isQuestUnlocked, setActiveModifiers, getActiveModifiers} from './state';
import type {Adventurer, Contract, GameState, QuestDef} from './types';

// Contracts: "defeat the rare of a quest with these modifiers on". A contract counts only for runs
// started while it is taken, so completing one is always a deliberate choice, never a side effect
// of farming. Completed contracts are replaced; the player can also pay to refresh them.
//
// Personal contracts are pitched at the adventurer's level and pay a named mythic: the reliable
// route to a mythic you want. Guild contracts are pitched at the guild's progress, open to anyone,
// and pay fame and gold.

export const GUILD_CONTRACT_COUNT = 2;

const pick = <T>(list: T[], rng: () => number): T => list[Math.floor(rng() * list.length)];

function finalLevel(quest: QuestDef): number {
    return encounterLevel(quest, quest.encounters.length - 1);
}
function openQuests(state: GameState): QuestDef[] {
    return questOrder.map(k => quests[k]).filter(q => isQuestUnlocked(state, q.key));
}

// Distinct modifiers for a contract, at most one of them elemental.
function rollMods(quest: QuestDef, count: number, rng: () => number, elementalChance: number): string[] {
    const generic = quest.modifiers.filter(m => !m.addedDamage && !m.rite).map(m => m.key);
    const elemental = quest.modifiers.filter(m => m.addedDamage).map(m => m.key);
    const mods: string[] = [];
    if (rng() < elementalChance) mods.push(pick(elemental, rng));
    // Lean on the easier generic modifiers: each is picked from the first few still unused.
    const pool = [...generic];
    while (mods.length < count && pool.length) {
        const i = Math.floor(rng() * Math.min(pool.length, 4));
        mods.push(pool.splice(i, 1)[0]);
    }
    return mods;
}

// The quest whose final encounter is closest under the adventurer's level, with a modifier for
// every four levels they are past it, so the fight stays pitched at their level.
export function rollPersonalContract(state: GameState, adventurer: Adventurer, rng: () => number = Math.random): Contract | undefined {
    const open = openQuests(state);
    if (!open.length) return undefined;
    const fitting = open.filter(q => finalLevel(q) <= adventurer.level + 1);
    const quest = fitting.length ? fitting[fitting.length - 1] : open[0];
    const over = Math.max(0, adventurer.level - finalLevel(quest));
    const count = Math.min(4, 1 + Math.floor(over / 4));
    // Premium at the usual drop chance, rolled now so the contract shows what it will pay.
    const plain = pick(quest.pools.M, rng).material;
    const mythic = !requireMaterial(plain).keyItem && rng() < PREMIUM_CHANCE ? premiumKey(plain) : plain;
    return {id: 'pc' + state.nextId++, questKey: quest.key, mods: rollMods(quest, count, rng, 0.35), reward: {material: mythic, gold: Math.round(40 * quest.basePower)}};
}

export function ensurePersonalContract(state: GameState, adventurer: Adventurer) {
    if (!adventurer.contract) {
        adventurer.contract = rollPersonalContract(state, adventurer);
    }
}

export function personalRefreshCost(adventurer: Adventurer): number {
    return 10 * adventurer.level;
}

export function refreshPersonalContract(state: GameState, adventurer: Adventurer): boolean {
    const cost = personalRefreshCost(adventurer);
    if (state.gold < cost) return false;
    state.gold -= cost;
    if (adventurer.activeContract?.kind === 'personal') adventurer.activeContract = null;
    adventurer.contract = rollPersonalContract(state, adventurer);
    return true;
}

// Guild contracts pay fame, so their difficulty rises with fame: a budget of modifier weight
// (the same weight that sets entry fees) of 1 per 75 fame, less 2 for each step up in quest, so a
// harder quest asks for fewer modifiers. The fame reward stays flat per quest, so contracts pay
// less fame for the effort as the guild grows and can't be ground at a fixed difficulty.
export function guildContractBudget(state: GameState, quest: QuestDef): number {
    const index = questTier(quest.key);
    return Math.max(1, 1 + Math.floor(state.fame / 75) - 2 * index);
}

function rollModsByWeight(quest: QuestDef, budget: number, rng: () => number, elementalChance: number): string[] {
    const usable = quest.modifiers.filter(m => !m.rite);
    const mods: string[] = [];
    let left = budget;
    const elemental = usable.filter(m => m.addedDamage);
    if (rng() < elementalChance && elemental.length) {
        const m = pick(elemental, rng);
        mods.push(m.key);
        left -= m.feeWeight;
    }
    while (left > 0) {
        const options = usable.filter(m => !m.addedDamage && !mods.includes(m.key) && m.feeWeight <= left);
        if (!options.length) break;
        const m = pick(options, rng);
        mods.push(m.key);
        left -= m.feeWeight;
    }
    return mods.length ? mods : rollMods(quest, 1, rng, 0);
}

export function rollGuildContract(state: GameState, rng: () => number = Math.random): Contract | undefined {
    const open = openQuests(state);
    if (!open.length) return undefined;
    // The guild's two highest tiers open so far.
    const tiers = [...new Set(open.map(q => questTier(q.key)))].sort((a, b) => b - a).slice(0, 2);
    const quest = pick(open.filter(q => tiers.includes(questTier(q.key))), rng);
    const index = questTier(quest.key);
    const mods = rollModsByWeight(quest, guildContractBudget(state, quest), rng, 0.6);
    const weight = mods.reduce((sum, k) => sum + (quest.modifiers.find(m => m.key === k)?.feeWeight ?? 1), 0);
    return {
        id: 'gc' + state.nextId++,
        questKey: quest.key,
        mods,
        reward: {fame: [3, 8, 15][index] ?? 15, gold: Math.round(80 * quest.basePower * weight)},
    };
}

export function ensureGuildContracts(state: GameState) {
    state.guildContracts ??= [];
    while (state.guildContracts.length < GUILD_CONTRACT_COUNT) {
        const c = rollGuildContract(state);
        if (!c) break;
        state.guildContracts.push(c);
    }
}

export function guildRefreshCost(contract: Contract): number {
    return Math.round(30 * quests[contract.questKey].basePower);
}

export function refreshGuildContract(state: GameState, id: string): boolean {
    const i = (state.guildContracts ?? []).findIndex(c => c.id === id);
    if (i < 0) return false;
    const cost = guildRefreshCost(state.guildContracts![i]);
    if (state.gold < cost) return false;
    state.gold -= cost;
    for (const a of state.adventurers) {
        if (a.activeContract?.id === id) a.activeContract = null;
    }
    const next = rollGuildContract(state);
    if (next) state.guildContracts![i] = next; else state.guildContracts!.splice(i, 1);
    return true;
}

export function findContract(state: GameState, ref: {kind: 'personal' | 'guild', id: string} | null | undefined, adventurer?: Adventurer): Contract | undefined {
    if (!ref) return undefined;
    if (ref.kind === 'personal') {
        const owner = adventurer && adventurer.contract?.id === ref.id ? adventurer : state.adventurers.find(a => a.contract?.id === ref.id);
        return owner?.contract;
    }
    return state.guildContracts?.find(c => c.id === ref.id);
}

// Who is working on a guild contract right now.
export function contractHolder(state: GameState, id: string): Adventurer | undefined {
    return state.adventurers.find(a => a.activeContract?.id === id);
}

// Takes a contract: sends the adventurer to its quest with its modifiers added to theirs.
export function takeContract(state: GameState, adventurer: Adventurer, kind: 'personal' | 'guild', id: string): Contract | undefined {
    const ref = {kind, id};
    const contract = findContract(state, ref, adventurer);
    if (!contract || !isQuestUnlocked(state, contract.questKey)) return undefined;
    if (kind === 'guild') {
        const holder = contractHolder(state, id);
        if (holder && holder !== adventurer) holder.activeContract = null;
    }
    adventurer.activeContract = ref;
    const quest = quests[contract.questKey];
    const current = getActiveModifiers(state, adventurer, quest);
    setActiveModifiers(adventurer, quest.key, [...new Set([...current, ...contract.mods])]);
    return contract;
}

export function dropContract(adventurer: Adventurer) {
    adventurer.activeContract = null;
}

// Modifiers this adventurer may use on this quest beyond the guild's unlocks: those asked for by
// their taken contract or an unfinished boss ambition.
export function grantedModifiers(state: GameState, adventurer: Adventurer | undefined, questKey: string): string[] {
    if (!adventurer) return [];
    const out: string[] = [];
    const contract = findContract(state, adventurer.activeContract, adventurer);
    if (contract?.questKey === questKey) out.push(...contract.mods);
    // An ambition's modifiers wait for the quest's first full clear, like the quest's own.
    if (isQuestCleared(state, questKey)) out.push(...(bossAmbitionFor(adventurer, questKey)?.mods ?? []));
    return out;
}

export function contractRewardText(contract: Contract): string {
    return [
        contract.reward.material ? requireMaterial(contract.reward.material).name : '',
        contract.reward.fame ? `${contract.reward.fame} fame` : '',
        `${contract.reward.gold} gold`,
    ].filter(Boolean).join(' + ');
}

export function contractText(contract: Contract): string {
    const quest = quests[contract.questKey];
    const names = contract.mods.map(k => quest.modifiers.find(m => m.key === k)?.name ?? k);
    return `Fully clear ${quest.name} with ${names.join(', ')} on`;
}
