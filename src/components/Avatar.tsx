import { useEffect, useRef, useState } from "react";
import "./styles/Avatar.css";

/**
 * Avatar
 *
 * A lively little developer character resembling Gopichandh (dark hair + beard,
 * teal hoodie) seated at a glowing laptop. It lives on a fixed, compact stage
 * in the LOWER-LEFT corner — the opposite side from the RoamingBot — with
 * pointer-events:none so it never blocks any text or controls.
 *
 * As the visitor scrolls, the character performs an action relevant to the
 * section currently in view, and a small caption narrates what "Gopichandh" is
 * doing:
 *   • Landing  → waves hello
 *   • About    → sips coffee while you read his story
 *   • Tech     → types / builds the stack
 *   • Career   → reviews the timeline (coffee)
 *   • What I Do→ types on the laptop (writing reliable systems)
 *   • Work     → presents his projects (points to the carousel)
 *   • Contact  → sends you a message (an envelope flies off)
 *
 * Pure SVG + CSS animation (no model files) → fast and Safari-safe. Hidden on
 * touch/small screens and when the visitor prefers reduced motion.
 */

type Action = "wave" | "coffee" | "type" | "present" | "mail";

const CAPTIONS: Record<Action, string> = {
  wave: "Hey! Welcome — I'm Gopichandh 👋",
  coffee: "Reading along with you… ☕",
  type: "Writing reliable, self-healing systems ⌨️",
  present: "These are a few things I've built →",
  mail: "Drop a message — it lands in my inbox ✉️",
};

const isEnabled = () =>
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
  window.innerWidth > 1024;

