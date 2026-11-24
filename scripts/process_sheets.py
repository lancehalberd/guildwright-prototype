# Splits the 3x2 monster sheets and makes 96px sprites into the game's assets.
#   python3 process_sheets.py [sheet numbers...]
import json, subprocess, sys
from PIL import Image
HERE = '/mnt/project-files/art/monsters'
SHEETS = {
 1: ['ashImp', 'cinderHound', 'obsidianGolem', 'emberMote', 'salamander', 'flameKnight'],
 2: ['koboldShaman', 'oreGolem', 'bogLeech', 'mireStalker', 'frostToad', 'marshWisp'],
 3: ['drownedKnight', 'sparkWisp', 'cragLynx', 'thunderRam', 'stormHarpy', 'stormcaller'],
 4: ['riftMote', 'riftHound', 'shardGolem', 'emberRevenant', 'frostRevenant', 'stormRevenant'],
 5: ['swarmling', 'hiveDrone', 'acidSpitter', 'thornMantis', 'amberBeetle', 'broodGuard'],
 6: ['boneThrall', 'cryptGhoul', 'wailingShade', 'barrowKnight', 'plagueBearer', 'lichAcolyte'],
 7: ['cogSpider', 'brassSentry', 'steamHound', 'smelterGolem', 'clockworkKnight', 'forgeWarden'],
 8: ['galeKestrel', 'skyHarpy', 'stormHawk', 'cloudSerpent', 'thunderEagle', 'windWarden'],
 9: ['riftStalker', 'starfallMote', 'voidWraith', 'throneSentinel', 'shatteredKnight', 'emberColossus'],
}
# Relative size on the 96px canvas, like the Bramble Road set (rat 0.55 ... goblin brute 0.9).
FILL = dict(ashImp=.6, cinderHound=.72, obsidianGolem=.9, emberMote=.5, salamander=.62, flameKnight=.86,
 koboldShaman=.66, oreGolem=.9, bogLeech=.7, mireStalker=.82, frostToad=.66, marshWisp=.6,
 drownedKnight=.86, sparkWisp=.5, cragLynx=.8, thunderRam=.72, stormHarpy=.8, stormcaller=.84,
 riftMote=.45, riftHound=.72, shardGolem=.9, emberRevenant=.86, frostRevenant=.86, stormRevenant=.86,
 swarmling=.45, hiveDrone=.6, acidSpitter=.66, thornMantis=.82, amberBeetle=.72, broodGuard=.9,
 boneThrall=.78, cryptGhoul=.75, wailingShade=.76, barrowKnight=.9, plagueBearer=.82, lichAcolyte=.82,
 cogSpider=.55, brassSentry=.76, steamHound=.72, smelterGolem=.92, clockworkKnight=.88, forgeWarden=.9,
 galeKestrel=.5, skyHarpy=.8, stormHawk=.7, cloudSerpent=.8, thunderEagle=.86, windWarden=.9,
 riftStalker=.86, starfallMote=.5, voidWraith=.82, throneSentinel=.9, shatteredKnight=.88, emberColossus=.95)
# Translucent parts (insect wings, ghosts, smoke) pick up the magenta background as pink.
# Turn light pinks into a cool pale grey; darker purples (rift creatures) are left alone.
def depink(path):
    im = Image.open(path).convert('RGBA')
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and r > 150 and b > 150 and g < min(r, b) - 40:
                v = (r + g + b) // 3 + 30
                px[x, y] = (min(255, v - 8), min(255, v - 4), min(255, v + 10), a)
    im.save(path)

for n in [int(a) for a in sys.argv[1:]] or SHEETS:
    keys = SHEETS[n]
    subprocess.run(['python3', f'{HERE}/split_sheet.py', f'{HERE}/originals/sheet-{n}.png', '3', '2'] + [f'{HERE}/originals/{k}.png' for k in keys], check=True)
    for k in keys:
        subprocess.run(['python3', f'{HERE}/boss_sprite.py', f'{HERE}/originals/{k}.png', f'{HERE}/monster-{k}.png', '96', str(FILL[k]), 'box', '1', '32', 'bottom'], check=True, capture_output=True)
        depink(f'{HERE}/monster-{k}.png')
        Image.open(f'{HERE}/monster-{k}.png').save(f'/home/user/gw/src/assets/monsters/monster-{k}.webp', lossless=True)
