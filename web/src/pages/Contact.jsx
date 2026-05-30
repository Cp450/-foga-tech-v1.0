import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import TextReveal from '../components/TextReveal'
import WaveBackground from '../components/WaveBackground'
import { api } from '../lib/api'

/* ── Bureaux ──────────────────────────────────────────────────── */
const BUREAUX = [
  {
    ville: 'Brazzaville',
    tag: 'Siege social',
    adresse: '1509 Rue Motaba, Plateaux des 15 ans (réf. pressing 5 à sec)',
    quartier: 'Moungali, Brazzaville',
    horaires: 'Lun-Ven 8h-18h · Sam 8h-13h',
    maps: 'https://maps.google.com/?q=Plateau+des+15+ans+Brazzaville',
  },
  {
    ville: 'Pointe-Noire',
    tag: 'Bureau regional',
    adresse: '34 Rue Atali, Centre Ville',
    quartier: "Derriere Ex Bouda Bar, Pointe-Noire",
    horaires: 'Lun-Ven 8h-18h · Sam 8h-13h',
    maps: 'https://maps.google.com/?q=Centre+Ville+Pointe-Noire+Congo',
  },
]

/* ── Direct contact ───────────────────────────────────────────── */
const DIRECTS = [
  {
    icon: 'chat',
    label: 'WhatsApp',
    value: '+242 06 990 56 40',
    href: 'https://wa.me/242069905640?text=Bonjour%20Foga-Tech',
    note: 'Reponse < 15 min · 7j/7',
    highlight: true,
  },
  {
    icon: 'mail',
    label: 'Email',
    value: 'contact@foga-tech.com',
    href: 'mailto:contact@foga-tech.com',
    note: 'Reponse sous 24h',
  },
  {
    icon: 'call',
    label: 'Telephone',
    value: '+242 05 669 49 20',
    href: 'tel:+242056694920',
    note: 'Lun-Sam · 8h-18h',
  },
]

