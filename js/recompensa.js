/* ============================================================
   A NOSSA HISTÓRIA — lógica da recompensa
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // ---------------- Contador de tempo juntos ----------------
  // Início do namoro: 09/03/2024 (2 anos e 3 meses até 09/06/2026)
  const start = new Date(2024, 2, 9); // mês 2 = março
  const now = new Date();
  const days = Math.floor((now - start) / 86400000);
  const el = document.getElementById('dayCounter');
  if (el) el.innerHTML = `<b>2 anos e 3 meses</b> &middot; ${days.toLocaleString('pt-BR')} dias caminhando ao seu lado`;

  // ---------------- Galeria de fotos ----------------
  const caps = [
    "O nosso 'pra sempre' começou com um sorriso bobo.",
    "Tem gente que combina. E tem a gente.",
    "Do seu lado, até o dia mais comum vira história.",
    "Eu reconheceria esse seu olhar em qualquer escuridão.",
    "Dois corações, uma bagunça linda.",
    "Você é o meu lugar favorito no mundo.",
    "Rir com você é a minha parte preferida do dia.",
    "Se eu pudesse, repetia cada um desses momentos.",
    "Com você, o tempo passa rápido demais.",
    "A vida ao seu lado tem mais cor.",
    "Você é linda até nas fotos tortas (principalmente nelas).",
    "Meu caos preferido — e a minha calmaria também.",
    "Onde você está é onde eu quero estar.",
    "A gente se escolhe todo dia. E eu escolheria de novo.",
    "Passear com você é a minha aventura favorita.",
    "Você transforma o comum em mágico.",
    "Guardo cada detalhe seu como um tesouro.",
    "O mundo fica mais bonito quando você sorri.",
    "Obrigado por ser minha parceira de absolutamente tudo.",
    "Cada careta sua é uma obra de arte.",
    "Eu te amo no escuro e na luz — em todos os lugares."
  ];

  const gallery = document.getElementById('gallery');
  for (let i = 1; i <= 21; i++) {
    const card = document.createElement('div');
    card.className = 'card reveal';
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.alt = 'Nós dois';
    img.src = encodeURI('Assets/' + i + '.jpeg');
    const cap = document.createElement('div');
    cap.className = 'cap';
    cap.textContent = caps[(i - 1) % caps.length];
    card.appendChild(img);
    card.appendChild(cap);
    gallery.appendChild(card);
  }

  // ---------------- Vídeos (todos rodando ao mesmo tempo) ----------------
  const vids = [
    { file: 'Video-StarBucks.mp4',     label: 'Nosso café',        emoji: '☕' },
    { file: 'Video-Fofinha.mp4',       label: 'Fofura registrada', emoji: '🖤' },
    { file: 'Video-Riacho-praia.mp4',  label: 'Águas e nós',       emoji: '🌊' },
    { file: 'Video-Cavalo.mp4',        label: 'Aventura a dois',   emoji: '🐴' },
    { file: 'Video-scs-cafe.mp4',      label: 'Tarde preguiçosa',  emoji: '🍰' },
    { file: 'Video-cabeçao.mp4',       label: 'Risada garantida',  emoji: '😆' },
  ];
  const vgrid = document.getElementById('vgrid');
  const videoEls = [];
  vids.forEach(v => {
    const cell = document.createElement('div');
    cell.className = 'vcell reveal';
    const video = document.createElement('video');
    video.src = encodeURI('Assets/' + v.file);
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.preload = 'metadata';
    const label = document.createElement('div');
    label.className = 'vlabel';
    label.textContent = v.label;
    const spk = document.createElement('div');
    spk.className = 'vspeaker';
    spk.textContent = '🔇';
    cell.appendChild(video);
    cell.appendChild(label);
    cell.appendChild(spk);
    vgrid.appendChild(cell);
    videoEls.push({ cell, video, spk });

    // tenta tocar (autoplay mudo é permitido)
    const tryPlay = () => video.play().catch(() => {});
    video.addEventListener('canplay', tryPlay);
    tryPlay();

    // clique: ativa o som só desse vídeo
    cell.addEventListener('click', () => {
      const willUnmute = video.muted;
      // muta todos
      videoEls.forEach(o => {
        o.video.muted = true;
        o.cell.classList.remove('playing');
        o.spk.textContent = '🔇';
      });
      if (willUnmute) {
        stopMusic();
        video.muted = false;
        video.currentTime = video.currentTime; // garante frame atual
        video.play().catch(() => {});
        cell.classList.add('playing');
        spk.textContent = '🔊';
      }
    });
  });

  // garante o play dos vídeos após a primeira interação (alguns navegadores)
  const kick = () => { videoEls.forEach(o => o.video.play().catch(() => {})); };
  window.addEventListener('click', kick, { once: true });
  window.addEventListener('touchstart', kick, { once: true });
  window.addEventListener('scroll', kick, { once: true });

  // ---------------- Reveal on scroll ----------------
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ---------------- Pétalas caindo (canvas) ----------------
  const pc = document.getElementById('petals');
  const px = pc.getContext('2d');
  let W, H, petals = [];
  function resize() { W = pc.width = innerWidth; H = pc.height = innerHeight; }
  resize(); window.addEventListener('resize', resize);
  function makePetal() {
    return {
      x: Math.random() * W, y: -20 - Math.random() * H,
      s: 4 + Math.random() * 7,
      vy: 0.4 + Math.random() * 1.0,
      vx: (Math.random() - 0.5) * 0.6,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.04,
      sway: Math.random() * Math.PI * 2,
      gold: Math.random() < 0.22
    };
  }
  for (let i = 0; i < 46; i++) { const p = makePetal(); p.y = Math.random() * H; petals.push(p); }
  function drawPetals() {
    px.clearRect(0, 0, W, H);
    petals.forEach(p => {
      p.sway += 0.02;
      p.x += p.vx + Math.sin(p.sway) * 0.4;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y > H + 20) { Object.assign(p, makePetal(), { y: -20 }); }
      px.save();
      px.translate(p.x, p.y);
      px.rotate(p.rot);
      if (p.gold) {
        px.fillStyle = 'rgba(217,164,65,.7)';
        px.beginPath();
        px.arc(0, 0, p.s * 0.4, 0, Math.PI * 2);
        px.fill();
      } else {
        px.fillStyle = `rgba(${170 + Math.random()*20|0}, 24, 50, .75)`;
        // pétala (duas curvas)
        px.beginPath();
        px.moveTo(0, -p.s);
        px.bezierCurveTo(p.s, -p.s*0.5, p.s, p.s*0.6, 0, p.s);
        px.bezierCurveTo(-p.s, p.s*0.6, -p.s, -p.s*0.5, 0, -p.s);
        px.fill();
      }
      px.restore();
    });
    requestAnimationFrame(drawPetals);
  }
  drawPetals();

  // ---------------- Música suave opcional (Web Audio) ----------------
  let actx = null, musicGain = null, musicOn = false, musicTimer = null;
  const musicBtn = document.getElementById('musicBtn');

  function startMusic() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!actx) { actx = new AC(); musicGain = actx.createGain(); musicGain.gain.value = 0.0; musicGain.connect(actx.destination); }
    if (actx.state === 'suspended') actx.resume();
    musicGain.gain.cancelScheduledValues(actx.currentTime);
    musicGain.gain.linearRampToValueAtTime(0.28, actx.currentTime + 1.2);
    musicOn = true;
    musicBtn.textContent = '♪';
    musicBtn.style.color = '#e08fa2';
    schedule();
  }
  function stopMusic() {
    if (!actx || !musicOn) { musicOn = false; if (musicBtn){musicBtn.textContent='♪'; musicBtn.style.color='';} return; }
    musicOn = false;
    clearTimeout(musicTimer);
    musicGain.gain.cancelScheduledValues(actx.currentTime);
    musicGain.gain.linearRampToValueAtTime(0.0, actx.currentTime + 0.8);
    musicBtn.textContent = '♪';
    musicBtn.style.color = '';
  }
  // progressão romântica simples (acordes em arpejo)
  const chords = [
    [220.00, 261.63, 329.63], // Am
    [174.61, 220.00, 261.63], // F
    [261.63, 329.63, 392.00], // C
    [196.00, 246.94, 392.00], // G
  ];
  let ci = 0;
  function schedule() {
    if (!musicOn) return;
    const ch = chords[ci % chords.length]; ci++;
    const t0 = actx.currentTime;
    ch.forEach((f, i) => {
      pluck(f, t0 + i * 0.18, 1.6);
      pluck(f * 2, t0 + i * 0.18 + 0.9, 1.2, 0.5); // oitava suave
    });
    musicTimer = setTimeout(schedule, 2400);
  }
  function pluck(freq, when, dur, vmul) {
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = 'triangle';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(0.18 * (vmul || 1), when + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g).connect(musicGain);
    o.start(when); o.stop(when + dur + 0.05);
  }
  musicBtn.addEventListener('click', () => { if (musicOn) stopMusic(); else startMusic(); });

  // ---------------- Botão de descida suave do scrollcue ----------------
  const cue = document.querySelector('.scrollcue');
  if (cue) cue.addEventListener('click', () => window.scrollTo({ top: innerHeight, behavior: 'smooth' }));
});
