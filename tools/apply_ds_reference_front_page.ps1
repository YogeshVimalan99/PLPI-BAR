$ErrorActionPreference='Stop'
$root='C:\Users\vimalyog\Desktop\PLPI Batch Automation'
$path=[IO.Path]::GetFullPath((Join-Path $root 'Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'))
$word=[Runtime.InteropServices.Marshal]::GetActiveObject('Word.Application')
$doc=$null
$oldUpdating=$word.ScreenUpdating
try{
  $word.ScreenUpdating=$false
  $doc=$word.Documents.Open($path,$false,$false,$false)

  # Keep the reference logo, separator and placement; replace only identity text.
  foreach($section in @($doc.Sections)){
    foreach($header in @($section.Headers)){
      foreach($paragraph in @($header.Range.Paragraphs)){
        $plain=$paragraph.Range.Text.Trim([char]13,[char]7,' ')
        if($plain -like 'Design Specification:*'){
          $r=$paragraph.Range.Duplicate;$r.End=$r.End-1;$r.Text='Design Specification: PLPI Batch Record Automation Phase 2'
          $r.Font.Name='Verdana';$r.Font.Size=[single]10;$r.Font.Bold=1;$r.Font.Color=6291456
        }elseif($plain -match '^(VMP/|PLPI/BAR/)'){
          $r=$paragraph.Range.Duplicate;$r.End=$r.End-1;$r.Text='PLPI/BAR/DS/01/v1'
          $r.Font.Name='Verdana';$r.Font.Size=[single]10;$r.Font.Bold=1;$r.Font.Color=6291456
        }
      }
    }
  }

  # Remove the old title/approval/revision first page only. The existing TOC and
  # detailed DS content remain untouched and move after the new front matter.
  $page2Start=$doc.GoTo(1,1,2).Start
  [void]$doc.Range($doc.Content.Start,$page2Start).Delete()
  $cursor=$doc.Range($doc.Content.Start,$doc.Content.Start)
  $cursor.InsertAfter("`r")
  $lead=$doc.Paragraphs.Item(1)
  $lead.Format.SpaceAfter=[single]20

  $tableRange=$doc.Range($lead.Range.End,$lead.Range.End)
  $approval=$doc.Tables.Add($tableRange,5,4)
  $approval.AllowAutoFit=$false
  $approval.Borders.Enable=0
  $approval.Columns.Item(1).Width=[single]70
  $approval.Columns.Item(2).Width=[single]250
  $approval.Columns.Item(3).Width=[single]50
  $approval.Columns.Item(4).Width=[single]95
  $approval.Range.Font.Name='Verdana';$approval.Range.Font.Size=[single]10;$approval.Range.Font.Color=6291456
  $approval.TopPadding=0;$approval.BottomPadding=0;$approval.LeftPadding=2;$approval.RightPadding=2
  $roles=@(
    @('Author','Yogeshkumar Vimalan','Business Analyst'),
    @('Reviewer','Amit Sanandiya','Project Manager'),
    @('Reviewer','Juston Rodrigues','Team Leader'),
    @('Reviewer','Anthony Fernandes','Team Leader'),
    @('Approver','Beauty Dadhaniya','QA')
  )
  for($row=1;$row -le 5;$row++){
    $approval.Rows.Item($row).HeightRule=1
    $approval.Rows.Item($row).Height=[single]92
    $approval.Cell($row,1).Range.Text=$roles[$row-1][0]
    $approval.Cell($row,2).Range.Text=" `r$($roles[$row-1][1])`r$($roles[$row-1][2])"
    $approval.Cell($row,3).Range.Text='Date'
    $approval.Cell($row,4).Range.Text=" `r"
    foreach($col in 1,2,3,4){$approval.Cell($row,$col).VerticalAlignment=0;$approval.Cell($row,$col).Range.ParagraphFormat.SpaceAfter=0}
    $sigLine=$approval.Cell($row,2).Range.Paragraphs.Item(1).Borders.Item(-3)
    $sigLine.LineStyle=1;$sigLine.LineWidth=4;$sigLine.Color=6291456
    $dateLine=$approval.Cell($row,4).Range.Paragraphs.Item(1).Borders.Item(-3)
    $dateLine.LineStyle=1;$dateLine.LineWidth=4;$dateLine.Color=6291456
  }

  $afterApproval=$doc.Range($approval.Range.End,$approval.Range.End)
  $afterApproval.InsertBreak(7)
  $revisionTitle=$doc.Range($afterApproval.End,$afterApproval.End)
  $revisionTitle.InsertAfter('Revision History')
  $revisionTitle.ParagraphFormat.SpaceBefore=0;$revisionTitle.ParagraphFormat.SpaceAfter=[single]6
  $revisionTitle.Font.Name='Verdana';$revisionTitle.Font.Size=[single]12;$revisionTitle.Font.Bold=1;$revisionTitle.Font.Color=6291456
  $revisionTitle.InsertParagraphAfter()
  $revRange=$doc.Range($revisionTitle.End,$revisionTitle.End)
  $revision=$doc.Tables.Add($revRange,2,4)
  $revision.AllowAutoFit=$false
  $revision.Columns.Item(1).Width=[single]75
  $revision.Columns.Item(2).Width=[single]110
  $revision.Columns.Item(3).Width=[single]255
  $revision.Columns.Item(4).Width=[single]90
  $revision.Cell(1,1).Range.Text='Version';$revision.Cell(1,2).Range.Text='Previous version';$revision.Cell(1,3).Range.Text='Reason for revision';$revision.Cell(1,4).Range.Text='Issued'
  $revision.Cell(2,1).Range.Text='1';$revision.Cell(2,2).Range.Text='NA';$revision.Cell(2,3).Range.Text='New Design Specification prepared for PLPI Batch Record Automation covering B&S Batch Add, Printing Modules and Leaflet Folding.';$revision.Cell(2,4).Range.Text='Aug 2026'
  $revision.Range.Font.Name='Verdana';$revision.Range.Font.Size=[single]10;$revision.Range.Font.Color=6291456
  $revision.Rows.Item(1).Range.Font.Bold=1;$revision.Rows.Item(1).Range.Font.Color=16777215;$revision.Rows.Item(1).Shading.BackgroundPatternColor=6291456;$revision.Rows.Item(1).HeadingFormat=-1
  $revision.Cell(2,1).Range.ParagraphFormat.Alignment=1;$revision.Cell(2,2).Range.ParagraphFormat.Alignment=1;$revision.Cell(2,4).Range.ParagraphFormat.Alignment=1
  $revision.Rows.AllowBreakAcrossPages=0
  $afterRevision=$doc.Range($revision.Range.End,$revision.Range.End)
  $afterRevision.InsertBreak(7)

  # Match the FS/reference body scale without changing content or screenshots.
  if($doc.TablesOfContents.Count -gt 0){
    $toc=$doc.TablesOfContents.Item(1)
    [void]$toc.Update()
    $toc.Range.Font.Name='Verdana';$toc.Range.Font.Size=[single]10;$toc.Range.Font.Color=6291456
    $bodySearch=$doc.Range($toc.Range.End,$doc.Content.End);$bodySearch.Find.Text='1. Introduction'
    if($bodySearch.Find.Execute()){
      $body=$doc.Range($bodySearch.Paragraphs.Item(1).Range.Start,$doc.Content.End)
      $body.Font.Name='Verdana';$body.Font.Size=[single]10;$body.Font.Color=6291456;$body.ParagraphFormat.SpaceAfter=[single]3
      $paragraphCount=$body.Paragraphs.Count
      for($i=1;$i -le $paragraphCount;$i++){
        $p=$body.Paragraphs.Item($i);$level=[int]$p.OutlineLevel
        if($level -eq 1){$p.Range.Font.Size=[single]12;$p.Range.Font.Bold=1;$p.Format.SpaceBefore=[single]6;$p.Format.SpaceAfter=[single]2;$p.Format.KeepWithNext=-1}
        elseif($level -eq 2){$p.Range.Font.Size=[single]10.5;$p.Range.Font.Bold=1;$p.Format.SpaceBefore=[single]5;$p.Format.SpaceAfter=[single]1.5;$p.Format.KeepWithNext=-1}
        elseif($p.Range.Text.Trim() -like 'Figure *'){$p.Range.Font.Size=[single]9;$p.Range.Font.Italic=1;$p.Format.Alignment=1;$p.Format.SpaceAfter=[single]5}
        [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($p)
      }
    }
  }
  [void]$doc.Fields.Update();$doc.Save()
}
finally{
  if($doc){$doc.Close($false);[void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($doc)}
  $word.ScreenUpdating=$oldUpdating
  [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($word)
  [GC]::Collect();[GC]::WaitForPendingFinalizers()
}
Write-Output 'Applied the reference DS/FS/URS front-page and typography format.'
