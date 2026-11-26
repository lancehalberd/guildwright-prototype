import {monsters, quests} from '../data/quests';
import {fightStats, pendingExtraFight, shielded, willFactor, type CombatEvent} from '../engine/runner';
import {ATTACK_ANIMS, FX_ANCHORS, FX_ANIMS, FX_URLS, HIT_EFFECTS, type Side} from './attackFx';
import type {AbilityEffect} from '../engine/types';
import {monsterKit} from '../engine/abilities';
import {heroAttackUrl, heroPortrait, heroSpriteHeadroom, heroSpriteUrl} from './portraits';
import {burnDps, shockFactor} from '../engine/ailments';
import type {Adventurer, Ailments, GameState} from '../engine/types';
import {h, shortNumber} from './dom';
import {classIcon, monsterIcon} from './icons';
import {fightLayout, monsterArtUrl, monsterHeadroom} from './monsterArt';
import {backgroundFloor, backgroundUrl} from './backgrounds';

// A small arena for the run panel: the adventurer on the left, the encounter's monsters on the
// right, and floating numbers for every hit, miss and block. It is one persistent element, moved
// into the run panel on each rebuild, so animations survive the panel's refreshes.

interface MonsterCard {
    root: HTMLElement
    bar: HTMLElement
    ail: HTMLElement
    hpNum: HTMLElement
    name: string
    maxHp: number
    // While a multihit's numbers are still playing, the bar waits for them instead of the engine.
    holdUntil: number
    // Order (see barSeq) of the latest hit the bar shows.
    shown: number
}

// Each later hit of a chain shows this much after the one before.
const HIT_STAGGER_MS = 110;
const hitDelay = (hitIndex: number) => Math.min(hitIndex, 6) * HIT_STAGGER_MS;

const MAX_FLOATERS = 40;
const MAX_LOG = 7;

// Health, ward and damage in battle abbreviate like gold and fame in the HUD (shortNumber).
// Health rounds up, so a fighter still standing never shows 0.
function shortNum(n: number): string {
    return shortNumber(Math.ceil(Math.max(0, n)));
}

// The word floated on a fighter when an ability applies an ailment, and its colour class.
const AILMENT_WORDS: Record<string, [string, string]> = {burn: ['burning', 'fire'], chill: ['chilled', 'cold'], shock: ['shocked', 'lightning'], weaken: ['weakened', 'weaken'], snare: ['snared', 'snare'], blind: ['blinded', 'blind'], bleed: ['bleeding', 'bleed'], sunder: ['sundered', 'sunder'], gale: ['off balance', 'gale']};

// Effect strips with a direction (drawn moving left to right, or slanted), mirrored on the hero.
// Auto recover budgets, as shares of a run's gold after its entry fee (same as the run strip).
const AUTO_SHARES = [0, 0.25, 0.5, 0.75, 1];
// Self effects that come out of the caster's back, as a share of its sprite's width (Overclock's steam).
const FX_SELF_BACK: Partial<Record<AbilityEffect, number>> = {steam: 0.42};
const FX_MIRRORED = new Set<AbilityEffect>(['scratch', 'slash', 'stab', 'lash', 'sting', 'throw', 'web', 'dust', 'gust', 'bleed', 'drain', 'sonar', 'acid', 'steam', 'prism', 'starfall']);
// Basic attack strips draw at this size and land up to this many px off the body's middle.
const BASIC_FX_SCALE = 0.65;
// Strips drawn small already (the smash thump) keep their size as basics.
const basicFxScale = (effect: AbilityEffect | undefined) => effect === 'thump' ? 1 : BASIC_FX_SCALE;
const BASIC_FX_JITTER = 14;

// Small badges under a fighter for its ailments: burn damage a second, chill and shock %.
function renderAilments(el: HTMLElement, a: Ailments | undefined, extra: [string, string][] = []) {
    const parts: [string, string][] = [...extra];
    const burn = burnDps(a) * shockFactor(a);
    if (burn > 0) parts.push(['burn', `Burn ${burn >= 10 ? shortNumber(burn) : burn.toFixed(1)}/s`]);
    if ((a?.chill ?? 0) >= 0.01) parts.push(['chill', `Chill ${Math.round(100 * a!.chill!)}%`]);
    if ((a?.shock ?? 0) >= 0.01) parts.push(['shock', `Shock ${Math.round(100 * a!.shock!)}%`]);
    if ((a?.weaken ?? 0) >= 0.01) parts.push(['weaken', `Weak ${Math.round(100 * a!.weaken!)}%`]);
    if ((a?.snare ?? 0) >= 0.01) parts.push(['snare', `Snare ${Math.round(100 * a!.snare!)}%`]);
    if ((a?.blind ?? 0) >= 0.01) parts.push(['blind', `Blind ${Math.round(100 * a!.blind!)}%`]);
    if ((a?.sunder ?? 0) >= 0.01) parts.push(['sunder', `Sunder ${Math.round(100 * a!.sunder!)}%`]);
    if ((a?.gale ?? 0) >= 0.01) parts.push(['gale', `Gale ${Math.round(100 * a!.gale!)}%`]);
    if (a?.bleed && a.bleed.remaining > 0) parts.push(['bleed', `Bleed ${a.bleed.dps >= 10 ? shortNumber(a.bleed.dps) : a.bleed.dps.toFixed(1)}/s`]);
    const sig = parts.map(p => p[1]).join('|');
    if (el.dataset.sig === sig) return;
    el.dataset.sig = sig;
    el.replaceChildren(...parts.map(([k, t]) => h('span', {class: 'ailb ' + k}, t)));
}

export class CombatView {
    readonly el: HTMLElement;
    private readonly heroEl: HTMLElement;
    private readonly heroHp: HTMLElement;
    private readonly heroWard: HTMLElement;
    private readonly heroWardRow: HTMLElement;
    private readonly heroAil: HTMLElement;
    private readonly heroHpNum: HTMLElement;
    private readonly heroWardNum: HTMLElement;
    private heroName = '';
    // The battle view's short combat log. Lines are only added while it's on the page.
    readonly log: HTMLElement;
    // Top-right button on the small arena that opens the full battle view. main.ts sets its click.
    readonly expand: HTMLButtonElement;
    // Over the faded hero while they rest, in the battle view: pay to recover now. main.ts sets its
    // click and calls setRecover each frame.
    readonly recover: HTMLButtonElement;
    // The card around it: Recover now, the auto recover budget (shared with the run strip) and a
    // one-line status. main.ts sets onAutoRecover.
    private readonly recoverCard: HTMLElement;
    private readonly autoButtons: HTMLButtonElement[];
    private readonly autoStatus: HTMLElement;
    onAutoRecover: (share: number) => void = () => {};
    // The quest's diorama and the guild bedroom, drawn on the arena's pixel grid behind the fighters.
    // Centered across the arena with their floor row at its middle; the arena crops what doesn't fit,
    // and the full battle view (which scales the arena) lets them run on to the view's edges.
    private readonly bgQuest: HTMLImageElement;
    private readonly bgGuild: HTMLImageElement;
    private readonly monsterLayer: HTMLElement;
    private readonly overlay: HTMLElement;
    private readonly floaters: HTMLElement;
    private cards = new Map<number, MonsterCard>();
    private encounterSig = '';
    private encounterKey = '';
    // Set while the dev preview builds its monsters, so their entrance plays at this speed.
    private previewSpeed: number | null = null;
    private adventurerId: string | null = null;
    // When the adventurer stopped fighting, in page time. The last fight stays up for a second.
    // View time (see viewTime) when the fight ended.
    private idleSince: number | null = null;
    // Set once the view shows the hero's defeat; late hit numbers from that fight can't refill the bars.
    private heroDown = false;
    // The hero's max HP as last synced, for numbers set from hit events.
    private heroMaxHp = 0;
    private heroHoldUntil = 0;
    // Hits are numbered in the order the engine resolved them. A bar only moves to a later hit, so at
    // high speed a chain's staggered number can't land after the next attack's and push the bar back up.
    private barSeq = 0;
    private heroShown = 0;
    // The hero is shown resting at the guild (the battle view fades to the guild background).
    resting = false;
    // The run on show (quest and run number). A new one starts from a clean arena.
    private runSig = '';
    // Delayed parts of shown events (staggered bars, flashes) still to come; reset cancels them.
    // Effects still to play, on the view's own timeline (see viewTime), run in time order.
    private queue: {at: number, seq: number, fn: () => void}[] = [];
    private queueSeq = 0;
    private pumping = false;
    // When settled() first had to hold a hero back, in page time.
    private waitSince: number | null = null;

