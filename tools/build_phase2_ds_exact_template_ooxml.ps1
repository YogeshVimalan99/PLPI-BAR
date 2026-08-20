$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = 'C:\Users\vimalyog\Desktop\PLPI Batch Automation'
$template = Join-Path $root 'docz\DS-PLPI BAR.docx'
$source = Join-Path $root 'Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding - Recreated.docx'
$output = Join-Path $root 'Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding - Exact Template.docx'
$task = Join-Path $root 'tmp_ds_exact_template\ooxml-build'
$tplWork = Join-Path $task 'template'
$srcWork = Join-Path $task 'source'
$zip = Join-Path $task 'output.zip'
$expectedHash = '7EE0B5A6355765B5941F79BEDDBCB048625211079A206FE1C6F7D446F1FF97B2'
if ((Get-FileHash -LiteralPath $template -Algorithm SHA256).Hash -ne $expectedHash) { throw 'The template changed after distillation.' }
if (Test-Path -LiteralPath $task) { Remove-Item -LiteralPath $task -Recurse -Force }
New-Item -ItemType Directory -Path $tplWork,$srcWork -Force | Out-Null
[IO.Compression.ZipFile]::ExtractToDirectory($template,$tplWork)
[IO.Compression.ZipFile]::ExtractToDirectory($source,$srcWork)

$wNs='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
$rNs='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
$relNs='http://schemas.openxmlformats.org/package/2006/relationships'
$writerSettings=New-Object Xml.XmlWriterSettings
$writerSettings.Encoding=New-Object Text.UTF8Encoding($false)
$writerSettings.Indent=$false

function Load-Xml([string]$path){$x=New-Object Xml.XmlDocument;$x.PreserveWhitespace=$true;$x.Load($path);return $x}
function Save-Xml($xml,[string]$path){$wr=[Xml.XmlWriter]::Create($path,$writerSettings);$xml.Save($wr);$wr.Close()}
function Node-Text($node,$ns){return (($node.SelectNodes('.//w:t',$ns)|ForEach-Object{$_.InnerText}) -join '')}
function Ensure-Child($xml,$parent,[string]$local){$n=$parent.SelectSingleNode('./w:'+$local,$global:nsOut);if(-not $n){$n=$xml.CreateElement('w',$local,$global:wNs);[void]$parent.AppendChild($n)};return $n}

$tplDocPath=Join-Path $tplWork 'word\document.xml'
$srcDocPath=Join-Path $srcWork 'word\document.xml'
$tplXml=Load-Xml $tplDocPath
$srcXml=Load-Xml $srcDocPath
$nsOut=New-Object Xml.XmlNamespaceManager($tplXml.NameTable);$nsOut.AddNamespace('w',$wNs);$nsOut.AddNamespace('r',$rNs)
$nsSrc=New-Object Xml.XmlNamespaceManager($srcXml.NameTable);$nsSrc.AddNamespace('w',$wNs);$nsSrc.AddNamespace('r',$rNs)
$global:nsOut=$nsOut;$global:wNs=$wNs
$tplBody=$tplXml.SelectSingleNode('//w:body',$nsOut)
$srcBody=$srcXml.SelectSingleNode('//w:body',$nsSrc)

$tplStart=$null
foreach($n in @($tplBody.ChildNodes)){if($n.LocalName -eq 'p' -and (Node-Text $n $nsOut).Trim() -eq '1. Introduction'){$tplStart=$n;break}}
$srcStart=$null
foreach($n in @($srcBody.ChildNodes)){if($n.LocalName -eq 'p' -and (Node-Text $n $nsSrc).Trim() -eq '1. Introduction'){$srcStart=$n;break}}
if(-not $tplStart -or -not $srcStart){throw 'Could not locate the body start in template or source.'}

