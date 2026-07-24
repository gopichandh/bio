import "./styles/TechStack.css";

type SkillGroup = {
  title: string;
  skills: string[];
};

const groups: SkillGroup[] = [
  {
    title: "Cloud & Infrastructure",
    skills: [
      "AWS",
      "EKS / EC2 / S3",
      "CloudFormation",
      "CloudWatch",
      "Auto Scaling & ELB",
      "Linux / Solaris",
    ],
  },
  {
    title: "Containers & Orchestration",
    skills: ["Kubernetes", "Kubeadm", "Docker", "Helm", "Rancher", "Ingress"],
  },
  {
    title: "CI/CD & GitOps",
    skills: ["Jenkins", "ArgoCD", "GitHub Actions", "GitOps", "Bitbucket", "Git"],
  },
  {
    title: "Infrastructure as Code",
    skills: ["Terraform", "Ansible", "CloudFormation", "Bash", "Python", "Flask"],
  },
  {
    title: "Observability & Monitoring",
    skills: [
      "Prometheus",
      "Grafana",
      "Datadog",
      "Splunk",
      "ELK Stack",
      "AlertHub",
    ],
  },
  {
    title: "Reliability & Practices",
    skills: [
      "SLAs & SLOs",
      "Incident Mgmt",
      "Cost Optimization",
      "Capacity Planning",
      "On-call / DR",
      "AI Ops",
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
