# V86 — Audit des objets posables et contrat de rendu

Audit en lecture seule des images le 2026-09-13, base Git `ce0a59c`. Le module de rendu V86 est ajouté séparément ; aucun PNG existant n'est réécrit. Ce document ne certifie ni toutes les promesses du système posable, ni une fidélité visuelle 1:1, ni une animation nouvelle complète.

## Source et périmètre

Conversation ChatGPT **Créer items gameplay posables**, thread `6a9e045a-917c-83ed-bea1-f95506cdeb19`, tour `d368d638-18b0-4b25-a9fb-c0a3c3c21e6b`, réponse `a6520ca6-ead5-4588-814b-06b8f2018715`. Le retour `read_thread` plafonne ici à 20 000 caractères et indique `truncated:true`, même si la pagination indique `hasMore:false`. Les sections T01, T07, B01 et B03 ont été lues ; ce retour tronqué n'est pas une archive intégrale.

La source demande une forme transportée, une installation, un état opérationnel et une récupération conservant usure et ressources. B03 demande expressément un panneau blindé sur roues avec poignées arrière et stabilisateurs. Ces objets ne peuvent pas être remplacés silencieusement par une caisse de décor ou par un autre véhicule.

## Quatre plaques existantes réellement mesurées

Chemin commun : `assets/openai/sprites/normalized/tools/`. Toutes sont des PNG **512×512, RGBA 8 bits, 2×2 cellules de 256×256**, quatre silhouettes distinctes, alpha minimum 0 et maximum 255. Mesures de silhouette au seuil alpha **>16**. Aucune cellule vide/coupée ; garde minimale de silhouette au moins 16 px. L'alpha léger de bord est conservé, sans seuillage destructif.

| ID / fichier | Pixels entièrement transparents | Contact Y source par cellule 0/1/2/3 | Échelle uniforme | Empreinte physique V86 |
|---|---:|---|---:|---|
| `equipment-020-portable-sentry` / `portable-sentry-use-sheet.png` | 66,07 % | 183 / 233 / 235 / 189 | 0,32 | 72×70 |
| `equipment-024-cryo-mine` / `cryo-mine-use-sheet.png` | 71,01 % | 183 / 183 / 184 / 184 | 2/7 | 64×34 |
| `equipment-026-electroshock-trap` / `electroshock-trap-use-sheet.png` | 67,91 % | 191 / 209 / 204 / 186 | 2/7 | 64×48 |
| `equipment-028-portable-quarantine` / `portable-quarantine-use-sheet.png` | 67,11 % | 183 / 226 / 187 / 183 | 3/7 | 96×84 |

Les contacts sont les bornes inférieures **exclusives** des silhouettes. L'ancre X vaut 128. Le renderer place ce contact exactement sur `instance.y + instance.h`, conserve la même échelle X/Y et ne refait pas un ajustement de taille par pose. Les limites détaillées et les SHA-256 des images originales sont verrouillés dans `src/placeables-visual-v86.js` et décodés depuis les PNG réels dans `tests/placeables-visual-v86.test.mjs`.

Les douze IDs explicites de `PLACEABLE_CATALOG_V86` sont acceptés via `getPlaceableDefinitionV86`, jamais par modulo : bases 020/024/026/028, grades Field 050/054/056/058 et Military 080/084/086/088, avec leurs suffixes exacts. Leur identité de catalogue est conservée ; ils partagent ces quatre dessins, sans prétendre disposer d'une finition individuelle. Un ancien stock consommé sans `onGround:true` n'est pas dessiné à l'origine du niveau.

Les deux pièges ont chacun une seule composante principale par cellule. La sentinelle possède trois pixels isolés supplémentaires dans la cellule 2 ; le confinement en possède un dans la cellule 1 et onze dans la cellule 3. Aucun de ces quatre fichiers n'a de grand rectangle de fond blanc opaque. Leurs quelques pixels clairs ne doivent pas être confondus avec un fond à supprimer automatiquement.

## Fidélité et états : limitations explicites

