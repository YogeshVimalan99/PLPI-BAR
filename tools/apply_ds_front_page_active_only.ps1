$ErrorActionPreference='Stop'
$path=[IO.Path]::GetFullPath('C:\Users\vimalyog\Desktop\PLPI Batch Automation\Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx')
$word=[Runtime.InteropServices.Marshal]::GetActiveObject('Word.Application')
$doc=$null
$oldUpdating=$word.ScreenUpdating
try{
  $word.ScreenUpdating=$false
  $doc=$word.Documents.Open($path,$false,$false,$false)

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

  $page2=$doc.GoTo(1,1,2).Start
  [void]$doc.Range(0,$page2).Delete()
  $start=$doc.Range(0,0);$start.InsertAfter("`r");$doc.Paragraphs.Item(1).Format.SpaceAfter=[single]18

  $approval=$doc.Tables.Add($doc.Range($doc.Paragraphs.Item(1).Range.End,$doc.Paragraphs.Item(1).Range.End),5,4)
  $approval.AllowAutoFit=$false;$approval.Borders.Enable=0
  $approval.Columns.Item(1).Width=[single]70;$approval.Columns.Item(2).Width=[single]250;$approval.Columns.Item(3).Width=[single]50;$approval.Columns.Item(4).Width=[single]95
  $approval.Range.Font.Name='Verdana';$approval.Range.Font.Size=[single]10;$approval.Range.Font.Color=6291456
  $approval.TopPadding=0;$approval.BottomPadding=0;$approval.LeftPadding=2;$approval.RightPadding=2
  $roles=@(@('Author','Yogeshkumar Vimalan','Business Analyst'),@('Reviewer','Amit Sanandiya','Project Manager'),@('Reviewer','Juston Rodrigues','Team Leader'),@('Reviewer','Anthony Fernandes','Team Leader'),@('Approver','Beauty Dadhaniya','QA'))
  for($row=1;$row -le 5;$row++){
    $approval.Rows.Item($row).HeightRule=1;$approval.Rows.Item($row).Height=[single]92
    $approval.Cell($row,1).Range.Text=$roles[$row-1][0]
    $approval.Cell($row,2).Range.Text=" `r$($roles[$row-1][1])`r$($roles[$row-1][2])"
    $approval.Cell($row,3).Range.Text='Date';$approval.Cell($row,4).Range.Text=" `r"
    foreach($col in 1,2,3,4){$approval.Cell($row,$col).VerticalAlignment=0;$approval.Cell($row,$col).Range.ParagraphFormat.SpaceAfter=0}
    foreach($cell in @($approval.Cell($row,2),$approval.Cell($row,4))){$border=$cell.Range.Paragraphs.Item(1).Borders.Item(-3);$border.LineStyle=1;$border.LineWidth=4;$border.Color=6291456}
  }

  $after=$doc.Range($approval.Range.End,$approval.Range.End);$after.InsertBreak(7)
  $title=$doc.Range($after.End,$after.End);$title.InsertAfter('Revision History');$title.Font.Name='Verdana';$title.Font.Size=[single]12;$title.Font.Bold=1;$title.Font.Color=6291456;$title.ParagraphFormat.SpaceAfter=[single]6;$title.InsertParagraphAfter()
  $revision=$doc.Tables.Add($doc.Range($title.End,$title.End),2,4);$revision.AllowAutoFit=$false
  $revision.Columns.Item(1).Width=[single]75;$revision.Columns.Item(2).Width=[single]110;$revision.Columns.Item(3).Width=[single]255;$revision.Columns.Item(4).Width=[single]90
  $headers=@('Version','Previous version','Reason for revision','Issued');for($c=1;$c -le 4;$c++){$revision.Cell(1,$c).Range.Text=$headers[$c-1]}
  $revision.Cell(2,1).Range.Text='1';$revision.Cell(2,2).Range.Text='NA';$revision.Cell(2,3).Range.Text='New Design Specification prepared for PLPI Batch Record Automation covering B&S Batch Add, Printing Modules and Leaflet Folding.';$revision.Cell(2,4).Range.Text='Aug 2026'
  $revision.Range.Font.Name='Verdana';$revision.Range.Font.Size=[single]10;$revision.Range.Font.Color=6291456
  $revision.Rows.Item(1).Range.Font.Bold=1;$revision.Rows.Item(1).Range.Font.Color=16777215;$revision.Rows.Item(1).Shading.BackgroundPatternColor=6291456;$revision.Rows.Item(1).HeadingFormat=-1
  $revision.Cell(2,1).Range.ParagraphFormat.Alignment=1;$revision.Cell(2,2).Range.ParagraphFormat.Alignment=1;$revision.Cell(2,4).Range.ParagraphFormat.Alignment=1;$revision.Rows.AllowBreakAcrossPages=0
  $next=$doc.Range($revision.Range.End,$revision.Range.End);$next.InsertBreak(7)

  foreach($toc in @($doc.TablesOfContents)){[void]$toc.Update();$toc.Range.Font.Name='Verdana';$toc.Range.Font.Size=[single]10;$toc.Range.Font.Color=6291456}
  [void]$doc.Fields.Update();$doc.Save()
  $doc.Close($false)
}
finally{
  $word.ScreenUpdating=$oldUpdating
  if($doc){try{[void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($doc)}catch{}}
  [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($word)
  [GC]::Collect();[GC]::WaitForPendingFinalizers()
}
Write-Output 'Applied clean FS/URS-style front matter and saved the DS.'
