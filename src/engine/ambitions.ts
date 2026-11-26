import {classes, monsters, quests, questXpLevel} from '../data/quests';
import {requireMaterial} from '../data/materials';
import {curseCount, passives as passiveDefs, rollBonuses, VESSEL_CURSES, type PassiveKey} from '../data/passives';
import {trophyTotal} from '../data/trophies';
import {slotFame} from '../data/milestones';
import type {HeroPassive, AdventurerRecords, Adventurer, Ambition, AmbitionKind, Applicant, GameState} from './types';

// Ambitions: three goals each adventurer brings at hire. Fulfilled ones pay fame when the adventurer
// retires, more for completing more of the set. Higher tiers ask for more and pay more.

// Applicant tiers. Each one also opens the class tier of the same rank, where one exists; past the
// highest class tier, recruits get more rare bonus passives instead.
export const ambitionTierNames = ['Novice', 'Seasoned', 'Veteran', 'Legend', 'Paragon', 'Exalted', 'Ascendant', 'Eternal'];
// Fame for each fulfilled ambition, by tier.
export const AMBITION_FAME = [4, 10, 25, 60, 120, 200, 350, 600];
// The total is multiplied by this for one, two and three fulfilled.
export const RETIRE_MULTIPLIER = [0, 1, 1.5, 2.5];
// Hire fee and the most an applicant's starting level can be, by tier.
export const HIRE_FEES = [50, 200, 1000, 5000, 15000, 30000, 60000, 120000];
const START_LEVEL_CAP = [1, 5, 10, 15, 20, 25, 30, 35];
// Applicants on offer, by guild expansion: two to start, a third with the second expansion and a
// fourth with the fifth.
export const APPLICANT_SLOTS = [2, 2, 3, 3, 3, 4];
export const THIRD_APPLICANT_EXPANSION = 2;
export const FOURTH_APPLICANT_EXPANSION = 5;
export function applicantSlots(state: GameState): number {
    return APPLICANT_SLOTS[Math.min(state.expansion ?? 0, APPLICANT_SLOTS.length - 1)];
}
// Fame for the applicant slots an expansion adds, counting from the first one past the starting two.
export function applicantSlotFame(before: number, after: number): number {
    let fame = 0;
    for (let i = before; i < after; i++) fame += slotFame(i - APPLICANT_SLOTS[0]);
    return fame;
}
export const REFRESH_COST = [20, 60, 200, 600, 1500, 3000, 6000, 12000];

export function emptyRecords(): AdventurerRecords {
    return {bestHit: 0, bestChain: 0, bestKills: 0, modClears: {}, bareClears: [], bosses: []};
}
export function records(adventurer: Adventurer): AdventurerRecords {
    adventurer.records ??= emptyRecords();
    return adventurer.records;
}

// Applicant tiers open with guild fame. Each tier starts showing up at 80% of its fame and fully
// replaces the tier below at 120%, rising linearly in between.
export const TIER_FAME = [50, 200, 1000, 2000, 4000, 10000, 20000];

// Fame at which applicants of this tier start to appear.
export function tierStartFame(tier: number): number {
    return tier <= 0 ? 0 : Math.round(0.8 * TIER_FAME[tier - 1]);
}

// Chance that an applicant is at least this tier, at this much fame.
function atLeastTier(fame: number, tier: number): number {
    if (tier <= 0) return 1;
    const target = TIER_FAME[tier - 1];
    return Math.max(0, Math.min(1, (fame - 0.8 * target) / (0.4 * target)));
}

// Chance of each tier for the next applicant.
export function applicantTierOdds(state: GameState): number[] {
    return ambitionTierNames.map((_, t) => atLeastTier(state.fame, t) - (t + 1 < ambitionTierNames.length ? atLeastTier(state.fame, t + 1) : 0));
}

// The tier the guild's fame has fully reached, for prices and for members from older saves.
export function guildTier(state: GameState): number {
    return TIER_FAME.filter(f => state.fame >= f).length;
}

const pick = <T>(list: T[], rng: () => number): T => list[Math.floor(rng() * list.length)];

interface AmbitionInfo {
    classKey: string
    multiKill: boolean
    // Deadeye lands every hit of an attack as one combined hit, so a multi-hit chain can't happen.
    combinedHits: boolean
}

interface Template {
    kind: AmbitionKind
    // Returns undefined when the template doesn't fit this tier or class.
    make(tier: number, info: AmbitionInfo, rng: () => number): Omit<Ambition, 'tier' | 'fame' | 'kind'> | undefined
}