    constructor() {
        this.heroHp = h('span');
        this.heroWard = h('span');
        // Numbers sit over their bars (shown in the full battle view): life, then ward.
        this.heroHpNum = h('span', {class: 'hpnum'});
        this.heroWardNum = h('span', {class: 'hpnum'});
        this.heroWardRow = h('div', {class: 'bar ward'}, this.heroWard, this.heroWardNum);
        this.heroAil = h('div', {class: 'ails'});
        this.log = h('ol', {class: 'battlelog', 'aria-label': 'Combat log'});
        this.heroEl = h('div', {class: 'fighter hero'},
            h('div', {class: 'avatar'}),
            h('div', {class: 'fname'}),
            h('div', {class: 'bar'}, this.heroHp, this.heroHpNum),
            this.heroWardRow,
            this.heroAil,
        );
        this.monsterLayer = h('div', {class: 'monsters'});
        this.overlay = h('div', {class: 'arena-overlay'});
        this.floaters = h('div', {class: 'floaters', 'aria-hidden': 'true'});
        this.recover = h('button', {class: 'btn small primary'}) as HTMLButtonElement;
        this.autoButtons = AUTO_SHARES.map(share => h('button', {
            title: share ? `Spend up to ${share * 100}% of the run's gold (after its entry fee) to skip resting` : 'Never pay to skip resting',
            onclick: () => this.onAutoRecover(share),
        }, share ? `${share * 100}%` : 'Off') as HTMLButtonElement);
        this.autoStatus = h('div', {class: 'ar-status'});
        this.recoverCard = h('div', {class: 'arena-recover', hidden: true},
            this.recover,
            h('div', {class: 'ar-auto'}, h('span', null, 'Auto'), h('div', {class: 'seg', role: 'group', 'aria-label': 'Auto recover budget'}, ...this.autoButtons)),
            this.autoStatus);
        this.expand = h('button', {class: 'arena-expand', title: 'Open the full battle view', 'aria-label': 'Open the full battle view'},
            svgEl('<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"/></svg>')) as HTMLButtonElement;
        this.bgQuest = h('img', {class: 'arena-bg', alt: '', draggable: 'false'}) as HTMLImageElement;
        this.bgGuild = h('img', {class: 'arena-bg guild', alt: '', draggable: 'false'}) as HTMLImageElement;
        this.el = h('div', {class: 'arena', role: 'group', 'aria-label': 'Combat view'},
            this.bgQuest, this.bgGuild, this.heroEl, this.monsterLayer, this.floaters, this.overlay, this.recoverCard, this.expand);
    }

    // Runs `fn` `ms` later on the view's timeline (slowed by the dilation), unless reset() comes
    // first. Counts as an effect still playing.
    private later(fn: () => void, ms: number) {
        this.queue.push({at: viewTime() + ms, seq: this.queueSeq++, fn});
        this.pump();
    }
    // Runs every queued effect whose time has come, earliest first (ties in the order queued), on
    // each animation frame while any are waiting. The dilation only slows the timeline, so effects
    // always play in the order they were scheduled for.
    private pump() {
        if (this.pumping) return;
        this.pumping = true;
        const step = () => {
            const t = viewTime();
            while (this.queue.length) {
                let next = 0;
                for (let k = 1; k < this.queue.length; k++) {
                    const q = this.queue[k], b = this.queue[next];
                    if (q.at < b.at || (q.at === b.at && q.seq < b.seq)) next = k;
                }
                if (this.queue[next].at > t) break;
                const [item] = this.queue.splice(next, 1);
                item.fn();
            }
            if (this.queue.length) requestAnimationFrame(step);
            else this.pumping = false;
        };
        requestAnimationFrame(step);
    }

    // Clears everything a fight left on the arena: numbers, effect strips, monsters, pending hits,
    // the hero's running animations, the log and any slowdown. Used when a new run starts.
    reset() {
        this.queue = [];
        this.floaters.replaceChildren();
        this.log.replaceChildren();
        this.cards.clear();
        this.monsterLayer.replaceChildren();
        this.encounterSig = '';
        this.encounterKey = '';
        this.castSlots.clear();
        this.pendingFx.clear();
        this.heroHoldUntil = 0;
        this.heroShown = 0;
        this.idleSince = null;
        this.heroDown = false;
        this.heroEl.classList.remove('down');
        this.waitSince = null;
        for (const cls of Object.keys(ANIMS)) { this.heroEl.classList.remove(cls); delete this.heroEl.dataset[cls]; }
        this.heroEl.style.animationDelay = '';
        this.heroEl.style.animationDuration = '';
        endDilation();
    }

    // Whether this adventurer can leave their quest now: true unless the arena shows them and the
    // last fight's numbers, effects or events are still to play. Never holds longer than
    // MAX_SETTLE_MS, in case something never finishes.
    settled(adventurerId: string, eventsPending: boolean): boolean {
        if (!this.el.isConnected || adventurerId !== this.adventurerId) return true;
        if (!eventsPending && !this.floaters.childElementCount && !this.queue.length) {
            this.waitSince = null;
            return true;
        }
        // On the view's timeline, so a slowdown doesn't cut the wait short.
        const now = viewTime();
        this.waitSince ??= now;
        if (now - this.waitSince < MAX_SETTLE_MS) return false;
        this.waitSince = null;
        return true;
    }

    private setBackground(img: HTMLImageElement, key: string): boolean {
        const url = backgroundUrl(key);
        img.hidden = !url;
        if (url && img.getAttribute('src') !== url) {
            img.src = url;
            const place = () => {
                // Arena pixels: the arena is 210 tall and its fighters stand on its middle row.
                img.style.marginLeft = `${-img.naturalWidth / 2}px`;
                img.style.top = `${Math.round(105 - img.naturalHeight * backgroundFloor(key))}px`;
            };
            if (img.complete && img.naturalWidth) place(); else img.addEventListener('load', place, {once: true});
        }
        return !!url;
    }

