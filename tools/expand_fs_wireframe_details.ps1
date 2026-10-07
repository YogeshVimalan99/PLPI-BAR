$ErrorActionPreference = 'Stop'

$source = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\Project Doc\FS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'
$working = 'C:\tmp\FS-PLPI-BAR-expanded-working.docx'

Copy-Item -LiteralPath $source -Destination $working -Force

$modules = @(
    [ordered]@{
        Index = 6
        Inputs = @(
            @('Country', 'Existing field', 'Search filter replicated from the current B&S Batch Add screen. Filters eligible records by country.'),
            @('Site', 'Existing field', 'Search filter replicated from the current screen. Filters eligible records by processing site.'),
            @('Category', 'Existing field', 'Search filter replicated from the current screen. Values include Reboxing and Relabelling.'),
            @('Stock', 'Existing field', 'Existing stock filter retained on the search panel.'),
            @('Status', 'Existing field - updated values', 'Filters the grid by All, Not Printed BAR or Printed BAR status.'),
            @('Batch_No', 'Existing field', 'Existing batch-number search field used to locate a B&S batch.'),
            @('Search', 'Existing button', 'Applies the entered search criteria and refreshes the B&S Batch Add table.'),
            @('B&S Batch Add table', 'Existing table - updated function', 'Displays eligible source records and supports controlled row selection for BAR generation.'),
            @('Select', 'Existing table control - updated function', 'Checkbox used to select one or more compatible source rows. Incompatible product, batch or expiry combinations shall be rejected.'),
            @('Product Status', 'Existing table field', 'Displays the current product or batch status.'),
            @('Site', 'Existing table field', 'Displays the processing site.'),
            @('Country', 'Existing table field', 'Displays the product country.'),
            @('Part No.', 'Existing table field', 'Displays the existing product/component part number.'),
            @('Foreign Name', 'Existing table field', 'Displays the foreign product name.'),
            @('ECMA', 'Existing table field', 'Displays the approved ECMA/reference value.'),
            @('Strength', 'Existing table field', 'Displays the product strength.'),
            @('Pack Size', 'Existing table field', 'Displays the approved pack size.'),
            @('B&S Batch Number', 'Existing table field', 'Displays the controlled B&S batch identifier.'),
            @('Expiry Date', 'Existing table field', 'Displays the batch expiry date.'),
            @('Quantity', 'Existing table field', 'Displays the available/required batch quantity.'),
            @('IMP', 'Existing table field', 'Displays the current IMP indicator/value.'),
            @('Invoice', 'Existing table field', 'Displays the source invoice reference.'),
            @('Description', 'Existing table field', 'Displays the existing product description.'),
            @('Warehouse', 'Existing table field', 'Displays the source warehouse/location.'),
            @('Supplier', 'Existing table field', 'Displays the supplier associated with the record.'),
            @('PL No.', 'Existing table field', 'Displays the product licence number.'),
            @('Product ID', 'Existing table field', 'Displays the existing product identifier.'),
            @('MFG ID', 'Existing table field', 'Displays the manufacturing identifier.'),
            @('Action Count', 'Existing table field', 'Displays the current action count held against the record.'),
            @('OBJID', 'Existing table field', 'Displays the existing system object identifier.'),
            @('SPL Flag', 'Existing table field', 'Displays the existing SPL flag.'),
            @('Category', 'Existing table field', 'Displays the Reboxing or Relabelling route.'),
            @('Stock', 'Existing table field', 'Displays the existing stock value.'),
            @('Regulatory', 'Existing table field', 'Displays the existing regulatory status/value.'),
            @('Workflow Implemented', 'Existing table field', 'Displays whether the applicable workflow has been implemented.'),
            @('Legal Category', 'Existing table field', 'Displays the existing legal category.'),
            @('Generate BAR', 'Existing button - updated function', 'Replicated current-system action enhanced to create one populated controlled electronic BAR from the confirmed eligible selection.'),
            @('Print Batch Details', 'Existing button', 'Opens the selected batch-detail output for controlled printing.'),
            @('Total BNS Batch', 'Existing indicator', 'Displays the total number of B&S batches in the current result/context.'),
            @('Total Composite Batch', 'Existing indicator', 'Displays the total number of composite batches.'),
            @('Total Packs', 'Existing indicator', 'Displays the total pack quantity.'),
            @('Not Printed BAR', 'Existing status button/indicator', 'Identifies records for which the BAR has not been printed/generated.'),
            @('Generated BAR', 'New controlled document', 'Provides a populated 13-page electronic BAR with batch identity, module records, evidence areas and audit history.'),
            @('View Generated BAR', 'New controlled button', 'Opens the generated BAR in view-only mode after generation.'),
            @('Print Generated BAR', 'New controlled button', 'Prints the populated controlled BAR and records the user and date/time in the audit history.'),
            @('PCL completeness/invoice check', 'New electronic check - existing process', 'Confirms the PCL is complete and the invoice is attached.'),
            @('Batch/expiry check', 'New electronic check - existing process', 'Confirms the batch number and expiry date are correct.'),
            @('Product/pack/reference check', 'New electronic check - existing process', 'Confirms product name, strength, pack size and ECMA are correct.'),
            @('Comments', 'New field', 'Captures relevant line-clearance or BAR comments.'),
            @('BAR Created By / Created Date-Time', 'New audit fields', 'Displays the authenticated BAR creator and creation timestamp.'),
            @('User Sign Off', 'New controlled button', 'Captures the authenticated user/date-time, locks the B&S checks and moves the batch to Label Printing.')
        )
        Operations = 'The user opens the existing B&S Batch Add screen, enters any required Country, Site, Category, Stock, Status and Batch_No criteria and selects Search. The existing results table displays the complete source-record data. The user selects one eligible row or compatible source rows and selects Generate BAR. The system validates eligibility and compatibility, creates one populated controlled BAR and retains the link to every selected source record. The BAR contains 13 controlled pages covering the BAR cover, B&S line clearance, Label Printing, Leaflet Printing, label evidence, Braille Printing, Leaflet Folding, Carton Issuing, downstream stage placeholders and the BAR audit trail. For reboxing, the completed Change of Pack Size form is added as an unnumbered attachment. The user may select Print Batch Details, View Generated BAR or Print Generated BAR as applicable. The user completes the three electronic B&S checks, adds comments where required and selects User Sign Off. Sign-off records the user/date-time, locks the checks, removes the batch from the active B&S Batch Add queue and makes it available in Label Printing.'
        Rules = 'Search and table fields replicated from the current system remain Existing. BAR population, electronic checks, audit attribution and automated queue handoff are New or updated functions. Generate BAR requires at least one eligible selection. Multiple selections must have compatible product, batch and expiry data. A batch shall have only one active controlled BAR. View/Print Generated BAR shall be unavailable before BAR generation. User Sign Off shall be unavailable until all mandatory line-clearance checks are complete. Completed records shall not be regenerated through the normal process.'
        Output = 'Filtered B&S Batch Add result; selected-source traceability; populated 13-page electronic BAR and applicable reboxing attachment; printed batch details where requested; completed line-clearance checks and comments; BAR creation/printing/sign-off audit events; and a signed batch in the Label Printing queue.'
    },
    [ordered]@{
        Index = 7
        Inputs = @(
            @('Printer Menu', 'Existing screen/menu - updated function', 'Common entry screen containing Label Printing, Leaflet Printing, Carton Issuing and Braille Printing options.'),
            @('Label Printing', 'Existing module button/tile', 'Opens the Label Printing queue.'),
            @('Leaflet Printing', 'Existing module button/tile', 'Opens the Leaflet Printing queue.'),
            @('Carton Issuing', 'Existing module button/tile', 'Opens the Carton Issuing queue.'),
            @('Braille Printing', 'Existing module button/tile', 'Opens the Braille Printing queue.'),
            @('Active / In Progress counts', 'New calculated indicators', 'Displays the current Active and In Progress workload for each Printer option.'),
            @('B&S Batch Number', 'Existing search field', 'Common queue search field used in all printing modules.'),
            @('MFG Lot No.', 'Existing search field', 'Common queue search field used in all printing modules.'),
            @('Search', 'Existing button', 'Applies the common queue search criteria.'),
            @('Printing queue table', 'Existing table - updated function', 'Common table layout used by Label, Leaflet, Carton and Braille queues; eligibility and status are controlled by module.'),
            @('B&S Batch Number', 'Existing queue column', 'Displays the controlled B&S batch identifier.'),
            @('MFG Lot No.', 'Existing queue column', 'Displays the manufacturing lot number.'),
            @('Product Name', 'Existing queue column', 'Displays the product name.'),
            @('Strength', 'Existing queue column', 'Displays product strength.'),
            @('Pack Size', 'Existing queue column', 'Displays pack size.'),
            @('ECMA', 'Existing queue column', 'Displays the approved reference.'),
            @('Expiry Date', 'Existing queue column', 'Displays batch expiry.'),
            @('Required Qty', 'Existing data - module-specific value', 'Displays label quantity, leaflet quantity, carton quantity or braille quantity according to the selected queue.'),
            @('Status', 'New calculated queue column', 'Displays Active, In Progress or the applicable downstream status.'),
            @('Select queue row', 'Existing table action - updated function', 'Opens the selected batch in the applicable printing detail screen.'),
            @('Back to Batch Queue', 'Existing button', 'Returns from a printing detail screen to its batch queue without completing the stage.'),
            @('Product Information panel', 'Existing display - common', 'Common read-only panel shown in Label, Leaflet, Carton, Braille and Leaflet Folding details.'),
            @('Product Name / Foreign Name', 'Existing fields - common', 'Displays the approved product names.'),
            @('Strength / Country of origin', 'Existing fields - common', 'Displays strength and source country.'),
            @('Pack Size / Units per pack', 'Existing fields - common', 'Displays packaging configuration.'),
            @('B&S Batch Number / MFG Lot No.', 'Existing fields - common', 'Displays batch identifiers.'),
            @('ECMA / PL No.', 'Existing fields - common', 'Displays approved ECMA and product licence references.'),
            @('Expiry Date / Quantity', 'Existing fields - common', 'Displays expiry and approved batch quantity.'),
            @('Product Introduced', 'Existing field - common', 'Displays the product introduction date/value.'),
            @('Leaflet Date / Date Revised', 'Existing fields - common', 'Displays the leaflet date and latest revision date.'),
            @('Batch Documents panel', 'New controlled access - common', 'Provides controlled document buttons for each printing module.'),
            @('View Carton Artwork', 'Existing document button - common', 'Opens approved carton artwork.'),
            @('View Peel Artwork', 'Existing document button - common', 'Opens approved peel/label artwork.'),
            @('View Braille Artwork', 'Existing document button - common', 'Opens approved braille artwork.'),
            @('View Mock-up', 'Existing document button - common', 'Opens the approved mock-up.'),
            @('View BAR', 'Existing document button - updated access', 'Opens the applicable controlled BAR/reference document.'),
            @('Print Generated BAR', 'New controlled button - common', 'Opens the populated BAR and permits controlled printing with audit capture.'),
            @('Continuation Page panel', 'New controlled access - common', 'Provides supporting continuation documents associated with the batch.'),
            @('Print Label Attachment', 'New controlled button - common', 'Prints the label-evidence attachment page.'),
            @('Print BAR Continuation', 'New controlled button - common', 'Prints the BAR continuation page.'),
            @('Print Cold-chain Page', 'New controlled button - common', 'Prints the cold-chain record page.'),
            @('Print Change of Pack Size', 'New route-specific button', 'Available for reboxing and prints the completed Change of Pack Size attachment.'),
            @('Print', 'Existing button - updated function/common', 'Opens the unified print window for the selected label, leaflet or braille line.'),
            @('Quantity Needed', 'Existing read-only field - common', 'Displays the approved quantity for the selected component.'),
            @('Quantity to Print', 'Existing entry field - common', 'Requires a whole-number print quantity greater than zero.'),
            @('Category', 'New controlled selection - common', 'Values are Test Print, Actually Print and Extra Print.'),
            @('Reason', 'New conditional field - common', 'Enabled and mandatory for Extra Print. Values include Print damage, Line setup waste, Reconciliation correction, Printing alignment check and Supervisor approved extra.'),
            @('Print (dialog)', 'Existing button - updated function/common', 'Sends the selected quantity/category to the applicable print workflow and records the event.'),
            @('Close print preview', 'Existing button - common', 'Closes the print preview without submitting a print action.'),
            @('Line Completion', 'New status/action - common', 'Shows Pending, Mark as Done or Done and records the completing user/date-time.'),
            @('Print Done', 'New controlled button - common', 'Completes the printing stage only after every mandatory component line is Done.')
        )
        Operations = 'The authorised user opens the existing Printer menu and selects a printing option. All four printing modules use the same queue search, queue columns, product-information panel, controlled-document panel, Back to Batch Queue action, user attribution and audit principles. Label, Leaflet and Braille Printing also share the unified Print window. The user enters Quantity to Print, selects Test Print, Actually Print or Extra Print and selects Print. Extra Print enables Reason and cannot continue without a selected reason. The system records item, quantity needed, quantity printed, category, reason, user and date/time. Component completion remains separate from the print action. Print Done is enabled only when all mandatory lines for that module are Done. Carton Issuing uses the common batch/document/audit presentation but records carton issue rather than a printer run.'
        Rules = 'Existing describes a replicated current-system screen, field or button. New describes additional electronic behaviour or data. Existing - updated function describes a replicated control whose validation, audit or routing is changed. Common controls shall behave consistently across Label, Leaflet and Braille Printing unless a module-specific rule states otherwise. Queue contents shall be route- and prior-stage-controlled. Extra Print requires a positive whole quantity and reason. All document openings, prints, line completions and Print Done actions shall be attributable and auditable.'
        Output = 'Module workload counts; controlled printing queues; complete product and document context; print-run records by category; extra-print reasons; line-level status and attribution; module completion status; and route-controlled handoff.'
    },
    [ordered]@{
        Index = 8
        Inputs = @(
            @('Label Printing List', 'Existing queue - updated eligibility', 'Lists BAR-signed batches ready for Label Printing and uses all common Printer queue fields/buttons defined in section 3.2.'),
            @('Labels to Print table', 'Existing table - updated function', 'Displays every route-derived label component and its printing/completion state.'),
            @('Label', 'Existing table field', 'For Reboxing: Carton Label, End Of Pack Label and Security Seals. For Relabelling: Blister / Pack Label and Obscure Label.'),
            @('Reference', 'Existing table field', 'Displays the approved ECMA/reference; Security Seals use the Seal reference.'),
            @('Size', 'Existing table field', 'Displays approved pack size or Standard for applicable labels.'),
            @('Quantity', 'Existing table field - calculated value', 'Displays the route-derived required quantity; Security Seals default to the controlled seal quantity.'),
            @('Location', 'Existing table field', 'Displays warehouse/component location.'),
            @('In Hand Quantity', 'Existing table field', 'Displays available stock/on-hand quantity.'),
            @('Print', 'Existing button - common updated function', 'Opens the common Print window described in section 3.2.'),
            @('Line Completion', 'New table status', 'Shows Pending or Done for the label line.'),
            @('Completed By / Date', 'New audit table field', 'Displays the authenticated completing user and date/time.'),
            @('Change of Pack Size form', 'Existing form - digitised/route-specific', 'Displayed for Reboxing. Captures Received As and Assembled As information and their sign-offs.'),
            @('Received As sign-off', 'New electronic control - existing process', 'Must be complete before label printing starts for Reboxing.'),
            @('Assembled As sign-off', 'New electronic control - existing process', 'Must be complete before label printing starts for Reboxing.'),
            @('Print Done', 'New controlled button', 'Enabled after all displayed label rows are Done and finalises Label Printing.'),
            @('Back to Batch Queue', 'Existing button - common', 'Returns to the Label Printing queue.')
        )
        Operations = 'The user opens an eligible BAR-signed batch from Label Printing. The common product and document panels are displayed. The system derives the table rows from the approved route. Reboxing displays Carton Label, End Of Pack Label and Security Seals; Relabelling displays Blister / Pack Label and Obscure Label. For Reboxing, both Received As and Assembled As sections must be completed and electronically signed before any Print button is enabled. For each row the user verifies reference, size, quantity, location and stock, opens Print, completes the applicable Test Print/Actually Print/Extra Print action and completes the line. Done and the completing user/date-time are displayed. When all route-derived rows are Done, Print Done finalises the module and routes a leaflet-required batch to Leaflet Printing.'
        Rules = 'The common controls in section 3.2 apply. Label rows shall be route-derived. Reboxing printing is blocked until both Change of Pack Size sign-offs are complete. A test print shall be completed before the corresponding line may be completed where required. Required quantity shall be satisfied before Mark as Done/Done. Additional prints after completion shall be audited and shall not overwrite the original completion. Print Done requires all mandatory rows to be Done.'
        Output = 'Completed route-specific label table; Change of Pack Size record for reboxing; test, actual and extra-print history; line completion attribution; final Label Printing status; and handoff to Leaflet Printing or the next applicable stage.'
    },
    [ordered]@{
        Index = 9
        Inputs = @(
            @('Leaflet Printing List', 'Existing queue - updated eligibility', 'Lists batches that completed Label Printing and require a leaflet; uses the common queue fields/buttons in section 3.2.'),
            @('Leaflets to Print table', 'Existing table - updated function', 'Displays required leaflet component lines and completion status.'),
            @('Leaflet', 'Existing table field', 'Identifies the leaflet component.'),
            @('Reference', 'Existing table field', 'Displays the approved ECMA/leaflet reference.'),
            @('Size', 'Existing table field', 'Displays the approved pack-size leaflet format.'),
            @('Quantity', 'Existing table field - calculated value', 'Displays the approved leaflet quantity.'),
            @('Location', 'Existing table field', 'Displays the leaflet stock location.'),
            @('Print', 'Existing button - common updated function', 'Opens the controlled leaflet PDF/print workflow and the common quantity/category controls.'),
            @('Mark as Done', 'New controlled button', 'Enabled only after an Actually Print event has been recorded for the leaflet line.'),
            @('Line Completion', 'New table status', 'Displays Mark as Done or Done.'),
            @('Completed By / Date', 'New audit table field', 'Displays the completing user and timestamp.'),
            @('Print Done', 'New controlled button', 'Enabled only after every required leaflet line is Done.'),
            @('Back to Batch Queue', 'Existing button - common', 'Returns to the Leaflet Printing queue.')
        )
        Operations = 'The user opens an eligible leaflet-required batch after Label Printing. The system displays the common product/document panels and the Leaflets to Print table. Selecting Print opens the approved controlled leaflet PDF and records the opening user/date-time. The user completes the required test/master review and selects the required print category and quantity. Mark as Done remains disabled until an Actually Print event exists for the line. Extra Print requires a reason. When the line is complete, the table records Done with user/date-time. Print Done finalises the module. Reboxing routes to Carton Issuing; Relabelling with braille required routes to Braille Printing; otherwise the batch routes to Leaflet Folding or the next applicable stage.'
        Rules = 'The common controls in section 3.2 apply. Only leaflet-required batches that completed Label Printing shall appear. The approved PDF opening shall be audited. Test/master acceptance shall precede controlled completion where required. Mark as Done requires an actual-print record. Rejected master/test copies shall be retained as exception evidence. Print Done requires all leaflet rows to be Done. Routing shall use the approved Reboxing/Relabelling and braille-required values.'
        Output = 'Approved leaflet/PDF access history; test/master evidence; actual and extra-print records; completed leaflet table; user/date-time attribution; final Leaflet Printing status; and route to Carton Issuing, Braille Printing or Leaflet Folding.'
    },
    [ordered]@{
        Index = 10
        Inputs = @(
            @('Carton Issuing List', 'Existing queue - updated eligibility', 'Lists Reboxing batches that completed Leaflet Printing and uses the common Printer queue fields/buttons in section 3.2.'),
            @('Carton to Issue table', 'Existing table - updated function', 'Displays the single controlled carton-issue line and completion status.'),
            @('Carton Reference', 'Existing table field', 'Displays ECMA/part number or the approved carton reference.'),
            @('Required Qty', 'Existing table field - calculated value', 'Displays the carton quantity required by the batch.'),
            @('On Hand Quantity', 'Existing table field', 'Displays available carton stock.'),
            @('Extra', 'Existing table action - updated function', 'Contains Issue Extra; disabled until the required carton issue is confirmed.'),
            @('Issue Extra', 'Existing button - updated controlled function', 'Opens additional carton issue. A positive quantity and reason are mandatory.'),
            @('Location Number', 'Existing table field', 'Displays the carton warehouse/location.'),
            @('Confirmed By', 'New audit table field', 'Displays Pending confirmation or the authenticated user and date/time.'),
            @('Done', 'Existing button - updated controlled function', 'Confirms the required carton issue and records attribution.'),
            @('Completion count', 'New calculated indicator', 'Displays 0/1 or 1/1 completed.'),
            @('Back to Batch Queue', 'Existing button - common', 'Returns to the Carton Issuing queue.')
        )
        Operations = 'The user opens a Reboxing batch that completed Leaflet Printing. The common product and controlled-document panels are displayed with the Carton to Issue table. The user verifies the carton reference, required quantity, on-hand quantity and location, then selects Done. The system records the required carton issue, changes the completion count to 1/1 and displays the authenticated user/date-time. Issue Extra becomes available only after the required issue is confirmed; it requires the extra quantity and a reason. The completed carton issue is retained in the BAR/audit history and the batch becomes eligible for Leaflet Folding once all other route-required work is complete.'
        Rules = 'Only Reboxing batches that completed Leaflet Printing shall appear. Required carton issue shall be confirmed before Issue Extra is enabled. Extra quantity must be a positive whole number and requires a reason. Done shall be disabled after confirmation to prevent duplicate normal issue. Additional authorised issue shall use Issue Extra and remain auditable.'
        Output = 'Completed Carton to Issue table; required and extra carton quantities; location; reason; completion count; user/date-time attribution; BAR/audit update; and route-specific completion for Leaflet Folding eligibility.'
    },
    [ordered]@{
        Index = 11
        Inputs = @(
            @('Braille Printing List', 'Existing queue - updated eligibility', 'Lists Relabelling batches that completed Leaflet Printing and are flagged as requiring braille; uses section 3.2 common controls.'),
            @('Braille Labels to Print table', 'Existing table - updated function', 'Displays all required braille component lines and completion status.'),
            @('Braille Label', 'Existing table field', 'Rows include Braille Label and Braille Declaration Copy.'),
            @('Reference', 'Existing table field', 'Braille Label uses ECMA; Braille Declaration Copy uses PL No.'),
            @('Size', 'Existing table field', 'Displays pack size for the label and Master copy for the declaration.'),
            @('Quantity', 'Existing table field - calculated value', 'Displays braille quantity; declaration copy quantity is one.'),
            @('Location', 'Existing table field', 'Displays component location.'),
            @('In Hand Quantity', 'Existing table field', 'Displays available stock/on-hand quantity.'),
            @('Print', 'Existing button - common updated function', 'Opens the common Print window described in section 3.2.'),
            @('Mark as Done', 'New controlled button', 'Enabled when the required quantity for the line has been printed.'),
            @('Line Completion', 'New table status', 'Shows Pending, Mark as Done or Done.'),
            @('Completed By / Date', 'New audit table field', 'Displays the completing user and date/time.'),
            @('Print Done', 'New controlled button', 'Enabled after every Braille Label and declaration row is Done.'),
            @('Back to Batch Queue', 'Existing button - common', 'Returns to the Braille Printing queue.')
        )
        Operations = 'The user opens an eligible Relabelling batch for which braille is required. The common product and controlled-document panels are displayed. The Braille Labels to Print table includes the Braille Label and the Braille Declaration Copy. Each row follows the common process: verify reference, size, quantity, location and on-hand stock; perform the required test print; complete Actually Print; enter a reason for Extra Print; and mark the line Done. Each completion records user/date-time. Print Done is enabled only after all braille rows are complete, after which the batch becomes eligible for Leaflet Folding.'
        Rules = 'The common controls in section 3.2 apply. Only eligible Relabelling batches with braille required and completed Leaflet Printing shall appear. All required quantities must be printed before line completion. The Braille Declaration Copy is a mandatory row where configured. Extra Print requires a reason. Print Done requires every displayed row to be Done.'
        Output = 'Completed braille label and declaration rows; test, actual and extra-print history; line-level attribution; final Braille Printing status; BAR/audit update; and route-specific completion for Leaflet Folding eligibility.'
    },
    [ordered]@{
        Index = 12
        Inputs = @(
            @('B&S Batch Number', 'Existing search field', 'Searches the Leaflet Folding queue by B&S batch.'),
            @('MFG Lot No.', 'Existing search field', 'Searches the queue by manufacturing lot.'),
            @('Search', 'Existing button', 'Applies the Leaflet Folding search criteria.'),
            @('Leaflet Folding List table', 'Existing table - updated eligibility', 'Lists only batches that completed Leaflet Printing and all route-required Carton/Braille work.'),
            @('B&S Batch Number', 'Existing queue column', 'Displays the batch identifier.'),
            @('MFG Lot No.', 'Existing queue column', 'Displays the manufacturing lot.'),
            @('Product Name', 'Existing queue column', 'Displays product name.'),
            @('Strength', 'Existing queue column', 'Displays product strength.'),
            @('Pack Size', 'Existing queue column', 'Displays pack size.'),
            @('ECMA', 'Existing queue column', 'Displays approved reference.'),
            @('Expiry Date', 'Existing queue column', 'Displays batch expiry.'),
            @('Required Qty', 'Existing queue column', 'Displays the required leaflet/folding quantity.'),
            @('Status', 'New calculated queue column', 'Displays Active or the applicable controlled status.'),
            @('Select queue row', 'Existing table action - updated function', 'Opens the Leaflet Folding detail screen.'),
            @('Product Information/Documents', 'Existing/common display - updated access', 'Uses the common product and controlled-document panel described in section 3.2.'),
            @('Leaflet Folding table', 'Existing table - updated function', 'Displays the leaflet identity, quantity and folding completion attribution.'),
            @('Leaflet Reference', 'Existing table field', 'Displays the approved ECMA/leaflet reference.'),
            @('Leaflet Size', 'Existing table field', 'Displays the approved pack-size leaflet format.'),
            @('Required Qty', 'Existing table field', 'Displays the quantity that must be folded.'),
            @('On Hand Quantity', 'Existing table field', 'Displays available leaflet quantity.'),
            @('Folded By', 'New audit table field', 'Displays Pending confirmation or the authenticated completing user.'),
            @('Date / Time', 'New audit table field', 'Displays Pending confirmation or the completion timestamp.'),
            @('Done', 'Existing button - updated controlled function', 'Completes Leaflet Folding, records folded quantity and attribution, and removes the batch from the active queue.'),
            @('Back to Batch Queue', 'Existing button', 'Returns to the Leaflet Folding list without completing the record.')
        )
        Operations = 'The user searches the Leaflet Folding list by B&S Batch Number or MFG Lot No. The system shall list a batch only after Leaflet Printing and every route-required preparation activity are complete: Carton Issuing for Reboxing and Braille Printing for applicable Relabelling. The user selects the batch, reviews the common product/documents panel and verifies the Leaflet Reference, Leaflet Size, Required Qty and On Hand Quantity. Selecting Done records the folded quantity, authenticated user and date/time, updates the BAR/audit history, removes the batch from the active folding queue and hands it to Pre-Assembly as the next configured stage.'
        Rules = 'Leaflet Printing completion alone is not sufficient. Reboxing requires completed Carton Issuing; Relabelling with braille required requires completed Braille Printing. Done requires valid batch identity, approved leaflet reference/format and required quantity. Completion is single-use in the normal workflow and shall be retained in batch history. The current wireframe queue logic shall be corrected to enforce these route-specific prerequisites.'
        Output = 'Filtered Leaflet Folding queue; verified batch/leaflet details; completed folding quantity; user/date-time attribution; updated BAR/audit history; removal from the active queue; and controlled handoff to Pre-Assembly.'
    }
)

