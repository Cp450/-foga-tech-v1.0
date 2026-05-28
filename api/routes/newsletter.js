const express = require('express')
const router = express.Router()
const { query } = require('../db')
const { sendNewsletterConfirmation } = require('../lib/mailer')

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST /api/newsletter
router.post('/', async (req, res) => {
  const email = String(req.body?.email || '').toLowerCase().trim()
  const source = String(req.body?.source || 'site').slice(0, 32)
  if (!EMAIL_RX.test(email)) {
    return res.status(400).json({ success: false, error: 'Email invalide.' })
  }

  // 1. Persist
  let isNew = false
  try {
    const sql = `
      INSERT INTO newsletter_subscribers (email, source) VALUES ($1, $2)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `
    const { rows } = await query(sql, [email, source])
    isNew = rows.length > 0
    if (!isNew) {
      // Déjà inscrit — succès silencieux, pas de second email
      return res.status(409).json({ success: true, duplicate: true })
    }
  } catch (e) {
    console.error('[newsletter]', e.message)
    return res.status(500).json({ success: false, error: 'Erreur enregistrement.' })
  }

  // 2. Email de confirmation au subscriber (best-effort, nouveaux inscrits seulement)
  try {
    await sendNewsletterConfirmation(email)
  } catch (mailErr) {
    console.warn('[newsletter] confirmation email error (non-bloquant):', mailErr.message)
  }

  res.status(201).json({ success: true })
})

module.exports = router
