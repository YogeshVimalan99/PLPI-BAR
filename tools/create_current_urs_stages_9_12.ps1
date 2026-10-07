$ErrorActionPreference = 'Stop'

$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$reference = Join-Path $root 'Reference Doc (Templates)\URS Addendum 1 of PLPI Software - VMP-A5-0007-01-v22   14-Oct 2024...docx'
$outputDir = Join-Path $root 'Phase 3 Doc'
$output = Join-Path $outputDir 'URS-PLPI BAR - Pre-Assembly Production Control Assembly and Post-Assembly QC.docx'
if (-not (Test-Path -LiteralPath $outputDir)) { [void](New-Item -ItemType Directory -Path $outputDir) }
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
    @('4.1.1', 'The system shall provide controlled work queues for Pre-Assembly QC, Production Control / Room Allocation, Assembly Room and Post-Assembly QC.'),
    @('4.1.2', 'Each work queue shall contain only batches that have completed the mandatory handoff from the preceding approved workflow stage.'),
    @('4.1.3', 'Authorised users shall be able to search or filter work by B&S batch number and manufacturing lot number and shall be able to distinguish active, held and completed records.'),
    @('4.1.4', 'Queue and task views shall display sufficient information to identify the correct batch, including product identity, strength, pack size, B&S batch number, manufacturing lot number, expiry date, quantity, route/status and current location or allocated room where applicable.'),
    @('4.1.5', 'Opening a task shall provide access to the approved electronic BAR and the applicable supporting records needed for the current-stage checks.'),
    @('4.1.6', 'The system shall preserve the controlled sequence from Stage 9 through Stage 12 and shall prevent a later stage from completing before all mandatory preceding-stage requirements are satisfied.'),
    @('4.1.7', 'Successful stage completion shall remove the batch from the active queue for that stage and place it in the correct next-stage queue without losing the completed history.'),
    @('4.1.8', 'The system shall show the current stage, completion status and any blocking exception to authorised operational and quality users.'),
    @('4.1.9', 'A batch placed on hold shall remain identifiable and shall not progress until the issue is resolved through an authorised process.'),
    @('4.1.10', 'The electronic BAR shall present the completed records from Stages 9 to 12 as one traceable batch history for downstream Pre-QP and QP review.')
)

$requirements42 = @(
    @('4.2.1', 'The Pre-Assembly QC queue shall contain only batches for which the required printing, route-specific preparation and Leaflet Folding activities are complete.'),
    @('4.2.2', 'The Pre-Assembly QC user shall be able to scan, enter, search for or select the intended B&S batch and confirm that it is active before commencing checks.'),
    @('4.2.3', 'The system shall require Pre-Assembly line clearance confirmation before the batch can be signed off.'),
    @('4.2.4', 'The workflow shall present the approved product, batch, PCL, label, leaflet, braille/carton and mock-up information applicable to the route for comparison.'),
    @('4.2.5', 'The user shall confirm that all required label types are present and agree with the BAR and approved references, including first/last and blister, flip or plate labels where applicable.'),
    @('4.2.6', 'The user shall confirm the product sample against the BAR and PCL, including product name, B&S batch number, manufacturing lot number, pack size, ECMA/reference, licence or PL number and expiry date where applicable.'),
    @('4.2.7', 'The user shall confirm the printed or folded leaflet against the applicable reference, including leaflet identity, reference, licence or PL number, address and required symbols or marks where applicable.'),
    @('4.2.8', 'The user shall confirm braille and carton details where those components are required by the approved route.'),
    @('4.2.9', 'The system shall make the matching approved mock-up available for viewing or controlled printing to support preparation of the assembly reference sample.'),
    @('4.2.10', 'The workflow shall require the number of specimens, number of leaflet folds and tamper seals per pack to be recorded where applicable.'),
    @('4.2.11', 'The workflow shall allow blank-label, butter-paper, mark or other approved sample-preparation quantities and comments to be recorded where applicable, and shall require a reason when an approved reference value is changed.'),
    @('4.2.12', 'The system shall require confirmation that the assembly reference sample has been prepared using the applicable mock-up and required components.'),
    @('4.2.13', 'Pre-Assembly QC completion shall be blocked while any mandatory material check, quantity, reference comparison or sample-preparation confirmation is incomplete or mismatched.'),
    @('4.2.14', 'Pre-Assembly QC sign-off shall capture the authenticated user, role and date/time and shall route the completed batch, BAR pack, reference sample and components to Production Control / Room Allocation.'),
    @('4.2.15', 'Where a batch is subject to an approved separate-storage requirement, including third-party processing where applicable, the system shall retain the applicable status or location information for downstream users.')
)