    // `spriteOverride` (dev preview) swaps in another battle sprite, such as a weapon-swap test,
    // and drops the attack strip, which is drawn for the standard sprite.
    private setHero(hero: {name: string, classKey: string, id?: string}, spriteOverride?: string) {
        const avatar = this.heroEl.children[0] as HTMLElement;
        const sig = hero.classKey + hero.name + (spriteOverride ?? '');
        if (avatar.dataset.cls !== sig) {
            avatar.dataset.cls = sig;
            // A full-body battle sprite where the class has one, else the round portrait.
            const sprite = spriteOverride ?? heroSpriteUrl(hero);
            avatar.classList.toggle('sprite', !!sprite);
            this.heroEl.classList.toggle('has-art', !!sprite);
            this.heroEl.dataset.head = String(sprite ? heroSpriteHeadroom(hero) : 0);
            const attack = sprite && !spriteOverride ? heroAttackUrl(hero) : undefined;
            const parts: Node[] = sprite ? [h('img', {src: sprite, alt: '', draggable: 'false'})] : [heroPortrait(hero) ?? classIcon(hero.classKey)];
            if (attack) parts.push(h('div', {class: 'swing', style: `background-image:url(${attack})`}));
            avatar.replaceChildren(...parts);
        }
        (this.heroEl.children[1] as HTMLElement).textContent = hero.name;
    }

    // Shows the recovery card while the hero rests here, or hides it (text null): Recover now, the
    // auto recover share in use and its status line.
    setRecover(text: string | null, enabled: boolean, autoShare = 0, status = '') {
        const show = text !== null && this.resting;
        this.recoverCard.hidden = !show;
        if (!show) return;
        if (this.recover.textContent !== text) this.recover.textContent = text;
        this.recover.disabled = !enabled;
        AUTO_SHARES.forEach((share, i) => this.autoButtons[i].classList.toggle('on', share === autoShare));
        if (this.autoStatus.textContent !== status) this.autoStatus.textContent = status;
    }

    // Dev preview: lay out one encounter as the battle view would, with full bars and no fight.
    // `entrance` replays the walk-ins at 1x speed.
    preview(questKey: string, keys: string[], boss: boolean, featured: boolean, hero: {name: string, classKey: string}, entrance: boolean, sprite?: string) {
        const quest = quests[questKey];
        const hasBg = this.setBackground(this.bgQuest, quest?.endless?.baseKey ?? questKey);
        this.setBackground(this.bgGuild, 'guild');
        this.el.classList.toggle('has-bg', hasBg);
        this.el.classList.remove('at-guild');
        this.setHero(hero, sprite);
        this.heroHp.style.width = '100%';
        this.heroWardRow.hidden = true;
        this.heroHpNum.textContent = '100 / 100';
        this.heroAil.replaceChildren();
        this.heroEl.hidden = false;
        this.heroEl.classList.remove('resting', 'down');
        this.overlay.hidden = true;
        this.floaters.replaceChildren();
        this.encounterSig = 'preview';
        this.encounterKey = 'preview';
        this.previewSpeed = 1;
        this.previewKeys = keys;
        this.buildMonsters(keys, boss, featured, entrance);
        this.previewSpeed = null;
        for (const [slot, card] of this.cards) {
            card.bar.style.width = '100%';
            card.hpNum.textContent = '100 / 100';
            card.root.classList.toggle('front', slot === 0);
        }
        if (entrance) enter(this.heroEl, 0, 0.55, 1);
    }

    // Dev preview: one attack. `slot` -1 is the hero attacking the front monster; otherwise that
    // monster attacks the hero. `anim` is a registry key or 'ability:<n>' for the monster's own kit
    // entry, which casts, calls its name and brings its effect when `effect` is 'auto'. Returns
    // what played, for the caption.
    previewAttack(opts: {slot: number, anim: string, effect: string, number: 'none' | 'normal' | 'crit' | 'crit7' | 'crit21'}): string {
        const side: Side = opts.slot < 0 ? 'hero' : 'monster';
        const foe = this.cards.get(Math.max(0, opts.slot))?.root;
        const attacker = side === 'hero' ? this.heroEl : foe;
        const target = side === 'hero' ? foe : this.heroEl;
        if (!attacker || !target) return 'nothing (no monster in that slot)';
        const kit = side === 'monster' ? monsterKit(this.previewKeys[opts.slot] ?? '') : null;
        const kitIndex = opts.anim.startsWith('ability:') ? Number(opts.anim.slice(8)) : -1;
        const entry = kit?.[kitIndex];
        let label: string, impact: number, fx: AbilityEffect | undefined, type = 'physical', fxScale = 1;
        const self = !!entry && !Object.keys(entry.shares).length && !entry.applies && !!(entry.heal || entry.rally || entry.buff);
        if (entry) {
            restartClass(attacker, entry.spell ? 'casting' : 'lunge');
            if (!entry.basic) this.float(attacker, entry.name, 'word ability', 0);
            label = `${entry.name}${entry.spell ? ' (spell)' : ''}${entry.applies ? `, applies ${entry.applies.ailment}` : ''}`;
            impact = entry.spell ? 260 : 90;
            fx = entry.effect;
            fxScale = entry.effectScale ?? (entry.basic ? basicFxScale(entry.effect) : 1);
            type = (Object.entries(entry.shares).sort((x, y) => (y[1] ?? 0) - (x[1] ?? 0))[0]?.[0]) ?? 'physical';
        } else {
            let anim = ATTACK_ANIMS.find(a => a.key === opts.anim && a.available(attacker, side)) ?? ATTACK_ANIMS[0];
            const cls = typeof anim.cls === 'string' ? anim.cls : anim.cls(attacker, side);
            if (anim.key === 'auto') anim = ATTACK_ANIMS.find(a => a.cls === cls) ?? anim;
            if (cls) restartClass(attacker, cls);
            label = anim.label;
            impact = anim.impact;
        }
        const effect = HIT_EFFECTS.find(e => e.key === opts.effect) ?? HIT_EFFECTS[0];
        if (effect.key !== 'auto') fx = effect.fx;
        this.later(() => {
            if (self) {
                if (fx) this.abilityFx(attacker, fx, fxScale, false, true);
                const b = entry!.buff;
                this.float(attacker, entry!.heal ? `+${Math.round(100 * entry!.heal)}%` : b ? ({guard: 'guarded', evade: 'evasive', ward: 'warded'})[b.kind] : 'hasted', 'word heal', 0);
                return;
            }
            for (const c of (effect.cls ?? (effect.key === 'auto' ? 'struck' : '')).split(' ').filter(Boolean)) restartClass(target, c);
            if (effect.overlay) this.fxOverlay(target, effect.overlay);
            if (fx) this.abilityFx(target, fx, effect.key === 'auto' ? fxScale : 1, effect.key === 'auto' && !!entry?.basic);
            if (entry?.applies) {
                const word = AILMENT_WORDS[entry.applies.ailment];
                this.float(target, word[0], `word ${word[1]}`, 0);
            }
            if (opts.number !== 'none' && (!entry || Object.keys(entry.shares).length)) {
                const levels = {none: 0, normal: 0, crit: 2, crit7: 7, crit21: 21}[opts.number];
                this.float(target, levels ? critText(124 * levels, levels) : '62', `dmg ${type}${levels ? ` crit crit${Math.min(levels, 3)}` : ''}`, 0, levels ? 1.4 : 1);
            }
        }, impact);
        return label + (fx ? ` · ${fx} effect` : '');
    }
    private previewKeys: string[] = [];

