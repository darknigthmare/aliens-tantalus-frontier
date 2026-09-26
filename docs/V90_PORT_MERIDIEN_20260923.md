# V90 — Le quai des vivants

## Sources et limite de la tranche

Source privée exacte relue : `privateoutput/v87/campaign-source-visible.md`, lignes 344–404, dans le workspace de récupération C:.
Le récit PALISADE demande une première arrivée à Port-Méridien encore habitée, des civils avec leurs blessés au hangar, un choix de fret médical/énergie et le sous-chapitre « Le quai des vivants ».
Le statut automatique normal contredit l’appel de la colonie. La ville ne devient le grand hub au sol qu’après les événements ultérieurs du chapitre 4.

Cette tranche est une adaptation jouable du **quai d’arrivée seulement** : elle ne prétend pas livrer les marchés, appartements, blanchisserie, rencontre xénomorphe, Lina Kade, évacuation APC, ville persistante ou campagne complète. Les lignes de dialogue V84 ne sont pas modifiées. Les nouvelles consignes courtes sont écrites pour le projet et ne sont pas présentées comme une transcription canonique.

## Parcours livré

Après le manifeste V88, E au poste réel de briefing embarque vers une géométrie de quai indépendante (2560 × 720), sans créer de mission générique ni facturer une opération inexistante.

1. Prendre le lot à la rampe ; le colis devient visible avec l’acteur.
2. Franchir une vraie caisse avec les contrôles de marche/saut existants, puis déposer le lot au triage.
3. Assister le blessé en restant immobile. Bouger annule, la pause gèle, une reprise ne crédite pas le travail partiel.
4. Grimper l’échelle et atteindre le pupitre de la passerelle. Réalimenter le sas ouvre réellement sa collision.
5. Revenir chercher les trois civils puis les guider à pied. Ils avancent à leur vitesse, s’arrêtent si le joueur les distance ou n’est pas au sol, et ne sont jamais téléportés à l’arrivée.
6. Au terminal final, transmettre le constat contradictoire et recevoir un marqueur unique. Les opérations existantes sont alors accessibles ; leur carte n’est pas présentée comme la suite PALISADE déjà livrée.

Le lot médical réduit le travail de triage de 5 à 2 secondes ; le lot énergétique réduit la remise en tension de 5 à 2 secondes. Le texte distingue clairement bandages et batterie. Le soutien opérationnel V88 reste alloué une seule fois par son contrat existant ; le quai n’accorde aucune monnaie ni ressource répétable.

## Intégration et garanties

- `port-meridien-v90.js` : séquence pure, preuves physiques, révision anti-événement périmé, durée de travail, normalisation et reçu `port-meridien:quai-des-vivants:v90`.
- `hub-port-meridien-v90.js` : lieu au sol dédié ; locomotion/collisions V71 et rendu joueur V81 réutilisés sans cloner le moteur ; aucune IA alien ni mission générée.
- `app.js` : embarquement physique ; propriétaire profil/époque/timeline ; commit atomique avant changement de phase ; navigation vers opérations bloquée avant reçu.
- Le départ conserve les blocages V87 : relais civil encore amarré, manifeste animalier à revoir ou transfert inachevé.
- `save.js` : `portMeridienV90` distinct de `hub`. Les poses du quai ne remplacent jamais le retour dans le Tantalus. Reprise de la progression du groupe et du lot porté. Un quota bloque la marche après refus du checkpoint, puis E réessaie.
- Nouvelles timelines activées ; anciennes V88/V89 sans champ et non encore déployées admises. Les timelines sans ouverture, les opérations en cours et les ouvertures achevées ne sont pas renvoyées au début. Un ancien champ explicitement nul reste nul.
- Quitter vers le tableau de bord ou le menu suspend ; ce n’est pas un abandon destructif. Un reçu terminé n’est pas répété à la reprise ni après la retraite de la première opération.
- Le composite `hub-opening-v88.js` garde les classes V84 et V81 comme ancêtres réels.

## Art et provenance

Aucun bitmap nouveau ou modifié. `PORT_ASSETS_V90` énumère les dix chemins réutilisés : couches de colonie, modules de sol/passerelle/échelle/caisse, lit médical, consoles, porte et planche de survivants V67.
La planche V67 a été inspectée ; ses trois silhouettes civiles sont réutilisées comme **habitants anonymes**, sans transférer les noms ou biographies Shaw/Ruiz/Kessler dans PALISADE. L’échelle reprend les régions métalliques validées V82 ; le sol exclut les fragments détachés de sa planche. La porte ouverte conserve ses montants, pas une porte flottante.

## Vérifications