$requirements43 = @(
    @('4.3.1', 'The Production Control queue shall contain only batches with completed Pre-Assembly QC status.'),
    @('4.3.2', 'The Production Controller shall be able to open the intended batch and review the BAR, prepared sample, box/component information and Pre-Assembly QC completion record.'),
    @('4.3.3', 'The workflow shall require a random sample from the received batch to be checked against the BAR and approved reference sample before room allocation.'),
    @('4.3.4', 'The random sample check shall confirm product name, strength, pack size, manufacturing lot number, expiry date, quantity and label/reference details where applicable.'),
    @('4.3.5', 'The system shall require confirmation of the number of boxes received and checked.'),
    @('4.3.6', 'The Production Controller shall select or record an available assembly room and the planned allocation before sign-off.'),
    @('4.3.7', 'Production Control completion shall be blocked if the sample, stock, BAR, box quantity or reference details do not match or if the selected room is unavailable.'),
    @('4.3.8', 'Completion of the Production Control / Process 7 activity shall capture the authenticated user, role, allocated room, box count and date/time.'),
    @('4.3.9', 'Following successful completion, the allocated room and batch shall be visible to authorised Assembly Room users and the batch shall be removed from the active Production Control queue.'),
    @('4.3.10', 'The allocation history shall retain any cancellation, change or reallocation, including the previous and new room, reason, user and date/time.')
)

$requirements44 = @(
    @('4.4.1', 'The Assembly Room queue shall show active batches allocated to the selected room and shall provide a separate view of completed batches.'),
    @('4.4.2', 'The Assembly Room user shall be able to search the queue by B&S batch number, manufacturing lot number or product identity and refresh the current queue.'),
    @('4.4.3', 'Starting a batch shall require explicit confirmation and shall record the authenticated user, allocated room and batch start date/time.'),
    @('4.4.4', 'The system shall prevent a batch from starting in a room other than its current authorised allocation unless a controlled reallocation has been completed.'),
    @('4.4.5', 'The workflow shall require initial confirmation of line clearance and of the correct labels, leaflets, packaging components, BAR, reference sample and mock-up before assembly begins.'),
    @('4.4.6', 'The workflow shall require the assembly-team briefing to be confirmed and shall record the briefing user and date/time.'),
    @('4.4.7', 'The system shall support operator check-in and check-out for the applicable assembly room and shall retain user, action, room and date/time.'),
    @('4.4.8', 'The system shall organise Assembly Room completion into the controlled pages Initial Checks, Random Sample Check, IPC Checks and Reconciliation & Closure.'),
    @('4.4.9', 'Each page shall remain incomplete until all mandatory checks and entries on that page are complete.'),
    @('4.4.10', 'Page sign-off shall capture the authenticated user and date/time, lock the signed page from ordinary amendment and show its completed state.'),
    @('4.4.11', 'The system shall retain the current task and completed-page status so an authorised user can safely resume after an interruption or session restart.'),
    @('4.4.12', 'The workflow shall not permit final batch completion until all four controlled Assembly Room pages have been signed.')
)

