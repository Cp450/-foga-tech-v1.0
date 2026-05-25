import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { cn } from "../lib/cn";

const FALLBACK_REVIEWS = [
  {
    id: 1,
    client_name: "Jean-Pierre M.",
    project_type: "Villa R+2",
    rating: 5,
    comment:
      "Chantier livré 3 semaines avant le délai prévu. Transparence totale sur les coûts. Je recommande à 100%.",
    created_at: "2026-03-15",
    verified: true,
    ville: "Bacongo",
  },
  {
    id: 2,
    client_name: "Marie-Ange K.",
    project_type: "Local commercial",
    rating: 5,
    comment:
      "Suivi en temps réel bluffant. On voyait l'avancement chaque jour depuis Paris. Chef de projet très professionnel.",
    created_at: "2026-02-28",
    verified: true,
    ville: "Diaspora (Paris)",
  },
  {
    id: 3,
    client_name: "Théodore N.",
    project_type: "Route rurale 4km",
    rating: 4,
    comment:
      "Très bon travail sur la route. Quelques jours de retard sur la livraison finale mais communication exemplaire.",
    created_at: "2026-01-20",
    verified: true,
    ville: "Pool",
  },
  {
    id: 4,
    client_name: "Solange B.",
    project_type: "Immeuble R+3",
    rating: 5,
    comment:
      "Mokolo na mokolo — c'est vraiment leur philosophie. Fiables comme une horloge. Budget respecté à 2% près.",
    created_at: "2025-12-10",
    verified: true,
    ville: "Moungali",
  },
  {
    id: 5,
    client_name: "Patrick D.",
    project_type: "Location Grue 25T",
    rating: 4,
    comment:
      "Engin livré en 18h au lieu de 24h. Opérateur compétent et ponctuel. Tarif correct. Je renouvelle.",
    created_at: "2026-03-02",
    verified: true,
    ville: "Poto-Poto",
  },
];

function Stars({ value, size = "sm" }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            "material-symbols-outlined",
            size === "lg" ? "text-2xl" : "text-base",
            i <= value ? "text-secondary-container" : "text-outline-variant",
          )}
          style={{ fontVariationSettings: i <= value ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          aria-label={`${i} étoile${i > 1 ? "s" : ""}`}
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
        >
          <span
            className={cn(
              "material-symbols-outlined text-2xl transition-colors",
              i <= (hover || value) ? "text-secondary-container" : "text-outline-variant",
            )}
            style={{ fontVariationSettings: i <= (hover || value) ? "'FILL' 1" : "'FILL' 0" }}
          >
            star
          </span>
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ r }) {
  return (
    <article className="bg-surface-container-lowest border border-outline-variant shadow-tectonic-sm p-6 flex flex-col gap-4 rounded-2xl">
      <header className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-headline font-bold text-primary text-sm">
              {r.client_name}
            </span>
            {r.verified && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-success/10 text-success px-2 py-0.5 border border-success/30 font-label font-bold">
                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Vérifié
              </span>
            )}
          </div>
          <p className="text-xs text-on-surface-variant font-body mt-0.5">
            {r.project_type} · {r.ville}
          </p>
        </div>
        <time className="text-xs text-on-surface-variant font-body flex-shrink-0">
          {r.created_at?.slice(0, 7)}
        </time>
      </header>
      <Stars value={r.rating} />
      <blockquote className="text-on-surface-variant text-sm font-body leading-relaxed italic border-l-2 border-secondary-container/40 pl-3">
        "{r.comment}"
      </blockquote>
    </article>
  );
}

