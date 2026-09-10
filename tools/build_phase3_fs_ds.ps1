$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$phase = Join-Path $root 'Phase 3 Doc'
$ursPath = Join-Path $phase 'URS-PLPI BAR - Pre-Assembly Production Control Assembly and Post-Assembly QC.docx'
$fsPath = Join-Path $phase 'FS-PLPI BAR - Pre-Assembly Production Controller Handheld Assembly and Post-Assembly QC.docx'
$dsPath = Join-Path $phase 'DS-PLPI BAR - Pre-Assembly Production Controller Handheld Assembly and Post-Assembly QC.docx'
$screens = Join-Path $phase 'screenshots'

function Clean-Cell([string]$s) { return (($s -replace '[\r\a]+$','') -replace '[\r\a]',' ').Trim() }
function Set-Cell($cell, [string]$text, [bool]$header=$false) {
  $cell.Range.Text = $text
  $cell.Range.Font.Name = 'Verdana'
  $cell.Range.Font.Size = if ($header) { 8 } else { 8 }
  $cell.Range.Font.Bold = if ($header) { 1 } else { 0 }
  $cell.Range.ParagraphFormat.SpaceAfter = 0
  $cell.Range.ParagraphFormat.SpaceBefore = 0
  if ($header) {
    $cell.Shading.BackgroundPatternColor = 13010661
    $cell.Range.Font.Color = 16777215
  }
  $cell.VerticalAlignment = 1
}
function Add-P($doc, [string]$text='', [string]$style='Normal') {
  $r = $doc.Content
  $r.Collapse(0)
  $p = $doc.Paragraphs.Add($r)
  if ($style) { try { $p.Range.Style = $doc.Styles.Item($style) } catch {} }
  $p.Range.Text = $text
  $p.Range.InsertParagraphAfter()
  return $p
}
function Add-Heading($doc, [string]$text, [int]$level) {
  $p = Add-P $doc $text ''
  $p.Range.Font.Name = 'Verdana'
  $p.Range.Font.Bold = 1
  if ($level -eq 1) { $p.Range.Font.Size = 13 } elseif ($level -eq 2) { $p.Range.Font.Size = 11 } else { $p.Range.Font.Size = 9 }
  $p.Range.Font.Color = 13010661
  $p.Range.ParagraphFormat.KeepWithNext = -1
  $p.Range.ParagraphFormat.SpaceBefore = 8
  $p.Range.ParagraphFormat.SpaceAfter = 4
  return $p
}
function Add-Bullets($doc, [string[]]$items) {
  foreach ($item in $items) {
    $p = Add-P $doc $item 'Normal'
    $p.Range.ListFormat.ApplyBulletDefault()
    $p.Range.ParagraphFormat.LeftIndent = 18
  }
}
function Add-Table($doc, [string[]]$headers, [object[]]$rows, [double[]]$widths=@()) {
  $r = $doc.Content; $r.Collapse(0)
  $t = $doc.Tables.Add($r, $rows.Count + 1, $headers.Count)
  $t.Borders.Enable = 1
  $t.AllowAutoFit = $false
  $t.Rows(1).HeadingFormat = -1
  for ($c=1; $c -le $headers.Count; $c++) { Set-Cell $t.Cell(1,$c) $headers[$c-1] $true }
  for ($i=0; $i -lt $rows.Count; $i++) {
    for ($c=0; $c -lt $headers.Count; $c++) { Set-Cell $t.Cell($i+2,$c+1) ([string]$rows[$i][$c]) $false }
  }
  if ($widths.Count -eq $headers.Count) {
    for ($c=1; $c -le $headers.Count; $c++) { $t.Columns($c).Width = $widths[$c-1] }
  }
  $after = $doc.Range($t.Range.End, $t.Range.End)
  $after.InsertParagraphAfter()
  return $t
}
function Add-PageBreak($doc) { $r=$doc.Content; $r.Collapse(0); $r.InsertBreak(7) }
function Add-Figure($doc, [string]$path, [string]$caption, [double]$width=455) {
  if (-not (Test-Path -LiteralPath $path)) { return }
  $r=$doc.Content; $r.Collapse(0)
  $shape=$doc.InlineShapes.AddPicture($path,$false,$true,$r)
  $shape.LockAspectRatio=-1; $shape.Width=$width
  $p=$shape.Range.Paragraphs(1); $p.Alignment=1; $p.Range.InsertParagraphAfter()
  $c=Add-P $doc $caption 'Caption'; $c.Alignment=1; $c.Range.Font.Italic=1; $c.Range.Font.Size=8
}
function Add-TOC($doc) {
  Add-Heading $doc 'Table of Contents' 1 | Out-Null
  foreach($entry in @('1. Introduction','2. Overall Process / Logical Design','3. Four Stage Specifications','4. Common Controls / Record Design','5. Security, Error and Recovery Controls','6. Requirements Traceability','7. Verification')) { Add-P $doc $entry | Out-Null }
}
function Expected([string]$req) {
  $x=$req -replace '^The system shall\s*',''
  if ($req -match 'shall not|must not') { return 'The prohibited action is blocked and no completion or record update occurs.' }
  if ($req -match 'disabled|enable|available only|only after|until') { return 'The control state changes only when every stated prerequisite is true.' }
  if ($req -match 'display|show|present') { return 'The named information is visible, correctly associated with the selected batch, and read-only where stated.' }
  if ($req -match 'record|capture|audit|timestamp') { return 'The specified values, authenticated user and date/time are retained with the batch record.' }
  if ($req -match 'validate|positive|whole|equal|match|required|blank') { return 'Invalid or incomplete input is rejected with a clear message and without completing the step.' }
  if ($req -match 'search|filter|queue|list') { return 'The returned work list contains only records matching the stated stage/status and search criteria.' }
  if ($req -match 'print') { return 'The requested controlled output is generated for the selected batch and its print status is shown.' }
  if ($req -match 'sign|confirm|complete') { return 'Confirmation stores the stated outcome once, attributes it to the user, and advances only to the stated next state.' }
  return 'The observable result matches the requirement for the selected batch without changing unrelated data.'
}
function Requirement-Rows($reqs, [string]$prefix) {
  $out=@()
  foreach ($q in $reqs | Where-Object { $_.Id -like "$prefix*" }) {
    $out += ,@($q.Id, ($q.Text -replace '^The system shall\s*',''), (Expected $q.Text))
  }
  return $out
}
function Configure-Doc($doc, [string]$typeTitle, [string]$docId) {
  try { if ($doc.ProtectionType -ne -1) { $doc.Unprotect() } } catch {}
  $doc.Content.Delete()
  $doc.PageSetup.TopMargin=56.7; $doc.PageSetup.BottomMargin=56.7; $doc.PageSetup.LeftMargin=56.7; $doc.PageSetup.RightMargin=56.7
  foreach ($name in @('Normal','Body Text')) {
    try { $s=$doc.Styles.Item($name); $s.Font.Name='Verdana'; $s.Font.Size=9; $s.Font.Color=0; $s.ParagraphFormat.SpaceAfter=5; $s.ParagraphFormat.LineSpacingRule=0 } catch {}
  }
  foreach ($n in 1..3) {
    try { $s=$doc.Styles.Item("Heading $n"); $s.Font.Name='Verdana'; $s.Font.Bold=1; $s.Font.Color=13010661; $s.Font.Size=(15-2*$n); $s.ParagraphFormat.KeepWithNext=-1; $s.ParagraphFormat.SpaceBefore=8; $s.ParagraphFormat.SpaceAfter=4 } catch {}
  }
  foreach ($sec in $doc.Sections) {
    foreach ($kind in 1,2,3) {
      try {
        $h=$sec.Headers.Item($kind).Range
        $h.Find.Execute('User Requirement Specification',$false,$false,$false,$false,$false,$true,1,$false,$typeTitle,2) | Out-Null
        $h.Find.Execute('URS-PLPI',$false,$false,$false,$false,$false,$true,1,$false,($docId -replace '-PLPI.*$','-PLPI'),2) | Out-Null
      } catch {}
    }
  }
}
function Add-Cover($doc,[string]$type,[string]$id) {
  $p=Add-P $doc 'B&S GROUP' 'Title'; $p.Alignment=1; $p.Range.Font.Name='Verdana'; $p.Range.Font.Size=24; $p.Range.Font.Bold=1; $p.Range.Font.Color=13010661
  $p=Add-P $doc $type 'Title'; $p.Alignment=1; $p.Range.Font.Size=20; $p.Range.Font.Bold=1; $p.Range.Font.Color=13010661
  $p=Add-P $doc 'PLPI BAR – Stages 9–12' 'Subtitle'; $p.Alignment=1; $p.Range.Font.Size=15
  $p=Add-P $doc 'Pre-Assembly QC, Production Controller Handheld, Assembly Room and Post-Assembly QC' 'Subtitle'; $p.Alignment=1; $p.Range.Font.Size=11
  Add-P $doc '' | Out-Null
  Add-Table $doc @('Document ID','Version','Status','Date') @(,@($id,'1.0','Draft for review','28 August 2026')) @(110,70,150,110) | Out-Null
  Add-P $doc '' | Out-Null
  Add-Heading $doc 'Approval' 2 | Out-Null
  Add-Table $doc @('Role','Name','Signature','Date') @(
    ,@('Author','','',''),,@('Business Process Owner','','',''),,@('Quality Assurance','','',''),,@('Information Technology','','','')
  ) @(130,110,120,80) | Out-Null
  Add-P $doc 'Controlled document. Printed copies are uncontrolled unless formally issued.' | Out-Null
  Add-PageBreak $doc
  Add-TOC $doc
  Add-PageBreak $doc
}

