import {defineConfig, type Plugin} from 'vite';

// `vite build --mode pages` (npm run build:pages) makes the GitHub Pages build in dist-pages/:
// readable, unminified code, with the images as separate files instead of data URIs.
function imagesAsFiles(): Plugin {
    return {
        name: 'images-as-files',
        enforce: 'pre',
        async resolveId(source, importer) {
            if (!/\.(webp|png)\?inline$/.test(source)) return null;
            return this.resolve(source.replace(/\?inline$/, '?url'), importer, {skipSelf: true});
        },
    };
}

// Relative base so the built game works from any folder or static host.
export default defineConfig(({mode}) => mode === 'pages' ? {
    base: './',
    plugins: [imagesAsFiles()],
    build: {outDir: 'dist-pages', minify: false, cssMinify: false, assetsInlineLimit: 0, sourcemap: false},
} : {base: './'});
