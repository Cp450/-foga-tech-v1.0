import { useState, useMemo } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG = "#001022";
const BG_CARD = "rgba(255,255,255,0.04)";
const BG_CARD_ACTIVE = "rgba(255,107,0,0.12)";
const ORANGE = "#FF6B00";
const BORDER = "rgba(255,255,255,0.08)";
const BORDER_ACTIVE = "#FF6B00";

// ─── Data ─────────────────────────────────────────────────────────────────────
const TYPES_CONSTRUCTION = [
  {
    id: "villa_std",
    label: "Villa standard",
    icon: "home",
    basMin: 80000,
    basMax: 150000,
    desc: "R+0 ou R+1 · Finitions standard",
  },
  {
    id: "villa_prem",
    label: "Villa premium",
    icon: "villa",
    basMin: 150000,
    basMax: 300000,
    desc: "R+2 · Piscine possible · Haut de gamme",
  },
  {
    id: "immeuble",
    label: "Immeuble bureaux",
    icon: "apartment",
    basMin: 100000,
    basMax: 200000,
    desc: "R+2 à R+5 · Climatisation · Fibre",
  },
  {
    id: "commercial",
    label: "Local commercial",
    icon: "storefront",
    basMin: 70000,
    basMax: 130000,
    desc: "Boutique, entrepôt, marché",
  },
  {
    id: "route",
    label: "Route / Voirie",
    icon: "route",
    basMin: 20000,
    basMax: 50000,
    desc: "Prix au m² de chaussée bitumée",
  },
  {
    id: "ecole",
    label: "Établissement scolaire",
    icon: "school",
    basMin: 70000,
    basMax: 120000,
    desc: "Salles de classe, administration",
  },
];

/* Aligné exactement avec ENGINS_DATA de la page Location — prix sur devis */
const ENGINS_LOCATION = [
  { id: "poclain-320",   label: "Poclain 320",           icon: "construction",       categorie: "Terrassement", desc: "Excavation, fouilles profondes · Caterpillar" },
  { id: "tractopelle",   label: "Tractopelle",            icon: "agriculture",        categorie: "Terrassement", desc: "Chargement + creusement · Caterpillar" },
  { id: "chargeur",      label: "Chargeur sur pneus",     icon: "agriculture",        categorie: "Terrassement", desc: "Manutention matériaux, chargement camions" },
  { id: "bulldozer-d6",  label: "Bulldozer D6",           icon: "width_full",         categorie: "Nivellement",  desc: "Nivellement de masse, déblaiement · Caterpillar" },
  { id: "niveleuse",     label: "Niveleuse",              icon: "route",              categorie: "Nivellement",  desc: "Profilage routes, pistes · Caterpillar" },
  { id: "benne-15",      label: "Camion benne 15 m³",     icon: "local_shipping",     categorie: "Transport",    desc: "Évacuation déblais, transport matériaux · Mercedes" },
  { id: "benne-20",      label: "Camion benne 20 m³",     icon: "local_shipping",     categorie: "Transport",    desc: "Chantiers grande échelle · MAN" },
  { id: "plateau",       label: "Camion plateau 30 T",    icon: "view_in_ar",         categorie: "Transport",    desc: "Transport engins et structures · Renault Trucks" },
  { id: "camion-grue",   label: "Camion grue",            icon: "vertical_align_top", categorie: "Levage",       desc: "Levage mobile autonome · Liebherr" },
  { id: "toupie",        label: "Toupie béton",           icon: "blender",            categorie: "Bétonnage",    desc: "Béton prêt à l'emploi · Liebherr" },
  { id: "betoniere",     label: "Bétonnière",             icon: "blender",            categorie: "Bétonnage",    desc: "Production béton sur chantier · Imer" },
  { id: "pompe-beton",   label: "Pompe à béton",          icon: "water_pump",         categorie: "Bétonnage",    desc: "Distribution béton en hauteur · Putzmeister" },
];

function formatFCFA(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M FCFA`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k FCFA`;
  return `${n} FCFA`;
}

