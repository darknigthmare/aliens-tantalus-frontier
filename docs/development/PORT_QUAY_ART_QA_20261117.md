# Port-Méridien — raccord artistique du quai jouable

## Résultat et périmètre

Base : `ee565717bdc698594c41f76fe1e1c72c2a730656`, publication du lot prologue sur la PR #49 le 17 novembre 2026. Les cinématiques disposaient des nouveaux corps et du couple patient/brancard ; le quai jouable utilisait encore les anciennes silhouettes.

Ce sous-lot raccorde **quatre PNG existants**, soit **6 316 935 octets**, dans `port-meridien-quay`. Aucun fichier image n’est généré, réencodé ou retouché. Les prompts, les références et les octets d’origine restent documentés dans [la provenance du prologue](PROLOGUE_ART_PROVENANCE_20261117.json). La [provenance du quai](PORT_QUAY_ART_PROVENANCE_20261117.json) ajoute les mesures propres au jeu, le chargement et les empreintes de cette intégration.

Le consommateur actif reste `HubGame` exporté par `hub-opening-v88.js`, composé avec `withPortMeridienV90`, puis avec la profondeur de production. `app.js` utilise ce hub pour l’arrivée physique au port. Les modifications de rendu se limitent au chargement à l’entrée, aux deux corps dans la passe de profondeur et à l’ensemble médical dans sa passe existante.

| Source réemployée | Usage dans le quai |
| --- | --- |
| `assets/prologue/v188/tomas-wren-standing.png` | Wren, retourné vers la rampe à gauche |
| `assets/prologue/v188/lucia-ferro-standing.png` | Ferro, tournée vers le patient à droite |
| `assets/prologue/v188/north-quay-patient.png` | Patient allongé, avec bandage et respiration native |
| `assets/prologue/v188/medical-stretcher.png` | Brancard roulant séparé, appuyé sur le sol |

Les trois habitants escortés conservent leur atlas animé, leurs cellules d’attente/triage/marche, leurs positions et leur suivi. Les formes natives du stern, des conteneurs et des autres accessoires restent hors de ce sous-lot.

## Construction et contacts

L’échelle du quai reste **51 px/m**. Les PNG sont prélevés dans leurs fenêtres déjà mesurées et dessinés avec le même facteur sur les deux axes. Le retournement horizontal de Wren ne déplace pas son pivot.

| Élément | Placement observé dans le renderer |
| --- | --- |
| Wren | Pied `(330,628)`, hauteur de 91 px, direction gauche, ombre conservée |
| Ferro | Pied `(690,626)`, hauteur de 86 px, direction droite, ombre conservée |
| Matelas | Largeur de 102 px, soit 2 m ; bord arrière à y581,328 et bord avant à y586,508 |
| Brancard | Roues au pivot `(768,624)` ; échelle uniforme `102/1733` |
| Patient | Longueur de 89,25 px, soit 1,75 m ; position liée au support du matelas |
| Contacts mesurés | Tête : 0,038 px ; talons : 0,123 px ; main : 0,002 px du bord correspondant |

Les contacts proviennent des pixels alpha des sources et des transformations réellement enregistrées. Le matelas présente deux bords visibles en perspective ; la tête repose sur le bord arrière et les talons/la main sur le bord avant. Il n’est donc pas traité comme une ligne horizontale unique.

Le nouveau brancard roulant ne possède pas le bras de monitoring de l’ancien `medical-bed.png`. Aucun consommateur d’interaction ni usage narratif de ce bras n’a été trouvé. La boîte historique de 112 × 87 px est conservée pour son placement et pour le repli, mais n’est pas imposée au nouveau PNG : étirer celui-ci à cette hauteur fausserait son échelle. Son enveloppe projetée mesure environ **112,123 × 42,966 px**.

Wren et Ferro restent dans `items.sort((a,b) => b.z-a.z)`. Les contrôles placent le véritable marine derrière puis devant chacun des PNJ ; le décalage vertical de profondeur n’est appliqué qu’une fois. Le patient et son support gardent leur passe de décor contre le mur.

