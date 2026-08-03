$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$docx = Join-Path $root 'docz\DS-PLPI BAR.docx'
$outDir = Join-Path $root 'temp_ds_render'
$pdf = Join-Path $outDir 'DS-PLPI BAR.pdf'
$log = Join-Path $outDir 'export.log'
if (-not (Test-Path -LiteralPath $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
if (Test-Path -LiteralPath $pdf) { Remove-Item -LiteralPath $pdf -Force }
"Starting $(Get-Date -Format o)" | Set-Content -LiteralPath $log

$word = $null
$doc = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open($docx, $false, $true, $false)
    "Opened $(Get-Date -Format o)" | Add-Content -LiteralPath $log
    $doc.ExportAsFixedFormat($pdf, 17, $false, 0, 0, 1, $doc.ComputeStatistics(2))
    "Exported $(Get-Date -Format o)" | Add-Content -LiteralPath $log
}
catch {
    "ERROR: $($_.Exception.Message)" | Add-Content -LiteralPath $log
    throw
}
finally {
    if ($doc) { $doc.Close($false) }
    if ($word) { $word.Quit() }
    if ($doc) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) }
    if ($word) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
    "Closed $(Get-Date -Format o)" | Add-Content -LiteralPath $log
}
