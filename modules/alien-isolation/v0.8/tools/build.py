from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
parts=[]
for name in ['content.js','spatial.js','spatial-renderer.js','assets.js','protocols.js','life-support.js','encounters.js','refuges.js','vault.js','audio.js','signals.js','engine.js','renderer.js','quick-controls.js','app.js']:
 s=(ROOT/'src'/name).read_text()
 s=re.sub(r'^import .*?;\s*','',s,flags=re.M)
 s=re.sub(r'^export ','',s,flags=re.M)
 parts.append('// MODULE '+name+'\n'+s)
html=(ROOT/'src/index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>\n'+(ROOT/'src/style.css').read_text()+'\n</style>')
html=html.replace('<script type="module" src="app.js"></script>','<script type="module">\n'+'\n'.join(parts).replace('</script','<\\/script')+'\n</script>')
(ROOT/'JOUER_ISOLATION.html').write_text(html)
print('Standalone',len(html.encode()),'bytes')
