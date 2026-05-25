import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { IMG_HERO_DEVIS } from "../lib/images";
import { fadeUp, fadeLeft, stagger, viewport } from "../lib/motion";
import TextReveal from "./TextReveal";
import MagneticButton from "./MagneticButton";

const GUARANTEES = [
  { icon: "bolt", label: "Réponse sous 24h" },
  { icon: "lock", label: "Devis confidentiel" },
  { icon: "handshake", label: "Sans engagement" },
];

export default function CtaFinal() {
  return (
    <section className="relative bg-primary overflow-hidden">
      {/* Orange top bar */}
      <div className="h-1 bg-secondary-container w-full" />

      {/* Background image */}
      <img
        src={IMG_HERO_DEVIS}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-20"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/98 via-primary/90 to-primary-container/80" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-36">
        <div className="max-w-3xl">
          {/* Overline */}
          <motion.div
            className="flex items-center gap-3 mb-10"
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <span className="w-8 h-0.5 bg-secondary-container block flex-shrink-0" />
            <span className="text-secondary-container font-headline font-bold text-xs uppercase tracking-[0.2em]">
              Mokolo na mokolo
            </span>
          </motion.div>

          {/* Headline */}
          <div style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }} className="mb-8">
            <TextReveal
              text="Construisons"
              as="h2"
              className="font-headline font-black text-white leading-[0.9] tracking-tight"
            />
            <TextReveal
              text="l'avenir"
              as="div"
              className="font-headline font-black text-white leading-[0.9] tracking-tight"
            />
            <TextReveal
              text="du Congo."
              as="div"
              className="font-headline font-black text-secondary-container leading-[0.9] tracking-tight"
            />
          </div>

          <motion.p
            className="text-on-primary/70 font-body text-lg leading-relaxed max-w-lg mb-12"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            Villa, immeuble, route ou location d&apos;engins — notre équipe
            vous répond personnellement en moins de 24h, 6j/7.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 mb-14"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <motion.div variants={fadeUp}>
              <MagneticButton>
                <Link
                  to="/devis"
                  className="inline-flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-container font-headline font-black uppercase tracking-widest text-xs px-10 py-5 hover:shadow-tectonic-orange transition-all duration-200 rounded-full"
                >
                  <span
                    className="material-symbols-outlined text-base"
                    aria-hidden="true"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    description
                  </span>
                  Demander un devis offert
                </Link>
              </MagneticButton>
            </motion.div>
            <motion.div variants={fadeUp}>
              <MagneticButton strength={0.18}>
                <a
                  href="https://wa.me/242069610635"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white/40 text-white font-headline font-bold uppercase text-xs tracking-widest px-8 py-5 hover:bg-white/10 hover:border-white transition-colors rounded-full"
                >
                <span
                  className="material-symbols-outlined text-base"
                  aria-hidden="true"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  chat
                </span>
                WhatsApp · +242 06 961 06 35
                </a>
              </MagneticButton>
            </motion.div>
          </motion.div>

          {/* Guarantees */}
          <motion.div
            className="flex flex-wrap gap-6 border-t border-white/10 pt-10"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            {GUARANTEES.map((g) => (
              <motion.div key={g.icon} variants={fadeUp} className="flex items-center gap-2.5">
                <span
                  className="material-symbols-outlined text-secondary-container text-lg"
                  aria-hidden="true"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {g.icon}
                </span>
                <span className="text-on-primary/70 font-body text-sm">
                  {g.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Decorative right accent */}
      <div
        className="absolute right-8 bottom-8 font-headline font-black text-white/5 select-none hidden lg:block"
        style={{ fontSize: "18rem", lineHeight: 1 }}
        aria-hidden="true"
      >
        24H
      </div>
    </section>
  );
}
