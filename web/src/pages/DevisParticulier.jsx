import { useState } from 'react'
import { Link } from 'react-router-dom'
import CalculateurBudget from '../components/CalculateurBudget'
import SEO from '../components/SEO'


const API_URL = import.meta.env.VITE_API_URL || ''

const PROJECT_TYPES = [
  { id: 'maison_individuelle', icon: 'home', label: 'Construction Maison', sub: 'Clé en main' },
  { id: 'terrain', icon: 'landscape', label: 'Terrain', sub: 'Achat & Aménagement' },
  { id: 'renovation', icon: 'format_paint', label: 'Rénovation', sub: 'Réhabilitation' },
  { id: 'immeuble', icon: 'domain', label: 'Immeuble', sub: 'R+2 à R+6' },
]

const VILLES = ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Ouesso', 'Autre localite']

const STYLES = [
  'Moderne & Minimaliste',
  'Contemporain Colonial',
  'Villa Méditerranéenne',
  'Standard Foga-Tech',
]

const DELAIS = ['Dès que possible', 'Dans 3-6 mois', "Dans l'année"]

const TRUST = [
  { icon: 'verified', title: 'Expertise Locale', desc: 'Connaissance parfaite des sols du Congo.' },
  { icon: 'gavel', title: 'Garantie Décennale', desc: 'Sécurité et sérénité sur 10 ans.' },
  { icon: 'headset_mic', title: 'Accompagnement', desc: 'Un interlocuteur unique dédié.' },
]

const REALISATIONS = [
  { city: 'Pointe-Noire', title: 'Villa Atlantique F6', wide: true, img: '/segment-particulier.webp' },
  { city: 'Brazzaville', title: 'Résidence Plateau', wide: false, img: '/batiment-tertiaire.webp' },
  { city: 'Kintélé', title: 'Aménagement Intérieur F4', wide: false, img: '/portfolio-mayanga.webp' },
  { city: 'Brazzaville', title: 'Complexe Résidentiel Moungali', wide: true, img: '/portfolio-hub-agricole.webp' },
]

