const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const STORAGE_KEY = 'thumbnail-ai-studio-history';
const links = { ChatGPT: 'https://chatgpt.com/', Gemini: 'https://gemini.google.com/', DeepSeek: 'https://chat.deepseek.com/' };
const $ = (id) => document.getElementById(id);
const canvas = $('thumbnailCanvas');
const ctx = canvas.getContext('2d');

let layers = [];
let selectedId = null;
let drag = null;
let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

const controls = {
  videoTitle: $('videoTitle'), category: $('category'), visualStyle: $('visualStyle'), shortDescription: $('shortDescription'),
  viralText: $('viralText'), opacity: $('opacityRange'), rotation: $('rotationRange'), crop: $('cropRange'),
  opacityValue: $('opacityValue'), rotationValue: $('rotationValue'), cropValue: $('cropValue')
};

function id() { return Math.random().toString(36).slice(2, 10); }
function selected() { return layers.find((layer) => layer.id === selectedId); }
function formData() {
  return {
    videoTitle: controls.videoTitle.value.trim(),
    category: controls.category.value.trim() || 'YouTube',
    visualStyle: controls.visualStyle.value.trim() || 'alto contraste, viral',
    shortDescription: controls.shortDescription.value.trim() || 'Video diseñado para generar curiosidad y clics'
  };
}
function viralFromTitle() {
  const data = formData();
  const words = (data.videoTitle || data.category || 'NO LO CREERÁS').toUpperCase().replace(/[^A-ZÁÉÍÓÚÜÑ0-9\s]/g, '').split(/\s+/).filter(Boolean);
  return words.slice(0, Math.min(words.length, 4)).join(' ') || 'NO LO CREERÁS';
}

function promptPack() {
  const data = formData();
  const viral = controls.viralText.value.trim().toUpperCase() || viralFromTitle();
  const base = `Título del video: ${data.videoTitle || 'Mi video viral'}\nCategoría: ${data.category}\nEstilo visual: ${data.visualStyle}\nDescripción breve: ${data.shortDescription}`;
  const hashtags = 'Pide también los hashtags más virales del tema, mezclando español e inglés, y sepáralos por intención: alcance, nicho y tendencia.';
  return {
    ChatGPT: `Actúa como estratega experto de YouTube.\n${base}\n\nGenera: concepto de portada 1920x1080, texto gigante CTR tipo MrBeast, composición con personaje y logo, paleta de color, descripción SEO, títulos alternativos y ${hashtags}`,
    Gemini: `Crea una propuesta de miniatura YouTube 1920x1080.\n${base}\n\nQuiero una composición viral de alto contraste, emoción exagerada, espacio para texto "${viral}", guía de edición, descripción SEO y ${hashtags}`,
    DeepSeek: `Optimiza esta miniatura para CTR alto.\n${base}\n\nDevuelve texto corto de 3 a 5 palabras, layout, elementos visuales, prompts de imagen, descripción SEO para YouTube y ${hashtags}`,
    Visual: `Miniatura de YouTube 1920x1080, ${data.visualStyle}, tema "${data.videoTitle || data.category}", fondo épico al centro, personaje grande a la derecha, logo arriba a la derecha, espacio limpio a la izquierda para texto gigante "${viral}", iluminación dramática, colores saturados, sombra dura, glow, ultra detallado, sin marcas de agua. Incluye hashtags virales relacionados con el tema.`
  };
}
function seoText() {
  const data = formData();
  const tag = data.category.replace(/\s+/g, '');
  return `Descubre ${data.videoTitle || 'este video viral'}: una experiencia de ${data.category} creada para enganchar desde el primer segundo. En este video verás momentos impactantes, claves útiles y una historia visual que mantiene la atención hasta el final.\n\nSi te gustan los retos, las reacciones, las sorpresas y el contenido de alto impacto, esta miniatura y este video están optimizados para que se entiendan rápido, destaquen en YouTube y generen más clics.\n\nHashtags virales sugeridos: #${tag} #Viral #YouTube #Shorts #Tendencias #MrBeastStyle #ContenidoViral #MiniaturaViral #CTR #VideoViral`;
}

