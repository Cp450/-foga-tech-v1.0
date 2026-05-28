import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import StickyCTABar from "../components/StickyCTABar";
import PartenaireModal from "../components/PartenaireModal";
import { PARTENAIRES } from "../data/partenaires";
import { cn } from "../lib/cn";

/* ── Données ──────────────────────────────────────────────────── */
const SEGMENTS = [
  {
    id: "particulier",
    label: "Particulier",
    icon: "home",
    headline: "Construire votre maison",
    promise: "Devis maison clé en main · planning garanti",
    bullets: ["Villa R+0 / R+1 / R+2", "Terrain ou pas terrain", "Financement modulable"],
    typical: "Maison clé en main · Planning et qualité garantis",
    devisLink: "/devis-particulier",
    image: "/segment-particulier.webp",
  },
  {
    id: "entreprise",
    label: "Entreprise",
    icon: "business",
    headline: "Vos locaux, opérationnels",
    promise: "Bureaux, entrepôts, commerces · délai contractuel",
    bullets: ["Étude de sol & permis inclus", "Gros œuvre + second œuvre", "Reporting hebdo"],
    typical: "Locaux livrés à date contractuelle · Suivi hebdomadaire",
    devisLink: "/devis",
    image: "/segment-entreprise.webp",
    imagePos: "object-[center_35%]",
  },
  {
    id: "collectivite",
    label: "Collectivité",
    icon: "account_balance",
    headline: "Marchés publics conformes",
    promise: "Voirie, infra rurale, équipements · cahier des charges respecté",
    bullets: ["Conformité ANR & garanties décennales", "Rapports mensuels formatés", "12 marchés livrés"],
    typical: "Conformité ANR · Garanties décennales incluses",
    devisLink: "/devis",
    image: "/segment-collectivite.webp",
  },
];

const SERVICES = [
  {
    num: "01",
    title: "Génie civil & gros œuvre",
    chantiers: "+15",
    to: "/genie-civil",
    kind: "navy",
    image: "/genie-civil.webp",
    imagePos: "object-[center_25%]",
  },
  {
    num: "02",
    title: "Bâtiment tertiaire & résidentiel",
    chantiers: 64,
    to: "/genie-civil#construction",
    kind: "light",
    image: "/batiment-tertiaire.webp",
  },
  {
    num: "03",
    title: "Génie rural & hydraulique",
    chantiers: 24,
    to: "/genie-rural",
    kind: "light",
    image: "/genie-rural.webp",
  },
  {
    num: "04",
    title: "Location d'engins",
    chantiers: 65,
    to: "/location",
    kind: "navy",
    image: "/location-engins.webp",
  },
];

const TESTIMONIALS = [
  { name: "CHU-B Brazzaville",        project: "CHU-B Brazzaville · Bâtiment santé",          photo: "/portfolio-chu.webp" },
  { name: "Centre Emplisseur Mpila",  project: "Centre Gaz Mpila · Bâtiment industriel",      photo: "/chantier-faki.webp" },
  { name: "Hangars PNR + BZV",        project: "Hangars métalliques · Construction métallique", photo: "/portfolio-hangar-pn.webp" },
  { name: "Université UDSN",          project: "Université Denis Sassou N'Guesso · Étanchéité", photo: "/portfolio-udn.webp" },
  { name: "VRD Petit-Chose",          project: "VRD axe Petit-Chose-Manianga · Voirie urbaine", photo: "/portfolio-petit-chose.webp" },
  { name: "Corniche Brazzaville",     project: "Luminaires Corniche · Éclairage public",       photo: "/portfolio-luminaire.webp" },
  { name: "Base vie Mayanga",         project: "Projet Pep's · Génie civil",                   photo: "/portfolio-mayanga.webp" },
  { name: "Park'n Shop",              project: "Étanchéité toiture terrasse · Étanchéité",     photo: "/portfolio-etancheite-parknshop.webp" },
  { name: "Route Boundji-Ewo",        project: "Boundji-Ewo · Transport & logistique",         photo: "/portfolio-boundji-ewo.webp" },
  { name: "Voiries Owando",           project: "Voiries Owando · Voirie urbaine",              photo: "/portfolio-owando.webp" },
  { name: "Pylônes Mossaka-Oyo",      project: "Pylônes HT · Énergie haute tension",           photo: "/portfolio-mossaka-oyo.webp" },
  { name: "Transport Loutété",        project: "Calcaire Loutété · Transport & logistique",    photo: "/portfolio-loutete.webp" },
  { name: "Hub agricole Loudima",     project: "Hub Eni · Génie rural",                        photo: "/portfolio-hub-agricole.webp" },
];

