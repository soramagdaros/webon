import { readFileSync } from 'node:fs';

const requiredFiles = ['index.html', 'src/main.js', 'src/styles.css'];
for (const file of requiredFiles) readFileSync(file, 'utf8');
const html = readFileSync('index.html', 'utf8');
const js = readFileSync('src/main.js', 'utf8');
const pkg = readFileSync('package.json', 'utf8');
const checks = [
  ['app title', html.includes('Thumbnail AI Studio')],
  ['canvas size', js.includes('CANVAS_WIDTH = 1920') && js.includes('CANVAS_HEIGHT = 1080')],
  ['no credential capture', !js.match(/password|contraseña|login\s*automation|selenium|playwright/i)],
  ['local storage history', js.includes('localStorage') && js.includes('thumbnail-ai-studio-history')],
  ['AI provider links only', js.includes('chatgpt.com') && js.includes('gemini.google.com') && js.includes('chat.deepseek.com')],
  ['node-only local server scripts', pkg.includes('node scripts/serve.mjs') && !pkg.includes('py' + 'thon') && !pkg.includes('http' + '.server')],
];
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('Static app checks failed:', failed.map(([name]) => name).join(', '));
  process.exit(1);
}
console.log('Static app checks passed.');
