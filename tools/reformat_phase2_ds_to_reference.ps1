$ErrorActionPreference = 'Stop'

$root = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation'
$dsPath = Join-Path $root 'Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'
$ursPath = Join-Path $root 'Phase 2 Doc\URS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'

$word = $null
$ds = $null
$urs = $null
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0

  $urs = $word.Documents.Open($ursPath, $false, $true, $false)
  $ds = $word.Documents.Open($dsPath, $false, $false, $false)

  # Replace only the first three DS pages with the finalized URS front-matter pattern:
  # signature-line approval page, revision-history page and contents page.
  $sourceEnd = $urs.GoTo(1, 1, 4).Start
  $sourceFront = $urs.Range($urs.Content.Start, $sourceEnd)
  $targetEnd = $ds.GoTo(1, 1, 4).Start
  $targetFront = $ds.Range($ds.Content.Start, $targetEnd)
  $targetFront.FormattedText = $sourceFront.FormattedText

  # Update the copied Revision History table for the DS without changing its layout.
  if($ds.Tables.Count -lt 1){ throw 'Revision History table was not found after front-matter replacement.' }
  $revision = $ds.Tables.Item(1)
  $revision.Cell(2,1).Range.Text = '1'
  $revision.Cell(2,2).Range.Text = 'NA'
  $revision.Cell(2,3).Range.Text = 'New Design Specification prepared for PLPI Batch Record Automation covering B&S Batch Add, Printing Modules and Leaflet Folding.'
  $revision.Cell(2,4).Range.Text = 'Aug 2026'

  # Use the reference/FS contents-page title while preserving the copied TOC layout.
  $contentsRange = $ds.Content.Duplicate
  $contentsRange.Find.ClearFormatting()
  $contentsRange.Find.Text = 'Contents'
  if($contentsRange.Find.Execute()){
    $contentsRange.Text = 'TABLE OF CONTENTS'
    $contentsRange.ParagraphFormat.Alignment = 1
    $contentsRange.Font.Name = 'Verdana'
    $contentsRange.Font.Size = 12
    $contentsRange.Font.Bold = 1
    $contentsRange.Font.Color = 6291456
  }

  # Update the document identity in every header while retaining the reference logo,
  # separator line, position and footer/page-number construction.
  foreach($section in @($ds.Sections)){
    foreach($header in @($section.Headers)){
      $headerRange = $header.Range.Duplicate
      $headerRange.Find.ClearFormatting()
      $headerRange.Find.Replacement.ClearFormatting()
      [void]$headerRange.Find.Execute('URS PLPI BAR Automation',$false,$false,$false,$false,$false,$true,1,$false,'Design Specification: PLPI Batch Record Automation Phase 2',2)
      $headerRange = $header.Range.Duplicate
      [void]$headerRange.Find.Execute('Design Specification: PLPI Batch Record Automation',$false,$false,$false,$false,$false,$true,1,$false,'Design Specification: PLPI Batch Record Automation Phase 2',2)
      $headerRange = $header.Range.Duplicate
      [void]$headerRange.Find.Execute('PLPI/BAR/URS/01/v1',$false,$false,$false,$false,$false,$true,1,$false,'PLPI/BAR/DS/01/v1',2)
    }
    foreach($footer in @($section.Footers)){
      $footerRange = $footer.Range.Duplicate
      [void]$footerRange.Find.Execute('PLPI/BAR/URS/01/v1',$false,$false,$false,$false,$false,$true,1,$false,'PLPI/BAR/DS/01/v1',2)
    }
  }

  # Normalize the body typography to the finalized FS/reference scale. The front
  # matter is intentionally left in the copied URS/FS formatting.
  $bodyStartFind = $ds.Content.Duplicate
  $bodyStartFind.Find.ClearFormatting()
  $bodyStartFind.Find.Text = '1. Introduction'
  $foundBody = $false
  while($bodyStartFind.Find.Execute()){
    if($bodyStartFind.Information(3) -ge 4){ $foundBody = $true; break }
    $bodyStartFind.Collapse(0)
  }
  if(-not $foundBody){ throw 'DS body start was not found.' }
  $bodyRange = $ds.Range($bodyStartFind.Paragraphs.Item(1).Range.Start, $ds.Content.End)
  $bodyRange.Font.Name = 'Verdana'
  $bodyRange.Font.Color = 6291456

  foreach($paragraph in @($bodyRange.Paragraphs)){
    $styleName = ''
    try { $styleName = [string]$paragraph.Style.NameLocal } catch { $styleName = '' }
    $paragraph.Range.Font.Name = 'Verdana'
    $paragraph.Range.Font.Color = 6291456
    if($styleName -eq 'Heading 1'){
      $paragraph.Range.Font.Size = 12
      $paragraph.Range.Font.Bold = 1
      $paragraph.Format.SpaceBefore = 6
      $paragraph.Format.SpaceAfter = 2
      $paragraph.Format.KeepWithNext = -1
    } elseif($styleName -eq 'Heading 2'){
      $paragraph.Range.Font.Size = 10.5
      $paragraph.Range.Font.Bold = 1
      $paragraph.Format.SpaceBefore = 5
      $paragraph.Format.SpaceAfter = 1.5
      $paragraph.Format.KeepWithNext = -1
    } elseif($styleName -eq 'Heading 3'){
      $paragraph.Range.Font.Size = 10
      $paragraph.Range.Font.Bold = 1
      $paragraph.Format.SpaceBefore = 4
      $paragraph.Format.SpaceAfter = 1
      $paragraph.Format.KeepWithNext = -1
    } elseif($styleName -eq 'Caption'){
      $paragraph.Range.Font.Size = 9
      $paragraph.Range.Font.Italic = 1
      $paragraph.Format.Alignment = 1
      $paragraph.Format.SpaceAfter = 5
    } else {
      $paragraph.Range.Font.Size = 10
      $paragraph.Format.SpaceAfter = 3
    }
  }

  # Match the compact FS/reference table scale and keep every table within margins.
  foreach($table in @($ds.Tables)){
    $table.Range.Font.Name = 'Verdana'
    $table.Range.Font.Size = 9.5
    $table.Range.Font.Color = 6291456
    $table.Rows.AllowBreakAcrossPages = 0
    $table.AutoFitBehavior(2)
    if($table.Rows.Count -gt 0){
      $table.Rows.Item(1).HeadingFormat = -1
    }
  }

  # Refresh the copied contents field after all pagination changes.
  foreach($toc in @($ds.TablesOfContents)){
    [void]$toc.Update()
    $toc.Range.Font.Name = 'Verdana'
    $toc.Range.Font.Size = 10
    $toc.Range.Font.Color = 6291456
  }
  [void]$ds.Fields.Update()
  $ds.Repaginate()
  $ds.Save()
}
finally {
  if($urs){ $urs.Close($false) }
  if($ds){ $ds.Close($false) }
  if($word){ $word.Quit() }
  if($urs){ [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($urs) }
  if($ds){ [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($ds) }
  if($word){ [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($word) }
  [GC]::Collect(); [GC]::WaitForPendingFinalizers()
}

Write-Output "Reformatted: $dsPath"
