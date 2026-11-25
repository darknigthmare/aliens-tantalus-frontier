#!/usr/bin/env python3
"""Current delivery documents; only recorded results are used. No canonical completion score."""
from pathlib import Path
import json,html,re,base64,io,hashlib,collections,shutil
from PIL import Image
from report_shared import page,md,schematic as base_schematic
R=Path(__file__).resolve().parents[1];D=json.loads((R/'data/campaign.json').read_text());F=D['fidelity'];V=D['meta']['version'];ROOM={r['id']:r for r in D['rooms']};E=html.escape
OUT=R/'reports/v0100';OUT.mkdir(exist_ok=True)
def jread(p):return json.loads((R/p).read_text())
def write(p,t):(R/p).write_text(t,encoding='utf-8')
def table(head,rows):return '<table><thead><tr>'+''.join('<th>'+E(str(s))+'</th>'for s in head)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+str(c)+'</td>'for c in row)+'</tr>'for row in rows)+'</tbody></table>'
def escells(row):return [E(str(v))for v in row]
def header(eyebrow,title,sub,nav):return '<header><div class="eyebrow">'+eyebrow+'</div><h1>'+title+'</h1><p class="sub">'+sub+'</p><span class="tag">V'+V+' · PROTOTYPE AUTONOME · FIDÉLITÉ PARTIELLE</span><nav>'+''.join(f'<a href="#{k}">{v}</a>'for k,v in nav)+'</nav></header>'
def source(s):
 if not s:return 'Création / élément non authentifié'
 a=next(x for x in F['sources']if x['id']==s);return '<a href="#source-'+s+'">'+E(a['title'])+'</a>'
def picture(p,cap,phone=False):
 im=Image.open(p).convert('RGB');b=io.BytesIO();im.save(b,format='WEBP',quality=88,method=5);uri='data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode();return '<figure'+(' class="phone"'if phone else'')+'><img loading="lazy" src="'+uri+'" alt="'+E(cap,quote=True)+'"><figcaption>'+E(cap)+'</figcaption></figure>'
def scheme(r):
 s=base_schematic(r);sx=lambda x:30+x/r['width']*940;sy=lambda z:40+z*195;g=[]
 for p in r['doors']:
  q=p['portal'];x=sx(p['x']);y=sy(.55 if r['mode']=='SIDE'else p['z']);m=q['mount'];ax=20 if m=='left'else 980 if m=='right'else x;ay=38 if m=='back'else 223 if m=='front'else y
  g.append(f'<path d="M{x:.2f} {y:.2f} L{ax:.2f} {ay:.2f}" stroke="#d9dbb8" stroke-dasharray="2 4"/><rect x="{ax-8:.2f}" y="{ay-5:.2f}" width="16" height="10" fill="#132c34" stroke="#d9dbb8" stroke-width="2"/>')
 if r.get('armoryRack'):
  a=r['armoryRack'];x=sx(a['x']);y=sy(a['z']);g.append(f'<path d="M{x} {y}V40" stroke="#d5b7ce" stroke-dasharray="3 4"/><rect x="{x-12}" y="31" width="24" height="14" fill="#68576f"/><text x="{x}" y="17" fill="#dcc4dd" font-size="10" text-anchor="middle">RÂTELIER</text>')
 for a in r.get('cast',[]):
  x=sx(a['x']);y=sy(.55 if r['mode']=='SIDE'else a['z']);g.append(f'<circle cx="{x}" cy="{y}" r="3" fill="#f5c18c"><title>{E(F["characters"][a["id"]]["name"])} — présence conditionnelle</title></circle>')
 s=s.replace('</svg>',''.join(g)+'</svg>').replace('Pas une capture du jeu.','Rectangles clairs sur les bords : ouvertures architecturales ; pointillés : accès depuis le sol, pas mur supplémentaire. Point orange : personnage conditionnel. Pas une capture du jeu ; aucun plan canonique métrique revendiqué.')
 return s

