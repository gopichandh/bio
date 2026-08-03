import { useEffect, useRef, useState } from "react";
import { MdArrowBack, MdPrint } from "react-icons/md";
import { smoother } from "./Navbar";
import resumeData from "../data/resumeData";
import "./styles/Resume.css";

/**
 * Résumé viewer.
 *
 * Opens as an overlay ON TOP of the website (the site stays faintly visible
 * behind a light scrim, so it reads as part of the page rather than a hard
 * modal). The full résumé is shown; only the private contact details — phone
 * number and email — are blurred. A clear "Back to website" button (and the
 * backdrop / Esc key) returns the visitor to the site.
 *
 * ALL content comes from ../data/resumeData.ts — edit that single file to
 * update the résumé; this component only handles presentation.
 */

const Resume = () => {
  const [open, setOpen] = useState(false);
  // Remembers the scroll offset while the résumé is open so we can restore it
  // when the overlay opens (used only to keep the frozen page in place).
  const savedScrollY = useRef(0);

  // Open when the RESUME button (in SocialIcons) dispatches the event, or if
  // arriving via a shareable ?resume link.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("resume") !== null) setOpen(true);

    const openHandler = () => setOpen(true);
    window.addEventListener("open-resume", openHandler);
    return () => window.removeEventListener("open-resume", openHandler);
  }, []);

  // Closing the résumé does a clean, full page reload back at the top of the
  // site (stripping any ?resume query so it doesn't immediately re-open).
  //
  // Why a reload instead of un-pausing ScrollSmoother in place? The smoother's
  // paused()/scrollTop() dance was proving unreliable — after closing, the page
  // would sometimes refuse to scroll until a manual refresh. A hard reload
  // GUARANTEES a fresh, fully-scrollable page every time, which is exactly the
  // behaviour requested. The brief flash is an acceptable trade for rock-solid
  // scrolling.
  const closeResume = () => {
    const url = window.location.pathname + window.location.hash;
    window.location.assign(url);
    // In the rare case assign() doesn't trigger a navigation (same URL), force
    // a reload so the page always comes back fully scrollable.
    window.location.reload();
  };

  // While the résumé is open we freeze the underlying page by pausing
  // ScrollSmoother (the reload on close restores everything cleanly).
  useEffect(() => {
    const lock = () => {
      if (!smoother) return;
      try {
        savedScrollY.current = smoother.scrollTop();
        smoother.paused(true);
      } catch {
        /* no-op */
      }
    };

    if (open) lock();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeResume();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="resume-overlay" role="dialog" aria-modal="true">
      {/* Light scrim — the website stays faintly visible behind it */}
      <div className="resume-backdrop" onClick={closeResume} />

      <div className="resume-modal">
        <div className="resume-toolbar">
          <button
            className="resume-tool-btn resume-back"
            onClick={closeResume}
            data-cursor="disable"
            aria-label="Back to website"
          >
            <MdArrowBack /> Back to website
          </button>
          <button
            className="resume-tool-btn"
            onClick={() => window.print()}
            data-cursor="disable"
            aria-label="Print or save as PDF"
          >
            <MdPrint /> Print / PDF
          </button>
        </div>

        <div className="resume-doc">
          <header className="resume-head">
            <h1>{resumeData.name}</h1>
            <p className="resume-title">{resumeData.title}</p>
            <p className="resume-meta">
              {resumeData.location} · {resumeData.links}
            </p>
            <p className="resume-contact">
              <span>{resumeData.privatePhone}</span>
              <span>{resumeData.privateEmail}</span>
            </p>
          </header>

          <section className="resume-block">
            <h2>Summary</h2>
            <p>{resumeData.summary}</p>
          </section>

          <section className="resume-block">
            <h2>Experience</h2>
            {resumeData.experience.map((job, i) => (
              <div className="resume-job" key={i}>
                <div className="resume-job-head">
                  <h3>{job.role}</h3>
                  <span className="resume-period">{job.period}</span>
                </div>
                <p className="resume-company">{job.company}</p>
                <ul>
                  {job.points.map((p, j) => (
                    <li key={j}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="resume-block">
            <h2>Skills</h2>
            <div className="resume-skills">
              {resumeData.skills.map((s, i) => (
                <p key={i}>
                  <strong>{s.group}:</strong> {s.items}
                </p>
              ))}
            </div>
          </section>

          <section className="resume-block">
            <h2>Certifications</h2>
            <ul>
              {resumeData.certifications.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>

          <section className="resume-block">
            <h2>Education</h2>
            {resumeData.education.map((e, i) => (
              <div className="resume-job" key={i}>
                <div className="resume-job-head">
                  <h3>{e.degree}</h3>
                  <span className="resume-period">{e.period}</span>
                </div>
                <p className="resume-company">{e.school}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Resume;
