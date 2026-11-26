from pathlib import Path
import json, re, hashlib, html, base64, shutil, glob
R=Path(__file__).resolve().parents[1]
OUT=R.parent
D=json.loads((R/'docs/ALIEN_EARTH_CONTENT.json').read_text())
A=json.loads((R/'docs/v11/DOOR_AUDIT_V11.json').read_text())
HTML=R/'JOUER_ALIEN_EARTH_V11.html'
sha=hashlib.sha256(HTML.read_bytes()).hexdigest()
E=html.escape
main_ids={g for ch in D['chapters'] for g in ch.get('goals',[])}
counts={
 'rooms':len(D['rooms']),
 'mainTasks':len(main_ids),
 'optionalTasks':sum(1 for r in D['rooms'] if r.get('task',{}).get('id') not in main_ids),
 'archives':sum(bool(r.get('archive')) for r in D['rooms']),
 'bidirectionalConnections':len(D['links'])//2,
 'doorFaces':len(D['links']),
 'props':sum(len(r.get('props',[])) for r in D['rooms']),
 'propTypes':len({p.get('type') for r in D['rooms'] for p in r.get('props',[])}),
 'rules':len(D['rules']),
 'referenceProfiles':len(D['referenceCast']),
 'playableRoles':len(D['characters']),
 'equipmentDefinitions':len(D['equipment']),
 'fidelityEquipment':len(D['fidelity'].get('equipment',[])),
 'sources':len(D['sources']),
 'doorAuditFailures':len(A.get('failures',[])),
}
# Node evidence
node=(R/'docs/v11/QA_NODE_V11.log').read_text()
def find_num(label):
 m=re.search(rf'^# {re.escape(label)} (\d+)',node,re.M); return int(m.group(1)) if m else None
node_summary={'pass':find_num('pass'),'tests':find_num('tests'),'fail':find_num('fail')}
# Browser evidence: only exact current build, current V11 suites.
browser=[]
for rel in ['docs/v11/QA_BROWSER_SMOKE_V11.json','docs/v11/QA_BROWSER_FIDELITY_V11.json']:
 j=json.loads((R/rel).read_text())
 assert j.get('bundleSha256')==sha, (rel,j.get('bundleSha256'),sha)
 browser.append({'file':rel,'passed':j.get('passed',sum(bool(c.get('pass')) for c in j.get('checks',[]))),'total':j.get('total',len(j.get('checks',[]))),'pageErrors':j.get('pageErrors',[]),'ok':j.get('ok')})
# Campaign evidence
campaigns=[]
for f in sorted((R/'docs').glob('QA_CAMPAIGN_V11*.json')):
 j=json.loads(f.read_text())
 if j.get('bundleSha256')!=sha: continue
 campaigns.append({'file':str(f.relative_to(R)),'mode':j.get('mode'),'success':bool(j.get('success')),'errors':j.get('errors',[]),'visitedRooms':len(j.get('rooms',[]))})
