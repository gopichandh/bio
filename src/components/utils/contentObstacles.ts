/**
 * contentObstacles
 *
 * Shared helper used by the playful overlay layers (Football, RoamingBot) so
 * they can roam the EMPTY GAPS of the page and never drift on top of any text
 * or image. It collects the on-screen bounding boxes of the readable / visual
 * content inside #smooth-content and exposes simple circle-vs-rect collision
 * resolution so a floating element bounces cleanly around the content.
 *
 * Rects are returned in viewport (client) pixel coordinates and are padded a
 * little so companions keep a respectful margin from the content edges.
 */

export type ObRect = { x: number; y: number; w: number; h: number };

// Tags that represent readable text / imagery / controls we must never cover.
const SELECTOR = [
  "h1",
  "h2",
  "h3",
  "h4",
  "p",
  "img",
  "a",
  "button",
  "li",
  "input",
  "textarea",
  "label",
]
  .map((s) => `#smooth-content ${s}`)
  .join(",");

/** Collect padded, on-screen content rectangles to treat as solid obstacles. */
export function collectObstacles(pad = 12): ObRect[] {
  const out: ObRect[] = [];
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const els = document.querySelectorAll<HTMLElement>(SELECTOR);
  els.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 6 || r.height < 6) return; // ignore slivers
    // keep only boxes intersecting (or near) the viewport
    if (r.bottom < -60 || r.top > vh + 60) return;
    if (r.right < -60 || r.left > vw + 60) return;
    out.push({
      x: r.left - pad,
      y: r.top - pad,
      w: r.width + pad * 2,
      h: r.height + pad * 2,
    });
  });
  return out;
}

/** True if the point lies inside any obstacle (used for target picking). */
export function pointBlocked(x: number, y: number, rects: ObRect[]): boolean {
  for (const r of rects) {
    if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) return true;
  }
  return false;
}

/**
 * Resolve a circle (cx,cy,radius) against every obstacle: if it penetrates a
 * box, push it out along the shallowest axis and reflect the supplied velocity
 * (mutated in place). Returns true if any collision was resolved.
 */
export function resolveCircle(
  ball: { x: number; y: number; vx: number; vy: number },
  radius: number,
  rects: ObRect[],
  restitution = 0.7
): boolean {
  let hit = false;
  for (const r of rects) {
    const overlapLeft = ball.x + radius - r.x;
    const overlapRight = r.x + r.w - (ball.x - radius);
    const overlapTop = ball.y + radius - r.y;
    const overlapBottom = r.y + r.h - (ball.y - radius);
    if (
      overlapLeft <= 0 ||
      overlapRight <= 0 ||
      overlapTop <= 0 ||
      overlapBottom <= 0
    ) {
      continue; // no overlap on at least one axis
    }
    hit = true;
    const minX = Math.min(overlapLeft, overlapRight);
    const minY = Math.min(overlapTop, overlapBottom);
    if (minX < minY) {
      if (overlapLeft < overlapRight) {
        ball.x = r.x - radius;
        ball.vx = -Math.abs(ball.vx) * restitution - 18;
      } else {
        ball.x = r.x + r.w + radius;
        ball.vx = Math.abs(ball.vx) * restitution + 18;
      }
    } else {
      if (overlapTop < overlapBottom) {
        ball.y = r.y - radius;
        ball.vy = -Math.abs(ball.vy) * restitution - 18;
      } else {
        ball.y = r.y + r.h + radius;
        ball.vy = Math.abs(ball.vy) * restitution + 18;
      }
    }
  }
  return hit;
}
