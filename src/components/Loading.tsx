import { useEffect, useRef, useState } from "react";
import "./styles/Loading.css";
import { useLoading } from "../context/LoadingProvider";

/**
 * Loading — a short, scripted "arrival" cinematic (NO percentages).
 *
 * The visitor is taken on a precise, story-driven journey, exactly as briefed:
 *
 *   1. Approach the DATA CENTER building at night.
 *   2. The entrance DOOR slides open, light spills out.
 *   3. We travel INTO the server room.
 *   4. Down the RACK aisle.
 *   5. A single SERVER zooms in to fill the view.
 *   6. A public access key is TYPED at the terminal → "Access granted".
 *   7. The webpage is revealed.
 *
 * The whole sequence is driven by a fixed timeline (≈ 6s), so it always plays
 * out the same way and reads as a proper scene — not a loading bar. When the
 * timeline finishes the screen warps to white and hands off to the site.
 */

// Total runtime of the scripted intro (seconds).
const TOTAL = 6.0;

// Scene captions keyed by timeline progress (0..1).
const SCENES: { at: number; label: string }[] = [
  { at: 0.0, label: "Approaching the data center" },
  { at: 0.16, label: "Opening the entrance" },
  { at: 0.32, label: "Stepping inside" },
  { at: 0.48, label: "Walking the server aisle" },
  { at: 0.64, label: "Locating your server" },
  { at: 0.78, label: "Authenticating access" },
  { at: 0.94, label: "Booting your experience" },
];

const sceneLabel = (pr: number) => {
  let label = SCENES[0].label;
  for (const s of SCENES) if (pr >= s.at) label = s.label;
  return label;
};

