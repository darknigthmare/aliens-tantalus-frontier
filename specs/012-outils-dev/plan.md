# Plan : outils de développement (spec 012)

## Exposition retenue

Décision du propriétaire du 2026-11-23 (elle remplace la valeur par défaut D-012-1, « serveur de développement seulement ») : la page de développement est **aussi livrée dans le build public, cachée**.

« Cachée » est une discrétion, pas une protection : il n'y a aucun contrôle d'accès. Ce qui est fait :

- aucun écran joueur, aucun fichier du jeu (`index.html`, `src/`, CSS, `sw.js`, manifeste) ne nomme ni ne relie les outils ;
- le dossier publié porte un nom choisi au build : `labo-tantalus-v188` par défaut, ou la valeur de `ATF_DEV_TOOLS_PATH` (un segment de 8 à 64 caractères `a-z`, `0-9`, `-`, noms réservés refusés). La valeur par défaut est publique (ce dépôt) ; une valeur posée dans les variables d'environnement de l'hébergeur n'est écrite dans aucun fichier publié hors du dossier lui-même : `build-info.json` empreinte les outils par nom de fichier seulement (`devTools.sha256`), sans le nom du dossier ;
- la page du lanceur porte `noindex,nofollow` et `no-referrer` ;
- les fichiers des outils ne sont ni dans la liste de précache du service worker ni admissibles à son cache (chemins hors coquille ; les URL à requête ne sont jamais mises en cache) : ils sont lus sur le réseau à la demande.

Ce qui n'est pas fait : authentification, limitation par compte, en-tête `X-Robots-Tag` par chemin (il faudrait écrire le chemin dans `vercel.json`). Toute personne qui connaît ou devine l'adresse ouvre le lanceur ; elle n'y obtient rien qu'un joueur ne puisse déjà faire avec la console de son navigateur (jeu sans serveur, sauvegarde locale).

## Isolation côté client

Sur un hébergement statique, plus aucun serveur ne peut injecter le stockage isolé. Le build (`scripts/build-dev-tools-v188.mjs`, appelé par `scripts/build-release-v143.mjs`) et le serveur de développement insèrent donc le même script en ligne, **premier script** de `index.html` (avant `intro-boot` et tout module) :

```
if (/[?&]atf-dev=v188(?:&|$)/.test(location.search)) { …contenu de devtools/dev-storage-v188.js… }
```

