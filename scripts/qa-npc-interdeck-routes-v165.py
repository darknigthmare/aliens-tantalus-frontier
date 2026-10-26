"""Audit a read-only native-control trace; does not launch or mutate a game.
Trace: {schema:165,routeId,build:{sourceCommit,buildId},frames:[{monotonic,
sessionId,bodyId,visibleCount,route:<snapshot route entry>}]}. Keep evidence
outside the repository. A passing source test is not an input trace.
"""
import argparse
import hashlib
import json
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--trace', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
raw = args.trace.read_bytes()
trace = json.loads(raw)
errors = []
checks = []

def check(label, condition):
    (checks if condition else errors).append(label)

check('native trace schema165', trace.get('schema') == 165)
check('served build identity present', bool(trace.get('build', {}).get('sourceCommit') and trace.get('build', {}).get('buildId')))
frames = trace.get('frames', [])
check('nonempty observations', len(frames) > 2)
seen = set()
instances = {}
previous = None
handoffs = 0
saved_return = None
for f in frames:
    e = f.get('route') or {}
    a = e.get('actor')
    check('at most one visible body', f.get('visibleCount', 0) <= 1)
    if a:
        seen.add(a.get('stage'))
        t = a.get('lift')
        if t:
            seen.add('lift:' + t['phase'])
        key = f.get('sessionId')
        if f.get('bodyId') is not None:
            instances.setdefault(key, f['bodyId'])
            check('same singleton within browser session', instances[key] == f['bodyId'])
        if previous and previous.get('sessionId') == key and previous.get('route', {}).get('actor'):
            p = previous['route']['actor']
            elapsed = f['monotonic'] - previous['monotonic']
            check('strict observation clock', elapsed > 0)
            if a['deck'] == p['deck'] and a['roomId'] == p['roomId']:
                check('horizontal movement is physically bounded', abs(a['x'] - p['x']) <= 27 * elapsed + .2)
            check('measured horizontal distance never decreases', a['distance'] >= p['distance'] - 1e-7)
            if p['deck'] != a['deck']:
                handoffs += 1
                check('deck change follows closed timed carriage', p.get('lift', {}).get('phase') == 'travel' and t and t['phase'] == 'opening')
                check('full physical carriage period spent', bool(t and t['carriageSeconds'] >= .8 + abs(t['toDeck'] - t['fromDeck']) * .65 - 1e-7))
                check('chart jump adds no walking distance', abs(a['distance'] - p['distance']) < 1e-7)
    if e.get('returned'):
        saved_return = e['returned']
    previous = f
for phase in ['boarding', 'closing', 'travel', 'opening', 'exiting']:
    check('observed cabin phase ' + phase, 'lift:' + phase in seen)
check('actual annex service observed', 'service' in seen)
check('observed outbound and return deck handoffs', handoffs >= 2)
check('exact measured physical return present', bool(saved_return and saved_return.get('observedTravel') is True and saved_return.get('liftJourneys') == 2 and saved_return.get('crossings') == 2))
report = {'schema': 165, 'status': 'PASS' if not errors else 'FAIL',
          'traceSha256': hashlib.sha256(raw).hexdigest(), 'routeId': trace.get('routeId'),
          'build': trace.get('build'), 'frames': len(frames), 'checks': sorted(set(checks)),
          'errors': sorted(set(errors)),
          'limits': ['Automated trace audit; no human participation or canonical art approval.',
                     'Requires genuine native-control observations; metadata alone is insufficient.']}
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
raise SystemExit(0 if not errors else 1)
