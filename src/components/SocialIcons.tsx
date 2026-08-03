import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import "./styles/SocialIcons.css";
import { TbNotes } from "react-icons/tb";
import { useEffect, useRef, useState } from "react";
import HoverLinks from "./HoverLinks";

const SocialIcons = () => {
  // Each time the visitor scrolls DOWN, the résumé button gives a little hop and
  // flashes its "View my résumé" hint so it keeps catching the eye as they read
  // through the page.
  const [jump, setJump] = useState(false);
  const [hintOn, setHintOn] = useState(false);
  const lastYRef = useRef(0);
  const hopTimer = useRef<number | undefined>(undefined);
  const hintTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const readScrollY = () => {
      const content = document.getElementById("smooth-content");
      if (content) {
        const m = new DOMMatrixReadOnly(
          window.getComputedStyle(content).transform
        );
        return -m.m42;
      }
      return window.scrollY;
    };
    lastYRef.current = readScrollY();

    const onScroll = () => {
      const y = readScrollY();
      const goingDown = y > lastYRef.current + 4;
      lastYRef.current = y;
      if (!goingDown) return;

      // Re-trigger the hop animation on each downward scroll.
      setJump(false);
      window.requestAnimationFrame(() => setJump(true));
      window.clearTimeout(hopTimer.current);
      hopTimer.current = window.setTimeout(() => setJump(false), 650);

      // Keep the "View my résumé" hint visible briefly after scrolling stops.
      setHintOn(true);
      window.clearTimeout(hintTimer.current);
      hintTimer.current = window.setTimeout(() => setHintOn(false), 1600);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(hopTimer.current);
      window.clearTimeout(hintTimer.current);
    };
  }, []);

  useEffect(() => {
    const social = document.getElementById("social") as HTMLElement;

    social.querySelectorAll("span").forEach((item) => {
      const elem = item as HTMLElement;
      const link = elem.querySelector("a") as HTMLElement;

      const rect = elem.getBoundingClientRect();
      let mouseX = rect.width / 2;
      let mouseY = rect.height / 2;
      let currentX = 0;
      let currentY = 0;

      const updatePosition = () => {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;

        link.style.setProperty("--siLeft", `${currentX}px`);
        link.style.setProperty("--siTop", `${currentY}px`);

        requestAnimationFrame(updatePosition);
      };

      const onMouseMove = (e: MouseEvent) => {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < 40 && x > 10 && y < 40 && y > 5) {
          mouseX = x;
          mouseY = y;
        } else {
          mouseX = rect.width / 2;
          mouseY = rect.height / 2;
        }
      };

      document.addEventListener("mousemove", onMouseMove);

      updatePosition();

      return () => {
        elem.removeEventListener("mousemove", onMouseMove);
      };
    });
  }, []);

  return (
    <div className="icons-section">
      <div className="social-icons" data-cursor="icons" id="social">
        <span>
          <a
            href="https://www.linkedin.com/in/gopi89/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <FaLinkedinIn />
          </a>
        </span>
        <span>
          <a
            href="https://github.com/gopichandh"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <FaGithub />
          </a>
        </span>
        <span>
          <a href="mailto:mallavarapu.gopichandh@gmail.com" aria-label="Email">
            <MdEmail />
          </a>
        </span>
      </div>
      <button
        type="button"
        className={`resume-button${jump ? " resume-jump" : ""}`}
        data-cursor="disable"
        aria-label="View résumé"
        onClick={() => window.dispatchEvent(new Event("open-resume"))}
      >
        <span
          className={`resume-attn-hint${hintOn ? " resume-attn-hint-show" : ""}`}
          aria-hidden="true"
        >
          View my résumé
        </span>
        <span className="resume-glow" aria-hidden="true" />
        <HoverLinks text="RESUME" />
        <span className="resume-icon">
          <TbNotes />
        </span>
      </button>
      {/* Right-edge divider line, mirroring the left social rail's border. It
          draws a delicate teal vertical line near the right gutter so the photo
          and content sit neatly INSIDE it, while the football goal-post lives in
          the slim strip to its right. Desktop only (matches the left rail). */}
      <div className="edge-rail-line" aria-hidden="true" />
    </div>
  );
};

export default SocialIcons;
