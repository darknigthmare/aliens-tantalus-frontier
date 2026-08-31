# V66 — premier groupe de 202 profils

31 août 2026. La demande est interprétée littéralement : **202 ennemis par groupe**, pas 202 images. Ce premier groupe est commencé, pas terminé. Aucun nouveau profil n'est accepté artistiquement ou intégré au jeu dans cette passe.

## Production réelle

- **9 nouvelles planches OpenAI / 72 poses** : Neomorph 037 (idle, move, attack, death) et Working Joe 041 (idle, move, attack, death, hurt), avec références examinées et verrous dédiés.
- **2 atlas candidats RGBA WebP**, neuf clips WebP, neuf GIF de clips, deux GIF d'ensemble, deux métadonnées et leurs contacts d'inspection.
- **3 retouches séparées** : bond Lurker attack-r4, hanche Lurker move-r2, couleur Spitter death-r2. Elles ne remplacent pas les masters liés aux anciennes mesures.
- **16 appels ImageGen réels** : six Neomorph, six Working Joe, quatre retouches. Neuf sources sélectionnées, trois candidats séparés et quatre versions écartées conservées avec leur provenance. Les erreurs de lecture avant génération ne sont pas comptées comme images.

La compétence ImageGen a imposé des bitmaps réels, la conservation des masters et rejets, des prompts exacts et la séparation entre production et acceptation. Mode **OpenAI ImageGen intégré**, aucune API/CLI supplémentaire. Le helper Windows refusait l'accès direct aux fichiers de référence ; des aperçus JPEG en mémoire ont servi de références conversationnelles. Aucune fidélité d'entrée pixel pour pixel n'est revendiquée.

## Groupes figés et avancement

`V66_ENEMY_WORKLOTS_202.json` fixe les membres ; `npm run batch:v66:worklots` rafraîchit les preuves sans déplacer les profils après intégration. Les batchId, chemins et ordinaux historiques sont conservés.

| Groupe | Profils | Planches requises | Sources attestées | Restantes |
| --- | ---: | ---: | ---: | ---: |
| 001, profils 007–208 | 202 | 872 | 96 | 776 |
| 002, profils 209–410 | 202 | 871 | 0 | 871 |
| 003, profils 411–571 | 161 | 694 | 0 | 694 |

Premier groupe : 22 références revues, 180 encore manquantes. Les 96 sources sont les 87 précédentes plus neuf nouvelles ; rejets et retouches séparées ne gonflent pas ce compte. Globalement : **116 sources V66 attestées**, dont 20 du pilote. Les cinq profils V66 déjà intégrés et le Facehugger V65 hors file restent inchangés.

## Détourage et exports finaux

Le contrôle sur fond sombre a révélé du magenta enfermé entre les membres et dans les boucles de queue. Contacts avant : `v66-worklot-001-alpha-review/`. Les deux atlas utilisent finalement les options existantes de suppression du cœur de matte prouvé et de sa frange bornée à deux pixels source. Les palettes de référence n'ont pas de matériau magenta. Aucun seuil changé, aucun master repeint.

Neomorph nécessite aussi l'attribution existante des petits débordements connectés (90 % d'appartenance, 15 % d'excursion maximum). Working Joe n'a pas nécessité cette option. Le véritable contrôle des deux atlas passe ; un indice conservateur de bord dans une source n'est pas présenté comme une coupe prouvée.

Contacts finaux relus : `v66-batch-003-atlas-review/enemy-037-neomorph.jpg` et `enemy-041-working-joe.jpg`. Grandes plages de fond éliminées ; de petits accents roses subsistent sur le Neomorph.

Atlas dans `assets/openai/sprites/normalized/enemy-profiles-v66/` :

- Neomorph : SHA `4a57feb12be969e23408854cc72219591b43d02821cbe3a1fa881afdfebc5cf1`.
- Working Joe : SHA `cece641977c3d04d9de80a5bce7748060ca8d467458022a8a2b9aad052cc7836`.

## Vérifications

- `npm run qa` réussi : **705 tests réussis, zéro échec, un ignoré sur 706**. Le test ignoré exige un lien symbolique refusé sous Windows. Lint : 227 modules ; build : 3 446 entrées. Ne pas additionner les suites Python déjà invoquées par les tests Node.
- Contrôle final : 72 poses, aucune anomalie technique de cellule. **11 GIF** décodés ; poses, durées et boucles conformes. Voir `V66_WORKLOT_001_NEW_ATLASES_QA.json`.
- **157 anciens fichiers identiques à HEAD** : 107 masters, 25 atlas, 25 métadonnées. Seuls les jobs/références 037 et 041 changent pour la nouvelle production. Historique : 147 événements conservés comme préfixe exact, puis neuf générations ajoutées. Voir `V66_WORKLOT_001_PROTECTED_FILES.json`.
- Nouveau garde-fou : fournir simultanément un texte de prompt et un fichier contradictoires est refusé, au lieu de remplacer le texte silencieusement. Deux tests ajoutés. Deux reçus d'import Joe conservent le texte outil exact et un `promptDocumentPath` distinct comportant un LF terminal ; originaux préservés.
- L'audit historique de 405 PNG runtime conserve zéro erreur et 13 candidats à revue de halo, non corrigés ici.

Pas de nouveau test navigateur du gameplay dans cette passe. Aucun nouvel ennemi de ce groupe n'est annoncé déployé sur Vercel.

## Réserves avant intégration

Neomorph : mesurer les échelles crâniennes entre clips (attaque/mort surtout), reprendre les accents roses, vérifier ancrages physiques et continuité. Working Joe : alternance des jambes dont move5, mécanique et perspective de chute, appuis ; les références ne couvrent pas toutes les bottes/coutures, explicitement adaptées.

Lurker/Spitter : nouvelles mesures et racines avant remplacement ; réception du bond 5–7 à régler, perspective trois-quarts héritée du Spitter non corrigée par le nettoyage couleur. Voir `V66_WORKLOT_001_RETOUCH_REVIEW_B.md`.

Les **776 planches restantes**, les références manquantes et ces contrôles restent du travail effectif. Aucune certification 1:1 ou de jeu commercial terminé.

## Fichiers et reprise

Sources sélectionnées : `assets/openai/sprites/frames/v66/batch-003/enemy-037-neomorph/` et `enemy-041-working-joe/`. Retouches : `assets/openai/sprites/frames/v66/worklot-001-candidates/`. Prompts et reçus : `docs/references/v66-worklot-001-prompts/`, `v66-worklot-001-events/`, `V66_WORKLOT_001_RETOUCHES.json` et historique de production.

```powershell
npm run batch:v66:worklots
node scripts/enemy-batch-production.mjs check
py scripts/process-v66-enemy-batch.py --profile enemy-037-neomorph --check
py scripts/process-v66-enemy-batch.py --profile enemy-041-working-joe --check
npm run qa
```
