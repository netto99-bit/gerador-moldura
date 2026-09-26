const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('fileInput');
const uploadZone = document.getElementById('uploadZone');
const uploadTitle = document.getElementById('uploadTitle');
const uploadHint = document.getElementById('uploadHint');
const zoomRange = document.getElementById('zoomRange');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const shareBtn = document.getElementById('shareBtn');
const status = document.getElementById('status');

const FRAME_VERSION = '8';
const W = 1080;
const H = 1920;

let image = null;
let offsetX = 0;
let offsetY = 0;
let dragging = false;
let last = { x: 0, y: 0 };

function setStatus(message) {
  status.textContent = message;
}

function resetTransform() {
  zoomRange.value = '1';
  offsetX = 0;
  offsetY = 0;
}

function getImageGeometry() {
  if (!image) return null;

  const zoom = Number(zoomRange.value);
  const base = Math.max(W / image.width, H / image.height);
  const scale = base * zoom;
  const dw = image.width * scale;
  const dh = image.height * scale;

  return {
    dw,
    dh,
    dx: (W - dw) / 2 + offsetX,
    dy: (H - dh) / 2 + offsetY
  };
}

function clampOffsets() {
  const g = getImageGeometry();
  if (!g) return;

  const maxX = Math.max(0, (g.dw - W) / 2);
  const maxY = Math.max(0, (g.dh - H) / 2);

  offsetX = Math.max(-maxX, Math.min(maxX, offsetX));
  offsetY = Math.max(-maxY, Math.min(maxY, offsetY));
}

function roundedRect(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawLeaf(cx, cy, rx, ry, angle) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPhoto() {
  if (!image) return;
  clampOffsets();
  const g = getImageGeometry();
  ctx.drawImage(image, g.dx, g.dy, g.dw, g.dh);
}

function drawPlaceholder() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#eef3ef');
  g.addColorStop(1, '#dce6df');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#61766b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 42px Inter, system-ui, sans-serif';
  ctx.fillText('Selecione sua foto', W / 2, H / 2);
}

function drawPrototypeFrame() {
  // Proteção discreta no topo, mantendo a foto como protagonista.
  const top = ctx.createLinearGradient(0, 0, 0, 360);
  top.addColorStop(0, 'rgba(4,63,35,.72)');
  top.addColorStop(.55, 'rgba(4,63,35,.22)');
  top.addColorStop(1, 'rgba(4,63,35,0)');
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, 360);

  // Selo do cargo — mantém a linguagem do primeiro protótipo.
  ctx.save();
  roundedRect(58, 66, 360, 78, 39);
  ctx.fillStyle = '#f28c28';
  ctx.fill();
  ctx.fillStyle = '#07512d';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 34px Anton, Impact, sans-serif';
  ctx.fillText('DEPUTADA ESTADUAL', 238, 108);
  ctx.restore();

  // Número compacto no topo direito.
  ctx.save();
  roundedRect(816, 66, 206, 78, 39);
  ctx.fillStyle = 'rgba(255,255,255,.95)';
  ctx.fill();
  ctx.fillStyle = '#0b6b3a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 38px Anton, Impact, sans-serif';
  ctx.fillText('43.333', 919, 108);
  ctx.restore();

  // Gradiente inferior do protótipo: foto inteira, informação apenas na base.
  const bottom = ctx.createLinearGradient(0, 930, 0, H);
  bottom.addColorStop(0, 'rgba(2,55,30,0)');
  bottom.addColorStop(.24, 'rgba(2,55,30,.22)');
  bottom.addColorStop(.52, 'rgba(2,55,30,.78)');
  bottom.addColorStop(1, 'rgba(2,55,30,.98)');
  ctx.fillStyle = bottom;
  ctx.fillRect(0, 900, W, H - 900);

  // Tipografia da Beth: assinatura + NORONHA condensado.
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0,0,0,.20)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  ctx.fillStyle = '#fffdf7';
  ctx.font = '400 150px "Kaushan Script", cursive';
  ctx.fillText('Beth', 70, 1370);

  // Folhas da assinatura.
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#a9d84e';
  drawLeaf(405, 1268, 18, 42, -0.58);
  drawLeaf(438, 1248, 17, 39, 0.10);
  drawLeaf(461, 1285, 18, 41, 0.72);

  ctx.fillStyle = '#fffdf7';
  ctx.font = '400 132px Anton, Impact, "Arial Narrow", sans-serif';
  ctx.fillText('NORONHA', 66, 1510);

  // Número — mesma hierarquia do protótipo, agora alinhado à marca.
  ctx.shadowColor = 'rgba(0,0,0,.28)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = '#ff8b1f';
  ctx.font = '400 224px Anton, Impact, sans-serif';
  ctx.fillText('43.333', 64, 1740);

  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 40px Inter, system-ui, sans-serif';
  ctx.fillText('NINGUÉM É FORTE SOZINHO', 72, 1810);

  // Traço laranja de fechamento.
  ctx.fillStyle = '#f28c28';
  roundedRect(70, 1850, 510, 12, 6);
  ctx.fill();
  ctx.restore();
}

