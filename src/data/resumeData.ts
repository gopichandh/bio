/**
 * resumeData.ts — SINGLE SOURCE OF TRUTH for Gopichandh Mallavarapu's résumé content.
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
  name: "GOPICHANDH MALLAVARAPU",
  title: "Sr. Site Reliability / DevOps Engineer",
  location: "Liberty Hill, TX",
  links: "linkedin.com/in/gopi89 · github.com/gopichandh",
  privatePhone: "📞 +1 (504) 577-3331",
  privateEmail: "✉ mallavarapu.gopichandh@gmail.com",
  privacyNote: "Contact details shared on request.",

  summary:
    "Results-driven Senior Site Reliability / DevOps Engineer with 8 years of experience designing, automating, and operating enterprise-scale platforms across financial services, telecom, and Big Tech. Currently at Apple, leading Kubernetes platform migrations and observability engineering at scale. Triple Kubernetes certified (CKA, CKAD, CKS) and Red Hat OpenShift Specialist with deep multi-cloud expertise across AWS, GCP, and Azure. Proven ability to drive zero-downtime migrations, build GitOps-driven CI/CD pipelines, implement HashiCorp Vault security frameworks, and architect Data Lake solutions using Snowflake and AWS. Known for reducing MTTD through SLI/SLO-based observability, owning 24×7 on-call operations, and delivering platform reliability at Apple-grade scale.",

  experience: [
    {
      role: "Sr. Site Reliability Engineer",
      company: "Apple · Austin, TX",
      period: "Sep 2025 – Present",
      points: [
        "Led end-to-end Kubernetes workload migration from Rancher to Varanet by refactoring Helm charts, ingress configs, storage classes, and RBAC policies to Apple's platform standards; achieved zero production disruption across all environments.",
        "Engineered comprehensive Dynatrace observability including custom dashboards, SLI/SLO alerting, and analytics reports; reduced MTTD by standardizing metrics pipelines and distributed trace collection across all engineering teams.",
        "Designed Grafana and Splunk dashboards for real-time visibility into Kubernetes cluster health, workload performance, and operational KPIs across multi-tenant production clusters at Apple scale.",
        "Enforced Pod Security Standards (PSS) and workload hardening across multi-tenant clusters; automated RBAC provisioning and Snowflake warehouse management, cutting compute costs and manual toil significantly.",
        "Provided L3 on-call support for large-scale microservices; leveraged logs, metrics, and traces to resolve P1/P2 incidents; optimized HPA strategies and resource right-sizing to improve resilience and reduce operational overhead.",
        "Supported CloudStack VM orchestration and network provisioning; ensured secure workload onboarding using Shield and Pomelo for secret management, compliance checks, and audit governance.",
        "Integrated Kafka event-driven pipelines and Snowflake data workflows with Kubernetes workloads; contributed to DataLake and PowerBI reporting infrastructure for real-time operational analytics.",
      ],
    },
    {
      role: "Lead Site Reliability / DevOps Engineer",
      company: "Fannie Mae · Reston, VA",
      period: "Feb 2023 – Aug 2025",
      points: [
        "Provisioned and managed GKE clusters with autoscaling node pools, workload identity, and VPC-native networking; architected multi-tenant SaaS platforms with namespace isolation, resource quotas, and cost governance.",
        "Architected CI/CD pipelines with blue-green and canary strategies and OAuth/OIDC authentication; integrated GKE with Cloud SQL, BigQuery, and GCS for data-driven SaaS applications achieving 99.9%+ uptime SLAs.",
        "Built enterprise-scale Data Lake on AWS using S3, Glue, Athena, and Snowflake; implemented automated ETL/ELT pipelines with Snowpipe and CDC via AWS DMS for real-time structured and semi-structured data ingestion.",
        "Deployed HashiCorp Vault for dynamic secrets, PKI management, and key rotation across CI/CD and container platforms; administered JFrog Artifactory and Xray for Docker image lifecycle and vulnerability governance.",
        "Implemented secure data ingestion pipelines with IAM, KMS encryption, and fine-grained Snowflake access control; optimized large-scale Snowflake workloads using clustering keys and cost monitoring strategies.",
      ],
    },
    {
      role: "Site Reliability / DevOps Engineer",
      company: "Verizon · Dallas, TX",
      period: "Jan 2021 – Feb 2023",
      points: [
        "Built GitHub Actions CI/CD pipelines for Kubernetes-hosted applications; containerized legacy monolithic workloads using Docker and Kubernetes, reducing deployment time by 40% and improving cross-environment consistency.",
        "Automated Dynatrace OneAgent Operator deployment on Kubernetes/OpenShift clusters via ArgoCD GitOps methodology, enabling consistent and repeatable observability rollouts with automated rollback across all environments.",
        "Implemented production-grade, HA, fault-tolerant auto-scaling Kubernetes infrastructure with advanced HPA and cluster autoscaler configurations; supported enterprise-scale microservice container orchestration.",
        "Deployed and managed CloudBees Jenkins, SonarQube, and Nexus; integrated SonarQube into CI pipelines for code quality gates, coverage enforcement, and security scanning as part of a DevSecOps governance framework.",
        "Established enterprise-wide Git branching strategies, tagging standards, and governance policies across GitHub and GitLab; enforced Configuration-as-Code using Chef and Docker for consistent environment management across all teams.",
        "Designed and implemented Prometheus and Grafana monitoring stacks; created alerting runbooks and on-call escalation procedures that reduced mean time to resolution (MTTR) for production incidents by 35%.",
      ],
    },
    {
      role: "Infrastructure Engineer",
      company: "Discover Financial Services · Riverwood, IL",
      period: "Sep 2018 – Jan 2021",
      points: [
        "Developed Golang microservices using goroutines and channels for high-throughput concurrent data collection and processing; maintained >85% Go test coverage across all microservices.",
        "Operated OpenShift platform by managing Docker containers and Kubernetes clusters; administered projects, services, routes, BuildConfigs, ImageStreams, and templates across development and production environments.",
        "Authored Ansible playbooks for fully automated provisioning and configuration of RHEL servers across test and production environments, eliminating manual configuration drift and reducing server provisioning time by 60%.",
        "Automated code builds and deployments via Jenkins, Git, Docker, Ansible, and CloudFormation; integrated HashiCorp Vault for dynamic secret management and JFrog Artifactory for artifact versioning and governance.",
        "Implemented load-balanced OpenShift routes and Kubernetes services for external traffic management; troubleshot pods via SSH and logs, resolving platform-level issues that improved overall service uptime.",
        "Contributed to platform infrastructure automation including log aggregation pipelines using ELK and Splunk; set up Prometheus alerting and Grafana dashboards for infrastructure health monitoring and capacity planning.",
      ],
    },
  ],

  skills: [
    {
      group: "Container & Orchestration",
      items: "Kubernetes (GKE, EKS, AKS), OpenShift (OCP), Rancher, Docker, Helm, Kustomize, ArgoCD, Kueue, PSS",
    },
    {
      group: "Cloud Platforms",
      items: "AWS (Lambda, EKS, S3, CloudWatch, IAM, DMS, Glue, Athena), GCP (GKE, BigQuery, Cloud IAM, GCS), Azure",
    },
    {
      group: "CI/CD & GitOps",
      items: "GitHub Actions, Jenkins (CloudBees), GitLab CI, ArgoCD, Serverless Framework, Blue-Green/Canary",
    },
    {
      group: "IaC & Config Mgmt",
      items: "Terraform (multi-cloud), Ansible, Chef, CloudFormation, Helm, Kustomize",
    },
    {
      group: "Security & Secrets",
      items: "HashiCorp Vault (PKI, dynamic secrets), Twistlock, Sysdig, RBAC, OIDC/OAuth, Pod Security Admission",
    },
    {
      group: "Observability",
      items: "Dynatrace (SLI/SLO), Grafana, Prometheus, Splunk, Datadog, New Relic, Instana, AppDynamics, Moogsoft",
    },
    {
      group: "Data & Storage",
      items: "Snowflake, Apache Kafka, PostgreSQL, DynamoDB, Redis, AWS Glue/Athena, Snowpipe, CDC (AWS DMS)",
    },
    {
      group: "Artifact & Build",
      items: "JFrog Artifactory, Nexus, Xray, Maven, Gradle, SonarQube",
    },
    {
      group: "Languages",
      items: "Go (Golang), Python, Bash/Shell, Scala, Spring Boot, Node.js",
    },
    {
      group: "Collaboration",
      items: "ServiceNow, Jira, Confluence, GitHub Enterprise, PagerDuty, RCA Frameworks",
    },
  ],

  certifications: [
    "Certified Kubernetes Administrator (CKA) — CKA-1900-003685-0100",
    "Certified Kubernetes Application Developer (CKAD) — LF-imw4atln5q",
    "Certified Kubernetes Security Specialist (CKS)",
    "Red Hat OpenShift Specialist — 200-186-401",
    "AWS Developer — RYMGSZH1L2E4QFKD",
    "CloudBees Jenkins — 2020",
  ],

  education: [
    {
      degree: "M.S. Computer Information Systems",
      school: "Southern University at New Orleans, LA",
      period: "2016 – 2018",
    },
    {
      degree: "B.S. Computer Science",
      school: "KL University, Vijayawada, AP",
      period: "2011 – 2015",
    },
  ],
};

export default resumeData;
