$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$docx = Resolve-Path -LiteralPath "Reference Doc (Templates)\URS-EU BUYING SYSTEM- Oct 2023 - backup before PLPI content.docx"
$tmp = Join-Path $env:TEMP ("urs_revert_" + [guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $tmp | Out-Null
[IO.Compression.ZipFile]::ExtractToDirectory($docx.Path, $tmp)
$docXmlPath = Join-Path $tmp "word\document.xml"
[xml]$xml = Get-Content -LiteralPath $docXmlPath -Raw
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')

function Get-Text($node) { (($node.SelectNodes('.//w:t', $ns) | ForEach-Object { $_.InnerText }) -join '').Trim() }
function Set-Text($node, [string]$text) {
  $texts=@($node.SelectNodes('.//w:t', $ns)); if($texts.Count -eq 0){return}
  $texts[0].InnerText=$text; for($i=1;$i -lt $texts.Count;$i++){ $texts[$i].InnerText='' }
}
function Set-TableRows($tableIndex, [object[]]$rows) {
  $tbl=@($xml.SelectNodes('//w:tbl',$ns))[$tableIndex-1]
  $existing=@($tbl.SelectNodes('./w:tr',$ns))
  $header=$existing[0].CloneNode($true)
  $body=$existing[[Math]::Min(1,$existing.Count-1)].CloneNode($true)
  for($i=$existing.Count-1;$i -ge 0;$i--){ [void]$tbl.RemoveChild($existing[$i]) }
  for($r=0;$r -lt $rows.Count;$r++){
    $new=$(if($r -eq 0){$header.CloneNode($true)}else{$body.CloneNode($true)})
    $cells=@($new.SelectNodes('./w:tc',$ns))
    for($c=0;$c -lt $cells.Count;$c++){
      $value=''; if($c -lt $rows[$r].Count){$value=[string]$rows[$r][$c]}
      Set-Text $cells[$c] $value
    }
    [void]$tbl.AppendChild($new)
  }
}
function Is-Text($node,[string]$text){ (Get-Text $node) -eq $text }

# Revert prose and contents lines from the detail expansion.
foreach($p in @($xml.SelectNodes('//w:p',$ns))){
  $t=Get-Text $p
  switch($t){
    '4.4 Workflow status, exception handling and audit trail.' { [void]$p.ParentNode.RemoveChild($p) }
    'User Access8' { Set-Text $p 'User Access7' }
    'Testing8' { Set-Text $p 'Testing7' }
    'Documents9' { Set-Text $p 'Documents7' }
    'Support9' { Set-Text $p 'Support7' }
    'The PLPI Batch Record Automation project is a phased digital improvement initiative for reducing reliance on printed paper records within the early PLPI batch workflow. The project will move key operational confirmations, document checks, evidence capture, line clearance activities, queue handoffs and user sign-offs into PLPI while retaining the existing GMP control intent.' { Set-Text $p 'The PLPI Batch Record Automation project is a phased digital improvement initiative for reducing reliance on printed paper records within the early PLPI batch workflow. The project will move key operational confirmations, document checks, evidence capture, line clearance activities and user sign-offs into PLPI while retaining the existing GMP control intent.' }
    'The scope of this project is limited to Phase 1 of the PLPI paperless improvement. It covers the digital completion, review and approval of Goods-In / Packing List, RP/RPi Pack Review and Batch Checker / Product Check Log activities. The scope includes module login, role-based queues, mandatory document and evidence checks, user/date/time capture, digital sign-off, line clearance, exception handling, workflow status visibility and audit trail. BAR Creation, label printing, leaflet printing, carton/braille, leaflet folding, assembly, Post-Assembly QC, Pre-QP and QP Approval are excluded from this phase.' { Set-Text $p 'The scope of this project is limited to Phase 1 of the PLPI paperless improvement. It covers the digital completion, review and approval of Goods-In / Packing List, RP/RPi Pack Review and Batch Checker / Product Check Log activities. The scope includes mandatory document and evidence checks, user/date/time capture, digital sign-off, line clearance, workflow status visibility and audit trail. BAR Creation, label printing, leaflet printing, carton/braille, leaflet folding, assembly, Post-Assembly QC, Pre-QP and QP Approval are excluded from this phase.' }
    'The following user requirements have been identified to allow the successful implementation of the changes required for PLPI Phase 1. The requirements reflect the Goods-In, RP/RPi and Batch Checker workflows shown in the wireframe, including queues, document packs, mandatory checks, electronic sign-off and controlled handoff.' { Set-Text $p 'The following user requirements have been identified to allow the successful implementation of the changes required for PLPI Software.' }
    'User access shall be role based. Goods-In users shall complete PO selection, packing list preparation, document upload, checklist completion and Goods-In sign-off. RP/RPi users shall search, review, approve or reject the digital pack. Batch Checkers shall search approved packs, complete product verification, line clearance and Product Check Log generation. QA/RP, Operations and IT users shall have review or administration access according to their responsibility. Users shall only see the queue and actions applicable to the module they are authorised to use.' { Set-Text $p 'User access shall be role based. Goods-In users shall complete PO selection, document upload, checklist completion and Goods-In sign-off. RP/RPi users shall review, approve or reject the digital pack. Batch Checkers shall complete product verification, line clearance and Product Check Log generation. QA/RP, Operations and IT users shall have review or administration access according to their responsibility.' }
    'The PLPI system owner shall be responsible for coordinating required verification testing identified by IT, QA and Operations. Testing shall cover role access, module login, search and queue behaviour, mandatory checks, document upload, document verification, digital sign-off, RP/RPi approval, rejection handling, Batch Checker verification, line clearance, Product Check Log generation, status visibility, correction workflow and audit trail.' { Set-Text $p 'The PLPI system owner shall be responsible for coordinating required verification testing identified by IT, QA and Operations. Testing shall cover role access, mandatory checks, document upload, digital sign-off, RP/RPi approval, rejection handling, Batch Checker verification, line clearance, Product Check Log generation, status visibility and audit trail.' }
    'The revised PLPI workflow, digital checks, document upload expectations, review responsibilities, generated records, exception handling and queue handoffs shall be described in the applicable SOPs, work instructions, training material or controlled project documentation.' { Set-Text $p 'The revised PLPI workflow, digital checks, document upload expectations, review responsibilities and generated records shall be described in the applicable SOPs, work instructions, training material or controlled project documentation.' }
  }
}

# Remove the 4.4 table if present. It is the last requirements table whose first data row is 4.4.1.
foreach($tbl in @($xml.SelectNodes('//w:tbl',$ns))){
  $txt=Get-Text $tbl
  if($txt -like '*4.4.1*' -and $txt -like '*Workflow status*'){
    [void]$tbl.ParentNode.RemoveChild($tbl)
  }
}

# Restore abbreviation table to the pre-expansion rows if the table exists at current index 5.
Set-TableRows 5 @(
  @('PLPI','Parallel licensing and Parallel imports'),
  @('PCL','Product Check Log'),
  @('PO','Purchase Order'),
  @('BAR','Batch Assembly Record'),
  @('GMP','Good Manufacturing Practice'),
  @('QP','Qualified Person'),
  @('RP / RPi','Responsible Person / Responsible Person import')
)

# Restore requirements to six rows per section. Current table indexes are 6/7/8 after the existing front matter.
Set-TableRows 6 @(
  @('URS ID','Requirements'),
  @('4.1.1','The system shall allow the Goods-In user to search, select or open the relevant PO within PLPI.'),
  @('4.1.2','The system shall display relevant packing list information required for Goods-In verification, including product, supplier, PO, batch, quantity, box, expiry and delivery details where available.'),
  @('4.1.3','The system shall provide a digital Goods-In checklist covering PO information, supplier documentation, received quantity, number of boxes, batch number, expiry date and temperature evidence where applicable.'),
  @('4.1.4','The system shall allow required supporting documents to be uploaded against the selected PO or batch, including PO, supplier invoice, supplier declaration, supplier packing list, temperature record, Goods-In checklist and delivery evidence.'),
  @('4.1.5','The system shall capture Goods-In user identity, role, date and time when the checklist is completed and digitally signed off.'),
  @('4.1.6','The system shall prevent progression to RP/RPi review until mandatory Goods-In checks, document upload and evidence requirements are completed.')
)
Set-TableRows 7 @(
  @('URS Id','Requirements'),
  @('4.2.1','The system shall provide an RP/RPi review queue containing Goods-In packs that have completed mandatory Goods-In checklist and document upload requirements.'),
  @('4.2.2','The system shall allow the RP/RPi user to view the generated PO packing list and all uploaded Goods-In documents in one place.'),
  @('4.2.3','The system shall allow RP/RPi review of document completeness, accuracy and suitability for downstream batch review.'),
  @('4.2.4','The system shall allow missing, incorrect or incomplete documents to be identified and returned for correction with comments where required.'),
  @('4.2.5','The system shall require RP/RPi digital approval before the pack is released to the Batch Checker queue.'),
  @('4.2.6','The system shall capture RP/RPi reviewer identity, role, decision, comments, date and time for each approval or rejection.')
)
Set-TableRows 8 @(
  @('URS Id','Requirements'),
  @('4.3.1','The system shall provide a Batch Checker queue containing packs approved by RP/RPi review.'),
  @('4.3.2','The system shall display accepted stock information required for batch verification, including product, supplier, batch number, expiry date, quantity, boxes, manufacturer details and document status.'),
  @('4.3.3','The system shall allow the Batch Checker to select the applicable product line and verify details against PLPI/system data, physical sample, invoice, supplier declaration and supporting records.'),
  @('4.3.4','The system shall require completion of batch number, expiry, quantity, manufacturer and relevant product verification checks before completion.'),
  @('4.3.5','The system shall provide line clearance checks within PLPI and require completion of line clearance before the batch can move forward.'),
  @('4.3.6','The system shall generate a digital Product Check Log record containing relevant batch details, document status, line clearance confirmation, user sign-off, date and time.')
)

$xml.Save($docXmlPath)
Remove-Item -LiteralPath $docx.Path -Force
[IO.Compression.ZipFile]::CreateFromDirectory($tmp, $docx.Path)
Remove-Item -LiteralPath $tmp -Recurse -Force
Write-Output "REVERTED=$($docx.Path)"
