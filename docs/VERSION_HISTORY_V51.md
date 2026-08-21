# Historique de version — v51.0.0

## Identité de la release

- Nom : `ALIENS: TANTALUS FRONTIER`
- Version : `51.0.0`
- Sous-titre : `Effective Gameplay Contract & Persistent Frontier Simulation`
- Base additive : `50.0.0`
- Schéma de sauvegarde : `51`

La v51 est une passe de gameplay et de vérité de production. Son objectif n'est pas d'augmenter les compteurs, mais de donner un consommateur réel aux promesses historiques : planifier, équiper, jouer, échouer ou réussir, puis retrouver les conséquences dans la sauvegarde.

Le catalogue v50 reste la source additive. Aucun volume n'a été réduit : 64 mondes, 436 campagnes, 146 armes, 106 équipements, 568 ennemis, 279 véhicules, 244 Apex, 234 Neuro-Xeno, 16 membres, 392 costumes, 158 modules et 800 graines de niveau.

## Différence fonctionnelle avec la v50

| Avant la passe v51 | v51 |
| --- | --- |
| Nombreux catalogues consultables mais sans consommateur complet. | Adaptateurs runtime pour armes, équipements, ennemis, véhicules, costumes, Apex, Neuro-Xeno, équipage et graines. |
| Campagnes partageant essentiellement la même fin de niveau. | Seize objectifs physiques avec prérequis, vagues, cibles, timers, capture, tracker, conduits et véhicule. |
| Choix stratégiques surtout descriptifs. | Coûts, temps, risque, recherche, achats, modules, escouade, opérations et journal persistants. |
| Conséquences MIRE/Frontier annoncées dans le texte. | 218 paires reliées : archive MIRE, déblocage Frontier et deltas persistants par objectif. |
| Véhicule principalement équivalent à un APC terrestre. | Six familles de conduite : sol, air, espace, maritime, rail et exosquelette, avec sièges actifs. |
| Mondes surtout utilisés comme fiches et paramètres de mission. | Simulation de stabilité, infestation, quarantaine et population, avec alertes, routes et crises. |
| Hub jouable mais incidents limités. | Crises xénomorphes, synthétiques et pathogènes combattues physiquement, plus playtest Forge du vaisseau. |
| Plaques et profils encore souvent séparés de la boucle. | Assets normalisés consommés, équipement à charges, costume visible/systémique et sélection de rencontre contextuelle. |
| Rechargement d'une opération limité au contrat stratégique. | Reprise native post-génération du checkpoint, acteurs, objectifs, inventaire, portes, ennemis/drops, véhicule, charges et Neuro-Xeno, sans projectiles ni refarm. |
| Cache PWA du shell sans preuve de la chaîne ESM complète. | Fermeture transitive des modules publics mise en cache et testée réellement hors ligne. |

## Systèmes ajoutés

### Commandement et économie

`src/save.js` ajoute cinq actions de commandement et cinq recherches. Chaque action possède durée, coût et risque ; elle peut :

- ouvrir une route et produire de la recherche ;
- convertir carburant/ravitaillement en récupération industrielle ;
- exécuter un cycle MIRE ;
- stabiliser une colonie ;
- traiter fatigue, stress et blessures de l'équipe.

Les achats ne sont plus de simples sélections : une arme, un équipement ou un véhicule doit être acquis avec des ressources, puis affecté. La logistique recherchée modifie les devis.

La diplomatie n'est plus une répétition instantanée : une route verrouillée ou une opération active la bloque, chaque position avance l'horloge et applique une transaction unique, puis `galaxy.diplomacyWindows` impose un cooldown persistant par monde. Le carburant reste renouvelable par récupération industrielle, salvage de mission à réserve basse et commerce diplomatique ; la dépense de déploiement ne crée donc pas une impasse définitive.

### Équipage et opération persistante

La taille active est limitée à quatre. Une opération utilise les membres disponibles, leur état, l'équipement et le véhicule sélectionnés. Le lancement paie son coût, avance l'horloge et augmente fatigue/stress. Le résultat peut produire blessures, indisponibilité, récupération, disparition ou entrée au mémorial selon le risque et les protections acquises.

`strategy.currentOperation` empêche de lancer simultanément plusieurs déploiements. `lastOperation` et le journal gardent la trace du résultat.

### Modules du Tantalus

Les 158 modules passent par :

- devis crédits/alliage ;
- puissance disponible et charge installée ;
- intégrité par module ;
- dégâts d'incident ;
- réparation payante ;
- effets agrégés sur le vaisseau et les opérations.

### Simulation de la Frontière

`src/world-crisis.js` et `src/world-crisis-core.js` font évoluer les mondes avec le temps stratégique. Les alertes et déblocages sont enregistrés dans la sauvegarde. La pression combinée des mondes et des systèmes du vaisseau peut créer :

- une intrusion xénomorphe ;
- une révolte/infiltration synthétique ;
- une contamination pathogène.

Ces crises ne se résolvent pas depuis une carte : le joueur doit rejoindre le pont concerné et neutraliser les menaces dans le hub. Succès et échec modifient ressources, systèmes, stress, blessures et modules.

