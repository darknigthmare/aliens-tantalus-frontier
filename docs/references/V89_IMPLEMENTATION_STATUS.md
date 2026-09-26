# V89 — ouverture jouable, attaques natives et menu

État vérifié le 23 septembre 2026. Tranche locale au-dessus du travail V88 existant ; aucun commit, push ou déploiement public. Le site publié n'est pas présenté comme contenant ce lot.

## Ce qui est réellement ajouté

### L'exercice interrompu

Le scénario repris des échanges contient un exercice interrompu. L'implémentation V89 suspend la qualification M41A au troisième impact réel, impose un déplacement jusqu'à la console, une réparation stationnaire annulable de trois secondes, puis le retour physique au pas de tir. Les seuils de trois impacts et trois secondes sont des choix de gameplay du projet, pas des répliques ni des valeurs canoniques.

Le chronomètre, les munitions, les cibles et le numéro de session sont conservés. La qualification ne tombe qu'après les neuf impacts et la recharge réellement accomplis. L'état survit au rechargement de page ; les refus de sauvegarde, changements de profil/timeline et abandons ne doivent ni avancer ni récompenser une ancienne session. Les parties V88 déjà en cours ne reçoivent pas rétroactivement cette interruption.

Modules : `src/opening-exercise-v89.js`, `src/hub-opening-exercise-v89.js`, intégration au hub V88, `app.js` et `save.js`. Le texte de l'accueil V84 est conservé. Détails : `docs/V89_OPENING_EXERCISE_20260923.md`.

### Trois attaques en mission, pas uniquement dans BIOFORGE

- Burster : explosion acide de proximité annoncée et unique.
- Blight : globule temporisé destructible en vol, puis flaque temporaire.
- Brute : frappe de zone au sol annoncée, évitable par la hauteur ou un obstacle.

Portes, couvertures et plateformes bloquent les attaques ; les interruptions, J1/J2/équipiers/véhicules et la sauvegarde des dangers en cours sont couverts par les tests. Les quotas de population et les seeds existants ne changent pas. Les 32 autres identités natives conservent leur comportement simplifié V88.

