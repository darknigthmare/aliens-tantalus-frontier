# V81 — Audit level design, placement et cohérence du Proving Ground

## Verdict

L’annexe Proving Ground V71 était une salle traversable, mais son service restait une interaction abstraite : activer une station pouvait armer un bonus sans exercice. V81 corrige ce défaut par une boucle spatiale avec console, déplacement jusqu’à une ligne de tir, trois angles, projectiles, cibles animées, rechargement et résultat.

Le sous-niveau est cohérent comme stand de qualification M41A. Le hub complet reste `PARTIAL` : cette correction ne produit pas le P-5000, les tutoriels avancés, tous les props autonomes, les PNJ d’annexes, le replay MIRE ou les commandes CCTV/verrouillage.

## Audit avant / après

| Axe | Défaut avant V81 | Correction V81 | État |
|---|---|---|---|
| Action | Interaction de station assimilée à un entraînement | Console d’armement, repère à atteindre, neuf cibles et tir réel | Corrigé pour le M41A |
| Récompense | Bonus possible par simple visite | Reçu de qualification validé et idempotent | Corrigé |
| Placement | Aucun lien mesuré entre canon et cibles | Centres placés sur trois rayons issus de la bouche du M41A | Corrigé |
| Circulation | Deux caisses collidables coupaient la sortie d’échelle vers le pad | Cargaison déplacée dans l’alcôve au sol derrière la station ; contrat commun aux dix annexes | Corrigé |
| Verticalité | Passerelles décoratives sans usage d’entraînement | Ligne de tir sur la passerelle à `y = 468` | Corrigé pour ce parcours |
| Caméra | Cibles 04, 07 et 08 hors écran ou presque invisibles depuis le pad | Focus entre Echo-9 et la cible active, easing et marge garantie de 36 px | Corrigé |
| Collisions | Risque de silhouettes créant des murs | Cibles non collidables ; seule l’active reçoit les tirs | Corrigé |
| Perspective | Prop générique de l’annexe | Console et atlas strictement latéraux, transparents et indépendants | Corrigé pour trois assets |
| Échelle | Cible/console sans référence commune | Marine de référence 92 px ; cibles 92–126 px ; console 118–148 px | Corrigé au contrat |
| Lisibilité | Pas de retour de session | HUD phase, score, cibles, temps, visée, munitions et recharge | Corrigé |
| Corpus hub | Nombreux props et PNJ encore mutualisés | Aucun faux remplacement par ce lot | Toujours partiel |

## Topologie

Le monde conserve 1 920 × 720, soit plus d’un écran 1 280 × 720, avec caméra latérale. Les fonctions sont espacées pour obliger une traversée lisible :

1. la porte réciproque relie physiquement l’Armory à l’annexe ;
2. la console se trouve dans la première zone fonctionnelle ;
3. le repère M41A se trouve plus loin, sur la passerelle ;
4. les cibles occupent la moitié droite du champ de tir ;
5. la même porte permet le retour et abandonne une session encore armée ou active.

Les caisses génériques qui occupaient initialement la passerelle ont été replacées au niveau du sol, dans la zone morte située derrière la station par rapport à l’entrée. Le validateur `catwalkRouteClear` refuse désormais un prop collidable posé dans la voie échelle–passerelle sur les dix annexes.

La session ne se déclenche pas depuis l’interface HTML : le joueur doit être à portée de la console puis placer réellement ses pieds sur la surface du pad.

## Placement des cibles

Les neuf cibles alternent les hauteurs pour éviter une séquence monotone :

`niveau proche → haut proche → bas proche → niveau moyen → haut moyen → bas moyen → haut lointain → niveau lointain → bas lointain`

Elles occupent `x = 1 120` à `1 640`. Leur centre est recalculé depuis la bouche `(818, 412)` et le vecteur de la hauteur. Le validateur refuse :

- un nombre différent de neuf ;
- un identifiant dupliqué ;
- une répartition différente de trois cibles par hauteur ;
- une cible hors du monde ou sous le sol ;
- un centre décalé de plus d’un pixel par rapport à son rayon ;
- un pad hors de la passerelle prévue.

Le joueur est verrouillé au repère seulement pendant la phase active. Cette immobilisation rend la mesure de visée reproductible ; elle ne transforme pas le reste de l’annexe en écran statique.

Pendant cette phase, la caméra vise le milieu entre Echo-9 et la cible active. L’easing est conservé, puis un clamp impose la cible entière avec 36 px de marge sans sortir le joueur du viewport. Les neuf identifiants sont contrôlés avant tir dans le test runtime, et les trois anciens cas hors champ possèdent une capture navigateur dédiée.

## Taille, ancrage et perspective

Toutes les couches V81 respectent une caméra orthographique strictement latérale. La cible et la console sont des bitmaps indépendants à alpha ; les impacts utilisent un atlas VFX séparé. Aucun texte, HUD, porte ou arrière-plan n’est peint dans ces trois fichiers.

Le joueur du hub est rendu à 95 × 128 px, ancré aux pieds. Le pad reste une surface de gameplay indépendante du décor. Les cibles partagent une enveloppe de collision 76 × 96 px, tandis que leur atlas peut montrer le mécanisme complet sans agrandir la zone touchable. La console est rendue à 148 × 148 px près de la station existante.

## Cohérence avec le hub et le jeu 2D

V81 conserve la porte, le graphe et la persistance V71 : l’annexe n’est ni une image plein écran, ni une téléportation vers un menu. La caméra, le sol, la passerelle, le joueur et les projectiles restent dans le même repère monde. Les trois hauteurs ajoutent un premier tir diagonal contextuel sans prétendre livrer le tir diagonal global des missions.

Le service stratégique dépend du résultat spatial. L’entraînement n’accorde aucune certification P-5000 et ne marque aucun tutoriel avancé comme terminé.

## Risques et dettes

- la preuve navigateur locale desktop/mobile est verte ; la même séquence reste à confirmer sur la production canonique ;
- la QA ennemie navigateur Crusher/Spitter dans plusieurs topologies reste à faire ;
- l’annexe a encore besoin de variations de murs, racks, impacts persistants et éclairages endommagés ;
- le P-5000 nécessite son propre volume, ses collisions, son tutoriel et sa certification ;
- les props et PNJ des neuf autres annexes restent à individualiser ;
- les archives MIRE et CCTV doivent devenir des parcours physiques complets ;
- le prologue, le créateur et le tir diagonal global ne sont pas couverts par ce niveau.
