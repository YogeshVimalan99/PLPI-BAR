$ErrorActionPreference = 'Stop'

$source = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\Phase 3 Doc\FS-PLPI BAR - Pre-Assembly Production Controller Handheld Assembly and Post-Assembly QC.docx'
$work = 'C:\tmp\phase3-fs-rebuild.docx'
Copy-Item -LiteralPath $source -Destination $work -Force

function Set-CellText($table, [int]$row, [int]$column, [string]$text) {
    $range = $table.Cell($row, $column).Range
    $range.End--
    $range.Text = $text
}

function Set-ModuleTable($table, [string]$purpose, [string]$role, $fields, [string]$operations, [string]$useCase, [string]$output, [string]$dsId, [string]$ursId, [string]$rules) {
    Set-CellText $table 3 2 $purpose
    Set-CellText $table 4 2 $role
    $inputTable = $table.Cell(5, 2).Tables.Item(1)
    $neededRows = $fields.Count + 1
    while ($inputTable.Rows.Count -lt $neededRows) { [void]$inputTable.Rows.Add() }
    while ($inputTable.Rows.Count -gt $neededRows) { $inputTable.Rows.Item($inputTable.Rows.Count).Delete() }
    Set-CellText $inputTable 1 1 'Field / Button / Table Column'
    Set-CellText $inputTable 1 2 'Field type'
    Set-CellText $inputTable 1 3 'Functional description'
    for ($i = 0; $i -lt $fields.Count; $i++) {
        Set-CellText $inputTable ($i + 2) 1 $fields[$i][0]
        Set-CellText $inputTable ($i + 2) 2 $fields[$i][1]
        Set-CellText $inputTable ($i + 2) 3 $fields[$i][2]
    }
    $inputTable.Range.Font.Name = 'Verdana'
    $inputTable.Range.Font.Size = 11
    $inputTable.Range.ParagraphFormat.SpaceBefore = 0
    $inputTable.Range.ParagraphFormat.SpaceAfter = 0
    $inputTable.Rows.Item(1).Range.Font.Bold = -1
    $inputTable.Rows.Item(1).HeadingFormat = -1
    Set-CellText $table 6 2 $operations
    Set-CellText $table 7 2 $useCase
    Set-CellText $table 8 2 $output
    Set-CellText $table 9 2 $dsId
    Set-CellText $table 10 2 $ursId
    Set-CellText $table 11 2 $rules
    $table.Range.Font.Name = 'Verdana'
    $table.Range.Font.Size = 11
    $table.Range.ParagraphFormat.SpaceBefore = 0
    $table.Range.ParagraphFormat.SpaceAfter = 0
}

