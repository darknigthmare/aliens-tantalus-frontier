# V87 — Animaux Lot A : fondations, art et accueil physique

Date : 2026-09-19. Statut : PARTIEL, pas un lot compagnon jouable complet.

## Source récupérée

Le paquet privé ATF_Animaux_USS_PACK_CODEX_v1.zip a été récupéré et vérifié :
SHA256 84014cc335af5dee1ff7632aa6233c633a53e009bce604bec80aba37b7bc196e.
Il contient des propositions de conception, pas des sprites livrés ni un système déjà implémenté.
Moka et Brume sont deux individus originaux Tantalus ; ni Jones, ni un animal du refuge hommage personnel.

Actualisation ChatGPT : les trois conversations accessibles dans la liste récente ont été relues,
sans nouveaux messages par rapport aux archives. Ce contrôle ne constitue pas une extraction exhaustive
du projet : liste limitée, textes tronqués et pièces jointes non exposées. Les autres ZIP/documents
d’animations V87, de campagne PALISADE et les images du refuge ne sont pas déclarés récupérés.

## Art réellement produit

Génération par outil ImageGen intégré uniquement ; aucune API payante ou clé utilisée.

- moka-atlas.png : 1536×1024, 32 poses dessinées / 32 recadrages utilisables.
- brume-atlas.png : 1536×1024, 32 poses dessinées / 30 utilisables.
  Les poses 10/11 du repos sont exclues : anticrénelages voisins dans une même colonne.
  Repos Brume : 2 poses sûres à 2 fps, pas une fausse animation de 4 frames.
- habitat-wall.png : mur arrière orthographique, répété en modules sans étirement.
- habitat-props.png : 10 objets indépendants ; 11 placements car les gamelles sont réutilisées.
  Caisse de transport produite, pas encore utilisée dans une livraison.

Alpha PNG original conservé ; aucune retouche Python ni recoloration.
Un essai de détourage a échoué sur l’ACL Windows ; il s’est révélé inutile après lecture des alpha :
le fond coloré visible dans l’aperçu était masqué par une vraie transparence.
Prompts complets privés : references/v87-animal-generation-prompts.json.
Les sprites sont contrôlés en pixels et sur un banc animé QA, pas encore acteurs acquis du hub.
La fluidité n’est PAS certifiée. Les cycles ne couvrent pas toutes les animations du paquet.

## Intégration effective

- Registre courant de 27 salles : 16 pièces principales + 10 annexes historiques + accueil animalier.
  Les preuves historiques V71 restent à 10 ; elles ne sont pas réécrites comme une onzième promesse.
- Porte physique des quartiers : x645..763, bas y624. Aucun accès par plateforme ou échelle humaine.
- Annexe 1920×720, sortie centre144, sol624, chemin entièrement praticable jusqu’au comptoir.
- Installation par E à pied aux deux emplacements. Équipement initial absent, zéro compagnon possédé.
- Le montage utilise les équipements embarqués, sans inventer de tarif d’adoption ni débiter des crédits.
- Enregistrement atomique de l’installation et de la pose ; échec stockage conserve état/argent/octets.
- Mobilier corrigé après capture : lits55/88px, gamelles16/22px, comptoir94×70,986px,
  comparés au Marine92px, Moka33,2px et Brume49,2px.
- Sol réel par crops métalliques, station UI affiche logements équipés plutôt que calibration fictive.
- Sauvegarde root shipAnimalsV1 : migration, reçus, stock, crédits, capacité et profils séparés.
- Acquisition pure 220/300 crédits et étapes transit/contrôle/acclimatation testées,
  mais aucun bouton ne prétend rendre la boutique disponible.
- Navigation animale pure : gabarits, portes et obstacles réels, transitions chronométrées,
  refus des laboratoires/airlocks/quarantaines, aucune téléportation. Pas encore branchée à des résidents.

## Vérifications

