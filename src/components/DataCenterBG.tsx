import { useEffect, useRef } from "react";
import "./styles/DataCenterBG.css";

/**
 * DataCenterBG
 *
 * A real server-hall photograph (public/images/datacenter.jpeg) forms the
 * backdrop — two receding rows of blue-lit racks running to a vanishing point.
 * On top of it a transparent canvas renders two subtle, production-grade
 * layers:
 *
 *   • A DIM "Matrix"-style rain of binary digits (0/1) streaming quietly down
 *     the background. Columns occasionally "fail" — flickering amber/red for a
 *     moment like a corrupted data stream — then recover. It is kept very low
 *     in opacity so it reads as atmosphere and never overshadows the profile,
 *     headings or copy in front of it.
 *   • The CI/CD pipeline (BUILD → TEST → DEPLOY → LIVE) is rendered as a tidy
 *     centred status strip near the top of the first viewport, fading out on
 *     scroll so it never overlaps the section content below.
 *
 * Pure 2D canvas (fast, Safari-safe) and respects prefers-reduced-motion.
 */

const STAGES = ["BUILD", "TEST", "DEPLOY", "LIVE"];

const DataCenterBG = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let t = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildColumns();
    };

    /* -------------------- Matrix-style binary rain --------------------------
       A grid of vertical columns of 0/1 glyphs that stream downward. Each
       column has a bright "head" glyph and a fading trail behind it, giving
       the classic digital-rain look — but rendered DIM (low alpha, teal tint)
       so it stays an atmospheric backdrop and never competes with the content.

       Occasionally a column "fails": it flips to an amber/red tint and its
       glyphs flicker erratically for a short while (like a corrupted data
       stream) before recovering to the normal teal — a subtle nod to the
       real-world reliability work behind the site. */
    const FONT = 15; // glyph cell size (px)
    const GLYPHS = "01";
    type Col = {
      x: number; // pixel x of the column
      head: number; // current head row (fractional)
      speed: number; // rows per second
      trail: number; // trail length in rows
      chars: string[]; // per-row glyphs (mutated occasionally for flicker)
      failT: number; // remaining seconds of "fail" state (0 = healthy)
      failCd: number; // seconds until this column may fail again
    };
    let cols: Col[] = [];
    let rows = 0;

    const buildColumns = () => {
      const count = Math.ceil(w / FONT);
      rows = Math.ceil(h / FONT) + 1;
      cols = [];
      for (let i = 0; i < count; i++) {
        const chars: string[] = [];
        for (let r = 0; r < rows; r++)
          chars.push(GLYPHS[(Math.random() * GLYPHS.length) | 0]);
        cols.push({
          x: i * FONT + FONT * 0.5,
          head: Math.random() * rows,
          speed: 3 + Math.random() * 6, // rows per second (gentle)
          trail: 8 + Math.floor(Math.random() * 14),
          chars,
          failT: 0,
          failCd: 4 + Math.random() * 16,
        });
      }
    };

    const drawMatrix = (dt: number) => {
      ctx.save();
      ctx.font = `${FONT - 2}px "SFMono-Regular", ui-monospace, Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const c of cols) {
        // Fail-state bookkeeping: healthy columns count down to a glitch, then
        // spend a short spell "failing" before recovering.
        if (c.failT > 0) {
          c.failT -= dt;
        } else {
          c.failCd -= dt;
          if (c.failCd <= 0) {
            c.failT = 0.5 + Math.random() * 1.1; // glitch duration
            c.failCd = 8 + Math.random() * 22; // time until it may fail again
          }
        }
        const failing = c.failT > 0;

        // advance the head
        c.head += c.speed * dt;
        if (c.head - c.trail > rows) {
          c.head = -Math.random() * rows * 0.5; // recycle from above
        }
        const headRow = Math.floor(c.head);

        // occasionally mutate a glyph so the stream shimmers; failing columns
        // flicker much more erratically.
        const mutateChance = failing ? 0.5 : 0.06;
        if (Math.random() < mutateChance) {
          const rr = (Math.random() * rows) | 0;
          c.chars[rr] = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }

        for (let k = 0; k < c.trail; k++) {
          const row = headRow - k;
          if (row < 0 || row >= rows) continue;
          const y = row * FONT + FONT * 0.5;
          const glyph = c.chars[row];
          // brightness falls off along the trail
          const falloff = 1 - k / c.trail;
          if (k === 0) {
            // bright head glyph
            if (failing) {
              ctx.fillStyle = `rgba(255,140,90,${0.5 + Math.random() * 0.3})`;
              ctx.shadowColor = "rgba(255,90,60,0.6)";
            } else {
              ctx.fillStyle = "rgba(180,255,240,0.55)";
              ctx.shadowColor = "rgba(94,234,212,0.5)";
            }
            ctx.shadowBlur = 6;
          } else {
            // DIM trail — very low alpha so it never overshadows content
            const base = failing ? "255,150,110" : "94,234,212";
            const a = (failing ? 0.16 : 0.14) * falloff * (failing ? (0.6 + Math.random() * 0.4) : 1);
            ctx.fillStyle = `rgba(${base},${a})`;
            ctx.shadowBlur = 0;
          }
          ctx.fillText(glyph, c.x, y);
        }
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    };

    /* -------- CI/CD pipeline: horizontal status bar along the BOTTOM --------
       Rendered as a tidy, centred horizontal rail pinned near the bottom edge
       of the viewport so it reads like a live build-status strip and never
       overlaps the hero name, headings or profile copy. */
    let blipP = 0;
    let blipDir = 1;
    const blipSpeed = 0.55;

    const roundRectPath = (
      x: number,
      y: number,
      rw: number,
      rh: number,
      rad: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + rad, y);
      ctx.arcTo(x + rw, y, x + rw, y + rh, rad);
      ctx.arcTo(x + rw, y + rh, x, y + rh, rad);
      ctx.arcTo(x, y + rh, x, y, rad);
      ctx.arcTo(x, y, x + rw, y, rad);
      ctx.closePath();
    };

    // Read the smoothed scroll offset (ScrollSmoother transforms
    // #smooth-content), so the pipeline can be pinned to the FIRST page and
    // fade away the moment the visitor scrolls into the content below.
    const readScroll = () => {
      const el = document.querySelector<HTMLElement>("#smooth-content");
      if (!el) return window.scrollY || 0;
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      return -m.m42;
    };

    const drawPipeline = (dt: number) => {
      // Fade the whole pipeline out across the first viewport of scroll so it
      // lives only at the top of the first page and never competes with the
      // section copy underneath.
      const scrollY = readScroll();
      const pipeAlpha = Math.max(0, Math.min(1, 1 - scrollY / (h * 0.6)));
      if (pipeAlpha <= 0.01) return;

      blipP += blipDir * blipSpeed * dt;
      if (blipP >= STAGES.length - 1) {
        blipP = STAGES.length - 1;
        blipDir = -1;
      } else if (blipP <= 0) {
        blipP = 0;
        blipDir = 1;
      }
      const activeStage = Math.round(blipP);

      // Layout: a horizontal rail inside a self-contained HUD panel pinned near
      // the TOP-centre of the first viewport. It fades out on scroll (pipeAlpha)
      // so it never collides with the page text below.
      ctx.save();
      ctx.globalAlpha = pipeAlpha;
      // Responsive sizing: on narrow (mobile) screens the strip must shrink to
      // sit fully inside the viewport with comfortable side margins, and drop
      // closer to the top since the header is more compact there.
      const isMobile = w < 600;
      const padX = isMobile ? 18 : 34;
      // Cap the span so the panel (span + 2*padX) always fits within the screen
      // with a healthy side margin on phones.
      const maxSpan = isMobile ? w - padX * 2 - 32 : 520;
      const span = Math.min(maxSpan, isMobile ? w * 0.72 : w * 0.5);
      const startX = w * 0.5 - span / 2;
      const gapX = span / (STAGES.length - 1);
      // Pushed clear of the top navigation bar so the pipeline never merges into
      // the menu; sits as a distinct, centred status strip below it.
      const railY = isMobile ? 120 : 168;
      const nodeX = (i: number) => startX + i * gapX;

      // --- Panel backdrop (separates the widget from text behind it) ---
      // Slightly more opaque + a brighter accent border so the widget reads
      // clearly as its own element rather than blending into the backdrop.
      const panelX = startX - padX;
      const panelW = span + padX * 2;
      const panelTop = railY - 44;
      const panelH = 70;
      ctx.save();
      roundRectPath(panelX, panelTop, panelW, panelH, 16);
      ctx.fillStyle = "rgba(6, 12, 20, 0.88)";
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 26;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = "rgba(94, 234, 212, 0.45)";
      ctx.stroke();
      ctx.restore();

      // connecting rail
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(94, 234, 212, 0.18)";
      ctx.beginPath();
      ctx.moveTo(nodeX(0), railY);
      ctx.lineTo(nodeX(STAGES.length - 1), railY);
      ctx.stroke();

      // completed portion of the rail glows
      const doneTo = nodeX(activeStage);
      ctx.strokeStyle = "rgba(94, 234, 212, 0.5)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(nodeX(0), railY);
      ctx.lineTo(doneTo, railY);
      ctx.stroke();

      for (let i = 0; i < STAGES.length; i++) {
        const x = nodeX(i);
        const done = i <= activeStage;
        const isActive = i === activeStage;
        const r = isActive ? 8 : 6;
        ctx.beginPath();
        ctx.arc(x, railY, r, 0, Math.PI * 2);
        ctx.fillStyle = done
          ? "rgba(94, 234, 212, 0.95)"
          : "rgba(120, 170, 190, 0.4)";
        if (isActive) {
          ctx.shadowColor = "rgba(94,234,212,0.9)";
          ctx.shadowBlur = 16;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = `600 11px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = isActive
          ? "rgba(180, 255, 245, 0.95)"
          : done
          ? "rgba(150, 220, 210, 0.7)"
          : "rgba(150, 200, 215, 0.45)";
        ctx.fillText(STAGES[i], x, railY - 12);
      }
      ctx.textBaseline = "alphabetic";

      // travelling blip between nodes
      const i0 = Math.floor(blipP);
      const i1 = Math.min(STAGES.length - 1, i0 + 1);
      const frac = blipP - i0;
      const bx = nodeX(i0) + (nodeX(i1) - nodeX(i0)) * frac;
      ctx.beginPath();
      ctx.arc(bx, railY, 5 * (1.6 + Math.sin(t * 8) * 0.3), 0, Math.PI * 2);
      ctx.fillStyle = "rgba(94, 234, 212, 0.18)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bx, railY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(180, 255, 245, 0.98)";
      ctx.shadowColor = "rgba(94,234,212,1)";
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;

      // small header label centred above the rail
      ctx.font = `700 10px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(94, 234, 212, 0.5)";
      ctx.fillText("CI / CD PIPELINE", w * 0.5, railY - 30);

      ctx.restore();
    };

    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;

      ctx.clearRect(0, 0, w, h);
      drawMatrix(dt);
      drawPipeline(dt);

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);

    if (reduced) {
      draw(performance.now());
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="datacenter-bg" aria-hidden="true">
      <div className="datacenter-photo" />
      <canvas ref={canvasRef} className="datacenter-canvas" />
    </div>
  );
};

export default DataCenterBG;