$word = $null
$doc = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open($working, $false, $false, $false)

    function Set-CellText($cell, [string]$text) {
        $range = $cell.Range.Duplicate
        [void]$range.MoveEnd(1, -1)
        $range.Text = $text
    }

    function Replace-ParagraphExact([string]$oldText, [string]$newText) {
        foreach ($paragraph in $doc.Paragraphs) {
            $current = ($paragraph.Range.Text -replace '[\r\a]', '').Trim()
            if ($current -ceq $oldText) {
                $range = $paragraph.Range.Duplicate
                [void]$range.MoveEnd(1, -1)
                $range.Text = $newText
                return $true
            }
        }
        return $false
    }

    function Set-InputTable($outerTable, $rows) {
        $nested = $outerTable.Cell(5, 2).Tables.Item(1)
        $required = $rows.Count + 1
        while ($nested.Rows.Count -lt $required) { [void]$nested.Rows.Add() }
        while ($nested.Rows.Count -gt $required) { $nested.Rows.Item($nested.Rows.Count).Delete() }
        Set-CellText $nested.Cell(1, 1) 'Field / Button / Table Column'
        Set-CellText $nested.Cell(1, 2) 'Field type'
        Set-CellText $nested.Cell(1, 3) 'Functional description'
        for ($i = 0; $i -lt $rows.Count; $i++) {
            Set-CellText $nested.Cell($i + 2, 1) $rows[$i][0]
            Set-CellText $nested.Cell($i + 2, 2) $rows[$i][1]
            Set-CellText $nested.Cell($i + 2, 3) $rows[$i][2]
        }
        $nested.Rows.Item(1).HeadingFormat = -1
        foreach ($row in $nested.Rows) { $row.AllowBreakAcrossPages = -1 }
        $nested.AllowAutoFit = $true
    }

    [void](Replace-ParagraphExact 'This section describes the functional attributes and controlled workflow behaviour that will be implemented to meet the approved Phase 2 URS.' 'This section describes the complete functional behaviour shown in the approved wireframe. Within the module tables, Existing identifies a field, table, screen or button replicated from the current PLPI system; Existing - updated function identifies a replicated control with new validation, electronic record, audit or routing behaviour; and New identifies functionality introduced by this change. Controls identified as common across all Printing Modules are specified once in section 3.2 and apply to Label Printing, Leaflet Printing and Braille Printing, with Carton Issuing using the applicable common queue, product, document and audit controls.')

    Set-CellText $doc.Tables.Item(4).Cell(2, 3) 'Functional Specification expanded to cover all visible wireframe fields, buttons, tables, common printing controls, validations, document access, audit behaviour and route-specific processing.'

    foreach ($module in $modules) {
        $table = $doc.Tables.Item($module.Index)
        Set-InputTable $table $module.Inputs
        Set-CellText $table.Cell(6, 2) $module.Operations
        Set-CellText $table.Cell(8, 2) $module.Output
        Set-CellText $table.Cell(11, 2) $module.Rules
        $table.Rows.Item(1).HeadingFormat = -1
        foreach ($row in $table.Rows) { $row.AllowBreakAcrossPages = -1 }
    }

    $nfsText = 'The system shall retain audit records for B&S batch selection, source-record combination, BAR generation, viewing and printing, BAR and artwork access, continuation-page printing, B&S verification and line clearance, PDF opening, test/master review, required and extra print quantities, print category, reasons, component-line completion, Print Done, carton issue, braille completion, Leaflet Folding and every controlled status handoff. Audit entries shall include the batch, item/action, user, role where applicable, date/time and relevant quantity, reason or comments.'
    foreach ($p in $doc.Paragraphs) {
        $t = ($p.Range.Text -replace '[\r\a]', '').Trim()
        if ($t.StartsWith('The system shall retain audit records for B&S batch selection')) {
            $r = $p.Range.Duplicate; [void]$r.MoveEnd(1,-1); $r.Text = $nfsText; break
        }
    }

    $doc.Repaginate()
    foreach ($toc in $doc.TablesOfContents) { $toc.Update(); $toc.UpdatePageNumbers() }
    $doc.Repaginate()
    $doc.Save()
    $doc.Save()

    [PSCustomObject]@{
        Working = $working
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
