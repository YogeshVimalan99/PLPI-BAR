$ErrorActionPreference='Stop'
$path=[IO.Path]::GetFullPath('C:\Users\vimalyog\Desktop\PLPI Batch Automation\Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx')
$word=[Runtime.InteropServices.Marshal]::GetActiveObject('Word.Application')
$doc=$null;$old=$word.ScreenUpdating
try{
  $word.ScreenUpdating=$false;$doc=$word.Documents.Open($path,$false,$false,$false)
  $normal=$doc.Styles.Item('Normal')
  $approval=$doc.Tables.Item(1);$approval.Range.Style=$normal;$approval.Range.ParagraphFormat.OutlineLevel=10;$approval.Range.Font.Name='Verdana';$approval.Range.Font.Size=[single]10;$approval.Range.Font.Bold=0;$approval.Range.Font.Color=6291456
  $revision=$doc.Tables.Item(2);$revision.Range.Style=$normal;$revision.Range.ParagraphFormat.OutlineLevel=10;$revision.Range.Font.Name='Verdana';$revision.Range.Font.Size=[single]10;$revision.Range.Font.Bold=0;$revision.Range.Font.Color=6291456;$revision.Rows.Item(1).Range.Font.Bold=1;$revision.Rows.Item(1).Range.Font.Color=16777215;$revision.Rows.Item(1).Shading.BackgroundPatternColor=6291456
  $toc=$doc.TablesOfContents.Item(1)
  $titleSearch=$doc.Range($revision.Range.End,$toc.Range.Start);$titleSearch.Find.Text='TABLE OF CONTENTS'
  if($titleSearch.Find.Execute()){$titleSearch.Style=$normal;$titleSearch.ParagraphFormat.OutlineLevel=10;$titleSearch.ParagraphFormat.Alignment=1;$titleSearch.Font.Name='Verdana';$titleSearch.Font.Size=[single]12;$titleSearch.Font.Bold=1;$titleSearch.Font.Color=6291456}
  [void]$toc.Update();$toc.Range.Font.Name='Verdana';$toc.Range.Font.Size=[single]10;$toc.Range.Font.Color=6291456
  [void]$doc.Fields.Update();$doc.Save();$doc.Close($false)
}finally{$word.ScreenUpdating=$old;if($doc){try{[void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($doc)}catch{}};[void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($word);[GC]::Collect();[GC]::WaitForPendingFinalizers()}
Write-Output 'Removed approval and revision table cell text from the TOC.'
