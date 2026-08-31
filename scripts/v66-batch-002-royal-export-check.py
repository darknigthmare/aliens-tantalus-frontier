"""Audit only the seven authored candidate atlases/GIF contracts; never accept them."""
from pathlib import Path
import json,hashlib,importlib.util,sys
from PIL import Image,ImageSequence
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"scripts"))
spec=importlib.util.spec_from_file_location("royal_check_normalizer",ROOT/"scripts/process-v66-enemy-batch.py")
pipeline=importlib.util.module_from_spec(spec);spec.loader.exec_module(pipeline)
queue=json.loads((ROOT/"docs/references/V66_ENEMY_BATCH_QUEUE.json").read_text(encoding="utf8"))
ids={"enemy-007-praetorian","enemy-008-queen","enemy-009-crusher","enemy-010-spitter","enemy-011-lurker","enemy-012-carrier","enemy-013-ravager"}
result={"schema":1,"batchId":"batch-002","scope":"Candidate exports only, not visual acceptance or runtime verification.","profiles":[],"acceptedAutomatically":0}
for job in [j for j in queue["jobs"] if j["profileId"] in ids]:
 meta=pipeline.check_profile(job,remove_enclosed_magenta_matte=True,remove_enclosed_magenta_aa_fringe=True)
 assert meta["acceptanceStatus"]=="pending-visual-review" and meta["runtimeIntegrated"] is False and meta["canonExact"] is False
 clips=[]
 for clip in job["clips"]:
  with Image.open(ROOT/clip["previewPath"]) as im:
   durations=[f.info.get("duration") for f in ImageSequence.Iterator(im)]
   expected=max(10,round(1000/clip["fps"]/10)*10)
   assert im.n_frames==8 and all(t==expected for t in durations)
   assert (im.info.get("loop")==0) if clip["loop"] else ("loop" not in im.info)
  clips.append({"id":clip["id"],"poses":8,"fpsContract":clip["fps"],"gifFrameDurationMs":expected,"loop":clip["loop"],"webp":clip["normalizedPath"],"gif":clip["previewPath"]})
 with Image.open(ROOT/job["previewPath"]) as im:
  assert im.n_frames==meta["frameCount"] and im.info.get("loop")==0
 record={"profileId":job["profileId"],"poses":meta["frameCount"],"atlas":meta["normalized"],"atlasSha256":meta["normalizedSha256"],"metadata":job["metadataPath"],"metadataSha256":hashlib.sha256((ROOT/job["metadataPath"]).read_bytes()).hexdigest(),"normalizationOptions":meta["normalizationOptions"],"physicalAnchorReview":meta["physicalAnchorReview"],"sourceScaleByClip":meta["sourceScaleByClip"],"strictCellFindings":meta["validation"]["findings"],"clips":clips,"acceptanceStatus":meta["acceptanceStatus"],"sourceHashesVerified":len(meta["sources"])}
 result["profiles"].append(record)
 print(job["profileId"]+" checked",flush=True)
result["totals"]={"atlasCount":len(result["profiles"]),"clipCount":sum(len(p["clips"]) for p in result["profiles"]),"poseCount":sum(p["poses"] for p in result["profiles"]),"gifCount":sum(len(p["clips"])+1 for p in result["profiles"]),"webpCount":sum(len(p["clips"])+1 for p in result["profiles"]),"metadataCount":len(result["profiles"])}
(ROOT/"docs/references/V66_BATCH_002_ATLAS_A_QA.json").write_text(json.dumps(result,indent=2)+"\n",encoding="utf8")
print(json.dumps(result["totals"]))
