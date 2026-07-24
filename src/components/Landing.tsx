import { PropsWithChildren } from "react";
import "./styles/Landing.css";

const Landing = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello, I&apos;m</h2>
            <h1>
              VILAS
              <br />
              <span>MANKALA</span>
            </h1>
            <h3 className="landing-role">Senior Site Reliability Architect</h3>
            <p className="landing-tagline">
              13+ years architecting resilient, self-healing cloud platforms —
              Kubernetes, AWS, and GitOps automation engineered to stay fast,
              observable, and always on.
            </p>
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
                View my experience
              </a>
            </div>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
