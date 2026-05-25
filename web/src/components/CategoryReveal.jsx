import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";

/* ── Identité visuelle unique par catégorie ───────────────────────────────── */
const CAT_IDENTITY = {
  Terrassement: {
    accent: "#7C2D12",          // terre brûlée profonde
    accentLight: "#C2410C",
    tagline: "FOUILLE · CREUSE · CHARGE",
    letterSpacing: "-0.05em",
    fromY: -70,
    fromX: 0,
    gradient: "from-[#7C2D12]/95 via-[#7C2D12]/60 to-transparent",
  },
  Nivellement: {
    accent: "#1E293B",          // acier nuit
    accentLight: "#334155",
    tagline: "PRÉCISION AU MILLIMÈTRE",
    letterSpacing: "0.18em",
    fromY: 0,
    fromX: -50,
    gradient: "from-[#1E293B]/95 via-[#1E293B]/60 to-transparent",
  },
  Transport: {
    accent: "#1E3A8A",          // bleu autoroutier
    accentLight: "#1D4ED8",
    tagline: "LIVRAISON · 24H · PARTOUT",
    letterSpacing: "0.06em",
    fromY: 0,
    fromX: 50,
    gradient: "from-[#1E3A8A]/95 via-[#1E3A8A]/60 to-transparent",
  },
  Levage: {
    accent: "#7F1D1D",          // rouge industrie
    accentLight: "#B91C1C",
    tagline: "HAUTEUR · PUISSANCE",
    letterSpacing: "-0.03em",
    fromY: 70,
    fromX: 0,
    gradient: "from-[#7F1D1D]/95 via-[#7F1D1D]/60 to-transparent",
  },
  Bétonnage: {
    accent: "#292524",          // béton brut
    accentLight: "#57534E",
    tagline: "BÉTON · PARTOUT · TOUJOURS",
    letterSpacing: "-0.04em",
    fromY: -50,
    fromX: 0,
    gradient: "from-[#292524]/95 via-[#292524]/60 to-transparent",
  },
  Utilitaires: {
    accent: "#14532D",          // vert terrain
    accentLight: "#166534",
    tagline: "TERRAIN · FORCE · MOBILITÉ",
    letterSpacing: "0.1em",
    fromY: 0,
    fromX: -50,
    gradient: "from-[#14532D]/95 via-[#14532D]/60 to-transparent",
  },
};

/* ── Composant ────────────────────────────────────────────────────────────── */
export default function CategoryReveal({ cat, onComplete }) {
  const shouldReduce = useReducedMotion();
  const id = cat?.id ?? "";
  const identity = CAT_IDENTITY[id] ?? {
    accent: "#001022",
    accentLight: "#FF6B00",
    tagline: "",
    letterSpacing: "0",
    fromY: -40,
    fromX: 0,
    gradient: "from-[#001022]/95 via-[#001022]/60 to-transparent",
  };

  /* Auto-transition vers showroom */
  useEffect(() => {
    const duration = shouldReduce ? 0 : 1400;
    const t = setTimeout(onComplete, duration);
    return () => clearTimeout(t);
  }, [onComplete, shouldReduce]);

  const letters = id.toUpperCase().split("");

  /* Font size responsive au nombre de lettres */
  const fontSize = `clamp(2.4rem, calc(88vw / ${Math.max(letters.length, 1)}), 11rem)`;

  /* Variants lettres — direction unique par catégorie */
  const letterVariants = {
    hidden: {
      opacity: 0,
      y: identity.fromY,
      x: identity.fromX,
    },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        delay: 0.28 + i * 0.038,
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
    exit: {
      opacity: 0,
      y: identity.fromY * -0.4,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 overflow-hidden"
      initial={shouldReduce ? { opacity: 0 } : { clipPath: "circle(0% at 50% 50%)" }}
      animate={shouldReduce ? { opacity: 1 } : { clipPath: "circle(150% at 50% 50%)" }}
      exit={shouldReduce ? { opacity: 0 } : { clipPath: "circle(0% at 50% 50%)" }}
      transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Fond couleur accent */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: identity.accent }}
      />

      {/* Image engin — fondue avec le fond */}
      <motion.img
        src={cat?.img ?? ""}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1.12, opacity: 0 }}
        animate={{ scale: 1.04, opacity: 0.55 }}
        exit={{ scale: 1.08, opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Gradients directionnels */}
      <div className={`absolute inset-0 bg-gradient-to-t ${identity.gradient}`} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      {/* Ligne accent lumineuse */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: identity.accentLight }}
        initial={{ scaleX: 0, transformOrigin: "left" }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Contenu centré */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4">

        {/* Icône catégorie */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="material-symbols-outlined text-white/55"
            aria-hidden="true"
            style={{ fontSize: "4rem", fontVariationSettings: "'FILL' 1" }}
          >
            {cat?.icon ?? "construction"}
          </span>
        </motion.div>

        {/* Nom catégorie — lettres staggerées */}
        <div
          className="flex flex-wrap justify-center"
          style={{ letterSpacing: identity.letterSpacing }}
          aria-label={id}
        >
          {letters.map((letter, i) => (
            <motion.span
              key={`${letter}-${i}`}
              custom={i}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              className="font-headline font-black text-white leading-[0.85] select-none"
              style={{ fontSize }}
              aria-hidden="true"
            >
              {letter === " " ? " " : letter}
            </motion.span>
          ))}
        </div>

        {/* Tagline */}
        <motion.p
          className="font-label font-bold text-white/50 text-[10px] uppercase mt-5"
          style={{ letterSpacing: "0.3em" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4, ease: "easeOut" }}
        >
          {identity.tagline}
        </motion.p>

        {/* Badge count */}
        <motion.div
          className="mt-8 flex items-center gap-2.5 border border-white/20 rounded-full px-4 py-2"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.65, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: identity.accentLight }}
          />
          <span className="font-label font-bold text-white/70 text-[11px] uppercase tracking-widest">
            {cat?.count ?? "—"} engins disponibles
          </span>
        </motion.div>
      </div>

      {/* Numéro discret coin bas droite */}
      <motion.div
        className="absolute bottom-8 right-8 font-headline font-black text-white/5 select-none hidden lg:block"
        style={{ fontSize: "12rem", lineHeight: 1 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        aria-hidden="true"
      >
        {String(
          Object.keys(CAT_IDENTITY).indexOf(id) + 1
        ).padStart(2, "0")}
      </motion.div>
    </motion.div>
  );
}
