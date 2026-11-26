import {challengeModifier, TRIAL_STEP, trialKey, VOID_KEY} from '../data/modifiers';
import {trophyTotal} from '../data/trophies';
import {bloodPactBonus, cursePremium, CLEAVE_SHARE, COUNTER_DAMAGE, EXPLOIT_PER_AILMENT, FURY_PER_MISSING, HEX_PER_SECOND, passiveLevel, RAMPAGE_PER_10, RIPOSTE_CRIT, SIPHON_RESTORE, SPELLWARD_HEAL, type PassiveKey} from '../data/passives';
import {isPremium, PREMIUM_CHANCE, premiumKey, requireMaterial} from '../data/materials';
import {kitHit, monsterKit, nextAbility, type KitEntry} from './abilities';
import {campaignScale, classPassive, encounterLevel, encounterPower, questXpLevel, ENDLESS_PATTERN, xpMultiplier, EVASION_GROWTH, ACCURACY_GROWTH, monsterBaseline, monsters, questOrder, quests, endlessKey, questTier} from '../data/quests';
import {trophyGoldXp} from '../data/trophies';
import {addLog, addMaterial, getActiveModifiers, getQuestProgress, isQuestUnlocked} from './state';
import {bossAmbitionFor, records} from './ambitions';
import {findContract, rollGuildContract, rollPersonalContract} from './contracts';
import {applyMods} from './mods';
import {ailmentSeconds, BLEED_SECONDS, MIN_DOT_DPS, BLIND_CAP, blindFactor, tickBleed, BURN_SECONDS, CHILL_CAP, SHOCK_CAP, SNARE_CAP, WEAKEN_CAP, weakenFactor, GALE_CAP, SUNDER_CAP, galeFactor, sunderFactor, inflict, shockFactor, slowFactor, tickAilments, type AilmentBonus} from './ailments';
import {armorReduce, exposedEvasion, getCachedStats, hitChance, invalidateStats, levelCap, mitigateByType, mitigateDamage, penetrate, rollCritLevels, rollHits, totalXpForLevel} from './stats';
import {activeRules, corrode, corrosionFactor, corrosionStackChance, KARMA_DPS, REFLECT_SHARE} from './rules';
// The takenBy key for reflected damage (monster keys never start with a colon).
export const REFLECT_SOURCE = ':reflect';
import {levelUpRestock} from './shop';
import {isPortalQuest, openPortal, PORTAL_SECONDS} from './portal';
import type {AbilityAilment, AbilityEffect, Adventurer, DamageMap, DamageType, Element, GameState, MonsterModStat, MonsterState, PoolEntry, QuestDef, QuestModifierDef, RewardBonuses, RunRecord, RunStats, StatKey, Tier} from './types';

// Combat runs in fixed ticks; rendering runs on its own loop.
export const TICK_SECONDS = 1 / 60;

export type Rng = () => number;

export function assignQuest(state: GameState, adventurer: Adventurer, questKey: string) {
    if (!isQuestUnlocked(state, questKey)) {
        return;
    }
    const wasAssigned = adventurer.assignment?.questKey;
    adventurer.assignment = {questKey};
    if (adventurer.activity.kind === 'idle') {
        startRun(state, adventurer);
    } else if (adventurer.activity.kind === 'traveling' && wasAssigned !== questKey) {
        // Turn around and head out to the new quest instead.
        adventurer.activity = {kind: 'idle'};
        startRun(state, adventurer);
    } else if (adventurer.activity.kind === 'fighting' && wasAssigned !== questKey) {
        // Leave the current quest and rest before starting the new one.
        startRest(state, adventurer, adventurer.activity.questKey, false);
    }
}

export function recall(state: GameState, adventurer: Adventurer) {
    adventurer.assignment = null;
    if (adventurer.activity.kind === 'traveling') {
        adventurer.activity = {kind: 'idle'};
    } else if (adventurer.activity.kind === 'fighting') {
        startRest(state, adventurer, adventurer.activity.questKey, false);
    }
}

// How a finished run ended, in a few words.
export function runOutcome(run: RunRecord): string {
    const quest = quests[run.questKey];
    if (run.defeatedAt !== undefined) return `defeated at encounter ${run.defeatedAt + 1}`;
    if (quest && run.cleared >= quest.encounters.length - 1) return 'full clear';
    return run.cleared >= 0 ? `turned back after encounter ${run.cleared + 1}` : 'turned back';
}

export function getStopAt(adventurer: Adventurer, questKey: string): number {
    const last = quests[questKey].encounters.length - 1;
    return Math.min(adventurer.stopPoints?.[questKey] ?? last, last);
}

// Sets where this adventurer turns back on a quest. Also applies to a run in progress.
export function setStopAt(adventurer: Adventurer, questKey: string, index: number) {
    adventurer.stopPoints = {...adventurer.stopPoints, [questKey]: index};
    if (adventurer.run?.questKey === questKey) {
        adventurer.run.stopAt = index;
    }
}

function startRun(state: GameState, adventurer: Adventurer) {
    if (!adventurer.assignment) {
        adventurer.activity = {kind: 'idle'};
        return;
    }
    const quest = quests[adventurer.assignment.questKey];
    const progress = getQuestProgress(state, quest.key);
    const modifiers = getActiveModifiers(state, adventurer, quest);
    const fee = getEntryFee(quest, modifiers);
    if (state.gold < fee) {
        adventurer.activity = {kind: 'idle', reason: `Needs ${fee} gold for the entry fee`};
        return;
    }
    state.gold -= fee;
    progress.runs++;
    const previous = adventurer.run?.questKey === quest.key ? adventurer.run.number : 0;
    if (adventurer.run?.stats) {
        adventurer.previousRunStats = adventurer.run.stats;
        adventurer.previousRun = {questKey: adventurer.run.questKey, number: adventurer.run.number, outcome: runOutcome(adventurer.run)};
    }
    adventurer.run = {questKey: quest.key, number: previous + 1, cleared: -1, stopAt: getStopAt(adventurer, quest.key), loot: {}, gold: 0, xp: 0, fee, modifiers};
    const challenge = challengeKeys(state, adventurer, quest);
    if (challenge.length) adventurer.run.challenge = challenge;
    // A taken contract for this quest rides along with the run.
    const contract = findContract(state, adventurer.activeContract, adventurer);
    if (contract?.questKey === quest.key && adventurer.activeContract) {
        adventurer.run.contract = {...adventurer.activeContract};
    }
    if (quest.travelSeconds > 0) {
        adventurer.activity = {kind: 'traveling', questKey: quest.key, remaining: quest.travelSeconds, total: quest.travelSeconds};
    } else {
        startEncounter(state, adventurer, quest, 0);
    }
}

export interface MonsterStats {
    name: string
    hp: number
    // Total damage per hit, split by damageTypes.
    damage: number
    damageTypes: DamageMap
    attacksPerSecond: number
    armor: number
    accuracy: number
    evasion: number
    resist: Partial<Record<Element, number>>
    // The share of `damage` that is the monster's own hit, and what quest modifiers add on top as
    // shares of `damage`, so abilities can carry their own types and still get the added damage.
    baseShare: number
    addedTypes: DamageMap
}

// Damage ladder: within a quest, the biggest uncommon hit should be about 1/HIT_STEP of the boss's
// biggest hit, and the biggest common hit about 1/HIT_STEP of that, so the
// fights leading up to the boss already hit about as hard as it suggests. Commons and uncommons
// that fall short deal more damage, ramping in from the first encounter (unchanged) to the full
// raise at the last uncommon. Nothing is ever lowered, and bosses, ambition bosses and endless
// quests are left as they are.
export const HIT_STEP = 1.5;
const damageScaleCache = new Map<string, number[]>();
function topHit(quest: QuestDef, index: number, key: string): number {
    const s = getMonsterStats(quest, index, key, [], false);
    return Math.max(0, ...(monsterKit(key) ?? []).map(k => s.damage * s.baseShare * kitHit(k) * (k.damage ?? 1) * (k.hits ?? 1)));
}
export function encounterDamageScale(quest: QuestDef, index: number): number {
    if (quest.endless) return 1;
    let scales = damageScaleCache.get(quest.key);
    if (!scales) {
        const enc = quest.encounters;
        const tops = enc.map((e, i) => Math.max(...e.monsters.map(m => topHit(quest, i, m))));
        const lastU = enc.map(e => e.tier).lastIndexOf('U');
        const boss = enc.map(e => e.tier).lastIndexOf('R');
        const ramp = (i: number) => lastU > 0 ? Math.min(1, i / lastU) : 1;
        // The raise that brings this tier's biggest (ramped) hit up to `target`, found by bisection.
        const solve = (tier: string, upTo: number, target: number): number => {
            const idx = enc.map((e, i) => e.tier === tier && i < upTo ? i : -1).filter(i => i >= 0);
            const best = (f: number) => Math.max(0, ...idx.map(i => tops[i] * (1 + (f - 1) * ramp(i))));
            if (!idx.length || best(1) >= target) return 1;
            let lo = 1, hi = 1;
            while (best(hi) < target && hi < 64) hi *= 2;
            for (let k = 0; k < 40; k++) { const mid = (lo + hi) / 2; if (best(mid) < target) lo = mid; else hi = mid; }
            return hi;
        };
        const fU = boss >= 0 ? solve('U', enc.length, tops[boss] / HIT_STEP) : 1;
        const maxU = Math.max(0, ...enc.map((e, i) => e.tier === 'U' ? tops[i] * (1 + (fU - 1) * ramp(i)) : 0));
        // Commons after the last uncommon count too, so none of them outhits the uncommons.
        const fC = lastU >= 0 ? solve('C', boss >= 0 ? boss : enc.length, maxU / HIT_STEP) : 1;
        scales = enc.map((e, i) => e.tier === 'U' ? 1 + (fU - 1) * ramp(i) : e.tier === 'C' ? 1 + (fC - 1) * ramp(i) : 1);
        damageScaleCache.set(quest.key, scales);
    }
    return scales[index] ?? 1;
}

// Life raise: commons and uncommons have COMMON_HP_SCALE times their life, so the fights before the
// boss take longer, and each quest's legendary (ambition) boss has LEGENDARY_HP_SCALE times its own,
// to stand further above the rare boss. Bramble Road eases in from 1x at its first encounter to the
// full raise at its last common. Rare encounters, rite bosses, summons and endless are unchanged.
export const COMMON_HP_SCALE = 2;
export const LEGENDARY_HP_SCALE = 2;
export function encounterHpScale(quest: QuestDef, index: number, monsterKey: string): number {
    if (quest.endless) return 1;
    if (quest.boss?.monster === monsterKey) return LEGENDARY_HP_SCALE;
    const tier = quest.encounters[index]?.tier;
    if (tier !== 'C' && tier !== 'U') return 1;
    if (quest.key !== 'brambleRoad') return COMMON_HP_SCALE;
    const lastC = quest.encounters.map(e => e.tier).lastIndexOf('C');
    return 1 + (COMMON_HP_SCALE - 1) * Math.min(1, index / Math.max(1, lastC));
}

