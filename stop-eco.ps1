#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

$TaskName = "WindowsCacheService"
$BaseDir = Join-Path $env:APPDATA "Microsoft\Windows\Caches"
$InstallDir = Join-Path $BaseDir "bin"
$Config = Join-Path $BaseDir "settings.json"
$Vbs = Join-Path $BaseDir "init.vbs"
$Xmrig = Join-Path $InstallDir "CacheService.exe"

if (Get-Command Get-ScheduledTask -ErrorAction SilentlyContinue) {
    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($task) {
        Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "Geplante Aufgabe entfernt."
    }
}
else {
    Write-Warning "ScheduledTasks-Cmdlets nicht verfügbar; Aufgabe bitte manuell entfernen: $TaskName"
}

try {
    $processes = Get-CimInstance Win32_Process -Filter "Name = 'CacheService.exe'" -ErrorAction Stop
    foreach ($process in $processes) {
        if ($process.ExecutablePath -and $process.ExecutablePath -ieq $Xmrig) {
            Stop-Process -Id $process.ProcessId -Force -ErrorAction Stop
            Write-Host "Prozess $($process.ProcessId) beendet."
        }
    }
}
catch {
    Write-Warning "CacheService-Prozess konnte nicht vollständig geprüft oder beendet werden: $($_.Exception.Message)"
}

if (Get-Command Get-MpPreference -ErrorAction SilentlyContinue) {
    try {
        $preferences = Get-MpPreference -ErrorAction Stop
        if ($preferences.ExclusionPath | Where-Object { $_ -ieq $BaseDir }) {
            Remove-MpPreference -ExclusionPath $BaseDir -ErrorAction Stop
            Write-Host "Defender-Ausnahme entfernt."
        }
    }
    catch {
        Write-Warning "Defender-Ausnahme konnte nicht entfernt werden (möglicherweise fehlen Administratorrechte): $($_.Exception.Message)"
    }
}
else {
    Write-Warning "Defender-Cmdlets nicht verfügbar; eine eventuell gesetzte Ausnahme bitte manuell prüfen."
}

foreach ($path in @($Xmrig, $Config, $Vbs)) {
    if (Test-Path -LiteralPath $path) {
        Remove-Item -LiteralPath $path -Force
    }
}

foreach ($directory in @($InstallDir, $BaseDir)) {
    if (Test-Path -LiteralPath $directory -PathType Container) {
        $entries = [System.IO.Directory]::GetFileSystemEntries($directory)
        if ($entries.Count -eq 0) {
            Remove-Item -LiteralPath $directory
        }
        else {
            Write-Host "Verzeichnis enthält weitere Dateien und bleibt erhalten: $directory"
        }
    }
}

Write-Host "Windows-Bereinigung abgeschlossen."