export default function DevisParticulier() {
  const [form, setForm] = useState({
    project_type: 'maison_individuelle',
    localisation: '',
    quartier: '',
    surface: '',
    pieces: '',
    style: STYLES[0],
    budget: '',
    delai: DELAIS[0],
    nom: '',
    tel: '',
    email: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function validate() {
    if (!form.nom.trim()) return 'Le nom est requis.'
    if (!form.tel.trim()) return 'Le téléphone est requis.'
    if (!form.localisation) return 'La ville est requise.'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) {
      setSubmitError(err)
      return
    }
    setSubmitting(true)
    setSubmitError('')

    try {
      const res = await fetch(`${API_URL}/api/devis_requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: 'particulier',
          categorie: form.project_type,
          ville: form.localisation,
          quartier: form.quartier,
          surface: form.surface,
          budget: form.budget,
          description: `Pièces: ${form.pieces}, Style: ${form.style}, Délai: ${form.delai}`,
          nom: form.nom,
          tel: form.tel,
          email: form.email,
        }),
      })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}))
        console.error('API error:', error)
        setSubmitError(
          "Erreur lors de l'enregistrement. Votre message WhatsApp sera quand même envoyé.",
        )
      }
    } catch (err) {
      console.error('Network error:', err)
      setSubmitError(
        "Erreur réseau. Votre message WhatsApp sera quand même envoyé.",
      )
    }

    setSubmitting(false)
    const waMsg = encodeURIComponent(
      `*DEVIS PARTICULIER — Foga-Tech BTP*\n` +
      `_____________________________\n\n` +
      `*Demandeur*\n` +
      `Nom    : ${form.nom}\n` +
      `Tel    : ${form.tel}\n` +
      `Email  : ${form.email}\n\n` +
      `*Projet*\n` +
      `Type    : ${form.project_type}\n` +
      `Surface : ${form.surface} m2 — ${form.pieces} pieces\n` +
      `Style   : ${form.style}\n` +
      `Budget  : ${form.budget} FCFA\n` +
      `Delai   : ${form.delai}\n\n` +
      `*Localisation*\n` +
      `${form.quartier}, ${form.localisation}\n` +
      `_____________________________`
    )
    window.open(`https://wa.me/242069610635?text=${waMsg}`, '_blank')
  }

  return (
    <main className="bg-[#001022] text-white font-body">
      <SEO
        title="Devis particulier — Villa, rénovation, construction"
        description="Estimez le budget de votre projet BTP avec notre calculateur en ligne. Villa, rénovation, immeuble — réponse indicative immédiate."
        canonical="https://foga-tech.com/devis-particulier"
      />

      <CalculateurBudget />

      {/* Hero */}
      <section className="relative bg-primary py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-primary/60" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 -skew-x-12 translate-x-1/2 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 mb-5">
              <Link to="/" className="text-white/55 text-[11px] font-headline font-black uppercase tracking-[0.2em] hover:text-white transition-colors">
                Accueil
              </Link>
              <span className="text-white/55 text-[11px]" aria-hidden="true">/</span>
              <span className="text-secondary-container text-[11px] font-headline font-black uppercase tracking-[0.2em]">
                Devis Particulier
              </span>
            </nav>
            <span className="inline-block px-4 py-1.5 bg-secondary-container text-on-secondary-container font-label text-xs font-bold tracking-widest uppercase mb-6 rounded-full">
              Particuliers
            </span>
            <h1 className="text-5xl md:text-6xl font-headline font-extrabold text-white tracking-tighter leading-tight mb-6">
              Demande de Devis<br />Particulier
            </h1>
            <p className="text-on-primary-container text-xl max-w-xl font-medium leading-relaxed">
              Configurez votre projet de vie avec Foga-Tech. De la fondation à la remise des clés,
              bâtissons ensemble votre avenir au Congo.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-full aspect-video shadow-2xl border-4 border-white/10 overflow-hidden rounded-2xl">
              <img
                src="/segment-particulier.webp"
                alt="Maison individuelle — Foga-Tech BTP"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Form card */}
      <section className="max-w-5xl mx-auto -mt-8 px-6 pb-24 relative z-20">
        <div className="bg-surface-container-lowest shadow-2xl p-8 md:p-12 rounded-2xl">
          <form onSubmit={handleSubmit} noValidate className="space-y-12">

            {/* 01 — Type de projet */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="w-8 h-8 flex items-center justify-center bg-primary text-white font-bold text-sm">
                  01
                </span>
                <h2 className="text-2xl font-headline font-bold text-primary">Type de Projet</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {PROJECT_TYPES.map((pt) => (
                  <label
                    key={pt.id}
                    className={`relative flex flex-col p-6 cursor-pointer border-2 transition-all ${
                      form.project_type === pt.id
                        ? 'border-secondary bg-secondary/5'
                        : 'border-transparent bg-surface-container hover:border-secondary'
                    } rounded-2xl`}
                  >
                    <input
                      type="radio"
                      name="project_type"
                      value={pt.id}
                      checked={form.project_type === pt.id}
                      onChange={() => set('project_type', pt.id)}
                      className="sr-only"
                    />
                    <span className="material-symbols-outlined text-3xl mb-3 text-secondary">
                      {pt.icon}
                    </span>
                    <span className="font-bold text-primary block mb-1 text-sm">{pt.label}</span>
                    <span className="text-xs text-on-surface-variant font-medium uppercase tracking-tight">
                      {pt.sub}
                    </span>
                    {form.project_type === pt.id && (
                      <span
                        className="absolute top-3 right-3 material-symbols-outlined text-secondary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* 02 + 03 — Localisation & Détails */}
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 flex items-center justify-center bg-primary text-white font-bold text-sm">
                    02
                  </span>
                  <h2 className="text-2xl font-headline font-bold text-primary">Localisation</h2>
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="localisation"
                    className="text-xs font-bold text-on-surface-variant uppercase tracking-wider"
                  >
                    Ville du Projet *
                  </label>
                  <select
                    id="localisation"
                    value={form.localisation}
                    onChange={(e) => set('localisation', e.target.value)}
                    className="w-full bg-surface-container-high border-none px-4 py-4 text-primary text-sm outline-none font-body focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Sélectionner...</option>
                    {VILLES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="quartier"
                    className="text-xs font-bold text-on-surface-variant uppercase tracking-wider"
                  >
                    Quartier / Zone
                  </label>
                  <input
                    id="quartier"
                    type="text"
                    autoComplete="address-level2"
                    value={form.quartier}
                    onChange={(e) => set('quartier', e.target.value)}
                    placeholder="Ex: Mpila, Talangai, Centre-ville..."
                    className="w-full bg-surface-container-high border-none px-4 py-4 text-primary text-sm outline-none font-body focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 flex items-center justify-center bg-primary text-white font-bold text-sm">
                    03
                  </span>
                  <h2 className="text-2xl font-headline font-bold text-primary">Détails Techniques</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="surface"
                      className="text-xs font-bold text-on-surface-variant uppercase tracking-wider"
                    >
                      Surface (m2)
                    </label>
                    <input
                      id="surface"
                      type="number"
                      value={form.surface}
                      onChange={(e) => set('surface', e.target.value)}
                      placeholder="200"
                      min="0"
                      className="w-full bg-surface-container-high border-none px-4 py-4 text-primary text-sm outline-none font-body focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="pieces"
                      className="text-xs font-bold text-on-surface-variant uppercase tracking-wider"
                    >
                      Pièces
                    </label>
                    <input
                      id="pieces"
                      type="number"
                      value={form.pieces}
                      onChange={(e) => set('pieces', e.target.value)}
                      placeholder="4"
                      min="0"
                      className="w-full bg-surface-container-high border-none px-4 py-4 text-primary text-sm outline-none font-body focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="style"
                    className="text-xs font-bold text-on-surface-variant uppercase tracking-wider"
                  >
                    Style Architectural
                  </label>
                  <select
                    id="style"
                    value={form.style}
                    onChange={(e) => set('style', e.target.value)}
                    className="w-full bg-surface-container-high border-none px-4 py-4 text-primary text-sm outline-none font-body focus:ring-2 focus:ring-primary"
                  >
                    {STYLES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 04 + 05 — Budget & Délai */}
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 flex items-center justify-center bg-primary text-white font-bold text-sm">
                    04
                  </span>
                  <h2 className="text-2xl font-headline font-bold text-primary">Budget Estimé</h2>
                </div>
                <div className="p-6 bg-surface-container-low rounded-2xl">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="budget"
                      className="text-xs font-bold text-on-surface-variant uppercase tracking-wider"
                    >
                      Montant (FCFA)
                    </label>
                    <input
                      id="budget"
                      type="text"
                      value={form.budget}
                      onChange={(e) => set('budget', e.target.value)}
                      placeholder="Ex: 50 000 000"
                      className="w-full bg-surface-container-lowest border-none px-4 py-4 text-center font-bold text-primary text-sm outline-none font-body focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                  <div className="flex justify-between mt-4">
                    <span className="text-xs font-bold text-on-surface-variant uppercase">5M FCFA</span>
                    <span className="text-xs font-bold text-on-surface-variant uppercase">500M+ FCFA</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 flex items-center justify-center bg-primary text-white font-bold text-sm">
                    05
                  </span>
                  <h2 className="text-2xl font-headline font-bold text-primary">Délai Souhaité</h2>
                </div>
                <div className="space-y-3">
                  {DELAIS.map((d) => (
                    <label
                      key={d}
                      className="flex items-center gap-3 p-3 bg-surface-container-low hover:bg-surface-container-high cursor-pointer transition-colors rounded-2xl"
                    >
                      <input
                        type="radio"
                        name="delai"
                        value={d}
                        checked={form.delai === d}
                        onChange={() => set('delai', d)}
                        className="w-5 h-5 accent-secondary"
                      />
                      <span className="font-medium text-primary text-sm">{d}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 06 — Coordonnées */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="w-8 h-8 flex items-center justify-center bg-primary text-white font-bold text-sm">
                  06
                </span>
                <h2 className="text-2xl font-headline font-bold text-primary">Vos Coordonnées</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { k: 'nom', label: 'Nom complet *', type: 'text', placeholder: 'Jean Moukoko' },
                  { k: 'tel', label: 'Téléphone *', type: 'tel', placeholder: '+242 06 --- ---' },
                  { k: 'email', label: 'Email', type: 'email', placeholder: 'vous@exemple.com' },
                ].map((f) => (
                  <div key={f.k} className="flex flex-col gap-2">
                    <label
                      htmlFor={f.k}
                      className="text-xs font-bold text-on-surface-variant uppercase tracking-wider"
                    >
                      {f.label}
                    </label>
                    <input
                      id={f.k}
                      type={f.type}
                      value={form[f.k]}
                      onChange={(e) => set(f.k, e.target.value)}
                      placeholder={f.placeholder}
                      className="bg-surface-container-high border-none border-b-2 border-transparent focus:border-primary px-4 py-4 text-sm outline-none transition-all font-body rounded-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Trust indicators */}
            <div className="pt-8 border-t border-outline-variant/30 grid grid-cols-1 md:grid-cols-3 gap-6">
              {TRUST.map((t) => (
                <div key={t.title} className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-secondary">{t.icon}</span>
                  <div>
                    <h4 className="font-bold text-primary text-sm uppercase">{t.title}</h4>
                    <p className="text-xs text-on-surface-variant">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Error */}
            {submitError && (
              <div className="p-4 bg-error-container border border-error/30 flex items-start gap-3">
                <span className="material-symbols-outlined text-error text-lg mt-0.5 flex-shrink-0">
                  error
                </span>
                <p className="text-sm text-on-error-container font-body">{submitError}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="group px-12 py-5 bg-primary text-white font-black font-headline text-lg uppercase tracking-widest hover:bg-secondary transition-all shadow-xl flex items-center gap-4 disabled:opacity-50 rounded-full"
              >
                {submitting ? 'Envoi en cours...' : 'Soumettre ma demande'}
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>

          </form>
        </div>
      </section>

      {/* Réalisations */}
      <section className="bg-surface-container-low py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-primary mb-4 tracking-tight">
              Réalisations Foga-Tech
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto font-body">
              Inspirez-vous de nos derniers projets réalisés pour des particuliers au Congo-Brazzaville.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {REALISATIONS.map((r) => (
              <div
                key={r.title}
                className={`relative overflow-hidden group shadow-lg ${r.wide ? 'md:col-span-2' : ''}`}
              >
                <img
                  src={r.img}
                  alt={r.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex flex-col justify-end p-6 md:p-8">
                  <span className="text-secondary font-bold text-sm uppercase tracking-widest mb-2">
                    {r.city}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-white font-headline">{r.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