const progressTemplates: Template[] = [
    // At most MAX_LEVEL_AMBITION, the highest level XP can reach in this version (75 with every modifier on the Shattered Throne).
    {kind: 'level', make: tier => ({target: Math.min(MAX_LEVEL_AMBITION, [10, 25, 45, 70, 90, 95, 100, 100][tier])})},
    {kind: 'endless', make: (tier, _c, rng) => {
        const options: [string, number][][] = [[], [['brambleRoad', 15]], [['brambleRoad', 30], ['hollowMines', 20]], [['hollowMines', 30], ['ashenPeaks', 25], ['sunkenMarsh', 25], ['thunderheadCrags', 25]], [['ashenPeaks', 35], ['sunkenMarsh', 35], ['thunderheadCrags', 35], ['hollowMines', 40], ['sunderedRift', 20]],
            [['ashenPeaks', 50], ['sunkenMarsh', 50], ['thunderheadCrags', 50], ['hollowMines', 60], ['sunderedRift', 30]], [['ashenPeaks', 70], ['sunkenMarsh', 70], ['thunderheadCrags', 70], ['hollowMines', 80], ['sunderedRift', 45]], [['ashenPeaks', 100], ['sunkenMarsh', 100], ['thunderheadCrags', 100], ['hollowMines', 100], ['sunderedRift', 70]]];
        if (!options[tier].length) return undefined;
        const [quest, target] = pick(options[tier], rng);
        return {quest, target};
    }},
];

const buildTemplates: Template[] = [
    {kind: 'bigHit', make: tier => ({target: [60, 250, 600, 1500, 4000, 8000, 15000, 30000][tier]})},
    {kind: 'chain', make: (tier, info) => info.combinedHits ? undefined : {target: [5, 6, 7, 8, 9, 10, 11, 12][tier]}},
    {kind: 'multiKill', make: (tier, info) => info.multiKill ? {target: [2, 3, 3, 4, 5, 5, 6, 6][tier]} : undefined},
    {kind: 'clearMods', make: (tier, _c, rng) => {
        const options: [string, number][][] = [[['brambleRoad', 1]], [['brambleRoad', 3], ['hollowMines', 1]], [['hollowMines', 3], ['ashenPeaks', 1], ['sunkenMarsh', 1], ['thunderheadCrags', 1]], [['ashenPeaks', 3], ['sunkenMarsh', 3], ['thunderheadCrags', 3], ['hollowMines', 5]], [['ashenPeaks', 5], ['sunkenMarsh', 5], ['thunderheadCrags', 5], ['hollowMines', 7], ['sunderedRift', 1]],
            [['ashenPeaks', 6], ['sunkenMarsh', 6], ['thunderheadCrags', 6], ['hollowMines', 7], ['sunderedRift', 3]], [['ashenPeaks', 7], ['sunkenMarsh', 7], ['thunderheadCrags', 7], ['sunderedRift', 5]], [['ashenPeaks', 7], ['sunkenMarsh', 7], ['thunderheadCrags', 7], ['sunderedRift', 7]]];
        const [quest, target] = pick(options[tier], rng);
        return {quest, target};
    }},
    {kind: 'bareClear', make: tier => ({quest: [`brambleRoad`, 'brambleRoad', 'hollowMines', 'ashenPeaks', 'sunkenMarsh', 'thunderheadCrags', 'sunderedRift', 'sunderedRift'][tier], target: 1})},
];

