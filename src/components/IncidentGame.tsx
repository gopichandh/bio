import { useCallback, useEffect, useRef, useState } from "react";
import { playBlip } from "./utils/sound";
import { unlockAchievement } from "./utils/achievements";
import "./styles/IncidentGame.css";

/**
 * IncidentGame — a tiny "on-call" simulator.
 * A grid of servers occasionally goes DOWN (red). Click a downed server to
 * dispatch a fix; each resolve records a response time. The panel tracks
 * incidents resolved and your average MTTR (mean time to recovery).
 */

const NODE_COUNT = 9;

type NodeState = "up" | "down";

const IncidentGame = () => {
  const [running, setRunning] = useState(false);
  const [states, setStates] = useState<NodeState[]>(
    () => Array<NodeState>(NODE_COUNT).fill("up")
  );
  const [resolved, setResolved] = useState(0);
  const [missed, setMissed] = useState(0);
  const [mttr, setMttr] = useState<number | null>(null);

  const downSince = useRef<Record<number, number>>({});
  const times = useRef<number[]>([]);
  const spawnTimer = useRef<number | null>(null);
  const autoFailTimer = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (spawnTimer.current) window.clearTimeout(spawnTimer.current);
    if (autoFailTimer.current) window.clearInterval(autoFailTimer.current);
    spawnTimer.current = null;
    autoFailTimer.current = null;
  }, []);

  const scheduleNext = useCallback(() => {
    const delay = 900 + Math.random() * 1800;
    spawnTimer.current = window.setTimeout(() => {
      setStates((prev) => {
        const upIdx = prev
          .map((s, i) => (s === "up" ? i : -1))
          .filter((i) => i >= 0);
        if (upIdx.length === 0) return prev;
        const pick = upIdx[Math.floor(Math.random() * upIdx.length)];
        const next = [...prev];
        next[pick] = "down";
        downSince.current[pick] = Date.now();
        playBlip(180, 0.12, 0.09, "sawtooth");
        return next;
      });
      scheduleNext();
    }, delay);
  }, []);

  const start = () => {
    times.current = [];
    downSince.current = {};
    setStates(Array<NodeState>(NODE_COUNT).fill("up"));
    setResolved(0);
    setMissed(0);
    setMttr(null);
    setRunning(true);
    playBlip(880, 0.06, 0.06, "sine");
    scheduleNext();
    // Any incident left un-resolved for 6s counts as "missed" (SLA breach).
    autoFailTimer.current = window.setInterval(() => {
      const now = Date.now();
      setStates((prev) => {
        let changed = false;
        const next = [...prev];
        Object.entries(downSince.current).forEach(([k, t]) => {
          const idx = Number(k);
          if (next[idx] === "down" && now - t > 6000) {
            next[idx] = "up";
            delete downSince.current[idx];
            changed = true;
          }
        });
        if (changed) setMissed((m) => m + 1);
        return changed ? next : prev;
      });
    }, 400);
  };

  const stop = useCallback(() => {
    setRunning(false);
    clearTimers();
  }, [clearTimers]);

  const resolve = (i: number) => {
    if (!running || states[i] !== "down") return;
    const t = downSince.current[i];
    const elapsed = t ? (Date.now() - t) / 1000 : 0;
    times.current.push(elapsed);
    delete downSince.current[i];
    setStates((prev) => {
      const next = [...prev];
      next[i] = "up";
      return next;
    });
    setResolved((r) => {
      const nr = r + 1;
      if (nr === 5) unlockAchievement("oncall", "On-call hero — 5 incidents resolved! 🚨");
      return nr;
    });
    const avg =
      times.current.reduce((a, b) => a + b, 0) / times.current.length;
    setMttr(avg);
    playBlip(1046, 0.06, 0.06, "sine");
  };

  useEffect(() => () => clearTimers(), [clearTimers]);

  const downCount = states.filter((s) => s === "down").length;

  return (
    <div className="incident-game">
      <div className="incident-head">
        <div className="incident-title">
          <span className="incident-chip">on-call sim</span>
          <h3>Incident Response</h3>
          <p>Click any server that goes down to dispatch a fix before the SLA timer expires.</p>
        </div>
        <div className="incident-stats">
          <div className="istat">
            <span className="istat-val">{resolved}</span>
            <span className="istat-label">resolved</span>
          </div>
          <div className="istat">
            <span className="istat-val warn">{missed}</span>
            <span className="istat-label">missed</span>
          </div>
          <div className="istat">
            <span className="istat-val accent">
              {mttr === null ? "—" : `${mttr.toFixed(1)}s`}
            </span>
            <span className="istat-label">avg MTTR</span>
          </div>
        </div>
      </div>

      <div className={`incident-grid ${downCount > 0 ? "alert" : ""}`}>
        {states.map((s, i) => (
          <button
            key={i}
            className={`incident-node ${s}`}
            onClick={() => resolve(i)}
            aria-label={
              s === "down" ? `Server ${i + 1} down — click to resolve` : `Server ${i + 1} healthy`
            }
            disabled={!running}
          >
            <span className="node-led" />
            <span className="node-name">srv-{String(i + 1).padStart(2, "0")}</span>
            <span className="node-state">{s === "down" ? "DOWN" : "OK"}</span>
          </button>
        ))}
      </div>

      <div className="incident-controls">
        {!running ? (
          <button className="incident-btn start" onClick={start}>
            ▶ Start shift
          </button>
        ) : (
          <button className="incident-btn stop" onClick={stop}>
            ■ End shift
          </button>
        )}
        {running && downCount > 0 && (
          <span className="incident-live">
            {downCount} active incident{downCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
};

export default IncidentGame;
