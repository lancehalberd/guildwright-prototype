import type {QuestModifierDef} from '../engine/types';

// Generic modifiers every quest offers. Penalties are multipliers so they stack quickly; not every
// combination is meant to be clearable.
export const genericModifiers: QuestModifierDef[] = [
    {
        key: 'hardened', name: 'Hardened foes',
        monster: {hp: {more: 1.4}},
        bonuses: {extraRewardChance: 0.5},
        feeWeight: 1,
        unlock: {kind: 'firstClear'},
    },
    {
        key: 'swift', name: 'Swift foes',
        monster: {evasion: {more: 1.5}, attacksPerSecond: {more: 1.2}},
        bonuses: {rarityUpgradeChance: 0.15},
        feeWeight: 1,
        unlock: {kind: 'firstClear'},
    },
    {
        key: 'brutal', name: 'Brutal foes',
        monster: {damage: {more: 2}},
        bonuses: {goldXpMultiplier: 1.5, extraRewardChance: 0.15},
        feeWeight: 1,
        unlock: {kind: 'clearWith', count: 1},
    },
    {
        key: 'elite', name: 'Elite patrol',
        monster: {hp: {more: 1.8}, damage: {more: 1.8}, armor: {more: 1.8}},
        bonuses: {bonusRareChance: 1, extraRewardChance: 0.2},
        feeWeight: 2,
        unlock: {kind: 'clearWith', count: 2},
    },
    // Twice the monsters already pays twice the gold and XP, since both are paid per monster. Every
    // monster in a group attacks all fight, so doubling a group is a big step up: it sits between
    // Elite patrol and Juggernauts.
    {
        key: 'horde', name: 'Overwhelming numbers',
        monster: {},
        duplicate: true,
        bonuses: {extraRewardChance: 0.5},
        feeWeight: 3,
        unlock: {kind: 'clearWith', count: 3},
    },
    // The top of the ladder: with everything on, even Bramble Road is harder than Ashen Peaks, and
    // no build in the game today should clear it.
    {
        key: 'juggernaut', name: 'Juggernauts',
        monster: {hp: {more: 2.5}, damage: {more: 2}},
        bonuses: {extraRewardChance: 1, rarityUpgradeChance: 0.25},
        feeWeight: 3,
        unlock: {kind: 'clearWith', count: 4},
    },
    {
        key: 'relentless', name: 'Relentless',
        monster: {attacksPerSecond: {more: 1.5}, accuracy: {more: 2}, evasion: {more: 1.5}},
        bonuses: {rarityUpgradeChance: 0.35, goldXpMultiplier: 2},
        feeWeight: 3,
        unlock: {kind: 'clearWith', count: 5},
    },
];

// One per element: monsters add that element to their hits and resist it 50% more. A quest can offer one openly where it fits its threats (Burning ground on Ashen
// Peaks); everywhere else they appear only when a contract or ambition asks for them.
const groundModifier = (key: string, name: string, element: 'fire' | 'cold' | 'lightning'): QuestModifierDef => ({
    key, name,
    monster: {},
    addedDamage: {[element]: 0.4},
    resist: {[element]: 0.5},
    bonuses: {rarityUpgradeChance: 0.15},
    feeWeight: 1,
    unlock: {kind: 'clearWith', count: 1},
});
export const elementalModifiers: QuestModifierDef[] = [
    groundModifier('burning', 'Burning ground', 'fire'),
    groundModifier('frozen', 'Frozen ground', 'cold'),
    groundModifier('shocking', 'Shocking ground', 'lightning'),
];

// A quest's modifier list: the generic ones, the elemental ones it offers openly, and the rest of
// the elemental ones as contract-only.
export function questModifiers(openElements: string[] = []): QuestModifierDef[] {
    return [
        ...genericModifiers,
        ...elementalModifiers.map(m => openElements.includes(m.key) ? m : {...m, exclusive: true}),
    ];
}

// The Sundered Sanctum's rite, open to a guild holding one of each tier 5 key. Lifeless all run, and
// the other three rules in turn: stacks earned early keep working to the end. A full clear calls the
// Veiled Oracle; beating it uses up the keys and opens the portal to the Shattered Throne.
export const riteModifier: QuestModifierDef = {
    key: 'rite', name: 'The Oracle\'s Rite',
    monster: {hp: {more: 1.5}, damage: {more: 1.3}},
    bonuses: {extraRewardChance: 0.5, rarityUpgradeChance: 0.2},
    feeWeight: 4,
    unlock: {kind: 'keys', keys: ['amberKey', 'graveKey', 'cogKey', 'galeKey']},
    rules: ['noRecovery'],
    rite: {
        schedule: [{from: 0, rules: ['corrosion']}, {from: 4, rules: ['reflect']}, {from: 8, rules: ['karma']}],
        boss: 'veiledOracle',
        bossPhases: [['corrosion'], ['reflect'], ['karma'], ['corrosion', 'reflect', 'karma']],
        keys: ['amberKey', 'graveKey', 'cogKey', 'galeKey'],
        pool: [
            {material: 'oracleEye', weight: 1, min: 1, max: 1},
            {material: 'veilSilk', weight: 1, min: 1, max: 1},
            {material: 'sanctumShard', weight: 1, min: 1, max: 1},
        ],
    },
};
