import type {BasicRef} from '../data/basics';
import type {BonusKey, PassiveKey} from '../data/passives';
// Core data types. Everything in GameState is plain JSON so it can be saved to local storage.

export type DamageType = 'physical' | 'fire' | 'cold' | 'lightning';
export type Element = Exclude<DamageType, 'physical'>;
export type DamageMap = Partial<Record<DamageType, number>>;

export type CoreStat = 'str' | 'dex' | 'int';
// The full list, with labels and rules, lives in data/stats.ts.
export type StatKey =
    CoreStat
    | 'maxHealth' | 'increasedMaxHealth'
    | 'lifeRegen' | 'lifeRegenPercent' | 'lifeLeech' | 'lifeOnHit'
    | 'armor' | 'increasedArmor' | 'evasion' | 'increasedEvasion' | 'blockChance' | 'ward' | 'hpLostAsWard'
    | 'fireResist' | 'coldResist' | 'lightningResist'
    | 'physicalDamage' | 'fireDamage' | 'coldDamage' | 'lightningDamage'
    | 'physicalToFire' | 'physicalToCold' | 'physicalToLightning'
    | 'healthAsFire' | 'evasionAsCold' | 'wardAsLightning'
    | 'increasedDamage' | 'increasedPhysicalDamage' | 'increasedElementalDamage'
    | 'attackSpeed' | 'accuracy' | 'critChance' | 'critMultiplier'
    | 'igniteChance' | 'chillChance' | 'shockChance' | 'ailmentEffect'
    | 'wardOnDodge' | 'wardOnDodgePercent' | 'wardOnBlock' | 'wardOnBlockPercent';

// A bag of stats. Items, decorations and gear totals are all plain sums of these.
export type StatValues = Partial<Record<StatKey, number>>;

export type SlotKey =
    'mainHand' | 'offHand' | 'head' | 'body' | 'gloves' | 'boots' | 'belt' | 'amulet' | 'ring1' | 'ring2';

// Tags used to look up crafting stats. Materials define stats for some tags, and a craft uses the
// most specific tag on the item type's path that the material defines.
export type Tag =
    'weapon' | 'oneHanded' | 'twoHanded'
    | 'sword' | 'axe' | 'dagger' | 'wand' | 'greatsword' | 'bow' | 'staff'
    | 'offHand' | 'shield'
    | 'armor' | 'bodyArmor' | 'smallArmor' | 'helmet' | 'gloves' | 'boots'
    | 'accessory' | 'ring' | 'amulet' | 'belt';

export type ItemTypeKey =
    'sword' | 'axe' | 'dagger' | 'wand' | 'greatsword' | 'bow' | 'staff'
    | 'shield' | 'helmet' | 'bodyArmor' | 'gloves' | 'boots' | 'belt' | 'ring' | 'amulet';

export interface ItemType {
    key: ItemTypeKey
    name: string
    // Used to build item names, such as "Iron" + "Sword".
    noun: string
    slots: SlotKey[]
    // Most specific first, for example ['helmet', 'smallArmor', 'armor'].
    tags: Tag[]
    twoHanded?: boolean
    // Weapons only.
    attacksPerSecond?: number
    // Scales the combined damage or armor from materials, so one material table covers many item types.
    damageMultiplier?: number
    armorMultiplier?: number
    // Multiplies the other stats from bases (secondaries) and every decoration. Two-handed weapons
    // fill both hands, so theirs count for more. Default 1.
    secondaryMultiplier?: number
    // Per-stat overrides of secondaryMultiplier, which give each weapon its own leanings.
    statMultipliers?: Partial<Record<StatKey, number>>
}

// Mythic drops come only from rarity upgrades on rare drops.
export type Tier = 'C' | 'U' | 'R' | 'M';
export type EncounterTier = Exclude<Tier, 'M'>;

// The modifier math shared by quest modifiers (and later guild and gear bonuses):
// (base + sum of flat) * (1 + sum of increased) * each multiplier.
export interface ModValue {
    flat?: number
    increased?: number
    more?: number
}