// Boss ambitions: the quest's ambition boss, which only shows up with these modifiers on. Every
// quest a tier can reach stays in the pool, so higher tiers never lock out an earlier legendary.
// A boss below the tier's level asks for one more easy modifier per tier above it.
const bossQuests: {quest: string, minTier: number, topTier: number}[] = [
    {quest: 'brambleRoad', minTier: 0, topTier: 1},
    {quest: 'hollowMines', minTier: 2, topTier: 2},
    {quest: 'ashenPeaks', minTier: 3, topTier: 2},
    {quest: 'sunkenMarsh', minTier: 3, topTier: 2},
    {quest: 'thunderheadCrags', minTier: 3, topTier: 2},
    {quest: 'sunderedRift', minTier: 4, topTier: 4},
    {quest: 'amberHive', minTier: 4, topTier: 4},
    {quest: 'duskgraveNecropolis', minTier: 4, topTier: 4},
    {quest: 'ironboundFoundry', minTier: 4, topTier: 4},
    {quest: 'skyspireAerie', minTier: 4, topTier: 4},
    {quest: 'shatteredThrone', minTier: 5, topTier: 5},
];
// Overwhelming numbers is too big a step to be an easy add-on. Elite patrol comes in only once the
// easy ones run out.
const easyMods = ['hardened', 'swift', 'brutal'];
const nextMods = [...easyMods, 'elite'];
// A recruit only dreams of bosses on quests well above where they start, so a high-level hire can't
// collect one on day one.
export const BOSS_LEVEL_MARGIN = 3;
export const MAX_LEVEL_AMBITION = 70;
function bossAmbition(tier: number, rng: () => number, startLevel = 1): Omit<Ambition, 'tier' | 'fame' | 'kind'> | undefined {
    const options = bossQuests.filter(b => b.minTier <= tier && quests[b.quest]?.boss && questXpLevel(quests[b.quest]) >= startLevel + BOSS_LEVEL_MARGIN);
    if (!options.length) return undefined;
    const option = pick(options, rng);
    const quest = option.quest;
    const elemental = quests[quest].modifiers.filter(m => m.exclusive).map(m => m.key);
    const mods = [rng() < 0.5 && elemental.length ? pick(elemental, rng) : pick(easyMods, rng)];
    for (let extra = 0; extra < tier - option.topTier; extra++) {
        let left = easyMods.filter(m => !mods.includes(m));
        if (!left.length) left = nextMods.filter(m => !mods.includes(m));
        if (!left.length) break;
        mods.push(pick(left, rng));
    }
    return {quest, target: 1, mods};
}

function ambitionInfo(classKey: string, keys: PassiveKey[]): AmbitionInfo {
    return {classKey, multiKill: keys.includes('followThrough') || keys.includes('cleave'), combinedHits: keys.includes('deadeye')};
}

// Swaps out ambitions the holder's passives can never fulfil (a Deadeye hero's multi-hit chain)
// for another build ambition they don't have yet, at the same tier and fame.
export function replaceUnreachableAmbitions(holder: {classKey: string, passives?: {key: PassiveKey}[], ambitions?: Ambition[]}, rng: () => number = Math.random) {
    if (!holder.ambitions) return;
    const keys = holder.passives?.map(p => p.key) ?? (classes[holder.classKey]?.passiveKey ? [classes[holder.classKey].passiveKey!] : []);
    const info = ambitionInfo(holder.classKey, keys);
    if (!info.combinedHits) return;
    holder.ambitions = holder.ambitions.flatMap(a => {
        if (a.kind !== 'chain' || a.done) return [a];
        const options = buildTemplates.filter(t => !holder.ambitions!.some(o => o.kind === t.kind))
            .map(t => ({t, made: t.make(a.tier, info, rng)})).filter(x => x.made);
        if (!options.length) return [];
        const o = pick(options, rng);
        return [{kind: o.t.kind, tier: a.tier, fame: a.fame, ...o.made!}];
    });
}

export function rollAmbitions(tier: number, classKey: string, rng: () => number = Math.random, startLevel = 1, passiveKeys?: PassiveKey[]): Ambition[] {
    const keys = passiveKeys ?? (classes[classKey]?.passiveKey ? [classes[classKey].passiveKey!] : []);
    // Killing several monsters with one attack needs a passive that reaches past the first.
    const info = ambitionInfo(classKey, keys);
    const fame = AMBITION_FAME[tier];
    const out: Ambition[] = [];
    const progress = progressTemplates.map(t => ({t, made: t.make(tier, info, rng)})).filter(x => x.made);
    const p = pick(progress, rng);
    out.push({kind: p.t.kind, tier, fame, ...p.made!});
    // About a third of adventurers dream of a boss.
    if (rng() < 0.35) {
        const boss = bossAmbition(tier, rng, startLevel);
        if (boss) out.push({kind: 'boss', tier, fame: Math.round(fame * 1.5), ...boss});
    }
    const builds = buildTemplates.map(t => ({t, made: t.make(tier, info, rng)})).filter(x => x.made);
    while (out.length < 3 && builds.length) {
        const i = Math.floor(rng() * builds.length);
        const b = builds.splice(i, 1)[0];
        out.push({kind: b.t.kind, tier, fame, ...b.made!});
    }
    return out;
}

const modName = (questKey: string, key: string) => quests[questKey].modifiers.find(m => m.key === key)?.name ?? key;