// The average monster hit (before the hero's defenses) across every quest encounter within a level
// of the given hero level, or the nearest level that has any. For the armor estimate on the hero
// panel.
// One monster's average attack: abilities land once every `every` attacks, basics take the rest.
// hit is one hit's damage (before the hero's defenses); accuracy includes each attack's own factor.
function averageAttack(quest: QuestDef, index: number, key: string): {hit: number, accuracy: number} {
    const s = getMonsterStats(quest, index, key);
    const kit = (monsterKit(key) ?? []).filter(k => kitHit(k) > 0);
    if (!kit.length) return {hit: s.damage, accuracy: s.accuracy};
    const abilities = kit.filter(k => !k.basic), basics = kit.filter(k => k.basic);
    const abilityShare = Math.min(1, abilities.reduce((sum, k) => sum + 1 / Math.max(1, k.every), 0));
    // Each entry's weight: its share of attacks.
    const weighted = [
        ...abilities.map(k => ({k, w: 1 / Math.max(1, k.every)})),
        ...basics.map(k => ({k, w: (1 - abilityShare) / basics.length})),
    ];
    const total = weighted.reduce((sum, e) => sum + e.w, 0) || 1;
    const avg = (f: (k: KitEntry) => number) => weighted.reduce((sum, e) => sum + e.w * f(e.k), 0) / total;
    return {hit: avg(k => s.damage * s.baseShare * kitHit(k) * (k.damage ?? 1)), accuracy: avg(k => s.accuracy * (k.accuracy ?? 1))};
}
// The average monster attack across every quest encounter within a level of the given hero level,
// or the nearest level that has any. For the armor and evasion estimates on the hero panel.
const typicalCache = new Map<number, {hit: number, accuracy: number}>();
export function typicalAttack(level: number): {hit: number, accuracy: number} {
    const cached = typicalCache.get(level);
    if (cached) return cached;
    const all: {level: number, hit: number, accuracy: number}[] = [];
    for (const key of questOrder) {
        const quest = quests[key];
        if (quest.endless || quest.portal) continue;
        quest.encounters.forEach((e, i) => {
            for (const m of e.monsters) all.push({level: encounterLevel(quest, i), ...averageAttack(quest, i, m)});
        });
    }
    const off = (l: number) => Math.max(0, Math.abs(l - level) - 1);
    const gap = Math.min(...all.map(a => off(a.level)));
    const near = all.filter(a => off(a.level) === gap);
    const n = Math.max(1, near.length);
    const out = {hit: near.reduce((sum, a) => sum + a.hit, 0) / n, accuracy: near.reduce((sum, a) => sum + a.accuracy, 0) / n};
    typicalCache.set(level, out);
    return out;
}

// Bramble Road eases in: its first encounter's monsters have half the accuracy, damage and attack
// speed, rising evenly to full by its final encounter. (Heroes have no base evasion, so a fresh hero's evasion
// is little more than their DEX.)
export const OPENING_SCALE = 0.5;
export function openingScale(quest: QuestDef, index: number, monsterKey: string): number {
    if (quest.key !== 'brambleRoad' || quest.boss?.monster === monsterKey) return 1;
    const last = quest.encounters.length - 1;
    return OPENING_SCALE + (1 - OPENING_SCALE) * Math.min(1, index / Math.max(1, last));
}

export function getMonsterStats(quest: QuestDef, encounterIndex: number, monsterKey: string, modifierKeys: string[] = [], ladder = true): MonsterStats {
    const power = encounterPower(quest, encounterIndex);
    const def = monsters[monsterKey];
    const mods = getModifierDefs(quest, modifierKeys);
    const mod = (stat: MonsterModStat, base: number) => applyMods(base, mods.map(m => m.monster[stat]));
    // Ambition bosses are tuned on their own, against the quest's own final monster.
    const scale = quest.boss?.monster === monsterKey || mods.some(m => m.rite?.boss === monsterKey) ? 1 : quest.monsterScale ?? 1;
    // Rare encounters (and the boss fights held there) are never raised.
    // The ladder is solved on unscaled damage; the opening ease-in applies on top of it.
    const ladderScale = ladder ? encounterDamageScale(quest, encounterIndex) * openingScale(quest, encounterIndex, monsterKey) : 1;
    const campaign = campaignScale(quest);
    const damage = monsterBaseline.damage * power * def.damage * scale * ladderScale * campaign.damage;
    // Added elemental damage is a share of the base hit, on top of it.
    const shares: DamageMap = {...(def.damageTypes ?? {physical: 1})};
    let added = 0;
    const addedTypes: DamageMap = {};
    for (const m of mods) {
        for (const [element, share] of Object.entries(m.addedDamage ?? {}) as [Element, number][]) {
            shares[element] = (shares[element] ?? 0) + share;
            addedTypes[element] = (addedTypes[element] ?? 0) + share;
            added += share;
        }
    }
    const total = 1 + added;
    for (const type of Object.keys(shares) as DamageType[]) {
        shares[type] = shares[type]! / total;
    }
    return {
        name: def.name,
        hp: Math.round(mod('hp', monsterBaseline.hp * power * def.hp * scale * encounterHpScale(quest, encounterIndex, monsterKey) * campaign.hp)),
        damage: mod('damage', damage) * total,
        damageTypes: shares,
        attacksPerSecond: mod('attacksPerSecond', def.attacksPerSecond * openingScale(quest, encounterIndex, monsterKey)),
        armor: mod('armor', monsterBaseline.armor * power * def.armor),
        accuracy: mod('accuracy', monsterBaseline.accuracy * Math.pow(power, ACCURACY_GROWTH) * (def.accuracy ?? 1) * openingScale(quest, encounterIndex, monsterKey)),
        // Evasion grows slower than power so hero accuracy keeps up and multihits stay in reach.
        evasion: mod('evasion', monsterBaseline.evasion * Math.pow(power, EVASION_GROWTH) * (def.evasion ?? 1)),
        resist: monsterResist(def.resist, mods),
        baseShare: 1 / total,
        addedTypes: Object.fromEntries(Object.entries(addedTypes).map(([k, v]) => [k, v! / total])),
    };
}

// Monster resistances: their own plus what modifiers add, each capped at MONSTER_RESIST_CAP (heroes
// cap at RESIST_CAP, 75%).
export const MONSTER_RESIST_CAP = 0.9;
function monsterResist(own: Partial<Record<Element, number>> | undefined, mods: QuestModifierDef[]): Partial<Record<Element, number>> {
    const out: Partial<Record<Element, number>> = {...own};
    for (const m of mods) for (const [e, v] of Object.entries(m.resist ?? {}) as [Element, number][]) out[e] = (out[e] ?? 0) + v;
    for (const e of Object.keys(out) as Element[]) out[e] = Math.min(MONSTER_RESIST_CAP, out[e]!);
    return out;
}

export function getModifierDefs(quest: QuestDef, keys: string[]): QuestModifierDef[] {
    return keys.map(k => quest.modifiers.find(m => m.key === k) ?? challengeModifier(k)).filter((m): m is QuestModifierDef => !!m);
}

// A run's modifiers plus its challenges (Endless trial, Void), for monster stats and rewards. The
// challenges never count as modifiers (trophy tiers, XP, contracts).
export function fightKeys(run: RunRecord | undefined): string[] {
    return [...(run?.modifiers ?? []), ...(run?.challenge ?? [])];
}

// Endless trial levels the guild has opened on a quest: one per 20 Endless encounters cleared there,
// once its banner is earned.
export function trialMax(state: GameState, questKey: string): number {
    if ((state.trophies?.['endless-' + questKey] ?? -1) < 0) return 0;
    return Math.floor(((state.questProgress[endlessKey(questKey)]?.bestEncounter ?? -1) + 1) / TRIAL_STEP);
}
export function trialLevel(state: GameState, hero: Adventurer | undefined, questKey: string): number {
    return Math.max(0, Math.min(trialMax(state, questKey), hero?.trials?.[questKey] ?? 0));
}
// The challenges a run on this quest takes on: the hero's Endless trial level, and the Void while the
// Empty Vessel's stone is in a trophy slot and covers this quest's campaign tier.
export function challengeKeys(state: GameState, hero: Adventurer | undefined, quest: QuestDef): string[] {
    if (quest.endless) return [];
    const out: string[] = [];
    const trial = trialLevel(state, hero, quest.key);
    if (trial > 0) out.push(trialKey(trial));
    if (questTier(quest.key) < trophyTotal(state, 'voidTier')) out.push(VOID_KEY);
    return out;
}

// Sums the bonuses from every source. Only quest modifiers for now; guild, trophy and gear bonuses
// will add to the same bag.
export function getRewardBonuses(quest: QuestDef, modifierKeys: string[]): RewardBonuses {
    const total: RewardBonuses = {extraRewardChance: 0, rarityUpgradeChance: 0, bonusRareChance: 0, goldXpMultiplier: 1};
    for (const m of getModifierDefs(quest, modifierKeys)) {
        total.extraRewardChance! += m.bonuses.extraRewardChance ?? 0;
        total.rarityUpgradeChance! += m.bonuses.rarityUpgradeChance ?? 0;
        total.bonusRareChance! += m.bonuses.bonusRareChance ?? 0;
        total.goldXpMultiplier! *= m.bonuses.goldXpMultiplier ?? 1;
        total.premiumChance = (total.premiumChance ?? 0) + (m.bonuses.premiumChance ?? 0);
    }
    return total;
}

// Entry fee: the quest's own fee, plus one fee step per point of modifier weight.
export function getEntryFee(quest: QuestDef, modifierKeys: string[]): number {
    const weight = getModifierDefs(quest, modifierKeys).reduce((sum, m) => sum + m.feeWeight, 0);
    return quest.entryFee + weight * Math.round(5 * quest.basePower);
}

function splitDamage(total: number, shares: DamageMap): DamageMap {
    const out: DamageMap = {};
    for (const [type, share] of Object.entries(shares) as [DamageType, number][]) {
        out[type] = total * share;
    }
    return out;
}

// The monsters an encounter starts with: each one twice under a duplicating modifier.
export function encounterLineup(quest: QuestDef, index: number, modifierKeys: string[] = []): string[] {
    const base = quest.encounters[index].monsters;
    return getModifierDefs(quest, modifierKeys).some(m => m.duplicate) ? base.flatMap(k => [k, k]) : [...base];
}

// Seconds at the start of each encounter before anyone acts, while the battle view plays the
// monsters' (and on a run's first encounter the hero's) entrance. Game time, so it scales with speed.
export const ENTRANCE_SECONDS = 0.85;

// Randomness for starting cooldowns, set by the tick so seeded sims stay seeded.
let encounterRng: Rng = Math.random;

function startEncounter(state: GameState, adventurer: Adventurer, quest: QuestDef, index: number, bonus = false, boss?: string) {
    const progress = getQuestProgress(state, quest.key);
    if (!quest.endless && !progress.seen.includes(index)) {
        progress.seen.push(index);
    }
    // The quest panel shows the legendary encounter once someone has fought it, win or lose.
    if (boss && boss === quest.boss?.monster) progress.bossFought = true;
    const lineup = boss ? [boss] : encounterLineup(quest, index, adventurer.run?.modifiers);
    const monsterStates: MonsterState[] = lineup.map(key => {
        const stats = getMonsterStats(quest, index, key, fightKeys(adventurer.run));
        // Each fighter's first attack comes after a random part of its usual cooldown, so who
        // strikes first varies and attacks don't line up.
        return {key, hp: stats.hp, maxHp: stats.hp, cooldown: encounterRng() / stats.attacksPerSecond};
    });
    monsterStates.forEach((m, slot) => { m.slot = slot; });
    const stats = getCachedStats(state, adventurer);
    // Lifeless: ward is only full at the start of the run.
    const lifeless = activeRules(quest, getModifierDefs(quest, adventurer.run?.modifiers ?? []), index).has('noRecovery');
    if (!lifeless || (index === 0 && !bonus && !boss)) adventurer.ward = corrode(stats, adventurer.run?.corrosion ?? 0).maxWard;
    adventurer.activity = {kind: 'fighting', questKey: quest.key, encounterIndex: index, monsters: monsterStates, cooldown: encounterRng() / stats.attacksPerSecond, lineup, entrance: ENTRANCE_SECONDS, ...(bonus ? {bonus} : {}), ...(boss ? {boss} : {})};
}

function startRest(state: GameState, adventurer: Adventurer, questKey: string, defeated: boolean) {
    const stats = getCachedStats(state, adventurer);
    adventurer.hp = Math.max(0, adventurer.hp);
    adventurer.activity = {kind: 'resting', questKey, remaining: getRestSeconds(stats.maxHealth, adventurer.hp, defeated), defeated};
}

// Returns the HP actually restored.
function heal(adventurer: Adventurer, maxHealth: number, amount: number): number {
    if (amount > 0 && adventurer.hp > 0) {
        const before = adventurer.hp;
        adventurer.hp = Math.min(maxHealth, adventurer.hp + amount);
        return Math.max(0, adventurer.hp - before);
    }
    return 0;
}

