"""Burster016 technical world-scale contact; masters and atlas are read-only."""
from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np,json,hashlib
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[4]
ap=ROOT/"assets/openai/sprites/normalized/enemy-profiles-v66/enemy-016-burster.webp"
mp=ROOT/"assets/openai/sprites/normalized/player/echo9-marine-locomotion-sheet.png"
im=Image.open(ap).convert("RGBA");marine=Image.open(mp).convert("RGBA").crop((0,0,256,256))
records=[]
for i in range(32):
    f=im.crop((i%4*256,i//4*256,(i%4+1)*256,(i//4+1)*256))
    box=f.getchannel("A").getbbox()
    records.append({"frame":i,"bounds":list(box),"fullAlphaHeightIncludesTail":box[3]-box[1],"rootBelowAlpha":240-box[3]})
# Anatomical landmarks inspected on idle1: tail excluded from body height.
landmarks={"idle1CranialTop":[168,141],"idle1DorsalThorax":[123,159],"groundPlaneY":240,"uncertaintyNativePx":4}
board=Image.new("RGBA",(1300,1060),(21,31,39,255));d=ImageDraw.Draw(board)
for row,(render,frame) in enumerate([(224,0),(256,0),(288,0),(256,22)]):
    floor=240+row*260;factor=render/256
    board.alpha_composite(marine.resize((110,148),Image.Resampling.NEAREST),(250,floor-round(148*240/256)))
    f=im.crop((frame%4*256,frame//4*256,(frame%4+1)*256,(frame//4+1)*256)).resize((render,render),Image.Resampling.NEAREST)
    left=440;top=floor-round(render*240/256);board.alpha_composite(f,(left,top))
    d.line((80,floor,1220,floor),fill="#4c8598")
    cx=left+render/2;d.rectangle((cx-44,floor-88,cx+44,floor),outline="#deb86f")
    d.text((18,row*260+18),f"Burster frame{frame+1} render{render}x{render}; marine110x148; proposed body88x88; candidate measurement only",fill="white")
board.convert("RGB").save(HERE/"burster-world-scale-proposals.png")
f=im.crop((0,0,256,256)).resize((1024,1024),Image.Resampling.NEAREST)
bg=Image.new("RGBA",f.size,(24,34,42,255));bg.alpha_composite(f);d=ImageDraw.Draw(bg)
for label,pt in [(k,v) for k,v in landmarks.items() if isinstance(v,list)]:
    x,y=[v*4 for v in pt];d.ellipse((x-8,y-8,x+8,y+8),outline="#ffdd52",width=2);d.text((x+12,y-12),label,fill="white")
d.line((20,960,1000,960),fill="#71cbd6",width=2)
d.rectangle((84*4,152*4,172*4,240*4),outline="#d5a95d",width=2)
bg.convert("RGB").save(HERE/"burster-idle1-anatomical-landmarks.png")
out={"schema":1,"profileId":"enemy-016-burster","atlasSha256":hashlib.sha256(ap.read_bytes()).hexdigest(),"marineSha256":hashlib.sha256(mp.read_bytes()).hexdigest(),"proposedRenderSize":[256,256],"proposedBodySize":[88,88],"sourceCell":[256,256],"pivot":[128,240],"runtimeFactor":1,"headToGroundNative":99,"thoraxToGroundNative":81,"marineIdleVisibleHeight":193*148/256,"headToMarineHeightRatio":99/(193*148/256),"bodyScope":"thorax/abdomen plus leg support, excludes raised tail and projected claws/head tip; constant gameplay approximation","landmarks":landmarks,"frames":records,"sourceOrAtlasModified":False,"accepted":False}
(HERE/"burster-scale-measurements.json").write_text(json.dumps(out,indent=2)+"\n")
print(json.dumps({k:v for k,v in out.items() if k!="frames"},indent=2))
