"""Read sources/reviews and render diagnostic overlays; never redraw sprite artwork."""
from pathlib import Path
import json
from PIL import Image, ImageDraw
import numpy as np

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
PROFILES = ["enemy-049-wild-boar-host", "enemy-050-korari-stalker"]
for profile in PROFILES:
    entry = json.loads((HERE / (profile + ".anchor-review.json")).read_text())["profiles"][profile]
    scale = json.loads((HERE / (profile + ".scale-review.json")).read_text())["profiles"][profile]
    source_images = {}
    for clip, record in entry["clips"].items():
        im = Image.open(ROOT / record["sourcePath"]).convert("RGB")
        source_images[clip] = im
        draw = ImageDraw.Draw(im)
        for pose in record["frames"]:
            frame = pose["frame"]
            ox, oy = round((frame % 4) * im.width / 4), round((frame // 4) * im.height / 2)
            x, y = pose["landmark"]
            ax, ay = pose["anchor"]
            sy = pose["physicalSupportY"]
            draw.line((ox+x, oy+y, ox+ax, oy+ay), fill=(0, 255, 80), width=2)
            draw.ellipse((ox+x-4, oy+y-4, ox+x+4, oy+y+4), outline=(255, 235, 0), width=2)
            draw.line((ox+20, oy+sy, ox+420, oy+sy), fill=(0, 230, 255), width=1)
            draw.line((ox+ax-5, oy+ay, ox+ax+5, oy+ay), fill=(0, 255, 80), width=2)
            draw.rectangle((ox+5, oy+5, ox+430, oy+38), fill=(12, 18, 25))
            draw.text((ox+8, oy+8), "F%s torso=%s root=%s support=%s +/- %spx" %
                      (frame+1, pose["landmark"], pose["anchor"], sy, pose["uncertaintyPx"]), fill="white")
            draw.text((ox+8, oy+23), "AIR clearance=%spx" % pose["authoredClearanceSourcePx"]
                      if pose["airborne"] else "physical support; transparent padding is not anatomy",
                      fill=(0, 255, 255))
        im.save(HERE / (profile + "." + clip + ".anchor-overlay.png"))
    canvas = Image.new("RGB", (900, 1080), (38, 43, 48))
    for i, m in enumerate(scale["measurements"]):
        src = Image.open(ROOT / entry["clips"][m["clip"]]["sourcePath"]).convert("RGB")
        f = m["frame"]; ox, oy = round((f % 4)*src.width/4), round((f//4)*src.height/2)
        cell = src.crop((ox, oy, round((f%4+1)*src.width/4), round((f//4+1)*src.height/2)))
        arr=np.asarray(cell)
        mask=~np.all(arr==[255,0,255],axis=2)
        ys,xs=np.where(mask)
        top=max(0,int(ys.min())-22); bottom=min(cell.height,int(ys.max())+12)
        draw=ImageDraw.Draw(cell)
        a,b=m["endpoints"]
        draw.line((*a,*b),fill=(255,255,0),width=2)
        for x,y in (a,b): draw.ellipse((x-4,y-4,x+4,y+4),outline=(0,255,80),width=2)
        view=cell.crop((0,top,cell.width,bottom))
        view.thumbnail((440,235))
        dx=(i%2)*450;dy=(i//2)*270
        canvas.paste(view,(dx,dy+30))
        ImageDraw.Draw(canvas).text((dx+5,dy+8),"%s F%s active rigid axis %.3fpx" %
                                   (m["clip"],f+1,m["lengthPx"]),fill="white")
    canvas.save(HERE / (profile + ".active-scale-measurements.png"))
print("Rendered 8 source-anchor overlays and 2 active-source scale evidence images; no source pixels rewritten.")
