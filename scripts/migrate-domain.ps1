$old    = "foga-tech.tech"
$new    = "foga-tech.com"
$oldApi = "api.foga-tech.tech"
$newApi = "api.foga-tech.com"

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

$apiFiles = @(
  "api\lib\mailer.js"
)

Write-Host "[1/3] Frontend: $old -> $new" -ForegroundColor Cyan
foreach ($f in $webFiles) {
  if (Test-Path $f) {
    $content = Get-Content $f -Raw -Encoding UTF8
    $updated = $content -replace [regex]::Escape($old), $new
    if ($updated -ne $content) {
      Set-Content $f $updated -Encoding UTF8 -NoNewline
      Write-Host "  OK $f" -ForegroundColor Green
    } else {
      Write-Host "  -- $f (unchanged)" -ForegroundColor DarkGray
    }
  } else {
    Write-Host "  MISSING $f" -ForegroundColor Red
  }
}

Write-Host "[2/3] API: $oldApi -> $newApi" -ForegroundColor Cyan
foreach ($f in $apiFiles) {
  if (Test-Path $f) {
    $content = Get-Content $f -Raw -Encoding UTF8
    $updated = $content -replace [regex]::Escape($oldApi), $newApi
    if ($updated -ne $content) {
      Set-Content $f $updated -Encoding UTF8 -NoNewline
      Write-Host "  OK $f" -ForegroundColor Green
    } else {
      Write-Host "  -- $f (unchanged)" -ForegroundColor DarkGray
    }
  } else {
    Write-Host "  MISSING $f" -ForegroundColor Red
  }
}

Write-Host "[3/3] Checklist manuelle:" -ForegroundColor Yellow
Write-Host "  [ ] Coolify frontend  -- domaine -> foga-tech.com"
Write-Host "  [ ] Coolify API       -- CORS_ORIGINS=https://foga-tech.com"
Write-Host "  [ ] Coolify API       -- API_URL=https://api.foga-tech.com"
Write-Host "  [ ] Caddyfile CSP     -- connect-src: api.foga-tech.com"
Write-Host "  [ ] Search Console    -- ajouter foga-tech.com + sitemap"
Write-Host "  [ ] Bump web/package.json version (cache bust Nixpacks)"
Write-Host "  [ ] git diff -> commit -> push"
Write-Host ""
Write-Host "Migration terminee. Verifiez git diff avant de commit." -ForegroundColor Green
