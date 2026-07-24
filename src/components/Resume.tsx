import { useEffect, useState } from "react";
import { MdArrowBack, MdPrint } from "react-icons/md";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

  // Open when the RESUME button (in SocialIcons) dispatches the event, or if
  // arriving via a shareable ?resume link.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("resume") !== null) setOpen(true);

    const openHandler = () => setOpen(true);
    window.addEventListener("open-resume", openHandler);
    return () => window.removeEventListener("open-resume", openHandler);
  }, []);

  // Lock scrolling while open and allow Esc to close.
  //
  // The site scrolls via GSAP ScrollSmoother (a transform on #smooth-content),
  // NOT native body scroll — so toggling `body.overflow` alone left the page
  // frozen after the résumé closed. We must PAUSE the smoother while the
  // overlay is open and, crucially, un-pause it again on close so the visitor
  // can scroll the page afterwards.
  useEffect(() => {
    // Helper: fully hand scrolling back to ScrollSmoother. Simply calling
    // `paused(false)` sometimes leaves the smoother in a wedged state (its
    // internal RAF/observers desync after the overlay froze the page), so we
    // also refresh ScrollTrigger and re-sync the scroll position on the next
    // frame — that reliably lets the visitor scroll up/down again after close.
    const resumeScroll = () => {
      document.body.style.overflow = "";
      if (smoother) {
        smoother.paused(false);
        // Re-sync on the next frame once styles have settled.
        requestAnimationFrame(() => {
          try {
            const y = smoother.scrollTop();
            smoother.scrollTop(y);
            ScrollTrigger.refresh();
          } catch {
            /* no-op */
          }
        });
      }
    };

    if (open) {
      document.body.style.overflow = "hidden";
      smoother?.paused(true);
    } else {
      resumeScroll();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => {
      // Always restore scrolling when this effect tears down.
      resumeScroll();
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="resume-overlay" role="dialog" aria-modal="true">
      {/* Light scrim — the website stays faintly visible behind it */}
      <div className="resume-backdrop" onClick={() => setOpen(false)} />

      <div className="resume-modal">
        <div className="resume-toolbar">
          <button
            className="resume-tool-btn resume-back"
            onClick={() => setOpen(false)}
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
              <span className="resume-private" title="Private — shared on request">
                {resumeData.privatePhone}
              </span>
              <span className="resume-private" title="Private — shared on request">
                {resumeData.privateEmail}
              </span>
              <span className="resume-private-note">
                {resumeData.privacyNote}
              </span>
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
