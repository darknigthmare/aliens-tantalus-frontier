# Plan : face-à-face sans tir (spec 010)

## Architecture

Quatre modules, sans dépendance circulaire :

| Module | Contenu | Importe |
| --- | --- | --- |
| `src/confrontation-state-v188.js` | Règles pures : validation d'une entrée, création, échange (`applyConfrontationMoveV188`), normalisation de la sauvegarde, terrain atteignable (recherche exhaustive) | rien |
| `src/confrontation-entries-v188.js` | Données FR/EN : `HALLORAN_QUAY_AUDIENCE_V188` (raccordée), `CASSIUS_INTERROGATION_V188` (prête) | rien |
| `src/confrontation-v188.js` | Registre et accès à la sauvegarde ; lit les pièces détenues par `storyDossierV188` | story-campaign, story-dossier, entries, state |
| `src/confrontation-ui-v188.js` | `<dialog>` + scène Canvas + boutons DOM | rien |

`story-campaign-v188.js` normalise le champ additif `confrontationsV188` (import de `confrontation-state-v188.js`, sans import). `story-act5-v188.js` importe `confrontation-v188.js` (le module de confrontation n'importe jamais l'Acte V).

## Raccordement Acte V

- `act5TableActionV188` renvoie `'audience'` pour *Tenir* tant que l'audience n'est pas conclue (`act5AudienceDueV188`), puis `'standoff'` comme avant.
- `act5StandoffOutcomeV188` lit l'issue de l'audience (`confrontationDecisionV188`) ; sans audience conclue, règle Q4 A inchangée (anciennes sauvegardes, flux sans présentation, tests de la spec 006).
- `advanceAct5ToEndingV188` accepte aussi l'action `'audience'` pour les appelants sans présentation.
- `src/app.js` : `act5OnViewV188` ouvre `openAct5AudienceV188` (une écriture de sauvegarde par échange via `commitCandidateV188`) ; à la fermeture, la table reprend (scène du quai existante, puis fin). Le panneau de l'Acte V affiche « AUDIENCE AU QUAI » quand elle est due.

## Valeurs [PROPOSÉ]

| Élément | Halloran | CASSIUS |
| --- | --- | --- |
| Échanges | 7 | 5 |
| Crédibilité | 3 | 3 |
| Cible | 10 | 6 |
| Décisive / partielle / hors sujet | +2 / +1 / −1 crédibilité | idem |

La cible 10 de Halloran avec 7 pièces chacune décisive une fois garantit la borne Q4 A (testée sur les 128 dossiers possibles).

## Distribution

Coque hors ligne `sw.js` (nouveau nom de cache `atf-v143-tantalus-face-a-face-20261122`, assertion de `verify-audit-v143.mjs`), admission exacte des sources (`verify-public-release-v86.mjs` : suite, QA, spec), suite ajoutée à `test:priorities:v188`, QA déclarée `qa:confrontation:v188`.

## Vérification

`scripts/verify-confrontation-v188.mjs` (règles, données, persistance, raccordement Acte V, scène Canvas, câblage) ; `scripts/verify-act5-endings-v188.mjs` (assertion élargie à `'audience'`) ; parcours Chromium `scripts/qa-confrontation-v188.mjs`.
