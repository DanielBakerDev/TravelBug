# Manual fallback for publishing. Normally use the "Publish to live site"
# GitHub Actions workflow instead (.github/workflows/publish.yml), which does
# the same thing and also moves the `live` tag.
#
# This builds the site and uploads _site/ — not the project root, which now
# holds templates and content rather than finished pages.
param(
  [Parameter(Mandatory = $true)]
  [string]$BucketName,
  [Parameter(Mandatory = $true)]
  [string]$DistributionId
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$awsCommand = Get-Command aws -ErrorAction SilentlyContinue
$awsExe = if ($awsCommand) { $awsCommand.Source } else { 'C:\Program Files\Amazon\AWSCLIV2\aws.exe' }

Push-Location $projectRoot
try {
  npm ci
  if ($LASTEXITCODE -ne 0) { throw 'npm ci failed' }
  # Start from an empty _site so nothing stale gets uploaded.
  if (Test-Path _site) { Remove-Item -Recurse -Force _site }
  npm run build
  if ($LASTEXITCODE -ne 0) { throw 'Build failed; nothing was uploaded.' }
} finally {
  Pop-Location
}

& $awsExe s3 sync (Join-Path $projectRoot '_site') "s3://$BucketName" --delete

& $awsExe cloudfront create-invalidation --distribution-id $DistributionId --paths '/*'
