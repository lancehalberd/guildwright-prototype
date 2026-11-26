import './style.css';
import {isPremium, materialOrder, requireMaterial} from './data/materials';
import {classes, endlessKey, questHiddenOnMap, questOrder, questShape, quests, unlockKeys, unlockMet, unlockQuestNames} from './data/quests';
import {devDrop, devPremiumDrop, getAutoRecoverBudget, getRecoverCost, recoverInstantly, drainCombatEvents, drainPortalEvents, pendingExtraFight, drainContractEvents, drainDropEvents, hasPendingCombatEvents, setLeaveGate, tick, TICK_SECONDS} from './engine/runner';
import {ensureGuildContracts, ensurePersonalContract} from './engine/contracts';
import {CombatView, setCombatSpeed, timeScale} from './ui/combatView';
import {closePreview, openPreview, previewOpen} from './ui/preview';
import {backgroundUrl} from './ui/backgrounds';
import {clearSave, exportSave, importSave, loadGame, saveGame} from './engine/save';
import {addMaterial, checkProgress, nextExpansion, createNewGame, getQuestProgress, isModifierUnlocked, isQuestCleared, isQuestUnlocked} from './engine/state';
import {getCachedStats, invalidateStats, levelCap, totalXpForLevel} from './engine/stats';
import type {Adventurer, GameState, QuestDef, Tier} from './engine/types';
import {adoptHandlers, h, shortNumber, svg, type Listened} from './ui/dom';
import {heroPortrait} from './ui/portraits';
import {exportBuild} from './engine/buildExport';
import {classIcon, materialIcon} from './ui/icons';
import {renderMaterialDetail} from './ui/materialDetail';
import {trophies, trophyList, trophyTierName} from './data/trophies';
import {salvageLevel, salvageVisible} from './engine/salvage';
import {BENCH_PRICE, hasBench, setHoldLevelRestock} from './engine/shop';
import {portalSecondsLeft} from './engine/portal';
import {peddlerHere, peddlerUnlocked, updatePeddler} from './engine/peddler';
import {installTextures} from './ui/textures';
import {guildHallSizes} from './ui/guildSizes';
import {decoUrl, GROUND, mapGroundUrl, MOUNTAINS, BUSHES, ROCKS, SEA_X, siteArtUrl, SMALL, TREES} from './ui/mapArt';
import {activityText, clearFlag, heroCleared, clock, contractsOpen, selectHero, openGuildSection, renderBenchCompare, renderBenchPanel, renderGearPanel, renderPanel, renderPickerPanel, renderRecapPanel, renderRunPanel, renderRunStrip, renderStarterPick, type Ctx, type UiState} from './ui/panels';

