# Audit des promesses de gameplay — v1 à v53

Date de contrôle : 22 août 2026. La matrice détaillée v1→v52 reste conservée dans `GAMEPLAY_PROMISE_AUDIT_V52.md`; v53 n’en retire aucune ligne. Elle ajoute un gate visuel strict et corrige les écarts constatés en jeu au lieu de les requalifier comme terminés.

## Postulat de base conservé

Le jeu reste une boucle complète : préparation à bord du Tantalus, choix de campagne/monde/dotation/escouade/véhicule, déplacement physique dans le hub, mission Metroidvania multi-route, combat, objectifs, extraction ou retraite, conséquences, sauvegarde et reprise. Les catalogues systémiques restent 64 mondes, 436 campagnes, 146 armes, 106 équipements, 568 profils ennemis, 279 profils véhicules, 16 membres d’équipage, 392 costumes, 158 modules et 800 seeds de niveau.

## Matrice v53

| Promesse | État v53 | Preuve exécutable | Limite déclarée |
|---|---|---|---|
| Hub jouable, pas une page de boutons | `PHYSICAL` | `hub-game`, `hub-v51-runtime`, tests hub | Pas encore de set foreground/ceiling propre à chaque salle. |
| 16 salles distinctes | `PHYSICAL` | 16 fonds, 16 profils de scale/floor/collider | Deux props restent partagés entre deux salles. |
| Portes et props cohérents avec le rendu | `PHYSICAL` | bounds communs rendu/collision, colliders par salle | Un dropship physique dédié manque au hangar. |
| Parallaxe du hub | `PHYSICAL` | quatre far layers consommés par les viewports | Foreground hub dédié encore manquant. |
| Missions multi-routes | `PHYSICAL` | trois templates, graphe validé, neuf couches globales | Couches bitmap indépendantes par zone encore manquantes. |
| Props mission plutôt que rectangles seuls | `PHYSICAL` | 16 props chargés; pipe/câbles/foreground dessinés | Hazards non-acide et drops de ressources dédiés manquent. |
| Joueur visuellement stable | `SAFE-DEGRADED` | combat non vérifié mis en quarantaine | Nouvelle plaque combat identity-preserve toujours bloquée avant génération. |
| Ennemis regardant leur cible | `PHYSICAL` | `sourceFacing`, facing avant attaque, tests droite/gauche | Aucun changement d’orientation ne fabrique une caste manquante. |
| Identité des 52 archétypes stable | `SYSTEMIC` | registre exhaustif, 568 profils résolus | 297 profils restent sans art dédié; 205 utilisent une famille authored. |
| Combat Synthetic distinct du Working Joe | `PHYSICAL` | atlas synthetic row 2, tests | Autres variantes synthétiques dédiées à produire. |
| 16 PNJ distincts dans le hub | `PHYSICAL` | 16 plaques locomotion et 16 interactions persistées | Sets combat/blessure/mort/mission incomplets. |
| 36 châssis véhicules jouables | `SYSTEMIC` | six familles physiques et 279 profils compilés | Un seul profil possède actuellement un bitmap exact; 278 restent sans plaque dédiée. |
| Sauvegarde/reprise sans refarm | `PERSISTENT` | schema 51 conservé, signatures v52 recoupées | Aucun changement de schéma requis par v53. |
| PWA/offline | `RELEASE-GATE` | fermeture ESM, cache `atf-v53-runtime-1`, QA navigateur | Doit repasser le gate navigateur à chaque publication. |

## Vérité visuelle obligatoire

- Un texte catalogue n’est pas un sprite.
- Un fichier présent n’est pas forcément chargé.
- Un fichier chargé n’est pas forcément l’identité exacte.
- Un prompt ImageGen n’est pas un asset produit.
- Toute approximation ennemie est sérialisée comme `authored-family` ou `missing-dedicated-art` et expose une raison.
- Les silhouettes canvas des véhicules non-ground sont déclarées comme dette visuelle, pas comme plaques terminées.

Les listes exhaustives joueur, 16 PNJ, 52 archétypes, 568 profils ennemis, 36 châssis, 279 profils véhicules, 16 salles/props hub et 16 props mission sont générées dans `ASSET_RUNTIME_INVENTORY_V53.md` et `ASSET_RUNTIME_INVENTORY_V53.json`.

## Gates

```powershell
npm.cmd run inventory:v53:check
npm.cmd run sprites:v53:check
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run qa:browser:v52
```

Une promesse n’est considérée effective que si son action, son effet runtime et sa preuve passent ensemble.
