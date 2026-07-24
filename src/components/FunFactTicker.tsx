import { useEffect, useState } from "react";
import "./styles/FunFactTicker.css";

/**
 * FunFactTicker
 *
 * A rotating footer ticker of playful SRE fun-facts / stats / quotes. Cycles
 * every few seconds with a smooth fade. Purely decorative, on-brand flavor.
 */
const FACTS = [
  "fun fact: this site has never gone down 😉",
  "MTTR on my coffee machine: < 30s ☕",
  "99.99% uptime leaves ~52 minutes/year for chaos.",
  "the best incident is the one that never pages you.",
  "\u201cHope is not a strategy.\u201d — SRE proverb",
  "cattle, not pets. 🐄",
  "every alert here is actionable. no noise.",
  "shipped to Apple, Nike, Kohls & UnitedHealthcare.",
  "automate the boring, observe the rest.",
  "rollbacks are a feature, not a failure.",
];

const FunFactTicker = () => {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const id = window.setInterval(() => {
      setShow(false);
      window.setTimeout(() => {
        setI((n) => (n + 1) % FACTS.length);
        setShow(true);
      }, 400);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="funfact-ticker" aria-live="polite">
      <span className="funfact-label">
        <i className="funfact-led" /> status
      </span>
      <span className={`funfact-text ${show ? "show" : ""}`}>{FACTS[i]}</span>
    </div>
  );
};

export default FunFactTicker;