Harnais natif `tests/browser-port-meridien-v90.mjs`, contexte CDP isolé : une fixture initiale au briefing, aucun changement d’état du jeu après cette fixture. Clavier et clics réels ensuite.
`run-02/port-meridien-v90-browser.json` : variante médicale PASS, cinq rechargements, fret porté, travail interrompu, passerelle, progression réelle des civils, reçu unique et déblocage des opérations ; zéro erreur réseau/runtime. Captures 02/04/06 inspectées. Ce passage ne refait pas le créateur, le réveil V84 et l’exercice V89 déjà contrôlés séparément.
Tests de ce lot : normalisation/migration, garde première opération, séquence physique, deux effets de fret, quotas, tâches annulables et pause, sauvegarde d’escorte, passage réel à la première opération et retraite. Voir le rapport final pour le compte effectivement exécuté et la variante énergie.
`energy-final-04/port-meridien-v90-browser.json` : variante énergétique complète PASS, cinq rechargements, zéro erreur. Dernier ciblé ouverture et contrat du menu : 66/66 PASS ; les neuf tests spécifiques V90 utilisent aussi le vrai handler d’application et le vrai SaveSystem. `run-01` (inertie avant tâche) et `energy-final-03` (touche S relâchée avant le bas exact de l’échelle) restent conservés comme diagnostics du harnais, sans étiquetage PASS.
`medical-final-05` : variante médicale de la source finale PASS, cinq reloads en 1,57–1,67 s. `first-sortie-final-06` : quai complet puis vraie première opération/insertion, reprise native (`applied: true`) et retraite au Tantalus PASS ; six reloads en 1,61–1,83 s, huit captures, zéro erreur. Inventaire médical réel 10, checkpoint 10, reprise 10 : aucune seconde allocation. Le reçu du quai reste à sa révision 8 après retour. Captures du quai, de la porte ouverte et du retour Tantalus inspectées.
Revue indépendante read-only : les neuf tests du lot et deux contrôles additionnels en mémoire ont passé (propriétaires profil/epoch/timeline réellement périmés ; quota pendant escorte puis E retry/reload). Aucun P1/P2 constaté par cette revue.

La CLI agent-browser est indisponible dans l’environnement : le harnais CDP existant a été réutilisé, sans prétendre avoir utilisé la CLI. Les preuves sont privées sous `E:/CodexQA/AliensTantalus/v90-opening-20260923` et ne doivent pas être embarquées dans le build public.

## Vérification du paquet final

Paquet `E:/CodexQA/AliensTantalus/v90-final-20260923/dist`, servi sur `http://127.0.0.1:4198/`. Les cinq fichiers app/save/port-meridien/hub-port-meridien/hub-opening servis ont été comparés par SHA-256 au dist : tous identiques.

Le premier passage `opening-browser` passait les assertions de sauvegarde mais sa capture 07 montrait encore le chargement des sprites. Ce passage ne suffisait donc pas à prouver la simulation active. Une seconde exécution diagnostique en mémoire a démontré un chargement transitoire, sans sprite manquant ni défaut runtime reproduit. Le harnais est désormais renforcé : il attend la levée des deux verrous d’images, une mission active et un chrono non nul, puis exige un déplacement réel par la touche D et la progression du chrono avant **et** après rechargement.

Invocation reproductible (PowerShell, depuis la racine du dépôt) :

```powershell
$env:APP_URL = 'http://127.0.0.1:4198/'
$env:CDP_ENDPOINT = 'http://127.0.0.1:9237'
$env:QA_OUTPUT = 'E:\CodexQA\AliensTantalus\v90-final-20260923\opening-browser-verified'
$env:QA_FREIGHT = 'medical'
$env:QA_FIRST_SORTIE = '1'
node tests/browser-port-meridien-v90.mjs
```

Résultat : `ok: true`, aucune erreur réseau/runtime, huit captures. Six reloads : 1387/1404/1345/1401/1421/1730 ms. Premier input de mission : x159→270,99 et chrono0,1587→0,7606 ; après reprise : x271,68→380,77 et chrono0,9201→1,5278. Les deux verrous de chargement sont false. Inventaire/checkpoint/reprise médicale : 10/10/10, reprise native `applied: true`, reçu unique révision8, retraite vers le vrai Tantalus. Captures07 et08 relues visuellement : aucun overlay de suspension, mission active puis salle de briefing réelle.

Ces preuves valident le quai et la transition opération/reprise/retour à partir d’une fixture de briefing prête. Elles ne rejouent pas la création du personnage, V84/V89 ni la variante énergie sur ce dernier paquet ; la variante énergie a été contrôlée sur la source finale ci-dessus. Aucun changement du runtime ou du paquet final n’a été nécessaire ; seuls le harnais QA et ce compte rendu ont été renforcés.
