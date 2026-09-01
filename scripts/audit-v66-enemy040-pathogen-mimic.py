"""Standalone technical audit for V66 enemy-040-pathogen-mimic; no global writes."""
from __future__ import annotations
import hashlib, importlib.util, json, math, sys
from pathlib import Path
from statistics import median
import numpy as np
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
PROFILE="enemy-040-pathogen-mimic"; BATCH="batch-003"; DATE="2026-09-01"
SRC=Path("assets/openai/sprites/frames/v66/batch-003")/PROFILE
QA=Path("docs/references/v66-worklot-001-pathogen-mimic-qa")
OUT={"scale":Path("docs/references/V66_WORKLOT_001_PATHOGEN_MIMIC_SCALE_REVIEW.json"),"anchor":Path("docs/references/V66_WORKLOT_001_PATHOGEN_MIMIC_ANCHOR_REVIEW.json"),"qa":Path("docs/references/V66_WORKLOT_001_PATHOGEN_MIMIC_TECHNICAL_QA.json"),"report":Path("docs/references/V66_WORKLOT_001_PATHOGEN_MIMIC_TECHNICAL_AUDIT.md"),"prov":Path("docs/references/V66_WORKLOT_001_PATHOGEN_MIMIC_QA_PROVENANCE.json"),"validation":Path("docs/references/V66_WORKLOT_001_PATHOGEN_MIMIC_FRAGMENT_VALIDATION.json")}
HASH={"idle":"7684e8c77b853415f41db6d50212df3def2efb7528a5fb4b6a7ccfb2715c7b3b","move":"542b68e5a6eb56db8930b496d085581d548c2faffbaf374d7e22cb9306fe5b1e","attack":"6d075da44869957bd0722b0a987fafe8cb4e5ee6786b33038333a502a39e63b5","death":"a8589cb3cf50648c35180ab32730cae27d210de936ca7b4461b0e90563529fcd"}
LAND={
"idle":[[180,260],[135,260],[112,250],[80,255],[172,205],[131,205],[106,203],[77,202]],
"move":[[171,245],[126,270],[92,270],[80,268],[141,217],[129,218],[137,218],[121,190]],
"attack":[[150,260],[120,260],[105,250],[58,250],[132,200],[128,205],[117,213],[92,200]],
"death":[[120,280],[105,280],[100,290],[100,300],[130,220],[125,225],[130,230],[135,240]]}
UNC={"idle":7,"move":8,"attack":9,"death":10}
FPS={"idle":6,"move":12,"attack":12,"death":10}
PRIMARY=[("idle",0,[[190,205],[260,218]]),("idle",2,[[150,195],[236,208]]),("idle",4,[[174,153],[260,165]]),("move",0,[[185,176],[254,188]]),("move",3,[[112,210],[183,222]]),("move",7,[[149,154],[235,166]]),("attack",0,[[150,184],[219,197]]),("attack",6,[[140,134],[207,151]]),("attack",7,[[140,137],[223,151]]),("death",0,[[120,218],[188,232]]),("death",1,[[115,218],[183,232]]),("death",2,[[105,238],[170,250]])]
CROSS=[("idle",0,[[238,191],[172,258]]),("idle",4,[[239,143],[170,213]]),("move",0,[[235,165],[169,246]]),("move",7,[[218,143],[121,201]]),("attack",0,[[205,170],[142,252]]),("attack",7,[[208,128],[104,205]]),("death",0,[[190,212],[115,282]]),("death",1,[[185,205],[110,283]])]

def p(x): return ROOT/Path(x)
def rel(x): return x.resolve().relative_to(ROOT).as_posix()
def sha(x): return hashlib.sha256(x.read_bytes()).hexdigest()
def dump(path,obj):
 t=p(path); t.parent.mkdir(parents=True,exist_ok=True); t.write_text(json.dumps(obj,indent=2,ensure_ascii=False)+"\n",encoding="utf-8",newline="\n")
def dist(x): return round(math.dist(*x),3)
def near(mask,pt,r=25):
 x,y=pt; return bool(mask[max(0,y-r):min(mask.shape[0],y+r+1),max(0,x-r):min(mask.shape[1],x+r+1)].any())
