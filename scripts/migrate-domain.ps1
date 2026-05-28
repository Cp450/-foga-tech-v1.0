# ─────────────────────────────────────────────────────────────────────────────
# migrate-domain.ps1  —  foga-tech.tech → foga-tech.com
#
# Exécuter UNE SEULE FOIS quand foga-tech.com est configuré sur Coolify.
# Pré-requis : Git propre (git status = nothing to commit).
#
# Usage:
#   cd C:\btp-site\foga-tech-v1.0
#   .\scripts\migrate-domain.ps1
#
# Après : vérifier les diffs (git diff), puis commit + push.
# ─────────────────────────────────────────────────────────────────────────────

$old     = "foga-tech.tech"
$new     = "foga-tech.com"
$oldApi  = "api.foga-tech.tech"
$newApi  = "api.foga-tech.com"

# Fichiers web — canonicals SEO, og:url, sitemap, robots
$webFiles = @(
  "web\src\pages\APropos.jsx",
  "web\src\pages\CGU.jsx",
  "web\src\pages\ClientPortal.jsx",
  "web\src\pages\Contact.jsx",
  "web\src\pages\DemandeDevis.jsx",
  "web\src\pages\DevisParticulier.jsx",
  "web\src\pages\GenieCivil.jsx",
  "web\src\pages\GenieRural.jsx",
  "web\src\pages\Home.jsx",
  "web\src\pages\InfrastructuresRurales.jsx",
  "web\src\pages\LevagePisciculture.jsx",
  "web\src\pages\Location.jsx",
  "web\src\pages\MentionsLegales.jsx",
  "web\src\pages\PartenairesPage.jsx",
  "web\src\pages\PolitiqueConfidentialite.jsx",
  "web\src\pages\Portfolio.jsx",
  "web\src\pages\PortfolioDetail.jsx",
  "web\src\pages\SolutionsDurables.jsx",
  "web\public\robots.txt",
  "web\public\sitemap.xml"
)

# API — fallback URLs dans mailer.js
$apiFiles = @(
  "api\lib\mailer.js"
)

Write-Host "`n[1/3] Remplacement domaine frontend ($old → $new)..." -ForegroundColor Cyan
foreach ($f in $webFiles) {
  if (Test-Path $f) {
    $content = Get-Content $f -Raw -Encoding UTF8
    $updated = $content -replace [regex]::Escape($old), $new
    if ($updated -ne $content) {
      Set-Content $f $updated -Encoding UTF8 -NoNewline
      Write-Host "  ✓ $f" -ForegroundColor Green
    } else {
      Write-Host "  - $f (inchangé)" -ForegroundColor DarkGray
    }
  } else {
    Write-Host "  ✗ $f NOT FOUND" -ForegroundColor Red
  }
}

Write-Host "`n[2/3] Remplacement API domain ($oldApi → $newApi)..." -ForegroundColor Cyan
foreach ($f in $apiFiles) {
  if (Test-Path $f) {
    $content = Get-Content $f -Raw -Encoding UTF8
    $updated = $content -replace [regex]::Escape($oldApi), $newApi
    if ($updated -ne $content) {
      Set-Content $f $updated -Encoding UTF8 -NoNewline
      Write-Host "  ✓ $f" -ForegroundColor Green
    } else {
      Write-Host "  - $f (inchangé)" -ForegroundColor DarkGray
    }
  } else {
    Write-Host "  ✗ $f NOT FOUND" -ForegroundColor Red
  }
}

Write-Host "`n[3/3] Checklist manuelle post-migration :" -ForegroundColor Yellow
Write-Host "  □ Coolify frontend — mettre à jour le domaine vers foga-tech.com"
Write-Host "  □ Coolify API — ajouter CORS_ORIGINS=https://foga-tech.com"
Write-Host "  □ Coolify API — API_URL=https://api.foga-tech.com"
Write-Host "  □ Caddyfile CSP connect-src — remplacer api.foga-tech.tech par api.foga-tech.com"
Write-Host "  □ Google Search Console — ajouter propriété foga-tech.com + soumettre sitemap"
Write-Host "  □ GA4 — vérifier que les hits arrivent sur foga-tech.com"
Write-Host "  □ Bump web/package.json version pour invalider cache Nixpacks"
Write-Host "  □ git diff — vérifier les remplacements, puis commit + push"
Write-Host ""
Write-Host "Migration terminée. Vérifiez git diff avant de commit." -ForegroundColor Green