## Respiration, chargement et replis

Le quai conserve sa fonction temporelle native : `reducedMotion ? 0 : Math.max(0, Math.sin(time * 2.2))`. L’amplitude positive reste entre 0 et 1 px ; elle n’est pas remplacée par celle de la cinématique. Huit bandes du haut du thorax composent le mouvement progressif. La ligne inférieure, la tête, les jambes, la main et le brancard sont fixes. Les deux captures en mouvement réduit sont identiques.

Les quatre demandes partent uniquement après l’activation effective du quai. Les images prêtes ou en cours sont réutilisées ; une erreur est retentée à une entrée ultérieure. Le dessin ne crée aucune image, requête ni promesse. Les événements d’un ancien chargement ne remplacent pas une image plus récente et ne relancent ni ne redessinent un hub arrêté. L’admission contrôle le chemin propriétaire, les dimensions natives exactes et les bornes des fenêtres source.

Wren et Ferro disposent de replis indépendants. **Le patient et le brancard basculent ensemble** : si l’un manque ou est invalide, les deux anciens dessins restent utilisés. L’ancien patient se trouve à une autre hauteur ; le mélanger au nouveau support le ferait flotter. Aucun demi-couple n’est peint avant la validation des deux sources.

Le repli complet signifie ici « les quatre nouveaux PNG sont absents, les ressources historiques restent disponibles ». Il reproduit exactement la référence P. Si l’ancien `medical-bed.png` échoue également, le repli historique ne dessine pas de support ; cette limite préexistante n’est pas présentée comme corrigée.

## Vérifications réalisées

**19/19 contrôles ciblés** passent : 14 contrats existants du quai et cinq contrôles supplémentaires. Ces derniers exécutent les vrais `start()` et `draw()` du hub et son wrapper de profondeur, avec une doublure explicite d’Image, d’événements, de RAF et de Canvas. Les dimensions sont lues dans les vrais en-têtes PNG ; ce volet ne prétend pas décoder leurs pixels.

```bash
node --test --test-name-pattern='^quay' \
  scripts/verify-quay-coherence-v188.mjs \
  scripts/verify-hub-depth-rooms-v188.mjs \
  scripts/verify-bugfix-hub-story-v188.mjs
```

Les cas ajoutés couvrent pieds, orientation, profondeur, caméra, contacts, respiration positive et mouvement réduit ; les quatre combinaisons de disponibilité patient/brancard ; le refus d’une autre source, de dimensions incorrectes et de cibles non finies ; le partage des demandes, le réessai après erreur et un ancien chargement tardif. L’entête documentaire du test a été précisé après ce journal, sans changement de code exécutable. Le contrôle final de release porte séparément sur le SHA exact publié.

`npm run test:audit` passe **132/132**. Le nouveau module est installé exactement une fois dans le shell ; les images restent chargées à la demande et sont utilisables depuis le cache après une première visite. Les quatre chemins runtime restent inchangés. Les quatre documents de cette preuve sont admis comme sources et refusés dans la distribution ; leurs voisins non déclarés et les suffixes de sauvegarde restent refusés. Le shell compte **726 entrées uniques** et le schéma de sauvegarde reste **52**.

La comparaison indépendante confirme que `PORT_SCENE_V188`, `PORT_ASSETS_V90`, l’échelle et les géométries des **sept phases** sont identiques à P. `port-meridien-v90.js`, `prologue-art-v188.js`, `story-cinematics-v188.js` et `save.js` gardent leurs octets. Les contrôles de succession préservent les blocs historiques et ajoutent une continuation propre au quai. Leurs résultats, puis la suite complète, les contrôles des sources, le build et sa vérification, sont consignés sur le commit exact dans la PR #49.

## Revue indépendante des pixels

