const express = require('express')
const router = express.Router()
const { query } = require('../db')

// GET /api/reviews — liste avis vérifiés
router.get('/', async (req, res) => {
  const verified = req.query.verified === 'true'
  const limit = Math.min(parseInt(req.query.limit, 10) || 12, 50)
  try {
    const sql = verified
      ? `SELECT id, client_name, project_type, rating, comment, ville, created_at FROM reviews WHERE verified = true ORDER BY created_at DESC LIMIT $1`
      : `SELECT id, client_name, project_type, rating, comment, ville, created_at FROM reviews ORDER BY created_at DESC LIMIT $1`
    const { rows } = await query(sql, [limit])
    res.json(rows)
  } catch (e) {
    console.error('[reviews GET]', e.message)
    res.status(500).json([])
  }
})

// POST /api/reviews — nouvel avis (verified=false par défaut, modération manuelle)
router.post('/', async (req, res) => {
  const { client_name, project_type, rating, comment, ville } = req.body || {}
  if (!client_name || !rating || !comment) {
    return res.status(400).json({ success: false, error: 'client_name, rating et comment requis.' })
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, error: 'rating doit être entre 1 et 5.' })
  }
  try {
    const sql = `
      INSERT INTO reviews (client_name, project_type, rating, comment, ville, verified)
      VALUES ($1,$2,$3,$4,$5,false) RETURNING id
    `
    const { rows } = await query(sql, [client_name, project_type || null, rating, comment, ville || null])
    res.status(201).json({ success: true, id: rows[0].id })
  } catch (e) {
    console.error('[reviews POST]', e.message)
    res.status(500).json({ success: false, error: 'Erreur enregistrement avis.' })
  }
})

module.exports = router
