# Quatre planches ECHO-9 — 20 septembre 2026

## Livrable et limite

Quatre nouvelles images OpenAI intégrées sont conservées dans `docs/references/v87-player-four-candidates-20260920/` :

| Fichier retenu pour revue | Contenu | Mesure réelle |
| --- | --- | --- |
| echo9-carry-compact-v2.png | Marche en portage : 8 poses droite, 8 gauche ; caisse séparée | 1254 × 1254 RGBA, 16 corps |
| echo9-run-compact-v2.png | Course : 8 poses droite, 8 gauche ; mains libres | 1254 × 1254 RGBA, 16 corps |
| echo9-jump-compact-v2.png | Impulsion, montée, sommet, chute, réception : 8 poses par direction | 1254 × 1254 RGBA, 16 corps |
| echo9-ladder-compact-v2.png | Montée 8 + descente 8, orientées droite ; échelle séparée | 1254 × 1254 RGBA, 16 corps |

Ce sont 64 poses illustrées, pas 64 animations complètes. Aucun remplacement runtime automatique : la préparation des rectangles, des ancrages, des sockets et la vérification temporelle restent à faire. La locomotion normale demeure armée dans le jeu ; une page mains libres ne doit pas la remplacer sans arme bitmap séparée. Le portage humain conserve donc encore sa limitation visuelle actuelle.

## Identité et provenance

Le protagoniste est `player-echo9` / opérateur `echo-9`, au nom configurable. Mara Vega est un PNJ distinct. Référence maître inspectée : `assets/openai/sprites/normalized/player/echo9-marine-locomotion-sheet.png`, SHA256 `f5b25ca6189d0a2891d1a6f60635417238d7dc52bfece7ae20a2cd9dffa21ca3`.

L'outil ImageGen intégré a échoué à ouvrir ce fichier de référence : `fs sandbox helper ... apply deny-read ACLs`. Aucune API/CLI payante, aucune clé utilisée. Les huit générations réussies ont donc été guidées par le descriptif visuel inspecté, sans conditionnement image. Les quatre versions compactes ont le visage découvert, casque avec oreillettes, équipement olive, avant-bras nus, sac radio et insigne. Certains détails de visage/emblème restent redessinés : aucune certification de fidélité 1:1.

Les prompts demandent une taille logique ; la taille réellement produite ci-dessus fait foi. Aucun pixel n'a été retaillé, recoloré, détouré artificiellement ou remplacé. Les prompts privés sont dans `docs/references/v87-player-four-candidates-20260920/prompts.json`.

## Contrôle des quatre versions compactes

- Chaque PNG possède exactement 16 grandes composantes à alpha >= 8 et à alpha >= 128, en 4 rangées de 4.
- Aucun crop minimal ne contient une silhouette voisine. Aucun corps ne touche les bords ; alpha de bord maximal 1.
- Aucun fusil, caisse, échelle, barreau ou effet fusionné visible.
- `1254 / 4 = 313.5` : ne pas annoncer des cellules 256. Sur la course, les poses 0/1/3 atteignent y318/316/315 et franchissent le découpage nominal de la première rangée. Utiliser des rectangles mesurés, jamais une grille naïve.
- Fluidité, boucles, contact des mains/pieds et cohérence de taille en jeu ne sont pas certifiés.
- Portage : manque attente, prise/dépose, échelle et blessures. Course : manque marche/attente. Saut : séquence compacte, pas tous les clips V87. Échelle : manque direction gauche, entrée/sortie et attente.

## Première génération dense non acceptée

Conservée à titre privé, exclue du runtime/public :

- Carry candidate : 68 corps, rangées 8/10/8/8/8/10/8/8 au lieu du contrat 64/8×8.
- Locomotion candidate : 64 corps sur 6 rangées irrégulières ; visage couvert non conforme et 19 crops contaminés par un voisin.
- Jump candidate : 64 silhouettes mais 63 composantes alpha>=8/16 ; deux poses reliées par une frange jusqu'à alpha117.
- Ladder candidate : 60 corps au lieu de 64, descente non certifiée.

La correction a réduit la densité à 16 poses par page. Les versions denses ne sont ni supprimées, ni comptées comme assets terminés. Aucun fichier de cette revue, prompt ou image candidate ne doit entrer dans GitHub public ou Vercel.
