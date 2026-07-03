import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import type { Mesh } from "three";

type Shape = "torus" | "sphere" | "prism";

function Piece({ shape }: { shape: Shape }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, d) => {
    if (!ref.current) return;
    ref.current.rotation.x += d * 0.12;
    ref.current.rotation.y += d * 0.18;
  });

  const material = (
    <meshPhysicalMaterial
      color="#8B7DFF"
      roughness={0.15}
      metalness={0.4}
      transmission={0.85}
      thickness={1}
      ior={1.4}
      clearcoat={1}
      clearcoatRoughness={0.2}
      envMapIntensity={1.1}
    />
  );

  return (
    <Float speed={1} floatIntensity={0.9} rotationIntensity={0.3}>
      <mesh ref={ref}>
        {shape === "torus" && <torusGeometry args={[0.85, 0.22, 32, 96]} />}
        {shape === "sphere" && <icosahedronGeometry args={[0.9, 3]} />}
        {shape === "prism" && <octahedronGeometry args={[1, 0]} />}
        {material}
      </mesh>
    </Float>
  );
}

/**
 * Small floating 3D accent between sections. Lazy-loaded, offscreen-paused,
 * hidden on mobile / reduced-motion via parent gating.
 */
export default function SectionOrb({ shape = "torus" }: { shape?: Shape }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setActive(e.isIntersecting),
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none relative mx-auto h-40 w-40 opacity-70 sm:h-48 sm:w-48"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle, rgba(139,125,255,0.18) 0%, transparent 65%)",
          filter: "blur(30px)",
        }}
      />
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        camera={{ position: [0, 0, 3.4], fov: 42 }}
        frameloop={active ? "always" : "never"}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 3, 4]} intensity={0.7} color="#B4A9FF" />
        <Piece shape={shape} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
