$ErrorActionPreference = 'Stop'

$documentPath = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\Phase 3 Doc\DS-PLPI BAR - Phase 2-B Pre Assembly to Post Assembly.docx'
$darkBlue = 6299648
$word = $null
$document = $null

function Get-StyleName($paragraph) {
    try { return [string]$paragraph.Range.Style.NameLocal } catch { return [string]$paragraph.Range.Style }
}

try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $document = $word.Documents.Open($documentPath, $false, $false)

    $bodyStart = $null
    foreach ($paragraph in $document.Paragraphs) {
        $text = $paragraph.Range.Text.Trim([char]13, [char]7, ' ')
        $style = Get-StyleName $paragraph
        if ($style -eq 'Heading 1' -and $text -eq '1. Introduction') {
            $bodyStart = $paragraph.Range.Start
            break
        }
    }
    if ($null -eq $bodyStart) { throw 'Could not locate the body heading: 1. Introduction' }

    foreach ($paragraph in $document.Paragraphs) {
        if ($paragraph.Range.Start -lt $bodyStart) { continue }

        $text = $paragraph.Range.Text.Trim([char]13, [char]7, ' ')
        $style = Get-StyleName $paragraph

        if ($style -eq 'Heading 1' -or $style -eq 'Heading 2') {
            $paragraph.Range.Font.Name = 'Verdana'
            $paragraph.Range.Font.Size = 11
            $paragraph.Range.Font.Bold = -1
            $paragraph.Range.Font.Italic = 0
            $paragraph.Range.Font.Color = $darkBlue
            continue
        }

        if ($style -eq 'Body Text') {
            $paragraph.Range.Font.Name = 'Verdana'
            $paragraph.Range.Font.Size = 10
            $paragraph.Range.Font.Color = $darkBlue
            $paragraph.Format.SpaceBefore = 6
            $paragraph.Format.SpaceAfter = 6
            $paragraph.Format.LineSpacingRule = 4
            $paragraph.Format.LineSpacing = 15
            if ($text.StartsWith('Callout ')) {
                $paragraph.Range.Font.Bold = 0
                $paragraph.Range.Font.Italic = 0
            }
            continue
        }

        if ($style -eq 'No Spacing' -and $text.StartsWith('Figure ')) {
            $paragraph.Range.Font.Name = 'Verdana'
            $paragraph.Range.Font.Size = 10
            $paragraph.Range.Font.Bold = 0
            $paragraph.Range.Font.Italic = -1
            $paragraph.Range.Font.Color = $darkBlue
            $paragraph.Format.Alignment = 1
            $paragraph.Format.SpaceBefore = 0
            $paragraph.Format.SpaceAfter = 8
            $paragraph.Format.LineSpacingRule = 4
            $paragraph.Format.LineSpacing = 12
        }
    }

    if ($document.Tables.Count -lt 4) { throw "Expected at least four tables; found $($document.Tables.Count)." }
    $abbreviationTable = $document.Tables.Item(4)
    foreach ($cell in $abbreviationTable.Range.Cells) {
        $cell.Range.Font.Name = 'Verdana'
        $cell.Range.Font.Size = 10
        $cell.Range.Font.Bold = 0
        $cell.Range.Font.Italic = 0
        $cell.Range.Font.Color = $darkBlue
        $cell.Range.ParagraphFormat.SpaceBefore = 0
        $cell.Range.ParagraphFormat.SpaceAfter = 0
    }

    foreach ($toc in $document.TablesOfContents) { $toc.Update() }
    $document.Repaginate()
    $document.Save()
    Write-Output "Updated actual Phase 3 DS fonts: $documentPath"
}
finally {
    if ($null -ne $document) { $document.Close($false) }
    if ($null -ne $word) { $word.Quit() }
    if ($null -ne $abbreviationTable) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($abbreviationTable) }
    if ($null -ne $document) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($document) }
    if ($null -ne $word) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
