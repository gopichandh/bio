import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import "./styles/RoamingBot.css";
import { collectObstacles, ObRect } from "./utils/contentObstacles";

// Shared, module-level screen-space position of the bot (in CSS pixels) so the
// HTML speech bubble can follow the 3D mascot around the viewport.
const botScreen = { x: 0, y: 0, ready: false };

// Shared, module-level list of on-screen content boxes (viewport pixels) that
// the bot must never drift over. Refreshed by the RoamingBot component.
let contentRects: ObRect[] = [];

/**
 * RoamingBot
 *
 * A small, friendly 3D robot mascot that lives on a fixed, transparent,
 * full-viewport WebGL canvas (pointer-events: none, so it never blocks the
 * page). It:
 *   • waves hello with its arm right after the page appears,
 *   • freely roams around the viewport (wandering between random targets),
 *   • turns to look at the visitor's cursor and reacts (a little hop + wave)
 *     when the pointer comes close,
 *   • points the visitor in the direction to go — a floating arrow + arm
 *     gesture that says "scroll down" at the top, "back to top" at the end,
 *     and drifts sideways in between.
 *
 * Built entirely from primitive geometry (no external model file) so it is
 * self-contained and reliable. Uses an orthographic camera so world units map
 * cleanly to screen space for the roaming behaviour.
 */

type Hint = "down" | "up" | "side" | "work";

// Shared, module-level pointer in normalized device coords (-1..1), plus its
// per-move velocity so a quick swipe can shove the bot harder.
const pointer = { x: 0, y: 0, vx: 0, vy: 0, active: false };

// Shared, module-level "mood" flag so the HTML speech layer can react with a
// playful line whenever the visitor physically shoves the bot with the cursor.
const botMood = { pushedAt: 0 };

