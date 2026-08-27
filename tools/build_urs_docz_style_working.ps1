$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$reference = Join-Path $root 'docz\URS-PLPI BAR.docx'
$workingDir = Join-Path $root '.tmp_urs_docz'
$working = Join-Path $workingDir 'URS-PLPI-BAR-working.docx'
$requirementSource = Join-Path $root 'tools\create_current_urs_stages_4_8.ps1'
if (-not (Test-Path -LiteralPath $workingDir)) { New-Item -ItemType Directory -Path $workingDir -Force | Out-Null }

# Reuse only the original Stage 4-8 requirement arrays from the current project generator.
$sourceLines = Get-Content -LiteralPath $requirementSource
Invoke-Expression ($sourceLines[160..263] -join "`r`n")
# Consolidated original Stage 4-8 requirements matching the compact four-group reference pattern.
$requirements41 = @(
 @('4.1.1','The system shall provide an authorised B&S Batch Add worklist containing only batches that have completed the approved Batch Checker and Product Check Log handoff.'),
 @('4.1.2','The system shall allow the user to search and select eligible records using B&S batch number, product, country, site, status and other available batch criteria.'),
 @('4.1.3','The system shall display the product, pack, reference, expiry, quantity, order, location and route information required to confirm the selected batch.'),
 @('4.1.4','The system shall permit compatible source records to be combined only when the configured product, batch and expiry criteria agree, and shall retain traceability to every source record.'),
 @('4.1.5','The system shall require confirmation of the selected B&S batch before creating one controlled electronic BAR and shall prevent duplicate generation.'),
 @('4.1.6','The system shall provide BAR verification and digital line-clearance checks for batch identity, product details, approved source records and mandatory documentation.'),
 @('4.1.7','BAR sign-off shall capture the authenticated user, role, date and time, lock the completed checks and route the batch to the Printing module.')
)
$requirements42 = @(
 @('4.2.1','The system shall provide one Printing module with controlled options for Label Printing, Leaflet Printing, Carton Issuing and Braille Printing.'),
 @('4.2.2','Each printing queue shall contain only eligible batches and shall support search by B&S batch number and manufacturing lot number.'),
 @('4.2.3','The system shall display the approved product, batch, route, artwork or component reference, required quantity, available quantity and current status for the selected printing activity.'),
 @('4.2.4','The system shall provide controlled access to the applicable BAR, artwork, leaflet, carton, braille, mock-up and continuation-page records.'),
 @('4.2.5','Label Printing shall derive the required label lines from the approved route and shall require completion of each applicable line before Print Done is available.'),
 @('4.2.6','Leaflet Printing shall require an approved master or test leaflet before the full print quantity can be completed.'),
 @('4.2.7','The system shall record actual, partial and additional print quantities; any quantity above the approved requirement shall require a controlled reason.'),
 @('4.2.8','The system shall capture or attach the evidence required for label, leaflet, carton and braille activities before completion.'),
 @('4.2.9','Carton Issuing and Braille Printing shall be available only where required by the approved route and after the preceding printing activity is complete.'),
 @('4.2.10','Printing completion shall capture the authenticated user and date and time, remove the batch from the active queue and route it to the next applicable stage.')
)
$requirements43 = @(
 @('4.3.1','The Leaflet Folding module shall display only batches that have completed all printing and route-specific preparation required before folding.'),
 @('4.3.2','The folding queue shall support search by B&S batch number and manufacturing lot number and shall display the required product, batch, leaflet, quantity and status information.'),
 @('4.3.3','Opening a folding record shall provide controlled access to the applicable BAR, approved leaflet reference and supporting batch documents.'),
 @('4.3.4','The system shall require the operator to confirm that the selected batch and leaflet agree with the approved BAR before completion.'),
 @('4.3.5','The system shall record the folded quantity and shall prevent completion where the leaflet reference, fold format, quantity or batch identity is missing or incorrect.'),
 @('4.3.6','Leaflet Folding completion shall capture the authenticated user, role, date and time and retain the completed record in batch history.'),
 @('4.3.7','After successful completion, the system shall remove the batch from the active folding queue and route it to Pre-Assembly.')
)
$requirements44 = @(
 @('4.4.1','The system shall maintain a chronological audit trail of BAR generation, printing, folding, evidence, quantities, status changes, holds, corrections and reprints.'),
 @('4.4.2','Completed records shall be read-only to ordinary users; authorised corrections shall preserve the original value, changed value, reason, user and date and time.'),
 @('4.4.3','The system shall prevent downstream progression when a mandatory check, approved record, evidence item or preceding workflow stage is incomplete.')
)

