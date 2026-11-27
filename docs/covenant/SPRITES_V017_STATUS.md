# Alien: Covenant — production V0.17, sources figées

> **154 PNG conservés, dont 81 admis au rendu et 73 au catalogue.** Le manifeste et les quatre formats de bible sont figés. Les tests locaux documentés ci-dessous ont réussi ; la publication V017, les contrôles navigateur, le pack final et la CI du commit publié restent en attente. Le contrôle général des sources est bloqué localement par le checkout partiel.

## Consolidation et comptes vérifiés

V017 réunit les productions V015 et V016 sans réécrire leurs manifestes, leurs PNG ou leurs documents historiques. Les **103 originaux V011–V014**, les **22 originaux V015** et les **16 originaux V016** constituent une base de **141 PNG**, avec 72 admissions au rendu et 69 images de catalogue. V015 apporte les séries de Ricks et d’Oram ainsi que six équipements ; V016 apporte notamment les cinq poses incomplètes de David.

Le lot V017 ajoute **13 PNG : huit phases d’Upworth et cinq accessoires de monde**. La promotion du rocher de berge V016 ajoute une admission d’un original existant, sans nouvelle image ni nouvelle géométrie.

| Compte du manifeste figé | V017 |
| --- | ---: |
| Originaux cumulés | 154 PNG |
| Nouveaux originaux | 13 PNG : 8 Upworth + 5 monde |
| Images admises au rendu du jeu | 81 |
| Images de catalogue uniquement | 73 |
| Cycles complets admis au rendu | 6 cycles, 48 phases |
| Cycles complets de catalogue | 2 cycles, 16 phases |
| Cycles complets dans les sources | 8 cycles, 64 phases |
| Poses David hors cycle complet | 5 |
| Images d’animation, poses incomplètes comprises | 69 |
| Images certifiées fidèles 1:1 | 0 |

Les comptes se reconstruisent ainsi : **141 + 13 = 154** originaux ; **72 + 8 Upworth + 1 rocher = 81** admissions ; **69 + 5 accessoires − 1 rocher = 73** images de catalogue. Les quatre premières générations des phases Upworth 04, 05, 06 et 08 ont été écartées au profit de leurs corrections. Ces **quatre essais exclus** ne figurent ni parmi les 154 PNG retenus ni dans les cycles ; leurs empreintes et motifs restent documentés dans le manifeste.

## Nouveaux sujets et portée

| Sujet | Images retenues et admission | Limite maintenue |
| --- | --- | --- |
| Upworth aux communications | Huit phases ; cycle rattaché à `upworth-comms` dans `comms` | Marche non armée de cette présence uniquement ; observation navigateur du raccord encore attendue |
| Siège vide de navigation du Juggernaut | Un PNG, catalogue | Modèle de fabrication ; ne remplace pas une estrade native |
| Iris de soute du Juggernaut | Deux PNG, fermé et ouvert, catalogue | Trois états intermédiaires manquent ; ces deux vues statiques ne constituent pas une animation alignée |
| Capsule de colon verticale | Un PNG, catalogue | Les occurrences horizontales actuelles de 200 × 84 restent incompatibles |
| Support articulé supérieur de capsule | Un PNG, catalogue | Composant de fabrication isolé ; capsule et cryovault complets non couverts |

Les cinq images de monde correspondent à **quatre candidats documentaires**, sans admission au jeu. Les treize prompts exacts et les références d’entrée sont conservés dans le [manifeste V017](../../assets/openai/sprites/alien-covenant-v017/manifest.json). Les PNG retenus conservent leurs octets natifs, leurs dimensions, leur alpha, leur SHA256 et leur empreinte Git. Les planches de contrôle sont des dérivées identifiées ; elles ne remplacent aucun original.

Le contrôle local des treize PNG retenus confirme leur décodage RGBA et leur transparence. L’ouverture de l’iris est réellement transparente ; des pixels de faible alpha peuvent subsister autour des silhouettes, selon les mesures documentées. Les huit poses Upworth ont été relues pour l’identité, la tenue, les mains libres, les appuis et l’alternance des membres. Cette inspection d’assets ne vaut pas observation dans le navigateur.

