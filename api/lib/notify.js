'use strict'

const TIMEOUT_MS = 3000

function clip(s, n) {
  const t = String(s == null ? '' : s).replace(/\s+/g, ' ').trim()
  return t.length > n ? t.slice(0, n - 1) + '…' : t
}

/**
 * Notifie le dashboard (Web Push) d'un nouvel événement du site.
 * POST {DASHBOARD_PUSH_URL}/api/push/notify avec X-Webhook-Token.
 *
 * Contrat : non bloquant, ne lève JAMAIS d'exception, dormant (log warn)
 * si DASHBOARD_PUSH_URL / DASHBOARD_PUSH_TOKEN sont absentes. Timeout 3 s.
 * L'appelant n'a pas besoin d'`await`.
 */
async function notifyDashboard({ title, body, url } = {}) {
  try {
    // Lues à l'appel (pas au chargement) : suit la config réelle du process.
    const base  = process.env.DASHBOARD_PUSH_URL || ''
    const token = process.env.DASHBOARD_PUSH_TOKEN || ''
    if (!base || !token) {
      console.warn('[notify] DASHBOARD_PUSH_URL/TOKEN manquantes — notification ignorée.')
      return false
    }

    const res = await fetch(base.replace(/\/+$/, '') + '/api/push/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Webhook-Token': token },
      body: JSON.stringify({ title: clip(title, 80), body: clip(body, 140), url: url || '/' }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) {
      console.warn('[notify] Réponse inattendue', res.status)
      return false
    }
    return true
  } catch (err) {
    console.warn('[notify] échec (non-bloquant):', err.message)
    return false
  }
}

module.exports = { notifyDashboard }
