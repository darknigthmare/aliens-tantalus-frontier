# V66 — lot 002 : 20 ennemis, 87 plaquettes sources

Suite de cette livraison : voir [les 20 atlas reconstruits et vérifiés](V66_BATCH_002_ATLAS_DELIVERY.md). Le présent document conserve l'état historique de la livraison des sources ; les nombres de variantes, d'ancrages et les réserves ci-dessous ont ensuite évolué.

État arrêté le 31 août 2026. **Production des sources terminée ; acceptation artistique et intégration du lot non terminées.**

## Livré et vérifié

- 20 profils, du Praetorian 007 au Foundry Crusher 026.
- 87 masters PNG actifs, 87 SHA256 distincts, 134 335 845 octets. Chaque plaquette comporte huit cases nominales : 696 poses sources à examiner, pas 696 poses déjà acceptées en jeu.
- Génération et corrections effectuées avec **OpenAI ImageGen intégré**, sans API/CLI de génération. Prompts exacts et identifiants de génération conservés ; 122 fichiers d'événements incluent les révisions historiques, pas seulement les 87 masters courants.
- 87 sources sur fond magenta RGB. Ce ne sont pas encore des atlas transparents prêts à jouer.
- Audit final du 2026-08-31 à 18:15:04 UTC : **50 extractions directes, 37 extractions possibles par réattribution courte démontrée, zéro source manquante, zéro extraction encore bloquée**. Les règles existantes restent inchangées : appartenance d'au moins 90 %, débordement maximal de 15 %. Aucun pixel source modifié par cet audit.
- 40 plaquettes présentent des indices conservateurs de contact avec une limite de cellule. Le passage de l'extracteur ne dispense pas d'examiner leurs contours et leur découpe.
- Foundry Crusher : un atlas RGBA candidat de 40 poses, cinq clips, aperçus animés et 40 repères anatomiques manuels. Il reste non accepté à cause de traces roses et de variations de volume à revoir.
- **Zéro profil du lot 002 accepté ou intégré au runtime.** Les cinq profils du lot 001 restent intégrés et inchangés ; le Facehugger V65 reste la référence préalable distincte.

## Inventaire des 20 profils

Tous disposent de `idle`, `move`, `attack`, `death`. La colonne complément précise les autres clips réellement présents.

| Profil | Plaquettes | Complément | Découpe directe / réattribution courte |
| --- | ---: | --- | ---: |
| 007 Praetorian | 5 | tail-strike | 1 / 4 |
| 008 Queen | 5 | tail-strike | 3 / 2 |
| 009 Crusher | 5 | charge | 5 / 0 |
| 010 Spitter | 4 | — | 2 / 2 |
| 011 Lurker | 4 | — | 3 / 1 |
| 012 Carrier | 5 | release | 4 / 1 |
| 013 Ravager | 4 | — | 3 / 1 |
| 014 Boiler | 4 | — | 1 / 3 |
| 015 Prowler | 4 | — | 3 / 1 |
| 016 Burster | 4 | — | 4 / 0 |
| 017 Monica Line | 4 | — | 3 / 1 |
| 018 Specimen Six Line | 4 | — | 3 / 1 |
| 019 Red Xenomorph | 4 | — | 3 / 1 |
| 020 K-Series Yellow | 4 | — | 4 / 0 |
| 021 Neuro-Xeno Drone | 4 | — | 0 / 4 |
| 022 Xenoborg | 5 | reload | 1 / 4 |
| 023 ATARAX Ripper | 4 | — | 2 / 2 |
| 024 Ripper Queen | 5 | tail-strike | 4 / 1 |
| 025 Foundry Drone | 4 | — | 0 / 4 |
| 026 Foundry Crusher | 5 | charge | 1 / 4 |
| **Total** | **87** | | **50 / 37** |

## Où sont les fichiers

- Masters : `assets/openai/sprites/frames/v66/batch-002/<profile>/<clip>.png`.
- Anciens résultats remplacés : sous-dossiers `rejected/`, conservés pour traçabilité, jamais comptés comme nouveaux clips actifs.
- Prompts réellement envoyés : `docs/references/v66-batch-002-prompts/<profile>/`.
- Preuves de génération : `docs/references/v66-batch-002-events/<profile>/` ; l'état consolidé ne lie chaque clip courant qu'à sa révision actuelle.
- Références et choix de design : `V66_ENEMY_BATCH_REFERENCES.json`, fragments `V66_BATCH_002_REFERENCES_A.json` à `_E.json`.
- Audit machine : `V66_BATCH_002_SOURCE_AUDIT.json` ; contacts numérotés dans `assets/openai/sprites/previews/v66/batch-002/source-audit/`.
- Atlas candidat : `assets/openai/sprites/normalized/enemy-profiles-v66/enemy-026-foundry-crusher.webp`.
- Ancrages : `V66_BATCH_002_ANCHOR_REVIEW.json`, contacts dans `v66-batch-002-anchor-review/`.

La référence partagée initiale du Boiler est conservée comme verrou immuable des générations. Le fragment B et son rapport ajoutent la revue ultérieure de la plaquette V56 ; cette annotation ne change pas le design et ne réécrit pas rétrospectivement l'empreinte de référence des événements.

## Corrections réellement effectuées

