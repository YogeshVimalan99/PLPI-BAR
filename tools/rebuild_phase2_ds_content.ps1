$ErrorActionPreference = 'Stop'

$template = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\docz\DS-PLPI BAR.docx'
$output = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding - Exact Template.docx'
$work = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\tmp_ds_exact_template\phase2-ds-content-working.docx'
$shotDir = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\tmp_phase2_ds_rebuild\screenshots'

Copy-Item -LiteralPath $template -Destination $work -Force

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
    $doc = $word.Documents.Open($work, $false, $false)
    try {
        # Retain the template cover and TOC, and remove only its original project body.
        $search = $doc.Range($doc.TablesOfContents.Item(1).Range.End, $doc.Content.End - 1)
        $find = $search.Find
        $find.ClearFormatting()
        if (-not $find.Execute('1. Introduction', $false, $false, $false, $false, $false, $true, 1, $false)) {
            throw 'The body start heading was not found in the reference template.'
        }
        $bodyStart = $search.Start
        $doc.Range($bodyStart, $doc.Content.End - 1).Delete()

        # Replace template project identifiers and approval metadata without changing layout.
        $all = $doc.Content.Find
        $all.ClearFormatting(); $all.Replacement.ClearFormatting()
        [void]$all.Execute('Ronex Pereira', $false, $false, $false, $false, $false, $true, 1, $false, 'Juston Rodrigues', 2)
        $all = $doc.Content.Find
        [void]$all.Execute('Rajesh Patel', $false, $false, $false, $false, $false, $true, 1, $false, 'Anthony Fernandes', 2)
        $all = $doc.Content.Find
        [void]$all.Execute('Quality Specialist / RP', $false, $false, $false, $false, $false, $true, 1, $false, 'QA', 2)
        $all = $doc.Content.Find
        [void]$all.Execute('Team Lead', $false, $false, $false, $false, $false, $true, 1, $false, 'Team Leader', 2)

        foreach ($section in @($doc.Sections)) {
            foreach ($header in @($section.Headers)) {
                if ($header.Exists) {
                    $f = $header.Range.Find
                    [void]$f.Execute('Design Specification: PLPI Batch Record Automation', $false, $false, $false, $false, $false, $true, 1, $false, 'Design Specification: PLPI Batch Record Automation Phase 2', 2)
                    $f = $header.Range.Find
                    [void]$f.Execute('DS/PLPI/PH1/v1.0', $false, $false, $false, $false, $false, $true, 1, $false, 'PLPI/BAR/DS/01/v1', 2)
                }
            }
            foreach ($footer in @($section.Footers)) {
                if ($footer.Exists) {
                    $f = $footer.Range.Find
                    [void]$f.Execute('DS/PLPI/PH1/v1.0', $false, $false, $false, $false, $false, $true, 1, $false, 'PLPI/BAR/DS/01/v1', 2)
                }
            }
        }

        $sel = $word.Selection
        $sel.SetRange($doc.Content.End - 1, $doc.Content.End - 1)

        function Add-Text([string]$style, [string]$text) {
            $sel.Style = $doc.Styles.Item($style)
            $sel.ParagraphFormat.Alignment = 0
            $sel.Font.Italic = 0
            if ($style -match '^Heading') { $sel.Font.Bold = -1 } else { $sel.Font.Bold = 0 }
            $sel.TypeText($text)
            $sel.TypeParagraph()
        }

        function Add-H1([string]$text) { Add-Text 'Heading 1' $text }
        function Add-H2([string]$text) { Add-Text 'Heading 2' $text }
        function Add-Body([string]$text) { Add-Text 'Body Text' $text }

        function Add-Figure([string]$file, [string]$caption) {
            $path = Join-Path $shotDir $file
            if (-not (Test-Path -LiteralPath $path)) { throw "Missing screenshot: $path" }
            $sel.Style = $doc.Styles.Item('Normal')
            $sel.ParagraphFormat.Alignment = 1
            $sel.ParagraphFormat.LineSpacingRule = 0
            $sel.ParagraphFormat.SpaceBefore = 6
            $sel.ParagraphFormat.SpaceAfter = 6
            $shape = $sel.InlineShapes.AddPicture($path, $false, $true)
            $shape.LockAspectRatio = -1
            $shape.Width = 442.8
            $sel.TypeParagraph()
            $sel.Style = $doc.Styles.Item('No Spacing')
            $sel.ParagraphFormat.Alignment = 1
            $sel.ParagraphFormat.LineSpacingRule = 0
            $sel.ParagraphFormat.SpaceBefore = 0
            $sel.ParagraphFormat.SpaceAfter = 8
            $sel.Font.Name = 'Verdana'
            $sel.Font.Size = 10
            $sel.Font.Color = 6299648
            $sel.Font.Italic = -1
            $sel.TypeText($caption)
            $sel.TypeParagraph()
            $sel.Font.Italic = 0
        }

        Add-H1 '1. Introduction'
        Add-Body 'PLPI Batch Record Automation Phase 2 extends the existing PLPI application from the completed Batch Checker outcome into B&S Batch Add, electronic BAR creation, the controlled printing activities and Leaflet Folding. Existing screens, fields and buttons remain unchanged where they are replicated; this document defines only the design changes, controlled behaviour and new records required for the approved Phase 2 process.'

        Add-H2 '1.1 Purpose of the Document'
        Add-Body 'This document defines the system design required to implement the approved Phase 2 URS and FS. It describes the screen presentation, source-data use, queue eligibility, button behaviour, electronic records, validations, audit events and route-controlled hand-offs for B&S Batch Add, BAR creation, Label Printing, Leaflet Printing, Carton Issuing, Braille Printing and Leaflet Folding.'

        Add-H2 '1.2 Scope'
        Add-Body 'The scope begins when an eligible completed batch becomes available in B&S Batch Add. It covers source-record search and selection, one controlled 13-page BAR, B&S line clearance and electronic sign-off, the common Printer menu and queues, the new common Print pop-up, route-specific label and leaflet printing, Carton Issuing for Reboxing, Braille Printing for applicable Relabelling, and final Leaflet Folding completion. The design retains authenticated user, role, date/time, quantities, decisions, reasons and previous status for each controlled event.'
        Add-Body 'Out of Scope: Goods-In, RPi, Batch Checker processing before the B&S Batch Add entry condition, and Pre-Assembly or later production stages after Leaflet Folding are outside this phase except for the defined inbound eligibility and outbound hand-off.'

        Add-H2 '1.3 Abbreviations'
        Add-Body 'These abbreviations are used throughout this document.'
        $abbr = @(
            @('IT','Information Technology'),
            @('URS','User Requirement Specification'),
            @('DS','Design Specification'),
            @('FS','Functional Specification'),
            @('PLPI','Parallel Import / PLPI workflow system'),
            @('B&S','B&S Batch Add / controlled batch identifier'),
            @('BAR','Batch Assembly Record'),
            @('PCL','Product Check Log'),
            @('ECMA','Approved product or artwork reference'),
            @('MFG','Manufacturing / manufacturer'),
            @('QA','Quality Assurance'),
            @('GMP','Good Manufacturing Practice'),
            @('PDF','Portable Document Format')
        )
        $tableRange = $doc.Range($doc.Content.End - 1, $doc.Content.End - 1)
        $tbl = $doc.Tables.Add($tableRange, $abbr.Count, 2)
        $tbl.Style = 'Table Grid'
        $tbl.AllowAutoFit = $false
        $tbl.Columns.Item(1).Width = 110
        $tbl.Columns.Item(2).Width = 335
        for ($i = 1; $i -le $abbr.Count; $i++) {
            $tbl.Cell($i,1).Range.Text = $abbr[$i-1][0]
            $tbl.Cell($i,2).Range.Text = $abbr[$i-1][1]
            foreach ($cell in @($tbl.Rows.Item($i).Cells)) {
                $cell.VerticalAlignment = 1
                $cell.Range.Font.Name = 'Verdana'
                $cell.Range.Font.Size = 10
                $cell.Range.Font.Color = 6299648
            }
        }
        $sel.SetRange($doc.Content.End - 1, $doc.Content.End - 1)
        $sel.TypeParagraph()

        Add-H1 '2. Overall Description'
        Add-Body 'Phase 2 uses the existing PLPI navigation and authenticated session. A completed upstream batch enters B&S Batch Add with its product, batch, expiry, quantity, regulatory and route information. The BAR user searches the queue, selects one eligible record or compatible records and confirms generation. PLPI creates one controlled BAR linked to every selected source record and prevents a second active BAR for the same controlled batch.'
        Add-Body 'The BAR user completes the three B&S line-clearance confirmations and selects User Sign Off. Successful sign-off locks the B&S clearance data, records the authenticated user and date/time, removes the batch from the active B&S Batch Add queue and creates the Label Printing work item. The approved Reboxing or Relabelling route determines the component rows and the later Carton Issuing or Braille Printing prerequisites.'
        Add-Body 'Label, Leaflet and Braille Printing use one common design for queue search, product information, controlled documents, the Print pop-up, print categories, quantities, reasons, line completion and final Print Done. Carton Issuing uses the same batch context and audit approach but records carton issue rather than a printer run. Leaflet Folding becomes available only when Leaflet Printing and every route-specific prerequisite are complete.'
        Add-Body 'Workflow control: Each action is enabled only when its mandatory data, previous activity and route condition are satisfied. A failed, cancelled or incomplete action does not advance the batch. PLPI retains the B&S batch, affected component or document, quantity, prior and new status, authenticated user, role, date/time and reason or comment for every controlled event.'
        Add-Body 'End-to-end design context: The following screen shows the existing PLPI module navigation used to enter B&S Batch Add, Printer and Leaflet Folding.'
        Add-Figure '00-module-launcher.png' 'Figure 1 - Existing PLPI module launcher and Phase 2 navigation context'
        Add-Body 'Queue separation: B&S Batch Add owns BAR generation and B&S sign-off. Printer owns Label Printing, Leaflet Printing, Carton Issuing and Braille Printing. Leaflet Folding is a separate final queue. The same batch identity is retained throughout; a user does not create a new batch record when opening a later module.'

        Add-H1 '3. Design Specification'
        Add-Body 'The following sections define the screen and workflow design that will be implemented to satisfy the approved Phase 2 URS and FS.'

        Add-H2 '3.1 B&S Batch Add and BAR Creation Module'
        Add-Body 'The existing B&S Batch Add screen remains the Phase 2 entry point. Country, Site, Category, Stock, Status and Batch_No filter the existing source grid. Search refreshes the displayed records without changing their source data. The complete existing result columns remain visible, including product status, site, country, part and product identifiers, foreign name, ECMA, strength, pack size, B&S batch number, expiry, quantity, invoice, warehouse, supplier, licence, manufacturing, category, regulatory and workflow values.'
        Add-Figure '01-bs-batch-add.png' 'Figure 2 - B&S Batch Add search controls, eligible source grid, totals and BAR actions'
        Add-Body 'Callout 1 - Search criteria. Country, Site, Category, Stock, Status and Batch_No are existing controls. Status is extended to distinguish records with no generated BAR from records for which the controlled BAR has been created.'
        Add-Body 'Callout 2 - Source-record grid. The grid continues to display the existing batch and product information. Phase 2 adds controlled row selection; selection does not edit the source values.'
        Add-Body 'Callout 3 - Select. One eligible row may be selected. More than one row may be selected only when the product, controlled batch and expiry information is compatible for one BAR. PLPI identifies the conflicting records when this rule is not met.'
        Add-Body 'Callout 4 - Totals and status indicators. Total BNS Batch, Total Composite Batch, Total Packs and Not Printed BAR are calculated from the current result and are refreshed with the search.'
        Add-Body 'Callout 5 - Generate BAR. This existing action is enhanced to validate the selection and open the generation confirmation. It does not create a BAR until the user confirms the action.'
        Add-Body 'Callout 6 - Print Batch Details. This existing action continues to open the applicable batch-detail output and records a print event when printing succeeds.'

        Add-Figure '02-bs-batch-in-transit-warning.png' 'Figure 3 - Related Batch In Transit warning with Order No., Quantity and Yes or No decision'
        Add-Body 'Callout 1 - In-transit validation. When another related batch is in transit, PLPI displays the affected order number and quantity before BAR generation continues.'
        Add-Body 'Callout 2 - Yes. Yes records the decision against the pending generation request and continues to the final BAR confirmation.'
        Add-Body 'Callout 3 - No. No closes the warning and leaves the selected records unchanged with no BAR created.'

        Add-Figure '03-generate-bar-confirmation.png' 'Figure 4 - Final Generate BAR confirmation for the selected B&S batch'
        Add-Body 'Callout 1 - Selected-batch identity. The confirmation shows the B&S batch or selected compatible set to which the new BAR will be linked.'
        Add-Body 'Callout 2 - Yes. Yes performs a final duplicate and eligibility check, creates one BAR and records the creator and date/time.'
        Add-Body 'Callout 3 - No. No returns to B&S Batch Add without creating, reserving or changing a BAR record.'

        Add-Figure '05-generated-bar-preview.png' 'Figure 5 - Controlled 13-page generated BAR preview'
        Add-Body 'Callout 1 - BAR cover. The cover is populated from the confirmed batch record and contains the controlled B&S Batch Number, product name, foreign name, strength, pack size, ECMA, PL number, units per pack, country of origin, product-introduced date, leaflet date, date revised, expiry and variation information where applicable.'
        Add-Body 'Callout 2 - Controlled page set. The BAR contains 13 numbered pages for the cover, B&S line clearance, Label Printing, Leaflet Printing, label evidence, Braille Printing, Leaflet Folding, Carton Issuing, configured downstream placeholders and the BAR audit history.'
        Add-Body 'Callout 3 - Reboxing attachment. A completed Change of Pack Size form is linked as an unnumbered route-specific attachment and does not alter the numbered BAR page count.'
        Add-Body 'Callout 4 - View and print. View Generated BAR opens the current controlled version read-only. Print Generated BAR records the user, date/time and print outcome; a failed or cancelled print does not record success.'

        Add-Figure '04-bar-line-clearance.png' 'Figure 6 - BAR Generated screen and B&S electronic line-clearance controls'
        Add-Body 'Callout 1 - Product and BAR identity. The header is populated from the generated BAR and remains read-only during clearance.'
        Add-Body 'Callout 2 - PCL completeness and invoice. The first electronic check confirms that the PCL is complete and the source invoice is attached.'
        Add-Body 'Callout 3 - Batch and expiry. The second check confirms that the displayed batch number and expiry date are correct.'
        Add-Body 'Callout 4 - Product, pack and reference. The third check confirms product name, strength, pack size and ECMA against the approved record.'
        Add-Body 'Callout 5 - Comments. Comments retain relevant clearance or exception context and remain part of the BAR history.'
        Add-Body 'Callout 6 - BAR Created By and Created Date/Time. These values come from the authenticated generation event and cannot be replaced with free text.'
        Add-Body 'Callout 7 - User Sign Off. The action remains disabled until all three mandatory checks are selected. Successful sign-off records the current user and date/time, locks the clearance record and transfers the batch to Label Printing.'
        Add-Body 'Detailed design sequence:'
        Add-Body 'Step 1 - The authorised user enters the required existing filters and selects Search. PLPI returns only batches satisfying the current upstream eligibility condition.'
        Add-Body 'Step 2 - The user selects one eligible record or compatible records. PLPI validates product, batch, expiry, duplicate BAR and completion status.'
        Add-Body 'Step 3 - If related stock is in transit, PLPI shows the Order No. and Quantity warning. No cancels the request; Yes continues.'
        Add-Body 'Step 4 - The user confirms Generate BAR. PLPI creates one populated BAR, links every selected source record and records BAR Created By and Created Date/Time.'
        Add-Body 'Step 5 - The user may view or print the generated BAR and completes the three B&S line-clearance checks with comments where required.'
        Add-Body 'Step 6 - User Sign Off validates the mandatory checks, records the authenticated completion event, locks the B&S page and creates the Label Printing queue entry.'
        Add-Body 'Validation and error handling: Generate BAR is blocked when no record is selected, selected records are incompatible, a source record is no longer eligible or an active BAR already exists. View and Print Generated BAR are unavailable before successful creation. A generation or print failure leaves the prior status unchanged. User Sign Off cannot be repeated through the normal workflow.'
        Add-Body 'Entry condition: An upstream-complete eligible batch is available in B&S Batch Add. Exit condition: One controlled BAR exists and the completed B&S clearance has released the batch to Label Printing.'
        Add-Body 'URS traceability: URS 4.1.2 - 4.1.7. FS traceability: FS 3.1.'

        Add-H2 '3.2 Printing Module - Common Controls'
        Add-Figure '06-printer-menu.png' 'Figure 7 - Common Printer menu for Label Printing, Leaflet Printing, Carton Issuing and Braille Printing'
        Add-Body 'The existing Printer menu is retained as the common entry point. Each tile opens its own route-controlled queue; the menu does not allow the user to bypass an incomplete preceding stage.'
        Add-Body 'Callout 1 - Label Printing. Opens BAR-signed batches waiting for route-derived label printing.'
        Add-Body 'Callout 2 - Leaflet Printing. Opens batches that completed Label Printing and require leaflet activity.'
        Add-Body 'Callout 3 - Carton Issuing. Opens Reboxing batches after Leaflet Printing.'
        Add-Body 'Callout 4 - Braille Printing. Opens Relabelling batches for which braille is required after Leaflet Printing.'
        Add-Body 'Callout 5 - Active and In Progress counts. These new calculated indicators show the workload currently eligible in each queue. Counts are refreshed from workflow status rather than entered by the user.'
        Add-Body 'Common queue design: B&S Batch Number and MFG Lot No. are existing search fields and Search refreshes the queue. The existing queue layout displays B&S Batch Number, MFG Lot No., Product Name, Strength, Pack Size, ECMA, Expiry Date, the module-specific Required Qty and the calculated Status. Opening a row displays the common Product Information, Batch Documents and Continuation Page panels.'
        Add-Body 'Common detail design: Product Information is read-only and includes product and foreign name, strength, country of origin, pack size, units per pack, B&S batch, MFG lot, ECMA, PL number, expiry, quantity, product-introduced date, leaflet date and date revised. Batch Documents provides controlled access to carton, peel, braille and mock-up artwork, the BAR and generated BAR. The continuation panel provides the label attachment, BAR continuation, cold-chain page and the Change of Pack Size attachment when the route is Reboxing.'
        Add-Body 'Back to Batch Queue is an existing control. It returns to the owning queue without completing the stage or discarding already successful audited actions.'

        Add-H2 '3.2.1 Unified Print Pop-up'
        Add-Figure '11-print-dialog-default.png' 'Figure 8 - New common Print pop-up in its initial state'
        Add-Body 'The complete Print pop-up is new functionality and is shared by Label, Leaflet and Braille Printing. It is bound to the selected component line; changing the underlying queue selection is not permitted while the pop-up is open.'
        Add-Body 'Callout 1 - Quantity Needed. This new read-only field displays the approved quantity held against the selected line.'
        Add-Body 'Callout 2 - Quantity to Print. This new entry field accepts a positive whole number. Blank, zero, negative, decimal and non-numeric values are rejected.'
        Add-Body 'Callout 3 - Category. This new controlled selection contains Test Print, Actually Print and Extra Print.'
        Add-Body 'Callout 4 - Reason. This new field remains disabled for Test Print and Actually Print. It is enabled and mandatory when Extra Print is selected.'
        Add-Body 'Callout 5 - Preview. The lower area displays the controlled component, reference, pack information, batch and expiry context used for the requested print.'
        Add-Body 'Callout 6 - Print. This new dialog button submits the selected quantity and category only after validation. PLPI records the component line, needed quantity, printed quantity, category, reason where applicable, user, role, date/time and outcome.'
        Add-Body 'Callout 7 - Close. Close exits the pop-up without creating a print event. Values not submitted are discarded.'

        Add-Figure '12-print-dialog-extra.png' 'Figure 9 - New common Print pop-up with Extra Print and mandatory reason'
        Add-Body 'Callout 1 - Extra Print selection. Selecting Extra Print changes Reason from disabled to mandatory and does not alter the approved Quantity Needed.'
        Add-Body 'Callout 2 - Controlled reasons. Values include Print damage, Line setup waste, Reconciliation correction, Printing alignment check and Supervisor approved extra.'
        Add-Body 'Callout 3 - Additional quantity. The extra quantity is recorded as a separate print event and does not overwrite the first actual-print quantity or the original line completion.'
        Add-Body 'Common completion control: A successful print event and line completion are separate actions. Mark as Done or Done records the authenticated completing user and date/time. Print Done remains disabled until every mandatory component line in the current module is Done.'
        Add-Body 'Detailed common printing sequence:'
        Add-Body 'Step 1 - The authorised user opens a Printer queue, searches by B&S Batch Number or MFG Lot No. and opens an eligible batch.'
        Add-Body 'Step 2 - PLPI displays the common read-only product and controlled-document context and the route-derived component rows for that module.'
        Add-Body 'Step 3 - The user selects Print on a component row. PLPI opens the new pop-up with Quantity Needed and preview context populated from that row.'
        Add-Body 'Step 4 - The user enters Quantity to Print and selects Test Print, Actually Print or Extra Print. Extra Print also requires a controlled reason.'
        Add-Body 'Step 5 - Print validates the request and records the outcome. A cancelled or failed request leaves the printed quantity and line status unchanged.'
        Add-Body 'Step 6 - When the module-specific completion gate is met, the user completes the line. PLPI displays Done with Completed By and Date/Time.'
        Add-Body 'Step 7 - After every mandatory row is Done, Print Done completes the module and evaluates the approved route for the next queue.'
        Add-Body 'Validation and error handling: A queue row is not displayed before its preceding stage is complete. Print cannot submit an invalid quantity or an Extra Print without a reason. A print failure is retained as an unsuccessful event and does not enable completion. Print Done cannot be used to bypass an incomplete line.'
        Add-Body 'URS traceability: URS 4.2.1 - 4.2.3, 4.2.5 and 4.2.8. FS traceability: FS 3.2.'

        Add-H2 '3.3 Label Printing Module'
        Add-Figure '07-label-printing-list.png' 'Figure 10 - Label Printing queue with common search fields and controlled batch status'
        Add-Body 'Callout 1 - Queue eligibility. A batch appears only after the BAR user has completed B&S User Sign Off. Opening or printing the BAR without sign-off does not create this queue entry.'
        Add-Body 'Callout 2 - Search. B&S Batch Number and MFG Lot No. retain the common existing behaviour and filter the current eligible queue.'
        Add-Body 'Callout 3 - Result columns. The existing batch, product, pack, ECMA, expiry and quantity columns are displayed read-only. Status is calculated from the Label Printing work item.'

        Add-Figure '10-label-printing-standard-detail.png' 'Figure 11 - Label Printing detail and route-derived Labels to Print table'
        Add-Body 'Callout 1 - Product and controlled documents. The common panels display the batch context and approved artwork or BAR documents without allowing uncontrolled amendment.'
        Add-Body 'Callout 2 - Labels to Print. PLPI derives the component rows from Category. Relabelling displays Blister / Pack Label and Obscure Label. Reboxing displays Carton Label, End of Pack Label and Security Seals.'
        Add-Body 'Callout 3 - Reference, Size and Quantity. Values are populated from the approved component data. Security Seals use the controlled seal reference and quantity; applicable label sizes use the approved pack size or Standard.'
        Add-Body 'Callout 4 - Location and In Hand Quantity. Existing stock values are shown for operational confirmation before the print request.'
        Add-Body 'Callout 5 - Print and Line Completion. Print opens the new common pop-up. After the required print evidence exists, Mark as Done records the line completion and displays the completing user/date-time.'

        Add-Figure '08-label-printing-reboxing-detail.png' 'Figure 12 - Reboxing Label Printing detail with Change of Pack Size prerequisite'
        Add-Body 'Callout 1 - Change of Pack Size. This existing Reboxing form is represented electronically and is linked to the same controlled batch.'
        Add-Body 'Callout 2 - Received As. The received packaging configuration and its electronic sign-off must be complete before any Reboxing label Print button is enabled.'
        Add-Body 'Callout 3 - Assembled As. The target configuration and its electronic sign-off must also be complete before printing begins.'
        Add-Body 'Callout 4 - Print gate. PLPI displays the prerequisite state and keeps printing disabled until both sections are signed. Once printing starts, the supporting record is retained as the controlled source and cannot be silently amended.'
        Add-Body 'Detailed label sequence:'
        Add-Body 'Step 1 - The user opens the BAR-signed batch and reviews the common product, artwork, BAR and continuation documents.'
        Add-Body 'Step 2 - PLPI builds only the component rows required for the Reboxing or Relabelling route.'
        Add-Body 'Step 3 - For Reboxing, PLPI validates both Change of Pack Size sign-offs before enabling any Print action.'
        Add-Body 'Step 4 - For each row, the user reviews reference, size, quantity, location and stock, then records the required test, actual or extra print through the common pop-up.'
        Add-Body 'Step 5 - When the required quantity and applicable print sequence are satisfied, the user marks the line Done. PLPI records user/date-time and prevents the original completion from being overwritten by later extra prints.'
        Add-Body 'Step 6 - Print Done becomes available only after every displayed route-derived label line is Done and sends a leaflet-required batch to Leaflet Printing.'
        Add-Body 'Validation and error handling: A Reboxing batch cannot print before both Change of Pack Size sign-offs. A line cannot complete without the required quantity and print evidence. Print Done is blocked while any required row is pending. Additional authorised prints remain separate audited events.'
        Add-Body 'Entry condition: B&S User Sign Off is complete. Exit condition: Every route-derived label line is Done and Label Printing has been completed.'
        Add-Body 'URS traceability: URS 4.2.4, 4.2.5 and 4.2.8. FS traceability: FS 3.3.'

        Add-H2 '3.4 Leaflet Printing Module'
        Add-Figure '13-leaflet-printing-list.png' 'Figure 13 - Leaflet Printing queue for eligible label-complete batches'
        Add-Body 'Callout 1 - Queue eligibility. Only a leaflet-required batch that completed Label Printing appears. The queue retains the common search fields, product columns and calculated status.'
        Add-Body 'Callout 2 - Route context. Reboxing and Relabelling remain identifiable so PLPI can select Carton Issuing, Braille Printing or Leaflet Folding after completion.'

        Add-Figure '14-leaflet-printing-detail.png' 'Figure 14 - Leaflet Printing detail, controlled leaflet access and completion row'
        Add-Body 'Callout 1 - Leaflets to Print. Each required leaflet line displays the approved reference, leaflet size, required quantity and location.'
        Add-Body 'Callout 2 - Print. Selecting Print opens the controlled leaflet PDF or preview and records the opening user/date-time before applying the common print quantity and category controls.'
        Add-Body 'Callout 3 - Test or master review. Where the route requires a test or master check, the acceptance or rejection result is retained. Rejected evidence remains available as exception history.'
        Add-Body 'Callout 4 - Mark as Done. This action remains disabled until an Actually Print event exists for the selected leaflet line. Test Print alone cannot complete the line.'
        Add-Body 'Callout 5 - Completed By and Date. Successful completion records the authenticated user and timestamp against the leaflet row.'
        Add-Body 'Detailed leaflet sequence:'
        Add-Body 'Step 1 - The user opens a Label Printing-complete batch and reviews the common product, BAR and controlled leaflet context.'
        Add-Body 'Step 2 - Print opens the approved controlled leaflet file and the new common print controls for the selected line.'
        Add-Body 'Step 3 - The user performs the required test or master review, then records the required Actually Print quantity. Extra Print requires a reason and remains a separate event.'
        Add-Body 'Step 4 - Mark as Done becomes available after the actual-print gate is met. PLPI records the line completion user/date-time.'
        Add-Body 'Step 5 - Print Done completes Leaflet Printing after all leaflet rows are Done. Reboxing routes to Carton Issuing. Relabelling with braille required routes to Braille Printing. Other eligible batches route to Leaflet Folding.'
        Add-Body 'Validation and error handling: A batch cannot enter before Label Printing completion. An unavailable approved leaflet prevents the print action. Mark as Done is blocked without an actual print. Print Done is blocked while a row is pending or required test/master evidence is unresolved.'
        Add-Body 'Entry condition: Label Printing is complete and a leaflet is required. Exit condition: Every leaflet line is Done and the batch is routed to its required preparation stage.'
        Add-Body 'URS traceability: URS 4.2.5, 4.2.6 and 4.2.8. FS traceability: FS 3.4.'

        Add-H2 '3.5 Carton Issuing Module'
        Add-Figure '15-carton-issuing-list.png' 'Figure 15 - Carton Issuing queue for eligible Reboxing batches'
        Add-Body 'Callout 1 - Eligibility. The queue contains only Reboxing batches that completed Leaflet Printing. Relabelling batches never enter Carton Issuing.'
        Add-Body 'Callout 2 - Common queue context. Search, product details, ECMA, expiry, quantity and status follow the common Printer design.'

        Add-Figure '16-carton-issuing-detail.png' 'Figure 16 - Carton Issuing detail before the required issue is confirmed'
        Add-Body 'Callout 1 - Carton to Issue. One controlled row displays the carton reference, Required Qty, On Hand Quantity and Location Number.'
        Add-Body 'Callout 2 - Confirmed By. Before completion this field displays Pending confirmation; it is not a free-text user field.'
        Add-Body 'Callout 3 - Done. The existing action is enhanced to confirm the required normal issue once, record the authenticated user/date-time and change the completion count from 0/1 to 1/1.'
        Add-Body 'Callout 4 - Extra. Issue Extra remains disabled until the required normal issue is confirmed.'

        Add-Figure '17-carton-issuing-confirmed.png' 'Figure 17 - Carton Issuing detail after Done records the confirming user and date/time'
        Add-Body 'Callout 1 - Completed normal issue. The row shows the retained required quantity and the confirming user/date-time. Done is no longer available for a duplicate normal issue.'
        Add-Body 'Callout 2 - Completion count. The calculated value 1/1 confirms the single required issue has completed.'
        Add-Body 'Callout 3 - Issue Extra enabled. An authorised additional issue may now be recorded without changing the original normal issue.'

        Add-Figure '18-carton-issue-extra-dialog.png' 'Figure 18 - Issue Extra dialog with mandatory quantity and controlled reason'
        Add-Body 'Callout 1 - Extra Quantity. A positive whole number is mandatory and is recorded separately from Required Qty.'
        Add-Body 'Callout 2 - Reason for Extra. A controlled reason is mandatory before Confirm is enabled.'
        Add-Body 'Callout 3 - Confirm. Successful confirmation records quantity, reason, user and date/time. Closing the dialog creates no issue event.'
        Add-Body 'Detailed carton sequence:'
        Add-Body 'Step 1 - The authorised user opens a Reboxing batch after Leaflet Printing and reviews its common product and document context.'
        Add-Body 'Step 2 - The user confirms the carton reference, Required Qty, On Hand Quantity and Location Number.'
        Add-Body 'Step 3 - Done records the required issue once, displays the user/date-time and changes completion to 1/1.'
        Add-Body 'Step 4 - If additional cartons are authorised, Issue Extra opens the controlled dialog. The user enters quantity and reason and confirms the separate issue event.'
        Add-Body 'Step 5 - The completed normal issue satisfies the Carton Issuing prerequisite used by Leaflet Folding eligibility.'
        Add-Body 'Validation and error handling: Done cannot create a duplicate normal issue. Issue Extra is blocked before normal completion and rejects blank, zero, negative, decimal or non-numeric quantity and a missing reason. A failed confirmation does not change stock or completion state.'
        Add-Body 'Entry condition: A Reboxing batch completed Leaflet Printing. Exit condition: The required carton issue is complete and the route prerequisite for Leaflet Folding is satisfied.'
        Add-Body 'URS traceability: URS 4.2.6 - 4.2.8. FS traceability: FS 3.5.'

        Add-H2 '3.6 Braille Printing Module'
        Add-Figure '19-braille-printing-list.png' 'Figure 19 - Braille Printing queue for eligible Relabelling batches'
        Add-Body 'Callout 1 - Eligibility. Only Relabelling batches that completed Leaflet Printing and are flagged as requiring braille appear.'
        Add-Body 'Callout 2 - Common search and status. The module retains the common B&S Batch Number, MFG Lot No., result columns and calculated workflow status.'

        Add-Figure '20-braille-printing-detail.png' 'Figure 20 - Braille Printing detail and mandatory component rows'
        Add-Body 'Callout 1 - Braille Labels to Print. The table includes the Braille Label and the Braille Declaration Copy where configured.'
        Add-Body 'Callout 2 - Reference and Size. The label uses the approved ECMA and pack size. The declaration uses PL No. and Master copy.'
        Add-Body 'Callout 3 - Quantity. The approved braille quantity is shown for the label; the declaration copy quantity is one.'
        Add-Body 'Callout 4 - Print. Each row uses the same new Print pop-up and Test Print, Actually Print and Extra Print rules defined in section 3.2.1.'
        Add-Body 'Callout 5 - Line Completion. Mark as Done becomes available only after the required printed quantity is satisfied. Done records the completing user/date-time.'
        Add-Body 'Detailed braille sequence:'
        Add-Body 'Step 1 - The user opens an eligible braille-required Relabelling batch and reviews the common product, BAR and artwork documents.'
        Add-Body 'Step 2 - PLPI displays each configured Braille Label and declaration row with its approved reference, size, quantity, location and stock.'
        Add-Body 'Step 3 - The user performs the required test and actual prints through the common pop-up. Extra Print requires a controlled reason.'
        Add-Body 'Step 4 - The user marks each row Done after the required quantity is printed. PLPI records line-level attribution.'
        Add-Body 'Step 5 - Print Done becomes available after every displayed row is Done and satisfies the Braille Printing prerequisite for Leaflet Folding.'
        Add-Body 'Validation and error handling: A non-braille or incomplete Leaflet Printing batch cannot enter the queue. A mandatory declaration row cannot be omitted. A line cannot complete before its required quantity. Print Done cannot complete a partially printed set.'
        Add-Body 'Entry condition: An applicable Relabelling batch completed Leaflet Printing and requires braille. Exit condition: Every required braille row is Done.'
        Add-Body 'URS traceability: URS 4.2.5 - 4.2.8. FS traceability: FS 3.6.'

        Add-H2 '3.7 Leaflet Folding Module'
        Add-Figure '21-leaflet-folding-list.png' 'Figure 21 - Leaflet Folding queue with Active and Completed records'
        Add-Body 'Leaflet Folding is separate from Printer and uses the existing B&S Batch Number, MFG Lot No. and Search controls. The queue displays batch, product, strength, pack size, ECMA, expiry, Required Qty and calculated Status.'
        Add-Body 'Callout 1 - Route eligibility. Leaflet Printing completion alone is not sufficient. Reboxing also requires Carton Issuing. Relabelling with braille required also requires Braille Printing. Relabelling without braille may enter after Leaflet Printing.'
        Add-Body 'Callout 2 - Active and completed presentation. An active row opens the folding detail. A completed row remains available for controlled history and cannot be completed again through the normal flow.'

        Add-Figure '22-leaflet-folding-detail.png' 'Figure 22 - Leaflet Folding detail before confirmation'
        Add-Body 'Callout 1 - Product and document context. The common read-only Product Information and controlled-document panels are displayed for batch confirmation.'
        Add-Body 'Callout 2 - Leaflet Reference and Leaflet Size. These existing values identify the approved leaflet and format to be folded.'
        Add-Body 'Callout 3 - Required Qty and On Hand Quantity. The user verifies the required folding quantity against the available leaflet quantity.'
        Add-Body 'Callout 4 - Folded By and Date/Time. These new audit fields display Pending confirmation before completion and are populated from the authenticated event.'
        Add-Body 'Callout 5 - Done. The existing action is enhanced to record the folded quantity, user and date/time, update the BAR history, remove the row from the active queue and hand the batch to the next configured stage.'

        Add-Figure '23-leaflet-folding-completed.png' 'Figure 23 - Leaflet Folding completed state with user and date/time attribution'
        Add-Body 'Callout 1 - Completed identity. The approved leaflet reference, size and quantities remain visible after completion.'
        Add-Body 'Callout 2 - Completion attribution. Folded By and Date/Time show the authenticated completion and cannot be overwritten by opening the record again.'
        Add-Body 'Callout 3 - Single-use completion. Done is no longer available after success. Any authorised correction must use the controlled exception process and retain the original completion event.'
        Add-Body 'Detailed folding sequence:'
        Add-Body 'Step 1 - PLPI evaluates the batch route. Reboxing requires Leaflet Printing and Carton Issuing; braille-required Relabelling requires Leaflet Printing and Braille Printing; other eligible Relabelling requires Leaflet Printing.'
        Add-Body 'Step 2 - The user searches the eligible queue and opens the required batch without creating a second folding record.'
        Add-Body 'Step 3 - The user reviews the common batch documents and verifies Leaflet Reference, Leaflet Size, Required Qty and On Hand Quantity.'
        Add-Body 'Step 4 - Done validates the current eligibility and quantity, records Folded By and Date/Time and writes the event to the BAR and audit history.'
        Add-Body 'Step 5 - PLPI removes the record from the active queue, retains it as completed and hands the batch to Pre-Assembly or the configured next stage.'
        Add-Body 'Validation and error handling: A batch is excluded until all route prerequisites are complete. Done is blocked when the batch identity, leaflet reference or required quantity is invalid or the record has already completed. A failed completion leaves the batch active and does not create a hand-off.'
        Add-Body 'Entry condition: Leaflet Printing and all route-required Carton or Braille activity are complete. Exit condition: Leaflet Folding is completed once with user/date-time attribution and the batch is handed to the configured next stage.'
        Add-Body 'URS traceability: URS 4.3.1 - 4.3.6. FS traceability: FS 3.7.'

        Add-H2 '3.8 Workflow Status, Corrections and Audit Behaviour'
        Add-Body 'Status control: The current stage is calculated from successful controlled events. Opening a screen, viewing a document or cancelling an action does not advance the batch.'
        Add-Body 'Step 1 - Eligible for BAR. The upstream-complete record is visible in B&S Batch Add and has no active controlled BAR.'
        Add-Body 'Step 2 - BAR Generated. One 13-page BAR is linked to the selected source records; B&S line clearance remains pending.'
        Add-Body 'Step 3 - Ready for Label Printing. All three B&S checks and User Sign Off are complete.'
        Add-Body 'Step 4 - Label Printing In Progress or Complete. Route-derived label rows are printed and completed; Reboxing also retains the signed Change of Pack Size record.'
        Add-Body 'Step 5 - Leaflet Printing In Progress or Complete. Required leaflet rows and actual-print evidence are complete.'
        Add-Body 'Step 6 - Route preparation. Reboxing completes Carton Issuing. Braille-required Relabelling completes Braille Printing. Other eligible Relabelling has no additional Printer prerequisite.'
        Add-Body 'Step 7 - Ready for Leaflet Folding. PLPI has confirmed Leaflet Printing and every applicable route-specific prerequisite.'
        Add-Body 'Step 8 - Leaflet Folding Complete. The quantity and authenticated completion are retained and the batch is handed to the configured next stage.'
        Add-Body 'Correction control: A cancelled action leaves the current status unchanged. A failed print or issue cannot record success. Extra Print and Issue Extra add separate auditable events. Completed normal actions are not overwritten; authorised correction or reversal records the previous state, reason, user and date/time before the applicable activity is repeated.'
        Add-Body 'Audit content: Each controlled event retains the B&S Batch Number, MFG Lot No. where applicable, module, component or document, required and action quantity, category, reason or comment, previous and new status, authenticated user, role, date/time and technical outcome. The BAR audit page presents these events in recorded sequence.'

        Add-H1 '4. Additional Non-Functional Requirements'
        Add-H2 '4.1 Audit Trail'
        Add-Body 'PLPI shall retain successful and unsuccessful controlled events for BAR generation, BAR viewing/printing, B&S sign-off, document opening, test/actual/extra print, line completion, Print Done, normal/extra carton issue, Leaflet Folding completion, correction and routing. Audit records shall not be replaced by the latest status.'
        Add-H2 '4.2 Availability'
        Add-Body 'Phase 2 functions shall operate within the existing PLPI service availability and approved maintenance arrangements. An unavailable dependent document, printer or service shall not be represented as a successful action.'
        Add-H2 '4.3 Capacity Limits'
        Add-Body 'Search results, queue counts, BAR records, component rows, print histories and audit events shall support the operational volumes configured for PLPI. Where a configured limit is reached, the user shall receive a controlled message and the current record shall remain recoverable.'
        Add-H2 '4.4 Performance'
        Add-Body 'Search, queue opening, validation and status refresh shall respond within the existing PLPI performance expectation. BAR and controlled document generation may take longer but shall display a clear in-progress state and prevent duplicate submission.'
        Add-H2 '4.5 Recoverability'
        Add-Body 'A failed generation, print, issue or completion shall retain the last confirmed state and enough diagnostic information for controlled retry. Retry shall not duplicate a successful BAR, line completion, normal carton issue or Leaflet Folding completion.'
        Add-H2 '4.6 Security Requirements'
        Add-Body 'Access shall use authenticated PLPI roles. Users shall see only authorised modules and queues. System-populated identity and date/time fields shall not be editable. Controlled completion and sign-off actions shall use the authenticated session.'
        Add-H2 '4.7 Error Handling'
        Add-Body 'Validation messages shall identify the affected batch, component or field and explain the action required. Errors shall not clear successful prior work or move the batch to the next stage. Technical details required by support shall be retained without exposing sensitive information to an operational user.'
        Add-H2 '4.8 Usability'
        Add-Body 'Existing screen labels, navigation and familiar controls shall be retained where practical. Common printing controls shall use consistent names, order and behaviour across Label, Leaflet and Braille Printing. New and conditional controls shall be enabled only when they can be used.'
        Add-H2 '4.9 Accuracy and Validity'
        Add-Body 'Read-only batch, product, artwork, quantity and route values shall be populated from the current controlled source record. Before a state-changing action, PLPI shall revalidate eligibility and current version so stale screen data cannot complete the wrong batch or component.'

        # Refresh page layout and fields after the new body is complete.
        foreach ($toc in @($doc.TablesOfContents)) { [void]$toc.Update() }
        $doc.Repaginate()
        $doc.Save()
        $doc.SaveAs2($output, 16)
        Write-Output ('CREATED|pages=' + $doc.ComputeStatistics(2) + '|tables=' + $doc.Tables.Count + '|images=' + $doc.InlineShapes.Count + '|toc=' + $doc.TablesOfContents.Count)
    }
    finally {
        $doc.Close(-1)
    }
}
finally {
    $word.Quit()
}
