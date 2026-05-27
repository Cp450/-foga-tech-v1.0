import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function PartenaireModal({ partenaire, onClose }) {
  const panelRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [openScrollY] = useState(() => window.scrollY);
  const lastMove = useRef(0);

  // Detect mobile / touch
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    };
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // Escape close (pas de body lock — page scroll libre pour révéler tte la modal)
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // 3D tilt léger — desktop only, throttled 60fps
  function handleMouseMove(e) {
    if (isMobile || !panelRef.current) return;
    const now = performance.now();
    if (now - lastMove.current < 16) return;
    lastMove.current = now;

    const { left, top, width, height } =
      panelRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const rotateX = ((y - height / 2) / (height / 2)) * -3;
    const rotateY = ((x - width / 2) / (width / 2)) * 3;
    setTiltStyle({
      transform: `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      transition: "transform 0.15s ease-out",
    });
  }

  function handleMouseLeave() {
    setTiltStyle({
      transform: "perspective(1400px) rotateX(0deg) rotateY(0deg)",
      transition: "transform 0.5s ease-in-out",
    });
  }

  return createPortal(
    <>
      {/* Backdrop — fixe plein écran, indépendant du scroll page */}
      <div
        className="fixed inset-0 z-[199] bg-[#000D1A]/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Wrapper modal — absolute positionné dans le flux page */}
      <div
        className="absolute left-0 right-0 z-[200] flex justify-center px-4 md:px-8"
        style={{ top: openScrollY + 40 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Partenaire ${partenaire.nom}`}
      >
      {/* Panel — hauteur libre, page scroll = modal scroll */}
      <div
        ref={panelRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={tiltStyle}
        className="relative w-full max-w-2xl flex flex-col bg-[#001634] rounded-3xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10 animate-fade-slide-up mb-10"
      >
        {/* Header — fixe en haut */}
        <div className="flex-shrink-0 bg-white/95 backdrop-blur-md px-8 py-10 flex items-center justify-between gap-5 border-b border-white/20">
          <img
            src={partenaire.logo}
            alt={`Logo ${partenaire.nom}`}
            className="h-16 max-w-[220px] object-contain"
            style={partenaire.logoScale ? { transform: `scale(${partenaire.logoScale})`, transformOrigin: "left center" } : undefined}
          />
          <div className="text-right flex-shrink-0">
            <span className="inline-block bg-[#FE932C]/15 text-[#234998] font-label font-bold text-[10px] uppercase tracking-[0.2em] px-4 py-1 rounded-full">
              {partenaire.type}
            </span>
            <p className="text-[#002045]/40 font-label text-[10px] uppercase tracking-wider mt-2">
              Partenaire depuis {partenaire.depuis}
            </p>
          </div>
        </div>

        {/* Corps */}
        <div className="px-8 py-6">
          <p className="text-[#234998] font-label font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
            {partenaire.secteur}
          </p>
          <h2 className="font-headline font-black text-white text-2xl leading-tight mb-4">
            {partenaire.nom}
          </h2>
          <p className="font-body text-white/60 text-sm leading-relaxed mb-6">
            {partenaire.description}
          </p>

          {/* Projets — glass card interne */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="w-5 h-px bg-[#4A7BC8]/60 flex-shrink-0" />
              <span className="font-label font-bold text-[10px] uppercase tracking-[0.2em] text-[#234998]">
                Projets communs
              </span>
            </div>
            <ul className="space-y-2.5">
              {partenaire.projets.map((p) => (
                <li key={p} className="flex items-start gap-4">
                  <span
                    className="material-symbols-outlined text-[#234998] text-base mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <span className="font-body text-white/75 text-sm">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer — fixe en bas */}
        <div className="flex-shrink-0 px-8 py-6 border-t border-white/10 flex items-center justify-between gap-4 bg-[#001634]">
          <a
            href="https://wa.me/242069905640?text=Bonjour%20Foga-Tech%2C%20je%20souhaite%20devenir%20partenaire."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#234998] text-[#002045] font-headline font-black text-xs uppercase tracking-widest px-6 py-4 rounded-full hover:brightness-105 transition-all"
          >
            <span
              className="material-symbols-outlined text-sm"
              aria-hidden="true"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              chat
            </span>
            Devenir partenaire
          </a>
          <button
            onClick={onClose}
            className="font-label font-bold text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors"
          >
            Fermer
          </button>
        </div>

        {/* ✕ Close button (overlay au-dessus du header) */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#002045]/60 hover:text-[#002045] transition-colors z-30"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>
      </div>
    </>,
    document.body,
  );
}
