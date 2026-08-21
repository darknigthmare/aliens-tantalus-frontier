# Historique de version — v52.0.0

## Identité

- Nom : `ALIENS: TANTALUS FRONTIER`
- Version : `52.0.0`
- Base additive : `51.0.0`
- Schéma de sauvegarde : `51`
- Axe : `Physical Squad, Connected Worlds & Manifest-Driven Animation`

La v52 ne remplace pas la boucle stratégique v51. Elle matérialise ce qui restait encore trop générique : topologies de mission, équipiers, PNJ, animations et couches artistiques.

## Différence avec la v51

| v51 | v52 |
| --- | --- |
| Une géométrie systémique dominante avec variations. | Trois graphes connectés et distincts : vaisseau vertical, colonie multi-route, extérieur planétaire. |
| Monde/objectif parfois associés par index de catalogue. | 436/436 campagnes compilées par identité vers le bon monde et objectif. |
| 800 seeds avec distribution de danger défectueuse. | Domaine des dangers réparti ; aucun défaut 800/800 acide. |
| Équipage surtout présent dans les bonus et sièges. | Jusqu'à trois alliés physiques : follow, cover, fire, heal, repair, scan, revive et véhicule. |
| Hub avec quatre PNJ génériques par pont. | 16 PNJ nommés, 16 salles, 16 feuilles et interactions persistantes spécialisées. |
| Grilles et états d'animation encore partiellement codés en dur. | Registre runtime de 27 atlas, clips, pivots, hitboxes et événements de frame. |
| 18 plaques normalisées. | 27 plaques, 432 cellules, neuf nouveaux membres Echo-9 illustrés. |
| Couches mission communes. | Far/mid/foreground indépendants pour colonie, planète et intérieur vaisseau. |
| Objectifs secondaires affichés en rectangles colorés. | Props physiques avec balise compacte. |
| Reprise native sans état niveau/escouade v52. | Zone, graphe, événements, spawns, escouade et passagers repris sans refarm. |

## Niveaux

`mission-levels-v52.js` compile topologie, géométrie, zones, événements, spawns, ancres, art et validation. `game-v52-level-runtime.js` applique le plan au moteur puis restaure l'état sauvegardé si la signature correspond.

Les nouvelles couches OpenAI intégrées sont :

- `colony-multiroute-far/mid/foreground.png` ;
- `planet-exterior-far/mid/foreground.png`.

Les couches vaisseau de Tantalus restent réutilisées comme kit intérieur. Les mid/foreground sont de vrais PNG RGBA nettoyés ; les prompts, sources et métriques sont conservés dans `docs/prompts/`.

## Équipage et PNJ

Les neuf feuilles ajoutées couvrent :

- Asha Mbaye ;
- Cal Mercer ;
- DAVID-8R ;
- Echo-A ;
- Inez Harlow ;
- Jun Park ;
- Leila S. Rensen ;
- Pablo Reyes ;
- Rook.

Avec les sept plaques existantes, les seize membres disposent d'une identité visuelle runtime. Le slug de Leila est harmonisé sur `crew-15-leila-s-rensen`.

La mission instancie les équipiers réellement sélectionnés. Le Tantalus instancie une personne par salle et enregistre chaque interaction dans `hub.npcInteractions`.

## Animation

`sprite-animation-runtime.js` fournit :

- résolution sheet/clip ;
- sampling fps/loop/fin ;
- pivot et hitbox ;
- événement de frame unique ;
- contrôleur par entité ;
- rapport runtime avec fallback déclaré.

Le rendu v52 ne mélange plus silencieusement crouch/climb, hurt/death ou work/walk par simple rangée codée en dur pour les familles couvertes.

## Reprise et correctifs

- Squad restaurée uniquement après validation d'identité.
- Valeurs zéro valides conservées pour position, bleedout et compteurs.
- Passagers IA reconstruits sans doublon.
- Bleedout expiré produit une seule perte/casualty.
- Danger `darkness` à dégât zéro n'inflige plus une valeur par défaut.
- Réserve véhicule indépendante du framerate.
- Hot-join coop transfère puis rend l'état de l'acteur IA.
- Seeds natifs sanitisés jusqu'à `Number.MAX_SAFE_INTEGER`, fermant le faux `identity-mismatch` après reload.
- Objectifs v52 rendus avec des props, pas des rectangles prototypes.
- Portrait mobile rapproché de l'en-tête avec contrôles et readout visibles.

## PWA

Le cache passe à la génération v52 et inclut les modules :

- `mission-levels-v52.js` ;
- `game-v52-level-runtime.js` ;
- `game-v52-runtime.js` ;
- `sprite-animation-runtime.js` ;
- `hub-v52-runtime.js`.

Les assets runtime v52 sont également précachés. Le test de fermeture ESM parcourt les imports relatifs publics.

## Compatibilité

Le schéma reste 51 afin de conserver les profils v51. La migration est additive. Les champs inconnus sont ignorés et les anciens profils reçoivent les nouvelles structures au chargement.

La release ne prétend toujours pas fournir :

- 64 mondes entièrement composés à la main ;
- 436 scripts/cinématiques uniques ;
- 800 cartes artisanales ;
- 568 IA, 279 cockpits ou 392 sprites de costume exclusifs ;
- une capture vidéo frame exacte en guise de sauvegarde.

Elle prouve en revanche que ces catalogues ont des consommateurs et que les familles annoncées modifient le jeu.

## Validation finale

```powershell
npm.cmd run qa
npm.cmd run qa:browser:v52
```

Résultats :

- lint : **72 modules** ;
- tests : **105/105** ;
- build : **52.0.0**, **3 443 entrées** ;
- navigateur : **12 checkpoints** ;
- desktop, portrait mobile, rechargement et PWA hors ligne : PASS ;
- exceptions, erreurs console et requêtes échouées : **0 / 0 / 0**.

GitHub et Vercel ne sont considérés livrés qu'après commit/push, déploiement `Ready` et vérification HTTP de l'URL publique.