const glyphs = {
    guild: '<svg viewBox="0 0 32 32"><path d="M5 15 16 6l11 9"/><path d="M8 13v13h16V13"/><path d="M13 26v-7h6v7"/><path d="M16 6V2l5 1.5L16 5"/></svg>',
    bench: '<svg viewBox="0 0 32 32"><path d="M4 11h17c0 4 3 5 7 5v3H19l-2 3h3v4H8v-4h3l-2-3H4z"/></svg>',
    quest: '<svg viewBox="0 0 32 32"><path d="M8 29V4"/><path d="M8 5h16l-4 5 4 5H8"/></svg>',
    salvage: '<svg viewBox="0 0 32 32"><path d="M5 27 17 15"/><path d="M14 10l7-6 7 7-6 7z"/><path d="M6 8h6M9 5v6"/></svg>',
    // The merchant's HUD button: a $ (the shopfront read too much like the guild hall's).
    shop: '<svg viewBox="0 0 32 32"><path d="M21.5 10c-1-1.8-3-2.8-5.5-2.8-3.2 0-5.4 1.6-5.4 4.1 0 2.6 2.6 3.4 5.4 4.1s5.4 1.6 5.4 4.3c0 2.6-2.3 4.3-5.4 4.3-2.6 0-4.8-1.1-5.9-3"/><path d="M16 4v24"/></svg>',
    merchant: '<svg viewBox="0 0 32 32"><path d="M5 13h22l-2-6H7z"/><path d="M7 13v13h18V13"/><path d="M13 26v-7h6v7"/><path d="M5 13c0 2 2 3 4 3s4-1 4-3c0 2 2 3 3 3s3-1 3-3c0 2 2 3 4 3s4-1 4-3"/></svg>',
    peddler: '<svg viewBox="0 0 32 32"><path d="M4 22h18l3-9H8"/><path d="M8 13 6 7H3"/><circle cx="9" cy="26" r="2"/><circle cx="20" cy="26" r="2"/><path d="M12 13l3-5 3 5"/></svg>',
    map: '<svg viewBox="0 0 32 32"><path d="M4 8l7-3 10 3 7-3v19l-7 3-10-3-7 3z"/><path d="M11 5v19M21 8v19"/></svg>',
    battle: '<svg viewBox="0 0 32 32"><path d="M5 5l15 15M27 5 12 20"/><path d="M17 23l6-6M9 17l6 6"/><path d="M21 21l5 5M11 21l-5 5"/></svg>',
    lock: '<svg viewBox="0 0 32 32"><rect x="8" y="14" width="16" height="13" rx="2"/><path d="M11 14v-4a5 5 0 0 1 10 0v4"/></svg>',
};
// Each area's badge: a glyph and a color, so the map reads at a glance. Unknown areas fall back to a flag.
const questLooks: Record<string, {color: string, glyph: string}> = {
    brambleRoad: {color: '#4f8a3a', glyph: '<svg viewBox="0 0 32 32"><path d="M16 29V17"/><path d="M16 4c-6 0-9 4-9 8 0 3 3 6 9 6s9-3 9-6c0-4-3-8-9-8z"/><path d="M12 22l4-3 4 3"/></svg>'},
    hollowMines: {color: '#7b6650', glyph: '<svg viewBox="0 0 32 32"><path d="M8 27 21 14"/><path d="M6 11c7-6 15-5 20 2-6-3-11-3-15 1z"/></svg>'},
    ashenPeaks: {color: '#c2532c', glyph: '<svg viewBox="0 0 32 32"><path d="M3 27 12 13h8l9 14z"/><path d="M12 13l2 3 2-2 2 2 2-3"/><path d="M14 9c-1-2 0-4 2-5M18 9c1-2 3-3 5-3"/></svg>'},
    sunkenMarsh: {color: '#3d7f70', glyph: '<svg viewBox="0 0 32 32"><path d="M4 25c3-2 5-2 8 0s5 2 8 0 5-2 8 0"/><path d="M10 21V10M16 21V6M22 21V12"/><path d="M16 6c-2 1-2 5 0 6 2-1 2-5 0-6z"/></svg>'},
    thunderheadCrags: {color: '#356fb5', glyph: '<svg viewBox="0 0 32 32"><path d="M19 3 9 17h7l-3 12 10-15h-7z"/></svg>'},
    sunderedRift: {color: '#7a55b8', glyph: '<svg viewBox="0 0 32 32"><path d="M16 3l8 9-8 17-8-17z"/><path d="M8 12h16M13 12l3-9 3 9-3 17z"/></svg>'},
    amberHive: {color: '#cf8f22', glyph: '<svg viewBox="0 0 32 32"><path d="M16 4l5 3v6l-5 3-5-3V7z"/><path d="M10 15l5 3v6l-5 3-5-3v-6z"/><path d="M22 15l5 3v6l-5 3-5-3v-6z"/></svg>'},
    duskgraveNecropolis: {color: '#565c7c', glyph: '<svg viewBox="0 0 32 32"><path d="M9 27V13a7 7 0 0 1 14 0v14z"/><path d="M16 13v9M12.5 16.5h7"/><path d="M5 27h22"/></svg>'},
    ironboundFoundry: {color: '#97632b', glyph: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="4"/><circle cx="16" cy="16" r="9"/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8"/></svg>'},
    skyspireAerie: {color: '#3c97bf', glyph: '<svg viewBox="0 0 32 32"><path d="M25 4C13 6 7 14 7 28"/><path d="M25 4c-1 9-7 15-15 17"/><path d="M13 17l7-1M11 22l6-1M16 12l6-1"/></svg>'},
    shatteredThrone: {color: '#a5345a', glyph: '<svg viewBox="0 0 32 32"><path d="M6 24 4 10l7 6 5-9 5 9 7-6-2 14z"/><path d="M6 28h20"/></svg>'},
};
const siteColors = {guild: '#8a5a12', bench: '#7a4f2a', merchant: '#2f7d4f', salvage: '#6a6f78', peddler: '#9a6b2e'};

// The map is a fixed canvas, in pixels, that the player can drag around inside the map area.
installTextures();
const MAP_W = 1300, MAP_H = 720;
const sites = {
    guild: {x: 125, y: 180},
    bench: {x: 265, y: 310},
    merchant: {x: 220, y: 20},
    salvage: {x: 110, y: 395},
    // The travelling peddler stops between Bramble Road and the tier 2 areas.
    peddler: {x: 505, y: 260},
};
// Areas still to come, shown only with the layout preview (Dev menu): tier 4, the four tier 5
// areas around the final one, and room for more guild buildings.
const futureSites: {key: string, name: string, sub: string, x: number, y: number}[] = [
    {key: 'g1', name: 'Guild building', sub: 'Reserved', x: -55, y: 270},
    {key: 'g2', name: 'Guild building', sub: 'Reserved', x: -10, y: 80},
];
// Roads between map points. Future roads only show with the preview.
// [from, to, future road (shown only with the preview), how far it bends to one side (default:
// alternating ±0.12)]. Laid out with the Dev menu's map layout editor.
const roads: [string, string, boolean?, number?][] = [
    ['guild', 'bench', false, -0.12], ['guild', 'brambleRoad', false, -0.12], ['brambleRoad', 'hollowMines', false, 0.12], ['hollowMines', 'ashenPeaks', false, 0],
    ['hollowMines', 'sunkenMarsh', false, 0.12], ['hollowMines', 'thunderheadCrags', false, -0.3], ['ashenPeaks', 'sunderedRift', false, 0.06], ['sunkenMarsh', 'sunderedRift', false, -0.12],
    ['thunderheadCrags', 'sunderedRift', false, -0.2], ['sunderedRift', 'amberHive', false, -0.12], ['sunderedRift', 'duskgraveNecropolis', false, -0.06], ['sunderedRift', 'ironboundFoundry', false, -0.12],
    ['sunderedRift', 'skyspireAerie', false, 0.12], ['sunderedRift', 'shatteredThrone', false, -0.12], ['merchant', 'brambleRoad', false, 0.12], ['g1', 'guild', true, 0.12],
    ['g2', 'guild', true, 0.12], ['salvage', 'bench', false, 0.12],
];
let showFuture = false;

let state: GameState = loadGame();
let speed = 1;
// Light, dark, or following the device. Kept with the view in this browser.
type Theme = 'auto' | 'light' | 'dark';
let theme: Theme = 'auto';
function applyTheme() {
    if (theme === 'auto') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
}
const themeIcons: Record<Theme, string> = {
    auto: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg>',
    light: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>',
    dark: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>',
};
let devOpen = false;
let toastTimer = 0;
// The UI as a new player first sees it. Reset save goes back to this (only the theme is kept).
function freshUi(): UiState {
    return {
        panel: null,
        benchOpen: false,
        picker: null,
        runPanel: null,
        view: 'map',
        selectedSlot: null,
        selectedEncounter: {},
        bench: {itemType: 'sword', base: [], decorations: []},
        materialDetail: null,
        // On for new players; a saved view keeps the player's choice.
        hideTooHigh: true,
    };
}
const ui: UiState = freshUi();

const ctx: Ctx = {
    get state() { return state; },
    ui,
    refresh: () => { renderAll(); },
    toast: showToast,
};

const app = document.getElementById('app')!;
const hud = h('header', {class: 'hud'});
const map = h('main', {class: 'map'});
const world = h('div', {class: 'world'});
const canvas = h('div', {class: 'canvas', style: `width:${MAP_W}px;height:${MAP_H}px`});
world.appendChild(canvas);
map.appendChild(world);
app.append(hud, map);

// ---------------- HUD ----------------

function renderHud() {
    hud.replaceChildren(
        h('div', {class: 'hud-title'}, 'Guildwright'),
        h('div', {class: 'hud-stat'}, h('span', {class: 'label'}, 'Gold'), h('span', {class: 'value', id: 'hud-gold'}, shortNumber(state.gold))),
        h('div', {class: 'hud-stat'}, h('span', {class: 'label'}, 'Fame'), h('span', {class: 'value', id: 'hud-fame'}, shortNumber(state.fame))),
        hudActions(),
        heroBar(),
        h('div', {class: 'seg', role: 'group', 'aria-label': 'Game speed', title: 'Game speed (Space)'},
            // Narrow screens show only the current speed, and a tap steps to the next one.
            ...[1, 4, 16].map((s, i, all) => h('button', {class: speed === s ? 'on' : '', onclick: () => {
                speed = narrowScreen.matches && speed === s ? all[(i + 1) % all.length] : s;
                renderHud(); saveView();
            }}, `${s}×`)),
        ),
        h('button', {
            class: 'btn themebtn',
            title: `Theme: ${theme === 'auto' ? 'follows your device' : theme}. Click to change.`,
            'aria-label': `Theme: ${theme}. Change theme`,
            onclick: () => { theme = theme === 'auto' ? 'light' : theme === 'light' ? 'dark' : 'auto'; applyTheme(); renderHud(); saveView(); },
        }, svg(themeIcons[theme]), h('span', {class: 'themelabel'}, theme === 'auto' ? 'Auto' : theme === 'light' ? 'Light' : 'Dark')),
        h('button', {class: 'btn devbtn', onclick: () => { devOpen = !devOpen; renderHud(); }}, 'Dev'),
        ...(devOpen ? [devMenu()] : []),
    );
}

// Quick actions left of the hero cards: the map/battle switch and every map site that opens a panel,
// so they're reachable from the battle view or with the map panned away. Built with the HUD and
// updated in place with the map, so visibility, open state and guide pulses stay current.
// Narrow screens: panels cover the whole map and the run panel is skipped. The map and battle buttons
// are separate there, and each closes the panels and goes straight to its view.
const narrowScreen = matchMedia('(max-width: 760px)');
narrowScreen.addEventListener('change', () => renderAll());
function panelsOpen(): boolean {
    return !!(ui.panel || ui.benchOpen || ui.shopOpen || ui.picker || ui.materialDetail);
}
function closePanels() {
    ui.panel = null;
    ui.benchOpen = false;
    ui.shopOpen = false;
    ui.picker = null;
    ui.materialDetail = null;
}
interface HudAction {key: string, el: HTMLButtonElement}
let hudActionEls: HudAction[] = [];
function hudAction(key: string, label: string, glyph: string, color: string, onclick: () => void): HudAction {
    const el = h('button', {class: 'hudact', style: `--site:${color}`, title: label, 'aria-label': label, onclick}, svg(glyph)) as HTMLButtonElement;
    return {key, el};
}
function hudActions(): HTMLElement {
    hudActionEls = [
        hudAction('map', 'Show the map (M)', glyphs.map, '#8c3b2e', () => {
            closePanels();
            ui.view = 'map';
            renderAll();
        }),
        hudAction('view', '', glyphs.battle, '#8c3b2e', () => {
            if (narrowScreen.matches) { closePanels(); ui.view = 'battle'; }
            else ui.view = ui.view === 'battle' ? 'map' : 'battle';
            renderAll();
        }),
        // Each place button toggles: a second press closes what it opened.
        hudAction('quest', 'Quest (Q)', glyphs.quest, '#4f6a8c', () => { toggleHudQuest(); }),
        hudAction('guild', 'Guild hall (G)', glyphs.guild, siteColors.guild, () => togglePanel('guild')),
        hudAction('merchant', 'Merchant (S)', glyphs.shop, siteColors.merchant, () => { if (ui.shopOpen) closeLeft(); else openShop(); }),
        hudAction('bench', 'Crafting bench (W)', glyphs.bench, siteColors.bench, () => { if (ui.benchOpen || !hasBench(state) && ui.shopOpen) closeLeft(); else openBench(); }),
        hudAction('peddler', 'Travelling peddler (P)', glyphs.peddler, siteColors.peddler, () => togglePanel('peddler')),
        hudAction('salvage', 'Salvage yard (Y)', glyphs.salvage, siteColors.salvage, () => togglePanel('salvage')),
    ];
    updateHudActions();
    return h('div', {class: 'hud-actions', role: 'group', 'aria-label': 'Places'}, ...hudActionEls.map(a => a.el));
}
function updateHudActions() {
    for (const {key, el} of hudActionEls) {
        // Narrow screens show both view buttons, the one in view outlined while no panel covers it.
        // Wide screens show one button that switches between the two.
        const split = narrowScreen.matches;
        if (key === 'map') {
            el.hidden = !split;
            el.classList.toggle('viewact', true);
            el.classList.toggle('open', split && ui.view !== 'battle' && !panelsOpen());
            continue;
        }
        if (key === 'view') {
            el.classList.toggle('open', split && ui.view === 'battle' && !panelsOpen());
            const battle = ui.view === 'battle' && !split;
            const hero = state.adventurers.find(a => a.id === ui.hero) ?? state.adventurers[0];
            const onQuest = !!(hero?.run && hero.assignment);
            const label = battle ? 'Back to the map (M)' : onQuest ? `Watch ${hero!.name}'s fight (B)` : `${hero?.name ?? 'The selected hero'} isn't on a quest`;
            const glyph = battle ? 'map' : 'battle';
            if (el.dataset.glyph !== glyph) { el.dataset.glyph = glyph; el.replaceChildren(svg(glyphs[glyph])); }
            el.disabled = !battle && !onQuest;
            el.title = label;
            el.setAttribute('aria-label', label);
            el.classList.toggle('viewact', true);
            continue;
        }
        if (key === 'quest') {
            const qk = hudQuestKey();
            el.hidden = !qk;
            el.classList.toggle('open', !!qk && ui.panel?.kind === 'quest' && ui.panel.key === qk);
            const label = qk ? `${quests[qk].name} (Q)` : 'Quest (Q)';
            if (el.title !== label) { el.title = label; el.setAttribute('aria-label', label); }
            continue;
        }
        const visible = key === 'peddler' ? peddlerUnlocked(state) && !!state.peddler
            : key === 'salvage' ? salvageVisible(state) : key === 'bench' ? hasBench(state) : true;
        el.hidden = !visible;
        const open = key === 'guild' ? ui.panel?.kind === 'guild' : key === 'merchant' ? !!ui.shopOpen
            : key === 'bench' ? ui.benchOpen : ui.panel?.kind === key;
        el.classList.toggle('open', open);
        el.classList.toggle('dim', key === 'bench' && !hasBench(state) || key === 'salvage' && !salvageLevel(state) || key === 'peddler' && !peddlerHere(state));
    }
}

// Drops every view selection that points into the old game when a save is reset or imported:
// open panels, the bench's half-built craft and its pickers, selected hero and encounters.
function clearGameUi() {
    Object.assign(ui, {view: 'map', panel: null, benchOpen: false, shopOpen: false, picker: null, decoSkipped: false, runPanel: null,
        selectedSlot: null, selectedEncounter: {}, bench: {itemType: 'sword', base: [], decorations: []}, materialDetail: null,
        hero: null, confirmRetire: null, trophyPick: null, recap: null, salvaging: null, scrollTo: null, questTab: {}});
    saveView();
}

// Export and import through the clipboard. Where the page can't use the clipboard, the save text
// shows in the box to copy by hand, and an import reads whatever is pasted there.
function saveTools(): HTMLElement {
    const box = h('textarea', {class: 'savebox', rows: '2', placeholder: 'Save text', 'aria-label': 'Save text'}) as HTMLTextAreaElement;
    const doImport = (text: string) => {
        const error = importSave(text);
        if (error) { showToast(error); return; }
        state = loadGame();
        invalidateStats();
        clearGameUi();
        devOpen = false;
        buildMap();
        renderAll();
        showToast('Save imported');
    };
    return h('div', {class: 'savetools'},
        h('div', {class: 'row'},
            h('button', {class: 'btn', onclick: async () => {
                saveGame(state);
                box.value = exportSave(state);
                try {
                    await navigator.clipboard.writeText(box.value);
                    showToast('Save copied to the clipboard');
                } catch {
                    box.select();
                    showToast('Copy the save text from the box');
                }
            }}, 'Export save'),
            h('button', {class: 'btn', onclick: async () => {
                if (box.value.trim()) { doImport(box.value); return; }
                try {
                    doImport(await navigator.clipboard.readText());
                } catch {
                    box.focus();
                    showToast('Paste the save text into the box, then import');
                }
            }}, 'Import save'),
            h('button', {class: 'btn', title: 'Copy the selected hero\'s gear and stats as a build recipe (JSON) to report', onclick: async () => {
                const hero = state.adventurers.find(a => a.id === ui.hero) ?? state.adventurers[0];
                if (!hero) { showToast('No hero to export'); return; }
                box.value = JSON.stringify(exportBuild(state, hero), null, 2);
                try {
                    await navigator.clipboard.writeText(box.value);
                    showToast(`${hero.name}'s build copied to the clipboard`);
                } catch {
                    box.select();
                    showToast('Copy the build from the box');
                }
            }}, 'Export build'),
        ),
        box,
    );
}

function devMenu(): HTMLElement {
    const confirmReset = h('button', {class: 'btn danger', onclick: () => {
        clearSave();
        state = createNewGame();
        invalidateStats();
        // Nothing from the old game carries over: open panels, selections, queued events and every
        // UI setting (run details, stat filters, game speed, pending toasts). Only the theme stays.
        clearGameUi();
        for (const key of Object.keys(ui)) delete (ui as unknown as Record<string, unknown>)[key];
        Object.assign(ui, freshUi());
        speed = 1;
        dropToasts = [];
        window.clearTimeout(toastTimer); toastEl?.remove(); toastEl = null;
        userPanned = false;
        drainDropEvents(); drainCombatEvents(); drainContractEvents(); drainPortalEvents();
        guideSig = '';
        devOpen = false;
        renderAll();
        saveView();
        showToast('Started a new game');
    }}, 'Yes, erase my save');
    confirmReset.hidden = true;
    const menu = h('div', {class: 'devmenu'},
        h('strong', null, 'Testing tools'),
        h('button', {class: 'btn', onclick: () => { state.gold += 100; renderAll(); }}, '+100 gold'),
        h('button', {class: 'btn', onclick: () => { state.fame += 10; renderAll(); }}, '+10 fame'),
        h('button', {class: 'btn', onclick: () => {
            for (const key of materialOrder) if (!isPremium(key)) addMaterial(state, key, 5);
            renderAll();
        }}, '+5 of every material'),
        h('button', {class: 'btn', onclick: () => { devDrop(state, 'R'); renderAll(); }}, 'Drop a rare'),
        h('button', {class: 'btn', onclick: () => { devDrop(state, 'M'); renderAll(); }}, 'Drop a mythic'),
        h('button', {class: 'btn', onclick: () => { devPremiumDrop(state); renderAll(); }}, 'Drop a premium'),
        h('button', {class: 'btn', onclick: () => {
            for (const hero of state.adventurers) {
                hero.xp = Math.max(hero.xp, totalXpForLevel(hero.level + 1));
                hero.level++;
                invalidateStats();
                hero.hp = getCachedStats(state, hero).maxHealth;
            }
            renderAll();
        }}, 'Level up every adventurer'),
        // Later slots need a guild expansion, which needs fame.
        h('button', {class: 'btn', title: 'Raise fame to the next expansion and add its gold cost to your gold', onclick: () => { const next = nextExpansion(state); if (next) { state.fame = Math.max(state.fame, next.fame); state.gold += next.gold; } renderAll(); }}, 'Fame + gold to next expansion'),
        h('button', {class: 'btn', title: 'Step through every encounter as the battle view lays it out, and every class portrait and battle sprite', onclick: () => { devOpen = false; renderAll(); openPreview(document.body); }}, 'Art preview'),
        h('button', {class: 'btn', title: 'Every source of a stat from bases, decorations and worn materials', onclick: () => { ui.panel = {kind: 'statExplorer'}; devOpen = false; renderAll(); }}, 'Stat explorer'),
        h('button', {class: 'btn', onclick: () => { showFuture = !showFuture; buildMap(); renderAll(); }}, showFuture ? 'Hide future map areas' : 'Preview future map areas'),
        h('button', {class: 'btn', title: 'Hide the item icons in the crafted items and equip lists and use larger text there. Equipment slots keep their icons.', onclick: () => { ui.hideItemIcons = !ui.hideItemIcons; saveView(); renderAll(); }}, ui.hideItemIcons ? 'Show item icons in lists' : 'Hide item icons in lists'),
        h('button', {class: 'btn', title: 'Drag places to move them, add or remove roads and change their curves, then copy the layout', onclick: () => { devOpen = false; openLayoutEditor(); renderAll(); }}, 'Edit map layout'),
        h('button', {class: 'btn', onclick: () => {
            // Starts visits without the Hollow Mines clear that normally unlocks them.
            state.peddler ??= {nextVisit: state.time, stock: [], visits: 0};
            state.peddler.nextVisit = state.time;
            delete state.peddler.leavesAt;
            renderAll();
        }}, 'Bring the peddler now'),
        h('button', {class: 'btn', onclick: () => {
            for (const key of ['amberKey', 'graveKey', 'cogKey', 'galeKey']) addMaterial(state, key, 1);
            renderAll();
        }}, 'Give one of each key'),
        h('button', {class: 'btn', title: 'Meets every quest\'s unlock (earlier clears and fame), unlocks every modifier, reveals every encounter and reward pool, and opens the Shattered Throne portal for 60 minutes', onclick: () => {
            for (const key of questOrder) {
                const quest = quests[key];
                for (const a of unlockKeys(quest)) if (!state.achievements.includes(a)) state.achievements.push(a);
                state.fame = Math.max(state.fame, quest.fameToUnlock);
                getQuestProgress(state, key).bestModifiedClear = 5;
            }
            // Reveal every encounter's monsters and every reward pool, Endless variants included.
            for (const quest of Object.values(quests)) {
                const progress = getQuestProgress(state, quest.key);
                progress.seen = quest.encounters.map((_, i) => i);
                for (const tier of ['C', 'U', 'R', 'M'] as Tier[]) progress.revealed[tier] = quest.pools[tier].map(e => e.material);
                if (quest.boss) { progress.legendaryRevealed = true; progress.bossFought = true; }
            }
            state.portal = {openUntil: Math.max(state.portal?.openUntil ?? 0, state.time + 60 * 60)};
            renderAll();
            showToast('Every quest, modifier, encounter and reward pool is unlocked. The portal is open for 60 minutes.');
        }}, 'Unlock all quests and modifiers'),
        h('button', {class: 'btn', title: 'Sets every trophy to its top tier and adds the fame those tiers give', onclick: () => {
            state.trophies ??= {};
            for (const def of trophyList) {
                const top = def.tiers.length - 1;
                for (let t = (state.trophies[def.key] ?? -1) + 1; t <= top; t++) state.fame += def.tiers[t].fame;
                state.trophies[def.key] = top;
            }
            invalidateStats();
            renderAll();
            showToast('Every trophy is at its top tier');
        }}, 'Unlock all trophies'),
        saveTools(),
        h('button', {class: 'btn danger', onclick: (event) => {
            (event.currentTarget as HTMLElement).hidden = true;
            confirmReset.hidden = false;
        }}, 'Reset save…'),
        confirmReset,
    );
    // Never taller than the space below it in the viewport; scrolls when it doesn't fit.
    requestAnimationFrame(() => fitDevMenu(menu));
    return menu;
}
function fitDevMenu(menu: HTMLElement) {
    if (menu.isConnected) menu.style.maxHeight = `${Math.max(120, window.innerHeight - menu.getBoundingClientRect().top - 12)}px`;
}
window.addEventListener('resize', () => { const m = document.querySelector<HTMLElement>('.devmenu'); if (m) fitDevMenu(m); });

// Hero selectors in the HUD: the main way to pick the selected hero that every view shows.
// The cards are built once and updated in place every frame, so clicks on their contents land.
interface HeroCard {hero: Adventurer, el: HTMLElement, cls: HTMLElement, lv: HTMLElement, name: Text, hp: HTMLElement, xp: HTMLElement}
let heroCards: HeroCard[] = [];
function heroBar(): HTMLElement {
    heroCards = state.adventurers.map(hero => {
        const cls = h('span', {class: 'hc-class', 'aria-hidden': 'true'});
        const lv = h('b');
        const name = document.createTextNode('');
        const hp = h('span'), xp = h('span');
        const el = h('button', {
            class: 'herocard',
            onclick: () => {
                // In the battle view a card switches the battle to that hero, or back to the map when
                // they aren't on a quest.
                if (ui.view === 'battle' && !(hero.run && hero.assignment)) ui.view = 'map';
                const selected = (ui.hero ?? state.adventurers[0]?.id) === hero.id;
                // Another hero's card only selects them: every open panel stays, and the ones that
                // show the selected hero (character, run, bench) follow along.
                if (!selected) {
                    selectHero(ui, hero.id);
                    renderAll();
                    return;
                }
                // Clicking the hero already selected switches between their character panel and
                // their quest's panel (the quest they're on, or their last one).
                const lastQuest = hero.assignment?.questKey ?? hero.run?.questKey;
                // An endless run shows on its base quest's panel.
                const questKey = lastQuest ? quests[lastQuest]?.endless?.baseKey ?? lastQuest : undefined;
                if (ui.panel?.kind === 'adventurer' && questKey && !(isNarrow() && (ui.benchOpen || ui.shopOpen))) {
                    openPanel({kind: 'quest', key: questKey});
                    return;
                }
                if (!ui.runPanel && hero.run && hero.assignment) ui.runPanel = hero.id;
                // Anything else showing (another panel, none, or on narrow screens the bench or
                // merchant): their character panel takes its place.
                if (ui.panel?.kind !== 'adventurer' || isNarrow() && (ui.benchOpen || ui.shopOpen)) {
                    openPanel({kind: 'adventurer', id: hero.id});
                    return;
                }
                renderAll();
            },
        }, cls, h('span', {class: 'hc-main'},
            h('span', {class: 'hc-name'}, h('span', {class: 'hc-lv'}, 'Lv', lv), name),
            h('span', {class: 'hc-bar hp'}, hp),
            h('span', {class: 'hc-bar xp'}, xp),
        ));
        return {hero, el, cls, lv, name, hp, xp};
    });
    updateHeroCards();
    const bar = h('div', {class: 'hud-heroes', role: 'group', 'aria-label': 'Selected hero'}, ...heroCards.map(c => c.el));
    dragScroll(bar);
    return bar;
}
// Hero cards sit in one row that scrolls sideways when they don't fit. Touch scrolls natively; a
// mouse drags it, and a drag of more than a few pixels doesn't count as a click on a card.
function dragScroll(el: HTMLElement) {
    let start: {x: number, left: number, id: number} | null = null;
    let dragged = false;
    el.addEventListener('pointerdown', e => {
        if (e.pointerType !== 'mouse' || e.button !== 0 || el.scrollWidth <= el.clientWidth) return;
        start = {x: e.clientX, left: el.scrollLeft, id: e.pointerId};
        dragged = false;
    });
    el.addEventListener('pointermove', e => {
        if (!start || e.pointerId !== start.id) return;
        const dx = e.clientX - start.x;
        if (!dragged && Math.abs(dx) > 5) { dragged = true; el.setPointerCapture(e.pointerId); el.classList.add('dragging'); }
        if (dragged) el.scrollLeft = start.left - dx;
    });
    const end = () => { start = null; el.classList.remove('dragging'); };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('click', e => { if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; } }, true);
}
function updateHeroCards() {
    const selected = state.adventurers.find(a => a.id === ui.hero) ?? state.adventurers[0];
    for (const c of heroCards) {
        const hero = c.hero;
        c.el.classList.toggle('on', hero === selected);
        c.el.setAttribute('aria-pressed', hero === selected ? 'true' : 'false');
        const maxHp = getCachedStats(state, hero).maxHealth;
        const from = totalXpForLevel(hero.level), to = totalXpForLevel(hero.level + 1);
        const xp = hero.level >= levelCap ? 1 : Math.max(0, Math.min(1, (hero.xp - from) / (to - from)));
        const hp = Math.max(0, Math.min(1, hero.hp / maxHp));
        c.el.title = `${hero.name}, level ${hero.level} ${classes[hero.classKey].name} · HP ${Math.max(0, Math.round(hero.hp))}/${maxHp} · ${Math.round(xp * 100)}% to level ${hero.level + 1}`;
        if (c.cls.dataset.cls !== hero.classKey + hero.name) {
            c.cls.dataset.cls = hero.classKey + hero.name;
            c.cls.replaceChildren(heroPortrait(hero) ?? classIcon(hero.classKey));
            c.cls.classList.toggle('has-portrait', !!c.cls.querySelector('.portrait'));
        }
        c.lv.textContent = String(hero.level);
        c.name.data = hero.name;
        c.hp.style.width = `${hp * 100}%`;
        c.xp.style.width = `${xp * 100}%`;
    }
}

