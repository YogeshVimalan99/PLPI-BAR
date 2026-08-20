$ErrorActionPreference = 'Stop'

$target = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\Project Doc\FS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'

if (Get-Process WINWORD -ErrorAction SilentlyContinue) {
    throw 'Close Microsoft Word before updating the FS.'
}

$word = $null
$doc = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open($target, $false, $false, $false)

    $findRange = $doc.Content.Duplicate
    $findRange.Find.ClearFormatting()
    if (-not $findRange.Find.Execute('4.2 Availability', $true, $false, $false, $false, $false, $true, 0, $false)) {
        throw '4.2 Availability was not found.'
    }
    $breakPosition = $findRange.Paragraphs.Item(1).Range.Start
    $breakRange = $doc.Range($breakPosition, $breakPosition)
    $breakRange.InsertBreak(7)

    $findRange = $doc.Content.Duplicate
    $findRange.Find.ClearFormatting()
    if (-not $findRange.Find.Execute('4.12 Controlled Documents and Training', $true, $false, $false, $false, $false, $true, 0, $false)) {
        throw '4.12 Controlled Documents and Training was not found.'
    }
    $findRange.Paragraphs.Item(1).Format.PageBreakBefore = 0
    $findRange.Paragraphs.Item(1).Format.SpaceBefore = 72

    $doc.Repaginate()
    foreach ($toc in $doc.TablesOfContents) {
        $toc.Update()
        $toc.UpdatePageNumbers()
    }
    $doc.Repaginate()
    $doc.Save()
    $doc.Save()

    [PSCustomObject]@{
        Target = $target
        Pages = $doc.ComputeStatistics(2)
        Saved = $doc.Saved
    } | Format-List
}
finally {
    if ($doc -ne $null) { $doc.Close(0) }
    if ($word -ne $null) { $word.Quit() }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
