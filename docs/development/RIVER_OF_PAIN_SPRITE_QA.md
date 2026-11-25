# Fleuve de la Douleur — qualification du rendu PNG

## Lot 2 — 70 PNG admis

Le deuxième lot ajoute **28 PNG individuels** au lot de 42 intégré par la PR 62.
Le manifeste de production et son index de distribution contiennent désormais
**70 entrées**. Les 28 nouvelles images occupent **48 930 500 octets** ; les 70
fichiers totalisent **119 761 742 octets**. Les images complètes sont conservées
sans découpe, redimensionnement ni réencodage par script.

### Qualification locale du 25 novembre 2026

- **49 tests Node réussis sur 49** : 28 tests de sprites et 21 tests d'intégration
  et de lancement.
- **70 PNG décodés sur 70**, tous RGBA avec une seule image et un vrai canal
  transparent ; aucune erreur d'inspection.
- Aucun bord touché à alpha >= 200. La seule alerte à alpha >= 16 reste celle
  du PNG historique de Bronagh, déjà documentée dans le bilan du lot 1.
- **222 fichiers récupérés, neuf archives historiques et 42 PNG du lot 1**
  identiques à leur base ; les cinq points d'entrée hôte contrôlés sont inchangés.

Les sept nouveaux contrôles Node comparent les enveloppes aux appels Canvas
du moteur natif. Ils couvrent **122 instances décoratives** admissibles et
**huit instances physiques** dont le dessin natif complet est conservé.
L'identité et le type doivent correspondre à une vraie entrée de la pièce ;
les consoles ou radios synthétiques des interactions ne deviennent pas des décors PNG.

L'image entière est ajustée uniformément dans l'enveloppe native, sans étirement.
Le centre et le bas de ses bornes alpha >= 16 conservent la hauteur des montages
muraux, des pieds ou des roues. Les quatre inscriptions `UNITÉ OBSTÉTRICALE`,
`FIRE`, `STOCK` et `!` restent natives. Le test de légende capture le style
au moment de `fillText` et vérifie sa restauration au moyen d'une vraie pile
de styles simulée. Retirer la paire `save/restore` est détecté par ce contrôle.

Les vitrages du capot obstétrical et de la vitrine ont été régénérés après
détection d'un fond peint presque opaque. Les fichiers retenus contiennent un
véritable alpha partiel ; les cadres et le mobilier intérieur restent visibles.
Leurs brouillons exclus et leurs prompts exacts sont consignés dans
`GENERATION_LOG.json`. Les reflets ont été examinés sur fonds contrastés.

### Revue indépendante des compositions

Les 28 types ont été composés avec les véritables méthodes Canvas, dans une
fixture isolée : 130 instances examinées, 122 dessins PNG et huit exclusions
physiques comparées pixel à pixel au rendu natif. Les enveloppes et ancrages
sont respectés, sans modification de la simulation. Les inscriptions STOCK
et ! sont lisibles sans doublon ; les vitrages corrigés ont été revus sur
fonds contrastés.

La revue a demandé un cartouche plus haut pour FIRE. Le PNG a été régénéré,
puis les neuf armoires incendie ont été contrôlées de nouveau avec la version
finale : aucune erreur, aucun avertissement et légende entièrement contenue
dans le cartouche. La position native du texte est conservée. Les 27 autres
PNG ont des empreintes inchangées ; ce contrôle ciblé ne prétend pas être un
second rendu complet des 28 types.

### Empreintes du résultat construit

| Fichier | SHA-256 |
| --- | --- |
| Manifeste des 70 images | `21d9717d8f3956bb0131e1e9809fec67deaa50307314054169d5c2d11f71194d` |
| HTML dérivé, 936 928 octets | `1975c08689f91fa347e0f3ff5310b8f159880df75b1d07130d805d5e951fa175` |
| Standalone original conservé | `91ae538879b939018cea5dc3ba2eb9e45faea7693fdd952efbe8531b33cdfced` |

Le workflow DLC exécute séparément les parcours Chromium HTTP et `file://`
sur le commit proposé. Les contrôles locaux ci-dessus ne sont pas un résultat
navigateur. La composition de tous les PNG utilise une fixture identifiée ;
elle ne constitue pas un parcours complet de toutes les missions.


