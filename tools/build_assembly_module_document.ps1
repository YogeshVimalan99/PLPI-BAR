param(
  [string]$OutputPath = (Join-Path (Split-Path -Parent $PSScriptRoot) 'Assembly_Module_Wireframe_Reference.docx')
)

$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent $PSScriptRoot
$shots = Join-Path $workspace 'assembly_module_document\screenshots'
$buildLog = Join-Path $workspace 'assembly_module_document\build-updated.log'
Remove-Item -LiteralPath $buildLog -Force -ErrorAction SilentlyContinue

function Set-CellShading($cell, $hex) {
  $cell.Shading.BackgroundPatternColor = [Convert]::ToInt32($hex, 16)
}

function Set-RangeFont($range, $name, $size, $color, $bold = 0) {
  $range.Font.Name = $name
  $range.Font.Size = $size
  $range.Font.Color = $color
  $range.Font.Bold = $bold
}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $word.Documents.Add()
  Add-Content -LiteralPath $buildLog -Value 'DOC_CREATED'

try {
  $section = $doc.Sections.Item(1)
  Add-Content -LiteralPath $buildLog -Value 'SECTION_READY'
  $section.PageSetup.TopMargin = 50.4
  $section.PageSetup.BottomMargin = 50.4
  $section.PageSetup.LeftMargin = 50.4
  $section.PageSetup.RightMargin = 50.4

  Add-Content -LiteralPath $buildLog -Value 'STYLES_SKIPPED'

  Add-Content -LiteralPath $buildLog -Value 'HEADER_SKIPPED'

  $sel = $word.Selection
  $sel.ParagraphFormat.SpaceAfter = 0
  $sel.TypeParagraph()
  $sel.Font.Name = 'Calibri'
  $sel.Font.Size = 9
  $sel.Font.Bold = -1
  $sel.Font.Color = 0xB5742E
  $sel.TypeText('WIREFRAME REFERENCE GUIDE')
  $sel.TypeParagraph()
  $sel.Font.Size = 25
  $sel.Font.Bold = -1
  $sel.Font.Color = 0x45250B
  $sel.TypeText('Assembly Module')
  $sel.TypeParagraph()
  $sel.Font.Size = 14
  $sel.Font.Bold = 0
  $sel.Font.Color = 0x666666
  $sel.TypeText('Current-state context, functionality and screen inventory')
  $sel.TypeParagraph()
  $sel.Font.Size = 9.5
  $sel.TypeText('PLPI Batch Assembly Record workflow  |  Stage 11  |  Updated 19 August 2026')
  $sel.TypeParagraph()
  $sel.TypeParagraph()

  $table = $doc.Tables.Add($sel.Range, 1, 3)
  $table.AllowAutoFit = $false
  $table.Columns.Item(1).Width = 168
  $table.Columns.Item(2).Width = 168
  $table.Columns.Item(3).Width = 168
  $table.Borders.Enable = 0
  $labels = @(
    @('ENTRY','Allocated assembly room'),
    @('OWNER','Assembly Team'),
    @('NEXT','Post-Assembly QC')
  )
  for ($i=1; $i -le 3; $i++) {
    $cell = $table.Cell(1,$i)
    $cell.Range.Text = "$($labels[$i-1][0])`r$($labels[$i-1][1])"
    $cell.Range.Font.Name = 'Calibri'
    $cell.Range.Font.Size = 9.5
    $cell.Range.Font.Color = 0x45250B
    $cell.Range.ParagraphFormat.SpaceAfter = 2
    $cell.VerticalAlignment = 1
    Set-CellShading $cell 'E8EEF5'
  }
  $sel.SetRange($doc.Content.End-1,$doc.Content.End-1)
  $sel.TypeParagraph()

  function Add-Heading([string]$text, [int]$level=1) {
    $sel.Style = -1 - $level
    $sel.Font.Name = 'Calibri'
    $sel.Font.Bold = -1
    $sel.Font.Size = if($level -eq 1){16}elseif($level -eq 2){13}else{12}
    $sel.Font.Color = if($level -lt 3){0xB5742E}else{0x784D1F}
    $sel.ParagraphFormat.SpaceBefore = if($level -eq 1){18}elseif($level -eq 2){14}else{10}
    $sel.ParagraphFormat.SpaceAfter = if($level -eq 1){10}elseif($level -eq 2){7}else{5}
    $sel.TypeText($text)
    $sel.TypeParagraph()
    $sel.Style = -1
  }
  function Add-Body([string]$text) {
    $sel.Style = -1
    $sel.Font.Name = 'Calibri'; $sel.Font.Size = 10.5; $sel.Font.Bold = 0; $sel.Font.Color = 0
    $sel.ParagraphFormat.SpaceAfter = 6
    $sel.TypeText($text)
    $sel.TypeParagraph()
  }
  function Add-Bullet([string]$text) {
    $sel.Style = -49
    $sel.Font.Name = 'Calibri'; $sel.Font.Size = 10.5; $sel.Font.Bold = 0; $sel.Font.Color = 0
    $sel.ParagraphFormat.SpaceAfter = 4
    $sel.TypeText($text)
    $sel.TypeParagraph()
    $sel.Style = -1
  }
  function Add-Screenshot([string]$file, [string]$caption) {
    $sel.ParagraphFormat.KeepWithNext = -1
    $sel.Font.Name='Calibri'; $sel.Font.Size=9; $sel.Font.Bold=-1; $sel.Font.Color=0x666666
    $sel.TypeText($caption)
    $sel.TypeParagraph()
    $sel.ParagraphFormat.Alignment = 1
    $shape = $sel.InlineShapes.AddPicture((Join-Path $shots $file), $false, $true)
    $shape.LockAspectRatio = -1
    $shape.Width = 490
    if ($shape.Height -gt 300) { $shape.Height = 300 }
    $sel.SetRange($doc.Content.End-1,$doc.Content.End-1)
    $sel.TypeParagraph()
    $sel.ParagraphFormat.Alignment = 0
    $sel.ParagraphFormat.KeepWithNext = 0
  }

  Add-Heading '1. Module context' 1
  Add-Content -LiteralPath $buildLog -Value 'CONTENT_START'
  Add-Body 'The Assembly module is Stage 11 of the electronic Batch Assembly Record workflow. It receives batches after Production Control has completed verification and room allocation. Its controlled output is a completed, reconciled and electronically signed assembly record ready for Post-Assembly QC.'
  Add-Body 'Workflow position: Pre-Assembly QC -> Production Control / Room Allocation -> Assembly Room -> Post-Assembly QC -> Pre-QP -> QP Release.'

  Add-Heading '2. Business purpose' 1
  foreach ($item in @(
    'Confirm that the correct batch, product, specimen and printed components are present in the allocated room.',
    'Record the batch start, team briefing and pre-start verification.',
    'Perform random sample and in-process checks during assembly.',
    'Reconcile issued, used, damaged and discrepant materials.',
    'Complete end-of-batch room clearance and retain an electronic audit trail.',
    'Move the finished batch to Post-Assembly QC only after all four pages are signed.'
  )) { Add-Bullet $item }

  Add-Heading '3. End-to-end user journey' 1
  $journey = @(
    @('1','Find batch','Search the active queue by B&S batch number or manufacturing lot.'),
    @('2','Start batch','Confirm start; capture logged-in user and timestamp.'),
    @('3','Initial checks','Verify BAR, specimen, allocated room and received printed materials.'),
    @('4','Sample check','Confirm lot and expiry for each box received from Production Control.'),
    @('5','IPC checks','Complete time-based in-process checks; add extra IPC rows if needed.'),
    @('6','Reconcile','Record quantities received, used, damaged and discrepant; confirm room clearance.'),
    @('7','Finish batch','Sign all four pages, record finish audit data and hand off to Post-Assembly QC.')
  )
  $jt = $doc.Tables.Add($sel.Range, $journey.Count+1, 3)
  $jt.AllowAutoFit=$false; $jt.Columns.Item(1).Width=42; $jt.Columns.Item(2).Width=105; $jt.Columns.Item(3).Width=357
  @('Step','User action','System behaviour') | ForEach-Object -Begin {$c=1} -Process { $jt.Cell(1,$c).Range.Text=$_; Set-CellShading $jt.Cell(1,$c) 'E8EEF5'; $c++ }
  for($r=0;$r -lt $journey.Count;$r++){ for($c=0;$c -lt 3;$c++){ $jt.Cell($r+2,$c+1).Range.Text=$journey[$r][$c] } }
  $jt.Range.Font.Name='Calibri'; $jt.Range.Font.Size=9; $jt.Rows.Item(1).Range.Font.Bold=-1
  $jt.Range.ParagraphFormat.SpaceAfter=2
  $sel.SetRange($doc.Content.End-1,$doc.Content.End-1); $sel.TypeParagraph()

  Add-Heading '4. Screen inventory' 1
  Add-Heading '4.1 Assembly batch queue' 2
  Add-Body 'Shows active and completed batches, batch/lot identifiers, description, quantity, allocated room, status and action. Search, refresh and queue tabs are interactive. The screen also presents check-in, check-out, break and partial-batch attendance controls with staff status rows.'
  Add-Screenshot '01-assembly-batch-queue.png' 'Figure 1. Assembly Room workflow - active and completed batch queue'
  Add-Content -LiteralPath $buildLog -Value 'SCREEN_1'

  $sel.InsertBreak(7)
  Add-Heading '4.2 Start batch confirmation' 2
  $sel.TypeParagraph()
  Add-Body 'Opening a batch that has not yet started raises a confirmation dialog. Accepting it records the current user and date/time as the Assembly Room batch start.'
  Add-Screenshot '02-start-batch-confirmation.png' 'Figure 2. Start Batch confirmation and audit message'
  Add-Content -LiteralPath $buildLog -Value 'SCREEN_2'

  $sel.InsertBreak(7)
  Add-Heading '4.3 Initial Checks' 2
  Add-Body 'Displays the batch identity strip, allocated room, lifecycle audit fields, briefing field and confirmations for the BAR, specimen and received materials. The page sign-off remains disabled until every required checkbox is selected.'
  Add-Screenshot '03-initial-checks.png' 'Figure 3. Initial Checks and received-material verification'
  Add-Content -LiteralPath $buildLog -Value 'SCREEN_3'

  $sel.InsertBreak(7)
  Add-Heading '4.4 Random Sample Check' 2
  $sel.SetRange($doc.Content.End-1,$doc.Content.End-1)
  $sel.TypeParagraph()
  Add-Body 'Creates one confirmation row per box passed from Production Control. Manufacturing lot and expiry are populated from the BAR details.'
  Add-Screenshot '04-random-sample-check.png' 'Figure 4. Random sample confirmation by box'
  Add-Content -LiteralPath $buildLog -Value 'SCREEN_4'

  $sel.InsertBreak(7)
  Add-Heading '4.5 IPC Checks' 2
  Add-Body 'Displays estimated assembly time, minimum IPC count and scheduled checks. Operators can complete check rows, add extra IPC rows and attach photo evidence to the relevant check.'
  Add-Screenshot '05-ipc-checks.png' 'Figure 5. In-process checks and product identity strip'
  Add-Content -LiteralPath $buildLog -Value 'SCREEN_5'

  $sel.InsertBreak(7)
  Add-Heading '4.6 Reconciliation and Closure' 2
  $sel.TypeParagraph()
  Add-Body 'Captures component quantities received, used, damaged and discrepant. It also records total use, retention sample, yield, damages and comments, followed by end-of-batch room-clearance confirmations.'
  Add-Screenshot '06-reconciliation-closure.png' 'Figure 6. Material reconciliation and end-of-batch clearance'
  Add-Content -LiteralPath $buildLog -Value 'SCREEN_6'

  Add-Heading '5. Functional requirements represented in the wireframe' 1
  $requirements = @(
    @('Queue management','Interactive active/completed queues, search, refresh, room/status visibility','Interactive'),
    @('Attendance','Check in/out, break and partial-batch activity feedback with staff status','Interactive prototype'),
    @('Lifecycle audit','Start and finish user/date/time records','Interactive'),
    @('Initial verification','BAR, specimen, room and component confirmation','Interactive with gating'),
    @('Random samples','One confirmation per allocated box','Interactive with gating'),
    @('IPC','Calculated minimum checks, additional rows and photo evidence capture','Interactive'),
    @('Reconciliation','Received, used, damages, discrepancy, yield and comments','Interactive; discrepancy auto-calculated'),
    @('Clearance','Four end-of-batch clearance checks','Interactive with gating'),
    @('Electronic sign-off','User/timestamp per page; page locks after sign-off','Interactive prototype'),
    @('Handoff','Moves completed batch to Post-Assembly QC','Interactive prototype')
  )
  $rt=$doc.Tables.Add($sel.Range,$requirements.Count+1,3)
  $rt.AllowAutoFit=$false; $rt.Columns.Item(1).Width=115; $rt.Columns.Item(2).Width=285; $rt.Columns.Item(3).Width=104
  @('Capability','Current behaviour','Maturity') | ForEach-Object -Begin {$c=1} -Process { $rt.Cell(1,$c).Range.Text=$_; Set-CellShading $rt.Cell(1,$c) 'E8EEF5'; $c++ }
  for($r=0;$r -lt $requirements.Count;$r++){ for($c=0;$c -lt 3;$c++){ $rt.Cell($r+2,$c+1).Range.Text=$requirements[$r][$c] } }
  $rt.Range.Font.Name='Calibri'; $rt.Range.Font.Size=8.8; $rt.Rows.Item(1).Range.Font.Bold=-1; $rt.Range.ParagraphFormat.SpaceAfter=2
  $sel.SetRange($doc.Content.End-1,$doc.Content.End-1); $sel.TypeParagraph()

  Add-Heading '6. Rules and completion gates' 1
  foreach($item in @(
    'The Initial Checks page cannot be signed until all material and pre-start confirmations are complete.',
    'The Random Sample Check page cannot be signed until every box is confirmed.',
    'The IPC page cannot be signed until all displayed IPC checks are complete.',
    'Reconciliation cannot be signed until its required checks and quantity fields are complete.',
    'Each signed page is locked and displays the signing user and timestamp.',
    'Signing the fourth page triggers Finish Batch confirmation and the Post-Assembly QC handoff.'
  )) { Add-Bullet $item }

  Add-Heading '7. Current prototype gaps to address in redesign' 1
  foreach($item in @(
    'Barcode scanning is displayed but has no scan validation or error-handling workflow.',
    'There is no deviation, investigation or supervisor-override workflow for a non-zero discrepancy.',
    'Electronic sign-off is represented by a confirmation dialog rather than validated re-authentication.',
    'Prototype records are in memory and do not demonstrate durable storage, versioning or audit export.',
    'Attendance controls provide prototype feedback but are not connected to a persistent workforce or timekeeping service.',
    'The reconciliation table pre-populates repeated example quantities across material types and needs component-specific data binding.'
  )) { Add-Bullet $item }

  Add-Heading '8. AI redesign brief' 1
  Add-Body 'Redesign the Assembly module as a tablet-friendly, GxP-aware workflow for operators working in an allocated room. Preserve traceability and completion gates while reducing visual density and making the current task, outstanding requirements and exceptions immediately visible.'
  Add-Heading 'Essential redesign outcomes' 2
  foreach($item in @(
    'A clear progress stepper for Initial Checks, Samples, IPC and Reconciliation.',
    'Persistent batch identity, room, quantity, status and active operator context.',
    'Scan-first batch/component verification with visible match or mismatch feedback.',
    'Large touch targets and a focused task view suitable for tablets and handheld devices.',
    'Component-specific reconciliation with live expected balance and prominent discrepancy status.',
    'Evidence capture attached to the relevant IPC, exception or component row.',
    'A dedicated exception path with reason, evidence, supervisor review and resolution status.',
    'Validated electronic signature, audit history and clear locked/read-only states.',
    'Offline/interruption recovery, draft state and safe resume behaviour.',
    'Accessible colour contrast with status communicated by text and icon as well as colour.'
  )) { Add-Bullet $item }

  $sel.InsertBreak(7)
  Add-Heading 'Suggested prompt for a design AI' 2
  $promptText = 'Using the supplied Assembly Module reference document and screenshots, redesign the Stage 11 Assembly Room workflow for a regulated pharmaceutical batch-record system. Create a desktop and tablet design with an active-batch queue, scan-first batch start, four-step guided checklist, component-level reconciliation, IPC evidence capture, exception handling, validated electronic signatures and a complete audit trail. Preserve all displayed batch identifiers and completion gates, but simplify hierarchy, reduce dense tables and make incomplete, warning, discrepancy, signed and locked states unambiguous. Produce screen variants for normal flow, mismatch, non-zero discrepancy, evidence upload, signature confirmation and completed handoff.'
  $callout=$doc.Tables.Add($sel.Range,1,1); $callout.AllowAutoFit=$false; $callout.Columns.Item(1).Width=504; $callout.Cell(1,1).Range.Text=$promptText; Set-CellShading $callout.Cell(1,1) 'F4F6F9'; $callout.Cell(1,1).Range.Font.Name='Calibri'; $callout.Cell(1,1).Range.Font.Size=9.5; $callout.Cell(1,1).Range.ParagraphFormat.SpaceAfter=2
  $sel.SetRange($doc.Content.End-1,$doc.Content.End-1); $sel.TypeParagraph()

  Add-Content -LiteralPath $buildLog -Value 'BEFORE_SAVE'
  $doc.SaveAs2($OutputPath,16)
  Add-Content -LiteralPath $buildLog -Value 'AFTER_SAVE'
}
finally {
  $doc.Close($false)
  $word.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) | Out-Null
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
  [GC]::Collect(); [GC]::WaitForPendingFinalizers()
}

Write-Output $OutputPath
















