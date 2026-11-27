# Xeno Trials V207

Le terminal MIRE donne accès aux simulations clandestines de Weyland-Yutani. Le jeu de base conserve l’enquête Arbiter et ses six retours stratégiques. Dans l’édition autonome, les 19 missions de la campagne Xeno Trials ouvrent l’accès aux 40 simulations des archives Arbiter. Les deux éditions partagent le moteur, les 189 combattants et les 131 arènes.

## Commandes ajoutées

| Action | Clavier | Manette standard |
| --- | --- | --- |
| S’accroupir | Maintenir C | Stick gauche vers le bas |
| Frappe basse | C + J | Stick gauche vers le bas + X |
| Esquive avant ou arrière | Maj + direction | R3 + direction |
| Frappe d’avance | J au début de l’esquive avant | X au début de l’esquive avant |
| Anti-aérien | U | Stick droit vers le haut |
| Verrou final après un KO compatible | F ou bouton | Bouton de l’interface |

Les commandes de combat sont aussi disponibles au tactile. L’esquive consomme de l’endurance et comporte une récupération. La garde haute laisse passer les frappes basses. Les contrôles réagissent aux changements de phase, à la pause et à la reprise d’un duel ou d’une horde.

## Couverture de la bible V146

| Fiche | État V207 |
| --- | --- |
| 05_Moveset | Accroupissement, frappe basse, esquive directionnelle, frappe d’avance et anti-aérien jouables. Les profils existants continuent de définir la géométrie et les attaques propres aux combattants. |
| 08_Finitions | Verrou final facultatif du Prowler contre le Cultiste, le Commando WY ou le Gardien lorsque le KO laisse les ancrages à portée. Le résultat est déjà enregistré au moment de l’activer. |
| 14_Recette | Neuf ateliers natifs couvrent le contact, la garde, l’esquive, le bris de garde, la saisie, le super, la frappe basse, l’anti-aérien et l’attaque d’avance. Les ateliers restent en dehors des gains de combat. |

La bible reste ouverte sur la validation des kits et des animations par identité pour les 189 incarnations, les signatures et supers encore à produire, le reste des finitions, les 15 propositions hors roster et les relevés de référence prévus pour chaque adaptation. Les animations communes de V207 s’appuient sur les sprites déjà intégrés.

## Distribution

- `npm run dev` sert le jeu de base et l’entrée `/xeno-trials.html`.
- `npm run build:trials` produit le jeu de base dans `dist/` et l’édition autonome dans `dist-xeno-trials/`.
- `npm run check:built` et `npm run check:trials:built` valident les deux distributions.
- `npm run test:trials:v207` vérifie le gameplay V207, la sauvegarde et les sources des deux éditions.

Pour jouer depuis le dossier autonome, lancez `python3 -m http.server 4173 --bind 127.0.0.1 --directory dist-xeno-trials`, puis ouvrez [Xeno Trials](http://127.0.0.1:4173/). Le navigateur installe les ressources de lancement et conserve les ressources des arènes déjà chargées. L’édition autonome possède son propre profil local, exportable et réimportable depuis le terminal. Sur un hébergement statique, servez le contenu de `dist-xeno-trials/` à la racine de son domaine.
