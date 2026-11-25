"""Bundle ES modules to a file://-compatible classic script with no third-party runtime."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1];src=root/'src/oth-v1'
mods=[('DATA','oth-data.js'),('ENGINE','oth-engine.js'),('RENDER','oth-render.js'),('UI','oth-ui.js')]
lookup={filename:'OTH_'+name for name,filename in mods};scripts=[]
for name,filename in mods:
 text=(src/filename).read_text();exports=re.findall(r'^export (?:const|function) (\w+)',text,re.M)
 def replace(m):
  symbols,file=m.groups();return 'const {'+symbols+'}='+lookup[file]+';'
 text=re.sub(r"import\s*\{([^}]+)\}\s*from\s*'\./([^']+)';",replace,text)
 text=re.sub(r'^export ', '',text,flags=re.M)
 if re.search(r'^import ',text,re.M):raise ValueError('Unsupported import '+filename)
 scripts.append('const OTH_'+name+'=(()=>{\n'+text+'\nreturn {'+','.join(exports)+'};\n})();')
text='\n'.join(scripts)+'\nOTH_UI.mount(document.getElementById("oth-root"));'
html='<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="application-version" content="0.10.0"><title>ALIEN — Hors des ombres · Le Marion, pièce par pièce</title><style>'+(src/'oth-ui.css').read_text()+'</style></head><body><div id="oth-root"></div><script>'+text.replace('</script','<\\/script')+'</script></body></html>'
(root/'JOUER_HORS_DES_OMBRES.html').write_text(html)
print('Bundled',len(html.encode()),'bytes')
