# Consolidation des PR — 4 novembre 2026

## Périmètre

Cette intégration reprend les huit PR ouvertes de `darknigthmare/aliens-tantalus-frontier` et le `main` observé au commit `fbaa8ec4b2f3248bd1fd0206cc709641657b66db`. Les merges locaux conservent les huit têtes comme ancêtres. La publication et les résultats de validation du nouvel assemblage doivent être constatés séparément.

| PR | Tête reprise | Apport conservé |
| --- | --- | --- |
| #30 | `59565c39b1636461326c851dcb3b83f807bbc2b0` | Snapshot public et CSV de références ; contenu intégral conservé dans l'archive documentaire revue. |
| #31 | `13bfd54893337ed485895d5f029f7c5846cda4f3` | Identités et 1 217 correspondances historiques conservées dans le snapshot documentaire. |
| #32 | `691dce04217565f017d51b14b440fb3f3b178b71` | Import/export et consultation documentaire, avec les corrections de contrat apportées par #36. |
| #33 | `8996fca229d2f27991262c685e87e21283a51921` | Registre de 88 fiches, 22 sources et 15 correspondances proposées conservé hors du client. |
| #34 | `b9886eccb7ea7fa9ea3c29230240965f54eea015` | Observation Trials et parcours physiques Inez/Jun, dont les témoins historiques restent distincts. |
| #35 | `0ef85cc54b90d0196bdd6f6d0909de694e74c19c` | Correction syntaxique du codex, déjà présente dans la façade revue #36. |
| #36 | `e4ea86d54602e9ea08b169d4053a86565548386f` | Façade documentaire commune, contrats d'import/export, consultation des sources et accès physique Durandal. |
| #37 | `01c764a61e6ce7481acc3910685756b35141ee14` | Parcours Trials à 0/200 ms, fixtures vérifiées, interruption de Cal et preuves de parcours. |

## Choix de résolution

La façade de #36 est conservée. Les trois anciennes façades concurrentes et leurs guides devenus obsolètes sont remplacés par les données archivées et le guide courant `ALIEN_BASE_SYNC.md`. La comparaison des objets exportés de #30 et #31 avec `ALIEN_BASE_SOURCE_SNAPSHOTS_20261102.json` donne une égalité intégrale ; le CSV #30 est identique octet par octet. Le registre PR7 archivé est égal au catalogue de #33. Ces comparaisons justifient la conservation des données sans réactiver les anciennes API concurrentes.

Le client utilise 46 dossiers détaillés, 200 fiches d'armes, 84 identités maîtres et 45 propositions de rapprochement. Les propositions restent en attente. La conservation des anciens catalogues n'est pas une affirmation que toutes leurs lignes sont consultables ou jouables dans le client.

Les chaînes de preuve de #34/#37, de #36 et de l'intégration des outils IA sur `main` ont une base commune, mais des successeurs différents. Leur jonction doit déclarer les différentes branches et les octets de l'assemblage, sans transformer un ancien résultat en preuve de la nouvelle version. Les classeurs et témoins historiques restent conservés.

## Corrections nouvelles

### Export des œuvres d'origine

L'export AFE2 remplaçait `sourceGame` sur ses 35 lignes par le nom du jeu consommateur. Il conserve désormais la provenance d'origine et ajoute `exportedFromGame`. Les provenances inconnues de `siren`, `gasbag` et `wey-yu-worker` restent `null`. Les identifiants, profils et statuts ne changent pas. Le nouveau test échoue sur l'ancien export et réussit après correction ; il vérifie également l'absence de mutation des catalogues vivants.

### Parcours Trials et sortie de duel

La dernière exécution CI de #37 réussissait la capture Guardian puis laissait le combat avancer pendant les exports d'images et les lectures retardées. Le duel pouvait se terminer avant la demande d'abandon ; l'attente d'une clôture par abandon expirait alors sur un résultat natif déjà attribué. Le correctif maintient l'observation des phases réelles, protège les exports par la pause publique et conserve comme erreur explicite tout résultat qui survient avant le point attendu. Un résultat natif n'est jamais réécrit en abandon.