function RobotModel({
  bounds,
  hint,
}: {
  bounds: { x: number; y: number };
  hint: Hint;
}) {
  const root = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const rightArm = useRef<THREE.Group>(null!);
  const leftArm = useRef<THREE.Group>(null!);
  const arrow = useRef<THREE.Group>(null!);
  const eyeL = useRef<THREE.MeshStandardMaterial>(null!);
  const eyeR = useRef<THREE.MeshStandardMaterial>(null!);

  // Roaming state. The bot now wanders the WHOLE viewport flexibly (like
  // before) but steers around the on-screen text/image boxes so it always
  // travels through the empty gaps and never covers anything being read.
  const target = useRef(new THREE.Vector2(bounds.x * 0.3, -bounds.y * 0.3));
  const vel = useRef(new THREE.Vector2(0, 0));
  const waveT = useRef(2.6); // seconds of "waving" left; starts by waving hi
  const nextTargetAt = useRef(2.2);
  const hopT = useRef(0);
  const t0 = useRef(0);

  // Constrained roaming extents (world units): the bot stays in the MIDDLE of
  // the screen — well away from the left/right edges, the very bottom, and the
  // CI/CD pipeline strip pinned near the top — so it never drifts over the
  // photo, the pipeline, or off the edges. It weaves through the empty gaps of
  // the central column while keeping a comfortable margin everywhere.
  const zoneXMin = -bounds.x * 0.58;
  const zoneXMax = bounds.x * 0.58;
  const zoneYMin = -bounds.y * 0.55;
  const zoneYMax = bounds.y * 0.42; // stay below the top CI/CD pipeline strip

  // Convert a viewport-pixel rect into the bot's world frame (origin centre, +y up).
  const rectToWorld = (r: ObRect) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const x1 = (r.x / vw) * 2 - 1;
    const x2 = ((r.x + r.w) / vw) * 2 - 1;
    const y1 = -((r.y / vh) * 2 - 1);
    const y2 = -(((r.y + r.h) / vh) * 2 - 1);
    return {
      xMin: Math.min(x1, x2) * bounds.x,
      xMax: Math.max(x1, x2) * bounds.x,
      yMin: Math.min(y1, y2) * bounds.y,
      yMax: Math.max(y1, y2) * bounds.y,
    };
  };

  const inObstacle = (x: number, y: number, pad = 0) => {
    for (const r of contentRects) {
      const b = rectToWorld(r);
      if (x > b.xMin - pad && x < b.xMax + pad && y > b.yMin - pad && y < b.yMax + pad)
        return true;
    }
    return false;
  };

  // How crowded a world point is: how many content boxes sit within a small
  // radius of it. Used both to bias the wander toward the empty side gutters
  // and to trigger an "escape to the edge" when the bot is boxed in (e.g. the
  // dense Career / Tech-Stack sections).
  const crowdedness = (x: number, y: number, radius = 0.9) => {
    let n = 0;
    for (const r of contentRects) {
      const b = rectToWorld(r);
      const nx = THREE.MathUtils.clamp(x, b.xMin, b.xMax);
      const ny = THREE.MathUtils.clamp(y, b.yMin, b.yMax);
      if (Math.hypot(x - nx, y - ny) < radius) n++;
    }
    return n;
  };

  const pickTarget = () => {
    // Keep the bot roaming in the MIDDLE of the screen. Sample candidate points
    // strictly inside the constrained central zone, prefer the ones that sit in
    // the emptiest gap AND closest to centre (a small pull toward x≈0) so it
    // gently weaves around the middle rather than drifting toward the edges.
    let best: { x: number; y: number; score: number } | null = null;
    for (let i = 0; i < 28; i++) {
      const tx = zoneXMin + Math.random() * (zoneXMax - zoneXMin);
      const ty = zoneYMin + Math.random() * (zoneYMax - zoneYMin);
      if (!inObstacle(tx, ty, 0.4)) {
        // Reward empty spots, penalise distance from centre so it hugs middle.
        const score = -crowdedness(tx, ty, 1.1) - Math.abs(tx) * 0.5;
        if (!best || score > best.score) best = { x: tx, y: ty, score };
      }
    }
    if (best) {
      target.current.set(best.x, best.y);
      return;
    }
    // Everything is crowded — settle back toward the centre.
    target.current.set(
      (Math.random() - 0.5) * bounds.x * 0.3,
      zoneYMin + Math.random() * (zoneYMax - zoneYMin)
    );
  };

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    t0.current += dt;
    const time = t0.current;

    // --- Intro handshake: for the first few seconds the bot glides to the
    // centre-front, faces the visitor and "shakes hands" before it begins
    // roaming and guiding around the page. ---
    const intro = time < 5;
    if (intro) {
      target.current.set(0, bounds.y * 0.12);
    }

    // --- Cursor in world space (orthographic → viewport maps directly) ---
    const cursor = new THREE.Vector2(
      pointer.x * bounds.x,
      pointer.y * bounds.y
    );
    const pos = root.current.position;
    const distToCursor = Math.hypot(cursor.x - pos.x, cursor.y - pos.y);
    const cursorNear = pointer.active && distToCursor < bounds.x * 0.32;

    // --- Cursor PUSH: when the pointer gets close it shoves the bot away, just
    // like kicking the football. A quick swipe (high pointer velocity) pushes
    // harder; the bot rolls off and then resumes roaming/guiding. ---
    const pushRadius = bounds.x * 0.26 + 0.4;
    const pushing = pointer.active && distToCursor < pushRadius;
    if (pushing && !intro) {
      const nx = (pos.x - cursor.x) / (distToCursor || 0.001);
      const ny = (pos.y - cursor.y) / (distToCursor || 0.001);
      const strength = 1 - distToCursor / pushRadius; // 0..1, stronger up close
      const pSpeed = Math.hypot(pointer.vx, pointer.vy) * bounds.x; // world units
      const impulse = (2.4 + pSpeed * 16) * strength;
      vel.current.x += nx * impulse * dt * 14;
      vel.current.y += ny * impulse * dt * 14;
      // carry some of the cursor's own motion into the bot
      vel.current.x += pointer.vx * bounds.x * 3;
      vel.current.y += pointer.vy * bounds.y * 3;
      waveT.current = Math.max(waveT.current, 0.3);
      botMood.pushedAt = performance.now();
      // steer the wander target away so it doesn't spring straight back
      target.current.set(
        pos.x + nx * bounds.x * 0.5,
        pos.y + ny * bounds.y * 0.5
      );
      nextTargetAt.current = Math.max(nextTargetAt.current, 0.6);
    }
    // pointer velocity fades so a stationary cursor stops shoving
    pointer.vx *= 0.6;
    pointer.vy *= 0.6;

    // --- Choose a new wander target periodically ---
    nextTargetAt.current -= dt;
    if (!intro && nextTargetAt.current <= 0) {
      pickTarget();
      nextTargetAt.current = 2.6 + Math.random() * 2.4;
      // Every so often, greet again while roaming.
      if (Math.random() < 0.5) waveT.current = 1.6;
    }

    // When the cursor is near, the bot waves & glances, but it stays within its
    // safe zone (it won't chase the cursor across the reading area).
    const goal = target.current;
    if (cursorNear) waveT.current = Math.max(waveT.current, 0.4);

    // --- Spring toward goal for smooth, lively motion (eased right after a
    // push so the shove reads clearly before it settles back to roaming) ---
    const springScale = intro ? 1.7 : pushing ? 0.2 : 1;
    const ax = (goal.x - pos.x) * 3.2 * springScale;
    const ay = (goal.y - pos.y) * 3.2 * springScale;
    vel.current.x += ax * dt;
    vel.current.y += ay * dt;

    // --- Repulsion from content boxes so the bot steers through the gaps ---
    // Each nearby obstacle pushes the bot away from its centre; the closer the
    // bot, the stronger the shove. Padding and forces are deliberately strong
    // so the bot never even grazes a heading/paragraph/image (previously it
    // could clip over the Tech-Stack copy during fast moves).
    const pad = 0.5;
    if (!intro) for (const r of contentRects) {
      const b = rectToWorld(r);
      // nearest point on the (padded) box to the bot
      const nx = THREE.MathUtils.clamp(pos.x, b.xMin - pad, b.xMax + pad);
      const ny = THREE.MathUtils.clamp(pos.y, b.yMin - pad, b.yMax + pad);
      const insideX = pos.x > b.xMin - pad && pos.x < b.xMax + pad;
      const insideY = pos.y > b.yMin - pad && pos.y < b.yMax + pad;
      if (insideX && insideY) {
        // Bot is over the box → push out hard along the shallowest escape axis.
        const cx = (b.xMin + b.xMax) / 2;
        const cy = (b.yMin + b.yMax) / 2;
        const dxc = pos.x - cx;
        const dyc = pos.y - cy;
        const escX = b.xMax + pad - pos.x;
        const escXneg = pos.x - (b.xMin - pad);
        const escY = b.yMax + pad - pos.y;
        const escYneg = pos.y - (b.yMin - pad);
        const minEsc = Math.min(escX, escXneg, escY, escYneg);
        if (minEsc === escX) vel.current.x += 60 * dt * 60 * 0.02;
        else if (minEsc === escXneg) vel.current.x -= 60 * dt * 60 * 0.02;
        else if (minEsc === escY) vel.current.y += 60 * dt * 60 * 0.02;
        else vel.current.y -= 60 * dt * 60 * 0.02;
        vel.current.x += Math.sign(dxc || 1) * 12 * dt * 12;
        vel.current.y += Math.sign(dyc || 1) * 12 * dt * 12;
      } else {
        // Near the box → firm push away from the nearest edge, over a wider
        // range so the bot gives content a respectful berth.
        const dpx = pos.x - nx;
        const dpy = pos.y - ny;
        const d = Math.hypot(dpx, dpy);
        if (d < 0.95 && d > 0.0001) {
          const force = (0.95 - d) * 70;
          vel.current.x += (dpx / d) * force * dt;
          vel.current.y += (dpy / d) * force * dt;
        }
      }
    }

    // --- Crowd-escape: when the bot is hemmed in by content (dense sections
    // like "My Career & Experience" or the Tech Stack), nudge it toward the
    // nearest clear gap while KEEPING it within the central roaming zone, so it
    // never bolts to the screen edges. Pick a fresh central target next tick. ---
    if (!intro && crowdedness(pos.x, pos.y, 1.2) >= 2) {
      // gentle pull back toward the horizontal centre of the zone
      vel.current.x += (0 - pos.x) * 1.6 * dt;
      pickTarget();
      nextTargetAt.current = Math.max(nextTargetAt.current, 1.2);
    }

    vel.current.multiplyScalar(0.86); // damping
    // clamp speed
    const maxV = bounds.x * 1.6;
    const sp = vel.current.length();
    if (sp > maxV) vel.current.multiplyScalar(maxV / sp);
    pos.x += vel.current.x * dt;
    pos.y += vel.current.y * dt;

    // keep inside the viewport margin
    pos.x = THREE.MathUtils.clamp(pos.x, zoneXMin, zoneXMax);
    pos.y = THREE.MathUtils.clamp(pos.y, zoneYMin, zoneYMax);

    // --- Hard guarantee: if the bot is still inside any content box (fast
    // motion can outrun the soft repulsion), immediately eject it out of the
    // box along the shallowest axis so it NEVER visibly covers text/images. ---
    const ejectPad = 0.28;
    if (!intro) for (let pass = 0; pass < 3; pass++) {
      let moved = false;
      for (const r of contentRects) {
        const b = rectToWorld(r);
        if (
          pos.x > b.xMin - ejectPad &&
          pos.x < b.xMax + ejectPad &&
          pos.y > b.yMin - ejectPad &&
          pos.y < b.yMax + ejectPad
        ) {
          const escX = b.xMax + ejectPad - pos.x;
          const escXneg = pos.x - (b.xMin - ejectPad);
          const escY = b.yMax + ejectPad - pos.y;
          const escYneg = pos.y - (b.yMin - ejectPad);
          const minEsc = Math.min(escX, escXneg, escY, escYneg);
          if (minEsc === escX) {
            pos.x = b.xMax + ejectPad;
            vel.current.x = Math.abs(vel.current.x);
          } else if (minEsc === escXneg) {
            pos.x = b.xMin - ejectPad;
            vel.current.x = -Math.abs(vel.current.x);
          } else if (minEsc === escY) {
            pos.y = b.yMax + ejectPad;
            vel.current.y = Math.abs(vel.current.y);
          } else {
            pos.y = b.yMin - ejectPad;
            vel.current.y = -Math.abs(vel.current.y);
          }
          moved = true;
        }
      }
      if (!moved) break;
    }
    pos.x = THREE.MathUtils.clamp(pos.x, zoneXMin, zoneXMax);
    pos.y = THREE.MathUtils.clamp(pos.y, zoneYMin, zoneYMax);

    // If the bot still ended up inside a box (fast motion), retarget to a gap.
    if (inObstacle(pos.x, pos.y, 0.1)) {
      nextTargetAt.current = Math.min(nextTargetAt.current, 0.1);
    }

    // --- Bobbing + banking with velocity ---
    body.current.position.y = Math.sin(time * 3.1) * 0.04;
    root.current.rotation.z = THREE.MathUtils.lerp(
      root.current.rotation.z,
      -vel.current.x * 0.06,
      0.1
    );
    // face slightly in travel direction
    root.current.rotation.y = THREE.MathUtils.lerp(
      root.current.rotation.y,
      intro ? 0 : THREE.MathUtils.clamp(vel.current.x * 0.12, -0.5, 0.5),
      0.08
    );

    // --- Head looks at the cursor ---
    const lookX = THREE.MathUtils.clamp((cursor.x - pos.x) * 0.12, -0.5, 0.5);
    const lookY = THREE.MathUtils.clamp((cursor.y - pos.y) * 0.12, -0.35, 0.35);
    head.current.rotation.y = THREE.MathUtils.lerp(
      head.current.rotation.y,
      intro ? 0 : pointer.active ? lookX : Math.sin(time * 0.6) * 0.15,
      0.08
    );
    head.current.rotation.x = THREE.MathUtils.lerp(
      head.current.rotation.x,
      intro ? 0.06 : pointer.active ? -lookY : 0,
      0.08
    );

    // --- Waving / handshake arm ---
    waveT.current = Math.max(0, waveT.current - dt);
    const waving = waveT.current > 0;
    if (intro) {
      // Handshake: the right arm reaches forward toward the visitor and pumps
      // up and down, as if shaking hands, then settles as the tour begins.
      rightArm.current.rotation.x = THREE.MathUtils.lerp(
        rightArm.current.rotation.x,
        -1.25 + Math.sin(time * 11) * 0.42,
        0.3
      );
      rightArm.current.rotation.z = THREE.MathUtils.lerp(
        rightArm.current.rotation.z,
        -0.18,
        0.2
      );
    } else if (waving) {
      rightArm.current.rotation.x = THREE.MathUtils.lerp(
        rightArm.current.rotation.x,
        0,
        0.15
      );
      rightArm.current.rotation.z = THREE.MathUtils.lerp(
        rightArm.current.rotation.z,
        -2.1 + Math.sin(time * 16) * 0.5,
        0.25
      );
      hopT.current = 0.0; // no hop while waving handled below
    } else {
      rightArm.current.rotation.x = THREE.MathUtils.lerp(
        rightArm.current.rotation.x,
        0,
        0.15
      );
      rightArm.current.rotation.z = THREE.MathUtils.lerp(
        rightArm.current.rotation.z,
        -0.35 + Math.sin(time * 3) * 0.08,
        0.1
      );
    }
    leftArm.current.rotation.z = THREE.MathUtils.lerp(
      leftArm.current.rotation.z,
      0.35 - Math.sin(time * 3) * 0.08,
      0.1
    );

    // little hop when greeting near cursor
    if (cursorNear) hopT.current = Math.min(1, hopT.current + dt * 3);
    else hopT.current = Math.max(0, hopT.current - dt * 3);
    root.current.position.y += Math.abs(Math.sin(time * 8)) * 0.08 * hopT.current;

    // --- Eyes blink + glow pulse ---
    const blink = Math.sin(time * 1.7) > 0.98 ? 0.1 : 1;
    const glow = 1.4 + Math.sin(time * 4) * 0.4;
    if (eyeL.current) {
      eyeL.current.emissiveIntensity = glow * blink;
      eyeR.current.emissiveIntensity = glow * blink;
    }

    // --- Direction arrow (floats beside the bot, points where to go) ---
    if (arrow.current) {
      const a = arrow.current;
      // position + rotation per hint
      if (hint === "down") {
        a.position.set(0, -0.95 + Math.sin(time * 4) * 0.08, 0);
        a.rotation.z = Math.PI; // point down
      } else if (hint === "up") {
        a.position.set(0, 0.95 + Math.sin(time * 4) * 0.08, 0);
        a.rotation.z = 0; // point up
      } else {
        a.position.set(
          0.95 + Math.sin(time * 4) * 0.08,
          0,
          0
        );
        a.rotation.z = -Math.PI / 2; // point right
      }
      a.rotation.y = time * 1.2;
    }

    // --- Project the bot's world position to screen pixels so the HTML
    // speech bubble can be anchored just above its head. ---
    const headWorld = new THREE.Vector3(pos.x, pos.y + 0.9, pos.z);
    headWorld.project(state.camera);
    botScreen.x = (headWorld.x * 0.5 + 0.5) * state.size.width;
    botScreen.y = (-headWorld.y * 0.5 + 0.5) * state.size.height;
    botScreen.ready = true;
  });

  const metal = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#dfe9f2",
        metalness: 0.85,
        roughness: 0.28,
      }),
    []
  );
  const accent = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0e1728",
        metalness: 0.6,
        roughness: 0.4,
      }),
    []
  );

  return (
    <group ref={root} position={[bounds.x * 0.3, -bounds.y * 0.3, 0]} scale={0.42}>
      <group ref={body}>
        {/* torso */}
        <mesh material={metal} castShadow>
          <capsuleGeometry args={[0.5, 0.5, 8, 24]} />
        </mesh>
        {/* chest screen */}
        <mesh position={[0, 0.05, 0.46]}>
          <boxGeometry args={[0.5, 0.42, 0.06]} />
          <meshStandardMaterial
            color="#052e2b"
            emissive="#0fd6c2"
            emissiveIntensity={0.9}
            roughness={0.3}
          />
        </mesh>

        {/* head */}
        <group ref={head} position={[0, 0.85, 0]}>
          <mesh material={metal}>
            <boxGeometry args={[0.8, 0.62, 0.7]} />
          </mesh>
          {/* visor */}
          <mesh position={[0, 0.02, 0.34]}>
            <boxGeometry args={[0.64, 0.3, 0.08]} />
            <meshStandardMaterial color="#02171c" roughness={0.2} />
          </mesh>
          {/* eyes */}
          <mesh position={[-0.16, 0.03, 0.4]}>
            <sphereGeometry args={[0.075, 16, 16]} />
            <meshStandardMaterial
              ref={eyeL}
              color="#5eead4"
              emissive="#5eead4"
              emissiveIntensity={1.4}
            />
          </mesh>
          <mesh position={[0.16, 0.03, 0.4]}>
            <sphereGeometry args={[0.075, 16, 16]} />
            <meshStandardMaterial
              ref={eyeR}
              color="#5eead4"
              emissive="#5eead4"
              emissiveIntensity={1.4}
            />
          </mesh>
          {/* ears */}
          <mesh position={[-0.44, 0, 0]} material={accent}>
            <cylinderGeometry args={[0.08, 0.08, 0.16, 12]} />
          </mesh>
          <mesh position={[0.44, 0, 0]} material={accent}>
            <cylinderGeometry args={[0.08, 0.08, 0.16, 12]} />
          </mesh>
          {/* antenna */}
          <mesh position={[0, 0.42, 0]} material={metal}>
            <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial
              color="#ffd166"
              emissive="#ffb703"
              emissiveIntensity={1.6}
            />
          </mesh>
        </group>

        {/* right arm (waving) — pivot at shoulder */}
        <group ref={rightArm} position={[0.6, 0.28, 0]}>
          <mesh position={[0, -0.3, 0]} material={metal}>
            <capsuleGeometry args={[0.11, 0.4, 6, 12]} />
          </mesh>
          <mesh position={[0, -0.62, 0]}>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial color="#5eead4" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>

        {/* left arm */}
        <group ref={leftArm} position={[-0.6, 0.28, 0]}>
          <mesh position={[0, -0.3, 0]} material={metal}>
            <capsuleGeometry args={[0.11, 0.4, 6, 12]} />
          </mesh>
          <mesh position={[0, -0.62, 0]}>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial color="#5eead4" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>

        {/* hover jet base */}
        <mesh position={[0, -0.62, 0]} material={accent}>
          <cylinderGeometry args={[0.28, 0.14, 0.24, 20]} />
        </mesh>
        <mesh position={[0, -0.78, 0]}>
          <coneGeometry args={[0.16, 0.22, 16]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={1.2}
            transparent
            opacity={0.75}
          />
        </mesh>
      </group>

      {/* floating direction arrow */}
      <group ref={arrow}>
        <mesh>
          <coneGeometry args={[0.16, 0.34, 4]} />
          <meshStandardMaterial
            color="#5eead4"
            emissive="#5eead4"
            emissiveIntensity={1.3}
          />
        </mesh>
      </group>
    </group>
  );
}

