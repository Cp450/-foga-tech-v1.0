const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

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
app.use(express.json({ limit: '1mb' }))

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
  console.error('[api] error:', err)
  res.status(500).json({ success: false, error: 'Erreur serveur interne' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Foga-Tech API running on port ${PORT}`)
})
