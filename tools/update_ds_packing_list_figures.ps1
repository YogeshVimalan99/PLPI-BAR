$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$source = Join-Path $root 'temp_ds_live_copy.docx'
$output = Join-Path $root 'temp_ds_packing_updated.docx'
$work = Join-Path $root 'temp_ds_packing_update'
$viewImage = Join-Path $root 'temp_ds_current_wireframe\screenshots\05-packing-list-view.png'
$addImage = Join-Path $root 'temp_ds_current_wireframe\screenshots\06-packing-list-add-uploads.png'

$wNs = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
$aNs = 'http://schemas.openxmlformats.org/drawingml/2006/main'
$rNs = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
$wpNs = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'
$picNs = 'http://schemas.openxmlformats.org/drawingml/2006/picture'
$pkgRelNs = 'http://schemas.openxmlformats.org/package/2006/relationships'
$xmlNs = 'http://www.w3.org/XML/1998/namespace'

foreach ($required in @($source, $viewImage, $addImage)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "Required file not found: $required"
    }
}

if (Test-Path -LiteralPath $work) {
    Remove-Item -LiteralPath $work -Recurse -Force
}
New-Item -ItemType Directory -Path $work | Out-Null

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($source, $work)

$documentPath = Join-Path $work 'word\document.xml'
$relsPath = Join-Path $work 'word\_rels\document.xml.rels'
$mediaPath = Join-Path $work 'word\media'

$xml = New-Object System.Xml.XmlDocument
$xml.PreserveWhitespace = $true
$xml.Load($documentPath)
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace('w', $wNs)
$ns.AddNamespace('a', $aNs)
$ns.AddNamespace('r', $rNs)
$ns.AddNamespace('wp', $wpNs)
$ns.AddNamespace('pic', $picNs)
$body = $xml.SelectSingleNode('//w:body', $ns)

function Get-ParagraphText {
    param([System.Xml.XmlNode]$Paragraph)
    return (($Paragraph.SelectNodes('.//w:t', $ns) | ForEach-Object { $_.InnerText }) -join '')
}

function Find-Paragraph {
    param([string]$Text)
    foreach ($paragraph in $xml.SelectNodes('//w:body/w:p', $ns)) {
        if ((Get-ParagraphText $paragraph) -eq $Text) {
            return $paragraph
        }
    }
    throw "Paragraph not found: $Text"
}

function New-TextParagraph {
    param(
        [System.Xml.XmlNode]$Template,
        [string]$Text
    )

    $paragraph = $Template.CloneNode($true)
    $pPr = $paragraph.SelectSingleNode('./w:pPr', $ns)
    $runTemplate = $Template.SelectSingleNode('./w:r[1]', $ns)

    foreach ($child in @($paragraph.ChildNodes)) {
        if ($child -ne $pPr) {
            [void]$paragraph.RemoveChild($child)
        }
    }

    $run = $runTemplate.CloneNode($true)
    $rPr = $run.SelectSingleNode('./w:rPr', $ns)
    foreach ($child in @($run.ChildNodes)) {
        if ($child -ne $rPr) {
            [void]$run.RemoveChild($child)
        }
    }

    $textNode = $xml.CreateElement('w', 't', $wNs)
    [void]$textNode.SetAttribute('space', $xmlNs, 'preserve')
    $textNode.InnerText = $Text
    [void]$run.AppendChild($textNode)
    [void]$paragraph.AppendChild($run)
    return $paragraph
}

