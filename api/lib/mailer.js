const nodemailer = require('nodemailer')

let cachedTransport = null

function getTransport() {
  if (cachedTransport) return cachedTransport
  cachedTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  return cachedTransport
}

/**
 * Envoie le devis PDF en pièce jointe à l'adresse interne Foga-Tech.
 */
async function sendDevisEmail({ reference, nom, tel, profile, ville, zone, description, categorie, pdfBuffer }) {
  const transport = getTransport()
  const to = process.env.DEVIS_TO || 'contact@foga-tech.com'
  const from = process.env.SMTP_FROM || process.env.SMTP_USER

  const localisation = [zone, ville].filter(Boolean).join(', ') || '—'

  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;color:#1a2535;">
  <h2 style="color:#FF6B00;margin:0 0 16px;">Nouvelle demande de devis — ${reference}</h2>
  <table style="border-collapse:collapse;width:100%;font-size:14px;">
    <tr><td style="padding:6px 0;color:#8a96a3;width:140px;">Demandeur</td><td><strong>${nom}</strong></td></tr>
    <tr><td style="padding:6px 0;color:#8a96a3;">Téléphone</td><td>${tel}</td></tr>
    <tr><td style="padding:6px 0;color:#8a96a3;">Profil</td><td>${profile || '—'}</td></tr>
    <tr><td style="padding:6px 0;color:#8a96a3;">Catégorie</td><td>${categorie || '—'}</td></tr>
    <tr><td style="padding:6px 0;color:#8a96a3;">Localisation</td><td>${localisation}</td></tr>
    <tr><td style="padding:6px 0;color:#8a96a3;vertical-align:top;">Description</td><td style="white-space:pre-wrap;">${(description || '').replace(/[<>&]/g, '')}</td></tr>
  </table>
  <p style="margin-top:20px;color:#8a96a3;font-size:12px;">Devis complet en pièce jointe (PDF).</p>
</div>`

  const attachments = pdfBuffer
    ? [{ filename: `Devis-${reference}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
    : []

  await transport.sendMail({
    from: `"Foga-Tech Devis" <${from}>`,
    to,
    replyTo: process.env.DEVIS_REPLY_TO || undefined,
    subject: `Devis ${reference} · ${nom}`,
    html,
    attachments,
  })
}

module.exports = { sendDevisEmail, getTransport }
