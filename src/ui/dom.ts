type Child = Node | string | number | null | undefined | false | Child[];
type Attrs = Record<string, string | number | boolean | undefined | ((event: MouseEvent) => void)>;

// Marks elements that carry event handlers, so a re-render never keeps one with stale handlers
// unless the whole element is identical.
// Handlers live in a map on the element behind one dispatcher per event type, so a re-render that
// keeps an identical element can hand it the new render's handlers (see adoptHandlers).
export type Listened = Element & {hasListeners?: boolean, handlers?: Record<string, EventListener>};

function listen(el: Listened, type: string, handler: EventListener) {
    el.handlers ??= {};
    if (!(type in el.handlers)) el.addEventListener(type, event => el.handlers?.[type]?.(event));
    el.handlers[type] = handler;
    el.hasListeners = true;
}

// old is being kept in place of next, an identical element from a newer render: give old (and its
// descendants) next's handlers, so they act on the newer render's data.
export function adoptHandlers(old: Node, next: Node) {
    if (!(old instanceof Element) || !(next instanceof Element)) return;
    const o = old as Listened, n = next as Listened;
    if (o.handlers || n.handlers) {
        const handlers = n.handlers ?? {};
        for (const type of Object.keys(handlers)) if (!o.handlers || !(type in o.handlers)) listen(o, type, handlers[type]);
        o.handlers = {...handlers};
    }
    const oc = old.children, nc = next.children;
    for (let i = 0; i < Math.min(oc.length, nc.length); i++) adoptHandlers(oc[i], nc[i]);
}

// Tiny element builder: h('button', {class: 'btn', onclick: fn}, 'Label').
export function h(tag: string, attrs: Attrs | null = null, ...children: Child[]): HTMLElement {
    const el = document.createElement(tag);
    if (attrs) {
        for (const [key, value] of Object.entries(attrs)) {
            if (value === undefined || value === false) {
                continue;
            }
            if (key.startsWith('on') && typeof value === 'function') {
                listen(el as Listened, key.slice(2), value as EventListener);
            } else if (value === true) {
                el.setAttribute(key, '');
            } else {
                el.setAttribute(key, String(value));
            }
        }
    }
    append(el, children);
    return el;
}

function append(el: HTMLElement, children: Child[]) {
    for (const child of children) {
        if (child === null || child === undefined || child === false) {
            continue;
        }
        if (Array.isArray(child)) {
            append(el, child);
        } else if (child instanceof Node) {
            el.appendChild(child);
        } else {
            el.appendChild(document.createTextNode(String(child)));
        }
    }
}

// SVG strings for map glyphs are fixed markup from this file, never user text.
export function svg(markup: string): HTMLElement {
    const wrap = document.createElement('span');
    wrap.innerHTML = markup;
    return wrap.firstElementChild as HTMLElement;
}

// Any number shown to the player: at most 2 decimals, no trailing zeros (1.7999999 -> "1.8").
export function num(value: number, digits = 2): string {
    const f = 10 ** digits;
    return String(Math.round(value * f) / f);
}

export function fmt(value: number, digits = 0): string {
    return value.toFixed(digits);
}

// At most 6 characters: whole numbers up to 999999, then 3 significant digits with a suffix
// (1.23M, 12.3M, 123M, then B, T, Qa). Rounds down so it never shows more than there is.
export function shortNumber(n: number): string {
    const v = Math.floor(n);
    if (v < 1e6) return String(v);
    const units = ['M', 'B', 'T', 'Qa'];
    let i = 0, x = v / 1e6;
    while (x >= 1000 && i < units.length - 1) { x /= 1000; i++; }
    const s = x < 10 ? (Math.floor(x * 100) / 100).toFixed(2) : x < 100 ? (Math.floor(x * 10) / 10).toFixed(1) : String(Math.floor(x));
    return s + units[i];
}
