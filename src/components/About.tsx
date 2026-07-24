import { useEffect, useRef } from "react";
import "./styles/About.css";

/**
 * About
 *
 * The portrait now behaves like a small 3D character: it lives on a tilting
 * card that reacts to the pointer with real perspective (rotateX / rotateY)
 * and a parallax glow, and its default resting pose is angled toward the
 * About copy on the right — so it literally "looks at" the text. The copy
 * itself runs full-width beside it in a clean, bold display font.
 */
const About = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const wrap = wrapRef.current;
    const photo = photoRef.current;
    if (!wrap || !photo) return;

    // Resting pose: gently turned toward the copy on the right.
    let targetRX = 4;
    let targetRY = 14;
    let rx = targetRX;
    let ry = targetRY;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5; // -0.5 .. 0.5
      const ny = e.clientY / window.innerHeight - 0.5;
      // Follow the cursor but keep a rightward bias so it favours the text.
      targetRY = 14 + nx * 22;
      targetRX = 4 - ny * 16;
    };

    const tick = () => {
      rx += (targetRX - rx) * 0.06;
      ry += (targetRY - ry) * 0.06;
      photo.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="about-section" id="about">
      <div className="about-grid">
        <div className="about-photo-wrap" ref={wrapRef}>
          <div className="about-photo-glow" />
          <div className="about-photo-3d" ref={photoRef}>
            <span className="about-ring about-ring-a" />
            <span className="about-ring about-ring-b" />
            <img
              className="about-photo"
              src="/images/vilas1-cutout.png"
              alt="Vilas Mankala"
              loading="lazy"
              draggable={false}
            />
          </div>
        </div>
        <div className="about-me">
          <h3 className="title">About Me</h3>
          <p className="para">
            I'm an experienced Site Reliability Engineer with 13+ years in
            infrastructure management, focusing on optimizing reliability,
            scalability, and performance. I'm skilled in cloud platforms,
            automating operations, and ensuring SLAs and SLOs are met — with
            strong problem-solving abilities, collaboration, and a proactive
            approach to incident management. I've engineered CI/CD pipelines,
            Kubernetes platforms, and observability stacks for teams at Apple,
            Nike, Kohls, and UnitedHealthcare.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
