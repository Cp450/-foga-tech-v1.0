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

function esc(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function row(label, value) {
  return `
    <tr>
      <td style="padding:10px 16px;background:#f8f9fa;color:#6b7280;font-size:13px;white-space:nowrap;border-bottom:1px solid #e5e7eb;width:160px;">${label}</td>
      <td style="padding:10px 16px;color:#111827;font-size:14px;border-bottom:1px solid #e5e7eb;">${value}</td>
    </tr>`
}

function sectionTitle(label) {
  return `<div style="color:#234998;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;">${label}</div>`
}

/**
 * Envoie la notification de devis à l'adresse interne Foga-Tech.
 */
async function sendDevisEmail({ reference, nom, tel, profile, email, ville, zone, quartier, description, categorie, budget, surface, pdfBuffer }) {
  const transport = getTransport()
  const to = process.env.DEVIS_TO || 'contact@foga-tech.com'
  const from = process.env.SMTP_FROM || process.env.SMTP_USER

  const localisation = [zone || quartier, ville].filter(Boolean).join(', ') || '—'
  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const validStr = new Date(now.getTime() + 30 * 24 * 3600 * 1000)
    .toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  // CTA : email si dispo, sinon téléphone
  const ctaHref = email ? `mailto:${esc(email)}` : `tel:${esc(tel)}`
  const ctaLabel = email ? 'Répondre par email' : `Appeler : ${esc(tel)}`

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <!-- HEADER -->
      <tr>
        <td style="background:#ffffff;padding:20px 32px;border-bottom:2px solid #234998;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align:middle;">
                <div style="color:#234998;font-size:18px;font-weight:700;line-height:1.3;">Nouvelle demande de devis</div>
                <div style="color:#828383;font-size:13px;margin-top:4px;">Référence : <strong>DV-${esc(reference)}</strong></div>
                <div style="margin-top:8px;"><span style="background:#234998;color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;">A traiter</span></div>
              </td>
              <td align="right" style="vertical-align:middle;width:160px;">
                <img src="${process.env.FRONTEND_URL || process.env.PUBLIC_BASE || ''}/logo_email.png" alt="Foga-Tech International" width="150" style="display:block;border:0;max-width:150px;">
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- DATES -->
      <tr>
        <td style="padding:0 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                <span style="color:#9ca3af;font-size:12px;">Date de demande</span><br>
                <span style="color:#374151;font-size:14px;font-weight:600;">${dateStr}</span>
              </td>
              <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;text-align:right;">
                <span style="color:#9ca3af;font-size:12px;">Validite du devis</span><br>
                <span style="color:#374151;font-size:14px;font-weight:600;">${validStr}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- SECTION: CLIENT -->
      <tr>
        <td style="padding:24px 32px 0;">
          ${sectionTitle('Informations client')}
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
            ${row('Nom', `<strong>${esc(nom)}</strong>`)}
            ${row('Telephone', `<a href="tel:${esc(tel)}" style="color:#234998;text-decoration:none;font-weight:600;">${esc(tel)}</a>`)}
            ${email ? row('Email', `<a href="mailto:${esc(email)}" style="color:#234998;text-decoration:none;">${esc(email)}</a>`) : ''}
            ${row('Profil', esc(profile) || '—')}
          </table>
        </td>
      </tr>

      <!-- SECTION: PROJET -->
      <tr>
        <td style="padding:24px 32px 0;">
          ${sectionTitle('Details du projet')}
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
            ${row('Categorie', esc(categorie) || '—')}
            ${row('Localisation', esc(localisation))}
            ${budget ? row('Budget estime', esc(budget)) : ''}
            ${surface ? row('Surface', esc(surface) + ' m²') : ''}
          </table>
        </td>
      </tr>

      <!-- SECTION: DESCRIPTION -->
      <tr>
        <td style="padding:24px 32px 0;">
          ${sectionTitle('Description des travaux')}
          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px;color:#374151;font-size:14px;line-height:1.7;white-space:pre-wrap;">${esc(description) || '—'}</div>
        </td>
      </tr>

      <!-- FOOTER IMAGE -->
      <tr>
        <td style="padding:24px 0 0;line-height:0;">
          <img src="${process.env.FRONTEND_URL || process.env.PUBLIC_BASE || ''}/footer.png" alt="Foga-Tech International" width="600" style="display:block;width:100%;border:0;max-width:600px;">
        </td>
      </tr>

      <!-- FOOTER REF -->
      <tr>
        <td style="background:#f0f4fa;padding:10px 32px;text-align:center;">
          <div style="color:#828383;font-size:11px;">DV-${esc(reference)} &middot; ${dateStr}</div>
        </td>
      </tr>

    </table>
  </td></tr>
</table>

</body>
</html>`

  const attachments = pdfBuffer
    ? [{ filename: `Devis-DV-${reference}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
    : []

  await transport.sendMail({
    from: `"Foga-Tech Devis" <${from}>`,
    to,
    replyTo: email || (process.env.DEVIS_REPLY_TO || undefined),
    subject: `[DV-${reference}] Nouveau devis — ${nom}`,
    html,
    attachments,
  })
}

module.exports = { sendDevisEmail, getTransport }
