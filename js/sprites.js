/* ============================================================
   SPRITES — tudo desenhado em código (pixel art via canvas)
   Personagens, criaturas e cenário gótico.
   ============================================================ */
const Sprites = (() => {

  // paleta
  const SKIN = '#f4d7bd', SKIN_SH = '#dcab8a', SKIN_HI = '#ffe8d6';
  const HAIR = {
    castanho: { base: '#9c6b3a', sh: '#6f4a22', hi: '#c49258' },
    ruivo:    { base: '#b8410f', sh: '#852c08', hi: '#e8722a' }
  };
  const DRESS = '#271534', DRESS_SH = '#170c22', DRESS_HI = '#39214d';
  const TRIM = '#8b1023', LACE = '#dccaf0', GOLD = '#e0ac49', BOOT = '#140d1c';

  function r(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, Math.ceil(w), Math.ceil(h)); }
  function rr(ctx, x, y, w, h, rad, c) {
    x = Math.round(x); y = Math.round(y); w = Math.ceil(w); h = Math.ceil(h);
    rad = Math.max(0, Math.min(rad, w / 2, h / 2));
    if (c) ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath(); ctx.fill();
  }
  function shadow(ctx, x, fy, rw) {
    ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(x, fy, rw, 3.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }

  /* ---------------- DANIELA ----------------
     pés em (cx, footY). ~40px de altura. */
  function drawDaniela(ctx, cx, footY, dir, step, moving, opts) {
    opts = opts || {};
    const H = HAIR[opts.hair || 'castanho'];
    const x = Math.round(cx), fy = Math.round(footY);
    const lo = moving ? (step ? 2 : -2) : 0;
    const ao = moving ? (step ? -2 : 2) : 0;
    const bob = moving ? (step ? -1 : 0) : 0;
    const sw = moving ? (step ? 1 : -1) : 0;

    shadow(ctx, x, fy - 1, 12);

    const headTop = fy - 39 + bob;
    const faceW = 15, faceH = 15, hx = x - 7;

    // ===== cabelo de trás =====
    if (dir === 'up') {
      rr(ctx, hx - 1, headTop - 2, faceW + 2, faceH + 6, 5, H.base);
      rr(ctx, x - 8, headTop + 9, 17, 27, 5, H.base);
      r(ctx, x - 8, headTop + 12, 5, 22, H.sh);
      r(ctx, x + 4, headTop + 12, 5, 22, H.sh);
    } else {
      // mechas longas e onduladas (mais graciosas)
      ctx.fillStyle = H.base;
      [-1, 1].forEach(s => {
        ctx.beginPath();
        ctx.moveTo(x + s * 4, headTop + 3);
        ctx.quadraticCurveTo(x + s * 10, headTop + 16, x + s * 7, headTop + 32);
        ctx.quadraticCurveTo(x + s * 5.5, headTop + 35, x + s * 3.5, headTop + 31);
        ctx.quadraticCurveTo(x + s * 5, headTop + 16, x + s * 2, headTop + 5);
        ctx.closePath(); ctx.fill();
      });
      ctx.fillStyle = H.sh;
      r(ctx, x - 8, headTop + 24, 3, 9, H.sh);
      r(ctx, x + 5, headTop + 24, 3, 9, H.sh);
      ctx.fillStyle = H.hi;
      r(ctx, x - 7, headTop + 7, 1, 15, H.hi);
      r(ctx, x + 6, headTop + 7, 1, 15, H.hi);
    }

    // ===== pernas / botas =====
    r(ctx, x - 5, fy - 7 + lo, 4, 7, BOOT);
    r(ctx, x + 1, fy - 7 - lo, 4, 7, BOOT);
    r(ctx, x - 5, fy - 2 + lo, 4, 2, '#2c2238');
    r(ctx, x + 1, fy - 2 - lo, 4, 2, '#2c2238');

    // ===== saia (rodada) =====
    const skTop = headTop + 27, skBot = fy - 5;
    ctx.fillStyle = DRESS;
    ctx.beginPath();
    ctx.moveTo(x - 6, skTop);
    ctx.lineTo(x - 11 + sw, skBot);
    ctx.quadraticCurveTo(x + sw, skBot + 2, x + 11 + sw, skBot);
    ctx.lineTo(x + 6, skTop);
    ctx.closePath(); ctx.fill();
    // sombra (metade direita)
    ctx.fillStyle = DRESS_SH;
    ctx.beginPath();
    ctx.moveTo(x + 1, skTop); ctx.lineTo(x + 2 + sw, skBot);
    ctx.lineTo(x + 11 + sw, skBot); ctx.lineTo(x + 6, skTop); ctx.closePath(); ctx.fill();
    // luz (dobra esquerda)
    ctx.fillStyle = DRESS_HI;
    ctx.beginPath();
    ctx.moveTo(x - 6, skTop); ctx.lineTo(x - 11 + sw, skBot);
    ctx.lineTo(x - 7 + sw, skBot); ctx.lineTo(x - 2, skTop); ctx.closePath(); ctx.fill();
    // barra de renda + sangue
    ctx.fillStyle = TRIM;
    ctx.beginPath();
    ctx.moveTo(x - 11 + sw, skBot); ctx.quadraticCurveTo(x + sw, skBot + 2, x + 11 + sw, skBot);
    ctx.lineTo(x + 10 + sw, skBot - 3); ctx.lineTo(x - 10 + sw, skBot - 3); ctx.closePath(); ctx.fill();
    for (let i = -9; i <= 9; i += 3) r(ctx, x + i + sw, skBot - 1, 1, 1, LACE);

    // ===== corpete =====
    const boTop = headTop + 17, boBot = skTop;
    rr(ctx, x - 6, boTop, 12, boBot - boTop, 3, DRESS);
    r(ctx, x + 2, boTop, 4, boBot - boTop, DRESS_SH);
    r(ctx, x - 6, boTop, 2, boBot - boTop, DRESS_HI);
    // ilhós do corpete (dourado)
    ctx.strokeStyle = GOLD; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) { const yy = boTop + 3 + i * 3; ctx.moveTo(x - 2.5, yy); ctx.lineTo(x + 2.5, yy + 1.6); ctx.moveTo(x + 2.5, yy); ctx.lineTo(x - 2.5, yy + 1.6); }
    ctx.stroke();

    // ===== braços / mangas =====
    if (dir === 'left') {
      rr(ctx, x - 8, boTop + 1 + ao, 4, 11, 2, DRESS); rr(ctx, x - 8, boTop + 10 + ao, 4, 3, 1, SKIN);
    } else if (dir === 'right') {
      rr(ctx, x + 4, boTop + 1 + ao, 4, 11, 2, DRESS); rr(ctx, x + 4, boTop + 10 + ao, 4, 3, 1, SKIN);
    } else {
      rr(ctx, x - 9, boTop + 1 + ao, 4, 11, 2, DRESS); rr(ctx, x - 9, boTop + 10 + ao, 4, 3, 1, SKIN);
      rr(ctx, x + 5, boTop + 1 - ao, 4, 11, 2, DRESS); rr(ctx, x + 5, boTop + 10 - ao, 4, 3, 1, SKIN);
    }

    // ===== gola de renda =====
    rr(ctx, x - 6, boTop - 2, 12, 3, 1, LACE);
    r(ctx, x - 1, boTop - 1, 2, 2, TRIM); // camafeu

    // ===== cabeça =====
    rr(ctx, hx, headTop + 1, faceW, faceH, 6, SKIN);
    r(ctx, hx + 2, headTop + faceH - 1, faceW - 4, 2, SKIN_SH); // queixo
    r(ctx, hx + 1, headTop + 4, 2, 6, SKIN_HI);                 // luz no rosto

    // ===== cabelo da frente =====
    if (dir !== 'up') {
      rr(ctx, hx - 1, headTop - 2, faceW + 2, 8, 4, H.base);
      r(ctx, hx, headTop - 2, faceW, 2, H.hi);
      r(ctx, hx - 1, headTop + 2, 3, 12, H.base);
      r(ctx, hx + faceW - 2, headTop + 2, 3, 12, H.base);
      r(ctx, hx - 1, headTop + 2, 1, 10, H.sh);
      r(ctx, hx + faceW - 1, headTop + 2, 1, 10, H.sh);
      if (dir === 'down') {
        // franja repartida
        r(ctx, hx, headTop + 4, 5, 4, H.base);
        r(ctx, hx + faceW - 5, headTop + 4, 5, 4, H.base);
        r(ctx, x - 1, headTop + 3, 2, 2, H.base);
        r(ctx, hx + 1, headTop + 4, 3, 1, H.hi);
      } else if (dir === 'left') {
        r(ctx, hx, headTop + 4, 8, 4, H.base);
      } else {
        r(ctx, hx + faceW - 8, headTop + 4, 8, 4, H.base);
      }
    } else {
      rr(ctx, hx - 1, headTop - 2, faceW + 2, faceH + 4, 6, H.base);
      r(ctx, hx, headTop - 2, faceW, 2, H.hi);
    }

    if (dir !== 'up') drawFacePretty(ctx, x, headTop, dir);
  }

  function drawFacePretty(ctx, x, headTop, dir) {
    const ey = headTop + 8;
    const EYE = '#3a2730', IRIS = '#5a3a26';
    function eye(ox) {
      rr(ctx, ox, ey, 3, 4, 1.2, '#fbf6ee');     // esclera
      r(ctx, ox + 0.7, ey + 0.8, 2, 3, IRIS);     // íris
      r(ctx, ox + 1, ey + 1.4, 1.3, 2, EYE);      // pupila
      r(ctx, ox + 1.4, ey + 0.9, 1, 1, '#fff');   // brilho
      r(ctx, ox - 0.4, ey - 0.6, 4, 1, EYE);      // cílios/linha sup.
    }
    function brow(ox) { r(ctx, ox, ey - 2.4, 4, 1, '#6f4a30'); }
    if (dir === 'down') {
      eye(x - 5); eye(x + 2);
      brow(x - 5.5); brow(x + 1.5);
      r(ctx, x - 6, ey + 5, 3, 1.4, 'rgba(224,120,140,.55)'); // blush
      r(ctx, x + 3, ey + 5, 3, 1.4, 'rgba(224,120,140,.55)');
      r(ctx, x - 1.5, ey + 6, 3, 1.4, '#c25a72');             // boquinha
      r(ctx, x - 0.5, ey + 3, 1, 1, SKIN_SH);                 // narizinho
    } else if (dir === 'left') {
      eye(x - 5); eye(x - 0.5);
      brow(x - 5.5); brow(x - 1);
      r(ctx, x - 6, ey + 5, 3, 1.4, 'rgba(224,120,140,.5)');
      r(ctx, x - 4, ey + 6, 3, 1.3, '#c25a72');
    } else if (dir === 'right') {
      eye(x - 2); eye(x + 2.5);
      brow(x - 2.5); brow(x + 2);
      r(ctx, x + 3, ey + 5, 3, 1.4, 'rgba(224,120,140,.5)');
      r(ctx, x + 1, ey + 6, 3, 1.3, '#c25a72');
    }
  }

  /* ---------------- LOGAN (gato preto e branco — igual à foto) ---------------- */
  function drawCat(ctx, cx, footY, t) {
    const x = Math.round(cx), fy = Math.round(footY);
    const bob = Math.sin(t * 3) * 1;
    shadow(ctx, x, fy, 11);

    const BLK = '#1c1822', WHT = '#efe9e0', WHT_SH = '#cfc8bd', PINK = '#d98aa0', EYE = '#a6d56e';

    // cauda
    const tw = Math.sin(t * 3) * 4;
    rr(ctx, x + 7, fy - 13 + bob, 4, 13, 2, BLK);
    rr(ctx, x + 8 + tw * 0.4, fy - 19 + bob, 4, 8, 2, BLK);

    // corpo (costas pretas)
    rr(ctx, x - 9, fy - 16 + bob, 18, 16, 6, BLK);
    // peito branco (babador grande)
    ctx.fillStyle = WHT;
    ctx.beginPath();
    ctx.moveTo(x - 5, fy - 15 + bob);
    ctx.quadraticCurveTo(x, fy - 1 + bob, x + 5, fy - 15 + bob);
    ctx.lineTo(x + 5, fy + bob); ctx.lineTo(x - 5, fy + bob); ctx.closePath(); ctx.fill();
    // patas brancas
    rr(ctx, x - 6, fy - 3 + bob, 4, 4, 1.5, WHT);
    rr(ctx, x + 2, fy - 3 + bob, 4, 4, 1.5, WHT);
    r(ctx, x - 5, fy - 1 + bob, 4, 1, WHT_SH);
    r(ctx, x + 3, fy - 1 + bob, 4, 1, WHT_SH);

    // cabeça preta
    rr(ctx, x - 8, fy - 28 + bob, 16, 14, 6, BLK);
    // orelhas
    ctx.fillStyle = BLK;
    ctx.beginPath(); ctx.moveTo(x - 8, fy - 26 + bob); ctx.lineTo(x - 7, fy - 33 + bob); ctx.lineTo(x - 2, fy - 27 + bob); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 8, fy - 26 + bob); ctx.lineTo(x + 7, fy - 33 + bob); ctx.lineTo(x + 2, fy - 27 + bob); ctx.closePath(); ctx.fill();
    ctx.fillStyle = PINK;
    ctx.beginPath(); ctx.moveTo(x - 6, fy - 27 + bob); ctx.lineTo(x - 5.5, fy - 31 + bob); ctx.lineTo(x - 3.5, fy - 27.5 + bob); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 6, fy - 27 + bob); ctx.lineTo(x + 5.5, fy - 31 + bob); ctx.lineTo(x + 3.5, fy - 27.5 + bob); ctx.closePath(); ctx.fill();

    // faixa branca do focinho (igual à foto): estreita em cima, alarga até o focinho
    ctx.fillStyle = WHT;
    ctx.beginPath();
    ctx.moveTo(x, fy - 26 + bob);
    ctx.lineTo(x - 4.5, fy - 14 + bob);
    ctx.lineTo(x + 4.5, fy - 14 + bob);
    ctx.closePath(); ctx.fill();
    // focinho/queixo branco
    rr(ctx, x - 5, fy - 17 + bob, 10, 7, 4, WHT);

    // olhos grandes verdes
    function catEye(ox) {
      rr(ctx, ox, fy - 23 + bob, 4.4, 4.4, 2, EYE);
      r(ctx, ox + 1.4, fy - 22.6 + bob, 1.6, 3.6, '#15240c'); // pupila
      r(ctx, ox + 1.7, fy - 22.2 + bob, 1, 1.2, '#fff');      // brilho
    }
    catEye(x - 5); catEye(x + 0.6);

    // narizinho + boca
    r(ctx, x - 1, fy - 14 + bob, 2, 1.6, PINK);
    ctx.strokeStyle = '#2a2026'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, fy - 12.5 + bob); ctx.lineTo(x, fy - 11.5 + bob);
    ctx.moveTo(x, fy - 11.5 + bob); ctx.lineTo(x - 2, fy - 10.5 + bob);
    ctx.moveTo(x, fy - 11.5 + bob); ctx.lineTo(x + 2, fy - 10.5 + bob);
    ctx.stroke();
    // bigodes
    ctx.strokeStyle = 'rgba(240,235,225,.55)';
    ctx.beginPath();
    ctx.moveTo(x - 3, fy - 13 + bob); ctx.lineTo(x - 10, fy - 14 + bob);
    ctx.moveTo(x - 3, fy - 12 + bob); ctx.lineTo(x - 10, fy - 11 + bob);
    ctx.moveTo(x + 3, fy - 13 + bob); ctx.lineTo(x + 10, fy - 14 + bob);
    ctx.moveTo(x + 3, fy - 12 + bob); ctx.lineTo(x + 10, fy - 11 + bob);
    ctx.stroke();
  }

  /* ---------------- MEL (cachorra caramelo fofa) ---------------- */
  function drawDog(ctx, cx, footY, t) {
    const x = Math.round(cx), fy = Math.round(footY);
    const bob = Math.sin(t * 3 + 1) * 1;
    shadow(ctx, x, fy, 12);

    const CAR = '#cd8a45', CAR_SH = '#a96d2b', CAR_HI = '#e0a85f', CREAM = '#f0d3a4', NOSE = '#3a2418';

    // rabo abanando
    const tw = Math.sin(t * 9) * 6;
    rr(ctx, x + 8, fy - 15 + bob, 4, 9, 2, CAR);
    rr(ctx, x + 9 + tw * 0.5, fy - 20 + bob, 4, 8, 2, CAR_HI);

    // corpo
    rr(ctx, x - 9, fy - 15 + bob, 18, 15, 7, CAR);
    r(ctx, x - 9, fy - 12 + bob, 4, 12, CAR_SH);
    r(ctx, x - 9, fy - 15 + bob, 14, 2, CAR_HI);
    // peitinho creme
    ctx.fillStyle = CREAM;
    ctx.beginPath();
    ctx.moveTo(x - 4, fy - 14 + bob);
    ctx.quadraticCurveTo(x, fy - 1 + bob, x + 4, fy - 14 + bob);
    ctx.lineTo(x + 4, fy + bob); ctx.lineTo(x - 4, fy + bob); ctx.closePath(); ctx.fill();
    // patas
    rr(ctx, x - 6, fy - 3 + bob, 4, 4, 1.5, CREAM);
    rr(ctx, x + 2, fy - 3 + bob, 4, 4, 1.5, CREAM);

    // cabeça
    rr(ctx, x - 8, fy - 27 + bob, 16, 14, 7, CAR);
    r(ctx, x - 8, fy - 27 + bob, 14, 2, CAR_HI);
    // orelhas caídas (caramelo escuro)
    rr(ctx, x - 11, fy - 26 + bob, 5, 12, 3, CAR_SH);
    rr(ctx, x + 6, fy - 26 + bob, 5, 12, 3, CAR_SH);
    // focinho creme
    rr(ctx, x - 5, fy - 18 + bob, 10, 8, 4, CREAM);
    r(ctx, x - 5, fy - 12 + bob, 10, 1, '#e3c290');

    // olhos
    function dogEye(ox) {
      rr(ctx, ox, fy - 24 + bob, 4, 4.4, 2, '#2a1a12');
      r(ctx, ox + 2.3, fy - 23.4 + bob, 1.2, 1.4, '#fff');
    }
    dogEye(x - 5); dogEye(x + 1);

    // nariz + boca
    rr(ctx, x - 2, fy - 17 + bob, 4, 3, 1.6, NOSE);
    r(ctx, x - 1, fy - 17 + bob, 1, 1, 'rgba(255,255,255,.45)');
    ctx.strokeStyle = NOSE; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, fy - 14 + bob); ctx.lineTo(x, fy - 12 + bob);
    ctx.moveTo(x, fy - 12 + bob); ctx.quadraticCurveTo(x - 3, fy - 11 + bob, x - 3.5, fy - 13 + bob);
    ctx.moveTo(x, fy - 12 + bob); ctx.quadraticCurveTo(x + 3, fy - 11 + bob, x + 3.5, fy - 13 + bob);
    ctx.stroke();
    // linguinha (de vez em quando)
    if (Math.sin(t * 5) > 0.1) rr(ctx, x - 1.5, fy - 11 + bob, 3, 3, 1.2, '#e26a84');
  }

  /* ---------------- TILES ---------------- */
  function rng(x, y) { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); }

  function floor(ctx, X, Y, S, gx, gy) {
    r(ctx, X, Y, S, S, '#1d1726');
    r(ctx, X, Y, S, S * 0.5, '#221a2e');
    ctx.strokeStyle = '#100b18'; ctx.lineWidth = 1;
    ctx.strokeRect(X + 0.5, Y + 0.5, S - 1, S - 1);
    const v = rng(gx, gy);
    if (v > 0.7) r(ctx, X + (v * S) % (S - 6), Y + (rng(gy, gx) * S) % (S - 6), 3, 2, '#2a2236');
    if (v < 0.15) r(ctx, X + 4, Y + S - 6, 5, 2, '#15101e');
  }
  function carpet(ctx, X, Y, S, gx, gy) {
    r(ctx, X, Y, S, S, '#3a0e18');
    r(ctx, X + 2, Y + 2, S - 4, S - 4, '#4a121f');
    ctx.strokeStyle = 'rgba(232,176,75,.25)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X + S / 2, Y + 5); ctx.lineTo(X + S - 5, Y + S / 2);
    ctx.lineTo(X + S / 2, Y + S - 5); ctx.lineTo(X + 5, Y + S / 2); ctx.closePath();
    ctx.stroke();
  }
  function grass(ctx, X, Y, S, gx, gy) {
    r(ctx, X, Y, S, S, '#1b2a18');
    const v = rng(gx, gy);
    r(ctx, X, Y, S, S / 2, '#21331d');
    for (let i = 0; i < 4; i++) {
      const bx = X + ((rng(gx + i, gy) * S) | 0);
      const by = Y + ((rng(gx, gy + i) * S) | 0);
      r(ctx, bx, by, 1, 3, '#33502a');
    }
    if (v > 0.85) r(ctx, X + (v * S) % (S - 6), Y + 6, 3, 3, '#6a2440');
  }
  function water(ctx, X, Y, S, gx, gy, t) {
    r(ctx, X, Y, S, S, '#0c2336');
    const sh = Math.sin(t * 2 + gx + gy) * 0.5 + 0.5;
    r(ctx, X, Y + S * 0.2, S, 2, `rgba(120,180,220,${0.12 + sh * 0.18})`);
    r(ctx, X, Y + S * 0.6, S, 2, `rgba(120,180,220,${0.08 + (1 - sh) * 0.16})`);
  }
  function wall(ctx, X, Y, S, gx, gy) {
    r(ctx, X, Y, S, S, '#0c0712');
    r(ctx, X, Y, S, S * 0.5, '#140d20');
    r(ctx, X, Y, S, 3, '#241738');
    ctx.strokeStyle = '#070410'; ctx.lineWidth = 1;
    const off = (gy % 2) * (S / 2);
    ctx.beginPath();
    ctx.moveTo(X, Y + S / 2); ctx.lineTo(X + S, Y + S / 2);
    ctx.moveTo(X + off, Y); ctx.lineTo(X + off, Y + S / 2);
    ctx.moveTo(X + ((off + S / 2) % S), Y + S / 2); ctx.lineTo(X + ((off + S / 2) % S), Y + S);
    ctx.stroke();
  }

  /* ---------------- OBJETOS ---------------- */
  function torch(ctx, X, Y, S, t) {
    const cx = X + S / 2;
    r(ctx, cx - 2, Y + S * 0.45, 4, S * 0.4, '#2a2030');
    r(ctx, cx - 4, Y + S * 0.42, 8, 4, '#3a2d22');
    const f = Math.sin(t * 12) * 2 + Math.sin(t * 7) * 1.5;
    ctx.save();
    ctx.fillStyle = '#e8b04b';
    ctx.beginPath(); ctx.ellipse(cx, Y + S * 0.34 + f * 0.3, 5, 9 + f, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d6531f';
    ctx.beginPath(); ctx.ellipse(cx, Y + S * 0.36 + f * 0.3, 3, 6 + f * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath(); ctx.ellipse(cx, Y + S * 0.4, 1.6, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function candle(ctx, X, Y, S, t) {
    const cx = X + S / 2;
    r(ctx, cx - 3, Y + S * 0.5, 6, S * 0.35, '#d9cdb5');
    r(ctx, cx - 3, Y + S * 0.5, 6, 3, '#b3a890');
    const f = Math.sin(t * 10 + X) * 1.4;
    ctx.fillStyle = '#e8b04b';
    ctx.beginPath(); ctx.ellipse(cx, Y + S * 0.46 + f * 0.2, 2.4, 5 + f, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath(); ctx.ellipse(cx, Y + S * 0.49, 1, 2.4, 0, 0, Math.PI * 2); ctx.fill();
  }
  function bookshelf(ctx, X, Y, S) {
    r(ctx, X, Y, S, S, '#1c130c');
    r(ctx, X + 2, Y + 2, S - 4, S - 4, '#2a1c12');
    const cols = ['#6a1320', '#3a2a55', '#4a3a18', '#244a2a', '#5a2a40', '#2a3a5a'];
    for (let row = 0; row < 2; row++) {
      let bx = X + 4;
      const by = Y + 5 + row * (S / 2 - 3);
      while (bx < X + S - 6) {
        const w = 3 + ((Math.sin(bx * 7 + row) * 2 + 2) | 0);
        r(ctx, bx, by, w, S / 2 - 7, cols[(bx + row) % cols.length]);
        bx += w + 1;
      }
      r(ctx, X + 2, by + S / 2 - 6, S - 4, 2, '#160d08');
    }
  }
  function pedestal(ctx, X, Y, S, t) {
    const cx = X + S / 2;
    r(ctx, cx - 9, Y + S - 10, 18, 8, '#2a2233');
    r(ctx, cx - 6, Y + 10, 12, S - 18, '#352a44');
    r(ctx, cx - 10, Y + 4, 20, 8, '#3d3050');
    const g = Math.sin(t * 3) * 0.3 + 0.7;
    ctx.save(); ctx.globalAlpha = g;
    ctx.fillStyle = '#e8b04b';
    ctx.beginPath(); ctx.arc(cx, Y + 2, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function sealedDoor(ctx, X, Y, S, open, t) {
    const w = S * 2, h = S * 2;
    if (open) {
      r(ctx, X, Y, w, h, '#05030a');
      const g = ctx.createRadialGradient(X + w / 2, Y + h / 2, 4, X + w / 2, Y + h / 2, w * 0.7);
      const pulse = Math.sin(t * 2) * 0.2 + 0.8;
      g.addColorStop(0, `rgba(232,176,75,${0.5 * pulse})`);
      g.addColorStop(1, 'rgba(232,176,75,0)');
      ctx.fillStyle = g; ctx.fillRect(X, Y, w, h);
      return;
    }
    r(ctx, X - 4, Y - 6, w + 8, h + 6, '#1a1326');
    ctx.fillStyle = '#241738';
    ctx.beginPath();
    ctx.moveTo(X, Y + 14);
    ctx.quadraticCurveTo(X + w / 2, Y - 14, X + w, Y + 14);
    ctx.lineTo(X + w, Y + 14); ctx.lineTo(X, Y + 14); ctx.fill();
    r(ctx, X + 4, Y + 10, w / 2 - 6, h - 12, '#3a281a');
    r(ctx, X + w / 2 + 2, Y + 10, w / 2 - 6, h - 12, '#33230f');
    r(ctx, X + w / 2 - 1, Y + 10, 2, h - 12, '#160d08');
    r(ctx, X + 8, Y + 18, w - 16, 3, '#15100a');
    r(ctx, X + 8, Y + h - 14, w - 16, 3, '#15100a');
    const cx = X + w / 2, cy = Y + h / 2;
    const glow = Math.sin(t * 3) * 0.3 + 0.7;
    ctx.save(); ctx.strokeStyle = `rgba(232,176,75,${glow})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    r(ctx, cx - 3, cy - 2, 6, 8, '#e8b04b');
    r(ctx, cx - 1, cy, 2, 3, '#2a1b06');
  }
  function note(ctx, cx, cy, t, collected) {
    if (collected) return;
    const bob = Math.sin(t * 2.5) * 3;
    const y = cy + bob;
    ctx.save();
    const g = ctx.createRadialGradient(cx, y, 2, cx, y, 22);
    g.addColorStop(0, 'rgba(232,176,75,.5)');
    g.addColorStop(1, 'rgba(232,176,75,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, y, 22, 0, Math.PI * 2); ctx.fill();
    ctx.translate(cx, y);
    ctx.rotate(Math.sin(t) * 0.06);
    r(ctx, -8, -10, 16, 20, '#e9dcc0');
    r(ctx, -8, -10, 16, 3, '#cdbf9e');
    ctx.fillStyle = '#7a0f1f';
    ctx.font = 'bold 12px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('?', 0, 1);
    r(ctx, -5, 3, 10, 1, '#9a8f74');
    r(ctx, -5, 6, 8, 1, '#9a8f74');
    ctx.restore();
  }
  function heart(ctx, cx, cy, t, s) {
    s = s || 7;
    const bob = Math.sin(t * 3) * 2;
    ctx.save(); ctx.translate(cx, cy + bob);
    const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, s * 2.2);
    glow.addColorStop(0, 'rgba(179,18,43,.5)'); glow.addColorStop(1, 'rgba(179,18,43,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, s * 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#b3122b';
    ctx.beginPath();
    ctx.moveTo(0, s * 0.8);
    ctx.bezierCurveTo(s, -s * 0.4, s * 0.4, -s, 0, -s * 0.3);
    ctx.bezierCurveTo(-s * 0.4, -s, -s, -s * 0.4, 0, s * 0.8);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.45)';
    ctx.beginPath(); ctx.ellipse(-s * 0.3, -s * 0.3, s * 0.2, s * 0.3, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  return { drawDaniela, drawCat, drawDog, floor, carpet, grass, water, wall,
           torch, candle, bookshelf, pedestal, sealedDoor, note, heart };
})();
