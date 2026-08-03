import { PropsWithChildren, useEffect, useRef } from "react";
import resumeData from "../data/resumeData";
import "./styles/Landing.css";

const Landing = ({ children }: PropsWithChildren) => {
  const headingRef = useRef<HTMLDivElement | null>(null);
  const { title, location, summary, certifications } = resumeData;
  const heroSummary = summary
    .split(". ")
    .slice(0, 2)
    .join(". ")
    .replace(/\.$/, "") + ".";

  useEffect(() => {
    if (!headingRef.current) return;
    headingRef.current.style.outline = "2px solid rgba(255, 173, 40, 0.75)";
    headingRef.current.style.outlineOffset = "14px";
    headingRef.current.style.boxShadow =
      "0 0 0 1px rgba(255, 255, 255, 0.08), 0 24px 60px rgba(0, 0, 0, 0.22)";
  }, []);

  return (
    <div className="landing-section" id="landingDiv">
      <div className="landing-panel">
        <div className="landing-pipeline" aria-label="CI/CD pipeline stages">
          <button type="button" className="stage-pill stage-pill-active">
            <span className="stage-icon">🧱</span>
            <div>
              <strong>Build</strong>
              <span>Compile & package</span>
            </div>
          </button>
          <button type="button" className="stage-pill">
            <span className="stage-icon">🧪</span>
            <div>
              <strong>Test</strong>
              <span>Automated quality gates</span>
            </div>
          </button>
          <button type="button" className="stage-pill">
            <span className="stage-icon">🚀</span>
            <div>
              <strong>Deploy</strong>
              <span>GitOps rollout</span>
            </div>
          </button>
          <button type="button" className="stage-pill">
            <span className="stage-icon">🟢</span>
            <div>
              <strong>Live</strong>
              <span>In production</span>
            </div>
          </button>
        </div>

        <div className="landing-grid">
          <section className="landing-copy">
            <p className="landing-eyebrow">Approaching the data center</p>
            <h2>Hello, I&apos;m</h2>
            <h1>
              GOPICHANDH
              <br />
              <span>MALLAVARAPU</span>
            </h1>
            <h3 className="landing-role">{title}</h3>
            <p className="landing-meta">{location}</p>
            <p className="landing-tagline">{heroSummary}</p>

            <div className="landing-cta">
              <a
                href="#contact"
                className="landing-btn landing-btn-primary"
                data-cursor="disable"
              >
                Get in touch
              </a>
              <a
                href="#career"
                className="landing-btn landing-btn-ghost"
                data-cursor="disable"
              >
                View experience
              </a>
            </div>
          </section>

          <aside className="landing-card">
            <div className="profile-card">
              <div className="profile-label">
                <span>Profile</span>
              </div>
              <div className="profile-image" aria-hidden="true" />
              <div className="profile-copy">
                <h4>Gopichandh Mallavarapu</h4>
                <p>Sr. Site Reliability / DevOps Engineer · Online</p>
              </div>
              <div className="profile-stats">
                  <div>
                  <strong>CKA</strong>
                  <span>Kubernetes</span>
                </div>
                <div>
                  <strong>CKAD</strong>
                  <span>CKS</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="landing-certifications">
          <h4>Certifications</h4>
          <div className="certification-grid">
            {certifications.map((cert, index) => (
              <div key={`${cert}-${index}`} className="cert-card cert-card-text">
                <div className="cert-card-copy">
                  <strong>{cert.split(" — ")[0]}</strong>
                  <span>{cert.split(" — ")[1] ?? "Verified industry credential"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
};

export default Landing;
