$ErrorActionPreference = 'Stop'

$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$reference = Join-Path $root 'Reference Doc (Templates)\URS Addendum 1 of PLPI Software - VMP-A5-0007-01-v22   14-Oct 2024...docx'
$output = Join-Path $root 'Project Doc\URS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'
Copy-Item -LiteralPath $reference -Destination $output -Force

$wdStory = 6
$wdPageBreak = 7
$wdCollapseEnd = 0
$wdAlignLeft = 0
$wdAlignCenter = 1
$wdAlignRight = 2
$wdAlignJustify = 3
$wdCellAlignVerticalCenter = 1
$wdFieldPage = 33
$wdFieldNumPages = 26
$wdColorNavy = 8388608
$wdColorDarkBlue = 6299648
$wdLineStyleSingle = 1

function Move-End($selection) { [void]$selection.EndKey($wdStory) }

function Set-Font($range, [string]$name, [double]$size, [bool]$bold = $false) {
    $range.Font.Name = $name
    $range.Font.Size = $size
    $range.Font.Bold = $(if ($bold) { -1 } else { 0 })
}

function Add-Paragraph {
    param($selection, [string]$text, [string]$style = 'Normal', [int]$alignment = 0, [bool]$bold = $false, [double]$size = 0)
    Move-End $selection
    $selection.Style = $style
    $selection.ParagraphFormat.Alignment = $alignment
    if ($alignment -eq $wdAlignCenter) {
        $selection.ParagraphFormat.LeftIndent = 0
        $selection.ParagraphFormat.RightIndent = 0
        $selection.ParagraphFormat.SpaceAfter = 0
    }
    $selection.Font.Bold = $(if ($bold -or $style -like 'Heading*') { -1 } else { 0 })
    if ($size -gt 0) { $selection.Font.Size = $size }
    $selection.TypeText($text)
    $selection.TypeParagraph()
    $selection.Font.Bold = 0
}

function Add-PageBreak($selection) {
    Move-End $selection
    [void]$selection.InsertBreak($wdPageBreak)
}

function Add-Table {
    param($doc, $selection, [object[]]$rows, [int[]]$widths, [bool]$header = $true, [double]$fontSize = 11, [double]$leftIndent = 0)
    Move-End $selection
    $table = $doc.Tables.Add($selection.Range, $rows.Count, $rows[0].Count)
    $table.Style = 'Table Grid'
    $table.AllowAutoFit = $false
    $table.Borders.Enable = $true
    Set-Font $table.Range 'Verdana' $fontSize
    $table.Range.Font.Color = $wdColorDarkBlue
    $table.Range.ParagraphFormat.SpaceBefore = 0
    $table.Range.ParagraphFormat.SpaceAfter = 0
    $table.Range.ParagraphFormat.LineSpacing = 13.8
    $table.Range.Cells.VerticalAlignment = $wdCellAlignVerticalCenter
    $table.TopPadding = 2
    $table.BottomPadding = 2
    $table.LeftPadding = 5.4
    $table.RightPadding = 5.4
    if ($leftIndent -ne 0) { $table.Rows.SetLeftIndent($leftIndent, 0) }
    for ($c = 1; $c -le $widths.Count; $c++) { $table.Columns.Item($c).PreferredWidth = $widths[$c - 1] }
    for ($r = 1; $r -le $rows.Count; $r++) {
        for ($c = 1; $c -le $rows[$r - 1].Count; $c++) { $table.Cell($r, $c).Range.Text = [string]$rows[$r - 1][$c - 1] }
    }
    if ($header) {
        $table.Rows.Item(1).Range.Bold = -1
        $table.Rows.Item(1).Range.Font.Color = 16777215
        $table.Rows.Item(1).Shading.BackgroundPatternColor = $wdColorNavy
        $table.Rows.Item(1).HeadingFormat = -1
    }
    $range = $table.Range
    $range.Collapse($wdCollapseEnd)
    $range.Select()
    $selection.TypeParagraph()
    return $table
}

function Add-RequirementSection {
    param($doc, $selection, [string]$heading, [string]$lead, [object[]]$requirements)
    Add-Paragraph $selection $heading 'Heading 2'
    Add-Paragraph $selection $lead 'Normal' $wdAlignJustify
    $rows = @()
    $rows += ,@('URS ID', 'Requirements')
    foreach ($requirement in $requirements) { $rows += ,$requirement }
    [void](Add-Table $doc $selection $rows @(77, 412) $true 11 -22)
}

