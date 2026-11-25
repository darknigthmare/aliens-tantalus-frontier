from pathlib import Path
import json,re,hashlib
R=Path(__file__).resolve().parent.parent
J=lambda p:json.loads((R/p).read_text())
B=J('report/browser-results-v110.json');S=J('report/distribution-smoke-v110.json');D=J('report/operation-drive-v110.json');L=J('report/logistics-drive-v110.json');H=J('report/breach-drive-v110.json');P=J('report/pursuit-drive-v110.json');C=J('report/CONTRATS_LEVEL_DESIGN_V110.json');V=J('baseline/SOURCES_PRESERVEES_V109.json')
tap=(R/'report/node-tests-v110.tap').read_text();count=int(re.search(r'^# pass (\d+)$',tap,re.M).group(1));assert count==343 and all(x['ok'] for x in B['tests']) and all(x['ok'] for x in S['checks'])
text=f'''# QA — ALIENS V110 / Tenir les accès / RC1

## Résultats locaux

**{count} tests Node passent : 260 tests historiques réexécutés et 83 nouveaux. {len(B['tests'])} contrôles gameplay navigateur passent : 103 précédents et 45 de génie.** Sept recettes Chromium, zéro erreur JavaScript/console observée. {len(S['checks'])} contrôles de distribution supplémentaires sont séparés de ce total. Cinq variantes d’opération terminent, plus l’exercice de poursuite hérité.

Ces résultats décrivent le module autonome livré, pas les 64 salles de la campagne native, une certification de GPU cible, de téléphone ou de manette. Aucun indicateur de test ne prouve universellement une absence de bugs.

## Source et catalogue

Archive source : `{V['archive']}`.
SHA-256 : `{V['sha256']}`.
{V['count']} sources/tests conservés octet pour octet dans `baseline/SOURCES_PRESERVEES_V109.json`. Contrat courant `{C['contract']}`.

Huit inspections, sept lieux reliés, huit liaisons partagées et seize volumes de seuil. Aucun lieu, ennemi ou objectif obligatoire nouveau. 47 solides fixes, 9 portes intérieures, 42 instances de props, 30 observations. Le kit de trois plaques est un contenu de la caisse service-crate existante, sur cable-rack ; ce n’est ni une géométrie supplémentaire ni trois sprites créés.

## Tests dirigés V110

Les tests de contrat préparent des états précis : ils ne sont pas des playthroughs. Ils vérifient le stock fini, la portée hors support, les durées, les interruptions, la pause, la consommation à la fin, le refus d’ouverture soudée, le refus de fermeture d’une brèche, la réfection aux deux faces, les réservations de passage, le changement de structure en cours de travail et la non-duplication des réserves.

Leur volet menace contrôle la mémoire requise, la marche physique jusqu’au battant, le choix d’une route ouverte avant une brèche, le point de préparation, les 28 points d’impact, l’absorption par le renfort, les quatre/sept impacts, l’expiration, l’éloignement et la mort du frappeur. Les Facehuggers sont exclus. Les impacts n’infligent pas directement de dégâts à l’équipe. Le propre bruit d’un Warrior ne remplace pas sa piste ; aucun acteur n’est créé.

Le volet persistance contrôle schéma, registre complet, limites, cohérence de plaques gagnées/dépensées, gestes et attaques préparés, champs inconnus, impossibilité de refermer un sas bréché et validation avant mutation. V109 passe par son vrai validateur puis garde équipe/logistique/progression. Le kit technique n’est pas offert par une migration. V108/V107/V106 restent prises en charge selon leurs contrats.

## Cinq opérations terminées

Les pilotes lisent l’état pour calculer leur chemin, mais n’écrivent aucune position, vie, munition, ressource, porte, mémoire ou objectif. Ils appellent les entrées publiques : déplacement, tir, interaction, commandement, génie et progression du temps. Les imports viennent des exports valides de la même conduite et reprennent en pause.
'''
for v in D['results']+L['results']:
 team=v.get('team',v.get('ammunition'));text+=f'\n### {v["variant"]}\n\nTerminé : {v["complete"]}. {v["inputs"]} entrées/sous-pas ; {v["elapsed"]:.2f} secondes simulées. Ces secondes ne sont pas une durée de jeu humaine.\n\n| Membre | PV | Munitions |\n|---|---:|---:|\n'
 for a in team:text+=f'| {a["id"]} | {a["hp"]} | {a["ammo"]} |\n'
 if 'engineering' in v:text+='\nGénie : `'+json.dumps(v['engineering'],ensure_ascii=False)+'`.\n'
