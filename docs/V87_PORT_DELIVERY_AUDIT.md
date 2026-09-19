# V87 — Relais civil, adoption et transfert physique

Audit privé du 19 septembre 2026. Ce document et les preuves ne font pas partie de la distribution publique.

## Source et périmètre

Continuation du paquet récupéré `ATF_Animaux_USS_Conception_Codex_v1` (CONCEPTION, PROMPT, QA_ACCEPTATION, marchand/navigation). Les fondations publiées précédemment sont conservées : aucun animal possédé par défaut, habitats équipés, identités Moka/Brume, atlas dédiés et registre séparé.

Le Relais civil de la Frontière est une création locale originale du projet. Il ne représente ni Gateway ni Pioneer et ne simule pas une navigation interstellaire. Les frais d'escale nuls, les 8 s d'approche, 6 s d'amarrage, 6 s de largage, 2 s de contrôle et 4 s d'acclimatation sont des choix de rythme du jeu, pas des durées réalistes ni une citation canonique.

## Implémentation de ce lot

- Pupitre physique au hangar et passerelle vers un compartiment civil séparé. L'ancien sas d'arrivée reste présent. L'amarrage avance uniquement en simulation active et peut être annulé/rechargé.
- Dossier d'individu, aperçu à échelle constante, habitat et prix requis, confirmation explicite ; transaction et stock uniques enregistrés avant affichage.
- Acquisition de Moka (220 CR) ou Brume (300 CR), caisse à prendre avec E au comptoir, transport par le vrai hangar, échelles et ascenseurs, quatre points de contrôle physiques et dépôt dans le logement compatible.
- Contrôle, acclimatation puis apparition du résident, sans conversion de l'achat en téléportation.
- Caisse laissée au dernier ancrage validé si le porteur subit une discontinuité ; retour et reprise physique nécessaires. Les données de trajet, possession et reçu sont conservées. Un refus de sauvegarde ne crée pas de deuxième écriture ou de succès visuel.
- Routines de marche, repas, repos et contact ; graph Habitat dérivé des mêmes obstacles et plateformes que le joueur, même après chargement sur un autre pont. Pas de faim hors ligne ni bonus de combat humain.
- Interpolation visuelle bornée entre poses validées ; pas d'interpolation entre pièces, identités ou clips différents. Les options de réduction des mouvements et la pause sont respectées.
- Largage et départ de mission refusés tant qu'un transfert reste inachevé ou un compagnon reste hors du vaisseau.

## Corrections issues de la vérification physique

1. Porte du comptoir déplacée hors de l'arc électrique : x40..158, centre99. Pupitre x0..36, accessible depuis la borne de marche du joueur.
2. Passerelle hangar→réacteur reliée, plateforme basse prolongée et véritable échelle de sortie. L'arc et les collisions du dropship ne sont pas supprimés ; témoin négatif toujours à 22 dégâts.
3. Premier plan opaque du hangar recadré à partir du sol y624 ; il ne masque plus les jambes du marine ni la caisse.
4. Barrière du comptoir placée derrière l'animal rencontré et libellé de station à calibrer remplacé par l'état du comptoir.
5. Fermeture silencieuse des dialogues et anciennes projections au changement de profil, protection contre imports tardifs et quota.

## Images produites

Deux nouveaux PNG RGBA via l'outil intégré OpenAI ImageGen exclusivement. Aucun appel API facturable de secours. Les fichiers originaux sont conservés.

| Fichier runtime | SHA-256 | Usage |
| --- | --- | --- |
| port-vendor-atlas.png | 82b1d2eba940a87ddc68e00b9868432ff4a88d97b09aee3f7148b3ae2b9ca9a7 | Responsable originale ; 4 poses idle utilisées. Les 4 poses talk sont recadrées/testées mais sans déclencheur de conversation animée dans le monde ; les 8 poses de marche ne sont pas déclarées certifiées. |
| port-props.png | 260a29bfa4ac456ae1d32e31e7c7665f6ed0e27b1f94a08f89cf1d83687cf167 | Props indépendants recadrés avec transparence, pas une image de salle monolithique. |

Prompts et chemins source : `docs/references/v87-port-generation-prompts.json` (privé). Le mur et les atlas d'animaux réutilisent les quatre PNG dédiés du lot précédent.

