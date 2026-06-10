/* ============================================================
   AUDIO — tudo sintetizado via Web Audio API (sem arquivos)
   Ambiente gótico + efeitos sonoros do jogo.
   ============================================================ */
const Audio7 = (() => {
  let ctx = null;
  let master = null;
  let ambientGain = null;
  let muted = false;
  let started = false;
  const ambientNodes = [];

  function ensure() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.0;
    master.connect(ctx.destination);
    // sobe o volume suave
    master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 1.5);
  }

  function resume() {
    ensure();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  // ---- ambiente: drone grave + sino distante ocasional ----
  function startAmbient() {
    ensure();
    if (!ctx || started) return;
    started = true;
    ambientGain = ctx.createGain();
    ambientGain.gain.value = 0.0;
    ambientGain.gain.linearRampToValueAtTime(0.32, ctx.currentTime + 4);
    ambientGain.connect(master);

    // dois osciladores graves em quinta (atmosfera densa)
    const freqs = [55, 82.4]; // A1 e ~E2
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 0.16 : 0.10;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 260;
      // LFO lento na frequência do filtro -> "respira"
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.03;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 80;
      lfo.connect(lfoG).connect(lp.frequency);
      o.connect(g).connect(lp).connect(ambientGain);
      o.start(); lfo.start();
      ambientNodes.push(o, lfo);
    });

    // vento/“sussurro” via ruído filtrado
    const noise = makeNoiseBuffer(2.5);
    const src = ctx.createBufferSource();
    src.buffer = noise; src.loop = true;
    const ng = ctx.createGain(); ng.gain.value = 0.05;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 480; bp.Q.value = 0.6;
    const nlfo = ctx.createOscillator(); nlfo.frequency.value = 0.08;
    const nlfoG = ctx.createGain(); nlfoG.gain.value = 0.035;
    nlfo.connect(nlfoG).connect(ng.gain);
    src.connect(bp).connect(ng).connect(ambientGain);
    src.start(); nlfo.start();
    ambientNodes.push(src, nlfo);

    scheduleBell();
  }

  function scheduleBell() {
    if (!ctx) return;
    const delay = 14000 + Math.random() * 16000;
    setTimeout(() => {
      if (started) { bell(); scheduleBell(); }
    }, delay);
  }

  function makeNoiseBuffer(seconds) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  // ---- helper genérico de tom ----
  function tone(freq, dur, type = 'sine', vol = 0.3, when = 0, glideTo = null) {
    ensure(); if (!ctx) return;
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + dur + 0.03);
  }

  function bell() {
    // sino grave com harmônicos
    tone(146.8, 3.2, 'sine', 0.18);
    tone(220, 3.0, 'sine', 0.10);
    tone(293.7, 2.6, 'sine', 0.06);
  }

  // ---- efeitos do jogo ----
  const sfx = {
    step() { tone(90 + Math.random()*30, 0.08, 'square', 0.05); },
    pickup() { tone(660, 0.12, 'triangle', 0.25); tone(990, 0.18, 'triangle', 0.22, 0.06); tone(1320, 0.2, 'sine', 0.16, 0.12); },
    page() { tone(520, 0.09, 'square', 0.12); tone(380, 0.12, 'square', 0.08, 0.05); },
    error() { tone(160, 0.18, 'sawtooth', 0.22); tone(120, 0.25, 'sawtooth', 0.2, 0.05); },
    key() { tone(740, 0.05, 'square', 0.14); },
    open() { tone(180, 0.5, 'sawtooth', 0.18, 0, 90); tone(300, 0.6, 'triangle', 0.12, 0.1); },
    success() {
      const seq = [523.25, 659.25, 783.99, 1046.5];
      seq.forEach((f, i) => tone(f, 0.4, 'triangle', 0.26, i * 0.13));
    },
    meow() { tone(620, 0.18, 'sawtooth', 0.16, 0, 880); tone(760, 0.22, 'sawtooth', 0.12, 0.12, 520); },
    bark() { tone(220, 0.10, 'square', 0.22, 0, 130); tone(200, 0.12, 'square', 0.18, 0.16, 120); },
    heart() { tone(880, 0.1, 'sine', 0.2); tone(660, 0.16, 'sine', 0.16, 0.07); },
    chime() { [784, 988, 1175, 1568].forEach((f,i)=>tone(f,0.5,'sine',0.18,i*0.1)); }
  };

  function toggleMute() {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 0.9;
    return muted;
  }
  function isMuted() { return muted; }

  return { resume, startAmbient, sfx, toggleMute, isMuted };
})();