const STATS = [
  { val: "+15", suffix: "", label: "chantiers livrés" },
  { val: "98", suffix: "%", label: "dans les délais" },
  { val: "65", suffix: "", label: "engins en parc" },
  { val: "12", suffix: " ans", label: "d'ancrage au Congo" },
];

const APPROFONDIR = [
  { label: "Génie civil & gros œuvre",  to: "/genie-civil",                          icon: "foundation" },
  { label: "Bureau d'étude",            to: "/genie-civil#bureau-etude",             icon: "architecture" },
  { label: "BTP & Ouvrages d'art",      to: "/genie-civil#travaux-publics",          icon: "engineering" },
  { label: "Génie rural & hydraulique", to: "/genie-rural",                          icon: "water_drop" },
  { label: "Infrastructures rurales",   to: "/genie-rural/infrastructures-rurales",  icon: "route" },
  { label: "Élevage & pisciculture",    to: "/genie-rural/levage-pisciculture",      icon: "pets" },
  { label: "Solutions durables",        to: "/genie-rural/solutions-durables",       icon: "energy_savings_leaf" },
  { label: "Location d'engins BTP",     to: "/location",                             icon: "construction" },
];

/* ── Neural canvas particle system ──────────────────────────── */
const PARTICLE_COLOR = "#FE932C";
const PARTICLE_SPEED = 0.6;
const PARTICLE_COUNT = 150;
const PARTICLE_TRAIL = 0.18;

function makeParticle(getWidth, getHeight, getMouse) {
  const p = { x: 0, y: 0, vx: 0, vy: 0, age: 0, life: 0 };
  const reset = () => {
    p.x = Math.random() * getWidth();
    p.y = Math.random() * getHeight();
    p.vx = 0;
    p.vy = 0;
    p.age = 0;
    p.life = Math.random() * 200 + 100;
  };
  reset();
  p.update = () => {
    const w = getWidth(), h = getHeight();
    const mouse = getMouse();
    const angle = (Math.cos(p.x * 0.005) + Math.sin(p.y * 0.005)) * Math.PI;
    p.vx += Math.cos(angle) * 0.2 * PARTICLE_SPEED;
    p.vy += Math.sin(angle) * 0.2 * PARTICLE_SPEED;
    const dx = mouse.x - p.x, dy = mouse.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 150) {
      const f = (150 - dist) / 150;
      p.vx -= dx * f * 0.05;
      p.vy -= dy * f * 0.05;
    }
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.95;
    p.vy *= 0.95;
    p.age++;
    if (p.age > p.life) reset();
    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;
  };
  p.draw = (ctx) => {
    const alpha = 1 - Math.abs(p.age / p.life - 0.5) * 2;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = PARTICLE_COLOR;
    ctx.fillRect(p.x, p.y, 1.5, 1.5);
  };
  return p;
}

