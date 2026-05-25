import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";

/**
 * AnimatedCounter — counts from 0 to `end` when enters viewport
 * @param {number|string} end  — target value (numeric part only)
 * @param {string} prefix      — prepended (e.g. "+")
 * @param {string} suffix      — appended (e.g. "%", "+", " ans")
 * @param {number} duration    — ms (default 1800)
 */
export default function AnimatedCounter({
  end,
  prefix = "",
  suffix = "",
  duration = 1800,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [count, setCount] = useState(0);
  const target = parseInt(String(end).replace(/\D/g, ""), 10) || 0;

  useEffect(() => {
    if (!isInView || target === 0) return;

    let startTime = null;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}
