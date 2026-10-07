$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$target = Join-Path $root 'docz\DS-PLPI BAR.docx'
$sourceImage = Join-Path $root 'WSC-Generate-Checklist.png'
$work = Join-Path $root 'temp_ds_wsc_update'
$output = Join-Path $root 'temp_ds_wsc_update.docx'
$backup = Join-Path $root 'temp_ds_before_wsc_update.docx'
$wNs = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
$aNs = 'http://schemas.openxmlformats.org/drawingml/2006/main'
$rNs = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
$wpNs = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'
$pkgRelNs = 'http://schemas.openxmlformats.org/package/2006/relationships'
$xmlNs = 'http://www.w3.org/XML/1998/namespace'

$lock = $null
try {
    $lock = [System.IO.File]::Open($target, 'Open', 'ReadWrite', 'None')
}
catch {
    throw 'The DS document is open or locked. Close it in Word before applying the WSC screenshot update.'
}
finally {
    if ($lock) { $lock.Dispose() }
}

Copy-Item -LiteralPath $target -Destination $backup -Force
if (Test-Path -LiteralPath $work) { Remove-Item -LiteralPath $work -Recurse -Force }
New-Item -ItemType Directory -Path $work | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($target, $work)
Copy-Item -LiteralPath $sourceImage -Destination (Join-Path $work 'word\media\image17.png') -Force

$documentPath = Join-Path $work 'word\document.xml'
$xml = New-Object System.Xml.XmlDocument
$xml.PreserveWhitespace = $true
$xml.Load($documentPath)
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace('w', $wNs)
$ns.AddNamespace('a', $aNs)
$ns.AddNamespace('r', $rNs)
$ns.AddNamespace('wp', $wpNs)
$body = $xml.SelectSingleNode('//w:body', $ns)

function Get-Text {
    param([System.Xml.XmlNode]$Paragraph)
    return (($Paragraph.SelectNodes('.//w:t', $ns) | ForEach-Object { $_.InnerText }) -join '')
}

function Find-Paragraph {
    param([string]$Text)
    foreach ($paragraph in $xml.SelectNodes('//w:body/w:p', $ns)) {
        if ((Get-Text $paragraph) -eq $Text) { return $paragraph }
    }
    throw "Paragraph not found: $Text"
}

function New-TextParagraph {
    param([System.Xml.XmlNode]$Template, [string]$Text)
    $paragraph = $Template.CloneNode($true)
    $pPr = $paragraph.SelectSingleNode('./w:pPr', $ns)
    $runTemplate = $Template.SelectSingleNode('./w:r[1]', $ns)
    foreach ($child in @($paragraph.ChildNodes)) {
        if ($child -ne $pPr) { [void]$paragraph.RemoveChild($child) }
    }
    $run = $runTemplate.CloneNode($true)
    $rPr = $run.SelectSingleNode('./w:rPr', $ns)
    foreach ($child in @($run.ChildNodes)) {
        if ($child -ne $rPr) { [void]$run.RemoveChild($child) }
    }
    $textNode = $xml.CreateElement('w', 't', $wNs)
    [void]$textNode.SetAttribute('space', $xmlNs, 'preserve')
    $textNode.InnerText = $Text
    [void]$run.AppendChild($textNode)
    [void]$paragraph.AppendChild($run)
    return $paragraph
}

function Replace-ParagraphText {
    param([string]$Old, [string]$New)
    $paragraph = Find-Paragraph $Old
    $replacement = New-TextParagraph $paragraph $New
    [void]$paragraph.ParentNode.ReplaceChild($replacement, $paragraph)
    return $replacement
}

$oldOverall = 'The design extends the existing PLPI application with controlled queues, automatic document linkage and approval gates. WSC India initiates the PO in Add Packing List, uploads the three supplier source files and generates the Goods Receiving Checklist. Saving the PO creates the RPi Pack Creation queue immediately, while checklist generation places the receipt in the Goods-In Team tablet queue.'
$newOverall = 'The design extends the existing PLPI application with controlled queues, automatic document linkage and approval gates. WSC India initiates the PO in Add Packing List and uploads the three supplier source files; saving that entry creates the RPi Pack Creation queue immediately. Separately, the WSC user selects Generate Checklist in the Warehouse Stock Control Booked Orders screen, which creates the receipt work item in the Goods-In Team tablet queue.'
[void](Replace-ParagraphText $oldOverall $newOverall)

$oldSectionIntro = 'The tablet workflow is initiated from Add Packing List. WSC India enters the PO information, uploads the Supplier Invoice, Supplier Packing List and Supplier Declaration, and generates the Goods Receiving Checklist. Generation creates a receipt in the Goods-In Team queue; Lead Approval is presented as a separate queue and role-controlled stage.'
$newSectionIntro = 'Add Packing List and WSC Warehouse Stock Control perform separate initiation functions. Saving the Add Packing List entry creates the PO queue in RPi Pack Creation and links the Supplier Invoice, Supplier Packing List and Supplier Declaration. The tablet workflow starts only when the WSC user selects Generate Checklist for the booked PO or POs in Warehouse Stock Control; this creates the receipt in the Goods-In Team tablet queue. Lead Approval remains a separate role-controlled queue.'
$sectionIntro = Replace-ParagraphText $oldSectionIntro $newSectionIntro

$oldStep2 = 'Step 2 - WSC India generates the Goods Receiving Checklist. PLPI creates the tablet work item and assigns it to the Goods-In Team queue against the applicable PO reference or references.'
$newStep2 = 'Step 2 - In WSC Warehouse Stock Control, the WSC user selects Generate Checklist for the applicable booked PO or POs. The integration creates the tablet work item and assigns it to the Goods-In Team queue against those PO references.'
[void](Replace-ParagraphText $oldStep2 $newStep2)

