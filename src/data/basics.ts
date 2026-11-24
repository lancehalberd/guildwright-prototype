import type {AbilityEffect} from '../engine/types';

// Shared basic attacks. A monster lists 1 to 3 and cycles through them in order whenever no
// ability is ready; they split its basic damage evenly and each brings its own hit effect. A
// monster can rename one for flavor (Bone Throw) and keep its mechanics and art. 'element' basics
// show the effect of whatever element they carry (Touch, Bolt), drawn smaller.
export type BasicKey = 'scratch' | 'bite' | 'slash' | 'stab' | 'smash' | 'lash' | 'sting' | 'talon' | 'slam' | 'throw' | 'touch' | 'bolt';

export interface BasicDef {
    name: string
    effect: AbilityEffect | 'element'
    accuracy?: number
    damage?: number
}

export const BASICS: Record<BasicKey, BasicDef> = {
    scratch: {name: 'Scratch', effect: 'scratch'},
    bite: {name: 'Bite', effect: 'bite'},
    slash: {name: 'Slash', effect: 'slash'},
    stab: {name: 'Stab', effect: 'stab', accuracy: 1.15, damage: 0.9},
    smash: {name: 'Smash', effect: 'thump', accuracy: 0.85, damage: 1.15},
    lash: {name: 'Lash', effect: 'lash'},
    sting: {name: 'Sting', effect: 'sting'},
    talon: {name: 'Talon', effect: 'talon'},
    slam: {name: 'Slam', effect: 'slam', accuracy: 0.9, damage: 1.1},
    throw: {name: 'Throw', effect: 'throw', accuracy: 0.75, damage: 1.3},
    touch: {name: 'Touch', effect: 'element'},
    bolt: {name: 'Bolt', effect: 'element'},
};

// A monster's basic: the key, optionally renamed ('Bone Throw', 'Fire Bolt').
export type BasicRef = BasicKey | [BasicKey, string];
