// ========== CANVAS SETUP ==========
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 1200, H = 750;
canvas.width = W; canvas.height = H;

// ========== SOUND SYSTEM ==========
let audioCtx = null;
let masterGain = null;
let sfxMuted = false;
let sfxVolume = 0.4;

function ensureAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = sfxVolume;
        masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

let sfxThrottle = {};
function playSfx(type) {
    if (sfxMuted || !audioCtx) return;
    const pn = performance.now();
    if (sfxThrottle[type] && pn - sfxThrottle[type] < 50) return;
    sfxThrottle[type] = pn;
    try {
        const now = audioCtx.currentTime;
        switch (type) {
            case 'shoot_player': {
                const osc1 = audioCtx.createOscillator();
                const osc2 = audioCtx.createOscillator();
                const g1 = audioCtx.createGain();
                const g2 = audioCtx.createGain();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(1800, now);
                osc1.frequency.exponentialRampToValueAtTime(400, now + 0.06);
                g1.gain.setValueAtTime(0.13, now);
                g1.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
                osc1.connect(g1); g1.connect(masterGain);
                osc1.start(now); osc1.stop(now + 0.06);
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(3600, now);
                osc2.frequency.exponentialRampToValueAtTime(800, now + 0.04);
                g2.gain.setValueAtTime(0.06, now);
                g2.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                osc2.connect(g2); g2.connect(masterGain);
                osc2.start(now); osc2.stop(now + 0.04);
                const nb = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.03, audioCtx.sampleRate);
                const nd = nb.getChannelData(0);
                for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nd.length, 4);
                const ns = audioCtx.createBufferSource();
                const ng = audioCtx.createGain();
                const nf = audioCtx.createBiquadFilter();
                ns.buffer = nb;
                nf.type = 'highpass'; nf.frequency.value = 3000;
                ng.gain.setValueAtTime(0.1, now);
                ng.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
                ns.connect(nf); nf.connect(ng); ng.connect(masterGain);
                ns.start(now);
                break;
            }
            case 'shoot_tank': {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
                g.gain.setValueAtTime(0.2, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.connect(g); g.connect(masterGain);
                osc.start(now); osc.stop(now + 0.15);
                const nb2 = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.08, audioCtx.sampleRate);
                const nd2 = nb2.getChannelData(0);
                for (let i = 0; i < nd2.length; i++) nd2[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nd2.length, 2);
                const ns2 = audioCtx.createBufferSource();
                const ng2 = audioCtx.createGain();
                const nf2 = audioCtx.createBiquadFilter();
                ns2.buffer = nb2;
                nf2.type = 'lowpass';
                nf2.frequency.setValueAtTime(1500, now);
                nf2.frequency.exponentialRampToValueAtTime(200, now + 0.08);
                ng2.gain.setValueAtTime(0.25, now);
                ng2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                ns2.connect(nf2); nf2.connect(ng2); ng2.connect(masterGain);
                ns2.start(now);
                const click = audioCtx.createOscillator();
                const cg = audioCtx.createGain();
                click.type = 'square';
                click.frequency.setValueAtTime(800, now);
                click.frequency.exponentialRampToValueAtTime(100, now + 0.02);
                cg.gain.setValueAtTime(0.1, now);
                cg.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
                click.connect(cg); cg.connect(masterGain);
                click.start(now); click.stop(now + 0.02);
                break;
            }
            case 'shoot_enemy': {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
                g.gain.setValueAtTime(0.05, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.connect(g); g.connect(masterGain);
                osc.start(now); osc.stop(now + 0.05);
                const nb3 = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.02, audioCtx.sampleRate);
                const nd3 = nb3.getChannelData(0);
                for (let i = 0; i < nd3.length; i++) nd3[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nd3.length, 3);
                const ns3 = audioCtx.createBufferSource();
                const ng3 = audioCtx.createGain();
                ns3.buffer = nb3;
                ng3.gain.setValueAtTime(0.04, now);
                ng3.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
                ns3.connect(ng3); ng3.connect(masterGain);
                ns3.start(now);
                break;
            }
            case 'hit': {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);
                g.gain.setValueAtTime(0.08, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.connect(g); g.connect(masterGain);
                osc.start(now); osc.stop(now + 0.05);
                break;
            }
            case 'explosion_small': {
                const bufSize = audioCtx.sampleRate * 0.15;
                const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
                const data = buf.getChannelData(0);
                for (let i = 0; i < bufSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 3);
                }
                const src = audioCtx.createBufferSource();
                const g = audioCtx.createGain();
                const filt = audioCtx.createBiquadFilter();
                src.buffer = buf;
                filt.type = 'lowpass';
                filt.frequency.setValueAtTime(2000, now);
                filt.frequency.exponentialRampToValueAtTime(200, now + 0.15);
                g.gain.setValueAtTime(0.2, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                src.connect(filt); filt.connect(g); g.connect(masterGain);
                src.start(now);
                break;
            }
            case 'explosion_big': {
                const bufSize = audioCtx.sampleRate * 0.4;
                const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
                const data = buf.getChannelData(0);
                for (let i = 0; i < bufSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 2);
                }
                const src = audioCtx.createBufferSource();
                const g = audioCtx.createGain();
                const filt = audioCtx.createBiquadFilter();
                src.buffer = buf;
                filt.type = 'lowpass';
                filt.frequency.setValueAtTime(3000, now);
                filt.frequency.exponentialRampToValueAtTime(80, now + 0.4);
                g.gain.setValueAtTime(0.35, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                src.connect(filt); filt.connect(g); g.connect(masterGain);
                src.start(now);
                break;
            }
            case 'explosion_boss': {
                const bufSize = audioCtx.sampleRate * 0.8;
                const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
                const data = buf.getChannelData(0);
                for (let i = 0; i < bufSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 1.5);
                }
                const src = audioCtx.createBufferSource();
                const g = audioCtx.createGain();
                const filt = audioCtx.createBiquadFilter();
                src.buffer = buf;
                filt.type = 'lowpass';
                filt.frequency.setValueAtTime(4000, now);
                filt.frequency.exponentialRampToValueAtTime(50, now + 0.8);
                g.gain.setValueAtTime(0.5, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
                src.connect(filt); filt.connect(g); g.connect(masterGain);
                src.start(now);
                const osc = audioCtx.createOscillator();
                const g2 = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(60, now);
                osc.frequency.exponentialRampToValueAtTime(20, now + 0.6);
                g2.gain.setValueAtTime(0.3, now);
                g2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
                osc.connect(g2); g2.connect(masterGain);
                osc.start(now); osc.stop(now + 0.6);
                break;
            }
            case 'pickup': {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
                osc.frequency.exponentialRampToValueAtTime(1600, now + 0.15);
                g.gain.setValueAtTime(0.15, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                osc.connect(g); g.connect(masterGain);
                osc.start(now); osc.stop(now + 0.18);
                break;
            }
            case 'player_hit': {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
                g.gain.setValueAtTime(0.15, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.connect(g); g.connect(masterGain);
                osc.start(now); osc.stop(now + 0.15);
                break;
            }
            case 'player_death': {
                const bufSize = audioCtx.sampleRate * 0.5;
                const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
                const data = buf.getChannelData(0);
                for (let i = 0; i < bufSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 2);
                }
                const src = audioCtx.createBufferSource();
                const g = audioCtx.createGain();
                const filt = audioCtx.createBiquadFilter();
                src.buffer = buf;
                filt.type = 'lowpass';
                filt.frequency.setValueAtTime(2000, now);
                filt.frequency.exponentialRampToValueAtTime(100, now + 0.5);
                g.gain.setValueAtTime(0.3, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                src.connect(filt); filt.connect(g); g.connect(masterGain);
                src.start(now);
                const osc = audioCtx.createOscillator();
                const g2 = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
                g2.gain.setValueAtTime(0.2, now);
                g2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                osc.connect(g2); g2.connect(masterGain);
                osc.start(now); osc.stop(now + 0.4);
                break;
            }
            case 'ult': {
                for (let i = 0; i < 3; i++) {
                    const osc = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    osc.type = 'sine';
                    const t = now + i * 0.05;
                    osc.frequency.setValueAtTime(400 + i * 200, t);
                    osc.frequency.exponentialRampToValueAtTime(800 + i * 300, t + 0.15);
                    g.gain.setValueAtTime(0.12, t);
                    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
                    osc.connect(g); g.connect(masterGain);
                    osc.start(t); osc.stop(t + 0.2);
                }
                const bufSize = audioCtx.sampleRate * 0.3;
                const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
                const data = buf.getChannelData(0);
                for (let i = 0; i < bufSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 3) * 0.5;
                }
                const src = audioCtx.createBufferSource();
                const g = audioCtx.createGain();
                src.buffer = buf;
                g.gain.setValueAtTime(0.2, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                src.connect(g); g.connect(masterGain);
                src.start(now);
                break;
            }
            case 'boss_warn': {
                for (let i = 0; i < 4; i++) {
                    const osc = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    osc.type = 'square';
                    const t = now + i * 0.15;
                    osc.frequency.setValueAtTime(220, t);
                    osc.frequency.setValueAtTime(330, t + 0.07);
                    g.gain.setValueAtTime(0.15, t);
                    g.gain.setValueAtTime(0, t + 0.07);
                    g.gain.setValueAtTime(0.15, t + 0.15);
                    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
                    osc.connect(g); g.connect(masterGain);
                    osc.start(t); osc.stop(t + 0.14);
                }
                break;
            }
            case 'respawn': {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(900, now + 0.2);
                g.gain.setValueAtTime(0.12, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                osc.connect(g); g.connect(masterGain);
                osc.start(now); osc.stop(now + 0.25);
                break;
            }
            case 'shield': {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1400, now + 0.1);
                osc.frequency.exponentialRampToValueAtTime(1000, now + 0.2);
                g.gain.setValueAtTime(0.1, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                osc.connect(g); g.connect(masterGain);
                osc.start(now); osc.stop(now + 0.25);
                break;
            }
            case 'ui_click': {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1000, now);
                g.gain.setValueAtTime(0.08, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.connect(g); g.connect(masterGain);
                osc.start(now); osc.stop(now + 0.05);
                break;
            }
            case 'level_up': {
                for (let i = 0; i < 3; i++) {
                    const osc = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    osc.type = 'sine';
                    const t = now + i * 0.12;
                    osc.frequency.setValueAtTime(523, t);
                    osc.frequency.setValueAtTime(659, t + 0.06);
                    osc.frequency.setValueAtTime(784, t + 0.12);
                    g.gain.setValueAtTime(0.15, t);
                    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
                    osc.connect(g); g.connect(masterGain);
                    osc.start(t); osc.stop(t + 0.18);
                }
                break;
            }
        }
    } catch (e) { /* ignore audio errors */ }
}

// ========== GAME STATE ==========
let gameState = 'menu';
let gameMode = 1; // 1 or 2 players
let score = 0;
let gameTime = 0;
let gameOver = false;
let paused = false;
let levelComplete = false;
let currentLevel = 1;
let animFrameId = null;
let lastTime = 0;
let shakeAmount = 0;
let comboCount = 0;
let comboTimer = 0;
let screenFlash = 0;
const MAX_RESPAWNS = 3;

// ========== SCROLLING BACKGROUND ==========
const BG_STAR_LAYERS = 3;
let bgStars = [];
let bgSpeedLines = [];
let scrollSpeed = 0;
function initScrollingBg() {
    bgStars = [];
    for (let layer = 0; layer < BG_STAR_LAYERS; layer++) {
        const count = 40 + layer * 20;
        const depth = layer / BG_STAR_LAYERS;
        for (let i = 0; i < count; i++) {
            bgStars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                size: 1 + depth * 2.5,
                speed: 40 + depth * 120,
                alpha: 0.3 + depth * 0.7,
                layer: layer,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.5 + Math.random() * 1.5
            });
        }
    }
    bgSpeedLines = [];
    for (let i = 0; i < 30; i++) {
        bgSpeedLines.push({
            x: Math.random() * W,
            y: Math.random() * H,
            length: 20 + Math.random() * 60,
            speed: 200 + Math.random() * 400,
            alpha: 0.04 + Math.random() * 0.08,
            width: 1 + Math.random() * 2
        });
    }
}
// Call init after canvas is set up
initScrollingBg();

