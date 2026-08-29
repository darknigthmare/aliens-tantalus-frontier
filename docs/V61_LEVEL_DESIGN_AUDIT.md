# Audit level design V61 — USS Tantalus

Date : 28 août 2026

## Verdict

La V61 corrige cinq défauts P0 visibles de la V60 : absence d’écran titre, landmarks de briefing et d’armurerie trop petits, ouverture brutale de catalogues hors du niveau, poste de contrôle du hangar absent et quatre couches MID comportant de faux passages peints. Le Tantalus reste un niveau continu de 5 120 unités, quatre ponts et seize salles ; les interfaces d’opérations et d’armurerie sont maintenant atteintes depuis des objets physiques et restent superposées au niveau mis en pause.

Cette passe n’autorise pas l’étiquette « contenu artistique complet ». La source UD-4L à résolution finale, les pièces de costumes composables, la Harpoon Gun encore sans plaque et quatre familles d’armes à identité ambiguë ou absente restent suivies dans la matrice V61.

## Comparaison aux huit références

| Référence | Résultat V61 | Preuve |
|---|---|---|
| Écran d’accueil planète/vaisseau | Corrigé | bitmap 16:9 OpenAI, état inactif, menu clavier/souris/manette, reprise et nouvelle chronologie confirmée |
| Matériaux/props industriels | Corrigé partiellement | médical, laboratoire, quarantaine et support-vie régénérés en couches RGBA ; kit de petits props supplémentaires encore P1 |
| Poste de contrôle du hangar | Corrigé | booth RGBA indépendant 1 024 × 512, dessiné en arrière-plan du dropship, zone physique au sol et interaction vers la station d’opérations |
| Table d’opérations | Corrigé | prop RGBA 1 024 × 512, rendu à 520 × 260, centré à 50 % de la salle, collider auteur 480 × 142 |
| Comptoir d’armurerie | Corrigé | prop RGBA 1 024 × 512, rendu à 580 × 290, placé à 54 % de la salle, collider auteur 520 × 136 |
| Équipement tête/torse | Corrigé au niveau interface, art modulaire incomplet | mannequin bitmap dédié, filtres armure/morphologie/palette/usure, sélection persistée ; les 392 entrées réemploient encore huit familles |
| Dialogue portrait | Corrigé pour opérations et armurerie | portraits dédiés de Mara Vega et Sanaa Doyle, dialogue modal, focus, échappement et reprise du niveau |

## Proportions et perspective

- Le joueur du hub passe de 110 × 148 à 92 × 128 pour un collider 44 × 92 ; les PNJ passent de 92 × 140 à 82 × 126. Les silhouettes restent lisibles sans dépasser autant les contacts.
- Les deux landmarks P0 occupent désormais environ 41 % et 45 % d’un écran logique 1 280 px, contre 15 % environ en V60.
- Les quatre MID corrigés font exactement 1 774 × 887, utilisent un alpha réel et libèrent les extrémités pour les portes runtime.
- Le booth du hangar est rendu à 340 × 170 dans la moitié droite de la salle, derrière l’UD-4L ; sa zone d’usage 286 × 298 descend jusqu’au sol sans créer de collision invisible.
- Le HUD mobile ne réduit plus le panneau desktop complet à quelques pixels : sous 600 px, il affiche seulement pont, salle et action dans une typographie logique de 24–30 px, complétée par le readout DOM.

## Cohérence de circulation

La table et le comptoir deviennent des obstacles auteurs franchissables. Le joueur doit les contourner ou les franchir, puis utiliser leur zone d’interaction. L’ouverture d’une station :

1. persiste la position ;
2. met le niveau en pause sans recréer le joueur ;
3. affiche un dialogue contextualisé ;
4. ouvre l’interface au-dessus du hub ;
5. restaure la même simulation à la fermeture.

Les portes, ascenseurs, sockets et seize profils de traversée V60 ne sont pas remplacés.

## Restes P0/P1

- P0 : produire la plaque 4 × 4 de la Harpoon Gun, seule famille encore reliée sans ambiguïté au classeur Excel ; M39, M42A, M6B, M83 SADAR, M5 RPG, M94, F44AA, Type 88 et AK-4047 sont fermées dans cette passe.
- P0 : garder Heavy Pulse, Plasma, ES-4, Compound Bow et trois châssis bloqués tant que l’identité exacte n’est pas résolue.
- P1 : remplacer la source UD-4L agrandie par un master proche de la résolution d’affichage.
- P1 : remplacer la coloration runtime des costumes par huit familles de couches bitmap composables sur les cinq banques d’animation joueur.
- P1 : produire des variantes visuelles uniquement pour les modificateurs ennemis matériels au lieu de dupliquer 516 entrées.
