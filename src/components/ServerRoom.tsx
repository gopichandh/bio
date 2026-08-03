import "./styles/ServerRoom.css";

const HIGHLIGHTS = [
  {
    title: "Platform Reliability",
    text: "Designing resilient Kubernetes and cloud platforms with clear SLO-focused operational standards.",
  },
  {
    title: "OpenShift Container Platform",
    text: "Building and operating Red Hat OpenShift Container Platform (OCP) clusters for secure, scalable enterprise workloads.",
  },
  {
    title: "Automation First",
    text: "Reducing manual effort using Infrastructure as Code, GitOps workflows, and repeatable CI/CD release pipelines.",
  },
  {
    title: "Observability",
    text: "Implementing actionable telemetry with Grafana, Dynatrace, and alerting patterns that improve response speed.",
  },
  {
    title: "Secure Delivery",
    text: "Embedding security into platform engineering through policy, secrets management, and controlled deployment practices.",
  },
];

const ServerRoom = () => {
  return (
    <section className="server-room" aria-label="Engineering highlights">
      <div className="server-room-shell">
        <p className="server-room-kicker">Engineering Focus</p>
        <h3>What I Deliver</h3>
        <div className="server-room-grid">
          {HIGHLIGHTS.map((item) => (
            <article key={item.title} className="server-room-card">
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServerRoom;
