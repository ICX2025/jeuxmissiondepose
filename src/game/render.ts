import type { Player, GameObject, Neighbor } from './types';
import { COLORS, GROUND_Y } from './types';

export function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, cameraX: number) {
  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#1E293B');
  grad.addColorStop(0.4, '#334155');
  grad.addColorStop(0.7, '#475569');
  grad.addColorStop(1, '#1E293B');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Distant buildings (parallax)
  const parallaxX = cameraX * 0.2;
  ctx.fillStyle = '#1E293B';
  for (let i = 0; i < 12; i++) {
    const bx = ((i * 180 - parallaxX) % (w + 360)) - 180;
    const bw = 120 + (i % 3) * 40;
    const bh = 200 + (i % 4) * 60;
    ctx.fillRect(bx, h - bh - 100, bw, bh);
    // Windows
    ctx.fillStyle = i % 2 === 0 ? '#FACC1588' : '#84CC1688';
    for (let wy = 0; wy < 4; wy++) {
      for (let wx = 0; wx < 3; wx++) {
        if ((i + wy + wx) % 3 !== 0) {
          ctx.fillRect(bx + 15 + wx * 35, h - bh - 80 + wy * 40, 20, 20);
        }
      }
    }
    ctx.fillStyle = '#1E293B';
  }

  // Mid-ground buildings
  const midX = cameraX * 0.5;
  ctx.fillStyle = '#0F172A';
  for (let i = 0; i < 8; i++) {
    const bx = ((i * 260 - midX) % (w + 520)) - 260;
    const bw = 180;
    const bh = 160 + (i % 3) * 50;
    ctx.fillRect(bx, h - bh - 60, bw, bh);
  }

  // Construction site elements
  drawCrane(ctx, 200 - cameraX * 0.6, h);
  drawCrane(ctx, 900 - cameraX * 0.6, h);
}

function drawCrane(ctx: CanvasRenderingContext2D, x: number, h: number) {
  ctx.fillStyle = '#FACC15';
  ctx.fillRect(x, 100, 8, h - 200);
  ctx.fillRect(x - 60, 100, 120, 8);
  ctx.fillRect(x + 40, 108, 4, 40);
  // Hook
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 42, 148);
  ctx.lineTo(x + 42, 200);
  ctx.stroke();
}

export function drawGround(ctx: CanvasRenderingContext2D, w: number, h: number, cameraX: number) {
  // Ground
  const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, h);
  groundGrad.addColorStop(0, '#64748B');
  groundGrad.addColorStop(0.3, '#475569');
  groundGrad.addColorStop(1, '#1E293B');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, GROUND_Y, w, h - GROUND_Y);

  // Ground line
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(w, GROUND_Y);
  ctx.stroke();

  // Floor tiles
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  const tileSize = 60;
  const offset = -cameraX % tileSize;
  for (let x = offset; x < w; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
}

