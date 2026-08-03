import "./styles/TechStack.css";

type SkillGroup = {
  title: string;
  skills: string[];
};

const groups: SkillGroup[] = [
  {
    title: "Cloud & Data Tools",
    skills: [
      "AWS",
      "GCP",
      "Azure",
      "Snowflake",
      "BigQuery",
      "CloudStack",
    ],
  },
  {
    title: "Containers & Orchestration",
    skills: [
      "Kubernetes",
      "OpenShift Container Platform (OCP)",
      "Docker",
      "Helm",
      "Kustomize",
      "ArgoCD",
    ],
  },
  {
    title: "CI/CD & GitOps",
    skills: [
      "GitHub Actions",
      "Jenkins",
      "GitLab CI",
      "Bitbucket",
      "Git",
      "ArgoCD",
    ],
  },
  {
    title: "Infrastructure Automation",
    skills: [
      "Terraform",
      "Ansible",
      "CloudFormation",
      "Chef",
      "Vault",
      "Bash",
    ],
  },
  {
    title: "Observability Tools",
    skills: [
      "Dynatrace",
      "Grafana",
      "Prometheus",
      "Splunk",
      "Datadog",
      "New Relic",
    ],
  },
  {
    title: "Security & Platform Tools",
    skills: [
      "HashiCorp Vault",
      "RBAC",
      "OIDC",
      "Pod Security Admission",
      "Twistlock",
      "Sysdig",
    ],
  },
];

const TechStack = () => {
  return (
    <div className="techstack" id="techstack">
      <h2>My Tech Stack</h2>
      <div className="tech-grid">
        {groups.map((group) => (
          <div className="tech-card" key={group.title}>
            <h3>{group.title}</h3>
            <div className="tech-chips">
              {group.skills.map((skill, i) => (
                <span className="tech-chip" key={skill}>
                  <i
                    className="tech-status"
                    style={{ animationDelay: `${(i % 5) * 0.35}s` }}
                  />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechStack;
