$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$phase2 = Join-Path $root 'Phase 2 Doc'
$phase3 = Join-Path $root 'Phase 3 Doc'
$ursPath = Join-Path $phase3 'URS-PLPI BAR - Pre-Assembly Production Control Assembly and Post-Assembly QC.docx'
$fsRef = Join-Path $phase2 'FS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'
$dsRef = Join-Path $phase2 'DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding - Exact Template.docx'
$fsOut = Join-Path $phase3 'FS-PLPI BAR - Pre-Assembly Production Controller Handheld Assembly and Post-Assembly QC.docx'
$dsOut = Join-Path $phase3 'DS-PLPI BAR - Pre-Assembly Production Controller Handheld Assembly and Post-Assembly QC.docx'
$shots = Join-Path $phase3 'screenshots'
$assemblyShots = Join-Path $root 'assembly_module_document\screenshots'

function Clean([string]$s) { (($s -replace ([char]13),' ' -replace ([char]7),' ') -replace '\s+',' ').Trim() }
function EndRange($doc) { $r=$doc.Content; $r.Collapse(0); return $r }
function SetFont($range,[double]$size=9,[bool]$bold=$false,[int]$color=0) {
  $range.Font.Name='Verdana'; $range.Font.Size=$size; $range.Font.Bold=if($bold){1}else{0}; $range.Font.Color=$color
}
function AddP($doc,[string]$text='',[int]$align=0,[double]$size=9,[bool]$bold=$false,[int]$spaceAfter=5) {
  $p=$doc.Paragraphs.Add((EndRange $doc)); $p.Range.Text=$text; SetFont $p.Range $size $bold 0
  $p.Alignment=$align; $p.Range.ParagraphFormat.SpaceBefore=0; $p.Range.ParagraphFormat.SpaceAfter=$spaceAfter
  $p.Range.InsertParagraphAfter(); return $p
}
function AddH($doc,[string]$text,[int]$level) {
  $p=AddP $doc $text 0 $(if($level -eq 1){14}elseif($level -eq 2){11}else{9}) $true 5
  try { $p.Range.Style = "Heading $level" } catch {}
  $p.Range.ParagraphFormat.OutlineLevel=$level
  $p.Range.Font.Name='Verdana'; $p.Range.Font.Color=$script:blue; $p.Range.Font.Bold=1
  $p.Range.ParagraphFormat.SpaceBefore=8; $p.Range.ParagraphFormat.KeepWithNext=-1
  return $p
}
function Break($doc) { (EndRange $doc).InsertBreak(7) }
function CellText($cell,[string]$text,[bool]$header=$false,[double]$size=8) {
  $cell.Range.Text=$text; SetFont $cell.Range $size $header $(if($header){16777215}else{0})
  $cell.Range.ParagraphFormat.SpaceAfter=0; $cell.Range.ParagraphFormat.SpaceBefore=0; $cell.VerticalAlignment=1
  if($header){$cell.Shading.BackgroundPatternColor=$script:navy}
}
function FormatTable($t,[double]$size=8) {
  $t.Borders.Enable=1; $t.AllowAutoFit=$false; $t.TopPadding=3; $t.BottomPadding=3; $t.LeftPadding=4; $t.RightPadding=4
  foreach($row in $t.Rows){$row.AllowBreakAcrossPages=-1}
  SetFont $t.Range $size $false 0; $t.Range.ParagraphFormat.SpaceAfter=0
}
function AddTable($doc,[string[]]$headers,[object[]]$rows,[double[]]$widths) {
  $t=$doc.Tables.Add((EndRange $doc),$rows.Count+1,$headers.Count); FormatTable $t 8
  $t.Rows(1).HeadingFormat=-1
  for($c=1;$c -le $headers.Count;$c++){CellText $t.Cell(1,$c) $headers[$c-1] $true}
  for($r=0;$r -lt $rows.Count;$r++){for($c=0;$c -lt $headers.Count;$c++){CellText $t.Cell($r+2,$c+1) ([string]$rows[$r][$c]) $false}}
  for($c=1;$c -le $widths.Count;$c++){$t.Columns($c).Width=$widths[$c-1]}
  $after=$doc.Range($t.Range.End,$t.Range.End); $after.InsertParagraphAfter(); return $t
}
function AddBullet($doc,[string]$text) {
  $p=AddP $doc $text 0 9 $false 3; $p.Range.ListFormat.ApplyBulletDefault(); $p.Range.ParagraphFormat.LeftIndent=18; return $p
}
function AddModule($doc,$m) {
  AddH $doc "$($m.Code) $($m.Title)" 2 | Out-Null
  $t=$doc.Tables.Add((EndRange $doc),11,2); FormatTable $t 8
  $t.Columns(1).Width=78; $t.Columns(2).Width=373
  $top=$t.Cell(1,1).Merge($t.Cell(1,2)); CellText $top "$($m.Code)    $($m.Title)" $true 8
  $labels=@('Priority','Purpose','Role','Input','Operations','Use case','Output','DS ID','URS ID','Business Rules')
  for($i=0;$i -lt $labels.Count;$i++){CellText $t.Cell($i+2,1) $labels[$i] $false 8; $t.Cell($i+2,1).Range.Font.Bold=1}
  CellText $t.Cell(2,2) $m.Priority
  CellText $t.Cell(3,2) $m.Purpose
  CellText $t.Cell(4,2) $m.Role
  $ir=$t.Cell(5,2).Range; $ir.End=$ir.End-1
  $nt=$doc.Tables.Add($ir,$m.Inputs.Count+1,3); FormatTable $nt 7.5
  $nt.Rows(1).HeadingFormat=-1
  CellText $nt.Cell(1,1) 'Field / Button / Table Column' $true 7.5
  CellText $nt.Cell(1,2) 'Field type' $true 7.5
  CellText $nt.Cell(1,3) 'Functional description' $true 7.5
  for($i=0;$i -lt $m.Inputs.Count;$i++){CellText $nt.Cell($i+2,1) $m.Inputs[$i][0] $false 7.5;CellText $nt.Cell($i+2,2) $m.Inputs[$i][1] $false 7.5;CellText $nt.Cell($i+2,3) $m.Inputs[$i][2] $false 7.5}
  $nt.Columns(1).Width=105; $nt.Columns(2).Width=92; $nt.Columns(3).Width=176
  CellText $t.Cell(6,2) $m.Operations
  CellText $t.Cell(7,2) $m.UseCase
  CellText $t.Cell(8,2) $m.Output
  CellText $t.Cell(9,2) $m.DS
  CellText $t.Cell(10,2) $m.URS
  CellText $t.Cell(11,2) $m.Rules
  $t.Rows(1).HeadingFormat=-1
  $after=$doc.Range($t.Range.End,$t.Range.End);$after.InsertParagraphAfter()
}
function AddFigure($doc,[string]$path,[string]$caption,[double]$width=430) {
  if(-not(Test-Path -LiteralPath $path)){throw "Missing design image: $path"}
  $r=EndRange $doc; $shape=$doc.InlineShapes.AddPicture($path,$false,$true,$r); $shape.LockAspectRatio=-1; $shape.Width=$width
  $shape.Range.Paragraphs(1).Alignment=1; $shape.Range.Paragraphs(1).Range.ParagraphFormat.SpaceAfter=4; $shape.Range.InsertParagraphAfter()
  $p=AddP $doc $caption 1 8 $false 5; $p.Range.Font.Italic=1; $p.Range.ParagraphFormat.KeepWithNext=-1
}
function ReplaceStories($doc,[string]$oldTitle,[string]$newTitle,[string]$oldId,[string]$newId) {
  foreach($sec in $doc.Sections){foreach($kind in 1,2,3){foreach($story in @($sec.Headers.Item($kind).Range,$sec.Footers.Item($kind).Range)){try{$story.Find.Execute($oldTitle,$false,$false,$false,$false,$false,$true,1,$false,$newTitle,2)|Out-Null;$story.Find.Execute($oldId,$false,$false,$false,$false,$false,$true,1,$false,$newId,2)|Out-Null}catch{}}}}
}
function StartDoc($word,[string]$ref,[string]$out,[string]$oldTitle,[string]$newTitle,[string]$oldId,[string]$newId) {
  Copy-Item -LiteralPath $ref -Destination $out -Force
  $d=$word.Documents.Open($out,$false,$false); try{if($d.ProtectionType-ne-1){$d.Unprotect()}}catch{}
  $d.Content.Delete(); ReplaceStories $d $oldTitle $newTitle $oldId $newId
  $d.PageSetup.PageWidth=595.3;$d.PageSetup.PageHeight=841.9;$d.PageSetup.LeftMargin=72;$d.PageSetup.RightMargin=72;$d.PageSetup.TopMargin=72;$d.PageSetup.BottomMargin=72
  return $d
}
function AddApprovalTable($doc,[bool]$ds=$false) {
  if($ds){
    $t=AddTable $doc @('Role','Name / Function','Signature','Date') @(
      ,@('Author','Yogeshkumar Vimalan - Business Analyst','To be completed during approval','To be completed'),
      ,@('Reviewer','Project Manager','To be completed during approval','To be completed'),
      ,@('Reviewer','Team Leader','To be completed during approval','To be completed'),
      ,@('Approver','Quality Assurance','To be completed during approval','To be completed')
    ) @(70,165,135,80)
  } else {
    $t=AddTable $doc @('Role','Name / Function','Date','Signature') @(
      ,@('Author','Yogeshkumar Vimalan - Business Analyst','',''),
      ,@('Reviewer','Project Manager','',''),
      ,@('Reviewer','Team Leader','',''),
      ,@('Approver','Quality Assurance','','')
    ) @(72,210,75,94)
  }
  return $t
}
function AddRevision($doc,[string]$type) {
  AddH $doc 'Revision History' 1 | Out-Null
  AddTable $doc @('Version','Previous version','Reason for revision','Issued') @(,@('1','NA',"Initial $type for PLPI BAR stages 9-12: Pre-Assembly QC, Production Controller handheld and room allocation, Assembly Room and Post-Assembly QC.",'August 2026')) @(52,88,236,75)|Out-Null
}
function AddTOC($doc) {
  $p=AddP $doc 'TABLE OF CONTENTS' 1 11 $true 8; $p.Range.Font.Color=$script:blue
  $r=EndRange $doc; $toc=$doc.TablesOfContents.Add($r,$true,1,2); $doc.Content.InsertParagraphAfter(); return $toc
}
function AddNfr($doc,[string]$heading='4. Non-Functional Specification') {
  AddH $doc $heading 1|Out-Null
  $items=@(
    @('4.1 Audit Trail','The system shall retain authenticated user, role, date/time, batch, stage, action, result and applicable previous/new values for controlled confirmations, signatures, count changes, corrections, printing and hand-offs.'),
    @('4.2 Availability','The stages shall be available within the approved PLPI operating window. A temporary device, print or service interruption shall not create a false completion.'),
    @('4.3 Capacity Limits','The design shall support the approved operational batch, box, sample, IPC row, photograph and history volumes. Final technical limits require confirmation within the approved PLPI environment.'),
    @('4.4 Performance','Search, screen opening, validation and sign-off shall provide a clear response suitable for operational use. Performance targets shall be confirmed during technical qualification.'),
    @('4.5 Recoverability','Committed signatures and audit events shall remain retained after recoverable interruption. Uncommitted handheld Line Clearance activity shall not be represented as completed.'),
    @('4.6 Security Requirements','Access shall be authenticated and role based. Each role shall see and perform only its permitted stage actions. Signature attribution shall use the authenticated identity.'),
    @('4.7 Error Handling','Validation failures shall identify the unmet condition and retain the user on the current step. Duplicate or stale completion attempts shall be blocked without overwriting the approved record.'),
    @('4.8 Usability','Desktop and handheld screens shall use clear labels, visible status, readable values and action gating consistent with the approved wireframes and supported devices.'),
    @('4.9 Accuracy and Validity','Displayed batch, product, material, quantity, box and room values shall remain associated with the selected controlled record. Numeric and reconciliation rules shall be revalidated at commit.'),
    @('4.10 User Access and Responsibilities','Pre-Assembly QC, Production Controller, Assembly Room and Post-Assembly QC users shall perform only their assigned stage. Support access shall not provide uncontrolled operational sign-off.'),
    @('4.11 Testing and Traceability','Testing shall cover every URS trace, role, positive flow, validation, cancellation, interruption, duplicate prevention, audit event, status transition, print action and downstream hand-off.'),
    @('4.12 Controlled Documents and Training','Applicable SOPs, work instructions, BAR forms, handheld instructions, assembly checks and post-assembly controls shall be approved and trained before release.'),
    @('4.13 Support and Administration','Support shall maintain approved users, roles, devices, printers and configuration and shall retain diagnostic evidence without exposing controlled operational data.')
  )
  foreach($x in $items){AddH $doc $x[0] 2|Out-Null;AddP $doc $x[1]|Out-Null}
}

