'use strict'

/**
 * Création d'une conversation Chatwoot depuis le chat du site (« parler à un conseiller »).
 *
 * Utilise l'API publique « client » de Chatwoot (sans clé d'API admin, seulement
 * l'identifiant public de la boîte) :
 *   1. POST {CHATWOOT_URL}/public/api/v1/inboxes/{inbox_identifier}/contacts
 *        → { source_id, … }
 *   2. POST …/contacts/{source_id}/conversations
 *        → { id, … }
 *   3. POST …/contacts/{source_id}/conversations/{id}/messages   { content }
 *
 * Contrat : ne lève JAMAIS d'exception, dormant (log warn) si CHATWOOT_URL ou
 * CHATWOOT_INBOX_IDENTIFIER est absente. Timeout 5 s par appel.
 * Ne journalise que des statuts et des identifiants (jamais de contenu ni de numéro).
 */

const TIMEOUT_MS = 5000

// E.164 : « + », un premier chiffre 1-9, 8 à 15 chiffres au total (Chatwoot refuse le reste).
const E164 = /^\+[1-9]\d{7,14}$/

async function post(url, body, step) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) {
    const err = new Error(`${step}: HTTP ${res.status}`)
    err.step = step
    throw err
  }
  return res.json()
}

/**
 * @param {Object} p
 * @param {string} p.nom
 * @param {string} p.telephone - numéro tel que saisi (normalisé « +chiffres » si E.164)
 * @param {string} p.content   - texte brut du premier message (transcript)
 * @returns {Promise<{ok:boolean, conversationId?:number, skipped?:boolean, step?:string}>}
 */
async function createChatwootConversation({ nom, telephone, content } = {}) {
  try {
    const base = (process.env.CHATWOOT_URL || '').trim().replace(/\/+$/, '')
    const inbox = (process.env.CHATWOOT_INBOX_IDENTIFIER || '').trim()
    if (!base || !inbox) {
      console.warn('[chatwoot] CHATWOOT_URL/CHATWOOT_INBOX_IDENTIFIER manquantes — conversation ignorée.')
      return { ok: false, skipped: true }
    }

    const root = `${base}/public/api/v1/inboxes/${encodeURIComponent(inbox)}`

    // phone_number seulement s'il est un E.164 valide (sinon Chatwoot rejette le contact) ;
    // le numéro reste de toute façon dans le texte du message.
    const compact = String(telephone || '').replace(/[\s-]/g, '')
    const contactBody = { name: nom }
    if (E164.test(compact)) contactBody.phone_number = compact

    const contact = await post(`${root}/contacts`, contactBody, 'contact')
    const sourceId = contact && contact.source_id
    if (!sourceId) throw Object.assign(new Error('contact: source_id absent'), { step: 'contact' })

    const convRoot = `${root}/contacts/${encodeURIComponent(sourceId)}/conversations`
    const conv = await post(convRoot, {}, 'conversation')
    const convId = conv && conv.id
    if (convId == null) throw Object.assign(new Error('conversation: id absent'), { step: 'conversation' })

    await post(`${convRoot}/${encodeURIComponent(convId)}/messages`, { content }, 'message')

    console.log(`[chatwoot] conversation créée id=${convId}`)
    return { ok: true, conversationId: convId }
  } catch (err) {
    // err.message ne contient que l'étape + le statut HTTP, ou une erreur réseau générique.
    console.warn('[chatwoot] échec (non-bloquant):', err.step ? err.message : (err.name || 'erreur') + ' ' + (err.code || ''))
    return { ok: false, step: err.step }
  }
}

module.exports = { createChatwootConversation }