function fitCover(layer) {
  const scale = Math.max(CANVAS_WIDTH / layer.image.width, CANVAS_HEIGHT / layer.image.height);
  layer.w = layer.image.width * scale;
  layer.h = layer.image.height * scale;
  layer.x = (CANVAS_WIDTH - layer.w) / 2;
  layer.y = (CANVAS_HEIGHT - layer.h) / 2;
}
function addBaseText() {
  const layer = { id: id(), type: 'text', name: 'Texto viral', text: controls.viralText.value || 'NO LO CREERÁS', x: 86, y: 320, w: 780, h: 190, rotation: -2, opacity: 1, locked: false, shadow: true, glow: true, outline: true, fontSize: 138, fill: '#facc15', stroke: '#020617', crop: 0 };
  layers.push(layer); selectedId = layer.id; render();
}
function addImageLayer(image, name, placement) {
  const layer = { id: id(), type: 'image', name, image, x: 120, y: 120, w: image.width, h: image.height, rotation: 0, opacity: 1, locked: false, shadow: true, glow: false, border: false, crop: 0 };
  if (placement === 'background') { layer.name = 'Fondo IA'; fitCover(layer); layers = layers.filter((item) => item.name !== 'Fondo IA'); layers.unshift(layer); }
  if (placement === 'person') { const s = 840 / image.height; layer.w = image.width * s; layer.h = 840; layer.x = CANVAS_WIDTH - layer.w - 90; layer.y = 165; layers.push(layer); }
  if (placement === 'logo') { const s = 230 / image.width; layer.w = 230; layer.h = image.height * s; layer.x = CANVAS_WIDTH - layer.w - 75; layer.y = 55; layers.push(layer); }
  selectedId = layer.id; render();
}

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  grad.addColorStop(0, '#111827'); grad.addColorStop(.48, '#312e81'); grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = 'rgba(236,72,153,.18)'; ctx.beginPath(); ctx.arc(220, 160, 420, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(34,211,238,.16)'; ctx.beginPath(); ctx.arc(1660, 180, 380, 0, Math.PI * 2); ctx.fill();
}
function drawLayer(layer) {
  ctx.save(); ctx.globalAlpha = layer.opacity; ctx.translate(layer.x + layer.w / 2, layer.y + layer.h / 2); ctx.rotate((layer.rotation || 0) * Math.PI / 180);
  if (layer.shadow) { ctx.shadowColor = 'rgba(0,0,0,.82)'; ctx.shadowBlur = 28; ctx.shadowOffsetX = 12; ctx.shadowOffsetY = 14; }
  if (layer.glow) { ctx.shadowColor = 'rgba(34,211,238,.95)'; ctx.shadowBlur = 38; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }
  if (layer.type === 'image') {
    const crop = (layer.crop || 0) / 100;
    const sx = layer.image.width * crop; const sw = layer.image.width * (1 - crop * 2);
    ctx.drawImage(layer.image, sx, 0, sw, layer.image.height, -layer.w / 2, -layer.h / 2, layer.w, layer.h);
    if (layer.border) { ctx.strokeStyle = '#facc15'; ctx.lineWidth = 12; ctx.strokeRect(-layer.w / 2, -layer.h / 2, layer.w, layer.h); }
  } else {
    ctx.font = `900 ${layer.fontSize}px Impact, Arial Black, sans-serif`; ctx.textBaseline = 'top'; ctx.lineJoin = 'round';
    const lines = wrapText(layer.text, layer.w, layer.fontSize);
    lines.forEach((line, i) => {
      const y = -layer.h / 2 + i * layer.fontSize * .92;
      if (layer.outline) { ctx.strokeStyle = layer.stroke; ctx.lineWidth = 14; ctx.strokeText(line, -layer.w / 2, y); }
      ctx.fillStyle = layer.fill; ctx.fillText(line, -layer.w / 2, y);
    });
  }
  if (layer.id === selectedId) drawSelection(layer);
  ctx.restore();
}
function wrapText(text, maxWidth, size) {
  const words = text.split(/\s+/); const lines = []; let line = '';
  ctx.font = `900 ${size}px Impact, Arial Black, sans-serif`;
  words.forEach((word) => { const test = line ? `${line} ${word}` : word; if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; } else line = test; });
  if (line) lines.push(line); return lines;
}
function drawSelection(layer) {
  ctx.save(); ctx.shadowColor = 'transparent'; ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 4; ctx.setLineDash([18, 10]); ctx.strokeRect(-layer.w / 2, -layer.h / 2, layer.w, layer.h); ctx.setLineDash([]); ctx.fillStyle = '#facc15'; ctx.fillRect(layer.w / 2 - 15, layer.h / 2 - 15, 30, 30); ctx.restore();
}
function render() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); drawBackground(); layers.forEach(drawLayer); drawGuides(); updateLayersList(); updateControls();
}
function drawGuides() {
  const layer = selected(); if (!layer) return; const cx = layer.x + layer.w / 2; const cy = layer.y + layer.h / 2;
  ctx.save(); ctx.strokeStyle = 'rgba(250,204,21,.7)'; ctx.lineWidth = 3; ctx.setLineDash([14, 14]);
  if (Math.abs(cx - CANVAS_WIDTH / 2) < 22) { ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH / 2, 0); ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT); ctx.stroke(); }
  if (Math.abs(cy - CANVAS_HEIGHT / 2) < 22) { ctx.beginPath(); ctx.moveTo(0, CANVAS_HEIGHT / 2); ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2); ctx.stroke(); }
  ctx.restore();
}
function updateControls() {
  const layer = selected(); const disabled = !layer;
  document.querySelectorAll('#centerBtn,#fitBtn,#resetBtn,#duplicateBtn,#frontBtn,#backBtn,#lockBtn,#deleteBtn,#opacityRange,#rotationRange,#cropRange,.effects button').forEach((el) => el.disabled = disabled);
  if (!layer) return;
  controls.opacity.value = layer.opacity; controls.rotation.value = layer.rotation; controls.crop.value = layer.crop || 0;
  controls.opacityValue.textContent = `${Math.round(layer.opacity * 100)}%`; controls.rotationValue.textContent = `${Math.round(layer.rotation)}°`; controls.cropValue.textContent = `${Math.round(layer.crop || 0)}%`;
}
function updateLayersList() {
  $('layersList').innerHTML = layers.map((layer, index) => `<button class="layer-item ${layer.id === selectedId ? 'active' : ''}" data-layer="${layer.id}"><span>${layer.name}</span><small>#${index + 1}</small></button>`).reverse().join('');
}

