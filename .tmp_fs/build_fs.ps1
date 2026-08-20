$ErrorActionPreference = 'Stop'

$reference = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\docz\FS-PLPI BAR.docx'
$urs = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\Project Doc\URS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'
$target = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\Project Doc\FS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'
$expectedReferenceHash = 'CAF71EF9EB8B5C0A39FEA1D7B85F268E462D72A9DF095AF69566DE45B52F7AA3'
$expectedUrsHash = 'BE36929CF650AF706B480DD0F132BDA9A0D8FF57D9CF0F003EED0FBA23867F85'

if ((Get-FileHash -Algorithm SHA256 -LiteralPath $reference).Hash -ne $expectedReferenceHash) { throw 'Reference FS changed; re-distillation is required.' }
if ((Get-FileHash -Algorithm SHA256 -LiteralPath $urs).Hash -ne $expectedUrsHash) { throw 'Final URS changed after content mapping; stop and re-read it.' }
if (Get-Process WINWORD -ErrorAction SilentlyContinue) { throw 'Close Microsoft Word before generating the FS.' }

Copy-Item -LiteralPath $reference -Destination $target -Force

$moduleSpecs = @(
    [ordered]@{
        HeadingOld = '3.1 Digital Goods Receiving Checklist and Packing List Module'
        HeadingNew = '3.1 B&S Batch Add and BAR Creation Module'
        Code = '3.1'
        Title = 'B&S Batch Add and BAR Creation Module'
        Priority = 'High'
        Purpose = 'To select eligible B&S batch records, create one controlled electronic BAR, complete BAR verification and digital line clearance, and release the signed batch to Label Printing.'
        Role = 'Authorised B&S Batch Add / BAR Creation User'
        Inputs = @(
            @('Country', 'Existing search field', 'Filters eligible products by country.'),
            @('Site', 'Existing search field', 'Filters eligible products by site.'),
            @('Category', 'Existing search field', 'Filters by Reboxing or Relabelling route.'),
            @('Status', 'Existing search field - updated values', 'Filters Not Printed BAR and Printed BAR records.'),
            @('Batch Number', 'Existing search field', 'Finds the applicable B&S batch record.'),
            @('Product Selection', 'Existing grid control - updated function', 'Allows one or more compatible source rows to be selected for BAR generation.'),
            @('Batch/Product Details', 'Existing data - new controlled display', 'Displays product status, site, country, part number, ECMA, strength, pack size, batch, expiry, quantity, IMP, invoice, warehouse, supplier and route data.'),
            @('Generate BAR', 'New controlled action', 'Creates one electronic BAR from the confirmed eligible selection.'),
            @('Print Batch Details', 'New action', 'Opens the controlled batch-detail output for printing.'),
            @('Generated BAR', 'New controlled document', 'Provides the populated BAR for review.'),
            @('Line Clearance Checks', 'Existing control - digitised', 'Records each required B&S line-clearance confirmation.'),
            @('Comments', 'New text area', 'Records relevant BAR or line-clearance comments.'),
            @('User Sign Off', 'New controlled action', 'Captures the authenticated user and date/time and releases the batch to Label Printing.')
        )
        Operations = 'The authorised user opens B&S Batch Add, applies the available filters and selects the eligible batch record or compatible source records. The system displays the selected product, batch, quantity, expiry, location and process-route information. Generate BAR creates one controlled electronic BAR while retaining traceability to the source selection. The user opens the generated BAR, completes the required verification and digital line-clearance checks, enters comments where needed and selects User Sign Off. The signed batch is removed from B&S Batch Add and becomes available in the Printer module under Label Printing.'
        UseCase = 'A BAR Creation user finds an eligible checked batch, confirms the batch and route data, generates the BAR, completes line clearance and signs the record for printing.'
        Output = 'Controlled electronic BAR; retained source-record linkage; completed B&S line-clearance record; authenticated sign-off; and an eligible batch in the Label Printing queue.'
        DS = '3.1'
        URS = '4.1.2 - 4.1.7'
        Rules = 'Only eligible records shall be selectable. Combined source records shall use compatible product, batch and expiry criteria. One confirmed selection shall create one controlled BAR. Sign-off shall remain unavailable until mandatory BAR and line-clearance checks are complete. Completed records shall not be generated again and shall retain the user, role, date and time.'
    },
    [ordered]@{
        HeadingOld = '3.2 RPi Pack Creation Module'
        HeadingNew = '3.2 Printing Module - Common Controls'
        Code = '3.2'
        Title = 'Printing Module - Common Controls'
        Priority = 'High'
        Purpose = 'To provide a single Printer entry point, route-controlled work queues and common document, quantity, completion and audit controls for Label Printing, Leaflet Printing, Carton Issuing and Braille Printing.'
        Role = 'Authorised Printer User'
        Inputs = @(
            @('Printer Menu', 'New module menu', 'Provides Label Printing, Leaflet Printing, Carton Issuing and Braille Printing options.'),
            @('Active / In Progress Counts', 'New read-only indicators', 'Shows the current workload for each printing option.'),
            @('B&S Batch Number', 'New queue search field', 'Searches the selected printing queue by B&S batch number.'),
            @('MFG Lot No', 'New queue search field', 'Searches the selected printing queue by manufacturing lot number.'),
            @('Printing Queue', 'New controlled list', 'Displays only batches eligible for the selected printing stage.'),
            @('Batch Summary', 'New read-only display', 'Shows batch, product, strength, pack size, ECMA, expiry, required quantity and status.'),
            @('Approved BAR and Artwork', 'New controlled document access', 'Opens the populated BAR, approved component artwork and supporting records for the selected batch.'),
            @('Print', 'New controlled action', 'Opens the applicable print or PDF workflow for the selected component line.'),
            @('Extra Quantity / Reason', 'New controlled fields', 'Records additional quantity and requires a reason where the approved quantity is exceeded.'),
            @('Line Completion', 'New controlled status', 'Records component-line completion and the completing user/date.'),
            @('Print Done', 'New controlled action', 'Completes the applicable printing stage after all required lines are complete.')
        )
        Operations = 'The Printer user opens the Printer menu and selects the required module. Each option opens its own eligibility-controlled queue and supports search by B&S batch number or manufacturing lot number. Selecting a row opens the batch summary, approved documents and the applicable component lines. Label, Leaflet and Braille Printing use the same core sequence: review the reference and required quantity, complete the required test or master check, print the approved quantity, record extra quantity with a reason where applicable, complete each line and select Print Done. Carton Issuing uses the same batch, quantity, extra-reason, completion and audit principles but records issued cartons rather than a print run.'
        UseCase = 'A Printer user selects the applicable printing option, opens an eligible batch, reviews the controlled documents, completes the required component lines and releases the batch to its next route-defined activity.'
        Output = 'Stage-specific printing record; quantities and reasons; component-line status; user/date attribution; updated batch status; and route-controlled handoff.'
        DS = '3.2'
        URS = '4.2.1 - 4.2.3, 4.2.5, 4.2.8'
        Rules = 'A batch shall appear only in queues permitted by its completed prior stage and approved route. Shared controls shall behave consistently across Label, Leaflet and Braille Printing. Print Done shall remain unavailable until each mandatory line is complete. Extra quantities shall require a reason. Controlled actions shall be retained in the audit history.'
    },
    [ordered]@{
        HeadingOld = '3.3 RPi Approval Module'
        HeadingNew = '3.3 Label Printing Module'
        Code = '3.3'
        Title = 'Label Printing Module'
        Priority = 'High'
        Purpose = 'To print and complete every label line required by the approved BAR route before the batch moves to Leaflet Printing or the next applicable stage.'
        Role = 'Authorised Printer User'
        Inputs = @(
            @('Label Printing List', 'New controlled queue', 'Lists BAR-signed batches ready for label printing.'),
            @('Label', 'New read-only line value', 'Identifies each required label type.'),
            @('Reference', 'New read-only line value', 'Displays the approved label reference.'),
            @('Size', 'New read-only line value', 'Displays the approved label size.'),
            @('Required Quantity', 'New read-only quantity', 'Displays the quantity derived from the batch route.'),
            @('Location / In Hand Quantity', 'Existing stock data - new display', 'Shows the material location and available stock.'),
            @('Change of Pack Size', 'Existing route information - digitised control', 'For reboxing, requires Received As and Assembled As details and sign-off before label printing.'),
            @('Test Print', 'New controlled print action', 'Produces the test label for acceptance before the full run where required.'),
            @('Print / Print Extra', 'New controlled actions', 'Records required and additional label quantities.'),
            @('Line Completion', 'New controlled status', 'Shows Pending or Done for each label line.'),
            @('Completed By / Date', 'New read-only audit display', 'Shows the authenticated user and completion time for each line.'),
            @('Print Done', 'New controlled action', 'Finalises Label Printing when all required lines are complete.')
        )
        Operations = 'The Printer user opens Label Printing and selects a BAR-signed batch. The system derives and displays the label lines required by the approved Reboxing or Relabelling route. For a reboxing batch, the Received As and Assembled As sections must be completed and signed before printing. The user reviews the approved references, performs the test print where required, prints each label line and records any extra quantity and reason. Each completed line shows Done with user/date attribution. When every required line is complete, Print Done finalises Label Printing and routes the batch to Leaflet Printing where required.'
        UseCase = 'A Printer user completes all route-derived label lines for an approved BAR and confirms the batch ready for the next printing activity.'
        Output = 'Completed label lines; print quantities and extra reasons; line-level audit attribution; final Label Printing status; and handoff to Leaflet Printing or the next applicable stage.'
        DS = '3.3'
        URS = '4.2.4, 4.2.5, 4.2.8'
        Rules = 'Label lines shall be derived from the approved process route. Reboxing label printing shall remain blocked until the Change of Pack Size information is complete. Each mandatory label line shall be Done before Print Done is enabled. Printed quantities, extras and completion attribution shall be retained against the batch.'
    },
    [ordered]@{
        HeadingOld = '3.4 Batch Checker Module'
        HeadingNew = '3.4 Leaflet Printing Module'
        Code = '3.4'
        Title = 'Leaflet Printing Module'
        Priority = 'High'
        Purpose = 'To review the approved leaflet, complete the required test or master check, print each required leaflet line and route the batch according to the approved packaging process.'
        Role = 'Authorised Printer User'
        Inputs = @(
            @('Leaflet Printing List', 'New controlled queue', 'Lists batches that completed Label Printing and require leaflets.'),
            @('Leaflet', 'New read-only line value', 'Identifies each required leaflet.'),
            @('Reference', 'New read-only line value', 'Displays the approved leaflet reference/version.'),
            @('Size', 'New read-only line value', 'Displays the leaflet format or size.'),
            @('Required Quantity', 'New read-only quantity', 'Displays the approved leaflet quantity.'),
            @('Location', 'Existing stock data - new display', 'Shows the applicable leaflet location.'),
            @('Leaflet PDF', 'New controlled document action', 'Opens the approved leaflet for printing.'),
            @('Test / Master Check', 'New controlled confirmation', 'Records review of the test or master copy before completion.'),
            @('Print / Print Extra', 'New controlled actions', 'Records required and additional leaflet quantities.'),
            @('Mark as Done', 'New controlled action', 'Completes an individual leaflet line after printing.'),
            @('Completed By / Date', 'New read-only audit display', 'Shows the authenticated line-completion attribution.'),
            @('Print Done', 'New controlled action', 'Finalises Leaflet Printing when all leaflet lines are complete.')
        )
        Operations = 'The Printer user opens Leaflet Printing and selects a batch that completed Label Printing. The system displays the approved leaflet reference, size, required quantity and location and provides the controlled leaflet PDF. The user reviews the test or master copy, prints the required quantity, records extra quantity with a reason where applicable and marks each leaflet line Done. Print Done becomes available when all required lines are complete. A reboxing batch moves to Carton Issuing; a relabelling batch requiring braille moves to Braille Printing; otherwise the batch moves to the next applicable stage.'
        UseCase = 'A Printer user reviews and prints the approved leaflet for the batch, completes every leaflet line and releases the batch to its route-specific preparation stage.'
        Output = 'Completed leaflet lines; approved reference/version linkage; print quantities and extra reasons; completion attribution; and route to Carton Issuing, Braille Printing or the next applicable stage.'
        DS = '3.4'
        URS = '4.2.5, 4.2.6, 4.2.8'
        Rules = 'Only batches requiring a leaflet and having completed Label Printing shall appear. The approved leaflet shall be reviewed before the line is completed. Every required leaflet line shall be Done before Print Done. Routing shall follow Reboxing, Relabelling and braille-required values held against the approved batch.'
    },
    [ordered]@{
        HeadingOld = '3.5 Product Verification Pop-up'
        HeadingNew = '3.5 Carton Issuing Module'
        Code = '3.5'
        Title = 'Carton Issuing Module'
        Priority = 'High'
        Purpose = 'To record the controlled issue of approved cartons for reboxing batches after Leaflet Printing.'
        Role = 'Authorised Printer / Packaging User'
        Inputs = @(
            @('Carton Issuing List', 'New controlled queue', 'Lists reboxing batches that completed Leaflet Printing.'),
            @('Carton Reference', 'New read-only value', 'Displays the approved carton reference.'),
            @('Required Quantity', 'New read-only quantity', 'Displays the carton quantity required for the batch.'),
            @('On Hand Quantity', 'Existing stock data - new display', 'Shows the available carton quantity.'),
            @('Location Number', 'Existing stock data - new display', 'Shows the carton issue location.'),
            @('Issue Extra', 'New controlled action', 'Records additional cartons after the required issue is confirmed.'),
            @('Extra Quantity / Reason', 'New controlled fields', 'Requires a reason for additional carton issue.'),
            @('Confirmed By', 'New read-only audit display', 'Shows the authenticated confirming user and date/time.'),
            @('Done', 'New controlled action', 'Confirms the required carton issue line.')
        )
        Operations = 'After Leaflet Printing, a reboxing batch appears in Carton Issuing. The user opens the batch and confirms the approved carton reference, required quantity, available quantity and location. Done records the required carton issue with the authenticated user and date/time. If additional cartons are needed, Issue Extra records the extra quantity and requires a reason. The completed carton issue becomes part of the batch history and the batch proceeds to Leaflet Folding or the next configured stage.'
        UseCase = 'A Printer or Packaging user confirms the correct cartons and quantity have been issued for a reboxing batch.'
        Output = 'Confirmed carton issue; required and extra quantities; location; reason where applicable; user/date attribution; and completed route-specific preparation.'
        DS = '3.5'
        URS = '4.2.6 - 4.2.8'
        Rules = 'Only reboxing batches that completed Leaflet Printing shall appear. Extra carton quantity shall not be accepted without a reason. The required issue shall be confirmed before extra cartons can be issued. The issue record shall remain linked to the batch.'
    },
    [ordered]@{
        HeadingOld = '3.6 Print PCL Preview and Verification'
        HeadingNew = '3.6 Braille Printing Module'
        Code = '3.6'
        Title = 'Braille Printing Module'
        Priority = 'High'
        Purpose = 'To print and complete the approved braille labels required for applicable relabelling batches after Leaflet Printing.'
        Role = 'Authorised Printer User'
        Inputs = @(
            @('Braille Printing List', 'New controlled queue', 'Lists eligible relabelling batches for which braille is required.'),
            @('Braille Label', 'New read-only line value', 'Identifies each required braille label.'),
            @('Reference', 'New read-only line value', 'Displays the approved braille reference.'),
            @('Size', 'New read-only line value', 'Displays the approved braille label size.'),
            @('Required Quantity', 'New read-only quantity', 'Displays the approved braille label quantity.'),
            @('Location / In Hand Quantity', 'Existing stock data - new display', 'Shows material location and available quantity.'),
            @('Test Print', 'New controlled print action', 'Produces a test braille label where required.'),
            @('Print / Print Extra', 'New controlled actions', 'Records required and additional braille quantities.'),
            @('Line Completion', 'New controlled status', 'Shows Pending, Mark as Done or Done for each line.'),
            @('Completed By / Date', 'New read-only audit display', 'Shows the authenticated completion attribution.'),
            @('Print Done', 'New controlled action', 'Finalises Braille Printing after all lines are complete.')
        )
        Operations = 'After Leaflet Printing, a relabelling batch requiring braille appears in Braille Printing. The user reviews the approved reference, size, quantity, location and available stock. Braille Printing follows the same core process as Label Printing: complete any required test print, print the required quantity, record extra quantity with a reason, complete each line and select Print Done after all lines are Done. The completed batch proceeds to Leaflet Folding or the next configured stage.'
        UseCase = 'A Printer user completes the required braille label lines for an eligible relabelling batch.'
        Output = 'Completed braille lines; print quantities and extra reasons; line-level user/date attribution; and completed route-specific preparation.'
        DS = '3.6'
        URS = '4.2.5 - 4.2.8'
        Rules = 'Only relabelling batches with braille required and completed Leaflet Printing shall appear. The common printing, quantity, extra-reason and completion controls defined for Label Printing shall apply. Every required line shall be Done before Print Done.'
    },
    [ordered]@{
        HeadingOld = '3.7 Goods-In Summary'
        HeadingNew = '3.7 Leaflet Folding Module'
        Code = '3.7'
        Title = 'Leaflet Folding Module'
        Priority = 'High'
        Purpose = 'To complete and record leaflet folding after all printing and route-specific preparation required for the batch has finished.'
        Role = 'Authorised Leaflet Folding User'
        Inputs = @(
            @('B&S Batch Number', 'New queue search field', 'Searches the folding queue by B&S batch number.'),
            @('MFG Lot No', 'New queue search field', 'Searches the folding queue by manufacturing lot number.'),
            @('Leaflet Folding List', 'New controlled queue', 'Lists batches eligible for folding.'),
            @('Product / Batch Summary', 'New read-only display', 'Shows product, strength, pack size, ECMA, expiry, required quantity and status.'),
            @('BAR and Supporting Documents', 'New controlled document access', 'Opens the applicable BAR and approved leaflet information.'),
            @('Leaflet Reference', 'New read-only value', 'Displays the approved leaflet reference.'),
            @('Leaflet Size', 'New read-only value', 'Displays the approved leaflet format or size.'),
            @('Required Quantity', 'New read-only quantity', 'Displays the folding quantity required by the batch.'),
            @('On Hand Quantity', 'Existing stock data - new display', 'Shows the available leaflet quantity.'),
            @('Done', 'New controlled action', 'Completes leaflet folding and records attribution.'),
            @('Folded By / Date-Time', 'New read-only audit display', 'Shows the authenticated completion user and date/time.')
        )
        Operations = 'The Leaflet Folding user opens the queue and searches by B&S batch number or manufacturing lot number. Only batches that have completed the required printing and route-specific preparation are listed. The user opens the batch, reviews the BAR and approved leaflet reference, confirms the leaflet size and required quantity, and selects Done when folding is complete. The system records the folded quantity, authenticated user and date/time, updates the batch status and hands the batch to the next configured process stage.'
        UseCase = 'A Leaflet Folding user confirms the correct leaflet and batch, completes the required folding quantity and records completion.'
        Output = 'Completed folding record; folded quantity; approved leaflet linkage; user/role/date-time attribution; updated status; and downstream handoff.'
        DS = '3.7'
        URS = '4.3.1 - 4.3.6'
        Rules = 'A batch shall not enter Leaflet Folding until all required printing and route-specific preparation is complete. The batch identity, approved leaflet reference, format and required quantity shall be available before Done. Completion shall be retained in batch history and shall remove the record from the active folding queue.'
    }
)