## Historique du lot 1 — état vérifié le 25 novembre 2026

Les adaptateurs et le builder dérivé sont implémentés. La recette Node ciblée a réussi **21 tests sur 21** et couvre les images individuelles, les poses, les identités, les alertes et les interfaces existantes. Le contrôle indépendant du snapshot a confirmé **222 fichiers sur 222**, avec les tailles et SHA-256 du manifeste de récupération.

La première CI Forge du lot a révélé une dépendance de chargement dans sa
copie partielle du dépôt : importer la politique de distribution tentait de
charger le dossier visuel absent. Ce défaut a été reproduit avec les quatre
fichiers de scripts et de manifeste nécessaires, sans aucun fichier du DLC.
L'admission s'appuie désormais sur un index exact de chemins PNG et de SHA-256
dans le manifeste des scripts. Avant toute copie, la construction exige le
véritable manifeste visuel, son empreinte exacte, sa validation complète et
l'égalité de sa liste avec cet index. Les liens symboliques, fichiers absents,
chemins non admis et index désynchronisés restent refusés.

Les **21 tests d'intégration et de lancement** passent, dont deux nouvelles
régressions pour cette copie partielle et les désynchronisations de manifeste.
Avec les 21 tests de rendu, les trois suites ciblées totalisent **42 réussites**.
Ces contrôles locaux ne constituent pas une réussite de la CI complète du
nouveau commit. La correction de la copie partielle doit aussi passer dans
le véritable workflow Forge.

### Première qualification Chromium publiée

Le [run DLC 45689142393](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/45689142393)
a réussi pour la PR au head `5ce9d153f2542f048181ca2929fa8b332f93937d`
(merge de test `8271dbcc79e7159cede67683f3aeb695ec882935`). Il utilise
Playwright **1.57.0** et Chromium **143.0.7499.4**. Les rapports téléchargés
ont confirmé :

- **111 contrôles réussis** pour le nouvel habillage : les 42 PNG sont
  réellement décodés, leurs octets vérifiés et leur composition exercée ;
  le parcours couvre équipement, sauvegarde, rechargement, export,
  retour par F6 et passage vers la version d'origine ;
- **26 contrôles réussis** pour le parcours hôte/DLC et la préservation
  d'une sauvegarde Frontier existante ;
- **15 contrôles réussis** pour l'URL du wrapper sans barre finale ;
- aucune erreur de page dans les trois rapports, et réussite des étapes
  `npm run check`, `npm run build`, `npm run check:built` et du contrôle
  d'absence de modification des sources par la construction.

Le HTML dérivé testé a pour SHA-256
`8e3e1c5e879c1788d5d34899f0a6e039de4a590fc1e11e652815b1b6aa5e5511`.
L'artefact `river-of-pain-integration-evidence` de ce run a pour SHA-256
`106c5e7227b557ef5fb7dc8ceb462286a3a54305c73ea7c1b2be55595d723469`.
Ces résultats qualifient ce run précis ; le workflow relance ces parcours
sur chaque nouveau commit et ajoute désormais l'ouverture directe
`file://`. Le résultat de cette dernière ne doit pas être déduit du
parcours HTTP.

Localement, le lanceur Chromium n'a pas de binaire et l'installation
officielle a répondu HTTP 403. Cette exécution locale reste bloquée ; les
résultats Chromium ci-dessus proviennent réellement de GitHub Actions.

## Inspection des 42 fichiers sélectionnés

L'inspecteur en lecture seule a décodé **42 PNG sur 42**, sans erreur. Tous
possèdent un canal **RGBA**, une seule image et des pixels entièrement
transparents. Le total des fichiers sélectionnés est de **70 831 242 octets**.
Leurs SHA-256 et leurs bornes utiles à alpha >= 16 correspondent aux 42
entrées du manifeste ; les ancrages sont contenus dans ces bornes.

Les dix derniers résidents conservent la hauteur native
`0.78 * resident.height + 29`. Le centre horizontal de leurs pieds est mesuré
sur la bande inférieure de 10 % de la silhouette à alpha >= 200 ; leur ligne
de sol suit le dernier pixel des bornes à alpha >= 16. Leurs dix fichiers
ne touchent aucun bord à ces deux seuils. Les PNG sont identiques à leurs
fichiers de génération, sans redimensionnement, découpe ni réencodage.

