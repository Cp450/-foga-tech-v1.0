import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import TextReveal from '../components/TextReveal'
import { fadeUp, fadeLeft, stagger } from '../lib/motion'

const IMG_AVICULTURE      = '/aviculture.webp'
const IMG_PORCHERIE       = '/porcherie.webp'
const IMG_BOVINS          = '/bovins.webp'
const IMG_PISCICULTURE    = '/pisciculture.webp'
const IMG_SOLUTIONS_DURABLES = '/solutions-durables-hero.webp'
const IMG_SILOS_STOCKAGE  = '/stockage-transformation.webp'
const IMG_TERRAIN_PREP    = '/genie-rural-hero.webp'

const HERO_STATS = [
  { val: '12+', label: 'km routes livrées' },
  { val: '50+', label: 'exploitations équipées' },
  { val: '100%', label: 'équipe congolaise' },
  { val: '24h', label: 'réponse devis' },
]

const EXPERTISES = [
  {
    num: '01',
    icon: 'landscape',
    title: 'Préparation des terrains',
    desc: 'Dessouchage, voies d\'accès, électrification rurale, adduction d\'eau. Nous domptons l\'espace pour vos cultures.',
    to: '/genie-rural/infrastructures-rurales',
  },
  {
    num: '02',
    icon: 'warehouse',
    title: 'Stockage & Transformation',
    desc: 'Hangars grande capacité, unités de transformation industrielles, chambres froides positives et négatives.',
    to: '/genie-rural#stockage',
  },
  {
    num: '03',
    icon: 'pets',
    title: 'Élevage & Pisciculture',
    desc: 'Bâtiments avicoles, porcins, bovins et étangs piscicoles. Structures spécialisées pour optimiser le rendement.',
    to: '/genie-rural/levage-pisciculture',
  },
  {
    num: '04',
    icon: 'energy_savings_leaf',
    title: 'Solutions Durables',
    desc: 'Irrigation intelligente, biogaz, biofertilisants. L\'innovation écologique au service de la rentabilité.',
    to: '/genie-rural/solutions-durables',
  },
]

const TERRAIN_ITEMS = [
  { icon: 'landscape',    title: 'Dessouchage lourd',   desc: 'Nettoyage complet des parcelles avec engins haute puissance pour mise à nu optimale du sol arable.' },
  { icon: 'alt_route',   title: "Voies d'accès",       desc: 'Pistes rurales robustes capables de supporter le passage de convois lourds toute l\'année.' },
  { icon: 'electric_bolt',title: 'Électrification',    desc: 'Réseaux électriques moyenne tension et solutions hors-réseau pour vos unités de production.' },
  { icon: 'water_drop',  title: "Adduction d'eau",     desc: 'Forages, châteaux d\'eau et réseaux de distribution pour sécuriser l\'approvisionnement.' },
]

const STOCKAGE_ITEMS = [
  { icon: 'warehouse',  title: 'Hangars grande capacité', desc: 'Conceptions métalliques ou mixtes avec contrôle hygrométrique pour préserver les récoltes.' },
  { icon: 'factory',    title: 'Unités de transformation', desc: 'Installation de lignes de production industrielles pour valoriser vos produits sur site.' },
  { icon: 'ac_unit',    title: 'Solutions de conservation', desc: 'Chambres froides positives et négatives alimentées par sources d\'énergie hybrides.' },
]

const ELEVAGE_ITEMS = [
  { img: IMG_AVICULTURE,    cat: 'Aviculture',   title: 'Poulet de chair & Pondeuses', desc: 'Bâtiments à ventilation régulée et systèmes automatisés.' },
  { img: IMG_PORCHERIE,     cat: 'Porcherie',    title: 'Unités Porcines',             desc: 'Conception hygiénique avec gestion optimisée des effluents.' },
  { img: IMG_BOVINS,        cat: 'Bovins',       title: 'Étables & Stabulations',      desc: 'Infrastructures pour élevage laitier et engraissement.' },
  { img: IMG_PISCICULTURE,  cat: 'Aquaculture',  title: 'Étangs Piscicoles',           desc: "Étangs béton ou terre battue avec systèmes d'oxygénation." },
]