function Rig({ hint }: { hint: Hint }) {
  const { viewport } = useThree();
  // half-extents of the visible area in world units
  const bounds = { x: viewport.width / 2, y: viewport.height / 2 };
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <pointLight position={[-3, -2, 3]} intensity={0.6} color="#22d3ee" />
      <RobotModel bounds={bounds} hint={hint} />
    </>
  );
}

// The bot is a pure GUIDE. Its job is to walk the visitor through the page,
// section by section, telling them where things are and what to do. The lines
// below are grouped by the section that is currently in view so the guidance
// is always relevant to what the visitor is looking at.

// Intro handshake sequence — played once at the start while the bot glides to
// the centre and shakes hands. It welcomes the visitor and reminds them of the
// three key touch-points: the experience badge (top-right), the résumé button
// (bottom-right) and the hidden chess board.
const INTRO_LINES = [
  "Hi there! 👋 I'm Vilas's guide-bot — nice to meet you!",
  "Quick tips before we start: top-right shows Vilas's years of experience — hover it to see his core skills. 🧠",
  "Bottom-right you'll find his résumé button whenever you want the full story. 📄",
  "One secret: type the word “chess” anywhere and a hidden board appears — a nod to Vilas's favourite game. ♞",
  "Alright — let's take the tour. Just scroll down and I'll guide you. 👇",
];

