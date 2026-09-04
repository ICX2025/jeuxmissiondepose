// Game types and constants

export type GameMode = 'menu' | 'playing' | 'gameover' | 'victory';

export type Tool = 'deposit' | 'break';

export interface Vec2 {
  x: number;
  y: number;
}

export interface GameObject {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'value' | 'obstacle' | 'toxic' | 'wall';
  label: string;
  icon: string;
  value: number;
  deposited: boolean;
  broken: boolean;
  depositProgress: number;
  hitFlash: number;
  collected: boolean;
}

export interface Neighbor {
  id: number;
  x: number;
  y: number;
  vx: number;
  baseY: number;
  state: 'happy' | 'scared' | 'idle';
  stateTimer: number;
  walkPhase: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  gravity: number;
  shape: 'circle' | 'square' | 'star' | 'dust';
  rotation: number;
  rotSpeed: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
  size: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  onGround: boolean;
  facing: 1 | -1;
  walkPhase: number;
  actionProgress: number;
  actionTarget: number | null;
  actionType: Tool | null;
  hitFlash: number;
  squash: number;
}

export const GRAVITY = 0.55;
export const MOVE_SPEED = 3.8;
export const JUMP_FORCE = 11.5;
export const FRICTION = 0.82;
export const DEPOSIT_TIME = 90;
export const GAME_DURATION = 90;
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const GROUND_Y = 600;
export const PLAYER_W = 36;
export const PLAYER_H = 52;

export const VALUE_OBJECTS = [
  { label: 'Radiateur', icon: 'radiator', value: 150 },
  { label: 'Lavabo', icon: 'sink', value: 150 },
  { label: 'Meuble', icon: 'cabinet', value: 150 },
  { label: 'Chaise', icon: 'chair', value: 150 },
  { label: 'Baignoire', icon: 'bathtub', value: 200 },
  { label: 'Fenêtre', icon: 'window', value: 150 },
  { label: 'WC', icon: 'toilet', value: 150 },
  { label: 'Parquet', icon: 'planks', value: 180 },
];

export const OBSTACLES = [
  { label: 'Mur de briques', icon: 'brickwall', value: 0 },
];

export const TOXIC_OBJECTS = [
  { label: 'Amiante', icon: 'hazmat', value: 0 },
  { label: 'Bidon toxique', icon: 'barrel', value: 0 },
];

export const COLORS = {
  primary: '#FACC15',
  primaryDark: '#CA8A04',
  accent: '#84CC16',
  accentDark: '#65A30D',
  danger: '#EF4444',
  dangerDark: '#B91C1C',
  bgDark: '#0F172A',
  bgMid: '#1E293B',
  bgLight: '#334155',
  textLight: '#F8FAFC',
  textDim: '#94A3B8',
  glass: 'rgba(255,255,255,0.08)',
  glassBorder: 'rgba(255,255,255,0.18)',
  depositGreen: '#22C55E',
  breakRed: '#EF4444',
  toxic: '#A855F7',
  toxicGlow: '#C084FC',
};
