const { PDFDocument, StandardFonts, rgb } = require('pdf-lib')
const fs = require('fs')
const path = require('path')

const W = 595.28
const H = 841.89
const M = 40 // margin

function hex(h) {
  return rgb(
    parseInt(h.slice(1, 3), 16) / 255,
    parseInt(h.slice(3, 5), 16) / 255,
    parseInt(h.slice(5, 7), 16) / 255
  )
}

const C = {
  navy:   hex('#001022'),
  orange: hex('#FF6B00'),
  blue:   hex('#234998'),
  gray:   hex('#6b7280'),
  lgray:  hex('#9ca3af'),
  border: hex('#e5e7eb'),
  bg:     hex('#f8fafc'),
}

function wrapText(text, font, size, maxW) {
  const str = String(text || '—').replace(/\r\n|\r/g, '\n')
  const paragraphs = str.split('\n')
  const lines = []
  for (const para of paragraphs) {
    const words = para.split(' ')
    let cur = ''
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w
      if (font.widthOfTextAtSize(test, size) > maxW && cur) {
        lines.push(cur)
        cur = w
      } else {
        cur = test
      }
    }
    if (cur) lines.push(cur)
  }
  return lines.length ? lines : ['—']
}

function fit(text, font, size, maxW) {
  const str = String(text || '—')
  if (font.widthOfTextAtSize(str, size) <= maxW) return str
  let s = str
  while (s.length > 1 && font.widthOfTextAtSize(s + '…', size) > maxW) s = s.slice(0, -1)
  return s + '…'
}

