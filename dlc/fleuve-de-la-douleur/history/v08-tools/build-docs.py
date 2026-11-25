#!/usr/bin/env python3
"""Build current codex/report from shipped content and completed current tests. No publishing."""
from pathlib import Path
from html import escape
from collections import Counter
import base64, json, hashlib
R=Path(__file__).resolve().parents[1]
read=lambda n:json.loads((R/'docs'/n).read_text(encoding='utf-8'))
D=read('CONTENT_MANIFEST.json');rooms={r['id']:r for r in D['rooms']};m=D['manifest'];v=m['version'];cnt=m['counts']
assert v=='0.8.0-candidate.1'
fmt=lambda n:str(round(n,3)).rstrip('0').rstrip('.') if isinstance(n,float) else str(n)
cell=lambda s:str(s).replace('|',' / ').replace('\n',' ')
limitations='DLC autonome avec lanceur additionnel, pas le jeu Tantalus complet ni son GameEngine natif. Aucun push GitHub ni déploiement Vercel. Dessins stylisés par code provisoires, pas atlas définitifs ou reconstitution 1:1. Roman intégral non consulté : plans, dialogues, tâches et documents sont une condensation originale. L’écho Frontière 2204 et les sauvegardes du moteur hôte ne sont pas modifiés.'
model_names=['CORE_TEST_RESULTS','COLONY_TEST_RESULTS','EXPLORATION_TEST_RESULTS','PASSAGES_TEST_RESULTS','PERSISTENCE_TEST_RESULTS','LIFE_TEST_RESULTS','DEFENSE_TEST_RESULTS','DUCT_TEST_RESULTS','MOBILITY_TEST_RESULTS']
browser_names=['BROWSER_V08A','BROWSER_V08B','BROWSER_V08C']
reports={n:read(n+'.json') for n in model_names+browser_names+['INSTALLER_TEST_RESULTS','REAL_UPGRADE_TEST_RESULTS']}
sha=hashlib.sha256((R/'JOUER.html').read_bytes()).hexdigest()
for n,r in reports.items():
 assert r.get('passed'),n
 assert r.get('version',v)==v,n
 if n in browser_names:assert r['htmlSHA256']==sha,n+' must be rerun on current standalone'
def num(n):
 q=reports[n];c=q.get('cases',q.get('results',[]));return c if isinstance(c,int) else len(c)
model=sum(num(n) for n in model_names);browser=sum(num(n) for n in browser_names)
tr_names=['TRAVERSAL_RESULTS','TRAVERSAL_EXPLORATION_RESULTS','TRAVERSAL_LIFE_RESULTS','TRAVERSAL_DEFENSE_RESULTS','TRAVERSAL_DUCT_RESULTS','TRAVERSAL_MOBILITY_RESULTS']
for n in tr_names:
 q=read(n+'.json');rr=q if isinstance(q,list) else q['cases'];assert len(rr)==6,n
 assert all(t['passed'] for t in rr),n
caprows=sum((reports[n]['captures'] for n in browser_names),[]);caps={Path(c['file']).name:c for c in caprows}
assert len(caps)==len(caprows)==12
for c in caprows:assert (R/c['file']).is_file() and c.get('setup')
timings={'escalier':(.45,1.4),'échelle':(.5,1.8),'monte-charge':(1.2,2.4),'sas':(1.1,1.1)}
seen=set();links=[]
for r in D['rooms']:
 for p in r['portals']:
  key=tuple(sorted([r['id'],p['to']]))
  if key in seen:continue
  seen.add(key)
  if p['kind'] in timings:links.append((r,p))
assert len(links)==21
by_kind=Counter(p['kind'] for _,p in links)
principles=(R/'docs/DOCTRINE_V08.md').read_text(encoding='utf-8')
lines=['# ALIEN — Fleuve de la Douleur','',f'## Codex de level design · {v}','',m['subtitle'],'',limitations,'',principles]


lines += ['## Tracteur et bornes de service de la 0.8', '', '| Poste | Pièce | Point x / z | Stock fini / portée du châssis |', '|---|---|---|---|']
for station in D['mobility']['stations']:
 lines += [f"| {station['label']} · `{station['id']}` | {rooms[station['room']]['name']} | {station['x']} / {station['z']} | {station['repairKits']} trousse / {station['charges']} accumulateur ; {station['radius']} unités |"]
lines += ['', 'Le tracteur est débloqué par la préparation existante `tractor`. Nouvelle emprise physique 304 × 0,10 ; une seule liaison routière réutilisée dans les deux sens, aucun accès intérieur pilotable.', '', '| Surface | Pièce | Centre x / largeur | Limite interne |', '|---|---|---|---|']
for surface in D['mobility']['surfaces']:
 lines += [f"| {surface['label']} | {rooms[surface['room']]['name']} | {surface['x']} / {surface['w']} | {surface['speedLimit']} unités/s |"]
lines += ['','Le compteur convertit les unités internes à 42 unités/mètre et affiche des km/h simulés. Cela ne constitue pas une mesure officielle.','']

lines += ['## Cinq gaines et dix grilles techniques','', '| Gaine | Bouche / pièce / x / z | Bouche opposée / pièce / x / z | Temps de transfert |','|---|---|---|---|']
by_mouth={d['id']:d for d in D['ducts']['mouths']}
for route in D['ducts']['routes']:
 a,b=[by_mouth[k] for k in route['ends']]
 lines += [f"| {route['label']} · `{route['id']}` | {a['code']} · {rooms[a['room']]['name']} · {a['x']} / {a['z']} | {b['code']} · {rooms[b['room']]['name']} · {b['x']} / {b['z']} | {fmt(route['duration'])} s |"]
