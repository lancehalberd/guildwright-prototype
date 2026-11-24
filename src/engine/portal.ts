import {quests} from '../data/quests';
import type {GameState} from './types';

// The portal to the final area. Beating the Sanctum rite's boss uses up one of each key and opens
// it for PORTAL_SECONDS of play time; beating it again while it is open adds the same again. When it
// closes, everyone on a portal quest is recalled, as if the player had pressed Recall.

export const PORTAL_SECONDS = 30 * 60;

export function portalOpen(state: GameState): boolean {
    return !!state.portal && state.time < state.portal.openUntil;
}

export function portalSecondsLeft(state: GameState): number {
    return portalOpen(state) ? state.portal!.openUntil - state.time : 0;
}

export function hasKeys(state: GameState, keys: string[]): boolean {
    return keys.every(k => (state.materials[k] ?? 0) > 0);
}

// Uses up one of each key and opens (or extends) the portal. False if a key is missing.
export function openPortal(state: GameState, keys: string[]): boolean {
    if (!hasKeys(state, keys)) return false;
    for (const k of keys) state.materials[k] -= 1;
    state.portal = {openUntil: Math.max(state.time, state.portal?.openUntil ?? 0) + PORTAL_SECONDS};
    return true;
}

export function isPortalQuest(questKey: string): boolean {
    return !!quests[questKey]?.portal;
}
