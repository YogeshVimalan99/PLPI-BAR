$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = (Resolve-Path -LiteralPath ".").Path
$ref = Join-Path $root "Reference Doc (Templates)\URS-EU BUYING SYSTEM- Oct 2023.docx"
$out = Join-Path $root "URS_PLPI_Batch_Record_Paperless_Process_Improvement_Phase_1_Reference_Style.docx"
Copy-Item -LiteralPath $ref -Destination $out -Force

$zip = [IO.Compression.ZipFile]::Open($out, [System.IO.Compression.ZipArchiveMode]::Update)
$entry = $zip.GetEntry('word/document.xml')
$sr = New-Object IO.StreamReader($entry.Open())
$xmlText = $sr.ReadToEnd()
$sr.Close()
$entry.Delete()

[xml]$xml = $xmlText
$ns = New-Object Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')

function Set-PText($p, [string]$text) {
    $ts = @($p.SelectNodes('.//w:t', $ns))
    if ($ts.Count -eq 0) { return }
    $ts[0].InnerText = $text
    for ($i=1; $i -lt $ts.Count; $i++) { $ts[$i].InnerText = '' }
}
function PText($p) { return (($p.SelectNodes('.//w:t', $ns) | ForEach-Object { $_.InnerText }) -join '').Trim() }
function Replace-ParagraphText([hashtable]$map) {
    foreach ($p in $xml.SelectNodes('//w:p', $ns)) {
        $t = PText $p
        if ($map.ContainsKey($t)) { Set-PText $p $map[$t] }
    }
}
function Set-CellText($tc, [string]$text) {
    $p = $tc.SelectSingleNode('.//w:p', $ns)
    if ($p -eq $null) { return }
    Set-PText $p $text
    $paras = @($tc.SelectNodes('./w:p', $ns))
    for($i=1; $i -lt $paras.Count; $i++) { Set-PText $paras[$i] '' }
}
function Set-TableRows($tableIndex, [object[]]$rows) {
    $tbl = @($xml.SelectNodes('//w:tbl', $ns))[$tableIndex-1]
    $existingRows = @($tbl.SelectNodes('./w:tr', $ns))
    $template = $existingRows[[Math]::Min(1, $existingRows.Count-1)].CloneNode($true)
    for ($i=$existingRows.Count-1; $i -ge 0; $i--) { [void]$tbl.RemoveChild($existingRows[$i]) }
    for ($r=0; $r -lt $rows.Count; $r++) {
        if ($r -eq 0 -and $existingRows.Count -gt 0) { $newRow = $existingRows[0].CloneNode($true) }
        else { $newRow = $template.CloneNode($true) }
        $cells = @($newRow.SelectNodes('./w:tc', $ns))
        for ($c=0; $c -lt $cells.Count; $c++) {
            $value = ''
            if ($c -lt $rows[$r].Count) { $value = [string]$rows[$r][$c] }
            Set-CellText $cells[$c] $value
        }
        [void]$tbl.AppendChild($newRow)
    }
}

