"""Author a receipt from executed tests; not a test runner or a certification."""
from pathlib import Path
import json,re
R=Path(__file__).resolve().parent.parent
J=lambda p:json.loads((R/p).read_text()); B=J('report/browser-results-v111.json'); S=J('report/distribution-smoke-v111.json');N=J('report/lighting-drive-v111.json');C=J('report/CONTRATS_LEVEL_DESIGN_V111.json');V=J('baseline/SOURCES_PRESERVEES_V110.json')
passed=int(re.search(r'^# pass (\d+)$',(R/'report/node-tests-v111.txt').read_text(),re.M).group(1))
text=f'''# QA — ALIENS V111 / Dans le noir / RC1

## Résultats et portée

**{passed} tests Node réussissent : 343 historiques et 65 nouveaux. {len(B['tests'])} contrôles gameplay navigateur passent : 148 historiques réexécutés +39 éclairage.** Huit contextes Chromium indépendants, aucune erreur JavaScript/console observée. {len(S['checks'])} contrôles de distribution sont comptés séparément. Six variantes complètes de l’opération terminent ; l’exercice distinct de poursuite est conservé.

Ces preuves concernent le document autonome exact livré. Elles ne certifient pas les 64 salles natives, un GPU cible, un téléphone physique ou l’absence universelle de bugs.

## Provenance

Archive source réelle : `ALIENS_1986_V110_TENIR_LES_ACCES_RC1.zip`, 33 028 937 octets. SHA-256 : `ef3c6ce0db9d561314f2b40ea45581c44ec503a24d3dd28bf6b0bd70614acdce`.
{len(V)} sources/tests hérités sont conservés octet pour octet, listés dans `baseline/SOURCES_PRESERVEES_V110.json`. Les modules 111 les étendent sans remplacer leurs anciens validateurs. Contrat courant : `{C['contract']}`.

## Catalogue conservé

8 inspections, 7 lieux reliés, 8 raccords partagés, 16 volumes de seuil, 5 objectifs locaux ordonnés. 47 solides fixes, 9 portes intérieures, 42 instances de props, 30 observations, 11 ennemis de catalogue et une sentinelle. Aucun nouveau lieu, ennemi, objectif obligatoire ou sprite créé.

La passe raccorde 8 circuits service et leurs 8 commandes / 13 lampes déjà existants à un seul état de visibilité. Le relais réseau de mission reste indépendant.

## 65 nouveaux tests dirigés

Les états dirigés ne sont pas présentés comme des parcours. Tests : visibilité nominale, 120 unités en noir, cône maximal 520 / demi-angle 0,32, verre/opaque, source du joueur visible, rayons bornés, flash de tir qui expire, travail de soudure, chambre inactive sans torche, cognition activée par lumière sans mutation d’objectifs, mémoire non effacée, zéro recharge/soin, orientation sprite/angle, service local et réseau distincts.

Les contrats de temps contrôlent .95 seconde réelle, prise d’effet à l’achèvement, pause, annulation par marche/tir/coup/portée/perte de stabilité. Les sauvegardes contrôlent les champs inattendus, NaN/valeurs hors bornes, bilans de gestes, parité de torche, imports atomiques, reprise à mi-geste et migrations des huit lieux V110 par son vrai validateur.

## Six opérations complètes

Les pilotes utilisent les entrées publiques : mouvement, interaction, tir, ordres, logistique, génie, orientation de torche et manœuvres électriques. Ils lisent les positions et les chemins pour décider des entrées ; ils ne réécrivent ni vies, coordonnées, munitions, ressources, circuits, mémoires ou objectifs. C’est une conduite automatisée informée par l’état, pas un joueur aveugle aux informations internes. Les imports viennent des exports valides des mêmes conduites.
'''
for label,f,key in [('Routes historiques','report/operation-drive-v111.json','results'),('Boucles logistiques','report/logistics-drive-v111.json','results')]:
 text+='\n### '+label+'\n'
 for v in J(f)[key]:
  team=v.get('team',v.get('ammunition',[]));text+=f"\n**{v['variant']}** : terminé `{v['complete']}`, {v['inputs']} entrées/sous-pas, {v['elapsed']:.3f} s simulées, {v['transfers']} transferts d’équipe.\n\n| Membre | PV | Munitions |\n|---|---:|---:|\n"+''.join(f"| {a['id']} | {a['hp']} | {a['ammo']} |\n" for a in team)
  if 'logistics' in v:text+='\nRéserves et dépense : `'+json.dumps(v['logistics']['stock'],ensure_ascii=False)+'`, dépensé `'+json.dumps(v['logistics']['spent'])+'`.\n'
