$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$target = Join-Path $root 'docz\DS-PLPI BAR.docx'
$backup = Join-Path $root 'temp_ds_before_header_repair.docx'
$work = Join-Path $root 'temp_ds_header_repair'
$output = Join-Path $root 'temp_ds_header_repaired.docx'
$wNs = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

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

Copy-Item -LiteralPath $target -Destination $backup -Force
if (Test-Path -LiteralPath $work) {
    Remove-Item -LiteralPath $work -Recurse -Force
}
New-Item -ItemType Directory -Path $work | Out-Null

Add-Type -AssemblyName System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::ExtractToDirectory($target, $work)

$headerPath = Join-Path $work 'word\header2.xml'
$header = New-Object Xml.XmlDocument
$header.PreserveWhitespace = $true
$header.Load($headerPath)
$ns = New-Object Xml.XmlNamespaceManager($header.NameTable)
$ns.AddNamespace('w', $wNs)

foreach ($drawing in @($header.SelectNodes('//w:drawing', $ns))) {
    $run = $drawing.SelectSingleNode('ancestor::w:r[1]', $ns)
    if ($run) {
        $paragraph = $run.SelectSingleNode('ancestor::w:p[1]', $ns)
        [void]$run.ParentNode.RemoveChild($run)
        if ($paragraph -and -not $paragraph.SelectSingleNode('.//w:t | .//w:drawing | .//w:fldChar', $ns)) {
            [void]$paragraph.ParentNode.RemoveChild($paragraph)
        }
    }
}

$settings = New-Object Xml.XmlWriterSettings
$settings.Encoding = New-Object Text.UTF8Encoding($false)
$settings.Indent = $false
$writer = [Xml.XmlWriter]::Create($headerPath, $settings)
$header.Save($writer)
$writer.Close()

$headerRelsPath = Join-Path $work 'word\_rels\header2.xml.rels'
if (Test-Path -LiteralPath $headerRelsPath) {
    $rels = New-Object Xml.XmlDocument
    $rels.PreserveWhitespace = $true
    $rels.Load($headerRelsPath)
    foreach ($relationship in @($rels.SelectNodes('//*[local-name()="Relationship" and contains(@Type, "/image")]'))) {
        [void]$relationship.ParentNode.RemoveChild($relationship)
    }
    $relsWriter = [Xml.XmlWriter]::Create($headerRelsPath, $settings)
    $rels.Save($relsWriter)
    $relsWriter.Close()
}

if (Test-Path -LiteralPath $output) {
    Remove-Item -LiteralPath $output -Force
}
[IO.Compression.ZipFile]::CreateFromDirectory(
    $work,
    $output,
    [IO.Compression.CompressionLevel]::Optimal,
    $false
)
Copy-Item -LiteralPath $output -Destination $target -Force

'Removed the unintended screenshot from the repeating DS header.'
