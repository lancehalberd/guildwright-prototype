// Dev tool: review art and layout without playing. One tab steps through every quest's encounters
// laid out exactly as the battle view (or the run panel's small arena) draws them; the other shows
// each class's portrait and battle sprite for both looks.
import {classes, monsters, questOrder, quests} from '../data/quests';
import {monsterKit} from '../engine/abilities';
import {h} from './dom';
import {CombatView} from './combatView';
import {ATTACK_ANIMS, HIT_EFFECTS, type Side} from './attackFx';
import {heroLook, portraitUrl, heroSpriteUrl, heroAttackUrl, heroWeaponSprites, type Look} from './portraits';

const ARENA_H = 210;
const STORE = 'guildwright-preview';
const LOOKS: Look[] = ['female', 'male'];
const WEAPON_ORDER = ['sword', 'axe', 'greatsword'];

interface Entry {label: string, keys: string[], boss: boolean, featured: boolean}

// Everything a quest can put in the arena: its encounters in order, then its ambition and rite bosses.
function questEntries(questKey: string): Entry[] {
    const quest = quests[questKey];
    const out: Entry[] = quest.encounters.map((e, i) => ({label: `${i + 1} · ${e.tier}`, keys: e.monsters, boss: false, featured: e.tier === 'R'}));
    if (quest.boss) out.push({label: 'Ambition boss', keys: [quest.boss.monster], boss: true, featured: true});
    const rite = quest.modifiers.find(m => m.rite)?.rite;
    if (rite) out.push({label: 'Rite boss', keys: [rite.boss], boss: true, featured: true});
    return out;
}

function lookName(classKey: string, look: Look): string {
    const names = classes[classKey].names;
    return names.find(n => heroLook({name: n}) === look) ?? names[0];
}

interface Prefs {tab: 'encounters' | 'classes', quest: string, index: number, cls: string, look: Look, size: 'battle' | 'panel', doubled: boolean, weapon: string, attacker: number, anim: string, effect: string, number: 'none' | 'normal' | 'crit' | 'crit7' | 'crit21', loop: boolean}

function loadPrefs(): Prefs {
    const base: Prefs = {tab: 'encounters', quest: questOrder[0], index: 0, cls: 'warrior', look: 'female', size: 'battle', doubled: false, weapon: '', attacker: -1, anim: 'auto', effect: 'auto', number: 'normal', loop: false};
    try {
        const saved = JSON.parse(localStorage.getItem(STORE) ?? 'null');
        if (saved && typeof saved === 'object') Object.assign(base, saved);
    } catch { /* storage unavailable */ }
    if (!quests[base.quest]) base.quest = questOrder[0];
    if (!classes[base.cls]) base.cls = 'warrior';
    return base;
}

function savePrefs(p: Prefs) {
    try { localStorage.setItem(STORE, JSON.stringify(p)); } catch { /* storage unavailable */ }
}

let open: {el: HTMLElement, close: () => void} | null = null;

export function previewOpen(): boolean { return !!open; }
export function closePreview() { open?.close(); }

