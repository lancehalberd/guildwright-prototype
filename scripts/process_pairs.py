# Splits a class pair (female left, male right) and makes the 96px hero battle sprites.
#   python3 process_pairs.py <class> [<class> ...]
import subprocess, sys
from PIL import Image
H = '/mnt/project-files/art/heroes'
M = '/mnt/project-files/art/monsters'
for k in sys.argv[1:]:
    f, m = f'{H}/originals/{k}-female.png', f'{H}/originals/{k}-male.png'
    subprocess.run(['python3', f'{M}/split_sheet.py', f'{H}/originals/pair-{k}.png', '2', '1', f, m], check=True)
    for look, src in (('female', f), ('male', m)):
        out = f'{H}/hero-{k}-{look}.png'
        subprocess.run(['python3', f'{M}/boss_sprite.py', src, out, '96', '0.84', 'box', '1', '32', 'bottom'], check=True, capture_output=True)
        Image.open(out).save(f'/home/user/gw/src/assets/heroes/hero-{k}-{look}.webp', lossless=True)
