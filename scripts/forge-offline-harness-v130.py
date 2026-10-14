"""Network-free packaging of the four local ES modules for DOM/Canvas QA.
Only the module bindings and CSS loading are adapted. Persistence uses an explicit
in-memory Storage adapter; this mode does not certify the browser's disk storage.
"""
import json
from pathlib import Path
import re


def build_offline_html(root: Path) -> str:
    paths=['src/forge-model-v130.js','src/forge-ui-v130.js','src/editor.js','src/forge-save-v62.js']
    factory=[]
    def imports(source,base):
        def replace(match):
            names,path=match.groups()
            resolved=(Path(base).parent/path).as_posix()
            while '/../' in resolved:
                parts=resolved.split('/');i=parts.index('..');parts[i-1:i+1]=[];resolved='/'.join(parts)
            resolved=resolved.replace('/./','/')
            return f'const {{{names}}}=require({json.dumps(resolved)});'
        return re.sub(r'import\s*\{([^}]+)\}\s*from\s*[\'"]([^\'"]+)[\'"];?',replace,source)
    for path in paths:
        source=(root/path).read_text()
        exported=re.findall(r'export\s+(?:const|function|class)\s+(\w+)',source)
        # editor.js re-exports a binding it already imports locally.
        for names in re.findall(r'export\s*\{([^}]+)\}\s*from\s*[\'"][^\'"]+[\'"];?',source):
            exported.extend(n.strip() for n in names.split(','))
        source=re.sub(r'export\s*\{[^}]+\}\s*from\s*[\'"][^\'"]+[\'"];?','',source)
        source=re.sub(r'\bexport\s+(?=const|function|class)','',source)
        source=imports(source,path).replace('import.meta.url',json.dumps('https://offline.invalid/'+path))
        factory.append(f'modules[{json.dumps(path)}]=(exports,require)=>{{\n{source}\nObject.assign(exports,{{{",".join(dict.fromkeys(exported))}}});\n}};')
    html=(root/'scripts/fixtures/forge-v130.html').read_text()
    script=re.search(r'<script type="module">(.*?)</script>',html,re.S).group(1)
    script=imports(script,'scripts/fixtures/forge-v130.html')
    bundle='(()=>{const modules={},cache={};function require(id){if(cache[id])return cache[id];const exports={};cache[id]=exports;modules[id](exports,require);return exports;}\n'+'\n'.join(factory)+'\n'+script+'\n})();'
    css=(root/'src/forge-editor-v130.css').read_text()
    html=re.sub(r'<script type="module">.*?</script>','',html,flags=re.S)
    html=html.replace('</head>','')
    return html+f'<style id="forge-styles-v130">{css}</style><script>{bundle}</script>'


def prepare_offline_page(page,html,records=None):
    page.goto('about:blank')
    records=records or {}
    page.evaluate('''records=>{
      const map=new Map(Object.entries(records));
      const storage={getItem:key=>map.get(String(key))??null,setItem:(key,value)=>map.set(String(key),String(value)),removeItem:key=>map.delete(String(key)),clear:()=>map.clear(),dump:()=>Object.fromEntries(map)};
      Object.defineProperty(window,'localStorage',{value:storage,configurable:true});
    }''',records)
    page.set_content(html,wait_until='load')
