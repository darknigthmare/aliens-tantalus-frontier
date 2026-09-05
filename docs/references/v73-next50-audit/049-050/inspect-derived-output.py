"""Inspect independently generated V66 fauna outputs; write only local QA evidence."""
from pathlib import Path
import json, hashlib
from PIL import Image, ImageDraw
import numpy as np

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
PROFILES=["enemy-049-wild-boar-host","enemy-050-korari-stalker"]
def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
result={"schema":1,"reviewedAt":"2026-09-05","scope":"isolated-source-and-derived-verification","profiles":{}}
for profile in PROFILES:
    meta_path=ROOT/"assets/openai/sprites/metadata/v66"/(profile+".json")
    meta=json.loads(meta_path.read_text())
    anchor=json.loads((HERE/(profile+".anchor-review.json")).read_text())["profiles"][profile]
    scale=json.loads((HERE/(profile+".scale-review.json")).read_text())["profiles"][profile]
    atlas_path=ROOT/meta["normalized"]
    atlas=Image.open(atlas_path).convert("RGBA")
    pixels=np.asarray(atlas).astype(np.int16)
    alpha=pixels[:,:,3]
    strict_magenta=(alpha>0)&(pixels[:,:,0]>=190)&(pixels[:,:,2]>=190)&(pixels[:,:,1]<=60)&(np.abs(pixels[:,:,0]-pixels[:,:,2])<=32)&(np.minimum(pixels[:,:,0],pixels[:,:,2])-pixels[:,:,1]>=150)
    strict_white=(alpha>=240)&np.all(pixels[:,:,:3]>=245,axis=2)
    sources=[]
    for source in meta["sources"]:
        clip=source["clip"]
        path=ROOT/source["path"]
        sha=digest(path)
        sources.append({"clip":clip,"sourceSha256":sha,"matchesInitialReview":sha==anchor["clips"][clip]["sourceSha256"],"matchesMetadata":sha==source["sha256"],"bytes":path.stat().st_size})
    frames=[]; hashes=[]; guard_count=0; alignment=[]; clips={}
    cw=meta["grid"]["cellWidth"]; ch=meta["grid"]["cellHeight"]; cols=meta["grid"]["columns"]; guard=meta["grid"]["guard"]
    for i, placement in enumerate(meta["placements"]):
        x=(i%cols)*cw; y=(i//cols)*ch
        cell=atlas.crop((x,y,x+cw,y+ch))
        arr=np.asarray(cell)
        a=arr[:,:,3]
        guard_mask=np.ones(a.shape,dtype=bool);guard_mask[guard:ch-guard,guard:cw-guard]=False
        guard_count+=int(np.count_nonzero((a>0)&guard_mask))
        ys,xs=np.where(a>0)
        box=[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)]
        hashes.append(hashlib.sha256(cell.tobytes()).hexdigest())
        item={"index":i,"clip":placement["clip"],"frame":placement["clipFrame"],"visibleBounds":box,"visibleHeight":box[3]-box[1],"rootToVisibleBottom":meta["pivot"]["y"]-box[3],"root":placement.get("sourceAnchor"),"landmark":placement.get("sourceLandmark")}
        if "renderedAnchor" in placement:
            error=max(abs(placement["renderedAnchor"][j]-meta["pivot"][axis]) for j,axis in enumerate(("x","y")))
            alignment.append(error);item["renderedRootErrorPx"]=error
        frames.append(item)
    for clip in meta["clips"]:
        path=ROOT/clip["path"]
        local=Image.open(path).convert("RGBA")
        ordinal=[v["id"] if "id" in v else v["clip"] for v in meta["clips"]].index(clip["id"] if "id" in clip else clip["clip"])
        expected=atlas.crop((0,ordinal*2*ch,atlas.width,(ordinal+1)*2*ch))
        clips[clip.get("id",clip.get("clip"))]={"sha256":digest(path),"bytes":path.stat().st_size,"pixelIdenticalToAtlas":local.tobytes()==expected.tobytes()}
    result["profiles"][profile]={"metadataPath":str(meta_path.relative_to(ROOT)).replace("\\","/"),"atlasSha256":digest(atlas_path),"atlasBytes":atlas_path.stat().st_size,"atlasSize":list(atlas.size),"mode":atlas.mode,
        "sourceHashes":sources,"sourcePixelsUnchanged":all(s["matchesInitialReview"] and s["matchesMetadata"] for s in sources),
        "frameCount":len(frames),"uniqueFrames":len(set(hashes)),"alphaZeroPixels":int(np.count_nonzero(alpha==0)),"hiddenRgbPixels":int(np.count_nonzero((alpha==0)&np.any(pixels[:,:,:3]!=0,axis=2))),"strictOpaqueMagentaPixels":int(strict_magenta.sum()),"strictOpaqueWhitePixels":int(strict_white.sum()),"nonzeroGuardPixels":guard_count,
        "maxRenderedRootErrorPx":max(alignment) if alignment else None,"physicalAnchorReview":meta.get("physicalAnchorReview"),"scaleCalibrationReview":meta.get("scaleCalibrationReview"),"sourceScaleByClip":meta["sourceScaleByClip"],"singleFinalPackScale":meta["scale"],"frames":frames,"clips":clips,"metadataFindings":meta["validation"]["findings"],"acceptanceStatus":meta["acceptanceStatus"],"runtimeIntegrated":meta["runtimeIntegrated"],"canonExact":meta["canonExact"]}
    checker=Image.new("RGBA",atlas.size,(34,39,43,255))
    d=ImageDraw.Draw(checker)
    for y in range(0,atlas.height,16):
        for x in range(0,atlas.width,16):
            if ((x//16+y//16)%2)==0:d.rectangle((x,y,x+15,y+15),fill=(54,59,63,255))
    checker.alpha_composite(atlas)
    for i in range(len(frames)):
        x=(i%cols)*cw;y=(i//cols)*ch
        d=ImageDraw.Draw(checker);d.line((x+8,y+meta["pivot"]["y"],x+cw-8,y+meta["pivot"]["y"]),fill=(0,190,220,255))
        d.text((x+5,y+5),frames[i]["clip"]+" "+str(frames[i]["frame"]+1),fill="white")
    checker.convert("RGB").save(HERE/(profile+".normalized-root-contact.png"))
(HERE/"derived-qa.json").write_text(json.dumps(result,indent=2)+"\n")
for profile,qa in result["profiles"].items():
    print(json.dumps({"profile":profile,**{k:qa[k] for k in ["frameCount","uniqueFrames","sourcePixelsUnchanged","strictOpaqueMagentaPixels","strictOpaqueWhitePixels","hiddenRgbPixels","nonzeroGuardPixels","maxRenderedRootErrorPx","sourceScaleByClip","singleFinalPackScale","acceptanceStatus","runtimeIntegrated"]}}))
