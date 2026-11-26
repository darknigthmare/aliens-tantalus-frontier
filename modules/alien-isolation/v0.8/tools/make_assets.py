"""Original vector game assets. Authored shapes; no extracted game art."""
import math,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
D=json.loads((ROOT/'src/content.json').read_text())
def rect(x,y,w,h,fill,rx=2,stroke='#71817c',sw=1):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def line(x,y,x2,y2,c='#95aaa1',w=2):return f'<path d="M{x} {y}L{x2} {y2}" fill="none" stroke="{c}" stroke-width="{w}"/>'
def path(d,f='none',c='#758e89',w=2):return f'<path d="{d}" fill="{f}" stroke="{c}" stroke-width="{w}" stroke-linejoin="round"/>'
def ell(x,y,rx,ry,f,c='none'):return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{f}" stroke="{c}"/>'
def text(x,y,s,size=9,c='#c1cebd'):return f'<text x="{x}" y="{y}" font-family="monospace" font-size="{size}" fill="{c}">{s}</text>'
def screws(x,y,w,h):return ''.join(ell(a,b,2,2,'#bccac1') for a,b in [(x+6,y+6),(x+w-6,y+6),(x+6,y+h-6),(x+w-6,y+h-6)])
def monitor(x,y,w=65,h=45):
 return rect(x,y,w,h,'#2a332f',4)+rect(x+6,y+5,w-12,h-12,'#172e25',3,'#96b78a')+''.join(line(x+11,y+13+j*6,x+w-16-j*4,y+13+j*6,'#83d494',1)for j in range(4))+ell(x+w-9,y+h-5,2,2,'#d8ab62')
def cabinet(x=75,y=44,w=100,h=181,style='cabinet'):
 s=rect(x,y,w,h,'url(#metal)',5)+rect(x+6,y+6,w-12,h-12,'#394641',3)+screws(x,y,w,h)
 if style=='server':
  for j in range(7):s+=rect(x+11,y+12+j*22,w-22,16,'#202b29',1)+line(x+18,y+19+j*22,x+w-23,y+19+j*22,'#567162',1)+ell(x+w-17,y+19+j*22,2,2,'#a9e3a4' if j%2 else '#e0a45c')
 else:
  s+=line(x+w/2,y+10,x+w/2,y+h-10,'#10241e',3)
  for a in [x+14,x+w/2+9]:
   for j in range(4):s+=line(a,y+25+j*5,a+w/2-22,y+25+j*5,'#91a397',1)
  s+=rect(x+w/2-12,y+80,5,26,'#cad2ba')+rect(x+w/2+8,y+80,5,26,'#cad2ba')+text(x+13,y+h-24,'SEEGSON',8)
 return s
svgdefs='<defs><linearGradient id="metal" x2="1" y2="0"><stop stop-color="#24332f"/><stop offset=".32" stop-color="#849488"/><stop offset=".65" stop-color="#4c5e54"/><stop offset="1" stop-color="#1c2a28"/></linearGradient><linearGradient id="amber" x2="0" y2="1"><stop stop-color="#cdb77e"/><stop offset=".5" stop-color="#8e6e44"/><stop offset="1" stop-color="#392f24"/></linearGradient><linearGradient id="glass" x2="1" y2="1"><stop stop-color="#78a69c" stop-opacity=".7"/><stop offset=".35" stop-color="#1b4e47" stop-opacity=".65"/><stop offset="1" stop-color="#071812"/></linearGradient><linearGradient id="shell" x2="1" y2="1"><stop stop-color="#839993"/><stop offset=".2" stop-color="#253d3a"/><stop offset=".5" stop-color="#060e11"/><stop offset=".85" stop-color="#304344"/><stop offset="1" stop-color="#040709"/></linearGradient></defs>'

