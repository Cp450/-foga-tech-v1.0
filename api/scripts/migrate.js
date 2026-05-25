#!/usr/bin/env node
/**
 * Migration runner — exécute migrations/*.sql par ordre alphabétique.
 * Track applied dans table _migrations.
 */
const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename   TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

async function applied() {
  const { rows } = await pool.query(`SELECT filename FROM _migrations`)
  return new Set(rows.map((r) => r.filename))
}

async function run() {
  const dir = path.join(__dirname, '..', 'migrations')
  if (!fs.existsSync(dir)) {
    console.error(`[migrate] dossier introuvable: ${dir}`)
    process.exit(1)
  }
  await ensureTable()
  const done = await applied()
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()
  let count = 0
  for (const file of files) {
    if (done.has(file)) {
      console.log(`[migrate] skip  ${file} (déjà appliqué)`)
      continue
    }
    const sql = fs.readFileSync(path.join(dir, file), 'utf8')
    console.log(`[migrate] apply ${file}…`)
    try {
      await pool.query(sql)
      await pool.query(`INSERT INTO _migrations (filename) VALUES ($1)`, [file])
      count++
      console.log(`[migrate]   ✓ ${file}`)
    } catch (e) {
      console.error(`[migrate]   ✗ ${file}: ${e.message}`)
      process.exit(1)
    }
  }
  console.log(`[migrate] terminé — ${count} migration(s) appliquée(s).`)
  await pool.end()
}

run().catch((e) => {
  console.error('[migrate] erreur fatale:', e)
  process.exit(1)
})
