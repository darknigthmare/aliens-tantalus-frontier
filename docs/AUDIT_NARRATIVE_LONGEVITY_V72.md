# Audit narration et durée de vie V72

Date : 2026-09-05. Périmètre vérifié : QZ-17, lecteur d'archives partagé hub/mission, conditions de découverte, comparaison, verdict et reprise de progression. Ce n'est pas une relecture exhaustive de tous les chats historiques ou du fichier Excel.

## Corrections effectives

| Priorité | Problème | Résultat |
| --- | --- | --- |
| P1 | Un registre découvert explicitement vide rendait visibles toutes les entrées dépourvues de marqueur discovered. | Une entrée sans découverte explicite ni preuve dans le registre reste cachée. |
| P1 | Les textes leftText/rightText d'une relation pouvaient révéler une preuve non découverte ou remplacer ses mots. | Les deux déclarations doivent appartenir aux preuves récupérées ; leur texte exact est conservé, sans substitution inline. |
| P1 | available=true pouvait annoncer une confrontation disponible avec des preuves absentes ou un choix déjà exclu. | Disponibilité intersectée avec les preuves réelles, l'absence d'application préalable et l'exclusivité du choix. |
| P1 | Le lecteur annonçait par défaut « Conclusion enregistrée » même si le domaine renvoyait applied=false. | Refus et absence de confirmation ont un état honnête ; aucun succès inventé. |
| P1 | Fermer un dialogue après Alt-Tab pouvait réactiver le combat ; P depuis son texte pouvait modifier la pause derrière le lecteur. | Le lecteur respecte une perte de focus survenue pendant son ouverture ; les raccourcis gameplay sont exclus des dialogues ; entrées et sauts tamponnés sont vidés. |

Les identifiants, noms, corps des quatre documents, déclarations, relations, options et événements sources de narrative-collectables-v68.js n'ont pas été réécrits. Les témoignages contradictoires restent contradictoires : ils constituent la mécanique d'enquête, pas une erreur de lore à gommer.

## Lore et fidélité : ce qui est réellement vérifié

- Le contrat local déclare QZ-17 comme project-fiction-not-franchise-canon. Ce statut est préservé ; l'enquête n'est pas présentée comme une scène canonique d'un film ou d'un jeu officiel.
- Quatre preuves textuelles physiques, graphe de déclarations et choix de route sont raccordés au niveau. Aucun lecteur audio/vidéo fictif n'est ajouté.
- Les comparaisons ne produisent pas de nouveau contenu narratif : elles citent les déclarations effectivement récupérées.
- Ce lot ne constitue pas une certification de fidélité 1:1 des 571 profils ennemis ni une vérification externe de tous les faits de franchise.
- Attention aux métadonnées historiques : enemy-visual-overrides-v56.js déduit canonExact de CANON_REFERENCE, ce qui décrit la référence choisie, pas une validation pixel par pixel de l'image obtenue. De même, releaseReady hérité peut désigner une disponibilité technique. Ces marqueurs ne doivent pas être affichés comme certificat « fidélité 1:1 vérifiée » ; aucune réécriture globale de ces flags n'est faite dans cet audit.

## Durée de vie et progression

Le contenu QZ-17 vérifié représente une enquête de quatre preuves et un verdict à deux options. Deux routes exclusives sont une variation de progression réelle, pas deux campagnes entièrement rédigées supplémentaires. Les tests existants vérifient notamment :

- collecte à portée physique et placement sur les surfaces du niveau ;
- impossibilité d'extraire avant les quatre preuves et un verdict persistant ;
- conduit/porte de sortie liés au verdict ;
- impossibilité de changer librement le choix exclusif, de redonner une récompense déjà obtenue ou de dupliquer une preuve en rechargeant ;
- migration et reprise conservant la progression.

Les corrections gameplay V72 associées empêchent également de gagner de l'oxygène en rechargeant une mission, de perdre une sentinelle déjà payée ou de ralentir indéfiniment un ennemi par accumulation dépendante du framerate. Elles préservent les conséquences du jeu, sans allonger artificiellement la durée par des pertes injustes ou du répétitif.

Aucune durée en heures n'est annoncée : elle doit être mesurée par playthroughs de joueurs, selon parcours et difficulté. Le nombre de campagnes du catalogue ne mesure ni le nombre de niveaux narratifs uniques, ni la variété d'une partie complète.

## Tests et limites

- Quatre régressions narratives ont échoué avant correction, puis réussi après correction.
- narrative-archives-ui-v68.test.mjs : 19 tests réussis après la correction de focus.
- narrative-collectables-v68.test.mjs et narrative-collectables-runtime-v68.test.mjs : régressions de collecte, choix, extraction, récompenses et reprise réussies durant ce lot.
- La validation globale de publication demeure celle de l'intégrateur ; aucune certification commerciale ou audit de toutes les conversations n'est revendiqué ici.

Restent à mesurer/produire : playthrough complet multi-difficulté, rythme entre missions, proportion de niveaux distincts réellement écrits, renouvellement des situations/rencontres, lisibilité audio-visuelle prolongée, totalité des médias/animations dédiés et couverture des chats encore partiels/manquants. L'audit ne marque pas ces dettes comme terminées.
