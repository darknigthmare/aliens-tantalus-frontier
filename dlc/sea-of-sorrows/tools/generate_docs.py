#!/usr/bin/env python3
"""Document the actual campaign graph; no unverified asset or playtime claims."""
from pathlib import Path
import json,collections
ROOT=Path(__file__).resolve().parents[1];D=json.loads((ROOT/'data/campaign.json').read_text());R={r['id']:r for r in D['rooms']};O={o['id']:o for r in D['rooms'] for o in r['interactables']}
modes={'SIDE':'Bande latérale ; profondeur verrouillée.','DEPTH':'Surface de déplacement en profondeur ; obstacles contournables.','HYBRID':'Volume de transition ; profondeur resserrée.'}
types={'crate':'caisse industrielle','rack':'rayonnage','pipe':'faisceau de conduites','resin':'masse de résine','silica-rubble':'débris de silice','rib':'structure organique côtelée'}
lines=['# Codex de level design — La Mer des Chagrins',f"## v{D['meta']['version']} · {len(D['rooms'])} salles / {len(D['edges'])} liaisons",'',
'Ce document est généré à partir des données réellement lues par le moteur. Les dimensions sont des unités de jeu, pas des mesures du roman. Les noms détaillés de salles sont des créations d’adaptation. La carte ne prétend pas reproduire un plan canonique.','',
'## Doctrine et lecture des fiches','',
'Chaque porte porte une paire de liaison. Le retour utilise cette même paire et restaure une position d’arrivée voisine du seuil ; les états de la salle persistent. Les coordonnées `x` sont horizontales, `z` indique la profondeur du sol. Les cadres du HUD restent hors du canvas.','',
'Le mode global CLASSIC ramène toutes les profondeurs à 0,55 et ignore les couvertures déclarées non bloquantes pour cette vue. Les conditions d’objectif ne changent pas. Les cages, escaliers, vols et transferts sont des changements de salle explicites, pas une physique verticale continue.','',
'Les « intentions de décor » reprises du champ `propNotes` constituent une direction de fabrication. Elles ne signifient pas que chaque accessoire nommé possède déjà un sprite dédié. Les tableaux de collision ci-dessous, eux, correspondent à des objets rendus et bloquants dans le prototype.','',
'La sauvegarde de reprise est créée à chaque entrée de salle par le moteur. Le champ historique `checkpoint` des données ne filtre pas ce comportement dans la version 0.10.0.','',
'## Parcours des chapitres','', '| Chapitre du jeu | Objectifs jouables | Note de mise en scène |','|---|---|---|']
for c in D['chapters']:
 lines.append(f"| {c['number']:02d} — {c['title']} | "+' ; '.join(O[o]['label']+' ('+O[o]['room']+')' for o in c['objectives'])+f" | {c['designNote']} |")
