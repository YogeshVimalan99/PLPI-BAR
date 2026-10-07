$ErrorActionPreference = 'Stop'

$root = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation'
$template = Join-Path $root 'docz\DS-PLPI BAR.docx'
$source = Join-Path $root 'Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding - Recreated.docx'
$output = Join-Path $root 'Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding - Exact Template.docx'
$expectedHash = '7EE0B5A6355765B5941F79BEDDBCB048625211079A206FE1C6F7D446F1FF97B2'
if ((Get-FileHash -LiteralPath $template -Algorithm SHA256).Hash -ne $expectedHash) { throw 'The template changed after distillation.' }
if (Test-Path -LiteralPath $output) { Remove-Item -LiteralPath $output -Force }
Copy-Item -LiteralPath $template -Destination $output

$blue = 6299648
$white = 16777215
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$src = $null
$doc = $null
try {
    $src = $word.Documents.Open($source, $false, $true, $false)
    $doc = $word.Documents.Open($output, $false, $false, $false)

    # Keep the template cover and TOC; replace only its project body.
    $sourceStart = $src.Content.Duplicate
    $sourceStart.Find.ClearFormatting()
    if (-not $sourceStart.Find.Execute('1. Introduction')) { throw 'Phase 2 body start not found.' }
    $sourceBody = $src.Range($sourceStart.Start, $src.Content.End - 1)
    $destinationBodyStart = $doc.GoTo(1, 1, 3).Start
    $doc.Range($destinationBodyStart, $doc.Content.End - 1).Delete()
    $insert = $doc.Range($destinationBodyStart, $destinationBodyStart)
    $insert.FormattedText = $sourceBody.FormattedText

    # Replace only template-originating project/person data.
    $coverEnd = $doc.GoTo(1, 1, 2).Start - 1
    $cover = $doc.Range(0, $coverEnd)
    foreach ($pair in @(
        @('Ronex Pereira','Juston Rodrigues'),
        @('Rajesh Patel','Anthony Fernandes'),
        @('Quality Specialist / RP','QA'),
        @('Team Lead','Team Leader')
    )) {
        $find = $cover.Find; $find.ClearFormatting(); $find.Replacement.ClearFormatting()
        [void]$find.Execute($pair[0], $false, $true, $false, $false, $false, $true, 0, $false, $pair[1], 2)
    }

    # Retain the exact template header/footer furniture and replace identification only.
    $sec = $doc.Sections.Item(1)
    foreach ($range in @($sec.Headers.Item(1).Range, $sec.Footers.Item(1).Range)) {
        foreach ($pair in @(
            @('Design Specification: PLPI Batch Record Automation','Design Specification: PLPI Batch Record Automation Phase 2'),
            @('DS/PLPI/PH1/v1.0','PLPI/BAR/DS/01/v1')
        )) {
            $find = $range.Find; $find.ClearFormatting(); $find.Replacement.ClearFormatting()
            [void]$find.Execute($pair[0], $false, $false, $false, $false, $false, $true, 0, $false, $pair[1], 2)
        }
    }

    # Template typography for inserted Phase 2 paragraphs.
    $bodyRange = $doc.Range($destinationBodyStart, $doc.Content.End - 1)
    foreach ($para in @($bodyRange.Paragraphs)) {
        $text = ($para.Range.Text -replace '[\r\a]', '').Trim()
        try { $style = $para.Style.NameLocal } catch { $style = '' }
        if ($style -eq 'Heading 1') {
            $para.Range.Font.Name = 'Verdana'; $para.Range.Font.Size = 14; $para.Range.Font.Bold = -1; $para.Range.Font.Color = $blue
            $para.Format.Alignment = 0; $para.Format.SpaceBefore = 8; $para.Format.SpaceAfter = 6; $para.Format.LineSpacingRule = 5; $para.Format.LineSpacing = 12.95; $para.Format.KeepWithNext = -1
        } elseif ($style -eq 'Heading 2') {
            $para.Range.Font.Name = 'Verdana'; $para.Range.Font.Size = 12; $para.Range.Font.Bold = -1; $para.Range.Font.Color = $blue
            $para.Format.Alignment = 0; $para.Format.SpaceBefore = 6; $para.Format.SpaceAfter = 6; $para.Format.LineSpacingRule = 5; $para.Format.LineSpacing = 12.95; $para.Format.KeepWithNext = -1
        } elseif ($text -match '^Figure\s+\d+') {
            $para.Range.Font.Name = 'Verdana'; $para.Range.Font.Size = 10; $para.Range.Font.Italic = -1; $para.Range.Font.Color = $blue
            $para.Format.Alignment = 1; $para.Format.SpaceBefore = 0; $para.Format.SpaceAfter = 6; $para.Format.LineSpacingRule = 5; $para.Format.LineSpacing = 12
        } elseif (-not $para.Range.Information(12)) {
            try { $para.Style = $doc.Styles.Item('Body Text') } catch {}
            $para.Range.Font.Name = 'Verdana'; $para.Range.Font.Size = 10; $para.Range.Font.Color = $blue
            $para.Format.Alignment = 3; $para.Format.SpaceBefore = 0; $para.Format.SpaceAfter = 6; $para.Format.LineSpacingRule = 5; $para.Format.LineSpacing = 15; $para.Format.KeepWithNext = 0
        }
    }

    # The first three tables are untouched template cover tables.
    for ($ti = 4; $ti -le $doc.Tables.Count; $ti++) {
        $table = $doc.Tables.Item($ti)
        try { $table.AutoFitBehavior(2) } catch {}
        $table.AllowAutoFit = $false; $table.PreferredWidthType = 3; $table.PreferredWidth = 451
        $table.Range.Font.Name = 'Verdana'; $table.Range.Font.Size = 11; $table.Range.Font.Color = $blue
        $table.Range.ParagraphFormat.SpaceBefore = 0; $table.Range.ParagraphFormat.SpaceAfter = 0
        $table.Range.ParagraphFormat.LineSpacingRule = 5; $table.Range.ParagraphFormat.LineSpacing = 12.95
        $table.Borders.Enable = 1; $table.TopPadding = 4; $table.BottomPadding = 4; $table.LeftPadding = 5; $table.RightPadding = 5
        if ($table.Rows.Count -gt 0) { $table.Rows.Item(1).Range.Font.Bold = -1; $table.Rows.Item(1).HeadingFormat = -1 }
    }

    foreach ($shape in @($bodyRange.InlineShapes)) {
        try { $shape.LockAspectRatio = -1; if ($shape.Width -gt 451) { $shape.Width = 451 }; $shape.Range.ParagraphFormat.Alignment = 1 } catch {}
    }
    foreach ($toc in @($doc.TablesOfContents)) { try { $toc.Update() } catch {} }
    foreach ($field in @($doc.Fields)) { try { [void]$field.Update() } catch {} }
    $doc.Repaginate(); $doc.Save(); $doc.Close($false); $src.Close($false)
}
finally {
    if ($doc) { try { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($doc) } catch {} }
    if ($src) { try { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($src) } catch {} }
    $word.Quit(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word)
}

Get-Item -LiteralPath $output | Select-Object FullName, Length, LastWriteTime
