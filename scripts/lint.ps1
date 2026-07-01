<#
.SYNOPSIS
    Release-gate lint for prompt-master.

.DESCRIPTION
    ERROR on:
      - version mismatch across plugin.json, SKILL.md frontmatter, latest CHANGELOG.md heading
      - pattern-count drift (reads count from patterns.md header, asserts same number in SKILL.md,
        plugin.json description, marketplace.json description, README.md, README.ru.md,
        docs/installation.md)
      - missing SKILL.md frontmatter fields (name, version, description)
      - CRLF line endings in any tracked *.md or *.ps1
      - templates.md ToC drift: a ToC anchor with no matching heading, or an h2 section missing
        from the ToC
      - dangling cross-references: "Template X" with no matching section in templates.md,
        "pattern #NN" with no matching row in patterns.md
      - no-CoT list drift: every model in SKILL.md's canonical no-CoT list must be named in
        templates.md Template E
      - stale knob-tool enumeration: a "(…Grok, image-AI)" list without video-AI
      - Comet in multiple Routing Index rows without a tie-break note

    WARN on:
      - SKILL.md body line count over budget (250 lines, excluding frontmatter block)
      - missing CHANGELOG footer release link for the latest version
      - a "## Template X" section never referenced outside templates.md

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
$readmeRuMd     = Join-Path $repoRoot 'README.ru.md'
$installMd      = Join-Path $repoRoot 'docs/installation.md'
$templatesMd    = Join-Path $repoRoot 'plugins/prompt-master/skills/prompt-master/references/templates.md'
$toolProfilesMd = Join-Path $repoRoot 'plugins/prompt-master/skills/prompt-master/references/tool-profiles.md'

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
    # -Encoding UTF8 обязателен: PS 5.1 без него читает UTF-8-файлы (без BOM) как ANSI
    return Get-Content -Raw -LiteralPath $path -Encoding UTF8
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

    # Check README.ru.md and docs/installation.md (optional files — check only if present)
    foreach ($doc in @($readmeRuMd, $installMd)) {
        if (Test-Path $doc) {
            $docText = Get-Content -Raw -LiteralPath $doc -Encoding UTF8
            $rel = [System.IO.Path]::GetFileName($doc)
            if ($docText -match '(\d+)\s+паттерн' -and $Matches[1] -ne $patCount) {
                Add-Error "Pattern count drift in ${rel}: says $($Matches[1]) instead of $patCount"
            }
        }
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
# 7. templates.md ToC <-> headings sync
# ---------------------------------------------------------------------------
Write-Host "Checking templates.md ToC sync..." -ForegroundColor Cyan

function Get-GitHubAnchor([string]$heading) {
    # GitHub-style slug: lowercase, drop everything except letters/digits/space/hyphen, space -> '-'
    $slug = $heading.ToLowerInvariant()
    $slug = [regex]::Replace($slug, '[^\p{L}\p{Nd} \-]', '')
    return ($slug -replace ' ', '-')
}

$tplText = Read-File $templatesMd
if ($tplText) {
    $tocAnchors = [regex]::Matches($tplText, '(?m)^\|\s*\[[^\]]+\]\(#([^)]+)\)') |
        ForEach-Object { $_.Groups[1].Value }
    # Headings inside fenced code blocks (template bodies contain '## Objective' etc.)
    # are NOT sections — walk line-by-line and toggle on ``` fences.
    $headingAnchors = @{}
    $h2Anchors = [System.Collections.Generic.List[string]]::new()
    $inFence = $false
    foreach ($line in ($tplText -split "`n")) {
        if ($line -match '^\s*```') { $inFence = -not $inFence; continue }
        if ($inFence) { continue }
        if ($line -match '^(#{2,3})\s+(.+?)\s*$') {
            $anchor = Get-GitHubAnchor $Matches[2]
            $headingAnchors[$anchor] = $true
            if ($Matches[1] -eq '##') { $h2Anchors.Add($anchor) }
        }
    }
    foreach ($a in $tocAnchors) {
        if (-not $headingAnchors.ContainsKey($a)) {
            Add-Error "templates.md ToC links to '#$a' but no such heading exists"
        }
    }
    foreach ($a in $h2Anchors) {
        if ($a -eq 'table-of-contents') { continue }
        if ($tocAnchors -notcontains $a) {
            Add-Error "templates.md section '#$a' is missing from the Table of Contents"
        }
    }
}

# ---------------------------------------------------------------------------
# 8. Dangling cross-references: "Template X" and "pattern #NN"
# ---------------------------------------------------------------------------
Write-Host "Checking Template / pattern cross-references..." -ForegroundColor Cyan

$profText = Read-File $toolProfilesMd
$skillFiles = @{
    'SKILL.md'         = $skillText
    'tool-profiles.md' = $profText
    'templates.md'     = $tplText
    'patterns.md'      = $patText
}

if ($tplText) {
    $definedTemplates = [regex]::Matches($tplText, '(?m)^##\s+Template\s+([A-Z])\b') |
        ForEach-Object { $_.Groups[1].Value }
    # Reference lists like "Templates G, H, M" name several letters — capture the
    # whole enumeration, then extract every single-letter token from it.
    function Get-TemplateRefs([string]$text) {
        $out = [System.Collections.Generic.List[string]]::new()
        foreach ($m in [regex]::Matches($text, 'Template[s]?\s+((?:[A-Z]\b[,\s]*(?:and\s+|или\s+)?)+)')) {
            foreach ($l in [regex]::Matches($m.Groups[1].Value, '\b([A-Z])\b')) {
                $out.Add($l.Groups[1].Value)
            }
        }
        return $out | Sort-Object -Unique
    }
    foreach ($kv in $skillFiles.GetEnumerator()) {
        if (-not $kv.Value) { continue }
        foreach ($r in (Get-TemplateRefs $kv.Value)) {
            if ($definedTemplates -notcontains $r) {
                Add-Error "$($kv.Key) references 'Template $r' but templates.md has no such section"
            }
        }
    }
    # WARN: a tool-specific template (G+) never referenced outside templates.md.
    # A-F are generic frameworks reached via the ToC, not by-name routing — skip them.
    $outside = ($skillFiles.GetEnumerator() | Where-Object { $_.Key -ne 'templates.md' -and $_.Value } |
        ForEach-Object { $_.Value }) -join "`n"
    $outsideRefs = Get-TemplateRefs $outside
    foreach ($t in $definedTemplates) {
        if ($t -lt 'G') { continue }
        if ($outsideRefs -notcontains $t) {
            Add-Warning "templates.md 'Template $t' is never referenced from SKILL.md / tool-profiles.md / patterns.md"
        }
    }
}

if ($patText) {
    $definedPatterns = [regex]::Matches($patText, '(?m)^\|\s*(\d+)\s*\|') |
        ForEach-Object { $_.Groups[1].Value }
    foreach ($kv in $skillFiles.GetEnumerator()) {
        if (-not $kv.Value) { continue }
        $refs = [regex]::Matches($kv.Value, 'pattern\s+#(\d+)') |
            ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
        foreach ($r in $refs) {
            if ($definedPatterns -notcontains $r) {
                Add-Error "$($kv.Key) references 'pattern #$r' but patterns.md has no row | $r |"
            }
        }
    }
}

# ---------------------------------------------------------------------------
# 9. No-CoT canonical list drift (SKILL.md -> templates.md Template E)
# ---------------------------------------------------------------------------
Write-Host "Checking no-CoT list consistency..." -ForegroundColor Cyan

if ($skillText -and $tplText) {
    if ($skillText -match '(?m)Canonical no-CoT list[^:]*:\**\s*(.+)$') {
        # The list ends where the same sentence-block continues ("… M3. Also never add …")
        $listPart = ($Matches[1] -split '\.\s+Also')[0]
        $models = $listPart -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
        foreach ($m in $models) {
            if (-not $tplText.Contains($m)) {
                Add-Error "no-CoT drift: '$m' is in SKILL.md's canonical list but missing from templates.md (Template E)"
            }
        }
        Write-Host "  canonical no-CoT list: $($models.Count) models" -ForegroundColor DarkGray
    } else {
        Add-Error "SKILL.md: cannot find the 'Canonical no-CoT list' hard rule (single-source marker)"
    }
}

# ---------------------------------------------------------------------------
# 10. Stale knob-tool enumeration (must include video-AI)
# ---------------------------------------------------------------------------
Write-Host "Checking knob-tool enumerations..." -ForegroundColor Cyan

foreach ($kv in $skillFiles.GetEnumerator()) {
    if (-not $kv.Value) { continue }
    if ($kv.Value -match 'Grok,\s*image-AI\)' -or $kv.Value -match 'Grok/image-AI\)') {
        Add-Error "$($kv.Key): knob-tool list ends at 'image-AI' — video-AI is missing from the enumeration"
    }
}

# ---------------------------------------------------------------------------
# 11. Routing Index: duplicated tool needs a tie-break note
# ---------------------------------------------------------------------------
Write-Host "Checking Routing Index tie-breaks..." -ForegroundColor Cyan

if ($profText) {
    $routingRows = [regex]::Matches($profText, '(?m)^\|.*Comet.*\|$')
    if ($routingRows.Count -ge 2 -and $profText -notmatch '(?i)tie-?break') {
        Add-Error "tool-profiles.md: 'Comet' appears in $($routingRows.Count) routing rows but no tie-break note exists"
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