Le [reçu de rendu](PORT_QUAY_ART_RENDER_RECEIPT_20261117.json) compare **12 conditions de P à 12 conditions du nouveau renderer**, à 1 280 × 720, et ajoute une vue générale où le marine dégage les personnages. **66/66 contrôles passent, avec zéro erreur.** La [planche](PORT_QUAY_ART_OVERVIEW_20261117.png) présente la vue native puis des agrandissements QA sans lissage ; ils ne modifient ni les PNG de jeu ni les captures sources.

| Observation | Résultat |
| --- | --- |
| Quatre sources effectivement dessinées | Contribution visible vérifiée pour chacune |
| Pieds, tailles et orientations | Pivots natifs et échelles uniformes confirmés |
| Patient et brancard | Contacts tête, talons, main et roues mesurés |
| Profondeur | Quatre configurations devant/derrière, avec le vrai marine modulaire |
| Respiration | Thorax seul mobile ; supports fixes ; mouvement réduit stable |
| Replis partiels | Les deux indisponibilités du couple produisent la même composition de secours |
| Repli complet | Pixels identiques à P |
| Pixels hors des zones remplacées | Zéro changement sur les douze comparaisons |
| État et Canvas | État physique restauré, pile de transformations équilibrée, sources et images stables |

Les captures utilisent `@napi-rs/canvas`, les vrais PNG décodés, les fonctions de production et les polices déclarées dans le reçu. Le renderer est instancié avec une fixture d’état explicite ; son cycle de vie n’est pas démarré pour les captures. Le marine modulaire, les trois habitants, les décors et l’ancienne politique alpha sont réellement dessinés. Le contrôle du cycle de vie relève des tests ciblés décrits plus haut.

Les **479 observations** sont expliquées : **471 prélèvements anisotropes hérités** sur les fonds, sols, accessoires et atlas, et **huit transformations locales de respiration**. La référence P en produisait 480. Le résultat est « zéro erreur », pas « zéro observation » ni une correction générale des proportions du décor hérité.

Cette preuve ne constitue pas un nouveau parcours local Chromium, un essai de sauvegarde joué ni une mesure de performance du navigateur. Les résultats de CI du prologue et de la continuation restent identifiés par leurs commits et leurs runs dans la PR.

## Suivi des parcours clavier après le prologue

Le lot artistique s'accompagne d'un correctif du pilote de recette Trials. Sur la CI du prologue `ee565717` (build de merge `fe3bcd50c230`), la pause native réussit avant la sauvegarde Broodstorm, puis échoue aux trois acquisitions de focus après rechargement. Le canvas et le document sont observés avec le focus, sans dialogue ni handover bloquant ; le projectile est toujours présent. Cette trace ne relevait pas la phase de l'introduction et ne suffit donc pas à lui attribuer à elle seule l'échec distant.

Une reproduction indépendante appelle le véritable `playIntroV188`, les handlers natifs du titre et du moteur, avec des timers réels dans un hôte DOM déclaré. Pendant le fondu de **1 100 ms**, la règle CSS permet les clics sous l'overlay mais son listener clavier en capture exécute encore `preventDefault()` et `stopImmediatePropagation()`. Douze événements P/E/Entrée, sur une intro courte et une intro complète sautée, sont absorbés malgré le focus correct. Après `finally`, Entrée ouvre le menu, P change réellement l'état de pause et E atteint la file d'action du moteur. Les états d'entrée injectés, l'absence de démarrage de mission et l'absence de Chromium sont explicitement déclarés dans le reçu de reproduction.

Le pilote attend désormais le **détachement effectif de `#intro-v188` avant de cliquer sur `#title-start`**, lors de l'import initial et des deux reprises. Attente et clic partagent les 45 secondes déjà accordées à cette entrée ; le budget séparé de disponibilité du moteur reste inchangé. L'attente précède `#operation-launch`, donc le projectile sauvegardé ne progresse pas pendant celle-ci. Aucune temporisation fixe, touche supplémentaire, affectation directe de pause ou modification du runtime n'est ajoutée. Les assertions sur les bombes, les impacts, les remboursements, les résultats et la sauvegarde restent identiques.

