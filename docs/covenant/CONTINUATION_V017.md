# Covenant V017 — journal de consolidation

> **Sources et bible finalisées ; publication et validations finales en attente.** Les treize nouveaux originaux sont intégrés au manifeste figé. Le total de 154 PNG, les 81 admissions au rendu et les 73 images de catalogue sont reconstruits et contrôlés. Les résultats locaux et leurs limites sont précisés ci-dessous.

## Base réunie et conservation

V017 consolide V015 et V016. Les **103 originaux V011–V014**, les **22 originaux V015** et les **16 originaux V016** forment une base de **141 PNG**. Cette base conserve ses 72 admissions au rendu et ses cinq cycles antérieurs ; 69 images sont alors réservées au catalogue.

V015 comprend huit phases de Ricks, huit d’Oram et six équipements : consoles et sièges du pont et du Lander, table centrale du pont, table médicale avec colonne. V016 comprend notamment cinq poses de David, des accessoires de production, quatre éléments de terrain et deux vues du rover. Le lot V017 conserve ces productions sans les régénérer.

La [PR 79](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/79) était publiée au commit `2539d67020950b5ebcd269413729ec7acec7eb76`. La continuation V015 de la [PR 71](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/71), commit `9ee21033a71fc0f965ef270fa560d13eaa89d813`, est présente dans la cible convergée `6c2d610b7faf9ed88fc6c6977a98411ad1880940`. Ces références identifient les sources historiques ; elles ne constituent pas une publication V017.

Le vérificateur de conservation V017 a réussi : **141 anciens PNG, six manifestes, douze empreintes documentaires et trois builders historiques préservés**, ainsi que les 72 anciennes admissions et les cinq anciens cycles. Les définitions natives de simulation sont inchangées. Les documents anciens gardent leurs comptes et limites datés ; leur validation n’est pas transférée à cette nouvelle révision.

## Treize originaux et deux raccords précis

Les ajouts sont **huit phases de marche d’Upworth et cinq images de monde**, soit **154 PNG cumulés**. Les huit nouvelles admissions Upworth et la promotion d’un rocher V016 portent le rendu à **81 images** ; **73 restent au catalogue**. La promotion ne crée aucune image supplémentaire.

Upworth est rattachée uniquement à la présence native `upworth-comms`, dans `comms`, pour la marche non armée. Son déplacement existe déjà ; la route et la vitesse du moteur sont conservées. Le cycle complet est requis : une phase indisponible entraîne le repli procédural de l’ensemble du cycle. Le rendu opposé utilise la réflexion existante et ne constitue pas une seconde vue filmique documentée.

Les phases retenues proviennent des essais 01, 02, 03, 04-v2, 05-v2, 06-v2, 07 et 08-v2. Les **quatre essais initiaux 04, 05, 06 et 08 sont exclus** pour les problèmes d’alternance ou d’appui relevés. Leurs SHA256 et leurs motifs restent dans le manifeste ; ils ne sont pas comptés parmi les images livrables. Les treize PNG retenus restent identiques aux originaux natifs sauvegardés.

Le rocher de berge `world-planet4-shore-rock`, déjà produit en V016, reçoit une seule occurrence : `landing-light2` dans `landing`, `x=1750`, `z=0.02`, largeur 110, hauteur 65, non solide. Cette admission conserve dimensions, collisions et simulation. Les autres terrains V016 restent au catalogue.

| Candidat documentaire V017 | Images de catalogue | Contrat maintenu |
| --- | ---: | --- |
| `cand-juggernaut-pilot-chair-production` | 1 | Siège vide issu d’un modèle de fabrication ; aucun remplacement de l’estrade |
| `cand-juggernaut-bay-iris` | 2 | Fermé et ouvert ; trois états intermédiaires encore manquants |
| `cand-colonist-cryopod-vertical` | 1 | Capsule verticale ; les occurrences horizontales natives de 200 × 84 sont incompatibles |
| `cand-cryopod-hanging-yoke-production` | 1 | Support supérieur isolé ; capsule et architecture du cryovault non couvertes |

Ces cinq images restent au catalogue. Elles ne ferment pas les familles entières `urnplatform` ou `cryopod`. Les deux iris sont des vues statiques distinctes, sans alignement certifié pour une animation continue.

## Animation et bible

| Ensemble | Cycles complets | Phases ou poses |
| --- | ---: | ---: |
| Quatre tenues du joueur | 4 | 32 phases admises au rendu |
| Walter et Upworth, présences précises | 2 | 16 phases admises au rendu |
| Ricks et Oram | 2 | 16 phases de catalogue |
| David hôte, séquence incomplète | 0 | 5 poses séparées |

Le corpus comporte **six cycles runtime / 48 phases**, **deux cycles de catalogue / 16 phases**, donc **huit cycles complets / 64 phases**, auxquels s’ajoutent cinq poses David incomplètes : **69 images d’animation**. Les poses David sont exclues du lecteur de cycles. La phase 03 refusée et les phases 04/08 non produites restent des manques documentés.

Les quatre bibles V017 comprennent **261 contrats de production**, **315 références**, **67 liaisons**, **134 seuils** et **630 occurrences de props**. Elles détaillent personnages, lieux, armes, accessoires, véhicules, vaisseaux, terrains et planètes. Les fiches conservent les identifiants historiques, les états manquants, les consommateurs exacts et les actions suivantes. Un contrat documentaire n’équivaut pas à un PNG terminé.

