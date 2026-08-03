$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression

$root = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation'
$source = Join-Path $root 'docz\FS-PLPI BAR - Goods Receiving Checklist Updated.docx'
$working = Join-Path $root 'temp_grc_update\FS-PLPI-BAR-working.docx'
Copy-Item -LiteralPath $source -Destination $working -Force

function Read-Zip-Entry($zip, [string]$name) {
  $entry = $zip.GetEntry($name)
  if ($null -eq $entry) { return $null }
  $reader = New-Object IO.StreamReader($entry.Open())
  $value = $reader.ReadToEnd()
  $reader.Close()
  return $value
}

function Write-Zip-Entry($zip, [string]$name, [string]$value) {
  $entry = $zip.GetEntry($name)
  if ($null -ne $entry) { $entry.Delete() }
  $entry = $zip.CreateEntry($name, [IO.Compression.CompressionLevel]::Optimal)
  $writer = New-Object IO.StreamWriter($entry.Open(), [Text.UTF8Encoding]::new($false))
  $writer.Write($value)
  $writer.Close()
}

function Node-Text($node, $ns) {
  return (($node.SelectNodes('.//w:t', $ns) | ForEach-Object InnerText) -join '')
}

function Set-Paragraph-Text($paragraph, [string]$text, $xml, $ns) {
  $pPr = $paragraph.SelectSingleNode('./w:pPr', $ns)
  $firstRun = $paragraph.SelectSingleNode('./w:r', $ns)
  $rPr = if ($null -ne $firstRun) { $firstRun.SelectSingleNode('./w:rPr', $ns) } else { $null }
  foreach ($child in @($paragraph.ChildNodes)) {
    if ($child -ne $pPr) { [void]$paragraph.RemoveChild($child) }
  }
  $run = $xml.CreateElement('w', 'r', $ns.LookupNamespace('w'))
  if ($null -ne $rPr) { [void]$run.AppendChild($rPr.CloneNode($true)) }
  $textNode = $xml.CreateElement('w', 't', $ns.LookupNamespace('w'))
  $textNode.InnerText = $text
  [void]$run.AppendChild($textNode)
  [void]$paragraph.AppendChild($run)
}

function Set-Cell-Text($cell, [string]$text, $xml, $ns) {
  $paragraphs = @($cell.SelectNodes('./w:p', $ns))
  if ($paragraphs.Count -eq 0) {
    $paragraph = $xml.CreateElement('w', 'p', $ns.LookupNamespace('w'))
    [void]$cell.AppendChild($paragraph)
  } else {
    $paragraph = $paragraphs[0]
    for ($i = 1; $i -lt $paragraphs.Count; $i++) { [void]$cell.RemoveChild($paragraphs[$i]) }
  }
  Set-Paragraph-Text $paragraph $text $xml $ns
}

function Replace-Paragraph([string]$contains, [string]$replacement, $xml, $ns) {
  $matches = @($xml.SelectNodes('//w:p', $ns) | Where-Object { (Node-Text $_ $ns) -like "*$contains*" })
  if ($matches.Count -ne 1) { throw "Expected one paragraph containing '$contains'; found $($matches.Count)." }
  Set-Paragraph-Text $matches[0] $replacement $xml $ns
}

