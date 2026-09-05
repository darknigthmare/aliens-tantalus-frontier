"""Render manually selected roots over immutable albino source boards."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]

def main():
    for id in ('enemy-054-albino-facehugger','enemy-055-albino-chestburster'):
        entry=json.loads((HERE/f'{id}.anchor-review.fragment.json').read_text(encoding='utf-8'))['profiles'][id]
        scale=json.loads((HERE/f'{id}.scale-review.fragment.json').read_text(encoding='utf-8'))['profiles'][id]
        for clip,review in entry['clips'].items():
            path=ROOT/f'assets/openai/sprites/frames/v66/batch-004/{id}/{clip}.png'
            before=hashlib.sha256(path.read_bytes()).hexdigest()
            assert before == review['sourceSha256']
            with Image.open(path) as source:
                assert list(source.size)==review['sourceSize']
                out=Image.new('RGB',(source.width,source.height+60),'#122027')
                out.paste(source.convert('RGB'),(0,60));d=ImageDraw.Draw(out)
                d.text((10,8),f'{id} / {clip} / V73 PHYSICAL ROOT REVIEW - NOT ACCEPTANCE',fill='white')
                d.text((10,27),'Yellow: observed ventral body / cervical root. Green: support; attack preserves the authored airborne arc.',fill='white')
                d.text((10,43),before,fill='white')
                for frame in review['frames']:
                    i=frame['frame'];ox=round(i%4*source.width/4);oy=round(i//4*source.height/2)+60
                    x,y=frame['landmark'];ax,ay=frame['anchor']
                    d.text((ox+6,oy+8),f'pose {i+1} : ({x},{y}) -> ({ax},{ay}) +/-10px',fill='white',stroke_width=1,stroke_fill='black')
                    d.line((ox+x,oy+y,ox+ax,oy+ay),fill='yellow',width=2)
                    d.ellipse((ox+x-5,oy+y-5,ox+x+5,oy+y+5),outline='yellow',width=2)
                    d.line((ox+20,oy+ay,ox+420,oy+ay),fill='#70ff9e',width=2)
                    for m in scale['measurements']:
                        if m['clip'] != clip or m['frame'] != i: continue
                        (x0,y0),(x1,y1)=m['endpoints']
                        d.line((ox+x0,oy+y0,ox+x1,oy+y1),fill='cyan',width=2)
                        for sx,sy in m['endpoints']:
                            d.ellipse((ox+sx-3,oy+sy-3,ox+sx+3,oy+sy+3),outline='cyan',width=2)
                out.save(HERE/f'{id}-{clip}-root-review.jpg',quality=96)
            assert hashlib.sha256(path.read_bytes()).hexdigest()==before
    print('8 overlays written; source pixels unchanged')

if __name__=='__main__': main()
