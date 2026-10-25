const express = require('express')
const router = express.Router()
const { query } = require('../db')
const { sendContactNotification } = require('../lib/mailer')
const { saveLeadToNocoDB } = require('../lib/nocodb')
const { notifyDashboard } = require('../lib/notify')
const { antispam } = require('../lib/antispam')

// POST /api/contact
router.post('/', antispam({
  scope: 'contact',
  fake: () => ({ success: true, id: null, emailed: true }),
}), async (req, res) => {
  const raw = req.body || {}
  // nom et message : du texte non vide (un objet ou un tableau n'est pas un nom).
  if (typeof raw.nom !== 'string' || typeof raw.message !== 'string' || !raw.nom.trim() || !raw.message.trim()) {
    return res.status(400).json({ success: false, error: 'Nom et message requis.' })
  }
  // Longueurs bornées AVANT la base, le mail et le CRM : un message de 600 Ko ne doit pas être stocké tel quel.
  const clip = (s, n) => String(s == null ? '' : s).trim().slice(0, n)
  const nom = clip(raw.nom, 100)
  const email = clip(raw.email, 254)
  const sujet = clip(raw.sujet, 150)
  const message = clip(raw.message, 5000)

  // 1. Persist (best-effort)
  let savedId = null
  try {
    const sql = `INSERT INTO contact_messages (nom, email, sujet, message) VALUES ($1,$2,$3,$4) RETURNING id`
    const { rows } = await query(sql, [nom, email || null, sujet || null, message])
    savedId = rows[0]?.id
  } catch (e) {
    console.error('[contact] DB error (non-bloquant):', e.message)
  }

  // 2. Notification email interne (best-effort)
  let mailOk = false
  try {
    await sendContactNotification({ nom, email, sujet, message })
    mailOk = true
  } catch (mailErr) {
    console.warn('[contact] mail error (non-bloquant):', mailErr.message)
  }

  // 3. CRM NocoDB (fire-and-forget, non-bloquant) — le contact devient un lead.
  // Le dashboard traite les leads type 'contact' comme qualifiés (transform.js isQualified).
  saveLeadToNocoDB({
    type: 'contact',
    nom,
    email: email || null,
    message: sujet ? `[${sujet}] ${message}` : message,
    statut: 'Nouveau',
  })

  // 4. Notification dashboard (fire-and-forget, jamais d'exception)
  notifyDashboard({
    title: 'Nouveau message de contact',
    body: `${nom}${sujet ? ' — ' + sujet : ''}`,
    url: '/?route=activite',
  })

  if (!savedId && !mailOk) {
    return res.status(500).json({ success: false, error: 'Erreur enregistrement message.' })
  }

  return res.status(201).json({ success: true, id: savedId, emailed: mailOk })
})

module.exports = router