- Sans la requête exacte : un test d'expression régulière, rien d'autre (aucune requête réseau, aucun global, `localStorage` natif).
- Avec la requête : `localStorage` est remplacé par un stockage en mémoire alimenté par la session de l'onglet (`sessionStorage`), `indexedDB` (galerie de photos de terrain) est retiré, les événements `storage` des autres onglets sont arrêtés. Si le remplacement échoue, la page est arrêtée (`about:blank`) plutôt que de lancer le jeu sur le profil réel. Le compte en ligne n'est pas connecté dans une session (son jeton vit dans le `localStorage` réel).
- Le script est en ligne parce qu'il doit s'exécuter quel que soit le chemin qui sert `index.html` (repli de réécriture de l'hébergeur, coquille du service worker) et parce qu'il ne doit pas nommer le dossier caché. Le pont de session (`dev-session-v188.js`) est chargé après les scripts du jeu depuis le dossier du lanceur, dont le chemin est transmis par la session de l'onglet et validé (un seul segment de la même origine).
- Une adresse `/?atf-dev=v188` ouverte sans session : jeu vierge dans un stockage isolé et vide, une note, aucun panneau, adresse du lanceur non révélée.
- `sessionStorage` reste celui de l'onglet (marqueur « générique déjà vu », session de développement) : il n'appartient pas au profil.

| Élément | Chemin | Rôle |
| --- | --- | --- |
| Lanceur | `devtools/index.html`, `devtools/dev-launcher-v188.js` | Liste filtrable, options de session, construit la fixture et écrit la session dans `sessionStorage` (cet onglet) |
| Catalogue | `devtools/dev-catalog-v188.js` | Entrées générées depuis `CAMPAIGNS`, `HUB_DECKS`, `ASPHODELE_ROOMS_V188`, `CINEMATIC_IDS_V188`, phases des niveaux dédiés ; scène attendue par entrée |
| Fixtures | `devtools/dev-fixtures-v188.js` | Échelle de progression par les règles du jeu ; `migrateSave` ; `inspectSaveSlotV78` ; injections déclarées |
| Stockage isolé | `devtools/dev-storage-v188.js` | Source du script en ligne : `localStorage` → mémoire de l'onglet, `indexedDB` retiré, chargement du pont de session |
| Pont de session | `devtools/dev-session-v188.js` | Titre → Continuer, `showView`, `launchCampaign`, transition de phase des niveaux, lecteur de cinématiques ; options et surcouches ; panneau DEV |
| Stand de tir | `devtools/dev-range-v188.js`, `devtools/dev-range-metrics-v188.js` | Relance du niveau avec un autre chargement, cibles, mesures, réglages, export |
| Build | `scripts/build-dev-tools-v188.mjs`, `scripts/build-release-v143.mjs` | Chemin public (`ATF_DEV_TOOLS_PATH`), copie de `devtools/` sous ce chemin, réécriture des URL de la page du lanceur, script en ligne dans `index.html`, empreinte `devTools` de `build-info.json` |
| Serveur | `scripts/dev.mjs`, `scripts/dev-tools-server-v188.mjs` | `/dev` → `/devtools/` ; même script en ligne que le build dans chaque réponse `index.html` |
| Point d'accroche du jeu | `src/app.js` | Ajout d'un crochet QA `__ATF_STORY_V188__.playCinematic(id)` (rejoue sans marquer vu), à côté des crochets existants `__ATF_V51__`, `__ATF_XENO_TRIALS_V96__` |

`scripts/build.mjs` (copie du jeu) est inchangé ; `build-release-v143.mjs` ajoute ensuite les outils. `scripts/verify-public-release-v86.mjs` admet, dans un build, un seul niveau `<chemin>/<fichier>` pour les neuf fichiers de `devtools/` (liste exacte `DEV_TOOLS_FILES_V188`) et refuse le nom source `devtools/`, les scripts, les specs et les docs. `scripts/verify-release-artifact-v143.mjs` (`check:built`) exige un seul dossier caché, la liste exacte, l'empreinte, le script en ligne identique au fichier livré et premier script, l'absence du nom du dossier dans `index.html`, `sw.js`, `build-info.json`, le manifeste et les modules de `src/`, et l'absence des outils dans la coquille hors ligne. Aucun module de `src/` n'importe les outils (suite Node).

## Ouvrir

```
npm run dev                       # PORT=4711 npm run dev pour un autre port
# puis http://127.0.0.1:4173/devtools/  (ou /dev)

npm run build                     # ATF_DEV_TOOLS_PATH=<chemin> npm run build pour un autre nom
# build publié : https://<site>/labo-tantalus-v188/   (ou https://<site>/<chemin>/)
```

Choisir la langue, la difficulté et les options, puis une entrée. Le panneau DEV en haut reprend les options, la pause, l'image par image, « Relancer l'entrée » (fixture d'origine) et « Quitter vers le lanceur » (session supprimée). Le stand de tir ajoute son panneau en bas : Armes, Équipement, Escouade, Cibles, Mesures, Réglages, Journal. Les deux panneaux se replient en une barre (bouton à droite) ; sur un écran de téléphone ils démarrent repliés pour laisser la scène et les commandes tactiles du jeu accessibles, et un onglet du stand le déplie. API de console : `__ATF_DEV_V188__` (état, `range.measures()`, `range.setWeapon(id)`, `range.spawn({...})`, `range.squad(action, valeur)`, `range.exportDiff()`).

## Raccordement au jeu

- Mission : `__ATF_V51__.launchCampaign(campagne)` — mêmes verrous, insertion réelle (boutons du joueur), atterrissage réel.
- Checkpoint de phase : `advanceColonyPhaseV188()` / `advanceStationPhaseV188()` jusqu'à l'index, puis placement au checkpoint comme une reprise.
- Hub, vues : bouton Continuer du titre, puis `showView`.
- Cinématique : `playStoryCinematicV188(id, { once: false, record: false })` par le crochet QA.
- Stand : `engine.start(options capturées)` avec `weapon`, `equipment`, `experimentalPhysicalMagazinesV167`, sans atterrissage ; cibles `engine.createEnemy` ; mesures par enveloppes d'instance de `fire`, `applyEnemyDamage`, `reload`, `onEvent` et des méthodes du directeur audio.

## Vérification

- `node --test scripts/verify-dev-tools-v188.mjs` (dans `test:priorities:v188`) : toutes les entrées actives (≈650) → sauvegarde valide et scène attendue ; prologue, histoire, fins ; couverture ; ordre des prérequis ; admissions (livré caché, scripts et specs en source seulement) ; chemin configurable ; non relié (aucun fichier joueur ne nomme les outils) ; non précaché (service worker exécuté en vm) ; script en ligne (premier script, inerte sans la requête exacte) ; stockage isolé, session vide, chemin de session refusé, arrêt si l'isolation échoue (vm) ; étape de build sur un dossier temporaire ; mathématiques des mesures et du diff.
- `npm run build`, `npm run check:built` : liste, empreinte et discrétion des outils dans le build réel.
- `npm run qa:dev-tools:built:v188 -- <sortie>` (Chromium, build servi en statique sans injection ni réécriture, service worker actif) : jeu normal intact et sans requête vers les outils ; échantillon d'entrées et stand depuis le lanceur caché ; profil sentinelle (sauvegarde valide écrite dans le `localStorage` réel) identique octet pour octet, stockage réel jamais obtenu, lu ni écrit pendant les sessions (compteur d'observation déclaré) ; Cache Storage sans fichier des outils ; jeu normal qui retrouve ensuite le profil réel ; passe téléphone 390×844 tactile (lanceur, panneau DEV, chaque onglet du stand : cibles de 40 px au moins, pas de débordement horizontal) ; 0 erreur.
- `node scripts/qa-dev-tools-v188.mjs <sortie>` (Chromium, serveur de développement ; `DEV_TOOLS_URL_PATH=/<chemin>/` pour un build servi en statique) : un échantillon par catégorie, options du panneau, stand avec 3 armes, un équipement, deux ordres d'escouade, export ; profil réel inchangé ; 0 erreur de page.

## Limites connues

- Non vérifié sur l'hébergeur réel : `vercel.json` (`cleanUrls`, réécriture de repli vers `index.html`) n'a été lu que sur pièce ; les URL de la page du lanceur sont absolues et les modules se situent par `import.meta.url` pour ne pas dépendre de la barre oblique finale.
- Passe téléphone faite dans Chromium en émulation (390×844, tactile) ; aucun appareil réel ni Safari iOS.
- Le compteur d'accès du QA observe le getter natif et les méthodes de `Storage` ; un accès par propriété (`localStorage.cle`) ne serait pas compté, mais la page de session ne peut plus obtenir l'objet réel une fois `localStorage` remplacé.
