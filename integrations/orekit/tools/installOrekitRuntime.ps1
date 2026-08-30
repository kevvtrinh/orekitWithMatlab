[CmdletBinding()]
param(
    [string]$OrekitVersion = "13.1.6",
    [string]$HipparchusVersion = "4.0.3"
)

$ErrorActionPreference = "Stop"
$integrationRoot = Split-Path -Parent $PSScriptRoot
$repositoryRoot = Split-Path -Parent (Split-Path -Parent $integrationRoot)
$libraryRoot = Join-Path $integrationRoot "lib"
$dataParent = Join-Path $repositoryRoot "data\orekit"
$dataRoot = Join-Path $dataParent "orekit-data"

New-Item -ItemType Directory -Force -Path $libraryRoot | Out-Null
New-Item -ItemType Directory -Force -Path $dataParent | Out-Null

$dependencies = @(
    @("org.orekit", "orekit", $OrekitVersion),
    @("org.hipparchus", "hipparchus-core", $HipparchusVersion),
    @("org.hipparchus", "hipparchus-geometry", $HipparchusVersion),
    @("org.hipparchus", "hipparchus-ode", $HipparchusVersion),
    @("org.hipparchus", "hipparchus-fitting", $HipparchusVersion),
    @("org.hipparchus", "hipparchus-optim", $HipparchusVersion),
    @("org.hipparchus", "hipparchus-filtering", $HipparchusVersion),
    @("org.hipparchus", "hipparchus-stat", $HipparchusVersion)
)

foreach ($dependency in $dependencies) {
    $groupPath = $dependency[0].Replace(".", "/")
    $artifact = $dependency[1]
    $version = $dependency[2]
    $fileName = "$artifact-$version.jar"
    $destination = Join-Path $libraryRoot $fileName
    if (Test-Path -LiteralPath $destination) {
        continue
    }
    $uri = "https://repo1.maven.org/maven2/$groupPath/$artifact/$version/$fileName"
    Invoke-WebRequest -UseBasicParsing -Uri $uri -OutFile $destination
}

if (-not (Test-Path -LiteralPath $dataRoot)) {
    git clone --depth 1 `
        https://gitlab.orekit.org/orekit/orekit-data.git $dataRoot
    if ($LASTEXITCODE -ne 0) {
        throw "The official Orekit data repository could not be cloned."
    }
}

$safeDataRoot = $dataRoot.Replace("\", "/")
$dataRevision = git -c "safe.directory=$safeDataRoot" -C $dataRoot rev-parse HEAD
if ($LASTEXITCODE -ne 0) {
    throw "The installed Orekit data revision could not be identified."
}
Set-Content -LiteralPath (Join-Path $dataParent "orekit-data-revision.txt") `
    -Value $dataRevision

Write-Host "Orekit runtime installed."
Write-Host "JAR folder: $libraryRoot"
Write-Host "Data folder: $dataRoot"
