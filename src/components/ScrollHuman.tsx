import { useEffect, useRef, useState } from "react";
import "./styles/ScrollHuman.css";

/**
 * ScrollHuman
 *
 * A tall, full-body character resembling Gopichandh (dark hair + beard, glasses,
 * teal hoodie) who WALKS DOWN the left margin of the page in lock-step with
 * the visitor's scroll — exactly like the reference portfolio where the 3D
 * person moves with the scroll.
 *
 * • Vertical position is driven by scroll progress (0 → 1) so he descends the
 *   page alongside the reader, then rides back up when they scroll up.
 * • His legs actually stride while scrolling (walk cycle) and settle to an
 *   idle stance when the page is still.
 * • He faces the direction of travel and a small caption narrates the section.
 * • Lives on a fixed layer in the LEFT gutter with pointer-events:none, so he
 *   never blocks any text, control or image — he keeps to the empty margin.
 *
 * Pure SVG + CSS (no model files) → fast, Safari-safe. Hidden on touch / small
 * screens and when the visitor prefers reduced motion.
 */

type Mood = "wave" | "walk" | "point" | "mail" | "idle";

const CAPTIONS: Record<Mood, string> = {
  wave: "Hi! I'm Gopichandh — walk with me 👋",
  idle: "Take your time… I'm right here.",
  walk: "Let's explore the page →",
  point: "Here's a bit of my work →",
  mail: "Let's connect — say hello ✉️",
};

const isEnabled = () =>
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
  window.innerWidth > 1024;