Le bouton d'abandon n'est offert que pour un ticket encore ouvert. Un duel terminé conserve son résultat et ses récompenses lors de la reprise et de la fermeture de l'interface de pause.

La première suite générale a révélé un double de test du compteur de super-attaque qui contournait le constructeur sans fournir l'accès à la progression. Il reçoit désormais une progression native, un getter et des gardes qui font échouer toute transaction déclenchée par le rendu. Le runtime conserve son contrat. Les deux fichiers complets de tests supers/navigation passent ensuite sans filtre, soit 65 tests, y compris le contrôle documentaire V148.

### Accès aux annexes

La continuation traite les quatre croisements de silhouettes restants de #36 : briefing/archives MIRE, cryogénie/capsules, médical/morgue et quarantaine/Bioforge. Les vrais paliers bas et leurs échelles sont déplacés ensemble ; les supports supérieurs, conduits, dimensions et appariements des portes restent conservés. Les équipements concernés suivent leurs supports. Le registre historique des 100 détails V177 reste intact ; le seul déplacement nouveau de `T177-I05` reçoit une transition documentaire séparée.

Les 83 contrôles ciblés couvrent les sauvegardes sur les anciens paliers et échelles, la chute par gravité native sans téléportation, la montée/descente et le passage dans les deux sens. Ils passent avec la physique et les commandes natives, dans un harnais Node utilisant un double Canvas. Les quatre nouveaux contrôles de dégagement échouent avec l'ancienne géométrie. Aucun rôle d'équipement n'est perdu dans les 35 compositions ; le chariot cryo existant `stasis-supplies` redevient admis, portant le recensement de 304 à 305.

La recette navigateur supplémentaire est branchée sur `ship-v165` et inclut également Durandal pour contrôler l'ensemble des cinq accès réunis. Elle prévoit 15 scénarios, dix passages aller/retour, dix reprises d'anciennes poses et 50 captures natives. Ces nombres décrivent sa couverture attendue ; son résultat effectif appartient au rapport Actions du commit exécuté.

## Validation du nouvel assemblage

Le tableau constate les vérifications locales effectuées avant publication. Les résultats ultérieurs de construction et de recette navigateur sont ceux des rapports GitHub Actions du commit réellement exécuté et de la description de la PR de consolidation. Les succès historiques de #34 et #36 ne sont pas transférés à cette branche.

| Contrôle | État |
| --- | --- |
| Ascendance des huit têtes | Vérifiée localement après les merges |
| Parité des catalogues historiques | Vérifiée depuis les objets Git et les snapshots conservés |
| Régression de provenance AFE2 | Ancien code en échec ; correction validée par les suites ciblées |
| Succession des historiques V162/V163/V165 | 56 tests ciblés réussis, zéro échec |
| Première suite Node complète, avant les quatre portes | 4 034 réussites, un échec et une fixture facultative ignorée ; 214 fichiers uniques, 1 187,6 s. L'échec du double UI du compteur de super-attaque a été reproduit puis corrigé. |
| Supers et navigation après correction | 65 tests réussis sur les deux fichiers complets, sans exclusion |
| Géométrie des quatre portes | 83 tests ciblés réussis dans le checkout du correctif ; 66 tests des six fichiers modifiés rejoués et réussis sur l'assemblage ; régression démontrée sur les quatre anciennes géométries |
| Suite Node complète sur l'assemblage final | Verdict attendu du workflow Release du commit publié |
| Contrôle des sources | Réussi : 2 454 fichiers, 1 426 ressources et aucun document privé admis |
| Build et distribution | Résultats associés au commit publié dans la PR de consolidation et dans Actions |
| Parcours navigateur concernés | Rapports natifs du commit publié ; aucune exécution navigateur locale revendiquée |
| Workflows GitHub de la consolidation | Verdicts effectifs disponibles après publication ; chaque résultat reste lié à son commit |

## Compléments après la première exécution GitHub

