$ErrorActionPreference = 'Stop'

$target = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\Project Doc\URS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'
$backupDir = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\.tmp_urs_docz'
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backup = Join-Path $backupDir "before-direct-fix-$stamp.docx"
Copy-Item -LiteralPath $target -Destination $backup

$wdPreferredWidthPoints = 3
$wdAutoFitFixed = 0
$wdAlignParagraphLeft = 0
$wdAlignParagraphCenter = 1
$wdAlignParagraphJustify = 3
$wdRowHeightAuto = 0
$wdCellAlignVerticalCenter = 1
$wdColorWhite = 16777215
$navyHeading = 6168320
$navyBody = 6684672

function Set-CellText {
    param($Cell, [string]$Text)
    $range = $Cell.Range.Duplicate
    $range.MoveEnd(1, -1) | Out-Null
    $range.Text = $Text
}

function Set-FixedTableGeometry {
    param(
        $Table,
        [double]$Indent,
        [double[]]$ColumnWidths
    )
    $Table.AllowAutoFit = $false
    $Table.AutoFitBehavior($wdAutoFitFixed)
    $Table.Rows.Alignment = $wdAlignParagraphLeft
    $Table.Rows.LeftIndent = $Indent
    $Table.PreferredWidthType = $wdPreferredWidthPoints
    $total = 0.0
    foreach ($width in $ColumnWidths) { $total += $width }
    $Table.PreferredWidth = $total
    for ($column = 1; $column -le $ColumnWidths.Count; $column++) {
        $Table.Columns.Item($column).PreferredWidthType = $wdPreferredWidthPoints
        $Table.Columns.Item($column).PreferredWidth = $ColumnWidths[$column - 1]
        $Table.Columns.Item($column).Width = $ColumnWidths[$column - 1]
    }
    $Table.TopPadding = 3
    $Table.BottomPadding = 3
    $Table.LeftPadding = 5
    $Table.RightPadding = 5
    $Table.Spacing = 0
    $Table.Rows.HeightRule = $wdRowHeightAuto
    $Table.Rows.AllowBreakAcrossPages = 0
}

$requirements = @(
    'The system shall provide one controlled Printing module containing separate work queues for Label Printing, Leaflet Printing, Carton Issuing and Braille Printing, with access restricted by the user''s authorised role.',
    'The Label Printing queue shall receive batches after BAR issue. The Leaflet Printing queue shall receive batches after Label Printing. Carton Issuing shall list only reboxing batches after Leaflet Printing, and Braille Printing shall list only relabelling batches for which braille is required after Leaflet Printing. Each queue shall support search by B&S batch number and manufacturing lot number.',
    'For the selected batch, the system shall display the product, strength, pack size, B&S batch number, manufacturing lot number, expiry, process route, component description and reference, size, required quantity, stock or in-hand quantity, location and current printing status needed to complete the activity.',
    'The Printing module shall provide controlled access to the populated BAR and the approved artwork and supporting records applicable to the route, including label, carton, peel, braille, mock-up, continuation-page and leaflet documents. The system shall retain the applicable document reference or version and an audit record of controlled document access.',
    'Label Printing shall derive the required label lines from the approved batch route. For reboxing batches, printing shall remain blocked until the Received As and Assembled As information is complete and signed. A test label shall be accepted before the full run, and each label line shall show its reference, size, required quantity, location, in-hand quantity, print action, completion status and completed-by/date information.',
    'For every printable line, the system shall distinguish the approved required quantity from the quantity already printed and the quantity remaining. It shall support controlled partial printing and additional printing; any quantity above the approved requirement shall be identified as extra and shall require the user to select or enter a reason before printing.',
    'The system shall save printing progress by batch and component line, retain each print run with quantity, printer, user, date and time, and prevent Print Done until every applicable line is complete. Line completion and final completion shall be attributable to the authenticated user and retained in the batch audit history.',
    'Leaflet Printing shall display each approved leaflet reference, size, quantity and location, open the controlled leaflet PDF for printing, require the master or test copy to be reviewed before the full run, and enable Mark as Done only after the applicable leaflet has been printed. Extra leaflet quantities shall require a recorded reason.',
    'Carton Issuing shall be available only for reboxing batches and shall record carton reference, required quantity, on-hand quantity, issue location, extra quantity and reason where applicable, and the confirming user and date/time. Braille Printing shall be available only for relabelling batches requiring braille and shall apply the same line-level quantity, extra-print, completion and audit controls used for controlled label printing.',
    'When a printing activity is completed, the system shall update the batch status and route it to the next applicable activity: Label Printing to Leaflet Printing where required; Leaflet Printing to Carton Issuing for reboxing or to Braille Printing where required for relabelling; and completed route-specific printing to Leaflet Folding or the next configured stage. Completed records shall remain available for controlled review and audit.'
)

