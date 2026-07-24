import { useEffect, useState } from "react";
import type { Achievement } from "./utils/achievements";
import "./styles/Achievements.css";

/**
 * Achievements
 *
 * Listens for global "achievement" CustomEvents and pops a small toast
 * ("🏆 Achievement unlocked: …") in the top-right. Toasts auto-dismiss.
 */
type Toast = Achievement & { key: number };

const Achievements = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const onAchievement = (e: Event) => {
      const detail = (e as CustomEvent<Achievement>).detail;
      const key = Date.now() + Math.random();
      setToasts((t) => [...t, { ...detail, key }]);
      window.setTimeout(() => {
        setToasts((t) => t.filter((x) => x.key !== key));
      }, 4200);
    };
    window.addEventListener("achievement", onAchievement);
    return () => window.removeEventListener("achievement", onAchievement);
  }, []);

  return (
    <div className="achievements" aria-live="polite">
      {toasts.map((t) => (
        <div className="achievement-toast" key={t.key}>
          <span className="achievement-trophy">🏆</span>
          <div>
            <strong>Achievement unlocked</strong>
            <span>{t.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Achievements;