$trace = @(
    @('URS: 4.1.2 / DS: 3.1', 'B&S Batch Search and Selection', 'Search and select eligible products by batch, product, country, site, status and available criteria.'),
    @('URS: 4.1.3 / DS: 3.1', 'Selected Batch Display', 'Display the product, pack, reference, expiry, quantity, order, location and route information needed to confirm the batch.'),
    @('URS: 4.1.4 / DS: 3.1', 'Compatible Source Combination', 'Allow only compatible source records to be combined and retain traceability to each selected source.'),
    @('URS: 4.1.5 / DS: 3.1', 'Controlled BAR Creation', 'Require confirmation of the selected B&S batch before creating one controlled electronic BAR.'),
    @('URS: 4.1.6 / DS: 3.1', 'BAR Verification and Line Clearance', 'Provide batch, product, source-document and digital line-clearance checks.'),
    @('URS: 4.1.7 / DS: 3.1', 'BAR Sign-off and Printing Handoff', 'Capture authenticated attribution, lock completed checks and route the batch to Label Printing.'),
    @('URS: 4.2.1 / DS: 3.2', 'Printer Module Options', 'Provide Label Printing, Leaflet Printing, Carton Issuing and Braille Printing options.'),
    @('URS: 4.2.2 / DS: 3.2', 'Printing Queue and Batch Display', 'Select a batch from the relevant queue and display route, component, quantity and location information.'),
    @('URS: 4.2.3 / DS: 3.2', 'Controlled BAR and Artwork Access', 'Open the approved BAR, artwork and supporting documents for the selected activity.'),
    @('URS: 4.2.4 / DS: 3.3', 'Route-Derived Label Lines', 'Display and require completion of all label lines applicable to the approved route.'),
    @('URS: 4.2.5 / DS: 3.2 - 3.4, 3.6', 'Common Printing Process', 'Apply reference/quantity review, test or master checks, required and extra quantity controls and completion to Label, Leaflet and Braille Printing.'),
    @('URS: 4.2.6 / DS: 3.4 - 3.6', 'Leaflet Completion and Route Branch', 'Route completed reboxing batches to Carton Issuing and applicable relabelling batches to Braille Printing.'),
    @('URS: 4.2.7 / DS: 3.5, 3.6', 'Carton and Braille Route Controls', 'Confirm reboxing carton issue and complete braille labels only for eligible relabelling batches.'),
    @('URS: 4.2.8 / DS: 3.2 - 3.7', 'Printing Completion and Folding Handoff', 'Record user/date-time, update status and move a route-complete batch to Leaflet Folding.'),
    @('URS: 4.3.1 / DS: 3.7', 'Leaflet Folding Eligibility', 'List only batches that completed required printing and route-specific preparation.'),
    @('URS: 4.3.2 / DS: 3.7', 'Folding Search and Batch Display', 'Search by B&S batch or manufacturing lot and display product, leaflet, quantity and status information.'),
    @('URS: 4.3.3 / DS: 3.7', 'Folding Document Access', 'Provide controlled access to the BAR, approved leaflet and supporting documents.'),
    @('URS: 4.3.4 / DS: 3.7', 'Batch and Leaflet Confirmation', 'Require agreement between the selected batch, leaflet and approved BAR.'),
    @('URS: 4.3.5 / DS: 3.7', 'Folded Quantity and Completion Gate', 'Record folded quantity and prevent completion when identity, reference, format or quantity is missing or incorrect.'),
    @('URS: 4.3.6 / DS: 3.7', 'Folding Attribution and History', 'Capture authenticated user, role and date-time and retain the completed folding record in batch history.')
)

