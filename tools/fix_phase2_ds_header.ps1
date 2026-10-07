$ErrorActionPreference = 'Stop'
$path = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'
$word = $null
$doc = $null
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $doc = $word.Documents.Open($path)
  foreach($section in @($doc.Sections)){
    foreach($header in @($section.Headers)){
      $range = $header.Range.Duplicate
      $range.Find.ClearFormatting()
      $range.Find.Replacement.ClearFormatting()
      $range.Find.Text = 'PLPI Assembly Control Software'
      $range.Find.Replacement.Text = 'PLPI Batch Record Automation'
      [void]$range.Find.Execute('PLPI Assembly Control Software',$false,$false,$false,$false,$false,$true,1,$false,'PLPI Batch Record Automation',2)
    }
  }
  foreach($toc in @($doc.TablesOfContents)){ [void]$toc.Update() }
  [void]$doc.Fields.Update()
  $doc.Save()
} finally {
  if($doc){ $doc.Close($false) }
  if($word){ $word.Quit() }
  if($doc){ [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($doc) }
  if($word){ [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($word) }
  [GC]::Collect(); [GC]::WaitForPendingFinalizers()
}
