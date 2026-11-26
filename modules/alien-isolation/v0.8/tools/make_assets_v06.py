"""Original SVG variants for the two contacts. No raster images or external assets."""
from pathlib import Path
import json,runpy
R=Path(__file__).resolve().parents[1]
base=runpy.run_path(str(R/'tools/make_assets.py'))
person=base['person'];rect=base['rect'];ell=base['ell'];path=base['path'];line=base['line'];text=base['text']
for who in ['nora','elias']:
 for pose in ['walk','crouch']:
  for frame in range(8):
   off=45 if pose=='crouch' else 0
   svg=person('amanda' if who=='nora' else 'human',frame,pose)
   if who=='nora':
    svg=svg.replace('#65827c','#b3cbbb').replace('#52594c','#435d5a').replace('#473c2d','#322a2d')
    detail=rect(120,145+off,18,25,'#30565a',2)+text(123,161+off,'NV',7,'#dce8cb')
    detail+=rect(83,189+off*.4,27,25,'#628a7f',4)+line(88,199+off*.4,103,199+off*.4,'#d5dfc7',3)+line(95,192+off*.4,95,205+off*.4,'#d5dfc7',3)
    detail+=path(f'M105 {132+off}L143 {135+off}','none','#e1e8ce',4)
   else:
    svg=svg.replace('#635742','#bc9360').replace('#52594c','#485556').replace('#473c2d','#282b29')
    detail=path(f'M107 {134+off}L142 {191+off*.2}M152 {136+off}L119 {190+off*.2}','none','#364949',7)
    detail+=rect(90,186+off*.3,25,33,'#615a3e',3)+line(98,182+off*.3,98,212+off*.3,'#d3cfb3',4)
    detail+=path(f'M109 {83+off}Q121 {58+off} 145 {80+off}L153 {88+off}L110 {89+off}Z','#7b9791','#384e4b',2)
    detail+=rect(133,92+off,18,8,'#203d3d',3,'#e1c57e')+rect(144,148+off,16,24,'#dee0b9',1)+text(147,163+off,'EK',7,'#3d534b')
   svg=svg.replace('</svg>',detail+'</svg>')
   (R/'assets/characters'/f'{who}_{pose}_{frame}.svg').write_text(svg)
 # Bust icon: drawn separately for legibility, not a crop of a gameplay screenshot.
 nurse=who=='nora';jacket='#abc7b7' if nurse else '#bb905c';skin='#bea78a' if nurse else '#bcaa84'
 s=rect(0,0,240,240,'#112e28',8)+path('M0 211L240 146L240 240L0 240Z','#27463e')
 s+=path('M39 240L51 172Q72 142 96 150L145 149Q187 150 195 177L210 240Z',jacket,'#5e8074',3)
 s+=rect(101,126,37,40,skin,6)+ell(122,96,43,53,skin,'#5a6957')
 s+=path('M78 105Q58 39 115 38Q170 37 167 79L136 65L94 75L91 112Z','#302f2d' if nurse else '#242d2d','#5b6c59',3)
 if nurse:s+=path('M84 64Q43 92 74 154L97 130Q74 116 89 94Z','#302f2d')+rect(137,183,23,31,'#315a57',2)+text(140,203,'NV',10)
 else:s+=path('M78 57Q123 12 168 61L180 76L73 76Z','#8eaaa0','#4a7068',4)+rect(91,83,66,17,'#284b47',7,'#c5bd94')+line(56,179,164,239,'#3a514b',13)+line(182,177,98,239,'#3a514b',13)
 if nurse:s+=line(101,92,112,92,'#233d32',3)+line(140,92,150,92,'#233d32',3)
 s+=path('M124 100L119 115L130 116','none','#897f67',2)+line(112,128,137,128,'#766e57',2)
 s+=rect(12,12,39,24,'#779b84',3)+text(17,29,'MED' if nurse else 'ENG',12,'#0e2a22')
 (R/'assets/characters'/f'{who}_portrait.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">'+s+'</svg>')
for kind in ['medical_pack','engineering_pack','clinic_console','engineering_console']:
 med=kind.startswith('medical') or kind.startswith('clinic');pack=kind.endswith('pack')
 color='#9bb8a5' if med else '#b29b68'
 if pack:
  s=ell(128,232,75,10,'#0007')+rect(40,130,176,97,'#27483c',10,'#7b9d86',4)+rect(47,136,162,38,color,6)+rect(90,114,69,20,'none',5,color,5)
  s+=rect(65,133,13,92,'#36574b',2)+rect(178,133,13,92,'#36574b',2)+rect(100,177,58,33,'#d0d7b3',4)
  s+=text(104,199,'MED' if med else 'EVA',17,'#2e4b3b')+rect(68,155,7,18,'#d4d5b6')+rect(181,155,7,18,'#d4d5b6')
 else:
  s=ell(128,232,95,12,'#0007')+path('M43 228L43 99L206 99L218 227Z','#436553','#aec0a0',3)
  s+=rect(65,45,133,83,'#8ca38e',7)+rect(74,53,114,62,'#173e31',3,'#c0d1ad',2)
  s+=path('M80 88L100 88L110 67L121 103L133 79L146 90L177 90','none','#bcd9ae',3) if med else text(89,92,'O2 / EVA',17,'#c3d2ae')
  s+=rect(74,142,118,58,color,5)+text(83,165,'CLINIQUE' if med else 'ATELIER',13,'#253e30')+text(91,185,'SERVICE',11,'#34523d')
 (R/'assets/props'/f'{kind}.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">'+s+'</svg>')
assets={str(p.relative_to(R/'assets')):p.read_text() for p in sorted((R/'assets').rglob('*.svg'))}
(R/'src/assets.js').write_text('export const ART = '+json.dumps(assets,separators=(',',':'))+';\n')
print('v06 Assets:',len(assets))
