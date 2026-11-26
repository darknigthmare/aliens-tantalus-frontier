# Fleuve de la Douleur — bible de production détaillée

Révision 2026-11-26.2 · Base récupérée 0.9.0-candidate.1

Profils humains et créatures natifs, lieux, props et placements, équipements, mobilité, matériaux et mondes du DLC récupéré, avec les manquants identifiés dans les sources consultées.

## État de production

**278 fiches**, **78 PNG**, **47 salles**, **64 connexions**, **113 familles de props**, **547 placements** et **118 détails de phase**.

Définition, génération, intégration et validations restent distinctes. Aucun statut de fidélité 1:1 n’est certifié.

| Domaine | Fiches |
| --- | ---: |
| Personnages et créatures | 45 |
| Lieux | 52 |
| Armes et équipements | 27 |
| Props et mobilier | 111 |
| Véhicules | 5 |
| Vaisseaux | 5 |
| Terrains et matériaux | 31 |
| Planètes et satellites | 2 |

## Continuité

- **15 mars 2173** : Naissance de Newt ; cette variante se distingue de l’enfant de la campagne 2179. (R1).
- **2 avril 2173** : Scène collective après la naissance au centre de loisirs ; les tenues de cette époque ne valident pas automatiquement celles de 2179. (R1).
- **16 mai 2179** : Séquence de récupération spatiale de la navette de Ripley, distincte de la carte coloniale. (R1).
- **10 juin 2179** : Arrivée de Brackett ; Newt a six ans à cette date. (R1).
- **Campagne adaptée 2179** : Seize chapitres originaux dans le DLC récupéré. Dialogues, itinéraires et raccourcis ne constituent pas une reproduction scène par scène. (S1, R1, R5).

## Limites documentaires

- Le roman intégral et tous les plans officiels n’ont pas été consultés ; exhaustivité canonique complète non certifiée.
- PNG présent ne signifie pas animation complète, intégration dans tous les états ou fidélité 1:1.
- Les dimensions du modèle sont des choix du projet sauf preuve indépendante.
- La bible documente des contenus manquants sans les injecter au runtime.
- Les anciens rapports v0.9 restent historiques.
- Dans cette reconstruction distante, dimensions globales et tailles non relues sont null ; SHA-256 et ancrages proviennent du manifeste. Le générateur local peut les vérifier depuis les PNG.

## Règles de raccordement

- Porte rattachée à une structure visible.
- Approche et arrivée dégagées.
- Seuil et destination cohérents.
- Scènes spatiales séparées.
- Passage d’escorté et voie de civière préservés.

Le HTML propose filtres et aperçus. Le JSON conserve toutes les coordonnées, connexions et métadonnées.

## Personnages et créatures

### Demian Brackett

Identifiant : `rop:personnages:brackett`

Capitaine de la garnison, personnage jouable.

