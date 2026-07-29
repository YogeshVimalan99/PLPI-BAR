$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$target = Join-Path $root 'docz\DS-PLPI BAR.docx'
$work = Join-Path $root 'temp_ds_caption_fix'
$output = Join-Path $root 'temp_ds_caption_fix.docx'
$wNs = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

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

$replacements = [ordered]@{
    'Figure 10 - Batch Checker evidence and action controls' = 'Figure 11 - Batch Checker evidence and action controls'
    'Figure 11 - Product Verification pop-up: identity and source checks' = 'Figure 12 - Product Verification pop-up: identity and source checks'
    'Figure 12 - Product Verification pop-up: batch, quantity and manufacturer checks' = 'Figure 13 - Product Verification pop-up: batch, quantity and manufacturer checks'
    'Figure 13 - Product Check Log preview and print control' = 'Figure 14 - Product Check Log preview and print control'
    'Figure 14 - Product Check Log lower details, audit and print controls' = 'Figure 15 - Product Check Log lower details, audit and print controls'
}

foreach ($paragraph in $xml.SelectNodes('//w:body/w:p', $ns)) {
    $textNodes = @($paragraph.SelectNodes('.//w:t', $ns))
    $text = ($textNodes | ForEach-Object { $_.InnerText }) -join ''
    if ($replacements.Contains($text)) {
        if ($textNodes.Count -eq 0) { continue }
        $textNodes[0].InnerText = $replacements[$text]
        for ($i = 1; $i -lt $textNodes.Count; $i++) { $textNodes[$i].InnerText = '' }
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