- Praetorian : retour au modèle à deux bras pour l'attaque ; queue replacée depuis le bassin. Révision avec bras parasites archivée.
- Queen : grands bras restaurés dans idle/move ; tail-strike refait avec l'identité Queen plutôt que Praetorian. Révision ayant perdu les grands bras rejetée.
- Spitter et Lurker : cadrage réduit pour récupérer les poses complètes et supprimer les chevauchements bloquants.
- Carrier : Facehugger de la cinquième pose rétabli ; les trois positions de libération sont maintenant présentes.
- Boiler : crâne et orientation corrigés avant les autres clips ; le modèle reste distinct du Burster quadrupède.
- Specimen Six et K-Series : débordements de queue/bras corrigés dans les révisions de marche/attaque.
- Neuro-Xeno : attaque compacte et anatomie stabilisée. Xenoborg : canons rigides, recharge par capacité/ventilation, pas de chargeur de fusil inventé.
- ATARAX Ripper : marche bipède redressée, attaque compacte ; Ripper Queen : cinquième pose de queue corrigée pour éliminer la lance partant du visage.
- Foundry Drone : attaque et cadrage de mort repris. Foundry Crusher : appendice dorsal parasite retiré, charge ramenée sur les appuis et plusieurs retouches du rose parasite.

## Ce qui reste obligatoire avant le jeu

1. **Anatomie et fidélité** : revoir Praetorian idle/move/death (nombre de membres), comparer Queen attack/death aux identités restaurées, vérifier ses deux petits bras thoraciques occultés. Aucune fidélité 1:1 n'est certifiée. Les lignées Monica/Six et les variantes originales du projet ne sont pas présentées comme des castes officielles.
2. **Continuité** : longueur et raccord des queues Praetorian/Queen/Specimen Six, déploiement des lames du Ravager sans allongement artificiel, origine de libération du Carrier, alternance des appuis et raccord dernière/première pose.
3. **Identité et lisibilité** : densité des pustules du Boiler, articulation du bras de la quatrième pose d'attaque Red Xenomorph, impact trop discret de K-Series ; sa première pose de mort contient encore une marque violette.
4. **Détourage** : Foundry Crusher conserve 142 indices de rose opaque au diagnostic après amélioration partielle (contre 167 auparavant), surtout cou/articulations. Ce diagnostic ne justifie pas d'effacer automatiquement des pixels anatomiques. Aucun élargissement des seuils de suppression effectué.
5. **Ancrages et échelle** : mesurer les racines physiques des 19 autres profils et calibrer chaque ensemble de clips, notamment ceux recadrés. Pas de recentrage sur les extrémités de queue ni d'acceptation déduite d'une boîte englobante.
6. **Atlas et contrôle animé** : générer les 19 atlas manquants, revoir les 20 profils frame par frame puis en lecture, contrôler volumes, rythme, vitesse, orientation gauche/droite et limites de cellules.
7. **Runtime** : n'ajouter au registre que les profils ayant passé ces étapes ; tester collisions, timing d'attaque, pivot, taille en salle et non-régression des ennemis existants dans le navigateur.

Rapports de détail : `V66_BATCH_002_ROYAL_SOURCE_REVIEW.md`, `V66_BATCH_002_VARIANTS_B_REVIEW.md`, `V66_BATCH_002_LURKER_GEOMETRY_REVIEW.md`, `V66_BATCH_002_FOUNDRY_CRUSHER_REVIEW.md`.

## Organisation et périmètre

La file conserve le lot pilote 001 de cinq profils et passe les lots suivants à 20 profils sans renuméroter ni perdre les preuves existantes. Elle contient 570 travaux de production sur 30 lots, plus le Facehugger déjà intégré ; 2 457 plaquettes constituent le budget contractuel, pas une couverture artistique réalisée.

L'état contrôlé contient 107 plaquettes actuelles prouvées : 20 du pilote et 87 de ce lot. Il indique 20 profils générés, cinq anciens intégrés et 545 profils encore sans référence revue. Ces comptes ne signifient pas que les centaines d'ennemis sont terminés.

Les sources, références externes, rejets, contacts de contrôle et l'atlas candidat 026 sont exclus du build/runtime et du paquet Vercel. **Aucun nouvel ennemi du lot 002 n'est annoncé déployé.** Les travaux V65 non liés à ce lot sont préservés et exclus de son commit.

## Vérifications reproductibles

```powershell
py scripts/audit-v66-batch-sources.py --batch batch-002 --probe-safe-reassignment
node scripts/enemy-batch-production.mjs check
py scripts/process-v66-enemy-batch.py --profile enemy-026-foundry-crusher --check
npm run qa
git -c core.whitespace=-blank-at-eof diff --cached --check
```

L'audit des sources et la vérification de provenance passent. Le contrôle du candidat 026 passe techniquement sans constituer une acceptation artistique. Aucun test navigateur de ce lot, aucune acceptation automatique et aucune promotion Vercel ne sont revendiqués.

`npm run qa` a passé les contrôles de sprites, le lint de 218 modules, les 623 tests et le build V66 de 3 446 entrées catalogue. L'audit historique des 405 PNG runtime signale zéro erreur et 13 candidats de halo à revoir ; ces derniers ne sont pas masqués par la réussite du build. Les lignes vides finales des prompts sont conservées volontairement car elles font partie du texte réellement envoyé à ImageGen.

La revue indépendante a ensuite corrigé un garde-fou de provenance : un événement qui fournit un ancien SHA ne peut plus être rattaché silencieusement à une image remplacée. La compatibilité des événements historiques sans SHA est conservée. Les 87 sources actuelles ont également été comparées aux masters OpenAI et à leurs derniers événements : aucune divergence trouvée. Après ce correctif, la suite complète passe à **624 tests réussis**.
