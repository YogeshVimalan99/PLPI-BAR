param(
    [Parameter(Mandatory = $true)][string]$SourceDocx,
    [Parameter(Mandatory = $true)][string]$TargetDocx
)

$ErrorActionPreference = 'Stop'
$word = $null
$source = $null
$target = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $source = $word.Documents.Open((Resolve-Path -LiteralPath $SourceDocx).Path, $false, $true)
    $target = $word.Documents.Open((Resolve-Path -LiteralPath $TargetDocx).Path, $false, $false)

    $sourceHeader = $source.Sections.Item(1).Headers.Item(1)
    $targetHeader = $target.Sections.Item(1).Headers.Item(1)
    if ($sourceHeader.Shapes.Count -lt 1) { throw 'The source header does not contain a logo shape.' }

    $sourceShape = $sourceHeader.Shapes.Item(1)
    $left = $sourceShape.Left
    $top = $sourceShape.Top
    $width = $sourceShape.Width
    $height = $sourceShape.Height
    $relativeHorizontal = $sourceShape.RelativeHorizontalPosition
    $relativeVertical = $sourceShape.RelativeVerticalPosition
    $wrapType = $sourceShape.WrapFormat.Type

    while ($targetHeader.Shapes.Count -gt 0) {
        $targetHeader.Shapes.Item(1).Delete()
    }

    $sourceShape.Select()
    $word.Selection.Copy()
    $pasteRange = $targetHeader.Range.Duplicate
    $pasteRange.Collapse(1)
    $pasteRange.Paste()
    if ($targetHeader.Shapes.Count -lt 1) { throw 'The logo was not pasted as a header shape.' }

    $newShape = $targetHeader.Shapes.Item(1)
    $newShape.Left = $left
    $newShape.Top = $top
    $newShape.Width = $width
    $newShape.Height = $height
    $newShape.RelativeHorizontalPosition = $relativeHorizontal
    $newShape.RelativeVerticalPosition = $relativeVertical
    $newShape.WrapFormat.Type = $wrapType

    foreach ($field in $target.TablesOfContents) { $field.Update() }
    $target.Repaginate()
    $target.Save()
    "Corrected the DS header logo from the working FS header."
}
finally {
    if ($target) { $target.Close($false) }
    if ($source) { $source.Close($false) }
    if ($word) { $word.Quit() }
    if ($target) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($target) }
    if ($source) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($source) }
    if ($word) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}


