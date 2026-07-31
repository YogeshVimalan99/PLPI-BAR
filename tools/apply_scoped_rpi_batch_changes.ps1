param(
    [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression

$wNs = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

function Open-DocxXml([string]$Path) {
    $zip = [System.IO.Compression.ZipFile]::Open($Path, [System.IO.Compression.ZipArchiveMode]::Update)
    $entry = $zip.GetEntry('word/document.xml')
    $reader = [System.IO.StreamReader]::new($entry.Open())
    try { $raw = $reader.ReadToEnd() } finally { $reader.Dispose() }
    $xml = [System.Xml.XmlDocument]::new()
    $xml.PreserveWhitespace = $true
    $xml.LoadXml($raw)
    $ns = [System.Xml.XmlNamespaceManager]::new($xml.NameTable)
    $ns.AddNamespace('w', $wNs)
    return @{ Zip = $zip; Entry = $entry; Xml = $xml; Ns = $ns }
}

function Save-DocxXml($Doc) {
    $Doc.Entry.Delete()
    $entry = $Doc.Zip.CreateEntry('word/document.xml', [System.IO.Compression.CompressionLevel]::Optimal)
    $stream = $entry.Open()
    try {
        $settings = [System.Xml.XmlWriterSettings]::new()
        $settings.Encoding = [System.Text.UTF8Encoding]::new($false)
        $settings.Indent = $false
        $settings.OmitXmlDeclaration = $false
        $writer = [System.Xml.XmlWriter]::Create($stream, $settings)
        try { $Doc.Xml.Save($writer) } finally { $writer.Dispose() }
    } finally { $stream.Dispose(); $Doc.Zip.Dispose() }
}

function Get-Text($Node, $Ns) {
    return (($Node.SelectNodes('.//w:t', $Ns) | ForEach-Object { $_.InnerText }) -join '')
}

function Set-ContainerText($Node, [string]$Text, $Ns) {
    $textNodes = @($Node.SelectNodes('.//w:t', $Ns))
    if ($textNodes.Count -eq 0) { throw 'Target container has no text node.' }
    $textNodes[0].InnerText = $Text
    for ($i = 1; $i -lt $textNodes.Count; $i++) { $textNodes[$i].InnerText = '' }
}

function Replace-Exact($Doc, [string]$Old, [string]$New, [ValidateSet('Paragraph','Cell')]$Kind, [int]$Expected = 1) {
    $xpath = if ($Kind -eq 'Paragraph') { '//w:p' } else { '//w:tc' }
    $matches = @($Doc.Xml.SelectNodes($xpath, $Doc.Ns) | Where-Object { (Get-Text $_ $Doc.Ns) -eq $Old })
    if ($matches.Count -ne $Expected) { throw "Expected $Expected $Kind match(es), found $($matches.Count): $Old" }
    foreach ($node in $matches) { Set-ContainerText $node $New $Doc.Ns }
}

function Set-RowCells($Row, [string[]]$Values, $Ns) {
    $cells = @($Row.SelectNodes('./w:tc', $Ns))
    if ($cells.Count -ne $Values.Count) { throw "Expected $($Values.Count) cells, found $($cells.Count)." }
    for ($i = 0; $i -lt $Values.Count; $i++) { Set-ContainerText $cells[$i] $Values[$i] $Ns }
}

function Insert-RowAfterExact($Doc, [string[]]$AfterValues, [string[]]$NewValues) {
    $rows = @($Doc.Xml.SelectNodes('//w:tr', $Doc.Ns))
    $matches = @($rows | Where-Object {
        $cells = @($_.SelectNodes('./w:tc', $Doc.Ns) | ForEach-Object { Get-Text $_ $Doc.Ns })
        ($cells -join [char]31) -eq ($AfterValues -join [char]31)
    })
    if ($matches.Count -ne 1) { throw "Expected one row insertion target, found $($matches.Count): $($AfterValues -join ' | ')" }
    $clone = $matches[0].CloneNode($true)
    Set-RowCells $clone $NewValues $Doc.Ns
    [void]$matches[0].ParentNode.InsertAfter($clone, $matches[0])
}

function Replace-ZipEntry([string]$DocxPath, [string]$EntryName, [string]$SourcePath) {
    $zip = [System.IO.Compression.ZipFile]::Open($DocxPath, [System.IO.Compression.ZipArchiveMode]::Update)
    try {
        $existing = $zip.GetEntry($EntryName)
        if (-not $existing) { throw "Entry not found: $EntryName" }
        $existing.Delete()
        $entry = $zip.CreateEntry($EntryName, [System.IO.Compression.CompressionLevel]::Optimal)
        $input = [System.IO.File]::OpenRead($SourcePath)
        $output = $entry.Open()
        try { $input.CopyTo($output) } finally { $output.Dispose(); $input.Dispose() }
    } finally { $zip.Dispose() }
}

$docz = Join-Path $Root 'docz'
$ursPath = Join-Path $docz 'URS-PLPI BAR.docx'
$fsPath = Join-Path $docz 'FS-PLPI BAR.docx'
$dsPath = Join-Path $docz 'DS-PLPI BAR.docx'

# URS: update only the two existing requirement cells.
$urs = Open-DocxXml $ursPath
Replace-Exact $urs 'The system shall require all mandatory files before RPi submission, require RPi users to view the required documents before approval and allow an incorrect uploaded file to be returned with comments.' 'The system shall require all mandatory files before RPi submission, require RPi users to approve the required documents, automatically mark the applicable RPi approval-form checks as Yes, and allow an incorrect uploaded file to be returned with comments.' Cell
Replace-Exact $urs 'The system shall allow Print PCL after Product Verification is saved and shall display completed and incomplete checks so an incomplete PCL can be printed for Regulatory review.' 'The system shall allow Print PCL after Product Verification is saved and shall display completed and incomplete checks. An incomplete PCL shall require a Regulatory comment before printing for Regulatory review.' Cell
Save-DocxXml $urs

# FS: align RPi document approval and the incomplete-PCL comment gate.
$fs = Open-DocxXml $fsPath
Insert-RowAfterExact $fs @('View File','New action','Opens the selected file and records that it has been viewed.') @('Approve File','New controlled action','Approves the selected document and automatically marks the mapped RPi approval-form checks as Yes with the source document identified.')
Replace-Exact $fs 'Opens the RPi checklist after every required file has been viewed.' 'Opens the RPi checklist after every required document has been approved.' Cell
Replace-Exact $fs 'For a Goods Receiving exception, the RPi user reviews the No response and selects Approve checklist when stock is approved for unpacking; the decision then appears in Packing List > Checklist decision. For a submitted pack, every mandatory file is already present. The RPi user reviews shared documents once and PO-specific documents against each PO, approves the correct pack or returns an incorrect uploaded file with comments.' 'For a Goods Receiving exception, the RPi user reviews the No response and selects Approve checklist when stock is approved for unpacking; the decision then appears in Packing List > Checklist decision. For a submitted pack, every mandatory file is already present. The RPi user views and approves each required document. Document approval automatically marks the mapped RPi approval-form checks as Yes and identifies the source document. The user then approves the pack or returns an incorrect uploaded file with comments.' Cell
Replace-Exact $fs 'Missing mandatory files prevent submission to RPi. Pack approval requires all required files to be viewed. An incorrect uploaded file may be returned with mandatory comments. Generate & sign remains unavailable when Stock Suitable for Processing is No or Deviation Required is Yes. Shared files require one review for the merged set.' 'Missing mandatory files prevent submission to RPi. Pack approval requires all required documents to be approved. Import / Export approval marks EORI Verification and Commodity Code Verification as Yes; CMR approval marks Collection Address Matches WDA and Authorised Transporter as Yes; Temperature Record approval marks the transit and storage-site temperature checks as Yes; Supplier Declaration approval marks Article 51, FMD Compliance and FMD Decommissioning checks as Yes. Each mapped check identifies its source document. An incorrect uploaded file may be returned with mandatory comments. Generate & sign remains unavailable when Stock Suitable for Processing is No or Deviation Required is Yes. Shared files require one approval for the merged set.' Cell
Replace-Exact $fs 'Captures comments included in the printed PCL.' 'Captures comments included in the printed PCL and is mandatory when any Product Verification check is incomplete.' Cell 2
Replace-Exact $fs 'New editable text area' 'New conditional mandatory text area' Cell 2
Replace-Exact $fs 'After external acceptance is reflected in PLPI, Screen 1 displays one summarized row per eligible PO. Selecting a PO opens the existing detailed line screen. Manufacturer comes from the existing PLPI manufacturer selection, while Supplier Declaration, Temperature Record and Supplier Invoice open the documents retained in the approved RPi pack. Product Verification may be saved with incomplete checks. An incomplete PCL may be printed as a Regulatory review copy and remains incomplete for downstream release. If Split changes a printed line, the affected verification and PCL states are reset.' 'After external acceptance is reflected in PLPI, Screen 1 displays one summarized row per eligible PO. Selecting a PO opens the existing detailed line screen. Manufacturer comes from the existing PLPI manufacturer selection, while Supplier Declaration, Temperature Record and Supplier Invoice open the documents retained in the approved RPi pack. Product Verification may be saved with incomplete checks. Before an incomplete PCL can be printed as a Regulatory review copy, the Batch Checker must enter a Regulatory comment. The copy remains incomplete for downstream release. If Split changes a printed line, the affected verification and PCL states are reset.' Cell
Replace-Exact $fs 'Screen 1 shall show one row per eligible PO after external acceptance is reflected. Saving Product Verification with incomplete checks is permitted; the resulting PCL is an incomplete Regulatory review copy and does not satisfy downstream release. A mandatory reason shall be captured for each applicable reprint. Split remains existing but resets the affected printed lines.' 'Screen 1 shall show one row per eligible PO after external acceptance is reflected. Saving Product Verification with incomplete checks is permitted; Print PCL remains disabled until a Regulatory comment is entered, and the resulting Regulatory review copy does not satisfy downstream release. A mandatory reason shall be captured for each applicable reprint. Split remains existing but resets the affected printed lines.' Cell
Replace-Exact $fs 'Stores selected checks as complete and unselected checks as incomplete. An incomplete save may be printed for physical submission to Regulatory.' 'Stores selected checks as complete and unselected checks as incomplete. An incomplete save may be printed for physical submission to Regulatory only after a Regulatory comment is entered.' Cell
Replace-Exact $fs 'Saved Product Verification record with every check status and electronic attribution; an incomplete record remains open and may produce an incomplete Regulatory review PCL.' 'Saved Product Verification record with every check status and electronic attribution; an incomplete record remains open and may produce an incomplete Regulatory review PCL after a Regulatory comment is entered.' Cell
Replace-Exact $fs 'A selected product line and valid Manufacturer are required. Save Batch Check stores each selected and unselected check. Incomplete checks remain incomplete for downstream release but may be printed for Regulatory review. Cancel or Close does not overwrite the last saved record. Splitting a printed line invalidates the affected verification and requires a new save.' 'A selected product line and valid Manufacturer are required. Save Batch Check stores each selected and unselected check. Incomplete checks remain incomplete for downstream release and require a Regulatory comment before printing for Regulatory review. Cancel or Close does not overwrite the last saved record. Splitting a printed line invalidates the affected verification and requires a new save.' Cell
Replace-Exact $fs 'After Product Verification is saved, Print PCL displays each completed and incomplete check, line-clearance evidence and editable comments. If any check is incomplete, PLPI identifies the output as an incomplete Regulatory review copy for physical submission to Regulatory and keeps downstream release blocked. If all checks are complete, the normal PCL may be printed. A reprint requires a reason. If Split changes a printed line, the affected lines return to new-entry status.' 'After Product Verification is saved, Print PCL displays each completed and incomplete check, line-clearance evidence and comments. If any check is incomplete, the Regulatory comment is mandatory and Print PCL remains disabled until it is entered. PLPI then identifies the output as an incomplete Regulatory review copy for physical submission to Regulatory and keeps downstream release blocked. If all checks are complete, the normal PCL may be printed. A reprint requires a reason. If Split changes a printed line, the affected lines return to new-entry status.' Cell
Replace-Exact $fs 'Complete PCL or incomplete Regulatory review copy containing the saved checks and comments, with retained print history and downstream status.' 'Complete PCL or incomplete Regulatory review copy containing the saved checks and required Regulatory comment, with retained print history and downstream status.' Cell
Replace-Exact $fs 'Print PCL requires a saved Product Verification record. Incomplete checks produce a Regulatory review copy and do not complete the downstream gate. Reprint requires a reason. A Split after printing resets the affected lines. Each print, reprint and reset is auditable.' 'Print PCL requires a saved Product Verification record. Incomplete checks require a Regulatory comment before Print PCL is enabled; the resulting Regulatory review copy does not complete the downstream gate. Reprint requires a reason. A Split after printing resets the affected lines. Each print, reprint and reset is auditable.' Cell
Replace-Exact $fs 'Require every mandatory file before submission, require document viewing before approval and permit return of an incorrect uploaded file with comments.' 'Require every mandatory file before submission, require document approval, automatically mark mapped approval-form checks as Yes and permit return of an incorrect uploaded file with comments.' Cell
Replace-Exact $fs 'Preview saved check statuses and print a complete PCL or incomplete Regulatory review copy.' 'Preview saved check statuses and require a Regulatory comment before printing an incomplete Regulatory review copy.' Cell
Save-DocxXml $fs

# DS: update only the affected RPi Approval and Batch Checker design statements.
$ds = Open-DocxXml $dsPath
$dsReplacements = [ordered]@{
'The Responsible Person reviews the complete submitted pack; missing mandatory files cannot reach RPi, while an incorrect uploaded file may be returned with comments. Approval combines every attached and approved document with the RPi approval form into one PDF. Batch Checker may save incomplete Product Verification and print an incomplete Regulatory review copy. Only a Split change to a printed line resets the affected verification and PCL states.' = 'The Responsible Person reviews the complete submitted pack; missing mandatory files cannot reach RPi, while an incorrect uploaded file may be returned with comments. Approving a source document automatically marks its mapped RPi approval-form checks as Yes and identifies the source. Approval combines every attached and approved document with the RPi approval form into one PDF. Batch Checker may save incomplete Product Verification but must enter a Regulatory comment before printing an incomplete Regulatory review copy. Only a Split change to a printed line resets the affected verification and PCL states.'
'Queue separation: Add Packing List and Generate Checklist remain separate. A Team Lead Yes decision continues normally. A No decision enters the RPi QA Decision queue; after RPi approval, Goods-In accepts it in Packing List > Checklist decision before View Packing List. Incomplete Product Verification may produce a Regulatory review copy. A Split change resets the affected printed lines. Goods-In Summary remains read-only.' = 'Queue separation: Add Packing List and Generate Checklist remain separate. A Team Lead Yes decision continues normally. A No decision enters the RPi QA Decision queue; after RPi approval, Goods-In accepts it in Packing List > Checklist decision before View Packing List. Incomplete Product Verification may produce a Regulatory review copy only after a Regulatory comment is entered. A Split change resets the affected printed lines. Goods-In Summary remains read-only.'
'For a checklist exception, RPi records Approved for unpacking and sends the decision to Packing List > Checklist decision. For a pack, all mandatory files are present before submission; shared files are reviewed once and PO-specific files are reviewed against the applicable PO before approval.' = 'For a checklist exception, RPi records Approved for unpacking and sends the decision to Packing List > Checklist decision. For a pack, all mandatory files are present before submission; shared files are approved once and PO-specific files are approved against the applicable PO. Approving a mapped source document sets its related RPi approval-form checks to Yes and displays the source document.'
'Callout 3 - Shared-document group. Supplier Declaration, Temperature Record, Goods Receiving Checklist, CMR and Import / Export are displayed once for the merged set where applicable. A single recorded view satisfies the shared-file review gate.' = 'Callout 3 - Shared-document group. Supplier Declaration, Temperature Record, Goods Receiving Checklist, CMR and Import / Export are displayed once for the merged set where applicable. A single approval satisfies the shared-file gate.'
'Callout 4 - PO-specific groups. Supplier Invoice, Supplier Packing List, Additional Files and the generated Packing List are displayed under the applicable PO. Each required file must be opened for each PO.' = 'Callout 4 - PO-specific groups. Supplier Invoice, Supplier Packing List, Additional Files and the generated Packing List are displayed under the applicable PO. Each required file must be viewed and approved for each PO.'
'Callout 5 - View status. Missing mandatory files prevent submission to RPi. During RPi review, View File records the opened document. An incorrect or unreadable uploaded file may be returned with comments.' = 'Callout 5 - View and approve status. View File opens the document without approving it. Approve records the document decision. Mapped source-document approval also marks the related approval-form checks as Yes and identifies the source. An incorrect or unreadable uploaded file may be returned with comments.'
'Callout 6 - Approve or return. Approve opens the RPi checklist after all required views are complete. Return is available for an incorrect uploaded file, requires comments and sends the pack to RPi Pack Creation.' = 'Callout 6 - Open checklist or return. After every required document is approved, the pack-level Approve action opens the RPi checklist. Return is available for an incorrect uploaded file, requires comments and sends the pack to RPi Pack Creation.'
'Step 3 - The user opens every applicable shared file. PLPI records viewed status against the merged review task.' = 'Step 3 - The user opens and approves every applicable shared file. PLPI records the approval once against the merged review task.'
'Step 4 - The user opens every required PO-specific file and generated Packing List against each PO. PLPI records the PO reference with each view event.' = 'Step 4 - The user opens and approves every required PO-specific file and generated Packing List against each PO. PLPI records the PO reference with each approval event.'
'Step 6 - A corrected pack is re-submitted and all affected document review gates are repeated. Unaffected retained files remain traceable but approval is based on the current submitted version.' = 'Step 6 - A corrected pack is re-submitted and all affected document approval gates are repeated. Unaffected retained files remain traceable but approval is based on the current submitted version.'
'Step 7 - When all required files are viewed, Approve enables the RPi Approval Checklist. PLPI records the authenticated review decision, role and date/time.' = 'Step 7 - Each approved mapped source document sets its related approval-form checks to Yes and displays the source document. When all required documents are approved, the pack-level Approve action opens the RPi Approval Checklist. PLPI records the authenticated decision, role and date/time.'
'Callout 1 - EORI and commodity verification. The Responsible Person records the EORI Verification and Commodity Code Verification outcome against the reviewed pack.' = 'Callout 1 - Import / Export mapping. Approval of Import / Export automatically sets EORI Verification and Commodity Code Verification to Yes and displays Marked from Import / Export.'
'Callout 3 - Distribution controls. Collection Address Matches WDA and Authorised Transporter use controlled Yes or No responses.' = 'Callout 3 - CMR mapping. Approval of CMR automatically sets Collection Address Matches WDA and Authorised Transporter to Yes and displays Marked from CMR.'
'Callout 4 - Temperature controls. Transit Temperature Within Parameters and Storage-site Temperature Within Parameters use the applicable Yes, No or N/A options.' = 'Callout 4 - Temperature Record mapping. Approval of the Temperature Record automatically sets Transit Temperature Within Parameters and Storage-site Temperature Within Parameters to Yes and displays Marked from Temperature Record.'
'Callout 1 - Regulatory checks. Article 51 Supplier Declaration, FMD Compliance in Declaration, FMD Decommissioning Statement and Bollino / Vignette Sticker Check are completed using the applicable controlled responses.' = 'Callout 1 - Supplier Declaration mapping. Approval of the Supplier Declaration automatically sets Article 51 Supplier Declaration, FMD Compliance in Declaration and FMD Decommissioning Statement to Yes and displays Marked from Supplier Declaration. Bollino / Vignette remains editable.'
'Callout 4 - Generate & Sign. The action remains disabled until every mandatory document view, checklist response and conditional value is complete. It is also blocked when Stock Suitable for Processing is No or Deviation Required is Yes. Successful execution creates the signed approval record and locks the approved pack.' = 'Callout 4 - Generate & Sign. The action remains disabled until every mandatory document approval, remaining checklist response and conditional value is complete. It is also blocked when Stock Suitable for Processing is No or Deviation Required is Yes. Successful execution creates the signed approval record and locks the approved pack.'
'Step 1 - Verify EORI, commodity code and Supplier Status in FE. PLPI requires Reason if Inactive when applicable.' = 'Step 1 - PLPI sets EORI Verification and Commodity Code Verification to Yes from the approved Import / Export document. The user completes Supplier Status in FE and Reason if Inactive where applicable.'
'Step 2 - Complete Collection Address Matches WDA, Authorised Transporter and the applicable transit and storage-site temperature controls.' = 'Step 2 - PLPI sets Collection Address Matches WDA and Authorised Transporter to Yes from approved CMR, and sets the transit and storage-site temperature checks to Yes from the approved Temperature Record.'
'Step 3 - Complete Article 51, FMD compliance, FMD decommissioning and Bollino / Vignette checks using N/A only where the configured rule permits it.' = 'Step 3 - PLPI sets Article 51, FMD compliance and FMD decommissioning checks to Yes from the approved Supplier Declaration. The user completes Bollino / Vignette using N/A only where permitted.'
'Step 5 - Select Generate & Sign. PLPI validates the current pack version, document-review gates and mandatory responses. Sign-off is blocked when Stock Suitable for Processing is No or Deviation Required is Yes.' = 'Step 5 - Select Generate & Sign. PLPI validates the current pack version, document-approval gates, mapped values and remaining mandatory responses. Sign-off is blocked when Stock Suitable for Processing is No or Deviation Required is Yes.'
'Validation rules: No mandatory response may remain blank. Conditional fields follow the selected status. A changed or corrected source file invalidates the affected review and requires the applicable approval steps to be repeated.' = 'Validation rules: A mapped Yes value is created only by approval of its source document and displays that source. Remaining mandatory responses may be edited and cannot remain blank. Conditional fields follow the selected status. A changed or corrected source file invalidates its approval and mapped values and requires approval to be repeated.'
'Callout 6 - Print controls. Print PCL is available after Product Verification is saved. Existing PCL Cold Chain Continuation remains unchanged. Reprinting either output requires a reason.' = 'Callout 6 - Print controls. Print PCL is available after Product Verification is saved. If any check is incomplete, Print PCL remains disabled until a Regulatory comment is entered. Existing PCL Cold Chain Continuation remains unchanged. Reprinting either output requires a reason.'
'Updated actions: Manufacturer comes from the existing PLPI manufacturer selection. Print PCL uses the saved checks. Incomplete checks produce a Regulatory review copy and do not complete downstream release. A Split change resets the affected printed lines.' = 'Updated actions: Manufacturer comes from the existing PLPI manufacturer selection. Print PCL uses the saved checks. Incomplete checks require a Regulatory comment before printing and produce a Regulatory review copy that does not complete downstream release. A Split change resets the affected printed lines.'
'Step 8 - Print or reprint PCL. If checks remain incomplete, PLPI identifies the output as an incomplete Regulatory review copy for physical submission to Regulatory and keeps downstream release incomplete. A reprint requires a reason.' = 'Step 8 - Print or reprint PCL. If checks remain incomplete, PLPI requires a Regulatory comment and keeps Print PCL disabled until it is entered. The printed output is identified as an incomplete Regulatory review copy for physical submission to Regulatory and downstream release remains incomplete. A reprint requires a reason.'
'Callout 7 - Final save. Selected checks are stored as complete and unselected checks as incomplete. An incomplete save remains open for resolution but may be printed for Regulatory review.' = 'Callout 7 - Final save. Selected checks are stored as complete and unselected checks as incomplete. An incomplete save remains open for resolution and may be printed for Regulatory review only after a Regulatory comment is entered.'
'Validation and exception handling: Manufacturer must be selected. Incomplete checks may be saved and printed as a Regulatory review copy but do not satisfy downstream release. Cancel does not overwrite the last saved record. A Split change to a printed line clears the affected saved states.' = 'Validation and exception handling: Manufacturer must be selected. Incomplete checks may be saved, but Print PCL remains disabled until a Regulatory comment is entered. The resulting Regulatory review copy does not satisfy downstream release. Cancel does not overwrite the last saved record. A Split change to a printed line clears the affected saved states.'
'Callout 5 - Print PCL. First print is permitted after Product Verification is saved. Each reprint requires a reason. PLPI records the output type, user, date/time and reason where applicable.' = 'Callout 5 - Print PCL. First print is permitted after Product Verification is saved. When any check is incomplete, the action remains disabled until a Regulatory comment is entered. Each reprint requires a reason. PLPI records the output type, user, date/time and reason where applicable.'
'Callout 5 - PCL comments. The Batch Checker may enter or edit comments before printing. The saved comments are included in the printed PCL and remain associated with the selected line.' = 'Callout 5 - Regulatory comment. The Batch Checker may enter or edit comments before printing. A comment is mandatory when any saved check is incomplete; the saved comment is included in the printed PCL and remains associated with the selected line.'
'Callout 7 - Final print. Print PCL produces the complete PCL or an incomplete Regulatory review copy. A reprint requires a reason and retains prior history. A print failure does not create a successful status.' = 'Callout 7 - Final print. Print PCL produces the complete PCL or, after the mandatory Regulatory comment is entered, an incomplete Regulatory review copy. A reprint requires a reason and retains prior history. A print failure does not create a successful status.'
'PCL preview: Print PCL displays the saved details and check states. Any incomplete check marks the output as an incomplete Regulatory review copy.' = 'PCL preview: Print PCL displays the saved details and check states. Any incomplete check marks the output as an incomplete Regulatory review copy and makes the Regulatory comment mandatory.'
'Print PCL: After Product Verification is saved and line clearance is confirmed, PLPI prints either the complete PCL or an incomplete Regulatory review copy. The physical incomplete copy is submitted to Regulatory. Reprint requires a reason.' = 'Print PCL: After Product Verification is saved and line clearance is confirmed, PLPI prints either the complete PCL or, after the mandatory Regulatory comment is entered, an incomplete Regulatory review copy. The physical incomplete copy is submitted to Regulatory. Reprint requires a reason.'
'Step 5 - Review the final PCL. The user reviews the displayed details, saved check statuses and editable comments for the selected PO and line.' = 'Step 5 - Review the final PCL. The user reviews the displayed details and saved check statuses. If any check is incomplete, the user must enter a Regulatory comment before Print PCL is enabled.'
'Step 6 - Print PCL. Complete checks produce the normal PCL. Any incomplete check produces an incomplete Regulatory review copy for physical submission; reprint requires a reason.' = 'Step 6 - Print PCL. Complete checks produce the normal PCL. Any incomplete check produces an incomplete Regulatory review copy for physical submission only after the mandatory Regulatory comment is entered; reprint requires a reason.'
'Validation and exception handling: A print failure cannot record success. An incomplete Regulatory review copy remains incomplete. Reprinting records an additional event. Split after print invalidates the affected lines and requires re-verification.' = 'Validation and exception handling: Print PCL remains disabled when checks are incomplete and the Regulatory comment is blank. A print failure cannot record success. An incomplete Regulatory review copy remains incomplete. Reprinting records an additional event. Split after print invalidates the affected lines and requires re-verification.'
'The system shall display clear messages for missing mandatory data, RPi exception approval, Checklist decision acceptance, missing mandatory pack files, incorrect uploaded files, incomplete verification, optional Additional Files, failed generation/email and unavailable records. Errors shall not advance status.' = 'The system shall display clear messages for missing mandatory data, RPi exception approval, Checklist decision acceptance, missing mandatory pack files, incorrect uploaded files, incomplete verification, a missing Regulatory comment, optional Additional Files, failed generation/email and unavailable records. Errors shall not advance status.'
'WSC-loaded values, checklist PO membership, RPi exception and Goods-In acceptance decisions, shared-file references, mandatory versus optional documents, Product Verification and workflow gates shall be validated. The combined PDF shall contain every attached and approved document plus the RPi approval form.' = 'WSC-loaded values, checklist PO membership, RPi exception and Goods-In acceptance decisions, shared-file references, mandatory versus optional documents, document-to-approval-form mappings, Product Verification, Regulatory comment gating and workflow gates shall be validated. The combined PDF shall contain every attached and approved document plus the RPi approval form.'
}
foreach ($item in $dsReplacements.GetEnumerator()) { Replace-Exact $ds $item.Key $item.Value Paragraph }
Save-DocxXml $ds

$shots = Join-Path $Root 'temp_scoped_update\screenshots'
Replace-ZipEntry $dsPath 'word/media/image11.png' (Join-Path $shots '01-rpi-approval-auto-mapped-top.png')
Replace-ZipEntry $dsPath 'word/media/image12.png' (Join-Path $shots '02-rpi-approval-auto-mapped-regulatory.png')
Replace-ZipEntry $dsPath 'word/media/image18.png' (Join-Path $shots '03-incomplete-pcl-regulatory-comment.png')

Write-Output 'Scoped URS, FS and DS updates applied.'



