# Validation V85 — recrutement causal, locale, non publiée

Date : 2026-09-13. Version : 85.0.0. Branche : `codex/v52-physical-worlds`.

## Source et périmètre réellement livré

La conversation **Créer des marines uniques** a été retrouvée intégralement, archivée sans réécriture et comparée à sa source. Le suivi V83 reçoit un addendum : les huit aptitudes étaient présentes dans le message complet, contrairement au résumé antérieur. Détails du contrat, règles V85 ajoutées et réserves : `V85_RECRUITMENT_RUNTIME.md`.

Ce lot branche le pool persistant, le recrutement, les huit aptitudes, la formation, la dotation personnelle et ses transferts, les dossiers comparables, les participations aux missions et les relations vécues. Le dossier initial ne se transforme pas en fonction de l'équipement actuel. Les opérations conservent un manifeste d'identités et de matériel ; les écritures sont atomiques. Les régressions couvrent les anciens membres, les nouveaux identifiants, le joueur indépendant V84, le J1 legacy et J2.

## Tests et build exécutés

- `npm run qa` a passé toute la chaîne art, inventaire, audio, BIOFORGE, lint, tests et build. Le corpus graphique n'a pas changé ensuite.
- Après les dernières corrections révélées par le navigateur, `npm run lint` et `npm test` ont été réexécutés : **416 modules ; 2037 tests, 2036 réussis, 0 échec, 1 ignoré**. Le test ignoré dépend de liens symboliques non autorisés par l'hôte.
- Les suites V85 comprennent notamment 40 tests du générateur, 25 de sauvegarde, 15 de transactions/interface, 32 du moteur, quatre de raccord application/reprise et 32 du gate HTTP. Les tests exécutent les consommateurs réels des armes et des aptitudes ; les seules assertions de forme ne servent pas de preuve de gameplay.
- Build **85.0.0**, **3450 entrées de catalogue**, sorti sur C via `ATF_BUILD_OUTPUT=...\build-v85`. Ce nombre n'est pas un nombre de sprites finalisés. Aucun build massif ajouté au disque D ni à Git.
- Les dernières corrections de compteur sont couvertes par les quatre tests d'application, la suite complète finale et la dernière passe navigateur de mission sur le build reconstruit.

## Défauts reproduits et corrigés

- Ancienne grille de portrait de 75 px héritée par les dossiers : cartes qui se chevauchaient. Grille et cartes corrigées uniquement sur Echo-9.
- Filtres de tenue forcés à 220 px : débordement desktop et viewport mobile élargi à 421 px au lieu de 390. Dimensions intrinsèques corrigées, sans cacher le débordement de la page.
- Tab quittait le dialogue natif pour le navigateur : cycle Tab/Maj-Tab contenu, Échap et restitution du focus conservés.
- Recrue jouée en J1 legacy sans contrat individuel : nom, aptitudes, arme, fatigue/endurance, charges et reprise maintenant appliqués ; aucun alias Mara.
- Ramassage global M41A donnant 99 cartouches à un fusil à pompe personnel : refus sans consommation du pickup ni duplication ; le commandant indépendant peut encore le récupérer.
- J2 : cooldown d'outil figé, armure initiale globale et compteur d'actions perdu ; états individuels corrigés, y compris à la reprise. Les auras des membres historiques ne disparaissent plus après formation.
- Le snapshot de mission annulait le choix courant de coop locale : les acteurs sont restaurés avant d'appliquer le choix explicite. Le message de déploiement est ensuite mis à jour avec le nombre réel d'alliés.

## Navigateur réel, build local sur 4186

Chromium isolé, piloté par le harnais CDP du projet car le CLI agent-browser est absent. Aucun profil personnel, aucune sauvegarde utilisateur modifiée. Les scénarios s'exécutent successivement pour éviter les interférences de focus. Ces tests ne certifient pas une manette physique, une campagne intégrale ou tous les navigateurs.

### Dossiers, gestion et refus d'écriture

`browser-recruitment-v85.mjs` : fixture legacy explicite avant boot, puis clics, touches et gestes tactiles réels. Deux recrutements coûtent exactement 1200 crédits ; le pool restant et les identités survivent au rechargement. Affectation en réserve/équipe, formation +2 en quatre heures de jeu pour 80 crédits et un ravitaillement, transfert de la même instance sans duplication, persistance et renouvellement prématuré refusé.

Desktop : largeur du document identique à son contenu, aucun débordant droit. Mobile 390 × 844 : `innerWidth`, `clientWidth`, `scrollWidth` et largeur du viewport visuel égaux à 390 ; boutons d'au moins 44 px, défilement tactile, huit Tab contenus et Échap. Une panne de quota simulée conserve les octets, la campagne et le dossier ouvert avec erreur visible. **Sept captures**, aucune erreur JavaScript/HTTP.

Preuves : `references/v85-release-qa/recruitment-built/`. Une passe source indépendante avait également réussi ; elle n'est pas présentée comme une publication.

