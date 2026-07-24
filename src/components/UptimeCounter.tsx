import { useEffect, useRef, useState } from "react";
import "./styles/UptimeCounter.css";

/**
 * UptimeCounter
 *
 * A live-ticking "uptime" readout in the SRE spirit: shows a rock-solid
 * 99.99% availability figure and a running clock counting up from a fixed
 * "deployed on" date. Ticks every second.
 */

// The date this "service" (career/portfolio) went live.
const SINCE = new Date("2013-08-01T00:00:00Z");

const pad = (n: number) => n.toString().padStart(2, "0");

const UptimeCounter = () => {
  const [now, setNow] = useState(() => Date.now());
  const timer = useRef<number>();

  useEffect(() => {
    timer.current = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer.current);
  }, []);

  const diff = Math.max(0, now - SINCE.getTime());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const years = (diff / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);

  return (
    <div className="uptime-counter">
      <div className="uptime-badge">
        <span className="uptime-led" />
        99.99% UPTIME
      </div>
      <div className="uptime-clock">
        <div className="uptime-unit">
          <strong>{days.toLocaleString()}</strong>
          <span>days</span>
        </div>
        <em>:</em>
        <div className="uptime-unit">
          <strong>{pad(hours)}</strong>
          <span>hrs</span>
        </div>
        <em>:</em>
        <div className="uptime-unit">
          <strong>{pad(minutes)}</strong>
          <span>min</span>
        </div>
        <em>:</em>
        <div className="uptime-unit">
          <strong>{pad(seconds)}</strong>
          <span>sec</span>
        </div>
      </div>
      <p className="uptime-note">
        ~{years} years in production · zero unplanned outages 😉
      </p>
    </div>
  );
};

export default UptimeCounter;
