# Reprise du 19 septembre — récupération privée et correction du joueur

Ce document et les pièces source restent privés. Le jeu publié reste en version 86.0.0 : la conception V87 ne constitue pas une livraison V87 complète.

## Sources effectivement récupérées

Base privée de cette reprise : `C:/Users/chuck/Documents/Codex/2026-08-20/prend-la-conversation-chat-gpt-alien/privateoutput/v87/`.

- Archive réelle `ATF_Animaux_USS_PACK_CODEX_v1.zip`, 40 333 octets, récupérée depuis Downloads. SHA256 `84014cc335af5dee1ff7632aa6233c633a53e009bce604bec80aba37b7bc196e`. Copie originale et extraction contrôlée dans `animals-pack-84014cc3/`. Pas d'exécution du contenu.
- Pack : 15 fichiers, 14 empreintes de manifeste vérifiées ; 18 familles, 16 individus, 14 offres, 8 habitats, 4 marchands, 8 quêtes. Les 178 associations famille/animation ne couvrent que cinq familles et sont toutes à produire. Les 56 critères QA ne sont pas 56 tests exécutés. Aucun runtime, sprite ni audio livré dans ce ZIP.
- 79 images JPG du dossier local `AlienTentalusAintergrer`, 149 964 474 octets, dates du 7 au 10 septembre. Copies dans `retrieved-image-references-sept19/`, 79 empreintes identiques avant/après, originaux intacts. Le manifeste les déclare `REFERENCE_NOT_RUNTIME` et `PRIVATE_ONLY`. Elles ne sont ni une nouvelle génération OpenAI ni 79 sprites intégrés. L'absence de leurs noms dans les anciens index ne prouve pas l'absence de copies renommées.
- Trois nouvelles discussions accessibles du projet « Aliens tantalus project » : « Vérification animations joueur », « Créer une campagne complète », « Conception pièce hommage chat ». Extraits et audits restent dans ce dossier privé. Les réponses tronquées à 20 000 caractères sont marquées comme telles ; la liste des 50 conversations récentes ne constitue pas un inventaire exhaustif de tout le projet.

Les fichiers d'animations V87, le Word/texte complet PALISADE et les images personnelles du REFUGE restent non récupérés. Le connecteur fournit des références de contenu sans URL ni pièce jointe exploitable. Les interfaces navigateur ont échoué sur le helper Windows `apply deny-read ACLs`. Recherche locale bornée effectuée dans Downloads et les dossiers du projet ; pas de lecture de cookies, identifiants ou profils de navigateur.

## Priorités des nouvelles sources, non déclarées terminées

- Joueur : séparer blessure/mort, marche/course, phases aériennes, escalade et outils ; préserver une identité unique et exporter les objets détachés. Les 507 clips/14 198 cellules annoncés sont une cible de production, pas des images disponibles.
- PALISADE : la révision Metroidvania remplace les chapitres centrés sur réunions/procès. Vingt chapitres et leurs régions dédiées ne sont pas implémentés. Chaque grande mission demande capacité, raccourci persistant, zone optionnelle, horreur, action, changement d'état et raison de revenir. La finale 18 minutes ne doit pas être confondue avec les extractions actuelles de quelques secondes.
- REFUGE : pièce hommage indépendante du mémorial militaire et des autopsies, accessible physiquement depuis les quartiers, cinq interactions sans bonus/combat. Aucune photo personnelle inventée.
- Animaux : boutique, confirmation, transport, contrôle d'arrivée, acclimatation, routines physiques et sauvegarde sans duplication. Capacités par habitat, cohabitation sûre, soins même sans référent présent ; les derniers messages priment sur le simple palier de capacité du ZIP. Moka et Brume sont des candidats au premier lot, pas des animaux déjà jouables.

Audits détaillés : `campaign-source-audit.md`, `memorial-audit-final.md`, `animals-pack-audit.md` dans la base privée ci-dessus.

## Correction réellement implémentée

La même séquence `hurt-death` rendait un marine vivant agenouillé puis couché lors d'une blessure prolongée ; son dernier événement pouvait aussi verrouiller son animation.

