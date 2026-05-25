const puppeteer = require('puppeteer')

/**
 * Build HTML template — visuel identique au récap React (DemandeDevis Q5).
 * Logos servis depuis le frontend public via URL absolue passée en param.
 */
function buildHtml(data) {
  const {
    reference,
    dateStr,
    validityStr,
    nom = '—',
    tel = '—',
    profile = '—',
    categorie = '—',
    zone = '',
    ville = '',
    description = '—',
    publicBase = '', // ex: https://foga-tech.com
  } = data

  const localisation = [zone, ville].filter(Boolean).join(', ') || '—'
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]))

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1a2535;background:#fff;padding:0;}
.doc{width:100%;background:#fff;}
.band{height:4px;background:#FF6B00;}
.header{padding:20px 32px;border-bottom:2px solid #001022;display:flex;justify-content:space-between;align-items:flex-start;}
.logo-row{display:flex;align-items:center;gap:8px;}
.logo-row img{height:42px;}
.sep{width:1px;height:24px;background:rgba(0,16,34,0.25);}
.brand-sub{font-size:9px;font-weight:700;color:#001022;text-transform:uppercase;letter-spacing:0.12em;margin-top:8px;}
.brand-info{font-size:10px;color:#4a5568;line-height:1.6;margin-top:6px;}
.devis-tag{text-align:right;}
.devis-tag h1{font-size:22px;font-weight:900;color:#001022;letter-spacing:-0.02em;}
.devis-tag p{font-size:10px;color:#8a96a3;margin-top:4px;line-height:1.5;}
.meta{display:grid;grid-template-columns:1fr 1fr;padding:18px 32px;gap:24px;border-bottom:1px solid #e8ecf0;}
.meta h3{font-size:9px;font-weight:700;color:#001022;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;}
.meta p{font-size:11px;color:#4a5568;line-height:1.6;}
.meta .name{font-size:13px;font-weight:700;color:#001022;}
.table-wrap{padding:14px 32px 6px;}
.thead{display:grid;grid-template-columns:2fr 1fr 1fr;padding-bottom:6px;border-bottom:2px solid #001022;}
.thead p{font-size:9px;font-weight:700;color:#001022;text-transform:uppercase;letter-spacing:0.08em;}
.row{display:grid;grid-template-columns:2fr 1fr 1fr;padding:10px 0;border-bottom:1px solid #e8ecf0;align-items:start;}
.row .c1{font-size:11px;color:#1a2535;font-weight:600;overflow-wrap:anywhere;padding-right:12px;}
.row .c2,.row .c3{font-size:11px;color:#4a5568;overflow-wrap:anywhere;padding-right:12px;}
.desc{margin:12px 32px 0;padding:10px 12px;background:#f7f9fb;border-radius:4px;border-left:3px solid #FF6B00;}
.desc h4{font-size:9px;font-weight:700;color:#8a96a3;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;}
.desc p{font-size:11px;color:#4a5568;line-height:1.6;overflow-wrap:anywhere;white-space:pre-wrap;}
.sig{padding:18px 32px;border-top:1px solid #e8ecf0;margin-top:18px;}
.sig h4{font-size:9px;font-weight:700;color:#001022;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;}
.sig p{font-size:9px;color:#8a96a3;font-style:italic;line-height:1.6;}
.footer{padding:14px 32px;background:#001022;color:#fff;font-size:9px;text-align:center;letter-spacing:0.05em;}
.footer span{opacity:0.6;}
</style></head><body>
<div class="doc">
  <div class="band"></div>
  <div class="header">
    <div>
      <div class="logo-row">
        ${publicBase ? `<img src="${publicBase}/icon_logo_entreprise.svg" alt=""/>
        <span class="sep"></span>
        <img src="${publicBase}/logo_entreprise_2.svg" alt=""/>` : `<strong style="font-size:18px;color:#001022;">Foga-Tech BTP</strong>`}
      </div>
      <p class="brand-sub">Foga-Tech International · Congo-Brazzaville</p>
      <p class="brand-info">
        Tél : +242 06 990 56 40 / 06 961 06 35<br/>
        contact@foga-tech.com · foga-tech.com
      </p>
    </div>
    <div class="devis-tag">
      <h1>DEVIS — ${esc(reference)}</h1>
      <p>Date : ${esc(dateStr)}<br/>Validité : ${esc(validityStr)}</p>
    </div>
  </div>

  <div class="meta">
    <div>
      <h3>De</h3>
      <p class="name">Foga-Tech International</p>
      <p>Brazzaville, Congo<br/>+242 06 990 56 40 / 06 961 06 35<br/>contact@foga-tech.com</p>
    </div>
    <div>
      <h3>Demandeur</h3>
      <p class="name">${esc(nom)}</p>
      <p>${esc(tel)}<br/>${esc(profile)}</p>
    </div>
  </div>

  <div class="table-wrap">
    <div class="thead">
      <p>Description</p><p>Localisation</p><p>Profil</p>
    </div>
    <div class="row">
      <p class="c1">${esc(categorie)}</p>
      <p class="c2">${esc(localisation)}</p>
      <p class="c3">${esc(profile)}</p>
    </div>
    <div class="row">
      <p class="c1">Localisation chantier</p>
      <p class="c2">${esc(localisation)}</p>
      <p class="c3">—</p>
    </div>
  </div>

  <div class="desc">
    <h4>Description du projet</h4>
    <p>${esc(description)}</p>
  </div>

  <div class="sig">
    <h4>Confirmation du demandeur</h4>
    <p>En soumettant cette demande, le demandeur certifie l'exactitude des informations renseignées et autorise Foga-Tech International à les traiter dans le cadre de l'établissement d'un devis personnalisé.</p>
  </div>

  <div class="footer">DV-${esc(reference)} · foga-tech.com · <span>Document généré automatiquement</span></div>
</div>
</body></html>`
}

async function generatePdf(data) {
  const html = buildHtml(data)
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })
    return pdf
  } finally {
    await browser.close()
  }
}

module.exports = { generatePdf, buildHtml }