$stream = [IO.File]::Open($working, [IO.FileMode]::Open, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
$zip = New-Object IO.Compression.ZipArchive($stream, [IO.Compression.ZipArchiveMode]::Update, $false)
[xml]$xml = Read-Zip-Entry $zip 'word/document.xml'
$ns = New-Object Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')

$sectionTable = $null
foreach ($table in @($xml.SelectNodes('//w:tbl', $ns))) {
  $firstRow = $table.SelectSingleNode('./w:tr[1]', $ns)
  $cells = if ($null -ne $firstRow) { @($firstRow.SelectNodes('./w:tc', $ns)) } else { @() }
  if ($cells.Count -ge 1 -and (Node-Text $cells[0] $ns).Trim() -eq '3.1') { $sectionTable = $table; break }
}
if ($null -eq $sectionTable) { throw 'FS section 3.1 table not found.' }

$sectionRows = @($sectionTable.SelectNodes('./w:tr', $ns))
$rowByLabel = @{}
foreach ($row in $sectionRows) {
  $cells = @($row.SelectNodes('./w:tc', $ns))
  if ($cells.Count -ge 2) { $rowByLabel[(Node-Text $cells[0] $ns).Trim()] = $row }
}

$updates = [ordered]@{
  'Purpose' = 'To replace the printed Goods Receiving Checklist with a controlled tablet workflow and retain the existing Packing List Verify & Print and LOG controls. Existing Packing List fields remain unchanged.'
  'Role' = 'Goods-In User; Driver signature capture; QA User only when QA review is required'
  'Operations' = 'The Goods-In user opens the PO-linked checklist, confirms delivery and driver details, completes the vehicle inspection, records line clearance, signs the receipt and records the Goods-In confirmation. Failed vehicle checks or a No confirmation place the receipt into quarantine and require QA disposition. The user may attach documents and photographs, recover an incomplete draft, preview the record and submit it when all applicable validations are complete. Packing List Verify & Print and LOG continue as currently specified.'
  'Use case' = 'Goods-In completes and submits a traceable digital receiving record before the PO is released to RPi document review. QA participates only for an exception requiring QA disposition.'
  'Output' = 'Controlled digital Goods Receiving Checklist, delivery and inspection record, line-clearance audit, signatures, linked evidence, conditional QA disposition, Verified Packing List lines, LOG records and generated PO Packing List checklist.'
  'URS ID' = '4.1.1 - 4.1.4; 4.1.7 - 4.1.20'
  'Business Rule' = 'Mandatory receipt details, driver and Goods Receiver signatures, vehicle checks, line clearance and Goods-In confirmation shall be complete before submission. Cleanliness No, non-pharmaceutical products Yes, damage Yes, or Information Confirmed No shall prevent approval for unpacking and require QA disposition. QA approval is not mandatory for a normal accepted receipt. Draft autosave is temporary and final submission creates the controlled read-only record. Packing List generation remains unavailable until the applicable checklist, verification, printing and line-clearance gates are complete.'
}
foreach ($entry in $updates.GetEnumerator()) {
  if (-not $rowByLabel.ContainsKey($entry.Key)) { throw "Missing FS 3.1 row: $($entry.Key)" }
  $cells = @($rowByLabel[$entry.Key].SelectNodes('./w:tc', $ns))
  Set-Cell-Text $cells[1] $entry.Value $xml $ns
}

$inputRow = $rowByLabel['Input']
$inputCells = @($inputRow.SelectNodes('./w:tc', $ns))
$nested = $inputCells[1].SelectSingleNode('.//w:tbl', $ns)
if ($null -eq $nested) { throw 'FS 3.1 input field table not found.' }
$nestedRows = @($nested.SelectNodes('./w:tr', $ns))
if ($nestedRows.Count -lt 2) { throw 'FS 3.1 input field table does not have a reusable data row.' }
$headerRow = $nestedRows[0]
$baseDataRow = $nestedRows[1]
foreach ($row in @($nested.SelectNodes('./w:tr', $ns))) {
  if ($row -ne $headerRow) { [void]$nested.RemoveChild($row) }
}

$fields = @(
  @('Verify & Print', 'Existing Packing List button - updated logic', 'No new Packing List fields. Performs the existing line confirmation, label print, authenticated attribution and Verified status update.'),
  @('LOG', 'Existing read-only log', 'No new Packing List fields. Displays line verification and printing status, user, date/time and comments.'),
  @('PO and supplier details', 'New checklist field group', 'PO Number, Supplier Name and Approved Transporter. The checklist remains linked to the selected PO.'),
  @('Vehicle and driver details', 'New fields and signature', 'Vehicle Number, Driver Name and Driver Signature. Driver signature is captured separately from authenticated internal sign-off.'),
  @('Delivery addresses', 'New text areas and copy action', 'Delivery / Collection Address and Delivery / Collection Note Address. Same as above copies the first address into the note-address field.'),
  @('Delivery vehicle checklist', 'New controlled Yes / No checks', 'Cleanliness of vehicle; any non-pharmaceutical products; and any pallet, box or outer damage.'),
  @('Line Clearance', 'New controlled action and read-only log', 'Records the authenticated Goods-In operator and date/time. Reset before final submission requires confirmation and remains traceable.'),
  @('Goods Receiver details', 'New fields and signature', 'Goods Receiver Name, Signature, Date and Comments.'),
  @('Information Confirmed - Goods-In Team', 'New decision and sign-off', 'Yes / No decision with confirming user, signature and date/time. No quarantines the receipt and requires QA review.'),
  @('QA Decision', 'New conditional disposition', 'When QA review is required: Quarantine for Investigation, Approved for Unpacking or Reject, comments, QA identity, signature and date/time. Not mandatory for a normal accepted receipt.'),
  @('GMP document evidence', 'New attachment control', 'Attaches supplier documents to the selected PO and displays the current attachment list.'),
  @('Damage photo capture', 'New tablet camera control', 'Captures cleanliness or packaging-damage evidence and retains it with the checklist.'),
  @('Local Status and Form Completion', 'New read-only status', 'Shows draft saving / recovery and completion of PO and driver, vehicle, Goods Receiver and conditional QA stages.'),
  @('Export / Print', 'New preview action', 'Populates a controlled printable view from the current checklist without creating final submitted status.'),
  @('Submit Checklist', 'New controlled action', 'Validates all mandatory and applicable fields, creates the read-only controlled record, records final status and clears the temporary draft after successful commit.')
)
foreach ($field in $fields) {
  $newRow = $baseDataRow.CloneNode($true)
  $cells = @($newRow.SelectNodes('./w:tc', $ns))
  for ($i = 0; $i -lt 3; $i++) { Set-Cell-Text $cells[$i] $field[$i] $xml $ns }
  [void]$nested.AppendChild($newRow)
}

$traceTable = $null
foreach ($table in @($xml.SelectNodes('//w:tbl', $ns))) {
  $allText = Node-Text $table $ns
  if ($allText -like '*URS ID & DS ID Ref*' -and $allText -like '*4.3.8*') { $traceTable = $table; break }
}
if ($null -eq $traceTable) { throw 'FS traceability table not found.' }

$trace = [ordered]@{
  '4.1.11' = @('Checklist receipt details', 'Provide PO, supplier, transporter, vehicle, driver and delivery-address details in the PO-linked checklist.')
  '4.1.12' = @('Driver signature and note address', 'Capture the driver signature and allow the delivery-note address to be entered or copied from the delivery address.')
  '4.1.13' = @('Vehicle inspection', 'Record vehicle cleanliness, non-pharmaceutical products and packaging damage using controlled Yes / No responses.')
  '4.1.14' = @('Failed-inspection quarantine', 'Prevent approval for unpacking and require quarantine and QA review when a vehicle inspection fails.')
  '4.1.15' = @('Goods-In line-clearance audit', 'Record operator and date/time and control any reset before final submission.')
  '4.1.16' = @('Receiver and Goods-In confirmation', 'Capture receiver details and signature plus the Goods-In Information Confirmed decision and sign-off.')
  '4.1.17' = @('Conditional QA disposition', 'Provide QA disposition and sign-off when required; do not require QA approval for a normal accepted receipt.')
  '4.1.18' = @('Documents and photographs', 'Attach supplier documents and damage or cleanliness photographs to the selected PO checklist.')
  '4.1.19' = @('Draft autosave and restore', 'Retain and restore a temporary tablet draft without treating it as the final controlled record.')
  '4.1.20' = @('Status, preview and submission', 'Show completion status, provide export or print preview, validate final submission and create a read-only controlled record.')
}

foreach ($row in @($traceTable.SelectNodes('./w:tr', $ns))) {
  $cells = @($row.SelectNodes('./w:tc', $ns))
  if ($cells.Count -lt 1) { continue }
  $first = (Node-Text $cells[0] $ns)
  if ($first -match 'URS:\s*(4\.1\.(?:1[1-9]|20))\b') { [void]$traceTable.RemoveChild($row) }
}

$baseTraceRow = $null
foreach ($row in @($traceTable.SelectNodes('./w:tr', $ns))) {
  $cells = @($row.SelectNodes('./w:tc', $ns))
  if ($cells.Count -ge 3 -and (Node-Text $cells[0] $ns) -like '*4.1.10*') { $baseTraceRow = $row; break }
}
if ($null -eq $baseTraceRow) { throw 'FS traceability base row 4.1.10 not found.' }
$insertAfter = $baseTraceRow
foreach ($entry in $trace.GetEnumerator()) {
  $newRow = $baseTraceRow.CloneNode($true)
  $cells = @($newRow.SelectNodes('./w:tc', $ns))
  Set-Cell-Text $cells[0] "URS: $($entry.Key) / DS: 3.1" $xml $ns
  Set-Cell-Text $cells[1] $entry.Value[0] $xml $ns
  Set-Cell-Text $cells[2] $entry.Value[1] $xml $ns
  [void]$insertAfter.ParentNode.InsertAfter($newRow, $insertAfter)
  $insertAfter = $newRow
}

Replace-Paragraph 'The system shall retain audit records for Goods Receiving Checklist completion' 'The system shall retain audit records for checklist creation and final submission; vehicle inspection; quarantine triggering; line-clearance completion and reset; Goods Receiver and Goods-In sign-off; conditional QA disposition; evidence attachment; Verify & Print and LOG events; RPi review; combined PDF and email processing; Product Verification and PCL printing. Records shall include PO or batch reference, action, previous and new status, authenticated user or captured external signatory, role, date/time, comments and outcome where applicable.' $xml $ns
Replace-Paragraph 'The system shall support the expected operational volume of Goods Receiving Checklists' 'The system shall support the expected operational volume of checklist drafts and final records, signatures, supplier documents, photographs, Packing List verification logs, document packs, RPi Task records, combined PDFs, email records, Product Verification records and PCL outputs within approved size and retention limits.' $xml $ns
Replace-Paragraph 'After interruption, the system shall recover the last committed checklist' 'After interruption, the approved tablet shall restore the latest temporary checklist draft, including entered values, signatures and attachment references. Final controlled records and committed workflow states shall recover without duplication or loss. A restored draft shall remain clearly identified as incomplete.' $xml $ns
Replace-Paragraph 'Access shall be role based. Goods-In, RP/RPi and Batch Checker actions' 'Access shall be role based. Goods-In, conditional QA, RP/RPi and Batch Checker actions shall be limited to authorised users. Internal electronic sign-off shall use authenticated identity and date/time. Driver signature shall be identified as externally captured evidence. Final submitted, approved or generated records shall be read-only except through controlled correction.' $xml $ns
Replace-Paragraph 'The system shall clearly identify incomplete Goods Receiving Checklist responses' 'The system shall clearly identify incomplete receipt details, missing signatures, unanswered vehicle checks, failed inspections, missing line clearance, required but incomplete QA disposition, unavailable evidence, draft-save failure, submission failure, unverified Packing List lines, unavailable documents, incomplete RPi actions, PDF or email failure, incomplete Product Verification and unavailable PCL prerequisites. Errors shall not advance workflow status.' $xml $ns
Replace-Paragraph 'The tablet Goods Receiving Checklist, new Packing List controls' 'The tablet Goods Receiving Checklist shall provide readable labels, touch-suitable Yes / No controls, clear signature areas, visible completion and draft status, simple address copying, accessible attachment and camera actions and stable controls without overlap or truncation. Packing List, RPi, Product Verification and PCL screens shall retain their established design conventions.' $xml $ns
Replace-Paragraph 'PO, document, checklist, verification, approval, PDF/email and PCL records' 'PO, delivery, vehicle inspection, signature, line-clearance, evidence, conditional QA, document, verification, approval, PDF/email and PCL records shall remain linked through controlled identifiers and accurately reflect the committed source record.' $xml $ns
Replace-Paragraph 'Goods-In users shall complete the tablet checklist' 'Goods-In users shall complete receipt details, vehicle inspection, evidence, signatures, line clearance, final submission, Verify & Print and document-pack preparation. QA users shall record a disposition only for receipts routed to QA. RP/RPi users shall review and decide the completed pack. Batch Checkers shall complete Product Verification, line clearance and PCL printing. Operations and IT access shall follow approved responsibilities.' $xml $ns
Replace-Paragraph 'Verification testing shall cover every current URS clause' 'Verification testing shall cover every current URS clause and only the changed controls specified in section 3. Testing shall confirm receipt fields; address copying; driver and internal signatures; vehicle checks; automatic quarantine; optional versus required QA disposition; line-clearance recording and reset; attachments and photographs; draft autosave and restore; status and completion indicators; export or print preview; final validation, submission and locking; Verify & Print; LOG; RPi Documents and Task; PDF/email; Product Verification; PCL controls; audit trail and downstream blocking. Regression testing shall confirm unchanged Packing List and Batch Checker fields.' $xml $ns
Replace-Paragraph 'Applicable SOPs, work instructions and training shall describe the tablet Goods Receiving Checklist' 'Applicable SOPs, work instructions and training shall describe tablet receipt entry, vehicle inspection, quarantine criteria, line clearance, driver and internal signatures, conditional QA review, evidence capture, draft recovery, export or print, final submission, Verify & Print, LOG, RPi Documents, RPi Task, PDF/email, Product Verification and PCL printing. Users shall be trained before access is granted.' $xml $ns

Write-Zip-Entry $zip 'word/document.xml' $xml.OuterXml
$settings = Read-Zip-Entry $zip 'word/settings.xml'
$settings = [regex]::Replace($settings, '<w:documentProtection\b[^>]*/>', '')
$settings = [regex]::Replace($settings, '<w:writeProtection\b[^>]*/>', '')
if ($settings -match '<w:updateFields[^>]*/>') {
  $settings = [regex]::Replace($settings, '<w:updateFields[^>]*/>', '<w:updateFields w:val="true"/>')
} else {
  $settings = $settings -replace '</w:settings>', '<w:updateFields w:val="true"/></w:settings>'
}
Write-Zip-Entry $zip 'word/settings.xml' $settings
$zip.Dispose()
$stream.Dispose()

$validationStream = [IO.File]::Open($working, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::ReadWrite)
$validationZip = New-Object IO.Compression.ZipArchive($validationStream, [IO.Compression.ZipArchiveMode]::Read, $false)
[xml]$validationXml = Read-Zip-Entry $validationZip 'word/document.xml'
$validationNs = New-Object Xml.XmlNamespaceManager($validationXml.NameTable)
$validationNs.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')
$validationText = (($validationXml.SelectNodes('//w:t', $validationNs) | ForEach-Object InnerText) -join ' ')
$validationSettings = Read-Zip-Entry $validationZip 'word/settings.xml'
$validationZip.Dispose()
$validationStream.Dispose()

foreach ($id in $trace.Keys) { if ($validationText -notlike "*$id*") { throw "Missing FS traceability ID: $id" } }
foreach ($required in @('QA approval is not mandatory', 'Damage photo capture', 'temporary tablet draft', 'Submit Checklist')) {
  if ($validationText -notlike "*$required*") { throw "Missing FS content: $required" }
}
if ($validationSettings -match '<w:(?:documentProtection|writeProtection)\b') { throw 'FS protection remains enabled.' }

Move-Item -LiteralPath $working -Destination $source -Force
Write-Output "UPDATED=$source"
Write-Output "SHA256=$((Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash)"
