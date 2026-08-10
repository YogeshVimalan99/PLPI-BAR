$ErrorActionPreference = 'Stop'

[xml]$xml = Get-Content -LiteralPath (Join-Path $PSScriptRoot '..\temp_ds_ooxml\word\document.xml') -Raw
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')
$ns.AddNamespace('a', 'http://schemas.openxmlformats.org/drawingml/2006/main')
$ns.AddNamespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')

$paragraphs = $xml.SelectNodes('//w:body/w:p', $ns)
for ($i = 0; $i -lt $paragraphs.Count; $i++) {
    $p = $paragraphs.Item($i)
    $texts = $p.SelectNodes('.//w:t', $ns) | ForEach-Object { $_.'#text' }
    $text = ($texts -join '')
    $styleNode = $p.SelectSingleNode('./w:pPr/w:pStyle', $ns)
    $style = if ($styleNode) { $styleNode.GetAttribute('val', $ns.LookupNamespace('w')) } else { '' }
    $blips = $p.SelectNodes('.//a:blip', $ns)
    $relIds = @()
    foreach ($blip in $blips) {
        $relIds += $blip.GetAttribute('embed', $ns.LookupNamespace('r'))
    }
    if ($text.Trim().Length -gt 0 -or $relIds.Count -gt 0) {
        "{0}`tStyle={1}`tImages={2}`t{3}" -f ($i + 1), $style, ($relIds -join ','), $text
    }
}
