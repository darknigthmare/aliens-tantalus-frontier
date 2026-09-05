"""Lossless cell-padding adapter for the Ceto attack source; never overwrite masters."""
from pathlib import Path
from PIL import Image
import hashlib, json
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
source=ROOT/"assets/openai/sprites/frames/v66/batch-004/enemy-051-ceto-reef-predator/attack.png"
out=HERE/"enemy-051-ceto-reef-predator.attack.padded-1794x897.png"
sha=lambda data:hashlib.sha256(data).hexdigest()
before=source.read_bytes()
original=Image.open(source)
assert original.mode=="RGB" and original.size==(1754,897), (original.mode,original.size)
derived=Image.new("RGB",(1794,897),(255,0,255))
sx=[round(i*1754/4) for i in range(5)]
dx=[round(i*1794/4) for i in range(5)]
ys=[round(i*897/2) for i in range(3)]
records=[]
for row in range(2):
    for column in range(4):
        oldbox=(sx[column],ys[row],sx[column+1],ys[row+1])
        cell=original.crop(oldbox)
        gap=(dx[column+1]-dx[column])-cell.width
        assert gap==10
        position=(dx[column]+gap//2,ys[row])
        derived.paste(cell,position)
        newbox=(*position,position[0]+cell.width,position[1]+cell.height)
        recovered=derived.crop(newbox)
        assert recovered.tobytes()==cell.tobytes()
        records.append({"frame":row*4+column,"sourceBox":oldbox,"derivedCellBox":[dx[column],ys[row],dx[column+1],ys[row+1]],"derivedCopiedBox":newbox,"addedPaddingLeftRight":[5,5],"sourceCellPixelSha256":sha(cell.tobytes()),"derivedCopiedPixelsSha256":sha(recovered.tobytes()),"sourcePixelsPreserved":True,"sourceToDerivedOffset":[position[0]-oldbox[0],0]})
derived.save(out)
assert source.read_bytes()==before
proof={"schema":1,"profileId":"enemy-051-ceto-reef-predator","clipId":"attack","method":"per-cell-horizontal-padding-only","sourcePath":str(source.relative_to(ROOT)).replace(chr(92),"/"),"sourceSha256":sha(before),"sourceSize":list(original.size),"derivedPath":str(out.relative_to(ROOT)).replace(chr(92),"/"),"derivedSha256":sha(out.read_bytes()),"derivedSize":list(derived.size),"sourcePixelCount":original.width*original.height,"addedOpaqueMagentaPaddingPixels":40*897,"allSourcePixelsByteIdentical":True,"sourceFileUnchanged":True,"interpolation":False,"redraw":False,"resize":False,"cropDiscardedSourcePixels":0,"sourceXEdges":sx,"derivedXEdges":dx,"yEdges":ys,"cells":records,"accepted":False,"runtimeIntegrated":False}
(HERE/"enemy-051-ceto-reef-predator.attack-padding-proof.json").write_text(json.dumps(proof,indent=2)+"\n")
print(json.dumps({k:proof[k] for k in ["sourceSha256","derivedSha256","derivedSize","allSourcePixelsByteIdentical","sourceFileUnchanged","addedOpaqueMagentaPaddingPixels"]}))
