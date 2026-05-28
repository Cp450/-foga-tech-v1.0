import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeUp, stagger } from '../lib/motion'
import SEO from '../components/SEO'
import TextReveal from '../components/TextReveal'
import WaveBackground from '../components/WaveBackground'
import ScrollTiltedGrid from '../components/ScrollTiltedGrid'

const CHANTIERS_GRID = [
  { year: '2012', client: 'FOBERD CONGO',     title: 'Hangars métalliques PNR + BZV',   src: '/portfolio-hangar-pn.webp' },
  { year: '2013', client: 'UNICON',           title: 'Étanchéité UDSN Kintélé',          src: '/portfolio-udn.webp' },
  { year: '2014', client: 'COLAS',            title: 'VRD axe Petit-Chose-Manianga',     src: '/portfolio-petit-chose.webp' },
  { year: '2016', client: 'EN CO',            title: 'Luminaires Corniche Brazzaville',  src: '/portfolio-luminaire.webp' },
  { year: '2017', client: 'FAAKI CONGO',      title: 'Centre Emplisseur Gaz Mpila',      src: '/chantier-faki.webp' },
  { year: '2020', client: 'RAZEL-BEC FAYAT',  title: 'CHU-B Brazzaville',                src: '/portfolio-chu.webp' },
  { year: '2020', client: 'RAZEL-BEC FAYAT',  title: "Projet Pep's Mayanga",             src: '/portfolio-mayanga.webp' },
  { year: '2022', client: 'SINOHYDRO',        title: 'Transport agrégats Boundji-Ewo',   src: '/portfolio-boundji-ewo.webp' },
  { year: '2022', client: 'SGE-C CONGO',      title: 'Pose pavés Owando',                src: '/portfolio-owando.webp' },
  { year: '2023', client: 'VALIANT POWER',    title: 'Pylônes HT Mossaka-Oyo',           src: '/portfolio-mossaka-oyo.webp' },
  { year: '2024', client: 'SONOCC',           title: 'Calcaire carrière Loutété',        src: '/portfolio-loutete.webp' },
  { year: '2024', client: "OPARH'S CONGO",    title: 'Hub agricole Eni Loudima',         src: '/portfolio-hub-agricole.webp' },
  { year: '2024', client: "PARK'N SHOP",      title: 'Étanchéité toiture terrasse',      src: '/portfolio-etancheite-parknshop.webp' },
]

/* ── Data ─────────────────────────────────────────────────────── */
const STATS = [
  { val: '12+', label: 'années d\'opérations' },
  { val: '+15',  label: 'chantiers livrés' },
  { val: '65',  label: 'engins en parc' },
  { val: '100%', label: 'équipe congolaise' },
]

const VALEURS = [
  {
    icon: 'engineering',
    title: 'Expertise terrain',
    desc: '12 ans d\'opérations en milieu congolais. Conditions exigeantes, délais tenus.',
    size: 'large',
  },
  {
    icon: 'handshake',
    title: 'Partenariats durables',
    desc: 'RAZEL, SINOHYDRO, COLAS, FAAKI, VALIANT POWER.',
    size: 'small',
  },
  {
    icon: 'verified',
    title: 'Qualité certifiée',
    desc: 'Agrément Ministère BTP Congo, garanties décennales, contrôle technique systématique.',
    size: 'small',
  },
  {
    icon: 'public',
    title: 'Expertise locale professionnelle',
    desc: 'Équipe constituée de professionnels locaux qualifiés, ancrage territorial fort, contribution à la souveraineté économique nationale.',
    size: 'large',
  },
]

const POLES = [
  { num: '01', title: 'Génie civil & gros œuvre',     to: '/genie-civil' },
  { num: '02', title: 'Génie rural & hydraulique',    to: '/genie-rural' },
  { num: '03', title: 'Infrastructures rurales',      to: '/genie-rural/infrastructures-rurales' },
  { num: '04', title: 'Élevage & pisciculture',       to: '/genie-rural/levage-pisciculture' },
  { num: '05', title: 'Solutions durables',            to: '/genie-rural/solutions-durables' },
  { num: '06', title: 'Location d\'engins BTP',       to: '/location' },
]

