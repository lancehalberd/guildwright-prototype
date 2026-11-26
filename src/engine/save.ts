import {quests} from '../data/quests';
import {checkProgress, createNewGame, SAVE_VERSION} from './state';
import {tierFor, trophies, trophyList} from '../data/trophies';
import {giveAmbitions, MAX_LEVEL_AMBITION, replaceUnreachableAmbitions} from './ambitions';
import {slotUnlocks, startingGuild, unlockFame} from '../data/milestones';
import {APPLICANT_SLOTS, applicantSlotFame, applicantSlots} from './ambitions';
import {invalidateStats} from './stats';
import {maxDecorationPower} from './crafting';
import {requireMaterial} from '../data/materials';
import type {GameState} from './types';

const SAVE_KEY = 'guild-crafting-mockup-save';

export function saveGame(state: GameState) {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (error) {
        console.warn('Could not save game', error);
    }
}

// Save text for moving a game between browsers: the save as base64 JSON.
export function exportSave(state: GameState): string {
    const bytes = new TextEncoder().encode(JSON.stringify(state));
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin);
}

// Stores save text (base64 or plain JSON) as the current save. Load it with loadGame().
export function importSave(text: string): string | null {
    const trimmed = text.trim();
    if (!trimmed) return 'No save text to import.';
    let json = trimmed;
    if (!trimmed.startsWith('{')) {
        try {
            const bin = atob(trimmed.replace(/\s+/g, ''));
            json = new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
        } catch {
            return 'That isn\'t save text.';
        }
    }
    try {
        const parsed = JSON.parse(json);
        if (!parsed || typeof parsed !== 'object' || typeof parsed.version !== 'number' || !Array.isArray(parsed.adventurers)) return 'That isn\'t a Guildwright save.';
        if (parsed.version > SAVE_VERSION) return 'That save is from a newer version.';
        localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
        return null;
    } catch {
        return 'That isn\'t a Guildwright save.';
    }
}

export function loadGame(): GameState {
    invalidateStats();
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as GameState;
            if (parsed.version === 1) {
                // Version 2 split base material limits into weapon/armor and accessory limits.
                parsed.guild = {...parsed.guild, maxBaseMaterials: 2, maxAccessoryBaseMaterials: 1};
                parsed.version = 2;
            }
            if (parsed.version === 2) {
                // Version 3 replaced milestones with trophies and fame milestones. Fame is rebuilt
                // from the trophies this save has already earned, without announcing them again.
                parsed.fame = 0;
                parsed.milestones = [];
                parsed.trophies = {};
                parsed.trophySlots = [];
                parsed.version = 3;
                const state = fitToQuests({...createNewGame(), ...parsed});
                checkProgress(state);
                return state;
            }
            if (parsed.version === 3) {
                // Version 4 made slots cost gold. Keep the slots this save already had by marking
                // the cheapest unlocks on each track as bought.
                const g = parsed.guild;
                const keep = (track: string, extra: number) => slotUnlocks.filter(u => u.track === track).slice(0, Math.max(0, extra)).map(u => u.key);
                parsed.unlocks = [
                    ...keep('baseSlot', g.maxBaseMaterials - startingGuild.maxBaseMaterials),
                    ...keep('accessorySlot', g.maxAccessoryBaseMaterials - startingGuild.maxAccessoryBaseMaterials),
                    ...keep('decorationSlot', g.maxDecorations - startingGuild.maxDecorations),
                    ...keep('accessoryDecorationSlot', g.maxDecorations - startingGuild.maxAccessoryDecorations),
                    ...keep('memberSlot', g.memberSlots - startingGuild.memberSlots),
                    ...keep('trophySlot', (g.trophySlots ?? 0) - 1),
                ];
                parsed.expansion = 0;
                parsed.version = 4;
            }
            if (parsed.version === 4) {
                // Version 5 added ambitions and contracts, and split the old Overwhelming numbers
                // into Juggernauts (its stats) and a new Overwhelming numbers that doubles monsters.
                const rename = (keys?: string[]) => keys?.map(k => k === 'overwhelming' ? 'juggernaut' : k);
                for (const a of parsed.adventurers) {
                    if (a.questModifiers) {
                        a.questModifiers = Object.fromEntries(Object.entries(a.questModifiers).map(([q, keys]) => [q, rename(keys)!]));
                    }
                    if (a.run?.modifiers) a.run.modifiers = rename(a.run.modifiers);
                }
                parsed.version = 5;
            }
            if (parsed.version === 5) {
                // Version 6 renamed the 211 Int class to Priest; Wizard is now the 411 Int class.
                const fix = (o?: {classKey: string}) => { if (o && o.classKey === 'wizard') o.classKey = 'priest'; };
                parsed.adventurers.forEach(fix);
                parsed.applicants?.forEach(fix);
                parsed.legends?.forEach(fix);
                if (parsed.trophies?.['class-wizard'] !== undefined) {
                    parsed.trophies['class-priest'] = parsed.trophies['class-wizard'];
                    delete parsed.trophies['class-wizard'];
                }
                parsed.trophySlots = parsed.trophySlots?.map(k => k === 'class-wizard' ? 'class-priest' : k);
                parsed.version = 6;
            }
            if (parsed.version === 6) {
                // Version 7 pays fame for unlocking slots. Pay it for the slots this save already bought.
                const bought = new Set(parsed.unlocks ?? []);
                parsed.fame += slotUnlocks.filter(u => bought.has(u.key)).reduce((sum, u) => sum + unlockFame(u), 0);
                parsed.fame += applicantSlotFame(APPLICANT_SLOTS[0], applicantSlots(parsed));
                parsed.version = 7;
            }
            if (parsed.version === 7) {
                // Version 8 added the merchant, which sells the crafting bench. Older saves keep
                // theirs and skip the opening guidance.
                parsed.benchOwned = true;
                parsed.guide = {firstRunDone: true, bought: true, equipped: true, crafted: true};
                parsed.version = 8;
            }
            if (parsed.version === SAVE_VERSION) {
                // Fill fields added after this save was made.
                return fitToQuests({...createNewGame(), ...parsed});
            }
            console.warn('Discarding save from an older version');
        }
    } catch (error) {
        console.warn('Could not load save', error);
    }
    return createNewGame();
}

