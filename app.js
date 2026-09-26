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

const OVERLAY_PARTS = Array.from(
  { length: 12 },
  (_, i) => `/frame/part${String(i).padStart(2, '0')}.txt`
);

let image = null;
let overlay = null;
let offsetX = 0;
let offsetY = 0;
let dragging = false;
let last = { x: 0, y: 0 };

function resetTransform() {
  zoomRange.value = '1';
  offsetX = 0;
  offsetY = 0;
}

function fitCover(img, x, y, w, h) {
  const zoom = Number(zoomRange.value);
  const base = Math.max(w / img.width, h / img.height);
  const scale = base * zoom;
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = x + (w - dw) / 2 + offsetX;
  const dy = y + (h - dh) / 2 + offsetY;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawPlaceholder() {
  const g = ctx.createLinearGradient(0, 0, 1080, 1920);
  g.addColorStop(0, '#eef2ef');
  g.addColorStop(1, '#e1e7e3');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#667b70';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 42px system-ui';
  ctx.fillText('Selecione sua foto', 540, 880);
}

function drawStory() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (image) {
    fitCover(image, 0, 0, canvas.width, canvas.height);
  } else {
    drawPlaceholder();
  }

  if (overlay) {
    ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
  }
}

async function loadOverlay() {
  status.textContent = 'Carregando a moldura oficial...';

  try {
    const parts = await Promise.all(
      OVERLAY_PARTS.map(async (url) => {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Falha ao carregar ${url}`);
        return (await response.text()).trim();
      })
    );

    const img = new Image();

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = 'data:image/webp;base64,' + parts.join('');
    });

    overlay = img;
    drawStory();
    status.textContent = 'Moldura oficial carregada.';
  } catch (error) {
    console.error(error);
    status.textContent = 'Não foi possível carregar a moldura. Atualize a página.';
  }
}

function setUploadLabel(file) {
  uploadTitle.textContent = file.name;
  uploadHint.textContent =
    (file.size / 1024 / 1024).toFixed(1) + ' MB • pronta para ajustar';
}

function loadFile(file) {
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    status.textContent = 'Escolha um arquivo de imagem.';
    return;
  }

  setUploadLabel(file);
  const reader = new FileReader();

  reader.onload = () => {
    const img = new Image();

    img.onload = () => {
      image = img;
      resetTransform();
      drawStory();
      status.textContent =
        'Foto carregada. Arraste para enquadrar e use o zoom se precisar.';
    };

    img.src = reader.result;
  };

  reader.readAsDataURL(file);
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
  canvas.setPointerCapture(e.pointerId);
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

canvas.addEventListener('pointerup', () => {
  dragging = false;
});

canvas.addEventListener('pointercancel', () => {
  dragging = false;
});

fileInput.addEventListener('change', (e) => {
  loadFile(e.target.files[0]);
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

zoomRange.addEventListener('input', drawStory);

resetBtn.addEventListener('click', () => {
  resetTransform();
  drawStory();
  status.textContent = 'Enquadramento redefinido.';
});

downloadBtn.addEventListener('click', () => {
  if (!image) {
    status.textContent = 'Selecione uma foto antes de baixar.';
    return;
  }

  if (!overlay) {
    status.textContent = 'Aguarde a moldura oficial carregar.';
    return;
  }

  drawStory();

  canvas.toBlob((blob) => {
    if (!blob) return;

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'story-beth-noronha-43333.png';
    a.click();

    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    status.textContent = 'Story gerado em 1080 × 1920.';
  }, 'image/png');
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
    } else {
      await navigator.clipboard.writeText(location.href);
      status.textContent = 'Link copiado.';
    }
  } catch (_) {}
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () =>
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  );
}

drawStory();
loadOverlay();