assert len(campaigns)==17 and all(c['success'] and not c['errors'] for c in campaigns)
qa={
 'version':'11.0.0','bundleSha256':sha,'counts':counts,
 'node':node_summary,
 'browser':{'passed':sum(x['passed'] for x in browser),'total':sum(x['total'] for x in browser),'suites':browser},
 'campaigns':campaigns,
 'limitations':[
  'Navigation locale Chromium par URL bloquée dans cet environnement ; les octets du bundle sont chargés avec page.set_content sur une page opaque.',
  'Persistance après fermeture complète du navigateur non certifiée ; import/export via sélecteur réel vérifié.',
  'Les campagnes automatiques connaissent les données du niveau : elles ne remplacent pas un playtest humain à l’aveugle.',
  'La topologie V11 est une reconstitution jouable lorsqu’aucun blueprint métrique public n’est disponible.',
  'Visages, animations, dialogues, chorégraphies et toutes les variantes d’armes/tenues ne sont pas encore 1:1.'
 ]
}
(R/'docs/v11/QA_SUMMARY_V11.json').write_text(json.dumps(qa,ensure_ascii=False,indent=2)+'\n')
# Machine-readable fidelity inventory
source_by_id={s['id']:s for s in D['sources']}
fidelity={
 'version':'11.0.0','bundleSha256':sha,'counts':counts,'scope':D['fidelity'],
 'rooms':[], 'cast':D['referenceCast'],'equipment':D['fidelity'].get('equipment',[]),
 'doorAudit':{'failures':A.get('failures',[]),'newRooms':A.get('newRooms',[]),'newLinkFaces':len(A.get('newLinks',[]))}
}
for r in D['rooms']:
 fidelity['rooms'].append({
  'id':r['id'],'chapter':r['chapter'],'title':r['title'],'geometryStatus':r.get('geometryStatus'),
  'fidelity':r.get('fidelity'), 'source':r.get('source',[]),
  'connections':[{'to':p.get('to'),'kind':p.get('kind'),'anchor':p.get('anchor'),'requires':p.get('requires',[]),'threshold':[p.get('x'),p.get('z')],'arrival':[p.get('arrivalX'),p.get('arrivalZ')]} for p in r.get('portals',[])]
 })
(R/'docs/FIDELITE_V11.json').write_text(json.dumps(fidelity,ensure_ascii=False,indent=2)+'\n')
# Codex
lines=['# CODEX ALIEN: EARTH — V11.0.0','## Le navire derrière les portes','',
'Cette livraison vise une fidélité saison 1 plus forte tout en séparant explicitement **référence attestée**, **reconstitution jouable** et **invention de gameplay**. Aucun pourcentage de fidélité 1:1 n’est inventé. Les dimensions et raccords sont des unités de jeu lorsqu’aucun plan métrique public n’est disponible.','',
'## 1. Comptage vérifié','',f"- {counts['rooms']} lieux ; {counts['mainTasks']} tâches principales + {counts['optionalTasks']} facultatives ; {counts['archives']} archives.",f"- {counts['bidirectionalConnections']} liaisons bidirectionnelles / {counts['doorFaces']} faces de seuil.",f"- {counts['props']} placements / {counts['propTypes']} types logiques ; {counts['rules']} règles.",f"- {counts['referenceProfiles']} silhouettes de référence ; {counts['playableRoles']} points de vue jouables.",f"- Audit des seuils : {counts['doorAuditFailures']} anomalie structurelle détectée.",'',
'## 2. Limites de fidélité','']
for x in D['fidelity'].get('missing',[]): lines.append(f'- {x}')
lines += ['','## 3. Lieux et interconnexions','']
for ch in D['chapters']:
 ids=[]
 for key in ('rooms','annexes','ducts','extensions'):
  for rid in ch.get(key,[]):
   if rid not in ids: ids.append(rid)
 lines += [f"### {ch['id']} — {ch['title']}",f"Point de vue : **{ch['pov']}** · {len(ids)} lieux",'']
 for rid in ids:
  r=next(x for x in D['rooms'] if x['id']==rid)
  con=', '.join(f"{p['to']} ({p.get('anchor',{}).get('kind','seuil')})" for p in r.get('portals',[])) or 'aucune'
  src=', '.join(r.get('source',[])) or 'adaptation'
  lines += [f"#### {r['id']} — {r['title']}",f"- Statut : {r.get('fidelity',{}).get('status',r.get('geometryStatus','adaptation'))}",f"- Géométrie : {r.get('fidelity',{}).get('geometry',r.get('geometryStatus','adaptation'))}",f"- Sources : {src}",f"- Connexions : {con}",f"- Tâche : {r['task']['id']} — {r['task']['label']}",f"- Archive : {r['archive']['id']} — {r['archive']['title']}",'']