function drawStory() {
  ctx.clearRect(0, 0, W, H);

  if (image) {
    drawPhoto();
  } else {
    drawPlaceholder();
  }

  drawPrototypeFrame();
}

function setUploadLabel(file) {
  uploadTitle.textContent = file.name;
  uploadHint.textContent = `${(file.size / 1024 / 1024).toFixed(1)} MB • pronta para ajustar`;
}

function loadFile(file) {
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    setStatus('Escolha um arquivo de imagem.');
    return;
  }

  setUploadLabel(file);
  setStatus('Abrindo a foto...');

  const objectUrl = URL.createObjectURL(file);
  const img = new Image();

  img.onload = () => {
    image = img;
    resetTransform();
    drawStory();
    URL.revokeObjectURL(objectUrl);
    setStatus('Foto carregada. Arraste para enquadrar e ajuste o zoom.');
  };

  img.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    setStatus('Não consegui abrir essa foto. Tente outra imagem.');
  };

  img.src = objectUrl;
}

function pointFromEvent(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (W / r.width),
    y: (e.clientY - r.top) * (H / r.height)
  };
}

canvas.addEventListener('pointerdown', (e) => {
  if (!image) return;
  dragging = true;
  canvas.setPointerCapture?.(e.pointerId);
  last = pointFromEvent(e);
});

canvas.addEventListener('pointermove', (e) => {
  if (!dragging || !image) return;

  const p = pointFromEvent(e);
  offsetX += p.x - last.x;
  offsetY += p.y - last.y;
  last = p;
  drawStory();
});

function stopDragging(e) {
  dragging = false;
  if (e?.pointerId != null && canvas.hasPointerCapture?.(e.pointerId)) {
    canvas.releasePointerCapture?.(e.pointerId);
  }
}

canvas.addEventListener('pointerup', stopDragging);
canvas.addEventListener('pointercancel', stopDragging);
canvas.addEventListener('pointerleave', (e) => {
  if (e.pointerType === 'mouse') stopDragging(e);
});

fileInput.addEventListener('change', (e) => loadFile(e.target.files?.[0]));

['dragenter', 'dragover'].forEach((type) => {
  uploadZone.addEventListener(type, (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragging');
  });
});

['dragleave', 'drop'].forEach((type) => {
  uploadZone.addEventListener(type, (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragging');
  });
});

uploadZone.addEventListener('drop', (e) => {
  const file = e.dataTransfer?.files?.[0];
  if (file) loadFile(file);
});

zoomRange.addEventListener('input', () => {
  clampOffsets();
  drawStory();
});

resetBtn.addEventListener('click', () => {
  resetTransform();
  drawStory();
  setStatus('Enquadramento redefinido.');
});

function canvasToBlob() {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
}

downloadBtn.addEventListener('click', async () => {
  if (!image) {
    setStatus('Selecione uma foto antes de baixar.');
    return;
  }

  drawStory();
  const blob = await canvasToBlob();

  if (!blob) {
    setStatus('Não foi possível gerar a imagem. Tente novamente.');
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'story-beth-noronha-43333.png';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 3000);
  setStatus('Story gerado em 1080 × 1920.');
});

shareBtn.addEventListener('click', async () => {
  const data = {
    title: document.title,
    text: 'Gerador de Story Beth Noronha 43.333',
    url: location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(data);
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(location.href);
      setStatus('Link copiado.');
    }
  } catch (_) {}
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(`/sw.js?v=${FRAME_VERSION}`);
      registration.update().catch(() => {});
    } catch (_) {}
  });
}

drawStory();
if (document.fonts?.ready) {
  document.fonts.ready.then(drawStory).catch(() => {});
}
