#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,re
R=Path(__file__).resolve().parents[1];tap=R/'reports/node-tests.tap';t=tap.read_text();sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
inputs=sorted([*R.glob('src/*.js'),*R.glob('qa/*.test.cjs'),R/'qa/tactical.cjs',R/'qa/traverse.cjs',R/'data/campaign.json',R/'package.json',R/'integration/install.cjs'])
o={'version':json.loads((R/'package.json').read_text())['version'],'passed':int(re.findall(r'# pass (\d+)',t)[-1]),'failed':int(re.findall(r'# fail (\d+)',t)[-1]),'tap_sha256':sha(tap),'source_sha256':{str(p.relative_to(R)):sha(p)for p in inputs}}
(R/'reports/node-inputs.json').write_text(json.dumps(o,indent=2)+'\n')
