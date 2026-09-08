"""Render and measure the normalized Prowler; diagnostic outputs only."""
import hashlib
import json
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
ID='enemy-015-prowler'

def main():
    metadata=json.loads((ROOT/f'assets/openai/sprites/metadata/v66/{ID}.json').read_text())
    path=ROOT/metadata['normalized'];digest=hashlib.sha256(path.read_bytes()).hexdigest()
    assert digest==metadata['normalizedSha256']
    atlas=Image.open(path).convert('RGBA')
    out=Image.new('RGB',(1024,8*278),'#213842');d=ImageDraw.Draw(out);metrics=[]
    for i,p in enumerate(metadata['placements']):
        x,y=i%4*256,i//4*256
        cell=atlas.crop((x,y,x+256,y+256));rgba=np.asarray(cell,dtype=np.int16)
        r,g,b,a=(rgba[...,k] for k in range(4))
        strict=(a>=16)&(r>160)&(b>160)&(np.minimum(r,b)>g+35)
        broad=(a>=16)&(r>70)&(b>70)&(np.minimum(r,b)>g+35)
        bounds=cell.getchannel('A').getbbox()
        plane=Image.new('RGBA',cell.size,'#647c83');plane.alpha_composite(cell)
        out.paste(plane.convert('RGB'),(x,i//4*278+22))
        d.text((x+6,i//4*278+5),f'{p["clip"]} {i%8+1} / ground gap {240-bounds[3]}px',fill='white')
        d.line((x+16,i//4*278+262,x+240,i//4*278+262),fill='#70ff9e')
        metrics.append(dict(index=i,clip=p['clip'],frame=i%8,opaqueBounds=list(bounds),groundClearance=240-bounds[3],
            strictMagentaPixels=int(strict.sum()),broadVioletPixels=int(broad.sum()),renderedAnchor=p['renderedAnchor']))
    out.save(HERE/'normalized-contact.png')
    detail=Image.new('RGB',(1024,1080),'#213842');dd=ImageDraw.Draw(detail)
    for n,index in enumerate([0,8,20,31]):
        cell=atlas.crop((index%4*256,index//4*256,index%4*256+256,index//4*256+256))
        plane=Image.new('RGBA',cell.size,'#647c83');plane.alpha_composite(cell)
        plane=plane.resize((512,512),Image.Resampling.NEAREST).convert('RGB');pd=ImageDraw.Draw(plane)
        for p in range(64,241,16):
            pd.line((p*2,0,p*2,512),fill='#819397',width=1)
            pd.line((0,p*2,512,p*2),fill='#819397',width=1)
            pd.text((p*2+2,2),str(p),fill='white');pd.text((2,p*2+2),str(p),fill='white')
        pd.line((256,0,256,512),fill='#ffff68',width=2);pd.line((0,480,512,480),fill='#70ff9e',width=2)
        detail.paste(plane,(n%2*512,n//2*540+28));dd.text((n%2*512+8,n//2*540+8),f'Atlas frame {index}, native coordinates, x2 nearest',fill='white')
    detail.save(HERE/'body-measurement-grid.png')
    (HERE/'normalized-metrics.json').write_text(json.dumps(dict(schema=1,profileId=ID,atlasSha256=digest,packScale=metadata['placements'][0]['scale'],
        sourceScaleByClip=metadata['sourceScaleByClip'],frames=metrics,note='Broad violet includes rust material shading and is not an automatic rejection. Native cell metrics, not a claim that the complete tail bbox is the gameplay body.'),indent=2)+'\n')
    print(json.dumps(dict(atlasSha256=digest,packScale=metadata['placements'][0]['scale'],strictMagenta=sum(m['strictMagentaPixels'] for m in metrics),
        broadViolet=sum(m['broadVioletPixels'] for m in metrics),attackGroundClearance=[m['groundClearance'] for m in metrics if m['clip']=='attack'])))

if __name__=='__main__': main()
