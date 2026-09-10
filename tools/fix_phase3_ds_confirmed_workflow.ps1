$ErrorActionPreference = 'Stop'

$documentPath = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\Phase 3 Doc\DS-PLPI BAR - Phase 2-B Pre Assembly to Post Assembly.docx'

$replacements = [ordered]@{
    'Stage 9 receives only batches that have completed the preceding printing and route-specific preparation activities. The Pre-Assembly QC user searches the eligible queue, opens one controlled record, confirms the printed-material rows and line-clearance information, records specimen, leaflet-fold and tamper-seal counts, reviews the approved mock-up and signs the record. Successful sign-off makes the record read-only and makes the batch available to Production Control.' =
    'Stage 9 receives only batches that have completed the preceding printing and route-specific preparation activities. The Pre-Assembly QC user searches the eligible queue, opens one controlled record, confirms the printed-material rows, verifies the product sample against the BAR and Product Check Log (PCL), completes the mandatory Pre-Assembly Line Clearance, records specimen, leaflet-fold and tamper-seal counts, reviews the approved mock-up and signs the record. Successful sign-off makes the record read-only and makes the batch available to Production Control.'

    'The Assembly Room user sees only batches allocated to that room. After attendance and batch-start confirmation, the user completes Initial Checks, Random Sample Check, IPC Checks with required evidence, and Reconciliation and Closure. Each page is signed independently and becomes read-only. The batch can be finished only when all four pages are signed and no unresolved condition remains.' =
    'The Assembly Room user sees only batches allocated to that room. After attendance and batch-start confirmation, the user completes Initial Checks, Random Sample Check, one IPC Photo Check with one required photo, and Reconciliation and Closure. Each page is signed independently and becomes read-only. The batch can be finished only when all four pages are signed and no unresolved condition remains.'

    'Figure 2 - Pre-Assembly verification, reference-sample controls and sign-off' =
    'Figure 2 - Pre-Assembly verification, line clearance, reference-sample controls and sign-off'

    'Callout 5 - Mock-up and Print BAR. The approved mock-up and BAR open for preparation or comparison. Opening or printing does not sign or complete the record.' =
    'Callout 5 - Product sample, Mock-up and Print BAR. The user verifies the product sample against the BAR and Product Check Log (PCL), including product identity, pack size, batch details and expiry date, and uses the approved mock-up for preparation or comparison. Opening the mock-up or printing the BAR does not sign or complete the record.'

    'Callout 6 - User Sign Off. The action becomes available only after every displayed material check, required count, line-clearance item, conditional reason and applicable route amendment is complete.' =
    'Callout 6 - User Sign Off. The action becomes available only after every displayed material check, the mandatory Pre-Assembly Line Clearance confirmation, product-sample verification, required count, conditional reason and applicable route amendment are complete.'

    'Step 3 - The user confirms every applicable printed-material row and completes the line-clearance and count fields.' =
    'Step 3 - The user confirms every applicable printed-material row, completes the mandatory Pre-Assembly Line Clearance confirmation and enters the required count fields.'

    'Step 5 - The user opens the approved Mock-up and prepares or compares the assembly reference sample.' =
    'Step 5 - The user verifies the product sample against the BAR and Product Check Log (PCL), opens the approved Mock-up and prepares or compares the assembly reference sample.'

    'Validation and error handling: Missing checks, blank or invalid counts, a required MARKS reason, incomplete route amendments or a stale/completed record prevent sign-off. Back, cancellation or print failure does not create a completed Stage 9 record.' =
    'Validation and error handling: Missing printed-material checks, an incomplete Pre-Assembly Line Clearance confirmation, incomplete product-sample verification, blank or invalid counts, a required MARKS reason, incomplete route amendments or a stale/completed record prevent sign-off. Back, cancellation or print failure does not create a completed Stage 9 record.'

    'Figure 11 - IPC Checks and supporting evidence' =
    'Figure 11 - IPC Photo Check and supporting evidence'

    'Callout 1 - Required IPC rows. The displayed scheduled or minimum IPC checks retain their check identity, sequence or time, result, user and date/time.' =
    'Callout 1 - Required IPC photo. The page requires one clear photograph of the in-process product for the selected batch.'

    'Callout 2 - Additional checks. An authorised user may add a permitted IPC row without changing the earlier recorded rows.' =
    'Callout 2 - Single-photo design. No timer, additional IPC row or separate IPC result entry is required on this page.'

    'Callout 3 - Photo evidence. Take Picture or file selection associates the required image with the current batch and IPC event.' =
    'Callout 3 - Photo evidence. Take Picture or file selection associates the one required image with the current batch and records the evidence name, authenticated user and date/time.'

    'Callout 4 - Failed IPC. A failed result prevents page and final completion until the defined authorised resolution and reason are recorded.' =
    'Callout 4 - Page completion. Mark Done remains disabled until one IPC photo is attached. Successful completion records the user and date/time and makes the IPC Photo Check page read-only.'

    'Step 4 - Complete the required and permitted additional IPC rows, attach required evidence and sign the page.' =
    'Step 4 - Attach one required IPC photo and sign the IPC Photo Check page.'

    'Validation and error handling: A user cannot open a batch assigned to another room, overwrite a signed page, omit a required sample row or IPC image, or complete the batch with an unresolved IPC or reconciliation condition. Break, Back or interruption retains completed page signatures but does not create final completion.' =
    'Validation and error handling: A user cannot open a batch assigned to another room, overwrite a signed page, omit a required sample row, sign the IPC Photo Check page without one attached photo, or complete the batch with an unresolved reconciliation condition. Break, Back or interruption retains completed page signatures but does not create final completion.'

    'Callout 1 - Finished quantities. Total Packs, Total Boxes and No. of Packs Checked accept positive whole numbers. The approved batch-size rule supplies or validates the sample quantity.' =
    'Callout 1 - Finished quantities. Total Packs and Total Boxes accept positive whole numbers. No. of Packs Checked is calculated using the approved sampling formula CEILING(SQRT(Total Packs)) + 1 and is revalidated when the quantity changes.'

    'Callout 4 - Quarantine Label. Test Print is a non-completing output. Print Quarantine Label uses the confirmed batch, box and quantity information and records the print result. Void or Reprint is restricted and requires a reason while retaining the original print event.' =
    'Callout 4 - Quarantine Label. Test Print is a non-completing output. Print Quarantine Label uses the confirmed batch, box and quantity information and records the print result. The same Print Quarantine Label action remains available whenever printing is required; no separate Void or Reprint action is provided.'

    'Callout 5 - User Sign Off. The action rechecks sampling, quantities, box allocation, every BAR comparison row and the controlled-label result. Success records Signed by and Signed At, makes the record read-only and releases the batch to pre-QP.' =
    'Callout 5 - User Sign Off. The action remains disabled until the approved sampling result, quantities, box allocation, every BAR comparison row and at least one successful controlled Quarantine Label print are complete. Success records Signed by and Signed At, makes the record read-only and releases the batch to pre-QP.'

    'Step 2 - Record Total Packs, Total Boxes and No. of Packs Checked.' =
    'Step 2 - Record Total Packs and Total Boxes; PLPI calculates No. of Packs Checked using the approved formula CEILING(SQRT(Total Packs)) + 1.'

    'Step 5 - Produce the required controlled Quarantine Label; a Test Print does not complete the stage.' =
    'Step 5 - Successfully print the required controlled Quarantine Label before sign-off; a Test Print does not satisfy this requirement. The Print Quarantine Label action may be used whenever printing is required.'

    'Validation and error handling: An Assembly-incomplete batch, invalid quantities, missing per-box entries, a box-total mismatch, unchecked BAR rows, unresolved mismatch or unsuccessful controlled-label output prevents sign-off. A failed, cancelled, voided or reprinted label event retains its own status and does not replace the original event.' =
    'Validation and error handling: An Assembly-incomplete batch, invalid quantities, an invalid approved sampling result, missing per-box entries, a box-total mismatch, unchecked BAR rows, unresolved mismatch or the absence of a successful controlled Quarantine Label print prevents sign-off. A failed or cancelled print does not satisfy the print requirement; the user may use Print Quarantine Label again when required.'

    'Exit condition: The signed Stage 12 record is read-only, the batch has its controlled Quarantine Label status and the record is available to pre-QP.' =
    'Exit condition: The signed Stage 12 record is read-only, at least one successful controlled Quarantine Label print is retained for the batch and the record is available to pre-QP.'

    'PLPI shall retain successful and unsuccessful controlled events for Stage 9 material checks, counts, route changes, mock-up/BAR outputs and sign-off; Stage 10 stock, Box ID, count decision, Line Clearance, room allocation and BAR update; Stage 11 attendance, start, runtime, page completion, IPC evidence, hold, reconciliation and finish; and Stage 12 sampling, quantity, box allocation, BAR comparison, label and sign-off. Audit records shall not be replaced by a later status.' =
    'PLPI shall retain successful and unsuccessful controlled events for Stage 9 material checks, line clearance, product-sample verification, counts, route changes, mock-up/BAR outputs and sign-off; Stage 10 stock, Box ID, count decision, Line Clearance, room allocation and BAR update; Stage 11 attendance, start, runtime, page completion, the required IPC photo, reconciliation and finish; and Stage 12 approved sampling calculation, quantity, box allocation, BAR comparison, label printing and sign-off. Audit records shall not be replaced by a later status.'
}

