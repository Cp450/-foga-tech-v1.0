const express = require('express')
const router = express.Router()
const { query } = require('../db')

// POST /api/contact
router.post('/', async (req, res) => {
  const { nom, email, sujet, message } = req.body || {}
  if (!nom || !message) {
    return res.status(400).json({ success: false, error: 'Nom et message requis.' })
  }
  try {
    const sql = `INSERT INTO contact_messages (nom, email, sujet, message) VALUES ($1,$2,$3,$4) RETURNING id`
    const { rows } = await query(sql, [nom, email || null, sujet || null, message])
    return res.status(201).json({ success: true, id: rows[0].id })
  } catch (e) {
    console.error('[contact]', e.message)
    return res.status(500).json({ success: false, error: 'Erreur enregistrement message.' })
  }
})

module.exports = router
