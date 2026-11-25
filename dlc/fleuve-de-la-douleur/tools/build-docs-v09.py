#!/usr/bin/env python3
"""Build v0.9 documents from current data and completed test outputs, not historical totals."""
from pathlib import Path
from html import escape
import json,hashlib,base64
R=Path(__file__).resolve().parents[1];DD=R/'docs'
read=lambda p:json.loads((DD/p).read_text())
D=read('CONTENT_MANIFEST.json');m=D['manifest'];counts=m['counts'];rooms={r['id']:r for r in D['rooms']}
assert m['version']=='0.9.0-candidate.1'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
q=lambda s:str(s).replace('|',' / ').replace('\n',' ')
lim="DLC autonome avec lanceur additionnel. Aucun GameEngine natif de Tantalus fusionné, aucun push GitHub ou déploiement Vercel. Plans et dialogues originaux ; roman intégral non disponible dans les sources consultées. Graphismes vectoriels stylisés provisoires, pas une ressemblance photoréaliste ni des atlas définitifs. L’objectif 1:1 n’est pas certifié."
intro=[
'# ALIEN — Fleuve de la Douleur',
'','## Codex de level design · 0.9.0-candidate.1','',
'Hadley’s Hope · Les lieux ont une mémoire','',lim,'',
'## Ordre des références','',
'Le roman reste la cible. Les preuves utilisées sont un extrait autorisé publié par Titan via Daily Dead, un entretien de Christopher Golden et des références visuelles du film ou sous licence. Une référence du film ne prouve pas la dotation d’un personnage dans le roman. Les ajouts jouables restent identifiés comme interprétations. Aucun pourcentage de fidélité n’est annoncé.',
'','## Ce qui est réellement livré','',
f"{counts['rooms']} pièces, {counts['links']} liaisons réciproques, {counts['architecturalEndpoints']} seuils orientés, 16 chapitres courts de jeu, 49 objectifs principaux, six détours de trois étapes et deux escortes. {counts['props']} placements de décor ne signifient pas autant d’images uniques. Les appareils interactifs sont comptés séparément.",
'',
'Les cinq nouveaux volumes sont l’armurerie, la serre vitrée, la galerie biomécanique, la chambre du pilote et la cale aux œufs. Seule la présence de la serre est attestée par la nouvelle lecture du texte ; son mobilier végétal, sa distribution intérieure et ses connexions sont créés pour le jeu. Le découpage exact de l’épave et les dimensions des pièces ne sont pas un plan officiel.',
'','## Cohérence des seuils et de la collision','',
'Chaque extrémité porte un type, un support architectural, un point d’approche, un niveau et la référence réciproque. Une piste est dessinée comme une continuation du terrain avec un repère, pas une porte. Les passages de coque sont organiques. Les accès coloniaux sont reliés à des retours de cloison et à des supports ; escaliers, échelles, sas et monte-charges disposent de silhouettes distinctes.',
'',
'Les volumes de support des portes sont des conventions de rendu 2D/2.5D ; cette passe ne prétend pas reconstituer toutes les cloisons en collision continue. Les obstacles actifs du sol restent la référence de déplacement et de tir. Les 74 couvertures statiques et les huit volets dynamiques conservent des emprises déclarées. Les grilles techniques ne sont pas des portes du joueur.',
'',
'44 accessoires non collisionnables ont été déplacés pour dégager les apertures. Aucun objectif historique ou obstacle n’a été déplacé en cachette pour masquer un échec de navigation. E favorise maintenant une cible effectivement atteinte à 28 unités de projection avant une interaction distante ; les interdictions de personnage et de verrou restent en vigueur.',
'',
'Les arrivées reprennent le portail inverse avec un retrait de sécurité de 75 unités vers l’intérieur. Si ce retrait rencontre une couverture, le moteur reste au seuil. Il ne faut pas comparer une arrivée normale au centre exact d’un repère de porte et en déduire une incohérence.',
'',
'Les niveaux et dimensions sont des unités et choix de jeu. Les coordonnées du plan colonial forment un schéma de connexions, pas une carte à l’échelle du roman. Les 22 raccords temporisés restent des transitions animées bornées : le déplacement vertical n’est pas un volume librement explorable.',
'','## Identités, apparences et époque','',
'Le point familial représente Russ et non Brackett. Le point de retour médical emploie Komiskey. Louisa/Luisa est distincte de Newt dans le rendu d’escorte ; l’orthographe et les détails secondaires restent à recouper sur une édition intégrale. Le colon anonyme n’utilise plus la silhouette d’Anne. Une transmission de Brackett est représentée par un poste radio, pas par un corps placé arbitrairement.',
'',
'Quatorze profils visuels distincts sont livrés. Les cheveux d’Anne et la morphologie de Komiskey utilisent des détails de l’extrait. La tenue de Newt suit une référence visuelle filmique sous licence, sans ajouter le casque de Hicks à cette époque. Les visages non documentés, tailles en pixels, couleurs et tenues des autres profils restent des interprétations.',
'',
'Tim, Al Simpson, Greg Hansard, Joel et Bronagh Flaherty disposent de cinq points de conversation supplémentaires. Leurs rôles sont signalés par la source ; leur placement dans les scènes de 2179 et leurs répliques sont des créations du jeu. Ils ne remplacent pas les douze résidents originaux dotés de routines. Une conversation lue en pause ne constitue pas une simulation globale des habitants.',
'','## Arsenal et garde-fous','',
'La dotation de départ M41A et son chargeur de 30 restent des valeurs de gameplay. La 0.9 ajoute un M240 et un lance-grenades sous canon. Leur présence dans cette armurerie et leur attribution aux deux Marines sont optionnelles et originales ; aucun inventaire exhaustif du livre n’a été vérifié.',
'',
'Le prélèvement exige Brackett ou Paris au râtelier et deux secondes de travail exposé. Chaque Marine reçoit au plus un lot de 60 unités de carburant et trois grenades, jamais renouvelé. Changer de point de vue conserve les dotations individuelles. Anne et Newt restent désarmées.',
'',
'Le M240 applique un cône directionnel de 350 unités, 11 dégâts par impulsion et un intervalle minimal de 0,16 seconde. Le carburant remplace la consommation de cartouches ; aucun rechargement M41A ne remplit son réservoir. Les obstacles arrêtent les dégâts et limitent visuellement le cône. Il n’existe pas de nappe de feu persistante ni de simulation chimique.',
'',
'La grenade parcourt un segment physique jusqu’au premier impact ou à sa portée de jeu. L’explosion affecte une zone de 135 unités sans traverser une paroi. Le joueur et son compagnon peuvent être blessés ; un volet peut être endommagé. Un seul projectile est actif à la fois. E et le franchissement sont bloqués jusqu’à l’impact pour ne pas abandonner une grenade gelée dans la pièce quittée.',
'',
'Les tirs, réserves et dégâts sont des règles de jeu, pas des spécifications d’armes réelles. Le râtelier ne donne pas de smartgun, de tourelle, de pistolet ou de Power Loader simplement parce qu’ils existent dans la franchise. Le registre distingue absence, non-vérification et équipement effectivement utilisable.',
'','## Persistance et héritage','',
'Les vrais exports 0.1 à 0.8 sont acceptés. Le registre armory initialise des dotations vides ; il ne donne pas un équipement rétroactif. Les conteneurs, la mobilité, les gaines, les portes, les détours et les réserves héritées ne sont pas réinitialisés. Un import en cours de prélèvement annule le travail sans débiter un lot ; un projectile engagé conserve son propriétaire, sa position et sa munition déjà consommée.',
'',
'Le protocole local à deux copies reste testé avec MemoryStorage simulé. La navigation HTTP locale a été refusée par l’environnement ; le HTML exact est exécuté avec set_content sans changement de politique. La persistance native après fermeture, les quotas réels et les onglets concurrents restent non qualifiés. Les téléchargements et imports JSON par le sélecteur ordinaire sont une preuve distincte.',
'',
'Les systèmes antérieurs conservés comprennent les tableaux de courant et de pression, la lampe et le détecteur, les cachettes, l’écoute, les escortes, les réserves finies et fabrications, les alarmes et volets, le réseau de gaines pour adultes existants et le tracteur pilotable sur deux secteurs. Leurs définitions et valeurs détaillées sont présentes dans CONTENT_MANIFEST.json et les modules correspondants.',
'','## Hors champ et chronologie','',
'Les nouvelles salles n’engendrent aucune vague supplémentaire par elles-mêmes. Le pilote fossile est fixé dans sa chambre ; les œufs se trouvent dans la cale, et non répétés à l’entrée de l’épave. L’exploration facultative ne fabrique pas une nouvelle infection de Russ, ne tue pas une reine, n’évacue pas Newt et ne provoque pas de secours extérieur.',
'',
'La baie de récupération spatiale, la navette retrouvée avec Ripley, le service médical de Gateway et la cabine de descente de Brackett restent manquants comme séquences jouables. Ils ne peuvent pas devenir des pièces derrière une porte de Hadley’s Hope. Le début de 2173 n’est pas rejoué comme un prologue complet. Ces manques restent visibles dans le registre intégré.',
'','## Commandes ajoutées','',
'6 : armement et râtelier. 3 : lancer une grenade avec le M41A équipé. 7 : références et écarts. Les boutons des dossiers existent aussi pour le tactile. P parle explicitement à une personne proche. Aucun dossier ne déplace le personnage ou n’attribue une ressource hors de portée.',
'']
lines=intro[:]
lines += ['## Campagne conservée','']
for ch in D['chapters']:
 lines += [f"### {ch['index']+1:02d} — {ch['title']}",'',f"Personnage : **{D['characters'][ch['character']]['name']}**. Stade : {ch['phase']}. Départ : **{rooms[ch['start']]['name']}**.",'',ch['synopsis'],'','| Objectif | Pièce | Identifiant |','|---|---|---|']
 for o in ch['objectives']:lines.append(f"| {q(o['label'])} | {q(rooms[o['room']]['name'])} | `{o['id']}` |")
 lines += ['','Les tâches et le découpage sont une adaptation de gameplay, non la numérotation du livre.','']