function updateHudNumbers() {
    updateHeroCards();
    const gold = document.getElementById('hud-gold');
    const fame = document.getElementById('hud-fame');
    for (const [el, n] of [[gold, state.gold], [fame, state.fame]] as const) {
        if (!el) continue;
        const text = shortNumber(n);
        if (el.textContent !== text) el.textContent = text;
        const full = Math.floor(n).toLocaleString('en-US');
        if (el.title !== full) el.title = text === String(Math.floor(n)) ? '' : full;
    }
}
// ---------------- Map ----------------

// One token per adventurer, rebuilt when someone joins.
let tokenEls: HTMLElement[] = [];
const questSiteEls: Record<string, HTMLElement> = {};
let salvageEl: HTMLElement | null = null;
let benchSiteEl: HTMLElement | null = null;
let guildSiteEl: HTMLElement | null = null;
let merchantEl: HTMLElement | null = null;
let peddlerEl: HTMLElement | null = null;

// Narrow screens only have room for one panel at a time.
const isNarrow = () => window.innerWidth < 900;

// The merchant opens on the left, beside the character panel.
function openShop() {
    ui.benchOpen = false;
    ui.shopOpen = true;
    ui.picker = null;
    if (isNarrow()) ui.panel = null;
    else showCharacterPanel();
    renderAll();
}

function openBench() {
    if (!hasBench(state)) {
        openShop();
        return;
    }
    ui.shopOpen = false;
    ui.benchOpen = true;
    if (isNarrow()) ui.panel = null;
    else showCharacterPanel();
    renderAll();
}

// Opens the selected hero's character panel on the right, unless the guild hall or a quest is
// showing there.
function showCharacterPanel() {
    if (ui.panel?.kind === 'guild' || ui.panel?.kind === 'quest' || isNarrow() && (ui.benchOpen || ui.shopOpen)) return;
    const hero = state.adventurers.find(a => a.id === ui.hero) ?? state.adventurers[0];
    if (!hero) return;
    // Already open: keep its id in step with the hero it shows.
    if (ui.panel?.kind === 'adventurer') { ui.panel.id = hero.id; return; }
    ui.panel = {kind: 'adventurer', id: hero.id};
    ui.selectedSlot = null;
    ui.trophyPick = null;
}

// The HUD's place buttons: close the merchant or bench on the left, or a place panel on the right.
function closeLeft() {
    ui.benchOpen = false;
    ui.shopOpen = false;
    ui.picker = null;
    renderAll();
}
function togglePanel(kind: 'guild' | 'peddler' | 'salvage') {
    if (ui.panel?.kind === kind) { ui.panel = null; renderAll(); }
    else openPanel({kind} as UiState['panel']);
}

function openPanel(panel: UiState['panel']) {
    ui.panel = panel;
    if (panel?.kind === 'quest') ui.lastQuest = quests[panel.key]?.endless?.baseKey ?? panel.key;
    if (isNarrow()) { ui.benchOpen = false; ui.shopOpen = false; }
    ui.selectedSlot = null;
    ui.trophyPick = null;
    renderAll();
}

function buildMap() {
    const paths = roadPaths();
    const terrainEl = svg(`<svg class="terrain" viewBox="0 0 ${MAP_W} ${MAP_H}" width="${MAP_W}" height="${MAP_H}">${terrainArt()}${ROAD_DEFS}<g class="trails" filter="url(#road-rough)">${trailLayers(paths)}</g></svg>`);
    const roadEl = svg(`<svg class="roads" viewBox="0 0 ${MAP_W} ${MAP_H}" width="${MAP_W}" height="${MAP_H}">${paths}</svg>`);
    const guild = guildSiteEl = h('button', {class: 'site', 'data-key': 'guild', style: pos(sites.guild) + `;--site:${siteColors.guild}`, onclick: () => openPanel({kind: 'guild'})},
        guildGlyph(),
        h('div', {class: 'name'}, 'Guild hall'),
        h('div', {class: 'sub'}, 'Members and ledger'),
    );
    const bench = benchSiteEl = h('button', {class: 'site', 'data-key': 'bench', style: pos(sites.bench) + `;--site:${siteColors.bench}`, onclick: openBench},
        siteGlyph('bench', glyphs.bench),
        h('div', {class: 'name'}, 'Crafting bench'),
        h('div', {class: 'sub'}, 'Make gear from materials'),
    );
    merchantEl = h('button', {class: 'site', 'data-key': 'merchant', style: pos(sites.merchant) + `;--site:${siteColors.merchant}`, onclick: () => openShop()},
        siteGlyph('merchant', glyphs.merchant),
        h('div', {class: 'name'}, 'Merchant'),
        h('div', {class: 'sub'}, 'Buy gear'),
    );
    salvageEl = h('button', {class: 'site', 'data-key': 'salvage', style: pos(sites.salvage) + `;--site:${siteColors.salvage}`, onclick: () => openPanel({kind: 'salvage'})},
        siteGlyph('salvage', glyphs.salvage),
        h('div', {class: 'name'}, 'Salvage yard'),
        h('div', {class: 'sub'}, 'Recover materials'),
    );
    peddlerEl = h('button', {class: 'site peddler', 'data-key': 'peddler', style: pos(sites.peddler) + `;--site:${siteColors.peddler}`, onclick: () => openPanel({kind: 'peddler'})},
        siteGlyph('peddler', glyphs.peddler),
        h('div', {class: 'name'}, 'Travelling peddler'),
        h('div', {class: 'sub'}, ''),
    );
    const questEls = questOrder.map(key => {
        const quest = quests[key];
        const el = h('button', {class: 'site', 'data-key': key, hidden: !questShown(key), style: pos(quest.mapPosition) + `;--site:${questLooks[key]?.color ?? '#7a6a58'}`, onclick: () => openPanel({kind: 'quest', key})});
        questSiteEls[key] = el;
        return el;
    });
    tokenEls = state.adventurers.map((_, index) => h('button', {class: 'token', onclick: () => {
        const hero = state.adventurers[index];
        if (!hero) return;
        selectHero(ui, hero.id);
        if (hero.run && hero.assignment) ui.runPanel = hero.id;
        openPanel({kind: 'adventurer', id: hero.id});
    }}));
    const future = showFuture ? futureSites.map(f => h('div', {class: 'site locked future', 'data-key': f.key, style: pos(f)},
        siteGlyph('locked', glyphs.lock),
        h('div', {class: 'name'}, f.name),
        h('div', {class: 'sub'}, f.sub),
    )) : [];
    const groundEl = h('img', {class: 'ground', src: mapGroundUrl, alt: '', draggable: 'false', style: `left:${GROUND.x}px;top:${GROUND.y}px;width:${GROUND.w}px;height:${GROUND.h}px`});
    canvas.replaceChildren(groundEl, terrainEl, sceneryEl(), roadEl, guild, bench, merchantEl, salvageEl, peddlerEl, ...questEls, ...future, ...tokenEls);
    clampPan();
}

// A site's picture: its pixel art when there is some, otherwise the badge with its line glyph.
function siteGlyph(key: string, glyph: string): HTMLElement {
    const url = siteArtUrl(key);
    return url ? h('div', {class: 'glyph art'}, h('img', {src: url, alt: '', draggable: 'false'})) : h('div', {class: 'glyph'}, svg(glyph));
}

// The guild hall grows with each Guild Expansion: guild-0 (a rundown shack) to guild-9 (a palace);
// guild-5 is the original hall. Sprites share one scale (GUILD_ART_SCALE: expansion 5 fills the
// usual 88px site height) and stand on the site's bottom edge, so bigger halls rise above it.
const GUILD_ART_SCALE = 88 / guildHallSizes[5][1];
let builtExpansion = -1;
function guildGlyph(): HTMLElement {
    const level = Math.max(0, Math.min(guildHallSizes.length - 1, state.expansion ?? 0));
    builtExpansion = state.expansion ?? 0;
    const url = siteArtUrl(`guild-${level}`) ?? siteArtUrl('guild');
    const [w, hgt] = guildHallSizes[level];
    return url ? h('div', {class: 'glyph art guildart'}, h('img', {src: url, alt: '', draggable: 'false', style: `width:${Math.round(w * GUILD_ART_SCALE)}px;height:${Math.round(hgt * GUILD_ART_SCALE)}px`})) : siteGlyph('guild', glyphs.guild);
}

function withFlag(glyph: HTMLElement, hero: Adventurer | undefined): HTMLElement {
    if (hero) glyph.append(clearFlag(hero));
    return glyph;
}

function lockText(quest: QuestDef): string {
    if (quest.portal) return isQuestUnlocked(state, endlessKey(quest.key)) ? 'Portal closed · Endless open' : 'Portal closed';
    if (!unlockMet(state.achievements, quest)) {
        return unlockKeys(quest).length > 1 ? 'Needs a tier 3 clear' : `Needs a ${unlockQuestNames(quest)} clear`;
    }
    return `Needs ${quest.fameToUnlock} fame`;
}

function pos(p: {x: number, y: number}): string {
    return `left:${p.x}px;top:${p.y}px`;
}

function pointOf(key: string): {x: number, y: number} | undefined {
    return (sites as Record<string, {x: number, y: number}>)[key] ?? quests[key]?.mapPosition ?? futureSites.find(f => f.key === key);
}

// The ground: a soft wash of each area's color around it, and trees, grass and rocks scattered
// (always in the same places) away from the sites and roads.
// Scenery sprites from the last terrainArt() call, drawn as images under the roads, back to front.
let scenery: {x: number, y: number, key: string, h: number}[] = [];
function sceneryEl(): HTMLElement {
    return h('div', {class: 'scenery', 'aria-hidden': 'true'}, ...scenery.map(d => {
        const url = decoUrl(d.key);
        return url ? h('img', {src: url, alt: '', draggable: 'false', style: `left:${Math.round(d.x)}px;top:${Math.round(d.y)}px;height:${Math.round(d.h)}px`}) : null;
    }));
}
function terrainArt(): string {
    const points = [...Object.values(sites), ...questOrder.map(k => quests[k].mapPosition).filter(Boolean)];
    const washes = questOrder.filter(k => quests[k].mapPosition && questLooks[k]).map(k => {
        const p = quests[k].mapPosition;
        return `<circle cx="${p.x}" cy="${p.y}" r="120" fill="url(#wash-${k})"/>`;
    }).join('');
    const defs = questOrder.filter(k => questLooks[k]).map(k => `<radialGradient id="wash-${k}"><stop offset="0" stop-color="${questLooks[k].color}" stop-opacity="0.22"/><stop offset="1" stop-color="${questLooks[k].color}" stop-opacity="0"/></radialGradient>`).join('');
    // Points along every road, to keep the scenery off them.
    const roadPts: {x: number, y: number}[] = [];
    for (const {p, q, cx, cy} of roadCurves(true)) {
        for (let t = 0; t <= 1; t += 0.05) roadPts.push({x: (1 - t) ** 2 * p.x + 2 * (1 - t) * t * cx + t * t * q.x, y: (1 - t) ** 2 * p.y + 2 * (1 - t) * t * cy + t * t * q.y});
    }
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const art: string[] = [];
    scenery = [];
    let n = 0;
    const pick = (list: string[]) => list[(n++ * 7 + Math.floor(rnd() * 3)) % list.length];
    for (let y = -260; y < MAP_H + 260; y += 46) {
        for (let x = -360; x < MAP_W + 360; x += 46) {
            const px = x + rnd() * 40, py = y + rnd() * 40, kind = rnd();
            if (kind > 0.55) continue;
            if (points.some(p => (p.x - px) ** 2 + (p.y - py) ** 2 < 100 ** 2)) continue;
            if (roadPts.some(p => (p.x - px) ** 2 + (p.y - py) ** 2 < 26 ** 2)) continue;
            const s = 0.8 + rnd() * 0.5;
            // Painted sprites; the sea along the east edge of the ground stays clear.
            if (px > SEA_X) continue;
            if (kind < 0.2) scenery.push(n % 5 === 0 ? {x: px, y: py, key: pick(BUSHES), h: 22 * s} : {x: px, y: py, key: pick(TREES), h: 36 * s});
            else if (kind < 0.42) { if (n++ % 3 === 0) scenery.push({x: px, y: py, key: pick(SMALL), h: 16 * s}); }
            else scenery.push({x: px, y: py, key: pick(ROCKS), h: 15 * s});
        }
    }
    for (const m of MOUNTAINS) {
        if (points.some(p => (p.x - m.x) ** 2 + (p.y - m.y) ** 2 < 70 ** 2)) continue;
        scenery.push(m);
    }
    scenery.sort((a, b) => a.y - b.y);
    return `<defs>${defs}</defs>${washes}${art.join('')}`;
}

