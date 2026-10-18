# Continuation V157 — récits, playtests et vie du Tantalus

Ce suivi est **prépublication**. Il décrit le périmètre du code et les contrôles
à exécuter sur le commit exact ; il ne vaut ni résultat CI, ni annonce de fusion
ou de déploiement. Les résultats locaux, parcours navigateur, fixtures et essais
sur matériel humain doivent rester identifiés séparément.

## Objets de récit et temps actif Forge

Les choix des terminaux peuvent exiger ou remettre un objet de récit nommé,
consommer l’objet requis et attendre un seuil de temps de jeu actif. Ces objets
appartiennent au projet Forge : ils ne sont ni des armes ni un inventaire de
campagne. Le projet admet au plus 32 objets uniques, dont 16 déclarations par
terminal ; le seuil temporel est un entier entre 0 et 3 600 secondes.

Les limites historiques demeurent : 64 terminaux, huit pages, deux choix et
600 caractères par texte. Le graphe reste sans boucle, les références sont
contrôlées et les effets idempotents. Le temps avance avec la simulation admise,
pas pendant une pause ou la lecture d’un récit. L’inspecteur, les copies,
assemblages, versions et l’import/export conservent les nouveaux champs.

## Checkpoint local explicite des playtests

La progression de playtest dispose de commandes explicites pour enregistrer,
reprendre et effacer un checkpoint local. Le document et son empreinte sont
liés à la progression reprise afin de refuser un état incompatible. Les états
malformés et les erreurs de stockage sont refusés sans écraser la session
active. Les limites exactes et les champs conservés sont consignés dans
`progress-v157.json` et dans la table Forge du classeur.

Ce checkpoint ne constitue pas un service cloud Forge. Les sauvegardes de
campagne, récompenses et ressources extérieures au playtest restent distinctes.
Le scripting libre et les personnages parlants ne sont pas livrés par ces
contrats bornés.

## Accueil animalier et activité locale

L’accueil animalier dispose d’une zone de service supplémentaire reliée au sol
physique, sans supprimer les couchages ni les enclos existants. Noor peut y
assurer une visite de soins pendant son créneau de travail. Les 19 annexes
disposent ainsi d’une affectation conditionnelle ; cela ne signifie pas que
19 PNJ sont présents simultanément. Les missions, alertes, soins et repos
conservent leur priorité. Les identités de l’équipage existant sont réutilisées.

La visite de service reste une activité locale. Les passages continus d’un PNJ
entre les salles du vaisseau ne sont pas ajoutés par ce lot.

## Sorties spatiales Trials

Les quatre rigs admis disposent d’une sortie de présentation distincte des
40 séquences et 200 clés héritées. Le déplacement de rendu se déroule après
le verdict et son outro, vers un bord de l’arène, avec appuis alternés bornés.
La caméra reste fixe et le résultat du combat ne change pas.

Les 40 IDs de présentation, 28 IDs ART153 et 189 IDs du roster sont conservés.
Les quatre images sources ne changent pas. Toutes les présentations demeurent
artistiquement partielles : aucune clôture artistique ni certification 1:1.
Les 185 autres identités ne reçoivent pas ces rigs par simple héritage de table.

## Opérations : registre actif et reprise Broodstorm

Le suivi V156 citait le registre historique V67 : 19 opérations et six accès
jouables. L’application utilise déjà le registre V131, qui contient **21 accès
jouables : 19 routes de campagne et deux surfaces du hub**. Ce sont 20
adaptations partielles et une entrée effective ; zéro entrée a le statut
technique `missing`. L’ancien compte de « 13 opérations sans route » n’est donc
pas un manque courant démontré. L’historique V156 reste conservé tel quel.

Cette réconciliation ne crée pas 13 missions et ne transforme pas les accès
en campagnes complètes. Les mécaniques, campagnes étendues, dessins et corpus
dédiés encore absents figurent dans la feuille des 21 opérations.

La reprise Broodstorm conserve les explosifs déjà en vol, notamment le dernier
explosif dépensé avant un checkpoint. Le chargement valide les données avant
mutation ; les sauvegardes historiques sans ce champ restent compatibles.

## Succession documentaire et contrôles

Les onze classeurs V146–V156, ainsi que le JSON et les notes V156, gardent leurs
octets exacts. Le nouveau classeur contient 13 feuilles, 12 tables et 13 vraies
formules avec caches contrôlés. Les deux derniers indicateurs comptent les
21 accès d’opération actifs et les quatre sorties spatiales ; ils ne mesurent
pas un pourcentage de production achevée.

Le pont de succession ancre les trois documents V156 par SHA-256, conserve
leurs 18 empreintes historiques et décrit chaque module délibérément modifié
avec ses anciens et nouveaux SHA et ses vérificateurs comportementaux. Tous
les SHA actuels sont vérifiés. Une modification oubliée, une transition
manquante ou un fichier historique changé fait échouer le contrôle.
Les contrôles de cellules, IDs, formules et contrats V156 restent exécutés.
La vérification ne dépend pas de commits Git absents d’un clone CI superficiel.

```sh
node --test scripts/verify-audit-continuation-v156.mjs scripts/verify-audit-continuation-v157.mjs
python3 scripts/verify-audit-workbook-v157.py docs/forge/xeno-trials
```

Le générateur `scripts/generate-audit-continuation-v157.py` reproduit le XLSX
à partir du JSON revu. Il ne recalcule pas les empreintes runtime et ne modifie
aucun document historique. Les documents de suivi sont des sources de revue,
exclues du paquet du jeu distribué.

## Manques conservés

La mise au sol complète, les contacts entre deux corps, les mouvements et
dessins complets du roster, les atlas franchise manquants et les corpus
artistiques des opérations restent ouverts. Un kit modulaire existant et une
illustration fixe ne prouvent pas la livraison de toutes leurs animations.

L’encyclopédie Alien brute historique et les archives DLC Blackout/Earth ou
sprites V10 restent absentes. Les comptes d’un audit ou une mention dans une
conversation ne remplacent pas ces sources. Ce lot n’annonce ni leur examen
intégral ni la clôture des anciens chats.
