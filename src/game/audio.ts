// Retro arcade audio engine using Web Audio API

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  // Force le réveil du contexte à chaque appel s'il est endormi
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.15,
  freqEnd?: number
) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);
  }
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function noise(duration: number, volume = 0.1, filterFreq = 1000) {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(filterFreq, ctx.currentTime);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

export const sfx = {
  deposit: () => {
    tone(523, 0.08, 'square', 0.12);
    setTimeout(() => tone(659, 0.08, 'square', 0.12), 60);
    setTimeout(() => tone(784, 0.12, 'square', 0.15), 120);
  },
  depositStart: () => {
    tone(440, 0.05, 'sine', 0.08);
  },
  break: () => {
    noise(0.15, 0.15, 800);
    tone(80, 0.15, 'sawtooth', 0.15, 30);
  },
  breakValue: () => {
    noise(0.2, 0.18, 600);
    tone(120, 0.2, 'sawtooth', 0.12, 40);
    setTimeout(() => tone(60, 0.1, 'square', 0.1), 50);
  },
  toxic: () => {
    noise(0.3, 0.2, 400);
    tone(200, 0.3, 'sawtooth', 0.15, 50);
  },
  jump: () => {
    tone(330, 0.08, 'sine', 0.1, 550);
  },
  land: () => {
    tone(150, 0.05, 'sine', 0.08, 80);
  },
  step: () => {
    tone(200, 0.03, 'sine', 0.04);
  },
  neighborScared: () => {
    tone(300, 0.1, 'square', 0.08, 500);
  },
  neighborHappy: () => {
    tone(523, 0.06, 'sine', 0.06);
    setTimeout(() => tone(659, 0.06, 'sine', 0.06), 50);
  },
  tick: () => {
    tone(880, 0.04, 'sine', 0.06);
  },
  tickUrgent: () => {
    tone(1320, 0.06, 'sine', 0.1);
  },
  victory: () => {
    tone(523, 0.12, 'square', 0.12);
    setTimeout(() => tone(659, 0.12, 'square', 0.12), 120);
    setTimeout(() => tone(784, 0.12, 'square', 0.12), 240);
    setTimeout(() => tone(1047, 0.2, 'square', 0.15), 360);
  },
  gameOver: () => {
    tone(440, 0.15, 'square', 0.12);
    setTimeout(() => tone(330, 0.15, 'square', 0.12), 150);
    setTimeout(() => tone(220, 0.3, 'square', 0.12), 300);
  },
  uiClick: () => {
    tone(660, 0.05, 'sine', 0.08);
  },
  uiHover: () => {
    tone(440, 0.03, 'sine', 0.04);
  },
};

export function initAudio() {
  getCtx();
}
