$ErrorActionPreference = 'Stop'

$source = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\Phase 3 Doc\DS-PLPI BAR - Pre-Assembly Production Controller Handheld Assembly and Post-Assembly QC.docx'
$work = 'C:\tmp\phase3-ds-rebuild.docx'
Copy-Item -LiteralPath $source -Destination $work -Force

function Find-Paragraph($document, [string]$text, [int]$start = 0) {
    $range = $document.Range($start, $document.Content.End)
    $find = $range.Find
    $find.ClearFormatting()
    $find.Text = $text
    $find.Forward = $true
    $find.Wrap = 0
    $find.MatchWildcards = $false
    if (-not $find.Execute()) { throw "Paragraph not found: $text" }
    return $range.Paragraphs.Item(1)
}

function Next-Paragraph($document, $paragraph) {
    return $document.Range($paragraph.Range.End, $document.Content.End).Paragraphs.Item(1)
}

function Set-ParagraphText($paragraph, [string]$text) {
    $range = $paragraph.Range.Duplicate
    $range.End--
    $range.Text = $text
}

function Format-Normal($document, $paragraph) {
    $paragraph.Range.Style = $document.Styles.Item('Normal')
    $paragraph.Range.Font.Name = 'Verdana'
    $paragraph.Range.Font.Size = 11
    $paragraph.Range.Font.Bold = 0
    $paragraph.Range.Font.Color = 0
    $paragraph.Range.ParagraphFormat.SpaceBefore = 0
    $paragraph.Range.ParagraphFormat.SpaceAfter = 0
}

function Insert-BlockBefore($document, $beforeParagraph, $items) {
    $position = $beforeParagraph.Range.Start
    $block = ($items -join "`r") + "`r"
    $insertAt = $document.Range($position, $position)
    $insertAt.InsertBefore($block)
    $formatted = $document.Range($position, $position + $block.Length)
    $formatted.Style = $document.Styles.Item('Normal')
    $formatted.Font.Name = 'Verdana'
    $formatted.Font.Size = 11
    $formatted.Font.Bold = 0
    $formatted.Font.Color = 0
    $formatted.ParagraphFormat.SpaceBefore = 0
    $formatted.ParagraphFormat.SpaceAfter = 0
}