$preAssemblyFields = @(
    @('B&S Batch Number', 'Existing search field', 'Filters the eligible Stage 9 queue by the controlled B&S batch identifier.'),
    @('MFG Lot No.', 'Existing search field', 'Filters the eligible Stage 9 queue by manufacturing lot number.'),
    @('Search', 'Existing button', 'Applies the entered batch or manufacturing-lot criteria and refreshes the queue without changing source data.'),
    @('Pre Assembly List', 'Existing queue - updated eligibility', 'Displays only batches that completed required printing, route-specific preparation and Leaflet Folding.'),
    @('Queue columns', 'Existing read-only values', 'Displays B&S Batch Number, MFG Lot No., Product Name, Strength, Pack Size, ECMA, Expiry Date, Required Qty and Status.'),
    @('Active / Completed status', 'Calculated status', 'Shows whether the Stage 9 record is available for completion or retained as read-only history.'),
    @('Product Information', 'Existing data - controlled display', 'Displays Product Name, Foreign Name, Strength, Country of Origin, Pack Size, Units per Pack, B&S Batch Number, ECMA, Expiry Date, PL No., Quantity, Product Introduced, MFG Lot No., Leaflet Date and Date Revised.'),
    @('Print BAR', 'Existing controlled action', 'Opens the current controlled BAR for the selected batch and records a successful print event where printing is requested.'),
    @('Route information', 'Calculated read-only banner', 'Identifies whether carton information or product-detail verification applies to the selected route.'),
    @('MARKS', 'Existing value - controlled amendment', 'Displays the approved MARKS value and allows amendment before sign-off.'),
    @('Reason', 'New conditional field', 'Becomes enabled and mandatory when MARKS differs from its original value.'),
    @('Cartons Per Pack', 'Existing read-only value', 'Displays the configured cartons-per-pack value for Reboxing.'),
    @('Change of Pack Size', 'Existing route-specific form', 'For Reboxing, displays the applicable Received As and Assembled As amendment information and required initials/sign-offs.'),
    @('Product Reference', 'Existing read-only value', 'For Relabelling, displays the approved product reference.'),
    @('Leaflet Reference', 'Existing read-only value', 'For Relabelling, displays the approved leaflet reference.'),
    @('Braille Required', 'Existing read-only value', 'For Relabelling, displays whether a braille component is required.'),
    @('Printed-material checklist', 'New route-derived table', 'Creates one row for each applicable carton, blister, obscure, leaflet, braille or other controlled printed component.'),
    @('Type Of label', 'New checklist column', 'Identifies the component type to be verified.'),
    @('Reference code', 'Existing approved data - new display', 'Displays the controlled reference associated with the checklist row.'),
    @('Checked & Confirmed', 'New mandatory checkbox', 'Records confirmation that the physical printed component agrees with the BAR and approved reference.'),
    @('Pre-Assembly Line Clearance', 'New mandatory confirmation', 'Records that the Stage 9 area, documentation and materials are clear before sign-off.'),
    @('No of specimen', 'New non-negative whole-number field', 'Records the number of specimens prepared for the assembly reference sample.'),
    @('No Of Leaflet Folds', 'New non-negative whole-number field', 'Records the number of leaflet folds per pack where applicable.'),
    @('Tamper seal per pack', 'New non-negative whole-number field', 'Records the tamper-seal quantity per pack where applicable.'),
    @('Mockup', 'New controlled action', 'Opens the approved finished-presentation mock-up for reference-sample preparation and comparison.'),
    @('Reference-sample instructions', 'New controlled guidance', 'Displays the approved specimen-marking and working-copy confirmation instructions.'),
    @('Comments', 'New optional text area', 'Retains verification, exception or reference-sample context.'),
    @('Checked By / Date-Time', 'New read-only audit display', 'Displays the authenticated Stage 9 completion user and timestamp.'),
    @('User Sign Off', 'New controlled action', 'Revalidates all applicable Stage 9 gates, records completion, locks the record and publishes the batch to Production Control.'),
    @('Back to queue', 'Existing navigation', 'Returns to the Stage 9 queue without completing an unsigned record.')
)

