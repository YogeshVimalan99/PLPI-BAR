$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$docx = Join-Path $root 'Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding - Recreated.docx'
$out = Join-Path $root 'tmp_phase2_ds_new\rendered-word'
New-Item -ItemType Directory -Path $out -Force | Out-Null

$word = $null
$doc = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open($docx, $false, $true, $false)
    $pages = $doc.ComputeStatistics(2)
    for ($page = 1; $page -le $pages; $page++) {
        $start = $doc.GoTo(1, 1, $page).Start
        if ($page -lt $pages) {
            $end = $doc.GoTo(1, 1, ($page + 1)).Start - 1
        }
        else {
            $end = $doc.Content.End - 1
        }
        $range = $doc.Range($start, $end)
        $range.CopyAsPicture()
        Start-Sleep -Milliseconds 150
        $image = [System.Windows.Forms.Clipboard]::GetImage()
        if (-not $image) { throw "Word did not render page $page to the clipboard." }
        $path = Join-Path $out ('page-{0:D2}.png' -f $page)
        $image.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
        $image.Dispose()
        [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($range)
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

"Rendered $pages pages to $out"
