'use strict'

const https = require('https')
const http = require('http')

const NOCODB_API_URL   = process.env.NOCODB_API_URL   || ''
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN || ''
const NOCODB_TABLE_ID  = process.env.NOCODB_TABLE_ID  || ''

/**
 * Écrit un enregistrement dans la table leads NocoDB (CRM).
 * Ne lève jamais d'exception vers l'appelant : renvoie une promesse qui se résout
 * TOUJOURS, à `true` si NocoDB a enregistré la ligne, sinon `false`. Les appelants
 * « fire-and-forget » peuvent l'ignorer ; le chat s'en sert pour ne pas annoncer
 * « message transmis » quand rien n'a été conservé.
 *
 * @param {Object} data  - Champs à persister (type, nom, telephone, email, …)
 * @param {string} label - Libellé de log ("Devis", "Lead contact", …)
 * @returns {Promise<boolean>}
 */
const REQUEST_TIMEOUT_MS = 8000

function postRecord(data, label) {
  if (!NOCODB_API_URL || !NOCODB_API_TOKEN || !NOCODB_TABLE_ID) {
    console.warn('[nocodb] Variables d\'environnement manquantes — envoi ignoré.')
    return Promise.resolve(false)
  }

  const payload = JSON.stringify(data)

  let urlBase
  try {
    urlBase = new URL(NOCODB_API_URL)
  } catch (e) {
    console.error('[nocodb] NOCODB_API_URL invalide:', NOCODB_API_URL)
    return Promise.resolve(false)
  }

  const path = `/api/v2/tables/${NOCODB_TABLE_ID}/records`
  const isHttps = urlBase.protocol === 'https:'
  const transport = isHttps ? https : http
  const port = urlBase.port || (isHttps ? 443 : 80)

  const options = {
    hostname: urlBase.hostname,
    port,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'xc-token': NOCODB_API_TOKEN,
    },
  }

  return new Promise((resolve) => {
    const req = transport.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[nocodb] ${label} enregistré (status`, res.statusCode + ')')
          return resolve(true)
        }
        console.error('[nocodb] Réponse inattendue', res.statusCode, body.slice(0, 200))
        resolve(false)
      })
      res.on('error', () => resolve(false))
    })

    req.setTimeout(REQUEST_TIMEOUT_MS, () => req.destroy(new Error('délai dépassé')))
    req.on('error', (err) => {
      console.error('[nocodb] Erreur réseau:', err.message)
      resolve(false)
    })

    req.write(payload)
    req.end()
  })
}

/** Devis / location (comportement historique : les appelants n'attendent pas). */
function saveDevisToNocoDB(data) {
  return postRecord(data, 'Devis')
}

/** Lead générique (contact, chat, …). Même mécanisme que les devis. */
function saveLeadToNocoDB(data) {
  return postRecord(data, `Lead ${data && data.type ? data.type : ''}`.trim())
}

module.exports = { saveDevisToNocoDB, saveLeadToNocoDB }
