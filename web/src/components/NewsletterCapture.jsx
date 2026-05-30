import { useState } from 'react'
import { api } from '../lib/api'

/* Mock dernière édition — remplacer par fetch Supabase quand dispo */
const LAST_DISPATCH = {
  num: '12',
  date: 'Mai 2025',
  titre: 'CHU-B Brazzaville — levage des charpentes métalliques terminé',
  extrait:
    'L\'ossature principale du bloc B est posée. Prochaine étape : étanchéité toiture et menuiseries aluminium préfabriquées à Pointe-Noire…',
  img: '/portfolio-chu.webp',
  tag: 'Génie Civil',
}

const PERKS = [
  { icon: 'photo_camera',    label: 'Photos terrain exclusives',    desc: 'Avancement réel, semaine après semaine' },
  { icon: 'gavel',           label: 'Appels d\'offres BTP Congo',   desc: 'Opportunités avant publication officielle' },
  { icon: 'engineering',     label: 'Décryptages techniques',       desc: 'Méthodes, matériaux, retours d\'expérience' },
]

export default function NewsletterCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError]   = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email invalide')
      setStatus('error')
      return
    }
    setStatus('loading')
    setError('')
    try {
      await api.post('/api/newsletter', { email: email.toLowerCase().trim(), source: 'footer' })
      setStatus('success')
      setEmail('')
    } catch (err) {
      // duplicate email = succès silencieux côté UX
      if (err?.status === 409) { setStatus('success'); setEmail(''); return }
      console.error(err)
      window.location.href = `mailto:contact@foga-tech.com?subject=Inscription%20newsletter&body=Email%20%3A%20${encodeURIComponent(email)}`
    }
  }

  return (
    <section className="bg-[#000D1A] border-t border-white/8">
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* ── Colonne gauche : Proposition ── */}
        <div>
          {/* Label */}
          <div className="flex items-center gap-3 mb-6">
            <span className="w-4 h-px bg-secondary-container" />
            <span className="font-label font-bold text-[10px] uppercase tracking-[0.28em] text-secondary-container">
              Dispatches Foga-Tech · Édition #{LAST_DISPATCH.num}
            </span>
          </div>

          {/* Titre */}
          <h2
            className="font-headline font-black text-white leading-[0.92] tracking-[-0.03em] mb-6"
            style={{ fontSize: 'clamp(19px, 4vw, 3rem)' }}
          >
            Le terrain,<br />
            <span className="text-secondary-container">en direct.</span>
          </h2>

          <p className="font-body text-white/55 text-sm leading-relaxed mb-10 max-w-md">
            Chaque fin de mois — ce que les chantiers congolais produisent vraiment.
            Photos, méthodes, opportunités. Sans filtre.
          </p>

          {/* Perks */}
          <ul className="space-y-5 mb-10">
            {PERKS.map(p => (
              <li key={p.icon} className="flex items-start gap-4">
                <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/6 border border-white/10">
                  <span
                    className="material-symbols-outlined text-secondary-container text-base"
                    aria-hidden="true"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {p.icon}
                  </span>
                </div>
                <div>
                  <p className="font-label font-bold text-white text-[12px] uppercase tracking-wider">{p.label}</p>
                  <p className="font-body text-white/40 text-xs mt-0.5">{p.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Social proof */}
          <div className="flex items-center gap-2.5">
            {/* Avatars fictifs */}
            <div className="flex -space-x-2">
              {['#234998','#4A7BC8','#FE932C','#1a3a70'].map((bg, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-[#000D1A] flex items-center justify-center"
                  style={{ background: bg }}
                  aria-hidden="true"
                >
                  <span className="material-symbols-outlined text-white text-[10px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}>engineering</span>
                </div>
              ))}
            </div>
            <p className="font-body text-white/40 text-xs">
              <span className="text-white/70 font-bold">220+</span> professionnels BTP déjà abonnés
            </p>
          </div>
        </div>

        {/* ── Colonne droite : Preview + Formulaire ── */}
        <div className="flex flex-col gap-6">

          {/* Preview dernière édition */}
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/4 backdrop-blur-sm">
            {/* Header preview */}
            <div className="px-5 py-3 border-b border-white/8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="font-label font-bold text-[10px] uppercase tracking-widest text-white/55">
                Dernière édition — {LAST_DISPATCH.date}
              </span>
              <span className="w-16" />
            </div>

            {/* Contenu preview */}
            <div className="p-5">
              <div className="flex gap-4 items-start">
                {/* Thumbnail */}
                <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
                  <img
                    src={LAST_DISPATCH.img}
                    alt={LAST_DISPATCH.titre}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block bg-secondary-container/20 text-secondary-container font-label font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full mb-2">
                    {LAST_DISPATCH.tag}
                  </span>
                  <p className="font-headline font-bold text-white text-sm leading-tight line-clamp-2 mb-1">
                    {LAST_DISPATCH.titre}
                  </p>
                  <p className="font-body text-white/40 text-xs leading-relaxed line-clamp-2">
                    {LAST_DISPATCH.extrait}
                  </p>
                </div>
              </div>
              {/* Blur CTA */}
              <div className="relative mt-4 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-white/5 border border-white/8 rounded-xl blur-[3px] select-none pointer-events-none" aria-hidden="true">
                  <div className="h-2 bg-white/20 rounded-full w-3/4 mb-2" />
                  <div className="h-2 bg-white/15 rounded-full w-1/2" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-label font-bold text-[10px] uppercase tracking-widest text-white/70 bg-[#000D1A]/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/15">
                    Abonnez-vous pour lire la suite
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          {status === 'success' ? (
            <div className="rounded-2xl bg-secondary-container/10 border border-secondary-container/30 p-6 flex items-center gap-4">
              <span
                className="material-symbols-outlined text-secondary-container text-2xl flex-shrink-0"
                aria-hidden="true"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <div>
                <p className="font-headline font-bold text-white text-sm">Vous êtes dans la liste.</p>
                <p className="font-body text-white/45 text-xs mt-0.5">
                  Prochaine édition fin {new Date().toLocaleDateString('fr-FR', { month: 'long' })}.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  disabled={status === 'loading'}
                  className="flex-1 bg-white/6 border border-white/15 text-white text-sm placeholder:text-white/55 px-5 py-4 rounded-2xl focus:outline-none focus:border-secondary-container focus:bg-white/8 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="flex-shrink-0 flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-container font-headline font-black uppercase tracking-widest text-xs px-6 py-4 rounded-2xl hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {status === 'loading' ? (
                    <span className="w-4 h-4 border-2 border-on-secondary-container/40 border-t-on-secondary-container rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm" aria-hidden="true"
                        style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                      S&apos;inscrire
                    </>
                  )}
                </button>
              </div>
              {status === 'error' && error && (
                <p className="text-red-400 text-xs font-body pl-1">{error}</p>
              )}
              <p className="font-body text-white/25 text-xs pl-1">
                Zéro spam · désinscription en un clic · édition mensuelle
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