$productionFields = @(
    @('GOODS IN', 'Existing handheld menu', 'Provides the authorised SeUIC handheld menu used to enter Stage 10.'),
    @('STOCK TAKE OUT', 'Existing handheld option - updated workflow', 'Opens the stock take-out route used for Box ID verification, Line Clearance and room allocation.'),
    @('Back / Power', 'Existing handheld controls', 'Returns to the preceding screen or menu without creating a completed Stage 10 record before CONFIRMED BY.'),
    @('Stock ID', 'Existing scanner/manual field', 'Accepts a scanned or manually entered stock identifier and loads the corresponding stock record.'),
    @('Product Name', 'Existing read-only value', 'Displays the product linked to the entered Stock ID.'),
    @('Part No.', 'Existing read-only value', 'Displays the controlled product part number.'),
    @('Batch No.', 'Existing read-only value', 'Displays the manufacturing or stock batch number associated with the selected stock.'),
    @('Goods In Boxes', 'Existing read-only value', 'Displays the source Goods In box count used as the initial confirmed-box value.'),
    @('Qty.', 'Existing read-only value', 'Displays the stock quantity associated with the selected record.'),
    @('Location', 'Existing read-only value', 'Displays the current stock location.'),
    @('IMP', 'Existing read-only value', 'Displays the applicable IMP identifier or value.'),
    @('Contract', 'Existing read-only value', 'Displays the applicable contract value.'),
    @('TRANSFER', 'Existing action - updated workflow', 'Opens Box ID verification for the displayed stock record.'),
    @('Scan Box ID for Verification', 'New controlled dialog', 'Accepts a scanned or manually entered Box ID for the stock transfer.'),
    @('CONFIRM', 'New dialog action', 'Rejects blank Box ID input and, after successful verification, opens a new Line Clearance form.'),
    @('CANCEL', 'New dialog action', 'Closes Box ID verification without creating Line Clearance or room-allocation completion.'),
    @('Line Clearance batch summary', 'New read-only display', 'Shows the selected product, batch number and source Goods In box count.'),
    @('Product / expiry / lot-size check', 'New mandatory checkbox', 'Records confirmation that product name, expiry date and lot size agree with the box label.'),
    @('No. of boxes confirmed', 'New mandatory confirmation and field', 'Displays the current box count and records a positive whole-number confirmed count.'),
    @('Confirm Box Count Change', 'New controlled dialog', 'Displays the previous and proposed box counts whenever the entered value changes.'),
    @('Confirm count change', 'New dialog action', 'Accepts the revised positive whole-number count and makes it eligible for BAR commit.'),
    @('Cancel count change', 'New dialog action', 'Restores the last confirmed count and makes no BAR update.'),
    @('Assign Assembly Room', 'New mandatory selection', 'Requires an approved Assembly Room value before completion.'),
    @('CONFIRMED BY', 'New gated action', 'Commits Line Clearance and room allocation only when both checks, box count and room are valid and no count decision is pending.'),
    @('BAR UPDATED', 'New read-only result', 'Confirms successful commit and displays the confirming user, date/time and assigned room.'),
    @('Completed Line Clearance', 'New read-only state', 'Locks the completed form and prevents it from pre-filling a later stock transfer.')
)

