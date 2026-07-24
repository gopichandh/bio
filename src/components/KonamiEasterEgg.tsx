import { useEffect, useState } from "react";
import { unlockAchievement } from "./utils/achievements";
import "./styles/KonamiEasterEgg.css";

/**
 * KonamiEasterEgg
 *
 * Listens for the classic Konami code (↑ ↑ ↓ ↓ ← → ← → B A). On success it
 * triggers "DATACENTER ALARM" mode — a red pulsing overlay with a siren
 * banner — for a few seconds, and fires an achievement toast. Pure CSS FX.
 */
const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const KonamiEasterEgg = () => {
  const [alarm, setAlarm] = useState(false);

  useEffect(() => {
    let idx = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === SEQUENCE[idx]) {
        idx++;
        if (idx === SEQUENCE.length) {
          idx = 0;
          trigger();
        }
      } else {
        // allow restart if the wrong key is actually the first key
        idx = key === SEQUENCE[0] ? 1 : 0;
      }
    };

    const trigger = () => {
      setAlarm(true);
      unlockAchievement("konami", "Konami code — DATACENTER ALARM engaged!");
      window.setTimeout(() => setAlarm(false), 4500);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!alarm) return null;

  return (
    <div className="konami-alarm" aria-hidden="true">
      <div className="konami-flash" />
      <div className="konami-banner">
        <span className="konami-siren" />
        ⚠ DATACENTER ALARM — ALL HANDS ON DECK ⚠
        <span className="konami-siren" />
      </div>
      <div className="konami-scanline" />
    </div>
  );
};

export default KonamiEasterEgg;
