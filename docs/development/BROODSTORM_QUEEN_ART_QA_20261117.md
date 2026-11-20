# Reine ailée de Broodstorm — intégration et revue native

Date de travail : 17 novembre 2026. Parent vérifié : `361e40670c393dd548b4faa081f12edb0e9b05c4` (HADAL). Ce compte rendu porte sur l'acteur du chapitre local Broodstorm et sur ses trois nouvelles planches.

## Résultat et périmètre

La Reine du chapitre prend une identité ailée cohérente avec la référence 36 déjà présente dans Tantalus. Les trois PNG contiennent douze poses : quatre battements de poursuite, quatre poses de vol retenu/repos et quatre étapes de mort en suspension. Les pixels générés restent intacts. Le registre ferme uniquement `dedicated-flying-queen-art` ; Broodstorm conserve son statut partiel et la dette `complete-modular-dropship-corpus`. Le registre global reste à 21 opérations jouables, 19 partielles et deux effectives, avec `canonExact:false`.

Les sources du lot sont :

| Planche | Dimensions | Taille | SHA-256 |
| --- | ---: | ---: | --- |
| `assets/broodstorm/v188/flying-queen-chase.png` | 1254 × 1254 RGBA | 1 468 456 octets | `3378038c5c052193b83b5fc9e0daa6b160f1f2d03deec1b7a6ad64ebe23c1cb7` |
| `assets/broodstorm/v188/flying-queen-idle.png` | 1254 × 1254 RGBA | 1 104 459 octets | `9b52e84a350f6739f07338be766fddb7ca010c5f632d421aef934bf982884855` |
| `assets/broodstorm/v188/flying-queen-death.png` | 1254 × 1254 RGBA | 1 223 756 octets | `660be861f23b3ad0a40c7c5a81cdcde7485f0752a98effda0e0055f77e51b350` |

Le lot ajoute exactement **3 PNG et 3 796 671 octets**. Chaque planche contient quatre cellules de 627 × 627. La sortie réelle de génération est documentée ; aucune interpolation n'est appliquée aux fichiers pour atteindre la résolution demandée dans le prompt.

## Référence et fidélité

La référence est [`ref-36-queen-xeno-winged-2.png`](../../assets/openai/sprites/static-enemy-v95/ref-36-queen-xeno-winged-2.png), SHA-256 `5d3a9946cfe04400bc17afb3dea11e1f94672fcded22b99374941c865f0442ce`. Elle fixe le profil droit, la crête métallique sombre, le corps biomécanique noir, les membranes orangées et la queue articulée. La référence 37 n'est pas employée : son angle et son identité diffèrent. Les deux planches complémentaires utilisent également la première planche CHASE acceptée comme référence de continuité.

Le registre d'origine qualifie cette identité d'adaptation du projet, avec `identityVerified:false` et `canonExact:false`. La présente livraison améliore sa continuité visuelle dans Tantalus ; elle ne certifie pas une fidélité canonique globale « 1:1 ». Les prompts complets, références, empreintes, cadres source, mesures d'alpha et limites anatomiques sont dans la [provenance](BROODSTORM_QUEEN_ART_PROVENANCE_20261117.json).

## Raccord au moteur existant

Le helper [`broodstorm-queen-art-v188.js`](../../src/broodstorm-queen-art-v188.js) est appelé depuis le véritable [`drawEnemy` Legacy](../../src/legacy-operations-v131.js). Il exige le chapitre Broodstorm, l'identité `legacy-queen-0`, son rôle, sa feuille native V56 et son appartenance à la liste d'acteurs courante. Un ancien objet après restauration et une copie de mesure détachée sont exclus. La garde reste valable à l'étape 4 : la défaite fait avancer le chapitre immédiatement, alors que le corps demeure visible jusqu'à l'expiration native de son délai.

Les trois sources sont demandées à l'entrée de Broodstorm. Le chargement valide leur origine, leur chemin exact, leurs dimensions et leurs fenêtres avant d'en dessiner une seule. Un kit incomplet conserve tout le dessin natif. Les callbacks tardifs ne règlent que leur propre image ; ils ne réactivent pas le chapitre ni ne remplacent un nouvel acteur.

