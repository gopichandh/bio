/**
 * mascotShared
 *
 * Tiny module-level state shared between the two independent mascots — the
 * roaming 3D bot ([`RoamingBot.tsx`]) and the physics football
 * ([`Football.tsx`]). Both live on separate full-viewport canvases and never
 * import each other, so this module is the neutral ground they use to:
 *
 *   • publish their current on-screen position (CSS pixels), and
 *   • read the other one's position so they can gently repel each other and
 *     keep a comfortable distance — the frame never feels cluttered with the
 *     two of them bunched together, yet the visitor can still push the ball
 *     right up to the bot while playing.
 *
 * Screen-space (CSS px) is used for both so distance maths is trivial and
 * resolution-independent; each component converts to/from its own coordinate
 * frame as needed.
 */

// Bot head position, projected to CSS pixels. `ready` flips true once the
// WebGL scene has produced at least one projected frame.
export const botScreen = { x: 0, y: 0, ready: false };

// Ball centre in CSS pixels + its radius. `active` flips true once the ball
// canvas is live so readers can ignore a stale/zeroed position.
export const ballScreen = { x: -9999, y: -9999, r: 18, active: false };
