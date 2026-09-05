"""REJECTED diagnostic: first-stage key destroys authored rose anatomy.

Integer relocation preserves only foreground surviving the existing key, NOT
all original anatomical pixels. Never use these outputs as production sources.
"""
from pathlib import Path
import sys,importlib.util,json,hashlib
import numpy as np
from PIL import Image
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
sys.path.insert(0,str(ROOT/"scripts"))
sp=importlib.util.spec_from_file_location("v73reviewedwarrior",ROOT/"scripts/process-v66-enemy-batch.py")
p=importlib.util.module_from_spec(sp);sp.loader.exec_module(p)
initial=json.loads((HERE/"component-qa.json").read_text())
id="enemy-057-albino-warrior";sha=lambda b:hashlib.sha256(b).hexdigest()
# These separators were inspected against complete sources and the rejected component overlays.
# No original connected component is allowed to cross any reviewed ownership boundary.
partition_notes={
"move":"Both rows: separators x444,855,1265. The third/fourth separator lies in the empty gap between pose3/7 body and pose4/8 tail; nominal x1330 cut two tail segments. Row separator y444 stays in empty space.",
"attack":"Top row: x444,845,1265. Bottom row: first separator x515 above y620, x444 below y620; this keeps pose5 extended inner jaw but leaves the lower tail of pose6. Remaining bottom separators845,1250. The jog runs through empty background between the separate animals.",
"death":"Rows split at y558 in the fully empty gap between first-row limbs ending near497 and second-row heads starting619. Column separators432,850,1292 lie in empty gaps in both rows. The whole first-row bodies therefore remain intact."
}
results={}
for clip in ["move","attack","death"]:
    source=ROOT/"assets/openai/sprites/frames/v66/batch-004"/id/(clip+".png")
    before=source.read_bytes();assert sha(before)==initial["clips"][clip]["sourceSha256"],"Source changed since visual ownership review."
    im=Image.open(source).convert("RGBA");assert im.size==(1774,887)
    rgba=np.asarray(im).copy();ext,enc,_=p.source_matte_masks(rgba,False,True,True);rgba[ext|enc]=0
    fg=rgba[:,:,3]>0;ys,xs=np.indices(fg.shape)
    if clip=="move":
        owner=(ys>=444).astype(np.int16)*4+(xs>=444)+(xs>=855)+(xs>=1265)
    elif clip=="attack":
        row=ys>=444
        first=np.where(row & (ys<620),515,444)
        third=np.where(row,1250,1265)
        owner=row.astype(np.int16)*4+(xs>=first)+(xs>=845)+(xs>=third)
    else:
        owner=(ys>=558).astype(np.int16)*4+(xs>=432)+(xs>=850)+(xs>=1292)
    for component in p._pipeline.connected_components(fg):
        mask=p._pipeline.component_mask(fg.shape,[component])
        assert len(np.unique(owner[mask]))==1,("Reviewed separator cuts original component",clip,component)
    target=np.empty((887,1774,3),dtype=np.uint8);target[:]=[255,0,255]
    occupied=np.zeros(fg.shape,dtype=bool)
    tx=[round(i*1774/4) for i in range(5)];ty=[round(i*887/2) for i in range(3)]
    records=[]
    for i in range(8):
        mask=fg & (owner==i);yy,xx=np.where(mask);assert xx.size>10000
        bounds=[int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)]
        w,h=bounds[2]-bounds[0],bounds[3]-bounds[1]
        left=max(tx[i%4]+3,min(bounds[0],tx[i%4+1]-3-w))
        top=max(ty[i//4]+3,min(bounds[1],ty[i//4+1]-3-h))
        assert left>=tx[i%4]+3 and left+w<=tx[i%4+1]-3
        assert top>=ty[i//4]+3 and top+h<=ty[i//4+1]-3
        ox,oy=left-bounds[0],top-bounds[1];nx,ny=xx+ox,yy+oy
        assert not occupied[ny,nx].any()
        target[ny,nx]=rgba[yy,xx,:3];occupied[ny,nx]=True
        assert np.array_equal(target[ny,nx],rgba[yy,xx,:3])
        records.append({"frame":i,"firstStageKeyedForegroundBounds":bounds,"derivedForegroundBounds":[left,top,left+w,top+h],"integerOffset":[ox,oy],"foregroundPixels":int(xx.size),"firstStageKeyedForegroundRgbSha256":sha(rgba[yy,xx,:3].tobytes()),"derivedForegroundRgbSha256":sha(target[ny,nx].tobytes()),"firstStageKeyedPixelsPreserved":True,"rawAnatomicalPixelsPreserved":False})
    assert int(occupied.sum())==int(fg.sum())
    path=HERE/(id+"."+clip+".owned-rearranged.png")
    Image.fromarray(target,"RGB").save(path)
    assert source.read_bytes()==before
    frames,reports=p.split_source(Image.open(path),clip,{"columns":4,"rows":2,"frameCount":8},False,True,True)
    proof={"schema":1,"profileId":id,"clipId":clip,"sourcePath":str(source.relative_to(ROOT)).replace(chr(92),"/"),"sourceSha256":sha(before),"sourceSize":[1774,887],"derivedPath":str(path.relative_to(ROOT)).replace(chr(92),"/"),"derivedSha256":sha(path.read_bytes()),"derivedSize":[1774,887],"method":"independently-reviewed-source-spatial-ownership-and-whole-pose-integer-translation","reviewedOwnershipBasis":partition_notes[clip],"existingMatteRemoval":"V66 proven exterior+enclosed-magenta+boundedAA only; foreground RGB is unchanged","sourceConnectedComponentsSplit":0,"sourceAnatomicalForegroundPixels":int(fg.sum()),"discardedSourceForegroundPixels":0,"overlappingSourceForegroundPixels":0,"redraw":False,"resize":False,"interpolation":False,"sourceFileUnchanged":True,"poses":records,"independentUniformCellSplit":"pass-eight-poses-with-default-strict-ownership","postRekeyForegroundPixels":sum(r["foregroundPixels"] for r in reports),"postRekeyForegroundCountDelta":sum(r["foregroundPixels"] for r in reports)-int(fg.sum()),"accepted":False,"runtimeIntegrated":False,"canonExact":False,"artBlocker":"Walking half-cycle does not establish near/far leg exchange; physical roots and anatomical scale remain pending."}
    proof["existingMatteRemoval"]="Existing V66 border-connected+enclosed+AA key, VISUALLY REJECTED on this rose-taupe anatomy. This proof preserves only first-stage surviving foreground, not complete raw anatomy."
    proof["firstStageKeyedForegroundPixels"]=proof.pop("sourceAnatomicalForegroundPixels")
    proof["discardedDuringIntegerTranslationPixels"]=proof.pop("discardedSourceForegroundPixels")
    proof["rawAnatomicalPixelsPreserved"]=False
    proof["reviewStatus"]="rejected-matte-damages-anatomy"
    proof["safeAsProductionSource"]=False
    proof["artBlocker"]="The existing key removes authored rose-taupe anatomy before translation, and rekeying removes more foreground. Source move also lacks demonstrated half-cycle leg exchange; physical roots and anatomical scale remain pending."
    (HERE/(id+"."+clip+".rearrangement-proof.json")).write_text(json.dumps(proof,indent=2)+"\n")
    results[clip]={k:proof[k] for k in ["sourceSha256","derivedSha256","firstStageKeyedForegroundPixels","postRekeyForegroundCountDelta","independentUniformCellSplit","reviewStatus"]}
print(json.dumps(results,indent=2))
