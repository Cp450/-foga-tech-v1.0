const express = require('express')
const router = express.Router()
const { query } = require('../db')
const { sendDevisEmail, sendClientConfirmation, sendLocationDevisEmail, sendLocationClientConfirmation } = require('../lib/mailer')
const { generatePdf } = require('../lib/pdf')
const { saveDevisToNocoDB } = require('../lib/nocodb')

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

  // 4. Confirmation email to client (best-effort, only if email provided)
  let clientMailOk = false
  if (email) {
    try {
      await sendClientConfirmation(email, {
        reference, nom, tel, categorie, ville, zone, quartier, description, budget, surface,
      })
      clientMailOk = true
    } catch (clientMailErr) {
      console.warn('[devis] client confirmation email error (non-bloquant):', clientMailErr.message)
    }
  }

  // 5. NocoDB CRM (fire-and-forget, non-bloquant)
  saveDevisToNocoDB({
    type: 'standard',
    nom,
    telephone: tel,
    email: email || null,
    message: description || null,
    statut: 'Nouveau',
  })

  // n8n — qualification IA + pipeline enrichi (parallèle, non-bloquant, dormant si var absente)
  if (process.env.N8N_DEVIS_WEBHOOK) {
    fetch(process.env.N8N_DEVIS_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'standard',
        nom,
        telephone: tel,
        email: email || null,
        lieu_chantier: [ville, quartier].filter(Boolean).join(', ') || null,
        machines: [],
        date_debut: null,
        date_fin: null,
        message: [description, categorie && `Catégorie : ${categorie}`, budget && `Budget : ${budget}`, surface && `Surface : ${surface}`]
          .filter(Boolean).join(' · ') || null,
        statut: 'Nouveau',
      }),
    }).catch(err => console.error('[devis] n8n webhook error (non-bloquant):', err.message))
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
    clientConfirmed: clientMailOk,
  })
})

// POST /api/devis_requests/location — demande de location d'engins
router.post('/location', async (req, res) => {
  const {
    machines,
    dateDebut,
    dateFin,
    lieuChantier,
    accesChantier,
    nom,
    telephone,
    email,
    message,
  } = req.body

  // --- Validation ---
  const errors = []

  if (!nom || !nom.trim()) errors.push('Le champ nom est requis.')
  if (!telephone || !telephone.trim()) errors.push('Le champ telephone est requis.')
  if (!lieuChantier || !lieuChantier.trim()) errors.push('Le champ lieuChantier est requis.')
  if (!Array.isArray(machines) || machines.length === 0) {
    errors.push('Au moins une machine doit être sélectionnée.')
  }
  if (!dateDebut) {
    errors.push('La date de début est requise.')
  }
  if (!dateFin) {
    errors.push('La date de fin est requise.')
  }
  if (dateDebut && dateFin && new Date(dateDebut) >= new Date(dateFin)) {
    errors.push('La date de début doit être antérieure à la date de fin.')
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors })
  }

  const reference = makeReference()
  let mailOk = false
  let clientMailOk = false

  // Email interne équipe
  try {
    await sendLocationDevisEmail({
      reference,
      nom,
      telephone,
      email,
      machines,
      dateDebut,
      dateFin,
      lieuChantier,
      accesChantier,
      message,
    })
    mailOk = true
  } catch (mailErr) {
    console.error('[devis/location] mail équipe error (non-bloquant):', mailErr.message)
  }

  // Email confirmation client (uniquement si email fourni)
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    try {
      await sendLocationClientConfirmation(email, {
        reference,
        nom,
        telephone,
        machines,
        dateDebut,
        dateFin,
        lieuChantier,
        accesChantier,
        message,
      })
      clientMailOk = true
    } catch (clientMailErr) {
      console.warn('[devis/location] mail client error (non-bloquant):', clientMailErr.message)
    }
  }

  // NocoDB CRM (fire-and-forget, non-bloquant)
  saveDevisToNocoDB({
    type: 'location',
    nom,
    telephone,
    email: email || null,
    lieu_chantier: lieuChantier,
    machines: JSON.stringify(machines),
    date_debut: dateDebut,
    date_fin: dateFin,
    message: message || null,
    statut: 'Nouveau',
  })

  // n8n — qualification IA + pipeline enrichi (en parallèle, non-bloquant, dormant si var absente)
  if (process.env.N8N_DEVIS_WEBHOOK) {
    fetch(process.env.N8N_DEVIS_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'location',
        nom,
        telephone,
        email: email || null,
        lieu_chantier: lieuChantier,
        machines,
        date_debut: dateDebut,
        date_fin: dateFin,
        message: message || null,
        statut: 'Nouveau',
      }),
    }).catch(err => console.error('[devis/location] n8n webhook error (non-bloquant):', err.message))
  }

  if (!mailOk) {
    return res.status(500).json({
      success: false,
      error: "Aucun canal de transmission disponible. Réessayez ou contactez-nous sur WhatsApp.",
    })
  }

  return res.status(201).json({
    success: true,
    reference,
    emailed: mailOk,
    clientConfirmed: clientMailOk,
  })
})

module.exports = router