import { useEffect, useRef } from "react";
import "./styles/ResumeBalls.css";

/**
 * ResumeBalls
 *
 * A light, playful physics layer that lives in the side gutters of the
 * résumé overlay. A handful of glowing balls bounce around the edges of the
 * screen; moving the cursor near them nudges them away and clicking gives
 * the nearest ball a kick — a small bit of interactive fun to enjoy while
 * reading the résumé. It sits *behind* the résumé modal, so it never blocks
 * the document itself; only the empty side areas are interactive.
 *
 * Pure 2D canvas, respects prefers-reduced-motion.
 */

type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number;
};

const ResumeBalls = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    const mouse = { x: -9999, y: -9999, down: false };
    let balls: Ball[] = [];

    const seed = () => {
      const count = 7;
      balls = [];
      for (let i = 0; i < count; i++) {
        const r = 12 + Math.random() * 16;
        // Bias initial positions to the left/right gutters.
        const left = Math.random() > 0.5;
        const x = left
          ? Math.random() * Math.max(80, w * 0.16)
          : w - Math.random() * Math.max(80, w * 0.16);
        balls.push({
          x,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          r,
          hue: 165 + Math.random() * 40,
        });
      }
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const step = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];

        // Cursor interaction: nudge away; click gives a stronger kick.
        const dx = b.x - mouse.x;
        const dy = b.y - mouse.y;
        const d = Math.hypot(dx, dy);
        const reach = mouse.down ? 220 : 150;
        if (d < reach && d > 0.01) {
          const force = ((reach - d) / reach) * (mouse.down ? 2.4 : 0.9);
          b.vx += (dx / d) * force;
          b.vy += (dy / d) * force;
        }

        // gravity-lite + integrate
        b.vy += 0.05;
        b.x += b.vx;
        b.y += b.vy;

        // friction / speed cap
        b.vx *= 0.992;
        b.vy *= 0.992;
        const sp = Math.hypot(b.vx, b.vy);
        const max = 9;
        if (sp > max) {
          b.vx = (b.vx / sp) * max;
          b.vy = (b.vy / sp) * max;
        }

        // walls
        if (b.x - b.r < 0) {
          b.x = b.r;
          b.vx = Math.abs(b.vx) * 0.9;
        } else if (b.x + b.r > w) {
          b.x = w - b.r;
          b.vx = -Math.abs(b.vx) * 0.9;
        }
        if (b.y - b.r < 0) {
          b.y = b.r;
          b.vy = Math.abs(b.vy) * 0.9;
        } else if (b.y + b.r > h) {
          b.y = h - b.r;
          b.vy = -Math.abs(b.vy) * 0.82;
        }

        // ball-ball collisions (simple elastic)
        for (let j = i + 1; j < balls.length; j++) {
          const o = balls[j];
          const nx = o.x - b.x;
          const ny = o.y - b.y;
          const dist = Math.hypot(nx, ny);
          const min = b.r + o.r;
          if (dist > 0 && dist < min) {
            const overlap = (min - dist) / 2;
            const ux = nx / dist;
            const uy = ny / dist;
            b.x -= ux * overlap;
            b.y -= uy * overlap;
            o.x += ux * overlap;
            o.y += uy * overlap;
            const bv = b.vx * ux + b.vy * uy;
            const ov = o.vx * ux + o.vy * uy;
            const diff = ov - bv;
            b.vx += diff * ux;
            b.vy += diff * uy;
            o.vx -= diff * ux;
            o.vy -= diff * uy;
          }
        }

        // draw glowing ball
        const grad = ctx.createRadialGradient(
          b.x - b.r * 0.3,
          b.y - b.r * 0.3,
          b.r * 0.2,
          b.x,
          b.y,
          b.r
        );
        grad.addColorStop(0, `hsla(${b.hue}, 95%, 80%, 0.98)`);
        grad.addColorStop(1, `hsla(${b.hue}, 90%, 55%, 0.65)`);
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.shadowColor = `hsla(${b.hue}, 90%, 65%, 0.85)`;
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(step);
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onDown = () => (mouse.down = true);
    const onUp = () => (mouse.down = false);
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseout", onLeave);

    if (reduced) {
      step();
      cancelAnimationFrame(raf);
    } else {
      step();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="resume-balls" aria-hidden="true" />;
};

export default ResumeBalls;