// What the map reveals. Every place and open quest shows, plus the locked quests one road away from
// them, with only the roads that touch something open. The tier 5 areas and the final one stay hidden
// until the Sundered Sanctum is cleared, and the Shattered Throne until a portal key turns up.
function mapReveal(): {shown: Set<string>, open: Set<string>} | null {
    if (layoutEdit || showFuture) return null;
    const open = new Set<string>(['guild', 'bench', 'merchant', 'peddler']);
    if (salvageVisible(state)) open.add('salvage');
    const cleared = (key: string) => state.achievements.includes('clear-' + key) || isQuestCleared(state, key);
    const hidden = (key: string) => questHiddenOnMap(state, key);
    for (const key of questOrder) if (!hidden(key) && (isQuestUnlocked(state, key) || cleared(key))) open.add(key);
    const shown = new Set(open);
    for (const [a, b] of roads) {
        if (open.has(a) && !hidden(b)) shown.add(b);
        if (open.has(b) && !hidden(a)) shown.add(a);
    }
    return {shown, open};
}
function mapRevealKey(): string {
    const r = mapReveal();
    return r ? [...r.shown].sort().join(',') + '|' + [...r.open].sort().join(',') : 'all';
}
function questShown(key: string): boolean {
    return mapReveal()?.shown.has(key) ?? true;
}

// Gentle curves: each road bends a little to one side, alternating unless it sets its own bend.
// `index` is the road's place in `roads`.
function roadBend(index: number, shown: number): number {
    return roads[index][3] ?? (shown % 2 ? 0.12 : -0.12);
}
// `all` ignores what the map has revealed (the scenery keeps clear of every road, shown or not).
function roadCurves(all = false) {
    const hiddenSites = all || layoutEdit ? [] : [...(salvageVisible(state) ? [] : ['salvage']), ...(hasBench(state) ? [] : ['bench'])];
    const out: {index: number, future: boolean, p: {x: number, y: number}, q: {x: number, y: number}, cx: number, cy: number}[] = [];
    const reveal = all ? null : mapReveal();
    let shown = 0;
    roads.forEach(([a, b, future], index) => {
        if (future && !showFuture || hiddenSites.includes(a) || hiddenSites.includes(b)) return;
        if (reveal && !(reveal.shown.has(a) && reveal.shown.has(b) && (reveal.open.has(a) || reveal.open.has(b)))) { shown++; return; }
        const p = pointOf(a), q = pointOf(b);
        if (!p || !q) return;
        const bend = roadBend(index, shown++);
        const dx = q.x - p.x, dy = q.y - p.y;
        out.push({index, future: !!future, p, q, cx: (p.x + q.x) / 2 - dy * bend, cy: (p.y + q.y) / 2 + dx * bend});
    });
    return out;
}
// Roads are painted as dirt tracks under the scenery: a dark worn edge, the packed dirt, and a pale
// broken rut down the middle, roughened by a little noise so they read as hand-painted.
const ROAD_DEFS = '<defs><filter id="road-rough" filterUnits="userSpaceOnUse" x="-600" y="-500" width="2600" height="1800">'
    + '<feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="4" result="n"/>'
    + '<feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter></defs>';
function trailLayers(paths: string): string {
    return `<g class="road-edge">${paths}</g><g class="road-dirt">${paths}</g><g class="road-rut">${paths}</g>`;
}
function roadPaths(): string {
    return roadCurves().map(({index, future, p, q, cx, cy}) =>
        `<path${future ? ' class="future"' : ''} data-road="${index}" d="M${p.x} ${p.y} Q${Math.round(cx)} ${Math.round(cy)} ${q.x} ${q.y}"/>`).join('');
}

// ---- Dragging the map ----
// The canvas pans inside the map area. It can't be dragged so far that the outermost site gets
// closer than PAN_MARGIN to the opposite edge. Until the player drags it, it stays centered.
const PAN_MARGIN = 140;
const pan = {x: 0, y: 0};
let userPanned = false;
function siteBounds() {
    const points = [sites.guild, ...(hasBench(state) || layoutEdit ? [sites.bench] : []), sites.merchant, ...(salvageVisible(state) ? [sites.salvage] : []), ...questOrder.filter(questShown).map(k => quests[k].mapPosition).filter(Boolean), ...(showFuture ? futureSites : [])];
    return {
        minX: Math.min(...points.map(p => p.x)), maxX: Math.max(...points.map(p => p.x)),
        minY: Math.min(...points.map(p => p.y)), maxY: Math.max(...points.map(p => p.y)),
    };
}
function clampPan() {
    const w = world.clientWidth, hgt = world.clientHeight;
    if (!w || !hgt) return;
    const b = siteBounds();
    if (!userPanned) {
        // Center the sites, with room for names below; if they don't fit, show the guild side first.
        const pad = 70, top = b.minY - 50, bottom = b.maxY + 70, left = b.minX - pad, right = b.maxX + pad;
        pan.x = right - left <= w ? (w - (left + right)) / 2 : -left;
        pan.y = bottom - top <= hgt ? (hgt - (top + bottom)) / 2 : -top;
    }
    pan.x = Math.min(w - PAN_MARGIN - b.minX, Math.max(PAN_MARGIN - b.maxX, pan.x));
    pan.y = Math.min(hgt - PAN_MARGIN - b.minY, Math.max(PAN_MARGIN - b.maxY, pan.y));
    // Never past the painted ground's edges, where it's big enough to fill the view.
    if (GROUND.w >= w) pan.x = Math.min(-GROUND.x, Math.max(w - GROUND.x - GROUND.w, pan.x));
    if (GROUND.h >= hgt) pan.y = Math.min(-GROUND.y, Math.max(hgt - GROUND.y - GROUND.h, pan.y));
    canvas.style.transform = `translate(${Math.round(pan.x)}px, ${Math.round(pan.y)}px)`;
    // The ground's dot texture moves with the map, so dragging feels like moving the land itself.
    world.style.backgroundPosition = `${Math.round(pan.x)}px ${Math.round(pan.y)}px, ${Math.round(pan.x)}px ${Math.round(pan.y)}px`;
}
let drag: {id: number, x: number, y: number, panX: number, panY: number, moved: boolean} | null = null;
let suppressClick = false;
world.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    // Only the map itself drags, not panels or cards floating over it.
    if (target !== world && !canvas.contains(target)) return;
    drag = {id: event.pointerId, x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y, moved: false};
});
world.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    if (!drag.moved) {
        drag.moved = true;
        world.setPointerCapture(event.pointerId);
        world.classList.add('dragging');
    }
    userPanned = true;
    pan.x = drag.panX + dx;
    pan.y = drag.panY + dy;
    clampPan();
});
function endDrag(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.id) return;
    if (drag.moved) {
        // The release after a drag isn't a click on whatever is under the pointer.
        suppressClick = true;
        window.setTimeout(() => { suppressClick = false; }, 0);
        world.classList.remove('dragging');
    }
    drag = null;
}
world.addEventListener('pointerup', endDrag);
world.addEventListener('pointercancel', endDrag);
world.addEventListener('click', event => {
    if (suppressClick) { event.stopPropagation(); event.preventDefault(); suppressClick = false; }
}, true);
new ResizeObserver(() => clampPan()).observe(world);

// ---- Dev: map layout editor ----
// Drag places to move them (snapped to 5px). Click one place, then another, to add or remove the
// road between them. Click a road to step its curve. The layout is kept as a draft in this browser
// while editing, and copied as JSON to paste back into the source.
const LAYOUT_KEY = 'guildwright-layout-draft';
const BENDS = [-0.3, -0.2, -0.12, -0.06, 0, 0.06, 0.12, 0.2, 0.3];
let layoutEdit = false;
let futureBeforeEdit = false;
let layoutBar: HTMLElement | null = null;
let layoutPick: string | null = null;
let siteDrag: {id: number, key: string, el: HTMLElement, x: number, y: number, ox: number, oy: number, moved: boolean} | null = null;
type Layout = {sites: Record<string, {x: number, y: number}>, quests: Record<string, {x: number, y: number}>, future: Record<string, {x: number, y: number}>, roads: [string, string, number, boolean?][]};
function currentLayout(): Layout {
    const curves = new Map(roadCurves().map((c, i) => [c.index, i]));
    return {
        sites: Object.fromEntries(Object.entries(sites).map(([k, p]) => [k, {x: p.x, y: p.y}])),
        quests: Object.fromEntries(questOrder.filter(k => quests[k].mapPosition).map(k => [k, {...quests[k].mapPosition}])),
        future: Object.fromEntries(futureSites.map(f => [f.key, {x: f.x, y: f.y}])),
        // Every road gets an explicit bend, so the curves no longer depend on the roads' order.
        roads: roads.map(([a, b, future], i) => {
            const bend = Math.round(roadBend(i, curves.get(i) ?? i) * 100) / 100;
            return future ? [a, b, bend, true] : [a, b, bend];
        }),
    };
}
function applyLayout(l: Layout) {
    for (const [k, p] of Object.entries(l.sites ?? {})) if (k in sites) Object.assign((sites as Record<string, {x: number, y: number}>)[k], p);
    for (const [k, p] of Object.entries(l.quests ?? {})) if (quests[k]?.mapPosition) Object.assign(quests[k].mapPosition, p);
    for (const [k, p] of Object.entries(l.future ?? {})) { const f = futureSites.find(f => f.key === k); if (f) Object.assign(f, p); }
    if (Array.isArray(l.roads)) roads.splice(0, roads.length, ...l.roads.map(([a, b, bend, future]) => [a, b, future, bend] as [string, string, boolean?, number?]));
}
const layoutOriginal = currentLayout();
function layoutChanged() {
    try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(currentLayout())); } catch { /* drafts are a convenience */ }
    buildMap();
    renderLayoutBar();
}
function openLayoutEditor() {
    if (layoutEdit) return;
    // Pin every bend first, so adding or removing a road doesn't flip the others' curves.
    applyLayout(currentLayout());
    try {
        const draft = localStorage.getItem(LAYOUT_KEY);
        if (draft) { applyLayout(JSON.parse(draft)); showToast('Restored your layout draft'); }
    } catch { /* ignore a broken draft */ }
    layoutEdit = true;
    futureBeforeEdit = showFuture;
    showFuture = true;
    ui.panel = null; ui.benchOpen = false; ui.shopOpen = false; ui.picker = null; ui.view = 'map';
    world.classList.add('layout-edit');
    layoutBar = h('div', {class: 'layoutbar'});
    document.body.appendChild(layoutBar);
    buildMap();
    renderLayoutBar();
}
function closeLayoutEditor() {
    layoutEdit = false;
    layoutPick = null;
    showFuture = futureBeforeEdit;
    world.classList.remove('layout-edit');
    layoutBar?.remove();
    layoutBar = null;
    buildMap();
    renderAll();
}
function renderLayoutBar() {
    if (!layoutBar) return;
    canvas.querySelectorAll<HTMLElement>('.site[data-key]').forEach(el => el.classList.toggle('road-pick', el.dataset.key === layoutPick));
    const text = JSON.stringify(currentLayout());
    const box = h('textarea', {class: 'savebox', rows: '2', readonly: 'true', 'aria-label': 'Layout JSON'}, text) as HTMLTextAreaElement;
    layoutBar.replaceChildren(
        h('div', {class: 'grow'},
            h('strong', null, 'Map layout'),
            h('div', {class: 'small muted'}, layoutPick
                ? `Click another place to add or remove its road to ${layoutPick}, or click ${layoutPick} again to cancel.`
                : 'Drag places to move them. Click one place, then another, to add or remove a road. Click a road to change its curve.'),
            box,
        ),
        h('div', {class: 'col'},
            h('button', {class: 'btn primary', onclick: async () => {
                try { await navigator.clipboard.writeText(text); showToast('Layout copied: paste it in the chat'); }
                catch { box.select(); showToast('Copy the layout from the box'); }
            }}, 'Copy layout'),
            h('button', {class: 'btn', onclick: () => {
                applyLayout(layoutOriginal);
                try { localStorage.removeItem(LAYOUT_KEY); } catch { /* fine */ }
                layoutPick = null;
                buildMap(); renderLayoutBar();
            }}, 'Reset'),
            h('button', {class: 'btn', onclick: closeLayoutEditor}, 'Done'),
        ),
    );
}
canvas.addEventListener('pointerdown', event => {
    if (!layoutEdit || event.button !== 0) return;
    const el = (event.target as Element).closest<HTMLElement>('.site[data-key]');
    if (!el) return;
    // A place drags itself instead of the map.
    event.stopPropagation();
    event.preventDefault();
    const key = el.dataset.key!;
    const p = pointOf(key);
    if (!p) return;
    siteDrag = {id: event.pointerId, key, el, x: event.clientX, y: event.clientY, ox: p.x, oy: p.y, moved: false};
    el.setPointerCapture(event.pointerId);
}, true);
canvas.addEventListener('pointermove', event => {
    if (!siteDrag || event.pointerId !== siteDrag.id) return;
    const dx = event.clientX - siteDrag.x, dy = event.clientY - siteDrag.y;
    if (!siteDrag.moved && Math.hypot(dx, dy) < 4) return;
    siteDrag.moved = true;
    const p = pointOf(siteDrag.key)!;
    p.x = Math.round((siteDrag.ox + dx) / 5) * 5;
    p.y = Math.round((siteDrag.oy + dy) / 5) * 5;
    siteDrag.el.style.left = `${p.x}px`;
    siteDrag.el.style.top = `${p.y}px`;
    // Roads follow live; the scenery is laid out again on release.
    const paths = roadPaths();
    canvas.querySelector('svg.roads')!.innerHTML = paths;
    canvas.querySelector('svg.terrain .trails')!.innerHTML = trailLayers(paths);
});
function endSiteDrag(event: PointerEvent) {
    if (!siteDrag || event.pointerId !== siteDrag.id) return;
    const {key, moved} = siteDrag;
    siteDrag = null;
    if (moved) { layoutChanged(); return; }
    // A click: pick a road's first end, or toggle the road to the picked place.
    if (!layoutPick) layoutPick = key;
    else if (layoutPick === key) layoutPick = null;
    else {
        const i = roads.findIndex(([a, b]) => a === layoutPick && b === key || a === key && b === layoutPick);
        if (i >= 0) roads.splice(i, 1);
        else roads.push([layoutPick, key, futureSites.some(f => f.key === key || f.key === layoutPick) || undefined, 0.12]);
        layoutPick = null;
    }
    layoutChanged();
}
canvas.addEventListener('pointerup', endSiteDrag);
canvas.addEventListener('pointercancel', endSiteDrag);
canvas.addEventListener('click', event => {
    if (!layoutEdit) return;
    // Nothing on the map opens while editing; a road click steps its curve.
    event.stopPropagation();
    event.preventDefault();
    const path = (event.target as Element).closest<SVGPathElement>('path[data-road]');
    if (!path) return;
    const road = roads[Number(path.dataset.road)];
    const at = BENDS.findIndex(b => Math.abs(b - (road[3] ?? 0.12)) < 0.001);
    road[3] = BENDS[(at + 1) % BENDS.length];
    layoutChanged();
}, true);

// Where a hero stands: a column beside a site, one row per hero already there.
function spot(p: {x: number, y: number}, dx: number, row: number) {
    return {x: p.x + dx, y: p.y - 20 + row * 66};
}
// Where each hero's map token stands. A hero stays at their quest until they're no longer assigned
// to it: resting between runs (faded while recovering) and setting out again don't walk them home.
// The battle view still shows the rest at the guild.
const mapPlace = new Map<string, string>();
type MapSpot = {place: string, travel: boolean, faded: boolean};
function mapSpotOf(hero: GameState['adventurers'][number]): MapSpot {
    const a = hero.activity;
    const assigned = hero.assignment?.questKey;
    const last = mapPlace.get(hero.id);
    if (a.kind === 'fighting') return {place: a.questKey, travel: false, faded: false};
    // Setting out again from where the token already stands: no walk from the guild.
    if (a.kind === 'traveling') return last === a.questKey ? {place: a.questKey, travel: false, faded: false} : {place: a.questKey, travel: true, faded: false};
    if (a.kind === 'resting') {
        // Resting on site before a boss or bonus fight.
        if (!a.defeated && pendingExtraFight(hero)) return {place: a.questKey, travel: false, faded: false};
        if (assigned === a.questKey) return {place: a.questKey, travel: false, faded: true};
    }
    // Assigned but held back (an entry fee it can't pay): it waits where it stands.
    if (a.kind === 'idle' && assigned && last === assigned) return {place: assigned, travel: false, faded: true};
    return {place: 'home', travel: false, faded: false};
}

