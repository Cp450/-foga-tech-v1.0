import { useState } from 'react'
import { api } from '../lib/api'

/* ── Data ──────────────────────────────────────────────────────────── */

const MACHINES_LIST = [
  { id: 'excavatrice', nom: 'Excavatrice / Pelle hydraulique', icon: 'construction' },
  { id: 'bulldozer', nom: 'Bulldozer / Engin de terrassement', icon: 'width_full' },
  { id: 'grue', nom: 'Grue mobile', icon: 'vertical_align_top' },
  { id: 'camion_benne', nom: 'Camion-benne', icon: 'local_shipping' },
  { id: 'compacteur', nom: 'Compacteur / Rouleau', icon: 'speed' },
  { id: 'niveleuse', nom: 'Niveleuse', icon: 'route' },
  { id: 'chargeur', nom: 'Chargeur frontal', icon: 'agriculture' },
]

const STEPS = [
  { label: 'Machines', icon: 'construction' },
  { label: 'Chantier', icon: 'location_on' },
  { label: 'Contact', icon: 'person' },
]

/* ── Style helpers (cohérents avec DemandeDevis.jsx) ─────────────── */

const INPUT_DARK =
  'bg-white/5 border border-white/15 text-white rounded-xl px-5 py-4 w-full focus:border-[#f97316] focus:outline-none font-body text-base placeholder:text-white/40 transition-colors'

/* ── Sous-composant : sélecteur de machine ─────────────────────────── */

