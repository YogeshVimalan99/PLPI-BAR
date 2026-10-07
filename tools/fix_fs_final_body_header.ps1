$ErrorActionPreference = 'Stop'
$target = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\Project Doc\FS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'
if (Get-Process WINWORD -ErrorAction SilentlyContinue) { throw 'Close Microsoft Word before updating the FS.' }
$word = $null
$doc = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open($target, $false, $false, $false)
    $searchStart = [Math]::Max(0, $doc.Content.End - 6000)
    $findRange = $doc.Range($searchStart, $doc.Content.End)
    $findRange.Find.ClearFormatting()
    if (-not $findRange.Find.Execute('4.12 Controlled Documents and Training', $true, $false, $false, $false, $false, $true, 0, $false)) {
        throw 'Body section 4.12 was not found.'
    }
    $heading = $findRange.Paragraphs.Item(1)
    $heading.Format.PageBreakBefore = 0
    $heading.Format.SpaceBefore = 72
    $doc.Repaginate()
    foreach ($toc in $doc.TablesOfContents) { $toc.Update(); $toc.UpdatePageNumbers() }
    $doc.Repaginate()
    $doc.Save()
    $doc.Save()
    [PSCustomObject]@{ Target = $target; Pages = $doc.ComputeStatistics(2); Saved = $doc.Saved } | Format-List
}
finally {
    if ($doc -ne $null) { $doc.Close(0) }
    if ($word -ne $null) { $word.Quit() }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
