import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/cn";
import MagneticButton from "./MagneticButton";

// Grouped service structure for the mega-menu
const SERVICE_GROUPS = [
  {
    label: "Génie Civil",
    icon: "engineering",
    items: [
      { label: "Vue d'ensemble",       to: "/genie-civil",                          icon: "explore",      desc: "Tous nos métiers BTP" },
      { label: "Bureau d'étude",       to: "/genie-civil#bureau-etude",             icon: "architecture", desc: "Topo, urbanisme, ingénierie" },
      { label: "BTP & Ouvrages d'Arts", to: "/genie-civil#travaux-publics",         icon: "foundation",   desc: "Bâtiment, métallique, VRD" },
    ],
  },
  {
    label: "Génie Rural",
    icon: "agriculture",
    items: [
      { label: "Vue d'ensemble",          to: "/genie-rural",                            icon: "explore",            desc: "Pôle agricole intégré" },
      { label: "Infrastructures Rurales", to: "/genie-rural/infrastructures-rurales",    icon: "route",              desc: "Adduction, électrification" },
      { label: "Solutions Durables",      to: "/genie-rural/solutions-durables",         icon: "energy_savings_leaf",desc: "Solaire, biogaz, irrigation" },
      { label: "Élevage & Pisciculture",  to: "/genie-rural/levage-pisciculture",        icon: "pets",               desc: "Bâtiments avicoles, étangs" },
    ],
  },
];

const SERVICE_STANDALONE = [
  { label: "Location Engins", to: "/location", icon: "construction", desc: "65 engins disponibles" },
];

// Flat list used only for active-state detection
const ALL_SERVICE_ITEMS = [
  ...SERVICE_GROUPS.flatMap((g) => g.items),
  ...SERVICE_STANDALONE,
];

const MOBILE_ITEMS = [
  { label: "Accueil", to: "/" },
  { label: "Génie Civil", to: "/genie-civil" },
  { label: "Bureau d'étude", to: "/genie-civil#bureau-etude" },
  { label: "BTP & Ouvrages d'art", to: "/genie-civil#travaux-publics" },
  { label: "Génie Rural", to: "/genie-rural" },
  { label: "Infrastructures Rurales", to: "/genie-rural/infrastructures-rurales" },
  { label: "Solutions Durables", to: "/genie-rural/solutions-durables" },
  { label: "Élevage & Pisciculture", to: "/genie-rural/levage-pisciculture" },
  { label: "Location Engins", to: "/location" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "À propos", to: "/a-propos" },
  { label: "Contact", to: "/contact" },
];

