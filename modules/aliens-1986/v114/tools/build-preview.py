"""Bundle verified local ES module sources into one offline HTML; no remote API."""
from pathlib import Path
import json,re,hashlib,posixpath
ROOT=Path(__file__).resolve().parent.parent
paths=sorted(str(f.relative_to(ROOT)) for folder in ['src','preview'] for f in (ROOT/folder).glob('*.mjs'))
registry={}
for name in paths:
 source=(ROOT/name).read_text()
 deps={s:posixpath.normpath(posixpath.join(posixpath.dirname(name),s)) for s in re.findall(r"from\s+['\"]([^'\"]+)['\"]",source)}
 registry[name]={'source':source,'deps':deps,'sha256':hashlib.sha256((ROOT/name).read_bytes()).hexdigest()}
html=(ROOT/'preview/index.html').read_text().replace('<link rel="stylesheet" href="./style.css">','<style>'+(ROOT/'preview/style.css').read_text()+'</style>')
data=json.dumps(registry,ensure_ascii=False).replace('</','<\\/')
script='''<script type="module">
const registry=__DATA__, urls=new Map();
function moduleUrl(id){if(urls.has(id))return urls.get(id);const entry=registry[id];if(!entry)throw new Error('Module absent : '+id);let source=entry.source;for(const [rel,path] of Object.entries(entry.deps)){const url=moduleUrl(path);source=source.split("'"+rel+"'").join("'"+url+"'").split('"'+rel+'"').join('"'+url+'"');}const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));urls.set(id,url);return url;}
try{await import(moduleUrl('preview/app.mjs'));}catch(error){const warning=document.createElement('pre');warning.textContent='Erreur de chargement : '+error.message;document.body.prepend(warning);throw error;}
</script>'''.replace('__DATA__',data)
html=html.replace('<script type="module" src="./app.mjs"></script>',script)
(ROOT/'JOUER_ALIENS_V114.html').write_text(html)
(ROOT/'report/module-hashes.json').write_text(json.dumps({k:v['sha256'] for k,v in registry.items()},indent=2)+'\n')
print('HTML bytes',len(html.encode()),'modules',len(paths))
