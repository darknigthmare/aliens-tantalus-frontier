# ALIEN: EARTH — V11.0.0 · Le navire derrière les portes

Module autonome cumulatif pour Aliens: Tantalus Frontier. Cette passe poursuit la V10 et cible en priorité la cohérence spatiale et la fidélité de la saison 1 : lieux attestés, raccords, seuils, équipage du Maginot, silhouettes et dotations. Elle ne fusionne pas son moteur ni ses sauvegardes avec Tantalus/MIRE.

## Jouer

Node.js 20 ou supérieur ; aucune installation de dépendances npm n’est requise pour jouer.

```sh
npm run dev
```

Ouvrir `http://127.0.0.1:4173`. `JOUER_ALIEN_EARTH_V11.html` est aussi un bundle autonome ; le serveur local reste le lancement recommandé.

## Périmètre V11

- **70 lieux jouables** : 32 tâches principales + 38 facultatives ; 70 archives.
- **102 liaisons bidirectionnelles** (204 faces de seuil).
- **958 placements de décor / 49 types logiques**.
- **331 règles de production**.
- **25 silhouettes de référence** et trois points de vue jouables.
- **MCS-X et Maxim 9** distingués pour Joe ; pistolet Maginot pour Morrow ; KSG-AL et lame hérités de V10 ; plusieurs armes de fond restent seulement référencées.

Huit espaces facultatifs complètent cette passe : Medbay One, Engineering Room, chambre de confinement du Maginot, lobby de Neverland, atrium de Neverland, Talking Room, baie médicale de Neverland et laboratoire sécurisé/salle des œufs. Les noms ou fonctions sont appuyés par des références de production lorsque possible ; **leur adjacency et leurs dimensions restent des reconstitutions jouables lorsqu’aucun blueprint métrique public n’est disponible**.

## Portes et raccords

Les nouveaux seuils sont réciproques, adossés à une structure et leurs arrivées sont recalculées hors collision. L’audit `docs/v11/DOOR_AUDIT_V11.json` couvre l’ensemble des seuils et ne signale aucune incohérence structurelle dans la géométrie livrée. Cela certifie le jeu, pas l’exactitude métrique du plateau de tournage.

Les transferts géographiques ou temporels restent des transferts narratifs explicites ; ils ne sont pas maquillés en porte physique vers un lieu distant.

## Apparences et équipement

Le registre de référence présente 25 silhouettes stylisées distinctes, dont l’équipage secondaire du Maginot ajouté en V11. Elles évitent les substitutions génériques de personnages nommés, mais **ne sont pas des portraits photoréalistes ni des scans des acteurs**. Coiffures, palettes et accessoires sont affinés d’après les références disponibles.

Joe commence au MCS-X et peut passer au Maxim 9 avec **6**. Les deux ont des silhouettes séparées ; le Maxim partage encore la réserve abstraite de munitions du moteur. Morrow conserve un pistolet de bord de type Glock/P80 modifié. Le KRISS Vector est référencé dans le registre mais n’est pas encore jouable. Les sondes, sentinelles, pièges et autres outils ajoutés par le module restent explicitement des inventions de gameplay.

## Fidélité : limite explicite

**La fidélité 1:1 totale n’est pas déclarée.** Restent notamment à relever ou produire : blueprint métrique complet de tous les décors, inventaire image par image de chaque pièce secondaire, toutes les armes/accessoires de fond, toutes les variantes de tenues/blessures, visages/animations photoréalistes, chorégraphies et caméras scène par scène, et continuité 3D extérieure complète de New Siam/Neverland.

`docs/AUDIT_FIDELITE_ALIEN_EARTH_V11.html` sépare les lieux attestés, les adaptations et les écarts. `docs/CODEX_ALIEN_EARTH_V11.md` décrit les 70 lieux et leurs raccords. Les sources et limites sont intégrées au registre du jeu et au dossier `docs`.

## Commandes principales

Q/D ou A/D : déplacement ; Z/S ou W/S : profondeur ; E : interaction/maintien ; F : dégagement ; J : tir/attaque ; R : recharger ; V : résonance ; L : torche ; C : accroupi ; Maj : courir. Tab : carte ; K : codex ; I : sac ; O : journal ; Échap : pause ; F6 : présentation classique/hybride.

B : balise ; U : soin ; N : observation ; X : verrou ; M : réparation ; G : écoute ; P : portage ; H/Y : regrouper/attendre ; T : rassurer. 1 : sonde ; 2 : récepteur ; 3 : enquêtes ; 4 : sentinelles ; 5 : références ; **6 : MCS-X ↔ Maxim 9 pour Joe** ; 7 : mousse KSG-AL.

## Migration

Exporter d’abord la sauvegarde V10. V11 accepte les schémas 1 à 10, sans attribuer gratuitement les nouvelles tâches, archives ou salles facultatives. Ne pas rouvrir ensuite une sauvegarde V11 dans une ancienne version.

La persistance après fermeture complète du navigateur n’a pas pu être certifiée dans l’environnement de livraison : les tests navigateur utilisent le bundle autonome chargé dans une page opaque car la navigation locale par URL y est bloquée. L’import/export réel via sélecteur de fichier a été vérifié.

## Lanceur facultatif Tantalus

Sur une copie du projet hôte :

```sh
node scripts/install-alien-earth.mjs /chemin/vers/aliens-tantalus-frontier
node scripts/install-alien-earth.mjs /chemin/vers/aliens-tantalus-frontier --apply
```

Sans `--apply`, simulation seulement. Pour désinstaller :

```sh
node scripts/install-alien-earth.mjs /chemin/vers/aliens-tantalus-frontier --uninstall --apply
```

L’installateur refuse un ancien lanceur V1–V10 encore installé. Il ajoute uniquement une entrée vers ce module autonome ; il ne migre rien vers le moteur ou les sauvegardes de Tantalus.

## Validation

```sh
npm run data
npm run build
npm test
npm run test:campaigns
npm run test:browser:regression
npm run test:browser
```

Les tests moteur, campagnes et navigateur sont complémentaires. Les campagnes sont automatisées, IA active et ressources limitées, mais le bot connaît les données du niveau : ce ne sont pas des parties humaines à l’aveugle.

Aucun push GitHub ni déploiement Vercel n’est effectué par ce paquet.