// Bonuses to what a run brings back. Chances are summed across sources and can pass 100%:
// 1.3 extra reward chance means one guaranteed extra drop plus a 30% chance of another.
export interface RewardBonuses {
    extraRewardChance?: number
    rarityUpgradeChance?: number
    bonusRareChance?: number
    // Multiplies gold and XP. Multiplies across sources.
    goldXpMultiplier?: number
}

export type MonsterModStat = 'hp' | 'damage' | 'armor' | 'accuracy' | 'evasion' | 'attacksPerSecond';

export interface QuestModifierDef {
    key: string
    name: string
    // Harder in some way...
    monster: Partial<Record<MonsterModStat, ModValue>>
    // Share of the monster's base damage added on top as an element.
    addedDamage?: Partial<Record<Element, number>>
    // Added to the monsters' resistances (capped at MONSTER_RESIST_CAP).
    resist?: Partial<Record<Element, number>>
    // ...for a matching reward.
    bonuses: RewardBonuses
    // Each point adds this quest's fee step to the entry fee.
    feeWeight: number
    // 'firstClear', a full clear with at least this many modifiers active, or holding every one of
    // these key items.
    unlock: {kind: 'firstClear'} | {kind: 'clearWith', count: number} | {kind: 'keys', keys: string[]}
    // Every monster in each encounter appears twice.
    duplicate?: boolean
    // Area rules this modifier adds (see engine/rules.ts).
    rules?: QuestRule[]
    // The Sanctum's rite: rules by encounter, and a boss after a full clear that uses up the keys
    // and opens the portal (see engine/portal.ts).
    rite?: RiteDef
    // Only usable while a contract or ambition that asks for it is active.
    exclusive?: boolean
}

// Stats a material gives when used as a crafting base. Each stat is [value, cap]: values are
// summed across base materials, then limited by the highest cap any base material sets for that
// stat. A stat no base material gives a cap to is capped at 0. maxDecorations uses the max.
// Crafting roles: what a base material is for in a craft. See the templates in data/materials.ts.
export type BaseRole = 'cap' | 'value' | 'decor' | 'secondary' | 'balanced' | 'capMixed' | 'focused' | 'paired'

export interface BaseStats {
    // Core stats are [value, cap]; every other stat is a plain value that adds up with no cap.
    stats: Partial<Record<StatKey, [number, number] | number>>
    maxDecorations: number
    role?: BaseRole
    itemLabel?: string
    // Higher wins when naming the crafted item. Defaults to the material's power.
    labelPriority?: number
}

export interface MaterialDef {
    key: string
    name: string
    // Used in crafted item names. Defaults to name.
    prefix?: string
    // Overall strength of the material. Separate from drop tier, which belongs to each quest's pool.
    power: number
    description?: string
    base?: Partial<Record<Tag, BaseStats>>
    // Decorations add their stats after the caps.
    decoration?: Partial<Record<Tag, StatValues>>
    // Dropped only by an ambition boss.
    legendary?: boolean
    // A key for the final area: no crafting use, no premium version.
    keyItem?: boolean
    // Materials that can be worn directly as a specific item type.
    equip?: {itemType: ItemTypeKey, name: string, stats: StatValues}
    // A premium variant (see data/materials.ts).
    premium?: boolean
}

export interface ItemStats {
    stats: StatValues
    attacksPerSecond?: number
}

export interface CraftedItem {
    id: string
    itemType: ItemTypeKey
    name: string
    // The recipe is the source of truth. Stats are recomputed from it, so balance changes apply on load.
    base: string[]
    decorations: string[]
    power: number
}

export type ItemRef = {kind: 'crafted', id: string} | {kind: 'material', key: string};

// What an ability looks like when it lands (art in assets/fx).
export type AbilityAilment = 'burn' | 'chill' | 'shock' | 'weaken' | 'snare' | 'blind' | 'bleed' | 'sunder' | 'gale';
export type AbilityEffect = 'fire' | 'ice' | 'lightning' | 'earth' | 'chill' | 'kindle' | 'static'
    | 'scratch' | 'bite' | 'slash' | 'stab' | 'smash' | 'lash' | 'sting' | 'talon' | 'slam' | 'throw'
    | 'vines' | 'web' | 'sonar' | 'heal' | 'hatch' | 'curse' | 'dust' | 'bleed' | 'drain' | 'rally' | 'water' | 'gust'
    | 'thump' | 'shield' | 'acid' | 'chains' | 'steam' | 'prism' | 'starfall' | 'shimmer' | 'mirror' | 'dive' | 'poison';

