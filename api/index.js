const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const app = express()

// Derrière un reverse proxy (Coolify/Traefik/Nginx) : req.ip doit être l'IP du visiteur
// (anti-spam par IP). Nombre de proxys de confiance, 1 par défaut ; TRUST_PROXY=0 pour désactiver.
const trustProxy = process.env.TRUST_PROXY
app.set('trust proxy', trustProxy !== undefined && /^\d+$/.test(trustProxy) ? Number(trustProxy) : 1)

const corsOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.CORS_ORIGINS || 'https://foga-tech.com,https://www.foga-tech.com').split(',').map(o => o.trim())
  : null

app.use(cors({
  origin: (origin, cb) => {
    // No origin = curl/Postman/mobile → allow
    if (!origin || !corsOrigins) return cb(null, true)
    // Configured origins
    if (corsOrigins.includes(origin)) return cb(null, true)
    // Coolify sslip.io test URLs
    if (/\.sslip\.io$/.test(origin)) return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  },
}))
// Chat : monté AVANT le parseur global pour imposer sa propre limite de corps (32 Ko).
app.use('/api/chat', require('./routes/chat'))
app.use(express.json({ limit: '1mb' }))
app.use('/public', express.static(path.join(__dirname, 'public')))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'foga-tech-api', version: '1.0.0' })
})

// Routes
app.use('/api/devis_requests', require('./routes/devis'))
app.use('/api/contact', require('./routes/contact'))
app.use('/api/engins', require('./routes/engins'))
app.use('/api/reviews', require('./routes/reviews'))
app.use('/api/newsletter', require('./routes/newsletter'))

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint introuvable' })
})

// Error handler
app.use((err, req, res, _next) => {
  // Erreurs du client (JSON malformé, corps trop gros) : 4xx, pas un 500 qui ressemble à une panne.
  if (err && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({
      success: false,
      error: err.type === 'entity.too.large' ? 'Message trop volumineux.' : 'Requête invalide.',
    })
  }
  console.error('[api] error:', err)
  res.status(500).json({ success: false, error: 'Erreur serveur interne' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Foga-Tech API running on port ${PORT}`)
})
