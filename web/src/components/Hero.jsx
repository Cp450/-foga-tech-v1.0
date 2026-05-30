import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { IMG_HERO_CHANTIER } from "../lib/images";
import AnimatedCounter from "./AnimatedCounter";
import TextReveal from "./TextReveal";
import MagneticButton from "./MagneticButton";
import { fadeUp, fadeLeft, stagger, viewport } from "../lib/motion";

const STATS = [
  { val: 12, suffix: "ans", label: "d'expérience locale" },
  { val: 15, suffix: "+", label: "chantiers livrés" },
  { val: 98, suffix: "%", label: "satisfaction client" },
  { val: 65, suffix: "", label: "engins disponibles" },
];

export default function Hero() {
  const ref = useRef(null);
  const { scrollY } = useScroll();

  // Right panel image drifts up 80px as user scrolls 600px → parallax depth
  const imgY = useTransform(scrollY, [0, 600], [0, -80]);
  // Floating card drifts slightly faster → extra depth layer
  const cardY = useTransform(scrollY, [0, 600], [0, -40]);
  // Left text content barely moves → almost fixed
  const textY = useTransform(scrollY, [0, 600], [0, -20]);

  return (
    <section ref={ref} id="accueil" className="min-h-screen bg-primary flex flex-col overflow-hidden">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[55%_45%] pt-16">

        {/* ── Left panel ───────────────────────────────────────── */}
        <div className="relative flex flex-col justify-between px-8 sm:px-14 xl:px-20 py-12 lg:py-16 overflow-hidden">

          {/* Subtle dot texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden="true"
          />

          {/* Vertical orange accent bar */}
          <div
            className="absolute left-0 top-20 bottom-20 w-[3px] bg-secondary-container"
            aria-hidden="true"
          />

          {/* Top: overline */}
          <motion.div
            className="relative z-10 flex items-center gap-3"
            variants={fadeLeft}
            initial="hidden"
            animate="visible"
          >
            <span className="w-6 h-px bg-secondary-container/60 block flex-shrink-0" />
            <span className="text-secondary-container font-headline font-bold text-[11px] uppercase tracking-[0.25em]">
              Brazzaville · Congo · depuis 2015
            </span>
          </motion.div>

          {/* Middle: headline + description + CTAs — subtle parallax */}
          <motion.div
            className="relative z-10"
            style={{ y: textY }}
          >
            <div style={{ fontSize: "clamp(32px, 7.5vw, 7rem)" }}>
              <TextReveal
                text="Bâtisseurs"
                as="h1"
                className="font-headline font-black text-white leading-[0.85] tracking-tight"
                animate
                delay={0.1}
              />
              <TextReveal
                text="du"
                as="div"
                className="font-headline font-black text-white leading-[0.85] tracking-tight"
                animate
                delay={0.22}
              />
              <TextReveal
                text="Congo."
                as="div"
                className="font-headline font-black text-secondary-container leading-[0.85] tracking-tight"
                animate
                delay={0.34}
              />
            </div>

            <motion.p
              className="text-on-primary/60 font-body text-base md:text-lg mt-8 max-w-sm leading-relaxed"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.45 }}
            >
              Génie civil, Génie Rural, location d&apos;engins.
              L&apos;ingénierie au service du développement congolais depuis 12 ans.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-3 mt-10"
              variants={stagger}
              initial="hidden"
              animate="visible"
              transition={{ delayChildren: 0.55, staggerChildren: 0.12 }}
            >
              <motion.div variants={fadeUp}>
                <MagneticButton>
                  <Link
                    to="/devis"
                    className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container font-headline font-black uppercase tracking-widest text-xs px-8 py-4 hover:shadow-tectonic-orange transition-all duration-200 rounded-full"
                  >
                    <span
                      className="material-symbols-outlined text-base"
                      aria-hidden="true"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      description
                    </span>
                    Demander un devis
                  </Link>
                </MagneticButton>
              </motion.div>
              <motion.div variants={fadeUp}>
                <MagneticButton strength={0.18}>
                  <Link
                    to="/portfolio"
                    className="inline-flex items-center gap-2 border border-on-primary/25 text-on-primary hover:bg-on-primary/10 px-6 py-4 font-headline font-bold uppercase text-xs tracking-widest transition rounded-full"
                  >
                    Nos réalisations
                    <span
                      className="material-symbols-outlined text-sm"
                      aria-hidden="true"
                    >
                      arrow_forward
                    </span>
                  </Link>
                </MagneticButton>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Bottom: stats row */}
          <motion.div
            className="relative z-10 grid grid-cols-4 border-t border-white/10 pt-8 mt-auto"
            variants={stagger}
            initial="hidden"
            animate="visible"
            transition={{ delayChildren: 0.7, staggerChildren: 0.1 }}
          >
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                className={i < 3 ? "border-r border-white/10 pr-4 mr-4" : ""}
              >
                <p
                  className="font-headline font-black text-white leading-none"
                  style={{ fontSize: "clamp(18px, 2.8vw, 2.5rem)" }}
                >
                  <AnimatedCounter end={s.val} suffix={s.suffix} duration={1600} />
                </p>
                <p className="text-on-primary/40 font-body text-[10px] mt-2 leading-tight">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── Right panel: image with parallax ─────────────── */}
        <div className="hidden lg:block relative overflow-hidden">
          {/* Image with parallax — drifts up as user scrolls */}
          <motion.div
            className="absolute inset-0"
            style={{ y: imgY, scale: 1.08 }}
          >
            <img
              src={IMG_HERO_CHANTIER}
              alt="Ouvriers Foga-Tech BTP sur chantier au Congo"
              className="w-full h-full object-cover"
              fetchPriority="high"
            />
          </motion.div>

          {/* Diagonal left-edge cut */}
          <div
            className="absolute inset-0 bg-primary pointer-events-none z-10"
            style={{ clipPath: "polygon(0 0, 22% 0, 0 100%)" }}
            aria-hidden="true"
          />
          {/* Soft gradient blend */}
          <div
            className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-primary/60 to-transparent pointer-events-none z-10"
            aria-hidden="true"
          />
          {/* Darkening veil */}
          <div
            className="absolute inset-0 bg-primary/25 pointer-events-none z-10"
            aria-hidden="true"
          />

          {/* Floating project card — own parallax layer */}
          <motion.div
            className="absolute bottom-10 right-8 bg-white/97 backdrop-blur-sm p-5 w-[17rem] shadow-tectonic-lg border-l-4 border-secondary-container rounded-2xl z-20"
            style={{ y: cardY }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2 h-2 rounded-full bg-green-500 animate-pulse block flex-shrink-0"
                aria-hidden="true"
              />
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
                Chantier en cours
              </span>
            </div>
            <p className="font-headline font-black text-primary text-sm leading-tight">
              Immeuble R+4 Ouenzé
            </p>
            <p className="text-xs text-on-surface-variant font-body mt-0.5">
              Brazzaville · Génie Civil · 1 200 m²
            </p>
            <div className="mt-3">
              <div className="flex justify-between text-xs font-label font-bold mb-1.5">
                <span className="text-on-surface-variant">Avancement</span>
                <span className="text-secondary-container">74%</span>
              </div>
              <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary-container rounded-full"
                  style={{ width: "74%" }}
                />
              </div>
            </div>
          </motion.div>

          {/* Top-right orange badge */}
          <motion.div
            className="absolute top-8 right-8 bg-secondary-container text-on-secondary-container font-headline font-black text-[10px] uppercase tracking-[0.2em] px-3 py-2 z-20"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Congo · Afrique Centrale
          </motion.div>
        </div>
      </div>
    </section>
  );
}