function Add-BrandBanner {
    param($doc, $selection, [string]$scopeLine)
    Move-End $selection
    $table = $doc.Tables.Add($selection.Range, 1, 2)
    $table.AllowAutoFit = $false
    $table.Borders.Enable = $false
    $table.Columns.Item(1).PreferredWidth = 330
    $table.Columns.Item(2).PreferredWidth = 160
    $table.Rows.SetLeftIndent(0, 0)
    $table.BottomPadding = 5
    $left = $table.Cell(1, 1).Range
    $left.End = $left.End - 1
    $left.Text = "B&S Healthcare`rUser Requirement Specification -`rPLPI Assembly Control Software`r$scopeLine"
    Set-Font $left 'Verdana' 11 $true
    $left.Font.Color = $wdColorDarkBlue
    $left.ParagraphFormat.SpaceAfter = 0
    $left.ParagraphFormat.LineSpacing = 13.8
    $left.Paragraphs.Item(1).Range.Font.Italic = -1
    $logoCell = $table.Cell(1, 2).Range
    $logoCell.End = $logoCell.End - 1
    $logoCell.ParagraphFormat.Alignment = $wdAlignRight
    $logoPath = Join-Path $root '.tmp_urs_current\reference-media\image2.png'
    $logo = $logoCell.InlineShapes.AddPicture($logoPath, $false, $true)
    $logo.LockAspectRatio = -1
    $logo.Width = 150
    $table.Borders.Item(-3).LineStyle = $wdLineStyleSingle
    $table.Borders.Item(-3).Color = $wdColorNavy
    $table.Borders.Item(-3).LineWidth = 18
    $range = $table.Range
    $range.Collapse($wdCollapseEnd)
    $range.Select()
    $selection.TypeParagraph()
}

function Add-ApprovalBlock {
    param($doc, $selection, [string]$role, [string]$responsibility)
    Move-End $selection
    $table = $doc.Tables.Add($selection.Range, 2, 4)
    $table.AllowAutoFit = $false
    $table.Borders.Enable = $false
    $table.Columns.Item(1).PreferredWidth = 110
    $table.Columns.Item(2).PreferredWidth = 225
    $table.Columns.Item(3).PreferredWidth = 45
    $table.Columns.Item(4).PreferredWidth = 100
    $table.Range.Font.Name = 'Verdana'
    $table.Range.Font.Size = 11
    $table.Range.Font.Color = $wdColorDarkBlue
    $table.Range.ParagraphFormat.SpaceAfter = 0
    $table.Cell(1, 1).Range.Text = $role
    $table.Cell(1, 3).Range.Text = 'Date'
    $table.Cell(2, 2).Range.Text = $responsibility
    foreach ($cellIndex in @(@(1,2), @(1,4))) {
        $cell = $table.Cell($cellIndex[0], $cellIndex[1])
        $cell.Borders.Item(-3).LineStyle = $wdLineStyleSingle
        $cell.Borders.Item(-3).Color = $wdColorNavy
    }
    $range = $table.Range
    $range.Collapse($wdCollapseEnd)
    $range.Select()
    $selection.TypeParagraph()
    $selection.ParagraphFormat.SpaceAfter = 15
    $selection.TypeParagraph()
}

$requirements41 = @(
    @('4.1.1', 'The system shall provide an authorised B&S Batch Add workspace containing batches that have completed the approved upstream Batch Checker and Product Check Log handoff.'),
    @('4.1.2', 'The workspace shall allow users to filter or search eligible records using the available country, site, category, stock/status and B&S batch number criteria.'),
    @('4.1.3', 'The batch list shall display sufficient source information to identify the intended record, including product status, site, country, part number, foreign product name, ECMA/reference, strength, pack size, B&S batch number, expiry date, quantity, order/invoice information, warehouse location and route category where available.'),
    @('4.1.4', 'The system shall prevent a BAR from being generated from a record that is incomplete, not eligible for BAR generation, already generated, on hold or not released by the preceding controlled stage.'),
    @('4.1.5', 'The system shall allow one or more source records to be selected for a single BAR only when the configured combination criteria are met.'),
    @('4.1.6', 'Where source records are combined, the system shall verify that the product/part number, product identity, B&S batch number and expiry date match and shall block the combination when any required value differs.'),
    @('4.1.7', 'The system shall calculate the combined BAR quantity from the selected source records and retain traceability to each contributing order, invoice, location and source quantity.'),
    @('4.1.8', 'Before generation, the system shall present the selected B&S batch number and require an explicit confirmation that the user intends to generate the BAR.'),
    @('4.1.9', 'The system shall generate one controlled electronic BAR using the approved product, batch, route and quantity data current at the point of confirmation.'),
    @('4.1.10', 'The generated BAR shall have a unique and traceable relationship to the B&S batch number and shall retain the generating user and date/time.'),
    @('4.1.11', 'The system shall provide a controlled view of generated BAR pages and a controlled print action where a paper copy or continuation page remains required.'),
    @('4.1.12', 'After successful generation, the system shall change the source record from Not Printed BAR to the appropriate generated/printed status and prevent accidental duplicate generation without an authorised, reasoned reprint or correction route.')
)

