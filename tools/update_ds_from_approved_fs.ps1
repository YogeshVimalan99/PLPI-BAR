$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$target = Join-Path $root 'docz\DS-PLPI BAR.docx'
$work = Join-Path $root 'temp_ds_edit'
$zipOut = Join-Path $root 'temp_ds_edit.docx'
$backup = Join-Path $root 'temp_ds_original_backup.docx'
$wNs = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
$xmlNs = 'http://www.w3.org/XML/1998/namespace'

$lock = $null
try {
    $lock = [System.IO.File]::Open($target, 'Open', 'ReadWrite', 'None')
}
catch {
    throw "The DS document is open or locked. Close it in Word and run the update again."
}
finally {
    if ($lock) { $lock.Dispose() }
}

Copy-Item -LiteralPath $target -Destination $backup -Force
if (Test-Path -LiteralPath $work) { Remove-Item -LiteralPath $work -Recurse -Force }
New-Item -ItemType Directory -Path $work | Out-Null

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($target, $work)

$documentPath = Join-Path $work 'word\document.xml'
$xml = New-Object System.Xml.XmlDocument
$xml.PreserveWhitespace = $true
$xml.Load($documentPath)
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace('w', $wNs)
$body = $xml.SelectSingleNode('//w:body', $ns)

function Get-ParagraphText {
    param([System.Xml.XmlNode]$Paragraph)
    $parts = @($Paragraph.SelectNodes('.//w:t', $ns) | ForEach-Object { $_.InnerText })
    return ($parts -join '')
}

function Find-BodyParagraph {
    param([string]$Text)
    foreach ($node in @($body.ChildNodes)) {
        if ($node.LocalName -eq 'p' -and (Get-ParagraphText $node) -eq $Text) {
            return $node
        }
    }
    throw "Paragraph not found: $Text"
}

function New-TextParagraph {
    param(
        [System.Xml.XmlNode]$Template,
        [string]$Text
    )
    $p = $Template.CloneNode($true)
    $pPr = $p.SelectSingleNode('./w:pPr', $ns)
    $runTemplate = $Template.SelectSingleNode('./w:r[1]', $ns)
    foreach ($child in @($p.ChildNodes)) {
        if ($child -ne $pPr) { [void]$p.RemoveChild($child) }
    }
    if ($runTemplate) {
        $run = $runTemplate.CloneNode($true)
        $rPr = $run.SelectSingleNode('./w:rPr', $ns)
        foreach ($child in @($run.ChildNodes)) {
            if ($child -ne $rPr) { [void]$run.RemoveChild($child) }
        }
    }
    else {
        $run = $xml.CreateElement('w', 'r', $wNs)
    }
    $t = $xml.CreateElement('w', 't', $wNs)
    [void]$t.SetAttribute('space', $xmlNs, 'preserve')
    $t.InnerText = $Text
    [void]$run.AppendChild($t)
    [void]$p.AppendChild($run)
    return $p
}

function Set-ParagraphText {
    param(
        [System.Xml.XmlNode]$Paragraph,
        [string]$Text
    )
    $replacement = New-TextParagraph $Paragraph $Text
    [void]$Paragraph.ParentNode.ReplaceChild($replacement, $Paragraph)
    return $replacement
}

function Replace-ExactText {
    param(
        [string]$Old,
        [string]$New
    )
    $paragraph = Find-BodyParagraph $Old
    [void](Set-ParagraphText $paragraph $New)
}

$bodyTemplate = (Find-BodyParagraph 'PLPI Batch Record Automation Phase 1 digitises the Goods Receiving Checklist and the controlled workflow from Goods-In through Responsible Person review and Product Check Log completion. The design retains existing PLPI functions unless a change is identified in this document.').CloneNode($true)
$captionTemplate = (Find-BodyParagraph 'Figure 1 - Goods Receiving Delivery stage and driver sign-off').CloneNode($true)
$heading2Template = (Find-BodyParagraph '3.1 Digital Goods Receiving Checklist').CloneNode($true)

