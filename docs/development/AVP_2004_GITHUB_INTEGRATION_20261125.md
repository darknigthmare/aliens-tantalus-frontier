# AVP (2004) — intégration GitHub du 25 novembre 2026

## Ce qui est raccordé

Le menu titre du Tantalus propose **Extensions**, accessible au clavier, à la manette et au toucher. La galerie contient l'expédition installée **AVP · Sous la glace v0.11.0**. Elle ouvre `/src/dlc/avp-2004/index.html`, après arrêt des moteurs et de l'audio de l'hôte. L'expédition propose ses trois carnets, l'export/import et un retour au Tantalus dans le titre et la pause.

Le départ vers AVP n'effectue pas d'autosauvegarde supplémentaire du profil natif. Le retour depuis AVP enregistre son carnet ; un échec de stockage ou un conflit entre fenêtres laisse le choix d'exporter, de rester ou de quitter sans enregistrer. Le code de retour reconnaît uniquement les chemins d'installation exacts et l'ancien paramètre explicite `host=tantalus`.

Ce raccord utilise le moteur de campagne AVP autonome. Les missions, objets et récompenses ne sont pas convertis en données du GameEngine natif. Le schéma Tantalus 52 et les profils `atf-v47-profile-*` restent distincts du schéma AVP 10 et du namespace `atf.dlc.avp2004.v1`.

## Sources et reconstruction

Le HTML livré en v0.11 a été récupéré avant l'interruption de l'environnement. Son SHA-256 est :

`587fc2639b4d015fb9162e513702f25ca016ef5259bd27facef7249ef3141bfe`

L'extraction des 30 scripts et du style puis leur réassemblage ont reproduit ces octets à l'identique. Les 145 SVG sont également présents comme fichiers éditables ; ils correspondent au dictionnaire embarqué. Les règles de simulation, lieux, géométrie, armes, personnages et registre de fidélité restent ceux de cette version. Seul le raccord de sortie hôte est ajouté à l'application AVP.

| Élément | Chemin |
| --- | --- |
| Jeu livré à l'hôte | `src/dlc/avp-2004/index.html` |
| Sources et images éditables | `scripts/dlc/avp-2004/web/` |
| Ordre des modules | `scripts/dlc/avp-2004/MODULES.json` |
| Gabarit de reconstruction | `scripts/dlc/avp-2004/template.html` |
| Empreintes revues | `scripts/dlc/avp-2004/MANIFEST.json` |
| Reconstructeur et comparaison | `scripts/build-dlc-avp-2004.mjs` |
| Admission exacte source/public | `scripts/dlc-admission-avp-2004.mjs` |
| HTML historique intact | `archives/local-recovery-20261125/avp-2004/original-standalone-v0.11.0.html` |

Le bundle intégré mesure **1 115 546 octets** et porte le SHA-256 :

`d8cd3141fb8e1468d5b108f20975ec359b74bec9f860c48359af7c559d3a455c`

Le build vérifie la reproduction du bundle avant de copier `src/`. Les sources de fabrication et les archives ne sont jamais admises dans la distribution. Les chemins et empreintes sont explicites ; une modification volontaire des sources exige de reconstruire le bundle, de réviser le manifeste et d'actualiser son empreinte revue dans l'admission.

Le raccord conserve les reçus historiques de l'audit du Tantalus. Un successeur explicite dans `scripts/audit-dlc-avp-2004-20261125.mjs` relie uniquement les empreintes antérieures connues aux fichiers modifiés pour AVP. Les contrôles rejettent toujours un prédécesseur inconnu ou des octets différents ; aucune preuve de validation ancienne n'est attribuée au nouveau raccord.

Le module de menu est ajouté au cache statique de l'hôte. Le premier chargement de l'expédition hébergée utilise le réseau ; le fichier HTML autonome reste utilisable localement. Le contrôle strict du service worker sur les requêtes privées et les paramètres d'URL n'est pas élargi.

## Contenu conservé

- 43 salles navigables et un lieu d'épilogue ;
- 104 faces de passage réciproques ;
- 19 chapitres, 17 opérations et 188 notices ;
- 145 SVG et 250 références dans l'audit de fidélité ;
- trois carnets avec sauvegardes de secours.

Ces nombres décrivent la v0.11 récupérée. Ils ne certifient pas une reproduction du film à l'échelle 1:1. Les statuts du registre distinguent contenu actif, éléments scéniques, documents, références absentes ou à vérifier. La v0.12 évoquée précédemment n'a pas été retrouvée en fichiers.