## Preuves vérifiées à ce stade

- Suite complète : 2 570 tests, 2 569 réussis, 0 échec, 1 ignoré. `unit-tests-final.log` privé sur I.
- Lint syntaxe/sécurité : 473 modules, réussite ; `git diff --check` sans erreur.
- Moka, navigateur réel à 1280×720 : `e2e/run-04/report.json`, 24 jalons, aucun échec réseau/console, santé100. Annulation, approche rechargée, amarrage, achat unique (2980 CR restants), caisse transportée au clavier par les ascenseurs, 4/4 points de contrôle, arrivée, contact, marche et rechargement validés. Une seule fixture initiale ; aucune affectation de position après.
- Brume, contexte navigateur neuf : `e2e/brume-01/report.json`, même parcours réel et 24 jalons, santé100, 0 erreur ; achat unique 300 CR (2900 restants), marche1160→1163,6 puis rechargement. Moka n'est pas acquis dans ce contexte.
- Domaine/contrôleur de récupération : refus des états corrompus, caisse non déplacée, reprise proche seulement, trace préservée et arrivée ; test quota avec une seule tentative et aucun succès visuel indu.
- Registre courant : 12 annexes, 28 salles, 30 connexions ; historique V71 conservé.
- Distribution source filtrée : 906 fichiers / 730 assets / aucun document privé détecté. Build isolé : 895 fichiers / 730 assets.

Les captures et rapports résident sous `I:/CodexQA/AliensTantalus/v87-port-20260919/`, jamais dans le dépôt public.

## Publication et confidentialité

- Commit public `035d54c84ef3481f4e5484ee7e39bd22e3be76aa`, poussé atomiquement sur `main` et `codex/v86-public-release`.
- Vercel production `dpl_BnmzYxz4SD5u8Yt2SuHgCk8f4A6W` : READY, même SHA. Alias `https://aliens-tantalus-frontier.vercel.app` vérifié.
- HTTP production : 83 modules critiques, 16 assets acceptés et 6 PNG animaux/port comparés au commit ; 223 URL privées répondent 404. Rapport `privateoutput/v87/public-port-production-http.json` dans l'espace nominal privé.
- PWA production : cache `atf-v86-public-shell-6`, 195 chemins, modules et six PNG disponibles hors ligne, CSS du comptoir correcte ; aucun document privé mis en cache. Pas de certification hors ligne de toutes les missions.
- Parité indépendante : 906 fichiers public/snapshot SHA identiques ; build complet, seule métadonnée build-info générée validée sémantiquement. Sur 22 changements, 15 identiques au privé, 3 normalisations CRLF/LF seulement et 4 exceptions de sanitization conformes. 77 tests adversariaux réussis.
- Moka : E2E production `e2e/production-moka-01/report.json`, 24 jalons et aucun échec, achat unique, transport au clavier, arrivée, contact, marche, rechargement et santé100. Le test utilise uniquement sa sauvegarde navigateur isolée.
- Brume : E2E production `e2e/production-brume-01/report.json`, 24 jalons et aucun échec ; 300 CR une seule fois, 2900 restants, seul Brume possédé, trajet 4/4, réception2+4s, marche1160→1163,6 et rechargement identique. Les deux contextes de test sont fermés, profils utilisateur non modifiés.
- L'outil de logs de build distant a répondu indisponible ; aucun audit de logs serveur ou de drains n'est revendiqué. Le statut de déploiement, la parité HTTP et le navigateur sont effectivement vérifiés.

## Limites encore ouvertes

Ce lot ne termine pas le projet commercial ni toutes les conversations du dossier ChatGPT. La pièce hommage, le reste des nouveaux contenus récupérés, les centaines de planches ennemies demandées et les autres promesses nécessitent leur propre suivi.

L'animation humaine dédiée au portage n'est pas générée : la caisse est raccordée au marine existant. Le dropship historique reste moins net que les nouveaux modules. Le comptoir réutilise le mur d'accueil animalier ; ce n'est pas une certification de tous les fonds, perspectives ou salles. Le relais n'est pas un hub de station complet ni un réseau de voyages civils. Les résidents ne prouvent pas encore toutes les interactions avancées d'animaux ou toutes les animations de la responsable. Une fidélité 1:1 ou une complétude commerciale globale n'est pas revendiquée.