def prop(kind):
 s=ell(128,232,93,12,'#00000066')
 if kind in ['cabinet','locker','server']:
  s+=cabinet(style='server' if kind=='server' else 'cabinet')
  if kind=='locker':s+=text(108,211,'17',13,'#eacb81')
 elif kind in ['terminal','kiosk','pilot','desk','workbench','counter','table']:
  s+=path('M36 177L194 177L219 215L36 215Z','url(#metal)')+rect(42,214,10,20,'#293c35')+rect(199,213,10,22,'#293c35')
  if kind in ['table','counter','workbench']:s+=path('M23 171L179 171L224 186L48 191Z','url(#amber)')+rect(47,193,155,13,'#394741')
  if kind not in ['table','counter']:
   s+=monitor(70,100,95,66)+path('M70 166L165 166L198 180L49 180Z','#889389')+''.join(line(65,169+j*3,166,169+j*3,'#243d35',1) for j in range(3))
  if kind=='pilot':s+=rect(183,137,36,51,'#594930',8)+rect(180,181,45,13,'#8f7140',6)+line(201,195,201,227,'#97a396',5)
  if kind=='kiosk':s+=text(79,91,'INFORMATION',10)
  if kind=='workbench':s+=line(120,165,150,155,'#d5c28d',6)+ell(58,160,9,4,'#a2845e')
 elif kind in ['case','crate','container']:
  y=140 if kind=='case' else 92 if kind=='crate' else 40
  s+=path(f'M37 {y+20}L195 {y+20}L219 {y+42}L219 226L37 226Z','url(#metal)')+path(f'M37 {y+20}L59 {y}L214 {y}L195 {y+20}Z','#879584')+rect(52,y+33,136,180-y,'#596158',3)
  for xx in [69,166]:s+=rect(xx,y+24,13,200-y,'#a48b56',1)
  s+=rect(91,y+42,57,35,'#d0c6a0',0)+text(97,y+56,'CARGO',10,'#3a4332')+text(95,y+69,'S-028',10,'#3a4332')+rect(109,y+15,31,8,'#232e26')
 elif kind=='bench':
  for xx in [32,86,140]:s+=rect(xx,138,50,50,'url(#amber)',10)+path(f'M{xx} 185L{xx+49} 185L{xx+64} 205L{xx+7} 210Z','url(#amber)')
  s+=line(38,213,212,213,'#9ba28e',6)+line(50,213,45,231,'#596759',8)+line(193,213,202,231,'#596759',8)
 elif kind in ['bed','gurney','cryopod']:
  s+=path('M25 156L167 132L226 171L75 205Z','url(#metal)')+path('M30 146L165 125L218 160L75 185Z','#c5c9ae')+path('M47 143L81 138L116 169L79 177Z','#dedfc8')
  if kind=='cryopod':s+=path('M23 149Q10 61 59 76L173 61Q214 66 224 160L76 192Z','url(#glass)','#9cb3a3',5)+line(72,94,77,183,'#bfd4c5',4)
  else:s+=line(30,155,29,117,'#aeb9a4',3)+line(212,171,216,131,'#aeb9a4',3)+line(26,119,51,116,'#aeb9a4',3)
  for x,y in [(48,201),(191,204),(75,227),(217,198)]:s+=line(x,y-20,x,y,'#7d9987',6)+ell(x,y,8,8,'#1a2722','#879884')
 elif kind=='chair':s+=rect(82,110,78,75,'url(#amber)',15)+path('M83 186L159 186L180 200L78 213Z','url(#amber)')+line(128,210,128,235,'#adb7a4',7)+line(99,235,156,235,'#6c7f70',5)
 elif kind in ['tank','turbine','pump','core']:
  if kind=='core':
   s+=path('M41 59L130 19L217 58L217 195L131 237L41 195Z','url(#metal)')+path('M58 70L127 41L197 72L197 183L128 214L58 180Z','url(#glass)')
   for j in range(5):s+=path(f'M59 {88+j*21}L127 {62+j*21}L196 {88+j*21}','none','#9daa7f',3)
   s+=text(95,152,'APOLLO',14,'#d7eccc')
  else:
   s+=rect(65,65,130,161,'url(#metal)',23)+ell(130,65,65,21,'#91a18d','#b4bba3')+ell(130,221,65,14,'#2f4538','#92a98b')
   for j in range(5):s+=line(74,100+j*22,185,100+j*22,'#203c32',4)
   s+=rect(119,96,22,83,'url(#glass)',4)+ell(130,197,17,17,'#c3c6a1','#50694b')+line(130,197,138,185,'#813c2a',2)
   if kind in ['pump','turbine']:s+=path('M65 175L26 175L26 217L54 217','none','#688577',24)+ell(195,135,35,62,'#263e35','#8b9c82')+ell(195,135,25,43,'#1f2727','#9d9882')
 elif kind in ['shelf','vending','water']:
  s+=cabinet(53,32,150,194,'server' if kind=='water' else 'cabinet')
  s+=rect(68,49,116,130,'#1a2724',3)
  for j in range(4):
   for i in range(4):s+=rect(76+i*25,59+j*28,15,21,['#ac8252','#809b8e','#b8b48c','#7d6553'][(i+j)%4],3)
   s+=line(71,82+j*28,181,82+j*28,'#9cafa0',2)
  s+=rect(79,197,70,14,'#152a22',1)+text(79,190,'SEEGSON',10)
 elif kind in ['cart','trolley','forklift']:
  s+=path('M27 201L190 177L225 205L62 233Z','url(#metal)')+line(46,210,32,118,'#91a292',6)+line(32,118,79,113,'#91a292',6)
  for x,y in [(66,232),(196,219)]:s+=ell(x,y,12,12,'#192622','#9ba48d')
  if kind=='forklift':s+=rect(97,116,102,90,'url(#amber)',4)+line(87,211,78,63,'#d3bd7f',9)+line(65,59,141,59,'#d3bd7f',9)+rect(125,91,27,36,'#4b4f3c')
  else:
   s+=rect(73,151,70,42,'#94785a',7)+rect(141,135,37,67,'#5a6b5c',5)
 elif kind=='spool':s+=ell(88,180,42,52,'url(#metal)','#a5b49c')+rect(88,132,74,92,'#283b30')+ell(162,180,43,52,'url(#metal)','#a5b49c')+ell(162,180,14,19,'#15281e')+''.join(line(113,145+j*6,127,148+j*6,'#9d8963',2) for j in range(12))
 elif kind=='barrier':s+=line(32,229,32,128,'#9da992',7)+line(219,229,219,128,'#9da992',7)+rect(23,133,205,39,'#c6ad68',1)+''.join(path(f'M{x} 133L{x+24} 133L{x+7} 172L{x-17} 172Z','#374331','none')for x in range(43,220,44))+line(31,184,220,184,'#9da992',4)
 elif kind=='pipe':
  s+=path('M22 224L22 73Q22 50 46 50L173 50Q203 50 203 83L203 229','none','#293d32',28)+path('M22 222L22 73Q22 50 46 50L173 50Q203 50 203 83L203 224','none','#7f9582',19)
  for x in [65,125,170]:s+=rect(x,35,13,29,'#adb39a',1)
  s+=ell(204,133,21,21,'none','#baac71')+line(185,133,224,133,'#baac71',4)
 elif kind=='fan':
  s+=rect(35,40,187,187,'url(#metal)',12)+ell(128,134,75,75,'#152b25','#a0aa91')
  for a in range(0,360,90):s+=f'<g transform="rotate({a} 128 134)">'+path('M125 126Q93 53 81 83Q76 119 119 140Z','#8b9e8b')+'</g>'
  s+=ell(128,134,15,15,'#294739','#adc0a7')+screws(35,40,187,187)
 elif kind=='relay':s+=rect(67,90,121,139,'url(#metal)',5)+monitor(82,103,90,44)+rect(91,164,62,42,'#282e27')+line(100,181,147,170,'#d9ba75',8)+text(86,220,'POWER',10)+screws(67,90,121,139)
 elif kind=='save':s+=rect(92,44,84,184,'#a59a73',9)+rect(102,61,64,62,'#303f30',3)+rect(110,70,48,41,'#a3cb8a',4)+rect(108,137,18,61,'#514e34',6)+path('M135 137Q158 151 139 164Q151 186 140 200','none','#1a2922',4)+text(100,213,'SAVE',10,'#222e22')+ell(156,183,5,5,'#c3e6a4')
 elif kind=='poster':s+=rect(51,70,155,151,'#bfc5a3',1)+text(64,96,'SEEGSON',19,'#43573d')+path('M72 136L111 115L148 151L172 127','none','#6c804e',8)+text(67,179,'TOMORROW',15,'#516348')+text(71,198,'TOGETHER',14,'#516348')
 elif kind=='light':s+=rect(20,181,220,28,'#1a2923',3)+rect(29,186,202,14,'#d5e8c5',3,'#839d80')+rect(36,182,4,24,'#6a7b69')+rect(215,182,4,24,'#6a7b69')
 elif kind=='suit':s+=rect(81,26,101,205,'#273b33',4)+ell(131,62,29,30,'#9f9d7b','#d0c6a0')+ell(131,62,21,18,'url(#glass)')+path('M106 91L154 91L171 150L154 160L149 136L149 212L133 218L129 166L123 216L105 212L108 137L99 159L83 151Z','url(#amber)')+rect(113,104,30,32,'#546958')
 elif kind=='iv':s+=line(130,228,130,48,'#a5b99c',5)+line(94,49,161,49,'#a5b99c',4)+rect(99,56,29,45,'url(#glass)',6)+path('M112 104Q113 151 150 175L151 219','none','#becbae',2)+line(107,229,154,229,'#a5b99c',4)
 elif kind=='radio':s+=rect(55,133,152,93,'url(#metal)',5)+monitor(67,145,72,49)+ell(175,166,14,14,'#293e31','#c3c5a6')+ell(177,205,9,9,'#354734','#c3c5a6')+line(66,131,51,61,'#c2c9ae',3)
 elif kind=='bars':s+=rect(19,38,220,191,'#19251e',2)+''.join(line(x,43,x,229,'#919c80',7) for x in range(29,239,30))+line(20,161,239,161,'#919c80',6)
 elif kind=='rock':s+=path('M11 223L32 139L82 101L106 47L178 82L203 139L246 222Z','#3c4440','#737b6c',2)+path('M32 139L103 114L106 47L146 143L203 139L171 175L180 225L111 180L67 216Z','#576255','#5a6657',1)
 elif kind in ['rib','resin']:
  for i in range(5):s+=path(f'M{44+i*12} 230Q{27+i*9} 150 {80+i*8} 67Q130 20 {202-i*11} {48+i*6}Q{166-i*5} 85 {148-i*10} 142L{156-i*12} 228','none','#192d29',15)+path(f'M{44+i*12} 230Q{27+i*9} 150 {80+i*8} 67Q130 20 {202-i*11} {48+i*6}','none','#4b6658',3)
 elif kind=='egg':s+=path('M77 220Q48 162 93 91L103 76L125 96L141 72L159 96Q204 167 174 221Q127 248 77 220Z','url(#shell)','#576858',3)+path('M103 76L111 138M141 72L132 141M158 99L132 141L150 216','none','#86977b',3)+path('M98 161L86 208M146 163L169 204','none','#6d795f',2)
 elif kind=='androidrack':s+=rect(72,28,112,201,'url(#metal)',4)+rect(83,42,90,173,'#132720',4)+ell(129,70,18,24,'#bbc6af')+path('M104 97L155 97L170 159L153 166L144 126L146 177L156 219L138 224L128 183L116 223L98 216L111 169L113 126L99 161L88 158Z','#a88651','#c0ad81',2)+ell(122,71,3,2,'#cfddbd')+ell(136,71,3,2,'#cfddbd')
 elif kind in ['gantry','antenna']:
  s+=path('M26 228L96 46L159 46L230 228M50 226L124 66L203 226M70 172L189 172M83 125L171 125','none','#657d6b',12)
  if kind=='antenna':s+=path('M37 44Q122 153 219 43Q140 11 37 44Z','url(#metal)')+line(125,96,128,8,'#c4c7a9',4)+ell(129,11,5,5,'#dba169')
 elif kind=='planter':s+=path('M77 153L178 153L163 229L92 229Z','url(#metal)')+''.join(path(f'M128 160Q{70+i*25} 96 {50+i*30} {65+(i%3)*20}','none','#557b55',10)for i in range(6))
 else:raise ValueError(kind)
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">'+svgdefs+s+'</svg>'
for kind in D['footprints']:(ROOT/'assets/props'/f'{kind}.svg').write_text(prop(kind))