// Per-section guidance. Keyed by the section id currently centred in view.
const SECTION_LINES: Record<string, string[]> = {
  about: [
    "This is Vilas — a Senior Site Reliability Architect with 13+ years keeping cloud platforms fast and always-on. 🛠️",
    "Read his bio here to get to know him. When you're ready, scroll down for his skills. 👇",
  ],
  techstack: [
    "These are Vilas's core tools — Kubernetes, AWS, Terraform, CI/CD and more. ☸️",
    "His tech stack at a glance. Keep scrolling to see his career journey. 👇",
  ],
  career: [
    "Here's Vilas's career & work experience — scroll down through the timeline to follow his journey. 🚀",
    "Each stop on this timeline is a role he's grown through. Scroll on when you're ready. 👇",
  ],
  whatido: [
    "This section covers what Vilas does day-to-day — reliability, automation and platform engineering. ⚙️",
    "His certifications and achievements are just below — keep scrolling. 👇",
  ],
  credentials: [
    "Here are Vilas's certifications — AWS SA, CKA, GCP Architect & Oracle Solaris, all verified. 🏅",
    "Almost at the bottom — his résumé button is at the bottom-right for the full details. 📄",
  ],
  contact: [
    "This is the contact section — reach out to Vilas here. 📬",
    "Don't forget: his résumé button is bottom-right, and typing “chess” reveals a hidden board. ♞",
  ],
};

