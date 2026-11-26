# PROMETHEUS — Les voix du Prometheus

**8.0.0-candidate.1 — module autonome cumulatif, 29 septembre 2026.**

Ouvrir `JOUER_PROMETHEUS_V8.html` dans un navigateur de bureau. Le HTML contient le jeu, les dessins et les portraits ; aucune ressource distante n’est demandée. Le rendu vectoriel est provisoire. Ni doublage, ni portraits photographiques, ni plans de tournage 1:1.

## Jouer

Commencer une nouvelle expédition ou importer une progression JSON V1 à V7 depuis la pause. La V8 conserve les systèmes connus sans inventer de dialogues V8 antérieurs. Les clés précédentes restent intactes ; la nouvelle clé est `atf.mire.prometheus.v8`.

**H : parler près d’un équipier. P : manifeste et carnet.** E garde les objectifs et portes ; Q/D ou A/D : marcher ; W/Z/S : profondeur ou échelle ; R : scanner ; V : rover ; T : PUP ; G : Holloway ; B : cloison ; X : balise ; K : sac ; L : torche ; M : carte ; I : instruments ; J : journal ; U : prélèvements ; N : hayon ; Y : déposer ; O : bilan ; Échap : pause ; F6 : présentation.

Neuf identités sont présentes selon le chapitre, jamais comme doubles de Holloway escorté, de Janek jouable ou de Fifield ennemi. Les trajets intérieurs emploient les portes ouvertes et les sols ; les périodes hors champ restent des retraits scénarisés. Ce n’est pas une escouade de combat. Les corps d’ambiance sont non solides pour Shaw.

Le premier contexte d’une réponse est conservé ; relire ne met pas à jour rétroactivement ses observations. Le registre contient seulement les réponses entendues et les dernières rencontres locales. Les portraits SVG séparés sont dans `assets/crew`, identiques aux dessins intégrés au jeu.

L’export `PROMETHEUS_ECHANGES_V8.json` est un carnet consultatif, **pas une sauvegarde de progression**. Le menu de pause exporte séparément la progression complète. Un point de contrôle ne contient que les découvertes réalisées avant son enregistrement.

## Sources et construction

Node 20+ pour les tests du modèle et l’installateur ; Python pour la reconstruction du HTML. Le module n’a pas de dépendances npm à installer.

```sh
npm run build
npm run check
npm run qa:browser
npm run docs
npm run package
```

Les tests navigateur utilisent Playwright pour Python et Chromium (`/usr/bin/chromium` dans cet environnement). Les docs utilisent Pillow et mistune. `npm run qa:browser` reproduit la recette par `set_content` sur origine opaque ; elle ne qualifie pas la persistance native localStorage. Le chemin Chromium peut être adapté à l’installation locale sans modifier les règles de sécurité du navigateur.

710 tests précédents + 113 d’équipage ; 20 campagnes précédentes + 4 avec les neuf personnages et les 27 réponses ; 270 contrôles navigateur précédents + 60 V8 ; 11 contrôles d’installateur. Les chiffres finaux et les hashes se trouvent dans le rapport et le manifeste. Les campagnes du modèle emploient des entrées simulées ; elles ne sont pas des parties humaines intégralement jouées au clavier. Les nouveaux tests navigateur parcourent le réveil jusqu’à David au clavier, puis utilisent des scènes issues des campagnes.

## Raccordement facultatif à une copie du Tantalus

```sh
node scripts/install.mjs --root="CHEMIN_DU_JEU" --dry-run
node scripts/install.mjs --root="CHEMIN_DU_JEU"
node scripts/install.mjs --root="CHEMIN_DU_JEU" --revert
```

L’installateur copie 26 fichiers et ajoute un lien dans Opérations. Il refuse tout module Prometheus déjà présent ou source modifiée ; le retour arrière protège les modifications ultérieures. Pour remplacer une installation V7, revenir en arrière **avec l’installateur et le journal V7** sur une copie du jeu, puis installer V8. Conserver un export JSON avant l’opération. L’ouverture directe du HTML V8 n’exige aucune désinstallation.

Ce raccordement n’est pas une fusion avec `GameEngine`, `SaveSystem`, MIRE, l’inventaire ou les récompenses du jeu principal. Le test utilise une structure de contrôle, pas le dépôt Tantalus complet. Aucun push GitHub ni déploiement Vercel.

## Livraison et provenance

Archive V7 utilisée : `ALIENS_TANTALUS_DLC_PROMETHEUS_V7.zip`, SHA-256 `50b19491a08cdbb37cba75d9af45143e42ac5ce23753f52ee1feda8e6817b3c7`.

Les sources V7 ont été extraites puis modifiées. Les anciennes sauvegardes de test restent dans `history/` pour éprouver les migrations ; leurs données ne sont pas ajoutées à une nouvelle partie. Les anciens noms V4/V5/V6/V7 des recettes désignent leur système d’origine ; chaque rapport navigateur contient le hash du HTML V8 effectivement exécuté.

Les sources actuelles, le codex de 224 règles/38 lieux, les dialogues, neuf SVG, les résultats et les 95 captures constituent ce pack. Ni les anciens ZIP complets ni les anciens rapports HTML redondants ne sont inclus. Les scripts vérifient l’archive extraite, reconstruisent le HTML et relancent les tests avant de produire le fichier de vérification externe.