lines += ['', 'Ces liaisons transportent seulement des adultes existants : elles ne sont pas les 57 connexions jouables du plan colonial. Préparation 1,1 s, sortie annoncée 2,4 s, dégagement 300 unités internes. Verrouiller 2 s, libérer 1,2 s, écouter 1,7 s. Aucun volume de gaine librement exploratoire ajouté.','']

lines += ['## Huit volets dans les pièces','', '| Volet | Pièce | Emprise x / z ; largeur / profondeur | Commandes gauche et droite x / z |','|---|---|---|---|']
for d in D['defense']['shutters']:
 lines.append(f"| {d['label']} · `{d['id']}` | {rooms[d['room']]['name']} | {d['x']} / {d['z']} ; {d['w']} / {d['d']} | "+' ; '.join(f"{a['x']} / {a['z']}" for a in d['controls'])+' |')
lines += ['', 'En vue classique, z = 0,7 et profondeur de volet = 0,10. L’emprise devient physique seulement à fermeture réussie. Intégrité 100 ; fermeture 2,6 s, ouverture adulte 1,6 s, libération Newt 1,1 s. Pas de réparation.','', '## Quatre avertisseurs locaux','', '| Avertisseur | Pièce / circuit | x / z | Programmation → délai → signal | Réarmement / cycles |','|---|---|---|---|---|']
for d in D['defense']['alarms']:
 lines.append(f"| {d['label']} · `{d['id']}` | {rooms[d['room']]['name']} / {d['circuit']} | {d['x']} / {d['z']} | 1,2 s → 4 s → 10 s | 45 s / 2 |")
lines += ['','Les cycles expirent hors champ, pas les parcours des ennemis. Un circuit coupé éteint le signal sans rembourser le cycle. La commande exige la présence d’un adulte à portée.','']
lines += ['## Douze personnes de service originales','']
for d in D['life']['residents']:
 lines += [f"### {d['name']} · `{d['id']}`",'',f"**{d['role']} · {rooms[d['room']]['name']} · stades 0 et 1 uniquement**",'',f"Silhouette : hauteur {d['height']}, accessoire `{d['tool']}`, apparence `{d['hair']}`. Trajet local : "+' → '.join(f"({q['x']} / {q['z']})" for q in d['points'])+'. Retrait : '+str(d['refuge'])+'.','',f"Avant la crise : « {d['intro'][0]} »",'',f"Premiers incidents : « {d['intro'][1]} »",'']
 for t in d['topics']:lines += [f"**{t['label']}** · `{t['id']}`",'',t['text'],'']
 lines += ['Ces réponses doivent être demandées sur place pour être conservées. Aucun suivi à distance, crédit de mission ou sort canonique attribué.','']
lines += ['## Réserves finies et établis','', '| Réserve / identifiant | Pièce | Point x / z | Contenu initial |','|---|---|---|---|']
for d in D['life']['containers']:lines.append(f"| {d['label']} · `{d['id']}` | {rooms[d['room']]['name']} | {d['x']} / {d['z']} | "+' ; '.join(f"{n} {D['life']['items'][k]['label']}" for k,n in d['items'].items())+' |')
lines += ['', 'Les contenus sont partagés entre les protagonistes. Les prises respectent les capacités ; les surplus restent dans le meuble.','', '| Établi / identifiant | Pièce | Point x / z | Recettes |','|---|---|---|---|']
for d in D['life']['benches']:lines.append(f"| {d['label']} · `{d['id']}` | {rooms[d['room']]['name']} | {d['x']} / {d['z']} | Balise sonore / recharge de lampe |")
lines += ['','Les stations ne sont pas des couvertures collisionnables supplémentaires. Le point ci-dessus est la cible physique de l’interaction, avec une portée de proximité.','']
lines += ['## Registre des 21 liaisons temporisées','', 'Les liaisons ci-dessous se parcourent dans les deux sens. Les points de départ et de retour détaillés dans chaque fiche de pièce restent les coordonnées de référence. Les temps sont des secondes de simulation, pas des mesures du film ou du roman.','', '| Origine | Destination | Nature | Niveaux | Préparation exposée | Trajet engagé |','|---|---|---|---|---:|---:|']
for r,p in links:
 b,t=timings[p['kind']];lines += [f"| {r['name']} | {rooms[p['to']]['name']} | {p['kind']} | {r['floor']} → {rooms[p['to']]['floor']} | {fmt(b)} s | {fmt(t)} s |"]
lines += ['','## Registre des six détours','']
for j in D['jobs']:
 r=rooms[j['room']];free=next(p for p in r['portals'] if not p['requires']);gate=next(p for p in r['portals'] if p['requires'])
 lines += [f"### {j['title']} · `{j['id']}`",'',f"**{r['name']} · {'Newt seule' if j['childOnly'] else 'Personnage adulte'}**",'',j['steps'][0]['description'],'',f"Boucle : {rooms[free['to']]['name']} → {r['name']} → {rooms[gate['to']]['name']}. L’entrée depuis {rooms[free['to']]['name']} ne demande pas d’avoir déjà ouvert la sortie.",'','| Étape | Salle | Action | x / z | Temps sur place |','|---|---|---|---|---|']
 for i,t in enumerate(j['steps']):lines.append(f"| {i+1} | {rooms[t['room']]['name']} | {t['label']} | {fmt(t['x'])} / {fmt(t['z'])} | {t['duration']} s |")
 reward={'medkit':'une trousse de soins','flare':'deux fusées','battery':'réserve de lampe remise à 100 %','food':'25 points de santé, maximum 100'}[j['reward']]
 a=next(a for a in D['archives'] if a['id']==j['archive'])
 lines += ['',f"Pièce emportée : **{j['item']}**. La pose exige cette étape, le bon personnage et la proximité. L’éloignement ou une blessure interrompt la pose sans effacer la pièce.",'',f"Effet : `{j['flag']}` autorise les deux portails. Récompense : {reward}, une seule fois ; document `{a['id']}` — {a['title']}. Le compteur de campagne principale ne change pas.",'']
