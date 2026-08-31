# Worklot 001 — contre-revue indépendante des retouches

Date : 2026-08-31. Relecteur : Codex complete_variants.

Périmètre : les quatre enregistrements de `V66_WORKLOT_001_RETOUCHES.json`, leurs trois masters originaux et les photographies officielles Lurker/Spitter déjà enregistrées dans les références du lot 002. Aucun master, atlas, état, verrou de référence ou mesure n'a été remplacé. Aucune génération supplémentaire, acceptation artistique ou intégration runtime.

## Contrôle des preuves

- Les quatre SHA-256 candidats correspondent exactement aux fichiers. Les quatre liens vers les originaux correspondent aussi à leurs SHA-256 attendus ; les trois masters actifs restent inchangés.
- L'appel en mémoire à `audit_image(source, clipId, probe_safe_reassignment=True)` reproduit exactement les quatre objets `audit` sauvegardés, cellules et rapports de transfert compris.
- Les quatre planches mesurent 1774 × 887. Les trois candidates magenta ont huit poses extraites distinctes. Cette distinction ne certifie ni anatomie ni fluidité.
- Convention documentaire volontaire, précisée par le producteur : les quatre fichiers `promptDocumentPath` possèdent un LF terminal pour Git, absent du champ `actualPromptText` qui conserve le texte exact envoyé à l'outil. Les contenus sont identiques après retrait de ce seul LF. `promptDocumentPath` n'est pas `actualPromptPath` : ces quatre sorties non sélectionnées ne sont pas importées dans STATE et ne fournissent aucun `actualPromptPath` à `validateGeneratedEvent`. Il ne s'agit donc pas d'une erreur de provenance active. Un éventuel import futur devra conserver l'égalité exacte exigée par la validation pour les champs effectivement fournis.
- Inspection visuelle : aperçus en mémoire, puis crops PNG natifs des poses 1 de locomotion Lurker et 6 de mort Spitter pour éviter de confondre une compression JPEG avec une trace rose. Aucun dérivé d'image n'a été écrit.

## Avis par candidat

### Lurker attack-r4 — amélioration réelle, réception encore à revoir

SHA-256 : `52e6787a3fd19c3ad03756e88e451543c5c564d09fc71724cc1b28fb6aeec586`.

La pose 4 est maintenant nettement suspendue au-dessus de la ligne des appuis de départ : le corps et les quatre membres ne donnent plus seulement l'impression de glisser au ras du sol. L'enchaînement anticipation/compression, poussée puis extension se lit mieux que dans le master actif. Huit sujets tournés vers la droite ; silhouette générale, dôme lisse, queue articulée et membres principaux restent reconnaissables.

Réserves : la suspension est surtout lisible en pose 4. La pose 5 redescend très bas ; les contacts et la durée de la réception sur les poses 5–7 doivent être revus en mouvement et avec une racine physique dédiée. Le rendu est plus lissé et certains volumes plus arrondis que dans l'ancienne planche ; ce n'est pas un changement de chorégraphie à pixels ou géométrie constants. La fidélité au modèle officiel n'est pas certifiée à 1:1.

Extraction stricte : huit poses, sans transfert requis. Avis : conserver comme candidat de bond, pas comme animation déjà acceptée.

### Lurker move-r2 — retouche de hanche utile mais pas une correction géométriquement neutre

SHA-256 : `654e75dec95a41dbc25565a8be2b69064018badf965b939cc884c4abb3fe9762`.

Sur la pose 1 native, la bande rose franche du haut de la cuisse/hanche est remplacée par une surface sombre cohérente avec la carapace. Les huit poses conservent globalement l'identité, la direction et le cycle du master. La différence de couleur ciblée est réellement visible, pas seulement décrite dans le prompt.

Réserves : quelques petits accents roses/violacés sont encore visibles près des articulations et sous le crâne. Certains sont des interstices de fond et ne doivent pas être rebouchés arbitrairement. Le redessin lisse aussi certains détails et déplace légèrement des contours ; les anciens points mesurés ne peuvent pas être réutilisés automatiquement.

Extraction stricte bloquée par les débordements nominaux. L'extracteur existant avec attribution de fragments prouve huit poses sans perte de pixels, sous les seuils inchangés de 90 % d'appartenance et 15 % de débordement. Cela ne constitue pas une acceptation de continuité. Avis : candidat de nettoyage valable, à examiner après détourage puis nouvelles mesures/racines.

### Spitter death-r2 — nettoyage partiel cohérent, contrôles de mort encore nécessaires

SHA-256 : `8ad2a5427c96791f13ec3a76d9cee8279e46de33737ea4edbea27b3208f1ca2e`.

Les grandes marques roses dans les silhouettes effondrées sont réduites, notamment à la hanche de la pose 6 observée à résolution native. La séquence conserve l'affaissement progressif, l'état final couché, les réservoirs jaune-vert du crâne, les épines dorsales et la queue. La distinction visuelle avec le Lurker est maintenue et correspond aux traits de la référence officielle enregistrée.

Réserves : des touches sombres violacées peuvent subsister autour du bassin et des articulations ; un examen du détourage sur fond sombre reste nécessaire. Les poses de départ ont déjà un angle plus frontal/trois-quarts que la vue de profil stricte souhaitée : la retouche couleur ne corrige pas ce défaut hérité. Les appuis et la stabilité du corps final ne sont pas validés en lecture animée. Ne pas présenter cette version comme une correction complète de perspective ou de physique.

Extraction stricte : huit poses. Avis : candidat de nettoyage utile, non prêt à remplacer le master calibré sans revue supplémentaire.

### Lurker attack-r3 — rejet confirmé

SHA-256 : `e68a2e391563764fb66494386eafa97a54fcc0e65ce3e6316c8dbb48501f4b39`.

Le damier gris/blanc est réellement peint dans l'image RGB, sans transparence native. L'extraction stricte et l'attribution de fragments sont toutes deux bloquées faute de matte prouvée. La détection automatique prudente le nomme « fond opaque non prouvé » plutôt que de certifier le damier ; l'examen visuel confirme le motif. À conserver uniquement comme version rejetée, jamais comme source d'animation ni comme fond à enlever par approximation.

## Condition avant remplacement

Ces candidats ont de nouveaux pixels et de nouveaux SHA-256. Les calibrages et ancrages actifs du lot 002 restent liés aux anciens masters. Chaque remplacement exige de nouvelles mesures comparables, de nouvelles racines par pose lorsque nécessaires, une normalisation vérifiée et une revue artistique distincte. Rien dans cette contre-revue ne réutilise ni ne revalide les anciens points sur les nouvelles images.
