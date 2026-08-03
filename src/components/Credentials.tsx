import "./styles/Credentials.css";
import { TbCertificate, TbSchool } from "react-icons/tb";
import resumeData from "../data/resumeData";

const Credentials = () => {
  const certifications = resumeData.certifications;
  const education = resumeData.education;

  return (
    <div id="credentials" className="credentials-section section-container">
      <div className="cred-block">
        <div className="cred-head">
          <TbCertificate className="cred-head-icon" />
          <h2>
            Certifica<span>tions</span>
          </h2>
          <p className="cred-lead">
            Proven certifications that strengthen my cloud and platform experience.
          </p>
        </div>

        <div className="cert-grid cert-grid-text">
          {certifications.map((cert, index) => (
            <article className="cert-card cert-card-simple" key={`${cert}-${index}`}>
              <div className="cert-body cert-body-simple">
                <h3>{cert.split(" — ")[0]}</h3>
                <p>{cert.split(" — ")[1] ?? "Verified certification"}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="cred-block">
        <div className="cred-head">
          <TbSchool className="cred-head-icon" />
          <h2>
            Educa<span>tion</span>
          </h2>
          <p className="cred-lead">Formal education supporting my technical foundation.</p>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Credentials;
