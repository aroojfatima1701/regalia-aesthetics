// Builds the static preview: one bundle with hash routes (/#/menu, /#/checkout, /#/order).
// In the Next.js project each view becomes app/<route>/page.tsx. Run: node preview/build.mjs
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'dist');
const globalModules = execSync('npm root -g').toString().trim();
let build;
try { ({ build } = await import('esbuild')); } catch { ({ build } = await import('/opt/npm-tools/node_modules/esbuild/lib/main.js')); }

fs.mkdirSync(out, { recursive: true });
await build({
  entryPoints: [path.join(root, 'src/main.tsx')], outdir: out, entryNames: 'app', bundle: true, minify: true,
  jsx: 'automatic', format: 'iife', target: 'es2020', nodePaths: [path.join(root, 'node_modules'), globalModules],
  define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'warning', loader: { '.png': 'dataurl', '.jpg': 'dataurl', '.webp': 'dataurl' },
});
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Regalia Aesthetics · Beauty, Care, Confidence</title>
<meta name="description" content="Doctor-led skin and aesthetics clinic in Jumeirah, Dubai and the Upper East Side, New York. Book a consultation online.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@300;400;500;600&family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&display=swap">
<link rel="stylesheet" href="app.css">
</head>
<body>
<div id="root"></div>
<script src="app.js"></script>
</body>
</html>
`);
console.log('built', fs.readdirSync(out));

// Single-file page for the hosted preview: styles and script inlined.
const css = fs.readFileSync(path.join(out, 'app.css'), 'utf8');
const js = fs.readFileSync(path.join(out, 'app.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
fs.writeFileSync(path.join(out, 'regalia-aesthetics.html'), `<title>Regalia Aesthetics</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Doctor-led skin and aesthetics clinic in Dubai and New York.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@300;400;500;600&family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&display=swap">
<style>${css}</style>
<div id="root"></div>
<script>${js}</script>
`);
console.log('artifact page', Math.round(fs.statSync(path.join(out, 'regalia-aesthetics.html')).size / 1024), 'KB');