async function generatePdf(data) {
  const {
    reference = '—', dateStr = '—', validityStr = '—',
    nom = '—', tel = '—', profile = '—', email = '',
    categorie = '—', zone = '', ville = '', description = '—',
    budget = '', surface = '',
  } = data

  const loc = [zone, ville].filter(Boolean).join(', ') || '—'

  const doc = await PDFDocument.create()
  doc.setTitle(`Devis ${reference} — Foga-Tech International`)
  doc.setAuthor('Foga-Tech International')

  const page = doc.addPage([W, H])
  const R = await doc.embedFont(StandardFonts.Helvetica)
  const B = await doc.embedFont(StandardFonts.HelveticaBold)

  const t = ({ text, x, y, size = 9, font = R, color = C.navy }) =>
    page.drawText(String(text ?? '—'), { x, y, size, font, color })

  const box = (x, y, w, h, color) =>
    page.drawRectangle({ x, y, width: w, height: h, color })

  const ln = (x1, y1, x2, y2, color = C.border, thickness = 0.5) =>
    page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, color, thickness })

  const rj = (text, rightX, y, size, font = R, color = C.navy) => {
    const w = font.widthOfTextAtSize(String(text), size)
    t({ text, x: rightX - w, y, size, font, color })
  }

  // ─── ORANGE TOP BAND ──────────────────────────────────────
  box(0, H - 5, W, 5, C.orange)

  // ─── LOGO (best-effort) ───────────────────────────────────
  const logoPath = path.join(__dirname, '..', 'assets', 'logo.png')
  let logoEmbedded = false
  try {
    const logoBytes = fs.readFileSync(logoPath)
    const logoImg = await doc.embedPng(logoBytes)
    // Original 411×325 → scale to fit 110pt wide
    const logoW = 110
    const logoH = Math.round(logoW * (325 / 411))
    page.drawImage(logoImg, { x: M, y: H - 14 - logoH, width: logoW, height: logoH })
    logoEmbedded = true
  } catch (_) { /* logo absent — fallback to text */ }

  // ─── HEADER ───────────────────────────────────────────────
  if (!logoEmbedded) {
    t({ text: 'Foga-Tech International', x: M, y: H - 30, size: 15, font: B })
  }
  const subY = logoEmbedded ? H - 79 : H - 44
  t({ text: 'BTP · Génie Civil · Génie Rural · Location Engins', x: M, y: subY, size: 8, color: C.gray })
  t({ text: '+242 06 990 56 40  |  contact@foga-tech.com', x: M, y: subY - 11, size: 8, color: C.gray })
  t({ text: 'Brazzaville, Congo-Brazzaville', x: M, y: subY - 22, size: 8, color: C.gray })

  rj(`DEVIS — ${reference}`, W - M, H - 30, 16, B)
  rj(`Date : ${dateStr}`, W - M, H - 47, 8, R, C.gray)
  rj(`Validité : ${validityStr}`, W - M, H - 59, 8, R, C.gray)

  const sepY = logoEmbedded ? H - 108 : H - 80
  ln(M, sepY, W - M, sepY, C.navy, 1.5)

  // ─── DE / DEMANDEUR ───────────────────────────────────────
  let y = sepY - 20

  t({ text: 'DE', x: M, y, size: 7, font: B, color: C.lgray })
  t({ text: 'DEMANDEUR', x: W / 2, y, size: 7, font: B, color: C.lgray })

  y -= 14
  t({ text: 'Foga-Tech International', x: M, y, size: 10, font: B })
  t({ text: fit(nom, B, 10, 230), x: W / 2, y, size: 10, font: B })

  y -= 13
  t({ text: 'Brazzaville, Congo', x: M, y, size: 8, color: C.gray })
  t({ text: fit(tel, R, 8, 230), x: W / 2, y, size: 8, color: C.gray })

  y -= 11
  t({ text: '+242 06 990 56 40 / 06 961 06 35', x: M, y, size: 8, color: C.gray })
  const contactLine = email ? fit(email, R, 8, 230) : fit(profile, R, 8, 230)
  t({ text: contactLine, x: W / 2, y, size: 8, color: C.gray })

  y -= 24
  ln(M, y + 10, W - M, y + 10, C.border)

  // ─── TABLE ────────────────────────────────────────────────
  y -= 8

  const col2 = M + 220
  const col3 = M + 375

  // Table header
  box(M, y - 2, W - 2 * M, 18, hex('#eef2ff'))
  t({ text: 'DESCRIPTION', x: M + 6, y: y + 2, size: 7.5, font: B, color: C.blue })
  t({ text: 'LOCALISATION', x: col2 + 6, y: y + 2, size: 7.5, font: B, color: C.blue })
  t({ text: 'PROFIL', x: col3 + 6, y: y + 2, size: 7.5, font: B, color: C.blue })
  ln(M, y - 2, W - M, y - 2, C.navy, 1)
  ln(M, y + 16, W - M, y + 16, C.navy, 1)

  y -= 20

  // Row 1
  t({ text: fit(categorie, R, 9, 212), x: M + 6, y: y + 4, size: 9 })
  t({ text: fit(loc, R, 9, 147), x: col2 + 6, y: y + 4, size: 9 })
  t({ text: fit(profile, R, 9, 110), x: col3 + 6, y: y + 4, size: 9 })

  y -= 18
  ln(M, y + 18, W - M, y + 18, C.border)

  // Row 2: budget / surface
  if (budget || surface) {
    t({ text: 'Infos complémentaires', x: M + 6, y: y + 4, size: 8, color: C.gray })
    if (budget) t({ text: fit(String(budget), R, 8, 147), x: col2 + 6, y: y + 4, size: 8, color: C.gray })
    if (surface) t({ text: `${surface} m²`, x: col3 + 6, y: y + 4, size: 8, color: C.gray })
    y -= 18
    ln(M, y + 18, W - M, y + 18, C.border)
  }

  // ─── DESCRIPTION ──────────────────────────────────────────
  y -= 22
  t({ text: 'DESCRIPTION DU PROJET', x: M, y, size: 7.5, font: B, color: C.lgray })
  y -= 12

  const descLines = wrapText(description, R, 8.5, W - 2 * M - 26)
  const maxLines = Math.min(descLines.length, 15)
  const descH = maxLines * 13 + 20

  box(M, y - descH, W - 2 * M, descH, C.bg)
  box(M, y - descH, 3, descH, C.orange)
  ln(M, y, W - M, y, C.border)
  ln(M, y - descH, W - M, y - descH, C.border)
  ln(W - M, y - descH, W - M, y, C.border)

  let dy = y - 13
  for (let i = 0; i < maxLines; i++) {
    t({ text: descLines[i], x: M + 10, y: dy, size: 8.5, color: C.gray })
    dy -= 13
  }

  y -= descH + 22

  // ─── SIGNATURE ────────────────────────────────────────────
  box(M, y - 44, W - 2 * M, 44, C.bg)
  ln(M, y - 44, W - M, y - 44, C.border)
  ln(M, y, W - M, y, C.border)
  ln(M, y - 44, M, y, C.border)
  ln(W - M, y - 44, W - M, y, C.border)
  t({ text: 'CONFIRMATION DU DEMANDEUR', x: M + 10, y: y - 14, size: 7.5, font: B })
  t({ text: "En soumettant cette demande, le demandeur certifie l'exactitude des informations renseignées", x: M + 10, y: y - 27, size: 7.5, color: C.gray })
  t({ text: "et autorise Foga-Tech International à les traiter dans le cadre de l'établissement d'un devis.", x: M + 10, y: y - 38, size: 7.5, color: C.gray })

  // ─── FOOTER ───────────────────────────────────────────────
  box(0, 0, W, 28, C.navy)
  const footerStr = `${reference}  ·  foga-tech.com  ·  Document généré automatiquement`
  const fw = R.widthOfTextAtSize(footerStr, 7.5)
  t({ text: footerStr, x: (W - fw) / 2, y: 9, size: 7.5, color: rgb(0.65, 0.65, 0.65) })

  const pdfBytes = await doc.save()
  return Buffer.from(pdfBytes)
}

module.exports = { generatePdf, buildHtml: () => '' }