B=jread('reports/v0100/browser.json');A=jread('reports/v0100/regression/browser.json');C=jread('reports/v0100/campaign.json');H=hashlib.sha256((R/'MER_DES_CHAGRINS_JOUABLE.html').read_bytes()).hexdigest()
assert B['html_sha256']==A['html_sha256']==H,'Browser report is not from the current HTML'
assert B['failed']==A['failed']==0 and all(x['passed'] for x in C['outcomes'])
node=(OUT/'node-final.txt').read_text();np=int(re.search(r'# pass (\d+)',node).group(1));assert '# fail 0' in node
counts=dict(version=V,rooms=len(D['rooms']),connections=len(D['edges']),reciprocal_connections=sum(bool(e['bidirectional'])for e in D['edges']),one_way_narrative_connections=sum(not e['bidirectional']for e in D['edges']),thresholds=sum(len(r['doors'])for r in D['rooms']),threshold_coordinates_changed=len(jread('reports/v0100/door-diff-final.json')),chapters=len(D['chapters']),objectives=sum(len(c['objectives'])for c in D['chapters']),dossiers=len(D['codex']),static_obstacles=sum(len(r['obstacles'])for r in D['rooms']),dressing_placements=sum(len(r['dressing'])for r in D['rooms']),dressing_families=len(set(a['kind']for r in D['rooms']for a in r['dressing'])),misleading_dressing_replaced=len(jread('reports/v0100/decor-access-corrections.json')),armory_racks=sum(bool(r.get('armoryRack'))for r in D['rooms']),shared_armory_allocations=1,playable_weapons=5,weapon_reference_entries=len(F['weapons']),equipment_reference_entries=len(F['equipment']),character_cards=len(F['characters'])-1,full_novel_compared=False,canonical_percent=None)
write('reports/CONTENT_COUNTS.json',json.dumps(counts,ensure_ascii=False,indent=2)+'\n')
summary=dict(version=V,html_sha256=H,node_passed=np,node_failed=0,browser_targeted_passed=B['passed'],browser_regression_passed=A['passed'],browser_total=B['passed']+A['passed'],browser_failed=0,full_campaigns_passed=sum(x['passed']for x in C['outcomes']),round_trip_saves=sum(x['objectives']for x in C['outcomes']),room_renders=100,captures=len(B['captures']),native_persistence_certified=False,physical_gamepad_certified=False,human_playthrough=False,host_integration=False,deployment=False,counts=counts)
write('reports/v0100/SUMMARY.json',json.dumps(summary,ensure_ascii=False,indent=2)+'\n')

# Content/appearance register. Only source claims are attributed; rendering choices stay explicit.
intro='''<p class="note"><strong>Le 1:1 est une cible, pas le statut de cette livraison.</strong> Le texte intégral n’a pas été confronté au jeu. Les notices éditoriales et l’extrait public sont distingués des fiches secondaires. Les 50 salles sont des implantations originales : leur fonctionnement vérifié ne prouve pas qu’elles couvrent tous les lieux du livre. Aucun pourcentage de fidélité n’est attribué.</p>'''
registry=intro+'<section id="lieux"><h2>Couverture des grands lieux</h2><p>Cette matrice est un inventaire de travail, non une table exhaustive de tous les chapitres éditoriaux. « Présent » indique une représentation de jeu ; « condensé » ne vaut pas reconstitution de toutes les scènes.</p>'
registry+=table(['Référence de travail','Salles actuelles','État','Appui'],[[E(l['name']),E(', '.join(l['rooms'])or'Aucune zone visitable'),E(l['status']),source(l['source'])]for l in F['locations']])+'</section>'
registry+='<section id="personnages"><h2>Personnages : apparence et présence réelle</h2><p>Les visages complets, les mensurations, les couleurs exactes des tenues et la plupart des accessoires restent interprétés. Aucun visage n’est déduit d’un patronyme ou copié sur un interprète du livre audio. « Fiche seule » n’est pas comptée comme une scène de campagne jouée. L’équipe médicale est composite.</p>'
rows=[]
for k,c in F['characters'].items():
 if k=='worker':continue
 places=[r['id']for r in D['rooms']if any(a['id']==k for a in r.get('cast',[]))]
 state='Joueur principal'if k=='decker'else'Compagnon actif après son arrivée ; comportement tactique adapté'if k=='manning'else('Figuration interactive en '+', '.join(places)if places else'Fiche seule ; scène individuelle non reconstituée')
 if k in ['adams','elway']:state+=' ; porteur physique après préparation ; tableau de stase en s38'
 refs='titan'if k=='decker'else'excerpt'if k=='harriman'else k if k in ['adams','manning','rollins']else None if k=='medic'else'plot'
 rows.append([E(c['name']),E(c['role']),E(c['known']),E(state),source(refs)])