Les modèles de siège, d’iris et de support sont attribués aux documents de [Tony Drew](https://www.tonydrew.com.au/film). La capsule verticale s’appuie sur une image du film publiée par [Unorthodox Design](https://www.unorthodoxdesign.ca/movie-work). La référence de plateau d’Upworth documente le visage, la coiffure, le haut et la ceinture ; les limites héritées pour le bas du corps et la marche reconstruite restent explicites. Référence de production, image du film et adaptation générée gardent des périmètres distincts.

## Bible détaillée disponible

Les quatre formats sont finalisés et épinglés dans la provenance :

- [Bible Markdown](BIBLE_COVENANT_V017.md).
- [Lecture HTML](BIBLE_COVENANT_V017.html).
- [Données JSON](BIBLE_COVENANT_V017.json).
- [Classeur Excel](BIBLE_COVENANT_V017.xlsx).
- [Manifeste des nouveaux originaux](../../assets/openai/sprites/alien-covenant-v017/manifest.json).
- [Provenance et validations V017](PROVENANCE_V017.json).
- [Journal de continuation V017](CONTINUATION_V017.md).

La bible comprend **261 contrats de production**, **315 références**, **67 liaisons**, **134 seuils** et **630 occurrences de props**. Elle couvre personnages, lieux, armes, accessoires, véhicules, vaisseaux, terrains et planètes. Chaque contrat relie apparence, sources, états disponibles, consommateur éventuel, éléments non couverts et prochaine action. Contrats, références et occurrences se recoupent ; ces nombres ne s’additionnent pas en objets uniques ou en PNG à livrer.

## Rendu du jeu et catalogue hors ligne

Les 72 anciennes admissions et les cinq anciens cycles sont préservés. Upworth complète les quatre cycles joueurs et celui de Walter. Son cycle suit le déplacement déjà présent dans la simulation de `upworth-comms` ; le renderer ne crée ni route ni vitesse de simulation. Ses autres apparitions, les états blessés et les actions non fournies restent suivis séparément. L’absence d’une phase conserve le repli procédural du cycle entier.

La seule promotion de terrain concerne `world-planet4-shore-rock` sur `landing-light2`, salle `landing`, position `x=1750`, `z=0.02`, empreinte native `110×65`, non solide. L’admission reste limitée à cette occurrence ; dimensions et collisions demeurent inchangées.

Le pack hors ligne doit réunir les 154 originaux, les manifestes historiques, les quatre bibles et le lecteur documentaire. Ses huit cycles complets doivent distinguer les six cycles admis au jeu et les deux séries de catalogue, Ricks et Oram. Les cinq poses David restent exclues du lecteur de cycles. La distribution du jeu dispose de 81 admissions ; la présence d’une image dans le catalogue ne l’admet pas au rendu. Le pack final et son lecteur attendent encore leur validation.

## Validations acquises et contrôles restants

| Contrôle | État au gel documentaire |
| --- | --- |
| `npm run test:covenant` | **67/67 réussis**, résultat local communiqué par l’intégrateur |
| `npm run check:covenant` | **Réussi**, contrôle local communiqué par l’intégrateur |
| Conservation V017 | **Réussie** : 141 anciens PNG, 6 manifestes, 12 empreintes documentaires, 3 builders historiques ; 72 anciennes admissions et 5 anciens cycles conservés |
| Pilotes natifs guidés par coordonnées | **15/15 réussis**, reçus JSON disponibles ; appels natifs de simulation, sans téléportation ni modification des statistiques |
| `npm run test:dlc` | **48/48 réussis**, dont **32 tests de succession** et 16 autres tests DLC ; aucun test ignoré |
| `npm run check:dlc:avp` | **Réussi** : 30 modules, bundle de 1 115 546 octets |
| Treize nouveaux PNG et prompts | Originaux comparés aux reçus de génération, empreintes et limites conservées |
| Quatre formats de bible | **Finalisés** ; 17 600 cellules du classeur comparées, aucune erreur de formule ; 16 feuilles et 33 vues relues, dont 10 vues actualisées et 23 vues conservées |
| `npm run check` général | **Bloqué localement** : dossier suivi `archives` absent du checkout partiel ; aucun succès global déclaré |
| Build complet et `check:built` | **En attente de CI avec checkout complet** |
| Parcours navigateur du jeu et rendu Upworth | **En attente**, aucun succès V017 revendiqué |
| Catalogue navigateur et ZIP final | **En attente** |
| Publication V017 et CI du commit publié | **En attente** |

Les pilotes natifs sont des parcours automatisés de simulation guidés par coordonnées. Ils ne constituent pas une QA du navigateur. Les futurs parcours au clavier, scènes préparées et échecs PNG injectés doivent conserver leurs périmètres distincts. Les résultats antérieurs restent attachés à leurs révisions ; ils ne remplacent aucun contrôle V017. Aucun garde d’admission n’est élargi pour contourner le checkout partiel.

## Fidélité et historique

**Aucune fidélité visuelle ou filmique 1:1 n’est certifiée.** Production d’une image, admission technique et observation en jeu sont des états distincts. Les formes cachées, variantes et mouvements reconstruits gardent leurs limites. Les manques d’armes et de personnages ne sont pas fermés par ces treize images ; aucune surface canonique d’Origae-6 n’est inventée.

La [PR 79](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/79), publiée précédemment au commit `2539d67020950b5ebcd269413729ec7acec7eb76`, porte la reprise V016. La cible [PR 71](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/71) est consolidée à partir de `6c2d610b7faf9ed88fc6c6977a98411ad1880940`. Les manifestes et originaux V011–V016 restent inchangés, y compris les limites de récupération des prompts V016. Le présent document fige l’état local V017 ; il n’annonce ni publication, ni CI réussie, ni fusion.
