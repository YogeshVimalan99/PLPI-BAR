param(
    [Parameter(Mandatory = $true)][string]$SourceDocx,
    [Parameter(Mandatory = $true)][string]$TargetDocx
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$sourcePath = (Resolve-Path -LiteralPath $SourceDocx).Path
$targetPath = (Resolve-Path -LiteralPath $TargetDocx).Path
$backupPath = "$targetPath.before-logo-repair"
if (-not (Test-Path -LiteralPath $backupPath)) {
    Copy-Item -LiteralPath $targetPath -Destination $backupPath
}

$sourceZip = [IO.Compression.ZipFile]::OpenRead($sourcePath)
try {
    $sourceLogo = $sourceZip.GetEntry('word/media/image1.png')
    if (-not $sourceLogo) { throw 'Source logo media was not found.' }
    $logoStream = New-Object IO.MemoryStream
    $input = $sourceLogo.Open()
    try { $input.CopyTo($logoStream) } finally { $input.Dispose() }
    $logoBytes = $logoStream.ToArray()
    $logoStream.Dispose()
}
finally { $sourceZip.Dispose() }

$targetZip = [IO.Compression.ZipFile]::Open($targetPath, [IO.Compression.ZipArchiveMode]::Update)
try {
    foreach ($name in @('word/media/header-logo.png', 'word/_rels/header1.xml.rels')) {
        $existing = $targetZip.GetEntry($name)
        if ($existing) { $existing.Delete() }
    }

    $mediaEntry = $targetZip.CreateEntry('word/media/header-logo.png', [IO.Compression.CompressionLevel]::Optimal)
    $mediaOutput = $mediaEntry.Open()
    try { $mediaOutput.Write($logoBytes, 0, $logoBytes.Length) } finally { $mediaOutput.Dispose() }

    $relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/header-logo.png"/></Relationships>'
    $relsEntry = $targetZip.CreateEntry('word/_rels/header1.xml.rels', [IO.Compression.CompressionLevel]::Optimal)
    $relsOutput = New-Object IO.StreamWriter($relsEntry.Open(), (New-Object Text.UTF8Encoding($false)))
    try { $relsOutput.Write($relsXml) } finally { $relsOutput.Dispose() }

    $headerEntry = $targetZip.GetEntry('word/header1.xml')
    if (-not $headerEntry) { throw 'Target header XML was not found.' }
    $headerReader = New-Object IO.StreamReader($headerEntry.Open())
    try { $headerXml = $headerReader.ReadToEnd() } finally { $headerReader.Dispose() }
    if ($headerXml -notmatch '<a:blip>') { throw 'Expected unlinked header image was not found.' }
    $headerXml = $headerXml.Replace('<a:blip>', '<a:blip r:embed="rId1">')
    $headerEntry.Delete()
    $newHeaderEntry = $targetZip.CreateEntry('word/header1.xml', [IO.Compression.CompressionLevel]::Optimal)
    $headerWriter = New-Object IO.StreamWriter($newHeaderEntry.Open(), (New-Object Text.UTF8Encoding($false)))
    try { $headerWriter.Write($headerXml) } finally { $headerWriter.Dispose() }
}
finally { $targetZip.Dispose() }

'Repaired the DS header image relationship and embedded the working logo.'
