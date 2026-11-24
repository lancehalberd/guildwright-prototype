import {itemTypes, slotOrder} from '../data/items';
import {requireMaterial} from '../data/materials';
import {classes, quests, unlockMet} from '../data/quests';
import {previewCraft} from './crafting';
import {getSellValue} from './crafting';
import {getAdventurerStats, invalidateStats, isTwoHandedEquipped, resolveItemRef, totalXpForLevel} from './stats';
import {expansions, slotUnlocks, unlockFame, startingGuild, trackNames, type Expansion, type SlotTrack, type SlotUnlock} from '../data/milestones';
import {trophyList, tierFor, MAX_TROPHY_SLOTS} from '../data/trophies';
import {applicantSlotFame, applicantSlots, checkAmbitions, ambitionText, ensureApplicants, retireFame, emptyRecords, rollStarters} from './ambitions';
import {grantedModifiers} from './contracts';
import {hasKeys, portalOpen} from './portal';
import type {Adventurer, Applicant, CraftedItem, GameState, ItemRef, ItemTypeKey, LogEntry, QuestDef, QuestModifierDef, QuestProgress, SlotKey} from './types';

export const SAVE_VERSION = 8;

export function createAdventurer(state: GameState, name: string, classKey: string): Adventurer {
    const adventurer: Adventurer = {
        id: 'adv' + state.nextId++,
        name,
        classKey,
        level: 1,
        xp: 0,
        hp: 1,
        equipment: {},
        assignment: null,
        activity: {kind: 'idle'},
    };
    // Every class starts with its weapons made from one Wood each. The Monk starts unarmed.
    const cls = classes[classKey];
    const starters: [SlotKey, ItemTypeKey | undefined][] = [['mainHand', cls.starterWeapon], ['offHand', cls.starterOffHand]];
    for (const [slot, type] of starters) {
        const preview = type && previewCraft(type, ['wood'], []);
        if (type && preview) {
            const item: CraftedItem = {id: 'item' + state.nextId++, itemType: type, name: preview.name, base: ['wood'], decorations: [], power: 1};
            state.craftedItems.push(item);
            adventurer.equipment[slot] = {kind: 'crafted', id: item.id};
        }
    }
    adventurer.hp = getAdventurerStats(state, adventurer).maxHealth;
    return adventurer;
}

export function canHire(state: GameState, fee: number): string | null {
    if (state.adventurers.length >= state.guild.memberSlots) {
        return 'No free member slots';
    }
    if (state.gold < fee) {
        return `Needs ${fee} gold`;
    }
    return null;
}

// Hires one of the applicants. They join at their level with their ambitions, and a new applicant
// takes their place.
export function hireApplicant(state: GameState, applicantId: string): Adventurer | string {
    const applicant = state.applicants?.find(a => a.id === applicantId);
    if (!applicant) {
        return 'That applicant has left';
    }
    const blocked = canHire(state, applicant.fee);
    if (blocked) {
        return blocked;
    }
    state.gold -= applicant.fee;
    const adventurer = adventurerFromApplicant(state, applicant);
    state.applicants = state.applicants!.filter(a => a !== applicant);
    ensureApplicants(state);
    return adventurer;
}

// A new game's first hero: one of the three starters, free. Returns null if it isn't on offer.
export function chooseStarter(state: GameState, applicantId: string): Adventurer | null {
    const applicant = state.starters?.find(a => a.id === applicantId);
    if (!applicant || state.adventurers.length) return null;
    delete state.starters;
    return adventurerFromApplicant(state, applicant);
}

function adventurerFromApplicant(state: GameState, applicant: Applicant): Adventurer {
    const adventurer = createAdventurer(state, applicant.name, applicant.classKey);
    adventurer.level = applicant.level;
    adventurer.xp = totalXpForLevel(applicant.level);
    adventurer.ambitions = applicant.ambitions;
    if (applicant.passives) adventurer.passives = applicant.passives;
    if (applicant.bonuses) adventurer.bonuses = applicant.bonuses;
    adventurer.records = emptyRecords();
    invalidateStats();
    adventurer.hp = getAdventurerStats(state, adventurer).maxHealth;
    state.adventurers.push(adventurer);
    return adventurer;
}