// A monster ability. A monster acts on its own attack timer; each turn it uses the first ability
// in its list that is off cooldown, else its basic attack. The ability carries the named damage
// types out of the monster's damageTypes, and the damage is set so that, used as often as its
// cooldown allows, each type deals the same share over a fight as before (engine/abilities.ts).
export interface AbilityDef {
    name: string
    // Damage types taken out of the monster's damageTypes. None = an ailment-only ability.
    types?: DamageType[]
    // Cooldown, in the monster's own turns: used at most once every this many turns.
    every: number
    // A spell: its chained hits land as one combined blow, and it is cast rather than lunged.
    spell?: boolean
    // Applies an ailment outright when it connects (dodge stops it; block doesn't). Chill and shock
    // add `amount`; burn deals `amount` x the monster's hit per second. Hero resistance reduces it.
    // Weaken (the hero deals less damage) and snare (a flat attack slow) aren't resisted.
    applies?: {ailment: AbilityAilment, amount: number}
    // Multipliers on this ability's accuracy and damage (a heavy, wild swing: more damage, less
    // accuracy).
    accuracy?: number
    damage?: number
    effect?: AbilityEffect
    // Lands as this many separate hits, splitting the damage (Bramble Lash).
    hits?: number
    // Heals the monster for this share of the damage it deals.
    drain?: number
    // Heals the monster for this share of its max life.
    heal?: number
    // Speeds up every monster in the fight by `amount` for `turns` of each one's turns (Rally).
    rally?: {amount: number, turns: number}
    // A buff on itself for `turns` of its own turns: guard (takes `amount` less damage), evade
    // (evasion up by `amount`), or ward (a shield of `amount` x its max life that soaks damage).
    buff?: {kind: 'guard' | 'evade' | 'ward', amount: number, turns?: number}
    // Its damage turns into the type the hero deals most (the Pretender's Mimicry).
    mimic?: boolean
}

export interface MonsterDef {
    key: string
    name: string
    // Drawn hovering above its ground line, bobbing.
    flying?: boolean
    // Multipliers on the encounter's power-scaled baseline. Missing accuracy and evasion = 1.
    hp: number
    damage: number
    attacksPerSecond: number
    armor: number
    accuracy?: number
    evasion?: number
    // Share of each hit by damage type. Missing = all physical.
    damageTypes?: DamageMap
    resist?: Partial<Record<Element, number>>
    // Final boss mechanics.
    // Shatter: at each share of life in `at` (falling), `count` shards of the `shard` monster join the
    // fight in front of it, and it takes `damageTaken` of all damage until they fall. A hit can't
    // carry it past a threshold, so no phase is skipped.
    shatter?: {at: number[], shard: string, count: number, damageTaken: number}
    // Rising will: every `every` seconds of the fight its damage and attack speed grow by `growth`
    // of their base, adding up, and it heals `heal` of its max life.
    risingWill?: {every: number, growth: number, heal?: number}
    // Thorns: each hit the hero lands on it deals this much physical damage back to the hero. It
    // can't be dodged; block and armor apply.
    thorns?: number
    // Abilities, in priority order, and the name and look of the basic attack that fills the gaps.
    abilities?: AbilityDef[]
    // Named basic attacks from data/basics.ts, cycled in order. Every monster should list some.
    basics?: BasicRef[]
    // Thorns' damage type (default physical).
    thornsType?: DamageType
    // Summons: at each share of life in `at` (falling), `count` of `monster` join the fight in
    // front. Each counts half a monster toward the encounter's gold and XP; materials don't change.
    // Calls `count` adds at each life threshold in `at`; `hp` scales their life (hatchlings are frail).
    summon?: {at: number[], monster: string, count: number, name: string, hp?: number}
}

