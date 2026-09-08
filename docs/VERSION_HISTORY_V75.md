# Version 75.0.0 — intégration ennemis Prowler et Ceto

8 septembre 2026. V75 est un jalon incrémental de production ennemis, pas une certification de campagne complète, de qualité commerciale globale ou de fidélité visuelle 1:1.

Deux profils disposent désormais d’une identité animée dédiée acceptée et réellement reliée au runtime :

- **enemy-015-prowler** : atlas de 32 poses, échelle et racines physiques revues, attaque en bond balayé avec impact unique et reprise testée ;
- **enemy-051-ceto-reef-predator** : atlas original de 32 poses, pivot aquatique, volume de bassin dédié, morsure soumise à la ligne de vue et mort terminale tenue.

Deux autres corrections ne franchissent volontairement pas la revue :

- **enemy-011-lurker** : les essais de bond R1/R2 sont rejetés pour contamination de matière magenta et identité/animation encore instables ; aucun remplacement V75 n’est chargé par le runtime ;
- **enemy-023-atarax-ripper** : le candidat passe les contrôles techniques d’alpha, de cellules et d’échelle, mais reste rejeté faute de transfert de poids convaincant et d’attaque pleinement engagée ; il n’est pas exposé par le registre runtime.

Le [snapshot central V75](references/V75_ENEMY_PROGRESS.json) compte **11 profils intégrés** et **559 profils non finalisés** parmi les 570 profils suivis par le pipeline de production. Le roster total de 571 inclut en plus le profil Facehugger de référence déjà intégré hors de cette file. Les états `generated`, `ready-generation` ou `review-rejected` ne valent ni acceptation artistique ni intégration runtime.

- [Validation locale et limites du jalon](VALIDATION_V75.md)
- [Provenance des images et décisions de revue](ART_PROVENANCE_V75.md)
- [Matrice maîtresse des écarts issus des conversations](references/V76_CHATGPT_PROJECT_GAP_MATRIX.md)

La QA globale, le parcours navigateur, la copie propre et la publication GitHub/Vercel restent **en attente de la gate complète V76**. Aucun statut distant n’est déduit de ce jalon local ; V75 ne doit donc pas être présenté comme une livraison publique complète.