## Vérifications

Avant l'indisponibilité de l'environnement local :

| Vérification réellement exécutée | Résultat |
| --- | --- |
| Empreintes de l'archive v0.11 | 619 / 619 |
| Simulation AVP | 770 contrôles réussis |
| Installation et mise à niveau | 23 contrôles réussis |
| Parcours déterministes complets | 12 / 12 |

Les parcours utilisent le bot existant et sa connaissance des objectifs, sans invincibilité ni téléportation de progression. Ils ne sont pas des parcours humains. Ces preuves concernent la base récupérée ; les suites d'intégration ci-dessous assurent une validation distincte du raccord.

```sh
npm run test:dlc
npm run check:dlc:avp
npm run check
npm run build
npm run check:built
npm run qa:dlc:avp
```

La CI **AVP DLC integration** exécute les contrôles du menu et du bundle, l'admission, le build réel puis Chromium sur origine HTTP. Le parcours navigateur teste le bureau et le téléphone, le lancement, le déplacement réel au clavier, la pause, l'export/import, la reprise et l'isolation des profils. Chaque contexte vierge reçoit un profil créé et validé par l'API réelle SaveSystem, puis charge normalement l'hôte avant les comparaisons octet par octet. Aucun avancement de campagne n'est injecté. Un contexte séparé refuse les seules écritures AVP pour exercer le secours par export. Les doublures des tests Node, la création du profil et cette injection de quota sont déclarées dans les rapports. Le workflow conserve le rapport et les captures navigateur pendant sept jours.

Les 19 contrôles du bundle, les 11 contrôles du menu, la reproduction du bundle et les contrôles source/build ont réussi en CI. Le parcours Chromium est vérifié séparément sur le commit final de la PR. Son attente de démarrage comprend la disparition réelle de l'introduction : le titre est préparé sous son fondu tandis qu'elle possède encore les touches. La création d'une suite n'atteste pas son succès ; consulter le rapport du commit concerné.

## Archives complètes préservées sur GitHub

Les **16 ZIP, 7 modules, 1 189 845 299 octets** sont maintenant enregistrés dans la branche dédiée [archive/local-recovery-20261125](https://github.com/darknigthmare/aliens-tantalus-frontier/tree/archive/local-recovery-20261125).

Le commit vérifié est [6ed9b9210a09](https://github.com/darknigthmare/aliens-tantalus-frontier/commit/6ed9b9210a097bbdf90ec3a22043a3fe5845e541), arbre `ac4bff25eae9fc9c39eeec0a7a8243221efde3f8`. Ses **121 fragments** correspondent tous aux identifiants Git et aux tailles du plan local. Le manifeste donne aussi leurs SHA-256 et l'empreinte de chaque archive complète.

Sont préservés : AVP 2004 v0.11, Alien Earth V11, Covenant v0.10, Mer des Chagrins v0.1 à v0.10, Résurrection V125, Hors des Ombres v0.10 et MIRE/Nostromo V119. Leurs sources, images, rapports et fichiers annexes sont conservés dans les ZIP d'origine.

Les fragments mesurent au maximum 10 Mio, le premier AVP 6 Mio. Le script Python `reconstruct.py` vérifie leurs empreintes, reconstitue les ZIP dans un dossier extérieur au dépôt et refuse l'écrasement d'un fichier existant. Les instructions figurent dans le README de cette branche. La préservation n'atteste pas l'intégration jouable des six autres modules.

Le fichier historique `archives/local-recovery-20261125/PENDING_TRANSFER.json` garde son nom pour conserver sa référence mais porte désormais le statut **preserved_on_github**, avec le commit d'archive. Aucun transfert de cet inventaire ne reste en attente.

L'environnement local était devenu indisponible après saturation, puis a répondu de nouveau. La reprise a lu les sources par plages et transféré les fragments sans recopier les 1,19 Go sur le disque partagé. La branche d'archives contient seulement la sauvegarde et son outil ; les gros ZIP ne sont pas ajoutés au build du jeu.

## Base d'intégration

Base examinée : `001a20bdc0f9f1a3c835e84d8f3c9434bc159330`, branche cumulative `claude/nifty-shannon-qpy1hl`. Les anciens travaux de la PR49 ont déjà été fusionnés dans cette branche. Cette PR n'effectue pas de fusion globale de la cumulative vers `main` et ne déclare pas la production Vercel mise à jour.