let builtWithSalvage = false;
let builtReveal = '';
let builtWithBench = false;
function updateMap() {
    const reveal = mapRevealKey();
    if (tokenEls.length !== state.adventurers.length || builtWithSalvage !== salvageVisible(state) || builtWithBench !== hasBench(state) || builtReveal !== reveal || builtExpansion !== (state.expansion ?? 0)) {
        builtWithSalvage = salvageVisible(state);
        builtWithBench = hasBench(state);
        builtReveal = reveal;
        buildMap();
    }
    updateHudActions();
    if (benchSiteEl) {
        // Hidden until the guild buys a bench from the merchant.
        benchSiteEl.hidden = !hasBench(state) && !layoutEdit;
        benchSiteEl.classList.toggle('locked', !hasBench(state));
        benchSiteEl.classList.toggle('open', ui.benchOpen);
        benchSiteEl.querySelector('.sub')!.textContent = hasBench(state) ? 'Make gear from materials' : `Sold by the merchant · ${BENCH_PRICE} gold`;
    }
    merchantEl?.classList.toggle('open', !!ui.shopOpen);
    if (salvageEl) {
        // Hidden until the salvage expansion; marked unbuilt until the yard is built.
        salvageEl.style.display = salvageVisible(state) ? '' : 'none';
        salvageEl.classList.toggle('locked', !salvageLevel(state));
        salvageEl.classList.toggle('open', ui.panel?.kind === 'salvage');
        salvageEl.querySelector('.sub')!.textContent = salvageLevel(state) ? 'Recover materials' : 'Ready to build';
    }
    if (peddlerEl) {
        // Shown once unlocked: lit while visiting, dimmed with a countdown while away.
        const p = state.peddler;
        const here = peddlerHere(state);
        peddlerEl.style.display = peddlerUnlocked(state) && p ? '' : 'none';
        peddlerEl.className = 'site peddler' + (here ? ' visiting' : ' locked') + (ui.panel?.kind === 'peddler' ? ' open' : '');
        peddlerEl.querySelector('.sub')!.textContent = !p ? '' : here ? `Leaves in ${clock(p.leavesAt! - state.time)}` : `Back in ${clock(p.nextVisit - state.time)}`;
    }
    for (const key of questOrder) {
        const quest = quests[key];
        const el = questSiteEls[key];
        const unlocked = isQuestUnlocked(state, key);
        const progress = getQuestProgress(state, key);
        const fightingAt = new Set(state.adventurers.map(a => a.activity.kind === 'fighting' && a.activity.questKey === key ? a.activity.encounterIndex : -1));
        // The pulse class is kept, and the contents are rebuilt only when they change, so a guidance
        // pulse on the glyph runs on smoothly.
        el.className = 'site' + (unlocked ? '' : ' locked') + (ui.panel?.kind === 'quest' && ui.panel.key === key ? ' open' : '') + (el.classList.contains('pulse') ? ' pulse' : '');
        const viewer = state.adventurers.find(a => a.id === ui.hero) ?? state.adventurers[0];
        const cleared = unlocked && heroCleared(viewer, key);
        const sig = [unlocked, cleared, viewer?.id, quest.portal && unlocked ? clock(portalSecondsLeft(state)) : '', progress.bestEncounter, [...fightingAt].join(), unlocked ? '' : lockText(quest)].join('|');
        if (el.dataset.sig === sig) continue;
        el.dataset.sig = sig;
        el.replaceChildren(
            withFlag(siteGlyph(unlocked ? key : 'locked', unlocked ? questLooks[key]?.glyph ?? glyphs.quest : glyphs.lock), cleared ? viewer : undefined),
            h('div', {class: 'name'}, quest.name),
            ...(quest.portal && unlocked ? [h('div', {class: 'sub'}, `Portal open · ${clock(portalSecondsLeft(state))}`)] : []),
            unlocked
                ? h('div', {class: 'pips', 'aria-hidden': 'true'}, ...questShape.map((tier, i) => h('span', {class: `pip ${tier}` + (i <= progress.bestEncounter ? ' reached' : '') + (fightingAt.has(i) ? ' current' : '')})))
                : h('div', {class: 'sub'}, lockText(quest)),
        );
    }
    const spots = state.adventurers.map(mapSpotOf);
    // Heroes at the same spot stack in a column; travelers keep their slot at the guild.
    const slotAt = (place: string, index: number) => spots.slice(0, index).filter(o => place === 'home' ? o.place === 'home' || o.travel : o.place === place).length;
    state.adventurers.forEach((hero, index) => {
        const tokenEl = tokenEls[index];
        const where = spots[index];
        mapPlace.set(hero.id, where.travel ? 'travel' : where.place);
        // Stand left of a quest while fighting (or resting there before a boss or bonus fight), and right
        // of the guild hall while resting or idle.
        // Heroes at the same spot stack in a column. Travel walks between the two.
        const home = spot(sites.guild, 95, slotAt('home', index));
        const questSpot = (key: string) => spot(quests[key].mapPosition, -95, slotAt(key, index));
        const a = hero.activity;
        let at = home;
        if (where.place !== 'home' && !where.travel) {
            at = questSpot(where.place);
        } else if (a.kind === 'traveling') {
            const to = questSpot(a.questKey), t = Math.min(1, 1 - a.remaining / a.total);
            at = {x: home.x + (to.x - home.x) * t, y: home.y + (to.y - home.y) * t};
        }
        tokenEl.classList.toggle('selected', hero.id === (ui.hero ?? state.adventurers[0]?.id));
        tokenEl.classList.toggle('recovering', where.faded);
        tokenEl.style.left = `${at.x}px`;
        tokenEl.style.top = `${at.y}px`;
        const stats = getCachedStats(state, hero);
        tokenEl.replaceChildren(
            h('div', {class: 'name'}, hero.name),
            h('div', {class: 'body'}, heroPortrait(hero) ?? classIcon(hero.classKey)),
            h('div', {class: 'bar'}, h('span', {style: `width:${100 * Math.max(0, hero.hp) / stats.maxHealth}%`})),
            h('div', {class: 'state'}, activityText(state, hero)),
        );
        tokenEl.setAttribute('aria-label', `${hero.name}, open character panel`);
    });
    applyGuidePulse();
}

// ---------------- Panel ----------------

let panelEl: HTMLElement | null = null;
let benchEl: HTMLElement | null = null;

// Panels are rebuilt a few times a second. Replacing the scrolling element itself cuts off a scroll
// in progress (the browser ties a mouse wheel gesture to the element it started on), so when the
// same panel is rebuilt, the old element and its scrolling body stay in place and only their
// contents are swapped for the new ones.
function pathTo(root: Element, target: Element): number[] | null {
    const path: number[] = [];
    for (let el: Element | null = target; el && el !== root; el = el.parentElement) {
        if (!el.parentElement) return null;
        path.unshift([...el.parentElement.children].indexOf(el));
    }
    return path;
}
function syncAttributes(el: Element, from: Element) {
    for (const a of [...el.attributes]) if (!from.hasAttribute(a.name)) el.removeAttribute(a.name);
    for (const a of [...from.attributes]) if (el.getAttribute(a.name) !== a.value) el.setAttribute(a.name, a.value);
}
// Inside a rebuilt panel body, keep every node that is unchanged, so the element under the pointer
// stays put and its hover style doesn't blink. A changed element is kept and updated in place only
// when it has no event handlers; otherwise the new one replaces it. Off when the game state object
// was replaced (load or import), since kept handlers would point at the old state.
let morphReuse = false;
let morphStateRef: GameState | null = null;
function reconcile(old: ChildNode, next: ChildNode): ChildNode {
    if (old.isEqualNode(next)) {
        // Identical markup can still carry different handlers (the same button for another slot).
        adoptHandlers(old, next);
        return old;
    }
    if (old instanceof Element && next instanceof Element && old.tagName === next.tagName
        && !(old as Listened).hasListeners && !(next as Listened).hasListeners) {
        syncAttributes(old, next);
        reconcileChildren(old, next);
        return old;
    }
    return next;
}
function reconcileChildren(old: Element, next: Element) {
    const incoming = [...next.childNodes];
    incoming.forEach((node, i) => {
        const current = old.childNodes[i];
        if (!current) { old.appendChild(node); return; }
        const kept = reconcile(current, node);
        if (kept !== current) current.replaceWith(kept);
    });
    while (old.childNodes.length > incoming.length) old.lastChild!.remove();
}
// Moves next's content into old, keeping old's elements along the path to the scroller.
function morphInto(old: Element, next: Element, path: number[]) {
    syncAttributes(old, next);
    if (!path.length) {
        if (morphReuse) reconcileChildren(old, next); else old.replaceChildren(...next.childNodes);
        return;
    }
    const keep = old.children[path[0]], incoming = next.children[path[0]];
    // Replace every other child around the kept one, in order.
    for (const node of [...old.childNodes]) if (node !== keep) node.remove();
    const nodes = [...next.childNodes];
    const at = nodes.indexOf(incoming);
    keep.before(...nodes.slice(0, at));
    keep.after(...nodes.slice(at + 1));
    morphInto(keep, incoming, path.slice(1));
}
// Narrow screens: a panel's fixed head keeps only its title (plus the character panel's level line)
// and Close. The header picture and subtitle move to the top of the scrolling body, so they scroll
// away and the content gets the height.
function compactPanelHead(panel: HTMLElement) {
    if (!isNarrow() || !panel.classList.contains('panel')) return;
    const head = panel.querySelector<HTMLElement>(':scope > .panel-head'), body = panel.querySelector<HTMLElement>(':scope > .panel-body');
    if (!head || !body) return;
    const art = panel.querySelector<HTMLElement>(':scope > .panel-header-art');
    const subs = [...head.querySelectorAll<HTMLElement>(':scope > .grow > :not(h2):not(.panel-title-sub)')];
    if (!art && !subs.length) return;
    const intro = document.createElement('div');
    intro.className = 'panel-intro' + (art ? ' has-art' : '');
    if (art) intro.appendChild(art);
    for (const sub of subs) intro.appendChild(sub);
    body.prepend(intro);
    panel.classList.add('compact-head');
}

function swapPanel(old: HTMLElement | null, next: HTMLElement | null, insert: (el: HTMLElement) => void): HTMLElement | null {
    if (next) compactPanelHead(next);
    // Highlight the new markup before comparing, so a pulsing control matches its old self and is
    // kept, and its animation runs on instead of restarting with every refresh.
    if (next) markGuide(next);
    morphReuse = morphStateRef === state;
    morphStateRef = state;
    const oldBody = old?.querySelector('.panel-body'), nextBody = next?.querySelector('.panel-body');
    if (old?.isConnected && next && oldBody && nextBody && old.tagName === next.tagName && old.getAttribute('aria-label') === next.getAttribute('aria-label')) {
        const oldPath = pathTo(old, oldBody), nextPath = pathTo(next, nextBody);
        if (oldPath && nextPath && oldPath.join() === nextPath.join()) {
            morphInto(old, next, nextPath);
            return old;
        }
    }
    // A different panel starts at the top; the same one rebuilt keeps its place.
    const scroll = old && next && old.getAttribute('aria-label') === next.getAttribute('aria-label') ? old.querySelector('.panel-body')?.scrollTop ?? 0 : 0;
    old?.remove();
    if (next) {
        insert(next);
        const body = next.querySelector('.panel-body');
        if (body) body.scrollTop = scroll;
    }
    return next;
}

let runEl: HTMLElement | null = null;
// The run panel's narrowest width with both columns side by side. Matches .runpanel's min-width.
const RUN_PANEL_MIN = 610;
const combatView = new CombatView();
// A hero on show finishes the last fight's numbers and effects before starting a new run.
setLeaveGate(a => combatView.settled(a.id, hasPendingCombatEvents(a.id)));

function placeCombatView() {
    const slot = runEl?.querySelector('.arena-slot');
    const parent = combatView.el.parentElement;
    if (!slot || !parent) return;
    const s = slot.getBoundingClientRect(), p = parent.getBoundingClientRect();
    combatView.el.style.left = `${s.left - p.left}px`;
    combatView.el.style.top = `${s.top - p.top}px`;
    combatView.el.style.width = `${s.width}px`;
}

// ---------------- Battle view ----------------
// The selected hero's fight in the map's place: the run panel's arena scaled up by a whole number,
// so the pixel art stays crisp, with a short combat log and a thin strip of the run along the bottom.
const ARENA_H = 210;
// A background's size is known once it loads, so it's placed again then.
combatView.expand.onclick = () => { ui.view = 'battle'; renderAll(); };
combatView.recover.onclick = () => {
    const hero = state.adventurers.find(a => a.id === ui.hero) ?? state.adventurers[0];
    if (hero?.activity.kind === 'resting') { recoverInstantly(state, hero); renderAll(); }
};
combatView.onAutoRecover = share => {
    const hero = state.adventurers.find(a => a.id === ui.hero) ?? state.adventurers[0];
    if (hero) { hero.autoRecover = share; renderAll(); }
};
// The recovery card's one line about auto recover; the run strip has the full explanation.
function autoRecoverStatus(hero: Adventurer): string {
    const run = hero.run;
    if (!hero.autoRecover) return 'Auto off: the rest runs its full time';
    if (!run || run.gold <= 0) return 'Nothing to spend: this run earned no gold';
    if (run.gold <= (run.fee ?? quests[run.questKey].entryFee)) return 'Nothing to spend: this run didn\'t cover its fee';
    return `Auto recovers at ${getAutoRecoverBudget(hero)} gold or less`;
}
const battleStage = h('div', {class: 'bv-stage'}, combatView.log);
const battleEl = h('section', {class: 'battleview', 'aria-label': 'Battle view'}, battleStage);
let stripEl: HTMLElement | null = null;
let battleFit = '';

// The battle view shows when chosen and the selected hero has a run to show.
function battleActive(): boolean {
    if (ui.view !== 'battle') return false;
    const hero = state.adventurers.find(a => a.id === ui.hero) ?? state.adventurers[0];
    // Back on the map once a hero has no run, or is idle at home without a run for their quest
    // (recalled, an endless run done, or unable to pay a new quest's entry fee).
    if (!hero?.run || hero.activity.kind === 'idle' && hero.assignment?.questKey !== hero.run.questKey) {
        ui.view = 'map';
        return false;
    }
    return true;
}

function placeBattle() {
    const w = battleStage.clientWidth, hgt = battleStage.clientHeight;
    if (!w || !hgt) return;
    // 3× when there's room, else 2×, else 1×. The arena keeps its own layout at its base size.
    const k = Math.max(1, Math.min(3, Math.floor((hgt - 16) / ARENA_H), Math.floor(w / 300)));
    const baseW = Math.min(600, Math.floor((w - 24) / k));
    const left = Math.round((w - baseW * k) / 2), top = Math.max(0, Math.round((hgt - ARENA_H * k) / 2));
    const fit = `${k}:${baseW}:${left}:${top}`;
    if (fit === battleFit) return;
    battleFit = fit;
    // zoom, not transform: scale. Safari draws a scaled element's text at its unscaled size whenever an
    // animation inside puts it on its own GPU layer, so the bar numbers blurred while monsters moved.
    // Zoom lays the arena out at full size; its own left and top are zoomed too, so they divide by k.
    Object.assign(combatView.el.style, {left: `${left / k}px`, top: `${top / k}px`, width: `${baseW}px`, zoom: String(k)});
    battleEl.style.setProperty('--k', String(k));
}

