# Research: Front station Asphodèle, premières quêtes et temps de voyage

## R1 — Construire S1-S4 sans nouveau niveau

- **Decision**: campagnes ordinaires sur le gabarit `ship-interior-vertical`, avec les objectifs de la bible (§7.2) : `board a drifting vessel`, `restore atmospheric processing`, `escape the quarantine`, `hold the extraction zone`.
- **Rationale**: ces objectifs ont déjà leurs règles (`game-complete-core.js`), leurs conséquences (`campaign-consequences.js`) et leur libellé FR/EN (`mission-objective-panel-v188.js`). L'insertion par amarrage est celle des missions de vaisseau (spec 003). Q6 demande S1-S4 avant le hub.
- **Alternatives**: niveaux faits à la main (pas d'art de station, Forge en attente) ; mission unique (ne respecte pas le découpage de la bible).
- **Limite**: le décor est l'intérieur de vaisseau générique ; la station n'a pas son art (§29.4).

## R2 — Où vit l'état

- **Decision**: complétion lue dans `completedCampaignIds` ; champ `stationV188` réduit à `introHeard`, `cassius`, `scenesSeen`.
- **Rationale**: une seule source de vérité ; une reprise de mission passe par le circuit existant.

## R3 — « Six heures de silence » sans mission

- **Decision**: l'intro (Calme, « à bord », §0.3) est la conclusion de la quête de Rook (§8.1 : « Débloque `station-intro-silence` »), jouée dans le dialogue de scène.
- **Alternatives**: cinématique CIN-70 dans `story-cinematics-v188.js` (module partagé avec d'autres chantiers ; reportée).

## R4 — Effets [PROPOSÉ]

| Valeur | Choix | Raison |
| --- | --- | --- |
| CASSIUS réécrit | quarantaine de Cocyte −6, stabilité +3 | Il lève la quarantaine rouge qu'il applique (§7.1) |
| CASSIUS bridé | quarantaine −3 | Il ne la renouvelle plus |
| CASSIUS effacé | aucun | Station en mode manuel |
| Rook | loyauté +5 | Modeste, comme les capacités (§56.4) |
| Vega | loyauté +10 (Administration) ou +4 (compagnie) | Rapproche du seuil 55 de l'Acte V sans le garantir |
| Harlow | loyauté +5, recherche +6 | Ordre de grandeur d'une mission |
| DAVID-8R | 3 composants, un par opération réussie sur Cocyte, loyauté +5 | Adaptation de « trois composants trouvés en mission » |
| Saut | 14 jours | « Un trajet entre systèmes prend des semaines » (§13.2) ; Q21 : fixe |

## R5 — Mesure du coût du saut

`simulateElapsed` fait tourner `advanceGalaxy` pour l'écart d'horloge ; 336 h sont simulées en une transaction. Non mesuré en navigateur sur une partie longue ; à surveiller.
