import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

const API_URL = import.meta.env.VITE_API_URL || "";

/* ── Data ──────────────────────────────────────────────────────────────────── */

const PROFILES = [
  {
    id: "Un particulier",
    key: "A",
    icon: "account_circle",
    label: "Un particulier",
    desc: "Villa, rénovation, aménagement privé",
  },
  {
    id: "Une entreprise",
    key: "B",
    icon: "corporate_fare",
    label: "Une entreprise",
    desc: "Entrepôt, siège, infrastructure logistique",
  },
  {
    id: "Une institution",
    key: "C",
    icon: "account_balance",
    label: "Une institution",
    desc: "Marché public, école, route, génie rural",
  },
];

const TRAVAUX = [
  { id: "BTP / Gros oeuvre", icon: "construction", label: "BTP / Gros oeuvre" },
  { id: "Voirie & VRD", icon: "route", label: "Voirie & VRD" },
  { id: "Genie Rural", icon: "agriculture", label: "Génie Rural" },
  { id: "Location d'engins", icon: "local_shipping", label: "Location d'engins" },
  { id: "Energie & Industrie", icon: "bolt", label: "Énergie & Industrie" },
  { id: "Hydraulique", icon: "water_drop", label: "Hydraulique" },
];

const VILLES = [
  "Brazzaville",
  "Pointe-Noire",
  "Dolisie",
  "Ouésso",
  "Impfondo",
  "Madingou",
  "Autre",
];

/* ── Styles helpers ────────────────────────────────────────────────────────── */

const INPUT_DARK =
  "bg-white/5 border border-white/15 text-white rounded-xl px-5 py-4 w-full focus:border-secondary-container focus:outline-none font-body text-lg placeholder:text-white/55 transition-colors";

/* Select a besoin d'un fond solide (transparent = options OS blanc illisible) */
const SELECT_DARK =
  "border border-white/15 text-white rounded-xl px-5 py-4 w-full focus:border-secondary-container focus:outline-none font-body text-lg transition-colors appearance-none";

/* ── WhatsApp message builder ──────────────────────────────────────────────── */

function buildWaMsg(form) {
  const sep = "_____________________________";
  const lieu = [form.zone, form.ville].filter(Boolean).join(", ") || "—";
  return encodeURIComponent(
    "*DEMANDE DE DEVIS*\n" +
    "_Foga-Tech International · Congo-Brazzaville_\n" +
    sep + "\n\n" +
    "*Demandeur*\n" +
    "Prenom  : " + (form.prenom || "—") + "\n" +
    "Tel     : " + (form.tel || "—") + "\n\n" +
    "*Projet*\n" +
    "Profil  : " + (form.profile || "—") + "\n" +
    "Travaux : " + (form.categorie || "—") + "\n\n" +
    "*Localisation*\n" +
    "Lieu    : " + lieu + "\n\n" +
    (form.description
      ? "*Description*\n" + form.description + "\n\n"
      : "") +
    sep + "\n" +
    "_Envoye via foga-tech.com/devis_"
  );
}

/* ── Tile component ────────────────────────────────────────────────────────── */

function Tile({ selected, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border-2 p-8 text-left cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-container/50",
        selected
          ? "border-secondary-container ring-2 ring-secondary-container/30 bg-secondary-container/10"
          : "border-white/10 bg-white/5 hover:border-secondary-container hover:bg-white/10",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* ── Main component ────────────────────────────────────────────────────────── */

const STORAGE_KEY = "fogatech_devis_draft_v1";
const STORAGE_TTL = 24 * 60 * 60 * 1000; // 24h

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !data.savedAt || Date.now() - data.savedAt > STORAGE_TTL) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function saveDraft(form, question, reference) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      form, question, reference, savedAt: Date.now(),
    }));
  } catch { /* quota or disabled — silent */ }
}

function clearDraft() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* silent */ }
}