export interface PoolEntry {
    material: string
    weight: number
    min: number
    max: number
}

export interface EncounterDef {
    tier: EncounterTier
    monsters: string[]
}

// Punishing area rules (see engine/rules.ts).
export type QuestRule = 'corrosion' | 'karma' | 'reflect' | 'noRecovery';

export interface RiteDef {
    // Rules from this encounter index on (the latest entry that has started applies).
    schedule: {from: number, rules: QuestRule[]}[]
    // Fought after a full clear. Its rules change as its life drops: one entry per quarter, from full.
    boss: string
    bossPhases: QuestRule[][]
    // Used up when the boss falls; the portal opens only if they are all still there.
    keys: string[]
    // The boss's own drop pool.
    pool: PoolEntry[]
}

export interface QuestDef {
    key: string
    // Area rules every run of this quest is under.
    rules?: QuestRule[]
    // Open only while the portal is (see engine/portal.ts).
    portal?: boolean
    name: string
    description: string
    basePower: number
    // Multiplies monster HP and damage only, for tuning difficulty without moving rewards or levels.
    monsterScale?: number
    entryFee: number
    fameToUnlock: number
    // An achievement (such as 'clear-hollowMines') that must be earned before the quest opens.
    // Achievement that opens the quest; with a list, any one of them.
    unlockAchievement?: string | string[]
    fameForFirstClear: number
    // Walk from the guild hall to the first encounter at the start of every run (0 = none). Adventurers
    // rest back at the guild, so this would be a fixed cost per run that rewards pushing deeper.
    travelSeconds: number
    encounters: EncounterDef[]
    pools: Record<Tier, PoolEntry[]>
    modifiers: QuestModifierDef[]
    // Hero levels from the weakest encounter to the final rare.
    levelBand?: [number, number]
    // Position on the map canvas, in pixels.
    mapPosition: {x: number, y: number}
    // Power added per encounter, as a share of basePower. Defaults to growthPerEncounter.
    growth?: number
    // Multiplies power by factor once every `every` encounters, compounding.
    stepMultiplier?: {every: number, factor: number}
    // Replaces the usual power multipliers per tier.
    tierMultiplier?: Record<EncounterTier, number>
    // The ambition boss: fought only by adventurers with the ambition to beat it, once each.
    boss?: {monster: string, legendary: string}
    // Set on a quest's endless variant: no rewards, just a record of how deep each adventurer gets.
    endless?: {baseKey: string}
}

export interface ClassDef {
    key: string
    name: string
    coreStat: CoreStat
    description: string
    // Recommended gear, shown under the passive: weapon types (none = unarmed or see note) and defenses.
    suits: {weapons: ItemTypeKey[], defenses: StatKey[], note?: string}
    // Made from one Wood when the adventurer joins.
    starterWeapon?: ItemTypeKey
    starterOffHand?: ItemTypeKey
    names: string[]
    // One rule that sets the class apart, shown on the class. Its effect comes from passiveKey.
    passive: {name: string, description: string}
    passiveKey?: PassiveKey
    // Applicant tier that first offers this class.
    tier: number
    // Attribute points gained per level.
    growth: Record<CoreStat, number>
    // 'enhanced': rolls one random core passive, enhanced. 'wildcard': rolls three random core passives.
    special?: 'enhanced' | 'wildcard'
}

// Core passives a hero has, when rolled at hire rather than taken from the class.
export type HeroPassive = {key: PassiveKey, enhanced?: boolean};

// Elemental ailments on a fighter (see engine/ailments).
export interface Ailments {
    burns?: {dps: number, remaining: number}[]
    chill?: number
    shock?: number
    // Monster debuffs on the hero: weaken cuts damage dealt; snare slows attacks like chill does.
    weaken?: number
    snare?: number
    // Blind cuts the hero's accuracy; bleed is physical damage over time (armor applied once).
    blind?: number
    bleed?: {dps: number, remaining: number}
    // Sunder cuts the hero's armor; gale cuts the hero's evasion.
    sunder?: number
    gale?: number
}

