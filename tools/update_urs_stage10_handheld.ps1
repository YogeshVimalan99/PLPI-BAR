$ErrorActionPreference = 'Stop'

$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$path = Join-Path $root 'Phase 3 Doc\URS-PLPI BAR - Pre-Assembly Production Control Assembly and Post-Assembly QC.docx'
$wdColorNavy = 8388608
$wdColorDarkBlue = 6299648

$requirements = @(
    @('4.2.1', 'The Production Controller shall use the authorised SeUIC handheld workflow for Stage 10 stock take-out, line-clearance confirmation and assembly-room allocation.'),
    @('4.2.2', 'The handheld workflow shall allow the Production Controller to open STOCK TAKE OUT from the GOODS IN menu.'),
    @('4.2.3', 'The Production Controller shall be able to scan or enter the stock ID for the batch being transferred.'),
    @('4.2.4', 'After stock-ID entry, the handheld shall display the product name, part number, batch number, Goods In boxes, quantity, location, IMP and contract for verification.'),
    @('4.2.5', 'The Production Controller shall select TRANSFER to start box verification for the displayed stock.'),
    @('4.2.6', 'The handheld shall prompt the Production Controller to scan or enter the Box ID before the transfer can continue.'),
    @('4.2.7', 'The handheld shall prevent Box ID confirmation when the Box ID is blank and shall allow the user to confirm or cancel the verification prompt.'),
    @('4.2.8', 'Successful Box ID confirmation shall open a new Line Clearance form for the selected stock.'),
    @('4.2.9', 'The Line Clearance form shall require confirmation that the product name, expiry date and lot size on the box label have been checked.'),
    @('4.2.10', 'The Line Clearance form shall display the Goods In box count and require the Production Controller to confirm the number of boxes.'),
    @('4.2.11', 'The confirmed number of boxes shall accept only a positive whole number.'),
    @('4.2.12', 'When the confirmed box count is changed, the handheld shall require confirmation of the original and revised values before the change is accepted.'),
    @('4.2.13', 'Cancelling a box-count change shall restore the last confirmed box count and shall not update the BAR.'),
    @('4.2.14', 'The Production Controller shall select the assembly room assigned to the batch before completion.'),
    @('4.2.15', 'The CONFIRMED BY action shall remain disabled until both Line Clearance checks are complete, the box count is valid with no pending change, and an assembly room is selected.'),
    @('4.2.16', 'CONFIRMED BY shall update the BAR with the stock ID, batch number, product, confirmed box count, assigned room, completed checks, confirming user and date/time.'),
    @('4.2.17', 'After confirmation, the handheld shall display BAR UPDATED and shall show the confirming user, date/time and assigned room.'),
    @('4.2.18', 'A completed Line Clearance record shall be read-only on the handheld and shall not pre-fill a new Line Clearance form for a later transfer.'),
    @('4.2.19', 'A confirmed room allocation shall make the batch available to the assigned Assembly Room workflow.'),
    @('4.2.20', 'Using Back, Cancel or Power before CONFIRMED BY shall not create a completed Line Clearance or room-allocation record.')
)

$oldAccess = 'Access shall be role based and approved before use. Pre-Assembly QC users shall complete the Stage 9 checks and reference-sample record. Production Controllers shall perform the Stage 10 random-sample check and allocate rooms. Assembly Room users shall access only batches allocated to their room and complete the controlled Assembly pages. Post-Assembly QC users shall perform Stage 12 verification, quarantine-label actions and handoff. QA/QP, Operations and authorised support users shall have review, exception, reporting or administration access consistent with approved responsibilities.'
$newAccess = 'Access shall be role based and approved before use. Pre-Assembly QC users shall complete the Stage 9 checks and reference-sample record. Production Controllers shall use the authorised SeUIC handheld to complete stock take-out, Box ID verification, Line Clearance, confirmed box count and assembly-room allocation. Assembly Room users shall access only batches allocated to their room and complete the controlled Assembly pages. Post-Assembly QC users shall perform Stage 12 verification, quarantine-label actions and handoff. QA/QP, Operations and authorised support users shall have review, exception, reporting or administration access consistent with approved responsibilities.'

