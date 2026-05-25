import { Link } from 'react-router-dom'

export default function StickyCTABar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch bg-primary shadow-[0_-4px_24px_rgba(0,32,69,0.15)] md:hidden">
      {/* Appel */}
      <a
        href="tel:+242069610635"
        className="flex flex-1 items-center gap-2.5 px-4 py-3 border-r border-white/10"
      >
        <span className="material-symbols-outlined text-secondary-container text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
          call
        </span>
        <div>
          <div className="font-headline font-black text-[9px] uppercase tracking-[0.25em] text-white/50">Appeler</div>
          <div className="font-headline font-bold text-[13px] text-white">+242 06 961 06 35</div>
        </div>
      </a>

      {/* WhatsApp */}
      <a
        href="https://wa.me/242069610635"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-3 bg-[#25D366] text-white font-headline font-black text-[11px] uppercase tracking-[0.15em] border-r border-white/10"
      >
        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
        WhatsApp
      </a>

      {/* Devis */}
      <Link
        to="/devis"
        className="flex items-center gap-2 px-4 py-3 bg-secondary-container text-on-secondary-container font-headline font-black text-[11px] uppercase tracking-[0.15em]"
      >
        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
        Devis offert
      </Link>
    </div>
  )
}
