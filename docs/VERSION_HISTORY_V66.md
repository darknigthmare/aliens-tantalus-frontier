# V66 — Production par lots, premier lot ennemi

Périmètre : Ovomorph, Chestburster, Drone / Big Chap, Warrior et Runner standard.
Vingt planches sources OpenAI, huit poses par planche : 160 poses, cinq atlas.
Le Facehugger V65 reste un travail antérieur ; il n'est pas recompté.

## Intégration

- Repos, déplacement, attaque et mort ont chacun huit poses. L'œuf emploie son cycle propre : fermé, ouverture, éclosion, destruction.
- L'attaque suit l'horloge de combat ; son impact n'est pas rejoué lors d'un changement de cible, d'une interruption ou d'une reprise de sauvegarde.
- L'éclosion libère un acteur Facehugger V65 réel, une seule fois, dans une position libre et soutenue. Une sortie obstruée suspend la libération.
- La navigation et le combat partagent la cible verrouillée joueur, coop ou escouade. Une transition d'étage annule l'attaque avant l'impact.
- Le chemin d'attaque contre l'escouade traverse désormais ces contrôles dans la composition réelle `Mission(Level(Core))`, et pas seulement dans un montage de test.
- Le brouillage et l'étourdissement de l'œuf expirent ; ouverture et éclosion reprennent leur progression sans resemer ni dupliquer l'enfant.
- Les pas de bond sont balayés et vérifient le support : aucun impact au-dessus d'un vide suivi d'un retour artificiel.
- La locomotion animée utilise le déplacement réel après collisions. Les cadavres ne poursuivent pas la navigation.
- Les dimensions physiques du Facehugger issu de l'œuf correspondent désormais à sa hitbox rendue, au lieu de l'ancien rectangle générique de 74 px de haut.
- Le bestiaire/laboratoire permet de choisir et rejouer les quatre séquences. Les morts et l'éclosion restent sur leur pose terminale.
- Les images restent chargées à la demande via le LRU existant ; le cache hors-ligne ne précharge pas les 571 profils.

## Production et limites

La file contient 570 profils restant après le Facehugger V65, répartis en 114 lots de cinq. Les contrats par famille demandent 2 457 planches sources ; cela constitue une quantité à produire, jamais une déclaration de couverture.

Le premier lot seul est travaillé ici. Les autres profils gardent leur état réel : référence à vérifier, art manquant ou ancienne couverture. Une variante n'hérite pas automatiquement d'un atlas standard dédié.

Les cellules carrées gardent un rendu isotrope. Les échelles inter-clips et les repères corporels sont revus séparément ; une longue queue ne sert pas de centre physique. Ces adaptations ne certifient pas une reproduction pixel pour pixel des références, ni un jeu commercial intégralement terminé.

Les tailles finales ont été confrontées au marine affiché (111,6 px), et non uniquement à son rectangle logique de 92 px. Les sources, prompts et contacts QA restent dans le dépôt, hors du déploiement. Les preuves textuelles V66 utilisent LF pour garder les mêmes empreintes SHA-256 sous Windows et Linux.

## Vérification

Les résultats effectifs de la passe finale sont consignés dans `V66_BATCH_001_VALIDATION.md`. L'accès navigateur a échoué avant connexion sur le helper Windows (`apply deny-read ACLs`) : les tests du moteur et les contacts graphiques ne remplacent pas une validation visuelle en jeu. Ne pas promouvoir automatiquement l'aperçu en production sur la seule foi des tests Node.
