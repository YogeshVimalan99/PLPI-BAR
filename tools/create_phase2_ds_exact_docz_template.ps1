$ErrorActionPreference = 'Stop'

$root = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation'
$template = Join-Path $root 'docz\DS-PLPI BAR.docx'
$source = Join-Path $root 'Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding - Recreated.docx'
$output = Join-Path $root 'Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding - Exact Template.docx'
$expectedHash = '7EE0B5A6355765B5941F79BEDDBCB048625211079A206FE1C6F7D446F1FF97B2'
if ((Get-FileHash -LiteralPath $template -Algorithm SHA256).Hash -ne $expectedHash) { throw 'The template changed after distillation.' }
if (Test-Path -LiteralPath $output) { throw "Output already exists: $output" }
Copy-Item -LiteralPath $source -Destination $output

$blue = 6299648
$white = 16777215
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$tpl = $null
$doc = $null
try {
    $tpl = $word.Documents.Open($template, $false, $true, $false)
    $doc = $word.Documents.Open($output, $false, $false, $false)

    foreach ($styleName in @('Normal','Body Text','No Spacing','Heading 1','Heading 2','TOC 1','TOC 2')) {
        try { $word.OrganizerCopy($template, $output, $styleName, 3) } catch {}
    }

    # Replace the current cover with the exact body furniture from the template.
    $tplPage2 = $tpl.GoTo(1, 1, 2).Start
    $docPage2 = $doc.GoTo(1, 1, 2).Start
    $tplCover = $tpl.Range(0, $tplPage2 - 1)
    $docCover = $doc.Range(0, $docPage2 - 1)
    $docCover.FormattedText = $tplCover.FormattedText

    # Remove the old standalone Revision History page so the TOC follows the cover, as in the template.
    $page2Start = $doc.GoTo(1, 1, 2).Start
    $page3Start = $doc.GoTo(1, 1, 3).Start
    $doc.Range($page2Start, $page3Start).Delete()

    # Replace every cover value originating from the template with current-project values.
    $coverEnd = $doc.GoTo(1, 1, 2).Start - 1
    $coverRange = $doc.Range(0, $coverEnd)
    $coverReplacements = @{
        'Ronex Pereira' = 'Juston Rodrigues'
        'Rajesh Patel' = 'Anthony Fernandes'
        'Team Lead' = 'Team Leader'
        'Quality Specialist / RP' = 'QA'
    }
    foreach ($key in $coverReplacements.Keys) {
        $find = $coverRange.Find
        $find.ClearFormatting(); $find.Replacement.ClearFormatting()
        [void]$find.Execute($key, $false, $false, $false, $false, $false, $true, 0, $false, $coverReplacements[$key], 2)
    }

    # Copy the exact recurring header/footer from the template, including its embedded screenshot and rule.
    $docSec = $doc.Sections.Item(1)
    $tplSec = $tpl.Sections.Item(1)
    $docSec.PageSetup.PageWidth = $tplSec.PageSetup.PageWidth
    $docSec.PageSetup.PageHeight = $tplSec.PageSetup.PageHeight
    $docSec.PageSetup.TopMargin = $tplSec.PageSetup.TopMargin
    $docSec.PageSetup.BottomMargin = $tplSec.PageSetup.BottomMargin
    $docSec.PageSetup.LeftMargin = $tplSec.PageSetup.LeftMargin
    $docSec.PageSetup.RightMargin = $tplSec.PageSetup.RightMargin
    $docSec.PageSetup.HeaderDistance = $tplSec.PageSetup.HeaderDistance
    $docSec.PageSetup.FooterDistance = $tplSec.PageSetup.FooterDistance
    $docSec.Headers.Item(1).Range.FormattedText = $tplSec.Headers.Item(1).Range.FormattedText
    $docSec.Footers.Item(1).Range.FormattedText = $tplSec.Footers.Item(1).Range.FormattedText

    foreach ($range in @($docSec.Headers.Item(1).Range, $docSec.Footers.Item(1).Range)) {
        foreach ($pair in @(
            @('Design Specification: PLPI Batch Record Automation','Design Specification: PLPI Batch Record Automation Phase 2'),
            @('DS/PLPI/PH1/v1.0','PLPI/BAR/DS/01/v1')
        )) {
            $find = $range.Find
            $find.ClearFormatting(); $find.Replacement.ClearFormatting()
            [void]$find.Execute($pair[0], $false, $false, $false, $false, $false, $true, 0, $false, $pair[1], 2)
        }
    }

    # Apply the template typography to original Phase 2 content only.
    $inBody = $false
    foreach ($para in @($doc.Paragraphs)) {
        $text = ($para.Range.Text -replace '[\r\a]', '').Trim()
        if ($text -eq '1. Introduction') { $inBody = $true }
        if (-not $inBody) { continue }
        try { $style = $para.Style.NameLocal } catch { $style = '' }
        if ($style -eq 'Heading 1') {
            $para.Range.Font.Name = 'Verdana'; $para.Range.Font.Size = 14; $para.Range.Font.Bold = -1; $para.Range.Font.Color = $blue
            $para.Format.Alignment = 0; $para.Format.SpaceBefore = 8; $para.Format.SpaceAfter = 6; $para.Format.LineSpacingRule = 5; $para.Format.LineSpacing = 12.95; $para.Format.KeepWithNext = -1
        }
        elseif ($style -eq 'Heading 2') {
            $para.Range.Font.Name = 'Verdana'; $para.Range.Font.Size = 12; $para.Range.Font.Bold = -1; $para.Range.Font.Color = $blue
            $para.Format.Alignment = 0; $para.Format.SpaceBefore = 6; $para.Format.SpaceAfter = 6; $para.Format.LineSpacingRule = 5; $para.Format.LineSpacing = 12.95; $para.Format.KeepWithNext = -1
        }
        elseif ($text -match '^Figure\s+\d+') {
            $para.Range.Font.Name = 'Verdana'; $para.Range.Font.Size = 10; $para.Range.Font.Italic = -1; $para.Range.Font.Color = $blue
            $para.Format.Alignment = 1; $para.Format.SpaceBefore = 0; $para.Format.SpaceAfter = 6; $para.Format.LineSpacingRule = 5; $para.Format.LineSpacing = 12; $para.Format.KeepWithNext = 0
        }
        elseif (-not $para.Range.Information(12)) {
            try { $para.Style = $doc.Styles.Item('Body Text') } catch {}
            $para.Range.Font.Name = 'Verdana'; $para.Range.Font.Size = 10; $para.Range.Font.Color = $blue
            $para.Format.Alignment = 3; $para.Format.SpaceBefore = 0; $para.Format.SpaceAfter = 6; $para.Format.LineSpacingRule = 5; $para.Format.LineSpacing = 15; $para.Format.KeepWithNext = 0
        }
    }

    # Format all substantive tables using the template's plain white grid pattern.
    for ($ti = 2; $ti -le $doc.Tables.Count; $ti++) {
        $table = $doc.Tables.Item($ti)
        try { $table.AutoFitBehavior(2) } catch {}
        $table.AllowAutoFit = $false
        $table.PreferredWidthType = 3
        $table.PreferredWidth = 451
        $table.Range.Font.Name = 'Verdana'; $table.Range.Font.Size = 11; $table.Range.Font.Color = $blue
        $table.Range.ParagraphFormat.SpaceBefore = 0; $table.Range.ParagraphFormat.SpaceAfter = 0
        $table.Range.ParagraphFormat.LineSpacingRule = 5; $table.Range.ParagraphFormat.LineSpacing = 12.95
        $table.Borders.Enable = 1
        foreach ($cell in @($table.Range.Cells)) {
            $cell.Shading.BackgroundPatternColor = $white
            $cell.VerticalAlignment = 1
            $cell.TopPadding = 4; $cell.BottomPadding = 4; $cell.LeftPadding = 5; $cell.RightPadding = 5
        }
        if ($table.Rows.Count -gt 0) {
            $table.Rows.Item(1).Range.Font.Bold = -1
            $table.Rows.Item(1).HeadingFormat = -1
        }
    }

    # Keep embedded wireframes proportional and within the template text area.
    foreach ($shape in @($doc.InlineShapes)) {
        try {
            $shape.LockAspectRatio = -1
            if ($shape.Width -gt 451) { $shape.Width = 451 }
            $shape.Range.ParagraphFormat.Alignment = 1
        } catch {}
    }

    foreach ($toc in @($doc.TablesOfContents)) { try { $toc.Update() } catch {} }
    foreach ($field in @($doc.Fields)) { try { [void]$field.Update() } catch {} }
    $doc.Repaginate()
    $doc.Save()
    $doc.Close($false)
    $tpl.Close($false)
}
finally {
    if ($doc) { try { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($doc) } catch {} }
    if ($tpl) { try { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($tpl) } catch {} }
    $word.Quit()
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word)
}

Get-Item -LiteralPath $output | Select-Object FullName, Length, LastWriteTime
