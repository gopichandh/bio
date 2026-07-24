import { useEffect, useRef } from "react";
import "./styles/ServerRoom.css";

/**
 * ServerRoom
 *
 * A wide, cinematic "data-centre floor" strip that sits between the What-I-Do
 * and Certifications sections and MERGES into the page background (transparent
 * canvas, soft top/bottom fades). It renders a living, looping scene:
 *
 *   • A back wall of server racks with flickering status LEDs and scrolling
 *     activity bars — a believable equipment line-up.
 *   • Structured cabling: bundles of coloured patch cables sweep in graceful
 *     catenary curves between the racks and an overhead cable tray, with little
 *     signal pulses travelling along them.
 *   • Engineers (clean vector figures) walk along the aisle, pause at a rack,
 *     crouch to patch a cable (an arm reaches to the rack and a new cable
 *     "lights up"), then move on — a smooth, realistic maintenance loop.
 *
 * Pure 2D canvas + rAF for buttery performance and Safari safety; respects
 * prefers-reduced-motion (renders a single still frame). pointer-events:none so
 * it never interferes with the surrounding content.
 */

type Engineer = {
  x: number; // current x (px, in scene space)
  speed: number; // px/sec walking speed
  dir: 1 | -1;
  state: "walk" | "work";
  stateT: number; // seconds remaining in the current state
  targetRack: number; // rack index being serviced
  hue: number; // uniform tint
  phase: number; // gait phase
  bob: number;
};

type Rack = {
  x: number; // centre x
  leds: { on: boolean; hue: number; blink: number }[];
  activity: number; // scrolling activity offset
};

type Cable = {
  fromRack: number;
  sag: number;
  hue: number;
  bornAt: number; // ms timestamp it "lit up" (for the connect flash)
  pulse: number; // 0..1 travelling signal position
  pulseSpeed: number;
};

const CABLE_HUES = [168, 200, 45, 320, 12, 140];

