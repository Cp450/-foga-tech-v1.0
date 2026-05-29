'use strict'

const https = require('https')
const http = require('http')

const NOCODB_API_URL   = process.env.NOCODB_API_URL   || ''
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN || ''
const NOCODB_TABLE_ID  = process.env.NOCODB_TABLE_ID  || ''

/**
 * Envoie un enregistrement de devis vers NocoDB (CRM).
 * Non-bloquant : ne lève jamais d'exception vers l'appelant.
 *
 * @param {Object} data - Champs à persister (type, nom, telephone, email, …)
 */
function saveDevisToNocoDB(data) {
  if (!NOCODB_API_URL || !NOCODB_API_TOKEN || !NOCODB_TABLE_ID) {
    console.warn('[nocodb] Variables d\'environnement manquantes — envoi ignoré.')
    return
  }

  const payload = JSON.stringify(data)

  let urlBase
  try {
    urlBase = new URL(NOCODB_API_URL)
  } catch (e) {
    console.error('[nocodb] NOCODB_API_URL invalide:', NOCODB_API_URL)
    return
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

  const req = transport.request(options, (res) => {
    let body = ''
    res.on('data', (chunk) => { body += chunk })
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('[nocodb] Devis enregistré (status', res.statusCode + ')')
      } else {
        console.error('[nocodb] Réponse inattendue', res.statusCode, body.slice(0, 200))
      }
    })
  })

  req.on('error', (err) => {
    console.error('[nocodb] Erreur réseau:', err.message)
  })

  req.write(payload)
  req.end()
}

module.exports = { saveDevisToNocoDB }
