import { useEffect, useRef } from "react";
import "./styles/CableTrail.css";

/**
 * CableTrail
 *
 * Draws a glowing "network cable" that trails the cursor. We keep a short
 * history of pointer positions and render a smoothed, tapering teal line with
 * a soft glow — as if the visitor is dragging a patch cable across the page.
 * Pure canvas + mousemove; disabled on coarse pointers and reduced motion.
 */
const CableTrail = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;

    const points: { x: number; y: number }[] = [];
    const MAX = 22;
    const target = { x: -9999, y: -9999 };
    let has = false;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      has = true;
    };
    const onLeave = () => {
      has = false;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      if (has) {
        const last = points[points.length - 1];
        if (!last) {
          points.push({ x: target.x, y: target.y });
        } else {
          // ease the head toward the cursor so the cable lags like real cable
          const nx = last.x + (target.x - last.x) * 0.35;
          const ny = last.y + (target.y - last.y) * 0.35;
          points.push({ x: nx, y: ny });
        }
        while (points.length > MAX) points.shift();
      } else if (points.length) {
        points.shift();
      }

      if (points.length > 1) {
        for (let i = 1; i < points.length; i++) {
          const p0 = points[i - 1];
          const p1 = points[i];
          const t = i / points.length;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.strokeStyle = `rgba(94, 234, 212, ${t * 0.9})`;
          ctx.lineWidth = t * 5;
          ctx.lineCap = "round";
          ctx.shadowColor = "rgba(94, 234, 212, 0.8)";
          ctx.shadowBlur = 8 * t;
          ctx.stroke();
        }
        // connector "plug" at the head
        const head = points[points.length - 1];
        ctx.beginPath();
        ctx.arc(head.x, head.y, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(120, 245, 225, 0.95)";
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="cable-trail" aria-hidden="true" />;
};

export default CableTrail;