$wdStory=6; $wdPageBreak=7; $wdAlignLeft=0; $wdAlignCenter=1; $wdAlignJustify=3
$wdCellAlignVerticalCenter=1; $navy=8388608; $darkBlue=6299648; $bodyBlue=6684672; $tableBlue=6233856

function Font($range,[double]$size,[bool]$bold=$false,[int]$color=$darkBlue) {
  $range.Font.Name='Verdana'; $range.Font.Size=$size
  $range.Font.Bold=$(if($bold){-1}else{0}); $range.Font.Color=$color
}
function ReplaceText($range,[string]$old,[string]$new) {
  $f=$range.Find; $f.ClearFormatting(); $f.Replacement.ClearFormatting()
  [void]$f.Execute($old,$false,$false,$false,$false,$false,$true,1,$false,$new,2)
}
function Spacer($selection,[double]$after=5) {
  $selection.Style='Normal'; $selection.ParagraphFormat.LeftIndent=0
  $selection.ParagraphFormat.SpaceAfter=$after; $selection.TypeParagraph()
}
function Body($selection,[string]$text) {
  $selection.Style='Normal'; Font $selection.Range 11 $false $bodyBlue
  $p=$selection.ParagraphFormat; $p.Alignment=$wdAlignJustify; $p.LeftIndent=63.6
  $p.RightIndent=0; $p.FirstLineIndent=0; $p.SpaceBefore=0.1; $p.SpaceAfter=0; $p.LineSpacing=12.4
  $selection.TypeText($text); $selection.TypeParagraph()
}
function Heading($selection,[string]$text,[int]$level) {
  $selection.Style=$(if($level -eq 1){'Heading 1'}else{'Heading 2'})
  Font $selection.Range 10 $true 6168320
  $p=$selection.ParagraphFormat; $p.Alignment=$wdAlignLeft; $p.RightIndent=0
  $p.SpaceAfter=0; $p.LineSpacing=12; $p.KeepWithNext=-1
  if($level -eq 1){$p.LeftIndent=52.4;$p.FirstLineIndent=-17;$p.SpaceBefore=0}
  else{$p.LeftIndent=0;$p.FirstLineIndent=0;$p.SpaceBefore=8}
  $selection.TypeText($text); $selection.TypeParagraph()
}
function GridTable($doc,$selection,[object[]]$rows,[double[]]$widths,[double]$indent,[bool]$header,[bool]$boldFirst,[double]$size) {
  $t=$doc.Tables.Add($selection.Range,$rows.Count,$rows[0].Count)
  $t.AllowAutoFit=$false; $t.Borders.Enable=$true; $t.Rows.SetLeftIndent($indent,0)
  $t.TopPadding=3;$t.BottomPadding=3;$t.LeftPadding=5;$t.RightPadding=5
  $t.Range.Cells.VerticalAlignment=$wdCellAlignVerticalCenter
  for($c=1;$c -le $widths.Count;$c++){$t.Columns.Item($c).PreferredWidth=$widths[$c-1]}
  for($r=1;$r -le $rows.Count;$r++){for($c=1;$c -le $rows[$r-1].Count;$c++){
    $cell=$t.Cell($r,$c).Range; $cell.Text=[string]$rows[$r-1][$c-1]; $cell.Style='Normal'
    Font $cell $size $false $(if($header -and $r -eq 1){16777215}else{$tableBlue})
    $p=$cell.ParagraphFormat;$p.Alignment=$wdAlignLeft;$p.LeftIndent=0;$p.RightIndent=0
    $p.FirstLineIndent=0;$p.SpaceBefore=0;$p.SpaceAfter=0;$p.LineSpacing=$(if($size -eq 10){12}else{11})
  }}
  if($header){$t.Rows.Item(1).Range.Bold=-1;$t.Rows.Item(1).Shading.BackgroundPatternColor=$navy;$t.Rows.Item(1).HeadingFormat=0}
  if($boldFirst){for($r=$(if($header){2}else{1});$r -le $t.Rows.Count;$r++){$t.Cell($r,1).Range.Bold=-1}}
  $selection.SetRange($t.Range.End,$t.Range.End);$selection.TypeParagraph();return $t
}
function RequirementSection($doc,$selection,[string]$title,[object[]]$items) {
  Heading $selection $title 2; Spacer $selection 2
  $rows=@();$rows+=,@('URS ID','Requirements');foreach($item in $items){$rows+=,$item}
  [void](GridTable $doc $selection $rows @(85,379) 40.5 $true $true 11);Spacer $selection 5
}