function Set-CellText($table, [int]$row, [int]$column, [string]$text) {
    $range = $table.Cell($row, $column).Range
    $range.End--
    $range.Text = $text
}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $document = $word.Documents.Open($work, $false, $false)

    # Correct and extend the abbreviation table while retaining the existing template formatting.
    $abbreviations = $document.Tables.Item(5)
    while ($abbreviations.Rows.Count -lt 16) { [void]$abbreviations.Rows.Add() }
    while ($abbreviations.Rows.Count -gt 16) { $abbreviations.Rows.Item($abbreviations.Rows.Count).Delete() }
    $rows = @(
        @('Abbreviation', 'Definition'),
        @('IT', 'Information Technology'),
        @('URS', 'User Requirement Specification'),
        @('DS', 'Design Specification'),
        @('FS', 'Functional Specification'),
        @('PLPI', 'Parallel Import / PLPI workflow system'),
        @('BAR', 'Batch Assembly Record'),
        @('PCL', 'Product Check Log'),
        @('B&S', 'B&S Healthcare / controlled batch identifier'),
        @('GMP', 'Good Manufacturing Practice'),
        @('IPC', 'In-Process Check'),
        @('MFG', 'Manufacturer / Manufacturing'),
        @('QA / QC', 'Quality Assurance / Quality Control'),
        @('QP', 'Qualified Person'),
        @('ECMA', 'Approved packaging or artwork reference'),
        @('IMP', 'Investigational Medicinal Product')
    )
    for ($i = 1; $i -le $rows.Count; $i++) {
        Set-CellText $abbreviations $i 1 $rows[$i - 1][0]
        Set-CellText $abbreviations $i 2 $rows[$i - 1][1]
    }
    $abbreviations.Range.Font.Name = 'Verdana'
    $abbreviations.Range.Font.Size = 11
    $abbreviations.Range.ParagraphFormat.SpaceBefore = 0
    $abbreviations.Range.ParagraphFormat.SpaceAfter = 0
    $abbreviations.Rows.Item(1).Range.Font.Bold = -1

    # Add implementation-level logical design beneath each existing wireframe section.
    $designStart = $document.Tables.Item(8).Range.End
    $section32 = Find-Paragraph $document '3.2 Production Controller Handheld / Room Allocation Module' $designStart
    $stage9Details = @(
        'Control and data design: Queue eligibility is calculated from completion of required printing, route-specific preparation and Leaflet Folding. Search filters only the eligible population and does not copy, amend or create batch data. Selection carries the controlled batch key into the Stage 9 record and every subsequent action revalidates that key and current status.',
        'Route and reference design: Product Information is populated read-only from the selected batch. Reboxing displays MARKS, conditional Reason, Cartons Per Pack and the applicable Change of Pack Size record. Relabelling displays Product Reference, Leaflet Reference and Braille Required. The printed-material checklist is generated from the approved route so a non-applicable component is not presented as a mandatory row.',
        'Verification-record design: Each material confirmation is stored against the selected batch and component reference. The Stage 9 record also retains Pre-Assembly Line Clearance, specimen count, leaflet-fold count, tamper-seal count, comments and any MARKS previous/new value and reason. Counts are non-negative whole numbers; a blank required count is not treated as zero.',
        'Mock-up and controlled-output design: Mockup and Print BAR open the current controlled versions for the selected batch. Opening or printing does not sign the record. Successful print activity is attributable; cancellation or print failure does not record a successful output event.',
        'Commit and status design: User Sign Off performs server-side or authoritative transaction validation of eligibility, material rows, Line Clearance, counts and route-specific amendments. A successful transaction records user, role and date/time, locks the Stage 9 record, removes it from Active and publishes one Production Control work item. Duplicate or stale sign-off is rejected.',
        'Validation and error handling: Missing checks, blank or invalid counts, a missing MARKS reason, incomplete route amendments, stale eligibility or a completed record keep User Sign Off unavailable or cause commit rejection with the unmet condition identified. Back, cancellation, print failure or interruption preserves only committed data and creates no completion. Entry condition: eligible Stage 8-complete batch. Exit condition: locked Stage 9 record available to Production Control. URS 4.1.1-4.1.12; FS 3.1.'
    )
    Insert-BlockBefore $document $section32 $stage9Details

    $section33 = Find-Paragraph $document '3.3 Assembly Room Module' $designStart
    $stage10Details = @(
        'Handheld state design: The Stage 10 user follows GOODS IN > STOCK TAKE OUT. Menu, detail, Box ID verification and Line Clearance are distinct screen states. Back or Power exits the uncommitted state; navigation does not infer completion from the currently displayed screen.',
        'Stock-selection design: Stock ID accepts scanner or manual entry. The selected stock key loads Product Name, Part No., Batch No., Goods In Boxes, Qty., Location, IMP and Contract read-only. TRANSFER is associated with that selected stock and shall revalidate that it remains eligible before opening Box ID verification.',
        'Box-verification design: CONFIRM requires a non-blank scanned or entered Box ID associated with the displayed stock. CANCEL closes the dialog without transfer completion. Successful confirmation creates a new blank Line Clearance form; the prior signed Line Clearance remains audit history and is never used to pre-tick a later transfer.',
        'Box-count amendment design: Goods In Boxes supplies the initial confirmed count. The entry accepts a positive whole number only. A changed value creates a pending old/new decision; CONFIRM accepts the revised value and CANCEL restores the last confirmed value. While the decision is pending, CONFIRMED BY remains disabled and no BAR value is changed.',
        'Line Clearance and room design: The two required confirmations are the product-name/expiry/lot-size check and the confirmed box-count check. Assign Assembly Room uses an approved configured room list. Displayed room choice is not committed until CONFIRMED BY succeeds.',
        'Commit and hand-off design: CONFIRMED BY revalidates Box ID, both checks, settled positive box count, selected room, stage eligibility and duplicate status. One successful transaction writes Stock ID, verified Box ID result, batch, product, previous/current box count where changed, room, check results, user and date/time to the BAR; displays BAR UPDATED; locks the form; and publishes the batch only to the assigned Assembly Room.',
        'Validation and error handling: Blank Box ID, invalid box count, unresolved count change, incomplete checks, missing room, stale batch or duplicate completion blocks commit and retains the current controlled stage. Back, Cancel, Power or recoverable interruption before CONFIRMED BY creates no Line Clearance or room allocation. Entry condition: locked Stage 9 completion. Exit condition: read-only Stage 10 Line Clearance and room allocation. URS 4.2.1-4.2.20; FS 3.2.'
    )
    Insert-BlockBefore $document $section33 $stage10Details

    $section34 = Find-Paragraph $document '3.4 Post-Assembly QC Module' $designStart
    $stage11Details = @(
        'Queue and access design: Active Batches contains only records allocated to the current authorised room; Completed Batches provides read-only lifecycle history. Search operates on B&S Batch, MFG lot or product identity. Refresh re-evaluates allocation and status. Check In and Check Out create separate room-attendance events with authenticated user, role, room and date/time.',
        'Batch lifecycle design: Opening an unstarted batch requires Start Batch confirmation. The start transaction records the allocated room, Started By and start date/time and creates the running state once. Break and Resume Batch record paired runtime events. Partial Finish requires a completed quantity between one and the total batch quantity, records remaining quantity and pauses the batch; Partial Start records the later resume. None of these runtime events signs a controlled page or completes the batch.',
        'Initial Checks design: Page 1 displays Lifecycle Audit and requires Team Briefing attribution plus confirmation that the BAR is available/correct, the correct specimen is available, the room is clean/ready, required printed components were received and all component boxes are accounted for. Mark Done is disabled until the briefing and every confirmation are complete. Successful page completion records user/date-time and locks Page 1.',
        'Random Sample design: Page 2 derives one row from each confirmed Stage 10 box. Each row retains Box No., MFG Lot No. and Expiry Date and records checked status, user and date/time. Page completion is blocked until every box row is confirmed; a later box-count correction requires the approved correction route and impact assessment rather than silent row deletion.',
        'IPC evidence design: Page 3 retains the required IPC check identity, sequence or time, completing user, date/time and photo evidence. Take Picture or file selection associates one clear image with the current batch/check. A failed IPC places the affected activity on hold and prevents page/final completion until an authorised resolution, reason and audit event exist.',
        'Reconciliation design: Page 4 provides one row per applicable material or component and records Received, Used, Damaged and Discrepant values. Total Used, Retention Sample, Yield and Total Damaged are calculated or entered according to the approved rule. Calculations are revalidated at page commit. Non-zero discrepancy or unacceptable yield requires reason and authorised resolution. End-of-Batch Clearance requires all four displayed confirmations.',
        'Page and final transaction design: Mark Done validates only the active page, creates one immutable page signature and leaves other pages editable until separately signed. Finish Batch is available only when Pages 1-4 are signed, no IPC hold is open, reconciliation is acceptable and room clearance is complete. The final transaction records finish user/date-time, locks the lifecycle summary, removes the batch from Active and publishes it to Post-Assembly QC.',
        'Recoverability and error handling: Committed start, attendance, runtime and page-signature events survive a recoverable interruption. Unsaved values remain uncommitted and shall not be represented as signed. A user cannot work a batch allocated to another room, overwrite a signed page, bypass a missing box sample, omit required IPC evidence or complete with unresolved reconciliation. Entry condition: confirmed Stage 10 room allocation. Exit condition: four locked pages and completed Stage 11 lifecycle. URS 4.3.1-4.3.4, 4.3.7-4.3.12, 4.3.15, 4.3.17-4.3.21 and 4.3.23-4.3.30; FS 3.3.'
    )
    Insert-BlockBefore $document $section34 $stage11Details

    $section35 = Find-Paragraph $document '3.5 Workflow Status, Corrections and Audit Behaviour' $designStart
    $stage12Details = @(
        'Sampling and quantity design: The selected Assembly-complete batch supplies product, batch, expiry, assembled quantity, current box context and completion status. The approved batch-size sampling rule supplies or validates No. of Packs Checked. Total Packs, Total Boxes and No. of Packs Checked accept positive whole numbers only and are revalidated when saved, printed or signed.',
        'Per-box allocation design: When Total Boxes is greater than one, Quantity in Each Box creates exactly one positive whole-number entry per box. Entered Total and Remaining are calculated immediately. Confirm Box Quantities is enabled only when every box is populated and the sum equals Total Packs. Cancel leaves the previous committed allocation unchanged.',
        'BAR comparison design: Pack Details Against BAR is generated from the applicable finished-pack route and retains product/strength, approved reference, MFG batch, B&S batch and expiry context. Every displayed row requires confirmation. A mismatch remains unresolved until the approved exception or correction route records its disposition.',
        'Quarantine-label design: Print Quarantine Label uses the committed batch, box and quantity data and creates the approved number of controlled labels. Test Print is a separate non-completing event. Successful controlled printing records output identity, quantity, user, date/time and status. Void or Reprint is restricted to an authorised role and requires a reason while preserving the original event.',
        'Completion and access design: User Sign Off revalidates sampling, positive quantities, exact box allocation, every BAR comparison row, absence of unresolved mismatch and acceptable controlled-label state. Success records Signed By, role, completed checks, confirmed quantities, comments and Signed At, locks Stage 12, changes the batch to quarantine status and publishes the record and evidence to authorised Pre-QP/QP review.',
        'Validation and error handling: An Assembly-incomplete batch cannot enter the queue. Invalid sample or quantity values, missing per-box entries, allocation mismatch, unchecked BAR rows, unresolved mismatch, failed print or stale completion prevents sign-off. A failed, cancelled, voided or reprinted output retains its own audit state and never masquerades as the original successful event. Entry condition: completed Stage 11. Exit condition: locked Stage 12 record in quarantine and available to Pre-QP. URS 4.4.1-4.4.3, 4.4.6, 4.4.8 and 4.4.10-4.4.17; FS 3.4.'
    )
    Insert-BlockBefore $document $section35 $stage12Details

    # Extend the common workflow design table to the same control depth as the reference DS.
    $workflow = $document.Tables.Item(9)
    while ($workflow.Rows.Count -lt 11) { [void]$workflow.Rows.Add() }
    $workflowRows = @(
        @('Design control', 'Required behaviour'),
        @('Queue eligibility', 'Revalidate preceding-stage completion, route, room allocation and authorised role before display and again before commit.'),
        @('Signature transaction', 'Revalidate all gates; prevent duplicate or stale completion; commit data, audit and lock state; and publish the next stage as one controlled outcome.'),
        @('Page completion', 'Create one immutable page-signature event without implying final stage completion; retain the remaining unsigned pages in their current controlled state.'),
        @('Hold / exception', 'Retain the affected stage and reason, identify the authorising role and prevent downstream hand-off until an approved resolution is committed.'),
        @('Correction', 'Use the approved amendment route with reason, previous/new value, user and date/time and never overwrite the original controlled event.'),
        @('Room reallocation', 'Restrict to an authorised role, retain previous/new room and reason, and prevent concurrent work in the former room.'),
        @('Interruption and resume', 'Retain committed signatures and lifecycle events, discard uncommitted completion and return the user to a clear recoverable state.'),
        @('Evidence', 'Associate mock-up, IPC photo, BAR comparison and print evidence with the selected batch, stage and event and retain availability for authorised review.'),
        @('Printing', 'Associate BAR and Quarantine Label output with the selected batch; distinguish test, successful, failed, void and reprint events.'),
        @('Open technical decisions', 'Physical persistence, identity integration, SeUIC connectivity/offline policy, BAR interface, printer configuration, evidence storage and validated capacity require approved technical confirmation.')
    )
    for ($i = 1; $i -le $workflowRows.Count; $i++) {
        Set-CellText $workflow $i 1 $workflowRows[$i - 1][0]
        Set-CellText $workflow $i 2 $workflowRows[$i - 1][1]
    }
    $workflow.Range.Font.Name = 'Verdana'
    $workflow.Range.Font.Size = 11
    $workflow.Range.ParagraphFormat.SpaceBefore = 0
    $workflow.Range.ParagraphFormat.SpaceAfter = 0
    $workflow.Rows.Item(1).Range.Font.Bold = -1

    # Replace abbreviated Section 4 statements with design-specific non-functional controls.
    $nfrText = @{
        '4.1 Audit Trail' = 'The design shall create append-only audit events for Stage 9 material, Line Clearance, count, amendment, mock-up and signature actions; Stage 10 stock, Box ID, box-count decision, Line Clearance, room and BAR update actions; Stage 11 attendance, start, runtime, page, evidence, hold, reconciliation and finish actions; and Stage 12 sample, quantity, allocation, comparison, print, void/reprint and sign-off actions. Each event retains batch, stage, action, result, authenticated user, role, date/time and applicable reason or previous/new value.'
        '4.2 Availability' = 'The four modules and SeUIC handheld workflow shall operate within the approved PLPI operational window. The design shall expose clear unavailable or recoverable states for device, print or service interruption and shall not create a completion solely because a screen was displayed or an action was attempted.'
        '4.3 Capacity Limits' = 'Configurable or validated limits shall cover active/completed batches, boxes per batch, room attendance events, sample rows, IPC evidence, reconciliation components, per-box allocations, controlled labels and retained history. Approved technical limits shall be confirmed before qualification and shall not silently truncate controlled data.'
        '4.4 Performance' = 'Queue search, batch opening, handheld validation, page navigation, evidence attachment, calculation, controlled printing, signature and hand-off shall provide a clear response within approved qualification targets. A long-running operation shall show progress or a controlled failure state and shall prevent duplicate submission.'
        '4.5 Recoverability' = 'Committed signatures, runtime events, evidence references, print states and audit records shall recover without duplication or loss. An uncommitted Stage 9 record, handheld Line Clearance, Assembly page or Stage 12 sign-off shall return as incomplete and shall not publish a downstream work item.'
        '4.6 Security Requirements' = 'Authoritative role checks shall protect queue access, room-specific work, operational signatures, hold resolution, correction, reallocation and label void/reprint. Signature attribution comes from the authenticated session and cannot be entered as free text. Completed records are read-only except through an authorised audited amendment path.'
        '4.7 Error Handling' = 'Validation shall identify the unmet field, check, calculation, evidence, route, room or prior-stage condition and retain the current controlled state. Stale or duplicate commit requests shall be rejected. A failed BAR update, evidence save, print or hand-off shall not record successful completion and shall retain diagnostic evidence appropriate to authorised support.'
        '4.8 Usability' = 'Desktop and handheld controls shall use the approved labels, visible batch identity, readable status, clear mandatory-state indication and consistent gated actions shown in the current wireframes. Completed controls shall display attribution read-only; destructive or irreversible actions shall require an explicit confirmation where defined.'
        '4.9 Accuracy and Validity' = 'The selected batch key shall bind product, material, reference, quantity, box, room, sample, evidence, reconciliation, label and signature data throughout the transaction. Positive whole-number, total, remaining, discrepancy and yield rules shall be recalculated at commit rather than relying only on client display values.'
        '4.10 User Access and Responsibilities' = 'Pre-Assembly QC, Production Controller, Assembly Room and Post-Assembly QC users shall access only their authorised queues and actions. QA/QP and Operations may review or resolve approved exceptions according to role. Support and administration shall maintain configuration and diagnostics without obtaining uncontrolled operational sign-off rights.'
        '4.11 Testing and Traceability' = 'Verification shall cover every approved URS and FS reference, displayed control, queue/status transition, authorised role, positive path, boundary value, negative validation, cancellation, interruption, duplicate prevention, correction, hold, evidence, print, signature and hand-off. Regression shall confirm the Stage 8 inbound and Stage 13 outbound interfaces remain controlled.'
        '4.12 Controlled Documents and Training' = 'Approved SOPs, work instructions, BAR forms, sampling rules, room procedures, handheld instructions, evidence handling, reconciliation, quarantine-label controls, exception routes and electronic-signature training shall be effective before release. Superseded paper steps shall be retired only through approved document and change control.'
        '4.13 Support and Administration' = 'Authorised administrators shall maintain users, roles, rooms, handheld devices, barcode/scanner behaviour, cameras, printers and controlled configuration. Regulated configuration changes, incidents, recovery and diagnostic access shall follow approved procedures and retain audit evidence without altering completed operational records.'
    }
    $section4 = Find-Paragraph $document '4. Additional Non-Functional Requirements' $designStart
    foreach ($headingText in $nfrText.Keys) {
        $heading = Find-Paragraph $document $headingText $section4.Range.End
        $body = Next-Paragraph $document $heading
        Set-ParagraphText $body $nfrText[$headingText]
        Format-Normal $document $body
    }

    foreach ($toc in $document.TablesOfContents) { $toc.Update() }
    $document.Save()
    $document.Close(0)
}
finally {
    if ($word) { $word.Quit() }
}

Copy-Item -LiteralPath $work -Destination $source -Force
Write-Output $source