$oldTesting = 'The PLPI system owner shall coordinate risk-based verification with IT, QA and Operations. Testing shall trace to every approved URS requirement and shall include positive, negative, boundary and role-access scenarios. Testing shall confirm entry criteria; queue search and status; batch identity; Pre-Assembly component, leaflet, sample and mock-up checks; recorded quantities and change reasons; Production Control sample checks and room allocation; Assembly start, attendance, page gating, locking and safe resume; box-level sample checks; IPC scheduling, extra rows, evidence and failed checks; break and partial-finish behavior; component reconciliation, discrepancy and yield controls; Post-Assembly sampling, full quantity and per-box allocation; quarantine-label generation, void and reprint; stage removal and handoff; exception controls; audit trail; record locking; and technical-failure behavior.'
$newTesting = 'The PLPI system owner shall coordinate risk-based verification with IT, QA and Operations. Testing shall trace to every approved URS requirement and shall include positive, negative, boundary and role-access scenarios. Testing shall confirm entry criteria; queue search and status; batch identity; Pre-Assembly component, leaflet, sample and mock-up checks; recorded quantities and change reasons; SeUIC handheld STOCK TAKE OUT navigation; stock-ID entry; displayed product and stock data; TRANSFER; Box ID entry, blank validation, confirmation and cancellation; Line Clearance checks; positive whole-number box validation; box-count change confirmation and cancellation; assembly-room selection; CONFIRMED BY gating; BAR update, record locking and Assembly Room handoff; Assembly start, attendance, page gating, locking and safe resume; box-level sample checks; IPC scheduling, extra rows, evidence and failed checks; break and partial-finish behavior; component reconciliation, discrepancy and yield controls; Post-Assembly sampling, full quantity and per-box allocation; quarantine-label generation, void and reprint; stage removal and handoff; exception controls; audit trail; record locking; and technical-failure behavior.'

$oldDocs = 'Applicable SOPs, work instructions, BAR forms, sampling instructions, training material, validation records and controlled project documents shall be created or updated to describe Pre-Assembly QC, room allocation, assembly start and attendance, sample and IPC checks, evidence, breaks and partial completion, reconciliation, Post-Assembly QC, quarantine-label handling, exceptions, corrections and electronic sign-off. Users shall complete role-appropriate training before access is granted. Superseded paper steps shall be retired only through approved change control and document control.'
$newDocs = 'Applicable SOPs, work instructions, BAR forms, sampling instructions, training material, validation records and controlled project documents shall be created or updated to describe Pre-Assembly QC; SeUIC handheld STOCK TAKE OUT, Box ID verification, Line Clearance, box-count confirmation and room allocation; assembly start and attendance; sample and IPC checks; evidence; breaks and partial completion; reconciliation; Post-Assembly QC; quarantine-label handling; exceptions; corrections; and electronic sign-off. Users shall complete role-appropriate training before access is granted. Superseded paper steps shall be retired only through approved change control and document control.'

$oldSupport = 'IT shall provide controlled support for PLPI configuration, user access, room and workflow configuration, scanners, cameras, printers, electronic BAR records, evidence, audit history, backup/recovery and incident resolution. Operational and QA/QP stakeholders shall own process use, master-data accuracy, sampling and reconciliation rules, controlled exception decisions and periodic review. Support activities that change regulated configuration or records shall follow approved change and incident procedures.'
$newSupport = 'IT shall provide controlled support for PLPI configuration, user access, room and workflow configuration, SeUIC handheld devices, barcode scanning, cameras, printers, electronic BAR records, evidence, audit history, backup/recovery and incident resolution. Operational and QA/QP stakeholders shall own process use, master-data accuracy, sampling and reconciliation rules, controlled exception decisions and periodic review. Support activities that change regulated configuration or records shall follow approved change and incident procedures.'

