$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$root=Split-Path -Parent $PSScriptRoot
$wns='http://schemas.openxmlformats.org/wordprocessingml/2006/main'

function Read-Entry($zip,$name){$e=$zip.GetEntry($name);if(!$e){throw "Missing $name"};$r=New-Object IO.StreamReader($e.Open());try{$r.ReadToEnd()}finally{$r.Dispose()}}
function Write-Entry($zip,$name,$text){$e=$zip.GetEntry($name);if($e){$e.Delete()};$n=$zip.CreateEntry($name,[IO.Compression.CompressionLevel]::Optimal);$w=New-Object IO.StreamWriter($n.Open(),(New-Object Text.UTF8Encoding($false)));try{$w.Write($text)}finally{$w.Dispose()}}
function Copy-Entry($src,$dst,$name){$se=$src.GetEntry($name);if(!$se){return};$de=$dst.GetEntry($name);if($de){$de.Delete()};$ne=$dst.CreateEntry($name,[IO.Compression.CompressionLevel]::Optimal);$i=$se.Open();$o=$ne.Open();try{$i.CopyTo($o)}finally{$o.Dispose();$i.Dispose()}}
function Has-PageBreak($node,$ns){$node.SelectNodes('.//w:br[@w:type="page"]',$ns).Count-gt0}
function Prefix-Nodes($xml,$breaks){$ns=New-Object Xml.XmlNamespaceManager($xml.NameTable);$ns.AddNamespace('w',$wns);$body=$xml.SelectSingleNode('/w:document/w:body',$ns);$list=New-Object Collections.Generic.List[Xml.XmlNode];$count=0;foreach($n in @($body.ChildNodes)){if($n.LocalName-eq'sectPr'){break};$list.Add($n);if(Has-PageBreak $n $ns){$count++};if($count-ge$breaks){break}};if($count-lt$breaks){throw "Only $count page breaks found"};,$list}
function Remove-Prefix($xml,$breaks){$ns=New-Object Xml.XmlNamespaceManager($xml.NameTable);$ns.AddNamespace('w',$wns);$body=$xml.SelectSingleNode('/w:document/w:body',$ns);$count=0;foreach($n in @($body.ChildNodes)){if($n.LocalName-eq'sectPr'){break};$hit=Has-PageBreak $n $ns;$body.RemoveChild($n)|Out-Null;if($hit){$count++};if($count-ge$breaks){break}};if($count-lt$breaks){throw "Donor has only $count page breaks"};$body}
function Replace-Text($xml,$old,$new){$ns=New-Object Xml.XmlNamespaceManager($xml.NameTable);$ns.AddNamespace('w',$wns);foreach($t in @($xml.SelectNodes('//w:t',$ns))){if($t.InnerText.Contains($old)){$t.InnerText=$t.InnerText.Replace($old,$new)}}}

function Graft($reference,$output,$breaks,$oldTitle,$newTitle,$oldId,$newId,$oldRevision,$newRevision){
 $backup=Join-Path (Join-Path $root 'tmp_phase3_rebuild') (([IO.Path]::GetFileNameWithoutExtension($output))+'-before-prefix.docx');Copy-Item -LiteralPath $output -Destination $backup -Force
 $src=[IO.Compression.ZipFile]::OpenRead($reference);$dst=[IO.Compression.ZipFile]::Open($output,[IO.Compression.ZipArchiveMode]::Update)
 try{
  [xml]$sx=Read-Entry $src 'word/document.xml';[xml]$dx=Read-Entry $dst 'word/document.xml';$prefix=Prefix-Nodes $sx $breaks;$body=Remove-Prefix $dx $breaks;$first=$body.FirstChild
  foreach($n in $prefix){$clone=$dx.ImportNode($n,$true);if($first){$body.InsertBefore($clone,$first)|Out-Null}else{$body.AppendChild($clone)|Out-Null}}
  if($oldRevision){Replace-Text $dx $oldRevision $newRevision}
  Write-Entry $dst 'word/document.xml' $dx.OuterXml
  foreach($name in @('word/header1.xml','word/header2.xml','word/footer1.xml','word/footer2.xml','word/_rels/header1.xml.rels','word/_rels/header2.xml.rels')){Copy-Entry $src $dst $name}
  foreach($name in @('word/header1.xml','word/header2.xml','word/footer1.xml','word/footer2.xml')){$e=$dst.GetEntry($name);if(!$e){continue};[xml]$x=Read-Entry $dst $name;Replace-Text $x $oldTitle $newTitle;Replace-Text $x $oldId $newId;Write-Entry $dst $name $x.OuterXml}
 }finally{$dst.Dispose();$src.Dispose()}
}

$fsRef=Join-Path $root 'Phase 2 Doc\FS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx'
$dsRef=Join-Path $root 'Phase 2 Doc\DS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding - Exact Template.docx'
$fsOut=Join-Path $root 'Phase 3 Doc\FS-PLPI BAR - Pre-Assembly Production Controller Handheld Assembly and Post-Assembly QC.docx'
$dsOut=Join-Path $root 'Phase 3 Doc\DS-PLPI BAR - Pre-Assembly Production Controller Handheld Assembly and Post-Assembly QC.docx'
$oldRev='Functional Specification aligned to the approved URS and revised wireframe, covering the controlled two-page BAR, common printing controls, route-specific processing, read-only Leaflet Folding quantity confirmation, audit behaviour and operational hand-offs.'
$newRev='Functional Specification for PLPI BAR Stages 9-12: Pre-Assembly QC, Production Controller handheld and room allocation, Assembly Room and Post-Assembly QC.'
Graft $fsRef $fsOut 2 'Functional Specification: PLPI Batch Record Automation Phase 2' 'Functional Specification: PLPI Batch Record Automation Stages 9-12' 'PLPI/BAR/FS/01/v1' 'PLPI/BAR/FS/02/v1' $oldRev $newRev
Graft $dsRef $dsOut 1 'Design Specification: PLPI Batch Record Automation Phase 2' 'Design Specification: PLPI Batch Record Automation Stages 9-12' 'PLPI/BAR/DS/01/v1' 'PLPI/BAR/DS/02/v1' '' ''
'OOXML prefix graft complete.'
