$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$target = Join-Path $root 'docz\DS-PLPI BAR.docx'
$template = Join-Path $root 'Reference Doc (Templates)\DS - PLPI System  29 Oct 2024 DRAFT FINAL.docx'
$backup = Join-Path $root 'temp_ds_before_bs_header.docx'
$targetWork = Join-Path $root 'temp_ds_bs_header_target'
$templateWork = Join-Path $root 'temp_ds_bs_header_template'
$output = Join-Path $root 'temp_ds_bs_header_applied.docx'
$wNs = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
$pkgRelNs = 'http://schemas.openxmlformats.org/package/2006/relationships'

$lock = $null
try {
    $lock = [IO.File]::Open($target, 'Open', 'ReadWrite', 'None')
}
catch {
    throw 'The DS document is open or locked.'
}
finally {
    if ($lock) { $lock.Dispose() }
}

foreach ($required in @($target, $template)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "Required file not found: $required"
    }
}

Copy-Item -LiteralPath $target -Destination $backup -Force
foreach ($folder in @($targetWork, $templateWork)) {
    if (Test-Path -LiteralPath $folder) {
        Remove-Item -LiteralPath $folder -Recurse -Force
    }
    New-Item -ItemType Directory -Path $folder | Out-Null
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::ExtractToDirectory($target, $targetWork)
[IO.Compression.ZipFile]::ExtractToDirectory($template, $templateWork)

$templateHeaderPath = Join-Path $templateWork 'word\header1.xml'
$targetHeaderPath = Join-Path $targetWork 'word\header2.xml'
$templateHeaderRelsPath = Join-Path $templateWork 'word\_rels\header1.xml.rels'
$targetHeaderRelsPath = Join-Path $targetWork 'word\_rels\header2.xml.rels'
$templateLogoPath = Join-Path $templateWork 'word\media\image42.png'
$targetLogoName = 'bs-healthcare-header.png'
$targetLogoPath = Join-Path $targetWork ('word\media\' + $targetLogoName)

$header = New-Object Xml.XmlDocument
$header.PreserveWhitespace = $true
$header.Load($templateHeaderPath)
$ns = New-Object Xml.XmlNamespaceManager($header.NameTable)
$ns.AddNamespace('w', $wNs)

$titleReplaced = $false
$idReplaced = $false
foreach ($textNode in $header.SelectNodes('//w:t', $ns)) {
    if ($textNode.InnerText -eq ' Specification: PLPI Assembly Control Software') {
        $textNode.InnerText = ' Specification: PLPI Batch Record Automation'
        $titleReplaced = $true
    }
    elseif ($textNode.InnerText -eq 'VMP/A5/0007/09/v12') {
        $textNode.InnerText = 'DS/PLPI/PH1/v1.0'
        $idReplaced = $true
    }
}
if (-not $titleReplaced -or -not $idReplaced) {
    throw 'Unable to replace the template header title or document identifier.'
}

$settings = New-Object Xml.XmlWriterSettings
$settings.Encoding = New-Object Text.UTF8Encoding($false)
$settings.Indent = $false
$writer = [Xml.XmlWriter]::Create($targetHeaderPath, $settings)
$header.Save($writer)
$writer.Close()

$rels = New-Object Xml.XmlDocument
$rels.PreserveWhitespace = $true
$rels.Load($templateHeaderRelsPath)
$logoRelationship = $rels.SelectSingleNode(
    '//*[local-name()="Relationship" and contains(@Type, "/image")]'
)
if (-not $logoRelationship) {
    throw 'The B&S header image relationship was not found in the template.'
}
[void]$logoRelationship.SetAttribute('Target', 'media/' + $targetLogoName)
$relsWriter = [Xml.XmlWriter]::Create($targetHeaderRelsPath, $settings)
$rels.Save($relsWriter)
$relsWriter.Close()

Copy-Item -LiteralPath $templateLogoPath -Destination $targetLogoPath -Force

if (Test-Path -LiteralPath $output) {
    Remove-Item -LiteralPath $output -Force
}
[IO.Compression.ZipFile]::CreateFromDirectory(
    $targetWork,
    $output,
    [IO.Compression.CompressionLevel]::Optimal,
    $false
)
Copy-Item -LiteralPath $output -Destination $target -Force

'Applied the exact B&S header structure and logo from the PLPI DS template.'
