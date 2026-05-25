import { Link } from "react-router-dom";

export default function StickyMobileBar() {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#002045] border-t border-white/10 flex">
      <a
        href="tel:+242069610635"
        className="flex-1 flex items-center gap-2 px-4 py-3 border-r border-white/10"
        aria-label="Appeler Foga-Tech"
      >
        <span className="material-symbols-outlined text-[18px] text-secondary-container" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
          call
        </span>
        <div>
          <div className="text-[9px] uppercase tracking-widest text-white/45">Appeler</div>
          <div className="font-headline font-extrabold text-[12px] text-white">+242 06 961 06 35</div>
        </div>
      </a>

      <a
        href="https://wa.me/242069610635"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#25D366] text-white px-4 py-3 flex items-center gap-1.5 font-headline font-extrabold text-[11px] uppercase tracking-wider"
        aria-label="Contacter sur WhatsApp"
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
          chat
        </span>
        WA
      </a>

      <Link
        to="/devis"
        className="bg-secondary-container text-on-secondary-container px-4 py-3 flex items-center gap-1.5 font-headline font-extrabold text-[11px] uppercase tracking-wider"
        aria-label="Demander un devis"
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
          description
        </span>
        Devis
      </Link>
    </div>
  );
}