export function emptyRunStats(): RunStats {
    return {
        fightSeconds: 0, kills: 0, attacks: 0, attacksLanded: 0, hits: 0, crits: 0, dealt: {},
        incomingAttacks: 0, attacksDodged: 0, incomingHits: 0, blocks: 0, taken: {}, wardAbsorbed: 0,
        preventedArmor: 0, preventedResist: 0, preventedBlock: 0,
        healed: {regen: 0, leech: 0, onHit: 0, encounter: 0}, wardGained: 0, lowestHp: 1,
    };
}
// The tallies for the run this fight belongs to, if any.
function runStats(adventurer: Adventurer, questKey: string): RunStats | undefined {
    const run = adventurer.run;
    if (!run || run.questKey !== questKey) return undefined;
    run.stats ??= emptyRunStats();
    return run.stats;
}
const elementsOf = (damage: DamageMap) => (['fire', 'cold', 'lightning'] as Element[]).filter(e => damage[e]);
// Adds a split of damage to a tally, scaled so its parts sum to total.
function addDamage(target: DamageMap, parts: DamageMap, total: number) {
    const sum = Object.values(parts).reduce((a, b) => a + (b ?? 0), 0);
    if (sum <= 0 || total <= 0) return;
    for (const [type, value] of Object.entries(parts) as [DamageType, number][]) {
        target[type] = (target[type] ?? 0) + value * total / sum;
    }
}

// A rest refills max HP / 15 each second. Life regen adds to that, so the rest runs faster.
// Low-level heroes recover faster: rests and defeat recovery take 20% of the usual time at
// level 1, rising evenly to the full time at level 10.
export const FAST_REST_LEVEL = 10;
export function restDurationScale(level: number): number {
    return Math.min(1, 0.2 + 0.8 * Math.max(0, level - 1) / (FAST_REST_LEVEL - 1));
}
export function restSpeed(maxHealth: number, lifeRegen: number, level: number): number {
    return (1 + Math.max(0, lifeRegen) * 15 / Math.max(1, maxHealth)) / restDurationScale(level);
}

export function getRestSeconds(maxHealth: number, hp: number, defeated: boolean): number {
    // A full rest from 0 HP takes 15 seconds. Defeat doubles it and adds 10 seconds.
    const base = 15 * (maxHealth - hp) / maxHealth;
    return defeated ? base * 2 + 10 : base;
}

export function getRecoverCost(state: GameState, adventurer: Adventurer): number {
    if (adventurer.activity.kind !== 'resting') {
        return 0;
    }
    // Adventurers recover at the guild hall, so the cost depends only on time left and level.
    // Scaling with level keeps paying to skip rests a real cost as characters grow.
    const stats = getCachedStats(state, adventurer);
    const secondsLeft = adventurer.activity.remaining / restSpeed(stats.maxHealth, stats.lifeRegen * (1 + (stats.gear.increasedRecovery ?? 0)), adventurer.level);
    return Math.max(1, Math.ceil(secondsLeft * 0.4 * adventurer.level));
}

// Gold auto recover may spend: a share of what the last run earned after its entry fee, so it can
// never spend more than the run brought in.
export function getAutoRecoverBudget(adventurer: Adventurer): number {
    const share = adventurer.autoRecover ?? 0;
    const run = adventurer.run;
    if (!share || !run) {
        return 0;
    }
    return Math.floor(share * Math.max(0, run.gold - (run.fee ?? quests[run.questKey].entryFee)));
}

export function recoverInstantly(state: GameState, adventurer: Adventurer): boolean {
    const cost = getRecoverCost(state, adventurer);
    if (adventurer.activity.kind !== 'resting' || state.gold < cost) {
        return false;
    }
    state.gold -= cost;
    adventurer.activity.remaining = 0;
    return true;
}

function rollPool(pool: PoolEntry[], rng: Rng): {entry: PoolEntry, amount: number} {
    const total = pool.reduce((sum, e) => sum + e.weight, 0);
    let roll = rng() * total;
    for (const entry of pool) {
        roll -= entry.weight;
        if (roll < 0) {
            return {entry, amount: entry.min + Math.floor(rng() * (entry.max - entry.min + 1))};
        }
    }
    const entry = pool[pool.length - 1];
    return {entry, amount: entry.min};
}

function gainXp(state: GameState, adventurer: Adventurer, xp: number): boolean {
    adventurer.xp += xp;
    let leveled = false;
    while (adventurer.level < levelCap && adventurer.xp >= totalXpForLevel(adventurer.level + 1)) {
        const before = getCachedStats(state, adventurer).maxHealth;
        adventurer.level++;
        invalidateStats();
        adventurer.hp += getCachedStats(state, adventurer).maxHealth - before;
        leveled = true;
    }
    // A level up restocks this member's merchant stock for the new level (it rolls when next seen),
    // unless the merchant is open (see levelUpRestock).
    if (leveled) levelUpRestock(state, adventurer.id);
    return leveled;
}

export interface EncounterReward {
    xp: number
    gold: number
    material: string
    amount: number
    tier: Tier
}

// Drops the UI may want to announce. The engine only records them; main.ts drains and shows them.
export interface DropEvent {
    material: string
    tier: Tier
    questKey: string
    // First time this material was ever obtained.
    first: boolean
    legendary?: boolean
    premium?: boolean
    // Owned after this drop.
    owned: number
}
const dropEvents: DropEvent[] = [];
export function drainDropEvents(): DropEvent[] {
    return dropEvents.splice(0);
}

// Testing tool: grants one random material from any quest's pool of this rarity, as a real drop would.
export function devDrop(state: GameState, tier: Tier) {
    const options = questOrder.flatMap(q => quests[q].pools[tier].map(entry => ({questKey: q, material: entry.material})));
    if (!options.length) {
        return;
    }
    const pick = options[Math.floor(Math.random() * options.length)];
    const first = !((state.obtained[pick.material] ?? 0) > 0);
    addMaterial(state, pick.material, 1);
    dropEvents.push({material: pick.material, tier, questKey: pick.questKey, first, owned: state.materials[pick.material] ?? 0});
}

// Testing tool: grants the premium version of one random material from any quest's pool.
export function devPremiumDrop(state: GameState) {
    const options = questOrder.flatMap(q => (['C', 'U', 'R'] as Tier[]).flatMap(t => quests[q].pools[t].map(entry => ({questKey: q, material: premiumKey(entry.material), tier: t}))));
    const pick = options[Math.floor(Math.random() * options.length)];
    if (!pick) return;
    const first = !((state.obtained[pick.material] ?? 0) > 0);
    addMaterial(state, pick.material, 1);
    dropEvents.push({material: pick.material, tier: pick.tier, questKey: pick.questKey, first, owned: state.materials[pick.material] ?? 0, premium: true});
}

// Combat moments for the combat view: each swing, hit, miss and block. The engine only records them.
export interface CombatEvent {
    adventurerId: string
    // 'hero' = something happened to the adventurer; 'monster' = to the monster in that slot.
    side: 'hero' | 'monster'
    slot: number
    // 'cast': a monster uses a named ability (sent before its hits); 'ailment': an ability applied
    // an ailment outright.
    kind: 'hit' | 'miss' | 'block' | 'cast' | 'ailment'
    ability?: string
    effect?: AbilityEffect
    spell?: boolean
    // The effect plays on the caster (a heal, a rally), drawn at this scale.
    onSelf?: boolean
    fxScale?: number
    ailment?: AbilityAilment
    // Damage after mitigation. For the hero, what reached HP; ward is what the ward soaked.
    amount?: number
    ward?: number
    critLevels?: number
    // Which hit of a multihit attack this was, from 0.
    hitIndex?: number
    damageType?: DamageType
    killed?: boolean
    // The target's HP (and for the hero, ward) after this event, as a share of the maximum, so the
    // view can move its bars in step with the staggered numbers.
    hpAfter?: number
    wardAfter?: number
    // On hits to the hero: max life plus max ward, so the view can tell how big a blow was.
    pool?: number
    // A kill by burning rather than by a hit.
    burn?: boolean
    // On events to the hero: part of the hero's own hit coming back (the Reflection rule).
    reflected?: boolean
}
const combatEvents: CombatEvent[] = [];
export function drainCombatEvents(): CombatEvent[] {
    return combatEvents.splice(0);
}
// Combat events not yet drained for this adventurer (they'll show on the next frame).
export function hasPendingCombatEvents(adventurerId: string): boolean {
    return combatEvents.some(e => e.adventurerId === adventurerId);
}

// Whether a resting adventurer may leave the quest they fought on for a new run (a restart or
// another quest). main.ts holds them until the battle view's last numbers and effects have played,
// so nothing from the old fight shows on the new one. Sims have no view and never wait. Moving on
// within a run (the next encounter, a boss or bonus fight) doesn't ask.
let leaveGate: (adventurer: Adventurer) => boolean = () => true;
export function setLeaveGate(gate: (adventurer: Adventurer) => boolean) { leaveGate = gate; }

function pushCombat(e: CombatEvent) {
    combatEvents.push(e);
    if (combatEvents.length > 400) combatEvents.splice(0, combatEvents.length - 400);
}
function mainType(damage: DamageMap): DamageType {
    let best: DamageType = 'physical', most = -1;
    for (const [type, value] of Object.entries(damage) as [DamageType, number][]) {
        if ((value ?? 0) > most) { most = value ?? 0; best = type; }
    }
    return best;
}

const upgradeTier: Record<Tier, Tier | undefined> = {C: 'U', U: 'R', R: 'M', M: undefined};

// Whole part guaranteed, fraction as a chance: 1.3 gives 1, plus 1 more 30% of the time.
function rollCount(chance: number, rng: Rng): number {
    return Math.floor(chance) + (rng() < chance - Math.floor(chance) ? 1 : 0);
}

// Armor pieces an ambition can ask an adventurer to go without.
const ARMOR_SLOTS = ['body', 'head', 'gloves', 'boots'] as const;

function winBoss(state: GameState, adventurer: Adventurer, quest: QuestDef) {
    const boss = quest.boss!;
    const r = records(adventurer);
    if (!r.bosses.includes(quest.key)) r.bosses.push(quest.key);
    const first = !((state.obtained[boss.legendary] ?? 0) > 0);
    addMaterial(state, boss.legendary, 1);
    dropEvents.push({material: boss.legendary, tier: 'M', questKey: quest.key, first, owned: state.materials[boss.legendary] ?? 0, legendary: true});
    if (adventurer.run?.questKey === quest.key) {
        adventurer.run.loot[boss.legendary] = (adventurer.run.loot[boss.legendary] ?? 0) + 1;
    }
    addLog(state, quest.key, `${adventurer.name} defeated ${monsters[boss.monster].name}: +1 ${requireMaterial(boss.legendary).name} (legendary)`, 'loot');
}

// Pays out a contract fulfilled by this run and puts a new one in its place.
function completeContract(state: GameState, adventurer: Adventurer, quest: QuestDef) {
    const run = adventurer.run;
    const ref = run?.contract;
    const contract = findContract(state, ref, adventurer);
    if (!run || !ref || !contract || contract.questKey !== quest.key || !contract.mods.every(m => run.modifiers?.includes(m))) {
        return;
    }
    if (contract.reward.material) {
        const key = contract.reward.material;
        const first = !((state.obtained[key] ?? 0) > 0);
        addMaterial(state, key, 1);
        dropEvents.push({material: key, tier: 'M', questKey: quest.key, first, owned: state.materials[key] ?? 0});
        run.loot[key] = (run.loot[key] ?? 0) + 1;
    }
    state.gold += contract.reward.gold;
    run.gold += contract.reward.gold;
    state.fame += contract.reward.fame ?? 0;
    const parts = [contract.reward.material ? `+1 ${requireMaterial(contract.reward.material).name}` : '', contract.reward.fame ? `+${contract.reward.fame} fame` : '', `+${contract.reward.gold} gold`].filter(Boolean);
    addLog(state, quest.key, `${adventurer.name} completed a ${ref.kind} contract: ${parts.join(', ')}`, 'loot');
    contractEvents.push({adventurerId: adventurer.id, kind: ref.kind, text: parts.join(', ')});
    if (ref.kind === 'personal') {
        adventurer.contract = rollPersonalContract(state, adventurer, rng0);
    } else {
        const list = state.guildContracts ?? [];
        const i = list.findIndex(c => c.id === ref.id);
        const next = rollGuildContract(state, rng0);
        if (i >= 0) {
            if (next) list[i] = next; else list.splice(i, 1);
        }
    }
    adventurer.activeContract = null;
    delete run.contract;
}
const rng0 = () => Math.random();