export default function DemandeDevis() {
  const formRef = useRef(null);
  const draft = useRef(loadDraft()).current;

  const [question, setQuestion] = useState(draft?.question ?? 0); // 0..5
  const [form, setForm] = useState(draft?.form ?? {
    profile: "",
    categorie: "",
    ville: "",
    zone: "",
    prenom: "",
    tel: "",
    email: "",
    description: "",
  });
  const [direction, setDirection] = useState("forward");
  const [animating, setAnimating] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  // Reference stable pour cette session (recap + backend) — restaurée si draft existe
  const reference = useRef(
    draft?.reference ||
    "DV-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000))
  ).current;

  // Auto-save draft à chaque modif form/question
  useEffect(() => {
    if (question === 6) return; // post-submit — pas de sauvegarde
    saveDraft(form, question, reference);
  }, [form, question, reference]);

  function setField(key, value) {
    setError("");
    setForm((f) => ({ ...f, [key]: value }));
  }

  /* ── Validation par étape ── */
  function validate(step) {
    switch (step) {
      case 0:
        if (!form.profile) { setError("Sélectionnez votre profil pour continuer."); return false; }
        return true;
      case 1:
        if (!form.categorie) { setError("Choisissez un type de travaux."); return false; }
        return true;
      case 2:
        if (!form.ville) { setError("Sélectionnez une ville."); return false; }
        if (!form.zone.trim()) { setError("Précisez le quartier ou la zone du chantier."); return false; }
        return true;
      case 3:
        if (!form.prenom.trim()) { setError("Entrez votre prénom."); return false; }
        if (!form.tel.trim()) { setError("Entrez votre numéro de téléphone."); return false; }
        if (form.tel.trim().replace(/\s/g, "").length < 9) {
          setError("Numéro de téléphone invalide (min 9 chiffres).");
          return false;
        }
        return true;
      case 4:
        if (!form.description.trim()) { setError("Décrivez brièvement votre projet pour continuer."); return false; }
        if (form.description.trim().length < 10) { setError("Description trop courte — ajoutez quelques mots."); return false; }
        return true;
      default:
        return true;
    }
  }

  const goTo = useCallback(
    (next) => {
      if (animating) return;
      setError("");
      setDirection(next > question ? "forward" : "back");
      setAnimating(true);
      setTimeout(() => {
        setQuestion(next);
        setAnimating(false);
      }, 400);
    },
    [animating, question]
  );

  function advance() {
    if (!validate(question)) return;
    if (question < 5) goTo(question + 1);
  }

  function goBack() {
    if (question > 0) goTo(question - 1);
  }

  /* Keyboard shortcuts */
  useEffect(() => {
    function handleKey(e) {
      /* Q1 — A/B/C to select profile */
      if (question === 0) {
        const map = { a: "Un particulier", b: "Une entreprise", c: "Une institution" };
        const val = map[e.key.toLowerCase()];
        if (val) {
          setField("profile", val);
          setTimeout(() => goTo(1), 400);
          return;
        }
      }
      /* Q2 — A-F to select travaux */
      if (question === 1) {
        const keys = ["a", "b", "c", "d", "e", "f"];
        const idx = keys.indexOf(e.key.toLowerCase());
        if (idx !== -1 && TRAVAUX[idx]) {
          setField("categorie", TRAVAUX[idx].id);
          setTimeout(() => goTo(2), 400);
          return;
        }
      }
      if (e.key === "Enter") advance();
      if (e.key === "Backspace" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
        goBack();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, form]);

  /* Submit logic — vérifie que les champs requis sont remplis */
  async function handleSubmit() {
    // Trouver la première étape incomplète et y retourner
    const steps = [
      { step: 0, check: () => !!form.profile },
      { step: 1, check: () => !!form.categorie },
      { step: 2, check: () => !!form.ville && !!form.zone.trim() },
      { step: 3, check: () => !!form.prenom.trim() && !!form.tel.trim() },
      { step: 4, check: () => form.description.trim().length >= 10 },
    ];
    for (const { step, check } of steps) {
      if (!check()) {
        goTo(step);
        setTimeout(() => validate(step), 500);
        return;
      }
    }

    setSubmitting(true);
    setSubmitError("");

    let ok = false;
    try {
      const res = await fetch((API_URL || "") + "/api/devis_requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          nom: form.prenom,
          reference: reference.replace(/^DV-/, ""),
        }),
      });
      const data = await res.json().catch(() => ({}));
      ok = res.ok && data.success !== false;
      if (!ok) setSubmitError(data.error || "Envoi impossible. Réessayez ou contactez-nous sur WhatsApp.");
    } catch {
      setSubmitError("Connexion impossible. Vérifiez votre réseau.");
    } finally {
      setSubmitting(false);
    }

    if (ok) {
      clearDraft();
      goTo(6);
    }
  }

  /* Progress bar width — 6 écrans au total (Q0→Q5 recap→Q6 confirmation) */
  const progress = (question / 6) * 100;

  /* Animation classes */
  const slideClass = animating
    ? direction === "forward"
      ? "-translate-x-8 opacity-0"
      : "translate-x-8 opacity-0"
    : "translate-x-0 opacity-100";

  return (
    <div className="relative bg-[#001022] text-white">
      <SEO
        title="Demander un devis BTP — Foga-Tech International"
        description="Obtenez un devis offert sous 48 h pour votre projet BTP au Congo-Brazzaville. Construction, génie civil, génie rural, location d'engins — ingénieur terrain dédié."
        canonical="https://foga-tech.tech/devis"
      />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative h-[88vh] min-h-[540px] overflow-hidden flex flex-col">
        {/* Background image */}
        <img
          src="/arriere_plan_devis.webp"
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.45) saturate(1.15)" }}
        />

        {/* Gradient overlay — navy vers bas pour transition douce */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,16,34,0.55) 0%, rgba(0,16,34,0.4) 40%, rgba(0,16,34,0.92) 85%, #001022 100%)",
          }}
        />

        {/* Orange accent line top */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: "linear-gradient(to right, transparent, #FF6B00, transparent)" }}
        />

        {/* Content — centré horizontalement */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
          {/* Overline */}
          <div className="flex items-center gap-3 mb-6">
            <span className="w-4 h-px bg-secondary-container" />
            <span className="font-headline font-black text-[10px] uppercase tracking-[0.25em] text-secondary-container">
              Devis offert sous 48 h
            </span>
            <span className="w-4 h-px bg-secondary-container" />
          </div>

          {/* Headline */}
          <h1
            className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em] mb-8 animate-fade-slide-up whitespace-nowrap"
            style={{ fontSize: "clamp(2.5rem, 6vw, 90px)" }}
          >
            Votre projet, <span className="text-secondary-container">livré.</span>
          </h1>

          {/* CTA scroll to form */}
          <button
            type="button"
            onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="group inline-flex items-center gap-3 bg-secondary-container text-on-secondary-container font-headline font-black px-8 py-4 rounded-full text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all animate-fade-slide-up"
            style={{ animationDelay: "150ms" }}
          >
            Demander mon devis
            <span className="material-symbols-outlined text-base group-hover:translate-y-0.5 transition-transform">
              expand_more
            </span>
          </button>
        </div>

        {/* Scroll chevron */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <span className="material-symbols-outlined text-white text-2xl">keyboard_arrow_down</span>
        </div>
      </section>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-white/10">
        <div
          className="h-full bg-secondary-container transition-all duration-500 ease-out"
          style={{ width: progress + "%" }}
          role="progressbar"
          aria-valuenow={question}
          aria-valuemax={5}
          aria-label="Progression du formulaire"
        />
      </div>

      {/* Bandeau erreur */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 backdrop-blur-sm text-white text-sm font-body px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-slide-up">
          <span className="material-symbols-outlined text-base" aria-hidden="true">error</span>
          {error}
        </div>
      )}

      {/* Questions container */}
      <div
        ref={formRef}
        className={"flex flex-col items-center justify-center min-h-screen px-6 py-24 transition-all duration-400 ease-out " + slideClass}
      >

        {/* ── Q0 — Profil ──────────────────────────────────────────────────── */}
        {question === 0 && (
          <section className="w-full max-w-4xl">
            <h1
              className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em] text-center mb-12"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              Votre projet, c&apos;est pour...
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PROFILES.map((p) => (
                <Tile
                  key={p.id}
                  selected={form.profile === p.id}
                  onClick={() => {
                    setField("profile", p.id);
                    setTimeout(() => goTo(1), 400);
                  }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <span className="material-symbols-outlined text-4xl text-secondary-container">
                      {p.icon}
                    </span>
                    <span className="text-xs font-headline font-black text-white/55 border border-white/20 rounded-md px-2 py-0.5">
                      {p.key}
                    </span>
                  </div>
                  <p className="font-headline font-black text-xl text-white mb-2">
                    {p.label}
                  </p>
                  <p className="font-body text-sm text-white/50 leading-relaxed">
                    {p.desc}
                  </p>
                </Tile>
              ))}
            </div>
          </section>
        )}

        {/* ── Q1 — Type de travaux ─────────────────────────────────────────── */}
        {question === 1 && (
          <section className="w-full max-w-3xl">
            <h1
              className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em] text-center mb-12"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              Quel type de travaux&nbsp;?
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {TRAVAUX.map((t, i) => {
                const keys = ["A", "B", "C", "D", "E", "F"];
                return (
                  <Tile
                    key={t.id}
                    selected={form.categorie === t.id}
                    onClick={() => {
                      setField("categorie", t.id);
                      setTimeout(() => goTo(2), 400);
                    }}
                    className="flex flex-col items-center text-center py-8 px-4"
                  >
                    <div className="flex items-start justify-end w-full mb-2">
                      <span className="text-xs font-headline font-black text-white/55 border border-white/20 rounded-md px-1.5 py-0.5">
                        {keys[i]}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-3xl text-secondary-container mb-3">
                      {t.icon}
                    </span>
                    <p className="font-body text-sm text-white/80 leading-snug">
                      {t.label}
                    </p>
                  </Tile>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Q2 — Localisation ────────────────────────────────────────────── */}
        {question === 2 && (
          <section className="w-full max-w-lg">
            <h1
              className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em] text-center mb-3"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              Votre chantier est...
            </h1>
            <p className="font-body text-white/50 text-center text-lg mb-10">
              où exactement&nbsp;?
            </p>
            <div className="flex flex-col gap-4">
              <select
                value={form.ville}
                onChange={(e) => setField("ville", e.target.value)}
                className={SELECT_DARK}
                style={{ backgroundColor: "#0a1628", color: form.ville ? "#fff" : "rgba(255,255,255,0.35)" }}
                aria-label="Ville du chantier"
              >
                <option value="" style={{ backgroundColor: "#0a1628", color: "rgba(255,255,255,0.45)" }}>
                  Sélectionnez une ville…
                </option>
                {VILLES.map((v) => (
                  <option key={v} value={v} style={{ backgroundColor: "#0a1628", color: "#fff" }}>
                    {v}
                  </option>
                ))}
              </select>
              <input
                type="text"
                autoComplete="address-level2"
                value={form.zone}
                onChange={(e) => setField("zone", e.target.value)}
                placeholder="Quartier, zone ou commune..."
                className={INPUT_DARK + (error && !form.zone.trim() ? " !border-red-500/70" : "")}
                aria-label="Quartier ou zone"
              />
            </div>
            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={advance}
                className="bg-secondary-container text-on-secondary-container font-headline font-black px-8 py-4 rounded-2xl hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-widest"
              >
                Continuer →
              </button>
            </div>
          </section>
        )}

        {/* ── Q3 — Contact ─────────────────────────────────────────────────── */}
        {question === 3 && (
          <section className="w-full max-w-lg">
            <h1
              className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em] text-center mb-3"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              On se rappelle comment&nbsp;?
            </h1>
            <p className="font-body text-white/50 text-center text-lg mb-10">
              Juste l&apos;essentiel — on n&apos;envoie pas de spam.
            </p>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                autoComplete="given-name"
                value={form.prenom}
                onChange={(e) => setField("prenom", e.target.value)}
                placeholder="Votre prénom"
                required
                className={INPUT_DARK + (error && !form.prenom.trim() ? " !border-red-500/70" : "")}
                aria-label="Prénom"
              />
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={form.tel}
                onChange={(e) => setField("tel", e.target.value)}
                placeholder="+242 0X XX XX XX"
                required
                className={INPUT_DARK + (error && !form.tel.trim() ? " !border-red-500/70" : "")}
                aria-label="Téléphone"
              />
              <div className="relative">
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="Email (optionnel — pour recevoir votre récap)"
                  className={INPUT_DARK}
                  aria-label="Email (optionnel)"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-xs font-body">
                  Optionnel
                </span>
              </div>
            </div>
            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={advance}
                className="bg-secondary-container text-on-secondary-container font-headline font-black px-8 py-4 rounded-2xl hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-widest"
              >
                Continuer →
              </button>
            </div>
          </section>
        )}

        {/* ── Q4 — Description (optionnel) ─────────────────────────────────── */}
        {question === 4 && (
          <section className="w-full max-w-lg">
            <h1
              className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em] text-center mb-3"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              Un mot sur votre projet&nbsp;?
            </h1>
            <p className="font-body text-white/50 text-center text-lg mb-10">
              Optionnel — décrivez en quelques mots votre besoin.
            </p>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Ex: Construction d'un hangar de 1500 m² à Brazzaville, livraison avant juillet..."
              className={INPUT_DARK + " resize-none" + (error && !form.description.trim() ? " !border-red-500/70" : "")}
              aria-label="Description du projet"
            />
            <p className="text-white/55 text-xs font-body mt-2 text-right">
              {form.description.trim().length} / min 10 caractères
            </p>
            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={advance}
                className="bg-secondary-container text-on-secondary-container font-headline font-black px-8 py-4 rounded-2xl hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-widest"
              >
                Vérifier →
              </button>
            </div>
          </section>
        )}

        {/* ── Q5 — Récapitulatif PDF ───────────────────────────────────────── */}
        {question === 5 && (() => {
          const now = new Date();
          const ref = reference;
          const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
          const validStr = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
            .toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

          const lignes = [
            { desc: form.categorie || "—", detail: form.profile || "—" },
            { desc: "Localisation chantier", detail: [form.zone, form.ville].filter(Boolean).join(", ") || "—" },
          ];

          return (
          <section className="w-full max-w-xl">
            <p className="font-label font-bold text-[10px] uppercase tracking-[0.25em] text-white/55 mb-4 text-center">
              Vérifiez avant envoi — vous pouvez modifier chaque champ
            </p>

            {/* ── Feuille blanche flottante ── */}
            <div
              className="mb-6"
              style={{
                background: "#fff",
                borderRadius: "6px",
                boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              {/* Bandeau orange top */}
              <div style={{ height: "4px", background: "linear-gradient(90deg,#FF6B00,#E55A00)", borderRadius: "6px 6px 0 0" }} />

              {/* Header logo + titre */}
              <div className="flex items-start justify-between px-8 pt-7 pb-5" style={{ borderBottom: "1px solid #e8ecf0" }}>
                {/* Logo zone */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <img src="/icon_logo_entreprise.svg" alt="Foga-Tech" style={{ height: 28, width: "auto" }} />
                    <img src="/logo_entreprise_2.svg" alt="Foga-Tech BTP" style={{ height: 22, width: "auto" }} />
                  </div>
                  <p style={{ fontSize: 10, color: "#8a96a3", lineHeight: 1.6 }}>
                    Foga-Tech International · Congo-Brazzaville<br />
                    Tél : +242 06 990 56 40 / 06 990 56 40<br />
                    contact@foga-tech.com · foga-tech.com
                  </p>
                </div>

                {/* Titre devis */}
                <div className="text-right">
                  <p style={{ fontWeight: 900, fontSize: 20, color: "#001022", letterSpacing: "-0.03em", lineHeight: 1 }}>
                    DEVIS — {ref}
                  </p>
                  <p style={{ fontSize: 10, color: "#8a96a3", marginTop: 4 }}>Date : {dateStr}</p>
                  <p style={{ fontSize: 10, color: "#8a96a3" }}>Validité : {validStr}</p>
                </div>
              </div>

              {/* Bloc client + société */}
              <div className="grid px-8 py-5" style={{ gridTemplateColumns: "1fr 1fr", gap: "2rem", borderBottom: "1px solid #e8ecf0" }}>
                {/* Émetteur */}
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: "#8a96a3", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                    De
                  </p>
                  <p style={{ fontWeight: 700, fontSize: 12, color: "#001022" }}>Foga-Tech International</p>
                  <p style={{ fontSize: 11, color: "#4a5568", lineHeight: 1.6 }}>
                    Brazzaville, Congo<br />
                    +242 06 990 56 40 / 06 990 56 40<br />
                    contact@foga-tech.com
                  </p>
                </div>
                {/* Client */}
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: "#8a96a3", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                    Demandeur
                  </p>
                  <p style={{ fontWeight: 700, fontSize: 12, color: "#001022" }}>
                    {form.prenom || "—"}
                  </p>
                  <p style={{ fontSize: 11, color: "#4a5568", lineHeight: 1.6 }}>
                    {form.tel || "—"}<br />
                    {form.email && <>{form.email}<br /></>}
                    {form.profile || "—"}
                  </p>
                  {/* Modifier client */}
                  <button type="button" onClick={() => goTo(3)}
                    style={{ fontSize: 9, color: "#FF6B00", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4, cursor: "pointer", background: "none", border: "none", padding: 0 }}>
                    ✎ Modifier
                  </button>
                </div>
              </div>

              {/* Tableau prestations */}
              <div className="px-8 py-5">
                {/* Entête table */}
                <div className="grid" style={{
                  gridTemplateColumns: "2fr 1fr 1fr",
                  paddingBottom: 6,
                  borderBottom: "2px solid #001022",
                  marginBottom: 0,
                }}>
                  {["Description", "Localisation", "Profil"].map((h) => (
                    <p key={h} style={{ fontSize: 9, fontWeight: 700, color: "#001022", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</p>
                  ))}
                </div>

                {/* Lignes */}
                {lignes.map((l, i) => (
                  <div key={i} className="grid" style={{
                    gridTemplateColumns: "2fr 1fr 1fr",
                    padding: "10px 0",
                    borderBottom: "1px solid #e8ecf0",
                    alignItems: "start",
                  }}>
                    <p style={{ fontSize: 11, color: "#1a2535", fontWeight: 600, overflowWrap: "anywhere", wordBreak: "break-word", paddingRight: 12 }}>{l.desc}</p>
                    <p style={{ fontSize: 11, color: "#4a5568", overflowWrap: "anywhere", wordBreak: "break-word", paddingRight: 12 }}>{i === 0 ? ([form.zone, form.ville].filter(Boolean).join(", ") || "—") : l.detail}</p>
                    <p style={{ fontSize: 11, color: "#4a5568", overflowWrap: "anywhere", wordBreak: "break-word" }}>{i === 0 ? (form.profile || "—") : "—"}</p>
                  </div>
                ))}

                {/* Description projet */}
                {form.description && (
                  <div style={{ marginTop: 12, padding: "10px 12px", background: "#f7f9fb", borderRadius: 4, borderLeft: "3px solid #FF6B00", overflow: "hidden" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "#8a96a3", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Description du projet</p>
                    <p style={{ fontSize: 11, color: "#4a5568", lineHeight: 1.6, overflowWrap: "anywhere", wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{form.description}</p>
                    <button type="button" onClick={() => goTo(4)}
                      style={{ fontSize: 9, color: "#FF6B00", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 6, cursor: "pointer", background: "none", border: "none", padding: 0 }}>
                      ✎ Modifier
                    </button>
                  </div>
                )}
              </div>

              {/* Zone signature */}
              <div className="px-8 py-5" style={{ borderTop: "1px solid #e8ecf0" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#001022", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                  Confirmation du demandeur
                </p>
                <p style={{ fontSize: 9, color: "#8a96a3", fontStyle: "italic", marginBottom: 10, lineHeight: 1.6 }}>
                  En soumettant cette demande, le demandeur certifie l&apos;exactitude des informations
                  renseignées et autorise Foga-Tech International à les traiter dans le cadre de
                  l&apos;établissement d&apos;un devis personnalisé.
                </p>
                <div style={{ height: 28, borderBottom: "1px solid #cbd5e0" }} />
              </div>

              {/* Footer document */}
              <div style={{ background: "#f7f9fb", borderTop: "1px solid #e8ecf0", borderRadius: "0 0 6px 6px", padding: "12px 32px", textAlign: "center" }}>
                <p style={{ fontSize: 9, color: "#a0aab4" }}>
                  Foga-Tech International · Brazzaville, Congo · +242 06 990 56 40 / 06 990 56 40 · contact@foga-tech.com · foga-tech.com
                </p>
              </div>
            </div>

            {/* Send CTA */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 text-on-secondary-container font-headline font-black px-8 py-5 rounded-2xl hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #FF6B00, #e55f00)" }}
            >
              {submitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  Envoi en cours…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl" aria-hidden="true">send</span>
                  Envoyer ma demande
                </>
              )}
            </button>
            {submitError && (
              <p className="text-center text-red-300 text-xs font-body mt-3">{submitError}</p>
            )}

            <p className="text-center text-white/20 text-[11px] font-body mt-4">
              {ref} · foga-tech.com
            </p>
          </section>
          );
        })()}

        {/* ── Q6 — Confirmation ────────────────────────────────────────────── */}
        {question === 6 && (
          <section className="w-full max-w-md flex flex-col items-center text-center">
            {/* Success icon */}
            <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center mb-8 animate-pulse">
              <span className="material-symbols-outlined text-on-secondary-container text-5xl" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
            </div>

            <h1
              className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em] mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            >
              Demande envoyée{form.prenom ? ", " + form.prenom : ""}&nbsp;!
            </h1>
            <p className="font-body text-white/60 text-lg mb-3 leading-relaxed">
              Votre demande a été transmise à notre équipe.
              {form.email && (
                <span className="block text-sm text-white/40 mt-1">
                  Un récapitulatif a été envoyé à <span className="text-secondary-container">{form.email}</span>
                </span>
              )}
            </p>
            <p className="font-body text-white/40 text-sm mb-10 leading-relaxed">
              Réf. <span className="text-secondary-container font-bold">{reference}</span> — réponse sous 48 h ouvrées.
            </p>

            <a
              href={"https://wa.me/242069905640?text=" + buildWaMsg(form)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] text-white font-headline font-black px-10 py-5 rounded-2xl hover:brightness-110 active:scale-95 transition-all text-base uppercase tracking-widest mb-6"
            >
              Discuter sur WhatsApp →
            </a>

            <Link
              to="/"
              className="font-body text-sm text-white/55 hover:text-white/60 transition-colors underline underline-offset-4"
            >
              Retour à l&apos;accueil
            </Link>
          </section>
        )}
      </div>

      {/* Back button — visible Q1→Q5 (récap), masqué sur Q0 et Q6 confirmation */}
      {question > 0 && question < 6 && (
        <button
          type="button"
          onClick={goBack}
          className="fixed bottom-8 left-6 text-white/55 hover:text-white transition-colors text-xs uppercase tracking-widest font-body"
          aria-label="Question précédente"
        >
          ← Retour
        </button>
      )}

      {/* Keyboard hint — Q0 et Q1 seulement */}
      {(question === 0 || question === 1) && (
        <p className="fixed bottom-8 right-6 text-white/20 text-xs font-body">
          A / B / C pour sélectionner
        </p>
      )}
    </div>
  );
}