const ScrollHuman = () => {
  const [enabled, setEnabled] = useState(isEnabled);
  const [mood, setMood] = useState<Mood>("wave");
  const [walking, setWalking] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1); // 1 = descending (face down/forward)

  const wrapRef = useRef<HTMLDivElement>(null);
  const moodRef = useRef<Mood>("wave");
  moodRef.current = mood;

  useEffect(() => {
    const onResize = () => setEnabled(isEnabled());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const content = document.getElementById("smooth-content");
    let lastProgress = 0;
    let stopTimer: number | undefined;
    let raf = 0;

    // Section → mood map (which section owns the viewport middle)
    const map: { id: string; mood: Mood }[] = [
      { id: "contact", mood: "mail" },
      { id: "work", mood: "point" },
    ];

    const readProgress = (): number => {
      // Prefer the GSAP ScrollSmoother transform on #smooth-content; fall back
      // to window scroll. Returns 0..1 across the full scrollable height.
      const docH = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      if (content) {
        const style = getComputedStyle(content).transform;
        if (style && style !== "none") {
          try {
            const m = new DOMMatrixReadOnly(style);
            return Math.min(1, Math.max(0, -m.m42 / docH));
          } catch {
            /* ignore */
          }
        }
      }
      return Math.min(1, Math.max(0, window.scrollY / docH));
    };

    const computeMood = (p: number): Mood => {
      if (p < 0.04) return "wave";
      const mid = window.innerHeight / 2;
      for (const { id, mood: m } of map) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top < mid && r.bottom > mid) return m;
      }
      return "walk";
    };

    const tick = () => {
      const p = readProgress();
      const delta = p - lastProgress;

      // Position: the figure descends across a comfortable vertical range so
      // he stays fully on-screen (never clipped top/bottom). He tracks scroll.
      const top = 8 + p * 74; // vh — from near the top to lower third
      if (wrapRef.current) {
        wrapRef.current.style.top = top + "vh";
      }

      // Walk / face direction based on scroll motion
      if (Math.abs(delta) > 0.0004) {
        setWalking(true);
        setDir(delta > 0 ? 1 : -1);
        window.clearTimeout(stopTimer);
        stopTimer = window.setTimeout(() => setWalking(false), 220);
      }

      // Mood by section (idle when parked at a section a while is handled by
      // the walking flag; here we set the semantic pose)
      const nextMood = computeMood(p);
      if (nextMood !== moodRef.current) setMood(nextMood);

      lastProgress = p;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(stopTimer);
    };
  }, [enabled]);

  if (!enabled) return null;

  // Effective pose: while actively scrolling he walks, otherwise he holds the
  // semantic pose for the current section (wave/point/mail) or idles.
  const pose: Mood = walking
    ? "walk"
    : mood === "walk"
    ? "idle"
    : mood;

  return (
    <div
      className="vm-human"
      ref={wrapRef}
      data-pose={pose}
      data-dir={dir === 1 ? "down" : "up"}
      aria-hidden="true"
    >
      <div className="vm-human-caption" key={mood}>
        {CAPTIONS[mood]}
      </div>

      <svg
        className="vm-human-svg"
        viewBox="0 0 120 300"
        width="120"
        height="300"
        role="img"
      >
        {/* soft moving ground shadow */}
        <ellipse cx="60" cy="292" rx="34" ry="7" className="vmh-shadow" />

        {/* ================= LEGS (walk cycle) ================= */}
        <g className="vmh-leg vmh-leg-back">
          <rect x="54" y="196" width="15" height="58" rx="7" className="vmh-pants" />
          <rect x="52" y="248" width="22" height="12" rx="5" className="vmh-shoe" />
        </g>
        <g className="vmh-leg vmh-leg-front">
          <rect x="51" y="196" width="15" height="58" rx="7" className="vmh-pants" />
          <rect x="47" y="248" width="22" height="12" rx="5" className="vmh-shoe" />
        </g>

        {/* ================= BODY ================= */}
        <g className="vmh-body">
          {/* hoodie torso */}
          <path
            d="M42 120 Q40 108 60 106 Q80 108 78 120 L82 196 Q60 204 38 196 Z"
            className="vmh-hoodie"
          />
          {/* hoodie centre zip + pocket seam */}
          <line x1="60" y1="112" x2="60" y2="190" className="vmh-zip" />
          <path d="M48 176 Q60 184 72 176" className="vmh-pocket" />
          {/* hood collar */}
          <path d="M50 112 Q60 124 70 112 L74 120 Q60 132 46 120 Z" className="vmh-hood" />

          {/* ===== ARMS (swing with the walk) ===== */}
          <g className="vmh-arm vmh-arm-back">
            <rect x="34" y="122" width="13" height="54" rx="6.5" className="vmh-hoodie" />
            <circle cx="40" cy="176" r="6" className="vmh-skin" />
          </g>
          <g className="vmh-arm vmh-arm-front">
            <rect x="73" y="122" width="13" height="54" rx="6.5" className="vmh-hoodie" />
            <circle cx="80" cy="176" r="6" className="vmh-skin" />
          </g>

          {/* waving forearm (Landing) */}
          <g className="vmh-wave">
            <rect x="76" y="88" width="11" height="40" rx="5.5" className="vmh-hoodie" />
            <circle cx="82" cy="86" r="7" className="vmh-skin" />
          </g>

          {/* pointing arm (Work) */}
          <g className="vmh-point">
            <rect x="74" y="132" width="34" height="12" rx="6" className="vmh-hoodie" />
            <circle cx="110" cy="138" r="6" className="vmh-skin" />
          </g>
        </g>

        {/* ================= HEAD ================= */}
        <g className="vmh-head">
          {/* neck */}
          <rect x="53" y="92" width="14" height="18" rx="6" className="vmh-skin" />
          {/* face */}
          <rect x="44" y="52" width="32" height="42" rx="15" className="vmh-skin" />
          {/* ears */}
          <circle cx="44" cy="74" r="4.5" className="vmh-skin" />
          <circle cx="76" cy="74" r="4.5" className="vmh-skin" />
          {/* hair (dark, short) */}
          <path
            d="M42 66 Q40 40 60 40 Q80 40 78 66 Q71 52 60 52 Q49 52 42 66 Z"
            className="vmh-hair"
          />
          {/* eyebrows */}
          <rect x="49" y="66" width="9" height="2.4" rx="1.2" className="vmh-brow" />
          <rect x="62" y="66" width="9" height="2.4" rx="1.2" className="vmh-brow" />
          {/* eyes */}
          <circle cx="53" cy="72" r="2.2" className="vmh-eye" />
          <circle cx="67" cy="72" r="2.2" className="vmh-eye" />
          {/* glasses */}
          <g className="vmh-glasses">
            <circle cx="53" cy="72" r="6" />
            <circle cx="67" cy="72" r="6" />
            <line x1="59" y1="72" x2="61" y2="72" />
          </g>
          {/* smile */}
          <path d="M54 82 Q60 86 66 82" className="vmh-mouth" />
          {/* beard */}
          <path
            d="M44 78 Q46 96 60 96 Q74 96 76 78 Q69 88 60 88 Q51 88 44 78 Z"
            className="vmh-beard"
          />
        </g>

        {/* envelope that flies off on the Contact section */}
        <g className="vmh-envelope">
          <rect x="82" y="120" width="24" height="17" rx="2" />
          <path d="M82 121 L94 130 L106 121" className="vmh-envelope-flap" />
        </g>
      </svg>
    </div>
  );
};

export default ScrollHuman;
