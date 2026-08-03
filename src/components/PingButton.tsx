import { useEffect, useRef, useState } from "react";
import { playBlip } from "./utils/sound";
import { unlockAchievement } from "./utils/achievements";
import "./styles/PingButton.css";

type Line = { id: number; text: string; kind: "cmd" | "out" | "stat" | "ok" };

const HOST = "gopichandh.dev";
const IP = "104.21.48.207";

const PingButton = () => {
  const [lines, setLines] = useState<Line[]>([]);
  const [running, setRunning] = useState(false);
  const timers = useRef<number[]>([]);
  const idRef = useRef(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lines]);

  const push = (line: Omit<Line, "id">) =>
    setLines((prev) => [...prev, { ...line, id: idRef.current++ }]);

  const run = () => {
    if (running) return;
    setRunning(true);
    setLines([]);
    idRef.current = 0;
    clearTimers();
    playBlip(880, 0.05, 0.05, "sine");

    const seq: { delay: number; line: Omit<Line, "id"> }[] = [];
    let t = 0;

    seq.push({ delay: (t += 120), line: { text: `$ ping ${HOST}`, kind: "cmd" } });
    seq.push({
      delay: (t += 420),
      line: { text: `PING ${HOST} (${IP}): 56 data bytes`, kind: "out" },
    });

    const times = [12.4, 11.8, 12.1, 11.6, 12.7];
    times.forEach((ms, i) => {
      seq.push({
        delay: (t += 360),
        line: {
          text: `64 bytes from ${IP}: icmp_seq=${i} ttl=56 time=${ms} ms`,
          kind: "out",
        },
      });
    });

    seq.push({
      delay: (t += 420),
      line: { text: `--- ${HOST} ping statistics ---`, kind: "stat" },
    });
    seq.push({
      delay: (t += 260),
      line: {
        text: `5 packets transmitted, 5 packets received, 0.0% packet loss`,
        kind: "stat",
      },
    });
    const min = Math.min(...times);
    const max = Math.max(...times);
    const avg = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1);
    seq.push({
      delay: (t += 260),
      line: {
        text: `round-trip min/avg/max = ${min}/${avg}/${max} ms`,
        kind: "stat",
      },
    });
    seq.push({
      delay: (t += 300),
      line: { text: `✔ host is up — 100% reachable`, kind: "ok" },
    });

    seq.forEach(({ delay, line }) => {
      const id = window.setTimeout(() => {
        push(line);
        if (line.kind !== "cmd") playBlip(1200, 0.02, 0.03, "square");
      }, delay);
      timers.current.push(id);
    });

    const done = window.setTimeout(() => {
      setRunning(false);
      unlockAchievement("ping", "Ping successful — the site is up 📡");
    }, t + 200);
    timers.current.push(done);
  };

  return (
    <div className="ping-tool">
      <div className="ping-terminal">
        <div className="ping-bar">
          <span className="ping-dot red" />
          <span className="ping-dot amber" />
          <span className="ping-dot green" />
          <span className="ping-bar-title">ping — {HOST}</span>
        </div>
        <div className="ping-body" ref={bodyRef}>
          {lines.length === 0 && !running && (
            <p className="ping-hint">
              Press <strong>Ping</strong> to check if this site is reachable.
            </p>
          )}
          {lines.map((l) => (
            <div key={l.id} className={`ping-line ${l.kind}`}>
              {l.text}
            </div>
          ))}
          {running && <span className="ping-caret" />}
        </div>
      </div>
      <button className="ping-btn" onClick={run} disabled={running}>
        {running ? "pinging…" : `📡 Ping ${HOST}`}
      </button>
    </div>
  );
};

export default PingButton;
