$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$target = Join-Path $root 'docz\DS-PLPI BAR.docx'
$work = Join-Path $root 'temp_ds_geometry_fix'
$output = Join-Path $root 'temp_ds_geometry_fix.docx'
$aNs = 'http://schemas.openxmlformats.org/drawingml/2006/main'
$rNs = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
$wpNs = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'

if (Test-Path -LiteralPath $work) { Remove-Item -LiteralPath $work -Recurse -Force }
New-Item -ItemType Directory -Path $work | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($target, $work)

$documentPath = Join-Path $work 'word\document.xml'
$xml = New-Object System.Xml.XmlDocument
$xml.PreserveWhitespace = $true
$xml.Load($documentPath)
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace('a', $aNs)
$ns.AddNamespace('r', $rNs)
$ns.AddNamespace('wp', $wpNs)

$geometry = @{
    'rId8'  = @{ cx = '5699760'; cy = '3517563' }
    'rId9'  = @{ cx = '4199578'; cy = '6043286' }
    'rId10' = @{ cx = '4199578'; cy = '6043286' }
    'rId11' = @{ cx = '4199578'; cy = '6043286' }
    'rId12' = @{ cx = '4199578'; cy = '6043286' }
}

foreach ($blip in $xml.SelectNodes('//a:blip', $ns)) {
    $id = $blip.GetAttribute('embed', $rNs)
    if (-not $geometry.ContainsKey($id)) { continue }

    $blipFill = $blip.ParentNode
    $srcRect = $blipFill.SelectSingleNode('./a:srcRect', $ns)
    if ($srcRect) { [void]$blipFill.RemoveChild($srcRect) }

    $container = $blip.SelectSingleNode('ancestor::*[local-name()="inline" or local-name()="anchor"][1]')
    $extent = $container.SelectSingleNode('./wp:extent', $ns)
    if ($extent) {
        [void]$extent.SetAttribute('cx', $geometry[$id].cx)
        [void]$extent.SetAttribute('cy', $geometry[$id].cy)
    }
    $shapeExtent = $container.SelectSingleNode('.//a:xfrm/a:ext', $ns)
    if ($shapeExtent) {
        [void]$shapeExtent.SetAttribute('cx', $geometry[$id].cx)
        [void]$shapeExtent.SetAttribute('cy', $geometry[$id].cy)
    }
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

"Corrected replacement-image crop and aspect ratio."