// Quests can get shorter between versions. Pull saved indexes back inside the current quests.
function fitToQuests(state: GameState): GameState {
    // A save with heroes already made its first pick (the new-game defaults add fresh starters).
    if (state.adventurers.length) delete state.starters;
    for (const [key, progress] of Object.entries(state.questProgress)) {
        const quest = quests[key];
        if (!quest) continue;
        const last = quest.encounters.length - 1;
        progress.bestEncounter = Math.min(progress.bestEncounter, last);
        progress.seen = progress.seen.filter(i => i <= last);
    }
    // Decorations can be at most two tiers above the strongest base. Items crafted before that
    // rule lose the ones that are too strong, and the materials go back to the inventory.
    for (const item of state.craftedItems) {
        const cap = maxDecorationPower(item.itemType, item.base);
        const removed = item.decorations.filter(k => requireMaterial(k).power > cap);
        if (!removed.length) continue;
        item.decorations = item.decorations.filter(k => requireMaterial(k).power <= cap);
        for (const k of removed) state.materials[k] = (state.materials[k] ?? 0) + 1;
        (state.notices ??= []).push(`${item.name}: ${removed.map(k => requireMaterial(k).name).join(', ')} returned to your materials (too strong a decoration for its bases)`);
    }
    if (state.notices?.length) invalidateStats();
    // Endless trophies became banners (v325): always in effect, so they leave the trophy slots, and
    // their tiers follow the new encounter targets.
    state.trophySlots = state.trophySlots?.map(k => k && trophies[k]?.kind === 'endless' ? null : k);
    for (const def of trophyList) if (def.kind === 'endless' && state.trophies?.[def.key] !== undefined) {
        const tier = tierFor(def, def.value(state));
        if (tier >= 0) state.trophies[def.key] = tier; else delete state.trophies[def.key];
    }
    // Applicants' level ambitions cap like members' (see giveAmbitions).
    for (const app of state.applicants ?? []) if (app.classKey !== 'emptyVessel') for (const a of app.ambitions ?? []) if (a.kind === 'level' && a.target > MAX_LEVEL_AMBITION) a.target = MAX_LEVEL_AMBITION;
    for (const app of state.applicants ?? []) replaceUnreachableAmbitions(app);
    for (const adventurer of state.adventurers) {
        giveAmbitions(state, adventurer);
        const a = adventurer.activity;
        if (a.kind === 'fighting' && a.encounterIndex > quests[a.questKey].encounters.length - 1) {
            adventurer.activity = {kind: 'resting', questKey: a.questKey, remaining: 1, defeated: false};
        }
        if (adventurer.run) {
            const last = quests[adventurer.run.questKey].encounters.length - 1;
            adventurer.run.cleared = Math.min(adventurer.run.cleared, last);
            adventurer.run.stopAt = Math.min(adventurer.run.stopAt, last);
            if (adventurer.run.defeatedAt !== undefined && adventurer.run.defeatedAt > last) delete adventurer.run.defeatedAt;
        }
    }
    return state;
}

export function clearSave() {
    try {
        localStorage.removeItem(SAVE_KEY);
    } catch (error) {
        console.warn('Could not clear save', error);
    }
}