lines += ['## Rencontres ajoutées et annonce','', '| ID / pièce | Nature | Stade minimum | Seuil x | Ancrage x / z | Préavis |','|---|---|---:|---:|---|---:|']
for e in D['encounters']:lines.append(f"| `{e['id']}` / {rooms[e['room']]['name']} | {e['type']} | {e['minPhase']} | {e['triggerX']} | {e['spawnX']} / {e['spawnZ']} | {e['warning']} s |")
for e in D['encounters']:lines += ['',f"**{e['id']}** — {e['label']}"]
lines += ['','## Campagne principale : 49 objectifs conservés','']
for c in D['chapters']:
 lines += [f"### {c['index']+1:02d} — {c['title']}",'',f"**{D['characters'][c['character']]['name']} · {c['timeLabel']} · {rooms[c['start']]['name']}**",'',c['synopsis'],'','| Ordre | Lieu | Action réelle | Type |','|---|---|---|---|']
 for i,t in enumerate(c['objectives']):
  o=next(o for o in rooms[t['room']]['objects'] if o['id']==t['id']);lines.append(f"| {i+1} | {rooms[t['room']]['name']} | {o['label']} | `{o['kind']}` |")
 lines += ['',f"Dialogue original de jeu : **{c['dialogue']['speaker']}** — « {c['dialogue']['text']} »",'']
lines += ['## Tableaux et collecteurs : solutions de recette','']
for bid,b in D['boards'].items():
 lines += [f"### {b['title']} · `{bid}`",'',f"{rooms[b['room']]['name']} · circuit `{b['circuit']}` · capacité {b['capacity']}.",'',b['hint'],'','| Commande | Charge | État requis | Initial |','|---|---:|---|---|']
 for i,c in enumerate(b['channels']):lines.append(f"| {c[0]} | {c[1]} | {'Actif' if c[2] else 'Coupé'} | {'Actif' if b['initial'][i] else 'Coupé'} |")
 lines += ['']
