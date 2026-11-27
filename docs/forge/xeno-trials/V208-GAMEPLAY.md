# Xeno Trials V208

V208 prolonge l’édition autonome et le mode intégré de Tantalus Frontier depuis le même moteur. Le roster et le catalogue d’arènes conservent leurs identifiants. Les commandes, le banc d’essai et les ateliers sont accessibles depuis les deux éditions.

## Actions

| Action | Clavier | Manette standard |
| --- | --- | --- |
| Parade frontale de mêlée | V | Stick droit vers le bas |
| Parade d’une frappe basse | C + V | Stick gauche puis stick droit vers le bas |
| Signatures supplémentaires selon le spécimen | H / O | Stick droit à gauche / à droite |
| Super de riposte après une parade | S + I | Garde + RT / RB |
| Franchissement au sol du Snake Alien et du Power Loader automatisé | Saut | A / croix vers le haut |
| Finition après victoire confirmée | F | Bouton de l’interface |

Le tactile propose les mêmes commandes. La parade dure huit ticks à 120 Hz, coûte neuf points d’endurance et ouvre une fenêtre maximale de 42 ticks contre l’assaillant identifié. Les impacts à distance, de zone et de flanc contournent cette défense. La riposte consomme la jauge pleine et exige que l’assaillant soit encore engagé dans son attaque.

## Couverture de la bible V146

| Fiche | Nouveaux cas jouables |
| --- | --- |
| 05_Moveset | Parade haute ou basse, réaction à la frappe basse et franchissement au sol pour deux morphologies identifiées. Les collisions, l’endurance et les verrouillages d’entrée restent ceux du moteur. |
| 06_Signatures | 70 nouvelles techniques reliées aux entrées exactes de 60 spécimens. Dix spécimens reçoivent deux nouvelles commandes. L’anticipation, le contact, l’interruption et la récupération sont mesurés dans la simulation. |
| 07_Supers | Ripostes distinctes pour Pathogen Brute, Pathogen Queen, Warden et Harbinger. Les supers existants restent disponibles avec I seul. |
| 08_Finitions / 12_Compatibilite | Trois contacts supplémentaires entre le Cultiste, le Commando et le Gardien. Le Prowler peut actionner un verrou au réacteur et au sas d’extraction si la griffe atteint la borne et si la cible se trouve dans le canal marqué. Les finitions interviennent après le règlement de la victoire. |
| 14_Recette | Cinq nouveaux ateliers portent le total à 14. Ils couvrent la reprise intermanche, le verdict nul, l’interruption d’une signature, la parade suivie d’une punition et le super de riposte. Le banc libre permet de régler le duel, l’IA, l’arène et les ressources initiales. Les essais se jouent sans gain ni ticket classé. |

Les nouvelles actions et finitions sont des adaptations de jeu qui réutilisent les ressources intégrées. Les relevés de référence, les gestes dessinés propres aux incarnations, les signatures, supers et finitions au-delà des cas listés, ainsi que les 15 propositions hors roster restent ouverts.

## Vérifier et construire

- `npm run test:trials:v208` vérifie les nouveaux cas et leur succession depuis V207.
- `npm run check` vérifie les sources publiques.
- `npm run build:trials` construit le jeu de base dans `dist/` et Xeno Trials dans `dist-xeno-trials/`, à la même révision de source.
- `npm run check:built` et `npm run check:trials:built` vérifient les deux distributions.
