# Audit gameplay V72 — corrections effectives

Date : 2026-09-05. Copie de travail : D:/CodexWork/aliens-tantalus-frontier/project.

Périmètre : moteur de production réellement importé par l'application, entrées, pause, cycle RAF, combat des équipements et reprise native. Ce rapport ne certifie pas le jeu commercial complet, ni la couverture artistique du catalogue.

## Défauts corrigés

| Priorité | Défaut vérifié | Correction livrée |
| --- | --- | --- |
| P1 | Soins, interactions et équipements restaient utilisables en pause ou suspension de chargement des atlases. | Garde commune des huit actions publiques au sommet de la pile moteur ; aucune ressource ni état muté pendant suspension. |
| P1 | Le coéquipier désactivé pouvait consommer les médikits partagés ; un moteur arrêté pouvait encore accepter des commandes directes. | Validation acteur vivant, co-op activée, mission active et moteur en cours. |
| P1 | Les touches dans un champ texte pouvaient soigner, sauter ou mettre le jeu en pause. | Routage excluant formulaires, éléments interactifs, édition, composition IME et raccourcis Ctrl/Alt/Meta. |
| P1 | Changer d'onglet laissait la simulation combattre ; des sauts tamponnés reprenaient après pause. | Pause explicite sur blur/onglet masqué, suppression des touches, vitesse horizontale et sauts tamponnés ; retour au jeu sans reprise automatique. |
| P1 | Stop/start rapide laissait deux callbacks RAF actifs et exécutait deux pas de simulation. | Jeton de génération invalidant les callbacks d'une ancienne mission ; une seule boucle planifiée. |
| P1 | Reprendre avec un fusil réduisait son chargeur aux 12 cartouches du pistolet initial. | Restauration du mode et du vrai chargeur catalogué avant ses munitions. |
| P1 | Brouillage/confinement multipliaient la vitesse à chaque frame ; restraints/pièges ne restituaient pas la vitesse. | Facteurs temporaires non cumulés, compteurs en secondes, restauration de la vitesse permanente. Vérification à 30/60/120 mises à jour par seconde. |
| P1 | Sentinelles touchaient à travers les portes/planchers et choisissaient uniquement la distance X. | Portée 2D, exclusion ennemis dormants/en conduits, rayon d'occlusion sur murs, plateformes et portes fermées. |
| P1 | Reprendre réinitialisait l'oxygène, perdait les effets payés et supprimait les sentinelles/pièges déjà consommés. | Extension native gameplaySupportV72 conservant oxygène, durées restantes, bonus, états de statut et déploiements ; paramètres offensifs reconstruits à partir de l'équipement connu. |
| P1 | Queen et Ripper Queen avaient une silhouette presque humaine, parfois plus petite qu'un Drone récent. | Rendu 448×340, silhouette/corps 336×268,28, pivot des pieds conservé, hitbox physique et tir alignées ; distances de contact bilatérales adaptées. Les anciennes sauvegardes royales migrent leur ancrage au sol. |

Les doublons, objets d'équipement inconnus, indices d'utilisation inexistants et déploiements de type contradictoire sont rejetés à la restauration. La reprise répétée reste idempotente. Cette validation n'est pas un système anti-triche serveur.

## Vérification

- tests/gameplay-safety-v72.test.mjs : 14 tests dédiés, dont un aller-retour sérialisé de victoire ordinaire et les contrats de silhouette/collision/reprise des reines. Les cinq premières régressions ont été exécutées avant correction : 0/5, puis 5/5 après correction.
- Tests ciblés existants : production-gameplay-runtime, mission-resume-state, native-resume-persistence réussis après intégration initiale.
- Syntaxe du nouveau module vérifiée ; git diff --check sans erreur.
- Lot élargi après correction : 61/61 tests gameplay/narration/cache réussis ; 37/37 tests supplémentaires objectifs/persistance/Alpha-Bravo/Survival réussis. Lint global : 281 modules valides au moment de cette exécution.
- Dernier passage croisé après échelle royale et correctifs level : 92/92 tests réussis. Les deux gardes de conduits comparant undefined à undefined ont également été corrigées par l'audit level (dégâts et mise à jour ennemie hors réseau).
- La première exécution de la suite globale durant les audits parallèles a rencontré des contrats hub/PWA à synchroniser par l'intégrateur. Se référer au bilan final de validation, pas à ce rapport, pour le verdict de publication.

## Limites et suite requise

L'échelle royale est une hiérarchie visuelle de gameplay, pas une mesure canonique en mètres. La référence licenciée NECA présente sa Queen de plus de 15 pouces comme assortie à sa gamme 7 pouces : [fiche NECA Queen](https://necaonline.com/2014/06/aliens-xenomorph-queen-ultra-deluxe-boxed-action-figure/). Cela appuie la différence marquée de gabarit ; la Ripper Queen reste une adaptation du projet. L'implantation dans un volume d'arène suffisamment ouvert est traitée dans l'audit level associé ; on ne réduit pas automatiquement la reine pour la faire passer dans une porte humaine.

- Aucun playthrough humain exhaustif des campagnes ni preuve de durée de vie en heures n'est produit par ces tests.
- Les équipements restent de petits acteurs runtime ; leurs visuels dédiés et animations ne sont pas tous disponibles.
- Les sauvegardes historiques sans gameplaySupportV72 restent compatibles, mais les effets qu'elles n'ont jamais enregistrés ne peuvent pas être reconstruits rétroactivement.
- Les journaux de coups/VFX/projectiles transitoires ne sont pas réinjectés à la reprise. L'extension préserve les déploiements persistants, pas tous les détails visuels d'une frame.
- Les ralentissements V72 préservent la vitesse permanente courante ; d'autres états de combat spécialisés gardent leurs contrats propres et nécessitent encore des essais visuels prolongés.
- La cible reste un jeu jouable professionnel. Nombre de campagnes, fichiers ou tests ne signifie pas à lui seul niveau de finition commercial.