$oldEntry = 'Entry condition: WSC India has saved the PO and generated the checklist. Exit condition: Team Lead approval is complete, the checklist PDF is locked and linked to the applicable individual or merged PO record, or a No decision has placed the stock in quarantine and routed the receipt to QA.'
$newEntry = 'Entry condition: WSC India has saved the Add Packing List entry and the WSC user has selected Generate Checklist for the applicable booked PO or POs. Exit condition: Team Lead approval is complete, the checklist PDF is locked and linked to the applicable individual or merged PO record, or a No decision has placed the stock in quarantine and routed the receipt to QA.'
[void](Replace-ParagraphText $oldEntry $newEntry)

foreach ($paragraph in $xml.SelectNodes('//w:body/w:p', $ns)) {
    $text = Get-Text $paragraph
    if ($text -match '^Figure ([0-9]+) - ' -and [int]$matches[1] -ge 2) {
        $number = [int]$matches[1]
        $newText = $text -replace "^Figure $number - ", ('Figure ' + ($number + 1) + ' - ')
        $textNodes = @($paragraph.SelectNodes('.//w:t', $ns))
        $textNodes[0].InnerText = $newText
        for ($i = 1; $i -lt $textNodes.Count; $i++) { $textNodes[$i].InnerText = '' }
    }
}

$imageTemplate = $null
foreach ($paragraph in $xml.SelectNodes('//w:body/w:p', $ns)) {
    $blip = $paragraph.SelectSingleNode('.//a:blip', $ns)
    if ($blip -and $blip.GetAttribute('embed', $rNs) -eq 'rId13') {
        $imageTemplate = $paragraph.CloneNode($true)
        break
    }
}
if (-not $imageTemplate) { throw 'Unable to locate a landscape image template in the DS.' }

$imageBlip = $imageTemplate.SelectSingleNode('.//a:blip', $ns)
[void]$imageBlip.SetAttribute('embed', $rNs, 'rId31')
$srcRect = $imageBlip.ParentNode.SelectSingleNode('./a:srcRect', $ns)
if ($srcRect) { [void]$imageBlip.ParentNode.RemoveChild($srcRect) }
$container = $imageBlip.SelectSingleNode('ancestor::*[local-name()="inline" or local-name()="anchor"][1]')
$extent = $container.SelectSingleNode('./wp:extent', $ns)
$shapeExtent = $container.SelectSingleNode('.//a:xfrm/a:ext', $ns)
$cx = '5699760'
$cy = '3082628'
if ($extent) {
    [void]$extent.SetAttribute('cx', $cx)
    [void]$extent.SetAttribute('cy', $cy)
}
if ($shapeExtent) {
    [void]$shapeExtent.SetAttribute('cx', $cx)
    [void]$shapeExtent.SetAttribute('cy', $cy)
}

$captionTemplate = Find-Paragraph 'Figure 3 - Tablet role queues and WSC-generated Goods-In work item'
$bodyTemplate = Find-Paragraph 'Callout 1 - Role queues. The Goods-In Team and Lead Approval tabs separate data capture from approval. A user sees only queues permitted for the authenticated role.'
$caption = New-TextParagraph $captionTemplate 'Figure 2 - WSC Warehouse Stock Control Generate Checklist action'
$logic1 = New-TextParagraph $bodyTemplate 'Screen logic - Booked Orders. Warehouse Stock Control displays the booked delivery records and associated PO number or PO numbers available for checklist generation.'
$logic2 = New-TextParagraph $bodyTemplate 'Generate Checklist. Selecting this action generates the Goods Receiving Checklist for the selected booked record and creates the corresponding work item in the Goods-In Team tablet queue.'
$logic3 = New-TextParagraph $bodyTemplate 'Queue separation. Generate Checklist does not create the RPi Pack Creation queue. That queue is created separately when the Add Packing List entry is saved.'

$reference = $sectionIntro
foreach ($node in @($imageTemplate, $caption, $logic1, $logic2, $logic3)) {
    $reference = $body.InsertAfter($node, $reference)
}

$relsPath = Join-Path $work 'word\_rels\document.xml.rels'
$rels = New-Object System.Xml.XmlDocument
$rels.PreserveWhitespace = $true
$rels.Load($relsPath)
if ($rels.SelectSingleNode('//*[local-name()="Relationship" and @Id="rId31"]')) {
    throw 'Relationship rId31 already exists.'
}
$relationship = $rels.CreateElement('Relationship', $pkgRelNs)
[void]$relationship.SetAttribute('Id', 'rId31')
[void]$relationship.SetAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image')
[void]$relationship.SetAttribute('Target', 'media/image17.png')
[void]$rels.DocumentElement.AppendChild($relationship)

$writerSettings = New-Object System.Xml.XmlWriterSettings
$writerSettings.Encoding = New-Object System.Text.UTF8Encoding($false)
$writerSettings.Indent = $false
$writer = [System.Xml.XmlWriter]::Create($documentPath, $writerSettings)
$xml.Save($writer)
$writer.Close()
$relsWriter = [System.Xml.XmlWriter]::Create($relsPath, $writerSettings)
$rels.Save($relsWriter)
$relsWriter.Close()

if (Test-Path -LiteralPath $output) { Remove-Item -LiteralPath $output -Force }
[System.IO.Compression.ZipFile]::CreateFromDirectory($work, $output, [System.IO.Compression.CompressionLevel]::Optimal, $false)
Copy-Item -LiteralPath $output -Destination $target -Force

'Added the WSC Generate Checklist screen and corrected the DS queue-trigger wording.'
