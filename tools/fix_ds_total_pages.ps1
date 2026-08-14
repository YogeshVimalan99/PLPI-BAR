$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$target = Join-Path $root 'docz\DS-PLPI BAR.docx'
$work = Join-Path $root 'temp_ds_page_count_fix'
$output = Join-Path $root 'temp_ds_page_count_fixed.docx'
$pageCount = '32'
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

if (Test-Path -LiteralPath $work) {
    Remove-Item -LiteralPath $work -Recurse -Force
}
New-Item -ItemType Directory -Path $work | Out-Null

Add-Type -AssemblyName System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::ExtractToDirectory($target, $work)

$footerPath = Join-Path $work 'word\footer2.xml'
$footer = New-Object Xml.XmlDocument
$footer.PreserveWhitespace = $true
$footer.Load($footerPath)
$ns = New-Object Xml.XmlNamespaceManager($footer.NameTable)
$ns.AddNamespace('w', $wNs)

$instruction = $footer.SelectSingleNode('//w:instrText[contains(., "NUMPAGES")]', $ns)
if (-not $instruction) {
    throw 'NUMPAGES field was not found in footer2.xml.'
}

$run = $instruction.ParentNode
$cursor = $run.NextSibling
$foundSeparate = $false
$resultText = $null
while ($cursor) {
    $fieldChar = $cursor.SelectSingleNode('./w:fldChar', $ns)
    if ($fieldChar) {
        $type = $fieldChar.GetAttribute('fldCharType', $wNs)
        if ($type -eq 'separate') {
            $foundSeparate = $true
        }
        elseif ($type -eq 'end') {
            break
        }
    }
    elseif ($foundSeparate) {
        $text = $cursor.SelectSingleNode('./w:t', $ns)
        if ($text) {
            $resultText = $text
            break
        }
    }
    $cursor = $cursor.NextSibling
}

if (-not $resultText) {
    throw 'NUMPAGES result text was not found.'
}
$resultText.InnerText = $pageCount

$settings = New-Object Xml.XmlWriterSettings
$settings.Encoding = New-Object Text.UTF8Encoding($false)
$settings.Indent = $false
$writer = [Xml.XmlWriter]::Create($footerPath, $settings)
$footer.Save($writer)
$writer.Close()

$appPath = Join-Path $work 'docProps\app.xml'
if (Test-Path -LiteralPath $appPath) {
    $app = New-Object Xml.XmlDocument
    $app.PreserveWhitespace = $true
    $app.Load($appPath)
    $pagesNode = $app.SelectSingleNode('//*[local-name()="Pages"]')
    if ($pagesNode) {
        $pagesNode.InnerText = $pageCount
        $appWriter = [Xml.XmlWriter]::Create($appPath, $settings)
        $app.Save($appWriter)
        $appWriter.Close()
    }
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

"Updated the DS footer total to $pageCount pages."
