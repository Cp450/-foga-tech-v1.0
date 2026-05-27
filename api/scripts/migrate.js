#!/usr/bin/env node
'use strict'

const fs   = require('fs')
const path = require('path')
const { Pool } = require('pg')
require('dotenv').config()

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('[migrate] DATABASE_URL manquant — définir avant de lancer.')
  process.exit(1)
}

const pool = new Pool({ connectionString: DATABASE_URL })

const FILES = [
  '001_init.sql',
  '002_seed_engins.sql',
]

async function run() {
  const client = await pool.connect()
  try {
    for (const file of FILES) {
      const filepath = path.join(__dirname, '..', 'migrations', file)
      const sql = fs.readFileSync(filepath, 'utf8')
      console.log(`\n▶  Applying ${file} ...`)
      await client.query(sql)
      console.log(`✔  ${file} done.`)
    }
    console.log('\n✅  All migrations applied successfully.')
  } catch (err) {
    console.error('\n❌  Migration error:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

run()
