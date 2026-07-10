<#
.SYNOPSIS
    PowerShell entry point for the prompt-master release-gate lint.

.DESCRIPTION
    Delegates to the dependency-free Node lint so JavaScript and PowerShell
    paths enforce the identical registry, profile graph, runtime inventory, and
    source contracts. Any missing Node executable or non-zero Node result fails
    closed with the same exit code. No network or live model command is used.

.EXAMPLE
    ./scripts/lint.ps1
#>

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$lintJs = Join-Path $PSScriptRoot 'lint.js'

if (-not (Test-Path -LiteralPath $lintJs -PathType Leaf)) {
    Write-Error "Required canonical lint not found: $lintJs"
    exit 1
}

try {
    & node $lintJs
    $code = $LASTEXITCODE
} catch {
    Write-Error "Cannot execute canonical Node lint: $($_.Exception.Message)"
    exit 1
}

if ($null -eq $code) { exit 1 }
exit $code
