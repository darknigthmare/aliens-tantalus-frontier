# Validation 0.9.0

Le jeu ne dépend d’aucun paquet npm. `npm run check` contrôle neuf modules et les tests Node. Les tests isolés préparent parfois un état ; ils ne sont pas des parties.

## Parcours courant

`node qa/access-campaign.cjs` lance six parcours prudents, deux vues × trois difficultés. La navigation utilise les commandes du moteur et son calcul de chemins. Aucun état de santé, ressources, position ou progression n’est imposé. L’observateur sonore est appelé à chaque tick, sans modifier l’export de simulation ; les assertions et compteurs figurent dans reports/v090/campaign.json. Les 198 exports après objectif et les états de scènes gagnées sont dans qa/access-fixtures.

## Navigateur

`npm run qa:browser` relance les sept suites historiques sur le HTML courant. `python3 qa/access-browser.py` vérifie les réglages, maintiens reconfigurés, copies refusées/confirmées, 21 rendus OfflineAudioContext, silence et panoramique, et les formats 1024/390/360. Les pages sont exécutées par set_content avec une fixture mémoire de stockage. Ce n’est ni une navigation file/localhost, ni une certification de persistance native. Les fautes de quota/corruption sont explicitement injectées et séparées des parcours.

Les huit images de reports/v090/captures sont des captures du moteur/UI. Les légendes indiquent les sauvegardes gagnées utilisées et le scénario de corruption. Le fichier WAV est un montage de 21 signaux isolés rendus par OfflineAudioContext avec le synthétiseur du jeu ; pas une capture sonore de campagne et pas une écoute humaine validée.

## Livrables

Les empreintes lient rapports et entrées testées. document-browser.py vérifie les documents. verify_release.py réalise un audit en lecture seule ; --record enregistre le résumé avant création du manifeste, --manifest vérifie ensuite tous les octets. Les fixtures historiques restent volontairement présentes pour tester la compatibilité.
