# Alien: Covenant — production V0.16

## Livré

**16 nouvelles images originales** complètent les **103 PNG V011–V014 conservés**. Le cumul atteint **119 PNG : 72 admis au rendu et 47 au catalogue**. Les cinq cycles complets et leurs 40 phases restent inchangés.

| Domaine | Ajouts | Portée actuelle |
|---|---:|---|
| David hôte | 5 poses : 01, 02, 05, 06, 07 | Catalogue, cycle incomplet |
| Accessoires | 5 PNG : 2 concepts de capot, cabestan final, mât du Covenant, cryopod des Ingénieurs | Catalogue de production |
| Terrains | Souche, dalle rocheuse, rocher de berge, herbe du site brûlé | 4 images de catalogue |
| Véhicule | Audi lunar quattro de face et en état promotionnel éclairé | 2 images de catalogue |

Les originaux V016 représentent **27 746 475 octets**. Les 119 PNG cumulés représentent **196 570 946 octets**. Aucun PNG n’a été redimensionné ou retouché localement. Les deux capots ont bénéficié d’une correction de fond par le générateur ; les prompts récupérés sont consignés dans le [manifeste](../../assets/openai/sprites/alien-covenant-v016/manifest.json).

## Bible de production

La bible [Markdown](BIBLE_COVENANT_V016.md), [JSON](BIBLE_COVENANT_V016.json), [HTML](BIBLE_COVENANT_V016.html) et [Excel](BIBLE_COVENANT_V016.xlsx) détaille **257 contrats de production**. Elle conserve les identifiants du registre V014 et relie les nouvelles images aux fiches concernées.

| Périmètre | Couverture documentaire |
|---|---:|
| Registre de références | 315 entrées |
| Personnages | 23 profils, plus variantes documentaires |
| Lieux | 57 entrées : 56 campagne et 1 tableau indépendant |
| Circulation | 67 connexions, 134 seuils orientés |
| Armes | 7 familles, dont 4 jouables dans le moteur existant |
| Props | 126 familles, 630 occurrences |
| Candidats supplémentaires | 13 fiches, dont 10 objets |
| Transport | 3 véhicules, 5 fiches de vaisseaux, 4 composants ou groupes associés |
| Terrain | 16 familles avec prescriptions de matières, couches et raccords |
| Planètes | 3 fiches aux preuves et usages distincts |

Chaque contrat décrit l’apparence à conserver, la variante, le consommateur, les états à produire, les références requises, le placement et les critères de validation. Les fiches et vues se recoupent : leurs comptes ne s’additionnent pas en objets uniques. Une prescription ne constitue pas une image, animation ou mécanique livrée.

## Rendu du jeu conservé

Les 16 nouveautés restent au catalogue. Le registre runtime V014 et ses 72 bindings demeurent identiques, de même que ses cinq cycles et son panorama du lac. Aucun changement de simulation, de collision, de route, de seuil, de sauvegarde ou de personnage jouable n’est publié par V016.

Un raccord précis a été étudié pour le rocher de berge : `landing-light2` dans `landing`, `x=1750`, `z=0.02`, empreinte `110×65`, non solide. La bible l’indique comme emplacement envisagé, pas comme admission. La souche et la dalle proviennent d’un extérieur alors que la salle `juggernaut` actuelle est intérieure. Le site `burning` n’a pas d’occurrence d’herbe compatible.

## Fidélité et manques maintenus

**Aucune fidélité identique à 1:1 n’est certifiée.** Les images reprennent des références inspectées avec des adaptations de cadrage, de silhouette et d’état. Les concepts de production, le cinéma, les bonus promotionnels et le jeu restent distincts.

- David reste sans nouveau cycle complet : la phase 03 a été refusée par le générateur ; les phases 04/08 n’ont pas été tentées après ce refus. Les cinq poses sont consultables séparément.
- Les 15 profils mobiles de PNJ sans marche PNG complète et les quatre profils joueurs sans course PNG restent ouverts.
- Les sept familles d’armes restent sans PNG ; les refus antérieurs ne sont pas relancés.
- Le profil latéral du rover, le Juggernaut intact et le Mother Tug restent à documenter. Aucune surface canonique d’Origae-6 n’est inventée.
- La photo Audi A173663 ne montre pas le rover et a été écartée. Le cliché `levi-deadforest-1578` est rattaché au site du Lander détruit.
- Douze prompts exacts ont été récupérés après la panne de l’environnement. Les quatre autres sont marqués non récupérés ; aucun texte supposé exact ne leur est substitué. Les octets de toutes les images ont été récupérés et vérifiés.

## Contrôles et distribution

Les résultats exécutés et leur portée figurent dans [PROVENANCE_V016.json](PROVENANCE_V016.json). Les 59 contrats et contrôles d’intégration Covenant, le contrôle du bundle à 72 images et le test de récupération des 119 originaux ont réussi après restauration de l’environnement. Les résultats navigateur et catalogue sont consignés séparément lorsqu’ils ont effectivement été exécutés.

Le pack cumulatif se construit avec `scripts/package-covenant-sprites-v016.py`. Il contient les 119 PNG, leurs manifestes, les quatre formats de bible et le catalogue hors ligne. Les cinq cycles complets restent consultables ; les cinq poses David n’apparaissent pas dans le lecteur de cycle.

Cette continuation est portée par la [PR 79](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/79), complément de la [PR 71](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/71). Elle ne comprend pas un éventuel lot V015 d’une autre branche. Aucune fusion ni mise en production n’est effectuée.
