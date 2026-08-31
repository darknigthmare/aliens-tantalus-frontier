"""Build source-anchor evidence from explicit manual measurements, never infer x roots."""
from pathlib import Path
import json,hashlib,argparse
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument("--confirm-reviewed",action="store_true",help="Only after a human/agent has individually inspected all generated marked overlays")
args=parser.parse_args()
prior_path=ROOT/"docs/references/V66_BATCH_002_ANCHORS_A.json"
prior=json.loads(prior_path.read_text(encoding="utf8")) if args.confirm_reviewed else None
data=json.loads((ROOT/"docs/references/V66_BATCH_002_MANUAL_ANCHORS_A.json").read_text(encoding="utf8"))
queue=json.loads((ROOT/"docs/references/V66_ENEMY_BATCH_QUEUE.json").read_text(encoding="utf8"))
fragment={"schema":1,"batchId":"batch-002","coordinates":"nominal-source-cell","reviewScope":"Manual physical registration for Crusher and Lurker candidate sources only. No runtime acceptance, scale acceptance or fidelity 1:1 certification.","profiles":{}}
for profile,manual in data.items():
 job=next(j for j in queue["jobs"] if j["profileId"]==profile)
 out=ROOT/"docs/references/v66-batch-002-royal-qa"/profile
 bounds=json.loads((out/"extraction-bounds.json").read_text(encoding="utf8"))
 review={"status":"pending-overlay-review","reviewer":"Codex complete_royal","reviewedAt":"2026-08-31","reviewedPoseCount":0,"evidencePaths":[],"visualReview":"Source boards manually inspected. Marked source overlays await final review.","method":manual["method"],"clips":{}}
 for clip in job["clips"]:
  source=ROOT/clip["sourcePath"]
  source_hash=hashlib.sha256(source.read_bytes()).hexdigest()
  if args.confirm_reviewed:
   old=prior["profiles"][profile]["clips"][clip["id"]]
   assert old["sourceSha256"]==source_hash, "Source changed since manual inspection"
   assert [frame["landmark"] for frame in old["frames"]]==manual["clips"][clip["id"]], "Manual marks changed since overlay inspection"
  im=Image.open(source).convert("RGB")
  draw=ImageDraw.Draw(im)
  xe=[round(i*im.width/4) for i in range(5)]
  ye=[round(i*im.height/2) for i in range(3)]
  records=[]
  for i,(mx,my) in enumerate(manual["clips"][clip["id"]]):
   bx,by,br,bb=bounds[clip["id"]][i]["sourceBounds"]
   assert bx <= mx <= br and by <= my <= bb, (profile,clip["id"],i,(mx,my),(bx,by,br,bb))
   floor=bb
   ox,oy=xe[i%4],ye[i//4]
   draw.line((ox+mx,oy+my,ox+mx,oy+floor),fill=(0,240,180),width=2)
   draw.ellipse((ox+mx-5,oy+my-5,ox+mx+5,oy+my+5),outline=(255,232,55),width=2)
   draw.line((ox+mx-12,oy+floor,ox+mx+12,oy+floor),fill=(0,240,180),width=2)
   draw.text((ox+8,oy+8),f'{clip["id"]} {i} body=({mx},{my}) floor={floor}',fill=(255,255,255),stroke_width=1,stroke_fill=(0,0,0))
   uncertainty=12 if profile=="enemy-009-crusher" and clip["id"]=="death" and i>=5 else 8
   records.append({"frame":i,"anchor":[mx,floor],"landmark":[mx,my],"reviewed":False,"confidence":"medium","uncertaintyPx":uncertainty,"evidence":f'Manual {manual["landmark"]} at ({mx},{my}); grounded support floor y={floor} including three-pixel extraction guard. Source inspected; marked overlay pending.'})
  overlay=out/f'anchor-{clip["id"]}.jpg'
  im.save(overlay,quality=82)
  review["evidencePaths"].append(overlay.relative_to(ROOT).as_posix())
  review["clips"][clip["id"]]={"sourcePath":clip["sourcePath"],"sourceSha256":source_hash,"sourceSize":list(im.size),"frames":records}
 if args.confirm_reviewed:
  review["status"]="reviewed"
  review["reviewedPoseCount"]=sum(len(c["frames"]) for c in review["clips"].values())
  review["visualReview"]="Every source pose and every marked overlay individually inspected. Marks stay on the defined body landmark and project to grounded support or resting body. This is approximate manual physical registration only, not approval of art, animation timing, scale consistency or 1:1 fidelity. Lurker attack/death have a clear interclip size discontinuity and need separate measured calibration before acceptance; Crusher terminal thorax partly occluded by shield has wider uncertainty. Source hashes and manual coordinates rechecked unchanged after overlay review."
  for c in review["clips"].values():
   for frame in c["frames"]:
    frame["reviewed"]=True
    frame["evidence"]=frame["evidence"].replace("Source inspected; marked overlay pending.","Source and marked overlay individually inspected; landmark and support floor confirmed. No art acceptance implied.")
 fragment["profiles"][profile]=review
(ROOT/"docs/references/V66_BATCH_002_ANCHORS_A.json").write_text(json.dumps(fragment,indent=2)+"\n",encoding="utf8")
print(json.dumps({"profiles":len(fragment["profiles"]),"manuallyMarkedPoses":sum(len(c["frames"]) for p in fragment["profiles"].values() for c in p["clips"].values()),"status":"reviewed" if args.confirm_reviewed else "pending-overlay-review"}))
