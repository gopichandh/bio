import { useEffect, useRef } from "react";
import "./styles/Cursor.css";

/**
 * Custom laptop (MacBook) cursor.
 *  - A small laptop glyph follows the pointer with a subtle easing lag.
 *  - The hotspot (actual click point) is the tip of the glyph, so the icon
 *    sits just below-right of the true pointer and never covers small UI
 *    targets like the bottom-left social icons.
 *  - Scales up gently over interactive elements for feedback.
 *  - Disabled on touch / coarse pointers (native cursor is used there).
 */
const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const el = cursorRef.current!;
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { x: mouse.x, y: mouse.y };
    let raf = 0;
    let visible = false;

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!visible) {
        visible = true;
        el.classList.add("cursor-visible");
      }
    };

    const loop = () => {
      // Light easing so the laptop trails the pointer smoothly
      pos.x += (mouse.x - pos.x) * 0.22;
      pos.y += (mouse.y - pos.y) * 0.22;
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    loop();

    const onLeave = () => {
      el.classList.remove("cursor-visible");
      visible = false;
    };
    const onDown = () => el.classList.add("cursor-down");
    const onUp = () => el.classList.remove("cursor-down");

    const interactiveSelector =
      "a, button, input, textarea, [data-cursor], .tech-card, .what-content";
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(interactiveSelector)) el.classList.add("cursor-hover");
    };
    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(interactiveSelector))
        el.classList.remove("cursor-hover");
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <div className="cursor-laptop" ref={cursorRef} aria-hidden="true">
      {/* Halo ring so the cursor is easy to spot on the dark page */}
      <span className="cursor-ring" />
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Screen */}
        <rect
          x="4"
          y="4"
          width="16"
          height="10.5"
          rx="1.4"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="rgba(94,234,212,0.10)"
        />
        {/* Base / keyboard deck */}
        <path
          d="M2 18.2h20l-1.2 1.9a1.6 1.6 0 0 1-1.35.75H4.55A1.6 1.6 0 0 1 3.2 20.1L2 18.2Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default Cursor;