La boîte physique reste **336 × 268,28125** et l'acteur garde son exemption au normaliseur de créatures. La poursuite, les collisions, les projectiles, les dégâts, la progression, les ressources et les sauvegardes restent sous leurs propriétaires natifs. Le rendu utilise le même contrôleur d'animation, sans nouvel événement, horloge ou boucle RAF.

| État observable | Frames natives | Cadence | Portée |
| --- | --- | ---: | --- |
| Poursuite | 4–7 | 10 images/s | Quatre phases de battement |
| Repos / réaction | 0–3 | 4 images/s | Une réaction ordinaire de 0,24 s montre généralement la pose 0 |
| Mort | 12–15 | 7 images/s, sans boucle | Dernière pose maintenue, puis disparition native du corps |

Les frames d'attaque 8–11 restent inutilisées par le contrôleur Legacy actuel. Le contact conserve son délai de 1,3 s et ne dépend d'aucune image d'attaque. La mort dure 2,8 s selon le cycle de vie existant ; les dessins n'ajoutent ni chute physique ni atterrissage.

## Recalage et correction après revue

La calibration s'appuie sur la hanche et des régions du torse. La hauteur anatomique de référence CHASE est de 410 pixels source. IDLE et DEATH utilisent respectivement les rapports de taille mesurés 0,84 et 0,89 ; une seule échelle uniforme par famille est appliquée, sans redimensionnement par pose ni ajustement à l'envergure des ailes.

Les pivots sont explicitement mesurés, avec une incertitude de l'ordre de 4–6 pixels source pour IDLE et de 5–8 pour DEATH. Le rapport de taille DEATH est un compromis anatomique dont l'incertitude est de l'ordre de 3–4 %. Ces valeurs ne sont pas des intervalles de confiance statistiques. La dernière hanche DEATH est moins corrélable ; son estimation a été confrontée au rendu natif. L'évolution volontaire de la tête, des ailes et des membres pendant la mort reste présente.

Le premier rendu V1 conservait la barre de santé à `enemy.y -10`, ce qui traversait l'aile haute. La correction V2 place ses deux rectangles à la hauteur constante :

```js
worldHipY - 372 * (enemy.h / 410) - 10
```

La constante −372 décrit le plafond de l'union des douze silhouettes en pixels CHASE. Elle ne dépend pas de l'échelle courante IDLE/DEATH, ce qui évite de faire monter et descendre la barre avec les battements. Largeur, couleurs, remplissage et gardes natives sont conservés. Le repli garde la barre historique. Les bornes de visibilité englobent les cellules entières et l'ombre native ; elles n'agrandissent aucune collision.

## Conditions de vérification

Les tests utilisent le moteur de production et son catalogue complet. Les hôtes Node remplacent les API navigateur, événements, RAF et images de chargement ; les captures utilisent Canvas/Skia avec les vrais PNG décodés, les véritables méthodes de rendu et des polices déclarées. Les poses isolées sélectionnent explicitement l'état et l'horloge du contrôleur. Les séquences de poursuite et de mort avancent le moteur par de vrais appels `update`, après une préparation de chapitre déclarée.

La préparation n'est pas un parcours utilisateur du chapitre entier. Aucun parcours Chromium local n'est revendiqué. Les changements d'état causés volontairement par `update` ou par une action admise sont distingués de l'absence de mutation pendant un simple dessin.

Deux corrections de fixture ont précédé les preuves finales : synchroniser l'état dérivé après un choix de phase, puis attendre explicitement le décodage réel de l'atlas natif d'une Reine créée hors de la caméra initiale. Un appel `drawImage` enregistré sans pixels visibles n'est pas retenu comme preuve de rendu. Les premières observations ont été conservées séparément.

## Tests ciblés et preuves causales

Le contrôle d'intégration V2 passe **72 tests sur 72**, sans échec ni test ignoré, dont **9 tests dédiés**. Il dure 13,928 s ; son journal a l'empreinte `672edd1a8a9f41c7bec5fd83668b617f7bfd3a16d5426ba0af3e34e7984cdc53`. Les reprises isolées ne sont pas ajoutées à ce total. La correction de notice identifiée plus tard par la suite complète est attribuée séparément ci-dessous.

