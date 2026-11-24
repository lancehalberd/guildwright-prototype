// Builds the OpenArt sheet prompts for the item icon variants (see src/data/itemIcons.ts).
// Output: JSON [{sheet, cols, rows, names: [...], prompt}] on stdout.
import {materialOrder, requireMaterial, plainKey} from '../src/data/materials';
import {itemTypeOrder} from '../src/data/items';
import {getBaseStats} from '../src/engine/crafting';
import {iconVariant} from '../src/data/itemIcons';

const seen = new Set<string>();
const order: string[] = [];
for (const t of itemTypeOrder) for (const k of materialOrder) {
    if (k !== plainKey(k) || !getBaseStats(requireMaterial(k), t)) continue;
    const v = iconVariant(t, k);
    if (!seen.has(v)) { seen.add(v); order.push(v); }
}
const tierOrder = {low: 0, mid: 1, high: 2} as Record<string, number>;
order.sort((a, b) => {
    const [ta, ra, xa = ''] = a.split('-'), [tb, rb, xb = ''] = b.split('-');
    return itemTypeOrder.indexOf(ta as never) - itemTypeOrder.indexOf(tb as never) || xa.localeCompare(xb) || tierOrder[ra] - tierOrder[rb];
});

const TIER: Record<string, string> = {
    low: 'crude starter quality: rough wood, copper, bone, hide and plain iron, simple shapes',
    mid: 'solid mid quality: forged steel and silver with modest trim and some detail',
    high: 'legendary high quality: ornate mithril and gold with gemstones and a faint magical glow',
};
const NOUN: Record<string, string> = {
    sword: 'one-handed sword', axe: 'one-handed axe', dagger: 'short dagger', wand: 'slim magic wand', greatsword: 'large two-handed greatsword',
    bow: 'recurve longbow with its string', staff: 'tall wizard staff with a topper', shield: 'shield', helmet: 'helmet', bodyArmor: 'body armor chest piece',
    gloves: 'pair of gloves', boots: 'pair of boots', belt: 'belt with a buckle, coiled', ring: 'finger ring', amulet: 'amulet pendant on a short chain',
};
const VARIANT: Record<string, string> = {
    armor: 'heavy metal plate armor style',
    evasion: 'light supple leather and fur style, agile ranger look',
    ward: 'mage cloth and enchanted style with glowing indigo and cyan runes',
    fire: 'imbued with fire: glowing orange ember cracks and small flames',
    cold: 'imbued with frost: pale icy blue crystals and rime',
    lightning: 'imbued with lightning: crackling bright yellow sparks',
};
function describe(v: string): string {
    const [type, tier, extra] = v.split('-');
    return `a ${NOUN[type]}, ${TIER[tier]}${extra ? `, ${VARIANT[extra]}` : ''}`;
}
const sheets: {sheet: string, cols: number, rows: number, names: string[], prompt: string}[] = [];
for (let i = 0; i < order.length; i += 25) {
    const names = order.slice(i, i + 25);
    const cols = names.length <= 9 ? 3 : 5, rows = cols;
    const cells = names.map((v, j) => `Row ${Math.floor(j / cols) + 1} column ${j % cols + 1}: ${describe(v)}.`).join(' ');
    const prompt = `Pixel art item icon sprite sheet for a 16-bit fantasy RPG inventory: a ${cols}x${rows} grid of ${names.length} equipment icons${names.length < cols * rows ? ' (the remaining cells at the end empty)' : ''}, on a solid flat pure magenta (#FF00FF) background with no gradient. ${cells} Weapons are shown diagonally (handle bottom left, tip top right). Every icon whole, centered in its own cell with a wide empty magenta margin, all icons at a similar size, nothing crossing between cells. Crisp pixel art with clear 1 pixel dark outlines, bright readable colors, light from the top left, simple shapes that read at small sizes. No text, no grid lines, no labels, no characters, no pink, purple or magenta in the icons themselves.`;
    sheets.push({sheet: `variants-${sheets.length + 1}`, cols, rows, names, prompt});
}
console.log(JSON.stringify(sheets, null, 1));
