// Signature effects: a rule of its own on a legendary or mythic material worn directly (its `equip`
// entry in data/materials.ts). Stats stay in `equip.stats`; a premium copy doubles those but not the
// signature's numbers. The design doc is the Claude Doc "Legendary & Mythic Material Effects"
// (https://claude.ai/artifact/EY2zkAHkf1dvRBuJPkSpos). stats.ts and runner.ts read these by key.

export type SignatureKey =
    // Legendaries
    'briarcrown' | 'capacitor' | 'weakSpot' | 'neverHungry' | 'tempestTalon' | 'unsettled' | 'swarmVenom'
    | 'nightFrost' | 'madeToLast' | 'perfectStrike' | 'pretendersClaim'
    // Mythics
    | 'livingBramble' | 'packLeader' | 'neverCools' | 'stoneSkin' | 'rebirth' | 'drinksStrength' | 'tailwind'
    | 'seesAllStorms' | 'hiveAnswers' | 'deathHeldIn' | 'titansFurnace' | 'strikesOnce' | 'risingWill'
    | 'foresight' | 'neverThere' | 'doorsForce';

export interface SignatureDef {
    name: string
    text: string
}

// Numbers the engine uses, named so the text below and the code agree.
export const BRIAR_LEVELS = 5;
export const CAPACITOR_HITS = 10, CAPACITOR_SHOCK_MULT = 2;
export const TALON_SPEED = 1;
export const VENOM_STACKS = 5;
export const NIGHT_FROST_CHILL = 0.1;
export const BOLT_EVERY = 4, BOLT_CRIT_LEVELS = 2, BOLT_SLOW = 0.2;
export const BRAMBLE_SHARE = 0.3, BRAMBLE_BLOCK_SHARE = 0.6;
export const STONE_SKIN = 0.5;
export const REBIRTH_LIFE = 0.5, REBIRTH_BURST = 1;
export const DRAIN_STEP = 0.02, DRAIN_CAP = 0.3;
export const TAILWIND_SPEED = 0.1, TAILWIND_SECONDS = 3;
export const HIVE_DAMAGE = 0.5;
export const DEATH_HELD_BYPASS = 0.5, DEATH_HELD_LIFE = 1;
export const FURNACE_SHARE = 0.9;
export const STRIKES_ONCE_MORE = 1;
export const WILL_STEP = 0.04, WILL_EVERY = 10, WILL_CAP = 0.6;
export const NEVER_THERE_DODGE = 0.1;

export const signatures: Record<SignatureKey, SignatureDef> = {
    briarcrown: {name: 'Crown of the Briar King', text: `+${BRIAR_LEVELS} effective levels: more HP, core attributes and accuracy, and gear up to ${BRIAR_LEVELS} levels higher. They don't count for ambitions, trophies or achievements. Taking it off unequips gear the hero no longer meets.`},
    capacitor: {name: 'Capacitor', text: `Each hit that deals lightning adds its lightning damage to a charge. Every ${CAPACITOR_HITS}th such hit releases the charge as lightning damage to every monster, with double the usual chance to shock.`},
    weakSpot: {name: 'Weak Spot', text: 'Every crit ignites. A crit\'s burn is based on the whole hit, not only its fire part.'},
    neverHungry: {name: 'Never Hungry', text: 'Life leech keeps working at full HP: what would overheal fills ward, up to max ward.'},
    tempestTalon: {name: 'Talon of the Tempest', text: `+${TALON_SPEED * 100}% increased attack speed and no flat weapon damage: every point of damage comes from attributes and other gear.`},
    unsettled: {name: 'Unsettled', text: 'Any elemental damage in your hits counts as all three elements for ailments, so one hit can burn, chill and shock. Each ailment uses the hit\'s total elemental damage.'},
    swarmVenom: {name: 'Swarm Venom', text: `Your burns stack: the ${VENOM_STACKS} strongest on a monster all deal damage, not only the strongest.`},
    nightFrost: {name: 'Night Frost', text: `All damage from your hits counts toward chill, not only cold. +${NIGHT_FROST_CHILL * 100}% chance to chill.`},
    madeToLast: {name: 'Made to Last', text: 'Each blocked hit stores its full damage. Your next hit adds everything stored as physical damage.'},
    perfectStrike: {name: 'The Perfect Strike', text: `Every ${BOLT_EVERY}th attack is a Thunderbolt: +${BOLT_CRIT_LEVELS} crit levels, all of its damage becomes lightning, and it always shocks. ${BOLT_SLOW * 100}% less attack speed.`},
    pretendersClaim: {name: 'The Pretender\'s Claim', text: 'Every core passive the wearer has is enhanced (+50% effect), on top of any enhancement it already has.'},
    livingBramble: {name: 'Living Bramble', text: `Monsters that hit you take ${BRAMBLE_SHARE * 100}% of the hit's damage as physical damage, or ${BRAMBLE_BLOCK_SHARE * 100}% of it when you block.`},
    packLeader: {name: 'Pack Leader', text: 'Your increased attack speed also applies to evasion.'},
    neverCools: {name: 'Never Cools', text: 'Hitting a burning monster resets its burns to their full duration.'},
    stoneSkin: {name: 'Stone Skin', text: `Armor also reduces fire, cold and lightning damage at ${STONE_SKIN * 100}% of its effect.`},
    rebirth: {name: 'Rebirth', text: `Once per run, a blow that would kill you leaves you at ${REBIRTH_LIFE * 100}% HP instead and deals ${REBIRTH_BURST * 100}% of your max HP as fire damage to every monster.`},
    drinksStrength: {name: 'Drinks Strength', text: `Each hit you land makes that monster deal ${DRAIN_STEP * 100}% less damage, up to ${DRAIN_CAP * 100}%.`},
    tailwind: {name: 'Tailwind', text: `Each dodge gives +${TAILWIND_SPEED * 100}% attack speed for ${TAILWIND_SECONDS} seconds, stacking.`},
    seesAllStorms: {name: 'Sees All Storms', text: 'Your fire, cold and lightning damage is dealt as whichever of the three the monster resists least.'},
    hiveAnswers: {name: 'The Hive Answers', text: `Each dodge earns a free attack at ${HIVE_DAMAGE * 100}% damage.`},
    deathHeldIn: {name: 'Death Held In', text: `${DEATH_HELD_BYPASS * 100}% of damage taken skips ward and goes straight to HP. +${DEATH_HELD_LIFE * 100}% of max ward as max HP.`},
    titansFurnace: {name: 'Titan\'s Furnace', text: `You and every monster take fire damage each second equal to ${FURNACE_SHARE * 100}% of your max HP + max ward. Yours is reduced by your fire resistance, and ward soaks it first.`},
    strikesOnce: {name: 'Strikes Once', text: `Your first hit on each monster deals ${STRIKES_ONCE_MORE * 100}% more damage.`},
    risingWill: {name: 'Rising Will', text: `Every ${WILL_EVERY} seconds of fighting in a run gives +${WILL_STEP * 100}% more damage and attack speed, up to +${WILL_CAP * 100}%. Resets when the run ends.`},
    foresight: {name: 'Foresight', text: 'The first attack each monster makes against you always misses.'},
    neverThere: {name: 'Never Quite There', text: `+${NEVER_THERE_DODGE * 100}% chance to dodge, rolled after evasion.`},
    doorsForce: {name: 'The Door\'s Force', text: 'Your hits ignore monster armor and Guard.'},
};
