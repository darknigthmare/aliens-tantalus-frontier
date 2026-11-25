# Gardes de la Reine-Mère — présentation animée et vérification

17 novembre 2026. Succession du commit Q `c1d4c636347275d2d3a6ecbc15ebfcfeadfb035c`. Ce rapport concerne les gardes du chapitre existant « Le chant de la Reine-Mère ». Il ne certifie ni un casting canonique complet, ni l'achèvement de l'arc étendu de TR-0.

## Résultat et source retenue

Les six gardes initiaux et les douze renforts possibles utilisent l'atlas praetorian normalisé déjà présent dans le dépôt : **1024 × 1024 RGBA, seize cellules de 256 × 256, 540 822 octets**. Son SHA-256 reste `f4c778139b8018952bbd5c27c2fbd57449310b6ef973803750173e8ba769ecda`. Aucun nouveau PNG de jeu n'est généré, aucun pixel de cette ressource n'est retouché et aucun autre asset n'est modifié par le lot.

Le choix est une adaptation déclarée du rôle `guard`. La bible relie les Praetorians à la lignée Mère / Red Hive et à une fonction de garde royale ; les descripteurs du chapitre ne leur attribuent pourtant aucune caste. Cette absence est conservée. Le profil du catalogue, sa taille de 159 pixels, son événement de frappe et ses paramètres de combat ne sont pas importés. Le Royal Guard attribué à Capcom, Siege Royal et les variantes King/Rogue/Red inspectées ne sont pas fusionnés pour produire une identité nouvelle.

Les trois Chœurs conservent leur présentation vectorielle. La dette `complete-royal-cast`, les rencontres étendues, les lieux et les cinématiques de l'arc restent ouverts. L'art adulte Q demeure intact. Les notices FR et EN indiquent désormais que l'adulte et les gardes sont illustrés, et que les Chœurs restent provisoires.

Preuves : [provenance et inventaire](QUEEN_MOTHER_GUARD_ART_PROVENANCE_20261117.json), [planche intégrée](QUEEN_MOTHER_GUARD_ART_OVERVIEW_20261117.png), [reçu de rendu et validation](QUEEN_MOTHER_GUARD_ART_RENDER_RECEIPT_20261117.json). Les noms de captures et de harness conservés dans le reçu désignent les preuves de développement ; ils ne sont pas des assets supplémentaires du jeu.

## Calibration et lecture de l'atlas

L'inspection préalable porte sur douze images existantes et seize sources documentaires. Les seize cellules du PNG retenu ont des pixels distincts, un profil orienté à droite et une marge transparente minimale de seize pixels. Les mesures d'alpha ne servent pas à certifier l'anatomie. Le liseré cyan/magenta de cette ressource historique reste visible ; aucune amélioration de son détourage n'est revendiquée.

La calibration emploie une échelle commune **70/161**, soit 0,4347826 pixel de monde par pixel source. La cellule entière mesure donc environ 111,30 × 111,30 pixels au dessin. La physique reste **58 × 70** : la queue et le bras projeté peuvent la dépasser, sans agrandir collision ou portée. La hauteur repliée de la mort n'est pas étirée pour remplir le rectangle physique.

| Cellules | Usage dans ce raccord | Sélection et cadence |
| --- | --- | --- |
| 0–3 | Repos | Horloge native, 4 images/s ; cellule 0 en mouvement réduit |
| 4–7 | Déplacement | Distance horizontale acceptée, une cellule par 7,2 pixels ; cellule 4 en mouvement réduit |
| 8 | Anticipation | `windup > 0`, seuil de frappe natif inchangé à 0,48 s |
| 9 | Contact accepté | Retour fini et strictement positif du vrai `damagePlayer`, première tranche de 0,1 s |
| 10–11 | Récupération | Deux tranches suivantes de 0,1 s du marqueur privé |
| 12–15 | Mort | Horloge native de 1,2 s, progression à 7 images/s, dernière cellule maintenue jusqu'à disparition |

