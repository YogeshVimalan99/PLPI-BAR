$ErrorActionPreference = 'Stop'
$path = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\Phase 3 Doc\FS-PLPI BAR - Pre-Assembly Production Controller Handheld Assembly and Post-Assembly QC.docx'
$source='C:\tmp\phase3-fs-original.docx'
$temp='C:\tmp\phase3-fs-corrected.docx'
Remove-Item -LiteralPath $temp -ErrorAction SilentlyContinue
$log='C:\tmp\fs-correction.log'; Remove-Item -LiteralPath $log -ErrorAction SilentlyContinue
function Log([string]$m){Add-Content -LiteralPath $log -Value ((Get-Date -Format HH:mm:ss)+' '+$m)}
function FindP($doc,[string]$text,[int]$start=0){$r=$doc.Range($start,$doc.Content.End);$f=$r.Find;$f.ClearFormatting();$f.Text=$text;$f.Forward=$true;$f.Wrap=0;$f.MatchWildcards=$false;if(-not $f.Execute()){throw "Not found: $text"};return $r.Paragraphs.Item(1)}
function NextP($doc,$p){return $doc.Range($p.Range.End,$doc.Content.End).Paragraphs.Item(1)}
function SetP($p,[string]$text){$r=$p.Range.Duplicate;$r.End--; $r.Text=$text}
function SetC($t,[int]$row,[int]$col,[string]$text){$r=$t.Cell($row,$col).Range;$r.End--; $r.Text=$text}
function H1($p){$p.Range.Font.Name='Verdana';$p.Range.Font.Size=11;$p.Range.Font.Bold=-1;$p.Range.Font.Color=6299648;$p.Range.ParagraphFormat.SpaceBefore=12;$p.Range.ParagraphFormat.SpaceAfter=0;$p.Range.ParagraphFormat.KeepWithNext=-1}
function H2($p){$p.Range.Font.Name='Verdana';$p.Range.Font.Size=11;$p.Range.Font.Bold=-1;$p.Range.Font.Color=6299648;$p.Range.ParagraphFormat.SpaceBefore=2;$p.Range.ParagraphFormat.SpaceAfter=0;$p.Range.ParagraphFormat.KeepWithNext=-1}
function Body($p){$p.Range.Font.Name='Verdana';$p.Range.Font.Size=11;$p.Range.Font.Bold=0;$p.Range.Font.Color=0;$p.Range.ParagraphFormat.SpaceBefore=0;$p.Range.ParagraphFormat.SpaceAfter=0}
$word=New-Object -ComObject Word.Application;$word.Visible=$false;$word.DisplayAlerts=0
try{
 $doc=$word.Documents.Open($source,$false,$true);Log 'opened read-only copy'
 foreach($styleName in @('Heading 1','Heading 2')){$st=$doc.Styles.Item($styleName);$st.Font.Name='Verdana';$st.Font.Size=11;$st.Font.Bold=-1;$st.Font.Color=6299648}
 $abbr=$doc.Tables.Item(5);while($abbr.Rows.Count -lt 15){[void]$abbr.Rows.Add()};while($abbr.Rows.Count -gt 15){$abbr.Rows.Item($abbr.Rows.Count).Delete()}
 $rows=@(@('Term','Definition'),@('IT','Information Technology'),@('URS','User Requirement Specification'),@('DS','Design Specification'),@('FS','Functional Specification'),@('PLPI','Parallel Import / PLPI workflow system'),@('BAR','Batch Assembly Record'),@('PCL','Product Check Log'),@('B&S','B&S Healthcare'),@('GMP','Good Manufacturing Practice'),@('IPC','In-Process Check'),@('MFG','Manufacturer / Manufacturing'),@('QA','Quality Assurance'),@('QC','Quality Control'),@('QP','Qualified Person'))
 for($i=1;$i -le 15;$i++){SetC $abbr $i 1 $rows[$i-1][0];SetC $abbr $i 2 $rows[$i-1][1]};$abbr.Range.Font.Name='Verdana';$abbr.Range.Font.Size=11;$abbr.Range.ParagraphFormat.SpaceAfter=0;$abbr.Rows.Item(1).Range.Font.Bold=-1
 Log 'abbr done'
 $th=FindP $doc '3.5 URS / FS / DS Traceability' $doc.Tables.Item(9).Range.End;SetP $th '3.5 URS / FS / DS Traceability Matrix';H2 $th
 $tt=$doc.Tables.Item(10);if($tt.Columns.Count -eq 4){$tt.Columns.Item(4).Delete()};while($tt.Rows.Count -gt 5){$tt.Rows.Item($tt.Rows.Count).Delete()};while($tt.Rows.Count -lt 5){[void]$tt.Rows.Add()}
 $tr=@(@('URS ID / FS ID / DS ID Ref','Function/Feature','Description/Specification'),@('URS: 4.1.1-4.1.12 / FS: FS-PA-001 to FS-PA-012 / DS: 3.1','Pre-Assembly QC','Verify the selected batch and printed materials, prepare the assembly reference sample, record controlled counts and release the signed batch to Production Control.'),@('URS: 4.2.1-4.2.20 / FS: FS-PC-001 to FS-PC-020 / DS: 3.2','Production Controller Handheld and Room Allocation','Use the approved handheld workflow to perform Stock Take Out, verify Box ID, complete Line Clearance and allocate the confirmed batch to an Assembly Room.'),@('URS: 4.3.1-4.3.4, 4.3.7-4.3.12, 4.3.15, 4.3.17-4.3.21, 4.3.23-4.3.30 / FS: FS-AR-001 to FS-AR-024 / DS: 3.3','Assembly Room','Execute Initial Checks, Random Sample Check, IPC Checks and Reconciliation and Closure for the batch in its allocated room.'),@('URS: 4.4.1-4.4.3, 4.4.6, 4.4.8, 4.4.10-4.4.17 / FS: FS-PQ-001 to FS-PQ-013 / DS: 3.4','Post-Assembly QC','Verify finished packs against the BAR, confirm pack and box quantities, print the Quarantine Label and release the signed batch to Pre-QP.'))
 for($i=1;$i -le 5;$i++){for($j=1;$j -le 3;$j++){SetC $tt $i $j $tr[$i-1][$j-1]}};$tt.Range.Font.Name='Verdana';$tt.Range.Font.Size=11;$tt.Range.ParagraphFormat.SpaceAfter=0;$tt.Rows.Item(1).Range.Font.Bold=-1
 Log 'trace table done'
 $purpose='This matrix links each approved Stage 9-12 user-requirement group to its functional module and corresponding design section; it supports review, validation and change-impact traceability.'
 $pr=$doc.Range($tt.Range.Start,$tt.Range.Start);$pr.InsertBefore($purpose+"`r");$pp=FindP $doc $purpose;Body $pp
 Log 'purpose done'
 foreach($x in @('3.1    Pre-Assembly QC Module','3.2    Production Controller Handheld / Room Allocation Module','3.3    Assembly Room Module','3.4    Post-Assembly QC Module')){H2 (FindP $doc $x $doc.Tables.Item(5).Range.End)}
 Log 'module headings done'
 $s4=FindP $doc '4. Non-Functional Specification' $tt.Range.End;H1 $s4;$first=FindP $doc '4.1 Audit Trail' $s4.Range.End;$intro='This section defines the non-functional controls applicable to Pre-Assembly QC, the Production Controller handheld workflow and room allocation, Assembly Room execution and Post-Assembly QC.';$ir=$doc.Range($first.Range.Start,$first.Range.Start);$ir.InsertBefore($intro+"`r");Body (FindP $doc $intro)
 SetP (FindP $doc '4.9 Accuracy and Validity') '4.9 Accuracy & Validity';SetP (FindP $doc '4.11 Testing and Traceability') '4.11 Testing'
 $nfr=@(
 @('4.1 Audit Trail','The system shall retain audit records for Pre-Assembly verification and sign-off; Production Controller Stock Take Out, Box ID verification, handheld Line Clearance and room allocation; Assembly Initial Checks, Random Sample Check, IPC Checks, reconciliation and closure; Post-Assembly quantity confirmation, BAR checks, Quarantine Label printing, sign-off and every controlled hand-off. Each audit entry shall identify the batch, action, authenticated user, date/time and applicable result, quantity, reason, comment or previous/new value.'),
 @('4.2 Availability','The Stage 9-12 functions shall be available to authorised Pre-Assembly QC, Production Controller, Assembly Room, Post-Assembly QC, QA and support users during agreed operational hours. A device, printer or service interruption shall not create a false completion or hand-off.'),
 @('4.3 Capacity Limits','The system shall support the approved operational volume of active and completed batches, boxes, assembly samples, IPC entries, photographs, label-print records and retained audit history.'),
 @('4.4 Performance','Batch search, screen opening, handheld validation, quantity save, controlled print actions, sign-off and stage hand-off shall operate within the response times approved for the PLPI operating environment and confirmed during qualification.'),
 @('4.5 Recoverability','Committed Stage 9-12 records, signatures, print states and audit events shall remain available after a recoverable interruption without duplication or loss. An incomplete handheld Line Clearance or unsigned stage shall not be represented as completed.'),
 @('4.6 Security Requirements','Access shall be role based. Pre-Assembly QC, Production Controller, Assembly Room and Post-Assembly QC users shall perform only the actions assigned to their authorised stage. Signature attribution shall be derived from the authenticated identity, and completed records shall be read-only except through an authorised correction process.'),
 @('4.7 Error Handling','The system shall validate stage eligibility, batch and Box ID association, mandatory checks, positive whole-number quantities, reconciliation, required comments, print prerequisites and completion status. A failed validation shall identify the unmet condition, block the action and retain the batch in its current controlled stage.'),
 @('4.8 Usability','Desktop and handheld screens shall provide clear batch identity, status, required actions, readable controlled values, visible progress and gated completion controls consistent with the approved Stage 9-12 wireframes.'),
 @('4.9 Accuracy & Validity','Batch, product, material, quantity, box, room, sample, IPC, photograph, print and sign-off data shall remain linked to the selected controlled record. Calculated and reconciled values shall be revalidated when the user commits the applicable action.'),
 @('4.10 User Access and Responsibilities','Pre-Assembly QC users verify and release the batch to Production Control. Production Controllers perform the handheld checks and allocate the batch to a room. Assembly Room users execute and close the assembly record. Post-Assembly QC users verify finished packs, print the Quarantine Label and release the batch to Pre-QP. QA and support users perform only their authorised review or administration responsibilities.'),
 @('4.11 Testing','Testing shall cover every URS trace, authorised role, positive workflow, validation, cancellation, interruption, duplicate-prevention control, audit event, handheld action, print action, stage sign-off and downstream hand-off defined for Stages 9-12.'),
 @('4.12 Controlled Documents and Training','Applicable SOPs, work instructions, BAR forms, handheld instructions and training shall describe Pre-Assembly checks, Production Controller Line Clearance and room allocation, Assembly execution, Post-Assembly verification, controlled printing, corrections and electronic sign-off before release.'),
 @('4.13 Support and Administration','Authorised administrators shall maintain approved users, roles, handheld devices, printers and controlled configuration. Support activity shall retain appropriate diagnostic evidence without providing uncontrolled operational sign-off or altering completed batch records.'))
 $pos=$s4.Range.End;foreach($x in $nfr){$lookup=$x[0];if($lookup -eq '4.9 Accuracy & Validity'){$lookup='4.9 Accuracy and Validity'};if($lookup -eq '4.11 Testing'){$lookup='4.11 Testing and Traceability'};$h=FindP $doc $lookup $s4.Range.End;SetP $h $x[0];H2 $h;$b=NextP $doc $h;SetP $b $x[1];Body $b}
 Log 'nfr done'
 for($i=6;$i -le $doc.Tables.Count;$i++){$doc.Tables.Item($i).Range.Font.Name='Verdana';$doc.Tables.Item($i).Range.Font.Size=11;$doc.Tables.Item($i).Range.ParagraphFormat.SpaceAfter=0}
 foreach($toc in $doc.TablesOfContents){$toc.Update()}
 Log 'table formatting done';$doc.SaveAs2($temp,16);Log 'saved temp';$doc.Close(0);Log 'closed'
}finally{if($word){$word.Quit()}}
if(-not (Test-Path -LiteralPath $temp)){throw 'Corrected output was not created'}
Move-Item -LiteralPath $temp -Destination $path -Force
Write-Output $path