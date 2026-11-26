import {statExplorerPanel, type StatExplorerState} from './statExplorer';
import {AILMENT_CHANCE} from '../engine/ailments';
import {heroPortrait} from './portraits';
import {backgroundUrl} from './backgrounds';
import {classIcon, itemArt, itemTypeArt, itemTypeIcon, materialIcon, monsterIcon} from './icons';
import {fightLayout, monsterArtUrl} from './monsterArt';
import {itemTypeOrder, itemTypes, slotNames, slotOrder} from '../data/items';
import {isPremium, materialOrder, requireMaterial, roleLabel} from '../data/materials';
import {ACCURACY_GROWTH, classPassive, damageStats, questXpLevel, classes, encounterLevel, encounterPower, ENDLESS_GROWTH, ENDLESS_PATTERN, ENDLESS_STEP, xpMultiplier, endlessKey, powerForLevel, EVASION_GROWTH, monsterBaseline, monsters, questOrder, quests, unlockMet, unlockQuestNames} from '../data/quests';
import {kitHit, monsterKit} from '../engine/abilities';
import {itemStatRound, craftItem, DECORATION_TIER_LEAD, maxDecorationPower, getBaseLimit, getDecorationLimit, isAccessory, getBaseStats, getCraftedItemStats, getDecorationStats, getSellValue, previewCraft, decorationScale, statScale} from '../engine/crafting';
import {baseStatEntries, CAP_RULE, elements, resistStat, familyLabel, formatStat, formatStats, formatStatValue, roundStat, statDefs, statFamily, statOrder} from '../data/stats';
import {assignQuest, challengeKeys, trialLevel, trialMax, encounterLineup, fightStats, pendingExtraFight, getAutoRecoverBudget, getEntryFee, getMonsterStats, getRecoverCost, typicalAttack, getRewardBonuses, recall, recoverInstantly, restSpeed, runOutcome, setStopAt, MONSTER_RESIST_CAP, REFLECT_SOURCE} from '../engine/runner';
import {canEquipInSlot, canHire, chooseStarter, equip, equipTrophy, itemLevelRequirement, levelForPower, retireAdventurer, getActiveModifiers, getQuestProgress, hireApplicant, isQuestCleared, isItemEquipped, isModifierUnlocked, isQuestUnlocked, modifierUnlockText, buySlot, expandGuild, nextExpansion, nextSlot, sellItem, setActiveModifiers, unequip} from '../engine/state';
import {formatMod} from '../engine/mods';
import {expansions, slotUnlocks, trackNames, unlockFame, type SlotTrack} from '../data/milestones';
import {earnedText, equippedBonuses, MAX_TROPHY_SLOTS, tierFor, trophies, trophyList, trophyTierName, type TrophyDef} from '../data/trophies';
import {challengeModifier, TRIAL_MONSTER, TRIAL_PREMIUM, TRIAL_STEP, VOID_KEY, VOID_MONSTER, VOID_PREMIUM} from '../data/modifiers';
import {trophyBanner, trophyCase, trophyLabel} from './trophyArt';
import {BLOCK_CAP, effectiveLevel, wornSignatures, expectedCritMultiplier, expectedHits, getCachedStats, hitChance, hitRating, mitigateHit, resolveItemRef, RESIST_CAP, totalXpForLevel} from '../engine/stats';
import type {Adventurer, BaseStats, CraftedItem, MaterialDef, DamageMap, DamageType, GameState, ItemRef, ItemStats, ItemTypeKey, ModValue, MonsterModStat, QuestDef, QuestModifierDef, RewardBonuses, RunStats, SlotKey, StatKey, Tier} from '../engine/types';
import {fmt, h, num, type Listened} from './dom';
import {signatures} from '../data/signatures';
import {bestDelta, deltaColumn, deltaLine, deltaLines} from './compareView';
import {autoEquip} from '../engine/autoEquip';
import {comparisonSlots} from '../engine/compare';
import {BENCH_PRICE, buyBench, buyShopItem, hasBench, refreshShop, restockSold, shopRefreshCost, shopStock, type ShopItem} from '../engine/shop';
import {APPLICANT_SLOTS, FOURTH_APPLICANT_EXPANSION, THIRD_APPLICANT_EXPANSION, applicantSlotFame, applicantSlots, ambitionHint, ambitionProgress, ambitionText, ambitionTierNames, applicantTierOdds, ensureApplicants, guildTier, TIER_FAME, tierStartFame, refreshApplicants, refreshCost, RETIRE_MULTIPLIER, retireFame} from '../engine/ambitions';
import {contractHolder, contractRewardText, contractText, dropContract, ensureGuildContracts, ensurePersonalContract, findContract, grantedModifiers, guildRefreshCost, personalRefreshCost, refreshGuildContract, refreshPersonalContract, takeContract} from '../engine/contracts';
import type {Ambition, Applicant, Contract, HeroPassive} from '../engine/types';
import {bloodPactBonus, ENHANCED_EFFECT, bonusText as rareBonusText, cursePremium, curseText, passiveScale, passives as passiveDefs, type BonusKey, type PassiveKey} from '../data/passives';
import {buyOffer, HOLD_BASE, holdCost, holdOffer, offerPrice, PEDDLER_UNLOCK, peddlerHere, RARE_FOUND, releaseOffer, VISIT_GAP, VISIT_SECONDS} from '../engine/peddler';
import {corrosionFactor, REFLECT_SHARE, ruleInfo} from '../engine/rules';
import {PORTAL_SECONDS, portalSecondsLeft} from '../engine/portal';
import {itemMaterials, nextSalvageLevel, SALVAGE_EXPANSION, SALVAGE_MAX, SALVAGE_TIER_COST, salvageBlocked, salvageCost, salvageItem, salvageLevel, upgradeSalvage} from '../engine/salvage';

// The crafting bench opens on the left, so it can sit beside any of these right-side panels.
export type PanelKey = {kind: 'adventurer', id: string} | {kind: 'quest', key: string} | {kind: 'guild'} | {kind: 'hire'} | {kind: 'salvage'} | {kind: 'shop'} | {kind: 'peddler'} | {kind: 'statExplorer'};

export interface UiState {
    panel: PanelKey | null
    benchOpen: boolean
    // The merchant shares the left side with the bench, so the character panel can stay open.
    shopOpen?: boolean
    // Bench slot whose material picker is open beside the bench.
    picker: {kind: 'base' | 'decoration', index: number} | null
    // The decoration picker was closed with its slot still empty: the slot pulses until a decorated craft.
    decoSkipped?: boolean
    // The quest panel opened most recently (base quest key), for the HUD quest button.
    lastQuest?: string
    // Narrow screens: the bench's item type chooser is expanded.
    typeOpen?: boolean
    // The selected hero, shared by every view that shows or acts on one member.
    hero?: string | null
    // Set while the bottom run panel is open. It shows the selected hero's run.
    runPanel: string | null
    // The map, or the full battle view of the selected hero's run in the map's place.
    view?: 'map' | 'battle'
    selectedSlot: SlotKey | null
    selectedEncounter: Record<string, number>
    // Decorations keep their slot positions: an empty slot is null.
    bench: {itemType: ItemTypeKey, base: string[], decorations: (string | null)[]}
    // Material whose detail card is open.
    materialDetail: string | null
    // Member waiting on the retire confirmation.
    confirmRetire?: string | null
    // Trophy slot whose picker is open.
    trophyPick?: number | null
    // Material ledger search in the guild panel (substring of the name, any case). Cleared when the guild panel closes.
    ledgerFilter?: string
    // Bench stat filters: stat families. Materials, item types and crafted items with any of them stay in view.
    statFilters?: string[]
    // Element id in the open panel to scroll to and highlight once.
    scrollTo?: string | null
    // Wide screens show the bench's comparison beside the bench instead of inside it.
    compareBeside?: boolean
    // The battle view's bottom strip shows the run's details.
    stripOpen?: boolean
    // Crafted items list on the bench also lists items someone is wearing.
    showEquipped?: boolean
    // The merchant offer whose details popover is open (its stock index).
    shopDetail?: number | null
    // Bench: hide crafted items and base materials above the selected hero's level.
    hideTooHigh?: boolean
    // Dev option: no item icons in the crafted items and equip lists, with larger text instead.
    hideItemIcons?: boolean
    craftedCollapsed?: boolean
    // Dev menu stat explorer filters.
    statExplorer?: StatExplorerState
    // Quest panel mode per quest: the normal quest or its endless variant.
    questTab?: Record<string, 'normal' | 'endless'>
    // Crafted item being salvaged on the bench, and the indexes of the materials picked to recover.
    salvaging?: {itemId: string, picks: number[]} | null
    // A run recap opened in its own panel: a copy, so it stays put while new runs start.
    recap?: {title: string, subtitle: string, stats: RunStats, previous?: RunStats} | null
}

export interface Ctx {
    state: GameState
    ui: UiState
    // Re-renders the open panel and map after an action.
    refresh(): void
    toast(message: string | Node, ms?: number): void
}

const tierNames: Record<Tier, string> = {C: 'Common', U: 'Uncommon', R: 'Rare', M: 'Mythic'};

// A material name that opens its detail card.
export function materialLink(ctx: Ctx, key: string): HTMLElement {
    return h('button', {
        class: 'matlink' + (isPremium(key) ? ' premium' : ''),
        title: 'Show every use of this material',
        onclick: (event: MouseEvent) => { event.stopPropagation(); ctx.ui.materialDetail = key; ctx.refresh(); },
    }, materialIcon(key), requireMaterial(key).name);
}

// Recraft: puts a crafted item's recipe on the bench with whatever of it is in stock (the item's own
// materials are in the item, so it takes fresh ones). Green when everything is there, orange when
// some is missing, red and disabled when none of its base materials are.
export function recipeFill(state: GameState, item: CraftedItem): {base: string[], decorations: string[], missing: string[]} {
    const left: Record<string, number> = {...state.materials};
    const missing: string[] = [];
    const take = (keys: string[], limit: number) => keys.filter((k, i) => {
        if (i < limit && (left[k] ?? 0) > 0) { left[k]--; return true; }
        missing.push(k);
        return false;
    });
    const base = take(item.base, getBaseLimit(state, item.itemType));
    const decorations = take(item.decorations, getDecorationLimit(state, item.itemType));
    return {base, decorations, missing};
}
export function recipeButton(ctx: Ctx, item: CraftedItem): HTMLElement | null {
    const {state, ui} = ctx;
    if (!hasBench(state)) return null;
    const fill = recipeFill(state, item);
    const names = (keys: string[]) => keys.map(k => requireMaterial(k).name).join(', ');
    const status = !fill.base.length ? 'none' : fill.missing.length ? 'partial' : 'full';
    // The missing materials as links to their detail cards, so the toast shows where to find them.
    const missingToast = (lead: string, keys: string[]) => {
        const counts = new Map<string, number>();
        for (const k of keys) counts.set(k, (counts.get(k) ?? 0) + 1);
        const parts: (Node | string)[] = [lead];
        [...counts].forEach(([k, n], i) => {
            if (i) parts.push(', ');
            parts.push(materialLink(ctx, k));
            if (n > 1) parts.push(` ×${n}`);
        });
        ctx.toast(h('span', null, ...parts), 7000);
    };
    return h('button', {
        class: 'btn small recipe ' + status,
        // With none of its base materials it stays red, and a tap lists them instead of opening the bench.
        'aria-disabled': status === 'none' ? 'true' : undefined,
        title: status === 'none' ? `None of its base materials in stock (${names(item.base)})`
            : status === 'partial' ? `Put the recipe on the bench. Missing: ${names(fill.missing)}`
            : 'Put the recipe on the bench: every material is in stock',
        onclick: (ev: MouseEvent) => {
            ev.stopPropagation();
            if (status === 'none') { missingToast('None in stock: ', item.base); return; }
            ui.bench = {itemType: item.itemType, base: fill.base, decorations: fill.decorations};
            ui.shopOpen = false;
            ui.benchOpen = true;
            ui.picker = null;
            ui.selectedSlot = null;
            ui.materialDetail = null;
            // On narrow screens the bench takes the whole view, so the panel it came from closes.
            if (matchMedia('(max-width: 760px)').matches) ui.panel = null;
            if (fill.missing.length) missingToast('Missing ', fill.missing);
            ctx.refresh();
        },
    }, 'Recraft');
}

// The selected hero: the one every panel, picker and the run view show. Falls back to the first member.
export function currentHero(ctx: Ctx): Adventurer | undefined {
    const {state, ui} = ctx;
    const hero = state.adventurers.find(a => a.id === ui.hero) ?? state.adventurers[0];
    ui.hero = hero?.id ?? null;
    return hero;
}
export function selectHero(ui: UiState, id: string) {
    ui.hero = id;
    if (ui.runPanel) ui.runPanel = id;
}
// Shows a member's run in the bottom panel, selecting them.
// With `sent` (the player just sent them on a quest), wide screens stay on the map after the
// player's first send; only the first send (and every send on narrow screens) opens the battle view.
function showRun(ui: UiState, id: string, sent?: GameState) {
    ui.hero = id;
    ui.runPanel = id;
    const narrow = matchMedia('(max-width: 760px)').matches;
    if (sent) {
        const guide = sent.guide ?? (sent.guide = {});
        const firstSend = !guide.firstSend && !guide.firstRunDone;
        guide.firstSend = true;
        if (narrow || firstSend) ui.view = 'battle';
    } else ui.view = 'battle';
    // On narrow screens a panel covers the battle, so close the one they were sent from.
    if (matchMedia('(max-width: 760px)').matches) {
        ui.panel = null;
        ui.picker = null;
    }
}

export function renderPanel(ctx: Ctx): HTMLElement | null {
    const panel = ctx.ui.panel;
    if (panel?.kind !== 'guild') ctx.ui.ledgerFilter = '';
    if (!panel) {
        return null;
    }
    if (panel.kind === 'adventurer') {
        const adventurer = currentHero(ctx);
        return adventurer ? adventurerPanel(ctx, adventurer) : null;
    }
    if (panel.kind === 'quest') {
        return questPanel(ctx, panel.key);
    }
    if (panel.kind === 'hire') {
        return hirePanel(ctx);
    }
    if (panel.kind === 'salvage') {
        return salvagePanel(ctx);
    }
    if (panel.kind === 'shop') {
        // The merchant moved to the left side; an old saved view still names it here.
        ctx.ui.panel = null;
        ctx.ui.shopOpen = true;
        return null;
    }
    if (panel.kind === 'peddler') {
        return peddlerPanel(ctx);
    }
    if (panel.kind === 'statExplorer') {
        const el = statExplorerPanel(ctx, (title, subtitle, ...body) => shell(ctx, title, subtitle, ...body));
        el.classList.add('wide');
        return el;
    }
    return guildPanel(ctx);
}

export function renderBenchPanel(ctx: Ctx): HTMLElement | null {
    if (!hasBench(ctx.state)) ctx.ui.benchOpen = false;
    // Bench and merchant share the left side: the bench, when open, wins.
    if (ctx.ui.benchOpen) ctx.ui.shopOpen = false;
    return ctx.ui.benchOpen ? benchPanel(ctx) : ctx.ui.shopOpen ? shopPanel(ctx) : null;
}

// Header pictures for the places on the map, by panel title.
const headerFiles = import.meta.glob('../assets/ui/header-*.webp', {eager: true, query: '?inline', import: 'default'}) as Record<string, string>;
const headerByTitle: Record<string, string> = {'Merchant': 'merchant', 'Guild hall': 'guild', 'Crafting bench': 'bench', 'Travelling peddler': 'peddler', 'Salvage yard': 'salvage', 'Hire an adventurer': 'hire', 'Applicants': 'hire'};
// Quest panels use the quest's battle background (an endless quest its base quest's), as pixel art.
const questBackgroundByName: Record<string, string> = Object.fromEntries(Object.values(quests).flatMap(q => {
    const url = backgroundUrl(q.endless?.baseKey ?? q.key);
    return url ? [[q.name, url]] : [];
}));
function panelHeader(title: string): {url: string, pixel: boolean} | undefined {
    const key = headerByTitle[title];
    const url = key ? Object.entries(headerFiles).find(([path]) => path.endsWith(`/header-${key}.webp`))?.[1] : undefined;
    if (url) return {url, pixel: false};
    const bg = questBackgroundByName[title];
    return bg ? {url: bg, pixel: true} : undefined;
}

function shell(ctx: Ctx, title: string, subtitle: string | Node | null, ...body: (Node | null | false)[]): HTMLElement {
    return panelShell(ctx, 'right', title, subtitle, ...body);
}

function panelShell(ctx: Ctx, side: 'left' | 'right', title: string, subtitle: string | Node | null, ...body: (Node | null | false)[]): HTMLElement {
    const close = () => {
        if (side === 'left') { ctx.ui.benchOpen = false; ctx.ui.shopOpen = false; } else ctx.ui.panel = null;
        ctx.refresh();
    };
    const header = panelHeader(title);
    return h('section', {class: 'panel ' + side + (header ? ' has-header' : ''), 'aria-label': title},
        header ? h('img', {class: 'panel-header-art' + (header.pixel ? ' pixel' : ''), src: header.url, alt: '', draggable: 'false'}) : null,
        h('div', {class: 'panel-head'},
            h('div', {class: 'grow'},
                h('h2', null, title),
                typeof subtitle === 'string' ? h('div', {class: 'muted small'}, subtitle) : subtitle,
            ),
            h('button', {class: 'btn', 'aria-label': 'Close panel', onclick: close}, 'Close'),
        ),
        h('div', {class: 'panel-body'}, ...body.filter(Boolean) as Node[]),
    );
}

// A worn legendary or mythic's signature effect (data/signatures.ts), as a line under its stats.
export function signatureLine(ref: ItemRef | undefined): HTMLElement | null {
    if (ref?.kind !== 'material') return null;
    const key = requireMaterial(ref.key).equip?.signature;
    if (!key) return null;
    const sig = signatures[key];
    return h('div', {class: 'signature', title: `${sig.name}: ${sig.text}`}, h('b', null, sig.name + '. '), sig.text);
}

// Just the signature's name, for tight rows; the full text is its tooltip.
function signatureTag(ref: ItemRef | undefined): HTMLElement | null {
    if (ref?.kind !== 'material') return null;
    const key = requireMaterial(ref.key).equip?.signature;
    return key ? h('span', {class: 'signature sigtag', title: `${signatures[key].name}: ${signatures[key].text}`}, ' · ' + signatures[key].name) : null;
}

export function itemStatsText(stats: ItemStats): string {
    const parts: string[] = [];
    const text = formatStats(stats.stats);
    if (text) parts.push(text);
    if (stats.attacksPerSecond) parts.push(`${num(stats.attacksPerSecond)} attacks/s`);
    return parts.join(' · ') || 'No stats';
}

const damageLabels: Record<DamageType, string> = {physical: 'phys', fire: 'fire', cold: 'cold', lightning: 'lightning'};

// "5.2 fire" or "3 phys + 3 cold".
function damageSplitText(total: number, shares: Partial<Record<DamageType, number>>): string {
    return (Object.entries(shares) as [DamageType, number][])
        .filter(([, share]) => share > 0)
        .map(([type, share]) => `${fmt(total * share, 1)} ${damageLabels[type]}`)
        .join(' + ');
}

// Base stats as "+3 phys dmg (cap 8)", after the item type's multiplier.
export function baseStatsText(base: BaseStats, itemType: ItemTypeKey): string {
    return baseStatEntries(base, stat => statScale(itemType, stat), (stat, v) => itemStatRound(stat, v, itemType)).map(e => e.text).join(', ');
}

export function activityText(state: GameState, adventurer: Adventurer): string {
    const a = adventurer.activity;
    if (a.kind === 'fighting') {
        const quest = quests[a.questKey];
        const front = a.monsters[0];
        const where = quest.endless ? `Endless encounter ${a.encounterIndex + 1}` : `Encounter ${a.encounterIndex + 1}/${quest.encounters.length}`;
        return `${where} · ${front ? monsters[front.key].name : 'cleared'}`;
    }
    if (a.kind === 'traveling') {
        return `Traveling to ${quests[a.questKey].name} · ${Math.ceil(a.remaining)}s`;
    }
    if (a.kind === 'resting') {
        const stats = getCachedStats(state, adventurer);
        const extra = pendingExtraFight(adventurer);
        const label = a.defeated ? 'Recovering from defeat' : extra === 'boss' ? `Resting before ${monsters[quests[a.questKey].boss!.monster].name}` : extra === 'bonus' ? 'Resting before a bonus encounter' : 'Resting';
        return `${label} · ${Math.ceil(a.remaining / restSpeed(stats.maxHealth, stats.lifeRegen, adventurer.level))}s`;
    }
    return a.reason ?? (state.adventurers.length ? 'Idle at the guild' : '');
}

// ---------------- Adventurer ----------------

function hpXpBars(state: GameState, adventurer: Adventurer): HTMLElement {
    const stats = getCachedStats(state, adventurer);
    const levelStart = totalXpForLevel(adventurer.level);
    const levelEnd = totalXpForLevel(adventurer.level + 1);
    const xpFraction = (adventurer.xp - levelStart) / (levelEnd - levelStart);
    // Max ward as the fight uses it: Corrosion lowers it mid-run.
    const wardMax = fightStats(state, adventurer).maxWard;
    return h('div', null,
        h('div', {class: 'row small'},
            h('span', {style: 'width:24px'}, 'HP'),
            h('div', {class: 'bar wide grow'}, h('span', {style: `width:${100 * Math.max(0, adventurer.hp) / stats.maxHealth}%`})),
            h('span', {class: 'num'}, `${Math.max(0, Math.ceil(adventurer.hp))}/${stats.maxHealth}`),
        ),
        stats.maxWard > 0 ? h('div', {class: 'row small', style: 'margin-top:4px'},
            h('span', {style: 'width:24px', title: 'Ward absorbs damage before HP and refills at the start of each encounter'}, 'Ward'),
            h('div', {class: 'bar wide ward grow'}, h('span', {style: `width:${100 * Math.max(0, Math.min(wardMax, adventurer.ward ?? wardMax)) / Math.max(1e-9, wardMax)}%`})),
            h('span', {class: 'num'}, `${Math.ceil(Math.max(0, adventurer.activity.kind === 'fighting' ? adventurer.ward ?? 0 : wardMax))}/${Math.round(wardMax)}`),
        ) : null,
        h('div', {class: 'row small', style: 'margin-top:4px'},
            h('span', {style: 'width:24px'}, 'XP'),
            h('div', {class: 'bar wide xp grow'}, h('span', {style: `width:${100 * Math.min(1, xpFraction)}%`})),
            h('span', {class: 'num'}, `${adventurer.xp - levelStart}/${levelEnd - levelStart}`),
        ),
    );
}

