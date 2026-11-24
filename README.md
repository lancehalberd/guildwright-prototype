# Guildwright prototype

A playable browser prototype of a guild crafting idle game. Adventurers run quests on their own, and you craft gear from the materials they bring back.

Play it at https://lancehalberd.github.io/guildwright-prototype/. Every push to `main` rebuilds and redeploys the site through `.github/workflows/pages.yml`.

## Run it

```
npm install
npm run dev            # local dev server with hot reload
npm run build          # type check and build to dist/
npm run build:pages    # the GitHub Pages build: readable code, art as separate files, in dist-pages/
npm run build:single   # also writes dist/guildwright.html, one self-contained page
npm run sim            # headless balance check (npm run sim -- 1000 for more runs)
```

Progress saves to local storage every 5 seconds. The Dev button in the top bar has testing tools (gold, fame, materials, level up, reset save).

## Where things live

| Path | What it holds |
| --- | --- |
| `src/engine/types.ts` | All game data types. `GameState` is plain JSON. |
| `src/data/items.ts` | Equipment slots and craftable item types, with their tag paths and multipliers. |
| `src/data/materials.ts` | Materials: base, decoration and direct-equip stats by tag. |
| `src/data/quests.ts` | Classes, monsters, quests, reward pools and the difficulty curve. |
| `src/engine/crafting.ts` | Crafting rules (sum, cap by max, decorations, naming). |
| `src/engine/stats.ts` | Adventurer stat formulas. |
| `src/engine/runner.ts` | Quest loop and combat in fixed 1/60 s ticks: fight, rest, repeat. |
| `src/engine/state.ts` | New game, equip and unequip, selling, quest progress. |
| `src/ui/` | DOM rendering for the map, HUD, battle view and panels. |
| `src/assets/` | Art (WebP): portraits, hero and monster sprites, backgrounds, map, item and material icons. |
| `scripts/` | Balance simulations and data checks that reuse the engine (run with `npx tsx`). |

The engine has no DOM dependencies, so the scripts can drive it directly.