function canvasPoint(evt) { const r = canvas.getBoundingClientRect(); return { x: (evt.clientX - r.left) * CANVAS_WIDTH / r.width, y: (evt.clientY - r.top) * CANVAS_HEIGHT / r.height }; }
function hitTest(point) { for (let i = layers.length - 1; i >= 0; i--) { const l = layers[i]; if (point.x >= l.x && point.x <= l.x + l.w && point.y >= l.y && point.y <= l.y + l.h) return l; } return null; }
canvas.addEventListener('pointerdown', (evt) => { const p = canvasPoint(evt); const hit = hitTest(p); selectedId = hit?.id || null; if (hit && !hit.locked) drag = { id: hit.id, dx: p.x - hit.x, dy: p.y - hit.y }; canvas.setPointerCapture(evt.pointerId); render(); });
canvas.addEventListener('pointermove', (evt) => { if (!drag) return; const layer = layers.find((l) => l.id === drag.id); const p = canvasPoint(evt); layer.x = p.x - drag.dx; layer.y = p.y - drag.dy; const cx = layer.x + layer.w / 2; const cy = layer.y + layer.h / 2; if (Math.abs(cx - CANVAS_WIDTH / 2) < 18) layer.x = CANVAS_WIDTH / 2 - layer.w / 2; if (Math.abs(cy - CANVAS_HEIGHT / 2) < 18) layer.y = CANVAS_HEIGHT / 2 - layer.h / 2; render(); });
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', (evt) => { const layer = selected(); if (!layer || layer.locked) return; evt.preventDefault(); const factor = evt.deltaY < 0 ? 1.045 : .955; layer.w *= factor; layer.h *= factor; render(); }, { passive: false });

