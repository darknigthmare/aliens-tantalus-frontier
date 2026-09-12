# V80 — BIOFORGE jouable et isolé

## Statut du lot

V80 livre le premier vertical slice BIOFORGE réellement jouable. La conversation source passe de `MISSING` à `PARTIAL` : le cœur type/quantité/impression/combat/purge/retour est couvert, tandis que le roster total et le corpus artistique complet restent ouverts.

## Changements de contrat

- `src/special-operations-v67.js` : BIOFORGE devient `partial`, `playable: true`, accessible depuis le hub, avec dette explicite ;
- `src/tantalus-hub-expansion-v71.js` : les quatre fonctions différées deviennent des capacités de station ;
- `src/hub-annex-services-v71.js` : le sas confirme que le niveau V80 est prêt à être ouvert, sans stocker de données de spawn ;
- `docs/references/V76_CHATGPT_PROJECT_GAP_MATRIX.md` : compteur strict 0 DONE / 17 PARTIAL / 9 MISSING.

## Runtime et sauvegarde

- racine persistante séparée `bioforgeV80` ;
- sept phases déterministes de configuration à retour ;
- roster terrestre fermé à 11 profils validés ;
- budget pondéré 12 et maximum 12 spécimens ;
- niveau auteur 2 880 × 720 avec six salles et cinq portes ;
- impression séquentielle, IDs stables et éliminations idempotentes ;
- purge atomique de cinq familles de résidus ;
- reprise sûre et historique borné ;
- aucune mutation des ressources, opérations, pertes ou statistiques de campagne.

## Art

Six couches originales OpenAI sont prévues comme surfaces indépendantes : far, mid, foreground, imprimante, atlas de porte et atlas de purge. Les reçus source restent dans `docs/references/v80-bioforge-art/` et ne sont pas déployés comme runtime.

Ce lot ne revendique pas que les centaines de plaques ou les 571 profils ennemis disposent d’un art BIOFORGE dédié.

## Contrôle ciblé effectué

Commande :

```powershell
node --test tests/special-operations-v67.test.mjs tests/tantalus-hub-expansion-v71.test.mjs tests/hub-annex-services-v71.test.mjs tests/bioforge-session-v80.test.mjs tests/bioforge-level-v80.test.mjs tests/bioforge-runtime-v80.test.mjs tests/bioforge-save-v80.test.mjs tests/bioforge-ui-v80.test.mjs
```

Résultat ciblé registre, hub et BIOFORGE : **76 tests réussis, 0 échec, 0 ignoré**.

Ce résultat ne constitue ni un passage QA complet V80, ni une preuve navigateur, ni une preuve de build, ni une preuve de publication. Ces statuts doivent être consignés uniquement après leur exécution réelle.

## Dettes conservées

- roster total des ennemis éligibles ;
- art, animations et VFX dédiés pour le corpus promis ;
- QA visuelle des tailles, perspectives, alphas, facings et transitions ;
- preuve navigateur clavier/tactile/manette et reprise ;
- mesure de performance au budget maximal ;
- publication et contrôle HTTP du commit de contenu, à documenter séparément seulement après vérification.
