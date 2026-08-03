import { useState, useCallback, useEffect, useRef } from "react";
import "./styles/Work.css";
import WorkImage from "./WorkImage";
import { MdArrowBack, MdArrowForward } from "react-icons/md";

const projects = [
  {
    title: "Personal Tech Blog",
    category: "Platform Architecture",
    tools: "React, Vite, Netlify, SEO",
    image: "/images/proj-portfolio-example.svg",
    link: "#",
  },
  {
    title: "WhatsAppGPT",
    category: "AI WhatsApp Chatbot",
    tools: "OpenAI API, Python, WhatsApp Business API, Webhooks",
    image: "/images/proj-whatsappgpt.svg",
    link: "https://github.com/gopichandh",
  },
  {
    title: "AlertHub",
    category: "Unified Kubernetes Monitoring Platform",
    tools: "Cluster Topology, AI Chatbot, Alert & Incident Correlation",
    image: "/images/proj-alerthub.svg",
    link: "#",
  },
  {
    title: "Health Monitoring Dashboard",
    category: "Real-time EKS Cluster Health Tracking",
    tools: "Bash, Perl, HTML, CGI, Prometheus",
    image: "/images/proj-healthdash.svg",
    link: "#",
  },
];

const Work = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  indexRef.current = currentIndex;

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex(index);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating]
  );

  const goToPrev = useCallback(() => {
    const newIndex =
      indexRef.current === 0 ? projects.length - 1 : indexRef.current - 1;
    goToSlide(newIndex);
  }, [goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex =
      indexRef.current === projects.length - 1 ? 0 : indexRef.current + 1;
    goToSlide(newIndex);
  }, [goToSlide]);

  // Horizontal navigation: mouse wheel (trackpad swipe), drag/swipe, and arrow
  // keys — so visitors can move LEFT and right through the projects naturally,
  // not just via the arrow buttons.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    let wheelLock = false;
    const onWheel = (e: WheelEvent) => {
      // Only hijack clearly-horizontal intent so vertical page scroll is intact.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 12) {
        e.preventDefault();
        if (wheelLock) return;
        wheelLock = true;
        if (e.deltaX > 0) goToNext();
        else goToPrev();
        window.setTimeout(() => (wheelLock = false), 520);
      }
    };

    let startX = 0;
    let dragging = false;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      startX = e.clientX;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 60) {
        if (dx < 0) goToNext();
        else goToPrev();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [goToNext, goToPrev]);

  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>

        <div className="carousel-wrapper" ref={wrapperRef}>
          {/* Navigation Arrows */}
          <button
            className="carousel-arrow carousel-arrow-left"
            onClick={goToPrev}
            aria-label="Previous project"
            data-cursor="disable"
          >
            <MdArrowBack />
          </button>
          <button
            className="carousel-arrow carousel-arrow-right"
            onClick={goToNext}
            aria-label="Next project"
            data-cursor="disable"
          >
            <MdArrowForward />
          </button>

          {/* Slides */}
          <div className="carousel-track-container">
            <div
              className="carousel-track"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {projects.map((project, index) => (
                <div className="carousel-slide" key={index}>
                  <div className="carousel-content">
                    <div className="carousel-info">
                      <div className="carousel-number">
                        <h3>0{index + 1}</h3>
                      </div>
                      <div className="carousel-details">
                        <h4>{project.title}</h4>
                        <p className="carousel-category">
                          {project.category}
                        </p>
                        <div className="carousel-tools">
                          <span className="tools-label">Tools & Features</span>
                          <p>{project.tools}</p>
                        </div>
                      </div>
                    </div>
                    <div className="carousel-image-wrapper">
                      <WorkImage
                        image={project.image}
                        alt={project.title}
                        link={project.link}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="carousel-dots">
            {projects.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? "carousel-dot-active" : ""
                  }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to project ${index + 1}`}
                data-cursor="disable"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Work;
