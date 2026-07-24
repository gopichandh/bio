import { useRef, useState } from "react";
import { playBlip } from "./utils/sound";
import { unlockAchievement } from "./utils/achievements";
import "./styles/DraggableRack.css";

type Unit = {
  id: string;
  label: string;
  sub: string;
  u: string; // rack-unit size label
  tone: "teal" | "amber" | "violet" | "blue";
};

const INITIAL: Unit[] = [
  { id: "lb", label: "Load Balancer", sub: "HAProxy · active/active", u: "1U", tone: "teal" },
  { id: "web", label: "Web Tier", sub: "NGINX ×3 · autoscaled", u: "2U", tone: "blue" },
  { id: "app", label: "App Tier", sub: "Node / Go microservices", u: "2U", tone: "violet" },
  { id: "cache", label: "Cache", sub: "Redis cluster · 3 shards", u: "1U", tone: "amber" },
  { id: "db", label: "Database", sub: "PostgreSQL · HA primary", u: "2U", tone: "teal" },
  { id: "obs", label: "Observability", sub: "Prometheus + Grafana", u: "1U", tone: "blue" },
];

const DraggableRack = () => {
  const [units, setUnits] = useState<Unit[]>(INITIAL);
  const dragIdx = useRef<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [rearranged, setRearranged] = useState(false);

  const onDragStart = (i: number) => {
    dragIdx.current = i;
    playBlip(520, 0.04, 0.05, "sine");
  };

  const onDragEnter = (i: number) => {
    if (dragIdx.current === null || dragIdx.current === i) {
      setOverIdx(i);
      return;
    }
    setUnits((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx.current!, 1);
      next.splice(i, 0, moved);
      dragIdx.current = i;
      return next;
    });
    setOverIdx(i);
  };

  const onDrop = () => {
    dragIdx.current = null;
    setOverIdx(null);
    playBlip(780, 0.05, 0.05, "sine");
    if (!rearranged) {
      setRearranged(true);
      unlockAchievement("rack", "Rack engineer — you rearranged the stack 🧰");
    }
  };

  const reset = () => {
    setUnits(INITIAL);
    playBlip(400, 0.05, 0.05, "sine");
  };

  return (
    <div className="drag-rack">
      <div className="drag-rack-frame">
        <div className="rack-rail left" aria-hidden="true" />
        <div className="rack-slots">
          {units.map((unit, i) => (
            <div
              key={unit.id}
              className={`rack-unit tone-${unit.tone} ${
                overIdx === i ? "is-over" : ""
              }`}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragEnter={() => onDragEnter(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onDragEnd={onDrop}
            >
              <span className="rack-grip" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="rack-leds" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <div className="rack-unit-text">
                <span className="rack-unit-label">{unit.label}</span>
                <span className="rack-unit-sub">{unit.sub}</span>
              </div>
              <span className="rack-unit-u">{unit.u}</span>
            </div>
          ))}
        </div>
        <div className="rack-rail right" aria-hidden="true" />
      </div>
      <div className="drag-rack-foot">
        <span className="drag-rack-hint">Drag the units to redesign the stack ↕</span>
        <button className="drag-rack-reset" onClick={reset}>
          reset layout
        </button>
      </div>
    </div>
  );
};

export default DraggableRack;
