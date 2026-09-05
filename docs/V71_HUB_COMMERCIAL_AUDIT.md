# Audit V71 — Hub physique, level design et cohérence

Date : 5 septembre 2026. Statut de la conversation : **partial**, surface jouable.

## Conclusion

Les dix annexes V71 sont des sous-niveaux horizontaux de 1 920 × 720 reliés aux 16 salles historiques. Chaque branche possède un sol, une passerelle, une échelle, des colliders, une porte réciproque, une station et un retour physique. Le graphe contient 26 salles connectées.

Cette structure jouable ne clôt pas la production commerciale du hub. Le registre conserve **2 conversations effective, 8 partial et 9 missing**, soit **17 conversations encore inachevées** sur 19 ; cinq surfaces sont jouables. Le hub fait partie des surfaces jouables mais partielles.

Le validateur distingue le contrat exécuté de la finition : `valid` vérifie identité, structure et mécaniques contractuelles ; `structureValid` couvre le graphe et la géométrie. Même si ces contrôles passent, `productionReady = false` et `complete = false` tant que les cinq dettes ci-dessous subsistent.

## Fonctions réellement raccordées

| Annexe | Salle parente / entrée | Action actuelle de la station |
|---|---|---|
| Sas d’arrivée | `dropship-hangar` / est | enregistre le retour et applique le contrôle de quarantaine |
| Logistique | `vehicle-bay` / ouest | exécute l’ordre de module, vérifie les stocks et publie les pénuries |
| Archives MIRE / Palimpsest | `briefing` / est | indexe les preuves uniques, rapports, médias déjà consultés et bilans de mission |
| Baie synthétique | `science-lab` / ouest | diagnostique et répare les synthétiques disponibles et vivants |
| CCTV | `combat-information` / ouest | effectue un scan, ajoute une preuve capteur et relève un incident actif |
| Proving Ground | `armory` / est | prépare une charge de soutien tactique pour la prochaine opération |
| Morgue | `medical` / est | analyse les dossiers et preuves avec registre persistant anti-répétition |
| Capsules de sauvetage | `cryo-bay` / ouest | prépare une protection à usage unique réduisant les conséquences d’une crise perdue |
| DURANDAL Ω | `workshop` / ouest | arme une charge de soutien de guerre électronique pour le prochain départ |
| Vestibule BIOFORGE | `quarantine` / est | applique un cycle d’isolation du sas ; le niveau expérimental demeure absent |

Le scan CCTV ne commande pas de lockdown ou de sas. L’index MIRE n’ouvre pas une relecture physique des archives dans la salle. La préparation du Proving Ground n’exécute aucun exercice de tir, pilotage P-5000 ou tutoriel ; les anciens certificats attribués par une simple visite sont neutralisés. Les Capsules appliquent une mitigation persistante, sans scénario d’autodestruction joué dans cette annexe.

## Échelle, placement et collisions

| Critère | Contrat vérifié |
|---|---|
| Dimensions par annexe | 1 920 × 720 |
| Sol | continu, `y = 624` |
| Entrée | 112 × 192 px, bornée hors collider |
| Densité logique | six placements de props et trois colliders par annexe |
| Verticalité | une passerelle et une échelle |
| Interaction | une station physique persistante |
| Art | cinq couches indépendantes : far, mid, prop, foreground, door |
| Circulation | dix traversées au sol couvertes par test, nervures suspendues laissant 112 px de passage |

La QA a révélé des nervures qui bloquaient le chemin au sol ; elles ont été déplacées au plafond. Les entrées alternent est/ouest et les stations se situent de l’autre côté du sous-niveau. Les commandes de montée/descente tactiles, l’accroupissement et la reprise verticale ont également été corrigés. Les tests couvrent les poses sur passerelle/échelle et le dégagement d’un ancien checkpoint placé dans un collider.

## Composition artistique contrôlée

Le lot comprend **50 WebP runtime** issus de **sept masters OpenAI ImageGen** : quatre atlas 5 × 2 et trois correctifs BIOFORGE neutres. Les dix ensembles de couches ont été inspectés ; le damier résiduel et l’échelle des props ont été corrigés.

- `far.webp` et `mid.webp` : panoramas RGB 1 920 × 720 ;
- `prop.webp` : couche composite RGBA 640 × 512 ;
- `foreground.webp` : RGBA 1 920 × 720 ;
- `door.webp` : RGBA 384 × 512.

Les 30 couches RGBA disposent d’un alpha réel. Le rapport consigne dimensions, bbox, échelles, placements et SHA-256 ; les facteurs de props vont de `0.463289` à `1.653137`. Le vestibule BIOFORGE utilise un panorama, une console et une porte neutres, avec cuves vides. Les masters sont exclus du build.

La présence de six placements physiques ne signifie pas six fichiers bitmap autonomes : la couche de props reste composite.

## Cinq dettes de production du hub

| Identifiant | Travail restant |
|---|---|
| `independent-prop-bitmaps` | produire les bitmaps indépendants des props actuellement réunis dans une couche composite |
| `dedicated-annex-npcs` | produire et intégrer les PNJ et animations propres aux annexes |
| `physical-training-exercises` | réaliser les exercices physiques promis ; une charge de préparation ne vaut pas certification |
| `physical-archive-replay` | permettre la consultation/relecture physique promise, au-delà de l’index |
| `cctv-lockdown-controls` | réaliser les commandes physiques de surveillance, lockdown et sas au-delà du scan |

Le BIOFORGE complet relève de la conversation suivante, toujours `missing` : sélection d’ennemi et de quantité, impression, confinement jouable et progression séparée. Le vestibule V71 ne remplit pas ce contrat. La préparation d’extraction des Capsules ne certifie pas davantage un exercice d’autodestruction.

## État des preuves de recette

Sur le miroir D, l’accueil puis le hub chargent sans erreur navigateur. La recette prépare par fixture la position d’approche de la porte Quarantine ; elle ne constitue donc pas un parcours manuel depuis le pont. L’entrée BIOFORGE, la traversée par contrôles runtime, la station et le retour sont ensuite exécutés physiquement.

| Contrôle actuel sur D | Résultat |
|---|---|
| Entrée BIOFORGE | transition de sas exécutée, cinq couches prêtes |
| Traversée | contrôle de déplacement de `x = 1646` à `x = 666`, `y = 532` |
| Station et sauvegarde | une utilisation en mémoire et stockée ; quarantaine 69, ressource recherche 0, heure 7, un cycle d’isolation |
| Reprise | état JSON de localStorage relu puis arrêt/redémarrage du hub : BIOFORGE, `x = 666`, `y = 532`, une utilisation |
| Retour | contrôle vers la porte puis interaction : Quarantine, `x = 952`, `y = 290`, annexe inactive, utilisation conservée |
| Portrait 390 × 844 | largeur 390, canvas `390 × 219.375`, neuf boutons tactiles nommés |
| Erreurs navigateur | aucune erreur relevée |

Le contrôle d’accessibilité final reste à actualiser dans [VALIDATION_V71](VALIDATION_V71.md).

La recette antérieure avait parcouru Quarantine → plateformes → porte BIOFORGE → station → retour. Elle avait également mesuré un portrait 390 × 844 sans débordement et un audit axe-core à zéro violation, avec un contraste de gradient à revoir. Ces observations sont historiques : les anciens compteurs de ressources et l’ancien ensemble de sept boutons ne décrivent pas la dernière version des services et contrôles.

Le déploiement Vercel et les contrôles HTTP V71 restent **À COMPLÉTER**. Leur réussite ne changera pas automatiquement le statut de production `partial`.