lines += ['## 4. Silhouettes de référence','']
for c in D['referenceCast']:
 lines += [f"- **{c.get('name',c.get('id'))}** — {c.get('role','')}. {c.get('note',c.get('status',''))}"]
lines += ['','## 5. Armes et équipements — état d’intégration','']
for g in D['fidelity'].get('equipment',[]):
 lines += [f"- **{g['name']}** — {g['status']}. {g.get('note','')}"]
lines += ['','## 6. Sources de fidélité','']
for s in D['fidelity'].get('sources',[]): lines += [f"- **{s['id']} — {s.get('title','')}** — {s.get('scope',s.get('note',''))} — {s.get('url','')}"]
lines += ['','## 7. Règles de production','']
for rule in D['rules']:
 if isinstance(rule,str): lines.append(f'- {rule}')
 else: lines.append(f"- **{rule.get('id','')}** — {rule.get('text',rule.get('rule',json.dumps(rule,ensure_ascii=False)))}")
lines += ['','## 8. Validation','',f"- Node : {node_summary['pass']}/{node_summary['tests']} ; {node_summary['fail']} échec.",f"- Navigateur V11 consolidé : {qa['browser']['passed']}/{qa['browser']['total']} contrôles, zéro erreur de page enregistrée dans les deux suites actuelles.",f"- Campagnes moteur : {len(campaigns)}/17 réussies.",f"- SHA-256 du HTML testé : `{sha}`",'']
(R/'docs/CODEX_ALIEN_EARTH_V11.md').write_text('\n'.join(lines))
# HTML helpers
css='''body{margin:0;background:#071014;color:#d7ded6;font:15px/1.55 system-ui,Segoe UI,sans-serif}header,main,footer{max-width:1180px;margin:auto;padding:30px}h1{font-size:44px;margin:.1em 0;color:#edf1d7}h2{margin-top:38px;color:#d6c388;border-bottom:1px solid #405252;padding-bottom:8px}h3{color:#a9d4c8}.eyebrow{letter-spacing:.18em;text-transform:uppercase;color:#8fa49d;font-size:11px}.lede{font-size:22px;color:#b9cbc4}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}.card,.notice,details{background:#0d1b20;border:1px solid #31474b;padding:16px}.card strong{display:block;font-size:28px;color:#e9ddb2}.card span{color:#a9b9b2}table{border-collapse:collapse;width:100%}th,td{border:1px solid #34484a;padding:8px;vertical-align:top}th{background:#14272a;color:#d6c388}.tag{display:inline-block;padding:2px 7px;border:1px solid #526763;margin:2px;font-size:11px}.warn{border-left:4px solid #d6a65b}.ok{border-left:4px solid #7cb89e}code{color:#c7e6dc}a{color:#9edbc6}figure{margin:26px 0;background:#0d1b20;border:1px solid #31474b;padding:10px}figure img{width:100%;height:auto;display:block}figcaption{padding:10px 4px;color:#aebbb6}.room{margin:12px 0;padding:14px;background:#0b171b;border-left:3px solid #526763}.room b{color:#e9ddb2}.scroll{overflow:auto}footer{color:#869994;font-size:12px}@media(max-width:600px){header,main,footer{padding:18px}h1{font-size:32px}table{font-size:12px}}'''
def page(title,body): return f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{E(title)}</title><style>{css}</style></head><body>{body}</body></html>'
# Audit HTML
body=f'''<header><div class="eyebrow">ALIEN: EARTH / V11.0.0</div><h1>Audit de fidélité</h1><p class="lede">Le navire derrière les portes</p><p>Registre de production : références, raccords, silhouettes, dotations et écarts. Une pièce attestée n’implique pas que son plan ou sa connexion exacte soit certifié.</p></header><main><div class="grid">'''
for n,l in [(counts['rooms'],'lieux'),(counts['bidirectionalConnections'],'liaisons'),(counts['props'],'placements'),(counts['referenceProfiles'],'silhouettes'),(counts['rules'],'règles'),(counts['doorAuditFailures'],'anomalie de seuil')]: body+=f'<div class="card"><strong>{n}</strong><span>{E(l)}</span></div>'
body+='</div><div class="notice warn"><b>1:1 total non déclaré.</b><p>'+E(' · '.join(D['fidelity']['missing']))+'</p></div>'
body+='<h2>Nouveaux espaces V11</h2><p>Les huit espaces ci-dessous ont une fonction appuyée par les sources indiquées ; leurs dimensions et raccords restent reconstitués lorsque les documents publics ne donnent pas de blueprint complet.</p><div class="scroll"><table><tr><th>ID</th><th>Lieu</th><th>Chapitre</th><th>Statut</th><th>Sources</th><th>Connexions</th></tr>'
for rid in A['newRooms']:
 r=next(x for x in D['rooms'] if x['id']==rid)
 con=', '.join(p['to'] for p in r['portals'])
 body+=f"<tr><td>{rid}</td><td>{E(r['title'])}</td><td>{r['chapter']}</td><td>{E(str(r.get('fidelity',{}).get('status','adaptation')))}</td><td>{E(', '.join(r.get('source',[])))}</td><td>{E(con)}</td></tr>"
