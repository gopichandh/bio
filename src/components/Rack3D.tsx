import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { unlockAchievement } from "./utils/achievements";
import "./styles/Rack3D.css";

/**
 * Rack3D — an interactive 3D server rack rendered with react-three-fiber.
 * Drag to rotate, scroll to zoom (OrbitControls). Each mounted unit has
 * blinking status LEDs so the rack feels alive. Kept lightweight: simple
 * box geometry + emissive materials, no external model files.
 */

const UNIT_COUNT = 8;
const ACCENT = "#5eead4";

type LEDProps = { position: [number, number, number]; seed: number; color: string };

const LED = ({ position, seed, color }: LEDProps) => {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const pulse = (Math.sin(t * 3 + seed) + 1) / 2;
    ref.current.emissiveIntensity = 0.6 + pulse * 1.8;
  });
  return (
    <mesh position={position}>
      <boxGeometry args={[0.05, 0.05, 0.05]} />
      <meshStandardMaterial
        ref={ref}
        color={color}
        emissive={color}
        emissiveIntensity={1}
        toneMapped={false}
      />
    </mesh>
  );
};

const ServerUnit = ({ y, index }: { y: number; index: number }) => {
  const ledColor = index % 4 === 0 ? "#fbbf24" : "#34d399";
  return (
    <group position={[0, y, 0]}>
      {/* unit face */}
      <mesh castShadow>
        <boxGeometry args={[2, 0.32, 1.1]} />
        <meshStandardMaterial
          color="#111826"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      {/* front bezel strip */}
      <mesh position={[0, 0, 0.56]}>
        <boxGeometry args={[1.8, 0.18, 0.02]} />
        <meshStandardMaterial color="#0b1018" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* drive slots */}
      {[-0.6, -0.3, 0, 0.3].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.57]}>
          <boxGeometry args={[0.18, 0.12, 0.02]} />
          <meshStandardMaterial color="#1c2636" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      {/* status LEDs */}
      <LED position={[0.78, 0, 0.58]} seed={index * 1.7} color={ledColor} />
      <LED position={[0.88, 0, 0.58]} seed={index * 2.3 + 1} color={ACCENT} />
    </group>
  );
};

const Rack = () => {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const units = useMemo(
    () =>
      Array.from({ length: UNIT_COUNT }, (_, i) => ({
        y: 1.7 - i * 0.42,
        index: i,
      })),
    []
  );

  useFrame((_, delta) => {
    if (group.current && !hovered) {
      group.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group
      ref={group}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* rack frame */}
      <mesh>
        <boxGeometry args={[2.3, 4, 1.4]} />
        <meshStandardMaterial
          color="#0a0f18"
          metalness={0.7}
          roughness={0.35}
          transparent
          opacity={0.35}
        />
      </mesh>
      {/* rack edges */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2.3, 4, 1.4)]} />
        <lineBasicMaterial color={ACCENT} transparent opacity={0.55} />
      </lineSegments>
      {units.map((u) => (
        <ServerUnit key={u.index} y={u.y} index={u.index} />
      ))}
    </group>
  );
};

const Rack3D = () => {
  const seen = useRef(false);
  return (
    <div
      className="rack-3d"
      onPointerDown={() => {
        if (!seen.current) {
          seen.current = true;
          unlockAchievement("rack3d", "3D rack — you took it for a spin 🔄");
        }
      }}
    >
      <Canvas
        camera={{ position: [4, 1.5, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, -2, -3]} intensity={0.4} color={ACCENT} />
        <Rack />
        <OrbitControls
          enablePan={false}
          minDistance={4}
          maxDistance={9}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
      <span className="rack-3d-hint">drag to rotate · scroll to zoom</span>
    </div>
  );
};

export default Rack3D;