function adventurerPanel(ctx: Ctx, adventurer: Adventurer): HTMLElement {
    const {state, ui} = ctx;
    const stats = getCachedStats(state, adventurer);
    const cls = classes[adventurer.classKey];

    const pct = (v: number) => `${fmt(v * 100)}%`;
    const damageParts = (Object.keys(stats.damage) as DamageType[]).filter(t => stats.damage[t] > 0)
        .map(t => `${fmt(stats.damage[t], 1)} ${damageLabels[t]}`);
    const statGrid = h('div', null,
        h('h3', null, 'Stats'),
        hpXpBars(state, adventurer),
        h('div', {class: 'statgroup'}, 'Offense'),
        h('div', {class: 'statgrid small'},
            statRow('Weapon', stats.weaponName + (stats.wieldNote && stats.wieldNote !== 'unarmed' ? ` (${stats.wieldNote})` : '')),
            stats.strikes
                ? stats.strikes.map((st, i) => statRow(i ? 'Off-hand hit' : 'Main-hand hit', `${(Object.keys(st.damage) as DamageType[]).filter(t => st.damage[t] > 0).map(t => `${fmt(st.damage[t], 1)} ${damageLabels[t]}`).join(' + ') || '0'} · ${fmt(st.attacksPerSecond, 2)}/s pace`))
                : statRow('Hit', damageParts.join(' + ') || '0'),
            statRow('Roll', `${num(stats.rollMin)}× to ${num(stats.rollMax)}×`),
            statRow('Attacks/s', fmt(stats.attacksPerSecond, 2)),
            statRow('Accuracy', stats.accuracy),
            statRow('Crit', `${pct(stats.critChance)} · +${pct(stats.critBonus)}/level`),
            statRow('Avg crit', `${num(expectedCritMultiplier(stats.critChance, stats.critBonus))}×`),
            statRow('Ailment chance', `${pct(AILMENT_CHANCE + (stats.gear.igniteChance ?? 0))} ignite · ${pct(AILMENT_CHANCE + (stats.gear.chillChance ?? 0))} chill · ${pct(AILMENT_CHANCE + (stats.gear.shockChance ?? 0))} shock`),
            stats.gear.ailmentEffect ? statRow('Ailment effect', `+${pct(stats.gear.ailmentEffect)}`) : null,
        ),
        h('div', {class: 'statgroup'}, 'Defense'),
        h('div', {class: 'statgrid small'},
            statRow('Max HP', stats.maxHealth),
            statRow('Ward', stats.maxWard),
            stats.hpLostAsWard ? statRow('HP lost as ward', pct(stats.hpLostAsWard)) : null,
            stats.gear.wardOnDodge || stats.gear.wardOnDodgePercent ? statRow('Ward on dodge', [stats.gear.wardOnDodge ? fmt(stats.gear.wardOnDodge, 1) : '', stats.gear.wardOnDodgePercent ? `${pct(stats.gear.wardOnDodgePercent)} of max` : ''].filter(Boolean).join(' + ')) : null,
            stats.gear.wardOnBlock || stats.gear.wardOnBlockPercent ? statRow('Ward on block', [stats.gear.wardOnBlock ? fmt(stats.gear.wardOnBlock, 1) : '', stats.gear.wardOnBlockPercent ? `${pct(stats.gear.wardOnBlockPercent)} of max` : ''].filter(Boolean).join(' + ')) : null,
            statRow('Armor', stats.armor),
            statRow('Evasion', stats.evasion),
            ...(() => {
                // Armor and evasion against an average attack from monsters around the hero's level.
                const typical = typicalAttack(adventurer.level);
                const hit = typical.hit, after = mitigateHit(hit, stats.armor);
                const dp = hit < 10 ? 1 : 0;
                const armorRow = statRow('Armor vs typical hit', `${fmt(after, dp)} (~${fmt(100 * (1 - after / Math.max(1e-9, hit)))}% less)`);
                armorRow.classList.add('wide');
                armorRow.title = `An average monster hit around level ${adventurer.level} is about ${fmt(hit, dp)}. Armor cuts it to ${fmt(after, dp)}, before resistances and block. A hit under 1 deals 1 with that chance, else 0.`;
                const hits = expectedHits(typical.accuracy, stats.evasion);
                const evasionRow = statRow('Hits taken per typical attack', fmt(hits, 2));
                evasionRow.classList.add('wide');
                evasionRow.title = `Monsters around level ${adventurer.level} have about ${fmt(typical.accuracy)} accuracy. Against ${stats.evasion} evasion an attack lands ${fmt(hits, 2)} hits on average (${pct(hitChance(typical.accuracy, stats.evasion))} chance the first lands), before block and Exposed.`;
                return [armorRow, evasionRow];
            })(),
            statRow('Block', pct(stats.blockChance)),
            // Past the cap, the uncapped total follows in brackets: 75% (110%).
            ...elements.map(e => {
                const total = stats.resistTotal?.[e] ?? stats.resist[e];
                const over = total > stats.resist[e] + 1e-9;
                const row = statRow(`${e[0].toUpperCase()}${e.slice(1)} res`, over ? `${pct(stats.resist[e])} (${pct(total)})` : pct(stats.resist[e]));
                if (over) row.title = `${pct(total)} ${e} resistance in total, capped at ${pct(RESIST_CAP)}.`;
                return row;
            }),
            // These are the stats before Corrosion; mid-run its stacks scale them down.
            (adventurer.run?.corrosion ?? 0) > 0 && adventurer.activity.kind === 'fighting' ? (() => {
                const row = statRow(`Corrosion ${adventurer.run!.corrosion}`, `× ${fmt(corrosionFactor(adventurer.run!.corrosion!), 2)} this run`);
                row.classList.add('wide', 'bad');
                row.title = 'Corrosion stacks scale evasion, armor, max ward, block chance and resistances above by this factor for the rest of the run.';
                return row;
            })() : null,
        ),
        h('div', {class: 'statgroup'}, 'Recovery'),
        h('div', {class: 'statgrid small'},
            statRow('Regen', `${fmt(stats.lifeRegen, 1)}/s`),
            statRow('Leech', pct(stats.lifeLeech)),
            statRow('Life on hit', fmt(stats.lifeOnHit, 1)),
            statRow('Full rest', `${fmt(15 / restSpeed(stats.maxHealth, stats.lifeRegen, adventurer.level), 1)}s`),
            ...(() => {
                const scale = stats.passiveScale.bloodPact ?? 0;
                if (!scale) return [];
                const row = statRow('Blood pact damage', `+${fmt(100 * bloodPactBonus(scale, stats.lifeRegen))}%`);
                row.title = `From ${fmt(stats.lifeRegen, 1)} HP regenerated per second. Leech healing over time adds to it in a fight.`;
                return [row];
            })(),
        ),
        h('div', {class: 'statgroup'}, 'Attributes'),
        h('div', {class: 'statgrid small'},
            statRow('Str', stats.str), statRow('Dex', stats.dex), statRow('Int', stats.int),
        ),
        h('p', {class: 'muted small', style: 'margin:6px 0 0'},
            `Grows ${growthText(adventurer.classKey)} per level. ${damageStats(cls).map(k => k[0].toUpperCase() + k.slice(1)).join(' and ')}: half ${damageStats(cls).length > 1 ? 'their average' : 'of it'} is added as physical damage. `
            + `Str: ${statDefs.str.description} Dex: ${statDefs.dex.description} Int: ${statDefs.int.description} `
            + `Resistances cap at ${pct(RESIST_CAP)}, block at ${pct(BLOCK_CAP)}. Hits chain: hit n of an attack lands with chance (hit rating) / n. Hit rating is √(accuracy / evasion) − 0.2: an attacker with accuracy equal to your evasion has a rating of ${pct(hitRating(stats.evasion, stats.evasion))}, and 1.44× that accuracy never misses the first hit. After whole attacks miss in a row, the next first hit rolls with accuracy × (1 + misses in a row).`),
    );

    const assignment = h('div', {class: 'row small'},
        h('span', {class: 'grow muted'}, adventurer.assignment
            ? `On ${quests[adventurer.assignment.questKey].name} · ${activityText(state, adventurer)}`
            : activityText(state, adventurer) + '. Open a quest on the map to send them out.'),
        adventurer.run ? h('button', {class: 'btn small', onclick: () => { showRun(ui, adventurer.id); ctx.refresh(); }}, 'Show run') : null,
    );

    const equipList = h('div', {id: 'equipment'},
        h('div', {class: 'row h3row'},
            h('h3', {class: 'grow'}, 'Equipment'),
            h('button', {class: 'btn small', title: 'In each slot, from the top, wear the free item with the best DPS % + toughness % change. Items other members wear are left alone.', onclick: () => {
                const changed = autoEquip(state, adventurer);
                if (changed.length) state.guide = {...state.guide, manualEquip: true};
                if (!changed.length) ctx.toast(`Nothing better for ${adventurer.name} right now`);
                ctx.refresh();
            }}, 'Auto equip'),
        ),
        h('div', {class: 'list'},
            ...slotOrder.map(slot => {
                const ref = adventurer.equipment[slot];
                const item = ref ? resolveItemRef(state, ref) : undefined;
                const blocked = slot === 'offHand' && !ref && isTwoHandedWielded(state, adventurer);
                const pick = h('button', {
                    class: 'item grow' + (ui.selectedSlot === slot ? ' selected' : ''),
                    title: slotNames[slot],
                    'aria-label': `${slotNames[slot]}: ${item ? item.name : blocked ? 'blocked by two-handed weapon' : 'empty'}`,
                    'data-guide': !ref && ui.selectedSlot !== slot && hasFreeGear(state, adventurer, slot) ? 'equip' : undefined,
                    onclick: () => { ui.selectedSlot = ui.selectedSlot === slot ? null : slot; ctx.refresh(); },
                },
                h('span', {class: 'slot-art' + (item ? '' : ' empty')}, !ref ? itemTypeArt(emptySlotType(adventurer, slot)) : ref.kind === 'material' ? materialIcon(ref.key, 'typeart') : itemArt(item!.itemType, state.craftedItems.find(c => c.id === ref.id)?.base)),
                h('span', {class: 'grow'},
                    item ? h('div', {class: 'equipname', title: item.name}, h('span', {class: 'lvtag lvpre', title: `Requires level ${itemLevelRequirement(state, ref!)}`}, `Lv ${itemLevelRequirement(state, ref!)} `), item.name, ref?.kind === 'material' ? h('span', {class: 'muted small'}, ' (material)') : null, signatureTag(ref)) : h('div', {class: 'muted equipname'}, `${slotNames[slot]}: ${blocked ? 'blocked by two-handed weapon' : 'empty'}`),
                    item ? h('div', {class: 'mods equipmods', title: itemStatsText(item.stats)}, itemStatsText(item.stats)) : null,
                ));
                // Take off without opening the picker.
                const craftedItem = ref?.kind === 'crafted' ? state.craftedItems.find(c => c.id === ref.id) : undefined;
                return h('div', {class: 'row memberrow equiprow slotrow'}, pick,
                    item ? h('div', {class: 'equipbtns'},
                        craftedItem ? recipeButton(ctx, craftedItem) : null,
                        h('button', {class: 'btn small', title: `Take off ${item.name}`, 'aria-label': `Take off ${item.name}`, onclick: () => {
                            unequip(state, adventurer, slot);
                            ctx.refresh();
                        }}, 'Take off')) : null);
            }),
        ),
    );

    const passive = heroPassives(adventurer, 'passive small', state);
    const ambitions = adventurer.ambitions ?? [];
    const doneCount = ambitions.filter(a => a.done).length;
    const ambitionSection = ambitions.length ? h('div', null,
        h('h3', null, `Ambitions (${doneCount}/${ambitions.length})`),
        ambitionList(ambitions, adventurer),
        h('div', {class: 'row small', style: 'margin-top:4px'},
            h('span', {class: 'grow muted'}, doneCount < ambitions.length
                ? `Fulfilling ${doneCount + 1} would pay ×${RETIRE_MULTIPLIER[doneCount + 1]} on retirement.`
                : 'Every ambition fulfilled.'),
            h('button', {
                class: 'btn small',
                title: `Open the guild roster, where ${adventurer.name} can retire`,
                onclick: () => openGuildSection(ctx, 'guild-roster'),
            }, `Retire now: ${retireFame(adventurer)} fame`),
        ),
    ) : null;
    return shell(ctx, adventurer.name, h('div', {class: 'panel-title-sub'}, `Level ${adventurer.level} ${cls.name}`),
        // The portrait sits beside the class passive at the top of the character panel.
        h('div', {class: 'herohead'}, heroPortrait(adventurer, 'large'), passive),
        assignment,
        equipList,
        ambitionSection,
        contractsOpen(state) ? contractSection(ctx, adventurer) : null,
        statGrid,
    );
}

// ---------------- Contracts ----------------

// Contracts open with the first guild expansion.
export function contractsOpen(state: GameState): boolean {
    return (state.expansion ?? 0) >= 1;
}

// Takes a contract and sends the adventurer off for it with a full run, starting fresh so the run
// counts.
function startContract(ctx: Ctx, adventurer: Adventurer, kind: 'personal' | 'guild', id: string) {
    const {state, ui} = ctx;
    const contract = takeContract(state, adventurer, kind, id);
    if (!contract) {
        ctx.toast('That contract is not available');
        return;
    }
    const quest = quests[contract.questKey];
    setStopAt(adventurer, quest.key, quest.encounters.length - 1);
    if (adventurer.assignment?.questKey === quest.key && adventurer.activity.kind !== 'idle' && adventurer.activity.kind !== 'resting') {
        recall(state, adventurer);
    }
    assignQuest(state, adventurer, quest.key);
    showRun(ui, adventurer.id, state);
}

function contractCard(ctx: Ctx, contract: Contract, extra: Node | null, ...buttons: (Node | null)[]): HTMLElement {
    const quest = quests[contract.questKey];
    return h('div', {class: 'contract'},
        h('div', {class: 'small'}, contractText(contract)),
        h('div', {class: 'mods'}, contract.mods.map(k => {
            const def = quest.modifiers.find(m => m.key === k);
            return def ? `${def.name}: ${modifierPenaltyText(def)}` : k;
        }).join(' · ')),
        h('div', {class: 'mods good'}, 'Reward: ', ...(contract.reward.material
            ? [materialLink(ctx, contract.reward.material), ` + ${contractRewardText({...contract, reward: {...contract.reward, material: undefined}})}`]
            : [contractRewardText(contract)])),
        extra,
        h('div', {class: 'row', style: 'margin-top:4px'}, ...buttons.filter(Boolean) as Node[]),
    );
}

// The adventurer's personal contract, and the guild contract they're working on if any.
function contractSection(ctx: Ctx, adventurer: Adventurer): HTMLElement {
    const {state} = ctx;
    ensurePersonalContract(state, adventurer);
    const offer = adventurer.contract;
    const active = adventurer.activeContract;
    const onGuild = active?.kind === 'guild' ? findContract(state, active) : undefined;
    const cost = personalRefreshCost(adventurer);
    const working = active?.kind === 'personal' && offer && active.id === offer.id;
    const drop = h('button', {class: 'btn small', onclick: () => { dropContract(adventurer); ctx.refresh(); }}, 'Drop');
    return h('div', null,
        h('h3', null, 'Contracts'),
        onGuild ? contractCard(ctx, onGuild, h('div', {class: 'mods'}, h('strong', null, 'Working on this guild contract.')), drop) : null,
        offer ? contractCard(ctx, offer,
            h('div', {class: 'mods muted'}, working ? h('strong', null, 'Working on it. Runs started now count.') : `Personal contract, pitched at level ${adventurer.level}. A guaranteed mythic.`),
            working ? drop : h('button', {class: 'btn small primary', onclick: () => { startContract(ctx, adventurer, 'personal', offer.id); ctx.refresh(); }}, 'Take contract'),
            h('button', {class: 'btn small', disabled: state.gold < cost, title: `Replace it with a new contract pitched at level ${adventurer.level}`, onclick: () => { refreshPersonalContract(state, adventurer); ctx.refresh(); }}, `New contract · ${cost} gold`),
        ) : h('div', {class: 'muted small'}, 'No contract on offer.'),
    );
}

// The guild's shared board: any member can take one.
function contractBoard(ctx: Ctx): HTMLElement {
    const {state} = ctx;
    ensureGuildContracts(state);
    return h('div', null,
        h('h3', null, 'Guild contracts'),
        h('p', {class: 'muted small', style: 'margin:0 0 6px'}, 'Open to any member. New contracts ask for more modifiers as the guild\'s fame grows, while the fame they pay stays the same. A contract counts only for runs started after it is taken, and a new one replaces it when done.'),
        h('div', {class: 'list'}, ...(state.guildContracts ?? []).map(c => {
            const holder = contractHolder(state, c.id);
            const pickId = currentHero(ctx)?.id;
            const pickHero = state.adventurers.find(a => a.id === pickId);
            // Sends the selected hero (picked in the HUD).
            const select = pickHero?.activeContract ? h('div', {class: 'mods'}, `${pickHero.name} is already on another contract.`) : null;
            const cost = guildRefreshCost(c);
            return contractCard(ctx, c,
                holder ? h('div', {class: 'mods'}, h('strong', null, `${holder.name} is working on it.`)) : null,
                holder ? null : select,
                holder ? h('button', {class: 'btn small', onclick: () => { dropContract(holder); ctx.refresh(); }}, `Drop`) : h('button', {class: 'btn small primary', disabled: !pickHero, onclick: () => { if (pickHero) startContract(ctx, pickHero, 'guild', c.id); ctx.refresh(); }}, `Send ${pickHero?.name ?? ''}`),
                h('button', {class: 'btn small', disabled: state.gold < cost, onclick: () => { refreshGuildContract(state, c.id); ctx.refresh(); }}, `Replace · ${cost} gold`),
            );
        })),
    );
}

// Retired adventurers and what they achieved.
function hallOfLegends(state: GameState): HTMLElement | null {
    const legends = state.legends ?? [];
    if (!legends.length) return null;
    return h('div', null,
        h('h3', null, `Hall of Legends (${legends.length})`),
        h('div', {class: 'list'}, ...[...legends].reverse().map(l => h('div', {class: 'legend small'},
            h('div', {class: 'row'}, h('strong', {class: 'grow'}, `${l.name}, level ${l.level} ${classes[l.classKey]?.name ?? ''}`), h('span', {class: 'num'}, `${l.fame} fame`)),
            ...l.ambitions.map(a => h('div', {class: 'mods' + (a.done ? '' : ' muted')}, `${a.done ? '✓' : '✗'} ${ambitionText(a)}`)),
            l.records ? h('div', {class: 'mods muted'}, `Best hit ${Math.floor(l.records.bestHit).toLocaleString()} · longest chain ${l.records.bestChain}`) : null,
        ))),
    );
}

// ---------------- Run panel (bottom) ----------------

// The run's encounter track: drag or click to set the stopping point. Shared by the run panel and the battle view's strip.
export function runTrack(ctx: Ctx, adventurer: Adventurer): HTMLElement {
    const run = adventurer.run!;
    const quest = quests[run.questKey];
    const activity = adventurer.activity;
    const fighting = activity.kind === 'fighting' && activity.questKey === run.questKey ? activity.encounterIndex : -1;
    const last = quest.encounters.length - 1;
    // Endless runs show the current stretch of the pattern; there is no stopping point to set.
    const endlessAt = Math.max(0, fighting >= 0 ? fighting : run.defeatedAt ?? run.cleared + 1);
    const endlessStart = endlessAt - endlessAt % ENDLESS_PATTERN.length;
    return quest.endless ? h('div', {class: 'track'},
        ...quest.encounters.slice(endlessStart, endlessStart + ENDLESS_PATTERN.length).map((encounter, k) => {
            const i = endlessStart + k;
            return h('span', {
                class: ['enc', encounter.tier, i <= run.cleared ? 'cleared' : '', i === fighting ? 'current' : '', i === run.defeatedAt ? 'failed' : ''].filter(Boolean).join(' '),
                title: `Endless encounter ${i + 1} · ${tierNames[encounter.tier]}`,
            }, String(i + 1));
        }),
    ) : h('div', {
        class: 'track',
        // Press on an encounter and drag along the track to move the stop point. Panels hold still while
        // a pointer is down, so the cards are restyled in place and the panel refreshes on release.
        onpointerdown: (event: MouseEvent) => {
            const ev = event as PointerEvent;
            const track = ev.currentTarget as HTMLElement;
            const at = (x: number, y: number) => {
                const el = (document.elementFromPoint(x, y) as HTMLElement | null)?.closest<HTMLElement>('.enc[data-enc]');
                return el && track.contains(el) ? Number(el.dataset.enc) : null;
            };
            const start = at(ev.clientX, ev.clientY);
            if (start === null || ev.button !== 0) return;
            ev.preventDefault();
            track.setPointerCapture(ev.pointerId);
            const place = (i: number) => {
                setStopAt(adventurer, run.questKey, i);
                const stop = adventurer.run?.stopAt ?? i;
                track.querySelectorAll<HTMLElement>('.enc[data-enc]').forEach(el => {
                    const k = Number(el.dataset.enc);
                    el.classList.toggle('beyond', k > stop);
                    el.classList.toggle('stop', k === stop && k !== last);
                });
            };
            place(start);
            const move = (e: PointerEvent) => { const i = at(e.clientX, e.clientY); if (i !== null) place(i); };
            const end = () => {
                track.removeEventListener('pointermove', move);
                track.removeEventListener('pointerup', end);
                track.removeEventListener('pointercancel', end);
                ctx.refresh();
            };
            track.addEventListener('pointermove', move);
            track.addEventListener('pointerup', end);
            track.addEventListener('pointercancel', end);
        },
    },
        ...quest.encounters.map((encounter, i) => h('button', {
            'data-enc': String(i),
            onclick: (ev: MouseEvent) => { if (ev.detail === 0) { setStopAt(adventurer, run.questKey, i); ctx.refresh(); } },
            'aria-label': `Stop after encounter ${i + 1}`,
            class: ['enc', encounter.tier,
                i <= run.cleared ? 'cleared' : '',
                i > run.stopAt ? 'beyond' : '',
                i === fighting ? 'current' : '',
                i === run.defeatedAt ? 'failed' : '',
                i === run.stopAt && i !== last ? 'stop' : ''].filter(Boolean).join(' '),
            title: `Encounter ${i + 1} · ${tierNames[encounter.tier]}. Click or drag along the track to stop after this one.`,
        }, encounter.tier)),
    );

}


// The battle view's thin bottom strip: who and where, the encounter track, and the ways out.
export function renderRunStrip(ctx: Ctx): HTMLElement | null {
    const {state, ui} = ctx;
    const adventurer = currentHero(ctx);
    const run = adventurer?.run;
    if (!adventurer || !run) return null;
    const quest = quests[run.questKey];
    return h('section', {class: 'runstrip', 'aria-label': `${adventurer.name}'s run strip`},
        h('div', {class: 'rs-title'},
            h('strong', {class: 'runtitle'}, `${adventurer.name} · ${quest.name}`),
            h('span', {class: 'muted small'}, `Run ${run.number}`),
        ),
        runTrack(ctx, adventurer),
        quest.endless ? null : h('span', {class: 'rs-gains small muted'}, `+${run.gold} gold · +${run.xp} XP`),
        adventurer.assignment ? h('button', {class: 'btn small', onclick: () => { recall(state, adventurer); ui.view = 'map'; ctx.refresh(); }}, 'Recall') : null,
        h('button', {class: 'btn small' + (ui.stripOpen ? ' on' : ''), 'aria-expanded': ui.stripOpen ? 'true' : 'false', title: 'Loot, modifiers, auto recover and the recap for this run', onclick: () => { ui.stripOpen = !ui.stripOpen; ctx.refresh(); }}, ui.stripOpen ? 'Hide details' : 'Run details'),
        // The recover button sits over the resting hero in the arena.
        ui.stripOpen ? h('div', {class: 'rs-details'}, ...runInfo(ctx, adventurer, true)) : null,
    );
}

// The run's details under its track: loot, gold, modifiers, contract, auto recover and the recap.
// Shared by the run panel and the battle view's expanded strip (which already shows the gold).
function runInfo(ctx: Ctx, adventurer: Adventurer, strip = false): (Node | null)[] {
    const {state, ui} = ctx;
    const run = adventurer.run!;
    const quest = quests[run.questKey];
    const activity = adventurer.activity;
    const autoShare = adventurer.autoRecover ?? 0;
    // Same fee the engine uses: what this run actually paid, modifiers included.
    const runFee = run.fee ?? quest.entryFee;
    const netGold = Math.max(0, run.gold - runFee);
    const autoRow = h('div', {class: 'row small', style: 'flex-wrap:nowrap;margin-top:6px'},
        h('span', {class: 'muted oneline'}, 'Auto recover'),
        h('div', {class: 'seg', role: 'group', 'aria-label': 'Auto recover budget'},
            ...[0, 0.25, 0.5, 0.75, 1].map(share => h('button', {
                class: autoShare === share ? 'on' : '',
                title: share ? `Spend up to ${num(share * 100)}% of the last run's gold to skip resting` : 'Never pay to skip resting',
                onclick: () => { adventurer.autoRecover = share; ctx.refresh(); },
            }, share ? `${num(share * 100)}%` : 'Off')),
        ),
    );
    const autoText = autoShare
        ? (netGold > 0
            ? `Recovers when the cost drops to ${getAutoRecoverBudget(adventurer)} gold: ${num(autoShare * 100)}% of this run's ${run.gold} gold${runFee ? ` after the ${runFee} gold entry fee` : ''}. Never spends more than a run earned.`
            : run.gold > 0
                ? `This run's ${run.gold} gold hasn't covered its ${runFee} gold entry fee yet, so nothing will be spent.`
                : 'This run has earned no gold yet, so nothing will be spent.')
        : 'Off. Rests run their full time unless you pay.';

    const modNames = (keys: string[] | undefined) => (keys ?? []).map(k => quest.modifiers.find(m => m.key === k)?.name ?? k).join(', ');
    const lootText = Object.entries(run.loot).map(([key, n]) => `${n} ${requireMaterial(key).name}`).join(', ');

    return [
                quest.endless ? h('div', {class: 'muted small'}, `No rewards. Monsters grow ${num(ENDLESS_GROWTH * 100)}% stronger every encounter, and ${num(ENDLESS_STEP)}× every ${ENDLESS_PATTERN.length}, until ${adventurer.name} falls or is recalled, then they head home.`) : null,
                quest.endless ? null : h('div', {class: 'muted small oneline'}, 'Click or drag along the encounters to turn back after one, including this run.'),
                quest.endless ? null : h('div', {class: 'muted small oneline', title: lootText}, ...(lootText
                    ? ['Loot: ', ...Object.entries(run.loot).flatMap(([key, n], i) => [i ? ', ' : '', `${n} `, materialLink(ctx, key)])]
                    : ['No loot yet this run.'])),
                quest.endless || strip ? null : h('div', {class: 'muted small oneline'}, `+${run.gold} gold${runFee ? ` (fee ${runFee})` : ''} · +${run.xp} XP`),
                quest.endless ? null : h('div', {class: 'row small', style: 'flex-wrap:nowrap;margin-top:6px'},
                    h('span', {class: 'muted grow oneline', title: modNames(run.modifiers)},
                        run.modifiers?.length ? `Modifiers: ${modNames(run.modifiers)}` : 'No modifiers this run'),
                    h('button', {class: 'btn small', onclick: () => {
                        ui.panel = {kind: 'quest', key: run.questKey};
                        ctx.refresh();
                    }}, 'Change'),
                ),
                run.contract ? h('div', {class: 'muted small oneline'}, (() => {
                    const c = findContract(state, run.contract, adventurer);
                    return c ? `On a ${run.contract.kind} contract: ${contractText(c)}` : 'Contract done';
                })()) : null,
                quest.endless ? null : autoRow,
                quest.endless ? null : h('div', {class: 'muted small'}, autoText),
                // This run's recap once it's over (resting or back home), however it ended. While the
                // next run is under way, the last run's recap stays up.
                (() => {
                    const over = activity.kind === 'resting' || activity.kind === 'idle';
                    const prev = adventurer.previousRun;
                    if (over && run.stats) {
                        return renderRunRecap(run.stats, false, {
                            title: `Run recap · ${runOutcome(run)}`,
                            onDetails: () => {
                                ui.recap = {title: `${adventurer.name} · ${quest.name}`, subtitle: `Run ${run.number}, ${runOutcome(run)}`, stats: JSON.parse(JSON.stringify(run.stats)),
                                    previous: adventurer.previousRunStats ? JSON.parse(JSON.stringify(adventurer.previousRunStats)) : undefined};
                                ctx.refresh();
                            },
                            onFind: type => findDefenseFor(ctx, type),
                        });
                    }
                    if (!over && adventurer.previousRunStats && prev) {
                        const stats = adventurer.previousRunStats;
                        return renderRunRecap(stats, false, {
                            title: `Last run · ${prev.outcome}`,
                            onDetails: () => {
                                ui.recap = {title: `${adventurer.name} · ${quests[prev.questKey]?.name ?? prev.questKey}`, subtitle: `Run ${prev.number}, ${prev.outcome}`, stats: JSON.parse(JSON.stringify(stats))};
                                ctx.refresh();
                            },
                            onFind: type => findDefenseFor(ctx, type),
                        });
                    }
                    return null;
                })(),
    ];
}

