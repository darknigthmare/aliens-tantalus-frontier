# V164 — Poches opaques des PNJ

Les portraits de Maksim, Inez, Asha et Mara conservaient de petits fonds blancs
opaques dans les vides entre leurs membres. Le rendu V134 traite le RGB des
franges translucides et préserve les pixels opaques ; les portraits de dialogue
affichaient directement la feuille source.

Le correctif applique les mêmes masques exacts au drawable humain et au portrait
DOM. Il couvre 24 régions de 16 cellules, soit 1 584 pixels initialement opaques.
Les quatre PNG sont conservés octet pour octet. Les vêtements clairs, les autres
pixels et les dimensions des cellules restent intacts. Mara cellule 2 a été
examinée sans trou à corriger et reste inchangée.

Le runtime vérifie les octets RGBA des pixels ciblés avant de préparer un
drawable. Les tests vérifient aussi les SHA-256 complets des quatre sources.
Le cache supplémentaire retient au plus quatre drawables, soit 16 Mio de pixels ;
cette limite ne représente pas toute la mémoire du moteur.

La recette dédiée importe des profils déclarés à 05 h 30, rejoint les quatre PNJ
par les commandes de déplacement et ouvre leurs dialogues avec E. Un cinquième
passage vérifie le portrait d’Inez à 390 px. Les planches source/rendu des
16 cellules sont des fixtures séparées. La recette est intégrée au job
crew-lifts existant, avec ses rapports et PNG.

Les franges claires extérieures et les autres poses ne sont pas automatiquement
nettoyées. Cette correction ne certifie ni une nouvelle animation complète,
ni un costume complet, ni une fidélité artistique 1:1. Forge reste reportée.

Le classeur V163 décrit son propre lot et ses contrats de prépublication.
Ses résultats finaux restent liés au commit 043bb60 et à la fusion 8a934b7 ;
ils ne sont pas transférés comme résultats de ce correctif.
