$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$path = Join-Path $root 'docz\DS-PLPI BAR.docx'
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
    foreach ($section in @($doc.Sections)) {
        foreach ($footer in @($section.Footers)) {
            [void]$footer.Range.Fields.Update()
        }
        foreach ($header in @($section.Headers)) {
            [void]$header.Range.Fields.Update()
        }
    }
    $doc.Repaginate()
    foreach ($toc in @($doc.TablesOfContents)) {
        [void]$toc.UpdatePageNumbers()
    }
    $doc.Save()
}
finally {
    if ($doc) { $doc.Close($false) }
    if ($word) { $word.Quit() }
    if ($doc) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) }
    if ($word) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}

"Refreshed TOC and page fields."