export interface MonsterState {
    key: string
    // Position in the encounter's line-up, kept when monsters in front die. For the combat view.
    slot?: number
    hp: number
    maxHp: number
    cooldown: number
    // Exposed: attacks on this monster it dodged entirely in a row. Each lowers its evasion (see
    // exposedEvasion); the first hit that lands clears them.
    exposed?: number
    ailments?: Ailments
    // Seconds this monster has been fighting (Rising will).
    age?: number
    // Shatter thresholds already passed.
    phase?: number
    // Rising will stacks gained so far, so each one heals once.
    will?: number
    // Turns left before each ability is off cooldown (by index in its kit), and which basic is next.
    ready?: number[]
    basicTurn?: number
    // Summon thresholds already passed.
    summoned?: number
    // Rally: faster attacks for a few of its own turns.
    haste?: {amount: number, turns: number}
    // Self buffs: less damage taken, more evasion, a ward that soaks damage.
    guard?: {amount: number, turns: number}
    evade?: {amount: number, turns: number}
    ward?: number
}

export type Activity =
    {kind: 'idle', reason?: string}
    | {kind: 'traveling', questKey: string, remaining: number, total: number}
    | {kind: 'fighting', questKey: string, encounterIndex: number, monsters: MonsterState[], cooldown: number, bonus?: boolean,
        // Seconds left of the entrance pause before anyone acts.
        entrance?: number,
        // Exposed: attacks on the hero dodged entirely in a row (see exposedEvasion).
        heroExposed?: number,
        // When each recent dodge happened (fight clock), for Riposte.
        recentDodges?: number[],
        // HP and ward recovered in the last second (fight clock), for the recovery soft cap.
        recovered?: {at: number, amount: number}[],
        recoveredSum?: number,
        // Ailments monsters have put on the hero this encounter.
        heroAilments?: Ailments,
        // Dual wielding: which weapon swings next (0 main hand, 1 off hand).
        swing?: number,
        // An ambition boss fought after the final encounter.
        boss?: string,
        // Every monster this encounter started with, in slot order. For the combat view.
        lineup?: string[],
        // Monsters that joined mid-fight (Shatter's shards), in slots after the line-up. A dead one's
        // slot is reused. They give no rewards.
        adds?: string[],
        // Monsters summoned this fight (each counts half toward gold and XP).
        summonedCount?: number,
        // Seconds left in the pause after the last monster falls, before moving on.
        ending?: number,
        // Seconds since the encounter started (Rampage's window).
        clock?: number,
        // Counterstrike: free attacks earned by blocks, made at the next chance.
        counters?: number,
        // Rampage: damage the hero took recently, with when.
        recentHits?: {at: number, amount: number}[],
        // Blood pact: leech still to be recovered, each part over its remaining seconds.
        leechPool?: {perSecond: number, left: number}[]}
    | {kind: 'resting', questKey: string, remaining: number, defeated: boolean};

export interface Adventurer {
    id: string
    name: string
    classKey: string
    level: number
    xp: number
    hp: number
    // Absorbs damage before HP. Refills to full at the start of every encounter.
    ward?: number
    // Deepest endless encounter cleared, as an index, per base quest.
    endlessBest?: Record<string, number>
    equipment: Partial<Record<SlotKey, ItemRef>>
    assignment: {questKey: string} | null
    activity: Activity
    // The current or most recent run, for the run panel.
    run?: RunRecord
    // The previous run's recap, for comparing against the current one.
    previousRunStats?: RunStats
    // Which run that was and how it ended, for showing its recap while the next one runs.
    previousRun?: {questKey: string, number: number, outcome: string}
    // Last encounter index to fight before turning back, per quest. Missing = the final encounter.
    stopPoints?: Record<string, number>
    // Share of the last run's net gold (0 to 1) that may be spent to skip a rest. Missing or 0 = off.
    autoRecover?: number
    // Quest modifiers this adventurer runs with, per quest. Missing = the quest's old shared choice.
    questModifiers?: Record<string, string[]>
    // Three goals fixed at hire. Fulfilled ones pay fame when the adventurer retires.
    ambitions?: Ambition[]
    // Personal best feats, which ambitions are checked against.
    records?: AdventurerRecords
    // Personal contract on offer, pitched at this adventurer's level.
    contract?: Contract
    // The contract this adventurer is working on, if any. Runs started while it is set count for it.
    activeContract?: {kind: 'personal' | 'guild', id: string} | null
    // Core passives rolled at hire (333 and 111 classes). Missing = the class's own passive.
    passives?: HeroPassive[]
    // Rare bonus passives rolled at hire: stacks of +10% per bonus.
    bonuses?: Partial<Record<BonusKey, number>>
}

