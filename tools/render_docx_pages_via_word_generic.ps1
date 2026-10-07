param(
    [Parameter(Mandatory = $true)][string]$DocxPath,
    [Parameter(Mandatory = $true)][string]$OutputDirectory
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$resolvedDocx = (Resolve-Path -LiteralPath $DocxPath).Path
if (-not (Test-Path -LiteralPath $OutputDirectory)) {
    New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
}

$word = $null
$doc = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $true
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open($resolvedDocx, $false, $true, $false)
    $doc.Activate()
    $word.Activate()
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
        Start-Sleep -Milliseconds 180
        $image = $null
        for ($attempt = 1; $attempt -le 20 -and -not $image; $attempt++) {
            try { $image = [System.Windows.Forms.Clipboard]::GetImage() } catch { Start-Sleep -Milliseconds 250 }
            if (-not $image) { Start-Sleep -Milliseconds 250 }
        }
        if (-not $image) { throw "Word did not place page $page on the clipboard." }
        $path = Join-Path $OutputDirectory ('page-{0:D2}.png' -f $page)
        $image.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
        $image.Dispose()
        [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($range)
    }
    "Rendered $pages pages to $OutputDirectory"
}
finally {
    if ($doc) { $doc.Close($false) }
    if ($word) { $word.Quit() }
    if ($doc) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) }
    if ($word) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}

