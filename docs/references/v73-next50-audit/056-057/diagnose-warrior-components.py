"""Read-only reproduction of V66 component ownership rejection; diagnostic outputs only."""
from pathlib import Path
import sys,importlib.util,json,hashlib
import numpy as np
from PIL import Image,ImageDraw
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
sys.path.insert(0,str(ROOT/"scripts"))
sp=importlib.util.spec_from_file_location("v73warriorqa",ROOT/"scripts/process-v66-enemy-batch.py")
p=importlib.util.module_from_spec(sp);sp.loader.exec_module(p)
id="enemy-057-albino-warrior";result={"schema":1,"profileId":id,"accepted":False,"runtimeIntegrated":False,"clips":{}}
for clip in ["idle","move","attack","death"]:
    path=ROOT/"assets/openai/sprites/frames/v66/batch-004"/id/(clip+".png")
    raw=path.read_bytes();im=Image.open(path).convert("RGBA");rgba=np.asarray(im).copy()
    ext,enc,proof=p.source_matte_masks(rgba,False,True,True);rgba[ext|enc]=0
    fg=rgba[:,:,3]>0;xedges=[round(i*im.width/4) for i in range(5)];yedges=[round(i*im.height/2) for i in range(3)]
    records=[];bad=[];annot=im.convert("RGB");draw=ImageDraw.Draw(annot)
    for x in xedges:draw.line((x,0,x,im.height-1),fill=(0,255,255),width=1)
    for y in yedges:draw.line((0,y,im.width-1,y),fill=(0,255,255),width=1)
    bad_view=np.full(rgba.shape,(37,43,49,255),dtype=np.uint8)
    for i,c in enumerate(p._pipeline.connected_components(fg)):
        mask=p._pipeline.component_mask(fg.shape,[c]);ys,xs=np.where(mask)
        cells=np.searchsorted(yedges[1:],ys,side="right")*4+np.searchsorted(xedges[1:],xs,side="right")
        counts=np.bincount(cells,minlength=8);owner=int(counts.argmax());b=[xedges[owner%4],yedges[owner//4],xedges[owner%4+1],yedges[owner//4+1]]
        share=float(counts[owner]/c.area);mx=max(8,round((b[2]-b[0])*.15));my=max(8,round((b[3]-b[1])*.15))
        reasons=[]
        if np.count_nonzero(counts)>1:
            if share<.9:reasons.append("owner-share-below90percent")
            if c.left<b[0]-mx or c.right>b[2]+mx or c.top<b[1]-my or c.bottom>b[3]+my:reasons.append("excursion-over15percent")
        rec={"componentId":i,"area":c.area,"bounds":[c.left,c.top,c.right,c.bottom],"ownerCell":owner,"ownerShare":round(share,8),"cellPixelCounts":counts.tolist(),"strictRejectionReasons":reasons}
        if c.area>=64 or reasons:records.append(rec)
        if reasons:
            rec["rgbMin"]=rgba[mask,:3].min(axis=0).tolist();rec["rgbMax"]=rgba[mask,:3].max(axis=0).tolist();rec["rgbMedian"]=np.median(rgba[mask,:3],axis=0).tolist()
            bad.append(rec);bad_view[mask]=rgba[mask]
            draw.rectangle((c.left,c.top,c.right,c.bottom),outline=(255,50,40),width=2)
            draw.text((max(0,c.left),max(0,c.top-15)),str(i)+" area"+str(c.area)+" share"+str(round(share,3)),fill=(255,255,0))
    annot.save(HERE/(id+"."+clip+".component-overlay.png"))
    Image.fromarray(bad_view,"RGBA").save(HERE/(id+"."+clip+".rejected-components.png"))
    result["clips"][clip]={"sourcePath":str(path.relative_to(ROOT)).replace(chr(92),"/"),"sourceSha256":hashlib.sha256(raw).hexdigest(),"sourceSize":list(im.size),"sourcePixelsUnchanged":path.read_bytes()==raw,"foregroundPixels":int(fg.sum()),"outerBorderForeground":bool(fg[0].any() or fg[-1].any() or fg[:,0].any() or fg[:,-1].any()),"largeOrRejectedComponents":records,"rejectedComponents":bad}
(HERE/"component-qa.json").write_text(json.dumps(result,indent=2)+"\n")
print(json.dumps({clip:{"rejected":d["rejectedComponents"],"large":[c for c in d["largeOrRejectedComponents"] if c["area"]>1000]} for clip,d in result["clips"].items()},indent=2))