// Each adventurer picks their own modifiers per quest. Only unlocked ones count, plus any their
// contract or boss ambition grants.
export function getActiveModifiers(state: GameState, adventurer: Adventurer | undefined, quest: QuestDef): string[] {
    // Endless runs never take modifiers, whatever a contract or ambition asks for.
    if (quest.endless) return [];
    const chosen = adventurer?.questModifiers?.[quest.key] ?? getQuestProgress(state, quest.key).activeModifiers ?? [];
    const granted = grantedModifiers(state, adventurer, quest.key);
    return chosen.filter(k => isModifierUnlocked(state, quest, k) || granted.includes(k));
}
export function setActiveModifiers(adventurer: Adventurer, questKey: string, keys: string[]) {
    adventurer.questModifiers = {...adventurer.questModifiers, [questKey]: keys};
}

export function createNewGame(): GameState {
    const state: GameState = {
        version: SAVE_VERSION,
        time: 0,
        gold: 0,
        fame: 0,
        materials: {},
        obtained: {},
        benchOwned: false,
        guide: {},
        craftedItems: [],
        adventurers: [],
        guild: {...startingGuild},
        trophies: {},
        trophySlots: [],
        achievements: [],
        questProgress: {},
        nextId: 1,
    };
    // The player picks the first hero from three free starters (see chooseStarter).
    state.starters = rollStarters(state);
    return state;
}

export function getQuestProgress(state: GameState, questKey: string): QuestProgress {
    let progress = state.questProgress[questKey];
    if (progress && !progress.revealed.M) {
        // Saves from before mythic pools.
        progress.revealed.M = [];
    }
    if (!progress) {
        progress = {
            revealed: {C: [], U: [], R: [], M: []},
            seen: [],
            runs: 0,
            fullClears: 0,
            bestEncounter: -1,
            log: [],
        };
        state.questProgress[questKey] = progress;
    }
    return progress;
}

export function addLog(state: GameState, questKey: string, text: string, kind: LogEntry['kind']) {
    const progress = getQuestProgress(state, questKey);
    progress.log.unshift({time: state.time, text, kind});
    progress.log.length = Math.min(progress.log.length, 30);
}

export function addMaterial(state: GameState, key: string, amount: number) {
    state.materials[key] = (state.materials[key] ?? 0) + amount;
    state.obtained[key] = (state.obtained[key] ?? 0) + amount;
}

// A quest's modifiers (its own and those an ambition grants) open after its first full clear.
export function isQuestCleared(state: GameState, questKey: string): boolean {
    const progress = getQuestProgress(state, questKey);
    return progress.fullClears > 0 || (progress.bestModifiedClear ?? -1) >= 0;
}

export function isModifierUnlocked(state: GameState, quest: QuestDef, key: string): boolean {
    const def = quest.modifiers.find(m => m.key === key);
    if (!def || def.exclusive) {
        return false;
    }
    const progress = getQuestProgress(state, quest.key);
    if (def.unlock.kind === 'firstClear') {
        return progress.fullClears > 0 || (progress.bestModifiedClear ?? -1) >= 0;
    }
    if (def.unlock.kind === 'keys') {
        return hasKeys(state, def.unlock.keys);
    }
    return (progress.bestModifiedClear ?? -1) >= def.unlock.count;
}

export function modifierUnlockText(def: QuestModifierDef): string {
    if (def.unlock.kind === 'keys') return `Needs one of each key: ${def.unlock.keys.map(k => requireMaterial(k).name).join(', ')}`;
    return def.unlock.kind === 'firstClear'
        ? 'Unlocks after your first full clear'
        : `Unlocks after a full clear with ${def.unlock.count} modifier${def.unlock.count === 1 ? '' : 's'} active`;
}

export interface TrophyEarned {
    key: string
    tier: number
    fame: number
}

// Awards trophy tiers reached since the last check (each tier's fame once), then reapplies guild
// limits. Returns new trophies and newly affordable-in-principle unlocks (expansions and trophy
// slots whose fame is now reached) so the UI can announce them.
export function checkProgress(state: GameState): {trophies: TrophyEarned[], notices: string[]} {
    state.trophies ??= {};
    const earned: TrophyEarned[] = [];
    for (const def of trophyList) {
        const had = state.trophies[def.key] ?? -1;
        const tier = tierFor(def, def.value(state));
        for (let t = had + 1; t <= tier; t++) {
            state.fame += def.tiers[t].fame;
            earned.push({key: def.key, tier: t, fame: def.tiers[t].fame});
        }
        if (tier > had) {
            state.trophies[def.key] = tier;
            invalidateStats();
        }
    }
    state.milestones ??= [];
    const notices: string[] = [];
    const announce = (key: string, text: string) => {
        if (!state.milestones!.includes(key)) {
            state.milestones!.push(key);
            notices.push(text);
        }
    };
    for (const e of expansions) {
        if (state.fame >= e.fame && (state.expansion ?? 0) < e.level) {
            announce('expansion-' + e.level, `${e.fame} fame: you can expand the guild for ${e.gold} gold`);
        }
    }
    for (const u of slotUnlocks) {
        if (u.fame && state.fame >= u.fame && !(state.unlocks ?? []).includes(u.key)) {
            announce(u.key, `${u.fame} fame: a ${trackNames[u.track]} can be bought for ${u.gold} gold`);
        }
    }
    for (const {adventurer, ambition} of checkAmbitions(state)) {
        notices.push(`${adventurer.name} fulfilled an ambition: ${ambitionText(ambition)}. Retire them for ${retireFame(adventurer)} fame`);
    }
    applyGuildUnlocks(state);
    return {trophies: earned, notices};
}

