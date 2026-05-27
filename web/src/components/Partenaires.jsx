import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { PARTENAIRES } from "../data/partenaires";
import PartenaireModal from "./PartenaireModal";
import WaveBackground from "./WaveBackground";
import { staggerFast, scaleUp, fadeUp, viewport } from "../lib/motion";

/* ─── Card logo (glass effect au-dessus des vagues) ────────────── */
function PartenaireCard({ partenaire, onOpen }) {
  return (
    <article className="group relative z-10 flex flex-col items-center justify-between gap-5 bg-white/[0.06] backdrop-blur-md hover:bg-white/[0.12] ring-1 ring-white/15 hover:ring-[#234998]/50 rounded-2xl p-6 transition-all duration-300 card-lift-dark">
      {/* Logo monochrome → couleur au hover */}
      <div className="flex items-center justify-center h-16 w-full">
        <img
          src={partenaire.logo}
          alt={`Logo ${partenaire.nom}`}
          className="max-h-14 max-w-[160px] object-contain brightness-0 invert opacity-70 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100 transition-all duration-500"
          loading="lazy"
          style={partenaire.logoScale ? { transform: `scale(${partenaire.logoScale})`, transformOrigin: "center" } : undefined}
        />
      </div>

      <div className="w-8 h-px bg-white/20 group-hover:bg-[#4A7BC8]/60 transition-colors duration-300" />

      <p className="font-label font-bold text-[10px] uppercase tracking-[0.18em] text-white/50 group-hover:text-white/80 text-center leading-tight transition-colors duration-300">
        {partenaire.nom}
      </p>

      <button
        onClick={onOpen}
        className="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 inline-flex items-center gap-1.5 text-[#234998] font-label font-bold text-[10px] uppercase tracking-widest hover:underline"
        aria-label={`En savoir plus sur ${partenaire.nom}`}
      >
        En savoir plus
        <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
      </button>
    </article>
  );
}

/* ─── Section principale ───────────────────────────────────────── */
export default function Partenaires() {
  const [actif, setActif] = useState(null);
  const fermer = useCallback(() => setActif(null), []);

  return (
    <section className="relative bg-[#001634] pt-20 pb-24 px-4 sm:px-6 overflow-hidden">
      {/* Vagues animées en background (desktop only) */}
      <WaveBackground />

      {/* Grille partenaires — stagger reveal */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-20"
        variants={staggerFast}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        {PARTENAIRES.map((p) => (
          <motion.div key={p.id} variants={scaleUp}>
            <PartenaireCard partenaire={p} onOpen={() => setActif(p)} />
          </motion.div>
        ))}
      </motion.div>

      {/* CTA bas */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto flex justify-center"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        <a
          href="https://wa.me/242069905640?text=Bonjour%20Foga-Tech%2C%20je%20souhaite%20discuter%20d%27un%20partenariat."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 border border-white/20 text-white/70 hover:text-white hover:border-[#4A7BC8]/60 font-label font-bold text-xs uppercase tracking-widest px-6 py-4 rounded-full transition-all duration-300"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">handshake</span>
          Devenir partenaire Foga-Tech
        </a>
      </motion.div>

      {actif && <PartenaireModal partenaire={actif} onClose={fermer} />}
    </section>
  );
}