function Set-ImageRelationship {
    param(
        [System.Xml.XmlNode]$Paragraph,
        [string]$RelationshipId,
        [string]$Name,
        [string]$Description,
        [int]$DocPropertyId,
        [int]$PicturePropertyId
    )

    $blip = $Paragraph.SelectSingleNode('.//a:blip', $ns)
    [void]$blip.SetAttribute('embed', $rNs, $RelationshipId)

    $docPr = $Paragraph.SelectSingleNode('.//wp:docPr', $ns)
    if ($docPr) {
        [void]$docPr.SetAttribute('id', [string]$DocPropertyId)
        [void]$docPr.SetAttribute('name', $Name)
        [void]$docPr.SetAttribute('descr', $Description)
    }

    $cNvPr = $Paragraph.SelectSingleNode('.//pic:cNvPr', $ns)
    if ($cNvPr) {
        [void]$cNvPr.SetAttribute('id', [string]$PicturePropertyId)
        [void]$cNvPr.SetAttribute('name', $Name)
        [void]$cNvPr.SetAttribute('descr', $Description)
    }
}

$sectionHeading = Find-Paragraph '3.1.1 Packing List Module'
$nextHeading = Find-Paragraph '3.2 RPi Pack Creation Module'
$oldImage = $sectionHeading.NextSibling
while ($oldImage -and -not $oldImage.SelectSingleNode('.//a:blip', $ns)) {
    $oldImage = $oldImage.NextSibling
}
if (-not $oldImage) {
    throw 'Packing List image paragraph was not found.'
}

$oldCaption = Find-Paragraph 'Figure 7 - Packing List Verify & Print, LOG and generation controls'
$bodyTemplate = Find-Paragraph 'Module boundary: Add Packing List remains the WSC India initiation point. Saving the PO creates the RPi Pack Creation queue immediately, and the Supplier Invoice, Supplier Packing List and Supplier Declaration uploaded there are linked to the same PO. Existing Packing List fields and actions remain unchanged unless identified below.'

$imageTemplate = $oldImage.CloneNode($true)
$captionTemplate = $oldCaption.CloneNode($true)
$paragraphTemplate = $bodyTemplate.CloneNode($true)

$maxDocPrId = 0
foreach ($node in $xml.SelectNodes('//wp:docPr', $ns)) {
    $value = 0
    if ([int]::TryParse($node.GetAttribute('id'), [ref]$value) -and $value -gt $maxDocPrId) {
        $maxDocPrId = $value
    }
}
$maxPicId = 0
foreach ($node in $xml.SelectNodes('//pic:cNvPr', $ns)) {
    $value = 0
    if ([int]::TryParse($node.GetAttribute('id'), [ref]$value) -and $value -gt $maxPicId) {
        $maxPicId = $value
    }
}

$addImageParagraph = $imageTemplate.CloneNode($true)
Set-ImageRelationship `
    -Paragraph $addImageParagraph `
    -RelationshipId 'rId32' `
    -Name 'Add Packing List supplier document uploads' `
    -Description 'Wireframe showing Add Packing List PO entry and the Supplier Declaration, Supplier Packing List and Supplier Invoice upload controls.' `
    -DocPropertyId ($maxDocPrId + 1) `
    -PicturePropertyId ($maxPicId + 1)

$viewImageParagraph = $imageTemplate.CloneNode($true)
$originalDocPr = $oldImage.SelectSingleNode('.//wp:docPr', $ns)
$originalPicPr = $oldImage.SelectSingleNode('.//pic:cNvPr', $ns)
$originalDocId = if ($originalDocPr) { [int]$originalDocPr.GetAttribute('id') } else { $maxDocPrId + 2 }
$originalPicId = if ($originalPicPr) { [int]$originalPicPr.GetAttribute('id') } else { $maxPicId + 2 }
Set-ImageRelationship `
    -Paragraph $viewImageParagraph `
    -RelationshipId 'rId14' `
    -Name 'View Packing List verification and LOG' `
    -Description 'Wireframe showing the View Packing List tab, PO search, QTY, BOXES, Verify and Print, and LOG controls.' `
    -DocPropertyId $originalDocId `
    -PicturePropertyId ($maxPicId + 2)

