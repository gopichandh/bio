/**
 * resumeData.ts — SINGLE SOURCE OF TRUTH for Vilas Mankala's résumé content.
 *
 * ▸ Edit THIS file (and only this file) whenever the résumé changes — e.g. a
 *   new role, an updated bullet, extra skills, a fresh certification, etc.
 * ▸ Both the on-page résumé viewer (Resume.tsx) and any other component that
 *   needs this data import from here, so you never have to touch the UI code
 *   again just to update content.
 *
 * Keeping content separate from presentation keeps the site production-grade
 * and trivial to maintain over time.
 */

export type Job = {
  role: string;
  company: string;
  period: string;
  points: string[];
};

export type SkillGroup = {
  group: string;
  items: string;
};

export type Education = {
  degree: string;
  school: string;
  period: string;
};

export type ResumeData = {
  /** Header / identity */
  name: string;
  title: string;
  location: string;
  links: string; // e.g. "linkedin.com/in/... · github.com/..."
  /** Private contact details shown blurred for privacy */
  privatePhone: string;
  privateEmail: string;
  privacyNote: string;
  /** Professional summary paragraph */
  summary: string;
  /** Work history (most recent first) */
  experience: Job[];
  /** Grouped skills */
  skills: SkillGroup[];
  /** Certifications (plain strings) */
  certifications: string[];
  /** Education history */
  education: Education[];
};

const resumeData: ResumeData = {
  name: "Vilas Mankala",
  title: "Senior Site Reliability Architect",
  location: "Texas, USA",
  links: "linkedin.com/in/vilas-mankala · github.com/vilasmankala",
  privatePhone: "📞 +1 (000) 000-0000",
  privateEmail: "✉ private@email.com",
  privacyNote: "Contact details hidden for privacy — reach out via LinkedIn.",

  summary:
    "Site Reliability Engineer with 13+ years in infrastructure management, " +
    "focused on reliability, scalability, and performance. Skilled in cloud " +
    "platforms, automating operations, and meeting SLAs/SLOs — with strong " +
    "incident management and a proactive, collaborative approach. Delivered " +
    "CI/CD pipelines, Kubernetes platforms, and observability stacks for " +
    "Apple, Nike, Kohls, and UnitedHealthcare.",

  experience: [
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
        "Ensured 99% SLA adherence and reduced downtime by 15% through prompt pipeline issue resolution.",
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
        "Optimized infrastructure with AWS Auto Scaling and ELB, improving performance by 25% under fluctuating demand.",
      ],
    },
  ],

  skills: [
    { group: "Cloud", items: "AWS (EKS, EC2, S3, CloudWatch, CloudFormation), Auto Scaling, ELB" },
    { group: "Containers", items: "Kubernetes, Kubeadm, Docker, Helm, ArgoCD, Rancher" },
    { group: "CI/CD & GitOps", items: "Jenkins, GitHub Actions, GitOps, Bitbucket" },
    { group: "IaC & Automation", items: "Terraform, Ansible, CloudFormation, Python, Bash, Perl" },
    { group: "Observability", items: "Prometheus, Grafana, ELK, Datadog, Splunk, CloudWatch" },
    { group: "Practices", items: "SRE, SLAs/SLOs, Incident Management, Cost Optimization" },
  ],

  certifications: [
    "AWS Certified Solutions Architect – Associate",
    "Certified Kubernetes Administrator (CKA)",
    "Google Professional Cloud Architect",
    "Oracle Solaris 10 System Administrator I & II",
  ],

  education: [
    {
      degree: "B.Tech, Computer Science & Engineering",
      school: "St. Martin's Engineering College (Affiliated with JNTU)",
      period: "Aug 2008 – Apr 2012 · Hyderabad, India",
    },
    {
      degree: "Higher Secondary Certificate (HSC) — MPC",
      school: "Aurora Junior College",
      period: "Jun 2006 – Mar 2008 · Jagtial, India",
    },
  ],
};

export default resumeData;