lines += ['## Les 42 fiches de pièce','']
for r in D['rooms']:
 a=r['architecture'];lines += [f"### {r['name']} · `{r['id']}`",'',f"**{r['building']} · niveau {r['floor']} · {r['kind']} · {r['width']} unités · z {r['minZ']}–{r['maxZ']}**",'',f"Repère d’orientation : {r['landmark']}. Profil `{a['style']}` / `{a['variant']}`, circuit `{a['circuit']}`, emprise `{r['layoutProfile']}`.",'',f"Blocage métrique déclaré : {r['dimensionsM']} ; intention originale, pas mesure du roman. {a['wallModules']} travées murales déclarées. Les facteurs de parallaxe d’architecture sont des métadonnées de production, pas tous des variables autonomes du renderer.",'','#### Entrées, retours et droits','', '| Sortie | Nature | Départ x / z | Retour x / z | Condition |','|---|---|---|---|---|']
 for p in r['portals']:
  back=next(q for q in rooms[p['to']]['portals'] if q['to']==r['id']);cond=('Newt ; ' if p['childOnly'] else '')+(p['requires'] or 'Libre')
  lines.append(f"| {rooms[p['to']]['name']} | {p['kind']} | {fmt(p['x'])} / {fmt(p['z'])} | {fmt(back['x'])} / {fmt(back['z'])} | {cond} |")
 for p in r['portals']:
  if p['kind'] in timings:
   board,travel=timings[p['kind']]
   extra=' Circuit coupé : +1,6 s de trajet.' if p['kind']=='monte-charge' else ''
   lines += ['',f"Raccord vers **{rooms[p['to']]['name']}** : préparation exposée {fmt(board)} s, puis trajet borné {fmt(travel)} s.{extra} Arrivée au portail inverse ; annulation par mouvement ou blessure avant engagement. Les menus ne permettent pas de contourner les droits d’accès."]
 lines += ['', 'Lecture des seuils : les observations sont datées, locales et non garanties. L’écoute ne rend pas cette pièce sûre. Les emprises et points de retour ci-dessous restent la référence de placement.']
 lines += ['','#### Obstacles : emprise commune au rendu et au moteur','', '| ID | Nature | Centre x / z | Largeur / profondeur |','|---|---|---|---|']
 if not r['cover']:lines += ['| Aucun | Passage latéral dégagé | — | — |']
 for c in r['cover']:lines.append(f"| `{c['id']}` | {c['prop']} | {fmt(c['x'])} / {fmt(c['z'])} | {fmt(c['w'])} / {fmt(c['d'])} |")
 lines += ['','#### Décors : fonction avant densité','', '| ID / objet | x / z | Couche | Solide | Rôle et placement |','|---|---|---|---|---|']
 for p in r['props']:lines.append(f"| `{p['id']}` / {p['kind']} | {fmt(p['x'])} / {fmt(p['z'])} | {p['layer']} | {'Oui' if p['collidable'] else 'Non'} | {cell(p['purpose'])} |")
 lines += ['','#### Interactions et cachettes','', '| ID / action | x / z | Condition d’apparition | Type |','|---|---|---|---|']
 for o in r['objects']:
  cond='Chapitre '+str(o['chapter']+1) if 'chapter' in o else 'Détour '+o['job']+' / étape '+str(o['step']+1) if o['kind']=='side-task' else 'Facultatif'
  lines.append(f"| `{o['id']}` · {cell(o['label'])} | {fmt(o['x'])} / {fmt(o['z'])} | {cond} | {o['kind']} |")
 if r['phaseDressing']:
  lines += ['','#### État de crise visible','', '| Élément | x / z | Stade minimum |','|---|---|---:|']
  for q in r['phaseDressing']:lines.append(f"| {q['kind']} | {fmt(q['x'])} / {fmt(q['z'])} | {q['fromPhase']} |")
 for h in D['hazards']:
  if h['room']==r['id']:lines += ['',f"Danger local `{h['id']}` : x {h['x']}, z {h['z']}. Valeurs de recette : `{json.dumps(h,ensure_ascii=False)}`."]
 for e in D['encounters']:
  if e['room']==r['id']:lines += ['',f"Rencontre `{e['id']}` : annonce de {e['warning']} s au passage x ≥ {e['triggerX']}, à partir du stade {e['minPhase']}. Consulter son état de sauvegarde avant tout ajout d’ennemi."]
 localpeople=[d for d in D['life']['residents'] if d['room']==r['id']];localboxes=[d for d in D['life']['containers'] if d['room']==r['id']];localbenches=[d for d in D['life']['benches'] if d['room']==r['id']]
 if localpeople or localboxes or localbenches:
  lines += ['','#### Vie coloniale et stations de la 0.5','']
  for d in localpeople:lines += [f"**{d['name']}** · {d['role']}. Routine 0/1 : "+' → '.join(f"({q['x']} / {q['z']})" for q in d['points'])+'. P permet de sélectionner sa conversation sans emprunter un accès voisin.','']
  for d in localboxes:lines += [f"**{d['label']}** · `{d['id']}` à ({d['x']} / {d['z']}). Fermoir fermé → ouverture exposée → contenu fini → surplus ou état vide. Contenu : "+' ; '.join(f"{n} {D['life']['items'][k]['label']}" for k,n in d['items'].items())+'. Pas de remplissage après une visite.','']
  for d in localbenches:lines += [f"**{d['label']}** · `{d['id']}` à ({d['x']} / {d['z']}). Adulte proche ; deux recettes, coût débité seulement au terme. Aucun usage à distance ni atelier pour Newt.",'']
 localshutters=[d for d in D['defense']['shutters'] if d['room']==r['id']];localalarms=[d for d in D['defense']['alarms'] if d['room']==r['id']]
 if localshutters or localalarms:
  lines += ['','#### Dispositifs physiques de la 0.6','']
  for d in localshutters:
   lines += [f"**{d['label']}** · `{d['id']}`. Centre {d['x']} / {d['z']}, emprise {d['w']} / {d['d']}. Commandes : "+' ; '.join(f"({a['x']} / {a['z']})" for a in d['controls'])+'. Fermeture 2,6 s ; ouverture adulte 1,6 s ; Newt 1,1 s. Occupation vérifiée au début et au terme. Pas d’écrasement ni d’éjection.','', 'Contournement profond s’il existe ; sinon les adultes annoncent leurs frappes. Petits parasites sous le panneau. Intégrité non réparée après ouverture ; rupture définitive à zéro.','']
  for d in localalarms:
   lines += [f"**{d['label']}** · `{d['id']}` à ({d['x']} / {d['z']}). Circuit `{d['circuit']}`, adulte proche. 1,2 s de travail, 4 s de délai, 10 s de signal, 45 s de réarmement et deux cycles maximum. Portées de jeu 950 / 470 selon obstruction. Une cible visible reste prioritaire. Aucune apparition d’ennemi n’est produite par ce poste.",'']

 for mouth in D['ducts']['mouths']:
  if mouth['room']==r['id']:
   other=next(by_mouth[x] for x in next(a for a in D['ducts']['routes'] if a['id']==mouth['route'])['ends'] if x!=mouth['id'])
   lines += ['', '#### Bouche technique de la 0.7', '', f"**{mouth['code']} · {mouth['label']}** · `{mouth['id']}` à ({mouth['x']} / {mouth['z']}). Gaine `{mouth['route']}` vers **{rooms[other['room']]['name']}**, bouche {other['code']}. Grille ouverte initialement, intégrité 100. E à portée ou dossier 4 ; écouter 1,7 s, verrouiller 2 s, libérer 1,2 s. Newt écoute seulement.", '', 'Cette station ne bloque pas la marche et ne constitue pas une porte du joueur. Une sortie de créature existante attend la pièce active, 2,4 s de préavis et un dégagement de 300 unités internes. Les dégâts de grille et le transfert se sauvegardent ; une libération ne répare pas le verrou.','']


 if r['id'] in D['mobility']['rooms']:
  lines += ['', '#### Circulation du tracteur de la 0.8', '', 'Conduite autorisée après la préparation au garage ; volume entier du châssis contre les obstacles. La route principale reste praticable à pied. La borne ne répare pas depuis la cabine et ne rappelle pas un véhicule resté ailleurs.', '']
  for station in D['mobility']['stations']:
   if station['room']==r['id']:
    lines += [f"**{station['label']}** · `{station['id']}` à ({station['x']} / {station['z']}). Une trousse (+55 maximum en 3,2 s), un accumulateur (+65 maximum en 2,8 s). Rayon tracteur {station['radius']} unités ; personnage à pied auprès du poste. Stock consommé seulement au terme, aucun réapprovisionnement au changement de chapitre.", '']
  for surface in D['mobility']['surfaces']:
   if surface['room']==r['id']:
    lines += [f"**{surface['label']}** · `{surface['id']}` : centre x {surface['x']}, largeur {surface['w']}, profondeur {surface['minZ']} à {surface['maxZ']}. Vitesse du véhicule limitée à {surface['speedLimit']} unités/s. Aucun obstacle invisible supplémentaire pour le piéton.", '']

 lines += ['','#### Garde-fous de cette pièce','',f"Les {len(r['portals'])} retours, {len(r['objects'])} points d’interaction et {len(r['cover'])} obstacles sont issus du même contenu que le runtime. La recette géométrique a marché de l’entrée vers chaque point dans les deux vues. Elle contrôle l’accessibilité, pas une partie humaine complète ni l’équilibrage de chaque rencontre.",'', 'Ne pas ajouter de collision aux accessoires muraux sans modifier le plan local et relancer la recette. Ne pas déplacer un seuil sans déplacer son point de retour. Ne pas transformer un décor d’observation en porte non documentée. Préserver la bande z = 0,7 pour le mode classique.','']
