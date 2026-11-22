# Spécification : face-à-face sans tir, audience à choix de pièces

**Spec** : `010-face-a-face` | **Date** : 2026-11-22 | **Bible** : §1.3, §5.6 (étape 8), §5.7, §5.11 (étape 6), §7.2 (S2) (`docs/narrative/CAMPAGNE_PRINCIPALE.md`) | **Audit** : `docs/development/AUDIT_CONTENU_V188.md` §9, « Face-à-face sans tir, audience à choix de pièces » (Q17 A : première mécanique à créer)

## Contexte

La bible prévoit des confrontations où le joueur ne gagne pas en tirant : au quai de Port-Méridien, « il gagne si le dossier est assez solide pour que les commandos reçoivent l'ordre de se retirer » (§5.6, étape 8) ; en S2, CASSIUS « ne ment pas : il cite ses consignes » (§7.2). La compagnie « ne ment presque jamais frontalement : elle cite » (§1.3, règle 3) ; « une preuve n'est pas une accusation » (règle 9).

Jusqu'ici, le quai de la ligne *Tenir la colonie* était résolu sans jeu : 5 pièces du dossier ou plus → `withdrawn`, sinon `held` (Q4 A, `act5StandoffOutcomeV188`). Le dossier QZ17 (7 pièces, `story-dossier-v188.js`) est déjà calculé depuis la sauvegarde.

## Exigences

- **FR-001** Un système réutilisable d'audience, piloté par des données : chaque entrée déclare un interlocuteur, les pièces présentables (identifiants du dossier QZ17), une crédibilité de départ, un terrain cible, des échanges et deux issues (`won`, `lost`) qui nourrissent une décision **existante**. Aucune fin nouvelle.
- **FR-002** Chaque échange : l'interlocuteur cite une clause, un ordre ou une consigne (avec sa source). Echo-9 présente une pièce ou se tait. Pièce *décisive* : +2 de terrain ; *partielle* : +1 ; dans les deux cas la pièce est dépensée. Pièce hors sujet : −1 de crédibilité, pièce non dépensée. Silence : sans effet. L'échange suivant commence dans tous les cas. **[PROPOSÉ]**
- **FR-003** L'audience est gagnée dès que le terrain atteint la cible, perdue quand la crédibilité tombe à 0 ou quand le dernier échange passe.
- **FR-004** Seules les pièces réellement détenues dans la sauvegarde sont présentables ; l'audience n'accorde ni ne retire aucune pièce.
- **FR-005** Acte V, ligne *Tenir la colonie* : après les trois missions finales, l'audience avec la Directrice Halloran (liaison QZ, au quai) s'ouvre à la table tactique avant la scène du quai. Gagnée → `act5.standoff = 'withdrawn'` ; perdue → `'held'`. La scène du quai, la fin et l'épilogue existants suivent sans changement. *Transmettre* (ICC saisie) et *Céder* (pas de face-à-face) ne changent pas.
- **FR-006** Le seuil de Q4 A est conservé comme borne : l'audience de Halloran est **impossible à gagner avec moins de 5 pièces** et **gagnable avec 5 pièces ou plus** (chaque pièce est décisive à exactement un échange, cible 10). Une sauvegarde qui n'a pas joué l'audience garde la règle Q4 A.
- **FR-007** Sauvegarde additive : `storyCampaignV188.confrontationsV188[id]` (statut, échange, terrain, crédibilité, pièces dépensées, journal), absente des anciennes sauvegardes ; chaque échange est enregistré ; un rechargement reprend à l'échange suivant. Le validateur de `src/save.js` n'est pas modifié.
- **FR-008** Présentation : `<dialog>` du cadre des scènes d'histoire, scène Canvas dans le style du tiers inférieur des cinématiques (cadre de portrait, nom en ambre radio, réplique, bandes noires), jauges de terrain et de crédibilité lisibles par la forme (barre et repère de cible, pastilles pleines ou creuses) et par le texte. Clavier (1-9 présentent la pièce, S se tait, flèches et Tab), souris et toucher (boutons de 44 px), lecteur d'écran (région `aria-live`, libellés). Échap ne ferme pas l'audience. Aucune limite de temps par défaut (option `roundSeconds`, désactivée) ; mouvement réduit : citation affichée d'un coup, lignes de balayage fixes. Textes FR + EN.
- **FR-009** API et entrée de données prêtes pour S2 / CASSIUS, non raccordées (un autre lot construit les niveaux S1-S4 ; ses fichiers ne sont pas modifiés).

## Interface pour les autres lots

`src/confrontation-v188.js` :

| Fonction | Rôle |
| --- | --- |
| `getConfrontationV188(id)`, `registerConfrontationV188(def)` | Lire / ajouter une entrée validée (`validateConfrontationDefinitionV188`) |
| `startConfrontationV188(save, id)` | Crée l'audience (mute la sauvegarde candidate) |
| `playConfrontationMoveV188(save, id, pieceId \| null)` | Un échange ; `null` = se taire |
| `confrontationViewV188(save, id, lang)` | Textes, jauges, pièces, dernier échange, fin |
| `confrontationOutcomeV188(save, id)`, `confrontationDecisionV188(save, id)` | `'won'`/`'lost'` et la valeur de décision déclarée (`outcomes`) |

`src/confrontation-ui-v188.js` : `openConfrontationDialogV188({ language, reducedMotion, getView, onMove, onClose })`.

**Entrée S2 prête** : `CASSIUS_INTERROGATION_V188` (`station-s2-cassius`, `src/confrontation-entries-v188.js`), 5 consignes citées (Q-1 quarantaine, P-2 priorité cargaison, A-3 préservation des actifs, journal des personnes, intégrité des journaux), cible 6, crédibilité 3 ; `cassius-orders` n'y est pas présentable (S2 est l'endroit où cette pièce est récupérée). Raccordement proposé : après S2, avant la décision CASSIUS (`cassiusChoicePendingV188`), ouvrir l'audience ; à la conclusion, ouvrir la décision existante. Issue déclarée `won → 'conceded'`, `lost → 'held'` **[PROPOSÉ, Q-010-2]** : *conceded* = CASSIUS ne résiste pas à « Réécrire » ; *held* = les trois choix restent ouverts, inchangés. Aucun effet n'est appliqué tant que le propriétaire n'a pas tranché.

**Interlude** : CIN-41 dit de BISHOP-9 que « personne ne l'a interrogé ». Une audience BISHOP-9 serait possible avec ce système ; elle n'est pas créée (pas de décision existante à nourrir, Q-010-3).

## Fidélité

- **Documenté** : audience de l'ICC où la compagnie se protège par la procédure (*Aliens*, 1986, scène de l'enquête) ; directives des synthétiques écrites par la compagnie (« Special Order 937 », *Alien*, 1979) ; Marshals coloniaux (*Alien: Isolation*, 2014). Ton de la bible §1.3 (règles 3 et 9).
- **Adaptation du projet** : l'audience par échanges, le terrain, la crédibilité, les clauses et articles cités (« Clause 14 » reprend la bible §21, CE-05 ; les autres numéros sont **[PROPOSÉ]**), la liaison QZ au quai, les consignes Q-1/P-2/A-3 de CASSIUS.
- **À définir** : portraits de Halloran (`confrontation-halloran-crt`) et du cœur de CASSIUS (`confrontation-cassius-core`) — substituts Canvas en primitives, aucune image générée, aucune fidélité « 1:1 ».

## Hors périmètre

Raccordement de S2 (autre lot) ; voix ; art final des deux portraits ; mode avec limite de temps exposé dans les réglages.
