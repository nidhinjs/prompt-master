<#
.SYNOPSIS
    Собирает self-contained скилл-бандл (ZIP) для загрузки в Claude.ai / ручной установки.

.DESCRIPTION
    Берёт версию из plugin.json (канон) и архивирует папку навыка
    plugins/prompt-master/skills/prompt-master так, что в КОРНЕ архива
    лежат SKILL.md и references/ — именно этот layout ждёт Claude.ai
    «Upload a Skill» и ручная установка в каталог скиллов.

    Артефакт: dist/prompt-master-<version>.zip (dist/ в .gitignore — в репо не коммитим).

    Этот ZIP — обход кэша маркетплейса: его можно приложить к GitHub-релизу
    (`-Upload`) и затем скачать/залить напрямую, минуя сторонний-маркетплейс кэш
    (Claude Code / Cowork / claude.ai не авто-обновляют сторонние маркетплейсы).

.PARAMETER Upload
    После сборки приложить артефакт к GitHub-релизу vX.Y.Z через `gh release upload`
    (релиз с этим тегом должен уже существовать).

.PARAMETER DryRun
    Показать, что будет сделано, без записи.

.PARAMETER AllowDirty
    Разрешить локальную сборку незакоммиченного runtime-дерева для проверки.
    Не совместим с -Upload; release-upload всегда требует чистое дерево.

.EXAMPLE
    ./scripts/package-skill.ps1
    Собирает dist/prompt-master-<version>.zip.

.EXAMPLE
    ./scripts/package-skill.ps1 -Upload
    Собирает бандл и прикладывает его к релизу vX.Y.Z на GitHub.
#>
param(
    [switch]$Upload,
    [switch]$DryRun,
    [switch]$AllowDirty
)

$ErrorActionPreference = 'Stop'

$repoRoot   = Split-Path -Parent $PSScriptRoot
$pluginJson = Join-Path $repoRoot 'plugins/prompt-master/.claude-plugin/plugin.json'
$skillDir   = Join-Path $repoRoot 'plugins/prompt-master/skills/prompt-master'
$distDir    = Join-Path $repoRoot 'dist'

function Fail($m) { Write-Host "ERROR: $m" -ForegroundColor Red; exit 1 }

if (-not (Test-Path $pluginJson)) { Fail "Не найден plugin.json: $pluginJson" }
if (-not (Test-Path (Join-Path $skillDir 'SKILL.md'))) { Fail "Не найден SKILL.md в $skillDir" }

# --- Версия (канон = plugin.json) ---
$pluginText = Get-Content -Raw -LiteralPath $pluginJson -Encoding UTF8
if ($pluginText -notmatch '"version"\s*:\s*"(\d+\.\d+\.\d+)"') { Fail "Не удалось прочитать version из plugin.json" }
$version = $Matches[1]

$zipName = "prompt-master-$version.zip"
$zipPath = Join-Path $distDir $zipName
$shaName = "$zipName.sha256"
$shaPath = Join-Path $distDir $shaName
$tag     = "v$version"

# Release artifacts contain only this reviewed runtime surface. Adding a new
# reference requires an explicit allowlist update instead of being picked up by
# a wildcard archive.
$runtimeFiles = @(
    'SKILL.md',
    'references/agentic.md',
    'references/models.md',
    'references/patterns.md',
    'references/templates.md',
    'references/tool-profiles.md'
)

$actualFiles = @(
    Get-ChildItem -LiteralPath $skillDir -File -Recurse |
        ForEach-Object {
            $_.FullName.Substring($skillDir.Length).TrimStart([char[]]'\\/') -replace '\\', '/'
        } |
        Sort-Object
)
$expectedFiles = @($runtimeFiles | Sort-Object)
$layoutDiff = @(Compare-Object -ReferenceObject $expectedFiles -DifferenceObject $actualFiles)
if ($layoutDiff.Count -gt 0) {
    $details = ($layoutDiff | ForEach-Object { "$($_.SideIndicator) $($_.InputObject)" }) -join '; '
    Fail "Runtime-файлы не совпадают с allowlist: $details"
}

