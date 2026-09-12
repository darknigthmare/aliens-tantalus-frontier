# V81 — Audit d’identité visuelle du joueur Echo-9

## Verdict

V81 ferme le défaut transversal où une requête d’animation invalide pouvait afficher ponctuellement une famille visuelle étrangère ou une cellule débordante à la place du joueur. Le runtime joueur accepte désormais uniquement les cinq feuilles Echo-9, contrôle la grille, le pivot, la cellule, la géométrie et le facing, puis utilise un repli Echo-9 explicite si une condition échoue.

Cette correction ne crée pas de nouvelles animations dédiées à chaque arme, branche de rechargement ou profil Neuro-Xeno. Les conversations #6 et #7 restent `PARTIAL`.

## Feuilles autorisées

La liste blanche V81 contient exactement :

1. `player.echo9-marine.locomotion` ;
2. `player.echo9-marine.combat` ;
3. `player.echo9-marine.melee` ;
4. `player.echo9-marine.interaction` ;
5. `player.echo9-marine.tool-use`.

Toute autre feuille, y compris une feuille ennemie qui exposerait un identifiant d’animation compatible, est rejetée avant le rendu.

## Grille, pivot et découpe

Les cinq feuilles partagent le même contrat source :

- bitmap RGBA 1 024 × 1 024 ;
- grille 4 × 4 ;
- cellule 256 × 256 ;
- garde interne de 16 px ;
- pivot pieds `humanoid-feet` à `(128, 240)` ;
- découpe Canvas limitée au rectangle de destination.

La cellule est refusée si sa colonne ou sa ligne sort de la grille, si les dimensions décodées diffèrent, si le pivot n’est pas celui du contrat ou si la géométrie acteur n’est pas finie et positive. La découpe empêche une pose voisine de déborder dans l’animation visible.

## Échelle par surface

Le même ratio visuel est conservé, mais chaque monde garde un gabarit lisible :

| Surface | Largeur rendue | Hauteur rendue | Rôle |
|---|---:|---:|---|
| Mission | 110 px | 148 px | combat et navigation principale |
| Hub | 95 px | 128 px | cohérence avec les salles du Tantalus |
| BIOFORGE | 73 px | 98 px | cohérence avec le sol et l’arène V80 |

Le sprite est ancré aux pieds de la hitbox. Son facing est normalisé à `-1` ou `1` ; le retournement se fait autour du pivot et non autour du bord brut de la cellule. Le hub persiste aussi `hub.facing`, ce qui évite une inversion arbitraire à la reprise.

## Repli et profil Neuro-Xeno

Si une image manque ou qu’un échantillon est invalide, `drawEcho9FallbackV81` dessine une silhouette procédurale Echo-9 orientée comme l’acteur. Le runtime ne remplace jamais silencieusement le joueur par un Drone, un Facehugger ou un autre personnage.

Un profil Neuro-Xeno conserve ses métadonnées de gameplay (`profileId`, `enemyId`, biologie et caste), mais utilise visuellement Echo-9 avec `exact: false` et `degraded: neuro-player-art-unavailable-v81`. Ce choix évite le mélange d’identité ; il ne doit pas être présenté comme l’art Neuro-Xeno final.

## Surfaces branchées

Le contrat est appliqué dans :

- le runtime mission et ses extensions V51/V52 ;
- le hub historique, V51, V52 et V71 ;
- BIOFORGE V80 ;
- la migration et la sauvegarde du profil ;
- le résolveur d’animations et son contrôleur de cellules.

Les cinq images sont réellement créées et chargées par les runtimes mission/hub ; le service worker les conserve aussi dans le shell hors ligne. Les horloges `fireClock` des surfaces hub, BIOFORGE et Proving Ground sélectionnent la feuille combat pendant le tir puis reviennent à la locomotion, sans feuille ennemie intermédiaire.

La reprise BIOFORGE conserve uniquement position, facing, seed, horloge de phase et étape de transfert dans `bioforgeV80.runtimeV81`. Les clés visuelles forgées ne sont pas restaurées.

## Contrats vérifiés localement

Les tests V81 couvrent la liste blanche, les 80 cellules des cinq feuilles, le pivot pieds, les trois surfaces, les deux orientations, le refus inter-famille, le repli procédural et les migrations hub/BIOFORGE. Le parcours navigateur local a décodé les cinq feuilles et relevé 1 147 échantillons locomotion/combat sans fallback ni motif de dégradation. Ces contrôles font partie du passage global V81 documenté dans `docs/VALIDATION_V81.md`.

## Dette conservée

- animations propres aux quatre résultats du rechargement tactique, par famille d’arme ;
- poses diagonales générales en mission, en dehors des trois directions du Proving Ground ;
- corps, équipement et portraits individualisés pour les 16 membres Echo-9 ;
- art joueur Neuro-Xeno dédié ;
- prologue et créateur de personnage ;
- revue navigateur visuelle à taille réelle de toutes les actions sur mission et BIOFORGE ; le scénario hub/Proving Ground couvre déjà locomotion et combat.
