import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

const QUICK_LINKS = [
  { to: '/devis',            icon: 'request_quote',  label: 'Demander un devis' },
  { to: '/genie-civil',      icon: 'foundation',     label: 'Génie Civil' },
  { to: '/genie-rural',      icon: 'agriculture',    label: 'Génie Rural' },
  { to: '/location',         icon: 'local_shipping', label: 'Location Engins' },
  { to: '/portfolio',        icon: 'grid_view',      label: 'Réalisations' },
  { to: '/contact',          icon: 'mail',           label: 'Contact' },
]

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#001022] text-white flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
      <SEO
        title="Page introuvable — 404"
        description="Cette page n'existe pas ou a été déplacée."
        noindex={true}
      />

      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(255,107,0,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Orange top line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: 'linear-gradient(to right, transparent, #FF6B00, transparent)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl text-center">

        {/* 404 number */}
        <div className="relative inline-block mb-6">
          <span
            className="font-headline font-black leading-none select-none"
            style={{
              fontSize: 'clamp(65px, 20vw, 160px)',
              color: 'transparent',
              WebkitTextStroke: '2px rgba(255,107,0,0.3)',
              letterSpacing: '-0.05em',
            }}
            aria-hidden="true"
          >
            404
          </span>
          <span
            className="absolute inset-0 flex items-center justify-center font-headline font-black leading-none"
            style={{
              fontSize: 'clamp(65px, 20vw, 160px)',
              color: 'rgba(255,107,0,0.08)',
              letterSpacing: '-0.05em',
              filter: 'blur(2px)',
            }}
            aria-hidden="true"
          >
            404
          </span>
        </div>

        {/* Overline */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <span className="w-8 h-px bg-secondary-container opacity-60" />
          <span className="font-headline font-black text-[10px] uppercase tracking-[0.25em] text-secondary-container opacity-80">
            Erreur 404
          </span>
          <span className="w-8 h-px bg-secondary-container opacity-60" />
        </div>

        {/* Heading */}
        <h1
          className="font-headline font-black text-white tracking-tight leading-tight mb-4"
          style={{ fontSize: 'clamp(18px, 5vw, 3rem)' }}
        >
          Page introuvable
        </h1>

        <p className="font-body text-white/55 text-lg mb-12 leading-relaxed max-w-md mx-auto">
          Cette page n'existe pas ou a été déplacée.<br />
          Reprenez votre navigation depuis l'accueil.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 font-headline font-black px-8 py-4 rounded-full text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #FF6B00, #e55f00)', color: '#fff' }}
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">home</span>
            Retour à l'accueil
          </Link>
          <a
            href="https://wa.me/242069905640"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/15 text-white font-headline font-bold px-8 py-4 rounded-full text-sm uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">chat</span>
            WhatsApp
          </a>
        </div>

        {/* Quick links grid */}
        <div className="border-t border-white/10 pt-10">
          <p className="text-white/30 text-xs font-headline font-bold uppercase tracking-widest mb-6">
            Pages principales
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all group text-left"
              >
                <span
                  className="material-symbols-outlined text-secondary-container text-xl flex-shrink-0 group-hover:scale-110 transition-transform"
                  aria-hidden="true"
                >
                  {l.icon}
                </span>
                <span className="font-body text-sm text-white/70 group-hover:text-white transition-colors leading-tight">
                  {l.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