$requirements45 = @(
    @('4.5.1', 'The Random Sample Check page shall create or display the checks required for the number of boxes received from Production Control.'),
    @('4.5.2', 'For each applicable box, the Assembly Room user shall confirm the manufacturing lot number and expiry date against the BAR and received stock before signing the page.'),
    @('4.5.3', 'A sample or component mismatch shall block the affected page and assembly activity until the issue is resolved through the approved exception process.'),
    @('4.5.4', 'The IPC workflow shall derive or present the minimum in-process checks required for the batch and shall show the planned or due check times.'),
    @('4.5.5', 'The system shall support the approved timing of IPC checks during assembly and shall allow additional IPC checks to be added where operationally required.'),
    @('4.5.6', 'Each IPC check shall be attributable to the batch, sequence or scheduled time, completing user and completion date/time.'),
    @('4.5.7', 'The user shall compare a completed pack or box with the approved reference sample or mock-up and confirm component placement, label position, leaflet and finished-pack presentation.'),
    @('4.5.8', 'The system shall allow photo evidence to be attached to the relevant IPC check and shall retain the evidence reference with the electronic BAR.'),
    @('4.5.9', 'The IPC page shall not be signed until all displayed mandatory IPC checks and required evidence are complete.'),
    @('4.5.10', 'A failed IPC check shall stop or hold the affected activity and shall require a recorded issue, disposition and authorised resolution before work resumes.'),
    @('4.5.11', 'Completed IPC records and evidence shall be available to Post-Assembly QC, Pre-QP and QP review users according to access permissions.')
)

$requirements46 = @(
    @('4.6.1', 'The Reconciliation & Closure page shall identify each applicable material or component and provide the approved or issued quantity needed for reconciliation.'),
    @('4.6.2', 'The user shall record quantities received, used, damaged, discrepant, surplus or leftover and extra components where applicable.'),
    @('4.6.3', 'The system shall calculate or present the expected balance, actual balance, discrepancy and yield needed to assess completion.'),
    @('4.6.4', 'A non-zero discrepancy or out-of-tolerance yield shall require a reason and shall prevent final completion until it is resolved or dispositioned by an authorised role.'),
    @('4.6.5', 'Damage, surplus, leftover and extra-component records shall support comments and evidence where required by the approved process.'),
    @('4.6.6', 'The workflow shall require end-of-batch room clearance and confirmation that remaining materials have been removed or dispositioned before closure.'),
    @('4.6.7', 'The system shall allow a running batch to be placed on a controlled break and resumed, retaining the user and date/time of each action.'),
    @('4.6.8', 'The system shall support a controlled partial finish by recording the quantity completed and shall allow the remaining quantity to be resumed without losing the earlier history.'),
    @('4.6.9', 'The system shall prevent an invalid partial quantity, a partial quantity greater than the batch quantity or an unexplained difference between completed and reconciled quantities.'),
    @('4.6.10', 'Final Assembly Room completion shall capture the finish user and date/time and shall create a read-only lifecycle summary of page sign-offs, breaks, partial finishes, reconciliation and comments.'),
    @('4.6.11', 'After successful completion, the assembled batch and completed electronic BAR shall be routed to Post-Assembly QC and removed from the active Assembly Room queue.'),
    @('4.6.12', 'Completed Assembly Room records shall remain searchable and viewable by authorised users without allowing ordinary users to alter the signed record.')
)

