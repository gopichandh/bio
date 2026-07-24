import { useEffect, useRef } from "react";
import "./styles/Football.css";
import { collectObstacles, resolveCircle, ObRect } from "./utils/contentObstacles";
import { botScreen, ballScreen } from "./utils/mascotShared";

/**
 * Football
 *
 * A fun, physics-driven FIFA-style ball that floats around the EMPTY GAPS of
 * the page. It roams the whole viewport freely but treats every block of text
 * and every image as a solid obstacle — bouncing around them so it never sits
 * on top of anything the visitor is reading or looking at.
 *
 * The visitor "kicks" it with the cursor; the ball rolls with light drag and
 * bounces off the viewport edges and content boxes. A goal post sits centred
 * on the right edge; driving the ball into it scores (a discreet counter kept
 * at the bottom of the screen + a brief GOAL! flash at the goal).
 *
 * Pure canvas + rAF, respects prefers-reduced-motion, pointer-events:none on
 * the layer (pointer tracked globally) so it never blocks the page.
 */

const Football = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let w = window.innerWidth;
    let h = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;

    // Ball radius — a touch smaller on phones so it stays a neat accent that
    // never crowds the headings/copy on a narrow screen.
    const R = window.innerWidth < 768 ? 13 : 18;

    const ball = {
      x: w * 0.5,
      y: h * 0.4,
      vx: 150,
      vy: 90,
      angle: 0,
      spin: 0,
    };

    const pointer = { x: -9999, y: -9999, px: -9999, py: -9999, vx: 0, vy: 0 };
    const trail: { x: number; y: number }[] = [];

    // Content obstacles — refreshed periodically (cheap) and on scroll/resize.
    let obstacles: ObRect[] = [];
    const refreshObstacles = () => {
      obstacles = collectObstacles(14);
    };

    /* ---------------- Goal post (centred on the right edge) ---------------- */
    const goal = { w: 22, h: 90, x: 0, y: 0 };
    const placeGoal = () => {
      goal.x = w - goal.w - 6;
      goal.y = h * 0.5 - goal.h / 2;
    };
    let goalFlash = 0;
    let idleTime = 4; // seconds since the ball was last kicked (drives the "kick me" nudge)

    // --- Auto "the-bot-scored" shot scheduler -----------------------------
    // Every so often the ball lines itself up in the clear right gutter (at the
    // goal's height) and is tapped precisely into the CENTRE of the goal for a
    // tidy, satisfying score. It happens fairly often at first, then the gap
    // grows so it becomes an occasional treat rather than a distraction. The
    // whole manoeuvre stays inside the empty right gutter so it never crosses
    // (or blocks) any text/heading in the centred content column.
    let autoElapsed = 0; // seconds accumulated toward the next attempt
    let autoGap = 9; // seconds until the first attempt (frequent early on)
    let aiming = false; // true while lining up / taking a shot
    let aimHold = 0; // small settle timer once positioned before the tap

    const roundRect = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      rw: number,
      rh: number,
      rad: number
    ) => {
      c.beginPath();
      c.moveTo(x + rad, y);
      c.arcTo(x + rw, y, x + rw, y + rh, rad);
      c.arcTo(x + rw, y + rh, x, y + rh, rad);
      c.arcTo(x, y + rh, x, y, rad);
      c.arcTo(x, y, x + rw, y, rad);
      c.closePath();
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      placeGoal();
      refreshObstacles();
    };

    const setPointer = (cx: number, cy: number) => {
      pointer.px = pointer.x;
      pointer.py = pointer.y;
      pointer.x = cx;
      pointer.y = cy;
      pointer.vx = pointer.x - pointer.px;
      pointer.vy = pointer.y - pointer.py;
    };

    const onMove = (e: MouseEvent) => {
      setPointer(e.clientX, e.clientY);
    };

    // Touch support so mobile visitors can dribble/kick the ball with a finger.
    // The layer is pointer-events:none, so these window-level listeners simply
    // track the finger; when it comes near the ball, step() imparts a kick just
    // like the mouse. We snap the pointer to the first touch on touchstart to
    // avoid a spurious huge velocity from the previous stale position.
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      pointer.x = t.clientX;
      pointer.y = t.clientY;
      pointer.px = t.clientX;
      pointer.py = t.clientY;
      pointer.vx = 0;
      pointer.vy = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      setPointer(t.clientX, t.clientY);
    };

    // When the finger lifts, park the pointer off-screen so the ball is free to
    // drift again instead of sticking to the last touch point.
    const onTouchEnd = () => {
      pointer.x = -9999;
      pointer.y = -9999;
      pointer.px = -9999;
      pointer.py = -9999;
      pointer.vx = 0;
      pointer.vy = 0;
    };

    /* ---------------- Rendering ---------------- */
    const drawBall = () => {
      for (let i = 0; i < trail.length; i++) {
        const tpt = trail[i];
        const a = (i / trail.length) * 0.16;
        ctx.beginPath();
        ctx.arc(tpt.x, tpt.y, R * (0.4 + (i / trail.length) * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      }

      // contact shadow
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(ball.x, ball.y + R * 0.92, R * 0.9, R * 0.32, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.filter = "blur(3px)";
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(ball.x, ball.y);
      ctx.rotate(ball.angle);

      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const grad = ctx.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.1, 0, 0, R);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.7, "#eef1f4");
      grad.addColorStop(1, "#c3ccd6");
      ctx.fillStyle = grad;
      ctx.fillRect(-R, -R, R * 2, R * 2);

      ctx.fillStyle = "#12161c";
      const drawPent = (cx: number, cy: number, rad: number, rot: number) => {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = rot + (i / 5) * Math.PI * 2 - Math.PI / 2;
          const px = cx + Math.cos(a) * rad;
          const py = cy + Math.sin(a) * rad;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      };
      drawPent(0, 0, R * 0.32, 0);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const cx = Math.cos(a) * R * 0.72;
        const cy = Math.sin(a) * R * 0.72;
        drawPent(cx, cy, R * 0.19, a + Math.PI);
      }
      ctx.strokeStyle = "rgba(20,24,30,0.55)";
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * R * 0.32, Math.sin(a) * R * 0.32);
        ctx.lineTo(Math.cos(a) * R * 0.72, Math.sin(a) * R * 0.72);
        ctx.stroke();
      }

      const gloss = ctx.createRadialGradient(
        -R * 0.4,
        -R * 0.45,
        1,
        -R * 0.4,
        -R * 0.45,
        R * 0.9
      );
      gloss.addColorStop(0, "rgba(255,255,255,0.55)");
      gloss.addColorStop(0.4, "rgba(255,255,255,0)");
      ctx.fillStyle = gloss;
      ctx.fillRect(-R, -R, R * 2, R * 2);

      ctx.restore();

      ctx.beginPath();
      ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(120,140,160,0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    const drawGoal = () => {
      const gx = goal.x;
      const gy = goal.y;
      const gw = goal.w;
      const gh = goal.h;

      // --- Framed rail behind the goal-post — mirrors the left social-icons
      // rail: a slim, softly-shaded vertical panel hugging the right edge with a
      // delicate teal border on its LEFT edge, so the goal sits inside a clean,
      // intentional frame just like the social icons do on the left. ---
      const railW = gw + 26;
      const railX = w - railW;
      const railPadY = 26;
      const railY = gy - 20 - railPadY;
      const railH = gh + 40 + railPadY * 2;
      ctx.save();
      const railGrad = ctx.createLinearGradient(railX, 0, railX + railW, 0);
      railGrad.addColorStop(0, "rgba(94,234,212,0.05)");
      railGrad.addColorStop(1, "rgba(255,255,255,0.02)");
      ctx.fillStyle = railGrad;
      roundRect(ctx, railX, railY, railW + 4, railH, 14);
      ctx.fill();
      // teal border down the LEFT edge of the rail (matches .social-icons border)
      ctx.strokeStyle = "rgba(94,234,212,0.28)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(railX, railY + 8);
      ctx.lineTo(railX, railY + railH - 8);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = "rgba(200,230,240,0.22)";
      ctx.lineWidth = 1;
      const cells = 5;
      for (let i = 0; i <= cells; i++) {
        const yy = gy + (gh / cells) * i;
        ctx.beginPath();
        ctx.moveTo(gx, yy);
        ctx.lineTo(gx + gw, yy);
        ctx.stroke();
      }
      for (let i = 0; i <= 3; i++) {
        const xx = gx + (gw / 3) * i;
        ctx.beginPath();
        ctx.moveTo(xx, gy);
        ctx.lineTo(xx, gy + gh);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = goalFlash > 0 ? "#8effe0" : "rgba(94,234,212,0.85)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.shadowColor = "rgba(94,234,212,0.8)";
      ctx.shadowBlur = goalFlash > 0 ? 20 : 8;
      ctx.beginPath();
      ctx.moveTo(gx + gw, gy);
      ctx.lineTo(gx + gw, gy + gh);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + gw, gy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(gx, gy + gh);
      ctx.lineTo(gx + gw, gy + gh);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx, gy + gh * 0.16);
      ctx.moveTo(gx, gy + gh);
      ctx.lineTo(gx, gy + gh * 0.84);
      ctx.stroke();
      ctx.restore();

      // GOAL! flash beside the goal mouth (left of the frame so it never sits
      // under the scoreboard mounted above the posts).
      if (goalFlash > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, goalFlash * 2);
        ctx.fillStyle = "#8effe0";
        ctx.font = "800 20px Inter, system-ui, sans-serif";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(94,234,212,0.9)";
        ctx.shadowBlur = 16;
        ctx.fillText("GOAL!", gx - 12, gy + gh / 2);
        ctx.restore();
      }

      // Stadium-style scoreboard mounted just above the goal frame.
      drawScoreboard(gx, gy, gw);
    };

    // A compact "GOALS · N" scoreboard sitting on top of the goal posts. It
    // pops when a goal is scored (driven by goalFlash) so the tally always
    // reads clearly right where the action happens.
    const drawScoreboard = (gx: number, gy: number, gw: number) => {
      const s = scoreRef.current;
      const label = "GOALS";
      const numStr = String(s);
      const padX = 13;
      const gap = 11;

      ctx.save();
      ctx.font = "700 11px Inter, system-ui, sans-serif";
      const lw = ctx.measureText(label).width;
      ctx.font = "800 19px Inter, system-ui, sans-serif";
      const nw = ctx.measureText(numStr).width;

      const bw = padX * 2 + lw + gap + nw;
      const bh = 34;
      const bx = gx + gw - bw;
      const by = gy - bh - 16;
      const cx = bx + bw / 2;
      const cy = by + bh / 2;

      // pop scale on score
      const scale = 1 + Math.min(goalFlash, 1) * 0.16;
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -cy);

      // card
      const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
      grad.addColorStop(0, "rgba(10,22,28,0.94)");
      grad.addColorStop(1, "rgba(6,12,18,0.94)");
      ctx.fillStyle = grad;
      roundRect(ctx, bx, by, bw, bh, 10);
      ctx.fill();
      ctx.strokeStyle = goalFlash > 0 ? "#8effe0" : "rgba(94,234,212,0.55)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "rgba(94,234,212,0.7)";
      ctx.shadowBlur = goalFlash > 0 ? 20 : 7;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // little connector "stems" from the crossbar to the board
      ctx.strokeStyle = "rgba(94,234,212,0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bx + bw * 0.32, by + bh);
      ctx.lineTo(bx + bw * 0.32, gy);
      ctx.moveTo(bx + bw * 0.72, by + bh);
      ctx.lineTo(bx + bw * 0.72, gy);
      ctx.stroke();

      // label + number
      ctx.textBaseline = "middle";
      ctx.font = "700 11px Inter, system-ui, sans-serif";
      ctx.fillStyle = "rgba(185,205,210,0.85)";
      ctx.textAlign = "left";
      ctx.fillText(label, bx + padX, cy + 1);
      ctx.font = "800 19px Inter, system-ui, sans-serif";
      ctx.fillStyle = goalFlash > 0 ? "#8effe0" : "#5eead4";
      ctx.fillText(numStr, bx + padX + lw + gap, cy + 1);
      ctx.restore();
    };

    // Floating "kick me" nudge that appears when the ball has been idle for a
    // little while, gently inviting the visitor to interact with it.
    const drawReminder = (now: number) => {
      if (idleTime < 2.5) return;
      const pulse = 0.5 + 0.5 * Math.sin(now * 0.006);

      // gentle beckoning ring that expands and fades
      ctx.save();
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, R + 5 + pulse * 9, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(94,234,212,${0.45 * (1 - pulse) + 0.12})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // floating tag above the ball — alternates between inviting a kick and
      // nudging the visitor to score into the goal on the right edge.
      const label =
        Math.floor(now * 0.0004) % 2 === 0 ? "Kick me! ⚽" : "Score a goal →";
      ctx.save();
      ctx.font = "700 13px Inter, system-ui, sans-serif";
      const tw = ctx.measureText(label).width;
      const bw = tw + 22;
      const bh = 26;
      const bx = ball.x - bw / 2;
      const by = ball.y - R - 40 - pulse * 4;
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = "rgba(8,15,26,0.88)";
      roundRect(ctx, bx, by, bw, bh, 9);
      ctx.fill();
      ctx.strokeStyle = "rgba(94,234,212,0.7)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ball.x - 6, by + bh);
      ctx.lineTo(ball.x + 6, by + bh);
      ctx.lineTo(ball.x, by + bh + 7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#dffbf4";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, ball.x, by + bh / 2);
      ctx.restore();
    };

    const tryScore = () => {
      if (
        ball.x > goal.x - R * 0.2 &&
        ball.y > goal.y &&
        ball.y < goal.y + goal.h &&
        ball.vx > 0
      ) {
        scoreRef.current += 1;
        goalFlash = 1.0;
        // pop the ball back out toward the centre with fresh pace
        ball.x = goal.x - R - 2;
        ball.vx = -Math.abs(ball.vx) * 0.7 - 180;
        ball.vy = (Math.random() - 0.5) * 160;
      }
    };

    const step = (dt: number) => {
      goalFlash = Math.max(0, goalFlash - dt);

      // --- Kick: pointer proximity + speed imparts impulse ---
      const dx = ball.x - pointer.x;
      const dy = ball.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      const pSpeed = Math.hypot(pointer.vx, pointer.vy);
      // "Playing" = the finger/cursor is right by the ball. While playing we
      // relax the bot-avoidance so the visitor can dribble the ball right up to
      // the bot; the rest of the time the two mascots keep well apart.
      const playing = dist < R + 60;
      if (dist < R + 26) {
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);
        const impulse = 220 + pSpeed * 14;
        ball.vx += nx * impulse * dt * 12;
        ball.vy += ny * impulse * dt * 12;
        ball.vx += pointer.vx * 6;
        ball.vy += pointer.vy * 6;
        ball.spin += (pointer.vx - pointer.vy) * 0.02;
        idleTime = 0;
        // A human kick always takes priority — abort any auto-shot in progress.
        aiming = false;
      }

      // --- Auto "the-bot-scored" manoeuvre -------------------------------
      // When idle (visitor isn't playing) the ball periodically lines itself up
      // in the clear RIGHT gutter and taps a clean goal into the CENTRE of the
      // posts. Frequent at first, then the interval grows so it stays a subtle
      // delight. The lineup point sits in the empty gutter to the right of the
      // content column, so the ball never travels across any text.
      const goalCenterY = goal.y + goal.h / 2;
      const edgeMargin = Math.max(24, Math.min(w, h) * 0.05);
      const lineupX = Math.min(goal.x - 130, w - R - edgeMargin);
      if (!playing) {
        if (!aiming) {
          autoElapsed += dt;
          if (autoElapsed >= autoGap) {
            aiming = true;
            aimHold = 0;
            autoElapsed = 0;
            // Grow the gap each time so it slows down: 9s → 14 → 19 … capped.
            autoGap = Math.min(38, autoGap + 5);
          }
        } else {
          // Phase 1: glide to the lineup spot (right gutter, goal height).
          const tx = lineupX;
          const ty = goalCenterY;
          const adx = tx - ball.x;
          const ady = ty - ball.y;
          const adist = Math.hypot(adx, ady);
          if (adist > 8 && aimHold <= 0) {
            // steer smoothly toward the lineup spot
            const desiredVX = (adx / (adist || 1)) * 260;
            const desiredVY = (ady / (adist || 1)) * 260;
            ball.vx += (desiredVX - ball.vx) * Math.min(1, dt * 4);
            ball.vy += (desiredVY - ball.vy) * Math.min(1, dt * 4);
          } else {
            // Phase 2: settle briefly, then TAP precisely into the goal centre.
            aimHold += dt;
            ball.vx *= 0.6;
            ball.vy *= 0.6;
            if (aimHold > 0.35) {
              const sdx = goal.x + goal.w - ball.x;
              const sdy = goalCenterY - ball.y;
              const sd = Math.hypot(sdx, sdy) || 1;
              const shotSpeed = 560;
              ball.vx = (sdx / sd) * shotSpeed;
              ball.vy = (sdy / sd) * shotSpeed;
              ball.spin = 0.25;
              aiming = false;
              idleTime = 0;
            }
          }
        }
      } else {
        // While the visitor plays, keep the timer from firing immediately after.
        autoElapsed = Math.min(autoElapsed, autoGap * 0.5);
      }

      // --- Repel from the roaming bot so the two mascots keep a comfortable
      // distance and the frame never looks cluttered with both bunched
      // together. Soft, distance-scaled push; strongly relaxed while playing so
      // the ball can still be driven toward the bot for fun. ---
      if (botScreen.ready && !aiming) {
        const bdx = ball.x - botScreen.x;
        const bdy = ball.y - botScreen.y;
        const bd = Math.hypot(bdx, bdy);
        // desired separation (much smaller while playing so the ball can be
        // driven up to the bot). Capped in px so it never eats the whole width.
        const keepAway = Math.min(w * 0.33, 360) * (playing ? 0.4 : 1);
        if (bd < keepAway && bd > 0.001) {
          const nx = bdx / bd;
          const ny = bdy / bd;
          const force = (keepAway - bd) / keepAway;
          const push = (playing ? 50 : 300) * force;
          ball.vx += nx * push * dt;
          ball.vy += ny * push * dt;
        }
      }

      // --- Floating drift (no gravity): keep it lively but calm. Suppressed
      // while lining up an auto-shot so the aim stays clean and precise. ---
      if (!aiming) {
        ball.vx += (Math.random() - 0.5) * 12;
        ball.vy += (Math.random() - 0.5) * 12;
      }

      // --- Integrate ---
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      // light air drag so kicks settle gracefully
      ball.vx *= 0.992;
      ball.vy *= 0.992;

      // maintain a gentle minimum drift so it always keeps roaming the gaps
      const sp = Math.hypot(ball.vx, ball.vy);
      if (sp < 40) {
        const a = Math.atan2(ball.vy || 0.001, ball.vx || 0.001);
        ball.vx = Math.cos(a) * 60;
        ball.vy = Math.sin(a) * 60;
      }
      const maxS = 780;
      if (sp > maxS) {
        ball.vx *= maxS / sp;
        ball.vy *= maxS / sp;
      }

      // spin follows horizontal velocity
      ball.spin += ball.vx * 0.0004;
      ball.spin *= 0.98;
      ball.angle += ball.spin;

      // --- Goal check FIRST so vx > 0 still holds as the ball enters the mouth ---
      tryScore();

      // --- Viewport walls with a generous visible MARGIN so the ball never
      // hides in the extreme edges/corners of the screen. It bounces off an
      // inset boundary (margin + R from each edge) instead of the raw edge, so
      // the whole ball always stays comfortably on-screen. The right edge keeps
      // its goal-mouth opening so shots can still be scored. ---
      const margin = Math.max(24, Math.min(w, h) * 0.05);
      const inGoalMouth = ball.y > goal.y - R && ball.y < goal.y + goal.h + R;
      const leftWall = R + margin;
      const rightWall = w - R - margin;
      const topWall = R + margin;
      const botWall = h - R - margin;
      if (ball.x < leftWall) {
        ball.x = leftWall;
        ball.vx = Math.abs(ball.vx) * 0.86;
      } else if (ball.x > rightWall && !inGoalMouth) {
        ball.x = rightWall;
        ball.vx = -Math.abs(ball.vx) * 0.86;
      } else if (ball.x > w - R && inGoalMouth) {
        // still hard-clamp at the true right edge inside the goal mouth so the
        // ball can enter the goal but never slips off-screen
        ball.x = w - R;
        ball.vx = -Math.abs(ball.vx) * 0.86;
      }
      if (ball.y < topWall) {
        ball.y = topWall;
        ball.vy = Math.abs(ball.vy) * 0.86;
      } else if (ball.y > botWall) {
        ball.y = botWall;
        ball.vy = -Math.abs(ball.vy) * 0.86;
      }

      // --- Bounce off content boxes so it stays in the gaps (twice for solidity) ---
      resolveCircle(ball, R, obstacles, 0.72);
      resolveCircle(ball, R, obstacles, 0.72);

      idleTime += dt;

      // Publish the ball's position so the roaming bot can repel from it.
      ballScreen.x = ball.x;
      ballScreen.y = ball.y;
      ballScreen.r = R;
      ballScreen.active = true;

      trail.push({ x: ball.x, y: ball.y });
      if (trail.length > 8) trail.shift();
    };

    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      step(dt);
      drawGoal();
      drawBall();
      drawReminder(now);
      pointer.vx *= 0.6;
      pointer.vy *= 0.6;
      raf = requestAnimationFrame(loop);
    };

    resize();
    refreshObstacles();
    const obstacleTimer = window.setInterval(refreshObstacles, 200);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", refreshObstacles, { passive: true });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ballScreen.active = false;
      window.clearInterval(obstacleTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", refreshObstacles);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="football-layer" aria-hidden="true" />
  );
};

export default Football;