**Provenance :** identite_roman_apparence_partiellement_interpretee. Références : [R5](https://www.dreadcentral.com/wp-content/uploads/2014/11/RiverOfPainExcerpt.pdf)

**Apparence :** interprétation ; visage non décrit par les sources consultées Grade attesté ; traits du visage et uniforme précis restent à recouper.

**Chronologie :** Variante 2179. Un passage situé en 2173 ne valide pas automatiquement la tenue ou la scène de 2179.

**Jeu :** Jouable. Capitaine · garnison coloniale. Arme de base : M41A.

**Localisation :** Aire d’atterrissage ; Garage des prospecteurs ; Contrôle colonial ; Accès au processeur un ; Hangar scientifique

**Dimensions et ancrage :** {"modelHeight":87,"bodyScale":1.1,"units":"unites_logiques_du_rendu_pas_centimetres"}

**État :** génération = png_present ; intégration = png_selectif_repli_natif_pour_etats_absents ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [brackett-stowed-right](../assets/brackett-stowed-right.png) — dimensions globales non relues, pose stowed, ancre 500/1516

**À compléter :**

- Cycles de marche/course et transitions complets absents du registre PNG.
- Accroupissement, interaction, blessure, franchissement et actions d’arme applicables à produire puis raccorder.
- Comparer visage, costume, proportions et détails asymétriques aux références de la période.

**Contrôles attendus :**

- Un PNG entier par pose, avec la bonne identité.
- Conserver pieds, proportions et attaches d’équipement.
- Vérifier les états animés et la sauvegarde/reprise.

### Julisa Paris

Identifiant : `rop:personnages:paris`

Lieutenant Paris, personnage jouable.

**Provenance :** identite_roman_apparence_partiellement_interpretee. Références : [R5](https://www.dreadcentral.com/wp-content/uploads/2014/11/RiverOfPainExcerpt.pdf)

**Apparence :** interprétation ; aucune ressemblance avec une comédienne audio revendiquée Conserver grade et identité propres ; un visage de comédienne audio ne constitue pas une preuve.

**Chronologie :** Variante 2179. Un passage situé en 2173 ne valide pas automatiquement la tenue ou la scène de 2179.

**Jeu :** Jouable. Marine · garnison coloniale. Arme de base : M41A.

**Localisation :** Aire d’atterrissage ; Infirmerie ; Laboratoire de la Compagnie

**Dimensions et ancrage :** {"modelHeight":82,"bodyScale":0.91,"units":"unites_logiques_du_rendu_pas_centimetres"}

**État :** génération = png_present ; intégration = png_selectif_repli_natif_pour_etats_absents ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [paris-stowed-right](../assets/paris-stowed-right.png) — dimensions globales non relues, pose stowed, ancre 490/1523

**À compléter :**

- Cycles de marche/course et transitions complets absents du registre PNG.
- Accroupissement, interaction, blessure, franchissement et actions d’arme applicables à produire puis raccorder.
- Comparer visage, costume, proportions et détails asymétriques aux références de la période.

**Contrôles attendus :**

- Un PNG entier par pose, avec la bonne identité.
- Conserver pieds, proportions et attaches d’équipement.
- Vérifier les états animés et la sauvegarde/reprise.

### Anne Jorden

Identifiant : `rop:personnages:anne`

Prospectrice, mère de Newt.

**Provenance :** identite_roman_apparence_partiellement_interpretee. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** cheveux bouclés attestés ; teinte et tenue interprétées Cheveux bouclés documentés ; équipement et tenue de campagne à préciser.

**Chronologie :** Variante 2179. Un passage situé en 2173 ne valide pas automatiquement la tenue ou la scène de 2179.

**Jeu :** Jouable. Prospectrice · Hadley’s Hope. Arme de base : aucune.

**Localisation :** Logement des Jorden ; Bureau des prospecteurs ; Infirmerie

**Dimensions et ancrage :** {"modelHeight":79,"bodyScale":1,"units":"unites_logiques_du_rendu_pas_centimetres"}

**État :** génération = png_present ; intégration = png_selectif_repli_natif_pour_etats_absents ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [anne-idle-right](../assets/anne-idle-right.png) — dimensions globales non relues, pose idle, ancre 517/1532

**À compléter :**

- Cycles de marche/course et transitions complets absents du registre PNG.
- Accroupissement, interaction, blessure, franchissement et actions d’arme applicables à produire puis raccorder.
- Comparer visage, costume, proportions et détails asymétriques aux références de la période.

**Contrôles attendus :**

- Un PNG entier par pose, avec la bonne identité.
- Conserver pieds, proportions et attaches d’équipement.
- Vérifier les états animés et la sauvegarde/reprise.

### Rebecca « Newt » Jorden

Identifiant : `rop:personnages:newt`

Rebecca Jorden, enfant jouable dans les conduits.

**Provenance :** identite_roman_apparence_partiellement_interpretee. Références : [R3](https://necaonline.com/2016/08/aliens-30th-anniversary-rescuing-newt-deluxe-action-figure-2-pack/), [S1](https://titanbooks.com/6486-alien-river-of-pain-book-3/), [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** silhouette inspirée du film/licence ; pas de casque de Hicks dans cette époque Tenue et salissures selon phase. Le casque de Hicks appartient à une scène ultérieure, exclue de cette variante.

**Chronologie :** Six ans en juin 2179. Distinguer cette variante du nouveau-né de 2173.

**Jeu :** Jouable. Habitat · conduits. Arme de base : aucune.

**Localisation :** Bureau des prospecteurs ; Logement des Jorden ; Cache des conduits

**Dimensions et ancrage :** {"modelHeight":51,"bodyScale":0.78,"units":"unites_logiques_du_rendu_pas_centimetres"}

**État :** génération = png_present ; intégration = png_selectif_repli_natif_pour_etats_absents ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [newt-idle-right](../assets/newt-idle-right.png) — dimensions globales non relues, pose idle, ancre 453/1766

**À compléter :**

- Cycles de marche/course et transitions complets absents du registre PNG.
- Accroupissement, interaction, blessure, franchissement et actions d’arme applicables à produire puis raccorder.
- Comparer visage, costume, proportions et détails asymétriques aux références de la période.

**Contrôles attendus :**

- Un PNG entier par pose, avec la bonne identité.
- Conserver pieds, proportions et attaches d’équipement.
- Vérifier les états animés et la sauvegarde/reprise.

### Russ Jorden

Identifiant : `rop:personnages:russ`

Russell « Russ » Jorden, prospecteur.

**Provenance :** identite_roman_apparence_partiellement_interpretee. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/), [S1](https://titanbooks.com/6486-alien-river-of-pain-book-3/)

**Apparence :** apparence fatiguée attestée ; détails du visage interprétés

**Chronologie :** Variante 2179. Un passage situé en 2173 ne valide pas automatiquement la tenue ou la scène de 2179.

**Jeu :** Personnage de scène/contact ; un portrait ne crée pas une campagne jouable.

**Localisation :** Logement des Jorden

**Dimensions et ancrage :** {"modelHeight":86,"bodyScale":1.08,"units":"unites_logiques_du_rendu_pas_centimetres"}

**État :** génération = png_present ; intégration = png_selectif_repli_natif_pour_etats_absents ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [russ-idle-right](../assets/russ-idle-right.png) — dimensions globales non relues, pose idle, ancre 500/1529

**À compléter :**

- Variantes intacte et retour médical à établir sans confondre leurs événements.
- Cycles de marche/course et transitions complets absents du registre PNG.
- Accroupissement, interaction, blessure, franchissement et actions d’arme applicables à produire puis raccorder.
- Comparer visage, costume, proportions et détails asymétriques aux références de la période.

**Contrôles attendus :**

- Un PNG entier par pose, avec la bonne identité.
- Conserver pieds, proportions et attaches d’équipement.
- Vérifier les états animés et la sauvegarde/reprise.

### Dr Theodora Komiskey

Identifiant : `rop:personnages:komiskey`

Médecin de la colonie.

**Provenance :** identite_roman_apparence_partiellement_interpretee. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** silhouette petite et trapue, boucles brunes et yeux bleus attestés ; blouse interprétée Silhouette petite et trapue, boucles brunes et yeux bleus à conserver.

**Chronologie :** Variante 2179. Un passage situé en 2173 ne valide pas automatiquement la tenue ou la scène de 2179.

**Jeu :** Personnage de scène/contact ; un portrait ne crée pas une campagne jouable.

**Localisation :** Aire d’atterrissage

**Dimensions et ancrage :** {"modelHeight":71,"bodyScale":1.42,"units":"unites_logiques_du_rendu_pas_centimetres"}

**État :** génération = png_present ; intégration = png_selectif_repli_natif_pour_etats_absents ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [komiskey-idle-right](../assets/komiskey-idle-right.png) — dimensions globales non relues, pose idle, ancre 484/1533

**À compléter :**

- Cycles de marche/course et transitions complets absents du registre PNG.
- Accroupissement, interaction, blessure, franchissement et actions d’arme applicables à produire puis raccorder.
- Comparer visage, costume, proportions et détails asymétriques aux références de la période.

**Contrôles attendus :**

- Un PNG entier par pose, avec la bonne identité.
- Conserver pieds, proportions et attaches d’équipement.
- Vérifier les états animés et la sauvegarde/reprise.

### Luisa

Identifiant : `rop:personnages:luisa`

Enfant distincte de Newt, suivie avec une synthèse secondaire.

**Provenance :** identite_roman_apparence_partiellement_interpretee. Références : [S4](https://www.avpcentral.com/demian-brackett)

**Apparence :** enfant distincte de Newt ; apparence provisoire non attestée

**Chronologie :** Variante 2179. Un passage situé en 2173 ne valide pas automatiquement la tenue ou la scène de 2179.

**Jeu :** Personnage de scène/contact ; un portrait ne crée pas une campagne jouable.

**Localisation :** Bureau des prospecteurs

**Dimensions et ancrage :** {"modelHeight":53,"bodyScale":0.78,"units":"unites_logiques_du_rendu_pas_centimetres"}

**État :** génération = png_present ; intégration = png_selectif_repli_natif_pour_etats_absents ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [luisa-idle-right](../assets/luisa-idle-right.png) — dimensions globales non relues, pose idle, ancre 510/1532

**À compléter :**

- Recouper apparence et scènes sur une source primaire du roman.
- Cycles de marche/course et transitions complets absents du registre PNG.
- Accroupissement, interaction, blessure, franchissement et actions d’arme applicables à produire puis raccorder.
- Comparer visage, costume, proportions et détails asymétriques aux références de la période.

**Contrôles attendus :**

- Un PNG entier par pose, avec la bonne identité.
- Conserver pieds, proportions et attaches d’équipement.
- Vérifier les états animés et la sauvegarde/reprise.

### Colon du bloc C

Identifiant : `rop:personnages:civilian`

Colon original des interactions locales.

**Provenance :** creation_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** personnage de gameplay

**Chronologie :** Variante 2179. Un passage situé en 2173 ne valide pas automatiquement la tenue ou la scène de 2179.

**Jeu :** Personnage de scène/contact ; un portrait ne crée pas une campagne jouable.

**Localisation :** Réfectoire

**Dimensions et ancrage :** {"modelHeight":80,"bodyScale":1,"units":"unites_logiques_du_rendu_pas_centimetres"}

**État :** génération = png_present ; intégration = png_selectif_repli_natif_pour_etats_absents ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [civilian-idle-right](../assets/civilian-idle-right.png) — dimensions globales non relues, pose idle, ancre 490/1520

**À compléter :**

- Cycles de marche/course et transitions complets absents du registre PNG.
- Accroupissement, interaction, blessure, franchissement et actions d’arme applicables à produire puis raccorder.
- Comparer visage, costume, proportions et détails asymétriques aux références de la période.

**Contrôles attendus :**

- Un PNG entier par pose, avec la bonne identité.
- Conserver pieds, proportions et attaches d’équipement.
- Vérifier les états animés et la sauvegarde/reprise.

### Dr Mori

Identifiant : `rop:personnages:mori`

Scientifique de la recherche de la Compagnie.

**Provenance :** identite_roman_apparence_partiellement_interpretee. Références : [R5](https://www.dreadcentral.com/wp-content/uploads/2014/11/RiverOfPainExcerpt.pdf)

**Apparence :** silhouette provisoire, visage non authentifié

**Chronologie :** Variante 2179. Un passage situé en 2173 ne valide pas automatiquement la tenue ou la scène de 2179.

**Jeu :** Personnage de scène/contact ; un portrait ne crée pas une campagne jouable.

**Localisation :** Hangar scientifique

**Dimensions et ancrage :** {"modelHeight":81,"bodyScale":0.9,"units":"unites_logiques_du_rendu_pas_centimetres"}

**État :** génération = png_present ; intégration = png_selectif_repli_natif_pour_etats_absents ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [mori-idle-right](../assets/mori-idle-right.png) — dimensions globales non relues, pose idle, ancre 507/1529

**À compléter :**

- Préserver son rôle spécifique ; ne pas fusionner avec Komiskey.
- Cycles de marche/course et transitions complets absents du registre PNG.
- Accroupissement, interaction, blessure, franchissement et actions d’arme applicables à produire puis raccorder.
- Comparer visage, costume, proportions et détails asymétriques aux références de la période.

**Contrôles attendus :**

- Un PNG entier par pose, avec la bonne identité.
- Conserver pieds, proportions et attaches d’équipement.
- Vérifier les états animés et la sauvegarde/reprise.

### Tim Jorden

Identifiant : `rop:personnages:tim`

Frère de Newt, famille Jorden.

**Provenance :** identite_roman_apparence_partiellement_interpretee. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Enfant de la famille Jorden, attesté ; tenue et visage interprétés.

**Chronologie :** Variante 2179. Un passage situé en 2173 ne valide pas automatiquement la tenue ou la scène de 2179.

**Jeu :** Personnage de scène/contact ; un portrait ne crée pas une campagne jouable.

**Localisation :** Logement des Jorden

**Dimensions et ancrage :** {"modelHeight":61,"bodyScale":0.85,"units":"unites_logiques_du_rendu_pas_centimetres"}

**État :** génération = png_present ; intégration = png_selectif_repli_natif_pour_etats_absents ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [tim-idle-right](../assets/tim-idle-right.png) — dimensions globales non relues, pose idle, ancre 514/1524

**À compléter :**

- Cycles de marche/course et transitions complets absents du registre PNG.
- Accroupissement, interaction, blessure, franchissement et actions d’arme applicables à produire puis raccorder.
- Comparer visage, costume, proportions et détails asymétriques aux références de la période.

**Contrôles attendus :**

- Un PNG entier par pose, avec la bonne identité.
- Conserver pieds, proportions et attaches d’équipement.
- Vérifier les états animés et la sauvegarde/reprise.

### Al Simpson

Identifiant : `rop:personnages:simpson`

Administrateur de la colonie.

**Provenance :** identite_roman_apparence_partiellement_interpretee. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/), [R5](https://www.dreadcentral.com/wp-content/uploads/2014/11/RiverOfPainExcerpt.pdf)

**Apparence :** Administrateur attesté ; dialogue, tenue et poste local interprétés.

**Chronologie :** Variante 2179. Un passage situé en 2173 ne valide pas automatiquement la tenue ou la scène de 2179.

**Jeu :** Personnage de scène/contact ; un portrait ne crée pas une campagne jouable.

**Localisation :** Contrôle colonial

**Dimensions et ancrage :** {"modelHeight":84,"bodyScale":1.16,"units":"unites_logiques_du_rendu_pas_centimetres"}

**État :** génération = png_present ; intégration = png_selectif_repli_natif_pour_etats_absents ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [simpson-idle-right](../assets/simpson-idle-right.png) — dimensions globales non relues, pose idle, ancre 491/1530

**À compléter :**

- Comparer la scène administrative à l’extrait de 2179.
- Cycles de marche/course et transitions complets absents du registre PNG.
- Accroupissement, interaction, blessure, franchissement et actions d’arme applicables à produire puis raccorder.
- Comparer visage, costume, proportions et détails asymétriques aux références de la période.

**Contrôles attendus :**

- Un PNG entier par pose, avec la bonne identité.
- Conserver pieds, proportions et attaches d’équipement.
- Vérifier les états animés et la sauvegarde/reprise.

### Greg Hansard

Identifiant : `rop:personnages:hansard`

Ingénieur en chef cité dans l’extrait.

**Provenance :** identite_roman_apparence_partiellement_interpretee. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Ingénieur en chef attesté ; dialogue, tenue et poste local interprétés.

**Chronologie :** Variante 2179. Un passage situé en 2173 ne valide pas automatiquement la tenue ou la scène de 2179.

**Jeu :** Personnage de scène/contact ; un portrait ne crée pas une campagne jouable.

**Localisation :** Distribution électrique

**Dimensions et ancrage :** {"modelHeight":86,"bodyScale":1.05,"units":"unites_logiques_du_rendu_pas_centimetres"}

**État :** génération = png_present ; intégration = png_selectif_repli_natif_pour_etats_absents ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [hansard-idle-right](../assets/hansard-idle-right.png) — dimensions globales non relues, pose idle, ancre 509/1528

**À compléter :**

- Cycles de marche/course et transitions complets absents du registre PNG.
- Accroupissement, interaction, blessure, franchissement et actions d’arme applicables à produire puis raccorder.
- Comparer visage, costume, proportions et détails asymétriques aux références de la période.

**Contrôles attendus :**

- Un PNG entier par pose, avec la bonne identité.
- Conserver pieds, proportions et attaches d’équipement.
- Vérifier les états animés et la sauvegarde/reprise.

### Joel

Identifiant : `rop:personnages:joel`

Infirmier de la scène médicale.

**Provenance :** identite_roman_apparence_partiellement_interpretee. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Infirmier mince attesté ; visage, tenue et état en 2179 interprétés. Mince et à peau sombre dans l’extrait ; la palette historique #be9f85 ne valide pas cette caractéristique.

**Chronologie :** Variante 2179. Un passage situé en 2173 ne valide pas automatiquement la tenue ou la scène de 2179.

**Jeu :** Personnage de scène/contact ; un portrait ne crée pas une campagne jouable.

**Localisation :** Infirmerie

**Dimensions et ancrage :** {"modelHeight":86,"bodyScale":0.82,"units":"unites_logiques_du_rendu_pas_centimetres"}

**État :** génération = png_present ; intégration = png_selectif_repli_natif_pour_etats_absents ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [joel-idle-right](../assets/joel-idle-right.png) — dimensions globales non relues, pose idle, ancre 500/1531

**À compléter :**

- Revoir modèle et PNG sur ce point. Cette fiche ne retouche pas les octets historiques.
- Cycles de marche/course et transitions complets absents du registre PNG.
- Accroupissement, interaction, blessure, franchissement et actions d’arme applicables à produire puis raccorder.
- Comparer visage, costume, proportions et détails asymétriques aux références de la période.

**Contrôles attendus :**

- Un PNG entier par pose, avec la bonne identité.
- Conserver pieds, proportions et attaches d’équipement.
- Vérifier les états animés et la sauvegarde/reprise.

### Bronagh Flaherty

Identifiant : `rop:personnages:bronagh`

Cuisinière de la colonie citée dans l’extrait.

**Provenance :** identite_roman_apparence_partiellement_interpretee. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Cuisinière attestée ; visage, tenue et état en 2179 interprétés.

**Chronologie :** Variante 2179. Un passage situé en 2173 ne valide pas automatiquement la tenue ou la scène de 2179.

**Jeu :** Personnage de scène/contact ; un portrait ne crée pas une campagne jouable.

**Localisation :** Réfectoire

**Dimensions et ancrage :** {"modelHeight":79,"bodyScale":1.1,"units":"unites_logiques_du_rendu_pas_centimetres"}

**État :** génération = png_present ; intégration = png_selectif_repli_natif_pour_etats_absents ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [bronagh-idle-right](../assets/bronagh-idle-right.png) — dimensions globales non relues, pose idle, ancre 500/1535

**À compléter :**

- Cycles de marche/course et transitions complets absents du registre PNG.
- Accroupissement, interaction, blessure, franchissement et actions d’arme applicables à produire puis raccorder.
- Comparer visage, costume, proportions et détails asymétriques aux références de la période.

**Contrôles attendus :**

- Un PNG entier par pose, avec la bonne identité.
- Conserver pieds, proportions et attaches d’équipement.
- Vérifier les états animés et la sauvegarde/reprise.

### Iona Vale

Identifiant : `rop:personnages:vale`

Maintenance de l’habitat

**Provenance :** creation_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Profil original : coiffure short, outil tools, palette #658b89. Aucune identité de roman revendiquée.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Résident mobile, phases 0 à 1. Échanges : Votre poste et votre matériel ; Les passages du secteur.

**Localisation :** Coursive résidentielle

**Dimensions et ancrage :** {"modelHeight":93,"units":"unites_logiques_du_rendu"}

**État :** génération = png_present ; intégration = png_idle_selectif_repli_natif_en_mouvement ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [vale-idle-right](../assets/vale-idle-right.png) — dimensions globales non relues, pose idle, ancre 510/1548

**À compléter :**

- Marche et transitions vers le refuge à produire ; seul état fixe en PNG.
- Posture de peur et interaction métier sans double outil.

**Contrôles attendus :**

- Conserver le bon accessoire ; retirer son doublon natif uniquement quand le PNG est dessiné.
- Nom et chemin restent propres au résident.

### Malik Rhee

Identifiant : `rop:personnages:rhee`

Cuisine collective

**Provenance :** creation_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Profil original : coiffure cap, outil mug, palette #ab9066. Aucune identité de roman revendiquée.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Résident mobile, phases 0 à 1. Échanges : Votre poste et votre matériel ; Les passages du secteur.

**Localisation :** Réfectoire

**Dimensions et ancrage :** {"modelHeight":96,"units":"unites_logiques_du_rendu"}

**État :** génération = png_present ; intégration = png_idle_selectif_repli_natif_en_mouvement ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [rhee-idle-right](../assets/rhee-idle-right.png) — dimensions globales non relues, pose idle, ancre 490/1533

**À compléter :**

- Marche et transitions vers le refuge à produire ; seul état fixe en PNG.
- Posture de peur et interaction métier sans double outil.

**Contrôles attendus :**

- Conserver le bon accessoire ; retirer son doublon natif uniquement quand le PNG est dessiné.
- Nom et chemin restent propres au résident.

### Vera Arden

Identifiant : `rop:personnages:arden`

Soins de proximité

**Provenance :** creation_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Profil original : coiffure tied, outil tablet, palette #b2c6ba. Aucune identité de roman revendiquée.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Résident mobile, phases 0 à 1. Échanges : Votre poste et votre matériel ; Les passages du secteur.

**Localisation :** Infirmerie

**Dimensions et ancrage :** {"modelHeight":99,"units":"unites_logiques_du_rendu"}

**État :** génération = png_present ; intégration = png_idle_selectif_repli_natif_en_mouvement ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [arden-idle-right](../assets/arden-idle-right.png) — dimensions globales non relues, pose idle, ancre 477.5/1520

**À compléter :**

- Marche et transitions vers le refuge à produire ; seul état fixe en PNG.
- Posture de peur et interaction métier sans double outil.

**Contrôles attendus :**

- Conserver le bon accessoire ; retirer son doublon natif uniquement quand le PNG est dessiné.
- Nom et chemin restent propres au résident.

### Arun Becker

Identifiant : `rop:personnages:becker`

Archivage des relevés

**Provenance :** creation_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Profil original : coiffure short, outil tablet, palette #7385a0. Aucune identité de roman revendiquée.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Résident mobile, phases 0 à 1. Échanges : Votre poste et votre matériel ; Les passages du secteur.

**Localisation :** Salle des archives

**Dimensions et ancrage :** {"modelHeight":102,"units":"unites_logiques_du_rendu"}

**État :** génération = png_present ; intégration = png_idle_selectif_repli_natif_en_mouvement ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [becker-idle-right](../assets/becker-idle-right.png) — dimensions globales non relues, pose idle, ancre 472.5/1521

**À compléter :**

- Marche et transitions vers le refuge à produire ; seul état fixe en PNG.
- Posture de peur et interaction métier sans double outil.

**Contrôles attendus :**

- Conserver le bon accessoire ; retirer son doublon natif uniquement quand le PNG est dessiné.
- Nom et chemin restent propres au résident.

### Solène Ferris

Identifiant : `rop:personnages:ferris`

Manutention du fret

**Provenance :** creation_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Profil original : coiffure cap, outil tools, palette #b59258. Aucune identité de roman revendiquée.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Résident mobile, phases 0 à 1. Échanges : Votre poste et votre matériel ; Les passages du secteur.

**Localisation :** Magasin de fret

**Dimensions et ancrage :** {"modelHeight":93,"units":"unites_logiques_du_rendu"}

**État :** génération = png_present ; intégration = png_idle_selectif_repli_natif_en_mouvement ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [ferris-idle-right](../assets/ferris-idle-right.png) — dimensions globales non relues, pose idle, ancre 495/1526

**À compléter :**

- Marche et transitions vers le refuge à produire ; seul état fixe en PNG.
- Posture de peur et interaction métier sans double outil.

**Contrôles attendus :**

- Conserver le bon accessoire ; retirer son doublon natif uniquement quand le PNG est dessiné.
- Nom et chemin restent propres au résident.

### Nils Corban

Identifiant : `rop:personnages:corban`

Relais des transmissions

**Provenance :** creation_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Profil original : coiffure short, outil tablet, palette #648995. Aucune identité de roman revendiquée.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Résident mobile, phases 0 à 1. Échanges : Votre poste et votre matériel ; Les passages du secteur.

**Localisation :** Relais de communications

**Dimensions et ancrage :** {"modelHeight":96,"units":"unites_logiques_du_rendu"}

**État :** génération = png_present ; intégration = png_idle_selectif_repli_natif_en_mouvement ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [corban-idle-right](../assets/corban-idle-right.png) — dimensions globales non relues, pose idle, ancre 504.5/1531

**À compléter :**

- Marche et transitions vers le refuge à produire ; seul état fixe en PNG.
- Posture de peur et interaction métier sans double outil.

**Contrôles attendus :**

- Conserver le bon accessoire ; retirer son doublon natif uniquement quand le PNG est dessiné.
- Nom et chemin restent propres au résident.

### Ezra Hale

Identifiant : `rop:personnages:hale`

Atelier des prospecteurs

**Provenance :** creation_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Profil original : coiffure cap, outil tools, palette #aa7961. Aucune identité de roman revendiquée.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Résident mobile, phases 0 à 1. Échanges : Votre poste et votre matériel ; Les passages du secteur.

**Localisation :** Garage des prospecteurs

**Dimensions et ancrage :** {"modelHeight":99,"units":"unites_logiques_du_rendu"}

**État :** génération = png_present ; intégration = png_idle_selectif_repli_natif_en_mouvement ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [hale-idle-right](../assets/hale-idle-right.png) — dimensions globales non relues, pose idle, ancre 490.5/1504

**À compléter :**

- Marche et transitions vers le refuge à produire ; seul état fixe en PNG.
- Posture de peur et interaction métier sans double outil.

**Contrôles attendus :**

- Conserver le bon accessoire ; retirer son doublon natif uniquement quand le PNG est dessiné.
- Nom et chemin restent propres au résident.

### Mei Doran

Identifiant : `rop:personnages:doran`

Maintenance biomédicale

**Provenance :** creation_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Profil original : coiffure tied, outil tablet, palette #85a59b. Aucune identité de roman revendiquée.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Résident mobile, phases 0 à 1. Échanges : Votre poste et votre matériel ; Les passages du secteur.

**Localisation :** Atelier biomédical

**Dimensions et ancrage :** {"modelHeight":102,"units":"unites_logiques_du_rendu"}

**État :** génération = png_present ; intégration = png_idle_selectif_repli_natif_en_mouvement ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [doran-idle-right](../assets/doran-idle-right.png) — dimensions globales non relues, pose idle, ancre 470.5/1499

**À compléter :**

- Marche et transitions vers le refuge à produire ; seul état fixe en PNG.
- Posture de peur et interaction métier sans double outil.

**Contrôles attendus :**

- Conserver le bon accessoire ; retirer son doublon natif uniquement quand le PNG est dessiné.
- Nom et chemin restent propres au résident.

### Lina Sato

Identifiant : `rop:personnages:sato`

Lingerie de service

**Provenance :** creation_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Profil original : coiffure tied, outil linen, palette #958799. Aucune identité de roman revendiquée.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Résident mobile, phases 0 à 1. Échanges : Votre poste et votre matériel ; Les passages du secteur.

**Localisation :** Buanderie

**Dimensions et ancrage :** {"modelHeight":93,"units":"unites_logiques_du_rendu"}

**État :** génération = png_present ; intégration = png_idle_selectif_repli_natif_en_mouvement ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [sato-idle-right](../assets/sato-idle-right.png) — dimensions globales non relues, pose idle, ancre 485.5/1518

**À compléter :**

- Marche et transitions vers le refuge à produire ; seul état fixe en PNG.
- Posture de peur et interaction métier sans double outil.

**Contrôles attendus :**

- Conserver le bon accessoire ; retirer son doublon natif uniquement quand le PNG est dessiné.
- Nom et chemin restent propres au résident.

### Tomas Bell

Identifiant : `rop:personnages:bell`

Entretien des loisirs

**Provenance :** creation_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Profil original : coiffure short, outil tools, palette #82985e. Aucune identité de roman revendiquée.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Résident mobile, phases 0 à 1. Échanges : Votre poste et votre matériel ; Les passages du secteur.

**Localisation :** Centre de loisirs

**Dimensions et ancrage :** {"modelHeight":96,"units":"unites_logiques_du_rendu"}

**État :** génération = png_present ; intégration = png_idle_selectif_repli_natif_en_mouvement ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [bell-idle-right](../assets/bell-idle-right.png) — dimensions globales non relues, pose idle, ancre 475/1519

**À compléter :**

- Marche et transitions vers le refuge à produire ; seul état fixe en PNG.
- Posture de peur et interaction métier sans double outil.

**Contrôles attendus :**

- Conserver le bon accessoire ; retirer son doublon natif uniquement quand le PNG est dessiné.
- Nom et chemin restent propres au résident.

### Rosa Kent

Identifiant : `rop:personnages:kent`

Accueil des arrivants

**Provenance :** creation_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Profil original : coiffure tied, outil tablet, palette #9b8464. Aucune identité de roman revendiquée.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Résident mobile, phases 0 à 1. Échanges : Votre poste et votre matériel ; Les passages du secteur.

**Localisation :** Coursive centrale

**Dimensions et ancrage :** {"modelHeight":99,"units":"unites_logiques_du_rendu"}

**État :** génération = png_present ; intégration = png_idle_selectif_repli_natif_en_mouvement ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [kent-idle-right](../assets/kent-idle-right.png) — dimensions globales non relues, pose idle, ancre 502/1514

**À compléter :**

- Marche et transitions vers le refuge à produire ; seul état fixe en PNG.
- Posture de peur et interaction métier sans double outil.

**Contrôles attendus :**

- Conserver le bon accessoire ; retirer son doublon natif uniquement quand le PNG est dessiné.
- Nom et chemin restent propres au résident.

### Anton Voss

Identifiant : `rop:personnages:voss`

Relevés des prospecteurs

**Provenance :** creation_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Profil original : coiffure short, outil tablet, palette #879aa3. Aucune identité de roman revendiquée.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Résident mobile, phases 0 à 1. Échanges : Votre poste et votre matériel ; Les passages du secteur.

**Localisation :** Bureau des prospecteurs

**Dimensions et ancrage :** {"modelHeight":102,"units":"unites_logiques_du_rendu"}

**État :** génération = png_present ; intégration = png_idle_selectif_repli_natif_en_mouvement ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [voss-idle-right](../assets/voss-idle-right.png) — dimensions globales non relues, pose idle, ancre 487/1513

**À compléter :**

- Marche et transitions vers le refuge à produire ; seul état fixe en PNG.
- Posture de peur et interaction métier sans double outil.

**Contrôles attendus :**

- Conserver le bon accessoire ; retirer son doublon natif uniquement quand le PNG est dessiné.
- Nom et chemin restent propres au résident.

### Otto Finch

Identifiant : `rop:personnages:otto-finch`

Prospecteur, l’un des frères Finch.

**Provenance :** personnage_atteste_extrait_roman. Références : [R5](https://www.dreadcentral.com/wp-content/uploads/2014/11/RiverOfPainExcerpt.pdf)

**Apparence :** Visage, costume précis et couleurs à documenter.

**Chronologie :** Conserver scène, époque et rôle du roman ; aucune insertion automatique dans la colonie.

**Jeu :** Fiche de production manquante ; ni profil ni spawn ajouté par la bible.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Profil, portrait individuel et états propres à la scène à produire.
- Placement, interactions et séquence à intégrer après validation des sources.

**Contrôles attendus :**

- Ne pas utiliser un comédien de doublage comme visage canonique sans preuve.
- Préserver grade, métier, époque et localisation.

### Curtis Finch

Identifiant : `rop:personnages:curtis-finch`

Prospecteur distinct d’Otto.

**Provenance :** personnage_atteste_extrait_roman. Références : [R5](https://www.dreadcentral.com/wp-content/uploads/2014/11/RiverOfPainExcerpt.pdf)

**Apparence :** Visage, costume précis et couleurs à documenter.

**Chronologie :** Conserver scène, époque et rôle du roman ; aucune insertion automatique dans la colonie.

**Jeu :** Fiche de production manquante ; ni profil ni spawn ajouté par la bible.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Profil, portrait individuel et états propres à la scène à produire.
- Placement, interactions et séquence à intégrer après validation des sources.

**Contrôles attendus :**

- Ne pas utiliser un comédien de doublage comme visage canonique sans preuve.
- Préserver grade, métier, époque et localisation.

### Sergent Coughlin

Identifiant : `rop:personnages:coughlin`

Marine de la garnison.

**Provenance :** personnage_atteste_extrait_roman. Références : [R5](https://www.dreadcentral.com/wp-content/uploads/2014/11/RiverOfPainExcerpt.pdf)

**Apparence :** Petit et corpulent ; traits fins et tenue à préciser.

**Chronologie :** Conserver scène, époque et rôle du roman ; aucune insertion automatique dans la colonie.

**Jeu :** Fiche de production manquante ; ni profil ni spawn ajouté par la bible.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Profil, portrait individuel et états propres à la scène à produire.
- Placement, interactions et séquence à intégrer après validation des sources.

**Contrôles attendus :**

- Ne pas utiliser un comédien de doublage comme visage canonique sans preuve.
- Préserver grade, métier, époque et localisation.

### Soldat Stamovich

Identifiant : `rop:personnages:stamovich`

Marine de la garnison.

**Provenance :** personnage_atteste_extrait_roman. Références : [R5](https://www.dreadcentral.com/wp-content/uploads/2014/11/RiverOfPainExcerpt.pdf)

**Apparence :** Mince, pâle, nez aquilin ; tenue détaillée à documenter.

**Chronologie :** Conserver scène, époque et rôle du roman ; aucune insertion automatique dans la colonie.

**Jeu :** Fiche de production manquante ; ni profil ni spawn ajouté par la bible.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Profil, portrait individuel et états propres à la scène à produire.
- Placement, interactions et séquence à intégrer après validation des sources.

**Contrôles attendus :**

- Ne pas utiliser un comédien de doublage comme visage canonique sans preuve.
- Préserver grade, métier, époque et localisation.

### Sergent Marvin Draper

Identifiant : `rop:personnages:marvin-draper`

Marine identifié dans le chapitre 7.

**Provenance :** personnage_atteste_extrait_roman. Références : [R5](https://www.dreadcentral.com/wp-content/uploads/2014/11/RiverOfPainExcerpt.pdf)

**Apparence :** Visage, costume précis et couleurs à documenter.

**Chronologie :** Conserver scène, époque et rôle du roman ; aucune insertion automatique dans la colonie.

**Jeu :** Fiche de production manquante ; ni profil ni spawn ajouté par la bible.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Profil, portrait individuel et états propres à la scène à produire.
- Placement, interactions et séquence à intégrer après validation des sources.

**Contrôles attendus :**

- Ne pas utiliser un comédien de doublage comme visage canonique sans preuve.
- Préserver grade, métier, époque et localisation.

### Yousseff

Identifiant : `rop:personnages:yousseff`

Membre de la garnison cité dans l’extrait.

**Provenance :** personnage_atteste_extrait_roman. Références : [R5](https://www.dreadcentral.com/wp-content/uploads/2014/11/RiverOfPainExcerpt.pdf)

**Apparence :** Visage, costume précis et couleurs à documenter.

**Chronologie :** Conserver scène, époque et rôle du roman ; aucune insertion automatique dans la colonie.

**Jeu :** Fiche de production manquante ; ni profil ni spawn ajouté par la bible.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Profil, portrait individuel et états propres à la scène à produire.
- Placement, interactions et séquence à intégrer après validation des sources.

**Contrôles attendus :**

- Ne pas utiliser un comédien de doublage comme visage canonique sans preuve.
- Préserver grade, métier, époque et localisation.

### Dr Reese

Identifiant : `rop:personnages:reese`

Chercheur de la Compagnie.

**Provenance :** personnage_atteste_extrait_roman. Références : [R5](https://www.dreadcentral.com/wp-content/uploads/2014/11/RiverOfPainExcerpt.pdf)

**Apparence :** Visage, costume précis et couleurs à documenter.

**Chronologie :** Conserver scène, époque et rôle du roman ; aucune insertion automatique dans la colonie.

**Jeu :** Fiche de production manquante ; ni profil ni spawn ajouté par la bible.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Profil, portrait individuel et états propres à la scène à produire.
- Placement, interactions et séquence à intégrer après validation des sources.

**Contrôles attendus :**

- Ne pas utiliser un comédien de doublage comme visage canonique sans preuve.
- Préserver grade, métier, époque et localisation.

### Dr Hidalgo

Identifiant : `rop:personnages:hidalgo`

Chercheur distinct de Mori et Reese.

**Provenance :** personnage_atteste_extrait_roman. Références : [R5](https://www.dreadcentral.com/wp-content/uploads/2014/11/RiverOfPainExcerpt.pdf)

**Apparence :** Visage, costume précis et couleurs à documenter.

**Chronologie :** Conserver scène, époque et rôle du roman ; aucune insertion automatique dans la colonie.

**Jeu :** Fiche de production manquante ; ni profil ni spawn ajouté par la bible.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Profil, portrait individuel et états propres à la scène à produire.
- Placement, interactions et séquence à intégrer après validation des sources.

**Contrôles attendus :**

- Ne pas utiliser un comédien de doublage comme visage canonique sans preuve.
- Préserver grade, métier, époque et localisation.

### Samantha Monet

Identifiant : `rop:personnages:monet`

Identité du registre historique, sans profil individuel.

**Provenance :** personnage_atteste_extrait_roman. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Visage, costume précis et couleurs à documenter.

**Chronologie :** Conserver scène, époque et rôle du roman ; aucune insertion automatique dans la colonie.

**Jeu :** Fiche de production manquante ; ni profil ni spawn ajouté par la bible.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Profil, portrait individuel et états propres à la scène à produire.
- Placement, interactions et séquence à intégrer après validation des sources.

**Contrôles attendus :**

- Ne pas utiliser un comédien de doublage comme visage canonique sans preuve.
- Préserver grade, métier, époque et localisation.

### Ellen Ripley

Identifiant : `rop:personnages:ripley`

Personnage de la récupération et de Gateway.

**Provenance :** personnage_atteste_extrait_roman. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Visage, costume précis et couleurs à documenter.

**Chronologie :** Conserver scène, époque et rôle du roman ; aucune insertion automatique dans la colonie.

**Jeu :** Fiche de production manquante ; ni profil ni spawn ajouté par la bible.

**Localisation :** salvage_shuttle ; orbital_medical

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Profil, portrait individuel et états propres à la scène à produire.
- Placement, interactions et séquence à intégrer après validation des sources.

**Contrôles attendus :**

- Ne pas utiliser un comédien de doublage comme visage canonique sans preuve.
- Préserver grade, métier, époque et localisation.

### Carter Burke

Identifiant : `rop:personnages:burke`

Personnage lié à Gateway.

**Provenance :** personnage_atteste_extrait_roman. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Visage, costume précis et couleurs à documenter.

**Chronologie :** Conserver scène, époque et rôle du roman ; aucune insertion automatique dans la colonie.

**Jeu :** Fiche de production manquante ; ni profil ni spawn ajouté par la bible.

**Localisation :** orbital_medical

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Profil, portrait individuel et états propres à la scène à produire.
- Placement, interactions et séquence à intégrer après validation des sources.

**Contrôles attendus :**

- Ne pas utiliser un comédien de doublage comme visage canonique sans preuve.
- Préserver grade, métier, époque et localisation.

### Jonesy

Identifiant : `rop:personnages:jonesy`

Chat de Ripley ; acteur animal distinct des créatures hostiles.

**Provenance :** personnage_atteste_extrait_roman. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Visage, costume précis et couleurs à documenter.

**Chronologie :** Conserver scène, époque et rôle du roman ; aucune insertion automatique dans la colonie.

**Jeu :** Fiche de production manquante ; ni profil ni spawn ajouté par la bible.

**Localisation :** salvage_shuttle

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Profil, portrait individuel et états propres à la scène à produire.
- Placement, interactions et séquence à intégrer après validation des sources.

**Contrôles attendus :**

- Ne pas utiliser un comédien de doublage comme visage canonique sans preuve.
- Préserver grade, métier, époque et localisation.

### Tressa

Identifiant : `rop:personnages:tressa`

Pilote du véhicule de descente de Brackett.

**Provenance :** personnage_atteste_extrait_roman. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Visage, costume précis et couleurs à documenter.

**Chronologie :** Conserver scène, époque et rôle du roman ; aucune insertion automatique dans la colonie.

**Jeu :** Fiche de production manquante ; ni profil ni spawn ajouté par la bible.

**Localisation :** dropship_arrival

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Profil, portrait individuel et états propres à la scène à produire.
- Placement, interactions et séquence à intégrer après validation des sources.

**Contrôles attendus :**

- Ne pas utiliser un comédien de doublage comme visage canonique sans preuve.
- Préserver grade, métier, époque et localisation.

### Jernigan

Identifiant : `rop:personnages:jernigan`

Membre de la récupération spatiale.

**Provenance :** personnage_atteste_extrait_roman. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Visage, costume précis et couleurs à documenter.

**Chronologie :** Conserver scène, époque et rôle du roman ; aucune insertion automatique dans la colonie.

**Jeu :** Fiche de production manquante ; ni profil ni spawn ajouté par la bible.

**Localisation :** salvage_bay

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Profil, portrait individuel et états propres à la scène à produire.
- Placement, interactions et séquence à intégrer après validation des sources.

**Contrôles attendus :**

- Ne pas utiliser un comédien de doublage comme visage canonique sans preuve.
- Préserver grade, métier, époque et localisation.

### Landers

Identifiant : `rop:personnages:landers`

Membre de la récupération à individualiser.

**Provenance :** personnage_atteste_extrait_roman. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Visage, costume précis et couleurs à documenter.

**Chronologie :** Conserver scène, époque et rôle du roman ; aucune insertion automatique dans la colonie.

**Jeu :** Fiche de production manquante ; ni profil ni spawn ajouté par la bible.

**Localisation :** salvage_bay

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Profil, portrait individuel et états propres à la scène à produire.
- Placement, interactions et séquence à intégrer après validation des sources.

**Contrôles attendus :**

- Ne pas utiliser un comédien de doublage comme visage canonique sans preuve.
- Préserver grade, métier, époque et localisation.

### Fleet

Identifiant : `rop:personnages:fleet`

Membre de la récupération à individualiser.

**Provenance :** personnage_atteste_extrait_roman. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Visage, costume précis et couleurs à documenter.

**Chronologie :** Conserver scène, époque et rôle du roman ; aucune insertion automatique dans la colonie.

**Jeu :** Fiche de production manquante ; ni profil ni spawn ajouté par la bible.

**Localisation :** salvage_bay

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Profil, portrait individuel et états propres à la scène à produire.
- Placement, interactions et séquence à intégrer après validation des sources.

**Contrôles attendus :**

- Ne pas utiliser un comédien de doublage comme visage canonique sans preuve.
- Préserver grade, métier, époque et localisation.

### Moore

Identifiant : `rop:personnages:moore`

Reste au poste de pilotage pendant que les trois autres récupérateurs descendent.

**Provenance :** personnage_atteste_extrait_roman. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Visage, costume précis et couleurs à documenter.

**Chronologie :** Récupération spatiale, 16 mai 2179.

**Jeu :** Fiche de production manquante ; ni profil ni spawn ajouté par la bible.

**Localisation :** salvage_flight_deck

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Profil, portrait individuel et états propres à la scène à produire.
- Placement, interactions et séquence à intégrer après validation des sources.

**Contrôles attendus :**

- Ne pas utiliser un comédien de doublage comme visage canonique sans preuve.
- Préserver grade, métier, époque et localisation.

### Xénomorphe adulte

Identifiant : `rop:personnages:adult`

Patrouille, recherche, poursuite et préparation d’attaque natives.

**Provenance :** creature_franchise_adaptee_au_jeu. Références : [S1](https://titanbooks.com/6486-alien-river-of-pain-book-3/)

**Apparence :** Comparer silhouette, membres, queue, matière et échelle aux références dédiées.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** La pose immobile ne remplace pas les animations d’attaque ou locomotion.

**Localisation :** Atelier de manutention ; Dérivation des eaux grises

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG adulte absent ; variante de crâne et proportions à documenter.
- Marche, course, attaque, recul, entrée par conduit et mort à produire.

**Contrôles attendus :**

- Conserver hitboxes, signaux d’attaque et comportement natif.

### Facehugger

Identifiant : `rop:personnages:facehugger`

Créature basse ; le PNG existant couvre seulement le repos.

**Provenance :** creature_franchise_adaptee_au_jeu. Références : [S1](https://titanbooks.com/6486-alien-river-of-pain-book-3/)

**Apparence :** Comparer silhouette, membres, queue, matière et échelle aux références dédiées.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** La pose immobile ne remplace pas les animations d’attaque ou locomotion.

**Localisation :** Atelier biomédical

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = png_present ; intégration = png_idle_selectif_repli_natif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [facehugger-idle-right](../assets/facehugger-idle-right.png) — dimensions globales non relues, pose idle, ancre 1100/703

**À compléter :**

- Locomotion, bond/attaque, recul, conduit et défaite absents du registre PNG.

**Contrôles attendus :**

- Conserver hitboxes, signaux d’attaque et comportement natif.

## Lieux

### Aire d’atterrissage

Identifiant : `rop:lieux:pad`

Périmètre, niveau 0. Repère : Tour de contrôle et feux d’approche.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Famille exterior, variante approach_lights, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-01 : Retrouver Paris ; rop-05 : Prendre en charge le retour des prospecteurs

**Localisation :** Aire d’atterrissage

**Dimensions et ancrage :** {"authoredMetres":[69,9,3.4],"widthModelUnits":2900,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| pad>airlock | Sas des arrivants | side-bulkhead | 170 / 0.69 | selon phase |

### Sas des arrivants

Identifiant : `rop:lieux:airlock`

Accueil, niveau 0. Repère : Double porte pressurisée, douche de décontamination.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille decontamination, variante double_bulkhead, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Circulation, exploration ou service relié au plan existant.

**Localisation :** Sas des arrivants

**Dimensions et ancrage :** {"authoredMetres":[42.9,2.8,3.4],"widthModelUnits":1800,"navigableZ":[0.7,0.7],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| airlock>pad | Aire d’atterrissage | side-bulkhead | 170 / 0.7 | selon phase |
| airlock>concourse | Coursive centrale | side-bulkhead | 1630 / 0.7 | selon phase |

### Coursive centrale

Identifiant : `rop:lieux:concourse`

Accueil, niveau 0. Repère : Signalétique des blocs, galerie vitrée.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille concourse, variante glazed_gallery, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Circulation, exploration ou service relié au plan existant.

**Localisation :** Coursive centrale

**Dimensions et ancrage :** {"authoredMetres":[71.4,9,3.4],"widthModelUnits":3000,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| concourse>airlock | Sas des arrivants | side-bulkhead | 170 / 0.69 | selon phase |
| concourse>ops | Contrôle colonial | side-bulkhead | 2830 / 0.69 | selon phase |
| concourse>hab | Coursive résidentielle | rear-bay | 840 / 0.28 | selon phase |
| concourse>med | Infirmerie | rear-bay | 1440 / 0.28 | selon phase |
| concourse>garage | Garage des prospecteurs | rear-bay | 2040 / 0.28 | selon phase |

### Contrôle colonial

Identifiant : `rop:lieux:ops`

Administration, niveau 1. Repère : Baie de supervision et consoles de communications.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille command, variante observation_bay, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-01 : Consulter le tableau de service ; rop-08 : Relever les dernières balises PDT

**Localisation :** Contrôle colonial

**Dimensions et ancrage :** {"authoredMetres":[57.1,9,3.4],"widthModelUnits":2400,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| ops>concourse | Coursive centrale | side-bulkhead | 170 / 0.69 | selon phase |
| ops>briefing | Poste de la garnison | side-bulkhead | 2230 / 0.69 | selon phase |
| ops>relay | Relais de communications | rear-bay | 672 / 0.28 | selon phase |
| ops>aerial | Terrasse des antennes | rear-bay | 1320 / 0.28 | service-aerial |
| ops>armory | Armurerie de la garnison | rear-bay | 1770 / 0.28 | selon phase |

### Poste de la garnison

Identifiant : `rop:lieux:briefing`

Administration, niveau 1. Repère : Casiers individuels et table de service.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille barracks, variante locker_bays, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-01 : Prendre la dotation

**Localisation :** Poste de la garnison

**Dimensions et ancrage :** {"authoredMetres":[52.4,2.8,3.4],"widthModelUnits":2200,"navigableZ":[0.7,0.7],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| briefing>ops | Contrôle colonial | side-bulkhead | 170 / 0.7 | selon phase |
| briefing>armory | Armurerie de la garnison | rear-bay | 1230 / 0.7 | selon phase |

### Coursive résidentielle

Identifiant : `rop:lieux:hab`

Habitat, niveau 1. Repère : Portes numérotées et fenêtres des logements.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille residential, variante numbered_alcoves, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Circulation, exploration ou service relié au plan existant.

**Localisation :** Coursive résidentielle

**Dimensions et ancrage :** {"authoredMetres":[64.3,2.8,3.4],"widthModelUnits":2700,"navigableZ":[0.7,0.7],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| hab>concourse | Coursive centrale | side-bulkhead | 170 / 0.7 | selon phase |
| hab>jorden | Logement des Jorden | side-bulkhead | 2530 / 0.7 | selon phase |
| hab>recreation | Centre de loisirs | rear-bay | 756 / 0.7 | selon phase |
| hab>wash | Buanderie | rear-bay | 1296 / 0.7 | selon phase |
| hab>pantry | Office de la cuisine | rear-bay | 1720 / 0.7 | service-pantry |

### Logement des Jorden

Identifiant : `rop:lieux:jorden`

Habitat, niveau 1. Repère : Table familiale, lits et dessins d’enfant.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Famille domestic, variante low_ceiling, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-02 : Préparer la tournée

**Localisation :** Logement des Jorden

**Dimensions et ancrage :** {"authoredMetres":[44,9,3.4],"widthModelUnits":1850,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| jorden>hab | Coursive résidentielle | side-bulkhead | 170 / 0.69 | selon phase |
| jorden>vent_hab | Conduits de l’habitat | side-bulkhead | 1680 / 0.69 | enfant |

### Réfectoire

Identifiant : `rop:lieux:mess`

Habitat, niveau 0. Repère : Tables, cuisine et distributeurs.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille canteen, variante kitchen_pass, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-02 : Récupérer les provisions ; rop-09 : Accompagner un colon jusqu’au magasin ; rop-15 : Trouver de quoi manger

**Localisation :** Réfectoire

**Dimensions et ancrage :** {"authoredMetres":[61.9,9,3.4],"widthModelUnits":2600,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| mess>recreation | Centre de loisirs | side-bulkhead | 170 / 0.69 | selon phase |
| mess>wash | Buanderie | side-bulkhead | 2430 / 0.69 | selon phase |
| mess>stores | Magasin de fret | rear-bay | 728 / 0.28 | selon phase |
| mess>pantry | Office de la cuisine | rear-bay | 1850 / 0.28 | selon phase |

### Centre de loisirs

Identifiant : `rop:lieux:recreation`

Habitat, niveau 0. Repère : Jeux, bancs et accès à la maintenance.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Famille leisure, variante recessed_arcades, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Circulation, exploration ou service relié au plan existant.

**Localisation :** Centre de loisirs

**Dimensions et ancrage :** {"authoredMetres":[53.6,9,3.4],"widthModelUnits":2250,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| recreation>hab | Coursive résidentielle | side-bulkhead | 170 / 0.69 | selon phase |
| recreation>mess | Réfectoire | side-bulkhead | 2080 / 0.69 | selon phase |
| recreation>vent_hab | Conduits de l’habitat | rear-bay | 630 / 0.28 | enfant |
| recreation>greenhouse | Serre vitrée | rear-bay | 1590 / 0.81 | selon phase |

### Infirmerie

Identifiant : `rop:lieux:med`

Médical, niveau 0. Repère : Lits isolés, vitres d’observation et moniteurs.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Famille medical, variante observation_partitions, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-05 : Transmettre le bilan à Komiskey ; rop-06 : Consulter le registre des patients

**Localisation :** Infirmerie

**Dimensions et ancrage :** {"authoredMetres":[66.7,9,3.4],"widthModelUnits":2800,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| med>concourse | Coursive centrale | side-bulkhead | 170 / 0.69 | selon phase |
| med>isolation | Chambre d’isolement | side-bulkhead | 2630 / 0.69 | selon phase |
| med>clinic_store | Réserve médicale | rear-bay | 784 / 0.28 | selon phase |
| med>science | Laboratoire de la Compagnie | rear-bay | 1344 / 0.28 | selon phase |
| med>biomed | Atelier biomédical | rear-bay | 2000 / 0.28 | selon phase |

### Chambre d’isolement

Identifiant : `rop:lieux:isolation`

Médical, niveau 0. Repère : Lit d’observation et hublot de quarantaine.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille medical, variante sealed_observation, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-05 : Fermer l’isolement médical

**Localisation :** Chambre d’isolement

**Dimensions et ancrage :** {"authoredMetres":[40.5,2.8,3.4],"widthModelUnits":1700,"navigableZ":[0.7,0.7],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| isolation>med | Infirmerie | side-bulkhead | 170 / 0.7 | selon phase |
| isolation>vent_med | Conduits de l’infirmerie | side-bulkhead | 1530 / 0.7 | enfant |

### Laboratoire de la Compagnie

Identifiant : `rop:lieux:science`

Recherche, niveau 0. Repère : Paillasses, cuves et racks de confinement.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille laboratory, variante containment_bays, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-06 : Lire la directive scientifique ; rop-13 : Recevoir la transmission de Brackett

**Localisation :** Laboratoire de la Compagnie

**Dimensions et ancrage :** {"authoredMetres":[57.1,9,3.4],"widthModelUnits":2400,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| science>med | Infirmerie | side-bulkhead | 170 / 0.69 | selon phase |
| science>records | Salle des archives | side-bulkhead | 2230 / 0.69 | selon phase |
| science>service | Galerie technique | rear-bay | 672 / 0.28 | selon phase |
| science>hangar | Hangar scientifique | rear-bay | 1152 / 0.28 | scienceClearance |

### Salle des archives

Identifiant : `rop:lieux:records`

Recherche, niveau 1. Repère : Bandes de données et baie réseau.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille archive, variante server_aisles, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-06 : Conserver une copie des échanges

**Localisation :** Salle des archives

**Dimensions et ancrage :** {"authoredMetres":[42.9,2.8,3.4],"widthModelUnits":1800,"navigableZ":[0.7,0.7],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| records>science | Laboratoire de la Compagnie | side-bulkhead | 170 / 0.7 | selon phase |
| records>relay | Relais de communications | side-bulkhead | 1630 / 0.7 | selon phase |

### Garage des prospecteurs

Identifiant : `rop:lieux:garage`

Logistique, niveau 0. Repère : Tracteur de prospection sur sa voie de service.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille hangar, variante overhead_crane, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-03 : Prendre le matériel de secours ; rop-04 : Préparer le tracteur

**Localisation :** Garage des prospecteurs

**Dimensions et ancrage :** {"authoredMetres":[76.2,9,3.4],"widthModelUnits":3200,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| garage>concourse | Coursive centrale | side-bulkhead | 170 / 0.69 | selon phase |
| garage>survey | Bureau des prospecteurs | side-bulkhead | 3030 / 0.69 | selon phase |
| garage>service | Galerie technique | rear-bay | 896 / 0.28 | selon phase |
| garage>road | Piste du plateau | rear-bay | 1536 / 0.28 | selon phase |
| garage>workshop | Atelier de manutention | rear-bay | 2580 / 0.28 | selon phase |

### Bureau des prospecteurs

Identifiant : `rop:lieux:survey`

Logistique, niveau 0. Repère : Cartes topographiques et postes radio.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille command, variante survey_wall, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-04 : Recevoir la grille de prospection ; rop-10 : Renforcer la fermeture du bureau ; rop-12 : Alimenter le verrou une dernière fois ; rop-12 : Dégager l’accès au conduit ; rop-12 : Mettre Newt à l’abri ; rop-13 : Dégager Luisa et la conduire au hangar

**Localisation :** Bureau des prospecteurs

**Dimensions et ancrage :** {"authoredMetres":[59.5,9,3.4],"widthModelUnits":2500,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| survey>garage | Garage des prospecteurs | side-bulkhead | 170 / 0.69 | selon phase |
| survey>stores | Magasin de fret | side-bulkhead | 2330 / 0.69 | selon phase |
| survey>vent_survey | Conduits des prospecteurs | rear-bay | 700 / 0.28 | enfant |

### Magasin de fret

Identifiant : `rop:lieux:stores`

Logistique, niveau 0. Repère : Palettes, rack de levage et allées dégagées.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille warehouse, variante loading_racks, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-09 : Mettre le refuge provisoire sous tension ; rop-10 : Récupérer un poste à souder

**Localisation :** Magasin de fret

**Dimensions et ancrage :** {"authoredMetres":[73.8,9,3.4],"widthModelUnits":3100,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| stores>survey | Bureau des prospecteurs | side-bulkhead | 170 / 0.69 | selon phase |
| stores>power | Distribution électrique | side-bulkhead | 2930 / 0.69 | selon phase |
| stores>mess | Réfectoire | rear-bay | 868 / 0.28 | selon phase |

### Distribution électrique

Identifiant : `rop:lieux:power`

Maintenance, niveau -1. Repère : Deux banques de coupe-circuits et conduites.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille industrial, variante busbar_banks, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-02 : Réarmer le départ habitat ; rop-10 : Rétablir le circuit de secours ; rop-11 : Fermer derrière le groupe

**Localisation :** Distribution électrique

**Dimensions et ancrage :** {"authoredMetres":[61.9,9,3.4],"widthModelUnits":2600,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| power>stores | Magasin de fret | side-bulkhead | 170 / 0.69 | selon phase |
| power>pump | Station de pompage | side-bulkhead | 2430 / 0.69 | selon phase |
| power>coolant | Galerie du refroidissement | rear-bay | 728 / 0.28 | selon phase |

### Station de pompage

Identifiant : `rop:lieux:pump`

Maintenance, niveau -1. Repère : Collecteurs, vannes et caniveaux protégés.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille industrial, variante collector_wall, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-08 : Détourner la pression du passage

**Localisation :** Station de pompage

**Dimensions et ancrage :** {"authoredMetres":[57.1,9,3.4],"widthModelUnits":2400,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| pump>power | Distribution électrique | side-bulkhead | 170 / 0.69 | selon phase |
| pump>service | Galerie technique | side-bulkhead | 2230 / 0.69 | selon phase |
| pump>approach | Accès au processeur un | rear-bay | 672 / 0.28 | selon phase |
| pump>drain | Dérivation des eaux grises | rear-bay | 1200 / 0.28 | selon phase |

### Galerie technique

Identifiant : `rop:lieux:service`

Maintenance, niveau -1. Repère : Passage sous les bâtiments, conduites continues.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille maintenance, variante pipe_trench, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-08 : Suivre les traces dans la galerie

**Localisation :** Galerie technique

**Dimensions et ancrage :** {"authoredMetres":[71.4,2.8,3.4],"widthModelUnits":3000,"navigableZ":[0.7,0.7],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| service>pump | Station de pompage | side-bulkhead | 170 / 0.7 | selon phase |
| service>science | Laboratoire de la Compagnie | side-bulkhead | 2830 / 0.7 | selon phase |
| service>garage | Garage des prospecteurs | rear-bay | 840 / 0.7 | selon phase |

### Piste du plateau

Identifiant : `rop:lieux:road`

Périmètre, niveau 0. Repère : Piquets de balisage, roches et ravines non praticables.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille exterior, variante rock_cutting, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Circulation, exploration ou service relié au plan existant.

**Localisation :** Piste du plateau

**Dimensions et ancrage :** {"authoredMetres":[88.1,9,3.4],"widthModelUnits":3700,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| road>garage | Garage des prospecteurs | side-bulkhead | 170 / 0.69 | selon phase |
| road>plateau | Plateau des relevés | terrain | 3530 / 0.69 | selon phase |
| road>processor6 | Processeur six | terrain | 1036 / 0.28 | selon phase |

### Plateau des relevés

Identifiant : `rop:lieux:plateau`

Périmètre, niveau 0. Repère : Jalons de prospection, dépôt de service et accès à pied vers l’épave.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille exterior, variante survey_ridge, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-04 : Poser une balise sur le plateau

**Localisation :** Plateau des relevés

**Dimensions et ancrage :** {"authoredMetres":[69,9,3.4],"widthModelUnits":2900,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| plateau>road | Piste du plateau | terrain | 170 / 0.69 | selon phase |
| plateau>derelict | Seuil de l’épave | organic-shell | 2730 / 0.69 | selon phase |

### Seuil de l’épave

Identifiant : `rop:lieux:derelict`

Épave, niveau 0. Repère : Arches biomécaniques et coque affaissée.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : [R2](https://www.avpgalaxy.net/website/interviews/christopher-golden/)

**Apparence :** Famille derelict, variante organic_vault, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-04 : Examiner le seuil de l’épave

**Localisation :** Seuil de l’épave

**Dimensions et ancrage :** {"authoredMetres":[59.5,9,3.4],"widthModelUnits":2500,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| derelict>plateau | Plateau des relevés | organic-shell | 170 / 0.69 | selon phase |
| derelict>derelict_gallery | Galerie biomécanique | organic-shell | 2330 / 0.69 | selon phase |

### Processeur six

Identifiant : `rop:lieux:processor6`

Terraformage, niveau 0. Repère : Passerelle industrielle et conduites sous pression.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille industrial, variante heat_exchangers, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-03 : Isoler la conduite endommagée ; rop-03 : Récupérer le rapport d’intervention

**Localisation :** Processeur six

**Dimensions et ancrage :** {"authoredMetres":[71.4,9,3.4],"widthModelUnits":3000,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| processor6>road | Piste du plateau | terrain | 170 / 0.69 | selon phase |
| processor6>workshop | Atelier de manutention | rear-bay | 1870 / 0.28 | service-workshop |

### Accès au processeur un

Identifiant : `rop:lieux:approach`

Terraformage, niveau 0. Repère : Pylônes, sas de maintenance et énormes échangeurs.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille exterior, variante processor_columns, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Circulation, exploration ou service relié au plan existant.

**Localisation :** Accès au processeur un

**Dimensions et ancrage :** {"authoredMetres":[76.2,9,3.4],"widthModelUnits":3200,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| approach>pump | Station de pompage | side-bulkhead | 170 / 0.69 | selon phase |
| approach>lift | Monte-charge du processeur | side-bulkhead | 3030 / 0.69 | selon phase |

### Monte-charge du processeur

Identifiant : `rop:lieux:lift`

Terraformage, niveau -1. Repère : Cabine de fret et paliers identifiés.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille shaft, variante counterweights, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-11 : Commander le monte-charge

**Localisation :** Monte-charge du processeur

**Dimensions et ancrage :** {"authoredMetres":[42.9,2.8,3.4],"widthModelUnits":1800,"navigableZ":[0.7,0.7],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| lift>approach | Accès au processeur un | side-bulkhead | 170 / 0.7 | selon phase |
| lift>hive | Soubassements envahis | side-bulkhead | 1630 / 0.7 | selon phase |

### Soubassements envahis

Identifiant : `rop:lieux:hive`

Terraformage, niveau -2. Repère : Résine sur les structures industrielles, balises PDT.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille hive, variante resin_on_steel, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-11 : Retrouver la source des signaux

**Localisation :** Soubassements envahis

**Dimensions et ancrage :** {"authoredMetres":[71.4,9,3.4],"widthModelUnits":3000,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| hive>lift | Monte-charge du processeur | side-bulkhead | 170 / 0.69 | selon phase |
| hive>coolant | Galerie du refroidissement | side-bulkhead | 2830 / 0.69 | selon phase |

### Galerie du refroidissement

Identifiant : `rop:lieux:coolant`

Terraformage, niveau -2. Repère : Passage étroit entre les échangeurs, ruche en arrière-plan.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille hive, variante buried_exchangers, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-11 : Baliser la route de repli

**Localisation :** Galerie du refroidissement

**Dimensions et ancrage :** {"authoredMetres":[64.3,9,3.4],"widthModelUnits":2700,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| coolant>hive | Soubassements envahis | side-bulkhead | 170 / 0.69 | selon phase |
| coolant>power | Distribution électrique | side-bulkhead | 2530 / 0.69 | selon phase |
| coolant>drain | Dérivation des eaux grises | rear-bay | 1500 / 0.28 | service-drain |

### Conduits de l’habitat

Identifiant : `rop:lieux:vent_hab`

Ventilation, niveau 1. Repère : Jonctions basses, grilles et câbles de repérage.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille vent, variante habitat_branch, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-07 : Retrouver les repères de Tim ; rop-16 : Vérifier le chemin de retour

**Localisation :** Conduits de l’habitat

**Dimensions et ancrage :** {"authoredMetres":[61.9,1.1,3.4],"widthModelUnits":2600,"navigableZ":[0.7,0.7],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| vent_hab>jorden | Logement des Jorden | side-bulkhead | 170 / 0.7 | enfant |
| vent_hab>vent_med | Conduits de l’infirmerie | side-bulkhead | 2430 / 0.7 | enfant |
| vent_hab>vent_survey | Conduits des prospecteurs | rear-bay | 728 / 0.7 | enfant |
| vent_hab>recreation | Centre de loisirs | rear-bay | 1248 / 0.7 | enfant |

### Conduits de l’infirmerie

Identifiant : `rop:lieux:vent_med`

Ventilation, niveau 1. Repère : Grilles d’observation et courbe de service.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille vent, variante observation_grille, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-07 : Écouter derrière la grille

**Localisation :** Conduits de l’infirmerie

**Dimensions et ancrage :** {"authoredMetres":[57.1,1.1,3.4],"widthModelUnits":2400,"navigableZ":[0.7,0.7],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| vent_med>vent_hab | Conduits de l’habitat | side-bulkhead | 170 / 0.7 | enfant |
| vent_med>isolation | Chambre d’isolement | side-bulkhead | 2230 / 0.7 | enfant |
| vent_med>nest | Renfoncement des câbles | rear-bay | 1070 / 0.7 | enfant |

### Conduits des prospecteurs

Identifiant : `rop:lieux:vent_survey`

Ventilation, niveau 0. Repère : Grille de secours au-dessus de la dernière barricade.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille vent, variante survey_branch, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-15 : Passer sans attirer la créature

**Localisation :** Conduits des prospecteurs

**Dimensions et ancrage :** {"authoredMetres":[56,1.1,3.4],"widthModelUnits":2350,"navigableZ":[0.7,0.7],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| vent_survey>vent_hab | Conduits de l’habitat | side-bulkhead | 170 / 0.7 | enfant |
| vent_survey>survey | Bureau des prospecteurs | side-bulkhead | 2180 / 0.7 | enfant |
| vent_survey>refuge | Cache des conduits | rear-bay | 658 / 0.7 | enfant |

### Cache des conduits

Identifiant : `rop:lieux:refuge`

Ventilation, niveau 0. Repère : Petit renfoncement hors des axes de ventilation.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille refuge, variante service_recess, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-07 : Préparer une petite cache ; rop-16 : Regagner la cache

**Localisation :** Cache des conduits

**Dimensions et ancrage :** {"authoredMetres":[41.7,1.1,3.4],"widthModelUnits":1750,"navigableZ":[0.7,0.7],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| refuge>vent_survey | Conduits des prospecteurs | side-bulkhead | 170 / 0.7 | enfant |
| refuge>wash | Buanderie | side-bulkhead | 1580 / 0.7 | enfant |
| refuge>nest | Renfoncement des câbles | rear-bay | 1180 / 0.7 | service-nest |

### Hangar scientifique

Identifiant : `rop:lieux:hangar`

Recherche, niveau 0. Repère : Navette de service, passerelle et réserves de carburant.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille hangar, variante shuttle_bay, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-13 : Déverrouiller la navette scientifique ; rop-14 : Vérifier l’embarquement

**Localisation :** Hangar scientifique

**Dimensions et ancrage :** {"authoredMetres":[78.6,9,3.4],"widthModelUnits":3300,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| hangar>science | Laboratoire de la Compagnie | side-bulkhead | 170 / 0.69 | scienceClearance |
| hangar>shuttle | Navette de la Compagnie | side-bulkhead | 3130 / 0.69 | selon phase |

### Navette de la Compagnie

Identifiant : `rop:lieux:shuttle`

Recherche, niveau 0. Repère : Sas arrière, sièges et commandes de navigation.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille shuttle, variante pressure_shell, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-14 : Désengager la trajectoire automatique ; rop-14 : Décoller

**Localisation :** Navette de la Compagnie

**Dimensions et ancrage :** {"authoredMetres":[51.2,2.8,3.4],"widthModelUnits":2150,"navigableZ":[0.7,0.7],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| shuttle>hangar | Hangar scientifique | side-bulkhead | 170 / 0.7 | selon phase |

### Buanderie

Identifiant : `rop:lieux:wash`

Habitat, niveau 0. Repère : Machines, linge abandonné et évier de service.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille utility, variante laundry_racks, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-15 : Récupérer de l’eau

**Localisation :** Buanderie

**Dimensions et ancrage :** {"authoredMetres":[44,9,3.4],"widthModelUnits":1850,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| wash>refuge | Cache des conduits | side-bulkhead | 170 / 0.69 | enfant |
| wash>mess | Réfectoire | side-bulkhead | 1680 / 0.69 | selon phase |
| wash>hab | Coursive résidentielle | rear-bay | 518 / 0.28 | selon phase |
| wash>greenhouse | Serre vitrée | rear-bay | 1030 / 0.81 | selon phase |

### Relais de communications

Identifiant : `rop:lieux:relay`

Administration, niveau 1. Repère : Baie relais et émetteurs directionnels.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille archive, variante relay_backbone, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Circulation, exploration ou service relié au plan existant.

**Localisation :** Relais de communications

**Dimensions et ancrage :** {"authoredMetres":[46.4,2.8,3.4],"widthModelUnits":1950,"navigableZ":[0.7,0.7],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| relay>records | Salle des archives | side-bulkhead | 170 / 0.7 | selon phase |
| relay>ops | Contrôle colonial | side-bulkhead | 1780 / 0.7 | selon phase |
| relay>aerial | Terrasse des antennes | rear-bay | 480 / 0.7 | selon phase |

### Réserve médicale

Identifiant : `rop:lieux:clinic_store`

Médical, niveau 0. Repère : Tiroirs de soins et stockage réfrigéré.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille medical, variante cold_storage, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** rop-09 : Prendre les soins d’urgence

**Localisation :** Réserve médicale

**Dimensions et ancrage :** {"authoredMetres":[40.5,2.8,3.4],"widthModelUnits":1700,"navigableZ":[0.7,0.7],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| clinic_store>med | Infirmerie | side-bulkhead | 170 / 0.7 | selon phase |
| clinic_store>biomed | Atelier biomédical | rear-bay | 1160 / 0.7 | service-biomed |

### Office de la cuisine

Identifiant : `rop:lieux:pantry`

Habitat, niveau 0. Repère : Passe-plats, chambre froide et escalier réservé au personnel.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille canteen, variante pantry-service-loop, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Circulation, exploration ou service relié au plan existant.

**Localisation :** Office de la cuisine

**Dimensions et ancrage :** {"authoredMetres":[50,9,3.4],"widthModelUnits":2100,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| pantry>mess | Réfectoire | side-bulkhead | 170 / 0.81 | selon phase |
| pantry>hab | Coursive résidentielle | side-bulkhead | 1930 / 0.81 | service-pantry |

### Atelier biomédical

Identifiant : `rop:lieux:biomed`

Médical, niveau 0. Repère : Banc de réparation, berceaux de moniteurs et porte de la réserve.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille medical, variante biomed-service-loop, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Circulation, exploration ou service relié au plan existant.

**Localisation :** Atelier biomédical

**Dimensions et ancrage :** {"authoredMetres":[58.3,9,3.4],"widthModelUnits":2450,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| biomed>med | Infirmerie | side-bulkhead | 170 / 0.81 | selon phase |
| biomed>clinic_store | Réserve médicale | side-bulkhead | 2280 / 0.81 | service-biomed |

### Terrasse des antennes

Identifiant : `rop:lieux:aerial`

Administration, niveau 2. Repère : Mâts inclinés par le vent, boîtier de synchronisation et cage d’escalier.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille exterior, variante aerial-service-loop, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Circulation, exploration ou service relié au plan existant.

**Localisation :** Terrasse des antennes

**Dimensions et ancrage :** {"authoredMetres":[64.3,9,3.4],"widthModelUnits":2700,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| aerial>relay | Relais de communications | side-bulkhead | 170 / 0.81 | selon phase |
| aerial>ops | Contrôle colonial | side-bulkhead | 2530 / 0.81 | service-aerial |

### Atelier de manutention

Identifiant : `rop:lieux:workshop`

Logistique, niveau 0. Repère : Chaîne de palan, établi moteur et galerie vers le processeur six.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille hangar, variante workshop-service-loop, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Circulation, exploration ou service relié au plan existant.

**Localisation :** Atelier de manutention

**Dimensions et ancrage :** {"authoredMetres":[71.4,9,3.4],"widthModelUnits":3000,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| workshop>garage | Garage des prospecteurs | side-bulkhead | 170 / 0.81 | selon phase |
| workshop>processor6 | Processeur six | side-bulkhead | 2830 / 0.81 | service-workshop |

### Dérivation des eaux grises

Identifiant : `rop:lieux:drain`

Maintenance, niveau -2. Repère : Deux vannes de purge, cuves fermées et passerelle latérale sèche.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille maintenance, variante drain-service-loop, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Circulation, exploration ou service relié au plan existant.

**Localisation :** Dérivation des eaux grises

**Dimensions et ancrage :** {"authoredMetres":[67.9,9,3.4],"widthModelUnits":2850,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| drain>pump | Station de pompage | side-bulkhead | 170 / 0.81 | selon phase |
| drain>coolant | Galerie du refroidissement | side-bulkhead | 2680 / 0.81 | service-drain |

### Renfoncement des câbles

Identifiant : `rop:lieux:nest`

Ventilation, niveau 1. Repère : Rubans colorés, couverture pliée et petite grille d’observation.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille refuge, variante nest-service-loop, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Circulation, exploration ou service relié au plan existant.

**Localisation :** Renfoncement des câbles

**Dimensions et ancrage :** {"authoredMetres":[46.4,1.2,2.2],"widthModelUnits":1950,"navigableZ":[0.7,0.7],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| nest>vent_med | Conduits de l’infirmerie | side-bulkhead | 170 / 0.7 | enfant |
| nest>refuge | Cache des conduits | side-bulkhead | 1780 / 0.7 | service-nest |

### Serre vitrée

Identifiant : `rop:lieux:greenhouse`

Habitat, niveau 0. Repère : Dôme vitré hémisphérique : présence attestée, culture et plan interprétés.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Famille greenhouse, variante glass_dome, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Circulation, exploration ou service relié au plan existant.

**Localisation :** Serre vitrée

**Dimensions et ancrage :** {"authoredMetres":[65.5,9,5.5],"widthModelUnits":2750,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| greenhouse>recreation | Centre de loisirs | side-bulkhead | 170 / 0.69 | selon phase |
| greenhouse>wash | Buanderie | side-bulkhead | 2580 / 0.69 | selon phase |

### Armurerie de la garnison

Identifiant : `rop:lieux:armory`

Administration, niveau 1. Repère : Râteliers identifiés et dépôt séparé du poste de commandement.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Famille garrison, variante racks, ambiance cold. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Circulation, exploration ou service relié au plan existant.

**Localisation :** Armurerie de la garnison

**Dimensions et ancrage :** {"authoredMetres":[52.4,9,5.5],"widthModelUnits":2200,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| armory>briefing | Poste de la garnison | side-bulkhead | 170 / 0.69 | selon phase |
| armory>ops | Contrôle colonial | side-bulkhead | 2030 / 0.69 | selon phase |

### Galerie biomécanique

Identifiant : `rop:lieux:derelict_gallery`

Épave, niveau 0. Repère : Coque nervurée ; le passage continue au-delà du seuil.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : [R2](https://www.avpgalaxy.net/website/interviews/christopher-golden/)

**Apparence :** Famille derelict, variante organic_vault, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Circulation, exploration ou service relié au plan existant.

**Localisation :** Galerie biomécanique

**Dimensions et ancrage :** {"authoredMetres":[57.1,9,5.5],"widthModelUnits":2400,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| derelict_gallery>derelict | Seuil de l’épave | organic-shell | 170 / 0.69 | selon phase |
| derelict_gallery>pilot_chamber | Chambre du pilote | organic-shell | 2230 / 0.69 | selon phase |

### Chambre du pilote

Identifiant : `rop:lieux:pilot_chamber`

Épave, niveau 0. Repère : Siège fossile central, sans déplacement du pilote vers la colonie.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : [R2](https://www.avpgalaxy.net/website/interviews/christopher-golden/)

**Apparence :** Famille derelict, variante organic_vault, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Circulation, exploration ou service relié au plan existant.

**Localisation :** Chambre du pilote

**Dimensions et ancrage :** {"authoredMetres":[71.4,9,5.5],"widthModelUnits":3000,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| pilot_chamber>derelict_gallery | Galerie biomécanique | organic-shell | 170 / 0.69 | selon phase |
| pilot_chamber>egg_vault | Cale aux œufs | organic-shell | 2830 / 0.69 | selon phase |

### Cale aux œufs

Identifiant : `rop:lieux:egg_vault`

Épave, niveau -1. Repère : Nappe de brume et ovoides sous la coque ; parcours d’observation original.

**Provenance :** lieu_reconstitue_plan_original_non_cote. Références : [R2](https://www.avpgalaxy.net/website/interviews/christopher-golden/)

**Apparence :** Famille derelict, variante organic_vault, ambiance amber. Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Circulation, exploration ou service relié au plan existant.

**Localisation :** Cale aux œufs

**Dimensions et ancrage :** {"authoredMetres":[67.9,9,5.5],"widthModelUnits":2850,"navigableZ":[0.25,0.9],"officialMeasurements":false}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.
- Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.
- Plans et dimensions officiels non établis par les sources consultées.

**Contrôles attendus :**

- Porte intégrée à un support visible et physiquement accessible.
- Changements d’étage avec un accès approprié ; scènes orbitales séparées.
- Mesures listées = modèle du projet, jamais cotation officielle revendiquée.

**Connexions :**

| Accès | Destination | Montage | x / z | Condition |
| --- | --- | --- | --- | --- |
| egg_vault>pilot_chamber | Chambre du pilote | organic-shell | 170 / 0.69 | selon phase |

### Baie et sas du récupérateur

Identifiant : `rop:lieux:salvage_bay`

Séquence extérieure au plan colonial, attestée dans l’extrait. Ne pas la relier à la colonie par une porte.

**Provenance :** sequence_roman_absente_du_parcours. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Vue de référence, matériaux, échelle et circulation à documenter.

**Chronologie :** Scène indépendante de la carte coloniale ; ellipse de récit explicite.

**Jeu :** Lieu manquant ; aucune porte locale vers Hadley’s Hope.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor, acteurs, objectifs et transitions propres à la scène absents.
- Références et plan architectural à établir.

**Contrôles attendus :**

- Ne jamais relier Gateway ou la récupération spatiale à LV-426 par une porte.

### Navette retrouvée / couchette de Ripley

Identifiant : `rop:lieux:salvage_shuttle`

Séquence extérieure au plan colonial, attestée dans l’extrait. Ne pas la relier à la colonie par une porte.

**Provenance :** sequence_roman_absente_du_parcours. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Vue de référence, matériaux, échelle et circulation à documenter.

**Chronologie :** Scène indépendante de la carte coloniale ; ellipse de récit explicite.

**Jeu :** Lieu manquant ; aucune porte locale vers Hadley’s Hope.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor, acteurs, objectifs et transitions propres à la scène absents.
- Références et plan architectural à établir.

**Contrôles attendus :**

- Ne jamais relier Gateway ou la récupération spatiale à LV-426 par une porte.

### Service médical de Gateway Station

Identifiant : `rop:lieux:orbital_medical`

Séquence extérieure au plan colonial, attestée dans l’extrait. Ne pas la relier à la colonie par une porte.

**Provenance :** sequence_roman_absente_du_parcours. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Vue de référence, matériaux, échelle et circulation à documenter.

**Chronologie :** Scène indépendante de la carte coloniale ; ellipse de récit explicite.

**Jeu :** Lieu manquant ; aucune porte locale vers Hadley’s Hope.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor, acteurs, objectifs et transitions propres à la scène absents.
- Références et plan architectural à établir.

**Contrôles attendus :**

- Ne jamais relier Gateway ou la récupération spatiale à LV-426 par une porte.

### Cabine de descente de Brackett

Identifiant : `rop:lieux:dropship_arrival`

Séquence extérieure au plan colonial, attestée dans l’extrait. Ne pas la relier à la colonie par une porte.

**Provenance :** sequence_roman_absente_du_parcours. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Vue de référence, matériaux, échelle et circulation à documenter.

**Chronologie :** Scène indépendante de la carte coloniale ; ellipse de récit explicite.

**Jeu :** Lieu manquant ; aucune porte locale vers Hadley’s Hope.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Décor, acteurs, objectifs et transitions propres à la scène absents.
- Références et plan architectural à établir.

**Contrôles attendus :**

- Ne jamais relier Gateway ou la récupération spatiale à LV-426 par une porte.

### Pont de pilotage du récupérateur

Identifiant : `rop:lieux:salvage_flight_deck`

Poste où Moore reste pendant la descente des autres récupérateurs.

**Provenance :** lieu_atteste_extrait_roman. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Consoles, sièges, affichages et volumes à documenter.

**Chronologie :** 16 mai 2179 — récupération spatiale.

**Jeu :** Scène hors carte coloniale ; aucun ajout de porte locale.

**Localisation :** salvage_flight_deck

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Scène, décor, profil de Moore et raccord vers la baie à produire.

**Contrôles attendus :**

- Conserver Moore au poste de pilotage dans cette scène ; pas dans le groupe qui descend.

## Armes et équipements

### M41A · fusil à impulsion

Identifiant : `rop:armes_equipements:pulse`

M41A utilisable dans le modèle récupéré.

**Provenance :** equipement_de_gameplay. Références : [R8](https://propstore.com/product/aliens-1986/m41a-pulse-rifle/)

**Apparence :** Silhouette, poignée supérieure, canon, lance-grenades et compteur à contrôler. Chargeur de 30 = règle du jeu.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** référence visuelle du film ; chargeur de 30 = équilibre de jeu. Règles de jeu : {"fuel":60,"grenades":3,"issueDuration":2,"flameRange":350,"flameDamage":11,"flameInterval":0.16,"grenadeRange":560,"grenadeRadius":135,"grenadeDamage":95}.

**Localisation :** Armurerie de la garnison

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel et vues utiles absents.
- Poses tenue, visée, tir et rechargement à produire pour les personnages admissibles.

**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### M240 · lance-flammes

Identifiant : `rop:armes_equipements:flame`

M240 facultatif du râtelier.

**Provenance :** reference_identifiee_implementation_adaptee. Références : [R4](https://propstore.com/product/aliens-1986/19-ellen-ripleys-sigourney-weaver-practical-special-effects-m240-flamethrower/)

**Apparence :** Référence d’accessoire du film ; dotation exacte dans le roman à confirmer.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** accessoire du film attesté R4 ; attribution dans ce roman à confirmer. Règles de jeu : {"fuel":60,"grenades":3,"issueDuration":2,"flameRange":350,"flameDamage":11,"flameInterval":0.16,"grenadeRange":560,"grenadeRadius":135,"grenadeDamage":95}.

**Localisation :** Armurerie de la garnison

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel et vues utiles absents.
- Poses tenue, visée, tir et rechargement à produire pour les personnages admissibles.

**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Lance-grenades sous canon

Identifiant : `rop:armes_equipements:grenade`

Mode sous-canon du M41A, projectile et explosion natifs.

**Provenance :** equipement_de_gameplay. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Reste attaché au bon fusil ; pas une arme autonome ajoutée.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** complément du M41A ; règles et réserve originales. Règles de jeu : {"fuel":60,"grenades":3,"issueDuration":2,"flameRange":350,"flameDamage":11,"flameInterval":0.16,"grenadeRange":560,"grenadeRadius":135,"grenadeDamage":95}.

**Localisation :** Armurerie de la garnison

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel et vues utiles absents.
- Poses tenue, visée, tir et rechargement à produire pour les personnages admissibles.

**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Fusil à pompe — présence à vérifier

Identifiant : `rop:armes_equipements:shotgun`

Référence du fusil de Hicks dans Aliens ; aucun porteur ou scène de River of Pain confirmé.

**Provenance :** presence_dans_ce_recit_a_verifier. Références : [R9](https://propstoreauction.com/lot-details/index/catalog/318/lot/94872/Lot-19-ALIENS-1986-Corporal-Dwayne-Hicks-Michael-Biehn-Hero-Shotgun)

**Apparence :** Forme filmique documentée ; pas d’ajout automatique à la dotation de Brackett.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucun objet jouable spécifique livré dans ce DLC.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel et vues utiles absents.
- Présence dans River of Pain non confirmée ; ne pas ajouter par analogie avec Aliens.

**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Pile de service

Identifiant : `rop:armes_equipements:cell`

Équipement du système d’inventaire colonial.

**Provenance :** equipement_de_gameplay. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Équipement de l’inventaire interprété dans le langage industriel du film. La fonction et l’identifiant proviennent des données du DLC ; dessin généré, sans certification d’un modèle canonique exact ni ajout de capacité de jeu.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Objet ou commande natif. {"label":"Pile de service","capacity":6}

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** {"inventoryRules":{"label":"Pile de service","capacity":6},"physicalMeasurement":"non_documentee"}

**État :** génération = png_present ; intégration = png_inventaire ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [item-cell](../assets/item-cell.png) — dimensions globales non relues, pose inventory, ancre 785/523

**À compléter :**


**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Fil de raccordement

Identifiant : `rop:armes_equipements:wire`

Équipement du système d’inventaire colonial.

**Provenance :** equipement_de_gameplay. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Équipement de l’inventaire interprété dans le langage industriel du film. La fonction et l’identifiant proviennent des données du DLC ; dessin généré, sans certification d’un modèle canonique exact ni ajout de capacité de jeu.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Objet ou commande natif. {"label":"Fil de raccordement","capacity":6}

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** {"inventoryRules":{"label":"Fil de raccordement","capacity":6},"physicalMeasurement":"non_documentee"}

**État :** génération = png_present ; intégration = png_inventaire ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [item-wire](../assets/item-wire.png) — dimensions globales non relues, pose inventory, ancre 765/526

**À compléter :**


**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Boîtier vide

Identifiant : `rop:armes_equipements:casing`

Équipement du système d’inventaire colonial.

**Provenance :** equipement_de_gameplay. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Équipement de l’inventaire interprété dans le langage industriel du film. La fonction et l’identifiant proviennent des données du DLC ; dessin généré, sans certification d’un modèle canonique exact ni ajout de capacité de jeu.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Objet ou commande natif. {"label":"Boîtier vide","capacity":4}

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** {"inventoryRules":{"label":"Boîtier vide","capacity":4},"physicalMeasurement":"non_documentee"}

**État :** génération = png_present ; intégration = png_inventaire ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [item-casing](../assets/item-casing.png) — dimensions globales non relues, pose inventory, ancre 768/509

**À compléter :**


**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Balise sonore

Identifiant : `rop:armes_equipements:decoy`

création de gameplay

**Provenance :** equipement_de_gameplay. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Équipement de l’inventaire interprété dans le langage industriel du film. La fonction et l’identifiant proviennent des données du DLC ; dessin généré, sans certification d’un modèle canonique exact ni ajout de capacité de jeu.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Objet ou commande natif. {"label":"Balise sonore","capacity":2}

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** {"inventoryRules":{"label":"Balise sonore","capacity":2},"physicalMeasurement":"non_documentee"}

**État :** génération = png_present ; intégration = png_inventaire ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [item-decoy](../assets/item-decoy.png) — dimensions globales non relues, pose inventory, ancre 653/568

**À compléter :**


**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Portion froide

Identifiant : `rop:armes_equipements:ration`

Équipement du système d’inventaire colonial.

**Provenance :** equipement_de_gameplay. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Équipement de l’inventaire interprété dans le langage industriel du film. La fonction et l’identifiant proviennent des données du DLC ; dessin généré, sans certification d’un modèle canonique exact ni ajout de capacité de jeu.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Objet ou commande natif. {"label":"Portion froide","healing":25}

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** {"inventoryRules":{"label":"Portion froide","healing":25},"physicalMeasurement":"non_documentee"}

**État :** génération = png_present ; intégration = png_inventaire ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [item-ration](../assets/item-ration.png) — dimensions globales non relues, pose inventory, ancre 763/509

**À compléter :**


**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Trousse de soins

Identifiant : `rop:armes_equipements:medkit`

règle de soin simplifiée

**Provenance :** equipement_de_gameplay. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Équipement de l’inventaire interprété dans le langage industriel du film. La fonction et l’identifiant proviennent des données du DLC ; dessin généré, sans certification d’un modèle canonique exact ni ajout de capacité de jeu.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Objet ou commande natif. {"label":"Trousse de soins","capacity":8}

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** {"inventoryRules":{"label":"Trousse de soins","capacity":8},"physicalMeasurement":"non_documentee"}

**État :** génération = png_present ; intégration = png_inventaire ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [item-medkit](../assets/item-medkit.png) — dimensions globales non relues, pose inventory, ancre 753/514

**À compléter :**


**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Munitions M41A

Identifiant : `rop:armes_equipements:ammo`

Équipement du système d’inventaire colonial.

**Provenance :** equipement_de_gameplay. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Équipement de l’inventaire interprété dans le langage industriel du film. La fonction et l’identifiant proviennent des données du DLC ; dessin généré, sans certification d’un modèle canonique exact ni ajout de capacité de jeu.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Objet ou commande natif. {"label":"Munitions M41A","capacity":150}

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** {"inventoryRules":{"label":"Munitions M41A","capacity":150},"physicalMeasurement":"non_documentee"}

**État :** génération = png_present ; intégration = png_inventaire ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [item-ammo](../assets/item-ammo.png) — dimensions globales non relues, pose inventory, ancre 769/524

**À compléter :**


**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Fusée de détresse

Identifiant : `rop:armes_equipements:flare`

durée simulée

**Provenance :** equipement_de_gameplay. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Équipement de l’inventaire interprété dans le langage industriel du film. La fonction et l’identifiant proviennent des données du DLC ; dessin généré, sans certification d’un modèle canonique exact ni ajout de capacité de jeu.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Objet ou commande natif. {"label":"Fusée de détresse","capacity":8}

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** {"inventoryRules":{"label":"Fusée de détresse","capacity":8},"physicalMeasurement":"non_documentee"}

**État :** génération = png_present ; intégration = png_inventaire ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [item-flare](../assets/item-flare.png) — dimensions globales non relues, pose inventory, ancre 781/523

**À compléter :**


**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Détecteur

Identifiant : `rop:armes_equipements:tracker`

Détecteur de mouvements et interface natifs.

**Provenance :** equipement_de_gameplay. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Forme documentée dans le registre d’images ; portée et détection simplifiées pour le jeu. Corps guidé par les photographies de la réplique Master Replicas M314 et boîtier d’écran guidé par un accessoire filmique présenté par Propstore. La réplique n’est pas un original de tournage. Poignée ouverte et écran latéral saillant conservés ; affichage radar et petits détails de surface interprétés, sans certification 1:1.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Objet ou commande natif. présent · contacts locaux et échos

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = png_present ; intégration = png_inventaire ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [item-tracker](../assets/item-tracker.png) — dimensions globales non relues, pose inventory, ancre 672/586

**À compléter :**


**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Poste à souder

Identifiant : `rop:armes_equipements:weld`

Outil de soudure des passages.

**Provenance :** equipement_de_gameplay. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Prise, câble, porte ciblée et point d’effet alignés. Référence photographique fournie : accessoire de soudage portatif d’Aliens (1986). Poignée nervurée, clip latéral, commande rouge, embout transversal et écran de protection relevé conservés. Interprétation peinte sans effet de découpe ni ajout de capacité de jeu ; reproduction 1:1 non certifiée.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Objet ou commande natif. présent · soudures physiques

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = png_present ; intégration = png_inventaire ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [item-weld](../assets/item-weld.png) — dimensions globales non relues, pose inventory, ancre 634/636

**À compléter :**


**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Lampe

Identifiant : `rop:armes_equipements:light`

Lampe de service à batterie.

**Provenance :** equipement_de_gameplay. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Lentille, prise, faisceau et attachage alignés sur l’action. Référence photographique Propstore : USCM Shoulder Torch Pack, collection Harry Harris. Boîtier perforé, poignée ouverte, bras articulés et tête carrée à lentille circulaire conservés. Interprétation peinte sans faisceau actif ; aucun modèle 1:1 certifié.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Objet ou commande natif. présent · batterie et faisceau

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = png_present ; intégration = png_inventaire ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [item-light](../assets/item-light.png) — dimensions globales non relues, pose inventory, ancre 768/508

**À compléter :**


**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Balise de repli

Identifiant : `rop:armes_equipements:marker`

Balise de repli du gameplay.

**Provenance :** creation_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette, pièces et marquages à documenter.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Objet ou commande natif. présent · repères persistants

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel et vues utiles absents.

**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Robot de découpe de récupération

Identifiant : `rop:armes_equipements:cutter`

Robot de découpe de récupération spatiale.

**Provenance :** reference_identifiee_implementation_adaptee. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Réserver à la séquence de récupération ; aucune attribution marine sans source.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucun objet jouable spécifique livré dans ce DLC.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel et vues utiles absents.
- Scène spatiale et fonctionnalités propres absentes du parcours.

**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Scanner de récupération

Identifiant : `rop:armes_equipements:scanner`

Scanner de récupération spatiale.

**Provenance :** reference_identifiee_implementation_adaptee. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Capteur distinct du détecteur de mouvements colonial.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucun objet jouable spécifique livré dans ce DLC.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel et vues utiles absents.
- Scène spatiale et fonctionnalités propres absentes du parcours.

**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Scaphandre de récupération

Identifiant : `rop:armes_equipements:suit`

Scaphandre de récupération spatiale.

**Provenance :** reference_identifiee_implementation_adaptee. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Casque, combinaison, gants et joints à documenter pour cette scène.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucun objet jouable spécifique livré dans ce DLC.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel et vues utiles absents.
- Scène spatiale et fonctionnalités propres absentes du parcours.

**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Pistolet-grappin de la navette

Identifiant : `rop:armes_equipements:grappler`

Déposé sur les commandes de la navette de Ripley ; distinct du réseau de bras de capture de la baie.

**Provenance :** reference_identifiee_implementation_adaptee. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Arme/outil et emplacement à référencer séparément des bras qui retiennent le vaisseau.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucun objet jouable spécifique livré dans ce DLC.

**Localisation :** salvage_shuttle

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel et vues utiles absents.
- Scène spatiale et fonctionnalités propres absentes du parcours.

**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Smartgun

Identifiant : `rop:armes_equipements:smartgun`

Ne pas déduire sa présence dans River of Pain du seul arsenal de la franchise.

**Provenance :** presence_dans_ce_recit_a_verifier. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette, pièces et marquages à documenter.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucun objet jouable spécifique livré dans ce DLC.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel et vues utiles absents.
- Présence dans River of Pain non confirmée ; ne pas ajouter par analogie avec Aliens.

**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Tourelle automatique

Identifiant : `rop:armes_equipements:sentry`

Ne pas déduire sa présence dans River of Pain du seul arsenal de la franchise.

**Provenance :** presence_dans_ce_recit_a_verifier. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette, pièces et marquages à documenter.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucun objet jouable spécifique livré dans ce DLC.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel et vues utiles absents.
- Présence dans River of Pain non confirmée ; ne pas ajouter par analogie avec Aliens.

**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Pistolet de service

Identifiant : `rop:armes_equipements:pistol`

Ne pas déduire sa présence dans River of Pain du seul arsenal de la franchise.

**Provenance :** presence_dans_ce_recit_a_verifier. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette, pièces et marquages à documenter.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucun objet jouable spécifique livré dans ce DLC.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel et vues utiles absents.
- Présence dans River of Pain non confirmée ; ne pas ajouter par analogie avec Aliens.

**Contrôles attendus :**

- Une forme filmique ne prouve pas sa dotation dans le roman.
- Conserver portée, ressources, règles et sauvegardes natives.

### Outils portés des résidents

Identifiant : `rop:armes_equipements:resident-tools`

Accessoire métier inclus dans certains PNG humains, sans sprite autonome.

**Provenance :** creation_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Conserver outil, prise et échelle propres au résident.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Ne crée pas un objet récupérable.

**Localisation :** Coursive résidentielle ; Magasin de fret ; Garage des prospecteurs ; Centre de loisirs

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = png_present ; intégration = inclus_dans_png_personnage_et_rendu_natif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [vale-idle-right](../assets/vale-idle-right.png) — dimensions globales non relues, pose idle, ancre 510/1548 ; [ferris-idle-right](../assets/ferris-idle-right.png) — dimensions globales non relues, pose idle, ancre 495/1526 ; [hale-idle-right](../assets/hale-idle-right.png) — dimensions globales non relues, pose idle, ancre 490.5/1504 ; [bell-idle-right](../assets/bell-idle-right.png) — dimensions globales non relues, pose idle, ancre 475/1519

**À compléter :**

- Vues individuelles et attaches modulaires pour les animations métier.

**Contrôles attendus :**

- Ne pas doubler un outil déjà inclus dans le corps.

### Gobelet porté du résident

Identifiant : `rop:armes_equipements:resident-mug`

Accessoire métier inclus dans certains PNG humains, sans sprite autonome.

**Provenance :** creation_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Conserver outil, prise et échelle propres au résident.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Ne crée pas un objet récupérable.

**Localisation :** Réfectoire

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = png_present ; intégration = inclus_dans_png_personnage_et_rendu_natif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [rhee-idle-right](../assets/rhee-idle-right.png) — dimensions globales non relues, pose idle, ancre 490/1533

**À compléter :**

- Vues individuelles et attaches modulaires pour les animations métier.

**Contrôles attendus :**

- Ne pas doubler un outil déjà inclus dans le corps.

### Tablette de service des résidents

Identifiant : `rop:armes_equipements:resident-tablet`

Accessoire métier inclus dans certains PNG humains, sans sprite autonome.

**Provenance :** creation_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Conserver outil, prise et échelle propres au résident.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Ne crée pas un objet récupérable.

**Localisation :** Infirmerie ; Salle des archives ; Relais de communications ; Atelier biomédical ; Coursive centrale ; Bureau des prospecteurs

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = png_present ; intégration = inclus_dans_png_personnage_et_rendu_natif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [arden-idle-right](../assets/arden-idle-right.png) — dimensions globales non relues, pose idle, ancre 477.5/1520 ; [becker-idle-right](../assets/becker-idle-right.png) — dimensions globales non relues, pose idle, ancre 472.5/1521 ; [corban-idle-right](../assets/corban-idle-right.png) — dimensions globales non relues, pose idle, ancre 504.5/1531 ; [doran-idle-right](../assets/doran-idle-right.png) — dimensions globales non relues, pose idle, ancre 470.5/1499 ; [kent-idle-right](../assets/kent-idle-right.png) — dimensions globales non relues, pose idle, ancre 502/1514 ; [voss-idle-right](../assets/voss-idle-right.png) — dimensions globales non relues, pose idle, ancre 487/1513

**À compléter :**

- Vues individuelles et attaches modulaires pour les animations métier.

**Contrôles attendus :**

- Ne pas doubler un outil déjà inclus dans le corps.

### Linge porté du résident

Identifiant : `rop:armes_equipements:resident-linen`

Accessoire métier inclus dans certains PNG humains, sans sprite autonome.

**Provenance :** creation_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Conserver outil, prise et échelle propres au résident.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Ne crée pas un objet récupérable.

**Localisation :** Buanderie

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = png_present ; intégration = inclus_dans_png_personnage_et_rendu_natif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [sato-idle-right](../assets/sato-idle-right.png) — dimensions globales non relues, pose idle, ancre 485.5/1518

**À compléter :**

- Vues individuelles et attaches modulaires pour les animations métier.

**Contrôles attendus :**

- Ne pas doubler un outil déjà inclus dans le corps.

## Props et mobilier

### Antenne technique

Identifiant : `rop:props:prop-antenna`

Communication ou mesure, raccordée au poste. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Aire d’atterrissage ; Contrôle colonial ; Relais de communications ; Terrasse des antennes

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| pad-set-1 | pad | 845 / 0.22 | FIXTURES / renderer | non |
| ops-set-3 | ops | 1540 / 0.22 | FIXTURES / renderer | non |
| relay-set-1 | relay | 791 / 0.22 | FIXTURES / renderer | non |
| aerial-set-2 | aerial | 2250 / 0.27 | FIXTURES / floor | non |

### Borne de loisirs

Identifiant : `rop:props:prop-arcade`

Machine du centre de loisirs avec état d’alimentation cohérent. 3 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 1 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Centre de loisirs

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"recreation-cover1","room":"recreation","footprint":{"w":125,"d":0.17}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| recreation-set-0 | recreation | 417 / 0.22 | FIXTURES / renderer | non |
| recreation-set-2 | recreation | 1125 / 0.22 | FIXTURES / renderer | non |
| recreation-cover1 | recreation | 810 / 0.48 | ACTORS / renderer | oui |

### Barrière de périmètre

Identifiant : `rop:props:prop-barrier`

Guide la circulation d’un espace industriel ou extérieur. 5 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Aire d’atterrissage ; Piste du plateau ; Plateau des relevés ; Accès au processeur un ; Terrasse des antennes

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| pad-detail-3 | pad | 2001 / 0.38 | ACTORS / floor | non |
| road-detail-3 | road | 2553 / 0.38 | ACTORS / floor | non |
| plateau-detail-3 | plateau | 2001 / 0.38 | ACTORS / floor | non |
| approach-detail-3 | approach | 2208 / 0.38 | ACTORS / floor | non |
| aerial-set-5 | aerial | 1450 / 0.26 | FIXTURES / floor | non |

### Balise d’approche

Identifiant : `rop:props:prop-beacon`

Repère lumineux de la zone d’arrivée. 8 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Aire d’atterrissage ; Piste du plateau ; Plateau des relevés ; Accès au processeur un ; Terrasse des antennes

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| pad-set-0 | pad | 442 / 0.22 | FIXTURES / renderer | non |
| pad-set-3 | pad | 1652 / 0.22 | FIXTURES / renderer | non |
| road-set-0 | road | 562 / 0.22 | FIXTURES / renderer | non |
| road-set-3 | road | 2494 / 0.22 | FIXTURES / renderer | non |
| plateau-set-2 | plateau | 1450 / 0.22 | FIXTURES / renderer | non |
| approach-set-1 | approach | 1056 / 0.22 | FIXTURES / renderer | non |
| approach-set-4 | approach | 2688 / 0.22 | FIXTURES / renderer | non |
| aerial-set-9 | aerial | 2440 / 0.27 | FIXTURES / floor | non |

### Lit

Identifiant : `rop:props:prop-bed`

Distinguer mobilier médical et domestique selon la salle. 8 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 2 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Logement des Jorden ; Infirmerie ; Chambre d’isolement ; Atelier biomédical

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"med-cover1","room":"med","footprint":{"w":210,"d":0.14}},{"id":"biomed-cover1","room":"biomed","footprint":{"w":205,"d":0.13}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| jorden-set-0 | jorden | 354 / 0.22 | FIXTURES / renderer | non |
| jorden-set-4 | jorden | 1268 / 0.22 | FIXTURES / renderer | non |
| med-set-0 | med | 433 / 0.22 | FIXTURES / renderer | non |
| med-set-2 | med | 1207 / 0.22 | FIXTURES / renderer | non |
| med-set-5 | med | 2367 / 0.22 | FIXTURES / renderer | non |
| med-cover1 | med | 1050 / 0.48 | ACTORS / renderer | oui |
| isolation-set-0 | isolation | 362 / 0.22 | FIXTURES / renderer | non |
| biomed-cover1 | biomed | 720 / 0.46 | ACTORS / renderer | oui |

### Lampe de chevet

Identifiant : `rop:props:prop-bed-lamp`

Éclairage associé au lit et à son support. 2 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Logement des Jorden ; Atelier biomédical

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| jorden-detail-3 | jorden | 1276 / 0.38 | ACTORS / floor | non |
| biomed-set-8 | biomed | 615 / 0.27 | FIXTURES / floor | non |

### Banc

Identifiant : `rop:props:prop-bench`

Assise collective ; certaines instances sont physiques. 6 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Banc collectif bas et large, assise gris-vert, dossier rectangulaire vert sombre à cinq séparations verticales, deux pieds épais. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 3 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Coursive centrale ; Centre de loisirs

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-64,"right":61,"top":-69,"bottom":0,"width":125,"height":69,"centerX":-1.5,"mountHeight":0},"physicalFootprints":[{"id":"concourse-cover1","room":"concourse","footprint":{"w":190,"d":0.12}},{"id":"concourse-cover3","room":"concourse","footprint":{"w":150,"d":0.1}},{"id":"recreation-cover2","room":"recreation","footprint":{"w":240,"d":0.12}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-bench](../assets/prop-bench.png) — dimensions globales non relues, pose static, ancre 842.5/852

**À compléter :**

- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| concourse-set-0 | concourse | 420 / 0.22 | FIXTURES / renderer | non |
| concourse-set-6 | concourse | 2580 / 0.22 | FIXTURES / renderer | non |
| concourse-cover1 | concourse | 1030 / 0.47 | ACTORS / renderer | oui |
| concourse-cover3 | concourse | 2500 / 0.44 | ACTORS / renderer | oui |
| recreation-set-1 | recreation | 771 / 0.22 | FIXTURES / renderer | non |
| recreation-cover2 | recreation | 1430 / 0.51 | ACTORS / renderer | oui |

### Couverture

Identifiant : `rop:props:prop-blanket`

Textile domestique ou médical lié à son support. 2 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Cache des conduits ; Renfoncement des câbles

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| refuge-set-1 | refuge | 716 / 0.22 | FIXTURES / renderer | non |
| nest-set-1 | nest | 560 / 0.7 | FIXTURES / floor | non |

### Panneau boulonné

Identifiant : `rop:props:prop-bolt-panel`

Plaque technique fixée dans sa paroi. 5 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Conduits de l’habitat ; Conduits de l’infirmerie ; Conduits des prospecteurs ; Cache des conduits ; Renfoncement des câbles

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| vent_hab-detail-3 | vent_hab | 1794 / 0.7 | FIXTURES / wall | non |
| vent_med-detail-3 | vent_med | 1656 / 0.7 | FIXTURES / wall | non |
| vent_survey-detail-3 | vent_survey | 1622 / 0.7 | FIXTURES / wall | non |
| refuge-detail-3 | refuge | 1388 / 0.7 | FIXTURES / wall | non |
| nest-set-5 | nest | 1190 / 0.7 | FIXTURES / floor | non |

### Câble de service

Identifiant : `rop:props:prop-cable`

Liaison à raccorder à un appareil ou cheminement. 9 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Aire d’atterrissage ; Distribution électrique ; Galerie technique ; Plateau des relevés ; Monte-charge du processeur ; Conduits de l’habitat ; Conduits de l’infirmerie ; Conduits des prospecteurs ; Renfoncement des câbles

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| pad-set-4 | pad | 2055 / 0.22 | FIXTURES / renderer | non |
| power-set-4 | power | 1830 / 0.22 | FIXTURES / renderer | non |
| service-set-3 | service | 2004 / 0.22 | FIXTURES / renderer | non |
| plateau-set-4 | plateau | 2418 / 0.22 | FIXTURES / renderer | non |
| lift-set-0 | lift | 405 / 0.22 | FIXTURES / renderer | non |
| vent_hab-set-1 | vent_hab | 876 / 0.22 | FIXTURES / renderer | non |
| vent_med-set-1 | vent_med | 960 / 0.22 | FIXTURES / renderer | non |
| vent_survey-set-1 | vent_survey | 941 / 0.22 | FIXTURES / renderer | non |
| nest-set-9 | nest | 1580 / 0.7 | FIXTURES / floor | non |

### Touret de câble

Identifiant : `rop:props:prop-cable-spool`

Réserve de câble sur bobine. 6 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Touret de câble horizontal à deux flasques métalliques circulaires, moyeu sombre et trois perforations dans chaque flasque, câble entre les flasques. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Aire d’atterrissage ; Piste du plateau ; Plateau des relevés ; Accès au processeur un ; Terrasse des antennes ; Atelier de manutention

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-51,"right":51,"top":-67,"bottom":-9,"width":102,"height":58,"centerX":0,"mountHeight":9},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-cable-spool](../assets/prop-cable-spool.png) — dimensions globales non relues, pose static, ancre 829.5/919

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| pad-detail-2 | pad | 1450 / 0.38 | ACTORS / floor | non |
| road-detail-2 | road | 1850 / 0.38 | ACTORS / floor | non |
| plateau-detail-2 | plateau | 1450 / 0.38 | ACTORS / floor | non |
| approach-detail-2 | approach | 1600 / 0.38 | ACTORS / floor | non |
| aerial-set-3 | aerial | 1710 / 0.29 | FIXTURES / floor | non |
| workshop-set-6 | workshop | 1860 / 0.29 | FIXTURES / floor | non |

### Chemin de câbles

Identifiant : `rop:props:prop-cable-tray`

Support mural ou suspendu pour réseaux. 14 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Salle des archives ; Magasin de fret ; Distribution électrique ; Station de pompage ; Galerie technique ; Processeur six ; Monte-charge du processeur ; Soubassements envahis ; Galerie du refroidissement ; Conduits de l’habitat ; Conduits de l’infirmerie ; Conduits des prospecteurs ; Relais de communications ; Terrasse des antennes

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| records-detail-2 | records | 900 / 0.7 | ACTORS / floor | non |
| stores-detail-4 | stores | 2728 / 0.38 | ACTORS / floor | non |
| power-detail-4 | power | 342 / 0.38 | ACTORS / floor | non |
| pump-detail-4 | pump | 366 / 0.38 | ACTORS / floor | non |
| service-detail-3 | service | 2070 / 0.7 | ACTORS / floor | non |
| processor6-detail-4 | processor6 | 2640 / 0.38 | ACTORS / floor | non |
| lift-detail-2 | lift | 900 / 0.7 | ACTORS / floor | non |
| hive-detail-4 | hive | 2640 / 0.38 | ACTORS / floor | non |
| coolant-detail-4 | coolant | 2376 / 0.38 | ACTORS / floor | non |
| vent_hab-detail-2 | vent_hab | 1517 / 0.7 | ACTORS / floor | non |
| vent_med-detail-2 | vent_med | 1380 / 0.7 | ACTORS / floor | non |
| vent_survey-detail-2 | vent_survey | 1175 / 0.7 | ACTORS / floor | non |
| relay-detail-2 | relay | 975 / 0.7 | ACTORS / floor | non |
| aerial-set-8 | aerial | 2070 / 0.27 | FIXTURES / wall | non |

### Chariot de manutention

Identifiant : `rop:props:prop-cart`

Roues et plateau doivent garder une ligne de sol cohérente. 3 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 3 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Infirmerie ; Atelier biomédical

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"med-cover2","room":"med","footprint":{"w":165,"d":0.16}},{"id":"med-cover3","room":"med","footprint":{"w":140,"d":0.04}},{"id":"biomed-cover3","room":"biomed","footprint":{"w":135,"d":0.1}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| med-cover2 | med | 1830 / 0.51 | ACTORS / renderer | oui |
| med-cover3 | med | 1630 / 0.865 | ACTORS / renderer | oui |
| biomed-cover3 | biomed | 1830 / 0.41 | ACTORS / renderer | oui |

### Mallette rigide

Identifiant : `rop:props:prop-case`

Conteneur de service, distinct des conteneurs interactifs. 5 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Caisse d’armurerie créée pour remplacer le modèle générique des cinq instances case. Design industriel de l’adaptation ; aucun modèle canonique exact revendiqué.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Armurerie de la garnison

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [armory-case](../assets/armory-case.png) — dimensions globales non relues, pose static, ancre 884/762

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| armory-v09-1 | armory | 418 / 0.41 | ACTORS / renderer | non |
| armory-v09-3 | armory | 758 / 0.41 | ACTORS / renderer | non |
| armory-v09-4 | armory | 1128 / 0.41 | ACTORS / renderer | non |
| armory-v09-6 | armory | 1458 / 0.41 | ACTORS / renderer | non |
| armory-v09-8 | armory | 1828 / 0.41 | ACTORS / renderer | non |

### Éclairage de plafond

Identifiant : `rop:props:prop-ceiling-light`

Luminaire relié visuellement à un support supérieur. 10 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Sas des arrivants ; Coursive centrale ; Contrôle colonial ; Poste de la garnison ; Coursive résidentielle ; Garage des prospecteurs ; Bureau des prospecteurs ; Monte-charge du processeur ; Hangar scientifique ; Navette de la Compagnie

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Les données historiques indiquent parfois mount=floor malgré le nom ceiling-light. Vérifier le vrai dessin avant de déplacer l’ancre ; ne pas corriger par simple renommage.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| airlock-detail-4 | airlock | 438 / 0.7 | ACTORS / floor | non |
| concourse-detail-1 | concourse | 1147 / 0.38 | ACTORS / floor | non |
| ops-detail-4 | ops | 366 / 0.38 | ACTORS / floor | non |
| briefing-detail-4 | briefing | 1936 / 0.7 | ACTORS / floor | non |
| hab-detail-3 | hab | 1863 / 0.7 | ACTORS / floor | non |
| garage-detail-4 | garage | 2816 / 0.38 | ACTORS / floor | non |
| survey-detail-4 | survey | 354 / 0.38 | ACTORS / floor | non |
| lift-detail-4 | lift | 655 / 0.7 | ACTORS / floor | non |
| hangar-detail-4 | hangar | 2904 / 0.38 | ACTORS / floor | non |
| shuttle-detail-4 | shuttle | 1892 / 0.7 | ACTORS / floor | non |

### Palan à chaîne

Identifiant : `rop:props:prop-chain-hoist`

Levage nécessitant support et charge cohérents. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Garage des prospecteurs ; Monte-charge du processeur ; Hangar scientifique ; Atelier de manutention

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| garage-detail-0 | garage | 384 / 0.38 | ACTORS / floor | non |
| lift-detail-0 | lift | 650 / 0.7 | ACTORS / floor | non |
| hangar-detail-0 | hangar | 396 / 0.38 | ACTORS / floor | non |
| workshop-set-0 | workshop | 2140 / 0.27 | FIXTURES / floor | non |

### Chaise

Identifiant : `rop:props:prop-chair`

Assise des postes ou des espaces civils. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Chaise coloniale simple sans accoudoirs, assise vert pâle, dossier rectangulaire vert sombre et pieds tubulaires gris-vert. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Contrôle colonial ; Réfectoire ; Centre de loisirs ; Bureau des prospecteurs

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-24,"right":24,"top":-86,"bottom":0,"width":48,"height":86,"centerX":0,"mountHeight":0},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-chair](../assets/prop-chair.png) — dimensions globales non relues, pose static, ancre 620/1232

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| ops-detail-0 | ops | 1156 / 0.38 | ACTORS / floor | non |
| mess-detail-0 | mess | 1180 / 0.38 | ACTORS / floor | non |
| recreation-detail-0 | recreation | 921 / 0.38 | ACTORS / floor | non |
| survey-detail-0 | survey | 1168 / 0.38 | ACTORS / floor | non |

### Cocon de ruche

Identifiant : `rop:props:prop-cocoon`

Volume organique lié à la phase d’envahissement. 6 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 1 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Soubassements envahis ; Galerie du refroidissement

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"hive-cover2","room":"hive","footprint":{"w":190,"d":0.14}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| hive-set-1 | hive | 870 / 0.22 | FIXTURES / renderer | non |
| hive-set-5 | hive | 2550 / 0.22 | FIXTURES / renderer | non |
| hive-cover2 | hive | 2010 / 0.57 | ACTORS / renderer | oui |
| hive-detail-2 | hive | 1500 / 0.38 | ACTORS / floor | non |
| coolant-set-2 | coolant | 1350 / 0.22 | FIXTURES / renderer | non |
| coolant-detail-2 | coolant | 1350 / 0.38 | ACTORS / floor | non |

### Bobine industrielle

Identifiant : `rop:props:prop-coil`

Stockage ou réseau selon la fonction de la salle. 2 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 1 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Distribution électrique

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"power-cover2","room":"power","footprint":{"w":210,"d":0.13}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| power-set-5 | power | 2183 / 0.22 | FIXTURES / renderer | non |
| power-cover2 | power | 1680 / 0.51 | ACTORS / renderer | oui |

### Console technique

Identifiant : `rop:props:prop-console`

Pupitre et affichage associés à une fonction réelle. 10 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : [R11](https://propstore.com/product/aliens-1986/hand-drawn-ron-cobb-a-pcontrol-and-operations-concept-sketch/)

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 2 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Contrôle colonial ; Laboratoire de la Compagnie ; Salle des archives ; Bureau des prospecteurs ; Hangar scientifique ; Navette de la Compagnie ; Relais de communications

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"ops-cover1","room":"ops","footprint":{"w":210,"d":0.16}},{"id":"ops-cover2","room":"ops","footprint":{"w":170,"d":0.14}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Pupitre et instrumentation propres à chaque salle ; un concept A.P. ne valide pas tous les contrôles.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| ops-set-0 | ops | 400 / 0.22 | FIXTURES / renderer | non |
| ops-set-2 | ops | 1040 / 0.22 | FIXTURES / renderer | non |
| ops-cover1 | ops | 960 / 0.49 | ACTORS / renderer | oui |
| ops-cover2 | ops | 1660 / 0.55 | ACTORS / renderer | oui |
| science-set-1 | science | 900 / 0.22 | FIXTURES / renderer | non |
| records-set-2 | records | 900 / 0.22 | FIXTURES / renderer | non |
| survey-set-1 | survey | 846 / 0.22 | FIXTURES / renderer | non |
| hangar-set-3 | hangar | 2214 / 0.22 | FIXTURES / renderer | non |
| shuttle-set-2 | shuttle | 1075 / 0.22 | FIXTURES / renderer | non |
| relay-set-2 | relay | 1159 / 0.22 | FIXTURES / renderer | non |

### Caisse de fret

Identifiant : `rop:props:prop-crate`

Conteneur souvent utilisé comme couverture physique. 11 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 9 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Aire d’atterrissage ; Garage des prospecteurs ; Bureau des prospecteurs ; Magasin de fret ; Piste du plateau ; Plateau des relevés ; Accès au processeur un ; Terrasse des antennes ; Atelier de manutention

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"pad-cover1","room":"pad","footprint":{"w":160,"d":0.13}},{"id":"garage-cover3","room":"garage","footprint":{"w":120,"d":0.12}},{"id":"survey-cover2","room":"survey","footprint":{"w":190,"d":0.14}},{"id":"stores-cover2","room":"stores","footprint":{"w":180,"d":0.13}},{"id":"road-cover1","room":"road","footprint":{"w":160,"d":0.13}},{"id":"plateau-cover1","room":"plateau","footprint":{"w":160,"d":0.13}},{"id":"approach-cover1","room":"approach","footprint":{"w":160,"d":0.13}},{"id":"aerial-cover1","room":"aerial","footprint":{"w":240,"d":0.16}},{"id":"workshop-cover3","room":"workshop","footprint":{"w":150,"d":0.12}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| pad-cover1 | pad | 1102 / 0.56 | ACTORS / renderer | oui |
| garage-cover3 | garage | 2850 / 0.48 | ACTORS / renderer | oui |
| survey-cover2 | survey | 1675 / 0.57 | ACTORS / renderer | oui |
| stores-set-0 | stores | 458 / 0.22 | FIXTURES / renderer | non |
| stores-set-4 | stores | 2205 / 0.22 | FIXTURES / renderer | non |
| stores-cover2 | stores | 2110 / 0.52 | ACTORS / renderer | oui |
| road-cover1 | road | 1406 / 0.56 | ACTORS / renderer | oui |
| plateau-cover1 | plateau | 1102 / 0.56 | ACTORS / renderer | oui |
| approach-cover1 | approach | 1216 / 0.56 | ACTORS / renderer | oui |
| aerial-cover1 | aerial | 830 / 0.47 | ACTORS / renderer | oui |
| workshop-cover3 | workshop | 2370 / 0.52 | ACTORS / renderer | oui |

### Placard

Identifiant : `rop:props:prop-cupboard`

Rangement posé ou fixé à une structure. 3 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Adaptation du type « cupboard » présent dans le renderer v0.9 et les salles du DLC. Palette et construction cohérentes avec le mobilier industriel de Hadley’s Hope. Forme individuelle non attestée comme accessoire précis du film. Dimensions, placement et légendes natifs conservés ; aucune fidélité 1:1 de l’objet ni état ouvert/animé certifiés. Ancrage mesuré sur alpha ≥ 16 ; le PNG entier reste dessiné, pixels inchangés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 1 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Logement des Jorden ; Office de la cuisine

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-45,"right":45,"top":-158,"bottom":0,"width":90,"height":158,"centerX":0,"mountHeight":0},"physicalFootprints":[{"id":"jorden-cover2","room":"jorden","footprint":{"w":130,"d":0.16}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-cupboard](../assets/prop-cupboard.png) — 948 × 1660, pose static, ancre 473.5/1621

**À compléter :**

- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| jorden-set-3 | jorden | 1039 / 0.22 | FIXTURES / renderer | non |
| jorden-cover2 | jorden | 1190 / 0.53 | ACTORS / renderer | oui |
| pantry-set-3 | pantry | 1500 / 0.27 | FIXTURES / floor | non |

### Plaque de porte

Identifiant : `rop:props:prop-door-plaque`

Signalétique liée à une porte précise. 1 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Coursive résidentielle

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| hab-detail-0 | hab | 324 / 0.7 | FIXTURES / wall | non |

### Dessin personnel

Identifiant : `rop:props:prop-drawing`

Détail de vie coloniale attaché à un support. 6 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Coursive résidentielle ; Logement des Jorden ; Centre de loisirs ; Conduits de l’habitat ; Cache des conduits ; Renfoncement des câbles

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| hab-set-5 | hab | 2275 / 0.22 | FIXTURES / renderer | non |
| jorden-set-2 | jorden | 811 / 0.22 | FIXTURES / renderer | non |
| recreation-set-4 | recreation | 1833 / 0.22 | FIXTURES / renderer | non |
| vent_hab-set-4 | vent_hab | 2148 / 0.22 | FIXTURES / renderer | non |
| refuge-set-3 | refuge | 1351 / 0.22 | FIXTURES / renderer | non |
| nest-set-0 | nest | 380 / 0.7 | FIXTURES / floor | non |

### Jonction de conduit

Identifiant : `rop:props:prop-duct-junction`

Raccord aligné sur les volumes de ventilation. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Conduits de l’habitat ; Conduits de l’infirmerie ; Conduits des prospecteurs ; Renfoncement des câbles

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| vent_hab-detail-0 | vent_hab | 1614 / 0.7 | ACTORS / floor | non |
| vent_med-detail-0 | vent_med | 722 / 0.7 | ACTORS / floor | non |
| vent_survey-detail-0 | vent_survey | 933 / 0.7 | ACTORS / floor | non |
| nest-set-4 | nest | 870 / 0.7 | FIXTURES / floor | non |

### Œuf xénomorphe

Identifiant : `rop:props:prop-egg`

Œuf individuel, silhouette et échelle propres à la scène. 1 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Interprétation peinte d’un œuf filmique fourni en référence : volume ovoïde, enveloppe organique brun olive et quatre lèvres closes. Prop statique fermé ; aucun état ouvert ni contenu généré.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Soubassements envahis

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [egg-sealed](../assets/egg-sealed.png) — dimensions globales non relues, pose static, ancre 627/1154

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| hive-set-4 | hive | 2130 / 0.22 | FIXTURES / renderer | non |

### Lit d’œufs

Identifiant : `rop:props:prop-egg-bed`

Zone organique large ; un œuf seul ne la remplace pas. 1 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Tapis organique large ancré dans son empreinte de sol.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 1 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Cale aux œufs

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"egg_vault-v09-10","room":"egg_vault","footprint":{"w":2060,"d":0.14}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Texture large spécifique absente ; un œuf vertical ne remplace pas cette emprise.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| egg_vault-v09-10 | egg_vault | 1400 / 0.33 | ACTORS / renderer | oui |

### Ventilateur

Identifiant : `rop:props:prop-fan`

Organe d’air fixé à une ouverture technique. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Sas des arrivants ; Coursive centrale ; Galerie technique ; Conduits de l’habitat

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| airlock-set-2 | airlock | 900 / 0.22 | FIXTURES / renderer | non |
| concourse-set-5 | concourse | 2220 / 0.22 | FIXTURES / renderer | non |
| service-set-1 | service | 996 / 0.22 | FIXTURES / renderer | non |
| vent_hab-set-3 | vent_hab | 1724 / 0.22 | FIXTURES / renderer | non |

### Armoire incendie

Identifiant : `rop:props:prop-fire-cabinet`

Coffret mural de secours, légende conservée. 9 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Armoire incendie verticale rouge-brun patiné, cadre rectangulaire et niche sombre montrant un extincteur ocre avec poignée, inscription FIRE. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Coursive centrale ; Coursive résidentielle ; Réfectoire ; Centre de loisirs ; Magasin de fret ; Galerie technique ; Buanderie ; Atelier de manutention ; Dérivation des eaux grises

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-31,"right":31,"top":-128,"bottom":-26,"width":62,"height":102,"centerX":0,"mountHeight":26},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-fire-cabinet](../assets/prop-fire-cabinet.png) — dimensions globales non relues, pose static, ancre 491.5/1523

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| concourse-detail-2 | concourse | 1717 / 0.38 | ACTORS / floor | non |
| hab-detail-1 | hab | 1054 / 0.7 | ACTORS / floor | non |
| mess-detail-4 | mess | 342 / 0.38 | ACTORS / floor | non |
| recreation-detail-4 | recreation | 384 / 0.38 | ACTORS / floor | non |
| stores-detail-3 | stores | 2139 / 0.38 | ACTORS / floor | non |
| service-detail-4 | service | 2640 / 0.7 | ACTORS / floor | non |
| wash-detail-4 | wash | 866 / 0.38 | ACTORS / floor | non |
| workshop-set-9 | workshop | 2660 / 0.27 | FIXTURES / floor | non |
| drain-set-7 | drain | 2450 / 0.27 | FIXTURES / floor | non |

### Projecteur

Identifiant : `rop:props:prop-floodlight`

Éclairage industriel, pied et câble raccordés. 6 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Aire d’atterrissage ; Piste du plateau ; Plateau des relevés ; Accès au processeur un ; Terrasse des antennes ; Dérivation des eaux grises

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| pad-detail-1 | pad | 899 / 0.38 | ACTORS / floor | non |
| road-detail-1 | road | 1364 / 0.38 | ACTORS / floor | non |
| plateau-detail-1 | plateau | 899 / 0.38 | ACTORS / floor | non |
| approach-detail-1 | approach | 992 / 0.38 | ACTORS / floor | non |
| aerial-set-4 | aerial | 1150 / 0.27 | FIXTURES / floor | non |
| drain-set-9 | drain | 2570 / 0.27 | FIXTURES / floor | non |

### Réfrigérateur

Identifiant : `rop:props:prop-fridge`

Stockage de cuisine ou du réfectoire. 3 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Adaptation du type « fridge » présent dans le renderer v0.9 et les salles du DLC. Palette et construction cohérentes avec le mobilier industriel de Hadley’s Hope. Forme individuelle non attestée comme accessoire précis du film. Dimensions, placement et légendes natifs conservés ; aucune fidélité 1:1 de l’objet ni état ouvert/animé certifiés. Ancrage mesuré sur alpha ≥ 16 ; le PNG entier reste dessiné, pixels inchangés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 1 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Réserve médicale ; Office de la cuisine

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-45,"right":45,"top":-158,"bottom":0,"width":90,"height":158,"centerX":0,"mountHeight":0},"physicalFootprints":[{"id":"pantry-cover2","room":"pantry","footprint":{"w":160,"d":0.16}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-fridge](../assets/prop-fridge.png) — 1086 × 1448, pose static, ancre 544.5/1430

**À compléter :**

- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| clinic_store-set-2 | clinic_store | 1002 / 0.22 | FIXTURES / renderer | non |
| pantry-set-0 | pantry | 1320 / 0.27 | FIXTURES / floor | non |
| pantry-cover2 | pantry | 1220 / 0.53 | ACTORS / renderer | oui |

### Réserve de carburant

Identifiant : `rop:props:prop-fuel`

Conteneur en zone extérieure ou de maintenance. 6 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 2 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Aire d’atterrissage ; Garage des prospecteurs ; Hangar scientifique ; Terrasse des antennes ; Atelier de manutention

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"hangar-cover1","room":"hangar","footprint":{"w":245,"d":0.16}},{"id":"aerial-cover2","room":"aerial","footprint":{"w":180,"d":0.13}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| pad-set-2 | pad | 1248 / 0.22 | FIXTURES / renderer | non |
| garage-set-2 | garage | 1780 / 0.22 | FIXTURES / renderer | non |
| hangar-set-1 | hangar | 1086 / 0.22 | FIXTURES / renderer | non |
| hangar-cover1 | hangar | 1270 / 0.46 | ACTORS / renderer | oui |
| aerial-cover2 | aerial | 1670 / 0.52 | ACTORS / renderer | oui |
| workshop-set-7 | workshop | 820 / 0.27 | FIXTURES / floor | non |

### Portique

Identifiant : `rop:props:prop-gantry`

Structure porteuse avec base et passage visibles. 6 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Garage des prospecteurs ; Magasin de fret ; Processeur six ; Monte-charge du processeur ; Hangar scientifique ; Atelier de manutention

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| garage-set-3 | garage | 2144 / 0.22 | FIXTURES / renderer | non |
| stores-set-3 | stores | 1768 / 0.22 | FIXTURES / renderer | non |
| processor6-set-3 | processor6 | 2184 / 0.22 | FIXTURES / renderer | non |
| lift-set-2 | lift | 1065 / 0.22 | FIXTURES / renderer | non |
| hangar-set-2 | hangar | 1650 / 0.22 | FIXTURES / renderer | non |
| workshop-set-8 | workshop | 2140 / 0.27 | FIXTURES / floor | non |

### Manomètre

Identifiant : `rop:props:prop-gauge`

Instrument relié à un circuit de pression. 6 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Distribution électrique ; Station de pompage ; Galerie technique ; Processeur six ; Monte-charge du processeur ; Dérivation des eaux grises

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| power-detail-0 | power | 312 / 0.38 | FIXTURES / wall | non |
| pump-detail-0 | pump | 288 / 0.38 | FIXTURES / wall | non |
| service-detail-0 | service | 360 / 0.7 | FIXTURES / wall | non |
| processor6-detail-0 | processor6 | 360 / 0.38 | FIXTURES / wall | non |
| lift-detail-3 | lift | 1242 / 0.7 | FIXTURES / wall | non |
| drain-set-2 | drain | 690 / 0.27 | FIXTURES / floor | non |

### Vitre d’isolement

Identifiant : `rop:props:prop-glass`

Fenêtre murale ; jamais une porte debout au milieu du sol. 1 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Fenêtre murale d’isolement : bas visible à 53 unités au-dessus du sol. Transparence réelle requise. Cloison vitrée d’isolement créée pour le type glass. Matériaux et forme interprétés à partir de sa fonction dans la scène ; pas un plan canonique du roman.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Chambre d’isolement

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [isolation-glass](../assets/isolation-glass.png) — dimensions globales non relues, pose static, ancre 580/1321

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| isolation-set-2 | isolation | 850 / 0.22 | FIXTURES / renderer | non |

### Armoire vitrée

Identifiant : `rop:props:prop-glass-cabinet`

Rangement au vitrage réellement transparent. 2 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Le type glass-cabinet partageait un panneau vitré mobile. La vitrine à deux étagères individualise ce type dans son enveloppe native, avec vrai vitrage transparent ; aménagement interprété, sans accessoire filmique exact authentifié.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Laboratoire de la Compagnie ; Atelier biomédical

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-57,"right":57,"top":-154,"bottom":3,"width":114,"height":157,"centerX":0,"mountHeight":-3},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-glass-cabinet](../assets/prop-glass-cabinet.png) — dimensions globales non relues, pose static, ancre 533.5/1401

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| science-detail-0 | science | 1373 / 0.38 | ACTORS / floor | non |
| biomed-set-4 | biomed | 1570 / 0.27 | FIXTURES / floor | non |

### Grille technique

Identifiant : `rop:props:prop-grille`

Protection de conduit ou de sol dans la bonne orientation. 6 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Conduits de l’habitat ; Conduits de l’infirmerie ; Conduits des prospecteurs

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| vent_hab-set-0 | vent_hab | 452 / 0.22 | FIXTURES / renderer | non |
| vent_hab-set-2 | vent_hab | 1300 / 0.22 | FIXTURES / renderer | non |
| vent_med-set-0 | vent_med | 480 / 0.22 | FIXTURES / renderer | non |
| vent_med-set-2 | vent_med | 1440 / 0.22 | FIXTURES / renderer | non |
| vent_survey-set-0 | vent_survey | 474 / 0.22 | FIXTURES / renderer | non |
| vent_survey-set-2 | vent_survey | 1409 / 0.22 | FIXTURES / renderer | non |

### Civière roulante

Identifiant : `rop:props:prop-gurney`

Passage libre pour patient et roues. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Brancard médical vide large et bas, matelas vert désaturé, plateau clair sur deux pieds métalliques à petites roulettes. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Infirmerie ; Chambre d’isolement ; Réserve médicale ; Atelier biomédical

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-77,"right":77,"top":-82,"bottom":5,"width":154,"height":87,"centerX":0,"mountHeight":-5},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-gurney](../assets/prop-gurney.png) — dimensions globales non relues, pose static, ancre 835.5/886

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| med-detail-4 | med | 2464 / 0.38 | ACTORS / floor | non |
| isolation-detail-4 | isolation | 667 / 0.7 | ACTORS / floor | non |
| clinic_store-detail-4 | clinic_store | 1496 / 0.7 | ACTORS / floor | non |
| biomed-set-0 | biomed | 540 / 0.27 | FIXTURES / floor | non |

### Porte de logement décorative

Identifiant : `rop:props:prop-hab-door`

Façade à distinguer d’un portail interactif. 3 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Coursive résidentielle

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| hab-set-0 | hab | 425 / 0.22 | FIXTURES / renderer | non |
| hab-set-2 | hab | 1165 / 0.22 | FIXTURES / renderer | non |
| hab-set-4 | hab | 1905 / 0.22 | FIXTURES / renderer | non |

### Diable

Identifiant : `rop:props:prop-hand-truck`

Outil à roues et bavette de manutention. 2 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Diable de manutention vide, cadre tubulaire gris-vert à deux montants et barre de poignée, petite bavette basse, deux roues sombres. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Magasin de fret ; Atelier de manutention

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-37,"right":38,"top":-100,"bottom":11,"width":75,"height":111,"centerX":0.5,"mountHeight":-11},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-hand-truck](../assets/prop-hand-truck.png) — dimensions globales non relues, pose static, ancre 517/1502

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| stores-detail-0 | stores | 372 / 0.38 | ACTORS / floor | non |
| workshop-set-5 | workshop | 1320 / 0.27 | FIXTURES / floor | non |

### Manteau suspendu

Identifiant : `rop:props:prop-hanging-coat`

Vêtement accroché à hauteur cohérente. 5 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Manteau de travail colonial vert désaturé suspendu à une petite barre et un cintre, deux manches baissées et fermeture verticale centrale. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Poste de la garnison ; Logement des Jorden ; Navette de la Compagnie ; Buanderie ; Office de la cuisine

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-36,"right":36,"top":-145,"bottom":-33,"width":72,"height":112,"centerX":0,"mountHeight":33},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-hanging-coat](../assets/prop-hanging-coat.png) — dimensions globales non relues, pose static, ancre 510.5/1519

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| briefing-detail-0 | briefing | 698 / 0.7 | ACTORS / floor | non |
| jorden-detail-2 | jorden | 925 / 0.38 | ACTORS / floor | non |
| shuttle-detail-0 | shuttle | 692 / 0.7 | ACTORS / floor | non |
| wash-detail-0 | wash | 873 / 0.38 | ACTORS / floor | non |
| pantry-set-8 | pantry | 1790 / 0.27 | FIXTURES / floor | non |

### Trappe

Identifiant : `rop:props:prop-hatch`

Ouverture technique distincte d’un conduit traversable. 1 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Navette de la Compagnie

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| shuttle-set-4 | shuttle | 1743 / 0.22 | FIXTURES / renderer | non |

### Enrouleur de flexible

Identifiant : `rop:props:prop-hose-reel`

Flexible sur support de service. 5 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Enrouleur de flexible, grande bobine circulaire métallique avec tuyau sombre en spires concentriques et extrémité pendante à droite presque jusqu’au sol. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Sas des arrivants ; Garage des prospecteurs ; Hangar scientifique ; Buanderie ; Dérivation des eaux grises

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-37,"right":37,"top":-107,"bottom":-4,"width":74,"height":103,"centerX":0,"mountHeight":4},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-hose-reel](../assets/prop-hose-reel.png) — dimensions globales non relues, pose static, ancre 588/1291

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| airlock-detail-1 | airlock | 558 / 0.7 | ACTORS / floor | non |
| garage-detail-2 | garage | 1817 / 0.38 | ACTORS / floor | non |
| hangar-detail-2 | hangar | 1867 / 0.38 | ACTORS / floor | non |
| wash-detail-1 | wash | 791 / 0.38 | ACTORS / floor | non |
| drain-set-3 | drain | 1100 / 0.27 | FIXTURES / floor | non |

### Hotte de cuisine

Identifiant : `rop:props:prop-kitchen-hood`

Extraction au-dessus de la cuisson. 2 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Réfectoire ; Office de la cuisine

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| mess-detail-2 | mess | 1517 / 0.38 | ACTORS / floor | non |
| pantry-set-5 | pantry | 850 / 0.27 | FIXTURES / floor | non |

### Paillasse

Identifiant : `rop:props:prop-lab-bench`

Plan de travail scientifique ; certaines instances sont physiques. 3 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : [R10](https://propstore.com/product/aliens-1986/hand-drawn-ron-cobb-medlab-concept-sketch/)

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Établi de laboratoire bas et large, plateau gris-vert clair sur deux pieds métalliques, petit tapis ou support vert et deux récipients translucides sur le plateau. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 2 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Laboratoire de la Compagnie ; Atelier biomédical

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-77,"right":77,"top":-114,"bottom":-3,"width":154,"height":111,"centerX":0,"mountHeight":3},"physicalFootprints":[{"id":"science-cover1","room":"science","footprint":{"w":210,"d":0.15}},{"id":"biomed-cover2","room":"biomed","footprint":{"w":190,"d":0.14}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-lab-bench](../assets/prop-lab-bench.png) — dimensions globales non relues, pose static, ancre 738.5/957

**À compléter :**

- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer au concept Medlab puis au décor final sans confondre les deux.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| science-detail-1 | science | 1395 / 0.38 | ACTORS / floor | non |
| science-cover1 | science | 840 / 0.51 | ACTORS / renderer | oui |
| biomed-cover2 | biomed | 1450 / 0.5 | ACTORS / renderer | oui |

### Luminaire de service

Identifiant : `rop:props:prop-lamp`

Éclairage ponctuel fixé à l’architecture. 2 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Sas des arrivants ; Monte-charge du processeur

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| airlock-set-4 | airlock | 1428 / 0.22 | FIXTURES / renderer | non |
| lift-set-3 | lift | 1395 / 0.22 | FIXTURES / renderer | non |

### Linge

Identifiant : `rop:props:prop-linen`

Textile de réserve ou en transport. 2 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Adaptation du type « linen » présent dans le renderer v0.9 et les salles du DLC. Palette et construction cohérentes avec le mobilier industriel de Hadley’s Hope. Forme individuelle non attestée comme accessoire précis du film. Dimensions, placement et légendes natifs conservés ; aucune fidélité 1:1 de l’objet ni état ouvert/animé certifiés. Ancrage mesuré sur alpha ≥ 16 ; le PNG entier reste dessiné, pixels inchangés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 1 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Buanderie

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-41.5,"right":51.5,"top":-89,"bottom":0,"width":93,"height":89,"centerX":5,"mountHeight":0},"physicalFootprints":[{"id":"wash-cover2","room":"wash","footprint":{"w":190,"d":0.14}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-linen](../assets/prop-linen.png) — 1278 × 1230, pose static, ancre 630/1169

**À compléter :**

- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| wash-set-2 | wash | 925 / 0.22 | FIXTURES / renderer | non |
| wash-cover2 | wash | 1240 / 0.57 | ACTORS / renderer | oui |

### Casier

Identifiant : `rop:props:prop-locker`

Rangement vertical à la hauteur et légende natives. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Casier de stockage colonial haut à deux portes étroites, acier vert-bleu sombre, fentes d’aération supérieures, poignée claire et marquage STOCK. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Sas des arrivants ; Poste de la garnison

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-45,"right":45,"top":-158,"bottom":0,"width":90,"height":158,"centerX":0,"mountHeight":0},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-locker](../assets/prop-locker.png) — dimensions globales non relues, pose static, ancre 472/1633

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| airlock-set-1 | airlock | 636 / 0.22 | FIXTURES / renderer | non |
| briefing-set-0 | briefing | 383 / 0.22 | FIXTURES / renderer | non |
| briefing-set-3 | briefing | 1243 / 0.22 | FIXTURES / renderer | non |
| briefing-set-5 | briefing | 1817 / 0.22 | FIXTURES / renderer | non |

### Plan mural

Identifiant : `rop:props:prop-map`

Orientation ; contenu du plan à documenter séparément. 2 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Contrôle colonial ; Bureau des prospecteurs

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| ops-set-5 | ops | 2000 / 0.22 | FIXTURES / renderer | non |
| survey-set-0 | survey | 442 / 0.22 | FIXTURES / renderer | non |

### Signal médical

Identifiant : `rop:props:prop-medical-cross`

Repère mural au-dessus du poste ou passage. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Plaque carrée médicale ivoire, simple croix vert désaturé centrée, cadre fin. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Infirmerie ; Chambre d’isolement ; Réserve médicale ; Atelier biomédical

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-25,"right":25,"top":-142,"bottom":-90,"width":50,"height":52,"centerX":0,"mountHeight":90},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-medical-cross](../assets/prop-medical-cross.png) — dimensions globales non relues, pose static, ancre 628.5/1117

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| med-detail-2 | med | 1580 / 0.38 | FIXTURES / wall | non |
| isolation-detail-2 | isolation | 850 / 0.7 | FIXTURES / wall | non |
| clinic_store-detail-2 | clinic_store | 850 / 0.7 | FIXTURES / wall | non |
| biomed-set-6 | biomed | 970 / 0.27 | FIXTURES / wall | non |

### Médicaments

Identifiant : `rop:props:prop-medicine`

Fournitures sur rangement médical identifiable. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Adaptation du type « medicine » présent dans le renderer v0.9 et les salles du DLC. Palette et construction cohérentes avec le mobilier industriel de Hadley’s Hope. Forme individuelle non attestée comme accessoire précis du film. Dimensions, placement et légendes natifs conservés ; aucune fidélité 1:1 de l’objet ni état ouvert/animé certifiés. Ancrage mesuré sur alpha ≥ 16 ; le PNG entier reste dessiné, pixels inchangés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Infirmerie ; Réserve médicale ; Atelier biomédical

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-62,"right":62,"top":-170,"bottom":1,"width":124,"height":171,"centerX":0,"mountHeight":-1},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-medicine](../assets/prop-medicine.png) — 1070 × 1470, pose static, ancre 529.5/1433

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| med-set-4 | med | 2160 / 0.22 | FIXTURES / renderer | non |
| clinic_store-set-0 | clinic_store | 392 / 0.22 | FIXTURES / renderer | non |
| clinic_store-set-3 | clinic_store | 1308 / 0.22 | FIXTURES / renderer | non |
| biomed-set-5 | biomed | 1520 / 0.29 | FIXTURES / floor | non |

### Microscope

Identifiant : `rop:props:prop-microscope`

Optique d’observation et socle. 1 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** L’optique du PNG précise une forme native générique ; cette précision reste une adaptation. Le type microscope existait avec un pupitre générique. La forme optique individualise ce sens dans la même enveloppe de rendu ; dessin interprété, sans modèle filmique ou description détaillée authentifiée.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Laboratoire de la Compagnie

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-40,"right":50,"top":-78,"bottom":0,"width":90,"height":78,"centerX":5,"mountHeight":0},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-microscope](../assets/prop-microscope.png) — dimensions globales non relues, pose static, ancre 671/1155

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| science-set-4 | science | 1680 / 0.22 | FIXTURES / renderer | non |

### Moniteur

Identifiant : `rop:props:prop-monitor`

Appareil de contrôle sur son support. 3 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Terminal médical rétro compact, écran cyan sombre au-dessus d’un socle pupitre gris-vert, commandes physiques sur une surface inclinée. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Infirmerie ; Chambre d’isolement ; Atelier biomédical

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-40,"right":50,"top":-78,"bottom":0,"width":90,"height":78,"centerX":5,"mountHeight":0},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-monitor](../assets/prop-monitor.png) — dimensions globales non relues, pose static, ancre 657.5/1148

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| med-set-1 | med | 1000 / 0.22 | FIXTURES / renderer | non |
| isolation-set-1 | isolation | 606 / 0.22 | FIXTURES / renderer | non |
| biomed-set-1 | biomed | 655 / 0.27 | FIXTURES / floor | non |

### Gobelet

Identifiant : `rop:props:prop-mug`

Objet d’usage quotidien des postes civils. 6 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Logement des Jorden ; Réfectoire ; Centre de loisirs ; Cache des conduits ; Office de la cuisine ; Renfoncement des câbles

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| jorden-detail-1 | jorden | 574 / 0.38 | ACTORS / floor | non |
| mess-detail-1 | mess | 1240 / 0.38 | ACTORS / floor | non |
| recreation-detail-2 | recreation | 1125 / 0.38 | ACTORS / floor | non |
| refuge-detail-0 | refuge | 861 / 0.7 | ACTORS / floor | non |
| pantry-set-6 | pantry | 950 / 0.27 | FIXTURES / floor | non |
| nest-set-6 | nest | 650 / 0.7 | FIXTURES / floor | non |

### Présence médicale signalée

Identifiant : `rop:props:prop-named-doctor`

Repère de scène qui ne remplace pas un humain individualisé. 1 placement(s) de base.

**Provenance :** repere_source_forme_et_implantation_adaptees. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Infirmerie

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Distinguer repère de décor et véritable profil médical individualisé.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| med-v09-16 | med | 1810 / 0.38 | ACTORS / renderer | non |

### Unité obstétricale

Identifiant : `rop:props:prop-natal-unit`

Nacelle médicale volumineuse à capot transparent. 1 placement(s) de base.

**Provenance :** repere_source_forme_et_implantation_adaptees. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Capot principalement transparent, corps volumineux. Châssis détaillé et raccords adaptés. Unité obstétricale et capot principalement transparent décrits dans l’extrait autorisé Titan Books / Daily Dead (S18). Enveloppe, socle et commande à droite repris du DLC ; géométrie détaillée et matériaux interprétés. Vitrage à véritable alpha partiel ; aucun patient représenté.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Infirmerie

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-93,"right":111,"top":-109,"bottom":3,"width":204,"height":112,"centerX":9,"mountHeight":-3},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-natal-unit](../assets/prop-natal-unit.png) — dimensions globales non relues, pose static, ancre 837.5/868

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| med-v09-14 | med | 2220 / 0.32 | ACTORS / renderer | non |

### Panneau d’affichage

Identifiant : `rop:props:prop-noticeboard`

Informations murales de la colonie. 7 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Tableau mural colonial horizontal, cadre métal gris-vert, surface vert pâle et petites fiches ou lignes de consigne claires. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Coursive centrale ; Contrôle colonial ; Poste de la garnison ; Coursive résidentielle ; Centre de loisirs ; Bureau des prospecteurs ; Office de la cuisine

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-36,"right":36,"top":-148,"bottom":-99,"width":72,"height":49,"centerX":0,"mountHeight":99},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-noticeboard](../assets/prop-noticeboard.png) — dimensions globales non relues, pose static, ancre 760/863

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| concourse-detail-0 | concourse | 360 / 0.38 | FIXTURES / wall | non |
| ops-detail-1 | ops | 924 / 0.38 | FIXTURES / wall | non |
| briefing-detail-2 | briefing | 920 / 0.7 | FIXTURES / wall | non |
| hab-detail-4 | hab | 2376 / 0.7 | FIXTURES / wall | non |
| recreation-detail-1 | recreation | 878 / 0.38 | FIXTURES / wall | non |
| survey-detail-1 | survey | 955 / 0.38 | FIXTURES / wall | non |
| pantry-set-9 | pantry | 460 / 0.27 | FIXTURES / wall | non |

### Bouteille d’oxygène

Identifiant : `rop:props:prop-oxygen`

Réservoir, régulateur et support stable. 7 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Bouteille d’oxygène verticale gris-vert, col étroit avec robinet et petit manomètre rond à droite, pied rectangulaire sombre. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Sas des arrivants ; Infirmerie ; Chambre d’isolement ; Laboratoire de la Compagnie ; Navette de la Compagnie ; Réserve médicale ; Atelier biomédical

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-18,"right":18,"top":-99,"bottom":1,"width":36,"height":100,"centerX":0,"mountHeight":-1},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-oxygen](../assets/prop-oxygen.png) — dimensions globales non relues, pose static, ancre 367.5/1964

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| airlock-detail-0 | airlock | 433 / 0.7 | ACTORS / floor | non |
| med-detail-1 | med | 1736 / 0.38 | ACTORS / floor | non |
| isolation-detail-1 | isolation | 527 / 0.7 | ACTORS / floor | non |
| science-detail-2 | science | 1417 / 0.38 | ACTORS / floor | non |
| shuttle-detail-1 | shuttle | 666 / 0.7 | ACTORS / floor | non |
| clinic_store-detail-1 | clinic_store | 527 / 0.7 | ACTORS / floor | non |
| biomed-set-2 | biomed | 465 / 0.27 | FIXTURES / floor | non |

### Palette

Identifiant : `rop:props:prop-pallet`

Support de fret avec emprise lisible. 5 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 3 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Magasin de fret ; Hangar scientifique

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"stores-cover1","room":"stores","footprint":{"w":280,"d":0.14}},{"id":"stores-cover3","room":"stores","footprint":{"w":120,"d":0.04}},{"id":"hangar-cover2","room":"hangar","footprint":{"w":260,"d":0.14}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| stores-set-2 | stores | 1332 / 0.22 | FIXTURES / renderer | non |
| stores-cover1 | stores | 1160 / 0.48 | ACTORS / renderer | oui |
| stores-cover3 | stores | 2430 / 0.86 | ACTORS / renderer | oui |
| hangar-set-4 | hangar | 2778 / 0.22 | FIXTURES / renderer | non |
| hangar-cover2 | hangar | 2130 / 0.54 | ACTORS / renderer | oui |

### Panneau de commande

Identifiant : `rop:props:prop-panel`

Interface fixée à la cloison ou à l’appareil. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Sas des arrivants ; Distribution électrique ; Monte-charge du processeur

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| airlock-set-3 | airlock | 1164 / 0.22 | FIXTURES / renderer | non |
| power-set-1 | power | 950 / 0.22 | FIXTURES / renderer | non |
| power-set-3 | power | 1477 / 0.22 | FIXTURES / renderer | non |
| lift-set-1 | lift | 735 / 0.22 | FIXTURES / renderer | non |

### Photographie personnelle

Identifiant : `rop:props:prop-photo`

Détail domestique ; ne pas inventer une identité canonique. 3 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Logement des Jorden ; Cache des conduits ; Renfoncement des câbles

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| jorden-detail-0 | jorden | 222 / 0.38 | FIXTURES / wall | non |
| refuge-detail-1 | refuge | 542 / 0.7 | FIXTURES / wall | non |
| nest-set-8 | nest | 720 / 0.7 | FIXTURES / wall | non |

### Siège du pilote de l’épave

Identifiant : `rop:props:prop-pilot-seat`

Structure biomécanique monumentale liée à sa chambre. 1 placement(s) de base.

**Provenance :** repere_source_forme_et_implantation_adaptees. Références : [R2](https://www.avpgalaxy.net/website/interviews/christopher-golden/)

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 1 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Chambre du pilote

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"pilot_chamber-v09-10","room":"pilot_chamber","footprint":{"w":280,"d":0.17}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Référence du pilote/Space Jockey, proportions du siège et raccord à sa chambre à établir.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| pilot_chamber-v09-10 | pilot_chamber | 1470 / 0.34 | ACTORS / renderer | oui |

### Conduite

Identifiant : `rop:props:prop-pipe`

Réseau technique continu avec fixations. 9 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 1 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Station de pompage ; Galerie technique ; Processeur six ; Accès au processeur un ; Conduits de l’infirmerie ; Dérivation des eaux grises

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"processor6-cover2","room":"processor6","footprint":{"w":210,"d":0.14}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| pump-set-1 | pump | 816 / 0.22 | FIXTURES / renderer | non |
| service-set-0 | service | 492 / 0.22 | FIXTURES / renderer | non |
| service-set-2 | service | 1500 / 0.22 | FIXTURES / renderer | non |
| service-set-4 | service | 2508 / 0.22 | FIXTURES / renderer | non |
| processor6-set-4 | processor6 | 2508 / 0.22 | FIXTURES / renderer | non |
| processor6-cover2 | processor6 | 2080 / 0.49 | ACTORS / renderer | oui |
| approach-set-2 | approach | 1600 / 0.22 | FIXTURES / renderer | non |
| vent_med-set-3 | vent_med | 1920 / 0.22 | FIXTURES / renderer | non |
| drain-set-1 | drain | 550 / 0.27 | FIXTURES / floor | non |

### Coude de conduite

Identifiant : `rop:props:prop-pipe-elbow`

Changement de direction raccordé aux tronçons. 9 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Coursive centrale ; Coursive résidentielle ; Distribution électrique ; Station de pompage ; Galerie technique ; Processeur six ; Soubassements envahis ; Galerie du refroidissement ; Dérivation des eaux grises

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| concourse-detail-4 | concourse | 2640 / 0.38 | ACTORS / floor | non |
| hab-detail-2 | hab | 1567 / 0.7 | ACTORS / floor | non |
| power-detail-1 | power | 1240 / 0.38 | ACTORS / floor | non |
| pump-detail-1 | pump | 961 / 0.38 | ACTORS / floor | non |
| service-detail-1 | service | 1147 / 0.7 | ACTORS / floor | non |
| processor6-detail-1 | processor6 | 930 / 0.38 | ACTORS / floor | non |
| hive-detail-3 | hive | 2070 / 0.38 | ACTORS / floor | non |
| coolant-detail-3 | coolant | 1863 / 0.38 | ACTORS / floor | non |
| drain-set-5 | drain | 1500 / 0.27 | FIXTURES / floor | non |

### Plante cultivée

Identifiant : `rop:props:prop-plant`

Culture entretenue dans un contenant. 1 placement(s) de base.

**Provenance :** repere_source_forme_et_implantation_adaptees. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Plante cultivée en pot ; une serre ne prouve pas une flore sauvage de LV-426. Petite plante de logement en pot cubique gris-vert, cinq feuilles ou tiges longues vert olive en éventail, silhouette entière isolée. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Coursive résidentielle

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-33,"right":33,"top":-101.8414519259386,"bottom":0,"width":66,"height":101.8414519259386,"centerX":0,"mountHeight":0},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-plant](../assets/prop-plant.png) — dimensions globales non relues, pose static, ancre 511.5/1500

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| hab-set-3 | hab | 1535 / 0.22 | FIXTURES / renderer | non |

### Bac de culture

Identifiant : `rop:props:prop-planter`

Culture intérieure, drainage et support. 8 placement(s) de base.

**Provenance :** repere_source_forme_et_implantation_adaptees. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Bac de culture intérieur avec drainage et support cohérents.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 4 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Serre vitrée

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"greenhouse-v09-0","room":"greenhouse","footprint":{"w":250,"d":0.11}},{"id":"greenhouse-v09-1","room":"greenhouse","footprint":{"w":250,"d":0.11}},{"id":"greenhouse-v09-2","room":"greenhouse","footprint":{"w":250,"d":0.11}},{"id":"greenhouse-v09-3","room":"greenhouse","footprint":{"w":250,"d":0.11}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| greenhouse-v09-0 | greenhouse | 650 / 0.4 | ACTORS / renderer | oui |
| greenhouse-v09-1 | greenhouse | 1300 / 0.4 | ACTORS / renderer | oui |
| greenhouse-v09-2 | greenhouse | 1950 / 0.4 | ACTORS / renderer | oui |
| greenhouse-v09-3 | greenhouse | 1260 / 0.58 | ACTORS / renderer | oui |
| greenhouse-v09-4 | greenhouse | 460 / 0.19 | FIXTURES / renderer | non |
| greenhouse-v09-5 | greenhouse | 900 / 0.19 | FIXTURES / renderer | non |
| greenhouse-v09-6 | greenhouse | 1650 / 0.19 | FIXTURES / renderer | non |
| greenhouse-v09-7 | greenhouse | 2180 / 0.19 | FIXTURES / renderer | non |

### Paravent médical

Identifiant : `rop:props:prop-privacy-screen`

Séparation mobile autour des soins. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Paravent médical mobile à panneau rectangulaire translucide vert pâle, deux montants métalliques, pieds en T et petites roulettes. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Infirmerie ; Chambre d’isolement ; Réserve médicale ; Atelier biomédical

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-57,"right":57,"top":-154,"bottom":3,"width":114,"height":157,"centerX":0,"mountHeight":-3},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-privacy-screen](../assets/prop-privacy-screen.png) — dimensions globales non relues, pose static, ancre 543.5/1419

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| med-detail-0 | med | 336 / 0.38 | ACTORS / floor | non |
| isolation-detail-0 | isolation | 638 / 0.7 | ACTORS / floor | non |
| clinic_store-detail-0 | clinic_store | 638 / 0.7 | ACTORS / floor | non |
| biomed-set-7 | biomed | 815 / 0.27 | FIXTURES / floor | non |

### Moteur de pompe

Identifiant : `rop:props:prop-pump-motor`

Machine reliée au réseau, parfois physique. 7 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Groupe moteur de pompe bas horizontal, corps sombre à nombreuses ailettes verticales vert-gris, carter circulaire à droite et semelle métallique rectangulaire. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 2 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Distribution électrique ; Station de pompage ; Processeur six ; Atelier de manutention ; Dérivation des eaux grises

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-70,"right":79,"top":-83,"bottom":0,"width":149,"height":83,"centerX":4.5,"mountHeight":0},"physicalFootprints":[{"id":"pump-cover2","room":"pump","footprint":{"w":175,"d":0.14}},{"id":"drain-cover2","room":"drain","footprint":{"w":240,"d":0.13}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-pump-motor](../assets/prop-pump-motor.png) — dimensions globales non relues, pose static, ancre 848/915

**À compléter :**

- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| power-detail-2 | power | 1517 / 0.38 | ACTORS / floor | non |
| pump-detail-2 | pump | 1417 / 0.38 | ACTORS / floor | non |
| pump-cover2 | pump | 1620 / 0.52 | ACTORS / renderer | oui |
| processor6-detail-2 | processor6 | 1717 / 0.38 | ACTORS / floor | non |
| workshop-set-4 | workshop | 1570 / 0.27 | FIXTURES / floor | non |
| drain-set-4 | drain | 1390 / 0.27 | FIXTURES / floor | non |
| drain-cover2 | drain | 1620 / 0.5 | ACTORS / renderer | oui |

### Rayonnage

Identifiant : `rop:props:prop-rack`

Rangement de pièces sur plusieurs niveaux. 5 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Adaptation du type « rack » présent dans le renderer v0.9 et les salles du DLC. Palette et construction cohérentes avec le mobilier industriel de Hadley’s Hope. Forme individuelle non attestée comme accessoire précis du film. Dimensions, placement et légendes natifs conservés ; aucune fidélité 1:1 de l’objet ni état ouvert/animé certifiés. Ancrage mesuré sur alpha ≥ 16 ; le PNG entier reste dessiné, pixels inchangés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Salle des archives ; Relais de communications

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-62,"right":62,"top":-170,"bottom":1,"width":124,"height":171,"centerX":0,"mountHeight":-1},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-rack](../assets/prop-rack.png) — 1070 × 1470, pose static, ancre 534/1451

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| records-set-0 | records | 372 / 0.22 | FIXTURES / renderer | non |
| records-set-1 | records | 636 / 0.22 | FIXTURES / renderer | non |
| records-set-3 | records | 1164 / 0.22 | FIXTURES / renderer | non |
| relay-set-0 | relay | 424 / 0.22 | FIXTURES / renderer | non |
| relay-set-3 | relay | 1526 / 0.22 | FIXTURES / renderer | non |

### Poste radio

Identifiant : `rop:props:prop-radio`

Communications, antenne et support. 3 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Poste de radio colonial fixe sur pupitre compact gris-vert, petit écran sombre, commandes physiques sur plan incliné, antenne verticale mince à droite. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Poste de la garnison ; Bureau des prospecteurs ; Terrasse des antennes

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-40,"right":50,"top":-135,"bottom":0,"width":90,"height":135,"centerX":5,"mountHeight":0},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-radio](../assets/prop-radio.png) — dimensions globales non relues, pose static, ancre 508/1525

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| briefing-set-4 | briefing | 1530 / 0.22 | FIXTURES / renderer | non |
| survey-set-2 | survey | 1250 / 0.22 | FIXTURES / renderer | non |
| aerial-set-6 | aerial | 1970 / 0.27 | FIXTURES / floor | non |

### Mât radio

Identifiant : `rop:props:prop-radio-mast`

Structure extérieure raccordée au site. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Contrôle colonial ; Bureau des prospecteurs ; Terrasse des antennes

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| ops-detail-2 | ops | 1020 / 0.38 | ACTORS / floor | non |
| survey-detail-2 | survey | 1467 / 0.38 | ACTORS / floor | non |
| aerial-set-0 | aerial | 460 / 0.27 | FIXTURES / floor | non |
| aerial-set-1 | aerial | 1810 / 0.27 | FIXTURES / floor | non |

### Rations exposées

Identifiant : `rop:props:prop-ration`

Réserve visible distincte de l’objet d’inventaire. 2 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Cache des conduits ; Office de la cuisine

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| refuge-set-2 | refuge | 1034 / 0.22 | FIXTURES / renderer | non |
| pantry-set-4 | pantry | 1470 / 0.29 | FIXTURES / floor | non |

### Coffret de fusil

Identifiant : `rop:props:prop-rifle-case`

Conteneur dédié, contenu à référencer. 1 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Poste de la garnison

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| briefing-detail-1 | briefing | 682 / 0.7 | ACTORS / floor | non |

### Râtelier à fusils

Identifiant : `rop:props:prop-rifle-rack`

Support qui ne crée pas une dotation supplémentaire. 1 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Poste de la garnison

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| briefing-set-1 | briefing | 670 / 0.22 | FIXTURES / renderer | non |

### Écran mural

Identifiant : `rop:props:prop-screen`

Affichage lié au contrôle local. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Contrôle colonial ; Salle des archives ; Navette de la Compagnie

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| ops-set-1 | ops | 900 / 0.22 | FIXTURES / renderer | non |
| ops-set-4 | ops | 1500 / 0.22 | FIXTURES / renderer | non |
| records-set-4 | records | 1428 / 0.22 | FIXTURES / renderer | non |
| shuttle-set-3 | shuttle | 1409 / 0.22 | FIXTURES / renderer | non |

### Œuf fermé

Identifiant : `rop:props:prop-sealed-egg`

État fermé sans animation d’ouverture implicite. 8 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Interprétation peinte d’un œuf filmique fourni en référence : volume ovoïde, enveloppe organique brun olive et quatre lèvres closes. Prop statique fermé ; aucun état ouvert ni contenu généré.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Cale aux œufs

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [egg-sealed](../assets/egg-sealed.png) — dimensions globales non relues, pose static, ancre 627/1154

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| egg_vault-v09-11 | egg_vault | 510 / 0.36 | ACTORS / renderer | non |
| egg_vault-v09-12 | egg_vault | 735 / 0.3 | ACTORS / renderer | non |
| egg_vault-v09-13 | egg_vault | 1010 / 0.36 | ACTORS / renderer | non |
| egg_vault-v09-14 | egg_vault | 1260 / 0.36 | ACTORS / renderer | non |
| egg_vault-v09-15 | egg_vault | 1510 / 0.36 | ACTORS / renderer | non |
| egg_vault-v09-16 | egg_vault | 1770 / 0.36 | ACTORS / renderer | non |
| egg_vault-v09-17 | egg_vault | 2040 / 0.36 | ACTORS / renderer | non |
| egg_vault-v09-18 | egg_vault | 2260 / 0.36 | ACTORS / renderer | non |

### Assise intégrée

Identifiant : `rop:props:prop-seat`

Siège associé à la salle ou au véhicule. 2 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Navette de la Compagnie

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| shuttle-set-0 | shuttle | 407 / 0.22 | FIXTURES / renderer | non |
| shuttle-set-1 | shuttle | 741 / 0.22 | FIXTURES / renderer | non |

### Baie informatique

Identifiant : `rop:props:prop-server`

Meuble technique ventilé et alimenté. 2 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Salle des archives ; Relais de communications

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| records-detail-0 | records | 650 / 0.7 | ACTORS / floor | non |
| relay-detail-0 | relay | 631 / 0.7 | ACTORS / floor | non |

### Étagère

Identifiant : `rop:props:prop-shelf`

Rangement ouvert, posé ou fixé. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Adaptation du type « shelf » présent dans le renderer v0.9 et les salles du DLC. Palette et construction cohérentes avec le mobilier industriel de Hadley’s Hope. Forme individuelle non attestée comme accessoire précis du film. Dimensions, placement et légendes natifs conservés ; aucune fidélité 1:1 de l’objet ni état ouvert/animé certifiés. Ancrage mesuré sur alpha ≥ 16 ; le PNG entier reste dessiné, pixels inchangés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Bureau des prospecteurs ; Magasin de fret ; Réserve médicale

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-62,"right":62,"top":-170,"bottom":1,"width":124,"height":171,"centerX":0,"mountHeight":-1},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-shelf](../assets/prop-shelf.png) — 1070 × 1470, pose static, ancre 536/1454

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| survey-set-4 | survey | 2058 / 0.22 | FIXTURES / renderer | non |
| stores-set-1 | stores | 1075 / 0.22 | FIXTURES / renderer | non |
| stores-set-5 | stores | 2642 / 0.22 | FIXTURES / renderer | non |
| clinic_store-set-1 | clinic_store | 698 / 0.22 | FIXTURES / renderer | non |

### Douche de décontamination

Identifiant : `rop:props:prop-shower`

Arrivée et évacuation dans le sas. 1 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Sas des arrivants

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| airlock-set-0 | airlock | 372 / 0.22 | FIXTURES / renderer | non |

### Signalétique

Identifiant : `rop:props:prop-sign`

Panneau cohérent avec la direction réelle du secteur. 1 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Coursive centrale

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| concourse-set-2 | concourse | 1140 / 0.22 | FIXTURES / renderer | non |

### Évier

Identifiant : `rop:props:prop-sink`

Cuve, robinet et raccords. 7 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Meuble évier industriel compact gris-vert, grand bac ovale sombre intégré au plan supérieur, robinet coudé métallique simple à droite. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Réfectoire ; Infirmerie ; Chambre d’isolement ; Laboratoire de la Compagnie ; Buanderie ; Office de la cuisine ; Atelier biomédical

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-50,"right":60,"top":-107,"bottom":0,"width":110,"height":107,"centerX":5,"mountHeight":0},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-sink](../assets/prop-sink.png) — dimensions globales non relues, pose static, ancre 611.5/1228

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| mess-set-5 | mess | 2183 / 0.22 | FIXTURES / renderer | non |
| med-set-3 | med | 1593 / 0.22 | FIXTURES / renderer | non |
| isolation-set-3 | isolation | 1094 / 0.22 | FIXTURES / renderer | non |
| science-set-3 | science | 1360 / 0.22 | FIXTURES / renderer | non |
| wash-set-3 | wash | 1199 / 0.22 | FIXTURES / renderer | non |
| pantry-set-2 | pantry | 540 / 0.27 | FIXTURES / floor | non |
| biomed-set-9 | biomed | 2090 / 0.27 | FIXTURES / floor | non |

### Bocal de spécimen

Identifiant : `rop:props:prop-specimen`

Contenant scientifique ; préserver sa version physique. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Bocal de laboratoire créé pour le prop specimen. Contenant, détails et disposition interprétés ; ne constitue pas une preuve de l’apparence exacte d’un accessoire filmique.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 1 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Chambre d’isolement ; Laboratoire de la Compagnie

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"science-cover2","room":"science","footprint":{"w":175,"d":0.12}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [specimen-jar](../assets/specimen-jar.png) — dimensions globales non relues, pose static, ancre 512/1518

**À compléter :**

- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| isolation-set-4 | isolation | 1338 / 0.22 | FIXTURES / renderer | non |
| science-set-0 | science | 400 / 0.22 | FIXTURES / renderer | non |
| science-set-2 | science | 860 / 0.22 | FIXTURES / renderer | non |
| science-cover2 | science | 1570 / 0.45 | ACTORS / renderer | oui |

### Appareil de cuisson

Identifiant : `rop:props:prop-stove`

Cuisine et extraction reliées au plan de travail. 2 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Adaptation du type « stove » présent dans le renderer v0.9 et les salles du DLC. Palette et construction cohérentes avec le mobilier industriel de Hadley’s Hope. Forme individuelle non attestée comme accessoire précis du film. Dimensions, placement et légendes natifs conservés ; aucune fidélité 1:1 de l’objet ni état ouvert/animé certifiés. Ancrage mesuré sur alpha ≥ 16 ; le PNG entier reste dessiné, pixels inchangés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Réfectoire ; Office de la cuisine

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-50,"right":60,"top":-87,"bottom":0,"width":110,"height":87,"centerX":5,"mountHeight":0},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-stove](../assets/prop-stove.png) — 1402 × 1122, pose static, ancre 692.5/1090

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| mess-set-1 | mess | 950 / 0.22 | FIXTURES / renderer | non |
| pantry-set-1 | pantry | 850 / 0.27 | FIXTURES / floor | non |

### Piquet de relevé

Identifiant : `rop:props:prop-survey-stake`

Repère de prospection implanté au sol. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Aire d’atterrissage ; Piste du plateau ; Plateau des relevés ; Accès au processeur un

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| pad-detail-0 | pad | 348 / 0.38 | ACTORS / floor | non |
| road-detail-0 | road | 444 / 0.38 | ACTORS / floor | non |
| plateau-detail-0 | plateau | 348 / 0.38 | ACTORS / floor | non |
| approach-detail-0 | approach | 384 / 0.38 | ACTORS / floor | non |

### Table

Identifiant : `rop:props:prop-table`

Surface de travail ou mobilier civil selon la pièce. 12 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Adaptation du type « table » présent dans le renderer v0.9 et les salles du DLC. Palette et construction cohérentes avec le mobilier industriel de Hadley’s Hope. Forme individuelle non attestée comme accessoire précis du film. Dimensions, placement et légendes natifs conservés ; aucune fidélité 1:1 de l’objet ni état ouvert/animé certifiés. Ancrage mesuré sur alpha ≥ 16 ; le PNG entier reste dessiné, pixels inchangés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 6 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Poste de la garnison ; Logement des Jorden ; Réfectoire ; Centre de loisirs ; Bureau des prospecteurs ; Office de la cuisine

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-87,"right":90,"top":-57,"bottom":0,"width":177,"height":57,"centerX":1.5,"mountHeight":0},"physicalFootprints":[{"id":"jorden-cover1","room":"jorden","footprint":{"w":205,"d":0.14}},{"id":"mess-cover1","room":"mess","footprint":{"w":185,"d":0.13}},{"id":"mess-cover2","room":"mess","footprint":{"w":250,"d":0.14}},{"id":"mess-cover3","room":"mess","footprint":{"w":130,"d":0.1}},{"id":"survey-cover1","room":"survey","footprint":{"w":160,"d":0.13}},{"id":"pantry-cover1","room":"pantry","footprint":{"w":220,"d":0.13}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-table](../assets/prop-table.png) — 2206 × 713, pose static, ancre 1101/697

**À compléter :**

- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| briefing-set-2 | briefing | 957 / 0.22 | FIXTURES / renderer | non |
| jorden-set-1 | jorden | 582 / 0.22 | FIXTURES / renderer | non |
| jorden-cover1 | jorden | 760 / 0.46 | ACTORS / renderer | oui |
| mess-set-2 | mess | 1123 / 0.22 | FIXTURES / renderer | non |
| mess-set-3 | mess | 1477 / 0.22 | FIXTURES / renderer | non |
| mess-set-4 | mess | 2010 / 0.22 | FIXTURES / renderer | non |
| mess-cover1 | mess | 910 / 0.48 | ACTORS / renderer | oui |
| mess-cover2 | mess | 1580 / 0.49 | ACTORS / renderer | oui |
| mess-cover3 | mess | 2060 / 0.53 | ACTORS / renderer | oui |
| recreation-set-3 | recreation | 1479 / 0.22 | FIXTURES / renderer | non |
| survey-cover1 | survey | 950 / 0.56 | ACTORS / renderer | oui |
| pantry-cover1 | pantry | 730 / 0.44 | ACTORS / renderer | oui |

### Cuve

Identifiant : `rop:props:prop-tank`

Réservoir avec base et conduites cohérentes. 10 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 4 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Laboratoire de la Compagnie ; Station de pompage ; Galerie du refroidissement ; Dérivation des eaux grises

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"pump-cover1","room":"pump","footprint":{"w":210,"d":0.17}},{"id":"coolant-cover1","room":"coolant","footprint":{"w":160,"d":0.13}},{"id":"drain-cover1","room":"drain","footprint":{"w":280,"d":0.16}},{"id":"drain-cover3","room":"drain","footprint":{"w":190,"d":0.1}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| science-set-5 | science | 2000 / 0.22 | FIXTURES / renderer | non |
| pump-set-0 | pump | 432 / 0.22 | FIXTURES / renderer | non |
| pump-set-3 | pump | 1584 / 0.22 | FIXTURES / renderer | non |
| pump-cover1 | pump | 920 / 0.48 | ACTORS / renderer | oui |
| coolant-set-0 | coolant | 462 / 0.22 | FIXTURES / renderer | non |
| coolant-set-3 | coolant | 1794 / 0.22 | FIXTURES / renderer | non |
| coolant-cover1 | coolant | 1026 / 0.56 | ACTORS / renderer | oui |
| drain-set-0 | drain | 490 / 0.27 | FIXTURES / floor | non |
| drain-cover1 | drain | 820 / 0.46 | ACTORS / renderer | oui |
| drain-cover3 | drain | 2180 / 0.44 | ACTORS / renderer | oui |

### Bobines d’enregistrement

Identifiant : `rop:props:prop-tape-reel`

Appareil à bandes fixé au poste. 2 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Petit enregistreur industriel à deux bobines métalliques circulaires côte à côte, moyeux et trois perforations dans chaque bobine, bande sombre entre les deux. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Salle des archives ; Relais de communications

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-51,"right":51,"top":-142,"bottom":-84,"width":102,"height":58,"centerX":0,"mountHeight":84},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-tape-reel](../assets/prop-tape-reel.png) — dimensions globales non relues, pose static, ancre 831/868

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| records-detail-1 | records | 558 / 0.7 | FIXTURES / wall | non |
| relay-detail-1 | relay | 784 / 0.7 | FIXTURES / wall | non |

### Panneau d’outillage

Identifiant : `rop:props:prop-tool-board`

Rangement mural d’outils. 5 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Panneau mural horizontal métallique sombre, six outils manuels longs bien distincts suspendus verticalement, cadre gris-vert. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Garage des prospecteurs ; Magasin de fret ; Hangar scientifique ; Atelier biomédical ; Atelier de manutention

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-53,"right":53,"top":-139,"bottom":-78,"width":106,"height":61,"centerX":0,"mountHeight":78},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-tool-board](../assets/prop-tool-board.png) — dimensions globales non relues, pose static, ancre 826/867

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| garage-detail-3 | garage | 2208 / 0.38 | FIXTURES / wall | non |
| stores-detail-1 | stores | 1141 / 0.38 | FIXTURES / wall | non |
| hangar-detail-3 | hangar | 2277 / 0.38 | FIXTURES / wall | non |
| biomed-set-3 | biomed | 1240 / 0.27 | FIXTURES / wall | non |
| workshop-set-3 | workshop | 1650 / 0.27 | FIXTURES / wall | non |

### Outillage

Identifiant : `rop:props:prop-tools`

Outils sur support ou suspendus. 5 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 2 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Garage des prospecteurs ; Bureau des prospecteurs ; Atelier de manutention

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"garage-cover1","room":"garage","footprint":{"w":230,"d":0.17}},{"id":"workshop-cover2","room":"workshop","footprint":{"w":210,"d":0.14}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| garage-set-0 | garage | 512 / 0.22 | FIXTURES / renderer | non |
| garage-set-1 | garage | 1056 / 0.22 | FIXTURES / renderer | non |
| garage-cover1 | garage | 1230 / 0.47 | ACTORS / renderer | oui |
| survey-set-3 | survey | 1654 / 0.22 | FIXTURES / renderer | non |
| workshop-cover2 | workshop | 1800 / 0.5 | ACTORS / renderer | oui |

### Tour industrielle

Identifiant : `rop:props:prop-tower`

Volume du périmètre raccordé à l’horizon. 2 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Accès au processeur un

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| approach-set-0 | approach | 512 / 0.22 | FIXTURES / renderer | non |
| approach-set-3 | approach | 2144 / 0.22 | FIXTURES / renderer | non |

### Jouet

Identifiant : `rop:props:prop-toy`

Objet personnel de l’habitat familial. 3 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Logement des Jorden ; Cache des conduits ; Renfoncement des câbles

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| jorden-set-5 | jorden | 1496 / 0.22 | FIXTURES / renderer | non |
| refuge-set-0 | refuge | 399 / 0.22 | FIXTURES / renderer | non |
| nest-set-2 | nest | 600 / 0.7 | FIXTURES / floor | non |

### Marque de piste

Identifiant : `rop:props:prop-trace-mark`

Indice au sol associé au passage et à la phase. 5 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Conduits de l’habitat ; Conduits de l’infirmerie ; Conduits des prospecteurs ; Cache des conduits ; Renfoncement des câbles

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| vent_hab-detail-4 | vent_hab | 2288 / 0.7 | FIXTURES / wall | non |
| vent_med-detail-4 | vent_med | 1932 / 0.7 | FIXTURES / wall | non |
| vent_survey-detail-4 | vent_survey | 1888 / 0.7 | FIXTURES / wall | non |
| refuge-detail-2 | refuge | 875 / 0.7 | FIXTURES / wall | non |
| nest-set-3 | nest | 970 / 0.7 | FIXTURES / floor | non |

### Transformateur

Identifiant : `rop:props:prop-transformer`

Appareil associé au circuit et à ses sécurités. 3 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 1 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Distribution électrique

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"power-cover1","room":"power","footprint":{"w":240,"d":0.16}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| power-set-0 | power | 417 / 0.22 | FIXTURES / renderer | non |
| power-set-2 | power | 1123 / 0.22 | FIXTURES / renderer | non |
| power-cover1 | power | 1000 / 0.45 | ACTORS / renderer | oui |

### Plateau

Identifiant : `rop:props:prop-tray`

Support de nourriture ou d’instruments selon la salle. 1 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Réfectoire

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| mess-detail-3 | mess | 1614 / 0.38 | ACTORS / floor | non |

### Turbine

Identifiant : `rop:props:prop-turbine`

Machine rotative dans son volume industriel. 3 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 1 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Processeur six

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"processor6-cover1","room":"processor6","footprint":{"w":260,"d":0.16}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| processor6-set-0 | processor6 | 492 / 0.22 | FIXTURES / renderer | non |
| processor6-set-2 | processor6 | 1500 / 0.22 | FIXTURES / renderer | non |
| processor6-cover1 | processor6 | 1090 / 0.47 | ACTORS / renderer | oui |

### Vanne

Identifiant : `rop:props:prop-valve`

Commande montée sur son réseau de fluides. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Station de pompage ; Processeur six ; Dérivation des eaux grises

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| pump-set-2 | pump | 1380 / 0.22 | FIXTURES / renderer | non |
| pump-set-4 | pump | 1968 / 0.22 | FIXTURES / renderer | non |
| processor6-set-1 | processor6 | 996 / 0.22 | FIXTURES / renderer | non |
| drain-set-6 | drain | 1770 / 0.27 | FIXTURES / floor | non |

### Distributeur

Identifiant : `rop:props:prop-vending`

Mobilier de service ; certaines instances restent physiques. 3 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Distributeur automatique colonial haut et étroit gris-vert, grande vitre sombre montrant trois rangées de quatre produits, fente de livraison basse et petite commande à droite. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 1 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Coursive centrale ; Réfectoire

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-41,"right":51,"top":-176,"bottom":0,"width":92,"height":176,"centerX":5,"mountHeight":0},"physicalFootprints":[{"id":"concourse-cover2","room":"concourse","footprint":{"w":220,"d":0.14}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-vending](../assets/prop-vending.png) — dimensions globales non relues, pose static, ancre 451/1702

**À compléter :**

- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| concourse-set-3 | concourse | 1680 / 0.22 | FIXTURES / renderer | non |
| concourse-cover2 | concourse | 1810 / 0.53 | ACTORS / renderer | oui |
| mess-set-0 | mess | 417 / 0.22 | FIXTURES / renderer | non |

### Capot de ventilation

Identifiant : `rop:props:prop-vent-cover`

Grille fixée à une bouche ou un conduit. 13 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Sas des arrivants ; Logement des Jorden ; Laboratoire de la Compagnie ; Salle des archives ; Galerie technique ; Conduits de l’habitat ; Conduits de l’infirmerie ; Conduits des prospecteurs ; Cache des conduits ; Navette de la Compagnie ; Buanderie ; Relais de communications ; Renfoncement des câbles

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| airlock-detail-3 | airlock | 1242 / 0.7 | FIXTURES / wall | non |
| jorden-detail-4 | jorden | 1628 / 0.38 | FIXTURES / wall | non |
| science-detail-4 | science | 2112 / 0.38 | FIXTURES / wall | non |
| records-detail-3 | records | 1242 / 0.7 | FIXTURES / wall | non |
| service-detail-2 | service | 1500 / 0.7 | FIXTURES / wall | non |
| vent_hab-detail-1 | vent_hab | 986 / 0.7 | FIXTURES / wall | non |
| vent_med-detail-1 | vent_med | 744 / 0.7 | FIXTURES / wall | non |
| vent_survey-detail-1 | vent_survey | 908 / 0.7 | FIXTURES / wall | non |
| refuge-detail-4 | refuge | 1360 / 0.7 | FIXTURES / wall | non |
| shuttle-detail-3 | shuttle | 1484 / 0.7 | FIXTURES / wall | non |
| wash-detail-2 | wash | 925 / 0.38 | FIXTURES / wall | non |
| relay-detail-3 | relay | 1346 / 0.7 | FIXTURES / wall | non |
| nest-set-7 | nest | 1570 / 0.7 | FIXTURES / floor | non |

### Horloge murale

Identifiant : `rop:props:prop-wall-clock`

Repère horaire accroché au mur. 12 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Horloge murale ronde, bord métal gris-vert, cadran crème jauni à douze graduations, deux aiguilles sombres orientées haut-droite et bas-gauche. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Coursive centrale ; Contrôle colonial ; Poste de la garnison ; Centre de loisirs ; Infirmerie ; Chambre d’isolement ; Salle des archives ; Bureau des prospecteurs ; Buanderie ; Relais de communications ; Réserve médicale ; Office de la cuisine

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-25,"right":25,"top":-159,"bottom":-109,"width":50,"height":50,"centerX":0,"mountHeight":109},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-wall-clock](../assets/prop-wall-clock.png) — dimensions globales non relues, pose static, ancre 626/1212

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| concourse-detail-3 | concourse | 2250 / 0.38 | FIXTURES / wall | non |
| ops-detail-3 | ops | 1476 / 0.38 | FIXTURES / wall | non |
| briefing-detail-3 | briefing | 1518 / 0.7 | FIXTURES / wall | non |
| recreation-detail-3 | recreation | 1553 / 0.38 | FIXTURES / wall | non |
| med-detail-3 | med | 1752 / 0.38 | FIXTURES / wall | non |
| isolation-detail-3 | isolation | 1173 / 0.7 | FIXTURES / wall | non |
| records-detail-4 | records | 1404 / 0.7 | FIXTURES / wall | non |
| survey-detail-3 | survey | 1725 / 0.38 | FIXTURES / wall | non |
| wash-detail-3 | wash | 1276 / 0.38 | FIXTURES / wall | non |
| relay-detail-4 | relay | 1536 / 0.7 | FIXTURES / wall | non |
| clinic_store-detail-3 | clinic_store | 1353 / 0.7 | FIXTURES / wall | non |
| pantry-set-7 | pantry | 380 / 0.27 | FIXTURES / wall | non |

### Panneau d’avertissement

Identifiant : `rop:props:prop-warning-board`

Signal lié au risque local. 12 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés. Plaque d’avertissement murale horizontale, cadre gris-vert, fond ocre clair, triangle noir centré avec point d’exclamation. Enveloppe, palette et emplacement issus du rendu natif du DLC ; détails matériels interprétés, sans certification d’un accessoire filmique exact.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Sas des arrivants ; Laboratoire de la Compagnie ; Garage des prospecteurs ; Magasin de fret ; Distribution électrique ; Station de pompage ; Processeur six ; Monte-charge du processeur ; Hangar scientifique ; Navette de la Compagnie ; Terrasse des antennes ; Dérivation des eaux grises

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-36,"right":36,"top":-148,"bottom":-99,"width":72,"height":49,"centerX":0,"mountHeight":99},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-warning-board](../assets/prop-warning-board.png) — dimensions globales non relues, pose static, ancre 760/923

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| airlock-detail-2 | airlock | 900 / 0.7 | FIXTURES / wall | non |
| science-detail-3 | science | 1656 / 0.38 | FIXTURES / wall | non |
| garage-detail-1 | garage | 1172 / 0.38 | FIXTURES / wall | non |
| stores-detail-2 | stores | 1550 / 0.38 | FIXTURES / wall | non |
| power-detail-3 | power | 1794 / 0.38 | FIXTURES / wall | non |
| pump-detail-3 | pump | 1656 / 0.38 | FIXTURES / wall | non |
| processor6-detail-3 | processor6 | 2070 / 0.38 | FIXTURES / wall | non |
| lift-detail-1 | lift | 558 / 0.7 | FIXTURES / wall | non |
| hangar-detail-1 | hangar | 1023 / 0.38 | FIXTURES / wall | non |
| shuttle-detail-2 | shuttle | 1075 / 0.7 | FIXTURES / wall | non |
| aerial-set-7 | aerial | 1400 / 0.27 | FIXTURES / wall | non |
| drain-set-8 | drain | 2110 / 0.27 | FIXTURES / wall | non |

### Machine de buanderie

Identifiant : `rop:props:prop-washer`

Appareil de lavage et raccordements. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 1 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Buanderie

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"wash-cover1","room":"wash","footprint":{"w":160,"d":0.13}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| wash-set-0 | wash | 377 / 0.22 | FIXTURES / renderer | non |
| wash-set-1 | wash | 831 / 0.22 | FIXTURES / renderer | non |
| wash-set-4 | wash | 1473 / 0.22 | FIXTURES / renderer | non |
| wash-cover1 | wash | 703 / 0.56 | ACTORS / renderer | oui |

### Râtelier d’armurerie

Identifiant : `rop:props:prop-weapon-rack`

Support lié aux règles d’équipement. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Armurerie de la garnison

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| armory-v09-0 | armory | 390 / 0.22 | FIXTURES / renderer | non |
| armory-v09-2 | armory | 730 / 0.22 | FIXTURES / renderer | non |
| armory-v09-5 | armory | 1430 / 0.22 | FIXTURES / renderer | non |
| armory-v09-7 | armory | 1800 / 0.22 | FIXTURES / renderer | non |

### Roue de réserve

Identifiant : `rop:props:prop-wheel`

Pièce stockée au garage. 4 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 2 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Garage des prospecteurs ; Atelier de manutention

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"garage-cover2","room":"garage","footprint":{"w":240,"d":0.13}},{"id":"workshop-cover1","room":"workshop","footprint":{"w":290,"d":0.17}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| garage-set-4 | garage | 2868 / 0.22 | FIXTURES / renderer | non |
| garage-cover2 | garage | 2070 / 0.52 | ACTORS / renderer | oui |
| workshop-set-2 | workshop | 765 / 0.29 | FIXTURES / floor | non |
| workshop-cover1 | workshop | 890 / 0.45 | ACTORS / renderer | oui |

### Moniteur médical blanc

Identifiant : `rop:props:prop-white-monitor`

Châssis blanc, témoins verts et bleus. 1 placement(s) de base.

**Provenance :** repere_source_forme_et_implantation_adaptees. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Châssis blanc, témoins verts/bleus ; pied et tracé d’écran interprétés. Moniteurs blancs à indicateurs verts et bleus décrits dans l’extrait autorisé Titan Books / Daily Dead (S18). Silhouette sur pied et palette du DLC ; forme CRT et tracé ECG sont une adaptation, sans modèle exact authentifié.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Infirmerie

**Dimensions et ancrage :** {"nativeEnvelope":{"left":-26,"right":27,"top":-103,"bottom":0,"width":53,"height":103,"centerX":0.5,"mountHeight":0},"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = png_present ; intégration = png_decoratif_selectif ; automatique = registre_et_liens_verifies_octets_non_relus ; visuel = not_certified.

**Assets :** [prop-white-monitor](../assets/prop-white-monitor.png) — dimensions globales non relues, pose static, ancre 452.5/1706

**À compléter :**

- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| med-v09-15 | med | 2250 / 0.3 | ACTORS / renderer | non |

### Fenêtre

Identifiant : `rop:props:prop-window`

Vitrage intégré à un mur. 3 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Coursive centrale ; Coursive résidentielle

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| concourse-set-1 | concourse | 600 / 0.22 | FIXTURES / renderer | non |
| concourse-set-4 | concourse | 1860 / 0.22 | FIXTURES / renderer | non |
| hab-set-1 | hab | 795 / 0.22 | FIXTURES / renderer | non |

### Éclairage défaillant

Identifiant : `rop:props:prop-broken-light`

Variante de phase de l’installation existante. 0 placement(s) de base et 32 de phase.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Sas des arrivants ; Coursive centrale ; Contrôle colonial ; Poste de la garnison ; Coursive résidentielle ; Logement des Jorden ; Réfectoire ; Centre de loisirs ; Infirmerie ; Chambre d’isolement ; Laboratoire de la Compagnie ; Salle des archives ; Garage des prospecteurs ; Bureau des prospecteurs ; Magasin de fret ; Distribution électrique ; Station de pompage ; Galerie technique ; Processeur six ; Monte-charge du processeur ; Soubassements envahis ; Galerie du refroidissement ; Hangar scientifique ; Navette de la Compagnie ; Buanderie ; Relais de communications ; Réserve médicale ; Office de la cuisine ; Atelier biomédical ; Terrasse des antennes ; Atelier de manutention ; Dérivation des eaux grises

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Variantes et raccords de phase à contrôler.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

### Flèche d’urgence

Identifiant : `rop:props:prop-emergency-arrow`

Doit indiquer un trajet accessible. 0 placement(s) de base et 27 de phase.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Sas des arrivants ; Coursive centrale ; Contrôle colonial ; Poste de la garnison ; Coursive résidentielle ; Logement des Jorden ; Réfectoire ; Centre de loisirs ; Infirmerie ; Chambre d’isolement ; Laboratoire de la Compagnie ; Salle des archives ; Garage des prospecteurs ; Bureau des prospecteurs ; Magasin de fret ; Distribution électrique ; Station de pompage ; Galerie technique ; Processeur six ; Monte-charge du processeur ; Soubassements envahis ; Galerie du refroidissement ; Hangar scientifique ; Navette de la Compagnie ; Buanderie ; Relais de communications ; Réserve médicale

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Variantes et raccords de phase à contrôler.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

### Papiers dispersés

Identifiant : `rop:props:prop-paper-trail`

Désordre sans collision ajoutée. 0 placement(s) de base et 32 de phase.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Sas des arrivants ; Coursive centrale ; Contrôle colonial ; Poste de la garnison ; Coursive résidentielle ; Logement des Jorden ; Réfectoire ; Centre de loisirs ; Infirmerie ; Chambre d’isolement ; Laboratoire de la Compagnie ; Salle des archives ; Garage des prospecteurs ; Bureau des prospecteurs ; Magasin de fret ; Distribution électrique ; Station de pompage ; Galerie technique ; Processeur six ; Monte-charge du processeur ; Soubassements envahis ; Galerie du refroidissement ; Hangar scientifique ; Navette de la Compagnie ; Buanderie ; Relais de communications ; Réserve médicale ; Office de la cuisine ; Atelier biomédical ; Terrasse des antennes ; Atelier de manutention ; Dérivation des eaux grises

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Variantes et raccords de phase à contrôler.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

### Trace de brûlure

Identifiant : `rop:props:prop-scorch`

Détail de surface sans trou traversable implicite. 0 placement(s) de base et 27 de phase.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Sas des arrivants ; Coursive centrale ; Contrôle colonial ; Poste de la garnison ; Coursive résidentielle ; Logement des Jorden ; Réfectoire ; Centre de loisirs ; Infirmerie ; Chambre d’isolement ; Laboratoire de la Compagnie ; Salle des archives ; Garage des prospecteurs ; Bureau des prospecteurs ; Magasin de fret ; Distribution électrique ; Station de pompage ; Galerie technique ; Processeur six ; Monte-charge du processeur ; Soubassements envahis ; Galerie du refroidissement ; Hangar scientifique ; Navette de la Compagnie ; Buanderie ; Relais de communications ; Réserve médicale

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Variantes et raccords de phase à contrôler.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

### Bras de capture du récupérateur

Identifiant : `rop:props:salvage-capture-arms`

Réseau de bras maintenant la navette dans la baie ; distinct du pistolet-grappin posé sur ses commandes.

**Provenance :** equipement_de_scene_atteste. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Articulations, prises, points d’attache et silhouette à documenter.

**Chronologie :** 16 mai 2179 — récupération spatiale.

**Jeu :** Équipement de la baie, sans nouvelle arme jouable.

**Localisation :** salvage_bay

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Sprites, articulations, ancrages et états de capture/libération à produire.

**Contrôles attendus :**

- Séparer cet équipement de manutention et le pistolet-grappin de Ripley.

## Véhicules

### Tracteur statique — décor

Identifiant : `rop:vehicules:prop-tractor`

Distinct du tracteur pilotable natif. 2 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : [R6](https://propstore.com/product/aliens-1986/hand-illustrated-ron-cobb-daihotai-tractor-concept-sketch/)

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Aire d’atterrissage ; Atelier de manutention

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Établir si cette instance correspond au Daihotai ou à un autre modèle ; ne pas assimiler au heavy-crawler du roman.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| pad-set-5 | pad | 2458 / 0.22 | FIXTURES / renderer | non |
| workshop-set-1 | workshop | 610 / 0.27 | FIXTURES / floor | non |

### Tracteur de prospection 01

Identifiant : `rop:vehicules:prospector-01`

Tracteur pilotable entre piste et plateau, distinct des véhicules statiques.

**Provenance :** vehicule_de_gameplay_reference_generale_du_roman. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/), [R5](https://www.dreadcentral.com/wp-content/uploads/2014/11/RiverOfPainExcerpt.pdf)

**Apparence :** Cabine, châssis et train roulant adaptés ; concept Daihotai ne prouve pas cette identité.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Conduite, montée/descente, batterie, freinage et réparation. {"maxForward":520,"maxReverse":220,"acceleration":300,"braking":850,"rollingResistance":135,"steerSpeed":150,"boardingTime":1.5,"exitTime":1.1,"repairTime":3.2,"chargeTime":2.8,"hornTime":1.2,"hornCooldown":5,"minimumBattery":0.5}

**Localisation :** Piste du plateau ; Plateau des relevés

**Dimensions et ancrage :** {"width":304,"height":130,"depth":0.1,"units":"unites_du_modele"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Châssis et états de conduite PNG absents.
- Vues, train roulant, conducteur et accès à produire.
- Modèle précis de la scène à confirmer.

**Contrôles attendus :**

- Conserver empreinte et voies accessibles.
- Ne pas réintroduire les copies statiques supprimées par la mobilité.

### Daihotai — référence terrestre

Identifiant : `rop:vehicules:daihotai-reference`

Concept de tracteur conçu pour Aliens.

**Provenance :** reference_externe_non_integree. Références : [R6](https://propstore.com/product/aliens-1986/hand-illustrated-ron-cobb-daihotai-tractor-concept-sketch/)

**Apparence :** Comparer vues de conception et version finale avant d’y identifier le véhicule du jeu.

**Chronologie :** Référence filmique ; attribution à la scène du roman à vérifier.

**Jeu :** Référence ; aucun véhicule additionnel créé.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Référence de scène et version exacte à confirmer.
- Vues, pivots, parties mobiles, accès et collision à produire.

**Contrôles attendus :**

- Un modèle terrestre ne devient pas une navette ; sa forme filmique ne prouve pas sa présence dans le roman.

### Heavy-crawler — récupération

Identifiant : `rop:vehicules:heavy-crawler-reference`

Véhicule de récupération évoqué au chapitre 7.

**Provenance :** reference_externe_non_integree. Références : [R5](https://www.dreadcentral.com/wp-content/uploads/2014/11/RiverOfPainExcerpt.pdf)

**Apparence :** Modèle précis non établi ; ne pas l’assimiler au Daihotai.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Référence ; aucun véhicule additionnel créé.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Référence de scène et version exacte à confirmer.
- Vues, pivots, parties mobiles, accès et collision à produire.

**Contrôles attendus :**

- Un modèle terrestre ne devient pas une navette ; sa forme filmique ne prouve pas sa présence dans le roman.

### Power Loader P-5000 — présence à vérifier

Identifiant : `rop:vehicules:p5000`

Piste historique du registre, sans présence authentifiée dans ce récit.

**Provenance :** presence_dans_ce_recit_a_verifier. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Ne pas ajouter l’exosquelette sur la seule base d’autres scènes Aliens.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Référence ; aucun véhicule additionnel créé.

**Localisation :** Hors parcours ou scène à préciser.

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Référence de scène et version exacte à confirmer.
- Vues, pivots, parties mobiles, accès et collision à produire.

**Contrôles attendus :**

- Un modèle terrestre ne devient pas une navette ; sa forme filmique ne prouve pas sa présence dans le roman.

## Vaisseaux

### Navette de la Compagnie — décor

Identifiant : `rop:vaisseaux:prop-shuttle`

Modèle et nom exacts non établis. 1 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Hangar scientifique

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Nom et classe non confirmés ; ne pas nommer Onager ou Daihotai par défaut.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| hangar-set-0 | hangar | 522 / 0.22 | FIXTURES / renderer | non |

### Épave extraterrestre — silhouette

Identifiant : `rop:vaisseaux:prop-wreck`

Vaisseau en fer à cheval associé à son seuil. 1 placement(s) de base.

**Provenance :** repere_source_forme_et_implantation_adaptees. Références : [R2](https://www.avpgalaxy.net/website/interviews/christopher-golden/), [S1](https://titanbooks.com/6486-alien-river-of-pain-book-3/)

**Apparence :** Silhouette générale en fer à cheval ; échelle, accès et raccord intérieur à vérifier.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Piste du plateau

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| road-set-4 | road | 3138 / 0.22 | FIXTURES / renderer | non |

### Véhicule de descente de Brackett

Identifiant : `rop:vaisseaux:brackett-dropship`

Appareil piloté par Tressa à l’arrivée.

**Provenance :** sequence_source_forme_detaillee_a_documenter. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Cabine et extérieur à documenter ; classe UD-4 non supposée.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Vaisseau/scène indépendant de la circulation coloniale.

**Localisation :** dropship_arrival ; Aire d’atterrissage

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Extérieur, intérieur pertinent, accès et transitions à produire.
- Nom et modèle gardés non établis sans source.

**Contrôles attendus :**

- Pas de porte locale entre scène spatiale et Hadley’s Hope.
- Déplacement par séquence ou ellipse cohérente.

### Vaisseau récupérateur

Identifiant : `rop:vaisseaux:salvage-ship`

Cadre spatial de récupération, distinct de la colonie.

**Provenance :** sequence_source_forme_detaillee_a_documenter. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Baie, sas et pont de pilotage à documenter ; nom exact non établi ici.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Vaisseau/scène indépendant de la circulation coloniale.

**Localisation :** salvage_bay ; salvage_flight_deck

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Extérieur, intérieur pertinent, accès et transitions à produire.
- Nom et modèle gardés non établis sans source.

**Contrôles attendus :**

- Pas de porte locale entre scène spatiale et Hadley’s Hope.
- Déplacement par séquence ou ellipse cohérente.

### Navette retrouvée de Ripley

Identifiant : `rop:vaisseaux:ripley-shuttle`

Navette et couchette de la scène de récupération.

**Provenance :** sequence_source_forme_detaillee_a_documenter. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Référence du modèle précis à relier à la scène avant reconstruction détaillée.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Vaisseau/scène indépendant de la circulation coloniale.

**Localisation :** salvage_shuttle

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Extérieur, intérieur pertinent, accès et transitions à produire.
- Nom et modèle gardés non établis sans source.

**Contrôles attendus :**

- Pas de porte locale entre scène spatiale et Hadley’s Hope.
- Déplacement par séquence ou ellipse cohérente.

## Terrains et matériaux

### Résine organique

Identifiant : `rop:terrains:prop-resin`

Habillage de ruche selon phase et surface. 10 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 2 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Soubassements envahis ; Galerie du refroidissement ; Conduits des prospecteurs

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"hive-cover1","room":"hive","footprint":{"w":160,"d":0.13}},{"id":"coolant-cover2","room":"coolant","footprint":{"w":190,"d":0.14}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| hive-set-0 | hive | 450 / 0.22 | FIXTURES / renderer | non |
| hive-set-3 | hive | 1710 / 0.22 | FIXTURES / renderer | non |
| hive-cover1 | hive | 1140 / 0.56 | ACTORS / renderer | oui |
| hive-detail-0 | hive | 360 / 0.38 | ACTORS / floor | non |
| hive-detail-1 | hive | 930 / 0.38 | ACTORS / floor | non |
| coolant-set-1 | coolant | 906 / 0.22 | FIXTURES / renderer | non |
| coolant-cover2 | coolant | 1809 / 0.57 | ACTORS / renderer | oui |
| coolant-detail-0 | coolant | 324 / 0.38 | ACTORS / floor | non |
| coolant-detail-1 | coolant | 837 / 0.38 | ACTORS / floor | non |
| vent_survey-set-3 | vent_survey | 1876 / 0.22 | FIXTURES / renderer | non |

### Nervure biomécanique

Identifiant : `rop:terrains:prop-rib`

Structure de l’épave ou de la ruche. 38 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 5 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Seuil de l’épave ; Soubassements envahis ; Galerie du refroidissement ; Galerie biomécanique ; Chambre du pilote ; Cale aux œufs

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"derelict-cover1","room":"derelict","footprint":{"w":160,"d":0.13}},{"id":"derelict_gallery-v09-6","room":"derelict_gallery","footprint":{"w":145,"d":0.11}},{"id":"derelict_gallery-v09-7","room":"derelict_gallery","footprint":{"w":145,"d":0.11}},{"id":"pilot_chamber-v09-8","room":"pilot_chamber","footprint":{"w":145,"d":0.11}},{"id":"pilot_chamber-v09-9","room":"pilot_chamber","footprint":{"w":145,"d":0.11}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| derelict-set-0 | derelict | 442 / 0.22 | FIXTURES / renderer | non |
| derelict-set-1 | derelict | 846 / 0.22 | FIXTURES / renderer | non |
| derelict-set-2 | derelict | 1250 / 0.22 | FIXTURES / renderer | non |
| derelict-set-3 | derelict | 1654 / 0.22 | FIXTURES / renderer | non |
| derelict-set-4 | derelict | 2058 / 0.22 | FIXTURES / renderer | non |
| derelict-cover1 | derelict | 950 / 0.56 | ACTORS / renderer | oui |
| derelict-detail-0 | derelict | 734 / 0.38 | ACTORS / floor | non |
| derelict-detail-1 | derelict | 775 / 0.38 | ACTORS / floor | non |
| derelict-detail-3 | derelict | 1725 / 0.38 | ACTORS / floor | non |
| derelict-detail-4 | derelict | 2200 / 0.38 | ACTORS / floor | non |
| hive-set-2 | hive | 1290 / 0.22 | FIXTURES / renderer | non |
| coolant-set-4 | coolant | 2238 / 0.22 | FIXTURES / renderer | non |
| derelict_gallery-v09-0 | derelict_gallery | 380 / 0.22 | FIXTURES / renderer | non |
| derelict_gallery-v09-1 | derelict_gallery | 690 / 0.22 | FIXTURES / renderer | non |
| derelict_gallery-v09-2 | derelict_gallery | 1000 / 0.22 | FIXTURES / renderer | non |
| derelict_gallery-v09-3 | derelict_gallery | 1310 / 0.22 | FIXTURES / renderer | non |
| derelict_gallery-v09-4 | derelict_gallery | 1620 / 0.22 | FIXTURES / renderer | non |
| derelict_gallery-v09-5 | derelict_gallery | 1930 / 0.22 | FIXTURES / renderer | non |
| derelict_gallery-v09-6 | derelict_gallery | 768 / 0.54 | ACTORS / renderer | oui |
| derelict_gallery-v09-7 | derelict_gallery | 1536 / 0.54 | ACTORS / renderer | oui |
| pilot_chamber-v09-0 | pilot_chamber | 380 / 0.22 | FIXTURES / renderer | non |
| pilot_chamber-v09-1 | pilot_chamber | 690 / 0.22 | FIXTURES / renderer | non |
| pilot_chamber-v09-2 | pilot_chamber | 1000 / 0.22 | FIXTURES / renderer | non |
| pilot_chamber-v09-3 | pilot_chamber | 1310 / 0.22 | FIXTURES / renderer | non |
| pilot_chamber-v09-4 | pilot_chamber | 1620 / 0.22 | FIXTURES / renderer | non |
| pilot_chamber-v09-5 | pilot_chamber | 1930 / 0.22 | FIXTURES / renderer | non |
| pilot_chamber-v09-6 | pilot_chamber | 2240 / 0.22 | FIXTURES / renderer | non |
| pilot_chamber-v09-7 | pilot_chamber | 2550 / 0.22 | FIXTURES / renderer | non |
| pilot_chamber-v09-8 | pilot_chamber | 960 / 0.54 | ACTORS / renderer | oui |
| pilot_chamber-v09-9 | pilot_chamber | 1920 / 0.54 | ACTORS / renderer | oui |
| egg_vault-v09-0 | egg_vault | 380 / 0.22 | FIXTURES / renderer | non |
| egg_vault-v09-1 | egg_vault | 690 / 0.22 | FIXTURES / renderer | non |
| egg_vault-v09-2 | egg_vault | 1000 / 0.22 | FIXTURES / renderer | non |
| egg_vault-v09-3 | egg_vault | 1310 / 0.22 | FIXTURES / renderer | non |
| egg_vault-v09-4 | egg_vault | 1620 / 0.22 | FIXTURES / renderer | non |
| egg_vault-v09-5 | egg_vault | 1930 / 0.22 | FIXTURES / renderer | non |
| egg_vault-v09-6 | egg_vault | 2240 / 0.22 | FIXTURES / renderer | non |
| egg_vault-v09-7 | egg_vault | 2550 / 0.22 | FIXTURES / renderer | non |

### Bloc rocheux

Identifiant : `rop:terrains:prop-rock`

Relief extérieur parfois utilisé comme couverture. 12 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor avec 7 exemplaire(s) physique(s) conservés sous rendu natif. 

**Localisation :** Aire d’atterrissage ; Piste du plateau ; Plateau des relevés ; Seuil de l’épave ; Accès au processeur un ; Cale aux œufs

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[{"id":"pad-cover2","room":"pad","footprint":{"w":190,"d":0.14}},{"id":"road-cover2","room":"road","footprint":{"w":190,"d":0.14}},{"id":"plateau-cover2","room":"plateau","footprint":{"w":190,"d":0.14}},{"id":"derelict-cover2","room":"derelict","footprint":{"w":190,"d":0.14}},{"id":"approach-cover2","room":"approach","footprint":{"w":190,"d":0.14}},{"id":"egg_vault-v09-8","room":"egg_vault","footprint":{"w":145,"d":0.11}},{"id":"egg_vault-v09-9","room":"egg_vault","footprint":{"w":145,"d":0.11}}],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| pad-cover2 | pad | 1943 / 0.57 | ACTORS / renderer | oui |
| road-set-1 | road | 1206 / 0.22 | FIXTURES / renderer | non |
| road-set-2 | road | 1850 / 0.22 | FIXTURES / renderer | non |
| road-cover2 | road | 2479 / 0.57 | ACTORS / renderer | oui |
| plateau-set-0 | plateau | 482 / 0.22 | FIXTURES / renderer | non |
| plateau-set-1 | plateau | 966 / 0.22 | FIXTURES / renderer | non |
| plateau-set-3 | plateau | 1934 / 0.22 | FIXTURES / renderer | non |
| plateau-cover2 | plateau | 1943 / 0.57 | ACTORS / renderer | oui |
| derelict-cover2 | derelict | 1675 / 0.57 | ACTORS / renderer | oui |
| approach-cover2 | approach | 2144 / 0.57 | ACTORS / renderer | oui |
| egg_vault-v09-8 | egg_vault | 912 / 0.54 | ACTORS / renderer | oui |
| egg_vault-v09-9 | egg_vault | 1824 / 0.54 | ACTORS / renderer | oui |

### Fragment rocheux

Identifiant : `rop:terrains:prop-rock-fragment`

Détail du sol dans la palette de la zone. 5 placement(s) de base.

**Provenance :** forme_et_implantation_originales_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Décor sans collision pour ses instances de base. 

**Localisation :** Aire d’atterrissage ; Piste du plateau ; Plateau des relevés ; Seuil de l’épave ; Accès au processeur un

**Dimensions et ancrage :** {"nativeEnvelope":null,"physicalFootprints":[],"units":"coordonnees_logiques ; z = profondeur_normalisee"}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- PNG individuel absent.
- Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.

**Contrôles attendus :**

- Conserver chaque identifiant, coordonnée, couche et empreinte.
- Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.
- Préserver légendes, témoins et retours d’interaction natifs.

**Placements exacts :**

| Identifiant | Salle | x / z | Couche / montage | Physique |
| --- | --- | --- | --- | --- |
| pad-detail-4 | pad | 2552 / 0.38 | ACTORS / floor | non |
| road-detail-4 | road | 3256 / 0.38 | ACTORS / floor | non |
| plateau-detail-4 | plateau | 2552 / 0.38 | ACTORS / floor | non |
| derelict-detail-2 | derelict | 1250 / 0.38 | ACTORS / floor | non |
| approach-detail-4 | approach | 2816 / 0.38 | ACTORS / floor | non |

### Matériaux des archives

Identifiant : `rop:terrains:material-archive`

Stockage, cloisons et circulation administrative.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : server_aisles, relay_backbone.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Salle des archives ; Relais de communications

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux de la garnison

Identifiant : `rop:terrains:material-barracks`

Aménagement militaire local et dotation.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : locker_bays.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Poste de la garnison

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux de restauration

Identifiant : `rop:terrains:material-canteen`

Sols, surfaces lavables et service civil.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : kitchen_pass, pantry-service-loop.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Réfectoire ; Office de la cuisine

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux du contrôle

Identifiant : `rop:terrains:material-command`

Pupitres et structures du poste colonial.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : observation_bay, survey_wall.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Contrôle colonial ; Bureau des prospecteurs

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux des coursives centrales

Identifiant : `rop:terrains:material-concourse`

Assemblages répétables entre les secteurs.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : glazed_gallery.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Coursive centrale

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux du sas

Identifiant : `rop:terrains:material-decontamination`

Joints, drainage et surfaces de décontamination.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : double_bulkhead.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Sas des arrivants

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux de l’épave

Identifiant : `rop:terrains:material-derelict`

Parois et nervures biomécaniques monumentales.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : organic_vault.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Seuil de l’épave ; Galerie biomécanique ; Chambre du pilote ; Cale aux œufs

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux domestiques

Identifiant : `rop:terrains:material-domestic`

Logements, textiles et vie quotidienne.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : low_ceiling.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Logement des Jorden

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Terrain extérieur colonial

Identifiant : `rop:terrains:material-exterior`

Roche, poussière et structures exposées.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : approach_lights, rock_cutting, survey_ridge, processor_columns, aerial-service-loop.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Aire d’atterrissage ; Piste du plateau ; Plateau des relevés ; Accès au processeur un ; Terrasse des antennes

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux de l’armurerie

Identifiant : `rop:terrains:material-garrison`

Supports, cloisons sécurisées et sol dégagé.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : racks.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Armurerie de la garnison

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux de la serre

Identifiant : `rop:terrains:material-greenhouse`

Vitrage, ossature, culture et drainage.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : glass_dome.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Serre vitrée

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux du hangar

Identifiant : `rop:terrains:material-hangar`

Manutention, sol porteur et ouvertures.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : overhead_crane, shuttle_bay, workshop-service-loop.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Garage des prospecteurs ; Hangar scientifique ; Atelier de manutention

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux de ruche

Identifiant : `rop:terrains:material-hive`

Résine superposée au bâti industriel.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : resin_on_steel, buried_exchangers.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Soubassements envahis ; Galerie du refroidissement

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux des processeurs

Identifiant : `rop:terrains:material-industrial`

Métal, machines, tuyaux et passerelles.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : busbar_banks, collector_wall, heat_exchangers.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Distribution électrique ; Station de pompage ; Processeur six

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux de laboratoire

Identifiant : `rop:terrains:material-laboratory`

Surfaces techniques, vitrages et mobilier.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : containment_bays.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Laboratoire de la Compagnie

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux des loisirs

Identifiant : `rop:terrains:material-leisure`

Mobilier civil et détente.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : recessed_arcades.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Centre de loisirs

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux de maintenance

Identifiant : `rop:terrains:material-maintenance`

Trappes, outillage et réseaux.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : pipe_trench, drain-service-loop.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Galerie technique ; Dérivation des eaux grises

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux médicaux

Identifiant : `rop:terrains:material-medical`

Surfaces nettoyables et circulation de soins.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : observation_partitions, sealed_observation, cold_storage, biomed-service-loop.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Infirmerie ; Chambre d’isolement ; Réserve médicale ; Atelier biomédical

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux des cachettes

Identifiant : `rop:terrains:material-refuge`

Volumes abrités, câbles et accès enfant.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : service_recess, nest-service-loop.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Cache des conduits ; Renfoncement des câbles

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux résidentiels

Identifiant : `rop:terrains:material-residential`

Coursives, plaques et façades de logements.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : numbered_alcoves.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Coursive résidentielle

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux des puits

Identifiant : `rop:terrains:material-shaft`

Guides, parois, plateformes et niveaux.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : counterweights.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Monte-charge du processeur

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux de la navette

Identifiant : `rop:terrains:material-shuttle`

Cabine, sièges et seuils du vaisseau.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : pressure_shell.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Navette de la Compagnie

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux des services

Identifiant : `rop:terrains:material-utility`

Buanderie, réserves et conduites.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : laundry_racks.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Buanderie

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux des conduits

Identifiant : `rop:terrains:material-vent`

Sections étroites, raccords et grilles.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : habitat_branch, observation_grille, survey_branch.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Conduits de l’habitat ; Conduits de l’infirmerie ; Conduits des prospecteurs

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### Matériaux du fret

Identifiant : `rop:terrains:material-warehouse`

Stockage, marquages et manutention.

**Provenance :** direction_artistique_et_materiaux_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Sols, murs et plafond propres à la famille. Variantes : loading_racks.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.

**Localisation :** Magasin de fret

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Textures sans couture et couches de profondeur finales absentes du registre.
- Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.

**Contrôles attendus :**

- Échelle de détail cohérente entre salles adjacentes.
- Aucune ouverture traversable suggérée sans passage réel.
- Les couches proches ne masquent pas acteurs et arrivées.

### GRAVIER MEUBLE

Identifiant : `rop:terrains:road-gravel`

Surface routière du système de mobilité.

**Provenance :** regle_de_terrain_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Granulats meubles et raccord diffus au sol rocheux.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Vitesse plafonnée à 260 unités logiques/s.

**Localisation :** Piste du plateau

**Dimensions et ancrage :** {"widthModelUnits":350,"navigableZ":[0.25,0.9]}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Texture individuelle et transitions latérales à produire.

**Contrôles attendus :**

- Zone visuelle identique à la zone de ralentissement.
- Ne pas déduire la collision des pixels.

### ORNIÈRES

Identifiant : `rop:terrains:plateau-ruts`

Surface routière du système de mobilité.

**Provenance :** regle_de_terrain_originale_du_projet. Références : Données du projet ; référence externe précise non établie.

**Apparence :** Ornières alignées sur le passage, relief adapté au véhicule.

**Chronologie :** Campagne coloniale 2179 ; dialogues et parcours adaptés.

**Jeu :** Vitesse plafonnée à 225 unités logiques/s.

**Localisation :** Plateau des relevés

**Dimensions et ancrage :** {"widthModelUnits":290,"navigableZ":[0.25,0.9]}

**État :** génération = no_png ; intégration = native_procedural ; automatique = data_inventory_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Texture individuelle et transitions latérales à produire.

**Contrôles attendus :**

- Zone visuelle identique à la zone de ralentissement.
- Ne pas déduire la collision des pixels.

## Planètes et satellites

### LV-426 / Acheron — lune de Hadley’s Hope

Identifiant : `rop:planetes:lv426`

Lune du récit, territoire de la colonie et de l’épave.

**Provenance :** cadre_du_roman_confirme_par_editeur. Références : [S1](https://titanbooks.com/6486-alien-river-of-pain-book-3/), [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Roche, poussière et météo sévère à l’échelle des scènes. Relief global, taille et carte planétaire non mesurés dans ces sources.

**Chronologie :** Prologue 2173 et campagne 2179 à distinguer.

**Jeu :** Monde de référence ; aucun vol spatial libre ou globe détaillé intégré.

**Localisation :** Aire d’atterrissage ; Sas des arrivants ; Coursive centrale ; Contrôle colonial ; Poste de la garnison ; Coursive résidentielle ; Logement des Jorden ; Réfectoire ; Centre de loisirs ; Infirmerie ; Chambre d’isolement ; Laboratoire de la Compagnie ; Salle des archives ; Garage des prospecteurs ; Bureau des prospecteurs ; Magasin de fret ; Distribution électrique ; Station de pompage ; Galerie technique ; Piste du plateau ; Plateau des relevés ; Seuil de l’épave ; Processeur six ; Accès au processeur un ; Monte-charge du processeur ; Soubassements envahis ; Galerie du refroidissement ; Conduits de l’habitat ; Conduits de l’infirmerie ; Conduits des prospecteurs ; Cache des conduits ; Hangar scientifique ; Navette de la Compagnie ; Buanderie ; Relais de communications ; Réserve médicale ; Office de la cuisine ; Atelier biomédical ; Terrasse des antennes ; Atelier de manutention ; Dérivation des eaux grises ; Renfoncement des câbles ; Serre vitrée ; Armurerie de la garnison ; Galerie biomécanique ; Chambre du pilote ; Cale aux œufs

**Dimensions et ancrage :** {"officialDiameterKm":null,"worldMap":"non_etablie"}

**État :** génération = no_png ; intégration = cadre_narratif_sans_asset_orbital ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Vue orbitale, globe et grand terrain à référencer puis produire.
- Itinéraires colonie/prospection/processeurs/épave à recouper.

**Contrôles attendus :**

- Ne pas importer LV-178, Planet 4 ou Origae-6.
- Qualifier LV-426 de lune ; coordonnées du jeu non officielles.

### Terre — cadre orbital de Gateway

Identifiant : `rop:planetes:earth`

La Terre est visible depuis Gateway dans l’extrait ; fiche de cadre orbital distincte du terrain de LV-426.

**Provenance :** cadre_orbital_atteste_extrait_roman. Références : [R1](https://dailydead.com/read-exclusive-excerpt-alien-river-pain/)

**Apparence :** Vue orbitale à documenter depuis la station ; aucun diamètre ou plan de surface inventé.

**Chronologie :** Séquence de Gateway en 2179 ; ne pas la fusionner avec le prologue colonial de 2173.

**Jeu :** Cadre documentaire ; pas de surface terrestre jouable créée.

**Localisation :** orbital_medical

**Dimensions et ancrage :** Mesures précises non documentées.

**État :** génération = no_png ; intégration = absent ; automatique = source_reference_only ; visuel = not_certified.

**Assets :** Aucun PNG individuel référencé.

**À compléter :**

- Vue depuis Gateway et transition spatiale à référencer puis produire.

**Contrôles attendus :**

- La Terre n’ajoute aucune porte sur la carte coloniale de LV-426.
- Ne pas inventer une nouvelle planète ou un itinéraire terrestre.

## Sources

### S1 — Titan Books — Alien: River of Pain

https://titanbooks.com/6486-alien-river-of-pain-book-3/

Type : editeur. Usage : Auteur, prémisse, colonie, famille Jorden, garnison, épave

### S2 — Audible France — ALIEN Audible Original

https://www.audible.fr/series/ALIEN-Audible-Original-Livres-Audio/B07MXJYR1P

Type : editeur_audio. Usage : Titre français Le Fleuve des souffrances ; distinguer adaptation sonore et roman

### S3 — Christopher Golden — entretien AvPGalaxy

https://www.avpgalaxy.net/website/interviews/christopher-golden/

Type : entretien_auteur. Usage : Intention de prélude à Aliens et liens avec les récits préexistants

### S4 — AvP Central — Demian Brackett

https://www.avpcentral.com/demian-brackett

Type : source_secondaire. Usage : Brackett, Paris, Mori, Luisa ; issue distincte du sort de Newt, navette distincte de l’Onager ; à recouper sur le roman intégral

### S5 — AvP Central — Hadley’s Hope colonists

https://www.avpcentral.com/hadleys-hope-colonists

Type : source_secondaire. Usage : Identification des personnages secondaires ; ne pas fusionner médecins et Draper de continuités différentes

### R1 — Titan Books / Daily Dead — extrait autorisé, chapitres Rebecca et Arrivals

https://dailydead.com/read-exclusive-excerpt-alien-river-pain/

Type : texte_primaire_extrait_autorise. Usage : Anne, Komiskey, matériel médical ; secteurs hors-colonie identifiés, pas roman intégral.

### R2 — Christopher Golden — entretien auteur, 30 octobre 2014

https://www.avpgalaxy.net/website/interviews/christopher-golden/

Type : entretien_primaire. Usage : Intérieur de l’épave, groupes du récit ; pas de plan coté.

### R3 — NECA — Rescuing Newt, figurines sous licence

https://necaonline.com/2016/08/aliens-30th-anniversary-rescuing-newt-deluxe-action-figure-2-pack/

Type : reference_visuelle_sous_licence. Usage : Silhouette filmique de Newt ; objets de scènes ultérieures exclus.

### R4 — Propstore — accessoire M240 employé dans Aliens

https://propstore.com/product/aliens-1986/19-ellen-ripleys-sigourney-weaver-practical-special-effects-m240-flamethrower/

Type : accessoire_de_production. Usage : Silhouette et nom M240 ; pas une preuve de dotation de Hadley’s Hope dans le roman.

### R5 — Titan Books / Dread Central — extrait autorisé, chapitre 7, pages 64–75

https://www.dreadcentral.com/wp-content/uploads/2014/11/RiverOfPainExcerpt.pdf

Type : texte_primaire_extrait_autorise. Usage : Garnison, personnages secondaires, administration, recherche et récupération. Ni plan coté ni référence visuelle complète.

### R6 — Propstore — concept Ron Cobb du tracteur Daihotai

https://propstore.com/product/aliens-1986/hand-illustrated-ron-cobb-daihotai-tractor-concept-sketch/

Type : dessin_de_conception_de_production. Usage : Forme d’un véhicule terrestre conçu pour Aliens. Distinguer concept, modèle final et attribution dans River of Pain.

### R7 — Titan Books — Alien: The Blueprints

https://titanbooks.com/9152-alien-the-blueprints/

Type : editeur_ouvrage_sous_licence. Usage : Existence d’un ouvrage de plans. Ne fournit pas les plans non consultés ni des dimensions à inventer.

### R8 — Propstore — M41A Pulse Rifle, Aliens (1986)

https://propstore.com/product/aliens-1986/m41a-pulse-rifle/

Type : accessoire_de_production. Usage : Forme de l’accessoire du film ; ne prouve pas sa dotation individuelle dans le roman.

### R9 — Propstore — fusil de Hicks, Aliens (1986)

https://propstoreauction.com/lot-details/index/catalog/318/lot/94872/Lot-19-ALIENS-1986-Corporal-Dwayne-Hicks-Michael-Biehn-Hero-Shotgun

Type : accessoire_de_production. Usage : Référence du shotgun de Hicks ; sa présence dans River of Pain reste à établir.

### R10 — Propstore — concept Ron Cobb du Medlab

https://propstore.com/product/aliens-1986/hand-drawn-ron-cobb-medlab-concept-sketch/

Type : dessin_de_conception_de_production. Usage : Distinguer concept du laboratoire, décor final et aménagement original du jeu.

### R11 — Propstore — concept Ron Cobb, Atmospheric Processor Control and Operations

https://propstore.com/product/aliens-1986/hand-drawn-ron-cobb-a-pcontrol-and-operations-concept-sketch/

Type : dessin_de_conception_de_production. Usage : Direction architecturale des espaces de contrôle, sans graphe complet du DLC.

### R12 — Propstore — maquette de bâtiment Hadley’s Hope

https://propstore.com/product/aliens-1986/hadleys-hope-model-miniature-building/

Type : maquette_de_production. Usage : Volumes et matériaux extérieurs de la colonie ; les dimensions logiques du jeu ne deviennent pas officielles.

## Reconstruction

```sh
node scripts/build-river-of-pain-bible.mjs
```

Le générateur contrôle les identifiants, références et couvertures. En mode local il relit également les PNG et vérifie leurs empreintes. Une recette en jeu reste distincte.
