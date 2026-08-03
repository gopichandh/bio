import { useCallback, useEffect, useRef, useState } from "react";
import { unlockAchievement } from "./utils/achievements";
import "./styles/DataCenterGame.css";

/**
 * DataCenterGame — "Keep the Datacenter Cool"
 *
 * A light, easy-to-win arcade game that fits the SRE theme and rewards the
 * visitor with a medal:
 *   • A grid of servers occasionally "overheats" (turns red/pulsing).
 *   • The visitor clicks an overheating server to cool it back down (+score).
 *   • Reach the (low, beatable) target score before the short timer ends and
 *     a celebratory medal overlay appears: "🏅 You are the best!" with confetti.
 *
 * Deliberately generous (slow spawns, low target, long-ish timer) so almost
 * everyone wins and gets the medal. Pure React state + CSS; no deps.
 */

const COLS = 5;
const ROWS = 3;
const COUNT = COLS * ROWS;
const TARGET = 8; // easy to reach
const DURATION = 30; // seconds

type Phase = "idle" | "playing" | "won" | "lost";

const DataCenterGame = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [hot, setHot] = useState<boolean[]>(() => Array(COUNT).fill(false));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);

  const spawnTimer = useRef<number>();
  const clockTimer = useRef<number>();

  const clearTimers = () => {
    window.clearInterval(spawnTimer.current);
    window.clearInterval(clockTimer.current);
  };

  const start = useCallback(() => {
    setScore(0);
    setTimeLeft(DURATION);
    setHot(Array(COUNT).fill(false));
    setPhase("playing");
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;

    // Overheat a random cool server on a gentle cadence.
    spawnTimer.current = window.setInterval(() => {
      setHot((prev) => {
        const cool: number[] = [];
        prev.forEach((v, i) => !v && cool.push(i));
        if (!cool.length) return prev;
        const idx = cool[Math.floor(Math.random() * cool.length)];
        const next = [...prev];
        next[idx] = true;
        return next;
      });
    }, 850);

    // Countdown clock.
    clockTimer.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(clockTimer.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return clearTimers;
  }, [phase]);

  // Win / lose resolution.
  useEffect(() => {
    if (phase !== "playing") return;
    if (score >= TARGET) {
      clearTimers();
      setPhase("won");
      unlockAchievement("datacenter-hero", "Datacenter Hero — you kept it cool! 🏅");
    } else if (timeLeft === 0) {
      clearTimers();
      setPhase("lost");
    }
  }, [score, timeLeft, phase]);

  const cool = (i: number) => {
    if (phase !== "playing" || !hot[i]) return;
    setHot((prev) => {
      const next = [...prev];
      next[i] = false;
      return next;
    });
    setScore((s) => s + 1);
  };

  const pct = Math.min(100, (score / TARGET) * 100);

  return (
    <section id="datacenter-game" className="dcg section-container">
      <div className="dcg-container">
        <header className="dcg-head">
          <span className="dcg-chip">// mini-game</span>
          <h2>
            Keep the <span>Datacenter</span> Cool
          </h2>
          <p>
            Servers overheat under load. Click the red ones to cool them down —
            hit {TARGET} saves before the timer runs out and earn your medal.
          </p>
        </header>

        <div className="dcg-hud">
          <div className="dcg-stat">
            <strong>{score}</strong>
            <span>/ {TARGET} cooled</span>
          </div>
          <div className="dcg-progress">
            <div className="dcg-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="dcg-stat dcg-timer">
            <strong>{timeLeft}</strong>
            <span>sec left</span>
          </div>
        </div>

        <div
          className={`dcg-grid ${phase === "playing" ? "is-live" : ""}`}
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {hot.map((isHot, i) => (
            <button
              key={i}
              className={`dcg-cell ${isHot ? "hot" : "cool"}`}
              onClick={() => cool(i)}
              data-cursor="disable"
              aria-label={isHot ? "Overheating server — cool it" : "Server nominal"}
              disabled={phase !== "playing"}
            >
              <span className="dcg-server">
                <i className="dcg-led" />
                <i className="dcg-led" />
                <i className="dcg-led" />
              </span>
              {isHot && <span className="dcg-heat">🔥</span>}
            </button>
          ))}
        </div>

        {phase === "idle" && (
          <button className="dcg-btn" onClick={start} data-cursor="disable">
            ▶ Start shift
          </button>
        )}
        {phase === "lost" && (
          <div className="dcg-result">
            <p>So close! The datacenter got toasty. Give it another go.</p>
            <button className="dcg-btn" onClick={start} data-cursor="disable">
              ↻ Retry
            </button>
          </div>
        )}
      </div>

      {/* Victory medal overlay */}
      {phase === "won" && (
        <div className="dcg-medal-overlay" role="dialog" aria-modal="true">
          <div className="dcg-confetti">
            {[...Array(40)].map((_, i) => (
              <i key={i} style={{ ["--n" as any]: i }} />
            ))}
          </div>
          <div className="dcg-medal-card">
            <div className="dcg-medal">
              <div className="dcg-medal-ribbon left" />
              <div className="dcg-medal-ribbon right" />
              <div className="dcg-medal-disc">
                <span>★</span>
              </div>
            </div>
            <h3>You are the best!</h3>
            <p>
              Zero meltdowns, MTTR of basically nothing. Gopichandh could use an SRE
              like you on-call. 🏅
            </p>
            <button className="dcg-btn" onClick={start} data-cursor="disable">
              Play again
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default DataCenterGame;
