# ALIEN 5 — PROJET LAZARE
## V6 · Le poids des machines · 1.5.0-candidate.1

Campagne autonome non officielle, dans une branche alternative après *Aliens*. Cette archive contient le jeu cumulatif, pas seulement un correctif. La manutention, Calder, les dialogues et les dénouements sont des créations de cette adaptation ; aucun scénario intégral authentifié de Blomkamp n’est revendiqué.

## Jouer

Ouvrir `ALIEN5_PROJET_LAZARE_JOUER.html` dans un navigateur de bureau récent. Le HTML contient ses scripts et dessins, sans service externe obligatoire. Aucun outil de développement n’est nécessaire pour jouer. Le jeu se contrôle au clavier et propose des boutons tactiles. La compatibilité matérielle de toutes les manettes n’a pas été testée.

Le rendu est vectoriel stylisé ; ni graphismes photoréalistes, ni reproduction 1:1 des artworks. Les personnages, machines et objets sont rendus séparément dans les niveaux.

## V6 : secteur de manutention

Après « Réarmer le groupe auxiliaire », rejoindre la galerie d’inspection puis la remise des chargeurs. Quatre lieux et six accès sont ajoutés. Le P-17 se pilote uniquement dans ces quatre grandes salles. L’objectif facultatif consiste à ranger la palette PF-09, acheminer CP-2 sur sa balance et actionner à pied le pupitre des treuils. Il réduit ensuite le temps d’intervention sur les attaches finales de 2,4 à 1,6 seconde, sans les poser automatiquement et sans supprimer la reine.

U ouvre le menu Industrie. K saisit ou dépose la charge devant les pinces. E agit sur un élément à portée. Espace donne un coup de pince lorsque les mains sont libres. Les boutons du menu permettent de monter, descendre, réparer ou actionner la manivelle. Une charge interdit le coup de pince et élargit le gabarit.

La batterie se vide en mouvement et lors des prises/coups. Elle ne se vide pas à l’arrêt. Deux bornes rechargent à proximité. Sous 10 %, descendre et utiliser la manivelle procure 25 % en 3,2 secondes ; ce secours est réutilisable et ne répare pas. Les trois kits hydrauliques sont finis : 65 points de réparation chacun, sans soin humain. Un véhicule abandonné, une charge ou une palette restent à leur véritable emplacement.

Le dépôt est refusé sur une personne, un obstacle ou près d’un seuil/pupitre. Les deux aires de sécurisation sont marquées au sol. Un dépôt hors aire demeure récupérable. Une charge sécurisée ne peut plus être reprise ; les portes associées restent ouvertes.

## Contrôles conservés

ZQSD, WASD ou flèches : déplacement ; Maj : marche silencieuse ; E : action/annulation ; Espace ou clic sur le terrain : tir ; R : rechargement ; 1/2 : armes ; H : soin ; F : leurre ; C : ordre de Hicks ; G : transfert de munitions ; L : torche ; T : détecteur ; B : regroupement ; X : niche ; V : soudure ; Tab : carte ; J : journal ; Échap : pause. Dans le cockpit, le matériel personnel n’est pas accessible et F peut aussi commander les pinces. Dans le relais de Newt, les actions correspondent à son équipement non armé.

## Sauvegarde et transfert

Dans la V5, Pause → Exporter la sauvegarde. Dans la V6, Pause → Importer une sauvegarde. V1 à V6 sont acceptées, sans écrire dans les anciennes clés. La nouvelle clé est `atf.alien5.lazare.v6`.

Un cockpit en cours, sa batterie, ses dégâts, ses kits et sa charge peuvent être exportés. Un fichier invalide ou incohérent ne doit pas remplacer l’opération actuelle. La sauvegarde dépend des permissions et de l’origine du navigateur : conserver une copie JSON reste prudent. Les tests ont vérifié la logique avec un stockage de test et le refus du stockage natif ; ils ne certifient pas la conservation native après fermeture du navigateur.