$content = @(
    (New-TextParagraph $paragraphTemplate 'Add Packing List is used by WSC India to create and save the PO record, upload the Supplier Declaration, Supplier Packing List and Supplier Invoice, and create the PO queue in RPi Pack Creation. View Packing List is used by Goods-In to complete line verification, review LOG, complete line clearance and generate the controlled PO Packing List.'),
    $addImageParagraph,
    (New-TextParagraph $captionTemplate 'Figure 7 - Add Packing List PO entry and supplier-document uploads'),
    (New-TextParagraph $paragraphTemplate 'Callout 1 - Add Packing List tab. WSC India uses this tab to enter and maintain the PO and supplier record before Goods-In processing.'),
    (New-TextParagraph $paragraphTemplate 'Callout 2 - PO and supplier search. The user enters the PO number and supplier details and retrieves the applicable source information before saving the record.'),
    (New-TextParagraph $paragraphTemplate 'Callout 3 - Supplier document uploads. The Supplier Declaration, Supplier Packing List and Supplier Invoice are uploaded against the PO. The files remain visible against that PO in RPi Pack Creation without re-upload.'),
    (New-TextParagraph $paragraphTemplate 'Callout 4 - Save. Saving the Add Packing List entry creates the PO queue in RPi Pack Creation and records the uploaded supplier files against the PO.'),
    (New-TextParagraph $paragraphTemplate 'Queue control: Add Packing List does not create the Goods-In tablet queue. The tablet queue is created separately when WSC selects Generate Checklist for the booked PO or POs in Warehouse Stock Control.'),
    $viewImageParagraph,
    (New-TextParagraph $captionTemplate 'Figure 8 - View Packing List verification, LOG and generation controls'),
    (New-TextParagraph $paragraphTemplate 'Callout 1 - View Packing List tab. Goods-In uses this tab for Packing List line processing. RPi Pack Creation and RPi document controls are not part of this screen.'),
    (New-TextParagraph $paragraphTemplate 'Callout 2 - PO search and line context. Goods-In opens the applicable PO after the Team Lead-approved Goods Receiving Checklist is available and reviews the existing Packing List product lines.'),
    (New-TextParagraph $paragraphTemplate 'Callout 3 - QTY, BOXES and Verify & Print. QTY and BOXES remain existing fields. Verify & Print is the new line-level action used to complete the required confirmation, line-clearance check and authenticated sign-off for the selected line.'),
    (New-TextParagraph $paragraphTemplate 'Callout 4 - LOG. This new read-only action displays the retained verification status, print status, authenticated user, date/time and comments for the selected line.'),
    (New-TextParagraph $paragraphTemplate 'Generation control: Generate PO Packing List remains in the View Packing List action area and is enabled only after all applicable lines are verified, required label printing is successful and line clearance is complete. The generated Packing List is locked and attached automatically to the respective PO in RPi Pack Creation.'),
    (New-TextParagraph $paragraphTemplate 'Detailed screen sequence:'),
    (New-TextParagraph $paragraphTemplate 'Step 1 - WSC India enters the PO and supplier details in Add Packing List and uploads the Supplier Declaration, Supplier Packing List and Supplier Invoice.'),
    (New-TextParagraph $paragraphTemplate 'Step 2 - Saving the Add Packing List entry creates the PO queue in RPi Pack Creation and links the three supplier files to that PO.'),
    (New-TextParagraph $paragraphTemplate 'Step 3 - After the Goods Receiving Checklist has completed the required Team Lead or QA outcome, Goods-In searches for and opens the PO in View Packing List.'),
    (New-TextParagraph $paragraphTemplate 'Step 4 - Goods-In selects an applicable line and chooses Verify & Print. PLPI binds the action to that line and displays the required confirmation data.'),
    (New-TextParagraph $paragraphTemplate 'Step 5 - Goods-In completes the line-clearance confirmation and authenticated sign-off. After successful printing, PLPI records the print result, user and date/time and changes the line to Verified. A cancelled or failed action leaves the line incomplete.'),
    (New-TextParagraph $paragraphTemplate 'Step 6 - Goods-In opens LOG to review the retained verification and printing history and resolves any identified exception through the controlled process.'),
    (New-TextParagraph $paragraphTemplate 'Step 7 - PLPI evaluates every applicable PO line. Generate PO Packing List remains unavailable while a line is unverified, required printing is incomplete or line clearance is missing.'),
    (New-TextParagraph $paragraphTemplate 'Step 8 - PLPI generates and locks the PO Packing List, then links it automatically to the corresponding PO-specific document group in RPi Pack Creation.'),
    (New-TextParagraph $paragraphTemplate 'Validation and control: A locked or generated Packing List cannot be changed through Verify & Print. A controlled correction invalidates affected downstream approval or generated output and requires the applicable workflow steps to be repeated.'),
    (New-TextParagraph $paragraphTemplate 'Entry condition: The Add Packing List entry and RPi Pack Creation queue exist, and the PO Goods Receiving Checklist has completed the required Team Lead or QA outcome. Exit condition: All applicable lines are verified and printed, line clearance is complete, and the generated Packing List is attached to the respective RPi pack.'),
    (New-TextParagraph $paragraphTemplate 'URS traceability: URS 4.1.4 - 4.1.12. FS traceability: FS 3.1.')
)