registry+=table(['Personnage','Fonction','Traits / limites','Présence dans cette version','Appui'],rows)+'</section>'
registry+='<section id="armes"><h2>Armes : ne pas confondre fiche et équipement jouable</h2><p>La v0.10 dispose de cinq armes manipulables, mais le registre contient sept entrées. Les grenades et charges orbitales ne deviennent pas deux armes de poche. La dotation supplémentaire offerte à Decker est un choix de jeu, pas une attribution authentifiée par le roman.</p>'
registry+=table(['Arme','État réel','Élément référencé','Ce qui reste interprété','Source'],[[E(w['name']),E(w['status']),E(w['canonical']),E(w['limits']),source(w['source'])]for w in F['weapons']])+'</section>'
registry+='<section id="materiel"><h2>Équipement et dispositifs</h2><p>Une source sur l’environnement n’authentifie pas un modèle d’accessoire. Les quantités, coûts, interfaces et contraintes techniques du prototype sont des règles originales.</p>'
registry+=table(['Matériel','État','Limites','Appui'],[[E(e['name']),E(e['status']),E(e['limits']),source(e['source'])]for e in F['equipment']])+'</section>'
registry+='<section id="ecarts"><h2>Écarts encore ouverts</h2>'+''.join('<p>'+E(s)+'</p>'for s in F['remaining'])+'<p>Markowitz et Herschel ne disposent pas ici de scènes individuelles ni de portraits authentifiés. Les autres villes de la compagnie ne sont pas transformées en zones visitables sans séquence correspondante établie. Les 10 annexes restent des ajouts de jeu. Les grenades de Silas ne sont pas librement lançables ; le « shocker » reste à vérifier. Le choix de ne pas inventer un modèle n’est pas une preuve de son absence dans l’œuvre.</p></section>'
registry+='<section id="sources"><h2>Sources et portée</h2><p>'+E(F['sourcePolicy'])+'</p>'
for s in F['sources']:
 registry+=f'<article id="source-{s["id"]}"><h3>{E(s["title"])}</h3><p><strong>{E(s["tier"])}</strong> · {E(s["scope"])}</p><p><a href="{E(s["url"],quote=True)}" rel="noreferrer">{E(s["url"])}</a></p></article>'
registry+='</section>'
reg_head=header('AUDIT DE FIDÉLITÉ / SOURCES PUBLIQUES','Une référence,<br>un état réel','Ce qui est dans le jeu, ce qui est seulement documenté, ce qui reste à confronter au texte.', [('lieux','Lieux'),('personnages','Personnages'),('armes','Armes'),('materiel','Équipement'),('ecarts','Écarts'),('sources','Sources')])
write('REGISTRE_FIDELITE_MER_DES_CHAGRINS.html',page('Registre de fidélité — '+V,reg_head,registry))