lines+=['','## Fiches de salles','']
for r in D['rooms']:
 lines += [f"### {r['id'].upper()} — {r['name']}",'',f"**Secteur : {r['zone']} · Profil : {r['kind']} · Vue hybride : {r['mode']} · Largeur : {r['width']} unités.**",'',r['description'],'',f"**Lecture spatiale.** {modes[r['mode']]} La ligne de desserte principale se situe autour de z = 0,55. Les interactions actives s’affichent dans le bandeau de mission, sans panneau central permanent.",'',f"**Intentions de décor.** {r['propNotes']}",'','**Liaisons physiques et conditions initiales**','']
 lines += ['', '**Territoire et niveau de preuve.** '+r['territory']+'. '+r['sourceNote'], '', '| Seuil structurel | Implantation | Classe visuelle | Justification |', '|---|---|---|---|']
 for d in r['doors']:
  p=d['portal'];lines.append(f"| {d['pair']} | {p['mount']} | {p['type']} | {p['structuralReason']} |")
 lines += ['', '| Seuil | Destination | Nature | Position (x ; z) | Condition | Poursuite autorisée |', '|---|---|---|---|---|---|']
 for d in r['doors']:
  cond=d.get('gate')or'accès ouvert selon la progression';extra=''
  if d['kind']=='lift':extra=' ; condamné après lift_lost'
  if {r['id'],d['to']}=={'s28','s29'}:extra=' ; fermé après maze_known'
  lines.append(f"| {d['pair']} | {d['to']} — {R[d['to']]['name']} | {d['kind']} | {d['x']} ; {d['z']:.2f} | {cond}{extra} | {"Oui, sous conditions de contact" if d.get("pursuitAllowed") else "Non"} |")
 if r.get('arrivalAnchors'):
  lines += ['', '**Arrivée narrative à sens unique.** '+json.dumps(r['arrivalAnchors'],ensure_ascii=False)+'. Ces points sont des arrivées, pas des portes supplémentaires ni des retours implicites.']
 if r.get('cast'):
  lines += ['', '**Distribution de scène — placements d’adaptation**', '', '| Personnage | Point (x ; z) | Plage de progression | Présence |', '|---|---|---|---|']
  for a in r['cast']:
   c=D['fidelity']['characters'][a['id']];lines.append(f"| {c['name']} | {a['x']} ; {a['z']} | {a['fromObjective']} ≤ index < {a['untilObjective']} | Interaction brève ; visage et placement interprétés. {c['known']} |")
 if r.get('armoryRack'):
  a=r['armoryRack'];lines += ['', f"**Râtelier physique.** {a['label']} à ({a['x']} ; {a['z']}) ; corps au mur de fond z={a['bodyZ']}. Allocation commune aux deux râteliers, une seule fois après équipement : fusil à impulsions (30 chargées + 60 en réserve), plasma (12 tirs chargés + deux cellules). Aucune livraison à distance. Silhouettes et chiffres de combat originaux, dotation à Decker non authentifiée."]
 if r.get('stasisDisplays'):
  lines += ['', '**Tableau de stase interprété.** Deux présentations cryogéniques d’Adams et Elway apparaissent après la livraison des spécimens. Elles réemploient l’état des porteurs ; elles ne créent pas deux nouveaux acteurs de simulation. Leurs parasites restent visibles. Pas de guérison implicite ni de procédure médicale réaliste.']
 lines+=['','**Poursuite inter-salles 0.5**','']
 allowed=[d for d in r['doors']if d.get('pursuitAllowed')]
 if allowed:
  lines.append('Seuils utilisables par une créature déjà engagée : '+', '.join(d['pair']+' vers '+d['to'].upper()for d in allowed)+'. Le préavis vient du seuil réellement atteint ; aucun ennemi supplémentaire n’est créé. Une salle sans apparition initiale peut donc recevoir une créature déplacée depuis un lieu adjacent. La carte de production documente les possibilités, pas un contact détecté.')
 else:
  lines.append('Aucune poursuite ne traverse les liaisons de cette salle dans cette version. Les vols, transferts, ascenseurs et rencontres scénarisées gardent leurs règles propres ; aucune créature n’est transportée implicitement avec le joueur.')
 lines.append('Avant une transition physique, Manning doit pouvoir rejoindre le seuil à moins de 550 unités pendant sa présence active. Les deux brancards en convoi doivent être à moins de 420 unités et disposer chacun d’un chemin libre. Une cloison fermée peut interdire le départ, même à faible distance. Le contrôle de graphe de la carte ne remplace pas cette vérification au passage.')
 lines+=['','**Éclairage de travail — 0.7**','']
 if r.get('lighting'):
  l=r['lighting'];lines.append(f"Pupitre `{l['id']}` à x = {l['x']}, z = {l['z']}. Maintenir E pendant {l['duration']} secondes pour couper ou rétablir le circuit local. La progression partielle et le choix sont sauvegardés. Les cloisons, objectifs, capteurs et dangers restent indépendants. Balisage de secours permanent ; lampe personnelle éteinte requise pour réduire la portée visuelle sur Decker.")
 else:lines.append('Aucun circuit manœuvrable : cette salle garde son éclairage de référence. Ne pas déduire une commande de coupure de ses seuls luminaires dessinés.')
 if r['id'] in ['s34','s35','s36','s11','s37','s45','s46','s49','s50']:lines+=['','**Allure du convoi — 0.7.** Pause ou Équipement → Ordres d’escorte. Standard : 170 d’écart / 155 de vitesse / 12 de bruit ; Rapproché : 105 / 175 / 26 ; Discret : 150 / 108 / 3 (unités de simulation). La marche respecte les obstacles. Une halte arrête les roues, pas la mémoire adverse. Les deux patients doivent toujours rejoindre réellement le seuil.']
 lines+=['','**Veille de capteur — 0.6**','']
 if allowed:lines.append('Liaison radio de proximité possible depuis '+', '.join(d['to'].upper()+' ('+d['pair']+')'for d in allowed)+', sous réserve des conditions de passage. La carte indique le matériel, jamais un nouvel ennemi. La mesure de 650 unités conserve la ligne de vue réelle : placer après un masque de décor, et non derrière lui.')
 else:lines.append('Pas de relais radio à travers les liaisons de cette salle. Un capteur posé ici n’est joignable que tant que Decker reste dans la salle. Une batterie laissée active continue de se décharger hors liaison.')
 lines.append('La pose libre ne constitue pas un placement prédéfini du niveau. Réserver les seuils, les dispositifs et la course des cloisons ; utiliser la prévisualisation contextuelle de la commande. Les acteurs ordinaires hors champ sont figés : seules les poursuites engagées peuvent encore fournir un mouvement réel.')
 lines+=['','**Casiers physiques — 0.8**','']
 if r.get('lockers'):
  lines.append('Équipement reçu, outil Interaction, puis E maintenue 2,4 secondes à moins de 92 unités avec ligne de vue. Le travail partiel est sauvegardé ; les dégâts interrompent. Ouvrir ne donne aucune ressource. Le panneau de transfert met le jeu en pause. Retrait et dépôt exigent toujours la proximité. Le corps est fixé au mur de fond : sa profondeur graphique n’est pas celle du point d’accès.')
  lines+=['', '| Casier | Point d’accès (x ; z) | Stock initial fini |','|---|---|---|']
  for l in r['lockers']:
   stock=', '.join(k+' : '+str(v) for k,v in l['contents'].items() if v)
   lines.append(f"| `{l['id']}` — {l['label']} | {l['x']} ; {l['z']:.2f} | {stock} |")
  lines.append('Un casier ouvert reste ouvert même vide. Les retraits sont plafonnés par catégorie : reserve 180, fuel 180, foam 24, medkits 4, filters 4, decoys 5, parts 6. Les surplus préexistants ne sont ni confisqués ni supprimés : ils empêchent seulement de retirer davantage de cette catégorie. Les réserves automatiques historiques ne sont pas reconfigurées par ce plafond. Le stock non retiré ou déposé reste à cet emplacement et ne réapparaît pas ailleurs.')
 else:lines.append('Aucun casier de transfert dans cette salle. Un élément de décor ayant l’apparence d’une armoire ne constitue pas automatiquement un stockage interactif.')
 if r['id'] in ['s47','s48','s49','s50']:
  lines+=['','**Annexe originale de service.** Deux passages réciproques forment une boucle facultative avec les salles existantes. Pas d’objectif principal ajouté ni d’étape sautée. Les nouvelles réserves sont finies. La présence de deux portes ne supprime pas les conditions d’escorte, les obstacles ou les poursuites.']
 lines+=['','**Actions et ressources**','']
 if r['interactables']:
  for o in r['interactables']:
   lines.append(f"- `{o['id']}` : **{o['label']}**, à x = {o['x']}, z = {o['z']:.2f}. Déclenche `{o['flag']}` après validation des conditions du type `{o['type']}`. La validation n’est possible que lorsque cette étape est l’objectif courant.")
 else:lines.append('Cette salle assure un trajet, une respiration ou une rencontre ; elle ne déclenche pas de nouvel objectif principal. Sa visite et ses seuils persistent néanmoins.')
 if r['devices']:
  lines+=['','**Interventions de la salle**','', '| Identifiant | Action | Position | Durée | Effet confirmé |','|---|---|---|---|---|']
  for d in r['devices']:lines.append(f"| {d['id']} | {d['label']} | {d['x']} ; {d['z']:.2f} | {d['duration']} s | {d['reply']} |")
 if r['shutters']:
  lines+=['','**Cloison dynamique 0.4 — pas un verrou narratif**','']
  for gate in r['shutters']:
   lines += [f"`{gate['id']}` — **{gate['label']}**. {gate['purpose']}", '', f"Emprise : x = {gate['x']}, largeur {gate['w']}, toute la profondeur jouable. Pupitres x = {gate['x']-105} / {gate['x']+105}, z = 0,55. État initial ouvert ; fermeture {gate['closeDuration']} s, ouverture {gate['openDuration']} s, intégrité {gate['maxIntegrity']}.", '', "Une fermeture occupée par un acteur vivant ou un brancard actif est refusée. Marche, esquive, vision et tirs utilisent sa collision réelle ; le son est atténué, non supprimé. Une attaque ennemie préparée peut rompre la cloison. Rupture permanente dans cette expédition ; les deux pupitres n’offrent pas de réparation. Les commandes n’ajoutent pas d’objectif principal.", '', "**Contrôle propre à cette implantation :** accès à chaque pupitre depuis sa moitié de salle ; point de Manning placé avant fermeture ; convoi hors de la bande de course ; réouverture depuis les deux côtés ; état conservé en changeant de présentation. Le plan et le repère doivent indiquer une fermeture, pas un trajet libre.", '']
 if r['echoes']:
  lines+=['','**Lecture empathique facultative 0.4**','']
  for echo in r['echoes']:
   lines += [f"`{echo['id']}` — **{echo['title']}**, x = {echo['x']}, z = {echo['z']}. Rayon {echo['radius']} ; durée {echo['duration']} s à partir de {echo['pressure']} de pression. Espace maintenu, immobile et ligne de vue requise. La progression est conservée, la récompense limitée au dossier unique.", '', '**Texte original subjectif :** '+echo['text'], '', "**Contrôle :** la lecture ne valide pas l’objectif principal, ne marque pas un ennemi caché et ne se duplique pas après export/import. Son usage ne suspend pas le danger de la salle.", '']
 lines+=['','**Habillage effectivement placé hors des voies**','', '| Placement | Famille de dessin | Position (x ; z) | Couche |','|---|---|---|---|']
 for a in r['dressing']:lines.append(f"| {a['id']} | {a['kind']} | {a['x']} ; {a['z']:.3f} | {a['layer']} |")
 for o in r['interactables']:
  if o.get('operation'):lines.append(f"\nIntervention `{o['id']}` : **{o['operation']['duration']} secondes**, bruit **{o['operation']['noise']}** ; maintien, interruption et restauration de la progression partielle. Les bonus des annexes peuvent raccourcir le réarmement ou la balise.")
 a=r['archive'];lines += ['',f"Relevé facultatif `{a['id']}` : x = {a['x']}, z = {a['z']:.2f}. "+('Un poste de ravitaillement est disponible à x = 320, z = 0,55 ; sa consommation est définitive.' if r['supply'] else 'Aucun ravitaillement automatique dans cette salle.'),'','**Obstacles jouables**','']
 if r['obstacles']:
  lines+=['| Objet | Position (x ; z) | Emprise (largeur ; profondeur) | Hauteur visuelle |','|---|---|---|---|']
  for b in r['obstacles']:lines.append(f"| {b['id']} — {types[b['kind']]} | {b['x']} ; {b['z']:.2f} | {b['w']} ; {b['d']:.2f} | {b['h']} |")
 else:lines.append('Pas de barrière de profondeur. La silhouette architecturale et les accessoires de fond ne sont pas des murs invisibles traversant la bande latérale.')
 if r.get('layoutRevision'):
  lines+=['','**Révision spatiale 0.3.** '+r['layoutIntent']+'. Les objets de la table précédente sont les obstacles effectifs, et non une simple variation de texture. Leur contournement est actif en vue hybride ; la variante latérale maintient une bande franchissable.']
 lines+=['','**Danger et circulation**','',r['traversalNotes']]
 if r['hazards']:
  lines+=['','| Source | Emprise (x ; z ; largeur ; profondeur) | Cycle / préavis / phase active | Consignation persistante |','|---|---|---|---|']
  for h in r['hazards']:
   off=' OU '.join(v for v in [h.get('disableFlag'),h.get('disableDevice')]if v)
   lines.append(f"| {h['id']} — {h['label']} | {h['x']} ; {h['z']} ; {h['w']} ; {h['d']} | {h['period']} / {h['warning']} / {h['active']} s | {off} |")
  lines+=['','Les zones de vapeur et d’arc endommagent aussi les brancards. Le gaz use d’abord le filtre de Decker ; les patients ont leur protection respiratoire propre. Une zone dangereuse est traversable : elle ne remplace pas un obstacle. Son horloge n’avance que lorsque cette salle est simulée. La pause ne laisse pas expirer le préavis.']
 else:
  lines+=['Pas de source cyclique propre à cette salle. L’acide laissé par une créature morte reste un danger distinct ; attendre sa dissipation ou l’éviter.']
 lines+=['','**Présences et rythme**','']
 if r['enemySpawns']:
  lines.append('Rencontre finie, sans réapparition automatique : '+', '.join(f"{e['kind']} à ({e['x']} ; {e['z']:.2f})" for e in r['enemySpawns'])+'.')
 else:lines.append('Aucun ennemi initial. Ne pas remplir cette salle de patrouilles pour augmenter artificiellement la durée.')
 if r['id']=='s11':lines+=['','**Retour structurant.** Cette salle est réutilisée après le ravin s36. Le départ final vers la soute s37 attend la balise. Ne pas créer un duplicata de cette aire au retour.']
 if r['id']=='s26':lines+=['','**Perception.** L’objectif demande une pression minimale obtenue par Espace. Le message de direction est un indice de salle, pas une connaissance de toute la ruche.']
 if r['id']=='s33':lines+=['','**Rencontre dédiée.** Trois attaches à (980 ; 0,50), (1510 ; 0,38), (2220 ; 0,59). Le feu les détruit avant que la reine devienne vulnérable. Ces attaches et la règle d’invulnérabilité sont originales au jeu.']
 if r['id']=='s34':lines+=['','**Porteurs.** Deux validations distinctes, sans guérison implicite. Les deux brancards suivent physiquement après préparation. Ordre B, intégrité propre et rassemblement à moins de 420 unités des sorties compatibles. Le transport est interdit tant que le second n’est pas prêt.']
 if r['id']=='s37':lines+=['','**Capture.** Le caisson est à x = 1910. Seuil : immobilisation ≥ 0,95, cible vivante et distance de la cible au caisson ≤ 255 unités, joueur à portée d’interaction. L’allié exclut cet adulte de ses cibles. Les deux brancards doivent auparavant être arrimés au dispositif x=720 (3 secondes). La mousse et le caisson doivent fonctionner avant l’accès à s38.']
 lines+=['','**Contrôle de salle.** Vérifier le point d’entrée, les deux directions de chaque liaison réversible, la collision des objectifs, la lisibilité du personnage derrière le premier plan et la restauration de cet état. Le rapport détaille les contrôles automatisés effectivement réalisés ; cette fiche ne constitue pas un procès-verbal de playtest humain.','']
lines+=[f"## Registre des {len(D['codex'])} dossiers",'', '| Identifiant | Titre | Catégorie | Statut de contenu |','|---|---|---|---|']
for c in D['codex']:lines.append(f"| {c['id']} | {c['title']} | {c['category']} | {c.get('status',c.get('classification','adaptation'))} |")
(ROOT/'docs/CODEX_LEVEL_DESIGN_50_SALLES.md').write_text('\n'.join(lines)+'\n')
print('Level codex:',len(lines),'lines')
