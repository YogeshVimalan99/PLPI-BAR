$ErrorActionPreference = 'Stop'

$wrapperPath = Join-Path $PSScriptRoot 'run_phase3_exact_phase2_template_rebuild.ps1'
$wrapper = [IO.File]::ReadAllText($wrapperPath)
$workspace = Split-Path -Parent $PSScriptRoot
$baseScript = Join-Path $PSScriptRoot 'rebuild_phase3_fs_ds_phase2_template.ps1'

$wrapper = $wrapper.Replace(
    '$sourcePath = Join-Path $PSScriptRoot ''rebuild_phase3_fs_ds_phase2_template.ps1''',
    ('$sourcePath = ''' + $baseScript.Replace("'", "''") + '''')
)
$wrapper = $wrapper.Replace(
    '$workspace = Split-Path -Parent $PSScriptRoot',
    ('$workspace = ''' + $workspace.Replace("'", "''") + '''')
)
$wrapper = $wrapper.Replace(
    '$d.GoTo(1,1,$preservePages+1)',
    '$d.GoTo(1,1,($preservePages+1))'
)
$wrapper = $wrapper.Replace(
    '$d.Range($deleteStart,$deleteEnd).Delete()}',
    '$d.Range($deleteStart,$deleteEnd).Delete()|Out-Null}'
)

$invoke = @'
$source=$source.Replace('$top=$t.Cell(1,1).Merge($t.Cell(1,2)); CellText $top', '$t.Cell(1,1).Merge($t.Cell(1,2))|Out-Null; $top=$t.Cell(1,1); CellText $top')
& ([scriptblock]::Create($source))
'@
$wrapper = $wrapper.Replace('& ([scriptblock]::Create($source))', $invoke)

. ([scriptblock]::Create($wrapper))
