<#
.SYNOPSIS
    Release-gate lint for prompt-master.

.DESCRIPTION
    ERROR on:
      - version mismatch across plugin.json, SKILL.md frontmatter, latest CHANGELOG.md heading
      - pattern-count drift (reads count from patterns.md header, asserts same number in SKILL.md,
        plugin.json description, marketplace.json description, README.md)
      - missing SKILL.md frontmatter fields (name, version, description)
      - CRLF line endings in any tracked *.md or *.ps1

    WARN on:
      - SKILL.md body line count over budget (250 lines, excluding frontmatter block)
      - missing CHANGELOG footer release link for the latest version

    Exit code 1 on any ERROR, 0 otherwise.

.EXAMPLE
    ./scripts/lint.ps1
    Run from repo root or scripts/ directory — paths are resolved relative to repo root.
#>

$ErrorActionPreference = 'Stop'

$repoRoot       = Split-Path -Parent $PSScriptRoot
$pluginJson     = Join-Path $repoRoot 'plugins/prompt-master/.claude-plugin/plugin.json'
$skillMd        = Join-Path $repoRoot 'plugins/prompt-master/skills/prompt-master/SKILL.md'
$changelogMd    = Join-Path $repoRoot 'CHANGELOG.md'
$patternsMd     = Join-Path $repoRoot 'plugins/prompt-master/skills/prompt-master/references/patterns.md'
$marketplaceJson = Join-Path $repoRoot '.claude-plugin/marketplace.json'
$readmeMd       = Join-Path $repoRoot 'README.md'

$SKILL_BODY_BUDGET = 250   # WARN if SKILL.md body (after frontmatter) exceeds this

$errors   = [System.Collections.Generic.List[string]]::new()
$warnings = [System.Collections.Generic.List[string]]::new()

function Add-Error($msg)   { $errors.Add("  ERROR: $msg") }
function Add-Warning($msg) { $warnings.Add("  WARN:  $msg") }

# ---------------------------------------------------------------------------
# Helper: read raw file text, fail loudly if missing
# ---------------------------------------------------------------------------
function Read-File($path) {
    if (-not (Test-Path $path)) {
        Add-Error "Required file not found: $path"
        return $null
    }
    return Get-Content -Raw -LiteralPath $path
}

# ---------------------------------------------------------------------------
# 1. Version consistency
# ---------------------------------------------------------------------------
Write-Host "Checking version consistency..." -ForegroundColor Cyan

$pluginText = Read-File $pluginJson
$skillText  = Read-File $skillMd
$clText     = Read-File $changelogMd

$pluginVersion    = $null
$skillVersion     = $null
$changelogVersion = $null

if ($pluginText -and $pluginText -match '"version"\s*:\s*"(\d+\.\d+\.\d+)"') {
    $pluginVersion = $Matches[1]
} elseif ($pluginText) {
    Add-Error "Cannot parse 'version' from plugin.json"
}

if ($skillText -and $skillText -match '(?m)^version:\s*(\S+)') {
    $skillVersion = $Matches[1]
} elseif ($skillText) {
    Add-Error "Cannot parse 'version:' from SKILL.md frontmatter"
}

if ($clText -and $clText -match '(?m)^##\s*\[(\d+\.\d+\.\d+)\]') {
    $changelogVersion = $Matches[1]
} elseif ($clText) {
    Add-Error "Cannot find a version heading in CHANGELOG.md (expected '## [X.Y.Z]')"
}

if ($pluginVersion -and $skillVersion -and ($pluginVersion -ne $skillVersion)) {
    Add-Error "Version mismatch: plugin.json=$pluginVersion vs SKILL.md=$skillVersion"
}
if ($pluginVersion -and $changelogVersion -and ($pluginVersion -ne $changelogVersion)) {
    Add-Error "Version mismatch: plugin.json=$pluginVersion vs CHANGELOG.md latest heading=$changelogVersion"
}
if ($pluginVersion) {
    Write-Host "  version = $pluginVersion" -ForegroundColor DarkGray
}

# ---------------------------------------------------------------------------
# 2. SKILL.md frontmatter required fields
# ---------------------------------------------------------------------------
Write-Host "Checking SKILL.md frontmatter fields..." -ForegroundColor Cyan

if ($skillText) {
    foreach ($field in @('name', 'version', 'description')) {
        if ($skillText -notmatch "(?m)^${field}:\s*\S") {
            Add-Error "SKILL.md frontmatter missing required field: '$field'"
        }
    }
}

# ---------------------------------------------------------------------------
# 3. Pattern-count drift
# ---------------------------------------------------------------------------
Write-Host "Checking pattern count consistency..." -ForegroundColor Cyan

