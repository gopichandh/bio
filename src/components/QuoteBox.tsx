import { useEffect, useState } from "react";
import "./styles/QuoteBox.css";

/**
 * QuoteBox
 *
 * A dynamic, rotating SRE / DevOps quote box that replaces the old fun-fact
 * ticker in the footer. Quotes fade in and out on a timer. Styled per the
 * design system: dark card, 1px hairline border, teal accent, muted body.
 */
const QUOTES = [
  { text: "Hope is not a strategy.", author: "SRE proverb" },
  {
    text: "Everything fails, all the time — design for it.",
    author: "Werner Vogels",
  },
  {
    text: "The best incident is the one that never pages you.",
    author: "On-call wisdom",
  },
  { text: "Automate the boring, observe the rest.", author: "DevOps mantra" },
  {
    text: "Cattle, not pets. Rebuild, don't repair.",
    author: "Infrastructure as Code",
  },
  {
    text: "Slow is smooth, and smooth is fast.",
    author: "Reliability engineering",
  },
  {
    text: "You build it, you run it.",
    author: "Werner Vogels",
  },
  {
    text: "A rollback is a feature, not a failure.",
    author: "Continuous delivery",
  },
];

const QuoteBox = () => {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const id = window.setInterval(() => {
      setShow(false);
      window.setTimeout(() => {
        setI((n) => (n + 1) % QUOTES.length);
        setShow(true);
      }, 450);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  const q = QUOTES[i];

  return (
    <div className="quote-box" aria-live="polite">
      <span className="quote-mark">&ldquo;</span>
      <div className={`quote-body ${show ? "show" : ""}`}>
        <p className="quote-text">{q.text}</p>
        <p className="quote-author">— {q.author}</p>
      </div>
    </div>
  );
};

export default QuoteBox;