$modules=@(
  [ordered]@{Code='3.1';Title='Pre-Assembly QC Module';Priority='High';Purpose='To verify the selected batch and applicable printed materials, prepare the assembly reference sample, record controlled counts and release the signed batch to Production Control.';Role='Authorised Pre-Assembly QC User';Inputs=@(
    @('B&S Batch Number / MFG Lot No.','Existing search controls','Search the eligible Pre-Assembly queue.'),@('Pre-Assembly Batch Queue','New controlled queue','Displays batches available for Stage 9 and their current status.'),@('Product Information','Existing data - new controlled display','Displays the selected product, batch, route and approved reference context read-only.'),@('MARKS','Existing value - updated control','Displays the approved value and permits controlled change before sign-off.'),@('Reason','New conditional field','Enabled and mandatory only when MARKS differs from the original value.'),@('Type Of label','New checklist column','Identifies each applicable printed-material or label type.'),@('Reference code','Existing approved data - new display','Displays the approved reference for the checklist row.'),@('Checked & Confirmed','New mandatory checkbox','Records confirmation for every displayed material row.'),@('No of specimen','New numeric field','Records the non-negative specimen quantity.'),@('No Of Leaflet Folds','New numeric field','Records the non-negative number of leaflet folds.'),@('Tamper seal per pack','New numeric field','Records the non-negative tamper-seal quantity per pack.'),@('Mockup','New controlled action','Opens the approved finished-presentation mock-up used to prepare and compare the reference sample.'),@('Comments','New optional text area','Retains relevant verification context.'),@('Checked By / Date-Time','New read-only audit display','Shows the authenticated completion user and date/time.'),@('User Sign Off','New controlled action','Completes Stage 9 only after all applicable gates pass.'),@('Print BAR','Existing controlled action','Opens the current BAR output for the selected batch.'),@('Back / navigation','Existing navigation','Returns without completing an unsigned Pre-Assembly record.')
  );Operations='The user searches the Stage 9 queue, opens an eligible batch, reviews product and route information, confirms every applicable material/reference row, records specimen, leaflet-fold and tamper-seal counts, enters a reason when MARKS is changed and uses the approved mock-up to prepare the assembly reference sample. User Sign Off is enabled only when all applicable checks, counts, change reason and route-specific amendments are complete. Sign-off records the user/date-time, locks the record and makes the batch available to Production Control.';UseCase='A Pre-Assembly QC user verifies the batch and printed materials, prepares the assembly reference sample and signs the batch for Production Control.';Output='Signed Stage 9 record, confirmed material references, controlled counts, reference-sample evidence, audit attribution and Production Control availability.';DS='3.1';URS='4.1.1 - 4.1.12';Rules='Only eligible batches may be opened. All displayed material rows and required counts shall be complete. A changed MARKS value requires a reason. Reboxing amendment sign-offs apply where displayed. Back or interruption before sign-off shall not complete the stage.'},
  [ordered]@{Code='3.2';Title='Production Controller Handheld / Room Allocation Module';Priority='High';Purpose='To perform Stock Take Out, verify the Box ID, complete handheld Line Clearance and allocate the confirmed batch to an Assembly Room.';Role='Authorised Production Controller using a SeUIC handheld';Inputs=@(
    @('GOODS IN','Existing handheld menu','Provides the Stock Take Out route used by the Production Controller.'),@('STOCK TAKE OUT','Existing handheld option - updated process','Opens the Stage 10 stock transfer workflow.'),@('Stock ID','Existing scanner/manual field','Identifies the stock record and populates its details.'),@('Product / Part No. / Batch No.','Existing read-only details','Displays identity values associated with the selected Stock ID.'),@('Goods In Boxes / Qty. / Location','Existing read-only details','Displays stock quantity and location context.'),@('IMP / Contract','Existing read-only details','Displays the applicable import and contract context.'),@('TRANSFER','Existing action - updated process','Opens Box ID verification for the displayed stock record.'),@('Scan Box ID for Verification','New controlled dialog','Requires a scanned or manually entered Box ID before confirmation.'),@('CONFIRM','New dialog action','Validates a non-blank Box ID and opens a new Line Clearance.'),@('CANCEL','New dialog action','Closes verification without completing Line Clearance.'),@('Product / expiry / lot-size check','New mandatory checkbox','Records the label verification outcome.'),@('No. of boxes confirmed','New positive whole-number field','Displays and records the confirmed box count.'),@('Confirm Box Count Change','New controlled dialog','Shows old and new counts; Confirm accepts and Cancel restores the previous count.'),@('Assign Assembly Room','New mandatory selection','Requires Room1 or Room2.'),@('CONFIRMED BY','New gated signature action','Commits the BAR update only when both checks, count and room are valid.'),@('BAR UPDATED / completion details','New read-only result','Displays the completion user, date/time and allocated room and locks the signed form.')
  );Operations='The Production Controller opens GOODS IN and selects STOCK TAKE OUT, scans or enters the Stock ID and reviews the displayed stock details. TRANSFER opens Box ID verification. Blank confirmation is blocked and Cancel returns without completion. A successful Box ID opens Line Clearance. The user confirms the product/expiry/lot-size check and number of boxes, explicitly accepts any box-count change, selects Room1 or Room2 and uses CONFIRMED BY. The system updates the BAR with the stock, batch, product, confirmed boxes, room, checks, user and date/time, displays BAR UPDATED and makes the signed form read-only.';UseCase='A Production Controller uses the authorised handheld to take out the selected stock, complete Line Clearance and allocate the batch to an Assembly Room.';Output='Verified Stock ID and Box ID, signed Line Clearance, confirmed box count, Assembly Room allocation, BAR update and authenticated audit attribution.';DS='3.2';URS='4.2.1 - 4.2.20';Rules='CONFIRMED BY shall remain disabled until both checks, a valid positive whole-number box count, any count-change decision and a room selection are complete. Cancel, Back or power interruption before confirmation shall not complete the record. A completed form shall not prefill a later transfer.'},
  [ordered]@{Code='3.3';Title='Assembly Room Module';Priority='High';Purpose='To execute the controlled assembly record in the allocated room through Initial Checks, Random Sample Check, IPC Checks and Reconciliation & Closure.';Role='Authorised Assembly Room User';Inputs=@(
    @('Assembly Batch Queue','New controlled queue','Displays active and completed batches allocated to the room.'),@('Search / Refresh','New queue controls','Finds eligible batches and refreshes their status.'),@('Check In / Check Out','New controlled actions','Records controlled room attendance where used.'),@('Open batch confirmation','New controlled dialog','Confirms start of an unstarted batch.'),@('Assembly Started By / At','New audit display','Shows the authenticated start user and date/time.'),@('Initial Checks','New controlled page','Records mandatory material, equipment and setup confirmations.'),@('Random Sample Check','New controlled page','Records the required sample observations for each box.'),@('Box selector / box record','New controlled structure','Maintains the sample results against the applicable box.'),@('IPC Checks','New controlled page','Records scheduled or minimum in-process checks.'),@('Additional IPC row','New controlled action','Adds further IPC evidence without changing completed rows.'),@('IPC photograph','New controlled evidence','Attaches the required supporting photograph to the IPC record.'),@('Reconciliation & Closure','New controlled page','Records issued, used, damaged, surplus and leftover reconciliation and closure.'),@('Page signature','New controlled action','Signs the current page after all mandatory checks pass.'),@('Signed By / Date-Time','New read-only audit display','Shows the page-completion user and time.'),@('Page navigation','New controlled tabs','Moves between the four pages without bypassing their gates.'),@('Break / partial completion','New controlled state','Retains committed page signatures and in-progress work.'),@('Final handoff','New gated action','Completes Assembly only after all four pages are signed.'),@('Completed batch history','New read-only state','Retains signed pages and completion attribution.'),@('Print BAR / document access','Existing controlled action','Provides the current controlled batch record.'),@('Back to queue','New navigation','Returns without creating a false page or final completion.')
  );Operations='The Assembly Room user opens an allocated active batch and confirms start, which records the user/date-time. The user completes the four controlled pages. Each page validates its mandatory checks and captures a page signature; the signed page becomes read-only. Random Sample Check is completed for each applicable box. IPC supports required rows, additional checks and photo evidence. Reconciliation & Closure validates material and finished-pack reconciliation. Final handoff is available only after all four pages are signed and records the finish user/date-time before releasing the batch to Post-Assembly QC.';UseCase='An Assembly Room user performs and signs all controlled assembly pages for the allocated batch and hands the completed record to Post-Assembly QC.';Output='Assembly start and finish events, four signed page records, sample and IPC evidence, reconciliation result, immutable completed history and Post-Assembly QC availability.';DS='3.3';URS='4.3.1 - 4.3.28 (approved IDs present in the URS)';Rules='A batch shall be available only in its allocated room. Page signatures require their mandatory data and become read-only. Final completion requires all four pages. Back, break or interruption shall retain committed signatures but shall not create final completion.'},
  [ordered]@{Code='3.4';Title='Post-Assembly QC Module';Priority='High';Purpose='To verify finished packs against the BAR, confirm pack and box quantities, print the Quarantine Label and release the signed batch to Pre-QP.';Role='Authorised Post-Assembly QC User';Inputs=@(
    @('BNS Batch No. / MFG Lot No.','Existing search controls','Search the Stage 12 work queue.'),@('Post-Assembly Queue','New controlled queue','Displays assembly-complete batches as Active or Completed.'),@('Product Information','Existing data - new display','Shows the selected batch and product context read-only.'),@('Total Packs','New positive whole-number field','Records the total finished pack quantity.'),@('Total Boxes','New positive whole-number field','Records the number of finished boxes.'),@('No. of Packs Checked','New positive whole-number field','Records the inspected sample quantity.'),@('Enter / Edit Quantities','New controlled action','Opens per-box allocation when Total Boxes is greater than one.'),@('Box quantity','New positive whole-number field','Records the exact quantity in each box.'),@('Entered Total / Remaining','New calculated indicators','Show allocation progress against Total Packs.'),@('Confirm Box Quantities','New gated action','Saves allocation only when every box is valid and the sum equals Total Packs.'),@('Pack Details Against BAR','New verification table','Displays carton, blister, leaflet and other controlled rows for comparison.'),@('Expiry confirmation','New mandatory checkbox','Records confirmation for every displayed verification row.'),@('Comments','New optional text area','Retains relevant inspection or exception context.'),@('Print Quarantine Label / Test Print','New controlled print actions','Prints the selected-batch label; Test Print does not complete Stage 12.'),@('Quarantine Label status','New read-only status','Displays Printed or Pending.'),@('User Sign Off','New gated action','Records completion and makes the batch available to Pre-QP.'),@('Signed By / Signed At','New read-only audit display','Shows the authenticated completion attribution.'),@('Back to Batch Queue','New navigation','Returns without completing an unsigned record.')
  );Operations='The Post-Assembly QC user opens an assembly-complete batch, records positive whole-number values for Total Packs, Total Boxes and No. of Packs Checked and, when more than one box is present, confirms a positive whole-number quantity for each box whose sum equals Total Packs. The user verifies each Pack Details Against BAR row, records comments where needed and prints the Quarantine Label. User Sign Off is enabled only after quantities, per-box allocation and all displayed pack checks are complete. Sign-off records the user/date-time, marks the queue record Completed and makes the batch available to Pre-QP.';UseCase='A Post-Assembly QC user verifies finished packs and allocation, prints the controlled quarantine label and signs the batch for Pre-QP.';Output='Verified pack details, finished-pack and box quantities, per-box allocation, quarantine-label print state, authenticated sign-off and Pre-QP availability.';DS='3.4';URS='4.4.1 - 4.4.13';Rules='All quantity fields and per-box entries shall be positive whole numbers. Per-box quantities shall total Total Packs. Every displayed BAR comparison row shall be confirmed. Test Print shall not complete the stage. Sign-off shall be single, audited and immutable through the normal workflow.'}
)