Les pivots X des cellules 0 à 15 sont `149, 146, 148, 148, 145, 159, 164, 166, 143, 114, 115, 145, 134, 129, 126, 119`, avec Y240 dans les seize cas. Ils projettent horizontalement un repère manuel du bassin sur la ligne d'appui. La hauteur du bassin reste celle de la pose peinte : flexion, déséquilibre et effondrement sont préservés. Les pieds levés de la cellule 12 n'ajoutent aucun saut de gameplay ; son appui inférieur vient de la queue.

La lecture manuelle comporte une incertitude indicative de ±5 à ±8 pixels source, soit ±2,17 à ±3,48 pixels rendus. Le pivot unique testé produisait un écart horizontal de −15,22 à +7,39 pixels sur les points relevés. Leur alignement avec les pivots par pose est construit mathématiquement et ne prouve pas, à lui seul, une fluidité temporelle.

La preuve statique comporte **32 compositions et douze comparateurs**. Elle ne fait pas appel au moteur : ses repères de sol, nom, barre et ellipse reproduisent les formules natives. Les corps ne recouvrent pas la barre, leur appui reste à la frontière du sol et la pose couchée conserve sa faible hauteur. Le premier montage tronquait la fin de quelques libellés ; la V2 corrige seulement la disposition des panneaux. Les PNG source et les pivots restent identiques. La calibration conserve son statut initial d'attente dans son reçu historique ; le reçu root séparé `57e3e7d1250487fc5e73b440a64e78e114caf974436381bb8c9f2729e2686215` l'accepte ensuite pour intégration native.

## Propriétaires natifs et intégration

Le helper exige l'opération courante, le rôle `guard`, l'objet réellement présent dans `enemies`, sa correspondance avec `ecosystemActorV131(id)` et son descripteur enregistré sans caste. Les vagues exigent aussi leur entrée dans le journal natif. Les objets détachés après reprise, les homonymes des autres écosystèmes, les trois cibles Chœurs et le boss adulte restent exclus.

La présentation conserve les **105 points de santé**, la **vitesse de 72**, les **14 dégâts de contact**, la boîte 58 × 70, les deux sols 355/570 et les règles d'apparition. Les trois passages de phase du boss et les trois vagues de défense des balises produisent leurs renforts à travers leurs propriétaires existants. Aucun événement de combat n'est créé par les images.

Le moteur déplace ces gardes en modifiant directement `x` ; `vx` ne décrit donc pas leur marche. En outre, une couche extérieure peut rétablir la position pendant la grâce d'insertion. Un petit observateur dans le `GameEngine` final capture la position avant l'appel complet à `super.updateEnemy`, puis lit le déplacement après son retour. L'ordre des mixins et leur valeur de retour sont conservés. Une tentative retenue, un mur, un étage incompatible ou un étourdissement ne suffisent pas à animer une marche. Un grand déplacement injecté est rejeté comme distance de locomotion.

L'image d'impact est marquée après le retour du vrai `damagePlayer`. Un reset de cooldown ou l'achèvement du windup ne la déclenche pas à lui seul. Les retours zéro, absents, négatifs ou non numériques sont refusés. L'âge privé avance immédiatement après l'horloge native de l'acteur, avant les sorties précoces de l'IA ; il expire même sans dessin. Une horloge modulo 60 ne recrée pas une frappe ancienne. Les observateurs de marche et de contact sont des `WeakMap` : aucun champ supplémentaire n'est sérialisé et aucune horloge indépendante n'est démarrée.

Le chargement appartient à l'entrée et à la reprise réussie. Une source absente, en cours, échouée, de mauvaises dimensions ou étrangère conserve tout le corps vectoriel natif. La disponibilité de l'atlas garde est indépendante de celle des trois sources de l'adulte. Les callbacks périmés ne remplacent pas la source courante et ne modifient pas l'état du jeu. Le dessin ne déclenche aucun téléchargement.

Le rendu du corps est inversé dans le contexte Canvas ; le nom et la barre restent dans leur passage natif, non inversés. L'ellipse jaune d'anticipation reste au-dessus du corps et les sept pointes propres au boss adulte ne sont pas ajoutées au garde. La mort garde l'alpha natif 0,3, la durée de 1,2 seconde et, si présent dans l'état natif, l'avertissement résiduel. L'atlas n'offre aucune rangée distincte de blessure : les effets de dommage existants restent responsables de ce signal. Les bornes élargies servent exclusivement à la visibilité et conservent l'ordre des acteurs ainsi que les filtres de dormance et de cadavre expiré.

