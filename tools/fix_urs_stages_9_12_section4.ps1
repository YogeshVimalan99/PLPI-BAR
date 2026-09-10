$ErrorActionPreference = 'Stop'

$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$path = Join-Path $root 'Phase 3 Doc\URS-PLPI BAR - Pre-Assembly Production Control Assembly and Post-Assembly QC.docx'

$wdCollapseEnd = 0
$wdAlignJustify = 3
$wdCellAlignVerticalCenter = 1
$wdColorNavy = 8388608
$wdColorDarkBlue = 6299648

function Add-Paragraph {
    param($selection, [string]$text, [string]$style = 'Normal')
    $selection.Style = $style
    $selection.ParagraphFormat.Alignment = $(if ($style -eq 'Normal') { $wdAlignJustify } else { 0 })
    $selection.Font.Bold = $(if ($style -like 'Heading*') { -1 } else { 0 })
    $selection.TypeText($text)
    $selection.TypeParagraph()
    $selection.Font.Bold = 0
}

function Add-RequirementTable {
    param($doc, $selection, [object[]]$requirements)
    $rows = @()
    $rows += ,@('URS ID', 'Requirements')
    foreach ($requirement in $requirements) { $rows += ,$requirement }

    $table = $doc.Tables.Add($selection.Range, $rows.Count, 2)
    $table.Style = 'Table Grid'
    $table.AllowAutoFit = $false
    $table.Borders.Enable = $true
    $table.Columns.Item(1).PreferredWidth = 77
    $table.Columns.Item(2).PreferredWidth = 412
    $table.Rows.SetLeftIndent(-22, 0)
    $table.Range.Font.Name = 'Verdana'
    $table.Range.Font.Size = 11
    $table.Range.Font.Color = $wdColorDarkBlue
    $table.Range.ParagraphFormat.SpaceBefore = 0
    $table.Range.ParagraphFormat.SpaceAfter = 0
    $table.Range.ParagraphFormat.LineSpacing = 13.8
    $table.Range.Cells.VerticalAlignment = $wdCellAlignVerticalCenter
    $table.TopPadding = 2
    $table.BottomPadding = 2
    $table.LeftPadding = 5.4
    $table.RightPadding = 5.4

    for ($r = 1; $r -le $rows.Count; $r++) {
        $table.Cell($r, 1).Range.Text = [string]$rows[$r - 1][0]
        $table.Cell($r, 2).Range.Text = [string]$rows[$r - 1][1]
    }
    $table.Rows.Item(1).Range.Bold = -1
    $table.Rows.Item(1).Range.Font.Color = 16777215
    $table.Rows.Item(1).Shading.BackgroundPatternColor = $wdColorNavy
    $table.Rows.Item(1).HeadingFormat = -1

    $range = $table.Range
    $range.Collapse($wdCollapseEnd)
    $range.Select()
    $selection.TypeParagraph()
}

function Add-RequirementSection {
    param($doc, $selection, [string]$heading, [object[]]$requirements)
    Add-Paragraph $selection $heading 'Heading 2'
    Add-RequirementTable $doc $selection $requirements
}

$requirements41 = @(
    @('4.1.1', 'The Pre-Assembly QC module shall display only batches that have completed the required printing, route-specific preparation and Leaflet Folding activities.'),
    @('4.1.2', 'The Pre-Assembly QC user shall be able to search for a batch by B&S batch number or manufacturing lot number.'),
    @('4.1.3', 'The Pre-Assembly QC module shall display the selected product name, strength, pack size, B&S batch number, manufacturing lot number, expiry date, quantity and route.'),
    @('4.1.4', 'The system shall require the user to confirm that the selected batch is active before Pre-Assembly QC checks begin.'),
    @('4.1.5', 'The system shall provide access to the approved BAR, Product Check Log and applicable supporting references for the selected batch.'),
    @('4.1.6', 'The system shall require Pre-Assembly line-clearance confirmation before user sign-off.'),
    @('4.1.7', 'The user shall confirm that all applicable printed labels are present and agree with the BAR and approved label references.'),
    @('4.1.8', 'The user shall confirm the product sample against the BAR and Product Check Log, including product identity, pack size, batch details and expiry date.'),
    @('4.1.9', 'The user shall confirm the printed or folded leaflet against the applicable approved leaflet reference.'),
    @('4.1.10', 'The user shall confirm braille, carton and other route-specific component details where applicable.'),
    @('4.1.11', 'The system shall make the approved assembly mock-up available for viewing or controlled printing.'),
    @('4.1.12', 'The user shall record the number of specimens, leaflet folds and tamper seals per pack where applicable.'),
    @('4.1.13', 'The user shall record blank-label, butter-paper or other approved sample-preparation quantities and comments where applicable.'),
    @('4.1.14', 'The system shall require a reason when a recorded marks or sample-preparation value differs from the approved reference value.'),
    @('4.1.15', 'The user shall confirm that the assembly reference sample has been prepared using the approved mock-up and applicable components.'),
    @('4.1.16', 'The system shall prevent Pre-Assembly QC completion while any mandatory check is incomplete or any product, label, leaflet, sample, braille, carton or mock-up mismatch remains unresolved.'),
    @('4.1.17', 'Pre-Assembly QC sign-off shall capture the authenticated user, role and date/time and shall lock the completed record from ordinary amendment.'),
    @('4.1.18', 'Completed Pre-Assembly QC batches shall be removed from the active queue and made available to Production Control / Room Allocation.')
)