$skillPathspec = 'plugins/prompt-master/skills/prompt-master'
$dirtyLines = @(& git -C $repoRoot status --porcelain=v1 --untracked-files=all -- $skillPathspec)
if ($LASTEXITCODE -ne 0) { Fail "Не удалось проверить git status для runtime-файлов" }
$dirtyLines = @($dirtyLines | Where-Object { $_ })
if ($Upload -and $AllowDirty) { Fail "-Upload несовместим с -AllowDirty" }
if ($dirtyLines.Count -gt 0 -and -not $AllowDirty) {
    Fail "Runtime-дерево содержит незакоммиченные изменения. Проверь и зафиксируй их либо используй -AllowDirty только для локальной проверки: $($dirtyLines -join '; ')"
}

Write-Host "Package: prompt-master $version -> dist/$zipName" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "`n[DryRun] Будет собрано по allowlist: $zipPath"
    Write-Host "[DryRun] Будет записана сумма: $shaPath"
    if ($dirtyLines.Count -gt 0) { Write-Host "[DryRun] Runtime-дерево dirty; разрешено явным -AllowDirty" -ForegroundColor DarkYellow }
    if ($Upload) { Write-Host "[DryRun] ZIP и SHA-256 будут приложены к релизу $tag" }
    exit 0
}

# --- Сборка ZIP из точного allowlist ---
if (-not (Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir | Out-Null }
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
if (Test-Path $shaPath) { Remove-Item $shaPath -Force }

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipStream = [System.IO.File]::Open($zipPath, [System.IO.FileMode]::CreateNew)
$archive = [System.IO.Compression.ZipArchive]::new(
    $zipStream,
    [System.IO.Compression.ZipArchiveMode]::Create,
    $false
)
try {
    foreach ($relativePath in $runtimeFiles) {
        $sourcePath = Join-Path $skillDir ($relativePath -replace '/', [System.IO.Path]::DirectorySeparatorChar)
        $entry = $archive.CreateEntry($relativePath, [System.IO.Compression.CompressionLevel]::Optimal)
        $entry.LastWriteTime = [DateTimeOffset]::new(1980, 1, 1, 0, 0, 0, [TimeSpan]::Zero)
        $source = [System.IO.File]::OpenRead($sourcePath)
        $destination = $entry.Open()
        try { $source.CopyTo($destination) }
        finally {
            $destination.Dispose()
            $source.Dispose()
        }
    }
}
finally {
    $archive.Dispose()
    $zipStream.Dispose()
}
Write-Host "  ok $zipPath" -ForegroundColor Green

# --- Санити-проверка: ZIP содержит ровно allowlist ---
# ZipArchive обязательно закрываем, иначе открытый handle живёт до конца
# сессии и повторный запуск падает на Remove-Item ("file in use").
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
try     { $entries = @($zip.Entries.FullName | Sort-Object) }
finally { $zip.Dispose() }
if (@(Compare-Object -ReferenceObject $expectedFiles -DifferenceObject $entries).Count -gt 0) {
    Fail "Содержимое ZIP не совпадает с runtime allowlist"
}
Write-Host "  верх архива: $(( $entries | Where-Object { $_ -notmatch '/' } ) -join ', ')" -ForegroundColor DarkGray

$shaAlgorithm = [System.Security.Cryptography.SHA256]::Create()
$shaStream = [System.IO.File]::OpenRead($zipPath)
try { $shaBytes = $shaAlgorithm.ComputeHash($shaStream) }
finally {
    $shaStream.Dispose()
    $shaAlgorithm.Dispose()
}
$sha256 = -join ($shaBytes | ForEach-Object { $_.ToString('x2') })
[System.IO.File]::WriteAllText($shaPath, "$sha256  $zipName`n", [System.Text.Encoding]::ASCII)
Write-Host "  sha256 $sha256" -ForegroundColor Green

# --- Опциональная заливка в релиз ---
if ($Upload) {
    & gh release view $tag *> $null
    if ($LASTEXITCODE -ne 0) { Fail "Релиз $tag не найден — сначала создай его (gh release create $tag)" }
    & gh release upload $tag $zipPath $shaPath --clobber
    if ($LASTEXITCODE -ne 0) { Fail "gh release upload завершился с ошибкой" }
    Write-Host "  ok приложено к релизу $tag" -ForegroundColor Green
}

Write-Host "`nГотово: $zipPath" -ForegroundColor Cyan
Write-Host "SHA-256: $shaPath" -ForegroundColor Cyan
if (-not $Upload) { Write-Host "  Приложить к релизу: ./scripts/package-skill.ps1 -Upload" }
