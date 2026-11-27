#!/usr/bin/env python3
"""Verify the actual v0.9 package sources, documents, evidence and reproducible build."""
from pathlib import Path
from html.parser import HTMLParser
import base64,hashlib,json,re,shutil,subprocess,sys,tempfile,traceback
R=Path(__file__).resolve().parents[1]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
read=lambda n:json.loads((R/n).read_text(encoding='utf-8'))
checks=[]
def check(name,cond):
 if not cond: raise AssertionError(name)
 checks.append({'name':name,'passed':True})
class Images(HTMLParser):
 def __init__(self):super().__init__();self.images=[]
 def handle_starttag(self,tag,attrs):
  if tag=='img':self.images.append(dict(attrs))
result={'version':'0.9.0-candidate.1'}
try:
 d=read('docs/CONTENT_MANIFEST.json');counts=d['manifest']['counts']
 check('Version du contenu',d['manifest']['version']==result['version'])
 check('Version du paquet',read('package.json')['version']==result['version'])
 jsjson=subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./src/river-of-pain/data.js')))"],cwd=R,text=True)
 check('Données exécutées identiques au manifeste JSON',json.loads(jsjson)==d)
 rooms={r['id']:r for r in d['rooms']}
 check('47 identifiants de pièces distincts',len(rooms)==len(d['rooms'])==47)
 edges=set();endpoints=[]
 for r in d['rooms']:
  for p in r['portals']:
   endpoints.append(p['id'])
   check('Retour et support · '+p['id'],p['to'] in rooms and
     any(t['to']==r['id'] and t['id']==p['architecture']['reciprocal'] for t in rooms[p['to']]['portals'])
     and p['architecture']['support'] and p['architecture']['approachX']==p['x'] and p['architecture']['approachZ']==p['z'])
   edges.add(tuple(sorted([r['id'],p['to']])))
 check('64 liens / 128 extrémités uniques',len(edges)==64 and len(endpoints)==len(set(endpoints))==128)
 seen={'pad'};todo=['pad']
 while todo:
  rid=todo.pop()
  for p in rooms[rid]['portals']:
   if p['to'] not in seen:seen.add(p['to']);todo.append(p['to'])
 check('Graphe connexe, sans contourner les droits dans le jeu',len(seen)==47)
 check('49 objectifs de 16 chapitres',len(d['chapters'])==16 and sum(len(c['objectives']) for c in d['chapters'])==49)
 check('Toutes les cibles appartiennent au graphe',all(o['room'] in rooms for c in d['chapters'] for o in c['objectives']))
 check('547 placements dérivés',sum(len(r['props']) for r in d['rooms'])==counts['props']==547)
 check('74 couvertures dérivées',sum(len(r.get('cover',[])) for r in d['rooms'])==counts['physicalCovers']==74)
 check('Registre de 93 fiches',len(d['fidelity']['coverage'])==93)
 check('14 profils, distincts des 4 protagonistes',len(d['appearances'])==14 and len(d['characters'])==4)
 check('Les 4 lieux encore manquants restent indiqués',len([x for x in d['fidelity']['coverage'] if x['category']=='lieu' and 'manquant' in x['status']])==4)
 html=(R/'JOUER.html').read_text(encoding='utf-8');hh=sha(R/'JOUER.html')
 check('Aucun script externe dans le HTML autonome',not re.search(r'<script\b[^>]*\bsrc\s*=',html,re.I))
 check('Aucune feuille de style externe',not re.search(r'<link\b[^>]*\brel=["\']stylesheet',html,re.I))
 check('Numéro visible actualisé', 'VERSION JOUABLE 0.9' in html)
 br=read('docs/BROWSER_V09.json')
 check('Navigateur achevé sans erreur ni dépendance réseau',br.get('passed') and not br['errors'] and not br['network'])
 check('Empreinte exacte du HTML testé',br['htmlSHA256']==hh)
 check('35 contrôles navigateur actuels',len(br['cases'])==35 and all(x['passed'] for x in br['cases']))
 check('20 captures actuelles',len(br['captures'])==20)
 for c in br['captures']:
  p=R/'captures-v09'/c['file'];check('PNG courant · '+c['file'],p.is_file() and p.read_bytes().startswith(b'\x89PNG\r\n\x1a\n') and bool(c['fixture']))
 qm=read('docs/QUALIFICATION_MODEL.json')
 check('Toutes les suites du modèle achevées',qm['complete'] and qm['passed'] and all(x['returncode']==0 for x in qm['results']))
 for rel,h in qm['hashes'].items():check('Source testée · '+rel,sha(R/rel)==h)
 unit_names=['CORE','COLONY','EXPLORATION','PASSAGES','PERSISTENCE','LIFE','DEFENSE','DUCT','MOBILITY','FIDELITY']
 total=0
 for n in unit_names:
  report=read('docs/'+n+'_TEST_RESULTS.json');cases=report.get('results',report.get('cases'))
  check('Tests courants · '+n,report['passed'] and all(x['passed'] for x in cases));total+=len(cases)
 check('1246 cas et groupes du modèle',total==1246)
 for suffix in ['','_EXPLORATION','_LIFE','_DEFENSE','_DUCT','_MOBILITY','_FIDELITY']:
  v=read('docs/TRAVERSAL'+suffix+'_RESULTS.json');v=v if isinstance(v,list) else v.get('results',v.get('cases'));check('6 parcours · '+(suffix or 'principal'),len(v)==6 and all(x['passed'] for x in v))
 for n,c in [('INSTALLER_TEST_RESULTS',28),('REAL_UPGRADE_TEST_RESULTS',4)]:
  v=read('docs/'+n+'.json');cases=v.get('results',v.get('cases'))
  check('Recette · '+n,v['passed'] and isinstance(cases,list) and len(cases)==c and all(x['passed'] for x in cases))
 provenance=read('docs/REAL_V08_PROVENANCE.json')
 check('Export 0.8 non recréé',sha(R/'tests/fixtures/real-v08-save.json')==provenance['sha256'])
 docs=read('docs/DOCUMENTATION_BUILD.json')
 check('Documentation liée au HTML courant',docs['htmlSHA256']==hh and docs['reportSHA256']==sha(R/'RAPPORT_ILLUSTRE.html'))
 check('Comptes documentés issus de la recette',docs['model']==total and docs['browser']==35 and docs['traversals']==42)
 rp=read('docs/REPORT_VISUAL_V09.json')
 check('Rapport exécuté, empreinte et dimensions actuelles',rp.get('passed') and not rp['errors'] and rp['reportSHA256']==sha(R/'RAPPORT_ILLUSTRE.html'))
 parser=Images();parser.feed((R/'RAPPORT_ILLUSTRE.html').read_text(encoding='utf-8'))
 check('14 captures du rapport',len(parser.images)==14)
 for img in parser.images:
  origin=R/img['data-source'];check('Capture intégrée exacte · '+origin.name,base64.b64decode(img['src'].split(',',1)[1])==origin.read_bytes() and bool(img.get('alt')))
 for name in ['CODEX_LEVEL_DESIGN.md','QA_REPORT.md','REGISTRE_FIDELITE.md','SOURCES_ET_CONTINUITE.md','AUDIT_SEUILS_V09.json']:
  check('Document courant · '+name,(R/'docs'/name).is_file() and '0.9' in (R/'docs'/name).read_text(encoding='utf-8')[:500])
 with tempfile.TemporaryDirectory(prefix='rop-v09-rebuild-') as td:
  tmp=Path(td);shutil.copytree(R/'src',tmp/'src');shutil.copytree(R/'tools',tmp/'tools');(tmp/'docs').mkdir()
  for cmd in ['build-content.py','build-standalone.py']:
   run=subprocess.run([sys.executable,'-X','utf8','-S',str(tmp/'tools'/cmd)],capture_output=True,text=True)
   check('Reconstruction · '+cmd,run.returncode==0)
  check('HTML reconstruit octet pour octet',sha(tmp/'JOUER.html')==hh)
  check('Données reconstruites identiques',sha(tmp/'src/river-of-pain/data.js')==sha(R/'src/river-of-pain/data.js'))
 result.update(passed=True,htmlSHA256=hh,checks=checks)
except Exception as exc:result.update(passed=False,failure=str(exc),traceback=traceback.format_exc(),checks=checks)
(R/'docs/DELIVERY_VALIDATION_V09.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'passed':result['passed'],'checks':len(checks),'failure':result.get('failure')},ensure_ascii=False))
if not result['passed']:sys.exit(1)
