$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.Drawing

$root = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation'
$baseBuilder = Join-Path $root 'tools\build_phase2_ds.ps1'
$baseOutput = Join-Path $root 'Project Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'
$output = Join-Path $root 'Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'
$shotDir = Join-Path $root 'tmp_phase2_ds_rebuild\screenshots'
$taskDir = Join-Path $root 'tmp_phase2_ds_rebuild\package_work'
$packageDir = Join-Path $taskDir 'package'
$zipPath = Join-Path $taskDir 'rebuilt-ds.zip'

& $baseBuilder
if(-not (Test-Path -LiteralPath $baseOutput)){ throw "Base DS was not created: $baseOutput" }
Copy-Item -LiteralPath $baseOutput -Destination $output -Force

$resolvedTask = [IO.Path]::GetFullPath($taskDir)
$resolvedRoot = [IO.Path]::GetFullPath((Join-Path $root 'tmp_phase2_ds_rebuild'))
if(-not $resolvedTask.StartsWith($resolvedRoot,[StringComparison]::OrdinalIgnoreCase)){ throw 'Unsafe task path.' }
if(Test-Path -LiteralPath $packageDir){ Remove-Item -LiteralPath $packageDir -Recurse -Force }
New-Item -ItemType Directory -Path $packageDir -Force | Out-Null
[IO.Compression.ZipFile]::ExtractToDirectory($output,$packageDir)

$figures = @(
  [pscustomobject]@{ Anchor='2.1 End-to-End Workflow'; File='00-module-launcher.png'; Caption='Existing PLPI module launcher and navigation context.' },
  [pscustomobject]@{ Anchor='3.1 B&S Batch Add and BAR Creation'; File='01-bs-batch-add.png'; Caption='B&S Batch Add search controls, selectable source-record grid, totals and BAR actions.' },
  [pscustomobject]@{ Anchor='3.1.2 Selection, Combination and Confirmation'; File='02-bs-batch-in-transit-warning.png'; Caption='Related Batch In Transit warning with Order No., Quantity and Yes/No decision controls.' },
  [pscustomobject]@{ Anchor='3.1.2 Selection, Combination and Confirmation'; File='03-generate-bar-confirmation.png'; Caption='Generate BAR Confirmation for the selected B&S batch.' },
  [pscustomobject]@{ Anchor='3.1.3 Generated BAR Design'; File='05-generated-bar-preview.png'; Caption='Controlled 13-page generated BAR preview.' },
  [pscustomobject]@{ Anchor='3.1.4 Line Clearance and Sign-off'; File='04-bar-line-clearance.png'; Caption='BAR Generated / Line Clearance screen and the three mandatory electronic checks.' },
  [pscustomobject]@{ Anchor='3.2 Printing Module - Common Design'; File='06-printer-menu.png'; Caption='Common Printer menu with Label Printing, Leaflet Printing, Carton Issuing and Braille Printing options.' },
  [pscustomobject]@{ Anchor='3.2.1 Unified Print Pop-up - Entire Component Is New'; File='11-print-dialog-default.png'; Caption='New Print Preview pop-up in its initial state.' },
  [pscustomobject]@{ Anchor='3.2.1 Unified Print Pop-up - Entire Component Is New'; File='12-print-dialog-extra.png'; Caption='New Print Preview pop-up with Extra Print selected and the controlled Reason field enabled.' },
  [pscustomobject]@{ Anchor='3.3 Label Printing Module'; File='07-label-printing-list.png'; Caption='Label Printing queue with common search fields and batch-result columns.' },
  [pscustomobject]@{ Anchor='3.3 Label Printing Module'; File='10-label-printing-standard-detail.png'; Caption='Standard Label Printing detail screen, component table and completion controls.' },
  [pscustomobject]@{ Anchor='3.3.1 Reboxing Change of Pack Size Gate'; File='08-label-printing-reboxing-detail.png'; Caption='Reboxing Label Printing detail with the Change of Pack Size prerequisite gate.' },
  [pscustomobject]@{ Anchor='3.4 Leaflet Printing Module'; File='13-leaflet-printing-list.png'; Caption='Leaflet Printing queue.' },
  [pscustomobject]@{ Anchor='3.4 Leaflet Printing Module'; File='14-leaflet-printing-detail.png'; Caption='Leaflet Printing detail table and controlled completion actions.' },
  [pscustomobject]@{ Anchor='3.5 Carton Issuing Module'; File='15-carton-issuing-list.png'; Caption='Carton Issuing queue.' },
  [pscustomobject]@{ Anchor='3.5 Carton Issuing Module'; File='16-carton-issuing-detail.png'; Caption='Carton Issuing detail before the normal issue is confirmed.' },
  [pscustomobject]@{ Anchor='3.5 Carton Issuing Module'; File='17-carton-issuing-confirmed.png'; Caption='Carton Issuing detail after Done records the confirming user and date/time.' },
  [pscustomobject]@{ Anchor='3.5 Carton Issuing Module'; File='18-carton-issue-extra-dialog.png'; Caption='Issue Extra Cartons pop-up with quantity, controlled reason and confirmation controls.' },
  [pscustomobject]@{ Anchor='3.6 Braille Printing Module'; File='19-braille-printing-list.png'; Caption='Braille Printing queue.' },
  [pscustomobject]@{ Anchor='3.6 Braille Printing Module'; File='20-braille-printing-detail.png'; Caption='Braille Printing detail with Braille Label and Braille Declaration Copy rows.' },
  [pscustomobject]@{ Anchor='3.7 Leaflet Folding Module'; File='21-leaflet-folding-list.png'; Caption='Leaflet Folding queue with Active and Completed records.' },
  [pscustomobject]@{ Anchor='3.7 Leaflet Folding Module'; File='22-leaflet-folding-detail.png'; Caption='Leaflet Folding detail before confirmation.' },
  [pscustomobject]@{ Anchor='3.7 Leaflet Folding Module'; File='23-leaflet-folding-completed.png'; Caption='Leaflet Folding completed state with user and date/time attribution.' }
)

