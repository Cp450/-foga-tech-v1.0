import { motion } from "framer-motion";
import { viewport } from "../lib/motion";

/**
 * TextReveal — words rise from below a clip mask, cinema style.
 *
 * @param {string} text          — full text to reveal
 * @param {string} as            — HTML tag ("h1" | "h2" | "h3" | "p")
 * @param {string} className     — applied to the outer wrapper
 * @param {number} delay         — stagger delay in seconds (default 0)
 * @param {boolean} animate      — true = fire on mount (heroes above fold)
 * @param {string} viewportMargin — IntersectionObserver margin (default "-80px")
 */
export default function TextReveal({
  text,
  as: Tag = "div",
  className = "",
  delay = 0,
  animate: animateOnMount = false,
  viewportMargin = "-80px",
}) {
  const words = text.split(" ");

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.065, delayChildren: delay },
    },
  };

  const word = {
    hidden: { y: "110%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  // animate on mount → use whileInView with margin "0px" so it fires
  // immediately for above-fold elements, avoiding parent motion context issues
  const motionProps = animateOnMount
    ? {
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, margin: "0px" },
      }
    : {
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, margin: viewportMargin },
      };

  return (
    <Tag className={className}>
      <motion.span
        className="flex flex-wrap gap-x-[0.28em]"
        style={{ overflow: "visible" }}
        variants={container}
        {...motionProps}
      >
        {words.map((w, i) => (
          <span key={`${w}-${i}`} className="overflow-hidden inline-block" style={{ lineHeight: "1.05" }}>
            <motion.span variants={word} className="inline-block">
              {w}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
