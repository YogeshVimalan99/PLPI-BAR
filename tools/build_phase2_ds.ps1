$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation'
$reference = Join-Path $root 'Reference Doc (Templates)\DS - PLPI System  29 Oct 2024 DRAFT FINAL.docx'
$output = Join-Path $root 'Project Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'
$expectedHash = '187AA4BCD809C397D8D2D201650FB23C3C92AED1E7F2B4E7860667796B2FDEA8'
if ((Get-FileHash -LiteralPath $reference -Algorithm SHA256).Hash -ne $expectedHash) { throw 'DS reference changed; re-distillation required.' }

$task = Join-Path $root 'tmp_phase2_ds\build'
$work = Join-Path $task 'package'
$zip = Join-Path $task 'phase2-ds.zip'
if (Test-Path -LiteralPath $work) { Remove-Item -LiteralPath $work -Recurse -Force }
New-Item -ItemType Directory -Path $work -Force | Out-Null
[System.IO.Compression.ZipFile]::ExtractToDirectory($reference, $work)

function X([string]$s) { if ($null -eq $s) { return '' }; return [System.Security.SecurityElement]::Escape($s) }
function Run([string]$text, [bool]$bold=$false, [bool]$italic=$false, [int]$size=20, [string]$color='002060') {
  $b=if($bold){'<w:b/>'}else{''}; $i=if($italic){'<w:i/>'}else{''}
  return "<w:r><w:rPr><w:rFonts w:ascii=`"Verdana`" w:hAnsi=`"Verdana`"/>$b$i<w:color w:val=`"$color`"/><w:sz w:val=`"$size`"/><w:szCs w:val=`"$size`"/></w:rPr><w:t xml:space=`"preserve`">$(X $text)</w:t></w:r>"
}
function P([string]$text, [string]$style='BodyText', [bool]$keep=$false, [string]$align='', [bool]$bold=$false, [bool]$italic=$false, [int]$size=20, [int]$after=110, [int]$before=0) {
  if($style -eq 'Heading1'){ $size=28;$bold=$true;$before=[Math]::Max($before,180);$after=[Math]::Max($after,100);$keep=$true }
  if($style -eq 'Heading2'){ $size=24;$bold=$true;$before=[Math]::Max($before,130);$after=[Math]::Max($after,80);$keep=$true }
  $ps=if($style){"<w:pStyle w:val=`"$style`"/>"}else{''};$kn=if($keep){'<w:keepNext/>'}else{''};$jc=if($align){"<w:jc w:val=`"$align`"/>"}else{''}
  return "<w:p><w:pPr>$ps$kn$jc<w:spacing w:before=`"$before`" w:after=`"$after`"/></w:pPr>$(Run $text $bold $italic $size)</w:p>"
}
function LabelP([string]$label,[string]$text){ return "<w:p><w:pPr><w:pStyle w:val=`"BodyText`"/><w:spacing w:after=`"80`"/></w:pPr>$(Run ($label+': ') $true)$(Run $text)</w:p>" }
function StepP([int]$n,[string]$title,[string]$text){ return "<w:p><w:pPr><w:pStyle w:val=`"BodyText`"/><w:ind w:left=`"300`" w:hanging=`"0`"/><w:spacing w:after=`"70`"/></w:pPr>$(Run ("Step $n - $title. ") $true)$(Run $text)</w:p>" }
function BreakP(){return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'}
function Cell([string]$text,[int]$width,[bool]$header=$false,[int]$fontSize=18,[string]$align='left'){
  $fill=if($header){'002060'}else{'FFFFFF'};$color=if($header){'FFFFFF'}else{'002060'};$paras=@()
  foreach($line in ($text -split "`n")){ $paras += "<w:p><w:pPr><w:jc w:val=`"$align`"/><w:spacing w:before=`"0`" w:after=`"30`"/></w:pPr>$(Run $line $header $false $fontSize $color)</w:p>" }
  return "<w:tc><w:tcPr><w:tcW w:w=`"$width`" w:type=`"dxa`"/><w:vAlign w:val=`"center`"/><w:shd w:fill=`"$fill`"/><w:tcMar><w:top w:w=`"90`" w:type=`"dxa`"/><w:left w:w=`"100`" w:type=`"dxa`"/><w:bottom w:w=`"90`" w:type=`"dxa`"/><w:right w:w=`"100`" w:type=`"dxa`"/></w:tcMar></w:tcPr>$($paras -join '')</w:tc>"
}
function Tbl([object[]]$rows,[int[]]$widths,[int]$fontSize=18){
  $total=($widths|Measure-Object -Sum).Sum;$grid=($widths|ForEach-Object{"<w:gridCol w:w=`"$_`"/>"})-join ''
  $xml="<w:tbl><w:tblPr><w:tblW w:w=`"$total`" w:type=`"dxa`"/><w:tblLayout w:type=`"fixed`"/><w:tblInd w:w=`"0`" w:type=`"dxa`"/><w:tblBorders><w:top w:val=`"single`" w:sz=`"6`" w:color=`"000000`"/><w:left w:val=`"single`" w:sz=`"6`" w:color=`"000000`"/><w:bottom w:val=`"single`" w:sz=`"6`" w:color=`"000000`"/><w:right w:val=`"single`" w:sz=`"6`" w:color=`"000000`"/><w:insideH w:val=`"single`" w:sz=`"4`" w:color=`"000000`"/><w:insideV w:val=`"single`" w:sz=`"4`" w:color=`"000000`"/></w:tblBorders></w:tblPr><w:tblGrid>$grid</w:tblGrid>"
  for($r=0;$r -lt $rows.Count;$r++){ $head=$r -eq 0;$rp=if($head){'<w:trPr><w:tblHeader/><w:cantSplit/></w:trPr>'}else{'<w:trPr><w:cantSplit/></w:trPr>'};$xml+="<w:tr>$rp";$row=$rows[$r];if($row.Count -eq 1 -and $row[0] -is [System.Array]){$row=$row[0]};for($c=0;$c -lt $widths.Count;$c++){ $txt=if($c -lt $row.Count){[string]$row[$c]}else{''};$al=if($c -eq 0 -and $widths.Count -gt 2){'center'}else{'left'};$xml+=Cell $txt $widths[$c] $head $fontSize $al };$xml+='</w:tr>' }
  return $xml+'</w:tbl>'+(P '' '' $false '' $false $false 20 80 0)
}
function TitleP([string]$text,[int]$size){return P $text '' $false 'center' $true $false $size 120 100}
function Toc(){return '<w:p><w:pPr><w:pStyle w:val="Heading1"/><w:spacing w:after="180"/></w:pPr><w:r><w:t>TABLE OF CONTENTS</w:t></w:r></w:p><w:p><w:pPr><w:pStyle w:val="TOC1"/></w:pPr><w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \o "1-2" \h \z \u </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>Update this field to refresh the table of contents.</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>'}

$approval=@(
 ,@('Role','Name / Function','Signature','Date'),
 ,@('Author','Yogeshkumar Vimalan - Business Analyst','To be completed during approval','To be completed'),
 ,@('Reviewer','Amit Sanandiya - Project Manager','To be completed during approval','To be completed'),
 ,@('Reviewer','Juston Rodrigues / Anthony Fernandes - Team Leaders','To be completed during approval','To be completed'),
 ,@('Approver','Beauty Dadhaniya - QA','To be completed during approval','To be completed')
)
$revision=@(
 ,@('Version','Previous version','Reason for revision','Issued'),
 ,@('1','N/A','Initial Design Specification for B&S Batch Add, controlled BAR generation, printing modules and Leaflet Folding.','Aug 2026')
)
$abbr=@(
 ,@('Abbreviation','Definition'),,@('B&S','B&S Batch Add / controlled batch identifier'),,@('BAR','Batch Assembly Record'),,@('DS','Design Specification'),,@('ECMA','Approved product/artwork reference'),,@('FS','Functional Specification'),,@('GMP','Good Manufacturing Practice'),,@('IT','Information Technology'),,@('MFG','Manufacturing / manufacturer'),,@('PCL','Product Check Log'),,@('PDF','Portable Document Format'),,@('PLPI','Parallel Import / PLPI workflow system'),,@('QA','Quality Assurance'),,@('QP','Qualified Person'),,@('RP / RPi','Responsible Person / Responsible Person Import'),,@('URS','User Requirement Specification')
)

$body=@()
$body+=TitleP 'DESIGN SPECIFICATION' 32
$body+=TitleP 'PLPI Batch Record Automation' 28
$body+=P 'Phase 2: B&S Batch Add, Printing Modules and Leaflet Folding' '' $false 'center' $false $false 21 220 0
$body+=Tbl $approval @(1250,3550,2600,1600) 18
$body+=P 'Revision History' 'Heading1'
$body+=Tbl $revision @(900,1600,5000,1500) 18
$body+=BreakP
$body+=Toc
$body+=BreakP

$body+=P '1. Introduction' 'Heading1'
$body+=P 'This Design Specification defines the detailed PLPI design for Phase 2 of the Batch Record Automation project. It converts the approved user and functional requirements into screen, control, validation, workflow, data, audit and routing behaviour for B&S Batch Add, BAR generation, Label Printing, Leaflet Printing, Carton Issuing, Braille Printing and Leaflet Folding.'
$body+=P '1.1 Purpose of the Document' 'Heading2'
$body+=P 'The document provides the implementation-level design required by business, QA, IT, development, testing and operational stakeholders. It identifies each visible control, whether it is Existing, New or Existing with updated behaviour, and defines the enablement, validation, record creation, audit and downstream handoff associated with the control.'
$body+=P '1.2 Scope' 'Heading2'
$body+=P 'The design starts when an eligible source record is available in B&S Batch Add. It covers compatible record selection, one controlled electronic BAR, B&S verification and line clearance, the shared Printer menu and queue design, Label/Leaflet/Carton/Braille processing, the new unified Print pop-up and completion controls, Leaflet Folding and the controlled handoff to Pre-Assembly. The BAR includes downstream placeholders and audit pages, but detailed Pre-Assembly, Production Control, Assembly, Post-Assembly QC, Pre-QP and QP design is outside this phase.'
$body+=P '1.3 Reference Documents' 'Heading2'
$refs=@(,@('Reference','Use'),,@('Final URS - PLPI BAR: B&S Batch Add, Printing and Leaflet Folding','Approved business/user requirements and scope.'),,@('Final FS - PLPI BAR: B&S Batch Add, Printing and Leaflet Folding','Approved functional behaviour and field classification.'),,@('Current project wireframe (wireframe/app.js)','Detailed screen controls, visible values, button states, validation messages, data objects and workflow routing.'),,@('DS-PLPI BAR reference/template','Page system, typography, headings, tables, header/footer and presentation pattern.'))
$body+=Tbl $refs @(3400,5600) 18
$body+=P '1.4 Abbreviations' 'Heading2';$body+=Tbl $abbr @(2200,6800) 18

$body+=P '2. Overall Design' 'Heading1'
$body+=P 'Phase 2 is implemented inside the existing PLPI application. Existing screens and visible fields are replicated where identified; new controlled behaviour is layered onto them without changing the established application navigation. All actions use the authenticated PLPI session and are retained against the B&S batch and controlled BAR.'
$body+=P '2.1 End-to-End Workflow' 'Heading2'
$steps=@(
 @('1','B&S Batch Add','Search eligible source records, select one or compatible matching records and request BAR generation.'),
 @('2','BAR Generation','Confirm generation, create one populated 13-page BAR, retain source-record links and creation attribution.'),
 @('3','B&S Line Clearance','Complete three electronic checks, comments where applicable and authenticated User Sign Off.'),
 @('4','Label Printing','Complete all route-derived label lines and Print Done.'),
 @('5','Leaflet Printing','Where required, open the controlled leaflet PDF, complete the applicable test/master and actual print, then Print Done.'),
 @('6A','Carton Issuing','For Reboxing, confirm required carton issue and any controlled extra cartons.'),
 @('6B','Braille Printing','For applicable Relabelling, complete the braille label and declaration-copy rows.'),
 @('7','Leaflet Folding','After all route-required preparation, confirm folding completion and attribution.'),
 @('8','Pre-Assembly handoff','Remove the completed item from the active folding queue and expose it to the configured downstream stage.')
)
$body+=Tbl (@(,@('Sequence','Stage','Design outcome'))+$steps) @(900,2100,6000) 18
$body+=P '2.2 Route Logic' 'Heading2'
$routes=@(,@('Route / condition','Required sequence after B&S sign-off','Eligibility rule'),,@('Reboxing with leaflet','Label Printing -> Leaflet Printing -> Carton Issuing -> Leaflet Folding','Carton Issuing must be complete before folding.'),,@('Relabelling with leaflet and braille','Label Printing -> Leaflet Printing -> Braille Printing -> Leaflet Folding','Braille Printing must be complete before folding.'),,@('Relabelling with leaflet and no braille','Label Printing -> Leaflet Printing -> Leaflet Folding','No carton or braille stage is inserted.'),,@('No leaflet required','Label Printing -> next configured stage','Leaflet Printing and Leaflet Folding are bypassed according to route configuration.'))
$body+=Tbl $routes @(2500,3800,2700) 18
$body+=P '2.3 Roles and Access' 'Heading2'
$roles=@(,@('Role','Permitted design actions'),,@('B&S Batch Add / BAR Creation User','Search, select, generate/view/print BAR, complete line-clearance checks and sign off.'),,@('Printer User','Open Printer menu and eligible queues; access approved documents; perform Label, Leaflet, Carton and Braille activities assigned to the role.'),,@('Leaflet Folding User','Search eligible batches, review product/document context and confirm folding completion.'),,@('QA / RP / Operations / IT','Controlled review, exception, reporting or support access as authorised; no operational completion unless the assigned role permits it.'))
$body+=Tbl $roles @(2700,6300) 18
$body+=P '2.4 Common Design Principles' 'Heading2'
$body+=LabelP 'Identity' 'B&S Batch Number is the primary workflow key. MFG Lot No., source record IDs, product identifiers and document references remain linked.'
$body+=LabelP 'Control classification' 'Existing means replicated current-system presentation. New means new electronic control/data. Existing - updated means replicated presentation with new validation, audit or routing.'
$body+=LabelP 'Status model' 'Active identifies untouched eligible work; In Progress identifies saved or partially completed work; Done/Completed identifies a locked stage; downstream statuses show the current route position.'
$body+=LabelP 'Attribution' 'All controlled generation, document print, print run, line completion, Print Done and folding completion events retain authenticated user and date/time.'
$body+=LabelP 'Data integrity' 'A completed event is appended to history; later extra prints or corrections do not overwrite the original completion record.'

$body+=BreakP
$body+=P '3. Detailed Design Specification' 'Heading1'
$body+=P '3.1 B&S Batch Add and BAR Creation' 'Heading2'
$body+=P 'The existing BNS Batch Creation screen is retained as the entry point. The design adds controlled selection, compatibility checking, BAR confirmation, BAR record creation, electronic line clearance and authenticated release to Label Printing.'
$body+=P '3.1.1 Search and Result Grid' 'Heading2'
$bnsControls=@(
 @('Country','Existing filter','Selection list','Filters by country; blank/All does not restrict the results.'),
 @('Site','Existing filter','Selection list','Filters by processing site; blank/All does not restrict the results.'),
 @('Category','Existing filter','Selection list','Values include Reboxing and Relabelling.'),
 @('Stock','Existing filter','Selection list','Retained current-system stock criterion.'),
 @('Status','Existing - updated','Selection list','Values: All, Not Printed BAR, Printed BAR.'),
 @('Batch_No','Existing filter','Text input','Locates a B&S batch by entered value.'),
 @('Search','Existing button','Button','Applies criteria and refreshes the grid.'),
 @('Select','Existing - updated','Checkbox','Adds/removes a source record from the proposed BAR; disabled for a completed/generated row.'),
 @('Generate BAR','Existing - updated','Button','Requires at least one eligible selection; opens the new confirmation control.'),
 @('Print Batch Details','Existing button','Button','Requires a valid selection; opens the Batch Assembly Record details and print action.'),
 @('Total BNS Batch','Existing indicator','Calculated display','Shows result/context B&S batch total.'),
 @('Total Composite Batch','Existing indicator','Calculated display','Shows composite batch total.'),
 @('Total Packs','Existing indicator','Calculated display','Shows pack total.'),
 @('Not Printed BAR','Existing indicator/button','Status display','Identifies items without a generated BAR.')
)
$body+=Tbl (@(,@('Control','Classification','Design type','Detailed behaviour'))+$bnsControls) @(1750,1750,1450,4050) 17
$bnsCols=@('PRODUCT_STATUS','SITE','COUNTRY','PART_NO','FOREIGN_NAME','ECMA','STRENGTH','PACK_SIZE','BATCH_NO','EXPIRY_DATE','QUANTITY','IMP','INVOICE_NO','DESCRIPTION','WAREHOUSE_LO','CONTRACT_SUPP','PL','PRODUCT_ID','MFG_ID','ACTION_COUNT','OBJID','SPL_FLAG','CATEGORY','STOCK','REGULATORY','WFIMPLEMENTED','LEGAL_CATEGORY')
$colRows=@();foreach($c in $bnsCols){$source=if($c -eq 'PRODUCT_STATUS'){'Displays Completed after BAR generation; otherwise source status.'}elseif($c -eq 'BATCH_NO'){'Controlled B&S batch identifier and primary workflow key.'}elseif($c -eq 'QUANTITY'){'Source quantity; summed when compatible rows are combined.'}elseif($c -eq 'CATEGORY'){'Route driver: Reboxing or Relabelling.'}elseif($c -eq 'SPL_FLAG'){'Retained flag; may indicate braille requirement.'}else{'Existing source-record value displayed without edit.'};$colRows+=,@($c,'Existing grid column',$source)}
$body+=Tbl (@(,@('Grid column','Classification','Design behaviour'))+$colRows) @(2600,2100,4300) 17

$body+=P '3.1.2 Selection, Combination and Confirmation' 'Heading2'
$body+=StepP 1 'Add or remove selection' 'Selecting a row stores its stable source record identifier. Clearing the checkbox removes it and displays Batch removed from the BAR combination.'
$body+=StepP 2 'Compatibility validation' 'For multiple rows, PART_NO/product name, BATCH_NO and EXPIRY_DATE must match. A mismatch clears the attempted selection and displays Batches Cannot Be Combined / Selected batch details do not match.'
$body+=StepP 3 'Related-batch warning' 'Where configured, a warning table displays Order No and Quantity. Yes accepts the relationship; No cancels the combination without generating a BAR.'
$body+=StepP 4 'Generation confirmation' 'A single selection opens Generate BAR Confirmation. Multiple selections open Combined BAR Confirmation and show the selected row count, Batch_No and summed total quantity.'
$body+=StepP 5 'Confirmation outcome' 'Confirm creates one BAR and closes the dialog. Cancel/X closes the dialog and leaves the source rows available without a generated record.'
$comb=@(,@('Rule','System design'),,@('Minimum selection','At least one non-completed eligible source row.'),,@('Compatible combination','Same PART_NO/product name, BATCH_NO and EXPIRY_DATE.'),,@('Combined quantity','Sum of selected source quantities; applied to label/leaflet and applicable carton/braille required quantities.'),,@('Source traceability','Retain record ID, invoice, warehouse and quantity for every selected source record.'),,@('Duplicate prevention','A completed/generated row is disabled; only one active controlled BAR may exist for the batch.'),,@('Confirmation audit','Generated By and Generated At come from the authenticated session and system timestamp.'))
$body+=Tbl $comb @(2600,6400) 18

$body+=P '3.1.3 Generated BAR Design' 'Heading2'
$barPages=@(
 @('1','BAR cover','Product Name, Foreign Name, Strength, Pack Size, ECMA, PL No., Units per pack, Country of origin, Product Introduced, Leaflet Date, Date Revised, B&S Batch Number, Expiry Date, variation information and generation attribution.'),
 @('2','B&S Batch Add - Line Clearance','Three electronic line-clearance checks, comments, completed by and date/time.'),
 @('3','Label Printing','Line completions, required/actual/extra print actions, user/date-time and details.'),
 @('4','Leaflet Printing','Leaflet document/print and completion record.'),
 @('5','Label Evidence Attachment','Test print, first production label, last production label and additional/extra evidence spaces.'),
 @('6','Braille Printing','Braille label/declaration actions and completion.'),
 @('7','Leaflet Folding','Folding quantity, status and attribution.'),
 @('8','Carton Issuing','Required and extra carton issue records.'),
 @('9','Pre-Assembly','Controlled downstream placeholder/audit presentation.'),
 @('10','Production Control','Controlled downstream placeholder/audit presentation.'),
 @('11','Assembly','Controlled downstream placeholder/audit presentation.'),
 @('12','Post-Assembly QC','Controlled downstream placeholder/audit presentation.'),
 @('13','BAR Audit Trail','Action, user, date/time and event details for the batch.')
)
$body+=Tbl (@(,@('Page','Title','Content design'))+$barPages) @(800,2300,5900) 17
$body+=LabelP 'Reboxing attachment' 'When a completed Change of Pack Size record exists, it is appended after the controlled 13 BAR pages as an unnumbered attachment.'
$body+=LabelP 'View Generated BAR' 'Available after generation. Opens the populated BAR in view-only mode and displays the number of B&S checks captured.'
$body+=LabelP 'Print Generated BAR' 'Available from the controlled document area. Opens the populated BAR with a print action and records user/date-time; printing does not change workflow completion.'
$body+=LabelP 'Continuation pages' 'Label Evidence Attachment, BAR Continuation, Cold Chain Continuation and route-specific Change of Pack Size pages use the selected batch/product header and are audited when printed.'

$body+=P '3.1.4 Line Clearance and Sign-off' 'Heading2'
$checks=@(,@('Control','Design'),,@('PCL completeness/invoice check','Mandatory checkbox: PCL checked for completeness and invoice attached.'),,@('Batch/expiry check','Mandatory checkbox: batch number and expiry date are correct.'),,@('Product/pack/reference check','Mandatory checkbox: product name, strength, pack size and ECMA are correct.'),,@('Comments','Editable until sign-off; retained with the B&S line-clearance record.'),,@('BAR Created By','Read-only authenticated creator.'),,@('Created Date / Time','Read-only BAR generation timestamp.'),,@('View Generated BAR','Opens current controlled BAR; does not complete the stage.'),,@('User Sign Off','Disabled until all three checks are selected. On success records user/date-time, locks checks/comments, removes the batch from active B&S Batch Add and adds it to Label Printing.'))
$body+=Tbl $checks @(2600,6400) 18

$body+=P '3.2 Printing Module - Common Design' 'Heading2'
$body+=P 'Label, Leaflet and Braille Printing use the same menu, queue, product/document context, unified Print pop-up, audit and completion principles. Carton Issuing shares menu, queue, product/document and audit presentation but records an issue rather than a printer run.'
$menu=@(,@('Control','Classification','Detailed design'),,@('Printer Menu','Existing - updated','Common entry screen for the four controlled options.'),,@('Label Printing','Existing tile/button','Opens Label Printing List.'),,@('Leaflet Printing','Existing tile/button','Opens Leaflet Printing List.'),,@('Carton Issuing','Existing tile/button','Opens Carton Issuing List.'),,@('Braille Printing','Existing tile/button','Opens Braille Printing List.'),,@('Active count','New calculated indicator','Count of untouched eligible records for the option.'),,@('In Progress count','New calculated indicator','Count with saved/printed/partially completed activity.'),,@('Back to Batch Queue','Existing common button','Returns to the active module list without completing or discarding saved records.'))
$body+=Tbl $menu @(2200,2200,4600) 18
$queue=@(,@('Queue control/column','Classification','Detailed design'),,@('B&S Batch Number','Existing field/column','Search input and primary displayed batch identifier.'),,@('MFG Lot No.','Existing field/column','Search input and manufacturing-lot display.'),,@('Search','Existing button','Applies both search inputs to the selected queue.'),,@('Product Name','Existing column','Approved product name.'),,@('Strength','Existing column','Product strength.'),,@('Pack Size','Existing column','Approved pack size.'),,@('ECMA','Existing column','Approved reference.'),,@('Expiry Date','Existing column','Batch expiry.'),,@('Required Qty','Existing data, module-specific','Label, leaflet, carton or braille required quantity according to queue.'),,@('Status','New calculated column','Active or In Progress in the module; the Label list may also show the downstream workflow position after completion.'),,@('Select queue row','Existing - updated action','Click/open the applicable detail screen; only eligible route-controlled records are listed.'))
$body+=Tbl $queue @(2400,2300,4300) 18
$productInfo=@(,@('Product information field','Classification','Source / behaviour'),,@('Product Name / Foreign Name','Existing common fields','Read-only approved product master data.'),,@('Strength / Country of origin','Existing common fields','Read-only product master data.'),,@('Pack Size / Units per pack','Existing common fields','Read-only packaging configuration.'),,@('B&S Batch Number / MFG Lot No.','Existing common fields','Read-only controlled batch identifiers.'),,@('ECMA / PL No.','Existing common fields','Read-only approved references.'),,@('Expiry Date / Quantity','Existing common fields','Read-only batch data.'),,@('Product Introduced','Existing common field','Read-only product introduction value/date.'),,@('Leaflet Date / Date Revised','Existing common fields','Read-only approved leaflet/version dates.'))
$body+=Tbl $productInfo @(2700,2300,4000) 18
$documents=@(,@('Document button','Classification','Detailed design'),,@('View Carton Artwork','Existing common button','Opens approved carton artwork in view-only preview.'),,@('View Peel Artwork','Existing common button','Opens approved peel/label artwork.'),,@('View Braille Artwork','Existing common button','Opens approved braille artwork/declaration.'),,@('View Mock-up','Existing common button','Opens approved product mock-up.'),,@('View BAR','Existing - updated access','Opens the controlled BAR for the selected batch.'),,@('Print Generated BAR','New common button','Opens populated BAR with audited print action.'),,@('Print Label Attachment','New common button','Prints additional label-evidence continuation page.'),,@('Print BAR Continuation','New common button','Prints general BAR continuation page.'),,@('Print Cold-chain Page','New common button','Prints temperature/location/checker continuation table.'),,@('Print Change of Pack Size','New route-specific button','Visible/available for Reboxing with the completed form.'))
$body+=Tbl $documents @(2500,2200,4300) 18

$body+=P '3.2.1 Unified Print Pop-up - Entire Component Is New' 'Heading2'
$body+=P 'The module-level Print button is an Existing replicated button. The complete pop-up opened by that button, including every field, selection and dialog action below, is New functionality. Existing/New is communicated by text only; all rows use the same font and size.'
$popup=@(
 @('Print pop-up','New pop-up','Opens only for Label, Leaflet or Braille and the selected component line.'),
 @('Quantity Needed','New read-only field','Displays the approved required quantity for the selected line.'),
 @('Quantity to Print','New entry field','Blank on open; numeric; minimum 1; must be a positive whole number.'),
 @('Category','New controlled selection','Mandatory. Placeholder Select category; values Test Print, Actually Print and Extra Print.'),
 @('Reason','New conditional selection','Disabled by default. Enabled and mandatory only for Extra Print. Default display Not required.'),
 @('Reason values','New controlled values','Print damage; Line setup waste; Reconciliation correction; Printing alignment check; Supervisor approved extra.'),
 @('Print (dialog)','New controlled button','Disabled until the required inputs are valid; executes the selected category behaviour.'),
 @('Close / X','New dialog action','Closes the pop-up without executing or changing the line.'),
 @('Preview area','New preview presentation','Label/Braille show component, product, strength, pack size, batch and expiry; Leaflet opens the controlled leaflet PDF after submission.')
)
$body+=Tbl (@(,@('Control','Classification','Detailed design'))+$popup) @(2300,2200,4500) 18
$printRules=@(
 @('Validation','No category','Message: Select a print category before printing. No record is created.'),
 @('Validation','Quantity not a positive integer','Message: Enter a whole print quantity greater than zero.'),
 @('Validation','Extra Print without reason','Message: Select a reason before printing extra copies.'),
 @('Test Print','Label/Braille','Record test user/date/time/quantity. Do not reduce required quantity and do not add a normal audit event.'),
 @('Test Print','Leaflet','Record test details and open the test-category leaflet PDF; Test Print is excluded from the BAR audit table.'),
 @('Actually Print','Label/Braille','Apply to remaining required quantity. Quantity cannot exceed the remaining required quantity. Record print run and update remaining amount.'),
 @('Actually Print','Leaflet','Record actual-print item, PDF-open state and print-run details; this enables Mark as Done.'),
 @('Extra Print','All shared print modules','Accumulate extra quantity separately, require a controlled reason and create an attributable audit event.'),
 @('Post-completion print','All shared print modules','Print categories remain available, but subsequent prints do not replace or alter the completed Batch Record Summary.'),
 @('Line Completion','Label/Braille','Mark as Done enables when remaining required quantity is zero.'),
 @('Line Completion','Leaflet','Mark as Done enables only after an Actually Print event.'),
 @('Print Done','Module','Enabled only when every mandatory displayed component line is Done; records final user/date-time and routes the batch.')
)
$body+=Tbl (@(,@('Design area','Condition','System behaviour'))+$printRules) @(1800,2500,4700) 17

$body+=P '3.2.2 Common Print Data and Audit Design' 'Heading2'
$printData=@(,@('Data element','Design'),,@('Batch number / module / item','Identifies the controlled record and component line.'),,@('Quantity needed','Required quantity at the time of the action.'),,@('Quantity to print','Positive whole quantity submitted in the dialog.'),,@('Category','Test Print, Actually Print or Extra Print.'),,@('Reason','Not required except controlled value for Extra Print.'),,@('Print totals / remaining','Required actual quantities are accumulated by item; remaining quantity is derived and never negative.'),,@('Test-print map','Stores item, quantity, user and date/time separately from required production totals.'),,@('Extra-print runs','Append-only list by item with quantity, reason, user and date/time.'),,@('Item completion','Status, completing user and date/time for each line.'),,@('Finalisation','Finalized flag, finalized by and finalized at; does not remove prior run details.'),,@('Batch summary entries','Non-test actions occurring before line completion are presented on the controlled BAR summary.'),,@('Printer audit trail','Action type, batch, user, date/time and human-readable details.'))
$body+=Tbl $printData @(2700,6300) 18

$body+=P '3.3 Label Printing Module' 'Heading2'
$labelEligibility=@(,@('Design item','Detailed design'),,@('Queue eligibility','Generated BAR exists and B&S User Sign Off is complete; completed records remain available only according to downstream/status presentation.'),,@('Reboxing rows','Carton Label; End of Pack Label; Security Seals.'),,@('Relabelling rows','Blister / Pack Label; Obscure Label.'),,@('Row columns','Label, Reference, Size, Quantity, Location, In Hand Quantity, Print, Line Completion, Completed By / Date.'),,@('Reference/size/quantity','Derived from approved product/route data. Security Seals use the controlled seal reference and quantity.'),,@('Print button','Existing replicated button opening the new common Print pop-up.'),,@('Line completion','Mark as Done is disabled while required quantity remains; Done locks the normal completion and displays attribution.'),,@('Print Done','Enabled after every displayed route-derived row is Done.'),,@('Output routing','Leaflet-required batches move to Leaflet Printing; otherwise the next configured stage.'))
$body+=Tbl $labelEligibility @(2700,6300) 18
$body+=P '3.3.1 Reboxing Change of Pack Size Gate' 'Heading2'
$rebox=@(,@('Control / section','Detailed design'),,@('Change of Pack Size form','Existing form represented electronically for Reboxing only.'),,@('Received As','Records received packaging configuration and electronic sign-off.'),,@('Assembled As','Records target configuration and electronic sign-off.'),,@('Print gate','All label Print buttons remain disabled and the gate message is displayed until both sections are complete and signed.'),,@('Locking','Once label printing has started, the supporting form is treated as the controlled source and cannot be silently altered.'),,@('BAR attachment','Completed form is appended after BAR page 13 as an unnumbered route-specific attachment.'))
$body+=Tbl $rebox @(2700,6300) 18

$body+=P '3.4 Leaflet Printing Module' 'Heading2'
$leaflet=@(,@('Design item','Detailed design'),,@('Queue eligibility','Label Printing completed and the product route requires a leaflet.'),,@('Table columns','Leaflet, Reference, Size, Quantity, Location, Print, Line Completion, Completed By / Date.'),,@('Print action','Opens the common pop-up. After submission, the controlled leaflet PDF opens with category, quantity and reason.'),,@('PDF audit','The approved PDF opening is attributable. Non-test print actions are added to BAR/audit history before completion.'),,@('Test/master control','Required test/master review is completed before controlled completion; rejected evidence remains traceable as exception evidence.'),,@('Mark as Done','Disabled until an Actually Print event exists for the line.'),,@('Extra Print','Positive whole quantity and controlled reason; accumulated separately.'),,@('Print Done','Requires all leaflet rows Done.'),,@('Routing - Reboxing','Move to Carton Issuing.'),,@('Routing - Relabelling with braille','Move to Braille Printing.'),,@('Routing - other leaflet route','Move to Leaflet Folding or configured next stage.'))
$body+=Tbl $leaflet @(2800,6200) 18

$body+=P '3.5 Carton Issuing Module' 'Heading2'
$carton=@(,@('Control / column','Classification','Detailed design'),,@('Carton Issuing List','Existing - updated eligibility','Only Reboxing batches that completed Leaflet Printing.'),,@('Carton Reference','Existing field','ECMA/part number or approved carton reference.'),,@('Required Qty','Existing calculated field','Required carton quantity for the batch.'),,@('On Hand Quantity','Existing field','Available carton stock.'),,@('Issue Extra','Existing - updated button','Disabled until required issue is confirmed. Opens extra issue dialog.'),,@('Extra quantity','Controlled entry','Positive whole number.'),,@('Extra reason','Controlled selection','Mandatory for extra issue; values include Carton damage and other configured issue reasons.'),,@('Location Number','Existing field','Warehouse/location used for the issue.'),,@('Confirmed By','New audit field','Pending until Done; then authenticated user and date/time.'),,@('Done','Existing - updated button','Confirms the normal required issue once and becomes disabled.'),,@('Completion count','New indicator','0/1 before confirmation; 1/1 after confirmation.'),,@('Output','BAR/audit update and Carton prerequisite satisfied for Leaflet Folding.'))
$body+=Tbl $carton @(2200,2200,4600) 18

$body+=P '3.6 Braille Printing Module' 'Heading2'
$braille=@(,@('Design item','Detailed design'),,@('Queue eligibility','Relabelling, Leaflet Printing completed and braille-required flag is true.'),,@('Mandatory rows','Braille Label and Braille Declaration Copy where configured.'),,@('Braille Label source','Reference ECMA; size pack size; quantity approved braille quantity.'),,@('Declaration Copy source','Reference PL No.; size Master copy; quantity 1.'),,@('Table columns','Braille Label, Reference, Size, Quantity, Location, In Hand Quantity, Print, Line Completion, Completed By / Date.'),,@('Print behaviour','Common Test/Actually/Extra Print pop-up and validation.'),,@('Mark as Done','Enabled when remaining required quantity for the row is zero.'),,@('Print Done','Requires every displayed braille/declaration row Done.'),,@('Output','BAR/audit update and Braille prerequisite satisfied for Leaflet Folding.'))
$body+=Tbl $braille @(2800,6200) 18

$body+=P '3.7 Leaflet Folding Module' 'Heading2'
$foldQueue=@(,@('Queue control/column','Classification','Detailed design'),,@('B&S Batch Number','Existing search/column','Searches and displays the controlled batch.'),,@('MFG Lot No.','Existing search/column','Searches and displays the manufacturing lot.'),,@('Search','Existing button','Applies both queue criteria.'),,@('Product Name','Existing column','Read-only product name.'),,@('Strength','Existing column','Read-only strength.'),,@('Pack Size','Existing column','Read-only pack size.'),,@('ECMA','Existing column','Read-only approved reference.'),,@('Expiry Date','Existing column','Read-only batch expiry.'),,@('Required Qty','Existing column','Required leaflet/folding quantity.'),,@('Status','New calculated column','Active or Completed/current controlled state.'),,@('Select row','Existing - updated action','Opens detail and preserves the selected batch context.'))
$body+=Tbl $foldQueue @(2300,2200,4500) 18
$foldDetail=@(,@('Detail control/column','Classification','Detailed design'),,@('Product Information/Documents','Existing common display - updated access','Uses the common product and controlled-document presentation.'),,@('Leaflet Reference','Existing field','Approved ECMA/leaflet reference.'),,@('Leaflet Size','Existing field','Approved pack-size leaflet format.'),,@('Required Qty','Existing field','Quantity that must be folded.'),,@('On Hand Quantity','Existing field','Available leaflet quantity.'),,@('Folded By','New audit field','Pending confirmation then authenticated user.'),,@('Date / Time','New audit field','Pending confirmation then system timestamp.'),,@('Done','Existing - updated button','Single-use normal completion. Records quantity/user/date-time, updates BAR/audit, removes batch from active queue and routes to Pre-Assembly.'),,@('Back to Batch Queue','Existing button','Returns without completing.'))
$body+=Tbl $foldDetail @(2300,2200,4500) 18
$body+=P '3.7.1 Eligibility Correction Required by Approved FS' 'Heading2'
$body+=P 'The wireframe list currently derives candidates from Leaflet Printing completion. The implemented design shall add route-specific prerequisite checks before a record is returned to the Leaflet Folding queue: Reboxing requires completed Carton Issuing; Relabelling with braille required requires completed Braille Printing; relabelling without braille requires completed Leaflet Printing only. This correction prevents premature folding.'
$foldRules=@(,@('Validation','Failure behaviour'),,@('Batch identity not valid','Do not complete; retain Active status and selected batch context.'),,@('Leaflet reference or size not approved/mismatched','Do not complete; display validation and retain the record in the queue.'),,@('Required folded quantity missing/invalid','Do not complete or create attribution.'),,@('Route prerequisite incomplete','Do not list the batch in the Leaflet Folding queue.'),,@('Already completed','Done remains disabled; retained history is view-only through authorised access.'))
$body+=Tbl $foldRules @(3600,5400) 18

$body+=P '3.8 Workflow Status and Routing Design' 'Heading2'
$status=@(
 @('Not Printed BAR','B&S Batch Add','Eligible source exists; BAR not generated.','Generate BAR'),
 @('Generated','B&S Batch Add','Controlled BAR exists; line clearance pending.','Complete checks'),
 @('B&S Line Clearance Complete','B&S Batch Add','All checks signed.','Automatic handoff to Label Printing'),
 @('Active','Printing/Folding queue','Eligible; no saved action.','Open batch'),
 @('In Progress','Printing queue','At least one saved/test/actual/line action.','Continue remaining lines'),
 @('Label Printing complete','Label Printing','All route-derived label lines Done and Print Done recorded.','Route by leaflet requirement'),
 @('Leaflet Printing complete','Leaflet Printing','All leaflet lines Done and Print Done recorded.','Carton, Braille or Folding branch'),
 @('Carton Issuing complete','Carton Issuing','Normal carton issue confirmed.','Satisfy Reboxing folding prerequisite'),
 @('Braille Printing complete','Braille Printing','All braille rows Done and Print Done recorded.','Satisfy applicable folding prerequisite'),
 @('Leaflet Folding complete','Leaflet Folding','Done recorded with quantity/user/date-time.','Handoff to Pre-Assembly')
)
$body+=Tbl (@(,@('Status','Module','Meaning','Next action'))+$status) @(2000,1900,3000,2100) 17

$body+=P '3.9 Audit, Data Integrity and Record Design' 'Heading2'
$audit=@(
 @('BAR generation','Batch, source record IDs, total quantity, generated by/date-time, BAR version/status.'),
 @('B&S line clearance','Three check results, comments, completed by/date-time, signed-off flag.'),
 @('Document view/print','Document title/version/reference, action, batch, user and date/time.'),
 @('Print run','Module, component, quantity needed, quantity selected, category, reason, user and date/time.'),
 @('Line completion','Component, status Done, user and date/time.'),
 @('Print Done','Module finalisation, batch, final user/date-time and retained line/run data.'),
 @('Carton issue','Required and extra quantities, reason, location, user/date-time and completion.'),
 @('Leaflet Folding','Reference, size, required/folded quantity, user/date-time and completed status.'),
 @('Routing','Previous and new stage/status with batch and timestamp.'),
 @('Correction/reprint','Append new event and reason; never overwrite the original controlled action.')
)
$body+=Tbl (@(,@('Audit event','Minimum retained content'))+$audit) @(2900,6100) 18
$body+=LabelP 'Persistence' 'Records shall use the existing approved PLPI database/file controls. Wireframe local-storage objects are demonstrators of required state only and are not the production persistence design.'
$body+=LabelP 'Concurrency' 'A controlled batch/stage shall be locked against conflicting completion. A stale screen must revalidate status before committing.'
$body+=LabelP 'Read-only completion' 'Completed normal actions are disabled. Additional print or correction uses a separate authorised, reasoned, append-only action.'
$body+=LabelP 'Time' 'Server-controlled date/time shall be used in production; client display uses the agreed UK-readable format.'

$body+=P '4. Additional Non-Functional Requirements' 'Heading1'
$nfr=@(
 @('4.1 Audit Trail','Retain all controlled search-selection outcomes where relevant, generation, view, print, completion, routing, error/retry and correction events with batch/item/user/role/date-time and reason/details.'),
 @('4.2 Availability','Functions are available to authorised operational and support roles during agreed hours.'),
 @('4.3 Capacity Limits','Support expected eligible batch volumes, controlled BARs, queue records, component lines, print runs, extra reasons, folding records and retained history.'),
 @('4.4 Performance','Search, BAR view/generation, document opening, print submission, line completion and queue handoff operate within agreed operational response times.'),
 @('4.5 Recoverability','Saved progress remains available without duplication. Failed print/PDF/routing actions do not falsely advance status.'),
 @('4.6 Security','Existing role-based authentication. Completed records are read-only except through authorised correction/reprint processes.'),
 @('4.7 Error Handling','Failed validation blocks the action, shows a clear message and leaves the batch at the current controlled stage.'),
 @('4.8 Usability','Consistent queues, product/document panels, print pop-up and completion language; no overlap or truncation.'),
 @('4.9 Accuracy and Validity','Source selections, identifiers, quantities, references, reasons, checks and route prerequisites remain linked to the committed batch record.'),
 @('4.10 Access and Responsibilities','Operational actions are restricted to the stage-owning role; QA/RP/Operations/IT access follows approved responsibility.'),
 @('4.11 Testing','Cover eligibility, combination, duplicate prevention, 13-page BAR, line-clearance gate, all popup categories/validations, module rows, route branches, audit and folding prerequisites.'),
 @('4.12 Controlled Documents and Training','SOPs/work instructions describe BAR creation, common print controls, category/reason use, line/Print Done, carton issue and folding completion.'),
 @('4.13 Support and Administration','IT supports access, configuration, document/artwork links, printer connectivity, queues, audit retrieval, backup/recovery and incidents.')
)
foreach($x in $nfr){$body+=P $x[0] 'Heading2';$body+=P $x[1]}

$body+=P '5. URS / FS / DS Traceability' 'Heading1'
$trace=@(
 @('4.1.2','FS 3.1','DS 3.1.1','B&S search and selection'),@('4.1.3','FS 3.1','DS 3.1.1','Selected batch/source display'),@('4.1.4','FS 3.1','DS 3.1.2','Compatible source combination'),@('4.1.5','FS 3.1','DS 3.1.2-3.1.3','Controlled BAR creation'),@('4.1.6','FS 3.1','DS 3.1.3-3.1.4','BAR verification and line clearance'),@('4.1.7','FS 3.1','DS 3.1.4','B&S sign-off and Label handoff'),@('4.2.1','FS 3.2','DS 3.2','Printer options/menu'),@('4.2.2','FS 3.2','DS 3.2','Printing queues and product display'),@('4.2.3','FS 3.2','DS 3.2','Controlled BAR/artwork/documents'),@('4.2.4','FS 3.3','DS 3.3','Route-derived label lines'),@('4.2.5','FS 3.2-3.4, 3.6','DS 3.2.1-3.2.2, 3.3-3.4, 3.6','Common printing and popup'),@('4.2.6','FS 3.4-3.6','DS 3.4-3.6','Route branching to carton/braille'),@('4.2.7','FS 3.5-3.6','DS 3.5-3.6','Carton and braille controls'),@('4.2.8','FS 3.2-3.7','DS 3.2-3.8','Completion and folding handoff'),@('4.3.1','FS 3.7','DS 3.7.1','Folding eligibility'),@('4.3.2','FS 3.7','DS 3.7','Folding search and display'),@('4.3.3','FS 3.7','DS 3.7','Folding document access'),@('4.3.4','FS 3.7','DS 3.7','Batch/leaflet confirmation'),@('4.3.5','FS 3.7','DS 3.7','Folded quantity and completion gate'),@('4.3.6','FS 3.7','DS 3.7, 3.9','Folding attribution/history')
)
$body+=Tbl (@(,@('URS ID','FS reference','DS reference','Feature'))+$trace) @(1100,1900,2400,3600) 17

$body+=P '6. Design Verification and Acceptance Considerations' 'Heading1'
$verify=@(
 @('B&S grid','All filters, 28 source columns, totals and both action buttons render within the screen and retain Existing classification.'),
 @('Combination','Matching records combine and sum quantity; mismatch, no-selection and cancel paths do not create a BAR.'),
 @('BAR','One controlled 13-page record is populated; Reboxing attachment is unnumbered; view/print and audit work as designed.'),
 @('Line clearance','Three checks gate User Sign Off; sign-off locks the record and routes to Label Printing.'),
 @('Printer common','Four menu options, counts, shared queue, product panel, document buttons and Back action are consistent.'),
 @('Print pop-up','The entire pop-up is New; all fields/buttons use common font size; category/quantity/reason validation and post-completion behaviour are correct.'),
 @('Label','Correct rows are derived for Reboxing/Relabelling; Change of Pack Size gate works; line completion and Print Done are controlled.'),
 @('Leaflet','Controlled PDF opens; actual print enables Mark as Done; route branches correctly.'),
 @('Carton','Required issue is single-use; Issue Extra is blocked until confirmation and requires quantity/reason.'),
 @('Braille','Only eligible batches appear; both configured rows complete before Print Done.'),
 @('Folding','Route prerequisites are enforced; Done records quantity/user/date-time and hands off once.'),
 @('Audit/security','Every controlled event is attributable; completed records cannot be overwritten; role and concurrency checks are enforced.')
)
$body+=Tbl (@(,@('Verification area','Acceptance consideration'))+$verify) @(2600,6400) 18

$docPath=Join-Path $work 'word\document.xml'
$xml=New-Object System.Xml.XmlDocument;$xml.PreserveWhitespace=$true;$xml.Load($docPath)
$ns=New-Object System.Xml.XmlNamespaceManager($xml.NameTable);$ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
$bodyNode=$xml.SelectSingleNode('//w:body',$ns);$sect=$bodyNode.SelectSingleNode('./w:sectPr',$ns);$sectOuter=if($sect){$sect.OuterXml}else{''}
$bodyNode.InnerXml=($body -join '')+$sectOuter
$writerSettings=New-Object System.Xml.XmlWriterSettings;$writerSettings.Encoding=New-Object System.Text.UTF8Encoding($false);$writerSettings.Indent=$false
$writer=[System.Xml.XmlWriter]::Create($docPath,$writerSettings);$xml.Save($writer);$writer.Close()

foreach($path in @(Get-ChildItem -LiteralPath (Join-Path $work 'word') -File | Where-Object { $_.Name -match '^(header|footer)\d+\.xml$' } | Select-Object -ExpandProperty FullName)){
  $txt=[IO.File]::ReadAllText($path)
  $txt=$txt.Replace('Design Specification: PLPI Assembly Control Software','Design Specification: PLPI Batch Record Automation Phase 2').Replace('VMP/A5/0007/09/v12','PLPI/BAR/DS/01/v1')
  [IO.File]::WriteAllText($path,$txt,(New-Object Text.UTF8Encoding($false)))
}
$settingsPath=Join-Path $work 'word\settings.xml';$settings=New-Object Xml.XmlDocument;$settings.PreserveWhitespace=$true;$settings.Load($settingsPath);$sns=New-Object Xml.XmlNamespaceManager($settings.NameTable);$sns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main');$protection=$settings.SelectSingleNode('//w:documentProtection',$sns);if($protection){[void]$protection.ParentNode.RemoveChild($protection)};$uf=$settings.SelectSingleNode('//w:updateFields',$sns);if(-not $uf){$uf=$settings.CreateElement('w','updateFields','http://schemas.openxmlformats.org/wordprocessingml/2006/main');[void]$settings.DocumentElement.AppendChild($uf)};[void]$uf.SetAttribute('val','http://schemas.openxmlformats.org/wordprocessingml/2006/main','true');$sw=[Xml.XmlWriter]::Create($settingsPath,$writerSettings);$settings.Save($sw);$sw.Close()

if(Test-Path -LiteralPath $zip){Remove-Item -LiteralPath $zip -Force};[IO.Compression.ZipFile]::CreateFromDirectory($work,$zip,[IO.Compression.CompressionLevel]::Optimal,$false);Copy-Item -LiteralPath $zip -Destination $output -Force
Write-Output "Created: $output"
