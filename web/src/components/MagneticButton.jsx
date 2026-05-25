import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * MagneticButton — wraps any element, makes it subtly follow the cursor.
 * @param {number} strength  — 0.25 = subtle, 0.5 = noticeable (default 0.28)
 * @param {string} className — forwarded to outer motion.div
 */
export default function MagneticButton({ children, strength = 0.28, className = "" }) {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springCfg = { stiffness: 260, damping: 18, mass: 0.6 };
  const springX = useSpring(x, springCfg);
  const springY = useSpring(y, springCfg);

  function handleMouseMove(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