const WHATSAPP_URL = "https://wa.me/242069610635";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);
  const hamburgerRef = useRef(null);
  const closeTimerRef = useRef(null);

  function closeMenus() {
    setMobileOpen(false);
    setDropdownOpen(false);
  }

  function openDropdown() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setDropdownOpen(true);
  }

  function scheduleCloseDropdown() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setDropdownOpen(false), 180);
  }

  /** Scroll shadow effect */
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** Escape closes menus */
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        if (mobileOpen) { setMobileOpen(false); hamburgerRef.current?.focus(); }
        if (dropdownOpen) setDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, dropdownOpen]);

  /** Close dropdown on outside click */
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function isActive(to) {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  }

  function isServicesActive() {
    return ALL_SERVICE_ITEMS.some((item) => isActive(item.to));
  }

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b",
        scrolled
          ? "bg-[#002045]/85 backdrop-blur-xl border-white/10 shadow-tectonic-lg"
          : "bg-[#002045]/30 border-transparent",
      )}
    >
      <nav aria-label="Main navigation" className="h-20">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 h-full gap-8">

          {/* Logo — icon + wordmark SVG */}
          <Link to="/" className="flex items-center gap-1.5 shrink-0" onClick={closeMenus}>
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

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <Link
              to="/"
              className={cn(
                "font-headline font-bold text-xs uppercase tracking-widest pb-0.5 transition-colors duration-200 border-b-2",
                isActive("/")
                  ? "text-on-primary border-secondary-container"
                  : "text-on-primary/60 border-transparent hover:text-on-primary",
              )}
            >
              Accueil
            </Link>

            {/* Services dropdown */}
            <div
              className="relative h-full flex items-center"
              ref={dropdownRef}
              onMouseEnter={openDropdown}
              onMouseLeave={scheduleCloseDropdown}
            >
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                className={cn(
                  "flex items-center gap-0.5 font-headline font-bold text-xs uppercase tracking-widest pb-0.5 transition-colors duration-200 border-b-2 cursor-pointer",
                  isServicesActive()
                    ? "text-on-primary border-secondary-container"
                    : "text-on-primary/60 border-transparent hover:text-on-primary",
                )}
              >
                Services
                <span
                  className="material-symbols-outlined leading-none transition-transform duration-200"
                  aria-hidden="true"
                  style={{ fontSize: "16px", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  expand_more
                </span>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute top-full left-0 pt-[29px] w-[860px] max-w-[calc(100vw-2rem)] z-50"
                  onMouseEnter={openDropdown}
                  onMouseLeave={scheduleCloseDropdown}
                >
                <div
                  role="menu"
                  className={cn(
                    "backdrop-blur-xl backdrop-saturate-150 shadow-tectonic-lg border rounded-2xl overflow-hidden animate-fade-slide-up",
                    scrolled
                      ? "bg-[#002045]/85 border-white/10"
                      : "bg-[#002045]/60 border-white/10",
                  )}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px]">
                    {/* Col 1 — Génie Civil */}
                    {SERVICE_GROUPS.map((group) => (
                      <div key={group.label} className="p-6 border-b lg:border-b-0 lg:border-r border-white/10">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="material-symbols-outlined text-secondary-container text-xl" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>{group.icon}</span>
                          <p className="font-label font-black text-[10px] uppercase tracking-[0.25em] text-secondary-container">
                            {group.label}
                          </p>
                        </div>
                        <div className="space-y-1">
                          {group.items.map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={closeMenus}
                              className={cn(
                                "group flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors",
                                isActive(item.to)
                                  ? "bg-secondary-container/15"
                                  : "hover:bg-white/[0.06]",
                              )}
                            >
                              <span
                                className={cn(
                                  "material-symbols-outlined text-lg flex-shrink-0 mt-0.5 transition-colors",
                                  isActive(item.to)
                                    ? "text-secondary-container"
                                    : "text-white/55 group-hover:text-secondary-container",
                                )}
                                aria-hidden="true"
                                style={{ fontVariationSettings: "'FILL' 0" }}
                              >
                                {item.icon}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "font-headline font-bold text-[13px] leading-tight mb-0.5 transition-colors",
                                  isActive(item.to) ? "text-white" : "text-white/90 group-hover:text-white",
                                )}>
                                  {item.label}
                                </p>
                                <p className="font-body text-[11px] text-white/55 leading-tight">
                                  {item.desc}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Col 3 — Promo Location + Devis CTA */}
                    <div className="p-6 bg-white/[0.04] flex flex-col gap-4">
                      {SERVICE_STANDALONE.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={closeMenus}
                          className={cn(
                            "group flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors",
                            isActive(item.to)
                              ? "bg-secondary-container/20"
                              : "hover:bg-white/[0.08]",
                          )}
                        >
                          <span
                            className="material-symbols-outlined text-xl text-secondary-container flex-shrink-0 mt-0.5"
                            aria-hidden="true"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            {item.icon}
                          </span>
                          <div className="flex-1">
                            <p className="font-headline font-bold text-[13px] text-white leading-tight mb-0.5">
                              {item.label}
                            </p>
                            <p className="font-body text-[11px] text-white/55 leading-tight">
                              {item.desc}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                </div>
              )}
            </div>

            <Link
              to="/portfolio"
              className={cn(
                "font-headline font-bold text-xs uppercase tracking-widest pb-0.5 transition-colors duration-200 border-b-2",
                isActive("/portfolio")
                  ? "text-on-primary border-secondary-container"
                  : "text-on-primary/60 border-transparent hover:text-on-primary",
              )}
            >
              Portfolio
            </Link>

            <Link
              to="/a-propos"
              className={cn(
                "font-headline font-bold text-xs uppercase tracking-widest pb-0.5 transition-colors duration-200 border-b-2",
                isActive("/a-propos")
                  ? "text-on-primary border-secondary-container"
                  : "text-on-primary/60 border-transparent hover:text-on-primary",
              )}
            >
              À propos
            </Link>

            <Link
              to="/contact"
              className={cn(
                "font-headline font-bold text-xs uppercase tracking-widest pb-0.5 transition-colors duration-200 border-b-2",
                isActive("/contact")
                  ? "text-on-primary border-secondary-container"
                  : "text-on-primary/60 border-transparent hover:text-on-primary",
              )}
            >
              Contact
            </Link>

          </div>

          {/* Desktop CTA */}
          <MagneticButton className="hidden md:inline-block shrink-0">
            <Link
              to="/devis"
              className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container px-5 py-2.5 font-headline font-bold uppercase tracking-widest text-xs shadow-tectonic-orange hover:brightness-105 active:scale-95 transition-all duration-200 rounded-full"
            >
              <span
                className="material-symbols-outlined text-sm"
                aria-hidden="true"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                description
              </span>
              Demander un devis
            </Link>
          </MagneticButton>

          {/* Hamburger */}
          <button
            ref={hamburgerRef}
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Menu principal"
            aria-controls="mobile-menu"
            className="md:hidden flex items-center justify-center w-11 h-11 text-on-primary"
          >
            <span
              className="material-symbols-outlined transition-transform duration-200"
              aria-hidden="true"
              style={{ fontSize: "24px" }}
            >
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          className={cn(
            "md:hidden bg-primary border-t border-primary-container/30 nav-mobile-menu",
            mobileOpen && "open",
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
        >
          <ul className="flex flex-col" role="list">
            {MOBILE_ITEMS.map((item) => (
              <li key={item.to} role="listitem">
                <Link
                  to={item.to}
                  onClick={closeMenus}
                  className={cn(
                    "flex items-center min-h-[48px] px-6 font-headline font-bold text-xs uppercase tracking-widest border-b border-primary-container/30 transition-colors duration-150",
                    isActive(item.to)
                      ? "text-secondary-container"
                      : "text-on-primary/75 hover:text-on-primary",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li role="listitem">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenus}
                className="flex items-center min-h-[48px] px-6 font-headline font-bold text-xs uppercase tracking-widest border-b border-primary-container/30 text-on-primary/75 hover:text-on-primary transition-colors duration-150 rounded-full"
              >
                Contact WhatsApp
              </a>
            </li>
          </ul>

          <div className="px-6 py-4">
            <Link
              to="/devis"
              onClick={closeMenus}
              className="flex items-center justify-center gap-2 w-full min-h-[48px] bg-secondary-container text-on-secondary-container font-headline font-bold uppercase tracking-widest text-xs shadow-tectonic-orange"
            >
              <span
                className="material-symbols-outlined text-sm"
                aria-hidden="true"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                description
              </span>
              Demander un devis
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
