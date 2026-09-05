"""Read-only diagnostic of V74 Facehugger attack candidate; never overwrites source art."""
import importlib.util
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
sys.path.insert(0,str(ROOT/'scripts'))
spec=importlib.util.spec_from_file_location("normalizer",ROOT/"scripts/process-v66-enemy-batch.py")
normalizer=importlib.util.module_from_spec(spec);spec.loader.exec_module(normalizer)
source=ROOT/"assets/openai/sprites/frames/v74/enemy-054-albino-facehugger/attack-clean-r2.png"
with Image.open(source) as im:
    frames,reports=normalizer.split_source(im,"attack",{"columns":4,"rows":2,"frameCount":8},True,True,True)
contacts=Image.new("RGB",(1774,1020),"#172b30")
draw=ImageDraw.Draw(contacts)
results=[]
for i,frame in enumerate(frames):
    tile=frame.copy()
    a=np.asarray(tile).astype(np.int16)
    purple=(a[...,3]>=16)&(a[...,0]>70)&(a[...,2]>70)&(np.minimum(a[...,0],a[...,2])>a[...,1]+35)
    x=i%4*443;y=i//4*510
    background=Image.new("RGBA",tile.size,"#becad0" if i%2 else "#172b30")
    background.alpha_composite(tile)
    contacts.paste(background.convert("RGB"),(x,y+25))
    draw.text((x+8,y+5),f"attack {i+1} / violet diagnostic {int(purple.sum())}",fill="white")
    results.append({"frame":i,"size":list(tile.size),"violetDiagnosticPixels":int(purple.sum()),"extraction":reports[i]})
contacts.save(HERE/"attack-r2-key-contact.png")
(HERE/"attack-r2-key-diagnostics.json").write_text(json.dumps(results,indent=2)+"\n",encoding="utf-8",newline="\n")
print(json.dumps([{"frame":r["frame"],"size":r["size"],"violetDiagnosticPixels":r["violetDiagnosticPixels"]} for r in results]))