## Tests du moteur et contrôles négatifs

Le premier passage dédié réussit **17/17**. Le groupe réunissant le vérificateur garde, l'écosystème V131, l'adulte Q et Broodstorm réussit **56/56, zéro échec, zéro ignoré**. Les dix-sept cas dédiés sont compris dans ce total, sans double comptage. Aucune correction de production n'a été nécessaire après le premier passage. Le groupe utilise le vrai `GameEngine` et la mission écrite ; DOM, RAF et Image sont des hôtes de test déclarés, et Canvas enregistre les commandes sans les rasteriser.

| Contrôle négatif | Défaut introduit en mémoire | Assertion qui le détecte |
| --- | --- | --- |
| Marche issue de l'alerte | L'état `alert` peut suffire à choisir la marche | L'acteur retenu par la vraie grâce d'insertion doit rester au repos |
| Contact zéro admis | Suppression de la garde sur le retour de dommage | Une cadence acceptée mais retenue par la protection ne doit pas produire d'impact |
| Expiration débranchée | Suppression du raccord d'avance du marqueur | La pose doit progresser et expirer au rythme des vraies updates, y compris à travers les sorties précoces |

Les **trois mutations causales sont détectées par les assertions attendues**, dans des processus isolés et sans écrire dans les sources du dépôt. Elles constituent des contrôles négatifs, pas trois tests positifs supplémentaires. Les premières tentatives ont échoué dans le chargeur ESM avant les assertions, puis une erreur de nom de fichier a été corrigée dans le runner scratch. Ces erreurs techniques restent enregistrées et ne sont pas comptées comme des détections. La version corrigée transforme de manière idempotente les octets gelés lus sur disque.

Les fixtures de présentation fixent explicitement horloges, santé, orientation et windup pour étudier les appels de dessin. Les séquences causales font expirer la grâce par 4,05 secondes natives, utilisent le vrai retour de dommage et produisent les vagues par phases et balises. La défense conserve un Marine à santé élevée pour laisser vivre les attaques durant l'observation ; aucun producteur de vague n'est remplacé. Les tests de contact négatifs remplacent délibérément le retour de dommage et sont distingués du chemin positif réel.

Reçu de validation : `5a5ed468d461dc885967dc0529e928f32b71ad8f4d32224c0e106e7b6dbb9890`. Gel : `7d59f02ce9a6fcba9ad3144e03ee101f76d491bcd182df1339f1f8dd356f2177`. Log du groupe : `eb42b1b472bec97c996351b3f57c816a1e3b63d9bee3281a604cd145d1fa4c35`. Reçu des mutations V2 : `e7d712c9b052cc835c4fce5f6244acb896cea99156ed590c6e2872e0d8a43f86`.

## Rendu natif

L'essai final appelle le **vrai `GameEngine`, `drawEnemy`, le dessin du monde et le HUD**, avec les modules de la mission et le PNG décodé par `@napi-rs/canvas`. Les hôtes DOM/RAF/Image et les polices DejaVu sont déclarés. La fixture héritée désactive escouade/coop et retire les hazards ; les acteurs écrits et leurs gabarits restent ceux du chapitre. Aucun remplacement du rendu de production ni édition de pixels n'est employé.

Le résultat comprend **76 PNG candidates, huit comparateurs Q et 86 observations candidates**, sans échec. Les dix observations supplémentaires rendent et mesurent des instances sans sauvegarder un PNG de plus. Les deux grilles de revue et la planche assemblent des captures existantes ; elles ne sont pas comptées comme des poses supplémentaires.

