param([string]$pref, [int]$cols = 4, [double]$scale = 0.42)
Add-Type -AssemblyName System.Drawing
$dir = Join-Path $PSScriptRoot 'snimki'
$files = Get-ChildItem $dir -Filter "$($pref)_*.jpg" | Sort-Object Name
if (-not $files) { "no files for $pref"; exit }
$first = [System.Drawing.Image]::FromFile($files[0].FullName)
$w = [int]($first.Width * $scale); $h = [int]($first.Height * $scale); $first.Dispose()
$rows = [math]::Ceiling($files.Count / $cols)
$bmp = New-Object System.Drawing.Bitmap ($w * $cols), ($h * $rows)
$g = [System.Drawing.Graphics]::FromImage($bmp); $g.Clear([System.Drawing.Color]::White)
$g.InterpolationMode = 'HighQualityBicubic'
for ($i = 0; $i -lt $files.Count; $i++) {
  $im = [System.Drawing.Image]::FromFile($files[$i].FullName)
  $g.DrawImage($im, ($i % $cols) * $w, [math]::Floor($i / $cols) * $h, $w, $h); $im.Dispose()
}
$out = Join-Path $dir "$($pref)_LIST.jpg"
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Jpeg); $g.Dispose(); $bmp.Dispose()
$out
