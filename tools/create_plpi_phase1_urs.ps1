$ErrorActionPreference = "Stop"

$root = (Resolve-Path -LiteralPath ".").Path
$outDocx = Join-Path $root "URS_PLPI_Batch_Record_Paperless_Process_Improvement_Phase_1.docx"
$outPdf = Join-Path $root "URS_PLPI_Batch_Record_Paperless_Process_Improvement_Phase_1.pdf"

if (Test-Path -LiteralPath $outDocx) {
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    Copy-Item -LiteralPath $outDocx -Destination "$outDocx.bak-$stamp"
}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

$wdStory = 6
$wdPageBreak = 7
$wdFieldEmpty = -1
$wdExportFormatPDF = 17
$wdCollapseEnd = 0
$wdAlignParagraphCenter = 1
$wdAlignParagraphLeft = 0
$wdAlignParagraphRight = 2
$wdCellAlignVerticalCenter = 1
$wdLineStyleSingle = 1
$wdColorGray15 = 14277081
$wdColorGray20 = 13421772

function Set-BaseStyles {
    param($doc)
    $normal = $doc.Styles.Item("Normal")
    $normal.Font.Name = "Verdana"
    $normal.Font.Size = 9
    $normal.Font.Color = -16777216
    $normal.ParagraphFormat.SpaceBefore = 0
    $normal.ParagraphFormat.SpaceAfter = 3
    $normal.ParagraphFormat.LineSpacing = 12

    $h1 = $doc.Styles.Item("Heading 1")
    $h1.Font.Name = "Verdana"
    $h1.Font.Size = 10
    $h1.Font.Bold = -1
    $h1.Font.Color = -16777216
    $h1.ParagraphFormat.SpaceBefore = 6
    $h1.ParagraphFormat.SpaceAfter = 3
    $h1.ParagraphFormat.KeepWithNext = -1

    $h2 = $doc.Styles.Item("Heading 2")
    $h2.Font.Name = "Verdana"
    $h2.Font.Size = 9
    $h2.Font.Bold = -1
    $h2.Font.Color = -16777216
    $h2.ParagraphFormat.SpaceBefore = 5
    $h2.ParagraphFormat.SpaceAfter = 2
    $h2.ParagraphFormat.KeepWithNext = -1

    $h3 = $doc.Styles.Item("Heading 3")
    $h3.Font.Name = "Verdana"
    $h3.Font.Size = 9
    $h3.Font.Bold = -1
    $h3.Font.Color = -16777216
    $h3.ParagraphFormat.SpaceBefore = 4
    $h3.ParagraphFormat.SpaceAfter = 2
    $h3.ParagraphFormat.KeepWithNext = -1

    $noSpacing = $doc.Styles.Item("No Spacing")
    $noSpacing.Font.Name = "Verdana"
    $noSpacing.Font.Size = 9
    $noSpacing.ParagraphFormat.SpaceBefore = 0
    $noSpacing.ParagraphFormat.SpaceAfter = 0
    $noSpacing.ParagraphFormat.LineSpacing = 12
}

function Move-End {
    param($selection)
    [void]$selection.EndKey($wdStory)
}

function Add-Para {
    param(
        $doc,
        $selection,
        [string]$text,
        [string]$style = "Normal",
        [int]$align = 0,
        [bool]$bold = $false,
        [int]$size = 0
    )
    $contentsRows = @(
        @("Section", "Title"),
        @("1", "Introduction"),
        @("2", "Scope"),
        @("3", "Abbreviation"),
        @("4", "User Requirement and Specification"),
        @("4.1", "Goods-In / Packing List and Digital Goods Receiving Checklist"),
        @("4.2", "Goods-In Document Upload and Evidence Capture"),
        @("4.3", "RP/RPi Documents Review and Approval"),
        @("4.4", "Batch Checker Queue and Accepted Stock Review"),
        @("4.5", "Product Line Selection and Batch Verification"),
        @("4.6", "Product Check Log and Line Clearance"),
        @("4.7", "Workflow Status, Audit Trail and Record Retention"),
        @("4.8", "Exceptions, Rejections and Missing Document Handling"),
        @("4.9", "Reporting and Downstream Handoff"),
        @("5", "User Access"),
        @("6", "Testing"),
        @("7", "Documents"),
        @("8", "Support")
    )
    [void](Add-Table $doc $selection $contentsRows @(75, 430) $true)
    $selection.Font.Name = "Verdana"
    if ($size -gt 0) { $selection.Font.Size = $size }
    $selection.Font.Bold = $(if ($bold) { -1 } else { 0 })
    $selection.TypeText($text)
    $selection.TypeParagraph()
    $selection.Font.Bold = 0
}

