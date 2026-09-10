$ErrorActionPreference='Stop'
$root='C:\Users\vimalyog\Desktop\PLPI Batch Automation'
$path=[IO.Path]::GetFullPath((Join-Path $root 'Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'))
$word=[Runtime.InteropServices.Marshal]::GetActiveObject('Word.Application')
$doc=$null
$old=$word.ScreenUpdating
try{
  foreach($candidate in @($word.Documents)){if([IO.Path]::GetFullPath($candidate.FullName).Equals($path,[StringComparison]::OrdinalIgnoreCase)){$doc=$candidate;break}}
  if($null -eq $doc){throw 'Open DS not found.'}
  $word.ScreenUpdating=$false
  $toc=$doc.TablesOfContents.Item(1)
  $search=$doc.Range($toc.Range.End,$doc.Content.End)
  $search.Find.Text='1. Introduction'
  if(-not $search.Find.Execute()){throw 'Body start not found.'}
  $body=$doc.Range($search.Paragraphs.Item(1).Range.Start,$doc.Content.End)
  $body.Font.Name='Verdana';$body.Font.Size=[single]10;$body.Font.Color=6291456;$body.ParagraphFormat.SpaceAfter=[single]3
  $count=$body.Paragraphs.Count
  for($i=1;$i -le $count;$i++){
    $p=$body.Paragraphs.Item($i)
    $level=[int]$p.OutlineLevel
    if($level -eq 1){$p.Range.Font.Size=[single]12;$p.Range.Font.Bold=1;$p.Format.SpaceBefore=[single]6;$p.Format.SpaceAfter=[single]2;$p.Format.KeepWithNext=-1}
    elseif($level -eq 2){$p.Range.Font.Size=[single]10.5;$p.Range.Font.Bold=1;$p.Format.SpaceBefore=[single]5;$p.Format.SpaceAfter=[single]1.5;$p.Format.KeepWithNext=-1}
    elseif($level -eq 3){$p.Range.Font.Size=[single]10;$p.Range.Font.Bold=1;$p.Format.SpaceBefore=[single]4;$p.Format.SpaceAfter=[single]1;$p.Format.KeepWithNext=-1}
    elseif($p.Range.Text.Trim() -like 'Figure *'){$p.Range.Font.Size=[single]9;$p.Range.Font.Italic=1;$p.Format.Alignment=1;$p.Format.SpaceAfter=[single]5}
    [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($p)
  }
  foreach($table in @($doc.Tables)){$table.Range.Font.Name='Verdana';$table.Range.Font.Size=[single]9.5;$table.Range.Font.Color=6291456;$table.Rows.AllowBreakAcrossPages=0;if($table.Rows.Count -gt 0){$table.Rows.Item(1).HeadingFormat=-1}}
  [void]$toc.Update();$toc.Range.Font.Name='Verdana';$toc.Range.Font.Size=[single]10;$toc.Range.Font.Color=6291456
  [void]$doc.Fields.Update();$doc.Save()
}finally{$word.ScreenUpdating=$old;if($doc){[void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($doc)};[void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($word);[GC]::Collect();[GC]::WaitForPendingFinalizers()}
Write-Output 'Saved the reformatted Phase 2 DS.'