$word=$null;$urs=$null;$fs=$null;$ds=$null
try{
  $word=New-Object -ComObject Word.Application;$word.Visible=$false;$word.DisplayAlerts=0
  $urs=$word.Documents.Open($ursPath,$false,$true)
  $reqs=@();foreach($t in $urs.Tables){if($t.Columns.Count-ge2){for($r=2;$r-le$t.Rows.Count;$r++){try{$id=Clean $t.Cell($r,1).Range.Text;$tx=Clean $t.Cell($r,2).Range.Text;if($id-match'^4\.[1-4]\.\d+$'){$reqs+=[pscustomobject]@{Id=$id;Text=$tx}}}catch{}}}}
  $urs.Close($false);$urs=$null;if($reqs.Count-ne69){throw "Expected 69 current URS requirements, found $($reqs.Count)."}

  $fsRefDoc=$word.Documents.Open($fsRef,$false,$true);$script:navy=$fsRefDoc.Tables.Item(4).Cell(1,1).Shading.BackgroundPatternColor;$script:blue=8210719;$fsRefDoc.Close($false)
  $fs=StartDoc $word $fsRef $fsOut 'Functional Specification: PLPI Batch Record Automation Phase 2' 'Functional Specification: PLPI Batch Record Automation Stages 9-12' 'PLPI/BAR/FS/01/v1' 'PLPI/BAR/FS/02/v1'
  AddApprovalTable $fs $false|Out-Null;Break $fs
  AddRevision $fs 'Functional Specification';Break $fs
  $fsToc=AddTOC $fs;Break $fs
  AddH $fs '1. Introduction' 1|Out-Null
  AddP $fs 'PLPI Batch Record Automation stages 9-12 extend the controlled electronic BAR workflow from Pre-Assembly QC through Production Controller handheld Line Clearance and room allocation, Assembly Room execution and Post-Assembly QC.'|Out-Null
  AddH $fs '1.1 Purpose of the document' 2|Out-Null
  AddP $fs 'This document specifies the functional behaviour, controls, validations, outputs, audit events and stage hand-offs required by the current approved URS and final wireframes.'|Out-Null
  AddH $fs '1.2 Scope' 2|Out-Null
  AddP $fs 'The scope comprises Stage 9 Pre-Assembly QC, Stage 10 Production Controller handheld Stock Take Out and room allocation, Stage 11 Assembly Room and Stage 12 Post-Assembly QC. Physical database structures, interfaces and infrastructure not established by the project evidence remain outside this FS.'|Out-Null
  AddH $fs '1.3 Abbreviations' 2|Out-Null
  AddTable $fs @('Term','Definition') @(
    ,@('BAR','Batch Assembly Record'),,@('B&S','B&S Healthcare'),,@('FS','Functional Specification'),,@('DS','Design Specification'),,@('URS','User Requirement Specification'),,@('GMP','Good Manufacturing Practice'),,@('IPC','In-Process Check'),,@('MFG','Manufacturing / manufacturer'),,@('PCL','Product Check Log'),,@('QA / QC','Quality Assurance / Quality Control'),,@('QP','Qualified Person'),,@('IMP','Investigational Medicinal Product')
  ) @(85,366)|Out-Null
  AddH $fs '2. Overall Description' 1|Out-Null
  AddP $fs 'An eligible batch enters Pre-Assembly QC, where materials and reference-sample preparation are confirmed. The Production Controller then uses the authorised SeUIC handheld to perform Stock Take Out, Box ID verification, Line Clearance and Assembly Room allocation. The allocated Assembly Room completes four controlled pages and hands the batch to Post-Assembly QC. Post-Assembly QC confirms finished quantities and pack details, prints the Quarantine Label and releases the signed record to Pre-QP.'|Out-Null
  AddP $fs 'The four stages use role-controlled queues, mandatory action gates, authenticated user/date-time attribution, read-only completed records and explicit downstream hand-offs. Navigation or interruption before the final controlled action does not create completion.'|Out-Null
  AddH $fs '3. Functional Specification' 1|Out-Null
  AddP $fs 'Each module profile below follows the approved Phase 2 functional-specification format. Field classifications describe the Phase 3 change status; they do not imply unverified technical implementation.'|Out-Null
  foreach($m in $modules){AddModule $fs $m}
  AddH $fs '3.5 URS / FS / DS Traceability' 2|Out-Null
  $trace=@();foreach($q in $reqs){$stage=($q.Id-split'\.')[1];$sec="3.$stage";$test=@{'1'='OQ-PA';'2'='OQ-PC';'3'='OQ-AR';'4'='OQ-PQ'}[$stage];$num=[int](($q.Id-split'\.')[2]);$trace+=,@($q.Id,"FS-$($test.Substring(3))-{0:D3}"-f$num,"DS $sec",$q.Text)}
  AddTable $fs @('URS ID','FS ID','DS ID Ref','Function / requirement') $trace @(52,67,65,267)|Out-Null
  AddNfr $fs '4. Non-Functional Specification'
  $fs.Repaginate();$fsToc.Update();foreach($f in $fs.Fields){try{$f.Update()}catch{}};$fs.Save();$fs.Close($false);$fs=$null

  $ds=StartDoc $word $dsRef $dsOut 'Design Specification: PLPI Batch Record Automation Phase 2' 'Design Specification: PLPI Batch Record Automation Stages 9-12' 'PLPI/BAR/DS/01/v1' 'PLPI/BAR/DS/02/v1'
  $p=AddP $ds 'DESIGN SPECIFICATION' 1 15 $true 5;$p.Range.Font.Color=$script:blue
  $p=AddP $ds 'PLPI Batch Record Automation' 1 12 $true 3;$p.Range.Font.Color=$script:blue
  AddP $ds 'Stages 9-12: Pre-Assembly QC, Production Controller Handheld, Assembly Room and Post-Assembly QC' 1 9 $false 8|Out-Null
  AddApprovalTable $ds $true|Out-Null
  AddRevision $ds 'Design Specification';Break $ds
  $dsToc=AddTOC $ds;Break $ds
  AddH $ds '1. Introduction' 1|Out-Null
  AddP $ds 'This Design Specification defines the logical screen, control, state, validation, record, audit and hand-off design for PLPI BAR stages 9-12. The design is based on the current URS, current wireframes and the approved FS.'|Out-Null
  AddH $ds '1.1 Purpose of the Document' 2|Out-Null
  AddP $ds 'The purpose is to provide an implementation-ready logical design without inventing physical database tables, API endpoints, network architecture, device-management technology or other technical components not established by project evidence.'|Out-Null
  AddH $ds '1.2 Scope' 2|Out-Null
  AddP $ds 'The design covers the four role-controlled modules, their queues and screens, the SeUIC handheld workflow, the four Assembly pages, Post-Assembly quantity and label controls, audit attribution, completion locking and downstream status hand-offs.'|Out-Null
  AddH $ds '1.3 Reference Documents' 2|Out-Null
  AddTable $ds @('Reference','Use') @(
    ,@('Current Phase 3 URS','Approved user requirements and numbering.'),,@('Current stages 9-12 wireframes','Visible screen labels, controls and interaction behaviour.'),,@('Approved Phase 3 FS','Functional behaviour and traceability.'),,@('Phase 2 FS and DS','Visual and document-structure reference only; no Phase 2 process content is used.')
  ) @(145,306)|Out-Null
  AddH $ds '1.4 Abbreviations' 2|Out-Null
  AddTable $ds @('Abbreviation','Definition') @(
    ,@('BAR','Batch Assembly Record'),,@('DS','Design Specification'),,@('FS','Functional Specification'),,@('URS','User Requirement Specification'),,@('GMP','Good Manufacturing Practice'),,@('IPC','In-Process Check'),,@('MFG','Manufacturing / manufacturer'),,@('PCL','Product Check Log'),,@('QA / QC','Quality Assurance / Quality Control'),,@('QP','Qualified Person'),,@('IMP','Investigational Medicinal Product')
  ) @(105,346)|Out-Null
  AddH $ds '2. Overall Design' 1|Out-Null
  AddH $ds '2.1 End-to-End Workflow' 2|Out-Null
  AddTable $ds @('Sequence','Stage','Design outcome') @(
    ,@('9','Pre-Assembly QC','Signed material/reference verification and prepared assembly reference sample.'),,@('10','Production Controller Handheld','Verified stock/box, signed Line Clearance and allocated Assembly Room.'),,@('11','Assembly Room','Four signed controlled pages and completed reconciliation.'),,@('12','Post-Assembly QC','Verified finished packs, controlled box allocation, Quarantine Label and Pre-QP hand-off.')
  ) @(55,145,251)|Out-Null
  AddH $ds '2.2 Status and Route Logic' 2|Out-Null
  AddTable $ds @('State','Permitted design behaviour') @(
    ,@('Available','Display only to the authorised role after the preceding stage has completed.'),,@('In Progress','Permit entry and navigation while retaining only committed controlled events.'),,@('Ready for Sign-off','Enable the controlled completion action only after all applicable gates pass.'),,@('Completed','Show attribution read-only, prevent ordinary overwrite and make the batch available to the next stage.'),,@('Cancelled / interrupted','Remain at the last committed non-completed state; do not create completion.')
  ) @(120,331)|Out-Null
  AddH $ds '2.3 Roles and Access' 2|Out-Null
  AddTable $ds @('Role','Permitted module') @(
    ,@('Pre-Assembly QC User','Stage 9 queue, verification, reference-sample controls and sign-off.'),,@('Production Controller','Stage 10 SeUIC handheld Stock Take Out, Line Clearance and room allocation.'),,@('Assembly Room User','Stage 11 allocated-room queue and four controlled Assembly pages.'),,@('Post-Assembly QC User','Stage 12 finished-pack verification, box allocation, Quarantine Label and sign-off.'),,@('Support / Administration','Approved configuration and support only; no uncontrolled operational signature.')
  ) @(145,306)|Out-Null
  AddH $ds '2.4 Common Design Principles' 2|Out-Null
  foreach($x in @('Role access and transaction validation shall be authoritative; hiding a control is not the sole security control.','Every controlled signature records the authenticated user, role, batch, action and date/time.','Completed stage and page records are read-only in the ordinary workflow; corrections require the approved controlled amendment route.','The physical persistence, interface, identity, device and printer implementation shall use approved PLPI services and remains a technical confirmation item where not evidenced.')){AddBullet $ds $x|Out-Null}
  AddH $ds '3. Detailed Design Specification' 1|Out-Null

  AddH $ds '3.1 Pre-Assembly QC Module' 2|Out-Null
  AddFigure $ds (Join-Path $shots '01-pre-assembly-queue.png') 'Figure 1 - Pre-Assembly QC batch queue' 430
  AddP $ds 'Callout 1 - Search criteria. B&S Batch Number and MFG Lot No. filter only the Stage 9 eligible population.'|Out-Null
  AddP $ds 'Callout 2 - Queue rows. Product, batch, route and status remain read-only and row selection opens the controlled Stage 9 record.'|Out-Null
  AddP $ds 'Callout 3 - Status. Completed batches remain visible only in the completed/history state and cannot be signed again.'|Out-Null
  AddFigure $ds (Join-Path $shots '01-pre-assembly-detail.png') 'Figure 2 - Pre-Assembly verification, reference-sample controls and sign-off' 430
  AddP $ds 'Callout 1 - Product and route context. Values are populated from the selected batch and remain read-only.'|Out-Null
  AddP $ds 'Callout 2 - Printed-material checklist. Each displayed Type Of label and Reference code row requires Checked & Confirmed.'|Out-Null
  AddP $ds 'Callout 3 - Counts. No of specimen, No Of Leaflet Folds and Tamper seal per pack accept non-negative whole values.'|Out-Null
  AddP $ds 'Callout 4 - MARKS. If the value differs from its original value, Reason becomes enabled and mandatory.'|Out-Null
  AddP $ds 'Callout 5 - Mockup. The action opens the approved finished-presentation reference used to prepare and compare the assembly reference sample.'|Out-Null
  AddP $ds 'Callout 6 - User Sign Off. The action remains disabled until all displayed material checks, counts, conditional reason and route-specific amendments are complete.'|Out-Null
  AddP $ds 'Detailed design sequence:'|Out-Null
  foreach($x in @('Step 1 - Search and open an eligible Stage 9 batch.','Step 2 - Populate product, route, reference and original MARKS values from the selected record.','Step 3 - Record each displayed material confirmation and the three controlled counts.','Step 4 - Require Reason when MARKS is changed and require both route-amendment initials when the Reboxing form is displayed.','Step 5 - Open the Mockup and prepare/compare the assembly reference sample.','Step 6 - User Sign Off revalidates the gates, records user/date-time, locks the record and publishes the batch to Production Control.')){AddP $ds $x|Out-Null}
  AddP $ds 'Validation and error handling: Missing material checks, counts, change reason or applicable amendment initials keep sign-off disabled and display the unmet condition. Back or interruption leaves the batch unsigned. Entry condition: Stage 9 eligible batch. Exit condition: signed Pre-Assembly record available to Production Control. URS traceability: 4.1.1-4.1.12. FS traceability: 3.1.'|Out-Null

  AddH $ds '3.2 Production Controller Handheld / Room Allocation Module' 2|Out-Null
  AddFigure $ds (Join-Path $shots '02-handheld-menu.png') 'Figure 3 - SeUIC GOODS IN menu used by the Production Controller' 190
  AddP $ds 'Callout 1 - STOCK TAKE OUT. This tile is the Stage 10 entry point. STOCK PUT AWAY, PPM PUT AWAY and PPM TAKE OUT are visible menu context but are not Stage 10 functions.'|Out-Null
  AddFigure $ds (Join-Path $shots '02-handheld-stock-take-out.png') 'Figure 4 - Stock Take Out details and TRANSFER action' 190
  AddP $ds 'Callout 1 - Stock ID. Scanner or manual entry identifies the stock record.'|Out-Null
  AddP $ds 'Callout 2 - Read-only details. Product, Part No., Batch No., Goods In Boxes, Qty., Location, IMP and Contract are populated for the selected Stock ID.'|Out-Null
  AddP $ds 'Callout 3 - TRANSFER. Opens Box ID verification for the currently displayed stock record.'|Out-Null
  AddFigure $ds (Join-Path $shots '02-handheld-box-verification.png') 'Figure 5 - Scan Box ID for Verification dialog' 190
  AddP $ds 'Callout 1 - Box ID. The scanner/manual field is mandatory; blank CONFIRM displays the validation message and does not advance.'|Out-Null
  AddP $ds 'Callout 2 - CONFIRM and CANCEL. CONFIRM validates the Box ID and opens a new Line Clearance; CANCEL closes the dialog without completion.'|Out-Null
  AddFigure $ds (Join-Path $shots '02-handheld-line-clearance.png') 'Figure 6 - Handheld Line Clearance and Assembly Room allocation' 190
  AddP $ds 'Callout 1 - Product-label check. Confirms product name, expiry date and lot size on the box label.'|Out-Null
  AddP $ds 'Callout 2 - Number of boxes. Accepts a positive whole number. A changed value opens Confirm Box Count Change with old/new values; Cancel restores the prior value.'|Out-Null
  AddP $ds 'Callout 3 - Assign Assembly Room. Room1 or Room2 is mandatory.'|Out-Null
  AddP $ds 'Callout 4 - CONFIRMED BY. Enabled only after both checks, a valid count, no pending count-change decision and a room selection. Confirmation updates the BAR and displays BAR UPDATED, user, date/time and room.'|Out-Null
  AddP $ds 'Detailed handheld sequence:'|Out-Null
  foreach($x in @('Step 1 - Open GOODS IN and select STOCK TAKE OUT.','Step 2 - Scan or enter Stock ID and review the associated read-only stock details.','Step 3 - Select TRANSFER, scan/enter Box ID and select CONFIRM; Cancel or blank input does not complete the process.','Step 4 - Complete both Line Clearance checks and confirm the positive whole-number box count.','Step 5 - If the count changes, explicitly Confirm the old/new change or Cancel to restore the prior value.','Step 6 - Select Room1 or Room2 and use CONFIRMED BY. The system commits the BAR update once and locks the completed form.','Step 7 - A new transfer starts with a new blank Line Clearance; the previous signed form remains only in history.')){AddP $ds $x|Out-Null}
  AddP $ds 'Logical committed fields: Stock ID, verified Box ID outcome, batch, product, confirmed box count, allocated room, both check results, authenticated user and date/time. Physical BAR update interface and handheld connectivity are technical confirmation items. Entry condition: Stage 9 complete stock record. Exit condition: signed Line Clearance and allocated Assembly Room. URS traceability: 4.2.1-4.2.20. FS traceability: 3.2.'|Out-Null

  AddH $ds '3.3 Assembly Room Module' 2|Out-Null
  $afigs=@(
    @('01-assembly-batch-queue.png','Figure 7 - Assembly Room batch queue and room-controlled work list','Queue displays only batches allocated to the room; search, refresh, active/completed state and check-in/out are controlled.'),
    @('02-start-batch-confirmation.png','Figure 8 - Assembly start confirmation','Opening an unstarted batch requires confirmation and records the authenticated Assembly Started By and date/time.'),
    @('03-initial-checks.png','Figure 9 - Initial Checks controlled page','Mandatory setup and material confirmations gate the page signature; a signed page becomes read-only.'),
    @('04-random-sample-check.png','Figure 10 - Random Sample Check controlled page','Required observations are retained for each applicable box and all mandatory sample results gate page signature.'),
    @('05-ipc-checks.png','Figure 11 - IPC Checks and supporting evidence','Scheduled/minimum rows are provided, additional rows may be added and required photo evidence remains associated with the IPC event.'),
    @('06-reconciliation-closure.png','Figure 12 - Reconciliation and Closure controlled page','Issued, used, damaged, surplus and leftover values are validated before the final page signature and stage hand-off.')
  )
  foreach($f in $afigs){AddFigure $ds (Join-Path $assemblyShots $f[0]) $f[1] 430;AddP $ds ("Callout - "+$f[2])|Out-Null}
  AddP $ds 'Detailed Assembly sequence:'|Out-Null
  foreach($x in @('Step 1 - Open an allocated active batch and confirm start.','Step 2 - Complete and sign Initial Checks.','Step 3 - Complete the Random Sample Check for every applicable box and sign the page.','Step 4 - Complete the required IPC rows, additional checks and photo evidence and sign the page.','Step 5 - Complete Reconciliation & Closure and sign the page.','Step 6 - After all four page signatures exist, final completion records the finish user/date-time, locks the completed pages and publishes the batch to Post-Assembly QC.')){AddP $ds $x|Out-Null}
  AddP $ds 'Validation and error handling: A page cannot sign with missing mandatory data. A signed page cannot be silently overwritten. Break, Back or interruption retains committed page signatures but does not create final completion. Entry condition: confirmed room allocation. Exit condition: four signed pages and Post-Assembly QC availability. URS traceability: all approved 4.3 requirements. FS traceability: 3.3.'|Out-Null

  AddH $ds '3.4 Post-Assembly QC Module' 2|Out-Null
  AddFigure $ds (Join-Path $shots '04-post-assembly-queue.png') 'Figure 13 - Post-Assembly QC active and completed batch queue' 430
  AddP $ds 'Callout 1 - Search and eligibility. BNS Batch No. and MFG Lot No. filter only assembly-complete Stage 12 batches.'|Out-Null
  AddP $ds 'Callout 2 - Status. Active opens for controlled completion; Completed remains read-only and cannot be signed again.'|Out-Null
  AddFigure $ds (Join-Path $shots '04-post-assembly-detail.png') 'Figure 14 - Production Checking quantities, BAR comparison, label actions and sign-off' 430
  AddP $ds 'Callout 1 - Quantity details. Total Packs, Total Boxes and No. of Packs Checked require positive whole numbers.'|Out-Null
  AddP $ds 'Callout 2 - Per-box allocation. When Total Boxes exceeds one, Enter/Edit Quantities requires one positive whole-number value per box; Entered Total must equal Total Packs and Remaining must be zero.'|Out-Null
  AddP $ds 'Callout 3 - Pack Details Against BAR. Every displayed material/reference row and expiry check is mandatory.'|Out-Null
  AddP $ds 'Callout 4 - Print Quarantine Label and Test Print. Output is associated with the selected batch; Test Print does not satisfy stage completion.'|Out-Null
  AddP $ds 'Callout 5 - User Sign Off. Enabled only after all quantity, allocation and pack-check gates pass; records Signed By/Signed At, marks the queue row Completed and publishes the batch to Pre-QP.'|Out-Null
  AddP $ds 'Detailed Post-Assembly sequence:'|Out-Null
  foreach($x in @('Step 1 - Search and open an assembly-complete batch.','Step 2 - Record Total Packs, Total Boxes and No. of Packs Checked.','Step 3 - When required, enter every box quantity and confirm only after the calculated total matches Total Packs.','Step 4 - Confirm every Pack Details Against BAR row and record comments where required.','Step 5 - Print the Quarantine Label for the selected batch and display the print state.','Step 6 - User Sign Off revalidates all gates, records user/date-time and releases the immutable completed record to Pre-QP.')){AddP $ds $x|Out-Null}
  AddP $ds 'Validation and error handling: Invalid or incomplete quantities, a box-total mismatch, an unchecked BAR row or a stale completion attempt prevents sign-off. Print failure shall not be shown as success. Entry condition: Assembly and reconciliation complete. Exit condition: signed Stage 12 record available to Pre-QP. URS traceability: 4.4.1-4.4.13. FS traceability: 3.4.'|Out-Null

  AddH $ds '3.5 Workflow Status, Corrections and Audit Behaviour' 2|Out-Null
  AddTable $ds @('Design control','Required behaviour') @(
    ,@('Queue eligibility','Revalidate the preceding-stage completion and current role before displaying or committing the work item.'),,@('Signature transaction','Revalidate mandatory conditions, prevent duplicate completion, commit data and audit attribution, lock the record and publish the next-stage status as one controlled outcome.'),,@('Correction','Use the approved controlled amendment route with reason, prior/new value, user and date/time; do not overwrite the original event.'),,@('Interruption','Retain committed signatures and history, discard uncommitted completion and return a clear recoverable state.'),,@('Printing','Associate BAR and Quarantine Label output with the selected batch; failed/cancelled output does not record success.'),,@('Open technical decisions','Physical persistence, identity/session integration, SeUIC connectivity/offline policy, BAR update interface, printer configuration and IPC photo storage require approved technical confirmation.')
  ) @(145,306)|Out-Null
  AddNfr $ds '4. Additional Non-Functional Requirements'
  $ds.Repaginate();$dsToc.Update();foreach($f in $ds.Fields){try{$f.Update()}catch{}};$ds.Save();$ds.Close($false);$ds=$null
  Write-Output "Created $fsOut";Write-Output "Created $dsOut";Write-Output "Requirements traced: $($reqs.Count)"
}finally{
  foreach($d in @($urs,$fs,$ds)){if($d){try{$d.Close($false)}catch{}}}
  if($word){try{$word.Quit()}catch{}}
  [gc]::Collect();[gc]::WaitForPendingFinalizers()
}