Les **deux nouvelles régressions passent** (8,07 s) et la suite Legacy complète passe **25/25** (16,19 s), sans échec ni cas ignoré. Le test exécute par AST les instructions Python finales aux trois sites, avec le véritable `playIntroV188`, un checkpoint et la pause du moteur de production. Un adaptateur explicite représente l'enchaînement immédiat menu/lancement ; les timers de l'intro restent réels. Le mutant privé de la seule attente échoue : clic avec overlay encore présent, P absorbé, pause inactive et projectile déplacé. L'expiration du budget est également vérifiée : aucun lancement n'a lieu. Ce montage valide le contrat d'entrée et son effet sur le projectile ; ce n'est pas un parcours Chromium de l'interface complète.

Le contrôle AST conserve **15 fonctions existantes à l'identique**. Dans les trois fonctions raccordées, seule l'instruction d'entrée du titre change. La syntaxe Python et `git diff --check` passent. Les deux empreintes de ce correctif sont ajoutées au seul bloc de succession du quai, sans réécriture des reçus historiques.

Le menu titre ne reçoit pas de nouveau correctif : son rapport Chromium sur P réussit **18 cas ordinateur/mobile, 128 contrôles et 36 captures**, sans erreur de page, réseau ou HTTP. Ses 18 traces observent l'introduction déjà retirée avant Entrée ; elles prouvent ce passage, sans expliquer rétrospectivement l'ancien échec du menu mobile. Le rapport de rechargement associé réussit **470 contrôles et 282 captures**.

### Forge NPC : entrée avant reprise du checkpoint

Le rapport Forge NPC de P passe **17 contrôles** et restaure exactement le checkpoint de la salle `b`. L'interaction suivante est admise, avec le bon PNJ et le focus du canvas, mais ne produit pas de dialogue. Les sept lignes de trace contiennent l'armement, le keyup E dans les phases observées et la collecte ; aucun keydown n'y figure. Le traceur est enregistré après le listener d'introduction et ne relève pas sa phase. Cette observation est compatible avec une interception antérieure, sans suffire à identifier avec certitude son propriétaire distant.

Le pilote attend désormais le détachement de l'introduction dans sa seule fonction `enter_forge`, avant d'ouvrir l'éditeur et de reprendre le playtest. Toutes les opérations d'entrée partagent les **45 secondes** existantes. Le contrôle de reprise, les **22 expressions de vérification** et les autres fonctions restent identiques à P ; aucun retry E n'est ajouté.

Les **deux nouveaux tests passent** et la suite Forge NPC complète passe **31/31**, sans échec ni cas ignoré. Le test parcourt les vrais dialogues et la porte du plan, sauvegarde son checkpoint, le reprend puis envoie une seule touche E devant le PNJ au dialogue terminé. Les deux entrées du menu sont couvertes. L'introduction et ses timers sont réels ; le DOM/Image/RAF et l'adaptateur immédiat éditeur/reprise sont déclarés. Le mutant privé de la seule attente reprend pendant le fondu, absorbe E et n'ouvre aucun dialogue. Le cas d'expiration ne clique pas et ne reprend pas le checkpoint. Historique, inventaire, objectif, temps narratif et octets du checkpoint sont conservés.

### Campagne QZ-18 : rouvrir le débrief après les deux films

Le rapport campagne de P passe **14 contrôles**, dont la sortie physique, les six pièces du dossier, le versement du protocole et le retour à bord sans second paiement. Il s'arrête ensuite sur le panneau de débrief absent. L'état et la capture expliquent cette absence : le hook natif a reconnu le retour QZ-18, effacé son ancien plan puis lancé **CIN-20 « Treize minutes » et CIN-20-rook « La signature »**. Le plan recommandé est devenu QZ-17. L'archive QZ-18, son succès et son reçu de deux unités de recherche existent toujours ; le renderer réserve volontairement son débrief au plan QZ-18.