const Loading = () => {
  const { setIsLoading } = useLoading();
  const [loaded, setLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);
  // Reactive slice of the timeline for the HTML HUD (caption + password).
  const [pr, setPr] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(false);

  // When the timeline completes → warp out, run intro FX, reveal the site.
  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setLoaded(true);
    setClicked(true);
    import("./utils/initialFX").then((module) => {
      setTimeout(() => {
        module.initialFX?.();
        setIsLoading(false);
      }, 900);
    });
  };

  /* ---------------- Scripted "arrival" canvas ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let t = 0;

    // ---- World layout (abstract metres along the travel axis z) ----
    const FACADE_Z = 16; // the building wall / doorway we pass through
    const RACK_START = 20;
    const RACK_END = 56;
    const TRAVEL = 58; // camera z at the end of the aisle
    const EYE_Y = 2.0;
    const CEIL_Y = 5.6;
    const HALF_W = 4.6;
    const VIEW = 44;

    let cam = 0;
    let vp = { x: 0, y: 0 };
    const focal = () => Math.min(w, h) * 1.02;

    type Rack = { side: -1 | 1; z: number; units: number; seed: number };
    let racks: Rack[] = [];
    type Packet = { x: number; z: number; hue: number };
    let packets: Packet[] = [];

    const build = () => {
      racks = [];
      for (let z = RACK_START; z <= RACK_END; z += 2.1) {
        for (const side of [-1, 1] as const) {
          racks.push({
            side,
            z,
            units: 6 + Math.floor(Math.random() * 3),
            seed: Math.random() * 1000,
          });
        }
      }
      packets = [];
      for (let i = 0; i < 26; i++) {
        packets.push({
          x: (Math.random() * 2 - 1) * 2.6,
          z: RACK_START + Math.random() * (RACK_END - RACK_START),
          hue: 165 + Math.random() * 25,
        });
      }
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
      vp = { x: w * 0.5, y: h * 0.54 };
      build();
    };

    const project = (wx: number, wy: number, wz: number) => {
      const dz = wz - cam;
      if (dz < 0.35) return null;
      const s = focal() / dz;
      return { x: vp.x + wx * s, y: vp.y - (wy - EYE_Y) * s, s, dz };
    };

    const fade = (dz: number) => Math.max(0, Math.min(1, 1 - dz / VIEW));

    // Progress helpers for the scripted timeline.
    let progress = 0; // 0..1 across TOTAL
    // How far the door has opened (0 shut .. 1 fully open), tied to approach.
    const doorOpen = () =>
      Math.max(0, Math.min(1, (progress - 0.14) / 0.2));
    // Single-server "zoom" focus at the end of the aisle (0..1).
    const serverZoom = () =>
      Math.max(0, Math.min(1, (progress - 0.6) / 0.22));

    // ---- Outdoor night sky + stars, fading as we head inside ----
    const drawSky = () => {
      const inside = Math.max(0, Math.min(1, (cam - 10) / (FACADE_Z - 6)));
      const skyA = 1 - inside;
      if (skyA <= 0.01) return;
      const g = ctx.createLinearGradient(0, 0, 0, vp.y);
      g.addColorStop(0, `rgba(10, 22, 46, ${0.95 * skyA})`);
      g.addColorStop(1, `rgba(7, 12, 22, ${0.95 * skyA})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, vp.y);
      for (let i = 0; i < 70; i++) {
        const sx = (i * 137.5) % w;
        const sy = (i * 89.3) % vp.y;
        const tw = 0.4 + 0.6 * (Math.sin(t * 2 + i) * 0.5 + 0.5);
        ctx.fillStyle = `rgba(180, 210, 255, ${0.5 * skyA * tw})`;
        ctx.fillRect(sx, sy, 1.6, 1.6);
      }
      // ground haze
      const gg = ctx.createLinearGradient(0, vp.y, 0, h);
      gg.addColorStop(0, `rgba(8, 14, 22, ${0.9 * skyA})`);
      gg.addColorStop(1, `rgba(4, 8, 14, ${0.95 * skyA})`);
      ctx.fillStyle = gg;
      ctx.fillRect(0, vp.y, w, h - vp.y);
    };

    // ---- The building facade with a lit window grid + sliding DOORS ----
    const drawFacade = () => {
      if (cam > FACADE_Z + 2.5) return;
      const wallHalf = 9;
      const doorHalf = 2.4;
      const doorTop = 4.4;

      const tl = project(-wallHalf, CEIL_Y + 3, FACADE_Z);
      const tr = project(wallHalf, CEIL_Y + 3, FACADE_Z);
      const bl = project(-wallHalf, 0, FACADE_Z);
      if (!tl || !tr || !bl) return;

      // wall slab
      ctx.fillStyle = "rgba(9, 15, 24, 0.97)";
      ctx.fillRect(tl.x, tl.y, tr.x - tl.x, bl.y - tl.y);
      ctx.strokeStyle = "rgba(94, 234, 212, 0.35)";
      ctx.lineWidth = 2;
      ctx.strokeRect(tl.x, tl.y, tr.x - tl.x, bl.y - tl.y);

      // lit window grid
      const cols = 11;
      const rows = 5;
      const cw = (tr.x - tl.x) / cols;
      const chh = (bl.y - tl.y) / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = tl.x + c * cw;
          const cy = tl.y + r * chh;
          const on = Math.sin(c * 12.9 + r * 4.7 + t * 1.5) * 0.5 + 0.5 > 0.45;
          const lit = on ? 0.5 + Math.random() * 0.3 : 0.08;
          ctx.fillStyle = `rgba(120, 220, 210, ${lit})`;
          ctx.fillRect(cx + cw * 0.18, cy + chh * 0.18, cw * 0.64, chh * 0.6);
        }
      }

      // doorway opening
      const dTL = project(-doorHalf, doorTop, FACADE_Z);
      const dBR = project(doorHalf, 0, FACADE_Z);
      if (dTL && dBR) {
        const dx = dTL.x;
        const dy = dTL.y;
        const dw = dBR.x - dTL.x;
        const dh = dBR.y - dTL.y;

        // glowing interior behind the doors
        const ig = ctx.createLinearGradient(dx, dy, dx, dy + dh);
        ig.addColorStop(0, "rgba(120, 255, 240, 0.5)");
        ig.addColorStop(1, "rgba(20, 60, 66, 0.9)");
        ctx.fillStyle = ig;
        ctx.fillRect(dx, dy, dw, dh);

        // two sliding door panels that part as we approach
        const open = doorOpen();
        const panelW = (dw / 2) * (1 - open);
        ctx.fillStyle = "rgba(7, 13, 20, 0.98)";
        ctx.fillRect(dx, dy, panelW, dh); // left panel
        ctx.fillRect(dx + dw - panelW, dy, panelW, dh); // right panel
        // panel seams / handles
        ctx.strokeStyle = "rgba(94, 234, 212, 0.7)";
        ctx.lineWidth = 2;
        ctx.strokeRect(dx, dy, panelW, dh);
        ctx.strokeRect(dx + dw - panelW, dy, panelW, dh);

        // doorway frame
        ctx.strokeStyle = "rgba(94, 234, 212, 0.9)";
        ctx.lineWidth = 3;
        ctx.strokeRect(dx, dy, dw, dh);

        // "DATA CENTER" sign glow above the door
        ctx.fillStyle = "rgba(120, 240, 225, 0.85)";
        ctx.font = `700 ${Math.max(11, dw * 0.11)}px "Poppins", sans-serif`;
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(94,234,212,0.8)";
        ctx.shadowBlur = 12;
        ctx.fillText("DATA CENTER", vp.x, dy - 10);
        ctx.shadowBlur = 0;
      }
    };

    // ---- Floor + ceiling grid to convey continuous forward motion ----
    const drawCorridor = () => {
      const inside = Math.max(0, Math.min(1, (cam - 8) / 10));
      const startZ = Math.ceil(cam + 0.5);
      for (let z = startZ; z < cam + VIEW; z += 1) {
        const a = fade(z - cam);
        if (a <= 0.02) continue;
        const fl1 = project(-HALF_W, 0, z);
        const fl2 = project(HALF_W, 0, z);
        if (fl1 && fl2) {
          ctx.strokeStyle = `rgba(70, 160, 175, ${a * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(fl1.x, fl1.y);
          ctx.lineTo(fl2.x, fl2.y);
          ctx.stroke();
        }
        if (inside > 0.05) {
          const cl1 = project(-HALF_W, CEIL_Y, z);
          const cl2 = project(HALF_W, CEIL_Y, z);
          if (cl1 && cl2) {
            ctx.strokeStyle = `rgba(70, 160, 175, ${a * 0.22 * inside})`;
            ctx.beginPath();
            ctx.moveTo(cl1.x, cl1.y);
            ctx.lineTo(cl2.x, cl2.y);
            ctx.stroke();
          }
        }
      }
      for (const sx of [-HALF_W, HALF_W]) {
        const p1 = project(sx, 0, cam + 0.6);
        const p2 = project(sx, 0, cam + VIEW);
        if (p1 && p2) {
          ctx.strokeStyle = "rgba(94, 234, 212, 0.28)";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    };

    const drawRack = (r: Rack) => {
      const innerX = r.side * 3.0;
      const outerX = r.side * 5.4;
      const H = 4.3;
      const back = 1.6;

      const topFront = project(innerX, H, r.z);
      const botFront = project(innerX, 0, r.z);
      const topBack = project(outerX, H, r.z + back);
      const botBack = project(outerX, 0, r.z + back);
      if (!topFront || !botFront || !topBack || !botBack) return;

      const a = fade(r.z - cam);
      if (a <= 0.02) return;

      ctx.beginPath();
      ctx.moveTo(topFront.x, topFront.y);
      ctx.lineTo(topBack.x, topBack.y);
      ctx.lineTo(botBack.x, botBack.y);
      ctx.lineTo(botFront.x, botFront.y);
      ctx.closePath();
      ctx.fillStyle = `rgba(11, 20, 30, ${0.55 * a + 0.2})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(60, 120, 140, ${a * 0.3})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      const fw = Math.abs(topBack.x - topFront.x) * 0.28 + 6;
      const fyTop = topFront.y;
      const fyBot = botFront.y;
      const faceH = fyBot - fyTop;
      ctx.fillStyle = `rgba(6, 12, 18, ${0.6 * a + 0.25})`;
      ctx.fillRect(topFront.x - fw / 2, fyTop, fw, faceH);

      const uH = faceH / r.units;
      for (let u = 0; u < r.units; u++) {
        const uy = fyTop + u * uH;
        const n = Math.sin(t * 6 + r.seed + u * 2.3) * 0.5 + 0.5;
        const flick = Math.random() > 0.94 ? 1 : n > 0.7 ? 0.85 : 0.18;
        ctx.fillStyle = `rgba(94, 234, 212, ${flick * a})`;
        const led = Math.max(1.4, 3 * topFront.s * 0.02);
        ctx.fillRect(topFront.x - fw / 2 + 3, uy + uH * 0.35, led, led);
        ctx.fillStyle = `rgba(70, 150, 170, ${a * 0.18})`;
        ctx.fillRect(topFront.x - fw / 2 + 2, uy + uH * 0.28, fw - 4, uH * 0.44);
      }
    };

    const drawPackets = (dt: number) => {
      for (const p of packets) {
        if (!reduced) p.z -= dt * 10;
        if (p.z < cam + 0.5) {
          p.z = cam + VIEW - Math.random() * 6;
          p.x = (Math.random() * 2 - 1) * 2.6;
        }
        const pr2 = project(p.x, 1.6 + Math.sin(t + p.x) * 0.3, p.z);
        if (!pr2) continue;
        const a = fade(p.z - cam);
        const size = Math.max(1, 3.2 * pr2.s * 0.02);
        ctx.beginPath();
        ctx.arc(pr2.x, pr2.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${0.5 + a * 0.5})`;
        ctx.shadowColor = "rgba(94, 234, 212, 0.8)";
        ctx.shadowBlur = 8 * a;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    // ---- A single destination SERVER that zooms in to fill the view ----
    const drawServerZoom = () => {
      const zoom = serverZoom();
      if (zoom <= 0) return;

      // A crisp server face grows from the vanishing point toward the viewer.
      const cw = w * (0.16 + zoom * 0.62);
      const ch = h * (0.24 + zoom * 0.68);
      const cx = vp.x - cw / 2;
      const cy = vp.y - ch / 2 + h * 0.04 * (1 - zoom);

      // chassis
      const bg = ctx.createLinearGradient(cx, cy, cx, cy + ch);
      bg.addColorStop(0, "rgba(14, 24, 34, 0.98)");
      bg.addColorStop(1, "rgba(6, 12, 18, 0.98)");
      ctx.fillStyle = bg;
      ctx.fillRect(cx, cy, cw, ch);
      ctx.strokeStyle = "rgba(94, 234, 212, 0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(cx, cy, cw, ch);

      // rack units with blinking LEDs + drive bays
      const units = 9;
      const uH = ch / units;
      for (let u = 0; u < units; u++) {
        const uy = cy + u * uH;
        ctx.fillStyle = "rgba(10, 18, 26, 0.9)";
        ctx.fillRect(cx + 6, uy + uH * 0.14, cw - 12, uH * 0.72);
        // status LEDs
        for (let k = 0; k < 3; k++) {
          const on = Math.sin(t * 7 + u * 2 + k * 1.7) > 0.2;
          ctx.fillStyle = on
            ? k === 0
              ? "rgba(94,234,212,0.95)"
              : "rgba(120,220,255,0.85)"
            : "rgba(60,90,100,0.5)";
          ctx.beginPath();
          ctx.arc(cx + 18 + k * 12, uy + uH * 0.5, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        // vents
        ctx.strokeStyle = "rgba(70, 120, 140, 0.35)";
        ctx.lineWidth = 1;
        for (let vX = cx + cw * 0.4; vX < cx + cw - 10; vX += 6) {
          ctx.beginPath();
          ctx.moveTo(vX, uy + uH * 0.24);
          ctx.lineTo(vX, uy + uH * 0.76);
          ctx.stroke();
        }
      }

      // glowing halo as it locks on
      ctx.save();
      ctx.globalAlpha = 0.5 * zoom;
      const halo = ctx.createRadialGradient(
        vp.x,
        cy + ch / 2,
        10,
        vp.x,
        cy + ch / 2,
        Math.max(cw, ch)
      );
      halo.addColorStop(0, "rgba(94, 234, 212, 0.4)");
      halo.addColorStop(1, "rgba(94, 234, 212, 0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    };

    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      progress = Math.min(1, progress + dt / TOTAL);

      // Ease the camera along the travel axis from the scripted progress.
      const ease = (x: number) =>
        x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
      const targetCam = ease(Math.min(1, progress / 0.66)) * TRAVEL;
      cam += (targetCam - cam) * Math.min(1, dt * 4);

      ctx.clearRect(0, 0, w, h);
      drawSky();
      drawCorridor();

      const sorted = racks
        .filter((r) => r.z > cam + 0.4 && r.z < cam + VIEW)
        .sort((a, b) => b.z - a.z);
      for (const r of sorted) drawRack(r);

      drawPackets(dt);
      drawFacade();
      drawServerZoom();

      // Publish the reactive timeline slice for the HTML HUD (throttled).
      setPr((prev) => (Math.abs(prev - progress) > 0.008 ? progress : prev));

      if (progress >= 1) {
        finish();
        return;
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The public access-key terminal appears during the authentication phase.
  const showAuth = pr >= 0.76;
  const PUBLIC_KEY = "guest-access-2026";
  const typed = Math.max(
    0,
    Math.min(
      PUBLIC_KEY.length,
      Math.round(((pr - 0.76) / 0.16) * PUBLIC_KEY.length)
    )
  );
  const granted = pr >= 0.93;

  return (
    <>
      <div className="loading-header">
        <a href="/#" className="loader-title" data-cursor="disable">
          VM
        </a>
      </div>
      <div className={`loading-screen ${clicked ? "loading-warp" : ""}`}>
        <canvas
          ref={canvasRef}
          className="loading-datacenter"
          aria-hidden="true"
        />

        <div className={`loading-hud ${loaded ? "loading-hud-out" : ""}`}>
          <div className="loading-stage">{sceneLabel(pr)}</div>

          {showAuth ? (
            <div className={`loading-auth ${granted ? "loading-auth-ok" : ""}`}>
              <div className="loading-auth-head">
                <span className="loading-auth-lock">{granted ? "🔓" : "🔒"}</span>
                secure-server ~ public access
              </div>
              <div className="loading-auth-row">
                <span className="loading-auth-label">$ ssh guest@vm-core</span>
              </div>
              <div className="loading-auth-row">
                <span className="loading-auth-label">access key:</span>
                <span className="loading-auth-key">
                  {PUBLIC_KEY.slice(0, typed)}
                  {!granted && <span className="loading-auth-caret">▋</span>}
                </span>
              </div>
              <div className="loading-auth-status">
                {granted
                  ? "✔ Access granted — booting the page"
                  : "Verifying public credentials…"}
              </div>
            </div>
          ) : (
            <div className="loading-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Loading;

/**
 * setProgress is retained so PhotoHero's existing hand-off keeps working: it
 * ramps a synthetic percentage that PhotoHero awaits via `.loaded()` before it
 * wires up the scroll animations. The intro cinematic above no longer *shows*
 * any percentage — this is purely an internal readiness signal.
 */
export const setProgress = (setLoading: (value: number) => void) => {
  let percent = 0;
  let interval = setInterval(() => {
    if (percent <= 80) {
      percent += 6 + Math.round(Math.random() * 8);
      setLoading(Math.min(92, percent));
    } else {
      clearInterval(interval);
    }
  }, 70);

  function clear() {
    clearInterval(interval);
    setLoading(100);
  }

  function loaded() {
    return new Promise<number>((resolve) => {
      clearInterval(interval);
      interval = setInterval(() => {
        if (percent < 100) {
          percent += 4;
          setLoading(Math.min(100, percent));
        } else {
          resolve(100);
          clearInterval(interval);
        }
      }, 20);
    });
  }
  return { loaded, percent, clear };
};
