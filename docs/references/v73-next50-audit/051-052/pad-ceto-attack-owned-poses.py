"""Translate complete, ownership-proven authored poses; no resize, repaint or source overwrite."""
from pathlib import Path
from PIL import Image
import numpy as np
import hashlib,json,sys,importlib.util
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
sys.path.insert(0,str(ROOT/"scripts"))
spec=importlib.util.spec_from_file_location("v73_ceto_normalizer",ROOT/"scripts/process-v66-enemy-batch.py")
pipe=importlib.util.module_from_spec(spec);spec.loader.exec_module(pipe)
source=ROOT/"assets/openai/sprites/frames/v66/batch-004/enemy-051-ceto-reef-predator/attack.png"
before=source.read_bytes();sha=lambda b:hashlib.sha256(b).hexdigest()
im=Image.open(source);assert im.mode=="RGB" and im.size==(1754,897)
sx=[round(i*im.width/4) for i in range(5)];sy=[round(i*im.height/2) for i in range(3)]
dx=[round(i*1774/4) for i in range(5)]
dy=[round(i*887/2) for i in range(3)]
frames,reports=pipe.extract_globally_connected_cells(im,"attack",sx,sy,False,True,True)
out=np.empty((887,1774,3),dtype=np.uint8);out[:]=[255,0,255]
occupied=np.zeros((887,1774),dtype=bool);records=[]
for frame,report in zip(frames,reports):
    i=report["clipFrame"];col=i%4;row=i//4
    rgb=np.asarray(frame); mask=rgb[:,:,3]>0
    source_left,source_top,source_right,source_bottom=report["sourceGlobalBounds"]
    horizontal_padding=(dx[col+1]-dx[col])-(sx[col+1]-sx[col])
    default_left=source_left+(dx[col]-sx[col])+horizontal_padding//2
    # Minimal integer whole-pose shift only where original art crossed its nominal cell.
    left=max(dx[col]+3,min(default_left,dx[col+1]-3-frame.width))
    vertical_padding=(dy[row+1]-dy[row])-(sy[row+1]-sy[row])
    top=source_top+(dy[row]-sy[row])+vertical_padding//2
    assert left>=dx[col] and left+frame.width<=dx[col+1]
    assert top>=dy[row] and top+frame.height<=dy[row+1]
    view=out[top:top+frame.height,left:left+frame.width]
    prior=occupied[top:top+frame.height,left:left+frame.width]
    assert not np.any(prior & mask)
    view[mask]=rgb[:,:,:3][mask];prior[mask]=True
    assert np.array_equal(view[mask],rgb[:,:,:3][mask])
    records.append({"frame":i,"sourceGlobalBounds":report["sourceGlobalBounds"],"derivedCopiedBounds":[left,top,left+frame.width,top+frame.height],"sourceToDerivedOffset":[left-source_left,top-source_top],"extraShiftAfterNominalPaddingX":left-default_left,"foregroundPixels":int(mask.sum()),"sourceForegroundRgbSha256":sha(rgb[:,:,:3][mask].tobytes()),"derivedForegroundRgbSha256":sha(view[mask].tobytes()),"allForegroundPixelsByteIdentical":True,"sourceOwnershipTransfers":report["sourceOwnershipTransfers"]})
path=HERE/"enemy-051-ceto-reef-predator.attack.owned-padded-1774x887.png"
Image.fromarray(out,"RGB").save(path)
assert source.read_bytes()==before
assert int(occupied.sum())==sum(r["foregroundPixels"] for r in records)
# Re-extraction must preserve every connected subject without crossing any new cell border.
new_frames,new_reports=pipe.split_source(Image.open(path),"attack",{"columns":4,"rows":2,"frameCount":8},False,True,True)
assert len(new_frames)==8
proof={"schema":1,"profileId":"enemy-051-ceto-reef-predator","clipId":"attack","sourcePath":str(source.relative_to(ROOT)).replace(chr(92),"/"),"sourceSha256":sha(before),"derivedPath":str(path.relative_to(ROOT)).replace(chr(92),"/"),"derivedSha256":sha(path.read_bytes()),"sourceSize":[1754,897],"derivedSize":[1794,897],"method":"existing-strict-matte-key-and-connected-ownership-then-minimal-integer-translation","matteHandling":"Existing proven exterior and enclosed-magenta key only; original RGB retained for every non-matte authored pixel. Output unused pixels are exact opaque FF00FF.","interpolation":False,"resize":False,"redraw":False,"allAuthoredForegroundPixelsByteIdentical":True,"authoredForegroundPixels":int(occupied.sum()),"discardedAuthoredForegroundPixels":0,"overlappingAuthoredPixels":0,"sourceFileUnchanged":True,"sourceXEdges":sx,"derivedXEdges":dx,"yEdges":sy,"cells":records,"newIndependentCellExtraction":"pass-eight-complete-subjects","accepted":False,"runtimeIntegrated":False,"canonExact":False,"rejectedPriorAttempt":"enemy-051-ceto-reef-predator.attack.padded-1794x897.png separates fragments at nominal borders and must not be used"}
proof["derivedSize"]=[1774,887]
proof["derivedYEdges"]=dy
proof["sameResolutionAsOtherProfileClips"]=True
proof["supersededResolutionExperiment"]="1794x897 derivative preserves anatomy but differs from the other three clip resolutions; do not promote."
(HERE/"enemy-051-ceto-reef-predator.attack-owned-padding-1774-proof.json").write_text(json.dumps(proof,indent=2)+"\n")
print(json.dumps({k:proof[k] for k in ["sourceSha256","derivedSha256","authoredForegroundPixels","allAuthoredForegroundPixelsByteIdentical","newIndependentCellExtraction"]}))
