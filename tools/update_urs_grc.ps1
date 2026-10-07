$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression

$root = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation'
$source = Join-Path $root 'docz\URS-PLPI BAR.docx'
$working = Join-Path $root 'temp_grc_update\URS-PLPI-BAR-working.docx'
Copy-Item -LiteralPath $source -Destination $working -Force

function Read-Zip-Entry($zip, [string]$name) {
  $entry = $zip.GetEntry($name)
  if ($null -eq $entry) { return $null }
  $reader = New-Object IO.StreamReader($entry.Open())
  $value = $reader.ReadToEnd()
  $reader.Close()
  return $value
}

function Write-Zip-Entry($zip, [string]$name, [string]$value) {
  $entry = $zip.GetEntry($name)
  if ($null -ne $entry) { $entry.Delete() }
  $entry = $zip.CreateEntry($name, [IO.Compression.CompressionLevel]::Optimal)
  $writer = New-Object IO.StreamWriter($entry.Open(), [Text.UTF8Encoding]::new($false))
  $writer.Write($value)
  $writer.Close()
}

function Node-Text($node, $ns) {
  return (($node.SelectNodes('.//w:t', $ns) | ForEach-Object InnerText) -join '')
}

function Set-Paragraph-Text($paragraph, [string]$text, $xml, $ns) {
  $pPr = $paragraph.SelectSingleNode('./w:pPr', $ns)
  $firstRun = $paragraph.SelectSingleNode('./w:r', $ns)
  $rPr = if ($null -ne $firstRun) { $firstRun.SelectSingleNode('./w:rPr', $ns) } else { $null }
  foreach ($child in @($paragraph.ChildNodes)) {
    if ($child -ne $pPr) { [void]$paragraph.RemoveChild($child) }
  }
  $run = $xml.CreateElement('w', 'r', $ns.LookupNamespace('w'))
  if ($null -ne $rPr) { [void]$run.AppendChild($rPr.CloneNode($true)) }
  $textNode = $xml.CreateElement('w', 't', $ns.LookupNamespace('w'))
  if ($text.StartsWith(' ') -or $text.EndsWith(' ')) {
    $space = $xml.CreateAttribute('xml', 'space', 'http://www.w3.org/XML/1998/namespace')
    $space.Value = 'preserve'
    [void]$textNode.Attributes.Append($space)
  }
  $textNode.InnerText = $text
  [void]$run.AppendChild($textNode)
  [void]$paragraph.AppendChild($run)
}

function Set-Cell-Text($cell, [string]$text, $xml, $ns) {
  $paragraphs = @($cell.SelectNodes('./w:p', $ns))
  if ($paragraphs.Count -eq 0) {
    $paragraph = $xml.CreateElement('w', 'p', $ns.LookupNamespace('w'))
    [void]$cell.AppendChild($paragraph)
  } else {
    $paragraph = $paragraphs[0]
    for ($i = 1; $i -lt $paragraphs.Count; $i++) { [void]$cell.RemoveChild($paragraphs[$i]) }
  }
  Set-Paragraph-Text $paragraph $text $xml $ns
}

function Replace-Paragraph([string]$contains, [string]$replacement, $xml, $ns) {
  $matches = @($xml.SelectNodes('//w:p', $ns) | Where-Object { (Node-Text $_ $ns) -like "*$contains*" })
  if ($matches.Count -ne 1) { throw "Expected one paragraph containing '$contains'; found $($matches.Count)." }
  Set-Paragraph-Text $matches[0] $replacement $xml $ns
}

