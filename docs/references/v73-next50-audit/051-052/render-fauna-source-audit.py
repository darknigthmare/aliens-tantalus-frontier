"""Diagnostic contacts/metrics for 051-052; source art is read-only."""
from pathlib import Path
import hashlib,json,sys,importlib.util
import numpy as np
from PIL import Image,ImageDraw
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
sys.path.insert(0,str(ROOT/"scripts"))
sp=importlib.util.spec_from_file_location("v73_source_audit",ROOT/"scripts/process-v66-enemy-batch.py")
pipe=importlib.util.module_from_spec(sp);sp.loader.exec_module(pipe)
sha=lambda b:hashlib.sha256(b).hexdigest()
result={"schema":1,"reviewedAt":"2026-09-05","accepted":False,"runtimeIntegrated":False,"profiles":{}}
for profile in ["enemy-051-ceto-reef-predator","enemy-052-tantalus-tunnel-vermin"]:
    item={"sourceClips":{},"physicalRoots":"pending-independent-anatomical-review","scale":"pending-cross-clip-anatomical-measurement"}
    for clip in ["idle","move","attack","death"]:
        p=ROOT/"assets/openai/sprites/frames/v66/batch-004"/profile/(clip+".png")
        original=Image.open(p);before=p.read_bytes()
        frames,reports=pipe.extract_globally_connected_cells(original,clip,[round(i*original.width/4) for i in range(5)],[round(i*original.height/2) for i in range(3)],False,True,True)
        contact=Image.new("RGB",(2000,2200),(35,42,47));draw=ImageDraw.Draw(contact)
        for i,f in enumerate(frames):
            # Unscaled full source poses first, enlarged2x for reading only.
            f=f.resize((f.width*2,f.height*2),Image.Resampling.NEAREST)
            assert f.width<=980 and f.height<=500, "Use a larger diagnostic contact, never rescale individual poses."
            bg=Image.new("RGBA",f.size,(55,62,67,255));bg.alpha_composite(f)
            x=(i%2)*1000+10;y=(i//2)*550+36
            contact.paste(bg.convert("RGB"),(x,y))
            draw.text((x,y-25),clip+" F"+str(i+1)+" — full authored subject; QA candidate only",fill="white")
        contact.save(HERE/(profile+"."+clip+".source-contact.png"))
        item["sourceClips"][clip]={"path":str(p.relative_to(ROOT)).replace(chr(92),"/"),"sha256":sha(before),"size":list(original.size),"sourceFileUnchanged":p.read_bytes()==before,"frameCount":len(frames),"foregroundPixels":sum(r["foregroundPixels"] for r in reports),"ownershipTransfers":[{"frame":r["clipFrame"],"transfers":r["sourceOwnershipTransfers"]} for r in reports if r["sourceOwnershipTransfers"]]}
    mp=ROOT/"assets/openai/sprites/metadata/v66"/(profile+".json")
    if mp.exists():
        meta=json.loads(mp.read_text());atlas=Image.open(ROOT/meta["normalized"]).convert("RGBA");a=np.asarray(atlas).astype(np.int16)
        strict=(a[:,:,3]>0)&(a[:,:,0]>=190)&(a[:,:,2]>=190)&(a[:,:,1]<=60)&(np.abs(a[:,:,0]-a[:,:,2])<=32)&(np.minimum(a[:,:,0],a[:,:,2])-a[:,:,1]>=150)
        frames=pipe.atlas_frames(atlas,meta["grid"])
        item["candidateAtlas"]={"path":meta["normalized"],"sha256":sha((ROOT/meta["normalized"]).read_bytes()),"bytes":(ROOT/meta["normalized"]).stat().st_size,"frameCount":meta["frameCount"],"uniqueFrames":len(set(sha(f.tobytes()) for f in frames)),"strictMagentaPixels":int(strict.sum()),"hiddenRgbPixels":int(np.count_nonzero((a[:,:,3]==0)&np.any(a[:,:,:3]!=0,axis=2))),"sourceHashesCurrent":all(next(s["sha256"] for s in meta["sources"] if s["clip"]==c)==v["sha256"] for c,v in item["sourceClips"].items()),"findings":meta["validation"]["findings"],"physicalAnchorReview":meta["physicalAnchorReview"],"sourceScaleByClip":meta["sourceScaleByClip"],"runtimeIntegrated":meta["runtimeIntegrated"],"acceptanceStatus":meta["acceptanceStatus"]}
        bg=Image.new("RGBA",atlas.size,(49,56,61,255));bg.alpha_composite(atlas)
        bg.convert("RGB").save(HERE/(profile+".normalized-contact.png"))
    result["profiles"][profile]=item
p=ROOT/"assets/openai/sprites/frames/v66/batch-004/enemy-052-tantalus-tunnel-vermin/idle.png"
im=Image.open(p).convert("RGB");d=ImageDraw.Draw(im)
points=[(52,347),(96,347),(175,347),(214,347),(305,347),(339,347)]
for i,(x,y) in enumerate(points):
    d.ellipse((x-4,y-4,x+4,y+4),outline=(0,255,0),width=2);d.text((x-3,y+7),str(i+1),fill=(0,255,0))
im.crop((20,205,440,373)).resize((1260,504),Image.Resampling.NEAREST).save(HERE/"enemy-052.idle1-six-traceable-feet.png")
result["profiles"]["enemy-052-tantalus-tunnel-vermin"]["manualLimbObservation"]={"clip":"idle","frame":0,"distinctTraceableFeet":6,"sourceLocalMarkedFootCoordinates":points,"notClaimed":"This does not prove two legs absent behind the shell; it proves the contract of eight independently readable locomotor limbs is not met in this pose."}
(HERE/"candidate-qa.json").write_text(json.dumps(result,indent=2)+"\n")
print(json.dumps({p:{"sourceFrames":sum(c["frameCount"] for c in v["sourceClips"].values()),"candidateAtlas":v.get("candidateAtlas")} for p,v in result["profiles"].items()}))
