import "./styles/Career.css";
import resumeData from "../data/resumeData";

type CareerItem = {
  role: string;
  company: string;
  period: string;
  points: string[];
};

const Career = () => {
  const careerData: CareerItem[] = resumeData.experience.map((job) => ({
    role: job.role,
    company: job.company,
    period: job.period,
    points: job.points,
  }));
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
