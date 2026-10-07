$ErrorActionPreference = 'Stop'
$root = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation'
$dsPath = [IO.Path]::GetFullPath((Join-Path $root 'Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'))
$ursPath = Join-Path $root 'Phase 2 Doc\URS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'

$word = [Runtime.InteropServices.Marshal]::GetActiveObject('Word.Application')
$ds = $null
$urs = $null
$oldUpdating = $word.ScreenUpdating
try {
  foreach($openDocument in @($word.Documents)){
    if([IO.Path]::GetFullPath($openDocument.FullName).Equals($dsPath,[StringComparison]::OrdinalIgnoreCase)){
      $ds = $openDocument
      break
    }
  }
  if($null -eq $ds){ throw 'The open Phase 2 DS document was not found in Word.' }
  $word.ScreenUpdating = $false
  $urs = $word.Documents.Open($ursPath,$false,$true,$false)

  $sourceEnd = $urs.GoTo(1,1,4).Start
  $sourceFront = $urs.Range($urs.Content.Start,$sourceEnd)
  $targetEnd = $ds.GoTo(1,1,4).Start
  $targetFront = $ds.Range($ds.Content.Start,$targetEnd)
  $targetFront.FormattedText = $sourceFront.FormattedText

  $revision = $ds.Tables.Item(1)
  $revision.Cell(2,1).Range.Text = '1'
  $revision.Cell(2,2).Range.Text = 'NA'
  $revision.Cell(2,3).Range.Text = 'New Design Specification prepared for PLPI Batch Record Automation covering B&S Batch Add, Printing Modules and Leaflet Folding.'
  $revision.Cell(2,4).Range.Text = 'Aug 2026'

  foreach($section in @($ds.Sections)){
    foreach($header in @($section.Headers)){
      foreach($pair in @(
        @('URS PLPI BAR Automation','Design Specification: PLPI Batch Record Automation Phase 2'),
        @('Design Specification: PLPI Batch Record Automation Phase 2 Phase 2','Design Specification: PLPI Batch Record Automation Phase 2'),
        @('Design Specification: PLPI Batch Record Automation','Design Specification: PLPI Batch Record Automation Phase 2'),
        @('PLPI/BAR/URS/01/v1','PLPI/BAR/DS/01/v1')
      )){
        $r = $header.Range.Duplicate
        [void]$r.Find.Execute($pair[0],$false,$false,$false,$false,$false,$true,1,$false,$pair[1],2)
      }
    }
    foreach($footer in @($section.Footers)){
      $r = $footer.Range.Duplicate
      [void]$r.Find.Execute('PLPI/BAR/URS/01/v1',$false,$false,$false,$false,$false,$true,1,$false,'PLPI/BAR/DS/01/v1',2)
    }
  }

  if($ds.TablesOfContents.Count -lt 1){ throw 'Copied Contents field was not found.' }
  $toc = $ds.TablesOfContents.Item(1)
  $titleSearch = $ds.Range($ds.GoTo(1,1,3).Start,$toc.Range.Start)
  $titleSearch.Find.Text = 'Contents'
  if($titleSearch.Find.Execute()){
    $titleSearch.Text = 'TABLE OF CONTENTS'
    $titleSearch.ParagraphFormat.Alignment = 1
    $titleSearch.Font.Name = 'Verdana'
    $titleSearch.Font.Size = 12
    $titleSearch.Font.Bold = 1
    $titleSearch.Font.Color = 6291456
  }

  $bodySearch = $ds.Range($toc.Range.End,$ds.Content.End)
  $bodySearch.Find.Text = '1. Introduction'
  if(-not $bodySearch.Find.Execute()){ throw 'Body introduction heading was not found.' }
  $bodyStart = $bodySearch.Paragraphs.Item(1).Range.Start
  $body = $ds.Range($bodyStart,$ds.Content.End)
  $body.Font.Name = 'Verdana'
  $body.Font.Size = 10
  $body.Font.Color = 6291456
  $body.ParagraphFormat.SpaceAfter = 3

  foreach($styleSpec in @(
    @('Heading 1',12,6,2),
    @('Heading 2',10.5,5,1.5),
    @('Heading 3',10,4,1)
  )){
    $findRange = $body.Duplicate
    $findRange.Find.ClearFormatting()
    $findRange.Find.Style = $ds.Styles.Item($styleSpec[0])
    $findRange.Find.Text = ''
    $findRange.Find.Forward = $true
    $findRange.Find.Wrap = 0
    while($findRange.Find.Execute()){
      $findRange.Font.Name = 'Verdana'
      $findRange.Font.Size = $styleSpec[1]
      $findRange.Font.Bold = 1
      $findRange.Font.Color = 6291456
      $findRange.ParagraphFormat.SpaceBefore = $styleSpec[2]
      $findRange.ParagraphFormat.SpaceAfter = $styleSpec[3]
      $findRange.ParagraphFormat.KeepWithNext = -1
      $findRange.Collapse(0)
    }
  }

  $captionRange = $body.Duplicate
  $captionRange.Find.ClearFormatting()
  $captionRange.Find.Style = $ds.Styles.Item('Caption')
  $captionRange.Find.Text = ''
  $captionRange.Find.Forward = $true
  $captionRange.Find.Wrap = 0
  while($captionRange.Find.Execute()){
    $captionRange.Font.Name = 'Verdana'
    $captionRange.Font.Size = 9
    $captionRange.Font.Italic = 1
    $captionRange.ParagraphFormat.Alignment = 1
    $captionRange.ParagraphFormat.SpaceAfter = 5
    $captionRange.Collapse(0)
  }

  foreach($table in @($ds.Tables)){
    $table.Range.Font.Name = 'Verdana'
    $table.Range.Font.Size = 9.5
    $table.Range.Font.Color = 6291456
    $table.Rows.AllowBreakAcrossPages = 0
    if($table.Rows.Count -gt 0){ $table.Rows.Item(1).HeadingFormat = -1 }
  }

  [void]$toc.Update()
  $toc.Range.Font.Name = 'Verdana'
  $toc.Range.Font.Size = 10
  $toc.Range.Font.Color = 6291456
  [void]$ds.Fields.Update()
  $ds.Repaginate()
  $ds.Save()
}
finally {
  if($urs){ $urs.Close($false); [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($urs) }
  $word.ScreenUpdating = $oldUpdating
  if($ds){ [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($ds) }
  [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($word)
  [GC]::Collect(); [GC]::WaitForPendingFinalizers()
}

Write-Output 'Reformatted the open Phase 2 DS document.'
