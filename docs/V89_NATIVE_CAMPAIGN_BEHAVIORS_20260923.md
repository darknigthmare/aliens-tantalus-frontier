# V89 — trois comportements de campagne natifs

État du lot : implémenté et vérifié le 23 septembre 2026. Aucun nouvel ennemi, aucune modification de PNG, aucune publication effectuée par ce lot.

## Périmètre et sources

Les 35 identités natives V87 restent distinctes des anciens profils Altered. Ce lot spécialise seulement trois comportements de mission. Les 32 autres conservent leur comportement V88 simplifié. BIOFORGE conserve ses règles de laboratoire.

| Identité | Fait soutenu par la source officielle | Adaptation réellement livrée |
|---|---|---|
| Burster — Aliens: Fireteam Elite | Les notes de version Cold Iron mentionnent les dégâts d’explosion du Burster, distincts de la projection d’acide. | Explosion de proximité annoncée, unique, sacrifiant l’acteur. La neutralisation avant la fin de l’annonce l’interrompt. |
| Blight — Pathogen | Cold Iron décrit des globules acides à explosion temporisée, destructibles en vol, et des zones dangereuses au sol. | Projectile mobile blanc, temporisateur, destruction par balle, détonation puis flaque temporaire au sol. |
| Brute — Pathogen | Cold Iron décrit des frappes avec les excroissances des poings et des ondes de choc au sol. | Frappe annoncée sur une zone au sol. Une hauteur différente, un obstacle ou une interruption du sol bloque l’atteinte. |

Sources consultées : [notes de version officielles](https://www.aliensfireteamelite.com/en/releasenotes/) et [Pathogen Deep Dive: An Exhilarating New Story, 29 août 2022](https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/).

Les annonces, temps, distances, dégâts, interruptions et mouvements linéaires sont des réglages 2D du projet, pas des données extraites des jeux d’origine. Ce n’est pas une reproduction complète de leurs IA. La furtivité du Blight, les animations de frappe et une simulation complète de l’acide ne sont pas ajoutées. Les PNG restent des poses fixes natives, avec `animationStatus: missing` et `canonExact: false`.

Le contrat public de l’encyclopédie est `specializedBehaviorV89: { id, label, summary, sourceUrls, adaptationNote }`, null pour les autres profils. Le contrat numérique du moteur est `behaviorContractV89`.

## Garanties de fonctionnement

- Même sélection contextuelle déterministe, mêmes seeds et identités de mission ; maximum deux contacts importés et une reine, sans augmentation de population.
- Préparation interrompue par mort, désactivation, transit, étourdissement, déplacement de l’acteur ou cible devenue inadaptée ; pause, chargement d’image, delta nul/négatif figent le comportement.
- Portes fermées, murs, couvertures et plateformes bloquent les lignes d’attaque. Les globules utilisent une collision continue de segment, y compris contre une paroi fine.
- Une explosion atteint chaque cible une seule fois ; J1, J2 et équipiers IA restent distincts ; plusieurs occupants d’un véhicule ne multiplient pas ses dégâts.
- Un globule déjà émis et une flaque déjà créée peuvent survivre à la mort du Blight : ce sont des dangers physiques en cours, pas une nouvelle attaque du cadavre.
- Quatre globules et six flaques simultanés au maximum ; les effets sont temporaires et ne créent aucun acteur ou descendant.
- L’état d’annonce, le numéro d’attaque, la durée restante des globules/flaques et l’état dépensé sont sauvegardés. Un Burster est marqué mort avant les callbacks de dégâts, afin qu’une sauvegarde réentrante ne puisse rejouer son explosion.
- Reprise ancienne ou malformée : délai de sécurité, jamais un impact gratuit ni un soin. Effets étrangers, non valides ou dupliqués rejetés. Une reprise refusée par l’identité de mission ne modifie pas l’état courant.

## Vérifications réalisées

`node --test tests/enemy-user-behavior-v89.test.mjs tests/enemy-user-campaign-v88.test.mjs tests/mission-loop-delta-v88.test.mjs tests/cargo-brutal-v67.test.mjs tests/bioforge-mix-v87.test.mjs`

Résultat : **80 tests passent, 0 échec**, dont 28 nouveaux tests V89. La preuve comprend les vraies plateformes de mission sans remplacement de leur géométrie, les trois attaques, les obstacles, le saut, l’interruption, J1/J2/IA/véhicule, les états anciens/invalides et le cycle `capture → recordOperationResumeState → SaveSystem.commit/load → migrateSave → applyResumeState` pour annonce, globule, flaque et mort. Les régressions Matriarche Cargo, quotas MIX, découverte V88 et delta négatif passent aussi.

Contrôle Chromium : `node tests/browser-user-behavior-v89.mjs` — **3 comportements validés, 9 captures, 0 erreur console/réseau**. Images natives réellement chargées ; impacts mesurés sur J1 sans armure : Burster 27, Blight 16,8, Brute 30,8 points de vie.

Limite explicite de cette preuve visuelle : il s’agit d’une **fixture déterministe** avec moteur de production, vrai niveau et PNG réels ; placement du joueur et pas de temps sont contrôlés. Ce n’est pas un parcours clavier complet ni une validation exhaustive de toutes les situations de jeu. Les captures et le rapport restent privés sur `E:/CodexQA/AliensTantalus/v89-campaign-20260923/browser-private`.

Fichiers du lot : `src/enemy-user-campaign-v88.js`, `src/enemy-user-campaign-runtime-v88.js`, crochet natif de `src/game-v51-runtime.js`, deux harnais V89 et ce document. Aucun changement de `app.js`, `save.js`, hub, titre, service worker ou build par ce lot.
