import { useState } from "react";
import "./styles/LiveStatus.css";

/**
 * LiveStatus — a compact "experience" badge pinned to the top-right.
 *
 * Simplified per request: it no longer shows synthetic uptime / latency /
 * pod-health telemetry or a sparkline. It is now a single, clean chip that
 * reads "Total IT Experience: 13yrs" and, on hover, expands to reveal the
 * comma-separated list of core skills Vilas is expert in.
 */

// Total IT experience — single source of truth for the badge.
const YEARS_EXPERIENCE = 13;

// The core toolchain Vilas is expert in — surfaced as a comma-separated
// "skills manifest" when the visitor hovers the experience badge.
const SKILLS =
  "Linux, Git, GitHub, Jenkins, Ansible, Docker, Kubernetes, AWS, Python, CI/CD";

const LiveStatus = () => {
  const [open, setOpen] = useState(false);
  const years = YEARS_EXPERIENCE;

  return (
    <div
      className={`live-status ${open ? "live-status-open" : ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
      role="status"
      aria-label="Vilas Mankala — total IT experience and core skills"
    >
      <div className="live-status-head">
        <span className="live-beacon">
          <span className="live-beacon-dot" />
          <span className="live-beacon-ring" />
        </span>
        <span className="live-status-title">
          Total IT Experience: {years}yrs
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