// Every frame: feed the open run panel's combat view, and drop events for anyone else.
function updateCombatView() {
    const battle = combatView.el.parentElement === battleStage;
    if (combatView.el.isConnected) { if (battle) placeBattle(); else placeCombatView(); }
    // Bottom toasts and guide cards clear the battle view's run strip.
    const strip = battle && stripEl?.isConnected ? Math.max(0, Math.round(map.getBoundingClientRect().bottom - stripEl.getBoundingClientRect().top)) : 0;
    if (map.dataset.strip !== String(strip)) { map.dataset.strip = String(strip); map.style.setProperty('--strip-h', `${strip}px`); }
    const events = drainCombatEvents();
    const hero = ui.runPanel || battle ? state.adventurers.find(a => a.id === ui.hero) ?? state.adventurers[0] : undefined;
    if (!hero || !combatView.el.isConnected) {
        return;
    }
    // Events first, on the cards they happened to: at high speed one frame can hold the end of one
    // fight and the start of the next, and the last kill must not land on the next fight's monsters.
    // At high speed only the latest events can be seen anyway.
    combatView.events(events.filter(e => e.adventurerId === hero.id).slice(-12));
    combatView.update(state, hero);
    // A finished rest waiting on the last fight's effects has nothing left to pay for.
    const resting = hero.activity.kind === 'resting' && hero.activity.remaining > 0;
    const cost = resting ? getRecoverCost(state, hero) : 0;
    combatView.setRecover(resting ? `Recover now · ${cost} gold` : null, state.gold >= cost, hero.autoRecover ?? 0, resting ? autoRecoverStatus(hero) : '');
    combatView.pace(timeScale());
    combatView.update(state, hero);
}
let pickerEl: HTMLElement | null = null;
let gearEl: HTMLElement | null = null;
let flashId: string | null = null;
let detailEl: HTMLElement | null = null;
let recapEl: HTMLElement | null = null;
let starterEl: HTMLElement | null = null;

let compareEl: HTMLElement | null = null;
// Puts the bench comparison just right of the bench, level with the top of the craft preview.
function placeCompare() {
    if (!compareEl || !benchEl) return;
    const preview = benchEl.querySelector<HTMLElement>('.preview');
    const mapRect = map.getBoundingClientRect();
    const benchRect = benchEl.getBoundingClientRect();
    const top = preview ? preview.getBoundingClientRect().top - mapRect.top : 12;
    // With the material picker open it moves right of the picker. It hides when it would cover
    // the right-hand panel.
    const leftEdge = (pickerEl?.isConnected ? pickerEl.getBoundingClientRect().right : benchRect.right) + 8;
    const rightPanel = [panelEl, gearEl].filter(el => el?.isConnected).map(el => el!.getBoundingClientRect().left);
    const limit = Math.min(mapRect.right, ...rightPanel) - 8;
    compareEl.hidden = leftEdge + compareEl.offsetWidth > limit;
    const height = compareEl.offsetHeight;
    // Stay on screen: never above the map's top or past its bottom.
    const clamped = Math.max(8, Math.min(top, mapRect.height - height - 8));
    compareEl.style.left = `${leftEdge - mapRect.left}px`;
    compareEl.style.top = `${clamped}px`;
}

function renderPanelNow() {
    // A focused search box (the material ledger's) can be rebuilt with its panel: put the focus and
    // caret back on the new one, so typing carries on.
    const active = document.activeElement as HTMLInputElement | null;
    const typing = active?.matches?.('.panel input[type="search"]') ? {cls: active.className, start: active.selectionStart, end: active.selectionEnd} : null;
    renderPanelsInner();
    if (typing && !active!.isConnected) {
        const again = document.querySelector<HTMLInputElement>(`.panel input[type="search"].${typing.cls.split(' ')[0]}`);
        again?.focus({preventScroll: true});
        if (again && typing.start !== null) again.setSelectionRange(typing.start, typing.end);
    }
}
function renderPanelsInner() {
    ui.compareBeside = !isNarrow();
    benchEl = swapPanel(benchEl, renderBenchPanel(ctx), el => map.insertBefore(el, world));
    pickerEl = swapPanel(pickerEl, renderPickerPanel(ctx), el => map.insertBefore(el, world));
    recapEl = swapPanel(recapEl, renderRecapPanel(ctx), el => map.insertBefore(el, world));
    starterEl = swapPanel(starterEl, renderStarterPick(ctx), el => map.appendChild(el));
    panelEl = swapPanel(panelEl, renderPanel(ctx), el => gearEl?.isConnected ? gearEl.after(el) : world.after(el));
    // The gear picker opens just left of the character panel.
    gearEl = swapPanel(gearEl, renderGearPanel(ctx), el => world.after(el));
    // After the picker and right panel, which it sits beside.
    const nextCompare = renderBenchCompare(ctx);
    if (compareEl?.isConnected && nextCompare) {
        // The comparison scrolls too, so it keeps its element like the panels do.
        morphInto(compareEl, nextCompare, []);
    } else {
        compareEl?.remove();
        compareEl = nextCompare;
        if (compareEl) map.appendChild(compareEl);
    }
    if (compareEl) {
        placeCompare();
        const body = benchEl?.querySelector('.panel-body');
        if (body && !(body as HTMLElement).dataset.compareScroll) {
            (body as HTMLElement).dataset.compareScroll = '1';
            body.addEventListener('scroll', placeCompare, {passive: true});
        }
    }
    if (ui.scrollTo && (panelEl || gearEl)) {
        // The target can sit in the open panel or in the picker beside it.
        const target = gearEl?.querySelector<HTMLElement>('#' + ui.scrollTo) ?? panelEl?.querySelector<HTMLElement>('#' + ui.scrollTo);
        ui.scrollTo = null;
        if (target) {
            target.scrollIntoView({block: 'start'});
            target.classList.add('flash');
            flashId = target.id;
            window.setTimeout(() => { flashId = null; }, 1600);
        }
    } else if (flashId && (panelEl || gearEl)) {
        // Keep the highlight across the panel's regular refreshes until it fades.
        (gearEl?.querySelector('#' + flashId) ?? panelEl?.querySelector('#' + flashId))?.classList.add('flash', 'flash-hold');
    }
    // The run panel centers in the open map area between the side panels. When that area is
    // too narrow, it spans the whole map and sits behind the side panels instead.
    // Roomy means the panel fits at its minimum width (RUN_PANEL_MIN in the CSS) with its margins,
    // so its two columns never wrap just because side panels are open.
    if (battleActive()) {
        if (!battleEl.isConnected) world.appendChild(battleEl);
        world.classList.add('battle');
        const quest = quests[state.adventurers.find(a => a.id === ui.hero)?.run?.questKey ?? ''];
        const baseKey = quest?.endless?.baseKey ?? quest?.key ?? '';
        battleEl.style.setProperty('--site', questLooks[baseKey]?.color ?? '#7a6a58');
        // The arena draws the background itself; the view around it goes black to match.
        battleEl.classList.toggle('has-bg', !!backgroundUrl(baseKey));
        runEl?.remove();
        runEl = null;
        stripEl = swapPanel(stripEl, renderRunStrip(ctx), el => battleEl.appendChild(el));
        if (combatView.el.parentElement !== battleStage) {
            battleStage.appendChild(combatView.el);
            combatView.el.classList.add('big');
            battleFit = '';
        }
        placeBattle();
        detailEl = swapPanel(detailEl, renderMaterialDetail(ctx), el => map.appendChild(el));
        return;
    }
    if (battleEl.isConnected) {
        battleEl.remove();
        stripEl?.remove();
        stripEl = null;
        world.classList.remove('battle');
        combatView.el.remove();
        combatView.el.classList.remove('big');
        combatView.el.style.zoom = '';
    }
    const roomy = world.clientWidth >= RUN_PANEL_MIN + 32;
    const runParent = roomy ? world : map;
    // The combat view is never moved into the rebuilt panel: moving a node replays its animations.
    // It sits in the same parent, just after the run panel, and is placed over the panel's empty slot.
    if (runEl && runEl.parentElement !== runParent) { runEl.remove(); }
    // Narrow screens skip the run panel: it's too tall to fit there, and the battle view shows the run.
    runEl = swapPanel(runEl, narrowScreen.matches ? null : renderRunPanel(ctx), el => combatView.el.parentElement === runParent
        ? runParent.insertBefore(el, combatView.el)
        : runParent.appendChild(el));
    if (runEl?.querySelector('.arena-slot')) {
        if (combatView.el.parentElement !== runParent) runParent.appendChild(combatView.el);
        placeCombatView();
    } else {
        combatView.el.remove();
    }
    detailEl = swapPanel(detailEl, renderMaterialDetail(ctx), el => map.appendChild(el));
}

// ---------------- View across reloads ----------------
// Game speed, open panels, selections and scroll positions are kept in this browser, so a reload (a new build)
// comes back to the same view. Panels are matched by their label for scroll.
const VIEW_KEY = 'guildwright-view';
const VIEW_FIELDS = ['panel', 'stripOpen', 'benchOpen', 'shopOpen', 'picker', 'hero', 'runPanel', 'view', 'selectedSlot', 'selectedEncounter', 'bench', 'materialDetail', 'statFilters', 'compareBeside', 'showEquipped', 'hideTooHigh', 'statExplorer', 'questTab', 'lastQuest', 'hideItemIcons', 'craftedCollapsed'] as const;
function saveView() {
    try {
        const scroll: Record<string, number> = {};
        document.querySelectorAll<HTMLElement>('.panel-body').forEach(body => {
            const label = body.closest('[aria-label]')?.getAttribute('aria-label');
            if (label && body.scrollTop > 0) scroll[label] = body.scrollTop;
        });
        const view: Record<string, unknown> = {scroll, speed, theme};
        for (const f of VIEW_FIELDS) view[f] = ui[f];
        localStorage.setItem(VIEW_KEY, JSON.stringify(view));
    } catch { /* storage unavailable: the view just isn't kept */ }
}
function restoreView() {
    let view: Record<string, unknown> | null = null;
    try { view = JSON.parse(localStorage.getItem(VIEW_KEY) ?? 'null'); } catch { view = null; }
    const before = {...ui};
    if (view && [1, 4, 16].includes(view.speed as number)) speed = view.speed as number;
    if (view && ['auto', 'light', 'dark'].includes(view.theme as string)) { theme = view.theme as Theme; applyTheme(); }
    if (view) for (const f of VIEW_FIELDS) if (f in view) (ui as unknown as Record<string, unknown>)[f] = view[f];
    // A saved bench draft can outlive its save (a reset in another tab, a cleared save): keep only
    // materials this game still has.
    const owned = (key: string | null) => !!key && (state.materials[key] ?? 0) > 0;
    if (ui.bench) ui.bench = {...ui.bench, base: (ui.bench.base ?? []).filter(owned), decorations: (ui.bench.decorations ?? []).map(k => owned(k) ? k : null)};
    try {
        renderAll();
    } catch (e) {
        // A view that no longer fits the save (a hero gone, a quest renamed) starts closed.
        console.warn('Discarding saved view', e);
        Object.assign(ui, before);
        renderAll();
        return;
    }
    const scroll = (view?.scroll ?? {}) as Record<string, number>;
    document.querySelectorAll<HTMLElement>('.panel-body').forEach(body => {
        const label = body.closest('[aria-label]')?.getAttribute('aria-label');
        if (label && scroll[label]) body.scrollTop = scroll[label];
    });
}

function renderAll() {
    document.body.classList.toggle('no-item-icons', !!ui.hideItemIcons);
    renderHud();
    updateMap();
    renderPanelNow();
    renderGuide();
}

// ---------------- Opening guidance ----------------
// The map site (or hero card) the current guidance card points to pulses.
// Whether the panel a guidance step points to is open.
function guideTargetOpen(t: GuideTarget | null): boolean {
    if (!t) return false;
    switch (t.kind) {
        case 'merchant': return !!ui.shopOpen;
        case 'bench': return ui.benchOpen;
        case 'guild': return ui.panel?.kind === 'guild';
        case 'quest': return ui.panel?.kind === 'quest' && ui.panel.key === t.key;
        case 'hero': return ui.panel?.kind === 'adventurer';
    }
}
// The data-guide value panels put on the controls each step is finished with.
function guideFocusKey(t: GuideTarget | null): string | null {
    if (!t) return null;
    if (t.kind === 'quest') return t.focus ?? 'send';
    if (t.kind === 'merchant') return state.guide?.bought ? 'bench' : 'buy';
    if (t.kind === 'hero') return 'equip';
    if (t.kind === 'bench') return 'craft';
    return t.focus ?? null;
}
// A trophy is waiting for its first slot: the guild site and the trophy slots pulse alongside any other step.
function trophyWaiting(): boolean {
    return Object.keys(state.trophies ?? {}).some(k => trophies[k]?.kind !== 'endless') && (state.guild.trophySlots ?? 0) > 0 && !anyTrophyEquipped();
}
let focusedSite: string | null = null;
// Brings a pulsing map site into view: centered across, a quarter of the way down.
function focusSite(id: string, at: {x: number, y: number} | undefined) {
    if (!at || focusedSite === id) return;
    focusedSite = id;
    const w = world.clientWidth, hgt = world.clientHeight;
    if (!w || !hgt) { focusedSite = null; return; }
    pan.x = w / 2 - at.x;
    pan.y = hgt * 0.25 - at.y;
    userPanned = true;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        canvas.style.transition = 'transform 450ms ease';
        world.style.transition = 'background-position 450ms ease';
        window.setTimeout(() => { canvas.style.transition = ''; world.style.transition = ''; }, 500);
    }
    clampPan();
}
function guideKeys(): Set<string> {
    // The bench marks a skipped decoration slot only while that hint applies.
    return new Set([guideFocusKey(guideTarget), trophyWaiting() ? 'trophy' : null, 'deco'].filter((k): k is string => !!k));
}
function markGuide(root: Element) {
    const keys = guideKeys();
    root.querySelectorAll<HTMLElement>('[data-guide]').forEach(el => el.classList.toggle('guide-hl', keys.has(el.dataset.guide!)));
}
function applyGuidePulse() {
    const t = guideTarget;
    const open = guideTargetOpen(t);
    const trophy = trophyWaiting();
    const guildOpen = ui.panel?.kind === 'guild';
    benchSiteEl?.classList.toggle('pulse', t?.kind === 'bench' && !open);
    merchantEl?.classList.toggle('pulse', t?.kind === 'merchant' && !open);
    guildSiteEl?.classList.toggle('pulse', (t?.kind === 'guild' || trophy) && !guildOpen);
    // The HUD's place buttons pulse with their map sites, so the step can be found from the battle view.
    for (const {key, el} of hudActionEls) {
        el.classList.toggle('pulse', key === 'bench' ? t?.kind === 'bench' && !open
            : key === 'merchant' ? t?.kind === 'merchant' && !open
            : key === 'guild' ? (t?.kind === 'guild' || trophy) && !guildOpen
            // A quest step in the battle view: the way back to the map pulses.
            : key === 'view' ? ui.view === 'battle' && t?.kind === 'quest' && t.focus !== 'modifier' && !open
            : key === 'quest' ? t?.kind === 'quest' && t.focus === 'modifier' && !open
            : false);
    }
    // Controls inside open panels that finish the step.
    markGuide(document.body);
    document.querySelectorAll<HTMLElement>('.guide-hl:not([data-guide])').forEach(el => el.classList.remove('guide-hl'));
    // The pulsing map site scrolls into view once each time the step changes.
    const site = t && !open ? (t.kind === 'quest' ? t.focus === 'modifier' ? null : ['quest:' + t.key, quests[t.key].mapPosition] as const
        : t.kind === 'merchant' ? ['merchant', sites.merchant] as const
        : t.kind === 'bench' ? ['bench', sites.bench] as const
        : t.kind === 'guild' ? ['guild', sites.guild] as const : null)
        : trophy && !guildOpen ? ['guild', sites.guild] as const : null;
    if (site) focusSite(site[0], site[1]); else if (!t) focusedSite = null;
    for (const key of questOrder) questSiteEls[key]?.classList.toggle('pulse', t?.kind === 'quest' && t.focus !== 'modifier' && t.key === key && !open);
    const heroId = ui.hero ?? state.adventurers[0]?.id;
    heroCards.forEach(card => card.el.classList.toggle('pulse', t?.kind === 'hero' && card.hero.id === heroId && !open));
    // The guidance card hides while its panel is open, and comes back if the panel closes with the step undone.
    if (guideEl) { guideEl.hidden = open; placeGuide(); }
}
// Cards that stay until their step is done: buy from the merchant after the first run, equip what
// was bought, save for the crafting bench, then craft something.