- `hurt` ne contient désormais que les cellules 12 et 13, sans événement de mort.
- `death` contient 13, 14 et 15 ; lui seul émet `state:death-lock` dans la famille joueur.
- L'alias historique reste consultable, mais les sélecteurs joueur et PNJ en uniforme partagé ne le sélectionnent plus.
- J1, J2 et PNJ gardent des horloges séparées. Récupération et nouvelle blessure réinitialisent le clip ; la transition vers la mort commence sa propre séquence.
- Aucun nouveau bitmap n'est annoncé. L'essai ImageGen intégré du 19 septembre a échoué à la lecture de la référence Windows ; aucun appel API/CLI facturé n'a été lancé, conformément au choix utilisateur.

## Vérifications réelles

- `npm test` : 2 174 tests, 2 173 réussites, zéro échec, un ignoré (privilège Windows de lien symbolique). Journal `player-hotfix-tests.log` dans la base privée.
- Lint syntaxe/sécurité : 432 modules. Huit nouveaux tests ciblés d'animation, quatre attentes historiques corrigées sans affaiblissement.
- Build public réussi, version 86.0.0, 3 450 entrées de catalogue ; ce ne sont pas 3 450 sprites dédiés.
- Contrôle public : 884 fichiers, 724 assets, zéro document privé dans l'arbre courant. Le module testé et publié est identique après normalisation des fins de ligne Windows.
- Navigateur local isolé : démarrage, vraie visée/tir clavier J1/J2, souris, tactile et pause vérifiés, aucune erreur JS/HTTP ; quatre captures dans `browser-hotfix-combat/`.
- PWA locale : cache `atf-v86-public-shell-3`, 173 chemins, quatre plaquettes d'objets disponibles hors ligne, quatre chemins privés refusés en ligne/hors ligne. Rapport `pwa-hotfix.json`. Toutes les missions hors ligne ne sont pas certifiées.
- HTTP local contre le commit public `e8db1324bc28eac2eadd50d346df64b6681e93ae` : 64 modules critiques/assainis, 16 assets exacts et 216 chemins privés 404. Rapport `hotfix-local-http.json`.

Le commit public ne modifie que `src/sprite-animation-runtime.js` et `sw.js`. Push atomique réussi sur `main` et `codex/v86-public-release`. Les commits et documents de la branche source privée ne sont pas poussés. La vérification Vercel finale est enregistrée séparément après disponibilité ; un push n'est pas une preuve de déploiement réussi.

Ni les nouvelles campagnes, ni REFUGE, ni les animaux, ni tous les sprites ennemis ne sont déclarés terminés par cette passe.

## Publication et contrôles finaux du 19 septembre

Production Vercel READY : `dpl_FfEFmHWD2tNkSxWw1Vu5d1B4tZfd`, commit `e8db1324bc28eac2eadd50d346df64b6681e93ae`, branche `main`, alias `https://aliens-tantalus-frontier.vercel.app`, aucune erreur d'alias. Construction statique : 89,144 secondes entre début et disponibilité. Le contrôle HTTP de production réussit sur les 64 fichiers, 16 assets et 216 exclusions précités : `hotfix-production-http.json`.

Le parcours de combat a aussi été rejoué sur l'URL de production dans un contexte Chrome isolé : démarrage, vraie saisie clavier J1/J2, souris, tactile et pause, zéro erreur JS/HTTP, quatre captures dans `production-combat/`. Aucun profil ni stockage personnel modifié. Le connecteur des logs de build a renvoyé `Tool get_deployment_build_logs not found` : aucun audit exhaustif des journaux serveur ou de la télémétrie n'est revendiqué.

Un second harnais ciblé a exercé les vraies méthodes d'animation du moteur avec des fixtures explicites d'état et d'horloge : huit secondes de blessure vivante, récupération, nouvelle blessure et mort de J1/J2. Aucune frame 14/15 ni death-lock avant la mort, exactement un verrouillage par acteur ensuite. Captures inspectées : debout/replié pour blessure, couché seulement à la mort. Rapport et preuves : `player-injury-browser/`. Ce n'est pas une partie naturellement jouée.

Les captures montrent encore des défauts de level design préexistants (modules, portions d'échelles et props flottants). Ils ne sont pas corrigés par le correctif d'animation et restent à traiter. Les deux poses de blessure ne constituent pas une nouvelle animation fluide à huit images ; la plaquette dédiée reste bloquée par l'outil de génération.