text+=f'''
### brèche / réfection / soudure / repli

Terminé : {H['complete']}. {H['inputs']} entrées/sous-pas ; {H['elapsed']:.3f} secondes simulées ; {H['enemyTransfers']} franchissements ennemis cumulés (pas cinq créatures nouvelles).

Le pilote part de l’insertion normale, laisse la paire résidentielle vivante, s’éloigne en profondeur et atteint Operations. Il ferme derrière le groupe et laisse les Warriors atteindre le battant. Quatre impacts provoquent une brèche. Le groupe combat, récupère le kit de maintenance, revient réparer, soude, découpe puis termine les étapes de Newt et la défense. Des rechargements ont lieu après le premier impact et au milieu de la réfection ; aucun état n’est injecté pour faciliter le résultat.

| Membre | PV | Munitions |
|---|---:|---:|
'''
for a in H['team']:text+=f'| {a["id"]} | {a["hp"]} | {a["ammo"]} |\n'
text+='\nGénie final : `'+json.dumps(H['engineering'],ensure_ascii=False)+'`.\n'
text+=f'''
## Poursuite héritée distincte

`qa/drive-pursuit-v110.mjs` conserve la fuite, les deux franchissements, la mesure du détecteur, la défense et l’isolement. Résultat : {P['enemyTransfers']} franchissements sur {P['steps']} entrées/sous-pas ; aucune identité ajoutée.

## Recette navigateur

Le HTML exact est chargé depuis ses octets par `set_content` avec son chargeur Blob habituel. Aucun hook d’édition de session n’est exposé. Les contrôles d’import sont de vrais champs fichier et les exports sont des téléchargements. Les deux premières pièces sont traversées au clavier et à la souris. Les tests tardifs reprennent des exports non modifiés des pilotes puis effectuent les gestes indiqués dans Chromium.

Les 45 contrôles nouveaux incluent : première rupture simulée en navigateur, import de préparation ennemie, E sur stock non ouvert puis vide, J terminé sans débit anticipé, O par touche et par clic, pause, déplacement et F interruptifs, reprise à mi-geste, refus de R sur renfort, U sans remboursement, imports falsifiés rejetés atomiquement, migration réelle V109, carte sans radar, Codex, bilan, écran court et portrait.

| Recette | Contrôles réussis |
|---|---:|
'''
for part in ['core','tail','contact-a','contact-b','touch','logistics','engineering']:
 d=J('report/browser-'+part+'-v110.json');text+=f'| {part} | {len(d["tests"])} |\n'
text+=f'''
Total gameplay : {len(B['tests'])}. Toutes les recettes lient leur propre SHA-256 au même document. Les viewports 844 × 390 et 390 × 844 sont émulés ; aucun téléphone physique n’est déclaré testé.

## Captures et documents

{len(B['captures'])} PNG bruts de Chromium, non retouchés. Douze sont intégrés byte-for-byte au rapport illustré. `report/browser-results-v110.json` donne chaque origine : entrées UI ou reprise d’un export réel. Les schémas du Codex sont étiquetés comme plans issus des données et ne sont pas des captures. Le Codex comprend 26 règles et huit fiches.

La planche de revue des captures, consultée pendant la recette, ne remplace aucun PNG du rapport. Les détails visibles restent ceux du rendu procédural, pas des assets de production.

## Corrections trouvées pendant la recette

La liaison entre système acoustique et génie a été rendue acyclique pour le chargement Blob, sans contourner la géométrie. Un frappeur n’écrase plus son indice par son propre bruit. Les attaques de structure sont réservées aux Warriors. Les anciennes préparations sont annulées après ouverture ou réfection. La progression du travail a été retirée de la signalétique du sas et gardée dans la barre hors terrain.

L’ajout d’une bande Génie avait réduit le terrain du format court. Réserves et Génie partagent désormais le même emplacement en paysage court ; le minimum de hauteur testé n’a pas été abaissé pour faire passer le test. Les recettes attendent les modules avant de compter les boutons de catalogue. La recette du rapport force seulement le chargement de ses images différées pour les décoder : aucune image n’est modifiée.

## Distribution séparée

{len(S['checks'])} contrôles supplémentaires : document exact, schéma et inventaire exportés, sas, huit fiches filtrables, 26 règles, plans, décodage et égalité des douze PNG embarqués, portrait, absence de réseau requis et de JS/console en erreur.

Transport direct file:// : `{json.dumps(S['transport']['directFileNavigation'],ensure_ascii=False)}`.

## Limites

Branche autonome V109 prolongée, aucune fusion native V105, aucun push/déploiement. L’ancien adaptateur V106 est conservé mais inactif ; ses tests sur fixtures ne sont pas un raccord V110. Aucun service worker ou fichier natif de sauvegarde n’est modifié.

Pas de nouvelle salle/population/mission obligatoire, destructibilité des portes intérieures, tirs entre pièces, espace continu, final Reine/P-5000, multijoueur, poids individuel, recyclage de plaques ou sprites définitifs. L’intégrité importée est vérifiée, pas signée comme un anti-triche. Les bruitages restent synthétiques facultatifs, désactivés par défaut.

## Reproduction et intégrité

```text
npm run check
npm run drive
node tools/export-contracts-v110.mjs
python tools/build-preview.py
python qa/browser-v110.py
python tools/build-docs-v110.py
python qa/distribution-smoke-v110.py
python tools/release-check-v110.py
```

HTML certifié par cette recette : `{B['htmlSha256']}`.
`python tools/verify-package.py` contrôle les hashes en lecture seule ; reconstruire volontairement des preuves peut modifier leurs hashes. Aucun média externe nécessaire pour jouer.
'''
(R/'QA_REPORT.md').write_text(text)
print('QA_REPORT written',len(text))