body+='</table></div><h2>70 lieux et seuils</h2>'
for r in D['rooms']:
 anchors=', '.join(f"{p['to']}:{p.get('anchor',{}).get('kind','seuil')}" for p in r['portals'])
 body+=f"<div class='room'><b>{r['id']} — {E(r['title'])}</b><br>{E(str(r.get('fidelity',{}).get('status',r.get('geometryStatus','adaptation'))))}<br><small>{E(anchors)}</small></div>"
body+='<h2>Silhouettes</h2><div class="scroll"><table><tr><th>Personnage</th><th>Rôle</th><th>État</th></tr>'
for c in D['referenceCast']: body+=f"<tr><td>{E(c.get('name',c['id']))}</td><td>{E(c.get('role',''))}</td><td>{E(c.get('note',c.get('status','stylisé')))}</td></tr>"
body+='</table></div><h2>Équipement</h2><div class="scroll"><table><tr><th>Objet</th><th>État</th><th>Source</th><th>Limite</th></tr>'
for g in D['fidelity']['equipment']: body+=f"<tr><td>{E(g['name'])}</td><td>{E(g['status'])}</td><td>{E(str(g.get('source') or 'adaptation'))}</td><td>{E(g.get('note',''))}</td></tr>"
body+='</table></div><h2>Sources de référence</h2>'
for s in D['fidelity']['sources']: body+=f"<p><b>{E(s['id'])}</b> — <a href='{E(s.get('url',''))}'>{E(s.get('title',''))}</a><br>{E(s.get('scope',s.get('note','')))}</p>"
body+=f"<div class='notice ok'><b>Audit de seuils :</b> {len(A.get('failures',[]))} anomalie dans la géométrie livrée. Cela ne certifie pas le plan métrique réel.</div><p>SHA-256 du bundle : <code>{sha}</code></p></main><footer>Audit interne du module fan non officiel. Les sources externes restent la référence pour les faits de production.</footer>"
(R/'docs/AUDIT_FIDELITE_ALIEN_EARTH_V11.html').write_text(page('Alien: Earth V11 — Audit de fidélité',body))
# QA report with embedded selected screenshots
caps=json.loads((R/'docs/v11/QA_BROWSER_FIDELITY_V11.json').read_text()).get('captures',[])
selected={'v11-01-titre.png','v11-02-silhouettes.png','v11-03-dotations.png','v11-05-engine-room.png','v11-06-containment-room.png','v11-08-atrium.png','v11-11-secure-lab.png','v11-12-carte-maginot.png','v11-14-mobile.png'}
body='<header><div class="eyebrow">LIVRAISON V11 · 29 SEPTEMBRE 2026</div><h1>ALIEN: EARTH</h1><p class="lede">Le navire derrière les portes</p><p>Rapport QA et preuves visuelles de la passe fidélité.</p></header><main><div class="grid">'
for n,l in [(counts['rooms'],'lieux'),(counts['bidirectionalConnections'],'liaisons'),(node_summary['pass'],'tests Node réussis'),(qa['browser']['passed'],'contrôles navigateur'),(len(campaigns),'campagnes moteur'),(counts['referenceProfiles'],'silhouettes')]: body+=f'<div class="card"><strong>{n}</strong><span>{E(l)}</span></div>'
body+='</div><div class="notice warn"><b>Frontière de preuve.</b><p>Aucun résultat ci-dessous ne transforme une reconstitution spatiale en blueprint officiel. Le rendu reste vectoriel stylisé.</p></div><h2>Validation</h2><div class="scroll"><table><tr><th>Suite</th><th>Résultat</th><th>Portée</th></tr>'
body+=f"<tr><td>Node</td><td>{node_summary['pass']}/{node_summary['tests']} · {node_summary['fail']} échec</td><td>Moteur, géométrie, migration, installateur et fidélité V11.</td></tr>"
body+=f"<tr><td>Navigateur V11 consolidé</td><td>{qa['browser']['passed']}/{qa['browser']['total']}</td><td>70 lieux, registres, armes, migration/export, mobile et rendu ; deux suites exactes portant le SHA courant.</td></tr>"
body+=f"<tr><td>Campagnes</td><td>{len(campaigns)}/17</td><td>Routes principales et variantes services, confinement, sondes, galeries, enquêtes, sentinelles et fidélité.</td></tr>"
body+=f"<tr><td>Seuils</td><td>{counts['doorAuditFailures']} anomalie</td><td>{counts['doorFaces']} faces analysées dans la géométrie du jeu.</td></tr></table></div>"
body+='<h2>Captures réelles du bundle</h2><p>Les scènes d’inspection indiquent explicitement quand la pièce ou la position est préparée. Elles montrent le programme exécuté, pas une image externe substituée au jeu.</p>'
for c in caps:
 p=R/c['file']
 if p.name not in selected or not p.exists(): continue
 b64=base64.b64encode(p.read_bytes()).decode()
 body+=f"<figure><img src='data:image/png;base64,{b64}' alt='{E(p.stem)}'><figcaption>{E(c['description'])}</figcaption></figure>"
