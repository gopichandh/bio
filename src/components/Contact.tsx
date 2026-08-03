import { useState, FormEvent } from "react";
import { MdArrowOutward, MdCopyright } from "react-icons/md";
import QuoteBox from "./QuoteBox";
import "./styles/Contact.css";

// Messages submitted through the form are delivered here.
const CONTACT_EMAIL = "mallavarapu.gopichandh@gmail.com";
// FormSubmit.co forwards submissions straight to CONTACT_EMAIL with no API
// key or backend required (the very first submission triggers a one-time
// confirmation email to activate the address). We use its AJAX endpoint so
// the visitor stays on the page.
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

type Status = "idle" | "sending" | "success" | "error";

const Contact = () => {
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  // Fallback: open the visitor's email client pre-addressed to Gopichandh so their
  // message still reaches mallavarapu.gopichandh@gmail.com if the network call fails.
  const mailtoFallback = () => {
    const form = document.querySelector<HTMLFormElement>(".contact-form");
    const name = (form?.elements.namedItem("name") as HTMLInputElement)?.value || "";
    const email = (form?.elements.namedItem("email") as HTMLInputElement)?.value || "";
    const message =
      (form?.elements.namedItem("message") as HTMLTextAreaElement)?.value || "";
    const subject = encodeURIComponent(`Portfolio message from ${name || "a visitor"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>Contact</h3>
        <p className="contact-intro">
          Have a role, a project, or just want to talk about building great
          experiences? Drop a message or reach out on any channel — I usually
          reply within a day.
        </p>
        <div className="contact-flex">
          <div className="contact-box contact-form-box">
            <h4>Send a message</h4>
            <form className="contact-form" onSubmit={handleSubmit}>
              {/* FormSubmit config — delivered to mallavarapu.gopichandh@gmail.com */}
              <input
                type="hidden"
                name="_subject"
                value="New message from my portfolio site"
              />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_captcha" value="false" />
              <div className="contact-field-row">
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  required
                  data-cursor="disable"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your email"
                  required
                  data-cursor="disable"
                />
              </div>
              <textarea
                name="message"
                placeholder="Tell me about your project or role…"
                rows={4}
                required
                data-cursor="disable"
              />
              <button
                type="submit"
                className="contact-submit"
                data-cursor="disable"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
              {status === "success" && (
                <p className="contact-note contact-note-ok">
                  Thanks! Your message has been sent.
                </p>
              )}
              {status === "error" && (
                <p className="contact-note contact-note-err">
                  Something went wrong.{" "}
                  <button
                    type="button"
                    className="contact-mailto"
                    onClick={mailtoFallback}
                    data-cursor="disable"
                  >
                    Email Gopichandh directly
                  </button>{" "}
                  instead.
                </p>
              )}
            </form>
          </div>

          <div className="contact-box contact-info-box">
            <h4>Connect</h4>
            <div className="contact-social-list">
              <a
                href="https://www.linkedin.com/in/gopi89/"
                target="_blank"
                rel="noreferrer"
                data-cursor="disable"
                className="contact-social"
              >
                LinkedIn <MdArrowOutward />
              </a>
              <a
                href="https://github.com/gopichandh"
                target="_blank"
                rel="noreferrer"
                data-cursor="disable"
                className="contact-social"
              >
                GitHub <MdArrowOutward />
              </a>
            </div>
            <div className="contact-based-block">
              <h4 className="contact-based">Based in</h4>
              <p>Austin, TX</p>
            </div>
          </div>
        </div>

        <QuoteBox />
      </div>

      {/* Full-width professional footer — spans the screen; the credit sits at
          the bottom-right, small and muted, exactly where it belongs. */}
      <footer className="site-footer">
        <span className="footer-left">
          <MdCopyright /> 2026 · Austin, TX
        </span>
        <span className="footer-credit">
          Designed &amp; developed by <span>Gopichandh Mallavarapu</span>
        </span>
      </footer>
    </div>
  );
};

export default Contact;
