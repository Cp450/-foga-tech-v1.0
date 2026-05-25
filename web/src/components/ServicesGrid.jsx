import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fadeUp, fadeLeft, fadeRight, stagger, scaleUp, viewport } from "../lib/motion";
import TextReveal from "./TextReveal";
import {
  IMG_HERO_CHANTIER,
  IMG_PROJET_COMMERCIAL,
  IMG_HERO_GENIE_RURAL,
  IMG_EXCAVATRICE,
} from "../lib/images";

const SERVICES = [
  {
    num: "01",
    label: "Génie Civil & BTP",
    to: "/portfolio",
    image: IMG_HERO_CHANTIER,
    description: "Villas, immeubles, bureaux. De la conception à la livraison clé en main.",
    icon: "apartment",
    featured: true,
  },
  {
    num: "02",
    label: "Études & Maîtrise",
    to: "/genie-civil",
    image: IMG_PROJET_COMMERCIAL,
    description: "Bureau d'étude intégré — plans d'exécution, contrôle qualité, pilotage de chantier.",
    icon: "architecture",
  },
  {
    num: "03",
    label: "Génie Rural",
    to: "/genie-rural",
    image: IMG_HERO_GENIE_RURAL,
    description: "Routes, ponts, irrigation, infrastructures agricoles.",
    icon: "forest",
  },
  {
    num: "04",
    label: "Location Engins",
    to: "/location",
    image: IMG_EXCAVATRICE,
    description: "65 engins, livraison sous 24h, opérateurs certifiés inclus.",
    icon: "construction",
  },
];

function ServiceCard({ s, className = "", imgHeight = "h-64" }) {
  return (
    <Link
      to={s.to}
      className={`group relative overflow-hidden block card-lift ${className}`}
    >
      {/* Background image */}
      <div className={`${imgHeight} relative overflow-hidden`}>
        <img
          src={s.image}
          alt={s.label}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />

        {/* Number badge */}
        <div className="absolute top-4 left-4 font-headline font-black text-on-primary/20 text-5xl leading-none select-none">
          {s.num}
        </div>

        {/* Bottom text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="material-symbols-outlined text-secondary-container text-lg"
              aria-hidden="true"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {s.icon}
            </span>
            <span className="font-headline font-black text-white text-lg leading-tight">
              {s.label}
            </span>
          </div>
          <p className="text-on-primary/70 font-body text-xs leading-relaxed">
            {s.description}
          </p>
        </div>
      </div>

      {/* Hover arrow strip */}
      <div className="bg-surface-container-lowest border-x border-b border-outline-variant px-5 py-3 flex items-center justify-between">
        <span className="text-xs font-headline font-bold uppercase tracking-widest text-primary">
          Découvrir
        </span>
        <span
          className="material-symbols-outlined text-secondary-container text-base group-hover:translate-x-1 transition-transform"
          aria-hidden="true"
        >
          arrow_forward
        </span>
      </div>
    </Link>
  );
}

export default function ServicesGrid() {
  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">
              Nos expertises
            </p>
            <TextReveal
              text="Quatre métiers,"
              as="h2"
              className="font-headline text-3xl md:text-5xl font-black text-primary leading-none"
            />
            <TextReveal
              text="une exigence."
              as="div"
              className="font-headline text-3xl md:text-5xl font-black text-secondary-container leading-none"
            />
          </motion.div>
          <motion.p
            className="text-on-surface-variant max-w-xs text-sm leading-relaxed md:text-right"
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            De la villa individuelle à la route rurale — Foga-Tech couvre
            l&apos;intégralité du cycle BTP au Congo.
          </motion.p>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-outline-variant"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          {/* 01 — Featured (spans 2 cols on lg) */}
          <motion.div variants={scaleUp} className="lg:col-span-2 border-b md:border-b lg:border-b-0 border-outline-variant md:border-r">
            <ServiceCard s={SERVICES[0]} imgHeight="h-80 lg:h-[440px]" />
          </motion.div>

          {/* Right column: 02 + 03 stacked — desktop */}
          <motion.div variants={scaleUp} className="hidden lg:flex lg:flex-col">
            <div className="border-b border-outline-variant flex-1">
              <ServiceCard s={SERVICES[1]} imgHeight="h-[216px]" />
            </div>
            <div className="flex-1">
              <ServiceCard s={SERVICES[2]} imgHeight="h-[216px]" />
            </div>
          </motion.div>

          {/* 02 + 03 — tablet */}
          <motion.div variants={scaleUp} className="lg:hidden border-b md:border-b-0 border-outline-variant md:border-r">
            <ServiceCard s={SERVICES[1]} imgHeight="h-64" />
          </motion.div>
          <motion.div variants={scaleUp} className="lg:hidden border-b border-outline-variant">
            <ServiceCard s={SERVICES[2]} imgHeight="h-64" />
          </motion.div>

          {/* 04 — full width */}
          <motion.div variants={fadeUp} className="lg:col-span-3 border-t border-outline-variant">
            <Link
              to={SERVICES[3].to}
              className="group flex flex-col md:flex-row items-stretch overflow-hidden card-lift"
            >
              <div className="md:w-2/5 h-56 md:h-auto relative overflow-hidden flex-shrink-0">
                <img
                  src={SERVICES[3].image}
                  alt={SERVICES[3].label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-primary/40" />
                <div className="absolute top-4 left-4 font-headline font-black text-on-primary/20 text-5xl leading-none select-none">
                  {SERVICES[3].num}
                </div>
              </div>
              <div className="flex-1 bg-surface-container-lowest flex flex-col justify-center px-8 py-8 md:py-6">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="material-symbols-outlined text-secondary-container text-xl"
                    aria-hidden="true"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {SERVICES[3].icon}
                  </span>
                  <span className="font-headline font-black text-primary text-2xl">
                    {SERVICES[3].label}
                  </span>
                </div>
                <p className="text-on-surface-variant font-body text-sm leading-relaxed max-w-md">
                  {SERVICES[3].description}
                </p>
                <div className="flex items-center gap-2 text-primary font-headline font-bold text-xs uppercase tracking-widest mt-6">
                  Voir le parc d&apos;engins
                  <span
                    className="material-symbols-outlined text-secondary-container text-base group-hover:translate-x-1 transition-transform"
                    aria-hidden="true"
                  >
                    arrow_forward
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
