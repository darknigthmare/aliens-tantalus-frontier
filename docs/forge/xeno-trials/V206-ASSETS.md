# Xeno Trials — poses de production V206

Lot du **20 novembre 2026**, construit sur le V205 publié,
commit `50a974f16a07bd54e2fcb5cd243be8a55abe32fb`.

## Résultat

**15 PNG sélectionnés et contrôlés**, tous réservés à la production.
Le lot complète les poses de Grid, Panther, Gorilla et Arachnoid et corrige
des écarts visibles de la première génération. Chaque fichier contient un
personnage entier, orienté vers la droite, sur fond transparent.

| Personnage | PNG V206 | Phases sélectionnées |
| --- | ---: | --- |
| Grid | 3 | Récupération lourde ; préparation et récupération du spécial caudal |
| Panther | 5 | Préparation et récupération légères ; préparation, phase active et récupération du spécial |
| Gorilla | 3 | Préparation lourde corrigée ; préparation et récupération du spécial |
| Arachnoid | 4 | Préparation, contact et récupération lourds ; phase active du spécial au sol |

Les [images V206](../../../assets/openai/xeno-trials-v206/characters) sont
accompagnées du [manifeste](ASSET_LOT_V206.json) : empreintes SHA-256, tailles,
dimensions natives, bornes alpha, prompts exacts, références de chaque appel,
historique des sorties et observations de contrôle. Les pixels des PNG retenus
n'ont pas été retouchés ni redimensionnés après leur dernier retour du générateur.

V205 et V206 totalisent **41 fichiers PNG ajoutés** : les **16 visuels
de présentation V205** et **25 fichiers de personnages pour la production**.
Ce dernier total conserve des versions historiques remplacées par de nouveaux
candidats ; il ne représente pas autant de phases d'animation distinctes.
L'ancien lot de 18 PNG non rapproché n'entre pas dans ce cumul.

## Corrections de référence

### Gorilla

La référence du projet montre **quatre grandes épines externes par avant-bras**.
Les premières consignes V206 reprenaient à tort les trois épines des candidats
lourds V205. La revue a identifié cet écart avant publication de V206.

Les éditions ont été contrôlées une à une. Les retours présentant cinq épines
sur un bras ont fait l'objet d'une suppression locale demandée au générateur,
puis d'un nouveau comptage. **Seules les poses à quatre épines sur chaque
avant-bras sont sélectionnées.** Le manifeste conserve les consignes initiales
erronées et les tentatives non retenues pour que la correction reste traçable.

La préparation lourde corrigée retenue porte le suffixe `four-spines`. Elle
remplace le candidat de production correspondant, sans modifier le fichier ni
les empreintes historiques V205. Les éditions finales du contact lourd et de
la préparation légère avaient encore trois épines sur un bras ; la récupération
lourde en avait cinq sur un bras et trois sur l'autre. Ces trois fichiers sont
écartés. Les corrections du spécial actif, du contact léger et de la récupération
légère ont été refusées par l'outil ; leurs anciens candidats incorrects restent
également hors de la sélection V206.

### Arachnoid

Le spécial natif `pounce` fait avancer le personnage horizontalement au sol,
sans lui ajouter d'impulsion verticale. Le candidat actif V205 évoquait un envol.
`arachnoid-special-active-grounded.png` le remplace comme candidat préféré,
avec une posture basse, une jambe arrière étendue et des appuis visibles.
Le fichier historique reste conservé.

### Panther et Grid