export function ambitionText(a: Ambition): string {
    const q = a.quest ? quests[a.quest].name : '';
    switch (a.kind) {
        case 'level': return `Reach level ${a.target}`;
        case 'endless': return `Reach encounter ${a.target} in ${q}: Endless`;
        case 'bigHit': return `Deal ${a.target.toLocaleString()} damage in one hit`;
        case 'chain': return `Land ${a.target} hits with one attack`;
        case 'multiKill': return `Kill ${a.target} monsters with one attack`;
        case 'clearMods': return `Fully clear ${q} with ${a.target} modifier${a.target > 1 ? 's' : ''} on`;
        case 'bareClear': return `Fully clear ${q} with no body armor, helmet, gloves or boots`;
        case 'boss': {
            const boss = quests[a.quest!].boss!;
            return `Defeat ${monsters[boss.monster].name} in ${q}`;
        }
    }
}

// Extra detail for the ambition, such as how a boss is reached.
export function ambitionHint(a: Ambition): string {
    if (a.kind === 'boss') {
        const boss = quests[a.quest!].boss!;
        return `Appears after ${quests[a.quest!].name}'s final encounter on a full clear with ${(a.mods ?? []).map(m => modName(a.quest!, m)).join(' and ')} on (modifiers open after the first full clear). Drops ${requireMaterial(boss.legendary).name}, a legendary.`;
    }
    return '';
}

// Current progress toward an ambition, as [value, target].
export function ambitionProgress(adventurer: Adventurer, a: Ambition): [number, number] {
    const r = records(adventurer);
    switch (a.kind) {
        case 'level': return [adventurer.level, a.target];
        case 'endless': return [(adventurer.endlessBest?.[a.quest!] ?? -1) + 1, a.target];
        case 'bigHit': return [Math.floor(r.bestHit), a.target];
        case 'chain': return [r.bestChain, a.target];
        case 'multiKill': return [r.bestKills, a.target];
        case 'clearMods': return [r.modClears[a.quest!] ?? 0, a.target];
        case 'bareClear': return [r.bareClears.includes(a.quest!) ? 1 : 0, 1];
        case 'boss': return [r.bosses.includes(a.quest!) ? 1 : 0, 1];
    }
}

function isMet(adventurer: Adventurer, a: Ambition): boolean {
    const [value, target] = ambitionProgress(adventurer, a);
    return value >= target;
}

// Latches newly fulfilled ambitions. Returns them for the UI to announce.
export function checkAmbitions(state: GameState): {adventurer: Adventurer, ambition: Ambition}[] {
    const out: {adventurer: Adventurer, ambition: Ambition}[] = [];
    for (const adventurer of state.adventurers) {
        for (const a of adventurer.ambitions ?? []) {
            if (!a.done && isMet(adventurer, a)) {
                a.done = true;
                out.push({adventurer, ambition: a});
            }
        }
    }
    return out;
}

// Fame paid on retiring: the fulfilled ambitions' fame, times the set multiplier.
export function retireFame(adventurer: Adventurer): number {
    const done = (adventurer.ambitions ?? []).filter(a => a.done);
    return Math.round(done.reduce((sum, a) => sum + a.fame, 0) * RETIRE_MULTIPLIER[Math.min(3, done.length)]);
}

// The boss ambition, if this adventurer still has one for this quest.
export function bossAmbitionFor(adventurer: Adventurer, questKey: string): Ambition | undefined {
    return (adventurer.ambitions ?? []).find(a => a.kind === 'boss' && a.quest === questKey && !a.done);
}

// ---------------- Applicants ----------------

function rollApplicantTier(state: GameState, rng: () => number): number {
    const odds = applicantTierOdds(state);
    let r = rng();
    for (let t = 0; t < odds.length; t++) {
        r -= odds[t];
        if (r < 0) return t;
    }
    return 0;
}

// Classes an applicant of this tier can be: every class tier up to it, weighted toward the newest.
function rollClass(tier: number, rng: () => number): string {
    const options = Object.values(classes).filter(c => c.tier <= tier && !c.hidden);
    const total = options.reduce((sum, c) => sum + 1 + c.tier, 0);
    let r = rng() * total;
    return (options.find(c => (r -= 1 + c.tier) < 0) ?? options[0]).key;
}

// Core passives for the special top classes: the Champion's one enhanced, the Vagabond's three.
function rollCorePassives(classKey: string, rng: () => number): HeroPassive[] | undefined {
    const special = classes[classKey].special;
    if (!special) return undefined;
    const pool = [...new Set(Object.values(classes).filter(c => !c.special && !c.hidden && c.passiveKey).map(c => c.passiveKey!))];
    const out: HeroPassive[] = [];
    for (let n = special === 'enhanced' ? 1 : 3; n > 0 && pool.length; n--) {
        const key = pool.splice(Math.floor(rng() * pool.length), 1)[0];
        out.push(special === 'enhanced' ? {key, enhanced: true} : {key});
    }
    return out;
}

