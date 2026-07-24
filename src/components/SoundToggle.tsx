import { useEffect, useState } from "react";
import { isSoundEnabled, setSoundEnabled, playClick } from "./utils/sound";
import { unlockAchievement } from "./utils/achievements";
import "./styles/SoundToggle.css";

const SoundToggle = () => {
  const [on, setOn] = useState(false);

  useEffect(() => {
    // Sync with any persisted state (muted by default).
    const persisted = isSoundEnabled();
    if (persisted) {
      setOn(true);
      setSoundEnabled(true);
    }
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    setSoundEnabled(next);
    if (next) {
      playClick();
      unlockAchievement("sound", "Sound on — the server room hums 🔊");
    }
  };

  return (
    <button
      className={`sound-toggle ${on ? "is-on" : ""}`}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Mute server room sound" : "Enable server room sound"}
      title={on ? "Sound: on (server hum)" : "Sound: off"}
    >
      <span className="sound-icon" aria-hidden="true">
        {on ? (
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              d="M4 9v6h4l5 5V4L8 9H4z"
              fill="currentColor"
            />
            <path
              d="M16.5 8.5a4 4 0 0 1 0 7M18.8 6a7 7 0 0 1 0 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" />
            <path
              d="M16 9l5 6M21 9l-5 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
      <span className="sound-led" aria-hidden="true" />
    </button>
  );
};

export default SoundToggle;
