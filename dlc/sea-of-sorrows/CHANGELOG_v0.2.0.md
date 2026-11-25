# v0.2.0 — La remontée des vivants

## Depuis la livraison 0.1.0

| Sujet | 0.1.0 | 0.2.0 |
|---|---|---|
| Campagne principale | 18 chapitres, 33 objectifs | Inchangés ; conditions de sauvetage renforcées |
| Lieux / connexions | 40 / 45 | 46 / 53 |
| Dossiers | 64 | 74 |
| Transport des porteurs | Abstrait par des validations | Deux acteurs physiques, intégrité, escorte et arrimage |
| Travail sur les installations | Validation immédiate | E maintenu, bruit, interruption et progression sauvegardée |
| Soins et filtres portatifs | Non disponibles | Stocks consommables, utilisation clavier et menu |
| Rechargement | Transfert immédiat puis délai | Transfert à la fin d’un délai de 1,1 seconde |
| Distraction | Absente | Leurre acoustique temporaire et perception locale |
| Manning | Tir opportuniste | Riposte par défaut / feu libre commandé ; exclusion de la capture |
| Carte | Liaisons | Liaisons + emprises de la salle actuelle |
| Illustrations du rapport | 9 captures 0.1 | Nouvelles captures issues du véritable moteur 0.2 |

## Corrections découvertes pendant la construction

Les nouveaux seuils des annexes du guidage, des pompes, du belvédère et du conduit étaient initialement dans une emprise bloquante : ils ont été déplacés et leurs chemins recontrôlés. La sécurité de l’A* a été harmonisée avec les marges réelles du déplacement pour éviter les acteurs coincés au bord d’un obstacle. Une destination de suivi dans un couvert est désormais rabattue vers un point libre.

Les brancards suivent avec un intervalle visuel plus large ; les décors de premier plan deviennent translucides lorsqu’ils les masquent, comme pour Decker. Les sorties demandent les deux acteurs à moins de 420 unités du seuil. Les deux corps ne sont plus dessinés une seconde fois dans leur point d’interaction d’origine.

Un clic de souris très bref pouvait commencer et se terminer entre deux images, donc ne produire aucun tir : le premier tir est maintenant traité à l’appui, le maintien reste soumis à la cadence. Le point visé sur le corps de l’ennemi est converti vers sa véritable profondeur, sans retirer le test de couvert.

Les dotations de combustible de la chambre de la reine et de mousse de la soute ne se réinitialisent plus lors d’un simple aller-retour. La desserte s16↔s19 vérifie son alimentation dans les deux sens. Une erreur de stockage ne provoque plus de message mensonger de réussite.

## Ce qui ne change pas de statut

Prototype autonome, non publié ; pas d’adaptateur natif pour Tantalus. Graphismes vectoriels provisoires. Pas de fidélité intégrale au texte, pas de cinématiques doublées, de réseau ou de prise en charge manette. La validation navigateur reste une exécution DOM locale avec stockage de test explicite, la politique du Chromium disponible refusant les navigations natives.
