import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

export default function ClientPortal() {
  return (
    <main className="min-h-screen pt-24 pb-20 bg-surface flex items-center justify-center px-6">
      <SEO
        title="Espace Client — Bientôt disponible"
        description="Le portail client Foga-Tech BTP arrive prochainement. Suivez vos chantiers en temps réel."
        canonical="https://foga-tech.tech/client"
      />

      <div className="max-w-2xl w-full">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-10 md:p-14 text-center shadow-tectonic-lg">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-secondary-container/15 border border-secondary-container/30 px-4 py-2 rounded-full mb-8">
            <span
              className="material-symbols-outlined text-secondary-container text-base"
              aria-hidden="true"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              schedule
            </span>
            <span className="font-label font-black text-[10px] uppercase tracking-[0.25em] text-secondary-container">
              Bientôt disponible
            </span>
          </div>

          {/* Icon */}
          <span
            className="material-symbols-outlined text-primary block mb-6"
            aria-hidden="true"
            style={{ fontSize: '64px', fontVariationSettings: "'FILL' 1" }}
          >
            construction
          </span>

          {/* Title */}
          <h1 className="font-headline font-black text-primary text-3xl md:text-4xl leading-tight tracking-[-0.02em] mb-4">
            Espace Client en préparation
          </h1>

          {/* Subtitle */}
          <p className="text-on-surface-variant font-body text-base md:text-lg leading-relaxed mb-2 max-w-lg mx-auto">
            Suivi de chantier en temps réel, accès aux documents, jalons de paiement —
            le portail arrive très prochainement.
          </p>

          <p className="text-on-surface-variant/70 font-body text-sm mb-10">
            En attendant, notre équipe vous accompagne directement.
          </p>

          {/* Features preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
            {[
              { icon: 'monitoring', label: 'Suivi temps réel' },
              { icon: 'description', label: 'Documents projet' },
              { icon: 'payments', label: 'Jalons & paiements' },
            ].map((f) => (
              <div key={f.label} className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-4 flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-secondary-container text-xl flex-shrink-0"
                  aria-hidden="true"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  {f.icon}
                </span>
                <span className="font-headline font-bold text-primary text-sm">{f.label}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-container font-headline font-black text-[12px] uppercase tracking-[0.2em] px-6 py-3.5 rounded-full hover:shadow-tectonic-orange hover:-translate-y-px transition-all"
            >
              Nous contacter
              <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-transparent border border-outline-variant text-primary font-headline font-black text-[12px] uppercase tracking-[0.2em] px-6 py-3.5 rounded-full hover:bg-surface-container-low transition-all"
            >
              Retour à l'accueil
            </Link>
          </div>

          {/* Footer note */}
          <p className="mt-8 pt-8 border-t border-outline-variant/30 text-on-surface-variant/60 font-body text-xs">
            Vous êtes déjà client ? Contactez votre chef de projet par WhatsApp ou email pour un suivi direct.
          </p>
        </div>
      </div>
    </main>
  )
}
