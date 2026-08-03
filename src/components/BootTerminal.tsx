import { useEffect, useRef, useState } from "react";
import { unlockAchievement } from "./utils/achievements";
import "./styles/BootTerminal.css";

/**
 * BootTerminal
 *
 * A fake SRE "boot-up" terminal that types itself out on first load — a
 * kubectl-style sequence establishing the datacenter theme. It shows once
 * per session, can be skipped, and dismisses itself when the sequence ends.
 */

type Line = { text: string; cls?: string; pause?: number };

const SEQUENCE: Line[] = [
  { text: "$ ssh gopichandh@portfolio.local", cls: "cmd" },
  { text: "Authenticating… key accepted ✔", cls: "ok", pause: 250 },
  { text: "$ kubectl config use-context production", cls: "cmd" },
  { text: 'Switched to context "production".', cls: "dim", pause: 200 },
  { text: "$ kubectl get pods -n gopichandh-site", cls: "cmd" },
  { text: "NAME                       READY   STATUS    RESTARTS", cls: "head" },
  { text: "hero-landing-7c9d          1/1     Running   0", cls: "pod" },
  { text: "about-me-5f4b              1/1     Running   0", cls: "pod" },
  { text: "tech-stack-9a1c            1/1     Running   0", cls: "pod" },
  { text: "career-timeline-2e8d       1/1     Running   0", cls: "pod" },
  { text: "projects-6b3f              1/1     Running   0", cls: "pod", pause: 200 },
  { text: "$ echo 'All systems nominal — welcome 👋'", cls: "cmd" },
  { text: "All systems nominal — welcome 👋", cls: "ok", pause: 350 },
];

const BootTerminal = () => {
  const [done, setDone] = useState(
    () => sessionStorage.getItem("vm-booted") === "1"
  );
  const [lines, setLines] = useState<{ text: string; cls?: string }[]>([]);
  const [typing, setTyping] = useState("");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (done) return;

    let cancelled = false;
    let li = 0;

    const finish = () => {
      sessionStorage.setItem("vm-booted", "1");
      unlockAchievement("boot", "System booted — you watched the sequence!");
      // brief hold, then fade out
      const t = window.setTimeout(() => !cancelled && setDone(true), 700);
      timers.current.push(t);
    };

    const typeLine = () => {
      if (cancelled) return;
      if (li >= SEQUENCE.length) {
        finish();
        return;
      }
      const line = SEQUENCE[li];
      let ci = 0;
      const speed = line.cls === "cmd" ? 26 : 8;

      const tick = () => {
        if (cancelled) return;
        ci++;
        setTyping(line.text.slice(0, ci));
        if (ci < line.text.length) {
          const t = window.setTimeout(tick, speed);
          timers.current.push(t);
        } else {
          setLines((l) => [...l, { text: line.text, cls: line.cls }]);
          setTyping("");
          li++;
          const t = window.setTimeout(typeLine, line.pause ?? 90);
          timers.current.push(t);
        }
      };
      tick();
    };

    const start = window.setTimeout(typeLine, 500);
    timers.current.push(start);

    return () => {
      cancelled = true;
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [done]);

  const skip = () => {
    sessionStorage.setItem("vm-booted", "1");
    setDone(true);
  };

  if (done) return null;

  return (
    <div className="boot-terminal">
      <div className="boot-window">
        <div className="boot-titlebar">
          <span className="boot-dot boot-red" />
          <span className="boot-dot boot-amber" />
          <span className="boot-dot boot-green" />
          <span className="boot-title">gopichandh@portfolio.local: ~</span>
          <button className="boot-skip" onClick={skip} data-cursor="disable">
            skip ›
          </button>
        </div>
        <div className="boot-body">
          {lines.map((l, i) => (
            <div key={i} className={`boot-line ${l.cls || ""}`}>
              {l.text}
            </div>
          ))}
          {typing && (
            <div className="boot-line typing">
              {typing}
              <span className="boot-caret" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BootTerminal;
