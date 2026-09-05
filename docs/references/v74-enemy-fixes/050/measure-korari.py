"""Read-only raster metrics and review contact for unchanged Korari050 sources."""
from pathlib import Path
from PIL import Image,ImageDraw
import hashlib,json,numpy as np
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
p=ROOT/"assets/openai/sprites/normalized/enemy-profiles-v66/enemy-050-korari-stalker.webp"
im=Image.open(p).convert("RGBA")
marinepath=ROOT/"assets/openai/sprites/normalized/player/echo9-marine-locomotion-sheet.png"
marine=Image.open(marinepath).convert("RGBA").crop((0,0,256,256))
records=[]
for i in range(32):
    f=im.crop(((i%4)*256,(i//4)*256,(i%4+1)*256,(i//4+1)*256))
    a=np.array(f);ys,xs=np.where(a[:,:,3]>0)
    records.append({"frame":i,"clip":["idle","move","attack","death"][i//8],"localFrame":i%8,"alphaBounds":[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)],"height":int(ys.max()+1-ys.min()),"width":int(xs.max()+1-xs.min()),"groundClearance":240-int(ys.max()+1)})
board=Image.new("RGBA",(1450,1060),(22,31,40,255));d=ImageDraw.Draw(board)
for row,(render,frame) in enumerate([(256,0),(288,0),(320,0),(288,20)]):
    floor=row*260+240;scale=render/256
    player=marine.resize((110,148),Image.Resampling.NEAREST)
    board.alpha_composite(player,(240,floor-round(148*240/256)))
    f=im.crop(((frame%4)*256,(frame//4)*256,(frame%4+1)*256,(frame//4+1)*256)).resize((render,render),Image.Resampling.NEAREST)
    board.alpha_composite(f,(440,floor-round(render*240/256)))
    d.line((90,floor,1350,floor),fill="#5d8b9c")
    d.text((20,row*260+18),f"Korari source frame{frame+1}, proposed render{render}x{render} | actual marine110x148; candidate review, not runtime promotion",fill="white")
    # Proposed torso bounds excluding tail and projected claws, centered on reviewed body root.
    x=440+render/2-48
    d.rectangle((x,floor-60,x+96,floor),outline="#e9b95a",width=1)
board.convert("RGB").save(HERE/"korari-world-scale-proposals.png")
out={"schema":1,"profileId":"enemy-050-korari-stalker","atlasSha256":hashlib.sha256(p.read_bytes()).hexdigest(),"marineSourceSha256":hashlib.sha256(marinepath.read_bytes()).hexdigest(),"marineIdleNativeBounds":list(marine.getchannel("A").getbbox()),"proposedRenderSize":[288,288],"proposedBodySize":[96,60],"scaleScope":"runtime draw size only; immutable atlas/source remain unchanged","frames":records,"accepted":False,"runtimeIntegrated":False}
(HERE/"korari-raster-measurements.json").write_text(json.dumps(out,indent=2)+"\n")
print(json.dumps(out,indent=2))
