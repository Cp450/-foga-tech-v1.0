'use strict'

const crypto = require('crypto')
const express = require('express')
const router = express.Router()
const { saveLeadToNocoDB } = require('../lib/nocodb')
const { notifyDashboard } = require('../lib/notify')
const { createChatwootConversation } = require('../lib/chatwoot')
const { antispam } = require('../lib/antispam')

const MAX_MESSAGES = 12
const MAX_TEXT = 500
const MAX_NAME = 100
const MAX_FREE_MESSAGE = 1000

// Corps borné (≈ 12 × 500 car. + champs) : 32 Ko laissent de la marge pour l'UTF-8.
const parseBody = express.json({ limit: '32kb' })

// Caractères de contrôle (sauf \n \t) : jamais utiles dans un message de chat.
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

function cleanText(s, max) {
  const t = String(s == null ? '' : s).replace(CONTROL, '').trim()
  return t.length > max ? t.slice(0, max - 1) + '…' : t
}

function oneLine(s, max) {
  return cleanText(String(s == null ? '' : s).replace(/\s+/g, ' '), max)
}

// 8 à 16 chiffres ; autorisés : chiffres, espaces, tirets, « + » en tête uniquement.
function validPhone(raw) {
  const t = String(raw == null ? '' : raw).trim()
  if (!/^\+?[0-9][0-9 -]*$/.test(t)) return null
  const digits = t.replace(/\D/g, '')
  if (digits.length < 8 || digits.length > 16) return null
  return t.replace(/\s+/g, ' ')
}

function cleanTranscript(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m && m.role === 'visiteur' ? 'visiteur' : 'bot',
      texte: cleanText(m && m.texte, MAX_TEXT),
    }))
    .filter((m) => m.texte)
}

function newReference() {
  return 'CH-' + crypto.randomBytes(4).toString('hex').toUpperCase()
}

// Délai max d'attente d'un support durable, inférieur au délai de 15 s du navigateur.
const KEEP_DEADLINE_MS = 9000

// Résout `true` dès qu'une promesse résout `true` ; `false` si toutes échouent ou à l'échéance.
function anyTrue(promises, ms) {
  return new Promise((resolve) => {
    let pending = promises.length
    const timer = setTimeout(() => resolve(false), ms)
    const done = (v) => {
      if (v === true) { clearTimeout(timer); resolve(true); return }
      pending -= 1
      if (pending === 0) { clearTimeout(timer); resolve(false) }
    }
    promises.forEach((p) => Promise.resolve(p).then(done, () => done(false)))
  })
}

// POST /api/chat/handoff
router.post('/handoff', parseBody, antispam({
  scope: 'chat',
  fake: () => ({ success: true, reference: newReference() }),
}), async (req, res) => {
  const body = req.body || {}

  const nom = oneLine(body.nom, MAX_NAME)
  if (nom.length < 2) {
    return res.status(400).json({ success: false, error: 'Nom requis.' })
  }
  const telephone = validPhone(body.telephone)
  if (!telephone) {
    return res.status(400).json({ success: false, error: 'Numéro de téléphone invalide (8 à 16 chiffres).' })
  }
  const message = cleanText(body.message, MAX_FREE_MESSAGE)
  const transcript = cleanTranscript(body.transcript)
  const reference = newReference()

  const lastQuestion = [...transcript].reverse().find((m) => m.role === 'visiteur')

  // Contenu texte brut transmis aux conseillers (Chatwoot).
  const content = [
    'Demande de conseiller depuis le chat du site foga-tech.com',
    `Référence : ${reference}`,
    `Nom : ${nom}`,
    `Téléphone : ${telephone}`,
    message ? `Message du visiteur : ${message}` : null,
    transcript.length ? '\n--- Conversation avec l\'assistant ---' : null,
    ...transcript.map((m) => `${m.role === 'visiteur' ? 'Visiteur' : 'Assistant'} : ${m.texte}`),
  ].filter((l) => l != null).join('\n')

  // Résumé court pour le CRM : message libre + dernière question.
  const summary = oneLine(
    ['[Chat] Demande de conseiller',
      message ? `Message : ${message}` : null,
      lastQuestion ? `Dernière question : ${lastQuestion.texte}` : null,
      `Réf. ${reference}`,
    ].filter(Boolean).join(' · '),
    500,
  )

  // (a) CRM NocoDB (le dashboard montre les leads 'chat') — Promise<boolean>.
  const leadSaved = saveLeadToNocoDB({ type: 'chat', nom, telephone, message: summary, statut: 'Nouveau' })

  // (b) Notification dashboard — éphémère (ni numéro ni historique) : jamais comptée comme support durable.
  notifyDashboard({
    title: 'Un visiteur demande un conseiller',
    body: `${nom} — ${message || (lastQuestion && lastQuestion.texte) || 'depuis le chat'}`,
    url: '/?route=activite',
  })

  // (c) Conversation Chatwoot (ne lève jamais).
  const convCreated = createChatwootConversation({ nom, telephone, content }).then((r) => !!(r && r.ok))

  // On ne dit « transmis » que si AU MOINS UN support durable a conservé la demande.
  // Sinon 503 : le front renvoie alors le visiteur vers WhatsApp (jamais de cul-de-sac silencieux).
  const kept = await anyTrue([leadSaved, convCreated], KEEP_DEADLINE_MS)
  if (!kept) {
    console.error(`[chat] demande ${reference} NON conservée (NocoDB et Chatwoot indisponibles ou non configurés)`)
    return res.status(503).json({
      success: false,
      error: 'Service momentanément indisponible. Écrivez-nous directement sur WhatsApp.',
    })
  }

  return res.status(201).json({ success: true, reference })
})

// Erreurs de lecture du corps : réponses JSON propres (l'handler global répondrait 500).
// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, error: 'Message trop volumineux.' })
  }
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: 'Requête invalide.' })
  }
  console.error('[chat] erreur inattendue:', err && err.message)
  return res.status(500).json({ success: false, error: 'Erreur serveur interne' })
})

module.exports = router