$assemblyFields = @(
    @('Active Batches / Completed Batches', 'New controlled queue tabs', 'Separates current room work from read-only completed history.'),
    @('Search by B&S Batch / Lot / Product', 'New search field', 'Filters the current queue by controlled batch, manufacturing lot or product identity.'),
    @('Search / Refresh', 'New queue actions', 'Applies the filter or refreshes status without changing a batch record.'),
    @('Assembly queue columns', 'New read-only values', 'Displays B&S Batch No., MFG Lot No., Description, Quantity, Room, Status and Action; completed history also displays Finished By.'),
    @('Open / Continue / View', 'New state-controlled action', 'Starts an unstarted batch, resumes an active batch or opens completed history read-only.'),
    @('Room Attendance', 'New controlled panel', 'Displays Staff Name, Role, Room, Check In, Check Out and current attendance status.'),
    @('Room selector', 'New controlled selection', 'Identifies the Assembly Room used for attendance capture.'),
    @('Check In / Check Out', 'New controlled actions', 'Records authenticated operator attendance against the selected room and timestamp.'),
    @('Start Batch confirmation', 'New controlled dialog', 'Requires confirmation before recording the authenticated start user, allocated room and start date/time.'),
    @('Selected-batch summary', 'New read-only banner', 'Displays B&S Batch No., MFG Lot No., Description, Quantity, Assembled Qty, Expiry Date, Strength, Pack Size, Status and Allocated Room.'),
    @('Print BAR', 'Existing controlled action', 'Opens the current controlled BAR for the selected assembly batch.'),
    @('Break / Resume Batch', 'New controlled lifecycle action', 'Pauses or resumes the active batch and records the user and date/time in runtime history.'),
    @('Quantity completed', 'New positive whole-number field', 'Records the completed quantity for Partial Finish and cannot exceed the total batch quantity.'),
    @('Partial Finish / Partial Start', 'New controlled lifecycle actions', 'Records the partial quantity and remaining quantity, then permits an authenticated later resume.'),
    @('Page navigation', 'New four-page tabs', 'Provides Initial Checks, Random Sample Check, IPC Photo Check and Reconciliation & Closure with visible completion state.'),
    @('Lifecycle Audit', 'New read-only display', 'Shows Batch Start, Started By and Assembly Room.'),
    @('Team Briefing', 'New controlled confirmation', 'Records Briefing Done By and Confirmed At before Initial Checks may complete.'),
    @('BAR available and correct', 'New mandatory Initial Check', 'Confirms the controlled BAR is available and correct.'),
    @('Correct specimen available', 'New mandatory Initial Check', 'Confirms the physical and electronic specimen is available.'),
    @('Room clean and ready', 'New mandatory Initial Check', 'Confirms the allocated room is ready for the selected batch.'),
    @('Printed components received', 'New mandatory Initial Check', 'Confirms required printed components were received from Production Control.'),
    @('Component boxes accounted for', 'New mandatory Initial Check', 'Confirms all component boxes are verified and accounted for.'),
    @('Random Sample rows', 'New box-derived table', 'Creates one confirmation row for every box received from Production Control.'),
    @('Box No. / MFG Lot No. / Expiry Date', 'New read-only sample values', 'Maintains the selected-box identity and product details for each sample confirmation.'),
    @('Sample status / Checked By / Checked At', 'New controlled sample record', 'Records the result, authenticated user and timestamp for each box sample.'),
    @('IPC Photo Check', 'New controlled page', 'Requires clear in-process photo evidence associated with the selected batch and IPC event.'),
    @('Take Picture / attachment', 'New evidence action', 'Uses the device camera or selected image and retains the evidence name and attribution.'),
    @('Material Reconciliation table', 'New controlled table', 'Provides one row for each applicable material or component.'),
    @('Received / Used / Damaged / Discrepant', 'New numeric reconciliation fields', 'Records material quantities and calculates or displays the remaining discrepancy.'),
    @('Total Used / Retention Sample / Yield / Total Damaged', 'New calculated and entered metrics', 'Supports finished quantity, retained sample, yield and damage review.'),
    @('Comments', 'New conditional text area', 'Records discrepancy, damage, evidence or closure context and is mandatory when an exception requires explanation.'),
    @('End-of-Batch Clearance', 'New mandatory confirmation set', 'Confirms materials are returned/accounted for, the area and equipment are clean, waste is disposed and the room is ready for the next batch.'),
    @('Mark Done', 'New page-signature action', 'Revalidates mandatory data, records page user/date-time and locks the signed page.'),
    @('Page completion attribution', 'New read-only display', 'Shows the completing user and date/time for each signed page.'),
    @('Finish Batch confirmation', 'New gated action', 'After all four pages are signed and reconciliation is acceptable, records final user/date-time and publishes the batch to Post-Assembly QC.'),
    @('Completed lifecycle summary', 'New read-only history', 'Retains start, runtime, page-signature, attendance and finish records after completion.')
)

