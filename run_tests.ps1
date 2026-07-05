[CmdletBinding()]
param(
    [string]$MatlabExecutable = "matlab",
    [string]$TestPath = "src\tests",
    [switch]$SkipRuntimeFetch
)

$ErrorActionPreference = "Stop"

$repoRoot = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($repoRoot)) {
    $repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
}

$fetchScript = Join-Path $repoRoot "scripts\fetch-orekit-runtime.ps1"
$libDir = Join-Path $repoRoot "vendor\orekit\lib"
$dataDir = Join-Path $repoRoot "vendor\orekit\data\orekit-data"

function Test-OrekitRuntimeReady {
    $orekitJar = Get-ChildItem -LiteralPath $libDir -Filter "orekit-*.jar" -ErrorAction SilentlyContinue | Select-Object -First 1
    $hipparchusCoreJar = Get-ChildItem -LiteralPath $libDir -Filter "hipparchus-core-*.jar" -ErrorAction SilentlyContinue | Select-Object -First 1
    return ($null -ne $orekitJar -and $null -ne $hipparchusCoreJar -and (Test-Path -LiteralPath $dataDir -PathType Container))
}

if (-not $SkipRuntimeFetch -and -not (Test-OrekitRuntimeReady)) {
    Write-Host "Orekit runtime is missing or incomplete. Fetching jars and data..."
    & $fetchScript -WithData
}
elseif ($SkipRuntimeFetch) {
    Write-Host "Skipping Orekit runtime fetch."
}
else {
    Write-Host "Orekit runtime is ready."
}

try {
    Get-Command $MatlabExecutable -ErrorAction Stop | Out-Null
}
catch {
    Write-Error "MATLAB executable '$MatlabExecutable' was not found. Pass -MatlabExecutable with the full path to matlab.exe."
    exit 127
}

$matlabTestPath = $TestPath.Replace("\", "/")
$batchCommand = @"
startupOrekitSuite();
results = runtests(fullfile('$matlabTestPath'));
disp(results);
passed = nnz([results.Passed]);
failed = nnz([results.Failed]);
incomplete = nnz([results.Incomplete]);
fprintf('\nMATLAB test summary: %d passed, %d failed, %d incomplete, %d total\n', passed, failed, incomplete, numel(results));
assertSuccess(results);
"@ -replace "`r?`n", " "

Write-Host "Running MATLAB tests from $repoRoot..."
Push-Location $repoRoot
try {
    & $MatlabExecutable -batch $batchCommand
    $matlabExitCode = $LASTEXITCODE
}
finally {
    Pop-Location
}

if ($matlabExitCode -eq 0) {
    Write-Host "MATLAB tests passed."
}
else {
    Write-Host "MATLAB tests failed with exit code $matlabExitCode."
}

exit $matlabExitCode
