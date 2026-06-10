/* ============================================================
   O ENIGMA DE DANIELA — engine principal (top-down gótico)
   Tudo client-side, roda no GitHub Pages.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // ---------------- Config ----------------
  const TS = 40;                 // tamanho do tile
  const VIEW_W = 800, VIEW_H = 600;
  const SPEED = 165;             // px/s

  const canvas = document.getElementById('game');
  canvas.width = VIEW_W; canvas.height = VIEW_H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // tiles
  const WALL = 0, FLOOR = 1, CARPET = 2, GRASS = 3, WATER = 4, DOOR = 5;

  // ---------------- Mapa ----------------
  const COLS = 44, ROWS = 32;
  const WORLD_W = COLS * TS, WORLD_H = ROWS * TS;
  const grid = [];
  for (let y = 0; y < ROWS; y++) { grid[y] = new Array(COLS).fill(WALL); }

  function carve(x0, y0, x1, y1, t) {
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++)
        if (x >= 0 && y >= 0 && x < COLS && y < ROWS) grid[y][x] = t;
  }

  // salas
  carve(18, 25, 26, 30, CARPET);  // Saguão (início)
  carve(17, 15, 27, 23, CARPET);  // Grande Salão
  carve(5, 13, 15, 21, FLOOR);    // Biblioteca
  carve(29, 11, 39, 21, GRASS);   // Jardim
  carve(18, 5, 26, 12, CARPET);   // Santuário (final)

  // passagens
  carve(21, 24, 22, 24, CARPET);  // saguão -> salão
  carve(16, 18, 16, 19, CARPET);  // salão -> biblioteca
  carve(28, 16, 28, 17, GRASS);   // salão -> jardim

  // fonte (jardim)
  const waterTiles = [[33,15],[34,15],[33,16],[34,16]];
  waterTiles.forEach(([x,y]) => grid[y][x] = WATER);

  // porta selada (2x2) salão -> santuário
  const door = { tx: 21, ty: 13, open: false };
  carve(21, 13, 22, 14, DOOR);

  // tiles sólidos extras (estante / pedestal)
  const solidExtra = new Set();
  const bookshelfTiles = new Set();
  for (let x = 5; x <= 15; x++) { bookshelfTiles.add(x + ',12'); solidExtra.add(x + ',12'); }
  bookshelfTiles.add('4,15'); bookshelfTiles.add('4,16'); bookshelfTiles.add('4,17');
  ['4,15','4,16','4,17'].forEach(k=>solidExtra.add(k));

  const pedestalTile = { x: 22, y: 8 };
  solidExtra.add('22,8');

  function tileSolid(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return true;
    const t = grid[ty][tx];
    if (t === WALL || t === WATER) return true;
    if (t === DOOR && !door.open) return true;
    if (solidExtra.has(tx + ',' + ty)) return true;
    return false;
  }
  function solidAtPx(px, py) { return tileSolid(Math.floor(px / TS), Math.floor(py / TS)); }

  // ---------------- Decoração ----------------
  const torches = [[17,27],[27,27],[16,16],[28,16],[16,22],[28,22],
                   [4,14],[4,20],[28,13],[28,19],[40,13],[40,19]];
  const candles = [[19,6],[25,6],[19,11],[25,11],[22,5]];

  // ---------------- Entidades (pistas, bichos, corações) ----------------
  const clues = [
    { x: 20, y: 27, pos: 1, digit: '0', got: false,
      lines: ["Uma página rasgada... a letra é dele.",
              "“Tudo começou num 0... o primeiro dia, o primeiro sim. Guarde este algarismo: 0.”"] },
    { x: 7, y: 15, pos: 2, digit: '9', got: false,
      lines: ["A página estava escondida entre os livros.",
              "“No dia 9 o mundo decidiu nos juntar. Guarde este algarismo: 9.”"] },
    { x: 37, y: 18, pos: 3, digit: '0', got: false,
      lines: ["A página tremula sob a lua do jardim.",
              "“Antes de você, eu era um zero à esquerda. Guarde este algarismo: 0.”"] },
    { x: 24, y: 18, pos: 4, digit: '3', got: false,
      lines: ["A última página, no centro do salão.",
              "“Três: o mês em que tudo começou. Junte os 4 números na ordem das páginas e o portão se abrirá.”"] },
  ];

  const cat = { x: 31, y: 19, met: false, name: 'Logan', following: false };
  const dog = { x: 12, y: 19, met: false, name: 'Mel', following: false };

  const hearts = [
    { x: 22, y: 21, got: false, line: "Um coração antigo pulsa: “2 anos e 3 meses... e ainda parece o primeiro dia.”" },
    { x: 35, y: 13, got: false, line: "Outro coração sussurra: “cada risada sua vale mais que qualquer tesouro.”" },
  ];

  // ---------------- Jogador ----------------
  const player = {
    x: 22 * TS + TS/2, y: 28 * TS + TS/2,
    dir: 'up', moving: false, anim: 0, hair: 'castanho'
  };
  const trail = [];

  // ---------------- Estado ----------------
  let started = false;
  let dialogOpen = false, modalOpen = false, endingShown = false;
  let stepTimer = 0;
  const particles = [];

  // ---------------- Pré-render do cenário ----------------
  const bg = document.createElement('canvas');
  bg.width = WORLD_W; bg.height = WORLD_H;
  const bgx = bg.getContext('2d');
  function prerender() {
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const X = x * TS, Y = y * TS, t = grid[y][x];
        if (bookshelfTiles.has(x + ',' + y)) { Sprites.bookshelf(bgx, X, Y, TS); continue; }
        if (t === WALL || t === DOOR) Sprites.wall(bgx, X, Y, TS, x, y);
        else if (t === CARPET) Sprites.carpet(bgx, X, Y, TS, x, y);
        else if (t === GRASS) Sprites.grass(bgx, X, Y, TS, x, y);
        else if (t === WATER) Sprites.water(bgx, X, Y, TS, x, y, 0);
        else Sprites.floor(bgx, X, Y, TS, x, y);
      }
    }
  }
  prerender();

  // ---------------- Input ----------------
  const keys = {};
  const touchDir = { x: 0, y: 0 };
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    keys[e.key.toLowerCase()] = true;
    if (modalOpen) { handleKeypadKey(e.key); return; }
    if (e.key === 'Escape') toggleHelp();
    if (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Enter') onInteract();
  });
  window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

  // touch controls
  const touchEl = document.getElementById('touch');
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) touchEl.classList.add('on');
  function bindPad(id, dx, dy) {
    const el = document.querySelector(id);
    const set = (v) => { if (v) { touchDir.x = dx; touchDir.y = dy; } else { if (touchDir.x===dx && touchDir.y===dy){touchDir.x=0;touchDir.y=0;} } };
    el.addEventListener('touchstart', (e)=>{e.preventDefault(); set(true);});
    el.addEventListener('touchend', (e)=>{e.preventDefault(); set(false);});
    el.addEventListener('mousedown', ()=>set(true));
    el.addEventListener('mouseup', ()=>set(false));
    el.addEventListener('mouseleave', ()=>set(false));
  }
  bindPad('.dpad .up', 0, -1); bindPad('.dpad .down', 0, 1);
  bindPad('.dpad .left', -1, 0); bindPad('.dpad .right', 1, 0);
  document.querySelector('.abtn').addEventListener('touchstart', (e)=>{e.preventDefault(); onInteract();});
  document.querySelector('.abtn').addEventListener('click', ()=>onInteract());

  // ---------------- Câmera ----------------
  let camX = 0, camY = 0;
  function updateCamera() {
    camX = Math.round(clamp(player.x - VIEW_W/2, 0, WORLD_W - VIEW_W));
    camY = Math.round(clamp(player.y - VIEW_H/2, 0, WORLD_H - VIEW_H));
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ---------------- Movimento + colisão ----------------
  function movePlayer(dt) {
    let vx = 0, vy = 0;
    if (keys['arrowup'] || keys['w']) vy -= 1;
    if (keys['arrowdown'] || keys['s']) vy += 1;
    if (keys['arrowleft'] || keys['a']) vx -= 1;
    if (keys['arrowright'] || keys['d']) vx += 1;
    vx += touchDir.x; vy += touchDir.y;

    const len = Math.hypot(vx, vy);
    player.moving = len > 0;
    if (len > 0) {
      vx /= len; vy /= len;
      if (Math.abs(vx) > Math.abs(vy)) player.dir = vx < 0 ? 'left' : 'right';
      else player.dir = vy < 0 ? 'up' : 'down';

      const hw = 9, hb = 2, ht = 14; // caixa de colisão (pés)
      let nx = player.x + vx * SPEED * dt;
      if (!collide(nx, player.y, hw, hb, ht)) player.x = nx;
      let ny = player.y + vy * SPEED * dt;
      if (!collide(player.x, ny, hw, hb, ht)) player.y = ny;

      player.anim += dt;
      stepTimer -= dt;
      if (stepTimer <= 0) { Audio7.sfx.step(); stepTimer = 0.3; }
    }
  }
  function collide(cx, cy, hw, hb, ht) {
    // checa cantos da caixa de colisão (área dos pés)
    const pts = [[cx-hw, cy-hb], [cx+hw, cy-hb], [cx-hw, cy-ht], [cx+hw, cy-ht]];
    return pts.some(([px, py]) => solidAtPx(px, py));
  }

  // ---------------- Companheiros ----------------
  function updateCompanions() {
    trail.push({ x: player.x, y: player.y });
    if (trail.length > 60) trail.shift();
    if (cat.following) followTo(cat, trail[Math.max(0, trail.length - 16)]);
    if (dog.following) followTo(dog, trail[Math.max(0, trail.length - 28)]);
  }
  function followTo(c, target) {
    if (!target) return;
    const tx = target.x, ty = target.y;
    c.px = (c.px === undefined) ? c.x * TS + TS/2 : c.px;
    c.py = (c.py === undefined) ? c.y * TS + TS/2 : c.py;
    c.px += (tx - c.px) * 0.18;
    c.py += (ty - c.py) * 0.18;
  }

  // ---------------- Interação ----------------
  function nearest() {
    // retorna alvo interativo mais próximo dentro do alcance
    const px = player.x, py = player.y;
    const range = 46;
    let best = null, bd = range;
    const consider = (obj, wx, wy, type) => {
      const d = Math.hypot(px - wx, py - wy);
      if (d < bd) { bd = d; best = { obj, type, wx, wy }; }
    };
    clues.forEach(c => { if (!c.got) consider(c, c.x*TS+TS/2, c.y*TS+TS/2, 'clue'); });
    hearts.forEach(h => { if (!h.got) consider(h, h.x*TS+TS/2, h.y*TS+TS/2, 'heart'); });
    if (!cat.met) consider(cat, cat.x*TS+TS/2, cat.y*TS+TS/2, 'cat');
    if (!dog.met) consider(dog, dog.x*TS+TS/2, dog.y*TS+TS/2, 'dog');
    // porta
    const dcx = (door.tx+1)*TS, dcy = (door.ty+2)*TS;
    if (!door.open) { const d = Math.hypot(px-dcx, py-(dcy)); if (d < 70 && d < bd) { bd=d; best={obj:door,type:'door',wx:dcx,wy:dcy}; } }
    // pedestal final
    if (door.open) consider(pedestalTile, pedestalTile.x*TS+TS/2, pedestalTile.y*TS+TS/2, 'pedestal');
    return best;
  }

  function onInteract() {
    if (!started) return;
    if (dialogOpen) { Dialog.advance(); return; }
    if (modalOpen) return;
    const tgt = nearest();
    if (!tgt) return;
    if (tgt.type === 'clue') collectClue(tgt.obj);
    else if (tgt.type === 'heart') collectHeart(tgt.obj);
    else if (tgt.type === 'cat') meetCat();
    else if (tgt.type === 'dog') meetDog();
    else if (tgt.type === 'door') openLock();
    else if (tgt.type === 'pedestal') reachReward();
  }

  function collectClue(c) {
    Audio7.sfx.page();
    Dialog.show('Página perdida', c.lines, () => {
      c.got = true;
      Audio7.sfx.pickup();
      updateHud();
    }, 'narr');
  }
  function collectHeart(h) {
    h.got = true;
    Audio7.sfx.heart();
    Dialog.show('Lembrança', [h.line], null, 'narr');
  }
  function meetCat() {
    cat.met = true; Audio7.sfx.meow();
    Dialog.show('Logan', [
      "Miau. Um gato de fraque preto e branco te encara com olhos verdes.",
      "Ele esfrega a cabeça na sua perna... parece que decidiu te seguir.",
      "(Logan, o gato, agora te acompanha!)"
    ], () => { cat.following = true; }, '');
  }
  function meetDog() {
    dog.met = true; Audio7.sfx.bark();
    Dialog.show('Mel', [
      "Au au! Uma cachorrinha fofa aparece abanando o rabo sem parar.",
      "Ela late feliz, como se já te conhecesse de outra vida.",
      "(Mel, a cachorra, agora te acompanha!)"
    ], () => { dog.following = true; }, '');
  }

  function collectedDigits() {
    return clues.slice().sort((a,b)=>a.pos-b.pos).map(c => c.got ? c.digit : '?');
  }

  // ---------------- Recompensa final ----------------
  function reachReward() {
    if (endingShown) return;
    endingShown = true;
    Audio7.sfx.chime();
    Dialog.show('???', [
      "No alto do pedestal, um coração de luz pulsa devagar.",
      "Você toca nele... e a mansão inteira treme, as sombras se dissolvem.",
      "Uma voz que você conhece muito bem ecoa: — Parabéns, meu amor. Você resolveu o enigma."
    ], showEnding, '');
  }
  function showEnding() {
    document.getElementById('ending').classList.remove('hidden');
  }
  document.getElementById('rewardBtn').addEventListener('click', () => {
    try { localStorage.setItem('enigma_completo', '1'); } catch(e) {}
    const fader = document.getElementById('fader');
    fader.classList.add('show');
    setTimeout(() => { window.location.href = 'recompensa.html'; }, 1100);
  });

  // ============================================================
  //  DIÁLOGO (typewriter)
  // ============================================================
  const Dialog = (() => {
    const box = document.getElementById('dialog');
    const elSp = document.getElementById('dlgSpeaker');
    const elTx = document.getElementById('dlgText');
    const elCont = document.getElementById('dlgCont');
    let lines = [], idx = 0, full = '', shown = 0, typing = false, onDone = null, ti = null;

    function show(speaker, ls, done, cls) {
      lines = ls; idx = 0; onDone = done;
      elSp.textContent = speaker;
      elSp.className = 'speaker ' + (cls || '');
      dialogOpen = true;
      box.classList.remove('hidden');
      render();
    }
    function render() {
      full = lines[idx]; shown = 0; typing = true; elTx.textContent = '';
      elCont.style.visibility = 'hidden';
      clearInterval(ti);
      ti = setInterval(() => {
        shown++;
        elTx.textContent = full.slice(0, shown);
        if (shown >= full.length) { typing = false; clearInterval(ti); elCont.style.visibility = 'visible'; }
      }, 18);
    }
    function advance() {
      if (typing) { clearInterval(ti); elTx.textContent = full; typing = false; elCont.style.visibility = 'visible'; return; }
      idx++;
      if (idx < lines.length) render();
      else close();
    }
    function close() {
      box.classList.add('hidden'); dialogOpen = false;
      const cb = onDone; onDone = null;
      if (cb) cb();
    }
    box.addEventListener('click', advance);
    return { show, advance };
  })();

  // ============================================================
  //  ENIGMA — teclado da porta
  // ============================================================
  let codeEntry = '';
  const CODE = '0903';
  const lockModal = document.getElementById('lockModal');
  const codeDisplay = document.getElementById('codeDisplay');
  const clueRecap = document.getElementById('clueRecap');

  function openLock() {
    if (door.open) return;
    modalOpen = true; codeEntry = '';
    lockModal.classList.remove('hidden');
    renderCode();
    const digs = collectedDigits();
    clueRecap.innerHTML = 'Páginas encontradas (na ordem): <b style="color:#e8b04b;letter-spacing:6px">'
      + digs.join(' ') + '</b><br><span style="opacity:.7">Encontre as 4 páginas para revelar a senha.</span>';
  }
  function closeLock() { modalOpen = false; lockModal.classList.add('hidden'); }
  function renderCode() {
    let s = codeEntry.padEnd(4, '•');
    codeDisplay.textContent = s.split('').join(' ');
  }
  function pressKey(k) {
    if (k === 'del') { codeEntry = codeEntry.slice(0, -1); Audio7.sfx.key(); renderCode(); return; }
    if (k === 'ok') { submitCode(); return; }
    if (codeEntry.length < 4) { codeEntry += k; Audio7.sfx.key(); renderCode(); if (codeEntry.length===4) setTimeout(submitCode,250); }
  }
  function submitCode() {
    if (codeEntry === CODE) {
      Audio7.sfx.open();
      closeLock();
      door.open = true;
      // libera os tiles da porta
      carve(door.tx, door.ty, door.tx+1, door.ty+1, CARPET);
      Dialog.show('O portão', [
        "0 9 0 3... nove de março. O dia em que a nossa história começou.",
        "Os ferrolhos cedem com um estalo profundo e a porta selada range...",
        "Uma passagem banhada em luz dourada se revela. Suba — a sua recompensa espera no santuário."
      ], null, 'narr');
    } else {
      Audio7.sfx.error();
      codeDisplay.classList.add('err');
      setTimeout(() => codeDisplay.classList.remove('err'), 450);
      codeEntry = '';
      setTimeout(renderCode, 460);
    }
  }
  function handleKeypadKey(key) {
    if (key === 'Escape') { closeLock(); return; }
    if (key === 'Backspace') { pressKey('del'); return; }
    if (key === 'Enter') { pressKey('ok'); return; }
    if (/^[0-9]$/.test(key)) pressKey(key);
  }
  // botões do teclado
  document.querySelectorAll('#keypad button').forEach(b => {
    b.addEventListener('click', () => pressKey(b.dataset.k));
  });
  document.getElementById('lockClose').addEventListener('click', closeLock);

  // ---------------- Ajuda ----------------
  const helpModal = document.getElementById('helpModal');
  function toggleHelp() { helpModal.classList.toggle('hidden'); }
  document.getElementById('helpBtn').addEventListener('click', toggleHelp);
  document.getElementById('helpClose').addEventListener('click', toggleHelp);

  // ---------------- Mudo ----------------
  document.getElementById('muteBtn').addEventListener('click', (e) => {
    const m = Audio7.toggleMute();
    e.currentTarget.textContent = m ? '🔇' : '🔊';
  });

  // ---------------- HUD ----------------
  function updateHud() {
    const n = clues.filter(c => c.got).length;
    document.getElementById('clueCount').textContent = n + ' / 4';
  }

  // ============================================================
  //  RENDER
  // ============================================================
  const light = document.createElement('canvas');
  light.width = VIEW_W; light.height = VIEW_H;
  const lx = light.getContext('2d');

  function W2Sx(wx) { return wx - camX; }
  function W2Sy(wy) { return wy - camY; }

  function render(t) {
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    // cenário estático
    ctx.drawImage(bg, camX, camY, VIEW_W, VIEW_H, 0, 0, VIEW_W, VIEW_H);

    // fonte: brilho de água + coração
    waterTiles.forEach(([x,y]) => {
      const X = x*TS - camX, Y = y*TS - camY;
      if (X < -TS || X > VIEW_W || Y < -TS || Y > VIEW_H) return;
      const sh = Math.sin(t*2 + x + y) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(140,190,225,${0.12+sh*0.16})`;
      ctx.fillRect(X, Y+TS*0.25, TS, 2);
      ctx.fillStyle = `rgba(140,190,225,${0.10+(1-sh)*0.14})`;
      ctx.fillRect(X, Y+TS*0.62, TS, 2);
    });
    Sprites.heart(ctx, 33.5*TS - camX + TS/2 - TS/2, 15*TS - camY, t, 6);

    // tochas / velas
    torches.forEach(([x,y]) => {
      const X = x*TS - camX, Y = y*TS - camY;
      if (X < -TS || X > VIEW_W || Y < -TS || Y > VIEW_H) return;
      Sprites.torch(ctx, X, Y, TS, t);
      // faíscas
      if (Math.random() < 0.06) particles.push({ x: x*TS+TS/2, y: y*TS+TS*0.34, vy: -8-Math.random()*10, life: 1, c:'#e8b04b' });
    });
    candles.forEach(([x,y]) => {
      const X = x*TS - camX, Y = y*TS - camY;
      if (X < -TS || X > VIEW_W || Y < -TS || Y > VIEW_H) return;
      Sprites.candle(ctx, X, Y, TS, t);
    });

    // pedestal final (santuário)
    {
      const X = pedestalTile.x*TS - camX, Y = pedestalTile.y*TS - camY;
      Sprites.pedestal(ctx, X, Y, TS, t);
      Sprites.heart(ctx, pedestalTile.x*TS - camX + TS/2, pedestalTile.y*TS - camY - 6, t, 9);
    }

    // porta selada
    Sprites.sealedDoor(ctx, door.tx*TS - camX, door.ty*TS - camY, TS, door.open, t);

    // partículas
    updateParticles(t);

    // pistas / corações
    clues.forEach(c => Sprites.note(ctx, c.x*TS+TS/2 - camX, c.y*TS+TS/2 - camY, t, c.got));
    hearts.forEach(h => { if (!h.got) Sprites.heart(ctx, h.x*TS+TS/2 - camX, h.y*TS+TS/2 - camY, t, 6); });

    // entidades por profundidade
    const ents = [];
    ents.push({ y: player.y, draw: () => Sprites.drawDaniela(ctx, player.x - camX, player.y - camY, player.dir,
                Math.floor(player.anim*8)%2, player.moving, { hair: player.hair }) });
    if (cat.met) {
      const cx = (cat.following ? cat.px : cat.x*TS+TS/2);
      const cy = (cat.following ? cat.py : cat.y*TS+TS/2);
      ents.push({ y: cy, draw: () => Sprites.drawCat(ctx, cx - camX, cy - camY, t) });
    } else {
      ents.push({ y: cat.y*TS+TS/2, draw: () => Sprites.drawCat(ctx, cat.x*TS+TS/2 - camX, cat.y*TS+TS/2 - camY, t) });
    }
    if (dog.met) {
      const dx = (dog.following ? dog.px : dog.x*TS+TS/2);
      const dy = (dog.following ? dog.py : dog.y*TS+TS/2);
      ents.push({ y: dy, draw: () => Sprites.drawDog(ctx, dx - camX, dy - camY, t) });
    } else {
      ents.push({ y: dog.y*TS+TS/2, draw: () => Sprites.drawDog(ctx, dog.x*TS+TS/2 - camX, dog.y*TS+TS/2 - camY, t) });
    }
    ents.sort((a,b) => a.y - b.y).forEach(e => e.draw());

    // dica de interação (E)
    const tgt = (started && !dialogOpen && !modalOpen) ? nearest() : null;
    if (tgt) {
      const sx = tgt.wx - camX, sy = tgt.wy - camY - 40 - Math.sin(t*4)*3;
      ctx.save();
      ctx.fillStyle = 'rgba(8,5,14,.85)'; ctx.strokeStyle = '#e8b04b'; ctx.lineWidth = 1;
      roundRect(ctx, sx-12, sy-12, 24, 22, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e8b04b'; ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('E', sx, sy);
      ctx.restore();
    }

    // ---------- iluminação ----------
    lx.clearRect(0, 0, VIEW_W, VIEW_H);
    lx.fillStyle = 'rgba(6,4,12,0.80)';
    lx.fillRect(0, 0, VIEW_W, VIEW_H);
    lx.globalCompositeOperation = 'destination-out';
    // luz do jogador
    punch(player.x - camX, player.y - camY - 14, 165);
    // luz das tochas/velas
    torches.forEach(([x,y]) => punch(x*TS+TS/2 - camX, y*TS+TS*0.34 - camY, 95 + Math.sin(t*12+x)*6));
    candles.forEach(([x,y]) => punch(x*TS+TS/2 - camX, y*TS+TS*0.45 - camY, 55 + Math.sin(t*10+x)*4));
    // pistas brilham
    clues.forEach(c => { if (!c.got) punch(c.x*TS+TS/2 - camX, c.y*TS+TS/2 - camY, 60); });
    // porta / pedestal
    if (!door.open) punch((door.tx+1)*TS - camX, (door.ty+1)*TS - camY, 70);
    else {
      punch((door.tx+1)*TS - camX, (door.ty+1)*TS - camY, 120);
      // o pedestal só brilha depois que o portão abre (não entrega o final antes)
      punch(pedestalTile.x*TS+TS/2 - camX, pedestalTile.y*TS+TS/2 - camY, 120);
    }
    lx.globalCompositeOperation = 'source-over';
    ctx.drawImage(light, 0, 0);

    // tinta quente das tochas (aditiva, por cima da escuridão)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    torches.forEach(([x,y]) => {
      const X = x*TS+TS/2 - camX, Y = y*TS+TS*0.34 - camY;
      if (X<-100||X>VIEW_W+100||Y<-100||Y>VIEW_H+100) return;
      const g = ctx.createRadialGradient(X,Y,2,X,Y,80);
      g.addColorStop(0,'rgba(232,140,40,.18)'); g.addColorStop(1,'rgba(232,140,40,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X,Y,80,0,Math.PI*2); ctx.fill();
    });
    ctx.restore();
  }

  function punch(x, y, r) {
    const g = lx.createRadialGradient(x, y, r*0.15, x, y, r);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.7, 'rgba(0,0,0,0.85)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    lx.fillStyle = g;
    lx.beginPath(); lx.arc(x, y, r, 0, Math.PI*2); lx.fill();
  }

  function updateParticles(t) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.y += p.vy * 0.016; p.life -= 0.02;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      const X = p.x - camX, Y = p.y - camY;
      ctx.globalAlpha = Math.max(0, p.life) * 0.8;
      ctx.fillStyle = p.c;
      ctx.fillRect(X, Y, 2, 2);
      ctx.globalAlpha = 1;
    }
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x+r, y); c.arcTo(x+w, y, x+w, y+h, r);
    c.arcTo(x+w, y+h, x, y+h, r); c.arcTo(x, y+h, x, y, r);
    c.arcTo(x, y, x+w, y, r); c.closePath();
  }

  // ============================================================
  //  LOOP
  // ============================================================
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    if (started && !dialogOpen && !modalOpen && !endingShown) {
      movePlayer(dt);
      updateCompanions();
    }
    updateCamera();
    render(t);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ============================================================
  //  TELA INICIAL / customização
  // ============================================================
  // prévia dos personagens
  function drawPreview(canvasEl, hair) {
    const c = canvasEl.getContext('2d');
    c.imageSmoothingEnabled = false;
    c.clearRect(0,0,canvasEl.width,canvasEl.height);
    // buffer de 48x48 (a CSS amplia para 96px com visual pixelado)
    Sprites.drawDaniela(c, 24, 45, 'down', 0, false, { hair });
  }
  document.querySelectorAll('.char-card').forEach(card => {
    const cv = card.querySelector('canvas');
    drawPreview(cv, card.dataset.hair);
    card.addEventListener('click', () => {
      document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      player.hair = card.dataset.hair;
    });
  });
  document.querySelector('.char-card[data-hair="castanho"]').classList.add('selected');

  document.getElementById('startBtn').addEventListener('click', startGame);
  function startGame() {
    Audio7.resume();
    Audio7.startAmbient();
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    started = true;
    updateHud();
    setTimeout(() => {
      Dialog.show('?', [
        "Você desperta na Mansão do Riacho Grande — um lugar que não reconhece. O ar é frio e cheira a rosas murchas.",
        "Uma voz sussurra do escuro: “encontre as 4 páginas perdidas... e o portão selado revelará o que te trouxe até aqui.”",
        "(Use as SETAS ou W A S D para andar. Chegue perto das coisas e aperte E para interagir.)"
      ], null, 'narr');
    }, 400);
  }

});