Copy-Item -LiteralPath $reference -Destination $working -Force
$word=$null;$doc=$null
try {
  $word=New-Object -ComObject Word.Application;$word.Visible=$false;$word.DisplayAlerts=0
  $doc=$word.Documents.Open($working,$false,$false);$doc.TrackRevisions=$false

  # Replace only the header title slot; retain the source logo, line, address and page fields.
  $header=$doc.Sections.Item(1).Headers.Item(1)
  for($i=1;$i -le $header.Shapes.Count;$i++){$shape=$header.Shapes.Item($i)
    if($shape.Name -eq 'Text Box 2'){$shape.Left=447;$shape.Width=80}
    if($shape.Name -eq 'Text Box 3'){$tr=$shape.TextFrame.TextRange
      $tr.Text="URS PLPI BAR Automation`rPLPI/BAR/URS/01/v1`r";Font $tr 11 $false $darkBlue
      $tr.Paragraphs.Item(1).Range.Bold=-1;$tr.ParagraphFormat.SpaceAfter=0
    }
  }
  'Header updated'

  # Remove reference personnel; retain the cover's signature layout.
  ReplaceText $doc.Tables.Item(1).Range 'Yogeshkumar Vimalan' 'Project Business Analyst'
  ReplaceText $doc.Tables.Item(1).Range 'Business Analyst' 'Document Author'
  ReplaceText $doc.Tables.Item(1).Range 'Project Document Author' 'Project Business Analyst'
  ReplaceText $doc.Tables.Item(1).Range 'Amit Sanandiya' 'Project Reviewer'
  ReplaceText $doc.Tables.Item(1).Range 'Project Manager' 'Project Manager'
  ReplaceText $doc.Tables.Item(1).Range 'Ronex Pereira' 'Printing Manager'
  ReplaceText $doc.Tables.Item(1).Range 'Team Leader' 'Operations Representative'
  ReplaceText $doc.Tables.Item(2).Range 'Rajesh Patel' 'PLPI System Owner'
  ReplaceText $doc.Tables.Item(2).Range 'Team Leader' 'IT Representative'
  ReplaceText $doc.Tables.Item(2).Range 'Operations Representative' 'IT Representative'
  ReplaceText $doc.Tables.Item(3).Range 'Beauty Dadhaniya' 'QA / RP Representative'
  ReplaceText $doc.Tables.Item(3).Range 'Quality Specialist / RP' 'Quality Approver'

  'Cover updated'

  # Rewrite revision history for this project.
  $rev=$doc.Tables.Item(4);$rev.Cell(2,1).Range.Text='1';$rev.Cell(2,2).Range.Text='NA'
  $rev.Cell(2,3).Range.Text='New URS prepared for PLPI Batch Record Automation covering B&S Batch Add, Printing modules and Leaflet Folding.'
  $rev.Cell(2,4).Range.Text='Aug 2026'
  for($c=1;$c -le 4;$c++){$cell=$rev.Cell(2,$c).Range;Font $cell 10 $false 6168320
    $cell.ParagraphFormat.SpaceBefore=4.7;$cell.ParagraphFormat.SpaceAfter=0;$cell.ParagraphFormat.LineSpacing=12
    if($c -ne 3){$cell.ParagraphFormat.Alignment=$wdAlignCenter}
  }

  'Revision updated'

  # Replace the reference contents page in Section 2.
  $section2=$doc.Sections.Item(2);$contentsRange=$section2.Range.Duplicate
  $contentsFind=$contentsRange.Find;$contentsFind.ClearFormatting()
  if(-not $contentsFind.Execute('Contents',$false,$false,$false,$false,$false,$true,1)){throw 'Reference contents slot not found'}
  $contentsStart=$contentsRange.Start;$doc.Range($contentsStart,$section2.Range.End-1).Delete()
  $sel=$word.Selection;$sel.SetRange($contentsStart,$contentsStart)
  $sel.Style='Normal';Font $sel.Range 13 $true 6168320;$p=$sel.ParagraphFormat
  $p.Alignment=$wdAlignLeft;$p.LeftIndent=54.6;$p.FirstLineIndent=0;$p.SpaceBefore=12.1;$p.SpaceAfter=0
  $sel.TypeText('Contents');$sel.TypeParagraph();$tocRange=$sel.Range
  [void]$doc.TablesOfContents.Add($tocRange,$true,1,2)

  # Replace the complete reference project body while retaining Section 3 properties.
  $sec=$doc.Sections.Item(3);$start=$sec.Range.Start;$doc.Range($start,$sec.Range.End-1).Delete()
  'Section 3 cleared'
  $sel.SetRange($start,$start)

  Heading $sel '1. Introduction' 1
  Body $sel 'The PLPI Batch Record Automation project is a phased digital improvement initiative intended to replace paper-dependent activities with controlled electronic workflow records while retaining established GMP checks. This phase begins when an approved batch reaches B&S Batch Add and continues through BAR generation, printing activities and leaflet folding.'
  Spacer $sel 4
  Body $sel 'The change introduces controlled work queues, electronic BAR records, route-based printing actions, quantity and evidence capture, user sign-off, audit history and status-controlled handoffs. Functional screen behaviour and technical implementation will be defined in the Functional Specification and Design Specification after this URS is approved.'
  Spacer $sel 5
  Heading $sel '2. Scope' 1
  Body $sel 'The scope covers B&S Batch Add and BAR generation, BAR verification and digital line clearance, the shared Printer module, Label Printing, Leaflet Printing, Carton Issuing, Braille Printing where required, and Leaflet Folding. It includes queue eligibility, search and record display, approved document and artwork access, quantity controls, test or master review, evidence capture, comments and reasons, electronic sign-off, audit trail, exception handling and downstream handoff.'
  Spacer $sel 5
  Heading $sel '2.1 Out of Scope' 2
  Body $sel 'Goods-In, RP/RPi and Batch Checker processing are outside this phase except for the controlled entry condition into B&S Batch Add. Pre-Assembly, Production Control, assembly-room activities, Post-Assembly QC, Pre-QP and QP Approval are outside scope except for the controlled handoff from Leaflet Folding. Detailed architecture, database design, printer configuration and report layouts will be defined in the FS and DS.'
  Spacer $sel 5
  Heading $sel '3. Abbreviations' 1
  $abbr=@(@('BAR','Batch Assembly Record'),@('B&S Batch','Controlled B&S batch identifier used in PLPI'),@('ECMA','Approved packaging or artwork reference'),@('GMP','Good Manufacturing Practice'),@('PCL','Product Check Log'),@('PLPI','PLPI business application and controlled workflow'),@('QP','Qualified Person'),@('RP / RPi','Responsible Person / Responsible Person import'),@('URS','User Requirement Specification'))
  [void](GridTable $doc $sel $abbr @(110,345) 69.7 $false $true 10);Spacer $sel 5
  Heading $sel '4. User Requirement and Specification' 1
  Body $sel 'The following user requirements define the controls required to implement B&S Batch Add, Printing modules and Leaflet Folding within PLPI.';Spacer $sel 7

  RequirementSection $doc $sel '4.1 B&S Batch Add and BAR Creation' $requirements41
  RequirementSection $doc $sel '4.2 Printing Module' $requirements42
  RequirementSection $doc $sel '4.3 Leaflet Folding' $requirements43
  RequirementSection $doc $sel '4.4 Stage 4-8 Workflow Summary and Controls' $requirements44

  Heading $sel '5. User Access' 1
  Body $sel 'User access shall be role based. B&S Batch Add users shall select eligible source records, generate the BAR, complete the required checks and sign off the release to printing. Printing users shall access only the printing options and batches appropriate to their responsibilities. Leaflet Folding users shall complete assigned folding activities. QA/RP, Operations and authorised IT users shall have review, exception, reporting or administration access according to approved responsibility.';Spacer $sel 5
  Body $sel 'The system shall uniquely identify each user, prevent shared-user attribution and restrict administration, master-data maintenance, correction, reprint and exception-release actions to authorised roles. Access changes and privileged activities shall be auditable.';Spacer $sel 5
  Heading $sel '6. Testing' 1
  Body $sel 'The PLPI system owner shall coordinate verification testing with IT, QA and Operations. Testing shall trace to the approved URS requirements and shall cover role access; queue eligibility and searching; BAR generation and duplicate prevention; line-clearance controls; route-based label, leaflet, carton and braille activities; test and master review; partial and extra quantities; evidence and reasons; user sign-off; status handoff; audit history; holds, corrections and reprints; record locking; technical failure behaviour; and Leaflet Folding completion.';Spacer $sel 5
  Body $sel 'Regression testing shall confirm that the upstream Batch Checker handoff, downstream Pre-Assembly receipt and unchanged PLPI functions continue to operate as approved. Representative operational and quality users shall complete user acceptance testing before release.';Spacer $sel 5
  Heading $sel '7. Documents' 1
  Body $sel 'Applicable SOPs, work instructions, forms, training material, validation records and controlled project documents shall be created or updated to describe BAR generation, verification, printing queues, quantity and evidence controls, route handling, Leaflet Folding, exception management, reprints, record review and electronic sign-off. Superseded paper activities shall be retired through the approved change-control and document-control process.';Spacer $sel 5
  Heading $sel '8. Support' 1
  Body $sel 'IT shall provide controlled support for PLPI configuration, access, printer and device connectivity, document and artwork links, workflow queues, audit records, backup, recovery and incident resolution. Business, QA/RP and Operations stakeholders shall support controlled process use, master-data accuracy, exception decisions and review of future changes.'

  foreach($name in @('TOC 1','TOC 2')){$style=$doc.Styles.Item($name);Font $style 10 $true 6168320
    $style.ParagraphFormat.SpaceAfter=0;$style.ParagraphFormat.LineSpacing=12
  }
  $doc.Styles.Item('TOC 1').ParagraphFormat.LeftIndent=54.6
  $doc.Styles.Item('TOC 2').ParagraphFormat.LeftIndent=72.4
  $doc.TablesOfContents.Item(1).Update();$doc.Fields.Update()|Out-Null;$doc.Repaginate();$doc.Save()
  "Built working copy $working with $($doc.ComputeStatistics(2)) pages."
}
finally {
  if($doc){try{$doc.Close($true)}catch{}};if($word){try{$word.Quit()}catch{}}
  if($doc){try{[void][Runtime.InteropServices.Marshal]::ReleaseComObject($doc)}catch{}}
  if($word){try{[void][Runtime.InteropServices.Marshal]::ReleaseComObject($word)}catch{}}
  [GC]::Collect();[GC]::WaitForPendingFinalizers()
}






