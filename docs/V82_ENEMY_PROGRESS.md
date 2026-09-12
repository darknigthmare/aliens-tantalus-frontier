# Progression ennemie courante V82

Le registre effectif contient **14 profils intégrés sur 571**, dont le Facehugger V65 déjà présent avant la file de production. Les 570 travaux de cette file comptent **13 profils intégrés et 557 non intégrés**.

Le compteur 559 appartient au checkpoint historique V75 : il enregistrait 11 intégrés sur 570. La V81 a ensuite intégré Crusher 009 et Spitter 010 dans son allowlist dédiée, sans réécrire ce checkpoint. L’audit V82 rapproche désormais ces deux états.

`node scripts/enemy-progress-v82.mjs --check` contrôle le rapport courant `docs/references/V82_ENEMY_PROGRESS.json`. `--write` le régénère ; sans option, la commande affiche seulement le résultat. Aucun de ces modes ne réécrit V75 ou les assets.

Pour compter un profil, l’audit exige sa présence explicite dans une allowlist, les preuves d’acceptation correspondantes, le SHA-256 réel de son atlas et de ses sources, la concordance des métadonnées, les clips, la hitbox, un contrat gameplay et le bon atlas sur l’acteur créé par la classe finale du jeu. Les candidats normalisés sur disque n’ajoutent rien au compteur. Le Facehugger conserve son statut historique séparé ; son manifeste indique toujours `fullCharacterComplete: false`.

« Intégré » ne signifie pas terminé commercialement. Ce contrôle de cohérence ne rejoue pas les tests navigateur, ne remplace pas l’inspection d’animation et ne certifie aucune fidélité 1:1. La QA Crusher/Spitter multi-topologies et les profils manquants restent ouverts. Lurker 011 et ATARAX Ripper 023 restent exclus après leur rejet artistique V75.