function Add-PageBreak {
    param($selection)
    Move-End $selection
    [void]$selection.InsertBreak($wdPageBreak)
}

function Add-Table {
    param(
        $doc,
        $selection,
        [object[]]$rows,
        [int[]]$widths = @(),
        [bool]$header = $true
    )
    Move-End $selection
    $rowCount = $rows.Count
    $colCount = $rows[0].Count
    $table = $doc.Tables.Add($selection.Range, $rowCount, $colCount)
    $table.Style = "Table Grid"
    $table.Borders.Enable = $true
    $table.Range.Font.Name = "Verdana"
    $table.Range.Font.Size = 8.5
    $table.Range.ParagraphFormat.SpaceAfter = 0
    $table.Range.ParagraphFormat.LineSpacing = 11
    $table.Range.Cells.VerticalAlignment = $wdCellAlignVerticalCenter
    $table.TopPadding = 3
    $table.BottomPadding = 3
    $table.LeftPadding = 4
    $table.RightPadding = 4
    if ($widths.Count -eq $colCount) {
        for ($c=1; $c -le $colCount; $c++) {
            $table.Columns.Item($c).PreferredWidth = $widths[$c-1]
        }
    }
    for ($r=1; $r -le $rowCount; $r++) {
        for ($c=1; $c -le $colCount; $c++) {
            $table.Cell($r,$c).Range.Text = [string]$rows[$r-1][$c-1]
        }
    }
    if ($header) {
        $table.Rows.Item(1).Range.Bold = -1
        $table.Rows.Item(1).Shading.BackgroundPatternColor = $wdColorGray20
    }
    $range = $table.Range
    $range.Collapse($wdCollapseEnd)
    $range.Select()
    $selection.TypeParagraph()
    return $table
}

function Add-ReqSection {
    param(
        $doc,
        $selection,
        [string]$heading,
        [string]$lead,
        [object[]]$requirements
    )
    Add-Para $doc $selection $heading "Heading 2"
    Add-Para $doc $selection $lead "Normal"
    $rows = @()
    $rows += ,@("URS Id", "Requirement")
    foreach ($r in $requirements) { $rows += ,$r }
    [void](Add-Table $doc $selection $rows @(75, 430) $true)
}

