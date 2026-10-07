param(
    [Parameter(Mandatory = $true)][string]$TemplateDocx,
    [Parameter(Mandatory = $true)][string]$CurrentDocx,
    [Parameter(Mandatory = $true)][string]$OutputDocx,
    [Parameter(Mandatory = $true)][string]$WorkingDirectory
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (-not (Test-Path -LiteralPath $WorkingDirectory)) {
    New-Item -ItemType Directory -Path $WorkingDirectory -Force | Out-Null
}

$template = (Resolve-Path -LiteralPath $TemplateDocx).Path
$current = (Resolve-Path -LiteralPath $CurrentDocx).Path
$workingDocx = Join-Path $WorkingDirectory 'phase3-ds-rebuilt.docx'
Copy-Item -LiteralPath $template -Destination $workingDocx -Force

# Extract only the current Phase 3 wireframe images. The source document stores
# the fourteen body figures as image1.png through image14.png.
$imageDirectory = Join-Path $WorkingDirectory 'phase3-images'
if (-not (Test-Path -LiteralPath $imageDirectory)) {
    New-Item -ItemType Directory -Path $imageDirectory -Force | Out-Null
}
$zip = [IO.Compression.ZipFile]::OpenRead($current)
try {
    for ($i = 1; $i -le 14; $i++) {
        $entry = $zip.GetEntry("word/media/image$i.png")
        if (-not $entry) { throw "Current DS image$i.png was not found." }
        $destination = Join-Path $imageDirectory ("image$i.png")
        $input = $entry.Open()
        $output = [IO.File]::Create($destination)
        try { $input.CopyTo($output) } finally { $output.Dispose(); $input.Dispose() }
    }
}
finally { $zip.Dispose() }

$word = $null
$doc = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open($workingDocx, $false, $false)

    # Retain the Phase 2 template first-page, TOC, header, footer and styles;
    # only update the Phase 3 title and document identifier.
    foreach ($storyType in @(1, 6, 7, 8, 9, 10, 11)) {
        try {
            $story = $doc.StoryRanges.Item($storyType)
            while ($story) {
                $find = $story.Find
                $find.ClearFormatting()
                $find.Replacement.ClearFormatting()
                [void]$find.Execute('Design Specification: PLPI Batch Record Automation Phase 2', $false, $false, $false, $false, $false, $true, 1, $false, 'Design Specification: PLPI Batch Record Automation Stages 9-12', 2)
                $find = $story.Find
                $find.ClearFormatting()
                $find.Replacement.ClearFormatting()
                [void]$find.Execute('PLPI/BAR/DS/01/v1', $false, $false, $false, $false, $false, $true, 1, $false, 'PLPI/BAR/DS/02/v1', 2)
                $story = $story.NextStoryRange
            }
        }
        catch { }
    }

    # Remove the Phase 2 process body while retaining its page-1 and page-2
    # template furniture. Locate the real Heading 1, not its TOC entry.
    $bodyStart = $null
    for ($i = 1; $i -le $doc.Paragraphs.Count; $i++) {
        $paragraph = $doc.Paragraphs.Item($i)
        $text = ($paragraph.Range.Text -replace '[\r\a]', '').Trim()
        $style = '' + $paragraph.Range.Style.NameLocal
        if ($text -eq '1. Introduction' -and $style -eq 'Heading 1') {
            $bodyStart = $paragraph.Range.Start
            break
        }
    }
    if ($null -eq $bodyStart) { throw 'The Phase 2 body start could not be located.' }
    $deleteRange = $doc.Range($bodyStart, $doc.Content.End - 1)
    $deleteRange.Delete()

    $selection = $word.Selection
    $selection.SetRange($doc.Content.End - 1, $doc.Content.End - 1)

    function Set-Style([string]$styleName) {
        $script:selection.Style = $styleName
        $script:selection.Font.Reset()
        $script:selection.ParagraphFormat.Alignment = 0
    }

    function Add-Paragraph([string]$text, [string]$styleName = 'Body Text') {
        Set-Style $styleName
        $script:selection.TypeText($text)
        $script:selection.TypeParagraph()
    }

    function Add-LabelParagraph([string]$label, [string]$text) {
        Set-Style 'Body Text'
        $script:selection.Font.Bold = 1
        $script:selection.TypeText($label)
        $script:selection.Font.Bold = 0
        $script:selection.TypeText($text)
        $script:selection.TypeParagraph()
    }

    function Add-Figure([int]$number, [double]$widthInches, [string]$caption) {
        Set-Style 'Normal'
        $script:selection.ParagraphFormat.Alignment = 1
        $path = Join-Path $script:imageDirectory ("image$number.png")
        $shape = $script:selection.InlineShapes.AddPicture($path, $false, $true)
        $shape.LockAspectRatio = -1
        $shape.Width = $widthInches * 72
        $script:selection.Collapse(0)
        $script:selection.TypeParagraph()
        Set-Style 'No Spacing'
        $script:selection.ParagraphFormat.Alignment = 1
        $script:selection.Font.Italic = 1
        $script:selection.TypeText("Figure $number - $caption")
        $script:selection.Font.Italic = 0
        $script:selection.TypeParagraph()
    }

    function Add-AbbreviationTable {
        $items = @(
            @('IT', 'Information Technology'),
            @('URS', 'User Requirement Specification'),
            @('DS', 'Design Specification'),
            @('FS', 'Functional Specification'),
            @('PLPI', 'Parallel Import / PLPI workflow system'),
            @('B&S', 'B&S Healthcare / controlled batch identifier'),
            @('BAR', 'Batch Assembly Record'),
            @('PCL', 'Product Check Log'),
            @('ECMA', 'Approved packaging or artwork reference'),
            @('MFG', 'Manufacturer / Manufacturing'),
            @('QA / QC', 'Quality Assurance / Quality Control'),
            @('GMP', 'Good Manufacturing Practice'),
            @('IPC', 'In-Process Check'),
            @('QP', 'Qualified Person'),
            @('IMP', 'Investigational Medicinal Product')
        )
        $range = $script:selection.Range
        $table = $script:doc.Tables.Add($range, $items.Count, 2)
        $table.Style = 'Table Grid'
        $table.AllowAutoFit = $false
        $table.Columns.Item(1).Width = 1.55 * 72
        $table.Columns.Item(2).Width = 4.45 * 72
        for ($r = 1; $r -le $items.Count; $r++) {
            $table.Cell($r, 1).Range.Text = $items[$r - 1][0]
            $table.Cell($r, 2).Range.Text = $items[$r - 1][1]
            foreach ($c in 1..2) {
                $cellRange = $table.Cell($r, $c).Range
                $cellRange.Style = 'Body Text'
                $cellRange.ParagraphFormat.SpaceAfter = 0
                $table.Cell($r, $c).VerticalAlignment = 1
            }
        }
        $script:selection.SetRange($table.Range.End, $table.Range.End)
        $script:selection.TypeParagraph()
    }

    Add-Paragraph '1. Introduction' 'Heading 1'
    Add-Paragraph 'PLPI Batch Record Automation stages 9-12 extend the controlled electronic BAR workflow from Pre-Assembly QC through Production Controller handheld stock take-out and room allocation, Assembly Room execution and Post-Assembly QC. This design defines the screen behaviour, controlled data, validation, signature, audit and hand-off rules required by the approved Phase 3 URS and FS.'

    Add-Paragraph '1.1 Purpose of the Document' 'Heading 2'
    Add-Paragraph 'This document defines the logical screen and workflow design required to implement the approved Stage 9-12 URS and FS. It describes the current wireframe controls, displayed data, permitted user actions, validation rules, status changes, audit attribution and completion conditions. Physical database, interface, infrastructure and device-management choices remain outside this DS unless already defined by the approved project documents.'

    Add-Paragraph '1.2 Scope' 'Heading 2'
    Add-Paragraph 'The scope starts when a printing-complete batch becomes available to Pre-Assembly QC and ends when Post-Assembly QC has signed the completed production-check record and released it to Pre-QP. It includes Pre-Assembly material and reference-sample verification; Production Controller Stock Take Out, box verification, Line Clearance and Assembly Room allocation on the SeUIC handheld; Assembly Room attendance, batch lifecycle, four controlled assembly pages and reconciliation; and Post-Assembly finished-pack verification, box allocation, Quarantine Label control and sign-off.'
    Add-Paragraph 'Out of scope: Stage 8 printing activities before the batch enters Pre-Assembly QC, Stage 13 Pre-QP processing after Post-Assembly QC completion, and any physical architecture or integration decision not established by the approved URS, FS or current wireframes.'

    Add-Paragraph '1.3 Abbreviations' 'Heading 2'
    Add-Paragraph 'These abbreviations are used throughout this document.'
    Add-AbbreviationTable

    Add-Paragraph '2. Overall Description' 'Heading 1'
    Add-Paragraph 'Stage 9 receives only batches that have completed the preceding printing and route-specific preparation activities. The Pre-Assembly QC user searches the eligible queue, opens one controlled record, confirms the printed-material rows and line-clearance information, records specimen, leaflet-fold and tamper-seal counts, reviews the approved mock-up and signs the record. Successful sign-off makes the record read-only and makes the batch available to Production Control.'
    Add-Paragraph 'The Production Controller uses the approved SeUIC handheld path GOODS IN > STOCK TAKE OUT. The controller identifies the stock, verifies the Box ID, completes a new Line Clearance, confirms the box count and assigns the batch to an approved Assembly Room. Confirmation records the user and date/time, updates the BAR once and publishes the batch only to the selected room.'
    Add-Paragraph 'The Assembly Room user sees only batches allocated to that room. After attendance and batch-start confirmation, the user completes Initial Checks, Random Sample Check, IPC Checks with required evidence, and Reconciliation and Closure. Each page is signed independently and becomes read-only. The batch can be finished only when all four pages are signed and no unresolved condition remains.'
    Add-Paragraph 'Post-Assembly QC receives only Assembly-complete batches. The user records finished-pack and box quantities, confirms any required per-box allocation, verifies every Pack Details Against BAR row, prints the controlled Quarantine Label and signs the completed record. Successful sign-off locks the record and releases it to the Pre-QP stage.'
    Add-LabelParagraph 'Workflow control: ' 'A cancelled, failed or incomplete action does not advance the batch. Every completion action rechecks the required data and current status. Completed records remain read-only in the normal workflow; an approved correction retains the original value, the changed value, the reason, the authorised user and date/time.'

    Add-Paragraph '3. Design Specification' 'Heading 1'
    Add-Paragraph 'The following sections define the screen and workflow design required to satisfy the approved Stage 9-12 URS and FS.'

    Add-Paragraph '3.1 Pre-Assembly QC Module' 'Heading 2'
    Add-Paragraph 'The Pre-Assembly QC queue is the Stage 9 entry point. Search and selection operate only on batches eligible for Pre-Assembly verification. Queue information is read-only and opening a completed record displays its retained history without enabling a second sign-off.'
    Add-Figure 1 5.97 'Pre-Assembly QC batch queue'
    Add-LabelParagraph 'Callout 1 - Search criteria. ' 'B&S Batch Number and MFG Lot No. filter the eligible Stage 9 records.'
    Add-LabelParagraph 'Callout 2 - Queue results. ' 'Product, strength, pack, route, quantity and status values are displayed from the selected controlled batch and are not edited in the queue.'
    Add-LabelParagraph 'Callout 3 - Active and completed records. ' 'An active record opens for controlled completion. A signed record opens read-only and cannot be signed again.'
    Add-Figure 2 5.97 'Pre-Assembly verification, reference-sample controls and sign-off'
    Add-LabelParagraph 'Callout 1 - Product and route information. ' 'The selected batch populates the product information and the approved Reboxing or Relabelling route context read-only.'
    Add-LabelParagraph 'Callout 2 - Route-specific information. ' 'Reboxing displays MARKS, Reason when MARKS changes, Cartons Per Pack and Change of Pack Size information. Relabelling displays Product Reference, Leaflet Reference and Braille Required.'
    Add-LabelParagraph 'Callout 3 - Printed-material checklist. ' 'Each applicable label, leaflet, blister or other controlled component displays its Type Of label and Reference code and requires Checked & Confirmed.'
    Add-LabelParagraph 'Callout 4 - Controlled counts. ' 'No. of specimen, No. of Leaflet Folds and Tamper seal per pack accept whole-number values. A blank required value is not treated as zero.'
    Add-LabelParagraph 'Callout 5 - Mockup and Print BAR. ' 'The approved mock-up and BAR open for preparation or comparison. Opening or printing does not sign or complete the record.'
    Add-LabelParagraph 'Callout 6 - User Sign Off. ' 'The action becomes available only after every displayed material check, required count, line-clearance item, conditional reason and applicable route amendment is complete.'
    Add-LabelParagraph 'Detailed design sequence: ' ''
    Add-Paragraph 'Step 1 - The authorised user searches by B&S Batch Number or MFG Lot No. and opens one eligible batch.'
    Add-Paragraph 'Step 2 - PLPI displays the selected product, route, approved references and original MARKS values read-only.'
    Add-Paragraph 'Step 3 - The user confirms every applicable printed-material row and completes the line-clearance and count fields.'
    Add-Paragraph 'Step 4 - If MARKS changes, the user enters the mandatory reason and completes the applicable amendment initials.'
    Add-Paragraph 'Step 5 - The user opens the approved Mockup and prepares or compares the assembly reference sample.'
    Add-Paragraph 'Step 6 - User Sign Off rechecks all displayed requirements, records the authenticated user and date/time, locks the Stage 9 record and makes the batch available to Production Control.'
    Add-LabelParagraph 'Validation and error handling: ' 'Missing checks, blank or invalid counts, a required MARKS reason, incomplete route amendments or a stale/completed record prevent sign-off. Back, cancellation or print failure does not create a completed Stage 9 record.'
    Add-LabelParagraph 'Entry condition: ' 'The batch has completed the required preceding printing and route preparation activities.'
    Add-LabelParagraph 'Exit condition: ' 'The signed Pre-Assembly record is read-only and the batch is available to Production Control.'
    Add-LabelParagraph 'URS traceability: ' 'URS 4.1.1-4.1.12. FS traceability: FS 3.1.'

    Add-Paragraph '3.2 Production Controller Handheld / Room Allocation Module' 'Heading 2'
    Add-Paragraph 'The Production Controller performs Stage 10 on the approved SeUIC handheld. GOODS IN, STOCK TAKE OUT, stock details, Box ID verification and Line Clearance are separate screen states. Navigation away from an unconfirmed screen does not complete or update the BAR.'
    Add-Figure 3 2.64 'SeUIC GOODS IN menu used by the Production Controller'
    Add-LabelParagraph 'Callout 1 - STOCK TAKE OUT. ' 'This menu option is the Stage 10 entry point. Other menu tiles are outside the Stage 10 workflow.'
    Add-Figure 4 2.64 'Stock Take Out details and TRANSFER action'
    Add-LabelParagraph 'Callout 1 - Stock ID. ' 'The controller scans or manually enters the Stock ID used to load the controlled stock record.'
    Add-LabelParagraph 'Callout 2 - Stock details. ' 'Product Name, Part No., Batch No., Goods In Boxes, Qty., Location, IMP and Contract populate read-only for the selected Stock ID.'
    Add-LabelParagraph 'Callout 3 - TRANSFER. ' 'The action opens Box ID verification for the displayed stock record.'
    Add-Figure 5 2.64 'Scan Box ID for Verification dialog'
    Add-LabelParagraph 'Callout 1 - Box ID. ' 'A scanned or entered Box ID is mandatory and must relate to the displayed stock.'
    Add-LabelParagraph 'Callout 2 - CONFIRM. ' 'A valid Box ID opens a new blank Line Clearance. Blank or invalid input displays validation and does not advance.'
    Add-LabelParagraph 'Callout 3 - CANCEL. ' 'The dialog closes without a transfer completion or BAR update.'
    Add-Figure 6 2.64 'Handheld Line Clearance and Assembly Room allocation'
    Add-LabelParagraph 'Callout 1 - Product-label check. ' 'The controller confirms that product name, expiry date and lot size on the box label agree with the displayed stock record.'
    Add-LabelParagraph 'Callout 2 - Number of boxes. ' 'The confirmed count must be a positive whole number. A changed value opens an old/new confirmation; Confirm accepts the new value and Cancel restores the previous value.'
    Add-LabelParagraph 'Callout 3 - Assign Assembly Room. ' 'The controller selects an approved room from the displayed list.'
    Add-LabelParagraph 'Callout 4 - CONFIRMED BY. ' 'The action is disabled until both checks, the settled box count and the room are complete. Success displays BAR UPDATED together with the user, date/time and room and locks the completed form.'
    Add-LabelParagraph 'Detailed handheld sequence: ' ''
    Add-Paragraph 'Step 1 - Open GOODS IN and select STOCK TAKE OUT.'
    Add-Paragraph 'Step 2 - Scan or enter Stock ID and review the read-only stock details.'
    Add-Paragraph 'Step 3 - Select TRANSFER, scan or enter the Box ID and select CONFIRM.'
    Add-Paragraph 'Step 4 - Complete the product-label check and confirm the positive whole-number box count.'
    Add-Paragraph 'Step 5 - When the count changes, explicitly confirm the new value or cancel to restore the previous value.'
    Add-Paragraph 'Step 6 - Select the Assembly Room and use CONFIRMED BY. PLPI records the box verification, both checks, confirmed count, room, user and date/time and updates the BAR once.'
    Add-Paragraph 'Step 7 - A later transfer opens a new blank Line Clearance. The earlier signed form is retained only as read-only history.'
    Add-LabelParagraph 'Validation and error handling: ' 'Blank or invalid Stock ID or Box ID, a non-positive or non-whole box count, an unresolved count change, an incomplete check, a missing room or a previously completed record prevents confirmation. Back, Cancel or Power before CONFIRMED BY creates no Line Clearance completion or room allocation.'
    Add-LabelParagraph 'Entry condition: ' 'Stage 9 is complete and the stock record remains available for Stock Take Out.'
    Add-LabelParagraph 'Exit condition: ' 'The signed Line Clearance and room allocation are read-only and the batch is available only to the assigned Assembly Room.'
    Add-LabelParagraph 'URS traceability: ' 'URS 4.2.1-4.2.20. FS traceability: FS 3.2.'

    Add-Paragraph '3.3 Assembly Room Module' 'Heading 2'
    Add-Paragraph 'The Assembly Room queue displays only batches allocated to the authorised room. Active and Completed views are separate. Search and Refresh do not change batch data. Check In and Check Out record room attendance independently from batch completion.'
    Add-Figure 7 5.97 'Assembly Room batch queue and room-controlled work list'
    Add-LabelParagraph 'Callout 1 - Queue eligibility. ' 'Only batches assigned by Production Control to the selected room are displayed.'
    Add-LabelParagraph 'Callout 2 - Search and Refresh. ' 'B&S Batch, MFG Lot No. or product identity filters the current view; Refresh reloads the authorised room queue.'
    Add-LabelParagraph 'Callout 3 - Active and Completed. ' 'Active batches may be opened according to their lifecycle state. Completed batches remain read-only.'
    Add-LabelParagraph 'Callout 4 - Check In / Check Out. ' 'Each attendance action records the authenticated user, room and date/time and does not sign an Assembly page.'
    Add-Figure 8 5.97 'Assembly start confirmation'
    Add-LabelParagraph 'Callout 1 - Start confirmation. ' 'Opening an unstarted batch requires confirmation before the Assembly lifecycle begins.'
    Add-LabelParagraph 'Callout 2 - Start attribution. ' 'Successful confirmation records Assembly Started By, start date/time and the allocated room once.'
    Add-LabelParagraph 'Callout 3 - Runtime controls. ' 'Break and Resume retain the batch in progress. Partial Finish records completed quantity and remaining quantity; Partial Start records the later restart. These actions do not sign a page or finish the batch.'
    Add-Figure 9 5.97 'Initial Checks controlled page'
    Add-LabelParagraph 'Callout 1 - Lifecycle Audit and Team Briefing. ' 'The page displays the batch lifecycle and records the required team-briefing confirmation.'
    Add-LabelParagraph 'Callout 2 - Initial confirmations. ' 'BAR available and correct, specimen available, room clean and ready, printed components received and component boxes accounted for are mandatory.'
    Add-LabelParagraph 'Callout 3 - Mark Done. ' 'The action remains disabled until every required item is complete. Success records user/date-time and makes Page 1 read-only.'
    Add-Figure 10 5.97 'Random Sample Check controlled page'
    Add-LabelParagraph 'Callout 1 - Sample rows. ' 'One row is displayed for every applicable confirmed box and retains Box No., MFG Lot No. and Expiry Date.'
    Add-LabelParagraph 'Callout 2 - Checked status. ' 'Each row requires the controlled sample confirmation and attribution.'
    Add-LabelParagraph 'Callout 3 - Page completion. ' 'The page cannot be signed until every required box row is complete. A later box correction follows the approved correction route and does not silently remove sample history.'
    Add-Figure 11 5.97 'IPC Checks and supporting evidence'
    Add-LabelParagraph 'Callout 1 - Required IPC rows. ' 'The displayed scheduled or minimum IPC checks retain their check identity, sequence or time, result, user and date/time.'
    Add-LabelParagraph 'Callout 2 - Additional checks. ' 'An authorised user may add a permitted IPC row without changing the earlier recorded rows.'
    Add-LabelParagraph 'Callout 3 - Photo evidence. ' 'Take Picture or file selection associates the required image with the current batch and IPC event.'
    Add-LabelParagraph 'Callout 4 - Failed IPC. ' 'A failed result prevents page and final completion until the defined authorised resolution and reason are recorded.'
    Add-Figure 12 5.97 'Reconciliation and Closure controlled page'
    Add-LabelParagraph 'Callout 1 - Material reconciliation. ' 'The page records the displayed Received, Used, Damaged and discrepancy values for each applicable component.'
    Add-LabelParagraph 'Callout 2 - Totals and yield. ' 'Total Used, Retention Sample, Yield and Total Damaged are calculated or entered according to the approved rule and are rechecked when the page is completed.'
    Add-LabelParagraph 'Callout 3 - End-of-Batch Clearance. ' 'Every displayed room and material clearance confirmation is mandatory.'
    Add-LabelParagraph 'Callout 4 - Mark Done and Finish Batch. ' 'Mark Done signs only the current page. Finish Batch becomes available only after Pages 1-4 are signed, required evidence exists and no unresolved reconciliation or IPC condition remains.'
    Add-LabelParagraph 'Detailed Assembly sequence: ' ''
    Add-Paragraph 'Step 1 - The authorised room user opens an allocated batch and confirms Start Batch.'
    Add-Paragraph 'Step 2 - Complete and sign Initial Checks.'
    Add-Paragraph 'Step 3 - Complete every required Random Sample row and sign the page.'
    Add-Paragraph 'Step 4 - Complete the required and permitted additional IPC rows, attach required evidence and sign the page.'
    Add-Paragraph 'Step 5 - Complete Reconciliation and Closure, including End-of-Batch Clearance, and sign the page.'
    Add-Paragraph 'Step 6 - Finish Batch rechecks all four page signatures and unresolved conditions, records finish user/date-time, locks the Assembly record and makes the batch available to Post-Assembly QC.'
    Add-LabelParagraph 'Validation and error handling: ' 'A user cannot open a batch assigned to another room, overwrite a signed page, omit a required sample row or IPC image, or complete the batch with an unresolved IPC or reconciliation condition. Break, Back or interruption retains completed page signatures but does not create final completion.'
    Add-LabelParagraph 'Entry condition: ' 'Stage 10 room allocation is confirmed for the current room.'
    Add-LabelParagraph 'Exit condition: ' 'All four Assembly pages and the lifecycle completion are read-only and the batch is available to Post-Assembly QC.'
    Add-LabelParagraph 'URS traceability: ' 'URS 4.3.1-4.3.4, 4.3.7-4.3.12, 4.3.15, 4.3.17-4.3.21 and 4.3.23-4.3.30. FS traceability: FS 3.3.'

    Add-Paragraph '3.4 Post-Assembly QC Module' 'Heading 2'
    Add-Paragraph 'The Post-Assembly QC queue contains only Assembly-complete batches. Search and selection do not change the batch. Active records open for controlled completion; completed records remain available as read-only history.'
    Add-Figure 13 5.97 'Post-Assembly QC active and completed batch queue'
    Add-LabelParagraph 'Callout 1 - Search criteria. ' 'BNS Batch No. and MFG Lot No. filter the eligible Post-Assembly records.'
    Add-LabelParagraph 'Callout 2 - Queue values. ' 'Product, description, quantity, assembled quantity, room, expiry, pack size and status values remain read-only.'
    Add-LabelParagraph 'Callout 3 - Active and Completed. ' 'An active record opens for Stage 12 checks. A completed record cannot be signed again.'
    Add-Figure 14 5.97 'Production Checking quantities, BAR comparison, label actions and sign-off'
    Add-LabelParagraph 'Callout 1 - Finished quantities. ' 'Total Packs, Total Boxes and No. of Packs Checked accept positive whole numbers. The approved batch-size rule supplies or validates the sample quantity.'
    Add-LabelParagraph 'Callout 2 - Quantity in Each Box. ' 'When Total Boxes is greater than one, the dialog provides one mandatory positive whole-number entry per box. Entered Total and Remaining are calculated and confirmation is available only when the box total equals Total Packs.'
    Add-LabelParagraph 'Callout 3 - Pack Details Against BAR. ' 'Every applicable row is generated for the selected batch and requires confirmation against the controlled BAR. A mismatch remains incomplete until its approved disposition is recorded.'
    Add-LabelParagraph 'Callout 4 - Quarantine Label. ' 'Test Print is a non-completing output. Print Quarantine Label uses the confirmed batch, box and quantity information and records the print result. Void or Reprint is restricted and requires a reason while retaining the original print event.'
    Add-LabelParagraph 'Callout 5 - User Sign Off. ' 'The action rechecks sampling, quantities, box allocation, every BAR comparison row and the controlled-label result. Success records Signed By and Signed At, makes the record read-only and releases the batch to Pre-QP.'
    Add-LabelParagraph 'Detailed Post-Assembly sequence: ' ''
    Add-Paragraph 'Step 1 - Search and open one Assembly-complete batch.'
    Add-Paragraph 'Step 2 - Record Total Packs, Total Boxes and No. of Packs Checked.'
    Add-Paragraph 'Step 3 - Where required, enter every box quantity and confirm only when the sum equals Total Packs.'
    Add-Paragraph 'Step 4 - Confirm every Pack Details Against BAR row and record required comments or disposition.'
    Add-Paragraph 'Step 5 - Produce the required controlled Quarantine Label; a Test Print does not complete the stage.'
    Add-Paragraph 'Step 6 - User Sign Off rechecks all requirements, records user/date-time, locks Stage 12 and makes the completed record available to Pre-QP.'
    Add-LabelParagraph 'Validation and error handling: ' 'An Assembly-incomplete batch, invalid quantities, missing per-box entries, a box-total mismatch, unchecked BAR rows, unresolved mismatch or unsuccessful controlled-label output prevents sign-off. A failed, cancelled, voided or reprinted label event retains its own status and does not replace the original event.'
    Add-LabelParagraph 'Entry condition: ' 'Stage 11 is complete.'
    Add-LabelParagraph 'Exit condition: ' 'The signed Stage 12 record is read-only, the batch has its controlled Quarantine Label status and the record is available to Pre-QP.'
    Add-LabelParagraph 'URS traceability: ' 'URS 4.4.1-4.4.3, 4.4.6, 4.4.8 and 4.4.10-4.4.17. FS traceability: FS 3.4.'

    Add-Paragraph '3.5 Workflow Status, Corrections and Audit Behaviour' 'Heading 2'
    Add-LabelParagraph 'Status control: ' 'Each queue derives its current status from completed controlled events. Opening, viewing, searching, refreshing, printing a test output or cancelling an action does not advance a batch.'
    Add-LabelParagraph 'Stage progression: ' 'Stage 9 sign-off makes the batch available to Production Control. Stage 10 confirmation makes it available only to the assigned Assembly Room. Stage 11 final completion makes it available to Post-Assembly QC. Stage 12 sign-off makes it available to Pre-QP.'
    Add-LabelParagraph 'Page completion: ' 'Each Assembly page produces its own completion attribution and lock state. A signed page does not imply that the other pages or the Assembly stage are complete.'
    Add-LabelParagraph 'Correction control: ' 'An approved correction records the affected batch and field, previous value, new value, reason, authorised user and date/time. The original controlled event remains available in history.'
    Add-LabelParagraph 'Room reallocation: ' 'Only an authorised role may change a confirmed allocation. The previous room, new room, reason, user and date/time are retained and the batch is not concurrently available in both rooms.'
    Add-LabelParagraph 'Interruption and resume: ' 'Committed signatures, attendance and lifecycle events remain recorded. Uncommitted values do not appear as completed data. The user returns to the last committed workflow state.'
    Add-LabelParagraph 'Audit content: ' 'Each controlled event retains the B&S Batch Number or MFG Lot No. where applicable, stage, action, result, authenticated user, role, date/time, status before and after, and any required reason, comment or previous/new value.'

    Add-Paragraph '4. Additional Non-Functional Requirements' 'Heading 1'
    Add-Paragraph '4.1 Audit Trail' 'Heading 2'
    Add-Paragraph 'PLPI shall retain successful and unsuccessful controlled events for Stage 9 material checks, counts, route changes, mock-up/BAR outputs and sign-off; Stage 10 stock, Box ID, count decision, Line Clearance, room allocation and BAR update; Stage 11 attendance, start, runtime, page completion, IPC evidence, hold, reconciliation and finish; and Stage 12 sampling, quantity, box allocation, BAR comparison, label and sign-off. Audit records shall not be replaced by a later status.'
    Add-Paragraph '4.2 Availability' 'Heading 2'
    Add-Paragraph 'The desktop modules and SeUIC handheld workflow shall operate within the approved PLPI operational window. If a required device, printer or service is unavailable, the user shall receive a clear status and the unavailable action shall not be represented as successful.'
    Add-Paragraph '4.3 Capacity Limits' 'Heading 2'
    Add-Paragraph 'Approved limits shall cover active and completed batches, boxes per batch, room attendance events, sample rows, IPC evidence, reconciliation rows, per-box allocations, controlled labels and retained history. Reaching a limit shall produce a controlled message without truncating controlled data.'
    Add-Paragraph '4.4 Performance' 'Heading 2'
    Add-Paragraph 'Queue search, record opening, handheld validation, page navigation, calculation, evidence attachment, controlled printing, signature and hand-off shall respond within the approved qualification targets. A long-running action shall show a clear in-progress or failure state and prevent duplicate submission.'
    Add-Paragraph '4.5 Recoverability' 'Heading 2'
    Add-Paragraph 'A recoverable interruption shall retain committed signatures, attendance, runtime events, evidence references, print results and audit history without duplication. Uncommitted Stage 9, handheld, Assembly-page or Stage 12 data shall return as incomplete and shall not create a downstream work item.'
    Add-Paragraph '4.6 Security Requirements' 'Heading 2'
    Add-Paragraph 'Only authorised roles shall access the applicable queue, room and controlled action. Signature identity shall come from the authenticated session and shall not be entered as free text. Completed records shall remain read-only except through an approved audited correction process.'
    Add-Paragraph '4.7 Error Handling' 'Heading 2'
    Add-Paragraph 'Validation messages shall identify the affected field, check, calculation, evidence, route, room or preceding-stage condition and the action required. Failed, stale or duplicate completion, BAR update, evidence save, print or hand-off requests shall not record a successful outcome.'
    Add-Paragraph '4.8 Usability' 'Heading 2'
    Add-Paragraph 'Desktop and handheld screens shall retain the approved labels, visible batch identity, readable status, mandatory-state indication and controlled action order shown in the current wireframes. Completed records shall display their attribution read-only and defined irreversible actions shall require confirmation.'
    Add-Paragraph '4.9 Accuracy and Validity' 'Heading 2'
    Add-Paragraph 'Batch, product, material, reference, quantity, box, room, sample, evidence, reconciliation, label and signature data shall remain linked to the selected controlled batch. Whole-number, total, remaining, discrepancy and yield rules shall be checked again when the applicable controlled action is completed.'
    Add-Paragraph '4.10 User Access and Responsibilities' 'Heading 2'
    Add-Paragraph 'Pre-Assembly QC, Production Controller, Assembly Room and Post-Assembly QC users shall access only their authorised queues and actions. Approved QA/QP, Operations, support and administration roles shall perform only the review, exception, configuration or diagnostic actions assigned to them and shall not obtain uncontrolled operational sign-off rights.'
    Add-Paragraph '4.11 Testing and Traceability' 'Heading 2'
    Add-Paragraph 'Verification shall cover the approved URS and FS references, displayed controls, role access, status transitions, positive paths, boundary values, negative validation, cancellation, interruption, duplicate prevention, correction, room allocation, evidence, printing, signature and stage hand-off. Regression testing shall confirm that the Stage 8 inbound and Stage 13 outbound boundaries remain controlled.'
    Add-Paragraph '4.12 Controlled Documents and Training' 'Heading 2'
    Add-Paragraph 'Applicable approved SOPs, work instructions, BAR forms, sampling rules, room procedures, handheld instructions, evidence handling, reconciliation, quarantine-label controls, exception routes and electronic-signature training shall be effective before release.'
    Add-Paragraph '4.13 Support and Administration' 'Heading 2'
    Add-Paragraph 'Authorised administrators shall maintain approved users, roles, rooms, handheld devices, scanner behaviour, cameras, printers and controlled configuration. Configuration changes, incidents, recovery and diagnostic access shall follow approved procedures and shall not alter completed operational records.'

    foreach ($toc in $doc.TablesOfContents) { $toc.Update() }
    $doc.Repaginate()
    $doc.Save()
    $pages = $doc.ComputeStatistics(2)
    $tables = $doc.Tables.Count
    $images = $doc.InlineShapes.Count
    $doc.Close($false)
    $doc = $null
    Copy-Item -LiteralPath $workingDocx -Destination $OutputDocx -Force
    "Rebuilt DS: pages=$pages tables=$tables bodyImages=$images"
}
finally {
    if ($doc) { $doc.Close($false) }
    if ($word) { $word.Quit() }
    if ($doc) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($doc) }
    if ($word) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
