$ErrorActionPreference = 'Stop'
$documentPath = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\Phase 3 Doc\DS-PLPI BAR - Phase 2-B Pre Assembly to Post Assembly.docx'
$oldText = 'Callout 4 - Quarantine Label. Test Print is a non-completing output. Print Quarantine Label uses the confirmed batch, box and quantity information and records the print result. The same Print Quarantine Label action remains available whenever printing is required; no separate Void or Reprint action is provided.'
$newText = 'Callout 4 - Quarantine Label. Test Print is a non-completing output. Print Quarantine Label uses the confirmed batch, box and quantity information and records the print result. The same Print Quarantine Label action remains available whenever printing is required; no separate label-printing exception action is provided.'
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
    Write-Output 'Removed obsolete Void/Reprint wording from the current DS.'
}
finally {
    if ($null -ne $document) { $document.Close($false) }
    if ($null -ne $word) { $word.Quit() }
    if ($null -ne $document) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($document) }
    if ($null -ne $word) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    [GC]::Collect(); [GC]::WaitForPendingFinalizers()
}
