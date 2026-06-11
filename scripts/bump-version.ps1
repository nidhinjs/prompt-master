<#
.SYNOPSIS
    Синхронно поднимает версию Prompt Master во всех источниках правды.

.DESCRIPTION
    Версия скилла живёт в нескольких файлах, которые легко рассинхронить:
      1. plugins/prompt-master/.claude-plugin/plugin.json  ("version")  — канон
      2. plugins/prompt-master/skills/prompt-master/SKILL.md (frontmatter version:)
      3. CHANGELOG.md (секция ## [X.Y.Z])

    Скрипт читает текущую версию из plugin.json (канон), вычисляет новую,
    правит все файлы текстово (форматирование сохраняется) и по флагу
    создаёт подписанный git-тег vX.Y.Z.

.PARAMETER Version
    Явная целевая версия, напр. 1.9.0. Взаимоисключима с -Bump.

.PARAMETER Bump
    Семантический шаг от текущей версии: major | minor | patch.

.PARAMETER Tag
    После правок создать аннотированный (подписанный) git-тег vX.Y.Z на HEAD.
    Авто-чинит WSL-путь user.signingkey (/mnt/c/... -> C:/...) для Git-for-Windows.

.PARAMETER NoChangelog
    Не вставлять заготовку секции в CHANGELOG.md.

.PARAMETER DryRun
    Показать, что будет сделано, ничего не записывая.

.EXAMPLE
    ./scripts/bump-version.ps1 -Bump minor
    1.8.0 -> 1.9.0, правит plugin.json + SKILL.md, вставляет стаб в CHANGELOG.

.EXAMPLE
    ./scripts/bump-version.ps1 -Version 2.0.0 -Tag
    Ставит 2.0.0 во всех файлах и создаёт подписанный тег v2.0.0.

.EXAMPLE
    ./scripts/bump-version.ps1 -Bump patch -DryRun
    Только показывает план (1.8.0 -> 1.8.1).
#>
[CmdletBinding(DefaultParameterSetName = 'Explicit')]
param(
    [Parameter(ParameterSetName = 'Explicit', Position = 0)]
    [string]$Version,

    [Parameter(ParameterSetName = 'Bump', Mandatory = $true)]
    [ValidateSet('major', 'minor', 'patch')]
    [string]$Bump,

    [switch]$Tag,
    [switch]$NoChangelog,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

# --- Пути (всё относительно корня репозитория = родитель папки scripts) ---
$repoRoot     = Split-Path -Parent $PSScriptRoot
$pluginJson   = Join-Path $repoRoot 'plugins/prompt-master/.claude-plugin/plugin.json'
$skillMd      = Join-Path $repoRoot 'plugins/prompt-master/skills/prompt-master/SKILL.md'
$changelogMd  = Join-Path $repoRoot 'CHANGELOG.md'

function Fail($msg) { Write-Host "ERROR: $msg" -ForegroundColor Red; exit 1 }

foreach ($f in @($pluginJson, $skillMd)) {
    if (-not (Test-Path $f)) { Fail "Не найден обязательный файл: $f" }
}

# --- Текущая версия (канон = plugin.json) ---
$pluginText = Get-Content -Raw -LiteralPath $pluginJson
if ($pluginText -notmatch '"version"\s*:\s*"(\d+)\.(\d+)\.(\d+)"') {
    Fail "Не удалось прочитать version из plugin.json"
}
$curMajor = [int]$Matches[1]; $curMinor = [int]$Matches[2]; $curPatch = [int]$Matches[3]
$current  = "$curMajor.$curMinor.$curPatch"

# --- Новая версия ---
if ($PSCmdlet.ParameterSetName -eq 'Bump') {
    switch ($Bump) {
        'major' { $new = "$($curMajor + 1).0.0" }
        'minor' { $new = "$curMajor.$($curMinor + 1).0" }
        'patch' { $new = "$curMajor.$curMinor.$($curPatch + 1)" }
    }
}
else {
    if (-not $Version) { Fail "Укажи -Version X.Y.Z или -Bump major|minor|patch" }
    if ($Version -notmatch '^\d+\.\d+\.\d+$') { Fail "Версия должна быть в формате X.Y.Z, получено: $Version" }
    $new = $Version
}

# Сравнение: новая должна быть строго больше текущей
$curParts = $current.Split('.') | ForEach-Object { [int]$_ }
$newParts = $new.Split('.')     | ForEach-Object { [int]$_ }
$isGreater = $false
for ($i = 0; $i -lt 3; $i++) {
    if ($newParts[$i] -gt $curParts[$i]) { $isGreater = $true; break }
    if ($newParts[$i] -lt $curParts[$i]) { break }
}
if (-not $isGreater) { Fail "Новая версия ($new) не больше текущей ($current)" }

Write-Host "Bump: $current -> $new" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "`n[DryRun] Будут изменены:" -ForegroundColor Yellow
    Write-Host "  - $pluginJson"
    Write-Host "  - $skillMd"
    if (-not $NoChangelog) { Write-Host "  - $changelogMd (вставка секции ## [$new])" }
    if ($Tag) { Write-Host "  - git tag v$new (подписанный) на HEAD" }
    exit 0
}

# --- 1. plugin.json ---
$pluginText = $pluginText -replace '("version"\s*:\s*")(\d+\.\d+\.\d+)(")', "`${1}$new`${3}"
Set-Content -LiteralPath $pluginJson -Value $pluginText -NoNewline -Encoding utf8
Write-Host "  ok plugin.json" -ForegroundColor Green

# --- 2. SKILL.md frontmatter (только первое вхождение version: в шапке) ---
$skillText = Get-Content -Raw -LiteralPath $skillMd
if ($skillText -notmatch '(?m)^version:\s*\S+') { Fail "В SKILL.md нет frontmatter 'version:'" }
$skillText = [regex]::Replace($skillText, '(?m)^version:\s*\S+', "version: $new", 1)
Set-Content -LiteralPath $skillMd -Value $skillText -NoNewline -Encoding utf8
Write-Host "  ok SKILL.md" -ForegroundColor Green

# --- 3. CHANGELOG.md: дата-стаб секции + footer-ссылка на GitHub release ---
if (-not $NoChangelog) {
    if (Test-Path $changelogMd) {
        $clText = Get-Content -Raw -LiteralPath $changelogMd
        if ($clText -match "(?m)^##\s*\[$([regex]::Escape($new))\]") {
            Write-Host "  -- CHANGELOG: секция [$new] уже есть, пропуск" -ForegroundColor DarkYellow
        }
        else {
            # 3a. Заготовка секции с датой перед первой ## [
            $today = (Get-Date).ToString('yyyy-MM-dd')
            $stub  = "## [$new] - $today`n`n### Added`n- `n`n### Changed`n- `n`n"
            $m = [regex]::Match($clText, '(?m)^##\s*\[')
            if ($m.Success) { $clText = $clText.Insert($m.Index, $stub) }
            else            { $clText = $clText.TrimEnd() + "`n`n" + $stub }

            # 3b. Footer-ссылка [X.Y.Z]: <repo>/releases/tag/vX.Y.Z (newest сверху)
            $repoUrl = (git -C $repoRoot config --get remote.origin.url 2>$null)
            if ($repoUrl) {
                $repoUrl = $repoUrl.Trim() -replace '\.git$', '' -replace '^git@github\.com:', 'https://github.com/'
                $footer  = "[$new]: $repoUrl/releases/tag/v$new"
                if ($clText -notmatch "(?m)^\[$([regex]::Escape($new))\]:") {
                    $fm = [regex]::Match($clText, '(?m)^\[\d+\.\d+\.\d+\]:\s')
                    if ($fm.Success) { $clText = $clText.Insert($fm.Index, "$footer`n") }
                    else             { $clText = $clText.TrimEnd() + "`n`n$footer`n" }
                }
            }
            else {
                Write-Host "  -- remote.origin.url не найден, footer-ссылка пропущена" -ForegroundColor DarkYellow
            }

            Set-Content -LiteralPath $changelogMd -Value $clText -NoNewline -Encoding utf8
            Write-Host "  ok CHANGELOG.md (заполни секцию [$new])" -ForegroundColor Green
        }
    }
    else {
        Write-Host "  -- CHANGELOG.md не найден, пропуск" -ForegroundColor DarkYellow
    }
}

# --- 4. Опциональный git-тег ---
if ($Tag) {
    $signKey = (git -C $repoRoot config --get user.signingkey 2>$null)
    $tagArgs = @()
    if ($signKey -and $signKey -match '^/mnt/([a-zA-Z])/(.*)$') {
        $winKey = "$($Matches[1].ToUpper()):/$($Matches[2])"
        Write-Host "  -- signingkey WSL-путь сконвертирован: $winKey" -ForegroundColor DarkGray
        $tagArgs += @('-c', "user.signingkey=$winKey")
    }
    & git -C $repoRoot @tagArgs tag -a "v$new" -m "v$new"
    if ($LASTEXITCODE -ne 0) { Fail "git tag завершился с ошибкой" }
    Write-Host "  ok git tag v$new" -ForegroundColor Green
}

# --- Итог ---
Write-Host "`nГотово. Дальше:" -ForegroundColor Cyan
if (-not $NoChangelog) { Write-Host "  1. Заполни секцию ## [$new] в CHANGELOG.md" }
Write-Host "  2. git add -A && git commit -m `"chore: bump to v$new`""
if ($Tag) {
    Write-Host "  3. git push origin HEAD && git push origin v$new"
    Write-Host "  4. gh release create v$new --title `"v$new`" --notes `"<changelog>`"   # резолвит footer-ссылку в CHANGELOG"
}
else {
    Write-Host "  3. git push origin HEAD"
    Write-Host "     (тег: ./scripts/bump-version.ps1 -Version $new -Tag  — или git tag -a v$new -m v$new)"
    Write-Host "  4. gh release create v$new --title `"v$new`" --notes `"<changelog>`"   # после пуша тега"
}