| Couverture | Résultat et portée |
| --- | --- |
| Seize cellules, deux directions | 32 captures de poses imposées. Horloges/champs et stimuli publics de présentation sont explicitement fixés ; ces images vérifient les pixels et ne prouvent pas une frappe ou une marche réelle. |
| Six gardes et douze renforts | Dix-huit propriétaires admis et dessinés, huit PNG représentatifs, dix autres observations de rendu. Aucun profil de caste ajouté. |
| Géométrie du dessin | 68 dessins isolés audités : cellules complètes de 256², échelle commune 70/161, projection du pivot conforme à la construction et marge minimale de trois pixels avec la barre de santé. Aucun pixel d'art à alpha ≥16 au-delà d'une ligne raster sous l'appui ; cette tolérance distingue les positions sous-pixel natives du prototype statique entier. |
| Replis et exclusions | Douze comparaisons au parent Q conformes. Seules les deux comparaisons de HUD ignorent la dernière ligne de notice intentionnellement modifiée ; adulte, Chœur, autres écosystèmes et corps de repli conservent leurs comparateurs stricts. |
| Déplacement et blocages | Une séquence native produit les cellules 4 → 5 → 6 → 7 à partir de déplacements acceptés de 3,6 / 3,6 / 7,2 / 7,2 pixels. Grâce, mur, autre étage et étourdissement sont observés séparément. |
| Contact et reprise | Le vrai appel demande 14 dégâts et retourne environ 6,3 points de santé après l'armure de la fixture ; le contact retenu par la grâce retourne zéro. Anticipation, impact et récupération sont observés à part des poses forcées. Une seconde frappe réellement acceptée permet de sauver pendant l'impact ; la reprise conserve exactement `[x,y,w,h]` et ne rejoue pas ce marqueur. |
| Mort visible | Appel réel de `defeatEnemy`, puis mises à jour complètes : cellules 12, 13, 14, 15, dernière pose conservée et disparition. Le timer n'est pas écrasé. Trois captures du monde à 0 / 0,3 / 1,25 s montrent respectivement le corps initial, l'effondrement et l'absence de son propre appel de dessin. |
| Visibilité | Quatre sondes de bord de caméra, puis vérifications loin du champ, dormant et mort expiré. Ces placements de caméra synthétiques sont distincts des scènes dont la caméra suit naturellement le joueur. |

Les vagues de phases 2/3/4 sont créées par les seuils du boss. Pour les vagues de balises de la matrice raster, les drapeaux de balise et les horloges juste avant 7/14/21 secondes sont des fixtures déclarées ; l'update native traverse ensuite chaque seuil et crée les deux acteurs. Cette preuve ne revendique pas une interaction aux balises ou un parcours complet de défense de 22 secondes. La suite de code, décrite plus haut, traite séparément le déroulement temporel complet. Le mouvement réduit appartient également aux tests de code ; aucune matrice raster dédiée n'est annoncée ici.

Les sources observées restent stables : **22 empreintes de modules, hôtes et vérificateurs, ainsi que quatre PNG**, sont identiques avant/après. Les sept fichiers du gel runtime sont également contrôlés avant les captures. Le parent comparateur reste Q exact et propre. Le reçu natif final a pour SHA `df51e71a4fa920d69f7c5aae4724bacc17d517dbc44d4f3dac0f990b1368d7c4`, son gel `b44397c0a1f267c14f6d09da082d32b06a2cd48161ce6099c0f89ed58664df75`, et la planche publiée intacte `bf16cd49087dbeb6d34fb16c28b584599abdd484ab452dede498c863d7bfa93b`.

La revue root a ouvert les deux grilles, la planche, le contact et l'anticipation natifs, la scène de poursuite et les trois morts visibles. Elle accepte le placement et les miroirs avec les limites conservées : frange cyan/magenta, petits détails denses, ellipse qui recouvre partiellement le torse, cadavre sombre à alpha 0,3 et butin/particules qui masquent une partie du corps dans le monde. La pose 15 isolée permet d'en lire la silhouette. Aucune correction de gameplay ou de PNG n'est demandée.

L'essai 01 s'était arrêté avec le code système 137 après huit comparateurs et deux vues de grâce. Ses dix PNG et scripts restent conservés, hors des comptes de réussite ; ce code ne démontre pas à lui seul une cause mémoire. Le pilote libère ensuite les caches de décodage des hôtes terminés et utilise le ramasse-miettes explicite, tandis qu'un ancien checkout de vérification reproductible est retiré après archivage de ses preuves. L'essai 02 réussit avec les mêmes sources runtime et le même atlas. Cette correction du dispositif ne constitue pas une optimisation mesurée du jeu.

