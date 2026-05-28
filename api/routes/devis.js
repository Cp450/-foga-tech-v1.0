const express = require('express')
const router = express.Router()
const { query } = require('../db')
const { sendDevisEmail } = require('../lib/mailer')

function generatePdf() {
  return Promise.reject(new Error('PDF temporairement désactivé'))
}

function makeReference() {
  const y = new Date().getFullYear()
  const r = Math.floor(1000 + Math.random() * 9000)
  return `${y}-${r}`
}

function fmtDateFr(d) {
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

// POST /api/devis_requests
router.post('/', async (req, res) => {
  const {
    nom, tel, profile, email, categorie, budget, description,
    ville, quartier, surface, zone,
    reference: refIn,
  } = req.body

  if (!nom || !tel) {
    return res.status(400).json({ success: false, error: 'Les champs nom et tel sont requis.' })
  }

  const reference = refIn || makeReference()
  const now = new Date()
  const validity = new Date(now.getTime() + 30 * 24 * 3600 * 1000)

  let savedId = null
  let savedOk = false
  let mailOk = false

  // 1. Persist (best-effort)
  try {
    const sql = `
      INSERT INTO devis_requests (reference, nom, tel, profile, email, categorie, budget, description, ville, quartier, surface)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING id
    `
    const { rows } = await query(sql, [reference, nom, tel, profile, email, categorie, budget, description, ville, quartier, surface])
    savedId = rows[0]?.id
    savedOk = !!savedId
  } catch (dbErr) {
    console.error('[devis] DB insert error (non-bloquant):', dbErr.message)
  }

  // 2. PDF (best-effort, optional)
  let pdfBuffer = null
  try {
    pdfBuffer = await generatePdf({
      reference,
      dateStr: fmtDateFr(now),
      validityStr: fmtDateFr(validity),
      nom, tel, profile, categorie,
      zone: zone || quartier, ville, description,
      publicBase: process.env.PUBLIC_BASE || '',
    })
  } catch (pdfErr) {
    console.warn('[devis] PDF désactivé ou erreur:', pdfErr.message)
  }

  // 3. Email (best-effort, independent of PDF)
  try {
    await sendDevisEmail({
      reference, nom, tel, profile, email, ville, zone, quartier,
      description, categorie, budget, surface, pdfBuffer,
    })
    mailOk = true
  } catch (mailErr) {
    console.error('[devis] mail error (non-bloquant):', mailErr.message)
  }

  if (!savedOk && !mailOk) {
    return res.status(500).json({
      success: false,
      error: "Aucun canal de transmission disponible. Réessayez ou contactez-nous sur WhatsApp.",
    })
  }

  return res.status(201).json({
    success: true,
    id: savedId,
    reference,
    persisted: savedOk,
    emailed: mailOk,
  })
})

module.exports = router
