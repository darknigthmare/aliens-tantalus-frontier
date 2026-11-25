"""Write a French receipt from executed evidence. Does not invent test results."""
from pathlib import Path
import json,re,hashlib
R=Path(__file__).resolve().parent.parent
J=lambda p:json.loads((R/p).read_text())
B=J('report/browser-results-v112.json');S=J('report/distribution-smoke-v112.json');C=J('report/CONTRATS_LEVEL_DESIGN_V112.json');D=J('report/beacon-drive-v112.json');V=J('baseline/SOURCES_PRESERVEES_V111.json')
passed=int(re.search(r'^# pass (\d+)$',(R/'report/node-tests-v112.txt').read_text(),re.M).group(1))
assert all(t['ok'] for t in B['tests']) and all(t['ok'] for t in S['checks'])
assert B['htmlSha256']==S['htmlSha256']==hashlib.sha256((R/'JOUER_ALIENS_V112.html').read_bytes()).hexdigest()
text=f'''# QA — ALIENS V112 / Baliser le repli / RC1

## Résultats et périmètre

**{passed} tests Node passent : 408 historiques réexécutés et 78 nouveaux. {len(B['tests'])} contrôles gameplay navigateur passent : 187 historiques réexécutés et 49 nouveaux.** Neuf contextes Chromium indépendants, aucune erreur JavaScript/console observée. {len(S['checks'])} contrôles de distribution et 74 contrôles de corpus de sauvegardes sont séparés de ces totaux. Sept variantes complètes de l’opération terminent ; l’exercice de poursuite distinct est conservé.

Ces preuves concernent le module autonome livré. Elles ne certifient pas la campagne native de 64 salles, un GPU, une manette, un téléphone physique ou une absence universelle de défauts.

## Provenance

Source fournie : `ALIENS_1986_V111_DANS_LE_NOIR_RC1.zip`, 42 432 709 octets. SHA-256 `5c90e5281869f735f9ffb8a19cdc57a45473938d56b6920813f4ac76a9a23cee`.
{len(V)} sources/tests sont conservés byte-for-byte dans `baseline/SOURCES_PRESERVEES_V111.json`. Les modules V112 étendent la branche sans remplacer les validateurs historiques. Contrat : `{C['contract']}`.

## Catalogue

10 inspections, 9 lieux reliés, 11 liaisons partagées /22 faces, 5 objectifs ordonnés. 60 solides fixes, 11 portes intérieures, 54 props, 38 observations, 13 ennemis de catalogue et une sentinelle. L’atelier optique et la coursive des conduites ajoutent deux lieux, trois raccords, treize solides, deux portes intérieures et deux contacts. La population nouvelle n’apparaît pas à la demande.

Operations–Atelier et Coursive–Infirmerie commencent fermés, Atelier–Coursive ouvert. Les deux nouveaux services sont coupés. Les anciens lieux et itinéraires gardent leurs données. 10 commandes de service pilotent 17 lampes ; le relais réseau de maintenance reste séparé. Le nouveau coffret contient quatre charges, pas quatre nouvelles caches.

## 78 tests dirigés V112

Les fixtures dirigées ne sont pas des parcours. Elles contrôlent le catalogue et les gabarits, les deux faces des raccords, les stocks finis, la portée, l’arrivée tracée contre opaque/verre, la borne 360 et le minimum 28, la préparation .6s, l’ouverture 1.05s, la visée engagée, pause, marche/tir/coup interruptifs, modification du battant pendant l’action et absence de débit anticipé.

Les tests de lumière contrôlent occultation, proximité, reconnaissance des deux camps, rendu polygonal borné, absence de lumière dans une autre pièce, sources multiples non additives, expiration 36s et fading final6s, vieillissement hors champ, disques inertes persistants, bruit ponctuel et absence de soin/munition/objectif/population injectée.

Les contrats d’import refusent valeurs non finies, temps/durée inventés, identités dupliquées, coordonnées dans un support fixe, propriétés inconnues et bilans incohérents. Ils vérifient mi-geste, sources allumées/expirées, pause, migrations des huit anciens lieux via le vrai validateur V111, absence de charges offertes et atomicité des échecs. 74 exports réels des pilotes ont également été relus par l’importeur courant (recette de corpus séparée).

## Sept opérations locales complètes

Les pilotes lisent l’état pour choisir un chemin et des cibles. Ils utilisent mouvement, interaction, tir, ordres, logistique, génie, visée, éclairage et P publics, sans réécrire positions, vies, ressources, circuits, mémoires ou objectifs. Il s’agit de conduites automatisées informées par l’état, pas d’un joueur humain ignorant les données internes. Les imports sont leurs propres exports non modifiés.
'''
for label,filename in [('Deux routes héritées','operation'),('Deux boucles logistiques','logistics')]:
 text+='\n### '+label+'\n'
 for v in J(f'report/{filename}-drive-v112.json')['results']:
  team=v.get('team',v.get('ammunition',[]));text+=f"\n**{v['variant']}** : terminé `{v['complete']}` ; {v['inputs']} entrées/sous-pas ; {v['elapsed']:.3f} s simulées.\n\n| Membre | PV | Munitions |\n|---|---:|---:|\n"+''.join(f"| {a['id']} | {a['hp']} | {a['ammo']} |\n" for a in team)
  if 'logistics' in v:text+='\nRéserves restantes : `'+json.dumps(v['logistics']['stock'])+'` ; dépensé : `'+json.dumps(v['logistics']['spent'])+'`.\n'