$paraMap = @{
    'Contents' = 'Contents'
    'Introduction' = 'Introduction'
    'Scope' = 'Scope'
    'Abbreviations' = 'Abbreviations'
    'Abbreviation' = 'Abbreviation'
    'UserRequirementsSpecification' = 'User Requirement Specification'
    'User Requirement andSpecification' = 'User Requirement and Specification'
    'Revision History2' = 'Revision History2'
    'Introduction4' = 'Introduction4'
    'Scope4' = 'Scope4'
    'Abbreviations4' = 'Abbreviations4'
    'UserRequirementsSpecification5' = 'User Requirement Specification5'
    '4.1 Re-calculate different pack sizes.' = '4.1 Goods-In / Packing List and digital Goods-In checklist.'
    '4.2 To add a trader in Supplier-wise split.' = '4.2 RP/RPi pack review and approval.'
    '4.3 To add a drop-down menu with list of active suppliers to' = '4.3 Batch Checker / Product Check Log and line clearance.'
    'be selected at the beginning of supplier-wise split phase.' = '4.4 Workflow status, audit trail and record retention.'
    '4.4 To add a country origin in the final generated PO.' = ''
    'UserAccess6' = 'User Access6'
    'Testing6' = 'Testing6'
    'Documents6' = 'Documents6'
    'Support6' = 'Support6'
    'The European Buying System is a critical application for managing orders from European countries within the B&S Healthcare. With this system, the buying team can order products from European countries on EUROPEAN BUYING web-page.' = 'The PLPI Batch Record / Paperless Process Improvement project is a phased digital improvement initiative for reducing reliance on printed paper records within the early PLPI batch workflow. The project will move key operational confirmations, document checks, evidence capture, line clearance activities and user sign-offs into PLPI while retaining the existing GMP control intent.'
    'The buyers would like to enhance the system with 4 additional functions:' = 'Phase 1 is focused on the first three workflow stages only:'
    'To re-calculate different pack size (where applicable) based on a country during the country split phase' = 'Goods-In / Packing List, including PO selection, document upload, Goods-In checklist completion, box and quantity verification and digital sign-off.'
    'To add traders in the supplier-wise split phase' = 'RP/RPi Pack Review, including digital review of the Goods-In pack, completeness checks, approval or rejection and controlled sign-off.'
    'To add country of origin in the PO' = 'Batch Checker / Product Check Log, including accepted stock review, product and batch verification, line clearance and PCL generation.'
    'To add a drop-down menu with list of active suppliers to be selected at the beginning of supplier-wise split phase.' = 'BAR Creation and all downstream production, printing, assembly, Pre-QP and QP release stages are outside the current implementation scope and will be reviewed in later phases.'
    'The scope of this project is limited to European buying system specifically to improve the functionality in the country wise split module and the supplier wise split module.' = 'The scope of this project is limited to Phase 1 of the PLPI paperless improvement programme. It covers the digital completion, review and approval of Goods-In / Packing List, RP/RPi Pack Review and Batch Checker / Product Check Log activities. The scope includes mandatory document and evidence checks, user/date/time capture, digital sign-off, line clearance, workflow status visibility and audit trail. BAR Creation, label printing, leaflet printing, carton/braille, leaflet folding, assembly, Post-Assembly QC, Pre-QP and QP Approval are excluded from this phase.'
    'The European Buying System is a critical application for managing orders from European countries within the B&S Healthcare. With this system, the buying team can order products from the European market and perform various order-related functions.' = 'The PLPI Batch Record / Paperless Process Improvement project is a phased digital improvement initiative for reducing reliance on printed paper records within the early PLPI batch workflow. The project will move key operational confirmations, document checks, evidence capture, line clearance activities and user sign-offs into PLPI while retaining the existing GMP control intent.'
    'The following user requirements have been identified to allow the successful implementation of the changes required for EUROPEAN BUYING Software.' = 'The following user requirements have been identified to allow the successful implementation of PLPI Batch Record / Paperless Process Improvement Phase 1.'
    'beginning of supplier-wise split phase.' = '4.4 Workflow status, audit trail and record retention.'
    'System owner of EUROPEAN BUYING will report to IT and QA department any deviation and incongruence with related SOPs to maintain the system itself at efficiency designed for its scope.' = 'Any deviation, failed test, incorrect workflow behaviour or mismatch with approved process expectations shall be recorded and reported to IT and QA for review and resolution before implementation approval.'    'The following user requirements have been identified to allow the successful implementation of the changes required for EUROPEAN BUYINGSoftware.' = 'The following user requirements have been identified to allow the successful implementation of PLPI Batch Record / Paperless Process Improvement Phase 1.'
    'There is no change to user access level. Rights to user access will remain same to existing European buying system' = 'User access shall be role based. Goods-In users shall complete PO selection, document upload, checklist completion and Goods-In sign-off. RP/RPi users shall review, approve or reject the digital pack. Batch Checkers shall complete product verification, line clearance and Product Check Log generation. QA/RP, Operations and IT users shall have review or administration access according to their responsibility.'
    'System owner of EUROPEAN BUYING shall be responsible for conducting all required verification test which will be identified/selected by the IT and QA department.' = 'The PLPI system owner shall be responsible for coordinating required verification testing identified by IT, QA and Operations. Testing shall cover role access, mandatory checks, document upload, digital sign-off, RP/RPi approval, rejection handling, Batch Checker verification, line clearance, Product Check Log generation, status visibility and audit trail.'
    'System owner of EUROPEAN BUYING will report to IT and QA department any deviation and incongruence with related SOPs to maintain the system itself at efficiency designed for its scope of use.' = 'Any deviation, failed test, incorrect workflow behaviour or mismatch with approved process expectations shall be recorded and reported to IT and QA for review and resolution before implementation approval.'
    'The software options will be described by related Standard Operating Procedure/Work Instruction.' = 'The revised PLPI workflow, digital checks, document upload expectations, review responsibilities and generated records shall be described in the applicable SOPs, work instructions, training material or controlled project documentation.'
    'IT operators will be available to provide support on the software to each user.' = 'IT shall provide technical support for PLPI configuration, access, document category setup, workflow queues and incident resolution. Business, QA/RP and Operations stakeholders shall support controlled use of the digital workflow and review of future phase requirements.'
}
Replace-ParagraphText $paraMap