export function drawPlayer(ctx: CanvasRenderingContext2D, p: Player) {
  ctx.save();
  ctx.translate(p.x, p.y);

  // Squash effect
  const sx = 1 + p.squash * 0.3;
  const sy = 1 - p.squash * 0.3;
  ctx.scale(sx, sy);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, p.h / 2 + 4, p.w / 2, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (expert worker)
  const facing = p.facing;

  // Legs
  ctx.fillStyle = '#1E293B';
  const legSwing = Math.sin(p.walkPhase) * (Math.abs(p.vx) > 0.5 ? 1 : 0);
  ctx.fillRect(-10, 10, 8, 16 + legSwing * 3);
  ctx.fillRect(2, 10, 8, 16 - legSwing * 3);

  // Boots
  ctx.fillStyle = '#334155';
  ctx.fillRect(-12, 24 + legSwing * 3, 12, 4);
  ctx.fillRect(0, 24 - legSwing * 3, 12, 4);

  // Torso (high-vis vest)
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.roundRect(-14, -8, 28, 22, 4);
  ctx.fill();

  // Reflective stripes
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-14, -2, 28, 3);
  ctx.fillRect(-14, 6, 28, 3);

  // Arms
  ctx.fillStyle = '#FACC15';
  const armSwing = Math.sin(p.walkPhase) * (Math.abs(p.vx) > 0.5 ? 1 : 0) * 3;
  ctx.fillRect(-18, -6 + armSwing, 6, 16);
  ctx.fillRect(12, -6 - armSwing, 6, 16);

  // Hands
  ctx.fillStyle = '#FDBA74';
  ctx.beginPath();
  ctx.arc(-15, 10 + armSwing, 4, 0, Math.PI * 2);
  ctx.arc(15, 10 - armSwing, 4, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#FDBA74';
  ctx.beginPath();
  ctx.arc(0, -16, 10, 0, Math.PI * 2);
  ctx.fill();

  // Hard hat
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(0, -20, 12, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(-14, -20, 28, 4);
  // Hat brim
  ctx.fillStyle = '#CA8A04';
  ctx.fillRect(-14, -18, 28, 3);

  // Face
  ctx.fillStyle = '#1E293B';
  if (facing > 0) {
    ctx.fillRect(2, -18, 3, 3);
    ctx.fillRect(7, -18, 3, 3);
  } else {
    ctx.fillRect(-5, -18, 3, 3);
    ctx.fillRect(-10, -18, 3, 3);
  }
  // Smile
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(facing > 0 ? 3 : -3, -13, 3, 0, Math.PI);
  ctx.stroke();

  // Hit flash
  if (p.hitFlash > 0) {
    ctx.globalAlpha = p.hitFlash;
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Action indicator
  if (p.actionType && p.actionProgress > 0) {
    ctx.translate(0, -40);
    const progress = p.actionProgress;
    const color = p.actionType === 'deposit' ? COLORS.depositGreen : COLORS.breakRed;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 14, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawObject(ctx: CanvasRenderingContext2D, obj: GameObject) {
  if (obj.collected) return;

  ctx.save();
  ctx.translate(obj.x, obj.y);

  // Hit flash
  if (obj.hitFlash > 0) {
    ctx.shadowColor = obj.type === 'toxic' ? COLORS.toxicGlow : '#FFFFFF';
    ctx.shadowBlur = 20 * obj.hitFlash;
  }

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, obj.h / 2 + 3, obj.w / 2, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (obj.type === 'value') {
    drawValueObject(ctx, obj);
  } else if (obj.type === 'obstacle') {
    drawObstacle(ctx, obj);
  } else if (obj.type === 'toxic') {
    drawToxic(ctx, obj);
  }

  // Deposit progress ring
  if (obj.depositProgress > 0 && !obj.deposited) {
    ctx.shadowBlur = 0;
    ctx.translate(0, -obj.h / 2 - 15);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = COLORS.depositGreen;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 12, -Math.PI / 2, -Math.PI / 2 + obj.depositProgress * Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawValueObject(ctx: CanvasRenderingContext2D, obj: GameObject) {
  const icon = obj.icon;
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 2;

  switch (icon) {
    case 'radiator':
      ctx.fillStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.roundRect(-22, -20, 44, 40, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#94A3B8';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(-18 + i * 8, -16, 4, 32);
      }
      break;

    case 'sink':
      ctx.fillStyle = '#F1F5F9';
      ctx.beginPath();
      ctx.roundRect(-22, -18, 44, 36, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.ellipse(0, -8, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#475569';
      ctx.fillRect(-3, -22, 6, 8);
      break;

    case 'cabinet':
      ctx.fillStyle = '#92400E';
      ctx.beginPath();
      ctx.roundRect(-22, -22, 44, 44, 3);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#451A03';
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(0, 22);
      ctx.stroke();
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(-4, 0, 2, 0, Math.PI * 2);
      ctx.arc(4, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'chair':
      ctx.fillStyle = '#92400E';
      ctx.fillRect(-16, -18, 32, 6);
      ctx.fillRect(-16, -18, 6, 36);
      ctx.fillRect(10, -18, 6, 36);
      ctx.fillRect(-16, 12, 32, 6);
      ctx.strokeRect(-16, -18, 32, 6);
      break;

    case 'bathtub':
      ctx.fillStyle = '#F1F5F9';
      ctx.beginPath();
      ctx.roundRect(-24, -16, 48, 32, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#60A5FA';
      ctx.beginPath();
      ctx.roundRect(-20, -12, 40, 24, 6);
      ctx.fill();
      break;

    case 'window':
      ctx.fillStyle = '#60A5FA';
      ctx.fillRect(-22, -22, 44, 44);
      ctx.strokeStyle = '#92400E';
      ctx.lineWidth = 4;
      ctx.strokeRect(-22, -22, 44, 44);
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(0, 22);
      ctx.moveTo(-22, 0);
      ctx.lineTo(22, 0);
      ctx.stroke();
      break;

    case 'toilet':
      ctx.fillStyle = '#F1F5F9';
      ctx.beginPath();
      ctx.roundRect(-16, -20, 32, 16, 4);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 8, 18, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;

    case 'planks':
      ctx.fillStyle = '#A16207';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(-22, -20 + i * 14, 44, 12);
        ctx.strokeRect(-22, -20 + i * 14, 44, 12);
      }
      break;

    default:
      ctx.fillStyle = '#84CC16';
      ctx.beginPath();
      ctx.roundRect(-20, -20, 40, 40, 6);
      ctx.fill();
      ctx.stroke();
  }

  // Value badge
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.roundRect(-18, -36, 36, 14, 7);
  ctx.fill();
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-18, -36, 36, 14);
  ctx.fillStyle = '#1E293B';
  ctx.font = '900 10px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`+${obj.value}`, 0, -29);
}

function drawObstacle(ctx: CanvasRenderingContext2D, obj: GameObject) {
  ctx.fillStyle = '#B45309';
  ctx.fillRect(-obj.w / 2, -obj.h / 2, obj.w, obj.h);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2;
  ctx.strokeRect(-obj.w / 2, -obj.h / 2, obj.w, obj.h);
  // Brick pattern
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1;
  for (let row = 0; row < 5; row++) {
    const y = -obj.h / 2 + row * 12;
    ctx.beginPath();
    ctx.moveTo(-obj.w / 2, y);
    ctx.lineTo(obj.w / 2, y);
    ctx.stroke();
    const offset = row % 2 === 0 ? 0 : 10;
    ctx.beginPath();
    ctx.moveTo(offset, y);
    ctx.lineTo(offset, y + 12);
    ctx.moveTo(offset + 20, y);
    ctx.lineTo(offset + 20, y + 12);
    ctx.stroke();
  }
}

function drawToxic(ctx: CanvasRenderingContext2D, obj: GameObject) {
  const icon = obj.icon;
  // Glow
  const glow = ctx.createRadialGradient(0, 0, 5, 0, 0, 30);
  glow.addColorStop(0, 'rgba(168,85,247,0.3)');
  glow.addColorStop(1, 'rgba(168,85,247,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(-30, -30, 60, 60);

  if (icon === 'hazmat') {
    ctx.fillStyle = '#A855F7';
    ctx.beginPath();
    ctx.roundRect(-18, -18, 36, 36, 4);
    ctx.fill();
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Biohazard symbol
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      const a = (Math.PI * 2 * i) / 3 - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 8, Math.sin(a) * 8, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Barrel
    ctx.fillStyle = '#7E22CE';
    ctx.beginPath();
    ctx.roundRect(-16, -16, 32, 32, 4);
    ctx.fill();
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#581C87';
    ctx.fillRect(-16, -8, 32, 4);
    ctx.fillRect(-16, 4, 32, 4);
    // Skull
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.arc(0, -2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-3, -3, 2, 2);
    ctx.fillRect(1, -3, 2, 2);
  }

  // Warning badge
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.moveTo(0, -36);
    ctx.lineTo(8, -24);
    ctx.lineTo(-8, -24);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#1E293B';
    ctx.font = '900 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', 0, -28);
}

export function drawNeighbor(ctx: CanvasRenderingContext2D, n: Neighbor) {
  ctx.save();
  ctx.translate(n.x, n.y);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 15, 10, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = n.state === 'scared' ? '#EF4444' : n.state === 'happy' ? '#22C55E' : '#64748B';
  ctx.beginPath();
  ctx.roundRect(-8, -8, 16, 18, 3);
  ctx.fill();

  // Legs
  ctx.fillStyle = '#1E293B';
  const walk = Math.sin(n.walkPhase) * 2;
  ctx.fillRect(-6, 8, 4, 8 + walk);
  ctx.fillRect(2, 8, 4, 8 - walk);

  // Head
  ctx.fillStyle = '#FDBA74';
  ctx.beginPath();
  ctx.arc(0, -14, 6, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#1E293B';
  if (n.state === 'scared') {
    // Wide eyes
    ctx.beginPath();
    ctx.arc(-2, -15, 2, 0, Math.PI * 2);
    ctx.arc(2, -15, 2, 0, Math.PI * 2);
    ctx.fill();
    // Mouth open
    ctx.beginPath();
    ctx.arc(0, -11, 2, 0, Math.PI);
    ctx.fill();
    // Arms up
    ctx.strokeStyle = '#FDBA74';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(-14, -12);
    ctx.moveTo(8, -4);
    ctx.lineTo(14, -12);
    ctx.stroke();
  } else if (n.state === 'happy') {
    // Happy eyes
    ctx.fillRect(-3, -16, 2, 2);
    ctx.fillRect(1, -16, 2, 2);
    // Smile
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -13, 3, 0, Math.PI);
    ctx.stroke();
    // Thumbs up
    ctx.fillStyle = '#FDBA74';
    ctx.fillRect(8, -2, 4, 6);
    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('👍', 12, 0);
  } else {
    // Normal eyes
    ctx.fillRect(-3, -15, 2, 2);
    ctx.fillRect(1, -15, 2, 2);
    // Neutral mouth
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, -11);
    ctx.lineTo(2, -11);
    ctx.stroke();
  }

  // Speech bubble
  if (n.state === 'scared' && n.stateTimer > 40) {
    drawSpeechBubble(ctx, 'WOW!', '#EF4444', 0, -30);
  } else if (n.state === 'happy' && n.stateTimer > 40) {
    drawSpeechBubble(ctx, 'PROPRE!', '#22C55E', 0, -30);
  }

  ctx.restore();
}

function drawSpeechBubble(ctx: CanvasRenderingContext2D, text: string, color: string, x: number, y: number) {
  ctx.font = '900 11px Inter, sans-serif';
  const w = ctx.measureText(text).width + 12;
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - 14, w, 18, 4);
  ctx.fill();
  ctx.stroke();
  // Tail
  ctx.beginPath();
  ctx.moveTo(x - 4, y + 4);
  ctx.lineTo(x, y + 8);
  ctx.lineTo(x + 4, y + 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y - 5);
}
