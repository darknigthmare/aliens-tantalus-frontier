"""Read-only source inspection. Diagnostic overlays only; never repaints masters."""
from pathlib import Path
from PIL import Image, ImageDraw
ROOT = Path(__file__).resolve().parents[4]
HERE = Path(__file__).resolve().parent
path=ROOT/'assets/openai/sprites/frames/v75/enemy-011-lurker/attack-pounce-r1.png'
src=Image.open(path).convert('RGB')
for row in range(2):
    out=src.crop((0,round(row*src.height/2),src.width,round((row+1)*src.height/2)))
    draw=ImageDraw.Draw(out)
    for cell in range(4):
        ox=round(cell*src.width/4)
        for x in range(0,440,50):
            draw.line((ox+x,0,ox+x,out.height),fill='#782878')
            draw.text((ox+x+2,5),str(x),fill='white',stroke_width=1,stroke_fill='black')
        for y in range(50,440,50):
            draw.line((ox,y,ox+443,y),fill='#782878')
            draw.text((ox+3,y),str(y),fill='white',stroke_width=1,stroke_fill='black')
    out.save(HERE/f'attack-r1-grid-row{row+1}.png')
