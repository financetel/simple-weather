param([string]$OutputName = 'SimpleWeather')

$ErrorActionPreference = 'Stop'

if (-not $env:OPENWEATHER_API_KEY) {
    $settingsPath = Join-Path $env:APPDATA 'SimpleWeather\config.json'
    if (Test-Path -LiteralPath $settingsPath) {
        $settings = Get-Content -LiteralPath $settingsPath -Raw | ConvertFrom-Json
        if ($settings.api_key) {
            $env:OPENWEATHER_API_KEY = [string]$settings.api_key
        }
    }
}

if (-not $env:OPENWEATHER_API_KEY) {
    throw '앱에 저장된 키가 없습니다. 먼저 앱에서 API 키를 저장하거나 OPENWEATHER_API_KEY를 설정하세요.'
}

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$keyModule = Join-Path $projectRoot 'build_key.py'
$venvPython = Join-Path $projectRoot '.venv\Scripts\python.exe'
$keyLiteral = $env:OPENWEATHER_API_KEY | ConvertTo-Json -Compress
$moduleContent = "API_KEY = $keyLiteral`n"

Push-Location $projectRoot
try {
    Set-Content -LiteralPath $keyModule -Value $moduleContent -Encoding ascii
    if (Test-Path -LiteralPath $venvPython) {
        & $venvPython -m PyInstaller --noconfirm --clean --onefile --windowed --name $OutputName --collect-all tzdata main.py
    }
    else {
        python -m PyInstaller --noconfirm --clean --onefile --windowed --name $OutputName --collect-all tzdata main.py
    }
    if ($LASTEXITCODE -ne 0) {
        throw "PyInstaller failed with exit code $LASTEXITCODE"
    }
}
finally {
    Remove-Item -LiteralPath $keyModule -Force -ErrorAction SilentlyContinue
    Pop-Location
}
