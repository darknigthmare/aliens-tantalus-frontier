"""Profile-local source QA for enemy-044-upp-vanguard. No normalization/global writes."""
import hashlib, importlib.util, json, sys
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
PROFILE="enemy-044-upp-vanguard"
SRC=ROOT/"assets/openai/sprites/frames/v66/batch-003"/PROFILE
OUT=ROOT/"docs/references/V66_WORKLOT_002_UPP_VANGUARD_SOURCE_QA.json"
CLIPS=["idle","move","attack","death","reload"]

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
spec=importlib.util.spec_from_file_location("v66_044_pipeline",ROOT/"scripts/process-v66-enemy-batch.py")
pipe=importlib.util.module_from_spec(spec); sys.modules[spec.name]=pipe; spec.loader.exec_module(pipe)
results=[]
for clip in CLIPS:
    path=SRC/f"{clip}.png"
    with Image.open(path) as image:
        if image.size!=(1774,887) or image.mode!="RGB": raise ValueError(f"contract {clip}: {image.size}/{image.mode}")
        rgba=image.convert("RGBA")
        default_error=None
        try: pipe.split_source(image,clip,{"columns":4,"rows":2,"frameCount":8})
        except Exception as exc: default_error=str(exc)
        safe_error=None; frames=[]; reports=[]
        try: frames,reports=pipe.split_source(image,clip,{"columns":4,"rows":2,"frameCount":8},allow_cell_reassignment=True)
        except Exception as exc: safe_error=str(exc)
        matte=pipe.source_matte_proof(image)
    transfers=[item for report in reports for item in report.get("sourceOwnershipTransfers",[])]
    results.append({"clipId":clip,"path":path.relative_to(ROOT).as_posix(),"sha256":sha(path),"bytes":path.stat().st_size,"size":[1774,887],"mode":"RGB","exactTwoToOne":True,"poseCount":len(frames),"defaultExtraction":{"pass":default_error is None,"error":default_error},"safeOwnershipExtraction":{"pass":safe_error is None,"error":safe_error,"transfers":transfers,"discardedForegroundPixels":sum(r.get("discardedForegroundPixels",0) for r in reports)},"matte":matte})
doc={"schema":1,"release":"v66","worklotId":"worklot-002","profileId":PROFILE,"generatedAt":"2026-09-01","method":"Unchanged-source inspection with process-v66-enemy-batch.py; safe reassignment only proves connected pixel ownership and does not alter active masters.","sources":results,"summary":{"boards":5,"expectedPoses":40,"safeExtractedPoses":sum(x["poseCount"] for x in results),"safePassBoards":sum(x["safeOwnershipExtraction"]["pass"] for x in results),"defaultPassBoards":sum(x["defaultExtraction"]["pass"] for x in results),"sourcePixelsChanged":False,"accepted":False,"runtimeIntegrated":False,"canonExact":False,"visualReview":"Built-in ImageGen outputs were reviewed on return; workspace view_image remained unavailable due Windows ACL helper failure."}}
OUT.write_text(json.dumps(doc,indent=2,ensure_ascii=False)+"\n",encoding="utf-8",newline="\n")
print(json.dumps(doc["summary"],indent=2))