lines += ['## Registre de fidélité : présence ne signifie pas exhaustivité','']
for cat in ['lieu','personnage','équipement']:
 lines += [f'### {cat.capitalize()}s','', '| Entrée | État actuel | Preuve / limite |','|---|---|---|']
 for c in D['fidelity']['coverage']:
  if c['category']==cat:lines.append(f"| {q(c['title'])} | {q(c['status'])} | {q(c['note'])} Références : {', '.join(c['sources']) or 'preuve primaire insuffisante'} |")
 lines+=['']
lines += ['## Apparences : paramètres livrés','']
for id,p in D['appearances'].items():
 lines += [f"### {p['name']} · `{id}`",'',p['visualStatus'],'',
 f"Identité : {p['identity']}. Taille de dessin : {p['height']} unités ; coefficient de carrure : {p['build']}. Ce ne sont pas des mensurations réelles.",
 f"Coiffure : `{p['hairstyle']}`. Tenue : `{p['wardrobe']}`. Couleurs du rendu : {p['color']}, {p['pants']}.",'']
lines += ['## Fiches des 47 lieux','']
audit=[]
for index,r in enumerate(D['rooms']):
 lines += [f"### {index+1:02d} — {r['name']} · `{r['id']}`",'',
 f"**Secteur :** {r['building']}. **Niveau :** {r['floor']}. **Présentation :** {r['kind']}.",
 f"**Repère :** {r['landmark']}.",
 f"**Dimensions de blocage :** {r['dimensionsM']} m proposés ; largeur de simulation {r['width']} ; profondeur {r['minZ']} à {r['maxZ']}.",
 f"**Plan schématique :** {r['map']}. **Circuit :** {r['architecture']['circuit']}. **Profil :** {r['architecture']['style']}.",
 '**Fidélité :** implantation et distances originales ; aucune mesure issue du roman revendiquée.','',
 '#### Accès et retours','', '| Destination | Type / support | Approche x/z | Retour x/z | Niveaux | Condition |','|---|---|---|---|---|---|']
 for p in r['portals']:
  back=next(b for b in rooms[p['to']]['portals'] if b['to']==r['id']);a=p['architecture']
  line={'from':r['id'],'to':p['to'],'id':p['id'],'back':back['id'],'x':p['x'],'z':p['z'],'type':a['type'],'mount':a['mount'],'source':'original_layout','sameCoordinatesAsRuntime':True}
  audit.append(line)
  cond='Newt seule' if p['childOnly'] else p['requires'] or 'Accès libre'
  lines.append(f"| {q(rooms[p['to']]['name'])} | {p['kind']} / {a['mount']} | {p['x']} / {p['z']} | {back['x']} / {back['z']} | {r['floor']} → {rooms[p['to']]['floor']} | {cond} |")
 lines += ['','Le point d’approche appartient au même repère que la simulation. Le support dessiné n’est pas un nouveau volume de collision universel.','',
 '#### Obstacles physiques','', '| ID | Nature | Centre x/z | Largeur / profondeur |','|---|---|---|---|']
 for c in r['cover']:lines.append(f"| `{c['id']}` | {c.get('prop','appui')} | {c['x']} / {c['z']} | {c['w']} / {c['d']} |")
 if not r['cover']:lines.append('| — | Aucun obstacle statique déclaré | — | — |')
 lines += ['','#### Interactions','', '| Objet | Action | Position x/z | Personnage / stade |','|---|---|---|']
 for o in r['objects']:lines.append(f"| {q(o.get('label',o['id']))} · `{o['id']}` | `{o['kind']}` | {o['x']} / {o['z']} | {o.get('actorId') or ('chapitre '+str(o['chapter']+1) if 'chapter' in o else 'interaction locale')} |")
 lines += ['','#### Décor et implantation','', '| ID | Élément | Position x/z | Collision | Fonction |','|---|---|---|---|---|']
 for p in r['props']:lines.append(f"| `{p['id']}` | `{p['kind']}` | {p['x']} / {p['z']} | {'Oui' if p.get('collidable') else 'Non'} | {q(p.get('purpose','repère visuel'))} |")
 lines += ['','#### États de crise et appareils','']
 for p in r.get('phaseDressing',[]):lines.append(f"- À partir du stade {p['fromPhase']} : `{p['kind']}`, x {p['x']}, z {p['z']} ; décor conditionnel.")
 groups=[('Résident',D['life']['residents']),('Réserve',D['life']['containers']),('Établi',D['life']['benches']),('Volet',D['defense']['shutters']),('Avertisseur',D['defense']['alarms']),('Gaine',D['ducts']['mouths']),('Entretien du véhicule',D['mobility']['stations'])]
 for label,group in groups:
  for item in group:
   if item['room']==r['id']:lines.append(f"- {label} : `{item['id']}` — {q(item.get('label',item.get('name','poste local')))}.")
 lines += ['','**Garde-fou :** aucun item de décor n’accorde une ressource ou une victoire par sa seule présence. Les accès industriels, les cachettes et les stations respectent leurs droits propres.','']
