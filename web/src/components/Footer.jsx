import { Link } from 'react-router-dom'

const ACTION = [
  { label: 'Demande de Devis', to: '/devis' },
  { label: 'Devis Particulier', to: '/devis-particulier' },
  { label: 'Location Engins', to: '/location' },
  { label: 'Espace Client', to: '/client/' },
]

const METIERS = [
  { label: 'Génie Civil & BTP', to: '/genie-civil' },
  { label: "Bureau d'étude", to: '/genie-civil#bureau-etude' },
  { label: "BTP & Ouvrages d'art", to: '/genie-civil#travaux-publics' },
  { label: 'Génie Rural', to: '/genie-rural' },
  { label: 'Infrastructures Rurales', to: '/genie-rural/infrastructures-rurales' },
  { label: 'Solutions Durables', to: '/genie-rural/solutions-durables' },
  { label: 'Élevage & Pisciculture', to: '/genie-rural/levage-pisciculture' },
]

const ENTREPRISE = [
  { label: 'À propos', to: '/a-propos' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Partenaires', to: '/partenaires' },
  { label: 'Contact', to: '/contact' },
]

const SOCIAL = [
  { icon: 'chat', href: 'https://wa.me/242069610635', label: 'WhatsApp' },
  { icon: 'mail', href: 'mailto:contact@foga-tech.com', label: 'Email' },
  { icon: 'call', href: 'tel:+242069610635', label: 'Téléphone' },
]

export default function Footer() {
  return (
    <footer className="bg-[#000D1A] border-t border-secondary-container/10 text-white/60">
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-1.5">
              <img
                src="/icon_logo_entreprise.svg"
                alt="Icône Foga-Tech"
                className="h-10 w-auto object-contain brightness-0 invert"
              />
              <span className="w-px h-6 bg-white/25 flex-shrink-0" aria-hidden="true" />
              <img
                src="/logo_entreprise_2.svg"
                alt="Foga-Tech BTP"
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-[12px] mt-4 max-w-xs leading-relaxed">
              Partenaire BTP de référence au Congo. 12 ans d&apos;ingénierie · +15 chantiers livrés · 65 engins en parc.
            </p>
            <div className="flex gap-3 mt-5">
              {SOCIAL.map((s) => (
                <a
                  key={s.icon}
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={s.label}
                  className="text-white/60 hover:text-secondary-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {s.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Action */}
          <div>
            <h4 className="font-headline font-extrabold text-white text-[12px] uppercase tracking-wider mb-4">Action</h4>
            <ul className="space-y-3 text-[13px]">
              {ACTION.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="inline-block py-1 hover:text-secondary-container transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Métiers */}
          <div>
            <h4 className="font-headline font-extrabold text-white text-[12px] uppercase tracking-wider mb-4">Métiers BTP</h4>
            <ul className="space-y-3 text-[13px]">
              {METIERS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="inline-block py-1 hover:text-secondary-container transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-headline font-extrabold text-white text-[12px] uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3 text-[13px]">
              <li>
                <a href="mailto:contact@foga-tech.com" className="hover:text-secondary-container transition-colors">
                  contact@foga-tech.com
                </a>
              </li>
              <li>
                <a href="tel:+242069610635" className="hover:text-secondary-container transition-colors">
                  +242 06 961 06 35
                </a>
              </li>
              <li>
                <a href="tel:+242069905640" className="hover:text-secondary-container transition-colors">
                  +242 06 990 56 40
                </a>
              </li>
              <li className="text-white/70 text-[12px] mt-2 leading-relaxed">
                1509 Rue Motaba, Plateaux des 15 ans · réf. pressing 5 à sec<br />
                Moungali · Brazzaville
              </li>
              <li className="text-white/70 text-[12px] leading-relaxed">
                34 Rue Atali, Centre Ville<br />
                derrière Ex Bouda Bar · Pointe-Noire
              </li>
              <li className="text-white/40 text-[11px] mt-3">Lun–Sam · 8h–18h</li>
            </ul>
            <div className="mt-5 pt-5 border-t border-white/10">
              <ul className="space-y-2 text-[12px]">
                {ENTREPRISE.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="inline-block py-1 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between gap-3 text-[11px] text-white/40">
          <p>© 2026 Foga-Tech International · RCCM CG/BZV/17B6964 · NIU M2017110000375160</p>
          <div className="flex gap-5 flex-wrap">
            <Link to="/mentions-legales" className="py-1 hover:text-white transition-colors">Mentions légales</Link>
            <Link to="/confidentialite" className="py-1 hover:text-white transition-colors">Confidentialité</Link>
            <Link to="/cgu" className="py-1 hover:text-white transition-colors">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
