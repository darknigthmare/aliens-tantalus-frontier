# Fleuve de la Douleur — qualification du rendu PNG

## État vérifié le 25 novembre 2026

Les adaptateurs et le builder dérivé sont implémentés. La recette Node ciblée a réussi **21 tests sur 21** et couvre les images individuelles, les poses, les identités, les alertes et les interfaces existantes. Le contrôle indépendant du snapshot a confirmé **222 fichiers sur 222**, avec les tailles et SHA-256 du manifeste de récupération.

**La recette Chromium du nouvel habillage n’est pas encore qualifiée.** Playwright Python 1.62.0 est présent localement, mais le lanceur Chromium système n’a pas de binaire. L’installation officielle de Chrome Headless Shell 151.0.7922.34 dans un espace temporaire séparé a échoué avec une réponse HTTP403 du CDN. Aucun autre téléchargement ni modification du lanceur système n’a été effectué. Les anciennes recettes navigateur du DLC v0.9 ne qualifient pas les nouveaux PNG.

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
de travail et les brouillons exclus ne sont pas ajoutés au total. La recette
Chromium ci-dessous doit encore fournir ses propres résultats sur le commit
publié ; l'inspection des pixels ne la qualifie pas.

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

## Recette navigateur préparée

Le parcours normal passe par le bouton DLC du menu hôte, vérifie le wrapper, le décodage des PNG, leurs URL et leurs hashes, puis utilise les commandes normales du DLC. Il effectue un déplacement, un export natif, une sauvegarde par le menu et un véritable rechargement.

Il compare l’état observé avant/après rechargement et les octets du stockage non-DLC. Il vérifie les images dans le panneau équipement, F6, le passage vers l’original et la reprise de l’état enregistré. Le flush natif de départ peut actualiser les slots du DLC ; la recette distingue cette écriture normale d’une modification de l’état par l’habillage.

Ce parcours utilise un profil navigateur neuf. La qualification d’une sauvegarde Frontier déjà remplie relève du parcours séparé `qa-river-of-pain.py`. Les service workers sont bloqués dans cette recette ciblée ; aucune capacité de pré-cache hors ligne n’est affirmée.

Une planche Canvas séparée appelle les mêmes renderers pour chaque image admise, sur un fond quadrillé. Elle vérifie qu’un dessin PNG a été effectué et que l’état de la simulation active est inchangé. Cette planche est une **fixture de présentation**, pas une scène de campagne parcourue.

## Preuves et limites

Chaque exécution écrit `report.json`. Si le navigateur peut exécuter le parcours, elle ajoute une capture du jeu, une planche Canvas identifiée et un export natif aux étapes effectivement franchies. Le statut est `passed`, `failed` ou `blocked` : une absence de navigateur ne devient jamais un succès et ne produit aucune capture. Les rapports ne nécessitent ni secret, ni identifiant de compte, ni URL de téléchargement signée.

La composition doit être revue visuellement avant de conclure sur la fidélité artistique. Des valeurs RGB dans des pixels d’alpha nul ne sont pas un halo visible ; l’image compositée fait foi. Les images sont des poses individuelles et **cette révision n’ajoute aucune animation**. Les mouvements, attaques, morts, raccords et poses absentes utilisent le renderer d’origine. Les armes sans PNG admis conservent leur présentation native.

