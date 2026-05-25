const express = require('express')
const router = express.Router()
const { query } = require('../db')

// GET /api/engins — liste catalogue + stock
router.get('/', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, icon, name, available, total, price, tag FROM engins ORDER BY sort_order ASC, name ASC`
    )
    res.json(rows)
  } catch (e) {
    console.error('[engins]', e.message)
    res.status(500).json([])
  }
})

module.exports = router