$documentPath = Join-Path $packageDir 'word\document.xml'
$relsPath = Join-Path $packageDir 'word\_rels\document.xml.rels'
$mediaDir = Join-Path $packageDir 'word\media'
$document = New-Object Xml.XmlDocument
$document.PreserveWhitespace = $true
$document.Load($documentPath)
$ns = New-Object Xml.XmlNamespaceManager($document.NameTable)
$ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
$paragraphs = @($document.SelectNodes('//w:body/w:p',$ns))

function Get-ParagraphText([Xml.XmlNode]$paragraph){
  return (($paragraph.SelectNodes('.//w:t',$ns) | ForEach-Object { $_.InnerText }) -join '')
}
function Escape-Xml([string]$value){ return [Security.SecurityElement]::Escape($value) }
function New-FigureFragment([int]$number,[string]$rid,[string]$mediaName,[string]$source,[string]$caption){
  $image = [Drawing.Image]::FromFile($source)
  try {
    $cx = [long](6.15 * 914400)
    $cy = [long][Math]::Round($cx * $image.Height / $image.Width)
    $maxCy = [long](6.15 * 914400)
    if($cy -gt $maxCy){ $ratio = $maxCy / $cy; $cy = $maxCy; $cx = [long][Math]::Round($cx * $ratio) }
  } finally { $image.Dispose() }
  $safeCaption = Escape-Xml("Figure $number`: $caption")
  $docPr = 700 + $number
  $xml = @"
<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:pPr><w:jc w:val="center"/><w:keepNext/><w:spacing w:before="100" w:after="30"/></w:pPr><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="$cx" cy="$cy"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="$docPr" name="Wireframe figure $number" descr="Wireframe figure $number"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="$mediaName"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="$rid"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="$cx" cy="$cy"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>
<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:pPr><w:pStyle w:val="Caption"/><w:jc w:val="center"/><w:spacing w:after="120"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Verdana" w:hAnsi="Verdana"/><w:i/><w:color w:val="002060"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>$safeCaption</w:t></w:r></w:p>
"@
  $fragment = $document.CreateDocumentFragment()
  $fragment.InnerXml = $xml
  return $fragment
}

