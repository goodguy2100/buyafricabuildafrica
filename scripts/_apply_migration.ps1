# Apply a single SQL migration via Management API. Body = JSON array of SQL strings.
$ErrorActionPreference = "Stop"
$credPath = "C:\Users\Admin\OneDrive\Desktop\DocumentsOpenClawVault\Agent-Shared\credentials\Supabase.md"
$content = Get-Content $credPath -Raw
$tokenMatch = [regex]::Match($content, "sbp_[A-Za-z0-9_\-]+")
if (-not $tokenMatch.Success) { Write-Error "sbp_ token not found"; exit 1 }
$token = $tokenMatch.Value

$sqlPath = "C:\Users\Admin\.openclaw\workspace\buyafricabuildafrica\supabase\migrations\20260817120000_partner_bulk_import.sql"
$sql = Get-Content $sqlPath -Raw
$body = @($sql) | ConvertTo-Json -Compress   # JSON array with one SQL string
$payloadPath = "$env:TEMP\baba_migrate_payload.json"
Set-Content -Path $payloadPath -Value $body -NoNewline -Encoding utf8

$resp = curl.exe -s -X POST "https://api.supabase.com/v1/projects/lwgxhverhtktotvowehg/database/query" `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  --data-binary "@$payloadPath"
Write-Host "HTTP response:"
Write-Host $resp
Remove-Item $payloadPath -ErrorAction SilentlyContinue
