# ALIENS — V109 « Logistique sous pression » / RC1

Continuation réelle de `ALIENS_1986_V108_CONTACT_PERSISTANT_RC1.zip`.
**Branche autonome jouable, pas une archive complète du moteur Tantalus ni une fusion dans ses 64 salles natives.**

## Jouer

Ouvrir `JOUER_ALIENS_V109.html` dans un navigateur récent. Le document contient ses modules et son CSS ; aucune ressource externe n’est requise. Selon la politique du navigateur, un hébergement local peut être nécessaire. La recette de cette livraison charge les octets du document avec Playwright `set_content` et son chargeur Blob normal ; elle ne certifie pas le transport `file://` ni un téléphone physique.

Pour servir le dossier localement : `python -m http.server 8767`, puis ouvrir le document depuis ce serveur. `JOUER_WINDOWS.bat` ouvre le HTML. Les exports JSON permettent de conserver un point de partie indépendamment du stockage local du navigateur.

## Parcours

L’opération Repli sur Operations conserve ses cinq jalons : rejoindre Operations, rétablir le relais, retrouver Newt, tenir le corridor et ramener l’équipe. Deux pièces ajoutent un détour facultatif : **Operations → Galerie logistique → Réserve technique → Maintenance**.

Sept lieux simulent leurs contacts dans l’opération. Huit inspections sont accessibles séparément ; le Sulaco reste isolé, sans nouveau final. Les deux nouveaux contacts sont des acteurs de catalogue, pas des renforts générés à l’infini.

## Logistique

Trois stocks finis, à ouvrir pendant 1,05 seconde, donnent au total trois lots personnels, deux trousses et une cartouche pour sentinelle. Le groupe partage cet inventaire : pas encore d’encombrement par membre.

- Ravitaillement personnel : 0,85 seconde ; +18 cartouches ; plafond 96 ; un lot.
- Soin : 1,6 seconde ; +30 PV maximum ; plafond 100 ; une trousse ; aucune résurrection.
- Sentinelle : 1,35 seconde ; +40 coups ; plafond 120 ; une cartouche ; pas de recharge automatique.
- Sirène de diagnostic : commande de 0,65 seconde ; son pendant 8 secondes ; réactivation après 20 secondes.

La proximité, l’immobilité, la disponibilité de la cible et une trajectoire libre sont obligatoires. Un déplacement, un tir, un impact ou un changement de cible interrompt le travail sans consommer la réserve. Newt peut recevoir des soins une fois recrutée mais jamais de munitions. Seul l’allié aidé attend pendant le geste ; le reste de l’équipe et les menaces continuent.

## Commandes

WASD / ZQSD / flèches : marcher et changer de profondeur. Souris : viser. F ou clic : tirer. E : portes, scellés, commandes et franchissement. R : manœuvrer la liaison proche. T : détecteur. V : allure prudente. G / H / C : rallier, tenir, couvrir. B : ravitailler la cible. I : soigner la cible. Y : ravitailler la sentinelle proche. M : carte. Tab : archives. Échap : pause.

Les barres de commande et d’inventaire sont hors canvas ; la carte, les archives et la pause remplacent la scène. Le son synthétique facultatif reste désactivé par défaut.

## Persistance

Les scellés ouverts, réserves consommées, acteurs, blessures, tirs, sas, souvenirs ennemis et alarmes sont conservés. Un geste commencé peut être exporté puis repris en pause. Les importations sont validées avant mutation : quantités, identités, géométrie, durée, cible, propriétés et équilibre des ressources.

La migration V108 conserve l’ancien état sans soins, munitions ni progression offerte. Les nouveaux lieux sont initialisés au temps courant, leurs contacts sans mémoire, les nouveaux raccords ouverts et l’inventaire de terrain vide. V107 et V106 passent d’abord par leurs validateurs hérités ; V106 reste une inspection. Le système ne prétend pas signer les sauvegardes ni empêcher la triche par un utilisateur expert.

## Documentation et preuves

- `CODEX_LEVEL_DESIGN_V109.html` et `.md` : 17 règles, 8 fiches, plans calculés depuis les données.
- `RAPPORT_ILLUSTRE_V109.html` : 12 captures sélectionnées, embarquées sans retouche.
- `report/captures-v109/` : 25 PNG bruts Chromium.
- `QA_REPORT.md` : périmètre, résultats et limites.
- `report/*-v109.json` et `report/node-tests-v109.tap` : preuves courantes.

Les résultats et scripts v108 conservés sont des références héritées et des fixtures de migration. Ils ne doivent pas être confondus avec une recette v109.

## Reproduire la recette

```text
npm run check
node tools/export-contracts-v109.mjs
npm run drive
python tools/build-preview.py
python qa/browser-v109.py
python tools/build-docs-v109.py
python qa/distribution-smoke-v109.py
python tools/release-check-v109.py
```

Node 20+ pour les tests et modules. Python 3 et Playwright/Chromium pour la recette navigateur. Jouer au HTML ne demande ni Node ni Python.

Contrôle de la livraison d’origine, en lecture seule : `python tools/verify-package.py`. Les recettes ci-dessus régénèrent les preuves et peuvent changer les pixels, durées de tests ou hashes ; elles ne doivent pas être prises pour un contrôle inchangé de l’archive originale.

## Limites

Pas de nouvelle intégration native, de push GitHub ou de déploiement Vercel. Le raccord V106 hérité reste inactif. Transferts discrets entre pièces, tirs locaux, réseau acoustique tactique, rendu procédural stylisé, pas de sprites finaux, de voix spécifiques, de multijoueur ni de manette certifiée. Aucun nouveau combat historique Reine/P-5000/sas.
