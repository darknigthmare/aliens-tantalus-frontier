#!/usr/bin/env python3
"""Package unchanged Covenant PNG originals, a local catalogue and coverage records.

Generated artwork is never cropped, resized, recompressed or rewritten.
The optional contact sheet is a labelled QA derivative.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import argparse, hashlib, json, shutil, zipfile

BASE = "assets/openai/sprites/alien-covenant-v011"
NAMES = {
    "daniels":"Daniels · terrain", "daniels-work":"Daniels · vaisseau",
    "daniels-eva":"Daniels · combinaison souple", "walter":"Walter · vaisseau",
    "walter-field":"Walter · terrain", "walter-injured":"Walter · main gauche absente",
    "david":"David · manteau", "david-young":"David · prologue",
    "tennessee":"Tennessee", "tennessee-eva":"Tennessee · Big Yellow",
    "oram":"Oram · pont", "oram-field":"Oram · terrain", "karine-medical":"Karine · séquence médicale", "lope":"Lope", "faris":"Faris", "karine":"Karine",
    "ricks":"Ricks", "upworth":"Upworth", "rosenthal":"Rosenthal", "hallett":"Hallett",
    "ledward":"Ledward", "ankor":"Ankor", "cole":"Cole", "weyland":"Peter Weyland",
    "branson-record":"Jacob Branson · enregistrement",
    "neomorph":"Néomorphe · pose neutre", "neomorph-attack":"Néomorphe · attaque",
    "facehugger":"Facehugger · au sol", "facehugger-attack":"Facehugger · bond",
    "prop-evasuit":"Combinaison EVA souple", "prop-evahelmet":"Casque EVA souple",
    "prop-evasuit-heavy":"Combinaison Big Yellow", "prop-evahelmet-heavy":"Casque Big Yellow",
    "prop-flute":"Flûte de David", "prop-lander":"Atterrisseur",
    "prop-egg":"Œuf", "prop-cryopod":"Caisson ouvert de l’équipage",
    "prop-cryopod-closed-crew":"Caisson fermé · dessin de fabrication",
    "bio-facehugger-embryo":"Capsule d’embryon", "prop-cargoLifter":"Cargo Lifter",
    "prop-urn":"Urne des Ingénieurs", "prop-flare":"Fusée P15 · accessoire fermé",
    "prop-drawing-ammonite":"Dessin · ammonite", "prop-drawing-arthropod":"Dessin · arthropode",
    "prop-terraformer":"Camion de terraformation · adaptation v122",
    "prop-piano":"Piano du prologue", "prop-table-e1027":"Table E1027",
    "prop-chair-bugatti":"Trône Bugatti · modèle approchant", "prop-teaset":"Service à thé Form 2000"
}

HTML = r"""<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Alien: Covenant · Catalogue des sprites 0.11</title>
<style>
:root{color-scheme:dark;--bg:#0d1417;--ink:#ecf0df;--muted:#a6b3ab;--line:#35423c;--accent:#b9d8a5;--surface:#172023;--imagebg:#161d21;--tile:290px}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,sans-serif}
header,main,footer{max-width:1600px;margin:auto;padding:28px 36px}
header{padding-top:48px;border-bottom:1px solid var(--line)}.eyebrow{color:var(--accent);font-size:12px;letter-spacing:.24em;text-transform:uppercase}
h1{font-weight:500;letter-spacing:.02em;font-size:clamp(30px,4vw,60px);margin:8px 0}p{max-width:80ch}
.sub{color:var(--muted);margin:0}.stats{display:flex;flex-wrap:wrap;gap:18px;margin-top:24px}.stats span{border:1px solid var(--line);padding:9px 14px;border-radius:4px}
nav{display:flex;flex-wrap:wrap;align-items:end;gap:14px;margin:6px 0 24px}label{font-size:12px;color:var(--muted);display:grid;gap:6px}
input,select,button{font:inherit;color:var(--ink);background:var(--surface);border:1px solid var(--line);border-radius:4px;padding:10px 12px}input[type=search]{min-width:260px}input[type=range]{width:150px;accent-color:var(--accent)}
button,a{cursor:pointer}a{color:var(--accent)}button:hover{border-color:var(--accent)}:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
#results{color:var(--muted);margin-bottom:18px;font-size:14px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:18px}
.card{border:1px solid var(--line);border-radius:5px;overflow:hidden;background:var(--surface)}.view{border:0;border-radius:0;padding:16px;display:block;width:100%;height:var(--tile);background:var(--imagebg);cursor:zoom-in}
.view img{width:100%;height:100%;object-fit:contain}.info{padding:16px}.info h2{font-size:16px;font-weight:500;margin:0 0 8px}.small{font-size:12px;color:var(--muted)}.tags{display:flex;gap:6px;flex-wrap:wrap;margin:9px 0}.tag{font-size:11px;border:1px solid var(--line);border-radius:3px;padding:3px 6px}.tag.catalogue{color:#e3bd8c}
.card a{font-size:13px}.empty{padding:50px 0;color:var(--muted)}
dialog{width:min(1400px,95vw);max-height:94vh;padding:0;color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:5px}
dialog::backdrop{background:#000b}.modalhead{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid var(--line)}.modalhead h2{font-size:20px;margin:0}
.modalgrid{display:grid;grid-template-columns:minmax(0,1fr) 340px}.fullimage{height:min(76vh,900px);padding:28px;background:var(--imagebg);display:flex;align-items:center;justify-content:center;overflow:auto}.fullimage img{max-width:100%;max-height:100%;object-fit:contain}
.details{padding:22px;overflow-wrap:anywhere}.details h3{font-size:14px;margin:22px 0 8px}.details p,.details li{font-size:13px}.details ul{padding-left:18px}.details a{display:inline-block;margin:5px 0}.notice{border-left:3px solid var(--accent);padding-left:14px;color:var(--muted);font-size:14px}
body[data-bg=light]{--imagebg:#e8ece6}body[data-bg=checker] .view,body[data-bg=checker] .fullimage{background-color:#cad0c9;background-image:linear-gradient(45deg,#aeb6ad 25%,transparent 25%),linear-gradient(-45deg,#aeb6ad 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#aeb6ad 75%),linear-gradient(-45deg,transparent 75%,#aeb6ad 75%);background-size:24px 24px;background-position:0 0,0 12px,12px -12px,-12px 0}
footer{border-top:1px solid var(--line);font-size:13px;color:var(--muted);padding-bottom:50px}
@media(max-width:800px){header,main,footer{padding:24px 18px}.modalgrid{grid-template-columns:1fr}.fullimage{height:55vh}.details{border-top:1px solid var(--line)}input[type=search]{min-width:0;width:100%}}
</style></head><body data-bg="dark">
<header><div class="eyebrow">Aliens Tantalus Project · DLC</div><h1>ALIEN: COVENANT</h1>
<p class="sub">Catalogue des sprites · version 0.11</p><div class="stats" id="stats"></div>
<p class="notice">Reconstitutions guidées par les références du film. Les vues masquées, détails fins et poses adaptées ne sont pas certifiés identiques à 1:1. Les animations non couvertes et les éléments manquants sont décrits dans le rapport de couverture.</p>
<p><a href="README_FR.md">Lire les limites et le contenu</a> · <a href="coverage.json">Couverture détaillée</a> · <a href="manifest.json">Références et prompts</a></p></header>
<main><nav aria-label="Filtres du catalogue">
<label>Rechercher<input id="query" type="search" placeholder="Daniels, caisson, piano…" autocomplete="off"></label>
<label>Catégorie<select id="category"><option value="">Toutes les catégories</option><option value="character">Personnages</option><option value="creature">Créatures</option><option value="prop">Accessoires</option><option value="vehicle">Véhicules</option><option value="biology">Spécimens</option></select></label>
<label>Utilisation<select id="use"><option value="">Tous les PNG</option><option value="runtime">Admis dans le rendu</option><option value="catalogue">Catalogue uniquement</option></select></label>
<label>Fond d’inspection<select id="bg"><option value="dark">Sombre</option><option value="light">Clair</option><option value="checker">Damier</option></select></label>
<label>Taille des aperçus<input id="size" type="range" min="200" max="600" value="290"></label>
</nav><div id="results" role="status"></div><section id="grid" class="grid" aria-label="Sprites"></section></main>
<dialog id="detail"><div class="modalhead"><h2 id="detailTitle"></h2><button id="close" type="button" aria-label="Fermer l’aperçu">Fermer</button></div><div class="modalgrid"><div class="fullimage"><img id="full" alt=""></div><div class="details" id="description"></div></div></dialog>
<footer>Les PNG du dossier <strong>sprites/</strong> conservent leurs octets d’origine. Les aperçus sont affichés à l’échelle ; aucun sprite source n’a été recadré ni recompressé. <a href="SHA256SUMS.txt">Empreintes SHA-256</a> · <a href="QA.json">Contrôle technique</a></footer>
<script id="catalogue-data" type="application/json">__DATA__</script>
<script>
"use strict";
const data=JSON.parse(document.getElementById("catalogue-data").textContent), rows=data.assets;
const el=id=>document.getElementById(id), cats={character:"Personnage",creature:"Créature",prop:"Accessoire",vehicle:"Véhicule",biology:"Spécimen"};
function node(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n}
function link(text,href){const a=node("a",text);a.href=href;return a}
function refs(row){const all=[...(row.inputReferences||[]),...(row.sourcePages||[]).map(source=>({source}))];const seen=new Set();return all.map(r=>typeof r==="string"?r:r.source||r.source_page||r.page||r.url).filter(u=>typeof u==="string"&&/^https?:\/\//.test(u)&&!seen.has(u)&&seen.add(u))}
function show(row){
 el("detailTitle").textContent=row.name;el("full").src=row.file;el("full").alt=row.name;const d=el("description");d.replaceChildren();
 d.append(node("p",row.runtime?"Admis dans le rendu pour les états déclarés.":"Catalogue uniquement : aucun remplacement automatique en jeu.","notice"));
 d.append(node("p",row.id+" · "+row.width+" × "+row.height+" px","small"));
 const a=link("Télécharger le PNG original",row.file);a.download=row.id+".png";d.append(a);
 d.append(node("h3","Portée"));d.append(node("p",(row.availableStates||[]).join(", ")+" · fidélité 1:1 non certifiée"));
 if(row.rooms?.length)d.append(node("p","Salles : "+row.rooms.join(", ")));
 d.append(node("h3","Limites documentées"));const ul=node("ul");for(const s of row.limitations||[])ul.append(node("li",s));d.append(ul);
 d.append(node("h3","Références"));for(const [i,url] of refs(row).entries()){const p=node("p");const a=link("Référence "+(i+1)+" · "+new URL(url).hostname,url);a.target="_blank";a.rel="noopener noreferrer";p.append(a);d.append(p);}
 if(!refs(row).length)d.append(node("p","Consulter le manifeste complet."));
 el("detail").showModal();
}
function render(){
 const q=el("query").value.trim().toLocaleLowerCase("fr"),c=el("category").value,u=el("use").value;
 const chosen=rows.filter(r=>(!q||(r.id+" "+r.name).toLocaleLowerCase("fr").includes(q))&&(!c||r.category===c)&&(!u||(u==="runtime")===r.runtime));
 const grid=el("grid");grid.replaceChildren();el("results").textContent=chosen.length+" sprite"+(chosen.length>1?"s":"")+" affiché"+(chosen.length>1?"s":"")+" sur "+rows.length;
 for(const r of chosen){const card=node("article",undefined,"card"),button=node("button",undefined,"view");button.type="button";button.setAttribute("aria-label","Agrandir "+r.name);const im=node("img");im.src=r.file;im.alt=r.name;im.loading="lazy";button.append(im);button.onclick=()=>show(r);const info=node("div",undefined,"info");info.append(node("h2",r.name),node("div",r.id,"small"));const tags=node("div",undefined,"tags");tags.append(node("span",cats[r.category]||"Accessoire","tag"),node("span",r.runtime?"Admis dans le rendu":"Catalogue uniquement","tag"+(r.runtime?"":" catalogue")));info.append(tags,node("div",r.width+" × "+r.height+" px · "+(r.bytes/1048576).toFixed(2)+" Mio","small"));const a=link("PNG original",r.file);a.download=r.id+".png";info.append(a);card.append(button,info);grid.append(card)}
 if(!chosen.length)grid.append(node("p","Aucun sprite ne correspond à ces filtres.","empty"));
}
for(const id of ["query","category","use"])el(id).addEventListener("input",render);
el("bg").onchange=()=>document.body.dataset.bg=el("bg").value;
el("size").oninput=()=>document.documentElement.style.setProperty("--tile",el("size").value+"px");
el("close").onclick=()=>el("detail").close();
el("detail").addEventListener("click",event=>{if(event.target===el("detail"))el("detail").close()});
for(const text of [rows.length+" PNG originaux",rows.filter(r=>r.category==="character").length+" profils humains",rows.filter(r=>r.runtime).length+" admis dans le rendu",rows.filter(r=>!r.runtime).length+" au catalogue"])el("stats").append(node("span",text));
render();
</script></body></html>"""

def alpha_qa(path, entry):
    raw = path.read_bytes()
    git_sha = hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()
    if git_sha != entry["gitBlobSha"]:
        raise ValueError("Original blob mismatch: " + entry["id"])
    with Image.open(path) as original:
        if "A" not in original.getbands():
            raise ValueError("Not RGBA: " + entry["id"])
        image = original.convert("RGBA")
        alpha = image.getchannel("A")
        histogram = alpha.histogram()
        bounds = alpha.point(lambda v:255 if v >= 32 else 0).getbbox()
        edge = 0
        for box in [(0,0,image.width,1),(0,image.height-1,image.width,image.height),(0,0,1,image.height),(image.width-1,0,image.width,image.height)]:
            edge += sum(alpha.crop(box).histogram()[17:])
        if not bounds or not histogram[0] or edge:
            raise ValueError("Transparency/frame check failed: " + entry["id"])
        return {"id":entry["id"],"gitBlobSha":git_sha,"sha256":hashlib.sha256(raw).hexdigest(),
                "bytes":len(raw),"width":image.width,"height":image.height,
                "alphaExtrema":list(alpha.getextrema()),"alphaZero":histogram[0],
                "edgeAlphaAbove16":edge,"bboxAbove32":list(bounds),"pass":True}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--root",type=Path,default=Path(__file__).resolve().parents[1])
    p.add_argument("--output",type=Path,required=True)
    p.add_argument("--ci-run-url",default="")
    p.add_argument("--ci-conclusion",default="not-recorded")
    args=p.parse_args()
    source=args.root/BASE
    manifest=json.loads((source/"manifest.json").read_text())
    provenance=json.loads((args.root/"docs/covenant/PROVENANCE_V011.json").read_text())
    runtime=json.loads((args.root/"dlc/covenant/sprites-v011.json").read_text())
    runtime_ids={a["id"] for a in runtime["assets"]}
    dest=args.output/"ALIEN_COVENANT_SPRITES_V0.11"
    dest.mkdir(parents=True,exist_ok=True)
    (dest/"sprites").mkdir(exist_ok=True)
    qa=[]; catalogue=[]; hashes=[]
    for entry in manifest["assets"]:
        src=source/(entry["id"]+".png")
        record=alpha_qa(src,entry);qa.append(record)
        filename="sprites/"+entry["id"]+".png"
        shutil.copyfile(src,dest/filename)
        hashes.append(record["sha256"]+"  "+filename)
        catalogue.append({**entry,**record,"name":NAMES.get(entry["id"],entry.get("label",entry["id"])),
                          "file":filename,"runtime":entry["id"] in runtime_ids,
                          "category":entry.get("category","prop")})
    catalogue.sort(key=lambda row: ({"character":0,"creature":1,"prop":2,"vehicle":3,"biology":4}.get(row["category"],5),row["id"]))
    if len(catalogue)!=len({a["id"] for a in catalogue}):
        raise ValueError("Duplicate sprites")
    (dest/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
    coverage=provenance.get("coverage",provenance)
    (dest/"coverage.json").write_text(json.dumps(coverage,ensure_ascii=False,indent=2)+"\n")
    validation=dict(provenance.get("validation",{}))
    if args.ci_run_url:
        validation["githubActions"]={"url":args.ci_run_url,"conclusion":args.ci_conclusion}
    (dest/"QA.json").write_text(json.dumps({"pngChecks":qa,"validation":validation},ensure_ascii=False,indent=2)+"\n")
    (dest/"SHA256SUMS.txt").write_text("\n".join(hashes)+"\n")
    readme=(args.root/"docs/covenant/SPRITES_V011_STATUS.md").read_text()
    if args.ci_run_url:
        readme+="\n## Vérification GitHub Actions du lot livré\n\nRésultat : "+args.ci_conclusion+".\n\nJournal : "+args.ci_run_url+"\n"
    (dest/"README_FR.md").write_text(readme)
    data=json.dumps({"assets":catalogue},ensure_ascii=False).replace("<","\\u003c")
    (dest/"index.html").write_text(HTML.replace("__DATA__",data))
    cols=6;cell_w,cell_h=260,340
    rows=(len(catalogue)+cols-1)//cols
    sheet=Image.new("RGB",(cols*cell_w,rows*cell_h),"#131b20")
    draw=ImageDraw.Draw(sheet)
    try: font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",12)
    except OSError: font=ImageFont.load_default()
    for i,entry in enumerate(catalogue):
        with Image.open(dest/entry["file"]) as original:
            thumbnail=original.convert("RGBA");thumbnail.thumbnail((cell_w-24,cell_h-56))
        x=(i%cols)*cell_w+(cell_w-thumbnail.width)//2
        y=(i//cols)*cell_h+12
        sheet.paste(thumbnail,(x,y),thumbnail)
        label=entry["name"]
        if len(label)>34: label=label[:31]+"…"
        draw.text(((i%cols)*cell_w+12,(i//cols)*cell_h+cell_h-39),label,fill="#e7eddf",font=font)
        draw.text(((i%cols)*cell_w+12,(i//cols)*cell_h+cell_h-20),entry["id"],fill="#92a49a",font=font)
    sheet.save(dest/"APERCU.jpg",quality=88)
    output=args.output/"ALIEN_COVENANT_SPRITES_V0.11.zip"
    with zipfile.ZipFile(output,"w",compression=zipfile.ZIP_DEFLATED,compresslevel=4) as z:
        for file in sorted(dest.rglob("*")):
            if file.is_file():z.write(file,arcname=str(file.relative_to(args.output)))
    with zipfile.ZipFile(output) as z:
        assert z.testzip() is None
        for entry,record in zip(manifest["assets"],qa):
            data=z.read("ALIEN_COVENANT_SPRITES_V0.11/sprites/"+entry["id"]+".png")
            assert hashlib.sha256(data).hexdigest()==record["sha256"]
    print(json.dumps({"zip":str(output),"bytes":output.stat().st_size,
                      "sha256":hashlib.sha256(output.read_bytes()).hexdigest(),
                      "pngCount":len(qa),"runtimeCount":len(runtime_ids),
                      "catalogueOnlyCount":len(qa)-len(runtime_ids),
                      "originalPngBytes":sum(r["bytes"] for r in qa),
                      "allOriginalHashesVerified":True}))

if __name__=="__main__":
    main()