$word = $null
$doc = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open($target, $false, $false, $false)

    if ($doc.Tables.Count -lt 8) { throw "Expected at least 8 tables; found $($doc.Tables.Count)." }

    # Correct the four content tables so every visible border remains inside the usable page width.
    Set-FixedTableGeometry -Table $doc.Tables.Item(5) -Indent 69.7 -ColumnWidths @(110.0, 345.0)
    foreach ($tableIndex in 6..8) {
        Set-FixedTableGeometry -Table $doc.Tables.Item($tableIndex) -Indent 40.5 -ColumnWidths @(85.0, 379.0)
        $doc.Tables.Item($tableIndex).Rows.Item(1).HeadingFormat = -1
    }

    # Replace only the existing Printing Module requirement wording; keep the user's row count and surrounding content.
    $printingTable = $doc.Tables.Item(7)
    if ($printingTable.Rows.Count -ne 11 -or $printingTable.Columns.Count -ne 2) {
        throw "Printing Module table geometry changed unexpectedly: $($printingTable.Rows.Count) rows x $($printingTable.Columns.Count) columns."
    }
    for ($index = 0; $index -lt $requirements.Count; $index++) {
        $row = $index + 2
        Set-CellText -Cell $printingTable.Cell($row, 1) -Text ("4.2.{0}" -f ($index + 1))
        Set-CellText -Cell $printingTable.Cell($row, 2) -Text $requirements[$index]
    }

    # Match the existing requirement-table typography after cell text replacement.
    $printingTable.Range.Font.Name = 'Verdana'
    $printingTable.Range.Font.Size = 11
    $printingTable.Range.Font.Color = $navyBody
    $printingTable.Range.ParagraphFormat.SpaceBefore = 0
    $printingTable.Range.ParagraphFormat.SpaceAfter = 0
    $printingTable.Range.ParagraphFormat.LineSpacing = 12.4
    $printingTable.Range.Cells.VerticalAlignment = $wdCellAlignVerticalCenter

    $printingTable.Rows.Item(1).Range.Font.Name = 'Verdana'
    $printingTable.Rows.Item(1).Range.Font.Size = 10
    $printingTable.Rows.Item(1).Range.Font.Bold = -1
    $printingTable.Rows.Item(1).Range.Font.Color = $wdColorWhite
    $printingTable.Rows.Item(1).Range.ParagraphFormat.Alignment = $wdAlignParagraphCenter
    for ($row = 2; $row -le $printingTable.Rows.Count; $row++) {
        $printingTable.Cell($row, 1).Range.Font.Bold = -1
        $printingTable.Cell($row, 1).Range.ParagraphFormat.Alignment = $wdAlignParagraphCenter
        $printingTable.Cell($row, 2).Range.Font.Bold = 0
        $printingTable.Cell($row, 2).Range.ParagraphFormat.Alignment = $wdAlignParagraphJustify
    }

    # Rebuild the existing automatic TOC from the headings currently present in the saved document.
    if ($doc.TablesOfContents.Count -ne 1) { throw "Expected one table of contents; found $($doc.TablesOfContents.Count)." }
    $toc = $doc.TablesOfContents.Item(1)
    $toc.Update()
    $doc.Repaginate()
    $toc.UpdatePageNumbers()

    # Apply the reference-document TOC typography and indentation without changing the heading content.
    foreach ($paragraph in $toc.Range.Paragraphs) {
        $text = ($paragraph.Range.Text -replace '[\r\a]','').Trim()
        $styleName = $paragraph.Range.Style.NameLocal
        $paragraph.Range.Font.Name = 'Verdana'
        $paragraph.Range.Font.Size = 10
        $paragraph.Range.Font.Bold = -1
        $paragraph.Range.Font.Color = $navyHeading
        $paragraph.Range.ParagraphFormat.SpaceAfter = 0
        $paragraph.Range.ParagraphFormat.LineSpacing = 12
        if ($text -match '^Revision History') {
            $paragraph.Range.ParagraphFormat.LeftIndent = 54.6
            $paragraph.Range.ParagraphFormat.FirstLineIndent = 0
            $paragraph.Range.ParagraphFormat.SpaceBefore = 22.9
        } elseif ($styleName -eq 'TOC 2') {
            $paragraph.Range.ParagraphFormat.LeftIndent = 72.5
            $paragraph.Range.ParagraphFormat.FirstLineIndent = 0
            $paragraph.Range.ParagraphFormat.SpaceBefore = 6
        } else {
            $paragraph.Range.ParagraphFormat.LeftIndent = 72.5
            $paragraph.Range.ParagraphFormat.FirstLineIndent = -14.7
            $paragraph.Range.ParagraphFormat.SpaceBefore = 6
        }
    }

    foreach ($paragraph in $doc.Paragraphs) {
        $text = ($paragraph.Range.Text -replace '[\r\a]','').Trim()
        if ($text -eq 'Contents') {
            $paragraph.Range.Font.Name = 'Verdana'
            $paragraph.Range.Font.Size = 13
            $paragraph.Range.Font.Bold = -1
            $paragraph.Range.Font.Color = $navyHeading
            $paragraph.Range.ParagraphFormat.LeftIndent = 54.6
            $paragraph.Range.ParagraphFormat.FirstLineIndent = 0
            $paragraph.Range.ParagraphFormat.SpaceBefore = 12.2
            $paragraph.Range.ParagraphFormat.SpaceAfter = 0
            $paragraph.Range.ParagraphFormat.LineSpacing = 12
            break
        }
    }

    $doc.Repaginate()
    $toc.UpdatePageNumbers()
    $doc.Save()

    $tocText = ($toc.Range.Text -replace '[\r\a]',' / ').Trim()
    $pageCount = $doc.ComputeStatistics(2)
    $tableMetrics = @()
    foreach ($tableIndex in 5..8) {
        $table = $doc.Tables.Item($tableIndex)
        $width = 0.0
        $columnWidths = @()
        for ($column = 1; $column -le $table.Columns.Count; $column++) {
            $columnWidth = $table.Columns.Item($column).Width
            $width += $columnWidth
            $columnWidths += ('{0:N1}' -f $columnWidth)
        }
        $tableMetrics += "T$tableIndex left=$('{0:N1}' -f $table.Rows.LeftIndent) width=$('{0:N1}' -f $width) right=$('{0:N1}' -f ($table.Rows.LeftIndent + $width)) cols=[$($columnWidths -join ',')]"
    }

    [PSCustomObject]@{
        Backup = $backup
        Pages = $pageCount
        Tables = $doc.Tables.Count
        TOC = $tocText
        TableGeometry = ($tableMetrics -join '; ')
    } | Format-List
}
finally {
    if ($doc -ne $null) { $doc.Close(0) }
    if ($word -ne $null) { $word.Quit() }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