# Prepare image relationship mapping for only the imported Phase 2 body.
$srcRelsPath=Join-Path $srcWork 'word\_rels\document.xml.rels'
$tplRelsPath=Join-Path $tplWork 'word\_rels\document.xml.rels'
$srcRels=Load-Xml $srcRelsPath
$tplRels=Load-Xml $tplRelsPath
$srcRelNs=New-Object Xml.XmlNamespaceManager($srcRels.NameTable);$srcRelNs.AddNamespace('pr',$relNs)
$tplRelNs=New-Object Xml.XmlNamespaceManager($tplRels.NameTable);$tplRelNs.AddNamespace('pr',$relNs)
$importNodes=@();$started=$false
foreach($n in @($srcBody.ChildNodes)){
  if($n -eq $srcStart){$started=$true}
  if($started -and $n.LocalName -ne 'sectPr'){$importNodes+=,$n.CloneNode($true)}
}
$embedIds=@{}
foreach($n in $importNodes){foreach($a in @($n.SelectNodes('.//@r:embed',$nsSrc))){$embedIds[$a.Value]=$true}}
$nextRel=9000
foreach($oldId in @($embedIds.Keys)){
  $rel=$srcRels.SelectSingleNode("//pr:Relationship[@Id='$oldId']",$srcRelNs)
  if(-not $rel){continue}
  $target=$rel.GetAttribute('Target')
  if($target -notmatch '^media/') {continue}
  $srcMedia=Join-Path (Join-Path $srcWork 'word') ($target -replace '/','\')
  $ext=[IO.Path]::GetExtension($srcMedia)
  $newName=('phase2-body-{0:D2}{1}' -f ($nextRel-8999),$ext)
  $dstMedia=Join-Path (Join-Path $tplWork 'word\media') $newName
  Copy-Item -LiteralPath $srcMedia -Destination $dstMedia -Force
  $newId='rId'+$nextRel;$nextRel++
  $newRel=$tplRels.CreateElement('Relationship',$relNs)
  $newRel.SetAttribute('Id',$newId);$newRel.SetAttribute('Type',$rel.GetAttribute('Type'));$newRel.SetAttribute('Target','media/'+$newName)
  [void]$tplRels.DocumentElement.AppendChild($newRel)
  foreach($n in $importNodes){foreach($a in @($n.SelectNodes(".//@r:embed[.='$oldId']",$nsSrc))){$a.Value=$newId}}
}

# Remove all old template body content, preserving cover, TOC and section properties.
$remove=$false
foreach($n in @($tplBody.ChildNodes)){
  if($n -eq $tplStart){$remove=$true}
  if($remove -and $n.LocalName -ne 'sectPr'){[void]$tplBody.RemoveChild($n)}
}
$sect=$tplBody.SelectSingleNode('./w:sectPr',$nsOut)
foreach($n in $importNodes){$new=$tplXml.ImportNode($n,$true);[void]$tplBody.InsertBefore($new,$sect)}

# Replace template-only cover values without changing its structure.
foreach($t in @($tplXml.SelectNodes('//w:t',$nsOut))){
  switch($t.InnerText){
    'Ronex Pereira' {$t.InnerText='Juston Rodrigues'}
    'Rajesh Patel' {$t.InnerText='Anthony Fernandes'}
    'Quality Specialist / RP' {$t.InnerText='QA'}
    'Team Lead' {$t.InnerText='Team Leader'}
  }
}

# Apply the template typography to imported paragraphs and plain-grid styling to imported tables.
$bodyNow=$tplXml.SelectSingleNode('//w:body',$nsOut);$afterStart=$false
foreach($p in @($bodyNow.SelectNodes('./w:p',$nsOut))){
  $txt=(Node-Text $p $nsOut).Trim();if($txt -eq '1. Introduction'){$afterStart=$true};if(-not $afterStart){continue}
  $pPr=Ensure-Child $tplXml $p 'pPr';$styleNode=$pPr.SelectSingleNode('./w:pStyle',$nsOut);$style=if($styleNode){$styleNode.GetAttribute('val',$wNs)}else{''}
  $spacing=Ensure-Child $tplXml $pPr 'spacing';$jc=Ensure-Child $tplXml $pPr 'jc'
  if($style -eq 'Heading1'){$size='28';$spacing.SetAttribute('before',$wNs,'160');$spacing.SetAttribute('after',$wNs,'120');$jc.SetAttribute('val',$wNs,'left')}
  elseif($style -eq 'Heading2'){$size='24';$spacing.SetAttribute('before',$wNs,'120');$spacing.SetAttribute('after',$wNs,'120');$jc.SetAttribute('val',$wNs,'left')}
  elseif($txt -match '^Figure\s+\d+'){$size='20';$spacing.SetAttribute('before',$wNs,'0');$spacing.SetAttribute('after',$wNs,'120');$jc.SetAttribute('val',$wNs,'center')}
  else{$size='20';$spacing.SetAttribute('before',$wNs,'0');$spacing.SetAttribute('after',$wNs,'120');$spacing.SetAttribute('line',$wNs,'300');$spacing.SetAttribute('lineRule',$wNs,'exact');$jc.SetAttribute('val',$wNs,'both')}
  foreach($r in @($p.SelectNodes('.//w:r',$nsOut))){$rPr=Ensure-Child $tplXml $r 'rPr';$fonts=Ensure-Child $tplXml $rPr 'rFonts';$fonts.SetAttribute('ascii',$wNs,'Verdana');$fonts.SetAttribute('hAnsi',$wNs,'Verdana');$color=Ensure-Child $tplXml $rPr 'color';$color.SetAttribute('val',$wNs,'002060');$sz=Ensure-Child $tplXml $rPr 'sz';$sz.SetAttribute('val',$wNs,$size);$szc=Ensure-Child $tplXml $rPr 'szCs';$szc.SetAttribute('val',$wNs,$size);if($style -eq 'Heading1' -or $style -eq 'Heading2'){[void](Ensure-Child $tplXml $rPr 'b')}elseif($txt -match '^Figure\s+\d+'){[void](Ensure-Child $tplXml $rPr 'i')}}
}

$tables=@($bodyNow.SelectNodes('./w:tbl',$nsOut))
for($i=3;$i -lt $tables.Count;$i++){
  $tbl=$tables[$i]
  foreach($shd in @($tbl.SelectNodes('.//w:shd',$nsOut))){[void]$shd.ParentNode.RemoveChild($shd)}
  foreach($r in @($tbl.SelectNodes('.//w:r',$nsOut))){$rPr=Ensure-Child $tplXml $r 'rPr';$fonts=Ensure-Child $tplXml $rPr 'rFonts';$fonts.SetAttribute('ascii',$wNs,'Verdana');$fonts.SetAttribute('hAnsi',$wNs,'Verdana');$color=Ensure-Child $tplXml $rPr 'color';$color.SetAttribute('val',$wNs,'002060');$sz=Ensure-Child $tplXml $rPr 'sz';$sz.SetAttribute('val',$wNs,'22');$szc=Ensure-Child $tplXml $rPr 'szCs';$szc.SetAttribute('val',$wNs,'22')}
  $firstRow=$tbl.SelectSingleNode('./w:tr[1]',$nsOut);if($firstRow){foreach($r in @($firstRow.SelectNodes('.//w:r',$nsOut))){$rPr=Ensure-Child $tplXml $r 'rPr';[void](Ensure-Child $tplXml $rPr 'b')}}
}

Save-Xml $tplXml $tplDocPath
Save-Xml $tplRels $tplRelsPath

# Exact recurring header/footer furniture with Phase 2 identification.
foreach($path in @(Get-ChildItem -LiteralPath (Join-Path $tplWork 'word') -File | Where-Object{$_.Name -match '^(header|footer)\d+\.xml$'} | Select-Object -ExpandProperty FullName)){
  $text=[IO.File]::ReadAllText($path)
  $text=$text.Replace('Design Specification: PLPI Batch Record Automation','Design Specification: PLPI Batch Record Automation Phase 2').Replace('DS/PLPI/PH1/v1.0','PLPI/BAR/DS/01/v1')
  [IO.File]::WriteAllText($path,$text,(New-Object Text.UTF8Encoding($false)))
}

$settingsPath=Join-Path $tplWork 'word\settings.xml';$settings=Load-Xml $settingsPath;$sns=New-Object Xml.XmlNamespaceManager($settings.NameTable);$sns.AddNamespace('w',$wNs);$uf=$settings.SelectSingleNode('//w:updateFields',$sns);if(-not $uf){$uf=$settings.CreateElement('w','updateFields',$wNs);[void]$settings.DocumentElement.AppendChild($uf)};$uf.SetAttribute('val',$wNs,'true');Save-Xml $settings $settingsPath

if(Test-Path -LiteralPath $zip){Remove-Item -LiteralPath $zip -Force}
$zipStream=[IO.File]::Open($zip,[IO.FileMode]::CreateNew)
try{
  $archive=New-Object IO.Compression.ZipArchive($zipStream,[IO.Compression.ZipArchiveMode]::Create,$true)
  try{
    foreach($file in Get-ChildItem -LiteralPath $tplWork -File -Recurse){
      $relative=$file.FullName.Substring($tplWork.Length).TrimStart('\').Replace('\','/')
      $entry=$archive.CreateEntry($relative,[IO.Compression.CompressionLevel]::Optimal)
      $inStream=[IO.File]::OpenRead($file.FullName)
      $outStream=$entry.Open()
      try{$inStream.CopyTo($outStream)}finally{$outStream.Dispose();$inStream.Dispose()}
    }
  }finally{$archive.Dispose()}
}finally{$zipStream.Dispose()}
Copy-Item -LiteralPath $zip -Destination $output -Force
Write-Output "Created $output"
