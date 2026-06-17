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

.EXAMPLE
    ./scripts/package-skill.ps1
    Собирает dist/prompt-master-<version>.zip.

.EXAMPLE
    ./scripts/package-skill.ps1 -Upload
    Собирает бандл и прикладывает его к релизу vX.Y.Z на GitHub.
#>
param(
    [switch]$Upload,
    [switch]$DryRun
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
$pluginText = Get-Content -Raw -LiteralPath $pluginJson
if ($pluginText -notmatch '"version"\s*:\s*"(\d+\.\d+\.\d+)"') { Fail "Не удалось прочитать version из plugin.json" }
$version = $Matches[1]

$zipName = "prompt-master-$version.zip"
$zipPath = Join-Path $distDir $zipName
$tag     = "v$version"

Write-Host "Package: prompt-master $version -> dist/$zipName" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "`n[DryRun] Будет собрано: $zipPath (содержимое $skillDir в корне)"
    if ($Upload) { Write-Host "[DryRun] Будет приложено к релизу $tag (gh release upload)" }
    exit 0
}

# --- Сборка ZIP (SKILL.md + references/ в корне архива) ---
if (-not (Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir | Out-Null }
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path (Join-Path $skillDir '*') -DestinationPath $zipPath -Force
Write-Host "  ok $zipPath" -ForegroundColor Green

# --- Санити-проверка: SKILL.md в корне архива ---
Add-Type -AssemblyName System.IO.Compression.FileSystem
$entries = [System.IO.Compression.ZipFile]::OpenRead($zipPath).Entries.FullName
if ($entries -notcontains 'SKILL.md') { Fail "В корне архива нет SKILL.md — проверь layout" }
Write-Host "  верх архива: $(( $entries | Where-Object { $_ -notmatch '/' } ) -join ', ')" -ForegroundColor DarkGray

# --- Опциональная заливка в релиз ---
if ($Upload) {
    & gh release view $tag *> $null
    if ($LASTEXITCODE -ne 0) { Fail "Релиз $tag не найден — сначала создай его (gh release create $tag)" }
    & gh release upload $tag $zipPath --clobber
    if ($LASTEXITCODE -ne 0) { Fail "gh release upload завершился с ошибкой" }
    Write-Host "  ok приложено к релизу $tag" -ForegroundColor Green
}

Write-Host "`nГотово: $zipPath" -ForegroundColor Cyan
if (-not $Upload) { Write-Host "  Приложить к релизу: ./scripts/package-skill.ps1 -Upload" }
