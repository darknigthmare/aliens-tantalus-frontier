# Quickstart: valider le prototype du hangar 2,5D

## Prérequis

- Node 22+, dépendances installées ; Chromium et Playwright préinstallés.
- Serveur de développement : `PORT=4188 node scripts/dev.mjs`.

## Tests automatisés

```bash
node --test scripts/verify-hub-depth-rooms-v188.mjs
npm run test:priorities:v188
npm run test:all          # suites partagées (SC-003 : aucune régression des salles de profil)
npm run check && npm run build && npm run check:built
```

Attendu : 0 échec ; les suites du hub existantes passent sans changer leurs attentes.

## Parcours manuel / navigateur

1. Charger une partie dont le prologue est terminé, puis entrer dans le hub et prendre l'ascenseur jusqu'au pont ingénierie.
2. Depuis le réacteur, marcher vers la gauche : l'annonce « SALLE EN PROFONDEUR · W/S : AVANCER / RECULER » apparaît (US2-1).
3. Entrer dans le hangar, puis :
   - maintenir W : le personnage recule jusqu'à la limite et s'arrête (US1-1) ;
   - passer derrière le dropship : il est masqué, et sa silhouette reste visible (US1-3) ;
   - buter sur une caisse et la contourner (US1-2).
4. Au pied de l'ascenseur, vérifier les deux commandes (US5) :
   - W recule en profondeur sans appeler l'ascenseur ;
   - E appelle l'ascenseur.
5. Parler à un PNJ du hangar avec E dans sa bande de profondeur, puis depuis une autre profondeur : le second essai ne doit rien ouvrir (US3-2, US3-3).
6. Vérifier la sortie et la reprise (US2-3, US4-1) :
   - sortir au fond (z élevé) : le bord bloque ;
   - revenir au rail et sortir : la sortie se fait sans saut ;
   - sauvegarder au fond du hangar, recharger : même position et même profondeur.
7. Charger une sauvegarde antérieure placée dans le hangar : z = 0, rien d'autre ne change (US4-2).

## Mesure de performance (SC-006)

Temps moyen d'image sur 300 images dans le hangar, avant/après, même configuration (script Chromium sans affichage, résultat rapporté tel quel).
