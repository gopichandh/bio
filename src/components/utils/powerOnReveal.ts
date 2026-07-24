import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * powerOnReveal — "boots up" any element carrying the .power-on class as it
 * scrolls into view: it flickers on like a monitor waking from standby
 * (opacity + slight scale + a brightness flash), the way a datacenter screen
 * powers up. Safe to call multiple times; it refreshes on layout changes.
 */
export default function powerOnReveal() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(".power-on", { opacity: 1, clearProps: "all" });
    return;
  }

  const targets = gsap.utils.toArray<HTMLElement>(".power-on");

  targets.forEach((el) => {
    gsap.set(el, { opacity: 0, y: 40, scale: 0.985 });

    gsap
      .timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 82%",
          toggleActions: "play none none none",
        },
      })
      // quick CRT-style flicker before the steady state
      .to(el, { opacity: 0.25, duration: 0.08 })
      .to(el, { opacity: 0.05, duration: 0.06 })
      .to(el, { opacity: 0.4, duration: 0.06 })
      .to(el, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: "power2.out",
        onStart: () => el.classList.add("powered"),
      });
  });

  ScrollTrigger.refresh();
}