    // A one-shot effect drawn over a fighter's body, in the floaters layer so it sits on top.
    private fxOverlay(target: HTMLElement, cls: string) {
        const avatar = target.querySelector<HTMLElement>('.avatar') ?? target;
        const arena = this.el.getBoundingClientRect(), box = avatar.getBoundingClientRect();
        const k = arena.width / (this.el.offsetWidth || arena.width) || 1;
        const head = Number(target.dataset.head ?? 0);
        const x = (box.left - arena.left + box.width / 2) / k;
        const y = (box.top - arena.top + (box.height + head * k) / 2) / k;
        const el = h('div', {class: 'fx ' + cls, style: `left:${x}px;top:${y}px`});
        el.addEventListener('animationend', () => el.remove());
        window.setTimeout(() => el.remove(), 1500);
        this.floaters.appendChild(el);
        const rate = this.fxRate();
        if (rate !== 1) for (const a of el.getAnimations()) a.playbackRate = rate;
    }

    update(state: GameState, adventurer: Adventurer) {
        const runQuest = adventurer.run ? quests[adventurer.run.questKey] : undefined;
        const hasBg = this.setBackground(this.bgQuest, runQuest?.endless?.baseKey ?? runQuest?.key ?? '');
        const hasGuild = this.setBackground(this.bgGuild, 'guild');
        this.el.classList.toggle('has-bg', hasBg);
        // Another hero, or a new run for this one (sent out, restarted, or a contract), starts clean.
        // (A run only changes as it starts, so this is the first frame of the new run.)
        const runSig = adventurer.run ? `${adventurer.run.questKey}:${adventurer.run.number}` : '';
        if (this.adventurerId !== adventurer.id || runSig !== this.runSig) {
            this.adventurerId = adventurer.id;
            this.runSig = runSig;
            this.reset();
        }
        // Corrosion lowers max ward mid-run, so the bars use the stats the fight uses.
        const stats = fightStats(state, adventurer);
        this.heroMaxHp = stats.maxHealth;
        this.setHero(adventurer);
        this.heroName = adventurer.name;
        // The bars follow the fight only. Once it ends they hold their last values while the final
        // numbers play out, so a defeat stays at 0 even as the rest at the guild heals the hero.
        if (adventurer.activity.kind === 'fighting' && viewTime() >= this.heroHoldUntil) {
            this.heroHp.style.width = `${100 * Math.max(0, adventurer.hp) / stats.maxHealth}%`;
            this.heroWardRow.hidden = stats.maxWard <= 0;
            this.heroWard.style.width = `${100 * Math.max(0, Math.min(stats.maxWard, adventurer.ward ?? 0)) / Math.max(1, stats.maxWard)}%`;
            this.heroHpNum.textContent = `${shortNum(adventurer.hp)} / ${shortNum(stats.maxHealth)}`;
            this.heroWardNum.textContent = `${shortNum(Math.min(stats.maxWard, adventurer.ward ?? 0))} / ${shortNum(stats.maxWard)}`;
        }

        const a = adventurer.activity;
        if (a.kind === 'fighting') {
            // Shards that join mid-fight take slots after the line-up, so a new one rebuilds the cards.
            const sig = `${a.questKey}:${a.encounterIndex}:${a.bonus ? 'b' : ''}:${a.boss ?? ''}:${adventurer.run?.number ?? 0}:${(a.adds ?? []).join(',')}`;
            if (sig !== this.encounterSig) {
                this.encounterSig = sig;
                const tier = quests[a.questKey].encounters[a.encounterIndex]?.tier;
                // A new encounter (not just shards joining) plays the entrance: monsters walk in from
                // the right, and on a run's first encounter the hero walks in from the left.
                const encounterKey = sig.slice(0, sig.lastIndexOf(':'));
                const fresh = encounterKey !== this.encounterKey;
                this.encounterKey = encounterKey;
                this.buildMonsters([...(a.lineup ?? quests[a.questKey].encounters[a.encounterIndex].monsters), ...(a.adds ?? [])], !!a.boss, !!a.boss || tier === 'R', fresh);
                if (fresh && a.encounterIndex === 0 && !a.bonus && !a.boss) enter(this.heroEl, 0, 0.55);
            }
            // Area rule stacks on the hero: they last the whole run.
            const run = adventurer.run?.questKey === a.questKey ? adventurer.run : undefined;
            const stacks: [string, string][] = [];
            if (run?.corrosion) stacks.push(['corrosion', `Corrosion ${run.corrosion}`]);
            if (run?.karma) stacks.push(['karma', `Karma ${run.karma}`]);
            renderAilments(this.heroAil, a.heroAilments, stacks);
            const alive = new Map(a.monsters.map((m, i) => [m.slot ?? i, m]));
            const front = a.monsters[0]?.slot ?? 0;
            const now = viewTime();
            for (const [slot, card] of this.cards) {
                const m = alive.get(slot);
                // A monster still alive in the fight never shows as defeated, even while a chain's
                // numbers hold its bar (at high speed the holds can run back to back).
                if (m && m.hp > 0) card.root.classList.remove('dead');
                if (now < card.holdUntil) {
                    continue;
                }
                const marks: [string, string][] = [];
                if (m && shielded(m, a.monsters)) marks.push(['shielded', 'Shielded']);
                const will = m ? willFactor(m) : 1;
                if (will > 1) marks.push(['will', `Will +${Math.round(100 * (will - 1))}%`]);
                if (m?.guard) marks.push(['guard', `Guard ${Math.round(100 * m.guard.amount)}%`]);
                if (m?.evade) marks.push(['evade', `Evade +${Math.round(100 * m.evade.amount)}%`]);
                if (m?.ward) marks.push(['ward', `Ward ${shortNum(m.ward)}`]);
                renderAilments(card.ail, m?.ailments, marks);
                card.root.classList.toggle('dead', !m);
                card.root.classList.toggle('front', !!m && slot === front);
                card.bar.style.width = m ? `${100 * Math.max(0, m.hp) / m.maxHp}%` : '0%';
                if (m) card.maxHp = m.maxHp;
                card.hpNum.textContent = m ? `${shortNum(m.hp)} / ${shortNum(m.maxHp)}` : 'Defeated';
            }
            this.overlay.hidden = true;
            this.heroEl.hidden = false;
            this.heroEl.classList.remove('resting', 'down');
            this.resting = false;
            this.el.classList.remove('at-guild');
            this.idleSince = null;
            this.heroDown = false;
        } else {
            if (this.idleSince === null && a.kind === 'resting' && a.defeated) {
                // The killing blow and the move to the guild happen in the same tick, so the view
                // never sees the fight at 0 HP. Show it now.
                this.heroHp.style.width = '0%';
                this.heroWard.style.width = '0%';
                this.heroHpNum.textContent = `0 / ${shortNum(stats.maxHealth)}`;
                this.heroWardNum.textContent = `0 / ${shortNum(stats.maxWard)}`;
                this.heroDown = true;
                // Faded like a defeated monster from the killing blow on, through the rest.
                this.heroEl.classList.add('down');
            }
            this.idleSince ??= viewTime();
            // Leave the last fight up for a second so its final numbers play out, then clear the
            // arena: resting happens at the guild, not here.
            // Measured in dilated time and held while hit numbers are still due, so a slowed killing blow
            // plays out before the move to the guild.
            const cleared = (viewTime() - this.idleSince >= 1000 && !this.queue.length) || !this.cards.size;
            this.overlay.hidden = !cleared;
            this.overlay.textContent = a.kind === 'resting' ? (a.defeated ? 'Recovering at the guild' : 'Resting at the guild')
                : a.kind === 'traveling' ? 'On the road' : 'Waiting at the guild';
            // While resting, the hero stays where they fight, faded, with their HP filling back up.
            const resting = cleared && a.kind === 'resting';
            this.resting = resting;
            // A rest before a boss or bonus fight happens on site, so it keeps the quest's background.
            const onSite = a.kind === 'resting' && !a.defeated && !!pendingExtraFight(adventurer);
            this.el.classList.toggle('at-guild', resting && !onSite && hasGuild);
            this.heroEl.classList.toggle('resting', resting);
            if (resting) {
                this.heroHp.style.width = `${100 * Math.max(0, adventurer.hp) / stats.maxHealth}%`;
                this.heroWardRow.hidden = stats.maxWard <= 0;
                this.heroWard.style.width = `${100 * Math.max(0, stats.maxWard) / Math.max(1, stats.maxWard)}%`;
                this.heroHpNum.textContent = `${shortNum(adventurer.hp)} / ${shortNum(stats.maxHealth)}`;
                this.heroWardNum.textContent = `${shortNum(stats.maxWard)} / ${shortNum(stats.maxWard)}`;
                renderAilments(this.heroAil, undefined);
            }
            if (cleared) {
                this.heroEl.hidden = !resting;
                this.cards.clear();
                this.monsterLayer.replaceChildren();
                this.encounterSig = '';
            }
        }
    }

