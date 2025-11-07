<#
PowerShell helper: dump-mysql.ps1
- Reads MySQL connection info from `.env.local` (falls back to environment variables)
- Runs `mysqldump` with the password included so it won't prompt
- Produces a timestamped dump file under `dumps/` by default

Usage:
  # from repo root (FrontPage)
  .\scripts\dump-mysql.ps1

  # specify output directory
  .\scripts\dump-mysql.ps1 -OutputDir .\backups

Security note: This script passes the password on the command line for convenience. On shared systems prefer using a MySQL option file (`~/.my.cnf`) or running interactively.
#>
[CmdletBinding()]
param(
    [string]$EnvFile = (Join-Path (Resolve-Path "$PSScriptRoot\..") '.env.local'),
    [string]$OutputDir = (Join-Path (Resolve-Path "$PSScriptRoot\..") 'dumps')
)

function Read-EnvFile {
    param([string]$Path)
    $cfg = @{}
    if (-not (Test-Path $Path)) { return $cfg }
    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line) { return }
        if ($line.StartsWith('#')) { return }
        $idx = $line.IndexOf('=')
        if ($idx -lt 1) { return }
        $k = $line.Substring(0,$idx).Trim()
        $v = $line.Substring($idx+1).Trim()
        # remove surrounding quotes if present
        if ($v.StartsWith('"') -and $v.EndsWith('"') -or $v.StartsWith("'") -and $v.EndsWith("'")) {
            $v = $v.Substring(1,$v.Length-2)
        }
        $cfg[$k] = $v
    }
    return $cfg
}

Write-Host "Reading env file: $EnvFile"
$envCfg = Read-EnvFile -Path $EnvFile

$host = $envCfg['MYSQL_HOST']  
if (-not $host) { $host = $env:MYSQL_HOST }
$user = $envCfg['MYSQL_USER']  
if (-not $user) { $user = $env:MYSQL_USER }
$pass = $envCfg['MYSQL_PASSWORD']  
if (-not $pass) { $pass = $env:MYSQL_PASSWORD }
$db   = $envCfg['MYSQL_DATABASE']
if (-not $db) { $db = $env:MYSQL_DATABASE }
$port = $envCfg['MYSQL_PORT']
if (-not $port) { $port = $env:MYSQL_PORT }
if (-not $port) { $port = '3306' }
if (-not $host) { $host = '127.0.0.1' }

if (-not $user -or -not $db) {
    Write-Error "Missing required MySQL configuration. Ensure MYSQL_USER and MYSQL_DATABASE are set in $EnvFile or environment variables."
    exit 2
}

# Ensure output dir exists
if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir | Out-Null }

$outFile = Join-Path $OutputDir ("${db}_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql")

# Check for mysqldump
$mysqldumpCmd = Get-Command mysqldump -ErrorAction SilentlyContinue
if (-not $mysqldumpCmd) {
    Write-Error "`nError: 'mysqldump' executable not found in PATH. Please install MySQL client tools or ensure 'mysqldump' is in your PATH.`n"
    exit 3
}

# Build argument list. Note: --password=... avoids interactive prompt
$argList = @(
    "--host=$host",
    "--port=$port",
    "--user=$user",
    "--password=$pass",
    "--routines",
    "--events",
    "--single-transaction",
    "--quick",
    "--skip-lock-tables",
    $db
)

Write-Host "Exporting database '$db' from $host:$port as user '$user' to:`n  $outFile`n"

# Run mysqldump and redirect output
try {
    &mysqldump @argList > $outFile
    $exit = $LASTEXITCODE
} catch {
    Write-Error "mysqldump execution failed: $_"
    exit 4
}

if ($exit -eq 0) {
    Write-Host "Dump completed successfully: $outFile"
    exit 0
} else {
    Write-Error "mysqldump exited with code $exit"
    exit $exit
}
