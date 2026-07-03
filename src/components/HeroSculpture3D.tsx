import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshDistortMaterial } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Premium hero sculpture: a soft distorted glass icosahedron with
 * two orbital rings and floating panels. Mouse-reactive, offscreen-paused,
 * respects prefers-reduced-motion.
 */

function Sculpture({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    // Smooth follow toward pointer
    const tx = pointer.current.y * 0.35;
    const ty = pointer.current.x * 0.5;
    group.current.rotation.x += (tx - group.current.rotation.x) * 0.05;
    group.current.rotation.y += (ty - group.current.rotation.y) * 0.05;
    if (ring1.current) ring1.current.rotation.z += delta * 0.25;
    if (ring2.current) ring2.current.rotation.z -= delta * 0.18;
  });

  return (
    <group ref={group}>
      <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.55}>
        {/* Central glass sculpture */}
        <mesh castShadow>
          <icosahedronGeometry args={[1.15, 24]} />
          <MeshDistortMaterial
            color="#8B7DFF"
            roughness={0.08}
            metalness={0.35}
            transmission={0.9}
            thickness={1.2}
            ior={1.35}
            distort={0.32}
            speed={1.1}
            clearcoat={1}
            clearcoatRoughness={0.15}
            envMapIntensity={1.2}
            attach="material"
          />
        </mesh>

        {/* Inner core glow */}
        <mesh scale={0.42}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#B4A9FF" transparent opacity={0.35} />
        </mesh>

        {/* Orbital ring 1 */}
        <mesh ref={ring1} rotation={[Math.PI / 2.6, 0, 0]}>
          <torusGeometry args={[1.85, 0.006, 12, 128]} />
          <meshBasicMaterial color="#8B7DFF" transparent opacity={0.55} />
        </mesh>

        {/* Orbital ring 2 */}
        <mesh ref={ring2} rotation={[Math.PI / 2.2, Math.PI / 4, 0]}>
          <torusGeometry args={[2.35, 0.004, 12, 128]} />
          <meshBasicMaterial color="#6E78FF" transparent opacity={0.35} />
        </mesh>
      </Float>

      {/* Floating dashboard panels */}
      <Float speed={0.9} floatIntensity={0.9} rotationIntensity={0.1}>
        <mesh position={[-1.9, 0.9, -0.6]} rotation={[0, 0.4, -0.08]}>
          <planeGeometry args={[0.95, 0.6]} />
          <meshPhysicalMaterial
            color="#18181F"
            transmission={0.6}
            thickness={0.5}
            roughness={0.25}
            metalness={0.1}
            transparent
            opacity={0.75}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Float>

      <Float speed={1.15} floatIntensity={0.8} rotationIntensity={0.1}>
        <mesh position={[1.85, -0.7, -0.4]} rotation={[0, -0.35, 0.06]}>
          <planeGeometry args={[0.75, 0.48]} />
          <meshPhysicalMaterial
            color="#20202A"
            transmission={0.55}
            thickness={0.5}
            roughness={0.2}
            metalness={0.1}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Float>
    </group>
  );
}

export default function HeroSculpture3D() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const el = wrapperRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      pointer.current.x = ((e.clientX - cx) / window.innerWidth) * 2;
      pointer.current.y = ((e.clientY - cy) / window.innerHeight) * 2;
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative h-[420px] w-[420px]"
      aria-hidden="true"
    >
      {/* Ambient halo */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(139,125,255,0.22) 0%, transparent 62%)",
          filter: "blur(50px)",
        }}
      />
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 5.2], fov: 42 }}
        frameloop={visible ? "always" : "never"}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 4, 5]} intensity={0.9} color="#B4A9FF" />
        <directionalLight position={[-4, -2, -3]} intensity={0.4} color="#6E78FF" />
        <Sculpture pointer={pointer} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
