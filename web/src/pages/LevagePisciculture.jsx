import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeUp, stagger } from '../lib/motion'
import SEO from '../components/SEO'
import TextReveal from '../components/TextReveal'


const standards = [
  {
    icon: 'security',
    title: "Hygiène & Biosécurité",
    desc: "Conception de zones de sas sanitaires, gestion des flux air/eau et surfaces faciles à décontaminer pour prévenir les épidémies.",
  },
  {
    icon: 'settings_input_component',
    title: "Automatisation Intégrée",
    desc: "Monitoring à distance via IoT pour la distribution d'aliments, le contrôle climatique et la surveillance de la croissance.",
  },
  {
    icon: 'construction',
    title: "Durabilité Structurale",
    desc: "Matériaux résistants à l'ammoniac et aux environnements corrosifs. Fondations calculées pour les charges lourdes agricoles.",
  },
]

export default function LevagePisciculture() {
  return (
    <main className="bg-surface text-on-surface font-body">
      <SEO
        title="Élevage & Pisciculture Congo — Bâtiments avicoles, porcins, étangs | Foga-Tech BTP"
        description="Foga-Tech BTP construit bâtiments avicoles, porcheries, étables et étangs piscicoles au Congo-Brazzaville. Infrastructures spécialisées génie rural depuis 2012."
        canonical="https://foga-tech.tech/genie-rural/levage-pisciculture"
      />

      {/* Hero — Home DNA Ken Burns multi-image */}
      <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#002045]">
        {/* Layer 1 — Ken Burns 3 images */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {[
            { src: "/elevage-hero-1.webp", cls: "el-1", eager: true },
            { src: "/elevage-hero-2.webp", cls: "el-2", eager: false },
            { src: "/elevage-hero-3.webp", cls: "el-3", eager: false },
          ].map(({ src, cls, eager }) => (
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden="true"
              loading={eager ? "eager" : "lazy"}
              fetchPriority={eager ? "high" : "auto"}
              className={`el-bg-img ${cls} absolute inset-0 w-full h-full object-cover opacity-0 contrast-110 saturate-110`}
            />
          ))}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,32,69,0.88) 0%, rgba(0,32,69,0.35) 50%, rgba(0,13,26,0.45) 100%)",
            }}
          />
        </div>

        {/* Layer 2 — radial glow orange uniquement */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(254,147,44,0.10), transparent 60%)",
          }}
        />

        {/* Layer 3 — content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 lg:px-12 pt-32 pb-20">
          <motion.div
            className="max-w-[680px]"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.nav variants={fadeUp} aria-label="Fil d'Ariane" className="flex items-center gap-2 mb-6">
              <Link to="/" className="text-white/45 text-[11px] font-headline font-black uppercase tracking-[0.2em] hover:text-white transition-colors">
                Accueil
              </Link>
              <span className="text-white/55 text-[11px]" aria-hidden="true">/</span>
              <Link to="/genie-rural" className="text-white/45 text-[11px] font-headline font-black uppercase tracking-[0.2em] hover:text-white transition-colors">
                Génie Rural
              </Link>
              <span className="text-white/55 text-[11px]" aria-hidden="true">/</span>
              <span className="text-secondary-container text-[11px] font-headline font-black uppercase tracking-[0.2em]">
                Élevage &amp; Pisciculture
              </span>
            </motion.nav>
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <span className="w-4 h-px bg-secondary-container" />
              <span className="font-headline font-black text-[10px] uppercase tracking-[0.25em] text-secondary-container">
                Génie Rural &amp; Innovation
              </span>
            </motion.div>
            <div style={{ fontSize: "clamp(52px,7.5vw,100px)" }}>
              <TextReveal
                text="Élevage"
                as="h1"
                className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em]"
                animate
                delay={0.1}
              />
              <TextReveal
                text="moderne."
                as="div"
                className="font-headline font-black text-secondary-container leading-[0.92] tracking-[-0.03em] mb-6"
                animate
                delay={0.3}
              />
            </div>
            <motion.p
              variants={fadeUp}
              className="font-body text-white/70 text-lg leading-relaxed mb-10 max-w-xl"
            >
              Conception et construction d&apos;infrastructures agro-industrielles
              de haute précision. Durabilité structurelle, automatisation avancée
              et conformité aux standards d&apos;hygiène internationaux.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-headline font-bold text-primary tracking-tight mb-4">
                Infrastructures Spécialisées
              </h2>
              <p className="text-on-surface-variant font-body">
                Une ingénierie robuste pour optimiser vos rendements et garantir le bien-être animal
                grâce à des environnements contrôlés.
              </p>
            </div>
            <span className="text-primary font-label font-bold text-5xl opacity-10 hidden md:block">01</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

            {/* Aviculture */}
            <div className="md:col-span-7 bg-surface-container-lowest flex flex-col md:flex-row shadow-sm rounded-2xl overflow-hidden min-h-[420px]">
              <div className="p-10 flex flex-col justify-between flex-1">
                <div>
                  <span className="material-symbols-outlined text-secondary-container text-5xl mb-6 block">egg_alt</span>
                  <h3 className="text-3xl font-headline font-bold text-primary mb-4">
                    Aviculture Industrielle
                  </h3>
                  <p className="text-on-surface-variant max-w-md mb-8">
                    Bâtiments climatisés pour poulets de chair et pondeuses. Isolation thermique haute
                    performance et systèmes de ramassage automatisés.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Ventilation Dynamique",
                      "Silos de stockage intégrés",
                      "Biopsie d'ambiance automatisée",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm font-bold text-primary">
                        <span className="material-symbols-outlined text-secondary-container text-base">check_circle</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="w-full md:w-2/5 h-48 md:h-auto overflow-hidden shrink-0">
                <img
                  src="/aviculture.webp"
                  alt="Bâtiment avicole industriel — Foga-Tech"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Porcheries */}
            <div className="md:col-span-5 bg-primary text-white flex flex-col rounded-2xl overflow-hidden">
              <div className="h-48 overflow-hidden shrink-0">
                <img
                  src="/porcherie.webp"
                  alt="Porcherie moderne — Foga-Tech"
                  className="w-full h-full object-cover opacity-80"
                  loading="lazy"
                />
              </div>
              <div className="p-10 flex flex-col justify-center flex-1">
                <h3 className="text-2xl font-headline font-bold mb-4">Porcheries Modernes</h3>
                <p className="text-on-primary-container mb-6 leading-relaxed">
                  {"Unités de naissage et d'engraissement avec gestion automatisée des effluents et sols"
                    + " en caillebotis haute résistance."}
                </p>
                <span className="border-b-2 border-secondary-container text-secondary-container font-label font-bold text-xs uppercase tracking-widest py-2 inline-block">
                  Consulter les plans
                </span>
              </div>
            </div>

            {/* Bovins */}
            <div className="md:col-span-5 bg-surface-container-highest p-10 flex flex-col rounded-2xl">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">
                precision_manufacturing
              </span>
              <h3 className="text-2xl font-headline font-bold text-primary mb-3">Bovins &amp; Laiterie</h3>
              <p className="text-on-surface-variant font-body mb-6">
                Stabulation libre, salles de traite robotisées et hangars de stockage fourrager à
                structure métallique traitée anti-corrosion.
              </p>
              <div className="mt-auto w-full aspect-video overflow-hidden rounded-2xl">
                <img
                  src="/bovins.webp"
                  alt="Bovins & laiterie — Foga-Tech"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Pisciculture */}
            <div className="md:col-span-7 bg-surface-container-lowest p-10 border-l-8 border-secondary-container shadow-sm flex flex-col rounded-2xl">
              <h3 className="text-2xl font-headline font-bold text-primary mb-4">Étangs Piscicoles</h3>
              <p className="text-on-surface-variant font-body mb-6 leading-relaxed">
                {"Systèmes de recirculation (RAS) hors-sol et étangs en terre avec étanchéité par"
                  + " géomembrane HDPE. Contrôle de l'oxygénation en temps réel."}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-surface-container-low rounded-2xl">
                  <span className="block text-primary font-bold text-sm">Sur Terre</span>
                  <span className="text-xs text-on-surface-variant">Bassins excavés &amp; maçonnés</span>
                </div>
                <div className="p-4 bg-surface-container-low rounded-2xl">
                  <span className="block text-primary font-bold text-sm">Hors-Sol</span>
                  <span className="text-xs text-on-surface-variant">Cuves circulaires &amp; rectangulaires</span>
                </div>
              </div>
              <div className="mt-auto w-full aspect-video overflow-hidden rounded-2xl">
                <img
                  src="/pisciculture.webp"
                  alt="Étangs piscicoles — Foga-Tech"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Standards */}
      <section className="py-24 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
              <h2 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight mb-8">
                CONSTRUIT POUR DURER.<br />
                PENSÉ POUR <span className="text-secondary-container">PRODUIRE.</span>
              </h2>
              <div className="space-y-10">
                {standards.map((s) => (
                  <div key={s.title} className="flex gap-6">
                    <div className="w-12 h-12 shrink-0 bg-secondary-container/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary-container">{s.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 font-headline">{s.title}</h4>
                      <p className="text-on-primary-container leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="w-full aspect-[3/4] overflow-hidden rounded-2xl">
                <img
                  src="/ingenieur-site.webp"
                  alt="Ingénieur sur site élevage — Foga-Tech"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-secondary-container p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-10 rounded-2xl">
            <div className="text-on-secondary-container">
              <h2 className="text-3xl md:text-5xl font-headline font-extrabold mb-4 leading-tight">
                Prêt à moderniser votre exploitation ?
              </h2>
              <p className="text-lg opacity-80 font-medium">
                {"Nos experts en ingénierie rurale vous accompagnent de l'étude de faisabilité à la mise en service."}
              </p>
            </div>
            <div className="shrink-0">
              <Link
                to="/devis"
                className="bg-primary text-white px-10 py-5 font-headline font-bold text-lg hover:bg-primary-container transition-colors flex items-center gap-4 rounded-full"
              >
                Démarrer mon Projet
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
