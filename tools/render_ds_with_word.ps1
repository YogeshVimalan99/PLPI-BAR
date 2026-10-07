$ErrorActionPreference = 'Stop'

$docxPath = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\Phase 3 Doc\DS-PLPI BAR - Phase 2-B Pre Assembly to Post Assembly.docx'
$outputDir = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation\tmp_ds_wireframe_update\word_render'
$pdfPath = Join-Path $outputDir 'DS-PLPI BAR - Phase 2-B Pre Assembly to Post Assembly.pdf'
$renderInput = Join-Path $outputDir 'render-input.docx'

New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
Copy-Item -LiteralPath $docxPath -Destination $renderInput -Force

$word = $null
$document = $null
try {
    Write-Output 'Creating Word automation instance'
    $word = [Runtime.InteropServices.Marshal]::GetActiveObject('Word.Application')
    Write-Output 'Word automation instance created'
    $word.Visible = $false
    $word.DisplayAlerts = 0
    Write-Output 'Opening temporary render copy'
    $document = $word.Documents.Open($renderInput, $false, $true, $false)
    Write-Output 'Temporary render copy opened'
    Write-Output 'Exporting PDF'
    $document.ExportAsFixedFormat($pdfPath, 17)
    Write-Output 'PDF export completed'
    Write-Output $pdfPath
}
finally {
    if ($null -ne $document) {
        $document.Close($false)
        [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($document)
    }
    if ($null -ne $word) { [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($word) }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