$word = $null
$document = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $document = $word.Documents.Open($documentPath, $false, $false)

    $paragraphMap = @{}
    foreach ($paragraph in $document.Paragraphs) {
        $text = $paragraph.Range.Text.Trim([char]13, [char]7, ' ')
        if ($replacements.Contains($text)) {
            if ($paragraphMap.ContainsKey($text)) { throw "Duplicate target paragraph found: $text" }
            $paragraphMap[$text] = $paragraph
        }
    }

    $missing = @($replacements.Keys | Where-Object { -not $paragraphMap.ContainsKey($_) })
    if ($missing.Count -gt 0) {
        throw "The current DS does not contain the expected paragraph(s); no edits were saved:`n$($missing -join "`n---`n")"
    }

    foreach ($oldText in $replacements.Keys) {
        $paragraph = $paragraphMap[$oldText]
        $range = $paragraph.Range.Duplicate
        $range.End = $range.End - 1
        $range.Text = $replacements[$oldText]
    }

    foreach ($toc in $document.TablesOfContents) { $toc.Update() }
    $document.Fields.Update() | Out-Null
    $document.Repaginate()
    $document.Save()
    Write-Output "Applied $($replacements.Count) targeted workflow corrections to the current DS."
}
finally {
    if ($null -ne $document) { $document.Close($false) }
    if ($null -ne $word) { $word.Quit() }
    if ($null -ne $document) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($document) }
    if ($null -ne $word) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
