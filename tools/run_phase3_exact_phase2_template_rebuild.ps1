$ErrorActionPreference = 'Stop'

$sourcePath = Join-Path $PSScriptRoot 'rebuild_phase3_fs_ds_phase2_template.ps1'
$source = [IO.File]::ReadAllText($sourcePath)
$workspace = Split-Path -Parent $PSScriptRoot

function Replace-Exact([string]$old, [string]$new) {
    if (-not $script:source.Contains($old)) {
        throw "Expected source block was not found: $($old.Substring(0, [Math]::Min(90, $old.Length)))"
    }
    $script:source = $script:source.Replace($old, $new)
}

Replace-Exact '$root = Split-Path -Parent $PSScriptRoot' ("`$root = '" + $workspace.Replace("'", "''") + "'")

$oldStart = @'
function StartDoc($word,[string]$ref,[string]$out,[string]$oldTitle,[string]$newTitle,[string]$oldId,[string]$newId) {
  Copy-Item -LiteralPath $ref -Destination $out -Force
  $d=$word.Documents.Open($out,$false,$false); try{if($d.ProtectionType-ne-1){$d.Unprotect()}}catch{}
  $d.Content.Delete(); ReplaceStories $d $oldTitle $newTitle $oldId $newId
  $d.PageSetup.PageWidth=595.3;$d.PageSetup.PageHeight=841.9;$d.PageSetup.LeftMargin=72;$d.PageSetup.RightMargin=72;$d.PageSetup.TopMargin=72;$d.PageSetup.BottomMargin=72
  return $d
}
'@
$newStart = @'
function StartDoc($word,[string]$ref,[string]$out,[int]$preservePages,[string]$oldTitle,[string]$newTitle,[string]$oldId,[string]$newId) {
  Copy-Item -LiteralPath $ref -Destination $out -Force
  $d=$word.Documents.Open($out,$false,$false); try{if($d.ProtectionType-ne-1){$d.Unprotect()}}catch{}
  ReplaceStories $d $oldTitle $newTitle $oldId $newId
  $d.Repaginate()
  $deleteStart=$d.GoTo(1,1,$preservePages+1).Start
  $deleteEnd=$d.Content.End-1
  if($deleteEnd -gt $deleteStart){$d.Range($deleteStart,$deleteEnd).Delete()}
  return $d
}
'@
Replace-Exact $oldStart $newStart

Replace-Exact "URS='4.3.1 - 4.3.28 (approved IDs present in the URS)'" "URS='4.3 (24 approved requirements)'"
Replace-Exact "URS='4.4.1 - 4.4.13'" "URS='4.4 (13 approved requirements)'"

$oldFs = @'
  $fs=StartDoc $word $fsRef $fsOut 'Functional Specification: PLPI Batch Record Automation Phase 2' 'Functional Specification: PLPI Batch Record Automation Stages 9-12' 'PLPI/BAR/FS/01/v1' 'PLPI/BAR/FS/02/v1'
  AddApprovalTable $fs $false|Out-Null;Break $fs
  AddRevision $fs 'Functional Specification';Break $fs
  $fsToc=AddTOC $fs;Break $fs
'@
$newFs = @'
  $fs=StartDoc $word $fsRef $fsOut 3 'Functional Specification: PLPI Batch Record Automation Phase 2' 'Functional Specification: PLPI Batch Record Automation Phase 3' 'PLPI/BAR/FS/01/v1' 'PLPI/BAR/FS/02/v1'
  $fs.Tables.Item(4).Cell(2,3).Range.Text='Functional Specification for PLPI BAR Stages 9-12, covering Pre-Assembly QC, Production Controller handheld Stock Take Out, Line Clearance and room allocation, Assembly Room execution and Post-Assembly QC.'
  $fs.Tables.Item(4).Cell(2,4).Range.Text='Sep 2026'
  $fsToc=$fs.TablesOfContents.Item(1)
'@
Replace-Exact $oldFs $newFs

$oldDs = @'
  $ds=StartDoc $word $dsRef $dsOut 'Design Specification: PLPI Batch Record Automation Phase 2' 'Design Specification: PLPI Batch Record Automation Stages 9-12' 'PLPI/BAR/DS/01/v1' 'PLPI/BAR/DS/02/v1'
  $p=AddP $ds 'DESIGN SPECIFICATION' 1 15 $true 5;$p.Range.Font.Color=$script:blue
  $p=AddP $ds 'PLPI Batch Record Automation' 1 12 $true 3;$p.Range.Font.Color=$script:blue
  AddP $ds 'Stages 9-12: Pre-Assembly QC, Production Controller Handheld, Assembly Room and Post-Assembly QC' 1 9 $false 8|Out-Null
  AddApprovalTable $ds $true|Out-Null
  AddRevision $ds 'Design Specification';Break $ds
  $dsToc=AddTOC $ds;Break $ds
'@
$newDs = @'
  $ds=StartDoc $word $dsRef $dsOut 2 'Design Specification: PLPI Batch Record Automation Phase 2' 'Design Specification: PLPI Batch Record Automation Phase 3' 'PLPI/BAR/DS/01/v1' 'PLPI/BAR/DS/02/v1'
  $dsToc=$ds.TablesOfContents.Item(1)
'@
Replace-Exact $oldDs $newDs

& ([scriptblock]::Create($source))