$requirements47 = @(
    @('4.7.1', 'The Post-Assembly QC queue shall contain only batches with completed Assembly Room checks, IPC records and reconciliation.'),
    @('4.7.2', 'The Post-Assembly QC user shall be able to search or select the intended B&S batch and view its product, manufacturing lot, expiry, assembled quantity, BAR, mock-up and Assembly Room completion history.'),
    @('4.7.3', 'The workflow shall require confirmation of batch segregation and line clearance before Post-Assembly QC sign-off.'),
    @('4.7.4', 'The system shall present or require the approved number of sample packs to be checked based on the batch size or applicable sampling rule.'),
    @('4.7.5', 'The selected sample packs shall be compared with the approved mock-up and checked for product identity, strength, pack size, ECMA/reference, licence or PL number, B&S batch number, manufacturing lot number, expiry date, label placement and finished-pack presentation where applicable.'),
    @('4.7.6', 'The workflow shall require the full assembled quantity and total number of boxes to be recorded and verified.'),
    @('4.7.7', 'Where there is more than one box, the system shall require the exact quantity in each box and shall confirm that the sum equals the declared total quantity.'),
    @('4.7.8', 'The system shall block sign-off and quarantine-label printing when the total quantity, number of boxes, per-box allocation or mandatory sample checks are incomplete or inconsistent.'),
    @('4.7.9', 'The system shall generate quarantine labels using the confirmed batch, box and quantity information and shall retain the print user and date/time.'),
    @('4.7.10', 'The number of quarantine labels generated shall correspond to the confirmed number of boxes or approved label requirement.'),
    @('4.7.11', 'Incorrect or unusable quarantine labels shall be voided through a controlled process and any reprint shall retain the reason, user and date/time.'),
    @('4.7.12', 'Post-Assembly QC sign-off shall capture the authenticated user, role, completed sample checks, quantity and box details, comments and date/time.'),
    @('4.7.13', 'Following successful sign-off and quarantine-labelling confirmation, the system shall update the stock status to quarantine, remove the batch from the active Post-Assembly QC queue and make it available to Pre-QP.'),
    @('4.7.14', 'A pack, quantity, box-count, mock-up or quarantine-label mismatch shall place the activity on hold and prevent movement to Pre-QP until resolved.')
)

