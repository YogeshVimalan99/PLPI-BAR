param(
    [Parameter(Mandatory = $true)][string]$InputDirectory,
    [Parameter(Mandatory = $true)][string]$OutputDirectory,
    [int]$Columns = 3,
    [int]$Rows = 3,
    [int]$ThumbWidth = 425
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
if (-not (Test-Path -LiteralPath $OutputDirectory)) {
    New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
}
$files = Get-ChildItem -LiteralPath $InputDirectory -Filter '*.png' | Sort-Object Name
$perSheet = $Columns * $Rows
for ($offset = 0; $offset -lt $files.Count; $offset += $perSheet) {
    $group = @($files | Select-Object -Skip $offset -First $perSheet)
    $first = [System.Drawing.Image]::FromFile($group[0].FullName)
    try { $ratio = $first.Height / $first.Width } finally { $first.Dispose() }
    $thumbHeight = [int]($ThumbWidth * $ratio)
    $labelHeight = 28
    $sheet = New-Object System.Drawing.Bitmap ($Columns * $ThumbWidth), ($Rows * ($thumbHeight + $labelHeight))
    $graphics = [System.Drawing.Graphics]::FromImage($sheet)
    try {
        $graphics.Clear([System.Drawing.Color]::White)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $font = New-Object System.Drawing.Font('Arial', 11, [System.Drawing.FontStyle]::Bold)
        try {
            for ($i = 0; $i -lt $group.Count; $i++) {
                $col = $i % $Columns
                $row = [int][Math]::Floor($i / $Columns)
                $x = $col * $ThumbWidth
                $y = $row * ($thumbHeight + $labelHeight)
                $img = [System.Drawing.Image]::FromFile($group[$i].FullName)
                try { $graphics.DrawImage($img, $x, $y, $ThumbWidth, $thumbHeight) } finally { $img.Dispose() }
                $graphics.DrawString($group[$i].BaseName, $font, [System.Drawing.Brushes]::Black, $x + 4, $y + $thumbHeight + 4)
            }
        }
        finally { $font.Dispose() }
        $sheetNumber = [int]($offset / $perSheet) + 1
        $output = Join-Path $OutputDirectory ('contact-{0:D2}.png' -f $sheetNumber)
        $sheet.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
        $graphics.Dispose()
        $sheet.Dispose()
    }
}

"Created $([Math]::Ceiling($files.Count / [double]$perSheet)) contact sheets."
