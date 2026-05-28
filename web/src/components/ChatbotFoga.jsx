import { useState, useRef, useEffect } from 'react'
import DOMPurify from 'dompurify'

/* ─── FAQ data ────────────────────────────────────────────────────────────── */
const FAQS = [
  {
    triggers: ['qui sommes', 'qui êtes', 'qui est', 'présentation', 'présentez', 'présenter', 'à propos', 'entreprise', 'société', 'foga-tech', 'foga tech', 'votre histoire', "c'est quoi", 'parler de vous', "qu'est-ce que"],
    response: "**Foga-Tech International** est une entreprise congolaise de BTP basée à Brazzaville, active depuis **12 ans**.\n\nNos pôles :\n• **Génie Civil** — bâtiment, ouvrages d'art, bureau d'étude\n• **Génie Rural** — infrastructures, solutions durables, élevage\n• **Location Engins** — 65 machines disponibles\n\n**+15 chantiers** livrés, partenariats nationaux & internationaux.\n\nEn savoir plus : [À propos](/a-propos) · [Portfolio](/portfolio)",
    lingala: "Foga-Tech ezali kompani ya BTP na Brazzaville. Tozali na mosala oyo eleki mibu 12. Tosalaki misala mingi koleka 15.",
  },
  {
    triggers: ['service', 'que faites', 'activité', 'activités', 'métier', 'métiers', 'expertise', 'expertises', 'spécialité', 'spécialités', 'domaine'],
    response: "Foga-Tech couvre **4 métiers** :\n\n• **Génie Civil & Gros Œuvre** — bâtiment tertiaire/résidentiel, ouvrages d'art, VRD\n• **Bureau d'Étude** — topo, urbanisme, ingénierie\n• **Génie Rural & Hydraulique** — irrigation, adduction, élevage, pisciculture\n• **Location Engins** — 65 engins (pelleteuses, bulldozers, grues, bétonnières)\n\nDétails par pôle : [Génie Civil](/genie-civil) · [Génie Rural](/genie-rural) · [Location](/location)",
    lingala: "Tosalaka misala minei: bâtiment, bureau d'étude, génie rural, na location ya engins.",
  },
  {
    triggers: ['équipe', 'effectif', 'personnel', 'collaborateur', 'employé', 'ouvrier', 'chef de chantier', 'ingénieur', 'expert'],
    response: "Notre équipe rassemble **ingénieurs civils, architectes, chefs de chantier expérimentés et ouvriers qualifiés** — tous formés aux normes BNC, Eurocode 2 et HQE.\n\nChaque projet est piloté par un **chef de projet dédié** avec reporting hebdomadaire.\n\nRencontrer l'équipe : [À propos](/a-propos)",
    lingala: "Equipe na biso ezali na ingénieurs, architectes, chefs de chantier, na ouvriers ya bonganga.",
  },
  {
    triggers: ['devis', 'prix', 'combien', 'cout', 'tarif', 'budget', 'estimation'],
    response: 'Nos devis sont **offerts sous 48 h** après visite technique. Vous pouvez aussi utiliser notre [Calculateur Budget](#calculateur) sur la page d\'accueil pour une estimation immédiate.\n\nPour un devis précis, envoyez-nous votre projet sur WhatsApp → +242 06 990 56 40',
    lingala: 'Devis na biso ezali ya ofele (gratuit). Tokosala estimasyon na 48 h.',
  },
  {
    triggers: ['engin', 'grue', 'bulldozer', 'pelle', 'camion', 'location', 'réserver', 'louer'],
    response: 'Notre parc comprend **65 engins** disponibles à la location :\n• Pelleteuses 200K FCFA/j\n• Bulldozers 250K FCFA/j\n• Grues mobiles 400K FCFA/j\n• Bétonnières 80K FCFA/j\n\nConfirmation sous 2h · Livraison chantier sous 24h.',
    lingala: 'Biso tozali na engins mingi. Tokopesa yo na 2h soki ozali na urgence.',
  },
  {
    triggers: ['délai', 'temps', 'durée', 'combien de temps', 'quand', 'planning'],
    response: 'Chaque chantier est unique — la durée dépend de plusieurs paramètres :\n• **Surface** et complexité technique\n• **Accessibilité** du site & logistique\n• **Saison** (sèche/pluies) et approvisionnement\n• Normes spécifiques (santé, ERP, industriel)\n\nNous nous engageons sur :\n• **Planning contractuel** détaillé au devis\n• **Reporting hebdomadaire** d\'avancement\n• Délais **fermes par écrit** dans le contrat\n\nPour une estimation précise, consultez notre [page devis](/devis) ou contactez-nous : **WhatsApp +242 06 990 56 40**',
    lingala: 'Tango ya travaux ezali na variables mingi. Tokoyebisa yo planning ya solo na devis.',
  },
  {
    triggers: ['certification', 'diplôme', 'qualité', 'iso', 'garantie', 'certifié'],
    response: 'Nos agréments &amp; certifications :\n• **Agrément Ministère BTP Congo**\n• **Ordre des Ingénieurs Congo**\n• **Normes BNC &amp; Eurocode 2** appliquées\n• **HQE** (en cours)\n\nToutes nos attestations sont disponibles en PDF sur demande.',
    lingala: 'Tozali agréés na Ministère BTP na Congo, na Ordre des Ingénieurs.',
  },
  {
    triggers: ['paiement', 'payer', 'acompte', 'virement', 'momo', 'airtel', 'mobile money'],
    response: 'Modes de paiement acceptés :\n• **MTN MoMo**\n• **Airtel Money**\n• **Virement bancaire**\n• **Espèces** (acompte initial uniquement)\n\nStructure typique : 30% acompte · 40% mi-travaux · 30% à la livraison.',
    lingala: 'Tozali kozua MTN MoMo, Airtel Money, na virement bancaire. 30% liboso, 40% nzela, 30% sika basilisi.',
  },
  {
    triggers: ['énergie', 'solaire', 'panneau', 'durable', 'écologie', 'environnement', 'vert'],
    response: 'Foga-Tech intègre des solutions durables dans ses chantiers :\n• **Panneaux solaires** pour alimenter les sites isolés\n• **Gestion de l\'eau** — forages, retenues, irrigation\n• **Matériaux locaux** privilégiés pour réduire l\'empreinte carbone\n\nPour un projet intégrant ces solutions : **WhatsApp +242 06 990 56 40**',
    lingala: 'Biso tozali kozua solutions durables na misala na biso — soleil, mai, materiaux ya Congo.',
  },
  {
    triggers: ['whatsapp', 'contact', 'telephone', 'appel', 'joindre', 'numéro'],
    response: 'Nous joindre :\n• **WhatsApp** : +242 06 990 56 40\n• **Réponse garantie** sous 15 minutes (heures ouvrées)\n• Disponible 7j/7 pour les urgences chantier',
    lingala: 'WhatsApp: +242 06 990 56 40. Tokoyanola na 15 minutes.',
  },
  {
    triggers: ['brazzaville', 'congo', 'pointe-noire', 'zone', 'région', 'où', 'localisation'],
    response: 'Foga-Tech BTP opère principalement à :\n• **Brazzaville** et sa périphérie\n• **Pool** (génie rural)\n• **Pointe-Noire** (projets industriels)\n\nNous pouvons intervenir sur tout le territoire congolais pour les grands chantiers.',
    lingala: 'Biso tozali na Brazzaville, Pool, na Pointe-Noire. Tozali kokende na Congo yonso pour grands projets.',
  },
  {
    triggers: ['portfolio', 'projet', 'réalisation', 'exemple', 'travail précédent'],
    response: 'Consultez notre [Portfolio](/portfolio) pour voir nos 50+ réalisations avec :\n• Budgets réels affichés\n• Délais respectés\n• Notes clients vérifiées\n• Certifications par projet',
    lingala: 'Tala Portfolio na biso: misala 50+ na biso emonisami awa na site.',
  },
]

