"""Render source-vs-existing-key evidence only; does not author or repair art."""
from pathlib import Path
import sys,importlib.util,json,hashlib
import numpy as np
from PIL import Image,ImageDraw
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
sys.path.insert(0,str(ROOT/"scripts"))
spec=importlib.util.spec_from_file_location("v73warriorevidence",ROOT/"scripts/process-v66-enemy-batch.py")
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
source=ROOT/"assets/openai/sprites/frames/v66/batch-004/enemy-057-albino-warrior/move.png"
raw=source.read_bytes();im=Image.open(source).convert("RGBA");a=np.array(im)
ext,enc,_=p.source_matte_masks(a,False,True,True)
keyed=a.copy();keyed[ext|enc]=0
display=Image.new("RGBA",im.size,(29,34,43,255));display.alpha_composite(Image.fromarray(keyed))
crop=(0,0,444,444)
board=Image.new("RGB",(1776,940),(29,34,43))
board.paste(im.crop(crop).convert("RGB").resize((888,888),Image.Resampling.NEAREST),(0,44))
board.paste(display.crop(crop).convert("RGB").resize((888,888),Image.Resampling.NEAREST),(888,44))
d=ImageDraw.Draw(board);d.text((12,16),"057 MOVE POSE 1 - ORIGINAL RGB, x2 nearest",fill="white");d.text((900,16),"EXISTING V66 KEY - REJECTED BODY DAMAGE",fill="white")
board.save(HERE/"enemy-057.move1-source-vs-key-damage.png")
out={"schema":1,"status":"rejected-key-damages-authored-anatomy","profileId":"enemy-057-albino-warrior","sourcePath":str(source.relative_to(ROOT)).replace(chr(92),"/"),"sourceSha256":hashlib.sha256(raw).hexdigest(),"sourceUnchanged":source.read_bytes()==raw,"displayScale":2,"displayInterpolation":"nearest-neighbour-for-inspection-only","renderedSourceCrop":[0,0,444,444],"observations":["Source pose1 far forearm/elbow is drawn continuously; existing key disconnects it.","Source pose1 forward shin and rear foot have continuous solid shading; existing key removes substantial segments.","Not a count of destroyed anatomical pixels: the key mask also contains legitimate background."],"accepted":False,"runtimeIntegrated":False}
(HERE/"enemy-057.key-damage-evidence.json").write_text(json.dumps(out,indent=2)+"\n")
board=Image.new("RGB",(1776,1864),(29,34,43));d=ImageDraw.Draw(board)
sources={}
for row,id in enumerate(["enemy-056-albino-drone-big-chap","enemy-057-albino-warrior"]):
    path=ROOT/"assets/openai/sprites/frames/v66/batch-004"/id/"move.png"
    img=Image.open(path).convert("RGB")
    y=row*932
    d.text((12,y+12),id+" - source pose1 LEFT / source pose5 RIGHT",fill="white")
    board.paste(img.crop((0,0,444,444)).resize((888,888),Image.Resampling.NEAREST),(0,y+38))
    board.paste(img.crop((0,444,444,887)).resize((888,886),Image.Resampling.NEAREST),(888,y+38))
    sources[id]=hashlib.sha256(path.read_bytes()).hexdigest()
board.save(HERE/"enemy-056-057-move-half-cycle-source-comparison.png")
(HERE/"enemy-056-057-move-half-cycle-source-comparison.json").write_text(json.dumps({"schema":1,"sourceSha256":sources,"scope":"source poses1 and5 visual half-cycle comparison, not anatomical scale or root calibration","displayScale":2,"displayInterpolation":"nearest-neighbour-for-inspection-only","accepted":False},indent=2)+"\n")
print(json.dumps(out,indent=2))
