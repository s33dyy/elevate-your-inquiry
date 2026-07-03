import { useEffect } from "react";
import { useMotionValue, useSpring, useVelocity } from "framer-motion";

export function useMouse() {
  // Raw mouse coordinates
  const x = useMotionValue(typeof window !== "undefined" ? window.innerWidth / 2 : 0);
  const y = useMotionValue(typeof window !== "undefined" ? window.innerHeight / 2 : 0);
  
  // Smooth springs for cursor position (removes jitter)
  const smoothX = useSpring(x, { stiffness: 350, damping: 25, mass: 0.5 });
  const smoothY = useSpring(y, { stiffness: 350, damping: 25, mass: 0.5 });

  // Velocity for stretching effect
  const velX = useVelocity(smoothX);
  const velY = useVelocity(smoothY);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      
      // Inject CSS variables for global spotlight effects
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [x, y]);

  return { x, y, smoothX, smoothY, velX, velY };
}