Panther suit la référence quadrupède rouge, or/orange et argent. La pointe de
queue dorée ornementale est présente dans la référence du projet et dans la
[photo officielle NECA](https://store.necaonline.com/cdn/shop/files/Panther2.jpg?v=1745615805&width=1500).
Elle est conservée. Le spécial actif reste bas et horizontal, avec des appuis.
Grid conserve le dôme allongé, les cicatrices quadrillées, le corps noir nervuré
et la queue complète. Les variantes « Altered » ne reçoivent pas ces poses.

## Ce qui est raccordé au jeu

Le lot V206 ajoute **zéro frame de personnage au runtime**. Il n'altère ni le
moteur, ni les atlas d'actions, ni le service worker. L'intégralité du dossier
V206 est exclue du build public. Les admissions de sources sont limitées aux
fichiers retenus et à leurs empreintes ; un fichier inconnu reste refusé.

Les **131 arènes sur 131** ont désormais un décor suivi dans le dépôt, après les
trois ajouts V205. Les 5 PNG de projectiles V205 couvrent quatre familles natives
(acide, impulsion, onde au sol, goutte acide), avec une variante pour la grappe
acide. Les 8 VFX V205 servent les effets et dangers déjà pris en charge. Les
avertissements, bordures de zones et dessins de secours restent natifs.

## Vérifications

La revue visuelle et les mesures alpha concernent les **15 fichiers retenus**.
La revue des Gorilla compte quatre épines sur les deux avant-bras. Les autres
contrôles portent sur les extrémités, la queue, le nombre de membres, la palette,
la lecture des phases et l'absence de fond opaque. Les observations par fichier
sont intégrées au manifeste.

Les contrôles suivants ont été exécutés après le gel des 15 PNG et du manifeste :

| Contrôle | Résultat observé |
| --- | --- |
| `npm run test:trials:production:v206` | **3 tests réussis, 0 échec** |
| `npm run test:trials:visuals:v205` | **16 tests réussis, 0 échec** |
| `node --test scripts/verify-xeno-priorities-audit-v204.mjs` | **3 tests réussis, 0 échec** |
| Syntaxe des JavaScript concernés | **22 fichiers valides**, avec Node v24.22.3 |
| `package.json` et `git diff --check` | JSON valide et aucun défaut de diff |
| Intégrité des images | **15 SHA-256 conformes**, 22 993 664 octets au total ; dimensions et alpha mesurés |
| Références d'identité | **4 copies identiques aux blobs Git** du commit de départ |
| Admissions V206 | **15 chemins source admis**, **12 chemins exclus refusés**, aucun PNG V206 admis dans le build |
| Garde de texte public | Manifeste et rapport acceptés sans assouplissement de la garde |
| Conservation V205 | Les **26 PNG et le manifeste** restent identiques ; les déclarations historiques du relais sont préservées |

Les **22 tests ciblés** vérifient les empreintes réelles, les transitions du
relais d'audit, le refus des données altérées, les admissions précises et le
filtre de copie réellement employé par le build. Les identifiants temporaires
du générateur ont été retirés de la provenance publique ; les chemins stables,
SHA-256 et **39 prompts exacts** sont conservés. Cette modification documentaire
n'a changé ni les images ni la garde existante.

Empreinte du manifeste gelé :
`68b86005b542f4467eff14974ae249fd1d25832095ba53db484dc225b1e7ee2e`.

## Sorties non obtenues

| Demande | Résultat |
| --- | --- |
| `grid-heavy-windup` | Sortie refusée par le générateur |
| `grid-light-windup` | Sortie refusée par le générateur |
| `grid-light-impact` | Sortie refusée par le générateur |
| `grid-light-recovery` | Sortie refusée par le générateur |
| `panther-light-impact` | Aucun retour réussi ; cause exacte indisponible |
| `grid-special-active` | Sortie refusée par le générateur |
| `gorilla-special-active` | Sortie refusée par le générateur |
| `gorilla-light-recovery` | Sortie refusée par le générateur |
| `gorilla-light-impact` | Sortie refusée par le générateur |

Les fichiers refusés par le générateur ne sont pas inspectés, récupérés depuis
une sortie intermédiaire ni admis dans le lot. Une sortie réussie écartée pour
un défaut visuel n'est pas comptée comme un fichier livré.

## Travail restant et fidélité

La cible demandée reste une fidélité **1:1**. Ce lot suit les références et corrige
des écarts observables, mais **ne certifie pas une identité pixel par pixel ou une
exactitude canonique complète**. Les vues de référence disponibles n'établissent
pas les mouvements image par image, les volumes sous tous les angles ou le
minutage original. Arachnoid suit l'identité arcade Capcom, sans substitution
par la variante NECA Movie Deco.

Les **189 combattants** ont une image statique. **37** disposent d'au moins un
geste dessiné intégré ; **152** n'en disposent toujours pas. Les nouvelles poses
de production ne diminuent pas ce dernier nombre. Les 148 autres combattants
de ce groupe ne sont pas traités par les deux lots. Le détail de leurs actions
reste dans l'[inventaire V205](ASSET_LOT_V205.json) et la réconciliation V206.

Pour les personnages ciblés, il reste notamment les trois phases légères de
Grid, sa préparation lourde et son actif caudal ; le contact léger et les trois
phases lourdes de Panther ; les trois phases légères, le contact et la
récupération lourds, ainsi que l'actif du spécial de Gorilla. Cela représente
**15 phases à produire ou corriger** dans le plan de trois poses par action pour
ces quatre identités. Ce nombre ne mesure pas toutes les images nécessaires à
des animations complètes. Les poses d'Arachnoid couvrent les trois phases prévues
pour léger, lourd et spécial,
mais ne constituent pas encore une animation intégrée.

Les états d'attente, marche, air, garde, réaction au coup, KO et présentations
ne sont pas produits par ces lots. Les appuis et cadrages diffèrent entre
les PNG : il faut mesurer les points anatomiques, l'échelle, les pivots des
pieds et des mains, puis raccorder les poses aux fenêtres natives et vérifier
les transitions en jeu. Normaliser chaque image par sa boîte englobante ferait
varier la taille du corps quand la queue ou les bras se déplacent.

Les vérifications décrites ne constituent pas un parcours complet en navigateur.
Le build global et `check:built` ne sont pas déclarés validés dans ce checkout
partiel. Les PNG et le manifeste V205 publiés restent inchangés ; les reçus
historiques sont conservés dans le relais d'audit.
