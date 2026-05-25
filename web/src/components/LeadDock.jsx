import { useState } from 'react'
import { cn } from '../lib/cn'

export default function LeadDock() {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ nom: '', besoin: '', tel: '' })

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="fixed top-[460px] right-0 z-40 flex items-stretch hidden lg:flex">
      {/* Tab handle */}
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'bg-secondary-container text-on-secondary-container font-headline font-black text-[11px] uppercase tracking-[0.25em]',
          'flex items-center gap-2 px-2 py-4',
          '[writing-mode:vertical-rl] rotate-180',
          open ? 'h-auto' : 'h-[220px]',
        )}
        aria-label={open ? 'Fermer' : 'Être rappelé'}
      >
        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
          {open ? 'close' : 'phone_callback'}
        </span>
        {open ? 'Fermer' : 'Rappel 15 min'}
      </button>

      {/* Panel */}
      {open && (
        <div className="w-80 bg-white shadow-tectonic-lg border-t-[3px] border-secondary-container p-6 animate-fade-slide-up rounded-2xl">
          {!submitted ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-6 h-px bg-secondary-container/60" />
                <span className="font-headline font-black text-[10px] uppercase tracking-[0.25em] text-secondary-container">
                  Rappel gratuit
                </span>
              </div>
              <h3 className="font-headline font-black text-xl text-primary leading-tight mb-1">
                On vous rappelle<br />sous 15&nbsp;min.
              </h3>
              <p className="font-body text-[13px] text-on-surface-variant mb-4">
                Lun–Sam, 8h–18h. Aucune obligation, devis offert.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                <DockField
                  icon="badge"
                  placeholder="Votre nom"
                  autoComplete="name"
                  value={form.nom}
                  onChange={v => setForm(f => ({ ...f, nom: v }))}
                />
                <DockField
                  icon="construction"
                  placeholder="Votre besoin (1 ligne)"
                  autoComplete="off"
                  value={form.besoin}
                  onChange={v => setForm(f => ({ ...f, besoin: v }))}
                />
                <DockField
                  icon="call"
                  placeholder="+242 06 XXX XX XX"
                  autoComplete="tel"
                  value={form.tel}
                  onChange={v => setForm(f => ({ ...f, tel: v }))}
                  type="tel"
                />
                <button
                  type="submit"
                  className="mt-1.5 flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-container font-headline font-black text-[12px] uppercase tracking-[0.18em] px-5 py-4"
                >
                  Être rappelé
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </form>

              <div className="flex items-center gap-2 mt-3.5 pt-3.5 border-t border-outline-variant text-[11px] text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">lock</span>
                Vos données restent au Congo. RGPD-friendly.
              </div>
            </>
          ) : (
            <div className="text-center py-5">
              <div className="w-14 h-14 mx-auto mb-4 bg-success flex items-center justify-center rounded-full">
                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              </div>
              <h3 className="font-headline font-black text-xl text-primary mb-2">
                Bien reçu, {form.nom || 'merci'}&nbsp;!
              </h3>
              <p className="font-body text-[13px] text-on-surface-variant">
                Un chargé d'affaires vous contacte dans les 15 prochaines minutes.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DockField({ icon, onChange, ...rest }) {
  return (
    <label className="flex items-center gap-2.5 border border-outline-variant px-3.5 py-3 bg-surface focus-within:border-primary transition-colors rounded-full">
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{icon}</span>
      <input
        {...rest}
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-transparent border-0 outline-none font-body text-sm text-primary placeholder:text-on-surface-variant/60"
      />
    </label>
  )
}