# Current guide, retain actual mechanics from prior version without relabelling old evidence as new tests.
old=R/'docs/CODEX_DLC_MER_DES_CHAGRINS.md';hist=R/'docs/historique/CODEX_DLC_MER_DES_CHAGRINS_v090.md'
if not hist.exists():shutil.copy2(old,hist)
base=hist.read_text();base=base.replace('## 0.9.0 — Les échos du terrain','## '+V+' — Les seuils de la mémoire',1)
newguide='''## Ajouts 0.10 : architecture, distribution et dotations

La version actuelle documente 50 salles, 59 liaisons et 113 seuils fonctionnels. 54 liaisons sont réciproques, cinq sont des transferts narratifs à sens unique. 98 positions de seuil ont changé depuis la v0.9. Le personnage arrive depuis la face associée au passage. Les transports, cages, escaliers, rampes et passages rocheux sont distingués. En Latérale, le point d’interaction rejoint la bande de marche, pas l’ouverture architecturale de fond ou de premier plan. Huit anciens habillages suggérant des portes ou des cages supplémentaires sont remplacés par des équipements techniques.

Deux râteliers partagent une seule dotation facultative, accessible après la remise de l’équipement : Réserve de matériel (s09, x1750) ou Atelier de chantier (s17, x1700). Approcher physiquement et interagir ; le panneau ne permet pas un retrait depuis la carte. Il fournit une seule fois le fusil à impulsions (30 cartouches chargées, 60 de réserve) et le plasma (12 tirs dans la cellule montée, deux cellules de réserve). L’attribution de ces deux armes au joueur et tous ces chiffres sont des choix d’adaptation.

Équipement → Armes permet de choisir les cinq armes possédées. Le cycle manette parcourt également les armes débloquées. Les raccourcis 1/2/3 conservent les trois armes initiales : les deux fusils n’ont pas de nouvelles touches numériques dédiées. R recharge en 1,1 seconde ; le fusil à impulsions prélève sa réserve à la fin de l’action. Le plasma remplace sa cellule uniquement à vide. Sa chaleur monte de 28 par tir, descend de 12 par seconde et bloque à 100 jusqu’au retour à 30 ou moins. La jauge /100 est une unité de jeu, pas une température physique. Le plasma n’est pas un rayon traversant les murs. Ses sons actuels réemploient un profil de tir générique de la synthèse existante.

Les anciens ravitaillements et casiers ne recréent pas les cartouches ou cellules de cette allocation. Les tirs respectent les lignes de vue, les profondeurs et les cloisons. Les nouvelles armes peuvent tuer le spécimen à capturer et faire échouer la mission. L’ancien lance-flammes reste une arme d’adaptation explicitement non authentifiée dans les sources consultées. La règle des trois attaches de la reine reste également originale.

Le menu « Fidélité et sources » est disponible au titre, dans Pause et depuis l’Équipement. Il sépare les traits sourcés et les visages interprétés, les lieux condensés et les annexes originales, les armes jouables et les références narratives. Les 16 fiches publiques comprennent une équipe médicale composite. Quatre rôles nommés n’ont encore qu’une fiche : Silas, Muller, Dave et Pritchett. Les 126 dossiers ne sont pas 126 scènes reconstituées.

Adams et Elway conservent des parasites visibles pendant le transport et dans le tableau de stase. Le parasite d’Adams reprend une variante royale indiquée par une notice secondaire ; sa taille graphique n’est pas une mesure canonique. Les tenues et visages sont interprétés, sauf traits explicitement signalés dans le registre. Les courtes interactions de figurants ne remplacent pas leurs actes et décès complets dans le livre.

### Compatibilité des nouvelles armes

Le schéma principal reste 8, avec un bloc optionnel `armory` de révision 1. Les formats 1 à 8 antérieurs sont acceptés ; une ancienne partie reçoit une allocation non retirée et aucune munition supplémentaire gratuite. Une partie contenant déjà les nouvelles armes est destinée à la v0.10 ou ultérieure. Son retour à la v0.9 n’est pas garanti : conserver l’export ancien séparément. Les armes consommées, la chaleur, le verrou thermique et la dotation partagée sont sérialisés.

'''
base=base.replace('## Commencer et reprendre',newguide+'## Commencer et reprendre',1)
base=base.replace('Le schéma de jeu reste **8** : aucune donnée de campagne ne nécessite ici un changement de format.', 'Pour les options héritées de la v0.9, le schéma de jeu reste **8**. La v0.10 ajoute le bloc optionnel d’armurerie décrit plus haut.')
base=base.replace('120 dossiers','126 dossiers');write('docs/CODEX_DLC_MER_DES_CHAGRINS.md',base)
level=(R/'docs/CODEX_LEVEL_DESIGN_50_SALLES.md').read_text();content=md(level)
for r in D['rooms']:
 prefix=E(r['id'].upper()+' — '+r['name']);needle='<h3>'+prefix+'</h3>'
 assert needle in content,needle
 content=content.replace(needle,f'<h3 id="room-{r["id"]}">'+prefix+'</h3>'+scheme(r),1)