La suite dédiée contrôle les fenêtres source, les directions, le mouvement réduit, les huit masques de disponibilité, les sources étrangères, les callbacks tardifs, les propriétaires périmés, le contact après la protection d'insertion, la réaction, la pause, la mort après passage à l'extraction, la reprise et la visibilité aux bords de la caméra.

Deux mutants isolés apportent des preuves distinctes : désactiver uniquement l'acceptation du dessin dédié fait échouer le contrôle de V1 (zéro image dédiée au lieu d'une) ; remettre uniquement la barre V2 à `y -10` fait échouer sa hauteur attendue (161,71875 au lieu de 70,7648628). Le premier mutant appartient au candidat V1, le second au candidat V2. Le passage final des 72 tests porte sur les fichiers V2.

Les tests de distribution, le registre courant, la matrice native et les gates de publication sont rapportés séparément ci-dessous.

## Registre courant et preuves historiques

Les quatre suites du terminal et de ses trois consommateurs passent **47/47**, sans échec ni saut, en 19,38 s sous Node 24.22.1. Leur journal porte le SHA-256 `7aa93701e9c049c09cfa13efedce0caaebc32c5e5ef7fc3eaa569b680800abf4`. Les contrôles comprennent 25 variantes de déclaration incorrectes et quatre variantes de reçu ; ces variantes font partie des tests annoncés et ne sont pas ajoutées au total.

Le vérificateur Broodstorm exige son unique dette restante, son statut `partial`, son accessibilité et `canonExact:false`. Il restaure ensuite les deux dettes du parent H pour contrôler exactement toutes les déclarations, dont titres, ordre, routes et mécaniques requises, puis appelle le vérificateur Cargo inchangé. L'objet `campaign` imbriqué relève de reçus source distincts. Les deux opérations modifiées depuis le snapshot historique sont Cargo et Broodstorm ; les 19 autres restent inchangées.

Le nouveau bloc terminal ajoute douze successeurs exacts depuis H et deux nouvelles sources. La chaîne couvre désormais 133 successeurs et onze ajouts. Les six blocs historiques, le bloc CargoRegistry et sa fonction restent byte-identiques au parent ; les snapshots V157/V158 ne sont pas réécrits.

## Distribution et attribution des validations

Le service worker ajoute uniquement le helper au shell, désormais composé de **730 entrées** dans l'ordre antérieur. Les trois PNG sont admis sur leurs chemins runtime exacts et chargés à la demande. Les quatre preuves de ce lot et le vérificateur restent des fichiers source exclus de la distribution construite. Le schéma de sauvegarde demeure 52.

La suite de distribution `verify-audit-v143.mjs` passe **77/77**, sans échec ni saut, en 2,095 s ; son journal porte le SHA-256 `d3c115dfee085d248b0b0a980af39804cdcfadd319183af6980ca688e2b54fcb`. `npm run check` passe en 3,468 s sur **3 549 fichiers et 1 598 assets**, sans document privé ; journal SHA-256 `383bd86f942d59068c57d4ec1d30aaa5a8e3b87ea09b5e834a1e00bba47884a8`. Les 25 fichiers candidats sont restés identiques pendant ces commandes. Seuls les résultats documentaires sont ajoutés ensuite, avant le gel du commit.

Une seconde revue en lecture seule confirme les gels du runtime et du registre, les 55 fichiers d'images référencés (51 captures, trois comparateurs et une planche), ainsi que les résultats 72/72 et 47/47 conservés. Elle inspecte la planche et confirme les limites de reprise et de rendu ; elle ne relance aucune suite et n'est pas ajoutée aux comptes de tests.

La suite release complète, les contrôles `check`, `build`, `check:built` et la comparaison de livraison sont attestés séparément sur la révision exacte dans la PR #49. Les succès du parent HADAL ne sont pas attribués au présent candidat. Les résultats ciblés et les captures de ce lot sont détaillés ci-dessous.

