import { useState, useEffect, useMemo, useRef, forwardRef } from "react";
import { cn } from "../lib/cn";

/**
 * ExpandingCards — Cartes horizontales (desktop) / verticales (mobile)
 * - Active : prend 5fr, image scale-up, contenu visible
 * - Inactive : 1fr, titre rotated 90°
 * - Desktop : carousel scrollable avec flèches au hover (scrollbar cachée)
 * - Mobile : empilage vertical, swipe natif
 * - Snap to card, dots indicateurs, flèches grisées aux extrémités
 * - Charte Foga-Tech : navy, orange, Manrope
 */
const SCROLL_AMOUNT = 450; // ~3 cartes par clic flèche

const ExpandingCards = forwardRef(function ExpandingCards(
  { className, items, defaultActiveIndex = 0, ...props },
  ref,
) {
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const [isDesktop, setIsDesktop] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollPage, setScrollPage] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Met à jour les états des flèches selon position scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isDesktop) return;

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
      // Page courante (sur 3 zones)
      const maxScroll = scrollWidth - clientWidth;
      const ratio = maxScroll > 0 ? scrollLeft / maxScroll : 0;
      setScrollPage(Math.round(ratio * (items.length - 1)));
    };

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [isDesktop, items.length]);

  const gridStyle = useMemo(() => {
    if (activeIndex === null) return {};
    if (isDesktop) {
      // minmax garantit que la carte active prend ≥ 480px (expansion visible)
      // et que les inactives gardent ≥ 140px (lisibilité du titre rotated)
      return {
        gridTemplateColumns: items
          .map((_, i) =>
            i === activeIndex ? "minmax(480px, 5fr)" : "minmax(140px, 1fr)",
          )
          .join(" "),
        gridTemplateRows: "1fr",
      };
    }
    return {
      gridTemplateRows: items
        .map((_, i) =>
          i === activeIndex ? "minmax(320px, 5fr)" : "minmax(60px, 1fr)",
        )
        .join(" "),
      gridTemplateColumns: "1fr",
    };
  }, [activeIndex, items, isDesktop]);

  function scrollPrev() {
    scrollRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
  }
  function scrollNext() {
    scrollRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
  }
  function scrollToIndex(idx) {
    const el = scrollRef.current;
    if (!el) return;
    const child = el.children[idx];
    if (child) child.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  return (
    <div className="relative group/carousel w-full max-w-7xl mx-auto" ref={ref}>
      {/* Flèche gauche (desktop only) */}
      <button
        type="button"
        onClick={scrollPrev}
        disabled={!canScrollLeft}
        aria-label="Référence précédente"
        className={cn(
          "hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-30",
          "w-12 h-12 rounded-full items-center justify-center",
          "bg-[#002045]/85 backdrop-blur-md border border-white/20 shadow-2xl",
          "text-white transition-all duration-300",
          "opacity-0 group-hover/carousel:opacity-100",
          canScrollLeft
            ? "hover:bg-[#234998] hover:text-[#002045] hover:scale-110 cursor-pointer"
            : "opacity-30 cursor-not-allowed",
        )}
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          arrow_back
        </span>
      </button>

      {/* Flèche droite (desktop only) */}
      <button
        type="button"
        onClick={scrollNext}
        disabled={!canScrollRight}
        aria-label="Référence suivante"
        className={cn(
          "hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-30",
          "w-12 h-12 rounded-full items-center justify-center",
          "bg-[#002045]/85 backdrop-blur-md border border-white/20 shadow-2xl",
          "text-white transition-all duration-300",
          "opacity-0 group-hover/carousel:opacity-100",
          canScrollRight
            ? "hover:bg-[#234998] hover:text-[#002045] hover:scale-110 cursor-pointer"
            : "opacity-30 cursor-not-allowed",
        )}
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          arrow_forward
        </span>
      </button>

      <ul
        ref={scrollRef}
        className={cn(
          "w-full gap-2 grid",
          "h-[600px] md:h-[500px]",
          "md:overflow-x-auto md:overflow-y-hidden",
          "md:snap-x md:snap-mandatory",
          // Hide scrollbar
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
          "transition-[grid-template-columns,grid-template-rows] duration-500 ease-out",
          className,
        )}
        style={gridStyle}
        {...props}
      >
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <li
              key={item.id}
              className="group relative cursor-pointer overflow-hidden rounded-2xl ring-1 ring-white/10 bg-[#001634] shadow-tectonic-lg md:min-w-[140px] min-h-[60px] min-w-0 md:snap-start"
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
              tabIndex={0}
              data-active={isActive}
            >
              <img
                src={item.imgSrc}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out scale-110 grayscale group-data-[active=true]:scale-100 group-data-[active=true]:grayscale-0"
                loading="lazy"
              />
              {/* Gradient navy permanent */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#000D1A]/90 via-[#000D1A]/40 to-transparent" />
              {/* Gradient renforcé au survol */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-data-[active=true]:opacity-100 transition-opacity duration-300" />

              {/* CTA orange centré au survol */}
              {(item.onSelect || item.linkHref) && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-data-[active=true]:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
                  {item.onSelect ? (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); item.onSelect(); }}
                      className="bg-secondary-container text-on-secondary-container font-headline font-black text-[11px] uppercase tracking-[0.2em] px-4 py-2.5 flex items-center gap-2 rounded-full pointer-events-auto hover:brightness-110 transition-all"
                    >
                      Voir le projet
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                    </button>
                  ) : (
                    <a
                      href={item.linkHref}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-secondary-container text-on-secondary-container font-headline font-black text-[11px] uppercase tracking-[0.2em] px-4 py-2.5 flex items-center gap-2 rounded-full pointer-events-auto"
                    >
                      Voir le projet
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                    </a>
                  )}
                </div>
              )}

              <article className="absolute inset-0 flex flex-col justify-end gap-2 p-6 md:p-6 z-10">
                <h3 className="hidden md:block origin-left rotate-90 font-label font-bold text-[11px] uppercase tracking-[0.25em] text-white/70 opacity-100 transition-all duration-300 ease-out group-data-[active=true]:opacity-0 absolute bottom-6 left-7 whitespace-nowrap">
                  {item.title}
                </h3>

                {item.segment && (
                  <span className="absolute top-5 left-5 bg-secondary-container text-on-secondary-container font-headline font-black text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full opacity-0 transition-opacity duration-300 ease-out group-data-[active=true]:opacity-100">
                    {item.segment}
                  </span>
                )}

                {/* Icon — stagger delay-75 (style original) */}
                {item.icon && (
                  <div className="text-secondary-container opacity-0 transition-all duration-300 delay-75 ease-out group-data-[active=true]:opacity-100">
                    <span
                      className="material-symbols-outlined text-3xl md:text-4xl"
                      aria-hidden="true"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {item.icon}
                    </span>
                  </div>
                )}

                <h3 className="font-headline font-black text-white text-2xl md:text-3xl leading-tight tracking-tight opacity-0 transition-all duration-300 delay-150 ease-out group-data-[active=true]:opacity-100">
                  {item.title}
                </h3>

                {item.lieu && (
                  <p className="font-body text-sm text-white/55 opacity-0 transition-all duration-300 delay-200 ease-out group-data-[active=true]:opacity-100 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-secondary-container/70" aria-hidden="true">location_on</span>
                    {item.lieu}
                  </p>
                )}

                {(item.annee || item.duree || item.client) && (
                  <div className="flex flex-wrap gap-3 opacity-0 transition-all duration-300 delay-[210ms] ease-out group-data-[active=true]:opacity-100">
                    {item.annee && (
                      <span className="flex items-center gap-1 text-[11px] font-label font-bold uppercase tracking-widest text-white/70">
                        <span className="material-symbols-outlined text-[14px] text-secondary-container/70" aria-hidden="true">event</span>
                        {item.annee}
                      </span>
                    )}
                    {item.duree && (
                      <span className="flex items-center gap-1 text-[11px] font-label font-bold uppercase tracking-widest text-white/70">
                        <span className="material-symbols-outlined text-[14px] text-secondary-container/70" aria-hidden="true">schedule</span>
                        {item.duree}
                      </span>
                    )}
                    {item.client && (
                      <span className="flex items-center gap-1 text-[11px] font-label font-bold uppercase tracking-widest text-white/70">
                        <span className="material-symbols-outlined text-[14px] text-secondary-container/70" aria-hidden="true">handshake</span>
                        {item.client}
                      </span>
                    )}
                  </div>
                )}

                <p className="w-full max-w-md font-body text-sm text-white/75 leading-relaxed opacity-0 transition-all duration-300 delay-[225ms] ease-out group-data-[active=true]:opacity-100">
                  {item.description}
                </p>
              </article>
            </li>
          );
        })}
      </ul>

      {/* Dots indicateurs (desktop only) */}
      {isDesktop && items.length > 7 && (
        <div className="hidden md:flex justify-center gap-1.5 mt-6">
          {items.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIndex(idx)}
              aria-label={`Aller à la référence ${idx + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                idx === scrollPage
                  ? "w-6 bg-[#234998]"
                  : "w-1.5 bg-white/25 hover:bg-white/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default ExpandingCards;