function MachineRow({ machine, selected, quantite, avecOperateur, onToggle, onQuantite, onOperateur }) {
  return (
    <div
      className={[
        'rounded-2xl border-2 p-5 transition-all duration-200 cursor-pointer select-none',
        selected
          ? 'border-[#f97316] bg-[#f97316]/10'
          : 'border-white/10 bg-white/5 hover:border-[#f97316]/50 hover:bg-white/10',
      ].join(' ')}
      onClick={() => onToggle(machine.id)}
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggle(machine.id) } }}
    >
      <div className="flex items-center gap-3">
        {/* Checkbox visuel */}
        <div
          className={[
            'flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
            selected
              ? 'border-[#f97316] bg-[#f97316]'
              : 'border-white/30',
          ].join(' ')}
          aria-hidden="true"
        >
          {selected && (
            <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>
              check
            </span>
          )}
        </div>

        {/* Icône + Nom */}
        <span className="material-symbols-outlined text-[#f97316] text-xl flex-shrink-0" aria-hidden="true">
          {machine.icon}
        </span>
        <span className="font-body text-white text-sm flex-1 leading-snug">
          {machine.nom}
        </span>
      </div>

      {/* Contrôles détail (visibles si sélectionné) */}
      {selected && (
        <div
          className="mt-4 flex flex-col sm:flex-row gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quantité */}
          <div className="flex items-center gap-2 flex-1">
            <label
              htmlFor={`qty-${machine.id}`}
              className="font-label text-[11px] uppercase tracking-widest text-white/50 whitespace-nowrap"
            >
              Quantité
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onQuantite(machine.id, Math.max(1, quantite - 1))}
                className="w-8 h-8 rounded-lg border border-white/20 text-white/60 hover:text-white hover:border-white/40 flex items-center justify-center transition-all text-sm font-bold"
                aria-label="Diminuer quantité"
              >
                −
              </button>
              <input
                id={`qty-${machine.id}`}
                type="number"
                min={1}
                max={10}
                value={quantite}
                onChange={(e) => onQuantite(machine.id, Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-12 text-center bg-white/10 border border-white/20 text-white rounded-lg py-1.5 text-sm font-body focus:outline-none focus:border-[#f97316]"
                aria-label={`Quantité de ${machine.nom}`}
              />
              <button
                type="button"
                onClick={() => onQuantite(machine.id, Math.min(10, quantite + 1))}
                className="w-8 h-8 rounded-lg border border-white/20 text-white/60 hover:text-white hover:border-white/40 flex items-center justify-center transition-all text-sm font-bold"
                aria-label="Augmenter quantité"
              >
                +
              </button>
            </div>
          </div>

          {/* Toggle opérateur */}
          <button
            type="button"
            onClick={() => onOperateur(machine.id, !avecOperateur)}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-label font-bold uppercase tracking-widest transition-all',
              avecOperateur
                ? 'border-[#f97316] bg-[#f97316]/20 text-[#f97316]'
                : 'border-white/20 bg-white/5 text-white/50 hover:border-white/40 hover:text-white/80',
            ].join(' ')}
            aria-pressed={avecOperateur}
          >
            <span
              className="material-symbols-outlined text-sm"
              aria-hidden="true"
              style={{ fontVariationSettings: `'FILL' ${avecOperateur ? 1 : 0}` }}
            >
              engineering
            </span>
            Avec opérateur
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Composant principal ───────────────────────────────────────────── */

/**
 * DevisLocationForm
 * Formulaire 3 étapes pour demander un devis de location d'engins BTP.
 * Props : aucune (autonome, gère son propre état local)
 */
export default function DevisLocationForm() {
  const [step, setStep] = useState(1)           // 1 | 2 | 3
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [errors, setErrors] = useState({})

  /* ── Step 1 : machines sélectionnées */
  const [machinesSelected, setMachinesSelected] = useState({})
  // { [id]: { quantite: number, avecOperateur: boolean } }

  /* ── Step 2 : chantier */
  const [chantier, setChantier] = useState({
    dateDebut: '',
    dateFin: '',
    lieuChantier: '',
    accesChantier: '',
  })

  /* ── Step 3 : contact */
  const [contact, setContact] = useState({
    nom: '',
    telephone: '',
    email: '',
    message: '',
  })

  /* ── Helpers ────────────────────────────────────────────────────── */

  function toggleMachine(id) {
    setMachinesSelected((prev) => {
      const next = { ...prev }
      if (next[id]) {
        delete next[id]
      } else {
        next[id] = { quantite: 1, avecOperateur: false }
      }
      return next
    })
    setErrors((e) => ({ ...e, machines: '' }))
  }

  function setQuantite(id, val) {
    setMachinesSelected((prev) => ({
      ...prev,
      [id]: { ...prev[id], quantite: val },
    }))
  }

  function setOperateur(id, val) {
    setMachinesSelected((prev) => ({
      ...prev,
      [id]: { ...prev[id], avecOperateur: val },
    }))
  }

  function setChantierField(key, value) {
    setChantier((c) => ({ ...c, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  function setContactField(key, value) {
    setContact((c) => ({ ...c, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  /* ── Validation ─────────────────────────────────────────────────── */

  function validateStep1() {
    if (Object.keys(machinesSelected).length === 0) {
      setErrors({ machines: 'Sélectionnez au moins une machine pour continuer.' })
      return false
    }
    return true
  }

  function validateStep2() {
    const errs = {}
    if (!chantier.dateDebut) errs.dateDebut = 'La date de début est requise.'
    if (!chantier.dateFin) errs.dateFin = 'La date de fin est requise.'
    if (chantier.dateDebut && chantier.dateFin && chantier.dateDebut >= chantier.dateFin) {
      errs.dateFin = 'La date de fin doit être après la date de début.'
    }
    if (!chantier.lieuChantier.trim()) errs.lieuChantier = 'Le lieu du chantier est requis.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function validateStep3() {
    const errs = {}
    if (!contact.nom.trim()) errs.nom = 'Le nom est requis.'
    if (!contact.telephone.trim()) errs.telephone = 'Le téléphone est requis.'
    if (contact.telephone.trim().replace(/\s/g, '').length < 9) {
      errs.telephone = 'Numéro invalide (min 9 chiffres).'
    }
    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      errs.email = "Format d'email invalide."
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  /* ── Navigation ─────────────────────────────────────────────────── */

  function handleNext() {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep((s) => s + 1)
  }

  function handleBack() {
    setErrors({})
    setStep((s) => s - 1)
  }

  /* ── Submit ─────────────────────────────────────────────────────── */

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validateStep3()) return

    const machines = Object.entries(machinesSelected).map(([id, cfg]) => {
      const machine = MACHINES_LIST.find((m) => m.id === id)
      return {
        nom: machine ? machine.nom : id,
        quantite: cfg.quantite,
        avecOperateur: cfg.avecOperateur,
      }
    })

    const payload = {
      machines,
      dateDebut: chantier.dateDebut,
      dateFin: chantier.dateFin,
      lieuChantier: chantier.lieuChantier,
      ...(chantier.accesChantier.trim() && { accesChantier: chantier.accesChantier }),
      nom: contact.nom,
      telephone: contact.telephone,
      ...(contact.email.trim() && { email: contact.email }),
      ...(contact.message.trim() && { message: contact.message }),
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      await api.post('/api/devis_requests/location', payload)
      setSubmitted(true)
    } catch (err) {
      setSubmitError(
        err?.data?.error || 'Envoi impossible. Réessayez ou contactez-nous sur WhatsApp.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Écran de succès ─────────────────────────────────────────────── */

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-16 px-6">
        <div className="w-20 h-20 rounded-full bg-[#f97316] flex items-center justify-center mb-8">
          <span
            className="material-symbols-outlined text-white text-5xl"
            aria-hidden="true"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check
          </span>
        </div>

        <h2
          className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em] mb-4"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
        >
          Demande envoyée, {contact.nom.split(' ')[0]}&nbsp;!
        </h2>
        <p className="font-body text-white/60 text-base mb-2 leading-relaxed max-w-sm">
          Notre équipe vous rappelle dans les <strong className="text-white">2h ouvrées</strong> pour
          confirmer les disponibilités et établir votre devis.
        </p>

        <a
          href="https://wa.me/242069905640"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-3 bg-[#25D366] text-white font-headline font-black px-8 py-4 rounded-2xl hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
            chat
          </span>
          Discuter sur WhatsApp
        </a>
      </div>
    )
  }

  /* ── Rendu principal ─────────────────────────────────────────────── */

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* ── Progress bar ── */}
      <div className="mb-10">
        {/* Labels des étapes */}
        <div className="flex justify-between mb-3">
          {STEPS.map((s, i) => {
            const n = i + 1
            const isActive = step === n
            const isDone = step > n
            return (
              <div
                key={s.label}
                className={[
                  'flex items-center gap-2 font-label text-[11px] uppercase tracking-widest transition-colors',
                  isDone ? 'text-[#f97316]' : isActive ? 'text-white' : 'text-white/30',
                ].join(' ')}
              >
                <div
                  className={[
                    'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black border-2 transition-all',
                    isDone
                      ? 'bg-[#f97316] border-[#f97316] text-white'
                      : isActive
                      ? 'border-[#f97316] text-[#f97316] bg-transparent'
                      : 'border-white/20 text-white/30 bg-transparent',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {isDone ? (
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check
                    </span>
                  ) : (
                    n
                  )}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            )
          })}
        </div>

        {/* Barre de progression */}
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#f97316] rounded-full transition-all duration-500 ease-out"
            style={{ width: progressPct + '%' }}
            role="progressbar"
            aria-valuenow={step}
            aria-valuemax={STEPS.length}
            aria-label={`Étape ${step} sur ${STEPS.length}`}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* ── STEP 1 — Machines ────────────────────────────────────────── */}
        {step === 1 && (
          <section aria-label="Sélection des machines">
            <h2
              className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em] mb-3"
              style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}
            >
              Quelles machines vous faut-il&nbsp;?
            </h2>
            <p className="font-body text-white/50 text-sm mb-8">
              Sélectionnez les engins, ajustez la quantité et indiquez si vous souhaitez un opérateur.
            </p>

            {errors.machines && (
              <div className="mb-5 flex items-center gap-2 bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-body px-4 py-3 rounded-xl">
                <span className="material-symbols-outlined text-base" aria-hidden="true">error</span>
                {errors.machines}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {MACHINES_LIST.map((machine) => {
                const sel = !!machinesSelected[machine.id]
                const cfg = machinesSelected[machine.id] || { quantite: 1, avecOperateur: false }
                return (
                  <MachineRow
                    key={machine.id}
                    machine={machine}
                    selected={sel}
                    quantite={cfg.quantite}
                    avecOperateur={cfg.avecOperateur}
                    onToggle={toggleMachine}
                    onQuantite={setQuantite}
                    onOperateur={setOperateur}
                  />
                )
              })}
            </div>
          </section>
        )}

        {/* ── STEP 2 — Chantier ────────────────────────────────────────── */}
        {step === 2 && (
          <section aria-label="Informations chantier">
            <h2
              className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em] mb-3"
              style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}
            >
              Votre chantier
            </h2>
            <p className="font-body text-white/50 text-sm mb-8">
              Précisez les dates de location et le lieu d&apos;intervention.
            </p>

            <div className="flex flex-col gap-5">
              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dateDebut" className="block font-label text-[11px] uppercase tracking-widest text-white/55 mb-2">
                    Date de début *
                  </label>
                  <input
                    id="dateDebut"
                    type="date"
                    value={chantier.dateDebut}
                    onChange={(e) => setChantierField('dateDebut', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className={INPUT_DARK + (errors.dateDebut ? ' !border-red-500/70' : '')}
                    aria-describedby={errors.dateDebut ? 'err-dateDebut' : undefined}
                    style={{ colorScheme: 'dark' }}
                  />
                  {errors.dateDebut && (
                    <p id="err-dateDebut" className="text-red-400 text-xs font-body mt-1.5">
                      {errors.dateDebut}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="dateFin" className="block font-label text-[11px] uppercase tracking-widest text-white/55 mb-2">
                    Date de fin *
                  </label>
                  <input
                    id="dateFin"
                    type="date"
                    value={chantier.dateFin}
                    onChange={(e) => setChantierField('dateFin', e.target.value)}
                    min={chantier.dateDebut || new Date().toISOString().split('T')[0]}
                    required
                    className={INPUT_DARK + (errors.dateFin ? ' !border-red-500/70' : '')}
                    aria-describedby={errors.dateFin ? 'err-dateFin' : undefined}
                    style={{ colorScheme: 'dark' }}
                  />
                  {errors.dateFin && (
                    <p id="err-dateFin" className="text-red-400 text-xs font-body mt-1.5">
                      {errors.dateFin}
                    </p>
                  )}
                </div>
              </div>

              {/* Lieu */}
              <div>
                <label htmlFor="lieuChantier" className="block font-label text-[11px] uppercase tracking-widest text-white/55 mb-2">
                  Lieu du chantier *
                </label>
                <input
                  id="lieuChantier"
                  type="text"
                  value={chantier.lieuChantier}
                  onChange={(e) => setChantierField('lieuChantier', e.target.value)}
                  placeholder="Ex: Brazzaville, quartier Poto-Poto"
                  required
                  className={INPUT_DARK + (errors.lieuChantier ? ' !border-red-500/70' : '')}
                  aria-describedby={errors.lieuChantier ? 'err-lieu' : undefined}
                />
                {errors.lieuChantier && (
                  <p id="err-lieu" className="text-red-400 text-xs font-body mt-1.5">
                    {errors.lieuChantier}
                  </p>
                )}
              </div>

              {/* Accès chantier */}
              <div>
                <label htmlFor="accesChantier" className="block font-label text-[11px] uppercase tracking-widest text-white/55 mb-2">
                  Conditions d&apos;accès{' '}
                  <span className="text-white/30 normal-case tracking-normal">(optionnel)</span>
                </label>
                <textarea
                  id="accesChantier"
                  rows={3}
                  value={chantier.accesChantier}
                  onChange={(e) => setChantierField('accesChantier', e.target.value)}
                  placeholder="Ex: Route praticable en saison des pluies, accès étroit, portique de hauteur limitée..."
                  className={INPUT_DARK + ' resize-none'}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── STEP 3 — Contact ─────────────────────────────────────────── */}
        {step === 3 && (
          <section aria-label="Vos coordonnées">
            <h2
              className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em] mb-3"
              style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}
            >
              Vos coordonnées
            </h2>

            {/* Badge réponse sous 2h */}
            <div className="inline-flex items-center gap-2 bg-[#f97316]/15 border border-[#f97316]/30 text-[#f97316] font-label text-[11px] uppercase tracking-widest px-4 py-2 rounded-full mb-8">
              <div className="flex h-2 w-2 relative flex-shrink-0" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#f97316] opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f97316]" />
              </div>
              Réponse sous 2h ouvrées
            </div>

            <div className="flex flex-col gap-5">
              {/* Nom */}
              <div>
                <label htmlFor="nom" className="block font-label text-[11px] uppercase tracking-widest text-white/55 mb-2">
                  Nom complet *
                </label>
                <input
                  id="nom"
                  type="text"
                  autoComplete="name"
                  value={contact.nom}
                  onChange={(e) => setContactField('nom', e.target.value)}
                  placeholder="Votre nom complet"
                  required
                  className={INPUT_DARK + (errors.nom ? ' !border-red-500/70' : '')}
                  aria-describedby={errors.nom ? 'err-nom' : undefined}
                />
                {errors.nom && (
                  <p id="err-nom" className="text-red-400 text-xs font-body mt-1.5">
                    {errors.nom}
                  </p>
                )}
              </div>

              {/* Téléphone */}
              <div>
                <label htmlFor="telephone" className="block font-label text-[11px] uppercase tracking-widest text-white/55 mb-2">
                  Téléphone *
                </label>
                <input
                  id="telephone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={contact.telephone}
                  onChange={(e) => setContactField('telephone', e.target.value)}
                  placeholder="+242 0X XX XX XX"
                  required
                  className={INPUT_DARK + (errors.telephone ? ' !border-red-500/70' : '')}
                  aria-describedby={errors.telephone ? 'err-telephone' : undefined}
                />
                {errors.telephone && (
                  <p id="err-telephone" className="text-red-400 text-xs font-body mt-1.5">
                    {errors.telephone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="relative">
                <label htmlFor="email" className="block font-label text-[11px] uppercase tracking-widest text-white/55 mb-2">
                  Email{' '}
                  <span className="text-white/30 normal-case tracking-normal">(optionnel)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={contact.email}
                  onChange={(e) => setContactField('email', e.target.value)}
                  placeholder="votre@email.com"
                  className={INPUT_DARK + (errors.email ? ' !border-red-500/70' : '')}
                  aria-describedby={errors.email ? 'err-email' : undefined}
                />
                {errors.email && (
                  <p id="err-email" className="text-red-400 text-xs font-body mt-1.5">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block font-label text-[11px] uppercase tracking-widest text-white/55 mb-2">
                  Précisions{' '}
                  <span className="text-white/30 normal-case tracking-normal">(optionnel)</span>
                </label>
                <textarea
                  id="message"
                  rows={3}
                  value={contact.message}
                  onChange={(e) => setContactField('message', e.target.value)}
                  placeholder="Ex: Besoin d'une livraison urgente, chantier en zone humide..."
                  className={INPUT_DARK + ' resize-none'}
                />
              </div>
            </div>

            {/* Erreur d'envoi */}
            {submitError && (
              <div className="mt-5 flex items-start gap-2 bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-body px-4 py-3 rounded-xl">
                <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5" aria-hidden="true">error</span>
                {submitError}
              </div>
            )}
          </section>
        )}

        {/* ── Navigation Précédent / Suivant / Envoyer ─────────────────── */}
        <div className="flex items-center justify-between mt-10 pt-8 border-t border-white/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors font-body text-sm uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_back</span>
              Précédent
            </button>
          ) : (
            <span aria-hidden="true" />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-3 bg-[#f97316] text-white font-headline font-black px-8 py-4 rounded-2xl hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Suivant
              <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-3 text-white font-headline font-black px-8 py-4 rounded-2xl hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #f97316, #e55f00)' }}
            >
              {submitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  Envoi en cours…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base" aria-hidden="true">send</span>
                  Envoyer ma demande
                </>
              )}
            </button>
          )}
        </div>
      </form>

      {/* ── CTA WhatsApp ── */}
      <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-body text-white/35 text-xs leading-relaxed text-center sm:text-left">
          Vous préférez parler directement à notre équipe ?
        </p>
        <a
          href="https://wa.me/242069905640"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-2 bg-[#25D366] text-white font-label font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all"
        >
          <span
            className="material-symbols-outlined text-sm"
            aria-hidden="true"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            chat
          </span>
          WhatsApp
        </a>
      </div>
    </div>
  )
}