La première publication de la PR #39 utilise la tête `12637ec3684b48cfda68a06f018b16a931b0b17b`. Actions a exécuté le candidat de fusion `beb32ba348e63c8bf82ab6a7a83def78005afac1`, dont l'arbre `1d401c7dba00b943c7c2cb375ba857ccd5d4cd98` est identique à celui de cette tête. Les trois workflows Forge, Gameplay et Alien_base réussissent. Les deux autres conservent leurs échecs réels :

- Release : 4 047 tests Node réussis, zéro échec et une fixture physique V175 facultative ignorée, sur 214 fichiers uniques. Sources, build, distribution, service worker et isolation des comptes passent. Parmi les 26 rapports navigateur, 25 réussissent ; la sortie d'annexe d'Idris échoue dans `qa-npc-service-routes-v161.py`. La suite n'a donc pas encore qualifié son retour ni les cas suivants de Leila.
- Excel : 14 jobs sur 15 réussissent. Dans ship, V165 passe 121 contrôles/20 captures et V177 passe 497 contrôles/98 captures, avec 200/200 ajouts visibles. V182 réussit 13 scénarios sur 15 et conserve 233 contrôles/48 captures ; deux comparaisons de données interrompent les retours de Durandal et des capsules. Les 48 PNG sont vérifiés par empreinte et inspectés. Les dix reprises historiques réussissent.
- Trials : les deux modes 0 ms et 200 ms passent chacun 77 contrôles sur six duels avec les mêmes six Save. Chaque mode comprend 36 images de jeu et six planches de comparaison déclarées. Les pauses de récupération conservent leurs ticks après au moins 54 ticks natifs observés. Les deux parcours de Cal et les parcours physiques des autres PNJ restent associés à leurs rapports propres.

### Attendu complet des portes appariées

L'oracle V182 reconstruisait les sockets sans les métadonnées `id` et `bidirectional` ajoutées par les décorateurs du Hub. Les deux entrées natives réussissaient, avec des faces, dimensions et positions correctes, mais l'égalité complète des objets échouait. L'attendu est désormais obtenu depuis les quatre décorateurs de production, dans l'ordre de `app.js`. La comparaison reste intégrale et les 20 fonctions Python de parcours et d'assertion sont conservées. Les huit reçus de passage déjà disponibles correspondent après correction ; une nouvelle exécution navigateur doit encore réaliser les deux retours manquants.

### Réponse native à chaque demande de sortie V161

La trace du premier échec relève une vérification de disponibilité réussie, une seule touche E et une attente de 45 secondes sans sortie. L'état final ne permet pas d'attribuer avec certitude la cause à l'instant de la touche. Une fenêtre de course est néanmoins reproduite avec le véritable Hub et un PNJ natif : en 100 ms entre lecture et E, le passant entre dans la projection de retour, puis le moteur refuse normalement la demande. L'ancien pilote ne retente pas la sortie après le départ physique du passant.

Le nouveau pilote observe la réponse synchrone du moteur après chaque vrai keydown. Il n'autorise une nouvelle tentative qu'après un nouveau refus natif explicite, conserve cette tentative dans le rapport et ne renvoie aucune touche après acceptation. L'arrivée dans la pièce parente doit être attestée par le reçu natif. Disponibilité, tentatives et passage partagent toujours le même budget total de 45 secondes.

La suite V161 complète passe 21/21 après correction. Le nouveau cas de course échoue avec l'ancien pilote ; le passant immobile et la transition acceptée dont le host cesse de délivrer des frames restent des échecs à 45 secondes. Les doubles DOM/Canvas/RAF du harnais Node sont déclarés ; aucune méthode du moteur n'est remplacée. Ces contrôles ne requalifient pas rétroactivement le premier run GitHub.

## Compléments après la deuxième exécution GitHub

La deuxième tête publiée est `651c4e0c960d474558b3f6e07695039271a5a014`. Actions a exécuté le candidat `b828d89b41138db58c476661b3f830622fb598fa`, dont l'arbre `3e57e4d9d418dd725c8d23591079fc6051faf2da` est identique à cette tête. Les inventaires de sources, les informations de build et les empreintes des artefacts contrôlés lient les résultats suivants à ces octets :

