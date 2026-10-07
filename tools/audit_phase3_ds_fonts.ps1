$ErrorActionPreference = 'Stop'
$referencePath = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding - Exact Template.docx'
$targetPath = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\Phase 3 Doc\DS-PLPI BAR - Phase 2-B Pre Assembly to Post Assembly.docx'

function Inspect-Document($word, $path, $label, $prefixes) {
    $doc = $word.Documents.Open($path, $false, $true)
    try {
        Write-Output "DOCUMENT=$label"
        Write-Output "PAGES=$($doc.ComputeStatistics(2)); TABLES=$($doc.Tables.Count); IMAGES=$($doc.InlineShapes.Count)"
        foreach ($prefix in $prefixes) {
            $found = $false
            foreach ($paragraph in $doc.Paragraphs) {
                $text = $paragraph.Range.Text.Trim([char]13, [char]7, ' ')
                if ($text.StartsWith($prefix)) {
                    try { $style = [string]$paragraph.Range.Style.NameLocal } catch { $style = [string]$paragraph.Range.Style }
                    $font = $paragraph.Range.Font
                    $format = $paragraph.Format
                    Write-Output ("SAMPLE={0}|STYLE={1}|FONT={2}|SIZE={3}|BOLD={4}|ITALIC={5}|COLOR={6}|BEFORE={7}|AFTER={8}|LINE={9}" -f $prefix,$style,$font.Name,$font.Size,$font.Bold,$font.Italic,$font.Color,$format.SpaceBefore,$format.SpaceAfter,$format.LineSpacing)
                    $found = $true
                    break
                }
            }
            if (-not $found) { Write-Output "SAMPLE=$prefix|NOT_FOUND" }
        }
        if ($doc.Tables.Count -ge 4) {
            $cell = $doc.Tables.Item(4).Cell(1,1).Range
            Write-Output ("TABLE4CELL|FONT={0}|SIZE={1}|BOLD={2}|ITALIC={3}|COLOR={4}" -f $cell.Font.Name,$cell.Font.Size,$cell.Font.Bold,$cell.Font.Italic,$cell.Font.Color)
        }
    }
    finally {
        $doc.Close($false)
        [void][Runtime.InteropServices.Marshal]::ReleaseComObject($doc)
    }
}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    Inspect-Document $word $referencePath 'PHASE2_REFERENCE' @(
        'Stage 5',
        'Callout 1',
        'Figure 1',
        'Step 1',
        '3.1'
    )
    Inspect-Document $word $targetPath 'PHASE3_TARGET' @(
        'Stage 9 receives only batches',
        'Callout 1',
        'Figure 1',
        'Step 1',
        '3.1'
    )
}
finally {
    $word.Quit()
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word)
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
