$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $root ".run\pids.json"

if (!(Test-Path $pidFile)) {
  Write-Host "No PID file found at .run\pids.json. Nothing to stop."
  exit 0
}

$pids = Get-Content -Raw $pidFile | ConvertFrom-Json
$targets = @(
  @{ Name = "ML"; Id = $pids.ml },
  @{ Name = "Backend"; Id = $pids.backend },
  @{ Name = "Frontend"; Id = $pids.frontend }
)

foreach ($target in $targets) {
  if ($null -eq $target.Id) {
    continue
  }

  try {
    $proc = Get-Process -Id $target.Id -ErrorAction SilentlyContinue
    if ($null -ne $proc) {
      Stop-Process -Id $target.Id -Force
      Write-Host "$($target.Name) stopped (PID $($target.Id))."
    } else {
      Write-Host "$($target.Name) already stopped (PID $($target.Id))."
    }
  } catch {
    Write-Host "Could not stop $($target.Name) (PID $($target.Id)): $($_.Exception.Message)" -ForegroundColor Yellow
  }
}

Remove-Item $pidFile -Force
Write-Host "All managed services are stopped."
