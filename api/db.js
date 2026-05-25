const { Pool } = require('pg')
require('dotenv').config()

if (!process.env.DATABASE_URL) {
  console.warn('[db] DATABASE_URL non défini — la persistance échouera silencieusement.')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

pool.on('error', (err) => {
  console.error('[db] Pool error:', err.message)
})

async function query(text, params) {
  return pool.query(text, params)
}

module.exports = { pool, query }
