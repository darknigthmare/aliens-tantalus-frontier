"""Compile independently marked cranial scale evidence, never repaint or accept sprites."""
from pathlib import Path
import argparse,json,hashlib,math,statistics
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument("--confirm-reviewed",action="store_true")
args=parser.parse_args()
spec=json.loads((ROOT/"docs/references/V66_BATCH_002_MANUAL_SCALE_A.json").read_text(encoding="utf8"))
queue=json.loads((ROOT/"docs/references/V66_ENEMY_BATCH_QUEUE.json").read_text(encoding="utf8"))
target=ROOT/"docs/references/V66_BATCH_002_SCALE_A.json"
prior=json.loads(target.read_text(encoding="utf8")) if args.confirm_reviewed else None
report={"schema":1,"batchId":"batch-002","coordinates":"nominal-source-cell","reviewScope":"Independent manual cranial scale calibration for selected source clips, not artwork acceptance.","profiles":{}}
for pid,manual in spec.items():
 job=next(j for j in queue["jobs"] if j["profileId"]==pid)
 out=ROOT/"docs/references/v66-batch-002-royal-qa"/pid
 record={"status":"pending-overlay-review","reviewer":"Codex complete_royal","reviewedAt":"2026-08-31","note":manual["note"],"baselineClip":"idle","sourceSha256ByClip":{},"sourceScaleByClip":{c["id"]:1.0 for c in job["clips"]},"measurements":[],"evidencePaths":[],"medianLengthPxByClip":{},"calibratedClips":list(manual["clips"]),"unchangedUnreviewedClips":[c["id"] for c in job["clips"] if c["id"] not in manual["clips"]]}
 for c in job["clips"]:
  source=ROOT/c["sourcePath"]
  digest=hashlib.sha256(source.read_bytes()).hexdigest()
  record["sourceSha256ByClip"][c["id"]]=digest
  if args.confirm_reviewed:
   assert prior["profiles"][pid]["sourceSha256ByClip"][c["id"]]==digest,"Source changed since cranial review"
  if c["id"] not in manual["clips"]: continue
  im=Image.open(source).convert("RGB")
  xe=[round(i*im.width/4) for i in range(5)];ye=[round(i*im.height/2) for i in range(3)]
  marks=manual["clips"][c["id"]]
  board=Image.new("RGB",(444*len(marks),444))
  d=ImageDraw.Draw(board)
  for col,(f,p0,p1) in enumerate(marks):
   frame=im.crop((xe[f%4],ye[f//4],xe[f%4+1],ye[f//4+1]))
   board.paste(frame,(444*col,0))
   length=round(math.dist(p0,p1),4)
   if args.confirm_reviewed:
    old=next(m for m in prior["profiles"][pid]["measurements"] if m["clip"]==c["id"] and m["frame"]==f)
    assert old["endpoints"]==[p0,p1],"Cranial endpoints changed since overlay review"
   d.line((444*col+p0[0],p0[1],444*col+p1[0],p1[1]),fill=(0,245,180),width=2)
   for p in [p0,p1]:
    x,y=444*col+p[0],p[1]
    d.ellipse((x-4,y-4,x+4,y+4),outline=(255,255,0),width=2)
   d.text((444*col+5,6),f'{c["id"]} {f} {p0} -> {p1} L={length}',fill=(255,255,255),stroke_width=1,stroke_fill=(0,0,0))
   record["measurements"].append({"clip":c["id"],"frame":f,"endpoints":[p0,p1],"lengthPx":length,"landmark":"rigid-cranial-length","uncertaintyPx":4,"note":"Manually measured posterior cranial contour to anterior dome tip; jaw and external appendages excluded. "+("Marked overlay and source individually inspected; fixed endpoints and source SHA verified unchanged." if args.confirm_reviewed else "Marked overlay awaits inspection.")})
  path=out/f'scale-{c["id"]}.jpg'
  board.save(path,quality=88)
  record["evidencePaths"].append(path.relative_to(ROOT).as_posix())
  record["medianLengthPxByClip"][c["id"]]=statistics.median([m["lengthPx"] for m in record["measurements"] if m["clip"]==c["id"]])
 idle=record["medianLengthPxByClip"]["idle"]
 for clip,median in record["medianLengthPxByClip"].items():
  record["sourceScaleByClip"][clip]=round(idle/median,6)
 if args.confirm_reviewed:
  record["status"]="reviewed"
 report["profiles"][pid]=record
target.write_text(json.dumps(report,indent=2)+"\n",encoding="utf8")
print(json.dumps({pid:{"status":p["status"],"medians":p["medianLengthPxByClip"],"factors":p["sourceScaleByClip"]} for pid,p in report["profiles"].items()}))
