import "./styles/WhatIDo.css";

/**
 * WhatIDo — reworked as a fully-visible "professional summary" panel.
 *
 * The previous version relied on hover-to-expand cards that clipped their
 * content (only one card's text showed at a time). This version lays the
 * focus areas out as always-open summary blocks with clear bullet points,
 * so every visitor can read everything without interacting.
 */

type Focus = {
  title: string;
  subtitle: string;
  points: string[];
  tags: string[];
};

const focus: Focus[] = [
  {
    title: "Reliability & Cloud",
    subtitle: "Site Reliability & Kubernetes Architecture",
    points: [
      "Architect resilient, self-healing AWS + Kubernetes platforms that stay healthy under real-world load.",
      "Define and defend SLAs/SLOs, error budgets, and capacity plans to keep services fast and always-on.",
      "Lead incident response and blameless post-mortems, cutting downtime and mean-time-to-recovery.",
    ],
    tags: ["AWS", "Kubernetes", "Docker & Helm", "Linux", "SLAs & SLOs", "Incident Mgmt"],
  },
  {
    title: "Automate & Observe",
    subtitle: "CI/CD, GitOps & Observability",
    points: [
      "Automate everything through GitOps pipelines and infrastructure-as-code for repeatable, auditable delivery.",
      "Build end-to-end observability — metrics, logs, traces and alerting — so teams ship with full visibility.",
      "Drive cost optimisation and cut CI/CD execution time through parallelisation, caching and artifact reuse.",
    ],
    tags: ["Jenkins", "Terraform", "Ansible", "Python & Bash", "Prometheus & Grafana", "Datadog & Splunk"],
  },
];

const WhatIDo = () => {
  return (
    <div className="whatIDO" id="whatido">
      <div className="what-head">
        <h2 className="title">
          W<span className="hat-h2">HAT</span>
          <div>
            I<span className="do-h2"> DO</span>
          </div>
        </h2>
        <p className="what-lead">
          A snapshot of where I focus — written up as a professional summary so
          you can see the whole picture at a glance.
        </p>
      </div>

      <div className="what-panels">
        {focus.map((f) => (
          <article className="what-panel" key={f.title}>
            <div className="what-panel-head">
              <h3>{f.title}</h3>
              <h4>{f.subtitle}</h4>
            </div>
            <ul className="what-points">
              {f.points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
            <h5>Skillset &amp; tools</h5>
            <div className="what-content-flex">
              {f.tags.map((t) => (
                <span className="what-tags" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default WhatIDo;
