import React, { useEffect, useState } from "react";
import { motion, useTransform } from "framer-motion";
import { useMouse } from "./useMouse";
import { useCursor } from "./CursorContext";

export function Cursor() {
  const { smoothX, smoothY, velX, velY } = useMouse();
  const { cursorType, isMobile } = useCursor();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show cursor after first mouse movement to avoid it sitting in the corner
    const onMouseMove = () => setIsVisible(true);
    window.addEventListener("mousemove", onMouseMove, { once: true });
    
    // Hide cursor when leaving window
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, []);

  // Velocity-based stretching
  const rotate = useTransform(() => {
    const vx = velX.get();
    const vy = velY.get();
    if (vx === 0 && vy === 0) return 0;
    return Math.atan2(vy, vx) * (180 / Math.PI);
  });

  const scaleX = useTransform(() => {
    const vx = velX.get();
    const vy = velY.get();
    const speed = Math.sqrt(vx * vx + vy * vy);
    return 1 + Math.min(speed / 800, 0.4); // Max 40% stretch
  });

  const scaleY = useTransform(() => {
    const vx = velX.get();
    const vy = velY.get();
    const speed = Math.sqrt(vx * vx + vy * vy);
    return 1 - Math.min(speed / 1600, 0.2); // Max 20% squish
  });

  // Do not render custom cursor on mobile/touch devices
  if (isMobile) return null;

  // Adaptive Styles based on context
  const variants = {
    default: {
      width: 24,
      height: 24,
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      backdropFilter: "blur(6px) saturate(1.5)",
      boxShadow: "inset 0 0 10px rgba(255,255,255,0.1), 0 0 2px rgba(255,255,255,0.1)",
      transition: { type: "spring" as const, stiffness: 300, damping: 20 }
    },
    button: {
      width: 48,
      height: 48,
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0)",
      border: "1px solid rgba(255, 255, 255, 0.5)",
      backdropFilter: "blur(0px) saturate(1)",
      boxShadow: "inset 0 0 0px rgba(255,255,255,0), 0 0 0px rgba(255,255,255,0)",
      transition: { type: "spring" as const, stiffness: 300, damping: 20 }
    },
    card: {
      width: 80,
      height: 80,
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.02)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(12px) brightness(1.2) saturate(1.5)",
      boxShadow: "inset 0 0 20px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.2)",
      transition: { type: "spring" as const, stiffness: 200, damping: 20 }
    },
    hidden: {
      width: 0,
      height: 0,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <>
      {/* Soft Trail */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998]"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: isVisible && cursorType === "default" ? 0.08 : 0,
        }}
        transition={{ duration: 0.1, delay: 0.02 }} // Slight delay for trail
      >
        <div className="h-[80px] w-[80px] rounded-full bg-white blur-xl" />
      </motion.div>

      {/* Main Glass Cursor */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] flex items-center justify-center overflow-hidden"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          rotate,
          scaleX: cursorType === "default" ? scaleX : 1,
          scaleY: cursorType === "default" ? scaleY : 1,
          opacity: isVisible ? 1 : 0,
        }}
        animate={variants[cursorType] as never}
      >
        {/* Inner dot for default state */}
        <motion.div
          className="absolute rounded-full bg-white"
          animate={{
            width: cursorType === "default" ? 4 : 0,
            height: cursorType === "default" ? 4 : 0,
            opacity: cursorType === "default" ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </>
  );
}
