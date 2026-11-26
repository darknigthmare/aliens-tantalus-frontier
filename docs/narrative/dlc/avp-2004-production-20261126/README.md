# AVP (2004) — bible de production et inventaire des manques

[Revenir à la fiche du DLC](../avp-2004.md) · [Index des campagnes](../../DLC_INDEX_20261126.md) · [Galerie des nouveaux visuels](GALLERY.md)

**Relevé du 26 novembre 2026.** Ce complément transforme les manques du DLC « Sous la glace » en fiches de production détaillées, avec leurs références, leur emplacement attendu et les preuves encore nécessaires. Le périmètre est **AVP — Alien vs. Predator (2004)**. Le film, ses variantes, les photographies de fabrication et les créations de gameplay gardent des qualifications distinctes.

La cible est la fidélité 1:1, suivie élément par élément. **Cette livraison ne certifie pas cette fidélité et n’ajoute pas les huit nouveaux PNG au rendu du jeu.** Elle livre une bible exploitable, un inventaire vérifiable et huit candidats artistiques conservés séparément. La présence d’une fiche ou d’une image ne ferme pas un manque de gameplay.

## Documents à utiliser

| Document | Ce qu’il apporte |
| --- | --- |
| [Inventaire du runtime](INVENTORY.md) | État des 250 lignes du catalogue, présence dans le code, alias visuels, salles, seuils et limites de la vérification. |
| [Inventaire structuré](runtime-inventory.json) | Données de présence et de raccord à réutiliser pour les prochaines passes ; référence du code examiné. |
| [Spécifications individuelles](PRODUCTION_SPECIFICATIONS.md) | 78 fiches de production, dont les 41 lignes absentes, incertaines ou seulement documentées et les 22 lignes d’armes du catalogue ; annexes des 44 lieux et 52 liaisons. |
| [Spécifications structurées](production-specs.json) | Apparence à relever, états, pièces à produire, propriétaire, scène, dépendances, inconnues et critères de réception. |
| [Références et canon](SOURCES.md) | 132 fiches de référence dans les huit catégories demandées ; sources primaires, divergences et points restant à identifier. |
| [Références structurées](canon-research.json) | 36 sources et 132 identifiants de référence, avec niveaux de confiance et règles de placement. |
| [Galerie](GALLERY.md) | Huit images individuelles, provenance de chaque génération et défauts concrets à reprendre. |
| [Manifeste du lot](manifest.json) | Octets, dimensions, SHA-256, blobs Git, prompts complets, références et neuf tentatives de génération. |

Les **132 fiches de référence**, les **78 fiches de production** et les **250 lignes du catalogue** répondent à des questions différentes et se recouvrent. Il ne faut pas les additionner ni les présenter comme 460 assets manquants.

## Couverture des huit catégories

| Catégorie demandée | Fiches de référence | Exigence de production |
| --- | ---: | --- |
| Personnages et créatures | 35 | Identité, silhouette, tenue, état narratif, blessures, équipement et poses propres à chaque scène. |
| Lieux | 33 | Fonction, état temporel, supports architecturaux, accès, obstacles et raccords attestés. |
| Armes | 16 | Familles de référence ; les 22 lignes du catalogue moteur sont traitées individuellement dans les spécifications. |
| Props et équipements | 28 | Géométrie, matériau, porteur, point d’attache, interaction et disponibilité chronologique. |
| Véhicules | 4 | Silhouette, livrée, train roulant ou patins, accès, transport et rôle réel dans le récit. |
| Vaisseaux et navire | 3 | Coque, volumes, zones visibles, approche, embarquement et ellipse de transport. |
| Terrain et atmosphère | 12 | Sols, glace, roche, neige, passages creusés, surfaces et variations liées à la scène. |
| Planète | 1 | Terre : orbite, géographie et cadrage. Aucune planète Predator n’est ajoutée pour remplir la catégorie. |

Les 78 spécifications détaillent les 41 lignes ouvertes, les 22 armes du catalogue, huit compléments (la lance de fin et sept véhicules ou structures déjà représentés), six familles de terrain et la Terre. Elles précisent les variantes à distinguer et les pièces à produire, sans compter chaque état comme un nouveau personnage.

## Manques réellement relevés