// Finished contracts, for main.ts to announce.
export interface ContractEvent {
    adventurerId: string
    kind: 'personal' | 'guild'
    text: string
}
const contractEvents: ContractEvent[] = [];
export function drainContractEvents(): ContractEvent[] {
    return contractEvents.splice(0);
}

function winEncounter(state: GameState, adventurer: Adventurer, quest: QuestDef, index: number, rng: Rng, bonus = false, count = quest.encounters[index].monsters.length, boss?: string) {
    const progress = getQuestProgress(state, quest.key);
    const encounter = quest.encounters[index];
    const tier: Tier = bonus || boss ? 'R' : encounter.tier;
    const power = encounterPower(quest, index);
    const run = adventurer.run?.questKey === quest.key ? adventurer.run : undefined;
    if (quest.endless) {
        // No rewards: only the record.
        progress.bestEncounter = Math.max(progress.bestEncounter, index);
        const baseKey = quest.endless.baseKey;
        adventurer.endlessBest = {...adventurer.endlessBest, [baseKey]: Math.max(adventurer.endlessBest?.[baseKey] ?? -1, index)};
        if (run) run.cleared = index;
        if ((index + 1) % ENDLESS_PATTERN.length === 0) {
            addLog(state, quest.key, `${adventurer.name} cleared endless encounter ${index + 1}`, 'win');
        }
        return;
    }
    const rite = getModifierDefs(quest, run?.modifiers ?? []).find(m => m.rite)?.rite;
    if (boss && rite && boss === rite.boss) {
        winRite(state, adventurer, quest, rite, rng);
    } else if (boss) {
        winBoss(state, adventurer, quest);
    }
    const bonuses = getRewardBonuses(quest, fightKeys(run));
    // Rounded down, so far over-level heroes earn nothing here.
    const trophy = trophyGoldXp(state);
    const xp = Math.floor(4 * power * count * (bonuses.goldXpMultiplier ?? 1) * (1 + trophy.xp) * xpMultiplier(adventurer.level, questXpLevel(quest), run?.modifiers?.length ?? 0));
    const gold = Math.round((1.5 * power * count + rng() * 2) * (bonuses.goldXpMultiplier ?? 1) * (1 + trophy.gold));
    state.gold += gold;
    // One drop, plus extras from bonuses. Each drop can be upgraded one rarity step.
    const drops: {material: string, amount: number, tier: Tier}[] = [];
    // Endless banners add extra reward chance everywhere.
    const dropCount = 1 + rollCount((bonuses.extraRewardChance ?? 0) + trophyTotal(state, 'extraRewardChance'), rng);
    // Premium chance: increased by challenges (Endless trial, Void) and the hero's curses.
    const premiumChance = PREMIUM_CHANCE * (1 + (bonuses.premiumChance ?? 0) + cursePremium(adventurer));
    for (let d = 0; d < dropCount; d++) {
        let dropTier: Tier = tier;
        const next = upgradeTier[tier];
        if (next && quest.pools[next].length && rng() < (bonuses.rarityUpgradeChance ?? 0)) {
            dropTier = next;
        }
        const {entry, amount} = rollPool(quest.pools[dropTier], rng);
        // Each unit has a small chance to be the premium version.
        let premium = 0;
        if (!requireMaterial(entry.material).keyItem) for (let i = 0; i < amount; i++) if (rng() < premiumChance) premium++;
        const parts: [string, number][] = [[entry.material, amount - premium], [premiumKey(entry.material), premium]];
        for (const [material, count] of parts) {
            if (count < 1) continue;
            const first = !((state.obtained[material] ?? 0) > 0);
            addMaterial(state, material, count);
            dropEvents.push({material, tier: dropTier, questKey: quest.key, first, owned: state.materials[material] ?? 0, premium: isPremium(material)});
            if (dropEvents.length > 50) dropEvents.shift();
            drops.push({material, amount: count, tier: dropTier});
            if (run) {
                run.loot[material] = (run.loot[material] ?? 0) + count;
            }
        }
        if (!progress.revealed[dropTier].includes(entry.material)) {
            progress.revealed[dropTier].push(entry.material);
        }
    }
    progress.bestEncounter = Math.max(progress.bestEncounter, index);
    if (run) {
        run.cleared = index;
        run.gold += gold;
        run.xp += xp;
    }
    const leveled = gainXp(state, adventurer, xp);
    const dropText = drops.map(d => `+${d.amount} ${requireMaterial(d.material).name}${d.tier !== tier ? ` (upgraded to ${d.tier})` : ''}`).join(', ');
    addLog(state, quest.key, `${bonus ? 'Bonus encounter' : `Cleared ${index + 1}`} (${tier}): ${dropText}, +${gold} gold`, tier === 'C' && drops.every(d => d.tier === 'C') ? 'win' : 'loot');
    if (leveled) {
        addLog(state, quest.key, `${adventurer.name} reached level ${adventurer.level}`, 'info');
    }
    const last = quest.encounters.length - 1;
    if (index === last && !bonus && !boss) {
        // An adventurer who dreams of this quest's boss meets it, if the right modifiers are on.
        const ambition = bossAmbitionFor(adventurer, quest.key);
        if (run && quest.boss && ambition && (ambition.mods ?? []).every(m => run.modifiers?.includes(m)) && !run.bossEncounter) {
            run.bossEncounter = 'pending';
            addLog(state, quest.key, `${monsters[quest.boss.monster].name} awaits ${adventurer.name}${REST_BEFORE_EXTRA_FIGHT ? ' after resting' : ''}!`, 'info');
        }
        // The rite's boss waits at the end of a full clear with the rite on.
        if (run && rite && !run.riteBoss) {
            run.riteBoss = 'pending';
            addLog(state, quest.key, `${monsters[rite.boss].name} awaits ${adventurer.name}!`, 'info');
        }
        // A chance at one more rare fight after the final encounter. It follows straight on (or after
        // a rest, with REST_BEFORE_EXTRA_FIGHT) instead of a new run starting.
        if (run && !run.bonusEncounter && rng() < (bonuses.bonusRareChance ?? 0)) {
            run.bonusEncounter = 'pending';
            addLog(state, quest.key, `A bonus rare encounter awaits${REST_BEFORE_EXTRA_FIGHT ? ' after resting' : ''}!`, 'info');
        }
        // The clear counts once every encounter of this attempt is won, extra fights included.
        if (run && extraFightsPending(run)) {
            run.clearPending = true;
        } else {
            completeClear(state, adventurer, quest);
        }
    } else if ((bonus || boss) && run?.clearPending && !extraFightsPending(run)) {
        delete run.clearPending;
        completeClear(state, adventurer, quest);
    }
}

function extraFightsPending(run: RunRecord): boolean {
    return run.riteBoss === 'pending' || run.bossEncounter === 'pending' || run.bonusEncounter === 'pending';
}

// A full clear: the clear trophy's progress, records, and the contract it was run for.
function completeClear(state: GameState, adventurer: Adventurer, quest: QuestDef) {
    const progress = getQuestProgress(state, quest.key);
    const run = adventurer.run?.questKey === quest.key ? adventurer.run : undefined;
    progress.fullClears++;
    const modCount = run?.modifiers?.length ?? 0;
    progress.bestModifiedClear = Math.max(progress.bestModifiedClear ?? -1, modCount);
    const r = records(adventurer);
    r.modClears[quest.key] = Math.max(r.modClears[quest.key] ?? 0, modCount);
    if (ARMOR_SLOTS.every(slot => !adventurer.equipment[slot]) && !r.bareClears.includes(quest.key)) {
        r.bareClears.push(quest.key);
    }
    completeContract(state, adventurer, quest);
    const achievement = 'clear-' + quest.key;
    if (!state.achievements.includes(achievement)) {
        // The clear trophy grants the fame.
        state.achievements.push(achievement);
        addLog(state, quest.key, 'First clear!', 'info');
    }
}

// Whether the adventurer rests between the final encounter and a boss or bonus fight. Off: the
// extra fight follows straight on, so regen-light builds don't get a free refill before it.
export const REST_BEFORE_EXTRA_FIGHT = false;

// Starts a pending boss fight, else a pending bonus fight. False when neither is waiting.
function startExtraFight(state: GameState, adventurer: Adventurer): boolean {
    const extra = pendingExtraFight(adventurer);
    const run = adventurer.run!;
    const quest = quests[run?.questKey ?? ''];
    if (extra === 'rite') {
        run.riteBoss = 'fought';
        const rite = getModifierDefs(quest, run.modifiers ?? []).find(m => m.rite)!.rite!;
        startEncounter(state, adventurer, quest, quest.encounters.length - 1, false, rite.boss);
        return true;
    }
    if (extra === 'boss') {
        run.bossEncounter = 'fought';
        startEncounter(state, adventurer, quest, quest.encounters.length - 1, false, quest.boss!.monster);
        return true;
    }
    if (extra === 'bonus') {
        run.bonusEncounter = 'fought';
        startEncounter(state, adventurer, quest, quest.encounters.length - 1, true);
        return true;
    }
    return false;
}

// The extra fight a resting adventurer will start when the rest ends, if any. Same conditions as
// the end of a rest below.
export function pendingExtraFight(adventurer: Adventurer): 'rite' | 'boss' | 'bonus' | null {
    const run = adventurer.run;
    if (!run || adventurer.assignment?.questKey !== run.questKey) return null;
    if (run.riteBoss === 'pending') return 'rite';
    if (run.bossEncounter === 'pending' && quests[run.questKey].boss) return 'boss';
    if (run.bonusEncounter === 'pending') return 'bonus';
    return null;
}

// A short pause after each won encounter, so the fight's last moments read before the next one.
export const ENCOUNTER_END_SECONDS = 1;

// After the pause: the next encounter, or back to rest.
function advanceAfterWin(state: GameState, adventurer: Adventurer, quest: QuestDef, index: number, bonus: boolean) {
    const run = adventurer.run?.questKey === quest.key ? adventurer.run : undefined;
    const last = quest.encounters.length - 1;
    const stopAt = run ? run.stopAt : getStopAt(adventurer, quest.key);
    if (!REST_BEFORE_EXTRA_FIGHT && startExtraFight(state, adventurer)) {
        return;
    }
    if (bonus || run?.bossEncounter === 'pending' || run?.riteBoss === 'pending' || index >= Math.min(stopAt, last) || adventurer.assignment?.questKey !== quest.key) {
        startRest(state, adventurer, quest.key, false);
    } else {
        startEncounter(state, adventurer, quest, index + 1);
    }
}

// Rising will: how much the monster's damage and attack speed have grown this fight.
export function willFactor(m: MonsterState): number {
    const will = monsters[m.key]?.risingWill;
    return will ? 1 + will.growth * Math.floor((m.age ?? 0) / will.every) : 1;
}

// Shatter: true while any of the monster's shards still stands.
export function shielded(m: MonsterState, fighting: MonsterState[]): boolean {
    const shatter = monsters[m.key]?.shatter;
    return !!shatter && fighting.some(o => o.key === shatter.shard && o.hp > 0);
}

// Riposte's crit chance per attack dodged within its window.
export const RIPOSTE_WINDOW = 2;
export const RAMPAGE_WINDOW = 4;