function useNeuralCanvas(containerRef) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    let width = container.clientWidth;
    let height = container.clientHeight;
    let particles = [];
    let rafId;
    const mouse = { x: -1000, y: -1000 };

    const getWidth = () => width;
    const getHeight = () => height;
    const getMouse = () => mouse;

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      particles = Array.from({ length: PARTICLE_COUNT }, () =>
        makeParticle(getWidth, getHeight, getMouse),
      );
    };

    let lastFrame = 0;
    const TARGET_FPS = 60;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;

    const animate = (timestamp) => {
      rafId = requestAnimationFrame(animate);
      if (timestamp - lastFrame < FRAME_INTERVAL) return;
      lastFrame = timestamp;
      if (document.hidden) return;
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgba(0,0,0,${PARTICLE_TRAIL})`;
      ctx.fillRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
    };

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        width = container.clientWidth;
        height = container.clientHeight;
        init();
      }, 150);
    };

    let lastMouseMove = 0;
    const onMove = (e) => {
      const now = Date.now();
      if (now - lastMouseMove < 32) return;
      lastMouseMove = now;
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    init();
    rafId = requestAnimationFrame(animate);
    window.addEventListener("resize", onResize, { passive: true });
    container.addEventListener("mousemove", onMove, { passive: true });
    container.addEventListener("mouseleave", onLeave, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, [containerRef]);
  return canvasRef;
}

/* ── Primitives locales ───────────────────────────────────────── */
function Overline({ children, light = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 h-px bg-secondary-container opacity-60" />
      <span className="font-headline font-black text-[11px] uppercase tracking-[0.25em] text-secondary-container">
        {children}
      </span>
    </div>
  );
}

/* ── Page principale ──────────────────────────────────────────── */
export default function Home() {
  const [seg, setSeg] = useState("particulier");
  const [actifPartenaire, setActifPartenaire] = useState(null);
  const active = SEGMENTS.find((s) => s.id === seg);
  const heroRef = useRef(null);
  const canvasRef = useNeuralCanvas(heroRef);

  return (
    <>
      <SEO
        title="Foga-Tech International — Ingénierie BTP de référence au Congo"
        description="Génie civil, bâtiment, génie rural et location d'engins à Brazzaville et Pointe-Noire. +15 chantiers livrés, 98% de satisfaction client depuis 2012."
        canonical="https://foga-tech.tech"
      />

      {/* ══════════════════════════════════════════════════════
          HERO — immersif full-bleed avec Ken Burns + Neural canvas
      ══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col overflow-hidden bg-[#002045]"
      >
        {/* Layer 1 — Ken Burns 5 images (cycle 20s) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {[
            { src: "/hero-bg.webp",   cls: "hb-1", eager: true  },
            { src: "/hero-bg-1.webp", cls: "hb-2", eager: false },
            { src: "/hero-bg-2.webp", cls: "hb-3", eager: false },
            { src: "/hero-bg-3.webp", cls: "hb-4", eager: false },
            { src: "/hero-bg-4.webp", cls: "hb-5", eager: false },
          ].map(({ src, cls, eager }) => (
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden="true"
              loading={eager ? "eager" : "lazy"}
              fetchPriority={eager ? "high" : "auto"}
              className={`hero-bg-img ${cls} absolute inset-0 w-full h-full object-cover opacity-0 contrast-110 saturate-110`}
            />
          ))}
          {/* Voile navy gradient — lisibilité texte */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,32,69,0.85) 0%, rgba(0,32,69,0.25) 50%, rgba(0,13,26,0.35) 100%)",
            }}
          />
        </div>

        {/* Layer 2 — radial glow */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(254,147,44,0.10), transparent 60%),
              radial-gradient(circle at 80% 20%, rgba(37,99,235,0.08), transparent 60%)
            `,
          }}
        />

        {/* Layer 3 — neural canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-[1] w-full h-full pointer-events-none mix-blend-screen opacity-80"
        />

        {/* Layer 4 — content */}
        <div className="relative z-10 flex-1 flex flex-col justify-between max-w-7xl mx-auto w-full px-6 lg:px-12 pt-32 pb-12">
          <div className="max-w-[560px] flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-4 h-px bg-secondary-container" />
              <span className="font-headline font-black text-[10px] uppercase tracking-[0.25em] text-secondary-container">
                BTP Congo-Brazzaville
              </span>
            </div>

            <h1
              className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em] mb-6 animate-fade-slide-up"
              style={{ fontSize: "clamp(52px,7.5vw,100px)" }}
            >
              Concevoir,<br />
              bâtir et livrer<br />
              <span className="text-secondary-container">à temps.</span>
            </h1>

            <p
              className="font-body text-white/70 text-lg leading-relaxed mb-10 animate-fade-slide-up"
              style={{ animationDelay: "150ms" }}
            >
              Bureau d&apos;étude, BTP &amp; ouvrages, génie rural et location
              d&apos;engins. Exécution rigoureuse, délais maîtrisés, suivi
              chantier de bout en bout au Congo.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 mb-10 animate-fade-slide-up"
              style={{ animationDelay: "300ms" }}
            >
              <Link
                to="/devis"
                className="flex items-center justify-center text-center bg-secondary-container text-on-secondary-container font-headline font-black text-[13px] uppercase tracking-[0.18em] px-8 py-4 rounded-full hover:shadow-tectonic-orange hover:-translate-y-px transition-all"
              >
                Démarrer un projet
              </Link>
              <Link
                to="/portfolio"
                className="flex items-center justify-center text-center border border-secondary-container/30 text-white font-headline font-black text-[13px] uppercase tracking-[0.18em] px-8 py-4 rounded-full hover:bg-secondary-container/10 transition-all"
              >
                Explorer nos chantiers
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {["Agrément Ministère BTP", "Garantie décennale", "Agréé ANR", "Réponse < 15 min"].map((b) => (
                <span
                  key={b}
                  className="font-headline font-black text-[10px] uppercase tracking-[0.18em] text-white/60 border border-white/20 px-3 py-1.5 rounded-full"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Stats row — overlay sur image */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 pt-8 mt-12">
            {STATS.map((s) => (
              <div key={s.label}>
                <p
                  className="font-headline font-black text-white leading-none"
                  style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)' }}
                >
                  {s.val}{s.suffix}
                </p>
                <p className="text-white/55 font-body text-[11px] mt-2 leading-tight">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee strip orange */}
        <div className="relative z-10 bg-secondary-container text-on-secondary-container px-16 py-3.5 flex items-center justify-center flex-wrap gap-x-8 gap-y-2 font-headline font-black text-[11px] uppercase tracking-[0.2em] overflow-hidden flex-shrink-0">
          {[
            "★ Devis offert sous 48 h",
            "★ Garantie décennale incluse",
            "★ WhatsApp +242 06 990 56 40",
          ].map((item, i, arr) => (
            <span key={i} className="flex items-center gap-8 flex-shrink-0">
              {item}
              {i < arr.length - 1 && <span className="opacity-40">·</span>}
            </span>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEGMENTATION — onglets Particulier/Entreprise/Collectivité
      ══════════════════════════════════════════════════════ */}
      <section className="pt-24 pb-0 px-6 lg:px-12 bg-surface">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <Overline>Vous êtes</Overline>
            <h2
              className="font-headline font-black text-primary mt-4 leading-none tracking-[-0.02em]"
              style={{ fontSize: "clamp(40px,5vw,64px)" }}
            >
              On vous parle votre langue.
            </h2>
          </div>

          <div className="flex justify-center gap-2 flex-wrap">
            {SEGMENTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSeg(s.id)}
                onMouseEnter={() => setSeg(s.id)}
                onFocus={() => setSeg(s.id)}
                className={cn(
                  "flex items-center gap-2.5 font-headline font-black text-[12px] uppercase tracking-[0.15em] px-7 py-4 border rounded-full transition-all",
                  seg === s.id
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-primary border-outline-variant hover:border-primary",
                )}
              >
                <span
                  className="material-symbols-outlined text-lg"
                  style={{ fontVariationSettings: seg === s.id ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {s.icon}
                </span>
                {s.label}
              </button>
            ))}
          </div>

          <div
            key={seg}
            className="bg-primary text-white grid lg:grid-cols-2 min-h-[380px] mt-8 rounded-2xl overflow-hidden animate-fade-slide-up"
          >
            <div className="p-12 lg:p-14 flex flex-col justify-center">
              <Overline light>{active.label} · Notre offre</Overline>
              <h3 className="font-headline font-black text-white text-4xl leading-tight tracking-[-0.02em] mt-4 mb-3">
                {active.headline}
              </h3>
              <p className="font-body text-white/75 text-base mb-6">{active.promise}</p>
              <ul className="flex flex-col gap-2.5 mb-7">
                {active.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-sm text-white">
                    <span
                      className="material-symbols-outlined text-secondary-container text-lg"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <div className="font-headline font-black text-[10px] uppercase tracking-[0.2em] text-secondary-container border border-secondary-container/40 px-3.5 py-2.5 rounded-full self-start mb-7">
                {active.typical}
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link
                  to={active.devisLink}
                  className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container font-headline font-black text-[12px] uppercase tracking-[0.18em] px-5 py-3.5 hover:shadow-tectonic-orange transition-all rounded-full"
                >
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                    description
                  </span>
                  Devis {active.label}
                </Link>
                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-2 border border-white/25 text-white font-headline font-black text-[12px] uppercase tracking-[0.18em] px-5 py-3.5 rounded-full hover:bg-white/8 transition-all"
                >
                  Réalisations
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </div>
            </div>
            <div className="relative min-h-[320px] overflow-hidden">
              <img
                src={active.image}
                alt={active.label}
                className={`absolute inset-0 w-full h-full object-cover ${active.imagePos || ""}`}
                loading="lazy"
              />
              <span className="absolute top-4 left-4 bg-secondary-container text-on-secondary-container font-headline font-black text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full">
                {active.label}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SERVICES — bento grid
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 lg:px-12 bg-surface">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex justify-between items-end mb-10 flex-wrap gap-6">
            <div>
              <Overline>Notre savoir-faire</Overline>
              <h2
                className="font-headline font-black text-primary mt-4 leading-none tracking-[-0.02em]"
                style={{ fontSize: "clamp(36px,4.5vw,56px)" }}
              >
                Quatre métiers,<br />
                une obsession&nbsp;: livrer.
              </h2>
            </div>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 font-headline font-black text-[11px] uppercase tracking-[0.2em] text-secondary-container hover:underline"
            >
              Toutes nos réalisations
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-5 gap-y-10">
            {SERVICES.map((s) => (
              <Link
                key={s.num}
                to={s.to}
                className="relative h-[280px] overflow-hidden rounded-2xl group block"
              >
                <img
                  src={s.image}
                  alt={s.title}
                  className={`absolute inset-0 w-full h-full object-cover ${s.imagePos || ""} group-hover:scale-105 transition-transform duration-700`}
                  loading="lazy"
                />
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 p-7 flex justify-between items-end backdrop-blur-xl border-t shadow-tectonic-lg",
                    s.kind === "navy"
                      ? "text-white bg-[#002045]/55 border-white/10"
                      : "text-primary bg-white/55 border-black/5",
                  )}
                >
                  <div>
                    <div className="font-headline font-black text-[10px] uppercase tracking-[0.2em] text-secondary-container mb-1.5">
                      {s.num} · Métier
                    </div>
                    <h3 className="font-headline font-black text-2xl leading-snug tracking-[-0.01em] max-w-[320px]">
                      {s.title}
                    </h3>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="font-headline font-black text-4xl text-secondary-container leading-none">
                      {s.chantiers}
                    </div>
                    <div className="font-headline font-black text-[9px] uppercase tracking-[0.2em] opacity-70 mt-0.5">
                      chantiers
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
                  <span className="bg-secondary-container text-on-secondary-container font-headline font-black text-[11px] uppercase tracking-[0.2em] px-4 py-2.5 flex items-center gap-2 rounded-full">
                    Découvrir
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
                <div className="absolute top-5 right-5 w-10 h-10 bg-secondary-container text-on-secondary-container flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    north_east
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Approfondir — sous-services chips */}
          <div className="mt-16 pt-12 border-t border-outline-variant">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-6 h-px bg-secondary-container/60" />
                  <span className="font-label font-bold text-[11px] uppercase tracking-[0.25em] text-secondary-container">
                    Explorer en détail
                  </span>
                </div>
                <h3 className="font-headline font-black text-primary text-2xl md:text-3xl leading-tight">
                  Tous nos pôles d&apos;expertise.
                </h3>
              </div>
              <p className="text-on-surface-variant text-sm max-w-md">
                Chaque pôle a ses sous-services. Cliquez pour découvrir.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {APPROFONDIR.map((p) => (
                <Link
                  key={p.label}
                  to={p.to}
                  className="group inline-flex items-center gap-2 bg-surface-container-lowest border border-outline-variant text-on-surface hover:border-secondary-container hover:bg-secondary-container/10 hover:text-secondary-container px-4 py-2.5 rounded-full font-label font-bold text-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-secondary-container">{p.icon}</span>
                  {p.label}
                  <span className="material-symbols-outlined text-sm text-on-surface-variant/40 group-hover:text-secondary-container group-hover:translate-x-0.5 transition-all">
                    arrow_forward
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PARTENAIRES — marquee scroll
      ══════════════════════════════════════════════════════ */}
      <section className="bg-[#001634] py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-6 h-px bg-[#4A7BC8]/60 flex-shrink-0" />
            <span className="font-label font-bold text-[11px] uppercase tracking-[0.25em] text-[#234998]">
              Ils nous font confiance
            </span>
            <span className="w-6 h-px bg-[#4A7BC8]/60 flex-shrink-0" />
          </div>
          <h2
            className="font-headline font-black text-white leading-tight tracking-[-0.02em]"
            style={{ fontSize: "clamp(28px,4vw,48px)" }}
          >
            Nos partenaires &amp; clients
          </h2>
        </div>

        <div
          className="relative flex overflow-hidden mb-8"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
          onMouseEnter={(e) =>
            e.currentTarget.querySelectorAll(".animate-partners-scroll").forEach((el) => (el.style.animationPlayState = "paused"))
          }
          onMouseLeave={(e) =>
            e.currentTarget.querySelectorAll(".animate-partners-scroll").forEach((el) => (el.style.animationPlayState = "running"))
          }
        >
          {[0, 1].map((loop) => (
            <div key={loop} className="animate-partners-scroll flex flex-shrink-0">
              {PARTENAIRES.map((p) => (
                <button
                  key={`${loop}-${p.id}`}
                  onClick={() => setActifPartenaire(p)}
                  className="flex-shrink-0 group flex items-center gap-3 px-8 py-5 border-r border-white/10 hover:bg-white/[0.04] transition-all duration-300 rounded-full"
                >
                  <span className="font-label font-bold text-xs uppercase tracking-[0.2em] text-white/45 group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                    {p.nom}
                  </span>
                  <span className="material-symbols-outlined text-sm text-[#234998] opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300">
                    open_in_new
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link
            to="/partenaires"
            className="inline-flex items-center gap-2 font-label font-bold text-[11px] uppercase tracking-widest text-[#234998] hover:underline underline-offset-4 transition-all"
          >
            Voir tous nos partenaires
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </section>

      {actifPartenaire && (
        <PartenaireModal
          partenaire={actifPartenaire}
          onClose={() => setActifPartenaire(null)}
        />
      )}

      {/* ══════════════════════════════════════════════════════
          TÉMOIGNAGES — auto-scroll cards chantiers
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-primary text-white overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 mb-12">
          <Overline light>Le terrain parle pour nous</Overline>
          <h2
            className="font-headline font-black text-white mt-4 leading-none tracking-[-0.02em]"
            style={{ fontSize: "clamp(32px,4vw,48px)" }}
          >
            +15 chantiers en image.
          </h2>
        </div>

        <div
          className="relative flex overflow-hidden"
          style={{
            maskImage: "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
          onMouseEnter={(e) =>
            e.currentTarget.querySelectorAll(".animate-partners-scroll").forEach((el) => (el.style.animationPlayState = "paused"))
          }
          onMouseLeave={(e) =>
            e.currentTarget.querySelectorAll(".animate-partners-scroll").forEach((el) => (el.style.animationPlayState = "running"))
          }
        >
          {[0, 1].map((loop) => (
            <div
              key={loop}
              className="animate-partners-scroll flex flex-shrink-0 gap-5 pr-5"
              style={{ animationDirection: "reverse", animationDuration: "15s" }}
            >
              {TESTIMONIALS.map((t) => (
                <article
                  key={`${loop}-${t.name}`}
                  className="group flex-shrink-0 w-[340px] h-[420px] bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden relative"
                >
                  <img
                    src={t.photo}
                    alt={t.project}
                    className="w-full h-full object-cover brightness-90 group-hover:brightness-100 group-hover:scale-105 transition-all duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#002045]/90 via-[#002045]/30 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-6">
                    <span className="font-label font-bold text-[10px] uppercase tracking-[0.2em] text-secondary-container block mb-2">
                      {t.project.split(" · ")[1] || "Chantier"}
                    </span>
                    <h3 className="font-headline font-black text-white text-lg leading-tight">
                      {t.project.split(" · ")[0]}
                    </h3>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </div>
      </section>

      <StickyCTABar />
    </>
  );
}