$stream = [IO.File]::Open($working, [IO.FileMode]::Open, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
$zip = New-Object IO.Compression.ZipArchive($stream, [IO.Compression.ZipArchiveMode]::Update, $false)

[xml]$xml = Read-Zip-Entry $zip 'word/document.xml'
$ns = New-Object Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')

$requirements = [ordered]@{
  '4.1.11' = 'The system shall provide the digital Goods Receiving Checklist against the selected PO and shall display or capture the PO number, supplier name, approved transporter, vehicle number, driver name and delivery or collection address.'
  '4.1.12' = 'The system shall capture the driver signature and shall allow the Delivery or Collection Note Address to be entered or copied from the Delivery or Collection Address.'
  '4.1.13' = 'The system shall require the Goods-In user to record vehicle cleanliness, the presence of non-pharmaceutical products and any pallet, box or outer damage using controlled Yes or No responses.'
  '4.1.14' = 'When vehicle cleanliness is No, non-pharmaceutical products is Yes, or pallet, box or outer damage is Yes, the system shall flag the inspection as failed, prevent approval for unpacking and require quarantine and QA review.'
  '4.1.15' = 'The system shall record Goods-In line clearance with the authenticated operator and date and time. A clearance reset before final submission shall require confirmation and shall remain traceable.'
  '4.1.16' = 'The system shall capture the Goods Receiver name, signature, date and comments and shall capture the Goods-In Information Confirmed decision with the confirming user and date and time. A No decision shall quarantine the stock and route the record for QA review.'
  '4.1.17' = 'The system shall provide QA disposition when QA review is required, including Quarantine for Investigation, Approved for Unpacking or Reject, comments, QA identity and date and time. QA approval shall not be mandatory for a normal accepted receipt.'
  '4.1.18' = 'The system shall allow supporting supplier documents and damage or cleanliness photographs to be attached to the selected PO and retained with the completed Goods Receiving Checklist.'
  '4.1.19' = 'The system shall autosave an incomplete checklist as a temporary tablet draft and restore the latest draft after an interruption. A temporary draft shall not be treated as the final controlled record.'
  '4.1.20' = 'The system shall display checklist completion and workflow status, allow a controlled export or print preview and prevent final submission until mandatory fields, signatures, line clearance and any required QA disposition are complete. Successful submission shall create a read-only controlled record and clear the temporary draft.'
}

$rows = @($xml.SelectNodes('//w:tr', $ns))
foreach ($row in $rows) {
  $cells = @($row.SelectNodes('./w:tc', $ns))
  if ($cells.Count -eq 0) { continue }
  $id = (Node-Text $cells[0] $ns).Trim()
  if ($requirements.Contains($id)) { [void]$row.ParentNode.RemoveChild($row) }
}

$baseRow = $null
foreach ($row in @($xml.SelectNodes('//w:tr', $ns))) {
  $cells = @($row.SelectNodes('./w:tc', $ns))
  if ($cells.Count -ge 2 -and (Node-Text $cells[0] $ns).Trim() -eq '4.1.10') { $baseRow = $row; break }
}
if ($null -eq $baseRow) { throw 'Could not locate URS 4.1.10 row.' }

$insertAfter = $baseRow
foreach ($entry in $requirements.GetEnumerator()) {
  $newRow = $baseRow.CloneNode($true)
  $cells = @($newRow.SelectNodes('./w:tc', $ns))
  Set-Cell-Text $cells[0] $entry.Key $xml $ns
  Set-Cell-Text $cells[1] $entry.Value $xml $ns
  [void]$insertAfter.ParentNode.InsertAfter($newRow, $insertAfter)
  $insertAfter = $newRow
}

foreach ($row in @($xml.SelectNodes('//w:tr', $ns))) {
  $cells = @($row.SelectNodes('./w:tc', $ns))
  if ($cells.Count -ge 2 -and (Node-Text $cells[0] $ns).Trim() -eq '4.1.9') {
    Set-Cell-Text $cells[1] 'The system shall prevent release to RP/RPi review until the Goods Receiving Checklist is completed, mandatory documents are available or verified, line clearance and Goods-In sign-off are recorded, and any required QA disposition is complete.' $xml $ns
  }
}

Replace-Paragraph 'The PLPI Batch Record Automation project is a phased digital improvement initiative' 'The PLPI Batch Record Automation project digitises the early PLPI batch workflow from Goods-In receipt through RP/RPi review and Product Check Log completion. It replaces the printed Goods Receiving Checklist with a tablet workflow covering delivery details, vehicle inspection, line clearance, evidence, controlled sign-off and conditional QA disposition while retaining the existing GMP control intent.' $xml $ns
Replace-Paragraph 'Batch Checker / Product Check Log, including accepted stock review' 'Batch Checker / Product Check Log, including accepted stock review, product and batch verification, line clearance review and PCL generation after external stock acceptance is reflected in PLPI.' $xml $ns
Replace-Paragraph 'The scope of this project is limited to Phase 1 of the PLPI paperless improvement' 'The scope is limited to Phase 1 of the PLPI paperless improvement. It covers the digital Goods Receiving Checklist, delivery and driver details, vehicle inspection, line clearance, evidence capture, Goods-In confirmation, conditional QA disposition, Packing List verification, RP/RPi Pack Review and Batch Checker / Product Check Log activities. It also includes draft recovery, status visibility, controlled export or print, final submission, audit trail and workflow gating.' $xml $ns
Replace-Paragraph 'User access shall be role based.' 'User access shall be role based. Goods-In users shall complete the tablet checklist, vehicle checks, evidence capture, line clearance, Packing List verification and Goods-In sign-off. QA users shall record a disposition only when QA review is required. RP/RPi users shall review, approve or reject the digital pack. Batch Checkers shall complete product verification, line clearance review and Product Check Log generation after external stock acceptance is reflected in PLPI. Operations and IT users shall have review or administration access according to approved responsibility.' $xml $ns
Replace-Paragraph 'The PLPI system owner shall be responsible for coordinating required verification testing' 'The PLPI system owner shall coordinate verification testing identified by IT, QA and Operations. Testing shall cover role access; tablet data entry; driver and Goods-In signatures; address copying; vehicle inspection; failed-inspection quarantine; conditional QA disposition; line-clearance recording and reset; document and photograph attachments; draft autosave and restore; export or print preview; final submission and locking; Packing List controls; RP/RPi approval; combined PDF generation; email issue to sc.india@bnsdistribution.com; external acceptance visibility; Batch Checker controls; status visibility and audit trail.' $xml $ns
Replace-Paragraph 'The revised PLPI workflow, digital Goods Receiving Checklist' 'The revised PLPI workflow, digital Goods Receiving Checklist, vehicle inspection and quarantine rules, line-clearance expectations, evidence requirements, signature responsibilities, conditional QA review, draft recovery, final submission, RP/RPi approval, combined PDF and email process and generated records shall be described in the applicable SOPs, work instructions, training material or controlled project documentation.' $xml $ns
Replace-Paragraph 'Once the combined PDF pack is generated, the system shall send the PDF pack' 'Once the combined PDF pack is generated, the system shall send it to sc.india@bnsdistribution.com for external stock-control acceptance.' $xml $ns
Replace-Paragraph 'Warehouse Stock Control India' 'External stock-control team' $xml $ns

Write-Zip-Entry $zip 'word/document.xml' $xml.OuterXml

$settings = Read-Zip-Entry $zip 'word/settings.xml'
$settings = [regex]::Replace($settings, '<w:documentProtection\b[^>]*/>', '')
$settings = [regex]::Replace($settings, '<w:writeProtection\b[^>]*/>', '')
if ($settings -match '<w:updateFields[^>]*/>') {
  $settings = [regex]::Replace($settings, '<w:updateFields[^>]*/>', '<w:updateFields w:val="true"/>')
} else {
  $settings = $settings -replace '</w:settings>', '<w:updateFields w:val="true"/></w:settings>'
}
Write-Zip-Entry $zip 'word/settings.xml' $settings

$zip.Dispose()
$stream.Dispose()

$validationStream = [IO.File]::Open($working, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::ReadWrite)
$validationZip = New-Object IO.Compression.ZipArchive($validationStream, [IO.Compression.ZipArchiveMode]::Read, $false)
[xml]$validationXml = Read-Zip-Entry $validationZip 'word/document.xml'
$validationText = (($validationXml.SelectNodes('//w:t', $ns) | ForEach-Object InnerText) -join ' ')
$validationSettings = Read-Zip-Entry $validationZip 'word/settings.xml'
$validationZip.Dispose()
$validationStream.Dispose()

foreach ($id in $requirements.Keys) {
  if ($validationText -notlike "*$id*") { throw "Missing new URS ID: $id" }
}
foreach ($required in @('QA approval shall not be mandatory', 'sc.india@bnsdistribution.com', 'temporary tablet draft', 'damage or cleanliness photographs')) {
  if ($validationText -notlike "*$required*") { throw "Missing URS content: $required" }
}
foreach ($forbidden in @('wscindia@gmail.com', 'Warehouse Stock Control India')) {
  if ($validationText -like "*$forbidden*") { throw "Obsolete URS content remains: $forbidden" }
}
if ($validationSettings -match '<w:(?:documentProtection|writeProtection)\b') { throw 'URS protection remains enabled.' }

Move-Item -LiteralPath $working -Destination $source -Force
Write-Output "UPDATED=$source"
Write-Output "SHA256=$((Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash)"