Set-TableRows 1 @(
    @('Author','________________________________','Date','____________'),
    @('','Business Analyst','',''),
    @('','PLPI Batch Record / Paperless Process Improvement','','')
)
Set-TableRows 2 @(
    @('Reviewer','________________________________','Date','____________'),
    @('','Operations Representative','',''),
    @('','Goods-In / Warehouse Operations','',''),
    @('','','',''),
    @('','','',''),
    @('Reviewer','________________________________','Date','____________'),
    @('','IT Representative','',''),
    @('','PLPI System / Business Analyst','','')
)
Set-TableRows 3 @(
    @('Reviewer','________________________________','Date','____________'),
    @('','QA / RP Representative','',''),
    @('','Responsible Person / Quality Review','','')
)
Set-TableRows 4 @(
    @('Approver','________________________________','Date','____________'),
    @('','Project Sponsor / Quality Approver','',''),
    @('','Phase 1 Implementation Approval','','')
)
Set-TableRows 5 @(
    @('Version','Previous version','Reason for revision','Issued'),
    @('1','NA','New URS prepared for PLPI Batch Record / Paperless Process Improvement Phase 1.','Jul 2026')
)
Set-TableRows 6 @(
    @('PLPI','Product Label and Pack Information system'),
    @('URS','User Requirement Specification'),
    @('RP / RPi','Responsible Person / Responsible Person import'),
    @('PCL','Product Check Log'),
    @('PO','Purchase Order'),
    @('BAR','Batch Assembly Record'),
    @('GMP','Good Manufacturing Practice'),
    @('QP','Qualified Person')
)
Set-TableRows 7 @(
    @('URS ID','Requirements'),
    @('4.1.1','The system shall allow the Goods-In user to search, select or open the relevant PO within PLPI.'),
    @('4.1.2','The system shall display relevant packing list information required for Goods-In verification, including product, supplier, PO, batch, quantity, box, expiry and delivery details where available.'),
    @('4.1.3','The system shall provide a digital Goods-In checklist covering PO information, supplier documentation, received quantity, number of boxes, batch number, expiry date and temperature evidence where applicable.'),
    @('4.1.4','The system shall allow required supporting documents to be uploaded against the selected PO or batch, including PO, supplier invoice, supplier declaration, supplier packing list, temperature record, Goods-In checklist and delivery evidence.'),
    @('4.1.5','The system shall capture Goods-In user identity, role, date and time when the checklist is completed and digitally signed off.'),
    @('4.1.6','The system shall prevent progression to RP/RPi review until mandatory Goods-In checks, document upload and evidence requirements are completed.')
)
Set-TableRows 8 @(
    @('URS Id','Requirements'),
    @('4.2.1','The system shall provide an RP/RPi review queue containing Goods-In packs that have completed mandatory Goods-In checklist and document upload requirements.'),
    @('4.2.2','The system shall allow the RP/RPi user to view the generated PO packing list and all uploaded Goods-In documents in one place.'),
    @('4.2.3','The system shall allow RP/RPi review of document completeness, accuracy and suitability for downstream batch review.'),
    @('4.2.4','The system shall allow missing, incorrect or incomplete documents to be identified and returned for correction with comments where required.'),
    @('4.2.5','The system shall require RP/RPi digital approval before the pack is released to the Batch Checker queue.'),
    @('4.2.6','The system shall capture RP/RPi reviewer identity, role, decision, comments, date and time for each approval or rejection.')
)
Set-TableRows 9 @(
    @('URS Id','Requirements'),
    @('4.3.1','The system shall provide a Batch Checker queue containing packs approved by RP/RPi review.'),
    @('4.3.2','The system shall display accepted stock information required for batch verification, including product, supplier, batch number, expiry date, quantity, boxes, manufacturer details and document status.'),
    @('4.3.3','The system shall allow the Batch Checker to select the applicable product line and verify details against PLPI/system data, physical sample, invoice, supplier declaration and supporting records.'),
    @('4.3.4','The system shall require completion of batch number, expiry, quantity, manufacturer and relevant product verification checks before completion.'),
    @('4.3.5','The system shall provide line clearance checks within PLPI and require completion of line clearance before the batch can move forward.'),
    @('4.3.6','The system shall generate a digital Product Check Log record containing relevant batch details, document status, line clearance confirmation, user sign-off, date and time.')
)
Set-TableRows 10 @(
    @('URS Id','Requirements'),
    @('4.4.1','The system shall show current workflow status for each PO or batch across Goods-In, RP/RPi Review and Batch Checker / Product Check Log stages.'),
    @('4.4.2','The system shall capture audit trail entries for document upload, checklist completion, review decision, rejection, correction, approval, line clearance, PCL generation and sign-off.'),
    @('4.4.3','Audit trail entries shall include user, role, date, time, action, status change and comments where applicable.'),
    @('4.4.4','The system shall retain the completed digital pack in PLPI so records are available for review without relying on paper handoff.'),
    @('4.4.5','The system shall make completed Goods-In, RP/RPi review and Product Check Log records available to authorised downstream users.'),
    @('4.4.6','The system shall ensure Phase 1 completion status is clear before any later BAR or production-stage activity is started in future phases.')
)

$newXml = $xml.OuterXml`r`n$newXml = $newXml.Replace("URS European Buying", "URS PLPI Batch Record")`r`n$newXml = $newXml.Replace("EUROPEAN BUYING", "PLPI")`r`n$newXml = $newXml.Replace("European Buying", "PLPI Batch Record")`r`n$newXml = $newXml.Replace("European buying", "PLPI Batch Record")`r`n$newXml = $newXml.Replace("supplier-wise split", "workflow status")`r`n$newXml = $newXml.Replace("Supplier-wise split", "workflow status")
$newEntry = $zip.CreateEntry('word/document.xml')
$writer = New-Object IO.StreamWriter($newEntry.Open(), [Text.UTF8Encoding]::new($false))
$writer.Write($newXml)
$writer.Close()
$zip.Dispose()
Write-Output "DOCX=$out"