async function fileToImage(file, removeBg = false) {
  const url = await new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(file); });
  const img = await new Promise((resolve) => { const image = new Image(); image.onload = () => resolve(image); image.src = url; });
  if (!removeBg) return img;
  const off = document.createElement('canvas'); off.width = img.width; off.height = img.height; const offCtx = off.getContext('2d'); offCtx.drawImage(img, 0, 0);
  const frame = offCtx.getImageData(0, 0, off.width, off.height);
  for (let i = 0; i < frame.data.length; i += 4) { const r = frame.data[i], g = frame.data[i + 1], b = frame.data[i + 2]; if ((r > 225 && g > 225 && b > 225) || (g > 130 && g > r * 1.25 && g > b * 1.25)) frame.data[i + 3] = 0; }
  offCtx.putImageData(frame, 0, 0); const clean = new Image(); clean.src = off.toDataURL('image/png'); await clean.decode(); return clean;
}
async function upload(input, placement, removeBg = false) { const file = input.files?.[0]; if (!file) return; const img = await fileToImage(file, removeBg); addImageLayer(img, placement === 'logo' ? 'Logo' : placement === 'background' ? 'Fondo IA' : 'Personaje', placement); input.value = ''; }
$('generatedUpload').addEventListener('change', (e) => upload(e.target, 'background'));
$('personUpload').addEventListener('change', (e) => upload(e.target, 'person'));
$('personBgUpload').addEventListener('change', (e) => upload(e.target, 'person', true));
$('logoUpload').addEventListener('change', (e) => upload(e.target, 'logo'));

function autoMerge() {
  const bg = layers.find((l) => l.name === 'Fondo IA'); if (bg) { fitCover(bg); layers = [bg, ...layers.filter((l) => l.id !== bg.id)]; }
  let text = layers.find((l) => l.type === 'text'); if (!text) { addBaseText(); text = selected(); }
  text.text = controls.viralText.value.toUpperCase(); text.x = 86; text.y = 315; text.w = 820; text.h = 250; text.fontSize = 142; text.rotation = -2; text.opacity = 1; text.shadow = true; text.glow = true; text.outline = true;
  const person = layers.findLast((l) => l.name === 'Personaje'); if (person) { const s = 860 / person.image.height; person.w = person.image.width * s; person.h = 860; person.x = CANVAS_WIDTH - person.w - 80; person.y = 160; person.rotation = 0; person.opacity = 1; }
  const logo = layers.findLast((l) => l.name === 'Logo'); if (logo) { const s = 220 / logo.image.width; logo.w = 220; logo.h = logo.image.height * s; logo.x = CANVAS_WIDTH - logo.w - 60; logo.y = 52; logo.rotation = 0; logo.opacity = 1; }
  layers = layers.filter((l) => !['Texto viral', 'Personaje', 'Logo'].includes(l.name)).concat([text], person ? [person] : [], logo ? [logo] : []);
  selectedId = text.id; render();
}
function applyEffect(effect) { const layer = selected(); if (!layer) return; if (effect === 'shadow') layer.shadow = !layer.shadow; if (effect === 'glow') layer.glow = !layer.glow; if (effect === 'outline') layer.outline = !layer.outline; if (effect === 'border') layer.border = !layer.border; render(); }
function exportImage(format) { selectedId = null; render(); const data = canvas.toDataURL(`image/${format}`, .92); const a = document.createElement('a'); a.href = data; a.download = `thumbnail-ai-studio-${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`; a.click(); history.unshift({ title: formData().videoTitle || 'Sin título', date: new Date().toLocaleString(), image: data }); history = history.slice(0, 12); localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); renderHistory(); render(); }