- **Portable Sentry** : petite sentinelle de conception/adaptation projet, distincte de l'UA 571-C. Le canon est dessiné vers la **gauche**, alors que l'ancien manifeste déclarait `right`. Correction de facing strictement locale au renderer V86 ; aucun changement des autres sprites. La caméra est en trois-quarts : réutilisation de l'art existant, **pas une nouvelle vue orthographique**.
- **Cryo Mine** : disque à accents bleus, objet original du projet. Vue d'inventaire plongeante en trois-quarts, pas une projection latérale stricte. Ne remplace pas la mine explosive M01 de la nouvelle liste.
- **Electroshock Trap** : profil latéral, électrodes vers la droite. VFX électriques séparés de la machine ; aucune explosion ou décharge ajoutée arbitrairement à la plaque.
- **Portable Quarantine** : coffret/cadre physique vide, avec pieds et antenne dans la cellule 1. Ne devient pas une image étirée couvrant toute la zone logique de ralentissement ; ne constitue pas la preuve d'une cage capturant un adulte ou d'un bouclier invulnérable.

Le contrat V56 nomme les cellules `packed`, `ready`, `use`, `spent`, mais elles sont **quatre états fixes**, pas une séquence fluide. V86 ne les boucle pas au titre d'une animation d'installation.

Correspondances rendues :

- Tâche réelle d'installation en cours : cellule 0 repliée, avec progression UI issue du moteur. Inventaire porté sans tâche : pas de copie autonome dessinée au sol.
- Sentinelle posée : cellule 1 ; cellule 2 seulement pendant `firingClockV86>0` après un vrai tir. À sec ou détruite : reste déployée, avec texte de ressources/hors service ; cellule 3 est une **valise repliée**, donc pas un état automatique « vide ».
- Pièges armés : cellule 1. Déchargés/détruits : cellule 3. Aucun flash ne prouve une action qui n'a pas eu lieu.
- Confinement actif : cellule 1. Désactivé : cellule 2, coffret fermé conservant ses pieds ; pas de récupération fictive par changement de case.
- Récupération en cours : l'objet déployé reste visible une seule fois jusqu'au commit du moteur. Pas de remise à neuf ni de mutation des ressources par le renderer.
- Détruit : bitmap atténué et mention **HORS SERVICE**, sans prétendre disposer d'une animation dédiée de destruction.

## UA 571-C : présente, mais non promue dans ce renderer

`assets/openai/sprites/normalized/weapons/ua-571c-sentry-gun-action-sheet.png` existe : 1024×1024 RGBA, 4×4, 16 poses, 80,86 % de transparence. SHA-256 `c376ad9e07d1bfbe0b8fb63575bc636fa49eae10b5adfcdaac1f8821fd104e8a`.

L'audit visuel et les composantes connexes révèlent **55–90 petits îlots parasites par cellule**, 65–136 pixels au seuil alpha >16, visibles comme une poussière claire. Le contact réel de la composante principale du trépied change fortement entre lignes : environ Y237–239, Y205–206, Y184, Y174–175. Les bornes alpha générales sont polluées par ces îlots : les utiliser seules comme sol ne suffit pas.

La première ligne est une progression de déploiement, mais le registre générique `weapon-action-v56` la nomme `idle` et la boucle. Le contrat artistique réclame un pivot bas-centre, tandis que le registre lui affecte `weapon-grip (96,144)`. Une intégration naïve produirait changement de pose et glissement vertical. Il faut un dérivé nettoyé réversible, des contacts de composante principale et des clips explicitement réattribués ; ou une nouvelle plaque. **Aucun de ces travaux sur l'UA 571-C n'est revendiqué dans ce sous-lot.**

## Objets toujours manquants

- **B01** : pas de plaque dédiée de barricade basse pliante identifiée.
- **B03** : la nouvelle génération gérée séparément par l'agent principal reste candidate ; elle n'est ni chargée par ce renderer ni présentée comme une barricade jouable.
- **T07** : pas d'affût dédié utilisable avec opérateur et états d'installation/service identifié.
- **T02–T06** : pas de silhouettes et mécanismes dédiés validés pour chaque variante.
- Les quatre équipements réutilisés n'ont toujours pas une animation fluide dédiée de pose, transport par Marine, réparation, rechargement, récupération et destruction.

