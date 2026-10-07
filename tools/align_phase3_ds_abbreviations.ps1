param([Parameter(Mandatory = $true)][string]$DocxPath)

$ErrorActionPreference = 'Stop'
$items = @(
    @('IT', 'Information Technology'),
    @('URS', 'User Requirement Specification'),
    @('DS', 'Design Specification'),
    @('FS', 'Functional Specification'),
    @('PLPI', 'Parallel Import / PLPI workflow system'),
    @('BAR', 'Batch Assembly Record'),
    @('PCL', 'Product Check Log'),
    @('B&S', 'B&S Healthcare'),
    @('GMP', 'Good Manufacturing Practice'),
    @('IPC', 'In-Process Check'),
    @('MFG', 'Manufacturer / Manufacturing'),
    @('QA', 'Quality Assurance'),
    @('QC', 'Quality Control'),
    @('QP', 'Qualified Person'),
    @('ECMA', 'Approved packaging or artwork reference'),
    @('IMP', 'Investigational Medicinal Product')
)

$word = $null
$doc = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open((Resolve-Path -LiteralPath $DocxPath).Path, $false, $false)
    if ($doc.Tables.Count -ne 4) { throw "Expected four Phase 2-template tables; found $($doc.Tables.Count)." }
    $table = $doc.Tables.Item(4)
    while ($table.Rows.Count -lt $items.Count) { [void]$table.Rows.Add() }
    while ($table.Rows.Count -gt $items.Count) { $table.Rows.Item($table.Rows.Count).Delete() }
    for ($row = 1; $row -le $items.Count; $row++) {
        $table.Cell($row, 1).Range.Text = $items[$row - 1][0]
        $table.Cell($row, 2).Range.Text = $items[$row - 1][1]
        foreach ($column in 1..2) {
            $cellRange = $table.Cell($row, $column).Range
            $cellRange.Style = 'Body Text'
            $cellRange.ParagraphFormat.SpaceAfter = 0
            $table.Cell($row, $column).VerticalAlignment = 1
        }
    }
    foreach ($toc in $doc.TablesOfContents) { $toc.Update() }
    $doc.Repaginate()
    $doc.Save()
    "Aligned DS abbreviations with the approved FS and retained the two wireframe-specific terms."
}
finally {
    if ($doc) { $doc.Close($false) }
    if ($word) { $word.Quit() }
    if ($doc) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($doc) }
    if ($word) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
