const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('fileInput');
const profileTab = document.getElementById('profileTab');
const storyTab = document.getElementById('storyTab');
const zoomRange = document.getElementById('zoomRange');
const titleText = document.getElementById('titleText');
const numberText = document.getElementById('numberText');
const messageText = document.getElementById('messageText');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const shareBtn = document.getElementById('shareBtn');
const sizeLabel = document.getElementById('sizeLabel');
const status = document.getElementById('status');

const palette = { green:'#0b6b3a', green2:'#07542e', orange:'#f28c28', white:'#fff', ink:'#183428' };
let mode = 'profile';
let image = null;
let offsetX = 0;
let offsetY = 0;
let dragging = false;
let last = {x:0,y:0};

function setMode(next){
  mode = next;
  const profile = mode === 'profile';
  profileTab.classList.toggle('active', profile);
  storyTab.classList.toggle('active', !profile);
  profileTab.setAttribute('aria-selected', String(profile));
  storyTab.setAttribute('aria-selected', String(!profile));
  canvas.width = 1080;
  canvas.height = profile ? 1080 : 1920;
  sizeLabel.textContent = profile ? '1080 × 1080' : '1080 × 1920';
  resetTransform();
  draw();
}

function resetTransform(){
  zoomRange.value = '1';
  offsetX = 0;
  offsetY = 0;
}

function fitCover(img, x, y, w, h){
  const z = Number(zoomRange.value);
  const base = Math.max(w / img.width, h / img.height);
  const scale = base * z;
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = x + (w - dw)/2 + offsetX;
  const dy = y + (h - dh)/2 + offsetY;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function roundedRectPath(x,y,w,h,r){
  const rr=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();
}

function drawPlaceholder(x,y,w,h){
  const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#d7e7df');g.addColorStop(1,'#f3eee7');ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
  ctx.fillStyle='#6d8378';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='700 42px system-ui';ctx.fillText('Sua foto',x+w/2,y+h/2);
}

function drawProfile(){
  const W=canvas.width,H=canvas.height;
  ctx.fillStyle=palette.green;ctx.fillRect(0,0,W,H);
  const top=60, side=60, innerW=W-side*2, innerH=760;
  roundedRectPath(side,top,innerW,innerH,56);ctx.fillStyle=palette.white;ctx.fill();

  ctx.save();
  ctx.beginPath();ctx.ellipse(W/2,410,392,338,0,0,Math.PI*2);ctx.clip();
  if(image) fitCover(image,W/2-392,72,784,676); else drawPlaceholder(W/2-392,72,784,676);
  ctx.restore();
  ctx.lineWidth=18;ctx.strokeStyle=palette.orange;ctx.beginPath();ctx.ellipse(W/2,410,405,351,0,0,Math.PI*2);ctx.stroke();
  ctx.lineWidth=10;ctx.strokeStyle=palette.green;ctx.beginPath();ctx.ellipse(W/2,410,423,369,0,0,Math.PI*2);ctx.stroke();

  ctx.fillStyle=palette.orange;roundedRectPath(110,775,860,222,40);ctx.fill();
  ctx.textAlign='center';ctx.fillStyle='#153125';ctx.font='900 44px system-ui';ctx.fillText(titleText.value.trim() || 'SEU NOME',W/2,842);
  ctx.fillStyle=palette.white;ctx.font='950 98px system-ui';ctx.fillText(numberText.value.trim() || '00.000',W/2,934);
  ctx.fillStyle=palette.white;ctx.font='800 30px system-ui';ctx.fillText((messageText.value.trim() || 'SUA MENSAGEM AQUI').toUpperCase(),W/2,1035);
}

function drawStory(){
  const W=canvas.width,H=canvas.height;
  ctx.fillStyle='#dce9e2';ctx.fillRect(0,0,W,H);
  ctx.save();
  roundedRectPath(54,54,972,1370,54);ctx.clip();
  if(image) fitCover(image,54,54,972,1370); else drawPlaceholder(54,54,972,1370);
  const grad=ctx.createLinearGradient(0,920,0,1424);grad.addColorStop(0,'rgba(0,0,0,0)');grad.addColorStop(1,'rgba(0,0,0,.62)');ctx.fillStyle=grad;ctx.fillRect(54,820,972,604);
  ctx.restore();

  ctx.fillStyle=palette.green;roundedRectPath(54,1456,972,398,54);ctx.fill();
  ctx.fillStyle=palette.orange;roundedRectPath(90,1498,210,54,27);ctx.fill();
  ctx.fillStyle=palette.white;ctx.textAlign='left';ctx.font='900 54px system-ui';ctx.fillText(titleText.value.trim() || 'SEU NOME',92,1637);
  ctx.fillStyle=palette.orange;ctx.font='950 126px system-ui';ctx.fillText(numberText.value.trim() || '00.000',92,1772);
  ctx.fillStyle=palette.white;ctx.font='800 35px system-ui';ctx.fillText((messageText.value.trim() || 'SUA MENSAGEM AQUI').toUpperCase(),92,1833);
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(mode==='profile') drawProfile(); else drawStory();
}

function loadFile(file){
  if(!file) return;
  if(!file.type.startsWith('image/')){ status.textContent='Escolha um arquivo de imagem.'; return; }
  const reader=new FileReader();
  reader.onload=()=>{ const img=new Image(); img.onload=()=>{ image=img; resetTransform(); draw(); status.textContent='Foto carregada. Arraste para ajustar.'; }; img.src=reader.result; };
  reader.readAsDataURL(file);
}

function pointFromEvent(e){
  const r=canvas.getBoundingClientRect();
  return {x:(e.clientX-r.left)*(canvas.width/r.width), y:(e.clientY-r.top)*(canvas.height/r.height)};
}

canvas.addEventListener('pointerdown',e=>{ dragging=true; canvas.setPointerCapture(e.pointerId); last=pointFromEvent(e); });
canvas.addEventListener('pointermove',e=>{ if(!dragging||!image) return; const p=pointFromEvent(e); offsetX += p.x-last.x; offsetY += p.y-last.y; last=p; draw(); });
canvas.addEventListener('pointerup',()=>dragging=false);
canvas.addEventListener('pointercancel',()=>dragging=false);

fileInput.addEventListener('change',e=>loadFile(e.target.files[0]));
profileTab.addEventListener('click',()=>setMode('profile'));
storyTab.addEventListener('click',()=>setMode('story'));
zoomRange.addEventListener('input',draw);
[titleText,numberText,messageText].forEach(el=>el.addEventListener('input',draw));
resetBtn.addEventListener('click',()=>{resetTransform();draw();status.textContent='Enquadramento redefinido.'});
downloadBtn.addEventListener('click',()=>{
  draw();
  canvas.toBlob(blob=>{
    if(!blob) return;
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`moldura-${mode}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);status.textContent='PNG gerado no seu aparelho.';
  },'image/png');
});
shareBtn.addEventListener('click',async()=>{
  const data={title:document.title,text:'Gerador de molduras',url:location.href};
  try{ if(navigator.share) await navigator.share(data); else {await navigator.clipboard.writeText(location.href); status.textContent='Link copiado.';} }catch(_){ }
});

if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{})); }
setMode('profile');
