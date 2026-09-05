# Albino Dust Runner083 — candidats V72

Quatre nouvelles sources OpenAI ont été inspectées : idle, move, attack et death-final. L’ancienne `death-candidate.png` était une réponse incorrecte de type idle ; elle est conservée comme rejetée et jamais traitée comme mort.

La silhouette demeure un quadrupède albinos de projet, crâne allongé sans yeux apparents, quatre appuis, longue queue complète, matériaux ivoire. Ce constat n’est pas une certification franchise1:1 (`canonExact:false`).

- Idle : huit poses de veille ; posture et identité cohérentes, variations faibles.
- Move : variation des appuis encore subtile et très proche de l’idle. Une course fluide n’est pas certifiée.
- Attack : extension/pounce visible puis reprise de la posture au sol ; timing et impacts restent à examiner en animation.
- Death-final : perte progressive des appuis, chute et corps terminal couché ; n’est plus une plaque idle.

Les extractions avec cellules strictes4×2 ont d’abord échoué sur des griffes débordantes. Le mode V66 existant de réattribution par composants a ensuite prouvé leur appartenance : plus de90% du composant dans la cellule propriétaire, débordement borné, aucun pixel coupé/redessiné. Les quatre clips ont alors passé les contrôles techniques, huit poses chacun.

Les résultats restent dans `assets/openai/sprites/frames/v72/enemy-083-albino-dust-runner/qa-candidates` : quatre previews source, quatre WebP normalisés, quatre GIF, un atlas combiné de32poses et `candidate-qa.json`. La normalisation combinée partage une seule échelle calculée sur tous les clips, mais n’a pas de racine corporelle ni de calibration de taille approuvée.

Statut : **candidate-only**, **runtimeIntegrated:false**. Les revues d’ancrage, d’échelle inter-clips, de fidélité et de continuité du mouvement restent ouvertes. Aucun événement accepted/integrated et aucun remplacement d’asset de production n’a été émis par cette QA.

Reproduction technique : `py -3 scripts/qa-enemy-083-candidates-v72.py`. Ce script utilise les sources existantes et ne fait aucun appel ImageGen ; il ne modifie aucune queue de production.
