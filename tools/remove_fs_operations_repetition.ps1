$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$target = Join-Path $root 'docz\FS-PLPI BAR - Goods Receiving Checklist Updated.docx'
$work = Join-Path $root 'temp_fs_operations_fix'
$output = Join-Path $root 'temp_fs_operations_fix.docx'
$backup = Join-Path $root 'temp_fs_before_operations_fix.docx'
$wNs = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

$oldText = 'The PO queue is created as soon as the Add Packing List entry is saved. Supplier Invoice, Supplier Packing List and Supplier Declaration files uploaded in Add Packing List are visible against the respective PO. When the Goods Receiving Checklist is completed, a single-PO checklist is linked to that PO; a checklist containing multiple POs automatically creates one merged PO set and is retained once as a shared document. The generated Packing List is linked automatically to each respective PO. Shared documents are retained once for the merged set, while PO-specific documents remain against each PO. Goods-In opens the pre-populated pack, uploads only missing files and submits the complete pack to RPi Approval.'
$newText = 'Goods-In opens the pre-populated individual or merged PO pack in RPi Pack Creation, reviews the linked documents, uploads only files marked Upload required and selects Send PO Set to RPi when the pack is complete.'

$lock = $null
try {
    $lock = [System.IO.File]::Open($target, 'Open', 'ReadWrite', 'None')
}
catch {
    throw 'The FS document is open or locked. Close it in Word before applying the correction.'
}
finally {
    if ($lock) { $lock.Dispose() }
}

Copy-Item -LiteralPath $target -Destination $backup -Force
if (Test-Path -LiteralPath $work) { Remove-Item -LiteralPath $work -Recurse -Force }
New-Item -ItemType Directory -Path $work | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($target, $work)

$documentPath = Join-Path $work 'word\document.xml'
$xml = New-Object System.Xml.XmlDocument
$xml.PreserveWhitespace = $true
$xml.Load($documentPath)
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace('w', $wNs)
$updated = 0

foreach ($paragraph in $xml.SelectNodes('//w:p', $ns)) {
    $textNodes = @($paragraph.SelectNodes('.//w:t', $ns))
    $text = ($textNodes | ForEach-Object { $_.InnerText }) -join ''
    if ($text -ne $oldText) { continue }
    $textNodes[0].InnerText = $newText
    for ($i = 1; $i -lt $textNodes.Count; $i++) { $textNodes[$i].InnerText = '' }
    $updated++
}

if ($updated -ne 1) {
    throw "Expected one Operations paragraph but updated $updated."
}

$writerSettings = New-Object System.Xml.XmlWriterSettings
$writerSettings.Encoding = New-Object System.Text.UTF8Encoding($false)
$writerSettings.Indent = $false
$writer = [System.Xml.XmlWriter]::Create($documentPath, $writerSettings)
$xml.Save($writer)
$writer.Close()

if (Test-Path -LiteralPath $output) { Remove-Item -LiteralPath $output -Force }
[System.IO.Compression.ZipFile]::CreateFromDirectory($work, $output, [System.IO.Compression.CompressionLevel]::Optimal, $false)
Copy-Item -LiteralPath $output -Destination $target -Force

'Shortened the repeated FS 3.2 Operations content.'