## Matrice Canvas finale

La passe finale réussit **51 captures candidates et trois comparateurs du parent H**, sans échec. La planche de synthèse est un document supplémentaire, non ajouté au compte des captures. Les sources, images et sources du parent gardent leurs empreintes entre le début et la fin.

| Groupe | Captures candidates | Observation |
| --- | ---: | --- |
| Douze poses dans les deux orientations | 24 | Cellules entières, prélèvements uniformes et pivots anatomiques contrôlés |
| Huit masques de disponibilité | 8 | Les sept kits incomplets donnent exactement les pixels du parent ; le kit complet dessine la Reine dédiée |
| Acteur détaché et contexte étranger | 2 | Retour exact aux pixels du parent |
| Pause et relâchement | 3 | Pixels identiques pendant la pause, progression native après relâchement |
| Reprise, propriétaire courant et ancien | 2 | Nouvel acteur admis ; ancien objet exclu du dessin dédié |
| Mort par action native puis mises à jour | 6 | Frames 12, 13, 14, 15 puis maintien et disparition |
| Quatre bords de caméra | 4 | Admission visuelle de l'aile sans modification du corps physique |
| Poursuite réelle, vues FR et EN | 2 | Huit secondes simulées de mises à jour natives, caméra et HUD du moteur |

Les six vues supplémentaires envisagées en mouvement réduit n'ont pas été produites. Ce réglage est couvert séparément par la suite unitaire du lot, sans être revendiqué dans la matrice Canvas.

La mort est déclenchée par le véritable `defeatEnemy`, puis observée aux instants 0, 0,15, 0,30, 0,50, 1,50 et 2,81 s. Le chapitre est à l'étape 4 dès la défaite. Les frames natives évoluent 12 → 13 → 14 → 15 ; la dernière reste maintenue à 1,50 s, et aucun dessin de la Reine ne subsiste à 2,81 s, lorsque `deathClock` atteint zéro. Une caméra d'observation positive est déclarée pour suivre le corps ; aucune nouvelle chute n'est inventée.

Les cinq captures avant disparition ont encore un alpha de 1. L'intervalle intermédiaire de transparence partielle n'a pas été capturé ; la suite de six vues atteste la progression et la disparition, pas chaque étape du fondu.

Les vues de poursuite partent d'une position de véhicule explicitement préparée à `(1400,550)`, dans les limites jouables et hors des obstacles, puis exécutent huit secondes réelles de simulation. La Reine passe de `(x=2330 ; y=171,71875)` à environ `(x=1384,369 ; y=441,093)` ; son gabarit reste inchangé. La caméra suit la simulation, sans masquage du HUD. Le premier spawn haut, partiellement recouvert par le HUD, reste une observation conservée ; les vues finales ne prétendent pas corriger cette disposition native.

La revue visuelle confirme la continuité de silhouette, les ailes entières, la hauteur constante de barre et la lisibilité dans le décor. Le mode EN traduit les nouveaux libellés exacts et les consignes, mais conserve du français dans des bandeaux dynamiques natifs, notamment `REINE AILÉE`, `COQUE` et `ESCORTE`. Ces vues ne certifient pas une localisation intégrale de l'interface.

## Reprise et corrections de la fixture finale

Deux essais préparatoires supplémentaires restent conservés séparément. Le premier indiquait une escorte arrivée sans l'avoir placée à sa destination x2110 : le validateur natif refusait correctement cet état incohérent. Le deuxième supposait une télémétrie `v52Animation` immédiatement renseignée après reprise ; elle est en réalité nulle sur l'acteur fraîchement recréé, aussi bien dans H que dans le candidat. L'audit final identifie la pose à partir de la fenêtre effectivement dessinée et conserve la télémétrie séparément.

Ce deuxième essai imposait aussi une égalité JSON stricte de la géométrie. Une reproduction native identique sur H et sur le candidat montre le même retour de y : `171.3478239259242` → `171.34782392592422`, soit **+2,842170943040401 × 10⁻¹⁴ px**, issu du calcul existant `saved.y + saved.bodyHeight - enemy.h`. x, largeur et hauteur restent identiques. Les valeurs transitoires vx et vy présentes avant reprise sont absentes sur l'acteur recréé dans les deux versions ; le propriétaire est bien un nouvel objet. La source native de reprise est inchangée, SHA-256 `c73d044c8d19f3558a579148f3cf7c47e57075a58cbf53ee66695fb59995cf7b`.