$word = $null
$doc = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open($path, $false, $false)
    $doc.TrackRevisions = $false

    foreach ($paragraph in @($doc.Paragraphs)) {
        $text = ($paragraph.Range.Text -replace '[\r\a]', '').Trim()
        if ($text -eq '4.2 Production Control / Room Allocation') {
            $paragraph.Range.Text = "4.2 Production Controller Handheld / Room Allocation`r"
        }
        elseif ($text -eq $oldAccess) { $paragraph.Range.Text = "$newAccess`r" }
        elseif ($text -eq $oldTesting) { $paragraph.Range.Text = "$newTesting`r" }
        elseif ($text -eq $oldDocs) { $paragraph.Range.Text = "$newDocs`r" }
        elseif ($text -eq $oldSupport) { $paragraph.Range.Text = "$newSupport`r" }
    }

    $targetTable = $null
    foreach ($table in @($doc.Tables)) {
        if ($table.Rows.Count -gt 1) {
            $firstId = ($table.Cell(2,1).Range.Text -replace '[\r\a]', '').Trim()
            if ($firstId -match '^4\.2\.') { $targetTable = $table; break }
        }
    }
    if (-not $targetTable) { throw 'Could not locate the current Section 4.2 requirement table.' }

    while ($targetTable.Rows.Count -gt 1) { $targetTable.Rows.Item(2).Delete() }
    foreach ($requirement in $requirements) {
        $row = $targetTable.Rows.Add()
        $row.Cells.Item(1).Range.Text = $requirement[0]
        $row.Cells.Item(2).Range.Text = $requirement[1]
    }
    $targetTable.Range.Style = 'Normal'
    $targetTable.Style = 'Table Grid'
    $targetTable.AllowAutoFit = $false
    $targetTable.PreferredWidthType = 3
    $targetTable.PreferredWidth = 489
    $targetTable.Columns.Item(1).SetWidth(77, 0)
    $targetTable.Columns.Item(2).SetWidth(412, 0)
    $targetTable.Rows.SetLeftIndent(-22, 0)
    $targetTable.Range.Font.Name = 'Verdana'
    $targetTable.Range.Font.Size = 11
    $targetTable.Range.Font.Color = $wdColorDarkBlue
    $targetTable.Range.ParagraphFormat.SpaceBefore = 0
    $targetTable.Range.ParagraphFormat.SpaceAfter = 0
    $targetTable.Range.ParagraphFormat.LineSpacing = 13.8
    $targetTable.Range.ParagraphFormat.KeepWithNext = 0
    $targetTable.Range.ParagraphFormat.KeepTogether = 0
    $targetTable.Rows.Item(1).Range.Bold = -1
    $targetTable.Rows.Item(1).Range.Font.Color = 16777215
    $targetTable.Rows.Item(1).Shading.BackgroundPatternColor = $wdColorNavy
    $targetTable.Rows.Item(1).HeadingFormat = -1

    $revisionTable = $null
    foreach ($table in @($doc.Tables)) {
        $first = ($table.Cell(1,1).Range.Text -replace '[\r\a]', '').Trim()
        if ($first -eq 'Version' -and $table.Columns.Count -ge 4) { $revisionTable = $table; break }
    }
    if ($revisionTable) {
        $alreadyAdded = $false
        for ($r = 2; $r -le $revisionTable.Rows.Count; $r++) {
            if ((($revisionTable.Cell($r,1).Range.Text -replace '[\r\a]', '').Trim()) -eq '2') { $alreadyAdded = $true }
        }
        if (-not $alreadyAdded) {
            $row = $revisionTable.Rows.Add()
            $row.Cells.Item(1).Range.Text = '2'
            $row.Cells.Item(2).Range.Text = '1'
            $row.Cells.Item(3).Range.Text = 'Replaced the Stage 10 desktop Production Control check with the approved SeUIC handheld Stock Take Out, Box ID verification, Line Clearance, box-count confirmation and room-allocation workflow.'
            $row.Cells.Item(4).Range.Text = 'Draft - Aug 2026'
        }
    }

    if ($doc.TablesOfContents.Count -gt 0) { $doc.TablesOfContents.Item(1).Update() }
    $doc.Fields.Update() | Out-Null
    $doc.Repaginate()
    $doc.Save()
    Write-Output "Updated $path with $($doc.ComputeStatistics(2)) pages."
}
finally {
    if ($doc) { $doc.Close($true) }
    if ($word) { $word.Quit() }
    if ($doc) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) }
    if ($word) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
