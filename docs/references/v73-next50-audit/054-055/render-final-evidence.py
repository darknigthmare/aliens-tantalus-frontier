"""Diagnostic displays only: no source or normalized asset mutation."""
from pathlib import Path
from PIL import Image, ImageDraw

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]

def main():
    atlas=Image.open(ROOT/'assets/openai/sprites/normalized/enemy-profiles-v66/enemy-054-albino-facehugger.webp').convert('RGBA')
    frame=atlas.crop((256,1024,512,1280)).crop((80,175,205,248)).resize((750,438),Image.Resampling.NEAREST)
    out=Image.new('RGB',(1500,478),'#142028');d=ImageDraw.Draw(out)
    for n,color in enumerate(('#263139','#ecebe5')):
        bg=Image.new('RGBA',frame.size,color);bg.alpha_composite(frame);out.paste(bg.convert('RGB'),(n*750,40))
        d.text((n*750+8,10),'054 attack pose2: opaque violet fringe between folded fingers | 6x diagnostic',fill='white')
    out.save(HERE/'enemy-054-attack-pose2-alpha-defect.png')
    out=Image.new('RGB',(1024,1140),'#263139');d=ImageDraw.Draw(out)
    pairs=[('002 base V65 / legacy box-root','assets/openai/sprites/normalized/enemy-profiles-v65/enemy-002-facehugger.webp'),
           ('054 albino / reviewed body-root','assets/openai/sprites/normalized/enemy-profiles-v66/enemy-054-albino-facehugger.webp'),
           ('003 base V66 / cervical root','assets/openai/sprites/normalized/enemy-profiles-v66/enemy-003-chestburster.webp'),
           ('055 albino / reviewed cervical root','assets/openai/sprites/normalized/enemy-profiles-v66/enemy-055-albino-chestburster.webp')]
    for n,(label,path) in enumerate(pairs):
        x=n%2*512;y=n//2*570
        tile=Image.open(ROOT/path).convert('RGBA').crop((0,0,256,256)).resize((512,512),Image.Resampling.NEAREST)
        bg=Image.new('RGBA',tile.size,'#263139');bg.alpha_composite(tile);out.paste(bg.convert('RGB'),(x,y+40))
        d.text((x+10,y+10),label,fill='white')
        d.text((x+10,y+25),'Native atlas pixels x2; NOT runtime/world scale',fill='white')
        d.line((x+16,y+520,x+496,y+520),fill='#557466');d.line((x+256,y+510,x+256,y+536),fill='#cfad55')
    out.save(HERE/'base002003-albino054055-native-registration.png')
    print('Alpha closeup and native-registration comparison written; assets unchanged')

if __name__=='__main__': main()
