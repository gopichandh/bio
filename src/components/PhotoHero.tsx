import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLoading } from "../context/LoadingProvider";
import { setProgress } from "./Loading";
import portrait from "../assets/portrait.jpg";
import "./styles/PhotoHero.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * PhotoHero replaces the original WebGL 3D character.
 *
 * Benefits:
 *  - Renders the real portrait of Gopichandh (background removed) instead of a
 *    generic 3D avatar.
 *  - Removes the entire three.js / WebCrypto / HDR pipeline, which is what
 *    failed to display in Safari, so the hero now works in every browser.
 *  - Still drives the existing loading-progress mechanism (setProgress) and
 *    resolves loading once the image has decoded, so the intro text FX and
 *    the loader hand-off behave exactly as before.
 *  - Re-creates the scroll animations that the 3D pipeline used to set up
 *    (WhatIDo panel reveal + Career timeline) without any three.js import.
 */

// Career timeline reveal — ported from GsapScroll.setAllTimeline() but with
// zero three.js dependency so the bundle stays light and Safari-safe.
function setupScrollAnimations() {
  // On desktop the hero portrait is position:fixed and sits above the page
  // (z-index 11). The original 3D character used scroll timelines to slide
  // itself out of the way; we reproduce that so the fixed photo fades and
  // drifts away as the visitor scrolls past the landing section, revealing
  // the sections underneath instead of covering them.
  if (window.innerWidth > 1024) {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: ".landing-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
      // autoAlpha (opacity + visibility) so that once the fixed hero card has
      // faded out it is set to visibility:hidden — this stops it from
      // swallowing pointer events over the sections scrolled underneath while
      // still letting the card be interactive (hover "welcome") at the top.
      .to(".photo-hero", { autoAlpha: 0, y: "8%", scale: 0.96, duration: 1 }, 0)
      .to(".photo-rim", { opacity: 0, duration: 0.6 }, 0)
      .to(".landing-container", { opacity: 0, y: "35%", duration: 0.8 }, 0);
  }

  const careerTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".career-section",
      start: "top 30%",
      end: "100% center",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  careerTimeline
    .fromTo(
      ".career-timeline",
      { maxHeight: "10%" },
      { maxHeight: "100%", duration: 0.5 },
      0
    )
    .fromTo(".career-timeline", { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0)
    .fromTo(
      ".career-info-box",
      { opacity: 0 },
      { opacity: 1, stagger: 0.1, duration: 0.5 },
      0
    )
    .fromTo(
      ".career-dot",
      { animationIterationCount: "infinite" },
      { animationIterationCount: "1", delay: 0.3, duration: 0.1 },
      0
    );

  if (window.innerWidth > 1024) {
    careerTimeline.fromTo(
      ".career-section",
      { y: 0 },
      { y: "20%", duration: 0.5, delay: 0.2 },
      0
    );
  }

  // Staggered fade-in for the Tech Stack skill cards
  gsap.fromTo(
    ".tech-card",
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: ".techstack",
        start: "top 75%",
      },
    }
  );

  // About portrait fades / rises in as its section enters view
  gsap.fromTo(
    ".about-photo-wrap",
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".about-section",
        start: "top 70%",
      },
    }
  );
}

const PhotoHero = () => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const { setLoading } = useLoading();

  useEffect(() => {
    const progress = setProgress((value) => setLoading(value));

    const finish = () => {
      progress.loaded().then(() => {
        gsap.to(".photo-rim", {
          opacity: 1,
          duration: 1.6,
          ease: "power2.out",
        });
        gsap.fromTo(
          ".photo-hero-img",
          { opacity: 0, y: 40, filter: "blur(12px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.4,
            ease: "power3.out",
          }
        );
        setupScrollAnimations();
      });
    };

    const img = imgRef.current;
    if (img) {
      if (img.complete && img.naturalWidth > 0) {
        finish();
      } else {
        img.addEventListener("load", finish, { once: true });
        img.addEventListener("error", finish, { once: true });
      }
    } else {
      finish();
    }

    // 3D interactive "character": the portrait tilts in perspective and
    // shifts its depth layers toward the cursor, giving a live, volumetric
    // feel — a Safari-safe replacement for the old WebGL avatar.
    let raf = 0;
    const target = { x: 0, y: 0 }; // normalized -0.5..0.5
    const current = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      target.x = e.clientX / window.innerWidth - 0.5;
      target.y = e.clientY / window.innerHeight - 0.5;
    };

    const render = () => {
      current.x += (target.x - current.x) * 0.07;
      current.y += (target.y - current.y) * 0.07;
      if (wrapRef.current) {
        const el = wrapRef.current;
        // Parallax translation (px) + 3D rotation (deg) toward the cursor.
        // Stronger amplitude gives the bigger hero a more volumetric,
        // "living character" feel as the pointer moves across the page.
        el.style.setProperty("--px", `${current.x * 40}px`);
        el.style.setProperty("--py", `${current.y * 28}px`);
        el.style.setProperty("--rx", `${-current.y * 18}deg`);
        el.style.setProperty("--ry", `${current.x * 24}deg`);
      }
      raf = requestAnimationFrame(render);
    };
    render();
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMouseMove);
      if (img) {
        img.removeEventListener("load", finish);
        img.removeEventListener("error", finish);
      }
    };
  }, []);

  return (
    <>
      <div className="photo-hero" ref={wrapRef}>
        <div className="photo-rim" />
        <div className="photo-hero-float">
          <div className="photo-card">
            <img
              ref={imgRef}
              className="photo-hero-img"
              src={portrait}
              alt="Gopichandh Mallavarapu — Sr. Site Reliability / DevOps Engineer"
              draggable={false}
            />
            <div className="photo-chip">
              <span className="photo-chip-dot" />
              <span className="photo-chip-text">
                <span className="photo-chip-name">Gopichandh Mallavarapu</span>
                <span className="photo-chip-role">
                  Sr. Site Reliability / DevOps Engineer · Online
                </span>
              </span>
            </div>
            {/* Recruiter-friendly greeting that fades in on hover */}
            <div className="photo-welcome" aria-hidden="true">
              <span className="photo-welcome-wave">👋</span>
              <span className="photo-welcome-title">
                Hi there! Welcome to my bio-portfolio
              </span>
              <span className="photo-welcome-sub">
                Thanks for stopping by — let's build reliable systems together.
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PhotoHero;
