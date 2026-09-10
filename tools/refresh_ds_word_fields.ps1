$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$path = Join-Path $root 'docz\DS-PLPI BAR.docx'
$pdf = Join-Path $root 'temp_ds_render\DS-PLPI BAR.pdf'
$pdfDir = Split-Path -Parent $pdf
if (-not (Test-Path -LiteralPath $pdfDir)) { New-Item -ItemType Directory -Path $pdfDir | Out-Null }
if (Test-Path -LiteralPath $pdf) { Remove-Item -LiteralPath $pdf -Force }

$word = $null
$doc = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $word.Options.UpdateFieldsAtPrint = $true
    $doc = $word.Documents.Open($path, $false, $false)

    $doc.Repaginate()
    foreach ($toc in @($doc.TablesOfContents)) {
        [void]$toc.Update()
    }
    foreach ($story in @($doc.StoryRanges)) {
        $range = $story
        while ($range) {
            [void]$range.Fields.Update()
            $range = $range.NextStoryRange
        }
    }
    $doc.Repaginate()
    foreach ($toc in @($doc.TablesOfContents)) {
        [void]$toc.UpdatePageNumbers()
    }
    $doc.Save()
    $doc.ExportAsFixedFormat($pdf, 17)
}
finally {
    if ($doc) { $doc.Close($false) }
    if ($word) { $word.Quit() }
    if ($doc) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) }
    if ($word) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}

"Updated fields and exported: $pdf"