## Registre, distribution et livraison

Les quatre suites du registre et de ses consommateurs réussissent **51/51**, zéro échec et zéro ignoré. La transition R → Q est une projection identité : le fichier `special-operations-v131.js` garde le SHA `433ddc7b821c98b973c10fc9e3aa39bc66c77e8cf9364dd9f1a25d03b70b08af` et toutes ses déclarations restent exactes. Les trois changements cumulés du registre sont toujours ceux de Cargo, Broodstorm et de l'adulte Q ; les gardes ne sont pas comptés comme une quatrième modification et ne referment pas `complete-royal-cast`.

La succession lie douze fichiers ordinaires à leur prédécesseur Q et ajoute deux nouvelles sources, le helper et son vérificateur. Un seul ajout historique reçoit un successeur : le test de l'adulte Q, dont seul le littéral de notice suit le nouveau texte FR. Un contrôle des autres octets interdit de réécrire ses assertions, et les contrôles négatifs refusent faux prédécesseurs, doublons, naissance de source déguisée ou exception étendue au helper adulte. Les blocs et tests historiques sont préservés.

Le reçu des quatre suites a pour SHA `dbdba8ab487a925d099b5a224633b57a09f42e1cbb0a8e849e4f6bad4c87b126`, et leur log `08307bb5e7811851e5c55e047e91e5eeb8e1b793ca4b1f84c81dd420fbef5335`. Les vingt fichiers surveillés, HEAD, arbre, branche, index et références restent identiques avant/après cette exécution. Ces suites ciblées ne sont pas présentées comme une release complète.

La suite de distribution passe **77/77**, zéro échec et zéro ignoré. Le contrôle source `npm run check` réussit sur **3 564 fichiers et 1 601 assets**, sans document privé. Le helper supplémentaire porte le shell à **732 entrées** ; l'atlas historique conserve sa politique de chargement à la demande, sans ajout de PNG au précache. Les quatre preuves et le vérificateur dédié sont admis uniquement dans les sources de développement, hors du build public. Le schéma de sauvegarde reste 52.

Cette passe ciblée se termine le 17 novembre 2026 à 21:33:47 UTC sur le candidat non committé, après les contrôles natifs et de registre. Les douze empreintes de code/distribution observées avant et après sont identiques. Son reçu a pour SHA-256 `43d910e75575fe6b30169855ae862aa717415c71c25a42aff23e3b5c1bfe5364`, le TAP `170d6a7bffc4fd0a111ba97affbf420a4eb2c799d943b26756410957ee9d8122`, et le log du contrôle source `c25d9bedada1dffa9e8f5b71d93ee28d3ae6a054160d19da21c599f089d99680`. Les derniers paragraphes de rapport et de tâches sont complétés ensuite à partir de ces résultats ; aucune source gelée n'est réécrite.

Le candidat est encore fondé sur Q pendant les captures. Leur attribution repose sur les empreintes des sources et du PNG effectivement lus avant et après, puis sur leur concordance avec les fichiers commités. Les contrôles complets `test:all`, `check`, `build`, `check:built`, la comparaison de livraison et la publication sont attribués séparément au commit exact dans la PR #49. Une commande déclarée ou une preuve statique ne vaut pas résultat de release.

## Limites conservées

La présentation à 70 pixels réemploie un atlas existant et sa frange colorée. Les détails anatomiques serrés, la faible lisibilité d'un cadavre à alpha 0,3 et l'occultation partielle par l'ellipse native ne sont pas dissimulés par une nouvelle couleur ou une physique élargie. La calibration n'est pas une mesure de taille canonique et les poses choisies pour les comparaisons ne deviennent pas des parcours joués.

Aucun parcours local Chromium n'est revendiqué. Les rendus Canvas natifs et les tests de logique sont distingués d'une session navigateur. Ce lot n'ajoute ni caste, ni attaque, ni Chœur illustré, ni chapitre étendu, et ne ferme aucune dette du registre. `complete-royal-cast` reste ouvert ; le registre demeure à 21 opérations jouables, 19 partielles et deux effectives, avec `canonExact: false`.