$node = $sectionHeading.NextSibling
while ($node -and $node -ne $nextHeading) {
    $next = $node.NextSibling
    [void]$body.RemoveChild($node)
    $node = $next
}

$reference = $sectionHeading
foreach ($item in $content) {
    $reference = $body.InsertAfter($item, $reference)
}

foreach ($paragraph in $xml.SelectNodes('//w:body/w:p', $ns)) {
    $text = Get-ParagraphText $paragraph
    if ($text -match '^Figure ([0-9]+) - ' -and [int]$matches[1] -ge 8) {
        $number = [int]$matches[1]
        if ($text -ne 'Figure 8 - View Packing List verification, LOG and generation controls') {
            $newText = $text -replace "^Figure $number - ", ('Figure ' + ($number + 1) + ' - ')
            $textNodes = @($paragraph.SelectNodes('.//w:t', $ns))
            $textNodes[0].InnerText = $newText
            for ($i = 1; $i -lt $textNodes.Count; $i++) {
                $textNodes[$i].InnerText = ''
            }
        }
    }
}

Copy-Item -LiteralPath $viewImage -Destination (Join-Path $mediaPath 'image7.png') -Force
Copy-Item -LiteralPath $addImage -Destination (Join-Path $mediaPath 'image17.png') -Force

$rels = New-Object System.Xml.XmlDocument
$rels.PreserveWhitespace = $true
$rels.Load($relsPath)
$existing = $rels.SelectSingleNode('//*[local-name()="Relationship" and @Id="rId32"]')
if ($existing) {
    [void]$existing.SetAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image')
    [void]$existing.SetAttribute('Target', 'media/image17.png')
}
else {
    $relationship = $rels.CreateElement('Relationship', $pkgRelNs)
    [void]$relationship.SetAttribute('Id', 'rId32')
    [void]$relationship.SetAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image')
    [void]$relationship.SetAttribute('Target', 'media/image17.png')
    [void]$rels.DocumentElement.AppendChild($relationship)
}

$writerSettings = New-Object System.Xml.XmlWriterSettings
$writerSettings.Encoding = New-Object System.Text.UTF8Encoding($false)
$writerSettings.Indent = $false

$writer = [System.Xml.XmlWriter]::Create($documentPath, $writerSettings)
$xml.Save($writer)
$writer.Close()

$relsWriter = [System.Xml.XmlWriter]::Create($relsPath, $writerSettings)
$rels.Save($relsWriter)
$relsWriter.Close()

if (Test-Path -LiteralPath $output) {
    Remove-Item -LiteralPath $output -Force
}
[System.IO.Compression.ZipFile]::CreateFromDirectory(
    $work,
    $output,
    [System.IO.Compression.CompressionLevel]::Optimal,
    $false
)

"Updated DS prepared at $output"
