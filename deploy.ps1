param(
  [string]$Bump = "patch"
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
Write-Host "  npm run electron:build" -ForegroundColor White
Write-Host "`nOr one-liner:" -ForegroundColor Cyan
Write-Host "  git add .; git commit -m `"Release v$newVersion`"; git push; git tag v$newVersion; git push origin v$newVersion; npm run electron:build" -ForegroundColor White
