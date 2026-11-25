# Research: Hub Asphodèle, missions de la station, contrats, CIN-70 à CIN-72

## R1 — Moteur (Q22 A)

- **Decision**: un mixin `withHubAsphodeleV188` (`src/hub-asphodele-v188.js`) appliqué en dernier sur la chaîne du hub dans `app.js`, sur le modèle du quai de Port-Méridien (`hub-port-meridien-v90.js`) : quand la sauvegarde place Echo-9 à bord, il possède le lieu ; sinon il est inerte.
- **Réutilisé** : physique d'annexe `updateAnnexPhysicsV71` (sol, sauts, caméra), rendu du joueur du hub, règles de profondeur de la spec 001 (`stepDepthMoveV188`, empreintes, bande de porte ±20, bande d'interaction ±24), plaque d'invite des annexes, dialogue de scène `content-gap-ui-v188.js`.
- **Rejeté** : Frontier Forge (en attente, modules épinglés) ; menu de navigation (§42.1 l'interdit) ; nouveaux ponts dans `HUB_DECKS` (réseau de portes et d'ascenseurs du Tantalus, risque sur la reprise du vaisseau).

## R2 — Plan de la station (Q23 A)

- **Decision**: quais, anneau et rayon A en **V2** (sol parcouru en profondeur, W/S) ; les modules en **V1**. Les quais sont un module, mais un grand sol d'arrimage : règle du propriétaire « profondeur seulement pour un grand sol, sprites jamais mis à l'échelle ».
- **Ensemble minimal** pour la bible : les modules dont les fonctions sont demandées ailleurs — quais (navettes, §7.3), plan (anneau + rayon, §42.1), pont de contrôle (contrats, CASSIUS), salle des relais (*Transmettre*), laboratoire de transit (S3), mémorial, serre et marché (annexes de §7.2). Les quatre autres modules de §42.2 sont des portes scellées visibles avec leur raison.

## R3 — Voyage

- **Decision**: la navette part du **hangar du Tantalus**, depuis le dialogue d'embarquement de l'UD-4L (le flux existant du dropship), et arrive au **sas 1 des quais**. Retour par le même sas.
- **Rationale**: Asphodèle est en orbite de Cocyte, le système où se trouve déjà le Tantalus. Un saut galactique (`galaxy-travel-v188.js`) coûte 14 jours d'hypersommeil (§13.2) : il contredirait la proximité. §7.3 et §42.2 décrivent les quais comme le lieu des « navettes vers la colonie et le Tantalus ». Le Tantalus doit être à Cocyte (`galaxy.shipWorldIdV116`) : sinon le bouton est grisé avec sa raison.
- **[PROPOSÉ]** : pas de coût en temps ni en carburant ; une opération part toujours du hangar du Tantalus (l'UD-4L quitte la station au lancement).

## R4 — Contrats et salle des relais

- **Decision**: six contrats rejouables (`station-c-*`, objectifs existants de §7.2) comptés dans `asphodeleHubV188.contracts` à chaque opération réussie (`finalizeOperation`, transaction unique). La salle des relais s'ouvre à trois « Relais en dérive » (§7.3, §42.2) ; E sur les baies la met en ligne.
- **Prédicat** : `asphodeleRelayReadyV188(save)` = station reprise ∧ trois relais ∧ baies en ligne. Lu par défaut par `finalChoiceOptionsV188` ; l'Acte V (spec 006) construit le choix et les fins.

## R5 — Fidélité (aucune fidélité « 1:1 »)

| Élément | Apparence documentée (source citée) | Adaptation du projet | À définir |
| --- | --- | --- | --- |
| Station de relais, quais et coursives | Station Sevastopol, *Alien: Isolation* (2014) : tôles rivetées, bandes jaune-noir, écrans CRT, portes massives | Asphodèle est une création du projet (station Seegson du réseau QZ, §7.1) ; anneau tournant, rayon, moyeu [PROPOSÉ] | Décors, portes et props finaux (emplacements `asph-*`) |
| Salle d'opérations | Salle des opérations de Hadley's Hope, *Aliens* (1986) : moniteurs, carte murale, plafond bas | Pont de contrôle avec carte du réseau QZ et noyau CASSIUS | Interface de la carte, voix de CASSIUS |
| Système de bord | Seegson et son IA de station qui applique ses consignes, *Alien: Isolation* (2014) | CASSIUS (création du projet), sans visage, CRT verts et une onde | Voix, typographie |
| UD-4L Cheyenne | *Aliens* (1986) | Vu à travers le hublot du sas 1 | Image (emplacement `asph-ud4l-docked`) |
| Echo-8, Kessler, Grue, Crucible | — (créations du projet, §7.2, §7.4) | Silhouettes en primitives ; noms et lignes [PROPOSÉ] | Visages, costumes |

Le détecteur trompé par l'air en mouvement et les caméras de casque d'*Aliens* (1986) restent la référence de CIN-70 et CIN-72 (déjà citée en spec 005). Une image générée plus tard ne certifiera pas une fidélité.

## R6 — Cinématiques

- **Decision**: `src/station-cinematics-v188.js` (données, deux nouveaux types de plan, deux décors en mètres) étendu dans `CINEMATICS_V188` et `cinematicSetLayoutV188`. Déclenchement : `stationCinematicDueV188` (pur), joué à l'ouverture du Commandement et à la fin de la quête de Rook.

## R7 — Plaque de Kessler

- **Decision**: §7.4 : « Si la plaque est ramenée au Tantalus, elle est déposée dans le casier vide. » Disponible après S3 ; geste physique au casier du Tantalus. §42.2 cite un « casier de Kessler » au mémorial : interprété comme le nom de Kessler au mémorial, avec renvoi au casier du Tantalus [PROPOSÉ, à confirmer].