Une alerte reste documentée pour Bronagh : **20 pixels de faible alpha**
atteignent le bord inférieur au seuil 16. Aucun pixel n'y atteint le seuil
200 ; les semelles opaques restent dans le canevas. Aucun des 42 PNG ne
touche un bord à alpha >= 200. Ce contrôle géométrique et la revue des images
isolées ne remplacent pas l'observation des compositions en jeu.

Le rapport d'inspection comporte une entrée par PNG sélectionné. Les copies
de travail et les brouillons exclus ne sont pas ajoutés au total.

Une revue de composition indépendante a également dessiné les 42 images
avec les véritables méthodes de rendu : 42 dessins PNG, aucun repli natif
involontaire, aucun changement de la simulation isolée et aucun PNG source
modifié. Quatre planches ont été examinées : personnages, résidents avec
outils, inventaire, créature et décors. Les pieds, les silhouettes entières,
les tailles relatives des enfants et les outils uniques des résidents sont
cohérents ; le vitrage est translucide et surélevé à son ancrage mural.
Cette fixture utilise pngjs pour décoder les octets vers un Canvas Skia,
dont le décodeur direct refusait les PNG ; la cause précise de ce refus
n'est pas établie. Elle qualifie la composition, pas un parcours navigateur.
Le décodage Chromium est établi séparément par le run cité plus haut.

## Commandes reproductibles

```sh
node --test scripts/verify-river-of-pain-sprites.mjs
node scripts/build-river-of-pain-visuals.mjs
python3 scripts/verify-river-of-pain-sprites-browser.py --root dist --output /tmp/river-sprites-browser
```

Le script accepte `--executable /chemin/vers/chromium`. Sinon, il utilise `ATF_CHROMIUM_EXECUTABLE` ou le navigateur installé par Playwright. `--dlc-only` couvre le wrapper et le DLC sans qualifier le menu hôte. `--file-only` ouvre directement le HTML dérivé, sans wrapper ni hôte. Les résultats doivent rester hors du dépôt et de la distribution.

## Périmètre de la suite Node

Les tests exécutent les véritables modules Canvas et leurs enveloppes dans des contextes JavaScript isolés. Un faux décodeur contrôlé permet de tester le raccordement sans attendre les PNG de production. Un véritable PNG minuscule contrôle séparément la lecture des fichiers, les dimensions déclarées et le rejet d’un SHA incorrect.

Les assertions portent sur l’ancrage au sol, les échelles et le miroir, le dessin de l’image entière, les replis après erreur, les poses non couvertes, l’interdiction d’un M41A illustré quand le M240 est équipé, et l’identité des résidents reçue par `appearance.id`. Elles conservent les alertes de préparation d’attaque, de frappe contre un volet et d’entrée dans une gaine.

Trois régressions provoquent une exception dans `drawImage` du contexte Canvas
de test pour un personnage, un résident et une caisse non collisionnable
réellement présente dans les données. Le même scénario complète le test de
créature existant. Chaque cas compare le repli à un runtime natif indépendant
sans PNG : une seule géométrie complète doit être dessinée, avec outil et
labels lorsqu'ils s'appliquent, après restauration de toute la pile Canvas.
L'image défaillante passe en erreur et n'est pas redessinée à l'image suivante ;
la simulation, les objets et les sauvegardes restent inchangés. Ces exceptions
sont des injections déclarées dans la doublure Canvas, pas des pannes observées
en Chromium. Le correctif du rendu de créature tient également compte du
booléen d'échec, afin qu'une erreur d'image ne fasse pas disparaître son corps.

Pour les douze profils sans arme, les appels du renderer natif sont identiques en pose debout `idle` et `stowed` : les mains restent vides et les bras baissés. Un portrait immobile `stowed` peut donc reprendre son image `idle` si aucune image `stowed` explicite n’existe. Le test compare cette géométrie native pour chacun des douze profils et vérifie que ce raccord ne s’applique ni à l’accroupissement, ni au mouvement, ni aux Marines. Brackett et Paris exigent toujours une image correspondant exactement à leur pose et à leur arme ; une image sans arme ne remplace pas un Marine équipé.