let guideEl: HTMLElement | null = null;
let guideSig = '';
type GuideTarget = {kind: 'quest', key: string, focus?: string} | {kind: 'merchant'} | {kind: 'bench'} | {kind: 'hero'} | {kind: 'guild', focus?: string};
// The cards only say what to do; the map sites and the controls that do it pulse, so players learn
// where things are instead of following a shortcut.
function guideStep(): {text: string, target: GuideTarget} | null {
    const g = state.guide ??= {};
    // The first run is over however it ended: a defeat, a full clear, a stop point, or a recall.
    // A hero with a run record who isn't on the road or fighting has finished it.
    if (!g.firstRunDone && state.adventurers.some(a => a.run && (a.run.defeatedAt !== undefined || a.run.cleared >= Math.min(a.run.stopAt, quests[a.run.questKey].encounters.length - 1)
        || a.run.number > 1 || (a.activity.kind !== 'fighting' && a.activity.kind !== 'traveling')))) {
        g.firstRunDone = true;
    }
    const started = state.adventurers.some(a => a.run) || questOrder.some(k => getQuestProgress(state, k).runs > 0);
    if (!g.firstRunDone && !started && state.adventurers.length) {
        const first = questOrder.find(k => isQuestUnlocked(state, k));
        if (first) {
            const hero = state.adventurers.find(a => a.id === ui.hero) ?? state.adventurers[0];
            return {text: `Send ${hero.name} on a quest: open ${quests[first].name} and start a run to bring back gold and materials.`, target: {kind: 'quest', key: first}};
        }
    }
    if (g.firstRunDone && !g.bought && !hasBench(state)) {
        return {text: 'Visit the merchant to buy equipment and become stronger.', target: {kind: 'merchant'}};
    }
    if (g.bought && !g.equipped) {
        const hero = state.adventurers.find(a => a.id === ui.hero) ?? state.adventurers[0];
        return {text: `Equip your new gear to become stronger: open ${hero?.name ?? 'your hero'}'s card at the top and pick an equipment slot.`, target: {kind: 'hero'}};
    }
    if (g.equipped && !hasBench(state)) {
        return {text: `Save ${BENCH_PRICE} gold for a crafting bench at the merchant, and make your own gear (${Math.min(state.gold, BENCH_PRICE)}/${BENCH_PRICE}).`, target: {kind: 'merchant'}};
    }
    if (state.benchOwned === true && !g.crafted) {
        return {text: 'Craft an item at the crafting bench: pick an item type, then add materials.', target: {kind: 'bench'}};
    }
    // Once a modifier is unlocked, point at the toggles until one is flipped.
    // A guild that has already run with modifiers (an older save) skips it.
    if (!g.modifierToggled && (state.adventurers.some(a => Object.values(a.questModifiers ?? {}).some(m => m.length)) || questOrder.some(k => (getQuestProgress(state, k).bestModifiedClear ?? 0) > 0))) g.modifierToggled = true;
    if (!g.modifierToggled && g.crafted) {
        const hasMods = (k: string) => isQuestUnlocked(state, k) && quests[k].modifiers.some(def => !def.exclusive && isModifierUnlocked(state, quests[k], def.key));
        // Prefer the quest the HUD quest button opens, the step's target.
        const hudKey = hudQuestKey();
        const withMods = hudKey && hasMods(hudKey) ? hudKey : questOrder.find(hasMods);
        // Opening a quest panel while the step shows finishes it: the modifiers are right there.
        if (withMods && ui.panel?.kind === 'quest') g.modifierToggled = true;
        else if (withMods) {
            return {text: `Quest modifiers are open: in ${quests[withMods].name}, turn one on to make runs harder for better rewards.`, target: {kind: 'quest', key: withMods, focus: 'modifier'}};
        }
    }
    return null;
}
let guideTarget: GuideTarget | null = null;
function renderGuide() {
    const step = guideStep();
    guideTarget = step?.target ?? null;
    applyGuidePulse();
    const sig = step ? step.text : '';
    if (sig === guideSig && (!guideEl || guideEl.isConnected)) return;
    guideSig = sig;
    guideEl?.remove();
    guideEl = step ? h('div', {class: 'guidecard', role: 'status'},
        h('span', {class: 'grow'}, step.text),
    ) : null;
    if (guideEl) {
        guideEl.hidden = guideTargetOpen(guideTarget);
        guideEl.appendChild(h('span', {class: 'guidearrow', 'aria-hidden': 'true'}));
        document.body.appendChild(guideEl);
    }
    placeGuide();
}
// The element the guidance card points at: the HUD button for a place, the hero's HUD card, or for a
// quest the map site (the battle view's way back to the map while in battle).
function guideAnchor(): HTMLElement | null {
    const t = guideTarget;
    if (!t) return null;
    const hud = (key: string) => hudActionEls.find(a => a.key === key)?.el ?? null;
    switch (t.kind) {
        case 'merchant': return hud('merchant');
        case 'bench': return hud('bench');
        case 'guild': return hud('guild');
        case 'hero': {
            const heroId = ui.hero ?? state.adventurers[0]?.id;
            return heroCards.find(c => c.hero.id === heroId)?.el ?? null;
        }
        case 'quest': return t.focus === 'modifier' ? hud('quest') : ui.view === 'battle' ? hud('view') : questSiteEls[t.key] ?? null;
    }
}
// Places the card just under its anchor (above it when there's no room below), kept on screen,
// with the arrow pointing at the anchor. Runs every frame while the card shows, since the map pans.
let guideFrame = 0;
function placeGuide() {
    cancelAnimationFrame(guideFrame);
    const el = guideEl;
    const showing = !!el && el.isConnected && !el.hidden;
    document.body.classList.toggle('guiding', showing);
    if (!showing) return;
    const anchor = guideAnchor();
    const r = anchor?.isConnected ? anchor.getBoundingClientRect() : null;
    const vw = document.documentElement.clientWidth, vh = window.innerHeight;
    if (!r || !r.width) {
        el.classList.add('floating');
        el.style.left = el.style.top = '';
    } else {
        el.classList.remove('floating');
        const w = el.offsetWidth, hgt = el.offsetHeight, gap = 12;
        const cx = r.left + r.width / 2;
        const left = Math.max(8, Math.min(vw - w - 8, cx - w / 2));
        const below = r.bottom + gap + hgt <= vh - 8 || r.top - gap - hgt < 8;
        el.classList.toggle('above', !below);
        el.style.left = `${Math.round(left)}px`;
        el.style.top = `${Math.round(below ? r.bottom + gap : r.top - gap - hgt)}px`;
        el.style.setProperty('--arrow-x', `${Math.round(Math.max(14, Math.min(w - 14, cx - left)))}px`);
    }
    guideFrame = requestAnimationFrame(placeGuide);
}

// ---------------- Drop toasts ----------------
// A first-ever material gets a prominent card that opens its detail card. A material you hold
// fewer than 3 of gets a small note, unless it dropped in the last 15 s or a card is showing.
// A mythic you already own gets a card of the same size that shows how many you now hold.

interface DropToast {
    id: number
    kind: 'new' | 'mythic' | 'premium' | 'scarce' | 'trophy'
    // For trophy cards: the trophy, its new tier and the fame it paid. Material is unused.
    trophy?: {key: string, tier: number, fame: number}
    material: string
    tier: Tier | 'L'
    questKey: string
    owned: number
    expires: number
}
const tierWords: Record<Tier | 'L', string> = {C: 'common', U: 'uncommon', R: 'rare', M: 'mythic', L: 'legendary'};
let dropToasts: DropToast[] = [];
let dropToastId = 0;
const lastDropAt: Record<string, number> = {};
let dropsEl: HTMLElement | null = null;
let dropsSig = '';

const QUIET_AFTER = 10;
function processDrops() {
    const now = performance.now();
    for (const drop of drainDropEvents()) {
        const e = {...drop, tier: drop.legendary ? 'L' as const : drop.tier};
        const recent = now - (lastDropAt[e.material] ?? -Infinity) < 15000;
        lastDropAt[e.material] = now;
        // Materials the guild has found 10 or more times drop quietly.
        if ((state.obtained[e.material] ?? 0) >= QUIET_AFTER) continue;
        if (e.premium && e.owned > 10) {
            // With 10 already in stock, a premium drop gets a small note instead of a card.
            dropToasts.push({id: dropToastId++, kind: 'scarce', material: e.material, tier: e.tier, questKey: e.questKey, owned: e.owned, expires: now + 4000});
        } else if (e.premium) {
            dropToasts.push({id: dropToastId++, kind: 'premium', material: e.material, tier: e.tier, questKey: e.questKey, owned: e.owned, expires: now + 9000});
        } else if (e.first) {
            if (!dropToasts.some(t => t.kind === 'new' && t.material === e.material)) {
                dropToasts.push({id: dropToastId++, kind: 'new', material: e.material, tier: e.tier, questKey: e.questKey, owned: e.owned, expires: now + 9000});
            }
        } else if (e.tier === 'M' || e.tier === 'L') {
            dropToasts.push({id: dropToastId++, kind: 'mythic', material: e.material, tier: e.tier, questKey: e.questKey, owned: e.owned, expires: now + 6000});
        } else if (e.owned < 3 && !recent) {
            dropToasts = dropToasts.filter(t => !(t.kind === 'scarce' && t.material === e.material));
            dropToasts.push({id: dropToastId++, kind: 'scarce', material: e.material, tier: e.tier, questKey: e.questKey, owned: e.owned, expires: now + 4000});
        }
    }
    dropToasts = dropToasts.filter(t => t.expires > now && !(t.expires === Infinity && t.kind === 'trophy' && anyTrophyEquipped()));
    // At most two cards at once; the rest wait their turn.
    const cards = dropToasts.filter(t => t.kind !== 'scarce');
    for (const waiting of cards.slice(2)) waiting.expires = Math.max(waiting.expires, now + (waiting.kind === 'new' ? 9000 : 6000));
    renderDrops();
}

function anyTrophyEquipped(): boolean {
    return (state.trophySlots ?? []).some(Boolean);
}

function equipFromCard(t: DropToast) {
    if (t.expires !== Infinity) dropToasts = dropToasts.filter(x => x.id !== t.id);
    // Opens the guild hall at the trophy slots; the player picks the slot themselves.
    ui.trophyPick = null;
    openGuildSection(ctx, 'guild-trophies');
}

function renderDrops() {
    const cards = dropToasts.filter(t => t.kind !== 'scarce').slice(0, 2);
    // Small notes only show when no card is up.
    const notes = cards.length ? [] : dropToasts.filter(t => t.kind === 'scarce').slice(-2);
    // Rebuild only when the set changes, so the entry animation plays once.
    const sig = [...cards, ...notes].map(t => t.id).join(',');
    if (sig === dropsSig && (!dropsEl || dropsEl.isConnected)) {
        return;
    }
    dropsSig = sig;
    const open = (t: DropToast) => {
        dropToasts = dropToasts.filter(x => x.id !== t.id);
        ui.materialDetail = t.material;
        renderAll();
    };
    // Every card and note has an × to dismiss it early.
    const dismiss = (t: DropToast) => {
        dropToasts = dropToasts.filter(x => x.id !== t.id);
        renderDrops();
    };
    const closable = (t: DropToast, el: HTMLElement) => h('div', {class: 'dropwrap' + (el.classList.contains('dropnote') ? ' note' : '')}, el,
        h('button', {class: 'dropclose', 'aria-label': 'Dismiss', title: 'Dismiss', onclick: (ev: MouseEvent) => { ev.stopPropagation(); dismiss(t); }}, '×'));
    const next = h('div', {class: 'drops', 'aria-live': 'polite'},
        ...cards.map(t => closable(t, (() => {
            if (t.trophy) {
                const def = trophies[t.trophy.key];
                const equipped = (state.trophySlots ?? []).includes(t.trophy.key);
                // The first trophy's card stays until one is equipped and points at the guild hall instead
                // of opening it, so the player learns where trophies go.
                if (def.kind === 'endless') {
                    return h('button', {class: `dropcard trophycard tier${t.trophy.tier}`, onclick: () => equipFromCard(t)},
                        h('div', {class: 'dropkicker'}, `Banner earned · +${t.trophy.fame} fame`),
                        h('div', {class: 'dropname'}, `${def.name} · ${trophyTierName(def, t.trophy.tier)}`),
                        h('div', {class: 'small muted tbonus'}, def.bonusText(def.tiers[t.trophy.tier].bonus)),
                        h('div', {class: 'small muted'}, 'Always in effect'),
                        h('div', {class: 'row', style: 'margin-top:4px'}, h('span', {class: 'btn small primary'}, 'See banners')));
                }
                if (t.expires === Infinity) {
                    return h('div', {class: `dropcard trophycard tier${t.trophy.tier}`},
                        h('div', {class: 'dropkicker'}, `Trophy earned · +${t.trophy.fame} fame`),
                        h('div', {class: 'dropname'}, `${def.name} · ${trophyTierName(def, t.trophy.tier)}`),
                        h('div', {class: 'small muted tbonus'}, def.bonusText(def.tiers[t.trophy.tier].bonus)),
                        h('div', {class: 'small', style: 'margin-top:4px'}, 'Open the guild hall on the map and put it in a trophy slot.'),
                    );
                }
                return h('button', {class: `dropcard trophycard tier${t.trophy.tier}`, onclick: () => equipFromCard(t)},
                    h('div', {class: 'dropkicker'}, `Trophy earned · +${t.trophy.fame} fame`),
                    h('div', {class: 'dropname'}, `${def.name} · ${trophyTierName(def, t.trophy.tier)}`),
                    h('div', {class: 'small muted tbonus'}, def.bonusText(def.tiers[t.trophy.tier].bonus)),
                    h('div', {class: 'row', style: 'margin-top:4px'}, h('span', {class: 'btn small primary'}, equipped ? 'See trophies' : 'Equip')),
                );
            }
            const material = requireMaterial(t.material);
            if (t.kind === 'premium') {
                return h('button', {class: 'dropcard premium', onclick: () => open(t)},
                    h('div', {class: 'dropkicker'}, 'Premium drop · double stats'),
                    h('div', {class: 'dropname'}, materialIcon(material.key), material.name, ' ', h('span', {class: 'power'}, `P${material.power}`)),
                    h('div', {class: 'small muted'}, `From ${quests[t.questKey].name} · ${t.owned} owned. Click to see what it can make.`),
                );
            }
            if (t.kind === 'mythic') {
                return h('button', {class: `dropcard ${t.tier}`, onclick: () => open(t)},
                    h('div', {class: 'dropkicker'}, t.tier === 'L' ? 'Legendary drop' : 'Mythic drop'),
                    h('div', {class: 'dropname'}, materialIcon(material.key), material.name, ' ', h('span', {class: 'power'}, `P${material.power}`)),
                    h('div', {class: 'small muted'}, `From ${quests[t.questKey].name} · ${t.owned} owned`),
                );
            }
            return h('button', {class: `dropcard ${t.tier}`, onclick: () => open(t)},
                h('div', {class: 'dropkicker'}, `New ${tierWords[t.tier]} material`),
                h('div', {class: 'dropname'}, materialIcon(material.key), material.name, ' ', h('span', {class: 'power'}, `P${material.power}`)),
                h('div', {class: 'small muted'}, `From ${quests[t.questKey].name}. Click to see what it can make.`),
            );
        })())),
        ...notes.map(t => closable(t, h('button', {class: `dropnote ${isPremium(t.material) ? 'premium' : t.tier}`, onclick: () => open(t)},
            `+1 ${t.tier === 'C' || isPremium(t.material) ? '' : tierWords[t.tier] + ' '}${requireMaterial(t.material).name} · ${t.owned} owned`))),
    );
    dropsEl?.remove();
    dropsEl = cards.length || notes.length ? next : null;
    if (dropsEl) world.appendChild(dropsEl);
}