| Workflow | Exécution | Résultat constaté |
| --- | --- | --- |
| Forge | [41831456358](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/41831456358) | Réussi ; suites Node 358 + 277 + 90 contrôles, six rapports natifs et 249 contrôles. |
| Alien_base | [41831456180](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/41831456180) | Réussi ; 49/49 contrôles. |
| Gameplay | [41831456150](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/41831456150) | Réussi ; 63 tests Node, cinq rapports natifs, 144 contrôles et 80 PNG présents. |
| Release | [41831456219](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/41831456219) | Réussi ; 4 049 tests Node réussis, aucun échec, une fixture physique V175 facultative ignorée, 214 fichiers uniques ; 26/26 rapports natifs, 756 contrôles et 378 PNG. |
| Excel | [41831456403](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/41831456403) | Échec conservé : 12/15 jobs réussis. Les trois échecs concernent Trials avec lectures à 200 ms, deux approches au clavier dans ship et le prérequis de retour de Jun dans crew-lifts. |

Les deux sorties V161 passent avec les vrais reçus de transition. Dans le scénario Idris, le joueur reçoit un refus natif documenté, puis une acceptation après le départ de l'occupant ; il rejoint le réacteur en 3,801 s dans le budget global inchangé de 45 s. Dans le scénario Leila, le joueur rejoint le mess après une seule demande acceptée, en 0,600 s. Ces durées mesurent le passage du joueur, pas le retour physique des PNJ eux-mêmes. Aucune touche E supplémentaire n'est envoyée après acceptation. Les images de retour et de service ont été inspectées.

Les deux parcours de Cal réussissent 31 contrôles/38 PNG et 34 contrôles/31 PNG. Leurs 69 PNG correspondent aux empreintes déclarées ; l'interruption conserve le même propriétaire d'observation et reprend le déplacement natif. La propriété `stationToWorkTravelObserved` reste fausse dans ces rapports : cette couverture n'est pas inventée.

### Acquisition Trials avec lectures retardées

Le mode 0 ms réussit encore 77 contrôles et 42 captures. Dans le mode 200 ms, le joueur perd réellement contre le commando WY avant d'obtenir la prise : trois specials acceptés, aucun hold admis, puis KO au tick 2746, à 26,108 s dans le budget de 55 s. Les six duels de ce mode ne sont donc pas qualifiés par ce run. Les six Save reprennent le même contenu de jeu que dans la première exécution ; seuls leurs horodatages `createdAt` et `updatedAt` changent entre les deux runs. Dans chaque exécution, les modes 0/200 ms réutilisent les mêmes octets. Les paramètres du combat et le pilote sont identiques ; la phase des observations change les décisions de garde et les fenêtres de départ.

Le pont de régression exécute les helpers Python réels, les commandes clavier, le runtime et le CPU de production. Il reproduit l'échec de l'ancien pilote dans plusieurs phases voisines avec des lectures à 200 ms. Le nouveau pilote mesure la durée de ses lectures, garde une réserve native pour le special, maintient la garde entre les lectures exposées et avance pendant les fenêtres de récupération réellement observées. La portée de départ est calculée depuis le saut et le déplacement natifs ; l'admission du contact reste à 8 px et chaque succès exige encore la préparation et le hold de la bonne attaque.

La suite complète du vérificateur réussit 19/19, sans exclusion. Dix acquisitions natives couvrent six configurations WY à 200 ms, dans plusieurs phases RAF voisines, et Guardian/Cultist chacun à 0 et 200 ms : de 2,124 à 18,310 s, avec un à trois specials acceptés. Le cas négatif reçoit un véritable hold après l'échéance et doit échouer explicitement à 61,850 s. La limite de 55 s et celle de 32 essais restent inchangées. Le changement de round relâche puis réémet les vraies touches et le mouvement reprend.