const ServerRoom = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;

    let racks: Rack[] = [];
    let engineers: Engineer[] = [];
    let cables: Cable[] = [];

    const FLOOR_Y = () => h * 0.82; // aisle floor line
    const RACK_TOP = () => h * 0.26;
    const TRAY_Y = () => h * 0.12; // overhead cable tray

    const buildScene = () => {
      // Racks spaced across the width; count scales with width.
      const count = Math.max(4, Math.round(w / 190));
      const gap = w / (count + 1);
      racks = [];
      for (let i = 0; i < count; i++) {
        const leds = [];
        const ledCount = 10;
        for (let k = 0; k < ledCount; k++) {
          leds.push({
            on: Math.random() > 0.25,
            hue: Math.random() > 0.15 ? 150 : 0, // mostly green, some red
            blink: Math.random() * 3,
          });
        }
        racks.push({ x: gap * (i + 1), leds, activity: Math.random() * 100 });
      }

      // A few standing patch cables to start with so the scene reads instantly.
      cables = [];
      for (let i = 0; i < Math.min(racks.length, 5); i++) {
        cables.push({
          fromRack: i,
          sag: 26 + Math.random() * 26,
          hue: CABLE_HUES[i % CABLE_HUES.length],
          bornAt: 0,
          pulse: Math.random(),
          pulseSpeed: 0.25 + Math.random() * 0.3,
        });
      }

      // Engineers spread along the aisle.
      const engCount = Math.max(2, Math.round(w / 520));
      engineers = [];
      for (let i = 0; i < engCount; i++) {
        engineers.push({
          x: Math.random() * w,
          speed: 34 + Math.random() * 26,
          dir: Math.random() > 0.5 ? 1 : -1,
          state: "walk",
          stateT: 2 + Math.random() * 3,
          targetRack: 0,
          hue: [168, 200, 260][i % 3],
          phase: Math.random() * Math.PI * 2,
          bob: 0,
        });
      }
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildScene();
    };

    const nearestRack = (x: number) => {
      let best = 0;
      let bd = Infinity;
      for (let i = 0; i < racks.length; i++) {
        const d = Math.abs(racks[i].x - x);
        if (d < bd) {
          bd = d;
          best = i;
        }
      }
      return best;
    };

    /* ----------------------------- drawing ----------------------------- */
    const drawRacks = (t: number) => {
      const top = RACK_TOP();
      const floor = FLOOR_Y();
      const rackH = floor - top;
      const rackW = Math.min(84, (w / (racks.length + 1)) * 0.7);

      for (const r of racks) {
        const x = r.x - rackW / 2;

        // cabinet body
        const g = ctx.createLinearGradient(x, top, x + rackW, top);
        g.addColorStop(0, "rgba(20,30,44,0.92)");
        g.addColorStop(0.5, "rgba(28,40,58,0.92)");
        g.addColorStop(1, "rgba(16,24,36,0.92)");
        ctx.fillStyle = g;
        ctx.fillRect(x, top, rackW, rackH);

        // frame edge
        ctx.strokeStyle = "rgba(94,234,212,0.28)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 0.5, top + 0.5, rackW - 1, rackH - 1);

        // stacked units with scrolling activity bars
        const units = 9;
        const uh = rackH / units;
        r.activity += 12 * 0.016;
        for (let u = 0; u < units; u++) {
          const uy = top + u * uh + 2;
          ctx.fillStyle = "rgba(8,14,22,0.7)";
          ctx.fillRect(x + 4, uy, rackW - 8, uh - 4);
          // tiny activity meter
          const meterW = rackW - 16;
          const on = (Math.sin(t * 0.002 + u * 1.3 + r.x) + 1) / 2;
          ctx.fillStyle = `rgba(94,234,212,${0.12 + on * 0.25})`;
          ctx.fillRect(x + 8, uy + uh * 0.5, meterW * on, Math.max(1, uh * 0.16));
        }

        // status LEDs down the right rail
        const lx = x + rackW - 7;
        for (let k = 0; k < r.leds.length; k++) {
          const led = r.leds[k];
          led.blink -= 0.016;
          if (led.blink <= 0) {
            led.on = Math.random() > 0.2;
            led.blink = 0.4 + Math.random() * 2.4;
          }
          const ly = top + 10 + k * ((rackH - 20) / r.leds.length);
          const a = led.on ? 0.9 : 0.15;
          ctx.beginPath();
          ctx.arc(lx, ly, 2.1, 0, Math.PI * 2);
          ctx.fillStyle =
            led.hue === 0
              ? `rgba(255,110,90,${a})`
              : `rgba(110,255,190,${a})`;
          if (led.on) {
            ctx.shadowColor =
              led.hue === 0 ? "rgba(255,90,70,0.9)" : "rgba(94,234,212,0.9)";
            ctx.shadowBlur = 6;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    };

    // Draw a single catenary-ish cable from a rack top up to the overhead tray.
    const drawCable = (c: Cable, now: number) => {
      const rack = racks[c.fromRack];
      if (!rack) return;
      const top = RACK_TOP();
      const trayY = TRAY_Y();
      const x0 = rack.x;
      const y0 = top + 6;
      const x1 = rack.x - 26 + (c.fromRack % 2 === 0 ? -18 : 18);
      const y1 = trayY + 6;
      const midX = (x0 + x1) / 2;
      const midY = Math.min(y0, y1) - 4 + c.sag;

      const age = now - c.bornAt;
      const lit = c.bornAt === 0 ? 1 : Math.min(1, age / 500);

      ctx.save();
      ctx.lineCap = "round";
      // cable body
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(midX, midY, x1, y1);
      ctx.strokeStyle = `hsla(${c.hue}, 70%, 62%, ${0.5 * lit})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      // highlight
      ctx.strokeStyle = `hsla(${c.hue}, 90%, 78%, ${0.5 * lit})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // travelling signal pulse
      c.pulse += c.pulseSpeed * 0.016;
      if (c.pulse > 1) c.pulse -= 1;
      const tt = c.pulse;
      const bx =
        (1 - tt) * (1 - tt) * x0 + 2 * (1 - tt) * tt * midX + tt * tt * x1;
      const by =
        (1 - tt) * (1 - tt) * y0 + 2 * (1 - tt) * tt * midY + tt * tt * y1;
      ctx.beginPath();
      ctx.arc(bx, by, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${c.hue}, 100%, 85%, ${0.9 * lit})`;
      ctx.shadowColor = `hsla(${c.hue}, 100%, 70%, 0.9)`;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // connect flash when freshly patched
      if (c.bornAt !== 0 && age < 550) {
        const fa = 1 - age / 550;
        ctx.beginPath();
        ctx.arc(x0, y0, 4 + (1 - fa) * 10, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${c.hue},100%,80%,${fa})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    const drawTray = () => {
      const trayY = TRAY_Y();
      // overhead cable tray (ladder rack)
      ctx.strokeStyle = "rgba(120,150,175,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, trayY);
      ctx.lineTo(w, trayY);
      ctx.moveTo(0, trayY + 12);
      ctx.lineTo(w, trayY + 12);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(120,150,175,0.22)";
      for (let x = 20; x < w; x += 34) {
        ctx.beginPath();
        ctx.moveTo(x, trayY);
        ctx.lineTo(x, trayY + 12);
        ctx.stroke();
      }
    };

    // A clean vector engineer: head, torso, two legs (walk cycle), one arm that
    // reaches toward the rack while working.
    const drawEngineer = (e: Engineer) => {
      const floor = FLOOR_Y();
      const x = e.x;
      const scale = 1;
      const H = 46 * scale; // body height
      const hipY = floor - 16;
      const headR = 5.5;
      const torsoTop = hipY - H * 0.5;

      const walking = e.state === "walk";
      const gait = walking ? Math.sin(e.phase) : 0;
      const bob = walking ? Math.abs(Math.cos(e.phase)) * 2 : 0;
      const baseY = -bob;

      ctx.save();
      ctx.translate(x, baseY);

      // soft shadow
      ctx.beginPath();
      ctx.ellipse(0, floor + 2, 12, 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fill();

      const col = `hsl(${e.hue}, 45%, 62%)`;
      const colDark = `hsl(${e.hue}, 40%, 46%)`;

      // legs
      ctx.strokeStyle = "hsl(220, 12%, 30%)";
      ctx.lineWidth = 3.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(gait * 6, floor);
      ctx.moveTo(0, hipY);
      ctx.lineTo(-gait * 6, floor);
      ctx.stroke();

      // torso
      ctx.strokeStyle = col;
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(0, torsoTop);
      ctx.stroke();

      // arms
      ctx.strokeStyle = colDark;
      ctx.lineWidth = 3;
      const shoulderY = torsoTop + 4;
      if (e.state === "work") {
        // one arm reaches toward the rack (direction of travel), the other rests
        const reach = e.dir;
        ctx.beginPath();
        ctx.moveTo(0, shoulderY);
        ctx.lineTo(reach * 12, shoulderY + 2);
        ctx.moveTo(0, shoulderY);
        ctx.lineTo(-reach * 5, shoulderY + 10);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, shoulderY);
        ctx.lineTo(gait * 6, shoulderY + 10);
        ctx.moveTo(0, shoulderY);
        ctx.lineTo(-gait * 6, shoulderY + 10);
        ctx.stroke();
      }

      // head
      ctx.beginPath();
      ctx.arc(0, torsoTop - headR - 1, headR, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(28, 40%, 72%)";
      ctx.fill();

      ctx.restore();
    };

    const updateEngineers = (dt: number, now: number) => {
      for (const e of engineers) {
        e.stateT -= dt;
        if (e.state === "walk") {
          e.phase += e.speed * dt * 0.12;
          e.x += e.dir * e.speed * dt;
          // turn around at the edges
          if (e.x < 30) {
            e.x = 30;
            e.dir = 1;
          } else if (e.x > w - 30) {
            e.x = w - 30;
            e.dir = -1;
          }
          if (e.stateT <= 0) {
            // arrive to service the nearest rack
            e.targetRack = nearestRack(e.x);
            e.state = "work";
            e.stateT = 1.6 + Math.random() * 2.2;
            // walk right up beside that rack
            e.x = racks[e.targetRack]?.x - e.dir * 22 || e.x;
          }
        } else {
          // working: at the end, "patch" a new cable that lights up
          if (e.stateT <= 0) {
            const hue = CABLE_HUES[(Math.random() * CABLE_HUES.length) | 0];
            cables.push({
              fromRack: e.targetRack,
              sag: 22 + Math.random() * 30,
              hue,
              bornAt: now,
              pulse: 0,
              pulseSpeed: 0.28 + Math.random() * 0.3,
            });
            // keep the cable population tidy
            if (cables.length > racks.length * 2 + 4) cables.shift();
            e.state = "walk";
            e.stateT = 2.4 + Math.random() * 3.5;
            e.dir = Math.random() > 0.5 ? 1 : -1;
          }
        }
      }
    };

    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      ctx.clearRect(0, 0, w, h);

      // faint floor line + aisle perspective glow
      const floor = FLOOR_Y();
      const fg = ctx.createLinearGradient(0, floor - 40, 0, floor + 30);
      fg.addColorStop(0, "rgba(94,234,212,0)");
      fg.addColorStop(1, "rgba(94,234,212,0.06)");
      ctx.fillStyle = fg;
      ctx.fillRect(0, floor - 40, w, 70);
      ctx.strokeStyle = "rgba(120,150,175,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, floor);
      ctx.lineTo(w, floor);
      ctx.stroke();

      drawTray();
      drawRacks(now);
      for (const c of cables) drawCable(c, now);

      if (!reduced) updateEngineers(dt, now);
      for (const e of engineers) drawEngineer(e);

      if (!reduced) raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    if (reduced) frame(performance.now());
    else raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="server-room" aria-hidden="true">
      <div className="server-room-inner">
        <canvas ref={canvasRef} className="server-room-canvas" />
        <div className="server-room-caption">
          <span className="server-room-dot" />
          Live data-centre floor — engineers patching &amp; cabling the racks
        </div>
      </div>
    </section>
  );
};

export default ServerRoom;
