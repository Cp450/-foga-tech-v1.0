import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeUp, stagger } from '../lib/motion'
import SEO from '../components/SEO'
import TextReveal from '../components/TextReveal'
const IMG_SOLUTIONS_DURABLES = '/solutions-durables-hero.webp'


export default function SolutionsDurables() {

  return (
    <>
      <SEO
        title="Solutions durables Congo — Énergie solaire, biogaz, irrigation intelligente | Foga-Tech BTP"
        description="Foga-Tech BTP conçoit des solutions durables pour le génie rural au Congo-Brazzaville : irrigation intelligente, biogaz, biofertilisants, énergie hybride. Innovation écologique BTP depuis 2012."
        canonical="https://foga-tech.com/genie-rural/solutions-durables"
      />
      <main className="bg-surface min-h-screen">
        {/* Hero — Home DNA full-bleed + Ken Burns */}
        <section
          id="hero"
          className="relative min-h-screen flex flex-col overflow-hidden bg-[#002045]"
        >
          {/* Layer 1 — Ken Burns 3 images */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {[
              { src: "/sd-hero-1.webp", cls: "hb-1", eager: true },
              { src: "/sd-hero-2.webp", cls: "hb-2", eager: false },
              { src: "/sd-hero-3.webp", cls: "hb-3", eager: false },
            ].map(({ src, cls, eager }) => (
              <img
                key={src}
                src={src}
                alt=""
                aria-hidden="true"
                loading={eager ? "eager" : "lazy"}
                fetchPriority={eager ? "high" : "auto"}
                className={`hero-bg-img ${cls} absolute inset-0 w-full h-full object-cover opacity-0 contrast-110 saturate-110`}
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
          <div className="relative z-10 flex-1 flex flex-col justify-between max-w-7xl mx-auto w-full px-6 lg:px-12 pt-32 pb-20">
            <motion.div
              className="max-w-[680px]"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              <motion.nav variants={fadeUp} aria-label="Fil d'Ariane" className="flex items-center gap-2 mb-6">
                <Link to="/" className="text-white/55 text-[11px] font-headline font-black uppercase tracking-[0.2em] hover:text-white transition-colors">
                  Accueil
                </Link>
                <span className="text-white/55 text-[11px]" aria-hidden="true">/</span>
                <Link to="/genie-rural" className="text-white/55 text-[11px] font-headline font-black uppercase tracking-[0.2em] hover:text-white transition-colors">
                  Génie Rural
                </Link>
                <span className="text-white/55 text-[11px]" aria-hidden="true">/</span>
                <span className="text-secondary-container text-[11px] font-headline font-black uppercase tracking-[0.2em]">
                  Solutions Durables
                </span>
              </motion.nav>
              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
                <span className="w-4 h-px bg-secondary-container" />
                <span className="font-headline font-black text-[10px] uppercase tracking-[0.25em] text-secondary-container">
                  Génie Rural Éco-Responsable
                </span>
              </motion.div>

              <div style={{ fontSize: "clamp(28px, 7vw, 92px)" }}>
                <TextReveal
                  text="Solutions durables"
                  as="h1"
                  className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em]"
                  animate
                  delay={0.1}
                />
                <TextReveal
                  text="& vie sur site."
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
                Autonomie énergétique, gestion circulaire des ressources et cadre de
                vie exemplaire pour les équipes sur le terrain.
              </motion.p>

              <motion.div variants={fadeUp}>
                <Link
                  to="/devis"
                  className="inline-flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-container font-headline font-black text-[13px] uppercase tracking-[0.18em] px-8 py-4 rounded-full hover:shadow-tectonic-orange hover:-translate-y-px transition-all"
                >
                  Demander un devis
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                </Link>
              </motion.div>
            </motion.div>

            <div />
          </div>
        </section>

        {/* Bento grid */}
        <div className="relative z-20 -mt-12 pb-24 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Irrigation card */}
          <div className="md:col-span-8 bg-surface-container-lowest  p-10 shadow-tectonic group rounded-2xl">
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="flex-1">
                <span className="material-symbols-outlined text-secondary-container text-4xl mb-4 block">water_drop</span>
                <h2 className="font-headline text-3xl font-bold text-primary mb-4">Irrigation Intégrée Haute Précision</h2>
                <p className="text-on-surface-variant font-body leading-relaxed mb-6">
                  Systèmes de pompage solaire et micro-irrigation automatisés. Rendement maximal, consommation d&apos;eau réduite de 40%.
                </p>
                <div className="flex gap-3 flex-wrap">
                  {['Solaire', 'Micro-Drip', 'Eco-Control'].map(tag => (
                    <span key={tag} className="bg-surface-container text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1  font-label">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-full md:w-1/3 aspect-square overflow-hidden rounded-2xl">
                <img
                  src="/irrigation-precision.webp"
                  alt="Système d'irrigation"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Stats card */}
          <div className="md:col-span-4 bg-primary  p-10 flex flex-col justify-center text-white rounded-2xl">
            {[
              { val: '100%', label: 'Autonomie Énergétique' },
              { val: '-40%', label: "Consommation d'Eau" },
              { val: '+65%', label: 'Rétention des Talents' },
            ].map(stat => (
              <div key={stat.label} className="mb-8 last:mb-0">
                <div className="text-5xl font-black font-headline text-secondary-container">{stat.val}</div>
                <div className="font-label text-xs uppercase tracking-widest text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Économie circulaire */}
          <div className="md:col-span-4 bg-surface-container-low flex flex-col group rounded-2xl overflow-hidden">
            <div className="h-40 overflow-hidden">
              <img
                src="/economie-circulaire.webp"
                alt="Installation de compostage industriel"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <span className="material-symbols-outlined text-secondary-container text-4xl mb-4 block">recycling</span>
              <h3 className="font-headline text-2xl font-bold text-primary mb-4">Économie Circulaire</h3>
              <p className="text-on-surface-variant text-sm font-body leading-relaxed flex-grow">
                Transformation des déchets agricoles en biofertilisants et production de biogaz pour une autosuffisance énergétique totale du site.
              </p>
              <div className="mt-6 pt-6 border-t border-outline-variant/20 flex items-center justify-between text-xs font-bold uppercase tracking-tighter text-primary font-label">
                <span>Production Méthanisation</span>
                <span className="material-symbols-outlined">bolt</span>
              </div>
            </div>
          </div>

          {/* Logements du personnel */}
          <div className="md:col-span-8 bg-surface-container-lowest overflow-hidden shadow-tectonic flex flex-col md:flex-row group">
            <div className="md:w-1/2">
              <img
                src={IMG_SOLUTIONS_DURABLES}
                alt="Logements du personnel sur site"
                className="w-full h-64 md:h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="md:w-1/2 p-10">
              <span className="material-symbols-outlined text-secondary-container text-4xl mb-4 block">home_work</span>
              <h3 className="font-headline text-2xl font-bold text-primary mb-4">Logements du Personnel</h3>
              <p className="text-on-surface-variant font-body text-sm leading-relaxed mb-6">
                Espaces de vie bioclimatiques conçus pour le confort thermique et social. Des environnements où les équipes s&apos;épanouissent durablement.
              </p>
              <ul className="space-y-3">
                {['Conception Bioclimatique', 'Espaces Communautaires', 'Connectivité Smart-Site'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-xs font-bold text-primary uppercase font-label">
                    <span className="material-symbols-outlined text-sm text-secondary-container">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Architecture section */}
        <section className="bg-surface-container-low py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-outline-variant/30 pb-8">
              <div>
                <h2 className="font-headline text-4xl font-black text-primary uppercase tracking-tighter">Architecture du Projet</h2>
                <p className="text-on-surface-variant mt-2 font-body">La précision industrielle au service de la nature.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: 'energy_savings_leaf',
                  titre: 'Indépendance Énergétique',
                  desc: 'Hybridation solaire et biomasse pour une continuité opérationnelle sans dépendance au réseau national.',
                },
                {
                  icon: 'sanitizer',
                  titre: 'Gestion des Effluents',
                  desc: 'Traitement écologique des eaux usées par phyto-épuration, réutilisables pour les zones de verdure ornementales.',
                },
                {
                  icon: 'groups_3',
                  titre: 'Bien-être & Performance',
                  desc: 'Infrastructures sportives et sanitaires intégrées pour maintenir un moral d\'équipe élevé et une productivité stable.',
                },
              ].map(item => (
                <div key={item.titre} className="space-y-6">
                  <div className="text-on-secondary-container bg-secondary-container w-12 h-12 flex items-center justify-center">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <h4 className="font-headline text-xl font-bold text-primary">{item.titre}</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed font-body">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-8">
          <div className="max-w-5xl mx-auto bg-primary  p-12 md:p-20 text-center relative overflow-hidden rounded-2xl">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <span className="material-symbols-outlined text-[10rem] text-white">construction</span>
            </div>
            <h2 className="relative z-10 font-headline text-4xl md:text-5xl font-black text-white mb-8">
              PRÊT À TRANSFORMER VOTRE SITE ?
            </h2>
            <p className="relative z-10 text-white/70 text-lg mb-10 max-w-2xl mx-auto font-body">
              Nos experts en génie rural conçoivent des solutions sur mesure alliant rentabilité et respect de l&apos;environnement.
            </p>
            <div className="relative z-10 flex flex-col md:flex-row gap-4 justify-center">
              <Link
                to="/devis"
                className="bg-secondary-container text-on-secondary-container font-headline font-black text-sm uppercase tracking-widest px-10 py-5 hover:shadow-tectonic-orange transition-all rounded-full"
              >
                Demander un devis
              </Link>
              <Link
                to="/genie-rural"
                className="bg-white/10 text-white border border-white/20 font-headline font-black text-sm uppercase tracking-widest px-10 py-5 hover:bg-white/20 transition-colors rounded-full"
              >
                Voir nos réalisations
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
