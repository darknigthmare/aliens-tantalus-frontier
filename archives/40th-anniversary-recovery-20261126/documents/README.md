# ALIEN — Six signaux perdus 0.6.0

Les six histoires sont indépendantes et condensées. Le pack conserve tous les lieux de son contenu 0.5, mais ne revendique pas un inventaire plan par plan des films ni un plan métrique canonique. Les douze galeries sont des raccords originaux. Les espaces de Containment sont des sous-volumes de navette, pas douze grandes salles. Les changements de palier d’Ore sont des transitions de secteur, pas une simulation animée de cage ou d’échelle.

Édition autonome Canvas. Aucune fusion native MIRE/GameEngine/SaveSystem, aucune archive maître avec les anciens DLC, aucun push GitHub ni déploiement Vercel. L’outil facultatif de réunion ajoute uniquement un lien au menu dans une nouvelle copie ZIP. Graphismes vectoriels provisoires, ambiances locales facultatives, fragments écrits sans doublage et épilogues textuels.

## Démarrage
Extraire puis ouvrir `JOUER_40TH_ANNIVERSARY.html`. Les copies individuelles sont dans `episodes/`.
`ATLAS_SPATIAL_40TH_V0_6.html` présente tous les plans, `CODEX_40TH_V0_6.html` le contenu et `RAPPORT_VISUEL_40TH_V0_6.html` les résultats exécutés.

## Sources et vérification
`npm run build` reconstruit sans réseau les sept HTML (Python 3 + Node 18 ou plus).
`npm test` exécute les deux suites Node 0.6.
`npm run test:integration` vérifie l’outil de réunion sur des archives synthétiques.
`npm run test:browser` exige Python Playwright installé et Chromium ; `CHROMIUM_PATH` permet de choisir son binaire.
`python tools/build_contact_sheets_v6.py` exige Pillow et une police système disponible.
`npm run docs` reconstruit les documents à partir des contenus et résultats QA.
`npm run test:docs` vérifie les documents générés.
Les anciens tests/couches dans `tests/` sont conservés comme historique ; seules les suites explicitement désignées dans `package.json` et le rapport comptent pour cette livraison.

## Réunion facultative à une autre archive
`python tools/integrer_archive.py ARCHIVE_SOURCE.zip NOUVELLE_ARCHIVE.zip`
L’outil exige une racine et un `title-menu` compatibles, refuse les collisions et ne modifie pas le ZIP source. Il ajoute seulement un lien à un module autonome, sans fusionner MIRE ou les sauvegardes du jeu hôte.

## Sauvegardes
Les clés des douze couples épisode-vue restent inchangées. F6 propose trois repères manuels supplémentaires pour chacun, soit 48 emplacements au total. L’export JSON individuel conserve une partie ; le coffre emporte les emplacements présents et le registre des fins. Le remplacement est facultatif et confirmé. Toutes les entrées sont validées avant écriture. Un stockage refusé bascule vers la mémoire de l’onglet : exporter avant de le fermer.

spatial.schema = 6 conserve le dernier passage et les compteurs de migration. Les anciennes brides H02↔H05, H03↔H07 et leurs équivalents sont reportées sur les deux segments de chaque nouvelle galerie avec la même échéance et les mêmes dommages, sans recharge gratuite. Une ancienne position occupée par le nouveau décor est dégagée. Une partie antérieure sauvegardée derrière un nouveau verrou de scénario reprend du côté accessible le plus proche, avec avertissement ; les objectifs, documents, décisions et stocks sont conservés. Les visites historiques ne sont pas effacées. Les fins déjà achevées restent achevées.

L’ouverture file:// a été tentée puis bloquée par le navigateur de validation (ERR_BLOCKED_BY_ADMINISTRATOR). Les HTML exacts ont été exécutés par chargement inline dans des pages vierges. Le double-clic local et la persistance disque entre ouvertures ne sont pas certifiés ici. Les exportations et importations JSON par les commandes du navigateur ont réellement été exercées. Les petits écrans sont des tailles émulées, pas des appareils physiques.
