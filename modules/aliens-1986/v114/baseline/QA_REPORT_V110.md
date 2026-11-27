# QA — ALIENS V110 / Tenir les accès / RC1

## Résultats locaux

**343 tests Node passent : 260 tests historiques réexécutés et 83 nouveaux. 148 contrôles gameplay navigateur passent : 103 précédents et 45 de génie.** Sept recettes Chromium, zéro erreur JavaScript/console observée. 24 contrôles de distribution supplémentaires sont séparés de ce total. Cinq variantes d’opération terminent, plus l’exercice de poursuite hérité.

Ces résultats décrivent le module autonome livré, pas les 64 salles de la campagne native, une certification de GPU cible, de téléphone ou de manette. Aucun indicateur de test ne prouve universellement une absence de bugs.

## Source et catalogue

Archive source : `ALIENS_1986_V109_LOGISTIQUE_SOUS_PRESSION_RC1.zip`.
SHA-256 : `080d26e72ec8a9cf39d4fac190aac2ceea9f11bf38682ed33a0fb23b8176db78`.
18 sources/tests conservés octet pour octet dans `baseline/SOURCES_PRESERVEES_V109.json`. Contrat courant `a7301d4b`.

Huit inspections, sept lieux reliés, huit liaisons partagées et seize volumes de seuil. Aucun lieu, ennemi ou objectif obligatoire nouveau. 47 solides fixes, 9 portes intérieures, 42 instances de props, 30 observations. Le kit de trois plaques est un contenu de la caisse service-crate existante, sur cable-rack ; ce n’est ni une géométrie supplémentaire ni trois sprites créés.

## Tests dirigés V110

Les tests de contrat préparent des états précis : ils ne sont pas des playthroughs. Ils vérifient le stock fini, la portée hors support, les durées, les interruptions, la pause, la consommation à la fin, le refus d’ouverture soudée, le refus de fermeture d’une brèche, la réfection aux deux faces, les réservations de passage, le changement de structure en cours de travail et la non-duplication des réserves.

Leur volet menace contrôle la mémoire requise, la marche physique jusqu’au battant, le choix d’une route ouverte avant une brèche, le point de préparation, les 28 points d’impact, l’absorption par le renfort, les quatre/sept impacts, l’expiration, l’éloignement et la mort du frappeur. Les Facehuggers sont exclus. Les impacts n’infligent pas directement de dégâts à l’équipe. Le propre bruit d’un Warrior ne remplace pas sa piste ; aucun acteur n’est créé.

Le volet persistance contrôle schéma, registre complet, limites, cohérence de plaques gagnées/dépensées, gestes et attaques préparés, champs inconnus, impossibilité de refermer un sas bréché et validation avant mutation. V109 passe par son vrai validateur puis garde équipe/logistique/progression. Le kit technique n’est pas offert par une migration. V108/V107/V106 restent prises en charge selon leurs contrats.

## Cinq opérations terminées

Les pilotes lisent l’état pour calculer leur chemin, mais n’écrivent aucune position, vie, munition, ressource, porte, mémoire ou objectif. Ils appellent les entrées publiques : déplacement, tir, interaction, commandement, génie et progression du temps. Les imports viennent des exports valides de la même conduite et reprennent en pause.

### direct

Terminé : True. 3231 entrées/sous-pas ; 80.78 secondes simulées. Ces secondes ne sont pas une durée de jeu humaine.

| Membre | PV | Munitions |
|---|---:|---:|
| ripley | 100 | 7 |
| hicks | 100 | 24 |
| hudson | 100 | 24 |
| newt | 100 | 0 |

### service-link-reloads

Terminé : True. 2738 entrées/sous-pas ; 68.45 secondes simulées. Ces secondes ne sont pas une durée de jeu humaine.

| Membre | PV | Munitions |
|---|---:|---:|
| ripley | 100 | 7 |
| hicks | 100 | 24 |
| hudson | 86 | 24 |
| newt | 100 | 0 |

### supply-loop

Terminé : True. 4451 entrées/sous-pas ; 111.28 secondes simulées. Ces secondes ne sont pas une durée de jeu humaine.

| Membre | PV | Munitions |
|---|---:|---:|
| ripley | 86 | 21 |
| hicks | 100 | 23 |
| hudson | 100 | 24 |
| newt | 100 | 0 |

Génie : `{"plates": 2, "spent": 1, "collected": true, "nearby": null, "metrics": {"stocks": 1, "reinforced": 1, "cut": 1, "repaired": 0, "started": 3, "interrupted": 0, "enemyHits": 0, "breaches": 0}}`.

### supply-loop-reloads

Terminé : True. 4450 entrées/sous-pas ; 111.25 secondes simulées. Ces secondes ne sont pas une durée de jeu humaine.

| Membre | PV | Munitions |
|---|---:|---:|
| ripley | 86 | 21 |
| hicks | 100 | 23 |
| hudson | 100 | 24 |
| newt | 100 | 0 |

Génie : `{"plates": 2, "spent": 1, "collected": true, "nearby": null, "metrics": {"stocks": 1, "reinforced": 1, "cut": 1, "repaired": 0, "started": 3, "interrupted": 0, "enemyHits": 0, "breaches": 0}}`.

### brèche / réfection / soudure / repli

Terminé : True. 4443 entrées/sous-pas ; 111.075 secondes simulées ; 5 franchissements ennemis cumulés (pas cinq créatures nouvelles).