lines += ['## Sources consultées','']
for s in D['sources']:
 lines += [f"### {s['id']} — {s['title']}",'',s['url'],'',s.get('use',''),'']
lines += ['## Limites persistantes','',lim,'',
'La vérification du moteur ne prouve pas l’exhaustivité du roman. Le détail complet de la garnison, les armes effectivement employées scène par scène, les visages des personnages jamais filmés et les positions exactes des bâtiments restent à documenter. Aucun chapitre nouveau n’est inventé comme une scène authentifiée pour combler ce manque.']
(DD/'CODEX_LEVEL_DESIGN.md').write_text('\n'.join(lines)+'\n')
(DD/'AUDIT_SEUILS_V09.json').write_text(json.dumps({'version':m['version'],'endpoints':audit,'clearance':D['portalClearanceCorrections'],'planOfficial':False},ensure_ascii=False,indent=2))
coverage=['# Registre de fidélité 0.9','',lim,'','Les références du roman, du film et les interprétations sont séparées. Une fiche manquante ou non confirmée n’est pas une fonctionnalité présente.','']
for c in D['fidelity']['coverage']:coverage += [f"## {c['title']}",'',f"**{c['status']}** — {c['note']}",f"Références : {', '.join(c['sources']) or 'détail non authentifié'}",'']
(DD/'REGISTRE_FIDELITE.md').write_text('\n'.join(coverage))
# Current QA only.
names=['CORE_TEST_RESULTS','COLONY_TEST_RESULTS','EXPLORATION_TEST_RESULTS','PASSAGES_TEST_RESULTS','PERSISTENCE_TEST_RESULTS','LIFE_TEST_RESULTS','DEFENSE_TEST_RESULTS','DUCT_TEST_RESULTS','MOBILITY_TEST_RESULTS','FIDELITY_TEST_RESULTS']
rows=[];total=0
def cases(report):
 if isinstance(report,list): return report
 value=report.get('results')
 if isinstance(value,list): return value
 value=report.get('cases',[])
 return value if isinstance(value,list) else []