### Recrues en mission et coopération

`browser-crew-runtime-v85.mjs` : fixture clairement déclarée avec quatre recrues recrutées/affectées par les actions de sauvegarde avant boot, prologue terminé par son reducer et ressources de test. Déploiement et insertion ensuite par l'interface réelle. Les quatre recrues gardent leurs identités ; M41A, M4A3 et M37A2 ont leurs profils fonctionnels. L'uniforme Echo-9 partagé est déclaré, pas présenté comme quatre portraits ou quatre tenues dédiées.

Activation de la coop depuis Système, reprise, tir vertical J2 avec KeyO, recharge avec KeyT, soin avec KeyG consommant une charge, autosauvegarde, désactivation puis retour IA. Une seule blessure et remise à zéro de cooldown sont des fixtures explicites pour tester le soin ; les ennemis et l'IA ne sont pas neutralisés. L'état stocké avant reprise prouve les munitions, réserves, charges et compteurs ; un vrai tir IA survenu après reprise est comptabilisé, pas confondu avec une perte de sauvegarde. Les annonces DOM sont **4 → 3 → 4 alliés IA**. **Trois captures**, aucune erreur JavaScript/HTTP.

Preuves finales uniquement : `references/v85-release-qa/crew-runtime-built/`.

### Régressions accueil et combat

- `browser-onboarding-v84.mjs` : six captures, création vierge, annulation, réveil physique, marche cryo/CIC, dialogues, reprise et protection contre quota. Aucune erreur.
- `browser-captions-v84.mjs` : cinq captures sur cinq tailles, rail des sous-titres hors canvas/touches, textes défilables. Aucune erreur.
- `browser-combat-v83.mjs` : quatre captures, fixture de mission explicite, visée J1/J2, souris/tactile, relâchement et pause réels. Aucune erreur.

Preuves dans `onboarding-built/`, `captions-built/` et `combat-built/` sous `references/v85-release-qa/`. Les **30 fichiers** retenus (25 captures et cinq rapports) ont été archivés avec comparaison SHA-256. Aucun essai échoué ni capture intermédiaire n'est promu comme réussite. Dossiers mobile, cartes, comparaison et mission ont été relus visuellement.

## Gate de livraison et publication

Le vérificateur V85 exige un SHA de commit explicite, compare **52 fichiers critiques** et **12 images V81/V82 inchangées**, les types MIME, le cache, les métadonnées et la version. Les sources ChatGPT et preuves privées V81–V85 doivent répondre 404. Il utilise la liste Git avec séparateurs NUL, donc les chemins accentués et avec espaces ne peuvent pas échapper au contrôle. Ses 32 tests passent.

Le contrôle HTTP local a réussi contre le commit de contenu **`06629693e384bfca0fd11a877b7dcc1e3fd53dec`** : 52 fichiers critiques conformes, 12 images conformes (dont deux éléments modulaires), cache/version V85 conformes et **182 chemins de preuves privées répondant 404**. Rapport : `references/v85-release-qa/local-build-http.json`, cible déclarée `local-build`, jamais production Vercel.

La première passe HTTP avait correctement refusé le MIME WebP `application/octet-stream` annoncé par le serveur Python Windows. Le serveur QA local a été remplacé par un handler statique avec correspondance explicite `image/webp`, sans changer les fichiers du build ni assouplir le gate ; la passe complète suivante a réussi. Les espaces Markdown et la fin de fichier de l'archive ChatGPT ont été conservés pour fidélité au verbatim ; le contrôle de whitespace des autres changements est propre.

Aucun push GitHub ni déploiement Vercel V85 effectué. La publication reste suspendue à l'accord explicite demandé pour l'envoi des rapports et captures QA dans GitHub. Ces fichiers restent exclus du build public. Aucun appel API OpenAI facturé n'a été effectué.

## Réserves non effacées

ImageGen intégré a échoué avant production à la lecture Windows d'une référence, y compris sa copie vérifiée sur C : `helper_unknown_error: apply deny-read ACLs`. L'utilisateur a choisi de rester sur l'outil intégré ; le script API n'a pas été utilisé. **Zéro nouvelle image ou sprite sheet** dans ce lot.

L'uniforme partagé n'est pas un portrait individuel. Les objets personnels physiques, harnais d'évacuation, missions personnelles, dialogues réactifs et souvenirs détaillés ne sont pas livrés. Le Tir ajuste l'IA ; les joueurs conservent leur visée manuelle V83. Les trois armes validées ne représentent pas toutes les familles d'armes.

La conversation #5 passe de MISSING à PARTIAL : **0 DONE / 18 PARTIAL / 8 MISSING** pour les 26 conversations. Les ennemis restent **14/571 intégrés, 557 non intégrés**, sans promotion de Lurker/Atarax rejetés. Aucun statut de fidélité graphique 1:1, de toutes-promesses réalisées ou de jeu commercial complet n'est revendiqué.