Le relevé porte sur la source 0.11.0 au commit `b0df1877a058f0818f96437fdfdea3f21ba7f415`. La bible commune et son lien depuis la campagne principale ont ensuite été fusionnés par la [PR #68](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/68), au commit `c7a0339f86e1de0c2209800a81506cddbc71d804`. Ce complément garde ce point de départ explicite.

| Statut du catalogue | Lignes | Lecture correcte |
| --- | ---: | --- |
| ACTIF | 35 | Fonction ou contenu actif déclaré ; la fidélité visuelle reste à vérifier. |
| SCENE | 113 | Représentation scénique, sans supposer un équipement utilisable. |
| LIEU | 19 | Lieu représenté ; une géométrie de jeu n’est pas un relevé métrique du film. |
| ABSENT | 19 | Présence physique non vérifiée dans la version examinée. |
| A_VERIFIER | 15 | Attribution, état ou représentation insuffisamment établis. |
| DOCUMENT | 7 | Documentation présente, sans équivalent de gameplay établi. |
| HORS_CAMPAGNE | 42 | Ligne hors de la campagne ; pas un objet à ajouter arbitrairement. |
| **Total** | **250** | **41 lignes prioritaires = 19 ABSENT + 15 A_VERIFIER + 7 DOCUMENT.** |

Les 19 absences comprennent des personnages secondaires, les équipes maritimes et anciennes, le chestburster standard, la horde ancienne, un vaisseau ancien et plusieurs séquences condensées ou non représentées. Chaque ligne garde son identifiant et sa raison dans les spécifications. Certaines identités viennent de textes ou de crédits sans correspondance visuelle établie : on ne peut pas en tirer honnêtement un visage ou un costume 1:1.

Le catalogue hérité comporte aussi des déclarations de confirmation dont la source n’est pas encore suffisamment précise : **236 lignes sur 250 utilisent un libellé générique de provenance ; 202 revendiquent une confirmation à l’écran dans les données historiques**. Ces textes sont conservés comme descriptions héritées, pas promus en validation nouvelle. Les 36 sources du dossier de référence servent à les requalifier progressivement.

### Alias à corriger avant de fermer les lignes

- Le couteau humain et la dague rituelle partagent actuellement un visuel.
- La lance offerte par l’Ancien et le combistick partagent un visuel, malgré leurs propriétaires et scènes distincts.
- Des contenants de glace et de prélèvements archéologiques utilisent la même représentation.
- Plusieurs états de Scar et de la Reine partagent leur SVG de base.
- Des armes humaines avec accessoires sont regroupées sous un même asset.
- Les engins de forage et leur console restent à vérifier ; le tunnel d’accès ne doit pas être attribué à tort à une foreuse humaine.

Les variantes doivent devenir des fichiers ou états réellement sélectionnables, avec leur propriétaire et leur scène. Changer uniquement un nom dans le codex ne résout pas l’alias.

## Lieux, portes et continuité spatiale

Le runtime examiné comprend **43 salles navigables et une scène de vaisseau en épilogue**, **104 faces de passage formant 52 liaisons réciproques**, 19 chapitres et 17 opérations. Le dossier distingue les lieux ou fonctions repris du film des annexes de gameplay originales.

Le contrôle statique a utilisé la collision réelle `AVP_CORE.blocked`, un rayon de 15 unités et un échantillonnage de 8 unités. Il a vérifié les destinations, les paires de seuils, les changements de niveau, la disponibilité des arrivées, les points d’interaction et la connexion des seuils dans chaque salle. Les 43 salles navigables sont accessibles dans le graphe depuis le Piper Maru. **Aucune anomalie statique n’a été relevée dans ce périmètre.**

Cela ne remplace pas une traversée animée des blocs mobiles, des gardes d’objectif, des changements de phase ou des rechargements de sauvegarde. L’épilogue du vaisseau n’a volontairement pas de porte de retour. Une transition maritime, une descente à la corde, une ellipse historique et un passage physique doivent garder leurs mécanismes propres.

Pour chaque nouveau raccord, la fiche impose :

1. Un mur, une coque, une façade, une gaine ou un appui visible correspondant à l’ouverture.
2. Un seuil et une arrivée dégagés, avec collision et point d’interaction cohérents.
3. Une hauteur, une orientation et un changement de niveau compatibles des deux côtés.
4. Une garde narrative explicite ; une porte fermée doit se lire comme telle.
5. Une vérification du franchissement, du retour lorsque prévu et de la sauvegarde/reprise.
6. Une capture du jeu réel à l’échelle d’usage, rapprochée de la référence de scène.

Les unités du moteur ne sont pas converties en mètres sans mesure authentifiée. Une façade générée avec une porte correctement encastrée prouve seulement une intention de dessin, pas la collision ni le raccord du niveau.

## Premier lot de visuels générés

**Huit PNG, 17 031 468 octets**, conservés avec leurs octets d’origine. Générateur : **imagegen intégré**. Chaque fichier représente un asset indépendant.

| Candidat | Référence et portée | État |
| --- | --- | --- |
| Chestburster standard humain | Photographie d’un prop ADI de production fournie à la génération. | Pose fixe candidate ; reste absent du runtime. |
| Piper Maru | Plan du film fourni ; modèle John Lee à comparer pour les détails reconstruits. | Coque candidate, pas de remplacement du navire existant. |
| Terre | Génération textuelle ; référence naturelle NASA documentée. | Candidat d’ambiance orbitale, pas une carte mesurée. |
| Paroi glaciaire | Génération textuelle ; module de matière original. | Raccords et répétition à tester. |
| Snowcat Weyland | Génération textuelle informée par la description de la miniature. | Géométrie et livrée à corriger par photographie. |
| Arche d’ossements | Génération textuelle informée par la scène. | Projection trop profonde pour un profil latéral strict. |
| Façade de station baleinière | Génération textuelle ; façade de travail originale. | Architecture cohérente à l’image, correspondance au film non établie. |
| Satellite Weyland | Génération textuelle ; maquette John Lee à utiliser pour la prochaine comparaison. | Géométrie et marges à reprendre. |

**Deux générations ont reçu une image de référence ; six sont textuelles.** Les sources lues mais non fournies comme pixels au générateur sont identifiées dans le manifeste. Aucun de ces candidats n’est déclaré prêt pour la production ni certifié 1:1.

Une tentative supplémentaire pour le combistick a été rejetée par le service de génération avant livraison. Aucun PNG d’arme n’est compté pour cette tentative. Le prompt et le refus sont conservés dans le manifeste ; les spécifications des armes sont néanmoins complètes pour les 22 lignes du catalogue.

Le lot distinct de reliefs de la [PR #74](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/74), relu au commit `7e565f05582f20a91274fca30e83962a430b9dd2`, conserve **cinq PNG candidats, 17 995 777 octets**. Il reste une publication séparée de ce lot et de son admission. Ne pas additionner les comptes de branches pour affirmer une activation dans la cumulative.

## Règles de fidélité qui gouvernent la suite

Lex, Scar, Celtic, Chopper, Grid et l’Ancien doivent conserver leurs apparences et états propres. Un masque, un canon ou un accessoire de mannequin ne prouve pas un transfert à Lex. La lance organique et le bouclier de Lex sont distincts du combistick métallique de fin.

La confrontation finale conserve le rôle de la chaîne et de la cuve. Les états de la Reine doivent suivre la séquence ; le Predalien reste dans l’épilogue. Les flashbacks, le prologue de 1904 et les transports ne deviennent pas des salles contemporaines reliées par une porte.

Les photographies de props conservés peuvent montrer des modifications après tournage ; un modèle de fabrication, une miniature, un concept, une réplique et un plan final sont des preuves différentes. Les détails inconnus restent à identifier. Le dossier privilégie les sources de fabrication StudioADI, MPC, John Lee et Propstore, puis confronte les plans et les variantes du film.

## Réception et intégration

Le lot est admis **comme source**, par neuf chemins de documents et huit chemins PNG exacts. Les deux répertoires sont exclus du build public. Les chaînes de reçus AVP, Aliens, Fiorina et de la bible commune sont préservées ; le script terminal ajoute seulement la succession correspondant aux deux gardes de distribution modifiées.

Les vérifications reproductibles sont :

```sh
node --test scripts/verify-dlc-audit-succession.mjs
npm run check:dlc:avp
npm run qa:dlc:avp
```

La suite de succession comporte désormais vingt tests, dont le contrôle des originaux PNG, de leurs empreintes et dimensions, de l’admission fermée et de leur exclusion du build. Les résultats d’exécution du commit complet sont consignés dans sa PR ; un succès de CI antérieur n’est pas transféré à ce lot.

Pour intégrer un candidat au jeu, il faut encore effectuer la comparaison visuelle, corriger ses écarts, choisir le pivot et l’échelle, définir les attaches et états, charger ses vrais pixels, observer son propriétaire dans la bonne scène puis vérifier les interactions concernées. La progression suivie est : **spécifié → généré → comparé → admis au runtime → chargé → raccordé → observé**. Le drapeau de fidélité dépend de la comparaison, pas de cette seule progression technique.