H=J('report/breach-drive-v111.json');P=J('report/pursuit-drive-v111.json')
text+=f'''
### Brèche / génie conservés

Terminé `{H['complete']}`, {H['inputs']} entrées/sous-pas, {H['elapsed']:.3f} s simulées. {H['enemyTransfers']} franchissements ennemis (pas de nouveaux ennemis). Quatre impacts, une brèche, une réparation, un renfort et une découpe. Deux plaques utilisées et une restante. Aucun changement à la logique historique de génie pour faciliter la réussite.

### Noir / retour / sentinelle

Terminé `{N['complete']}` : {N['inputs']} entrées/sous-pas et {N['elapsed']:.3f} s simulées. Le pilote part de Hadley, laisse les contacts résidentiels vivants, entre dans Operations, commence la coupure, exporte à mi-geste et reprend. Il coupe les lampes, éteint la torche, se décale prudemment et laisse la poursuite rejoindre la pièce. Il réplique après avoir orienté et rallumé son faisceau.

Il rejoint ensuite la maintenance, rétablit le relais de mission, retourne dans Operations toujours sombre et y remet le service. Il récupère Newt, rejoint les sentinelles, coupe leur éclairage et termine la défense sans rallumer. Le groupe revient à Hadley et confirme le repli. Deux rechargements font partie de la conduite, sans mutation de fichier.

{N['enemyTransfers']} franchissements ennemis cumulés, trois manœuvres électriques complètes, deux bascules de torche. La sentinelle passe de 120 à 116 cartouches entre les exports `09-ligne-sans-lampes` et `10-defense-tenue-noir`. Ce contrôle porte sur une tourelle et un combat du module, pas l’ensemble des sentinelles de la campagne native.

| Membre | PV finaux | Munitions |
|---|---:|---:|
'''+''.join(f"| {a['id']} | {a['hp']} | {a['ammo']} |\n" for a in N['team'])+f'''
Hudson reste blessé à 86 PV ; Newt reste non armée. Operations a retrouvé son service ; seul le couloir des sentinelles reste coupé. Les secondes simulées ne sont pas une estimation de durée de jeu humaine.

### Poursuite séparée

Exercice historique réexécuté : réussite `{P['ok']}`, {P['enemyTransfers']} transferts ennemis avec identité conservée. Ne pas additionner cet exercice aux six opérations complètes.

## Recette navigateur

Le document exact est chargé avec `set_content` et son chargeur Blob de distribution non modifié. Aucun hook d’édition de session n’est ajouté à la page. Les exports sont de vrais téléchargements et l’import utilise un vrai champ fichier. Les premières pièces sont jouées au clavier/souris ; les séquences tardives reprennent des exports non modifiés des pilotes puis effectuent les gestes précisés dans Chromium.

| Recette | Contrôles |
|---|---:|
'''
for part in ['core','tail','contact-a','contact-b','touch','logistics','engineering','lighting']:
 v=J(f'report/browser-{part}-v111.json');text+=f"| {part} | {len(v['tests'])} |\n"
text+=f'''
Total **{len(B['tests'])}**. Tous les reçus sont liés au SHA-256 du même HTML. Contrôles éclairage : .95 s sans effet anticipé, pause, marche et F interruptifs, reprise à mi-geste, L au clavier et bouton, orientation souris, obscurité conservée au retour, rétablissement sans vie offerte, défense sombre et consommation sentinelle, import faux rejeté, migration V110 exacte, carte séparée, accessibilité, paysage 844×390 et portrait 390×844.

Les viewports sont émulés, pas des téléphones physiques. Le minimum de hauteur scène 178 px en paysage court et 245 px en portrait n’a pas été abaissé. Le petit format réduit fortement la taille graphique du terrain, limite visible dans sa capture.

## Captures / documents

43 PNG bruts de Chromium ; 10 embarqués byte-for-byte dans le rapport. Aucune génération d’image, retouche ou reconstitution Python depuis des coordonnées. Chaque origine est dans `report/browser-results-v111.json`. Les plans du Codex sont des schémas calculés et étiquetés, pas des captures. Codex : 36 règles et 8 fiches filtrables. Les images tardives sont des reprises en pause d’états réels de parcours, suivies des entrées indiquées.

## Corrections pendant la recette

La direction du personnage était initialement désaccordée avec une visée vers l’arrière : `aimTorch` règle désormais aussi `facing`. Tous les pilotes et les huit recettes navigateur ont été relancés ensuite. Un contrôle sentinelle avait supposé 90 munitions initiales ; la valeur source réelle est 120, comparée désormais à son export 116. Le rapport débordait en portrait sur un long hash : le texte de provenance utilise un retour à la ligne autorisé ; les 27 contrôles de distribution ont été rejoués sans abaisser les critères.

## Distribution séparée

{len(S['checks'])} contrôles passent, distincts du gameplay : chargement HTML exact, schéma export111, état neuf sans ressources, 8 circuits, 8 fiches/36 règles filtrables, plans, décodage et identité des 10 PNG embarqués, portrait sans débordement et zéro requête externe nécessaire / JS / console en erreur.

Transport direct `file://` : `{json.dumps(S['transport']['directFileNavigation'],ensure_ascii=False)}`.

## Limites explicites

Branche autonome V110 prolongée, pas de fusion native V105/64 salles, pas de push ni déploiement. L’adaptateur V106 historique reste inactif. Aucun changement de service worker ou sauvegarde native. Pas de nouveau final Reine/P-5000/sas, de salle/population/objectif obligatoire, d’inventaire individuel, de batterie finie, de source mobile par allié ni de lumière inter-pièces. Transferts discrets et tirs locaux.

Rendu procédural stylisé. L’alimentation nominale est globale par pièce, pas un réseau électrique ni une illumination globale 3D. Le cône est réellement occulté par les volumes opaques en 2D. Les flashs visuels sont approchés localement ; leur calcul de reconnaissance applique l’occlusion du monde. Les contacts connus peuvent poursuivre dans le noir ; le système n’est pas une invisibilité ni une pause d’IA.

## Reproduction / intégrité

```text
npm run check
npm run drive
node tools/export-contracts-v111.mjs
npm run build
npm run browser
npm run docs
python qa/distribution-smoke-v111.py
python tools/release-check-v111.py
```

HTML de recette : `{B['htmlSha256']}`. `python tools/verify-package.py` vérifie le manifeste en lecture seule. Les opérations de construction peuvent produire de nouvelles preuves et changer leurs hashes ; elles sont distinctes de la vérification d’une distribution d’origine.
'''
(R/'QA_REPORT.md').write_text(text)
print('QA written',len(text.encode()))