// Guild limits: the starting slots plus every slot bought, and the first trophy slot once any
// trophy is earned.
export function applyGuildUnlocks(state: GameState) {
    const g = {...startingGuild};
    const bought = new Set(state.unlocks ?? []);
    for (const u of slotUnlocks) {
        if (!bought.has(u.key)) continue;
        if (u.track === 'baseSlot') g.maxBaseMaterials++;
        if (u.track === 'accessorySlot') g.maxAccessoryBaseMaterials++;
        if (u.track === 'decorationSlot') g.maxDecorations++;
        if (u.track === 'accessoryDecorationSlot') g.maxAccessoryDecorations++;
        if (u.track === 'memberSlot') g.memberSlots++;
        if (u.track === 'trophySlot') g.trophySlots++;
    }
    if (Object.keys(state.trophies ?? {}).length) g.trophySlots++;
    g.trophySlots = Math.min(MAX_TROPHY_SLOTS, g.trophySlots);
    // Never strand a member who was hired under older rules.
    g.memberSlots = Math.max(g.memberSlots, state.adventurers.length);
    state.guild = g;
    state.trophySlots ??= [];
    state.trophySlots.length = Math.min(state.trophySlots.length, g.trophySlots);
}

// The next slot on a track, and what stands in the way of buying it (null = it can be bought now).
export function nextSlot(state: GameState, track: SlotTrack): {unlock: SlotUnlock, blocked: string | null, needsGoldOnly: boolean, expansion?: number} | undefined {
    const bought = state.unlocks ?? [];
    const unlock = slotUnlocks.find(u => u.track === track && !bought.includes(u.key));
    if (!unlock) {
        return undefined;
    }
    if (track === 'trophySlot' && !Object.keys(state.trophies ?? {}).length) {
        return {unlock, blocked: 'Opens with your first trophy', needsGoldOnly: false};
    }
    if (unlock.expansion && (state.expansion ?? 0) < unlock.expansion) {
        return {unlock, blocked: `Requires Guild Expansion ${unlock.expansion}`, needsGoldOnly: false, expansion: unlock.expansion};
    }
    if (unlock.fame && state.fame < unlock.fame) {
        return {unlock, blocked: `Requires ${unlock.fame} fame`, needsGoldOnly: false};
    }
    if (state.gold < unlock.gold) {
        return {unlock, blocked: `Needs ${unlock.gold} gold`, needsGoldOnly: true};
    }
    return {unlock, blocked: null, needsGoldOnly: true};
}

export function buySlot(state: GameState, track: SlotTrack): boolean {
    const next = nextSlot(state, track);
    if (!next || next.blocked) {
        return false;
    }
    state.gold -= next.unlock.gold;
    state.unlocks = [...(state.unlocks ?? []), next.unlock.key];
    state.fame += unlockFame(next.unlock);
    applyGuildUnlocks(state);
    return true;
}

export function nextExpansion(state: GameState): Expansion | undefined {
    return expansions.find(e => e.level === (state.expansion ?? 0) + 1);
}

export function expandGuild(state: GameState): boolean {
    const e = nextExpansion(state);
    if (!e || state.fame < e.fame || state.gold < e.gold) {
        return false;
    }
    const applicantsBefore = applicantSlots(state);
    state.gold -= e.gold;
    state.expansion = e.level;
    state.fame += applicantSlotFame(applicantsBefore, applicantSlots(state));
    ensureApplicants(state);
    return true;
}

export function equipTrophy(state: GameState, slot: number, key: string | null) {
    state.trophySlots ??= [];
    if (key) {
        // A trophy sits in one slot at a time.
        state.trophySlots = state.trophySlots.map(k => k === key ? null : k);
    }
    while (state.trophySlots.length <= slot) state.trophySlots.push(null);
    state.trophySlots[slot] = key;
    invalidateStats();
    for (const a of state.adventurers) clampHp(state, a);
}

