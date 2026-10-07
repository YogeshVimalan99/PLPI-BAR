param(
    [Parameter(Mandatory = $true)][string]$DocxPath,
    [Parameter(Mandatory = $true)][string]$PdfPath
)
$ErrorActionPreference = 'Stop'
$resolved = (Resolve-Path -LiteralPath $DocxPath).Path
$word = $null
$doc = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open($resolved, $false, $false, $false)
    $doc.Fields.Update() | Out-Null
    foreach ($toc in $doc.TablesOfContents) { $toc.Update() }
    $doc.Repaginate()
    foreach ($section in $doc.Sections) {
        foreach ($footer in $section.Footers) { $footer.Range.Fields.Update() | Out-Null }
    }
    $doc.Save()
    $pages = $doc.ComputeStatistics(2)
    $doc.ExportAsFixedFormat($PdfPath, 17, $false, 0, 0, 1, $pages)
    "Saved and rendered $pages pages."
}
finally {
    if ($doc) { $doc.Close($false) }
    if ($word) { $word.Quit() }
    if ($doc) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($doc) }
    if ($word) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
}
