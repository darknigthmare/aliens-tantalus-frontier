# Provenance des diagnostics

## Résultats courants 0.6

node-tests.tap, browser.json, hunt-browser.json, field-browser.json, http-static.json, documents.json et nine-agents06.json décrivent les suites courantes. Les neuf traces agent-* et hunt-agent-* sont rejouées avec le code 0.6 ; les empreintes core/field figurent dans le résumé.

Les tests unitaires et captures peuvent utiliser des états préparés. Les agents connaissent la carte et visent idéalement, sans injection de ressources ni objectifs forcés. Leurs parcours ne prouvent pas qu’un humain ou chaque agent a utilisé tous les nouveaux mécanismes. Les réparations maintenues ont leurs propres tests clavier.

## Historique antérieur, conservé séparément

historique/ contient le premier essai Vétéran perdu à la vague 24 en 0.5. La stratégie finale de l’agent achetait réellement davantage de soins, armure et postes. Ce diagnostic ne doit pas être compté parmi les neuf résultats 0.6.

## Corrections pendant 0.6

Les anciennes attentes de test de sentinelle instantanée ont été adaptées au nouveau projectile. Les attentes de migration incluent le champ de kit absent autrefois. Une comparaison flottante de durée utilise une tolérance numérique. Les boutons et jauges ont été contrôlés après ces ajustements ; l’inspection des images a aussi conduit à attendre le rafraîchissement normal du HUD et à cadrer les jauges mobiles avant capture.

Un appel de l’agent avec marine-direct au lieu des arguments marine direct était invalide ; le pilote tests/run_agents.py emploie maintenant les neuf commandes correctes et échoue immédiatement en cas de rapport absent ou incomplet. Les tentatives interrompues par délai d’exécution ne sont pas présentées comme des parties complètes.

Les probes natifs 0.6 refusent HTTP local et file:// (ERR_BLOCKED_BY_ADMINISTRATOR). Les tests par set_content et Storage Map ne sont pas des preuves de persistance native.

## Passe 0.7 — suite et limites

Archive 0.6 extraite avec CRC et empreinte conformes. 245 tests de base vérifiés avant modification. Ajouts tactiques : 70 tests Node et 35 contrôles Chromium spécifiques. Une récupération avec inventaire plein pouvait masquer un objectif voisin : corrigée et couverte. La nouvelle dépendance tactics.js manquait initialement au payload de l’installateur : ajoutée, avec vérification de chaque ressource référencée. Aucun paquet final n’a été livré avec ces problèmes.

Les contrôles de combat préparent les positions et états pour isoler les effets. Le test d’interception de l’export a d’abord renvoyé accidentellement un callback à l’évaluateur : fixture corrigée en bloc explicite, sans modification de l’export du jeu. Un test d’import a reçu une attente conditionnelle pour son traitement asynchrone. Les rapports courants proviennent d’une nouvelle exécution complète.

Deux parcours tactiques supplémentaires terminent trente vagues, sur fret et laboratoire en Marine, avec stocks normaux et achats via le magasin. Les agents restent omniscients et visent idéalement ; leurs résultats ne sont pas des essais humains.

agent-browser est absent. La navigation locale de Chromium est refusée par ERR_BLOCKED_BY_ADMINISTRATOR ; aucun contournement essayé. HTML chargé en mémoire avec Storage Map déclaré. L’ouverture file:// et la persistance native ne sont pas certifiées. Le serveur HTTP est vérifié séparément par Node sur un port libre, sans arrêter les services existants.