`metroidvania/props/cargo-cover.png` est une caisse statique (163×97), pas B01/B03. `ua-571-remote-sentry-carrier-action-sheet.png` appartient à un véhicule, pas à un affût T07. L'ancien `interactive-props-animation-sheet.png` contient une autre sentinelle et un flash intégré ; il n'est pas réétiqueté UA 571-C.

## Raccordement et vérifications du sous-lot

Exports : `drawPlaceablesV86(engine,ctx)` en coordonnées monde, `drawPlaceableHudV86(engine,ctx)` facultatif en coordonnées écran, `resolvePlaceableDrawSpecV86` et `PLACEABLE_VISUAL_PROFILES_V86` pour tests et diagnostic. Sources : `engine.placeablesV86.instances`, `engine.placeablePreviewsV86` et `engine.placeableTasksV86` (Maps), `engine.images` pour les atlas déjà préchargés ; cache Image propre au renderer si absent.

Le preview dessine le bitmap puis une empreinte/une orientation/une raison de refus UI. Le cône n'existe que si le moteur fournit une portée et un demi-angle ; pour la sentinelle, contrat communiqué 620 px et π/3, origine logique Xcentre/Y+8 ou muzzle explicite. Ce guide UI n'est pas un remplacement d'illustration ni une modification de la portée gameplay.

Une image absente, non chargée ou de mauvaises dimensions est signalée ; aucune caisse générique, autre arme ou simple rectangle n'est substitué. Le dessin ne modifie pas les états de jeu, positions, PV, charges, munitions, clocks ni tâches. Les tests couvrent les PNG réels, contacts dans les deux sens, états fixes, identité, preview, installation, récupération, manque d'image, destruction explicitement limitée et absence de faux rectangle de déployable.

L'ancien `game-final-runtime.js` de la base auditée dessinait quatre `strokeRect` à des offsets fixes. Le raccordement du moteur V86, la validation navigateur et les règles métier sont des travaux distincts : leur réussite ne se déduit pas de ce seul audit d'art ou de ces tests unitaires.

### Scénario navigateur préparé, pas exécuté par ce sous-lot

`tests/browser-placeables-v86.mjs` crée un contexte et une sauvegarde de QA isolés : prologue terminé, coopération activée, quatre équipements connus, une mission accessible du catalogue. Le parcours utilise les clics/touches natifs pour sélectionner, confirmer, annuler par mouvement, mettre en pause, récupérer, reposer, sauvegarder et reprendre. La pause doit geler une tâche, sans la consommer ni l'annuler.

Deux fixtures explicites sont déclarées dans son rapport, jamais présentées comme une preuve de campagne naturelle : (1) option `QA_CALM_FIXTURE` activée par défaut, supprimant le groupe initial d’ennemis une fois au démarrage de la mission puis une fois à sa reprise, sans modifier plateformes, murs, portes, acteurs alliés ni coordonnées du joueur. Ce scénario isole l’interface ; le combat fait l’objet de tests séparés. (2) Une seule sentinelle réellement installée reçoit `health=37` et `ammo=0` pour vérifier que récupération/repose/rechargement de page conservent ces valeurs. Aucun appel de méthode de pose, récupération, mise à jour, sauvegarde ou tir n'est effectué par `Runtime.evaluate`. Les lectures de snapshot sont des assertions, pas des mutations métier.

Le script ne démarre aucun navigateur/serveur ; il doit être lancé **en série**, sans autre agent prenant le focus, sur le serveur et le CDP préparés par l'agent principal. Défauts visuels connus conservés dans le périmètre : sentinelle/cryomine en trois-quarts et absence de B03 jouable. La syntaxe peut être contrôlée indépendamment ; la réussite du parcours reste à établir par son exécution réelle.

Les résultats ensuite établis par la passe d’intégration du parent sont consignés dans `VALIDATION_V86.md` ; ils ne proviennent pas de ce seul audit d’art.
