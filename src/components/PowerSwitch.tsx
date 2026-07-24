import { useEffect, useState } from "react";
import { playClick } from "./utils/sound";
import { unlockAchievement } from "./utils/achievements";
import "./styles/PowerSwitch.css";

const STORE_KEY = "vm-theme";

const applyTheme = (light: boolean) => {
  const root = document.documentElement;
  if (light) root.classList.add("theme-light");
  else root.classList.remove("theme-light");
};

const PowerSwitch = () => {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const persisted = sessionStorage.getItem(STORE_KEY) === "light";
    if (persisted) {
      setLight(true);
      applyTheme(true);
    }
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    applyTheme(next);
    sessionStorage.setItem(STORE_KEY, next ? "light" : "dark");
    playClick();
    if (next) unlockAchievement("power", "Power switch flipped — daylight mode ⚡");
  };

  return (
    <button
      className={`power-switch ${light ? "is-light" : ""}`}
      onClick={toggle}
      aria-pressed={light}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      title={light ? "Power: daylight mode" : "Power: night mode"}
    >
      <span className="power-switch-track" aria-hidden="true">
        <span className="power-switch-lever">
          <span className="power-switch-notch" />
        </span>
        <span className="power-switch-io power-io-on">I</span>
        <span className="power-switch-io power-io-off">O</span>
      </span>
    </button>
  );
};

export default PowerSwitch;
