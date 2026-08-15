Param(
  [Parameter(Mandatory=$true)] [string]$SourceDir,
  [Parameter(Mandatory=$true)] [string]$OutDir,
  [int]$Bitrate = 320,
  [switch]$Recursive,
  [switch]$CopyFlac
)

function Ensure-Dir($path){ if(-not (Test-Path $path)){ New-Item -ItemType Directory -Path $path -Force | Out-Null } }

if(-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)){
  Write-Error "ffmpeg not found in PATH. Install ffmpeg and ensure it's available in PowerShell."
  exit 1
}

$src = Resolve-Path $SourceDir
$out = Resolve-Path -LiteralPath $OutDir -ErrorAction SilentlyContinue
if(-not $out){ Ensure-Dir $OutDir; $out = Resolve-Path $OutDir }

Write-Host "Source: $src"
Write-Host "Output: $out"
Write-Host "Bitrate: ${Bitrate}k" -ForegroundColor Cyan

$searchParams = @{ Path = $src; Filter = '*.flac'; File = $true }
if($Recursive){ $searchParams.Add('Recurse',$true) }

$files = Get-ChildItem @searchParams | Sort-Object FullName
if(-not $files){ Write-Warning "No .flac files found in $SourceDir"; exit 0 }

$total = $files.Count; $i = 0
foreach($f in $files){
  $i++
  Write-Host "[$i/$total] Processing: $($f.Name)" -ForegroundColor Yellow

  # build destination path keeping relative layout
  $rel = $f.FullName.Substring($src.Path.Length).TrimStart('\','/')
  $destDir = Join-Path $out.Path (Split-Path $rel -Parent)
  Ensure-Dir $destDir

  if($CopyFlac){
    Copy-Item -LiteralPath $f.FullName -Destination (Join-Path $destDir $f.Name) -Force
  }

  $outMp3 = Join-Path $destDir ([IO.Path]::GetFileNameWithoutExtension($f.Name) + '.mp3')

  # Run ffmpeg to create 320k MP3 (preserve metadata where possible)
  & ffmpeg -y -i "$($f.FullName)" -ab ${Bitrate}k -map_metadata 0 -id3v2_version 3 "$outMp3" 2>&1 | Write-Host

  if(Test-Path $outMp3){ Write-Host " -> Created: $outMp3" -ForegroundColor Green } else { Write-Warning "Failed to create $outMp3" }
}

Write-Host "Done." -ForegroundColor Green
