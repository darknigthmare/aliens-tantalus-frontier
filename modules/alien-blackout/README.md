# ALIEN: BLACKOUT — reprise du module v0.7.0

## État de cette branche

Ce commit conserve la version autonome jouable et les travaux préparés pour son
raccordement à Aliens: Tantalus Frontier. **Il ne termine pas l’intégration au menu
ni au build natif.** L’environnement de travail est devenu indisponible pendant
ces derniers contrôles le 25 novembre 2026. Les changements incomplets du moteur
hôte sont conservés en patches de reprise, sans les appliquer.

Le dernier paquet complet récupérable est la **v0.7.0**. Les références v0.8.0
de la reprise interrompue ne contiennent plus de fichier téléchargeable.
Aucune v0.8 terminée ou validée n’est revendiquée.

## Jouer et modifier

Télécharger [JOUER_ALIEN_BLACKOUT_v0.7.0.html](JOUER_ALIEN_BLACKOUT_v0.7.0.html)
puis l’ouvrir dans un navigateur. Le programme ne dépend d’aucun service distant.

Le dossier contient aussi les 26 modules JavaScript, le style, les 41 dessins SVG
et une entrée modulaire index.html. Ces fichiers ont été extraits du HTML
récupéré. Leur réassemblage a été comparé caractère par caractère au portable :
égalité exacte, 603 801 octets en UTF-8.

Le nouveau script de reconstruction peut être lancé depuis ce dossier :

```sh
python3 tools/build.py
```

Ce script est un outil de récupération écrit le 25 novembre. L’ancien script
de release, ses tests et ses ressources de compatibilité restent dans l’archive
complète ci-dessous. Le script Python nouveau n’a pas été exécuté après la
coupure ; l’équivalence d’assemblage a été vérifiée en JavaScript.

## Paquet historique complet

L’[archive originale v0.7.0 sur Google Drive](https://drive.google.com/file/d/1UfPC8srC0FOAfVy-g6yQ8-Y8Xy6GnC84/view?usp=drivesdk)
conserve les **400 fichiers** du paquet : programme, sources, codex, rapport
visuel, captures, anciennes versions et fixtures de compatibilité, tests,
installateur et documentation. Aucun droit de partage n’a été modifié.

- Nom : ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.7.0.zip
- Taille : 33 103 752 octets
- SHA-256 calculé sur les octets récupérés avant l’envoi :
  b02538fafdc1a73aa88d80efa82e51d5852a6bf4fdaee85f90972ab32f21e35c

Le nom, la taille et le dossier parent ont été relus après l’envoi Drive.
L’empreinte distante n’a pas été obtenue.

## Vérifications réellement exécutées

Avant la coupure, sur une copie indépendante du paquet original avec Node
24.22.3 :

| Contrôle | Réussites | Échecs |
| --- | ---: | ---: |
| Construction et géométrie | 3 289 | 0 |
| Traversées de portes et compatibilité v7 | 309 | 0 |
| Terrain et évacuation | 57 | 0 |
| Secours et sauvegardes | 67 | 0 |
| Régressions héritées | 82 | 0 |
| Installateur, mise à niveau et retour arrière | 27 | 0 |
| Total des contrôles structurels et fixtures | 3 831 | 0 |

Les traversées portent sur les 132 faces des 66 portes. Leurs acteurs sont
préparés et les menaces neutralisées pour isoler le franchissement physique.

La matrice distincte de 16 campagnes utilise l’IA active et les commandes
publiques du jeu : **9 victoires, 7 défaites**, toutes conservées, et
**406 restaurations réussies**. Un secours de terrain aboutit dans une campagne
Cauchemar gagnante, graine 0, avec trois survivants. Le pilote automatisé ne
représente pas un joueur découvrant le jeu.

Après la coupure, la récupération distante a permis de recompiler les
26 scripts et de rejouer les 3 289 invariants de géométrie sans échec. Le portable
enregistré sur GitHub a ensuite été relu et comparé exactement au texte récupéré.

Les fichiers détaillés de la nouvelle QA avaient été copiés localement avant la
coupure. Seul leur résumé factuel est conservé dans cette branche ; les résultats
historiques complets restent dans le ZIP original. Aucun test navigateur de
l’intégration ni build complet Tantalus n’est revendiqué.

## Périmètre et fidélité

Le jeu contient sept secteurs, 56 pièces, 66 portes, 21 conduits, 41 familles
d’objets et 703 placements. Les plans sont ceux de cette adaptation. Les
raccordements entre secteurs sont des transitions successives, pas une station
entièrement continue.

Le module garde ses propres sauvegardes Blackout, avec migrations héritées. Il
n’est pas converti au moteur natif GameEngine/MIRE/SaveSystem de Tantalus.
Les soins, le portage, les balises et certaines règles constituent des extensions
Tantalus. Les silhouettes restent provisoires ; les intérieurs manquants,
références visuelles et écarts vers une fidélité officielle 1:1 restent ouverts.

Le codex et l’atlas intégrés au portable conservent le registre des équipements,
les cinq identités, les sources et les limites. L’archive historique contient
également leurs documents séparés.

## Reprendre l’intégration

Voir [le dossier de reprise](../../docs/alien-blackout/recovery-20261125/README.md).
L’ordre prévu est : récupérer l’archive complète, reprendre les patches,
produire le manifeste exact des fichiers, préserver la succession des contrôles
d’admission existants, vérifier clavier/manette et sauvegarde au retour, puis
exécuter check, build et check:built avant fusion.