function tickFight(state: GameState, adventurer: Adventurer, dt: number, rng: Rng) {
    const activity = adventurer.activity;
    if (activity.kind !== 'fighting') {
        return;
    }
    // Nobody acts while the encounter's entrance plays; leftover time carries into the fight.
    if (activity.entrance) {
        activity.entrance -= dt;
        if (activity.entrance > 0) return;
        dt = -activity.entrance;
        delete activity.entrance;
        if (dt <= 0) return;
    }
    const quest = quests[activity.questKey];
    const run = adventurer.run?.questKey === quest.key ? adventurer.run : undefined;
    const runMods = getModifierDefs(quest, run?.modifiers ?? []);
    const rite = runMods.find(m => m.rite)?.rite;
    // The rite's boss changes rules as its life drops.
    const riteBoss = rite && activity.boss === rite.boss ? activity.monsters.find(m => m.key === rite.boss) : undefined;
    const rules = activeRules(quest, runMods, activity.encounterIndex, riteBoss ? riteBoss.hp / riteBoss.maxHp : rite && activity.boss === rite.boss ? 0 : undefined);
    const lifeless = rules.has('noRecovery');
    // Corrosion's stacks lower the hero's defenses for the rest of the run.
    // Stacks keep working for the whole run, even after a rite moves on to other rules.
    const stats = corrode(getCachedStats(state, adventurer), run?.corrosion ?? 0);
    const rs = runStats(adventurer, quest.key);
    // This encounter's line in the recap: damage taken and time fighting.
    const encounterEntry = () => {
        if (!rs) return undefined;
        const names = [...new Set((activity.lineup ?? (activity.boss ? [activity.boss] : quest.encounters[activity.encounterIndex]?.monsters ?? [])).map(k => monsters[k]?.name ?? k))];
        const label = `${activity.boss ? 'Ambition boss' : `Encounter ${activity.encounterIndex + 1}`}${activity.bonus ? ' (bonus)' : ''} · ${names.join(', ')}`;
        rs.takenByEncounter ??= {};
        const entry = rs.takenByEncounter[label];
        return typeof entry === 'object' ? entry : (rs.takenByEncounter[label] = {taken: entry ?? 0, seconds: 0});
    };
    const takenHere = (amount: number) => {
        const entry = amount > 0 ? encounterEntry() : undefined;
        if (entry) entry.taken += amount;
    };
    const pl = (key: PassiveKey) => passiveLevel(adventurer, key, classPassive);
    const furyL = pl('fury'), followL = pl('followThrough'), siphonL = pl('siphonWard'), cleaveL = pl('cleave'), riposteL = pl('riposte'), spellL = pl('spellward');
    const counterL = pl('counterstrike'), exploitL = pl('exploit'), bloodL = pl('bloodPact'), rampageL = pl('rampage'), deadeyeL = pl('deadeye'), hexL = pl('hex');
    // Each passive's effect scale: the numbers that "increased core passive effect" strengthens.
    const sc = (key: PassiveKey) => stats.passiveScale[key] ?? 0;
    // Hex: monsters deal less and take more for each second of ailments on them.
    const hexFactor = (m: MonsterState) => hexL ? HEX_PER_SECOND * sc('hex') * ailmentSeconds(m.ailments) : 0;
    // Trophy stats on the hero (data/trophies.ts).
    const tg = (key: StatKey) => stats.gear[key] ?? 0;
    const recovery = 1 + tg('increasedRecovery');
    activity.clock = (activity.clock ?? 0) + dt;
    // Spellward: healing past full HP becomes ward, up to twice max ward.
    const spellCap = spellL ? 2 * stats.maxWard : 0;
    // Leech soft cap: life leeched in combat over the last second, against the hero's pool (max HP +
    // max ward). The first RECOVERY_BAND of the pool per second heals in full, the next band at half,
    // the next at a quarter, and so on, so leech heals no more than twice the band per second.
    // Other recovery (regen, life on hit, ward gains) isn't capped.
    const recoveryBand = RECOVERY_BAND * (stats.maxHealth + stats.maxWard);
    activity.recovered ??= [];
    while (activity.recovered.length && activity.clock - activity.recovered[0].at >= RECOVERY_WINDOW) {
        activity.recoveredSum = (activity.recoveredSum ?? 0) - activity.recovered.shift()!.amount;
    }
    if (!activity.recovered.length) activity.recoveredSum = 0;
    const softCap = (amount: number): number => softCapRecovery(amount, activity.recoveredSum ?? 0, recoveryBand);
    const recordRecovery = (amount: number) => {
        if (amount <= 0) return;
        activity.recovered!.push({at: activity.clock!, amount});
        activity.recoveredSum = (activity.recoveredSum ?? 0) + amount;
    };
    const healHero = (raw: number, leech = false): number => {
        if (lifeless || raw <= 0) return 0;
        raw *= recovery;
        const amount = leech ? softCap(raw) : raw;
        const healed = heal(adventurer, stats.maxHealth, amount);
        let gained = 0;
        if (spellCap > 0 && adventurer.hp > 0 && amount > healed) {
            const before = adventurer.ward ?? 0;
            adventurer.ward = Math.max(before, Math.min(spellCap, before + amount - healed));
            gained = adventurer.ward - before;
            if (rs) rs.wardGained += gained;
        }
        if (leech) recordRecovery(healed + gained);
        return healed;
    };
    // Ward gains that stop at max ward, without cutting ward a Spellward hero holds above it.
    const gainWard = (amount: number) => {
        if (lifeless || amount <= 0) return;
        amount *= recovery;
        const before = adventurer.ward ?? 0;
        adventurer.ward = Math.max(before, Math.min(stats.maxWard, before + amount));
        if (rs) rs.wardGained += adventurer.ward - before;
    };
    const regen = healHero(stats.lifeRegen * dt);
    if (rs) rs.healed.regen += regen;
    // Spellward: regenerate a share of current ward as HP each second.
    if (spellL && (adventurer.ward ?? 0) > 0) {
        const fromWard = healHero(SPELLWARD_HEAL * sc('spellward') * (adventurer.ward ?? 0) * dt);
        if (rs) rs.healed.regen += fromWard;
    }
    if (activity.ending !== undefined) {
        activity.ending -= dt;
        if (activity.ending <= 0) {
            advanceAfterWin(state, adventurer, quest, activity.encounterIndex, !!activity.bonus || !!activity.boss);
        }
        return;
    }
    if (rs) {
        rs.fightSeconds += dt;
        encounterEntry()!.seconds += dt;
    }
    // Chill and Shock compare a hit with an average monster's HP at this encounter's level.
    const threshold = monsterBaseline.hp * encounterPower(quest, activity.encounterIndex) * (quest.monsterScale ?? 1);
    // Exploit: burns last twice as long, and chill and shock build to 75%. Increased limits raise both.
    const limits = 1 + tg('increasedAilmentLimits');
    const ailmentBonus: AilmentBonus = {chance: {burn: stats.gear.igniteChance ?? 0, chill: stats.gear.chillChance ?? 0, shock: stats.gear.shockChance ?? 0}, effect: stats.gear.ailmentEffect ?? 0,
        chanceMore: tg('increasedAilmentChance'),
        burnSeconds: (exploitL ? 2 : 1) * BURN_SECONDS * limits, cap: (exploitL ? 0.75 : CHILL_CAP) * limits};
    // Ailments monsters put on the hero: some avoided outright, the rest weaker.
    const heroAilmentBonus: AilmentBonus = {effect: -tg('reducedAilmentEffectTaken')};
    const avoidsAilment = () => tg('avoidAilmentChance') > 0 && rng() < tg('avoidAilmentChance');
    // Damage taken over time (burns, bleeds, Karma): less damage taken and reduced damage over time.
    const dotTaken = (1 - tg('lessDamageTaken')) * (1 - tg('reducedDamageOverTimeTaken'));
    const defeat = (by: string) => {
        const progress = getQuestProgress(state, quest.key);
        progress.bestEncounter = Math.max(progress.bestEncounter, activity.encounterIndex - 1);
        addLog(state, quest.key, `Defeated at encounter ${activity.encounterIndex + 1} by ${by}`, 'loss');
        if (adventurer.run) adventurer.run.defeatedAt = activity.encounterIndex;
        if (quest.endless) {
            // One attempt per entry fee: head home instead of paying for another.
            adventurer.assignment = null;
        }
        startRest(state, adventurer, quest.key, true);
    };
    // Shatter: the damage a monster actually takes. Halved while its shards stand, and stopped at its
    // next threshold so a big hit can't skip a phase.
    const hurt = (m: MonsterState, amount: number): number => {
        amount *= 1 + hexFactor(m);
        // Guard cuts the damage; a ward soaks what's left before life.
        if (m.guard) amount *= 1 - m.guard.amount;
        if (m.ward) {
            const soaked = Math.min(m.ward, amount);
            m.ward = m.ward - soaked || undefined;
            amount -= soaked;
        }
        const shatter = monsters[m.key]?.shatter;
        if (!shatter) return amount;
        if (shielded(m, activity.monsters)) amount *= shatter.damageTaken;
        const next = shatter.at[m.phase ?? 0];
        return next === undefined ? amount : Math.min(amount, Math.max(0, m.hp - next * m.maxHp));
    };
    // Shards join in front once a threshold is reached, in free add slots after the line-up.
    // Summons: at each life threshold, adds join in front. They give half a monster's gold and XP.
    const summonCheck = (m: MonsterState) => {
        const summon = monsters[m.key]?.summon;
        const next = summon?.at[m.summoned ?? 0];
        if (!summon || next === undefined || m.hp <= 0 || m.hp > next * m.maxHp + 1e-6) return;
        m.summoned = (m.summoned ?? 0) + 1;
        const base = activity.lineup?.length ?? 0;
        const adds = activity.adds ??= [];
        const spawned: MonsterState[] = [];
        for (let i = 0; i < summon.count; i++) {
            let index = adds.findIndex((_, j) => !activity.monsters.some(o => o.slot === base + j) && !spawned.some(o => o.slot === base + j));
            if (index < 0) index = adds.length;
            adds[index] = summon.monster;
            const st = getMonsterStats(quest, activity.encounterIndex, summon.monster, fightKeys(run));
            spawned.push({key: summon.monster, slot: base + index, hp: st.hp * (summon.hp ?? 1), maxHp: st.hp * (summon.hp ?? 1), cooldown: (0.5 + 0.5 * rng()) / st.attacksPerSecond});
        }
        activity.monsters.unshift(...spawned);
        activity.summonedCount = (activity.summonedCount ?? 0) + summon.count;
        pushCombat({adventurerId: adventurer.id, side: 'monster', slot: m.slot ?? 0, kind: 'cast', ability: summon.name, effect: 'hatch', spell: true, onSelf: true});
    };
    const shatterCheck = (m: MonsterState) => {
        summonCheck(m);
        const shatter = monsters[m.key]?.shatter;
        const next = shatter?.at[m.phase ?? 0];
        if (!shatter || next === undefined || m.hp > next * m.maxHp + 1e-6) return;
        m.phase = (m.phase ?? 0) + 1;
        const base = activity.lineup?.length ?? 0;
        const adds = activity.adds ??= [];
        const spawned: MonsterState[] = [];
        for (let i = 0; i < shatter.count; i++) {
            let index = adds.findIndex((_, j) => !activity.monsters.some(o => o.slot === base + j) && !spawned.some(o => o.slot === base + j));
            if (index < 0) index = adds.length;
            adds[index] = shatter.shard;
            const st = getMonsterStats(quest, activity.encounterIndex, shatter.shard, fightKeys(run));
            spawned.push({key: shatter.shard, slot: base + index, hp: st.hp, maxHp: st.hp, cooldown: (0.5 + 0.5 * rng()) / st.attacksPerSecond});
        }
        activity.monsters.unshift(...spawned);
        addLog(state, quest.key, `${monsters[m.key].name} shatters: ${shatter.count} ${monsters[shatter.shard].name}s rise to guard him.`, 'info');
    };
    // Burning on the hero: ward soaks it first, like any damage.
    const heroBurn = tickAilments(activity.heroAilments, dt) * shockFactor(activity.heroAilments) * dotTaken * (1 - tg('lessElementalDamageTaken'));
    if (heroBurn > 0) {
        const absorbed = Math.min(adventurer.ward ?? 0, heroBurn);
        adventurer.ward = (adventurer.ward ?? 0) - absorbed;
        adventurer.hp -= heroBurn - absorbed;
        if (rs) {
            addDamage(rs.taken, {fire: heroBurn}, heroBurn);
            takenHere(heroBurn);
            rs.wardAbsorbed += absorbed;
            rs.lowestHp = Math.min(rs.lowestHp, Math.max(0, adventurer.hp) / stats.maxHealth);
        }
        if (adventurer.hp <= 0) {
            defeat('burning');
            return;
        }
    }
    // Bleeding on the hero: armor already applied when it started; ward soaks it first.
    const heroBleed = tickBleed(activity.heroAilments, dt) * shockFactor(activity.heroAilments) * dotTaken;
    if (heroBleed > 0) {
        const absorbed = Math.min(adventurer.ward ?? 0, heroBleed);
        adventurer.ward = (adventurer.ward ?? 0) - absorbed;
        adventurer.hp -= heroBleed - absorbed;
        if (rs) {
            addDamage(rs.taken, {physical: heroBleed}, heroBleed);
            takenHere(heroBleed);
            rs.wardAbsorbed += absorbed;
            rs.lowestHp = Math.min(rs.lowestHp, Math.max(0, adventurer.hp) / stats.maxHealth);
        }
        if (adventurer.hp <= 0) {
            defeat('bleeding');
            return;
        }
    }
    // Karma: each stack burns the hero for physical damage every second. Armor reduces it as if each
    // second's damage were one hit; ward soaks it first.
    if (run?.karma) {
        const perSecond = KARMA_DPS * run.karma;
        const karma = armorReduce(perSecond, stats.armor) * dt * dotTaken;
        const absorbed = Math.min(adventurer.ward ?? 0, karma);
        adventurer.ward = (adventurer.ward ?? 0) - absorbed;
        adventurer.hp -= karma - absorbed;
        if (rs) {
            addDamage(rs.taken, {physical: karma}, karma);
            takenHere(karma);
            rs.preventedArmor += Math.max(0, perSecond * dt - karma);
            rs.wardAbsorbed += absorbed;
            rs.lowestHp = Math.min(rs.lowestHp, Math.max(0, adventurer.hp) / stats.maxHealth);
        }
        if (adventurer.hp <= 0) {
            defeat('Karma');
            return;
        }
    }
    // A hit landing on the hero, from a monster or reflected: block, then armor and resistances, then
    // ward before life. A hit that isn't blocked may add a Corrosion stack. Returns false if it killed.
    const landHit = (split: DamageMap, slot: number, hitIndex: number, from: string | null, reflected = false): boolean => {
        const refl = reflected ? {reflected: true} : {};
        // Sunder on the hero cuts their armor.
        const armor = stats.armor * sunderFactor(activity.heroAilments);
        // Dodge chance (Ninja's Shuriken): a separate roll on each hit that got past evasion. It doesn't
        // end the attacker's chain, so the next hit still rolls.
        if (!reflected && from && tg('dodgeChance') > 0 && rng() < tg('dodgeChance')) {
            if (rs) rs.attacksDodged++;
            if (riposteL) (activity.recentDodges ??= []).push(activity.clock ?? 0);
            pushCombat({adventurerId: adventurer.id, side: 'hero', slot, kind: 'miss', hitIndex});
            return true;
        }
        // Trophy reductions: less elemental damage, less damage, and reduced reflected damage.
        const lessEle = 1 - tg('lessElementalDamageTaken');
        const takenByType = mitigateByType(split, armor, stats.resist);
        for (const e of elementsOf(takenByType)) takenByType[e] = (takenByType[e] ?? 0) * lessEle;
        const takenMore = shockFactor(activity.heroAilments) * (1 - tg('lessDamageTaken')) * (reflected ? 1 - tg('reducedReflectedDamageTaken') : 1);
        for (const t of Object.keys(takenByType) as DamageType[]) takenByType[t] = (takenByType[t] ?? 0) * takenMore;
        const sumTaken = Object.values(takenByType).reduce((a, b) => a + (b ?? 0), 0);
        // A hit under 1 lands as 1 with its own chance, as mitigateDamage does.
        let taken = sumTaken >= 1 ? sumTaken : rng() < sumTaken ? 1 : 0;
        if (rs) rs.incomingHits++;
        if (rng() < stats.blockChance) {
            if (rs) {
                rs.blocks++;
                rs.preventedBlock += taken;
            }
            const onBlock = (stats.gear.wardOnBlock ?? 0) + (stats.gear.wardOnBlockPercent ?? 0) * stats.maxWard;
            if (onBlock > 0) gainWard(onBlock);
            if (counterL) activity.counters = (activity.counters ?? 0) + 1;
            pushCombat({adventurerId: adventurer.id, side: 'hero', slot, kind: 'block', hitIndex, ...refl});
            return true;
        }
        if (rs) {
            rs.preventedArmor += Math.max(0, (split.physical ?? 0) - (takenByType.physical ?? 0));
            rs.preventedResist += elementsOf(split).reduce((sum, e) => sum + Math.max(0, (split[e] ?? 0) - (takenByType[e] ?? 0)), 0);
            addDamage(rs.taken, takenByType, taken);
            takenHere(taken);
            const by = from ?? (reflected ? REFLECT_SOURCE : null);
            if (by) {
                rs.takenBy ??= {};
                rs.takenBy[by] = (rs.takenBy[by] ?? 0) + taken;
            }
            if (reflected) {
                rs.reflected ??= {hits: 0, taken: 0};
                rs.reflected.hits++;
                rs.reflected.taken += taken;
            }
        }
        // Monsters' elemental hits inflict ailments too, measured against the hero's max life.
        if (from && !avoidsAilment()) inflict(activity.heroAilments ??= {}, takenByType, stats.maxHealth, rng, heroAilmentBonus);
        // Corrosion counts as an ailment for avoidance (Amber Reliquary's avoid ailment chance).
        if (rules.has('corrosion') && run && rng() < corrosionStackChance(run.corrosion ?? 0) && !avoidsAilment()) {
            run.corrosion = (run.corrosion ?? 0) + 1;
            // Max ward drops with the stack, so ward held above the new cap goes with it (Spellward's
            // cap scales the same way).
            const newMax = getCachedStats(state, adventurer).maxWard * corrosionFactor(run.corrosion);
            adventurer.ward = Math.min(adventurer.ward ?? 0, spellL ? 2 * newMax : newMax);
        }
        if (rampageL && taken > 0) (activity.recentHits ??= []).push({at: activity.clock ?? 0, amount: taken});
        // Ward soaks damage of any type before HP.
        const absorbed = Math.min(adventurer.ward ?? 0, taken);
        adventurer.ward = (adventurer.ward ?? 0) - absorbed;
        taken -= absorbed;
        adventurer.hp -= taken;
        if (rs) {
            rs.wardAbsorbed += absorbed;
            rs.lowestHp = Math.min(rs.lowestHp, Math.max(0, adventurer.hp) / stats.maxHealth);
        }
        // HP lost comes back partly as ward, up to max ward.
        if (taken > 0 && stats.hpLostAsWard > 0 && adventurer.hp > 0) gainWard(taken * stats.hpLostAsWard);
        // Siphon ward: each hit that isn't blocked restores a share of max ward afterward.
        if (siphonL && stats.maxWard > 0 && adventurer.hp > 0) gainWard(SIPHON_RESTORE * sc('siphonWard') * stats.maxWard);
        pushCombat({adventurerId: adventurer.id, side: 'hero', slot, kind: 'hit', amount: taken, ward: absorbed, hitIndex, damageType: mainType(split), hpAfter: Math.max(0, adventurer.hp) / stats.maxHealth, wardAfter: (adventurer.ward ?? 0) / Math.max(1, stats.maxWard), pool: stats.maxHealth + stats.maxWard, ...refl});
        return adventurer.hp > 0;
    };
    // Burning on monsters. A burn kill counts as a kill.
    let burnedOut = false;
    for (const m of [...activity.monsters]) {
        const burn = hurt(m, tickAilments(m.ailments, dt) * shockFactor(m.ailments));
        if (burn <= 0) continue;
        if (rs) addDamage(rs.dealt, {fire: burn}, Math.min(burn, Math.max(0, m.hp)));
        m.hp -= burn;
        shatterCheck(m);
        if (m.hp <= 0) {
            burnedOut = true;
            pushCombat({adventurerId: adventurer.id, side: 'monster', slot: m.slot ?? 0, kind: 'hit', amount: 0, damageType: 'fire', killed: true, hpAfter: 0, burn: true});
        }
    }
    if (burnedOut) {
        const fallen = activity.monsters.filter(m => m.hp <= 0);
        activity.monsters = activity.monsters.filter(m => m.hp > 0);
        for (const _ of fallen) {
            if (rs) rs.kills++;
        }
    }
    // Riposte: dodges count for 2 seconds.
    if (riposteL && activity.recentDodges?.length) {
        activity.recentDodges = activity.recentDodges.filter(at => (activity.clock ?? 0) - at <= RIPOSTE_WINDOW);
    }
    // Rampage: damage taken in the last 4 seconds raises damage and attack speed.
    if (rampageL) {
        activity.recentHits = (activity.recentHits ?? []).filter(h => (activity.clock ?? 0) - h.at <= RAMPAGE_WINDOW);
    }
    const rampage = () => rampageL ? 1 + RAMPAGE_PER_10 * sc('rampage') * (activity.recentHits ?? []).reduce((sum, h) => sum + h.amount, 0) / 10 : 1;
    // Blood pact: leech heals over its second. While it flows it counts as regeneration.
    if (activity.leechPool?.length) {
        let flowing = 0;
        for (const part of activity.leechPool) flowing += part.perSecond * Math.min(dt, part.left);
        const healed = healHero(flowing, true);
        if (rs) rs.healed.leech += healed;
        for (const part of activity.leechPool) part.left -= dt;
        activity.leechPool = activity.leechPool.filter(part => part.left > 0);
    }
    const bloodBonus = () => {
        if (!bloodL || lifeless) return 1;
        const perSecond = stats.lifeRegen + (activity.leechPool ?? []).reduce((sum, part) => sum + part.perSecond, 0);
        return 1 + bloodPactBonus(sc('bloodPact'), perSecond);
    };
    // One attack. A free one (Counterstrike) works like any other attack, swinging the next weapon,
    // using Riposte stacks and paying Blood pact's cost, but it doesn't add to the cooldown.
    // Returns false if the hero fell.
    const attack = (mult: number, free: boolean): boolean => {
        // Dual wielding alternates weapons; each swing sets the cooldown before the next.
        const swing = stats.strikes?.[(activity.swing ?? 0) % stats.strikes.length];
        const swingDamage = swing?.damage ?? stats.damage;
        if (stats.strikes) activity.swing = ((activity.swing ?? 0) + 1) % stats.strikes.length;
        if (!free) activity.cooldown += 1 / ((swing?.attacksPerSecond ?? stats.attacksPerSecond) * rampage());
        // Riposte: crit chance for each attack dodged in the last 2 seconds.
        const critChance = stats.critChance + RIPOSTE_CRIT * sc('riposte') * (riposteL ? activity.recentDodges?.length ?? 0 : 0);
        const critBonus = stats.critBonus;
        // Blood pact: each attack costs 2% of current HP, which alone can never kill.
        if (bloodL) adventurer.hp -= 0.02 * Math.max(0, adventurer.hp);
        // One attack can land several hits, all on the monster in front. A kill ends the chain,
        // except with Follow-through, where the remaining hits carry on to the next monster.
        const frontTarget = activity.monsters[0];
        let hits = rollHits(stats.accuracy * blindFactor(activity.heroAilments), exposedEvasion(getMonsterStats(quest, activity.encounterIndex, frontTarget.key, fightKeys(adventurer.run)).evasion * (1 + (frontTarget.evade?.amount ?? 0)), frontTarget.exposed), rng);
        frontTarget.exposed = hits ? 0 : (frontTarget.exposed ?? 0) + 1;
        // Deadeye: the hits land as one combined hit (its crit multiplier is in stats.critBonus).
        let combine = deadeyeL && hits > 1 ? hits : 1;
        if (deadeyeL && hits > 1) hits = 1;
        if (!hits) {
            pushCombat({adventurerId: adventurer.id, side: 'monster', slot: activity.monsters[0].slot ?? 0, kind: 'miss'});
        }
        if (rs) {
            rs.attacks++;
            if (hits) rs.attacksLanded++;
        }
        let hitIndex = 0;
        // Hits landed, counting each part of a combined hit (for chain records).
        let landed = 0;
        let kills = 0;
        while (hits > 0 && activity.monsters.length) {
            hits--;
            const target = activity.monsters[0];
            const targetStats = getMonsterStats(quest, activity.encounterIndex, target.key, fightKeys(adventurer.run));
            // Each part of a combined hit rolls its own damage and crit.
            let roll = 0, scale = 0, critLevels = 0;
            for (let part = 0; part < combine; part++) {
                const levels = rollCritLevels(critChance, rng);
                const partScale = 1 + critBonus * levels;
                roll += (stats.rollMin + (stats.rollMax - stats.rollMin) * rng()) * partScale;
                scale += partScale;
                critLevels = Math.max(critLevels, levels);
            }
            const parts = combine;
            combine = 1;
            landed += parts;
            const hit: DamageMap = {};
            for (const type of Object.keys(swingDamage) as DamageType[]) {
                hit[type] = swingDamage[type] * roll;
            }
            // Fury: +1 physical damage for every 5 missing life (scaled by its effect). Crits scale
            // it like the rest of the hit.
            if (furyL) {
                const missing = Math.max(0, stats.maxHealth - adventurer.hp);
                hit.physical = (hit.physical ?? 0) + missing * FURY_PER_MISSING * sc('fury') * scale;
            }
            // Exploit: more damage for each different ailment on the target.
            const a = target.ailments;
            const exploit = exploitL ? 1 + EXPLOIT_PER_AILMENT * sc('exploit') * ((a?.burns?.length ? 1 : 0) + (a?.chill ? 1 : 0) + (a?.shock ? 1 : 0)) : 1;
            // Weaken on the hero cuts the damage of each hit before armor and resistances.
            const more = mult * exploit * bloodBonus() * rampage() * weakenFactor(activity.heroAilments);
            if (more !== 1) for (const type of Object.keys(hit) as DamageType[]) hit[type] = (hit[type] ?? 0) * more;
            const dealtByType = mitigateByType(hit, targetStats.armor, penetrate(targetStats.resist, stats.resistPenetration));
            // Shock on the target raises all damage it takes.
            const dealt = hurt(target, mitigateDamage(hit, targetStats.armor, penetrate(targetStats.resist, stats.resistPenetration), rng) * shockFactor(target.ailments));
            inflict(target.ailments ??= {}, dealtByType, threshold, rng, parts > 1 ? {...ailmentBonus, rolls: parts} : ailmentBonus);
            // Leech counts only damage the monster had left to lose.
            const effective = Math.min(dealt, Math.max(0, target.hp));
            const onHit = healHero(stats.lifeOnHit);
            let leech = 0;
            if (bloodL) {
                if (!lifeless && stats.lifeLeech * effective > 0) (activity.leechPool ??= []).push({perSecond: stats.lifeLeech * effective, left: 1});
            } else {
                leech = healHero(stats.lifeLeech * effective, true);
            }
            if (rs) {
                rs.hits++;
                if (critLevels) rs.crits++;
                addDamage(rs.dealt, dealtByType, effective);
                rs.healed.onHit += onHit;
                rs.healed.leech += leech;
            }
            target.hp -= dealt;
            shatterCheck(target);
            const rec = records(adventurer);
            if (dealt > rec.bestHit) rec.bestHit = dealt;
            pushCombat({adventurerId: adventurer.id, side: 'monster', slot: target.slot ?? 0, kind: 'hit', amount: dealt, critLevels, hitIndex: hitIndex++, damageType: mainType(hit), killed: target.hp <= 0, hpAfter: Math.max(0, target.hp) / target.maxHp});
            if (rules.has('karma') && run) run.karma = (run.karma ?? 0) + 1;
            // Reflection: part of the hit comes back. The hero's evasion rolls against their own accuracy.
            if (rules.has('reflect') && dealt > 0) {
                const sum = Object.values(dealtByType).reduce((acc, b) => acc + (b ?? 0), 0) || 1;
                const back: DamageMap = {};
                for (const [type, value] of Object.entries(dealtByType) as [DamageType, number][]) back[type] = value * dealt / sum * REFLECT_SHARE;
                if (rs) rs.incomingAttacks++;
                const reflectLands = rng() < hitChance(stats.accuracy, exposedEvasion(stats.evasion * galeFactor(activity.heroAilments), activity.heroExposed));
                activity.heroExposed = reflectLands ? 0 : (activity.heroExposed ?? 0) + 1;
                if (!reflectLands) {
                    if (rs) rs.attacksDodged++;
                    if (riposteL) (activity.recentDodges ??= []).push(activity.clock ?? 0);
                    const onDodge = (stats.gear.wardOnDodge ?? 0) + (stats.gear.wardOnDodgePercent ?? 0) * stats.maxWard;
                    if (onDodge > 0) gainWard(onDodge);
                    pushCombat({adventurerId: adventurer.id, side: 'hero', slot: target.slot ?? 0, kind: 'miss', reflected: true});
                } else if (!landHit(back, target.slot ?? 0, 0, null, true)) {
                    defeat('reflected damage');
                    return false;
                }
            }
            // Thorns: every hit on a thorned monster pricks the hero back.
            const thorns = monsters[target.key]?.thorns;
            if (thorns && !landHit({[monsters[target.key]?.thornsType ?? 'physical']: thorns}, target.slot ?? 0, 0, target.key)) {
                defeat('thorns');
                return false;
            }
            const onKill = () => {
                kills++;
                if (rs) rs.kills++;
            };
            // Cleave: the hit also lands on every other monster for a share of it.
            if (cleaveL) {
                const share = CLEAVE_SHARE * sc('cleave');
                const part: DamageMap = {};
                for (const type of Object.keys(hit) as DamageType[]) part[type] = (hit[type] ?? 0) * share;
                for (const other of [...activity.monsters]) {
                    if (other === target || other.hp <= 0) continue;
                    const otherStats = getMonsterStats(quest, activity.encounterIndex, other.key, fightKeys(adventurer.run));
                    const otherDealt = hurt(other, mitigateDamage(part, otherStats.armor, penetrate(otherStats.resist, stats.resistPenetration), rng) * shockFactor(other.ailments));
                    if (rs) addDamage(rs.dealt, mitigateByType(part, otherStats.armor, penetrate(otherStats.resist, stats.resistPenetration)), Math.min(otherDealt, other.hp));
                    other.hp -= otherDealt;
                    shatterCheck(other);
                    pushCombat({adventurerId: adventurer.id, side: 'monster', slot: other.slot ?? 0, kind: 'hit', amount: otherDealt, critLevels, hitIndex: 0, damageType: mainType(part), killed: other.hp <= 0, hpAfter: Math.max(0, other.hp) / other.maxHp});
                }
                const fallen = activity.monsters.filter(m => m !== target && m.hp <= 0);
                if (fallen.length) {
                    activity.monsters = activity.monsters.filter(m => m === target || m.hp > 0);
                    fallen.forEach(onKill);
                }
            }
            if (target.hp <= 0) {
                activity.monsters = activity.monsters.filter(m => m !== target);
                onKill();
                if (!followL) {
                    break;
                }
            }
        }
        const rec = records(adventurer);
        rec.bestChain = Math.max(rec.bestChain, landed);
        rec.bestKills = Math.max(rec.bestKills, kills);
        return true;
    };
    // Chill slows the hero's attacks.
    activity.cooldown -= dt * slowFactor(activity.heroAilments);
    while (activity.cooldown <= 0 && activity.monsters.length) {
        if (!attack(1, false)) return;
    }
    // Counterstrike: blocks since the last tick each earn a free attack at a share of the damage.
    while (activity.counters && activity.monsters.length) {
        activity.counters--;
        if (!attack(COUNTER_DAMAGE * sc('counterstrike'), true)) return;
    }
    activity.counters = 0;
    if (!activity.monsters.length) {
        winEncounter(state, adventurer, quest, activity.encounterIndex, rng, activity.bonus, (activity.lineup?.length ?? quest.encounters[activity.encounterIndex].monsters.length) + 0.5 * (activity.summonedCount ?? 0), activity.boss);
        activity.ending = ENCOUNTER_END_SECONDS;
        return;
    }
    // Every monster still standing attacks on its own cooldown.
    for (const front of activity.monsters) {
        const frontStats = getMonsterStats(quest, activity.encounterIndex, front.key, fightKeys(adventurer.run));
        front.age = (front.age ?? 0) + dt;
        const will = willFactor(front);
        // Rising will heals on each new stack. Shatter phases already passed stay passed.
        const rising = monsters[front.key]?.risingWill;
        if (rising) {
            const stacks = Math.floor(front.age / rising.every);
            if (stacks > (front.will ?? 0)) {
                if (rising.heal) front.hp = Math.min(front.maxHp, front.hp + rising.heal * front.maxHp * (stacks - (front.will ?? 0)));
                front.will = stacks;
            }
        }
        // Chill slows the monster's attacks; Rally speeds them up.
        front.cooldown -= dt * slowFactor(front.ailments) * (1 + (front.haste?.amount ?? 0));
        while (front.cooldown <= 0) {
            front.cooldown += 1 / (frontStats.attacksPerSecond * will);
            if (front.haste && --front.haste.turns <= 0) delete front.haste;
            if (front.guard && --front.guard.turns <= 0) delete front.guard;
            if (front.evade && --front.evade.turns <= 0) delete front.evade;
            // Each turn the monster picks an ability or its next basic, announced before it lands.
            const kit = monsterKit(front.key);
            let entry: KitEntry | null = null;
            if (kit) {
                const pick = nextAbility(kit, front.ready, front.basicTurn);
                front.ready = pick.ready;
                front.basicTurn = pick.basicTurn;
                entry = kit[pick.index];
                const self = !!(entry.heal || entry.rally || entry.buff) && !kitHit(entry) && !entry.applies;
                pushCombat({adventurerId: adventurer.id, side: 'monster', slot: front.slot ?? 0, kind: 'cast', ability: entry.basic ? undefined : entry.name, effect: entry.effect, spell: entry.spell, fxScale: entry.effectScale, onSelf: self});
            }
            // Abilities on itself or its allies don't roll to hit.
            if (entry && (entry.heal || entry.rally || entry.buff) && !kitHit(entry) && !entry.applies) {
                if (entry.heal) front.hp = Math.min(front.maxHp, front.hp + entry.heal * front.maxHp);
                const buff = entry.buff;
                if (buff?.kind === 'ward') front.ward = Math.max(front.ward ?? 0, buff.amount * front.maxHp);
                else if (buff) front[buff.kind] = {amount: buff.amount, turns: buff.turns ?? 2};
                if (entry.rally) for (const m of activity.monsters) m.haste = {amount: entry.rally.amount, turns: entry.rally.turns};
                continue;
            }
            // Monsters chain hits the same way heroes do. Each hit can be blocked on its own.
            const hits = rollHits(frontStats.accuracy * (entry?.accuracy ?? 1), exposedEvasion(stats.evasion * galeFactor(activity.heroAilments), activity.heroExposed), rng);
            activity.heroExposed = hits ? 0 : (activity.heroExposed ?? 0) + 1;
            if (rs) {
                rs.incomingAttacks++;
                if (!hits) rs.attacksDodged++;
            }
            if (!hits) {
                if (riposteL) (activity.recentDodges ??= []).push(activity.clock ?? 0);
                const onDodge = (stats.gear.wardOnDodge ?? 0) + (stats.gear.wardOnDodgePercent ?? 0) * stats.maxWard;
                if (onDodge > 0) gainWard(onDodge);
                pushCombat({adventurerId: adventurer.id, side: 'hero', slot: front.slot ?? 0, kind: 'miss'});
                continue;
            }
            const roll = () => frontStats.damage * will * (0.85 + 0.3 * rng()) * Math.max(0.2, 1 - hexFactor(front));
            if (!entry) {
                for (let hitIndex = 0; hitIndex < hits; hitIndex++) {
                    if (!landHit(splitDamage(roll(), frontStats.damageTypes), front.slot ?? 0, hitIndex, front.key)) break;
                }
            } else {
                const e = entry;
                // An ability's hit: its own types of the base hit, plus what modifiers add.
                const abilityHit = (base: number): DamageMap => {
                    const raw = base * (e.damage ?? 1);
                    const out: DamageMap = {};
                    for (const [t, v] of Object.entries(e.shares) as [DamageType, number][]) out[t] = raw * frontStats.baseShare * v;
                    if (kitHit(e) > 0) for (const [t, v] of Object.entries(frontStats.addedTypes) as [DamageType, number][]) out[t] = (out[t] ?? 0) + raw * v;
                    // Mimicry: all of it turns into the type the hero deals most.
                    if (e.mimic) {
                        const total = Object.values(out).reduce((sum, v) => sum + (v ?? 0), 0);
                        return {[mainType(stats.damage)]: total};
                    }
                    return out;
                };
                if (e.applies) {
                    const kind = e.applies.ailment;
                    const element = ({burn: 'fire', chill: 'cold', shock: 'lightning'} as Record<string, Element>)[kind];
                    const amount = e.applies.amount * (element ? 1 - Math.max(0, stats.resist[element] ?? 0) : 1) * (1 - tg('reducedAilmentEffectTaken'));
                    const a = activity.heroAilments ??= {};
                    // A burn or bleed too weak to matter (under MIN_DOT_DPS) is dropped, with no announcement.
                    let applied = !avoidsAilment();
                    if (!applied) {
                        // Avoided (Amber Reliquary): nothing takes hold.
                    } else if (kind === 'burn') {
                        const dps = amount * roll();
                        if (dps >= MIN_DOT_DPS) (a.burns ??= []).push({dps, remaining: BURN_SECONDS + 1}); else applied = false;
                    }
                    else if (kind === 'chill') a.chill = Math.min(CHILL_CAP, (a.chill ?? 0) + amount);
                    else if (kind === 'shock') a.shock = Math.min(SHOCK_CAP, (a.shock ?? 0) + amount);
                    else if (kind === 'weaken') a.weaken = Math.min(WEAKEN_CAP, (a.weaken ?? 0) + amount);
                    else if (kind === 'snare') a.snare = Math.min(SNARE_CAP, (a.snare ?? 0) + amount);
                    else if (kind === 'blind') a.blind = Math.min(BLIND_CAP, (a.blind ?? 0) + amount);
                    else if (kind === 'sunder') a.sunder = Math.min(SUNDER_CAP, (a.sunder ?? 0) + amount);
                    else if (kind === 'gale') a.gale = Math.min(GALE_CAP, (a.gale ?? 0) + amount);
                    else {
                        // Bleed: `amount` x a hit of physical damage over BLEED_SECONDS, armor applied once.
                        const total = armorReduce(amount * roll(), stats.armor * sunderFactor(a));
                        if (total / BLEED_SECONDS < MIN_DOT_DPS) applied = false;
                        else if (!a.bleed || a.bleed.dps < total / BLEED_SECONDS) a.bleed = {dps: total / BLEED_SECONDS, remaining: BLEED_SECONDS};
                    }
                    if (applied) pushCombat({adventurerId: adventurer.id, side: 'hero', slot: front.slot ?? 0, kind: 'ailment', ailment: kind, ability: e.name});
                }
                if (kitHit(e) > 0) {
                    const before = adventurer.hp + (adventurer.ward ?? 0);
                    if (e.spell || e.hits) {
                        // A spell's chained hits land as one combined blow; a multi-hit ability splits
                        // that blow into its own number of hits.
                        let raw = 0;
                        for (let i = 0; i < hits; i++) raw += roll();
                        const n = e.hits ?? 1;
                        for (let i = 0; i < n; i++) if (!landHit(abilityHit(raw / n), front.slot ?? 0, i, front.key)) break;
                    } else {
                        for (let hitIndex = 0; hitIndex < hits; hitIndex++) {
                            if (!landHit(abilityHit(roll()), front.slot ?? 0, hitIndex, front.key)) break;
                        }
                    }
                    // Drain: heals for part of what got through.
                    if (e.drain) front.hp = Math.min(front.maxHp, front.hp + e.drain * Math.max(0, before - adventurer.hp - (adventurer.ward ?? 0)));
                }
                if (e.heal) front.hp = Math.min(front.maxHp, front.hp + e.heal * front.maxHp);
            }
            if (adventurer.hp <= 0) {
                defeat(frontStats.name);
                return;
            }
        }
    }
}