lines += ['## Documents originaux','']
for a in D['archives']:
 lines += [f"### {a['id']} — {a['title']}",'',str(a.get('text',a.get('body',''))),'']
lines += ['## Qualification courante','',f'{model} groupes/cas du modèle, dont {num("PASSAGES_TEST_RESULTS")} pour les seuils et {num("PERSISTENCE_TEST_RESULTS")} pour le stockage abstrait. Trente-six parcours complets retestés. {num("INSTALLER_TEST_RESULTS")} cas d’installateur sur projets de test et {num("REAL_UPGRADE_TEST_RESULTS")} avec les vrais fichiers 0.7. {browser} contrôles dans Chromium et {len(caps)} captures décrites. Voir QA_REPORT.md pour les périmètres et limites.','',limitations]
codex='\n'.join(lines)+'\n';(R/'docs/CODEX_LEVEL_DESIGN.md').write_text(codex,encoding='utf-8')

css='''*{box-sizing:border-box}body{margin:0;background:#091a21;color:#c6d3ca;font:16px/1.75 Arial,Helvetica,sans-serif}main{max-width:1180px;margin:auto;padding:48px 30px 70px}header{border-bottom:1px solid #4e6b64;padding:18px 0 38px}.eyebrow,.tag{font:11px/1.6 monospace;letter-spacing:.16em;color:#a7bfad}h1{font-size:clamp(38px,6.5vw,78px);font-weight:400;line-height:1.05;letter-spacing:.055em;color:#e0e5d2;margin:28px 0}h2{font-size:29px;font-weight:400;color:#e3e5cd;margin-top:56px;line-height:1.25}h3{color:#d6ddc8;font-size:20px;font-weight:400}.subtitle{font-size:22px}.tag{display:inline-block;border:1px solid #608277;padding:8px 12px}nav{display:flex;gap:18px;flex-wrap:wrap;padding:22px 0}a{color:#c8d4b7;text-decoration:none;border-bottom:1px solid #6c8d7b}a:hover{color:#fff}p{max-width:960px}.notice{padding:22px 25px;border-left:3px solid #bdb58a;background:#162c32}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin:30px 0}.metrics article{padding:22px;border-top:1px solid #648579;background:#122930}.metrics b{display:block;font:38px monospace;color:#dfe4c5}.metrics span{display:block;font:11px monospace;margin-top:9px;letter-spacing:.1em;color:#9eb7aa}.grid{display:grid;grid-template-columns:1fr 1fr;gap:30px}.grid article{padding:8px 0}.table-wrap{overflow:auto}table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:left;vertical-align:top;border-bottom:1px solid #355953;padding:14px 12px}th{font:11px monospace;color:#afc3ac;letter-spacing:.1em}figure{margin:32px 0;border:1px solid #385b58;background:#10292f}figure img{display:block;width:100%;height:auto}figcaption{padding:20px 24px;font-size:14px}figcaption b{font-weight:400;color:#e2e5cd}details{margin-top:10px;color:#9db8ab;font-size:12px}summary{cursor:pointer;letter-spacing:.05em}code,small{display:block;overflow-wrap:anywhere;font-size:10px}.portrait{max-width:420px;margin-left:auto;margin-right:auto}footer{border-top:1px solid #3f615b;margin-top:50px;padding-top:30px;font-size:13px;color:#8fab9f}@media(max-width:660px){main{padding:22px 18px 50px}.metrics{grid-template-columns:1fr 1fr;gap:10px}.metrics article{padding:16px}.grid{grid-template-columns:1fr;gap:10px}h2{font-size:25px}th,td{padding:11px 7px;font-size:12px}figcaption{padding:15px}}'''