// ─── Shared input style ───────────────────────────────────────────────────────
const darkInputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "white",
  borderRadius: "12px",
  padding: "14px 16px",
  fontSize: "1rem",
  width: "100%",
  outline: "none",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function CalculateurBudget() {
  const [typeId, setTypeId] = useState("villa_std");
  const [surface, setSurface] = useState(200);
  const [etage, setEtage] = useState(1);
  const [engins, setEngins] = useState(new Set());

  const typeConst = TYPES_CONSTRUCTION.find((t) => t.id === typeId);

  /* Toggle simple — sélection/désélection, pas de jours (prix sur devis) */
  const toggleEngin = (id) => {
    setEngins((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const budget = useMemo(() => {
    const surfTotal = surface * Math.max(1, etage);
    const constMin = typeConst ? surfTotal * typeConst.basMin : 0;
    const constMax = typeConst ? surfTotal * typeConst.basMax : 0;
    return { constMin, constMax };
  }, [typeConst, surface, etage]);

  const selectedEngins = ENGINS_LOCATION.filter((e) => engins.has(e.id));

  const waMsg = encodeURIComponent(
    `Bonjour, j'ai utilisé le calculateur Foga-Tech BTP.\n` +
    `Type : ${typeConst?.label}\n` +
    `Surface : ${surface}m² × ${etage} niveau(x)\n` +
    `Estimation construction : ${formatFCFA(budget.constMin)} – ${formatFCFA(budget.constMax)}\n` +
    (selectedEngins.length
      ? `Engins souhaités :\n${selectedEngins.map((e) => `• ${e.nom || e.label} (${e.categorie})`).join("\n")}\n`
      : "") +
    `Je souhaite un devis précis.`,
  );

  return (
    <section style={{ background: BG }} className="min-h-screen pt-24 pb-20 px-4">
      {/* ── Header ── */}
      <div className="max-w-6xl mx-auto mb-14 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="w-6 h-px" style={{ background: ORANGE }} />
          <span
            className="font-label font-black text-[10px] uppercase tracking-[0.25em]"
            style={{ color: ORANGE }}
          >
            Outil exclusif · Foga-Tech
          </span>
          <span className="w-6 h-px" style={{ background: ORANGE }} />
        </div>
        <h2
          className="font-headline font-black text-white leading-none tracking-tight mb-3"
          style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)" }}
        >
          Calculateur <span style={{ color: ORANGE }}>Budget</span>
        </h2>
        <p className="font-body text-white/50 text-sm">
          Estimez votre projet en 30 secondes · Construction + location engins
        </p>
      </div>

      {/* ── Main grid ── */}
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_360px] gap-8">
        {/* ── Left column — inputs ── */}
        <div className="space-y-10">
          {/* Step 1 — Type de construction */}
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-[0.2em] mb-4"
              style={{ color: ORANGE }}
            >
              1. Type de construction
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TYPES_CONSTRUCTION.map((t) => {
                const active = typeId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTypeId(t.id)}
                    className="relative text-left rounded-2xl p-5 cursor-pointer transition-all"
                    style={{
                      background: active ? BG_CARD_ACTIVE : BG_CARD,
                      border: `1px solid ${active ? BORDER_ACTIVE : BORDER}`,
                    }}
                  >
                    {active && (
                      <span
                        className="absolute top-3 right-3 w-2 h-2 rounded-full"
                        style={{ background: ORANGE }}
                      />
                    )}
                    <span
                      className="material-symbols-outlined block mb-3"
                      style={{
                        fontSize: "2rem",
                        color: active ? ORANGE : "white",
                      }}
                      aria-hidden="true"
                    >
                      {t.icon}
                    </span>
                    <div
                      className="font-bold text-sm leading-tight mb-1"
                      style={{ color: "white" }}
                    >
                      {t.label}
                    </div>
                    <div
                      className="text-[10px] leading-snug"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                      {t.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2 — Surface & niveaux */}
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-[0.2em] mb-4"
              style={{ color: ORANGE }}
            >
              2. Surface &amp; niveaux
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="calc-surface"
                  className="block text-xs mb-2"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Surface RDC (m²)
                </label>
                <input
                  id="calc-surface"
                  type="number"
                  min={20}
                  max={10000}
                  step={10}
                  value={surface}
                  onChange={(e) =>
                    setSurface(Math.max(20, Math.min(10000, Number(e.target.value))))
                  }
                  style={darkInputStyle}
                />
              </div>
              <div>
                <label
                  htmlFor="calc-etage"
                  className="block text-xs mb-2"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Niveaux (R+…)
                </label>
                <input
                  id="calc-etage"
                  type="number"
                  min={1}
                  max={10}
                  value={etage}
                  onChange={(e) =>
                    setEtage(Math.max(1, Math.min(10, Number(e.target.value))))
                  }
                  style={darkInputStyle}
                />
              </div>
            </div>
            <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.4)" }}>
              Surface totale :{" "}
              <span style={{ color: ORANGE, fontWeight: 700 }}>
                {surface * Math.max(1, etage)} m²
              </span>
            </p>
          </div>

          {/* Step 3 — Location engins */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: ORANGE }}>
                3. Location engins (optionnel)
              </p>
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                Prix sur devis · sélectionnez vos besoins
              </span>
            </div>

            {/* Groupes par catégorie */}
            {["Terrassement","Nivellement","Transport","Levage","Bétonnage"].map((cat) => {
              const groupe = ENGINS_LOCATION.filter((e) => e.categorie === cat);
              return (
                <div key={cat} className="mb-5">
                  <p className="text-[9px] uppercase tracking-[0.2em] mb-2 font-bold" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {cat}
                  </p>
                  <div className="space-y-2">
                    {groupe.map((e) => {
                      const sel = engins.has(e.id);
                      return (
                        <div
                          key={e.id}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer"
                          style={{
                            background: sel ? BG_CARD_ACTIVE : BG_CARD,
                            border: `1px solid ${sel ? BORDER_ACTIVE : BORDER}`,
                          }}
                          onClick={() => toggleEngin(e.id)}
                        >
                          <span
                            className="material-symbols-outlined flex-shrink-0"
                            style={{ fontSize: "1.25rem", color: sel ? ORANGE : "rgba(255,255,255,0.4)" }}
                            aria-hidden="true"
                          >
                            {e.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold" style={{ color: "white" }}>
                              {e.label}
                            </div>
                            <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                              {e.desc}
                            </div>
                          </div>
                          {/* Sur devis badge */}
                          <span
                            className="flex-shrink-0 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{
                              background: sel ? "rgba(255,107,0,0.2)" : "rgba(255,255,255,0.06)",
                              color: sel ? ORANGE : "rgba(255,255,255,0.3)",
                            }}
                          >
                            Sur devis
                          </span>
                          {/* Toggle circle */}
                          <div
                            className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all"
                            style={{
                              background: sel ? ORANGE : "transparent",
                              borderColor: sel ? ORANGE : "rgba(255,255,255,0.2)",
                            }}
                          >
                            {sel && (
                              <span
                                className="material-symbols-outlined text-white"
                                style={{ fontSize: "12px", fontVariationSettings: "'FILL' 1" }}
                                aria-hidden="true"
                              >
                                check
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right column — Live budget ── */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,107,0,0.2)",
              borderRadius: "1.5rem",
              padding: "2rem",
            }}
          >
            {/* Pulse header */}
            <div className="flex items-center gap-2 mb-6">
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0"
                style={{ background: ORANGE }}
              />
              <p
                className="text-[10px] uppercase tracking-widest font-bold"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Estimation temps réel
              </p>
            </div>

            {/* Construction range */}
            <div className="mb-4">
              <p
                className="text-xs mb-1"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Construction
              </p>
              <p className="text-white font-bold text-sm">
                {formatFCFA(budget.constMin)} –{" "}
                {formatFCFA(budget.constMax)}
              </p>
              <p
                className="text-[10px] mt-0.5"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {surface * Math.max(1, etage)} m² ×{" "}
                {typeConst?.basMin?.toLocaleString("fr-FR")} –{" "}
                {typeConst?.basMax?.toLocaleString("fr-FR")} FCFA/m²
              </p>
            </div>

            {/* Engins sélectionnés — sur devis */}
            {selectedEngins.length > 0 && (
              <div
                className="mb-4 pb-4 pt-4 space-y-2"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p
                  className="text-[10px] uppercase tracking-wider mb-2"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Location engins sélectionnés
                </p>
                {selectedEngins.map((engin) => (
                  <div key={engin.id} className="flex justify-between items-center">
                    <span
                      className="text-xs flex items-center gap-1"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "13px" }} aria-hidden="true">
                        {engin.icon}
                      </span>
                      {engin.label}
                    </span>
                    <span
                      className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(255,107,0,0.15)", color: ORANGE }}
                    >
                      Sur devis
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Prix location
                  </span>
                  <span className="text-sm font-bold" style={{ color: ORANGE }}>
                    Sur devis
                  </span>
                </div>
              </div>
            )}

            {/* Total */}
            <div
              className="pt-4 mb-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p
                className="text-xs uppercase tracking-wider mb-2"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Total estimé
              </p>
              <p
                style={{
                  fontSize: "clamp(1.8rem,4vw,2.8rem)",
                  color: ORANGE,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {formatFCFA(budget.constMin)}
              </p>
              <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                jusqu&apos;à {formatFCFA(budget.constMax)}
                {selectedEngins.length > 0 && " · + engins sur devis"}
              </p>
            </div>

            {/* Disclaimer */}
            <p
              className="text-[10px] leading-relaxed mb-6"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              * Estimation indicative. Devis précis offert sous 48 h après visite
              technique. Inclut main-d&apos;œuvre, matériaux locaux et direction de
              travaux.
            </p>

            {/* CTA WhatsApp */}
            <a
              href={`https://wa.me/242069905640?text=${waMsg}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full font-bold py-4 rounded-full text-white transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg,#25d366 0%,#128c7e 100%)",
              }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Envoyer mon estimation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