### Conséquences MIRE/Frontier

`src/campaign-consequences.js` compile les seize objectifs en effets cohérents. Une opération MIRE réussie :

1. enregistre son archive ;
2. débloque le monde/pair Frontier ;
3. crée une alerte de continuité.

Lorsque l'opération Frontier correspondante est ensuite réussie, le système détecte l'archive et améliore le résultat. Une défaite produit des deltas opposés et une alerte critique.

### Mission Metroidvania tactique

Le moteur est maintenant composé de couches successives, avec `src/game-production-runtime.js` comme import public :

- physique, collisions, combat, coop, checkpoint et rendu ;
- adaptateurs de catalogue et difficulté ;
- seize objectifs ;
- routes/biomes/dangers, équipements, costumes, furtivité, Apex et véhicules ;
- rencontres contextuelles, balistique de famille, Neuro-Xeno adverse et accessibilité ;
- reprise native sanitisée après génération déterministe.

Les objectifs effectifs couvrent : sauvetage, atmosphère, ruche, boîte noire, escorte, purge, abordage, défense, traque Apex, synthétique, capture, relais Neuro, protection, conduits, véhicule et fuite. La sélection de rencontre ne force plus une reine étrangère ou inéligible dans une campagne synthétique ; un royal ne devient boss contextuel que si la campagne exige explicitement une ruche ou une reine.

### Reprise native de mission

`src/game-production-resume.js` capture un snapshot sérialisable depuis le runtime public, puis `GameEngine.start({ resumeState })` le réapplique après avoir généré le même niveau. L'identité graine/monde/campagne/niveau/objectif et les IDs des entités doivent correspondre ; les nombres sont bornés.

La reprise couvre :

- checkpoint, joueur et coop ;
- phase, temps, objectifs et nœuds de mission ;
- inventaire, tracker, portes, conduits, alimentation, archive, supplies et pickups ;
- ennemis vivants/morts, santé, position, drops et état pris ;
- véhicule, occupants, coque, carburant et tourelle ;
- usages/charges d'équipement ;
- signal, impulsions, adversaire et relais Neuro-Xeno.

Projectiles, particules et entrées instantanées ne sont jamais sérialisés. Un ennemi mort, un drop pris ou un pickup consommé reste consommé après rechargement : la reprise ne recrée aucune ressource à refarmer.

### Armes et équipements

Les armes utilisent leur fiche réelle : dégâts, cadence, chargeur, rechargement, pénétration, portée et famille. La couche de production ajoute pénétration multi-cible, contournement d'armure, bruit, dégâts de zone et états comme brûlure, étourdissement, ionisation, gel ou corrosion.

Les 106 équipements reçoivent une action chargée. Selon leur famille, ils scannent, soignent, réparent, percent, déploient un objet, améliorent le tracker, protègent de l'environnement ou ravitaillent. Le snapshot conserve usages et charges restantes.

### Ennemis et rencontres

Les 568 profils passent par statistiques et comportement, puis par un filtre de rencontre : fréquence, habitats, mondes associés, biomes, atmosphère, modificateurs d'adaptation et mode de campagne. La sélection est déterministe pour une même graine.

Cette couverture reste systémique : les familles d'IA sont partagées et aucune revendication de 568 comportements artisanaux n'est faite.

### Véhicules et sièges

Les 279 véhicules se répartissent dans six locomotions :

- sol : accélération/freinage et ramming ;
- air : contrôle horizontal/vertical, plafond et boost ;
- espace : dérive inertielle et contrôle bidimensionnel ;
- maritime : déplacement et profondeur ;
- rail : axe contraint et vitesse élevée ;
- exosquelette : marche lourde et saut assisté.

Les sièges utilisent les spécialités de l'escouade. Un conducteur améliore la maniabilité, un tireur les dégâts, un observateur le tracker et un support la réparation.

### Costumes et furtivité

Les 392 costumes compilent provenance, faction, armure, mobilité, furtivité, résistances et marquage visuel. La détection combine :

- illumination locale ;
- vitesse/bruit ;
- tir récent ;
- accroupissement ;
- couverture ;
- bonus du costume.

Les ennemis émettent des transitions `spotted` et `lost`, ce qui rend la furtivité mesurable au lieu de la limiter à une statistique de fiche.

### Apex et Neuro-Xeno

Un dossier Apex ne remplace plus automatiquement le boss. `shouldSpawnApex` vérifie habitat, danger minimal, restrictions et probabilité déterministe avant l'insertion. La sélection royale applique la même discipline contextuelle : hors objectif ruche/reine, un royal inéligible est exclu ; dans ce contexte explicite, un profil royal peut devenir la menace alpha.

Le Neuro-Xeno modifie la classe du joueur. Le signal dépend de portée et difficulté ; sa perte applique le mode d'échec du profil et permet une reliaison. La couche de production ajoute un ennemi brouilleur, deux contre-impulsions et un relais physique que le joueur peut neutraliser. La touche clavier et le bouton tactile `X` déclenchent réellement une contre-impulsion disponible.