$patText = Read-File $patternsMd
$patCount = $null

if ($patText) {
    # Header line expected: "N patterns that waste tokens..."
    if ($patText -match '(?m)^(\d+)\s+patterns') {
        $patCount = $Matches[1]
    } else {
        Add-Error "Cannot read pattern count from patterns.md header (expected '<N> patterns ...')"
    }
}

if ($patCount) {
    Write-Host "  pattern count from patterns.md = $patCount" -ForegroundColor DarkGray

    # Check SKILL.md
    if ($skillText -and $skillText -notmatch [regex]::Escape($patCount)) {
        Add-Error "Pattern count $patCount not found in SKILL.md"
    }

    # Check plugin.json description
    if ($pluginText -and $pluginText -notmatch [regex]::Escape($patCount)) {
        Add-Error "Pattern count $patCount not found in plugin.json description"
    }

    # Check marketplace.json description
    $marketText = Read-File $marketplaceJson
    if ($marketText -and $marketText -notmatch [regex]::Escape($patCount)) {
        Add-Error "Pattern count $patCount not found in marketplace.json description"
    }

    # Check README.md
    $readmeText = Read-File $readmeMd
    if ($readmeText -and $readmeText -notmatch [regex]::Escape($patCount)) {
        Add-Error "Pattern count $patCount not found in README.md"
    }
}

# ---------------------------------------------------------------------------
# 4. CRLF in tracked *.md and *.ps1
# ---------------------------------------------------------------------------
Write-Host "Checking for CRLF line endings in tracked *.md and *.ps1..." -ForegroundColor Cyan

$trackedRaw = & git -C $repoRoot ls-files '*.md' '*.ps1' 2>$null
if ($LASTEXITCODE -ne 0) {
    Add-Warning "git ls-files failed — skipping CRLF check"
} else {
    foreach ($rel in $trackedRaw) {
        $abs = Join-Path $repoRoot $rel
        if (-not (Test-Path $abs)) { continue }
        $bytes = [System.IO.File]::ReadAllBytes($abs)
        $hasCRLF = $false
        for ($i = 0; $i -lt $bytes.Length - 1; $i++) {
            if ($bytes[$i] -eq 13 -and $bytes[$i+1] -eq 10) { $hasCRLF = $true; break }
        }
        if ($hasCRLF) {
            Add-Error "CRLF line endings detected in: $rel"
        }
    }
}

# ---------------------------------------------------------------------------
# 5. SKILL.md body line count budget (WARN)
# ---------------------------------------------------------------------------
Write-Host "Checking SKILL.md body line count..." -ForegroundColor Cyan

if ($skillText) {
    $lines = $skillText -split "`n"
    # Skip frontmatter (between first two '---' delimiters)
    $fmEnd = -1
    $dashCount = 0
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i].Trim() -eq '---') {
            $dashCount++
            if ($dashCount -eq 2) { $fmEnd = $i; break }
        }
    }
    $bodyLines = if ($fmEnd -ge 0) { $lines.Count - $fmEnd - 1 } else { $lines.Count }
    Write-Host "  SKILL.md body = $bodyLines lines (budget: $SKILL_BODY_BUDGET)" -ForegroundColor DarkGray
    if ($bodyLines -gt $SKILL_BODY_BUDGET) {
        Add-Warning "SKILL.md body is $bodyLines lines (budget: $SKILL_BODY_BUDGET) — review for bloat"
    }
}

# ---------------------------------------------------------------------------
# 6. CHANGELOG footer release link (WARN)
# ---------------------------------------------------------------------------
Write-Host "Checking CHANGELOG footer link..." -ForegroundColor Cyan

if ($clText -and $changelogVersion) {
    if ($clText -notmatch "(?m)^\[$([regex]::Escape($changelogVersion))\]:\s*https?://") {
        Add-Warning "CHANGELOG.md: no footer release link for [$changelogVersion] (expected '[$changelogVersion]: https://...')"
    }
}

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
Write-Host ""
if ($errors.Count -gt 0) {
    Write-Host "Errors:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host $_ -ForegroundColor Red }
}
if ($warnings.Count -gt 0) {
    Write-Host "Warnings:" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }
}

Write-Host ""
Write-Host "Results: $($errors.Count) error(s), $($warnings.Count) warning(s)" -ForegroundColor Cyan

if ($errors.Count -gt 0) {
    Write-Host "FAILED" -ForegroundColor Red
    exit 1
} else {
    Write-Host "PASSED" -ForegroundColor Green
    exit 0
}
