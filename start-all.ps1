$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "zomatothon-frontend"
$mlModel = Join-Path $root "ml\models\ranker_v1.pkl"
$runDir = Join-Path $root ".run"
$pidFile = Join-Path $runDir "pids.json"

New-Item -ItemType Directory -Force -Path $runDir | Out-Null

function Test-PortInUse {
  param([int]$Port)
  $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  return $null -ne $conn
}

if ((Test-PortInUse -Port 8000) -or (Test-PortInUse -Port 3001) -or (Test-PortInUse -Port 3000)) {
  Write-Host "One of the required ports (8000, 3001, 3000) is already in use." -ForegroundColor Yellow
  Write-Host "Run .\stop-all.ps1 first, or stop conflicting apps manually."
  exit 1
}

if (!(Test-Path $mlModel)) {
  Write-Host "Model not found. Building dataset + training model via python main.py ..."
  & python main.py
}

Write-Host "Starting ML service on http://localhost:8000 ..."
$mlProcess = Start-Process -FilePath "python" -ArgumentList "-m","ml.app" -WorkingDirectory $root -PassThru

Write-Host "Starting backend on http://localhost:3001 ..."
$backendProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $backendDir -PassThru

Write-Host "Starting frontend on http://localhost:3000 ..."
$frontendProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "start" -WorkingDirectory $frontendDir -PassThru

$pids = @{
  ml = $mlProcess.Id
  backend = $backendProcess.Id
  frontend = $frontendProcess.Id
  started_at = (Get-Date).ToString("o")
}

$pids | ConvertTo-Json | Set-Content -Path $pidFile -Encoding UTF8

Write-Host ""
Write-Host "Services started:"
Write-Host "  ML:       http://localhost:8000  (PID $($mlProcess.Id))"
Write-Host "  Backend:  http://localhost:3001  (PID $($backendProcess.Id))"
Write-Host "  Frontend: http://localhost:3000  (PID $($frontendProcess.Id))"
Write-Host ""
Write-Host "To stop all services: .\stop-all.ps1"
