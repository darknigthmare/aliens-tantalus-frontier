# Aliens (1986) — accessoires et orientations V118

Ce supplément ajoute **11 PNG** au catalogue de 130 images, soit **141 images**. Il fournit huit accessoires adaptés aux supports déjà présents et trois vues de la sentinelle. Le profil latéral existant et les miroirs portent celle-ci à sept orientations en PNG ; la direction frontale garde le dessin procédural V114.

[Galerie](index.html) · [Manifeste et empreintes](manifest.json) · [Prompts et inspections](generation-ledger.json) · [Références et limites de fidélité](references.md)

## Utilisation des nouvelles images

| Image | Emplacement et comportement |
| --- | --- |
| `engineering-case-stocked` | `service-crate`, maintenance : trois plaques avant collecte ; après collecte, réutilisation du PNG vide V117 |
| `gateway-inquiry-display` | Mur de projection de la commission Gateway ; écran élevé de 80 unités au-dessus de l’ancrage |
| `service-control-pedestal` | Quatre colonnes de commande : quai, réserve, atelier optique et conduite |
| `medical-counter-terminal` | Terminal sur le comptoir médical existant, élévation 67 |
| `optics-calibration-terminal` | Terminal sur le banc de calibration, élévation 65 |
| `valve-indicator-panel` | Indicateur sur le socle de vanne, élévation 73 |
| `sulaco-briefing-terminal` | Terminal de la table de briefing du Sulaco, élévation 49 |
| `operations-table-terminal` | Terminal sur la table centrale d’Operations, élévation 49 |
| `sentry-aim-front-right` | Visée avant droite et miroir avant gauche |
| `sentry-aim-rear-right` | Visée arrière droite et miroir arrière gauche |
| `sentry-aim-rear` | Visée vers le fond |

Le stock de renforts et l’écran Gateway n’avaient pas de sélection raster. Les six types de terminaux remplaçaient un meuble complet jusque sur des tables et potelets ; leurs nouvelles silhouettes correspondent à ces supports. La sentinelle revenait au dessin procédural dès qu’elle quittait le profil ou tournait. Elle sélectionne désormais une vue statique selon son angle réel, y compris pendant l’interpolation existante de la commande d’orientation. La vue frontale refusée conserve explicitement le dessin V114.

Les PNG sont copiés depuis les sorties natives du générateur, sans retouche des pixels. Leur transparence, leurs dimensions, leur boîte alpha ≥ 128, leur pivot, leur taille et leur SHA-256 sont mesurés et enregistrés. Le journal distingue les références, les générations, les inspections en résolution source et les validations navigateur.

## Intégration et préservation

Le supplément se superpose aux manifestes V116 et V117. Il ne réécrit aucune de leurs 130 entrées. Le corpus V114 de 1 159 fichiers, les deux HTML source, le chargeur V116, le renderer V116 et les PNG précédents conservent leurs octets. Le schéma de sauvegarde reste 114.

Le module `raster-props-v118.mjs` enveloppe seulement les appels de présentation nécessaires. Il conserve le rendu antérieur pendant le chargement d’une image, pour les objets non ciblés et pour les sentinelles détruites. Les ressources, acteurs, positions, supports, collisions et règles de combat ne sont pas modifiés.

Le dérivateur réunit les trois manifestes, vérifie chaque image puis installe l’extension V118 après le renderer V116 dans le HTML distribué. Les empreintes historiques sont conservées ; la transition du dérivateur V117 vers V118 est déclarée séparément. L’admission des nouveaux fichiers est fermée aux onze PNG, au module, aux contrôles et aux cinq documents explicitement prévus. La galerie et les documents restent exclus du build public.

Les coffrets plein et vide partagent une largeur maximale de 52 unités, afin de conserver l’emprise du stock et de ne pas chevaucher la mallette d’armement voisine. Les terminaux de table sont ancrés sur `project(prop) − elevation`. L’écran Gateway reste sur son mur. Les sept orientations raster de sentinelle utilisent une hauteur de 75 unités et un pivot au sol.

## Vérification reproductible

Les résultats réellement exécutés et les liens des preuves CI figurent dans la pull request de ce supplément. Les commandes du dépôt sont :

```sh
npm run test:dlc:aliens1986
npm run check:dlc:aliens1986
npm run check
npm run build
npm run check:built
```

Le nouveau banc visuel utilise les PNG réels, les renderers V114/V116/V118, les définitions de salles, les supports et la projection V114. Les états de collecte et les angles sont des fixtures déclarées. Il vérifie séparément douze cas de rendu pour onze emplacements d’accessoires — le même coffret avant et après collecte —, les huit directions de sentinelle et le milieu d’une rotation :

```sh
python3 -B scripts/qa-aliens1986-props-v118.py --source-root . --output .qa/aliens1986-props-v118
```

Il faut Python Playwright et Chromium pour exécuter le rendu. Le mode `--preflight-only` contrôle uniquement les empreintes et les ressources ; il ne produit aucune réussite de test navigateur. Le rapport distingue ce mode, les assertions réellement exécutées et les erreurs de lancement. La CI conserve le rapport et la capture dans `aliens1986-browser-evidence` et exécute séparément le parcours servi du jeu, les sauvegardes, les portes et les actions du menu.

La fixture instrumente les vrais appels `drawImage` et contrôle l’image sélectionnée, les dimensions décodées, les miroirs, les pivots, le maintien des élévations, le chargement et l’absence de mutation. Les mesures de socle sont des diagnostics de proportions ; elles ne remplacent pas la revue de la capture et ne prouvent pas une échelle identique au film.

## État de récupération et limites

Les onze fichiers sont **de nouvelles générations**. Les trois vues de sentinelle remplacent un besoin fonctionnel précédemment couvert par une ancienne planche perdue ; elles ne récupèrent pas les octets de cette planche. Les **20 anciens PNG et 53 documents locaux** recensés avant l’interruption restent introuvables. Les dix-neuf anciennes sources de poses déjà absentes restent également non récupérées. Les fichiers introuvables ne sont pas comptés comme publiés.

Les quatre variantes précédemment refusées — Hicks blessé, Warrior en marche, Facehugger en attaque et Facehugger en défaite — n’ont pas été retentées et restent absentes. Les poses de marche et d’interaction existantes sont des images individuelles. Une cinquième demande, `sentry-aim-front`, a été refusée pendant cette passe (HTTP 400 `moderation_blocked`, catégorie de sortie `illicit`) ; aucun fichier frontal n’a été reçu et aucune relance n’a été tentée. Ce libellé est le retour du générateur. Le lot ne crée aucun cycle d’animation complet.

Les lits, certains volumes de mobilier et les fonds de salle restent procéduraux. Certains équipements déjà présents au catalogue, notamment le chalumeau, la balise isolée et le cadre de porte, demandent encore une intégration dédiée à leurs gestes ou surfaces. Les fonctionnalités de liaison distante, conduite, vol et duel du P-5000 restent des chantiers de gameplay distincts.

**La fidélité exacte 1:1 au film n’est pas certifiée.** Les accessoires de table, le coffret de renforts et l’écran mural sont des adaptations documentées des scènes du projet ; les nouvelles faces de la sentinelle sont générées à partir d’une référence latérale. Le manifeste et le journal conservent `filmFidelityValidated: false`.
