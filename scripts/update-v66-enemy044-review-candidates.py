"""Refresh non-certified anchor/scale candidates for enemy-044 only."""
import hashlib, importlib.util, json, sys
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]; PROFILE="enemy-044-upp-vanguard"
sys.path.insert(0,str(ROOT/"scripts")); spec=importlib.util.spec_from_file_location("p044",ROOT/"scripts/process-v66-enemy-batch.py"); pipe=importlib.util.module_from_spec(spec); sys.modules[spec.name]=pipe; spec.loader.exec_module(pipe)
clips={}; hashes={}
for clip in ("idle","move","attack","death","reload"):
 path=ROOT/f"assets/openai/sprites/frames/v66/batch-003/{PROFILE}/{clip}.png"; hashes[clip]=hashlib.sha256(path.read_bytes()).hexdigest()
 with Image.open(path) as image: _,reports=pipe.split_source(image,clip,{"columns":4,"rows":2,"frameCount":8})
 clips[clip]={"sourcePath":path.relative_to(ROOT).as_posix(),"sourceSha256":hashes[clip],"frames":[{"frame":r["clipFrame"],"reviewed":False,"anchorCandidate":[round((r["sourceBounds"][0]+r["sourceBounds"][2])/2),r["sourceBounds"][3]],"sourceBounds":r["sourceBounds"],"note":"Bounding candidate only; must not be consumed as a reviewed physical root."} for r in reports]}
anchor={"schema":1,"batchId":"batch-003","coordinates":"nominal-source-cell","profiles":{PROFILE:{"profileId":PROFILE,"status":"pending-manual-physical-root-review","reviewer":None,"reviewedAt":None,"method":"Automatic extraction-bound candidates only; workspace visual inspection remained ACL-blocked.","reviewedPoseCount":0,"clips":clips}}}
scale={"schema":1,"batchId":"batch-003","coordinates":"nominal-source-cell","profiles":{PROFILE:{"profileId":PROFILE,"status":"pending-manual-rigid-landmark-review","reviewer":None,"reviewedAt":None,"baselineClip":"idle","sourceSha256ByClip":hashes,"sourceScaleByClip":{clip:1.0 for clip in hashes},"measurements":[],"note":"Source hashes updated for death r3. Neutral 1.0 placeholders are not reviewed factors and must not be merged or consumed."}}}
for name,doc in (("ANCHOR",anchor),("SCALE",scale)):(ROOT/f"docs/references/V66_WORKLOT_002_UPP_VANGUARD_{name}_REVIEW.json").write_text(json.dumps(doc,indent=2)+"\n",encoding="utf-8",newline="\n")
print(json.dumps({"profileId":PROFILE,"anchorCandidates":40,"reviewedAnchors":0,"scaleMeasurements":0,"mergeAuthorized":False}))
