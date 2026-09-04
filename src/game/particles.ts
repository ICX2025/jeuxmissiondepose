import type { Particle, FloatingText, Vec2 } from './types';

export class ParticleSystem {
  particles: Particle[] = [];
  floatingTexts: FloatingText[] = [];

  spawnDust(x: number, y: number, count = 6) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 1.5 - 0.5,
        life: 30,
        maxLife: 30,
        color: '#94A3B8',
        size: 3 + Math.random() * 3,
        gravity: 0.05,
        shape: 'dust',
        rotation: 0,
        rotSpeed: 0,
      });
    }
  }

  spawnBreak(x: number, y: number, color: string, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 3 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 40,
        maxLife: 40,
        color,
        size: 4 + Math.random() * 6,
        gravity: 0.3,
        shape: 'square',
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.3,
      });
    }
  }

  spawnToxic(x: number, y: number) {
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 50,
        maxLife: 50,
        color: i % 2 === 0 ? '#A855F7' : '#C084FC',
        size: 5 + Math.random() * 5,
        gravity: 0.1,
        shape: 'circle',
        rotation: 0,
        rotSpeed: 0,
      });
    }
  }

  spawnConfetti(x: number, y: number) {
    const colors = ['#FACC15', '#84CC16', '#22C55E', '#3B82F6', '#EF4444', '#F97316'];
    for (let i = 0; i < 30; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
      const speed = 4 + Math.random() * 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 60,
        maxLife: 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 4,
        gravity: 0.15,
        shape: 'square',
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.4,
      });
    }
  }

  spawnStars(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 2 + Math.random() * 3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 35,
        maxLife: 35,
        color: '#FACC15',
        size: 6 + Math.random() * 4,
        gravity: 0,
        shape: 'star',
        rotation: 0,
        rotSpeed: 0.1,
      });
    }
  }

  addFloatingText(x: number, y: number, text: string, color: string, size = 24) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 60,
      maxLife: 60,
      vy: -1.5,
      size,
    });
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.rotation += p.rotSpeed;
      p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y += t.vy;
      t.vy *= 0.95;
      t.life--;
      if (t.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'square') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      } else if (p.shape === 'star') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        const s = p.size * alpha;
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          const angle = (Math.PI * 2 * j) / 5 - Math.PI / 2;
          const outerR = s;
          const innerR = s * 0.4;
          ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
          ctx.lineTo(Math.cos(angle + Math.PI / 5) * innerR, Math.sin(angle + Math.PI / 5) * innerR);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (p.shape === 'dust') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    for (const t of this.floatingTexts) {
      const alpha = Math.min(1, t.life / 20);
      ctx.globalAlpha = alpha;
      ctx.font = `900 ${t.size}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.particles = [];
    this.floatingTexts = [];
  }
}
