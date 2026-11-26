from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json
R=Path(__file__).resolve().parents[1];data=json.loads((R/'qa/browser-v08-results.json').read_text());ids=list(dict.fromkeys(x['room'] for x in data['roomCaptures']));out=R/'qa/contact-sheets';out.mkdir(exist_ok=True)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',15)
for k in range(0,len(ids),8):
 subset=ids[k:k+8];canvas=Image.new('RGB',(1200,len(subset)*400),(10,20,15));d=ImageDraw.Draw(canvas)
 for j,id in enumerate(subset):
  for col,side in enumerate(['L','R']):
   f=next(x['file'] for x in data['roomCaptures'] if x['room']==id and x['side']==side)
   im=Image.open(R/'qa'/f);im.thumbnail((600,375));canvas.paste(im,(col*600,j*400+25));d.text((col*600+10,j*400+5),f'{id} — cadrage {side}',font=font,fill=(225,230,205))
 canvas.save(out/f'architecture-{k//8+1:02}.jpg',quality=85)
print(len(ids),'rooms in',(len(ids)+7)//8,'contact sheets')