const ENEMY_TYPES = {
    SCOUT: 0,
    TANK_LIGHT: 1,
    TANK_HEAVY: 2,
    FIGHTER: 3,
    BOMBER: 4,
    HELICOPTER: 5,
    ARTILLERY: 6,
    MINIBOSS: 7,
    BOSS: 8,
    // Level 2 enemy types
    ELITE_SCOUT: 9,
    ELITE_TANK: 10,
    STEALTH_FIGHTER: 11,
    LASER_TURRET: 12,
    NUKE_BOMBER: 13,
    WARLOCK: 14,
    MINIBOSS2: 15,
    BOSS2: 16
};

const PICKUP_TYPES = {
    HEALTH: 0,
    POWER: 1,
    SPREAD: 2,
    SPEED: 3,
    ULT: 4,
    SHIELD: 5
};

// ========== LEVEL 1 WAVE CONFIG ==========
const WAVE_CONFIG_L1 = [
    // Phase 1: Introduction (0-30s)
    { time: 0, enemies: [{ type: ENEMY_TYPES.SCOUT, count: 2 }] },
    { time: 6, enemies: [{ type: ENEMY_TYPES.SCOUT, count: 2 }, { type: ENEMY_TYPES.TANK_LIGHT, count: 1 }] },
    { time: 14, enemies: [{ type: ENEMY_TYPES.TANK_LIGHT, count: 2 }, { type: ENEMY_TYPES.FIGHTER, count: 1 }] },
    { time: 22, enemies: [{ type: ENEMY_TYPES.SCOUT, count: 3 }, { type: ENEMY_TYPES.TANK_LIGHT, count: 1 }] },
    // Phase 2: Escalation (30-70s)
    { time: 30, enemies: [{ type: ENEMY_TYPES.TANK_HEAVY, count: 1 }, { type: ENEMY_TYPES.FIGHTER, count: 1 }] },
    { time: 40, enemies: [{ type: ENEMY_TYPES.HELICOPTER, count: 1 }, { type: ENEMY_TYPES.SCOUT, count: 2 }] },
    { time: 50, enemies: [{ type: ENEMY_TYPES.BOMBER, count: 1 }, { type: ENEMY_TYPES.TANK_LIGHT, count: 2 }] },
    { time: 58, enemies: [{ type: ENEMY_TYPES.ARTILLERY, count: 1 }, { type: ENEMY_TYPES.FIGHTER, count: 2 }] },
    { time: 66, enemies: [{ type: ENEMY_TYPES.TANK_HEAVY, count: 2 }, { type: ENEMY_TYPES.BOMBER, count: 1 }] },
    // Phase 3: Intense (70-110s)
    { time: 72, enemies: [{ type: ENEMY_TYPES.HELICOPTER, count: 2 }, { type: ENEMY_TYPES.ARTILLERY, count: 1 }] },
    { time: 80, enemies: [{ type: ENEMY_TYPES.FIGHTER, count: 2 }, { type: ENEMY_TYPES.TANK_HEAVY, count: 2 }] },
    { time: 88, enemies: [{ type: ENEMY_TYPES.BOMBER, count: 2 }, { type: ENEMY_TYPES.ARTILLERY, count: 1 }] },
    { time: 96, enemies: [{ type: ENEMY_TYPES.SCOUT, count: 4 }, { type: ENEMY_TYPES.TANK_LIGHT, count: 2 }] },
    // Phase 4: Miniboss approach (110-140s)
    { time: 105, enemies: [{ type: ENEMY_TYPES.HELICOPTER, count: 2 }, { type: ENEMY_TYPES.BOMBER, count: 1 }] },
    { time: 112, enemies: [{ type: ENEMY_TYPES.TANK_HEAVY, count: 2 }, { type: ENEMY_TYPES.FIGHTER, count: 2 }] },
    { time: 120, enemies: [{ type: ENEMY_TYPES.ARTILLERY, count: 2 }, { type: ENEMY_TYPES.HELICOPTER, count: 1 }] },
    { time: 128, enemies: [{ type: ENEMY_TYPES.MINIBOSS, count: 1 }] },
    // Phase 5: After miniboss (130-155s)
    { time: 135, enemies: [{ type: ENEMY_TYPES.FIGHTER, count: 3 }, { type: ENEMY_TYPES.TANK_LIGHT, count: 2 }] },
    { time: 143, enemies: [{ type: ENEMY_TYPES.BOMBER, count: 2 }, { type: ENEMY_TYPES.HELICOPTER, count: 1 }] },
    // Phase 6: Final boss (150-180s)
    { time: 150, enemies: [{ type: ENEMY_TYPES.TANK_HEAVY, count: 2 }, { type: ENEMY_TYPES.ARTILLERY, count: 1 }] },
    { time: 158, enemies: [{ type: ENEMY_TYPES.BOSS, count: 1 }] },
];

// ========== LEVEL 2 WAVE CONFIG (Harder) ==========
const WAVE_CONFIG_L2 = [
    // Phase 1: Hard intro (0-25s)
    { time: 0, enemies: [{ type: ENEMY_TYPES.ELITE_SCOUT, count: 2 }, { type: ENEMY_TYPES.TANK_LIGHT, count: 1 }] },
    { time: 5, enemies: [{ type: ENEMY_TYPES.ELITE_SCOUT, count: 2 }, { type: ENEMY_TYPES.ELITE_TANK, count: 1 }] },
    { time: 12, enemies: [{ type: ENEMY_TYPES.STEALTH_FIGHTER, count: 1 }, { type: ENEMY_TYPES.TANK_HEAVY, count: 1 }] },
    { time: 20, enemies: [{ type: ENEMY_TYPES.ELITE_SCOUT, count: 3 }, { type: ENEMY_TYPES.ELITE_TANK, count: 1 }] },
    // Phase 2: Escalation (25-60s)
    { time: 26, enemies: [{ type: ENEMY_TYPES.LASER_TURRET, count: 1 }, { type: ENEMY_TYPES.FIGHTER, count: 2 }] },
    { time: 34, enemies: [{ type: ENEMY_TYPES.NUKE_BOMBER, count: 1 }, { type: ENEMY_TYPES.ELITE_SCOUT, count: 2 }] },
    { time: 42, enemies: [{ type: ENEMY_TYPES.ELITE_TANK, count: 2 }, { type: ENEMY_TYPES.STEALTH_FIGHTER, count: 1 }] },
    { time: 50, enemies: [{ type: ENEMY_TYPES.LASER_TURRET, count: 1 }, { type: ENEMY_TYPES.HELICOPTER, count: 2 }] },
    { time: 56, enemies: [{ type: ENEMY_TYPES.NUKE_BOMBER, count: 1 }, { type: ENEMY_TYPES.ELITE_TANK, count: 2 }] },
    // Phase 3: Intense (60-95s)
    { time: 62, enemies: [{ type: ENEMY_TYPES.STEALTH_FIGHTER, count: 2 }, { type: ENEMY_TYPES.LASER_TURRET, count: 1 }] },
    { time: 70, enemies: [{ type: ENEMY_TYPES.WARLOCK, count: 1 }, { type: ENEMY_TYPES.ELITE_SCOUT, count: 2 }] },
    { time: 78, enemies: [{ type: ENEMY_TYPES.NUKE_BOMBER, count: 2 }, { type: ENEMY_TYPES.ELITE_TANK, count: 1 }] },
    { time: 86, enemies: [{ type: ENEMY_TYPES.LASER_TURRET, count: 2 }, { type: ENEMY_TYPES.STEALTH_FIGHTER, count: 1 }] },
    // Phase 4: Miniboss2 approach (95-120s)
    { time: 95, enemies: [{ type: ENEMY_TYPES.WARLOCK, count: 1 }, { type: ENEMY_TYPES.NUKE_BOMBER, count: 1 }] },
    { time: 102, enemies: [{ type: ENEMY_TYPES.ELITE_TANK, count: 2 }, { type: ENEMY_TYPES.STEALTH_FIGHTER, count: 2 }] },
    { time: 110, enemies: [{ type: ENEMY_TYPES.LASER_TURRET, count: 2 }, { type: ENEMY_TYPES.WARLOCK, count: 1 }] },
    { time: 118, enemies: [{ type: ENEMY_TYPES.MINIBOSS2, count: 1 }] },
    // Phase 5: After miniboss (120-140s)
    { time: 124, enemies: [{ type: ENEMY_TYPES.STEALTH_FIGHTER, count: 3 }, { type: ENEMY_TYPES.ELITE_TANK, count: 2 }] },
    { time: 132, enemies: [{ type: ENEMY_TYPES.NUKE_BOMBER, count: 2 }, { type: ENEMY_TYPES.WARLOCK, count: 1 }] },
    // Phase 6: Final boss2 (140-170s)
    { time: 140, enemies: [{ type: ENEMY_TYPES.ELITE_TANK, count: 2 }, { type: ENEMY_TYPES.LASER_TURRET, count: 1 }] },
    { time: 148, enemies: [{ type: ENEMY_TYPES.BOSS2, count: 1 }] },
];

// ========== INPUT SYSTEM ==========
const keys = {};
window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === 'Escape' && gameState === 'playing') {
        if (!paused) { paused = true; document.getElementById('pauseScreen').style.display = 'flex'; }
        else { resumeGame(); }
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});
window.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    if (mx >= W - 110 && mx <= W - 60 && my >= 10 && my <= 50) {
        ensureAudioCtx();
        sfxMuted = !sfxMuted;
        if (masterGain) masterGain.gain.value = sfxMuted ? 0 : sfxVolume;
        if (!sfxMuted) playSfx('ui_click');
    }
});

// ========== UTILITY ==========
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }

function rectCollide(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// ========== PARTICLE SYSTEM ==========
let particles = [];
class Particle {
    constructor(x, y, vx, vy, life, color, size, type = 'circle') {
        this.x = x; this.y = y;
        this.vx = vx; this.vy = vy;
        this.life = life; this.maxLife = life;
        this.color = color; this.size = size;
        this.type = type;
        this.alive = true;
    }
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
    }
    draw(ctx) {
        const alpha = clamp(this.life / this.maxLife, 0, 1);
        const s = this.size * (0.5 + 0.5 * alpha);
        ctx.globalAlpha = alpha;
        if (this.type === 'circle') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, s, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        } else if (this.type === 'spark') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = s;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.vx * 0.3, this.y - this.vy * 0.3);
            ctx.stroke();
        } else if (this.type === 'star') {
            ctx.fillStyle = this.color;
            ctx.font = `${s * 4}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('✦', this.x, this.y);
        }
        ctx.globalAlpha = 1;
    }
}

function spawnExplosion(x, y, count = 30, color1 = '#ff6b35', color2 = '#ffd700') {
    for (let i = 0; i < count; i++) {
        const angle = rand(0, Math.PI * 2);
        const speed = rand(50, 300);
        const life = rand(0.3, 1.0);
        const size = rand(2, 6);
        const color = Math.random() > 0.5 ? color1 : color2;
        const type = Math.random() > 0.7 ? 'spark' : 'circle';
        particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, life, color, size, type));
    }
    shakeAmount = Math.max(shakeAmount, count * 0.3);
}

function spawnTextParticle(x, y, text, color = '#ffd700') {
    const p = new Particle(x, y, 0, -80, 1.2, color, 16, 'circle');
    p.text = text;
    p.isText = true;
    particles.push(p);
}

// ========== BULLET SYSTEM ==========
let bullets = [];
class Bullet {
    constructor(x, y, vx, vy, damage, owner, color = '#00e5ff', size = 4, isHoming = false, ownerId = 1) {
        this.x = x; this.y = y;
        this.vx = vx; this.vy = vy;
        this.damage = damage;
        this.owner = owner;
        this.ownerId = ownerId;
        this.color = color;
        this.size = size;
        this.alive = true;
        this.isHoming = isHoming;
        this.w = size * 2; this.h = size * 2;
        this.trail = [];
    }
    update(dt) {
        if (this.isHoming && this.owner === 'player') {
            let target = null;
            let minDist = 400;
            for (const e of enemies) {
                const d = dist(this, e);
                if (d < minDist) { minDist = d; target = e; }
            }
            if (target) {
                const dx = target.x - this.x;
                const dy = target.y - this.y;
                const a = Math.atan2(dy, dx);
                const speed = Math.hypot(this.vx, this.vy);
                this.vx = lerp(this.vx, Math.cos(a) * speed, 0.05);
                this.vy = lerp(this.vy, Math.sin(a) * speed, 0.05);
            }
        }
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 8) this.trail.shift();
        if (this.x < -50 || this.x > W + 50 || this.y < -50 || this.y > H + 50) this.alive = false;
        this.w = this.size * 2; this.h = this.size * 2;
    }
    draw(ctx) {
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = i / this.trail.length * 0.5;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, this.size * (i / this.trail.length), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// ========== PICKUP SYSTEM ==========
let pickups = [];

class Pickup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.alive = true;
        this.bobPhase = rand(0, Math.PI * 2);
        this.lifetime = 12;
        this.age = 0;
        this.w = 20;
        this.h = 20;
        this.collectable = false;
        this.screenY = y;

        const configs = {
            [PICKUP_TYPES.HEALTH]: { color: '#ff4444', icon: '+', label: '血包', glow: '#ff2222' },
            [PICKUP_TYPES.POWER]:  { color: '#ff8c00', icon: '⚡', label: '火力', glow: '#ff6600' },
            [PICKUP_TYPES.SPREAD]: { color: '#00e5ff', icon: '✧', label: '散射', glow: '#00ccff' },
            [PICKUP_TYPES.SPEED]:  { color: '#44ff44', icon: '»', label: '加速', glow: '#22dd22' },
            [PICKUP_TYPES.ULT]:    { color: '#ffd700', icon: '✦', label: '大招', glow: '#ffaa00' },
            [PICKUP_TYPES.SHIELD]: { color: '#aa88ff', icon: '🛡', label: '护盾', glow: '#8866ff' },
        };
        const c = configs[type];
        this.color = c.color;
        this.icon = c.icon;
        this.label = c.label;
        this.glow = c.glow;
    }

    update(dt) {
        this.bobPhase += dt * 2;
        this.age += dt;
        if (this.age > 0.5) this.collectable = true;
        if (this.age > this.lifetime) {
            this.alive = false;
            return;
        }
        this.screenY = this.y + Math.sin(this.bobPhase) * 6;
    }

    draw(ctx) {
        const alpha = this.age > this.lifetime - 2 ? (this.lifetime - this.age) / 2 : 1;
        const sy = this.screenY;

        ctx.save();
        ctx.globalAlpha = alpha;

        const bobScale = 1 + Math.sin(this.bobPhase * 2) * 0.03;
        const r = 12 * bobScale;

        const grad = ctx.createRadialGradient(this.x, sy, 0, this.x, sy, r * 3);
        grad.addColorStop(0, `${this.glow}44`);
        grad.addColorStop(1, `${this.glow}00`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, sy, r * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = this.glow;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(this.x, sy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.beginPath();
        ctx.arc(this.x, sy, r - 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = this.color;
        ctx.font = `${14 * bobScale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, this.x, sy + 1);

        ctx.fillStyle = `${this.color}aa`;
        ctx.font = '9px Arial';
        ctx.textBaseline = 'top';
        ctx.fillText(this.label, this.x, sy + r + 4);

        if (this.age > this.lifetime - 3 && Math.floor(this.age * 6) % 2 === 0) {
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.x, sy, r, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

function spawnPickup(x, y) {
    const roll = Math.random();
    let type;
    if (roll < 0.30) type = PICKUP_TYPES.HEALTH;
    else if (roll < 0.50) type = PICKUP_TYPES.POWER;
    else if (roll < 0.65) type = PICKUP_TYPES.SPREAD;
    else if (roll < 0.78) type = PICKUP_TYPES.SPEED;
    else if (roll < 0.90) type = PICKUP_TYPES.ULT;
    else type = PICKUP_TYPES.SHIELD;
    pickups.push(new Pickup(x, y, type));
    spawnExplosion(x, y, 6, '#ffffff', '#88bbff');
}

function checkPickupCollisions() {
    const alivePlayers = getAlivePlayers();
    for (const pk of pickups) {
        if (!pk.alive || !pk.collectable) continue;
        for (const p of alivePlayers) {
            if (dist(pk, p) < 30) {
                applyPickup(p, pk);
                pk.alive = false;
                spawnExplosion(pk.x, pk.screenY || pk.y, 10, pk.color, '#ffffff');
                spawnTextParticle(pk.x, (pk.screenY || pk.y) - 20, pk.label, pk.color);
                break;
            }
        }
    }
}

function applyPickup(player, pickup) {
    playSfx('pickup');
    switch (pickup.type) {
        case PICKUP_TYPES.HEALTH:
            player.hp = Math.min(player.maxHp, player.hp + 25);
            break;
        case PICKUP_TYPES.POWER:
            player.bulletDamage += 3;
            player.bulletDamage = Math.min(player.bulletDamage, 25);
            player.shootRate = Math.max(0.15, player.shootRate - 0.02);
            break;
        case PICKUP_TYPES.SPREAD:
            player.spreadLevel = (player.spreadLevel || 0) + 1;
            player.spreadLevel = Math.min(player.spreadLevel, 3);
            break;
        case PICKUP_TYPES.SPEED:
            player.speed += 15;
            player.speed = Math.min(player.speed, 300);
            break;
        case PICKUP_TYPES.ULT:
            player.ultCharge = player.ultMax;
            player.ultReady = true;
            break;
        case PICKUP_TYPES.SHIELD:
            player.shieldTimer = 5;
            break;
    }
}

// ========== ENTITY DRAWING ==========
function drawTank(ctx, x, y, angle, color, size = 1, isPlayer = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const s = size;
    ctx.fillStyle = isPlayer ? '#2a4a7a' : '#4a3a2a';
    ctx.fillRect(-18 * s, -24 * s, 36 * s, 48 * s);
    ctx.strokeStyle = isPlayer ? '#3a6aaa' : '#6a5a3a';
    ctx.lineWidth = 1;
    for (let i = -20 * s; i < 20 * s; i += 5 * s) {
        ctx.beginPath();
        ctx.moveTo(-16 * s, i);
        ctx.lineTo(16 * s, i);
        ctx.stroke();
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-14 * s, -20 * s, 28 * s, 40 * s, 4 * s);
    ctx.fill();
    ctx.fillStyle = isPlayer ? '#3a6aaa' : '#5a4a3a';
    ctx.beginPath();
    ctx.arc(0, 0, 12 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isPlayer ? '#4a8acc' : '#6a5a4a';
    ctx.fillRect(-3 * s, -26 * s, 6 * s, 20 * s);
    ctx.fillRect(-4 * s, -26 * s, 8 * s, 4 * s);

    if (isPlayer) {
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 18 * s, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}

function drawPlane(ctx, x, y, angle, color, size = 1, isPlayer = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const s = size;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(30 * s, 0);
    ctx.lineTo(-20 * s, -10 * s);
    ctx.lineTo(-25 * s, 0);
    ctx.lineTo(-20 * s, 10 * s);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = isPlayer ? '#2a6aaa' : '#5a3a2a';
    ctx.beginPath();
    ctx.moveTo(5 * s, -8 * s);
    ctx.lineTo(-15 * s, -28 * s);
    ctx.lineTo(-20 * s, -24 * s);
    ctx.lineTo(-8 * s, -6 * s);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(5 * s, 8 * s);
    ctx.lineTo(-15 * s, 28 * s);
    ctx.lineTo(-20 * s, 24 * s);
    ctx.lineTo(-8 * s, 6 * s);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = isPlayer ? '#1a4a8a' : '#4a3a2a';
    ctx.beginPath();
    ctx.moveTo(-22 * s, 0);
    ctx.lineTo(-30 * s, -6 * s);
    ctx.lineTo(-30 * s, 6 * s);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#00e5ff';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.ellipse(8 * s, 0, 8 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    const grad = ctx.createRadialGradient(-26 * s, 0, 0, -26 * s, 0, 12 * s);
    grad.addColorStop(0, 'rgba(0, 229, 255, 0.8)');
    grad.addColorStop(0.5, 'rgba(0, 229, 255, 0.2)');
    grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(-26 * s, 0, 12 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// ========== PLAYER SYSTEM ==========
class Player {
    constructor(x, y, controls, id) {
        this.x = x; this.y = y;
        this.w = 36; this.h = 36;
        this.angle = -Math.PI / 2;
        this.speed = 220;
        this.hp = 100; this.maxHp = 100;
        this.controls = controls;
        this.id = id;
        this.shootCooldown = 0;
        this.shootRate = 0.25;
        this.isPlane = id === 1;
        this.alive = true;
        this.ultCharge = 0;
        this.ultMax = 100;
        this.ultReady = false;
        this.bulletDamage = 10;
        this.shieldTimer = 0;
        this.invincibleTimer = 0;
        this.score = 0;
        this.kills = 0;
        this.spreadLevel = 0;
        this.respawnsLeft = MAX_RESPAWNS;
        this.respawnTimer = 0;
    }
    update(dt) {
        if (!this.alive) {
            this.respawnTimer -= dt;
            if (this.respawnTimer <= 0 && this.respawnsLeft > 0) {
                this.respawn();
            }
            return;
        }
        const k = this.controls;
        let dx = 0, dy = 0;
        if (keys[k.up]) dy = -1;
        if (keys[k.down]) dy = 1;
        if (keys[k.left]) dx = -1;
        if (keys[k.right]) dx = 1;

        if (dx !== 0 || dy !== 0) {
            this.angle = Math.atan2(dy, dx);
        }

        const speed = this.speed * dt;
        this.x += dx * speed;
        this.y += dy * speed;
        this.x = clamp(this.x, 30, W - 30);
        this.y = clamp(this.y, 30, H - 30);

        this.shootCooldown -= dt;
        if (keys[k.shoot] && this.shootCooldown <= 0) {
            this.shoot();
            this.shootCooldown = this.shootRate;
        }

        if (keys[k.ult] && this.ultReady) {
            this.useUlt();
        }

        this.shieldTimer -= dt;
        this.invincibleTimer -= dt;
        this.ultCharge = Math.min(this.ultMax, this.ultCharge + dt * 5);
        if (this.ultCharge >= this.ultMax) this.ultReady = true;

        if (this.hp < this.maxHp && !this.ultReady) {
            this.hp = Math.min(this.maxHp, this.hp + dt * 1.5);
        }
    }
    shoot() {
        playSfx(this.isPlane ? 'shoot_player' : 'shoot_tank');
        const spread = 0.08;
        const bx = this.x + Math.cos(this.angle) * 30;
        const by = this.y + Math.sin(this.angle) * 30;
        const pid = this.id;

        const sLevel = Math.min(this.spreadLevel || 0, 3);
        const baseDmg = this.bulletDamage;

        if (this.isPlane) {
            bullets.push(new Bullet(bx, by, Math.cos(this.angle) * 600, Math.sin(this.angle) * 600, baseDmg, 'player', '#00e5ff', 4, false, pid));
            bullets.push(new Bullet(bx, by, Math.cos(this.angle + spread) * 580, Math.sin(this.angle + spread) * 580, baseDmg * 0.8, 'player', '#00bfff', 3, false, pid));
            bullets.push(new Bullet(bx, by, Math.cos(this.angle - spread) * 580, Math.sin(this.angle - spread) * 580, baseDmg * 0.8, 'player', '#00bfff', 3, false, pid));
            if (sLevel >= 1) {
                bullets.push(new Bullet(bx + Math.cos(this.angle + 0.4) * 15, by + Math.sin(this.angle + 0.4) * 15, Math.cos(this.angle + 0.4) * 560, Math.sin(this.angle + 0.4) * 560, baseDmg * 0.6, 'player', '#88ddff', 3, false, pid));
                bullets.push(new Bullet(bx + Math.cos(this.angle - 0.4) * 15, by + Math.sin(this.angle - 0.4) * 15, Math.cos(this.angle - 0.4) * 560, Math.sin(this.angle - 0.4) * 560, baseDmg * 0.6, 'player', '#88ddff', 3, false, pid));
            }
            if (sLevel >= 2) {
                bullets.push(new Bullet(this.x, this.y, Math.cos(this.angle + 0.8) * 540, Math.sin(this.angle + 0.8) * 540, baseDmg * 0.4, 'player', '#55aaff', 3, false, pid));
                bullets.push(new Bullet(this.x, this.y, Math.cos(this.angle - 0.8) * 540, Math.sin(this.angle - 0.8) * 540, baseDmg * 0.4, 'player', '#55aaff', 3, false, pid));
            }
            if (sLevel >= 3) {
                bullets.push(new Bullet(bx + Math.cos(this.angle) * 10, by + Math.sin(this.angle) * 10, Math.cos(this.angle) * 650, Math.sin(this.angle) * 650, baseDmg * 0.8, 'player', '#00ffff', 5, true, pid));
            }
        } else {
            bullets.push(new Bullet(bx, by, Math.cos(this.angle) * 500, Math.sin(this.angle) * 500, baseDmg * 1.3, 'player', '#ff6b35', 5, false, pid));
            bullets.push(new Bullet(bx, by, Math.cos(this.angle + spread) * 480, Math.sin(this.angle + spread) * 480, baseDmg, 'player', '#ff8c42', 4, false, pid));
            bullets.push(new Bullet(bx, by, Math.cos(this.angle - spread) * 480, Math.sin(this.angle - spread) * 480, baseDmg, 'player', '#ff8c42', 4, false, pid));
            if (sLevel >= 1) {
                bullets.push(new Bullet(bx, by, Math.cos(this.angle + spread * 2.5) * 450, Math.sin(this.angle + spread * 2.5) * 450, baseDmg * 0.7, 'player', '#ffaa55', 4, false, pid));
                bullets.push(new Bullet(bx, by, Math.cos(this.angle - spread * 2.5) * 450, Math.sin(this.angle - spread * 2.5) * 450, baseDmg * 0.7, 'player', '#ffaa55', 4, false, pid));
            }
            if (sLevel >= 2) {
                bullets.push(new Bullet(this.x, this.y, Math.cos(this.angle + spread * 4) * 420, Math.sin(this.angle + spread * 4) * 420, baseDmg * 0.5, 'player', '#ffcc77', 3, false, pid));
                bullets.push(new Bullet(this.x, this.y, Math.cos(this.angle - spread * 4) * 420, Math.sin(this.angle - spread * 4) * 420, baseDmg * 0.5, 'player', '#ffcc77', 3, false, pid));
            }
            if (sLevel >= 3) {
                bullets.push(new Bullet(bx, by, Math.cos(this.angle) * 550, Math.sin(this.angle) * 550, baseDmg * 1.5, 'player', '#ff4400', 6, false, pid));
            }
        }
    }
    useUlt() {
        playSfx('ult');
        this.ultReady = false;
        this.ultCharge = 0;
        screenFlash = 0.3;
        shakeAmount = 15;
        const pid = this.id;
        for (let i = 0; i < 24; i++) {
            const a = this.angle + (i - 12) * 0.12;
            const dmg = this.isPlane ? 8 : 12;
            const c = this.isPlane ? '#00e5ff' : '#ff6b35';
            bullets.push(new Bullet(this.x, this.y, Math.cos(a) * 700, Math.sin(a) * 700, dmg, 'player', c, 5, false, pid));
        }
        spawnExplosion(this.x, this.y, 20, '#00e5ff', '#ffffff');
        this.hp = Math.min(this.maxHp, this.hp + 20);
    }
    takeDamage(dmg) {
        if (this.invincibleTimer > 0) return;
        if (this.shieldTimer > 0) { dmg *= 0.3; playSfx('shield'); }
        this.hp -= dmg;
        this.invincibleTimer = 0.3;
        shakeAmount = Math.max(shakeAmount, 5);
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
            this.respawnTimer = 3;
            playSfx('player_death');
            spawnExplosion(this.x, this.y, 50, '#ff0040', '#ff6b00');
        } else {
            playSfx('player_hit');
        }
    }
    respawn() {
        playSfx('respawn');
        this.respawnsLeft--;
        this.alive = true;
        this.hp = Math.floor(this.maxHp * 0.5);
        this.ultCharge = 0;
        this.ultReady = false;
        this.invincibleTimer = 2;
        this.shieldTimer = 2;
        this.x = this.id === 1 ? rand(100, 300) : rand(900, 1100);
        this.y = rand(H - 200, H - 80);
        this.bulletDamage = Math.max(10, this.bulletDamage - 2);
        this.spreadLevel = Math.max(0, (this.spreadLevel || 0) - 1);
        spawnExplosion(this.x, this.y, 30, '#00e5ff', '#ffffff');
        screenFlash = 0.2;
    }
    draw(ctx) {
        if (!this.alive) {
            const color = this.id === 1 ? '#1a6bff' : '#ff4444';
            ctx.save();
            ctx.globalAlpha = 0.25;
            if (this.isPlane) {
                drawPlane(ctx, this.x, this.y, this.angle, color, this.isPlane ? 1.1 : 1.0, true);
            } else {
                drawTank(ctx, this.x, this.y, this.angle, color, 1.0, true);
            }
            ctx.globalAlpha = 0.6;
            ctx.textAlign = 'center';
            ctx.fillStyle = color;
            ctx.font = '13px Arial';
            if (this.respawnsLeft > 0) {
                ctx.fillText(`复活中 ${Math.ceil(this.respawnTimer)}s`, this.x, this.y + 30);
                ctx.fillStyle = '#6b8cff';
                ctx.font = '10px Arial';
                ctx.fillText(`剩余复活: ${this.respawnsLeft}`, this.x, this.y + 44);
            } else {
                ctx.fillStyle = '#ff4444';
                ctx.font = '12px Arial';
                ctx.fillText('阵亡', this.x, this.y + 30);
            }
            ctx.restore();
            return;
        }
        const s = this.isPlane ? 1.1 : 1.0;
        const color = this.id === 1 ? '#1a6bff' : '#ff4444';

        if (this.shieldTimer > 0) {
            ctx.strokeStyle = `rgba(0, 229, 255, ${0.3 + 0.3 * Math.sin(Date.now() * 0.01)})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 30, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (this.invincibleTimer > 0 && Math.floor(Date.now() * 0.02) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        if (this.isPlane) {
            drawPlane(ctx, this.x, this.y, this.angle, color, s, true);
        } else {
            drawTank(ctx, this.x, this.y, this.angle, color, s, true);
        }
        ctx.globalAlpha = 1;

        const bw = 40, bh = 4;
        const bx = this.x - bw / 2, by = this.y - 35;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = this.hp / this.maxHp > 0.5 ? '#00e5ff' : this.hp / this.maxHp > 0.25 ? '#ffd700' : '#ff4444';
        ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), bh);

        const ubw = 34, ubh = 4;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(bx - 2, by - 8, ubw, ubh);
        ctx.fillStyle = this.ultReady ? '#ffd700' : '#1a6bff';
        ctx.fillRect(bx - 2, by - 8, ubw * (this.ultCharge / this.ultMax), ubh);
        if (this.ultReady) {
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✦', this.x, by - 14);
            ctx.shadowBlur = 0;
        }
    }
}

// ========== ENEMY SYSTEM ==========
let enemies = [];
let enemyIdCounter = 0;

class Enemy {
    constructor(type, x, y) {
        this.type = type;
        this.x = x; this.y = y;
        this.w = 32; this.h = 32;
        this.alive = true;
        this.id = enemyIdCounter++;
        this.flashTimer = 0;
        this.stunTimer = 0;
        this.shootTimer = rand(1, 3);
        this.moveTimer = 0;

        const configs = {
            [ENEMY_TYPES.SCOUT]:       { hp: 20, speed: 180, damage: 8,  score: 100,  color: '#8ab4ff', size: 0.7, shootRate: 2.0, isPlane: true },
            [ENEMY_TYPES.TANK_LIGHT]:  { hp: 40, speed: 100, damage: 12, score: 200,  color: '#b8864a', size: 0.8, shootRate: 1.8, isPlane: false },
            [ENEMY_TYPES.TANK_HEAVY]:  { hp: 80, speed: 60,  damage: 18, score: 350,  color: '#8b4513', size: 1.0, shootRate: 2.5, isPlane: false },
            [ENEMY_TYPES.FIGHTER]:     { hp: 30, speed: 250, damage: 10, score: 250,  color: '#ff6b6b', size: 0.8, shootRate: 1.5, isPlane: true },
            [ENEMY_TYPES.BOMBER]:      { hp: 60, speed: 120, damage: 25, score: 400,  color: '#6b4a8a', size: 1.1, shootRate: 3.0, isPlane: true, dropsBomb: true },
            [ENEMY_TYPES.HELICOPTER]:  { hp: 45, speed: 140, damage: 15, score: 300,  color: '#4a8a6b', size: 0.9, shootRate: 1.2, isPlane: false, hovers: true },
            [ENEMY_TYPES.ARTILLERY]:   { hp: 50, speed: 40,  damage: 30, score: 350,  color: '#8a6b4a', size: 1.0, shootRate: 3.5, isPlane: false, lobber: true },
            [ENEMY_TYPES.MINIBOSS]:    { hp: 400, speed: 80, damage: 20, score: 2000, color: '#ff4444', size: 1.5, shootRate: 1.0, isPlane: true, isBoss: true },
            [ENEMY_TYPES.BOSS]:        { hp: 800, speed: 50, damage: 30, score: 5000, color: '#ff0040', size: 2.0, shootRate: 0.7, isPlane: true, isBoss: true },
            // Level 2 enemies
            [ENEMY_TYPES.ELITE_SCOUT]:    { hp: 35, speed: 200, damage: 12, score: 150,  color: '#ff88cc', size: 0.75, shootRate: 1.5, isPlane: true },
            [ENEMY_TYPES.ELITE_TANK]:     { hp: 70, speed: 110, damage: 16, score: 300,  color: '#cc6600', size: 0.9, shootRate: 1.5, isPlane: false },
            [ENEMY_TYPES.STEALTH_FIGHTER]:{ hp: 25, speed: 300, damage: 14, score: 350,  color: '#aa44ff', size: 0.7, shootRate: 1.2, isPlane: true, stealth: true },
            [ENEMY_TYPES.LASER_TURRET]:   { hp: 55, speed: 30,  damage: 22, score: 400,  color: '#ff2266', size: 1.0, shootRate: 0.8, isPlane: false, laser: true },
            [ENEMY_TYPES.NUKE_BOMBER]:    { hp: 90, speed: 100, damage: 35, score: 500,  color: '#ff4400', size: 1.2, shootRate: 2.5, isPlane: true, dropsBomb: true },
            [ENEMY_TYPES.WARLOCK]:        { hp: 60, speed: 150, damage: 18, score: 450,  color: '#8800ff', size: 0.9, shootRate: 1.0, isPlane: true, homing: true },
            [ENEMY_TYPES.MINIBOSS2]:      { hp: 600, speed: 90, damage: 25, score: 3000, color: '#ff00aa', size: 1.6, shootRate: 0.8, isPlane: true, isBoss: true },
            [ENEMY_TYPES.BOSS2]:          { hp: 1200, speed: 60, damage: 35, score: 8000, color: '#ff0088', size: 2.2, shootRate: 0.5, isPlane: true, isBoss: true },
        };

        const c = configs[type];
        this.maxHp = c.hp;
        this.hp = c.hp;
        this.baseSpeed = c.speed;
        this.speed = c.speed;
        this.damage = c.damage;
        this.scoreVal = c.score;
        this.color = c.color;
        this.size = c.size;
        this.shootRate = c.shootRate;
        this.isPlane = c.isPlane;
        this.isBoss = c.isBoss || false;
        this.dropsBomb = c.dropsBomb || false;
        this.hovers = c.hovers || false;
        this.lobber = c.lobber || false;
        this.stealth = c.stealth || false;
        this.laser = c.laser || false;
        this.homing = c.homing || false;

        this.angle = Math.PI / 2;
        this.state = 'enter';
        this.enterTime = 0;
        this.phaseTimer = 0;
        this.behaviorTimer = 0;
        this.targetX = x; this.targetY = y;
        this.originalX = x;

        if (this.isBoss) {
            this.phase = 1;
            this.attackPattern = 0;
            this.patternTimer = 0;
            this.shieldActive = false;
        }
    }
    update(dt) {
        if (!this.alive) return;
        this.flashTimer -= dt;
        this.stunTimer -= dt;
        this.shootTimer -= dt;
        this.enterTime += dt;
        this.behaviorTimer += dt;

        if (this.state === 'enter') {
            this.y += dt * 60;
            if (this.y > 80) { this.state = 'active'; }
            return;
        }

        switch (this.type) {
            case ENEMY_TYPES.SCOUT:
                this.moveScout(dt);
                break;
            case ENEMY_TYPES.TANK_LIGHT:
                this.moveTank(dt);
                break;
            case ENEMY_TYPES.TANK_HEAVY:
                this.moveTank(dt);
                break;
            case ENEMY_TYPES.FIGHTER:
                this.moveFighter(dt);
                break;
            case ENEMY_TYPES.BOMBER:
                this.moveBomber(dt);
                break;
            case ENEMY_TYPES.HELICOPTER:
                this.moveHelicopter(dt);
                break;
            case ENEMY_TYPES.ARTILLERY:
                this.moveArtillery(dt);
                break;
            case ENEMY_TYPES.MINIBOSS:
                this.moveMiniboss(dt);
                break;
            case ENEMY_TYPES.BOSS:
                this.moveBoss(dt);
                break;
            // Level 2 enemy movements
            case ENEMY_TYPES.ELITE_SCOUT:
                this.moveEliteScout(dt);
                break;
            case ENEMY_TYPES.ELITE_TANK:
                this.moveEliteTank(dt);
                break;
            case ENEMY_TYPES.STEALTH_FIGHTER:
                this.moveStealthFighter(dt);
                break;
            case ENEMY_TYPES.LASER_TURRET:
                this.moveLaserTurret(dt);
                break;
            case ENEMY_TYPES.NUKE_BOMBER:
                this.moveNukeBomber(dt);
                break;
            case ENEMY_TYPES.WARLOCK:
                this.moveWarlock(dt);
                break;
            case ENEMY_TYPES.MINIBOSS2:
                this.moveMiniboss2(dt);
                break;
            case ENEMY_TYPES.BOSS2:
                this.moveBoss2(dt);
                break;
        }

        this.x = clamp(this.x, 20, W - 20);
        this.y = clamp(this.y, 20, H - 60);

        if (this.shootTimer <= 0 && this.state === 'active') {
            this.enemyShoot();
            this.shootTimer = this.shootRate + rand(-0.3, 0.3);
        }
    }
    moveScout(dt) {
        this.x += Math.sin(this.behaviorTimer * 2) * dt * 80;
        this.y += dt * this.baseSpeed * 0.6;
        this.angle = Math.PI / 2;
        if (this.y > H + 50) this.alive = false;
    }
    moveTank(dt) {
        const players = getAlivePlayers();
        if (players.length > 0) {
            const target = players.reduce((a, b) => dist(this, a) < dist(this, b) ? a : b);
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            this.angle = Math.atan2(dy, dx);
            const d = Math.hypot(dx, dy);
            if (d < 1) return;
            if (d > 150) {
                this.x += (dx / d) * this.baseSpeed * dt * 0.7;
                this.y += (dy / d) * this.baseSpeed * dt * 0.7;
            }
        }
    }
    moveFighter(dt) {
        const players = getAlivePlayers();
        if (players.length > 0) {
            const target = players.reduce((a, b) => dist(this, a) < dist(this, b) ? a : b);
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            this.angle = Math.atan2(dy, dx);
            const d = Math.hypot(dx, dy);
            if (d < 1) return;
            if (this.behaviorTimer % 3 < 1.5) {
                this.x += (dx / d) * this.baseSpeed * dt * 1.2;
                this.y += (dy / d) * this.baseSpeed * dt * 1.2;
            } else {
                this.x -= (dx / d) * this.baseSpeed * dt * 0.5;
                this.y -= (dy / d) * this.baseSpeed * dt * 0.5;
            }
        }
    }
    moveBomber(dt) {
        this.x += Math.sin(this.behaviorTimer * 0.5) * dt * 60;
        this.y += dt * this.baseSpeed * 0.3;
        this.angle = Math.PI / 2;
        if (Math.random() < dt * 0.3 && this.dropsBomb) {
            bullets.push(new Bullet(this.x, this.y + 20, rand(-30, 30), 200, this.damage * 1.5, 'enemy', '#ff4444', 8));
        }
        if (this.y > H + 50) this.alive = false;
    }
    moveHelicopter(dt) {
        const players = getAlivePlayers();
        if (players.length > 0) {
            const target = players.reduce((a, b) => dist(this, a) < dist(this, b) ? a : b);
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const d = Math.hypot(dx, dy);
            if (d > 1) {
                if (d > 200) {
                    this.x += (dx / d) * this.baseSpeed * dt * 0.8;
                    this.y += (dy / d) * this.baseSpeed * dt * 0.8;
                } else if (d < 120) {
                    this.x -= (dx / d) * this.baseSpeed * dt * 0.5;
                    this.y -= (dy / d) * this.baseSpeed * dt * 0.5;
                }
            }
            this.x += Math.cos(this.behaviorTimer * 1.5) * dt * 40;
            this.y += Math.sin(this.behaviorTimer * 1.5) * dt * 40;
            this.angle = Math.atan2(dy, dx);
        }
    }
    moveArtillery(dt) {
        this.angle = Math.PI / 2;
        const players = getAlivePlayers();
        if (players.length > 0) {
            const target = players.reduce((a, b) => dist(this, a) < dist(this, b) ? a : b);
            this.angle = Math.atan2(target.y - this.y, target.x - this.x);
        }
    }
    moveMiniboss(dt) {
        this.phaseTimer += dt;
        const players = getAlivePlayers();
        if (players.length === 0) return;
        const target = players.reduce((a, b) => dist(this, a) < dist(this, b) ? a : b);

        if (this.phaseTimer < 5) {
            this.x += Math.sin(this.phaseTimer * 0.8) * dt * 120;
            this.y += dt * 15;
            this.angle = Math.atan2(target.y - this.y, target.x - this.x);
        } else if (this.phaseTimer < 10) {
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const d = Math.hypot(dx, dy);
            if (d > 1) {
                this.x += (dx / d) * this.baseSpeed * dt * 1.5;
                this.y += (dy / d) * this.baseSpeed * dt * 1.5;
            }
            this.angle = Math.atan2(dy, dx);
            if (this.phaseTimer > 8) this.phaseTimer = 0;
        } else {
            this.phaseTimer = 0;
        }
        this.y = clamp(this.y, 60, 200);
    }
    moveBoss(dt) {
        this.phaseTimer += dt;
        this.patternTimer += dt;
        const players = getAlivePlayers();
        if (players.length === 0) return;
        const target = players.reduce((a, b) => dist(this, a) < dist(this, b) ? a : b);

        const hpRatio = this.hp / this.maxHp;
        if (hpRatio < 0.3) this.phase = 3;
        else if (hpRatio < 0.6) this.phase = 2;
        else this.phase = 1;

        if (this.phase === 1) {
            this.x += Math.sin(this.phaseTimer * 0.5) * dt * 60;
            this.y = 80 + Math.sin(this.phaseTimer * 0.3) * 40;
            this.angle = Math.atan2(target.y - this.y, target.x - this.x);
            this.shootRate = 0.8;
            this.speed = this.baseSpeed;
        } else if (this.phase === 2) {
            this.x += Math.sin(this.phaseTimer * 0.8) * dt * 100;
            this.y = 60 + Math.sin(this.phaseTimer * 0.5) * 60;
            this.angle = Math.atan2(target.y - this.y, target.x - this.x);
            this.shootRate = 0.5;

            if (this.patternTimer > 5) {
                this.patternTimer = 0;
                for (let i = 0; i < 2; i++) {
                    enemies.push(new Enemy(ENEMY_TYPES.SCOUT, this.x + rand(-100, 100), this.y + 40));
                }
            }
        } else {
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const d = Math.hypot(dx, dy);
            if (d > 200) {
                this.x += (dx / d) * this.baseSpeed * dt * 2;
                this.y += (dy / d) * this.baseSpeed * dt * 2;
            }
            this.angle = Math.atan2(dy, dx);
            this.shootRate = 0.3;
            this.speed = this.baseSpeed * 1.5;

            if (this.patternTimer > 3) {
                this.patternTimer = 0;
                for (let i = 0; i < 12; i++) {
                    const a = (i / 12) * Math.PI * 2;
                    bullets.push(new Bullet(this.x, this.y, Math.cos(a) * 350, Math.sin(a) * 350, 15, 'enemy', '#ff0040', 5));
                }
            }
        }
        this.y = clamp(this.y, 40, 150);
    }

    // ===== Level 2 Enemy Movements =====
    moveEliteScout(dt) {
        this.x += Math.sin(this.behaviorTimer * 2.5) * dt * 100;
        this.y += dt * this.baseSpeed * 0.7;
        this.angle = Math.PI / 2;
        if (this.y > H + 50) this.alive = false;
    }
    moveEliteTank(dt) {
        const players = getAlivePlayers();
        if (players.length > 0) {
            const target = players.reduce((a, b) => dist(this, a) < dist(this, b) ? a : b);
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            this.angle = Math.atan2(dy, dx);
            const d = Math.hypot(dx, dy);
            if (d < 1) return;
            if (d > 200) {
                this.x += (dx / d) * this.baseSpeed * dt * 0.8;
                this.y += (dy / d) * this.baseSpeed * dt * 0.8;
            } else if (d < 100) {
                this.x -= (dx / d) * this.baseSpeed * dt * 0.4;
                this.y -= (dy / d) * this.baseSpeed * dt * 0.4;
            }
        }
    }
    moveStealthFighter(dt) {
        const players = getAlivePlayers();
        if (players.length > 0) {
            const target = players.reduce((a, b) => dist(this, a) < dist(this, b) ? a : b);
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            this.angle = Math.atan2(dy, dx);
            const d = Math.hypot(dx, dy);
            if (d < 1) return;
            // Stealth fighters move erratically
            const phase = this.behaviorTimer % 2;
            if (phase < 1) {
                this.x += (dx / d) * this.baseSpeed * dt * 1.5;
                this.y += (dy / d) * this.baseSpeed * dt * 1.5;
            } else {
                this.x += Math.cos(this.behaviorTimer * 3) * dt * 150;
                this.y += Math.sin(this.behaviorTimer * 3) * dt * 100;
            }
        }
    }
    moveLaserTurret(dt) {
        this.angle = Math.PI / 2;
        const players = getAlivePlayers();
        if (players.length > 0) {
            const target = players.reduce((a, b) => dist(this, a) < dist(this, b) ? a : b);
            this.angle = Math.atan2(target.y - this.y, target.x - this.x);
        }
        // Turrets stay mostly still
        this.x += Math.sin(this.behaviorTimer * 0.5) * dt * 20;
    }
    moveNukeBomber(dt) {
        this.x += Math.sin(this.behaviorTimer * 0.6) * dt * 70;
        this.y += dt * this.baseSpeed * 0.25;
        this.angle = Math.PI / 2;
        // Drop more bombs
        if (Math.random() < dt * 0.5 && this.dropsBomb) {
            bullets.push(new Bullet(this.x, this.y + 25, rand(-40, 40), 250, this.damage * 1.5, 'enemy', '#ff4400', 10));
        }
        if (this.y > H + 50) this.alive = false;
    }
    moveWarlock(dt) {
        const players = getAlivePlayers();
        if (players.length > 0) {
            const target = players.reduce((a, b) => dist(this, a) < dist(this, b) ? a : b);
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const d = Math.hypot(dx, dy);
            this.angle = Math.atan2(dy, dx);
            if (d > 1) {
                if (d > 250) {
                    this.x += (dx / d) * this.baseSpeed * dt * 0.9;
                    this.y += (dy / d) * this.baseSpeed * dt * 0.9;
                } else if (d < 150) {
                    this.x -= (dx / d) * this.baseSpeed * dt * 0.6;
                    this.y -= (dy / d) * this.baseSpeed * dt * 0.6;
                }
            }
            this.x += Math.cos(this.behaviorTimer * 1.2) * dt * 50;
            this.y += Math.sin(this.behaviorTimer * 1.2) * dt * 50;
        }
    }
    moveMiniboss2(dt) {
        this.phaseTimer += dt;
        const players = getAlivePlayers();
        if (players.length === 0) return;
        const target = players.reduce((a, b) => dist(this, a) < dist(this, b) ? a : b);

        if (this.phaseTimer < 4) {
            this.x += Math.sin(this.phaseTimer * 1.0) * dt * 140;
            this.y += dt * 20;
            this.angle = Math.atan2(target.y - this.y, target.x - this.x);
        } else if (this.phaseTimer < 8) {
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const d = Math.hypot(dx, dy);
            if (d > 1) {
                this.x += (dx / d) * this.baseSpeed * dt * 1.8;
                this.y += (dy / d) * this.baseSpeed * dt * 1.8;
            }
            this.angle = Math.atan2(dy, dx);
            if (this.phaseTimer > 7) this.phaseTimer = 0;
        } else {
            this.phaseTimer = 0;
        }
        this.y = clamp(this.y, 60, 200);
    }
    moveBoss2(dt) {
        this.phaseTimer += dt;
        this.patternTimer += dt;
        const players = getAlivePlayers();
        if (players.length === 0) return;
        const target = players.reduce((a, b) => dist(this, a) < dist(this, b) ? a : b);

        const hpRatio = this.hp / this.maxHp;
        if (hpRatio < 0.25) this.phase = 3;
        else if (hpRatio < 0.5) this.phase = 2;
        else this.phase = 1;

        if (this.phase === 1) {
            this.x += Math.sin(this.phaseTimer * 0.6) * dt * 80;
            this.y = 70 + Math.sin(this.phaseTimer * 0.4) * 50;
            this.angle = Math.atan2(target.y - this.y, target.x - this.x);
            this.shootRate = 0.6;
            this.speed = this.baseSpeed;
        } else if (this.phase === 2) {
            this.x += Math.sin(this.phaseTimer * 0.9) * dt * 120;
            this.y = 50 + Math.sin(this.phaseTimer * 0.6) * 70;
            this.angle = Math.atan2(target.y - this.y, target.x - this.x);
            this.shootRate = 0.4;

            if (this.patternTimer > 4) {
                this.patternTimer = 0;
                for (let i = 0; i < 3; i++) {
                    enemies.push(new Enemy(ENEMY_TYPES.ELITE_SCOUT, this.x + rand(-120, 120), this.y + 40));
                }
            }
        } else {
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const d = Math.hypot(dx, dy);
            if (d > 180) {
                this.x += (dx / d) * this.baseSpeed * dt * 2.5;
                this.y += (dy / d) * this.baseSpeed * dt * 2.5;
            }
            this.angle = Math.atan2(dy, dx);
            this.shootRate = 0.25;
            this.speed = this.baseSpeed * 2;

            if (this.patternTimer > 2.5) {
                this.patternTimer = 0;
                for (let i = 0; i < 16; i++) {
                    const a = (i / 16) * Math.PI * 2;
                    bullets.push(new Bullet(this.x, this.y, Math.cos(a) * 400, Math.sin(a) * 400, 18, 'enemy', '#ff0088', 6));
                }
            }
        }
        this.y = clamp(this.y, 40, 150);
    }

    enemyShoot() {
        playSfx('shoot_enemy');

        // Boss2 shooting
        if (this.type === ENEMY_TYPES.BOSS2) {
            if (this.phase === 1) {
                const target = getAlivePlayers()[0] || { x: W / 2, y: H };
                const dx = target.x - this.x;
                const dy = target.y - this.y;
                const d = Math.hypot(dx, dy);
                if (d < 1) return;
                const speed = 450;
                bullets.push(new Bullet(this.x, this.y + 35, (dx / d) * speed, (dy / d) * speed, this.damage, 'enemy', '#ff0088', 7));
                // Also shoot a second bullet at slight angle
                const a = Math.atan2(dy, dx);
                bullets.push(new Bullet(this.x, this.y + 35, Math.cos(a + 0.08) * speed * 0.9, Math.sin(a + 0.08) * speed * 0.9, this.damage * 0.8, 'enemy', '#ff44aa', 6));
                bullets.push(new Bullet(this.x, this.y + 35, Math.cos(a - 0.08) * speed * 0.9, Math.sin(a - 0.08) * speed * 0.9, this.damage * 0.8, 'enemy', '#ff44aa', 6));
            } else if (this.phase === 2) {
                for (let i = -2; i <= 2; i++) {
                    const target = getAlivePlayers()[0] || { x: W / 2, y: H };
                    const dx = target.x - this.x;
                    const dy = target.y - this.y;
                    const a = Math.atan2(dy, dx) + i * 0.08;
                    bullets.push(new Bullet(this.x, this.y + 35, Math.cos(a) * 450, Math.sin(a) * 450, this.damage * 0.7, 'enemy', '#ff44aa', 5));
                }
            } else {
                for (let i = -4; i <= 4; i++) {
                    const a = Math.PI / 2 + i * 0.12;
                    bullets.push(new Bullet(this.x, this.y + 35, Math.cos(a) * 400, Math.sin(a) * 400, this.damage * 0.5, 'enemy', '#ff0088', 4));
                }
            }
            return;
        }

        // Miniboss2 shooting
        if (this.type === ENEMY_TYPES.MINIBOSS2) {
            const target = getAlivePlayers()[0] || { x: W / 2, y: H };
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const a = Math.atan2(dy, dx);
            for (let i = -2; i <= 2; i++) {
                bullets.push(new Bullet(this.x, this.y + 25, Math.cos(a + i * 0.1) * 380, Math.sin(a + i * 0.1) * 380, this.damage, 'enemy', '#ff00aa', 5));
            }
            return;
        }

        // Warlock shoots homing bullets
        if (this.type === ENEMY_TYPES.WARLOCK) {
            const target = getAlivePlayers()[0] || { x: W / 2, y: H };
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const d = Math.hypot(dx, dy);
            if (d < 1) return;
            const speed = 280;
            const b = new Bullet(this.x, this.y + 15, (dx / d) * speed, (dy / d) * speed, this.damage, 'enemy', '#8800ff', 5);
            b.isHoming = true;
            b.owner = 'enemy';
            bullets.push(b);
            return;
        }

        // Laser turret shoots fast thin beams
        if (this.type === ENEMY_TYPES.LASER_TURRET) {
            const target = getAlivePlayers()[0] || { x: W / 2, y: H };
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const d = Math.hypot(dx, dy);
            if (d < 1) return;
            const speed = 600;
            bullets.push(new Bullet(this.x, this.y, (dx / d) * speed, (dy / d) * speed, this.damage, 'enemy', '#ff2266', 3));
            return;
        }

        // Boss shooting
        if (this.type === ENEMY_TYPES.BOSS) {
            if (this.phase === 1) {
                const target = getAlivePlayers()[0] || { x: W / 2, y: H };
                const dx = target.x - this.x;
                const dy = target.y - this.y;
                const d = Math.hypot(dx, dy);
                if (d < 1) return;
                const speed = 400;
                bullets.push(new Bullet(this.x, this.y + 30, (dx / d) * speed, (dy / d) * speed, this.damage, 'enemy', '#ff4444', 6));
            } else if (this.phase === 2) {
                for (let i = -1; i <= 1; i++) {
                    const target = getAlivePlayers()[0] || { x: W / 2, y: H };
                    const dx = target.x - this.x;
                    const dy = target.y - this.y;
                    const a = Math.atan2(dy, dx) + i * 0.1;
                    bullets.push(new Bullet(this.x, this.y + 30, Math.cos(a) * 400, Math.sin(a) * 400, this.damage * 0.8, 'enemy', '#ff6666', 5));
                }
            } else {
                for (let i = -3; i <= 3; i++) {
                    const a = Math.PI / 2 + i * 0.15;
                    bullets.push(new Bullet(this.x, this.y + 30, Math.cos(a) * 350, Math.sin(a) * 350, this.damage * 0.6, 'enemy', '#ff0040', 4));
                }
            }
            return;
        }

        if (this.type === ENEMY_TYPES.MINIBOSS) {
            const target = getAlivePlayers()[0] || { x: W / 2, y: H };
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const a = Math.atan2(dy, dx);
            for (let i = -1; i <= 1; i++) {
                bullets.push(new Bullet(this.x, this.y + 20, Math.cos(a + i * 0.12) * 350, Math.sin(a + i * 0.12) * 350, this.damage, 'enemy', '#ff6666', 5));
            }
            return;
        }

        if (this.lobber) {
            const target = getAlivePlayers()[0] || { x: this.x, y: H };
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const d = Math.hypot(dx, dy);
            if (d < 1) return;
            const speed = 300;
            bullets.push(new Bullet(this.x, this.y, (dx / d) * speed * 0.8, (dy / d) * speed * 1.2 + 50, this.damage, 'enemy', '#ff8c00', 7));
            return;
        }

        const players = getAlivePlayers();
        if (players.length > 0) {
            const target = players.reduce((a, b) => dist(this, a) < dist(this, b) ? a : b);
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const d = Math.hypot(dx, dy);
            if (d < 1) return;
            const speed = 300 + rand(0, 100);
            bullets.push(new Bullet(this.x, this.y + 15, (dx / d) * speed, (dy / d) * speed, this.damage, 'enemy', '#ff4444', 4));
        }
    }
    takeDamage(dmg, killerId) {
        this.hp -= dmg;
        this.flashTimer = 0.1;
        if (this.hp <= 0) {
            this.alive = false;
            if (this.isBoss) {
                playSfx('explosion_boss');
            } else if (this.type === ENEMY_TYPES.MINIBOSS || this.type === ENEMY_TYPES.MINIBOSS2) {
                playSfx('explosion_big');
            } else {
                playSfx('explosion_small');
            }
            const exCount = this.isBoss ? 80 : (this.type === ENEMY_TYPES.MINIBOSS || this.type === ENEMY_TYPES.MINIBOSS2) ? 50 : 20;
            const color1 = this.isBoss ? '#ff0040' : this.color;
            spawnExplosion(this.x, this.y, exCount, color1, '#ffd700');
            score += this.scoreVal;
            comboCount++;
            comboTimer = 2;
            for (const p of players1) {
                if (p.alive) {
                    p.score += this.scoreVal;
                    if (p.id === killerId) p.kills++;
                }
            }
            shakeAmount = Math.max(shakeAmount, this.isBoss ? 20 : 10);
            if (this.isBoss) {
                screenFlash = 0.5;
            }
            // Spawn pickup on enemy death
            const isMedium = !this.isPlane || this.type === ENEMY_TYPES.BOMBER || this.type === ENEMY_TYPES.HELICOPTER || this.type === ENEMY_TYPES.NUKE_BOMBER || this.type === ENEMY_TYPES.LASER_TURRET || this.type === ENEMY_TYPES.WARLOCK;
            const dropChance = this.isBoss ? 1.0 : (this.type === ENEMY_TYPES.MINIBOSS || this.type === ENEMY_TYPES.MINIBOSS2) ? 1.0 : isMedium ? 0.70 : 0.45;
            if (Math.random() < dropChance) {
                spawnPickup(this.x, this.y);
            }
        }
    }
    draw(ctx) {
        if (!this.alive) return;
        const s = this.size;

        ctx.save();

        // Stealth effect
        if (this.stealth) {
            const stealthAlpha = 0.4 + 0.3 * Math.sin(Date.now() * 0.005);
            ctx.globalAlpha = stealthAlpha;
        }

        if (this.flashTimer > 0) {
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 30;
        }

        if (this.isBoss) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 20 + 10 * Math.sin(Date.now() * 0.005);
        }

        if (this.isPlane) {
            drawPlane(ctx, this.x, this.y, this.angle, this.color, s);
        } else {
            drawTank(ctx, this.x, this.y, this.angle, this.color, s);
        }

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        if (this.isBoss) {
            ctx.fillStyle = this.color;
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            let name = '';
            if (this.type === ENEMY_TYPES.MINIBOSS) name = '⚡ 小Boss';
            else if (this.type === ENEMY_TYPES.BOSS) name = '☠ 大Boss';
            else if (this.type === ENEMY_TYPES.MINIBOSS2) name = '⚡ 小Boss·改';
            else if (this.type === ENEMY_TYPES.BOSS2) name = '☠ 终极Boss';
            ctx.fillText(name, this.x, this.y - 30 * s - 10);
        }

        const bw = 40 * s;
        const bh = 4;
        const bx = this.x - bw / 2;
        const by = this.y - 25 * s - 5;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(bx, by, bw, bh);
        const hpRatio = this.hp / this.maxHp;
        ctx.fillStyle = hpRatio > 0.5 ? '#ff6b35' : hpRatio > 0.25 ? '#ffd700' : '#ff0040';
        ctx.fillRect(bx, by, bw * hpRatio, bh);

        ctx.restore();
    }
}

// ========== GAME OBJECTS ==========
let players1 = [];

function getAlivePlayers() {
    return players1.filter(p => p.alive);
}

function clearGame() {
    players1 = [];
    enemies = [];
    bullets = [];
    particles = [];
    pickups = [];
    score = 0;
    gameTime = 0;
    gameOver = false;
    levelComplete = false;
    paused = false;
    comboCount = 0;
    comboTimer = 0;
    shakeAmount = 0;
    screenFlash = 0;
    enemyIdCounter = 0;
    bossAnnounced = false;
    miniBossAnnounced = false;
    boss2Announced = false;
    miniBoss2Announced = false;
    initScrollingBg();
}

// ========== WAVE SPAWNER ==========
let waveIndex = 0;
let bossAnnounced = false;
let miniBossAnnounced = false;
let boss2Announced = false;
let miniBoss2Announced = false;

function getWaveConfig() {
    return currentLevel === 1 ? WAVE_CONFIG_L1 : WAVE_CONFIG_L2;
}

function updateWaveSpawner(dt) {
    const t = gameTime;
    const config = getWaveConfig();
    for (let i = waveIndex; i < config.length; i++) {
        if (t >= config[i].time) {
            const wave = config[i];
            for (const group of wave.enemies) {
                for (let j = 0; j < group.count; j++) {
                    const enemy = createEnemyForWave(group.type);
                    if (enemy) enemies.push(enemy);
                }
            }
            waveIndex = i + 1;
        }
    }
}

function createEnemyForWave(type) {
    let x, y;
    if (type === ENEMY_TYPES.BOSS || type === ENEMY_TYPES.BOSS2) {
        x = W / 2;
        y = 60;
    } else if (type === ENEMY_TYPES.MINIBOSS || type === ENEMY_TYPES.MINIBOSS2) {
        x = W / 2 + rand(-150, 150);
        y = 100;
    } else {
        x = rand(60, W - 60);
        y = -rand(20, 80);
    }
    return new Enemy(type, x, y);
}

// ========== COLLISION SYSTEM ==========
function checkCollisions() {
    const alivePlayers = getAlivePlayers();

    for (const b of bullets) {
        if (!b.alive || b.owner !== 'player') continue;
        for (const e of enemies) {
            if (!e.alive) continue;
            if (rectCollide(
                { x: b.x - b.size, y: b.y - b.size, w: b.size * 2, h: b.size * 2 },
                { x: e.x - e.w / 2, y: e.y - e.h / 2, w: e.w, h: e.h }
            )) {
                e.takeDamage(b.damage, b.ownerId);
                b.alive = false;
                playSfx('hit');
                spawnExplosion(b.x, b.y, 3, '#00e5ff', '#ffffff');
                break;
            }
        }
    }

    for (const b of bullets) {
        if (!b.alive || b.owner !== 'enemy') continue;
        for (const p of alivePlayers) {
            if (rectCollide(
                { x: b.x - b.size, y: b.y - b.size, w: b.size * 2, h: b.size * 2 },
                { x: p.x - 18, y: p.y - 18, w: 36, h: 36 }
            )) {
                p.takeDamage(b.damage);
                b.alive = false;
                spawnExplosion(b.x, b.y, 5, '#ff4444', '#ff8888');
                break;
            }
        }
    }

    for (const e of enemies) {
        if (!e.alive) continue;
        for (const p of alivePlayers) {
            if (dist(e, p) < (e.w / 2 + 18) * 0.8) {
                p.takeDamage(e.damage * 0.5);
                spawnExplosion(p.x, p.y, 10, '#ff4444', '#ffd700');
                if (e.type !== ENEMY_TYPES.BOSS && e.type !== ENEMY_TYPES.BOSS2 && e.type !== ENEMY_TYPES.MINIBOSS && e.type !== ENEMY_TYPES.MINIBOSS2) {
                    e.alive = false;
                    playSfx('explosion_small');
                    spawnExplosion(e.x, e.y, 15, e.color, '#ffd700');
                    // Drop pickup from contact-killed enemies
                    if (Math.random() < 0.50) {
                        spawnPickup(e.x, e.y);
                    }
                }
            }
        }
    }

    checkPickupCollisions();
}

// ========== GAME LOOP ==========
function gameLoop(timestamp) {
    if (gameState !== 'playing') return;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;

    if (!paused && !gameOver) {
        update(dt);
    }
    render();

    animFrameId = requestAnimationFrame(gameLoop);
}

function sanitizeEntity(e) {
    if (!e) return;
    if (!Number.isFinite(e.x)) e.x = clamp(isNaN(e.x) ? W / 2 : e.x, 0, W);
    if (!Number.isFinite(e.y)) e.y = clamp(isNaN(e.y) ? H / 2 : e.y, 0, H);
    if (!Number.isFinite(e.angle)) e.angle = 0;
    if (!Number.isFinite(e.hp)) e.hp = e.maxHp || 100;
    if (!Number.isFinite(e.vx)) e.vx = 0;
    if (!Number.isFinite(e.vy)) e.vy = 0;
    if (!Number.isFinite(e.w) || e.w < 1) e.w = 20;
    if (!Number.isFinite(e.h) || e.h < 1) e.h = 20;
}

function updateBgScroll(dt) {
    scrollSpeed = Math.min(120, 40 + gameTime * 0.3);
    for (const star of bgStars) {
        star.y += star.speed * dt;
        star.pulse += star.pulseSpeed * dt;
        if (star.y > H + 10) {
            star.y = -10;
            star.x = Math.random() * W;
        }
    }
    for (const line of bgSpeedLines) {
        line.y += line.speed * dt;
        if (line.y > H + line.length) {
            line.y = -line.length;
            line.x = Math.random() * W;
        }
    }
}

function update(dt) {
    gameTime += dt;
    comboTimer -= dt;
    if (comboTimer <= 0) { comboCount = 0; }
    screenFlash = Math.max(0, screenFlash - dt);
    shakeAmount = Math.max(0, shakeAmount - dt * 15);
    updateBgScroll(dt);

    for (const p of players1) {
        p.update(dt);
    }
    for (const p of players1) sanitizeEntity(p);

    for (const e of enemies) {
        e.update(dt);
    }
    enemies = enemies.filter(e => e.alive);
    for (const e of enemies) sanitizeEntity(e);

    for (const b of bullets) {
        b.update(dt);
    }
    bullets = bullets.filter(b => b.alive);
    for (const b of bullets) sanitizeEntity(b);

    for (const p of particles) {
        p.update(dt);
    }
    particles = particles.filter(p => p.alive);

    for (const pk of pickups) {
        pk.update(dt);
    }
    pickups = pickups.filter(pk => pk.alive);
    for (const pk of pickups) sanitizeEntity(pk);

    updateWaveSpawner(dt);

    checkCollisions();

    const config = getWaveConfig();
    const allWavesSpawned = waveIndex >= config.length;
    const remainingEnemies = enemies.filter(e => e.alive);

    if (allWavesSpawned && remainingEnemies.length === 0 && gameTime > 5) {
        levelComplete = true;
        gameOver = true;
        showGameOver(true);
    }

    const alivePlayers = getAlivePlayers();
    const allDeadNoRespawns = players1.every(p => !p.alive && p.respawnsLeft <= 0);
    if (allDeadNoRespawns && gameTime > 3) {
        gameOver = true;
        showGameOver(false);
    }

    // Boss announcements
    const bossAlive = enemies.find(e => e.type === ENEMY_TYPES.BOSS && e.alive);
    if (bossAlive && !bossAnnounced) {
        bossAnnounced = true;
        playSfx('boss_warn');
        screenFlash = 0.8;
        shakeAmount = 25;
    }
    const miniBossAlive = enemies.find(e => e.type === ENEMY_TYPES.MINIBOSS && e.alive);
    if (miniBossAlive && !miniBossAnnounced && !bossAnnounced) {
        miniBossAnnounced = true;
        playSfx('boss_warn');
        screenFlash = 0.4;
        shakeAmount = 15;
    }
    const boss2Alive = enemies.find(e => e.type === ENEMY_TYPES.BOSS2 && e.alive);
    if (boss2Alive && !boss2Announced) {
        boss2Announced = true;
        playSfx('boss_warn');
        screenFlash = 0.8;
        shakeAmount = 30;
    }
    const miniBoss2Alive = enemies.find(e => e.type === ENEMY_TYPES.MINIBOSS2 && e.alive);
    if (miniBoss2Alive && !miniBoss2Announced && !boss2Announced) {
        miniBoss2Announced = true;
        playSfx('boss_warn');
        screenFlash = 0.4;
        shakeAmount = 15;
    }
}

function render() {
    try {
        ctx.save();

        if (shakeAmount > 0.5) {
            ctx.translate(rand(-shakeAmount, shakeAmount), rand(-shakeAmount, shakeAmount));
        }

        // Level-specific background colors
        let bgColor1, bgColor2, bgColor3;
        if (currentLevel === 1) {
            bgColor1 = '#0d1528';
            bgColor2 = '#080e1a';
            bgColor3 = '#04060a';
        } else {
            // Level 2: Darker, more purple/red tones
            bgColor1 = '#1a0d28';
            bgColor2 = '#0e081a';
            bgColor3 = '#0a0406';
        }

        const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
        grad.addColorStop(0, bgColor1);
        grad.addColorStop(0.5, bgColor2);
        grad.addColorStop(1, bgColor3);
        ctx.fillStyle = grad;
        ctx.fillRect(-20, -20, W + 40, H + 40);

        const speedRatio = clamp(scrollSpeed / 120, 0, 1);

        // Level 2: Add red/purple tint to speed lines
        const lineColor = currentLevel === 1 ? '100, 180, 255' : '200, 100, 255';
        for (const line of bgSpeedLines) {
            ctx.strokeStyle = `rgba(${lineColor}, ${line.alpha * (0.5 + 0.5 * speedRatio)})`;
            ctx.lineWidth = line.width;
            ctx.beginPath();
            ctx.moveTo(line.x, line.y);
            ctx.lineTo(line.x + (line.x - W / 2) * 0.05 * speedRatio, line.y - line.length);
            ctx.stroke();
        }

        // Level 2: Add some purple tint to stars
        const starColor = currentLevel === 1 ? '180, 220, 255' : '220, 180, 255';
        for (const star of bgStars) {
            const twinkle = 0.7 + 0.3 * Math.sin(star.pulse);
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${starColor}, ${star.alpha * twinkle * (0.6 + 0.4 * speedRatio)})`;
            ctx.fill();
            if (star.layer === 2 && star.size > 2.5) {
                ctx.shadowColor = `rgba(${lineColor}, 0.3)`;
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        // Grid color based on level
        const gridColor = currentLevel === 1 ? '26, 107, 255' : '150, 50, 200';
        ctx.strokeStyle = `rgba(${gridColor}, ${0.03 + 0.04 * speedRatio})`;
        ctx.lineWidth = 1;
        const gs = 80;
        const gridOffset = (gameTime * 60 * speedRatio) % gs;
        for (let x = 0; x < W; x += gs) {
            ctx.beginPath();
            ctx.moveTo(x, -20); ctx.lineTo(x, H + 20);
            ctx.stroke();
        }
        for (let y = -gs + gridOffset; y < H + gs; y += gs) {
            ctx.beginPath();
            ctx.moveTo(-20, y); ctx.lineTo(W + 20, y);
            ctx.stroke();
        }

        // Ground
        const groundColor = currentLevel === 1 ? '26, 107, 255' : '150, 50, 200';
        const groundSpeed = 80 + scrollSpeed * 0.6;
        const groundOffset = (gameTime * groundSpeed) % 120;
        ctx.fillStyle = `rgba(${groundColor}, 0.04)`;
        ctx.fillRect(0, H - 30, W, 30);
        ctx.fillStyle = `rgba(${groundColor}, 0.06)`;
        for (let gx = -groundOffset * 2; gx < W + 120; gx += 120) {
            ctx.fillRect(gx, H - 25, 60, 3);
        }
        for (let gx = -groundOffset; gx < W + 120; gx += 80) {
            ctx.fillRect(gx, H - 18, 40, 2);
        }
        for (let gx = -groundOffset * 1.5; gx < W + 120; gx += 60) {
            ctx.fillRect(gx, H - 12, 25, 1.5);
        }

        for (const p of particles) {
            if (p.isText) continue;
            try { p.draw(ctx); } catch(e) { p.alive = false; }
        }

        for (const pk of pickups) {
            try { pk.draw(ctx); } catch(e) { pk.alive = false; }
        }

        for (const b of bullets) {
            try { b.draw(ctx); } catch(e) { b.alive = false; }
        }

        for (const e of enemies) {
            try { e.draw(ctx); } catch(e) { e.alive = false; }
        }

        for (const p of players1) {
            try { p.draw(ctx); } catch(e) { /* skip */ }
        }

        if (screenFlash > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${screenFlash * 0.3})`;
            ctx.fillRect(-20, -20, W + 40, H + 40);
        }

        drawHUD(ctx);

        ctx.restore();
    } catch(e) {
        console.error('Render error:', e);
        ctx.restore();
    }
}

// ========== HUD ==========
function drawHUD(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 20, 0.7)';
    ctx.fillRect(0, 0, W, 50);

    const hudColor = currentLevel === 1 ? '#1a6bff' : '#aa44ff';
    ctx.fillStyle = hudColor;
    ctx.fillRect(0, 48, W, 2);

    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    ctx.fillStyle = '#8ab4ff';
    ctx.font = '18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`⏱ ${minutes}:${seconds.toString().padStart(2, '0')}`, W / 2, 32);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`🏆 ${score}`, 20, 33);

    // Level indicator
    ctx.textAlign = 'left';
    ctx.fillStyle = hudColor;
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`第${currentLevel}关`, 110, 33);

    if (comboCount > 2) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff6b35';
        ctx.font = `bold ${16 + comboCount}px Arial`;
        ctx.fillText(`${comboCount}x COMBO!`, W / 2, 80);
    }

    const config = getWaveConfig();
    const progress = Math.min(waveIndex / config.length, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(W - 160, 15, 140, 6);
    ctx.fillStyle = hudColor;
    ctx.fillRect(W - 160, 15, 140 * progress, 6);
    ctx.fillStyle = '#6b8cff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';

    let phaseName = '准备中';
    if (currentLevel === 1) {
        if (gameTime < 30) phaseName = '初战';
        else if (gameTime < 70) phaseName = '升级';
        else if (gameTime < 110) phaseName = '激战';
        else if (gameTime < 140) phaseName = '小Boss战';
        else if (gameTime < 158) phaseName = '最终冲锋';
        else phaseName = '大Boss战';
    } else {
        if (gameTime < 25) phaseName = '突入';
        else if (gameTime < 60) phaseName = '强袭';
        else if (gameTime < 95) phaseName = '死斗';
        else if (gameTime < 120) phaseName = '小Boss·改';
        else if (gameTime < 148) phaseName = '最终决战';
        else phaseName = '终极Boss';
    }

    ctx.fillText(phaseName, W - 20, 12);

    for (let i = 0; i < players1.length; i++) {
        const p = players1[i];
        const hx = i === 0 ? 200 : 400;
        ctx.textAlign = 'left';
        ctx.fillStyle = p.id === 1 ? '#1a6bff' : '#ff4444';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`P${p.id} ${p.isPlane ? '✈' : '坦克'}`, hx, 20);

        if (!p.alive) {
            ctx.fillStyle = '#ff4444';
            ctx.font = '11px Arial';
            const respawnInfo = p.respawnsLeft > 0 ? `阵亡 ${Math.ceil(p.respawnTimer)}s后复活` : '已阵亡 (无复活)';
            ctx.fillText(respawnInfo, hx, 18);
        } else {
            const hbw = 100, hbh = 8;
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect(hx, 25, hbw, hbh);
            const hpRatio = p.hp / p.maxHp;
            ctx.fillStyle = hpRatio > 0.5 ? '#00e5ff' : hpRatio > 0.25 ? '#ffd700' : '#ff4444';
            ctx.fillRect(hx, 25, hbw * hpRatio, hbh);

            ctx.fillStyle = p.ultReady ? '#ffd700' : 'rgba(255,255,255,0.15)';
            ctx.fillRect(hx, 36, hbw * (p.ultCharge / p.ultMax), 5);
            if (p.ultReady) {
                ctx.fillStyle = '#ffd700';
                ctx.font = '9px Arial';
                ctx.fillText('✦ 大招就绪', hx + 105, 42);
            }
        }

        // Respawn count
        ctx.fillStyle = '#6b8cff';
        ctx.font = '9px Arial';
        ctx.fillText(`复活:${p.respawnsLeft}`, hx + 80, 12);

        // Show buffs
        const sLevel = p.spreadLevel || 0;
        if (sLevel > 0) {
            ctx.fillStyle = '#00e5ff';
            ctx.font = '9px Arial';
            ctx.fillText(`散射Lv${sLevel}`, hx + 105, 54);
        }
        if (p.bulletDamage > 10) {
            ctx.fillStyle = '#ff8c00';
            ctx.font = '9px Arial';
            ctx.fillText(`火力+${p.bulletDamage - 10}`, hx + 155, 54);
        }
        if (p.speed > 220) {
            ctx.fillStyle = '#44ff44';
            ctx.font = '9px Arial';
            ctx.fillText(`加速+${Math.round(p.speed - 220)}`, hx + 210, 54);
        }
        if (p.shieldTimer > 0) {
            ctx.fillStyle = '#aa88ff';
            ctx.font = '9px Arial';
            ctx.fillText(`护盾${p.shieldTimer.toFixed(1)}s`, hx + 260, 54);
        }
    }

    // Enemy count
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ff6b6b';
    ctx.font = '14px Arial';
    ctx.fillText(`敌人: ${enemies.filter(e => e.alive).length}`, W - 20, 32);

    // Sound toggle
    ctx.textAlign = 'right';
    ctx.fillStyle = sfxMuted ? '#666666' : '#8ab4ff';
    ctx.font = '16px Arial';
    ctx.fillText(sfxMuted ? '🔇' : '🔊', W - 80, 32);
    ctx.fillStyle = sfxMuted ? '#444444' : '#5577aa';
    ctx.font = '9px Arial';
    ctx.fillText(sfxMuted ? '静音' : '音效', W - 80, 44);

    // Bottom notification area
    if (levelComplete) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 48px Arial';
        ctx.fillText('🎉 关卡完成!', W / 2, H / 2 - 40);
    }

    // Boss warnings
    const bossActive = enemies.find(e => e.type === ENEMY_TYPES.BOSS && e.alive);
    if (bossActive) {
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 0, 64, ${0.3 + 0.3 * Math.sin(Date.now() * 0.003)})`;
        ctx.font = 'bold 64px Arial';
        ctx.fillText('☠ BOSS', W / 2, 120);
    }
    const miniBossActive = enemies.find(e => e.type === ENEMY_TYPES.MINIBOSS && e.alive);
    if (miniBossActive && !bossActive) {
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 68, 68, ${0.3 + 0.3 * Math.sin(Date.now() * 0.004)})`;
        ctx.font = 'bold 36px Arial';
        ctx.fillText('⚡ 小BOSS', W / 2, 100);
    }
    const boss2Active = enemies.find(e => e.type === ENEMY_TYPES.BOSS2 && e.alive);
    if (boss2Active) {
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 0, 136, ${0.3 + 0.3 * Math.sin(Date.now() * 0.003)})`;
        ctx.font = 'bold 64px Arial';
        ctx.fillText('☠ 终极BOSS', W / 2, 120);
    }
    const miniBoss2Active = enemies.find(e => e.type === ENEMY_TYPES.MINIBOSS2 && e.alive);
    if (miniBoss2Active && !boss2Active) {
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 0, 170, ${0.3 + 0.3 * Math.sin(Date.now() * 0.004)})`;
        ctx.font = 'bold 36px Arial';
        ctx.fillText('⚡ 小BOSS·改', W / 2, 100);
    }
}

// ========== GAME CONTROL FUNCTIONS ==========
function startGame(mode) {
    ensureAudioCtx();
    playSfx('ui_click');
    document.getElementById('menuScreen').style.display = 'none';
    document.getElementById('pauseScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('levelTransitionScreen').style.display = 'none';
    gameMode = mode;
    currentLevel = 1;
    clearGame();

    const p1 = new Player(200, H - 100, {
        up: 'w', down: 's', left: 'a', right: 'd', shoot: 'j', ult: 'k'
    }, 1);
    p1.isPlane = true;
    players1.push(p1);

    if (mode === 2) {
        const p2 = new Player(1000, H - 100, {
            up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright', shoot: '1', ult: '2'
        }, 2);
        p2.isPlane = false;
        players1.push(p2);
    }

    waveIndex = 0;
    gameState = 'playing';
    lastTime = performance.now();
    if (animFrameId) cancelAnimationFrame(animFrameId);
    gameLoop(lastTime);
}

function startLevel(level) {
    ensureAudioCtx();
    playSfx('level_up');
    document.getElementById('levelTransitionScreen').style.display = 'none';
    currentLevel = level;
    clearGame();

    // Keep players with their stats
    const oldPlayers = [...players1];
    players1 = [];
    for (const oldP of oldPlayers) {
        const p = new Player(oldP.x, oldP.y, oldP.controls, oldP.id);
        p.isPlane = oldP.isPlane;
        p.hp = Math.min(oldP.maxHp, oldP.hp + 30); // Bonus HP for next level
        p.maxHp = oldP.maxHp + 20; // Increase max HP
        p.bulletDamage = oldP.bulletDamage;
        p.shootRate = oldP.shootRate;
        p.spreadLevel = oldP.spreadLevel;
        p.speed = oldP.speed;
        p.ultCharge = oldP.ultCharge;
        p.ultReady = oldP.ultReady;
        p.respawnsLeft = oldP.respawnsLeft;
        players1.push(p);
    }

    waveIndex = 0;
    gameState = 'playing';
    lastTime = performance.now();
    if (animFrameId) cancelAnimationFrame(animFrameId);
    gameLoop(lastTime);
}

function resumeGame() {
    ensureAudioCtx();
    playSfx('ui_click');
    paused = false;
    document.getElementById('pauseScreen').style.display = 'none';
    lastTime = performance.now();
    gameLoop(lastTime);
}

function backToMenu() {
    ensureAudioCtx();
    playSfx('ui_click');
    gameState = 'menu';
    if (animFrameId) cancelAnimationFrame(animFrameId);
    document.getElementById('menuScreen').style.display = 'flex';
    document.getElementById('pauseScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('levelTransitionScreen').style.display = 'none';
    clearGame();
}

function showGameOver(won) {
    if (won && currentLevel === 1) {
        // Show level transition to level 2
        document.getElementById('levelTransitionScreen').style.display = 'flex';
        document.getElementById('levelTransitionTitle').textContent = '🎉 第一关通过!';
        document.getElementById('levelTransitionInfo').textContent = `得分: ${score} | 准备进入第二关...`;
        document.getElementById('gameOverScreen').style.display = 'none';
        return;
    }

    const screen = document.getElementById('gameOverScreen');
    screen.style.display = 'flex';
    document.getElementById('resultTitle').textContent = won ? '🎉 恭喜通关!' : '💥 游戏结束';
    let stats = `得分: ${score} | 时间: ${Math.floor(gameTime / 60)}:${Math.floor(gameTime % 60).toString().padStart(2, '0')} | 通关: 第${currentLevel}关`;
    for (const p of players1) {
        stats += ` | P${p.id}: ${p.kills}击杀`;
    }
    document.getElementById('resultStats').textContent = stats;
}

if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (r > w / 2) r = w / 2;
        if (r > h / 2) r = h / 2;
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        return this;
    };
}

console.log('🔥 坦克飞机大战 PS5版 已加载');
console.log('单人模式: WASD移动, J射击, K大招');
console.log('双人模式: P2方向键移动, 1射击, 2大招');
console.log('🎮 新增第二关! 更强的敌人等待着你!');
