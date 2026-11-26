#!/usr/bin/env python3
"""Build self-contained HTML documents from current data and recorded browser evidence.
Report pictures are compressed copies of original, unmodified runtime screenshots.
Codex diagrams are explicitly labelled data schematics, not gameplay screenshots.
"""
from pathlib import Path
import json,base64,html,io,re
import mistune
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
D=json.loads((ROOT/'data/campaign.json').read_text());VERSION=D['meta']['version']
md=mistune.create_markdown(escape=True,plugins=['table'])
CSS='''*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#101e26;color:#d7e3df;font:16px/1.7 Arial,sans-serif}header{padding:58px max(5vw,24px);border-bottom:1px solid #58777b;background:linear-gradient(120deg,#24434c,#132934)}.eyebrow{color:#d4bd8b;letter-spacing:3px;font-size:11px}h1{font-size:clamp(31px,4.5vw,60px);line-height:1.08;font-weight:400;max-width:1030px;letter-spacing:-1px}h2{color:#dec99e;font-size:29px;margin:45px 0 18px;font-weight:400}h3{font-size:23px;color:#c1d6d1;margin-top:37px}main{max-width:1260px;padding:20px 32px 75px;margin:auto}a{color:#e0c88c;overflow-wrap:anywhere}nav{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}nav a{padding:9px 14px;border:1px solid #759894;text-decoration:none}.tag{display:inline-block;background:#354544;color:#edd9ab;padding:5px 12px;font-size:12px;border:1px solid #a19c72}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin:30px 0}.stats article{padding:20px;border:1px solid #536d70;background:#1a3139}.stats strong{display:block;font-size:32px;color:#e1ca92}.stats span{font-size:13px;color:#b4ceca}section{scroll-margin-top:20px}.note{padding:18px 22px;border-left:3px solid #c4ac72;background:#243b42;font-size:14px}code{font-size:.88em;background:#254049;padding:2px 4px;overflow-wrap:anywhere}pre{white-space:pre-wrap;padding:20px;background:#203841}table{display:block;overflow:auto;width:100%;border-collapse:collapse;font-size:13px;line-height:1.5;margin:22px 0 30px}td,th{padding:10px 13px;text-align:left;vertical-align:top;border:1px solid #40636c;min-width:85px}th{background:#27464e;color:#e4d4b0}tr:nth-child(even){background:#172e37}figure{margin:32px 0 44px;border:1px solid #547279;background:#162b34}figure img{width:100%;height:auto;display:block}figure.phone img{width:auto;max-width:100%;max-height:830px;margin:auto}figcaption{padding:17px 20px;font-size:14px;color:#b3cfca}details{margin:25px 0;border:1px solid #58777b;padding:16px 20px;background:#182f37}summary{cursor:pointer;color:#e2c993}footer{padding:28px 6vw;font-size:12px;color:#9dbab6;border-top:1px solid #3d5964}.cards{display:grid;grid-template-columns:1fr 1fr;gap:18px}.cards article{border:1px solid #446774;padding:20px;background:#172e37}.cards article h3{margin:0 0 12px}@media(max-width:700px){body{font-size:15px}header{padding:32px 22px}main{padding:16px}.stats{grid-template-columns:1fr 1fr;gap:10px}.stats article{padding:14px}.cards{grid-template-columns:1fr}h2{font-size:25px}table{font-size:12px}}'''
CSS+='''.schematic{margin:18px 0 28px;border:1px solid #517582;background:#10252d;padding:14px}.schematic svg{width:100%;height:auto;display:block}.schematic figcaption{font-size:12px;padding:8px 4px;color:#9ebfba}.mini{font-size:12px;color:#a5bfb9}.roomlinks{display:flex;gap:8px;flex-wrap:wrap}.roomlinks a{font-size:12px;border:1px solid #54717a;padding:4px 8px;text-decoration:none}.sub{color:#9dbcb8;max-width:880px}.sticky{position:sticky;top:0;z-index:4;background:#0d202aeF;padding:10px 20px;border-bottom:1px solid #486874;display:flex;gap:18px;flex-wrap:wrap;font-size:12px}.sticky a{text-decoration:none}@media print{.sticky,nav{display:none}body{background:white;color:#172021}h1,h2,h3,a{color:#172021}table{display:table;font-size:9px}figure{break-inside:avoid}}'''
CSS+="h3[id]{scroll-margin-top:70px} td,th{overflow-wrap:anywhere} h1{overflow-wrap:normal}"
def page(title,header,body):
 return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+html.escape(title)+'</title><style>'+CSS+'</style></head><body>'+header+'<main>'+body+'</main><footer>ALIEN : LA MER DES CHAGRINS · '+VERSION+' · Prototype autonome non officiel. Aucun déploiement ou adaptateur natif du jeu hôte.</footer></body></html>'