labels={
'CORE_TEST_RESULTS':('core.cjs','État, progression, collisions, codec'),
'COLONY_TEST_RESULTS':('colony.cjs','Tableaux, cachettes, soudures, escortes'),
'EXPLORATION_TEST_RESULTS':('exploration.cjs','Géométrie, détours, visée, mémoire'),
'PASSAGES_TEST_RESULTS':('passages.cjs','Raccords, écoute de seuil, détecteur'),
'PERSISTENCE_TEST_RESULTS':('persistence.cjs','MemoryStorage simulé, pas stockage natif certifié'),
'LIFE_TEST_RESULTS':('life.cjs','Habitants, coffres, ateliers, balises'),
'DEFENSE_TEST_RESULTS':('defense.cjs','Volets, alarmes, contournements, tirs'),
'DUCT_TEST_RESULTS':('ducts.cjs','Transferts et propriété unique des adultes'),
'MOBILITY_TEST_RESULTS':('mobility.cjs','Conduite, volume du châssis, entretien, dégâts, restrictions et migrations'),
'INSTALLER_TEST_RESULTS':('installer.mjs','Projets hôtes de test, conflits et restauration'),
'REAL_UPGRADE_TEST_RESULTS':('upgrade-real.mjs','Vrais fichiers et installateur 0.7 → 0.8 sur un shell de test'),
'BROWSER_V08A':('browser-v08.py A','Début au clavier, vrai export 0.7, cabine et commandes'),
'BROWSER_V08B':('browser-v08.py B','Conduite, jonction réelle, vrai export roulant, stationnement et carte'),
'BROWSER_V08C':('browser-v08.py C','Entretien fini, attaque, deux vrais exports et formats à 130 %')}
qa=['# Qualification locale — '+v,'',
'Les suites ci-dessous ont été réellement achevées sur les fichiers livrés. Les anciens chiffres sous history/ ne qualifient pas cette version. Les groupes et assertions ne désignent pas autant de sessions humaines.','',
f'HTML de jeu courant : SHA-256 `{sha}`. Le résultat QUALIFICATION_MODEL.json lie les exécutions Node à l’empreinte de chaque fichier source. Les trois sessions navigateur portent l’empreinte du HTML final.','',
'| Suite exécutée | Résultat | Portée |','|---|---:|---|']
for n in model_names+['INSTALLER_TEST_RESULTS','REAL_UPGRADE_TEST_RESULTS']+browser_names:
 a,b=labels[n];qa.append(f'| {a} | {num(n)}/{num(n)} | {b} |')
qa += ['',f'**Modèle : {model}/{model}. Navigateur courant : {browser}/{browser}.** Aucune erreur JavaScript de page dans les trois recettes achevées. Les {len(caps)} captures correspondent au HTML courant. Les anciens 47 contrôles navigateur 0.7 ne sont pas additionnés comme s’ils avaient été rejoués.','',
'| Pilote depuis une nouvelle partie | Résultat | Couverture |','|---|---:|---|']
tr_labels=[('traversal.cjs','Campagne principale et escortes'),('traversal-exploration.cjs','Ajoute six détours et leurs passages aller/retour'),('traversal-life.cjs','Ajoute habitants, conversations, réserves et fabrication'),('traversal-defense.cjs','Ajoute volets et avertisseurs accessibles tôt'),('traversal-ducts.cjs','Ajoute les dix grilles techniques'),('traversal-mobility.cjs','Ajoute conduite, trois passages routiers et une recharge avant de terminer le parcours')]
for a,b in tr_labels:qa.append(f'| {a} | 6/6 | {b} |')
qa += ['','## Ce que les 36 parcours prouvent','',
'Chaque famille contient les deux présentations et les trois difficultés. Les pilotes marchent et conduisent avec Simulation.update, les commandes, les ressources et les solutions disponibles dans le jeu. Ils n’injectent pas de réussite d’objectif, ne téléportent pas le personnage et ne réécrivent pas sa santé. L’assistance de début de chapitre reste active. Les minuteries du modèle sont avancées par ses pas de simulation, pas par une attente humaine.','',
'Le nouveau tour prépare le tracteur par l’objectif existant, rejoint la piste à pied, embarque, roule vers le plateau, revient à la piste, descend et recharge à la borne, remonte et retourne au plateau. Il termine ensuite les 49 objectifs, les deux escortes, les six détours et les activités héritées. Les trois passages sont des jonctions discrètes entre deux vraies pièces, pas un monde routier continu. Le pilote connaît les itinéraires ; ses chronomètres ne donnent ni durée de découverte humaine ni difficulté finale.','',
'Les dégâts de châssis, les collisions rapides, l’occupation de la sortie, les interdictions de Newt ou des compagnons, les pannes et les stocks finis sont éprouvés séparément dans mobility.cjs avec des états localisés préparés. Le tour précoce de conduite ne prétend pas avoir éprouvé chaque rencontre sous une menace tardive.','',
'## Navigateur et captures','',
'Le CLI agent-browser est absent. La tentative HTTP locale conservée dans SMOKE_V08.json a renvoyé net::ERR_BLOCKED_BY_ADMINISTRATOR. Playwright charge le HTML exact par set_content dans l’origine opaque autorisée, sans changement d’origine ni contournement de politique. Les boutons, le clavier et le sélecteur de fichiers ordinaires sont employés ; la simulation, la santé, les positions et les objectifs ne sont pas réécrits pendant ces interactions navigateur.','',
'La session A commence une partie neuve puis valide le premier objectif au clavier. Les autres états ciblés sont des fixtures préparées, validées et importées par le menu. La session B conduit réellement sur la piste puis utilise le vrai seuil routier, descend, vérifie le stationnement et le mode classique. La session C répare, recharge, interrompt un service et observe un adulte attaquer la coque. Les formats 390×844 et 844×390 à 130 % sont des tailles émulées : aucun téléphone ou appareil tactile matériel, Safari/iPhone ou contrôleur physique n’est certifié.','',
'Les attentes utilisent l’état observable ou le temps de simulation normalement écoulé. Trois sessions séparées bornent les ressources. Les anciennes recettes navigateur sont conservées comme sources d’historique, mais leurs rapports ne sont pas présentés comme les résultats courants. Les captures initiales de smoke ont été exclues de la galerie et du paquet final.','',
'## Persistance : fichiers réels et protocole simulé','',
'Les sept fichiers real-v01-save.json à real-v07-save.json proviennent des livraisons correspondantes, pas d’états courants renommés. La 0.7 est son véritable export d’un adulte en transfert de gaine. Ses identifiants, sa santé et la progression sont comparés après import ; les minuteries continuent normalement une fois le jeu repris.','',
'Les véritables téléchargements browser-v08-driving.json, browser-v08-serviced.json et browser-v08-damaged-hull.json sont relus puis importés par le menu. Vitesse et conducteur persistent sans seconde montée ; les stocks d’entretien consommés et les dégâts de coque ne sont pas remis à neuf. Un travail de montée ou de réparation interrompu n’attribue aucun bénéfice ni débit.','',
'Les deux copies locales sont vérifiées avec MemoryStorage simulé. Le stockage natif après fermeture, ses quotas, plusieurs onglets simultanés et le mode privé demeurent non qualifiés. La réussite de l’import/export ne prouve pas ces comportements.','',
'## Corrections issues des essais','',
'Une ancienne position à pied pouvait recouvrir le nouveau stationnement. La migration déplace désormais le nouveau tracteur vers un emplacement libre, jamais l’ancien personnage. Un coffre/borne ne prélève pas de réserve à pleine santé ou batterie. L’ancien accroupissement est effacé à la montée et C ne garde plus le frein verrouillé en cabine. Le HUD de combat s’efface pendant la conduite, puis revient après descente. Les copies décoratives de véhicule ont été remplacées et le numéro 01 ne s’inverse pas avec l’orientation.','',
'La première assertion de test de migration cherchait à tort la propriété transfers au lieu de transits dans le format de gaines hérité : le test a été corrigé et toute la session A rejouée. Les résultats finaux des trois sessions correspondent au dernier HTML, après les corrections de commandes et de décor.','',
'## Livraison et limites','',
'L’installation et le retour arrière emploient des shells de test. Le vrai payload 0.7 et son installateur y sont utilisés pour la montée de version ; aucun build du Tantalus natif n’est revendiqué. Les contrôles de reconstruction et ceux du rapport sont séparés des totaux de gameplay.','',
'Un seul véhicule, deux pièces pilotables, pas de véhicule pour Newt ou de siège compagnon. Mode classique avec stationnement arrière discret, pas stationnement latéral physique. Pas d’écrasement ni de tourelle. Panne loin d’une borne : sortie et continuation à pied, pas remorquage. Les raccords verticaux restent bornés, les gaines ne simulent pas tous les adversaires hors champ. Aucun test humain de difficulté, de durée ou de performance matérielle.','',limitations]
qa_text='\n'.join(qa)+'\n';(R/'docs/QA_REPORT.md').write_text(qa_text,encoding='utf-8')

