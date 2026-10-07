param([Parameter(Mandatory = $true)][string]$DocxPath)

$ErrorActionPreference = 'Stop'
$moduleHeadings = @(
    '3.1 Pre-Assembly QC Module',
    '3.2 Production Controller Handheld / Room Allocation Module',
    '3.3 Assembly Room Module',
    '3.4 Post-Assembly QC Module'
)

$word = $null
$doc = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open((Resolve-Path -LiteralPath $DocxPath).Path, $false, $false)

    for ($index = 1; $index -le $doc.Paragraphs.Count; $index++) {
        $paragraph = $doc.Paragraphs.Item($index)
        $text = ($paragraph.Range.Text -replace '[\r\a]', '').Trim()
        if ($moduleHeadings -contains $text) {
            # Match the Phase 2 module-opening pattern: heading, module
            # introduction and first figure remain together as one opening block.
            $paragraph.Format.KeepWithNext = -1
            if ($index + 1 -le $doc.Paragraphs.Count) {
                $doc.Paragraphs.Item($index + 1).Format.KeepWithNext = -1
            }
            if ($index + 2 -le $doc.Paragraphs.Count) {
                $doc.Paragraphs.Item($index + 2).Format.KeepWithNext = -1
            }
        }
        elseif ($text -eq '3.5 Workflow Status, Corrections and Audit Behaviour') {
            $paragraph.Format.PageBreakBefore = -1
        }
        elseif ($text -eq '4. Additional Non-Functional Requirements') {
            $paragraph.Format.PageBreakBefore = -1
        }
    }

    foreach ($toc in $doc.TablesOfContents) { $toc.Update() }
    $doc.Repaginate()
    $doc.Save()
    "Applied Phase 2 module-opening and major-section pagination. Pages=$($doc.ComputeStatistics(2))"
}
finally {
    if ($doc) { $doc.Close($false) }
    if ($word) { $word.Quit() }
    if ($doc) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($doc) }
    if ($word) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