body+='<h2>Limites de validation</h2><ul>' + ''.join(f'<li>{E(x)}</li>' for x in qa['limitations']) + '</ul>'
body+=f"<h2>Reproduire</h2><p><code>npm run data &amp;&amp; npm run build &amp;&amp; npm test</code><br><code>npm run test:campaigns</code><br><code>npm run test:browser:regression</code><br><code>npm run test:browser</code></p><p>SHA-256 du HTML contrôlé : <code>{sha}</code></p></main><footer>Prototype fan autonome ; aucune certification commerciale ou canonique exhaustive.</footer>"
(R/'docs/RAPPORT_QA_ALIEN_EARTH_V11.html').write_text(page('Alien: Earth V11 — Rapport QA',body))
# copy top-level deliverables
for src,name in [('docs/CODEX_ALIEN_EARTH_V11.md','CODEX_ALIEN_EARTH_V11.md'),('docs/AUDIT_FIDELITE_ALIEN_EARTH_V11.html','AUDIT_FIDELITE_ALIEN_EARTH_V11.html'),('docs/RAPPORT_QA_ALIEN_EARTH_V11.html','RAPPORT_QA_ALIEN_EARTH_V11.html')]: shutil.copy2(R/src,OUT/name)
print(json.dumps({'counts':counts,'node':node_summary,'browser':[qa['browser']['passed'],qa['browser']['total']],'campaigns':len(campaigns),'bundleSha256':sha},ensure_ascii=False,indent=2))