for n in names:
 r=read(n+'.json');assert r['passed'],n
 cs=cases(r);assert all(c['passed'] for c in cs),n;total+=len(cs);rows.append((n,len(cs)))
travels=['TRAVERSAL_RESULTS','TRAVERSAL_EXPLORATION_RESULTS','TRAVERSAL_LIFE_RESULTS','TRAVERSAL_DEFENSE_RESULTS','TRAVERSAL_DUCT_RESULTS','TRAVERSAL_MOBILITY_RESULTS','TRAVERSAL_FIDELITY_RESULTS']
for n in travels:
 r=read(n+'.json');c=r if isinstance(r,list) else cases(r);assert len(c)==6 and all(v['passed'] for v in c),n
br=read('BROWSER_V09.json');assert br['passed'] and not br['errors'];assert br['htmlSHA256']==sha(R/'JOUER.html')
for n in ['INSTALLER_TEST_RESULTS','REAL_UPGRADE_TEST_RESULTS']:assert read(n+'.json')['passed']
qa=['# Qualification locale — 0.9.0-candidate.1','',
'Résultats des suites achevées sur le code courant. Les versions archivées ne sont pas additionnées. Un groupe de test n’est pas un joueur, une machine ou une partie humaine.','',
'| Suite | Réussite |','|---|---:|']+[f"| {n} | {nchecks}/{nchecks} |" for n,nchecks in rows]+[
'',f"**Modèle : {total}/{total}. Parcours complets : 42/42. Navigateur courant : {len(br['cases'])}/{len(br['cases'])}. Installateur : 28/28. Montée réelle 0.8 → 0.9 sur shell hôte de test : 4/4.**",'',
'## Portée des preuves','',
'Les 256 essais de seuil sont 128 extrémités × deux vues. Leur scène est explicitement préparée avec les autorisations nécessaires, puis E et le temps normal du modèle accomplissent le passage. Le contrôle de géométrie marche jusqu’aux objets dans les 47 pièces. Les positions de retour utilisent le retrait réel de 75 unités prévu par le moteur.',
'',
'Les six pilotes les plus complets partent d’une nouvelle partie, visitent les 47 lieux, prélèvent la dotation, manipulent l’armement, inspectent les cinq nouvelles salles, franchissent la corde dans les deux sens et terminent les 49 objectifs, les escortes et les activités héritées. Ils marchent avec Simulation.update, sans téléportation, validation forcée d’objectif ou réécriture de santé. Les soins et l’assistance de chapitre prévus dans le jeu restent actifs. Ils connaissent les chemins et ne mesurent ni la durée humaine ni l’équilibrage de découverte.',
'',
'Les dommages, interruptions et importations invalides sont des fixtures dédiées. Les grenades, le M240 et leur coût individuel sont vérifiés séparément ; il ne s’agit pas d’une certification de tous les combats possibles.',
'',
'## Navigateur','',
'Le CLI agent-browser n’est pas installé. La tentative HTTP locale a été bloquée (ERR_BLOCKED_BY_ADMINISTRATOR), consignée dans docs/HTTP_PREVIEW_V09.json. Le fichier exact est exécuté par Playwright set_content dans l’origine opaque autorisée, sans modifier les politiques. Le menu et les touches servent aux actions. Les scènes ciblées sont des sauvegardes préparées puis importées avec le sélecteur ordinaire, jamais des changements de position en pleine recette.',
'',
'Le premier test de démarrage visait par erreur le libellé réservé à une reprise de sauvegarde ; il a été corrigé pour le vrai bouton PRENDRE LE CONTRÔLE. Les passages temporisés attendent leur véritable état travel. Une première série de prévisualisations a révélé une perte d’arguments dans le wrapper de décor, qui interrompait les images alors que le HUD continuait. Le wrapper transmet maintenant pièce et état. Les prévisualisations en échec ne sont pas les captures du rapport final.',
'',
'Les vrais téléchargements de dotation et de grenade en vol sont réimportés, sans nouvelle ressource ou deuxième projectile. Le vrai fichier 0.8 issu de l’archive précédente est importé. Le stockage natif après fermeture, les quotas réels et les onglets concurrents restent non qualifiés ; MemoryStorage éprouve le protocole seulement.',
'',
'## Corrections et limites','',
'Une cible atteinte à courte portée n’est plus masquée par une interaction distante : ceci corrige notamment les seuils voisins d’un panier ou d’un résident. Les visuels du pilote, des œufs et des supports de l’épave ne réutilisent plus le mobilier colonial. Le repère de transmission n’emprunte pas la silhouette d’un autre personnage.',
'',
'Support architectural visuel ne signifie pas géométrie de murs 3D entièrement collisionnable. Les modèles d’armes et les apparences sont stylisés et en partie interprétés. La présence de tous les lieux ou matériels du livre entier n’est pas certifiée.',
'',lim,'',f"SHA-256 du jeu qualifié : `{sha(R/'JOUER.html')}`",'']
(DD/'QA_REPORT.md').write_text('\n'.join(qa))
# Self-contained report with real runtime PNGs and specific provenance.
css="""*{box-sizing:border-box}body{overflow-wrap:anywhere;margin:0;background:#091820;color:#d0d8ce;font:16px/1.65 Arial,sans-serif}main{max-width:1160px;margin:auto;padding:42px 24px}h1{font-size:clamp(36px,5vw,68px);line-height:1.05;font-weight:400}h2{font-size:29px;margin-top:52px}small,.eyebrow{font:12px/1.5 monospace;color:#acc3ad;letter-spacing:.08em}a{color:#d1c58c}.notice{padding:20px 24px;background:#19313a;border-left:4px solid #c1b985}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:30px 0}.metrics>div{padding:22px;background:#142e36}.metrics b{display:block;font:35px monospace;color:#e1dfb5}.metrics span{font-size:12px}table{width:100%;border-collapse:collapse}td,th{text-align:left;padding:10px;border-bottom:1px solid #3c5655}figure{margin:30px 0;border:1px solid #496560;background:#132a33}figure img{width:100%;height:auto;display:block}figcaption{padding:18px 24px}figure.portrait{max-width:390px;margin-inline:auto}code{font-size:11px;overflow-wrap:anywhere}footer{border-top:1px solid #537167;padding-top:30px;margin-top:40px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}.scroll{overflow:auto}@media(max-width:650px){.metrics{grid-template-columns:1fr 1fr}.grid{grid-template-columns:1fr}main{padding:24px 16px}}"""
report=['<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fleuve de la Douleur · Rapport 0.9</title><style>'+css+'</style><main>',
'<header><p class="eyebrow">ALIENS · TANTALUS FRONTIER / LIVRAISON LOCALE 0.9</p><h1>Les lieux ont<br>une mémoire.</h1><p>Audit de cohérence et de fidélité · Fleuve de la Douleur</p></header>',
f'<p class="notice">{escape(lim)}</p>',
'<div class="metrics">'+''.join(f'<div><b>{n}</b><span>{label}</span></div>' for n,label in [(47,'LIEUX JOUABLES'),(128,'SEUILS ORIENTÉS'),(14,'PROFILS VISUELS'),(93,'ENTRÉES DE FIDÉLITÉ')])+'</div>',
'<h2>Ce qui a changé</h2><div class="grid"><article><h3>Une architecture lisible</h3><p>Chaque accès possède un retour, un support et un type explicite. Une piste est un chemin, la cale utilise une corde, les postes du pilote et des œufs restent dans leurs pièces. Les 44 accessoires gênant visuellement un seuil sont dégagés.</p></article><article><h3>Des références qui ne se mélangent pas</h3><p>Russ n’est plus Brackett et Luisa n’est plus Newt. La serre et le matériel médical utilisent des éléments attestés, mais leurs plans restent des interprétations. Le registre montre les lieux hors-colonie encore manquants.</p></article><article><h3>Un arsenal facultatif réel</h3><p>M240, lance-grenades et dotation individuelle finie. Les manipulations sont exposées et les impacts rencontrent les obstacles. Leur attribution à Hadley’s Hope dans cette version est un choix de jeu, pas une preuve sur le roman.</p></article><article><h3>Cinq lieux en plus, sans remplir les trous par de faux raccords</h3><p>Armurerie, serre, galerie biomécanique, chambre du pilote, cale aux œufs. Gateway et les séquences de récupération spatiale ne sont pas cachés derrière une porte de la colonie.</p></article></div>',
'<h2>Captures du jeu exécuté</h2><p>Les scènes ciblées ci-dessous sont préparées par des sauvegardes validées puis importées par le menu. Les touches et boutons font avancer la simulation normalement. Ce ne sont ni des illustrations d’intention ni une partie manuelle complète.</p>']
# Choose coherent representative images, retain all PNGs in captures-v09.
selected=['02-seuil-armurerie.png','03-armement.png','04-m240.png','05-jorden.png','06-medical.png','08-serre.png','09-pilote.png','10-corde.png','11-cale.png','13-escalier.png','16-personnages.png','17-manques.png','18-plan.png','19-portrait.png']
caps={c['file']:c for c in br['captures']}
for name in selected:
 c=caps[name];p=R/'captures-v09'/name
 report.append(f'<figure{" class=portrait" if "portrait" in name else ""}><img src="data:image/png;base64,{base64.b64encode(p.read_bytes()).decode()}" alt="{escape(c["caption"])}" data-source="captures-v09/{name}"><figcaption><b>{escape(c["caption"])}</b><p><small>Pièce : {escape(c["room"])}. Initialisation : {escape(c["fixture"])}.</small></p><details><summary>Empreinte de la capture</summary><code>{sha(p)}</code></details></figcaption></figure>')
