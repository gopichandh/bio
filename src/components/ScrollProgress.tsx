import { useEffect, useRef, useState } from "react";
import "./styles/ScrollProgress.css";

/**
 * ScrollProgress
 *
 * A top-of-page progress bar styled as a CI/CD "deployment pipeline". As the
 * visitor scrolls, the bar fills and moves through pipeline stages
 * (Build → Test → Deploy → Live). Works with ScrollSmoother's transformed
 * wrapper by measuring the wrapper's transl? offset via scroll math.
 */

const STAGES = ["Build", "Test", "Deploy", "Live"];

const ScrollProgress = () => {
  const [pct, setPct] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const compute = () => {
      ticking.current = false;
      const content = document.getElementById("smooth-content");
      const doc = document.documentElement;
      let progress = 0;

      if (content) {
        // ScrollSmoother transforms #smooth-content upward; derive progress
        // from its translateY vs its scrollable height.
        const style = window.getComputedStyle(content);
        const matrix = new DOMMatrixReadOnly(style.transform);
        const translated = -matrix.m42; // translateY is negative as we scroll
        const total = content.scrollHeight - window.innerHeight;
        progress = total > 0 ? translated / total : 0;
      } else {
        const total = doc.scrollHeight - window.innerHeight;
        progress = total > 0 ? window.scrollY / total : 0;
      }
      setPct(Math.max(0, Math.min(1, progress)) * 100);
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
    const poll = window.setInterval(compute, 200); // ScrollSmoother safety
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearInterval(poll);
    };
  }, []);

  const activeStage = Math.min(
    STAGES.length - 1,
    Math.floor((pct / 100) * STAGES.length)
  );

  return (
    <div className="scroll-pipeline" aria-hidden="true">
      <div className="pipeline-track">
        <div className="pipeline-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="pipeline-stages">
        {STAGES.map((s, i) => (
          <span
            key={s}
            className={`pipeline-stage ${i <= activeStage ? "stage-done" : ""} ${
              i === activeStage ? "stage-active" : ""
            }`}
          >
            <i className="stage-dot" />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ScrollProgress;
