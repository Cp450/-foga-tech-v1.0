import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
  cubicBezier,
} from "framer-motion";
import { useMemo, useRef } from "react";

const easeIntoFocus = cubicBezier(0.22, 1, 0.36, 1);
const easeOutOfFocus = cubicBezier(0, 0, 0.58, 1);
const focusEase = [easeIntoFocus, easeOutOfFocus];

/**
 * Tile — image + overlay (année + client + titre) avec tilt scroll-driven.
 */
function Tile({ item, side, config }) {
  const ref = useRef(null);
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const reduce = useReducedMotion();
  const sign = side === "L" ? -1 : 1;
  const { aspectRatio, perspective, maxTilt, maxBlur, rounded } = config;

  const blur = useTransform(p, [0, 0.5, 1], [maxBlur, 0, maxBlur], { ease: focusEase });
  const bright = useTransform(p, [0, 0.5, 1], [0.3, 1, 0.3], { ease: focusEase });
  const contrast = useTransform(p, [0, 0.5, 1], [2.5, 1, 2.5], { ease: focusEase });

  const ty = useTransform(p, [0, 0.5, 1], ["60%", "0%", "-60%"], { ease: focusEase });
  const tz = useTransform(p, [0, 0.5, 1], [200, 0, 200], { ease: focusEase });
  const rx = useTransform(p, [0, 0.5, 1], [maxTilt, 0, -maxTilt], { ease: focusEase });

  const tx = useTransform(p, [0, 0.5, 1],
    [`${sign * 25}%`, "0%", `${sign * 25}%`], { ease: focusEase });
  const rot = useTransform(p, [0, 0.5, 1], [-sign * 4, 0, sign * 4], { ease: focusEase });

  const filter = useMotionTemplate`blur(${blur}px) brightness(${bright}) contrast(${contrast})`;

  const renderOverlay = () => (
    <div
      className="absolute inset-0 flex flex-col justify-end p-4 pointer-events-none"
      style={{
        background:
          "linear-gradient(to top, rgba(0,16,34,0.95) 0%, rgba(0,16,34,0.50) 45%, rgba(0,16,34,0.10) 100%)",
      }}
    >
      <p className="font-label font-bold text-[9px] uppercase tracking-[0.2em] text-secondary-container/80 mb-1.5">
        {item.client}
      </p>
      <h3 className="font-headline font-black text-white text-sm md:text-base leading-tight line-clamp-2">
        {item.title}
      </h3>
    </div>
  );

  if (reduce) {
    return (
      <figure ref={ref} className="relative z-10 m-0">
        <div
          className="relative w-full overflow-hidden shadow-tectonic-lg"
          style={{ aspectRatio, borderRadius: rounded }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${item.src}")` }}
          />
          {renderOverlay()}
        </div>
      </figure>
    );
  }

  return (
    <motion.figure
      ref={ref}
      className="relative z-10 m-0"
      style={{ perspective, willChange: "transform" }}
    >
      <motion.div
        className="relative w-full overflow-hidden will-change-[filter,transform] shadow-tectonic-lg"
        style={{
          aspectRatio,
          borderRadius: rounded,
          filter,
          x: tx,
          y: ty,
          z: tz,
          rotate: rot,
          rotateX: rx,
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${item.src}")`,
            backfaceVisibility: "hidden",
          }}
        />
        {renderOverlay()}
      </motion.div>
    </motion.figure>
  );
}

/**
 * ScrollTiltedGrid — grille éditoriale, tilt scroll-driven, 4 colonnes desktop.
 *
 * Props
 * - items: [{ src, year, client, title }, ...]
 * - aspectRatio: CSS aspect-ratio (default "4/5")
 * - gap: tailwind gap-* token (default 6)
 * - perspective: px (default 900)
 * - maxTilt: deg (default 40)
 * - maxBlur: px (default 5)
 * - rounded: CSS border-radius (default "1rem" = rounded-2xl)
 * - className: classes additionnelles sur <section>
 */
export default function ScrollTiltedGrid({
  items = [],
  aspectRatio = "4/5",
  gap = 6,
  perspective = 900,
  maxTilt = 40,
  maxBlur = 5,
  rounded = "1rem",
  className,
}) {
  const config = useMemo(
    () => ({ aspectRatio, perspective, maxTilt, maxBlur, rounded }),
    [aspectRatio, perspective, maxTilt, maxBlur, rounded]
  );

  const gapClass = {
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
    10: "gap-10",
  }[gap] || "gap-6";

  return (
    <section className={["relative w-full", className].filter(Boolean).join(" ")}>
      <div
        className={`mx-auto w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${gapClass} py-[15vh]`}
      >
        {items.map((item, i) => (
          <Tile
            key={`${i}-${item.src}`}
            item={item}
            side={i % 2 === 0 ? "L" : "R"}
            config={config}
          />
        ))}
      </div>
    </section>
  );
}
