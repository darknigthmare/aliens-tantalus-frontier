# Bible de reprise — Alien: Earth, V12

## 1. Périmètre et provenance

La base récupérée est le module **V11, version 11.0.0**, archivé sous `ALIEN_EARTH_DLC_V11_MODULE_COMPLET.zip` : 23 895 722 octets, 180 fichiers, SHA‑256 `c6402939c7e3085609b191848f710cd2efe84c5bfe6547a2cf95ca39494c38f3`.

Les trois fragments de cette archive et leurs reçus existent dans le [dépôt de récupération, au commit fixe 6ed9b9210a097bbdf90ec3a22043a3fe5845e541](https://github.com/darknigthmare/aliens-tantalus-frontier/tree/6ed9b9210a097bbdf90ec3a22043a3fe5845e541/archives/local-recovery-20261125/alien-earth). Cette reprise V12 ajoute des images et prépare un raccord au menu du Tantalus ; elle ne change pas à elle seule le schéma de sauvegarde V11.

Les chiffres suivants décrivent les données du jeu récupérées, inspectées avant l’interruption. Ils ne constituent pas un inventaire exhaustif de tous les éléments de la série.

| Élément du module | Volume observé |
|---|---:|
| Chapitres couvrant la saison 1 | 8 |
| Salles | 70 |
| Connexions logiques bidirectionnelles | 102 |
| Faces de seuil correspondantes | 204 |
| Placements de props | 958 |
| Types logiques de props | 49 |
| Règles | 331 |
| Silhouettes humaines de référence | 25 |
| Personnages jouables | 3 |
| Tâches principales / facultatives | 32 / 38 |
| Archives du jeu | 70 |

L’archive contient 43 captures documentaires, mais aucun PNG de gameplay individuel utilisable comme remplacement direct de sprite. Les huit PNG de ce point de reprise sont donc comptés séparément.

## 2. Personnages et silhouettes

Les personnages jouables de la base sont **Wendy, Joe et Morrow**. Les 25 identifiants de référence sont :

`wendy`, `joe`, `morrow`, `kirsh`, `sylvia`, `arthur`, `curly`, `boy`, `nibs`, `smee`, `slightly`, `tootles`, `siberian`, `rashidi`, `atom`, `yutani`, `zaveri`, `rahim`, `chibuzo`, `shmuel`, `malachite`, `clem`, `petrovich`, `teng`, `sullivan`.

| Personnage | PNG de cette reprise | Limite d’utilisation |
|---|---|---|
| Joe / Hermit | `joe-mcsx-idle.png` | Attente debout avec MCS-X, sans casque. Le fusil est déjà inclus dans l’image. |
| Arthur sain | `arthur-idle.png` | Attente. Bas de tenue déduit faute de référence intégrale. Exclure l’hôte infecté. |
| Les 23 autres silhouettes | Aucun nouveau PNG | Rendu Canvas existant à conserver. |

Leïla, Tao, Mara et Ivo sont des survivants originaux de l’adaptation utilisant la silhouette `civil`. Ils ne doivent pas être présentés comme des personnages attestés de la série.

Pour Joe, la pose fournie ne s’applique ni à la marche, ni à l’accroupissement, ni au conduit bas, ni au portage, ni à l’arme secondaire, ni au costume spécifique du chapitre d’index 6. Chaque état absent doit garder son dessin existant jusqu’à disposer d’une ressource adaptée.

Les vues de face, dos, trois quarts opposés, expressions et animations restent à produire ou à documenter. Une image isolée n’est pas une planche d’animation.

## 3. Créatures et distinctions biologiques

Les huit profils du moteur ne correspondent pas à huit espèces différentes : certains représentent des variantes, des stades ou des hôtes.

| Profil moteur | Placements | Signification / état de cette reprise |
|---|---:|---|
| `tick` | 11 | Species 19 adulte ; un PNG fondé sur un concept officiel Weta. |
| `fly` | 8 | Mouche ; aucun nouveau sprite. La référence de nid ne documente pas l’anatomie adulte. |
| `facehugger` | 8 | Facehugger ; dessin existant. |
| `xeno_maginot` | 4 | Xénomorphe du Maginot ; génération refusée, aucun nouveau PNG. |
| `xeno_neverland` | 1 | Variante de Neverland ; aucun nouveau PNG. |
| `orchid` | 2 | D. Plumbicare, salles R26 et R45 ; un gros plan du leurre ne suffit pas à reconstruire l’organisme entier. |
| `eye_caged` | 1 | Salle R16, parasite dans l’hôte ovin ; ne pas substituer l’œil libre. |
| `eye_host` | 1 | Salle R27, Arthur infecté ; ne pas substituer Arthur sain. |

**T. Ocellus et Eye Midge désignent la même créature. Species 19 désigne la tique. D. Plumbicare désigne l’Orchid.** Ces correspondances doivent rester cohérentes dans les textes et les ressources ; voir les [sources de production](references.md).

Le cycle de Species 19 documenté par Weta distingue œuf, têtard, nymphe, petit et adulte. Le PNG généré concerne uniquement l’adulte à six membres et abdomen allongé. La référence est un concept de production, pas la preuve d’une géométrie finale identique à chaque plan de la série.

Les overlays de confinement, de mousse, d’étourdissement et de télégraphie d’attaque appartiennent au moteur. Remplacer la silhouette ne doit ni les masquer ni changer les boîtes de collision.

## 4. Armement, équipement et interactions

| Identifiant de référence V11 | État fonctionnel observé dans le module |
|---|---|
| `mcsx` | Arme jouable de Joe ; un PNG autonome, plus l’arme incluse dans sa pose d’attente. |
| `wy-pistol` | Pistolet jouable de Morrow. |
| `ksg-al` | Capture / mousse, notamment R62. |
| `cutter` | Outil de Wendy, R58 puis C03. |
| `hook` | Élément de décor R11, non manipulable dans cette base. |
| `radio` | Équipement narratif. |
| `torch` | Lampe, commande L. |
| `tablet` | Tablette interactive. |
| `wy-smg` | Référence visuelle, non jouable dans cette base. |
| `other-firearms` | Regroupement de références ; ne vaut pas inventaire exhaustif. |
| `game-tools` | Outils d’adaptation du jeu, à distinguer des équipements attestés à l’écran. |
| `maxim9` | Arme secondaire de Joe ; munitions partagées de façon abstraite dans le gameplay. |
| `kriss` | Référence visuelle. |

Le nouveau fusil est fondé sur la page **FX Armory**. Aucun remplacement par un M41A n’est prévu sans preuve correspondant à Alien: Earth. Les silhouettes, attaches, emplacements de lampe, couleurs et interfaces lumineuses doivent être vérifiés sur les références accessibles ; le prompt seul ne prouve pas leur exactitude dans le résultat.

Dans la pose complète de Joe, le MCS-X est déjà dessiné. Le raccord doit supprimer le dessin séparé de l’arme pour cette seule pose afin d’éviter un fusil superposé.

## 5. Zoo du Maginot : décor, supports et collisions

Quatre PNG dérivent de la photographie officielle du décor : cylindre de confinement, console murale, table de laboratoire et meuble à vitrages dépolis.

| Ressource | Affectation prévue | Contrainte physique ou de composition |
|---|---|---|
| Cylindre | `R18-0`, `R18-4` | Trois cylindres sur un support continu. Conserver l’emprise existante de 120 pixels et le socle montrant la profondeur. |
| Console | `R18-wall1`, `R18-wall3` | Montage mural dans le rectangle original y210–267. Aucune substitution du meuble de premier plan `R18-1`. |
| Table | `R18-island` | Emprise existante largeur195, profondeur52, hauteur75. La perspective du PNG exige un support cohérent, sans changement de collision. |
| Meuble vitré | Décor mural R18 | Bande envisagée y235–300, centrée x450, hauteur maximale65. À vérifier visuellement avant adoption. |

Le panneau de nom de salle occupe x230–460, y304–372. Le meuble vitré ne doit pas le recouvrir. Il doit aussi conserver l’écart avec la console x530 et la porte x770. Le placement proposé est un point de reprise, pas un placement validé en jeu.

Les cylindres ne remplacent pas globalement tous les objets `cryo` du module : les vrais cryopodes des autres salles restent inchangés. Les changements prévus sont attachés à des identifiants précis, pas à des correspondances vagues de nom.

Les 49 types de props et leurs catégories restent détaillés dans [inventory.json](inventory.json). Le lot de quatre objets ne représente pas l’ensemble des 958 placements.

## 6. Lieux, portes, terrain et véhicules

Les 70 salles et 102 connexions sont une reconstruction de gameplay. Les distances, seuils et raccords ne sont pas des plans métriques certifiés du tournage. La fidélité des lieux exige de distinguer la géographie narrative, les décors attestés et les ajustements nécessaires à la navigation du jeu.

Le module contient des intérieurs du Maginot. Cette reprise ne fournit aucun nouveau sprite extérieur complet du vaisseau, aucune navette pilotable, aucun panorama complet de salle et aucune texture de planète. Les transferts narratifs ne doivent pas être présentés comme des véhicules déjà animés ou pilotables.

Les portes, seuils, passages bas, obstructions et supports visuels doivent rester cohérents avec les volumes de collision existants. La comparaison visuelle porte sur l’image et son emplacement, pas uniquement sur le nom du fichier.

## 7. Contrat de rendu et sauvegarde

Les PNG restent inchangés. Une découpe source par `drawImage` peut retirer le vide transparent en conservant une marge ; elle n’est pas une retouche du fichier. Les bounds mesurés à alpha128 sont fournis dans le manifeste. Certaines sorties gardent une frange semi-transparente : sa perception à l’échelle réelle reste à contrôler.

Le module raster local privilégiait les images embarquées via `globalThis.EARTH_RASTER_INLINE_V12`, puis les URL relatives. Il devait retomber sur le Canvas existant en cas d’absence, de chargement, d’erreur, de dimensions incohérentes ou d’exception de dessin.

Le schéma de sauvegarde reste **11** et l’espace de stockage **`atf.dlc.alien-earth.s1.profile-1`**. Le lancement depuis le menu Tantalus est une intégration de navigation ; ce n’est pas une fusion du moteur Earth dans le moteur natif.

Un bug de sauvegarde V11 a été reproduit et corrigé localement : au titre, `visibilitychange` pouvait remplacer un état existant par l’état initial. Les tests de cette correction avaient réussi. Une seconde précaution reste obligatoire dans le menu hôte : arrêter seulement le moteur Forge à l’ouverture d’Earth pour éviter la persistance involontaire d’une session native. Voir [CONTINUATION.md](CONTINUATION.md).

## 8. Conditions pour déclarer cette reprise intégrée

1. Récupérer ou reconstruire les fichiers locaux de raccord, dont le contenu complet n’est pas archivé dans ce commit.
2. Terminer les huit entrées raster et les trois affectations restantes.
3. Appliquer la correction de préservation de session Forge et actualiser son reçu.
4. Exécuter les tests de source, de sauvegarde, de chargement, de fallback et de placement.
5. Construire la version publique et l’export portable avec les huit PNG.
6. Vérifier dans un vrai navigateur le Zoo, Joe, Arthur sain/infecté, Species 19, les portraits et le catalogue.
7. Vérifier séparément l’entrée et le retour par le véritable menu hôte, avec comparaison des sauvegardes avant/après.
8. Poursuivre les ressources manquantes en suivant les références attestées, une ressource à la fois.

À ce point de reprise, ces conditions ne sont pas toutes remplies. La liste des fichiers réels, leurs empreintes et l’état exact de chaque raccord priment sur toute mention globale « terminé ».
