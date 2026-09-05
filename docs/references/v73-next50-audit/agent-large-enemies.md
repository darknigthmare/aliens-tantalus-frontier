# V73 — Audit visuel indépendant : Praetorian 007, Queen 008, Crusher 009, Spitter 010

Date : 2026-09-05. Statut : **audit de candidats, aucune acceptation ni intégration**.

## Périmètre et méthode

- Inspection réelle des 19 sources actives (152 poses, ordre gauche→droite puis rangée inférieure), des quatre références locales verrouillées et des quatre contacts d'atlas existants.
- Sources : `assets/openai/sprites/frames/v66/batch-002/<profileId>/<clip>.png`.
- Contacts : `docs/references/v66-batch-002-atlas-review/<profileId>.jpg` ; atlas : `assets/openai/sprites/normalized/enemy-profiles-v66/<profileId>.webp`.
- Contrats lus : queue V66, références V66, métadonnées individuelles, revues d'ancrage et d'échelle batch002. Les poses sont numérotées **1 à 8** dans les observations ci-dessous ; les métadonnées utilisent des indices 0 à 7.
- Les sources et contacts ont été affichés pour inspection ; aucun bitmap n'a été réécrit. Pas de génération, de renormalisation, de modification de registre ou de runtime. Une revue de poses fixes ne prétend pas constituer une recette animée en jeu.

## Décision synthétique

| Profil | Sources / poses | Bloqueurs visuels principaux | Racines actuelles | Décision |
|---|---:|---|---|---|
| `enemy-007-praetorian` | 5 / 40 | Bras supplémentaire dans idle ; marche sans alternance convaincante ; attaque sans transfert de poids | 40 en attente, centre/bas de bounding box | Ne pas accepter |
| `enemy-008-queen` | 5 / 40 | Marche faible ; terminaison de queue différente dans attack ; échelle plus petite de tail-strike | 40 en attente, centre/bas de bounding box | Ne pas accepter |
| `enemy-009-crusher` | 5 / 40 | Charge : continuité de queue perdue visuellement en extension ; pas de freinage/reprise final net | 40 revues, repère thoracique mesuré | Ne pas accepter sur les seules racines |
| `enemy-010-spitter` | 4 / 32 | Alternance de marche insuffisante ; échelle move/attack encore non mesurée | 32 en attente, centre/bas de bounding box | Ne pas accepter ; attack/death à préserver comme candidats |

Aucun de ces quatre profils n'est certifié fidèle 1:1. La présence de 152 cellules uniques ne prouve ni l'anatomie ni une animation fluide.

## 007 — Praetorian

Référence observée : `assets/openai/sprites/frames/v66/batch-002/enemy-007-praetorian/references/avp2010-model-preview.png`. Le modèle AvP2010 possède deux bras principaux, un thorax étroit et une couronne arrière triangulaire ; ce n'est pas une Queen à quatre bras.

- **Anatomie, idle : rejet.** Les poses montrent trois silhouettes de mains/avant-bras autour du thorax : une main à l'arrière, un grand bras pendant devant la hanche et une main dirigée vers l'avant. C'est particulièrement lisible aux poses 1 et 2, et reste présent dans la série. Cette ambiguïté surnuméraire est absente du modèle de référence à deux bras. Le contrat exclut explicitement les petits bras thoraciques.
- **Move : reprise nécessaire.** La jambe visible avancée reste devant sur l'essentiel du cycle ; les poses 2/3 puis 6/7 replient surtout l'autre jambe sans établir le contact opposé d'une seconde moitié de cycle. Le bras oscille, mais on ne lit pas un pas complet contact→passage→contact opposé. La forme arrière de la couronne paraît aussi plus arrondie que celle de l'idle ; verrouiller un seul modèle latéral avant une nouvelle course.
- **Attack : chronologie présente, intensité insuffisante.** Poses 2/3 : coude fléchi ; 4/5 : extension ; 6/7 : retrait. Le bassin, les jambes et le tronc restent presque verticaux et immobiles. Cela lit comme un geste de main, pas comme la frappe lourde exigée. Ne pas tenter de compenser par un événement de dégâts ou une translation CSS.
- **Tail-strike : matériau utile, pas prêt.** La queue s'enroule réellement (2/3), passe en avant (4/5), puis revient (6–8). En revanche le corps reste rigide et le centre horizontal de sa bounding box varie énormément avec la queue ; l'ancrage actuel entraînerait un déplacement latéral du corps. Préserver la trajectoire comme candidat, puis poser un repère bassin et revoir le suivi du thorax.
- **Death : chute réelle.** Perte d'appui 2/3, descente 4/5, corps posé 6–8. Pas de rejet automatique de cette source. Le roulis entre 5 et 6 impose de suivre le corps physique et non son extrémité de queue.
- **Échelle/racines :** cinq facteurs interclips à 1 sans revue anatomique ; 40 racines `legacy-bounds-center-bottom`. Les poses de déplacement sans pied clairement planté exigent un plan de sol explicite, pas un bas d'alpha posé sur le sol.