export type AmbitionKind = 'level' | 'endless' | 'bigHit' | 'chain' | 'multiKill' | 'clearMods' | 'bareClear' | 'boss';

export interface Ambition {
    kind: AmbitionKind
    target: number
    quest?: string
    // Boss ambitions: modifiers that must be active for the boss to appear.
    mods?: string[]
    // 0 Novice, 1 Seasoned, 2 Veteran, 3 Legend.
    tier: number
    fame: number
    done?: boolean
}

export interface AdventurerRecords {
    bestHit: number
    // Most hits landed by one attack.
    bestChain: number
    // Most monsters killed by one attack.
    bestKills: number
    // Most modifiers active on a full clear, per quest.
    modClears: Record<string, number>
    // Quests fully cleared with no body armor, helmet, gloves or boots.
    bareClears: string[]
    // Quests whose ambition boss this adventurer has beaten.
    bosses: string[]
}

// "Defeat the rare of a quest with these modifiers on." Personal contracts pay a chosen mythic;
// guild contracts pay fame and gold.
export interface Contract {
    id: string
    questKey: string
    mods: string[]
    reward: {material?: string, gold: number, fame?: number}
}

// Someone waiting in the hire panel.
export interface Applicant {
    id: string
    name: string
    classKey: string
    level: number
    tier: number
    fee: number
    ambitions: Ambition[]
    passives?: HeroPassive[]
    // Rare bonus passives: stacks of +10% per bonus.
    bonuses?: Partial<Record<BonusKey, number>>
}

// A retired adventurer, kept in the Hall of Legends.
export interface Legend {
    name: string
    classKey: string
    level: number
    ambitions: Ambition[]
    fame: number
    records?: AdventurerRecords
}

export interface RunRecord {
    questKey: string
    // Which run of this quest this is for this adventurer, counting from 1.
    number: number
    // Last encounter index cleared this run (-1 = none yet).
    cleared: number
    // Encounter index where the adventurer was defeated, if they were.
    defeatedAt?: number
    // Encounter index the run was set to stop after.
    stopAt: number
    loot: Record<string, number>
    gold: number
    xp: number
    // Entry fee paid for this run.
    fee?: number
    // Quest modifiers active for this run, fixed when it started.
    modifiers?: string[]
    // A bonus rare encounter rolled after the final encounter, fought after the next rest.
    bonusEncounter?: 'pending' | 'fought'
    // An ambition boss revealed by a full clear, fought after the next rest.
    bossEncounter?: 'pending' | 'fought'
    // The contract this run was started for.
    contract?: {kind: 'personal' | 'guild', id: string}
    // Combat tallies for the recap shown while resting.
    stats?: RunStats
    // The rite's boss, revealed by a full clear with the rite on.
    riteBoss?: 'pending' | 'fought'
    // Area rule stacks, kept for the whole run.
    corrosion?: number
    karma?: number
}

export interface RunStats {
    fightSeconds: number
    kills: number
    // The hero's attacks, those that landed at least one hit, all hits landed, and hits that crit.
    attacks: number
    attacksLanded: number
    hits: number
    crits: number
    // Damage dealt after the monsters' armor and resistances, not counting overkill.
    dealt: DamageMap
    // Monster attacks, those that missed entirely, hits that reached the hero, and hits blocked.
    incomingAttacks: number
    attacksDodged: number
    incomingHits: number
    blocks: number
    // Damage taken after armor and resistances, before ward.
    taken: DamageMap
    wardAbsorbed: number
    // Damage that armor, resistances and blocks stopped.
    preventedArmor: number
    preventedResist: number
    preventedBlock: number
    healed: {regen: number, leech: number, onHit: number, encounter: number}
    wardGained: number
    // Lowest HP during the run, as a share of max HP.
    lowestHp: number
    // Damage taken from each kind of monster, by monster key.
    takenBy?: Record<string, number>
    // The Reflection rule: reflected hits that reached the hero, and their damage before ward.
    reflected?: {hits: number, taken: number}
    // All damage taken (hits and damage over time) and seconds fighting in each encounter, by a
    // label like "Encounter 3 · Kobold Shaman, Kobold". A bare number is damage only (v238 saves).
    takenByEncounter?: Record<string, {taken: number, seconds: number} | number>
}