    private buildMonsters(keys: string[], boss: boolean, featured: boolean, entrance = false) {
        this.cards.clear();
        const n = keys.length;
        // Past five monsters the cards shrink so a doubled encounter still fits.
        this.monsterLayer.classList.toggle('many', n > 5);
        this.monsterLayer.classList.toggle('boss', boss);
        // A featured fight's boss gets its own column at full size; its minions line up behind it.
        const layout = fightLayout(keys, featured);
        const split = layout.some(l => l.lead);
        // Each group (everyone, or a featured fight's leads and minions) stands in columns of at most
        // MAX_COLUMN, filled from the column nearest the hero, each from its lowest row up.
        const groups = split ? [layout.map((l, i) => l.lead ? i : -1).filter(i => i >= 0), layout.map((l, i) => l.lead ? -1 : i).filter(i => i >= 0)] : [keys.map((_, i) => i)];
        const place = new Map<number, {x: number, dx: number, row: number, count: number}>();
        groups.forEach((slots, g) => {
            // Up to four stand in one column; past that, columns of three (four once there are 10+).
            const cols = slots.length <= MAX_COLUMN ? 1 : Math.max(Math.ceil(slots.length / MAX_COLUMN), Math.min(3, Math.ceil(slots.length / 3)));
            const per = Math.ceil(slots.length / cols);
            const xs = (split ? (g === 0 ? LEAD_COLUMNS : MINION_COLUMNS) : COLUMNS)[Math.min(cols, 4) - 1];
            // Columns fill bottom-up: the hero's target (the line-up's first monster) stands in the
            // lowest row, drawn in front, so its bar is never covered by the monster below it.
            slots.forEach((slot, j) => {
                const c = Math.floor(j / per);
                const count = Math.min(per, slots.length - c * per);
                place.set(slot, {x: xs[Math.min(c, xs.length - 1)], dx: split ? (g === 0 ? 4 : 8) : cols > 1 ? 12 : 17, row: count - 1 - j % per, count});
            });
        });
        this.monsterLayer.classList.toggle('split', split);
        this.monsterLayer.replaceChildren(...keys.map((key, slot) => {
            const bar = h('span');
            const ail = h('div', {class: 'ails'});
            const hpNum = h('span', {class: 'hpnum'});
            const name = monsters[key].name;
            const art = monsterArtUrl(key);
            const {lead, size} = layout[slot];
            // Rows spread down the field, pulled 30% toward the first row so the lowest stay on the ground.
            // With art, top is the ground line the sprite's feet stand on; icons are still centered there.
            const row = (i: number, count: number) => (art ? GROUND_OFFSET : 0) + (0.5 + 0.7 * i) * 100 / count;
            const at = place.get(slot)!;
            let top = row(at.row, at.count);
            // A boss stands further back, so it doesn't hide what's behind it and its feet stay on the field.
            if (art && size > 96) top = Math.min(top, BOSS_GROUND_MAX);
            const role = split ? (lead ? ' lead' : ' minion') : '';
            // Lower on the field is nearer the viewer: drawn in front, so heads overlap the feet behind.
            // A flyer hovers FLY_LIFT of a regular sprite's height above the ground line, bobbing by 10-20% of
            // it on its own rhythm, with a shadow left on the ground.
            const fly = !!art && !!monsters[key].flying;
            // Heights are measured against a regular monster's 96px sprite, so bosses fly as low as bats.
            const lift = Math.round(FLY_REF * FLY_LIFT);
            const flyStyle = fly ? `;--lift:${lift}px;--bob:${Math.round(FLY_REF * (0.1 + 0.1 * Math.random()))}px;--bob-t:${(1.6 + 0.8 * Math.random()).toFixed(2)}s;--bob-d:${(-2 * Math.random()).toFixed(2)}s` : '';
            const head = art ? monsterHeadroom(key) - (fly ? lift : 0) : 0;
            const root = h('div', {class: 'fighter monster' + role + (art ? ' has-art' : '') + (fly ? ' flying' : ''), style: `top:round(${top}%, 1px);--x:${at.x}%;--dx:${at.dx}%;--sprite:${size}px;z-index:${1 + Math.round(top)}${flyStyle}`, 'data-head': String(head)},
                art ? h('div', {class: 'avatar sprite'}, fly ? h('div', {class: 'flyshadow'}) : null, h('img', {src: art, alt: '', draggable: 'false'}))
                    : h('div', {class: 'avatar'}, monsterIcon(key)),
                h('div', {class: 'fname'}, name),
                h('div', {class: 'bar'}, bar, hpNum),
                ail,
            );
            this.cards.set(slot, {root, bar, ail, hpNum, name, maxHp: 0, holdUntil: 0, shown: 0});
            if (entrance) enter(root, 0.12 + slot * (n > 1 ? Math.min(0.09, 0.25 / (n - 1)) : 0), 0.45, this.previewSpeed ?? combatSpeed);
            return root;
        }));
    }

    // Runs every animation in the arena (lunges, flashes, numbers, flyers, entrances) at the game
    // clock's current rate, so a big blow's slowdown shows on everything that moves.
    pace(rate: number) {
        if (rate === this.paceRate && rate === 1 && combatSpeed === 1) return;
        this.paceRate = rate;
        for (const a of this.el.getAnimations({subtree: true})) {
            const target = (a.effect as KeyframeEffect | null)?.target;
            const want = target instanceof HTMLElement && target.classList.contains('fx') ? this.fxRate() : rate;
            if (a.playbackRate !== want) a.playbackRate = want;
        }
    }
    // Effect strips and overlays play at the game speed too (but not in the effect preview).
    private fxRate(): number {
        return this.paceRate * (this.encounterSig === 'preview' ? 1 : combatSpeed);
    }
    private paceRate = 1;
    // Monsters that just cast (their hit shouldn't lunge again), and the effect their hit brings.
    private castSlots = new Set<number>();
    private pendingFx = new Map<number, {effect: AbilityEffect, scale: number, basic: boolean}>();