def schematic(r):
 """Coordinates of the hybrid room variant, independent of camera framing."""
 sx=lambda x:30+x/r['width']*940
 sy=lambda z:40+z*195
 parts=['<rect x="20" y="38" width="960" height="185" fill="#132c34" stroke="#345860"/>']
 parts+=['<path d="M 20 147 H 980" stroke="#75958d" stroke-dasharray="5 7" opacity=".5"/>']
 if r['mode']=='SIDE':parts+=['<text x="31" y="250" fill="#9fbcb7" font-size="11">Bande latérale unique ; éléments de fond hors de la voie.</text>']
 for o in r['obstacles']:
  parts.append(f'<rect x="{sx(o["x"]-o["w"]/2):.2f}" y="{sy(o["z"]-o["d"]/2):.2f}" width="{o["w"]/r["width"]*940:.2f}" height="{o["d"]*195:.2f}" fill="#55727a" stroke="#93aaa4"/>')
 for h in r['hazards']:
  z=.55 if r['mode']=='SIDE'else h['z'];dep=.12 if r['mode']=='SIDE'else h['d']
  parts.append(f'<rect x="{sx(h["x"]-h["w"]/2):.2f}" y="{sy(z-dep/2):.2f}" width="{h["w"]/r["width"]*940:.2f}" height="{dep*195:.2f}" fill="#986238" fill-opacity=".48" stroke="#d9a56e" stroke-dasharray="6 4"/>')
 for d in r['doors']:
  z=.55 if r['mode']=='SIDE'else d['z'];x=sx(d['x']);y=sy(z)
  parts.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="6" fill="#a8c8be"/><text x="{max(40,min(958,x)):.2f}" y="{y-13:.2f}" text-anchor="middle" fill="#d5e3d9" font-size="11">{d["to"].upper()}</text>')
  if d.get('pursuitAllowed'):parts.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="9" fill="none" stroke="#e7ad6d" stroke-width="1.5"/>')
 for a in r['interactables']:
  z=.55 if r['mode']=='SIDE'else a['z'];x=sx(a['x']);y=sy(z)
  parts.append(f'<path d="M {x:.2f} {y-6:.2f} l 6 6 -6 6 -6 -6 Z" fill="#efd49b"/>')
 for a in r['devices']:
  z=.55 if r['mode']=='SIDE'else a['z'];x=sx(a['x']);y=sy(z)
  parts.append(f'<rect x="{x-4:.2f}" y="{y-4:.2f}" width="8" height="8" fill="#86a8c8"/>')
 for gate in r['shutters']:
  x=sx(gate['x']);parts.append(f'<rect x="{x-4:.2f}" y="57" width="8" height="166" fill="#c89570" stroke="#f0cc97"/><text x="{x:.2f}" y="246" fill="#dec194" font-size="10" text-anchor="middle">CLOISON</text>')
  for px in [gate['x']-105,gate['x']+105]:parts.append(f'<rect x="{sx(px)-4:.2f}" y="{sy(.55)-4:.2f}" width="8" height="8" fill="#b1d6cf"/>')
 for echo in r['echoes']:
  x=sx(echo['x']);y=sy(.55 if r['mode']=='SIDE'else echo['z']);parts.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="9" fill="none" stroke="#d2b8e0" stroke-width="2"/><text x="{x:.2f}" y="{y+25:.2f}" fill="#d2b8e0" font-size="10" text-anchor="middle">LECTURE</text>')
 if r.get('lighting'):
  l=r['lighting'];x=sx(l['x']);y=sy(l['z']);parts.append(f'<g data-lux="{l["id"]}"><rect x="{x-6:.2f}" y="{y-10:.2f}" width="12" height="20" fill="#dcd5a0"/><text x="{x:.2f}" y="{y-17:.2f}" text-anchor="middle" fill="#e5d6a7" font-size="10">LUX</text></g>')
 for l in r.get('lockers',[]):
  x=sx(l['x']);y=sy(.55 if r['mode']=='SIDE' else l['z'])
  parts.append(f'<g data-locker="{l["id"]}"><rect x="{x-7:.2f}" y="{y-7:.2f}" width="14" height="14" rx="2" fill="#bfcb98" stroke="#e5e6b4"/><text x="{x:.2f}" y="{y+28:.2f}" text-anchor="middle" fill="#d9deb0" font-size="10">STOCK {l["id"][-2:]}</text></g>')
 parts.append(f'<text x="30" y="25" fill="#d4ded2" font-size="12">{r["id"].upper()} · {r["mode"]} · largeur {r["width"]} unités</text>')
 label='Schéma de données — variante hybride. Gris : obstacles ; ambre : dangers ; cercles : seuils (anneau orange : poursuite autorisée) ; losanges : objectifs ; carrés bleus : dispositifs. Orange vertical : cloison (position, pas état de partie) ; anneau mauve : lecture facultative. Le plan de production montre tous les points ; la carte du joueur ne les révèle pas tous. LUX : pupitre d’éclairage local. STOCK : point d’accès au casier, pas sa position graphique au mur. Pas une capture du jeu.'
 return '<figure class="schematic"><svg viewBox="0 0 1000 264" role="img" aria-label="'+html.escape(r['name'],quote=True)+' — schéma de données">'+''.join(parts)+'</svg><figcaption>'+label+'</figcaption></figure>'

