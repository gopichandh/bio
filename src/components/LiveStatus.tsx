import { useState } from "react";
import "./styles/LiveStatus.css";

/**
 * LiveStatus — a compact badge pinned to the top-right.
 *
 * Simplified per request: it no longer shows synthetic uptime / latency /
 * pod-health telemetry or a sparkline. It is now a single, clean chip that
 * reads "Total IT Experience" and, on hover, expands to reveal the
 * comma-separated list of core skills Gopichandh is expert in.
 */

// The core toolchain Gopichandh is expert in — surfaced as a comma-separated
// "skills manifest" when the visitor hovers the experience badge.
const SKILLS =
  "Linux, GitHub, Jenkins, Ansible, Docker, Kubernetes, Helm, ArgoCD, AWS, Terraform, Grafana, Dynatrace";

const LiveStatus = () => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`live-status ${open ? "live-status-open" : ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
      role="status"
      aria-label="Gopichandh Mallavarapu — total IT experience and core skills"
    >
      <div className="live-status-head">
        <span className="live-beacon">
          <span className="live-beacon-dot" />
          <span className="live-beacon-ring" />
        </span>
        <span className="live-status-title">
          Total IT Experience
        </span>
      </div>

      <div className="live-status-body">
        <div className="live-skills" title="Core toolchain">
          <span className="live-skills-label">Expert in</span>
          <span className="live-skills-list">{SKILLS}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveStatus;