$requirements42 = @(
    @('4.2.1', 'The generated BAR workflow shall display the B&S batch number, product name, foreign name where applicable, strength, pack size, ECMA/reference, expiry date, quantity, route/category and manufacturing lot information required for verification.'),
    @('4.2.2', 'The system shall require confirmation that the Product Check Log is complete and that the applicable invoice or approved source record is available.'),
    @('4.2.3', 'The system shall require confirmation that the B&S batch number and expiry date are correct before sign-off.'),
    @('4.2.4', 'The system shall require confirmation that the product name, strength, pack size and ECMA/reference are correct before sign-off.'),
    @('4.2.5', 'All mandatory BAR creation and line-clearance checks shall be completed before the User Sign Off action is enabled.'),
    @('4.2.6', 'The system shall provide a comments field for observations, discrepancies or other relevant information and shall retain the comments with the BAR record.'),
    @('4.2.7', 'User sign-off shall capture the authenticated user, role and date/time and shall lock the completed checklist from ordinary amendment.'),
    @('4.2.8', 'Following successful sign-off, the system shall place the batch in the Label Printing queue and remove it from the active B&S Batch Add work list.'),
    @('4.2.9', 'The system shall not permit the batch to progress to printing when any mandatory check is incomplete or when an unresolved mismatch or hold is recorded.')
)

$requirements43 = @(
    @('4.3.1', 'The system shall provide a shared Printer module for authorised printing users with separate options for Label Printing, Leaflet Printing, Carton Issuing and Braille Printing.'),
    @('4.3.2', 'Each Printer option shall show its active and in-progress workload and shall display only batches that have met the entry conditions for that printing activity.'),
    @('4.3.3', 'Printer queues shall support search by B&S batch number and manufacturing lot number and shall show product, strength, pack size, ECMA/reference, expiry, required quantity and current status.'),
    @('4.3.4', 'Opening a queue item shall display a common read-only product-information panel and links to the applicable batch documents, approved artwork and controlled continuation pages.'),
    @('4.3.5', 'The system shall derive printing requirements from the approved BAR and product route and shall not rely on the operator to select an unrelated artwork or batch.'),
    @('4.3.6', 'A user shall only be able to act on printing work permitted by the user role and the current workflow status.'),
    @('4.3.7', 'The system shall support saving an incomplete printing activity as in progress without recording the batch as complete.'),
    @('4.3.8', 'Once a printing stage is completed and signed off, the batch shall be removed from the active queue for that stage and routed to the next applicable controlled stage.'),
    @('4.3.9', 'Completed printing records shall remain available to authorised users through batch history, audit history or another controlled read-only view.')
)

