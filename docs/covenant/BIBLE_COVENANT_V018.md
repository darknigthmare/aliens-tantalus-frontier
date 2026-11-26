# Alien: Covenant — continuation V018 : portes de la baie

Cette annexe prolonge la [bible exhaustive V017](BIBLE_COVENANT_V017.md), conservée avec ses quatre formats et ses empreintes. Elle ajoute **un sprite retenu au catalogue** : le sas latéral orange de la baie de terraformation, avec son panneau entrouvert observé sur la photographie du plateau. Une grande porte fermée reste **un candidat documentaire à réviser**, conservé séparément.

L’inventaire de production contient maintenant **155 PNG : 81 dans le rendu et 74 au catalogue**. Le candidat de grande porte n’entre pas dans ces 155 images. Les **154 originaux historiques**, **46 fichiers récupérés** et **16 candidats historiques** restent inchangés. Aucun rejet n’est promu. **Aucune fidélité 1:1 n’est certifiée.**

## Registre de cette continuation

| Élément | Statut | Dimensions natives | Taille | Admission dans le jeu |
|---|---|---:|---:|---|
| [Sas latéral orange](../../assets/openai/sprites/alien-covenant-v018/prop-covenant-terraforming-side-airlock.png) | Retenu au catalogue | 1200 × 1310 | 2,038,760 octets | Aucune |
| [Grande porte terminale](v018-candidates/prop-covenant-terraforming-main-doors-closed.png) | Candidat à réviser, hors production | 2098 × 749 | 1,894,740 octets | Aucune |

Les fichiers sont les sorties PNG natives du générateur : alpha conservé, sans redimensionnement ni retouche des pixels. Les quatre prompts exacts, les références ordonnées, les empreintes et les deux essais écartés figurent dans le [manifeste V018](../../assets/openai/sprites/alien-covenant-v018/manifest.json). Les essais écartés sont identifiés sans ajouter leurs images au catalogue. Le [registre de provenance](PROVENANCE_V018.json) épingle les manifestes précédents, les documents V017 et les fichiers du moteur.

## Sas latéral : ce qui est documenté

La photographie **JAC_9576** de Jacinta Leong montre le sas orange au premier plan gauche. Le modèle **Cam001** confirme son organisation générale. La reconstruction conserve le carter orange, le socle gris, le cadre circulaire segmenté, les blocs de verrouillage, les nervures intérieures, les quatre embouts visibles sur chaque côté, l’écran incliné à gauche et l’éclairage rouge supérieur. Le panneau orange reste visible contre le côté gauche du passage, comme sur la photographie ; le seuil métallique est inclus.

Le passage est réellement transparent : la sonde de contrôle au pixel **(648, 694)** mesure un alpha nul. Le contour utile au seuil alpha ≥ 32 est **[70, 32, 1139, 1277]**. Aucun pixel du bord n’a un alpha supérieur à 16 ; le maximum mesuré au bord est 1, conservé dans l’original.

L’écran, sa microtypographie, certaines jonctions et les épaisseurs sont interprétés. La photographie en perspective ne fournit pas de métrique complète. Le sprite n’est lié à aucune collision, commande ni traversée ; son ouverture transparente ne crée pas une sortie du jeu.

## Grande porte : pourquoi elle reste à réviser

Le plan de Tony Drew documente **la grande ouverture terminale**, distincte du sas circulaire orange. La photographie **160601** de Leong apporte les surfaces grises et rouges de la porte fermée au fond du décor. Le modèle **Cam001** est une référence de forme complémentaire, dont les matériaux ne doivent pas être pris pour les couleurs définitives.

Le candidat a un contour utile de **1526 × 658 pixels**, soit **2,319:1**. L’objectif d’environ **2,8:1**, estimé par lecture de l’élévation publiée, donne un écart de rapport d’environ **−17,17 %**. Cette comparaison est indicative, sans valeur de mesure architecturale certifiée. La répartition du graphisme rouge est simplifiée en un grand croisement ; les panneaux, poignées et marques de surface demandent aussi une reprise. Le centre du vantail mesure un alpha natif de **253/255** : il paraît fermé, mais cette opacité n’est pas strictement maximale et reste signalée sans correction des pixels.

