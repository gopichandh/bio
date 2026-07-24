import { useEffect, useRef, useState } from "react";
import { playBlip } from "./utils/sound";
import "./styles/ServerRackCards.css";

type Server = {
  id: string;
  name: string;
  role: string;
  region: string;
  bootMs: number; // epoch when this "server" came online
};

const SERVERS: Server[] = [
  {
    id: "web-01",
    name: "web-01",
    role: "NGINX · Edge",
    region: "us-east-1a",
    bootMs: Date.now() - 1000 * 60 * 60 * 24 * 412,
  },
  {
    id: "api-02",
    name: "api-02",
    role: "Node API · Gateway",
    region: "us-east-1b",
    bootMs: Date.now() - 1000 * 60 * 60 * 24 * 233,
  },
  {
    id: "db-01",
    name: "db-01",
    role: "PostgreSQL · Primary",
    region: "us-west-2a",
    bootMs: Date.now() - 1000 * 60 * 60 * 24 * 690,
  },
  {
    id: "k8s-03",
    name: "k8s-03",
    role: "Kubernetes · Worker",
    region: "eu-west-1a",
    bootMs: Date.now() - 1000 * 60 * 60 * 24 * 118,
  },
];

// Smoothly wandering metric in a bounded range.
const useWander = (base: number, spread: number, min = 2, max = 98) => {
  const [v, setV] = useState(base);
  const target = useRef(base);
  useEffect(() => {
    let raf = 0;
    let tick = 0;
    const step = () => {
      tick++;
      if (tick % 45 === 0) {
        target.current = Math.min(
          max,
          Math.max(min, base + (Math.random() - 0.5) * spread * 2)
        );
      }
      setV((cur) => cur + (target.current - cur) * 0.06);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [base, spread, min, max]);
  return v;
};

const fmtUptime = (ms: number) => {
  const s = Math.floor((Date.now() - ms) / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
};

const Metric = ({
  label,
  value,
  unit,
  warn = 75,
  crit = 90,
}: {
  label: string;
  value: number;
  unit: string;
  warn?: number;
  crit?: number;
}) => {
  const pct = Math.round(value);
  const state = pct >= crit ? "crit" : pct >= warn ? "warn" : "ok";
  return (
    <div className="srv-metric">
      <div className="srv-metric-head">
        <span>{label}</span>
        <span className={`srv-metric-val ${state}`}>
          {pct}
          {unit}
        </span>
      </div>
      <div className="srv-meter">
        <div
          className={`srv-meter-fill ${state}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const ServerCard = ({ server }: { server: Server }) => {
  const cpu = useWander(38, 30);
  const ram = useWander(56, 22);
  const net = useWander(28, 34);
  const [uptime, setUptime] = useState(() => fmtUptime(server.bootMs));

  useEffect(() => {
    const t = setInterval(() => setUptime(fmtUptime(server.bootMs)), 1000);
    return () => clearInterval(t);
  }, [server.bootMs]);

  return (
    <article
      className="server-card"
      onMouseEnter={() => playBlip(720, 0.05, 0.05, "sine")}
      tabIndex={0}
    >
      <header className="server-card-head">
        <span className="server-status-dot" />
        <div className="server-id">
          <span className="server-name">{server.name}</span>
          <span className="server-role">{server.role}</span>
        </div>
        <span className="server-region">{server.region}</span>
      </header>

      <div className="server-metrics">
        <Metric label="CPU" value={cpu} unit="%" />
        <Metric label="RAM" value={ram} unit="%" />
        <Metric label="NET" value={net} unit="%" warn={80} crit={95} />
      </div>

      <footer className="server-card-foot">
        <span className="server-uptime-label">uptime</span>
        <span className="server-uptime-val">{uptime}</span>
        <span className="server-badge">healthy</span>
      </footer>
    </article>
  );
};

const ServerRackCards = () => {
  return (
    <div className="server-rack-cards">
      {SERVERS.map((s) => (
        <ServerCard key={s.id} server={s} />
      ))}
    </div>
  );
};

export default ServerRackCards;