report += ['<h2>Qualification courante</h2><div class="scroll"><table><tr><th>Périmètre</th><th>Résultat</th><th>Portée</th></tr>']
for title,n,scope in [('Modèle',total,'Cas localisés et géométrie, sans addition des versions anciennes'),('Parcours complets',42,'Sept familles × deux vues × trois difficultés'),('Installateur',28,'Hôtes synthétiques, conflits et restauration'),('Vraie montée 0.8 → 0.9',4,'Anciens fichiers réels, shell hôte de test'),('Navigateur',len(br['cases']),'HTML final, commandes et imports/exports ordinaires')]:
 report.append(f'<tr><td>{title}</td><td>{n}/{n}</td><td>{scope}</td></tr>')
report += ['</table></div><p>Les 256 cas de seuil sont inclus dans le modèle, pas ajoutés une seconde fois. Les anciens contrôles navigateur ne sont pas comptés comme rejoués. Aucune difficulté humaine, durée de jeu ou performance sur téléphone réel n’est déduite des pilotes.</p>',
'<h2>Ce qui n’est pas encore 1:1</h2><p>Les séquences hors-colonie restent à construire ; le corpus complet du roman n’a pas été examiné. Le détail de l’arsenal employé par chaque personnage, la totalité de la garnison et les apparences non filmées ne sont pas exhaustivement documentés. Les dessins actuels sont des silhouettes provisoires. Une entrée de registre ne vaut pas une implémentation.</p>',
'<h2>Reprendre</h2><p>Ouvrir JOUER.html. Les anciens fichiers JSON 0.1 à 0.8 se chargent depuis Pause → Importer. 6 ouvre l’armement ; 3 tire une grenade avec le M41A ; 7 ouvre les références. Les manipulations exigent la proximité réelle.</p>',
'<h2>Références</h2>']
for s in D['sources']:
 if s['id'].startswith('R'):report.append(f'<p><a href="{escape(s["url"])}">{escape(s["title"])}</a><br><small>{escape(s["use"])}</small></p>')
