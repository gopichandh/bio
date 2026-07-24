import { useEffect, useRef } from "react";
import "./styles/NetworkTopology.css";

/**
 * NetworkTopology — a self-contained, animated infrastructure graph.
 * Nodes represent routers / switches / servers laid out in tiers, connected
 * by edges. "Data packets" travel along the edges and nodes pulse, so the
 * topology reads as a living network. Pure 2D canvas; interactive on hover.
 */

type Tier = "router" | "switch" | "server";
type GNode = {
  x: number;
  y: number;
  r: number;
  tier: Tier;
  label: string;
  seed: number;
};
type Edge = { a: number; b: number };
type Packet = { edge: number; t: number; speed: number };

const COLORS: Record<Tier, string> = {
  router: "#a78bfa",
  switch: "#60a5fa",
  server: "#34d399",
};

const NetworkTopology = () => {
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
    let nodes: GNode[] = [];
    let edges: Edge[] = [];
    let packets: Packet[] = [];
    let raf = 0;
    const mouse = { x: -9999, y: -9999 };

    const build = () => {
      nodes = [];
      edges = [];
      packets = [];

      const cx = w / 2;
      // Tier 1: single core router (top)
      nodes.push({ x: cx, y: h * 0.16, r: 15, tier: "router", label: "core-rtr", seed: 0 });

      // Tier 2: switches
      const switchCount = 3;
      const swIdx: number[] = [];
      for (let i = 0; i < switchCount; i++) {
        const x = w * (0.25 + (i * 0.5) / (switchCount - 1));
        nodes.push({
          x,
          y: h * 0.45,
          r: 11,
          tier: "switch",
          label: `sw-${i + 1}`,
          seed: i + 1,
        });
        swIdx.push(nodes.length - 1);
        edges.push({ a: 0, b: nodes.length - 1 });
      }

      // Tier 3: servers under each switch
      swIdx.forEach((si, s) => {
        const perSwitch = 2 + (s % 2);
        for (let j = 0; j < perSwitch; j++) {
          const spread = (j - (perSwitch - 1) / 2) * (w * 0.09);
          const x = nodes[si].x + spread;
          nodes.push({
            x,
            y: h * 0.8,
            r: 8,
            tier: "server",
            label: `srv-${s + 1}${j + 1}`,
            seed: s * 3 + j,
          });
          edges.push({ a: si, b: nodes.length - 1 });
        }
      });

      // Seed packets on every edge
      edges.forEach((_, i) => {
        packets.push({
          edge: i,
          t: Math.random(),
          speed: 0.004 + Math.random() * 0.006,
        });
      });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const drawNodeIcon = (n: GNode, glow: number) => {
      const color = COLORS[n.tier];
      ctx.save();
      ctx.translate(n.x, n.y);

      // halo
      ctx.beginPath();
      ctx.arc(0, 0, n.r + 6 + glow * 4, 0, Math.PI * 2);
      ctx.fillStyle = `${color}22`;
      ctx.fill();

      // body
      ctx.beginPath();
      if (n.tier === "server") {
        ctx.rect(-n.r, -n.r * 0.8, n.r * 2, n.r * 1.6);
      } else {
        ctx.arc(0, 0, n.r, 0, Math.PI * 2);
      }
      ctx.fillStyle = "#0b1018";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8 + glow * 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // center dot
      ctx.beginPath();
      ctx.arc(0, 0, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.restore();

      // label
      ctx.fillStyle = "rgba(148,163,184,0.85)";
      ctx.font = "10px 'SF Mono', ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(n.label, n.x, n.y + n.r + 15);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // edges
      for (let i = 0; i < edges.length; i++) {
        const a = nodes[edges[i].a];
        const b = nodes[edges[i].b];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = "rgba(94, 234, 212, 0.18)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // packets
      for (let i = 0; i < packets.length; i++) {
        const p = packets[i];
        const e = edges[p.edge];
        const a = nodes[e.a];
        const b = nodes[e.b];
        p.t += p.speed;
        if (p.t > 1) p.t -= 1;
        const px = a.x + (b.x - a.x) * p.t;
        const py = a.y + (b.y - a.y) * p.t;
        ctx.beginPath();
        ctx.arc(px, py, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(170, 90%, 70%, 0.95)";
        ctx.shadowColor = "hsla(170, 90%, 70%, 0.9)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // nodes
      const t = Date.now() / 1000;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const dist = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        const near = Math.max(0, 1 - dist / 90);
        const pulse = (Math.sin(t * 2 + n.seed) + 1) / 2;
        drawNodeIcon(n, near * 0.6 + pulse * 0.4);
      }

      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    if (reduced) {
      draw();
      cancelAnimationFrame(raf);
    } else {
      draw();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="net-topology">
      <div className="net-legend">
        <span className="net-legend-item router">router</span>
        <span className="net-legend-item switch">switch</span>
        <span className="net-legend-item server">server</span>
      </div>
      <canvas ref={canvasRef} className="net-canvas" />
    </div>
  );
};

export default NetworkTopology;