export function isQuestUnlocked(state: GameState, questKey: string): boolean {
    if (quests[questKey].portal && !portalOpen(state)) return false;
    const endless = quests[questKey].endless;
    if (endless) {
        // Opens after the first full clear of its quest.
        return state.achievements.includes('clear-' + endless.baseKey);
    }
    const quest = quests[questKey];
    if (!unlockMet(state.achievements, quest)) {
        return false;
    }
    return state.fame >= quest.fameToUnlock;
}

export function isItemEquipped(state: GameState, itemId: string): Adventurer | undefined {
    return state.adventurers.find(a => Object.values(a.equipment).some(ref => ref?.kind === 'crafted' && ref.id === itemId));
}

// Equipped items can change max HP, so keep current HP within the new max.
function clampHp(state: GameState, adventurer: Adventurer) {
    invalidateStats();
    const max = getAdventurerStats(state, adventurer).maxHealth;
    adventurer.hp = Math.min(adventurer.hp, max);
}

export function unequip(state: GameState, adventurer: Adventurer, slot: SlotKey) {
    const ref = adventurer.equipment[slot];
    if (!ref) {
        return;
    }
    if (ref.kind === 'material') {
        state.materials[ref.key] = (state.materials[ref.key] ?? 0) + 1;
    }
    delete adventurer.equipment[slot];
    clampHp(state, adventurer);
}

// Gear needs a level from the strongest material in it: power 1 at level 1, then 3 levels per power,
// so a new member can't wear the guild's best gear on day one.
export function levelForPower(power: number): number {
    return 1 + 3 * Math.max(0, power - 1);
}
export function itemLevelRequirement(state: GameState, ref: ItemRef): number {
    if (ref.kind === 'crafted') {
        // From the base materials only, so items crafted before decorations stopped counting follow
        // the current rule too.
        const item = state.craftedItems.find(i => i.id === ref.id);
        return levelForPower(Math.max(1, ...(item?.base ?? []).map(k => requireMaterial(k).power)));
    }
    return levelForPower(requireMaterial(ref.key).power);
}

export function canEquipInSlot(state: GameState, adventurer: Adventurer, ref: ItemRef, slot: SlotKey, ignoreLevel = false): boolean {
    const item = resolveItemRef(state, ref);
    if (!item || !itemTypes[item.itemType].slots.includes(slot)) {
        return false;
    }
    if (!ignoreLevel && adventurer.level < itemLevelRequirement(state, ref)) {
        return false;
    }
    if (slot === 'offHand' && isTwoHandedEquipped(state, adventurer)) {
        return false;
    }
    return true;
}

export function equip(state: GameState, adventurer: Adventurer, ref: ItemRef, slot: SlotKey): boolean {
    if (!canEquipInSlot(state, adventurer, ref, slot)) {
        return false;
    }
    if (ref.kind === 'material') {
        if ((state.materials[ref.key] ?? 0) < 1) {
            return false;
        }
        state.materials[ref.key] -= 1;
    } else {
        const other = isItemEquipped(state, ref.id);
        if (other) {
            return false;
        }
    }
    unequip(state, adventurer, slot);
    adventurer.equipment[slot] = ref;
    if (state.guide?.bought) state.guide.equipped = true;
    const item = resolveItemRef(state, ref);
    if (slot === 'mainHand' && item && itemTypes[item.itemType].twoHanded) {
        unequip(state, adventurer, 'offHand');
    }
    clampHp(state, adventurer);
    return true;
}

// Removes a member from the guild. Their gear goes back to storage, their fulfilled ambitions pay
// fame, and they join the Hall of Legends. Needs at least one member left.
export function retireAdventurer(state: GameState, adventurer: Adventurer): number | false {
    if (state.adventurers.length <= 1 || !state.adventurers.includes(adventurer)) {
        return false;
    }
    checkAmbitions(state);
    for (const slot of slotOrder) {
        unequip(state, adventurer, slot);
    }
    const fame = retireFame(adventurer);
    state.fame += fame;
    state.legends = [...(state.legends ?? []), {
        name: adventurer.name, classKey: adventurer.classKey, level: adventurer.level,
        ambitions: adventurer.ambitions ?? [], fame, records: adventurer.records,
    }];
    state.adventurers = state.adventurers.filter(a => a !== adventurer);
    invalidateStats();
    return fame;
}

export function sellItem(state: GameState, itemId: string): boolean {
    const index = state.craftedItems.findIndex(i => i.id === itemId);
    if (index < 0 || isItemEquipped(state, itemId)) {
        return false;
    }
    state.gold += getSellValue(state.craftedItems[index]);
    state.craftedItems.splice(index, 1);
    return true;
}