// Shown at the very top (before the first section) and the very bottom.
const TOP_LINE = "Welcome! Scroll down and I'll walk you through Vilas's story. 👇";
const BOTTOM_LINES = [
  "You've reached the end! 📄 Vilas's résumé button is bottom-right — click it for the full story.",
  "Thanks for taking the tour. Reach out anytime — and psst, type “chess” for a hidden board. ♞",
];

// Playful reactions when the visitor physically shoves the bot with the cursor
// (mirrors the football's "kick me" interaction).
const PUSH_LINES = [
  "Whoa! 😄 Careful, I bruise easily…",
  "Wheee! Push me again! 🤖",
  "Hey! I'm guiding here 😆",
  "Okay okay, I'll move! 🛸",
  "Bumper bots! 💥 Nice shot.",
];

type Anchor = { x: number; y: number; ready: boolean; flip: boolean };

const RoamingBot = () => {
  const [enabled] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [hint, setHint] = useState<Hint>("down");
  const [message, setMessage] = useState<string>(
    "Hi there! 👋 I'm Vilas's guide-bot — nice to meet you!"
  );
  const [anchor, setAnchor] = useState<Anchor>({
    x: 0,
    y: 0,
    ready: false,
    flip: false,
  });
  const hintRef = useRef<Hint>("down");
  hintRef.current = hint;
  // Which content section is currently centred in the viewport + overall scroll
  // progress. The guidance narration reads these so it always describes what
  // the visitor is actually looking at.
  const sectionRef = useRef<string>("");
  const progressRef = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      // per-move velocity (in NDC units) so a quick swipe shoves the bot harder
      pointer.vx = nx - pointer.x;
      pointer.vy = ny - pointer.y;
      pointer.x = nx;
      pointer.y = ny;
      pointer.active = true;
    };
    const onLeave = () => (pointer.active = false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  // Keep the shared content-obstacle list fresh so the bot steers around the
  // current text/images as the visitor scrolls and the layout shifts.
  useEffect(() => {
    const refresh = () => {
      // Wider padding than the football so the bot keeps a clearly visible
      // margin around every heading, paragraph and image.
      contentRects = collectObstacles(26);
    };
    refresh();
    const timer = window.setInterval(refresh, 200);
    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("scroll", refresh);
      window.removeEventListener("resize", refresh);
    };
  }, []);

  // Derive a scroll hint from ScrollSmoother's transformed content, and detect
  // when the "My Work" carousel is centred in view (so we can nudge sideways).
  useEffect(() => {
    const compute = () => {
      const content = document.getElementById("smooth-content");
      let progress = 0;
      if (content) {
        const m = new DOMMatrixReadOnly(
          window.getComputedStyle(content).transform
        );
        const total = content.scrollHeight - window.innerHeight;
        progress = total > 0 ? -m.m42 / total : 0;
      } else {
        const total =
          document.documentElement.scrollHeight - window.innerHeight;
        progress = total > 0 ? window.scrollY / total : 0;
      }
      progress = Math.max(0, Math.min(1, progress));
      progressRef.current = progress;

      // Which section is centred in the viewport right now? Walk the known
      // section ids and pick the one straddling the vertical middle.
      const mid = window.innerHeight / 2;
      const ids = [
        "about",
        "techstack",
        "career",
        "whatido",
        "credentials",
        "contact",
      ];
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top < mid && r.bottom > mid) {
          current = id;
          break;
        }
      }
      sectionRef.current = current;

      setHint(
        progress < 0.06 ? "down" : progress > 0.94 ? "up" : "side"
      );
    };
    compute();
    const poll = window.setInterval(compute, 400);
    window.addEventListener("scroll", compute, { passive: true });
    return () => {
      window.clearInterval(poll);
      window.removeEventListener("scroll", compute);
    };
  }, []);

  // The bot narrates as a guide. It plays the intro handshake lines once, then
  // continually describes whatever section the visitor is currently viewing.
  // Cadence is deliberately SLOW so each line is easy to read before the next.
  useEffect(() => {
    if (!enabled) return;
    // Per-section rotation index so repeated visits to a section cycle its
    // lines instead of repeating the first one.
    const sectionIdx: Record<string, number> = {};
    let bottomIdx = 0;
    let introStep = 0;
    let introDone = false;
    let timer = 0;
    const schedule = (ms: number) => {
      timer = window.setTimeout(speak, ms);
    };
    function speak() {
      // --- Intro handshake narration (plays once, in order) ---
      if (!introDone) {
        setMessage(INTRO_LINES[introStep]);
        introStep += 1;
        if (introStep >= INTRO_LINES.length) introDone = true;
        // Slow, unhurried pace for the welcome; first line lingers a touch more
        // so visitors have plenty of time to read each greeting.
        schedule(introStep === 1 ? 8000 : 9500);
        return;
      }

      // --- Section-aware guidance ---
      const h = hintRef.current;
      const section = sectionRef.current;
      const progress = progressRef.current;
      // Deliberately LONG dwell so each line stays on screen long enough to
      // read comfortably (visitors reported the previous pace was too fast).
      let dwell = 11000;

      if (progress < 0.05) {
        setMessage(TOP_LINE);
      } else if (h === "up" || progress > 0.95) {
        setMessage(BOTTOM_LINES[bottomIdx % BOTTOM_LINES.length]);
        bottomIdx += 1;
        dwell = 12000;
      } else if (section && SECTION_LINES[section]) {
        const lines = SECTION_LINES[section];
        const idx = sectionIdx[section] ?? 0;
        setMessage(lines[idx % lines.length]);
        sectionIdx[section] = idx + 1;
      } else {
        // Between sections — a gentle scroll nudge.
        setMessage("Keep scrolling — I'll point out each part as we go. 👇");
      }
      schedule(dwell);
    }
    speak();
    return () => window.clearTimeout(timer);
  }, [enabled]);

  // React to being shoved: when botMood.pushedAt updates, briefly interrupt the
  // guidance with a playful line so the push feels acknowledged.
  useEffect(() => {
    if (!enabled) return;
    let last = 0;
    let clearTimer = 0;
    const poll = window.setInterval(() => {
      if (botMood.pushedAt && botMood.pushedAt !== last) {
        last = botMood.pushedAt;
        setMessage(PUSH_LINES[Math.floor(Math.random() * PUSH_LINES.length)]);
        window.clearTimeout(clearTimer);
        clearTimer = window.setTimeout(() => {
          // nudge the normal rotation to resume with a fresh guiding line
          setMessage("Back to the tour — scroll on! 👇");
        }, 2200);
      }
    }, 150);
    return () => {
      window.clearInterval(poll);
      window.clearTimeout(clearTimer);
    };
  }, [enabled]);

  // Follow the 3D bot: poll its projected screen position each frame via rAF
  // and move the HTML speech bubble to sit just above its head.
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const follow = () => {
      if (botScreen.ready) {
        setAnchor({
          x: botScreen.x,
          y: botScreen.y,
          ready: true,
          // flip the bubble to the left side when the bot is near the right edge
          flip: botScreen.x > window.innerWidth - 240,
        });
      }
      raf = requestAnimationFrame(follow);
    };
    raf = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="roaming-bot" aria-hidden="true">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10], zoom: 90, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <Rig hint={hint} />
      </Canvas>

      {anchor.ready && (
        <div
          className={`bot-speech${anchor.flip ? " bot-speech-flip" : ""}`}
          style={{ left: anchor.x, top: anchor.y }}
          key={message}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default RoamingBot;
