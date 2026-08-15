Param(
  [Parameter(Mandatory=$true)] [string]$TargetDir,
  [string]$Album = 'Live in Metz, July 2026',
  [string]$Artist = 'Cosmocracy Inc.',
  [int]$Year = 2026,
  [switch]$Recursive
)

function Ensure-FFmpeg(){ if(-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)){ Write-Error 'ffmpeg not found in PATH. Install ffmpeg before running this script.'; exit 1 } }
Ensure-FFmpeg

$base = Resolve-Path $TargetDir
$searchParams = @{ Path = $base; Filter = '*.mp3'; File = $true }
if($Recursive){ $searchParams.Add('Recurse',$true) }

$files = Get-ChildItem @searchParams | Sort-Object FullName
if(-not $files){ Write-Warning "No .mp3 files found in $TargetDir"; exit 0 }

$i = 0; $total = $files.Count
foreach($f in $files){
  $i++
  $name = [IO.Path]::GetFileNameWithoutExtension($f.Name)
  # Remove leading track numbers and separators like "1 - ", "01_", "1. "
  $title = $name -replace '^[0-9]+\s*[-_.\)]*\s*',''
  $title = $title.Trim()

  Write-Host "[$i/$total] Tagging: $($f.Name) -> Title: $title" -ForegroundColor Yellow

  $tmp = $f.FullName + '.tmp.mp3'
  & ffmpeg -y -i "$($f.FullName)" -codec copy -metadata title="$title" -metadata artist="$Artist" -metadata album="$Album" -metadata date=$Year -id3v2_version 3 "$tmp" 2>&1 | Write-Host

  if(Test-Path $tmp){ Move-Item -Force $tmp $f.FullName; Write-Host " -> Tagged $($f.Name)" -ForegroundColor Green } else { Write-Warning "Failed to tag $($f.Name)" }
}

Write-Host "Tagging complete." -ForegroundColor Green
