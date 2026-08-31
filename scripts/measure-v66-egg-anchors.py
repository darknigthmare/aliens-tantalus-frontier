"""Measure lower-shell centers and render an unapproved Ovomorph anchor review."""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
meta = json.loads((ROOT / "assets/openai/sprites/metadata/v66/enemy-001-ovomorph.json").read_text(encoding="utf-8"))
profile = {"status": "pending", "reviewer": "Codex root", "reviewedAt": "2026-08-31",
    "method": "Median of lower-shell scanline centers in bottom quarter, excluding bottom 7px matte guard; root at shell base. Candidate measurements reviewed against the 32-source overlay before activation.", "clips": {}}
board = Image.new("RGB", (800, 1680), (9, 15, 20))
draw = ImageDraw.Draw(board)
draw.text((8, 8), "Ovomorph: measured lower-body roots / SOURCE QA, NOT GAME ART", fill="white")
for clip_index, source in enumerate(meta["sources"]):
    image = Image.open(ROOT / source["path"]).convert("RGB")
    records = []
    for placement in [p for p in meta["placements"] if p["clip"] == source["clip"]]:
        cell = placement["sourceCell"]
        bounds = placement["sourceBounds"]
        x0, y0, x1, y1 = bounds
        lower = round(y1 - (y1-y0)*.25)
        stop = y1 - 7
        # Padded complete bounds can extend slightly beyond the nominal cell.
        rgb = np.asarray(image.crop((cell[0]+x0,cell[1]+lower,cell[0]+x1,cell[1]+stop)), dtype=np.int16)
        mask = ~((rgb[:,:,0]>100)&(rgb[:,:,2]>100)&(rgb[:,:,1]<100)&(rgb[:,:,0]>1.5*rgb[:,:,1])&(rgb[:,:,2]>1.5*rgb[:,:,1]))
        centers = []
        for row in mask:
            xs = np.flatnonzero(row)
            if len(xs)>12:
                centers.append(x0 + (int(xs[0])+int(xs[-1]))/2)
        if not centers:
            raise ValueError("No measurable egg base.")
        root_x = round(float(np.median(centers)),1)
        landmark_y = round((lower+stop)/2)
        frame = placement["clipFrame"]
        records.append({"frame":frame,"anchor":[root_x,y1],"landmark":[root_x,landmark_y],
            "reviewed":False,"confidence":"medium","uncertaintyPx":4,
            "evidence":f"Lower shell scanline centers, rows {lower}..{stop-1}, median x={root_x}; bottom padded bound y={y1}; source overlay reviewed separately."})
        bx=(frame%4)*200
        by=30+(clip_index*2+frame//4)*205
        preview=image.crop(tuple(cell)).resize((200,200),Image.Resampling.NEAREST)
        board.paste(preview,(bx,by))
        scale=200/(cell[2]-cell[0])
        ax=bx+root_x*scale
        ay=by+y1*scale
        ly=by+landmark_y*scale
        draw.line((ax,ly,ax,ay),fill=(0,255,255),width=2)
        draw.ellipse((ax-3,ay-3,ax+3,ay+3),fill=(0,255,255))
        draw.text((bx+3,by+3),source["clip"]+":"+str(frame)+" x"+str(root_x),fill=(255,255,255),stroke_width=1,stroke_fill=(0,0,0))
    profile["clips"][source["clip"]]={"sourceSha256":source["sha256"],"sourceSize":source["size"],"frames":records}
document={"schema":1,"batchId":"batch-001","coordinates":"nominal-source-cell","profiles":{"enemy-001-ovomorph":profile}}
path=ROOT/"docs/references/V66_OVOMORPH_ANCHORS.json"
path.write_text(json.dumps(document,indent=2)+"\n",encoding="utf-8",newline="\n")
board.save(ROOT/"docs/references/v66-ovomorph-anchor-source-review.jpg",quality=93)
print(json.dumps({clip:[record["anchor"] for record in value["frames"]] for clip,value in profile["clips"].items()},indent=2))
