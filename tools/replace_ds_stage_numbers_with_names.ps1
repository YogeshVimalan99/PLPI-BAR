$ErrorActionPreference = 'Stop'

$docPath = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\Phase 3 Doc\DS-PLPI BAR - Phase 2-B Pre Assembly to Post Assembly.docx'

$replacements = [ordered]@{
    'Stage 9-12' = 'Pre-Assembly QC, Production Controller Handheld / Room Allocation, Assembly Room and Post-Assembly QC'
    'performs Stage 10' = 'performs the Production Controller Handheld / Room Allocation workflow'
    'Stage 10 room allocation is confirmed' = 'Production Controller Handheld / Room Allocation confirmation is complete'
    'locks Stage 12' = 'locks the Post-Assembly QC record'
    'Stage 9' = 'Pre-Assembly QC'
    'Stage 10' = 'Production Controller Handheld / Room Allocation'
    'Stage 11' = 'Assembly Room'
    'Stage 12' = 'Post-Assembly QC'
}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $null

try {
    $doc = $word.Documents.Open($docPath, $false, $false)
    $counts = [ordered]@{}

    foreach ($source in $replacements.Keys) {
        $target = $replacements[$source]
        $count = 0
        $scan = $doc.Content.Duplicate
        $scan.Find.ClearFormatting()
        $scan.Find.Text = $source
        $scan.Find.Forward = $true
        $scan.Find.Wrap = 0
        $scan.Find.MatchCase = $true
        $scan.Find.MatchWholeWord = $false

        while ($scan.Find.Execute()) {
            $count++
            $scan.Start = $scan.End
            $scan.End = $doc.Content.End
        }

        if ($count -gt 0) {
            $replaceRange = $doc.Content.Duplicate
            $replaceRange.Find.ClearFormatting()
            $replaceRange.Find.Replacement.ClearFormatting()
            $replaceRange.Find.Text = $source
            $replaceRange.Find.Replacement.Text = $target
            $replaceRange.Find.Forward = $true
            $replaceRange.Find.Wrap = 1
            $replaceRange.Find.MatchCase = $true
            $replaceRange.Find.MatchWholeWord = $false
            [void]$replaceRange.Find.Execute($source, $true, $false, $false, $false, $false, $true, 1, $false, $target, 2)
        }
        $counts[$source] = $count
    }

    $doc.Save()
    $counts.GetEnumerator() | ForEach-Object { '{0}: {1}' -f $_.Key, $_.Value }
}
finally {
    if ($null -ne $doc) {
        $doc.Close([ref]0)
        [Runtime.InteropServices.Marshal]::ReleaseComObject($doc) | Out-Null
    }
    $word.Quit()
    [Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
