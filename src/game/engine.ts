import type { Player, GameObject, Neighbor, GameMode, Tool } from './types';
import {
  GRAVITY, MOVE_SPEED, JUMP_FORCE, FRICTION, DEPOSIT_TIME,
  GAME_DURATION, GROUND_Y, PLAYER_W, PLAYER_H, CANVAS_WIDTH, CANVAS_HEIGHT, COLORS,
} from './types';
import { ParticleSystem } from './particles';
import { generateLevel } from './level';
import {
  drawBackground, drawGround, drawPlayer, drawObject, drawNeighbor,
} from './render';
import { sfx } from './audio';

export interface GameCallbacks {
  onScoreChange: (score: number) => void;
  onTimeChange: (time: number) => void;
  onModeChange: (mode: GameMode) => void;
  onStatsChange: (stats: GameStats) => void;
}

export interface GameStats {
  deposited: number;
  broken: number;
  toxic: number;
  totalObjects: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  action: Tool | null;
  actionHeld: boolean;
}

export class GameEngine {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  mode: GameMode = 'menu';
  score = 0;
  timeLeft = GAME_DURATION;
  level = 1;
  player: Player;
  objects: GameObject[] = [];
  neighbors: Neighbor[] = [];
  particles: ParticleSystem;
  cameraX = 0;
  screenShake = 0;
  hitStop = 0;
  lastTime = 0;
  rafId: number | null = null;
  running = false;
  input: InputState = { left: false, right: false, jump: false, action: null, actionHeld: false };
  callbacks: GameCallbacks;
  stats: GameStats = { deposited: 0, broken: 0, toxic: 0, totalObjects: 0 };
  tickAccumulator = 0;
  lastTickSecond = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.callbacks = callbacks;
    this.particles = new ParticleSystem();
    this.player = {
      x: 100,
      y: GROUND_Y - PLAYER_H,
      vx: 0,
      vy: 0,
      w: PLAYER_W,
      h: PLAYER_H,
      onGround: false,
      facing: 1,
      walkPhase: 0,
      actionProgress: 0,
      actionTarget: null,
      actionType: null,
      hitFlash: 0,
      squash: 0,
    };
  }

  start() {
    this.level = 1;
    this.score = 0;
    this.timeLeft = GAME_DURATION;
    this.mode = 'playing';
    this.tickAccumulator = 0;
    this.lastTickSecond = GAME_DURATION;
    this.loadLevel();
    this.callbacks.onModeChange('playing');
    this.callbacks.onScoreChange(0);
    this.callbacks.onTimeChange(GAME_DURATION);
    if (!this.running) {
      this.running = true;
      this.lastTime = performance.now();
      this.loop();
    }
  }

  loadLevel() {
    const { objects, neighbors } = generateLevel(this.level);
    this.objects = objects;
    this.neighbors = neighbors;
    this.stats = {
      deposited: 0,
      broken: 0,
      toxic: 0,
      totalObjects: objects.filter((o) => o.type === 'value').length,
    };
    this.callbacks.onStatsChange(this.stats);
    this.player.x = 100;
    this.player.y = GROUND_Y - PLAYER_H;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.actionProgress = 0;
    this.player.actionTarget = null;
    this.player.actionType = null;
    this.cameraX = 0;
  }

  nextLevel() {
    this.level++;
    this.loadLevel();
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  setInput(input: Partial<InputState>) {
    this.input = { ...this.input, ...input };
  }

  loop = () => {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 16.67, 2);
    this.lastTime = now;

    try {
      if (this.hitStop > 0) {
        this.hitStop -= dt;
      } else if (this.mode === 'playing') {
        this.update(dt);
      }

      this.render();
    } catch (err) {
      console.error('Game render error:', err);
      this.running = false;
    }
    this.rafId = requestAnimationFrame(this.loop);
  };

  update(dt: number) {
    const p = this.player;

    // Timer
    this.tickAccumulator += dt * 16.67;
    if (this.tickAccumulator >= 1000) {
      this.tickAccumulator -= 1000;
      this.timeLeft--;
      this.callbacks.onTimeChange(this.timeLeft);

      if (this.timeLeft <= 10 && this.timeLeft > 0) {
        sfx.tickUrgent();
      } else if (this.timeLeft > 0 && this.timeLeft % 15 === 0) {
        sfx.tick();
      }

      if (this.timeLeft <= 0) {
        this.endGame();
        return;
      }
    }

    // Horizontal movement
    if (this.input.left && !this.input.right) {
      p.vx = -MOVE_SPEED;
      p.facing = -1;
    } else if (this.input.right && !this.input.left) {
      p.vx = MOVE_SPEED;
      p.facing = 1;
    } else {
      p.vx *= FRICTION;
      if (Math.abs(p.vx) < 0.1) p.vx = 0;
    }

    // Jump
    if (this.input.jump && p.onGround) {
      p.vy = -JUMP_FORCE;
      p.onGround = false;
      p.squash = 0.3;
      sfx.jump();
      this.particles.spawnDust(p.x, p.y + p.h / 2);
    }

    // Gravity
    p.vy += GRAVITY;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Ground collision
    if (p.y + p.h / 2 >= GROUND_Y) {
      p.y = GROUND_Y - p.h / 2;
      if (!p.onGround && p.vy > 3) {
        sfx.land();
        p.squash = 0.2;
        this.particles.spawnDust(p.x, GROUND_Y, 8);
      }
      p.vy = 0;
      p.onGround = true;
    } else {
      p.onGround = false;
    }

    // World bounds
    if (p.x < 30) p.x = 30;
    if (p.x > 1500) p.x = 1500;

    // Walk animation
    if (Math.abs(p.vx) > 0.5 && p.onGround) {
      p.walkPhase += 0.2 * dt;
      if (Math.floor(p.walkPhase) !== Math.floor(p.walkPhase - 0.2 * dt)) {
        sfx.step();
      }
    }

    // Squash decay
    p.squash *= 0.85;
    p.hitFlash *= 0.9;

    // Camera follows player
    const targetCamX = Math.max(0, Math.min(p.x - CANVAS_WIDTH / 2, 1500 - CANVAS_WIDTH));
    this.cameraX += (targetCamX - this.cameraX) * 0.1 * dt;

    // Screen shake decay
    this.screenShake *= 0.85;

    // Object interactions
    this.updateObjects(dt);
    this.updateNeighbors(dt);
    this.particles.update();
  }

  updateObjects(dt: number) {
    const p = this.player;

    for (const obj of this.objects) {
      if (obj.collected) continue;
      obj.hitFlash *= 0.9;

      // Check proximity
      const dx = Math.abs(p.x - obj.x);
      const dy = Math.abs((p.y + p.h / 4) - obj.y);
      const inRange = dx < 55 && dy < 60;

      if (inRange && this.input.action && this.input.actionHeld) {
        if (this.input.action === 'deposit' && obj.type === 'value' && !obj.deposited) {
          // Start or continue depositing
          if (p.actionTarget !== obj.id) {
            p.actionTarget = obj.id;
            p.actionType = 'deposit';
            p.actionProgress = 0;
            sfx.depositStart();
          }
          obj.depositProgress += dt / DEPOSIT_TIME;
          p.actionProgress = obj.depositProgress;

          if (obj.depositProgress >= 1) {
            obj.deposited = true;
            obj.collected = true;
            this.score += obj.value;
            this.stats.deposited++;
            this.callbacks.onScoreChange(this.score);
            this.callbacks.onStatsChange(this.stats);
            sfx.deposit();
            this.particles.spawnStars(obj.x, obj.y);
            this.particles.spawnConfetti(obj.x, obj.y);
            this.particles.addFloatingText(obj.x, obj.y - 30, `+${obj.value}`, COLORS.depositGreen, 28);
            this.makeNeighborsHappy();
            p.actionTarget = null;
            p.actionType = null;
            p.actionProgress = 0;
          }
        } else if (this.input.action === 'break') {
          if (obj.type === 'obstacle' && !obj.broken) {
            // Break obstacle - good!
            obj.broken = true;
            obj.collected = true;
            this.particles.spawnBreak(obj.x, obj.y, '#B45309', 16);
            this.screenShake = 8;
            this.hitStop = 4;
            sfx.break();
            this.particles.addFloatingText(obj.x, obj.y - 20, 'CASSÉ!', COLORS.breakRed, 20);
            p.actionTarget = null;
            p.actionType = null;
          } else if (obj.type === 'value' && !obj.broken) {
            // Breaking a value object - bad!
            obj.broken = true;
            obj.collected = true;
            this.score = Math.max(0, this.score - 20);
            this.stats.broken++;
            this.callbacks.onScoreChange(this.score);
            this.callbacks.onStatsChange(this.stats);
            this.particles.spawnBreak(obj.x, obj.y, '#EF4444', 16);
            this.screenShake = 12;
            this.hitStop = 6;
            sfx.breakValue();
            const messages = ['TROP VITE!', 'OUPS!', 'PERTE!', 'NON!'];
            this.particles.addFloatingText(
              obj.x, obj.y - 30,
              messages[Math.floor(Math.random() * messages.length)],
              COLORS.breakRed, 24
            );
            this.particles.addFloatingText(obj.x, obj.y - 55, '-20', COLORS.breakRed, 20);
            this.makeNeighborsScared();
            p.hitFlash = 1;
            p.actionTarget = null;
            p.actionType = null;
          } else if (obj.type === 'toxic' && !obj.broken) {
            // Breaking toxic - very bad!
            obj.broken = true;
            obj.collected = true;
            this.score = Math.max(0, this.score - 50);
            this.stats.toxic++;
            this.callbacks.onScoreChange(this.score);
            this.callbacks.onStatsChange(this.stats);
            this.particles.spawnToxic(obj.x, obj.y);
            this.screenShake = 20;
            this.hitStop = 10;
            sfx.toxic();
            this.particles.addFloatingText(obj.x, obj.y - 30, 'DANGER!', COLORS.toxic, 28);
            this.particles.addFloatingText(obj.x, obj.y - 55, '-50', COLORS.breakRed, 22);
            this.makeNeighborsScared();
            p.hitFlash = 1;
            p.actionTarget = null;
            p.actionType = null;
          }
        }
      } else if (p.actionTarget === obj.id && !this.input.actionHeld) {
        // Cancel action
        obj.depositProgress = Math.max(0, obj.depositProgress - dt / 30);
        p.actionTarget = null;
        p.actionType = null;
        p.actionProgress = 0;
      }
    }

    // Check if all value objects are collected
    const remaining = this.objects.filter((o) => o.type === 'value' && !o.collected);
    if (remaining.length === 0 && this.mode === 'playing') {
      // Level complete
      if (this.level < 3) {
        this.particles.addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'NIVEAU SUIVANT!', COLORS.accent, 36);
        sfx.victory();
        this.nextLevel();
      } else {
        this.endGame(true);
      }
    }
  }

  updateNeighbors(dt: number) {
    for (const n of this.neighbors) {
      n.walkPhase += 0.15 * dt;
      n.x += n.vx * dt;
      n.stateTimer += dt;

      // Bounce at boundaries
      if (n.x < 100 || n.x > 1500) {
        n.vx *= -1;
        n.x = Math.max(100, Math.min(1500, n.x));
      }

      // Return to idle
      if (n.state !== 'idle' && n.stateTimer > 90) {
        n.state = 'idle';
        n.stateTimer = 0;
      }
    }
  }

  makeNeighborsHappy() {
    for (const n of this.neighbors) {
      n.state = 'happy';
      n.stateTimer = 0;
    }
    sfx.neighborHappy();
  }

  makeNeighborsScared() {
    for (const n of this.neighbors) {
      n.state = 'scared';
      n.stateTimer = 0;
      n.vx = (Math.random() > 0.5 ? 1 : -1) * 2;
    }
    sfx.neighborScared();
  }

  endGame(victory = false) {
    this.mode = victory ? 'victory' : 'gameover';
    if (victory) {
      sfx.victory();
      this.particles.spawnConfetti(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    } else {
      sfx.gameOver();
    }
    this.callbacks.onModeChange(this.mode);
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();

    // Screen shake
    if (this.screenShake > 0.5) {
      ctx.translate(
        (Math.random() - 0.5) * this.screenShake,
        (Math.random() - 0.5) * this.screenShake
      );
    }

    // Draw world
    drawBackground(ctx, w, h, this.cameraX);
    drawGround(ctx, w, h, this.cameraX);

    // Apply camera transform for world objects
    ctx.save();
    ctx.translate(-this.cameraX, 0);

    for (const obj of this.objects) {
      drawObject(ctx, obj);
    }

    for (const n of this.neighbors) {
      drawNeighbor(ctx, n);
    }

    drawPlayer(ctx, this.player);

    this.particles.draw(ctx);

    ctx.restore();

    ctx.restore();
  }

  renderMenu(ctx: CanvasRenderingContext2D) {
    drawBackground(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, 0);
    drawGround(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, 0);
  }
}
