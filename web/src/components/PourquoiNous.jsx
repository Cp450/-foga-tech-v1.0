import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import { fadeUp, fadeLeft, stagger, scaleUp, viewport } from "../lib/motion";
import TextReveal from "./TextReveal";

const BIG_STATS = [
  { val: 12, suffix: " ans", label: "d'ancrage local au Congo" },
  { val: 15, suffix: "+", label: "chantiers livrés" },
  { val: 98, suffix: "%", label: "de satisfaction client" },
  { val: 65, suffix: "", label: "engins en parc propre" },
];

const PILIERS = [
  {
    icon: "verified",
    title: "Certifié & agréé",
    body: "Agrément Ministère BTP du Congo, normes BNC & Eurocode appliquées. Tous nos chefs sont membres de l'Ordre des Ingénieurs.",
  },
  {
    icon: "schedule",
    title: "Délais respectés",
    body: "98% de nos chantiers sont livrés dans les délais contractuels. Pénalité automatique de 0,5%/semaine en cas de retard imputable à Foga-Tech.",
  },
  {
    icon: "account_tree",
    title: "Transparence totale",
    body: "Suivi de chantier en temps réel via l'espace client. Photos, avancement, dépenses : tout est documenté.",
  },
  {
    icon: "groups",
    title: "Équipe locale",
    body: "100% de nos chefs et ouvriers sont congolais. Ancrage territorial, connaissance du terrain, soutien à l'économie locale.",
  },
];

const CERTIFS = ["Agrément Ministère BTP", "Ordre des Ingénieurs Congo", "ONIMOB", "Eurocode 2", "HQE (en cours)"];

export default function PourquoiNous() {
  return (
    <section className="bg-primary text-on-primary overflow-hidden">
      {/* Orange top accent bar */}
      <div className="h-1 bg-secondary-container w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">

        {/* Section label */}
        <motion.div
          className="flex items-center gap-3 mb-12"
          variants={fadeLeft}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <span className="w-8 h-0.5 bg-secondary-container block flex-shrink-0" />
          <p className="text-secondary-container font-label text-xs uppercase tracking-widest">
            Notre engagement
          </p>
        </motion.div>

        {/* Big stats row — counters animate on enter */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-0 border border-white/10 mb-16"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          {BIG_STATS.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className={`p-8 md:p-10 ${
                i < BIG_STATS.length - 1
                  ? "border-b lg:border-b-0 border-r lg:border-r border-white/10"
                  : ""
              } ${i === 1 || i === 3 ? "lg:border-r-0" : ""}`}
            >
              <p
                className="font-headline font-black text-white leading-none"
                style={{ fontSize: "clamp(3rem, 5vw, 5rem)" }}
              >
                <AnimatedCounter end={s.val} suffix={s.suffix} />
              </p>
              <p className="text-on-primary/50 font-body text-xs mt-3 leading-relaxed">
                {s.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Heading */}
        <div className="mb-16 max-w-xl">
          <TextReveal
            text="Pourquoi choisir"
            as="h2"
            className="font-headline text-3xl md:text-5xl font-black text-white leading-tight"
          />
          <TextReveal
            text="Foga-Tech."
            as="div"
            className="font-headline text-3xl md:text-5xl font-black text-secondary-container leading-tight"
          />
        </div>

        {/* 4 pillars — stagger reveal */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          {PILIERS.map((p) => (
            <motion.div key={p.icon} variants={fadeUp} className="group">
              <div className="mb-5 w-12 h-12 border border-white/20 flex items-center justify-center group-hover:border-secondary-container transition-colors duration-300">
                <span
                  className="material-symbols-outlined text-2xl text-secondary-container"
                  aria-hidden="true"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  {p.icon}
                </span>
              </div>
              <h3 className="font-headline font-bold text-lg text-white mb-3">
                {p.title}
              </h3>
              <p className="text-on-primary/70 font-body text-sm leading-relaxed">
                {p.body}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Certifications strip */}
        <motion.div
          className="mt-20 pt-12 border-t border-white/10"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <p className="text-on-primary/40 font-label text-[10px] uppercase tracking-widest mb-6 text-center">
            Certifications &amp; accréditations
          </p>
          <motion.div
            className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            {CERTIFS.map((c) => (
              <motion.span
                key={c}
                variants={fadeUp}
                className="text-on-primary/50 hover:text-on-primary/80 font-headline font-bold text-xs uppercase tracking-widest transition-colors"
              >
                {c}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
