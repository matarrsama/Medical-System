param(
  [string]$Bump = "patch",
  [string]$GhToken = ""
)

# ── Read current version ─────────────────────────────
$json = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
$current = [version]$json.version
$major = $current.Major
$minor = $current.Minor
$patch = $current.Build

# ── Bump version ─────────────────────────────────────
switch ($Bump.ToLower()) {
  "major" { $major++; $minor = 0; $patch = 0 }
  "minor" { $minor++; $patch = 0 }
  "patch" { $patch++ }
  default { Write-Host "Usage: -Bump patch|minor|major (default patch)"; exit 1 }
}
$newVersion = "$major.$minor.$patch"
$json.version = $newVersion
$json | ConvertTo-Json -Depth 10 | Set-Content -Path "package.json"

Write-Host "Version bumped: $current → $newVersion" -ForegroundColor Green
Write-Host "`nRun these commands to deploy:" -ForegroundColor Cyan
Write-Host "  git add ." -ForegroundColor White
Write-Host "  git commit -m `"Release v$newVersion`"" -ForegroundColor White
Write-Host "  git push" -ForegroundColor White
Write-Host "  git tag v$newVersion" -ForegroundColor White
Write-Host "  git push origin v$newVersion" -ForegroundColor White
Write-Host ""

if ($GhToken -ne "") {
  $env:GH_TOKEN = $GhToken
  Write-Host "GH_TOKEN set from -GhToken parameter" -ForegroundColor Green
  Write-Host "  npm run electron:build -- --publish always" -ForegroundColor White
  Write-Host "`n(or publish later with:)" -ForegroundColor Cyan
  Write-Host "  npm run electron:build -- --publish always" -ForegroundColor White
} else {
  Write-Host "To publish release with auto-update support:" -ForegroundColor Yellow
  Write-Host "  `$env:GH_TOKEN=`"ghp_xxxx`" ; npm run electron:build -- --publish always" -ForegroundColor White
  Write-Host "`n(Or just build locally without publishing:)" -ForegroundColor Cyan
  Write-Host "  npm run electron:build" -ForegroundColor White
}

Write-Host "`nOr one-liner (set GH_TOKEN first):" -ForegroundColor Cyan
Write-Host "  git add .; git commit -m `"Release v$newVersion`"; git push; git tag v$newVersion; git push origin v$newVersion; npm run electron:build -- --publish always" -ForegroundColor White
