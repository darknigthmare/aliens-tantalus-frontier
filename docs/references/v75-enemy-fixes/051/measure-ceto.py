"""V75 manual Ceto measurements and deterministic review overlays; no source write."""
from pathlib import Path
import json,hashlib,math,statistics,sys,importlib.util
from PIL import Image,ImageDraw
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
PROFILE="enemy-051-ceto-reef-predator"
CLIPS=["idle","move","attack","death"]
# Hand-observed thoracic mass points, nominal source-cell coordinates. These
# are anatomical points, never the midpoint of a tail/head alpha rectangle.
POINTS={
"idle":[[236,265],[231,265],[230,266],[229,265],[235,193],[231,193],[227,194],[226,194]],
"move":[[234,266],[224,271],[231,273],[235,271],[232,198],[215,196],[223,206],[220,198]],
"attack":[[232,266],[210,269],[179,281],[244,278],[256,182],[231,178],[204,197],[195,196]],
"death":[[228,267],[207,280],[221,309],[211,315],[228,205],[222,207],[218,220],[208,225]]
}
DEATH_SUPPORT=[337,360,361,357,250,248,246,246]
# Rigid hip/croup joint to anterior shoulder joint, excluding head, caudal fin,
# paddles and spine crest. Non-coiled comparable source poses chosen manually.
MEASURES={
"idle":[(0,[185,282],[285,269]),(1,[180,283],[279,269])],
"move":[(0,[186,287],[286,269]),(7,[180,210],[285,201])],
"attack":[(0,[186,282],[279,270]),(7,[137,222],[240,206])],
"death":[(0,[179,284],[275,271]),(2,[151,326],[256,308])]
}
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
measurements=[]
lengths={}
for clip,values in MEASURES.items():
    lengths[clip]=[]
    for frame,a,b in values:
        length=math.dist(a,b);lengths[clip].append(length)
        measurements.append({"clip":clip,"frame":frame,"landmark":"posterior-hip-to-anterior-shoulder-rigid-torso-axis",
            "endpoints":[a,b],"lengthPx":round(length,6),"uncertaintyPx":6,
            "note":"Manual native-source joint trace, visible posterior hip/croup to anterior shoulder. Excludes flexible tail, jaw, crest and limbs; +/-6px reflects broad painted joints and modest pose rotation, not exact skeletal metrology. Chosen non-coiled poses are comparable; all eight poses are reviewed for gross continuity."})
baseline=statistics.median(lengths["idle"])
factors={clip:round(baseline/statistics.median(lengths[clip]),9) for clip in CLIPS}
factors["idle"]=1
sources={}
anchors={}
for clip in CLIPS:
    path=ROOT/"assets/openai/sprites/frames/v66/batch-004"/PROFILE/(clip+".png")
    im=Image.open(path).convert("RGB")
    sources[clip]={"sourcePath":path.relative_to(ROOT).as_posix(),"sourceSha256":sha(path),"sourceSize":list(im.size)}
    d=ImageDraw.Draw(im);frames=[]
    for i,(x,y) in enumerate(POINTS[clip]):
        cx=round((i%4)*im.width/4);cy=round((i//4)*im.height/2)
        root=[x,DEATH_SUPPORT[i] if clip=="death" else y+72]
        evidence=("Postmortem lower paddle/body support plane, manually observed independently of the caudal fin. Root follows the substrate datum while the thorax collapses toward it; not a new swimming body centre." if clip=="death" else
            "Aquatic thoracic-mass datum plus a fixed72 native-pixel ventral offset. This is a virtual collision-keel/root, NOT a lowest-foot contact or bounding-box bottom. Paddling limbs and tail may move independently without vertical body snapping.")
        frames.append({"frame":i,"anchor":root,"landmark":[x,y],"reviewed":True,"confidence":"medium",
            "uncertaintyPx":6,"evidence":f"Pose{i+1}. "+evidence,
            "rootKind":"postmortem-substrate-datum" if clip=="death" else "aquatic-ventral-datum",
            "thoraxToRootPx":root[1]-y})
        X,Y=cx+x,cy+y;RX,RY=cx+root[0],cy+root[1]
        d.line((X,Y,RX,RY),fill=(255,220,35),width=2)
        d.ellipse((X-4,Y-4,X+4,Y+4),outline=(255,220,35),width=2)
        d.line((RX-8,RY,RX+8,RY),fill=(0,255,70),width=2)
        d.line((RX,RY-8,RX,RY+8),fill=(0,255,70),width=2)
        d.text((cx+10,cy+20),f"{clip} {i+1} thorax{x},{y} root{root[0]},{root[1]}",fill=(255,255,255))
    for frame,a,b in MEASURES[clip]:
        ox=round((frame%4)*im.width/4);oy=round((frame//4)*im.height/2)
        d.line((ox+a[0],oy+a[1],ox+b[0],oy+b[1]),fill=(255,80,20),width=2)
        for x,y in [a,b]:d.ellipse((ox+x-3,oy+y-3,ox+x+3,oy+y+3),fill=(255,80,20))
    im.save(HERE/(clip+".manual-landmarks.png"))
    anchors[clip]={**sources[clip],"frames":frames}
paths=[(HERE/(c+".manual-landmarks.png")).relative_to(ROOT).as_posix() for c in CLIPS]
paths.append((HERE/"MEASUREMENT_NOTES.md").relative_to(ROOT).as_posix())
base={"schema":1,"batchId":"batch-004","coordinates":"nominal-source-cell"}
reviewer="Codex level_props_audit_fix V75 independent manual review"
anchor={"status":"reviewed","reviewer":reviewer,"reviewedAt":"2026-09-05","reviewedPoseCount":32,
"method":"All32 source thoracic points and eight corpse support planes were manually read on unchanged native sources, plotted and visually checked. Living roots use the observed thorax plus72px ventral datum, preserving paddling and tail motion; not bbox centering, bottom alignment or planted feet. Corpse roots independently use lower paddle/body substrate planes to retain collapse.",
"evidencePaths":paths,"clips":anchors}
scale={"status":"reviewed","profileId":PROFILE,"reviewer":reviewer,"reviewedAt":"2026-09-05","baselineClip":"idle",
"note":"First anatomical source calibration for051, based on eight measured hip/shoulder axes from comparable non-coiled poses. Clip-wide factors only, calculated from medians, no per-pose resizing. Native sources remain unchanged and are not already calibrated. +/-6px joint-reading uncertainty remains explicit.",
"sourceScaleByClip":factors,"sourceSha256ByClip":{c:sources[c]["sourceSha256"] for c in CLIPS},
"measurements":measurements,"evidencePaths":paths,
"accepted":False,"runtimeIntegrated":False,"canonExact":False}
(HERE/"anchor-review.json").write_text(json.dumps({**base,"profiles":{PROFILE:anchor}},indent=2)+"\n")
(HERE/"scale-review.json").write_text(json.dumps({**base,"profiles":{PROFILE:scale}},indent=2)+"\n")
metrics={"lengths":lengths,"medians":{c:statistics.median(v) for c,v in lengths.items()},"factors":factors,
"reviewUncertaintyPx":6,"sourceHashes":{c:sources[c]["sourceSha256"] for c in CLIPS},"authoredSourceMutation":False}
(HERE/"measurement-summary.json").write_text(json.dumps(metrics,indent=2)+"\n")
print(json.dumps(metrics))