Ces comportements sont des adaptations 2D partielles fondées sur les [notes officielles Cold Iron](https://www.aliensfireteamelite.com/en/releasenotes/) et [Pathogen Deep Dive](https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/), pas une reproduction intégrale des IA d'origine. Détails : `docs/V89_NATIVE_CAMPAIGN_BEHAVIORS_20260923.md`.

### Encyclopédie

Les trois dossiers indiquent leur attaque, son adaptation et les liens sources. Les noms d'attaque sont recherchables ; les liens sont filtrés et ouverts sans accès à la fenêtre parente. Les statuts visibles sont traduits et distinguent explicitement pose fixe, animations manquantes et fidélité non certifiée. Lire une fiche ne débloque aucune découverte de mission.

### Menu

Le bouton de reprise et son objectif reflètent l'état réel : création, accueil, exercice interrompu, ouverture V88 ou opération. Un aller-retour par les options restaure le menu et son focus uniquement pour le même profil et la même timeline. Aucun marqueur de progression n'est écrit par cette présentation.

Les règles V88 restent en place : extérieur sans cadre intérieur ni débris arbitraires. Aucun champ de sauvegarde n'a été abusivement assimilé à une caméra de station ou un événement de débris. Le registre des nouveaux angles approuvés reste vide. Détails : `docs/references/v89-title-menu/IMPLEMENTATION.md`.

### Art et fidélité

Un candidat Facehugger 1979 isolé a été réellement généré avec le générateur intégré, à partir de photographies en ligne de l'accessoire de Roger Dicken publiées par Propstore. PNG RGBA 1536 × 1024, transparence vérifiée, une créature complète. La pose et certaines couleurs sont reconstruites ; il n'est pas certifié 1:1 ni approuvé pour le runtime. Il ne remplace pas le PNG fourni par l'utilisateur.

La tentative de retouche locale a rencontré le blocage Windows `apply deny-read ACLs`. Aucun recours à l'API/CLI d'image. Le candidat, ses prompts et les preuves privées sont exclus du build. Provenance : `docs/references/v89-art-candidates/REFERENCES.md`.

## Vérifications finales

- `npm test` : 3 216 tests, **3 215 réussis, un ignoré, zéro échec**. Log : `E:/CodexQA/AliensTantalus/v89-final-20260923/tests-final.log`.
- `npm run lint` : **551 modules** ; `git diff --check` : aucune erreur.
- `npm run build` : réussi, sortie privée `E:/CodexQA/AliensTantalus/v89-final-20260923/dist`, horodatage `2026-09-23T12:07:41.983Z`. La version technique du projet reste 86.0.0 ; V89 désigne ce lot de travail, pas une publication effectuée.
- Service worker : `atf-v86-physical-placeables-shell-11`, trois modules V89 présents dans le précache. Contrat hors-ligne vérifié statiquement ; cette tranche ne prétend pas constituer une nouvelle campagne complète en mode déconnecté.
- HTTP sur le build local : **74 contrôles réussis** ; 28 fichiers runtime et 35 PNG répondent 200 avec SHA-256 identique aux sources, 11 chemins privés répondent 404. Rapport : `E:/CodexQA/AliensTantalus/v89-final-20260923/http-build.json`.
- Ouverture sur ce build : neuf tirs/neuf impacts, une recharge, interruption et réparation physiques, quatre rechargements de page, reçu unique, santé 100, aucune erreur. Six captures, dont trois inspectées. Rapport : `E:/CodexQA/AliensTantalus/v89-final-20260923/browser-opening-final/opening-v89-browser.json`.
- Encyclopédie sur ce build : trois dossiers/sources, contrôle mobile 390 × 844 sans débordement, découverte inchangée, cinq contrôles, aucune erreur. Capture mobile finale inspectée. Rapport : `E:/CodexQA/AliensTantalus/v89-final-20260923/browser-catalog-final/report.json`.
- Comportements : 80 tests ciblés, dont 28 nouveaux. Chromium : trois comportements, neuf captures, aucune erreur ; quatre captures inspectées. Rapport privé : `E:/CodexQA/AliensTantalus/v89-campaign-20260923/browser-private/report.json`.
- Menu sur ce build : huit jalons réussis, zéro erreur, capture 320 × 568 inspectée et lisible ; retour Options/focus, invariance de sauvegarde, mouvement réduit et affichages mobiles vérifiés. Rapport : `E:/CodexQA/AliensTantalus/v89-final-20260923/browser-menu-final/headless-retry/report.json`. Le premier essai avec fenêtre masquée a échoué au clic initial sans erreur runtime ; la relance headless passe intégralement et les deux traces sont conservées. Les 82 tests ciblés et neuf jalons de non-régression V88 passent aussi.

### Limites des preuves navigateur

L'ouverture démarre d'une sauvegarde isolée à l'armurerie, puis suit les vrais déplacements et commandes : elle ne prouve pas un nouveau parcours depuis le créateur de personnage. Les attaques sont testées dans une fixture déterministe utilisant le moteur de production, la géométrie réelle et les PNG natifs, avec placement/pas de temps contrôlés : ce n'est pas un parcours joueur complet. Les états d'objectif du menu sont des fixtures d'affichage, pas des missions jouées. Le parcours encyclopédie initialise une sauvegarde isolée puis utilise de vrais clics et recherches.

## Reste explicitement ouvert

La carte complète de Port-Méridien, les civils blessés et le chapitre PALISADE intégral ne sont pas livrés par ce lot. Les nouvelles vues avant/arrière/profondeur des vaisseaux, les animations des 35 créatures natives et la couverture exhaustive des films, jeux et comics restent à produire et à valider. Aucun compteur du catalogue, candidat graphique ou test unitaire n'est présenté comme la preuve de cet achèvement.