captions={
'01-title-v08.png':('La reconstitution continue','Menu du HTML final. Les chiffres de campagne restent ceux du parcours conservé.'),
'02-first-task-v08.png':('Début réellement joué','Premier objectif accompli par déplacement au clavier et interaction depuis une partie neuve.'),
'03-cabin-panel-v08.png':('La cabine se consulte sur place','État préparé et importé : Anne près du véhicule. Les commandes hors de portée ou inadaptées sont désactivées.'),
'04-boarded-v08.png':('Au poste de conduite','Montée temporisée, puis commandes de conduite. L’accroupissement précédent n’immobilise plus le véhicule.'),
'05-driving-v08.png':('Exporter pendant le déplacement','La pause est ouverte pour télécharger un vrai fichier contenant vitesse, conducteur et batterie. Le menu suspend le temps, pas l’état enregistré.'),
'06-plateau-driving-v08.png':('Du périmètre au plateau','La fixture initiale a été chargée par le menu. Ensuite : conduite au clavier, freinage, vrai accès routier et progression sur le plateau. Capture à l’arrêt ; pas une illustration d’intention.'),
'07-parked-on-foot-v08.png':('Reprendre l’exploration à pied','Descente après immobilisation. Le véhicule reste où il est garé et ne suit pas le personnage.'),
'08-finite-service-v08.png':('Une borne peut se vider','Fixture d’entretien importée, réparation et recharge effectuées par leurs manœuvres. Les réserves épuisées ne reviennent pas après export/import.'),
'09-hull-under-attack-v08.png':('Le châssis est vulnérable','Fixture de menace déclarée : un adulte existant attaque le véhicule occupé. La coque absorbe les premiers dégâts, sans rendre le conducteur immortel une fois hors service.'),
'10-cabin-portrait-v08.png':('Cabine en portrait','Écran 390×844, texte à 130 %. Redimensionnement Chromium : pas une certification de téléphone physique.'),
'11-driving-portrait-v08.png':('Terrain visible en portrait','Le HUD de cabine laisse voir le véhicule. Ce format est émulé, pas un test tactile matériel.'),
'12-cabin-landscape-v08.png':('Lecture en paysage court','Écran 844×390 à 130 %, commandes et retour accessibles dans un dossier défilant.')}
metrics=''.join(f'<article><b>{n}</b><span>{escape(t)}</span></article>' for n,t in [(1,'TRACTEUR PILOTABLE'),(2,'ZONES DE CONDUITE'),(2,'BORNES À STOCK FINI'),(36,'PARCOURS DU MODÈLE')])
report=[f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fleuve de la Douleur — Rapport 0.8</title><style>{css}</style></head><body><main><header><p class="eyebrow">ALIENS: TANTALUS FRONTIER / ARCHIVE MIRE / LIVRAISON LOCALE</p><h1>ALIEN<br>FLEUVE DE<br>LA DOULEUR</h1><p class="subtitle">{escape(m["subtitle"])}</p><span class="tag">{escape(v.upper())} · 29 SEPTEMBRE 2026</span></header>',
'<nav><a href="JOUER.html">Ouvrir le jeu</a><a href="docs/CODEX_LEVEL_DESIGN.md">Codex pièce par pièce</a><a href="docs/QA_REPORT.md">Qualification détaillée</a></nav>',
'<p class="notice"><strong>Un véhicule utilisable, pas toute la colonie motorisée.</strong> La piste et le plateau accueillent le tracteur ; les intérieurs et l’épave se parcourent à pied. Cette livraison reste un moteur autonome, avec graphismes stylisés provisoires et lanceur additionnel. Aucun push ou déploiement distant.</p>',f'<section class="metrics">{metrics}</section>',
'<h2>Une piste, une coque, des réserves</h2><div class="grid"><article><h3>Monter et conduire</h3><p>La préparation du tracteur dans Les coordonnées donne accès au véhicule extérieur. Rejoindre la cabine, monter, accélérer, braquer dans la profondeur et freiner. Descendre demande un arrêt et un appui libre.</p></article><article><h3>Ne pas le perdre gratuitement</h3><p>La batterie et le châssis ne sont pas les réserves du personnage. Chocs et créatures peuvent immobiliser le véhicule. Deux bornes possèdent chacune une trousse et un accumulateur ; aucun réapprovisionnement automatique.</p></article><article><h3>Continuer sans véhicule</h3><p>Newt ne conduit pas, une escorte ne peut pas embarquer. Tous les objectifs principaux restent faisables à pied. Une panne loin d’une borne n’est pas remorquée automatiquement.</p></article><article><h3>Deux présentations bornées</h3><p>En profondeur, l’emprise entière du véhicule compte. En classique, le véhicule vide se range sur le plan arrière pour laisser une bande piétonne. La jonction piste–plateau est discrète, pas un extérieur continu.</p></article></div>',
'<h2>Le jeu en exécution</h2><p>Les douze images ci-dessous sont des captures Chromium du HTML fourni. Les scènes ciblées utilisent des sauvegardes de test importées par le menu, puis des commandes ordinaires. Elles ne sont ni des scènes du roman nouvellement authentifiées ni une partie complète jouée manuellement.</p>']
for name in captions:
 cap=caps[name];blob=(R/cap['file']).read_bytes();title,desc=captions[name];portrait=' class="portrait"' if 'portrait' in name else ''
 report.append(f'<figure{portrait}><img src="data:image/png;base64,{base64.b64encode(blob).decode()}" alt="{escape(title)}" data-source="{escape(cap["file"])}"><figcaption><b>{escape(title)}</b><p>{escape(desc)}</p><details><summary>Provenance de la capture</summary><p>{escape(cap["setup"])}</p><code>{escape(json.dumps(cap.get("state",{}),ensure_ascii=False,sort_keys=True))}</code><small>PNG SHA-256 : {hashlib.sha256(blob).hexdigest()}</small></details></figcaption></figure>')