export function renderRunPanel(ctx: Ctx): HTMLElement | null {
    const {state, ui} = ctx;
    const adventurer = ui.runPanel ? currentHero(ctx) : undefined;
    const run = adventurer?.run;
    if (!adventurer || !run) {
        return null;
    }
    const quest = quests[run.questKey];
    const activity = adventurer.activity;
    const fighting = activity.kind === 'fighting' && activity.questKey === run.questKey ? activity.encounterIndex : -1;
    const last = quest.encounters.length - 1;
    const recoverCost = getRecoverCost(state, adventurer);

    const track = runTrack(ctx, adventurer);

    let outcome: string;
    const endlessBest = quest.endless ? adventurer.endlessBest?.[quest.endless.baseKey] ?? -1 : -1;
    if (quest.endless && activity.kind !== 'traveling') {
        const best = endlessBest >= 0 ? ` · ${adventurer.name}'s best: ${endlessBest + 1}` : '';
        outcome = (fighting >= 0 ? `Fighting endless encounter ${fighting + 1}`
            : run.defeatedAt !== undefined ? `Defeated at endless encounter ${run.defeatedAt + 1}`
            : `Left after endless encounter ${run.cleared + 1}`) + best;
    } else if (activity.kind === 'traveling' && activity.questKey === run.questKey) {
        outcome = 'On the way to the first encounter';
    } else if (activity.kind === 'fighting' && activity.boss) {
        outcome = `Fighting ${monsters[activity.boss].name}, an ambition boss`;
    } else if (run.bossEncounter === 'pending') {
        outcome = `${monsters[quest.boss!.monster].name} awaits after resting`;
    } else if (activity.kind === 'fighting' && activity.bonus) {
        outcome = 'Fighting a bonus rare encounter';
    } else if (run.bonusEncounter === 'pending') {
        outcome = 'A bonus rare encounter awaits after resting';
    } else if (fighting >= 0 && activity.kind === 'fighting' && activity.ending !== undefined) {
        outcome = `Cleared encounter ${fighting + 1} of ${run.stopAt + 1}`;
    } else if (fighting >= 0) {
        outcome = `Fighting encounter ${fighting + 1} of ${run.stopAt + 1}`;
    } else if (run.defeatedAt !== undefined) {
        outcome = `Defeated at encounter ${run.defeatedAt + 1}`;
    } else if (run.cleared >= run.stopAt) {
        outcome = run.cleared === last ? 'Cleared the whole quest' : `Reached the stopping point after encounter ${run.cleared + 1}`;
    } else {
        outcome = `Turned back after encounter ${run.cleared + 1}`;
    }

    const restRow = h('div', {class: 'row small', style: 'flex-wrap:nowrap;min-height:28px'},
        // The track and the arena already show the fight, so this line is for resting and travel.
        h('span', {class: 'grow oneline'}, activity.kind === 'fighting' ? '' : activityText(state, adventurer)),
        h('button', {
            class: 'btn small',
            hidden: activity.kind !== 'resting' || activity.remaining <= 0,
            disabled: activity.kind !== 'resting' || state.gold < recoverCost,
            onclick: () => { recoverInstantly(state, adventurer); ctx.refresh(); },
        }, `Recover now (${recoverCost} gold)`),
    );

    return h('section', {class: 'runpanel', 'aria-label': `${adventurer.name}'s run`},
        h('div', {class: 'row'},
            h('div', {class: 'grow'},
                h('strong', {class: 'runtitle'}, `${adventurer.name} · ${quest.name}`),
                h('span', {class: 'muted small'}, ` · run ${run.number}`),
                run.modifiers?.length ? h('span', {class: 'muted small', title: run.modifiers.map(k => quest.modifiers.find(m => m.key === k)?.name).join(', ')}, ` · ${run.modifiers.length} modifier${run.modifiers.length > 1 ? 's' : ''}`) : null,
            ),
            h('button', {class: 'btn small', onclick: () => { ui.panel = {kind: 'adventurer', id: adventurer.id}; ctx.refresh(); }}, 'Character'),
            adventurer.assignment ? h('button', {class: 'btn small', onclick: () => { recall(state, adventurer); ctx.refresh(); }}, 'Recall') : null,
            h('button', {class: 'btn small', 'aria-label': 'Close run panel', onclick: () => { ui.runPanel = null; ctx.refresh(); }}, '×'),
        ),
        h('div', {class: 'runcols'},
            h('div', {class: 'grow'},
                h('h3', null, 'This run'),
                track,
                quest.endless ? h('div', {class: 'track-legend'},
                    h('span', {class: 'oneline'}, outcome),
                ) : null,
                ...runInfo(ctx, adventurer),
            ),
            h('div', {class: 'runnow'},
                h('h3', null, 'Now'),
                hpXpBars(state, adventurer),
                h('div', {style: 'margin-top:6px'}, restRow),
                // The combat view is a persistent element that main.ts moves in here.
                h('div', {class: 'arena-slot', style: 'margin-top:6px'}),
            ),
        ),
    );
}

function isTwoHandedWielded(state: GameState, adventurer: Adventurer): boolean {
    const ref = adventurer.equipment.mainHand;
    const item = ref ? resolveItemRef(state, ref) : undefined;
    return !!item && !!itemTypes[item.itemType].twoHanded;
}

// The full recap of one run, beside the map until dismissed.
export function renderRecapPanel(ctx: Ctx): HTMLElement | null {
    const recap = ctx.ui.recap;
    if (!recap) return null;
    return h('section', {class: 'panel picker recappanel', 'aria-label': 'Run recap'},
        h('div', {class: 'panel-head'},
            h('div', {class: 'grow'},
                h('h2', null, 'Run recap'),
                h('div', {class: 'muted small'}, `${recap.title} · ${recap.subtitle}`),
            ),
            h('button', {class: 'btn', onclick: () => { ctx.ui.recap = null; ctx.refresh(); }}, 'Close'),
        ),
        h('div', {class: 'panel-body'}, renderRunRecap(recap.stats, true, {onFind: type => findDefenseFor(ctx, type), previous: recap.previous})),
    );
}

// A bar split by damage type, with a legend.
function damageBar(damage: DamageMap, label: string, total: number, extra: string, onType?: (type: DamageType) => void): HTMLElement {
    const types = (Object.keys(damageLabels) as DamageType[]).filter(t => (damage[t] ?? 0) > 0);
    const share = (t: DamageType) => (damage[t] ?? 0) / Math.max(1e-9, total);
    return h('div', {class: 'recapdmg'},
        h('div', {class: 'row small'},
            h('span', {class: 'grow'}, h('strong', null, label), ` ${fmt(total)}`),
            h('span', {class: 'muted'}, extra),
        ),
        h('div', {class: 'dmgbar', role: 'img', 'aria-label': types.map(t => `${damageLabels[t]} ${fmt(share(t) * 100)}%`).join(', ') || 'none'},
            ...types.map(t => h('span', {class: t, style: `width:${100 * share(t)}%`}))),
        h('div', {class: 'dmglegend small muted'},
            ...types.map(t => onType
                ? h('button', {class: 'dmgfind', title: `Show materials with ${t === 'physical' ? 'armor' : `${t} resistance`}`, onclick: () => onType(t)}, h('i', {class: t}), `${damageLabels[t]} ${fmt(share(t) * 100)}%`)
                : h('span', null, h('i', {class: t}), `${damageLabels[t]} ${fmt(share(t) * 100)}%`))),
    );
}

// What happened in the run, to steer gear choices: shown while the adventurer rests.
// Opens the material picker filtered to what defends against a damage type: armor for physical
// hits, the matching resistance for elements. An empty bench switches to body armor first.
function findDefenseFor(ctx: Ctx, type: DamageType) {
    const {ui, state} = ctx;
    const bench = ui.bench;
    const family = type === 'physical' ? 'armor' : resistStat[type as 'fire' | 'cold' | 'lightning'];
    if (!bench.base.length) {
        bench.itemType = 'bodyArmor';
        bench.decorations = [];
    }
    ui.benchOpen = true;
    ui.picker = {kind: 'base', index: Math.min(bench.base.length, Math.max(0, getBaseLimit(state, bench.itemType) - 1))};
    ui.statFilters = [family];
    ctx.refresh();
}

function renderRunRecap(stats: RunStats, full: boolean, opts: {onDetails?: () => void, onFind?: (type: DamageType) => void, previous?: RunStats, title?: string} = {}): HTMLElement {
    const {onDetails, onFind, previous} = opts;
    const sum = (d: DamageMap) => Object.values(d).reduce((a, b) => a + (b ?? 0), 0);
    const pct = (n: number, d: number) => d > 0 ? `${fmt(100 * n / d)}%` : '-';
    const dealt = sum(stats.dealt), taken = sum(stats.taken);
    const secs = Math.max(1, stats.fightSeconds);
    const healed = stats.healed.regen + stats.healed.leech + stats.healed.onHit + stats.healed.encounter;
    const physicalIn = (stats.taken.physical ?? 0) + stats.preventedArmor;
    const healParts = ([['regen', stats.healed.regen], ['leech', stats.healed.leech], ['on hit', stats.healed.onHit], ['per enc', stats.healed.encounter]] as [string, number][])
        .filter(([, v]) => v >= 0.5).map(([k, v]) => `${k} ${fmt(v)}`).join(' · ');
    const bars = [
        damageBar(stats.dealt, 'Dealt', dealt, `${fmt(dealt / secs, 1)}/s · ${stats.kills} kill${stats.kills === 1 ? '' : 's'}`),
        damageBar(stats.taken, 'Taken', taken, `${fmt(taken / secs, 1)}/s${stats.wardAbsorbed >= 0.5 ? ` · ${fmt(stats.wardAbsorbed)} by ward` : ''}`, onFind),
    ];
    if (onFind && full) bars.push(h('div', {class: 'muted small'}, 'Click a damage type you took to find materials that defend against it.'));
    if (!full) {
        return h('div', {class: 'recap'},
            h('div', {class: 'row'},
                h('h3', {class: 'grow oneline'}, opts.title ?? 'Run recap'),
                onDetails ? h('button', {class: 'btn small', onclick: onDetails}, 'View recap details') : null,
            ),
            ...bars,
        );
    }
    return h('div', {class: 'recap full'},
        ...bars,
        h('div', {class: 'statgrid small recapgrid'},
            h('div', {title: 'Attacks that landed at least one hit, out of all your attacks. A multihit counts once.'}, h('span', null, 'Hit rate'), h('span', {class: 'num'}, pct(stats.attacksLanded, stats.attacks))),
            h('div', {title: 'Average hits for each attack that landed.'}, h('span', null, 'Hits per landed attack'), h('span', {class: 'num'}, stats.attacksLanded ? fmt(stats.hits / stats.attacksLanded, 2) : '-')),
            h('div', {title: 'Hits that crit, out of all hits.'}, h('span', null, 'Crit rate'), h('span', {class: 'num'}, pct(stats.crits, stats.hits))),
            h('div', {title: 'Monster attacks that missed entirely, out of all their attacks. A monster multihit stops at its first miss, so this counts whole attacks.'}, h('span', null, 'Evaded'), h('span', {class: 'num'}, pct(stats.attacksDodged, stats.incomingAttacks))),
            h('div', {title: 'Monster hits blocked, out of all hits that got past evasion.'}, h('span', null, 'Blocked'), h('span', {class: 'num'}, pct(stats.blocks, stats.incomingHits))),
            h('div', {title: 'Physical damage armor stopped, and its share of the physical damage aimed at you.'}, h('span', null, 'Armor prevented'), h('span', {class: 'num'}, `${fmt(stats.preventedArmor)} (${pct(stats.preventedArmor, physicalIn)})`)),
            stats.preventedResist >= 0.5 ? h('div', null, h('span', null, 'Resist prevented'), h('span', {class: 'num'}, fmt(stats.preventedResist))) : null,
            stats.preventedBlock >= 0.5 ? h('div', null, h('span', null, 'Block prevented'), h('span', {class: 'num'}, fmt(stats.preventedBlock))) : null,
            stats.reflected ? h('div', {title: `Reflection sends ${Math.round(REFLECT_SHARE * 100)}% of each hit you land back at you, after the monster's armor and resistances. Your evasion, block, armor and resistances then apply. Damage before ward.`}, h('span', null, 'Reflected at you'), h('span', {class: 'num'}, `${fmt(stats.reflected.taken)} · ${stats.reflected.hits} hits`)) : null,
            h('div', {title: healParts}, h('span', null, 'Healed'), h('span', {class: 'num'}, fmt(healed))),
            stats.wardGained >= 0.5 ? h('div', {title: 'Ward refilled during fights, from kills or HP lost.'}, h('span', null, 'Ward regained'), h('span', {class: 'num'}, fmt(stats.wardGained))) : null,
            h('div', null, h('span', null, 'Lowest HP'), h('span', {class: 'num'}, `${fmt(100 * stats.lowestHp)}%`)),
            h('div', null, h('span', null, 'Time fighting'), h('span', {class: 'num'}, `${fmt(stats.fightSeconds)}s`)),
        ),
        healParts ? h('div', {class: 'muted small'}, `Healing: ${healParts}`) : null,
        stats.takenBy && taken > 0 ? h('div', null,
            h('h3', null, 'Damage taken by monster type'),
            h('div', {class: 'statgrid small recapgrid'}, ...Object.entries(stats.takenBy).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([key, v]) =>
                h('div', null, h('span', null, key === REFLECT_SOURCE ? 'Your reflected hits' : monsters[key]?.name ?? key), h('span', {class: 'num'}, `${fmt(v)} (${pct(v, taken)})`)))),
        ) : null,
        stats.takenByEncounter && taken > 0 ? h('div', null,
            h('h3', null, 'Damage taken per encounter'),
            h('div', {class: 'statgrid small recapgrid encgrid'}, ...Object.entries(stats.takenByEncounter).map(([label, e]) => ({label, ...(typeof e === 'number' ? {taken: e, seconds: 0} : e)}))
                .sort((a, b) => b.taken - a.taken).slice(0, 4).map(({label, taken: v, seconds}) =>
                    h('div', null, h('span', {title: label}, label), h('span', {class: 'num'},
                        `${fmt(v)} (${pct(v, taken)})${seconds > 0 ? ` · ${fmt(seconds, 1)}s · ${fmt(v / seconds, 1)}/s` : ''}`)))),
        ) : null,
        previous ? (() => {
            const pSecs = Math.max(1, previous.fightSeconds);
            const change = (now: number, before: number) => before > 0 ? `${now >= before ? '+' : ''}${fmt(100 * (now - before) / before)}%` : '-';
            return h('div', null,
                h('h3', null, 'Against the run before'),
                h('div', {class: 'statgrid small recapgrid'},
                    h('div', null, h('span', null, 'Damage dealt per second'), h('span', {class: 'num'}, change(dealt / secs, sum(previous.dealt) / pSecs))),
                    h('div', null, h('span', null, 'Damage taken per second'), h('span', {class: 'num'}, change(taken / secs, sum(previous.taken) / pSecs))),
                    h('div', null, h('span', null, 'Hit rate'), h('span', {class: 'num'}, `${pct(previous.attacksLanded, previous.attacks)} → ${pct(stats.attacksLanded, stats.attacks)}`)),
                    h('div', null, h('span', null, 'Evaded'), h('span', {class: 'num'}, `${pct(previous.attacksDodged, previous.incomingAttacks)} → ${pct(stats.attacksDodged, stats.incomingAttacks)}`)),
                ),
            );
        })() : null,
    );
}

function statRow(label: string, value: string | number): HTMLElement {
    return h('div', null, h('span', null, label), h('span', {class: 'num'}, typeof value === 'number' ? num(value) : value));
}

// The gear picker for the selected equipment slot, in its own panel beside the character panel.
// Choices open in their own panel beside the one they belong to: gear for a character's slot, a
// trophy for a guild trophy slot. New pickers should follow this pattern.
function pickerShell(ctx: Ctx, title: string, subtitle: string, label: string, onClose: () => void, ...body: (Node | null)[]): HTMLElement {
    return h('section', {class: 'panel right gearpick', 'aria-label': label},
        h('div', {class: 'panel-head'},
            h('div', {class: 'grow'}, h('h2', null, title), h('div', {class: 'muted small'}, subtitle)),
            h('button', {class: 'btn', 'aria-label': `Close ${label.toLowerCase()}`, onclick: () => { onClose(); ctx.refresh(); }}, 'Close'),
        ),
        h('div', {class: 'panel-body'}, ...body),
    );
}

function trophyPicker(ctx: Ctx): HTMLElement | null {
    const {state, ui} = ctx;
    const picking = ui.trophyPick;
    const slots = state.guild.trophySlots ?? 0;
    if (picking === null || picking === undefined || picking >= slots) return null;
    const earned = trophyList.filter(def => def.kind !== 'endless' && (state.trophies?.[def.key] ?? -1) >= 0);
    const equipped = state.trophySlots ?? [];
    const close = () => { ui.trophyPick = null; };
    const shell = pickerShell(ctx, `Trophy slot ${picking + 1}`, 'Its bonus applies to every member while it sits in a slot.', 'Trophy picker', close,
        earned.length ? h('div', {class: 'list trophypicklist'},
            equipped[picking] ? h('button', {class: 'item emptyslot', onclick: () => { equipTrophy(state, picking, null); close(); ctx.refresh(); }},
                h('span', {class: 'tpick-art'}, trophyCase(undefined, 0)),
                h('span', {class: 'grow'}, h('div', {class: 'tname'}, 'Empty this slot'))) : null,
            ...earned.map(def => {
                const tier = state.trophies![def.key];
                const at = equipped.indexOf(def.key);
                return h('button', {
                    class: 'item' + (at === picking ? ' selected' : at >= 0 ? ' used' : ''),
                    'data-guide': 'trophy',
                    title: at >= 0 && at !== picking ? `Already in slot ${at + 1}. Choosing it moves it here.` : undefined,
                    onclick: () => { equipTrophy(state, picking, def.key); close(); ctx.refresh(); },
                }, h('span', {class: 'tpick-art'}, trophyCase(def, tier)), h('span', {class: 'grow'},
                    h('div', {class: 'tname'}, def.name),
                    h('div', {class: 'small ttier tier' + tier}, trophyTierName(def, tier), at === picking ? h('span', {class: 'usedtag'}, ' In this slot') : at >= 0 ? h('span', {class: 'usedtag'}, ` In slot ${at + 1} · moves here`) : null),
                    h('div', {class: 'mods tbonus'}, def.bonusText(def.tiers[tier].bonus)),
                    h('div', {class: 'mods muted'}, earnedText(def, tier))));
            }),
        ) : h('p', {class: 'muted small'}, 'No trophies earned yet.'),
    );
    shell.classList.add('trophypick');
    return shell;
}

export function renderGearPanel(ctx: Ctx): HTMLElement | null {
    const {ui} = ctx;
    const panel = ui.panel;
    if (panel?.kind === 'guild') {
        return trophyPicker(ctx);
    }
    if (panel?.kind !== 'adventurer' || !ui.selectedSlot) {
        return null;
    }
    const adventurer = currentHero(ctx);
    if (!adventurer) {
        return null;
    }
    const slot = ui.selectedSlot;
    return pickerShell(ctx, slotNames[slot], `For ${adventurer.name}, level ${adventurer.level}`, 'Gear picker', () => { ui.selectedSlot = null; },
        slotChooser(ctx, adventurer, slot));
}

// Whether a crafted item nobody wears fits the slot and the hero's level, for the equip step's highlight.
function hasFreeGear(state: GameState, adventurer: Adventurer, slot: SlotKey): boolean {
    return state.craftedItems.some(item => {
        const ref: ItemRef = {kind: 'crafted', id: item.id};
        return !isItemEquipped(state, item.id) && canEquipInSlot(state, adventurer, ref, slot, true) && effectiveLevel(adventurer) >= itemLevelRequirement(state, ref);
    });
}

function slotChooser(ctx: Ctx, adventurer: Adventurer, slot: SlotKey): HTMLElement {
    const {state} = ctx;
    const options: {ref: ItemRef, name: string, stats: ItemStats, note: string}[] = [];
    for (const item of state.craftedItems) {
        const ref: ItemRef = {kind: 'crafted', id: item.id};
        const wearer = isItemEquipped(state, item.id);
        if (wearer || !canEquipInSlot(state, adventurer, ref, slot, true)) {
            continue;
        }
        options.push({ref, name: item.name, stats: getCraftedItemStats(item), note: itemTypes[item.itemType].name});
    }
    for (const key of materialOrder) {
        const ref: ItemRef = {kind: 'material', key};
        if ((state.materials[key] ?? 0) < 1 || !requireMaterial(key).equip || !canEquipInSlot(state, adventurer, ref, slot, true)) {
            continue;
        }
        const resolved = resolveItemRef(state, ref)!;
        options.push({ref, name: resolved.name, stats: resolved.stats, note: `${requireMaterial(key).name} worn directly · ${state.materials[key]} owned`});
    }
    const current = adventurer.equipment[slot];
    // The first item type that fits this slot, for the bench shortcut.
    const craftType = !hasBench(state) || slot === 'offHand' && isTwoHandedWielded(state, adventurer)
        ? undefined
        : slot === 'offHand' ? 'shield' : itemTypeOrder.find(key => itemTypes[key].slots.includes(slot));
    return h('div', null,
        h('div', {class: 'row'},
            h('h3', {class: 'grow', style: 'margin:0'}, 'Options'),
            craftType ? h('button', {class: 'btn small', onclick: () => {
                const bench = ctx.ui.bench;
                bench.itemType = craftType;
                bench.base = bench.base.filter(m => getBaseStats(requireMaterial(m), craftType));
                ctx.ui.benchOpen = true;
                // On narrow screens the bench takes the whole view, so everything else closes.
                if (matchMedia('(max-width: 760px)').matches) {
                    ctx.ui.panel = null;
                    ctx.ui.picker = null;
                    ctx.ui.shopOpen = false;
                    ctx.ui.materialDetail = null;
                }
                ctx.refresh();
            }}, '+ Craft new') : null,
        ),
        h('div', {class: 'list', style: 'margin-top:6px'},
            current ? h('div', {class: 'row'},
                h('span', {class: 'grow small muted'}, 'Currently wearing ' + (resolveItemRef(state, current)?.name ?? 'an item')),
                h('button', {class: 'btn small', onclick: () => { unequip(state, adventurer, slot); ctx.refresh(); }}, 'Take off'),
            ) : null,
            options.length ? options.map(option => {
                const crafted = option.ref.kind === 'crafted' ? state.craftedItems.find(c => c.id === (option.ref as {id: string}).id) : undefined;
                const pick = h('button', {
                class: 'item gearopt' + (crafted ? ' grow' : ''),
                'data-guide': crafted && canEquipInSlot(state, adventurer, option.ref, slot) ? 'equip' : undefined,
                id: option.ref.kind === 'material' ? 'gearopt-' + option.ref.key : undefined,
                disabled: !canEquipInSlot(state, adventurer, option.ref, slot),
                onclick: () => {
                    if (equip(state, adventurer, option.ref, slot)) {
                        ctx.ui.selectedSlot = null;
                        state.guide = {...state.guide, manualEquip: true};
                    }
                    ctx.refresh();
                },
            }, h('span', {class: 'rowart listart'}, crafted ? itemArt(crafted.itemType, crafted.base) : option.ref.kind === 'material' ? materialIcon(option.ref.key, 'typeart') : null),
            h('span', {class: 'grow'},
                h('div', null, option.name, h('span', {class: 'muted small'}, ' · ' + option.note),
                    levelTag(itemLevelRequirement(state, option.ref), effectiveLevel(adventurer))),
                h('div', {class: 'mods'}, itemStatsText(option.stats)),
                signatureLine(option.ref),
                deltaLine(state, adventurer, slot, option.ref),
            ));
                const recraft = crafted ? recipeButton(ctx, crafted) : null;
                return recraft ? h('div', {class: 'row memberrow equiprow'}, pick, recraft) : pick;
            }) : h('div', {class: 'muted small'}, slot === 'offHand' && isTwoHandedWielded(state, adventurer)
                ? 'Two-handed weapons use both hands.'
                : hasBench(state) ? 'Nothing fits this slot yet. Craft one at the crafting bench.' : 'Nothing fits this slot yet. The merchant sells gear.'),
            hasBench(state) ? null : h('button', {class: 'btn small', onclick: () => { ctx.ui.selectedSlot = null; ctx.ui.benchOpen = false; ctx.ui.shopOpen = true; ctx.refresh(); }}, 'Visit the merchant'),
        ),
    );
}

// ---------------- Merchant ----------------