H=J('report/breach-drive-v112.json');N=J('report/lighting-drive-v112.json');P=J('report/pursuit-drive-v112.json')
text+=f'''
### Génie et obscurité conservés

Brèche : terminé `{H['complete']}` ; {H['inputs']} entrées/sous-pas ; {H['elapsed']:.3f} s simulées. Quatre impacts, une brèche, une réfection, une soudure, une découpe. Une plaque restante. Pas de changement des anciennes valeurs pour faciliter cette conduite.

Noir : terminé `{N['complete']}` ; {N['inputs']} entrées/sous-pas ; {N['elapsed']:.3f} s simulées. Trois manœuvres électriques, deux bascules de torche, six franchissements ennemis. Hudson reste à 86 PV. Les deux nouveaux circuits coupés figurent désormais aussi dans le bilan des pièces noires ; ils ne modifient pas le trajet historique.

### Dérivation / collecte / lancer / défense

Terminé `{D['complete']}` ; {D['inputs']} entrées/sous-pas et {D['elapsed']:.3f} s simulées ; {D['enemyTransfers']} franchissements ennemis, pas trois ennemis nouveaux. La conduite ouvre le sas optique depuis Operations, entre dans l’atelier, ouvre sa porte intérieure, combat, rejoint le stock et exporte à mi-collecte. Elle termine la collecte puis exporte à mi-amorçage et reprend sans modification du fichier.

Une balise éclaire l’atelier torche éteinte. L’escouade traverse ensuite la coursive, ouvre sa porte et pose la seconde balise. Elle rejoint l’infirmerie par le nouveau raccord, recrute Newt puis poursuit la route de défense existante. La troisième balise est utilisée devant la sentinelle, avec service et torche éteints. Les sources des pièces précédentes expirent pendant ce temps. La sentinelle passe de 119 à 115 munitions entre les exports 11 et 12 ; elle avait déjà tiré un coup avant l’export 11. La source lumineuse n’ajoute pas de cartouches.

État final : trois charges dépensées, une restante, quatre gestes achevés (collecte +3 lancers), deux imports à mi-geste. Aucun soin ni réapprovisionnement appliqué au bilan.

| Membre | PV | Munitions |
|---|---:|---:|
'''+''.join(f"| {a['id']} | {a['hp']} | {a['ammo']} |\n" for a in D['team'])+f'''
Le temps simulé n’est pas une estimation de durée de jeu humaine. Les contacts et le stock de l’opération native ne sont pas validés par ce parcours autonome.

### Poursuite distincte

Exercice hérité : `{P['ok']}`, {P['enemyTransfers']} franchissements avec identités conservées. Ne pas compter cet exercice comme une huitième opération complète.

## Recette navigateur

Le HTML exact est chargé par `set_content` avec son chargeur Blob de distribution. Aucun hook d’édition de session n’est exposé. Les exports sont de vrais téléchargements et les imports de vrais champs fichier. Les premières pièces sont jouées au clavier/souris ; les scènes tardives reprennent les fichiers valides des pilotes puis utilisent les gestes cités dans les légendes.

| Recette | Contrôles |
|---|---:|
'''
for name in ['core','tail','contact-a','contact-b','touch','logistics','engineering','lighting','beacons']:
 v=J(f'report/browser-{name}-v112.json');text+=f"| {name} | {len(v['tests'])} |\n"
