// CONFIGURAÇÃO: Data alvo
const now = new Date();
const randomDays = Math.floor(Math.random() * 3) + 2;
const targetDate = new Date(now.getTime() + (randomDays * 24 * 60 * 60 * 1000));

// Elementos DOM
const els = {
    d: document.getElementById('days'),
    h: document.getElementById('hours'),
    m: document.getElementById('minutes'),
    s: document.getElementById('seconds'),
    bg: document.getElementById('terminal-bg'),
    msg: document.getElementById('typewriter'),
    title: document.querySelector('h1')
};

// Logs normais e Dicas escondidas
const standardLogs = [
    "CONNECTING TO HOST...",
    "ENCRYPTING CONNECTION...",
    "BYPASSING SECURITY LAYER 1...",
    "SEARCHING FOR 'DANIELA'...",
    "ACCESS TOKEN: VALID",
    "DECODING MEMORY FRAGMENTS...",
    "UPLOAD PERCENTAGE: 34%",
    "WARNING: UNSTABLE CONNECTION",
    "PROXY: 192.168.X.X",
    "DOWNLOADING ASSETS..."
];

// Logs que contém partes do enigma (aparecem no fundo)
const secretLogs = [
    "FILE FOUND: riacho_grande_history.txt",
    "GPS DATA CORRUPTED: R...I...A...C...H...O",
    "SEEK_THE_WATER.exe RUNNING",
    "DECRYPTING LOCATION: OLD_STORY",
    "TARGET: RIACHO_GRANDE",
    "SUBJECT: DANIELA // STATUS: SEARCHING"
];

// Mensagens que aparecem na caixa principal (Enigma)
const mainMessages = [
    "SYSTEM STATUS: UNSTABLE",
    "HINT_DECRYPTED: ONDE AS ÁGUAS CONTAM HISTÓRIAS...",
    "SEARCHING DATABASE: RIACHO GRANDE...",
    "ERROR: MISSING STORY FRAGMENT",
    "NEXT_TARGET: [REDACTED]",
    "DANIELA: ACCESS GRANTED"
];

// Atualizador do Timer
function updateTimer() {
    const current = new Date();
    const diff = targetDate - current;

    if (diff <= 0) {
        els.d.innerText = "00";
        els.title.innerText = "SYSTEM UNLOCKED";
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    updateSegment(els.d, days);
    updateSegment(els.h, hours);
    updateSegment(els.m, minutes);
    updateSegment(els.s, seconds);
}

function updateSegment(element, value) {
    const formatted = value < 10 ? '0' + value : value;
    if (Math.random() < 0.03) { // Glitch nos números
        element.innerText = "??";
        setTimeout(() => element.innerText = formatted, 100);
    } else {
        element.innerText = formatted;
    }
}

// Gerador de fundo (Matrix style)
function generateBackgroundNoise() {
    const logLine = document.createElement('div');
    let text = "";

    // 20% de chance de mostrar uma dica do enigma no fundo
    if (Math.random() < 0.2) {
        text = `> ${secretLogs[Math.floor(Math.random() * secretLogs.length)]}`;
        logLine.style.color = "var(--pink)"; // Dicas em rosa
        logLine.style.fontWeight = "bold";
    } else {
        text = `> ${standardLogs[Math.floor(Math.random() * standardLogs.length)]}`;
        if (Math.random() > 0.8) logLine.style.color = "rgba(0, 255, 0, 0.4)";
    }

    logLine.innerText = text;
    logLine.style.opacity = Math.random() * 0.7;
    els.bg.appendChild(logLine);

    if (els.bg.childElementCount > 15) {
        els.bg.removeChild(els.bg.firstChild);
    }
}

// Mensagens principais (A dica clara)
let msgIndex = 0;
function cycleMessages() {
    // A cada 4 segundos, muda a mensagem principal
    const text = mainMessages[msgIndex];
    els.msg.innerHTML = ""; // Limpa

    let i = 0;
    const typeWriter = setInterval(() => {
        if (i < text.length) {
            els.msg.innerHTML += text.charAt(i);
            i++;
        } else {
            clearInterval(typeWriter);
        }
    }, 50);

    // Destaca se for a dica do Riacho
    if (text.includes("RIACHO")) {
        els.msg.className = "message-box hint-highlight";
    } else {
        els.msg.className = "message-box";
    }

    msgIndex = (msgIndex + 1) % mainMessages.length;
}

function triggerGlitch() {
    if (Math.random() < 0.05) {
        document.body.style.textShadow = "2px 0 var(--pink), -2px 0 yellow";
        setTimeout(() => document.body.style.textShadow = "none", 100);
    }
}

// Loops
setInterval(updateTimer, 1000);
setInterval(generateBackgroundNoise, 150);
setInterval(triggerGlitch, 2000);
setInterval(cycleMessages, 4000); // Muda a mensagem a cada 4s

// Init
updateTimer();
cycleMessages();