nav='<div class="roomlinks">'+''.join(f'<a href="#room-{r["id"]}">{r["id"].upper()} · {E(r["name"])}</a>'for r in D['rooms'])+'</div>'
codex_header=header('CODEX DE PRODUCTION / VERSION '+V,'Les seuils<br>de la mémoire','Guide cumulatif, registre de fidélité et implantation effective des 50 salles.', [('guide','Guide'),('audit','Fidélité'),('fiches','50 lieux'),('sources','Sources')])
codex_body=intro+'<section id="guide">'+md(base)+'</section><section id="audit"><h2>Registre de fidélité</h2>'+registry+'</section><section id="fiches"><h2>Les 50 implantations</h2>'+nav+content+'</section>'
write('CODEX_MER_DES_CHAGRINS.html',page('Codex complet — La Mer des Chagrins '+V,codex_header,codex_body))

# Delivery report: counts derived from current JSON, claims separate from previous releases.
report=intro+'<section id="changement"><h2>Ce qui a changé dans le jeu</h2><div class="cards"><article><h3>98 positions reprises</h3><p>113 seuils disposent d’une face, d’une classe architecturale et d’un point d’arrivée cohérent. Les accès de premier plan sont raccordés à une paroi en coupe ; les vols et transferts ne sont plus présentés comme de simples portes.</p></article><article><h3>Deux fusils manipulables</h3><p>Allocation finie commune à deux râteliers. Impulsions : 30 + 60 cartouches. Plasma : 12 tirs chargés + deux cellules ; chaleur, refroidissement et verrou. Paramètres de jeu, pas fiche balistique canonique.</p></article><article><h3>Personnages et porteurs</h3><p>Silhouettes et tenues différenciées, brèves interactions conditionnelles, parasites adhérents et tableau de stase. Traits secondaires identifiés ; visages complets non authentifiés. Quatre rôles nommés restent des fiches sans scène individuelle.</p></article><article><h3>Références traçables</h3><p>50 fiches de lieux, 16 fiches publiques de distribution, sept entrées d’armes et 14 d’équipement. Aucune promesse d’exhaustivité du livre ni de taux 1:1. Les armes narratives restent distinguées des cinq armes manipulables.</p></article></div>'
report+=table(['Contenu actuel','Nombre / état'],[[E(k),E(str(v))]for k,v in [('Salles / liaisons / objectifs','50 / 59 / 33'),('Liaisons réciproques / transferts narratifs','54 / 5'),('Seuils / coordonnées modifiées','113 / 98'),('Habillages trompeurs supprimés comme faux accès','8 remplacés par éléments techniques'),('Obstacles statiques / placements d’habillage','120 / 355'),('Familles d’habillage','50 (anciennement 52 ; pas 355 sprites uniques)'),('Râteliers / allocations indépendantes','2 / 1'),('Dossiers','126'),('Écrasement des cloisons / verticale continue','Non implémentés'),('Intégration native / déploiement','Non effectués')]])+'</section>'
report+='<section id="verification"><h2>Résultats courants, pas résultats hérités</h2><div class="stats">'+''.join('<article><strong>'+str(n)+'</strong><span>'+E(t)+'</span></article>'for n,t in [(np,'Tests Node réussis'),(B['passed']+A['passed'],'Contrôles navigateur réussis'),(6,'Parcours complets réussis'),(198,'Reprises après objectifs')])+'</div>'
report+=f'<p>Les contrôles navigateur sont {B["passed"]} vérifications ciblées (registre, armes, positions et 100 rendus de salles) et {A["passed"]} vérifications de régression (options, commandes, audio, stockage). Les anciennes suites de captures présentes dans l’archive ne sont pas toutes relancées et ne sont pas additionnées à ce total. Le journal <code>node-final.txt</code> indique {np} tests réussis, dont 29 nouveaux tests d’audit et d’armurerie.</p>'
report+='<p>Les tests structurels vérifient les faces opposées des liaisons réciproques, les cinq arrivées narratives, les approches et arrivées non bloquées, la séparation des pupitres, les deux présentations, la persistance et les blessures du même poursuivant. Les points de figuration et de râtelier ne chevauchent pas les accès. Le rendu de toutes les salles a été exécuté ; cela ne signifie pas une inspection humaine détaillée de chaque pixel dans chacune d’elles.</p></section>'
report+='<section id="parcours"><h2>Six campagnes terminées</h2><p>Chaque parcours visite 50 salles, termine 33 objectifs et reprend un export après chaque objectif. La nouvelle dotation est retirée sur place ; les deux nouveaux fusils sont tirés, puis le pilote conserve les armes historiques pour le reste du trajet. La balistique de combat des nouveaux fusils est contrôlée séparément dans les tests ciblés. Le capteur, la poursuite, les cloisons, les lectures, les éclairages, les casiers et l’escorte restent exercés.</p>'
report+=table(['Présentation','Difficulté','Objectifs','Salles','Intégrité Adams / Elway'],[[E(o['presentation']),E(D['difficulties'][o['difficulty']]['label']),str(o['objectives']),str(len(o['rooms'])),' / '.join(f'{a["integrity"]:.1f}' for a in o['convoy']['actors'])]for o in C['outcomes']])
report+='<p>Le pilote utilise les commandes et le planificateur de chemins du moteur, sans fixer directement positions, santé, réserves ou progression. Il a été adapté aux nouveaux seuils : rassemblement physique plus long, retraite près du seuil réel, pose de capteur réorganisée et emploi de mousse disponible pour protéger l’arrimage. Des essais intermédiaires ont échoué avant ces ajustements ; leurs journaux sont conservés. Ces six succès ne constituent ni six parties humaines ni une certification d’équilibrage. Les anciens échecs du pilote direct sont historiques, pas une mesure nouvelle de cette livraison.</p></section>'
report+='<section id="captures"><h2>11 captures du moteur livré</h2><p>Les scènes avancées proviennent des exports du parcours, sauf les deux contrôles de seuil explicitement préparés. Le rendu est figé pour les photographies. Les images ci-dessous sont des copies WebP compressées des PNG originaux inclus, pas des illustrations conceptuelles ni des retouches de position. Une sauvegarde de scénario n’est pas un playtest humain complet.</p>'
for x in B['captures']:
 caption=x['caption']+(' Source : '+x['source']+'.'if x['source']else'')+(' SCÈNE PRÉPARÉE.'if x['prepared']else'')
 report+=picture(OUT/'captures'/x['file'],caption,'390'in x['file'])
