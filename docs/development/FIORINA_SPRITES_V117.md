# Fiorina V117 — Runner, arrivée de Ripley et accessoires documentés

## Livraison et continuité

Cette passe reprend le corpus V116 de la [PR 63](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/63), sur le commit [b0df1877a058f0818f96437fdfdea3f21ba7f415](https://github.com/darknigthmare/aliens-tantalus-frontier/commit/b0df1877a058f0818f96437fdfdea3f21ba7f415) de la branche cumulative. Le répertoire et les API V115 restent les points d’entrée du pack. Aucun nouveau système de sprites ni mixin de gameplay n’est ajouté.

Le [manifeste courant](../../assets/openai/sprites/alien3-fiorina-v115/manifest.json) contient la géométrie utilisée par le moteur. La [provenance V117](FIORINA_SPRITES_V117.json) conserve les prompts exacts, les références effectivement employées, les corrections génératives, les empreintes des sorties acceptées, les repères de géométrie et les éléments non produits. Les **61 PNG historiques et les quatre documents V115/V116** restent identiques par SHA256. L’ancienne mention de V117 dans une conversation ne constituait pas un fichier récupéré : aucune mallette médicale antérieure n’est comptée dans cette livraison.

Tous les PNG livrés conservent les octets de leur dernière sortie imagegen acceptée. Les corrections de verre, de proportions ou de marquage ont elles-mêmes été réalisées par imagegen ; aucun script n’a détouré, recoloré, recadré, redimensionné ou réécrit l’alpha des fichiers de production. Les planches de contrôle composent ces pixels avec le renderer sur Canvas. Les photos, photogrammes et plans externes ne sont pas redistribués dans le pack.

## Inventaire

| Groupe nouveau | PNG | Usage vérifié |
| --- | ---: | --- |
| Runner | 4 | Extension A, contact avant C, poussée arrière D et préparation immobile ; la compression B historique complète l’alias `runner-run`. |
| Ripley, tenue d’arrivée | 6 | Accroupissement, saut, deux poses de marche accroupie et deux poses de grimpe ; sélection native pendant `wreckage`. |
| Ripley, tenue de prison | 1 | Pose d’incapacité `downed` ; garde de présentation limitée au joueur réel. |
| Accessoires autonomes | 5 | Boîte de fusées, seringue et flacon de Clemens, lunettes de Murphy, lampe fixe d’abattoir ; catalogue documentaire. |
| **Nouveaux PNG** | **16** | **21 328 953 octets.** |

Le corpus cumulé comprend **77 PNG distincts**, **91 entrées de manifeste**, **107 occurrences de frames** et **14 animations** : treize boucles à deux images et une boucle du Runner à quatre images. Les PNG totalisent **108 754 508 octets**. Les trois alias nouveaux réutilisent des fichiers ; ils ne constituent pas trois images supplémentaires.

Onze nouveaux PNG ont un emploi dans les raccords natifs de présentation. Les cinq accessoires restent documentaires. L’intégration ne leur invente ni emplacement dans une salle, ni interaction, ni inventaire, ni effet de jeu.

## Animation et ancrage

`runner-run` est ordonné **A extension → C contact avant → B compression → D poussée arrière**, à 8 fps. Les quatre silhouettes sont distinctes. Chaque frame conserve son propre pivot dans le manifeste ; les trois nouvelles phases et la préparation reprennent l’échelle uniforme par pixel de B. La phase A reste au-dessus de la ligne de contact, tandis que C, B et D s’appuient sur cette ligne. Cette présentation donne un cycle de jeu à quatre poses clés ; elle ne prétend pas reproduire la locomotion du film image par image. Un léger écart de proportions du dôme reste visible face au prowl historique ; la boucle conserve son calage cohérent sur run-B.

`runner-windup` est sélectionné par le mode natif de poursuite avant la vitesse. `runner-recover` reste absent et conserve le rendu procédural de secours. Aucune pose d’attente ou de marche n’est renommée pour masquer cette absence.

Les nouveaux alias `ripley-crash-crouch-walk` et `ripley-crash-climb` emploient chacun deux PNG à 5 fps. Le saut et l’accroupissement sont des poses statiques. La taille des têtes est comparée au repos correspondant, avec une échelle uniforme et des appuis mesurés. La pose couchée de prison n’est pas gonflée jusqu’à la hauteur d’une pose debout : son canevas world mesure 89,1038 × 29,7013 avec le pivot [1060, 663].

Les repères anatomiques et les axes inclinés de tête sont des estimations visuelles, avec environ 5 à 10 % d’incertitude selon la pose. Les dimensions `world` décrivent le canevas complet, marges transparentes incluses. Elles ne constituent pas une mesure physique certifiée des accessoires du film. Les images restent intactes ; seuls les paramètres d’affichage les mettent à l’échelle.

## États réellement atteignables

La tenue d’arrivée est sélectionnée tant que la phase reste `wreckage`, avant l’examen de l’EEV. La cour côtière utilise d’abord le mode profondeur V97, qui empêche l’accroupissement. Le joueur peut toutefois franchir le petit obstacle existant par le saut normal et gagner le secteur latéral à partir de x720, tout en conservant `wreckage`. L’accroupissement et la marche accroupie y deviennent réellement sélectionnables. L’échelle existante `f161-e89` est aussi accessible depuis l’approche de l’EEV.

Un test du moteur de production parcourt ces cas par le propriétaire des entrées, les collisions et les échelles réelles. Il n’injecte ni position du joueur ni phase narrative et vérifie que l’enregistreur n’a pas été consulté. L’hôte DOM/RAF demeure un double de test : cette preuve d’atteignabilité est distincte d’un parcours Chromium.

L’examen de l’EEV avance directement vers l’infirmerie et n’établit pas à lui seul un état soutenu `crash-interact`. Aucune pose supplémentaire de ce nom n’est annoncée comme atteinte. Les blessures et l’incapacité en tenue d’arrivée ne sont pas attestées sur le parcours normal côte→EEV par cette passe. Les poses inutilisées des autres détenus ne sont pas fabriquées pour remplir artificiellement le catalogue.

### Incapacité de Ripley

Le sélecteur connaissait déjà `downed`, mais le hook raster refusait tous les acteurs avec `alive:false`. La garde autorise maintenant uniquement l’objet réel `this.player`, demandé sous l’identité `ripley`, lorsque `downed === true`. Les PNJ morts et un autre objet portant artificiellement l’id Ripley restent exclus.

Le sélecteur donne aussi priorité à `downed` sur le flash de blessure : le dégât fatal laisse ce timer actif, et la mission peut cesser d’avancer avant qu’il ne s’éteigne. Le dessin ne change pas la santé, l’incapacité, les collisions, les commandes, la mission ou la sauvegarde. Le test dédié appelle le vrai propriétaire `damagePlayer`, puis vérifie l’affichage et l’immuabilité de cette incapacité. Le roster narratif continue de filtrer les détenus décédés ; aucun personnage n’est remis en vie par l’existence d’un PNG.

## Accessoires et références

| Accessoire | Appui documentaire | Limites conservées |
| --- | --- | --- |
| Boîte de fusées | [Photographie de collection](http://www.alienscollection.com/props.html) et [accessoire screen-used](http://hollywoodrelics.com/?product=alien-3-flare-box-screen-used) | Petit cercle parasite après WEYLAND, absent de DSC08561.jpg, encore présent après deux corrections non retenues ; résultat initial conservé avec cet écart déclaré. |
| Seringue de Clemens | [Photo de production](https://naptownnerd.blogspot.com/2014/08/david-fincher-retrospective-alien-3-1992.html) et [gros plan de carte du film](https://www.ebay.com/itm/336850170602) | Extrémité du piston masquée par la main ; partie cachée reconstruite sobrement. |
| Flacon de Clemens | [Gros plan de la carte du film](https://www.ebay.com/itm/336850170602) | Base, face cachée et remplissage partiellement interprétés ; aucune substance ou marque inventée. |
| Lunettes de Murphy | [Photographies de l’accessoire métallique](http://hollywoodrelics.com/?product=alien-3-metal-welding-goggles-by-terry-english-character-murphy) | Reflet cyan photographique neutralisé ; transparence optique adaptée à la composition du jeu. |
| Lampe fixe d’abattoir | [Plan original de production](https://www.yourprops.com/Abattoir-Lamp-Detail-Blueprint-original-production-material-Alien-3-1992-YP5142.html) | Proportions corrigées à partir de l’élévation ; couleurs, patine, détails cachés et dimensions physiques non établis par le scan. |

La seringue, le flacon et les lunettes ont fait l’objet d’une correction générative de leur transparence. Le verre laisse apparaître le fond clair ou sombre, tandis que les pièces métalliques et le bouchon restent opaques. Les mesures d’alpha et les prompts correspondants sont conservés dans la provenance. La lampe demeure un luminaire suspendu fixe : elle n’est pas assimilée à une torche portative.

La seringue et le flacon documentés séparément ne prouvent ni mallette, ni plateau, ni disposition d’un kit complet. Le socket `medical-kit` reste en secours procédural, de même que celui de l’enregistreur de vol. Les accessoires isolés ne remplacent pas automatiquement ceux qui sont déjà peints dans les sprites corporels.

## Admission et distribution

L’admission ajoute seize chemins exacts, avec leurs tailles, dimensions et SHA256. Les reçus V115 et V116 restent figés. Le manifeste final contrôlé est **`3f6f6f08152bd06fa1f6e84c139b18115cebb9b400e8011997c247c78e06320e`**. Le nom du cache de service worker avance vers V117 pour renouveler le manifeste et le hook de présentation ; les PNG restent chargés à la demande par la politique média existante.

Les trois hôtes partagés modifiés — workflow Fiorina, attente de cache dans `verify-audit-v143.mjs` et `sw.js` — disposent d’une succession V116→V117 explicite. Les empreintes prédécesseures sont imposées ; l’endpoint historique V116 n’est pas réécrit. Le module d’admission ne s’autorise jamais lui-même.

La tâche CI construit le ZIP depuis la liste exacte vérifiée. Il comprend le manifeste courant, les 77 PNG admis et les six documents historiques/courants de provenance. Les documents et outils QA restent exclus du build public du jeu. Aucun rapport ou outil de développement n’est ajouté aux écrans du joueur.

## Vérifications propres à V117

| Contrôle local | Résultat sur le manifeste final |
| --- | --- |
| Renderer et raccords natifs | 21 tests réussis, dont l’atteignabilité par les entrées et le vrai dégât fatal affiché en `downed`. |
| Admission et copie du pack | 7 tests réussis ; 77 PNG et 91 entrées vérifiés par dimensions, octets et empreintes ; copie filtrée du corpus réussie. |
| Intégration Fiorina native | 7 tests réussis, incluant les deux montages, commandes, absence d’armes, sauvegarde/reprise et retour à une campagne ordinaire. |
| Succession des hôtes | 14 tests réussis ; trois successeurs V117 explicites, reçus historiques conservés. |
| Cache ciblé | 6 tests réussis : installation complète du shell, chargement différé des images, interruption réseau, purge et rollback. |
| Pixels complets | 535 contrôles réussis, 91 entrées, 77 sources, 16 partitions et 40 planches clair/sombre. |
| Hooks natifs sur Canvas réel | 322 contrôles réussis, 64 échantillons, 44 entrées de manifeste dessinées par les hooks. Ces entrées peuvent réutiliser plusieurs PNG. |
| Intégrité historique | 61 PNG et quatre documents V115/V116 inchangés ; les 16 nouveaux PNG correspondent aux blobs Git authentifiés. |
| Revue visuelle finale | Calages crash/Runner, transparence des accessoires, alternance de grimpe B et proportions de la lampe acceptés dans le périmètre déclaré. |
| Public release global | `npm run check` arrêté à la première dépendance absente : `ENOENT` sur `archives`, omis du checkout partiel. Les autres prérequis globaux ne sont pas tous évalués ; ce gate n’est pas annoncé réussi. |
| Build, artefact construit et Chromium | Non exécutés localement : dépendances globales hors checkout partiel. Les gates complets restent dans la CI Fiorina. |

Le premier contrôle des pixels de seringue révélait une limite d’échantillonnage : son gabarit `world` 6 × 18 n’occupe que 2 × 11 pixels à l’échelle 1, puis 2 × 1 à 0,6. Le QA conserve ces observations natives et mesure aussi la même fonction de rendu à une résolution d’observation supérieure pour les silhouettes dont un axe mesure moins de 8 pixels. La mesure agrandie donne 45 × 363 → 27 × 217 pixels, soit le rapport 0,6 à 0,8 pixel près. La tolérance reste 3 pixels, sans agrandir la géométrie admise ni retoucher le PNG. La fixture mouvement réduit a également été corrigée pour attendre l’horloge native exposée à 0. Les deux passes complètes ont ensuite réussi.

Les planches Canvas emploient les PNG réellement livrés, leurs alias, leurs pivots et les deux orientations, sur fonds clair et sombre. Le QA natif appelle les hooks du moteur avec des états explicitement déclarés : il contrôle chaque frame de course du Runner, son mouvement réduit, l’anticipation, les états d’arrivée et l’incapacité de Ripley. Il vérifie que le dessin ne change pas le contexte Canvas, les paramètres physiques, la sauvegarde ou le propriétaire d’une opération.

Le court parcours navigateur conservé par la CI vérifie ses étapes historiques V115/V116 ; il n’est pas présenté comme la démonstration naturelle de toutes les nouvelles poses V117. Les preuves locales et les résultats de CI doivent être lus avec le commit et l’empreinte du manifeste qui leur sont associés. Aucune réussite d’une révision antérieure n’est transférée à cette livraison.

## Éléments non produits

| Élément | État exact |
| --- | --- |
| M41A noir autonome | Génération refusée par le service d’image ; aucun PNG accepté. Le fusil porté par le commando n’est pas une arme autonome. |
| Runner `recover` | Génération refusée par le service d’image ; état natif conservé en rendu procédural. |
| Enregistreur de vol | Références insuffisantes pour une géométrie étayée. Une reproduction amateur orange explicitement non canonique a été écartée. |
| Kit médical complet | Aucune référence suffisante de la mallette/du plateau et de son contenu. Les deux accessoires séparés ne ferment pas ce manque. |

Toutes les nouvelles entrées restent **`exact:false`**. La fidélité 1:1 est l’objectif de comparaison, pas une certification obtenue par la génération ou les tests techniques. La copie des poses, les surfaces cachées, les petits marquages et la ressemblance des visages gardent les limites déclarées dans les fiches.