La première tentative présentait un rapport de **3,675:1** et trop de flèches répétées ; la dernière atteignait **3,413:1**. Ces deux tentatives sont exclues. Le candidat conservé constitue une étape documentaire et **ne satisfait pas le contrat de production de la grande porte**.

## Raccord à la bible et au moteur

Les deux sujets se rapportent au décor `cargo`, à la référence historique `ACOV-211` et aux travaux `ROOM-cargo-1` et `ROOM-cargo-2`. `ROOM-cargo-1` reste partiellement produit ; `ROOM-cargo-2` reste ouvert. La simulation, les **67 liaisons**, **134 seuils** et **630 occurrences de props** restent inchangés. Les **261 contrats de production** de la base restent disponibles ; cette annexe ne transforme pas un élément graphique en nouvelle pièce traversable.

La distribution utilise toujours le manifeste runtime **0.17.0**, avec six cycles et 48 phases. Ni le sas retenu, ni le candidat de porte, ni les prompts n’entrent dans le build. Le contrôle d’admission autorise les chemins source explicitement revus et refuse les autres fichiers dans ces dossiers.

Les trois états intermédiaires de l’iris du Juggernaut restent manquants. Ses états fermé et ouvert historiques gardent leur statut de catalogue, sans animation ajoutée.

## Références primaires inspectées

- **SRC-V018-LEONG-SIDE-SET — Jacinta Leong** : [JAC_9576.JPG](https://images.squarespace-cdn.com/content/v1/5fbb2d7fbbcb4708490b75b1/1606531728804-11IW2NGQOLXZJD3O8XKK/JAC_9576.JPG). Photographie du décor construit ; sas orange au premier plan gauche. Elle ne montre pas une élévation cotée de ce sas.
- **SRC-V018-LEONG-MODEL — Jacinta Leong** : [3-15_Int-Covenant-Terraforming-Bay_3DSMax_Cam001_JL_160516.jpg](https://images.squarespace-cdn.com/content/v1/5fbb2d7fbbcb4708490b75b1/1606522968326-A8GQJLETKUSTLOO0Z0VG/3-15_Int-Covenant-Terraforming-Bay_3DSMax_Cam001_JL_160516.jpg). Modèle de production : géométrie du sas latéral à gauche et porte terminale fermée au fond. Les matériaux gris et jaunes du modèle ne prouvent pas les couleurs finales.
- **SRC-V018-DREW-MAIN-PLAN — Tony Drew** : [img315int-covenant-terraforming-baysht004terraforming-bay-door-opening1-50a0reltd160418-2-copy-2115664.jpg](https://m1.22slides.com/tonydrew/img315int-covenant-terraforming-baysht004terraforming-bay-door-opening1-50a0reltd160418-2-copy-2115664.jpg?f=webp&s=dd80e3b88594a6c495174c5f1dfe5e4d&w=953). Plan de production de la grande ouverture terminale : élévation, plan et sections. La forme générale est documentée ; ce dessin ne prouve ni la surface rouge des vantaux ni le sas circulaire orange.
- **SRC-V018-LEONG-MAIN-SET — Jacinta Leong** : [3-15_Int-Covenant-Terraforming-Bay_160601.jpg](https://images.squarespace-cdn.com/content/v1/5fbb2d7fbbcb4708490b75b1/1606531723757-N2EGGTF4IRHZG312DJR7/3-15_Int-Covenant-Terraforming-Bay_160601.jpg). Photographie du décor aménagé ; porte terminale fermée gris et rouge au fond. Le petit cadrage ne permet pas de certifier tous les verrous, subdivisions et marquages.

Ces images de référence restent liées à leurs auteurs. Leurs octets ne sont pas republiés dans ce lot ; leurs dimensions, liens et SHA-256 sont conservés pour l’identification.

## Livrables et vérification

- [Lecture visuelle avec fonds de contrôle](BIBLE_COVENANT_V018.html).
- [Inventaire courant et annexe structurée](BIBLE_COVENANT_V018.json).
- [Mesures d’alpha](qa/v018/alpha.json) et [suivi des contrôles](SPRITES_V018_STATUS.md).
- [PR 79](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/79), sans fusion.
