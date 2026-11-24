// Guild growth. Every new slot costs gold. The first extra base slot, decoration slot and member slot
// can be bought from the start; later ones open by expanding the guild, which needs fame and gold.
// Nine expansions run up to the 4000 fame milestone, and each one opens a few crafting or member
// slots and one trophy slot. Prices climb 500, 2000, 5000, 20000 and so on rather than 10x a step.

export type SlotTrack = 'baseSlot' | 'decorationSlot' | 'accessorySlot' | 'accessoryDecorationSlot' | 'memberSlot' | 'trophySlot';

export interface SlotUnlock {
    key: string
    track: SlotTrack
    // The slot number this buys, counting the starting ones.
    slot: number
    gold: number
    // Guild expansion level needed before it can be bought (0 = from the start).
    expansion?: number
    // Fame needed before it can be bought.
    fame?: number
}

export interface Expansion {
    level: number
    fame: number
    gold: number
}

export const expansions: Expansion[] = [
    {level: 1, fame: 50, gold: 500},
    {level: 2, fame: 150, gold: 2000},
    {level: 3, fame: 300, gold: 5000},
    {level: 4, fame: 500, gold: 20000},
    {level: 5, fame: 800, gold: 50000},
    {level: 6, fame: 1200, gold: 100000},
    {level: 7, fame: 2000, gold: 200000},
    {level: 8, fame: 2800, gold: 400000},
    {level: 9, fame: 4000, gold: 800000},
];

// What the guild starts with. Accessories have their own base and decoration slots.
export const startingGuild = {memberSlots: 1, maxBaseMaterials: 1, maxAccessoryBaseMaterials: 1, maxDecorations: 1, maxAccessoryDecorations: 1, trophySlots: 0};

const ladder = (track: SlotTrack, firstSlot: number, prices: [number, number][]): SlotUnlock[] =>
    prices.map(([gold, expansion], i) => ({key: `${track}-${firstSlot + i}`, track, slot: firstSlot + i, gold, expansion}));

export const slotUnlocks: SlotUnlock[] = [
    // What each expansion opens: 1 base + member, 2 decoration + accessory base, 3 base + accessory
    // decoration, 4 member (and the salvage yard), 5 decoration + accessory base, 6 base + accessory
    // decoration, 7 decoration + member, 8 accessory base + member, 9 accessory decoration + member.
    // Every expansion also opens one trophy slot.
    ...ladder('baseSlot', 2, [[100, 0], [500, 1], [5000, 3], [100000, 6]]),
    ...ladder('decorationSlot', 2, [[200, 0], [3000, 2], [75000, 5], [300000, 7]]),
    ...ladder('memberSlot', 2, [[500, 0], [1000, 1], [40000, 4], [400000, 7], [800000, 8], [1500000, 9]]),
    ...ladder('accessorySlot', 2, [[2000, 2], [50000, 5], [250000, 8]]),
    ...ladder('accessoryDecorationSlot', 2, [[7500, 3], [150000, 6], [600000, 9]]),
    // The first trophy slot is free with the first trophy; each expansion opens one more.
    ...ladder('trophySlot', 2, expansions.map(e => [e.gold, e.level] as [number, number])),
];

// Fame for each slot unlocked, counting from the first unlockable slot on each track (and the
// applicant slots that guild expansions add). It nudges early players toward the guild's growth and
// helps them reach the first fame milestones.
export const SLOT_FAME = [5, 10, 20, 50];
export function slotFame(index: number): number {
    return SLOT_FAME[index] ?? 0;
}
// The fame for the slot this unlock buys.
export function unlockFame(unlock: SlotUnlock): number {
    return slotFame(slotUnlocks.filter(u => u.track === unlock.track).indexOf(unlock));
}

export const trackNames: Record<SlotTrack, string> = {
    baseSlot: 'base slot for weapons and armor',
    decorationSlot: 'decoration slot for weapons and armor',
    accessorySlot: 'base slot for accessories',
    accessoryDecorationSlot: 'decoration slot for accessories',
    memberSlot: 'guild member slot',
    trophySlot: 'trophy slot',
};