export function passiveNames(list: HeroPassive[]): string {
    return list.map(p => (p.enhanced ? 'Enhanced ' : '') + passiveDefs[p.key].name).join(', ');
}

// An Empty Vessel's one ambition: reach level 75, past the usual MAX_LEVEL_AMBITION.
export const VESSEL_LEVEL = 75;
function vesselAmbition(tier: number): Ambition {
    return {kind: 'level', tier, fame: AMBITION_FAME[tier] * 3, target: VESSEL_LEVEL};
}

export function rollApplicant(state: GameState, taken: Set<string>, rng: () => number = Math.random): Applicant {
    const tier = rollApplicantTier(state, rng);
    let classKey = rollClass(tier, rng);
    let corePassives = rollCorePassives(classKey, rng);
    // One rare bonus slot per tier the class sits below the applicant's tier. Vagabond's Compass
    // can curse them; five curses empty the applicant out into an Empty Vessel.
    const {bonuses, curses} = rollBonuses(Math.max(0, tier - classes[classKey].tier), rng, trophyTotal(state, 'curseChance'));
    const vessel = curseCount({curses}) >= VESSEL_CURSES;
    if (vessel) {
        classKey = 'emptyVessel';
        corePassives = undefined;
    }
    const bestLevel = Math.max(1, ...state.adventurers.map(a => a.level));
    const cap = Math.max(1, Math.min(START_LEVEL_CAP[tier], Math.floor(bestLevel / 2)));
    const level = 1 + Math.floor(rng() * cap);
    const names = classes[classKey].names.filter(n => !taken.has(n));
    const name = names.length ? pick(names, rng) : `${pick(classes[classKey].names, rng)} ${state.nextId}`;
    taken.add(name);
    const applicant: Applicant = {id: 'app' + state.nextId++, name, classKey, level, tier, fee: HIRE_FEES[tier], ambitions: vessel ? [vesselAmbition(tier)] : rollAmbitions(tier, classKey, rng, level, corePassives?.map(p => p.key))};
    if (corePassives) applicant.passives = corePassives;
    if (Object.keys(bonuses).length) applicant.bonuses = bonuses;
    if (Object.keys(curses).length) applicant.curses = curses;
    return applicant;
}

// Keeps every applicant slot filled, so a hire is replaced right away.
export function ensureApplicants(state: GameState) {
    const slots = applicantSlots(state);
    const list = (state.applicants ?? []).slice(0, slots);
    const taken = new Set([...state.adventurers.map(a => a.name), ...list.map(a => a.name)]);
    while (list.length < slots) list.push(rollApplicant(state, taken));
    state.applicants = list;
}

export function refreshCost(state: GameState): number {
    return REFRESH_COST[guildTier(state)];
}

export function refreshApplicants(state: GameState): boolean {
    const cost = refreshCost(state);
    if (state.gold < cost) return false;
    state.gold -= cost;
    state.applicants = [];
    ensureApplicants(state);
    return true;
}

// Existing adventurers from before ambitions get a set at the guild's current tier.
export function giveAmbitions(state: GameState, adventurer: Adventurer) {
    adventurer.ambitions ??= rollAmbitions(guildTier(state), adventurer.classKey, Math.random, adventurer.level, adventurer.passives?.map(p => p.key));
    replaceUnreachableAmbitions(adventurer);
    // Older saves rolled level ambitions up to 100; they cap at MAX_LEVEL_AMBITION now.
    if (adventurer.classKey !== 'emptyVessel') for (const a of adventurer.ambitions) if (a.kind === 'level' && a.target > MAX_LEVEL_AMBITION) a.target = MAX_LEVEL_AMBITION;
    adventurer.records ??= emptyRecords();
}

// A new game's first hero is a free pick among one level 1 applicant of each starter class.
export const STARTER_CLASSES = ['warrior', 'ranger', 'priest'];
export function rollStarters(state: GameState, rng: () => number = Math.random): Applicant[] {
    return STARTER_CLASSES.map(classKey => ({
        id: 'app' + state.nextId++,
        name: pick(classes[classKey].names, rng),
        classKey,
        level: 1,
        tier: 0,
        fee: 0,
        ambitions: rollAmbitions(0, classKey, rng, 1),
    }));
}
