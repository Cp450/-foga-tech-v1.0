import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function ProjetModal({ projet, onClose }) {
  const panelRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [openScrollY] = useState(() => window.scrollY);
  const lastMove = useRef(0);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    };
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleMouseMove(e) {
    if (isMobile || !panelRef.current) return;
    const now = performance.now();
    if (now - lastMove.current < 16) return;
    lastMove.current = now;
    const { left, top, width, height } = panelRef.current.getBoundingClientRect();
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

  const meta = [
    projet.lieu && { icon: "location_on", label: "Localisation", value: projet.lieu },
    projet.annee && { icon: "event", label: "Année", value: projet.annee },
    projet.duree && { icon: "schedule", label: "Durée", value: projet.duree },
  ].filter(Boolean);

  return createPortal(
    <>
      {/* Backdrop — fixe plein écran */}
      <div
        className="fixed inset-0 z-[199] bg-[#000D1A]/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Wrapper modal */}
      <div
        className="absolute left-0 right-0 z-[200] flex justify-center px-4 md:px-8"
        style={{ top: openScrollY + 40 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Projet ${projet.title}`}
      >
        {/* Panel — DNA PartenaireModal adapté chantier */}
        <div
          ref={panelRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={tiltStyle}
          className="relative w-full max-w-2xl flex flex-col bg-[#001634] rounded-3xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10 animate-fade-slide-up mb-10"
        >
          {/* Header + Image — full-bleed depuis le bord supérieur */}
          <div className="relative h-56 md:h-72 overflow-hidden flex-shrink-0">
            {projet.imgSrc && (
              <img
                src={projet.imgSrc}
                alt={projet.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {/* Gradient: base navale en bas, voile semi-sombre en haut */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#001634] via-[#001634]/25 to-[#001022]/55" />

            {/* Logo + segment + année flottants sur l'image */}
            <div className="relative z-10 px-8 pt-7 flex items-start justify-between gap-5">
              {projet.logo ? (
                <div className="bg-white/92 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg">
                  <img
                    src={projet.logo}
                    alt={`Logo ${projet.client}`}
                    className="h-12 max-w-[180px] object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-[#001634]/70 backdrop-blur-sm rounded-xl px-4 py-2.5">
                  {projet.icon && (
                    <span
                      className="material-symbols-outlined text-white text-2xl"
                      aria-hidden="true"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {projet.icon}
                    </span>
                  )}
                  <span className="font-headline font-black text-white text-base uppercase tracking-tight">
                    {projet.client}
                  </span>
                </div>
              )}
              <div className="text-right flex-shrink-0">
                {projet.segment && (
                  <span className="inline-block bg-[#FE932C] text-white font-label font-bold text-[10px] uppercase tracking-[0.2em] px-4 py-1 rounded-full shadow-md">
                    {projet.segment}
                  </span>
                )}
                {projet.annee && (
                  <p className="text-white/65 font-label text-[10px] uppercase tracking-wider mt-2">
                    Livré en {projet.annee}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Corps */}
          <div className="px-8 py-6">
            <p className="text-[#234998] font-label font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
              Client · {projet.client}
            </p>
            <h2 className="font-headline font-black text-white text-2xl leading-tight mb-4">
              {projet.title}
            </h2>
            {projet.description && (
              <p className="font-body text-white/60 text-sm leading-relaxed mb-6">
                {projet.description}
              </p>
            )}

            {/* Meta cards — DNA PartenaireModal "Projets communs" */}
            {meta.length > 0 && (
              <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 mb-4">
                <div className="flex items-center gap-4 mb-4">
                  <span className="w-5 h-px bg-[#4A7BC8]/60 flex-shrink-0" />
                  <span className="font-label font-bold text-[10px] uppercase tracking-[0.2em] text-[#234998]">
                    Détails du chantier
                  </span>
                </div>
                <ul className="space-y-3">
                  {meta.map((m) => (
                    <li key={m.label} className="flex items-center gap-4">
                      <span
                        className="material-symbols-outlined text-[#234998] text-base flex-shrink-0"
                        aria-hidden="true"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {m.icon}
                      </span>
                      <span className="font-label font-bold text-[10px] uppercase tracking-[0.15em] text-white/40 w-28 flex-shrink-0">
                        {m.label}
                      </span>
                      <span className="font-body text-white/85 text-sm">
                        {m.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Détails des travaux — DNA PartenaireModal "Projets communs" */}
            {projet.travaux?.length > 0 && (
              <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="w-5 h-px bg-[#4A7BC8]/60 flex-shrink-0" />
                  <span className="font-label font-bold text-[10px] uppercase tracking-[0.2em] text-[#234998]">
                    Détails des travaux
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {projet.travaux.map((t) => (
                    <li key={t} className="flex items-start gap-4">
                      <span
                        className="material-symbols-outlined text-[#234998] text-base mt-0.5 flex-shrink-0"
                        aria-hidden="true"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      <span className="font-body text-white/75 text-sm">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer — fixe en bas (DNA PartenaireModal) */}
          <div className="flex-shrink-0 px-8 py-6 border-t border-white/10 flex items-center justify-between gap-4 bg-[#001634]">
            <a
              href={`https://wa.me/242069610635?text=${encodeURIComponent(
                `Bonjour Foga-Tech, je souhaite un devis similaire au projet ${projet.title}.`
              )}`}
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
              Devis similaire
            </a>
            <button
              onClick={onClose}
              className="font-label font-bold text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              Fermer
            </button>
          </div>

          {/* ✕ Close button overlay */}
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors z-30"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
