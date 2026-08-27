$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$target = Join-Path $root 'docz\DS-PLPI BAR.docx'
$image = Join-Path $root 'temp_ds_current_wireframe\screenshots\00-ds-workflow.png'
$work = Join-Path $root 'temp_ds_workflow_correction'
$output = Join-Path $root 'temp_ds_workflow_correction.docx'
$wNs = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
$aNs = 'http://schemas.openxmlformats.org/drawingml/2006/main'
$rNs = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
$wpNs = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'

$lock = $null
try {
    $lock = [System.IO.File]::Open($target, 'Open', 'ReadWrite', 'None')
}
catch {
    throw 'The DS document is open or locked. Close it in Word before applying the workflow correction.'
}
finally {
    if ($lock) { $lock.Dispose() }
}

if (Test-Path -LiteralPath $work) { Remove-Item -LiteralPath $work -Recurse -Force }
New-Item -ItemType Directory -Path $work | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($target, $work)

Copy-Item -LiteralPath $image -Destination (Join-Path $work 'word\media\image1.png') -Force

$documentPath = Join-Path $work 'word\document.xml'
$xml = New-Object System.Xml.XmlDocument
$xml.PreserveWhitespace = $true
$xml.Load($documentPath)
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace('w', $wNs)
$ns.AddNamespace('a', $aNs)
$ns.AddNamespace('r', $rNs)
$ns.AddNamespace('wp', $wpNs)

$oldText = 'Process flow: WSC India initiation, Goods-In receipt and Team Lead approval, Packing List completion, RPi Pack Creation, RPi approval and PDF/email processing, then Batch Checker verification, PCL completion and read-only summary access.'
$newText = 'Queue separation: Saving Add Packing List creates the PO queue in RPi Pack Creation only. Generating the Goods Receiving Checklist creates the work item in the Goods-In Team tablet queue. The normal workflow then continues through Goods-In and Team Lead approval, Packing List completion, RPi approval, PDF/email processing, Batch Checker verification and PCL completion. Goods-In Summary remains a separate read-only supporting view.'

foreach ($paragraph in $xml.SelectNodes('//w:body/w:p', $ns)) {
    $textNodes = @($paragraph.SelectNodes('.//w:t', $ns))
    $text = ($textNodes | ForEach-Object { $_.InnerText }) -join ''
    if ($text -eq $oldText) {
        $textNodes[0].InnerText = $newText
        for ($i = 1; $i -lt $textNodes.Count; $i++) { $textNodes[$i].InnerText = '' }
        break
    }
}

foreach ($blip in $xml.SelectNodes('//a:blip', $ns)) {
    if ($blip.GetAttribute('embed', $rNs) -ne 'rId8') { continue }
    $container = $blip.SelectSingleNode('ancestor::*[local-name()="inline" or local-name()="anchor"][1]')
    $extent = $container.SelectSingleNode('./wp:extent', $ns)
    $shapeExtent = $container.SelectSingleNode('.//a:xfrm/a:ext', $ns)
    $cx = '5699760'
    $cy = '3686780'
    if ($extent) {
        [void]$extent.SetAttribute('cx', $cx)
        [void]$extent.SetAttribute('cy', $cy)
    }
    if ($shapeExtent) {
        [void]$shapeExtent.SetAttribute('cx', $cx)
        [void]$shapeExtent.SetAttribute('cy', $cy)
    }
    $srcRect = $blip.ParentNode.SelectSingleNode('./a:srcRect', $ns)
    if ($srcRect) { [void]$blip.ParentNode.RemoveChild($srcRect) }
    break
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

'Applied the corrected DS workflow diagram and queue-separation text.'
