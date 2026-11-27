// Story beats: one when a guild first sets out on each quest, one when it first beats the quest's
// final rare. The thread runs from the troubled road, through the hunt for the Oracle's Glass in the
// Sundered Sanctum, to the four keys and the Shattered Throne beyond them.
export interface StoryBeat {title: string, text: string}

export const questStory: Record<string, {start: StoryBeat, clear: StoryBeat}> = {
    brambleRoad: {
        start: {title: 'Bramble Road', text: 'The old trade road is where the trouble began. Goblins and bandits have grown bold among the brambles, wolves hunt in packs, and the carters who still dare it swear something huge has taken the bridge.'},
        clear: {title: 'The Road Is Open', text: 'The Bridge Troll falls, and the carts can roll again. In its hoard lies a miner\'s lamp still warm with a strange blue light, and a note: "It came up from the Hollow Mines. They dug too deep."'},
    },
    hollowMines: {
        start: {title: 'Hollow Mines', text: 'The miners fled when the tunnels began to hum. Kobolds and spiders have moved into the dark, and the deepest shafts glow with the same blue light as the lamp from the bridge.'},
        clear: {title: 'The Scholar\'s Journal', text: 'In the Broodmother\'s nest lies the journal of a scholar who came looking for the light. Its last pages tell of the Oracle\'s Glass, a seeing-stone hidden in the Sundered Sanctum, where three storms meet and tear the world open. Whoever holds the Glass can see where this threat began, and how it can be stopped. The journal\'s road runs through fire, marsh and storm.'},
    },
    ashenPeaks: {
        start: {title: 'Ashen Peaks', text: 'The journal\'s road climbs the smoking peaks first. Burning knights patrol the passes, and the old wyrm\'s roost sits on the only trail over.'},
        clear: {title: 'The First Storm Stills', text: 'With the Ashen Wyrm gone, the fire storm over the peaks gutters out. Far to the east, one of the three storms around the Sanctum burns a little lower. Two remain.'},
    },
    sunkenMarsh: {
        start: {title: 'Sunken Marsh', text: 'Next, the drowned woods. Cold lights drift between the reeds, and the journal warns that the marsh\'s witch has kept the frost storm fed for a hundred winters.'},
        clear: {title: 'The Thaw', text: 'The Bog Hag sinks beneath the water, and the frost storm loosens its grip. Only the storm over the coast still guards the way to the Sanctum.'},
    },
    thunderheadCrags: {
        start: {title: 'Stormwrack Coast', text: 'The last of the three storms has never broken over these cliffs. Wrecks line the shore, and something with wings of lightning rides the wind above them.'},
        clear: {title: 'The Way to the Sanctum', text: 'The Thunderbird falls into the sea, and for the first time in living memory the sky over the coast clears. Beyond it, the Sundered Sanctum stands open.'},
    },
    sunderedRift: {
        start: {title: 'The Sundered Sanctum', text: 'The oracle\'s temple stands at the heart of the torn world, its halls burning, freezing and crackling all at once. Somewhere inside rests the Oracle\'s Glass.'},
        clear: {title: 'Four Keys', text: 'Past the Rift Warden, the Oracle\'s Glass sits clouded on its altar. When your heroes touch it, it shows a sealed door at the temple\'s heart and a broken throne beyond it, where the true threat waits. Four keys lock that door, carried off long ago to four far places: a hive of amber, a city of the dead, a foundry that never stops, and a spire above the clouds. Bring all four keys back to the Sanctum, and the Oracle\'s Rite will open the way.'},
    },
    amberHive: {
        start: {title: 'The Amber Hive', text: 'The first key lies somewhere in a hive grown over a sunken forest. Everything here stings, and its acid eats through armor.'},
        clear: {title: 'The Hive Falls Quiet', text: 'The Hive Queen is dead, but the Amber Key is still sealed somewhere in the comb. Keep searching the hive: the strongest of its creatures guard it.'},
    },
    duskgraveNecropolis: {
        start: {title: 'Duskgrave Necropolis', text: 'A city of the dead holds the second key. Nothing heals under its dark sky, and every hero walks in with all the life they will get.'},
        clear: {title: 'The Lich\'s Rest', text: 'The Pale Lich crumbles to dust, but the Grave Key is not among its bones. It lies deeper in the city, with the dead who still walk.'},
    },
    ironboundFoundry: {
        start: {title: 'Ironbound Foundry', text: 'The third key was taken to a foundry that never stopped working after its makers left. Its constructs throw every blow back at the striker.'},
        clear: {title: 'The Forge Goes Cold', text: 'The Forge Titan grinds to a halt, but the Cog Key is still somewhere in the works. The foundry\'s machines will have to give it up one by one.'},
    },
    skyspireAerie: {
        start: {title: 'Skyspire Aerie', text: 'The last key waits atop a spire above the clouds, where the storm gods judge every blow struck.'},
        clear: {title: 'Above the Clouds', text: 'The Sky Sovereign is cast down, but the Gale Key still rides the winds around the spire. Keep climbing until it falls into your hands.'},
    },
    shatteredThrone: {
        start: {title: 'The Shattered Throne', text: 'The portal opens onto a throne room adrift in the rift. Every horror your heroes have faced came from here, and the one who sits on the throne has been waiting for them.'},
        clear: {title: 'The Throne Is Broken', text: 'The Shattered King falls, and the rift goes still. The roads are safe, the storms are quiet, and the wilds will remember your guild\'s name. Yet the crown he wore was never his own. Somewhere, its true owner may still be watching.'},
    },
};
