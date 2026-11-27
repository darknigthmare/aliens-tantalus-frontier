# Références du lot Aliens (1986) V118

## Périmètre de fidélité

Le lot conserve les matériaux, la perspective, les couleurs et le traitement des PNG déjà publiés. Les huit accessoires répondent aux emplacements et aux supports définis dans les scènes V114. Les trois nouvelles vues de sentinelle dérivent de la vue latérale existante. **Ces correspondances ne constituent pas une certification 1:1 du film.**

Les PNG sont des images individuelles. La sélection se fait par secteurs de 45° ; sept directions disposent de PNG et la direction frontale conserve le dessin procédural après un refus du générateur. Ce n’est pas un cycle de rotation animé. Les objets restent des éléments de présentation des mécanismes existants ; aucun nouvel écran interactif, diagnostic médical ou simulateur de pression n’est ajouté.

## Sources de production consultées

### Sentinelle UA 571-C

[Propstore — Hand-Drawn UA 571-C Automated Sentry Gun Blueprint](https://propstore.com/product/aliens-1986/lot-18-hand-drawn-ua-571-c-automated-sentry-gun-blueprint)

La fiche identifie un dessin de production en vue latérale et décrit les annotations de la couronne de rotation, du mécanisme d’élévation et de l’imageur thermique. Elle confirme le type d’équipement et son assemblage général. Elle ne fournit pas un relevé métrique complet de ses quatre faces. Les vues générées sont donc des adaptations de la référence latérale du projet ; les faces cachées et la perspective ne sont pas présentées comme des mesures du plateau.

### Électronique portable de Bishop

[Propstore — Bishop’s Screen-Matched Light-Up Computer Terminal](https://propstoreauction.com/lot-details/index/catalog/525/lot/208688/7-Bishop-s-Lance-Henriksen-Screen-Matched-Light-Up-Computer-Terminal-ALIENS-1986)

La fiche décrit un accessoire de tournage avec coque plastique, carte électronique, moniteur, clavier, boutons et interrupteurs. Cette source sert à documenter le vocabulaire matériel de l’électronique du film. Elle **n’identifie pas** les six nouveaux terminaux de table et potelets comme des accessoires précis du tournage. Le terminal spécifique de Bishop reste son propre PNG existant.

### Projections de Gateway

[Propstore — Oversized Gateway Station Set Backdrop Transparency](https://propstoreauction.com/lot-details/index/catalog/496/lot/192501/451-Oversized-Gateway-Station-Set-Backdrop-Transparency-ALIENS-1986)

La fiche décrit des peintures photographiées, imprimées sur transparents et rétroéclairées dans les décors de Gateway, notamment la chambre de Ripley. Cette référence documente des surfaces rétroéclairées dans cet environnement. Elle ne prouve pas le cadre, la taille ou le contenu précis de l’écran de la commission. Le nouveau display suit le « mur de projection » déclaré par la scène V114.

Consultation des fiches : 26 novembre 2026. Les limites ci-dessus portent sur ce qui a effectivement été documenté ; aucun plan complet ou relevé photogrammétrique n’a été obtenu.

## Références locales préservées

Les références et leurs empreintes exactes figurent dans [generation-ledger.json](generation-ledger.json). Les sources principales sont :

| Référence | Usage V118 | Ce qui est conservé ou adapté |
| --- | --- | --- |
| `operations-console` | Six terminaux, écran mural | Matières industrielles, écrans cathodiques et commandes ; silhouette adaptée au support réel |
| `bishop-uplink` | Terminaux compacts | Construction électronique et détails ; pas de duplication de son rôle narratif |
| `supply-case-ammo-empty` V117 | Coffret de renforts plein | Même coffret ouvert ; ajout des trois plaques définies par la simulation |
| `sentry-idle-right` | Trois orientations | Profil d’équipement, matériaux et trépied ; changement de point de vue |

L’état vide du stock de renforts utilise directement `supply-case-ammo-empty`, sans nouvelle copie ni nouveau PNG.

## Sources du placement dans le jeu

- [Scènes V107](../../../modules/aliens-1986/v114/src/operation-scenes-v107.mjs) : stock de maintenance, table Operations.
- [Scènes V109](../../../modules/aliens-1986/v114/src/operation-scenes-v109.mjs) : quai et réserve médicale.
- [Scènes V112](../../../modules/aliens-1986/v114/src/operation-scenes-v112.mjs) : atelier optique et conduite technique.
- [Scènes V114](../../../modules/aliens-1986/v114/src/operation-scenes-v114.mjs) : Gateway et mess du Sulaco.
- [Stock de renforts V114](../../../modules/aliens-1986/v114/src/engineering-v114.mjs) : état de collecte et trois plaques.
- [Tactique V114](../../../modules/aliens-1986/v114/src/tactics-v114.mjs) et [renderer V114](../../../modules/aliens-1986/v114/preview/renderer.mjs) : orientation existante de la sentinelle et interpolation pendant la rotation.

Ces fichiers restent inchangés. Ils documentent les règles du projet, pas une correspondance métrique avec les accessoires du film.
