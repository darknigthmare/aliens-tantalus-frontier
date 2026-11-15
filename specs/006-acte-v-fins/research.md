# Research: Acte V « Non viable », conseil de guerre, fins et épilogue

## R1 — Les missions finales sans nouveau runtime (Q1)

- **Decision**: trois missions ordinaires par ligne, sur les gabarits existants : `escort a colony convoy` (`planet-exterior`) pour la course, `track an apex specimen` (`planet-exterior`, boss) pour la Reine, `defend the colony` ou `hold the extraction zone` (`colony-multiroute`) pour l'arrivée au port.
- **Rationale**: ces objectifs ont leurs règles (`game-complete-core.js`), leurs conséquences et leurs libellés FR/EN. La mission `special-apc-convoy` (Acte III) garde sa sauvegarde et ses tests intacts, comme le demande Q1 A.
- **Alternatives**: un nouveau chapitre sur le moteur de `apc-convoy-runtime-v121.js` (Q1 A au sens strict : tracé, remorques et poursuite dédiés) — reporté, c'est un runtime de mission complet ; rejouer l'Acte III (Q1 B, refusé par la recommandation).
- **Limite**: pas de remorques ni de pont dans le niveau ; la Reine est le boss générique du gabarit.

## R2 — Le pont chronométré (Q2 A)

- **Decision**: au premier `checkpoint` de *Dernier départ*, une fenêtre non modale s'affiche par-dessus la mission qui continue ; deux boutons, 15 s (21 avec Orlov). Le compte s'arrête si le joueur met le jeu en pause (accessibilité). Faute de choix, le fret cède. Si la mission se termine sans checkpoint, le même défaut s'applique à la résolution.
- **Rationale**: Q2 A demande un choix sans pause ; le checkpoint est le seul repère de mi-parcours commun aux gabarits.

## R3 — La salle des relais

- **Decision**: contrat local *Relais en dérive* (§7.2) porté par la mission répétable `act5-drift-relay` (`recover black-box data`, intérieur de vaisseau), ouverte après S4 ; trois réussites ouvrent la salle [PROPOSÉ].
- **Rationale**: *Transmettre* exige la salle (§5.7.1) ; aucune mission de Cocyte n'avait cet objectif.
- **Coordination**: le chantier du hub Asphodèle peut reprendre ce contrat dans ses contrats locaux ; le compteur vit dans `storyCampaignV188.act5.driftRelays`.

## R4 — Où vit l'état

- **Decision**: `storyCampaignV188.act5` (phase, recommandation, décision, avantages, pont, quai, relais, répliques entendues, casier lu), normalisé par un module pur sans import.
- **Rationale**: `src/save.js` reste inchangé ; `normalizeStoryCampaignV188` est déjà appelé par la migration ; une ancienne sauvegarde n'a pas la clé.
- **Phases**: `council` → `final` → `ending` → `epilogue` → `credits` → `complete`. Chaque passage est enregistré avant la cinématique qui suit, et la table rejoue l'étape en cours après un rechargement.

## R5 — Épilogue (Q5 A)

- **Decision**: jouable au Tantalus (dernier mot de huit membres de l'équipage dans la conversation existante, casier d'Echo-8 en baie cryo), plans fixes de Port-Méridien et d'Asphodèle dans CIN-92. Un bouton du panneau « Acte V » conclut aussi l'épilogue, pour qui ne trouve pas le casier.
- **Lignes d'Echo-9**: les répliques « Retour » des 20 origines (bible §2.4.2), reprises telles quelles.

## R6 — Générique

- **Decision**: plan Canvas `credits` : fond étoilé `#010304`, petite ligne espacée `#87988d`, nom `#e3eee6` avec halo vert, comme `.intro-v188__credit` (`styles.css`). Trois cartons : « A fan game by Darknigthmare », « D'après Alien (1979) · Aliens (1986) », « Projet non officiel, sans affiliation ».

## R7 — Valeurs [PROPOSÉ]

Seuil de confiance solide 75 (bande `NPC_TRUST_LEVELS_V62`), quatre colons en retard, 15 s au pont, +6 s avec Orlov, deux colons par la route de Leila, +120 munitions, blindage 100, stress +10 si l'on cède sans restitution, trois relais en dérive. Elles sont réglables sans nouvelle décision (§56.1) et recensées au §5.11 de la bible.
