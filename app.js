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

const FRAME_VERSION = '7';
const OVERLAY_PARTS = Array.from(
  { length: 12 },
  (_, i) => `/frame/part${String(i).padStart(2, '0')}.txt?v=${FRAME_VERSION}`
);

// Área útil da foto dentro da moldura oficial 9:16.
// Topo e rodapé permanecem protegidos pela arte da campanha.
const PHOTO_WINDOW = { x: 0, y: 355, w: 1080, h: 1105 };

let image = null;
let overlay = null;
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

  const { x, y, w, h } = PHOTO_WINDOW;
  const zoom = Number(zoomRange.value);
  const base = Math.max(w / image.width, h / image.height);
  const scale = base * zoom;
  const dw = image.width * scale;
  const dh = image.height * scale;

  return {
    dw,
    dh,
    dx: x + (w - dw) / 2 + offsetX,
    dy: y + (h - dh) / 2 + offsetY
  };
}

function clampOffsets() {
  const geometry = getImageGeometry();
  if (!geometry) return;

  const { w, h } = PHOTO_WINDOW;
  const maxX = Math.max(0, (geometry.dw - w) / 2);
  const maxY = Math.max(0, (geometry.dh - h) / 2);

  offsetX = Math.max(-maxX, Math.min(maxX, offsetX));
  offsetY = Math.max(-maxY, Math.min(maxY, offsetY));
}

function drawPhoto() {
  if (!image) return;

  clampOffsets();
  const geometry = getImageGeometry();
  const { x, y, w, h } = PHOTO_WINDOW;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(image, geometry.dx, geometry.dy, geometry.dw, geometry.dh);
  ctx.restore();
}

function drawPlaceholder() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const { x, y, w, h } = PHOTO_WINDOW;
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, '#f2f5f3');
  g.addColorStop(1, '#e4ebe7');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = '#667b70';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 40px system-ui, -apple-system, sans-serif';
  ctx.fillText('Selecione sua foto', 540, y + h / 2);
}

function drawStory() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (image) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPhoto();
  } else {
    drawPlaceholder();
  }

  if (overlay) {
    ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
  }
}

async function loadOverlay() {
  setStatus('Carregando a moldura oficial...');

  try {
    const parts = await Promise.all(
      OVERLAY_PARTS.map(async (url) => {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Falha ao carregar ${url}`);
        return (await response.text()).trim();
      })
    );

    const base64 = parts.join('');
    if (!base64) throw new Error('Moldura vazia');

    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('Moldura inválida'));
      img.src = 'data:image/webp;base64,' + base64;
    });

    overlay = img;
    drawStory();
    setStatus('Moldura oficial pronta. Escolha sua foto.');
  } catch (error) {
    console.error(error);
    setStatus('Não foi possível carregar a moldura. Recarregue a página.');
  }
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
    x: (e.clientX - r.left) * (canvas.width / r.width),
    y: (e.clientY - r.top) * (canvas.height / r.height)
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

fileInput.addEventListener('change', (e) => {
  loadFile(e.target.files?.[0]);
});

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

  if (!overlay) {
    setStatus('Aguarde a moldura oficial carregar.');
    return;
  }

  drawStory();
  const blob = await canvasToBlob();
  if (!blob) {
    setStatus('Não foi possível gerar a imagem. Tente novamente.');
    return;
  }

  const filename = 'story-beth-noronha-43333.png';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
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
loadOverlay();
