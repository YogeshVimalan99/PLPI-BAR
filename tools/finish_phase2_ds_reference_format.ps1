$ErrorActionPreference = 'Stop'
$root = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation'
$dsPath = [IO.Path]::GetFullPath((Join-Path $root 'Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'))
$word = [Runtime.InteropServices.Marshal]::GetActiveObject('Word.Application')
$ds = $null
$oldUpdating = $word.ScreenUpdating
try {
  foreach($openDocument in @($word.Documents)){
    if([IO.Path]::GetFullPath($openDocument.FullName).Equals($dsPath,[StringComparison]::OrdinalIgnoreCase)){ $ds=$openDocument; break }
  }
  if($null -eq $ds){ throw 'The open Phase 2 DS document was not found.' }
  $word.ScreenUpdating = $false

  foreach($section in @($ds.Sections)){
    foreach($header in @($section.Headers)){
      foreach($pair in @(
        @('Design Specification: PLPI Batch Record Automation Phase 2 Phase 2','Design Specification: PLPI Batch Record Automation Phase 2'),
        @('URS PLPI BAR Automation','Design Specification: PLPI Batch Record Automation Phase 2'),
        @('PLPI/BAR/URS/01/v1','PLPI/BAR/DS/01/v1')
      )){
        $headerRange=$header.Range.Duplicate
        [void]$headerRange.Find.Execute($pair[0],$false,$false,$false,$false,$false,$true,1,$false,$pair[1],2)
      }
    }
  }

  if($ds.TablesOfContents.Count -lt 1){ throw 'Contents field was not found.' }
  $toc=$ds.TablesOfContents.Item(1)
  $bodySearch=$ds.Range($toc.Range.End,$ds.Content.End)
  $bodySearch.Find.Text='1. Introduction'
  if(-not $bodySearch.Find.Execute()){ throw 'Body introduction heading was not found.' }
  $body=$ds.Range($bodySearch.Paragraphs.Item(1).Range.Start,$ds.Content.End)
  $body.Font.Name='Verdana'
  $body.Font.Size=[single]10
  $body.Font.Color=6291456
  $body.ParagraphFormat.SpaceAfter=[single]3

  function Apply-HeadingFormat([string]$styleName,[single]$size,[single]$before,[single]$after){
    $search=$body.Duplicate
    $search.Find.ClearFormatting()
    $search.Find.Style=$ds.Styles.Item($styleName)
    $search.Find.Text=''
    $search.Find.Forward=$true
    $search.Find.Wrap=0
    while($search.Find.Execute()){
      $search.Font.Name='Verdana'
      $search.Font.Size=$size
      $search.Font.Bold=1
      $search.Font.Color=6291456
      $search.ParagraphFormat.SpaceBefore=$before
      $search.ParagraphFormat.SpaceAfter=$after
      $search.ParagraphFormat.KeepWithNext=-1
      $next=$search.End
      if($next -ge $body.End){ break }
      $search.SetRange($next,$body.End)
      $search.Find.Style=$ds.Styles.Item($styleName)
      $search.Find.Text=''
    }
  }
  Apply-HeadingFormat 'Heading 1' ([single]12) ([single]6) ([single]2)
  Apply-HeadingFormat 'Heading 2' ([single]10.5) ([single]5) ([single]1.5)
  Apply-HeadingFormat 'Heading 3' ([single]10) ([single]4) ([single]1)

  $caption=$body.Duplicate
  $caption.Find.ClearFormatting()
  $caption.Find.Style=$ds.Styles.Item('Caption')
  $caption.Find.Text=''
  $caption.Find.Forward=$true
  $caption.Find.Wrap=0
  while($caption.Find.Execute()){
    $caption.Font.Name='Verdana'
    $caption.Font.Size=[single]9
    $caption.Font.Italic=1
    $caption.ParagraphFormat.Alignment=1
    $caption.ParagraphFormat.SpaceAfter=[single]5
    $next=$caption.End
    if($next -ge $body.End){ break }
    $caption.SetRange($next,$body.End)
    $caption.Find.Style=$ds.Styles.Item('Caption')
    $caption.Find.Text=''
  }

  foreach($table in @($ds.Tables)){
    $table.Range.Font.Name='Verdana'
    $table.Range.Font.Size=[single]9.5
    $table.Range.Font.Color=6291456
    $table.Rows.AllowBreakAcrossPages=0
    if($table.Rows.Count -gt 0){ $table.Rows.Item(1).HeadingFormat=-1 }
  }

  [void]$toc.Update()
  $toc.Range.Font.Name='Verdana'
  $toc.Range.Font.Size=[single]10
  $toc.Range.Font.Color=6291456
  [void]$ds.Fields.Update()
  $ds.Repaginate()
  $ds.Save()
}
finally {
  $word.ScreenUpdating=$oldUpdating
  if($ds){ [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($ds) }
  [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($word)
  [GC]::Collect();[GC]::WaitForPendingFinalizers()
}
Write-Output 'Completed reference-format normalization and saved the open DS.'
