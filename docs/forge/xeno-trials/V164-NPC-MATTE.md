# V164 — Poches opaques des PNJ

Les portraits de Maksim, Inez, Asha et Mara conservaient de petits fonds blancs
opaques dans les vides entre leurs membres. Le rendu V134 traite le RGB des
franges translucides et préserve les pixels opaques ; les portraits de dialogue
affichaient directement la feuille source.

Le correctif applique les mêmes masques exacts au drawable humain et au portrait
DOM. Il couvre 25 régions de 16 cellules, soit 1 835 pixels initialement opaques.
Les quatre PNG sont conservés octet pour octet. Les vêtements clairs, les autres
pixels et les dimensions des cellules restent intacts. Mara cellule 2 a été
examinée sans trou à corriger et reste inchangée. Le vide confirmé sous le bras
d’Inez, cellule 2, est inclus ; la petite zone ambiguë de sa cellule 3 reste intacte.

Le runtime vérifie les octets RGBA des pixels ciblés avant de préparer un
drawable. Les tests vérifient aussi les SHA-256 complets des quatre sources.
Le cache supplémentaire retient au plus quatre drawables, soit 16 Mio de pixels ;
cette limite ne représente pas toute la mémoire du moteur.

La recette dédiée importe des profils déclarés à 05 h 30, rejoint les quatre PNJ
après une commande native de récupération de 5 h ou de recherche de 12 h, observe
leur marche aller et ouvre leurs dialogues dans les annexes avec déplacement et E.
La fixture d’Asha ajoute les 20 points de recherche requis ; les autres ressources
gardent leurs valeurs par défaut. Les heures stratégiques ne représentent pas
des heures de marche observée. Un cinquième
passage vérifie le portrait d’Inez à 390 px. Les planches source/rendu des
16 cellules sont des fixtures séparées. La recette est intégrée au job
crew-lifts existant, avec ses rapports et PNG.

Les franges claires extérieures, les zones non confirmées même dans ces cellules
et les autres poses ne sont pas automatiquement nettoyées. Cette correction ne certifie ni une nouvelle animation complète,
ni un costume complet, ni une fidélité artistique 1:1. Forge reste reportée.

Le classeur V163 décrit son propre lot et ses contrats de prépublication.
Ses résultats finaux restent liés au commit 043bb60 et à la fusion 8a934b7 ;
ils ne sont pas transférés comme résultats de ce correctif.

Le cache du worker servi depuis les sources porte une identité V164 distincte,
pour préserver le cache V163 si le nouveau précache échoue. La distribution
construite garde son identité dérivée de ses véritables entrées.

Le harnais Trials copie les pixels du frame et son état dans un canvas d’évidence
détaché avant d’envoyer P ; il compresse ce buffer après la pause confirmée.
Les buffers de résistance et de sortie sont aussi conservés avant leur encodage.
Les six duels, les rôles, les budgets et les assertions d’identité, de contact
et de sol sont conservés. Cette modification du harnais ne change pas le combat.
