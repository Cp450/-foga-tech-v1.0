import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import TextReveal from "../components/TextReveal";

const IMG_HERO_CHANTIER = "/gc-hero-1.webp";
const IMG_DEVIS_SIDEBAR = "/bureau-etude.webp";
const IMG_PONT_OUVRAGE  = "/btp-ouvrages-art.webp";

const DISCIPLINES = [
  {
    id: "bureau-etude",
    icon: "architecture",
    title: "BUREAU D'ÉTUDE",
    tag: "Études & Plans",
    image: IMG_DEVIS_SIDEBAR,
    imageAlt: "Plans et études techniques Foga-Tech",
    items: [
      "Topographie",
      "Urbanisme",
      "Géotechnique",
      "Architecture",
      "Ingénierie",
    ],
  },
  {
    id: "travaux-publics",
    icon: "engineering",
    title: "BTP & OUVRAGES D'ARTS",
    tag: "Exécution chantier",
    image: IMG_PONT_OUVRAGE,
    imageAlt: "Construction et gros œuvre Foga-Tech Congo",
    items: [
      "Construction de bâtiment",
      "Construction métallique",
      "Construction bois",
      "VRD",
      "Assainissement",
    ],
    cta: { label: "Demander un devis →", to: "/devis" },
  },
];

export default function GenieCivil() {
  return (
    <main className="bg-surface text-on-surface">
      <SEO
        title="Génie Civil & BTP — Bureau d'Étude, Construction, Travaux Publics"
        description="Foga-Tech BTP Congo : bureau d'étude, ingénierie structurelle, architecture, construction bâtiment et travaux publics. Expertise locale, normes internationales."
        canonical="https://foga-tech.tech/genie-civil"
      />

      {/* ── Hero immersif — Ken Burns carousel ──────────────────────────── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#002045]">
        {/* Layer 0 — Ken Burns 4 images (cycle 16s) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {[
            { src: "/gc-hero-1.webp", cls: "gc-1", eager: true  },
            { src: "/gc-hero-2.webp", cls: "gc-2", eager: false },
            { src: "/gc-hero-3.webp", cls: "gc-3", eager: false },
            { src: "/gc-hero-4.webp", cls: "gc-4", eager: false },
          ].map(({ src, cls, eager }) => (
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden="true"
              loading={eager ? "eager" : "lazy"}
              fetchPriority={eager ? "high" : "auto"}
              className={`gc-bg-img ${cls} absolute inset-0 w-full h-full object-cover opacity-0 contrast-110 saturate-110`}
            />
          ))}
          {/* Voile navy gradient — lisibilité texte */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(0,16,34,0.78) 0%, rgba(0,32,69,0.45) 50%, rgba(0,13,26,0.15) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,13,26,0.55) 0%, rgba(0,32,69,0.05) 50%, rgba(0,13,26,0.15) 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-between max-w-7xl mx-auto w-full px-6 lg:px-12 pt-32 pb-12">
          <div className="max-w-[640px] flex-1 flex flex-col justify-center">
            {/* Breadcrumb */}
            <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 mb-6 animate-fade-slide-up">
              <Link
                to="/"
                className="text-white/45 text-[11px] font-headline font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
              >
                Accueil
              </Link>
              <span className="text-white/55 text-[11px]" aria-hidden="true">/</span>
              <span className="text-secondary-container text-[11px] font-headline font-black uppercase tracking-[0.2em]">
                Génie Civil
              </span>
            </nav>

            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6 animate-fade-slide-up">
              <span className="w-4 h-px bg-secondary-container" />
              <span className="font-headline font-black text-[10px] uppercase tracking-[0.25em] text-secondary-container">
                BTP · Études · Construction
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em] mb-6 animate-fade-slide-up"
              style={{ fontSize: "clamp(48px,7vw,92px)" }}
            >
              Génie civil<br />
              & BTP<br />
              <span className="text-secondary-container">Congo.</span>
            </h1>

            {/* Body */}
            <p
              className="font-body text-white/70 text-lg leading-relaxed mb-10 max-w-[540px] animate-fade-slide-up"
              style={{ animationDelay: "150ms" }}
            >
              De l&apos;étude de sol au bâtiment livré — ingénierie structurelle,
              architecture, construction et travaux publics aux normes
              internationales.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-4 mb-10 animate-fade-slide-up"
              style={{ animationDelay: "300ms" }}
            >
              <Link
                to="/devis"
                className="flex items-center justify-center text-center bg-secondary-container text-on-secondary-container font-headline font-black text-[13px] uppercase tracking-[0.18em] px-8 py-4 rounded-full hover:shadow-tectonic-orange hover:-translate-y-px transition-all"
              >
                Demander un devis
              </Link>
              <a
                href="#bureau-etude"
                className="flex items-center justify-center gap-2 text-center border border-secondary-container/30 text-white font-headline font-black text-[13px] uppercase tracking-[0.18em] px-8 py-4 rounded-full hover:bg-secondary-container/10 transition-all"
              >
                Nos disciplines
                <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_downward</span>
              </a>
            </div>

            {/* Chips — credentials + normes */}
            <div
              className="flex flex-wrap gap-2 animate-fade-slide-up"
              style={{ animationDelay: "450ms" }}
            >
              {[
                { label: "Agrément Ministère BTP" },
                { label: "Garantie décennale" },
                { label: "Eurocode 2", title: "Béton armé & précontraint" },
                { label: "LCPC/SETRA", title: "Chaussées & ouvrages d'art" },
                { label: "DTU Congo", title: "Normes locales applicables" },
                { label: "BIM Level 2", title: "Maquette numérique 3D" },
              ].map((b) => (
                <span
                  key={b.label}
                  title={b.title}
                  className="font-headline font-black text-[10px] uppercase tracking-[0.18em] text-white/60 border border-white/20 px-3 py-1.5 rounded-full hover:border-secondary-container/60 hover:text-white transition-colors"
                >
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          {/* Stats row — overlay sur image */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 pt-8 mt-12">
            {[
              { val: "+15",   label: "Projets construits" },
              { val: "12 ans", label: "Expérience terrain" },
              { val: "98%",   label: "Livrés dans les délais" },
              { val: "BIM",   label: "Modélisation 3D" },
            ].map((s) => (
              <div key={s.label}>
                <p
                  className="font-headline font-black text-white leading-none"
                  style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)' }}
                >
                  {s.val}
                </p>
                <p className="text-white/55 font-body text-[11px] mt-2 leading-tight">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── 4 Disciplines ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-16">
            <span className="text-[10px] font-label font-bold uppercase tracking-[0.25em] text-secondary-container">
              Nos Disciplines
            </span>
            <h2 className="font-headline text-4xl md:text-5xl font-black text-primary tracking-tighter mt-2">
              QUATRE EXPERTISES,
              <br />
              UN SEUL INTERLOCUTEUR.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {DISCIPLINES.map((d) => (
              <div
                key={d.id}
                id={d.id}
                className="group flex flex-col border border-outline-variant rounded-2xl overflow-hidden scroll-mt-20 bg-white hover:shadow-tectonic-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-primary">
                  <img
                    src={d.image}
                    alt={d.imageAlt}
                    className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                  {/* Tag */}
                  <span className="absolute top-4 left-4 px-2.5 py-1 bg-secondary-container text-on-secondary-container text-[9px] font-label font-bold uppercase tracking-widest rounded-full">
                    {d.tag}
                  </span>
                  {/* Icon */}
                  <span
                    className="material-symbols-outlined text-4xl text-white absolute bottom-4 left-4"
                    aria-hidden="true"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {d.icon}
                  </span>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="font-headline font-black text-xl text-primary mb-6 tracking-tight">
                    {d.title}
                  </h3>
                  <ul className="space-y-2.5 flex-1">
                    {d.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span
                          className="material-symbols-outlined text-secondary-container text-base flex-shrink-0 mt-0.5"
                          aria-hidden="true"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                        <span className="text-sm text-on-surface-variant font-body leading-snug">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {d.cta && (
                    <Link
                      to={d.cta.to}
                      className="mt-6 inline-flex items-center gap-2 text-xs font-label font-bold uppercase tracking-widest text-secondary-container hover:text-primary border-b border-secondary-container/40 hover:border-primary pb-0.5 transition-all self-start"
                    >
                      {d.cta.label}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process simplifié ─────────────────────────────────────────────── */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <span className="text-[10px] font-label font-bold uppercase tracking-[0.25em] text-secondary-container">
              Notre Méthode
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-black text-primary tracking-tighter mt-2">
              DE LA CONCEPTION À LA LIVRAISON.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { num: "01", title: "Conception & Études", desc: "Analyse du site, étude de faisabilité, relevé topo, études géotechniques, plans architecturaux, calculs de structure, avant-métré." },
              { num: "02", title: "Préparation du chantier", desc: "Dossier permis de construire, planning d'exécution des travaux, organisation du chantier et affectation des tâches." },
              { num: "03", title: "Terrassement", desc: "Préparation terrain, fondations, réseaux enterrés (VRD)." },
              { num: "04", title: "Construction", desc: "Gros œuvre, second œuvre, suivi de chantier hebdomadaire client." },
              { num: "05", title: "Livraison", desc: "Réception contradictoire, DOE, garantie décennale Foga-Tech." },
            ].map((step) => (
              <div
                key={step.num}
                className="p-6 border border-outline-variant rounded-2xl bg-white hover:border-secondary-container/60 transition-colors"
              >
                <span className="font-headline font-black text-4xl text-secondary-container/20 block mb-3 leading-none">
                  {step.num}
                </span>
                <h4 className="font-headline font-black text-sm text-primary uppercase tracking-wide mb-2">
                  {step.title}
                </h4>
                <p className="text-xs text-on-surface-variant font-body leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
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
                Votre projet BTP, <span className="text-secondary-container">notre expertise.</span>
              </h2>
              <p className="text-on-surface-variant font-body text-base max-w-2xl">
                Devis offert sous 48 h, sans engagement — ingénieur terrain dédié à votre projet.
              </p>
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
  );
}