const Avatar = () => {
  const [enabled, setEnabled] = useState(isEnabled);
  const [action, setAction] = useState<Action>("wave");
  const actionRef = useRef<Action>("wave");
  actionRef.current = action;

  // Re-evaluate the desktop / reduced-motion gate whenever the window resizes,
  // so the avatar appears or hides as the viewport crosses the breakpoint.
  useEffect(() => {
    const onResize = () => setEnabled(isEnabled());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Decide the current action from whichever section owns the viewport middle.
  useEffect(() => {
    if (!enabled) return;

    const map: { id: string; action: Action }[] = [
      { id: "contact", action: "mail" },
      { id: "work", action: "present" },
      { id: "whatido", action: "type" },
      { id: "career", action: "coffee" },
      { id: "techstack", action: "type" },
      { id: "about", action: "coffee" },
    ];

    const compute = () => {
      const mid = window.innerHeight / 2;
      let next: Action = "wave"; // default at the very top (Landing)
      for (const { id, action: a } of map) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top < mid && r.bottom > mid) {
          next = a;
          break;
        }
      }
      if (next !== actionRef.current) setAction(next);
    };

    compute();
    const poll = window.setInterval(compute, 350);
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.clearInterval(poll);
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="vm-avatar" data-action={action} aria-hidden="true">
      <div className="vm-avatar-caption" key={action}>
        {CAPTIONS[action]}
      </div>

      <svg
        className="vm-avatar-svg"
        viewBox="0 0 200 200"
        width="180"
        height="180"
        role="img"
      >
        {/* soft ground shadow */}
        <ellipse cx="100" cy="182" rx="62" ry="9" className="vm-shadow" />

        {/* ---- Desk + laptop ---- */}
        <g className="vm-desk">
          <rect x="34" y="150" width="132" height="8" rx="4" className="vm-desk-top" />
          {/* laptop base */}
          <rect x="70" y="140" width="60" height="10" rx="2" className="vm-laptop-base" />
          {/* laptop screen */}
          <rect x="74" y="108" width="52" height="34" rx="3" className="vm-laptop-screen" />
          <rect x="78" y="112" width="44" height="26" rx="2" className="vm-laptop-glow" />
          {/* code lines on screen */}
          <g className="vm-code">
            <rect x="82" y="117" width="20" height="2.4" rx="1.2" />
            <rect x="82" y="122" width="30" height="2.4" rx="1.2" />
            <rect x="82" y="127" width="16" height="2.4" rx="1.2" />
            <rect x="82" y="132" width="26" height="2.4" rx="1.2" />
          </g>
        </g>

        {/* ---- Chair back ---- */}
        <rect x="86" y="96" width="46" height="60" rx="12" className="vm-chair" />

        {/* ---- Person ---- */}
        <g className="vm-person">
          {/* torso / hoodie */}
          <path
            d="M74 156 Q74 118 100 116 Q126 118 126 156 Z"
            className="vm-torso"
          />
          {/* hoodie collar */}
          <path d="M90 120 Q100 130 110 120" className="vm-collar" />

          {/* neck */}
          <rect x="94" y="96" width="12" height="16" rx="5" className="vm-skin" />

          {/* head group (bobs / tilts) */}
          <g className="vm-head">
            {/* face */}
            <rect x="84" y="66" width="32" height="36" rx="14" className="vm-skin" />
            {/* ears */}
            <circle cx="84" cy="86" r="4" className="vm-skin" />
            <circle cx="116" cy="86" r="4" className="vm-skin" />
            {/* hair (dark, short) */}
            <path
              d="M82 82 Q80 58 100 58 Q120 58 118 82 Q112 70 100 70 Q88 70 82 82 Z"
              className="vm-hair"
            />
            {/* eyebrows */}
            <rect x="89" y="80" width="8" height="2.2" rx="1.1" className="vm-brow" />
            <rect x="103" y="80" width="8" height="2.2" rx="1.1" className="vm-brow" />
            {/* eyes */}
            <circle cx="93" cy="85" r="2.1" className="vm-eye" />
            <circle cx="107" cy="85" r="2.1" className="vm-eye" />
            {/* glasses */}
            <g className="vm-glasses">
              <circle cx="93" cy="85" r="5" />
              <circle cx="107" cy="85" r="5" />
              <line x1="98" y1="85" x2="102" y2="85" />
            </g>
            {/* smile */}
            <path d="M94 93 Q100 97 106 93" className="vm-mouth" />
            {/* beard */}
            <path
              d="M84 90 Q86 104 100 104 Q114 104 116 90 Q110 98 100 98 Q90 98 84 90 Z"
              className="vm-beard"
            />
          </g>

          {/* left upper arm + typing forearm */}
          <g className="vm-arm vm-arm-l">
            <rect x="78" y="122" width="10" height="24" rx="5" className="vm-torso" />
            <g className="vm-forearm vm-forearm-l">
              <rect x="78" y="140" width="10" height="18" rx="5" className="vm-torso" />
              <circle cx="83" cy="150" r="5" className="vm-skin" />
            </g>
          </g>

          {/* right upper arm + typing forearm */}
          <g className="vm-arm vm-arm-r">
            <rect x="112" y="122" width="10" height="24" rx="5" className="vm-torso" />
            <g className="vm-forearm vm-forearm-r">
              <rect x="112" y="140" width="10" height="18" rx="5" className="vm-torso" />
              <circle cx="117" cy="150" r="5" className="vm-skin" />
            </g>
          </g>

          {/* waving hand (only visible during the wave action) */}
          <g className="vm-wave-arm">
            <rect x="118" y="98" width="9" height="26" rx="4.5" className="vm-torso" />
            <circle cx="122" cy="96" r="6" className="vm-skin" />
          </g>

          {/* coffee mug (raised while reading) */}
          <g className="vm-coffee">
            <rect x="118" y="118" width="9" height="24" rx="4.5" className="vm-torso" />
            <g className="vm-mug">
              <rect x="112" y="104" width="16" height="14" rx="2" />
              <path d="M128 107 q6 0 6 5 t-6 5" className="vm-mug-handle" />
              <path d="M116 100 q2 -4 4 0" className="vm-steam" />
              <path d="M122 100 q2 -4 4 0" className="vm-steam vm-steam-2" />
            </g>
          </g>

          {/* pointing arm (present projects → to the right) */}
          <g className="vm-point-arm">
            <rect x="118" y="126" width="26" height="9" rx="4.5" className="vm-torso" />
            <circle cx="146" cy="130" r="5" className="vm-skin" />
          </g>
        </g>

        {/* envelope that flies off toward the inbox on the Contact section */}
        <g className="vm-envelope">
          <rect x="132" y="120" width="26" height="18" rx="2" />
          <path d="M132 121 L145 131 L158 121" className="vm-envelope-flap" />
        </g>
      </svg>
    </div>
  );
};

export default Avatar;
