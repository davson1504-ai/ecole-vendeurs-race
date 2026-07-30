# test-supabase-connection.ps1
# Teste la connexion Supabase sans exposer les clés
# Usage : .\test-supabase-connection.ps1

param(
    [switch]$Verbose
)

$projectDir = "C:\Users\LENOVO\Documents\projet_lobo\ecole-vendeurs-race"
$envFile    = Join-Path $projectDir ".env.local"

Write-Host "`n=== Test de connexion Supabase EDVR ===" -ForegroundColor Cyan

# 1) Lire .env.local
if (-not (Test-Path $envFile)) {
    Write-Host "ERREUR : .env.local introuvable dans $projectDir" -ForegroundColor Red
    exit 1
}

$envVars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') {
        $envVars[$Matches[1].Trim()] = $Matches[2].Trim()
    }
}

$supabaseUrl  = $envVars["NEXT_PUBLIC_SUPABASE_URL"]
$anonKey      = $envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
$serviceKey   = $envVars["SUPABASE_SERVICE_ROLE_KEY"]

# 2) Vérifier que les variables sont renseignées
$missing = @()
if (-not $supabaseUrl)  { $missing += "NEXT_PUBLIC_SUPABASE_URL" }
if (-not $anonKey)      { $missing += "NEXT_PUBLIC_SUPABASE_ANON_KEY" }
if (-not $serviceKey)   { $missing += "SUPABASE_SERVICE_ROLE_KEY" }

if ($missing.Count -gt 0) {
    Write-Host "`nBLOQUANT : Variables manquantes dans .env.local :" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host "`nOù les trouver :" -ForegroundColor Cyan
    Write-Host "  1. Aller sur https://supabase.com/dashboard"
    Write-Host "  2. Sélectionner votre projet EDVR"
    Write-Host "  3. Project Settings -> API"
    Write-Host "  4. Copier Project URL, anon key et service_role key"
    Write-Host "  5. Les coller dans : $envFile"
    exit 1
}

Write-Host "Variables .env.local : OK" -ForegroundColor Green
Write-Host "  Projet : $($supabaseUrl.Replace('https://','').Split('.')[0])"

# 3) Test HTTP direct (sans exposer les clés)
Write-Host "`nTest de connexion REST Supabase..." -ForegroundColor Cyan
try {
    $headers = @{
        "apikey"        = $anonKey
        "Authorization" = "Bearer $anonKey"
    }
    $resp = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/" -Headers $headers -UseBasicParsing -ErrorAction Stop
    Write-Host "Connexion REST : OK (HTTP $($resp.StatusCode))" -ForegroundColor Green
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 404) {
        Write-Host "Connexion REST : OK (HTTP 404 - Supabase accessible, aucune table exposée)" -ForegroundColor Green
    } elseif ($code -eq 401) {
        Write-Host "ERREUR : Clé anon invalide ou projet incorrect (HTTP 401)" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "ERREUR : Réponse inattendue (HTTP $code)" -ForegroundColor Red
        exit 1
    }
}

# 4) Vérifier que les tables du schéma existent (avec la clé anon)
Write-Host "`nVérification du schéma (table profiles)..." -ForegroundColor Cyan
try {
    $headers = @{
        "apikey"        = $anonKey
        "Authorization" = "Bearer $anonKey"
        "Content-Type"  = "application/json"
    }
    $resp = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/profiles?limit=1&select=id" -Headers $headers -UseBasicParsing -ErrorAction Stop
    if ($resp.StatusCode -eq 200) {
        Write-Host "Table profiles : EXISTE (schema installé)" -ForegroundColor Green
    }
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 404 -or $code -eq 400) {
        Write-Host "Table profiles : ABSENTE - Exécuter le script SQL d'abord" -ForegroundColor Yellow
        Write-Host "  Fichier : supabase/EDVR_SUPABASE_SCHEMA_V2.sql"
        Write-Host "  Procédure : Supabase Dashboard > SQL Editor > New query > Run"
    } elseif ($code -eq 401) {
        Write-Host "Table profiles : accès refusé (clé anon invalide ?)" -ForegroundColor Red
    } else {
        Write-Host "Table profiles : erreur HTTP $code" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Résumé ===" -ForegroundColor Cyan
Write-Host "Pour démarrer l'application :"
Write-Host "  Set-Location '$projectDir'"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "Pour tester après démarrage :"
Write-Host "  Invoke-RestMethod 'http://localhost:3000/api/health'"
Write-Host "  Invoke-RestMethod 'http://localhost:3000/api/health/supabase'"