$requirements44 = @(
    @('4.4.1', 'The Label Printing queue shall contain only batches with a generated BAR and completed B&S Batch Add sign-off.'),
    @('4.4.2', 'The system shall determine the required label lines from the approved route, including carton/end-of-pack/security-seal requirements for reboxing and blister/pack or obscure-label requirements for relabelling where applicable.'),
    @('4.4.3', 'For each label line, the system shall display label name, approved reference, size, required quantity, location, on-hand quantity, completion state and completed-by/date information.'),
    @('4.4.4', 'For reboxing, printing shall remain unavailable until the controlled Change of Pack Size information, including Received As and Assembled As sections, is complete and signed where required.'),
    @('4.4.5', 'The system shall provide controlled access to the applicable approved carton, peel-out, braille, mock-up and BAR records and to required continuation pages.'),
    @('4.4.6', 'The system shall require a successful test-print review for each applicable label type before the full print run can be completed.'),
    @('4.4.7', 'The system shall record the actual quantity printed for each label line and shall display the remaining quantity during partial or repeated print runs.'),
    @('4.4.8', 'Any quantity printed above the approved requirement shall require an extra quantity and a controlled reason before completion.'),
    @('4.4.9', 'The system shall support capture or attachment of required label evidence, including the first and last acceptable printed labels or equivalent approved digital evidence.'),
    @('4.4.10', 'Each label line shall be marked complete only after its required printing and applicable evidence or review controls are satisfied.'),
    @('4.4.11', 'The Print Done action shall remain unavailable until all applicable label lines are complete and all mandatory reasons, evidence and route-specific approvals are present.'),
    @('4.4.12', 'Completion shall capture the authenticated user and date/time and shall route leaflet-required batches to Leaflet Printing or to the next applicable stage when no leaflet is required.')
)

$requirements45 = @(
    @('4.5.1', 'The Leaflet Printing queue shall contain only batches for which Label Printing is complete and an approved leaflet is required.'),
    @('4.5.2', 'The system shall display the approved leaflet reference, size/format, required quantity, location and applicable product and batch details.'),
    @('4.5.3', 'The system shall provide controlled access to the current approved leaflet/artwork record and the generated BAR information used for the print decision.'),
    @('4.5.4', 'The system shall require a master or test leaflet to be produced and accepted before the full leaflet quantity can be completed.'),
    @('4.5.5', 'The system shall record the actual quantity printed and shall support controlled partial and repeat print runs without losing the cumulative quantity.'),
    @('4.5.6', 'Any leaflet quantity above the approved requirement shall require a recorded extra quantity and reason before completion.'),
    @('4.5.7', 'The system shall support capture or attachment of the approved master printed leaflet and the applicable foreign leaflet or reference evidence.'),
    @('4.5.8', 'The leaflet line shall not be marked complete until the print run, master/test review and required evidence are complete.'),
    @('4.5.9', 'Completion shall capture the authenticated user and date/time and shall remove the batch from the active Leaflet Printing queue.'),
    @('4.5.10', 'After Leaflet Printing, the system shall route reboxing batches to Carton Issuing and relabelling batches to Braille Printing when braille is required; otherwise it shall route the batch to the next applicable stage.')
)

$requirements46 = @(
    @('4.6.1', 'The Carton Issuing queue shall contain only leaflet-complete reboxing batches that require approved cartons.'),
    @('4.6.2', 'For Carton Issuing, the system shall display the approved carton reference, required quantity, on-hand quantity, controlled location/box information and confirmation status.'),
    @('4.6.3', 'The system shall require the issued carton reference, quantity and location to agree with the approved BAR requirement before the issue line can be completed.'),
    @('4.6.4', 'Any additional carton issue shall require the extra quantity and a controlled reason and shall be included in the audit history.'),
    @('4.6.5', 'The Braille Printing queue shall contain only leaflet-complete relabelling batches for which braille is required.'),
    @('4.6.6', 'For Braille Printing, the system shall display the approved braille label and declaration/reference requirements, quantities and completion status.'),
    @('4.6.7', 'Braille printing shall require the applicable test/review and evidence controls, and any extra quantity shall require a controlled reason.'),
    @('4.6.8', 'Carton or Braille completion shall capture the authenticated user and date/time and shall route the batch to Leaflet Folding or the next applicable stage defined by the approved route.')
)

$requirements47 = @(
    @('4.7.1', 'The Leaflet Folding module shall display only batches that have completed all printing and route-specific preparation required before folding.'),
    @('4.7.2', 'The queue shall support search by B&S batch number and manufacturing lot number and shall display product, strength, pack size, ECMA/reference, expiry, required quantity and status.'),
    @('4.7.3', 'Opening a batch shall display the applicable product information, batch documents, leaflet reference, leaflet size/fold format, required quantity and on-hand quantity.'),
    @('4.7.4', 'The system shall require the operator to confirm that the selected batch and leaflet agree with the approved BAR and leaflet reference before completion.'),
    @('4.7.5', 'The system shall require confirmation of the folded quantity and any required count or line-clearance control before the Done action is available.'),
    @('4.7.6', 'The system shall prevent completion where the leaflet reference, fold format, quantity or batch identity is missing, incorrect or subject to an unresolved hold.'),
    @('4.7.7', 'Leaflet Folding completion shall capture the authenticated operator, role, folded quantity and date/time.'),
    @('4.7.8', 'After completion, the batch shall be removed from the active Leaflet Folding queue and routed to Pre-Assembly.'),
    @('4.7.9', 'The completed folding record shall remain visible in the electronic BAR and batch history to support downstream verification and investigation.')
)

