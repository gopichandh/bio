import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import "./styles/Navbar.css";
import { useLoading } from "../context/LoadingProvider";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
export let smoother: ScrollSmoother;

const Navbar = () => {
  const { setIsLoading } = useLoading();

  useEffect(() => {
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.7,
      speed: 1.7,
      effects: true,
      autoResize: true,
      ignoreMobileResize: true,
    });

    smoother.scrollTop(0);
    smoother.paused(true);

    let links = document.querySelectorAll(".header ul a[data-href]");
    links.forEach((elem) => {
      let element = elem as HTMLAnchorElement;
      element.addEventListener("click", (e) => {
        if (window.innerWidth > 1024) {
          e.preventDefault();
          let elem = e.currentTarget as HTMLAnchorElement;
          let section = elem.getAttribute("data-href");
          smoother.scrollTo(section, true, "top top");
        }
      });
    });
    window.addEventListener("resize", () => {
      ScrollSmoother.refresh(true);
    });
  }, []);

  // "Home" replays the datacenter arrival cinematic, then lands at the top.
  const replayIntro = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (smoother) smoother.scrollTop(0);
      window.scrollTo(0, 0);
    } catch {
      /* no-op */
    }
    setIsLoading(true);
  };

  // The "VM" logo simply glides back to the top of the page (main view) —
  // no cinematic replay, just a smooth scroll home.
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (smoother) smoother.scrollTo(0, true);
      else window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      <div className="header">
        <div className="header-left">
          <a
            href="#"
            className="navbar-title"
            data-cursor="disable"
            onClick={scrollToTop}
          >
            VM
          </a>
          <ul>
            <li>
              <a href="#" className="nav-home" onClick={replayIntro}>
                <HoverLinks text="HOME" />
              </a>
            </li>
            <li>
              <a data-href="#about" href="#about">
                <HoverLinks text="ABOUT" />
              </a>
            </li>
            <li>
              <a data-href="#career" href="#career">
                <HoverLinks text="EXPERIENCE" />
              </a>
            </li>
            <li>
              <a data-href="#contact" href="#contact">
                <HoverLinks text="CONTACT" />
              </a>
            </li>
          </ul>
        </div>
        <a
          href="https://www.linkedin.com/in/vilas-mankala/"
          className="navbar-connect"
          data-cursor="disable"
          target="_blank"
          rel="noreferrer"
        >
          linkedin.com/in/vilas-mankala
        </a>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
