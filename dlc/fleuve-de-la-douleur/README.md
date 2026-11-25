# ALIEN — Fleuve de la Douleur · 0.9.0-candidate.1

## Hadley’s Hope · Les lieux ont une mémoire

Suite locale des vrais fichiers 0.8. Le parcours compte maintenant 47 lieux, 64 connexions bidirectionnelles, 16 chapitres courts, 49 objectifs principaux et six détours facultatifs. Ce paquet comprend le DLC autonome, pas le jeu Tantalus complet ni une fusion de son GameEngine/SaveSystem. Aucun push GitHub ou déploiement Vercel.

## Jouer

Extraire l’archive, puis ouvrir **JOUER.html**. **LANCER_WINDOWS.bat** ouvre ce même fichier sous Windows. Le HTML embarque les scripts, les styles et les dessins du jeu ; aucun compte, serveur ou téléchargement d’assets n’est nécessaire. Les liens du registre de références s’ouvrent seulement à la demande.

À pied : Q/D ou A/D marcher, Z/S ou W/S profondeur, E utiliser, F tirer, R recharger, C s’accroupir, Maj courir, Espace + directions viser, I équipement, Tab plan, J carnet, Échap pause. L lampe, T détecteur, G cachette, X fusée, H soins, B soudure, V suivre/attendre, M repère, N écouter la porte, O relevés, U détours, P parler, Y registre colonial, K balise sonore, Entrée dispositifs, 4 gaines, 5 tracteur.

**Nouveau : 6 ouvre l’armement ; 3 tire une grenade avec le M41A ; 7 ouvre les références et écarts de fidélité.**
Les Marines peuvent retirer une dotation finie à l’armurerie. Elle contient le M240 et trois grenades pour chacun d’eux. Anne et Newt restent désarmées. Les coûts et capacités sont des valeurs de jeu, pas des données techniques du roman. La grenade peut blesser le joueur et le compagnon. On ne change pas de pièce pendant son vol.

Le tracteur hérité se rejoint à pied sur la piste après sa préparation au garage. Il reste limité à la piste et au plateau, sans siège d’escorte. Q/D accélèrent, Z/S braquent en roulant, Espace ou C maintenu freinent, F actionne l’avertisseur et L les phares. Une panne ne déclenche pas de remorquage gratuit.

## Ce qui a été renforcé

Cinq nouveaux volumes : armurerie, serre vitrée, galerie biomécanique de l’épave, chambre du pilote, cale aux œufs. Les 128 extrémités de passage ont un type et un support visuel adaptés ; les pistes ne sont plus dessinées comme des portes isolées. Quarante-quatre accessoires de décor gênant les seuils ont été déplacés. Les éléments structurels sont des conventions de rendu et non de nouvelles cloisons intégralement collisionnables.

Quatorze profils de personnages ; correction de Russ/Brackett, Luisa/Newt et de la transmission Hidalgo. Les faits vérifiés, les références du film et les choix d’apparence provisoires sont distingués. Cinq contacts nommés du roman s’ajoutent aux douze résidents originaux ; leurs placements et dialogues sont créés pour le jeu.

Le registre contient 93 entrées. Ce n’est pas une liste certifiée de tout le roman : certaines entrées sont explicitement manquantes, partielles ou non confirmées. La présence de la serre et des détails médicaux vient de l’extrait autorisé ; le plan des nouveaux espaces est interprété. L’attribution optionnelle du M240 et du lance-grenades est un choix de jeu inspiré du film, pas une dotation romanesque authentifiée.

## Sauvegardes

Pause → EXPORTER produit un fichier JSON ; Pause → IMPORTER le recharge. Les huit véritables exports 0.1 à 0.8 sont éprouvés par les tests du modèle ; le vrai 0.8 est aussi importé dans Chromium. La nouvelle dotation n’est pas attribuée rétroactivement aux anciens fichiers.

Les tâches manuelles inachevées sont annulées à l’import sans débit de composants. Les raccords déjà engagés, les gaines, le véhicule et les grenades en vol gardent leur état propre. Un retour au point de contrôle restaure l’état enregistré, pas les actions réalisées après ce point.

Le protocole de stockage à deux copies a été testé avec un stockage mémoire simulé. Le stockage natif après fermeture/réouverture, les quotas réels et plusieurs onglets concurrents ne sont pas qualifiés. Conserver un export extérieur est recommandé ; sa réussite ne certifie pas localStorage natif.

## Lanceur pour une copie locale de Tantalus

Avec Node 20 ou ultérieur, depuis ce dossier :

```sh
node tools/install.mjs "/chemin/vers/aliens-tantalus-frontier"
node tools/install.mjs "/chemin/vers/aliens-tantalus-frontier" --upgrade
node tools/install.mjs "/chemin/vers/aliens-tantalus-frontier" --remove
```

L’installateur vérifie les chemins et les fichiers. Il refuse les conflits plutôt que d’écraser des changements personnels. La montée 0.8 → 0.9 a été éprouvée avec les vrais anciens modules sur un shell hôte de test. Ce test n’est pas un build complet du moteur Tantalus.

## Reproduire la recette

Python 3 et Node 20+ pour les sources et les tests. Les tests navigateur exigent Playwright pour Python et Chromium. Le chemin Chromium de la livraison est `/usr/bin/chromium` ; adapter le script ailleurs.

```sh
npm run build
npm test
npm run test:browser
npm run test:qualify
npm run docs
npm run test:report
npm run verify
npm run package
```

Le test de vraie montée nécessite l’archive précédente extraite, séparée :

```sh
node tests/upgrade-real.mjs "/chemin/vers/ALIEN_FLEUVE_DOULEUR_v0.8.0"
```

Les tests navigateur chargent les sources exactes avec `set_content`, l’accès HTTP local ayant été refusé dans l’environnement de livraison. Les scènes ciblées sont des sauvegardes de test validées puis importées par les boutons ordinaires ; elles ne se font pas passer pour une partie humaine complète. Les 42 pilotes du modèle connaissent les chemins et n’injectent aucune réussite d’objectif ni santé.

## Documents

**RAPPORT_ILLUSTRE.html** : 14 captures intégrées et leur provenance. **captures-v09/** : 20 PNG courants et deux vrais exports. **docs/CODEX_LEVEL_DESIGN.md** : fiches des 47 lieux. **docs/REGISTRE_FIDELITE.md** : lieux, personnes et équipements avec leur statut. **docs/AUDIT_SEUILS_V09.json** : 128 seuils et corrections de décor. **docs/QA_REPORT.md** : résultats réellement exécutés et limites.

Les anciennes captures et archives complètes ne sont pas réimbriquées dans le paquet. Les documents historiques conservés sous `history/` ne qualifient pas la version courante.

## Limites importantes

Objectif de fidélité 1:1, pas résultat certifié. Un extrait autorisé du roman, un entretien de l’auteur et des références visuelles du film/sous licence ont été examinés, pas le texte intégral. Les séquences hors-colonie, certains personnages et certains équipements restent absents, et l’exhaustivité ne peut pas être déduite des 93 entrées. Les silhouettes vectorielles restent provisoires, sans ressemblance photoréaliste ou atlas finaux.

Les supports de porte sont visuels ; seules les emprises déclarées par le modèle bloquent réellement. Les franchissements d’étages sont des raccords bornés, pas une verticale libre. L’unité médicale est observable, pas une chirurgie jouable. Pas de simulation de flammes persistantes, pas de nouveau boss, pas de coopératif réseau, pas de performance ou durée humaine certifiée. L’écho Frontière 2204 et les sauvegardes du moteur hôte sont inchangés.
