"""Create diagnostic overlays from immutable sources and retained measurements."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]


def main():
    anchors = json.loads((HERE / 'enemy-036-deacon-line.anchor-review.fragment.json').read_text(encoding='utf-8'))['profiles']
    scales = json.loads((HERE / 'enemy-036-deacon-line.scale-review.fragment.json').read_text(encoding='utf-8'))['profiles']
    outputs = []
    for profile, entry in anchors.items():
        for clip, review in entry['clips'].items():
            path = ROOT / f'assets/openai/sprites/frames/v66/batch-003/{profile}/{clip}.png'
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            assert digest == review['sourceSha256'] == scales[profile]['sourceSha256ByClip'][clip]
            with Image.open(path) as source:
                assert list(source.size) == review['sourceSize']
                image = Image.new('RGB', (source.width, source.height+80), '#101c24')
                image.paste(source.convert('RGB'), (0,80))
                draw = ImageDraw.Draw(image)
                draw.text((10,10), f'{profile} / {clip} / V73 INDEPENDENT DIAGNOSTIC / NOT ART ACCEPTANCE', fill='white')
                draw.text((10,30), 'Yellow = independently corrected pelvis; green = retained support; cyan = remeasured fixed skull endpoints', fill='white')
                draw.text((10,50), digest, fill='white')
                for frame in review['frames']:
                    i = frame['frame']
                    ox, oy = round((i%4)*source.width/4), round((i//4)*source.height/2)+80
                    x,y = frame['landmark']; ax,ay = frame['anchor']
                    draw.text((ox+5,oy+5), f'pose {i+1} / root {ax},{ay}', fill='white', stroke_width=1, stroke_fill='black')
                    draw.line((ox+x,oy+y,ox+ax,oy+ay), fill='yellow', width=2)
                    draw.ellipse((ox+x-5,oy+y-5,ox+x+5,oy+y+5), outline='yellow', width=2)
                    draw.line((ox+30,oy+ay,ox+414,oy+ay), fill='#66ff88', width=2)
                    for measure in scales[profile]['measurements']:
                        if measure['clip'] != clip or measure['frame'] != i: continue
                        (x0,y0),(x1,y1) = measure['endpoints']
                        draw.line((ox+x0,oy+y0,ox+x1,oy+y1), fill='cyan', width=2)
                        for px,py in measure['endpoints']:
                            draw.ellipse((ox+px-3,oy+py-3,ox+px+3,oy+py+3), outline='cyan', width=2)
                output = HERE / f'{profile}-{clip}-source-review.jpg'
                image.save(output, 'JPEG', quality=94)
                outputs.append(str(output.relative_to(ROOT)).replace(chr(92),'/'))
            assert hashlib.sha256(path.read_bytes()).hexdigest() == digest
    print(json.dumps({'overlays':outputs,'sourcePixelsModified':0},indent=2))


if __name__ == '__main__':
    main()
