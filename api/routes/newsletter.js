const express = require('express')
const router = express.Router()
const { query } = require('../db')

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST /api/newsletter
router.post('/', async (req, res) => {
  const email = String(req.body?.email || '').toLowerCase().trim()
  const source = String(req.body?.source || 'site').slice(0, 32)
  if (!EMAIL_RX.test(email)) {
    return res.status(400).json({ success: false, error: 'Email invalide.' })
  }
  try {
    const sql = `
      INSERT INTO newsletter_subscribers (email, source) VALUES ($1, $2)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `
    const { rows } = await query(sql, [email, source])
    if (rows.length === 0) {
      // Email déjà inscrit — UX traite comme succès silencieux
      return res.status(409).json({ success: true, duplicate: true })
    }
    res.status(201).json({ success: true, id: rows[0].id })
  } catch (e) {
    console.error('[newsletter]', e.message)
    res.status(500).json({ success: false, error: 'Erreur enregistrement.' })
  }
})

module.exports = router
