$ErrorActionPreference = 'Stop'

$fixedRunner = Join-Path $PSScriptRoot 'run_phase3_exact_phase2_template_rebuild_fixed.ps1'
$runner = [IO.File]::ReadAllText($fixedRunner)
$runner = $runner.Replace(
    '& ([scriptblock]::Create($source))',
    @'
$source=$source.Replace('$fs.Repaginate();$fsToc.Update();foreach($f in $fs.Fields){try{$f.Update()}catch{}};$fs.Save();$fs.Close($false);$fs=$null', '$fs.Save();$fs.Close($false);$fs=$null')
$source=$source.Replace('$ds.Repaginate();$dsToc.Update();foreach($f in $ds.Fields){try{$f.Update()}catch{}};$ds.Save();$ds.Close($false);$ds=$null', '$ds.Save();$ds.Close($false);$ds=$null')
& ([scriptblock]::Create($source))
'@
)

$workspace = Split-Path -Parent $PSScriptRoot
$runner = $runner.Replace(
    '$wrapperPath = Join-Path $PSScriptRoot ''run_phase3_exact_phase2_template_rebuild.ps1''',
    ('$wrapperPath = ''' + (Join-Path $PSScriptRoot 'run_phase3_exact_phase2_template_rebuild.ps1').Replace("'", "''") + '''')
)
$runner = $runner.Replace(
    '$workspace = Split-Path -Parent $PSScriptRoot',
    ('$workspace = ''' + $workspace.Replace("'", "''") + '''')
)
$runner = $runner.Replace(
    '$baseScript = Join-Path $PSScriptRoot ''rebuild_phase3_fs_ds_phase2_template.ps1''',
    ('$baseScript = ''' + (Join-Path $PSScriptRoot 'rebuild_phase3_fs_ds_phase2_template.ps1').Replace("'", "''") + '''')
)

. ([scriptblock]::Create($runner))