$relationshipRows = @()
for($index=0; $index -lt $figures.Count; $index++){
  $figure = $figures[$index]
  $source = Join-Path $shotDir $figure.File
  if(-not (Test-Path -LiteralPath $source)){ throw "Missing screenshot: $source" }
  $mediaName = ('phase2-wireframe-{0:D2}.png' -f ($index + 1))
  Copy-Item -LiteralPath $source -Destination (Join-Path $mediaDir $mediaName) -Force
  $relationshipRows += [pscustomobject]@{ Id=('rIdPhase2Figure' + ($index + 1)); Target=('media/' + $mediaName) }
}

$anchors = $figures | Group-Object Anchor
foreach($anchorGroup in $anchors){
  $anchorParagraph = $paragraphs | Where-Object { (Get-ParagraphText $_) -eq $anchorGroup.Name } | Select-Object -First 1
  if($null -eq $anchorParagraph){ throw "Heading not found for screenshot insertion: $($anchorGroup.Name)" }
  $groupFigures = @($anchorGroup.Group)
  for($reverse=$groupFigures.Count-1; $reverse -ge 0; $reverse--){
    $figure = $groupFigures[$reverse]
    $number = [Array]::IndexOf($figures,$figure) + 1
    $mediaName = ('phase2-wireframe-{0:D2}.png' -f $number)
    $rid = 'rIdPhase2Figure' + $number
    $fragment = New-FigureFragment $number $rid $mediaName (Join-Path $shotDir $figure.File) $figure.Caption
    [void]$anchorParagraph.ParentNode.InsertAfter($fragment,$anchorParagraph)
  }
}

$writerSettings = New-Object Xml.XmlWriterSettings
$writerSettings.Encoding = New-Object Text.UTF8Encoding($false)
$writerSettings.Indent = $false
$writer = [Xml.XmlWriter]::Create($documentPath,$writerSettings)
$document.Save($writer)
$writer.Close()

$rels = New-Object Xml.XmlDocument
$rels.PreserveWhitespace = $true
$rels.Load($relsPath)
$relNs = 'http://schemas.openxmlformats.org/package/2006/relationships'
foreach($item in $relationshipRows){
  $node = $rels.CreateElement('Relationship',$relNs)
  [void]$node.SetAttribute('Id',$item.Id)
  [void]$node.SetAttribute('Type','http://schemas.openxmlformats.org/officeDocument/2006/relationships/image')
  [void]$node.SetAttribute('Target',$item.Target)
  [void]$rels.DocumentElement.AppendChild($node)
}
$writer = [Xml.XmlWriter]::Create($relsPath,$writerSettings)
$rels.Save($writer)
$writer.Close()

$contentTypesPath = Join-Path $packageDir '[Content_Types].xml'
$contentTypes = New-Object Xml.XmlDocument
$contentTypes.PreserveWhitespace = $true
$contentTypes.Load($contentTypesPath)
$ctNs = New-Object Xml.XmlNamespaceManager($contentTypes.NameTable)
$ctNs.AddNamespace('ct','http://schemas.openxmlformats.org/package/2006/content-types')
if($null -eq $contentTypes.SelectSingleNode('//ct:Default[@Extension="png"]',$ctNs)){
  $default = $contentTypes.CreateElement('Default','http://schemas.openxmlformats.org/package/2006/content-types')
  [void]$default.SetAttribute('Extension','png')
  [void]$default.SetAttribute('ContentType','image/png')
  [void]$contentTypes.DocumentElement.AppendChild($default)
  $writer = [Xml.XmlWriter]::Create($contentTypesPath,$writerSettings)
  $contentTypes.Save($writer)
  $writer.Close()
}

if(Test-Path -LiteralPath $zipPath){ Remove-Item -LiteralPath $zipPath -Force }
[IO.Compression.ZipFile]::CreateFromDirectory($packageDir,$zipPath,[IO.Compression.CompressionLevel]::Optimal,$false)
Copy-Item -LiteralPath $zipPath -Destination $output -Force

$word = $null
$doc = $null
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $doc = $word.Documents.Open($output)
  foreach($toc in @($doc.TablesOfContents)){ [void]$toc.Update() }
  [void]$doc.Fields.Update()
  $doc.Save()
} finally {
  if($doc){ $doc.Close($false) }
  if($word){ $word.Quit() }
  if($doc){ [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($doc) }
  if($word){ [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($word) }
  [GC]::Collect(); [GC]::WaitForPendingFinalizers()
}

Write-Output "Rebuilt with $($figures.Count) wireframe figures: $output"