$requirements48 = @(
    @('4.8.1', 'The system shall maintain a chronological audit trail for queue entry, task opening, checks, data entry, evidence, sign-off, hold, correction, allocation, start, break, resume, partial finish, reconciliation, label printing, completion and handoff.'),
    @('4.8.2', 'Audit records shall include the affected B&S batch, stage, action, authenticated user, role, date/time, previous and new status where applicable, quantity, reason/comment and evidence reference.'),
    @('4.8.3', 'Electronic records and linked evidence shall be attributable, legible, contemporaneous, original or verified copies, accurate, complete, consistent, enduring and available for the approved retention period.'),
    @('4.8.4', 'Completed and signed records shall be read-only to ordinary users; corrections shall preserve the original value, revised value, reason, correcting user and date/time.'),
    @('4.8.5', 'The system shall prevent deletion, silent overwriting or backdating of completed records and linked evidence.'),
    @('4.8.6', 'Electronic sign-off shall require the current authenticated user to confirm the controlled action and shall not permit one user to sign on behalf of another.'),
    @('4.8.7', 'Role-based access shall restrict stage completion, exception resolution, record correction, room reallocation, label reprint and administration to authorised users.'),
    @('4.8.8', 'The system shall provide clear validation and failure messages and shall not record a successful completion when a save, upload, print, scan or other required action fails.'),
    @('4.8.9', 'A mismatch, missing record, failed check, overdue IPC, non-zero reconciliation discrepancy, incorrect quantity or failed label output shall block the applicable workflow gate.'),
    @('4.8.10', 'The system shall allow an authorised user to record an exception or hold with the affected item, reason, evidence and responsible function.'),
    @('4.8.11', 'Resolution of an exception shall retain the decision, responsible user, date/time and any repeated checks required because an earlier completion was affected.'),
    @('4.8.12', 'System time, user identity, session security, backup, recovery and record retention shall be controlled in accordance with approved PLPI and IT procedures.'),
    @('4.8.13', 'The system shall recover safely from interruption and shall not duplicate completion, sign-off, evidence or print records when an action is retried.'),
    @('4.8.14', 'Authorised review users shall be able to view or produce the complete Stage 9 to Stage 12 batch history and its linked evidence for operational, quality, investigation and audit purposes.'),
    @('4.8.15', 'The system shall retain unchanged upstream records and downstream access required for end-to-end traceability without permitting an in-scope user to alter an approved preceding-stage record.')
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

    $logoPath = Join-Path $root '.tmp_urs_current\reference-media\image2.png'
    foreach ($headerIndex in @(1, 3)) {
        $header = $section.Headers.Item($headerIndex)
        $header.Range.Text = ''
        $headerTable = $header.Range.Tables.Add($header.Range, 1, 2)
        $headerTable.AllowAutoFit = $false
        $headerTable.Borders.Enable = $false
        $headerTable.Columns.Item(1).PreferredWidth = 350
        $headerTable.Columns.Item(2).PreferredWidth = 140
        $headerTable.TopPadding = 0
        $headerTable.BottomPadding = 5
        $headerLeft = $headerTable.Cell(1, 1).Range
        $headerLeft.End = $headerLeft.End - 1
        $headerLeft.Text = "B&S Healthcare`rUser Requirement Specification -`rPLPI Assembly Control Software`rPre-Assembly to Post-Assembly QC"
        Set-Font $headerLeft 'Verdana' 11 $true
        $headerLeft.Font.Color = $wdColorDarkBlue
        $headerLeft.ParagraphFormat.SpaceAfter = 0
        $headerLeft.ParagraphFormat.LineSpacing = 13.8
        $headerLeft.Paragraphs.Item(1).Range.Font.Italic = -1
        $headerLogoCell = $headerTable.Cell(1, 2).Range
        $headerLogoCell.End = $headerLogoCell.End - 1
        $headerLogoCell.ParagraphFormat.Alignment = $wdAlignRight
        $headerLogo = $headerLogoCell.InlineShapes.AddPicture($logoPath, $false, $true)
        $headerLogo.LockAspectRatio = -1
        $headerLogo.Width = 130
        $headerTable.Borders.Item(-3).LineStyle = $wdLineStyleSingle
        $headerTable.Borders.Item(-3).Color = $wdColorNavy
        $headerTable.Borders.Item(-3).LineWidth = 18
    }

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
    for ($i = 0; $i -lt 3; $i++) { Add-Paragraph $selection '' 'Normal' $wdAlignCenter }
    Add-Paragraph $selection 'User Requirement Specification' 'Normal' $wdAlignCenter $true 12
    Add-Paragraph $selection 'Of' 'Normal' $wdAlignCenter $true 12
    Add-Paragraph $selection 'PLPI Batch Record Automation' 'Normal' $wdAlignCenter $true 12
    Add-Paragraph $selection 'Pre-Assembly, Production Control, Assembly and Post-Assembly QC' 'Normal' $wdAlignCenter $true 12
    Add-Paragraph $selection 'Stages 9 to 12' 'Normal' $wdAlignCenter $true 11
    Add-Paragraph $selection '' 'Normal' $wdAlignCenter

    Add-ApprovalBlock $doc $selection 'Author' 'Business Analyst / Project Lead'
    Add-ApprovalBlock $doc $selection 'Reviewer' 'Pre-Assembly QC / Production Checking Representative'
    Add-ApprovalBlock $doc $selection 'Reviewer' 'Production Control / Assembly Operations Representative'
    Add-ApprovalBlock $doc $selection 'Reviewer' 'PLPI System / IT Representative'
    Add-ApprovalBlock $doc $selection 'Approver' 'QA / QP Representative'

    Add-PageBreak $selection
    Add-Paragraph $selection 'Table of Contents' 'Normal' $wdAlignLeft $true 11
    $tocRange = $selection.Range
    [void]$doc.TablesOfContents.Add($tocRange, $true, 1, 1)
    Move-End $selection

    Add-PageBreak $selection
    Add-Paragraph $selection '1. Introduction' 'Heading 1'
    Add-Paragraph $selection 'The PLPI Batch Record Automation project is a phased improvement programme intended to replace paper-dependent controls with controlled electronic workflow records while maintaining the purpose of existing GMP checks. This URS defines the business and user needs from receipt of a leaflet-folding-complete batch at Pre-Assembly QC through Post-Assembly QC completion and quarantine handoff to Pre-QP.'
    Add-Paragraph $selection 'The future-state process will use PLPI work queues, approved batch and component data, the electronic BAR, controlled checks, evidence capture, electronic sign-off, workflow gating and audit history. These requirements define the required outcome and control intent. Detailed screen behaviour, calculations, interfaces, devices and technical design will be specified in the FS and DS after URS approval.'

    Add-Paragraph $selection '2. Scope' 'Heading 1'
    Add-Paragraph $selection 'In scope are Stages 9 to 12 of the PLPI workflow: Pre-Assembly QC; Production Control / Room Allocation; Assembly Room Operations, including initial checks, random sample checks, IPC, breaks/partial completion, reconciliation and closure; and Post-Assembly QC, including sample verification, full quantity and box allocation, quarantine-label printing and handoff to Pre-QP. The scope includes queue entry and exit controls, batch and reference data, electronic BAR records, evidence, electronic sign-off, audit trail, exception/hold handling, record locking and controlled downstream handoff.'
    Add-Paragraph $selection 'Stages 1 to 8 are outside this URS except for the controlled Leaflet Folding handoff into Pre-Assembly QC. Pre-QP and QP Approval are outside this URS except for receipt of a completed quarantined batch and the need to review the Stage 9 to Stage 12 electronic record. Final architecture, database design, interface protocols, device configuration, sampling-rule configuration and detailed report or label layouts will be addressed in the FS and DS.'

    Add-Paragraph $selection '3. Abbreviations' 'Heading 1'
    [void](Add-Table $doc $selection @(
        @('Term', 'Definition'),
        @('BAR', 'Batch Assembly Record'),
        @('B&S Batch', 'The controlled B&S batch identifier used in PLPI'),
        @('ECMA', 'Approved packaging or artwork reference used to identify the applicable component'),
        @('GMP', 'Good Manufacturing Practice'),
        @('IPC', 'In-Process Control'),
        @('PCL', 'Product Check Log'),
        @('PLPI', 'The PLPI business application and associated controlled workflow'),
        @('QC', 'Quality Control'),
        @('QP', 'Qualified Person'),
        @('URS', 'User Requirement Specification')
    ) @(100, 389) $true 11 -22)

    Add-Paragraph $selection '4. User Requirements Specification' 'Heading 1'
    Add-Paragraph $selection 'The following requirements define the business outcome and control intent for the in-scope PLPI workflow. Each requirement is uniquely numbered and written to support traceability into the FS, DS and verification testing.'
    Add-Paragraph $selection '' 'Normal'
    Add-RequirementSection $doc $selection '4.1 Common Workflow, Queue and Handoff Requirements' 'These requirements define the common controls that preserve the sequence, identity and traceability of batches across Stages 9 to 12.' $requirements41
    Add-RequirementSection $doc $selection '4.2 Stage 9 - Pre-Assembly QC' 'These requirements define the controlled checks and reference-sample preparation needed before Production Control allocation.' $requirements42
    Add-RequirementSection $doc $selection '4.3 Stage 10 - Production Control / Room Allocation' 'These requirements define random-sample verification, box confirmation and controlled assembly-room allocation.' $requirements43
    Add-RequirementSection $doc $selection '4.4 Stage 11 - Assembly Start, Initial Checks and Page Control' 'These requirements define the controlled start of assembly, operator context, pre-start verification and four-page completion model.' $requirements44
    Add-RequirementSection $doc $selection '4.5 Stage 11 - Random Sample and IPC Checks' 'These requirements define box-level sample checks, time-based IPC, evidence and failed-check controls.' $requirements45
    Add-RequirementSection $doc $selection '4.6 Stage 11 - Reconciliation, Interruptions and Closure' 'These requirements define component reconciliation, controlled breaks and partial finishes, end clearance and the handoff to Post-Assembly QC.' $requirements46
    Add-RequirementSection $doc $selection '4.7 Stage 12 - Post-Assembly QC and Quarantine Handoff' 'These requirements define post-assembly sample and quantity verification, quarantine-label control and release to the Pre-QP queue.' $requirements47
    Add-RequirementSection $doc $selection '4.8 Audit Trail, Data Integrity, Exceptions and Security' 'These requirements apply across all in-scope modules and define the minimum controls for reliable electronic records, access and exception handling.' $requirements48

    Add-Paragraph $selection '5. User Access' 'Heading 1'
    Add-Paragraph $selection 'Access shall be role based and approved before use. Pre-Assembly QC users shall complete the Stage 9 checks and reference-sample record. Production Controllers shall perform the Stage 10 random-sample check and allocate rooms. Assembly Room users shall access only batches allocated to their room and complete the controlled Assembly pages. Post-Assembly QC users shall perform Stage 12 verification, quarantine-label actions and handoff. QA/QP, Operations and authorised support users shall have review, exception, reporting or administration access consistent with approved responsibilities.'
    Add-Paragraph $selection 'The system shall uniquely identify each user, prevent shared-user attribution, apply appropriate authentication and session controls and restrict administration, record correction, room reallocation, exception disposition and quarantine-label reprint to authorised roles. Access changes and privileged actions shall be auditable.'

    Add-Paragraph $selection '6. Testing' 'Heading 1'
    Add-Paragraph $selection 'The PLPI system owner shall coordinate risk-based verification with IT, QA and Operations. Testing shall trace to every approved URS requirement and shall include positive, negative, boundary and role-access scenarios. Testing shall confirm entry criteria; queue search and status; batch identity; Pre-Assembly component, leaflet, sample and mock-up checks; recorded quantities and change reasons; Production Control sample checks and room allocation; Assembly start, attendance, page gating, locking and safe resume; box-level sample checks; IPC scheduling, extra rows, evidence and failed checks; break and partial-finish behavior; component reconciliation, discrepancy and yield controls; Post-Assembly sampling, full quantity and per-box allocation; quarantine-label generation, void and reprint; stage removal and handoff; exception controls; audit trail; record locking; and technical-failure behavior.'
    Add-Paragraph $selection 'Regression testing shall demonstrate that the approved Stage 8 Leaflet Folding handoff and Stage 13 Pre-QP receipt continue to operate as intended and that unchanged PLPI functions are not adversely affected. User acceptance testing shall be completed by representative Pre-Assembly QC, Production Control, Assembly, Post-Assembly QC, QA/QP and support users before release.'

    Add-Paragraph $selection '7. Documents and Training' 'Heading 1'
    Add-Paragraph $selection 'Applicable SOPs, work instructions, BAR forms, sampling instructions, training material, validation records and controlled project documents shall be created or updated to describe Pre-Assembly QC, room allocation, assembly start and attendance, sample and IPC checks, evidence, breaks and partial completion, reconciliation, Post-Assembly QC, quarantine-label handling, exceptions, corrections and electronic sign-off. Users shall complete role-appropriate training before access is granted. Superseded paper steps shall be retired only through approved change control and document control.'

    Add-Paragraph $selection '8. Support and Administration' 'Heading 1'
    Add-Paragraph $selection 'IT shall provide controlled support for PLPI configuration, user access, room and workflow configuration, scanners, cameras, printers, electronic BAR records, evidence, audit history, backup/recovery and incident resolution. Operational and QA/QP stakeholders shall own process use, master-data accuracy, sampling and reconciliation rules, controlled exception decisions and periodic review. Support activities that change regulated configuration or records shall follow approved change and incident procedures.'

    Add-Paragraph $selection '9. Revision History' 'Heading 1'
    $revisionTable = Add-Table $doc $selection @(
        @('Version', 'Previous version', 'Reason for revision', 'Issued'),
        @('1', 'N/A', 'First version prepared for the current PLPI BAR automation scope covering Pre-Assembly QC, Production Control / Room Allocation, Assembly Room Operations and Post-Assembly QC.', 'Draft - Aug 2026')
    ) @(58, 64, 310, 70) $false 11 -10
    $revisionTable.Rows.Item(1).Range.Bold = -1
    $revisionTable.Rows.Item(1).Range.Font.Color = $wdColorDarkBlue

    $doc.TablesOfContents.Item(1).Update()
    $doc.Fields.Update() | Out-Null
    $doc.Repaginate()
    $doc.Save()
    Write-Output "Created $output with $($doc.ComputeStatistics(2)) pages."
}
finally {
    if ($doc) { $doc.Close($true) }
    if ($word) { $word.Quit() }
    if ($doc) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) }
    if ($word) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