def person(kind,frame=0,pose='walk'):
 phase=math.sin(frame*math.pi/4); crouch=pose=='crouch'; off=45 if crouch else 0
 s=ell(121,301,59,7,'#00000077')
 if kind=='alien':
  # Long dome, digitigrade hind legs, dorsal tubes and articulated tail.
  s+=path(f'M107 190Q48 {220+phase*10} 29 264Q7 294 43 283Q70 275 71 {264+phase*6}','none','#13282a',14)+path(f'M107 190Q48 {220+phase*10} 29 264Q7 294 43 283','none','#6d8780',2)
  for x in [87,101,115]:s+=path(f'M{x} 128Q{x-22} 58 {x-12} 67L{x+8} 117','none','#1a3334',9)+path(f'M{x-7} 94L{x} 119','none','#8b9b88',2)
  s+=path(f'M113 191L{90+phase*12} 236L{97-phase*13} 272L{78-phase*13} 294L{126-phase*13} 299L{118-phase*13} 286L{126+phase*8} 247L145 207','url(#shell)','#536f68',2)
  s+=path(f'M136 190L{159-phase*12} 241L{143+phase*11} 277L{141+phase*11} 296L{178+phase*11} 299L{165+phase*11} 287L{185-phase*8} 242L156 193','url(#shell)','#758b7d',2)
  s+=path('M106 103Q150 90 164 128L150 197Q126 223 97 194L89 157Z','url(#shell)','#829288',2)
  for j in range(7):s+=path(f'M101 {130+j*8}Q127 {153+j*7} 154 {132+j*8}','none','#799486',2)
  s+=path(f'M103 118L{83-phase*12} 159L{109-phase*20} 211L{127-phase*20} 212L{113-phase*20} 220L{99-phase*20} 215L{65-phase*12} 163L81 123','url(#shell)')
  s+=path(f'M152 116L{178+phase*10} 151L{182+phase*17} 207L{204+phase*17} 210L{188+phase*17} 218L{172+phase*17} 210L{156+phase*10} 159L133 130','url(#shell)')
  s+=path('M91 101Q45 78 51 54Q62 31 122 40Q184 44 195 75Q195 93 173 98L146 114L122 109Z','url(#shell)','#81978e',2)+path('M66 54Q130 38 178 65','none','#afc0b2',2)+path('M145 103L167 100L172 114L145 120Z','#19292a')+''.join(line(x,105,x+1,115,'#d0d4b6',2)for x in range(148,170,4))
 else:
  jacket={'amanda':'#65827c','marlow':'#8e7657','joe':'#b08a52','human':'#635742'}[kind]; skin='#c4b798' if kind!='joe' else '#c6d3c2'; hair='#473c2d'; leg='#52594c'
  # Far limbs first.
  s+=path(f'M116 {202+off*.2}L{97+phase*14} {248+off*.2}L{102-phase*20} 291L{88-phase*20} 300L{118-phase*20} 302L{128+phase*14} 251L143 209Z',leg,'#283c34',2)
  s+=path(f'M136 {205+off*.2}L{152-phase*14} {248+off*.2}L{139+phase*20} 292L{137+phase*20} 301L{168+phase*20} 301L{160+phase*20} 291L{174-phase*14} 247L154 206Z','#697062','#283c34',2)
  s+=path(f'M101 {123+off}Q131 {113+off} 155 {131+off}L156 {206+off*.2}L113 {217+off*.1}L99 {178+off*.5}Z',jacket,'#2c443c',2)
  s+=line(128,134+off,137,197+off*.2,'#bec3a3',3)+rect(137,151+off,15,22,'#7c9790',2)+rect(100,194+off*.25,61,10,'#403e2a')+rect(115,196+off*.25,10,7,'#b9b58f')
  s+=path(f'M108 {130+off}L{88-phase*12} {169+off*.7}L{109-phase*23} {209+off*.3}L{121-phase*23} {205+off*.3}L{106-phase*12} {166+off*.7}L127 {133+off}Z',jacket,'#2a3c33',2)
  s+=ell(115-phase*23,210+off*.3,7,10,skin)
  s+=path(f'M148 {133+off}L{172+phase*12} {172+off*.6}L{158+phase*20} {211+off*.25}L{147+phase*20} {207+off*.25}L{154+phase*12} {167+off*.6}L134 {137+off}Z',jacket,'#2a3c33',2)+ell(155+phase*20,212+off*.25,7,9,skin)
  s+=rect(121,109+off,17,19,skin,4,'#857e61')+path(f'M113 {80+off}Q131 {64+off} 146 {87+off}L147 {100+off}L154 {105+off}L145 {110+off}Q139 {127+off} 119 {114+off}Z',skin,'#686854',2)
  if kind!='joe':s+=path(f'M112 {102+off}Q100 {67+off} 123 {68+off}Q148 {65+off} 150 {88+off}L132 {82+off}L122 {94+off}L121 {112+off}Z',hair,'#6d644b',2)
  if kind=='amanda':s+=path(f'M113 {84+off}Q88 {93+off} 96 {126+off}L111 {116+off}Q102 {102+off} 118 {98+off}',hair,'#766747',2)
  s+=line(141,96+off,146,96+off,'#151e18' if kind!='joe' else '#f4e8b7',2)
  s+=line(147,107+off,151,108+off,'#9b8e74',1)
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 320">'+svgdefs+s+'</svg>'
for kind in ['amanda','marlow','joe','human','alien']:
 for pose in (['walk','crouch'] if kind=='amanda' else ['walk']):
  for i in range(8):(ROOT/'assets/characters'/f'{kind}_{pose}_{i}.svg').write_text(person(kind,i,pose))