function shopPanel(ctx: Ctx): HTMLElement {
    const {state} = ctx;
    const hero = currentHero(ctx);
    const benchCard = hasBench(state) ? null : h('div', {class: 'shopbench'},
        h('div', {class: 'grow'},
            h('div', null, h('strong', null, 'Crafting bench')),
            h('div', {class: 'small muted'}, 'Make your own gear from the materials your heroes bring back, built for exactly what you need.'),
        ),
        h('button', {
            class: 'btn primary',
            'data-guide': 'bench',
            disabled: state.gold < BENCH_PRICE,
            title: state.gold < BENCH_PRICE ? `Needs ${BENCH_PRICE} gold` : undefined,
            onclick: () => { if (buyBench(state)) { ctx.ui.shopOpen = false; ctx.ui.benchOpen = true; } ctx.refresh(); },
        }, `Buy · ${BENCH_PRICE} gold`),
    );
    if (!hero) {
        return panelShell(ctx, 'left', 'Merchant', 'Ready-made gear', benchCard, h('div', {class: 'muted small'}, 'Hire a member to see gear for them.'));
    }
    const stock = shopStock(state, hero);
    const refresh = shopRefreshCost(state, hero);
    // Once Buy + equip is offered, it is the main action and plain Buy steps back.
    const canEquip = !!(state.guide?.manualEquip || state.guide?.crafted);
    const now = performance.now();
    const arrivals = trackShopArrivals(hero.id, stock, now);
    // A sold slot keeps its card for a moment, then its replacement slides in over it.
    if (stock.some(o => o?.sold) && !shopRestockTimer) {
        const heroId = hero.id;
        shopRestockTimer = window.setTimeout(() => {
            shopRestockTimer = 0;
            const who = ctx.state.adventurers.find(a => a.id === heroId);
            if (who && restockSold(ctx.state, who)) ctx.refresh();
        }, SHOP_SOLD_MS);
    }
    // Taps on a card that is still sliding in (or just landed) are ignored, so a quick second tap on
    // Buy can't buy its replacement.
    const guarded = (index: number) => {
        const a = shopSeen?.arrivals[index];
        return !!a && performance.now() < a.start + SHOP_SLIDE_MS + SHOP_GUARD_MS;
    };
    const buy = (index: number, slot?: SlotKey) => {
        if (guarded(index)) return;
        const bought = buyShopItem(state, hero, index);
        if (typeof bought === 'string') ctx.toast(bought);
        else if (slot) equip(state, hero, {kind: 'crafted', id: bought.id}, slot);
        if (ctx.ui.shopDetail === index) ctx.ui.shopDetail = null;
        ctx.refresh();
    };
    const need = (offer: ShopItem) => levelForPower(Math.max(1, ...offer.base.map(k => requireMaterial(k).power)));
    const asItem = (offer: ShopItem): CraftedItem => ({id: 'offer', itemType: offer.itemType, name: offer.name, base: offer.base, decorations: offer.decorations, power: offer.power});

    // One fixed-size card. Long stats are cut to one line; tapping the card shows everything.
    const card = (offer: ShopItem | null, index: number, extra = ''): HTMLElement => {
        if (!offer) return h('div', {class: 'shopcard empty' + extra}, h('div', {class: 'muted small'}, 'Nothing here right now.'));
        const item = asItem(offer);
        const lv = need(offer);
        const affordable = state.gold >= offer.price && hero.level >= lv;
        const best = offer.sold ? null : bestDelta(state, hero, itemTypes[offer.itemType].slots, item);
        const buttons = offer.sold ? [h('span', {class: 'soldtag'}, `Sold · ${offer.price}g`)] : [
            canEquip && best ? h('button', {
                class: 'btn small primary',
                'data-guide': affordable ? 'buy' : undefined,
                disabled: state.gold < offer.price || hero.level < lv,
                title: hero.level < lv ? `${hero.name} needs level ${lv}` : state.gold < offer.price ? `Needs ${offer.price} gold` : `Buy for ${offer.price} gold and equip in ${hero.name}'s ${slotNames[best.slot].toLowerCase()}`,
                onclick: (ev: MouseEvent) => { ev.stopPropagation(); buy(index, best.slot); },
            }, `Buy + equip · ${offer.price}g`) : null,
            h('button', {
                class: 'btn small' + (canEquip ? '' : ' primary'),
                'data-guide': affordable && !canEquip ? 'buy' : undefined,
                disabled: state.gold < offer.price,
                title: state.gold < offer.price ? `Needs ${offer.price} gold` : `Buy for ${offer.price} gold`,
                onclick: (ev: MouseEvent) => { ev.stopPropagation(); buy(index); },
            }, canEquip ? 'Buy' : `Buy · ${offer.price}g`),
        ];
        return h('div', {
            class: 'shopcard' + (offer.sold ? ' sold' : '') + extra,
            role: offer.sold ? undefined : 'button',
            tabindex: offer.sold ? undefined : '0',
            title: offer.sold ? undefined : 'Show details',
            onclick: offer.sold ? undefined : () => { if (!guarded(index)) { ctx.ui.shopDetail = index; ctx.refresh(); } },
        },
            h('span', {class: 'rowart'}, itemArt(offer.itemType, offer.base)),
            h('div', {class: 'shopinfo'},
                h('div', {class: 'line name'}, offer.name, h('span', {class: 'muted'}, ` · ${itemTypes[offer.itemType].name}`), levelTag(lv, hero.level)),
                h('div', {class: 'line mods'}, itemStatsText(getCraftedItemStats(item))),
                h('div', {class: 'line mats'}, ...offer.base.map(k => h('span', {class: 'maticon', title: requireMaterial(k).name}, materialIcon(k))),
                    ...(offer.decorations.length ? [h('span', {class: 'matsep', 'aria-hidden': 'true'}, '·'), ...offer.decorations.map(k => h('span', {class: 'maticon', title: `${requireMaterial(k).name} (decoration)`}, materialIcon(k)))] : [])),
                best ? best.el : h('div', {class: 'line'}),
            ),
            h('div', {class: 'shopacts'}, ...buttons),
        );
    };
    const slots = stock.map((offer, index) => {
        const a = arrivals[index];
        if (!a) return h('div', {class: 'shopslot'}, card(offer, index));
        // Still arriving: the old card stays underneath while the new one slides over it. A card
        // re-rendered mid-slide picks up where it was (negative delay).
        const el = card(offer, index, ' arrive');
        el.style.animationDelay = `${Math.round(a.start - now)}ms`;
        return h('div', {class: 'shopslot'}, a.prev ? card(a.prev, index, ' under') : null, el);
    });

    // Details for one offer: full stats, materials and a comparison (with Buy + equip) per slot.
    const detailIndex = ctx.ui.shopDetail;
    const detailOffer = detailIndex != null ? stock[detailIndex] : null;
    if (detailIndex != null && (!detailOffer || detailOffer.sold)) ctx.ui.shopDetail = null;
    const closeDetail = () => { ctx.ui.shopDetail = null; ctx.refresh(); };
    const detail = detailOffer && !detailOffer.sold && detailIndex != null ? (() => {
        const offer = detailOffer, item = asItem(offer), lv = need(offer);
        let placed = false;
        const deltas = deltaLines(state, hero, itemTypes[offer.itemType].slots, item, slot => {
            if (!canEquip) return null;
            const btn = h('button', {
                class: 'btn small primary',
                disabled: state.gold < offer.price || hero.level < lv,
                title: hero.level < lv ? `${hero.name} needs level ${lv}` : `Buy for ${offer.price} gold and equip in ${hero.name}'s ${slotNames[slot].toLowerCase()}`,
                onclick: () => buy(detailIndex, slot),
            }, `Buy + equip · ${offer.price}g`);
            placed = true;
            return btn;
        });
        return h('div', {class: 'shoppop-back', onclick: (ev: MouseEvent) => { if (ev.target === ev.currentTarget) closeDetail(); }},
            h('div', {class: 'shoppop', role: 'dialog', 'aria-label': offer.name},
                h('div', {class: 'row'},
                    h('span', {class: 'rowart'}, itemArt(offer.itemType, offer.base)),
                    h('div', {class: 'grow'}, h('strong', null, offer.name), h('span', {class: 'muted small'}, ` · ${itemTypes[offer.itemType].name}`), levelTag(lv, hero.level)),
                    h('button', {class: 'dropclose soldclose', 'aria-label': 'Close', title: 'Close', onclick: closeDetail}, '×'),
                ),
                h('div', {class: 'mods'}, itemStatsText(getCraftedItemStats(item))),
                h('div', {class: 'mods'}, 'Made from ', ...madeFromList(ctx, offer.base, offer.decorations)),
                deltas,
                h('div', {class: 'row', style: 'margin-top:8px;justify-content:flex-end'},
                    h('button', {class: 'btn small' + (placed ? '' : ' primary'), disabled: state.gold < offer.price, onclick: () => buy(detailIndex)}, `Buy · ${offer.price}g`)),
            ));
    })() : null;

    return panelShell(ctx, 'left', 'Merchant', `Gear for ${hero.name}, level ${hero.level} ${classes[hero.classKey].name}`,
        benchCard,
        h('div', {class: 'shopwrap'},
            h('div', {class: 'row'},
                h('h3', {class: 'grow', style: 'margin:0'}, `For ${hero.name}`),
                h('button', {
                    class: 'btn small',
                    disabled: state.gold < refresh,
                    title: refresh ? `Replace every item for ${refresh} gold` : `Free: ${hero.name} leveled up while you were browsing, so this restock costs nothing`,
                    onclick: () => { refreshShop(state, hero); ctx.ui.shopDetail = null; ctx.refresh(); },
                }, refresh ? `New stock · ${refresh} gold` : 'New stock · free'),
            ),
            h('p', {class: 'muted small', style: 'margin:4px 0 6px'}, `Each member gets their own stock, scaled to their level and leaning on their class's stats. A bought item is replaced a moment later. Tap an item for details. Pick a member at the top to see their stock.`),
            h('div', {class: 'list shoplist'}, ...slots),
            detail,
        ),
    );
}

// Merchant cards slide in whenever a slot's offer changes while the merchant is open (a sale's
// replacement, New stock, a level-up restock). Opening the merchant or switching heroes shows the
// stock as it is, with no slide.
const SHOP_SOLD_MS = 1500, SHOP_SLIDE_MS = 350, SHOP_STAGGER_MS = 90, SHOP_GUARD_MS = 500;
let shopRestockTimer = 0;
let shopSeen: {heroId: string, keys: string[], offers: (ShopItem | null)[], seenAt: number, arrivals: Record<number, {start: number, prev: ShopItem | null}>} | null = null;
function trackShopArrivals(heroId: string, stock: (ShopItem | null)[], now: number): Record<number, {start: number, prev: ShopItem | null}> {
    const id = (o: ShopItem | null) => o ? [o.itemType, o.name, ...o.base, '|', ...o.decorations, o.price].join(',') : '-';
    const keys = stock.map(id);
    // Panels re-render every 0.4s while open, so a longer gap means the merchant was just opened.
    if (!shopSeen || shopSeen.heroId !== heroId || now - shopSeen.seenAt > 1500) {
        shopSeen = {heroId, keys, offers: stock.map(o => o ? {...o} : null), seenAt: now, arrivals: {}};
    } else {
        let n = 0;
        keys.forEach((k, i) => {
            if (k !== shopSeen!.keys[i]) shopSeen!.arrivals[i] = {start: now + SHOP_STAGGER_MS * n++, prev: shopSeen!.offers[i]};
        });
        shopSeen.keys = keys;
        shopSeen.offers = stock.map(o => o ? {...o} : null);
        shopSeen.seenAt = now;
    }
    for (const [i, a] of Object.entries(shopSeen.arrivals)) if (now > a.start + SHOP_SLIDE_MS + SHOP_GUARD_MS) delete shopSeen.arrivals[Number(i)];
    const live: Record<number, {start: number, prev: ShopItem | null}> = {};
    for (const [i, a] of Object.entries(shopSeen.arrivals)) if (now < a.start + SHOP_SLIDE_MS) live[Number(i)] = a;
    return live;
}

// ---------------- Travelling peddler ----------------