$('addTextBtn').addEventListener('click', addBaseText); $('autoMergeBtn').addEventListener('click', autoMerge); $('exportPngBtn').addEventListener('click', () => exportImage('png')); $('exportJpgBtn').addEventListener('click', () => exportImage('jpeg'));
$('centerBtn').addEventListener('click', () => { const l = selected(); if (l) { l.x = (CANVAS_WIDTH - l.w) / 2; l.y = (CANVAS_HEIGHT - l.h) / 2; render(); } });
$('fitBtn').addEventListener('click', () => { const l = selected(); if (l) { const s = Math.min(CANVAS_WIDTH / l.w, CANVAS_HEIGHT / l.h); l.w *= s; l.h *= s; l.x = (CANVAS_WIDTH - l.w) / 2; l.y = (CANVAS_HEIGHT - l.h) / 2; render(); } });
$('resetBtn').addEventListener('click', () => { const l = selected(); if (l) { Object.assign(l, { x: 120, y: 120, rotation: 0, opacity: 1, crop: 0 }); render(); } });
$('duplicateBtn').addEventListener('click', () => { const l = selected(); if (l) { const copy = { ...l, id: id(), name: `${l.name} copia`, x: l.x + 55, y: l.y + 55 }; layers.push(copy); selectedId = copy.id; render(); } });
$('frontBtn').addEventListener('click', () => { const l = selected(); if (l) { layers = layers.filter((x) => x.id !== l.id).concat(l); render(); } });
$('backBtn').addEventListener('click', () => { const l = selected(); if (l) { layers = [l].concat(layers.filter((x) => x.id !== l.id)); render(); } });
$('lockBtn').addEventListener('click', () => { const l = selected(); if (l) { l.locked = !l.locked; render(); } });
$('deleteBtn').addEventListener('click', () => { layers = layers.filter((l) => l.id !== selectedId); selectedId = null; render(); });
controls.opacity.addEventListener('input', (e) => { const l = selected(); if (l) { l.opacity = Number(e.target.value); render(); } });
controls.rotation.addEventListener('input', (e) => { const l = selected(); if (l) { l.rotation = Number(e.target.value); render(); } });
controls.crop.addEventListener('input', (e) => { const l = selected(); if (l) { l.crop = Number(e.target.value); render(); } });
document.querySelector('.effects').addEventListener('click', (e) => { if (e.target.dataset.effect) applyEffect(e.target.dataset.effect); });
$('layersList').addEventListener('click', (e) => { const btn = e.target.closest('[data-layer]'); if (btn) { selectedId = btn.dataset.layer; render(); } });

function renderPrompts() {
  const grid = $('promptGrid'); const prompts = promptPack();
  grid.innerHTML = Object.entries(prompts).map(([name, text]) => `<article class="prompt-box"><h3>Prompt ${name}</h3><p id="prompt-${name}">${text}</p><div class="prompt-actions"><button class="copy-btn" data-copy="${encodeURIComponent(text)}">Copiar prompt</button>${links[name] ? `<button data-open="${links[name]}">Abrir ${name}</button>` : ''}</div></article>`).join('');
  $('seoText').value = seoText();
}
function renderHistory() {
  $('historyList').innerHTML = history.length ? history.map((item, i) => `<a href="${item.image}" download="thumbnail-historial-${i}.png"><img src="${item.image}" alt="${item.title}"><strong>${item.title}</strong><span>${item.date}</span></a>`).join('') : '<p class="hint">Las exportaciones se guardan solo en LocalStorage de este navegador.</p>';
}
document.addEventListener('click', async (e) => { if (e.target.dataset.copy) { await navigator.clipboard.writeText(decodeURIComponent(e.target.dataset.copy)); e.target.textContent = 'Copiado'; setTimeout(renderPrompts, 900); } if (e.target.dataset.open) window.open(e.target.dataset.open, '_blank', 'noopener,noreferrer'); if (e.target.dataset.copyTarget) { await navigator.clipboard.writeText($(e.target.dataset.copyTarget).value); e.target.textContent = 'Copiado'; setTimeout(() => e.target.textContent = 'Copiar descripción SEO', 900); } });
[controls.videoTitle, controls.category, controls.visualStyle, controls.shortDescription].forEach((input) => input.addEventListener('input', () => { controls.viralText.value = viralFromTitle(); renderPrompts(); const text = layers.find((l) => l.type === 'text'); if (text) { text.text = controls.viralText.value; render(); } }));
controls.viralText.addEventListener('input', () => { controls.viralText.value = controls.viralText.value.toUpperCase(); renderPrompts(); const text = layers.find((l) => l.type === 'text'); if (text) { text.text = controls.viralText.value; render(); } });

addBaseText(); renderPrompts(); renderHistory(); render();