    // An ability's effect strip played once over a fighter. Ground effects stand on the target's
    // feet (the lowest opaque row of its sprite) and fire bursts on the middle of its body; the strip
    // follows the sprite while it plays, so a lunging or flying target carries it along.
    // Strips are drawn for the hero striking a monster on the right; on the hero, directional ones
    // are mirrored so they come from the monster's side. Basic attacks draw smaller and land at a
    // random spot on the body, so quick repeats don't stack into one strip that seems to rewind.
    // A self effect listed in FX_SELF_BACK (a fighter venting steam) comes out of the caster's back
    // instead: shifted that share of the sprite's width away from the foe.
    abilityFx(target: HTMLElement, effect: AbilityEffect, scale = 1, basic = false, self = false) {
        const url = FX_URLS[effect];
        if (!url) return;
        const anchor = FX_ANCHORS[effect] ?? {feet: false, ground: 56};
        const avatar = target.querySelector<HTMLElement>('.avatar') ?? target;
        const img = avatar.querySelector<HTMLImageElement>('img');
        // Scaled strips shrink toward their anchor row, so they stay on the feet or the body middle.
        const flip = target === this.heroEl && FX_MIRRORED.has(effect) ? -1 : 1;
        const size = scale !== 1 || flip < 0 ? `;scale:${flip * scale} ${scale};transform-origin:50% ${anchor.ground}px` : '';
        const dx = basic ? (Math.random() * 2 - 1) * BASIC_FX_JITTER : 0;
        // Monsters face left, so their back is to the right; the hero's is to the left.
        const back = self ? (FX_SELF_BACK[effect] ?? 0) * (target === this.heroEl ? -1 : 1) : 0;
        const dy = basic ? (Math.random() * 2 - 1) * BASIC_FX_JITTER * (anchor.feet ? 0.25 : 0.8) : 0;
        const el = h('div', {class: `fx fx-strip fx-${effect}`, style: `background-image:url(${url})${size}`});
        const place = () => {
            const arena = this.el.getBoundingClientRect();
            const box = (img ?? avatar).getBoundingClientRect();
            const k = arena.width / (this.el.offsetWidth || arena.width) || 1;
            const b = img ? opaqueRows(img) : {top: 0, bottom: 1};
            const at = anchor.feet ? b.bottom : (b.top + b.bottom) / 2;
            el.style.left = `${(box.left - arena.left + box.width * (0.5 + back)) / k + dx}px`;
            el.style.top = `${(box.top - arena.top + box.height * at) / k - anchor.ground + dy}px`;
        };
        place();
        const follow = () => { if (el.isConnected) { place(); requestAnimationFrame(follow); } };
        requestAnimationFrame(follow);
        el.addEventListener('animationend', () => el.remove());
        window.setTimeout(() => el.remove(), 2000);
        this.floaters.appendChild(el);
        const rate = this.fxRate();
        if (rate !== 1) for (const a of el.getAnimations()) a.playbackRate = rate;
    }

    // Shows a frame's combat events. A blow to the hero worth 25% or more of their life plus ward
    // (a multihit's hits summed as one blow) slows the fight and enlarges its numbers.
    events(list: CombatEvent[]) {
        const scale = new Map<CombatEvent, number>();
        for (let i = 0; i < list.length; i++) {
            const first = list[i];
            if (first.side !== 'hero' || (first.hitIndex ?? 0) > 0) continue;
            let j = i + 1;
            while (j < list.length && list[j].side === 'hero' && list[j].slot === first.slot && (list[j].hitIndex ?? 0) > 0) j++;
            const blow = list.slice(i, j);
            const pool = blow.find(e => e.pool)?.pool ?? 0;
            const total = blow.reduce((sum, e) => sum + (e.kind === 'hit' ? (e.amount ?? 0) + (e.ward ?? 0) : 0), 0);
            const share = pool > 0 ? total / pool : 0;
            if (share >= BIG_HIT) {
                const t = Math.min(1, (share - BIG_HIT) / (1 - BIG_HIT));
                dilate(0.3 + 0.5 * t);
                for (const e of blow) scale.set(e, 1.5 + 0.5 * t);
            }
        }
        for (const e of list) this.event(e, scale.get(e) ?? 1);
    }

    // Shows one combat event: a floating number or word on whoever it happened to.
    event(e: CombatEvent, emphasis = 1) {
        if (!this.el.isConnected) {
            return;
        }
        const target = e.side === 'hero' ? this.heroEl : this.cards.get(e.slot)?.root;
        const attacker = e.side === 'hero' ? this.cards.get(e.slot)?.root : this.heroEl;
        if (!target) {
            return;
        }
        this.syncBars(e);
        this.logEvent(e);
        if (e.burn) {
            this.float(target, 'burned', 'word fire', 0);
            return;
        }
        // A monster uses an ability: it casts (or lunges) and calls the name, and its effect plays
        // on the hero with the hit that follows.
        if (e.kind === 'cast') {
            restartClass(target, e.spell ? 'casting' : 'lunge');
            if (e.ability) this.float(target, e.ability, 'word ability', 0);
            // A self ability (a heal, a war cry, a hatching) plays its effect on the caster now.
            if (e.onSelf) {
                if (e.effect) this.abilityFx(target, e.effect, e.fxScale, false, true);
                return;
            }
            this.castSlots.add(e.slot);
            if (e.effect) this.pendingFx.set(e.slot, {effect: e.effect, scale: e.fxScale ?? (e.ability ? 1 : basicFxScale(e.effect)), basic: !e.ability});
            return;
        }
        // A reflected hit is the hero's own blow coming back: no monster attack, effect or lunge.
        if (e.reflected) {
            if (e.kind === 'miss') this.float(target, 'dodge', 'word reflect', 0);
            else if (e.kind === 'block') this.float(target, 'block', 'word block reflect', 0);
            else this.float(target, `↩${shortNumber(Math.round((e.amount ?? 0) + (e.ward ?? 0)))}`, `dmg ${e.damageType ?? 'physical'} reflect`, 0, emphasis);
            return;
        }
        const fx = e.side === 'hero' && (e.hitIndex ?? 0) === 0 ? this.pendingFx.get(e.slot) : undefined;
        if (fx && e.kind !== 'miss') this.abilityFx(this.heroEl, fx.effect, fx.scale, fx.basic);
        if (e.side === 'hero' && (e.hitIndex ?? 0) === 0) this.pendingFx.delete(e.slot);
        if (e.kind === 'ailment') {
            const word = AILMENT_WORDS[e.ailment ?? 'chill'];
            this.float(target, word[0], `word ${word[1]}`, 0);
            restartClass(target, 'struck');
            return;
        }
        const cast = e.side === 'hero' && this.castSlots.delete(e.slot);
        if (attacker && (e.hitIndex ?? 0) === 0 && !cast) {
            // Heroes with an attack animation swing instead of lunging.
            if (attacker.querySelector('.swing')) restartClass(attacker, 'swinging');
            else lunge(attacker);
        }
        if (e.kind === 'miss') {
            this.float(target, e.side === 'hero' ? 'dodge' : 'miss', 'word', 0);
        } else if (e.kind === 'block') {
            this.float(target, 'block', 'word block', e.hitIndex ?? 0);
        } else {
            // One number for the whole hit; the HP and ward bars show where it went.
            const amount = (e.amount ?? 0) + (e.ward ?? 0);
            const crit = e.critLevels ?? 0;
            const text = critText(Math.round(amount), crit);
            const cls = `dmg ${e.damageType ?? 'physical'}${crit ? ` crit crit${Math.min(crit, 3)}` : ''}`;
            this.float(target, text, cls, e.hitIndex ?? 0, emphasis);
            if (e.side === 'monster') {
                const delay = hitDelay(e.hitIndex ?? 0);
                if (delay) this.later(() => flash(target), delay); else flash(target);
            }
        }
    }