Priorité de nouvelle production : `idle`, `move`, `attack`. Conserver `death` et `tail-strike` pour revue/ancrage avant de décider une régénération supplémentaire.

## 008 — Queen

Référence observée : `assets/openai/sprites/frames/v66/batch-002/enemy-008-queen/references/neca-queen-1986.jpg`. Sculpture NECA Aliens1986 : grande couronne lobée, deux longs bras externes et deux petits bras thoraciques, queue segmentée attachée. La photo de référence coupe elle-même une partie de la queue : elle ne suffit pas à prouver son extrémité dans toutes les poses.

- **Identité conservée partiellement :** palette bleu-noir/brun des côtes et silhouette de grande couronne reconnaissables. Les petits bras se superposent en vue latérale ; leur nombre n'est pas certifiable sur toutes les petites poses. Ne pas les déclarer absents uniquement pour cause d'occlusion, mais vérifier la continuité des quatre attaches sur une planche anatomique latérale.
- **Move : rejet de locomotion.** Poses 2/3 très proches, 6/7 également ; le même ensemble jambe avant/jambe arrière domine les deux moitiés. On voit une variation d'écartement et de bras, sans transfert net vers le pied opposé. Ne pas valider une marche royale sur les seuls huit hashes différents.
- **Attack : attaque plus lisible, queue incohérente.** Le grand bras monte (2/3), frappe (4/5), passe bas (6) puis revient (7/8). Mais la queue devient une masse courte et épaisse dont l'extrémité est visuellement émoussée/tronquée aux poses 1 et 8 ; elle ne conserve pas la longue pointe de l'idle et de tail-strike. Les poses 4–6 déplacent fortement le corps vers l'avant : une racine de bassin/thorax est indispensable, ainsi qu'un contact de pieds contrôlé.
- **Tail-strike : silhouette cohérente, taille différente.** La Queen debout est visiblement plus petite dans ce clip que dans idle alors que la pose de base est comparable ; les cinq facteurs actuels valent 1. Le mouvement arrière/haut/avant est réel, mais 3→4 saute d'une grande boucle arrière vers une queue presque horizontale à l'avant. Il faut revoir l'intermédiaire de frappe et mesurer une portion rigide de couronne/thorax, sans égaliser les bounding boxes.
- **Death : matériau utile.** Perte d'appui puis corps allongé aux poses 6–8, couronne et queue présentes. Les poses passent d'une posture très étalée à un corps tourné/couché : ancrage et échelle interclips à vérifier avant toute promotion.
- **Échelle/racines :** aucun calibrage anatomique, 40 racines de bounding box. La calibration du candidat V66 ne doit pas diminuer arbitrairement la taille royale du runtime V56 déjà corrigé.

Priorité de nouvelle production : `move`, puis `attack` avec queue complète verrouillée. Pour `tail-strike`, mesurer d'abord la différence d'échelle et contrôler la continuité ; une simple mise à l'échelle ne remplace pas la pose intermédiaire manquante.

## 009 — Crusher

Référence observée : `assets/openai/sprites/frames/v66/batch-002/enemy-009-crusher/references/hiya-crusher-review-024.jpg` : le Crusher est **à droite**, le Raven bipède à gauche. Le candidat respecte globalement le quadrupède bas, les épaules massives et le large bouclier crânien. La dominante brune du bouclier doit être évaluée sans recopier l'éclairage rouge/jaune de la photo.