Une V5 déjà après stérilisation conserve sa progression, sans rouvrir rétroactivement le relais de Newt. La manutention ne réécrit pas les anciens dénouements et reste facultative.

## Contenu cumulatif

52 lieux, 70 connexions réciproques, 12 chapitres, 27 objectifs principaux, trois dénouements. Les trois services secondaires, le relais civil de Newt et ses six étapes, les trois travailleurs, Hicks, Miller, huit cloisons et dix niches sont conservés. La manutention ajoute quatre jalons facultatifs distincts.

30 individus ennemis persistants, six familles (les deux nouveaux sont des drones, pas de nouvelles castes). 416 placements décoratifs et 60 emprises solides statiques, plus le châssis stationné et deux cargos dynamiques : ces nombres ne sont pas des images uniques.

## Documentation et preuves

- `CODEX_ALIEN5.html` : 82 règles, campagne et 52 fiches de lieux illustrées.
- `RAPPORT_VISUEL.html` : changements, 17 captures de scène/interface, bilan des tests et limites.
- `docs/` : règles Markdown, registres JSON, données de pièces.
- `qa/summary-v6.json` : décompte des suites effectivement exécutées.
- `qa/v6screens/` et `qa/v6rooms/` : 17 scènes/interfaces et 52 vues de pièces.

Les captures de manutention reprennent des exports du pilote automatisé. Le cas de panne et l’atlas sont préparés. Les parcours automatisés utilisent les ennemis actifs et les ressources finies, sans invulnérabilité, téléportation du joueur ou objectifs injectés ; le pilote connaît cependant la géométrie, les positions et les solutions. Aucun parcours humain complet n’est revendiqué, et les réserves finales restent généreuses.

## Développer et tester

Le jeu n’utilise aucune dépendance JavaScript externe. Tests moteur : Node 20+ (exécutés ici sous Node 22). Construction et documentation : Python 3. Les outils de vérification graphique nécessitent les dépendances de `requirements-dev.txt` et un Chromium disponible. Le chemin de Chromium peut être configuré avec `CHROMIUM_PATH`, sinon `/usr/bin/chromium` est utilisé.

```sh
npm run build
npm test
npm run test:campaign
npm run test:browser
npm run docs
npm run test:docs
npm run package
```

`npm run test:campaign` exécute les quatre parcours. Le navigateur de cet environnement refuse les navigations locales HTTP/fichier : le test exécuté charge le HTML avec `set_content`, utilise une horloge contrôlée et un substitut explicite de stockage. Un démarrage normal sans exposition QA est testé séparément. Aucun navigateur ne télécharge de ressource distante pour rendre le jeu.

Le fichier normal n’expose aucun menu de développement. Les contrôles d’interface activent un accès QA dans leur seule copie en mémoire. Un paramètre `?qa=1` permet volontairement aux développeurs d’inspecter une copie servie localement ; il n’ajoute pas de bonus à la sauvegarde.

## Lanceur Tantalus facultatif

L’installateur ne fusionne pas le moteur natif, les missions, récompenses, inventaires, sauvegardes globales ou registres MIRE. Il ajoute un accès à cette page autonome seulement, dans une copie compatible du jeu hôte.

```sh
node integration/install.mjs --check CHEMIN_DU_PROJET
node integration/install.mjs --apply CHEMIN_DU_PROJET
# Pour une installation antérieure reconnue, jamais pour forcer une divergence :
node integration/install.mjs --upgrade CHEMIN_DU_PROJET
node integration/install.mjs --remove CHEMIN_DU_PROJET
```

Les empreintes, sauvegardes et divergences sont vérifiées ; les modifications concurrentes ne sont pas écrasées silencieusement. Les vingt cas d’installation sont des fixtures isolées, pas une validation du projet Tantalus complet. Aucun push GitHub ni déploiement Vercel n’a été réalisé dans cette livraison.
