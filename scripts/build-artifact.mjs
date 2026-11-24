// Inlines the Vite build into one HTML page for sharing as a single file.
import {readdirSync, readFileSync, writeFileSync} from 'node:fs';

const assets = readdirSync('dist/assets');
const css = readFileSync('dist/assets/' + assets.find(f => f.endsWith('.css')), 'utf8');
const js = readFileSync('dist/assets/' + assets.find(f => f.endsWith('.js')), 'utf8');
if (js.includes('</script')) {
    throw new Error('Script contains a closing script tag');
}
const page = `<title>Guildwright</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alegreya+SC:wght@500;700&family=Alegreya+Sans:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>${css}</style>
<div id="app"></div>
<script type="module">${js}</script>
`;
writeFileSync('dist/guildwright.html', page);
console.log('Wrote dist/guildwright.html', page.length, 'bytes');