let toastEl: HTMLElement | null = null;
// A toast at the bottom of the map. It takes its own taps (nothing behind it gets them), and with
// onActivate, tapping the message itself runs it and dismisses the toast.
function showToast(message: string | Node, ms = 2200, onActivate?: () => void) {
    toastEl?.remove();
    const close = () => { window.clearTimeout(toastTimer); toastEl?.remove(); toastEl = null; };
    const stop = (e: Event) => e.stopPropagation();
    toastEl = h('div', {class: 'toast' + (onActivate ? ' action' : ''), role: onActivate ? 'button' : 'status',
        onpointerdown: stop, onmousedown: stop, ontouchstart: stop, onwheel: stop,
        onclick: (e: Event) => { e.stopPropagation(); if (onActivate) { close(); onActivate(); } }},
        typeof message === 'string' ? h('span', null, message) : message,
        h('button', {class: 'toastclose', 'aria-label': 'Dismiss', title: 'Dismiss', onclick: (e: Event) => { e.stopPropagation(); close(); }}, '×'));
    map.appendChild(toastEl);
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toastEl?.remove(); toastEl = null; }, ms);
}

// ---------------- Loop ----------------

let last = performance.now();
let accumulator = 0;
let sinceSlowRender = 0;
let sinceSave = 0;

function frame(now: number) {
    // Clamp long gaps (a hidden tab) so the game never fast-forwards. There is no offline progress.
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    accumulator += dt * speed * timeScale(now);
    setCombatSpeed(speed);
    // The merchant's open stock doesn't restock on a level-up (its next New stock is free instead).
    setHoldLevelRestock(ui.shopOpen ? (state.adventurers.find(a => a.id === ui.hero) ?? state.adventurers[0])?.id ?? null : null);
    let ticks = 0;
    while (accumulator >= TICK_SECONDS && ticks < 2000) {
        tick(state, Math.random, speed);
        accumulator -= TICK_SECONDS;
        ticks++;
    }
    const peddler = updatePeddler(state);
    if (peddler === 'unlocked') showToast('A travelling peddler has started visiting. Watch the road out of the guild.', 6000);
    for (const e of drainPortalEvents()) {
        const who = state.adventurers.find(a => a.id === e.adventurerId)?.name ?? 'Someone';
        if (e.kind === 'opened') showToast(`${who} completed the Oracle's Rite. The portal to the Shattered Throne is open for 30 minutes.`, 8000);
        if (e.kind === 'extended') showToast(`${who} completed the Oracle's Rite again. The portal stays open 30 minutes longer.`, 8000);
        if (e.kind === 'noKeys') showToast(`${who} beat the Veiled Oracle, but the keys were already spent. The portal stays shut.`, 8000);
        if (e.kind === 'closed') showToast('The portal to the Shattered Throne has closed. Everyone there was recalled.', 8000);
    }
    if (peddler === 'arrived') showToast(`The travelling peddler stopped by with ${state.peddler!.stock.length} materials for sale, for ${clock(state.peddler!.leavesAt! - state.time)}. Tap to see it.`, 6000, () => openPanel({kind: 'peddler'}));
    updateHudNumbers();
    updateCombatView();
    sinceSlowRender += dt;
    // Skip refreshes while a pointer is down so a click never lands on a replaced element. Panels
    // also hold still while a comparison's detail is open, so it doesn't flicker.
    if (sinceSlowRender >= 0.4 && !pointerDown) {
        sinceSlowRender = 0;
        announceUnlocks();
        processDrops();
        updateMap();
        renderGuide();
        // Panels show live numbers, so refresh them a few times a second.
        if (!detailOpen()) { renderPanelNow(); applyGuidePulse(); }
        saveView();
    }
    sinceSave += dt;
    if (sinceSave >= 5) {
        sinceSave = 0;
        saveGame(state);
    }
    requestAnimationFrame(frame);
}

// Milestones and quest modifiers unlock as the game runs; announce each one once.
let knownModifiers = unlockedModifierKeys();
function unlockedModifierKeys(): Set<string> {
    const keys = new Set<string>();
    for (const questKey of questOrder) {
        for (const m of quests[questKey].modifiers) {
            if (isModifierUnlocked(state, quests[questKey], m.key)) keys.add(questKey + ':' + m.key);
        }
    }
    return keys;
}
function announceUnlocks() {
    const messages: string[] = [];
    if (contractsOpen(state)) {
        ensureGuildContracts(state);
        for (const a of state.adventurers) ensurePersonalContract(state, a);
    }
    for (const c of drainContractEvents()) {
        const who = state.adventurers.find(a => a.id === c.adventurerId)?.name ?? 'Someone';
        messages.push(`${who} completed a ${c.kind} contract: ${c.text}`);
    }
    const progress = checkProgress(state);
    for (const t of progress.trophies) {
        // Only the highest new tier of each trophy gets a card.
        dropToasts = dropToasts.filter(x => x.trophy?.key !== t.key);
        // Until a trophy is equipped for the first time, the card stays until one is.
        const sticky = !anyTrophyEquipped() && trophies[t.key]?.kind !== 'endless';
        dropToasts.push({id: dropToastId++, kind: 'trophy', trophy: {key: t.key, tier: t.tier, fame: t.fame}, material: '', tier: 'C', questKey: '', owned: 0, expires: sticky ? Infinity : performance.now() + 10000});
    }
    if (progress.trophies.length) renderDrops();
    messages.push(...progress.notices);
    const now = unlockedModifierKeys();
    const fresh = [...now].filter(k => !knownModifiers.has(k));
    knownModifiers = now;
    if (fresh.length) {
        const [questKey] = fresh[0].split(':');
        messages.push(`${fresh.length} new modifier${fresh.length > 1 ? 's' : ''} unlocked for ${quests[questKey].name}`);
    }
    if (messages.length) {
        showToast(messages.join(' · '));
    }
}

// A hovered or focused gear comparison shows its detail; refreshing would replace it mid-read.
let hoveredDelta: Element | null = null;
document.addEventListener('mouseover', event => { hoveredDelta = (event.target as Element).closest?.('.delta') ?? null; }, true);
document.addEventListener('mouseleave', () => { hoveredDelta = null; });
function detailOpen(): boolean {
    if (hoveredDelta && !hoveredDelta.isConnected) hoveredDelta = null;
    const focused = document.activeElement;
    // An open native select closes when its element is rebuilt, so hold refreshes while one has focus.
    return !!hoveredDelta || !!(focused?.closest('.delta') && focused.matches(':focus-visible')) || !!focused?.matches('select.filteradd');
}

// The comparison detail floats in one fixed element on the body, outside every panel and scroll box, so it
// never grows a list's scroll height (no flicker at the bottom of a list) and is never clipped by a details
// panel. It sits below its line, flips above when it would run off the bottom, and is clamped to the screen.
const deltaTip = document.createElement('div');
deltaTip.className = 'delta-detail delta-tip';
deltaTip.setAttribute('role', 'tooltip');
deltaTip.hidden = true;
document.body.append(deltaTip);
let tipFor: Element | null = null;
let tipFrame = 0;
function tipTarget(): Element | null {
    const hovered = hoveredDelta?.isConnected && !hoveredDelta.matches('.static') ? hoveredDelta : null;
    if (hovered) return hovered;
    const focused = document.activeElement;
    const line = focused?.closest('.delta:not(.static)');
    return line && focused!.matches(':focus-visible') ? line : null;
}
function placeTip(line: Element): boolean {
    const r = line.getBoundingClientRect();
    const vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 8;
    if (r.bottom < 0 || r.top > vh || (r.width === 0 && r.height === 0)) return false;
    const w = deltaTip.offsetWidth, ht = deltaTip.offsetHeight;
    let top = r.bottom + 4;
    if (top + ht > vh - m && r.top - 4 - ht >= m) top = r.top - 4 - ht;
    top = Math.max(m, Math.min(top, vh - m - ht));
    const left = Math.max(m, Math.min(r.left, vw - m - w));
    deltaTip.style.top = `${Math.round(top)}px`;
    deltaTip.style.left = `${Math.round(left)}px`;
    return true;
}
function updateTip(): void {
    const line = tipTarget();
    const detail = line?.querySelector(':scope > .delta-detail');
    if (!line || !detail) {
        tipFor = null;
        deltaTip.hidden = true;
        return;
    }
    if (line !== tipFor) {
        tipFor = line;
        deltaTip.replaceChildren(...Array.from(detail.childNodes, n => n.cloneNode(true)));
        deltaTip.style.top = deltaTip.style.left = '0px';
        deltaTip.hidden = false;
    }
    deltaTip.hidden = !placeTip(line);
    // Follow the line while it shows (scrolling, layout shifts), and close when it leaves the page.
    if (!tipFrame) tipFrame = requestAnimationFrame(() => { tipFrame = 0; if (tipFor) updateTip(); });
}
document.addEventListener('mouseover', updateTip);
document.addEventListener('mouseleave', () => { hoveredDelta = null; updateTip(); });
document.addEventListener('focusin', () => requestAnimationFrame(updateTip));
document.addEventListener('focusout', () => requestAnimationFrame(updateTip));

let pointerDown = false;
document.addEventListener('pointerdown', () => { pointerDown = true; }, true);
document.addEventListener('pointerup', () => { window.setTimeout(() => { pointerDown = false; }, 30); }, true);
document.addEventListener('pointercancel', () => { pointerDown = false; }, true);

// Keyboard shortcuts for the HUD. Each place key works like its HUD button (a second press closes
// it). Left and right arrows step through the heroes. Ignored while typing or with a modifier held.
const SHORTCUTS: Record<string, string> = {b: 'battle', m: 'map', s: 'merchant', q: 'quest', g: 'guild', c: 'character', w: 'bench', p: 'peddler', y: 'salvage'};
// The HUD quest button's quest: the selected hero's active quest, else the quest panel opened most
// recently, else the hero's last run, else the first open quest.
function hudQuestKey(): string | undefined {
    const hero = state.adventurers.find(a => a.id === ui.hero) ?? state.adventurers[0];
    const base = (k: string | undefined) => k ? quests[k]?.endless?.baseKey ?? k : undefined;
    const active = hero?.assignment && hero.run ? base(hero.assignment.questKey) : undefined;
    if (!state.adventurers.length) return undefined;
    return active ?? (ui.lastQuest && quests[ui.lastQuest] && isQuestUnlocked(state, ui.lastQuest) ? ui.lastQuest : undefined)
        ?? base(hero?.assignment?.questKey ?? hero?.run?.questKey) ?? questOrder.find(k => isQuestUnlocked(state, k));
}
function toggleHudQuest(): boolean {
    const key = hudQuestKey();
    if (!key) return false;
    if (ui.panel?.kind === 'quest' && ui.panel.key === key) { ui.panel = null; renderAll(); }
    else openPanel({kind: 'quest', key});
    return true;
}
function hudShortcut(action: string): boolean {
    const hero = state.adventurers.find(a => a.id === ui.hero) ?? state.adventurers[0];
    const button = (key: string) => hudActionEls.find(a => a.key === key)?.el;
    switch (action) {
        case 'battle': {
            if (!hero?.run || !hero.assignment) return false;
            if (isNarrow()) closePanels();
            ui.view = 'battle';
            renderAll();
            return true;
        }
        case 'map':
            if (isNarrow()) closePanels();
            ui.view = 'map';
            renderAll();
            return true;
        case 'quest':
            return toggleHudQuest();
        case 'character':
            if (!hero) return false;
            if (ui.panel?.kind === 'adventurer' && !(isNarrow() && (ui.benchOpen || ui.shopOpen))) { ui.panel = null; renderAll(); }
            else openPanel({kind: 'adventurer', id: hero.id});
            return true;
        default: {
            const el = button(action);
            if (!el || el.hidden || el.disabled) return false;
            el.click();
            return true;
        }
    }
}
document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
    if (previewOpen() || layoutEdit) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const list = state.adventurers;
        if (list.length < 2) return;
        const at = Math.max(0, list.findIndex(a => a.id === ui.hero));
        const next = list[(at + (event.key === 'ArrowRight' ? 1 : list.length - 1)) % list.length];
        selectHero(ui, next.id);
        // In the battle view, a hero who isn't fighting has no battle to show.
        if (ui.view === 'battle' && !(next.run && next.assignment)) ui.view = 'map';
        renderAll();
        event.preventDefault();
        return;
    }
    // Space steps through the game speeds (1x, 4x, 16x). It doesn't press a focused button.
    if (event.key === ' ') {
        event.preventDefault();
        if (event.repeat) return;
        const speeds = [1, 4, 16];
        speed = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
        renderHud(); saveView();
        return;
    }
    const action = SHORTCUTS[event.key.toLowerCase()];
    if (action && !event.repeat && hudShortcut(action)) event.preventDefault();
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && previewOpen()) {
        closePreview();
        return;
    }
    if (event.key === 'Escape') {
        if (ui.materialDetail) {
            ui.materialDetail = null;
        } else if (ui.picker) {
            if (ui.picker.kind === 'decoration' && !ui.bench.decorations[ui.picker.index]) ui.decoSkipped = true;
            ui.picker = null;
        } else if (ui.panel || ui.benchOpen || ui.shopOpen || ui.view !== 'battle') {
            ui.panel = null;
            ui.benchOpen = false;
            ui.shopOpen = false;
        } else {
            // Nothing open over the battle view: back to the map.
            ui.view = 'map';
        }
        devOpen = false;
        renderAll();
    }
});
window.addEventListener('beforeunload', () => { saveGame(state); saveView(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { saveGame(state); saveView(); } });

buildMap();
restoreView();
if (state.notices?.length) {
    // After the toasts that loading itself can raise, so this one isn't replaced right away.
    const text = state.notices.join('. ') + '.';
    state.notices = [];
    window.setTimeout(() => showToast(text, 8000), 2500);
}
requestAnimationFrame(frame);