    // Moves the target's bars when this hit's number appears, not when the engine resolved it, so a
    // chain's bar drops hit by hit and a kill shows with the killing number.
    private syncBars(e: CombatEvent) {
        if (e.kind !== 'hit' || e.hpAfter === undefined) {
            return;
        }
        const delay = hitDelay(e.hitIndex ?? 0);
        // The card is the one this hit landed on: if the next encounter builds new cards before a
        // late number plays, the number doesn't touch them.
        const hitCard = e.side === 'monster' ? this.cards.get(e.slot) : undefined;
        const order = ++this.barSeq;
        const apply = () => {
            if (e.side === 'hero') {
                if (this.heroDown || order < this.heroShown) return;
                this.heroShown = order;
                if (e.hpAfter! <= 0) this.heroEl.classList.add('down');
                this.heroHp.style.width = `${100 * e.hpAfter!}%`;
                if (e.wardAfter !== undefined) this.heroWard.style.width = `${100 * Math.min(1, e.wardAfter)}%`;
                // The number moves with the bar; a killing blow shows 0.
                if (this.heroMaxHp) this.heroHpNum.textContent = `${shortNum(Math.max(0, e.hpAfter!) * this.heroMaxHp)} / ${shortNum(this.heroMaxHp)}`;
            } else {
                const card = hitCard;
                if (!card || !card.root.isConnected || order < card.shown) return;
                card.shown = order;
                card.bar.style.width = `${100 * e.hpAfter!}%`;
                if (card.maxHp) card.hpNum.textContent = e.killed ? 'Defeated' : `${shortNum(e.hpAfter! * card.maxHp)} / ${shortNum(card.maxHp)}`;
                if (e.killed) {
                    card.root.classList.add('dead');
                    card.root.classList.remove('front');
                }
            }
        };
        const until = viewTime() + delay + 50;
        if (e.side === 'hero') {
            this.heroHoldUntil = Math.max(this.heroHoldUntil, until);
        } else {
            const card = this.cards.get(e.slot);
            if (card) card.holdUntil = Math.max(card.holdUntil, until);
        }
        if (delay) this.later(apply, delay); else apply();
    }

    // One line in the battle view's log: who hit whom, for how much.
    private logEvent(e: CombatEvent) {
        if (!this.log.isConnected || (e.hitIndex ?? 0) > 0 && e.kind !== 'hit') return;
        const foe = this.cards.get(e.slot)?.name ?? 'A monster';
        const hero = this.heroName;
        const amount = shortNumber(Math.round((e.amount ?? 0) + (e.ward ?? 0)));
        const crit = e.critLevels ? ` (crit${e.critLevels > 1 ? ' ×' + e.critLevels : ''})` : '';
        const type = e.damageType && e.damageType !== 'physical' ? ` ${e.damageType}` : '';
        let text: string;
        let cls = e.side;
        if (e.kind === 'cast') {
            if (!e.ability) return;
            text = `${foe} uses ${e.ability}`;
            cls = 'hero';
        } else if (e.kind === 'ailment') text = `${foe}'s ${e.ability ?? 'spell'} ${({burn: 'sets', chill: 'chills', shock: 'shocks', weaken: 'weakens', snare: 'snares', blind: 'blinds', bleed: 'cuts', sunder: 'sunders', gale: 'unbalances'} as Record<string, string>)[e.ailment ?? 'chill']} ${hero}${e.ailment === 'burn' ? ' alight' : e.ailment === 'bleed' ? ' open' : ''}`;
        else if (e.burn) text = `${foe} burns${e.killed ? ' to death' : ''}`;
        else if (e.reflected) text = e.kind === 'miss' ? `${hero} dodges the reflection` : e.kind === 'block' ? `${hero} blocks the reflection` : `${foe} reflects ${amount}${type} back at ${hero}`;
        else if (e.kind === 'miss') text = e.side === 'hero' ? `${hero} dodges ${foe}` : `${hero} misses ${foe}`;
        else if (e.kind === 'block') text = e.side === 'hero' ? `${hero} blocks ${foe}` : `${foe} blocks ${hero}`;
        else text = e.side === 'hero' ? `${foe} hits ${hero} for ${amount}${type}${crit}` : `${hero} hits ${foe} for ${amount}${type}${crit}${e.killed ? ', defeating it' : ''}`;
        if (e.killed) cls += ' kill';
        this.log.appendChild(h('li', {class: cls}, text));
        while (this.log.childElementCount > MAX_LOG) this.log.firstElementChild?.remove();
    }

    private float(target: HTMLElement, text: string | Node, cls: string, hitIndex: number, emphasis = 1) {
        while (this.floaters.childElementCount >= MAX_FLOATERS) {
            this.floaters.firstElementChild?.remove();
        }
        const arena = this.el.getBoundingClientRect();
        const box = target.getBoundingClientRect();
        // The battle view scales the arena up; numbers are placed in its own unscaled pixels.
        const k = arena.width / (this.el.offsetWidth || arena.width) || 1;
        // Multihits fan out sideways so each number of a chain stays readable.
        const spread = (hitIndex % 2 ? 1 : -1) * Math.ceil(hitIndex / 2) * 16;
        // On the hero each kind of result starts apart and flies its own way (see FLOAT_DIRS), so a
        // block, a dodge, a reflection and the damage numbers don't pile up.
        const dir = target === this.heroEl ? floatDir(typeof text === 'string' ? text : '', cls) : null;
        const [ox, oy] = dir ? FLOAT_DIRS[dir].start : [0, 0];
        const x = (box.left - arena.left + box.width / 2) / k + spread + ox + (Math.random() - 0.5) * (dir && dir !== 'up' ? 14 : 30);
        // Numbers start just above the visible head, not the sprite's transparent top rows. A
        // monster's ability name starts a little lower and sinks, clear of the rising damage numbers.
        const low = cls.includes('ability') ? 8 : 0;
        const y = (box.top - arena.top) / k + Number(target.dataset.head ?? 0) + 4 + oy + low + (Math.random() - 0.5) * 16;
        // A big blow's numbers are larger and linger as long as the slowdown does.
        const big = emphasis > 1 ? `;scale:${emphasis.toFixed(2)};z-index:1` : '';
        const fly = dir ? `;--fx:${FLOAT_DIRS[dir].end[0]}px;--fy:${FLOAT_DIRS[dir].end[1]}px` : '';
        const el = h('div', {class: 'floater ' + cls + (dir ? ' fly' : ''), style: `left:${x}px;top:${y}px;animation-delay:${hitDelay(hitIndex)}ms${big}${fly}`}, text);
        el.addEventListener('animationend', () => el.remove());
        // A backstop in case the animation never reports its end (a hidden tab, reduced motion).
        // Long enough for a number slowed by the time dilation.
        window.setTimeout(() => el.remove(), 5 * (1200 + hitDelay(hitIndex)) + 300);
        this.floaters.appendChild(el);
    }
}