$imageTemplates = @{}
foreach ($node in @($body.ChildNodes)) {
    if ($node.LocalName -ne 'p') { continue }
    $blip = $node.SelectSingleNode('.//*[local-name()="blip"]')
    if ($blip) {
        $embed = $blip.GetAttribute('embed', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
        if ($embed) { $imageTemplates[$embed] = $node.CloneNode($true) }
    }
}

function Item {
    param([string]$Kind, [string]$Text = '', [string]$Id = '')
    return [pscustomobject]@{ Kind = $Kind; Text = $Text; Id = $Id }
}

function Replace-Section {
    param(
        [string]$StartHeading,
        [string]$EndHeading,
        [object[]]$Items,
        [string]$NewStartHeading = ''
    )
    $start = Find-BodyParagraph $StartHeading
    $end = Find-BodyParagraph $EndHeading
    if ($NewStartHeading) {
        $start = Set-ParagraphText $start $NewStartHeading
    }
    $cursor = $start.NextSibling
    while ($cursor -and $cursor -ne $end) {
        $next = $cursor.NextSibling
        [void]$body.RemoveChild($cursor)
        $cursor = $next
    }
    foreach ($item in $Items) {
        switch ($item.Kind) {
            'body' { $node = New-TextParagraph $bodyTemplate $item.Text }
            'caption' { $node = New-TextParagraph $captionTemplate $item.Text }
            'heading2' { $node = New-TextParagraph $heading2Template $item.Text }
            'image' {
                if (-not $imageTemplates.ContainsKey($item.Id)) { throw "Image relationship not found: $($item.Id)" }
                $node = $imageTemplates[$item.Id].CloneNode($true)
            }
            default { throw "Unknown section item kind: $($item.Kind)" }
        }
        [void]$body.InsertBefore($node, $end)
    }
}

Replace-ExactText `
    'PLPI Batch Record Automation Phase 1 digitises the Goods Receiving Checklist and the controlled workflow from Goods-In through Responsible Person review and Product Check Log completion. The design retains existing PLPI functions unless a change is identified in this document.' `
    'PLPI Batch Record Automation digitises Goods-In receipt, document-pack creation, Responsible Person approval and Product Check Log completion within the existing PLPI application. Existing functions remain unchanged unless a design change is identified in this document.'

Replace-ExactText `
    'The scope covers the Packing List Verify & Print and LOG controls, the tablet-based Goods Receiving Checklist, RPi Documents, the new RPi Task module, combined PDF and email processing, Batch Checker evidence links, Product Verification and PCL preview/printing. Existing PLPI fields remain unchanged unless specifically identified. ' `
    'The scope covers WSC India PO initiation and supplier-file upload, the tablet Goods Receiving Checklist and Goods-In Team Lead approval, Packing List Verify & Print and LOG, the RPi Pack Creation and RPi Approval modules, automatic single-PO and merged-PO document handling, combined PDF and email processing, Batch Checker evidence, Product Verification, PCL preview/printing and the read-only Goods-In Summary. Existing PLPI fields remain unchanged unless specifically identified.'

Replace-Section '2. Overall Description' '3. Design Specification' @(
    (Item body 'The design extends the existing PLPI application with controlled queues, automatic document linkage and approval gates. WSC India initiates the PO in Add Packing List, uploads the three supplier source files and generates the Goods Receiving Checklist. Saving the PO creates the RPi Pack Creation queue immediately, while checklist generation places the receipt in the Goods-In Team tablet queue.'),
    (Item body 'Goods-In completes the tablet delivery and inspection record and submits it to the separate Lead Approval queue. The Goods-In Team Lead reviews the submitted data read-only and records the Information Confirmed decision, comments, signature and final confirmation. A Yes decision completes, locks and files the checklist PDF; a No decision quarantines the stock and routes the receipt to QA investigation. QA approval is not mandatory for a normal accepted receipt.'),
    (Item body 'After Team Lead approval, Goods-In completes Verify & Print, reviews the LOG, completes line clearance and generates the PO Packing List. The RPi Pack Creation workspace is progressively populated: Add Packing List files, the completed checklist and each generated Packing List are attached automatically. When one checklist contains multiple POs, PLPI creates one merged PO set automatically, stores shared documents once and retains PO-specific documents against each PO.'),
    (Item body 'The Responsible Person reviews shared documents once and PO-specific documents, including each generated Packing List, against the applicable PO. Approval produces the combined PDF and email record. After external stock-control acceptance is reflected in PLPI, Batch Checker verification and PCL printing complete the Phase 1 workflow. Authorised users may review status and history through the read-only Goods-In Summary.'),
    (Item body 'Workflow control: Each action is enabled only when the mandatory data, signatures, documents and preceding approvals are complete. PLPI retains the applicable PO or merged set, previous and new status, authenticated user, role, date/time and comments at each controlled event.'),
    (Item body 'End-to-end design sequence: The following visual shows the normal ownership hand-offs, automatic document population, validation gates and controlled outputs.'),
    (Item image '' 'rId8'),
    (Item caption 'Figure 1 - End-to-end PLPI Batch Record Automation design sequence'),
    (Item body 'Process flow: WSC India initiation, Goods-In receipt and Team Lead approval, Packing List completion, RPi Pack Creation, RPi approval and PDF/email processing, then Batch Checker verification, PCL completion and read-only summary access.')
)

Replace-Section '3.1 Digital Goods Receiving Checklist' '3.1.1 Packing List Module' @(
    (Item body 'The tablet workflow is initiated from Add Packing List. WSC India enters the PO information, uploads the Supplier Invoice, Supplier Packing List and Supplier Declaration, and generates the Goods Receiving Checklist. Generation creates a receipt in the Goods-In Team queue; Lead Approval is presented as a separate queue and role-controlled stage.'),
    (Item image '' 'rId9'),
    (Item caption 'Figure 2 - Tablet role queues and WSC-generated Goods-In work item'),
    (Item body 'Callout 1 - Role queues. The Goods-In Team and Lead Approval tabs separate data capture from approval. A user sees only queues permitted for the authenticated role.'),
    (Item body 'Callout 2 - Goods-In Team queue. Each generated checklist displays the linked PO reference or PO references, supplier, generated date/time and current status. Search and status filters locate the applicable receipt without creating a new checklist.'),
    (Item body 'Callout 3 - Lead Approval queue. A record appears here only after Goods-In selects Send for Goods-In Approval. The submitted Goods-In data remains read-only to the Team Lead.'),
    (Item body 'Callout 4 - Queue status and continuation. Draft records remain available to the owning queue. Submitted records cannot be amended by Goods-In unless returned through the controlled correction process.'),
    (Item image '' 'rId10'),
    (Item caption 'Figure 3 - Goods-In delivery details and driver signature'),
    (Item body 'Callout 1 - WSC context. PO Number, Supplier and other WSC-generated receipt context are displayed from the source record and remain linked to the checklist.'),
    (Item body 'Callout 2 - Delivery details. Goods-In records the applicable vehicle, driver and delivery-reference information. Mandatory values are validated before the inspection stage opens.'),
    (Item body 'Callout 3 - Driver signature. The signature is captured on the approved tablet and retained with the checklist record. Clear permits recapture before submission.'),
    (Item body 'Callout 4 - Draft and progression controls. Save Draft retains an unfinished Goods-In record. Continue is enabled only when the required delivery information and driver signature are present.'),
    (Item image '' 'rId11'),
    (Item caption 'Figure 4 - Goods-In inspection, receiver sign-off and approval submission'),
    (Item body 'Callout 1 - Goods-In inspection. The user records the three required checks: vehicle clean, no non-pharmaceutical products, and pallets or boxes undamaged. Each check requires a controlled Yes or No response.'),
    (Item body 'Callout 2 - Receiver details. Goods Receiver name and the receiver signature are mandatory. Comments provide context for damage, exceptions or other receipt information.'),
    (Item body 'Callout 3 - Send for Goods-In Approval. The action validates the delivery information, three checks and both signatures, then transfers the record to the Lead Approval queue. It does not complete or file the controlled PDF.'),
    (Item body 'Callout 4 - Audit hand-off. PLPI records the submitting Goods-In user, role, date/time and status change while retaining the submitted data as the approval baseline.'),
    (Item image '' 'rId12'),
    (Item caption 'Figure 5 - Goods-In Team Lead approval and completion gate'),
    (Item body 'Callout 1 - Read-only submitted record. Delivery details, inspection responses, receiver information and signatures are displayed to the Team Lead without amendment controls.'),
    (Item body 'Callout 2 - Information Confirmed. The Team Lead records Yes or No. Yes permits normal completion; No records the exception, quarantines the stock and routes the receipt to QA investigation.'),
    (Item body 'Callout 3 - Team Lead attribution. Team Lead name, approval comments and Team Lead signature are captured. Save Draft retains an incomplete approval without changing the submitted record.'),
    (Item body 'Callout 4 - Final confirmation and Complete. Complete remains disabled until the Team Lead decision, mandatory identity/signature information and final record confirmation are present. Successful completion creates the Team Lead-approved, locked and filed checklist PDF.'),
    (Item body 'Detailed design sequence:'),
    (Item body 'Step 1 - WSC India saves the PO in Add Packing List and uploads Supplier Invoice, Supplier Packing List and Supplier Declaration. PLPI creates the corresponding RPi Pack Creation queue and links those files immediately.'),
    (Item body 'Step 2 - WSC India generates the Goods Receiving Checklist. PLPI creates the tablet work item and assigns it to the Goods-In Team queue against the applicable PO reference or references.'),
    (Item body 'Step 3 - Goods-In opens the generated work item and reviews the read-only WSC context before entering delivery-specific values.'),
    (Item body 'Step 4 - Goods-In records delivery details and captures the driver signature. The inspection stage remains unavailable until the required delivery gate is satisfied.'),
    (Item body 'Step 5 - Goods-In completes the three controlled inspection checks, records receiver details and captures the Goods Receiver signature.'),
    (Item body 'Step 6 - Goods-In may save a draft or select Send for Goods-In Approval. Submission validates mandatory data and moves the record to the Lead Approval queue.'),
    (Item body 'Step 7 - The Goods-In Team Lead opens the submitted record and reviews all Goods-In data and signatures in read-only mode.'),
    (Item body 'Step 8 - The Team Lead records Information Confirmed, name, approval comments and signature, then applies the final record confirmation.'),
    (Item body 'Step 9 - Complete creates the final controlled PDF. A Yes decision locks and files the receipt for normal processing. A No decision records quarantine and routes the receipt to QA investigation; QA approval is not required for a normal accepted receipt.'),
    (Item body 'Step 10 - For a single-PO receipt, PLPI attaches the completed checklist automatically to that PO in RPi Pack Creation. For a checklist containing multiple POs, PLPI creates one merged PO set automatically and attaches the checklist once as a shared document.'),
    (Item body 'Step 11 - Goods-In continues to Packing List Verify & Print, LOG review, line clearance and PO Packing List generation. Each generated Packing List is attached automatically to its respective PO.'),
    (Item body 'Draft and correction control: Goods-In and Team Lead drafts are retained separately. A submitted or completed record is changed only through the controlled return or correction process, with the previous state retained in the audit trail.'),
    (Item body 'Entry condition: WSC India has saved the PO and generated the checklist. Exit condition: Team Lead approval is complete, the checklist PDF is locked and linked to the applicable individual or merged PO record, or a No decision has placed the stock in quarantine and routed the receipt to QA.'),
    (Item body 'URS traceability: URS 4.1.1 - 4.1.4, 4.1.10 and 4.1.12. FS traceability: FS 3.1.')
)

Replace-Section '3.1.1 Packing List Module' '3.2 RPi Documents Module - Goods-In' @(
    (Item image '' 'rId13'),
    (Item caption 'Figure 6 - Packing List Verify & Print, LOG and generation controls'),
    (Item body 'Module boundary: Add Packing List remains the WSC India initiation point. Saving the PO creates the RPi Pack Creation queue immediately, and the Supplier Invoice, Supplier Packing List and Supplier Declaration uploaded there are linked to the same PO. Existing Packing List fields and actions remain unchanged unless identified below.'),
    (Item body 'Callout 1 - PO search and line context. Goods-In opens the applicable PO after the Team Lead-approved Goods Receiving Checklist is available and reviews the existing Packing List product lines.'),
    (Item body 'Callout 2 - Verify & Print. This new line-level action opens the required confirmation, validates line clearance, prints the required labels and records the authenticated user, date/time and result against the selected line.'),
    (Item body 'Callout 3 - LOG. This new read-only action displays verification status, print status, authenticated user, date/time and comments for the selected line without changing the operational record.'),
    (Item body 'Callout 4 - Generate PO Packing List. The existing generation action is subject to an updated gate. It is enabled only when all applicable lines are verified, required label printing is successful and line clearance is complete.'),
    (Item body 'Callout 5 - Automatic RPi attachment. Successful generation creates the controlled PO Packing List and attaches it automatically to the same PO in RPi Pack Creation. Goods-In does not upload the generated Packing List again.'),
    (Item body 'Detailed screen sequence:'),
    (Item body 'Step 1 - Goods-In searches for and opens the PO after the approved checklist is available. PLPI displays the existing line data and current completion status.'),
    (Item body 'Step 2 - The user selects an applicable line and chooses Verify & Print. PLPI binds the action to that line and displays the confirmation data.'),
    (Item body 'Step 3 - The user completes the required line-clearance confirmation and authenticated sign-off. Cancelling the action creates no verification or successful print record.'),
    (Item body 'Step 4 - After successful printing, PLPI records label quantity, print result, user and date/time and changes the line to Verified. A print failure leaves the line incomplete.'),
    (Item body 'Step 5 - The user opens LOG to review the retained verification and printing history and resolves any identified exception through the controlled process.'),
    (Item body 'Step 6 - PLPI evaluates every applicable PO line. Generate PO Packing List remains unavailable while a line is unverified, required printing is incomplete or line clearance is missing.'),
    (Item body 'Step 7 - PLPI generates and locks the PO Packing List, then links it automatically to the corresponding PO-specific document group in RPi Pack Creation.'),
    (Item body 'Validation and control: A locked or generated Packing List cannot be changed through Verify & Print. A controlled correction invalidates affected downstream approval or generated output and requires the applicable workflow steps to be repeated.'),
    (Item body 'Entry condition: The PO exists in PLPI and its Goods Receiving Checklist has completed the required Team Lead or QA outcome. Exit condition: All applicable lines are verified and printed, line clearance is complete, and the generated Packing List is attached to the respective RPi pack.'),
    (Item body 'URS traceability: URS 4.1.4 - 4.1.12. FS traceability: FS 3.1.')
) '3.1.1 Packing List Module'

Replace-Section '3.2 RPi Documents Module - Goods-In' '3.3 RPi Task Module' @(
    (Item image '' 'rId14'),
    (Item caption 'Figure 7 - RPi Pack Creation dashboard, progressive document population and Goods-In submission'),
    (Item body 'RPi Pack Creation is a separate Goods-In-operated module. The PO queue is created immediately when WSC India saves the Add Packing List entry; it does not wait for Goods-In completion. The workspace is progressively populated by source uploads and controlled workflow outputs.'),
    (Item body 'Callout 1 - Search and active PO queue. Search filters by PO number. The queue displays the PO or merged PO set and progressive status such as Awaiting Checklist, Checklist Complete, Packing List Pending, Documents Pending, Ready to Send, Rejected or Corrected / Re-submitted.'),
    (Item body 'Callout 2 - Automatic source-file linkage. Supplier Invoice, Supplier Packing List and Supplier Declaration uploaded in Add Packing List appear against the same PO with Automatically attached or Uploaded status. Existing files are not requested again.'),
    (Item body 'Callout 3 - Automatic checklist relationship. A completed single-PO checklist attaches to that PO. When one completed checklist contains multiple PO references, PLPI creates one merged PO set automatically and stores the checklist once as a shared document. No manual merge selection is required.'),
    (Item body 'Callout 4 - Shared documents. Supplier Declaration, Temperature Record, Goods Receiving Checklist, CMR and Import / Export are retained once for the merged set where applicable. Their review and status apply to the merged relationship without duplicating the file against each PO.'),
    (Item body 'Callout 5 - PO-specific documents. Supplier Invoice, Supplier Packing List, Additional Files and each generated PO Packing List remain associated with their respective PO. Each Packing List is attached automatically after system generation.'),
    (Item body 'Callout 6 - Missing-document completion. Each tile shows Automatically attached, Uploaded or Upload required. Goods-In uploads only missing applicable documents and uses View File to confirm that each document is readable and correctly associated.'),
    (Item body 'Callout 7 - Controlled unmerge. When a correction requires removal of a PO from an automatically merged set, the user selects the PO and enters a mandatory reason. PLPI retains the remaining valid group and records the unmerge event.'),
    (Item body 'Callout 8 - Send PO Set to RPi. Submission is enabled only when every required shared and PO-specific document is available and the applicable Goods-In, Team Lead/QA and Packing List controls are complete. PLPI records Goods-In operator and date/time.'),
    (Item body 'Detailed design sequence:'),
    (Item body 'Step 1 - Add Packing List save creates the PO queue and PO/supplier context in RPi Pack Creation. The queue initially shows the checklist and Packing List as pending.'),
    (Item body 'Step 2 - The three files uploaded in Add Packing List are linked to the PO and displayed without re-upload. File identity, upload source and status remain traceable.'),
    (Item body 'Step 3 - Completion of a single-PO Goods Receiving Checklist links the locked PDF to that PO. Completion of a multi-PO checklist creates the merged PO set and stores the checklist once in Shared Documents.'),
    (Item body 'Step 4 - Generated Packing Lists attach to the applicable PO-specific groups. A merged set therefore retains a separate controlled Packing List for each PO.'),
    (Item body 'Step 5 - PLPI evaluates the shared-document and PO-specific-document requirements. The same shared file is not duplicated, while PO-specific completeness is evaluated independently for each PO.'),
    (Item body 'Step 6 - Goods-In opens each automatically linked file, uploads only documents with Upload required status and resolves incorrect or unreadable files through the controlled replacement process.'),
    (Item body 'Step 7 - If a PO must be removed from the merged set, Goods-In selects that PO, enters the mandatory reason and invokes Unmerge Selected PO. The audit trail records user, reason, date/time and resulting PO relationships.'),
    (Item body 'Step 8 - When the pack is complete, Goods-In selects Send PO Set to RPi. PLPI validates all shared and PO-specific requirements, records the authenticated submission and changes the pack to Ready for RPi Review.'),
    (Item body 'Validation and error handling: Duplicate PO association, unavailable linked files, missing mandatory documents, incomplete generated Packing Lists or an unmerge without a reason prevent submission and identify the affected PO or shared-document group.'),
    (Item body 'Entry condition: Add Packing List has created the PO queue. Exit condition: A complete individual or automatically merged, pre-populated pack is submitted to RPi Approval, or a rejected pack remains available for controlled correction and re-submission.'),
    (Item body 'URS traceability: URS 4.1.8, 4.1.12, 4.2.1 - 4.2.3 and 4.2.6. FS traceability: FS 3.2.')
) '3.2 RPi Pack Creation Module'

Replace-Section '3.3 RPi Task Module' '3.3.1 Document Review and Decision' @(
    (Item body 'RPi Approval is a new module. It receives complete individual or automatically merged packs from RPi Pack Creation and controls document review, approval or rejection, checklist completion, electronic sign-off, combined PDF generation and email transmission.'),
    (Item body 'For a merged pack, shared documents are reviewed once for the merged set. PO-specific documents and each generated Packing List are reviewed against the respective PO before approval or rejection becomes available.'),
    (Item body 'URS traceability: URS 4.2.4 - 4.2.8 and 4.2.10. FS traceability: FS 3.3.')
) '3.3 RPi Approval Module'

Replace-Section '3.3.1 Document Review and Decision' '3.3.2 RPi Approval Checklist' @(
    (Item image '' 'rId15'),
    (Item caption 'Figure 8 - RPi Approval document review workspace'),
    (Item body 'Callout 1 - Queue search and pack identity. Search filters the active queue by PO, supplier, batch or status. A merged card displays all included PO numbers and preserves each PO identity throughout review.'),
    (Item body 'Callout 2 - Pack readiness. Only a complete pack submitted from RPi Pack Creation opens for controlled review. Rejected or corrected packs retain the previous reason and current submission status.'),
    (Item body 'Callout 3 - Shared-document group. Supplier Declaration, Temperature Record, Goods Receiving Checklist, CMR and Import / Export are displayed once for the merged set where applicable. A single recorded view satisfies the shared-file review gate.'),
    (Item body 'Callout 4 - PO-specific groups. Supplier Invoice, Supplier Packing List, Additional Files and the generated Packing List are displayed under the applicable PO. Each required file must be opened for each PO.'),
    (Item body 'Callout 5 - View status. View File records that the authenticated RPi user opened the applicable file. Missing, unreadable or unviewed mandatory documents keep the checklist locked.'),
    (Item body 'Callout 6 - Approve or Reject. Approve opens the RPi checklist only after all required views are complete. Reject requires comments and returns the pack to RPi Pack Creation with the affected pack relationship retained.'),
    (Item body 'Detailed review sequence:'),
    (Item body 'Step 1 - The Responsible Person locates the individual or merged pack in the active queue and confirms the displayed PO and supplier context.'),
    (Item body 'Step 2 - PLPI loads Shared Documents once for the merged set and PO-Specific Documents under each included PO. Generated Packing Lists are never treated as shared.'),
    (Item body 'Step 3 - The user opens every applicable shared file. PLPI records viewed status against the merged review task.'),
    (Item body 'Step 4 - The user opens every required PO-specific file and generated Packing List against each PO. PLPI records the PO reference with each view event.'),
    (Item body 'Step 5 - If a file is missing, incorrect or unreadable, the user selects Reject and records correction comments. PLPI returns the pack to RPi Pack Creation without discarding prior audit history.'),
    (Item body 'Step 6 - A corrected pack is re-submitted and all affected document review gates are repeated. Unaffected retained files remain traceable but approval is based on the current submitted version.'),
    (Item body 'Step 7 - When all required files are viewed, Approve enables the RPi Approval Checklist. PLPI records the authenticated review decision, role and date/time.'),
    (Item body 'Entry condition: The pack has Ready for RPi Review status. Exit condition: The pack is returned with traceable comments or released to the RPi Approval Checklist.'),
    (Item body 'URS traceability: URS 4.2.4 - 4.2.6. FS traceability: FS 3.3.')
)

Replace-Section '3.3.2 RPi Approval Checklist' '3.3.3 Combined PDF and Email' @(
    (Item image '' 'rId16'),
    (Item caption 'Figure 9 - RPi checklist: identity, supplier, transport and temperature controls'),
    (Item body 'Callout 1 - EORI and commodity verification. The Responsible Person records the EORI Verification and Commodity Code Verification outcome against the reviewed pack.'),
    (Item body 'Callout 2 - Supplier status and conditional reason. Supplier Status in FE is Active or Inactive. Reason if Inactive becomes mandatory when Inactive is selected.'),
    (Item body 'Callout 3 - Distribution controls. Collection Address Matches WDA and Authorised Transporter use controlled Yes or No responses.'),
    (Item body 'Callout 4 - Temperature controls. Transit Temperature Within Parameters and Storage-site Temperature Within Parameters use the applicable Yes, No or N/A options.'),
    (Item image '' 'rId17'),
    (Item caption 'Figure 10 - RPi checklist: regulatory review, conclusion and electronic sign-off'),
    (Item body 'Callout 1 - Regulatory checks. Article 51 Supplier Declaration, FMD Compliance in Declaration, FMD Decommissioning Statement and Bollino / Vignette Sticker Check are completed using the applicable controlled responses.'),
    (Item body 'Callout 2 - Conclusion. RPi Comments records decision context. Stock Suitable for Processing and Deviation Required record the final disposition and any controlled follow-up.'),
    (Item body 'Callout 3 - Responsible Person attribution. Responsible Person and Date/Time are populated from the authenticated session and cannot be replaced with uncontrolled free text.'),
    (Item body 'Callout 4 - Generate & Sign. The action remains disabled until every mandatory document view, checklist response and conditional value is complete. Successful execution creates the signed approval record and locks the approved pack.'),
    (Item body 'Detailed checklist sequence:'),
    (Item body 'Step 1 - Verify EORI, commodity code and Supplier Status in FE. PLPI requires Reason if Inactive when applicable.'),
    (Item body 'Step 2 - Complete Collection Address Matches WDA, Authorised Transporter and the applicable transit and storage-site temperature controls.'),
    (Item body 'Step 3 - Complete Article 51, FMD compliance, FMD decommissioning and Bollino / Vignette checks using N/A only where the configured rule permits it.'),
    (Item body 'Step 4 - Record RPi Comments, Stock Suitable for Processing and Deviation Required. Negative or exception outcomes remain visible in the signed record.'),
    (Item body 'Step 5 - Select Generate & Sign. PLPI validates the current pack version, all shared and PO-specific review gates and all mandatory checklist responses before recording approval.'),
    (Item body 'Validation rules: No mandatory response may remain blank. Conditional fields follow the selected status. A changed or corrected source file invalidates the affected review and requires the applicable approval steps to be repeated.'),
    (Item body 'Exit condition: A signed RPi approval record is attached to the individual or merged pack and the pack is ready for combined PDF generation.'),
    (Item body 'URS traceability: URS 4.2.4 - 4.2.6. FS traceability: FS 3.3.')
)

Replace-Section '3.3.3 Combined PDF and Email' '3.4 Batch Checker Module' @(
    (Item body 'PDF assembly: After successful RP approval, PLPI combines all applicable shared documents, PO-specific documents, the completed Goods Receiving Checklist, each generated PO Packing List and the RP approval form into one controlled PDF pack. Shared documents are included once and each PO-specific document remains identifiable to its PO.'),
    (Item body 'Email dispatch: PLPI sends the combined PDF to sc.india@bnsdistribution.com and records the configured recipient, PDF generation result, sending status and date/time.'),
    (Item body 'Detailed processing sequence:'),
    (Item body 'Step 1 - PLPI verifies that Generate & Sign completed successfully for the current individual or merged pack version.'),
    (Item body 'Step 2 - PLPI retrieves each applicable shared file once, retrieves PO-specific files and the generated Packing List for every included PO, and retrieves the RP approval form.'),
    (Item body 'Step 3 - PLPI validates file availability and creates one PDF in the configured document order without altering the approved source files.'),
    (Item body 'Step 4 - PLPI validates the generated output and records the generation result. A missing expected component prevents dispatch.'),
    (Item body 'Step 5 - PLPI sends the combined PDF to sc.india@bnsdistribution.com and records recipient, send status and date/time.'),
    (Item body 'Step 6 - If generation or dispatch fails, the approval record remains retained, the pack does not advance and retry does not create a duplicate approval.'),
    (Item body 'Step 7 - After successful processing, the approved pack remains locked. A later correction returns the record through the controlled review and approval workflow.'),
    (Item body 'External acceptance: The external stock-control acceptance is reflected as workflow status in PLPI. No separate external WSC user role is introduced in the RPi Approval module.'),
    (Item body 'Exit condition: The approved combined PDF has been generated and emailed, and the processing evidence is available for external stock-control action.'),
    (Item body 'URS traceability: URS 4.2.7, 4.2.8 and 4.2.10. FS traceability: FS 3.3.')
)

Replace-ExactText `
    'URS traceability: URS 4.3.1 - Batch Checker eligibility after external acceptance is reflected in PLPI. URS 4.3.2 - Direct access to Supplier Declaration and Temperature Record evidence where applicable.' `
    'URS traceability: URS 4.3.1, 4.3.2, 4.3.8 and 4.3.9. FS traceability: FS 3.4.'

Replace-ExactText `
    'URS traceability: URS 4.3.3 - Product Verification pop-up, mandatory checks, Verify gate and Batch Checker attribution.' `
    'URS traceability: URS 4.3.3, 4.3.7 and 4.3.9. FS traceability: FS 3.5.'

Replace-ExactText `
    'URS traceability: URS 4.3.4 - PCL preview and printing. URS 4.3.5 - Batch Checker line clearance. URS 4.3.6 - PCL generation gate. URS 4.3.7 - Batch Checker audit identity. URS 4.3.8 - Downstream activity gate.' `
    'URS traceability: URS 4.3.4 - 4.3.8. FS traceability: FS 3.6.'

Replace-Section '3.7 Workflow Status, Corrections and Audit Behaviour' '4. Additional Non-Functional Requirements' @(
    (Item body 'The Goods-In Summary is a new read-only module for authorised Business, QA, Operations and IT users. It presents the current Goods-In and RPi workflow state without exposing operational amendment controls.'),
    (Item body 'Search and result list: PO Number Search filters individual and merged records. Each result displays PO Number(s), Supplier, Current Stage and Last Updated. A merged result retains all related PO numbers.'),
    (Item body 'View Summary: The action opens the selected record and displays the WSC initiation, tablet completion, Team Lead decision, Packing List activities, RPi Pack Creation, RPi decision and PDF/email processing status applicable to that PO or merged set.'),
    (Item body 'Action History: The read-only log displays stage, action, authenticated user and date/time in recorded sequence. Correction, rejection, unmerge and re-submission events remain visible and are not replaced by the latest status.'),
    (Item body 'View Summary PDF: The preview is generated from recorded workflow events and shows the applicable individual or merged PO relationship. It cannot be used to change the source operational record.'),
    (Item body 'Detailed summary sequence:'),
    (Item body 'Step 1 - The authorised user searches by PO number and selects the applicable individual or merged result.'),
    (Item body 'Step 2 - PLPI displays the current stage and latest update from the controlled workflow record.'),
    (Item body 'Step 3 - The user opens View Summary to review the retained stage history and document/approval outcomes.'),
    (Item body 'Step 4 - The user opens View Summary PDF where a printable read-only representation is required. No summary action changes workflow status.'),
    (Item body 'URS traceability: URS 4.4.1. FS traceability: FS 3.7.'),
    (Item heading2 '3.8 Workflow Status, Corrections and Audit Behaviour'),
    (Item body 'Status control: PLPI shows the current PO, merged-set and line status in the relevant module. A status changes only after the applicable validation and authenticated action succeeds.'),
    (Item body 'Step 1 - PO initiated. Add Packing List has created the RPi Pack Creation queue and linked available source files.'),
    (Item body 'Step 2 - Checklist pending or in progress. WSC has generated the checklist and Goods-In or Lead Approval activity remains incomplete.'),
    (Item body 'Step 3 - Checklist approved or QA required. The Team Lead Yes decision has locked and filed the checklist, or a No decision has quarantined the stock and routed it to QA.'),
    (Item body 'Step 4 - Packing List pending or complete. Verify & Print, LOG, line clearance and generation are evaluated for each PO.'),
    (Item body 'Step 5 - RPi pack in progress. The individual or automatically merged pack is progressively populated and missing documents are being completed.'),
    (Item body 'Step 6 - Ready for RPi Review. The complete pack has been submitted from RPi Pack Creation.'),
    (Item body 'Step 7 - Returned for correction. RPi has rejected the pack with comments or an unmerge/correction requires Goods-In action.'),
    (Item body 'Step 8 - RPi Approved. Document review, checklist and electronic sign-off are complete.'),
    (Item body 'Step 9 - PDF and email processed. The combined pack has been generated and its email outcome recorded.'),
    (Item body 'Step 10 - Ready for Batch Check. External stock-control acceptance has been reflected and the approved PO is visible to Batch Checker.'),
    (Item body 'Step 11 - Batch Check verified and PCL printed. Product Verification, line clearance and controlled PCL printing are complete for the applicable line.'),
    (Item body 'Correction control: A correction returns the record to the owning stage. Affected approvals, document views or generated outputs must be repeated through the controlled workflow.'),
    (Item body 'Audit content: Each controlled event retains the PO or merged-set reference, affected line or document where applicable, previous and new status, authenticated user, role, date/time, decision and comments or reason.'),
    (Item body 'Record visibility: Authorised users may view records according to role, while only the designated operational role may perform the controlled action.')
) '3.7 Goods-In Summary'

Replace-ExactText `
    'PLPI shall retain traceable records for delivery details, driver and receiver signatures, four Goods-In responses, receiver comments, final confirmation, completed checklist PDF, existing line clearance, document review, sign-off, correction, approval, PDF generation, email dispatch, Batch Check verification and PCL printing. Records shall include the applicable PO or line, user, role, action, status, comments and date/time where applicable.' `
    'PLPI shall retain traceable records for WSC PO initiation and source-file linkage; delivery details; driver and receiver signatures; the three Goods-In inspection responses; Goods-In submission; Team Lead Information Confirmed decision, comments, signature and final confirmation; completed checklist PDF; line clearance; automatic single-PO or merged-PO linkage; shared and PO-specific document status; unmerge; review; correction; approval; PDF generation; email dispatch; Batch Check verification; PCL printing; and summary access. Records shall include the applicable PO, merged set, line or document, user, role, action, previous and new status, comments or reason, and date/time where applicable.'

Replace-ExactText `
    'The design shall support the expected operational volume of POs, product lines, checklist records, signatures, documents and concurrent authorised tablet or desktop users. Record locking shall prevent conflicting updates to the same controlled task.' `
    'The design shall support the expected operational volume of individual and merged PO sets, product lines, checklist records, signatures, shared documents, PO-specific documents and concurrent authorised tablet or desktop users. Shared documents shall be stored once for a merged set where applicable. Record locking shall prevent conflicting updates to the same controlled task.'

Replace-ExactText `
    'Final checklist data, signatures, workflow data, uploaded files and generated records shall be included in the existing database and file backup and recovery controls. A saved tablet draft is not the final controlled record. A failed PDF or email action shall be recoverable without duplicating approval records.' `
    'Goods-In and Lead Approval drafts, final checklist data, signatures, PO and merged-set relationships, linked source files, uploaded files and generated records shall be included in the existing database and file backup and recovery controls. A draft is not the final controlled record. A failed PDF or email action shall be recoverable without duplicating approval records.'

Replace-ExactText `
    'Access shall use existing PLPI authentication and role permissions. Goods-In, RP/RPi and Batch Checker actions shall be available only to authorised roles. Internal electronic sign-off shall use the authenticated user identity; driver and receiver signatures shall be retained with the completed receiving record. QA placeholders in the PDF shall not operate as tablet input controls.' `
    'Access shall use existing PLPI authentication and role permissions. WSC India, Goods-In, Goods-In Team Lead, RP/RPi and Batch Checker actions shall be available only to authorised roles. Team Lead approval shall be separated from Goods-In data capture. Internal electronic sign-off shall use authenticated identity; driver, receiver and Team Lead signatures shall be retained with the completed receiving record. The Goods-In Summary shall remain read-only.'

Replace-ExactText `
    'The system shall display clear validation or processing messages for missing mandatory delivery details, unanswered Goods checks, missing signatures, absent final confirmation, incomplete existing clearance, missing documents, failed generation, failed email dispatch and unavailable records. Errors shall not advance workflow status or create an incomplete controlled record.' `
    'The system shall display clear validation or processing messages for missing mandatory delivery data, unanswered inspection checks, missing signatures, incomplete Team Lead approval, missing PO or document relationships, incomplete line clearance, missing shared or PO-specific documents, unmerge without a reason, failed generation, failed email dispatch and unavailable records. Errors shall not advance workflow status or create an incomplete controlled record.'

Replace-ExactText `
    'The Goods Receiving Checklist and signature controls shall be usable on the approved tablet form factor. The three-stage stepper, mandatory checks, exception count, final confirmation and disabled actions shall be clear without changing the established PLPI navigation pattern.' `
    'The Goods Receiving Checklist and signature controls shall be usable on the approved tablet form factor. Goods-In Team and Lead Approval queues, workflow stepper, three mandatory inspection checks, Information Confirmed decision, final confirmation and disabled actions shall be clear without changing the established PLPI navigation pattern. RPi Pack Creation shall distinguish shared documents from PO-specific documents and identify only files that require upload.'

Replace-ExactText `
    'WSC-loaded values, mandatory responses, both signatures, exception handling and workflow gates shall be validated before the checklist is completed and filed. The generated checklist PDF and PCL outputs shall use the applicable verified record values held in PLPI.' `
    'WSC-loaded values, PO relationships, mandatory responses, driver and receiver signatures, Team Lead decision and signature, automatic document links, shared-document rules and workflow gates shall be validated before the applicable record is completed. The checklist PDF, generated Packing Lists, combined PDF, summary and PCL shall use the applicable controlled values held in PLPI.'

$media = Join-Path $work 'word\media'
Copy-Item -LiteralPath (Join-Path $root 'temp_ds_current_wireframe\screenshots\00-ds-workflow.png') -Destination (Join-Path $media 'image1.png') -Force
Copy-Item -LiteralPath (Join-Path $root 'temp_ds_current_wireframe\screenshots\01-tablet-role-queues.png') -Destination (Join-Path $media 'image2.png') -Force
Copy-Item -LiteralPath (Join-Path $root 'temp_ds_current_wireframe\screenshots\02-tablet-delivery.png') -Destination (Join-Path $media 'image3.png') -Force
Copy-Item -LiteralPath (Join-Path $root 'temp_ds_current_wireframe\screenshots\03-tablet-inspection-submit.png') -Destination (Join-Path $media 'image4.png') -Force
Copy-Item -LiteralPath (Join-Path $root 'temp_ds_current_wireframe\screenshots\04-tablet-lead-approval.png') -Destination (Join-Path $media 'image5.png') -Force

$settingsPath = Join-Path $work 'word\settings.xml'
$settings = New-Object System.Xml.XmlDocument
$settings.PreserveWhitespace = $true
$settings.Load($settingsPath)
$settingsNs = New-Object System.Xml.XmlNamespaceManager($settings.NameTable)
$settingsNs.AddNamespace('w', $wNs)
$updateFields = $settings.SelectSingleNode('//w:updateFields', $settingsNs)
if (-not $updateFields) {
    $updateFields = $settings.CreateElement('w', 'updateFields', $wNs)
    [void]$settings.DocumentElement.AppendChild($updateFields)
}
[void]$updateFields.SetAttribute('val', $wNs, 'true')

$writerSettings = New-Object System.Xml.XmlWriterSettings
$writerSettings.Encoding = New-Object System.Text.UTF8Encoding($false)
$writerSettings.Indent = $false
$writer = [System.Xml.XmlWriter]::Create($documentPath, $writerSettings)
$xml.Save($writer)
$writer.Close()
$settingsWriter = [System.Xml.XmlWriter]::Create($settingsPath, $writerSettings)
$settings.Save($settingsWriter)
$settingsWriter.Close()

if (Test-Path -LiteralPath $zipOut) { Remove-Item -LiteralPath $zipOut -Force }
[System.IO.Compression.ZipFile]::CreateFromDirectory($work, $zipOut, [System.IO.Compression.CompressionLevel]::Optimal, $false)
Copy-Item -LiteralPath $zipOut -Destination $target -Force

"Updated: $target"
