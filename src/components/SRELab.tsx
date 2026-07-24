import { lazy, Suspense, useEffect } from "react";
import ServerRackCards from "./ServerRackCards";
import IncidentGame from "./IncidentGame";
import PingButton from "./PingButton";
import DraggableRack from "./DraggableRack";
import NetworkTopology from "./NetworkTopology";
import powerOnReveal from "./utils/powerOnReveal";
import "./styles/SRELab.css";

// The 3D rack pulls in three.js — load it lazily so it never blocks paint.
const Rack3D = lazy(() => import("./Rack3D"));

/**
 * SRELab — an interactive playground that showcases the SRE theme:
 *   • Live server-rack stat cards (CPU/RAM/uptime)
 *   • A 3D rotatable server rack (three.js)
 *   • A living network topology graph
 *   • A "ping this site" terminal
 *   • An on-call incident-response mini-game (MTTR score)
 *   • A draggable rack you can re-architect
 * Each block "powers on" as it scrolls into view.
 */
const SRELab = () => {
  useEffect(() => {
    // Defer until layout settles so ScrollTrigger measures correctly.
    const t = window.setTimeout(() => powerOnReveal(), 300);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section id="srelab" className="srelab section-container">
      <div className="srelab-container">
        <header className="srelab-head power-on">
          <span className="srelab-chip">~/interactive-lab</span>
          <h2>
            The <span>SRE</span> Lab
          </h2>
          <p>
            A hands-on corner of the site — real-time dashboards, a 3D rack, a
            live network, and an on-call game. Poke around; nothing here can
            page you at 3&nbsp;AM.
          </p>
        </header>

        <div className="srelab-block power-on">
          <div className="srelab-block-head">
            <h3>Fleet health</h3>
            <p>Live-ticking CPU, memory and network across a sample fleet.</p>
          </div>
          <ServerRackCards />
        </div>

        <div className="srelab-grid">
          <div className="srelab-block power-on">
            <div className="srelab-block-head">
              <h3>3D rack</h3>
              <p>Drag to rotate · scroll to zoom.</p>
            </div>
            <Suspense
              fallback={<div className="srelab-loading">booting 3D rack…</div>}
            >
              <Rack3D />
            </Suspense>
          </div>

          <div className="srelab-block power-on">
            <div className="srelab-block-head">
              <h3>Network topology</h3>
              <p>Core → switches → servers, with live packet flow.</p>
            </div>
            <NetworkTopology />
          </div>
        </div>

        <div className="srelab-grid">
          <div className="srelab-block power-on">
            <div className="srelab-block-head">
              <h3>Reachability</h3>
              <p>Run a live-style ping against this site.</p>
            </div>
            <PingButton />
          </div>

          <div className="srelab-block power-on">
            <div className="srelab-block-head">
              <h3>Architect the stack</h3>
              <p>Drag the units to redesign the rack layout.</p>
            </div>
            <DraggableRack />
          </div>
        </div>

        <div className="srelab-block power-on">
          <div className="srelab-block-head">
            <h3>On-call simulator</h3>
            <p>Servers will fail — resolve them fast to keep your MTTR low.</p>
          </div>
          <IncidentGame />
        </div>
      </div>
    </section>
  );
};

export default SRELab;