Le pilote part de l’insertion normale, laisse la paire résidentielle vivante, s’éloigne en profondeur et atteint Operations. Il ferme derrière le groupe et laisse les Warriors atteindre le battant. Quatre impacts provoquent une brèche. Le groupe combat, récupère le kit de maintenance, revient réparer, soude, découpe puis termine les étapes de Newt et la défense. Des rechargements ont lieu après le premier impact et au milieu de la réfection ; aucun état n’est injecté pour faciliter le résultat.

| Membre | PV | Munitions |
|---|---:|---:|
| ripley | 100 | 12 |
| hicks | 100 | 21 |
| hudson | 86 | 22 |
| newt | 100 | 0 |

Génie final : `{"plates": 1, "spent": 2, "collected": true, "nearby": null, "metrics": {"stocks": 1, "reinforced": 1, "cut": 1, "repaired": 1, "started": 4, "interrupted": 0, "enemyHits": 4, "breaches": 1}}`.

## Poursuite héritée distincte

`qa/drive-pursuit-v110.mjs` conserve la fuite, les deux franchissements, la mesure du détecteur, la défense et l’isolement. Résultat : 2 franchissements sur 1067 entrées/sous-pas ; aucune identité ajoutée.

## Recette navigateur

Le HTML exact est chargé depuis ses octets par `set_content` avec son chargeur Blob habituel. Aucun hook d’édition de session n’est exposé. Les contrôles d’import sont de vrais champs fichier et les exports sont des téléchargements. Les deux premières pièces sont traversées au clavier et à la souris. Les tests tardifs reprennent des exports non modifiés des pilotes puis effectuent les gestes indiqués dans Chromium.

Les 45 contrôles nouveaux incluent : première rupture simulée en navigateur, import de préparation ennemie, E sur stock non ouvert puis vide, J terminé sans débit anticipé, O par touche et par clic, pause, déplacement et F interruptifs, reprise à mi-geste, refus de R sur renfort, U sans remboursement, imports falsifiés rejetés atomiquement, migration réelle V109, carte sans radar, Codex, bilan, écran court et portrait.

| Recette | Contrôles réussis |
|---|---:|
| core | 17 |
| tail | 11 |
| contact-a | 15 |
| contact-b | 11 |
| touch | 10 |
| logistics | 39 |
| engineering | 45 |

Total gameplay : 148. Toutes les recettes lient leur propre SHA-256 au même document. Les viewports 844 × 390 et 390 × 844 sont émulés ; aucun téléphone physique n’est déclaré testé.

## Captures et documents

34 PNG bruts de Chromium, non retouchés. Douze sont intégrés byte-for-byte au rapport illustré. `report/browser-results-v110.json` donne chaque origine : entrées UI ou reprise d’un export réel. Les schémas du Codex sont étiquetés comme plans issus des données et ne sont pas des captures. Le Codex comprend 26 règles et huit fiches.

La planche de revue des captures, consultée pendant la recette, ne remplace aucun PNG du rapport. Les détails visibles restent ceux du rendu procédural, pas des assets de production.

## Corrections trouvées pendant la recette

La liaison entre système acoustique et génie a été rendue acyclique pour le chargement Blob, sans contourner la géométrie. Un frappeur n’écrase plus son indice par son propre bruit. Les attaques de structure sont réservées aux Warriors. Les anciennes préparations sont annulées après ouverture ou réfection. La progression du travail a été retirée de la signalétique du sas et gardée dans la barre hors terrain.

L’ajout d’une bande Génie avait réduit le terrain du format court. Réserves et Génie partagent désormais le même emplacement en paysage court ; le minimum de hauteur testé n’a pas été abaissé pour faire passer le test. Les recettes attendent les modules avant de compter les boutons de catalogue. La recette du rapport force seulement le chargement de ses images différées pour les décoder : aucune image n’est modifiée.

## Distribution séparée

24 contrôles supplémentaires : document exact, schéma et inventaire exportés, sas, huit fiches filtrables, 26 règles, plans, décodage et égalité des douze PNG embarqués, portrait, absence de réseau requis et de JS/console en erreur.

Transport direct file:// : `{"validated": false, "reason": "Page.goto: net::ERR_BLOCKED_BY_ADMINISTRATOR at file:///mnt/data/ALIENS_1986_V110_TENIR_LES_ACCES_RC1/JOUER_ALIENS_V110.html\nCall log:\n  - navigating to \"file:///mnt/data/ALIENS_1986_V110_TENIR_LES_ACCES_RC1/JOUER_ALIENS_V110.html\", waiting until \"load\"\n"}`.

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

HTML certifié par cette recette : `7766a7ad6b024e2596e4395b2f6375d1189c50d7495572f206c6b79cf32daf87`.
`python tools/verify-package.py` contrôle les hashes en lecture seule ; reconstruire volontairement des preuves peut modifier leurs hashes. Aucun média externe nécessaire pour jouer.

## Contrôle d’intégrité indépendant

Six essais supplémentaires sur une copie jetable passent : paquet intact accepté, manifeste inchangé par le vérificateur, composant altéré refusé, fichier non listé refusé, fichier requis absent refusé, puis acceptation après restauration des octets. Ces essais sont séparés des tests gameplay et documentés dans `report/integrity-probe-v110.json`.
