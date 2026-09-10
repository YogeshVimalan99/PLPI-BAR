$ErrorActionPreference='Stop'
$root='C:\Users\vimalyog\Desktop\PLPI Batch Automation'
$docPath=[IO.Path]::GetFullPath((Join-Path $root 'Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'))
$pdfPath=Join-Path $root 'tmp_phase2_ds_rebuild\DS-reference-format-preview.pdf'
$word=[Runtime.InteropServices.Marshal]::GetActiveObject('Word.Application')
$doc=$null
try{foreach($candidate in @($word.Documents)){if(-not [string]::IsNullOrWhiteSpace($candidate.Path) -and [IO.Path]::GetFullPath($candidate.FullName).Equals($docPath,[StringComparison]::OrdinalIgnoreCase)){$doc=$candidate;break}};if($null -eq $doc){throw 'Open DS not found.'};$pages=$doc.ComputeStatistics(2);$doc.ExportAsFixedFormat($pdfPath,17,$false,0,0,1,$pages);Write-Output "Exported $pages pages."}finally{if($doc){[void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($doc)};[void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($word)}