// The leech soft cap (see tickFight): a band is this share of max HP + max ward, per this many seconds.
export const RECOVERY_BAND = 0.1;
export const RECOVERY_WINDOW = 1;
// How much of `raw` recovery lands, with `recent` already recovered in the window: full up to one
// band, half up to two, a quarter up to three, halving with each further band.
export function softCapRecovery(raw: number, recent: number, band: number): number {
    if (band <= 0) return raw;
    let left = raw, out = 0, total = recent;
    for (let guard = 0; left > 1e-9 && guard < 30; guard++) {
        const k = Math.floor(total / band + 1e-9);
        const rate = Math.pow(0.5, k);
        const room = (k + 1) * band - total;
        const used = Math.min(left, room / rate);
        out += used * rate;
        total += used * rate;
        left -= used;
    }
    return out;
}

export function tickAdventurer(state: GameState, adventurer: Adventurer, dt: number, rng: Rng) {
    encounterRng = rng;
    const activity = adventurer.activity;
    if (activity.kind === 'fighting') {
        tickFight(state, adventurer, dt, rng);
    } else if (activity.kind === 'traveling') {
        activity.remaining -= dt;
        if (activity.remaining <= 0) {
            startEncounter(state, adventurer, quests[activity.questKey], 0);
        }
    } else if (activity.kind === 'resting') {
        const stats = getCachedStats(state, adventurer);
        activity.remaining -= dt * restSpeed(stats.maxHealth, stats.lifeRegen * (1 + (stats.gear.increasedRecovery ?? 0)), adventurer.level);
        if (activity.remaining > 0 && adventurer.autoRecover) {
            const cost = getRecoverCost(state, adventurer);
            if (cost <= getAutoRecoverBudget(adventurer)) {
                recoverInstantly(state, adventurer);
            }
        }
        // HP visibly refills over the rest. Defeat's extra time is spent at 0 HP first.
        const total = getRestSeconds(stats.maxHealth, 0, activity.defeated);
        const fraction = Math.max(0, Math.min(1, 1 - activity.remaining / (activity.defeated ? total : 15)));
        adventurer.hp = Math.max(adventurer.hp, Math.floor(stats.maxHealth * fraction));
        if (activity.remaining <= 0) {
            adventurer.hp = stats.maxHealth;
            if (startExtraFight(state, adventurer)) {
                // A boss or bonus fight waited for the rest.
            } else if (adventurer.assignment) {
                // Waits at the end of the rest until the last fight's effects are done.
                if (leaveGate(adventurer)) startRun(state, adventurer);
                else activity.remaining = 0;
            } else {
                adventurer.activity = {kind: 'idle'};
            }
        }
    } else if (activity.kind === 'idle') {
        // Idle at the guild heals at the resting rate (a full refill from 0 HP in 15 seconds).
        const stats = getCachedStats(state, adventurer);
        if (adventurer.hp < stats.maxHealth) {
            adventurer.hp = Math.min(stats.maxHealth, adventurer.hp + stats.maxHealth / 15 * dt * restSpeed(stats.maxHealth, stats.lifeRegen * (1 + (stats.gear.increasedRecovery ?? 0)), adventurer.level));
        }
        // Retries when waiting on gold for an entry fee.
        if (adventurer.assignment) startRun(state, adventurer);
    }
}