Le seed, le choix d'adversaire et la durée du round sont des paramètres de fixture fixés avant la construction du runtime ; aucun état de combat n'est écrit pendant le parcours. Les doubles DOM/Canvas/RAF et les transports symétriques du pont sont déclarés. Le pont ne simule pas un surcoût réseau distinct pour le dispatch clavier et ne constitue pas une qualification Chromium. Seule la prochaine recette navigateur peut confirmer les six duels avec chacun des deux délais.

### Approche précise des portes au clavier

Le second run de ship réussit toujours V165 (121 contrôles/20 PNG) et V177 (497 contrôles/98 PNG, 200/200 ajouts visibles). V182 conserve 13/15 scénarios, 197 contrôles et 43 PNG. L'égalité complète des sockets des capsules et leur retour passent désormais. Les dix anciennes poses passent aussi. Les deux nouveaux échecs précèdent la demande de passage : approche du palier haut de Durandal et de l'échelle médicale. Le joueur reste vivant, au sol, sans collision bloquante ; les dernières corrections dépassent alternativement la cible.

La reproduction utilise la vraie fonction Python `walk_to`, le Hub et ses touches A/D. Une impulsion minimale de 18 ms, le retard des touches et le freinage natif peuvent déplacer le joueur de 8,975 px, davantage que la fenêtre de précision finale. Le mouvement alterne alors de part et d'autre de la cible jusqu'à la limite des 24 corrections. Le correctif réduit les impulsions d'approche et divise le gain après un dépassement ; il conserve la physique, les tolérances de 3/2,5 px et les 24 corrections maximales. Chaque correction est consignée.

La matrice de 24 approches réussit en une à trois corrections avec le nouveau pilote ; dix de ces mêmes cas échouent avec l'ancien. La suite V178 complète réussit 18/18. La comparaison AST confirme que seule `walk_to` change dans le pilote de portes. Les 15 scénarios et les 50 images attendues restent à produire dans la prochaine exécution navigateur.

### Retour de Jun dans le prérequis crew-lifts

Le retour utilisé avant le parcours d'Asha expire à 900,048 s, après 307,258 s de simulation native. Jun est encore en mouvement vers son origine : deux traversées et deux trajets d'ascenseur attestés, 77,953 px restant à parcourir. Le ralentissement CDP n'est pas appliqué dans ce prérequis. L'observateur reçoit 9 039 RAF, soit environ 10,043 images/s ; la progression native par RAF est proche du plafond de 34 ms.

Les 552 sources et le pilote sont identiques entre les deux runs, ainsi que les versions de Chromium et Playwright. La fixture Asha ne diffère que par ses horodatages. Le premier run vert effectue le même parcours natif de 9 180 px en 710,949 s murales, avec 9 110 RAF et 309,706 s natives, soit 12,814 images/s. Les phases précédentes de Maksim et Inez sont également plus lentes lors du second run, et les mêmes 334 tests Node passent de 84,07 à 103,97 s. Ces données étayent une exécution globalement plus lente ; elles ne mesurent ni le CPU de Chrome ni une défaillance précise de l'hôte. Le budget de 900 s et l'exigence d'un retour natif complet restent inchangés.

Une mesure locale ciblée du lecteur réel et de ses trois clones, sur les quatre états initial/final des deux runs, obtient des médianes de 0,044 à 0,082 ms par lecture. Les états restitués sont égaux aux fixtures et le host déclaré n'est pas modifié. Cette mesure Node avec un host de test ne profile pas Chrome ou le moteur complet ; elle n'établit pas que le lecteur provoque la cadence observée. Aucun correctif spéculatif ni changement de budget n'est ajouté. La prochaine exécution complète du nouveau candidat doit constater le retour natif de Jun dans les mêmes conditions d'admission ; le précédent échec reste enregistré.

## Travaux encore distincts

L'intégration ne transforme pas les 129 propositions d'armes en équipements admis, ni les 18 tenues sans visuel équipable en tenues terminées. Les trois profils AFE2 inconnus, les rapprochements à documenter, les archives primaires manquantes et les validations artistiques restent ouverts. Aucun statut de fidélité canonique ou artistique 1:1 n'est accordé par une fusion de code.
