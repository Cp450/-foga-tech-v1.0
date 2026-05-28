const express = require('express')
const router = express.Router()
const { query } = require('../db')
const { sendContactNotification } = require('../lib/mailer')

// POST /api/contact
router.post('/', async (req, res) => {
  const { nom, email, sujet, message } = req.body || {}
  if (!nom || !message) {
    return res.status(400).json({ success: false, error: 'Nom et message requis.' })
  }

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

  if (!savedId && !mailOk) {
    return res.status(500).json({ success: false, error: 'Erreur enregistrement message.' })
  }

  return res.status(201).json({ success: true, id: savedId, emailed: mailOk })
})

module.exports = router
