# V66 — validation du lot ennemi 001

Date : 31 août 2026. Périmètre : cinq profils standard, pas l'ensemble du catalogue.

## Livré et raccordé

20 plaquettes réellement générées avec l'outil intégré OpenAI ImageGen, huit poses dessinées par plaquette ; 160 poses et cinq atlas RGBA lossless. Le Facehugger V65 antérieur n'est pas recompté. Chaque profil est disponible depuis les résolveurs de mission et le laboratoire du bestiaire, avec choix/relecture de ses quatre clips.

| Profil | Clips dédiés, 8 poses chacun | Canevas monde carré | Hauteur de la première pose |
| --- | --- | ---: | ---: |
| Ovomorph | sealed / opening / hatch / destroyed | 78 px | 56,1 px |
| Chestburster | idle / move / attack / death | 188 px | 16,9 px |
| Drone / Big Chap | idle / move / attack / death | 282 px | 146,5 px |
| Warrior | idle / move / attack / death | 218 px | 136,3 px |
| Runner | idle / move / attack / death | 256 px | 82 px |

Le marine réellement affiché mesure 111,6 px sur sa première pose, contrairement à son rectangle logique de 92 px. Les ratios ont été contrôlés sur une composition technique des sprites du runtime, pas une capture navigateur. Les cellules carrées ne sont pas étirées, leurs 160 racines corporelles sont revues, et le mouvement en suspension du Runner reste visible. Les collisions suivent les dimensions corporelles dédiées, pas les marges transparentes des queues.

Les attaques ont anticipation, impact unique et récupération synchronisés à la pose. Les cibles joueur/coop/escouade restent verrouillées ; porte fermée, changement d'étage, cible invalide ou vide interrompent l'impact. Le moteur testé utilise bien l'ordre réel Mission(Level(Core)). L'œuf reste immobile, éclot vers un véritable Facehugger V65, suspend sa sortie si l'espace est obstrué et ne duplique pas son enfant après sauvegarde. Brouillage et stun expirent sans figer son cycle définitivement.

## Contrôles effectivement exécutés

- `npm run qa` : réussi, dont **616 tests / 616 réussites / 0 échec**, lint de **217 modules**, puis build V66.0.0.
- Sous-ensemble moteur/atlas/éclosion/navigation : **70 tests réussis**, sortie capturée dans `docs/references/V66_BATCH_001_RUNTIME_TEST_OUTPUT.md` du dépôt.
- Normaliseur V66 : **20 tests Python réussis**, inclus via son test Node ; ils ne s'ajoutent pas comme 20 tests Node distincts.
- `npm run art:v66:check` : cinq atlas, 160 cellules distinctes, zéro anomalie de grille ; preuves des repères, sources, détourage et SHA-256 recalculées.
- `npm run sprites:v66:check` : manifeste additionnel **6 atlas / 192 poses**, soit le Facehugger V65 + ce lot V66. Le manifeste historique V64 reste **195 atlas / 2 772 cellules**.
- `npm run batch:v66:check` : cinq profils `integrated`, 20 sources attestées et aucune preuve périmée.
- Audit PNG historique V64 : 405 fichiers, zéro erreur, **13 candidats de halo préexistants à revoir**. Ils ne sont pas déclarés corrigés par ce lot.
- Build local inspecté : exactement cinq WebP V66, **2 992 642 octets**, tous les SHA-256 identiques à la liste acceptée ; sept chemins de sources, métadonnées, références et contacts QA vérifiés absents.
- Contrats historiques actualisés uniquement là où ils supposaient l'ancien nombre d'atlas ou transformaient le premier ennemi, devenu un œuf, en patrouilleur/Praetorian. Les assertions de gameplay restent présentes.

Les originaux générés et les essais rejetés sont conservés pour la traçabilité, mais exclus du jeu déployé. Les copies de photos de référence restent locales et ignorées par Git ; leurs URLs sont documentées. Les preuves V66, prompts et contacts techniques du dépôt ne sont pas copiés dans `dist`.

## Limites et publication

La revue a comparé les silhouettes, l'anatomie, les couleurs, les directions, les clips et les ancrages sur les 32 poses de chaque profil. Le fond magenta enfermé entre des membres a été retiré, avec une extension de frange limitée à deux pixels source. Aucune pose interpolée ou dupliquée n'est comptée comme dessinée.

Cette production est une adaptation fondée sur références, **pas une fidélité pixel 1:1 certifiée**. De petites différences de dessin/reflets persistent entre poses. Le guidage du Runner a une limite de conditionnement visuel explicitement conservée dans sa provenance. Une validation en mouvement et à différentes résolutions reste nécessaire.

L'accès de contrôle navigateur a échoué avant connexion sur le helper Windows : `helper_unknown_error: apply deny-read ACLs`. Les tests de moteur et les images de contrôle ne remplacent pas une validation visuelle en jeu. **Cible de publication : aperçu Vercel uniquement ; pas de promotion automatique en production.** Le statut et l'URL effectifs du déploiement sont donnés dans le compte-rendu de cette tâche après vérification distante.

## Reste de la passe par lots

Le catalogue contient 571 profils. Après le Facehugger V65, la file organise 570 profils en 114 lots de cinq et demande 2 457 plaquettes sources selon leurs familles d'animation. Ce lot termine cinq profils et 20 plaquettes : **565 profils / 113 lots / 2 437 plaquettes contractuelles restent à produire et contrôler dans cette nouvelle passe**. Leur couverture historique n'est pas supprimée, mais n'est pas présentée comme de nouveaux atlas dédiés validés. Les autres familles (PNJ, véhicules, armes, décors) ne sont pas déclarées terminées par ce lot ennemi.

Voir [la provenance graphique](ART_PROVENANCE_V66.md), [l'historique V66](VERSION_HISTORY_V66.md) et [la procédure des lots dans le dépôt](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/codex/v52-physical-worlds/docs/references/V66_ENEMY_BATCH_WORKFLOW.md).