export default function Contact() {
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' })
  const [sent, setSent] = useState(false)
  const [nlEmail, setNlEmail] = useState('')
  const [nlStatus, setNlStatus] = useState('idle') // idle | loading | success

  const submitNl = async (e) => {
    e.preventDefault()
    if (!nlEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nlEmail)) return
    setNlStatus('loading')
    try {
      await api.post('/api/newsletter', { email: nlEmail.toLowerCase().trim(), source: 'contact' })
    } catch (_) { /* silent — email capture best-effort */ }
    setNlStatus('success')
    setNlEmail('')
  }

  const submit = (e) => {
    e.preventDefault()
    const msg = encodeURIComponent(
      `*Contact Foga-Tech*\n\nNom: ${form.nom}\nEmail: ${form.email}\nSujet: ${form.sujet}\n\n${form.message}`
    )
    window.open(`https://wa.me/242069905640?text=${msg}`, '_blank')
    setSent(true)
  }

  return (
    <main className="pt-16 bg-[#001022] text-white font-body">
      <SEO
        title="Contact — Foga-Tech International"
        description="Contactez Foga-Tech International : WhatsApp, téléphone, email. Bureaux à Brazzaville et Pointe-Noire. Réponse garantie sous 24h."
        canonical="https://foga-tech.com/contact"
      />

      {/* ── Section 1 — Hero dark ─────────────────────────────── */}
      <section className="bg-[#001022] pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-label font-bold text-[11px] uppercase tracking-[0.22em] text-secondary-container mb-6">
            · Brazzaville &amp; Pointe-Noire ·
          </p>
          <div style={{ fontSize: 'clamp(20px, 5.5vw, 4rem)' }}>
            <TextReveal
              text="Parlons de"
              as="h1"
              className="font-headline font-black leading-[0.95] tracking-tight text-white"
              animate
              delay={0.1}
            />
            <TextReveal
              text="votre projet."
              as="div"
              className="font-headline font-black leading-[0.95] tracking-tight text-secondary-container mb-6"
              animate
              delay={0.3}
            />
          </div>
          <p className="text-white/55 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Notre équipe répond en lingala et en français &mdash; 7 jours sur 7, urgences comprises.
          </p>
        </div>
      </section>

      {/* ── Section 2 — 3 canaux de contact ──────────────────── */}
      <section className="bg-[#001022] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DIRECTS.map((d) => (
              <a
                key={d.label}
                href={d.href}
                target={d.href.startsWith('http') ? '_blank' : undefined}
                rel={d.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`rounded-2xl p-6 flex flex-col gap-4 transition-all hover:brightness-105 ${
                  d.highlight
                    ? 'bg-secondary-container'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[24px] ${
                    d.highlight ? 'text-on-secondary-container' : 'text-secondary-container'
                  }`}
                  aria-hidden="true"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {d.icon}
                </span>
                <div>
                  <p
                    className={`font-headline font-bold text-white leading-tight ${
                      d.highlight ? 'text-on-secondary-container' : 'text-white'
                    }`}
                  >
                    {d.value}
                  </p>
                  <p
                    className={`font-body text-[11px] mt-1 ${
                      d.highlight ? 'text-on-secondary-container/70' : 'text-white/40'
                    }`}
                  >
                    {d.note}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sections 3+4 fusionnées — Bureaux | Formulaire ─────── */}
      <section className="relative bg-[#001634] border-t border-white/[0.08] py-16 px-6 overflow-hidden">
        {/* Wave animation (DNA partenaires) */}
        <WaveBackground />
        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 lg:gap-16 items-start">

          {/* ── Colonne gauche : Bureaux ── */}
          <div>
            <p className="font-label font-bold text-[10px] uppercase tracking-widest text-white/55 mb-6">
              Nos bureaux
            </p>
            <div className="space-y-4">
              {BUREAUX.map((b) => (
                <div key={b.ville} className="bg-white/[0.06] backdrop-blur-md border border-white/15 rounded-2xl p-5">
                  <p className="font-headline font-black text-white text-base mb-0.5">{b.ville}</p>
                  <p className="font-label text-[10px] uppercase tracking-widest text-secondary-container mb-3">
                    {b.tag}
                  </p>
                  <p className="text-white/45 text-sm leading-relaxed">
                    {b.adresse}<br />{b.quartier}
                  </p>
                  <p className="text-white/55 text-xs mt-2">{b.horaires}</p>
                  <a
                    href={b.maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-secondary-container text-xs font-label hover:brightness-110 transition-all"
                  >
                    Voir sur Maps
                    <span className="material-symbols-outlined text-xs" aria-hidden="true">open_in_new</span>
                  </a>
                </div>
              ))}

              {/* ── Newsletter card intégrée ── */}
              <div className="bg-white/[0.06] backdrop-blur-md border border-white/15 rounded-2xl p-5">
                <p className="font-label font-bold text-[10px] uppercase tracking-[0.25em] text-secondary-container mb-2">
                  Dispatches · 1 par mois
                </p>
                <p className="font-headline font-black text-white text-base mb-1 leading-tight">
                  Le terrain en direct.
                </p>
                <p className="text-white/45 text-xs mb-4 leading-relaxed">
                  Chantiers, photos exclusives, opportunités BTP Congo.
                </p>
                {nlStatus === 'success' ? (
                  <p className="font-headline font-bold text-secondary-container text-xs">
                    Inscription confirmée. Prochaine édition à la fin du mois.
                  </p>
                ) : (
                  <form onSubmit={submitNl} className="flex flex-col gap-2">
                    <input
                      type="email"
                      required
                      value={nlEmail}
                      onChange={e => setNlEmail(e.target.value)}
                      placeholder="votre@email.com"
                      disabled={nlStatus === 'loading'}
                      className="w-full bg-white/[0.08] border border-white/15 text-white text-sm placeholder:text-white/25 px-3 py-2.5 rounded-xl focus:outline-none focus:border-secondary-container transition-all disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={nlStatus === 'loading'}
                      className="w-full flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-container font-headline font-black uppercase tracking-widest text-[11px] px-4 py-2.5 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      {nlStatus === 'loading'
                        ? <span className="w-4 h-4 border-2 border-on-secondary-container/40 border-t-on-secondary-container rounded-full animate-spin" />
                        : <><span className="material-symbols-outlined text-sm" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>S&apos;inscrire</>
                      }
                    </button>
                  </form>
                )}
                <p className="text-white/25 text-[10px] mt-3">
                  220+ abonnés · zéro spam · désinscription en un clic
                </p>
              </div>
            </div>
          </div>

          {/* ── Colonne droite : Formulaire ── */}
          <div>
            <p className="font-label font-bold text-[10px] uppercase tracking-widest text-white/55 mb-2">
              Décrivez votre projet
            </p>
            <h2 className="font-headline font-black text-white text-2xl mb-2">
              On vous répond en moins de 15 min.
            </h2>
            <p className="text-white/35 text-xs mb-6">
              Votre message atterrit directement sur WhatsApp &mdash; pas de formulaire perdu.
            </p>

            <div className="bg-white/[0.06] backdrop-blur-md border border-white/15 rounded-2xl p-6">
              {sent ? (
                <div className="text-center py-10">
                  <span
                    className="material-symbols-outlined text-secondary-container text-5xl mb-4 block"
                    aria-hidden="true"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <p className="font-headline font-bold text-white text-lg mb-2">
                    Message ouvert sur WhatsApp.
                  </p>
                  <p className="text-white/55 text-sm">
                    Finalisez l&apos;envoi depuis l&apos;application.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-6 text-xs text-white/35 hover:text-secondary-container underline transition-colors"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-nom" className="font-label font-bold text-[10px] uppercase tracking-widest text-white/40 mb-1.5 block">
                        Nom *
                      </label>
                      <input
                        id="contact-nom" required type="text" autoComplete="name" placeholder="Votre nom"
                        value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                        className="w-full bg-white/[0.08] border border-white/15 text-white placeholder:text-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary-container transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="font-label font-bold text-[10px] uppercase tracking-widest text-white/40 mb-1.5 block">
                        Email <span className="normal-case text-white/25">(optionnel)</span>
                      </label>
                      <input
                        id="contact-email" type="email" autoComplete="email" placeholder="Optionnel"
                        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-white/[0.08] border border-white/15 text-white placeholder:text-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary-container transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact-sujet" className="font-label font-bold text-[10px] uppercase tracking-widest text-white/40 mb-1.5 block">
                      Sujet *
                    </label>
                    <input
                      id="contact-sujet" required type="text" autoComplete="off" placeholder="Ex: Devis villa R+1 Brazzaville"
                      value={form.sujet} onChange={(e) => setForm({ ...form, sujet: e.target.value })}
                      className="w-full bg-white/[0.08] border border-white/15 text-white placeholder:text-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary-container transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="font-label font-bold text-[10px] uppercase tracking-widest text-white/40 mb-1.5 block">
                      Message *
                    </label>
                    <textarea
                      id="contact-message" required rows={5}
                      placeholder="Décrivez votre projet ou posez votre question..."
                      value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full bg-white/[0.08] border border-white/15 text-white placeholder:text-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary-container transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-secondary-container text-on-secondary-container font-headline font-black uppercase tracking-widest text-xs px-8 py-4 rounded-full hover:brightness-110 transition-all"
                  >
                    Envoyer sur WhatsApp
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

    </main>
  )
}
