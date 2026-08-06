param()

$ErrorActionPreference = 'Stop'
$containerName = 'edvr-p0-migrations-test'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path

function Invoke-PsqlFile {
    param(
        [Parameter(Mandatory = $true)][string]$Database,
        [Parameter(Mandatory = $true)][string]$LocalPath
    )

    $fileName = [IO.Path]::GetFileName($LocalPath)
    docker cp $LocalPath "${containerName}:/tmp/$fileName" | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Impossible de copier $LocalPath dans le conteneur." }

    docker exec $containerName psql -v ON_ERROR_STOP=1 -U postgres -d $Database -f "/tmp/$fileName"
    if ($LASTEXITCODE -ne 0) { throw "Échec SQL dans $LocalPath sur la base $Database." }
}

function Remove-TestContainer {
    $containerNames = @(docker ps --all --format '{{.Names}}')
    if ($containerNames -contains $containerName) {
        docker rm -f $containerName | Out-Null
    }
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw 'Docker est requis pour les tests SQL jetables.'
}

docker info | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw 'Le moteur Docker ne répond pas. Démarrer Docker Desktop puis relancer npm run test:migrations.'
}

try {
    Remove-TestContainer
    docker run --rm --detach --name $containerName --env POSTGRES_HOST_AUTH_METHOD=trust postgres:16-alpine | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Impossible de démarrer PostgreSQL 16 jetable.' }

    $ready = $false
    foreach ($attempt in 1..30) {
        docker exec $containerName pg_isready -U postgres | Out-Null
        if ($LASTEXITCODE -eq 0) { $ready = $true; break }
        Start-Sleep -Milliseconds 500
    }
    if (-not $ready) { throw 'PostgreSQL jetable ne devient pas prêt.' }

    $bootstrap = Join-Path $PSScriptRoot 'bootstrap_supabase_stubs.sql'
    $migration1 = Join-Path $repoRoot 'supabase\migrations\0001_initial_schema.sql'
    $migration2 = Join-Path $repoRoot 'supabase\migrations\0002_secure_auth_admin_roles.sql'
    $migration3 = Join-Path $repoRoot 'supabase\migrations\0003_unify_profiles_roles.sql'
    $migration4 = Join-Path $repoRoot 'supabase\migrations\0004_secure_business_tables_rls.sql'
    $migration5 = Join-Path $repoRoot 'supabase\migrations\20260805235140_complete_learning_platform.sql'
    $migration6 = Join-Path $repoRoot 'supabase\migrations\20260806092349_finalize_learning_experience.sql'
    $migration7 = Join-Path $repoRoot 'supabase\migrations\20260806124030_add_contact_messages_and_welcome_state.sql'
    $seed = Join-Path $repoRoot 'supabase\seed.sql'
    $legacyGrants = Join-Path $PSScriptRoot 'simulate_legacy_default_grants.sql'
    $securityAudit = Join-Path $PSScriptRoot 'assert_business_tables_security.sql'

    Write-Host 'Scénario A/C/D/E : base vide, trigger et RLS'
    Invoke-PsqlFile -Database postgres -LocalPath $bootstrap
    Invoke-PsqlFile -Database postgres -LocalPath $migration1
    Invoke-PsqlFile -Database postgres -LocalPath $migration2
    Invoke-PsqlFile -Database postgres -LocalPath $migration3
    Invoke-PsqlFile -Database postgres -LocalPath $legacyGrants
    Invoke-PsqlFile -Database postgres -LocalPath $migration4
    Invoke-PsqlFile -Database postgres -LocalPath $securityAudit
    Invoke-PsqlFile -Database postgres -LocalPath (Join-Path $PSScriptRoot 'assert_fresh_chain_and_rls.sql')
    Invoke-PsqlFile -Database postgres -LocalPath $migration5
    Invoke-PsqlFile -Database postgres -LocalPath $migration6
    Invoke-PsqlFile -Database postgres -LocalPath $migration7
    Invoke-PsqlFile -Database postgres -LocalPath $seed
    Invoke-PsqlFile -Database postgres -LocalPath (Join-Path $PSScriptRoot 'assert_learning_platform.sql')
    Invoke-PsqlFile -Database postgres -LocalPath (Join-Path $PSScriptRoot 'assert_finalization.sql')
    Invoke-PsqlFile -Database postgres -LocalPath (Join-Path $PSScriptRoot 'assert_contact_and_welcome.sql')

    Write-Host 'Scénario B : profils existants et anciennes valeurs'
    docker exec $containerName createdb -U postgres legacy
    if ($LASTEXITCODE -ne 0) { throw 'Impossible de créer la base legacy jetable.' }
    Invoke-PsqlFile -Database legacy -LocalPath $bootstrap
    Invoke-PsqlFile -Database legacy -LocalPath $migration1
    Invoke-PsqlFile -Database legacy -LocalPath (Join-Path $PSScriptRoot 'prepare_legacy_profiles.sql')
    Invoke-PsqlFile -Database legacy -LocalPath $migration2
    Invoke-PsqlFile -Database legacy -LocalPath $migration3
    Invoke-PsqlFile -Database legacy -LocalPath $legacyGrants
    Invoke-PsqlFile -Database legacy -LocalPath $migration4
    Invoke-PsqlFile -Database legacy -LocalPath $securityAudit
    Invoke-PsqlFile -Database legacy -LocalPath (Join-Path $PSScriptRoot 'assert_legacy_convergence.sql')
    Invoke-PsqlFile -Database legacy -LocalPath $migration5
    Invoke-PsqlFile -Database legacy -LocalPath $migration6
    Invoke-PsqlFile -Database legacy -LocalPath $migration7
    Invoke-PsqlFile -Database legacy -LocalPath $seed
    Invoke-PsqlFile -Database legacy -LocalPath (Join-Path $PSScriptRoot 'assert_learning_platform.sql')
    Invoke-PsqlFile -Database legacy -LocalPath (Join-Path $PSScriptRoot 'assert_finalization.sql')
    Invoke-PsqlFile -Database legacy -LocalPath (Join-Path $PSScriptRoot 'assert_contact_and_welcome.sql')

    Write-Host 'Tous les tests de migrations et RLS ont réussi.' -ForegroundColor Green
}
finally {
    Remove-TestContainer
}
