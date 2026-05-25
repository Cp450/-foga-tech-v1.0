import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import Partenaires from "../components/Partenaires";
import TextReveal from "../components/TextReveal";

export default function PartenairesPage() {
  return (
    <>
      <SEO
        title="Partenaires & Clients — Foga-Tech BTP Congo"
        description="Découvrez les partenaires stratégiques, fournisseurs et clients institutionnels de Foga-Tech BTP Congo. Institutions publiques, groupes internationaux et entreprises congolaises."
        canonical="https://foga-tech.com/partenaires"
      />

      {/* Page hero — full screen */}
      <section className="relative min-h-screen bg-[#002045] flex flex-col justify-end overflow-hidden px-6">
        {/* Layer 1 — Ken Burns 3 images (24s cycle) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {[
            { src: "/partenaires-hero-1.png", cls: "pt-1", eager: true  },
            { src: "/partenaires-hero-2.png", cls: "pt-2", eager: false },
            { src: "/partenaires-hero-3.png", cls: "pt-3", eager: false },
          ].map(({ src, cls, eager }) => (
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden="true"
              loading={eager ? "eager" : "lazy"}
              fetchPriority={eager ? "high" : "auto"}
              className={`pt-bg-img ${cls} absolute inset-0 w-full h-full object-cover opacity-0 contrast-110 saturate-110`}
            />
          ))}
          {/* Voile navy gradient — lisibilité texte */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,32,69,0.88) 0%, rgba(0,32,69,0.35) 50%, rgba(0,13,26,0.45) 100%)",
            }}
          />
        </div>
        {/* Blueprint glow overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            backgroundImage: `radial-gradient(circle at 15% 40%, rgba(254,147,44,0.12), transparent 50%), radial-gradient(circle at 85% 15%, rgba(37,99,235,0.08), transparent 55%)`,
          }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 inset-x-0 h-48 pointer-events-none z-[1]"
          style={{ background: "linear-gradient(to top, #002045, transparent)" }}
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-7xl mx-auto text-center pb-16 pt-32 w-full">
          <nav aria-label="Fil d'Ariane" className="flex items-center justify-center gap-2 mb-6">
            <Link to="/" className="text-white/55 text-[11px] font-headline font-black uppercase tracking-[0.2em] hover:text-white transition-colors">
              Accueil
            </Link>
            <span className="text-white/55 text-[11px]" aria-hidden="true">/</span>
            <span className="text-secondary-container text-[11px] font-headline font-black uppercase tracking-[0.2em]">
              Partenaires
            </span>
          </nav>
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-6 h-px bg-[#4A7BC8]/60 flex-shrink-0" />
            <span className="font-label font-bold text-[11px] uppercase tracking-[0.25em] text-[#234998]">
              Écosystème Foga-Tech
            </span>
            <span className="w-6 h-px bg-[#4A7BC8]/60 flex-shrink-0" />
          </div>
          <div style={{ fontSize: "clamp(40px, 6vw, 72px)" }}>
            <TextReveal
              text="Partenaires & clients"
              as="h1"
              className="font-headline font-black text-white leading-[0.95] tracking-[-0.03em] mb-6"
              animate
              delay={0.1}
            />
          </div>
          <p className="font-body text-white/50 text-base max-w-xl mx-auto">
            Institutions, entreprises nationales et groupes internationaux —
            ensemble nous façonnons l&apos;infrastructure du Congo de demain.
          </p>
        </div>
      </section>

      {/* Grid partenaires + modales */}
      <Partenaires />
    </>
  );
}