export interface LogEntry {
    time: number
    text: string
    kind: 'win' | 'loss' | 'loot' | 'info'
}

export interface QuestProgress {
    // Pool entries that have dropped at least once, by tier.
    revealed: Record<Tier, string[]>
    // Shows the boss legendary in the reward pools before it is obtained (Dev menu).
    legendaryRevealed?: boolean
    // Someone has fought the ambition boss (won or lost); until then the quest panel hides it.
    bossFought?: boolean
    // Encounter indexes the adventurer has reached.
    seen: number[]
    runs: number
    fullClears: number
    bestEncounter: number
    log: LogEntry[]
    // Most modifiers active on any full clear (-1 = never fully cleared). Unlocks more modifiers.
    bestModifiedClear?: number
    // Saves from before modifiers were per adventurer: the old shared choice, used as a default.
    activeModifiers?: string[]
}

export interface GameState {
    version: number
    // Messages from loading this save, shown once and then cleared.
    notices?: string[]
    time: number
    gold: number
    fame: number
    materials: Record<string, number>
    // Lifetime totals found per material, shown as "X found" in the ledger.
    obtained: Record<string, number>
    craftedItems: CraftedItem[]
    adventurers: Adventurer[]
    guild: {
        memberSlots: number
        // Base material slots for weapons and armor (upgrades toward 5).
        maxBaseMaterials: number
        // Accessories have no cap behavior, so they get their own smaller limit (upgrades toward 3).
        maxAccessoryBaseMaterials: number
        maxDecorations: number
        maxAccessoryDecorations?: number
        trophySlots?: number
    }
    // Guild slots bought with gold, by unlock key.
    unlocks?: string[]
    // Guild expansion level (0 = never expanded).
    expansion?: number
    // Salvage yard level: how many materials it recovers per item (0 = not built).
    salvageLevel?: number
    // Highest tier earned per trophy, as an index into its tiers.
    trophies?: Record<string, number>
    // Equipped trophy keys, one per unlocked slot.
    trophySlots?: (string | null)[]
    achievements: string[]
    // Unlock notices already shown (expansions and trophy slots that fame has opened).
    milestones?: string[]
    // Lifetime count of items crafted, for milestones.
    craftedCount?: number
    // The merchant's stock per member (see engine/shop.ts). null = an empty stock slot.
    shop?: Record<string, (import('./shop').ShopItem | null)[]>
    // Members whose level-up restock was held back because the merchant was open: their next
    // New stock is free (cleared by any restock).
    shopFreeRefresh?: Record<string, boolean>
    // Play time the portal to the final area closes. Missing or past: closed.
    portal?: {openUntil: number}
    // The travelling peddler's visits and stock (see engine/peddler.ts).
    peddler?: import('./peddler').PeddlerState
    // false until the crafting bench is bought. Saves from before the merchant have it.
    benchOwned?: boolean
    // Steps of the opening guidance that are done.
    guide?: {firstRunDone?: boolean, firstSend?: boolean, bought?: boolean, equipped?: boolean, crafted?: boolean, manualEquip?: boolean, fameGoalDone?: boolean, decorated?: boolean, modifierToggled?: boolean}
    questProgress: Record<string, QuestProgress>
    // The hire panel's current applicants.
    applicants?: Applicant[]
    // A new game's free first hire: one applicant of each starter class. Cleared once one is picked.
    starters?: Applicant[]
    // The guild contract board.
    guildContracts?: Contract[]
    // Retired adventurers.
    legends?: Legend[]
    nextId: number
}
