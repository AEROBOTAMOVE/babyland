# Бейби Ленд · 24.10 · КАЧИ.cmd — има ли Node.js 22.13+? Няма ли го — пита и го слага (winget), иначе отваря nodejs.org.
# По образеца на AERO_CLOUDFLARE/nujen_node.ps1, с една разлика: Node се слага САМО при изрично «Д»
# («н», празно/Enter и край на входа = нищо не се инсталира).
# Изход 0 = Node е наред (КАЧИ.cmd продължава) · 1 = няма Node (КАЧИ.cmd спира). ПЪТ НАЗАД: махни реда с този файл от КАЧИ.cmd.
$ErrorActionPreference = 'SilentlyContinue'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8; [Console]::InputEncoding = [Text.Encoding]::UTF8 } catch {}
$MIN = [version]'22.13.0'
$node = Get-Command node -ErrorAction SilentlyContinue
$npx = Get-Command npx -ErrorAction SilentlyContinue
$ver = $null
if ($node) {
  $t = (& node -v 2>$null)
  if ($t -match 'v?(\d+)\.(\d+)\.(\d+)') { $ver = [version]("{0}.{1}.{2}" -f $Matches[1], $Matches[2], $Matches[3]) }
}
if ($ver -and $ver -ge $MIN -and $npx) { exit 0 }
if ($ver -and $ver -lt $MIN) { Write-Host ("Node.js е " + $ver + " — трябва 22.13 или по-нов.") }
elseif ($ver -and -not $npx) { Write-Host "Node.js е тук, но без npx — трябва пълната инсталация." }
Write-Host "Трябва Node.js (веднъж, 1 минута). Да го инсталирам ли сега? [Д/н]"
# пренасочен вход (пробите) → редът от потока; край на потока = «не» (без човек нищо не се слага)
if ([Console]::IsInputRedirected) { $a = [Console]::In.ReadLine(); if ($null -eq $a) { $a = '' } } else { $a = Read-Host }
if ($a -notmatch '^\s*[дДyY]') {
  Write-Host "Добре — нищо не е инсталирано. Node.js се взема от https://nodejs.org/bg/download ; после пусни КАЧИ.cmd пак."
  exit 1
}
$winget = (Get-Command winget -ErrorAction SilentlyContinue).Source
if (-not $winget) { $w2 = Join-Path $env:LOCALAPPDATA 'Microsoft\WindowsApps\winget.exe'; if (Test-Path $w2) { $winget = $w2 } }
if ($winget) {
  Write-Host "Слагам Node.js LTS (одобри прозореца на Windows, ако се появи) …"
  & $winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
} else {
  Write-Host "Няма winget — отварям https://nodejs.org/bg/download ; свали «LTS» за Windows и го инсталирай."
  Start-Process "https://nodejs.org/bg/download"
}
Write-Host "Затвори този прозорец и пусни КАЧИ.cmd пак (новият Node се вижда чак в нов прозорец)."
exit 1
