"""Technical sprite lineup using runtime dimensions, not an in-game screenshot."""
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = """
import { SPRITE_SHEETS, SPRITE_PIVOTS } from './src/sprite-animation-runtime.js';
const ids = ['player.echo9-marine.locomotion', ...Object.keys(SPRITE_SHEETS).filter(id => id.endsWith('.v66'))];
console.log(JSON.stringify(ids.map(id => ({...SPRITE_SHEETS[id], anchor: SPRITE_PIVOTS[SPRITE_SHEETS[id].pivot]}))));
"""
sheets = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', SCRIPT], cwd=ROOT, text=True))
if len(sheets) != 6:
    raise SystemExit('The lineup requires all five accepted V66 profiles plus the actual marine sheet.')
cell, baseline, zoom = 460, 325, 2
board = Image.new('RGB', (cell * 3, 820), (10, 17, 22))
draw = ImageDraw.Draw(board)
draw.text((12, 10), 'V66 / technical world-scale lineup at 2x / actual runtime dimensions / NOT browser gameplay QA', fill=(221, 237, 240))
measurements = []
for index, sheet in enumerate(sheets):
    with Image.open(ROOT / sheet['path'].lstrip('/')) as source:
        pose = source.convert('RGBA').crop((0, 0, sheet['cellWidth'], sheet['cellHeight']))
    bounds = pose.getbbox()
    sx, sy = sheet['renderWidth'] / sheet['cellWidth'], sheet['renderHeight'] / sheet['cellHeight']
    scaled = pose.resize((round(sheet['renderWidth'] * zoom), round(sheet['renderHeight'] * zoom)), Image.Resampling.NEAREST)
    left = (index % 3) * cell
    top = (index // 3) * 400
    anchor_x = left + cell // 2
    anchor_y = top + baseline
    position = (round(anchor_x - sheet['anchor']['x'] * sx * zoom), round(anchor_y - sheet['anchor']['y'] * sy * zoom))
    board.paste(scaled, position, scaled)
    draw.line((left + 10, anchor_y, left + cell - 10, anchor_y), fill=(48, 104, 85))
    name = sheet.get('profileId', 'marine / existing sheet')
    visible_height = (bounds[3] - bounds[1]) * sy if bounds else 0
    draw.text((left + 10, top + 349), name, fill=(193, 220, 226))
    draw.text((left + 10, top + 368), f"canvas {sheet['renderWidth']}x{sheet['renderHeight']} / idle alpha height {visible_height:.1f}px", fill=(163, 183, 190))
    measurements.append({'sheetId': sheet['id'], 'sourceBounds': bounds, 'renderWidth': sheet['renderWidth'], 'renderHeight': sheet['renderHeight'], 'idleAlphaHeightWorldPx': round(visible_height, 3), 'scope': 'alpha bounds include tail; not automatically anatomy height'})
out = ROOT / 'docs/references/v66-world-scale-review'
out.mkdir(parents=True, exist_ok=True)
board.save(out / 'lineup.jpg', quality=94)
(out / 'measurements.json').write_text(json.dumps(measurements, indent=2) + '\n', encoding='utf-8', newline='\n')
print(json.dumps(measurements, indent=2))
