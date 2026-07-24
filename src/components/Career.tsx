import "./styles/Career.css";

type CareerItem = {
  role: string;
  company: string;
  period: string;
  points: string[];
};

const careerData: CareerItem[] = [
  {
    role: "Senior Site Reliability Architect",
    company: "Diamondpick Inc. (DBA Galent) · Texas, USA · Project: Apple",
    period: "Feb 2025 – Present",
    points: [
      "Built AlertHub — an all-in-one monitoring platform unifying cluster topology visualization, an AI-powered chatbot, and alert/incident correlation.",
      "Migrated Kubernetes from a Rancher-managed setup to a Kubeadm-based architecture powering developer preview environments via Ingress-managed URLs.",
      "Engineered Jenkins CI/CD pipelines with Helm-based deployments and GitOps workflows across Jenkins + GitHub.",
    ],
  },
  {
    role: "Senior Technical Consultant (DevOps)",
    company: "GSPANN Technologies · Oregon, USA · Project: Nike",
    period: "Jan 2024 – Jan 2025",
    points: [
      "Provisioned and automated an EKS cluster using Ansible + CloudFormation integrated with Jenkins pipelines.",
      "Implemented detailed tagging and reporting that surfaced 15% in AWS cost savings.",
      "Led the Build Automation team to cut CI/CD execution time by 60% through parallelization, intelligent job caching, and artifact reuse.",
    ],
  },
  {
    role: "Senior Technical Lead (DevOps)",
    company: "WHISK Software · Hyderabad, India · Project: Apple",
    period: "Apr 2021 – Dec 2023",
    points: [
      "Automated GitHub user management with a Python Flask API, reducing manual effort by 40% and saving 5 hours weekly.",
      "Designed monitoring for Kubernetes clusters with Prometheus and ArgoCD, boosting visibility by 20%.",
      "Reduced downtime by 15% and cut incident resolution time by 25% through proactive observability.",
    ],
  },
  {
    role: "Senior System Engineer",
    company: "EPAM Systems · Hyderabad, India · Project: UnitedHealthcare",
    period: "Jan 2021 – Mar 2021",
    points: [
      "Streamlined CI/CD workflows with Jenkins and AWS, improving cross-team collaboration.",
      "Ensured 99% SLA adherence and reduced downtime by 15% through prompt pipeline issue resolution and stable deployments.",
    ],
  },
  {
    role: "Technical Lead (DevOps)",
    company: "WHISK Software · Hyderabad, India · Project: Kohls",
    period: "Jul 2018 – Dec 2020",
    points: [
      "Implemented the ELK stack, reducing downtime by 10%.",
      "Built an EKS Health Monitoring Dashboard (Bash, Perl, HTML, CGI) that cut incident response times by 25%.",
      "Automated infrastructure tasks with Bash, reducing manual errors by 40% and improving uptime by 20%.",
    ],
  },
  {
    role: "DevOps Engineer",
    company: "Cambridge Technology Enterprises · Hyderabad, India",
    period: "Jun 2016 – Jun 2018",
    points: [
      "Managed 5 AWS accounts hosting banking websites with a 3-tier architecture.",
      "Automated end-to-end deployments using Jenkins and Ansible, cutting deploy time by 50%.",
      "Streamlined Bitbucket → AWS EFS delivery and implemented centralized CloudWatch cross-account dashboards.",
    ],
  },
  {
    role: "Senior CloudOps Engineer",
    company: "INDMAX IT Services · Hyderabad, India · Project: Flurry",
    period: "Aug 2013 – May 2016",
    points: [
      "Enhanced AWS CloudWatch monitoring to cut resource costs by 25%.",
      "Automated tasks with Bash, saving 5 hours weekly.",
      "Optimized infrastructure with AWS Auto Scaling and ELB, improving system performance by 25% under fluctuating demand.",
    ],
  },
];

const Career = () => {
  return (
    <div id="career" className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>

          {careerData.map((item, index) => (
            <div className="career-info-box" key={index}>
              <div className="career-info-in">
                <div className="career-role">
                  <h4>{item.role}</h4>
                  <h5>{item.company}</h5>
                </div>
                <h3>{item.period}</h3>
              </div>
              <ul className="career-points">
                {item.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;