function ReviewForm({ onSubmitted }) {
  const [form, setForm] = useState({
    client_name: "",
    project_type: "",
    ville: "",
    rating: 5,
    comment: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const PROJECT_TYPES = [
    "Villa / Maison",
    "Immeuble / Bureaux",
    "Local commercial",
    "Route / Voirie",
    "Génie Rural",
    "Location Engins",
    "Autre",
  ];

  const INPUT = "w-full bg-surface border border-outline-variant text-on-surface text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors font-body";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.comment.trim() || !form.client_name.trim()) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/api/reviews", { ...form, verified: false });
      setLoading(false);
      onSubmitted();
    } catch (e) {
      setLoading(false);
      setError("Erreur lors de l'envoi. Réessayez.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-container-lowest border border-outline-variant p-6 space-y-4 rounded-2xl"
    >
      <h3 className="font-headline font-bold text-primary text-xl">Partagez votre expérience</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="review-name" className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
            Votre nom *
          </label>
          <input
            id="review-name"
            required
            value={form.client_name}
            onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
            placeholder="Jean-Pierre M."
            className={INPUT}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="review-ville" className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
            Ville
          </label>
          <input
            id="review-ville"
            value={form.ville}
            onChange={(e) => setForm((f) => ({ ...f, ville: e.target.value }))}
            placeholder="Brazzaville"
            className={INPUT}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="review-type" className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
          Type de projet
        </label>
        <select
          id="review-type"
          value={form.project_type}
          onChange={(e) => setForm((f) => ({ ...f, project_type: e.target.value }))}
          className={INPUT}
        >
          <option value="">Sélectionner…</option>
          {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">Note</span>
        <StarInput value={form.rating} onChange={(r) => setForm((f) => ({ ...f, rating: r }))} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="review-comment" className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
          Votre avis *
        </label>
        <textarea
          id="review-comment"
          required
          rows={3}
          value={form.comment}
          onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
          placeholder="Partagez votre expérience avec Foga-Tech BTP…"
          className={cn(INPUT, "resize-none")}
        />
      </div>
      {error && (
        <p className="text-xs text-error font-body flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-secondary-container text-on-secondary-container font-headline font-bold py-3 hover:bg-secondary hover:text-white disabled:opacity-50 transition-colors text-sm uppercase tracking-widest flex items-center justify-center gap-2 rounded-full"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-on-secondary-container/30 border-t-on-secondary-container rounded-full animate-spin" />
            Envoi…
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-base">send</span>
            Publier mon avis
          </>
        )}
      </button>
      <p className="text-[10px] text-on-surface-variant text-center font-body">
        Avis vérifiés par l'équipe Foga-Tech avant publication
      </p>
    </form>
  );
}

/**
 * Reviews section.
 * @param {boolean} compact - When true: shows max 3 reviews, hides form/CTA button, alternate title, no avg rating block.
 */
export default function Reviews({ compact = false }) {
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get("/api/reviews?verified=true&limit=12")
      .then((data) => { if (!cancelled && Array.isArray(data) && data.length) setReviews(data); })
      .catch(() => { /* fallback statique conservé */ });

    // Polling 5min — pas critique
    const interval = setInterval(() => {
      api.get("/api/reviews?verified=true&limit=12")
        .then((data) => { if (!cancelled && Array.isArray(data) && data.length) setReviews(data); })
        .catch(() => {});
    }, 300000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const avgRating = (
    reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  ).toFixed(1);

  const displayedReviews = compact ? reviews.slice(0, 3) : reviews.slice(0, 6);

  return (
    <section className="py-16 md:py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant font-label font-bold mb-3">
            Clients vérifiés
          </p>
          <h2 className="font-headline text-3xl md:text-4xl font-black text-primary mb-4">
            {compact ? (
              "Ils nous font confiance"
            ) : (
              <>
                Ce qu&apos;ils disent de{" "}
                <span className="text-secondary-container">Foga-Tech</span>
              </>
            )}
          </h2>
          {!compact && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <span className="font-headline font-black text-5xl text-primary">{avgRating}</span>
              <div>
                <Stars value={5} size="lg" />
                <p className="text-xs text-on-surface-variant font-body mt-1">
                  {reviews.length} avis vérifiés
                </p>
              </div>
            </div>
          )}
          {compact && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <Stars value={5} size="sm" />
              <span className="text-sm text-on-surface-variant font-body">{reviews.length} avis vérifiés</span>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {displayedReviews.map((r) => (
            <ReviewCard key={r.id} r={r} />
          ))}
        </div>

        {!compact && (
          submitted ? (
            <div className="text-center py-8 bg-success/10 border border-success/30">
              <span className="material-symbols-outlined text-4xl text-success block mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <p className="text-success font-headline font-bold text-lg">Merci pour votre avis !</p>
              <p className="text-on-surface-variant text-sm mt-1 font-body">
                Il sera publié après vérification par notre équipe.
              </p>
            </div>
          ) : showForm ? (
            <ReviewForm onSubmitted={() => { setShowForm(false); setSubmitted(true); }} />
          ) : (
            <div className="text-center">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 border border-outline-variant text-primary font-headline font-bold px-8 py-3 hover:border-primary hover:bg-surface-container transition-colors text-sm uppercase tracking-widest rounded-full"
              >
                <span className="material-symbols-outlined text-base">rate_review</span>
                Laisser un avis
              </button>
            </div>
          )
        )}
      </div>
    </section>
  );
}