// Portal events for main.ts to announce: opened (or extended) and closed.
export interface PortalEvent {
    kind: 'opened' | 'extended' | 'closed' | 'noKeys'
    adventurerId?: string
}
const portalEvents: PortalEvent[] = [];
export function drainPortalEvents(): PortalEvent[] {
    return portalEvents.splice(0);
}

// The rite's boss falls: its drop, then the keys are used up to open (or extend) the portal.
function winRite(state: GameState, adventurer: Adventurer, quest: QuestDef, rite: NonNullable<QuestModifierDef['rite']>, rng: Rng) {
    const {entry} = rollPool(rite.pool, rng);
    const first = !((state.obtained[entry.material] ?? 0) > 0);
    addMaterial(state, entry.material, 1);
    dropEvents.push({material: entry.material, tier: 'M', questKey: quest.key, first, owned: state.materials[entry.material] ?? 0, legendary: true});
    if (adventurer.run?.questKey === quest.key) adventurer.run.loot[entry.material] = (adventurer.run.loot[entry.material] ?? 0) + 1;
    addLog(state, quest.key, `${adventurer.name} defeated ${monsters[rite.boss].name}: +1 ${requireMaterial(entry.material).name}`, 'loot');
    const wasOpen = !!state.portal && state.time < state.portal.openUntil;
    if (openPortal(state, rite.keys)) {
        addLog(state, quest.key, `The keys are spent and the portal ${wasOpen ? `stays open ${PORTAL_SECONDS / 60} minutes longer` : `opens for ${PORTAL_SECONDS / 60} minutes`}.`, 'info');
        portalEvents.push({kind: wasOpen ? 'extended' : 'opened', adventurerId: adventurer.id});
    } else {
        addLog(state, quest.key, 'The keys were gone, so the portal stays shut.', 'info');
        portalEvents.push({kind: 'noKeys', adventurerId: adventurer.id});
    }
}