- **Idle : candidat plausible.** Quatre membres porteurs, antérieurs plus massifs, queue complète ; variations discrètes adaptées à une attente. Ne pas exiger une grande amplitude pour ce clip.
- **Move : plus construit que 007/008, mais pas certifié.** Les membres antérieurs passent l'un devant l'autre aux poses 3/5/7 ; plusieurs changements d'appui existent réellement. En revanche l'ordre précis avant/arrière des quatre pieds et l'absence de glissement demandent une revue animée au sol. Ne pas le rejeter comme une copie immobile, ni l'accepter sur silhouette seule.
- **Attack : anticipation et récupération visibles.** Bouclier abaissé 2–5, remontée 6–8. Le mouvement est surtout une flexion/impact de tête ; le déclenchement de la charge corporelle et son déplacement devront être raccordés à une phase de gameplay explicite. La vue du bouclier tourne davantage vers le spectateur que dans idle ; vérifier que ce soit un mouvement du cou et non un changement de caméra/anatomie.
- **Charge : priorité de reprise.** Poses 2/4/6/8 comprimées, 3/5/7 étendues. Sur les poses étendues, la grande queue courbe n'est plus traçable comme appendice complet distinct de la patte arrière allongée ; elle redevient immédiatement une boucle dans la pose suivante. Cette continuité insuffisante interdit de valider la queue comme complète. La pose finale reste comprimée ; le freinage et le retour à un appui stable demandés par le contrat ne sont pas nettement dessinés.
- **Death : exploitable sous réserve.** Descente 2–5, corps et bouclier posés 6–8. L'occlusion progressive du thorax par le bouclier est prévue par la revue existante et ne signifie pas automatiquement une cellule coupée.
- **Racines déjà travaillées :** les 40 poses utilisent `measured-source-body-landmark`. Revue indépendante antérieure du centre thoracique derrière l'épaule, incertitude 8 px et 12 px pour les dernières poses de mort. Les conserver ; ne pas les remplacer par le centre de bounding box.
- **Échelle :** les cinq facteurs restent à 1 sans revue d'invariant rigide. Le changement de vue du bouclier empêche de calibrer le corps d'après sa largeur apparente seule ; préférer la plaque d'épaule ou un segment thoracique comparable.

Priorité de nouvelle production : `charge`. Conserver les quatre autres sources jusqu'à la revue animée des appuis et la mesure d'échelle ; aucun motif démontré ici pour tout régénérer aveuglément.

## 010 — Spitter

Référence observée : `assets/openai/sprites/frames/v66/batch-002/enemy-010-spitter/references/square-enix-spitter-official.jpg`. Le candidat reprend le noir bleuté, les réservoirs jaune-vert derrière le crâne et les longues épines dorsales du Play Arts Kai Colonial Marines, pas la caste orange d'un autre jeu.

- **Idle : identité reconnaissable.** Les réservoirs restent à l'arrière du dôme et ne deviennent pas des yeux. La posture reste néanmoins proche d'un trois-quarts de la référence ; le volume des épaules, pieds et épines doit être verrouillé sur une vraie vue latérale avant réemploi comme gabarit.
- **Move : reprise nécessaire.** Alternance entre jambes plus ouvertes et plus regroupées, mais la jambe arrière reste visuellement derrière et les poses 1/3/5 puis 2/4/6 n'établissent pas nettement un demi-cycle opposé. Plusieurs pieds se soulèvent : leur bas d'alpha ne peut servir de plan de sol physique.
- **Attack : source utile.** Anticipation 2/3, tête projetée et gueule ouverte 4/5, fermeture/retrait 6–8. L'absence de projectile peint est **conforme** au contrat, qui le prévoit comme effet séparé. La variation de tête et de gorge est présente ; elle doit être synchronisée avec le lancement réel et conservée pendant la revue d'échelle/racines.
- **Death : chute complète, ancienne taille source corrigée techniquement.** La source brute est clairement plus petite que l'idle ; le facteur `death: 1.615297` est déjà appliqué à l'atlas actuel. La revue existante mesure une corde crânienne médiane de 121.3796 px pour idle contre 75.14385 px pour death. Ne pas réclamer une nouvelle source uniquement à cause de la taille brute. Le corps se pose réellement aux poses 6–8.
- **Échelle incomplète :** la revue existante exclut explicitement move/attack (attitude de tête et forme de crête différentes) ; leurs facteurs à 1 ne sont pas une mesure. La mort a une correction documentée, pas une certification de tout le profil.
- **Racines :** 32 poses en attente, `legacy-bounds-center-bottom`. La queue oscillante déplace le centrage horizontal ; appuis et bassin doivent être suivis avant intégration.

