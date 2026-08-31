"""Inspection-only rigid skull measurement contacts, preserving source coordinates."""
from pathlib import Path
import json
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
q=json.loads((ROOT/"docs/references/V66_ENEMY_BATCH_QUEUE.json").read_text(encoding="utf8"))
selection={"idle":[0,1,7],"move":[0,3,7],"attack":[0,1,7],"death":[0,1,2]}
for pid in ["enemy-010-spitter","enemy-011-lurker"]:
 job=next(j for j in q["jobs"] if j["profileId"]==pid)
 out=ROOT/"docs/references/v66-batch-002-royal-qa"/pid
 for c in job["clips"]:
  im=Image.open(ROOT/c["sourcePath"]).convert("RGB")
  xe=[round(i*im.width/4) for i in range(5)];ye=[round(i*im.height/2) for i in range(3)]
  board=Image.new("RGB",(444*3,444))
  d=ImageDraw.Draw(board)
  for col,f in enumerate(selection[c["id"]]):
   frame=im.crop((xe[f%4],ye[f//4],xe[f%4+1],ye[f//4+1]))
   board.paste(frame,(444*col,0))
   for x in range(25,440,25):
    d.line((444*col+x,25,444*col+x,444),fill=(100,50,95))
    d.text((444*col+x+1,25),str(x),fill=(255,255,0),stroke_width=1,stroke_fill=(0,0,0))
   for y in range(50,440,25):
    d.line((444*col+20,y,444*(col+1),y),fill=(100,50,95))
    d.text((444*col+1,y+1),str(y),fill=(255,255,0),stroke_width=1,stroke_fill=(0,0,0))
   d.text((444*col+6,6),f'{pid} {c["id"]} frame {f}',fill=(255,255,255),stroke_width=1,stroke_fill=(0,0,0))
  board.save(out/f'skull-{c["id"]}-grid.jpg',quality=90)
 print(pid)
