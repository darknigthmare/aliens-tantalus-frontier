# Xeno Trials — continuation des manques V186

## Base réconciliée

Cette continuation part de `main` à `803db26dbd7ed453d9534eee237806053438f300`. Les travaux Trials V179/V180, publiés dans `d516dda` et `e0836d3` mais jamais intégrés à main, sont réappliqués dans `94160e2` et `0ae6fc6`. Les 121 commits ultérieurs de main restent conservés, notamment FR/EN, maintenance du catalogue et ressources QA. Les anciens résultats ne sont pas transférés à cette intégration : elle reçoit ses propres tests et reçus.

## Manques traités dans ce lot

- **Reprise exacte des hordes :** le ticket conserve une enveloppe bornée associée au joueur, au protocole, au seed et à l’identité du combat. Santé, positions, vagues, adversaires blessés, IA, attaques en cours, projectiles, acide et compteurs sont restaurés en pause. Sauvegarde périodique après cinq secondes de simulation, à la pause et à la fermeture. Les états incohérents, soins inventés, résultats injectés et retours en arrière sont refusés. Un redémarrage volontaire reste distinct, sans récompense ni remboursement.
- **40 finales boss :** 40 variantes supplémentaires `xth186-*` s’ajoutent aux 40 hordes historiques intactes. Chaque variante se termine par un véritable adversaire majeur de 140 à 310 PV et des gardes de 15 à 35 PV. Taille physique, IA, signatures et attaques natives sont conservées ; le boss n’est pas réduit pour entrer dans le décor. Son apparition, sa santé et la préparation de ses attaques sont visibles. Les reçus et la reprise suivent les slots réellement engendrés, et la prime reste unique.
- **40 réactions :** cinq castes mesurées × huit états : garde, impact, rupture de garde, reprise d’appuis, KO et trois phases de frappe lourde. Les PNG et les supports natifs restent conservés. Les ennemis morts peuvent laisser une réaction cosmétique bornée à 16 images actives et 0,65 seconde, sans hitbox, sauvegarde ni dégâts. La dernière image terminale garde une pose KO soutenue et ne continue pas la simulation après le résultat.
- **Manette :** stick et croix directionnelle, huit actions, gâchettes, pause Start/Back. Connexion, déconnexion, perte de focus et reprise exigent le retour au neutre ; une touche maintenue ne réactive pas une attaque à travers une pause. Les menus gardent leurs interactions clavier et tactiles.
- **Interface et FR/EN :** 80 protocoles accessibles avec filtres standard/boss et pages de douze cartes ; les 189 combattants conservent leurs pages de quarante. HUD de boss, annonces, reprise de la vague et sauvegarde à réessayer utilisent les vrais états. 147 textes exacts et 20 modèles sont ajoutés au catalogue anglais sans modifier les 6 042 textes et 437 modèles historiques de la base. La [proposition de traduction](i18n-trials-review-v186.json) reste réutilisable par le CLI de maintenance.

Le [suivi courant](completion-v186.json) distingue contenu produit, raccordement, vérification et travail encore ouvert.

## Vérifications

`npm run test:trials:completion:v186` rassemble les suites du checkpoint, des boss, des réactions, de la manette, du terminal, de FR/EN, du runtime et de la succession des sources. La suite générale utilise le collecteur officiel sans doublonner ses alias. `check`, `build`, `check:built` et la recette Chromium sont des étapes distinctes.

Les suites Node utilisent les moteurs et les transactions natifs ; leurs hôtes DOM/RAF/Canvas/images et leurs configurations de combat sont explicitement déclarés. Les quarante finales préparées pour une vérification ciblée ne sont pas comptées comme quarante parties navigateur. Un parcours de boss complet est également joué par commandes normales contre les IA natives. Les contrôles manette automatisés utilisent des périphériques standard simulés, pas du matériel physique.

Une régression a reproduit la fermeture d’un runtime depuis son propre callback de sauvegarde : elle provoquait des appels imbriqués `checkpoint → stop → checkpoint`. Un garde de réentrance protège maintenant cette fermeture et la dernière capture reste bornée. Les diagnostics antérieurs aux corrections et les passes effectuées avant gel restent séparés des résultats finaux.

La recette Chromium finale passe 38 contrôles avec huit captures, sans erreur JavaScript, HTTP ou requête. Les 573 fichiers observés restent identiques avant et après ; les quinze sources vérifiées par HTTP correspondent aux fichiers servis. Elle restaure le checkpoint au tick 368 avec santé, positions, vitesses, IA, RNG, attaques, projectiles et directeur identiques, puis reprend depuis la pause. L’accumulateur est remis à zéro et les entrées du joueur sont réarmées au neutre. La victoire de boss est obtenue au clavier contre quinze adversaires sur trois vagues, après un achat réel de la Queen à 1 400 crédits à partir d’une provision de test déclarée. Le Crusher à 140 PV, sa barre de santé, les KO temporaires et la récompense unique sont observés dans le navigateur. Les captures finales confirment la visibilité du HUD sur ordinateur et mobile.

Le pilote reproductible est `scripts/qa-xeno-trials-completion-v186.py`, empreinte SHA-256 `795b4903b6bb5aa7531dfe6b8da397edd7771f361465475db831e1c10b9527a0`. Les premières tentatives du pilote sont archivées séparément : une lecture de géométrie sur deux instants différents pouvait rencontrer un ennemi déjà disparu ; la lecture finale utilise un même instantané. Aucun état de combat n’a été modifié pour contourner ce défaut du pilote.

## Restant ouvert

Ce lot ne clôture pas tous les postes du plan artistique V146. Les movesets entièrement dessinés des 189 combattants, les corps couchés complets au KO, les autres castes sans réactions mesurées, les chorégraphies propres à chaque anatomie et la fidélité franchise 1:1 restent ouverts. Les cinq nouvelles séries de réactions sont des adaptations de maillage des plaques du projet, pas des cycles récupérés des films ou des jeux.

Les scènes complexes conservent leurs trois plans et leur physique actuelle ; aucun nouveau mini-jeu autonome d’escorte ou d’extraction, mode multijoueur ou ensemble de dangers physiques propre à chaque scène n’est annoncé par ces finales. Les illustrations de campagne V180 sont conservées, sans nouvelle peinture produite dans ce lot. Aucun gain de FPS n’est annoncé sans mesure comparative.

Les témoins historiques, classeurs et verdicts artistiques ne sont pas réécrits. La jonction stricte vérifie séparément main, les deux branches Trials originales, la restauration et les nouveaux octets.

La suite générale finale exécute 239 fichiers uniques : **4 638 tests réussis, zéro échec, un test ignoré**. Les sources restent identiques au gel pendant cette passe. Le contrôle source admet 2 525 fichiers, dont 1 430 ressources et aucun document privé. Le build et le contrôle de l’artefact passent avec 2 008 fichiers et 641 entrées de démarrage ; son identité de commit est réestampillée et revérifiée après le commit. La jonction vérifie 71 pins, 30 sources runtime et 284 extrémités Git, sans transférer les verdicts des branches historiques.

## Livraison

Les résultats locaux, le SHA du commit public et l’état réel du déploiement sont consignés séparément sous `/workspace/tantalus-inventory/reprise-v186/`. Une publication demandée ne signifie pas qu’elle a abouti ; le quota Vercel précédemment rencontré doit être revérifié sur la nouvelle tentative. Aucun changement de formule ou de paiement n’est autorisé par cette continuation.