$requirements42 = @(
    @('4.2.1', 'The Production Control module shall display only batches with completed Pre-Assembly QC status.'),
    @('4.2.2', 'The Production Controller shall be able to search for a batch by B&S batch number or manufacturing lot number.'),
    @('4.2.3', 'The Production Control module shall display the selected product, batch, expiry, quantity, box and Pre-Assembly QC information required for allocation.'),
    @('4.2.4', 'The system shall provide access to the BAR, prepared reference sample and applicable box or component information.'),
    @('4.2.5', 'The Production Controller shall confirm a random sample from the received batch against the BAR and approved reference sample.'),
    @('4.2.6', 'The random-sample check shall confirm product name, strength, pack size, manufacturing lot number, expiry date, quantity and label or reference details where applicable.'),
    @('4.2.7', 'The Production Controller shall record and confirm the number of boxes received.'),
    @('4.2.8', 'The Production Controller shall select or record the assembly room allocated to the batch.'),
    @('4.2.9', 'The system shall prevent room allocation while the sample, stock, BAR, box quantity or reference details do not match.'),
    @('4.2.10', 'Production Control sign-off shall capture the authenticated user, role, allocated room, box count and date/time.'),
    @('4.2.11', 'A room allocation change shall retain the previous room, new room, reason, authorised user and date/time.'),
    @('4.2.12', 'Completed Production Control batches shall be removed from the active allocation queue and displayed in the allocated Assembly Room queue.')
)

$requirements43 = @(
    @('4.3.1', 'The Assembly Room module shall display active batches allocated to the selected room and shall provide a separate completed-batch view.'),
    @('4.3.2', 'The Assembly Room user shall be able to search by B&S batch number, manufacturing lot number or product identity.'),
    @('4.3.3', 'The Assembly Room module shall display the selected batch identity, product, quantity, allocated room and current assembly status.'),
    @('4.3.4', 'Starting a batch shall require user confirmation and shall capture the authenticated user, allocated room and start date/time.'),
    @('4.3.5', 'The system shall prevent a batch from starting in a room other than its authorised allocation.'),
    @('4.3.6', 'The user shall confirm line clearance and the correct BAR, labels, leaflets, components, reference sample and mock-up before assembly begins.'),
    @('4.3.7', 'The user shall confirm completion of the assembly-team briefing, and the system shall record the confirming user and date/time.'),
    @('4.3.8', 'The system shall record operator check-in and check-out against the applicable assembly room.'),
    @('4.3.9', 'The Assembly Room workflow shall contain the controlled pages Initial Checks, Random Sample Check, IPC Checks and Reconciliation & Closure.'),
    @('4.3.10', 'The Initial Checks page shall not be signed until all mandatory pre-start confirmations are complete.'),
    @('4.3.11', 'The Random Sample Check page shall provide one required confirmation for each box received from Production Control.'),
    @('4.3.12', 'The user shall confirm the manufacturing lot number and expiry date for each applicable box.'),
    @('4.3.13', 'The IPC page shall display the minimum required in-process checks and their planned or due times.'),
    @('4.3.14', 'The user shall be able to add an additional IPC check where operationally required.'),
    @('4.3.15', 'Each IPC check shall record the batch, check sequence or time, completing user and completion date/time.'),
    @('4.3.16', 'The user shall compare the selected completed pack with the approved reference sample or mock-up during each required IPC check.'),
    @('4.3.17', 'The system shall allow photo evidence to be attached to the relevant IPC check.'),
    @('4.3.18', 'A failed IPC check shall place the affected assembly activity on hold until an authorised resolution is recorded.'),
    @('4.3.19', 'Each Assembly Room page shall require user sign-off and shall capture the signing user and date/time.'),
    @('4.3.20', 'A signed Assembly Room page shall be locked from ordinary amendment and shall display its completed status.'),
    @('4.3.21', 'The system shall allow an active batch to be placed on a controlled break and resumed with the user and date/time recorded.'),
    @('4.3.22', 'The system shall allow a partial finish to be recorded with the completed quantity and shall retain the remaining quantity for later resumption.'),
    @('4.3.23', 'The Reconciliation & Closure page shall identify each applicable material or component and its issued or approved quantity.'),
    @('4.3.24', 'The user shall record received, used, damaged, discrepant, surplus, leftover and extra-component quantities where applicable.'),
    @('4.3.25', 'The system shall calculate or display the expected balance, actual balance, discrepancy and yield required for reconciliation.'),
    @('4.3.26', 'A non-zero discrepancy or unacceptable yield shall require a reason and authorised resolution before final completion.'),
    @('4.3.27', 'The user shall confirm end-of-batch room clearance and the removal or disposition of remaining materials.'),
    @('4.3.28', 'The system shall prevent final Assembly Room completion until all four controlled pages are signed and reconciliation is complete.'),
    @('4.3.29', 'Final Assembly Room completion shall capture the authenticated user and finish date/time and shall retain a read-only lifecycle summary.'),
    @('4.3.30', 'Completed Assembly Room batches shall be removed from the active queue and made available to Post-Assembly QC.')
)

