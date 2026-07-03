import React, { useRef, useState, useEffect } from "react";
import { motion, useSpring } from "framer-motion";
import { useCursor, CursorType } from "./CursorContext";

interface MagneticProps {
  children: React.ReactElement;
  intensity?: number;
  cursor?: CursorType;
  action?: "lift" | "parallax";
}

export function Magnetic({ children, intensity = 0.2, cursor = "button", action = "lift" }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { setCursorType, isMobile } = useCursor();
  const [isHovered, setIsHovered] = useState(false);

  // Springs for smooth magnetic pull
  const x = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });
  const y = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });

  useEffect(() => {
    if (isMobile) return;

    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      // Check if mouse is within a specific radius for magnetic pull
      // We'll just use the bounding box + some padding if we wanted a true radius,
      // but mousemove is fired when hovering the element itself or its wrapper.
      x.set(distanceX * intensity);
      y.set(distanceY * intensity);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      x.set(0);
      y.set(0);
      setCursorType("default");
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
      setCursorType(cursor);
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [x, y, intensity, cursor, setCursorType, isMobile]);

  if (isMobile) {
    return children;
  }

  // Determine what type of motion to apply
  const style = action === "lift" ? { x, y } : { x, y };

  return (
    <motion.div ref={ref} style={style} className="inline-block">
      {children}
    </motion.div>
  );
}
