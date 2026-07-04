[CmdletBinding()]
param(
    [string]$Version = "13.1.6",
    [string]$HipparchusVersion = "4.0.3",
    [string]$OutDir = "",
    [switch]$WithData,
    [string]$DataDir = ""
)

$ErrorActionPreference = "Stop"

$scriptRoot = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($scriptRoot)) {
    $scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
}
if ([string]::IsNullOrWhiteSpace($OutDir)) {
    $OutDir = Join-Path $scriptRoot "..\vendor\orekit\lib"
}
if ([string]::IsNullOrWhiteSpace($DataDir)) {
    $DataDir = Join-Path $scriptRoot "..\vendor\orekit\data"
}

function Save-MavenJar {
    param(
        [Parameter(Mandatory = $true)][string]$GroupId,
        [Parameter(Mandatory = $true)][string]$ArtifactId,
        [Parameter(Mandatory = $true)][string]$ArtifactVersion
    )

    $groupPath = $GroupId.Replace(".", "/")
    $fileName = "$ArtifactId-$ArtifactVersion.jar"
    $uri = "https://repo1.maven.org/maven2/$groupPath/$ArtifactId/$ArtifactVersion/$fileName"
    $dest = Join-Path $OutDir $fileName

    if (Test-Path -LiteralPath $dest) {
        Write-Host "Already present: $dest"
        return
    }

    Write-Host "Downloading $uri"
    Invoke-WebRequest -UseBasicParsing -Uri $uri -OutFile $dest
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$dependencies = @(
    @("org.orekit", "orekit", $Version),
    @("org.hipparchus", "hipparchus-core", $HipparchusVersion),
    @("org.hipparchus", "hipparchus-geometry", $HipparchusVersion),
    @("org.hipparchus", "hipparchus-ode", $HipparchusVersion),
    @("org.hipparchus", "hipparchus-fitting", $HipparchusVersion),
    @("org.hipparchus", "hipparchus-optim", $HipparchusVersion),
    @("org.hipparchus", "hipparchus-filtering", $HipparchusVersion),
    @("org.hipparchus", "hipparchus-stat", $HipparchusVersion)
)

foreach ($dep in $dependencies) {
    Save-MavenJar -GroupId $dep[0] -ArtifactId $dep[1] -ArtifactVersion $dep[2]
}

if ($WithData) {
    New-Item -ItemType Directory -Force -Path $DataDir | Out-Null
    $zipPath = Join-Path $DataDir "orekit-data-main.zip"
    $dataUri = "https://gitlab.orekit.org/orekit/orekit-data/-/archive/main/orekit-data-main.zip"
    $expanded = Join-Path $DataDir "orekit-data-main"
    $target = Join-Path $DataDir "orekit-data"

    if (Test-Path -LiteralPath $target) {
        Write-Host "Already present: $target"
    }
    else {
        if (-not (Test-Path -LiteralPath $zipPath)) {
            Write-Host "Downloading $dataUri"
            Invoke-WebRequest -UseBasicParsing -Uri $dataUri -OutFile $zipPath
        }

        Write-Host "Expanding $zipPath"
        Expand-Archive -Force -Path $zipPath -DestinationPath $DataDir

        if (Test-Path -LiteralPath $expanded) {
            Move-Item -LiteralPath $expanded -Destination $target
        }
        else {
            Write-Warning "Expected expanded folder was not found: $expanded"
        }
    }
}

Write-Host "Orekit runtime is ready in $OutDir"
if ($WithData) {
    Write-Host "Orekit data is under $DataDir"
}