Un helper est appelé uniquement après le premier retour victorieux. Il vérifie le propriétaire de l'opération et de l'archive, utilise les deux boutons publics de passage, attend leurs deux reçus `cinematicsSeen` et l'absence finale d'overlay, puis efface le filtre de destination et sélectionne QZ-18 par les contrôles publics. Ces actions et l'apparition du débrief partagent **30 secondes**. L'intervalle temporaire sans overlay entre les deux Promises n'est pas pris pour une fin complète. Aucune sauvegarde ou donnée runtime n'est directement écrite par le pilote.

Les **21 fonctions existantes**, les **28 expressions `check(...)`**, les autres `open_plan` et la sélection volontaire d'un autre plan restent inchangés. Les **deux nouvelles régressions passent** et la suite campagne complète passe **31/31**, sans échec ni cas ignoré. Trois états de lecture des films sont couverts, ainsi que le refus d'un autre reçu et d'un film étranger. Le mutant sans sélection QZ-18 termine les deux films mais conserve le mauvais plan ; celui sans étape Rook conserve son overlay. Les deux échouent dans le même budget, sans altérer l'archive, le paiement ou les lectures.

La fixture part du résultat du vrai moteur, exécute les fonctions complètes de l'application pour le retour, la chaîne de films, les handlers de sélection et le renderer de débrief, puis le bloc Python final extrait par AST. DOM, Canvas, navigation, décor des panneaux non concernés et horloge sont explicitement représentés par l'hôte. Elle ne constitue pas un parcours Chromium complet.

### Qualification distante et validation consolidée

Le Cocon de P réussit **9/9 contrôles**, avec sept captures référencées : coupe progressive, pause, sauvegarde native, rechargement exact, libération douce puis libération forcée lors d'un lancement indépendant. Le rapport ne contient pas d'erreur de page, réseau ou console. Cette qualification concerne la présentation procédurale et la libération observées ; elle ne clôt pas toute la campagne étendue ni un corpus bitmap supplémentaire.

Les trois suites de pilotes distinctes totalisent **87/87 contrôles**, dont **six nouvelles régressions** : Legacy 25/25, Forge NPC 31/31 et campagne 31/31. Leurs prédécesseurs, les blocs de succession historiques et les trois sources artistiques gelées restent identifiés séparément. Le premier candidat local et son équivalent API ont été conservés sans publication ; les diagnostics P ont été intégrés avant la validation complète du candidat final.

Les parcours distants ci-dessus exécutent le merge de PR `fe3bcd50c230e29026513fafc8e434e2f614d762`, build `143.0.0+fe3bcd50c230`, associé à P `ee565717`. Le run Full release `44097168342` a conservé son artefact ; les rapports récupérés sont contrôlés par CRC et SHA-256. Ses échecs campagne et Forge, ainsi que l'échec Trials V163, gardent leurs résultats propres. Les validations locales du candidat final et sa nouvelle CI sont consignées séparément dans la PR #49. **T028 reste ouvert** : ces régressions locales ne remplacent pas les reprises Chromium complètes des trois pilotes corrigés.

## Fidélité et suite du projet

Les identités et accessoires sont ceux du projet. La fidélité attestée concerne leurs octets d’origine, leurs proportions, leurs appuis, leur orientation et leur raccord aux consommateurs actifs. Le lot ne certifie pas une reproduction canonique externe « 1:1 » et ne clôt pas l’ensemble des contenus proposés dans la bible.

Le lot prologue, ses onze générations, ses 28 définitions de scénarios et ses reçus restent historiques. Le quai réemploie quatre de ces images ; il ne porte pas le total des générations à quinze. La Matriarche de Soute dédiée, le MANTA-6, les poses HADAL et les autres besoins animés restent suivis séparément.
