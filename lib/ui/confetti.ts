type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
  life: number;
};

const COLORS = ["#8b7355", "#c4b5a0", "#1c1917", "#f5f2ed", "#78716c"];

/** Brief editorial confetti burst from the bottom CTA. */
export function burstConfetti() {
  if (typeof document === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "pointer-events:none;position:fixed;inset:0;z-index:80;width:100%;height:100%";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  const originX = window.innerWidth / 2;
  const originY = window.innerHeight - 72;
  const particles: Particle[] = [];
  const count = 70;

  for (let i = 0; i < count; i += 1) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
    const speed = 7 + Math.random() * 9;
    particles.push({
      x: originX + (Math.random() - 0.5) * 80,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: 5 + Math.random() * 5,
      h: 8 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      color: COLORS[i % COLORS.length] ?? COLORS[0],
      life: 1,
    });
  }

  const started = performance.now();
  const duration = 1400;
  let frame = 0;

  const tick = (now: number) => {
    const t = now - started;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const p of particles) {
      p.vy += 0.18;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life = Math.max(0, 1 - t / duration);
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (t < duration) {
      frame = window.requestAnimationFrame(tick);
    } else {
      canvas.remove();
    }
  };

  frame = window.requestAnimationFrame(tick);
  window.setTimeout(() => {
    window.cancelAnimationFrame(frame);
    canvas.remove();
  }, duration + 200);
}