export function clock(seconds: number): string {
    const s = Math.max(0, Math.ceil(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function peddlerPanel(ctx: Ctx): HTMLElement {
    const {state} = ctx;
    const p = state.peddler;
    const here = peddlerHere(state);
    const subtitle = !p ? `Visits after the first full clear of ${quests[PEDDLER_UNLOCK.slice(6)].name}`
        : here ? `Here for another ${clock(p.leavesAt! - state.time)}`
        : `Away · back in ${clock(p.nextVisit - state.time)}`;
    const holds = p?.stock.filter(o => o.held && !o.sold).length ?? 0;
    const nextHold = holdCost(state);
    const offers = (p?.stock ?? []).map((offer, index) => ({offer, index})).filter(({offer}) => here || offer.held);
    // "Rare", "Premium common", "Mythic"...
    const tierTag = (offer: NonNullable<typeof p>['stock'][number]) => isPremium(offer.material) ? `Premium ${tierNames[offer.tier].toLowerCase()}` : tierNames[offer.tier];
    return shell(ctx, 'Travelling peddler', subtitle,
        h('p', {class: 'muted small', style: 'margin:0 0 8px'},
            `Stays for ${VISIT_SECONDS / 60} minutes, or until sold out, and comes back ${VISIT_GAP[0] / 60} to ${VISIT_GAP[1] / 60} minutes of play after leaving. Sells one of each material from the quests you have unlocked, including ones you haven't found. `
            + `Materials found fewer than ${RARE_FOUND} times cost 50% more. Hold an offer to keep it for the next visit: the first hold costs ${HOLD_BASE} gold and each one after doubles. Releasing is free.`),
        offers.length ? h('div', {class: 'list'}, ...offers.map(({offer, index}) => {
            const m = requireMaterial(offer.material);
            const price = offerPrice(state, offer);
            const found = state.obtained[offer.material] ?? 0;
            return h('div', {class: 'craftedrow' + (offer.sold ? ' sold' : '')}, h('div', {class: 'row small'},
                h('div', {class: 'grow'},
                    h('div', null, materialLink(ctx, offer.material)),
                    h('div', {class: 'mods'}, `${tierTag(offer)} · power ${m.power} · ${found} found · ${state.materials[offer.material] ?? 0} owned`
                        + (offer.held ? (here ? ' · held' : ' · held for the next visit') : '')),
                ),
                offer.sold ? h('span', {class: 'muted'}, 'Sold') : null,
                offer.sold ? null : offer.held
                    ? h('button', {class: 'btn small', title: here ? 'Stop holding it; it can be replaced on the next visit' : 'Stop holding it; the peddler is away, so it leaves the stock now', onclick: () => { releaseOffer(state, index); ctx.refresh(); }}, 'Release')
                    : h('button', {
                        class: 'btn small',
                        disabled: state.gold < nextHold,
                        title: state.gold < nextHold ? `Needs ${nextHold} gold` : `Keep it in stock for the next visit, for ${nextHold} gold`,
                        onclick: () => { const err = holdOffer(state, index); if (err) ctx.toast(err); ctx.refresh(); },
                    }, `Hold · ${nextHold}g`),
                offer.sold || !here ? null : h('button', {
                    class: 'btn small primary',
                    disabled: !here || state.gold < price,
                    title: !here ? 'The peddler is away' : state.gold < price ? `Needs ${price} gold` : `Buy for ${price} gold`,
                    onclick: () => {
                        const err = buyOffer(state, index);
                        if (err) ctx.toast(err);
                        ctx.refresh();
                    },
                }, `Buy · ${price}g`),
            ));
        })) : h('div', {class: 'muted small'}, here ? 'Sold out.' : 'Nothing held for the next visit.'),
        holds ? h('p', {class: 'muted small', style: 'margin:8px 0 0'}, `${holds} held. The next hold costs ${nextHold} gold.`) : null,
    );
}

// ---------------- Quest ----------------

// The area's punishing rules, if it has any.
// The final boss's mechanics, for every monster in the quest that has them.
function bossMechanics(quest: QuestDef): HTMLElement[] {
    const keys = [...new Set(quest.encounters.flatMap(e => e.monsters))];
    const out: HTMLElement[] = [];
    for (const key of keys) {
        const m = monsters[key];
        if (m.shatter) {
            const at = m.shatter.at.map(x => `${Math.round(100 * x)}%`).join(', ').replace(/, ([^,]*)$/, ' and $1');
            out.push(h('div', null, h('strong', null, `${m.name}: Shatter. `), `At ${at} life, ${m.shatter.count} ${monsters[m.shatter.shard].name}s rise in front of him, and he takes ${Math.round(100 * m.shatter.damageTaken)}% damage until they fall.`));
        }
        if (m.risingWill) {
            out.push(h('div', null, h('strong', null, `${m.name}: Rising will. `), `Every ${m.risingWill.every} seconds of the fight his damage and attack speed grow by ${Math.round(100 * m.risingWill.growth)}%${m.risingWill.heal ? `, and he heals ${Math.round(100 * m.risingWill.heal)}% of his life` : ''}.`));
        }
    }
    return out;
}

function areaRules(quest: QuestDef, state?: GameState): HTMLElement | null {
    if (quest.portal && state) {
        const left = portalSecondsLeft(state);
        return h('div', {class: 'arearules'}, ...bossMechanics(quest), left > 0
            ? h('div', null, h('strong', null, 'Portal open. '), `It closes in ${clock(left)} of play, and everyone here is recalled. Completing the Oracle's Rite in the Sundered Sanctum again adds ${PORTAL_SECONDS / 60} minutes.`)
            : h('div', null, h('strong', null, 'Portal closed. '), 'Complete the Oracle\'s Rite in the Sundered Sanctum to open it.'));
    }
    if (!quest.rules?.length) return null;
    return h('div', {class: 'arearules'}, ...quest.rules.map(r => h('div', null, h('strong', null, ruleInfo[r].name + '. '), ruleInfo[r].text)));
}

// The quests the < and > buttons on the quest panel cycle through: every open one, in map order.
function availableQuests(state: GameState): string[] {
    return questOrder.filter(k => !quests[k].endless && quests[k].mapPosition
        && (isQuestUnlocked(state, k) || isQuestUnlocked(state, endlessKey(k))));
}
// Adds < and > around the quest panel's title to step through the open quests.
function questNav(ctx: Ctx, questKey: string, panel: HTMLElement): HTMLElement {
    const list = availableQuests(ctx.state);
    const at = list.indexOf(questKey);
    const step = (d: number) => {
        const from = at < 0 ? 0 : at;
        ctx.ui.panel = {kind: 'quest', key: list[(from + d + list.length) % list.length]};
        ctx.refresh();
    };
    const off = list.length < 2;
    const title = panel.querySelector('.panel-head h2');
    if (title) {
        const row = h('div', {class: 'questnav'},
            h('button', {class: 'btn small navbtn', disabled: off, 'aria-label': 'Previous quest', title: 'Previous quest', onclick: () => step(-1)}, '<'),
            title.cloneNode(true),
            h('button', {class: 'btn small navbtn', disabled: off, 'aria-label': 'Next quest', title: 'Next quest', onclick: () => step(1)}, '>'),
        );
        title.replaceWith(row);
    }
    return panel;
}

function questPanel(ctx: Ctx, questKey: string): HTMLElement {
    const {state, ui} = ctx;
    const quest = quests[questKey];
    const progress = getQuestProgress(state, questKey);
    const unlocked = isQuestUnlocked(state, questKey);
    const hero = currentHero(ctx)!;
    // The hero's modifiers plus the challenges their run takes on (Endless trial, the Void).
    const heroMods = [...getActiveModifiers(state, hero, quest), ...challengeKeys(state, hero, quest)];
    // A hidden legendary slot can't stay selected (an older view may have picked it).
    const bossKnown = !!quest.boss && (!!progress.bossFought || (state.obtained[quest.boss.legendary] ?? 0) > 0);
    const selected = Math.min(ui.selectedEncounter[questKey] ?? 0, quest.encounters.length - (bossKnown ? 0 : 1));

    const endlessQuest = quests[endlessKey(questKey)];
    const endlessOpen = !!endlessQuest && isQuestUnlocked(state, endlessQuest.key);
    if (!unlocked && endlessOpen) {
        // A portal area whose portal is closed: its Endless mode stays open.
        return shell(ctx, `${quest.name}: Endless`, 'The portal is closed, but Endless stays open: it gives no items, gold or XP, and only records depth. Complete the Oracle\'s Rite in the Sundered Sanctum to reopen the portal for normal runs.',
            hero ? h('div', {class: 'forhero muted small'}, `For ${hero.name}, level ${hero.level} ${classes[hero.classKey].name} · ${activityText(state, hero)}`) : null,
            ...endlessBody(ctx, quest, hero));
    }
    if (!unlocked) {
        return questNav(ctx, questKey, shell(ctx, quest.name, 'Locked', h('p', null, quest.description),
            quest.portal ? areaRules(quest, state) : h('p', null, !unlockMet(state.achievements, quest)
                ? `Opens after the first full clear of ${unlockQuestNames(quest)}.`
                : `Unlocks at ${quest.fameToUnlock} fame. You have ${state.fame}. Clearing quests earns trophies, and trophies grant fame.`)));
    }

    // The ambition boss stays hidden until someone has fought it (or its legendary is owned).
    const track = h('div', null,
        h('h3', null, 'Encounters'),
        h('div', {class: 'track'},
            ...quest.encounters.map((encounter, i) => h('button', {
                class: ['enc', encounter.tier,
                    i <= progress.bestEncounter ? 'cleared' : '',
                    i === selected ? 'selected' : ''].filter(Boolean).join(' '),
                title: `Encounter ${i + 1} · ${tierNames[encounter.tier]}` + (progress.seen.includes(i) ? encounterThreats(quest, i, heroMods).map(t => ' · ' + t.label).join('') : ''),
                'aria-label': `Encounter ${i + 1}, ${tierNames[encounter.tier]}`,
                onclick: () => { ui.selectedEncounter[questKey] = i; ctx.refresh(); },
            }, encounter.tier)),
            // The ambition boss: fought after a full clear, so it sits apart at the end of the track.
            bossKnown && quest.boss ? h('button', {
                class: ['enc', 'L', 'legendary', selected === quest.encounters.length ? 'selected' : ''].filter(Boolean).join(' '),
                title: `Legendary encounter · ${monsters[quest.boss.monster].name}, after a full clear, for adventurers with the ambition to face it`,
                'aria-label': `Legendary encounter, ${monsters[quest.boss.monster].name}`,
                onclick: () => { ui.selectedEncounter[questKey] = quest.encounters.length; ctx.refresh(); },
            }, 'L') : null,
        ),
        h('div', {class: 'track-legend'},
            h('span', null, 'Start'),
            h('span', null, 'Set where each adventurer turns back from their run panel'),
        ),
    );

    const bossSlot = bossKnown && selected === quest.encounters.length;
    const bossSeen = progress.seen.includes(quest.encounters.length - 1) || !!progress.legendaryRevealed || (quest.boss ? (state.obtained[quest.boss.legendary] ?? 0) > 0 : false);
    const detail = encounterDetail(ctx, quest, selected, heroMods, hero, bossSlot ? bossSeen : progress.seen.includes(selected));

    const pools = h('div', null,
        h('h3', null, 'Reward pools'),
        h('div', {class: 'pools'},
            ...(['C', 'U', 'R', 'M'] as Tier[]).filter(t => quest.pools[t].length).map(tier => {
                const pool = quest.pools[tier];
                const revealed = progress.revealed[tier];
                const hidden = pool.length - revealed.length;
                return h('div', {class: 'pool'},
                    h('div', null, h('span', {class: 'tag ' + tier}, tier), ' ', tierNames[tier]),
                    ...pool.filter(e => revealed.includes(e.material)).map(e => h('div', null,
                        materialLink(ctx, e.material),
                        // Drops are one at a time, so a plain ×1 is left off.
                        e.min === 1 && e.max === 1 ? null : h('span', {class: 'muted num'}, e.min === e.max ? ` ×${e.min}` : ` ×${e.min}-${e.max}`),
                    )),
                    hidden ? h('div', {class: 'hidden'}, `${'? '.repeat(hidden).trim()}`) : h('div', {class: 'muted small'}, 'All found'),
                    tier === 'M' && !revealed.length ? h('div', {class: 'muted small'}, 'Only from rarity upgrades on rare drops') : null,
                );
            }),
            bossKnown && quest.boss ? h('div', {class: 'pool'},
                h('div', null, h('span', {class: 'tag L'}, 'L'), ' Legendary'),
                (state.obtained[quest.boss.legendary] ?? 0) > 0 || progress.legendaryRevealed ? h('div', null, materialLink(ctx, quest.boss.legendary)) : h('div', {class: 'hidden'}, '?'),
                h('div', {class: 'muted small'}, `Only from ${monsters[quest.boss.monster].name}, who appears for adventurers with the ambition to defeat it, once each`),
            ) : null,
        ),
    );

    // Normal and Endless share the panel: a tab picks which one it shows.
    const tab = endlessOpen && ui.questTab?.[questKey] === 'endless' ? 'endless' : 'normal';
    const setTab = (t: 'normal' | 'endless') => { ui.questTab = {...ui.questTab, [questKey]: t}; ctx.refresh(); };
    const tabs = endlessQuest ? h('div', {class: 'seg wide', role: 'group', 'aria-label': 'Quest mode'},
        h('button', {class: tab === 'normal' ? 'on' : '', 'aria-pressed': tab === 'normal' ? 'true' : 'false', onclick: () => setTab('normal')}, 'Normal'),
        h('button', {class: tab === 'endless' ? 'on' : '', 'aria-pressed': tab === 'endless' ? 'true' : 'false', disabled: !endlessOpen,
            title: endlessOpen ? 'How deep can an adventurer get?' : `Opens after the first full clear of ${quest.name}`,
            onclick: () => setTab('endless')}, endlessOpen ? 'Endless' : 'Endless (locked)'),
    ) : null;

    const fee = getEntryFee(quest, heroMods);
    const assigned = hero?.assignment?.questKey === questKey;
    const elsewhere = hero?.assignment && !assigned ? quests[hero.assignment.questKey].name : null;
    // The selected hero (picked in the HUD) is who this panel plans for. Each keeps their own modifiers.
    const picker = hero ? h('div', {class: 'forhero muted small'},
        `For ${hero.name}, level ${hero.level} ${classes[hero.classKey].name} · ${activityText(state, hero)}`) : null;
    const actions = h('div', {class: 'row'},
        assigned
            ? h('button', {class: 'btn', onclick: () => { recall(state, hero); ctx.refresh(); }}, `Recall ${hero.name}`)
            : h('button', {class: 'btn primary', 'data-guide': 'send', disabled: !hero, onclick: () => { assignQuest(state, hero, questKey); showRun(ui, hero.id, state); ctx.refresh(); }}, `Send ${hero?.name ?? ''}`),
        h('span', {class: 'muted small grow'}, [
            fee ? `Entry fee ${fee} gold per run` : 'No entry fee',
            elsewhere ? `${hero!.name} will leave ${elsewhere}` : '',
        ].filter(Boolean).join(' · ')),
    );

    const record = h('div', {class: 'statgrid small'},
        statRow('Runs', progress.runs),
        statRow('Full clears', progress.fullClears),
        statRow('Best', progress.bestEncounter >= 0 ? `encounter ${progress.bestEncounter + 1}` : 'none'),
    );

    const log = h('div', null,
        h('h3', null, 'Recent results'),
        progress.log.length
            ? h('div', {class: 'log'}, ...progress.log.slice(0, 12).map(entry => h('div', {class: entry.kind}, entry.text)))
            : h('div', {class: 'muted small'}, 'No runs yet.'),
    );

    if (tab === 'endless') {
        return shell(ctx, `${quest.name}: Endless`, `How deep can an adventurer get? No items, gold or XP: it only records depth.`, tabs, picker, ...endlessBody(ctx, quest, hero));
    }
    return questNav(ctx, questKey, withClearFlag(hero, questKey, shell(ctx, quest.name, quest.description, tabs, areaRules(quest, state), picker, actions, hero && (isQuestCleared(state, quest.key) || grantedModifiers(state, hero, quest.key).length) ? modifiersSection(ctx, quest, hero) : null, track, detail, pools, record,
        endlessOpen ? null : h('p', {class: 'muted small'}, `Endless opens after the first full clear of ${quest.name}.`), log)));
}

// A small blue banner for a quest the selected hero has fully cleared at least once.
export function heroCleared(hero: Adventurer | undefined, questKey: string): boolean {
    return !!hero && hero.records?.modClears?.[questKey] !== undefined;
}
export function clearFlag(hero: Adventurer): HTMLElement {
    const el = h('span', {class: 'clearflag', role: 'img', 'aria-label': `${hero.name} has cleared this`, title: `${hero.name} has cleared this quest`});
    el.innerHTML = '<svg viewBox="0 0 16 22" aria-hidden="true"><path class="pole" d="M2.5 1v20"/><path class="cloth" d="M3.5 2h10v13l-5-3-5 3z"/><path class="stripe" d="M3.5 5h10"/></svg>';
    return el;
}
function withClearFlag(hero: Adventurer | undefined, questKey: string, panel: HTMLElement): HTMLElement {
    if (hero && heroCleared(hero, questKey)) panel.querySelector('.panel-head h2')?.append(clearFlag(hero));
    return panel;
}

// One encounter's monsters and difficulty, as the hero would face them.
// The legendary slot (index = encounters.length) shows the ambition boss alone, on the final
// encounter's baseline, which is how the run fights it.
function encounterDetail(ctx: Ctx, quest: QuestDef, selected: number, heroMods: string[], hero: Adventurer | undefined, seen: boolean): HTMLElement {
    const {state} = ctx;
    const boss = quest.boss && selected === quest.encounters.length ? quest.boss.monster : undefined;
    const index = boss ? quest.encounters.length - 1 : selected;
    const encounter = quest.encounters[index];
    const lineup = boss ? [boss] : encounterLineup(quest, index, heroMods);
    const threats = seen ? encounterThreats(quest, index, heroMods, boss ? lineup : undefined) : [];
    // Sprites match the fight view: a rare's or boss's lead keeps full size beside its minions.
    const layout = fightLayout(lineup, !!boss || encounter.tier === 'R');
    const riteDef = boss ? quest.modifiers.find(d => d.rite) : undefined;
    const rite = riteDef?.rite;
    return h('div', null,
        h('h3', null, boss ? `Legendary encounter · ${monsters[boss].name}` : `${quest.endless ? 'Endless encounter' : 'Encounter'} ${selected + 1} · ${tierNames[encounter.tier]}`),
        boss ? h('p', {class: 'muted small'}, `Appears after a full clear, only for adventurers with the ambition to defeat it, once each.`) : null,
        threats.length ? h('div', {class: 'threats'}, ...threats.map(t => h('span', {class: 'threat ' + t.kind, title: t.hint}, t.label))) : null,
        h('div', {class: 'list'},
            seen ? lineup.map((key, slot) => monsterRow(key, heroMods, layout[slot].size)) : h('div', {class: 'muted small'}, boss
                ? `Not revealed yet. ${monsters[boss].name} shows itself once an adventurer reaches the final encounter.`
                : 'Not reached yet. Monsters are revealed when your adventurer gets here.'),
        ),
        // The Sanctum's rite boss also waits after a full clear (with the rite on), so it shares the slot.
        boss && rite && seen ? h('h3', null, `Rite boss · ${monsters[rite.boss].name}`) : null,
        boss && rite && seen ? h('p', {class: 'muted small'}, `Appears after a full clear with ${riteDef!.name} on, on top of the rite's own monster bonuses.`) : null,
        boss && rite && seen ? h('div', {class: 'list'}, monsterRow(rite.boss, [...heroMods.filter(k => k !== riteDef!.key), riteDef!.key], 96)) : null,
        h('div', {class: 'row small', style: 'margin-top:6px'},
            h('span', {class: 'grow muted'}, [
                `Level ${encounterLevel(quest, index)}`,
                `difficulty ${fmt(encounterPower(quest, index), 2)}`,
                `${lineup.length} monster${lineup.length > 1 ? 's' : ''}`,
                hero && !quest.endless ? xpNote(hero.name, hero.level, questXpLevel(quest), heroMods.filter(k => !challengeModifier(k)).length) : '',
            ].filter(Boolean).join(' · ')),
        ),
    );

    function monsterRow(key: string, mods: string[], size: number): HTMLElement {
        const m = getMonsterStats(quest, index, key, mods);
        const art = monsterArtUrl(key);
        const kit = monsterKit(key);
        // Abilities: each use's damage (with what modifiers add), and its cooldown in turns.
        const kitText = kit ? kit.map(k => {
            const shares: Partial<Record<DamageType, number>> = {};
            const tweak = k.damage ?? 1;
            for (const [t, v] of Object.entries(k.shares) as [DamageType, number][]) shares[t] = v * m.baseShare * tweak;
            if (kitHit(k) > 0) for (const [t, v] of Object.entries(m.addedTypes) as [DamageType, number][]) shares[t] = (shares[t] ?? 0) + v * tweak;
            const dmg = kitHit(k) > 0 ? damageSplitText(m.damage, shares) + (k.hits && k.hits > 1 ? ` over ${k.hits} hits` : '') : '';
            const amt = k.applies ? fmt(k.applies.amount * 100) : '';
            const ail = k.applies ? ({burn: 'burns', chill: `chills ${amt}%`, shock: `shocks ${amt}%`, weaken: `weakens ${amt}%`, snare: `snares ${amt}%`, blind: `blinds ${amt}%`, bleed: 'bleeds', sunder: `sunders ${amt}% armor`, gale: `cuts evasion ${amt}%`} as Record<string, string>)[k.applies.ailment] : '';
            const notes = [
                dmg, ail,
                k.accuracy !== undefined && k.accuracy !== 1 ? `${fmt(k.accuracy * 100)}% accuracy` : '',
                k.drain ? `heals itself ${fmt(k.drain * 100)}% of damage dealt` : '',
                k.heal ? `heals ${fmt(k.heal * 100)}% of its life` : '',
                k.buff ? ({guard: `takes ${fmt(k.buff.amount * 100)}% less damage for ${k.buff.turns ?? 2} turns`, evade: `${fmt(k.buff.amount * 100)}% more evasion for ${k.buff.turns ?? 2} turns`, ward: `ward of ${fmt(k.buff.amount * 100)}% of its life`})[k.buff.kind] : '',
                k.mimic ? 'becomes the damage type you deal most' : '',
                k.rally ? `the pack attacks ${fmt(k.rally.amount * 100)}% faster for ${k.rally.turns} turns` : '',
            ];
            return `${k.name}${k.basic ? '' : ` (every ${k.every} turns${k.spell ? ', spell' : ''})`}: ${notes.filter(Boolean).join(', ')}`;
        }).join(' · ') : '';
        const statsLine = h('span', {class: 'num muted'}, [
                kit ? `HP ${m.hp} · ${num(m.attacksPerSecond)} turns/s` : `HP ${m.hp} · hit ${damageSplitText(m.damage, m.damageTypes)} × ${num(m.attacksPerSecond)}/s`,
                kitText,
                `armor ${fmt(m.armor, 1)} · acc ${fmt(m.accuracy)} · eva ${fmt(m.evasion)}`,
                monsters[key]?.thorns ? `thorns ${monsters[key]!.thorns} ${monsters[key]!.thornsType ?? 'physical'} per hit taken` : '',
                monsters[key]?.summon ? `${monsters[key]!.summon!.name}: calls ${monsters[key]!.summon!.count} ${monsters[monsters[key]!.summon!.monster]?.name ?? 'adds'}${monsters[key]!.summon!.hp ? ` (${fmt(monsters[key]!.summon!.hp! * 100)}% life)` : ''} at ${monsters[key]!.summon!.at.map(a => fmt(a * 100) + '%').join(', ')} life` : '',
                ...(Object.entries(m.resist) as [string, number][]).map(([e, r]) => `${fmt(r * 100)}% ${e} res`),
                hero ? `${hero.name} lands ${num(expectedHits(getCachedStats(state, hero).accuracy, m.evasion))} hits per attack` : '',
            ].filter(Boolean).join(' · '));
        // Monsters with art show their sprite beside the name, with the stats under it.
        return art
            ? h('div', {class: 'row small monrow'},
                // The same size the fight view shows it at.
                h('img', {class: 'monart', src: art, alt: '', draggable: 'false', style: `--sprite:${size}px`}),
                h('div', {class: 'grow'}, h('div', {class: 'monname'}, m.name), statsLine))
            : h('div', {class: 'row small'}, h('span', {class: 'grow'}, monsterIcon(key), m.name), statsLine);
    }
}

function xpNote(name: string, heroLevel: number, level: number, modifierCount = 0): string {
    const mult = xpMultiplier(heroLevel, level, modifierCount);
    return mult >= 1 ? '' : mult <= 0 ? `no XP for ${name} (level ${heroLevel})` : `${name} gets ${num(mult * 100)}% XP`;
}

// The quest's endless variant: a paid attempt to see how deep an adventurer can get. No modifiers,
// no rewards; the track pages through its repeating pattern ten encounters at a time.
function endlessBody(ctx: Ctx, quest: QuestDef, hero: Adventurer | undefined): (HTMLElement | null)[] {
    const {state, ui} = ctx;
    const key = endlessKey(quest.key);
    const endless = quests[key];
    const progress = getQuestProgress(state, key);
    const on = hero?.assignment?.questKey === key;
    const elsewhere = hero?.assignment && !on ? quests[hero.assignment.questKey].name : null;
    const records = state.adventurers
        .map(a => ({a, best: a.endlessBest?.[quest.key] ?? -1}))
        .filter(r => r.best >= 0)
        .sort((x, y) => y.best - x.best);
    const actions = h('div', {class: 'row'},
        on
            ? h('button', {class: 'btn', onclick: () => { recall(state, hero!); ctx.refresh(); }}, `Recall ${hero!.name}`)
            : h('button', {
                class: 'btn primary',
                disabled: !hero || state.gold < endless.entryFee,
                onclick: () => { assignQuest(state, hero!, key); showRun(ui, hero!.id, state); ctx.refresh(); },
            }, `Send ${hero?.name ?? ''} into the endless`),
        h('span', {class: 'muted small grow'}, [
            `${endless.entryFee} gold per attempt`,
            !on && hero && state.gold < endless.entryFee ? `you have ${state.gold}` : '',
            elsewhere ? `${hero!.name} will leave ${elsewhere}` : '',
        ].filter(Boolean).join(' · ')),
    );
    const about = h('p', {class: 'muted small', style: 'margin:0'}, `${quest.name}'s monsters, starting at this quest's opening difficulty and growing ${num(ENDLESS_GROWTH * 100)}% stronger every encounter, and ${num(ENDLESS_STEP)}× stronger again every ${ENDLESS_PATTERN.length}. Quest modifiers don't apply. One attempt per ${endless.entryFee} gold, until the adventurer falls or is recalled.`);

    // The selected encounter, by default the next one past the guild's best.
    const block = ENDLESS_PATTERN.length;
    const selected = Math.min(endless.encounters.length - 1, ui.selectedEncounter[key] ?? Math.max(0, progress.bestEncounter + 1));
    const start = selected - selected % block;
    const select = (i: number) => { ui.selectedEncounter[key] = Math.max(0, Math.min(endless.encounters.length - 1, i)); ctx.refresh(); };
    const trophy = trophies['endless-' + quest.key];
    const targets = new Set(trophy?.tiers.map(t => t.target - 1) ?? []);
    const track = h('div', null,
        h('div', {class: 'row'},
            h('h3', {class: 'grow', style: 'margin:0'}, `Encounters ${start + 1}–${start + block}`),
            h('button', {class: 'btn small', disabled: start === 0, 'aria-label': 'Previous ten encounters', onclick: () => select(start - block)}, '‹'),
            h('button', {class: 'btn small', onclick: () => select(Math.max(0, progress.bestEncounter + 1)), title: 'Jump to the next encounter past the guild best'}, 'Best'),
            h('button', {class: 'btn small', disabled: start + block >= endless.encounters.length, 'aria-label': 'Next ten encounters', onclick: () => select(start + block)}, '›'),
        ),
        h('div', {class: 'track'},
            ...endless.encounters.slice(start, start + block).map((encounter, k) => {
                const i = start + k;
                return h('button', {
                    class: ['enc', encounter.tier, i <= progress.bestEncounter ? 'cleared' : '', i === selected ? 'selected' : '', targets.has(i) ? 'goal' : ''].filter(Boolean).join(' '),
                    title: `Endless encounter ${i + 1} · ${tierNames[encounter.tier]}${targets.has(i) ? ' · trophy goal' : ''}`,
                    'aria-label': `Endless encounter ${i + 1}, ${tierNames[encounter.tier]}`,
                    onclick: () => select(i),
                }, encounter.tier);
            }),
        ),
        h('div', {class: 'track-legend'},
            h('span', null, `${start + 1}`),
            h('span', null, progress.bestEncounter >= 0 ? `Guild best: ${progress.bestEncounter + 1}` : 'No attempts yet'),
            h('span', null, `${start + block}`),
        ),
    );
    const detail = encounterDetail(ctx, endless, selected, [], hero, true);
    const record = h('div', {class: 'statgrid small'},
        statRow('Attempts', progress.runs),
        statRow('Guild best', progress.bestEncounter >= 0 ? `encounter ${progress.bestEncounter + 1}` : 'none'),
        ...records.map(r => statRow(r.a.name, `encounter ${r.best + 1}`)),
    );
    const earned = trophy ? state.trophies?.[trophy.key] ?? -1 : -1;
    const trophyBox = trophy ? h('div', null,
        h('h3', null, `Banner: ${trophy.name}`),
        h('div', {class: 'list'}, ...trophy.tiers.map((t, i) => h('div', {class: 'row small' + (i <= earned ? '' : ' muted')},
            h('span', {'aria-hidden': 'true'}, i <= earned ? '✓' : '○'),
            h('span', {class: 'grow'},
                h('div', null, `${trophyTierName(trophy, i)}: reach encounter ${t.target}`, i <= earned ? h('span', {class: 'sr-only'}, ' (earned)') : null),
                h('div', {class: 'mods tbonus'}, trophy.bonusText(t.bonus))),
            h('span', {class: 'num'}, `${t.fame} fame`),
        ))),
    ) : null;
    const log = h('div', null,
        h('h3', null, 'Recent results'),
        progress.log.length
            ? h('div', {class: 'log'}, ...progress.log.slice(0, 12).map(entry => h('div', {class: entry.kind}, entry.text)))
            : h('div', {class: 'muted small'}, 'No attempts yet.'),
    );
    return [actions, about, track, detail, record, trophyBox, log];
}

// Short tags for what makes an encounter dangerous, judged against the baseline for its power.
export function encounterThreats(quest: QuestDef, index: number, modifiers: string[], lineup?: string[]): {label: string, kind: string, hint: string}[] {
    const power = encounterPower(quest, index);
    const tags = new Map<string, {label: string, kind: string, hint: string}>();
    for (const key of lineup ?? quest.encounters[index].monsters) {
        const m = getMonsterStats(quest, index, key, modifiers);
        for (const e of elements) {
            if ((m.damageTypes[e] ?? 0) >= 0.25) {
                tags.set('dmg-' + e, {label: `${e} damage`, kind: e, hint: `${m.name} deals ${Math.round((m.damageTypes[e] ?? 0) * 100)}% of its damage as ${e}. ${e[0].toUpperCase() + e.slice(1)} resistance reduces it; armor does not.`});
            }
            if ((m.resist[e] ?? 0) >= 0.3) {
                tags.set('res-' + e, {label: `resists ${e}`, kind: 'resist', hint: `${m.name} resists ${Math.round((m.resist[e] ?? 0) * 100)}% of ${e} damage.`});
            }
            if ((m.resist[e] ?? 0) <= -0.3) {
                tags.set('weak-' + e, {label: `weak to ${e}`, kind: e, hint: `${m.name} takes ${Math.round(-(m.resist[e] ?? 0) * 100)}% more ${e} damage.`});
            }
        }
        const thorns = monsters[key]?.thorns;
        if (thorns) {
            tags.set('thorns', {label: 'thorns', kind: 'armored', hint: `Each hit you land on ${m.name} deals ${thorns} physical damage back to you. Armor and block reduce it, and fewer, bigger hits take less of it.`});
        }
        if (m.evasion >= 1.4 * monsterBaseline.evasion * Math.pow(power, EVASION_GROWTH)) {
            tags.set('evasive', {label: 'evasive', kind: 'evasive', hint: `${m.name} dodges often. Accuracy helps you land hits.`});
        }
        if (m.armor >= 2 * monsterBaseline.armor * power) {
            tags.set('armored', {label: 'armored', kind: 'armored', hint: `${m.name} is heavily armored. Big hits and elemental damage get through better.`});
        }
        if (m.accuracy >= 1.2 * monsterBaseline.accuracy * Math.pow(power, ACCURACY_GROWTH)) {
            tags.set('accurate', {label: 'accurate', kind: 'accurate', hint: `${m.name} rarely misses, so evasion helps less.`});
        }
    }
    return [...tags.values()];
}

const monsterStatLabels: Record<MonsterModStat, string> = {
    hp: 'monster HP', damage: 'monster damage', armor: 'monster armor', accuracy: 'monster accuracy',
    evasion: 'monster evasion', attacksPerSecond: 'monster attack speed',
};

export function modifierPenaltyText(def: QuestModifierDef): string {
    const parts = (Object.entries(def.monster) as [MonsterModStat, ModValue][]).map(([stat, m]) => formatMod(monsterStatLabels[stat], m));
    for (const [element, share] of Object.entries(def.addedDamage ?? {})) {
        parts.push(`monsters add ${Math.round(share * 100)}% of their damage as ${element}`);
    }
    for (const [element, value] of Object.entries(def.resist ?? {})) {
        parts.push(`+${Math.round(value * 100)}% monster ${element} resistance (up to ${Math.round(MONSTER_RESIST_CAP * 100)}%)`);
    }
    if (def.duplicate) {
        parts.push('every monster appears twice (so twice the gold and XP)');
    }
    if (def.rite) {
        const names = (rules: string[]) => rules.map(r => ruleInfo[r as keyof typeof ruleInfo].name).join(' and ');
        const steps = def.rite.schedule.map(s => `${names(s.rules)} from encounter ${s.from + 1}`);
        parts.push(`Lifeless all run; ${steps.join(', ')}. Stacks last the whole run. A full clear calls ${monsters[def.rite.boss].name}, whose rules change at each quarter of its life (${def.rite.bossPhases.map(names).join(', then ')}). Beating it uses up one of each key and opens the portal to the final area`);
    }
    return parts.join(', ');
}

export function bonusText(b: RewardBonuses): string {
    const pct = (v: number) => `${Math.round(v * 100)}%`;
    return [
        b.extraRewardChance ? `+${pct(b.extraRewardChance)} extra reward chance` : '',
        b.rarityUpgradeChance ? `+${pct(b.rarityUpgradeChance)} rarity upgrade chance` : '',
        b.premiumChance ? `+${pct(b.premiumChance)} premium drop chance` : '',
        b.bonusRareChance ? `+${pct(b.bonusRareChance)} bonus rare encounter chance` : '',
        b.goldXpMultiplier && b.goldXpMultiplier !== 1 ? `${Math.round(b.goldXpMultiplier * 100) / 100}× gold and XP` : '',
    ].filter(Boolean).join(', ');
}

function modifiersSection(ctx: Ctx, quest: QuestDef, adventurer: Adventurer): HTMLElement {
    const {state} = ctx;
    const active = getActiveModifiers(state, adventurer, quest);
    const granted = grantedModifiers(state, adventurer, quest.key);
    const taken = findContract(state, adventurer.activeContract, adventurer);
    const fromContract = taken?.questKey === quest.key ? taken.mods : [];
    const feeStep = getEntryFee(quest, []) ;
    const hiddenExclusive = quest.modifiers.filter(def => def.exclusive && !granted.includes(def.key));
    const rows = quest.modifiers.filter(def => !def.exclusive || granted.includes(def.key)).map(def => {
        const unlocked = isModifierUnlocked(state, quest, def.key);
        const usable = unlocked || granted.includes(def.key);
        const on = active.includes(def.key);
        const body = h('span', {class: 'grow'},
            h('div', null, def.name, h('span', {class: 'muted small'}, ` · +${getEntryFee(quest, [def.key]) - feeStep} gold fee`),
                granted.includes(def.key) ? h('span', {class: 'granttag'}, fromContract.includes(def.key) ? ' For the contract' : ' For the ambition') : null),
            h('div', {class: 'mods'}, modifierPenaltyText(def)),
            h('div', {class: 'mods good'}, bonusText(def.bonuses)),
            usable ? null : h('div', {class: 'mods'}, modifierUnlockText(def)),
        );
        return usable
            ? h('button', {
                class: 'item modtoggle' + (on ? ' selected' : ''),
                'aria-pressed': on ? 'true' : 'false',
                'data-guide': 'modifier',
                onclick: () => {
                    state.guide = {...state.guide, modifierToggled: true};
                    setActiveModifiers(adventurer, quest.key, on ? active.filter(k => k !== def.key) : [...active, def.key]);
                    ctx.refresh();
                },
            }, h('span', {class: 'check', 'aria-hidden': 'true'}, on ? '✓' : ''), body)
            : h('div', {class: 'item locked'}, h('span', {class: 'check', 'aria-hidden': 'true'}, '🔒'), body);
    });
    const total = getRewardBonuses(quest, active);
    // Challenges: the Endless trial stepper once the quest's banner is earned, and the Void.
    const maxTrial = trialMax(state, quest.key);
    const trial = trialLevel(state, adventurer, quest.key);
    const setTrial = (v: number) => { adventurer.trials = {...adventurer.trials, [quest.key]: Math.max(0, Math.min(maxTrial, v))}; ctx.refresh(); };
    const challenges = challengeKeys(state, adventurer, quest);
    // The level sits with its −/+ by the title; the lines below show the current level's totals.
    const trialRow = maxTrial > 0 ? h('div', {class: 'item trialrow'},
        h('span', {class: 'check', 'aria-hidden': 'true'}, '⚑'),
        h('span', {class: 'grow'},
            h('div', {class: 'trialhead'}, 'Endless trial',
                h('button', {class: 'btn small', disabled: trial <= 0, 'aria-label': 'Lower the Endless trial', onclick: () => setTrial(trial - 1)}, '−'),
                h('span', {class: 'num', 'aria-live': 'polite', 'aria-label': `Level ${trial} of ${maxTrial}`}, `${trial}/${maxTrial}`),
                h('button', {class: 'btn small', disabled: trial >= maxTrial, 'aria-label': 'Raise the Endless trial', onclick: () => setTrial(trial + 1)}, '+')),
            h('div', {class: 'mods'}, `+${trial * TRIAL_MONSTER * 100}% increased monster life and damage`),
            h('div', {class: 'mods good'}, `+${trial * TRIAL_PREMIUM * 100}% premium drop chance`),
            h('div', {class: 'mods muted'}, `Each level adds +${TRIAL_MONSTER * 100}% monster life and damage and +${TRIAL_PREMIUM * 100}% premium drop chance. One more level opens for every ${TRIAL_STEP} Endless encounters the guild clears here.`))) : null;
    const voidRow = challenges.includes(VOID_KEY) ? h('div', {class: 'item locked voidrow'},
        h('span', {class: 'check', 'aria-hidden': 'true'}, '◆'),
        h('span', {class: 'grow'},
            h('div', null, 'The Void', h('span', {class: 'granttag'}, ' From the Vessel Stone')),
            h('div', {class: 'mods'}, `+${VOID_MONSTER * 100}% increased monster life and damage`),
            h('div', {class: 'mods good'}, `+${VOID_PREMIUM * 100}% premium drop chance`))) : null;
    return h('div', null,
        h('h3', null, `${adventurer.name}'s modifiers (${active.length} on)`),
        h('div', {class: 'list'}, ...rows),
        hiddenExclusive.length ? h('p', {class: 'muted small', style: 'margin:6px 0 0'}, `${hiddenExclusive.map(d => d.name).join(', ')}: only on contracts and ambitions that ask for them.`) : null,
        h('p', {class: 'muted small', style: 'margin:6px 0 0'}, active.length
            ? `Together: ${bonusText(total)}. Entry fee ${getEntryFee(quest, active)} gold. Changes apply from ${adventurer.name}'s next run.`
            : `Modifiers make the quest harder for better rewards, and combine freely. Each adventurer picks their own, and changes apply from their next run. Unlocks are shared by the guild.`),
        trialRow || voidRow ? h('h3', null, 'Challenges') : null,
        trialRow || voidRow ? h('div', {class: 'list'}, trialRow, voidRow) : null,
    );
}

// ---------------- Crafting bench ----------------

// The bench's comparison, built with the bench. On wide screens it shows beside the bench, or
// beside the material picker while that is open.
let benchComparison: HTMLElement | null = null;
export function renderBenchCompare(ctx: Ctx): HTMLElement | null {
    const {ui} = ctx;
    if (!ui.benchOpen || !ui.compareBeside || !benchComparison) return null;
    return h('section', {class: 'comparefloat', 'aria-label': 'Comparison with the selected hero'}, benchComparison);
}

function benchPanel(ctx: Ctx): HTMLElement {
    benchComparison = null;
    const {state, ui} = ctx;
    const bench = ui.bench;
    const type = itemTypes[bench.itemType];
    const baseLimit = getBaseLimit(state, bench.itemType);
    bench.base = bench.base.slice(0, baseLimit);
    // Every unlocked decoration slot can be filled in any order. Slots past what the base materials
    // support are grayed out, and a decoration that doesn't fit its slot stays put, marked invalid.
    const decoLimit = getDecorationLimit(state, bench.itemType);
    // Slots fill from the top with no gaps: a removed material lets the ones below move up.
    compactBench(bench);
    if (bench.decorations.length > decoLimit) bench.decorations.length = decoLimit;
    const problems = decorationProblems(state, bench);
    const supported = problems.supported;
    const validDecorations = bench.decorations.filter((k, i): k is string => !!k && !problems.reasons[i]);
    const invalidCount = problems.reasons.filter(Boolean).length;
    const preview = previewCraft(bench.itemType, bench.base, validDecorations, decoLimit);
    const hero = currentHero(ctx);

    const filters = statFilters(ui);
    const seen = seenMaterials(state);
    const fadedType = (key: ItemTypeKey) => filters.length > 0 && !typeSupports(seen, key, filters);
    const pickType = (key: ItemTypeKey) => {
        bench.itemType = key;
        bench.base = bench.base.filter(m => getBaseStats(requireMaterial(m), key));
        ui.typeOpen = false;
        ctx.refresh();
    };
    // Grouped tiles: icon only on wide screens, icon and name in the narrow screen's chooser.
    const typeGroups = (labeled: boolean) => h('div', {class: 'typegroups' + (labeled ? ' labeled' : '')},
        ...[TYPE_GROUPS].map(line => h('div', {class: 'typeline'}, ...line.map(([label, keys]) => h('div', {class: 'typegroup'},
            h('span', {class: 'typegroup-label'}, label),
            h('div', {class: 'typegroup-row'}, ...keys.map(key => h('button', {
                class: ['typetile', key === bench.itemType ? 'on' : '', fadedType(key) ? 'faded' : ''].filter(Boolean).join(' '),
                title: fadedType(key) ? `${itemTypes[key].name}: none of your materials give a ${itemTypes[key].name.toLowerCase()} ${filterNames(filters)}` : itemTypes[key].name,
                'aria-label': itemTypes[key].name,
                'aria-pressed': String(key === bench.itemType),
                onclick: () => pickType(key),
            }, itemTypeArt(key), labeled ? h('span', {class: 'typetile-name'}, itemTypes[key].name) : null))))))));
    const chips = typeFacts(type).map(f => h('span', {class: 'typechip'}, f));
    const leanText = typeLeans(type);
    const types = h('div', null,
        h('h3', null, 'Item type'),
        // Wide screens: the grouped grid and a summary line.
        h('div', {class: 'typepick-wide'},
            typeGroups(false),
            h('div', {class: 'typesum'},
                h('span', {class: 'typesum-name'}, type.name),
                h('span', {class: 'typechips'}, ...chips, leanText ? h('span', {class: 'typechip lean', title: 'Stats this type scales up'}, `leans ${leanText}`) : null))),
        // Narrow screens: the chosen type, with Change opening the grouped chooser.
        h('div', {class: 'typepick-narrow'},
            h('button', {class: 'typebar', 'aria-expanded': String(!!ui.typeOpen), 'aria-label': `Item type: ${type.name}. ${ui.typeOpen ? 'Close the list' : 'Change it'}`, onclick: () => { ui.typeOpen = !ui.typeOpen; ctx.refresh(); }},
                h('span', {class: 'typebar-icon'}, itemTypeArt(bench.itemType)),
                h('span', {class: 'typebar-mid'},
                    h('span', {class: 'typesum-name'}, type.name),
                    h('span', {class: 'typechips'}, ...typeFacts(type).map(f => h('span', {class: 'typechip'}, f)))),
                h('span', {class: 'typebar-action'}, ui.typeOpen ? 'Close' : 'Change')),
            ui.typeOpen ? h('div', {class: 'typedrop'}, typeGroups(true)) : null),
    );

    const slotBox = (kind: 'base' | 'decoration', index: number, key: string | null | undefined, onRemove: () => void, unsupported = false, invalid: string | null = null) => {
        const picking = ui.picker?.kind === kind && ui.picker.index === index;
        return h('div', {class: 'slotbox' + (key ? ' filled' : '') + (unsupported ? ' unsupported' : '') + (invalid ? ' invalid' : '') + (picking ? ' picking' : '') + (!key && !unsupported ? ' addslot' : ''),
            title: invalid ?? (unsupported ? `The base materials support ${supported} decoration slot${supported === 1 ? '' : 's'}` : undefined)},
            h('button', {
                class: 'slotpick grow',
                // The first craft: the empty first base slot, then a material, then Craft + equip.
                'data-guide': kind === 'base' && index === 0 && !key && !picking && !bench.base.length ? 'craft'
                    : kind === 'decoration' && !key && !unsupported && !picking && ui.decoSkipped && !state.guide?.decorated && hasUsableDecoration(state, bench) ? 'deco' : undefined,
                'aria-label': `Choose ${kind} material ${index + 1}${invalid ? ' (invalid)' : ''}`,
                onclick: () => { ui.picker = picking ? null : {kind, index}; ctx.refresh(); },
            }, key ? requireMaterial(key).name : unsupported ? 'Not supported by the base' : kind === 'base' ? 'Add base material' : 'Add decoration',
                invalid ? h('div', {class: 'slotwhy'}, invalid) : null),
            key ? h('button', {class: 'btn small', 'aria-label': 'Remove', onclick: onRemove}, '×') : null,
        );
    };
    const accessory = isAccessory(bench.itemType);
    const slots = h('div', {class: 'bench'},
        h('div', null,
            h('h3', null, `Base (${bench.base.length}/${baseLimit})`),
            h('div', {class: 'list', style: 'border:none;gap:4px'},
                // The filled slots, then one empty slot while there is room.
                ...Array.from({length: Math.min(baseLimit, bench.base.length + 1)}, (_, i) => slotBox('base', i, bench.base[i], () => { bench.base.splice(i, 1); fixPicker(ui); ctx.refresh(); })),
                unlockBox(ctx, accessory ? 'accessorySlot' : 'baseSlot'),
            ),
        ),
        h('div', null,
            h('h3', null, `Decorations (${validDecorations.length}/${supported})`),
            h('div', {class: 'list', style: 'border:none;gap:4px'},
                ...Array.from({length: Math.min(decoLimit, bench.decorations.length + 1)}, (_, i) => slotBox('decoration', i, bench.decorations[i], () => { bench.decorations.splice(i, 1); fixPicker(ui); ctx.refresh(); }, i >= supported, problems.reasons[i])),
                unlockBox(ctx, accessory ? 'accessoryDecorationSlot' : 'decorationSlot'),
            ),
        ),
    );

    const previewItem: CraftedItem | null = preview ? {id: 'preview', itemType: bench.itemType, name: preview.name, base: [...bench.base], decorations: validDecorations, power: preview.power} : null;
    // Craft and equip on the selected hero in one go.
    const equipNeed = levelForPower(Math.max(1, ...bench.base.map(k => requireMaterial(k).power)));
    const equipWhy = !hero ? 'No hero selected' : invalidCount ? 'Remove or replace the invalid decorations first' : hero.level < equipNeed ? `${hero.name} needs level ${equipNeed}` : null;
    const craftEquipButton = (slot: SlotKey, label: string, cls: string) => h('button', {
        class: cls,
        'data-guide': cls.includes('primary') && bench.base.length && !equipWhy ? 'craft' : undefined,
        disabled: !!equipWhy,
        title: equipWhy ?? `Craft it and equip it in ${hero!.name}'s ${slotNames[slot].toLowerCase()}`,
        onclick: () => {
            const result = craftItem(state, bench.itemType, bench.base, validDecorations);
            if (typeof result === 'string') {
                ctx.toast(result);
            } else {
                equip(state, hero!, {kind: 'crafted', id: result.id}, slot);
                bench.base = [];
                bench.decorations = [];
            }
            ctx.refresh();
        },
    }, label);
    const primarySlot = hero ? comparisonSlots(state, hero, type.slots)[0] : undefined;
    const comparison = benchComparison = hero && previewItem ? deltaColumn(state, hero, type.slots, previewItem, slot =>
        slot === primarySlot ? null : h('div', {class: 'row'}, craftEquipButton(slot, `Craft + equip in ${slotNames[slot].toLowerCase()}`, 'btn small')),
        {active: filters, toggle: stat => toggleFilter(ctx, statFamily(stat))}) : null;
    const previewBox = preview ? h('div', {class: 'preview'},
        h('div', {class: 'previewhead'},
            h('span', {class: 'rowart'}, itemArt(bench.itemType, bench.base)),
            h('div', {class: 'grow'},
                h('div', {class: 'pname'}, preview.name, levelTag(levelForPower(preview.power), hero?.level)),
                h('div', null, itemStatsText(preview.stats)))),
        h('div', {class: 'statlines'}, ...preview.lines.map(line => h('div', {class: 'row small' + (line.raw > line.cap ? ' capped' : '')},
            h('span', {class: 'grow'}, formatStat(line.stat, line.total)),
            h('span', {class: 'num muted'}, [
                line.raw ? `base ${formatStatValue(line.stat, line.raw)}${line.cap === Infinity ? '' : line.raw > line.cap ? `, capped at ${formatStatValue(line.stat, line.cap)}` : ` of ${formatStatValue(line.stat, line.cap)} cap`}` : '',
                line.decoration ? `+${formatStatValue(line.stat, line.decoration)} deco` : '',
            ].filter(Boolean).join(' · ')),
        ))),
        preview.lines.some(l => l.raw > l.cap) ? h('div', {class: 'muted small'}, 'Core stats are capped by the highest cap among the base materials. Decorations add past the cap.') : null,
        h('div', {class: 'row', style: 'margin-top:4px'},
            primarySlot ? craftEquipButton(primarySlot, 'Craft + equip', 'btn primary') : null,
            h('button', {
                class: 'btn' + (primarySlot ? '' : ' primary'),
                disabled: invalidCount > 0,
                title: invalidCount ? 'Remove or replace the invalid decorations first' : undefined,
                onclick: () => {
                    const result = craftItem(state, bench.itemType, bench.base, validDecorations);
                    if (typeof result === 'string') {
                        ctx.toast(result);
                    } else {
                        bench.base = [];
                        bench.decorations = [];
                    }
                    ctx.refresh();
                },
            }, primarySlot ? 'Craft only' : 'Craft'),
            h('button', {class: 'btn', onclick: () => { bench.base = []; bench.decorations = []; ctx.refresh(); }}, 'Clear'),
        ),
        invalidCount ? h('div', {class: 'muted small bad'}, `${invalidCount} decoration${invalidCount > 1 ? 's don\'t' : ' doesn\'t'} fit ${invalidCount > 1 ? 'their slots' : 'its slot'}. Remove or replace ${invalidCount > 1 ? 'them' : 'it'} to craft.`) : null,
        hero && preview && levelForPower(preview.power) > hero.level ? h('div', {class: 'muted small'}, `${hero.name} (level ${hero.level}) can't wear this until level ${levelForPower(preview.power)}.`) : null,
    ) : h('div', {class: 'muted small'}, 'Add a base material to see the item it makes.');

    const equippedCount = state.craftedItems.filter(item => isItemEquipped(state, item.id)).length;
    const unfiltered = ctx.ui.showEquipped ? state.craftedItems : state.craftedItems.filter(item => !isItemEquipped(state, item.id));
    const byStats = filters.length ? unfiltered.filter(item => matchesFilters(filters, Object.keys(getCraftedItemStats(item).stats) as StatKey[])) : unfiltered;
    const levelCut = ui.hideTooHigh && hero ? hero.level : Infinity;
    const shownItems = byStats.filter(item => itemLevelRequirement(state, {kind: 'crafted', id: item.id}) <= levelCut);
    const hiddenByFilter = unfiltered.length - byStats.length;
    const hiddenByLevel = byStats.length - shownItems.length;
    const crafted = h('div', null,
        h('div', {class: 'craftedhead'},
            h('div', {class: 'craftedtitle'},
                h('h3', null, `Crafted items (${shownItems.length})`),
                h('button', {class: 'btn small', 'aria-expanded': ui.craftedCollapsed ? 'false' : 'true', title: ui.craftedCollapsed ? 'Show the crafted items list' : 'Hide the crafted items list', onclick: () => { ui.craftedCollapsed = !ui.craftedCollapsed; ctx.refresh(); }}, ui.craftedCollapsed ? '▸ Show' : '▾ Hide'),
            ),
            equippedCount && !ui.craftedCollapsed ? h('label', {class: 'toggle small'},
                h('input', {type: 'checkbox', checked: !!ctx.ui.showEquipped, onchange: (e: Event) => { ctx.ui.showEquipped = (e.target as HTMLInputElement).checked; ctx.refresh(); }}),
                ` Show equipped items (${equippedCount})`,
            ) : null,
        ),
        ui.craftedCollapsed ? null : shownItems.length ? h('div', {class: 'list'},
            ...[...shownItems].reverse().map(item => {
                const wearer = isItemEquipped(state, item.id);
                const salvaging = ctx.ui.salvaging?.itemId === item.id ? ctx.ui.salvaging : null;
                // Equip buttons are gathered from the comparison lines and shown with the other actions below.
                const equipFor: [SlotKey, HTMLElement][] = [];
                return h('div', {class: 'craftedrow'}, h('div', {class: 'small craftedbody'},
                    h('span', {class: 'rowart listart'}, itemArt(item.itemType, item.base)),
                    h('div', {class: 'grow'},
                        h('div', null, item.name, ' ', h('span', {class: 'power'}, `P${Math.max(...item.base.map(k => requireMaterial(k).power))}`), h('span', {class: 'muted'}, ` · ${itemTypes[item.itemType].name}`)),
                        h('div', {class: 'mods'}, itemStatsText(getCraftedItemStats(item))),
                        h('div', {class: 'mods'}, 'Made from ', ...madeFromList(ctx, item.base, item.decorations)),
                        hero && !wearer ? deltaLines(state, hero, itemTypes[item.itemType].slots, {kind: 'crafted', id: item.id}, slot => {
                            const ref: ItemRef = {kind: 'crafted', id: item.id};
                            const need = itemLevelRequirement(state, ref);
                            equipFor.push([slot, h('button', {
                                class: 'btn small',
                                disabled: !canEquipInSlot(state, hero, ref, slot),
                                title: hero.level < need ? `${hero.name} needs level ${need}` : `Equip on ${hero.name} (${slotNames[slot]})`,
                                onclick: () => { if (equip(state, hero, ref, slot)) { state.guide = {...state.guide, manualEquip: true}; } ctx.refresh(); },
                            })]);
                            return null;
                        }) : null,
                    ),
                    wearer
                        ? h('div', {class: 'itemactions bottom'}, h('span', {class: 'muted'}, `Worn by ${wearer.name}`),
                            salvageLevel(state) ? h('button', {class: 'btn small' + (salvaging ? ' on' : ''), 'aria-expanded': salvaging ? 'true' : 'false', onclick: () => { ctx.ui.salvaging = salvaging ? null : {itemId: item.id, picks: defaultSalvagePicks(item.base, item.decorations)}; ctx.refresh(); }}, 'Salvage') : null)
                        : h('div', {class: 'itemactions bottom'},
                            ...equipFor.map(([slot, btn]) => { btn.textContent = equipFor.length > 1 ? `Equip ${slotNames[slot]}` : 'Equip'; return btn; }),
                            recipeButton(ctx, item),
                            h('button', {class: 'btn small', onclick: () => { sellItem(state, item.id); ctx.refresh(); }}, `Sell ${getSellValue(item)}g`),
                            salvageLevel(state) ? h('button', {class: 'btn small' + (salvaging ? ' on' : ''), 'aria-expanded': salvaging ? 'true' : 'false', onclick: () => { ctx.ui.salvaging = salvaging ? null : {itemId: item.id, picks: defaultSalvagePicks(item.base, item.decorations)}; ctx.refresh(); }}, 'Salvage') : null),
                ), salvaging ? salvageBox(ctx, item.id, salvaging) : null);
            }),
        ) : h('div', {class: 'muted small'}, hiddenByLevel ? `Every crafted item here is above ${hero!.name}'s level ${hero!.level}.` : hiddenByFilter ? `No crafted items with ${filterNames(filters)}.` : state.craftedItems.length ? 'Every crafted item is equipped.' : 'Nothing crafted yet.'),
        hiddenByFilter && shownItems.length && !ui.craftedCollapsed ? h('div', {class: 'muted small'}, `${hiddenByFilter} more hidden by the stat filters.`) : null,
        hiddenByLevel && shownItems.length && !ui.craftedCollapsed ? h('div', {class: 'muted small'}, `${hiddenByLevel} more above ${hero!.name}'s level hidden.`) : null,
    );

    const levelToggle = hero ? h('label', {class: 'toggle small'},
        h('input', {type: 'checkbox', checked: !!ui.hideTooHigh, onchange: (e: Event) => { ui.hideTooHigh = (e.target as HTMLInputElement).checked; ctx.refresh(); }}),
        ` Hide items and base materials above ${hero.name}'s level (${hero.level})`,
    ) : null;
    return panelShell(ctx, 'left', 'Crafting bench', 'Combine base materials into an item, then add decorations.',
        levelToggle, filterBar(ctx), types, slots, h('div', {class: 'previewrow'}, previewBox, ui.compareBeside ? null : comparison), crafted);
}

// Why each bench decoration can't be used where it sits (null = fine), and how many decoration
// slots the base materials support.
// Drops gaps left in the decoration list (older saves and views kept empty slots in place).
function compactBench(bench: UiState['bench']) {
    if (bench.decorations.some(k => !k)) bench.decorations = bench.decorations.filter(Boolean);
}
// After a slot empties, a picker pointing past the filled slots moves to the first empty one.
function fixPicker(ui: UiState) {
    const p = ui.picker;
    if (!p) return;
    const list = p.kind === 'base' ? ui.bench.base : ui.bench.decorations;
    if (p.index > list.length) ui.picker = {...p, index: list.length};
}

// Whether an owned material can decorate the current craft, for the decoration slot's highlight.
function hasUsableDecoration(state: GameState, bench: UiState['bench']): boolean {
    if (!bench.base.length) return false;
    const cap = maxDecorationPower(bench.itemType, bench.base);
    return materialOrder.some(key => (state.materials[key] ?? 0) > 0 && requireMaterial(key).power <= cap && !!getDecorationStats(requireMaterial(key), bench.itemType));
}

export function decorationProblems(state: GameState, bench: UiState['bench']): {supported: number, reasons: (string | null)[]} {
    const type = itemTypes[bench.itemType];
    const supported = previewCraft(bench.itemType, bench.base, [], getDecorationLimit(state, bench.itemType))?.maxDecorations ?? 0;
    const cap = maxDecorationPower(bench.itemType, bench.base);
    const reasons = bench.decorations.map((key, i) => {
        if (!key) return null;
        const m = requireMaterial(key);
        if (!getDecorationStats(m, bench.itemType)) return `Doesn't decorate a ${type.name.toLowerCase()}`;
        if (!bench.base.length) return 'Needs a base material';
        if (i >= supported) return `The base materials support ${supported} decoration slot${supported === 1 ? '' : 's'}`;
        if (m.power > cap) return `Needs a base of P${m.power - DECORATION_TIER_LEAD} or higher`;
        return null;
    });
    return {supported, reasons};
}

// The strongest material starts picked, since it is usually the one worth recovering.
function defaultSalvagePicks(base: string[], decorations: string[]): number[] {
    const all = [...base, ...decorations];
    if (!all.length) return [];
    let best = 0;
    all.forEach((k, i) => { if (requireMaterial(k).power > requireMaterial(all[best]).power) best = i; });
    return [best];
}

// Pick which of an item's materials to recover, then salvage it.
function salvageBox(ctx: Ctx, itemId: string, salvaging: {itemId: string, picks: number[]}): HTMLElement {
    const {state} = ctx;
    const level = salvageLevel(state);
    const all = itemMaterials(state, itemId);
    const picks = salvaging.picks.filter(i => i < all.length);
    const cost = salvageCost(picks.map(i => all[i]));
    const blocked = salvageBlocked(state, itemId, picks);
    const toggle = (i: number) => {
        if (picks.includes(i)) salvaging.picks = picks.filter(p => p !== i);
        else if (level === 1) salvaging.picks = [i];
        else if (picks.length < level) salvaging.picks = [...picks, i];
        else return;
        ctx.refresh();
    };
    const wearer = isItemEquipped(state, itemId);
    return h('div', {class: 'salvagebox'},
        h('div', {class: 'muted small'}, `Recover up to ${level} material${level === 1 ? '' : 's'}. The item is destroyed and the rest are lost.`),
        wearer ? h('div', {class: 'small bad'}, `${wearer.name} is wearing this. Salvaging takes it off.`) : null,
        h('div', {class: 'statchips'}, ...all.map((key, i) => {
            const m = requireMaterial(key);
            const on = picks.includes(i);
            return h('button', {class: 'statchip' + (on ? ' match' : ''), 'aria-pressed': on ? 'true' : 'false', disabled: !on && level > 1 && picks.length >= level,
                onclick: () => toggle(i)}, `${m.name} P${m.power}`);
        })),
        h('div', {class: 'row small'},
            h('span', {class: 'grow muted'}, picks.length > 1 ? `${SALVAGE_TIER_COST[Math.max(...picks.map(i => requireMaterial(all[i]).power))]} gold for the strongest, ×${Math.pow(2, picks.length - 1)} for ${picks.length} materials` : 'Price by the material\'s tier'),
            h('button', {class: 'btn small primary', disabled: !!blocked, title: blocked ?? undefined, onclick: () => {
                const result = salvageItem(state, itemId, picks);
                if (typeof result === 'string') ctx.toast(result);
                ctx.ui.salvaging = null;
                ctx.refresh();
            }}, `Salvage · ${cost} gold`),
            h('button', {class: 'btn small', onclick: () => { ctx.ui.salvaging = null; ctx.refresh(); }}, 'Cancel'),
        ),
    );
}

// The salvage yard on the map: build it, upgrade it, and how salvaging works.
function salvagePanel(ctx: Ctx): HTMLElement {
    const {state} = ctx;
    const level = salvageLevel(state);
    const next = nextSalvageLevel(state);
    const tiers = SALVAGE_TIER_COST.map((c, p) => p > 0 && p <= 8 ? `P${p} ${c}` : '').filter(Boolean).join(' · ');
    const action = next ? h('div', {class: 'expansion row small'},
        h('span', {class: 'grow'},
            h('div', null, level ? `Upgrade: recover ${next.level} materials per item` : 'Build the salvage yard'),
            h('div', {class: 'mods'}, next.blocked && next.blocked.startsWith('Requires') ? next.blocked : `${next.gold} gold`)),
        h('button', {class: 'btn small primary', disabled: !!next.blocked, title: next.blocked ?? undefined,
            onclick: () => { upgradeSalvage(state); ctx.refresh(); }},
            `${level ? 'Upgrade' : 'Build'} · ${next.gold} gold`),
    ) : h('div', {class: 'muted small'}, `Fully upgraded: recovers up to ${SALVAGE_MAX} materials per item.`);
    return shell(ctx, 'Salvage yard', level ? `Recovers ${level} material${level === 1 ? '' : 's'} per item` : 'Not built yet',
        h('p', {class: 'muted small', style: 'margin:0'}, 'Take a crafted item apart to recover some of its materials. The item is destroyed and the materials you don\'t pick are lost.'),
        h('p', {class: 'muted small', style: 'margin:0'}, `Price for one material, by its tier: ${tiers}. Picking several uses the strongest one's price, doubled for each extra material (×2, ×4, ×8).`),
        h('p', {class: 'muted small', style: 'margin:0'}, `Each guild expansion after Guild Expansion ${SALVAGE_EXPANSION} opens an upgrade for one more material, up to ${SALVAGE_MAX}.`),
        action,
        level ? salvageList(ctx) : null,
    );
}

// The guild's crafted items, newest first, each with Salvage. Shares the bench's "Show equipped
// items" setting; worn items can be salvaged too (they come off first).
function salvageList(ctx: Ctx): HTMLElement {
    const {state, ui} = ctx;
    const equippedCount = state.craftedItems.filter(item => isItemEquipped(state, item.id)).length;
    const shown = ui.showEquipped ? state.craftedItems : state.craftedItems.filter(item => !isItemEquipped(state, item.id));
    return h('div', null,
        h('div', {class: 'craftedhead'},
            h('h3', null, `Crafted items (${shown.length})`),
            equippedCount ? h('label', {class: 'toggle small'},
                h('input', {type: 'checkbox', checked: !!ui.showEquipped, onchange: (e: Event) => { ui.showEquipped = (e.target as HTMLInputElement).checked; ctx.refresh(); }}),
                ` Show equipped items (${equippedCount})`,
            ) : null,
        ),
        shown.length ? h('div', {class: 'list'}, ...[...shown].reverse().map(item => {
            const wearer = isItemEquipped(state, item.id);
            const salvaging = ui.salvaging?.itemId === item.id ? ui.salvaging : null;
            return h('div', {class: 'craftedrow'}, h('div', {class: 'small craftedbody'},
                h('span', {class: 'rowart listart'}, itemArt(item.itemType, item.base)),
                h('div', {class: 'grow'},
                    h('div', null, item.name, ' ', h('span', {class: 'power'}, `P${Math.max(...item.base.map(k => requireMaterial(k).power))}`), h('span', {class: 'muted'}, ` · ${itemTypes[item.itemType].name}`)),
                    h('div', {class: 'mods'}, itemStatsText(getCraftedItemStats(item))),
                    h('div', {class: 'mods'}, 'Made from ', ...madeFromList(ctx, item.base, item.decorations)),
                    wearer ? h('div', {class: 'muted'}, `Worn by ${wearer.name}`) : null,
                ),
                h('div', {class: 'itemactions bottom'},
                    h('button', {class: 'btn small' + (salvaging ? ' on' : ''), 'aria-expanded': salvaging ? 'true' : 'false', onclick: () => { ui.salvaging = salvaging ? null : {itemId: item.id, picks: defaultSalvagePicks(item.base, item.decorations)}; ctx.refresh(); }}, 'Salvage')),
            ), salvaging ? salvageBox(ctx, item.id, salvaging) : null);
        })) : h('div', {class: 'muted small'}, state.craftedItems.length ? 'Every crafted item is equipped.' : 'Nothing crafted yet.'),
    );
}

// ---------------- Stat filters (bench, pickers, crafted items, comparison) ----------------

function statFilters(ui: UiState): string[] {
    return ui.statFilters ?? [];
}
// True when every filtered family is among the stats (no filters matches everything).
function matchesFilters(filters: string[], stats: StatKey[]): boolean {
    if (!filters.length) return true;
    const families = new Set(stats.map(statFamily));
    return filters.every(f => families.has(f));
}
function toggleFilter(ctx: Ctx, family: string) {
    const filters = statFilters(ctx.ui);
    ctx.ui.statFilters = filters.includes(family) ? filters.filter(f => f !== family) : [...filters, family];
    ctx.refresh();
}
function filterNames(filters: string[]): string {
    const names = filters.map(familyLabel);
    return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0] ?? '';
}
function seenMaterials(state: GameState): MaterialDef[] {
    return materialOrder.filter(k => (state.obtained[k] ?? 0) > 0 || (state.materials[k] ?? 0) > 0).map(requireMaterial);
}
// Stats a material can give an item type, as a base or as a decoration.
function materialTypeStats(material: MaterialDef, itemType: ItemTypeKey): StatKey[] {
    return [...Object.keys(getBaseStats(material, itemType)?.stats ?? {}), ...Object.keys(getDecorationStats(material, itemType) ?? {})] as StatKey[];
}
// A craft combines several materials, so a type supports the filters when its materials together cover them.
function typeSupports(seen: MaterialDef[], itemType: ItemTypeKey, filters: string[]): boolean {
    return matchesFilters(filters, seen.flatMap(m => materialTypeStats(m, itemType)));
}
// Every stat family found on materials the guild has had, and on its crafted items.
function filterFamilies(state: GameState): string[] {
    const found = new Set<string>();
    for (const m of seenMaterials(state)) for (const t of itemTypeOrder) materialTypeStats(m, t).forEach(s => found.add(statFamily(s)));
    for (const item of state.craftedItems) (Object.keys(getCraftedItemStats(item).stats) as StatKey[]).forEach(s => found.add(statFamily(s)));
    const order = (f: string) => { const i = statOrder.indexOf(f as StatKey); return i < 0 ? 999 : i; };
    return [...found].sort((a, b) => order(a) - order(b));
}
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// The filter line at the top of the bench: active filters as removable chips, a +Filter select,
// and Clear all once there are two or more.
function filterBar(ctx: Ctx): HTMLElement {
    const filters = statFilters(ctx.ui);
    const available = filterFamilies(ctx.state).filter(f => !filters.includes(f));
    const select = h('select', {class: 'filteradd', 'aria-label': 'Add a stat filter'},
        h('option', {value: ''}, '+ Filter'),
        ...available.map(f => h('option', {value: f}, capitalize(familyLabel(f)))));
    (select as Listened).hasListeners = true;
    select.addEventListener('change', () => {
        const value = (select as HTMLSelectElement).value;
        if (value) { ctx.ui.statFilters = [...filters, value]; ctx.refresh(); }
    });
    return h('div', {class: 'filterbar', role: 'group', 'aria-label': 'Stat filters'},
        ...filters.map(f => h('button', {class: 'fchip', 'aria-label': `Remove ${familyLabel(f)} filter`, title: 'Remove this filter',
            onclick: () => toggleFilter(ctx, f)}, capitalize(familyLabel(f)), h('span', {'aria-hidden': 'true'}, ' ×'))),
        available.length ? select : null,
        filters.length > 1 ? h('button', {class: 'fchip clear', onclick: () => { ctx.ui.statFilters = []; ctx.refresh(); }}, 'Clear all') : null,
        filters.length ? null : h('span', {class: 'muted small'}, 'Narrow materials, item types and crafted items to a stat.'),
    );
}

// ---------------- Material picker (beside the bench) ----------------

export function renderPickerPanel(ctx: Ctx): HTMLElement | null {
    const {state, ui} = ctx;
    const picker = ui.picker;
    if (!ui.benchOpen || !picker) {
        return null;
    }
    const bench = ui.bench;
    compactBench(bench);
    const type = itemTypes[bench.itemType];
    const list: (string | null)[] = picker.kind === 'base' ? bench.base : bench.decorations;
    const current = list[picker.index];
    const heroLevel = currentHero(ctx)?.level;
    // Counts exclude materials placed in the other bench slots.
    const reserved: Record<string, number> = {};
    [...bench.base, ...bench.decorations].forEach(k => { if (k) reserved[k] = (reserved[k] ?? 0) + 1; });
    if (current) reserved[current]--;
    // The item's level requirement comes from its strongest base material. Each base option shows
    // what the requirement would be with it in this slot.
    const others = bench.base.filter((_, i) => i !== picker.index);
    const otherPower = Math.max(0, ...others.map(k => requireMaterial(k).power));
    const baseLevel = levelForPower(Math.max(1, otherPower));

    // Each option's stats as separate entries, so each can be clicked to filter by it.
    interface Entry {stat: StatKey, value: number, text: string}
    const filters = statFilters(ui);
    const matches = (e: Entry) => filters.includes(statFamily(e.stat));
    const decoCapPower = maxDecorationPower(bench.itemType, bench.base);
    const options = materialOrder.flatMap(key => {
        const count = (state.materials[key] ?? 0) - (reserved[key] ?? 0);
        // Materials already in this column stay listed even with none left, for their [-] button.
        if (count < 1 && !list.includes(key)) return [];
        const material = requireMaterial(key);
        let entries: Entry[];
        let extra = '';
        if (picker.kind === 'base') {
            const base = getBaseStats(material, bench.itemType);
            if (!base) return [];
            entries = baseStatEntries(base, stat => statScale(bench.itemType, stat), (stat, v) => itemStatRound(stat, v, bench.itemType));
            extra = [base.role ? roleLabel[base.role] : '', `${base.maxDecorations} decoration slot${base.maxDecorations === 1 ? '' : 's'}`].filter(Boolean).join(' · ');
        } else {
            const deco = getDecorationStats(material, bench.itemType);
            if (!deco) return [];
            entries = statOrder.filter(k => deco[k]).map(stat => { const v = roundStat(stat, itemStatRound(stat, deco[stat]! * decorationScale(bench.itemType, stat), bench.itemType)); return {stat, value: v, text: formatStat(stat, v)}; });
        }
        if (!matchesFilters(filters, entries.map(e => e.stat))) return [];
        return [{key, material, count, entries, extra}];
    });
    // With filters, the most of the first filter's stats first; otherwise, and on ties, strongest first.
    const first = filters[0];
    // A family can mix a flat stat with its percent kind (Max HP and % Max HP), which don't compare,
    // so the flat amount sorts first and the percent amount breaks ties.
    const amount = (o: {entries: Entry[]}, flat: boolean) => first ? o.entries.filter(e => statFamily(e.stat) === first && (e.stat === first) === flat).reduce((sum, e) => sum + e.value, 0) : 0;
    options.sort((a, b) => amount(b, true) - amount(a, true) || amount(b, false) - amount(a, false) || b.material.power - a.material.power);
    // Base slots, then the decoration slots the bases support: where the picker goes next.
    const baseLimit = getBaseLimit(state, bench.itemType);
    const nextPicker = (): UiState['picker'] => {
        if (bench.base.length < baseLimit) return {kind: 'base', index: bench.base.length};
        const supported = Math.min(getDecorationLimit(state, bench.itemType), decorationProblems(state, bench).supported);
        const decos = bench.decorations.filter(Boolean).length;
        return decos < supported ? {kind: 'decoration', index: decos} : null;
    };
    // A filled slot is replaced; otherwise the material goes in the top-most empty slot. The picker
    // then moves on to the next empty slot, base slots first, and closes once every slot is full.
    const choose = (key: string) => {
        compactBench(bench);
        const list = picker.kind === 'base' ? bench.base : bench.decorations;
        if (picker.index < list.length) list[picker.index] = key; else list.push(key);
        ui.picker = nextPicker();
        ctx.refresh();
    };
    // [+] and [-] on materials in this craft: add one to the first empty slot of this column, or take
    // the last one out (the slots below move up).
    const columnLimit = picker.kind === 'base' ? baseLimit : Math.min(getDecorationLimit(state, bench.itemType), decorationProblems(state, bench).supported);
    const addOne = (key: string) => {
        compactBench(bench);
        const list = picker.kind === 'base' ? bench.base : bench.decorations;
        if (list.length >= columnLimit) return;
        list.push(key);
        ui.picker = list.length < columnLimit ? {kind: picker.kind, index: list.length} : nextPicker();
        ctx.refresh();
    };
    const removeOne = (key: string) => {
        compactBench(bench);
        const list: (string | null)[] = picker.kind === 'base' ? bench.base : bench.decorations;
        const at = list.lastIndexOf(key);
        if (at >= 0) list.splice(at, 1);
        ui.picker = {kind: picker.kind, index: Math.min(picker.index, list.length)};
        ctx.refresh();
    };
    const rows: HTMLElement[] = [];
    // Materials already in this craft (other slots) come first, since crafts often repeat a material.
    // Only this column's materials, the one in the slot being replaced included.
    const inCraft = new Set(list.filter((k): k is string => !!k));
    const inColumn = (key: string) => list.filter(k => k === key).length;
    const usedOptions = options.filter(o => inCraft.has(o.key));
    const usedRows: HTMLElement[] = [];
    let hiddenCount = 0;
    for (const o of [...usedOptions, ...options.filter(o => !inCraft.has(o.key))]) {
        const used = inCraft.has(o.key);
        // With no base material yet there's no tier to compare against, so every decoration is shown.
        const tooStrong = picker.kind === 'decoration' && decoCapPower > 0 && o.material.power > decoCapPower;
        const level = levelForPower(Math.max(otherPower, o.material.power));
        const raises = level > baseLevel;
        const tooHigh = heroLevel !== undefined && level > heroLevel;
        // Unusable here: decorations above the base's tier, and (with the bench toggle on) bases that
        // would put the item above the hero's level. Ones already in this craft stay, for their [-].
        if (!used && (tooStrong || (picker.kind === 'base' && ui.hideTooHigh && tooHigh))) { hiddenCount++; continue; }
        const head = h('div', null, materialIcon(o.key), o.material.name, ' ', h('span', {class: 'power'}, `P${o.material.power}`), h('span', {class: 'muted num'}, ` ×${o.count}`),
            picker.kind === 'base' ? h('span', {class: 'reqtag' + (raises ? ' raises' : '') + (raises && tooHigh ? ' short' : ''), title: (raises ? `Raises the item's level requirement to ${level}` : `Item level requirement stays ${level}`) + (tooHigh ? `, above ${currentHero(ctx)!.name}'s level ${heroLevel}` : '')}, ` Item Lv ${level}${raises ? ' ↑' : ''}`) : null);
        const chips = h('div', {class: 'statchips'},
            ...o.entries.map(e => {
                const on = matches(e);
                return h('button', {
                    class: 'statlink' + (on ? ' match' : ''),
                    'aria-pressed': on ? 'true' : 'false',
                    title: on ? `Remove the ${familyLabel(statFamily(e.stat))} filter` : `Filter by ${familyLabel(statFamily(e.stat))}`,
                    onclick: (ev: MouseEvent) => { ev.stopPropagation(); toggleFilter(ctx, statFamily(e.stat)); },
                }, e.text);
            }),
        );
        const extra = o.extra ? h('div', {class: 'mods'}, o.extra) : null;
        // The whole card picks the material. The name is the keyboard target; stat links and the
        // info button stop the click so they only do their own thing.
        // None left to place (all in this craft): it can't go in another slot, only come out.
        const noneLeft = o.count < 1;
        const locked = tooStrong || noneLeft;
        // Free copies for [+]: the slot being replaced holds one that isn't free.
        const free = o.count - (o.key === current ? 1 : 0);
        const stop = (fn: () => void) => (ev: MouseEvent) => { ev.stopPropagation(); fn(); };
        const counter = used ? h('div', {class: 'pickcount'},
            h('span', {class: 'muted small'}, `${inColumn(o.key)} in this craft`),
            h('button', {class: 'btn small', 'aria-label': `One less ${o.material.name}`, title: `Take one ${o.material.name} out`, onclick: stop(() => removeOne(o.key))}, '−'),
            list.length < columnLimit && free > 0 && !tooStrong
                ? h('button', {class: 'btn small', 'aria-label': `One more ${o.material.name}`, title: `Add another ${o.material.name}`, onclick: stop(() => addOne(o.key))}, '+')
                : null,
        ) : null;
        (used ? usedRows : rows).push(h('div', {class: 'pickrow' + (o.key === current ? ' selected' : '') + (locked ? ' locked' : ' pickable'),
            'data-guide': picker.kind === 'base' && !bench.base.length && !locked ? 'craft' : undefined,
            onclick: locked ? undefined : () => choose(o.key)},
            h('div', {class: 'grow pickmain'},
                tooStrong
                    ? h('div', {class: 'pickname'}, head, extra, h('div', {class: 'mods'}, `Needs a base of P${o.material.power - DECORATION_TIER_LEAD} or higher`))
                    : noneLeft ? h('div', {class: 'pickname'}, head, extra)
                    : h('button', {class: 'pickname', title: `Use ${o.material.name}`}, head, extra),
                chips,
                counter),
            h('button', {class: 'btn small info', 'aria-label': `All uses of ${o.material.name}`, title: 'Show every use of this material',
                onclick: (ev: MouseEvent) => { ev.stopPropagation(); ui.materialDetail = o.key; ctx.refresh(); }}, 'i'),
        ));
    }

    // With nothing owned that matches, name the materials that would, so the filter still points somewhere.
    const missingText = () => {
        const fits = materialOrder.filter(key => {
            const material = requireMaterial(key);
            const stats = picker.kind === 'base' ? Object.keys(getBaseStats(material, bench.itemType)?.stats ?? {}) : Object.keys(getDecorationStats(material, bench.itemType) ?? {});
            return matchesFilters(filters, stats as StatKey[]);
        });
        const seen = fits.filter(key => (state.obtained[key] ?? 0) > 0);
        const unseen = fits.length - seen.length;
        if (!fits.length) return `No material gives a ${type.name.toLowerCase()} ${filterNames(filters)} as a ${picker.kind === 'base' ? 'base' : 'decoration'}.`;
        return `None owned. ${seen.length ? `${seen.map(k => `${requireMaterial(k).name} (P${requireMaterial(k).power})`).join(', ')} ${seen.length === 1 ? 'has' : 'have'} it` : ''}${seen.length && unseen ? ', and ' : ''}${unseen ? `${unseen} material${unseen === 1 ? '' : 's'} you haven't found yet ${unseen === 1 ? 'has' : 'have'} it` : ''}.`;
    };

    const title = `${picker.kind === 'base' ? 'Base' : 'Decoration'} ${picker.index + 1}`;
    return h('section', {class: 'panel left picker', 'aria-label': `Choose ${title.toLowerCase()} material`},
        h('div', {class: 'panel-head'},
            h('div', {class: 'grow'},
                h('h2', null, title),
                h('div', {class: 'muted small'}, `Materials for a ${type.name.toLowerCase()}`),
            ),
            h('button', {class: 'btn', onclick: () => { if (picker.kind === 'decoration' && !bench.decorations[picker.index]) ui.decoSkipped = true; ui.picker = null; ctx.refresh(); }}, 'Close'),
        ),
        h('div', {class: 'panel-body'},
            h('div', {class: 'muted small'}, filters.length ? `Showing materials with ${filterNames(filters)}. Change the filters at the top of the bench.` : 'Strongest first. Click a stat to filter by it.'),
            usedRows.length ? h('div', null, h('h3', null, 'In this craft'), h('div', {class: 'list'}, ...usedRows)) : null,
            usedRows.length && rows.length ? h('h3', null, 'Other materials') : null,
            rows.length || usedRows.length || hiddenCount ? (rows.length ? h('div', {class: 'list'}, ...rows) : null) : h('div', {class: 'muted small'},
                filters.length ? missingText() : picker.kind === 'base'
                    ? `None of your materials can be the base of a ${type.name.toLowerCase()}.`
                    : `None of your materials can decorate a ${type.name.toLowerCase()}.`),
            hiddenCount ? h('div', {class: 'muted small'}, picker.kind === 'decoration'
                ? `${hiddenCount} stronger material${hiddenCount === 1 ? '' : 's'} hidden: they need a stronger base.`
                : `${hiddenCount} material${hiddenCount === 1 ? '' : 's'} above ${currentHero(ctx)?.name ?? 'the hero'}'s level hidden.`) : null,
            h('p', {class: 'muted small'}, picker.kind === 'decoration'
                ? `Decorations add on top of the base caps; two-handed weapons get larger values. They can be at most ${DECORATION_TIER_LEAD} tiers above the strongest base material.`
                : CAP_RULE + ' A core stat with no cap from any base is 0.'),
            picker.kind === 'base' ? h('p', {class: 'muted small'}, `An item requires a level set by its strongest base material: 3 levels per power up to P5 (P5 is level 13), 4 per power to P10 (level 33), then 5 per power (P11 is level 38). Without this slot it requires level ${baseLevel}.`) : null,
        ),
    );
}

// ---------------- Guild ----------------

// One applicant: name, class and tier, portrait and passives, ambitions. `action` is the hire button.
function applicantCard(app: Applicant, action: HTMLElement | null, showAmbitions = true): HTMLElement {
    const cls = classes[app.classKey];
    const fameIfAll = Math.round(app.ambitions.reduce((sum, a) => sum + a.fame, 0) * RETIRE_MULTIPLIER[3]);
    return h('div', {class: 'applicant'},
        h('div', {class: 'row applicanthead'},
            h('div', {class: 'grow'},
                h('div', {class: 'applicantname'}, app.name),
                h('div', {class: 'panel-title-sub'}, `Level ${app.level} ${cls.name} · `, h('span', {class: 'ambtier t' + app.tier}, ambitionTierNames[app.tier]))),
            action,
        ),
        h('div', {class: 'herohead'}, heroPortrait(app, 'large'), heroPassives(app, 'passive small')),
        showAmbitions ? ambitionList(app.ambitions) : null,
        showAmbitions ? h('div', {class: 'mods muted'}, `All three fulfilled: ${fameIfAll} fame on retirement`) : null,
    );
}

// A new game opens on this: pick the guild's first adventurer from three free starters.
export function renderStarterPick(ctx: Ctx): HTMLElement | null {
    const {state, ui} = ctx;
    if (state.adventurers.length || !state.starters?.length) return null;
    return h('div', {class: 'matdetail-backdrop starter-backdrop'},
        h('section', {class: 'panel matdetail starterpick', role: 'dialog', 'aria-label': 'Choose your first adventurer'},
            h('div', {class: 'panel-head'}, h('div', {class: 'grow'},
                h('h2', null, 'Your first adventurer'),
                h('div', {class: 'muted small'}, 'Pick one to found the guild. You can hire more later from the guild hall.'))),
            // The whole card is the choice: click, tap, or Enter/Space when focused.
            h('div', {class: 'panel-body'}, h('div', {class: 'starterlist'}, ...state.starters.map(app => {
                const choose = () => {
                    const hero = chooseStarter(state, app.id);
                    if (hero) selectHero(ui, hero.id);
                    ctx.refresh();
                };
                const card = applicantCard(app, null, false);
                card.classList.add('startercard');
                card.setAttribute('role', 'button');
                card.setAttribute('tabindex', '0');
                card.setAttribute('aria-label', `Choose ${app.name}, level ${app.level} ${classes[app.classKey].name}`);
                card.addEventListener('click', choose);
                card.addEventListener('keydown', (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
                return card;
            }))),
        ),
    );
}

// Opened from the hire slot on the guild roster. Applicants vary: class, starting level and three
// ambitions, with better applicants as the guild clears more quests. Refreshing costs gold.
function hirePanel(ctx: Ctx): HTMLElement {
    const {state} = ctx;
    ensureApplicants(state);
    const full = state.adventurers.length >= state.guild.memberSlots;
    const cost = refreshCost(state);
    return shell(ctx, full ? 'Applicants' : 'Hire an adventurer', `${state.adventurers.length}/${state.guild.memberSlots} members${full ? ' · roster full' : ''}`,
        h('div', {class: 'row'},
            h('button', {class: 'btn', disabled: state.gold < cost, onclick: () => { refreshApplicants(state); ctx.refresh(); }}, `New applicants · ${cost} gold`),
            h('button', {class: 'btn', onclick: () => { ctx.ui.panel = {kind: 'guild'}; ctx.refresh(); }}, 'Back to the guild hall'),
        ),
        full ? h('div', {class: 'rosterfull', role: 'status'},
            h('div', null, h('strong', null, 'Roster full. '), 'You can look, but hiring needs a free member slot: retire a member or unlock another slot.'),
            h('button', {class: 'btn small', onclick: () => openGuildSection(ctx, 'guild-roster')}, 'Go to members'),
        ) : null,
        h('p', {class: 'muted small', style: 'margin:0'}, 'Each applicant brings three ambitions. Fulfilled ambitions pay fame when you retire them, more for completing more of the set (×1, ×1.5, ×2.5). More guild fame brings stronger applicants with bigger ambitions.'),
        h('p', {class: 'muted small', style: 'margin:0'}, `At ${state.fame} fame: ` + applicantTierOdds(state).map((p, t) => p > 0 ? `${num(p * 100)}% ${ambitionTierNames[t]}` : '').filter(Boolean).join(', ')
            + (guildTier(state) < TIER_FAME.length ? `. ${ambitionTierNames[guildTier(state) + 1]} applicants start at ${Math.round(0.8 * TIER_FAME[guildTier(state)])} fame.` : '.')),
        h('div', null,
            h('h3', null, `Applicants (${applicantSlots(state)})`),
            (state.expansion ?? 0) < FOURTH_APPLICANT_EXPANSION ? h('div', {class: 'muted small', style: 'margin-bottom:4px'}, (state.expansion ?? 0) < THIRD_APPLICANT_EXPANSION
                ? `Hired applicants are replaced right away. Guild Expansion ${THIRD_APPLICANT_EXPANSION} adds a third applicant (+${applicantSlotFame(2, 3)} fame).`
                : `Hired applicants are replaced right away. Guild Expansion ${FOURTH_APPLICANT_EXPANSION} adds a fourth applicant (+${applicantSlotFame(3, 4)} fame).`) : null,
            h('div', {class: 'list'}, ...(state.applicants ?? []).map(app => {
                const blocked = canHire(state, app.fee);
                return applicantCard(app, full ? h('span', {class: 'hirelocked small', title: 'No free member slots'}, `${app.fee} gold · no free slot`) : h('button', {
                            class: 'btn small primary',
                            disabled: !!blocked,
                            title: blocked ?? `Hire ${app.name} for ${app.fee} gold`,
                            onclick: () => {
                                const hired = hireApplicant(state, app.id);
                                if (typeof hired === 'string') {
                                    ctx.toast(hired);
                                } else {
                                    ctx.ui.panel = {kind: 'adventurer', id: hired.id};
                                    selectHero(ctx.ui, hired.id);
                                }
                                ctx.refresh();
                            },
                        }, `Hire · ${app.fee} gold`));
            })),
        ),
    );
}

export function growthText(classKey: string): string {
    const g = classes[classKey].growth;
    return `Str ${g.str} · Dex ${g.dex} · Int ${g.int}`;
}

// The class's recommended weapons and defenses, as icons and names.
const pluralTypes: Partial<Record<ItemTypeKey, string>> = {staff: 'Staves', axe: 'Axes', bow: 'Bows', sword: 'Swords', greatsword: 'Greatswords', dagger: 'Daggers', wand: 'Wands'};
const defenseNames: Partial<Record<StatKey, string>> = {armor: 'Armor', evasion: 'Evasion', ward: 'Ward', blockChance: 'Block'};
const joinOr = (parts: Node[][], word: string): Node[] => parts.flatMap((p, i) => [...(i ? [document.createTextNode(i === parts.length - 1 ? ` ${word} ` : ', ')] : []), ...p]);
function suitsLine(classKey: string): HTMLElement {
    const {weapons, defenses, note} = classes[classKey].suits;
    const weaponPart = weapons.length
        ? joinOr(weapons.map(t => [itemTypeIcon(t), document.createTextNode(pluralTypes[t] ?? itemTypes[t].name)]), 'or')
        : note ? [document.createTextNode(note)] : [];
    const defensePart = joinOr(defenses.map(d => [document.createTextNode(defenseNames[d] ?? statDefs[d].label)]), 'and');
    return h('div', {class: 'suits'}, h('span', {class: 'muted'}, 'Suits '),
        ...weaponPart,
        weapons.length && note ? ` (${note.toLowerCase()})` : null,
        weaponPart.length && defensePart.length ? ' · ' : null,
        ...defensePart);
}

// A hero's or applicant's core passives (the class's own, or rolled ones for the top classes),
// their attribute growth, and any rare bonus passives.
function heroPassives(hero: {classKey: string, passives?: HeroPassive[], bonuses?: Partial<Record<BonusKey, number>>, curses?: Partial<Record<BonusKey, number>>}, cls: string, state?: GameState): HTMLElement {
    const c = classes[hero.classKey];
    // Effect scales: enhanced rolls and the guild's increased core passive effect. A passive reads
    // its base text unless it is scaled.
    // The Borrowed Crown, worn, enhances every passive the hero has.
    const crown = 'equipment' in hero && wornSignatures(hero as Adventurer).pretendersClaim ? ENHANCED_EFFECT : 0;
    const increased = crown + (!state ? 0 : equippedBonuses(state).reduce((sum, b) => sum + (b.stats?.corePassiveEffect ?? 0), 0));
    const line = (key: PassiveKey, enhanced?: boolean) => h('div', null, h('strong', null, `${enhanced ? 'Enhanced ' : ''}${passiveDefs[key].name}: `), passiveDefs[key].text(passiveScale(hero, key, classPassive, increased)));
    const lines = hero.passives
        ? hero.passives.map(p => line(p.key, p.enhanced))
        : c.passiveKey ? [line(c.passiveKey)] : [h('div', null, h('strong', null, `${c.passive.name}: `), c.passive.description)];
    const rare = rareBonusText(hero.bonuses);
    const cursed = curseText(hero.curses);
    return h('div', {class: cls},
        ...lines,
        suitsLine(hero.classKey),
        h('div', {class: 'muted'}, `Grows ${growthText(hero.classKey)} per level`),
        rare.length ? h('div', null, h('span', {class: 'raretag'}, 'Rare'), ' ', rare.join(', ')) : null,
        cursed.length ? h('div', null, h('span', {class: 'raretag cursed'}, 'Cursed'), ' ', cursed.join(', '), ` · +${Math.round(100 * cursePremium(hero))}% premium drop chance`) : null,
    );
}

// Ambitions as a list, with progress when an adventurer is given.
function ambitionList(ambitions: Ambition[], adventurer?: Adventurer): HTMLElement {
    return h('div', {class: 'ambitions'}, ...ambitions.map(a => {
        const [value, target] = adventurer ? ambitionProgress(adventurer, a) : [0, 0];
        const showCount = adventurer && !a.done && target > 1;
        // How to reach a boss is only worth showing until the ambition is fulfilled.
        const met = a.done || !!adventurer && value >= target && target > 0;
        const hint = met ? '' : ambitionHint(a);
        return h('div', {class: 'ambition' + (a.done ? ' done' : '')},
            h('span', {class: 'check', 'aria-hidden': 'true'}, a.done ? '✓' : a.kind === 'boss' ? '♛' : '○'),
            h('span', {class: 'grow'}, h('div', null, ambitionText(a), a.done ? h('span', {class: 'sr-only'}, ' (fulfilled)') : null), hint ? h('div', {class: 'mods muted'}, hint) : null),
            showCount ? h('span', {class: 'num muted'}, `${Math.min(value, target).toLocaleString()}/${target.toLocaleString()}`) : null,
            h('span', {class: 'num'}, `${a.fame} fame`),
        );
    }));
}

// The roster: each member, a Retire button when there is more than one, and one more slot that
// either hires or says when the next slot opens.
function rosterSection(ctx: Ctx): HTMLElement {
    const {state, ui} = ctx;
    const canRetire = state.adventurers.length > 1;
    const confirming = state.adventurers.find(a => a.id === ui.confirmRetire);
    const open = state.adventurers.length < state.guild.memberSlots;
    const hireSlot = open
        ? h('button', {class: 'slotbox hireslot', onclick: () => { ui.panel = {kind: 'hire'}; ctx.refresh(); }},
            h('span', {class: 'grow'}, '+ Hire'), h('span', {class: 'muted small'}, 'See applicants'))
        : h('div', {class: 'list'},
            unlockBox(ctx, 'memberSlot'),
            h('button', {class: 'slotbox hireslot viewonly', onclick: () => { ui.panel = {kind: 'hire'}; ctx.refresh(); }},
                h('span', {class: 'grow'}, 'View applicants'), h('span', {class: 'muted small'}, 'Roster full: retire someone to hire')),
            nextSlot(state, 'memberSlot') ? null : h('div', {class: 'muted small'}, 'Every member slot is unlocked.'));
    return h('div', {id: 'guild-roster'},
        h('h3', null, `Members (${state.adventurers.length}/${state.guild.memberSlots})`),
        h('div', {class: 'list roster'},
            ...state.adventurers.map(a => h('div', {class: 'row memberrow'},
                h('button', {
                    class: 'item grow' + (a.id === currentHero(ctx)?.id ? ' selected' : ''),
                    onclick: () => { ui.panel = {kind: 'adventurer', id: a.id}; selectHero(ui, a.id); ctx.refresh(); },
                }, heroPortrait(a, 'member') ?? classIcon(a.classKey),
                h('span', {class: 'grow memberinfo'},
                    h('span', {class: 'membername'}, h('strong', null, a.name),
                        h('span', {class: 'num small', title: 'Ambitions fulfilled, and the fame for retiring now'}, `${(a.ambitions ?? []).filter(x => x.done).length}/3 · ${retireFame(a)} fame`)),
                    h('span', {class: 'small'}, `Level ${a.level} ${classes[a.classKey].name}`),
                    h('span', {class: 'mods'}, activityText(state, a)))),
                canRetire ? h('button', {class: 'btn small', onclick: () => { ui.confirmRetire = a.id; ctx.refresh(); }}, 'Retire') : null,
            )),
        ),
        h('div', {style: 'margin-top:6px'}, hireSlot),
        confirming ? retireDialog(ctx, confirming) : null,
    );
}

function retireDialog(ctx: Ctx, adventurer: Adventurer): HTMLElement {
    const {state, ui} = ctx;
    const worn = slotOrder.map(slot => adventurer.equipment[slot]).filter((r): r is ItemRef => !!r)
        .map(ref => resolveItemRef(state, ref)?.name).filter(Boolean);
    const cancel = () => { ui.confirmRetire = null; ctx.refresh(); };
    return h('div', {class: 'modal-backdrop', onclick: (e: Event) => { if (e.target === e.currentTarget) cancel(); }},
        h('div', {class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': `Retire ${adventurer.name}`},
            h('h3', {style: 'margin-top:0'}, `Retire ${adventurer.name}?`),
            h('p', {class: 'small'}, `${adventurer.name}, level ${adventurer.level} ${classes[adventurer.classKey].name}, leaves the guild for good and joins the Hall of Legends. ` +
                (worn.length ? `Their gear goes back to storage: ${worn.join(', ')}.` : 'They have no gear to return.')),
            ambitionList(adventurer.ambitions ?? [], adventurer),
            h('p', {class: 'small'}, h('strong', null, `The guild gains ${retireFame(adventurer)} fame.`),
                (adventurer.ambitions ?? []).some(a => !a.done) ? ' Unfulfilled ambitions pay nothing.' : ''),
            h('div', {class: 'row', style: 'justify-content:flex-end'},
                h('button', {class: 'btn', onclick: cancel}, 'Cancel'),
                h('button', {class: 'btn danger', onclick: () => {
                    const fame = retireAdventurer(state, adventurer);
                    if (fame !== false) {
                        if (ui.hero === adventurer.id) { ui.hero = null; ui.runPanel = null; }
                    }
                    ui.confirmRetire = null;
                    ctx.refresh();
                }}, `Retire ${adventurer.name}`),
            ),
        ),
    );
}

function guildPanel(ctx: Ctx): HTMLElement {
    const {state} = ctx;
    const found = materialOrder.filter(key => (state.obtained[key] ?? 0) > 0);
    const filter = (ctx.ui.ledgerFilter ?? '').trim().toLowerCase();
    const owned = filter ? found.filter(key => requireMaterial(key).name.toLowerCase().includes(filter)) : found;
    const anyTrophy = Object.keys(state.trophies ?? {}).length > 0;
    return shell(ctx, 'Guild hall', `Fame ${state.fame} · ${state.adventurers.length}/${state.guild.memberSlots} members`,
        expansionSection(ctx),
        rosterSection(ctx),
        anyTrophy ? trophySection(ctx) : null,
        contractsOpen(state) ? contractBoard(ctx) : null,
        h('div', {id: 'guild-achievements'},
            h('h3', null, 'Upcoming achievements'),
            h('p', {class: 'muted small', style: 'margin:0 0 6px'}, 'Each trophy tier earns fame once, and so does each slot you unlock (5, 10, 20, then 50 fame per kind of slot). Fame opens guild expansions and trophy slots.'),
            upcomingAchievements(state),
        ),
        hallOfLegends(state),
        h('div', null,
            h('div', {class: 'row ledgerhead'},
                h('h3', {class: 'grow'}, 'Material ledger'),
                found.length ? h('input', {
                    type: 'search', class: 'ledgersearch', placeholder: 'Search materials', 'aria-label': 'Search the material ledger',
                    value: ctx.ui.ledgerFilter ?? '',
                    oninput: (e: Event) => {
                        const input = e.target as HTMLInputElement;
                        // Keep the attribute in step, so the rebuilt panel keeps this input (and its focus).
                        input.setAttribute('value', input.value);
                        ctx.ui.ledgerFilter = input.value;
                        ctx.refresh();
                    },
                }) : null),
            owned.length ? h('div', {class: 'list'}, ...owned.map(key => h('div', {class: 'row small'},
                h('span', {class: 'grow'}, materialLink(ctx, key), ' ', h('span', {class: 'power'}, `P${requireMaterial(key).power}`)),
                h('span', {class: 'num'}, `${state.materials[key] ?? 0} owned`),
                h('span', {class: 'num muted', title: 'Found in total, including ones since used or sold'}, `${state.obtained[key] ?? 0} found`),
            ))) : h('div', {class: 'muted small'}, found.length ? `No materials match "${ctx.ui.ledgerFilter}".` : 'Nothing gathered yet.'),
        ),
    );
}

// ---------------- Trophies ----------------

const trophyTierLabel = trophyLabel;

// Trophy slots near the top of the guild panel. Equipped trophies give their bonus to the guild.
function trophySection(ctx: Ctx): HTMLElement {
    const {state, ui} = ctx;
    const earned = trophyList.filter(def => (state.trophies?.[def.key] ?? -1) >= 0);
    const banners = earned.filter(def => def.kind === 'endless');
    const slots = state.guild.trophySlots ?? 0;
    const equipped = state.trophySlots ?? [];
    const picking = ui.trophyPick;
    const trophyUnlocks = slotUnlocks.filter(u => u.track === 'trophySlot');
    const nextTrophySlot = nextSlot(state, 'trophySlot');
    // Unlocked slots, then just the next one: its Unlock button, or why it is still locked.
    const slotEls = Array.from({length: Math.min(MAX_TROPHY_SLOTS, slots + 1)}, (_, i) => {
        if (i >= slots) {
            if (i === slots && i > 0 && nextTrophySlot && nextTrophySlot.needsGoldOnly) {
                return h('button', {
                    class: 'trophy-slot buy',
                    disabled: !!nextTrophySlot.blocked,
                    title: `Unlock a trophy slot for ${nextTrophySlot.unlock.gold} gold${unlockFame(nextTrophySlot.unlock) ? ` and gain ${unlockFame(nextTrophySlot.unlock)} fame` : ''}`,
                    onclick: () => { buySlot(state, 'trophySlot'); ctx.refresh(); },
                }, trophyCase(undefined, 0), h('div', {class: 'small'}, 'Unlock'), h('div', {class: 'small muted'}, `${nextTrophySlot.unlock.gold} gold`), unlockFame(nextTrophySlot.unlock) ? h('div', {class: 'small fame-gain'}, `+${unlockFame(nextTrophySlot.unlock)} fame`) : null);
            }
            const u = trophyUnlocks[i - 1];
            const why = i === 0 ? 'Opens with your first trophy' : !u ? 'Locked' : (state.expansion ?? 0) >= (u.expansion ?? 0) ? 'Unlock the slot before' : `Requires Guild Expansion ${u.expansion}`;
            return h('div', {class: 'trophy-slot locked'}, trophyCase(undefined, 0), h('div', {class: 'small'}, '🔒'), h('div', {class: 'small muted'}, why));
        }
        const key = equipped[i] ?? null;
        const def = key ? trophies[key] : undefined;
        const tier = key ? state.trophies?.[key] ?? -1 : -1;
        return h('button', {
            class: 'trophy-slot' + (def ? ' filled tier' + tier : '') + (picking === i ? ' picking' : ''),
            'data-guide': !def && picking !== i ? 'trophy' : undefined,
            'aria-label': def ? `Trophy slot ${i + 1}: ${def.name}. Change` : `Trophy slot ${i + 1}: empty. Choose a trophy`,
            onclick: () => { ui.trophyPick = picking === i ? null : i; ctx.refresh(); },
        },
        trophyCase(def, tier),
        def ? h('div', {class: 'tname'}, def.name) : h('div', {class: 'muted small'}, 'Empty'),
        def ? h('div', {class: 'small ttier'}, trophyTierName(def, tier)) : null,
        def ? h('div', {class: 'mods tbonus'}, def.bonusText(def.tiers[tier].bonus)) : null,
        def ? h('div', {class: 'mods muted'}, earnedText(def, tier)) : null);
    });
    return h('div', {id: 'guild-trophies'},
        h('h3', null, `Trophies (${earned.length} earned)`),
        h('div', {class: 'trophy-slots'}, ...slotEls),
        banners.length ? h('div', {class: 'trophy-banners', role: 'list', 'aria-label': 'Endless banners'}, ...banners.map(def => {
            const tier = state.trophies![def.key];
            // One line for the title, then one per benefit, then how it was earned.
            const text = `${trophyTierLabel(def, tier)}\n${def.bonusText(def.tiers[tier].bonus)}\nOpens the Endless trial for ${quests[def.key.replace(/^endless-/, '')].name}\nEarned: ${earnedText(def, tier)}`;
            return h('div', {class: 'tbanner-wrap', role: 'listitem', tabindex: '0', title: text, 'aria-label': text},
                trophyBanner(def, tier),
                h('div', {class: 'small ttier tier' + tier}, `+${Math.round((def.tiers[tier].bonus.extraRewardChance ?? 0) * 100)}%`));
        })) : null,
        earned.length ? null : h('p', {class: 'muted small'}, 'Trophies come from clearing quests, pushing endless depths and leveling each class. Each one is upgraded through Bronze, Silver, Gold and Platinum and gives a bonus while it sits in a slot. Endless banners hang beneath the slots and always count.'),
    );
}

// Rough difficulty of a trophy tier: the hero level it calls for, minus the level the guild already
// has toward it (the best hero of that class for class trophies, the best member otherwise). Quest
// clears call for the quest's level plus MOD_LEVELS per required modifier; Endless goals for the level
// whose typical monster power matches that encounter (powerForLevel).
const MOD_LEVELS = 4;
function levelForMonsterPower(power: number): number {
    for (let level = 1; level <= 200; level++) if (powerForLevel(level) >= power) return level;
    return 200;
}
function achievementDifficulty(state: GameState, def: TrophyDef, tier: number): number {
    const target = def.tiers[tier].target;
    const best = Math.max(1, ...state.adventurers.map(a => a.level));
    if (def.kind === 'class') return target - Math.max(0, def.value(state));
    const questKey = def.key.replace(/^(clear|endless)-/, '');
    if (def.kind === 'quest') return questXpLevel(quests[questKey]) + MOD_LEVELS * target - best;
    const endless = quests[endlessKey(questKey)];
    return levelForMonsterPower(encounterPower(endless, Math.min(endless.encounters.length - 1, target - 1))) - best;
}
const UPCOMING_SHOWN = 5;

// The next tier of the trophies in reach of the guild right now, easiest first (achievementDifficulty),
// with their fame. Only the UPCOMING_SHOWN easiest show.
function upcomingAchievements(state: GameState): HTMLElement {
    const next = (def: TrophyDef) => tierFor(def, def.value(state)) + 1;
    const ranked = trophyList.filter(def => def.relevant(state) && next(def) < def.tiers.length)
        .map(def => ({def, d: achievementDifficulty(state, def, next(def))}))
        .sort((a, b) => a.d - b.d || a.def.tiers[next(a.def)].fame - b.def.tiers[next(b.def)].fame)
        .slice(0, UPCOMING_SHOWN).map(r => r.def);
    const rows = ranked.flatMap(def => {
        const value = def.value(state);
        const next = tierFor(def, value) + 1;
        if (next >= def.tiers.length) return [];
        const t = def.tiers[next];
        const progress = def.key.startsWith('clear-') ? '' : `${Math.max(0, value)}/${t.target}`;
        return [h('div', {class: 'row small'},
            h('span', {class: 'grow'},
                h('div', null, def.goal(t.target)),
                h('div', {class: 'mods'}, trophyTierLabel(def, next)),
                h('div', {class: 'mods tbonus'}, def.bonusText(t.bonus))),
            progress ? h('span', {class: 'num muted'}, progress) : null,
            h('span', {class: 'num'}, `+${t.fame} fame`),
        )];
    });
    return rows.length ? h('div', {class: 'list'}, ...rows) : h('div', {class: 'muted small'}, 'Nothing new in reach right now.');
}

// "Lv 7" next to gear, red when the member is below it.
function levelTag(required: number, level?: number): HTMLElement | null {
    if (required <= 1) return null;
    const short = level !== undefined && level < required;
    return h('span', {class: 'lvtag' + (short ? ' short' : ''), title: `Requires level ${required}`}, ` Lv ${required}`);
}

// ---------------- Guild growth ----------------

// The next slot on a track: a buy button when only gold stands in the way, otherwise what it needs.
function unlockBox(ctx: Ctx, track: SlotTrack): HTMLElement | null {
    const {state} = ctx;
    const next = nextSlot(state, track);
    if (!next) {
        return null;
    }
    const name = trackNames[track];
    const fame = unlockFame(next.unlock);
    if (next.needsGoldOnly) {
        return h('button', {
            class: 'slotbox buyslot',
            disabled: !!next.blocked,
            title: next.blocked ?? `Unlock a ${name} for ${next.unlock.gold} gold${fame ? ` and gain ${fame} fame` : ''}`,
            onclick: () => { buySlot(state, track); ctx.refresh(); },
        }, h('span', {class: 'grow'}, h('div', null, `+ Unlock slot ${next.unlock.slot}`), h('div', {class: 'small muted'}, next.blocked ?? `A ${name}`)),
        h('span', {class: 'num'}, h('div', null, `${next.unlock.gold} gold`), fame ? h('div', {class: 'small fame-gain'}, `+${fame} fame`) : null));
    }
    if (next.expansion) {
        return h('div', {class: 'slotbox locked goal'},
            h('span', {class: 'grow'}, h('div', null, `🔒 Slot ${next.unlock.slot}`), expansionLink(ctx, next.expansion)));
    }
    return h('div', {class: 'slotbox locked goal'},
        h('span', {class: 'grow'}, h('div', null, `🔒 Slot ${next.unlock.slot}`), h('div', {class: 'small'}, next.blocked)));
}

// "Requires Guild Expansion N", as a link to the expansion card in the guild hall.
export function expansionLink(ctx: Ctx, level: number): HTMLElement {
    return h('button', {
        class: 'textlink small',
        onclick: (e: MouseEvent) => { e.stopPropagation(); openGuildSection(ctx, 'guild-expansion'); },
    }, `Requires Guild Expansion ${level}`);
}

// Opens the guild hall scrolled to one of its sections.
export function openGuildSection(ctx: Ctx, id: string) {
    ctx.ui.panel = {kind: 'guild'};
    ctx.ui.scrollTo = id;
    ctx.refresh();
}

// Expanding the guild opens the next tier of slots. It needs fame, then gold. Only the next
// expansion is shown.
function expansionSection(ctx: Ctx): HTMLElement | null {
    const {state} = ctx;
    const e = nextExpansion(state);
    if (!e) {
        return null;
    }
    const short: Record<SlotTrack, string> = {baseSlot: 'base', decorationSlot: 'decoration', accessorySlot: 'accessory base', accessoryDecorationSlot: 'accessory decoration', memberSlot: 'member', trophySlot: 'trophy'};
    const opens = slotUnlocks.filter(u => u.expansion === e.level).map(u => `${short[u.track]} slot ${u.slot}`);
    if (e.level === 1) opens.push('contracts');
    if (e.level === THIRD_APPLICANT_EXPANSION || e.level === FOURTH_APPLICANT_EXPANSION) opens.push(`a ${e.level === THIRD_APPLICANT_EXPANSION ? 'third' : 'fourth'} applicant (+${applicantSlotFame(APPLICANT_SLOTS[e.level - 1], APPLICANT_SLOTS[e.level])} fame)`);
    if (e.level === SALVAGE_EXPANSION) opens.push('the salvage yard');
    else if (e.level > SALVAGE_EXPANSION && e.level - SALVAGE_EXPANSION + 1 <= SALVAGE_MAX) opens.push(`salvage upgrade ${e.level - SALVAGE_EXPANSION + 1}`);
    const ready = state.fame >= e.fame;
    // Applicant tiers that start to appear between the previous expansion's fame and this one's.
    // Fame alone sets applicant odds; this only points out what arrives around the same time.
    const prevFame = expansions.find(x => x.level === e.level - 1)?.fame ?? 0;
    const arriving = ambitionTierNames.map((name, t) => ({name, t, at: tierStartFame(t)}))
        .filter(x => x.t > 0 && x.at > prevFame && x.at <= e.fame)
        .map(x => {
            const newClasses = Object.values(classes).filter(c => c.tier === x.t).map(c => c.name);
            return `${x.name} applicants from ${x.at} fame${newClasses.length ? ` (${newClasses.join(', ')})` : ''}`;
        });
    return h('div', {id: 'guild-expansion'},
        h('h3', null, `Guild expansion ${e.level}`),
        h('div', {class: 'expansion row small'},
            h('span', {class: 'grow'},
                h('div', null, ready ? `Ready: you have ${state.fame} fame` : `Needs ${e.fame} fame (${state.fame}/${e.fame})`),
                h('div', {class: 'mods'}, `Makes available: ${opens.join(', ')}`),
                arriving.length ? h('div', {class: 'mods'}, `Around this fame: ${arriving.join('; ')}`) : null),
            h('button', {
                class: 'btn small' + (ready ? ' primary' : ''),
                disabled: !ready || state.gold < e.gold,
                title: !ready ? `Needs ${e.fame} fame (you have ${state.fame})` : state.gold < e.gold ? `Needs ${e.gold} gold` : `Expand the guild for ${e.gold} gold`,
                onclick: () => {
                    expandGuild(state);
                    ctx.refresh();
                },
            }, `Expand · ${e.gold} gold`),
        ),
    );
}

// The bench's item type groups, in picker order.
const TYPE_GROUPS: [string, ItemTypeKey[]][] = [
    ['One-handed', ['sword', 'axe', 'dagger', 'wand']],
    ['Two-handed', ['greatsword', 'bow', 'staff']],
    ['Armor', ['shield', 'helmet', 'bodyArmor', 'gloves', 'boots']],
    ['Jewelry', ['belt', 'ring', 'amulet']],
];
const SLOT_WORDS: Partial<Record<SlotKey, string>> = {offHand: 'Off hand', head: 'Head', body: 'Body', gloves: 'Hands', boots: 'Feet', belt: 'Waist', amulet: 'Neck', ring1: 'Ring slots'};
// Short facts about an item type: where it goes, speed, and its damage or armor scale.
function typeFacts(type: ReturnType<typeof itemTypeOf>): string[] {
    const facts: string[] = [];
    if (type.damageMultiplier) facts.push(type.twoHanded ? 'Two-handed' : 'One-handed', `${num(type.attacksPerSecond ?? 1)} att/s`, `${num(type.damageMultiplier)}× damage`);
    else facts.push(SLOT_WORDS[type.slots[0]] ?? slotNames[type.slots[0]]);
    if (type.armorMultiplier) facts.push(`${num(type.armorMultiplier)}× armor`);
    else if (!type.damageMultiplier) facts.push('material stats only');
    return facts;
}
function itemTypeOf(key: ItemTypeKey) { return itemTypes[key]; }
// The stats a type scales up most, for the "leans" chip.
function typeLeans(type: ReturnType<typeof itemTypeOf>): string {
    const names: string[] = [];
    const entries = Object.entries(type.statMultipliers ?? {}).filter(([, v]) => (v ?? 0) > 1).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
    for (const [k] of entries) {
        const name = /^(ignite|chill|shock)Chance$|^ailmentEffect$/.test(k) ? 'ailments'
            : k === 'increasedElementalDamage' ? 'elemental' : k === 'critMultiplier' ? 'crit damage' : k === 'critChance' ? 'crit chance'
            : k === 'lifeLeech' ? 'leech' : familyLabel(k).toLowerCase();
        if (!names.includes(name)) names.push(name);
        if (names.length === 3) break;
    }
    return names.join(', ');
}

// The picture an empty equipment slot shows: the class's starting weapon in the main hand, its
// starting off hand (else a shield) in the off hand, and the slot's own item type elsewhere.
const SLOT_TYPES: Record<SlotKey, ItemTypeKey> = {mainHand: 'sword', offHand: 'shield', head: 'helmet', body: 'bodyArmor', gloves: 'gloves', boots: 'boots', belt: 'belt', amulet: 'amulet', ring1: 'ring', ring2: 'ring'};
function emptySlotType(adventurer: Adventurer, slot: SlotKey): ItemTypeKey {
    const def = classes[adventurer.classKey];
    if (slot === 'mainHand' && def?.starterWeapon) return def.starterWeapon;
    if (slot === 'offHand' && def?.starterOffHand) return def.starterOffHand;
    return SLOT_TYPES[slot];
}

// "Made from" materials: the bases, then a dot, then the decorations.
function madeFromList(ctx: Ctx, base: string[], decorations: string[]): (Node | string)[] {
    const list = (keys: string[]) => keys.flatMap((k, i) => [i ? ', ' : '', materialLink(ctx, k)]);
    return decorations.length ? [...list(base), h('span', {class: 'matsep', title: 'Decorations follow'}, ' · '), ...list(decorations)] : list(base);
}
