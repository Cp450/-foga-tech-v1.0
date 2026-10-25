'use strict'

/**
 * Anti-spam serveur pour les formulaires publics :
 *  (a) honeypot  — le champ caché « website » doit être vide ; sinon on répond
 *      par un faux succès (201) sans rien enregistrer ni notifier, pour ne pas
 *      révéler le piège au bot ;
 *  (b) limitation de débit en mémoire par IP (fenêtre glissante).
 *
 * L'IP vient de req.ip : il faut `app.set('trust proxy', …)` derrière un proxy
 * (voir index.js), sinon tous les visiteurs partagent l'IP du proxy.
 * Limite : l'état est en mémoire (perdu au redémarrage, non partagé entre
 * instances) — suffisant pour une instance unique.
 */

const HONEYPOT_FIELD = 'website'
const MAX      = Math.max(1, parseInt(process.env.RATE_LIMIT_MAX, 10) || 5)
const WINDOW_MS = Math.max(1, parseInt(process.env.RATE_LIMIT_WINDOW_MIN, 10) || 10) * 60 * 1000

// scope -> Map<ip, number[]> (horodatages dans la fenêtre)
const buckets = new Map()

function hit(scope, ip, now) {
  let m = buckets.get(scope)
  if (!m) { m = new Map(); buckets.set(scope, m) }
  const recent = (m.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX) {
    m.set(ip, recent)
    return { limited: true, retryAfterS: Math.ceil((WINDOW_MS - (now - recent[0])) / 1000) }
  }
  recent.push(now)
  m.set(ip, recent)
  return { limited: false }
}

// Purge périodique pour borner la mémoire.
const sweeper = setInterval(() => {
  const now = Date.now()
  for (const m of buckets.values()) {
    for (const [ip, ts] of m) {
      if (!ts.some((t) => now - t < WINDOW_MS)) m.delete(ip)
    }
  }
}, 5 * 60 * 1000)
sweeper.unref()

/**
 * @param {Object}   opts
 * @param {string}   opts.scope - Seau de débit (routes d'un même scope le partagent)
 * @param {Function} opts.fake  - (req) => corps JSON du faux succès renvoyé aux bots
 */
function antispam({ scope, fake }) {
  return (req, res, next) => {
    const ip = req.ip || (req.socket && req.socket.remoteAddress) || 'unknown'

    const r = hit(scope, ip, Date.now())
    if (r.limited) {
      console.warn(`[antispam] 429 scope=${scope} ip=${ip}`)
      res.set('Retry-After', String(r.retryAfterS))
      return res.status(429).json({
        success: false,
        error: 'Trop de demandes envoyées. Réessayez dans quelques minutes ou contactez-nous sur WhatsApp.',
      })
    }

    const trap = req.body && req.body[HONEYPOT_FIELD]
    if (trap != null && String(trap).trim() !== '') {
      console.warn(`[antispam] honeypot déclenché scope=${scope} ip=${ip}`)
      return res.status(201).json(typeof fake === 'function' ? fake(req) : { success: true })
    }

    next()
  }
}

module.exports = { antispam, HONEYPOT_FIELD }
