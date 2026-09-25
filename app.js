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

const C = {
  green: '#004d22',
  green2: '#0a632e',
  orange: '#ff5a0a',
  white: '#ffffff',
  leaf: '#5b9e13'
};

let image = null;
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
  g.addColorStop(0, '#e9eeeb');
  g.addColorStop(1, '#dce5e0');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1080, 1920);
  ctx.fillStyle = '#667b70';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 42px system-ui';
  ctx.fillText('Selecione sua foto', 540, 900);
}

function brushStroke(x1, y1, x2, y2, color, width, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  ctx.quadraticCurveTo(mx + (y2-y1)*0.08, my - (x2-x1)*0.03, x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawHeart(x, y, s) {
  ctx.save();
  ctx.lineWidth = 14 * s;
  ctx.lineCap = 'round';
  ctx.strokeStyle = C.orange;
  ctx.beginPath();
  ctx.moveTo(x, y + 42*s);
  ctx.bezierCurveTo(x - 56*s, y - 12*s, x - 98*s, y + 50*s, x, y + 142*s);
  ctx.stroke();
  ctx.strokeStyle = C.green;
  ctx.beginPath();
  ctx.moveTo(x, y + 42*s);
  ctx.bezierCurveTo(x + 56*s, y - 12*s, x + 98*s, y + 50*s, x, y + 142*s);
  ctx.stroke();
  ctx.restore();
}

function drawTopBrand() {
  const grad = ctx.createLinearGradient(0, 0, 0, 405);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(.78, 'rgba(255,255,255,.96)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 430);

  brushStroke(-40, 45, 315, -20, C.green, 48, .98);
  brushStroke(-20, 92, 275, 15, C.green2, 22, .9);
  brushStroke(780, -20, 1120, 95, C.orange, 44, .95);
  brushStroke(855, 20, 1115, 155, C.orange, 18, .85);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.green;
  ctx.font = '900 122px "Brush Script MT", "Segoe Script", cursive';
  ctx.fillText('Beth', 88, 160);

  ctx.save();
  ctx.translate(430, 108);
  ctx.rotate(-.35);
  ctx.fillStyle = C.leaf;
  for (let i=0;i<3;i++) {
    ctx.beginPath();
    ctx.ellipse(i*25, i*10, 24, 10, -.45, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();

  ctx.fillStyle = C.green;
  ctx.font = '950 92px Impact, "Arial Black", sans-serif';
  ctx.fillText('NORONHA', 72, 270);

  brushStroke(78, 306, 495, 282, C.orange, 44, 1);
  ctx.fillStyle = C.white;
  ctx.font = '900 28px Arial, sans-serif';
  ctx.fillText('DEPUTADA ESTADUAL', 128, 306);

  ctx.fillStyle = C.green;
  ctx.font = '950 43px Impact, "Arial Black", sans-serif';
  ctx.fillText('NINGUÉM', 625, 112);
  ctx.fillText('É', 625, 160);
  ctx.fillStyle = C.orange;
  ctx.fillText('FORTE', 675, 160);
  ctx.fillStyle = C.green;
  ctx.fillText('SOZINHO', 625, 208);
  drawHeart(862, 85, .72);
}

function drawSideBrushes() {
  brushStroke(-65, 470, 45, 725, C.orange, 24, .9);
  brushStroke(-52, 785, 52, 1030, C.green, 32, .92);
  brushStroke(-45, 1080, 52, 1325, C.green2, 19, .82);
  brushStroke(1030, 445, 1125, 705, C.orange, 26, .9);
  brushStroke(1035, 760, 1120, 1025, C.orange, 19, .78);
  brushStroke(1030, 1075, 1128, 1310, C.green, 24, .86);
}

function drawBottomBand() {
  ctx.save();
  ctx.fillStyle = C.green;
  ctx.beginPath();
  ctx.moveTo(-70, 1570);
  ctx.quadraticCurveTo(530, 1455, 1150, 1585);
  ctx.lineTo(1150, 1970);
  ctx.lineTo(-70, 1970);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  brushStroke(-45, 1575, 1120, 1542, C.green2, 54, .9);
  brushStroke(-70, 1605, 1135, 1580, C.green, 24, .95);
  brushStroke(70, 1875, 985, 1856, C.orange, 14, .95);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.orange;
  ctx.font = '950 58px Impact, "Arial Black", sans-serif';
  ctx.fillText('VOTE', 540, 1655);

  ctx.fillStyle = C.white;
  ctx.font = '900 42px Arial, sans-serif';
  ctx.fillText('DEPUTADA ESTADUAL', 540, 1711);

  ctx.strokeStyle = C.orange;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  [[292,1672,245,1648],[286,1688,230,1682],[788,1672,835,1648],[794,1688,850,1682]].forEach(a=>{
    ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(a[2],a[3]); ctx.stroke();
  });

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.36)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 9;
  ctx.lineJoin = 'round';
  ctx.textAlign = 'center';
  ctx.font = '950 238px Impact, "Arial Black", sans-serif';
  ctx.strokeStyle = C.orange;
  ctx.lineWidth = 8;
  ctx.strokeText('43.333', 540, 1890);
  ctx.fillStyle = C.white;
  ctx.fillText('43.333', 540, 1890);
  ctx.restore();
}

function drawStory() {
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  if (image) fitCover(image, 0, 0, W, H);
  else drawPlaceholder();

  drawTopBrand();
  drawSideBrushes();
  drawBottomBand();
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
      status.textContent = 'Foto carregada. Arraste para enquadrar e use o zoom se precisar.';
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
  if (!image) {
    status.textContent = 'Selecione uma foto antes de baixar.';
    return;
  }
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
  const data = { title: document.title, text: 'Gerador de Story Beth Noronha 43.333', url: location.href };
  try {
    if (navigator.share) await navigator.share(data);
    else {
      await navigator.clipboard.writeText(location.href);
      status.textContent = 'Link copiado.';
    }
  } catch (_) {}
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(()=>{}));
}

drawStory();