$word=$null; $urs=$null
try {
  $word=New-Object -ComObject Word.Application
  $word.Visible=$false; $word.DisplayAlerts=0
  $urs=$word.Documents.Open($ursPath,$false,$true)
  $requirements=@()
  foreach ($t in $urs.Tables) {
    if ($t.Columns.Count -ge 2) {
      $h=Clean-Cell $t.Cell(1,1).Range.Text
      if ($t.Rows.Count -gt 1) {
        for ($r=2; $r -le $t.Rows.Count; $r++) {
          try {
            $id=Clean-Cell $t.Cell($r,1).Range.Text; $txt=Clean-Cell $t.Cell($r,2).Range.Text
            if ($id -match '^4\.[1-4]\.\d+$' -and $txt) { $requirements += [pscustomobject]@{Id=$id;Text=$txt} }
          } catch {}
        }
      }
    }
  }
  $urs.Close($false); $urs=$null
  if ($requirements.Count -lt 50) { throw "Only $($requirements.Count) Section 4 requirements were extracted from the current URS." }

  $modules=@(
    [pscustomobject]@{Prefix='4.1.';Fs='3.1';Ds='3.1';Name='Pre-Assembly QC';Role='Pre-Assembly QC user';Entry='Batch preparation and printed-material evidence available';Exit='Signed Pre-Assembly record available to Production Control';Test='OQ-PA'},
    [pscustomobject]@{Prefix='4.2.';Fs='3.2';Ds='3.2';Name='Production Controller Handheld / Room Allocation';Role='Production Controller using an authorised SeUIC handheld';Entry='Pre-Assembly complete and stock available for take-out';Exit='Line clearance signed and Assembly Room allocated in the BAR';Test='OQ-PC'},
    [pscustomobject]@{Prefix='4.3.';Fs='3.3';Ds='3.3';Name='Assembly Room';Role='Assembly Room user';Entry='Confirmed room allocation';Exit='All four assembly pages signed and batch handed to Post-Assembly QC';Test='OQ-AR'},
    [pscustomobject]@{Prefix='4.4.';Fs='3.4';Ds='3.4';Name='Post-Assembly QC';Role='Post-Assembly QC user';Entry='Assembly and reconciliation complete';Exit='Production Checking complete and batch available to Pre-QP';Test='OQ-PQ'}
  )

  # FS
  Copy-Item -LiteralPath $ursPath -Destination $fsPath -Force
  $fs=$word.Documents.Open($fsPath,$false,$false)
  Configure-Doc $fs 'Functional Specification' 'FS-PLPI-P3'
  Add-Cover $fs 'Functional Specification' 'FS-PLPI-P3'
  Add-Heading $fs '1. Introduction' 1 | Out-Null
  Add-P $fs 'This Functional Specification defines the observable system behaviour required to deliver PLPI BAR stages 9–12. It is derived from the currently saved URS and the approved wireframe behaviour. It does not introduce unverified interfaces, services or infrastructure.' | Out-Null
  Add-Heading $fs '1.1 Purpose' 2 | Out-Null
  Add-P $fs 'The purpose is to translate each user requirement into functional processing, validation, status, audit and handoff behaviour that can be configured, developed and objectively tested.' | Out-Null
  Add-Heading $fs '1.2 Source baseline and assumptions' 2 | Out-Null
  Add-Bullets $fs @(
    'The current Phase 3 URS is the requirements authority; superseded wording has not been restored.',
    'The Production Controller function is the dedicated handheld Stock Take Out and Line Clearance workflow.',
    'Wireframes define visible controls and interaction intent. They do not prove a database schema, network protocol, device-management method or external API.',
    'Existing approved PLPI identity, persistence, print and audit capabilities are referenced only as implementation dependencies and require technical confirmation before build.'
  )
  Add-Heading $fs '2. Overall Functional Flow' 1 | Out-Null
  Add-Table $fs @('Stage','Primary role','Entry condition','Completion / handoff') ($modules | ForEach-Object { ,@($_.Name,$_.Role,$_.Entry,$_.Exit) }) @(105,110,150,155) | Out-Null
  Add-P $fs 'A batch may advance only after the completion conditions of its current stage have been satisfied. A Back, Cancel, close or interrupted session must not be treated as sign-off.' | Out-Null
  Add-Heading $fs '3. Functional Requirements' 1 | Out-Null

  foreach ($m in $modules) {
    Add-Heading $fs ("$($m.Fs) $($m.Name)") 2 | Out-Null
    Add-Table $fs @('Attribute','Functional definition') @(
      ,@('Actor',$m.Role),,@('Entry',$m.Entry),,@('Completion',$m.Exit)
    ) @(120,400) | Out-Null
    if ($m.Prefix -eq '4.1.') {
      Add-Heading $fs 'Functional sequence' 3 | Out-Null
      Add-Bullets $fs @('Find and open an eligible batch from the Pre-Assembly work list.','Review product and route information and confirm each applicable printed-material reference.','Record specimen, leaflet-fold and tamper-seal counts; record a reason if MARKS is changed.','View the mock-up used to prepare and compare the assembly reference sample.','Enable User Sign Off only when all applicable confirmations, counts and amendment conditions are complete.','On sign-off, record the user/date-time, lock the completed record and hand the batch to Production Control.')
    } elseif ($m.Prefix -eq '4.2.') {
      Add-Heading $fs 'Functional sequence' 3 | Out-Null
      Add-Bullets $fs @('From GOODS IN, the Production Controller selects STOCK TAKE OUT on the authorised SeUIC handheld.','The user scans or enters the Stock ID and reviews the displayed product, part, batch, box, quantity, location, IMP and contract details.','TRANSFER opens Box ID verification; blank confirmation is blocked and Cancel returns without completion.','A successful Box ID opens a new Line Clearance for label verification and confirmation of the number of boxes.','A changed box count requires an explicit old-versus-new confirmation; Cancel restores the previous value.','The user selects Room1 or Room2. CONFIRMED BY remains gated until both checks, a valid count, no pending change and a room selection are present.','Confirmation updates the BAR with the stock/batch/product/count/room/checks/user/date-time and displays BAR UPDATED. The signed form becomes read-only and is not reused to prefill a later transfer.')
      Add-Table $fs @('Screen / control','Behaviour') @(
        ,@('GOODS IN / STOCK TAKE OUT','Opens the Production Controller function; unrelated menu tiles are not part of this stage.'),
        ,@('Stock ID','Accepts scan or manual entry and retrieves the selected stock details.'),
        ,@('TRANSFER','Starts Box ID verification for the displayed stock record.'),
        ,@('Box ID / CONFIRM / CANCEL','Requires a value; Confirm advances, Cancel closes without line-clearance completion.'),
        ,@('Line-clearance checks','Both confirmations are mandatory; box count is a positive whole number.'),
        ,@('Assign Assembly Room','Requires Room1 or Room2 before sign-off.'),
        ,@('CONFIRMED BY','Writes the final BAR update once and locks the completed form.')
      ) @(150,370) | Out-Null
    } elseif ($m.Prefix -eq '4.3.') {
      Add-Heading $fs 'Functional sequence' 3 | Out-Null
      Add-Bullets $fs @('Show active and completed batches allocated to the Assembly Room, with search, refresh and check-in/check-out controls.','Opening an unstarted batch requires confirmation and records the assembly start user/date-time.','Complete the four ordered pages: Initial Checks, Random Sample Check, IPC Checks, and Reconciliation & Closure.','Apply page-level mandatory fields and signature gates; a signed page becomes read-only.','Random Sample Check records the required observations for each box. IPC supports scheduled/minimum checks, additional rows and photo evidence.','Final handoff is available only when every page is signed; completion records the finish user/date-time and sends the batch to Post-Assembly QC.')
    } else {
      Add-Heading $fs 'Functional sequence' 3 | Out-Null
      Add-Bullets $fs @('Find and open a batch whose assembly and reconciliation are complete.','Record positive values for Total Packs, Total Boxes and No. of Packs Checked.','When more than one box is declared, enter a positive whole-number quantity for every box and require the sum to equal Total Packs.','Verify each Pack Details Against BAR row, including expiry confirmation, and optionally record comments.','Allow the Quarantine Label to be printed for the selected batch and display its print status.','Enable User Sign Off only after quantity, allocation and pack-check rules pass; sign-off records user/date-time, marks the queue item Completed and makes it available to Pre-QP.')
    }
    Add-Heading $fs 'Requirement realisation and acceptance condition' 3 | Out-Null
    Add-Table $fs @('URS ID','Functional behaviour','Acceptance condition') (Requirement-Rows $requirements $m.Prefix) @(55,285,180) | Out-Null
  }

  Add-Heading $fs '4. Common Functional Controls' 1 | Out-Null
  Add-Table $fs @('Control area','Functional specification') @(
    ,@('Access','Only an authenticated user assigned to the relevant role may open, edit or sign the stage. The handheld stage is limited to Production Controllers.'),
    ,@('Audit','Every signature and material confirmation shall retain the acting user and date/time with the batch record.'),
    ,@('Validation','Mandatory-field, whole-number, sum and prerequisite errors shall be shown at the point of action and shall not advance status.'),
    ,@('Record locking','A signed stage or page is read-only. Any correction follows the approved controlled amendment process; silent overwrite is not permitted.'),
    ,@('Navigation and recovery','Back, Cancel, close, power interruption or session loss before sign-off shall not create a completed record. Previously committed signatures remain retained.'),
    ,@('Printing','BAR and Quarantine Label output is associated with the selected batch; printer configuration and infrastructure remain subject to the approved PLPI environment.'),
    ,@('Status handoff','The downstream work list receives a batch only after the upstream completion event stated in Section 3.')
  ) @(120,400) | Out-Null
  Add-Heading $fs '5. Requirements Traceability' 1 | Out-Null
  $tr=@(); foreach ($m in $modules) { $i=0; foreach($q in $requirements | Where-Object {$_.Id -like "$($m.Prefix)*"}) {$i++; $tr+=,@($q.Id,"FS $($m.Fs)","DS $($m.Ds)",("{0}-{1:D2}" -f $m.Test,$i))} }
  Add-Table $fs @('URS ID','FS reference','DS reference','Verification reference') $tr @(75,130,130,150) | Out-Null
  Add-Heading $fs '6. Verification Approach' 1 | Out-Null
  Add-P $fs 'Verification shall include positive and negative challenge tests for every traceability row. Evidence shall include the input data, user role, visible result, stored audit attribution, resulting status and any generated controlled output.' | Out-Null
  $fs.Repaginate()
  $fs.Save(); $fs.Close($false)

  # DS
  Copy-Item -LiteralPath $ursPath -Destination $dsPath -Force
  $ds=$word.Documents.Open($dsPath,$false,$false)
  Configure-Doc $ds 'Design Specification' 'DS-PLPI-P3'
  Add-Cover $ds 'Design Specification' 'DS-PLPI-P3'
  Add-Heading $ds '1. Introduction' 1 | Out-Null
  Add-P $ds 'This Design Specification defines the logical user-interface, state, validation, record and audit design for PLPI BAR stages 9–12. It is implementation-neutral where the available evidence does not identify a specific API, database object, network topology or device-management platform.' | Out-Null
  Add-Heading $ds '1.1 Design boundary' 2 | Out-Null
  Add-Bullets $ds @('In scope: screen composition, control behaviour, validation, stage/page state, logical data fields, audit attribution, printing intent and stage handoff.','Out of scope until technically confirmed: physical database schema, endpoint names, payload formats, authentication protocol, handheld fleet management, network configuration, printer drivers and disaster-recovery implementation.','The dedicated Production Controller handheld wireframe is the design authority for Stage 10; a desktop production-check workflow is not included.')
  Add-Heading $ds '2. Logical Design' 1 | Out-Null
  Add-Table $ds @('Layer','Design responsibility') @(
    ,@('Presentation','Role-specific desktop stage views and the SeUIC handheld workflow; controls expose only the permitted action for the current state.'),
    ,@('Validation/state','Client-visible and server-authoritative checks prevent transition until mandatory, numeric, sum, confirmation and signature conditions pass.'),
    ,@('Record/audit','The batch/BAR record retains committed stage data, status, actor and date/time. Completed records are immutable through ordinary entry screens.'),
    ,@('Output/handoff','BAR or label output is tied to the selected batch; completion publishes the batch to the next authorised stage queue.')
  ) @(120,400) | Out-Null
  Add-P $ds 'Logical state sequence: Available → In Progress → Ready for Sign-off → Completed → Available to next stage. Cancelled or interrupted work remains in its last committed non-completed state.' | Out-Null

  Add-Heading $ds '3. Detailed Module Design' 1 | Out-Null
  Add-Heading $ds '3.1 Pre-Assembly QC' 2 | Out-Null
  Add-Figure $ds (Join-Path $screens '01-pre-assembly-queue.png') 'Figure 1 – Pre-Assembly QC batch queue generated from the current wireframe.' 455
  Add-Figure $ds (Join-Path $screens '01-pre-assembly-detail.png') 'Figure 2 – Pre-Assembly verification and sign-off screen generated from the current wireframe.' 455
  Add-Table $ds @('Design element','Logical design') @(
    ,@('Queue','Search by B&S Batch Number or MFG Lot No; open only an eligible row.'),
    ,@('Reference checks','Render applicable label/material rows with reference codes and a confirmation checkbox per row.'),
    ,@('Counts','No of specimen, No Of Leaflet Folds and Tamper seal per pack accept non-negative whole values.'),
    ,@('MARKS change','Compare with the original value. Enable and require Reason only when changed.'),
    ,@('Route exception','For Reboxing, both Change of Pack Size amendment sign-offs are prerequisites.'),
    ,@('Sign-off','Gate on all material checks, counts, MARKS reason when applicable and route amendments. Store user/date-time and move to Production Control.')
  ) @(130,390) | Out-Null

  Add-Heading $ds '3.2 Production Controller Handheld / Room Allocation' 2 | Out-Null
  Add-Table $ds @('Device/UI constraint','Design') @(
    ,@('Device','Authorised SeUIC handheld; portrait workflow with touch targets and scanner/manual entry.'),
    ,@('Entry route','GOODS IN → STOCK TAKE OUT.'),
    ,@('Persistence boundary','Only CONFIRMED BY commits completion. Navigation, Cancel or power interruption before that event does not complete Line Clearance.'),
    ,@('Reuse rule','A completed form remains read-only in history and never pre-fills the next stock transfer.')
  ) @(130,390) | Out-Null
  Add-Figure $ds (Join-Path $screens '02-handheld-menu.png') 'Figure 3 – GOODS IN menu on the Production Controller handheld.' 205
  Add-Figure $ds (Join-Path $screens '02-handheld-stock-take-out.png') 'Figure 4 – Stock Take Out details and TRANSFER action.' 205
  Add-Figure $ds (Join-Path $screens '02-handheld-box-verification.png') 'Figure 5 – Box ID verification dialog.' 205
  Add-Figure $ds (Join-Path $screens '02-handheld-line-clearance.png') 'Figure 6 – Line Clearance checks, box count and room allocation.' 205
  Add-Table $ds @('Field/control','Type/state','Validation / transition','Committed field') @(
    ,@('Stock ID','Scanner/manual input','Required to identify the stock record; selection populates details.','stockId'),
    ,@('Product / Part / Batch / Boxes / Qty / Location / IMP / Contract','Read-only display','Values belong to selected Stock ID.','Reference only'),
    ,@('TRANSFER','Action','Opens Box ID verification for displayed stock.','None'),
    ,@('Box ID','Scanner/manual input','Blank Confirm is blocked; Cancel closes without completion.','boxId / verification result'),
    ,@('Product/expiry/lot-size check','Checkbox','Required.','checkProductLabel'),
    ,@('No. of boxes confirmed','Positive whole number + checkbox','Count must be valid. A changed count opens old/new confirmation; Cancel restores old.','confirmedBoxes'),
    ,@('Assign Assembly Room','Select: Room1, Room2','Required before CONFIRMED BY.','assemblyRoom'),
    ,@('CONFIRMED BY','Gated action','Enabled only when both checks, count, change confirmation and room are valid.','user, dateTime, completion status')
  ) @(110,85,190,110) | Out-Null
  Add-P $ds 'Committed BAR update: Stock ID, batch, product, confirmed box count, allocated room, both check results, authenticated user and date/time. The confirmation view displays BAR UPDATED plus the user, time and room.' | Out-Null

  Add-Heading $ds '3.3 Assembly Room' 2 | Out-Null
  $assemblyShots=@(
    @('01-assembly-batch-queue.png','Figure 7 – Assembly batch queue.'),
    @('03-initial-checks.png','Figure 8 – Initial Checks page.'),
    @('04-random-sample-check.png','Figure 9 – Random Sample Check page.'),
    @('05-ipc-checks.png','Figure 10 – IPC Checks page.'),
    @('06-reconciliation-closure.png','Figure 11 – Reconciliation & Closure page.')
  )
  foreach($s in $assemblyShots){Add-Figure $ds (Join-Path $root ("assembly_module_document\screenshots\"+$s[0])) $s[1] 455}
  Add-Table $ds @('Page/state','Design rule') @(
    ,@('Batch start','Opening an unstarted batch requires confirmation and commits the start user/date-time.'),
    ,@('Initial Checks','Mandatory material and setup confirmations must pass before page signature.'),
    ,@('Random Sample Check','Create observations per box; require all mandatory sample results before signature.'),
    ,@('IPC Checks','Provide scheduled/minimum rows, allow additional rows, and attach photo evidence where required.'),
    ,@('Reconciliation & Closure','Validate issued/used/damaged/surplus/leftover reconciliation and closure fields.'),
    ,@('Page signature','Store user/date-time; signed page is read-only.'),
    ,@('Final completion','Available only when all four pages are signed; store finish user/date-time and hand off to Post-Assembly QC.')
  ) @(150,370) | Out-Null

  Add-Heading $ds '3.4 Post-Assembly QC' 2 | Out-Null
  Add-Figure $ds (Join-Path $screens '04-post-assembly-queue.png') 'Figure 12 – Post-Assembly QC work queue generated from the current wireframe.' 455
  Add-Figure $ds (Join-Path $screens '04-post-assembly-detail.png') 'Figure 13 – Production Checking quantity, BAR comparison, printing and sign-off.' 455
  Add-Table $ds @('Design element','Validation/state rule') @(
    ,@('Total Packs / Total Boxes / No. of Packs Checked','Positive whole numbers are required.'),
    ,@('Per-box quantities','Required when Total Boxes > 1. Each value is a positive whole number and the sum must equal Total Packs. Save remains disabled until valid.'),
    ,@('Pack Details Against BAR','Every displayed verification row, including expiry confirmation, must be checked.'),
    ,@('Quarantine Label','Print action targets the selected batch and displays Printed/Pending status; Test Print does not complete the stage.'),
    ,@('User Sign Off','Enabled only when pack checks, quantity fields and box allocation are complete. Stores user/date-time, marks the queue row Completed and publishes to Pre-QP.')
  ) @(150,370) | Out-Null

  Add-Heading $ds '4. Logical Record Design' 1 | Out-Null
  Add-Table $ds @('Record group','Logical fields','Control') @(
    ,@('Batch identity','B&S batch, manufacturing lot, product, strength, expiry, route/status','Read-only association to selected batch.'),
    ,@('Pre-Assembly','Material confirmations, reference codes, specimen count, leaflet folds, tamper seals, MARKS/reason, comments, mock-up evidence','Committed at Pre-Assembly sign-off.'),
    ,@('Production Controller','Stock ID, Box ID verification outcome, product-label check, box count, count-change decision, room, user/date-time','Committed only by CONFIRMED BY.'),
    ,@('Assembly','Start, four page datasets/signatures, IPC/photo evidence, reconciliation, finish','Page commits plus final stage completion.'),
    ,@('Post-Assembly','Total packs/boxes, per-box quantities, packs checked, BAR comparison checks, comments, print state, sign-off','Committed at print/save/sign-off events as applicable.'),
    ,@('Audit','Event, previous/current value where amended, actor, date/time, batch, stage/page','Append-only logical audit evidence; physical storage is to be confirmed.')
  ) @(110,285,125) | Out-Null
  Add-Heading $ds '5. Security, Error and Recovery Design' 1 | Out-Null
  Add-Table $ds @('Concern','Design rule') @(
    ,@('Authorisation','The UI and authoritative transaction layer enforce role-to-stage access; display gating alone is insufficient.'),
    ,@('Session attribution','The authenticated identity, not a free-text name, supplies signature attribution.'),
    ,@('Concurrent update','Before commit, the authoritative layer revalidates that the batch/page is still editable. A conflict returns a clear refresh/retry message.'),
    ,@('Validation error','Keep the user on the current screen, identify the failing field/condition and do not alter stage status.'),
    ,@('Interrupted handheld workflow','Discard uncommitted Line Clearance completion; retain any previously committed BAR history.'),
    ,@('Print failure','Do not represent a failed controlled print as successful. Permit retry under the existing approved print-control process.'),
    ,@('Correction','Completed records are read-only in the ordinary workflow. Corrections use the approved controlled amendment route with reason and audit attribution.')
  ) @(125,395) | Out-Null
  Add-Heading $ds '6. Requirements Traceability' 1 | Out-Null
  Add-Table $ds @('URS ID','FS reference','DS reference','Verification reference') $tr @(75,130,130,150) | Out-Null
  Add-Heading $ds '7. Design Verification' 1 | Out-Null
  Add-P $ds 'Design verification shall confirm every traceability row against the implemented UI and authoritative transaction behaviour. Testing must cover role denial, incomplete forms, invalid numeric values, count-change cancellation, box-total mismatch, duplicate sign-off, interrupted handheld use, print failure, immutable completion and each stage handoff.' | Out-Null
  Add-Heading $ds '7.1 Technical items requiring confirmation before implementation' 2 | Out-Null
  Add-Bullets $ds @('Approved physical data model and retention implementation.','Identity/session integration and role mapping.','SeUIC scanner input mode, network connectivity, offline policy and device-management controls.','BAR update interface and concurrency strategy.','Controlled printer selection, label template ownership and print-result feedback.','IPC photo storage, permitted formats, limits and malware/content controls.','Environment-specific monitoring, backup and disaster-recovery controls.')
  $ds.Repaginate()
  $ds.Save(); $ds.Close($false)
  Write-Output "Created FS: $fsPath"
  Write-Output "Created DS: $dsPath"
  Write-Output "Traceable Section 4 requirements: $($requirements.Count)"
}
finally {
  if ($urs) { try {$urs.Close($false)} catch {} }
  if ($word) { try {$word.Quit()} catch {} }
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) 2>$null | Out-Null
  [gc]::Collect(); [gc]::WaitForPendingFinalizers()
}
