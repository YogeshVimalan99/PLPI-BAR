$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$phase2 = Join-Path $root 'Phase 2 Doc'
$phase3 = Join-Path $root 'Phase 3 Doc'
$work = Join-Path $root 'tmp_phase3_rebuild'

$fsRef = Join-Path $phase2 'FS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'
$dsRef = Join-Path $phase2 'DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding - Exact Template.docx'
$fsOut = Join-Path $phase3 'FS-PLPI BAR - Pre-Assembly Production Controller Handheld Assembly and Post-Assembly QC.docx'
$dsOut = Join-Path $phase3 'DS-PLPI BAR - Pre-Assembly Production Controller Handheld Assembly and Post-Assembly QC.docx'
$fsBody = Join-Path $work 'generated-fs-body.docx'
$dsBody = Join-Path $work 'generated-ds-body.docx'

Copy-Item -LiteralPath $fsOut -Destination $fsBody -Force
Copy-Item -LiteralPath $dsOut -Destination $dsBody -Force

function Replace-Stories($doc,[string]$oldTitle,[string]$newTitle,[string]$oldId,[string]$newId) {
    foreach($section in $doc.Sections){
        foreach($kind in 1,2,3){
            foreach($story in @($section.Headers.Item($kind).Range,$section.Footers.Item($kind).Range)){
                try{$story.Find.Execute($oldTitle,$false,$false,$false,$false,$false,$true,1,$false,$newTitle,2)|Out-Null}catch{}
                try{$story.Find.Execute($oldId,$false,$false,$false,$false,$false,$true,1,$false,$newId,2)|Out-Null}catch{}
            }
        }
    }
}

function Graft-Document($word,[string]$reference,[string]$body,[string]$output,[int]$preservePages,[int]$bodyStartPage,[string]$oldTitle,[string]$newTitle,[string]$oldId,[string]$newId) {
    $staged = Join-Path $work (([IO.Path]::GetFileNameWithoutExtension($output)) + '-staged.docx')
    Copy-Item -LiteralPath $reference -Destination $staged -Force
    $target=$null;$donor=$null
    try{
        $target=$word.Documents.Open($staged,$false,$false)
        $target.Repaginate()
        $deleteStart=$target.GoTo(1,1,($preservePages+1)).Start
        $deleteEnd=$target.Content.End-1
        if($deleteEnd -gt $deleteStart){$target.Range($deleteStart,$deleteEnd).Delete()|Out-Null}

        $donor=$word.Documents.Open($body,$false,$true,$false,'','',$false,'','',0,'',$false,$true)
        $donor.Repaginate()
        $copyStart=$donor.GoTo(1,1,$bodyStartPage).Start
        $copyRange=$donor.Range($copyStart,$donor.Content.End-1)
        $insert=$target.Range($target.Content.End-1,$target.Content.End-1)
        $insert.FormattedText=$copyRange.FormattedText

        Replace-Stories $target $oldTitle $newTitle $oldId $newId
        try{$target.Settings.UpdateFieldsAtPrint=$true}catch{}
        $target.Save()
        $target.Close($false);$target=$null
        $donor.Close($false);$donor=$null
        Copy-Item -LiteralPath $staged -Destination $output -Force
    }
    finally{
        if($target){try{$target.Close($false)}catch{}}
        if($donor){try{$donor.Close($false)}catch{}}
    }
}

$word=$null
try{
    $word=New-Object -ComObject Word.Application
    $word.Visible=$false
    $word.DisplayAlerts=0
    Graft-Document $word $fsRef $fsBody $fsOut 3 4 'Functional Specification: PLPI Batch Record Automation Phase 2' 'Functional Specification: PLPI Batch Record Automation Phase 3' 'PLPI/BAR/FS/01/v1' 'PLPI/BAR/FS/02/v1'
    Graft-Document $word $dsRef $dsBody $dsOut 2 3 'Design Specification: PLPI Batch Record Automation Phase 2' 'Design Specification: PLPI Batch Record Automation Phase 3' 'PLPI/BAR/DS/01/v1' 'PLPI/BAR/DS/02/v1'
}
finally{
    if($word){$word.Quit();[void][Runtime.InteropServices.Marshal]::ReleaseComObject($word)}
    [GC]::Collect();[GC]::WaitForPendingFinalizers()
}

"Grafted retained Phase 2 front pages into FS and DS."