## Références et limites

Les sources de ce lot comprennent [Tony Drew](https://www.tonydrew.com.au/film) pour les éléments de fabrication, [Unorthodox Design](https://www.unorthodoxdesign.ca/movie-work) pour la capsule verticale visible dans le film, et l’[entretien de plateau d’Upworth](https://www.youtube.com/watch?v=vQMH3N07RXs) pour le visage, la coiffure, le haut et la ceinture. L’animation et les parties non montrées du costume restent des adaptations qualifiées.

La fiche du siège conserve l’attribution de Tony Drew à un asset initial de Ben Procter sur Prometheus, ainsi que la limite liée à la scène de navigation Covenant réduite. L’iris et le support s’appuient sur des documents de production ; la capsule verticale combine une apparence visible à l’écran et un complément de fabrication. Aucune de ces références ne rend canoniques les parties reconstruites.

**Aucune fidélité 1:1 n’est certifiée.** Les sources filmiques, bonus, modèles de fabrication et adaptations jouables restent distingués. Les lacunes historiques V016 de récupération des prompts sont conservées ; les treize prompts sélectionnés V017 sont intégralement disponibles dans le manifeste. Aucun manque de personnage, d’arme ou de surface d’Origae-6 n’est fermé par supposition.

## Livrables figés et paquet à valider

- [Bible V017 Markdown](BIBLE_COVENANT_V017.md), [HTML](BIBLE_COVENANT_V017.html), [JSON](BIBLE_COVENANT_V017.json) et [Excel](BIBLE_COVENANT_V017.xlsx).
- [Manifeste V017](../../assets/openai/sprites/alien-covenant-v017/manifest.json), SHA256 `a0a552042ae8c0cafaa77c2a9161ef46023a066e0d82391044ad4323276315a4`.
- [Provenance V017](PROVENANCE_V017.json), avec empreintes des sources, du runtime, des bibles et des reçus disponibles.
- [Suivi des sprites V017](SPRITES_V017_STATUS.md), [index Covenant](README.md) et [bible principale du projet](../narrative/CAMPAGNE_PRINCIPALE.md).

Les quatre formats de bible sont finalisés. Le classeur a été comparé sur 17 600 cellules, sans erreur de formule ; les 16 feuilles ont été examinées au moyen de 33 vues, dont dix vues actualisées et 23 vues antérieures conservées. Cette inspection ne correspond pas à une ouverture dans l’application native Excel.

Le paquet hors ligne doit réunir les 154 PNG originaux, les manifestes, les quatre formats de bible et le catalogue. Celui-ci présente aussi les 73 images sans admission de jeu. La distribution jouable conserve une liste distincte de 81 admissions. La construction, le contrôle navigateur du catalogue et l’intégrité du ZIP final restent à valider.

## Résultats locaux acquis

| Vérification | Résultat et portée |
| --- | --- |
| `npm run test:covenant` | 67/67 ; résultat local communiqué par l’intégrateur |
| `npm run check:covenant` | Réussi ; résultat local communiqué par l’intégrateur |
| `node scripts/verify-covenant-v017-preservation.mjs` | Réussi ; historique et simulation préservés, 19 005 748 octets de nouveaux PNG |
| Pilotes natifs | 15/15 ; parcours guidés par coordonnées avec les API natives de déplacement, interaction et combat |
| `npm run test:dlc` | 48/48, dont 32 tests de succession et 16 autres tests DLC, sans test ignoré |
| `npm run check:dlc:avp` | Réussi ; bundle reproductible de 30 modules |
| Assets V017 | Huit phases Upworth et cinq images de monde relues ; dimensions, alpha et empreintes enregistrés |
| Bible V017 | Quatre formats figés ; reçus de génération, comparaison et inspection conservés |

Le raccord de succession documentaire préserve le préfixe historique de la campagne : **586 969 octets**, SHA256 `7f318ee44a83d3cf0fd7a84b48aa94ae7d7a51d25253ae0c289a7e862a37a525`. L’annexe V016–V017 mesure **4 803 octets**, SHA256 `d27153bbe216970df12d287d2505e0bf8fe6da85605a0aa185025f6b1f838c03`. Le document figé complet porte l’empreinte `e74a6c39b2e4e85f658680578b4e0d03963bc8a42d642638dae4551c302b837c`. Les 29 tests historiques restent actifs ; trois tests supplémentaires contrôlent notamment les altérations, doublons, omissions et l’exclusion de la distribution construite.

## Contrôles encore ouverts

Le contrôle général `npm run check` a parcouru les fichiers présents puis s’est arrêté sur le dossier suivi `archives`, absent du checkout partiel. Son statut est **bloqué localement**, sans succès global déclaré. Aucun garde n’a été modifié pour contourner cet obstacle. Le build complet et `check:built` doivent s’exécuter en CI sur un checkout complet.

Restent en attente : le parcours navigateur du jeu, l’observation du rendu Upworth, le catalogue navigateur, le ZIP final, la publication V017 et la CI du commit publié. Les pilotes de simulation ne remplacent pas les contrôles navigateur. Les parcours réels, scènes préparées et blocages d’images devront rester identifiés séparément dans les prochains reçus. Le présent journal ne présume aucun succès de publication ou de CI.