try {
    $doc = $word.Documents.Add()
    Set-BaseStyles $doc
    $selection = $word.Selection

    foreach ($section in $doc.Sections) {
        $ps = $section.PageSetup
        $ps.PageWidth = 612
        $ps.PageHeight = 792
        $ps.LeftMargin = 39
        $ps.RightMargin = 52
        $ps.TopMargin = 72
        $ps.BottomMargin = 55
        $ps.HeaderDistance = 9
        $ps.FooterDistance = 36
        $footer = $section.Footers.Item(1).Range
        $footer.Font.Name = "Verdana"
        $footer.Font.Size = 8
        $footer.Text = "B&S Healthcare, Unit 4, Bradfield Road, Ruislip, HA4 0NU"
        $footer.ParagraphFormat.Alignment = $wdAlignParagraphRight
        $footer.InsertAfter("    Page")
    }

    Add-Para $doc $selection "User Requirement Specification" "Normal" $wdAlignParagraphCenter $true 14
    Add-Para $doc $selection "PLPI Batch Record / Paperless Process Improvement" "Normal" $wdAlignParagraphCenter $true 12
    Add-Para $doc $selection "Phase 1: Goods-In / Packing List, RP/RPi Pack Review, and Batch Checker / Product Check Log" "Normal" $wdAlignParagraphCenter $false 9
    Add-Para $doc $selection "" "Normal"

    $docControl = @(
        @("Document Field", "Details"),
        @("Project", "PLPI Batch Record / Paperless Process Improvement"),
        @("System", "PLPI"),
        @("Document Type", "User Requirement Specification (URS)"),
        @("Current Phase", "Phase 1"),
        @("In Scope", "Goods-In / Packing List, RP/RPi Pack Review, Batch Checker / Product Check Log"),
        @("Out of Scope for This Phase", "BAR Creation, label printing, leaflet printing, carton/braille, leaflet folding, assembly, Post-Assembly QC, Pre-QP, QP Approval, and other downstream stages"),
        @("Document Status", "Draft for stakeholder review"),
        @("Prepared Date", "July 2026")
    )
    [void](Add-Table $doc $selection $docControl @(145, 360) $true)

    $approval = @(
        @("Role", "Name / Function", "Signature", "Date"),
        @("Author", "Business Analyst", "______________________________", "____________"),
        @("Reviewer", "Operations Representative", "______________________________", "____________"),
        @("Reviewer", "QA / RP Representative", "______________________________", "____________"),
        @("Reviewer", "IT Representative", "______________________________", "____________"),
        @("Approver", "Project Sponsor / Quality Approver", "______________________________", "____________")
    )
    [void](Add-Table $doc $selection $approval @(80, 165, 170, 90) $true)

    Add-Para $doc $selection "Revision History" "Heading 1"
    $revision = @(
        @("Version", "Previous version", "Reason for revision", "Issued"),
        @("1", "NA", "New URS prepared for PLPI Batch Record / Paperless Process Improvement Phase 1.", "Jul 2026")
    )
    [void](Add-Table $doc $selection $revision @(60, 105, 255, 85) $true)

    $distribution = @(
        @("Function", "Review Purpose"),
        @("Operations", "Confirm operational workflow, task ownership, and stage handoff requirements."),
        @("QA / RP", "Confirm GMP control, document review, sign-off, and audit trail expectations."),
        @("IT", "Confirm PLPI workflow, access, upload, status, retention, and implementation requirements."),
        @("Goods-In / Warehouse", "Confirm PO selection, document upload, quantity, box, and checklist requirements."),
        @("Batch Checker", "Confirm batch verification, Product Check Log, and line clearance requirements.")
    )
    [void](Add-Table $doc $selection $distribution @(120, 385) $true)

    Add-PageBreak $selection
    Add-Para $doc $selection "TABLE OF CONTENTS" "Heading 1"
    $contentsRows = @(
        @("Section", "Title"),
        @("1", "Introduction"),
        @("2", "Scope"),
        @("3", "Abbreviation"),
        @("4", "User Requirement and Specification"),
        @("4.1", "Goods-In / Packing List and Digital Goods Receiving Checklist"),
        @("4.2", "Goods-In Document Upload and Evidence Capture"),
        @("4.3", "RP/RPi Documents Review and Approval"),
        @("4.4", "Batch Checker Queue and Accepted Stock Review"),
        @("4.5", "Product Line Selection and Batch Verification"),
        @("4.6", "Product Check Log and Line Clearance"),
        @("4.7", "Workflow Status, Audit Trail and Record Retention"),
        @("4.8", "Exceptions, Rejections and Missing Document Handling"),
        @("4.9", "Reporting and Downstream Handoff"),
        @("5", "User Access"),
        @("6", "Testing"),
        @("7", "Documents"),
        @("8", "Support")
    )
    [void](Add-Table $doc $selection $contentsRows @(75, 430) $true)
    Add-PageBreak $selection

    Add-Para $doc $selection "1. Introduction" "Heading 1"
    Add-Para $doc $selection "The PLPI Batch Record / Paperless Process Improvement project is a phased digital improvement initiative intended to enhance the existing PLPI process by reducing reliance on printed paper documents and manual handwritten confirmations. The project will move key operational confirmations, document checks, line clearance activities, evidence capture, and user sign-offs into PLPI where this can be achieved without changing the core GMP control logic of the process." "Normal"
    Add-Para $doc $selection "PLPI and related systems already hold significant batch, product, packing list, document, and process information. However, critical confirmations are still completed manually on printed or scanned records such as the Goods-In checklist, RP/RPi pack, Product Check Log, BAR, and other supporting paper records. This creates manual effort, dependency on physical handoffs, and risk that evidence is incomplete, difficult to locate, or harder to review consistently." "Normal"
    Add-Para $doc $selection "Phase 1 focuses on the first three stages of the PLPI workflow: Goods-In / Packing List, RP/RPi Pack Review, and Batch Checker / Product Check Log. The objective is to digitise these stages so that documents, checks, user confirmations, date and time stamps, digital sign-offs, and supporting evidence are captured directly in PLPI and made available to the next workflow queue." "Normal"
    Add-Para $doc $selection "This URS defines the user requirements for Phase 1 only. BAR Creation and all downstream printing, production, assembly, Pre-QP, and QP release stages are outside the current implementation scope and will be assessed in later phases." "Normal"

    Add-Para $doc $selection "2. Scope" "Heading 1"
    Add-Para $doc $selection "The current implementation scope is limited to the first three stages of the PLPI paperless improvement programme. The system shall support controlled digital completion, review, approval, and handoff of records from Goods-In through Product Check Log completion." "Normal"
    $scope = @(
        @("Scope Area", "Phase 1 Position"),
        @("Goods-In / Packing List", "In scope. PO search or selection, packing list information, supporting document upload, Goods-In checklist completion, box and quantity verification, delivery evidence capture, and Goods-In digital sign-off."),
        @("RP / RPi Pack Review", "In scope. Digital review of Goods-In uploaded documents, generated PO packing list, completeness checks, missing or incorrect document handling, and RP/RPi approval or rejection sign-off."),
        @("Batch Checker / Product Check Log", "In scope. Accepted stock review, product line selection, batch detail verification, supporting evidence review, line clearance confirmation, and digital Product Check Log generation."),
        @("Audit Trail and Status Visibility", "In scope. Capture user, role, date, time, stage status, document status, sign-off status, and workflow handoff history."),
        @("BAR and Downstream Production Stages", "Out of scope for Phase 1. BAR Creation, label printing, leaflet printing, carton/braille, leaflet folding, production control, assembly room operations, Post-Assembly QC, Pre-QP, and QP Approval will be covered in later phases.")
    )
    [void](Add-Table $doc $selection $scope @(145, 360) $true)

    Add-Para $doc $selection "3. Abbreviation" "Heading 1"
    $abbr = @(
        @("Abbreviation", "Definition"),
        @("PLPI", "Product Label and Pack Information system"),
        @("URS", "User Requirement Specification"),
        @("FS", "Functional Specification"),
        @("DS", "Design Specification"),
        @("RP / RPi", "Responsible Person / Responsible Person import"),
        @("PCL", "Product Check Log"),
        @("PO", "Purchase Order"),
        @("BAR", "Batch Assembly Record"),
        @("GMP", "Good Manufacturing Practice"),
        @("QP", "Qualified Person"),
        @("QC", "Quality Control")
    )
    [void](Add-Table $doc $selection $abbr @(110, 395) $true)

    Add-Para $doc $selection "4. User Requirement and Specification" "Heading 1"
    Add-Para $doc $selection "The following requirements define the expected PLPI Phase 1 behaviour. The requirements are written from a business and user perspective and shall be further elaborated in the Functional Specification and Design Specification before build and validation." "Normal"

    Add-ReqSection $doc $selection "4.1 Goods-In / Packing List and Digital Goods Receiving Checklist" "The Goods-In workflow shall allow users to locate the relevant PO, review packing list details, complete received goods checks, and sign off the Goods-In activity digitally." @(
        @("URS-4.1.1", "The system shall allow the Goods-In user to search, select, or open the relevant PO within PLPI."),
        @("URS-4.1.2", "The system shall display or pull relevant packing list information required for Goods-In verification, including product, supplier, PO, batch, quantity, box, expiry, and delivery details where available."),
        @("URS-4.1.3", "The system shall provide a digital Goods-In checklist covering PO information, supplier documentation, received quantity, number of boxes, batch number, expiry date, and temperature-related evidence where applicable."),
        @("URS-4.1.4", "The system shall require the Goods-In user to confirm box count and quantity verification before the Goods-In task can be completed."),
        @("URS-4.1.5", "The system shall capture Goods-In user identity, role, date, and time when the checklist is completed and signed off."),
        @("URS-4.1.6", "The system shall prevent the batch from progressing to RP/RPi review until mandatory Goods-In checks and required evidence are completed.")
    )

    Add-ReqSection $doc $selection "4.2 Goods-In Document Upload and Evidence Capture" "The Goods-In workflow shall support upload and capture of the documents and evidence required to create a complete digital pack for review." @(
        @("URS-4.2.1", "The system shall allow the Goods-In user to upload supporting documents against the selected PO or batch record."),
        @("URS-4.2.2", "The system shall support mandatory and optional document categories, including PO, supplier invoice, supplier declaration, supplier packing list, temperature record, Goods-In checklist, delivery note, and other delivery evidence."),
        @("URS-4.2.3", "The system shall allow photo or evidence attachments to be added where physical condition, delivery, temperature, box, or label evidence is required."),
        @("URS-4.2.4", "The system shall show document completion status so the user can identify missing, uploaded, reviewed, rejected, or approved documents."),
        @("URS-4.2.5", "The system shall retain uploaded documents and evidence in the digital pack for RP/RPi review and downstream batch review."),
        @("URS-4.2.6", "The system shall record the uploader, upload date, upload time, document category, and current document status for audit trail purposes.")
    )

    Add-ReqSection $doc $selection "4.3 RP/RPi Documents Review and Approval" "The RP/RPi workflow shall allow authorised users to review the completed Goods-In pack digitally and approve or reject it with a controlled sign-off." @(
        @("URS-4.3.1", "The system shall provide an RP/RPi review queue containing Goods-In packs that have completed the mandatory Goods-In checklist and document upload requirements."),
        @("URS-4.3.2", "The system shall allow the RP/RPi user to view the generated PO packing list and all uploaded Goods-In documents in one place."),
        @("URS-4.3.3", "The system shall allow the RP/RPi user to confirm document completeness, accuracy, and suitability for downstream batch review."),
        @("URS-4.3.4", "The system shall allow the RP/RPi user to mark documents or packs as missing, incorrect, rejected, or requiring follow-up."),
        @("URS-4.3.5", "The system shall require RP/RPi digital approval before the pack is released to the Batch Checker queue."),
        @("URS-4.3.6", "The system shall capture RP/RPi reviewer identity, role, decision, comments, date, and time for each approval or rejection.")
    )

    Add-ReqSection $doc $selection "4.4 Batch Checker Queue and Accepted Stock Review" "The Batch Checker workflow shall receive approved packs and allow review of accepted stock before Product Check Log completion." @(
        @("URS-4.4.1", "The system shall provide a Batch Checker queue containing only packs approved by RP/RPi review."),
        @("URS-4.4.2", "The system shall display key accepted stock information required for batch verification, including product, supplier, batch number, expiry date, quantity, boxes, manufacturer details, and related document status."),
        @("URS-4.4.3", "The system shall allow the Batch Checker to open and review Goods-In and RP/RPi evidence before starting Product Check Log completion."),
        @("URS-4.4.4", "The system shall identify any missing mandatory information or rejected document status before the Batch Checker can complete sign-off."),
        @("URS-4.4.5", "The system shall keep the Batch Checker queue status visible to authorised users so that outstanding batches can be monitored.")
    )

    Add-ReqSection $doc $selection "4.5 Product Line Selection and Batch Verification" "The Batch Checker shall be able to select the correct product line and complete required product and batch verification checks digitally." @(
        @("URS-4.5.1", "The system shall allow the Batch Checker to select the applicable product line for the approved PO or batch."),
        @("URS-4.5.2", "The system shall support verification of product details against PLPI/system data, physical sample, invoice, supplier declaration, and supporting records."),
        @("URS-4.5.3", "The system shall require confirmation of batch number, expiry date, quantity, manufacturer details, and relevant product attributes before completion."),
        @("URS-4.5.4", "The system shall allow evidence or comments to be captured where verification requires clarification or supporting proof."),
        @("URS-4.5.5", "The system shall record the Batch Checker user, date, and time for each verification confirmation.")
    )

    Add-ReqSection $doc $selection "4.6 Product Check Log and Line Clearance" "The Product Check Log shall be completed as a digital PLPI workflow, including line clearance and required user confirmation." @(
        @("URS-4.6.1", "The system shall replace the paper Product Check Log with a digital Product Check Log workflow in PLPI for Phase 1 scope."),
        @("URS-4.6.2", "The system shall require completion of all mandatory Product Check Log fields before generation or final sign-off."),
        @("URS-4.6.3", "The system shall provide line clearance checks within PLPI and require the Batch Checker to complete line clearance before the batch moves forward."),
        @("URS-4.6.4", "The system shall prevent Product Check Log completion where mandatory batch verification, document review, or line clearance is incomplete."),
        @("URS-4.6.5", "The system shall generate a Product Check Log record that can be reviewed and used by downstream stages."),
        @("URS-4.6.6", "The generated PCL record shall include relevant batch details, document status, line clearance confirmation, user sign-off, date, and time.")
    )

    Add-ReqSection $doc $selection "4.7 Workflow Status, Audit Trail and Record Retention" "The system shall provide clear workflow progression, controlled status visibility, and traceable records across Phase 1." @(
        @("URS-4.7.1", "The system shall show the current workflow status for each PO or batch across Goods-In, RP/RPi Review, and Batch Checker / Product Check Log stages."),
        @("URS-4.7.2", "The system shall capture an audit trail for key activities including document upload, checklist completion, review decision, rejection, approval, line clearance, PCL generation, and sign-off."),
        @("URS-4.7.3", "The audit trail shall include user, role, date, time, action, status change, and comments where applicable."),
        @("URS-4.7.4", "The system shall retain the completed digital pack in PLPI so that records are available for review without relying on paper handoff."),
        @("URS-4.7.5", "The system shall maintain access to completed evidence for authorised business, QA, IT, operational, and audit review users according to access permissions.")
    )

    Add-ReqSection $doc $selection "4.8 Exceptions, Rejections and Missing Document Handling" "The workflow shall support controlled handling of missing information, incorrect documents, and review exceptions." @(
        @("URS-4.8.1", "The system shall allow authorised users to flag missing, incorrect, or incomplete documents during Goods-In, RP/RPi review, or Batch Checker review."),
        @("URS-4.8.2", "The system shall allow rejection comments or follow-up notes to be recorded against the relevant document, checklist, or batch stage."),
        @("URS-4.8.3", "The system shall return rejected or incomplete packs to the appropriate previous user queue for correction where required."),
        @("URS-4.8.4", "The system shall prevent onward progression until mandatory corrections are completed and the required review or approval is re-performed."),
        @("URS-4.8.5", "The system shall retain the history of rejection, correction, resubmission, and approval actions in the audit trail.")
    )

    Add-ReqSection $doc $selection "4.9 Reporting and Downstream Handoff" "The Phase 1 workflow shall provide enough visibility and output records to support downstream stages even though those stages are outside the current implementation scope." @(
        @("URS-4.9.1", "The system shall make the completed Goods-In, RP/RPi review, and Product Check Log records available to authorised downstream users."),
        @("URS-4.9.2", "The system shall provide clear status indicators for batches awaiting Goods-In completion, RP/RPi review, Batch Checker action, correction, approval, or downstream handoff."),
        @("URS-4.9.3", "The system shall support generation or viewing of the completed digital pack for business, QA, and operational review."),
        @("URS-4.9.4", "The system shall ensure that Phase 1 completion status is clear before any later BAR or production-stage activity is started in future phases.")
    )

    Add-Para $doc $selection "5. User Access" "Heading 1"
    Add-Para $doc $selection "Access shall be role based. Users shall only be able to perform the actions required for their operational responsibility. View access may be granted to authorised business, QA, IT, and audit users where required." "Normal"
    $access = @(
        @("User Role", "Required Access / Responsibility"),
        @("Goods-In User", "Search or select PO, review packing list information, upload Goods-In documents, complete digital Goods-In checklist, verify quantity and boxes, attach evidence, and complete Goods-In sign-off."),
        @("RP / RPi User", "Review Goods-In uploaded documents, verify completeness, approve or reject the digital pack, add comments, and complete RP/RPi sign-off."),
        @("Batch Checker", "Review approved pack, select product line, complete batch verification, review documents, complete line clearance, generate PCL, and sign off."),
        @("QA / RP Reviewer", "View records and audit trail, review completed packs, support compliance review, and access evidence for investigation or audit."),
        @("Operations Supervisor", "View stage status, monitor outstanding tasks, and support operational follow-up without overriding controlled sign-off."),
        @("IT Administrator", "Maintain user access, configuration, document categories, workflow queues, and technical support activities according to change control.")
    )
    [void](Add-Table $doc $selection $access @(130, 375) $true)

    Add-Para $doc $selection "6. Testing" "Heading 1"
    Add-Para $doc $selection "Testing shall confirm that the Phase 1 PLPI workflow supports the agreed user requirements, role permissions, mandatory checks, document upload, digital sign-off, stage progression, exception handling, generated records, and audit trail behaviour." "Normal"
    $testing = @(
        @("Test Area", "Expected Test Coverage"),
        @("Goods-In Workflow", "PO selection, packing list display, checklist completion, mandatory evidence, box and quantity verification, and Goods-In sign-off."),
        @("Document Upload", "Document categories, upload status, mandatory document control, evidence attachment, metadata capture, and visibility in later stages."),
        @("RP/RPi Review", "Review queue, document viewing, completeness checks, approval, rejection, comments, and return for correction."),
        @("Batch Checker / PCL", "Approved queue, product line selection, batch verification, document review, line clearance, PCL generation, and completion blocking rules."),
        @("Audit Trail", "Capture of user, role, date, time, action, status, comments, upload details, sign-off, rejection, correction, and approval history."),
        @("Access Control", "Role-specific create, review, approve, reject, view, and administrator permissions."),
        @("Regression / Handoff", "Confirmation that Phase 1 changes do not alter existing GMP control intent or downstream stage responsibilities.")
    )
    [void](Add-Table $doc $selection $testing @(135, 370) $true)

    Add-Para $doc $selection "7. Documents" "Heading 1"
    Add-Para $doc $selection "The following documents and records are expected to be used, uploaded, reviewed, generated, or retained as part of the Phase 1 digital workflow." "Normal"
    $documents = @(
        @("Document / Record", "Phase 1 Use"),
        @("Purchase Order", "Used for Goods-In selection and packing list reference."),
        @("Supplier Invoice", "Uploaded and reviewed as part of Goods-In and RP/RPi pack review."),
        @("Supplier Declaration", "Uploaded and reviewed to support product and batch verification."),
        @("Supplier Packing List", "Uploaded or referenced to confirm received goods and packing information."),
        @("Temperature Record", "Uploaded where temperature evidence is applicable to the received goods."),
        @("Goods-In Checklist", "Completed digitally in PLPI instead of relying on a printed checklist."),
        @("Delivery Details / Evidence", "Captured or uploaded to support Goods-In receipt and document review."),
        @("RP/RPi Review Record", "Created through digital review, approval, rejection, and sign-off."),
        @("Product Check Log", "Generated digitally after batch verification and line clearance completion."),
        @("Audit Trail", "Retained by the system for user, date, time, action, status, and evidence history.")
    )
    [void](Add-Table $doc $selection $documents @(145, 360) $true)

    Add-Para $doc $selection "8. Support" "Heading 1"
    Add-Para $doc $selection "Business, QA, Operations, and IT shall support the implementation and controlled use of the Phase 1 PLPI paperless workflow. Operational users shall confirm that the digital workflow reflects the required checks and handoffs. QA/RP users shall confirm that required evidence, review decisions, sign-offs, and audit trail expectations are maintained. IT shall support configuration, access control, technical issue resolution, and controlled changes through the applicable change process." "Normal"
    Add-Para $doc $selection "Any future extension to BAR Creation, label printing, leaflet printing, carton/braille, assembly, Post-Assembly QC, Pre-QP, or QP Approval shall be managed as a later project phase and shall not be treated as part of this Phase 1 implementation unless formally approved through scope change." "Normal"

    try {
        $doc.BuiltInDocumentProperties.Item("Title").Value = "URS - PLPI Batch Record / Paperless Process Improvement Phase 1"
        $doc.BuiltInDocumentProperties.Item("Subject").Value = "User Requirement Specification"
        $doc.BuiltInDocumentProperties.Item("Author").Value = "Business Analyst"
    } catch {
        Write-Output "Metadata properties were not updated by Word; continuing with document generation."
    }
    Write-Output "Saving DOCX..."
    $doc.SaveAs2($outDocx, 16)
    Write-Output "Saved DOCX."
    # PDF export disabled during primary DOCX generation.
    $doc.Close($true)
    Write-Output "DOCX=$outDocx"
    Write-Output "PDF=$outPdf"
}
finally {
    if ($doc -ne $null) {
        try { $doc.Close($false) } catch {}
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) | Out-Null
    }
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}