text+=f'''
Total {len(B['tests'])}. Chaque reçu est lié au SHA-256 du même HTML. Les 49 nouveaux contrôles effectuent R puis E pour entrer réellement dans l’atelier, E sur le coffret non ouvert, pause et interruption, P et L à la souris/clavier, reprise à mi-amorçage, débit final, source indépendante, deux pièces parcourues, carte séparée, défense sur source sans torche, vieillissement hors champ, imports faux atomiquement refusés et migration réelle V111.

844 ×390 et390 ×844 sont des viewports émulés. Le minimum de hauteur du canvas (178px paysage court /245px portrait) n’a pas été abaissé. Les commandes restent hors terrain mais le terrain apparaît petit sur écran court ; la capture ne masque pas cette limite. Aucun téléphone physique n’est certifié.

## Captures, Codex et documents

53 PNG bruts de Chromium ; dix embarqués byte-for-byte dans le rapport illustré. Aucune génération d’image, retouche ni reconstruction Python depuis l’état. Le rapport de provenance est `report/browser-results-v112.json`. Les dix nouvelles images montrent l’accès, la collecte, l’amorçage/lumière, les deux pièces, la carte, la défense, les deux viewports et le bilan.

Codex : 48 règles et dix fiches filtrables, avec plans issus des mêmes données et étiquetés comme schémas, non comme captures. La revue du document est distincte des PNG de gameplay.

## Corrections effectuées pendant la recette

Le sas optique fermé recouvrait l’ancien placement de Hicks dans son inspection ; la position d’insertion a été recalée hors volume. L’arrivée du raccord médical était trop proche d’un lit ; le raccord est maintenant à x280 avec arrivée z140. Les tests ont été rejoués sur le nouveau contrat. Aucune collision n’a été supprimée.

Les comparaisons historiques d’import ont été adaptées au registre de dix pièces : égalité de tous les anciens mondes, plus initialisation exacte des nouveaux, au lieu d’exiger à tort huit mondes au total. Les scripts attendent le catalogue chargé et mettent en pause avant de mesurer un geste court, pour ne pas le laisser s’achever pendant une capture. Les jeux de résultats proviennent tous du HTML final, pas d’une version antérieure.

## Distribution séparée

{len(S['checks'])} contrôles distincts : HTML exact, export112, zéro stock initial, onze sas, dix circuits/fiches, 48 règles filtrables, décodage et égalité des dix PNG, portrait sans débordement, aucune requête externe nécessaire et zéro erreur JS/console.

Transport direct file:// : `{json.dumps(S['transport']['directFileNavigation'],ensure_ascii=False)}`.

## Limites explicites

Suite autonome V111. Aucun raccord natif V105/64 salles, push, déploiement, final historique Reine/P-5000 remplacé ou sprites de production. Adaptateur V106 conservé inactif. Transferts discrets, tirs locaux, inventaire partagé sans poids individuel. Les deux nouveaux contacts sont derrière des hatches initialement fermés, mais leurs chemins deviennent utilisables dès ouverture ou brèche.

Éclairage procédural 2D, service global par pièce, aucune lumière entre pièces. Le rayon225 est maximal, pas une garantie de reconnaissance uniforme. La balise est libérée après sa préparation, sans vol/rebond animé ; le segment de placement est physique. Aucune récupération ni destruction des disques, aucune batterie ajoutée. Le bruit d’impact n’est pas un leurre qui garantit l’attraction d’un contact.

## Reproduction

```text
npm run check
npm run drive
node tools/export-contracts-v112.mjs
npm run build
npm run browser
npm run docs
python qa/distribution-smoke-v112.py
python tools/write-qa-v112.py
python tools/release-check-v112.py
```

HTML de recette : `{B['htmlSha256']}`. `python tools/verify-package.py` contrôle le manifeste en lecture seule. Reconstruire intentionnellement des preuves peut modifier leurs hashes ; cela ne constitue pas un contrôle de la livraison d’origine.
'''
(R/'QA_REPORT.md').write_text(text)
print('QA written',len(text.encode()))
