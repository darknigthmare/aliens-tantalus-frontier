"""Bounded read-only source gate replay; writes no assets or registry."""
from pathlib import Path
import importlib.util,sys,json,hashlib,ast
from PIL import Image
ROOT=Path(__file__).resolve().parents[4]
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT/"scripts"))
sp=importlib.util.spec_from_file_location("v73warriorverify",ROOT/"scripts/process-v66-enemy-batch.py")
p=importlib.util.module_from_spec(sp);sp.loader.exec_module(p)
q=json.loads((HERE/"component-qa.json").read_text())
assert all(hashlib.sha256((ROOT/x["sourcePath"]).read_bytes()).hexdigest()==x["sourceSha256"] for x in q["clips"].values())
print("ORIGINAL_SOURCE_HASHES_UNCHANGED: PASS")
for clip,data in q["clips"].items():
    try:
        frames,reports=p.split_source(Image.open(ROOT/data["sourcePath"]),clip,{"columns":4,"rows":2,"frameCount":8},True,True,True)
        assert clip=="idle" and len(frames)==8
        print(clip,"SOURCE_SPLIT_PASS",len(frames))
    except ValueError as error:
        assert clip!="idle" and "Cross-cell component" in str(error),str(error)
        print(clip,"EXPECTED_SOURCE_SPLIT_FAILURE",str(error))
for clip in ["move","attack","death"]:
    proof=json.loads((HERE/("enemy-057-albino-warrior."+clip+".rearrangement-proof.json")).read_text())
    assert proof["reviewStatus"]=="rejected-matte-damages-anatomy"
    assert proof["accepted"] is False and proof["runtimeIntegrated"] is False and proof["safeAsProductionSource"] is False
    assert proof["rawAnatomicalPixelsPreserved"] is False and proof["postRekeyForegroundCountDelta"]<0
    assert hashlib.sha256((ROOT/proof["derivedPath"]).read_bytes()).hexdigest()==proof["derivedSha256"]
print("REJECTED_DERIVATIVE_PROOFS: PASS")
for path in HERE.glob("*.py"):
    ast.parse(path.read_text())
assert "__V73_FRAGMENT_BUILDING__" not in (HERE/"FINAL_QA.md").read_text()
print("OWNED_SCRIPT_SYNTAX_AND_REPORT_COMPLETE: PASS")
for suffix in ["normalized/enemy-profiles-v66/enemy-057-albino-warrior.webp","metadata/v66/enemy-057-albino-warrior.json"]:
    print("EXISTS",suffix,(ROOT/"assets/openai/sprites"/suffix).exists())
files=[x for x in HERE.iterdir() if x.is_file()]
print("OWNED_DIRECT_FILES",len(files),"TOTAL_BYTES",sum(x.stat().st_size for x in files),"MAX_BYTES",max(x.stat().st_size for x in files))