export default function GenieRural() {
  return (
    <main className="bg-surface text-on-surface font-body">
      <SEO
        title="Génie Rural Congo — Irrigation, élevage, infrastructures agricoles | Foga-Tech BTP"
        description="Foga-Tech BTP réalise irrigation, élevage, pisciculture et infrastructures agricoles dans tout le Congo-Brazzaville. Expertise génie rural depuis 2012."
        canonical="https://foga-tech.tech/genie-rural"
      />

      {/* ── HERO — Home DNA full-bleed + Ken Burns ───────────────── */}
      <section
        id="hero"
        className="relative min-h-screen flex flex-col overflow-hidden bg-[#002045]"
      >
        {/* Layer 1 — Ken Burns image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/genie-rural-hero.webp"
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className="gr-bg-img absolute inset-0 w-full h-full object-cover contrast-110 saturate-110"
          />
          {/* Voile navy gradient — lisibilité texte */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,32,69,0.88) 0%, rgba(0,32,69,0.35) 50%, rgba(0,13,26,0.45) 100%)",
            }}
          />
        </div>

        {/* Layer 2 — radial glow */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(254,147,44,0.10), transparent 60%),
              radial-gradient(circle at 80% 20%, rgba(37,99,235,0.08), transparent 60%)
            `,
          }}
        />

        {/* Layer 3 — content */}
        <div className="relative z-10 flex-1 flex flex-col justify-between max-w-7xl mx-auto w-full px-6 lg:px-12 pt-32 pb-12">
          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 mb-8">
            <Link to="/" className="text-white/55 text-[11px] font-headline font-black uppercase tracking-[0.2em] hover:text-white transition-colors">
              Accueil
            </Link>
            <span className="text-white/55 text-[11px]" aria-hidden="true">/</span>
            <span className="text-secondary-container text-[11px] font-headline font-black uppercase tracking-[0.2em]">
              Génie Rural
            </span>
          </nav>

          {/* Headline block */}
          <motion.div
            className="max-w-[640px]"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeLeft} className="flex items-center gap-3 mb-6">
              <span className="w-4 h-px bg-secondary-container" />
              <span className="font-headline font-black text-[10px] uppercase tracking-[0.25em] text-secondary-container">
                Infrastructure &amp; Agriculture
              </span>
            </motion.div>

            <div style={{ fontSize: "clamp(52px,7.5vw,100px)" }}>
              <TextReveal
                text="Bâtir le futur rural."
                as="h1"
                className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em] mb-6"
                animate
                delay={0.1}
              />
            </div>

            <motion.p
              variants={fadeUp}
              className="font-body text-white/70 text-lg leading-relaxed mb-10 max-w-xl"
            >
              Ingénierie de précision pour la transformation des espaces agricoles.
              Nous construisons les fondations de la souveraineté alimentaire congolaise.
            </motion.p>

            <motion.div variants={stagger} className="flex flex-col sm:flex-row gap-4">
              <motion.div variants={fadeUp}>
                <Link
                  to="/devis"
                  className="flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-container font-headline font-black text-[13px] uppercase tracking-[0.18em] px-8 py-4 rounded-full hover:shadow-tectonic-orange hover:-translate-y-px transition-all"
                >
                  Demander un devis
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                </Link>
              </motion.div>
              <motion.div variants={fadeUp}>
                <a
                  href="#expertises"
                  className="flex items-center justify-center gap-2 border border-white/25 text-white hover:bg-white/10 px-8 py-4 font-headline font-bold uppercase text-[13px] tracking-[0.18em] rounded-full transition-all"
                >
                  Nos expertises
                  <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_downward</span>
                </a>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 pt-8 mt-12">
            {HERO_STATS.map((s) => (
              <div key={s.label}>
                <p className="font-headline font-black text-white leading-none" style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)' }}>
                  {s.val}
                </p>
                <p className="text-white/40 font-body text-[11px] mt-2 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOS EXPERTISES ────────────────────────────────────────── */}
      <section id="expertises" className="py-20 md:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-px bg-secondary-container flex-shrink-0" />
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Nos expertises</p>
              </div>
              <h2 className="font-headline text-3xl md:text-5xl font-black text-primary leading-none">
                Quatre domaines,<br />
                <span className="text-secondary-container">une maîtrise.</span>
              </h2>
            </div>
            <p className="text-on-surface-variant max-w-xs text-sm leading-relaxed md:text-right">
              De la préparation du sol aux solutions énergétiques — Foga-Tech couvre
              l&apos;intégralité du génie rural congolais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-outline-variant rounded-2xl overflow-hidden">
            {EXPERTISES.map((e, i) => (
              <Link
                key={e.num}
                to={e.to}
                onClick={(ev) => {
                  const hashIdx = e.to.indexOf('#')
                  if (hashIdx === -1) return
                  const id = e.to.slice(hashIdx + 1)
                  const el = document.getElementById(id)
                  if (el) {
                    ev.preventDefault()
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    history.replaceState(null, '', '#' + id)
                  }
                }}
                className={[
                  'group p-8 md:p-10 flex gap-6 hover:bg-surface-container-low transition-colors duration-200',
                  i === 0 ? 'border-b border-r border-outline-variant' : '',
                  i === 1 ? 'border-b border-outline-variant' : '',
                  i === 2 ? 'border-r border-outline-variant' : '',
                ].join(' ')}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 border border-outline-variant group-hover:border-secondary-container flex items-center justify-center transition-colors">
                    <span
                      className="material-symbols-outlined text-xl text-secondary-container"
                      aria-hidden="true"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                      {e.icon}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-headline font-black text-on-surface/20 text-3xl leading-none">{e.num}</span>
                    <span
                      className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-secondary-container group-hover:translate-x-1 transition-all text-base"
                      aria-hidden="true"
                    >
                      arrow_forward
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-lg text-primary group-hover:text-secondary-container transition-colors mb-2">
                    {e.title}
                  </h3>
                  <p className="text-on-surface-variant font-body text-sm leading-relaxed">{e.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRÉPARATION DES TERRAINS ──────────────────────────────── */}
      <section className="py-20 md:py-28 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 mb-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-px bg-secondary-container flex-shrink-0" />
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Section 01</p>
              </div>
              <h2 className="font-headline text-3xl md:text-4xl font-black text-primary leading-tight mb-6">
                Préparation<br />
                <span className="text-secondary-container">des terrains</span>
              </h2>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
                Une exploitation réussie commence par une structure de sol et une accessibilité
                irréprochables. Nous domptons l&apos;espace pour vos cultures.
              </p>
              <Link
                to="/genie-rural/infrastructures-rurales"
                className="inline-flex items-center gap-2 bg-primary text-white font-headline font-bold uppercase tracking-widest text-xs px-6 py-3 hover:bg-secondary-container hover:text-on-secondary-container transition-all rounded-full"
              >
                En savoir plus
                <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-outline-variant rounded-2xl overflow-hidden">
              {TERRAIN_ITEMS.map((s, i) => (
                <div
                  key={s.title}
                  className={[
                    'group p-8 bg-surface-container-lowest hover:bg-surface transition-colors duration-200',
                    i === 0 ? 'border-b border-r border-outline-variant' : '',
                    i === 1 ? 'border-b border-outline-variant' : '',
                    i === 2 ? 'border-r border-outline-variant' : '',
                  ].join(' ')}
                >
                  <span
                    className="material-symbols-outlined text-4xl text-secondary-container mb-5 block group-hover:scale-110 transition-transform duration-200"
                    aria-hidden="true"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    {s.icon}
                  </span>
                  <h3 className="font-headline text-lg font-bold text-primary mb-3 group-hover:text-secondary-container transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-on-surface-variant font-body text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Full-width image */}
          <div className="h-64 md:h-80 overflow-hidden relative rounded-2xl">
            <img
              src="/gc-hero-3.webp"
              alt="Voiries Owando — Foga-Tech Congo"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent" />
            <div className="absolute bottom-6 left-8">
              <span className="font-headline font-black text-white text-lg">Voiries Owando — fourniture d&apos;agrégats &amp; pose de pavés</span>
              <p className="text-on-primary/60 text-xs font-body mt-0.5">Owando, Cuvette · Partenaire SGE-C Congo · 2023</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STOCKAGE & TRANSFORMATION ─────────────────────────────── */}
      <section id="stockage" className="py-20 md:py-28 bg-primary text-white overflow-hidden scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Image col */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary-container z-0" aria-hidden="true" />
              <img
                src="/stockage-transformation.webp"
                alt="Stockage & transformation — Foga-Tech"
                className="relative z-10 w-full aspect-[4/3] object-cover shadow-tectonic-lg rounded-2xl"
                loading="lazy"
              />
              {/* Stats overlay */}
              <div className="absolute bottom-6 right-6 z-20 bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl">
                <p className="font-headline font-black text-white text-2xl">30+</p>
                <p className="text-on-primary/60 text-xs font-body">unités construites</p>
              </div>
            </div>

            {/* Text col */}
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-px bg-secondary-container/60 flex-shrink-0" />
                <p className="font-label text-xs uppercase tracking-widest text-secondary-container/80">Section 02</p>
              </div>
              <h2 className="font-headline text-3xl md:text-4xl font-black leading-tight mb-10">
                Stockage &amp;<br />
                <span className="text-secondary-container">Transformation</span>
              </h2>

              <div className="space-y-8">
                {STOCKAGE_ITEMS.map((f) => (
                  <div key={f.title} className="flex gap-5 items-start group">
                    <div className="w-12 h-12 border border-white/20 flex items-center justify-center flex-shrink-0 group-hover:border-secondary-container transition-colors">
                      <span
                        className="material-symbols-outlined text-xl text-secondary-container"
                        aria-hidden="true"
                        style={{ fontVariationSettings: "'FILL' 0" }}
                      >
                        {f.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-headline text-lg font-bold text-white mb-1.5">{f.title}</h4>
                      <p className="text-on-primary/60 font-body text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ÉLEVAGE & PISCICULTURE ────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-px bg-secondary-container flex-shrink-0" />
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Section 03</p>
              </div>
              <h2 className="font-headline text-3xl md:text-4xl font-black text-primary leading-tight">
                Élevage &amp;<br />
                <span className="text-secondary-container">Pisciculture</span>
              </h2>
            </div>
            <Link
              to="/genie-rural/levage-pisciculture"
              className="inline-flex items-center gap-2 font-headline font-bold text-xs uppercase tracking-widest text-primary hover:text-secondary-container transition-colors whitespace-nowrap"
            >
              Explorer nos solutions
              <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-outline-variant rounded-2xl overflow-hidden">
            {ELEVAGE_ITEMS.map((c, i) => (
              <div
                key={c.title}
                className={[
                  'group overflow-hidden',
                  i < 3 ? 'border-r border-outline-variant' : '',
                ].join(' ')}
              >
                <div className="h-52 overflow-hidden relative">
                  <img
                    src={c.img}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-secondary-container text-on-secondary-container font-headline font-black text-[10px] uppercase tracking-widest px-2.5 py-1">
                      {c.cat}
                    </span>
                  </div>
                </div>
                <div className="p-6 bg-surface-container-lowest rounded-2xl">
                  <h4 className="font-headline font-bold text-primary text-base mb-2 group-hover:text-secondary-container transition-colors">
                    {c.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant font-body leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTIONS DURABLES (bento) ────────────────────────────── */}
      <section className="py-20 md:py-28 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-14">
            <span className="w-6 h-px bg-secondary-container flex-shrink-0" />
            <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Section 04</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-outline-variant">

            {/* Featured — spans 2 rows */}
            <div className="lg:row-span-2 relative overflow-hidden bg-primary group min-h-[320px] lg:border-r border-outline-variant">
              <img
                src={IMG_SOLUTIONS_DURABLES}
                alt="Irrigation intelligente — solutions durables Foga-Tech"
                className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="relative z-10 flex flex-col justify-between h-full p-10">
                <div>
                  <h2 className="font-headline text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                    Solutions<br />
                    <span className="text-secondary-container">Durables</span>
                  </h2>
                  <p className="text-on-primary/60 font-body text-sm leading-relaxed max-w-xs">
                    L&apos;innovation écologique au service de la rentabilité agricole congolaise.
                  </p>
                </div>
                <Link
                  to="/genie-rural/solutions-durables"
                  className="inline-flex items-center gap-2 text-secondary-container font-headline font-bold uppercase tracking-widest text-xs hover:gap-3 transition-all"
                >
                  Voir nos solutions
                  <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Card: Irrigation */}
            <div className="border-b border-outline-variant lg:border-l-0 lg:border-r border-outline-variant bg-surface-container-lowest p-8 group hover:bg-surface transition-colors duration-200 rounded-2xl">
              <span className="material-symbols-outlined text-3xl text-primary mb-4 block" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 0" }}>water_drop</span>
              <h4 className="font-headline font-bold text-lg text-primary mb-2 group-hover:text-secondary-container transition-colors">Irrigation Intelligente</h4>
              <p className="text-sm text-on-surface-variant font-body leading-relaxed">Systèmes goutte-à-goutte et pivot central avec capteurs d&apos;humidité en temps réel.</p>
            </div>

            {/* Card: Recyclage */}
            <div className="border-b lg:border-l-0 border-outline-variant bg-surface-container-lowest p-8 group hover:bg-surface transition-colors duration-200 rounded-2xl">
              <span className="material-symbols-outlined text-3xl text-primary mb-4 block" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 0" }}>recycling</span>
              <h4 className="font-headline font-bold text-lg text-primary mb-2 group-hover:text-secondary-container transition-colors">Recyclage Déchets</h4>
              <p className="text-sm text-on-surface-variant font-body leading-relaxed">Valorisation des résidus organiques pour une économie circulaire sur l&apos;exploitation.</p>
            </div>

            {/* Card: Biogaz — full-width orange */}
            <div className="lg:col-span-2 bg-secondary-container p-8 group rounded-2xl">
              <span className="material-symbols-outlined text-3xl text-primary mb-4 block" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>energy_savings_leaf</span>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h4 className="font-headline font-bold text-xl text-primary mb-2">Biogaz &amp; Biofertilisants</h4>
                  <p className="text-primary/70 font-body text-sm leading-relaxed max-w-md">
                    Installation de digesteurs anaérobies pour produire votre propre énergie
                    et engrais naturels directement sur site.
                  </p>
                </div>
                <span className="font-headline font-black text-primary/20 text-6xl leading-none select-none flex-shrink-0" aria-hidden="true">04</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-surface relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-px bg-secondary-container flex-shrink-0" />
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Passer à l'action</p>
              </div>
              <h2 className="font-headline text-3xl md:text-4xl font-black text-primary leading-tight mb-4">
                Transformez votre exploitation, <span className="text-secondary-container">dès aujourd'hui.</span>
              </h2>
              <p className="text-on-surface-variant font-body text-base max-w-2xl mb-6">
                Visite technique offerte sur toute l'étendue du Congo · équipe génie rural dédiée.
              </p>
              <div className="flex flex-wrap gap-5 text-xs text-on-surface-variant">
                {[
                  { icon: 'bolt', label: 'Réponse sous 24h' },
                  { icon: 'location_on', label: 'Visite technique offerte' },
                  { icon: 'groups', label: "Expertise locale professionnelle" },
                ].map((g) => (
                  <div key={g.icon} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary-container text-base" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>{g.icon}</span>
                    <span className="font-body">{g.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:min-w-[260px]">
              <Link
                to="/devis"
                className="inline-flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-container px-8 py-4 font-headline font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all rounded-full w-full"
              >
                Demander un devis
                <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
