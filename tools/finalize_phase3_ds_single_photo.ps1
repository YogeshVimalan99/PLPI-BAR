$ErrorActionPreference = 'Stop'
$documentPath = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\Phase 3 Doc\DS-PLPI BAR - Phase 2-B Pre Assembly to Post Assembly.docx'
$oldText = 'Callout 4 - Mark Done and Finish Batch. Mark Done signs only the current page. Finish Batch becomes available only after Pages 1-4 are signed, required evidence exists and no unresolved reconciliation or IPC condition remains.'
$newText = 'Callout 4 - Mark Done and Finish Batch. Mark Done signs only the current page. Finish Batch becomes available only after Pages 1-4 are signed, the required IPC photo exists and no unresolved reconciliation condition remains.'
$word = $null
$document = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $document = $word.Documents.Open($documentPath, $false, $false)
    $match = $null
    foreach ($paragraph in $document.Paragraphs) {
        if ($paragraph.Range.Text.Trim([char]13, [char]7, ' ') -eq $oldText) { $match = $paragraph; break }
    }
    if ($null -eq $match) { throw 'The current DS paragraph was not found; no edit was saved.' }
    $range = $match.Range.Duplicate
    $range.End = $range.End - 1
    $range.Text = $newText
    foreach ($toc in $document.TablesOfContents) { $toc.Update() }
    $document.Repaginate()
    $document.Save()
    Write-Output 'Finalised the single-photo completion rule.'
}
finally {
    if ($null -ne $document) { $document.Close($false) }
    if ($null -ne $word) { $word.Quit() }
    if ($null -ne $document) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($document) }
    if ($null -ne $word) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    [GC]::Collect(); [GC]::WaitForPendingFinalizers()
}
