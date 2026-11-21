# Xeno Trials — lots de 40 V179

Départ : branche `work`, commit `d41b5fc120da2e7a5938308f9d3c852d20e53cc5`.

## Contenu raccordé

- **Combattants :** les 189 identités du registre actif restent présentes, avec cinq pages de 40 maximum, recherche, filtres, tri et retour à la sélection. Les conseils tactiques suivent leurs capacités actuelles. Les achats et restrictions des séries restent appliqués.
- **Épreuves et stages :** 40 nouvelles évaluations, huit parcours et cinq formats, sont associées aux 40 nouveaux décors d’arène sélectionnables. Les six arènes et neuf défis historiques sont conservés. Les 40 décors utilisent 40 images locales distinctes déjà présentes ; ils conservent la physique du duel. Ce sont 40 associations épreuve/arène, pas 40 nouveaux boss dessinés.
- **Événements :** 40 protocoles en huit familles, totalisant 160 vagues. Chaque vague est un duel natif en deux manches gagnantes. Ses règles, sa difficulté et son arène sont résolues depuis le catalogue. La série conserve son spécimen, reprend après rechargement et attribue sa prime une seule fois après la dernière vague. Défaite, égalité et abandon interrompent la série.
- **Campagne :** 40 raccordements pour les phases d’approche et de déploiement des 20 premières campagnes FRONTIER. Ils réutilisent 16 images d’ambiance du projet, avec contrôle du couple campagne/monde. Les phases hors lot et la composition native QZ-18 gardent leur présentation. Le normaliseur média accepte sa propre sortie normalisée, nécessaire au fallback composé.

Le [suivi du lot](batch40-v179.json) liste les identités, associations, vagues et images. Les anciens classeurs et leurs états de clôture ne sont pas réécrits.

## Vérification

`npm run test:trials:batch40:v179` couvre les nouveaux modules, les règles, les tickets, la reprise, les récompenses et les médias. Les parcours de progression de tous les événements utilisent des résultats de test explicitement construits ; deux scénarios supplémentaires emploient le moteur réel. Les contrôles Canvas des 40 arènes utilisent des doubles DOM/RAF/chargement d’image ; leurs véritables fichiers sont vérifiés séparément. Ces contrôles ne remplacent pas les parcours Chromium.

La suite générale, les admissions des sources, le build et le contrôle de distribution disposent de leurs résultats propres dans le suivi. Les parcours navigateur distinguent les interactions natives, les lectures d’état et les préparations éventuelles. Un premier essai ayant révélé une impasse de retour au programme est conservé comme échec exploratoire ; sa correction et sa recette sont consignées séparément.

Résultat local final : **4 183 tests réussis, zéro échec, un test facultatif ignoré**, sur les 216 fichiers dédupliqués du collecteur officiel, exécutés avec six processus de test concurrents. Les 117 tests du nouveau lot sont inclus dans ce total. La recette Chromium passe **24 contrôles et 7 captures**, sans erreur JavaScript, HTTP ou de requête. Elle inclut le vrai rechargement du ticket et une défaite CPU naturelle, sans injection de progression ou de résultat. La probe distincte décode les 40 décors d’arènes et les 16 images employées par les 40 raccordements de campagne ; elle ne compte pas comme 40 parties ni 40 campagnes jouées.

Les admissions des sources passent (2 437 fichiers, 1 426 assets, zéro document privé), ainsi que la construction et le contrôle des 1 987 fichiers distribués et des 625 entrées du shell hors connexion. Les 552 fichiers runtime sont restés identiques pendant le parcours navigateur. L’ajout ultérieur des cinq modules au shell de `sw.js` est couvert séparément par les tests et le contrôle de distribution. Le premier passage général ayant révélé les empreintes de succession périmées est conservé comme exploration ; le résultat final ci-dessus vient d’une nouvelle passe complète après gel des sources.

Reçus locaux : `/workspace/tantalus-inventory/reprise-v179/validation-final.json`, `test-all-final.log` et `native-final/report.json`. Le checkout reste non commité ; aucune réussite CI ni publication n’est déduite de ces vérifications locales.

## Portée artistique et gameplay ouverte

Aucun PNG n’est créé ou modifié dans ce lot. Les présentations articulées du roster ne constituent pas 189 movesets entièrement animés. Les illustrations d’ambiance ne certifient pas l’apparence des lieux de franchise. Aucune fidélité 1:1 ni clôture artistique globale n’est ajoutée.

« Horde Wave Incoming » désigne ici des contacts successifs, avec récupération complète entre duels. Ce lot ne produit ni horde simultanée ni mini-jeu autonome d’escorte ou d’extraction : ces intitulés donnent le contexte des conditions de duel réellement implémentées.

Aucun déploiement, push, fusion ou changement cloud n’est effectué par ce lot.