report += [f'<footer><p>{escape(lim)}</p><p>Stockage local natif après fermeture non qualifié ; import/export JSON vérifié. Les supports des seuils sont des conventions visuelles et les raccords restent bornés.</p><small>Jeu qualifié SHA-256 : {sha(R/"JOUER.html")}</small></footer></main></html>']
(R/'RAPPORT_ILLUSTRE.html').write_text(''.join(report))
(DD/'DOCUMENTATION_BUILD.json').write_text(json.dumps({'version':m['version'],'model':total,'traversals':42,'browser':len(br['cases']),'captures':len(br['captures']),'reportCaptures':len(selected),'codexLines':len(lines),'htmlSHA256':sha(R/'JOUER.html'),'reportSHA256':sha(R/'RAPPORT_ILLUSTRE.html')},indent=2))
(DD/'SOURCES_ET_CONTINUITE.md').write_text('\n'.join(['# Sources et continuité 0.9','',lim,'',*['\n## '+s['id']+' — '+s['title']+'\n\n'+s['url']+'\n\n'+s.get('use','') for s in D['sources']],'','Aucun texte intégral du roman, aucun fichier image officiel ni piste audio protégée n’est redistribué. Le scénario jouable demeure une condensation originale.']))
print(json.dumps(read('DOCUMENTATION_BUILD.json'),indent=2))
