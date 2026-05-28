import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeUp, stagger } from '../lib/motion'
import SEO from '../components/SEO'
import TextReveal from '../components/TextReveal'


const specs = [
  {
    title: 'Topographie',
    desc: "Levés GNSS et par drone pour une précision centimétrique de l'aménagement foncier.",
  },
  {
    title: 'Hydrologie',
    desc: "Études d'écoulement et drainage pour la pérennité des accès et des sols.",
  },
  {
    title: 'Logistique',
    desc: "Chaîne d'approvisionnement optimisée pour les sites enclavés.",
  },
  {
    title: 'Sécurité',
    desc: 'Protocoles stricts de sécurisation de périmètre et des infrastructures.',
  },
]

export default function InfrastructuresRurales() {
  return (
    <main className="bg-surface text-on-surface font-body">
      <SEO
        title="Infrastructures rurales Congo — Adduction d'eau, électrification, terrassement | Foga-Tech BTP"
        description="Construction d'infrastructures rurales au Congo : adduction d'eau, électrification, dessouchage, voies d'accès, ouvrages hydrauliques. Foga-Tech BTP, expertise terrain depuis 2012."
        canonical="https://foga-tech.tech/genie-rural/infrastructures-rurales"
      />

      {/* Hero — Home DNA Ken Burns + radial glow */}
      <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#002045]">
        {/* Layer 1 — Ken Burns image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/infrastructures-rurales-hero.webp"
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className="gr-bg-img absolute inset-0 w-full h-full object-cover contrast-110 saturate-110"
          />
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
            className="max-w-[720px]"
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
                Infrastructures Rurales
              </span>
            </motion.nav>
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <span className="w-4 h-px bg-secondary-container" />
              <span className="font-headline font-black text-[10px] uppercase tracking-[0.25em] text-secondary-container">
                Pôle Génie Rural
              </span>
            </motion.div>

            <div style={{ fontSize: "clamp(48px,7vw,92px)" }}>
              <TextReveal
                text="Préparation &"
                as="h1"
                className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em]"
                animate
                delay={0.1}
              />
              <TextReveal
                text="Infrastructures."
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
              Maîtrise technologique et puissance industrielle pour transformer
              les terrains bruts en pôles de production agricole performants.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Specs grid */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
            <div className="md:col-span-5">
              <h2 className="font-headline text-3xl font-bold text-primary mb-8 leading-tight">
                {"L'expertise technique au service de la souveraineté alimentaire."}
              </h2>
              <p className="text-on-surface-variant mb-6 leading-relaxed">
                {"Foga-Tech déploie des solutions d'ingénierie lourde pour l'aménagement rural. Nous"
                  + " intervenons sur les environnements les plus complexes pour garantir une base structurelle"
                  + " inébranlable à vos projets agro-industriels."}
              </p>
              <div className="flex items-center gap-4 border-l-4 border-secondary-container p-6 bg-surface-container-low rounded-2xl">
                <span className="material-symbols-outlined text-secondary-container text-4xl">engineering</span>
                <div>
                  <p className="text-sm font-bold text-primary uppercase tracking-wider">Normes BNC &amp; Eurocode</p>
                  <p className="text-xs text-on-surface-variant">
                    Qualité de construction certifiée et gestion des risques.
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {specs.map((s) => (
                <div
                  key={s.title}
                  className="bg-surface-container-lowest p-8 shadow-sm border-b-2 border-transparent hover:border-secondary-container transition-all rounded-2xl"
                >
                  <h3 className="font-headline text-primary font-bold text-xl mb-4">{s.title}</h3>
                  <p className="text-sm text-on-surface-variant">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services détaillés */}
      <section className="py-24 bg-surface-container-low overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Section 1 — Dessouchage & Accès */}
          <div className="flex flex-col md:flex-row gap-16 items-center mb-32">
            <div className="w-full md:w-1/2 relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary-container/10 -z-0" />
              <div className="w-full aspect-video relative z-10 shadow-2xl overflow-hidden rounded-2xl">
                <img
                  src="/dessouchage-voies.webp"
                  alt="Dessouchage & voies de désenclavement — Foga-Tech BTP"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <span className="text-secondary-container font-bold text-xs uppercase tracking-widest mb-4 block">
                Étape 01
              </span>
              <h2 className="font-headline text-4xl font-extrabold text-primary mb-6">
                Dessouchage &amp; Voies de Désenclavement
              </h2>
              <p className="text-on-surface-variant mb-8 leading-relaxed">
                {"Nous transformons les zones sauvages en plateaux exploitables. Nos brigades mécanisées"
                  + " assurent un dessouchage intégral respectant la structure du sol, suivi de la création de"
                  + " pistes rurales stabilisées en latérite ou matériaux compactés."}
              </p>
              <ul className="space-y-4">
                {[
                  "Ouverture de pistes 4x4 et accès poids lourds",
                  "Nettoyage complet et évacuation des résidus",
                  "Ouvrages de franchissement (ponceaux et dalots)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-secondary-container text-xl">check_circle</span>
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 2 — Électrification */}
          <div className="flex flex-col md:flex-row-reverse gap-16 items-center mb-32">
            <div className="w-full md:w-1/2">
              <div className="w-full aspect-[4/3] shadow-2xl overflow-hidden rounded-2xl">
                <img
                  src="/electrification-site.webp"
                  alt="Électrification de site rural — Foga-Tech"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <span className="text-secondary-container font-bold text-xs uppercase tracking-widest mb-4 block">
                Étape 02
              </span>
              <h2 className="font-headline text-4xl font-extrabold text-primary mb-6">
                Électrification de Site &amp; Énergies
              </h2>
              <p className="text-on-surface-variant mb-8 leading-relaxed">
                {"L'autonomie énergétique est la clé du succès. Foga-Tech installe des réseaux mixtes"
                  + " (Photovoltaïque / Groupe Électrogène / Réseau National) pour alimenter vos unités de"
                  + " pompage, de transformation et de vie."}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-primary p-6 rounded-2xl">
                  <h4 className="text-white font-bold text-3xl mb-1">500kVA</h4>
                  <p className="text-on-primary-container text-[10px] uppercase font-bold tracking-tighter">
                    Capacité Standalone
                  </p>
                </div>
                <div className="bg-secondary-container p-6 rounded-2xl">
                  <h4 className="text-on-secondary-container font-bold text-3xl mb-1">Hybrid</h4>
                  <p className="text-on-secondary-container text-[10px] uppercase font-bold tracking-tighter">
                    Solaire &amp; Diesel
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 — Hangars */}
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="w-full md:w-1/2">
              <div className="w-full aspect-video shadow-2xl overflow-hidden rounded-2xl">
                <img
                  src="/hangar-conservation.webp"
                  alt="Hangars de stockage & conservation — Foga-Tech"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <span className="text-secondary-container font-bold text-xs uppercase tracking-widest mb-4 block">
                Étape 03
              </span>
              <h2 className="font-headline text-4xl font-extrabold text-primary mb-6">
                Hangars de Stockage &amp; Conservation
              </h2>
              <p className="text-on-surface-variant mb-8 leading-relaxed">
                Infrastructures métalliques à grande portée pour le stockage des récoltes et le
                conditionnement. Nos hangars sont conçus pour une régulation thermique optimale et une
                protection maximale contre les nuisibles.
              </p>
              <div className="space-y-6">
                {[
                  { label: 'Structure Métallique', detail: 'Acier Galvanisé S355' },
                  { label: 'Toiture', detail: 'Bac Acier Isolé (Sandwich)' },
                  { label: 'Sols', detail: 'Béton Industriel Quartzé' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between p-4 bg-surface-container-highest rounded-2xl"
                  >
                    <span className="text-sm font-bold text-primary">{row.label}</span>
                    <span className="text-xs font-label text-on-surface-variant">{row.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 bg-surface relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-px bg-secondary-container flex-shrink-0" />
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Passer à l'action</p>
              </div>
              <h2 className="font-headline text-3xl md:text-4xl font-black text-primary leading-tight mb-4">
                {"Confiez votre aménagement à l'expert BTP."}
              </h2>
              <p className="text-on-surface-variant font-body text-base max-w-2xl">
                {"De l'étude de faisabilité à la remise des clés — chantier géré avec rigueur industrielle."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 md:min-w-[260px]">
              <Link
                to="/devis"
                className="inline-flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-container px-6 py-3.5 font-headline font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all rounded-full"
              >
                Devis Technique
                <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
              </Link>
              <Link
                to="/portfolio"
                className="inline-flex items-center justify-center gap-2 border border-primary text-primary px-6 py-3.5 font-headline font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all rounded-full"
              >
                Nos Réalisations
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
