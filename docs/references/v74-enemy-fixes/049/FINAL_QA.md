# V74 — revue indépendante finale du candidat 049

Date : 2026-09-05. Profil : `enemy-049-wild-boar-host`. Cette revue ne modifie ni sources, atlas, métadonnées, registre, STATE, ni les preuves déjà empreintées `scale-review.json` / `RESIDUAL_SCALE.md`.

## Décision

**Correction d'échelle interclips validée ; acceptation artistique finale encore réservée pour une frange violette sombre.** Le sujet est un sanglier naturel vivant de l'adaptation du projet, pas un Wild Boar Alien de Kenner. Les 32 poses conservent cette identité générale, mais aucune fidélité pixel-identique 1:1 n'est certifiée. Aucune intégration au gameplay n'a été réalisée dans cette sous-tâche.

## Avant / après vérifié en pixels

L'ancien atlas et ses métadonnées ont été lus directement par `git show c9ea114:<path>` en mémoire binaire. Ils n'ont pas remplacé les actifs. Les quatre PNG sources actuels sont byte-identiques à cette révision et leurs SHA-256 concordent avec les métadonnées et la revue isolée.

| Donnée | V73 | V74 |
|---|---:|---:|
| Facteur final de rangement commun | 0,603260870 | 0,575508288 |
| Facteur anatomique résiduel attaque | 1 | 1,048222732 |
| Axe médian repos dans l'atlas | 103,623100 px | 98,855994 px |
| Axe médian attaque dans l'atlas | 98,855994 px | 98,855994 px |
| Rapport attaque / repos | 0,95399572 | 1 à l'arrondi documenté |

Les anciennes corrections de recomposition ne sont pas remultipliées. Chacune des 32 poses porte exactement `appliedScale = scale × sourceScale`, avec un seul facteur résiduel par clip. Les points de mesure et la tolérance de 3 % sont inchangés.

Conséquence visible importante : l'attaque contraint toujours la largeur de rangement. Ses huit cellules V74 sont **pixel-identiques** aux huit cellules V73. Le nouvel atlas corrige le rapport en réduisant uniformément les trois autres clips d'environ 4,6 %, et non en faisant artificiellement grossir l'attaque dans sa cellule. Cela est cohérent avec la normalisation commune, mais il ne faut pas augmenter seulement le rendu d'attaque au runtime pour « compenser » une seconde fois.

Preuve directement inspectée : [avant/après repos et attaque](before-after-idle-attack.png). Les [diagnostics complets](diagnostics.json) comprennent les 32 hashes RGBA, les facteurs par pose et les contrôles de sources.

Atlas V74 : `1d09249b09d24ea38227863c8df56eccf73a75d4879adab442493e908698937b`.

Atlas V73 : `e9eb1133573633a0a24d75c746edebbe8d38616f572db7cfc84ce28dce98d68e`.

## Alpha et cadrage

Inspection des 32 poses sur [fond sombre](current-32-dark.png) et [fond clair](current-32-light.png), puis [agrandissements nearest-neighbour des arêtes](fringe-review-light.png).

- 32 cellules distinctes ; zéro pixel visible dans la garde de 16 px ; zéro RGB caché sous alpha0 ; zéro magenta vif au prédicat strict.
- 24 pixels blanc opaque correspondent à des petites touches de défenses/yeux ; pas de rectangle blanc ni de matte blanc visible.
- Les supports touchent tous le même plan, sans découpe de cellule. Erreur maximale d'arrondi des racines : 0,484950 px.
- **Réserve visible** : contour violet sombre sur la queue, l'arrière des pattes et certaines limites de soies. Exemples lisibles sur l'agrandissement : queue d'idle1, queue/membre arrière de move1, queue d'attack1. L'attaque révèle aussi des ombres violettes sous la gorge.

Un détecteur exploratoire limité à la bande extérieure de 3 px (`alpha>=16`, `R>G+15`, `B>G+15`, `min(R,B)>20`) compte 4 000 candidats idle, 3 730 move, 4 693 attack et 1 567 death. Ce sont **13 990 candidats chromatiques, pas 13 990 pixels de défaut automatiquement prouvés** : des soies colorées peuvent aussi satisfaire le prédicat. Une suppression globale de toutes ces couleurs serait injustifiée. Le zéro du test magenta vif ne constitue donc pas une certification « alpha parfait ».

