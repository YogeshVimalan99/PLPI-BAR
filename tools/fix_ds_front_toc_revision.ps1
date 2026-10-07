$ErrorActionPreference='Stop'
$path=[IO.Path]::GetFullPath('C:\Users\vimalyog\Desktop\PLPI Batch Automation\Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx')
$word=[Runtime.InteropServices.Marshal]::GetActiveObject('Word.Application')
$doc=$null;$old=$word.ScreenUpdating
try{
  $word.ScreenUpdating=$false;$doc=$word.Documents.Open($path,$false,$false,$false)
  if($doc.Tables.Count -lt 2){throw 'Front-matter tables were not found.'}
  $approval=$doc.Tables.Item(1)
  $approval.Range.ParagraphFormat.OutlineLevel=10
  $approval.Range.Font.Name='Verdana';$approval.Range.Font.Size=[single]10;$approval.Range.Font.Bold=0;$approval.Range.Font.Color=6291456
  for($row=1;$row -le 5;$row++){
    $sig=$approval.Cell($row,2).Range.Paragraphs.Item(1).Range.Duplicate;$sig.End=$sig.End-1;$sig.Text='____________________________'
    $sig.Font.Name='Verdana';$sig.Font.Size=[single]10;$sig.Font.Bold=0;$sig.Font.Color=6291456
  }
  $revision=$doc.Tables.Item(2)
  $revision.Range.ParagraphFormat.OutlineLevel=10
  $revision.Borders.Enable=1
  $revision.Range.Font.Name='Verdana';$revision.Range.Font.Size=[single]10;$revision.Range.Font.Bold=0;$revision.Range.Font.Color=6291456
  $revision.Rows.Item(1).Range.Font.Bold=1;$revision.Rows.Item(1).Range.Font.Color=16777215;$revision.Rows.Item(1).Shading.BackgroundPatternColor=6291456;$revision.Rows.Item(1).HeadingFormat=-1

  $toc=$doc.TablesOfContents.Item(1)
  $tocTitle=$doc.Range($revision.Range.End,$toc.Range.Start)
  $tocTitle.Find.Text='TABLE OF CONTENTS'
  if($tocTitle.Find.Execute()){$tocTitle.ParagraphFormat.OutlineLevel=10;$tocTitle.ParagraphFormat.Alignment=1;$tocTitle.Font.Name='Verdana';$tocTitle.Font.Size=[single]12;$tocTitle.Font.Bold=1;$tocTitle.Font.Color=6291456}
  [void]$toc.Update();$toc.Range.Font.Name='Verdana';$toc.Range.Font.Size=[single]10;$toc.Range.Font.Color=6291456
  [void]$doc.Fields.Update();$doc.Save();$doc.Close($false)
}finally{$word.ScreenUpdating=$old;if($doc){try{[void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($doc)}catch{}};[void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($word);[GC]::Collect();[GC]::WaitForPendingFinalizers()}
Write-Output 'Corrected front-matter TOC levels and revision borders.'