# EVA: same eight-frame gait and crouch animation, with closed visor and pressure pack.
# These are original SVG variants, not extracted/photorealistic suits.
for pose in ['walk','crouch']:
 for i in range(8):
  off=45 if pose=='crouch' else 0
  svg=person('amanda',i,pose).replace('#65827c','#b2b095').replace('#52594c','#8f9887').replace('#697062','#c0bea4').replace('#c4b798','#a8af97')
  pack=rect(77,127+off,34,69-off*.3,'#6d8275',7,'#c7cbb0',3)+rect(80,142+off,9,37,'#273f36',2)+line(85,126+off,85,116+off,'#9fa88e',4)
  svg=svg.replace('</defs>','</defs>'+pack,1)
  helmet=ell(134,94+off,37,40,'#c6c4a8','#6e8a79')+ell(143,93+off,28,28,'#163837','#8fa999')+path(f'M128 {75+off}Q143 {67+off} 160 {81+off}','none','#acbeab',3)+path(f'M129 {112+off}Q146 {118+off} 163 {105+off}','none','#74998c',2)+rect(107,125+off,56,10,'#687f6d',3,'#bbc6a6',2)+rect(154,140+off,13,25,'#324d3b',2)+ell(162,147+off,2,2,'#cce6ad')
  svg=svg.replace('</svg>',helmet+'</svg>')
  (ROOT/'assets/characters'/f'eva_{pose}_{i}.svg').write_text(svg)

# Small hive parasite. A readable eight-legged silhouette, not a circle.
s=ell(120,210,70,9,'#0008')+path('M114 173Q33 117 28 175Q26 195 48 205','none','#9b8e64',9)
for side in [-1,1]:
 for i in range(4):s+=path(f'M{123+side*6} {155+i*9}L{123+side*(34+i*5)} {151+i*10}L{123+side*(53+i*9)} {178+i*12}L{123+side*(56+i*8)} {214+i*2}','none','#9b9873',5)
s+=ell(123,168,24,34,'#c1b285','#6c7355')
(ROOT/'assets/characters/facehugger.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">'+s+'</svg>')
assets={}
for p in sorted((ROOT/'assets').rglob('*.svg')):assets[str(p.relative_to(ROOT/'assets'))]=p.read_text()
(ROOT/'src/assets.js').write_text('export const ART = '+json.dumps(assets,separators=(',',':'))+';\n')
print('Assets:',len(assets),'separate original SVGs')
