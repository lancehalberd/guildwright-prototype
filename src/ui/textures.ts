// Panel textures, inlined and handed to the stylesheet as custom properties (a url() in the CSS
// itself would stay a separate file in the single-page build).
import parchment from '../assets/ui/parchment.webp?inline';
import darkwood from '../assets/ui/darkwood.webp?inline';

export function installTextures() {
    const root = document.documentElement.style;
    root.setProperty('--tex-parchment', `url("${parchment}")`);
    root.setProperty('--tex-darkwood', `url("${darkwood}")`);
}