export function openPreview(parent: HTMLElement) {
    if (open) return;
    const prefs = loadPrefs();
    const view = new CombatView();
    const stage = h('div', {class: 'pv-stage'}, view.el);
    const caption = h('div', {class: 'pv-caption'});
    const classesEl = h('div', {class: 'pv-classes'});

    const select = (options: [string, string][], value: string, onchange: (v: string) => void) => {
        const el = h('select', {onchange: () => onchange(el.value)}, ...options.map(([v, label]) => h('option', {value: v}, label))) as HTMLSelectElement;
        el.value = value;
        return el;
    };
    const questSel = select(questOrder.map(k => [k, quests[k].name]), prefs.quest, v => { prefs.quest = v; prefs.index = 0; draw(true); });
    const encSel = h('select', {onchange: () => { prefs.index = Number(encSel.value); draw(true); }}) as HTMLSelectElement;
    const step = (d: number) => {
        const n = questEntries(prefs.quest).length;
        prefs.index = (prefs.index + d + n) % n;
        draw(true);
    };
    const doubled = h('input', {type: 'checkbox', onchange: () => { prefs.doubled = doubled.checked; draw(true); }}) as HTMLInputElement;
    doubled.checked = prefs.doubled;
    // Attack test: who attacks, with what, how it moves and how the hit lands. Options that the
    // chosen hero can't use yet stay listed but disabled, so the menus show what's still to draw.
    const weaponSel = h('select', {title: 'Weapon (weapon-swap test sprites)', onchange: () => { prefs.weapon = weaponSel.value; draw(false); }}) as HTMLSelectElement;
    const sideSel = h('select', {title: 'Who attacks', onchange: () => { prefs.attacker = Number(sideSel.value); prefs.anim = 'auto'; syncAttack(); }}) as HTMLSelectElement;
    const animSel = h('select', {title: 'Attack animation or monster ability', onchange: () => { prefs.anim = animSel.value; savePrefs(prefs); }}) as HTMLSelectElement;
    const effectSel = select(HIT_EFFECTS.map(e => [e.key, e.label]), prefs.effect, v => { prefs.effect = v; savePrefs(prefs); });
    const numberSel = select([['normal', 'Damage number'], ['crit', 'Crit number'], ['crit7', 'Crit ×7 number'], ['crit21', 'Crit ×21 number'], ['none', 'No number']], prefs.number, v => { prefs.number = v as Prefs['number']; savePrefs(prefs); });
    const loop = h('input', {type: 'checkbox', onchange: () => { prefs.loop = loop.checked; savePrefs(prefs); restartLoop(); }}) as HTMLInputElement;
    loop.checked = prefs.loop;
    const attackNote = h('span', {class: 'muted small'});
    const attack = () => {
        const played = view.previewAttack({slot: prefs.attacker, anim: prefs.anim, effect: prefs.effect, number: prefs.number});
        attackNote.textContent = `Played: ${played}`;
    };
    let loopTimer = 0;
    const restartLoop = () => {
        window.clearInterval(loopTimer);
        if (prefs.loop && prefs.tab === 'encounters') loopTimer = window.setInterval(attack, 1400);
    };
    // Jump to the first encounter with a monster that has abilities.
    const kitMonsters = Object.values(monsters).filter(m => monsterKit(m.key)).map(m => {
        for (const q of questOrder) {
            const i = questEntries(q).findIndex(e => e.keys.includes(m.key));
            if (i >= 0) return {key: m.key, name: m.name, quest: q, index: i, hand: !!m.abilities};
        }
        return null;
    }).filter((x): x is NonNullable<typeof x> => !!x).sort((x, y) => Number(y.hand) - Number(x.hand) || x.name.localeCompare(y.name));
    const jumpSel = h('select', {title: 'Jump to a monster with abilities', onchange: () => {
        const m = kitMonsters.find(k => k.key === jumpSel.value);
        jumpSel.value = '';
        if (!m) return;
        prefs.quest = m.quest; questSel.value = m.quest; prefs.index = m.index;
        currentKeys = [];
        pendingAttacker = m.key;
        draw(true);
    }}, h('option', {value: ''}, 'Jump to monster with abilities…'),
        ...kitMonsters.map(m => h('option', {value: m.key}, `${m.name}${m.hand ? ' ★' : ''}`))) as HTMLSelectElement;
    let currentKeys: string[] = [];
    let pendingAttacker: string | null = null;
    const syncAttack = () => {
        if (pendingAttacker) {
            const slot = currentKeys.indexOf(pendingAttacker);
            if (slot >= 0) { prefs.attacker = slot; prefs.anim = 'auto'; }
            pendingAttacker = null;
        }
        if (prefs.attacker >= currentKeys.length) prefs.attacker = -1;
        sideSel.replaceChildren(h('option', {value: '-1'}, 'Hero attacks'), ...currentKeys.map((k, i) => h('option', {value: String(i)}, `${monsters[k]?.name ?? k} attacks${monsterKit(k) ? ' (abilities)' : ''}`)));
        sideSel.value = String(prefs.attacker);
        const side: Side = prefs.attacker < 0 ? 'hero' : 'monster';
        const attacker = side === 'hero' ? view.el.querySelector<HTMLElement>('.hero') : view.el.querySelector<HTMLElement>('.monster');
        const kit = side === 'monster' ? monsterKit(currentKeys[prefs.attacker]) : null;
        const kitOptions = (kit ?? []).map((k, i) => h('option', {value: `ability:${i}`}, `${k.basic ? 'Basic' : 'Ability'}: ${k.name}${k.basic ? '' : ` (every ${k.every} turns)`}`));
        animSel.replaceChildren(...kitOptions, ...ATTACK_ANIMS.map(a => {
            const ok = !!attacker && a.available(attacker, side);
            return h('option', {value: a.key, disabled: !ok}, ok ? a.label : `${a.label} (not drawn)`);
        }));
        const valid = [...animSel.options].some(o => o.value === prefs.anim && !o.disabled);
        if (!valid) prefs.anim = kit ? 'ability:0' : 'auto';
        animSel.value = prefs.anim;
        weaponSel.disabled = side !== 'hero';
        savePrefs(prefs);
    };
    const attackTools = h('div', {class: 'pv-tools'},
        h('strong', {class: 'small'}, 'Attack test'),
        jumpSel, sideSel, weaponSel, animSel, effectSel, numberSel,
        h('button', {class: 'btn', title: 'Play one attack (A)', onclick: () => attack()}, 'Play attack'),
        h('label', {class: 'pv-check', title: 'Repeat the attack every 1.2 seconds'}, loop, 'Loop'),
        attackNote,
    );
    const encTools = h('div', {class: 'pv-tools'},
        questSel,
        h('button', {class: 'btn', title: 'Previous encounter (←)', onclick: () => step(-1)}, '‹'),
        encSel,
        h('button', {class: 'btn', title: 'Next encounter (→)', onclick: () => step(1)}, '›'),
        select(Object.values(classes).map(c => [c.key, c.name]), prefs.cls, v => { prefs.cls = v; draw(false); }),
        select(LOOKS.map(l => [l, l === 'female' ? 'Female' : 'Male']), prefs.look, v => { prefs.look = v as Look; draw(false); }),
        select([['battle', 'Battle view'], ['panel', 'Run panel']], prefs.size, v => { prefs.size = v as Prefs['size']; draw(false); }),
        h('label', {class: 'pv-check', title: 'As under a modifier that doubles every monster'}, doubled, 'Doubled'),
        h('button', {class: 'btn', title: 'Replay the entrance (R)', onclick: () => draw(true)}, 'Replay'),
    );
    const encPane = h('div', {class: 'pv-pane'}, encTools, attackTools, caption, stage);
    const classPane = h('div', {class: 'pv-pane pv-scroll'}, classesEl);

    const tabBtn = (tab: Prefs['tab'], label: string) => h('button', {class: 'btn', onclick: () => { prefs.tab = tab; draw(tab === 'encounters'); }}, label);
    const tabs = [tabBtn('encounters', 'Encounters'), tabBtn('classes', 'Classes')];
    const el = h('section', {class: 'artpreview', 'aria-label': 'Art preview'},
        h('header', {class: 'pv-head'},
            h('strong', null, 'Art preview'),
            h('div', {class: 'pv-tabs'}, ...tabs),
            h('button', {class: 'btn', title: 'Close (Esc)', onclick: () => closePreview()}, 'Close')),
        encPane, classPane);

    const place = () => {
        const w = stage.clientWidth, hgt = stage.clientHeight;
        if (!w || !hgt) return;
        const big = prefs.size === 'battle';
        // Same fit as the battle view: the largest whole scale up to 3x; the run panel is 1x.
        const k = big ? Math.max(1, Math.min(3, Math.floor((hgt - 16) / ARENA_H), Math.floor(w / 300))) : 1;
        const baseW = big ? Math.min(600, Math.floor((w - 24) / k)) : Math.min(360, w - 24);
        view.el.classList.toggle('big', big);
        stage.classList.toggle('big', big);
        Object.assign(view.el.style, {left: `${Math.round((w - baseW * k) / 2) / k}px`, top: `${Math.max(0, Math.round((hgt - ARENA_H * k) / 2)) / k}px`, width: `${baseW}px`, zoom: String(k)});
        stage.style.setProperty('--k', String(k));
    };

    const drawClasses = () => {
        classesEl.replaceChildren(...Object.values(classes).map(c => h('div', {class: 'pv-class'},
            h('h3', null, c.name),
            h('div', {class: 'pv-looks'}, ...LOOKS.map(look => {
                const hero = {name: lookName(c.key, look), classKey: c.key};
                const portrait = portraitUrl(hero), sprite = heroSpriteUrl(hero), swing = heroAttackUrl(hero);
                const weapons = Object.entries(heroWeaponSprites(hero)).sort(([a], [b]) => WEAPON_ORDER.indexOf(a) - WEAPON_ORDER.indexOf(b));
                return h('div', {class: 'pv-look'},
                    h('div', {class: 'pv-label'}, `${look === 'female' ? 'Female' : 'Male'} · ${hero.name}`),
                    h('div', {class: 'pv-art'},
                        portrait ? h('img', {class: 'pv-portrait', src: portrait, alt: `${c.name} ${look} portrait`}) : h('div', {class: 'pv-missing'}, 'No portrait'),
                        sprite ? h('div', {class: 'pv-sprite'}, h('img', {src: sprite, alt: `${c.name} ${look} battle sprite`})) : h('div', {class: 'pv-missing'}, 'No battle sprite')),
                    swing || weapons.length ? h('div', {class: 'pv-label'}, 'Animation tests') : null,
                    swing || weapons.length ? h('div', {class: 'pv-art'},
                        swing ? h('div', {class: 'pv-sprite pv-anim', title: 'Attack swing, looping'}, h('div', {class: 'pv-swing', style: `background-image:url(${swing})`})) : null,
                        ...weapons.map(([w, url]) => h('div', {class: 'pv-sprite', title: `Weapon-swap test: ${w}`}, h('img', {src: url, alt: `${c.name} ${look} with ${w}`})))) : null,
                    swing || weapons.length ? h('div', {class: 'muted small'}, [swing ? 'Swing' : '', ...weapons.map(([w]) => w[0].toUpperCase() + w.slice(1))].filter(Boolean).join(' · ')) : null);
            })))));
    };

    function draw(entrance: boolean) {
        savePrefs(prefs);
        tabs.forEach((b, i) => b.classList.toggle('on', (i === 0) === (prefs.tab === 'encounters')));
        encPane.hidden = prefs.tab !== 'encounters';
        classPane.hidden = prefs.tab !== 'classes';
        if (prefs.tab === 'classes') {
            restartLoop();
            if (!classesEl.childElementCount) drawClasses();
            return;
        }
        const entries = questEntries(prefs.quest);
        prefs.index = Math.min(prefs.index, entries.length - 1);
        encSel.replaceChildren(...entries.map((e, i) => h('option', {value: String(i)}, e.label)));
        encSel.value = String(prefs.index);
        const entry = entries[prefs.index];
        const keys = prefs.doubled && !entry.boss ? entry.keys.flatMap(k => [k, k]) : entry.keys;
        caption.textContent = `${quests[prefs.quest].name} · ${entry.label} · ${keys.map(k => monsters[k]?.name ?? k).join(', ')}`;
        const hero = {name: lookName(prefs.cls, prefs.look), classKey: prefs.cls};
        const weapons = heroWeaponSprites(hero);
        if (!weapons[prefs.weapon]) prefs.weapon = '';
        weaponSel.replaceChildren(h('option', {value: ''}, 'Standard weapon'), ...WEAPON_ORDER.map(w => {
            const name = w[0].toUpperCase() + w.slice(1);
            return h('option', {value: w, disabled: !weapons[w]}, weapons[w] ? name : `${name} (not drawn)`);
        }));
        weaponSel.value = prefs.weapon;
        attackNote.textContent = '';
        place();
        view.preview(prefs.quest, keys, entry.boss, entry.featured, hero, entrance, weapons[prefs.weapon]);
        currentKeys = keys;
        syncAttack();
        restartLoop();
    }

    const onKey = (e: KeyboardEvent) => {
        if (prefs.tab !== 'encounters' || (e.target as HTMLElement).tagName === 'SELECT') return;
        if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
        else if (e.key === 'r' || e.key === 'R') draw(true);
        else if (e.key === 'a' || e.key === 'A') attack();
    };
    const onResize = () => place();
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    parent.appendChild(el);
    open = {el, close: () => {
        window.clearInterval(loopTimer);
        document.removeEventListener('keydown', onKey);
        window.removeEventListener('resize', onResize);
        el.remove();
        open = null;
    }};
    draw(true);
}
