# QA navigateur du rechargement tactique V77

## Preuve finale locale

Le run complet `final-local/tactical-reload-browser-report.json` est vert (`ok: true`, `requestedScenarios: all`). Il a ete rejoue apres le gel du catalogue M41A, du HUD responsive, du traitement des conduits et du CSS tactile. Les huit JPEG de `final-local/` ont ete relus visuellement.

- Arme catalogue non surchargee : `weapon-001-m41a-pulse-rifle`, chargeur 99, cadence 7.7/s, rechargement 1.45 s.
- Quatre issues par vraies entrees clavier CDP et horloge de simulation : normal 1.45 s ; succes 1.189 s ; parfait 1.015 s ; echec 1.95 s. Un maintien repete de R ne soumet pas une seconde tentative.
- Transfert des munitions une seule fois, conservation chargeur + reserve, aucune recharge instantanee via la verification.
- Apres parfait : quatre tirs clavier F acceptes selon la cadence reelle, degats 23 / 23 / 23 / 20, multiplicateurs 1.15 / 1.15 / 1.15 / 1, exactement quatre cartouches consommees, bonus epuise.
- Coop : J1 parfait et J2 echec independants en 1280x720, 844x390 et 480x320. Sur les deux paysages, J1 utilise de vrais contacts tactiles CDP sur le bouton R ; J2 utilise T au clavier. `pointer: coarse` et cinq points de contact sont effectivement emules.
- HUD : titres 12 et aide 11 pixels CSS sur les trois formats. Verification des limites d'ecran, de cinq hit-tests par panneau et des intersections rectangulaires avec journal, boutons tactiles et bouton de retraite.
- A 844x390 : journal y218..246, HUD y252..308, commandes y328..380. A 480x320 : retraite y12..48.34375, HUD y52.34375..108.34375 puis 116.34375..172.34375, commandes y216..310 ; journal masque.
- Deux manettes standard **simulees** : maintien a la connexion ignore, affectation J1/J2 et absence de seconde tentative sur polling maintenu verifies.
- Conduits joueur et coop : entree proche validee dans `ship-interior-vertical`, portail `ship-service-wall-entrance` sur Katanga ; annulation `vent-transit`, refus de R/T et de reload pendant le transit, aucun transfert ni bonus, disparition du feedback apres expiration. L'horloge n'est pas falsifiee pour obtenir un parfait.
- Aucune exception JavaScript, erreur console/log navigateur ou reponse HTTP >=400 observee dans ce run.

## Reproduction

Depuis la racine du projet, utiliser un Chrome CDP deja ouvert et le serveur cible :

```powershell
$env:CDP_ENDPOINT = 'http://127.0.0.1:57239'
$env:APP_URL = 'http://127.0.0.1:4176/'
$env:QA_OUTPUT = 'docs/references/v77-browser-qa/final-local'
$env:QA_ONLY = 'all'
node tests/browser-tactical-reload-v77.mjs
```

`QA_ONLY` accepte `all`, `desktop`, `landscape`, `compact-landscape` ou `vent`. Un run cible n'est pas une validation complete. `QA_WEAPON_ID` permet de selectionner un autre vrai descripteur catalogue ; le test des quatre tirs exige une arme adaptee. Le script importe toujours les modules depuis l'origine de `APP_URL`, desactive cache/SW, attend le titre V77 et cree un contexte isole qu'il ferme en sortie. Il ne ferme pas le navigateur partage ni le serveur.

Les mesures DOM du bouton sont faites avant l'appui chronometre. Pour le contact tactile, la cible est le debut de la vraie fenetre parfaite afin de tenir compte du dispatch Chromium sur une frame d'entree ulterieure ; le resultat et le temps effectivement enregistres par le moteur restent verifies. Aucun descripteur d'arme, profil, resultat, horloge ou fenetre n'est modifie par le test.

## Defauts retrouves et preuves intermediaires

- Les fichiers directement dans ce dossier documentent la premiere passe, avant correction du M41A. Ils ne constituent pas la preuve finale.
- `mobile-initial/` : bouton R sous le journal, hit-test donnant `mission-log` malgre un bouton visible 52x52 ; defaut corrige dans le DOM/CSS par le parent.
- `desktop-catalogue-corrected/` : quatre issues, trois tirs bonus, coop desktop et manettes simulees apres correction du vrai catalogue.
- `landscape-responsive/` : essais tactiles et verification du nouveau HUD. Les anciens fichiers `failure` conservent les tentatives reellement arrivees trop tard (correctement classees succes), avant de retirer l'inspection DOM du chemin chronometre du test.
- `compact-landscape-responsive/` : les hit-tests internes seuls passaient, mais la relecture visuelle a revele une bordure masquee par le bouton retraite.
- `compact-toolbar-audit/` : intersection mesuree de 5.34375 px entre retraite et premier panneau, avant correction.
- `compact-toolbar-corrected/` : preuve ciblee apres adaptation a l'espace reel et deplacement de la retraite.
- `vent-regression/` : preuve ciblee du conduit, incluse a nouveau dans le run final.

## Limites explicites

Cette QA est une mission calme controlee : ennemis, dangers, projectiles hostiles et allies IA sont retires pour isoler le rechargement ; les inventaires de depart et positions sont prepares. L'entree conduit est precedee d'un placement controle pres d'un portail existant, puis emprunte la methode de production avec controle de proximite. Ce n'est pas une traversee complete de campagne.

La verification ne certifie ni appareil tactile physique, ni manette physique, ni latence audio materielle, ni partie reseau. Le co-op teste est le moteur local a deux acteurs. Aucun verdict global de qualite commerciale, de coherence artistique, de level design ou de completude de campagne ne decoule de ce test.

Les animations de branches restent partagees (`dedicatedBranchAnimations: false`). L'identite visuelle du joueur entre locomotion et combat, deja signalee incoherente, n'est pas validee par ce jalon. Cette QA n'a genere ni remplace aucun asset et n'a modifie aucune source runtime.
