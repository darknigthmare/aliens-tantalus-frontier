# ALIEN — Fleuve de la Douleur · 0.8.0-candidate.1

## Hadley’s Hope · La piste des prospecteurs

DLC autonome non officiel pour Aliens: Tantalus Frontier, suite des vrais fichiers 0.7. Un tracteur devient pilotable sur deux pièces existantes. Le parcours de 16 chapitres, 42 pièces et 49 objectifs est conservé avec ses six détours. Ce paquet n’est pas le Tantalus complet, ne fusionne pas son GameEngine/SaveSystem/MIRE natif et n’est pas publié sur GitHub ou Vercel.

## Jouer

Extraire le ZIP, puis ouvrir `JOUER.html`. Sous Windows, `LANCER_WINDOWS.bat` ouvre le même fichier. Le HTML autonome contient ses scripts, styles et dessins ; aucun serveur, compte ou téléchargement d’assets n’est requis. Les sources modulaires sont sous `src/river-of-pain`.

À pied : Q/D ou A/D marcher, Z/S ou W/S profondeur, E utiliser, F tirer, R recharger, C s’accroupir, Maj courir, Espace + directions viser, I équipement, Tab plan, J carnet, Échap pause. L lampe, T détecteur, G cachette, X fusée, H soins, B soudure, V suivre/attendre, M repère de repli, N écouter une porte, O relevés, U détours, P parler, Y registre colonial, K balise sonore, Entrée dispositifs, 4 gaines. Anne et Newt restent sans arme.

**5 : dossier du tracteur.** Après la préparation au garage dans le chapitre « Les coordonnées », le rejoindre sur la piste extérieure. Monter demande 1,5 s sur place. Au volant : Q/D accélérer horizontalement, Z/S braquer en profondeur en roulant, Espace ou C maintenu freiner, F avertisseur, L phares, E/5 cabine. Pour descendre, s’arrêter et conserver une sortie libre. L’épave, le garage et les intérieurs restent à pied. Newt et les escortes ne montent pas.

Deux bornes à stocks finis réparent +55 ou rechargent +65 maximum, après stationnement à proximité puis approche à pied. La route peut toujours être parcourue à pied ; une panne loin d’une borne ne déclenche pas de remorquage automatique. En vue classique, le tracteur vide se range sur le plan arrière pour libérer la marche, convention de projection discrète. Le compteur affiche des km/h simulés, pas une caractéristique officielle.

## Sauvegardes

Pause → EXPORTER produit un vrai JSON ; Pause → IMPORTER le recharge. Les fichiers réels des versions 0.1 à 0.7 sont acceptés et testés. Garder une copie extérieure reste utile. Les nouvelles réserves, le châssis, le stationnement et même la vitesse au moment de l’export sont conservés. Une montée ou réparation inachevée doit être recommencée sans faux débit.

Le protocole local à deux copies est testé dans MemoryStorage simulé. La persistance native après fermeture, les quotas réels, le mode privé et plusieurs onglets simultanés ne sont pas certifiés. Les véritables imports/exports par les boutons ordinaires sont testés dans Chromium.

## Lanceur facultatif dans une copie du projet hôte

L’installateur nécessite Node 20 ou plus. Depuis ce dossier :

```sh
node tools/install.mjs /chemin/vers/la-copie-de-tantalus
node tools/install.mjs /chemin/vers/la-copie-de-tantalus --upgrade
node tools/install.mjs /chemin/vers/la-copie-de-tantalus --remove
```

L’installateur ajoute un accès vers le module autonome. Il contrôle les empreintes et les ancrages attendus, refuse d’écraser des conflits personnels et conserve un retour arrière. Les tests utilisent des shells hôtes de test et le vrai payload précédent : ils ne qualifient pas un build du jeu principal complet. Les anciennes sauvegardes du Tantalus natif ne sont pas modifiées.

## Sources et reproduction

Python 3, Node 20+ et Playwright pour Python sont nécessaires aux outils, pas au HTML portable. Adapter le chemin Chromium dans les tests ailleurs (`/usr/bin/chromium` dans l’environnement de livraison).

```sh
npm run build
npm test
python tools/qualify-model.py --previous /chemin/vers/ALIEN_FLEUVE_DOULEUR_v0.7.0
```

Pour les sauvegardes de test, les contrôles navigateur et le paquet :

```sh
node tests/fixtures-v08.cjs
npm run test:browser
npm run docs
npm run test:report
npm run verify
npm run package
```

Le paramètre `--previous` est facultatif pour les suites ordinaires, mais indispensable pour refaire la qualification avec le vrai payload 0.7. Les fichiers de tests anciens restent disponibles ; seuls les rapports actuels sous `docs/` qualifient cette livraison. Le HTML s’exécute ici par `set_content` après un refus administratif de HTTP local, sans changement d’origine ou de politique. Aucune requête externe n’est requise au runtime autonome.

## Rapports et limites

`RAPPORT_ILLUSTRE.html` contient douze captures réelles et leur provenance. `docs/CODEX_LEVEL_DESIGN.md` décrit les pièces et les règles exactes. `docs/QA_REPORT.md` distingue cas du modèle, parcours optimisés, navigateur, exports et stockage simulé. Les sources historiques utiles de la 0.7 sont dans `history/v0.7.0`, sans recopier ses galeries dans le paquet courant.

Dessins Canvas stylisés provisoires, pas atlas finaux. Roman intégral non consulté : plans, dialogues et mécaniques originaux non certifiés scène par scène. Pas de route continue globale, de conduite intérieure, de remorquage, de siège compagnon, de multijoueur ou de certification de téléphone/manette physiques. Pas de durée de campagne humaine ou d’équilibrage final annoncé. Aucun push GitHub ni déploiement Vercel.
