/* ============================================================
   SPRITES — tudo desenhado em código (pixel art via canvas)
   Personagens, criaturas e cenário gótico.
   ============================================================ */
const Sprites = (() => {

  // paleta
  const SKIN = '#f1d3ba', SKIN_SH = '#d6a98a';
  const HAIR = {
    castanho: { base: '#a9743f', sh: '#7e5024', hi: '#c89256' },
    ruivo:    { base: '#bb420f', sh: '#882d08', hi: '#e36a22' }
  };
  const DRESS = '#241430', DRESS_SH = '#160b22', TRIM = '#7a0f1f', LACE = '#cdbce8';
  const BOOT = '#120c1a';

  function r(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, Math.ceil(w), Math.ceil(h)); }

  /* ---------------- DANIELA ----------------
     desenhada com os pés em (cx, footY). ~38px de altura. */
  function drawDaniela(ctx, cx, footY, dir, step, moving, opts) {
    opts = opts || {};
    const hair = HAIR[opts.hair || 'castanho'];
    const x = Math.round(cx), fy = Math.round(footY);

    // sombra
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(x, fy - 1, 13, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const lo = moving ? (step ? 3 : -3) : 0;   // pernas
    const ao = moving ? (step ? -3 : 3) : 0;   // braços (opostos)
    const bob = moving ? (step ? -1 : 0) : 0;  // leve sobe/desce
    const top = fy - 38 + bob;

    // pernas / botas
    r(ctx, x - 6, fy - 9 + lo, 5, 9, BOOT);
    r(ctx, x + 1, fy - 9 - lo, 5, 9, BOOT);

    // vestido (corpo)
    ctx.fillStyle = DRESS;
    ctx.beginPath();
    ctx.moveTo(x - 7, fy - 8);
    ctx.lineTo(x - 9, fy - 8 + 1);     // barra esquerda
    ctx.lineTo(x - 5, top + 20);
    ctx.lineTo(x + 5, top + 20);
    ctx.lineTo(x + 9, fy - 8 + 1);
    ctx.lineTo(x + 7, fy - 8);
    ctx.closePath();
    ctx.fill();
    // sombra do vestido
    r(ctx, x + 1, top + 20, 8, 14, DRESS_SH);
    // detalhe gótico (corset)
    r(ctx, x - 1, top + 20, 2, 13, TRIM);

    // braços
    ctx.fillStyle = DRESS;
    if (dir === 'left') {
      r(ctx, x - 8, top + 20 + ao, 4, 11, DRESS);
    } else if (dir === 'right') {
      r(ctx, x + 4, top + 20 + ao, 4, 11, DRESS);
    } else {
      r(ctx, x - 9, top + 21 + ao, 4, 11, DRESS);
      r(ctx, x + 5, top + 21 - ao, 4, 11, DRESS);
    }
    // mãozinhas (pele)
    if (dir === 'left') r(ctx, x - 8, top + 30 + ao, 4, 3, SKIN);
    else if (dir === 'right') r(ctx, x + 4, top + 30 + ao, 4, 3, SKIN);
    else { r(ctx, x - 9, top + 31 + ao, 4, 3, SKIN); r(ctx, x + 5, top + 31 - ao, 4, 3, SKIN); }

    // colarinho de renda
    r(ctx, x - 6, top + 19, 12, 2, LACE);

    // cabeça
    const hx = x - 8, hy = top + 4, hw = 16, hh = 15;
    r(ctx, hx, hy, hw, hh, SKIN);
    r(ctx, hx, hy + hh - 2, hw, 2, SKIN_SH); // queixo

    // cabelo (depende da direção)
    drawHair(ctx, hx, hy, hw, hh, dir, hair, top, x);

    // rosto
    drawFace(ctx, x, hy, hh, dir);
  }

  function drawHair(ctx, hx, hy, hw, hh, dir, hair, top, x) {
    // topo + franja sempre
    r(ctx, hx - 1, hy - 3, hw + 2, 6, hair.base);
    r(ctx, hx - 1, hy - 3, hw + 2, 2, hair.hi);
    if (dir === 'up') {
      // costas da cabeça: cabelo cobre tudo + longo
      r(ctx, hx - 1, hy - 3, hw + 2, hh + 2, hair.base);
      r(ctx, hx, hy + hh - 2, hw, 12, hair.base);
      r(ctx, hx + 2, hy + hh, hw - 4, 11, hair.sh);
    } else if (dir === 'left' || dir === 'right') {
      // laterais + uma mecha longa
      r(ctx, hx - 1, hy, 4, hh + 8, hair.base);
      r(ctx, hx + hw - 3, hy, 4, hh + 8, hair.base);
      const sx = dir === 'left' ? hx + hw - 3 : hx - 1;
      r(ctx, sx, hy + hh, 4, 12, hair.sh);
    } else {
      // de frente: mechas longas dos dois lados
      r(ctx, hx - 1, hy, 3, hh + 12, hair.base);
      r(ctx, hx + hw - 2, hy, 3, hh + 12, hair.base);
      r(ctx, hx - 1, hy + hh + 4, 3, 8, hair.sh);
      r(ctx, hx + hw - 2, hy + hh + 4, 3, 8, hair.sh);
      // franja
      r(ctx, hx, hy + 1, 4, 4, hair.base);
      r(ctx, hx + hw - 4, hy + 1, 4, 4, hair.base);
    }
  }

  function drawFace(ctx, x, hy, hh, dir) {
    if (dir === 'up') return;
    const ey = hy + 7;
    ctx.fillStyle = '#2a1d1d';
    if (dir === 'left') {
      r(ctx, x - 5, ey, 2, 3, '#2a1d1d');
      r(ctx, x - 1, ey, 2, 3, '#2a1d1d');
      r(ctx, x - 6, ey + 4, 3, 1, '#c9667a'); // blush
    } else if (dir === 'right') {
      r(ctx, x - 1, ey, 2, 3, '#2a1d1d');
      r(ctx, x + 3, ey, 2, 3, '#2a1d1d');
      r(ctx, x + 3, ey + 4, 3, 1, '#c9667a');
    } else {
      r(ctx, x - 5, ey, 2, 3, '#2a1d1d');
      r(ctx, x + 3, ey, 2, 3, '#2a1d1d');
      r(ctx, x - 7, ey + 3, 3, 1, '#c9667a');
      r(ctx, x + 4, ey + 3, 3, 1, '#c9667a');
      r(ctx, x - 1, ey + 5, 2, 1, '#a23b50'); // boquinha
    }
  }

  /* ---------------- LOGAN (gato preto e branco) ---------------- */
  function drawCat(ctx, cx, footY, t) {
    const x = Math.round(cx), fy = Math.round(footY);
    const bob = Math.sin(t * 3) * 1;
    ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(x, fy, 11, 3, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();

    const BLK = '#191622', WHT = '#ece7df';
    // cauda (balança)
    const tw = Math.sin(t * 4) * 5;
    r(ctx, x + 7, fy - 14 + bob, 3, 12, BLK);
    r(ctx, x + 7 + tw, fy - 18 + bob, 3, 6, BLK);
    // corpo
    r(ctx, x - 8, fy - 12 + bob, 16, 12, BLK);
    r(ctx, x - 4, fy - 8 + bob, 8, 8, WHT);       // peito branco
    // patas brancas
    r(ctx, x - 7, fy - 3 + bob, 3, 3, WHT);
    r(ctx, x + 4, fy - 3 + bob, 3, 3, WHT);
    // cabeça
    r(ctx, x - 7, fy - 22 + bob, 14, 11, BLK);
    // orelhas
    ctx.fillStyle = BLK;
    ctx.beginPath(); ctx.moveTo(x-7, fy-22+bob); ctx.lineTo(x-4, fy-27+bob); ctx.lineTo(x-1, fy-22+bob); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x+1, fy-22+bob); ctx.lineTo(x+4, fy-27+bob); ctx.lineTo(x+7, fy-22+bob); ctx.fill();
    // focinho branco
    r(ctx, x - 3, fy - 15 + bob, 6, 4, WHT);
    // olhos verdes
    r(ctx, x - 5, fy - 19 + bob, 3, 2, '#9ad06a');
    r(ctx, x + 2, fy - 19 + bob, 3, 2, '#9ad06a');
    r(ctx, x - 4, fy - 19 + bob, 1, 2, '#1b1b1b');
    r(ctx, x + 3, fy - 19 + bob, 1, 2, '#1b1b1b');
    // narizinho
    r(ctx, x - 1, fy - 14 + bob, 2, 1, '#c9667a');
  }

  /* ---------------- MEL (cachorra fofa) ---------------- */
  function drawDog(ctx, cx, footY, t) {
    const x = Math.round(cx), fy = Math.round(footY);
    const bob = Math.sin(t * 3 + 1) * 1;
    ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(x, fy, 12, 3, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();

    const FUR = '#c99a64', FUR_SH = '#a87c49', CREAM = '#efdcc0';
    // rabo abanando
    const tw = Math.sin(t * 8) * 6;
    r(ctx, x + 8, fy - 16 + bob, 3, 8, FUR);
    r(ctx, x + 9 + tw*0.5, fy - 20 + bob, 3, 6, FUR);
    // corpo
    r(ctx, x - 9, fy - 13 + bob, 18, 13, FUR);
    r(ctx, x - 5, fy - 9 + bob, 10, 9, CREAM); // barriga
    r(ctx, x - 9, fy - 9 + bob, 4, 9, FUR_SH);
    // patas
    r(ctx, x - 8, fy - 3 + bob, 3, 3, CREAM);
    r(ctx, x + 5, fy - 3 + bob, 3, 3, CREAM);
    // cabeça
    r(ctx, x - 8, fy - 23 + bob, 15, 12, FUR);
    r(ctx, x - 4, fy - 16 + bob, 9, 5, CREAM); // focinho
    // orelhas caídas
    r(ctx, x - 11, fy - 22 + bob, 4, 9, FUR_SH);
    r(ctx, x + 7, fy - 22 + bob, 4, 9, FUR_SH);
    // olhos
    r(ctx, x - 5, fy - 20 + bob, 3, 3, '#2a1d1d');
    r(ctx, x + 3, fy - 20 + bob, 3, 3, '#2a1d1d');
    r(ctx, x - 4, fy - 20 + bob, 1, 1, '#fff');
    r(ctx, x + 4, fy - 20 + bob, 1, 1, '#fff');
    // narizinho
    r(ctx, x - 1, fy - 14 + bob, 3, 2, '#2a1d1d');
    // linguinha
    if (Math.sin(t*6) > 0.3) r(ctx, x - 1, fy - 12 + bob, 2, 2, '#d2596f');
  }

  /* ---------------- TILES ---------------- */
  function rng(x, y) { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); }

  function floor(ctx, X, Y, S, gx, gy) {
    r(ctx, X, Y, S, S, '#1d1726');
    r(ctx, X, Y, S, S * 0.5, '#221a2e');
    // junta de pedra
    ctx.strokeStyle = '#100b18'; ctx.lineWidth = 1;
    ctx.strokeRect(X + 0.5, Y + 0.5, S - 1, S - 1);
    const v = rng(gx, gy);
    if (v > 0.7) r(ctx, X + (v*S)%(S-6), Y + (rng(gy,gx)*S)%(S-6), 3, 2, '#2a2236');
    if (v < 0.15) r(ctx, X + 4, Y + S - 6, 5, 2, '#15101e');
  }
  function carpet(ctx, X, Y, S, gx, gy) {
    r(ctx, X, Y, S, S, '#3a0e18');
    r(ctx, X, Y, S, S, 'rgba(0,0,0,0)');
    r(ctx, X + 2, Y + 2, S - 4, S - 4, '#4a121f');
    // padrão losango dourado
    ctx.strokeStyle = 'rgba(232,176,75,.25)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X + S/2, Y + 5); ctx.lineTo(X + S - 5, Y + S/2);
    ctx.lineTo(X + S/2, Y + S - 5); ctx.lineTo(X + 5, Y + S/2); ctx.closePath();
    ctx.stroke();
  }
  function grass(ctx, X, Y, S, gx, gy) {
    r(ctx, X, Y, S, S, '#1b2a18');
    const v = rng(gx, gy);
    r(ctx, X, Y, S, S/2, '#21331d');
    for (let i = 0; i < 4; i++) {
      const bx = X + ((rng(gx+i, gy)*S) | 0);
      const by = Y + ((rng(gx, gy+i)*S) | 0);
      r(ctx, bx, by, 1, 3, '#33502a');
    }
    if (v > 0.85) r(ctx, X + (v*S)%(S-6), Y + 6, 3, 3, '#6a2440'); // florzinha escura
  }
  function water(ctx, X, Y, S, gx, gy, t) {
    r(ctx, X, Y, S, S, '#0c2336');
    const sh = Math.sin(t * 2 + gx + gy) * 0.5 + 0.5;
    r(ctx, X, Y + S*0.2, S, 2, `rgba(120,180,220,${0.12 + sh*0.18})`);
    r(ctx, X, Y + S*0.6, S, 2, `rgba(120,180,220,${0.08 + (1-sh)*0.16})`);
  }
  function wall(ctx, X, Y, S, gx, gy) {
    r(ctx, X, Y, S, S, '#0c0712');
    r(ctx, X, Y, S, S * 0.5, '#140d20');
    r(ctx, X, Y, S, 3, '#241738');       // topo iluminado
    // tijolos
    ctx.strokeStyle = '#070410'; ctx.lineWidth = 1;
    const off = (gy % 2) * (S / 2);
    ctx.beginPath();
    ctx.moveTo(X, Y + S/2); ctx.lineTo(X + S, Y + S/2);
    ctx.moveTo(X + off, Y); ctx.lineTo(X + off, Y + S/2);
    ctx.moveTo(X + ((off + S/2) % S), Y + S/2); ctx.lineTo(X + ((off + S/2) % S), Y + S);
    ctx.stroke();
  }

  /* ---------------- OBJETOS ---------------- */
  function torch(ctx, X, Y, S, t) {
    const cx = X + S/2;
    // suporte
    r(ctx, cx - 2, Y + S*0.45, 4, S*0.4, '#2a2030');
    r(ctx, cx - 4, Y + S*0.42, 8, 4, '#3a2d22');
    // chama
    const f = Math.sin(t * 12) * 2 + Math.sin(t*7)*1.5;
    ctx.save();
    ctx.fillStyle = '#e8b04b';
    ctx.beginPath();
    ctx.ellipse(cx, Y + S*0.34 + f*0.3, 5, 9 + f, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#d6531f';
    ctx.beginPath();
    ctx.ellipse(cx, Y + S*0.36 + f*0.3, 3, 6 + f*0.6, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.ellipse(cx, Y + S*0.4, 1.6, 3, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
  function candle(ctx, X, Y, S, t) {
    const cx = X + S/2;
    r(ctx, cx - 3, Y + S*0.5, 6, S*0.35, '#d9cdb5');
    r(ctx, cx - 3, Y + S*0.5, 6, 3, '#b3a890');
    const f = Math.sin(t*10 + X)*1.4;
    ctx.fillStyle = '#e8b04b';
    ctx.beginPath(); ctx.ellipse(cx, Y + S*0.46 + f*0.2, 2.4, 5 + f, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath(); ctx.ellipse(cx, Y + S*0.49, 1, 2.4, 0, 0, Math.PI*2); ctx.fill();
  }
  function bookshelf(ctx, X, Y, S) {
    r(ctx, X, Y, S, S, '#1c130c');
    r(ctx, X+2, Y+2, S-4, S-4, '#2a1c12');
    const cols = ['#6a1320','#3a2a55','#4a3a18','#244a2a','#5a2a40','#2a3a5a'];
    for (let row = 0; row < 2; row++) {
      let bx = X + 4;
      const by = Y + 5 + row * (S/2 - 3);
      while (bx < X + S - 6) {
        const w = 3 + ((Math.sin(bx*7+row)*2+2)|0);
        r(ctx, bx, by, w, S/2 - 7, cols[(bx+row) % cols.length]);
        bx += w + 1;
      }
      r(ctx, X+2, by + S/2 - 6, S-4, 2, '#160d08'); // prateleira
    }
  }
  function pedestal(ctx, X, Y, S, t) {
    const cx = X + S/2;
    r(ctx, cx - 9, Y + S - 10, 18, 8, '#2a2233');
    r(ctx, cx - 6, Y + 10, 12, S - 18, '#352a44');
    r(ctx, cx - 10, Y + 4, 20, 8, '#3d3050');
    // brilho
    const g = Math.sin(t*3)*0.3 + 0.7;
    ctx.save(); ctx.globalAlpha = g;
    ctx.fillStyle = '#e8b04b';
    ctx.beginPath(); ctx.arc(cx, Y + 2, 5, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  // porta gótica selada (final)
  function sealedDoor(ctx, X, Y, S, open, t) {
    const w = S * 2, h = S * 2;
    if (open) {
      // passagem escura com luz ao fundo
      r(ctx, X, Y, w, h, '#05030a');
      const g = ctx.createRadialGradient(X+w/2, Y+h/2, 4, X+w/2, Y+h/2, w*0.7);
      const pulse = Math.sin(t*2)*0.2 + 0.8;
      g.addColorStop(0, `rgba(232,176,75,${0.5*pulse})`);
      g.addColorStop(1, 'rgba(232,176,75,0)');
      ctx.fillStyle = g; ctx.fillRect(X, Y, w, h);
      return;
    }
    // moldura de pedra
    r(ctx, X - 4, Y - 6, w + 8, h + 6, '#1a1326');
    // arco
    ctx.fillStyle = '#241738';
    ctx.beginPath();
    ctx.moveTo(X, Y + 14);
    ctx.quadraticCurveTo(X + w/2, Y - 14, X + w, Y + 14);
    ctx.lineTo(X + w, Y + 14); ctx.lineTo(X, Y + 14); ctx.fill();
    // folhas da porta
    r(ctx, X + 4, Y + 10, w/2 - 6, h - 12, '#3a281a');
    r(ctx, X + w/2 + 2, Y + 10, w/2 - 6, h - 12, '#33230f');
    r(ctx, X + w/2 - 1, Y + 10, 2, h - 12, '#160d08');
    // ferragens
    r(ctx, X + 8, Y + 18, w - 16, 3, '#15100a');
    r(ctx, X + 8, Y + h - 14, w - 16, 3, '#15100a');
    // cadeado/argola central brilhante
    const cx = X + w/2, cy = Y + h/2;
    const glow = Math.sin(t*3)*0.3 + 0.7;
    ctx.save(); ctx.strokeStyle = `rgba(232,176,75,${glow})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI*2); ctx.stroke(); ctx.restore();
    r(ctx, cx - 3, cy - 2, 6, 8, '#e8b04b');
    r(ctx, cx - 1, cy, 2, 3, '#2a1b06');
  }

  // pista (página flutuante brilhante)
  function note(ctx, cx, cy, t, collected) {
    if (collected) return;
    const bob = Math.sin(t * 2.5) * 3;
    const y = cy + bob;
    ctx.save();
    // brilho
    const g = ctx.createRadialGradient(cx, y, 2, cx, y, 22);
    g.addColorStop(0, 'rgba(232,176,75,.5)');
    g.addColorStop(1, 'rgba(232,176,75,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, y, 22, 0, Math.PI*2); ctx.fill();
    // papel
    ctx.translate(cx, y);
    ctx.rotate(Math.sin(t)*0.06);
    r(ctx, -8, -10, 16, 20, '#e9dcc0');
    r(ctx, -8, -10, 16, 3, '#cdbf9e');
    ctx.fillStyle = '#7a0f1f';
    ctx.font = 'bold 12px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('?', 0, 1);
    // linhas de texto
    r(ctx, -5, 3, 10, 1, '#9a8f74');
    r(ctx, -5, 6, 8, 1, '#9a8f74');
    ctx.restore();
  }

  function heart(ctx, cx, cy, t, s) {
    s = s || 7;
    const bob = Math.sin(t*3)*2;
    ctx.save(); ctx.translate(cx, cy + bob);
    const glow = ctx.createRadialGradient(0,0,1,0,0,s*2.2);
    glow.addColorStop(0,'rgba(179,18,43,.5)'); glow.addColorStop(1,'rgba(179,18,43,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0,0,s*2.2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#b3122b';
    ctx.beginPath();
    ctx.moveTo(0, s*0.8);
    ctx.bezierCurveTo(s, -s*0.4, s*0.4, -s, 0, -s*0.3);
    ctx.bezierCurveTo(-s*0.4, -s, -s, -s*0.4, 0, s*0.8);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.45)';
    ctx.beginPath(); ctx.ellipse(-s*0.3, -s*0.3, s*0.2, s*0.3, 0.4, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  return { drawDaniela, drawCat, drawDog, floor, carpet, grass, water, wall,
           torch, candle, bookshelf, pedestal, sealedDoor, note, heart };
})();