- Parcours navigateur local à 1280×720 : porte E, marche normale, montage des deux logements,
  panne quota, rechargement réel, comptoir, retour aux quartiers. Zéro erreur console/réseau.
- 9 captures privées, dont 2 previews explicitement marquées comme banc QA sans animaux acquis.
- Images alpha/crops/échelles testées sur les vrais PNG ; empreintes non modifiées.
- PWA locale : cache public shell-5, 184 chemins, cinq nouveaux modules et quatre PNG accessibles hors ligne.
- Quatre URL documentaires interdites restent 404 en ligne/hors ligne.
- Tests dédiés : état37, sauvegarde13, navigation26, art12, registre15, habitat18.
- Suite complète : 2 380 tests, 2 379 réussis, zéro échec, un ignoré (15 813 ms).
- Lint : 452 modules vérifiés ; régression structurelle des missions et échelles passée.
- Parcours navigateur rejoué en production : onze contrôles, zéro erreur collectée.
  Porte physique, marche, installation des deux logements, échec quota atomique,
  rechargement réel et sortie vers les quartiers vérifiés avec les événements clavier normaux.
  Les aperçus animaux restent un banc QA explicite, pas des résidents acquis dans la partie.
- PWA de production : shell-5, 184 chemins ; cinq modules animaux et quatre PNG hors ligne,
  quatre chemins privés restent 404. Ne certifie pas toutes les missions hors ligne.
- HTTP de production : 73 fichiers critiques/assainis conformes au commit publié,
  16 ressources héritées et quatre PNG animaux conformes ; 219 chemins privés retournent 404.

## Reste à faire

Le Lot A n’est pas complet : comptoir portuaire physique, amarrage autorisé et réel, vendeur,
rencontre et dossier, achat dans le jeu, livraison/réception, routines manger/dormir,
interaction caresse et raccordement des acteurs au graphe restent à implémenter.
WORLDS ne possède pas de catalogue fiable de ports ; worldId est une ancienne destination de mission,
pas une preuve d’amarrage. Ne pas détourner les heures/coûts de déploiement combat pour facturer une escale.
Le refuge hommage reste séparé, sans animal personnel inventé.
Ce lot ne modifie pas le compteur ennemi (dernier état vérifié : 14/571 profils intégrés).

## Stockage et confidentialité

Six anciens builds inactifs, 3 558 391 333 octets, déplacés sur
I:\CodexArchives\AliensTantalus\2026-09-19-builds après comparaison SHA256 de chaque fichier.
Sources C retirées seulement après vérification ; copies intégrales récupérables sur I.
Dépôt actif, sauvegardes et build public courant non déplacés.
Publication effectuée via la copie publique assainie, sans nouvel historique privé, prompts, sources ChatGPT,
captures, tests ou ce rapport. Les commits privés ne sont jamais poussés vers GitHub public.

## Publication vérifiée le 19 septembre 2026

Commit public : 1b1a8122b985b655834a00671ac5228d376dfe76 (13 fichiers).
Poussé atomiquement vers main et codex/v86-public-release ; copie publique propre.
Contrôle indépendant : zéro chemin documentaire privé dans le commit et son arbre.
Arbre public : 895 fichiers, dont 728 ressources ; aucune purge rétroactive de l'ancien historique prétendue.
Vercel : dpl_8CurCRgtL8LrWDGTrspKbUD6YRhP, READY, alias production attribué sans erreur.
Construction : 92,671 secondes (buildingAt 1789839907977, ready 1789840000648).
URL : https://aliens-tantalus-frontier.vercel.app
Les tests HTTP, navigateur et PWA ci-dessus ont été exécutés contre cet alias après READY.
Preuves locales privées : privateoutput/v87/animals-http-production.json,
animals-production/report.json, animals-pwa-production.json et animals-full-tests-final.log
dans l'espace de travail C. Journaux serveur Vercel non inspectés.