report += ['<h2>Qualification courante</h2><div class="table-wrap"><table><thead><tr><th>PÉRIMÈTRE</th><th>RÉSULTAT</th><th>PORTÉE</th></tr></thead><tbody>']
for a,n,b in [('Modèle',model,'Cas locaux et états ; MemoryStorage reste simulé'),('Parcours complets',36,'Six familles × deux vues × trois difficultés'),('Installateur',num('INSTALLER_TEST_RESULTS'),'Projets hôtes de test'),('Vraie montée 0.7 → 0.8',num('REAL_UPGRADE_TEST_RESULTS'),'Vrai payload, shell hôte de test'),('Navigateur',browser,'Trois sessions sur le HTML exact actuel')]:report.append(f'<tr><td>{escape(a)}</td><td>{n}/{n}</td><td>{escape(b)}</td></tr>')
report += ['</tbody></table></div><p>Les pilotes savent déjà où aller et emploient les commandes du modèle. Aucune durée humaine ou difficulté de découverte n’est déduite de ces chiffres. Les anciennes recettes navigateur ne sont pas additionnées aux nouvelles.</p>',
'<h2>Reprendre une sauvegarde</h2><p>Les véritables exports 0.1 à 0.7 sont testés. Les nouveaux téléchargements de véhicule roulant, d’entretien épuisé et de coque endommagée sont réimportés sans deuxième montée ni réparation gratuite. La persistance native après fermeture du navigateur reste non qualifiée ; les tests de double copie emploient un stockage simulé.</p>',
'<h2>Commandes du tracteur</h2><p><strong>5 ou E :</strong> cabine. <strong>Q/D :</strong> avancer ou reculer sur le plan horizontal. <strong>Z/S :</strong> braquer en profondeur en roulant. <strong>Espace ou C :</strong> frein maintenu. <strong>F :</strong> avertisseur. <strong>L :</strong> phares. Le compteur indique des km/h simulés, selon une échelle de jeu non officielle. Les accès intérieurs demandent de descendre.</p>',
f'<footer><p>{escape(limitations)}</p><p>Le roman intégral n’a pas été relu pour cette passe ; les mécaniques sont originales. Les dimensions et vitesses sont des unités de gameplay. Aucun remorquage, multijoueur ou essai sur manette physique.</p><small>HTML du jeu qualifié : {sha}</small></footer></main></body></html>']
html=''.join(report);(R/'RAPPORT_ILLUSTRE.html').write_text(html,encoding='utf-8')
result={'version':v,'passed':True,'standaloneSHA256':sha,'modelChecks':model,'completeTraversals':36,'browserChecks':browser,'captures':len(caps),'codexLines':len(codex.splitlines()),'reportSHA256':hashlib.sha256(html.encode()).hexdigest(),'scope':'Generated from current manifest, actual completed tests and actual PNGs; not a human-playtime claim'}
(R/'docs/DOCUMENTATION_BUILD.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,indent=2))
