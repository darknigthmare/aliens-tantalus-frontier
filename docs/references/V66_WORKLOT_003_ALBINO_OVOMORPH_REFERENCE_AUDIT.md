# V66 — audit du verrou 053 Albino Ovomorph

## Verdict

`enemy-053-albino-ovomorph` est une variante systémique `PROJECT_ADAPTATION_AUTHORED_PIGMENT_MATERIAL`, `canonExact=false`, dérivée exclusivement du verrou V66 `enemy-001-ovomorph` (`referenceLockSha256=98e55fa3ebe4a3f8a69be3319ddda233d8f8030df63f7d04e95221a8918ca5e8`). Ce n'est ni une nouvelle caste ni un modèle officiel.

## Invariants hérités

- même œuf vertical, base stable, paroi cuir granuleuse et exactement quatre lèvres apicales ;
- mêmes clips `sealed` 6 FPS loop, `opening` 8 FPS, `hatch` 10 FPS et `destroyed` 10 FPS ;
- huit poses 4×2 par clip, profil droit contractuel, racine centre-bas inchangée ;
- aucun Facehugger dessiné dans l'œuf, aucune racine tentaculaire, jambe ou cinquième lèvre.

L'albinisme est rendu par une matière ivoire chaude/gris-beige, des veines rose-beige translucides et un relief spéculaire maîtrisé. Une recoloration globale automatique, un blanc plat, une lueur ou une texture de glace sont interdits.

## Contrat de fusion et de queue

L'entrée mergeable conserve l'identité exacte de la queue (`Albino Ovomorph`, `xenomorph`, caste `egg`, famille `egg`, ordinal `52`) et les quatre contrats `sealed`, `opening`, `hatch`, `destroyed` avec leurs chemins, hashes de prompt, FPS et drapeaux de boucle. Ses URLs HTTPS renvoient aux sculptures licenciées NECA utilisées uniquement pour l'anatomie de base; elles ne prétendent pas documenter une variante albinos officielle. Les quatre chemins locaux de base ont été contrôlés présents.

## Preuves et placeholders

Les quatre sources V66 de base 1774×887 ont été relues et hashées : `d36ff97d…` sealed, `7d9f32ee…` opening, `16089e03…` hatch, `679adcc7…` destroyed. Les quatre prompts 053 de la queue restent `BLOCKED`; leurs hashes déclarés diffèrent tous des hashes du texte UTF-8 décodé.

## État

Aucune génération, acceptation, intégration, fusion globale ou opération Git. Le fragment est `reviewed` par `Codex /root/prepare_refs_053_054` au `2026-09-01`; il ne vaut pas autorisation artistique automatique.
