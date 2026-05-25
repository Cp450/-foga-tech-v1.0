import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fadeUp, fadeLeft, stagger, staggerSlow, viewport } from "../lib/motion";
import TextReveal from "./TextReveal";

const ETAPES = [
  {
    num: "01",
    title: "Devis & cadrage",
    body: "Visite technique offerte. Devis détaillé sous 48 h. Aucun engagement.",
    icon: "search",
  },
  {
    num: "02",
    title: "Conception",
    body: "Plans, modélisation 3D BIM, choix des matériaux et planning détaillé. Validation client.",
    icon: "draw",
  },
  {
    num: "03",
    title: "Réalisation",
    body: "Démarrage chantier, suivi quotidien, photos hebdomadaires sur l'espace client.",
    icon: "construction",
  },
  {
    num: "04",
    title: "Livraison & garantie",
    body: "Réception en présence du client, levée des réserves, garantie décennale gros œuvre.",
    icon: "verified",
  },
];

export default function Process() {
  return (
    <section className="bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20">
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-px bg-secondary-container block flex-shrink-0" />
              <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                Notre méthode
              </p>
            </div>
            <TextReveal
              text="De l'idée"
              as="h2"
              className="font-headline text-3xl md:text-5xl font-black text-primary leading-none"
            />
            <TextReveal
              text="à la livraison."
              as="div"
              className="font-headline text-3xl md:text-5xl font-black text-secondary-container leading-none"
            />
          </motion.div>
          <motion.p
            className="text-on-surface-variant max-w-xs text-sm leading-relaxed md:text-right"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            Un processus éprouvé sur 50+ chantiers, documenté à chaque étape,
            validé par nos clients.
          </motion.p>
        </div>

        {/* Steps — stagger sequential reveal */}
        <div className="relative">
          {/* Horizontal connector line — fades in after steps */}
          <motion.div
            className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-outline-variant origin-left"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={viewport}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            aria-hidden="true"
          />

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8"
            variants={staggerSlow}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            {ETAPES.map((e) => (
              <motion.div key={e.num} variants={fadeUp} className="relative">
                {/* Number circle */}
                <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-surface border-2 border-outline-variant mb-6 transition-colors duration-300 hover:border-secondary-container">
                  <span className="font-headline font-black text-xl text-secondary-container">
                    {e.num}
                  </span>
                </div>

                {/* Icon */}
                <span
                  className="material-symbols-outlined text-2xl text-on-surface-variant/50 mb-4 block"
                  aria-hidden="true"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  {e.icon}
                </span>

                <h3 className="font-headline font-bold text-lg text-primary mb-3">
                  {e.title}
                </h3>
                <p className="text-on-surface-variant font-body text-sm leading-relaxed">
                  {e.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-20 pt-12 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-6"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <p className="font-headline font-bold text-xl text-primary">
            Prêt à démarrer votre projet ?
          </p>
          <Link
            to="/devis"
            className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container font-headline font-black uppercase tracking-widest text-xs px-8 py-4 hover:shadow-tectonic-orange transition-all duration-200 whitespace-nowrap rounded-full"
          >
            Demander un devis
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              arrow_forward
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
