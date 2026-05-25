import { useRef, useEffect } from "react";

const PARTICLE_COLOR = "#FE932C";
const PARTICLE_SPEED = 0.6;
const PARTICLE_COUNT = 150;
const PARTICLE_TRAIL = 0.18;

function makeParticle(getWidth, getHeight, getMouse) {
  const p = { x: 0, y: 0, vx: 0, vy: 0, age: 0, life: 0 };
  const reset = () => {
    p.x = Math.random() * getWidth();
    p.y = Math.random() * getHeight();
    p.vx = 0;
    p.vy = 0;
    p.age = 0;
    p.life = Math.random() * 200 + 100;
  };
  reset();
  p.update = () => {
    const w = getWidth(),
      h = getHeight();
    const mouse = getMouse();
    const angle = (Math.cos(p.x * 0.005) + Math.sin(p.y * 0.005)) * Math.PI;
    p.vx += Math.cos(angle) * 0.2 * PARTICLE_SPEED;
    p.vy += Math.sin(angle) * 0.2 * PARTICLE_SPEED;
    const dx = mouse.x - p.x,
      dy = mouse.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 150) {
      const f = (150 - dist) / 150;
      p.vx -= dx * f * 0.05;
      p.vy -= dy * f * 0.05;
    }
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.95;
    p.vy *= 0.95;
    p.age++;
    if (p.age > p.life) reset();
    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;
  };
  p.draw = (ctx) => {
    const alpha = 1 - Math.abs(p.age / p.life - 0.5) * 2;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = PARTICLE_COLOR;
    ctx.fillRect(p.x, p.y, 1.5, 1.5);
  };
  return p;
}

/**
 * NeuralCanvas — canvas particles orange + mouse interaction.
 * Doit être placé dans un parent `position: relative`.
 * Adapté à la taille du parent automatiquement.
 */
export default function NeuralCanvas({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    let width = container.clientWidth;
    let height = container.clientHeight;
    let particles = [];
    let rafId;
    const mouse = { x: -1000, y: -1000 };

    const getWidth = () => width;
    const getHeight = () => height;
    const getMouse = () => mouse;

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      particles = Array.from({ length: PARTICLE_COUNT }, () =>
        makeParticle(getWidth, getHeight, getMouse),
      );
    };

    let lastFrame = 0;
    const FRAME_INTERVAL = 1000 / 60;

    const animate = (timestamp) => {
      rafId = requestAnimationFrame(animate);
      if (timestamp - lastFrame < FRAME_INTERVAL) return;
      lastFrame = timestamp;
      if (document.hidden) return;
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgba(0,0,0,${PARTICLE_TRAIL})`;
      ctx.fillRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
    };

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        width = container.clientWidth;
        height = container.clientHeight;
        init();
      }, 150);
    };

    let lastMouseMove = 0;
    const onMove = (e) => {
      const now = Date.now();
      if (now - lastMouseMove < 32) return;
      lastMouseMove = now;
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    init();
    rafId = requestAnimationFrame(animate);
    window.addEventListener("resize", onResize, { passive: true });
    container.addEventListener("mousemove", onMove, { passive: true });
    container.addEventListener("mouseleave", onLeave, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-80 ${className}`}
    />
  );
}