$word = $null
$doc = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open($target, $false, $false, $false)

    function Replace-AllStories([string]$findText, [string]$replaceText) {
        foreach ($storyType in @($doc.StoryRanges | ForEach-Object { $_.StoryType } | Select-Object -Unique)) {
            $range = $doc.StoryRanges.Item($storyType)
            while ($range -ne $null) {
                $f = $range.Find
                $f.ClearFormatting()
                $f.Replacement.ClearFormatting()
                $f.Text = $findText
                $f.Replacement.Text = $replaceText
                $f.Forward = $true
                $f.Wrap = 0
                $f.Format = $false
                $f.MatchCase = $false
                $f.MatchWholeWord = $false
                [void]$f.Execute($findText, $false, $false, $false, $false, $false, $true, 0, $false, $replaceText, 2)
                $range = $range.NextStoryRange
            }
        }
    }

    function Set-CellText($cell, [string]$text) {
        $range = $cell.Range.Duplicate
        [void]$range.MoveEnd(1, -1)
        $range.Text = $text
    }

    function Set-NestedInputTable($moduleTable, $rows) {
        $nested = $moduleTable.Cell(5, 2).Tables.Item(1)
        $requiredRows = $rows.Count + 1
        while ($nested.Rows.Count -lt $requiredRows) { [void]$nested.Rows.Add() }
        while ($nested.Rows.Count -gt $requiredRows) { $nested.Rows.Item($nested.Rows.Count).Delete() }
        Set-CellText $nested.Cell(1, 1) 'Field Name'
        Set-CellText $nested.Cell(1, 2) 'Field type'
        Set-CellText $nested.Cell(1, 3) 'Comments'
        for ($i = 0; $i -lt $rows.Count; $i++) {
            Set-CellText $nested.Cell($i + 2, 1) $rows[$i][0]
            Set-CellText $nested.Cell($i + 2, 2) $rows[$i][1]
            Set-CellText $nested.Cell($i + 2, 3) $rows[$i][2]
        }
        $nested.Rows.Item(1).HeadingFormat = -1
    }

    Replace-AllStories 'Functional Specification: PLPI Batch Record Automation' 'Functional Specification: PLPI Batch Record Automation Phase 2'
    Replace-AllStories 'FS/PLPI/PH1/v2.0' 'PLPI/BAR/FS/01/v1'
    Replace-AllStories 'Ronex Pereira' 'Juston Rodrigues'
    Replace-AllStories 'Rajesh Patel' 'Anthony Fernandes'
    Replace-AllStories 'Quality Specialist / RP' 'QA'

    Set-CellText $doc.Tables.Item(4).Cell(2, 1) '1'
    Set-CellText $doc.Tables.Item(4).Cell(2, 2) 'NA'
    Set-CellText $doc.Tables.Item(4).Cell(2, 3) 'New Functional Specification prepared for PLPI Batch Record Automation Phase 2 covering B&S Batch Add, Printing modules and Leaflet Folding.'
    Set-CellText $doc.Tables.Item(4).Cell(2, 4) 'Aug 2026'

    Replace-AllStories 'As defined in the URS, the PLPI Batch Record Automation project will digitalise the Goods Receiving Checklist and the associated Phase 1 workflow, from Goods-In receipt and Packing List processing through RP/RPi approval, India stock acceptance status reflection and Batch Checker/Product Check Log completion.' 'As defined in the approved URS, PLPI Batch Record Automation Phase 2 will digitalise the workflow from B&S Batch Add and electronic BAR creation through route-based printing and Leaflet Folding, while retaining controlled GMP checks, attribution and audit history.'
    Replace-AllStories 'The purpose of this document is to define the functional specification for PLPI Batch Record Automation Phase 1 and meet the user needs described in the URS.' 'The purpose of this document is to define the functional specification for PLPI Batch Record Automation Phase 2 and describe the functional behaviour required to meet the approved URS.'
    Replace-AllStories 'This document covers the Phase 1 functional changes for the digital Goods Receiving Checklist, Packing List, RP/RPi document review and approval, approved-pack email and acceptance-status reflection, and Batch Checker/Product Check Log workflow. Downstream BAR and production stages are excluded.' 'This document covers B&S Batch Add and BAR creation, BAR verification and digital line clearance, the Printer module, Label Printing, Leaflet Printing, Carton Issuing, Braille Printing where required, and Leaflet Folding.'
    Replace-AllStories 'Out of Scope: - Following BAR and production stages are excluded in this scope.' 'Out of Scope: Pre-Assembly, Production Control, assembly-room activities, Post-Assembly QC, Pre-QP and QP Approval are excluded except for the controlled handoff from Leaflet Folding.'
    Replace-AllStories 'This section provides a general description of the software characteristics and workflow behaviour. The controlled sequence is PO Initiated, Checklist Pending or In Progress, RPi Exception Review where required, Checklist Decision Approved and Accepted, Packing List Pending or Complete, RPi Pack in Progress or Ready for RPi Review, Returned for Correction or RPi Approved, PDF and Email Processed, Awaiting External Acceptance, Ready for Batch Check, and PCL Complete or Regulatory Review Required.' 'This section provides a general description of the Phase 2 workflow. An eligible checked batch is selected in B&S Batch Add, one electronic BAR is generated and signed after verification and digital line clearance, and the batch enters Label Printing. Where required, it continues through Leaflet Printing and then through Carton Issuing for reboxing or Braille Printing for applicable relabelling. When all route-specific printing is complete, the batch enters Leaflet Folding and is handed to the next configured process stage.'
    Replace-AllStories 'This section describes the functional attributes of the software that will be implemented to meet the requirements defined in the URS.' 'This section describes the functional attributes and controlled workflow behaviour that will be implemented to meet the approved Phase 2 URS.'

    $abbr = @(
        @('IT', 'Information Technology'), @('URS', 'User Requirement Specification'), @('DS', 'Design Specification'),
        @('FS', 'Functional Specification'), @('PLPI', 'Parallel Import / PLPI system workflow'), @('BAR', 'Batch Assembly Record'),
        @('PCL', 'Product Check Log'), @('B&S', 'B&S Batch Add / batch identifier'), @('GMP', 'Good Manufacturing Practice'),
        @('MFG', 'Manufacturing / manufacturer'), @('QP', 'Qualified Person'), @('RP / RPi', 'Responsible Person / Responsible Person import'),
        @('QA', 'Quality Assurance'), @('PDF', 'Portable Document Format'), @('ECMA', 'European Centralised Marketing Authorisation')
    )
    $abbrTable = $doc.Tables.Item(5)
    for ($i = 0; $i -lt $abbr.Count; $i++) {
        Set-CellText $abbrTable.Cell($i + 1, 1) $abbr[$i][0]
        Set-CellText $abbrTable.Cell($i + 1, 2) $abbr[$i][1]
    }

    for ($m = 0; $m -lt $moduleSpecs.Count; $m++) {
        $spec = $moduleSpecs[$m]
        Replace-AllStories $spec.HeadingOld $spec.HeadingNew
        $table = $doc.Tables.Item($m + 6)
        Set-CellText $table.Cell(1, 1) $spec.Code
        Set-CellText $table.Cell(1, 2) $spec.Title
        Set-CellText $table.Cell(2, 2) $spec.Priority
        Set-CellText $table.Cell(3, 2) $spec.Purpose
        Set-CellText $table.Cell(4, 2) $spec.Role
        Set-NestedInputTable $table $spec.Inputs
        Set-CellText $table.Cell(6, 2) $spec.Operations
        Set-CellText $table.Cell(7, 2) $spec.UseCase
        Set-CellText $table.Cell(8, 2) $spec.Output
        Set-CellText $table.Cell(9, 2) $spec.DS
        Set-CellText $table.Cell(10, 2) $spec.URS
        Set-CellText $table.Cell(11, 2) $spec.Rules
        $table.Rows.Item(1).HeadingFormat = -1
    }

    Replace-AllStories 'This section provides complete URS-to-FS traceability and defines the non-functional controls for PLPI Batch Record Automation Phase 1, including user access, testing, documentation and support.' 'This section provides complete URS-to-FS traceability and defines the non-functional controls for PLPI Batch Record Automation Phase 2, including audit, access, printing, testing, documentation and support.'
    $traceTable = $doc.Tables.Item(13)
    $needed = $trace.Count + 1
    while ($traceTable.Rows.Count -gt $needed) { $traceTable.Rows.Item($traceTable.Rows.Count).Delete() }
    while ($traceTable.Rows.Count -lt $needed) { [void]$traceTable.Rows.Add() }
    Set-CellText $traceTable.Cell(1, 1) 'URS ID & DS ID Ref'
    Set-CellText $traceTable.Cell(1, 2) 'Function/Feature'
    Set-CellText $traceTable.Cell(1, 3) 'Description/Specification'
    for ($i = 0; $i -lt $trace.Count; $i++) {
        Set-CellText $traceTable.Cell($i + 2, 1) $trace[$i][0]
        Set-CellText $traceTable.Cell($i + 2, 2) $trace[$i][1]
        Set-CellText $traceTable.Cell($i + 2, 3) $trace[$i][2]
    }
    $traceTable.Rows.Item(1).HeadingFormat = -1

    $nfsReplacements = [ordered]@{
        'The system shall retain audit records for WSC India PO creation and source-file upload, automatic RPi Pack Creation queue creation, checklist and Packing List attachment, automatic and user-controlled PO merge, shared-document linkage, file re-upload/versioning, unmerge actions, RPi Approval, PDF/email, Batch Checker invoice viewing, Product Verification, PCL print/reprint, edit-triggered PCL reset and Goods-In Summary access.' = 'The system shall retain audit records for B&S batch selection, source-record combination, BAR generation, BAR and artwork access, verification and line clearance, test/master review, required and extra quantities, reasons, component-line completion, Print Done, carton issue, braille completion, Leaflet Folding and every controlled status handoff.'
        'The PLPI Phase 1 functions shall be available to authorised WSC India, Goods-In, RP/RPi, Batch Checker, QA/RP, Operations and IT users during agreed operational hours.' = 'The PLPI Phase 2 functions shall be available to authorised B&S Batch Add, Printer, Leaflet Folding, QA/RP, Operations and IT users during agreed operational hours.'
        'The system shall support the expected operational volume of tablet checklist records, Add Packing List uploads, Packing Lists, individual and merged RPi packs, approval records, combined PDFs, email records, Product Verification records, PCL outputs and Goods-In Summary history.' = 'The system shall support the expected operational volume of eligible B&S batches, generated BAR records, printing queue records, component lines, print runs, extra-quantity reasons, carton issues, braille records, folding records and retained audit history.'
        'PO and queue search, tablet checklist actions, file upload, Verify & Print, LOG display, PO merge/unmerge, document viewing, RPi Approval, PDF generation, email status, Product Verification, PCL preview/printing and Goods-In Summary shall complete within agreed operational response times.' = 'B&S Batch Add search, BAR generation and viewing, printing queue search, approved-document opening, print actions, quantity save, line completion, Print Done, carton issue and Leaflet Folding completion shall operate within agreed operational response times.'
        'An unfinished Goods-In checklist or Team Lead approval retained through Save draft shall remain available for continuation. Completed approval, filed PDF and committed workflow states shall recover without duplication or loss.' = 'Saved BAR, printing and folding progress shall remain available for continuation. Completed BAR, line-clearance, printing, carton, braille, folding and workflow-handoff records shall recover without duplication or loss.'
        'Access shall be role based. WSC India users shall use Add Packing List and its file-upload controls. Goods-In users shall complete the tablet checklist, Packing List verification and the separate RPi Pack Creation module. RP/RPi users shall use RPi Approval. Batch Checker actions shall remain limited to authorised users. Completed or approved records shall be read-only except through controlled correction.' = 'Access shall be role based. B&S Batch Add users shall create and sign BAR records. Printer users shall access only the printing modules permitted by their role. Leaflet Folding users shall complete assigned folding records. QA/RP, Operations and authorised IT users shall have controlled review, exception, reporting or administration access. Completed records shall be read-only except through an authorised correction or reprint process.'
        'The system shall validate mandatory Goods-In details, signatures, inspection checks and the Team Lead decision. A No decision shall enter RPi Exception Review and remain quarantined until RPi approval appears in Checklist decision and Goods-In selects Accept. Missing mandatory pack files shall prevent RPi submission; Additional Files shall remain optional.' = 'The system shall validate batch eligibility, compatible source selection, mandatory BAR and line-clearance checks, approved references, required quantities, test/master controls, extra-quantity reasons and completion status. Validation failures shall prevent the affected action and retain the batch in its current controlled stage.'
        'The tablet workflow shall provide separate Goods-In Team and Lead Approval queues, a clear three-stage stepper, locked WSC-loaded values, touch-suitable controls, signature areas, visible draft status and a locked completed PDF without overlap or truncation.' = 'The workflow shall provide clear B&S Batch Add, printing and folding queues, consistent search and status presentation, readable controlled documents, line-level progress, visible completion attribution and clear route-based handoff messages without overlap or truncation.'
        'PO, checklist decisions, shared-file references, WSC-loaded values, signatures, line clearance, approved pack documents, Product Verification, complete or incomplete PCL output and PDF/email records shall remain linked through controlled identifiers and reflect the committed source record.' = 'B&S batch identifiers, source selections, BAR data, approved component references, quantities, reasons, line clearance, print runs, carton issue, braille and folding records shall remain linked through controlled identifiers and reflect the committed batch record.'
        'WSC India enters PO details and uploads the three supplier files. Goods-In completes the tablet checklist. The Team Lead Yes route continues normally; a No route is approved by RPi and accepted by Goods-In in Packing List > Checklist decision before View Packing List. Goods-In uploads missing mandatory RPi pack files; Additional Files is optional.' = 'B&S Batch Add users select eligible records, generate the BAR, complete verification and line clearance and sign the batch to Label Printing. Printer users complete Label, Leaflet, Carton and Braille activities applicable to the route. Leaflet Folding users complete the folding record. QA/RP, Operations and IT users perform their authorised review, exception and support responsibilities.'
        'Verification testing shall cover Add Packing List source linkage; Goods Receiving No routing to the RPi QA Decision queue; Approved for unpacking visibility in Checklist decision; Goods-In Accept release to View Packing List; automatic merge of only the POs recorded on one checklist; manual same-supplier merge validation; prevention of re-merging an already grouped PO; shared-file references after unmerge; document re-upload/version history; mandatory versus optional Additional Files; incorrect-file return; combined PDF contents; incomplete Regulatory review PCL printing; and Split-triggered verification reset.' = 'Verification testing shall cover B&S search and eligibility; compatible and incompatible source combinations; BAR creation and duplicate prevention; BAR/document access; line-clearance gating; printing-menu and queue eligibility; Label, Leaflet and Braille common controls; test/master checks; partial and extra quantities and reasons; Carton Issuing; Print Done gates; user/date attribution; route branching; Leaflet Folding completion; audit history; errors, corrections and reprints; and downstream handoff.'
        'Applicable SOPs, work instructions and training shall describe WSC PO entry and checklist generation, Team Lead Yes and No routes, RPi exception approval, Checklist decision acceptance, Packing List generation, mandatory and optional RPi documents, RPi Approval, combined PDF/email, incomplete Regulatory review PCL handling, Split reset and Goods-In Summary.' = 'Applicable SOPs, work instructions and training shall describe B&S Batch Add, BAR creation and verification, line clearance, the Printer menu and queues, Label/Leaflet/Braille common controls, test/master review, quantities and reasons, Carton Issuing, Leaflet Folding, controlled corrections, reprints and electronic sign-off.'
        'IT shall support PLPI access, configuration, queues, document upload and storage, RPi Pack Creation, PO merge/unmerge controls, PDF/email services, Goods-In Summary, audit retrieval, backup/recovery and incident resolution. Business, QA/RP and Operations shall own process decisions and controlled master data.' = 'IT shall support PLPI access, configuration, printer and device connectivity, document and artwork links, workflow queues, audit retrieval, backup/recovery and incident resolution. Business, QA/RP and Operations shall own process decisions, approved references, master data, exception decisions and controlled use.'
    }
    foreach ($pair in $nfsReplacements.GetEnumerator()) { Replace-AllStories $pair.Key $pair.Value }

    foreach ($toc in $doc.TablesOfContents) { $toc.Update() }
    $doc.Repaginate()
    foreach ($toc in $doc.TablesOfContents) { $toc.UpdatePageNumbers() }
    $doc.Save()
    $doc.Save()

    [PSCustomObject]@{
        Target = $target
        Pages = $doc.ComputeStatistics(2)
        Sections = $doc.Sections.Count
        Tables = $doc.Tables.Count
        TOC = (($doc.TablesOfContents.Item(1).Range.Text -replace '[\r\a]', ' / ').Trim())
        Saved = $doc.Saved
    } | Format-List
}
finally {
    if ($doc -ne $null) { $doc.Close(0) }
    if ($word -ne $null) { $word.Quit() }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