La reprise n'est donc pas présentée comme une conservation byte-identique de tous les champs. Sa reconstruction conserve le comportement du parent. Le simple dessin, lui, laisse inchangés les champs physiques et les sauvegardes surveillés, et restaure les transformations, l'alpha et la pile Canvas.

## Correction de notice après le premier contrôle complet

Le premier candidat API `e0b010f4459209fde299dee98fcc96f49a2916f9` n'a pas été publié. Sa suite complète termine avec **4 761 tests : 4 759 réussis, un échec et un saut hérité**, en 506,906 s. Le journal conservé porte le SHA-256 `fcf3ffd43229df3397ae9f6d1dd2c4a335db6c8c1b52b03502b97e0324d27a80`. Les gates suivants ne sont pas exécutés sur ce candidat.

L'unique échec est le contrôle Legacy existant qui exige une mention explicite d'« adaptation » dans le dossier Broodstorm. La notice avait conservé les limites et les statuts, mais retiré ce mot. Le correctif ajoute **« (adaptation aérienne) »**, avec **« (aerial adaptation) »** dans la traduction anglaise. Le test et ses assertions restent inchangés ; les images, méthodes de dessin, collisions, cadences, progression et sauvegardes ne sont pas modifiées.

Les deux empreintes runtime concernées sont mises à jour dans la provenance et le terminal. Le reçu Canvas conserve ses relevés et leurs empreintes originales, puis décrit cette succession textuelle dans `postCaptureWordingFollowup`. Les 51 captures et trois comparateurs restent attribués à leurs sources réellement exécutées ; aucun nouveau raster n'est revendiqué pour le correctif de dossier. Le reçu natif original, avant cette annexe, est conservé avec le SHA-256 `0191d5b0b0e32b3b9e02465d7b5d8c84c0207881ecbe3977bf017a2d44f43cdc`.

Le correctif passe ensuite les deux suites Legacy et terminal V188 : **31/31**, sans échec ni saut, en 14,457 s. `npm run check` réussit à nouveau sur **3 549 fichiers et 1 598 assets**, sans document privé. Le reçu ciblé porte le SHA-256 `e17b7097b654631c21b0a6c93f8cf6a6e3b603b6063f2688942438491d442907`, et le journal des tests `150c78e911a4b5251d177c0db0e5eea7340bbab94867b0ca5459802bf41ff26f`. Le diff contrôlé contient exactement les deux littéraux FR/EN dans le runtime ; les sept fichiers modifiés et l'état Git sont stables pendant l'exécution. Deux précontrôles documentaires trop restrictifs sont corrigés avant les suites Node et conservés séparément. Ces résultats ciblés ne remplacent pas les gates complets du nouveau commit, attribués dans la PR ; seuls ces paragraphes de résultats sont ajoutés après la passe ciblée.

## Limites conservées

Le contrôleur Legacy fournit une poursuite aérienne adaptée, un contact et une mort en suspension. Il ne fournit pas une nouvelle attaque animée, un atterrissage, une chute physique, un Cheyenne intégralement modulaire ou les actes prolongés proposés dans la bible. Les fenêtres source comprennent les très faibles pixels d'alpha aux bords ; le rendu ne retouche pas les PNG. Le calibrage anatomique garde les incertitudes indiquées ci-dessus.

Les [références et prompts](BROODSTORM_QUEEN_ART_PROVENANCE_20261117.json), la [planche intégrée](BROODSTORM_QUEEN_ART_OVERVIEW_20261117.png) et le [reçu de rendu](BROODSTORM_QUEEN_ART_RENDER_RECEIPT_20261117.json) constituent les preuves locales du périmètre artistique. Une scène préparée sous Canvas natif ne certifie pas un parcours navigateur complet ni la totalité de Tantalus.