$requirements48 = @(
    @('4.8.1', 'The system shall maintain a chronological audit trail for BAR generation, line-clearance checks, confirmations, print actions, test/master decisions, quantities, evidence actions, stage completion, routing, holds, corrections and reprints.'),
    @('4.8.2', 'Audit records shall include the affected B&S batch, action, previous and new status where applicable, authenticated user, role, date/time, quantity, reason/comment and evidence reference.'),
    @('4.8.3', 'Electronic records and attached evidence shall be attributable, legible, contemporaneous, original or verified copies, accurate, complete, consistent, enduring and available for the required retention period.'),
    @('4.8.4', 'Completed records shall be read-only to ordinary users; corrections shall use an authorised process that preserves the original value, changed value, reason, user and date/time.'),
    @('4.8.5', 'The system shall prevent deletion or silent overwriting of completed BAR, printing or folding records and their linked evidence.'),
    @('4.8.6', 'A mismatch, failed test/master review, missing evidence, quantity discrepancy or unavailable approved artwork shall place the applicable activity on hold and prevent downstream progression.'),
    @('4.8.7', 'The system shall allow an authorised user to record an exception, rejection or hold reason and route it to the responsible function for resolution.'),
    @('4.8.8', 'A resolved exception shall retain the resolution, approver where required and date/time, and shall require affected controls to be repeated when the validity of an earlier completion has been impacted.'),
    @('4.8.9', 'The system shall provide authorised users with batch-level status and history sufficient to identify the current stage, completed stages, outstanding requirements and blocking exceptions.'),
    @('4.8.10', 'System time, user identity, role assignment, session security, backup, recovery and record retention shall be controlled in accordance with approved PLPI and IT procedures.'),
    @('4.8.11', 'The system shall not permit a later workflow stage to record completion until all mandatory entry criteria from the preceding in-scope stage are satisfied.'),
    @('4.8.12', 'Where a print service, device, upload or other technical action fails, the system shall show a clear failure outcome and shall not create a misleading successful completion record.')
)