/* ── Component ────────────────────────────────────────────────── */
export default function APropos() {
  return (
    <main className="bg-surface text-on-surface font-body">
      <SEO
        title="À propos — Foga-Tech International BTP Congo"
        description="Foga-Tech International : 12 ans d'expertise BTP au Congo-Brazzaville. Génie civil, génie rural, location d'engins. Équipe constituée d'expertise locale professionnelle, agréée Ministère BTP Congo."
        canonical="https://foga-tech.tech/a-propos"
      />

      {/* ── HERO Ken Burns ────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#002045] pt-16">
        {/* Layer 1 — Ken Burns 3 images */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {[
            { src: '/bureau-etude.webp',     cls: 'hb-1', eager: true },
            { src: '/chantier-faki.webp',    cls: 'hb-2', eager: false },
            { src: '/portfolio-udn.webp',    cls: 'hb-3', eager: false },
          ].map(({ src, cls, eager }) => (
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden="true"
              loading={eager ? 'eager' : 'lazy'}
              fetchPriority={eager ? 'high' : 'auto'}
              className={`hero-bg-img ${cls} absolute inset-0 w-full h-full object-cover opacity-0 contrast-110 saturate-110`}
            />
          ))}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(0,32,69,0.92) 0%, rgba(0,32,69,0.45) 50%, rgba(0,13,26,0.50) 100%)',
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
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 lg:px-12 py-24">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/40 font-body text-xs mb-10">
            <Link to="/" className="hover:text-secondary-container transition-colors">Accueil</Link>
            <span aria-hidden="true">›</span>
            <span className="text-secondary-container">À propos</span>
          </div>

          <motion.div
            className="max-w-[720px]"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <span className="w-4 h-px bg-secondary-container" />
              <span className="font-headline font-black text-[10px] uppercase tracking-[0.25em] text-secondary-container">
                Foga-Tech International · Congo-Brazzaville
              </span>
            </motion.div>

            <div style={{ fontSize: 'clamp(48px, 7vw, 92px)' }}>
              <TextReveal
                text="Bâtir le Congo"
                as="h1"
                className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em]"
                animate
                delay={0.1}
              />
              <TextReveal
                text="de demain."
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
              Foga-Tech International — entreprise congolaise de BTP fondée en 2012. Expertise
              terrain, partenariats durables, équipe d'expertise locale professionnelle.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/portfolio"
                className="flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-container font-headline font-black text-[13px] uppercase tracking-[0.18em] px-8 py-4 rounded-full hover:shadow-tectonic-orange hover:-translate-y-px transition-all"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>folder_open</span>
                Voir nos références
              </Link>
              <Link
                to="/devis"
                className="flex items-center justify-center gap-2 border border-white/25 text-white hover:bg-white/10 px-8 py-4 font-headline font-bold uppercase text-[13px] tracking-[0.18em] rounded-full transition-all"
              >
                Demander un devis
                <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAND ───────────────────────────────────────────── */}
      <section className="relative z-20 -mt-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 bg-primary rounded-2xl shadow-tectonic-lg overflow-hidden">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`px-8 py-8 ${i < 3 ? 'border-b md:border-b-0 md:border-r border-white/10' : ''}`}
              >
                <p
                  className="font-headline font-black text-secondary-container leading-none"
                  style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
                >
                  {s.val}
                </p>
                <p className="font-body text-on-primary/50 text-[11px] uppercase tracking-widest mt-2">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOTRE HISTOIRE — texte intro ─────────────────────────── */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-6">
            <span className="w-6 h-px bg-secondary-container/60" />
            <span className="font-label font-bold text-[11px] uppercase tracking-[0.25em] text-secondary-container">
              Notre histoire
            </span>
          </div>
          <h2
            className="font-headline font-black text-primary leading-[0.95] tracking-[-0.02em] mb-8"
            style={{ fontSize: 'clamp(28px, 4.5vw, 52px)' }}
          >
            Foga-Tech International.
          </h2>
          <div className="space-y-5 text-on-surface-variant text-base md:text-lg leading-relaxed max-w-3xl">
            <p>
              <strong className="text-primary">Foga-Tech International</strong> est un acteur
              congolais du BTP qui accompagne les grands donneurs d&apos;ordre publics et privés
              sur l&apos;ensemble du territoire national.
            </p>
            <p>
              Nous intervenons sur les chantiers les plus exigeants du pays : génie civil lourd
              avec RAZEL sur le CHU-B et le Projet Pep&apos;s Mayanga, bâtiment industriel
              sensible avec FAAKI, levage de pylônes haute tension avec VALIANT POWER, hangars
              métalliques FOBERD CONGO, étanchéité de l&apos;Université Denis Sassou N&apos;Guesso
              et VRD COLAS sur l&apos;axe Petit-Chose-Manianga.
            </p>
            <p>
              Aujourd&apos;hui, nous opérons à Brazzaville, Pointe-Noire et dans les
              départements du Pool, de la Cuvette et du Niari — avec un parc de{' '}
              <strong className="text-primary">65 engins</strong> et une équipe{' '}
              <strong className="text-primary">constituée d'expertise locale professionnelle</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ── CHRONOLOGIE — Scroll Tilted Grid ─────────────────────── */}
      <section className="relative bg-[#001634] overflow-hidden">
        {/* Wave animation (DNA partenaires) */}
        <WaveBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-6 h-px bg-secondary-container/60" />
            <span className="font-label font-bold text-[11px] uppercase tracking-[0.25em] text-secondary-container">
              Notre parcours
            </span>
          </div>
          <h2
            className="font-headline font-black text-white leading-[0.95] tracking-[-0.02em] mb-4"
            style={{ fontSize: 'clamp(26px, 4vw, 44px)' }}
          >
            12 ans de chantiers.
          </h2>
          <p className="text-white/45 font-body text-sm max-w-xl">
            Faites défiler pour parcourir nos références.
          </p>
        </div>
        <div className="relative z-10 px-6">
          <ScrollTiltedGrid items={CHANTIERS_GRID} />
        </div>
      </section>

      {/* ── VALEURS — bento dark ─────────────────────────────────── */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="w-6 h-px bg-secondary-container/60" />
              <span className="font-label font-bold text-[11px] uppercase tracking-[0.25em] text-secondary-container">
                Nos valeurs
              </span>
              <span className="w-6 h-px bg-secondary-container/60" />
            </div>
            <h2
              className="font-headline font-black text-primary leading-[0.95] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(28px, 4.5vw, 48px)' }}
            >
              Ce qui nous tient debout.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Grande gauche */}
            <div className="md:col-span-6 bg-primary rounded-2xl p-10 flex flex-col justify-between min-h-[260px]">
              <div className="w-14 h-14 rounded-xl bg-secondary-container/20 flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-secondary-container text-3xl" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
                  engineering
                </span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-white text-2xl mb-3">Expertise terrain</h3>
                <p className="text-on-primary/60 text-sm leading-relaxed">
                  12 ans d&apos;opérations en milieu congolais. Conditions exigeantes, livraisons tenues.
                  Chaque chantier renforce notre savoir-faire de terrain.
                </p>
              </div>
            </div>

            {/* Petites droite */}
            <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-white border border-outline-variant rounded-2xl p-7 flex flex-col justify-between hover:border-secondary-container/40 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-secondary-container/15 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-secondary-container text-xl" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-primary text-base mb-2">Partenariats durables</h3>
                  <p className="text-on-surface-variant text-xs leading-relaxed">RAZEL, SINOHYDRO, COLAS, FAAKI, VALIANT POWER.</p>
                </div>
              </div>
              <div className="bg-white border border-outline-variant rounded-2xl p-7 flex flex-col justify-between hover:border-secondary-container/40 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-secondary-container/15 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-secondary-container text-xl" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-primary text-base mb-2">Qualité certifiée</h3>
                  <p className="text-on-surface-variant text-xs leading-relaxed">Agrément Ministère BTP Congo, garanties décennales, contrôle technique systématique.</p>
                </div>
              </div>
            </div>

            {/* Grande bas */}
            <div className="md:col-span-12 bg-secondary-container rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-xl bg-on-secondary-container/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-secondary-container text-3xl" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-on-secondary-container text-xl mb-1">Expertise locale professionnelle</h3>
                  <p className="text-on-secondary-container/75 text-sm max-w-lg leading-relaxed">
                    Équipe constituée de professionnels locaux qualifiés, ancrage territorial fort, contribution directe à la souveraineté économique nationale.
                  </p>
                </div>
              </div>
              <div className="text-5xl font-headline font-black text-on-secondary-container/15 hidden md:block select-none">
                🇨🇬
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ÉQUIPE — pôles d'expertise ─────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-16">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-6 h-px bg-secondary-container/60" />
                <span className="font-label font-bold text-[11px] uppercase tracking-[0.25em] text-secondary-container">
                  L&apos;équipe
                </span>
              </div>
              <h2
                className="font-headline font-black text-primary leading-[0.95] tracking-[-0.02em]"
                style={{ fontSize: 'clamp(26px, 4vw, 44px)' }}
              >
                Une équipe terrain,<br />structurée par métier.
              </h2>
            </div>
            <p className="text-on-surface-variant text-sm font-body max-w-xs leading-relaxed">
              Ingénieurs, chefs de chantier et opérateurs formés sur les projets
              les plus exigeants du Congo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: 'corporate_fare', role: 'Direction', desc: 'Vision stratégique, développement commercial et relations partenaires.' },
              { icon: 'engineering',    role: 'Technique',  desc: 'Supervision des chantiers, normes qualité et contrôle d\'exécution.' },
              { icon: 'construction',   role: 'Opérations', desc: 'Parc de 65 engins, maintenance préventive et logistique terrain.' },
              { icon: 'agriculture',    role: 'Génie Rural',desc: 'Études d\'aménagement, hydraulique agricole et infrastructures rurales.' },
            ].map((p) => (
              <div
                key={p.role}
                className="group bg-surface-container-lowest border border-outline-variant rounded-2xl p-7 hover:border-secondary-container/40 hover:bg-white transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-6 group-hover:bg-secondary-container transition-colors">
                  <span
                    className="material-symbols-outlined text-on-primary text-2xl group-hover:text-on-secondary-container transition-colors"
                    aria-hidden="true"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {p.icon}
                  </span>
                </div>
                <span className="font-label font-bold text-[9px] uppercase tracking-widest text-secondary-container block mb-2">
                  Pôle
                </span>
                <h3 className="font-headline font-bold text-primary text-base mb-3 leading-tight">
                  {p.role}
                </h3>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOS PÔLES ────────────────────────────────────────────── */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-16">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-6 h-px bg-secondary-container/60" />
                <span className="font-label font-bold text-[11px] uppercase tracking-[0.25em] text-secondary-container">
                  Nos pôles
                </span>
              </div>
              <h2
                className="font-headline font-black text-primary leading-[0.95] tracking-[-0.02em]"
                style={{ fontSize: 'clamp(26px, 4vw, 44px)' }}
              >
                Six expertises.<br />Un seul interlocuteur.
              </h2>
            </div>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 font-headline font-bold text-xs uppercase tracking-widest text-primary hover:text-secondary-container transition-colors whitespace-nowrap"
            >
              Voir nos références
              <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {POLES.map((p) => (
              <Link
                key={p.num}
                to={p.to}
                className="group bg-white border border-outline-variant rounded-2xl p-6 hover:border-secondary-container/40 hover:shadow-md transition-all flex items-start justify-between gap-4"
              >
                <div>
                  <span className="font-headline font-black text-on-surface/15 text-3xl block leading-none mb-4">
                    {p.num}
                  </span>
                  <h3 className="font-headline font-bold text-primary text-base leading-tight group-hover:text-secondary-container transition-colors">
                    {p.title}
                  </h3>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-secondary-container group-hover:translate-x-1 transition-all flex-shrink-0" aria-hidden="true">
                  arrow_forward
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