Priorité de nouvelle production : `move`. Préserver `attack`/`death` ; confirmer l'orthographie d'idle et mesurer les deux clips non calibrés avant décision complémentaire.

## Contrôle technique actuel, distinct de la validation artistique

Les commandes `py scripts/process-v66-enemy-batch.py --profile <profileId> --check` ont été exécutées pour les quatre profils. **Aucune ne passe actuellement** :

- 007/008/009 : `Physical source-anchor review changed since normalization.`
- 010 : `Post-generation scale review or its evidence changed since normalization.`

Diagnostic supplémentaire en mémoire, sans écrire les métadonnées : les résumés de revue recalculés ne diffèrent que sur la clé **`sha256` du fichier de registre global batch002**. Les entrées individuelles, les coordonnées et les facteurs concernés ne diffèrent pas. C'est une invalidation de reçu provoquée par l'évolution du registre partagé, pas la preuve que ces 19 dessins auraient été changés ou détruits. Il faudra une renormalisation officielle/revalidation au moment autorisé, pas falsifier le digest dans le JSON.

| Profil | Atlas RGBA | Poses uniques actuelles | Findings cellule actuels | Pixels magenta stricts restants |
|---|---|---:|---:|---:|
| 007 | 1024×2560 | 40 | 0 | 49 |
| 008 | 1024×2560 | 40 | 0 | 71 |
| 009 | 1024×2560 | 40 | 0 | 21 |
| 010 | 1024×2048 | 32 | 0 | 80 |

- Les 19 SHA256 source réels correspondent aux métadonnées ; les quatre SHA256 atlas aussi. La validation de cellules recalculée correspond exactement aux anciens résultats stockés.
- Détection magenta identique au critère strict du pipeline : alpha≥16, rouge>160, bleu>160, rouge−vert>35 et bleu−vert>35. Ce sont des résidus candidats à despill, pas un compte de cellules manquantes. Les sources/chitines sombres restent intouchées pendant cet audit. Pas de grand rectangle blanc observé sur ces quatre atlas.
- SHA256 des atlas examinés :
  - 007 : `f4162bb519b32b9e1bfb87d4a2d0d868c496620aa5faa5bd608a33e0dec7f5fe`
  - 008 : `b76b978d1b03af0a8a7b7787eadc2f73d429190aec749fb2d1e46f36f7c1f9e2`
  - 009 : `15db78d87c9c4b95aa6aad60e1f01631541563f0c309f9e7683ea731610c9f0e`
  - 010 : `d199e6cc8d4e69636d022e957f2d87ff246b1e754eb365bde9bd5d5ba264a938`

## Retour de production au coordinateur

Premier sous-lot recommandé : **7 planches à reprendre**, pas 19 remplacements aveugles : 007 idle/move/attack ; 008 move/attack ; 009 charge ; 010 move. Les clips conservés restent candidats, pas acceptés. Avant toute génération, joindre le modèle latéral de référence et une décomposition de locomotion avec pieds proche/lointain identifiés ; les nouvelles variantes ne doivent pas hériter d'une course déjà incorrecte.

Ensuite : recontrôle visuel des sources → normalisation technique/despill autorisée → racines corporelles et mesure anatomique → aperçu animé avec sol/échelle du joueur → contrat des attaques réellement exécutées → acceptation individuelle avec preuves. Cet audit ne modifie aucune de ces portes d'acceptation.
