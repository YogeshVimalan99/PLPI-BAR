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

    foreach ($headingText in @('4.9 Accuracy & Validity', '4.2 Availability')) {
        $searchStart = [Math]::Max(0, $doc.Content.End - 8000)
        $findRange = $doc.Range($searchStart, $doc.Content.End)
        $findRange.Find.ClearFormatting()
        if (-not $findRange.Find.Execute($headingText, $true, $false, $false, $false, $false, $true, 0, $false)) {
            throw "Body heading not found: $headingText"
        }
        $position = $findRange.Paragraphs.Item(1).Range.Start
        $sectionRange = $doc.Range($position, $position)
        $sectionRange.InsertBreak(2)
    }

    for ($sectionIndex = 2; $sectionIndex -le $doc.Sections.Count; $sectionIndex++) {
        $section = $doc.Sections.Item($sectionIndex)
        $section.Headers.Item(1).LinkToPrevious = -1
        $section.Footers.Item(1).LinkToPrevious = -1
        if ($section.Footers.Item(1).PageNumbers.Count -gt 0) {
            $section.Footers.Item(1).PageNumbers.RestartNumberingAtSection = $false
        }
    }

    $searchStart = [Math]::Max(0, $doc.Content.End - 6000)
    $findRange = $doc.Range($searchStart, $doc.Content.End)
    $findRange.Find.ClearFormatting()
    if (-not $findRange.Find.Execute('4.9 Accuracy & Validity', $true, $false, $false, $false, $false, $true, 0, $false)) {
        throw 'Body heading 4.9 was not found.'
    }
    $findRange.Paragraphs.Item(1).Format.SpaceBefore = 72

    $searchStart = [Math]::Max(0, $doc.Content.End - 6000)
    $findRange = $doc.Range($searchStart, $doc.Content.End)
    $findRange.Find.ClearFormatting()
    if (-not $findRange.Find.Execute('4.12 Controlled Documents and Training', $true, $false, $false, $false, $false, $true, 0, $false)) {
        throw 'Body heading 4.12 was not found.'
    }
    $findRange.Paragraphs.Item(1).Format.PageBreakBefore = 0
    $findRange.Paragraphs.Item(1).Format.SpaceBefore = 2

    $doc.Repaginate()
    foreach ($toc in $doc.TablesOfContents) { $toc.Update(); $toc.UpdatePageNumbers() }
    $doc.Repaginate()
    $doc.Save()
    $doc.Save()
    [PSCustomObject]@{ Target = $target; Pages = $doc.ComputeStatistics(2); Sections = $doc.Sections.Count; Saved = $doc.Saved } | Format-List
}
finally {
    if ($doc -ne $null) { $doc.Close(0) }
    if ($word -ne $null) { $word.Quit() }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
