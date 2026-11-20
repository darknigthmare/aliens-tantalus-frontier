# Prologue et Port-Méridien — art intégré et contrôle du 17 novembre 2026

Base publiée : `d54f13cc55983ddb5f55851071c9144198fe1155`. Cible : [PR #49](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/49), branche `codex/insertion-images-20261116`.

## Résultat et périmètre

Le lot ajoute **onze PNG de jeu, soit 20 246 573 octets**, conservés octet pour octet depuis les sorties du générateur. Dix images sont transparentes ; le panorama nocturne est opaque. Le module `src/prologue-art-v188.js` référence **43 images : onze nouvelles et 32 réemplois inchangés**. Les portraits de locuteurs restent chargés par leur système existant.

Le lot couvre **onze cinématiques, comprenant 35 plans**. Les plans de télémétrie, de titre, de messages et de noms conservent leur rendu natif ; les **31 autres plans** utilisent des images lorsque leurs ressources sont chargées. Les dix-sept autres cinématiques, soit 46 plans, sont comparées séparément à la base. Les 28 définitions de scénario et les 81 plans du catalogue conservent leurs textes, durées, ordre et données. Cette couverture des séquences existantes ne clôt pas les animations, missions et séquences supplémentaires encore proposées dans la bible.

| Cinématique | Plans | Durée conservée | Composition du lot |
| --- | ---: | ---: | --- |
| CIN-00 | 8 | 65 s | Relais, CRT, badge/main, anneau et moyeu, couches spatiales |
| CIN-01 | 2 | 20 s | Réveil, quatre caissons, baie de secours, David, casier ECHO-8, étagère et chariot |
| CIN-P2 | 2 | 16 s | Pas de tir et 37 messages de détresse |
| CIN-02 | 4 | 42 s | Salle, table, équipage et projection native du briefing |
| CIN-03 | 4 | 33 s | Cheyenne, soute et arrivée nocturne à Port-Méridien |
| CIN-P3-WREN | 1 | 7 s | Wren, deux adultes et un enfant au quai |
| CIN-P3-FERRO | 2 | 14 s | Ferro, patient et brancard dans l’infirmerie |
| CIN-20 | 3 | 40 s | Quartiers, débriefing et cinq noms du quai nord |
| CIN-10 | 2 | 30 s | Cheyenne et soute existants |
| CIN-DOYENNE | 6 | 43 s | Sarrazin face à Asha ; quai, infirmerie, processeur et mur nord |
| CIN-20-ROOK | 1 | 10 s | Quartiers et dialogue de Rook |

### Onze nouveaux fichiers

| Images dans `assets/prologue/v188/` | Rôle et référence |
| --- | --- |
| `tomas-wren-standing.png`, `lucia-ferro-standing.png`, `adele-sarrazin-standing.png` | Corps entiers dérivés de leurs trois portraits existants : visages, cheveux, vêtements et palettes conservés |
| `resident-child-standing.png` | Jeune habitant anonyme, proportions d’enfant, hauteur native de 1,30 m |
| `north-quay-patient.png`, `medical-stretcher.png` | Patient et support séparés ; thorax animé, brancard fixe, aucun diagnostic ajouté |
| `port-meridien-night-approach.png` | Variante nocturne de l’architecture du panorama d’épilogue ; pluie et huit balises dessinées par le jeu |
| `relay-access-badge.png`, `relay-reaching-hand.png` | Badge anonyme, trois lignes illisibles et main séparée pour la course native |
| `cryo-supply-shelf.png`, `cryo-service-trolley.png` | Six sachets en deux rangées de trois ; chariot vide à deux plateaux et quatre roulettes, matière dérivée du casier ECHO-8 |

Les [prompts complets, références, dimensions, alpha et empreintes](PROLOGUE_ART_PROVENANCE_20261117.json) identifient chaque sortie retenue. Les onze sorties sont retenues ; aucun fichier n’est recoloré, redimensionné ou réencodé dans le dépôt. Les prélèvements et changements d’échelle s’effectuent seulement au rendu. Les références de cette génération sont des images originales du projet ; aucune nouvelle référence externe de franchise n’est présentée comme ayant été vérifiée.

## Composition et corrections visuelles

Les corps sont prélevés dans des fenêtres mesurées et mis à l’échelle uniformément depuis leurs pivots de pieds. Wren, Ferro et Sarrazin correspondent aux hauteurs natives de 1,80 m, 1,70 m et 1,62 m. Le troisième résident dispose de son propre corps d’enfant. Sarrazin est retournée vers Asha ; les faces et proportions ne sont pas obtenues en étirant un buste.

Le réveil conserve la capsule **03 ouverte** à l’arrière, puis **01, 02 et 04 fermées** au premier plan. David reste à gauche de 03 et le casier à l’ouest. La porte de sauvetage comporte deux silhouettes verticales déjà présentes dans le décor natif : elles sont distinctes des quatre caissons horizontaux. Le fond retenu n’ajoute pas les cinq caissons peints du fond cryo écarté. Le scellé croisé ECHO-8, sa plaque et les libellés de capsules restent natifs.

Dans le plan rapproché du casier, l’étagère conserve son montage à **1,3 m** du pont et son gabarit de **0,9 × 0,8 m**. Les six sachets sont réellement visibles. Le chariot reste dans son enveloppe de **0,8 × 0,9 m**, avec ses roues avant au niveau du sol. Son rapport d’image n’est pas déformé pour remplir le cadre. Le chariot de quarantaine renversé, présent ailleurs dans le projet, n’est pas réutilisé pour cet accessoire intact.

Le **matelas** du brancard mesure 1 733 pixels dans la source et 360 pixels dans la scène, soit les 2 m du gabarit natif. Les poignées débordent de cette mesure. Le bord arrière est à environ 150,61 pixels au-dessus du sol ; les roues restent au niveau 560. Les contacts de tête, talons et main tiennent compte de la profondeur visible du matelas : leurs écarts sont inférieurs à un pixel après la caméra dans les variantes mesurées. Seul le thorax suit `sin(time * 2.2) * 2` ; la tête, les jambes, la main et le brancard restent fixes. Le mouvement réduit arrête la respiration. Le fond médical retenu est une salle vide ; l’image de dépistage qui aurait introduit un diagnostic absent du dialogue est écartée.

Le badge reste fixe. La main apparaît après **45 %** du plan et conserve la course de **620 pixels**. Les doigts rejoignent la carte et la coupe de manche reste hors champ. Le panorama nocturne réutilise les formes du port existant ; les huit balises alternent à leur cadence native sur le bord mesuré de la piste. La pluie, le gyrophare du relais, la projection de Cocyte et le voyant de quarantaine restent animés par Canvas.

Deux défauts de cadrage préexistants sont corrigés : les messages **#01 et #20** étaient entièrement sous la bande noire supérieure et le nom **COCYTE** dépassait lui aussi du cadre visible. Seules leurs coordonnées changent. Les **37 messages**, leur ordre, leurs âges, les cinq noms, les horaires **18:41 / 18:42 / 18:54** et les seuils d’apparition restent inchangés.

La revue visuelle a également corrigé les deux plans orbitaux de CIN-00 : le prélèvement du nouveau plan de station coupait le disque de Cocyte par une ligne droite, et le plan suivant aplatissait déjà la source carrée dans un rectangle de 900 × 520 pixels. Les deux utilisent maintenant la source entière avec une échelle uniforme. Les largeurs de projection restent 980 et 900 pixels. Le centre du globe dans le plan de station et le coin supérieur gauche de son placement dans le plan Tantalus sont conservés ; la position et la trajectoire du vaisseau restent inchangées. La sortie du globe au bord du cadre reste une composition de caméra, sans coupe rectangulaire interne ni ellipse artificielle.

## Chargement, replis et distribution

Le lecteur ne prépare que les ressources de la cinématique choisie et ses portraits. Il partage les images en cours de chargement, réessaie les images en erreur à l’entrée ou au rejeu et réutilise les succès. Le dessin ne demande aucune nouvelle image. Une arrivée tardive repeint à l’horloge courante ; elle ne fait pas avancer la narration. La fermeture, le saut, le remplacement et les anciens callbacks RAF ne peuvent pas réactiver une séquence terminée.

L’absence d’un fond conserve le décor natif ; l’absence d’un acteur ou accessoire conserve sa branche native. Le retour aux formes d’origine reste disponible pendant le chargement et après une erreur. Le contexte narratif et la sauvegarde ne sont pas modifiés par le renderer.

Le worker source utilise `atf-v143-prologue-art-20261117`. Le nouveau module porte le shell à **725 entrées uniques**. Les onze PNG sont admis sur **onze chemins exacts**, chargés à la demande puis réutilisables après interruption réseau ; ils ne sont pas précachés à l’installation. La limite de 256 entrées runtime et les refus de requêtes privées, de chemins voisins et de réponses invalides sont conservés.

Les quatre fichiers `PROLOGUE_ART_*_20261117` sont admis précisément comme documents de développement et exclus du build public. La release complète, le build et l’intégrité des fichiers distribués seront attestés séparément sur le SHA exact de publication dans la PR #49.

## Validation acquise sur le gel artistique

| Contrôle | Résultat |
| --- | --- |
| Cinématiques et cohérence, deux suites existantes | **39/39**, aucun échec ni saut |
| Audit du worker et cycle de vie des sauvegardes | **132/132**, aucun échec ni saut |
| Pilotes de campagne, Broodstorm et Cocon, trois suites ciblées | **68/68**, dont six nouveaux tests |
| Rendus des 35 plans | **70 vues FR/EN avec art et 70 replis** |
| Contributions des nouvelles images | **11/11** ont une contribution raster visible mesurée |
| Textes de premier plan | **109 706 pixels de cœur de glyphes** contrôlés sans masquage |
| Scénarios | **28 définitions identiques** à la base |
| Continuité des 17 autres CIN / 46 plans | **46 comparaisons raster identiques et 184 traces Canvas identiques** |
| Sources et images pendant la revue | Empreintes avant/après identiques |
| Erreurs du reçu indépendant | **0** |

Le [reçu indépendant](PROLOGUE_ART_RENDER_RECEIPT_20261117.json) conserve aussi **52 observations de transformation** : 20 prélèvements de portraits non uniformes strictement hérités du rendu existant et 32 bandes de respiration dont le mouvement est borné à 2 pixels. Ce ne sont pas 52 nouveaux défauts ni un résultat « zéro avertissement ». Les nouveaux corps et accessoires statiques ainsi que les deux globes orbitaux sont contrôlés avec une transformation uniforme.

Les captures utilisent `drawCinematicFrameV188` de production sous `@napi-rs/canvas`, les vrais PNG/WebP et quatre polices DejaVu déclarées par leurs empreintes. L’hôte expose un `currentSrc` en forme d’URL pour satisfaire le contrôle d’identité du système existant de portraits coloniaux. Les tests de contribution remplacent une seule image par une surface transparente de même dimension ; les branches et la géométrie restent identiques. Les doubles de chargement, DOM, horloge et RAF sont déclarés. Une première passe native interrompue avant son reçu est remplacée par la passe complète avec libération des surfaces entre échantillons.

Ces preuves contrôlent le rendu et les contrats concernés. Elles ne constituent pas un nouveau parcours local Chromium, une validation CSS mobile ou une mesure de performances du navigateur. La [planche des 35 plans](PROLOGUE_ART_OVERVIEW_20261117.png) accompagne les mesures ; elle ne remplace pas un parcours jouable.

## Suivi de la CI précédente et pilotes corrigés

La CI consultée le **17 novembre 2026 à 13 h 51, heure de Paris**, concerne la tête publiée `d54f13cc55983ddb5f55851071c9144198fe1155` et son merge de test `8fe9ee84dd46894fb47a25507f31d7aca01327de`.

| Workflow de la base | Résultat observé |
| --- | --- |
| [Gameplay V162](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/44079768141) | Réussi |
| [Frontier Forge](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/44079768101) | Réussi |
| [Alien_base](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/44079768119) | Réussi |
| [Full release](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/44079768214) | Échec de pilotes navigateur ; Node et build réussis |
| [Excel V163](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/44079768000) | Treize jobs réussis et deux en échec |
| [Vercel](https://vercel.com/darknigthmares-projects/aliens-tantalus-frontier/21LMJ9ju9GgZfQ8yReuEDoypvXPu) | Statut GitHub `success` |

Le **retour APC est désormais confirmé dans le vrai parcours Chromium de cette CI** : victoire native, **21 victimes / 1 310 crédits**, coque restante 340, mission complète et opération courante nulle. Le prélude V161 contient 19 contrôles et 16 captures ; l’historique V162 contient 17 contrôles et cinq captures. Aucun second paiement, aucune erreur de page ou de réseau n’est observé. Cette preuve du commit précédent est distincte des rendus locaux du présent lot.

Trois pilotes sont corrigés dans cette continuation, avec six régressions rouges avant correction puis vertes :

1. **Campagne V160.** Après une victoire déjà valide, le bouton de retour était couvert par la cinématique d’extraction. Le pilote vérifie l’opération, utilise son bouton public « Passer », attend sa fermeture puis revient à bord dans le même budget de 30 secondes. Les reçus, archives et ressources restent vérifiés.
2. **Broodstorm.** La reprise du projectile était valide, mais la pause n’avait pas été acquise. Le pilote observe l’état réel, restaure et vérifie le focus du canvas, puis constate chaque pression de P ; trois tentatives au maximum, aucune bascule si déjà pausé. Les assertions de projectile, trajectoire, charges et nids sont conservées. La régression emploie une course de focus explicitement déclarée ; le rapport CI initial ne permet pas d’affirmer que cette course était sa cause exacte.
3. **Cocon noir.** Le terminal avait commencé sa sauvegarde alors que le pilote restait pausé. Le terminal Horreur exige trois secondes de temps actif. Le pilote observe le compte à rebours, reprend par P sans E, attend un commit plus récent de la même opération et coupe partielle, puis remet la pause. Santé, munitions, réserve, apparence et reprise exacte restent contrôlées. La reproduction native donne zéro reçu après 45 secondes pausées et un seul reçu après 3,2 secondes actives.

Ces régressions utilisent les véritables lecteurs, moteurs et `SaveSystem` avec leurs hôtes déclarés ; elles ne sont pas présentées comme une nouvelle exécution Chromium. Les correctifs de pilotes ne modifient aucun runtime ni `src/save.js`.

Deux échecs de la base restent ouverts : l’interaction E avec un PNJ Forge après reprise et l’entrée du premier menu mobile par Entrée. Les ressources et états prêts sont observés, mais les anciens rapports n’enregistrent pas le routage de la touche. Les deux pilotes ajoutent donc une observation passive et bornée à **64 entrées par interaction**, collectée même en cas de timeout : capture/bulle, cible, focus, clé/code, `defaultPrevented` et état natif. Touches, délais et assertions sont inchangés ; aucun essai automatique supplémentaire n’est ajouté. La prochaine CI doit fournir cette observation avant toute correction de comportement.

## Limites de fidélité et suite

Les trois habitants nommés, Port-Méridien et les accessoires de ce lot sont des créations du projet. La revue vérifie leur continuité d’identité, leurs quantités, leurs dimensions et leurs contacts dans le renderer. Elle ne certifie pas une reproduction canonique ou pixel pour pixel « 1:1 ». Les références de franchise des réemplois restent celles des lots antérieurs ; leurs octets sont inchangés.

Les calques spatiaux, projections, textes, compteurs, légendes et effets restent volontairement natifs. Le catalogue existant de 28 CIN est maintenant couvert par les lots d’intégration artistique documentés ; cette phrase ne signifie ni suppression de toutes les primitives, ni animation complète de tous les personnages, ni achèvement du gameplay de la bible. La course APC dédiée, le pont physique, la poursuite de la Reine et les autres contenus encore proposés conservent leur statut distinct.