Les douze résidents d’arrière-plan ont un chemin distinct, qui conserve leur identité et leur accessoire professionnel. Le champ optionnel `accessory` signifie que l’outil est déjà peint dans le PNG. Il doit correspondre exactement au `def.tool` natif du résident et ne s’applique qu’à `category: person`, `pose: idle`, `weapon: none`. La validation refuse les outils incorrects, les autres personnages et les poses incompatibles. La table d’admission est confrontée aux douze définitions du fichier de données original.

Seul un dessin PNG réussi par `P.resident` supprime son second outil vectoriel. Les labels de proximité, leurs positions, le message d’alarme et l’inscription dans le passage trié en profondeur restent natifs. Mouvement, posture recroquevillée, image non décodée ou dessin refusé réactivent intégralement le personnage et l’outil d’origine. Les tests comparent les appels natifs sur ces replis et contrôlent les douze accessoires, sans modification de la simulation ni des méthodes générales du contexte Canvas.

Les tests d’interface appellent les vraies fabriques `ROP_LIFE_UI` et `ROP_FIDELITY_UI`. Ils contrôlent les images près des noms et des compteurs sans changer quantités, droits d’usage ni boutons désactivés. Les huit types d’objet sont couverts entre poches et réserves : la balise sonore est fabriquée, tandis que la ration se consomme dans une réserve et n’est pas inventée comme un stock porté.

Les huit œufs fermés du caveau utilisent `sealed-egg`. L’emprise `egg-bed` conserve sa géométrie ; un œuf vertical n’est jamais étiré sur ce sol. Un éventuel décor de sol dédié doit être large et reste limité à l’emprise physique. Le spécimen servant de couverture conserve son dessin d’origine. Le cadre vitré d’isolation reçoit le même relèvement de 53 unités que les fenêtres vectorielles natives, au même ancrage x/z ; il n’est pas placé comme une porte.

Le helper `renderRiverOfPainVisuals` recompose le résultat canonique sans écriture. Le builder écrit seulement le HTML dérivé, vérifie l’original et laisse les scripts du modèle intacts. Le manifeste et les scripts sont inline ; les PNG utilisent le dossier relatif `assets/`.

## Parcours navigateur reproductible

Le parcours normal passe par le bouton DLC du menu hôte, vérifie le wrapper, le décodage des PNG, leurs URL et leurs hashes, puis utilise les commandes normales du DLC. Il effectue un déplacement, un export natif, une sauvegarde par le menu et un véritable rechargement.

Il compare l’état observé avant/après rechargement et les octets du stockage non-DLC. Il vérifie les images dans le panneau équipement, F6, le passage vers l’original et la reprise de l’état enregistré. Le flush natif de départ peut actualiser les slots du DLC ; la recette distingue cette écriture normale d’une modification de l’état par l’habillage.

Ce parcours utilise un profil navigateur neuf. La qualification d’une sauvegarde Frontier déjà remplie relève du parcours séparé `qa-river-of-pain.py`. Les service workers sont bloqués dans cette recette ciblée ; aucune capacité de pré-cache hors ligne n’est affirmée.

Une planche Canvas séparée appelle les mêmes renderers pour chaque image admise, sur un fond quadrillé. Elle vérifie qu’un dessin PNG a été effectué et que l’état de la simulation active est inchangé. Cette planche est une **fixture de présentation**, pas une scène de campagne parcourue.

## Preuves et limites

Chaque exécution écrit `report.json`. Si le navigateur peut exécuter le parcours, elle ajoute une capture du jeu, une planche Canvas identifiée et un export natif aux étapes effectivement franchies. Le statut est `passed`, `failed` ou `blocked` : une absence de navigateur ne devient jamais un succès et ne produit aucune capture. Les rapports ne nécessitent ni secret, ni identifiant de compte, ni URL de téléchargement signée.

La composition doit être revue visuellement avant de conclure sur la fidélité artistique. Des valeurs RGB dans des pixels d’alpha nul ne sont pas un halo visible ; l’image compositée fait foi. Les images sont des poses individuelles et **cette révision n’ajoute aucune animation**. Les mouvements, attaques, morts, raccords et poses absentes utilisent le renderer d’origine. Les armes sans PNG admis conservent leur présentation native.

