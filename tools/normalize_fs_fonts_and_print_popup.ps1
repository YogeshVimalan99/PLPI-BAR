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

    function Cell-Text($cell) {
        return (($cell.Range.Text -replace '[\r\a]', '').Trim())
    }

    function Set-CellText($cell, [string]$text) {
        $range = $cell.Range.Duplicate
        [void]$range.MoveEnd(1, -1)
        $range.Text = $text
    }

    function Set-RowValues($table, [int]$rowNumber, [string]$name, [string]$type, [string]$description) {
        Set-CellText $table.Cell($rowNumber, 1) $name
        Set-CellText $table.Cell($rowNumber, 2) $type
        Set-CellText $table.Cell($rowNumber, 3) $description
    }

    # Section 3.2: retain the replicated module-level Print button as Existing,
    # but document the entire resulting pop-up and everything inside it as New.
    $common = $doc.Tables.Item(7).Cell(5, 2).Tables.Item(1)
    $printRow = 0
    $quantityNeededRow = 0
    for ($i = 2; $i -le $common.Rows.Count; $i++) {
        $name = Cell-Text $common.Cell($i, 1)
        if ($name -eq 'Print') { $printRow = $i }
        if ($name -eq 'Quantity Needed') { $quantityNeededRow = $i; break }
    }
    if ($printRow -eq 0 -or $quantityNeededRow -eq 0) {
        throw 'The common Print controls could not be located.'
    }

    Set-RowValues $common $printRow 'Print' 'Existing button - common' 'Existing replicated module button. Opens the new common Print pop-up for the selected label, leaflet or braille line.'
    $beforeRow = $common.Rows.Item($quantityNeededRow)
    [void]$common.Rows.Add($beforeRow)
    Set-RowValues $common $quantityNeededRow 'Print pop-up' 'New pop-up - common' 'The complete pop-up opened from Print is new. It provides all new quantity, category, reason, preview and submission controls defined below.'

    for ($i = 2; $i -le $common.Rows.Count; $i++) {
        $name = Cell-Text $common.Cell($i, 1)
        switch ($name) {
            'Quantity Needed' { Set-CellText $common.Cell($i, 2) 'New read-only field - common' }
            'Quantity to Print' { Set-CellText $common.Cell($i, 2) 'New entry field - common' }
            'Category' { Set-CellText $common.Cell($i, 2) 'New controlled selection - common' }
            'Reason' { Set-CellText $common.Cell($i, 2) 'New conditional field - common' }
            'Print (dialog)' { Set-CellText $common.Cell($i, 2) 'New controlled button - common' }
            'Close print preview' { Set-CellText $common.Cell($i, 2) 'New button - common' }
        }
    }

    $ruleCell = $doc.Tables.Item(7).Cell(11, 2)
    $ruleText = Cell-Text $ruleCell
    if ($ruleText -notmatch 'entire Print pop-up') {
        $ruleText += ' The entire Print pop-up and every field, selection and button within it are New functionality.'
        Set-CellText $ruleCell $ruleText
    }

    # Match the reference FS: all module-table text uses Verdana 11 pt.
    # Existing/New classification is conveyed by wording, not font size.
    for ($tableIndex = 6; $tableIndex -le 13; $tableIndex++) {
        $table = $doc.Tables.Item($tableIndex)
        $table.Range.Font.Name = 'Verdana'
        $table.Range.Font.Size = 11
        foreach ($cell in $table.Range.Cells) {
            $cell.VerticalAlignment = 1
            foreach ($paragraph in $cell.Range.Paragraphs) {
                $paragraph.Format.SpaceBefore = 0
                $paragraph.Format.SpaceAfter = 0
            }
        }
        $table.Rows.Item(1).HeadingFormat = -1
    }

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
        Tables = $doc.Tables.Count
        Saved = $doc.Saved
    } | Format-List
}
finally {
    if ($doc -ne $null) { $doc.Close(0) }
    if ($word -ne $null) { $word.Quit() }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
