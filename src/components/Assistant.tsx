import { useEffect, useRef, useState } from "react";
import "./styles/Assistant.css";

/**
 * Assistant
 *
 * A small, friendly "datacenter admin" mascot that guides the visitor
 * through the page. It is a lightweight animated SVG character (no WebGL /
 * Three.js, so it works everywhere including Safari) that:
 *   - Sits in the bottom-left corner, bobbing gently.
 *   - Watches the scroll position and, for whichever section is in view,
 *     shows a contextual speech bubble highlighting that section and telling
 *     the visitor where to go next (scroll down / swipe sideways).
 *   - Can be dismissed; clicking it again re-opens the tip.
 */

type Tip = {
  match: string; // element id to watch
  title: string;
  text: string;
  hint: "down" | "side" | "up" | "here";
};

const TIPS: Tip[] = [
  {
    match: "landingDiv",
    title: "Hi, I'm Bit 👋",
    text: "I'm Vilas's datacenter admin. I'll guide you around. Scroll down to meet him.",
    hint: "down",
  },
  {
    match: "about",
    title: "About Vilas",
    text: "13+ years keeping cloud platforms fast and always-on. Keep scrolling for his stack.",
    hint: "down",
  },
  {
    match: "techstack",
    title: "The Tech Stack",
    text: "Every tool Vilas runs in production — cloud, containers, CI/CD and observability.",
    hint: "down",
  },
  {
    match: "whatido",
    title: "What He Does",
    text: "His core focus areas, written up like a professional summary. Read the bullets!",
    hint: "down",
  },
  {
    match: "career",
    title: "Career Timeline",
    text: "Apple, Nike, Kohls, UnitedHealthcare — trace the journey down the timeline.",
    hint: "down",
  },
  {
    match: "work",
    title: "Selected Work",
    text: "Real projects he's shipped. Hover a card to peek inside.",
    hint: "down",
  },
  {
    match: "contact",
    title: "Let's Talk",
    text: "Send Vilas a message here — or grab the RESUME button on the left to unlock it.",
    hint: "here",
  },
];

const Assistant = () => {
  const [tipIndex, setTipIndex] = useState(0);
  const [open, setOpen] = useState(true);
  const ticking = useRef(false);

  useEffect(() => {
    const ids = TIPS.map((t) => t.match);

    const compute = () => {
      ticking.current = false;
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(center - mid);
        // Only consider sections that are at least partially on screen
        if (rect.bottom > 0 && rect.top < window.innerHeight && dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setTipIndex((prev) => {
        if (prev !== best) setOpen(true); // re-open bubble when section changes
        return best;
      });
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(compute);
      }
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // ScrollSmoother drives a transformed wrapper, so also poll lightly.
    const poll = window.setInterval(compute, 600);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearInterval(poll);
    };
  }, []);

  const tip = TIPS[tipIndex];

  return (
    <div className="assistant" aria-hidden="true">
      {open && (
        <div className={`assistant-bubble hint-${tip.hint}`} key={tipIndex}>
          <strong>{tip.title}</strong>
          <span>{tip.text}</span>
          <i className={`assistant-arrow arrow-${tip.hint}`}>
            {tip.hint === "down" && "▼"}
            {tip.hint === "up" && "▲"}
            {tip.hint === "side" && "▶"}
            {tip.hint === "here" && "●"}
          </i>
          <button
            className="assistant-dismiss"
            onClick={() => setOpen(false)}
            data-cursor="disable"
            aria-label="Dismiss tip"
          >
            ×
          </button>
        </div>
      )}

      <button
        className="assistant-avatar"
        onClick={() => setOpen((o) => !o)}
        data-cursor="disable"
        aria-label="Toggle guide"
      >
        {/* Datacenter-admin mascot: a little character with a headset,
            standing beside a server rack. Pure SVG so it stays crisp. */}
        <svg viewBox="0 0 88 100" width="72" height="82">
          {/* server rack behind */}
          <g className="assistant-rack">
            <rect x="58" y="20" width="26" height="66" rx="3"
              fill="#0c1524" stroke="#5eead4" strokeWidth="1.5" />
            <rect x="62" y="26" width="18" height="6" rx="1.5" fill="#123" stroke="#5eead4" strokeWidth="0.8" />
            <rect x="62" y="36" width="18" height="6" rx="1.5" fill="#123" stroke="#5eead4" strokeWidth="0.8" />
            <rect x="62" y="46" width="18" height="6" rx="1.5" fill="#123" stroke="#5eead4" strokeWidth="0.8" />
            <rect x="62" y="56" width="18" height="6" rx="1.5" fill="#123" stroke="#5eead4" strokeWidth="0.8" />
            <rect x="62" y="66" width="18" height="6" rx="1.5" fill="#123" stroke="#5eead4" strokeWidth="0.8" />
            <circle className="rack-led led-1" cx="76" cy="29" r="1.4" fill="#5eead4" />
            <circle className="rack-led led-2" cx="76" cy="49" r="1.4" fill="#5eead4" />
            <circle className="rack-led led-3" cx="76" cy="69" r="1.4" fill="#5eead4" />
          </g>

          {/* character */}
          <g className="assistant-body">
            {/* body / shirt */}
            <path d="M20 96c0-14 4-22 16-22s16 8 16 22z" fill="#1f2b45" stroke="#5eead4" strokeWidth="1.4" />
            {/* lanyard badge */}
            <rect x="33" y="74" width="6" height="9" rx="1" fill="#5eead4" />
            {/* head */}
            <circle cx="36" cy="58" r="14" fill="#e7c9a9" stroke="#5eead4" strokeWidth="1.2" />
            {/* hair */}
            <path d="M23 55c1-10 8-15 13-15s12 5 13 15c-4-5-9-6-13-6s-9 1-13 6z" fill="#2a2320" />
            {/* headset */}
            <path d="M22 57a14 14 0 0 1 28 0" fill="none" stroke="#5eead4" strokeWidth="2" />
            <rect x="19.5" y="55" width="5" height="8" rx="2" fill="#5eead4" />
            <rect x="47.5" y="55" width="5" height="8" rx="2" fill="#5eead4" />
            {/* mic */}
            <path d="M22 62c-3 3-3 7 6 8" fill="none" stroke="#5eead4" strokeWidth="1.6" />
            {/* eyes */}
            <circle className="eye" cx="31" cy="58" r="1.7" fill="#1a1a1a" />
            <circle className="eye" cx="41" cy="58" r="1.7" fill="#1a1a1a" />
            {/* smile */}
            <path d="M31 63q5 4 10 0" fill="none" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round" />
            {/* waving arm */}
            <g className="assistant-arm">
              <path d="M22 80c-6-3-10-9-11-16" fill="none" stroke="#1f2b45" strokeWidth="5" strokeLinecap="round" />
              <circle cx="10" cy="63" r="3.4" fill="#e7c9a9" stroke="#5eead4" strokeWidth="1" />
            </g>
          </g>
        </svg>
      </button>
    </div>
  );
};

export default Assistant;