$word = $null
$doc = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open($output, $false, $false)
    $doc.Content.Delete()
    $doc.TrackRevisions = $false

    $normal = $doc.Styles.Item('Normal')
    Set-Font $normal 'Verdana' 11
    $normal.Font.Color = $wdColorDarkBlue
    $normal.ParagraphFormat.Alignment = $wdAlignJustify
    $normal.ParagraphFormat.LeftIndent = 28
    $normal.ParagraphFormat.RightIndent = 0
    $normal.ParagraphFormat.SpaceBefore = 0
    $normal.ParagraphFormat.SpaceAfter = 10
    $normal.ParagraphFormat.LineSpacing = 13.8

    foreach ($name in @('Heading 1', 'Heading 2', 'Heading 3')) {
        $style = $doc.Styles.Item($name)
        Set-Font $style 'Verdana' 11 $true
        $style.Font.Color = $wdColorDarkBlue
        $style.ParagraphFormat.Alignment = $wdAlignLeft
        $style.ParagraphFormat.LeftIndent = 0
        $style.ParagraphFormat.RightIndent = 0
        $style.ParagraphFormat.SpaceBefore = 0
        $style.ParagraphFormat.SpaceAfter = 10
        $style.ParagraphFormat.LineSpacing = 13.8
        $style.ParagraphFormat.KeepWithNext = -1
    }
    foreach ($name in @('TOC 1', 'TOC 2')) {
        $style = $doc.Styles.Item($name)
        Set-Font $style 'Verdana' 11
        $style.Font.Color = $wdColorDarkBlue
        $style.ParagraphFormat.LeftIndent = 0
        $style.ParagraphFormat.SpaceAfter = 5
        $style.ParagraphFormat.LineSpacing = 18
    }

    $section = $doc.Sections.Item(1)
    $page = $section.PageSetup
    $page.PageWidth = 595.3
    $page.PageHeight = 841.9
    $page.LeftMargin = 72
    $page.RightMargin = 72
    $page.TopMargin = 85.35
    $page.BottomMargin = 72
    $page.HeaderDistance = 7.1
    $page.FooterDistance = 35.4
    $page.OddAndEvenPagesHeaderFooter = -1
    $page.DifferentFirstPageHeaderFooter = 0

    $oddHeader = $section.Headers.Item(1)
    $oddHeader.Range.Text = ''
    $headerTable = $oddHeader.Range.Tables.Add($oddHeader.Range, 1, 2)
    $headerTable.AllowAutoFit = $false
    $headerTable.Borders.Enable = $false
    $headerTable.Columns.Item(1).PreferredWidth = 350
    $headerTable.Columns.Item(2).PreferredWidth = 140
    $headerTable.TopPadding = 0
    $headerTable.BottomPadding = 5
    $headerLeft = $headerTable.Cell(1, 1).Range
    $headerLeft.End = $headerLeft.End - 1
    $headerLeft.Text = "B&S Healthcare`rUser Requirement Specification -`rPLPI Assembly Control Software`rB&S Batch Add, Printing and Leaflet Folding"
    Set-Font $headerLeft 'Verdana' 11 $true
    $headerLeft.Font.Color = $wdColorDarkBlue
    $headerLeft.ParagraphFormat.SpaceAfter = 0
    $headerLeft.ParagraphFormat.LineSpacing = 13.8
    $headerLeft.Paragraphs.Item(1).Range.Font.Italic = -1
    $headerLogoCell = $headerTable.Cell(1, 2).Range
    $headerLogoCell.End = $headerLogoCell.End - 1
    $headerLogoCell.ParagraphFormat.Alignment = $wdAlignRight
    $logoPath = Join-Path $root '.tmp_urs_current\reference-media\image2.png'
    $headerLogo = $headerLogoCell.InlineShapes.AddPicture($logoPath, $false, $true)
    $headerLogo.LockAspectRatio = -1
    $headerLogo.Width = 130
    $headerTable.Borders.Item(-3).LineStyle = $wdLineStyleSingle
    $headerTable.Borders.Item(-3).Color = $wdColorNavy
    $headerTable.Borders.Item(-3).LineWidth = 18
    $evenHeader = $section.Headers.Item(3).Range
    $evenHeader.Text = ''

    foreach ($footerIndex in @(1, 3)) {
        $footer = $section.Footers.Item($footerIndex).Range
        $footer.Text = 'Page '
        Set-Font $footer 'Verdana' 10
        $footer.Font.Color = $wdColorDarkBlue
        $footer.ParagraphFormat.Alignment = $wdAlignRight
        $fieldRange = $section.Footers.Item($footerIndex).Range.Duplicate
        $fieldRange.End = $fieldRange.End - 1
        $fieldRange.Collapse($wdCollapseEnd)
        [void]$doc.Fields.Add($fieldRange, $wdFieldPage)
        $fieldRange = $section.Footers.Item($footerIndex).Range.Duplicate
        $fieldRange.End = $fieldRange.End - 1
        $fieldRange.Collapse($wdCollapseEnd)
        $fieldRange.InsertAfter(' of ')
        $fieldRange = $section.Footers.Item($footerIndex).Range.Duplicate
        $fieldRange.End = $fieldRange.End - 1
        $fieldRange.Collapse($wdCollapseEnd)
        [void]$doc.Fields.Add($fieldRange, $wdFieldNumPages)
    }

    $selection = $word.Selection
    for ($i = 0; $i -lt 7; $i++) { Add-Paragraph $selection '' 'Normal' $wdAlignCenter }
    Add-Paragraph $selection 'User Requirement Specification' 'Normal' $wdAlignCenter $true 12
    Add-Paragraph $selection 'Of' 'Normal' $wdAlignCenter $true 12
    Add-Paragraph $selection 'PLPI Batch Record Automation' 'Normal' $wdAlignCenter $true 12
    Add-Paragraph $selection 'B&S Batch Add, Printing Modules and Leaflet Folding' 'Normal' $wdAlignCenter $true 12
    Add-Paragraph $selection 'Stages 4 to 8' 'Normal' $wdAlignCenter $true 11
    Add-Paragraph $selection '' 'Normal' $wdAlignCenter

    Add-ApprovalBlock $doc $selection 'Author' 'Business Analyst / Project Lead'
    Add-ApprovalBlock $doc $selection 'Reviewer' 'Printing Manager / Operations Representative'
    Add-ApprovalBlock $doc $selection 'Reviewer' 'PLPI System / IT Representative'
    Add-ApprovalBlock $doc $selection 'Approver' 'QA / RP Representative'
    Add-ApprovalBlock $doc $selection 'Approver' 'Head of PLPI / QP Representative'

    Add-PageBreak $selection
    Add-Paragraph $selection 'Table of Contents' 'Normal' $wdAlignLeft $true 11
    $tocRange = $selection.Range
    [void]$doc.TablesOfContents.Add($tocRange, $true, 1, 1)
    Move-End $selection

    Add-PageBreak $selection
    Add-Paragraph $selection '1. Introduction' 'Heading 1'
    Add-Paragraph $selection 'The PLPI Batch Record Automation project is a phased improvement programme intended to replace paper-dependent controls with controlled electronic workflow records while maintaining the purpose of existing GMP checks. This URS defines the business and user needs for the workflow beginning when an approved batch reaches B&S Batch Add and ending when leaflet folding is complete and the batch is available for Pre-Assembly.'
    Add-Paragraph $selection 'The future-state process will use PLPI work queues, approved master data, electronic BAR records, controlled printing actions, evidence capture, role-based sign-off, status gating and audit history. The requirements describe the required outcome and control intent; detailed screen behaviour, interfaces, calculations and technical design will be defined in the Functional Specification and Design Specification after URS approval.'

    Add-Paragraph $selection '2. Scope' 'Heading 1'
    Add-Paragraph $selection 'In scope are Stages 4 to 8 of the current PLPI process: B&S Batch Add and BAR generation; generated BAR verification and digital line clearance; the common Printer module; Label Printing; Leaflet Printing; Carton Issuing and Braille Printing where required by the approved route; and Leaflet Folding. The scope includes queue entry and exit controls, product/batch data display, document and artwork access, quantity control, test or master-copy review, evidence, comments/reasons, electronic sign-off, audit trail, exception/hold handling and downstream handoff.'
    Add-Paragraph $selection 'The upstream Goods-In, RP/RPi and Batch Checker processes are outside this URS except for the controlled entry condition into B&S Batch Add. Pre-Assembly, Production Control, assembly-room operations, Post-Assembly QC, Pre-QP and QP Approval are outside this URS except for the controlled handoff from Leaflet Folding. Final technical architecture, database design, interface protocols, printer/device configuration and detailed report layouts will be addressed in the FS and DS.'

    Add-Paragraph $selection '3. Abbreviations' 'Heading 1'
    [void](Add-Table $doc $selection @(
        @('Term', 'Definition'),
        @('BAR', 'Batch Assembly Record'),
        @('B&S Batch', 'The controlled B&S batch identifier used in PLPI'),
        @('ECMA', 'Approved packaging/artwork reference used to identify the applicable component'),
        @('GMP', 'Good Manufacturing Practice'),
        @('PCL', 'Product Check Log'),
        @('PLPI', 'The PLPI business application and associated controlled workflow'),
        @('QP', 'Qualified Person'),
        @('RP / RPi', 'Responsible Person / Responsible Person import'),
        @('RRF', 'Regulatory Request Form or approved discrepancy route'),
        @('URS', 'User Requirement Specification')
    ) @(100, 389) $true 11 -22)

    Add-Paragraph $selection '4. User Requirements Specification' 'Heading 1'
    Add-Paragraph $selection 'The following user requirements define the required business outcome and control intent for the in-scope PLPI workflow. Each clause is written to support traceability into the FS, DS and verification testing.'
    Add-Paragraph $selection '' 'Normal'
    Add-RequirementSection $doc $selection '4.1 B&S Batch Add and BAR Generation' 'These requirements define selection of eligible batch records, controlled combination and generation of the electronic BAR.' $requirements41
    Add-RequirementSection $doc $selection '4.2 Generated BAR Verification, Line Clearance and Handoff' 'These requirements define the mandatory verification and sign-off controls that release a generated BAR to printing.' $requirements42
    Add-RequirementSection $doc $selection '4.3 Common Printer Module and Queue Control' 'These requirements apply across the printing workspaces and establish consistent queue, access, status and document controls.' $requirements43
    Add-RequirementSection $doc $selection '4.4 Label Printing' 'These requirements define route-based label requirements, controlled print completion, evidence and the handoff to leaflet printing.' $requirements44
    Add-RequirementSection $doc $selection '4.5 Leaflet Printing' 'These requirements define leaflet master/test review, print quantity control, evidence and route-based handoff.' $requirements45
    Add-RequirementSection $doc $selection '4.6 Carton Issuing and Braille Printing' 'These requirements define the route-specific preparation activities available within the shared Printer module.' $requirements46
    Add-RequirementSection $doc $selection '4.7 Leaflet Folding' 'These requirements define the folding queue, batch and leaflet verification, controlled completion and handoff to Pre-Assembly.' $requirements47
    Add-RequirementSection $doc $selection '4.8 Audit Trail, Data Integrity, Exceptions and Workflow Control' 'These requirements apply across all in-scope modules and define the minimum controls for reliable electronic records and exception handling.' $requirements48

    Add-Paragraph $selection '5. User Access' 'Heading 1'
    Add-Paragraph $selection 'Access shall be role based and approved before use. B&S Batch Add users shall select eligible source records, generate the BAR, complete the required checks and sign off the release to printing. Printing users shall access only the printing options and batches appropriate to their responsibilities. Leaflet Folding users shall complete only the folding activities assigned to their role. QA/RP, Operations and authorised support users shall have review, exception, reporting or administration access consistent with approved responsibilities.'
    Add-Paragraph $selection 'The system shall uniquely identify each user, prevent shared-user attribution, apply appropriate password/session controls and restrict administration, master-data maintenance, correction, reprint and exception-release actions to authorised roles. Access changes and privileged actions shall be auditable.'

    Add-Paragraph $selection '6. Testing' 'Heading 1'
    Add-Paragraph $selection 'The PLPI system owner shall coordinate risk-based verification with IT, QA and Operations. Testing shall trace to every approved URS clause and shall include positive, negative, boundary and role-access scenarios. Testing shall confirm queue eligibility; searches and status filters; valid and invalid record combination; BAR generation and duplicate prevention; data display; line-clearance gating; common Printer routing; route-specific label, leaflet, carton and braille requirements; test/master controls; partial and extra quantities; required reasons and evidence; electronic sign-off; stage removal and handoff; audit history; holds, corrections and reprints; technical-failure behaviour; record locking; and Leaflet Folding completion.'
    Add-Paragraph $selection 'Regression testing shall demonstrate that upstream Batch Checker handoff and downstream Pre-Assembly receipt continue to operate as approved and that unchanged PLPI functions are not adversely affected. User acceptance testing shall be completed by representative operational and quality users before release.'

    Add-Paragraph $selection '7. Documents' 'Heading 1'
    Add-Paragraph $selection 'Applicable SOPs, work instructions, forms, training material, validation records and controlled project documents shall be created or updated to describe B&S Batch Add, BAR verification, digital line clearance, printing queues, test/master review, quantity and evidence controls, carton/braille route handling, Leaflet Folding, exception management, reprints, record review and electronic sign-off. Superseded paper steps shall be retired only through the approved change-control and document-control process.'

    Add-Paragraph $selection '8. Support' 'Heading 1'
    Add-Paragraph $selection 'IT shall provide controlled support for PLPI configuration, user access, printer/device connectivity, document and artwork links, workflow queues, audit records, backup/recovery and incident resolution. Operational and QA/RP stakeholders shall own process use, master-data accuracy, controlled exception decisions and periodic review of the workflow. Support activities that change regulated configuration or records shall follow approved change and incident procedures.'

    Add-Paragraph $selection '9. Revision History' 'Heading 1'
    $revisionTable = Add-Table $doc $selection @(
        @('Version', 'Previous version', 'Reason for revision', 'Issued'),
        @('1', 'N/A', 'First version prepared for the current PLPI BAR automation scope covering B&S Batch Add, Printing modules and Leaflet Folding.', 'Draft - Aug 2026')
    ) @(58, 64, 310, 70) $false 11 -10
    $revisionTable.Rows.Item(1).Range.Bold = -1
    $revisionTable.Rows.Item(1).Range.Font.Color = $wdColorDarkBlue

    $doc.TablesOfContents.Item(1).Update()
    $doc.Fields.Update() | Out-Null
    $doc.Repaginate()
    $doc.Save()
    "Updated $output with $($doc.ComputeStatistics(2)) pages."
}
finally {
    if ($doc) { $doc.Close($true) }
    if ($word) { $word.Quit() }
    if ($doc) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) }
    if ($word) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}