$requirements44 = @(
    @('4.4.1', 'The Post-Assembly QC module shall display only batches with completed Assembly Room checks, IPC records and reconciliation.'),
    @('4.4.2', 'The Post-Assembly QC user shall be able to search for a batch by B&S batch number or manufacturing lot number.'),
    @('4.4.3', 'The Post-Assembly QC module shall display the selected product, batch, expiry, assembled quantity, box details and Assembly Room completion status.'),
    @('4.4.4', 'The system shall provide access to the approved BAR, mock-up, IPC evidence and Assembly Room reconciliation record.'),
    @('4.4.5', 'The user shall confirm batch segregation and Post-Assembly line clearance before sign-off.'),
    @('4.4.6', 'The system shall present or require the number of sample packs to be checked in accordance with the approved batch-size sampling rule.'),
    @('4.4.7', 'The user shall check the selected sample packs against the approved mock-up for product identity, batch details, expiry, component placement and finished-pack presentation.'),
    @('4.4.8', 'The user shall record and verify the full assembled quantity and total number of boxes.'),
    @('4.4.9', 'Where more than one box is recorded, the user shall enter the quantity in each box and the system shall confirm that the total agrees with the declared assembled quantity.'),
    @('4.4.10', 'The system shall prevent sign-off and quarantine-label printing while mandatory sample checks, quantity, box count or per-box allocation remain incomplete or inconsistent.'),
    @('4.4.11', 'The system shall generate quarantine labels using the confirmed batch, box and quantity information.'),
    @('4.4.12', 'The number of quarantine labels generated shall agree with the confirmed number of boxes or approved label requirement.'),
    @('4.4.13', 'A voided or reprinted quarantine label shall retain the reason, authenticated user and date/time.'),
    @('4.4.14', 'Post-Assembly QC sign-off shall capture the authenticated user, role, completed checks, confirmed quantities, comments and date/time.'),
    @('4.4.15', 'The system shall prevent Post-Assembly QC completion while any pack, mock-up, quantity, box-count or quarantine-label mismatch remains unresolved.'),
    @('4.4.16', 'Completed Post-Assembly QC batches shall be removed from the active queue, updated to quarantine status and made available to Pre-QP.'),
    @('4.4.17', 'The completed Post-Assembly QC record and linked evidence shall remain available to authorised Pre-QP, QP and audit users.')
)

$word = $null
$doc = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open($path, $false, $false)
    $doc.TrackRevisions = $false

    $start = $null
    $end = $null
    foreach ($paragraph in @($doc.Paragraphs)) {
        $text = ($paragraph.Range.Text -replace '[\r\a]', '').Trim()
        if ($null -eq $start -and $text -eq '4. User Requirements Specification') { $start = $paragraph.Range.Start }
        if ($null -ne $start -and $text -eq '5. User Access') { $end = $paragraph.Range.Start; break }
    }
    if ($null -eq $start -or $null -eq $end) { throw 'Could not locate the Section 4 edit range.' }

    $editRange = $doc.Range($start, $end)
    $editRange.Delete()
    $selection = $word.Selection
    $selection.SetRange($start, $start)

    Add-Paragraph $selection '4. User Requirements Specification' 'Heading 1'
    Add-RequirementSection $doc $selection '4.1 Pre-Assembly QC' $requirements41
    Add-RequirementSection $doc $selection '4.2 Production Control / Room Allocation' $requirements42
    Add-RequirementSection $doc $selection '4.3 Assembly Room' $requirements43
    Add-RequirementSection $doc $selection '4.4 Post-Assembly QC' $requirements44

    foreach ($table in @($doc.Tables)) {
        $first = ($table.Cell(1,1).Range.Text -replace '[\r\a]', '').Trim()
        if ($first -eq 'Version' -and $table.Rows.Count -ge 2 -and $table.Columns.Count -ge 4) {
            $table.Cell(2,3).Range.Text = 'First draft structured as four stage-aligned user-requirement sections covering Pre-Assembly QC, Production Control / Room Allocation, Assembly Room and Post-Assembly QC.'
            break
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
