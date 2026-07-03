import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function Grid() {
  const ref = useRef<THREE.GridHelper>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    // Slow forward drift, wraps via modulo so the seam is invisible
    ref.current.position.z = (ref.current.position.z + delta * 0.35) % 4;
  });
  return (
    <gridHelper
      ref={ref}
      args={[200, 100, "#8B7DFF", "#2a2540"]}
      position={[0, -2, 0]}
    />
  );
}

/**
 * Subtle animated perspective grid rendered as a fixed background layer.
 * Sits behind content. Pauses when the tab is hidden.
 */
export default function PerspectiveGrid() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const onVis = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        opacity: 0.22,
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 40%, black 70%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 40%, black 70%, transparent 100%)",
      }}
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        camera={{ position: [0, 1.2, 5], fov: 55 }}
        frameloop={active ? "always" : "never"}
        style={{ background: "transparent" }}
      >
        <Grid />
      </Canvas>
    </div>
  );
}