const GREETINGS = ['bonjour', 'bonsoir', 'salut', 'hello', 'sango', 'mbote', 'yo', 'hi']
const THANKS = ['merci', 'ok', 'parfait', 'super', 'bien', "d'accord", 'compris', 'reçu']

function scoreResponse(faq, lower) {
  return faq.triggers.filter((t) => lower.includes(t)).length
}

function getBotResponse(input) {
  const lower = input.toLowerCase().trim()
  if (!lower) return null

  if (GREETINGS.some((g) => lower.includes(g))) {
    return {
      text: "Mbote! Bonjour!\n\nJe suis l'assistant **Foga-Tech BTP**. Je parle **français et lingala**.\n\nComment puis-je vous aider?\n• Devis & tarifs\n• Location engins\n• Délais projets\n• Paiements\n• Nos réalisations",
      lingala: null,
    }
  }
  if (THANKS.some((t) => lower.includes(t))) {
    return {
      text: "Avec plaisir! N'hésitez pas si vous avez d'autres questions.\n\nPour un accompagnement personnalisé : **WhatsApp +242 06 990 56 40**",
      lingala: null,
    }
  }

  let best = null
  let bestScore = 0
  for (const faq of FAQS) {
    const score = scoreResponse(faq, lower)
    if (score > bestScore) {
      bestScore = score
      best = faq
    }
  }
  if (best) return { text: best.response, lingala: best.lingala }

  return {
    text: "Je n'ai pas encore d'info précise sur ce sujet. Voici ce que je sais répondre :\n\n• **Qui sommes-nous** — Foga-Tech, métiers, équipe\n• **Nos services** — civil, rural, location engins\n• **Devis & tarifs** — délais, paiement, MoMo\n• **Délais & planning** — durée chantier\n• **Certifications** — agréments, normes\n• **Localisation** — Brazzaville, Pool, Pointe-Noire\n• **Portfolio** — nos réalisations\n\nOu directement notre équipe :\n**WhatsApp** : +242 06 990 56 40 — réponse sous 24h.",
    lingala: 'Nazali na info te likolo ya likambo oyo. Tuna ngai na sujet mosusu, to benga WhatsApp: +242 06 990 56 40.',
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatMessage(text) {
  const escaped = escapeHtml(text)
  const formatted = escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="underline opacity-90 hover:opacity-100" style="color:#FF8C00">$1</a>')
    .replace(/\n/g, '<br/>')
    .replace(/^• /gm, '&bull; ')
  return DOMPurify.sanitize(formatted, {
    ALLOWED_TAGS: ['strong', 'a', 'br'],
    ALLOWED_ATTR: ['href', 'class', 'style'],
    ALLOWED_URI_REGEXP: /^(https?:|\/|#)/i,
  })
}

let _chatId = 0
const nextChatId = () => { _chatId += 1; return _chatId }

const QUICK_REPLIES = [
  'Qui sommes-nous',
  'Nos services',
  'Devis offert',
  'Location engins',
  'Planning chantier',
  'Paiement MoMo',
  'Certifications',
  'Nos réalisations',
]

/* ─── Palette ─────────────────────────────────────────────────────────────── */
const BG_PANEL    = '#020E1C'
const BG_INNER    = '#010913'
const ORANGE      = '#FF6B00'
const ORANGE_DIM  = 'rgba(255,107,0,0.15)'
const BORDER      = 'rgba(255,107,0,0.18)'
const BORDER_SUB  = 'rgba(255,255,255,0.06)'

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function ChatbotFoga() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 0,
      from: 'bot',
      text: "Mbote! Bonjour!\n\nJe suis l'assistant **Foga-Tech BTP**.\nPosez-moi vos questions en **français ou lingala** !",
      lingala: null,
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [showLingala, setShowLingala] = useState({})
  const bottomRef = useRef(null)
  const scrollRef  = useRef(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    }
  }, [messages, open])

  function sendMessage(text) {
    if (!text.trim()) return
    const userMsg = { id: nextChatId(), from: 'user', text }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const response = getBotResponse(text)
      setMessages((m) => [...m, { id: nextChatId(), from: 'bot', ...response }])
      setTyping(false)
    }, 800)
  }

  return (
    <>
      {/* ── Toggle button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Assistant Foga-Tech"
        className="fixed bottom-28 md:bottom-24 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: open
            ? `${BG_PANEL}`
            : `linear-gradient(135deg, ${ORANGE}, #E55A00)`,
          boxShadow: open
            ? `0 0 0 1px ${BORDER}, 0 8px 24px rgba(0,0,0,0.5)`
            : `0 4px 20px rgba(255,107,0,0.45), 0 0 0 1px rgba(255,107,0,0.3)`,
        }}
      >
        {open
          ? <span className="material-symbols-outlined text-2xl" style={{ color: ORANGE }} aria-hidden="true">close</span>
          : <span className="material-symbols-outlined text-2xl text-white" aria-hidden="true">chat</span>
        }
        {!open && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
            style={{ background: ORANGE, color: BG_PANEL, border: `2px solid white` }}
          >
            AI
          </span>
        )}
      </button>

      {/* ── Panel ── */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Assistant Foga-Tech BTP"
          className="fixed z-50 flex flex-col animate-fade-slide-up
                     inset-x-3 bottom-44
                     md:inset-auto md:bottom-44 md:right-4 md:w-[400px]"
          style={{
            height: 'min(520px, calc(100dvh - 180px))',
            background: BG_PANEL,
            borderRadius: '1rem',
            border: `1px solid ${BORDER}`,
            boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,107,0,0.08)`,
            /* No overflow-hidden here — that's what breaks iOS scroll */
          }}
        >
          {/* Orange accent bar top */}
          <div
            aria-hidden="true"
            style={{
              flexShrink: 0,
              height: '2px',
              background: `linear-gradient(90deg, ${ORANGE} 0%, #FF8C00 60%, transparent 100%)`,
              borderRadius: '1rem 1rem 0 0',
            }}
          />

          {/* ── Header ── */}
          <div
            className="flex-shrink-0 px-4 py-3 flex items-center gap-3"
            style={{ borderBottom: `1px solid ${BORDER_SUB}` }}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, #E55A00)`, padding: '5px' }}
              >
                <img
                  src="/icon_logo_entreprise.svg"
                  alt="Foga-Tech"
                  className="w-full h-full object-contain brightness-0 invert"
                />
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ background: '#22C55E', border: `2px solid ${BG_PANEL}` }}
                aria-hidden="true"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-white font-bold text-sm leading-tight font-headline">
                  FOGA<span style={{ color: ORANGE }}>AI</span>
                </p>
                <span
                  className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ background: ORANGE_DIM, color: ORANGE, border: `1px solid rgba(255,107,0,0.35)` }}
                >
                  BETA
                </span>
              </div>
              <p className="text-[11px] flex items-center gap-1 mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
                En ligne · FR + Lingala
              </p>
            </div>

            <a
              href="https://wa.me/242069905640?text=Bonjour%2C%20je%20viens%20du%20chat%20Foga-Tech%20BTP"
              target="_blank"
              rel="noreferrer"
              aria-label="Contacter sur WhatsApp"
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: '#25D366' }}
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
            </a>

            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
            </button>
          </div>

          {/* ── Messages — SCROLL FIX ── */}
          <div
            ref={scrollRef}
            data-lenis-prevent
            className="flex-1 min-h-0 px-3 py-4 space-y-3"
            style={{
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
              background: BG_INNER,
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot avatar */}
                {msg.from === 'bot' && (
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center overflow-hidden mt-1"
                    style={{ background: `linear-gradient(135deg, ${ORANGE}, #E55A00)`, padding: '3px' }}
                    aria-hidden="true"
                  >
                    <img
                      src="/icon_logo_entreprise.svg"
                      alt=""
                      className="w-full h-full object-contain brightness-0 invert"
                    />
                  </div>
                )}

                {/* Bubble */}
                <div
                  className="max-w-[80%] text-sm px-3.5 py-2.5 leading-relaxed"
                  style={
                    msg.from === 'user'
                      ? {
                          background: `linear-gradient(135deg, ${ORANGE}, #E55A00)`,
                          color: 'white',
                          borderRadius: '1rem 1rem 0.25rem 1rem',
                          boxShadow: `0 2px 12px rgba(255,107,0,0.25)`,
                        }
                      : {
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          borderLeft: `2px solid ${ORANGE}`,
                          color: 'rgba(255,255,255,0.85)',
                          borderRadius: '0.25rem 1rem 1rem 1rem',
                        }
                  }
                >
                  <div
                    className="leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                  />
                  {/* Lingala toggle */}
                  {msg.lingala && (
                    <div className="mt-2.5 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <button
                        onClick={() => setShowLingala((s) => ({ ...s, [msg.id]: !s[msg.id] }))}
                        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-opacity hover:opacity-100"
                        style={{ color: ORANGE, opacity: 0.7 }}
                      >
                        <span className="material-symbols-outlined text-[13px]" aria-hidden="true">translate</span>
                        {showLingala[msg.id] ? 'Masquer Lingala' : 'Voir en Lingala'}
                      </button>
                      {showLingala[msg.id] && (
                        <p className="text-xs mt-1.5 italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          {msg.lingala}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex gap-2 justify-start">
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center overflow-hidden mt-1"
                  style={{ background: `linear-gradient(135deg, ${ORANGE}, #E55A00)`, padding: '3px' }}
                  aria-hidden="true"
                >
                  <img
                    src="/icon_logo_entreprise.svg"
                    alt=""
                    className="w-full h-full object-contain brightness-0 invert"
                  />
                </div>
                <div
                  className="px-4 py-3"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderLeft: `2px solid ${ORANGE}`,
                    borderRadius: '0.25rem 1rem 1rem 1rem',
                  }}
                >
                  <div className="flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: ORANGE, animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Quick replies — horizontal scroll, no wrap ── */}
          <div
            className="flex-shrink-0 px-3 py-2"
            style={{ borderTop: `1px solid ${BORDER_SUB}`, background: BG_PANEL }}
          >
            <div
              data-lenis-prevent
              className="flex gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              style={{
                overflowX: 'auto',
                paddingBottom: '2px',
              }}
            >
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="flex-shrink-0 text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 transition-all whitespace-nowrap"
                  style={{
                    border: `1px solid rgba(255,107,0,0.3)`,
                    color: `rgba(255,107,0,0.8)`,
                    background: ORANGE_DIM,
                    borderRadius: '99px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `rgba(255,107,0,0.25)`
                    e.currentTarget.style.color = ORANGE
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = ORANGE_DIM
                    e.currentTarget.style.color = `rgba(255,107,0,0.8)`
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* ── Input ── */}
          <div
            className="flex-shrink-0 p-3 flex gap-2 items-center"
            style={{
              borderTop: `1px solid ${BORDER_SUB}`,
              background: `rgba(0,0,0,0.25)`,
              borderRadius: '0 0 1rem 1rem',
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Message en FR ou Lingala…"
              className="flex-1 text-sm px-4 py-2.5 rounded-full outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.87)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(255,107,0,0.5)')}
              onBlur={(e)  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              aria-label="Envoyer"
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${ORANGE}, #E55A00)`, color: 'white' }}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                aria-hidden="true"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                send
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
