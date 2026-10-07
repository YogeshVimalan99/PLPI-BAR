$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = "C:\Users\vimalyog\Desktop\PLPI Batch Automation"
$reference = Join-Path $root "Reference Doc (Templates)\DS - PLPI System  29 Oct 2024 DRAFT FINAL.docx"
$output = Join-Path $root "docz\DS-PLPI BAR.docx"
$screens = Join-Path $root "temp_ds_build\screenshots"
$expectedHash = "187AA4BCD809C397D8D2D201650FB23C3C92AED1E7F2B4E7860667796B2FDEA8"

if ((Get-FileHash -LiteralPath $reference -Algorithm SHA256).Hash -ne $expectedHash) {
  throw "Reference DS hash has changed. Re-distillation is required."
}

$imageFiles = @(
  "01-packing-list-verify-log.png",
  "02-rpi-documents-goods-in.png",
  "03-rpi-task-document-review.png",
  "04-rpi-task-checklist-top.png",
  "05-rpi-task-checklist-bottom.png",
  "06-batch-checker-new-controls.png",
  "07-product-verification-popup.png",
  "08-pcl-preview.png",
  "09-product-verification-popup-bottom.png",
  "10-pcl-preview-bottom.png",
  "11-grc-delivery.png",
  "12-grc-goods-checks.png",
  "13-grc-review-file.png",
  "14-grc-pdf-preview.png",
  "00-end-to-end-flow.png"
)
foreach ($name in $imageFiles) {
  if (-not (Test-Path -LiteralPath (Join-Path $screens $name))) { throw "Missing wireframe screenshot: $name" }
}

$tempOutput = Join-Path $root "temp_ds_build\DS-PLPI-BAR-working.docx"
Copy-Item -LiteralPath $reference -Destination $tempOutput -Force

function Escape-Xml([string]$value) {
  if ($null -eq $value) { return "" }
  return [System.Security.SecurityElement]::Escape($value)
}

function Run-Xml([string]$text, [bool]$bold = $false, [bool]$italic = $false, [int]$size = 20, [string]$color = "002060") {
  $b = if ($bold) { '<w:b/>' } else { '' }
  $i = if ($italic) { '<w:i/>' } else { '' }
  return "<w:r><w:rPr><w:rFonts w:ascii=`"Verdana`" w:hAnsi=`"Verdana`"/>$b$i<w:color w:val=`"$color`"/><w:sz w:val=`"$size`"/><w:szCs w:val=`"$size`"/></w:rPr><w:t xml:space=`"preserve`">$(Escape-Xml $text)</w:t></w:r>"
}

