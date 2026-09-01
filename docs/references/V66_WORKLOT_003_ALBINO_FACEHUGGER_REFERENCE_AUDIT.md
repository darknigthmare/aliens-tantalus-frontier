# V66 — audit du verrou 054 Albino Facehugger

## Verdict

`enemy-054-albino-facehugger` est une variante systémique `PROJECT_ADAPTATION_AUTHORED_PIGMENT_MATERIAL`, `canonExact=false`, dérivée exclusivement du Facehugger V65 `enemy-002-facehugger`, conservé comme base validée hors queue V66. Ce n'est ni une nouvelle caste ni un modèle albino officiel.

## Invariants hérités

- corps central bas, huit membres digitiformes en quatre paires bilatérales, appareil ventral et longue queue complète ;
- même échelle globale V65 `0.507937`, pivot `creature-ground` `[128,240]`, profil droit strict ;
- `idle` 6 FPS loop, `move`/scuttle 12 FPS loop, `attack` 12 FPS et `death` 10 FPS ;
- attaque : compression, poussée des doigts, arc aérien vers la droite, agrippement et retombée ; aucune locomotion bipède.

L'adaptation utilise une chair ivoire-beige chaude, des articulations et tissus ventraux rose pâle translucides, des plis gris froid et des reflets humides retenus. Un filtre blanc automatique ferait disparaître segmentation, volume et lisibilité et est interdit.

## Contrat de fusion et de queue

L'entrée mergeable conserve l'identité exacte de la queue (`Albino Facehugger`, `xenomorph`, caste `parasite`, famille `parasite`, ordinal `53`) et les quatre contrats `idle`, `move`, `attack`, `death` avec leurs chemins, hashes de prompt, FPS et drapeaux de boucle. Son URL HTTPS NECA documente uniquement l'anatomie licenciée de la base Facehugger; elle ne prétend pas documenter une variante albinos officielle. L'atlas et le metadata V65 locaux ont été contrôlés présents.

## Preuves et placeholders

Le metadata V65 est hashé `f163189d…`; l'atlas validé 1024×2048 RGBA `6c945329…`; les prédécesseurs legacy raw/normalisé `bf57e7d3…` et `70d06546…`. Les quatre prompts 054 sont encore `BLOCKED`; leurs quatre hashes déclarés ne correspondent pas aux hashes du texte UTF-8 décodé.

## État

Aucune génération, acceptation, intégration, fusion globale ou opération Git. Le fragment est `reviewed` par `Codex /root/prepare_refs_053_054` au `2026-09-01`; il ne vaut pas autorisation artistique automatique.