Reprise recommandée : nettoyage borné et traçable des seules franges démontrées, sans effacer/recolorer arbitrairement les soies ou les marques chaudes. Rejouer ensuite normalisation, prédicats, inspection sombre/claire et comparaison interclips. Cette revue n'effectue pas ce nettoyage.

## Chronologie et boucles

La revue porte sur les 32 poses ordonnées et les métadonnées/GIF réellement présents, pas sur un ennemi simulé en production.

- Idle, 6 fps : corps posé, respiration/reniflement, tête baissée puis relevée ; pose8 retrouve une attitude proche de pose1. Les positions d'oreille et les micro-soies changent, donc ce n'est pas une continuité pixel-identique.
- Move, 12 fps : galop quadrupède, phases comprimées 2/6 et extensions 3/4/7/8. Les appuis changent effectivement ; les huit images ne sont pas une copie répétée. La silhouette plus basse résulte en partie du galop/port de tête ; l'axe croupe–épaule ne porte plus de correction résiduelle distincte.
- [Attack, 12 fps](attack-current-eight.png) : anticipation 1–3, poussée vers l'avant en4, extension maximale des défenses en5, relevé/follow-through en6, récupération7–8. Il s'agit d'une attaque de tête/défenses, pas de griffes ni d'une explosion.
- [Death, 10 fps](death-current-eight.png) : perte d'appui en2, effondrement3–5, décubitus6–8. Pas de retour sur les pattes. La pose8 est une fin couchée appropriée à un maintien terminal.

Les quatre WebP de clips sont pixel-identiques à leurs tranches de l'atlas. Chaque GIF contient huit images. Idle/move ont une boucle GIF déclarée ; attack/death n'en ont pas. Les métadonnées `loop` valent respectivement true, true, false, false. Le maintien terminal doit encore être vérifié dans le moteur, pas inféré seulement de ces GIF.

## Proposition conditionnelle de taille et de combat

Après résolution de la réserve d'arête, proposer **160×160 pixels de rendu** pour la cellule carrée, pivot `(128,240)/256`, sans étirement rectangulaire. La [comparaison de propositions](world-size-proposals.png) utilise le vrai marine `110×148` et les vrais pixels actuels, tous sur le même sol. Ce diagnostic n'est pas une capture de gameplay intégré.

À160×160, la pose idle1 du sanglier mesure environ118×78 px visibles et le maximum de hauteur des poses idle est89 px. Le marine idle visible mesure environ49×112 px. La masse du sanglier se lit alors sous la taille du marine, avec un dos vers hanche/abdomen ; 176 le rapproche davantage du torse. Ce sont des choix de gameplay, pas des mètres canoniques. Il faut conserver le même rendu160×160 pour les quatre clips, y compris la mort.

Pour l'attaque, proposition concrète : contact unique **pose5, index local4**, soit **4/12 s ≈0,333 s** après déclenchement ; c'est la plus grande extension vers la cible. Les poses1–3 restent télégraphiées. Vérifier direction, portée et recouvrement au moment du contact, puis consommer l'impact une seule fois ; aucune attaque répétée par la seule persistance du sprite. La boîte corporelle et le volume de défenses devront être contrôlés sur une capture runtime à cette taille ; aucune valeur de collision arbitraire n'est approuvée ici.

Tests d'intégration encore requis : attaque orientée gauche/droite, cible quittant la portée pendant l'anticipation, delta couvrant plusieurs poses sans double impact, annulation à la mort, mort one-shot figée sur index7 à partir de0,7 s, sauvegarde/reprise sans rejouer l'impact ni réanimer le cadavre. Ne pas transformer automatiquement « hôte » en éclosion sans contrat de gameplay dédié.

## Commandes exécutées

```text
py scripts/process-v66-enemy-batch.py --profile enemy-049-wild-boar-host --check
py docs/references/v74-enemy-fixes/049/inspect_049.py
```

Résultat normaliseur : 1 profil, 32 poses, findings `[]`, acceptedAutomatically0. Le script de diagnostic n'écrit que dans ce dossier. Il ne touche pas les preuves figées. Aucun build, déploiement ou statut runtime accepté n'est revendiqué.