$postAssemblyFields = @(
    @('BNS Batch No.', 'Existing search field', 'Filters the Stage 12 queue by controlled B&S batch number.'),
    @('MFG Lot No.', 'Existing search field', 'Filters the Stage 12 queue by manufacturing lot number.'),
    @('Search', 'Existing button', 'Applies the search criteria to assembly-complete batches.'),
    @('Production Checking Work Queue', 'Existing queue - updated eligibility', 'Displays only batches with completed Assembly pages, IPC evidence and reconciliation.'),
    @('Queue columns', 'Existing read-only values', 'Displays BNS Batch No., MFG Lot No., Description, Quantity, Assembled Qty, Expiry Date, Strength, Pack Size and Status.'),
    @('Active / Completed status', 'Calculated status', 'Allows active completion and retains signed records as read-only history.'),
    @('Product Information', 'Existing data - controlled display', 'Shows the selected product, batch, route, quantity, box and Assembly completion context.'),
    @('Print BAR', 'Existing controlled action', 'Opens the current controlled BAR for comparison.'),
    @('Back to Batch Queue', 'Existing navigation', 'Returns without completing an unsigned Stage 12 record.'),
    @('Total Packs', 'New positive whole-number field', 'Records the full assembled pack quantity presented for inspection.'),
    @('Total Boxes', 'New positive whole-number field', 'Records the number of boxes containing the finished packs.'),
    @('No. of Packs Checked', 'New positive whole-number field', 'Records the sample quantity required by the approved batch-size sampling rule.'),
    @('Enter / Edit Quantities', 'New conditional action', 'Opens per-box allocation when Total Boxes is greater than one.'),
    @('Quantity in Each Box', 'New controlled dialog', 'Creates one positive whole-number entry for each confirmed box.'),
    @('Entered Total / Remaining', 'New calculated indicators', 'Displays allocation progress against Total Packs.'),
    @('Confirm Box Quantities', 'New gated action', 'Saves allocation only when every box has a positive quantity and the combined total equals Total Packs.'),
    @('Cancel box allocation', 'New dialog action', 'Closes the dialog without committing an incomplete or inconsistent allocation.'),
    @('Pack Details Against BAR', 'New verification table', 'Displays every applicable carton, blister, leaflet, braille or other finished-pack comparison row.'),
    @('Product Name & Strength', 'Existing read-only data - new display', 'Shows the selected product identity for each comparison row.'),
    @('Reference Code', 'Existing approved data - new display', 'Shows the approved component reference for comparison.'),
    @('MFG Batch No. / B&S Batch No.', 'Existing read-only data', 'Maintains manufacturing and controlled-batch identity on every displayed row.'),
    @('Expiry confirmation', 'New mandatory checkbox', 'Records confirmation of the displayed expiry date for every applicable comparison row.'),
    @('Comments', 'New optional/conditional text area', 'Retains inspection or mismatch context and is mandatory when an exception is recorded.'),
    @('Print Quarantine Label', 'New controlled print action', 'Generates the controlled label from confirmed batch, box and quantity information and records the print result.'),
    @('Test Print', 'New controlled print action', 'Produces a non-completing test output and does not satisfy the controlled label requirement.'),
    @('Quarantine Label status', 'New read-only status', 'Shows Pending, Printed, Voided or Reprinted as applicable.'),
    @('Void / Reprint', 'New authorised exception action', 'Requires an authorised user and mandatory reason and retains the original and replacement print events.'),
    @('Signed By / Signed At', 'New read-only audit display', 'Shows the authenticated Stage 12 completion attribution.'),
    @('User Sign Off', 'New gated action', 'Revalidates samples, quantities, allocation, comparison rows and controlled label state before publishing the batch to Pre-QP.')
)

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $document = $word.Documents.Open($work, $false, $false)
    Set-ModuleTable $document.Tables.Item(6) `
        'To verify the Stage 9 eligible batch, confirm every applicable printed component and Pre-Assembly line-clearance requirement, prepare the controlled assembly reference sample and release the signed record to Production Control.' `
        'Authorised Pre-Assembly QC User' $preAssemblyFields `
        'The authorised user searches the Stage 9 queue by B&S batch or MFG lot, opens an eligible record and reviews the complete read-only product and route context. PLPI derives the printed-material rows from the approved route. The user confirms every displayed component against the BAR and controlled reference, completes Pre-Assembly Line Clearance, records specimen, leaflet-fold and tamper-seal counts, and uses Mockup to prepare and compare the assembly reference sample. For Reboxing, applicable Change of Pack Size amendments must be complete; for Relabelling, product, leaflet and braille context is displayed. A changed MARKS value requires a reason. User Sign Off revalidates eligibility and all applicable controls, records the authenticated user/role/date-time, locks Stage 9, removes the batch from the active queue and creates the Production Control work item.' `
        'A Pre-Assembly QC user completes the controlled material, sample and line-clearance record for an eligible batch and signs it to Production Control.' `
        'Signed Stage 9 record; confirmed route-derived materials and references; Pre-Assembly Line Clearance; specimen, leaflet-fold and tamper-seal counts; reference-sample context; retained comments and amendment reason; authenticated attribution; and Production Control availability.' `
        '3.1' '4.1.1 - 4.1.12' `
        'Only batches that completed printing, route preparation and Leaflet Folding shall appear. Source identity and approved references remain read-only. Every displayed printed-material row and Pre-Assembly Line Clearance shall be confirmed. Counts shall be non-negative whole numbers and route-applicable. A MARKS amendment requires a reason; route-specific amendment signatures remain mandatory where displayed. Mockup and BAR access do not complete the stage. Sign-off is single-use, revalidates the current record, locks completion and creates the Stage 10 queue entry. Back, cancellation, print failure or interruption before sign-off shall not create completion.'

    Set-ModuleTable $document.Tables.Item(7) `
        'To use the authorised SeUIC handheld to perform STOCK TAKE OUT, verify the Box ID, complete a new Line Clearance, confirm the box count and allocate the batch to an approved Assembly Room.' `
        'Authorised Production Controller using a SeUIC handheld' $productionFields `
        'The Production Controller opens GOODS IN and selects STOCK TAKE OUT. The user scans or enters Stock ID and verifies the read-only product, part, batch, source box, quantity, location, IMP and contract values. TRANSFER opens Scan Box ID for Verification. Blank confirmation is blocked; CANCEL returns without completion. Successful Box ID confirmation opens a new Line Clearance that is not pre-populated from a prior signed transfer. The user completes the product/expiry/lot-size check, confirms a positive whole-number box count, explicitly confirms or cancels any count change, selects the Assembly Room and uses CONFIRMED BY. The commit writes the stock, batch, product, confirmed boxes, room, checks, authenticated user and date/time to the BAR, displays BAR UPDATED, locks the completed form and publishes the batch only to the assigned room.' `
        'A Production Controller performs the controlled handheld stock transfer, Line Clearance and Assembly Room allocation for a Stage 9-complete batch.' `
        'Verified Stock ID and Box ID; signed handheld Line Clearance; confirmed box count and any accepted previous/new value; assigned room; BAR update; authenticated attribution; read-only completion; and allocated Assembly Room availability.' `
        '3.2' '4.2.1 - 4.2.20' `
        'Stage 10 shall use the approved SeUIC handheld route. Box ID is mandatory. The confirmed box count shall be a positive whole number. Changing it requires an explicit old/new confirmation; cancelling restores the prior confirmed value and updates nothing. CONFIRMED BY remains disabled until both Line Clearance checks, a valid settled box count and an approved room are present. The transaction shall prevent duplicate or stale completion and publish the batch only after a successful BAR update. Back, Cancel, Power or interruption before CONFIRMED BY shall not create Line Clearance or room allocation. A later transfer shall start with a new blank Line Clearance while the previous signed event remains in history.'

    Set-ModuleTable $document.Tables.Item(8) `
        'To execute and retain the allocated Stage 11 assembly lifecycle, including room attendance, batch start, Initial Checks, Random Sample Check, IPC evidence, controlled breaks or partial completion, Reconciliation & Closure and final hand-off.' `
        'Authorised Assembly Room User assigned to the applicable room' $assemblyFields `
        'The room queue displays only batches allocated by Production Control and separates Active from Completed history. The user may record room attendance, searches for the batch and confirms Start Batch; PLPI records the authenticated start event and allocated room. The four controlled pages are then completed. Initial Checks requires the team briefing and all setup/material confirmations. Random Sample Check creates one row per received box and records lot, expiry, user and time. IPC Photo Check retains the required image evidence against the batch. Reconciliation & Closure records component quantities, calculates or displays discrepancy and yield, requires exception context where needed, and confirms end-of-batch clearance. Break and partial-finish actions retain committed page signatures and record user/date-time and quantity without falsely completing the batch. Mark Done signs and locks each page. After all four pages are signed and reconciliation is acceptable, Finish Batch records the authenticated finish event, locks the lifecycle summary, removes the batch from Active and publishes it to Post-Assembly QC.' `
        'An Assembly Room user executes, signs and closes every controlled assembly page for a batch allocated to that room.' `
        'Room attendance; authenticated start, runtime and finish history; four signed pages; box-level sample records; IPC photo evidence; component reconciliation, discrepancy and yield result; end-of-batch clearance; immutable completed summary; and Post-Assembly QC availability.' `
        '3.3' '4.3.1 - 4.3.4; 4.3.7 - 4.3.12; 4.3.15; 4.3.17 - 4.3.21; 4.3.23 - 4.3.30' `
        'A batch shall appear only in its assigned room. Start requires confirmation and authenticated attribution. Initial Checks cannot sign without briefing and all confirmations. Random Sample requires one completed record per received box. IPC evidence shall remain linked to its check; a failed IPC places affected activity on hold until authorised resolution. Break and partial completion preserve committed events and shall not create final completion. Numeric reconciliation values shall be valid and traceable; non-zero discrepancy or unacceptable yield requires a reason and authorised resolution. Each signed page becomes read-only. Finish Batch requires all four page signatures, acceptable reconciliation and end-of-batch clearance and is single-use.'

    Set-ModuleTable $document.Tables.Item(9) `
        'To verify the Stage 12 eligible finished batch against the BAR, apply the approved sampling rule, confirm total and per-box quantities, control Quarantine Label output and release the signed record to Pre-QP.' `
        'Authorised Post-Assembly QC User' $postAssemblyFields `
        'The user searches the Production Checking queue by B&S batch or MFG lot and opens an Assembly-complete record. PLPI displays read-only product, batch, expiry, assembled quantity, box and Assembly status. The approved batch-size rule provides or requires the sample-pack quantity. The user records positive whole-number Total Packs, Total Boxes and No. of Packs Checked. When more than one box is present, Quantity in Each Box requires one positive value per box and Confirm Box Quantities remains disabled until the entered total equals Total Packs. The user verifies every route-applicable Pack Details Against BAR row, records comments for any exception and prints the Quarantine Label from the confirmed batch, box and quantity values. Void or Reprint requires an authorised user and reason and preserves all events. User Sign Off revalidates checks, quantities, allocation and label state, records the user/role/comments/date-time, locks Stage 12, changes the batch to quarantine status and publishes the record to Pre-QP.' `
        'A Post-Assembly QC user verifies the finished presentation and quantities, controls quarantine-label output and signs the assembly-complete batch to Pre-QP.' `
        'Verified Stage 12 comparison rows and samples; confirmed Total Packs, Total Boxes and per-box allocation; controlled Quarantine Label and exception history; authenticated sign-off; quarantine status; read-only evidence; and Pre-QP availability.' `
        '3.4' '4.4.1 - 4.4.3; 4.4.6; 4.4.8; 4.4.10 - 4.4.17' `
        'Only batches with completed Assembly pages, IPC records and acceptable reconciliation shall appear. Quantity and per-box values shall be positive whole numbers; every box requires a value and the total shall equal Total Packs. No. of Packs Checked shall satisfy the approved sampling rule. Every applicable BAR comparison row shall be confirmed. Controlled label data shall use the committed batch, box and quantity values; the number of labels shall agree with the confirmed boxes or approved requirement. Test Print does not satisfy controlled printing. Void and Reprint require reason, user and date/time and shall not overwrite the original event. Sign-off is blocked by unresolved mismatch, incomplete checks, invalid quantities/allocation or unacceptable label state and is single-use.'

    foreach ($toc in $document.TablesOfContents) { $toc.Update() }
    $document.Save()
    $document.Close(0)
}
finally {
    if ($word) { $word.Quit() }
}

Copy-Item -LiteralPath $work -Destination $source -Force
Write-Output $source
