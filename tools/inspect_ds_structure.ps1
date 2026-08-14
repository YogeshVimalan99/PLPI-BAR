$ErrorActionPreference = 'Stop'

$path = Join-Path $PSScriptRoot '..\docz\DS-PLPI BAR.docx'
$word = $null
$doc = $null

try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open((Resolve-Path $path).Path, $false, $true)

    "PARAGRAPHS"
    for ($i = 1; $i -le $doc.Paragraphs.Count; $i++) {
        $paragraph = $doc.Paragraphs.Item($i)
        $text = $paragraph.Range.Text -replace "[`r`a]", ''
        if ($text.Trim().Length -gt 0) {
            $style = $paragraph.Range.Style.NameLocal
            $shapeCount = $paragraph.Range.InlineShapes.Count
            "{0}`t{1}`tShapes={2}`t{3}" -f $i, $style, $shapeCount, $text
        }
    }

    "TABLES"
    for ($t = 1; $t -le $doc.Tables.Count; $t++) {
        $table = $doc.Tables.Item($t)
        "Table {0}: {1} rows x {2} cols" -f $t, $table.Rows.Count, $table.Columns.Count
        for ($r = 1; $r -le $table.Rows.Count; $r++) {
            $cells = @()
            for ($c = 1; $c -le $table.Rows.Item($r).Cells.Count; $c++) {
                $cells += (($table.Rows.Item($r).Cells.Item($c).Range.Text -replace "[`r`a]", '').Trim())
            }
            "  Row {0}: {1}" -f $r, ($cells -join ' | ')
        }
    }
}
finally {
    if ($doc) { $doc.Close($false) }
    if ($word) { $word.Quit() }
    if ($doc) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) }
    if ($word) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