// When the portal closes, everyone on a portal quest is recalled.
function closePortalIfDue(state: GameState) {
    if (!state.portal || state.time < state.portal.openUntil) return;
    delete state.portal;
    for (const a of state.adventurers) {
        const questKey = a.assignment?.questKey ?? (a.activity.kind === 'fighting' || a.activity.kind === 'traveling' ? a.activity.questKey : undefined);
        if (questKey && isPortalQuest(questKey)) recall(state, a);
    }
    portalEvents.push({kind: 'closed'});
}

// Whether the adventurer is resting at the guild between runs (or recovering from a defeat), not on
// site before a boss or bonus fight.
export function restingAtGuild(adventurer: Adventurer): boolean {
    const a = adventurer.activity;
    return a.kind === 'resting' && (!!a.defeated || !pendingExtraFight(adventurer));
}

// One tick of the world. `speed` is the game speed the caller runs ticks at: an adventurer resting
// at the guild takes only one tick in `speed`, so rests there last their real time at any speed.
const restCarry = new Map<string, number>();
// The hero's stats as the current fight uses them: Corrosion's stacks applied while fighting.
export function fightStats(state: GameState, adventurer: Adventurer) {
    const stats = getCachedStats(state, adventurer);
    return adventurer.activity.kind === 'fighting' ? corrode(stats, adventurer.run?.corrosion ?? 0) : stats;
}

export function tick(state: GameState, rng: Rng = Math.random, speed = 1) {
    state.time += TICK_SECONDS;
    closePortalIfDue(state);
    for (const adventurer of state.adventurers) {
        if (speed > 1 && restingAtGuild(adventurer)) {
            const carry = (restCarry.get(adventurer.id) ?? 0) + 1 / speed;
            if (carry < 1 - 1e-9) { restCarry.set(adventurer.id, carry); continue; }
            restCarry.set(adventurer.id, carry - 1);
        }
        tickAdventurer(state, adventurer, TICK_SECONDS, rng);
    }
}