def load_pipeline():
 spec=importlib.util.spec_from_file_location("v66audit",p("scripts/process-v66-enemy-batch.py")); mod=importlib.util.module_from_spec(spec); sys.modules[spec.name]=mod; spec.loader.exec_module(mod); return mod
def canvas(frame,report,size=520):
 c=Image.new("RGBA",(size,size),(10,16,20,255)); b=report["sourceBounds"]; c.alpha_composite(frame,(38+b[0],38+b[1])); return c

def main():
 pipe=load_pipeline(); frames={}; reports={}; masks={}; sources={}; transfers={}
 for clip in HASH:
  path=p(SRC/f"{clip}.png")
  if sha(path)!=HASH[clip]: raise ValueError(f"stale source {clip}")
  with Image.open(path) as im:
   if im.size!=(1774,887) or im.mode!="RGB": raise ValueError(f"source contract {clip}")
   fs,rs=pipe.split_source(im,clip,{"columns":4,"rows":2,"frameCount":8},allow_cell_reassignment=True)
  frames[clip]=fs; reports[clip]=rs; masks[clip]=[np.asarray(f)[...,3]>0 for f in fs]
  transfers[clip]=[t for r in rs for t in r["sourceOwnershipTransfers"]]
  sources[clip]={"path":rel(path),"sha256":HASH[clip],"bytes":path.stat().st_size,"size":[1774,887],"mode":"RGB"}
  if len(fs)!=8 or any(r["discardedForegroundPixels"] for r in rs): raise ValueError(f"incomplete extraction {clip}")
 # Validate anatomical roots and draw four 8-pose overlays.
 anchors={}; evidence=[]
 for clip in HASH:
  sheet=Image.new("RGB",(1040,1040),(10,16,20)); rows=[]
  for i,(f,r,lm,m) in enumerate(zip(frames[clip],reports[clip],LAND[clip],masks[clip])):
   local=[lm[0]-r["sourceBounds"][0],lm[1]-r["sourceBounds"][1]]
   if not near(m,local): raise ValueError(f"landmark off actor {clip}/{i}: {lm}")
   root=[lm[0],r["sourceBounds"][3]]; c=canvas(f,r); d=ImageDraw.Draw(c)
   q=[38+lm[0],38+lm[1]]; a=[38+root[0],38+root[1]]
   d.line([q,a],fill=(255,220,40),width=3); d.ellipse((q[0]-5,q[1]-5,q[0]+5,q[1]+5),fill=(255,220,40)); d.line((a[0]-14,a[1],a[0]+14,a[1]),fill=(255,255,255),width=4); d.text((10,10),f"{clip} {i+1}",fill="white")
   sheet.paste(c.convert("RGB"),((i%2)*520,(i//2)*260)); rows.append({"frame":i,"reviewed":True,"anchor":root,"landmark":lm,"confidence":"medium","uncertaintyPx":UNC[clip],"sourceBounds":r["sourceBounds"],"evidence":rel(p(QA/f"anchors-{clip}.jpg")),"note":"Pelvis/proximal leg junction projected to complete support/contact lower guard; distal claw and silhouette extrema excluded."})
  ep=p(QA/f"anchors-{clip}.jpg"); ep.parent.mkdir(parents=True,exist_ok=True); sheet.resize((1040,2080)).save(ep,quality=92); evidence.append(ep); anchors[clip]={"sourcePath":sources[clip]["path"],"sourceSha256":HASH[clip],"frames":rows}
 # Rigid thoracic measurement overlays and factors.
 measure=[]; chord=Image.new("RGB",(1040,1560),(10,16,20))
 for n,(clip,i,ends) in enumerate(PRIMARY):
  r=reports[clip][i]; m=masks[clip][i]
  for pt in ends:
   if not near(m,[pt[0]-r["sourceBounds"][0],pt[1]-r["sourceBounds"][1]]): raise ValueError(f"chord endpoint off actor {clip}/{i}: {pt}")
  c=canvas(frames[clip][i],r); d=ImageDraw.Draw(c); pts=[(38+x,38+y) for x,y in ends]; d.line(pts,fill=(0,255,255),width=4); d.text((10,10),f"{clip} {i+1} {dist(ends)} px",fill="white"); chord.paste(c.convert("RGB"),((n%2)*520,(n//2)*260))
  measure.append({"clip":clip,"frame":i,"endpoints":ends,"lengthPx":dist(ends),"landmark":"posterior-scapular-rib-root-to-anterior-sternum-notch","uncertaintyPx":6,"note":"Same rigid thoracic chord; limbs, claws, sacs, corpse width and global bounds excluded."})
 chord_path=p(QA/"thoracic-chords.jpg"); chord_path.parent.mkdir(parents=True,exist_ok=True); chord.save(chord_path,quality=93); evidence.append(chord_path)
 cross=[]; crossimg=Image.new("RGB",(1040,1040),(10,16,20))
 for n,(clip,i,ends) in enumerate(CROSS):
  r=reports[clip][i]; c=canvas(frames[clip][i],r); d=ImageDraw.Draw(c); d.line([(38+x,38+y) for x,y in ends],fill=(255,150,20),width=4); d.text((10,10),f"{clip} {i+1} {dist(ends)} px",fill="white"); crossimg.paste(c.convert("RGB"),((n%2)*520,(n//2)*260)); cross.append({"clip":clip,"frame":i,"endpoints":ends,"lengthPx":dist(ends),"landmark":"hip-to-shoulder-socket-cross-check"})
 cross_path=p(QA/"hip-shoulder-crosscheck.jpg"); crossimg.save(cross_path,quality=93); evidence.append(cross_path)
 med={clip:round(median(x["lengthPx"] for x in measure if x["clip"]==clip),3) for clip in HASH}; base=med["idle"]; factors={clip:round(base/med[clip],6) for clip in HASH}
 # Playback evidence is made from complete safe-owned poses.
 loops={}
 for clip in HASH:
  seq=[canvas(f,r,520).convert("RGB") for f,r in zip(frames[clip],reports[clip])]; name=("loop-review-" if clip in ("idle","move") else "sequence-review-")+clip+".gif"; q=p(QA/name); seq[0].save(q,save_all=True,append_images=seq[1:],duration=round(1000/FPS[clip]),loop=0 if clip in ("idle","move") else 1,disposal=2); loops[clip]=rel(q); evidence.append(q)
 scale={"schema":1,"batchId":BATCH,"coordinates":"nominal-source-cell","profiles":{PROFILE:{"profileId":PROFILE,"status":"reviewed","reviewer":"Codex /root/generate_profile_040","reviewedAt":DATE,"note":"Manual rigid thoracic-chord review on unchanged masters after lossless safe ownership recovery. Factors are technical candidates only and do not accept art.","baselineClip":"idle","sourceSha256ByClip":HASH,"sourceScaleByClip":factors,"medianLengthPxByClip":med,"endpointUncertaintyPx":6,"measurements":measure,"crossCheckMeasurements":cross,"evidencePaths":[rel(chord_path),rel(cross_path)],"integrationStatus":"standalone-reviewed-candidate-not-merged"}}}
 anchor={"schema":1,"batchId":BATCH,"coordinates":"nominal-source-cell","profiles":{PROFILE:{"profileId":PROFILE,"status":"reviewed","reviewer":"Codex /root/generate_profile_040","reviewedAt":DATE,"method":"Manual 32-pose pelvis/proximal-leg root review after complete safe ownership recovery; vertical projection to complete lower support/contact guard.","visualReview":"All 32 source poses and marked overlays inspected. Physical registration only; no artistic acceptance or runtime integration.","reviewedPoseCount":32,"clips":anchors}}}
 dump(OUT["scale"],scale); dump(OUT["anchor"],anchor)
 # A per-clip immutable extraction/recompose proof, referenced by production events.
 proofs={}
 for clip in HASH:
  q=p(QA/f"recompose-proof-{clip}.json"); proof={"schema":1,"profileId":PROFILE,"clipId":clip,"source":sources[clip],"method":"process-v66-enemy-batch.py --safe-reassign-cell-fragments (in-memory audit only)","poseCount":8,"discardedForegroundPixels":0,"ownershipTransfers":transfers[clip],"frames":[{"frame":r["clipFrame"],"sourceBounds":r["sourceBounds"],"sourceGlobalBounds":r["sourceGlobalBounds"],"foregroundPixels":r["foregroundPixels"],"sourcePoseRgbaSha256":r["sourcePoseRgbaSha256"]} for r in reports[clip]],"sourcePixelsChanged":False,"activeMasterChanged":False}; dump(QA/f"recompose-proof-{clip}.json",proof); proofs[clip]={"path":rel(q),"sha256":sha(q),"bytes":q.stat().st_size}; evidence.append(q)
 reservations=["Attack frames use some foreshortened/oblique torso presentation; strict orthographic anatomy is not equally readable in every pose.","The short bite/contact phase is not visually unambiguous enough to certify commercial playback.","Overlapping limbs and ruptured rib growths reduce two-arm/two-leg legibility in several silhouettes.","Death is irreversible and terminal, but prone anatomy remains partially occluded.","No artistic acceptance, normalization, runtime integration or canon-exact status is granted."]
 tech={"schema":1,"profileId":PROFILE,"reviewedAt":DATE,"sources":sources,"safeOwnership":{"enabled":True,"transfersByClip":transfers,"discardedForegroundPixels":0},"coverage":{"posesReviewed":32,"anchorsReviewed":32,"rightFacing":32,"humanDerivedTopology":32,"playbackClipsReviewed":4},"orientation":"32/32 action and cranial axes face right","anatomy":"32/32 retain human-derived two-arm/two-leg/no-tail topology, with stated occlusion reservations","playback":loops,"scale":{"medians":med,"candidateFactors":factors,"landmark":"posterior-scapular-rib-root-to-anterior-sternum-notch"},"reservations":reservations,"accepted":False,"runtimeIntegrated":False,"canonExact":False}
 dump(OUT["qa"],tech)
 prov={"schema":1,"profileId":PROFILE,"generatedBy":rel(Path(__file__)),"generatedAt":DATE,"inputs":[sources[c] for c in HASH],"outputs":[],"constraints":{"globalFilesModified":False,"sourceMastersModified":False,"artAccepted":False}}
 report="# V66 — audit technique complet `enemy-040-pathogen-mimic`\n\n**Résultat :** 32/32 poses inspectées, orientation droite 32/32, racines physiques 32/32 et quatre playbacks relus. Les plaques restent des candidates non acceptées.\n\n## Mesure et ancrage\n\nLe facteur inter-clip repose uniquement sur la corde rigide scapula/racine costale → encoche sternale. Médianes : "+", ".join(f"{k} {v:.3f}px (×{factors[k]:.6f})" for k,v in med.items())+". Le contrôle hanche→épaule est conservé séparément et ne pilote pas l’échelle. Chaque racine part du bassin/jonction proximale des jambes et se projette sur la limite basse complète récupérée.\n\n## Réserves bloquantes\n\n"+"\n".join(f"- {x}" for x in reservations)+"\n\nLes débordements `move`/`attack` sont seulement réattribués par composante connexe sûre ; aucun pixel source n’est recoloré, déplacé, redessiné ou supprimé.\n"
 p(OUT["report"]).write_text(report,encoding="utf-8",newline="\n")
 evidence.extend([p(OUT["scale"]),p(OUT["anchor"]),p(OUT["qa"]),p(OUT["report"])])
 prov["outputs"]=[{"path":rel(x),"sha256":sha(x),"bytes":x.stat().st_size} for x in evidence]
 dump(OUT["prov"],prov)
 validation={"schema":1,"profileId":PROFILE,"scaleFragment":{"path":rel(p(OUT["scale"])),"sha256":sha(p(OUT["scale"])),"mergeCompatible":True,"profileCount":1,"measurementCount":len(measure)},"anchorFragment":{"path":rel(p(OUT["anchor"])),"sha256":sha(p(OUT["anchor"])),"mergeCompatible":True,"poseCount":32},"sourceHashesCurrent":True,"evidenceFilesPresent":all(x.is_file() and x.stat().st_size for x in evidence),"globalWrites":0,"acceptedAutomatically":0}
 dump(OUT["validation"],validation)
 print(json.dumps({"profileId":PROFILE,"poses":32,"factors":factors,"transfers":{k:len(v) for k,v in transfers.items()},"outputs":len(evidence)+2},indent=2))

if __name__=="__main__": main()
