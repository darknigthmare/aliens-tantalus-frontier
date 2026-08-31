"""Render inspection-only source contacts; never changes authored source pixels."""
from pathlib import Path
import argparse, json, hashlib, sys, importlib.util
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"docs/references/v66-batch-002-royal-qa"
parser=argparse.ArgumentParser()
parser.add_argument("--profile", required=True)
parser.add_argument("--bounds", action="store_true", help="Inspect extraction bounds, without normalizing or accepting art")
args=parser.parse_args()
queue=json.loads((ROOT/"docs/references/V66_ENEMY_BATCH_QUEUE.json").read_text(encoding="utf8"))
job=next(j for j in queue["jobs"] if j["profileId"]==args.profile)
out=OUT/args.profile
out.mkdir(parents=True,exist_ok=True)
stack=Image.new("RGB", (888, 462*len(job["clips"])), (14,20,26))
stack_draw=ImageDraw.Draw(stack)
all_reports={}
if args.bounds:
    sys.path.insert(0, str(ROOT/"scripts"))
    spec=importlib.util.spec_from_file_location("royal_inspection_normalizer", ROOT/"scripts/process-v66-enemy-batch.py")
    pipeline=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(pipeline)
for ordinal,clip in enumerate(job["clips"]):
    source=Image.open(ROOT/clip["sourcePath"]).convert("RGB")
    preview=source.copy()
    draw=ImageDraw.Draw(preview)
    xe=[round(i*source.width/4) for i in range(5)]
    ye=[round(i*source.height/2) for i in range(3)]
    for idx in range(8):
        ox,oy=xe[idx%4],ye[idx//4]
        draw.text((ox+6,oy+6),f'{clip["id"]} frame {idx}',fill=(255,255,0),stroke_width=1,stroke_fill=(0,0,0))
        for x in range(50,440,50):
            draw.line((ox+x,oy+25,ox+x,ye[idx//4+1]), fill=(110,80,110),width=1)
            draw.text((ox+x+1,oy+26),str(x),fill=(255,255,0),stroke_width=1,stroke_fill=(0,0,0))
        for y in range(50,440,50):
            draw.line((ox+25,oy+y,xe[idx%4+1],oy+y),fill=(110,80,110),width=1)
            draw.text((ox+2,oy+y+1),str(y),fill=(255,255,0),stroke_width=1,stroke_fill=(0,0,0))
    path=out/f'source-{clip["id"]}-grid.jpg'
    preview.save(path,quality=94)
    stack.paste(source.resize((888,444)), (0,ordinal*462+18))
    stack_draw.text((6,ordinal*462+3), f'{args.profile} / {clip["id"]} / source 8 poses', fill=(238,233,210))
    if args.bounds:
        _,reports=pipeline.split_source(source,clip["id"],job["sourceGrid"],True,True,True)
        all_reports[clip["id"]]=reports
    print(json.dumps({"clip":clip["id"],"image":str(path.relative_to(ROOT)).replace("\\","/"),"sourceSha256":hashlib.sha256((ROOT/clip["sourcePath"]).read_bytes()).hexdigest(),"sourceSize":source.size}))
stack.save(out/"source-contact.jpg",quality=68)
if args.bounds:
    (out/"extraction-bounds.json").write_text(json.dumps(all_reports, indent=2)+"\n",encoding="utf8")