// Where a number on the hero starts (offset from the usual spot) and how far it travels, in arena
// pixels: damage rises, blocks go right, dodges go left, reflected hits drop down and right.
type FloatDir = 'up' | 'left' | 'right' | 'downRight';
const FLOAT_DIRS: Record<FloatDir, {start: [number, number], end: [number, number]}> = {
    up: {start: [0, -6], end: [0, -38]},
    left: {start: [-26, 6], end: [-36, -8]},
    right: {start: [26, 6], end: [36, -8]},
    // Starts at the body, below the face.
    downRight: {start: [24, 54], end: [30, 26]},
};
// A hit's number with its crit marks. Crits stack without a cap, so marks collapse by fours:
// four plain "!" make one gold "!", four gold make one red, largest first (7 crits: gold ! then !!!).
export function critText(amount: number, crit: number): string | HTMLElement {
    const n = shortNumber(amount);
    if (!crit) return n;
    const red = Math.floor(crit / 16), gold = Math.floor(crit % 16 / 4), plain = crit % 4;
    if (!red && !gold) return n + '!'.repeat(plain);
    const mark = (cls: string, n: number) => n ? [h('span', {class: 'critmark ' + cls}, '!'.repeat(n))] : [];
    return h('span', {title: `${crit} crits`}, n, ...mark('red', red), ...mark('gold', gold), plain ? '!'.repeat(plain) : null);
}

function floatDir(text: string, cls: string): FloatDir | null {
    if (cls.includes('reflect') && cls.includes('dmg')) return 'downRight';
    if (text === 'dodge') return 'left';
    if (cls.includes('block')) return 'right';
    if (cls.includes('dmg')) return 'up';
    return null;
}

function svgEl(markup: string): Element {
    const t = document.createElement('template');
    t.innerHTML = markup;
    return t.content.firstElementChild!;
}

// The entrance: a fade and a short walk in (direction set by CSS for the hero or a monster).
// Game speed (1, 4 or 16), so entrances play in step with the engine's ENTRANCE_SECONDS pause.
let combatSpeed = 1;
export function setCombatSpeed(speed: number) { combatSpeed = speed; }

// Time dilation after a big blow to the hero: the game runs (1 - slow) as fast, held for a moment
// of real time, then eases back. A bigger blow during one takes over; a smaller one doesn't.
const BIG_HIT = 0.25;
// The longest settled() holds a hero back for the last fight's effects.
const MAX_SETTLE_MS = 3000;
const DILATION_HOLD_MS = 900;
const DILATION_EASE_MS = 600;
let dilationSlow = 0;
let dilationAt = -Infinity;
function currentSlow(now: number): number {
    const t = now - dilationAt - DILATION_HOLD_MS;
    return t <= 0 ? dilationSlow : dilationSlow * Math.max(0, 1 - t / DILATION_EASE_MS);
}
// The view's own timeline: real time slowed by the dilation, in ms. Effects are scheduled on it at
// their normal offsets, so a slowdown stretches them all alike and never reorders them.
let viewClock = 0;
let viewLast = performance.now();
export function viewTime(now = performance.now()): number {
    if (now > viewLast) {
        viewClock += (now - viewLast) * timeScale(now);
        viewLast = now;
    }
    return viewClock;
}
function endDilation() { viewTime(); dilationSlow = 0; dilationAt = -Infinity; }
function dilate(slow: number) {
    const now = performance.now();
    viewTime(now);
    if (slow < currentSlow(now)) return;
    dilationSlow = slow;
    dilationAt = now;
}
// The game clock's rate right now: 1, or less while a big blow plays out.
export function timeScale(now = performance.now()): number { return 1 - currentSlow(now); }

// Entrance timings in game seconds; they all end within ENTRANCE_SECONDS.
// Fighters with art are placed by their feet: monster rows sit this much lower than icon rows
// (which are centered), and a boss's feet stay at or above BOSS_GROUND_MAX.
const GROUND_OFFSET = 17;
// Monster columns, as left positions in the monster layer for one, two or three columns; a column
// holds at most MAX_COLUMN (a fight of 13+ in one group would need a fifth column; none has that many). The front monster steps forward by its group's dx.
const MAX_COLUMN = 4;
const COLUMNS = [[38], [24, 60], [14, 42, 70], [10, 32, 54, 76]];
const LEAD_COLUMNS = [[26], [16, 36], [10, 26, 42], [8, 22, 36, 50]];
const MINION_COLUMNS = [[72], [60, 82], [54, 70, 86], [52, 64, 76, 88]];
const FLY_LIFT = 0.45;
const FLY_REF = 96;
const BOSS_GROUND_MAX = 68;

function enter(el: HTMLElement, delay: number, duration: number, speed = combatSpeed) {
    const d = delay * 1000 / speed, t = duration * 1000 / speed;
    el.style.animationDelay = `${d}ms`;
    el.style.animationDuration = `${t}ms`;
    restartClass(el, 'entering', 5 * (d + t) + 50, () => { el.style.animationDelay = ''; el.style.animationDuration = ''; });
}

// Plays a class's animation from the start. The class is dropped once the animation ends, so
// nothing can replay it later; the timer is a backstop (reduced motion, a hidden tab), long enough
// for an animation slowed by the time dilation.
const ANIMS: Record<string, string[]> = {...FX_ANIMS, casting: ['cast'], swinging: ['swing'], lunge: ['lunge-left', 'lunge-right'], struck: ['struck', 'struck-sprite'], entering: ['enter-left', 'enter-right', 'fade-in']};
function restartClass(el: HTMLElement, cls: string, ms = 1000, done?: () => void) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    const token = String(Math.random());
    el.dataset[cls] = token;
    const finish = () => {
        if (el.dataset[cls] !== token) return;
        delete el.dataset[cls];
        el.classList.remove(cls);
        el.removeEventListener('animationend', onEnd);
        done?.();
    };
    const onEnd = (e: AnimationEvent) => { if (ANIMS[cls]?.includes(e.animationName)) finish(); };
    el.addEventListener('animationend', onEnd);
    window.setTimeout(finish, ms);
}
// The first and last opaque rows of a sprite, as shares of its height (sprites carry transparent
// margins), read once per image.
const rowCache = new Map<string, {top: number, bottom: number}>();
function opaqueRows(img: HTMLImageElement): {top: number, bottom: number} {
    const hit = rowCache.get(img.src);
    if (hit) return hit;
    const w = img.naturalWidth, hgt = img.naturalHeight;
    if (!w || !hgt) return {top: 0, bottom: 1};
    let out = {top: 0, bottom: 1};
    try {
        const c = document.createElement('canvas');
        c.width = w; c.height = hgt;
        const g = c.getContext('2d')!;
        g.drawImage(img, 0, 0);
        const data = g.getImageData(0, 0, w, hgt).data;
        let top = -1, bottom = -1;
        for (let y = 0; y < hgt; y++) {
            for (let x = 0; x < w; x++) {
                if (data[(y * w + x) * 4 + 3] > 40) { if (top < 0) top = y; bottom = y; break; }
            }
        }
        if (top >= 0) out = {top: top / hgt, bottom: (bottom + 1) / hgt};
    } catch { /* unreadable image: use the whole box */ }
    rowCache.set(img.src, out);
    return out;
}

function lunge(el: HTMLElement) { restartClass(el, 'lunge'); }
function flash(el: HTMLElement) { restartClass(el, 'struck'); }
