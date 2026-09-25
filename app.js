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

const palette = {
  green: '#0b6b3a',
  greenDark: '#064c2a',
  orange: '#f28c28',
  white: '#ffffff',
  cream: '#fff9f0'
};

let image = null;
let offsetX = 0;
let offsetY = 0;
let dragging = false;
let last = { x: 0, y: 0 };

function roundedRectPath(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

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
  const g = ctx.createLinearGradient(0, 0, 1080, 1500);
  g.addColorStop(0, '#dbe9e1');
  g.addColorStop(1, '#f2e6d7');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1080, 1920);

  ctx.fillStyle = '#6a8174';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 42px system-ui';
  ctx.fillText('Selecione sua foto', 540, 820);
}

function drawStory() {
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  if (image) fitCover(image, 0, 0, W, H);
  else drawPlaceholder();

  const topFade = ctx.createLinearGradient(0, 0, 0, 430);
  topFade.addColorStop(0, 'rgba(3, 54, 28, .92)');
  topFade.addColorStop(1, 'rgba(3, 54, 28, 0)');
  ctx.fillStyle = topFade;
  ctx.fillRect(0, 0, W, 430);

  const bottomFade = ctx.createLinearGradient(0, 1120, 0, H);
  bottomFade.addColorStop(0, 'rgba(3, 54, 28, 0)');
  bottomFade.addColorStop(.35, 'rgba(3, 54, 28, .72)');
  bottomFade.addColorStop(1, 'rgba(3, 54, 28, .98)');
  ctx.fillStyle = bottomFade;
  ctx.fillRect(0, 1050, W, H - 1050);

  ctx.fillStyle = palette.orange;
  roundedRectPath(62, 70, 310, 74, 37);
  ctx.fill();

  ctx.fillStyle = palette.greenDark;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 34px system-ui';
  ctx.fillText('DEPUTADA ESTADUAL', 217, 108);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = palette.white;
  ctx.font = '900 82px system-ui';
  ctx.fillText('BETH', 64, 1570);

  ctx.font = '900 108px system-ui';
  ctx.fillText('NORONHA', 64, 1672);

  ctx.fillStyle = palette.orange;
  ctx.font = '950 150px system-ui';
  ctx.fillText('43.333', 60, 1814);

  ctx.fillStyle = palette.white;
  ctx.font = '800 34px system-ui';
  ctx.fillText('NINGUÉM É FORTE SOZINHO', 66, 1878);

  ctx.fillStyle = palette.orange;
  ctx.fillRect(0, 1904, W, 16);

  ctx.save();
  ctx.globalAlpha = .95;
  ctx.fillStyle = palette.white;
  roundedRectPath(790, 72, 228, 72, 36);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = palette.green;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 30px system-ui';
  ctx.fillText('43.333', 904, 108);
}

function setUploadLabel(file) {
  uploadTitle.textContent = file.name;
  uploadHint.textContent = (file.size / 1024 / 1024).toFixed(1) + ' MB • pronta para ajustar';
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
      status.textContent = 'Foto carregada. Ajuste o enquadramento e baixe o Story.';
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

canvas.addEventListener('pointerdown', e => {
  if (!image) return;
  dragging = true;
  canvas.setPointerCapture(e.pointerId);
  last = pointFromEvent(e);
});

canvas.addEventListener('pointermove', e => {
  if (!dragging || !image) return;
  const p = pointFromEvent(e);
  offsetX += p.x - last.x;
  offsetY += p.y - last.y;
  last = p;
  drawStory();
});

canvas.addEventListener('pointerup', () => dragging = false);
canvas.addEventListener('pointercancel', () => dragging = false);

fileInput.addEventListener('change', e => loadFile(e.target.files[0]));

['dragenter', 'dragover'].forEach(type => {
  uploadZone.addEventListener(type, e => {
    e.preventDefault();
    uploadZone.classList.add('dragging');
  });
});

['dragleave', 'drop'].forEach(type => {
  uploadZone.addEventListener(type, e => {
    e.preventDefault();
    uploadZone.classList.remove('dragging');
  });
});

uploadZone.addEventListener('drop', e => {
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
  drawStory();
  canvas.toBlob(blob => {
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
    if (navigator.share) await navigator.share(data);
    else {
      await navigator.clipboard.writeText(location.href);
      status.textContent = 'Link copiado.';
    }
  } catch (_) {}
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

drawStory();
