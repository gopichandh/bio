import "./styles/Credentials.css";
import { FaAws } from "react-icons/fa6";
import { SiKubernetes, SiGooglecloud } from "react-icons/si";
import {
  TbCertificate,
  TbSchool,
  TbBook2,
  TbExternalLink,
  TbDatabase,
} from "react-icons/tb";

type Cert = {
  name: string;
  issuer: string;
  credId: string;
  icon: JSX.Element;
  accent: string;
};

const certs: Cert[] = [
  {
    name: "AWS Certified Solutions Architect – Associate",
    issuer: "Amazon Web Services",
    credId: "AWS-ASA-21809",
    icon: <FaAws />,
    accent: "#ff9900",
  },
  {
    name: "Certified Kubernetes Administrator (CKA)",
    issuer: "The Linux Foundation / CNCF",
    credId: "LF-ruhc7azssb",
    icon: <SiKubernetes />,
    accent: "#326ce5",
  },
  {
    name: "Professional Cloud Architect",
    issuer: "Google Cloud",
    credId: "9ace6b062e1",
    icon: <SiGooglecloud />,
    accent: "#4285f4",
  },
  {
    name: "Solaris 10 System Administrator Part I & II",
    issuer: "Oracle",
    credId: "OC1173797",
    icon: <TbDatabase />,
    accent: "#f80000",
  },
];

type Pub = {
  title: string;
  detail: string;
  link?: { label: string; url: string };
};

const publications: Pub[] = [
  {
    title: "Anthropic AI Certification Modules",
    detail:
      "Completed Anthropic certification modules on the Claude API, Model Context Protocol, Agent Skills, and applied AI systems.",
    link: { label: "Anthropic · 2026", url: "https://www.anthropic.com" },
  },
  {
    title: "vmbuzz.com — Technical Blog Platform",
    detail:
      "Designed and built a website dedicated to blog publication, sharing SRE, DevOps and cloud engineering insights.",
    link: { label: "vmbuzz.com", url: "https://vmbuzz.com" },
  },
  {
    title: "AI-Driven WhatsApp Chatbot",
    detail:
      "Built an AI-driven WhatsApp chatbot using the OpenAI API for automated, conversational responses.",
    link: {
      label: "GitHub · WhatsAppGPT",
      url: "https://github.com/vilasmankala",
    },
  },
];

type Edu = {
  degree: string;
  school: string;
  period: string;
  place: string;
};

const education: Edu[] = [
  {
    degree: "Bachelor of Technology (B.Tech) — Computer Science & Engineering",
    school: "St. Martin's Engineering College (Affiliated with JNTU)",
    period: "Aug 2008 – Apr 2012",
    place: "Hyderabad, India",
  },
  {
    degree: "Higher Secondary Certificate (HSC) — MPC",
    school: "Aurora Junior College",
    period: "Jun 2006 – Mar 2008",
    place: "Jagtial, India",
  },
  {
    degree: "Secondary School Certificate (SSC)",
    school: "Nikhil Bharat Convent High School",
    period: "Jun 2005 – Mar 2006",
    place: "Jagtial, India",
  },
];

const Credentials = () => {
  return (
    <div id="credentials" className="credentials-section section-container">
      {/* -------- Certifications -------- */}
      <div className="cred-block">
        <div className="cred-head">
          <TbCertificate className="cred-head-icon" />
          <h2>
            Certifica<span>tions</span>
          </h2>
          <p className="cred-lead">
            Industry credentials that back up the hands-on cloud &amp; platform work.
          </p>
        </div>

        <div className="cert-grid">
          {certs.map((c) => (
            <article
              className="cert-card"
              key={c.credId}
              style={{ ["--certAccent" as string]: c.accent }}
            >
              <div className="cert-logo">{c.icon}</div>
              <div className="cert-body">
                <h3>{c.name}</h3>
                <p className="cert-issuer">{c.issuer}</p>
                <span className="cert-id">Credential ID · {c.credId}</span>
              </div>
              <span className="cert-verified">Verified</span>
            </article>
          ))}
        </div>
      </div>

      {/* -------- Publications & Achievements -------- */}
      <div className="cred-block">
        <div className="cred-head">
          <TbBook2 className="cred-head-icon" />
          <h2>
            Publications <span>&amp; Achievements</span>
          </h2>
        </div>

        <div className="pub-grid">
          {publications.map((p) => (
            <article className="pub-card" key={p.title}>
              <h3>{p.title}</h3>
              <p>{p.detail}</p>
              {p.link && (
                <a
                  href={p.link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="pub-link"
                  data-cursor="disable"
                >
                  {p.link.label} <TbExternalLink />
                </a>
              )}
            </article>
          ))}
        </div>
      </div>

      {/* -------- Education -------- */}
      <div className="cred-block">
        <div className="cred-head">
          <TbSchool className="cred-head-icon" />
          <h2>
            Educa<span>tion</span>
          </h2>
        </div>

        <div className="edu-timeline">
          {education.map((e, i) => (
            <div className="edu-item" key={i}>
              <div className="edu-marker">
                <span className="edu-dot" />
                {i < education.length - 1 && <span className="edu-line" />}
              </div>
              <div className="edu-content">
                <div className="edu-top">
                  <h3>{e.degree}</h3>
                  <span className="edu-period">{e.period}</span>
                </div>
                <p className="edu-school">{e.school}</p>
                <p className="edu-place">{e.place}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Credentials;