function Paragraph-Xml([string]$text, [string]$style = "BodyText", [bool]$keepNext = $false, [string]$align = "", [bool]$bold = $false, [bool]$italic = $false, [int]$size = 20, [int]$after = 120, [int]$before = 0) {
  if ($style -eq 'Heading1' -and $size -eq 20) { $size = 28; $bold = $true; $before = [Math]::Max($before, 160); $after = [Math]::Max($after, 100) }
  if ($style -eq 'Heading2' -and $size -eq 20) { $size = 24; $bold = $true; $before = [Math]::Max($before, 120); $after = [Math]::Max($after, 80) }
  $styleXml = if ($style) { "<w:pStyle w:val=`"$style`"/>" } else { "" }
  $keep = if ($keepNext) { '<w:keepNext/>' } else { '' }
  $jc = if ($align) { "<w:jc w:val=`"$align`"/>" } else { '' }
  return "<w:p><w:pPr>$styleXml$keep$jc<w:spacing w:before=`"$before`" w:after=`"$after`"/></w:pPr>$(Run-Xml $text $bold $italic $size)</w:p>"
}

function Label-Paragraph-Xml([string]$label, [string]$text) {
  return "<w:p><w:pPr><w:pStyle w:val=`"BodyText`"/><w:spacing w:after=`"80`"/></w:pPr>$(Run-Xml ($label + ': ') $true $false 20)$(Run-Xml $text $false $false 20)</w:p>"
}
function Step-Paragraph-Xml([int]$number, [string]$title, [string]$text) {
  return "<w:p><w:pPr><w:pStyle w:val=`"BodyText`"/><w:ind w:left=`"360`"/><w:spacing w:after=`"80`"/></w:pPr>$(Run-Xml ("Step $number - $title. ") $true $false 20)$(Run-Xml $text $false $false 20)</w:p>"
}
function Callout-Paragraph-Xml([int]$number, [string]$title, [string]$text) {
  return "<w:p><w:pPr><w:pStyle w:val=`"BodyText`"/><w:ind w:left=`"240`"/><w:spacing w:after=`"70`"/></w:pPr>$(Run-Xml ("Callout $number - $title. ") $true $false 20)$(Run-Xml $text $false $false 20)</w:p>"
}

function Page-Break-Xml() { return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>' }

function Title-Paragraph-Xml([string]$text, [int]$size) {
  return "<w:p><w:pPr><w:jc w:val=`"center`"/><w:spacing w:before=`"120`" w:after=`"120`"/></w:pPr>$(Run-Xml $text $true $false $size)</w:p>"
}

function Table-Cell-Xml([string]$text, [int]$width, [bool]$header = $false, [int]$fontSize = 18, [string]$align = "left") {
  $shade = if ($header) { '<w:shd w:fill="002060"/>' } else { '<w:shd w:fill="FFFFFF"/>' }
  $color = if ($header) { 'FFFFFF' } else { '002060' }
  $paragraphs = @()
  foreach ($line in ($text -split "
")) {
    $paragraphs += "<w:p><w:pPr><w:jc w:val=`"$align`"/><w:spacing w:before=`"0`" w:after=`"0`"/></w:pPr>$(Run-Xml $line $header $false $fontSize $color)</w:p>"
  }
  return "<w:tc><w:tcPr><w:tcW w:w=`"$width`" w:type=`"dxa`"/><w:vAlign w:val=`"center`"/>$shade<w:tcMar><w:top w:w=`"100`" w:type=`"dxa`"/><w:left w:w=`"100`" w:type=`"dxa`"/><w:bottom w:w=`"100`" w:type=`"dxa`"/><w:right w:w=`"100`" w:type=`"dxa`"/></w:tcMar></w:tcPr>$($paragraphs -join '')</w:tc>"
}

function Table-Xml([object[]]$rows, [int[]]$widths, [int]$fontSize = 18) {
  $total = ($widths | Measure-Object -Sum).Sum
  $grid = ($widths | ForEach-Object { "<w:gridCol w:w=`"$_`"/>" }) -join ''
  $xml = "<w:tbl><w:tblPr><w:tblW w:w=`"$total`" w:type=`"dxa`"/><w:tblLayout w:type=`"fixed`"/><w:tblInd w:w=`"0`" w:type=`"dxa`"/><w:tblBorders><w:top w:val=`"single`" w:sz=`"6`" w:color=`"000000`"/><w:left w:val=`"single`" w:sz=`"6`" w:color=`"000000`"/><w:bottom w:val=`"single`" w:sz=`"6`" w:color=`"000000`"/><w:right w:val=`"single`" w:sz=`"6`" w:color=`"000000`"/><w:insideH w:val=`"single`" w:sz=`"4`" w:color=`"000000`"/><w:insideV w:val=`"single`" w:sz=`"4`" w:color=`"000000`"/></w:tblBorders></w:tblPr><w:tblGrid>$grid</w:tblGrid>"
  for ($r = 0; $r -lt $rows.Count; $r++) {
    $header = ($r -eq 0)
    $rowData = $rows[$r]
    if ($rowData.Count -eq 1 -and $rowData[0] -is [System.Array]) { $rowData = $rowData[0] }
    $rowProps = if ($header) { '<w:trPr><w:tblHeader/><w:cantSplit/></w:trPr>' } else { '<w:trPr><w:cantSplit/></w:trPr>' }
    $xml += "<w:tr>$rowProps"
    for ($c = 0; $c -lt $widths.Count; $c++) {
      $cellText = if ($c -lt $rowData.Count) { [string]$rowData[$c] } else { '' }
      $cellAlign = if ($c -eq 0 -and $rows.Count -gt 8) { 'center' } else { 'left' }
      $xml += Table-Cell-Xml $cellText $widths[$c] $header $fontSize $cellAlign
    }
    $xml += '</w:tr>'
  }
  return $xml + '</w:tbl>' + (Paragraph-Xml '' '' $false '' $false $false 20 80 0)
}

function Figure-Xml([string]$relationshipId, [int]$id, [string]$name, [string]$description, [long]$cx = 5730000, [long]$cy = 3223125) {
  return @"
<w:p><w:pPr><w:jc w:val="center"/><w:keepNext/><w:spacing w:before="80" w:after="60"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="$cx" cy="$cy"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="$id" name="$(Escape-Xml $name)" descr="$(Escape-Xml $description)"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="$id" name="$(Escape-Xml $name)" descr="$(Escape-Xml $description)"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="$relationshipId"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="$cx" cy="$cy"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:ln><a:noFill/></a:ln></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>
"@
}

function Figure-Caption-Xml([string]$text) {
  return Paragraph-Xml $text "NoSpacing" $true "center" $false $true 18 120 0
}

function Toc-Xml() {
  return @'
<w:p><w:pPr><w:pStyle w:val="Heading1"/><w:spacing w:after="180"/></w:pPr><w:r><w:t>TABLE OF CONTENTS</w:t></w:r></w:p>
<w:p><w:pPr><w:pStyle w:val="TOC1"/></w:pPr><w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \o "1-2" \h \z \u </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>Update this field to refresh the table of contents.</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>
'@
}

$approvalRows = @(
  ,@('Role', 'Name / Function', 'Signature', 'Date'),
  ,@('Author', 'Business Analyst / PLPI Batch Record Automation', 'To be completed during approval', 'To be completed'),
  ,@('Reviewer', 'Operations Representative / Goods-In and Warehouse Operations', 'To be completed during approval', 'To be completed'),
  ,@('Reviewer', 'IT Representative / PLPI System', 'To be completed during approval', 'To be completed'),
  ,@('Approver', 'QA / RP Representative / Quality Review', 'To be completed during approval', 'To be completed')
)

$abbreviationRows = @(
  ,@('Abbreviation', 'Definition'),
  ,@('PLPI', 'Product Label and Pack Information system'),
  ,@('URS', 'User Requirement Specification'),
  ,@('FS', 'Functional Specification'),
  ,@('DS', 'Design Specification'),
  ,@('PO', 'Purchase Order'),
  ,@('GRC', 'Goods Receiving Checklist'),
  ,@('RP / RPi', 'Responsible Person / Responsible Person Import'),
  ,@('PCL', 'Product Check Log'),
  ,@('WDA', 'Wholesale Distribution Authorisation'),
  ,@('FMD', 'Falsified Medicines Directive'),
  ,@('QA', 'Quality Assurance'),
  ,@('IT', 'Information Technology')
)

$body = @()
$body += Title-Paragraph-Xml 'DESIGN SPECIFICATION' 32
$body += Title-Paragraph-Xml 'PLPI Batch Record Automation' 28
$body += Paragraph-Xml 'Phase 1: Digital Goods Receiving Checklist, RPi Review and Batch Checker Controls' '' $false 'center' $false $false 21 240 0
$body += Table-Xml $approvalRows @(1250, 3550, 2600, 1600) 18
$body += Page-Break-Xml
$body += Toc-Xml
$body += Page-Break-Xml

$body += Paragraph-Xml '1. Introduction' 'Heading1' $true
$body += Paragraph-Xml 'PLPI Batch Record Automation Phase 1 digitises the Goods Receiving Checklist and the controlled workflow from Goods-In through Responsible Person review and Product Check Log completion. The design retains existing PLPI functions unless a change is identified in this document.'
$body += Paragraph-Xml '1.1 Purpose of the Document' 'Heading2' $true
$body += Paragraph-Xml 'This document defines the system design required to implement the approved URS and FS for PLPI Batch Record Automation. It describes screen changes, workflow controls, validation gates, records and audit behaviour.'
$body += Paragraph-Xml '1.2 Scope' 'Heading2' $true
$body += Paragraph-Xml 'The scope covers the Packing List Verify & Print and LOG controls, the tablet-based Goods Receiving Checklist, RPi Documents, the new RPi Task module, combined PDF and email processing, Batch Checker evidence links, Product Verification and PCL preview/printing. Existing PLPI fields remain unchanged unless specifically identified. Downstream BAR and production activities are outside Phase 1.'
$body += Paragraph-Xml '1.3 Abbreviations' 'Heading2' $true
$body += Paragraph-Xml 'PLPI means Product Label and Pack Information system. URS means User Requirement Specification. FS means Functional Specification. DS means Design Specification. PO means Purchase Order. GRC means Goods Receiving Checklist. RP / RPi means Responsible Person / Responsible Person Import. PCL means Product Check Log.'
$body += Paragraph-Xml 'WDA means Wholesale Distribution Authorisation. FMD means Falsified Medicines Directive. QA means Quality Assurance and IT means Information Technology.'

$body += Paragraph-Xml '2. Overall Description' 'Heading1' $true
$body += Paragraph-Xml 'The design uses the existing PLPI application and introduces controlled workflow stages rather than a separate system. Goods-In completes the digital checklist, verifies Packing List lines, prints labels and confirms the document pack. The finalized Goods-In checklist and signed-off document pack move to RPi Task for document review, checklist completion and approval. PLPI then generates and emails the combined PDF. After the external stock-control acceptance is reflected in PLPI, the Batch Checker completes Product Verification, line clearance and PCL printing.'
$body += Label-Paragraph-Xml 'Workflow control' 'Each stage is enabled only when the mandatory checks and records from the preceding stage are complete. Status, user, role and date/time are retained at the applicable control point.'
$body += Label-Paragraph-Xml 'End-to-end design sequence' 'The visual workflow below shows the normal Phase 1 sequence, ownership hand-offs, validation gates and controlled outputs.'
$body += Figure-Xml 'rIdDS15' 115 'End-to-End Workflow Flowchart' 'Flowchart showing the Goods-In, RPi and system-processing, and Batch Checker stages from PO opening through PCL printing.' 5700000 4640750
$body += Paragraph-Xml 'Process flow: Goods-In receiving and document preparation, RPi review and approval processing, then Batch Checker verification and PCL completion.' '' $false 'center' $false $true 17 120 0

$body += Page-Break-Xml
$body += Paragraph-Xml '3. Design Specification' 'Heading1' $true
$body += Paragraph-Xml 'The following sections define the screen and workflow design that will be implemented to satisfy the current URS and FS.'

$body += Paragraph-Xml '3.1 Digital Goods Receiving Checklist' 'Heading2' $true
$body += Paragraph-Xml 'The existing printed Goods Receiving Checklist is implemented as a guided tablet workflow with three stages: Delivery, Goods checks, and Review & file. WSC-loaded values provide the delivery context, the driver and Goods Receiver sign directly on the tablet, and the completed record is generated as a controlled PDF.'
$body += Label-Paragraph-Xml 'Wireframe source' 'The screens and logic in this section are based on the approved goods-receiving-tablet-wireframe supplied for this project.'

$body += Figure-Xml 'rIdDS11' 111 'Goods Receiving Delivery Stage' 'Annotated tablet wireframe showing WSC-loaded delivery details, delivery inputs, driver signature and progression control.' 4200000 6043902
$body += Figure-Caption-Xml 'Figure 1 - Goods Receiving Delivery stage and driver sign-off'
$body += Callout-Paragraph-Xml 1 'Three-stage stepper' 'The stepper shows Delivery, Goods checks, and Review & file. The current stage is highlighted, completed earlier stages are marked, and the user may return to an earlier completed stage before final filing.'
$body += Callout-Paragraph-Xml 2 'WSC-loaded delivery context' 'PO Number, Supplier, Approved Transporter and Delivery or Collection Address are loaded for the delivery. Supplier, transporter and address are displayed as locked read-only values. PO Number remains available for the applicable PO reference or references and is mandatory for progression.'
$body += Callout-Paragraph-Xml 3 'Delivery inputs' 'Vehicle Registration, Driver Name and Delivery Note or Reference are entered in the Delivery stage. Driver Name is mandatory. Vehicle Registration and Delivery Note or Reference may be left blank and are represented as Not provided or N/A in the final PDF.'
$body += Callout-Paragraph-Xml 4 'Driver signature' 'The driver signs inside the tablet signature area using a finger or stylus. Signature status changes from Not signed to Signature captured. Clear signature removes the captured signature before progression.'
$body += Callout-Paragraph-Xml 5 'Continue gate' 'Continue to goods checks is successful only when PO Number, Driver Name and Driver Signature are present. A validation message identifies the missing information and the workflow remains on Delivery when validation fails.'

$body += Page-Break-Xml
$body += Figure-Xml 'rIdDS12' 112 'Goods Receiving Checks Stage' 'Annotated tablet wireframe showing the four Goods-In checks, receiver data, receiver signature and review gate.' 4200000 6043902
$body += Figure-Caption-Xml 'Figure 2 - Goods-In inspection and receiver sign-off'
$body += Callout-Paragraph-Xml 1 'Goods checks stage' 'The second step is owned by the Goods Receiver. The stage cannot be opened through forward stepper navigation until the Delivery gate is satisfied.'
$body += Callout-Paragraph-Xml 2 'Four mandatory checks' 'The user answers Vehicle is clean, No non-pharmaceutical products, Pallets and boxes are undamaged, and Information confirmed using controlled Yes or No options. Every check requires one response. A No response is carried into the review as an exception; Information confirmed No requires quarantine and transfer of documents to QA.'
$body += Callout-Paragraph-Xml 3 'Receiver details' 'Goods Receiver Name is mandatory. Receiver Comments records comments, damage details or N/A and is optional; the final PDF displays N/A when no comment is entered.'
$body += Callout-Paragraph-Xml 4 'Goods Receiver signature' 'The receiver signs after completing the checks. The signature is mandatory for progression and can be cleared and recaptured before review.'
$body += Callout-Paragraph-Xml 5 'Review gate' 'Review checklist is successful only when all four checks are answered, Goods Receiver Name is present and the receiver signature is captured. Back returns to Delivery without discarding the current entered values.'

$body += Page-Break-Xml
$body += Figure-Xml 'rIdDS13' 113 'Goods Receiving Review Stage' 'Annotated tablet wireframe showing the final review summary, confirmation, draft action and PDF filing action.' 4200000 6043902
$body += Figure-Caption-Xml 'Figure 3 - Review summary, draft action and final confirmation'
$body += Callout-Paragraph-Xml 1 'Review & file stage' 'The final stage is available after both signatures and all four Goods-In responses are complete. The stage shows Ready to complete until the final record confirmation is applied.'
$body += Callout-Paragraph-Xml 2 'Read-only review summary' 'The summary displays PO Number, Supplier, Driver, Goods Receiver, Vehicle and Inspection result. Inspection shows four of four completed and identifies the number of exceptions so the user can return and correct an unintended response.'
$body += Callout-Paragraph-Xml 3 'Final record confirmation' 'The user must select I confirm this record is complete and ready to file. Complete & file PDF remains blocked and displays a validation message when this confirmation is absent.'
$body += Callout-Paragraph-Xml 4 'Save draft and Complete & file PDF' 'Save draft retains the unfinished checklist on the approved tablet and does not create the final controlled record. Complete & file PDF creates the populated final PDF after the confirmation gate succeeds.'

$body += Page-Break-Xml
$body += Figure-Xml 'rIdDS14' 114 'Goods Receiving Completed PDF' 'Annotated tablet wireframe showing the completed locked PDF, populated checklist, QA placeholders, filing path and navigation actions.' 4200000 6043902
$body += Figure-Caption-Xml 'Figure 4 - Completed Goods Receiving Checklist PDF and filing result'
$body += Callout-Paragraph-Xml 1 'Completed file status' 'The preview displays the generated checklist filename and the status Completed, locked and filed. The completed PDF is the controlled output; the retained tablet draft is not the final record.'
$body += Callout-Paragraph-Xml 2 'Populated checklist PDF' 'The PDF contains PO, Supplier, Approved Transporter, Vehicle, Driver, Driver Signature, Delivery or Collection Address, Delivery Note, the four Goods-In responses, Goods Receiver, Receiver Signature, completion date/time and Receiver Comments.'
$body += Callout-Paragraph-Xml 3 'Information outcome and QA placeholders' 'The PDF states the Goods-In Information Confirmed result and the instruction to start unpacking for Yes or quarantine stock and pass documents to QA for No. QA Decision, Comment, QA Name, Signature and Date are reserved placeholders in the PDF; they are not interactive fields in the tablet workflow and are used only when the receipt is routed to QA.'
$body += Callout-Paragraph-Xml 4 'Controlled filing path' 'The interface displays the filing path using the Goods Receiving folder, year, month and checklist PDF filename so the user can confirm where the record was filed.'
$body += Callout-Paragraph-Xml 5 'Preview navigation' 'Back to checklist returns from the PDF preview and Next delivery starts the next receipt. Returning from preview does not authorise uncontrolled amendment of a filed PDF; corrections to a completed record follow the controlled correction process.'

$body += Label-Paragraph-Xml 'Detailed checklist sequence' 'The approved tablet workflow operates in the following order.'
$body += Step-Paragraph-Xml 1 'Open the delivery' 'The Goods-In user opens the applicable receipt. The tablet displays the WSC-loaded PO, Supplier, Approved Transporter and Delivery or Collection Address.'
$body += Step-Paragraph-Xml 2 'Confirm delivery context' 'The user confirms the PO reference and reviews the locked WSC values before recording delivery-specific information.'
$body += Step-Paragraph-Xml 3 'Enter delivery details' 'The user enters Vehicle Registration where available, mandatory Driver Name and Delivery Note or Reference where available.'
$body += Step-Paragraph-Xml 4 'Capture driver sign-off' 'The driver signs on the tablet. Continue to goods checks validates PO Number, Driver Name and Driver Signature.'
$body += Step-Paragraph-Xml 5 'Complete the four Goods-In checks' 'The Goods Receiver records one Yes or No response for vehicle cleanliness, absence of non-pharmaceutical products, undamaged pallets and boxes, and Information confirmed.'
$body += Step-Paragraph-Xml 6 'Record receiver details and sign-off' 'The user enters mandatory Goods Receiver Name, optional Receiver Comments and the mandatory Goods Receiver Signature.'
$body += Step-Paragraph-Xml 7 'Open Review & file' 'PLPI validates all four checks, Goods Receiver Name and signature, then displays the populated review summary and exception count.'
$body += Step-Paragraph-Xml 8 'Resolve an exception or input error' 'The user selects Back to return to an earlier stage when a value requires correction. Information confirmed No requires stock quarantine and transfer of documents to QA.'
$body += Step-Paragraph-Xml 9 'Save an unfinished record where required' 'Save draft retains the entered checklist on the approved tablet without creating the completed controlled PDF.'
$body += Step-Paragraph-Xml 10 'Confirm the final record' 'The user reviews the summary and selects the mandatory confirmation that the record is complete and ready to file.'
$body += Step-Paragraph-Xml 11 'Complete and file the PDF' 'Complete & file PDF populates both signatures, responses, comments and completion date/time into the Goods Receiving Checklist and records it as completed, locked and filed.'
$body += Step-Paragraph-Xml 12 'Continue the controlled process' 'The completed PDF is available to the PO document pack. The existing authenticated Goods-In line-clearance control remains linked to the checklist before release to RPi review, after which Packing List Verify & Print and LOG are performed.'
$body += Label-Paragraph-Xml 'Exception rule' 'Any No response is visible as an exception in the Review summary. Information confirmed No specifically requires quarantine and transfer of documents to QA. QA approval is not required for a normal accepted receipt.'
$body += Label-Paragraph-Xml 'Line-clearance control' 'Goods-In line clearance remains an existing PLPI control and is not displayed as a new input field in this tablet wireframe. PLPI retains the authenticated operator and date/time and applies the existing release gate.'
$body += Label-Paragraph-Xml 'Draft and final record' 'Save draft retains an unfinished tablet record. Only Complete & file PDF after final confirmation creates the completed controlled checklist PDF.'
$body += Label-Paragraph-Xml 'Exit condition' 'The Goods Receiving Checklist PDF is completed, locked and filed; any Information confirmed No outcome is routed to quarantine and QA; and the checklist is available to the PO document workflow.'
$body += Label-Paragraph-Xml 'URS traceability' 'URS 4.1.1 - Digital Goods Receiving Checklist workflow and controlled PDF. URS 4.1.2 - Tablet driver signature and linkage to the existing authenticated Goods-In line-clearance control.'
$body += Paragraph-Xml '3.1.1 Packing List Module' 'Heading2' $true
$body += Figure-Xml 'rIdDS01' 101 'Packing List Verify and Print and Log' 'Wireframe showing the new Verify & Print and LOG controls in the Packing List module.'
$body += Figure-Caption-Xml 'Figure 5 - Packing List Verify & Print and LOG controls'
$body += Callout-Paragraph-Xml 1 'PO search and line context' 'The Goods-In user searches for or selects the PO using the existing Packing List controls. PLPI loads the existing product lines and retains the selected PO as the controlling reference for every subsequent verification, print and document action.'
$body += Callout-Paragraph-Xml 2 'Verify & Print' 'This is the new line-level action. The user selects one applicable Packing List line, confirms the displayed product and received quantity, completes the required line-clearance confirmation and authenticates the action. PLPI prints the required labels only after validation succeeds, then records Verified status, print result, user and date/time against that exact line.'
$body += Callout-Paragraph-Xml 3 'LOG' 'This new read-only control opens the audit history for the selected line. It displays verification status, label-print status, authenticated user, date/time and any recorded comment so Goods-In, QA and support users can reconstruct what occurred without altering the record.'
$body += Callout-Paragraph-Xml 4 'Generate PO Packing List' 'The generation action is a PO-level gate. It remains unavailable while an applicable line is unverified, required printing has failed, or line clearance is incomplete. When all lines pass, PLPI generates the controlled PO Packing List and adds it to the document pack.'
$body += Callout-Paragraph-Xml 5 'RPi Documents tab' 'After Packing List generation, the Goods-In user opens the PO document workspace. This transition keeps Packing List fields within the Packing List module and moves only the generated record and linked PO context into the document-review process.'
$body += Label-Paragraph-Xml 'Existing fields' 'All other Packing List fields and existing actions remain unchanged.'
$body += Label-Paragraph-Xml 'Verify & Print' 'The control opens line confirmation, requires the applicable verification and line-clearance checks, prints the required labels and records the Goods-In user and date/time. The line status changes to Verified after successful completion.'
$body += Label-Paragraph-Xml 'LOG' 'The control displays verification and printing status, user, date/time and comments for the selected Packing List line.'
$body += Label-Paragraph-Xml 'Generation gate' 'The PO Packing List can be generated only when every applicable line is verified and printed and the required clearance is complete.'
$body += Label-Paragraph-Xml 'Digital checklist' 'The Goods Receiving Checklist is generated against the PO and completed on a tablet. Mandatory responses and Goods-In line clearance must be complete before the pack can move to RPi review.'
$body += Label-Paragraph-Xml 'Entry condition' 'The PO and its Packing List lines must exist in PLPI and the Goods-In user must have authorised access.'
$body += Label-Paragraph-Xml 'Detailed screen sequence' 'The changed Packing List workflow operates as follows.'
$body += Step-Paragraph-Xml 1 'Search and select' 'The Goods-In user enters or selects the PO and PLPI displays the existing Packing List line information.'
$body += Step-Paragraph-Xml 2 'Review the line' 'The user confirms that the selected product line and the received goods relate to the same PO, product and batch.'
$body += Step-Paragraph-Xml 3 'Select Verify & Print' 'PLPI opens the line confirmation and displays the product description, received quantity and label quantity based on the applicable box count.'
$body += Step-Paragraph-Xml 4 'Confirm line clearance' 'The user confirms the required clearance before printing. If confirmation is cancelled, no verification or print record is created.'
$body += Step-Paragraph-Xml 5 'Apply authenticated sign-off' 'PLPI requires authenticated user confirmation before labels are printed.'
$body += Step-Paragraph-Xml 6 'Print and update status' 'After successful printing, PLPI records the label count, user and date/time and changes the line to Verified.'
$body += Step-Paragraph-Xml 7 'Review LOG' 'The user opens LOG for the selected line to review verification status, print status, user, date/time and comments.'
$body += Step-Paragraph-Xml 8 'Generate the Packing List' 'PLPI checks every applicable line. Generation remains disabled when any required line is not verified or printed.'
$body += Label-Paragraph-Xml 'Validation and error handling' 'A locked or generated Packing List cannot be changed through Verify & Print. Missing data, incomplete clearance or unsuccessful printing leaves the line incomplete and displays a clear message.'
$body += Label-Paragraph-Xml 'Exit condition' 'All applicable lines are verified and printed, the digital GRC and Goods-In clearance are complete, and the generated PO Packing List is available to RPi Documents.'
$body += Label-Paragraph-Xml 'URS traceability' 'URS 4.1.3 - Verify & Print. URS 4.1.4 - Packing List LOG. URS 4.1.5 - Packing List verification and clearance completion gate.'

$body += Page-Break-Xml
$body += Paragraph-Xml '3.2 RPi Documents Module - Goods-In' 'Heading2' $true
$body += Figure-Xml 'rIdDS02' 102 'RPi Documents Goods-In' 'Wireframe showing the RPi Documents dashboard for Goods-In document verification and sign-off.'
$body += Figure-Caption-Xml 'Figure 6 - RPi Documents dashboard and Goods-In sign-off'
$body += Callout-Paragraph-Xml 1 'Selected PO dashboard' 'The dashboard displays the active PO list and opens one PO-controlled document pack at a time. All tiles, statuses and sign-off data shown in the main workspace inherit the selected PO reference, preventing files from different POs being reviewed together.'
$body += Callout-Paragraph-Xml 2 'Required supporting documents' 'The Goods-In pack displays Supplier Invoice, Purchase Order, Supplier Packing List, Supplier Declaration, Temperature Record, Goods Receiving Checklist and Delivery Details. Each tile identifies whether the document is available and provides the controlled preview action used to confirm readability and PO relevance.'
$body += Callout-Paragraph-Xml 3 'Generated PO Packing List' 'The eighth tile is created from the completed Packing List process rather than uploaded as an uncontrolled file. It remains unavailable until PO-level generation succeeds, then becomes part of the same pack reviewed by Goods-In and RPi.'
$body += Callout-Paragraph-Xml 4 'Document review status' 'Each tile changes from missing or Pending View to its completed review state only after the file is opened through the controlled action. A mandatory tile that is missing, unreadable or not reviewed prevents Goods-In release.'
$body += Callout-Paragraph-Xml 5 'Goods-In identity and date/time' 'PLPI populates the authenticated Goods-In user, role and action date/time. These values are system controlled and cannot be replaced with free text, providing traceability for the person who completed the digital pack.'
$body += Callout-Paragraph-Xml 6 'User Sign Off' 'The sign-off action remains disabled until all mandatory documents are available and reviewed, the tablet Goods Receiving Checklist is finalized, required line clearance is recorded, and required QA review is complete where applicable. Successful sign-off changes the PO to Ready for RPi Review and exposes it in RPi Task.'
$body += Label-Paragraph-Xml 'Module access' 'A new RPi Documents tab displays active POs and the selected PO document pack.'
$body += Label-Paragraph-Xml 'Document set' 'The pack contains Supplier Invoice, Purchase Order, Supplier Packing List, Supplier Declaration, Temperature Record, Goods Receiving Checklist, Delivery Details and the generated PO Packing List where applicable.'
$body += Label-Paragraph-Xml 'Document status' 'Each tile shows availability and review status and provides a controlled preview or verification action.'
$body += Label-Paragraph-Xml 'Goods-In sign-off' 'Sign-off is enabled only when the mandatory document set is available or verified, the digital checklist is finalized, line clearance is recorded and required QA review is complete where applicable. The system captures user, role and date/time and changes the pack status to Ready for RPi Review.'
$body += Label-Paragraph-Xml 'Entry condition' 'The PO Packing List has been generated and the PO is available in the RPi Documents tab.'
$body += Label-Paragraph-Xml 'Detailed screen sequence' 'The Goods-In document pack is completed in the following order.'
$body += Step-Paragraph-Xml 1 'Open RPi Documents' 'The user selects the RPi Documents tab and opens the required PO from the active PO list.'
$body += Step-Paragraph-Xml 2 'Review the document tiles' 'PLPI displays Supplier Invoice, Purchase Order, Supplier Packing List, Supplier Declaration, Temperature Record, Goods Receiving Checklist, Delivery Details and generated PO Packing List where applicable.'
$body += Step-Paragraph-Xml 3 'Add or locate each document' 'Uploaded files are linked to the PO. PLPI-generated records are displayed from the controlled system record.'
$body += Step-Paragraph-Xml 4 'Preview and verify' 'The user opens each available document and confirms that it belongs to the selected PO and is readable and complete.'
$body += Step-Paragraph-Xml 5 'Resolve missing documents' 'A mandatory tile that is unavailable, rejected or incomplete keeps the pack in Goods-In and identifies the required correction.'
$body += Step-Paragraph-Xml 6 'Complete GRC and clearance' 'PLPI confirms that the tablet checklist is finalized, the required Goods-In line-clearance record is complete and any required QA review is complete.'
$body += Step-Paragraph-Xml 7 'Apply Goods-In sign-off' 'The user signs off the completed pack. PLPI records user, role and date/time and prevents unrecorded release.'
$body += Step-Paragraph-Xml 8 'Release to RPi Task' 'PLPI updates the pack to Ready for RPi Review and displays it in the Responsible Person queue.'
$body += Label-Paragraph-Xml 'Exit condition' 'The signed-off pack contains the required documents and generated records and is available as one PO-controlled review task.'
$body += Label-Paragraph-Xml 'URS traceability' 'URS 4.1.6 - Required RPi pack documents. URS 4.1.7 - Mandatory document-verification gate. URS 4.1.8 - Goods-In line-clearance gate. URS 4.1.9 - Goods-In audit identity. URS 4.1.10 - Goods-In release gate.'

$body += Page-Break-Xml
$body += Paragraph-Xml '3.3 RPi Task Module' 'Heading2' $true
$body += Paragraph-Xml 'RPi Task is a new module. All screens, controls, checks, decisions and generated records described in this section are new.'
$body += Label-Paragraph-Xml 'URS traceability' 'URS 4.1.11 - Ready for RPi Review status and queue entry. URS 4.2.1 - Active RPi queue and PO search.'
$body += Paragraph-Xml '3.3.1 Document Review and Decision' 'Heading2' $true
$body += Figure-Xml 'rIdDS03' 103 'RPi Task Document Review' 'Wireframe showing the new RPi Task active PO queue, document tiles and decision controls.'
$body += Figure-Caption-Xml 'Figure 7 - RPi Task document review workspace'
$body += Callout-Paragraph-Xml 1 'RPi queue search' 'The Responsible Person searches the new RPi Task queue by PO or uses the displayed active-workflow list. Search narrows the queue only; it does not change the status or content of a review task.'
$body += Callout-Paragraph-Xml 2 'PO card and readiness status' 'Each card shows the PO reference and current workflow state. Only a pack released by Goods-In with Ready for RPi Review status can be opened for the controlled RPi document review.'
$body += Callout-Paragraph-Xml 3 'Eight-document review set' 'The workspace presents the seven required supporting documents together with the generated PO Packing List. The Responsible Person opens each tile and verifies that the file is readable, complete and related to the selected PO.'
$body += Callout-Paragraph-Xml 4 'Pending View indicator' 'A document retains Pending View status until it is opened through View File. PLPI stores the viewed state against the PO task so closing and reopening the module does not create an untraceable manual assumption of review.'
$body += Callout-Paragraph-Xml 5 'Checklist decision gate' 'The checklist is locked while any required file remains unviewed. After all eight files are viewed, Approve opens the RPi checklist; Reject requires a reason, records the authenticated decision and returns the PO to the appropriate Goods-In correction stage.'
$body += Label-Paragraph-Xml 'Queue and search' 'The module provides Search, an Active PO Queue and PO Card Status so the Responsible Person can locate packs ready for review.'
$body += Label-Paragraph-Xml 'Document review' 'Required Document Tiles show status and View File actions. The approval checklist remains locked until all required files have been viewed or verified.'
$body += Label-Paragraph-Xml 'Decision' 'Approve continues to the checklist. Reject requires comments and returns the pack to the applicable Goods-In process for correction. The system records the authenticated user, role, decision and date/time.'
$body += Label-Paragraph-Xml 'Entry condition' 'The PO has Ready for RPi Review status and the Responsible Person has authorised access to RPi Task.'
$body += Step-Paragraph-Xml 1 'Locate the task' 'The user searches by PO or selects the PO card from the Active PO Queue. The card displays the current workflow status.'
$body += Step-Paragraph-Xml 2 'Open the review workspace' 'PLPI loads the required document tiles and keeps the checklist unavailable until document review is complete.'
$body += Step-Paragraph-Xml 3 'View each required file' 'The user opens every required file using View File. PLPI records the viewed or verified state against the current review task.'
$body += Step-Paragraph-Xml 4 'Confirm pack completeness' 'The user compares the documents with the PO and Goods-In sign-off and confirms that the pack is suitable for checklist review.'
$body += Step-Paragraph-Xml 5 'Handle an issue' 'If a document is missing, incorrect or unreadable, the user selects Reject and records a clear correction comment.'
$body += Step-Paragraph-Xml 6 'Return for correction' 'PLPI changes the task status, preserves the rejection reason and sends the PO back to the applicable Goods-In queue.'
$body += Step-Paragraph-Xml 7 'Continue an acceptable pack' 'When every required document has been viewed or verified, Approve enables the RPi Approval Checklist.'
$body += Step-Paragraph-Xml 8 'Record the review decision' 'PLPI records identity, role, decision and date/time. A corrected pack must repeat the document-review steps.'
$body += Label-Paragraph-Xml 'Exit condition' 'The pack is either returned with a traceable correction request or released to the RPi Approval Checklist.'
$body += Label-Paragraph-Xml 'URS traceability' 'URS 4.2.2 - Full PO pack review. URS 4.2.3 - Required-document view gate. URS 4.2.4 - Authenticated approval or rejection decision. URS 4.2.5 - Rejection comments and controlled return for correction.'

$body += Page-Break-Xml
$body += Paragraph-Xml '3.3.2 RPi Approval Checklist' 'Heading2' $true
$body += Figure-Xml 'rIdDS04' 104 'RPi Approval Checklist Top' 'Wireframe showing identity, supplier, transport and temperature checks in the RPi Approval Checklist.'
$body += Figure-Caption-Xml 'Figure 8 - RPi checklist: identity, supplier, transport and temperature checks'
$body += Callout-Paragraph-Xml 1 'EORI and commodity verification' 'The Responsible Person records the outcome of EORI Verification and Commodity Code Verification against the reviewed PO pack. Each mandatory response must be selected before final sign-off can become available.'
$body += Callout-Paragraph-Xml 2 'Supplier status and WDA alignment' 'Supplier Status in FE is recorded as Active or Inactive and Collection Address Matches WDA confirms the applicable distribution address. The selections are retained in the generated approval record.'
$body += Callout-Paragraph-Xml 3 'Reason if Inactive' 'This conditional text field becomes mandatory only when Supplier Status in FE is Inactive. A blank reason keeps Generate & Sign disabled and identifies the outstanding validation to the user.'
$body += Callout-Paragraph-Xml 4 'Transport and temperature compliance' 'The checklist records Authorised Transporter, transit temperature within parameters and storage-site temperature within parameters using controlled Yes, No or N/A options where applicable. Negative responses remain visible for conclusion and deviation assessment.'
$body += Label-Paragraph-Xml 'Identity and supplier checks' 'The checklist records EORI Verification, Commodity Code Verification and Supplier Status in FE. Reason if Inactive becomes mandatory when the supplier status is Inactive.'
$body += Label-Paragraph-Xml 'Distribution checks' 'Collection Address Matches WDA, Authorised Transporter, Transit Temperature Within Parameters and Storage-site Temperature Within Parameters use controlled Yes, No or N/A responses as applicable.'
$body += Figure-Xml 'rIdDS05' 105 'RPi Approval Checklist Bottom' 'Wireframe showing regulatory, decision and sign-off controls in the RPi Approval Checklist.'
$body += Figure-Caption-Xml 'Figure 9 - RPi checklist: regulatory review, decision and sign-off'
$body += Callout-Paragraph-Xml 1 'Article 51 and FMD checks' 'The Responsible Person confirms the Article 51 supplier declaration, FMD compliance statement, applicable FMD decommissioning statement and Bollino or Vignette requirement. Yes, No and N/A values are controlled by the applicability of each check.'
$body += Callout-Paragraph-Xml 2 'Conclusion section' 'PLPI groups the final decision controls after the regulatory checks so the conclusion is based on the reviewed evidence and completed responses rather than entered before the assessment.'
$body += Callout-Paragraph-Xml 3 'RPi comments' 'The comments area records supporting decision context, discrepancies and required follow-up. Where rejection, a negative conclusion or deviation requires explanation, the system validates that suitable comments are present before completion.'
$body += Callout-Paragraph-Xml 4 'Stock suitable for processing' 'The Responsible Person records the controlled suitability decision. A No response is retained in the signed record and prevents the PO from being treated as approved for the subsequent Batch Checker workflow.'
$body += Callout-Paragraph-Xml 5 'Deviation required' 'The user records whether a deviation must be raised. The response and associated comments remain linked to the PO approval record so QA and operational users can identify the required controlled follow-up.'
$body += Callout-Paragraph-Xml 6 'Responsible Person Generate & Sign' 'PLPI displays the authenticated Responsible Person and system date/time and enables Generate & Sign only after all required documents, mandatory checklist responses and conditional fields are complete. Successful execution creates the signed approval record and changes the PO to RPi Approved.'
$body += Label-Paragraph-Xml 'Regulatory checks' 'The checklist records Article 51 Supplier Declaration, FMD Compliance in Declaration, FMD Decommissioning Statement and Bollino / Vignette Sticker Check.'
$body += Label-Paragraph-Xml 'Decision details' 'RPi Comments records the review context. Stock Suitable for Processing and Deviation Required record the final conclusion and whether controlled follow-up is required.'
$body += Label-Paragraph-Xml 'Electronic sign-off' 'Responsible Person and Date/Time are populated from the authenticated session. Generate & Sign is enabled only when mandatory documents and checklist responses are complete.'
$body += Label-Paragraph-Xml 'Detailed checklist sequence' 'The RPi checklist is completed in the following controlled order.'
$body += Step-Paragraph-Xml 1 'Verify EORI' 'The Responsible Person confirms the applicable EORI information against the reviewed pack.'
$body += Step-Paragraph-Xml 2 'Verify the commodity code' 'The commodity code is checked against the applicable product and document information.'
$body += Step-Paragraph-Xml 3 'Confirm supplier status' 'Supplier Status in FE is recorded as Active or Inactive. When Inactive is selected, Reason if Inactive becomes mandatory.'
$body += Step-Paragraph-Xml 4 'Confirm distribution controls' 'The user completes Collection Address Matches WDA and Authorised Transporter.'
$body += Step-Paragraph-Xml 5 'Confirm temperature controls' 'Transit Temperature Within Parameters and Storage-site Temperature Within Parameters are completed as Yes, No or N/A where applicable.'
$body += Step-Paragraph-Xml 6 'Review Article 51 and FMD statements' 'The user completes Article 51 Supplier Declaration, FMD Compliance in Declaration and FMD Decommissioning Statement.'
$body += Step-Paragraph-Xml 7 'Review sticker requirements' 'Bollino / Vignette Sticker Check is completed where Italian or Greek sticker requirements apply; otherwise N/A is selected.'
$body += Step-Paragraph-Xml 8 'Record the conclusion' 'RPi Comments, Stock Suitable for Processing and Deviation Required record the decision and required follow-up.'
$body += Step-Paragraph-Xml 9 'Generate and sign' 'PLPI populates Responsible Person and Date/Time and enables Generate & Sign only when all mandatory responses are complete.'
$body += Label-Paragraph-Xml 'Validation rules' 'No mandatory response may remain blank. Conditional fields follow the selected status, and a negative response requiring follow-up remains visible in the signed record.'
$body += Label-Paragraph-Xml 'Exit condition' 'A signed RPi approval record is attached to the PO and the pack is ready for combined PDF generation.'
$body += Label-Paragraph-Xml 'URS traceability' 'URS 4.2.4 - Authenticated RPi approval decision and sign-off. URS 4.2.6 - Locking and controlled correction of an approved pack.'

$body += Paragraph-Xml '3.3.3 Combined PDF and Email' 'Heading2' $true
$body += Label-Paragraph-Xml 'PDF assembly' 'After successful RP approval, PLPI combines the uploaded supporting documents, completed Goods Receiving Checklist, RP approval form and generated PO Packing List where applicable into one PDF pack.'
$body += Label-Paragraph-Xml 'Email dispatch' 'PLPI sends the generated PDF to sc.india@bnsdistribution.com and records the recipient, generation status, send status and date/time.'
$body += Label-Paragraph-Xml 'Record control' 'The approved pack is locked. Any later correction requires controlled return, re-review and re-approval. External stock-control acceptance is reflected as a workflow status; no separate external user role is created in PLPI.'
$body += Label-Paragraph-Xml 'Detailed processing sequence' 'The approved document pack is processed as follows.'
$body += Step-Paragraph-Xml 1 'Confirm approval' 'PLPI verifies that Generate & Sign completed successfully and belongs to the selected PO.'
$body += Step-Paragraph-Xml 2 'Collect the files' 'PLPI retrieves the supporting documents, completed digital GRC, RP approval form and generated PO Packing List where applicable.'
$body += Step-Paragraph-Xml 3 'Create one PDF' 'The files are combined in controlled order into one PDF without changing the approved source records.'
$body += Step-Paragraph-Xml 4 'Validate the output' 'PLPI confirms successful PDF generation and the presence of the expected document components before dispatch.'
$body += Step-Paragraph-Xml 5 'Send the email' 'The system addresses the PDF to sc.india@bnsdistribution.com and performs the configured email action.'
$body += Step-Paragraph-Xml 6 'Record the outcome' 'PLPI records generation result, recipient, email send status and date/time.'
$body += Step-Paragraph-Xml 7 'Handle processing failure' 'If generation or dispatch fails, approval remains recorded, the pack does not advance and retry does not create a second approval.'
$body += Step-Paragraph-Xml 8 'Lock the approved pack' 'After successful processing, any correction returns the record through document review and approval.'
$body += Label-Paragraph-Xml 'Exit condition' 'The approved PDF pack is generated and emailed, and PLPI holds the processing evidence required for external stock-control action.'
$body += Label-Paragraph-Xml 'URS traceability' 'URS 4.2.7 - Combined PDF generation. URS 4.2.8 - Required combined-PDF content. URS 4.2.9 - Dispatch to sc.india@bnsdistribution.com. URS 4.2.10 - PDF-generation and email audit record.'

$body += Page-Break-Xml
$body += Paragraph-Xml '3.4 Batch Checker Module' 'Heading2' $true
$body += Figure-Xml 'rIdDS06' 106 'Batch Checker New Controls' 'Wireframe showing the new Supplier Declaration and Temperature Record evidence links and updated Batch Check and Print PCL actions.'
$body += Figure-Caption-Xml 'Figure 10 - Batch Checker evidence and action controls'
$body += Callout-Paragraph-Xml 1 'Approved PO dashboard' 'The existing Batch Checker search and list workspace displays the selected PO only after RPi approval, approved-pack processing and the external stock-control acceptance are reflected in PLPI. Existing search and list fields remain unchanged.'
$body += Callout-Paragraph-Xml 2 'Supplier Declaration evidence' 'This new line-level link opens the approved Supplier Declaration associated with the selected PO and product line. It provides direct evidence access without copying Packing List fields into the Batch Checker module.'
$body += Callout-Paragraph-Xml 3 'Temperature Record evidence' 'This new line-level link opens the applicable approved temperature record. When the record is mandatory but unavailable, PLPI prevents completion and directs the user to the missing evidence condition.'
$body += Callout-Paragraph-Xml 4 'Selected product line' 'The action strip identifies the currently selected product line. Batch Check, evidence viewing and Print PCL apply only to this line, preventing an action from being posted against another row in the PO.'
$body += Callout-Paragraph-Xml 5 'Batch Check' 'The updated action opens Product Verification for the selected line. PLPI does not mark the line as checked merely because the pop-up was opened; the user must complete every mandatory verification and select Verify.'
$body += Callout-Paragraph-Xml 6 'Print PCL' 'This action remains disabled until successful Product Verification is stored against the selected line. When enabled, it opens the Product Check Log preview populated with the verified values and completed checks.'
$body += Label-Paragraph-Xml 'Existing fields' 'The existing Batch Checker search fields, list fields and existing actions remain unchanged.'
$body += Label-Paragraph-Xml 'Eligibility' 'The list displays RP/RPi-approved packs only after the external stock-control update is reflected in PLPI.'
$body += Label-Paragraph-Xml 'New evidence links' 'Supplier Declaration and Temperature Record provide direct access to the applicable approved documents for the selected product line.'
$body += Label-Paragraph-Xml 'Updated actions' 'Batch Check opens Product Verification for the selected line. Print PCL remains unavailable until Product Verification has been completed successfully.'
$body += Label-Paragraph-Xml 'Entry condition' 'RP/RPi approval and PDF/email processing are complete and the external stock-control acceptance has been reflected in PLPI.'
$body += Step-Paragraph-Xml 1 'Open Batch Checker' 'The authorised Batch Checker opens the existing module and uses the existing search and filter controls.'
$body += Step-Paragraph-Xml 2 'Locate the eligible PO' 'PLPI lists only records that satisfy the preceding approval and stock-control gates.'
$body += Step-Paragraph-Xml 3 'Select a product line' 'The user selects the required product and batch line. Actions apply only to that selected line.'
$body += Step-Paragraph-Xml 4 'Review Supplier Declaration' 'The new evidence link opens the approved supplier declaration associated with the PO where applicable.'
$body += Step-Paragraph-Xml 5 'Review Temperature Record' 'The new evidence link opens the applicable temperature evidence. An unavailable mandatory record prevents completion.'
$body += Step-Paragraph-Xml 6 'Start Batch Check' 'The user selects Batch Check and PLPI opens Product Verification for the selected line.'
$body += Step-Paragraph-Xml 7 'Control Print PCL' 'Print PCL remains disabled for the line until successful Product Verification is recorded.'
$body += Label-Paragraph-Xml 'Existing-field boundary' 'No existing Packing List fields are added to the Batch Checker design, and no existing Batch Checker list fields are described as new.'
$body += Label-Paragraph-Xml 'Exit condition' 'The selected line has the required evidence available and is ready for Product Verification.'
$body += Label-Paragraph-Xml 'URS traceability' 'URS 4.3.1 - Batch Checker eligibility after external acceptance is reflected in PLPI. URS 4.3.2 - Direct access to Supplier Declaration and Temperature Record evidence where applicable.'

$body += Page-Break-Xml
$body += Paragraph-Xml '3.5 Product Verification Pop-up' 'Heading2' $true
$body += Figure-Xml 'rIdDS07' 107 'Product Verification Pop-up' 'Wireframe showing the Product Verification checks opened from the Batch Check action.'
$body += Figure-Caption-Xml 'Figure 11 - Product Verification pop-up: identity and source checks'
$body += Callout-Paragraph-Xml 1 'Product Verification window' 'PLPI opens the modal from Batch Check and binds it to the selected PO and product line. The user remains in the Batch Checker context and cannot apply the verification to another line while the window is open.'
$body += Callout-Paragraph-Xml 2 'Product identity checks' 'The first controlled checks cover Product Name, Strength and Pack Size, and ECMA. The displayed values come from the selected line and are compared with the approved records, supplier documentation and physical or scanned evidence.'
$body += Callout-Paragraph-Xml 3 'Country and invoice checks' 'Source Country, Country of Origin and Invoice No. are presented as individual confirmations. A mismatch is not accepted through the check box; the source record must be corrected through the owning process and the line reverified.'
$body += Callout-Paragraph-Xml 4 'Raw scan and batch commencement' 'Raw Product Scan starts the physical-evidence group and is followed by Batch No. and MFG Lot No. The user confirms that the scanned or physical pack evidence matches the system-held line data.'
$body += Callout-Paragraph-Xml 5 'Verify gate' 'Verify remains disabled while any mandatory check in either the upper or lower part of the modal is incomplete. On successful selection, PLPI records Batch Checker identity, role and date/time and marks the exact line as verified.'
$body += Callout-Paragraph-Xml 6 'Cancel or close' 'Cancel and the close control exit without creating a verification record, without changing the line status and without enabling Print PCL.'
$body += Figure-Xml 'rIdDS09' 109 'Product Verification Pop-up Lower Fields' 'Focused wireframe view showing the lower Product Verification checks and final Verify and Cancel controls.'
$body += Figure-Caption-Xml 'Figure 12 - Product Verification pop-up: batch, quantity and manufacturer checks'
$body += Callout-Paragraph-Xml 1 'Batch and MFG lot' 'Batch No. and MFG Lot No. are checked against the physical pack, scan evidence and approved system record. The controls remain separate so a matching batch number cannot conceal an incorrect manufacturing lot.'
$body += Callout-Paragraph-Xml 2 'Expiry' 'The Batch Checker confirms the expiry value for the selected line against the pack and supporting evidence. Any discrepancy requires correction and a new controlled verification.'
$body += Callout-Paragraph-Xml 3 'Quantity and boxes' 'Quantity Received and Number of Boxes are confirmed against the Goods-In and Packing List records. The values support reconciliation of the received stock before the PCL is generated.'
$body += Callout-Paragraph-Xml 4 'Manufacturer details' 'Manufacturer and Manufacturer Address are verified as separate values. A missing or unselected manufacturer keeps the line incomplete and must be resolved before Verify can become available.'
$body += Callout-Paragraph-Xml 5 'Foreign ECMA Holder' 'The user confirms the displayed foreign ECMA holder against the approved product and supplier documentation for the selected line.'
$body += Callout-Paragraph-Xml 6 'Foreign Leaflet Date' 'The applicable foreign leaflet date is checked against the controlled leaflet or approved source record and is retained in the verified data used by the PCL preview.'
$body += Callout-Paragraph-Xml 7 'Final Verify' 'The action becomes available only when every required check across both views is selected. Successful verification updates the line status and writes the authenticated audit entry once.'
$body += Callout-Paragraph-Xml 8 'Final Cancel' 'Cancel closes the modal without partial completion. Checked boxes that were not submitted do not constitute an approved Batch Check record.'
$body += Label-Paragraph-Xml 'Displayed checks' 'The pop-up presents Product Name, Strength / Pack Size, ECMA, Source Country, Country of Origin, Invoice No., Raw Product Scan, Batch No., MFG Lot No., Expiry, Quantity Received, Number of Boxes, Manufacturer, Manufacturer Address, Foreign ECMA Holder and Foreign Leaflet Date.'
$body += Label-Paragraph-Xml 'Verification gate' 'Verify is enabled only after all required checks are completed. Successful verification records the Batch Checker user, role and date/time against the product line.'
$body += Label-Paragraph-Xml 'Cancel' 'Cancel closes the pop-up without creating a verification record or changing the line status.'
$body += Label-Paragraph-Xml 'Detailed verification sequence' 'The Batch Checker completes the pop-up as follows.'
$body += Step-Paragraph-Xml 1 'Open the selected line' 'PLPI loads Product Verification for the selected Batch Checker line and prevents the result from being applied to a different line.'
$body += Step-Paragraph-Xml 2 'Review product identity' 'The user verifies Product Name, Strength / Pack Size and ECMA against approved records and physical evidence.'
$body += Step-Paragraph-Xml 3 'Review country and invoice details' 'The user verifies Source Country, Country of Origin and Invoice No.'
$body += Step-Paragraph-Xml 4 'Review scan and batch details' 'The user verifies Raw Product Scan, Batch No., MFG Lot No. and Expiry.'
$body += Step-Paragraph-Xml 5 'Review received quantities' 'The user verifies Quantity Received and Number of Boxes against Goods-In and Packing List records.'
$body += Step-Paragraph-Xml 6 'Review manufacturer and leaflet details' 'The user verifies Manufacturer, Manufacturer Address, Foreign ECMA Holder and Foreign Leaflet Date.'
$body += Step-Paragraph-Xml 7 'Complete verification' 'After all mandatory checks are selected, Verify becomes available. PLPI records user, role and date/time and marks the line as batch checked.'
$body += Label-Paragraph-Xml 'Validation and exception handling' 'A missing mandatory check keeps Verify disabled. Cancel creates no verification record. A corrected source record requires the applicable line to be verified again.'
$body += Label-Paragraph-Xml 'Exit condition' 'Successful Product Verification is stored against the selected line and Print PCL becomes available.'
$body += Label-Paragraph-Xml 'URS traceability' 'URS 4.3.3 - Product Verification pop-up, mandatory checks, Verify gate and Batch Checker attribution.'

$body += Page-Break-Xml
$body += Paragraph-Xml '3.6 Print PCL Preview and Verification' 'Heading2' $true
$body += Figure-Xml 'rIdDS08' 108 'PCL Preview' 'Wireframe showing the Product Check Log preview, completed checks, line clearance and Verify and Print action.'
$body += Figure-Caption-Xml 'Figure 13 - Product Check Log preview and print control'
$body += Callout-Paragraph-Xml 1 'Product Check Log preview' 'The window is a controlled preview generated for the selected verified line. It displays the PCL title and one-page context before the user performs the final clearance and print action.'
$body += Callout-Paragraph-Xml 2 'Verified detail line' 'The preview populates PO, supplier, product, strength and pack size, ECMA, country, invoice, scan, batch, expiry, quantity, boxes and manufacturer information from the selected verified record rather than asking the user to retype it.'
$body += Callout-Paragraph-Xml 3 'Completion check boxes' 'Each displayed PCL item has a review confirmation where required. The user confirms that the populated value and associated check are correct; incomplete mandatory confirmation prevents final printing.'
$body += Callout-Paragraph-Xml 4 'Line-clearance audit evidence' 'The preview displays line-clearance evidence before Batch Check, including the recorded user and date/time. This establishes that the applicable operational clearance preceded the final PCL action.'
$body += Callout-Paragraph-Xml 5 'Verify and Print' 'The action remains disabled until Product Verification, mandatory preview checks and line clearance are complete. Successful printing records print status, authenticated user, role and date/time and releases the completed PCL to authorised downstream users.'
$body += Callout-Paragraph-Xml 6 'Close' 'Close exits the preview without recording a successful print. The line remains incomplete for the PCL stage and downstream gating remains in place.'
$body += Figure-Xml 'rIdDS10' 110 'PCL Preview Lower Fields' 'Focused wireframe view showing lower PCL manufacturer, leaflet, comments, audit and print controls.'
$body += Figure-Caption-Xml 'Figure 14 - Product Check Log lower details, audit and print controls'
$body += Callout-Paragraph-Xml 1 'Manufacturer' 'The PCL displays the manufacturer value carried from the verified Product Verification result. The value is reviewable in the preview but is not edited as uncontrolled free text at print time.'
$body += Callout-Paragraph-Xml 2 'Manufacturer address' 'The verified manufacturer address is displayed separately so the user can confirm both organisation and location before the PCL is finalised.'
$body += Callout-Paragraph-Xml 3 'Foreign ECMA holder' 'The foreign ECMA holder is populated from the verified line and included in the final PCL record for product and regulatory traceability.'
$body += Callout-Paragraph-Xml 4 'Foreign leaflet date' 'The preview displays the verified leaflet date and its completed confirmation, ensuring the final printed record reflects the applicable controlled leaflet information.'
$body += Callout-Paragraph-Xml 5 'PCL comments' 'Comments present the verification conclusion and any applicable supporting context. The content becomes part of the printed PCL and must remain associated with the selected line.'
$body += Callout-Paragraph-Xml 6 'Checks carried out by' 'PLPI displays the Batch Checker identity and completion date drawn from the successful Product Verification audit record. These fields are system populated and provide the signatory trace for the printed PCL.'
$body += Callout-Paragraph-Xml 7 'Final Verify and Print' 'Selecting this control executes the final validated print action. A print failure does not create successful status; a permitted reprint retains the original verification history and records the additional event.'
$body += Callout-Paragraph-Xml 8 'Final Close' 'Closing the lower preview creates no print event and does not satisfy the downstream completion gate.'
$body += Label-Paragraph-Xml 'PCL preview' 'Print PCL opens a preview populated with the successfully verified product details and completed checks.'
$body += Label-Paragraph-Xml 'Line clearance' 'The preview requires the applicable area, product and documentation clearance confirmations before final sign-off.'
$body += Label-Paragraph-Xml 'Verify and Print' 'The action is enabled only when Batch Check verification and mandatory line clearance are complete. PLPI records print status, user, role and date/time.'
$body += Label-Paragraph-Xml 'Close and downstream gate' 'Close exits without printing. Downstream activity remains blocked until the applicable Batch Checker review, line clearance and PCL requirements are complete.'
$body += Label-Paragraph-Xml 'Detailed preview and print sequence' 'The Product Check Log is finalised as follows.'
$body += Step-Paragraph-Xml 1 'Select Print PCL' 'PLPI confirms that the selected line has a successful Batch Check record before opening the preview.'
$body += Step-Paragraph-Xml 2 'Populate the preview' 'The preview is populated from verified product, batch, quantity, manufacturer and document-check values.'
$body += Step-Paragraph-Xml 3 'Display completed checks' 'The preview shows the checks completed in Product Verification for final review.'
$body += Step-Paragraph-Xml 4 'Complete line clearance' 'The user confirms the applicable area, product and documentation clearance items.'
$body += Step-Paragraph-Xml 5 'Review the final PCL' 'The user confirms that displayed details and checks relate to the selected PO and line.'
$body += Step-Paragraph-Xml 6 'Verify and print' 'PLPI enables Verify and Print only when all mandatory preview and clearance checks are complete.'
$body += Step-Paragraph-Xml 7 'Record the print event' 'After successful printing, PLPI records print status, user, role and date/time.'
$body += Step-Paragraph-Xml 8 'Complete the stage' 'The PCL becomes available to authorised downstream users and the Phase 1 completion gate is satisfied for the line.'
$body += Label-Paragraph-Xml 'Validation and exception handling' 'Close exits without printing. A print failure cannot record successful status. Reprinting retains the original verification history and records the additional print event where supported.'
$body += Label-Paragraph-Xml 'Exit condition' 'The line has completed Batch Check, line clearance and printed PCL; downstream activity starts only when all applicable lines satisfy the controls.'
$body += Label-Paragraph-Xml 'URS traceability' 'URS 4.3.4 - PCL preview and printing. URS 4.3.5 - Batch Checker line clearance. URS 4.3.6 - PCL generation gate. URS 4.3.7 - Batch Checker audit identity. URS 4.3.8 - Downstream activity gate.'

$body += Page-Break-Xml
$body += Paragraph-Xml '3.7 Workflow Status, Corrections and Audit Behaviour' 'Heading2' $true
$body += Label-Paragraph-Xml 'Status control' 'PLPI shows the current PO and line status in the relevant module. A status changes only after the applicable validation and authenticated action succeeds.'
$body += Step-Paragraph-Xml 1 'Goods-In in progress' 'The digital GRC, Packing List verification, document pack or Goods-In sign-off is incomplete.'
$body += Step-Paragraph-Xml 2 'Ready for RPi Review' 'Goods-In controls are complete and the signed-off pack is available in RPi Task.'
$body += Step-Paragraph-Xml 3 'Returned for correction' 'The Responsible Person has rejected the pack with comments and the applicable Goods-In activity requires correction.'
$body += Step-Paragraph-Xml 4 'RPi Approved' 'Required documents and checklist are complete and the Responsible Person has generated and signed the approval record.'
$body += Step-Paragraph-Xml 5 'PDF and email processed' 'The approved pack has been combined and the recipient and processing result have been recorded.'
$body += Step-Paragraph-Xml 6 'Ready for Batch Check' 'External stock-control acceptance has been reflected and the PO is visible to the Batch Checker.'
$body += Step-Paragraph-Xml 7 'Batch Check verified' 'Product Verification is complete for the line and PCL preview is available.'
$body += Step-Paragraph-Xml 8 'PCL printed' 'Line clearance and Verify and Print are complete and the print event is recorded.'
$body += Label-Paragraph-Xml 'Correction control' 'A correction returns the record to the owning stage. Later approvals or outputs affected by the change must be repeated through the controlled workflow.'
$body += Label-Paragraph-Xml 'Audit content' 'For each controlled action, PLPI retains the PO or line reference, action, previous and new status, authenticated user, role, date/time and comments where applicable.'
$body += Label-Paragraph-Xml 'Record visibility' 'Authorised business, QA, IT and operational users can view records according to role, while only the designated operational role performs the controlled action.'

$body += Page-Break-Xml
$body += Paragraph-Xml '4. Additional Non-Functional Requirements' 'Heading1' $true
$body += Paragraph-Xml '4.1 Audit Trail' 'Heading2' $true
$body += Paragraph-Xml 'PLPI shall retain traceable records for delivery details, driver and receiver signatures, four Goods-In responses, receiver comments, final confirmation, completed checklist PDF, existing line clearance, document review, sign-off, correction, approval, PDF generation, email dispatch, Batch Check verification and PCL printing. Records shall include the applicable PO or line, user, role, action, status, comments and date/time where applicable.'
$body += Paragraph-Xml '4.2 Availability' 'Heading2' $true
$body += Paragraph-Xml 'The new workflow shall operate within the established PLPI availability and planned maintenance arrangements. Saved records shall remain available to authorised users after service restoration.'
$body += Paragraph-Xml '4.3 Capacity Limits' 'Heading2' $true
$body += Paragraph-Xml 'The design shall support the expected operational volume of POs, product lines, checklist records, signatures, documents and concurrent authorised tablet or desktop users. Record locking shall prevent conflicting updates to the same controlled task.'
$body += Paragraph-Xml '4.4 Performance' 'Heading2' $true
$body += Paragraph-Xml 'Search, document status, checklist validation, preview and sign-off actions shall respond within acceptable operational time under normal PLPI load. Large PDF generation and email processing shall show a clear in-progress or completion status.'
$body += Paragraph-Xml '4.5 Recoverability' 'Heading2' $true
$body += Paragraph-Xml 'Final checklist data, signatures, workflow data, uploaded files and generated records shall be included in the existing database and file backup and recovery controls. A saved tablet draft is not the final controlled record. A failed PDF or email action shall be recoverable without duplicating approval records.'
$body += Paragraph-Xml '4.6 Security Requirements' 'Heading2' $true
$body += Paragraph-Xml 'Access shall use existing PLPI authentication and role permissions. Goods-In, RP/RPi and Batch Checker actions shall be available only to authorised roles. Internal electronic sign-off shall use the authenticated user identity; driver and receiver signatures shall be retained with the completed receiving record. QA placeholders in the PDF shall not operate as tablet input controls.'
$body += Paragraph-Xml '4.7 Error Handling' 'Heading2' $true
$body += Paragraph-Xml 'The system shall display clear validation or processing messages for missing mandatory delivery details, unanswered Goods checks, missing signatures, absent final confirmation, incomplete existing clearance, missing documents, failed generation, failed email dispatch and unavailable records. Errors shall not advance workflow status or create an incomplete controlled record.'
$body += Paragraph-Xml '4.8 Usability' 'Heading2' $true
$body += Paragraph-Xml 'The Goods Receiving Checklist and signature controls shall be usable on the approved tablet form factor. The three-stage stepper, mandatory checks, exception count, final confirmation and disabled actions shall be clear without changing the established PLPI navigation pattern.'
$body += Paragraph-Xml '4.9 Accuracy and Validity' 'Heading2' $true
$body += Paragraph-Xml 'WSC-loaded values, mandatory responses, both signatures, exception handling and workflow gates shall be validated before the checklist is completed and filed. The generated checklist PDF and PCL outputs shall use the applicable verified record values held in PLPI.'


# Read the retained section properties before replacing document.xml.
$baseStream = [IO.File]::Open($reference, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::ReadWrite)
$baseZip = New-Object IO.Compression.ZipArchive($baseStream, [IO.Compression.ZipArchiveMode]::Read, $false)
$baseDocEntry = $baseZip.GetEntry('word/document.xml')
$baseReader = New-Object IO.StreamReader($baseDocEntry.Open())
$baseDocXml = $baseReader.ReadToEnd()
$baseReader.Close()
$baseZip.Dispose()
$baseStream.Dispose()
$sectMatches = [regex]::Matches($baseDocXml, '<w:sectPr[\s\S]*?</w:sectPr>')
if ($sectMatches.Count -eq 0) { throw 'Reference section properties not found.' }
$sectPr = $sectMatches[$sectMatches.Count - 1].Value

$documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 w15"><w:body>' +
  ($body -join '') + $sectPr + '</w:body></w:document>'

function Read-Zip-Entry($zip, [string]$name) {
  $entry = $zip.GetEntry($name)
  if ($null -eq $entry) { return $null }
  $reader = New-Object IO.StreamReader($entry.Open())
  $value = $reader.ReadToEnd()
  $reader.Close()
  return $value
}

function Write-Zip-Entry($zip, [string]$name, [string]$value) {
  $old = $zip.GetEntry($name)
  if ($null -ne $old) { $old.Delete() }
  $entry = $zip.CreateEntry($name, [IO.Compression.CompressionLevel]::Optimal)
  $writer = New-Object IO.StreamWriter($entry.Open(), [Text.UTF8Encoding]::new($false))
  $writer.Write($value)
  $writer.Close()
}

$workStream = [IO.File]::Open($tempOutput, [IO.FileMode]::Open, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
$workZip = New-Object IO.Compression.ZipArchive($workStream, [IO.Compression.ZipArchiveMode]::Update, $false)

Write-Zip-Entry $workZip 'word/document.xml' $documentXml

$rels = Read-Zip-Entry $workZip 'word/_rels/document.xml.rels'
$newRelationships = @()
for ($i = 1; $i -le 15; $i++) {
  $suffix = "{0:D2}" -f $i
  $newRelationships += "<Relationship Id=`"rIdDS$suffix`" Type=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships/image`" Target=`"media/ds-wireframe-$suffix.png`"/>"
}
$rels = $rels -replace '</Relationships>', (($newRelationships -join '') + '</Relationships>')
Write-Zip-Entry $workZip 'word/_rels/document.xml.rels' $rels

for ($i = 0; $i -lt $imageFiles.Count; $i++) {
  $entryName = "word/media/ds-wireframe-{0:D2}.png" -f ($i + 1)
  $oldImage = $workZip.GetEntry($entryName)
  if ($null -ne $oldImage) { $oldImage.Delete() }
  $imageEntry = $workZip.CreateEntry($entryName, [IO.Compression.CompressionLevel]::Optimal)
  $sourceStream = [IO.File]::OpenRead((Join-Path $screens $imageFiles[$i]))
  $targetStream = $imageEntry.Open()
  $sourceStream.CopyTo($targetStream)
  $targetStream.Close()
  $sourceStream.Close()
}

$contentTypes = Read-Zip-Entry $workZip '[Content_Types].xml'
if ($contentTypes -notmatch 'Extension="png"') {
  $contentTypes = $contentTypes -replace '</Types>', '<Default Extension="png" ContentType="image/png"/></Types>'
  Write-Zip-Entry $workZip '[Content_Types].xml' $contentTypes
}

$settings = Read-Zip-Entry $workZip 'word/settings.xml'
$settings = [regex]::Replace($settings, '<w:(documentProtection|writeProtection)\b[^>]*/>', '')
$settings = [regex]::Replace($settings, '<w:(documentProtection|writeProtection)\b[^>]*>[\s\S]*?</w:\1>', '')
if ($settings -match '<w:updateFields[^>]*/>') {
  $settings = [regex]::Replace($settings, '<w:updateFields[^>]*/>', '<w:updateFields w:val="true"/>')
} else {
  $settings = $settings -replace '</w:settings>', '<w:updateFields w:val="true"/></w:settings>'
}
Write-Zip-Entry $workZip 'word/settings.xml' $settings

foreach ($entryName in @('word/header1.xml', 'word/footer1.xml')) {
  $part = Read-Zip-Entry $workZip $entryName
  if ($entryName -like '*header*') {
    $part = $part.Replace(' Specification: PLPI Assembly Control Software', ' Specification: PLPI Batch Record Automation')
    $part = $part.Replace('VMP/A5/0007/09/v12', 'DS/PLPI/PH1/v1.0')
  } else {
    $part = $part.Replace('VMP/A5/0007/09/v12', 'DS/PLPI/PH1/v1.0')
    $part = $part.Replace('>7<', '>1<')
    $part = $part.Replace('<w:fldChar w:fldCharType="begin"/>', '<w:fldChar w:fldCharType="begin" w:dirty="true"/>')
  }
  Write-Zip-Entry $workZip $entryName $part
}

$core = Read-Zip-Entry $workZip 'docProps/core.xml'
if ($null -ne $core) {
  $core = [regex]::Replace($core, '<dc:title>[\s\S]*?</dc:title>', '<dc:title>Design Specification - PLPI Batch Record Automation</dc:title>')
  $core = [regex]::Replace($core, '<dc:subject>[\s\S]*?</dc:subject>', '<dc:subject>Phase 1 digital Goods Receiving Checklist, RPi review and Batch Checker controls</dc:subject>')
  Write-Zip-Entry $workZip 'docProps/core.xml' $core
}

$workZip.Dispose()
$workStream.Dispose()

# Validate the produced package and key content without opening Microsoft Word.
$validationStream = [IO.File]::Open($tempOutput, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::ReadWrite)
$validationZip = New-Object IO.Compression.ZipArchive($validationStream, [IO.Compression.ZipArchiveMode]::Read, $false)
[xml](Read-Zip-Entry $validationZip 'word/document.xml') | Out-Null
$embeddedCount = @($validationZip.Entries | Where-Object { $_.FullName -like 'word/media/ds-wireframe-*.png' }).Count
if ($embeddedCount -ne 15) { throw "Expected 15 embedded design images; found $embeddedCount." }
$validationText = Read-Zip-Entry $validationZip 'word/document.xml'
$validationZip.Dispose()
$validationStream.Dispose()

foreach ($requiredText in @('PLPI Batch Record Automation', 'Verify &amp; Print', 'Digital Goods Receiving Checklist', 'Delivery', 'Goods checks', 'Review &amp; file', 'Save draft', 'Complete &amp; file PDF', 'Completed, locked and filed', 'QA approval is not required', 'RPi Task Module', 'sc.india@bnsdistribution.com', 'Product Verification Pop-up', 'End-to-End Workflow Flowchart', 'URS traceability', '4.1.11', '4.2.10', '4.3.8')) {
  if ($validationText -notlike "*$requiredText*") { throw "Required DS content missing: $requiredText" }
}
foreach ($forbiddenText in @('PLPI Assembly Control Software', 'wscindia@gmail.com', 'sc.india@bnsdistribution.uk', 'Load Demo Data control is included', 'Same as above', 'Submit Checklist', 'Damage photo capture', 'GMP document evidence', '5. URS Traceability', '4.1.12', '4.1.13', '4.1.14', '4.1.15', '4.1.16', '4.1.17', '4.1.18', '4.1.19', '4.1.20')) {
  if ($validationText -like "*$forbiddenText*") { throw "Forbidden or obsolete content found: $forbiddenText" }
}


Move-Item -LiteralPath $tempOutput -Destination $output -Force

$finalHash = (Get-FileHash -LiteralPath $output -Algorithm SHA256).Hash
$finalSize = (Get-Item -LiteralPath $output).Length
Write-Output "DOCX=$output"
Write-Output "SIZE=$finalSize"
Write-Output "SHA256=$finalHash"
Write-Output "IMAGES=$embeddedCount"




















