$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$docx = Resolve-Path -LiteralPath "Reference Doc (Templates)\URS-EU BUYING SYSTEM- Oct 2023 - backup before PLPI content.docx"
$tmp = Join-Path $env:TEMP ("urs_patch_" + [guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $tmp | Out-Null
[IO.Compression.ZipFile]::ExtractToDirectory($docx.Path, $tmp)
$docXmlPath = Join-Path $tmp "word\document.xml"
[xml]$xml = Get-Content -LiteralPath $docXmlPath -Raw
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')

function Get-Text($node) {
  (($node.SelectNodes('.//w:t', $ns) | ForEach-Object { $_.InnerText }) -join '').Trim()
}
function Set-Text($node, [string]$text) {
  $texts = @($node.SelectNodes('.//w:t', $ns))
  if($texts.Count -eq 0){ return }
  $texts[0].InnerText = $text
  for($i=1; $i -lt $texts.Count; $i++){ $texts[$i].InnerText = '' }
}
function New-El([string]$name) { return $xml.CreateElement('w', $name, 'http://schemas.openxmlformats.org/wordprocessingml/2006/main') }
function New-Attr([string]$name, [string]$value) { $a=$xml.CreateAttribute('w',$name,'http://schemas.openxmlformats.org/wordprocessingml/2006/main'); $a.Value=$value; return $a }
function New-TextPara([string]$text, [string]$styleVal) {
  $p = New-El 'p'
  if($styleVal){
    $pPr = New-El 'pPr'
    $pStyle = New-El 'pStyle'
    [void]$pStyle.Attributes.Append((New-Attr 'val' $styleVal))
    [void]$pPr.AppendChild($pStyle)
    [void]$p.AppendChild($pPr)
  }
  $r = New-El 'r'
  $t = New-El 't'
  $space = $xml.CreateAttribute('xml','space','http://www.w3.org/XML/1998/namespace')
  $space.Value = 'preserve'
  [void]$t.Attributes.Append($space)
  $t.InnerText = $text
  [void]$r.AppendChild($t)
  [void]$p.AppendChild($r)
  return $p
}
function Set-TableRows($tableIndex, [object[]]$rows) {
  $tbl = @($xml.SelectNodes('//w:tbl', $ns))[$tableIndex-1]
  $existing = @($tbl.SelectNodes('./w:tr', $ns))
  $headerTemplate = $existing[0].CloneNode($true)
  $bodyTemplate = $existing[[Math]::Min(1,$existing.Count-1)].CloneNode($true)
  for($i=$existing.Count-1; $i -ge 0; $i--){ [void]$tbl.RemoveChild($existing[$i]) }
  for($r=0; $r -lt $rows.Count; $r++){
    $newRow = $(if($r -eq 0){ $headerTemplate.CloneNode($true) } else { $bodyTemplate.CloneNode($true) })
    $cells = @($newRow.SelectNodes('./w:tc', $ns))
    for($c=0; $c -lt $cells.Count; $c++){
      $value = ''
      if($c -lt $rows[$r].Count){ $value = [string]$rows[$r][$c] }
      Set-Text $cells[$c] $value
    }
    [void]$tbl.AppendChild($newRow)
  }
}
function Insert-After($refNode, $newNode) { [void]$refNode.ParentNode.InsertAfter($newNode, $refNode) }

# Update key prose and contents entries.
foreach($p in $xml.SelectNodes('//w:p', $ns)){
  $txt = Get-Text $p
  switch($txt){
    'User Access7' { Set-Text $p 'User Access8' }
    'Testing7' { Set-Text $p 'Testing8' }
    'Documents7' { Set-Text $p 'Documents9' }
    'Support7' { Set-Text $p 'Support9' }
    'The PLPI Batch Record Automation project is a phased digital improvement initiative for reducing reliance on printed paper records within the early PLPI batch workflow. The project will move key operational confirmations, document checks, evidence capture, line clearance activities and user sign-offs into PLPI while retaining the existing GMP control intent.' { Set-Text $p 'The PLPI Batch Record Automation project is a phased digital improvement initiative for reducing reliance on printed paper records within the early PLPI batch workflow. The project will move key operational confirmations, document checks, evidence capture, line clearance activities, queue handoffs and user sign-offs into PLPI while retaining the existing GMP control intent.' }
    'The scope of this project is limited to Phase 1 of the PLPI paperless improvement. It covers the digital completion, review and approval of Goods-In / Packing List, RP/RPi Pack Review and Batch Checker / Product Check Log activities. The scope includes mandatory document and evidence checks, user/date/time capture, digital sign-off, line clearance, workflow status visibility and audit trail. BAR Creation, label printing, leaflet printing, carton/braille, leaflet folding, assembly, Post-Assembly QC, Pre-QP and QP Approval are excluded from this phase.' { Set-Text $p 'The scope of this project is limited to Phase 1 of the PLPI paperless improvement. It covers the digital completion, review and approval of Goods-In / Packing List, RP/RPi Pack Review and Batch Checker / Product Check Log activities. The scope includes module login, role-based queues, mandatory document and evidence checks, user/date/time capture, digital sign-off, line clearance, exception handling, workflow status visibility and audit trail. BAR Creation, label printing, leaflet printing, carton/braille, leaflet folding, assembly, Post-Assembly QC, Pre-QP and QP Approval are excluded from this phase.' }
    'The following user requirements have been identified to allow the successful implementation of the changes required for PLPI Software.' { Set-Text $p 'The following user requirements have been identified to allow the successful implementation of the changes required for PLPI Phase 1. The requirements reflect the Goods-In, RP/RPi and Batch Checker workflows shown in the wireframe, including queues, document packs, mandatory checks, electronic sign-off and controlled handoff.' }
    'User access shall be role based. Goods-In users shall complete PO selection, document upload, checklist completion and Goods-In sign-off. RP/RPi users shall review, approve or reject the digital pack. Batch Checkers shall complete product verification, line clearance and Product Check Log generation. QA/RP, Operations and IT users shall have review or administration access according to their responsibility.' { Set-Text $p 'User access shall be role based. Goods-In users shall complete PO selection, packing list preparation, document upload, checklist completion and Goods-In sign-off. RP/RPi users shall search, review, approve or reject the digital pack. Batch Checkers shall search approved packs, complete product verification, line clearance and Product Check Log generation. QA/RP, Operations and IT users shall have review or administration access according to their responsibility. Users shall only see the queue and actions applicable to the module they are authorised to use.' }
    'The PLPI system owner shall be responsible for coordinating required verification testing identified by IT, QA and Operations. Testing shall cover role access, mandatory checks, document upload, digital sign-off, RP/RPi approval, rejection handling, Batch Checker verification, line clearance, Product Check Log generation, status visibility and audit trail.' { Set-Text $p 'The PLPI system owner shall be responsible for coordinating required verification testing identified by IT, QA and Operations. Testing shall cover role access, module login, search and queue behaviour, mandatory checks, document upload, document verification, digital sign-off, RP/RPi approval, rejection handling, Batch Checker verification, line clearance, Product Check Log generation, status visibility, correction workflow and audit trail.' }
    'The revised PLPI workflow, digital checks, document upload expectations, review responsibilities and generated records shall be described in the applicable SOPs, work instructions, training material or controlled project documentation.' { Set-Text $p 'The revised PLPI workflow, digital checks, document upload expectations, review responsibilities, generated records, exception handling and queue handoffs shall be described in the applicable SOPs, work instructions, training material or controlled project documentation.' }
  }
}

# Correct abbreviation detail while retaining existing table style.
$abbrRows = @(
  @('PLPI','Product Label and Pack Information system'),
  @('PCL','Product Check Log'),
  @('PO','Purchase Order'),
  @('BAR','Batch Assembly Record'),
  @('GMP','Good Manufacturing Practice'),
  @('QP','Qualified Person'),
  @('RP / RPi','Responsible Person / Responsible Person import'),
  @('QA','Quality Assurance'),
  @('WSC','Warehouse Stock Control')
)
Set-TableRows 6 $abbrRows

Set-TableRows 7 @(
  @('URS ID','Requirements'),
  @('4.1.1','The system shall allow the Goods-In user to search, select or open the relevant PO within PLPI.'),
  @('4.1.2','The system shall display relevant packing list information required for Goods-In verification, including product, supplier, PO, batch, quantity, box, expiry and delivery details where available.'),
  @('4.1.3','The system shall allow the Goods-In user to create, save and review the packing list before final generation.'),
  @('4.1.4','The system shall lock the generated packing list after completion so that further line edits, split line changes, removal of lines or re-print actions cannot be performed without controlled correction.'),
  @('4.1.5','The system shall provide a digital Goods-In checklist covering PO information, supplier documentation, received quantity, number of boxes, batch number, expiry date and temperature evidence where applicable.'),
  @('4.1.6','The system shall allow required supporting documents to be uploaded against the selected PO or batch, including PO, supplier invoice, supplier declaration, supplier packing list, temperature record, Goods-In checklist and delivery evidence.'),
  @('4.1.7','The system shall show document availability and verification status for each required RP/RPi pack document before Goods-In sign-off is enabled.'),
  @('4.1.8','The system shall allow upload or attachment of evidence, including delivery evidence, checklist evidence and other supporting files required for the Goods-In digital pack.'),
  @('4.1.9','The system shall capture Goods-In user identity, role, date and time when the checklist is completed and digitally signed off.'),
  @('4.1.10','The system shall prevent progression to RP/RPi review until mandatory Goods-In checks, document upload and evidence requirements are completed.'),
  @('4.1.11','The system shall make the generated PO packing list and uploaded Goods-In documents available to the RP/RPi review queue after Goods-In sign-off.'),
  @('4.1.12','The system shall allow a rejected Goods-In pack to be corrected and resubmitted with updated documents or evidence where RP/RPi review identifies missing or incorrect information.')
)

Set-TableRows 8 @(
  @('URS Id','Requirements'),
  @('4.2.1','The system shall provide an RP/RPi review queue containing Goods-In packs that have completed mandatory Goods-In checklist and document upload requirements.'),
  @('4.2.2','The system shall allow the RP/RPi user to search or filter the review queue by PO number and open the applicable Goods-In pack.'),
  @('4.2.3','The system shall allow the RP/RPi user to view the generated PO packing list and all uploaded Goods-In documents in one place.'),
  @('4.2.4','The system shall require RP/RPi review of document completeness, accuracy and suitability for downstream batch review.'),
  @('4.2.5','The system shall require all mandatory RP/RPi checklist answers and document verification checks to be completed before RP/RPi sign-off is enabled.'),
  @('4.2.6','The system shall allow missing, incorrect or incomplete documents to be identified and returned for correction with comments where required.'),
  @('4.2.7','The system shall allow rejection comments to be recorded and returned to the Goods-In/RP pack document workflow for corrected document upload.'),
  @('4.2.8','The system shall reset or clearly flag rejected documents as requiring re-upload or re-verification before the pack can be submitted again.'),
  @('4.2.9','The system shall require RP/RPi digital approval before the pack is released to the Batch Checker queue.'),
  @('4.2.10','The system shall capture RP/RPi reviewer identity, role, decision, comments, date and time for each approval or rejection.'),
  @('4.2.11','The system shall update the PO or batch status to show RP/RPi Approved, Rejected or Checklist Open according to the review outcome.'),
  @('4.2.12','The system shall make the approved RP/RPi pack available to the Batch Checker queue without requiring physical pack handoff.')
)

Set-TableRows 9 @(
  @('URS Id','Requirements'),
  @('4.3.1','The system shall provide a Batch Checker queue containing packs approved by RP/RPi review.'),
  @('4.3.2','The system shall allow Batch Checker users to search and filter approved packs by product, site, PO, status and manufacturer lot where applicable.'),
  @('4.3.3','The system shall display accepted stock information required for batch verification, including product, supplier, batch number, expiry date, quantity, boxes, manufacturer details and document status.'),
  @('4.3.4','The system shall allow the Batch Checker to select the applicable product line and verify details against PLPI/system data, physical sample, invoice, supplier declaration and supporting records.'),
  @('4.3.5','The system shall allow manufacturer details or batch details to be selected or updated where controlled correction is required before verification.'),
  @('4.3.6','The system shall require completion of batch number, expiry, quantity, manufacturer and relevant product verification checks before completion.'),
  @('4.3.7','The system shall prevent batch verification completion until all required Batch Checker verification items are complete.'),
  @('4.3.8','The system shall provide line clearance checks within PLPI and require completion of line clearance before the batch can move forward.'),
  @('4.3.9','The system shall enable Product Check Log generation only after required batch verification and line clearance are completed.'),
  @('4.3.10','The system shall generate a digital Product Check Log record containing relevant batch details, document status, line clearance confirmation, user sign-off, date and time.'),
  @('4.3.11','The system shall capture Batch Checker digital sign-off and move the batch to the next queue only after Product Check Log generation is completed.'),
  @('4.3.12','The system shall record the Batch Checker user, date, time and outcome for verification, line clearance and Product Check Log generation actions.')
)

# Insert 4.4 heading and table before User Access if not already present.
$has44 = $false
foreach($p in $xml.SelectNodes('//w:p', $ns)){ if((Get-Text $p) -like '4.4 Workflow status*'){ $has44=$true } }
if(-not $has44){
  $userAccessPara = $null
  foreach($p in $xml.SelectNodes('//w:p', $ns)){ if((Get-Text $p) -eq 'User Access'){ $userAccessPara=$p; break } }
  if($userAccessPara -eq $null){ throw 'Could not locate User Access insertion point.' }
  $lastReqTable = @($xml.SelectNodes('//w:tbl', $ns))[8]
  $newHeading = New-TextPara '4.4 Workflow status, exception handling and audit trail.' 'Heading2'
  $newTable = $lastReqTable.CloneNode($true)
  [void]$userAccessPara.ParentNode.InsertBefore($newHeading, $userAccessPara)
  [void]$userAccessPara.ParentNode.InsertBefore($newTable, $userAccessPara)
  Set-TableRows 10 @(
    @('URS Id','Requirements'),
    @('4.4.1','The system shall show current workflow status for each PO or batch across Goods-In, RP/RPi Review and Batch Checker / Product Check Log stages.'),
    @('4.4.2','The system shall show whether each stage is pending, in progress, on hold, rejected, approved, ready or complete according to the configured workflow status.'),
    @('4.4.3','The system shall provide clear queue handoff between Goods-In, RP/RPi Review and Batch Checker so that users can identify which batches require action.'),
    @('4.4.4','The system shall hold batches with missing evidence, failed checks or unresolved exceptions until the issue is corrected and reviewed.'),
    @('4.4.5','The system shall capture audit trail entries for document upload, checklist completion, review decision, rejection, correction, approval, line clearance, PCL generation and sign-off.'),
    @('4.4.6','Audit trail entries shall include user, role, date, time, action, status change and comments where applicable.'),
    @('4.4.7','The system shall retain completed digital packs in PLPI so records are available for QA, RP, operational and downstream review without relying on physical handoff.'),
    @('4.4.8','The system shall make completed Goods-In, RP/RPi review and Product Check Log records available to authorised downstream users while keeping BAR Creation and later stages outside Phase 1 scope.'),
    @('4.4.9','The system shall prevent downstream progression where mandatory Phase 1 checks, document verification, line clearance or electronic sign-off are incomplete.'),
    @('4.4.10','The system shall preserve the history of rejection, correction, resubmission and approval actions for audit and investigation purposes.')
  )
}

# Add contents line for 4.4 after the existing 4.3 contents line.
$contents43 = $null
foreach($p in $xml.SelectNodes('//w:p', $ns)){ if((Get-Text $p) -eq '4.3 Batch Checker / Product Check Log and line clearance.'){ $contents43=$p; break } }
if($contents43 -ne $null){
  $next = $contents43.NextSibling
  $already = $false
  foreach($p in $xml.SelectNodes('//w:p', $ns)){ if((Get-Text $p) -eq '4.4 Workflow status, exception handling and audit trail.'){ $already=$true } }
  # If the only 4.4 is the heading, the content line may still be absent; add a contents line near contents by checking before User Access7/8.
  $contentLineExists = $false
  $seenContents = $false
  foreach($p in $xml.SelectNodes('//w:p', $ns)){
    $t=Get-Text $p
    if($t -eq 'Contents'){ $seenContents=$true }
    if($seenContents -and $t -eq '4.4 Workflow status, exception handling and audit trail.' -and $p -ne $contents43){ $contentLineExists=$true; break }
    if($seenContents -and $t -like 'User Access*'){ break }
  }
  if(-not $contentLineExists){ Insert-After $contents43 (New-TextPara '4.4 Workflow status, exception handling and audit trail.' '') }
}

# Save XML and repackage in place.
$settingsPath = Join-Path $tmp 'word\settings.xml'
if(Test-Path -LiteralPath $settingsPath){
  [xml]$settings = Get-Content -LiteralPath $settingsPath -Raw
  $sNs = New-Object System.Xml.XmlNamespaceManager($settings.NameTable)
  $sNs.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
  $upd = $settings.SelectSingleNode('//w:updateFields', $sNs)
  if($upd -eq $null){
    $upd = $settings.CreateElement('w','updateFields','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
    $attr=$settings.CreateAttribute('w','val','http://schemas.openxmlformats.org/wordprocessingml/2006/main'); $attr.Value='true'; [void]$upd.Attributes.Append($attr)
    [void]$settings.DocumentElement.AppendChild($upd)
  } else { $upd.SetAttribute('val','http://schemas.openxmlformats.org/wordprocessingml/2006/main','true') }
  $settings.Save($settingsPath)
}
$xml.Save($docXmlPath)

$backupPath = $docx.Path + '.bak-before-detail-expansion'
if(-not (Test-Path -LiteralPath $backupPath)){ Copy-Item -LiteralPath $docx.Path -Destination $backupPath }
Remove-Item -LiteralPath $docx.Path -Force
[IO.Compression.ZipFile]::CreateFromDirectory($tmp, $docx.Path)
Remove-Item -LiteralPath $tmp -Recurse -Force
Write-Output "UPDATED=$($docx.Path)"
Write-Output "BACKUP=$backupPath"
