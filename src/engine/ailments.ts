import type {Ailments, DamageMap} from './types';

// Elemental ailments, on monsters and heroes alike: fire burns, cold chills, lightning shocks.
// Each hit that lands rolls once per element it carries, at a flat AILMENT_CHANCE however much of
// the hit that element is: the ailment's strength already follows the element's damage. Chill and Shock grow with the hit's cold or lightning
// damage compared with a threshold: the HP of an average monster at the encounter's level for
// monsters, the hero's max life for heroes.

export const AILMENT_CHANCE = 0.25;
// Burning deals this share of the hit's fire damage each second, for BURN_SECONDS. Only the
// strongest burn on a target ticks.
export const BURN_SHARE = 0.2;
export const BURN_SECONDS = 2;
// Damage over time (burn, bleed) weaker than this many damage a second is discarded, not applied.
export const MIN_DOT_DPS = 0.5;
// Chill slows attacks by its value; Shock raises damage taken by its value. Both wear off at
// AILMENT_DECAY a second.
export const CHILL_CAP = 0.5;
export const SHOCK_CAP = 0.5;
export const AILMENT_DECAY = 0.1;

export type AilmentKind = 'burn' | 'chill' | 'shock';

// What a hero's gear adds: flat chance per ailment and more effect. Monsters use the defaults.
export interface AilmentBonus {
    chance?: Partial<Record<AilmentKind, number>>
    // Increased ailment chance: multiplies each chance.
    chanceMore?: number
    effect?: number
    // Exploit: longer burns, and a higher chill and shock cap.
    burnSeconds?: number
    cap?: number
    // Deadeye: one combined hit rolls once for each hit in it; any success takes hold.
    rolls?: number
}

// Seconds of ailments left on a target, adding burn, chill and shock (Hex).
export function ailmentSeconds(a: Ailments | undefined): number {
    if (!a) return 0;
    const burn = a.burns?.reduce((best, b) => Math.max(best, b.remaining), 0) ?? 0;
    return burn + (a.chill ?? 0) / AILMENT_DECAY + (a.shock ?? 0) / AILMENT_DECAY;
}

// Rolls ailments for one landed hit. Returns the ones that took hold.
export function inflict(target: Ailments, dealt: DamageMap, threshold: number, rng: () => number, bonus: AilmentBonus = {}): AilmentKind[] {
    const p = (k: AilmentKind) => Math.min(1, (AILMENT_CHANCE + (bonus.chance?.[k] ?? 0)) * (1 + (bonus.chanceMore ?? 0)));
    const rolls = Math.max(1, bonus.rolls ?? 1);
    // Chance that at least one of the rolls succeeds; one rng draw keeps a single roll unchanged.
    const chance = (k: AilmentKind) => 1 - Math.pow(1 - p(k), rolls);
    const cap = bonus.cap ?? 0;
    const effect = Math.max(0, 1 + (bonus.effect ?? 0));
    const landed: AilmentKind[] = [];
    const fire = dealt.fire ?? 0, cold = dealt.cold ?? 0, lightning = dealt.lightning ?? 0;
    if (fire > 0 && rng() < chance('burn') && BURN_SHARE * fire * effect >= MIN_DOT_DPS) {
        (target.burns ??= []).push({dps: BURN_SHARE * fire * effect, remaining: bonus.burnSeconds ?? BURN_SECONDS});
        landed.push('burn');
    }
    if (cold > 0 && rng() < chance('chill')) {
        target.chill = Math.min(Math.max(CHILL_CAP, cap), (target.chill ?? 0) + effect * cold / Math.max(1, threshold));
        landed.push('chill');
    }
    if (lightning > 0 && rng() < chance('shock')) {
        target.shock = Math.min(Math.max(SHOCK_CAP, cap), (target.shock ?? 0) + effect * lightning / Math.max(1, threshold));
        landed.push('shock');
    }
    return landed;
}

export function burnDps(a: Ailments | undefined): number {
    return a?.burns?.reduce((best, b) => Math.max(best, b.dps), 0) ?? 0;
}

// Advances the ailments by dt. Returns the burn damage dealt in that time, before Shock.
export function tickAilments(a: Ailments | undefined, dt: number): number {
    if (!a) return 0;
    let damage = 0;
    if (a.burns?.length) {
        // The strongest burn ticks; every burn's timer runs.
        damage = burnDps(a) * dt;
        for (const b of a.burns) b.remaining -= dt;
        a.burns = a.burns.filter(b => b.remaining > 0);
        if (!a.burns.length) delete a.burns;
    }
    if (a.chill) a.chill = Math.max(0, a.chill - AILMENT_DECAY * dt) || undefined;
    if (a.shock) a.shock = Math.max(0, a.shock - AILMENT_DECAY * dt) || undefined;
    if (a.weaken) a.weaken = Math.max(0, a.weaken - AILMENT_DECAY * dt) || undefined;
    if (a.snare) a.snare = Math.max(0, a.snare - AILMENT_DECAY * dt) || undefined;
    if (a.blind) a.blind = Math.max(0, a.blind - AILMENT_DECAY * dt) || undefined;
    if (a.sunder) a.sunder = Math.max(0, a.sunder - AILMENT_DECAY * dt) || undefined;
    if (a.gale) a.gale = Math.max(0, a.gale - AILMENT_DECAY * dt) || undefined;
    return damage;
}

// Chill and snare slow together, never past SLOW_LIMIT.
export const SLOW_LIMIT = 0.75;
export const WEAKEN_CAP = 0.5;
export const SNARE_CAP = 0.5;
export const slowFactor = (a: Ailments | undefined) => 1 - Math.min(SLOW_LIMIT, (a?.chill ?? 0) + (a?.snare ?? 0));
export const BLIND_CAP = 0.5;
export const BLEED_SECONDS = 3;
export const blindFactor = (a: Ailments | undefined) => 1 - (a?.blind ?? 0);
// Advances a bleed by dt; returns its damage in that time.
export function tickBleed(a: Ailments | undefined, dt: number): number {
    if (!a?.bleed) return 0;
    const t = Math.min(dt, a.bleed.remaining);
    const damage = a.bleed.dps * t;
    a.bleed.remaining -= dt;
    if (a.bleed.remaining <= 0) delete a.bleed;
    return damage;
}
export const weakenFactor = (a: Ailments | undefined) => 1 - (a?.weaken ?? 0);
export const SUNDER_CAP = 0.5;
export const GALE_CAP = 0.5;
export const sunderFactor = (a: Ailments | undefined) => 1 - (a?.sunder ?? 0);
export const galeFactor = (a: Ailments | undefined) => 1 - (a?.gale ?? 0);
export const shockFactor = (a: Ailments | undefined) => 1 + (a?.shock ?? 0);