report+='</section><section id="limites"><h2>Limites de fidélité</h2>'+registry.split('<section id="ecarts">')[1].split('</section>')[0].replace('<h2>Écarts encore ouverts</h2>','')
report+='<p>Le détail complet et la portée des dix sources figurent dans le Registre de fidélité et le Codex. Aucune source primaire ne fournit ici un plan métrique de tous les lieux. La notice Titan étaye le cadre et le rôle de Decker ; les détails physiques retenus viennent surtout de fiches secondaires explicitement identifiées. Les descriptions des familles de décor, la majorité des traits physiques et tous les chiffres de combat restent interprétés. Aucun nouveau pack d’assets officiels, aucune ressemblance 1:1 certifiée.</p></section>'
report+='<section id="methode"><h2>Exécution et sauvegardes</h2><p>Les tentatives natives file:// et HTTP local ont réellement été faites dans cette passe : Chromium a renvoyé ERR_BLOCKED_BY_ADMINISTRATOR. Aucun contournement de ces politiques n’a été appliqué. Le véritable HTML a été exécuté dans le DOM avec une fixture mémoire de stockage déclarée. Les tests vérifient le comportement de sauvegarde dans cette fixture, pas la persistance native du navigateur de l’utilisateur.</p><p>Le schéma reste 8 avec extension optionnelle d’armurerie de révision 1. Les anciens formats 1 à 8 sont acceptés ; une ancienne partie ne reçoit pas de munitions consommées à nouveau après avoir retiré le kit. Une partie contenant les nouveaux fusils n’est pas certifiée rétrocompatible avec la v0.9. Exporter l’ancienne sauvegarde et la conserver séparément. Manette physique, tactile complet et audio sur matériel réel non certifiés.</p><p><strong>Aucun push GitHub, aucun déploiement Vercel, aucun adaptateur natif du moteur ou de l’économie de Tantalus Frontier.</strong> Le descripteur d’intégration et l’installateur ne font que documenter et copier une route autonome locale.</p></section>'
report_head=header('RAPPORT DE LIVRAISON / CAPTURES RÉELLES','Les seuils<br>de la mémoire','Architecture cohérente, dotations finies, distribution documentée — sans prétendre que le roman entier est déjà reproduit.', [('changement','Évolutions'),('verification','Contrôles'),('parcours','Campagnes'),('captures','Captures'),('limites','Fidélité'),('methode','Méthode')])
write('reports/RAPPORT_ILLUSTRE.html',page('Rapport illustré — '+V,report_head,report))
write('MER_DES_CHAGRINS_RAPPORT_ILLUSTRE.html',(R/'reports/RAPPORT_ILLUSTRE.html').read_text())
write('docs/QA_REPORT.md',f'''# QA courant — {V}

{np}/{np} tests Node ; {B['passed']}/{B['passed']} contrôles Chromium ciblés et {A['passed']}/{A['passed']} contrôles de régression = {B['passed']+A['passed']} au total. Six parcours, 50 salles / 33 objectifs, 198 reprises ; 100 rendus généraux préparés et 11 captures documentées.

Fichiers d’évidence : reports/v0100/SUMMARY.json, browser.json, regression/browser.json, campaign.json, node-final.txt et qa/fidelity-fixtures. Le rapport HTML expose les limites. Les résultats historiques ne sont pas additionnés aux résultats présents. Native file/HTTP bloqués ; stockage mémoire déclaré ; pas de matériel manette ni partie humaine certifiés.

Les modules de réglages et de synthèse des versions précédentes sont conservés. Les sons des nouvelles armes réemploient des profils existants. La fidélité 1:1 n’est pas validée. Aucune publication, aucun raccordement natif au jeu hôte.
''')
# Fresh continuity reference; do not overwrite the preserved old source history.
p=R/'docs/SOURCES_CONTINUITE.md';hist=R/'docs/historique/SOURCES_CONTINUITE_v090.md'
if not hist.exists():shutil.copy2(p,hist)
source_md='# Sources et limites — '+V+'\n\nAudit partiel : le texte intégral du roman n’a pas été comparé. La Library a fourni des index encyclopédiques, pas ce texte intégral. Les anciennes notes de sources sont conservées dans historique ; elles ne sont pas toutes recertifiées dans cette passe.\n\n'
for s in F['sources']:source_md+='## '+s['title']+'\n\n'+s['tier']+' — '+s['url']+'\n\n'+s['scope']+'\n\n'
source_md+='## Séparation\n\n'+F['sourcePolicy']+'\n\nPas de portraits empruntés aux comédiens audio. Pas de M41A ni de XM99A imposé au fusil plasma 50 W. Les appareils de capteur, les allures de brancards, le feu de boss et les annexes sont des choix de jeu. Le nom du vaisseau de récupération n’est pas repris d’une œuvre ultérieure. Le dossier complet sans pourcentage inventé se trouve dans REGISTRE_FIDELITE_MER_DES_CHAGRINS.html.\n'
write('docs/SOURCES_CONTINUITE.md',source_md)
print('Documents ready:',counts,'Browser',summary['browser_total'])