### Frontier Forge

L'éditeur possède désormais :

- validation explicite ;
- annuler/rétablir ;
- import/export et sauvegarde ;
- compilation de treize tuiles ;
- playtest mission ;
- playtest du Tantalus avec ennemis, dangers, objectifs et terminaux.

Le bouton Playtest reste verrouillé tant que spawn, objectif et surface praticable ne sont pas présents.

### Interface v51

Les nouveaux artefacts d'intégration sont :

- `src/app.js` ;
- `index.html` ;
- `styles.css` ;
- `tests/ui-v51-contract.test.mjs`.

Ils exposent les actions stratégiques, recherches, modules, journal, plan d'opération, acquisitions, affectations, sélection Apex/Neuro-Xeno, diplomatie et cooldown, crise active, état Forge et contrôles tactiles. L’entrée publique charge `src/app.js`, qui importe `src/game-production-runtime.js` et `src/hub-v51-runtime.js`.

L'application transmet sous-titres, réduction des mouvements, visée assistée et intensité du tremblement au moteur. Les événements `caption` sont affichés dans le journal de mission sans déclencher une sauvegarde pour chaque tir. Elle capture aussi `resumeState` dans l'opération active et le repasse au runtime après rechargement.

### PWA hors ligne

Le service worker met en cache toute la fermeture ESM publique atteignable depuis `src/app.js`, notamment `game-production-core`, `game-production-resume` et `game-production-base`. Le fallback HTML est limité aux navigations, afin qu'un import de module manquant échoue explicitement au lieu de recevoir `index.html`. Le contrat statique et le checkpoint navigateur `offline-pwa` vérifient les deux niveaux.

## Sauvegardes et compatibilité

Le schéma passe à 51 sans changer le préfixe de stockage `atf-v47-profile-`, afin de conserver les trois profils existants. Les anciennes clés historiques sont toujours reconnues.

La migration :

- préserve joueur, inventaires, équipage, statistiques et progression monde ;
- initialise les nouvelles ressources et couches stratégiques ;
- normalise statuts, valeurs numériques et identifiants ;
- conserve les projets Forge ;
- ajoute modules/intégrités, crises et sélections avancées sans supprimer les champs valides ;
- sanitize et conserve le `resumeState` de l'opération active, en ignorant les champs inconnus.

Une sauvegarde en cours de mission reprend désormais l'état natif utile : checkpoint, joueur/coop, objectifs, inventaires, portes/conduits, pickups, positions/santé des ennemis, drops, véhicule, charges et Neuro-Xeno. Elle ne prétend pas être une capture frame exacte : projectiles, particules, touches pressées et effets visuels transitoires sont exclus.

## Validation automatisée

La release v51 finale locale a franchi le lint de `59 modules`, `81/81` tests Node et le build statique de `3 443 entrées`. Les tests de production couvrent notamment :

- six familles de véhicules ;
- géométrie déterministe des niveaux ;
- 106 équipements ;
- 392 costumes ;
- furtivité dynamique ;
- règles Apex ;
- sélection contextuelle des 568 ennemis ;
- familles d'armes et pénétration ;
- contre-jeu Neuro-Xeno ;
- accessibilité.

Les autres suites couvrent contenu, sauvegarde, objectifs, mission, hub, simulation galactique, conséquences, assets, diplomatie temporisée, carburant renouvelable, reprise native persistée, fermeture ESM PWA et boucle stratégique complète.

La référence de release n'est pas un nombre figé. Après promotion de l'interface v51, les gates exigés sont :

```powershell
npm.cmd run qa
```

Le parcours navigateur desktop/mobile est automatisé par `scripts/browser-qa-v51.mjs`. Il passe dix checkpoints : boot/accessibilité, stratégie/diplomatie, dotation, mission/captions, reprise native, retraite persistée, crise physique, Forge mission/vaisseau, rechargement mobile et PWA hors ligne. Le passage local final ne relève aucune exception, erreur console ni requête échouée. GitHub et Vercel ne sont déclarés terminés qu'après preuves séparées : commit/push, déploiement `Ready` et URL HTTP 200.

## Limites volontairement non masquées

La v51 ferme la majorité des catalogues morts, mais ne revendique pas :

- 64 mondes intégralement construits à la main ;
- 436 missions avec script/cinématique unique ;
- 800 cartes artisanales ;
- 568 IA uniques ;
- 279 cockpits et plaques de véhicules uniques ;
- 392 sprites de costume uniques ;
- une plaque distincte pour chaque entrée de tous les catalogues ;
- une sauvegarde vidéo/frame exacte au milieu d'un combat : la reprise conserve les états de gameplay listés plus haut, mais exclut volontairement projectiles, particules, entrées instantanées et interpolation visuelle ;
- l'équilibrage final et le confort d'une campagne commerciale sans sessions de jeu prolongées ; les commandes d'accessibilité et leur parcours navigateur sont couverts, pas une certification d'accessibilité.

La matrice complète et les preuves par promesse figurent dans `docs/GAMEPLAY_PROMISE_AUDIT_V51.md`.
