# AVP (2004) — spécifications individuelles de production

**78 fiches détaillées, huit catégories, 44 lieux et 52 liaisons.** Ce document complète la bible du jeu avec le manque concret, les pièces, les variantes, le porteur, la phase, les animations et les critères de recette de chaque élément. La cible reste la fidélité 1:1 ; aucune fiche n’est déclarée exacte par sa seule existence.

Base runtime examinée : `b0df1877a058f0818f96437fdfdea3f21ba7f415`. La bible PR68 a depuis été fusionnée à `c7a0339f86e1de0c2209800a81506cddbc71d804` ; les résultats d’inventaire restent rattachés à leur base. [Inventaire exhaustif des 250 références](INVENTORY.md) · [Données structurées](production-specs.json) · [Manifeste des huit candidats](manifest.json).

## Couverture et preuves

Les 63 fiches demandées comprennent les 19 ABSENT, 15 A_VERIFIER, 7 DOCUMENT et les 22 armes du registre. Huit compléments couvrent la lance offerte par l’Ancien et sept véhicules/structures déjà représentés de façon scénique. Six surfaces de terrain et la Terre complètent les 78 fiches.

| Catégorie | Fiches |
| --- | --- |
| Personnages | 17 |
| Props | 17 |
| Armes | 23 |
| Vaisseaux | 5 |
| Véhicules | 4 |
| Lieux | 5 |
| Terrain | 6 |
| Planète | 1 |

Les 105 relations vers des identifiants de la matrice canon 132 ont été contrôlées pour leur existence. Certains liens sont contextuels ou décrivent une pièce d’un ensemble : ils ne certifient pas une équivalence de scène. Les champs de présence proviennent du code ; les libellés canons hérités restent des pistes à qualifier. Une photo de prop prouve la forme de l’objet photographié, pas son porteur dans chaque plan.

### Règles communes

- Référence consultable, montage et attribution explicites pour les attributs critiques.
- Comparaison sur vue compatible : silhouette, repères, proportions relatives, tenue/variante, matériaux et accessoires ; consigner les écarts.
- Les unités de jeu ne sont pas des mètres ; aucune dimension physique inventée.
- PNG individuel, manifeste, alpha, pivot, orientation et attaches pour chaque pièce de jeu.
- Si activé : chargeur réel, propriétaire/phase, occlusion, contact au sol, passages et sauvegarde/reprise testés.
- Exact et canonExact restent false sans revue spécifique ; génération, admission et raccord sont distincts.

### Production visuelle de ce lot

Huit PNG sont conservés comme candidats : deux générations ont reçu une image de référence (chestburster et Piper Maru), six reposent sur une consigne textuelle. Aucun de ces huit fichiers n’est raccordé au runtime. Les réserves de silhouette, d’alpha, de profil et de fidélité sont conservées dans le manifeste et dans les fiches concernées. Une spécification sans candidat reste une spécification.

| Candidat | Référence de génération | État |
| --- | --- | --- |
| chestburster-human-avp2004-v001.png | image-conditioned | Candidat ; aucun raccord ; exact:false |
| piper-maru-avp2004-v001.png | image-conditioned | Candidat ; aucun raccord ; exact:false |
| earth-avp2004-v001.png | text-only | Candidat ; aucun raccord ; exact:false |
| glacier-face-avp2004-v001.png | text-only | Candidat ; aucun raccord ; exact:false |
| snowcat-avp2004-v001.png | text-only | Candidat ; aucun raccord ; exact:false |
| whalebone-arch-avp2004-v001.png | text-only | Candidat ; aucun raccord ; exact:false |
| whaling-station-facade-avp2004-v001.png | text-only | Candidat ; aucun raccord ; exact:false |
| weyland-satellite-avp2004-v001.png | text-only | Candidat ; aucun raccord ; exact:false |

### Conflits de source à résoudre

- **AVP2004-024 / AVP2004-187** — Le catalogue historique mentionne l’Italie, tandis que la matrice de recherche propose Teotihuacan au Mexique. L’équivalence de scène et le montage restent à résoudre avant production ; aucun nouveau lieu italien n’est admis sur ce seul libellé. La source secondaire S24, section « Our Leading Man’s Money Problems… », paragraphe « The Film », situe Sebastian à Teotihuacan au Mexique. Le libellé hérité Italie doit être corrigé après raccord au plan/carton du film ; aucune Italie nouvellement produite.
- **AVP2004-105** — Port de Beretta par Rousseau proposé dans la recherche, à relier au plan avant modification du propriétaire réservé du catalogue. L’attribution Beretta84FS/Rousseau vient de la source secondaire IMFDB S26 avec captures, à contrôler au plan.
- **AVP2004-084 / AVP2004-098** — Le candidat de lance n’est pas livré dans le lot de huit images ; les sources de prop doivent être attribuées aux plans avant désignation combistick/arme cadeau. 

Le kit médical, le fluide bleu, l’outil chirurgical, le biomask de l’Ancien et Celtic sans masque restent soumis à la preuve du bon film et du bon montage. Ils ne sont pas générés ni intégrés automatiquement à partir de souvenirs d’AVPR ou d’autres Predator.

## Personnages

### AVP2004-011 — Stone

**Présence actuelle :** ABSENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Stone n’a aucun sprite individuel ni occurrence d’acteur.

**Observé dans les sources :** Pas de représentation physique vérifiée dans cette livraison.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Membre de l'équipe d'exploration et de sécurité.

**Apparence à relever et comparer**

- Visage attribué à Stone
- silhouette complète et couches du costume
- équipement réellement porté.

**Inconnues explicites**

- Correspondance nom/crédit/visage
- rôle et arme exacts
- couleurs non établies.

**Variantes distinctes**

- Portrait d’identification
- tenue du plan attesté
- profil 2D après identification.

**Propriétaire et rôle :** Stone, identité du registre à confirmer.

**Emplacement et phase :** Aucune room attribuée. Localiser d’abord sa scène avant toute insertion.

**Pièces à produire**

- Tête et corps distincts
- costume référencé
- attaches d’accessoires si visibles.

**Animations selon le rôle et les plans**

- Pose scénique ou marche selon son rôle réel, sans comportement de marine par défaut.

**Critères d’acceptation propres à cet élément**

- Une source relie le nom au visage
- le sprite n’est pas une recoloration de guard
- chaque accessoire est retrouvable sur sa référence.

**Continuité à préserver**

- Ne pas inventer âge, uniforme, destin ou dialogue pour remplir la ligne.

**Dépendances :** AVP2004-020.

**Raccord à la matrice canon 132 :** `char_stone` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S27 — Rotten Tomatoes — Cast and Crew](https://www.rottentomatoes.com/m/alien_vs_predator/cast-and-crew) — base secondaire. Personnages principaux/interprètes ; contrôle au générique encore requis.
- [S28 — MovieMeter — Full Cast](https://www.moviemeter.com/movies/action/avp-alien-vs-predator/cast) — base secondaire. Noms secondaires crédités ; ne prouve ni costume ni position exacte.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-012 — Sven

**Présence actuelle :** ABSENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Sven est une référence sans présence physique.

**Observé dans les sources :** Pas de représentation physique vérifiée dans cette livraison.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Membre secondaire de l'expédition arctique.

**Apparence à relever et comparer**

- Tête, morphologie et tenue du Sven identifié
- emplacement de l’équipement visible.

**Inconnues explicites**

- Identification visuelle non établie
- nombre de variantes
- fonctions exactes.

**Variantes distinctes**

- Portrait
- costume attesté
- une pose distincte par action nécessaire.

**Propriétaire et rôle :** Sven, attribution à documenter.

**Emplacement et phase :** Aucune implantation actuelle. La scène détermine la room et la fenêtre narrative.

**Pièces à produire**

- Silhouette propre
- tête lisible
- accessoires sourcés.

**Animations selon le rôle et les plans**

- Idle et déplacement seulement si l’insertion mobile est justifiée.

**Critères d’acceptation propres à cet élément**

- Le même individu est nommé et montré par les sources
- les différences avec Mikkel sont documentées
- phase de présence explicite.

**Continuité à préserver**

- Ne pas déduire une apparence scandinave du prénom ni fusionner Sven et Mikkel.

**Dépendances :** AVP2004-020, AVP2004-014.

**Raccord à la matrice canon 132 :** `char_sven` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S27 — Rotten Tomatoes — Cast and Crew](https://www.rottentomatoes.com/m/alien_vs_predator/cast-and-crew) — base secondaire. Personnages principaux/interprètes ; contrôle au générique encore requis.
- [S28 — MovieMeter — Full Cast](https://www.moviemeter.com/movies/action/avp-alien-vs-predator/cast) — base secondaire. Noms secondaires crédités ; ne prouve ni costume ni position exacte.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-013 — Juan Ramirez

**Présence actuelle :** ABSENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Juan Ramirez est absent du runtime ; le nom ne prouve pas une silhouette de garde polaire.

**Observé dans les sources :** Pas de représentation physique vérifiée dans cette livraison.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Membre secondaire de l'expédition et de l'équipage du navire.

**Apparence à relever et comparer**

- Visage de l’acteur attribué à Juan Ramirez
- costume et environnement de la scène de recrutement identifiée.

**Inconnues explicites**

- Référence visuelle de la scène mexicaine à recouper
- tenue et accessoires
- participation éventuelle au voyage.

**Variantes distinctes**

- Tenue de recrutement attestée
- aucun costume polaire sans preuve.

**Propriétaire et rôle :** Juan Ramirez ; les sources de cast indiquent Andy Lucas, attribution de plan encore à vérifier.

**Emplacement et phase :** Scène de recrutement à qualifier. Ne pas le placer dans le temple par défaut.

**Pièces à produire**

- Portrait individuel
- corps et costume de sa scène
- props montrés.

**Animations selon le rôle et les plans**

- Action de recrutement ou pose selon la référence, sans arme/IA inventée.

**Critères d’acceptation propres à cet élément**

- Correspondance nom/acteur/plan documentée
- lieu et montage identifiés
- absence de faux équipement de sécurité.

**Continuité à préserver**

- Ne pas transformer un personnage de recrutement en membre armé de l’expédition.

**Dépendances :** AVP2004-187, AVP2004-020.

**Raccord à la matrice canon 132 :** `char_juan` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S28 — MovieMeter — Full Cast](https://www.moviemeter.com/movies/action/avp-alien-vs-predator/cast) — base secondaire. Noms secondaires crédités ; ne prouve ni costume ni position exacte.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-014 — Mikkel

**Présence actuelle :** ABSENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Mikkel n’a pas de sprite ni de scène attribuée.

**Observé dans les sources :** Pas de représentation physique vérifiée dans cette livraison.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Membre secondaire de l'équipe ou du soutien logistique.

**Apparence à relever et comparer**

- Visage et gabarit du Mikkel identifié
- coupe des couches de tenue
- objets visibles.

**Inconnues explicites**

- Attribution du nom au plan
- profils cachés
- détails du costume.

**Variantes distinctes**

- Portrait d’identification
- costume unique tant qu’un changement n’est pas attesté.

**Propriétaire et rôle :** Mikkel, identité à résoudre.

**Emplacement et phase :** Aucune room déterminée avant attribution de scène.

**Pièces à produire**

- Sprite individuel
- accessoires visibles
- variante de posture si utile.

**Animations selon le rôle et les plans**

- Idle ou action scénique
- déplacement seulement si nécessaire.

**Critères d’acceptation propres à cet élément**

- Mikkel n’est pas une seconde étiquette pour Sven
- le dossier distingue connu et hors champ
- aucun nouvel état n’est présenté comme canon sans source.

**Continuité à préserver**

- Ne pas utiliser des stéréotypes déduits du prénom.

**Dépendances :** AVP2004-012, AVP2004-020.

**Raccord à la matrice canon 132 :** `char_mikkel` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S27 — Rotten Tomatoes — Cast and Crew](https://www.rottentomatoes.com/m/alien_vs_predator/cast-and-crew) — base secondaire. Personnages principaux/interprètes ; contrôle au générique encore requis.
- [S28 — MovieMeter — Full Cast](https://www.moviemeter.com/movies/action/avp-alien-vs-predator/cast) — base secondaire. Noms secondaires crédités ; ne prouve ni costume ni position exacte.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-015 — Bass

**Présence actuelle :** ABSENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Bass reste une ligne de catalogue sans asset.

**Observé dans les sources :** Pas de représentation physique vérifiée dans cette livraison.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Membre secondaire de la mission Weyland.

**Apparence à relever et comparer**

- Identification du visage
- tenue du plan attribué
- silhouette et accessoires discernables.

**Inconnues explicites**

- Rôle et scène exacts
- costume et couleur non qualifiés.

**Variantes distinctes**

- Portrait
- profil du costume attesté.

**Propriétaire et rôle :** Bass, rôle non enrichi par supposition.

**Emplacement et phase :** Aucune implantation actuelle ; attendre la scène plutôt qu’un placement de figurant arbitraire.

**Pièces à produire**

- Corps/tête individualisés
- vêtement sourcé.

**Animations selon le rôle et les plans**

- Pose scénique, ou action réellement montrée.

**Critères d’acceptation propres à cet élément**

- Une référence distingue Bass des autres personnes
- les détails non visibles restent inconnus
- le rôle runtime ne dépasse pas sa scène.

**Continuité à préserver**

- Ne pas inventer origine, âge, arme ou uniforme à partir du nom.

**Dépendances :** AVP2004-020.

**Raccord à la matrice canon 132 :** `char_bass` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S27 — Rotten Tomatoes — Cast and Crew](https://www.rottentomatoes.com/m/alien_vs_predator/cast-and-crew) — base secondaire. Personnages principaux/interprètes ; contrôle au générique encore requis.
- [S28 — MovieMeter — Full Cast](https://www.moviemeter.com/movies/action/avp-alien-vs-predator/cast) — base secondaire. Noms secondaires crédités ; ne prouve ni costume ni position exacte.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-017 — Quinn's assistant / drilling crew member

**Présence actuelle :** ABSENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

L’assistant de Quinn / membre du forage n’est pas un acteur distinct.

**Observé dans les sources :** Pas de représentation physique vérifiée dans cette livraison.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Membre anonyme ou peu nommé de l'équipe de forage.

**Apparence à relever et comparer**

- Tenue de travail visible près de Quinn
- protection de tête/mains
- outil réellement manipulé.

**Inconnues explicites**

- Identité individuelle ou simple regroupement fonctionnel
- éventuel doublon avec un personnage nommé
- effectif.

**Variantes distinctes**

- Opérateur au travail si attesté
- tenue de transport si distincte.

**Propriétaire et rôle :** Assistant de Quinn, sans nom inventé.

**Emplacement et phase :** Station/bore seulement comme raccord proposé, au moment du plan confirmé.

**Pièces à produire**

- Corps en tenue référencée
- outil exact
- attache main ou harnais.

**Animations selon le rôle et les plans**

- Manipulation et arrêt de l’outil
- trajet court cohérent.

**Critères d’acceptation propres à cet élément**

- Pas de doublon d’identité
- outil appartenant à la bonne scène
- opérateur ne crée pas le tunnel préexistant.

**Continuité à préserver**

- Aucun nom, effectif ou accident supplémentaire inventé.

**Dépendances :** AVP2004-008, AVP2004-117, AVP2004-118, AVP2004-147.

**Raccord à la matrice canon 132 :** `char_expedition_extras` (contexte, composant ou variante ; pas une équivalence canon complète) ; `char_quinn` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-018 — Piper Maru captain

**Présence actuelle :** ABSENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

La fonction de capitaine est listée, sans capitaine visible certifié dans le film.

**Observé dans les sources :** Pas de représentation physique vérifiée dans cette livraison.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Capitaine de l'icebreaker transportant l'expédition vers Bouvetøya.

**Apparence à relever et comparer**

- Visage/poste/vêtement seulement si une scène permet d’identifier un capitaine.

**Inconnues explicites**

- Capitaine autonome visible ou fonction supposée
- noms Leighton/Gordon issus de pistes roman/scénario, pas preuve écran
- insignes inconnus.

**Variantes distinctes**

- Pose au poste attesté
- tenue individuelle seulement après identification.

**Propriétaire et rôle :** Capitaine du Piper Maru, identité réservée.

**Emplacement et phase :** Bridge/maru ne sont que possibilités d’intégration, pas preuve qu’un personnage nommé s’y trouve.

**Pièces à produire**

- Dossier de source
- sprite propre si existence écran établie
- accessoire de navigation attesté.

**Animations selon le rôle et les plans**

- Pose de poste et interaction scénique, pas de conduite libre.

**Critères d’acceptation propres à cet élément**

- Source montrant le personnage et sa fonction
- costume non inventé
- identité de roman/scénario explicitement séparée.

**Continuité à préserver**

- Ne pas confondre pilote de l’hélicoptère et capitaine du navire.

**Dépendances :** AVP2004-113, AVP2004-211, AVP2004-019.

**Raccord à la matrice canon 132 :** `char_expedition_extras` (contexte, composant ou variante ; pas une équivalence canon complète) ; `ship_piper_maru` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S33 — John Lee — Senior model maker, Alien vs Predator](https://www.johnleemodelmaker.me/avp.aspx) — fabricant primaire. Photos satellite, navire miniature15pieds et machineReine1/3 ; plusieurs stades de fabrication, détails finaux à contrôler.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-019 — Piper Maru crew

**Présence actuelle :** ABSENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

L’équipage du Piper Maru est un regroupement absent, pas plusieurs personnages déjà produits.

**Observé dans les sources :** Pas de représentation physique vérifiée dans cette livraison.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Marins et personnels de bord du navire Piper Maru.

**Apparence à relever et comparer**

- Individus distinguables sur les plans du pont/passerelle
- vêtements et tâches visibles
- échelle relative.

**Inconnues explicites**

- Effectif total hors champ
- noms/rangs
- distinction équipage/passagers.

**Variantes distinctes**

- Une fiche par silhouette distinguable
- variantes de posture sans les compter comme nouveaux individus.

**Propriétaire et rôle :** Équipage maritime civil.

**Emplacement et phase :** Maru/bridge selon la scène, sans insertion dans le temple sans continuité.

**Pièces à produire**

- Sprites individuels identifiés par plan/rôle si anonymes
- outils de poste.

**Animations selon le rôle et les plans**

- Tâches et déplacements courts attestés, pas de nouveaux compagnons.

**Critères d’acceptation propres à cet élément**

- Effectif vérifié séparé des instances
- chaque silhouette a une référence
- postes et circulation plausibles.

**Continuité à préserver**

- Ne pas confondre équipage du navire avec expédition scientifique.

**Dépendances :** AVP2004-113, AVP2004-018, AVP2004-210, AVP2004-211.

**Raccord à la matrice canon 132 :** `char_expedition_extras` (contexte, composant ou variante ; pas une équivalence canon complète) ; `ship_piper_maru` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S33 — John Lee — Senior model maker, Alien vs Predator](https://www.johnleemodelmaker.me/avp.aspx) — fabricant primaire. Photos satellite, navire miniature15pieds et machineReine1/3 ; plusieurs stades de fabrication, détails finaux à contrôler.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-024 — Italian archaeologists at dig site — libellé historique non validé

**Présence actuelle :** ABSENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Les archéologues des fouilles italiennes ne sont pas représentés.

**Observé dans les sources :** Pas de représentation physique vérifiée dans cette livraison.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Équipe visible avec Sebastian avant son recrutement.

**Apparence à relever et comparer**

- Vêtements/outils du chantier de recrutement
- figurants distinguables
- échelle avec Sebastian et le site.

**Inconnues explicites**

- Effectif
- couleurs hors champ
- topographie exacte du site.
- Le catalogue historique mentionne l’Italie, tandis que la matrice de recherche propose Teotihuacan au Mexique. L’équivalence de scène et le montage restent à résoudre avant production ; aucun nouveau lieu italien n’est admis sur ce seul libellé.

**Variantes distinctes**

- Figurants du plan
- outils tenus et posés.

**Propriétaire et rôle :** Équipe du site de fouilles, identités non inventées.

**Emplacement et phase :** Recrutement de Sebastian, localisation à résoudre (Italie héritée / Teotihuacan proposé). Séquence séparée du voyage vers Bouvetøya.

**Pièces à produire**

- Personnages nécessaires au plan
- petits outils
- tenue de chantier.

**Animations selon le rôle et les plans**

- Activité archéologique réellement montrée, sinon pose scénique.

**Critères d’acceptation propres à cet élément**

- Plan/montage identifiés
- pas de tenues polaires par défaut
- transition narrative explicite.

**Continuité à préserver**

- Ne pas leur attribuer une participation à l’expédition sans source.

**Dépendances :** AVP2004-187, AVP2004-002.

**Raccord à la matrice canon 132 :** `loc_teotihuacan` (contexte, composant ou variante ; pas une équivalence canon complète) ; `char_sebastian` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Conflit de source :** La source secondaire S24, section « Our Leading Man’s Money Problems… », paragraphe « The Film », situe Sebastian à Teotihuacan au Mexique. Le libellé hérité Italie doit être corrigé après raccord au plan/carton du film ; aucune Italie nouvellement produite.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-031 — Ancient Predator leader

**Présence actuelle :** ABSENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Le chef ancien est absent ; son identité de chef distinct reste à démontrer.

**Observé dans les sources :** Pas de représentation physique vérifiée dans cette livraison.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Yautja dominant du flashback ancien montrant le rituel dans la pyramide.

**Apparence à relever et comparer**

- Armure/masque du chasseur désigné dans le flashback
- ornements
- position dans le groupe.

**Inconnues explicites**

- Chef autonome ou lecture du cadrage
- détails cachés
- statue/relief versus personne.

**Variantes distinctes**

- État du flashback
- variante de costume seulement si distincte.

**Propriétaire et rôle :** Chasseur ancien, titre de chef conditionnel.

**Emplacement et phase :** Flashback, jamais le parcours présent.

**Pièces à produire**

- Corps/armure/biomask référencés
- arme réellement visible.

**Animations selon le rôle et les plans**

- Posture cérémonielle ou combat du plan.

**Critères d’acceptation propres à cet élément**

- Individu distinct prouvé
- pas copie de Scar ou de l’Ancien final
- époque explicite.

**Continuité à préserver**

- Ne pas appeler un personnage Elder par simple ressemblance.

**Dépendances :** AVP2004-032, AVP2004-076, AVP2004-201.

**Raccord à la matrice canon 132 :** `char_historic_predators` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S30 — AVP Galaxy — Concept Art](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/concept-art/) — reproduction de conception. Concepts armes/lieux/engins/vaisseau ; inclut des intentions abandonnées.
- [S31 — AVP Galaxy — Storyboards](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/storyboards/) — reproduction de préparation. Cadrage et trajectoires préparatoires ; pas preuve du montage final ni de sa géométrie.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-032 — Ancient Predator hunters

**Présence actuelle :** ABSENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Les chasseurs anciens manquent comme population du flashback.

**Observé dans les sources :** Pas de représentation physique vérifiée dans cette livraison.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Groupe de Yautja combattant une multitude de xénomorphes dans le flashback.

**Apparence à relever et comparer**

- Gabarits, armures et masques réellement distincts
- armes attribuées à chaque porteur
- gestes montrés.

**Inconnues explicites**

- Effectif hors champ
- noms
- variations de costumes cachées.

**Variantes distinctes**

- Chasseurs A/B/etc uniquement si distincts
- cérémonie/combat si attestés.

**Propriétaire et rôle :** Chasseurs anciens anonymes.

**Emplacement et phase :** Scène ancienne liée au récit des glyphes, sans nouveaux ennemis dans le présent.

**Pièces à produire**

- Sprites par design visible
- armes/masques individualisés.

**Animations selon le rôle et les plans**

- Actions du flashback
- silhouettes de foule si plans éloignés.

**Critères d’acceptation propres à cet élément**

- Nombre d’instances séparé des designs
- armes bien attribuées
- silhouettes ne remplacent pas le trio contemporain.

**Continuité à préserver**

- Ne pas les nommer automatiquement Scar/Celtic/Chopper.

**Dépendances :** AVP2004-031, AVP2004-066, AVP2004-076, AVP2004-201.

**Raccord à la matrice canon 132 :** `char_historic_predators` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S30 — AVP Galaxy — Concept Art](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/concept-art/) — reproduction de conception. Concepts armes/lieux/engins/vaisseau ; inclut des intentions abandonnées.
- [S31 — AVP Galaxy — Storyboards](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/storyboards/) — reproduction de préparation. Cadrage et trajectoires préparatoires ; pas preuve du montage final ni de sa géométrie.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-033 — Predator mothership crew

**Présence actuelle :** ABSENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

L’équipage du vaisseau n’est pas produit au-delà de l’Ancien et de la scène condensée.

**Observé dans les sources :** Pas de représentation physique vérifiée dans cette livraison.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Yautja supplémentaires visibles à bord ou lors de la récupération finale.

**Apparence à relever et comparer**

- Silhouettes autour du corps de Scar
- armures et portage
- échelle à l’entrée du vaisseau.

**Inconnues explicites**

- Noms/rangs/effectif
- porteurs versus gardes
- détails hors champ.

**Variantes distinctes**

- Individus attestés
- poses de rassemblement
- porteurs synchronisés.

**Propriétaire et rôle :** Chasseurs anonymes de la récupération finale.

**Emplacement et phase :** Elder/vessel ; scène de récupération à composer depuis les plans.

**Pièces à produire**

- Sprites distincts
- attaches au corps porté
- occultations de l’entrée.

**Animations selon le rôle et les plans**

- Portage et entrée/sortie scéniques, sans IA hostile nouvelle.

**Critères d’acceptation propres à cet élément**

- Prises de portage cohérentes
- pas de trois copies de Scar
- entrée dimensionnée par rapport aux porteurs sans mètres inventés.

**Continuité à préserver**

- Ni faction jouable nouvelle, ni planète d’origine déduite du groupe final.

**Dépendances :** AVP2004-030, AVP2004-039, AVP2004-119, AVP2004-184.

**Raccord à la matrice canon 132 :** `char_clan` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.
- [S02 — MPC — Alien Vs Predator](https://www.mpcvfx.com/en/filmography/alien-vs-predator/) — fabricant VFX. Créatures, reine, vaisseau et environnements ; modèles numériques associés aux effets pratiques.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-035 — Scar Predator acid-burned

**Présence actuelle :** A_VERIFIER. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Scar brûlé par l’acide n’est pas un état qualifié ; scar-unmasked sert déjà à plusieurs états.

**Observé dans les sources :** État de Scar brûlé et traitement : contrôler le plan et ne pas mélanger les épisodes.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Scar après projection de sang acide, avant son traitement médical.

**Apparence à relever et comparer**

- Zone atteinte, forme et côté de la trace
- tissu concerné
- distinction marquage rituel/blessure.

**Inconnues explicites**

- Brûlure distincte réellement présente dans2004 ?
- étendue
- absence de kit de soin confirmé.

**Variantes distinctes**

- Marqué attesté
- brûlé seulement si preuve d’un état distinct.

**Propriétaire et rôle :** Scar uniquement.

**Emplacement et phase :** Rattacher au jalon exact, sans nouvelle scène de soin.

**Pièces à produire**

- Couche de marque ou tête distincte
- tenue stable sauf changement visible.

**Animations selon le rôle et les plans**

- Geste de marquage si traité, aucune chirurgie inventée.

**Critères d’acceptation propres à cet élément**

- Référence Scar/2004
- forme et côté comparables
- marquage et blessure ne sont pas deux costumes sans preuve.

**Continuité à préserver**

- Ne pas importer les brûlures ou outils de Wolf/AVPR ou Predator2.

**Dépendances :** AVP2004-034, AVP2004-036, AVP2004-092, AVP2004-095.

**Raccord à la matrice canon 132 :** `char_scar` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S04 — Propstore — Scar costume 69075](https://propstore.com/product/avp-alien-vs-predator-2004/scar-predator-ian-whyte-creature-costume/) — costume de production. Équipement ADI ; épines faciales retirées après tournage pour AVPR. Ne pas reproduire cette altération de conservation.
- [S05 — Propstore — Scar bio-mask lot833](https://propstore.com/product/avp-alien-vs-predator-2004/lot-833-scars-ian-whyte-predator-bio-mask/) — objet de production. Masque argenté, visière quadrillée, détails latéraux ; dimensions d’accessoire uniquement.
- [S32 — Propstore — Scar costume display lot23](https://propstore.com/product/avp-alien-vs-predator-2004/lot-23-scars-ian-whyte-predator-costume-display/) — costume de production. Brûlures intentionnelles d’épaule/canon reliées à l’attaque de Weyland ; distinguer dégâts narratifs et vieillissement.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-037 — Celtic Predator unmasked

**Présence actuelle :** A_VERIFIER. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Celtic sans masque n’est pas validé ; le jeu garde le biomask.

**Observé dans les sources :** Celtic sans masque : non validé ; la version du jeu conserve son biomask.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Variante sans biomask visible durant le combat contre Grid.

**Apparence à relever et comparer**

- Si un plan le justifie : front, mandibules, pigmentation
- sinon conserver le masque référencé.

**Inconnues explicites**

- État écran ou pièce/figurine de production
- face non visible
- retrait du masque non démontré.

**Variantes distinctes**

- Celtic masqué conservé
- variante sans masque en dossier séparé si source.

**Propriétaire et rôle :** Celtic, pas une tête de Scar.

**Emplacement et phase :** Aucun démasquage dans le duel ajouté sans preuve.

**Pièces à produire**

- Dossier d’attribution
- nouvelle tête seulement après qualification.

**Animations selon le rôle et les plans**

- Pas d’animation de retrait sans scène source.

**Critères d’acceptation propres à cet élément**

- Source spécifique Celtic
- écran et production séparés
- absence de plan ne valide pas un visage inventé.

**Continuité à préserver**

- Ne pas modifier sa scène de duel pour créer une variante.

**Dépendances :** AVP2004-028, AVP2004-073, AVP2004-190.

**Raccord à la matrice canon 132 :** `char_celtic` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S06 — Propstore — Celtic screen-matched costume lot13](https://propstoreauction.com/lot-details/index/catalog/449/lot/156867/13-Celtic-s-Ian-Whyte-Screen-Matched-Predator-Costume-Display-AVP-ALIEN-VS-PREDATOR-2004) — costume rapproché des plans. Masque et dégâts de plastron rapprochés du film. Assemblage d’exposition ne prouve pas possession de chaque arme à chaque scène.
- [S07 — Propstore — Celtic helmet lot55](https://usm.propstoreauction.com/lot-details/index/catalog/267/lot/62166/Lot-55-AVP-ALIEN-VS-PREDATOR-2004-Celtic-s-Ian-Whyte-Predator-Helmet) — objet de production. Masque gris métallique, mécanique sculptée, tri-laser ; états à associer aux scènes.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-054 — Chestburster

**Présence actuelle :** ABSENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Le chestburster standard manque ; le nouveau-né Predalien présent ne le couvre pas.

**Observé dans les sources :** Pas de représentation physique vérifiée dans cette livraison.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Forme juvénile naissant des membres sacrifiés de l'expédition.

**Apparence à relever et comparer**

- Tête/museau du spécimen AVP2004
- corps annelé, queue et membres visibles
- matériau du prop primaire.

**Inconnues explicites**

- Face cachée
- taille en mètres
- variante de puppet et hôte de chaque naissance.

**Variantes distinctes**

- Profil individuel
- émergence
- corps libre seulement si montré.

**Propriétaire et rôle :** Créature biologique, hors inventaire joueur.

**Emplacement et phase :** Naissance associée à l’hôte/scène attestés, sans nouvelle créature errante par défaut.

**Pièces à produire**

- Sprite complet alpha
- tête/queue/membres séparés si articulation
- éclairage du plan.

**Animations selon le rôle et les plans**

- Émergence et mouvement bref distincts de film-newborn.

**Critères d’acceptation propres à cet élément**

- Comparer au chestburster standard2004
- silhouette non recadrée
- membres et anneaux concordent
- candidat généré ne change pas ABSENT en ACTIF sans raccord.

**Continuité à préserver**

- Ni mandibules de Predator ajoutées au standard, ni Predalien adulte.

**Dépendances :** AVP2004-048, AVP2004-051, AVP2004-067, AVP2004-047.

**Raccord à la matrice canon 132 :** `creature_chestburster` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S21 — studioADI — Brains, Blood & Guts BTS](https://www.youtube.com/watch?v=UEm3Tj6L_QE) — fabricant effets. Effets pratiques et surfaces Alien ; séparer fabrication et chronologie.
- [S03 — studioADI — AVP Filming Predators In Temple BTS](https://www.youtube.com/watch?v=1Q9V_1aXe2w) — fabricant effets. Costume Predator, tête Alien et décor de temple ; timecodes à relever.
- [S37 — Propstore — Chestburster de production AVP2004, lot118656](https://propstoreauction.com/lot-details/index/catalog/359/lot/118656) — objet de production. Référence photographique fournie au générateur par le coordinateur ; forme du prop, pas preuve d’un hôte/plan précis.

**Candidat lié à cette fiche :** `assets/openai/sprites/avp2004-production-v001/chestburster-human-avp2004-v001.png` ; génération `image-conditioned`, SHA-256 `e2c0680ad987e86b8e1a6d31504f975a2f5539ae86381622289d933ed893de24`.

Silhouette complète et queue visibles. Teinte, petits bras, dents et proportions à comparer au prop et aux plans. La pose fixe ne fournit ni naissance ni locomotion. Le contenu runtime reste ABSENT.

Ce candidat ne modifie ni la présence historique du catalogue ni le runtime.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-055 — Adult Alien inner jaw

**Présence actuelle :** DOCUMENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

La mâchoire interne est documentaire ; les dents de xeno ne sont pas une animation autonome.

**Observé dans les sources :** Mâchoire interne non animée séparément. Les dents du dessin ne prouvent pas cette attaque.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/xeno.svg`.

**Description historique, non requalifiée à elle seule :** Mâchoire secondaire des xénomorphes adultes.

**Apparence à relever et comparer**

- Extrémité, dents et cou interne
- trajet depuis la bouche
- extension relative au crâne.

**Inconnues explicites**

- Course et angles cachés
- durée
- variante propre à Grid.

**Variantes distinctes**

- Rentrée
- sortie partielle
- extension
- retour.

**Propriétaire et rôle :** Xénomorphe adulte2004.

**Emplacement et phase :** Attaque xeno/grid existante après qualification ; pas nouvel ennemi.

**Pièces à produire**

- Mâchoire interne
- masque d’occlusion de bouche
- attache au crâne.

**Animations selon le rôle et les plans**

- Extension/retour coordonnés à la tête et à l’impact accepté.

**Critères d’acceptation propres à cet élément**

- Sortie par la bouche
- perspective stable
- impact au bon moment
- aucune pièce flottante
- cadence adaptée étiquetée si non mesurée.

**Continuité à préserver**

- Ne pas importer l’anatomie du Predalien adulte.

**Dépendances :** AVP2004-046, AVP2004-045.

**Raccord à la matrice canon 132 :** `creature_warrior` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S20 — studioADI — Alien Slice And Dice BTS](https://www.youtube.com/watch?v=vHV1VX8lqJA) — fabricant effets. Silhouette Alien, suspension et pose ; pas une preuve du quadrillage de Grid.
- [S21 — studioADI — Brains, Blood & Guts BTS](https://www.youtube.com/watch?v=UEm3Tj6L_QE) — fabricant effets. Effets pratiques et surfaces Alien ; séparer fabrication et chronologie.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-066 — Ancient xenomorph horde

**Présence actuelle :** ABSENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

La horde ancienne n’a pas de scène de foule propre.

**Observé dans les sources :** Pas de représentation physique vérifiée dans cette livraison.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Masse de xénomorphes montrée lors du flashback du rituel ancien.

**Apparence à relever et comparer**

- Silhouettes, densité visible et rapport à la pyramide
- postures et taille relative
- interactions avec chasseurs anciens.

**Inconnues explicites**

- Effectif hors champ
- trajectoires cachées
- différences de castes non démontrées.

**Variantes distinctes**

- Figures de premier plan
- silhouettes de fond
- phases attestées de montée/combat.

**Propriétaire et rôle :** Horde du flashback ancien.

**Emplacement et phase :** Interlude séparé, pas remplacement des tables d’ennemis actuelles.

**Pièces à produire**

- Sprites par design
- plans d’occlusion
- silhouettes de foule.

**Animations selon le rôle et les plans**

- Course/escalade si visibles, simulation d’instances clairement distinguée du film.

**Critères d’acceptation propres à cet élément**

- Assets et instances comptés séparément
- époque et architecture cohérentes
- scène de foule ne certifie pas la navigation actuelle.

**Continuité à préserver**

- Ne pas remplir avec des castes d’autres films/jeux.

**Dépendances :** AVP2004-032, AVP2004-201, AVP2004-121.

**Raccord à la matrice canon 132 :** `creature_warrior` (contexte, composant ou variante ; pas une équivalence canon complète) ; `loc_historical_city` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S30 — AVP Galaxy — Concept Art](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/concept-art/) — reproduction de conception. Concepts armes/lieux/engins/vaisseau ; inclut des intentions abandonnées.
- [S31 — AVP Galaxy — Storyboards](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/storyboards/) — reproduction de préparation. Cadrage et trajectoires préparatoires ; pas preuve du montage final ni de sa géométrie.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

## Lieux

### AVP2004-185 — 1904 whaling station massacre

**Présence actuelle :** A_VERIFIER. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

La ligne1904 est classée cinéma/Unrated dans l’héritage, tandis que l’implémentation la réserve au prologue Unrated.

**Observé dans les sources :** Le prologue 1904 appartient au périmètre Unrated ; ne pas le déclarer dans le montage cinéma.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Prologue montrant une ancienne chasse Yautja/xénomorphe.

**Apparence à relever et comparer**

- État ancien des façades
- vêtements/props1904
- éclairage et composition du prologue exact.

**Inconnues explicites**

- Montage précis
- raccord1904/2004
- bâtiments et parties hors champ.

**Variantes distinctes**

- Station1904
- station2004 distincte
- population d’époque.

**Propriétaire et rôle :** Prologue historique, habitants propres.

**Emplacement et phase :** Scène séparée explicitement qualifiée, sans porte depuis2004.

**Pièces à produire**

- Bâtiments
- personnes
- props d’époque
- transition temporelle.

**Animations selon le rôle et les plans**

- Événements montrés, sans destin réécrit.

**Critères d’acceptation propres à cet élément**

- Montage identifié par source
- aucun détail contemporain introduit
- réemploi des bâtiments après comparaison.

**Continuité à préserver**

- Ne pas certifier le prologue comme présent dans le montage cinéma sans vérification.

**Dépendances :** AVP2004-216, AVP2004-021, AVP2004-022, AVP2004-023, AVP2004-169.

**Raccord à la matrice canon 132 :** `loc_station_wide` (contexte, composant ou variante ; pas une équivalence canon complète) ; `char_historical_extras` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S31 — AVP Galaxy — Storyboards](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/storyboards/) — reproduction de préparation. Cadrage et trajectoires préparatoires ; pas preuve du montage final ni de sa géométrie.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-187 — Expedition recruitment montage

**Présence actuelle :** ABSENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Recrutement résumé ; Népal/Italie non reconstitués.

**Observé dans les sources :** Népal, fouilles en Italie et autres lieux de recrutement non reconstitués en niveaux. Aucune porte fictive ne les raccorde à la pyramide.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Séquences présentant le recrutement de l'équipe.

**Apparence à relever et comparer**

- Plan de Lex au Népal, paroi/glace et tenue
- fouilles de Sebastian, ruines/outils/figurants
- autre recrutement qualifié.

**Inconnues explicites**

- Topographie complète
- distances
- ordre et scènes selon version
- contexte mexicain à recouper.
- Le catalogue historique mentionne l’Italie, tandis que la matrice de recherche propose Teotihuacan au Mexique. L’équivalence de scène et le montage restent à résoudre avant production ; aucun nouveau lieu italien n’est admis sur ce seul libellé.

**Variantes distinctes**

- Népal
- Site de recrutement de Sebastian : Teotihuacan au Mexique selon S24, plan/carton à relever
- autre lieu seulement attesté.

**Propriétaire et rôle :** Lex/Sebastian et recruteurs identifiés.

**Emplacement et phase :** Introductions avant Piper Maru, transition de voyage, pas corridor.

**Pièces à produire**

- Décor par lieu
- tenues de recrutement
- props nécessaires.

**Animations selon le rôle et les plans**

- Escalade/archéologie selon plan
- transition sans pilotage libre.

**Critères d’acceptation propres à cet élément**

- Source propre à chaque lieu
- ouvertures architecturales logiques
- pas de porte reliant Italie et pyramide
- costume de la bonne époque.

**Continuité à préserver**

- Ne pas confondre centre satellitaire mexicain et fouilles italiennes.

**Dépendances :** AVP2004-001, AVP2004-002, AVP2004-024, AVP2004-013.

**Raccord à la matrice canon 132 :** `loc_nepal` (contexte, composant ou variante ; pas une équivalence canon complète) ; `loc_teotihuacan` (contexte, composant ou variante ; pas une équivalence canon complète) ; `char_lex` (contexte, composant ou variante ; pas une équivalence canon complète) ; `char_sebastian` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Conflit de source :** La source secondaire S24, section « Our Leading Man’s Money Problems… », paragraphe « The Film », situe Sebastian à Teotihuacan au Mexique. Le libellé hérité Italie doit être corrigé après raccord au plan/carton du film ; aucune Italie nouvellement produite.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-189 — Predators recover the plasmacasters

**Présence actuelle :** ABSENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Récupération des canons non reconstituée physiquement malgré les objets/jalons.

**Observé dans les sources :** Pas de représentation physique vérifiée dans cette livraison.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Objectif initial des jeunes chasseurs.

**Apparence à relever et comparer**

- Nombre/position dans le coffre
- prises/transfert
- fixation épaule
- état avant/après.

**Inconnues explicites**

- Répartition exacte par montage
- mains et accessoires
- chronologie précise.

**Variantes distinctes**

- Posé
- transporté
- restitué
- monté.

**Propriétaire et rôle :** Chasseurs propriétaires ; Lex transporte/restitue si la scène le montre.

**Emplacement et phase :** Weapons puis alliance hunter, sans combat de récupération inventé.

**Pièces à produire**

- Canons nécessaires
- coffre/logements
- prises
- attaches.

**Animations selon le rôle et les plans**

- Prise/remise/fixation sans duplication.

**Critères d’acceptation propres à cet élément**

- Nombre d’objets conservé
- Scar non armé avant jalon
- objet retiré du porteur précédent
- plan du bon montage.

**Continuité à préserver**

- Aucun des trois canons automatiquement disponible pour Lex.

**Dépendances :** AVP2004-077, AVP2004-096, AVP2004-192, AVP2004-027.

**Raccord à la matrice canon 132 :** `prop_sarcophagus` (contexte, composant ou variante ; pas une équivalence canon complète) ; `weapon_plasmacaster` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S10 — Propstore — Animatronic Shoulder Cannon](https://propstore.com/product/avp-alien-vs-predator-2004/animatronic-shoulder-cannon/) — objet de production. Canon articulé, support, surfaces et marquages ; aucune caractéristique énergétique fictionnelle démontrée.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-201 — Ancient human sacrifice flashback

**Présence actuelle :** ABSENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Sacrifice ancien évoqué, sans scène complète.

**Observé dans les sources :** Événement seulement évoqué ou absent ; pas reconstitué en séquence complète.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Flashback montrant la relation ancienne humains-Yautja-xénomorphes.

**Apparence à relever et comparer**

- Architecture ancienne, autels, participants et lumière
- chasseurs
- lien œufs/hôtes.

**Inconnues explicites**

- Effectifs hors champ
- disposition complète
- dimensions
- coutumes non montrées.

**Variantes distinctes**

- Séquence ancienne
- lecture des glyphes au présent distincte.

**Propriétaire et rôle :** Participants anonymes, identités non inventées.

**Emplacement et phase :** Interlude temporel lié aux glyphes, pas salle actuelle accessible.

**Pièces à produire**

- Décor/props anciens
- personnes/hôtes
- foule si nécessaire.

**Animations selon le rôle et les plans**

- Gestes montrés et retour explicite au présent.

**Critères d’acceptation propres à cet élément**

- Époque/montage identifiés
- glyphes générés ne prouvent rien
- autels comparés
- nombres inconnus notés.

**Continuité à préserver**

- Ne pas traiter l’architecture adaptée comme relevé archéologique1:1.

**Dépendances :** AVP2004-031, AVP2004-032, AVP2004-066, AVP2004-121, AVP2004-155.

**Raccord à la matrice canon 132 :** `loc_historical_city` (contexte, composant ou variante ; pas une équivalence canon complète) ; `char_sacrifice` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S30 — AVP Galaxy — Concept Art](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/concept-art/) — reproduction de conception. Concepts armes/lieux/engins/vaisseau ; inclut des intentions abandonnées.
- [S31 — AVP Galaxy — Storyboards](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/storyboards/) — reproduction de préparation. Cadrage et trajectoires préparatoires ; pas preuve du montage final ni de sa géométrie.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-213 — Quinn drilling accident / shaft incident

**Présence actuelle :** ABSENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

L’incident de Quinn au puits est incomplet ; l’intitulé drilling accident reste à qualifier.

**Observé dans les sources :** Événement seulement évoqué ou absent ; pas reconstitué en séquence complète.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Événement associé au forage et à l'accès à la pyramide.

**Apparence à relever et comparer**

- Quinn, corde/ancrages/équipement
- cause et ordre de l’événement réellement visibles.

**Inconnues explicites**

- Mécanisme de l’incident
- distances
- participants
- titre potentiellement trompeur.

**Variantes distinctes**

- Avant
- incident attesté
- après, sans autre destin.

**Propriétaire et rôle :** Quinn et participants identifiés.

**Emplacement et phase :** Bore/station seulement si ordre narratif conservé.

**Pièces à produire**

- Tenue exacte
- corde/ancrage
- objet impliqué
- décor du plan.

**Animations selon le rôle et les plans**

- Descente/arrêt/chute ou autre geste seulement si montré.

**Critères d’acceptation propres à cet élément**

- Titre descriptif fidèle
- tunnel préexistant
- corde fixée à un support
- passage cohérent avant/après.

**Continuité à préserver**

- Ne pas prendre une mécanique originale de forage pour un événement du film.

**Dépendances :** AVP2004-008, AVP2004-147, AVP2004-017, AVP2004-171.

**Raccord à la matrice canon 132 :** `char_quinn` (contexte, composant ou variante ; pas une équivalence canon complète) ; `loc_ice_tunnel` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

## Armes

### AVP2004-077 — Plasmacaster / shoulder cannon

**Présence actuelle :** ACTIF. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Le canon de Scar est actif ; forme, support et animation restent non validés 1:1.

**Observé dans les sources :** Canon du compagnon et projectiles à profondeur ; triple point visible lors de son acquisition locale d’une cible.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-caster.svg`.

**Description historique, non requalifiée à elle seule :** Canon à plasma monté à l'épaule et guidé par laser.

**Apparence à relever et comparer**

- Canon2004, articulation du support, bouche et prise sur l’épaule
- source animatronique Propstore.

**Inconnues explicites**

- Variantes des trois canons
- cadence/dimensions
- angles cachés.

**Variantes distinctes**

- Dans le coffre
- transporté/restitué
- monté après alliance
- tir.

**Propriétaire et rôle :** Scar pour l’arme active ; autres chasseurs selon leur scène.

**Emplacement et phase :** Weapons puis hunter/nursery ; chronologie sauvegardée conservée.

**Pièces à produire**

- Canon
- support
- attaches
- charge/tir
- triple point séparé.

**Animations selon le rôle et les plans**

- Visée articulée, charge, émission et retour.

**Critères d’acceptation propres à cet élément**

- Projectile issu de la bouche
- support stable sur épaule
- aucun canon avant son jalon
- proportions comparées au prop et au costume.

**Continuité à préserver**

- Jamais un canon offert à Lex.

**Dépendances :** AVP2004-078, AVP2004-079, AVP2004-096, AVP2004-189.

**Raccord à la matrice canon 132 :** `weapon_plasmacaster` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S10 — Propstore — Animatronic Shoulder Cannon](https://propstore.com/product/avp-alien-vs-predator-2004/animatronic-shoulder-cannon/) — objet de production. Canon articulé, support, surfaces et marquages ; aucune caractéristique énergétique fictionnelle démontrée.
- [S04 — Propstore — Scar costume 69075](https://propstore.com/product/avp-alien-vs-predator-2004/scar-predator-ian-whyte-creature-costume/) — costume de production. Équipement ADI ; épines faciales retirées après tournage pour AVPR. Ne pas reproduire cette altération de conservation.
- [S03 — studioADI — AVP Filming Predators In Temple BTS](https://www.youtube.com/watch?v=1Q9V_1aXe2w) — fabricant effets. Costume Predator, tête Alien et décor de temple ; timecodes à relever.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-080 — Wrist blades

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Les lames de poignet sont incluses dans Celtic sans animation indépendante.

**Observé dans les sources :** Armes et accessoires montrés sur leur propriétaire ou dans les tableaux. Hors canon, pas une simulation complète de chaque arme Yautja.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/celtic.svg`.

**Description historique, non requalifiée à elle seule :** Lames rétractables fixées à l'avant-bras.

**Apparence à relever et comparer**

- Nombre et profil des lames
- gauntlet du porteur
- sortie et longueur relative à l’avant-bras.

**Inconnues explicites**

- Côté exact
- différences Scar/Celtic
- mécanisme caché.

**Variantes distinctes**

- Rétractées
- sorties
- attaque attestée.

**Propriétaire et rôle :** Chasseur identifié, pas un set universel.

**Emplacement et phase :** Duel et scènes attestées ; équipement propre au porteur.

**Pièces à produire**

- Gantelet
- lames
- attache avant-bras
- variantes par porteur.

**Animations selon le rôle et les plans**

- Extension/rétraction et geste du poignet.

**Critères d’acceptation propres à cet élément**

- Bon avant-bras
- lames absentes quand rétractées
- longueurs de Chopper non écrasées
- pas de flottement.

**Continuité à préserver**

- Ne pas copier le set Chopper sur tous les chasseurs.

**Dépendances :** AVP2004-028, AVP2004-027, AVP2004-081.

**Raccord à la matrice canon 132 :** `weapon_wrist_blades` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S04 — Propstore — Scar costume 69075](https://propstore.com/product/avp-alien-vs-predator-2004/scar-predator-ian-whyte-creature-costume/) — costume de production. Équipement ADI ; épines faciales retirées après tournage pour AVPR. Ne pas reproduire cette altération de conservation.
- [S06 — Propstore — Celtic screen-matched costume lot13](https://propstoreauction.com/lot-details/index/catalog/449/lot/156867/13-Celtic-s-Ian-Whyte-Screen-Matched-Predator-Costume-Display-AVP-ALIEN-VS-PREDATOR-2004) — costume rapproché des plans. Masque et dégâts de plastron rapprochés du film. Assemblage d’exposition ne prouve pas possession de chaque arme à chaque scène.
- [S07 — Propstore — Celtic helmet lot55](https://usm.propstoreauction.com/lot-details/index/catalog/267/lot/62166/Lot-55-AVP-ALIEN-VS-PREDATOR-2004-Celtic-s-Ian-Whyte-Predator-Helmet) — objet de production. Masque gris métallique, mécanique sculptée, tri-laser ; états à associer aux scènes.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-081 — Chopper extended wrist blades

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Les longues lames de Chopper sont dessinées avec son corps ; aucune pièce animée distincte.

**Observé dans les sources :** Longues lames et deux trophées dorsaux, état abattu dans le duel abrégé.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/chopper.svg`.

**Description historique, non requalifiée à elle seule :** Longues lames caractéristiques de Chopper.

**Apparence à relever et comparer**

- Longues lames et gauntlets
- silhouette avec les deux trophées dorsaux
- pose d’embuscade.

**Inconnues explicites**

- Longueur exacte
- angles hors champ
- dommages après attaque.

**Variantes distinctes**

- Armé
- abattu
- extension selon plan.

**Propriétaire et rôle :** Chopper uniquement.

**Emplacement et phase :** Duel et état abattu condensé.

**Pièces à produire**

- Lames
- gauntlets
- corps et trophées si animation séparée.

**Animations selon le rôle et les plans**

- Posture et chute attestées, sans duel prolongé inventé.

**Critères d’acceptation propres à cet élément**

- Silhouette distincte de Celtic
- lames ne traversent pas les trophées involontairement
- continuité des pièces après chute.

**Continuité à préserver**

- Le destin de Chopper n’est pas réécrit.

**Dépendances :** AVP2004-029, AVP2004-038, AVP2004-191.

**Raccord à la matrice canon 132 :** `weapon_chopper_blades` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S08 — Sideshow / Prime1 — Chopper913286](https://www.sideshow.com/collectibles/predator-chopper-predator-prime-1-studio-913286) — réplique sous licence. Branchies du masque, lames longues et deux trophées dorsaux ; le film prime sur le produit commercial.
- [S03 — studioADI — AVP Filming Predators In Temple BTS](https://www.youtube.com/watch?v=1Q9V_1aXe2w) — fabricant effets. Costume Predator, tête Alien et décor de temple ; timecodes à relever.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-082 — Celtic netgun

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Netgun scénique sans mécanisme de projection complet.

**Observé dans les sources :** Armes et accessoires montrés sur leur propriétaire ou dans les tableaux. Hors canon, pas une simulation complète de chaque arme Yautja.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-netgun.svg`.

**Description historique, non requalifiée à elle seule :** Arme projetant un filet qui se resserre et découpe sa cible.

**Apparence à relever et comparer**

- Forme du modèle2004
- prise et portage de Celtic
- sortie du projectile.

**Inconnues explicites**

- Fonctionnement interne
- taille
- implantation exacte.

**Variantes distinctes**

- Repos
- visé
- déclenché.

**Propriétaire et rôle :** Celtic pour le duel ; autre usage à prouver.

**Emplacement et phase :** Duel ; mentions hunter/elder du catalogue ne prouvent pas un usage dans ces lieux.

**Pièces à produire**

- Netgun individuel
- attache qualifiée
- projectile filet.

**Animations selon le rôle et les plans**

- Mise en joue et déploiement synchronisés.

**Critères d’acceptation propres à cet élément**

- Filet issu de l’arme
- trajectoire cohérente avec Celtic/Grid
- modèle comparé à source.

**Continuité à préserver**

- Aucune nouvelle arme utilisable par Lex.

**Dépendances :** AVP2004-028, AVP2004-083, AVP2004-190, AVP2004-045.

**Raccord à la matrice canon 132 :** `weapon_net` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S06 — Propstore — Celtic screen-matched costume lot13](https://propstoreauction.com/lot-details/index/catalog/449/lot/156867/13-Celtic-s-Ian-Whyte-Screen-Matched-Predator-Costume-Display-AVP-ALIEN-VS-PREDATOR-2004) — costume rapproché des plans. Masque et dégâts de plastron rapprochés du film. Assemblage d’exposition ne prouve pas possession de chaque arme à chaque scène.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-083 — Netgun projectile mesh

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Le filet partagé net ne décrit pas toutes ses phases.

**Observé dans les sources :** Armes et accessoires montrés sur leur propriétaire ou dans les tableaux. Hors canon, pas une simulation complète de chaque arme Yautja.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/net.svg`.

**Description historique, non requalifiée à elle seule :** Filet métallique chauffant ayant marqué Grid Alien.

**Apparence à relever et comparer**

- Maillage, enveloppement de Grid, contacts et traces
- filet distinct de cicatrice.

**Inconnues explicites**

- Nombre de mailles
- mécanisme thermique
- durée non mesurée.

**Variantes distinctes**

- En vol
- déployé
- tendu
- rompu/éliminé
- trace.

**Propriétaire et rôle :** Filet de Celtic, cible Grid.

**Emplacement et phase :** Duel ; marques de Grid après contact seulement.

**Pièces à produire**

- Filet alpha
- masque d’enveloppement
- traces sur Grid séparées.

**Animations selon le rôle et les plans**

- Déploiement/contraction puis changement d’état de Grid.

**Critères d’acceptation propres à cet élément**

- Maillage suit le volume
- Grid non marqué avant contact
- cicatrices comparables au plan.

**Continuité à préserver**

- Pas un accessoire permanent de Scar ou une récompense de Lex.

**Dépendances :** AVP2004-082, AVP2004-045, AVP2004-190.

**Raccord à la matrice canon 132 :** `weapon_net` (référence d’objet ou d’identité correspondante ; qualification propre encore requise) ; `creature_grid` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-084 — Combistick

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Le combistick partage son SVG avec la lance cadeau098.

**Observé dans les sources :** Armes et accessoires montrés sur leur propriétaire ou dans les tableaux. Hors canon, pas une simulation complète de chaque arme Yautja.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-combistick.svg`.

**Description historique, non requalifiée à elle seule :** Lance télescopique Yautja utilisée en combat rapproché.

**Apparence à relever et comparer**

- Extrémités métalliques, segments et ornements du prop ADI argent/cuivre
- prises de main.

**Inconnues explicites**

- Attribution du prop aux plans
- porteur
- longueur physique
- face cachée.

**Variantes distinctes**

- Rétracté si attesté
- déployé
- tenu/posé
- variante cadeau séparée.

**Propriétaire et rôle :** Yautja du plan à attribuer.

**Emplacement et phase :** Hunter/duel/elder sont des lieux hérités ; la photo d’objet ne valide pas tous ces usages.

**Pièces à produire**

- Hampe
- extrémités
- attaches
- variante ornementée si distincte.

**Animations selon le rôle et les plans**

- Déploiement et maintien/attaque
- remise à Lex traitée séparément.

**Critères d’acceptation propres à cet élément**

- Ornements/proportions comparés au prop primaire
- attribution filmique renseignée
- main autour de la hampe
- cadeau/combat différenciés.

**Continuité à préserver**

- Ne pas confondre avec la lance de queue099.

**Dépendances :** AVP2004-098, AVP2004-027, AVP2004-199.

**Raccord à la matrice canon 132 :** `weapon_combistick` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S11 — Propstore — Combistick lot17](https://propstoreauction.com/lot-details/index/catalog/359/lot/118654/Lot-17-AVP-ALIEN-VS-PREDATOR-2004-Predator-Combistick) — objet de production. Lance ADI argent/cuivre ; distinguer lance métallique finale et arme organique improvisée de Lex.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-085 — Collapsible shuriken

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Shuriken présent comme prop, déploiement et rotation incomplets.

**Observé dans les sources :** Armes et accessoires montrés sur leur propriétaire ou dans les tableaux. Hors canon, pas une simulation complète de chaque arme Yautja.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-shuriken.svg`.

**Description historique, non requalifiée à elle seule :** Arme de jet circulaire déployable utilisée par Scar.

**Apparence à relever et comparer**

- Nombre/profil des lames
- noyau et articulations du modèle2004
- forme repliée.

**Inconnues explicites**

- Face opposée
- forme cachée
- durée et trajectoire.

**Variantes distinctes**

- Replié
- déployé
- vol
- impact/retour seulement si montrés.

**Propriétaire et rôle :** Scar dans les scènes confirmées.

**Emplacement et phase :** Scène référencée ; trois lieux hérités ne constituent pas trois usages prouvés.

**Pièces à produire**

- Noyau
- lames
- pivot central
- impact si nécessaire.

**Animations selon le rôle et les plans**

- Déploiement/rotation et trajet qualifié.

**Critères d’acceptation propres à cet élément**

- Nombre de branches conforme
- pivot central
- pas de lame ajoutée par symétrie automatique
- bon modèle du film.

**Continuité à préserver**

- Ne pas substituer le disque de Predator2.

**Dépendances :** AVP2004-027.

**Raccord à la matrice canon 132 :** `weapon_shuriken` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S04 — Propstore — Scar costume 69075](https://propstore.com/product/avp-alien-vs-predator-2004/scar-predator-ian-whyte-creature-costume/) — costume de production. Équipement ADI ; épines faciales retirées après tournage pour AVPR. Ne pas reproduire cette altération de conservation.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-086 — Ceremonial dagger

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

La dague Yautja et le couteau humain111 partagent le même SVG.

**Observé dans les sources :** Armes et accessoires montrés sur leur propriétaire ou dans les tableaux. Hors canon, pas une simulation complète de chaque arme Yautja.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-dagger.svg`.

**Description historique, non requalifiée à elle seule :** Lame rituelle Yautja.

**Apparence à relever et comparer**

- Lame, garde, poignée et matériau du prop Yautja
- portage attesté.

**Inconnues explicites**

- Porteur/usage exact
- fragment de marquage95 distinct
- dimensions.

**Variantes distinctes**

- Portée
- tenue
- état rituel seulement attesté.

**Propriétaire et rôle :** Yautja identifié.

**Emplacement et phase :** Scène à attribuer ; ne pas poser par défaut la dague sur la table de sécurité humaine.

**Pièces à produire**

- Dague propre
- support/fourreau si visible
- attache.

**Animations selon le rôle et les plans**

- Prise/retrait si montrés, pas nouveau combat.

**Critères d’acceptation propres à cet élément**

- Source propre à la dague
- dessin distinct du couteau humain
- aucun fragment xéno remplacé par une lame.

**Continuité à préserver**

- Le mot rituel ne prouve pas un couteau de marquage.

**Dépendances :** AVP2004-111, AVP2004-095.

**Raccord à la matrice canon 132 :** `weapon_dagger` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-098 — Elder's ceremonial spear gift

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

La lance cadeau n’a pas de variante individuelle ; elle partage film-combistick.

**Observé dans les sources :** Lance de reconnaissance montrée à la fin ; pas une arme débloquée avant son don.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-combistick.svg`.

**Description historique, non requalifiée à elle seule :** Lance offerte à Lex par l'Elder après l'épreuve.

**Apparence à relever et comparer**

- Ornements, hampe et extrémités au moment de la remise
- prises de l’Ancien puis de Lex.

**Inconnues explicites**

- Même objet que084 ou variante
- attribution du prop d’enchère
- faces cachées.

**Variantes distinctes**

- Avant remise
- transfert
- tenue finale.

**Propriétaire et rôle :** Ancien puis Lex, après jugement.

**Emplacement et phase :** Elder, après le combat de la Reine.

**Pièces à produire**

- Lance cadeau si distincte
- attaches pour deux gabarits
- poses de main.

**Animations selon le rôle et les plans**

- Remise sans duplication d’objet
- pose finale de Lex.

**Critères d’acceptation propres à cet élément**

- Relier le prop au plan final avant attribution98
- comparer l’ornementation
- un seul objet passe de main en main
- chronologie après combat.

**Continuité à préserver**

- Ne remplace pas rétroactivement la lance queue099
- ni biomask ni canon offerts.

**Dépendances :** AVP2004-084, AVP2004-030, AVP2004-199, AVP2004-001.

**Raccord à la matrice canon 132 :** `weapon_elder_spear` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S11 — Propstore — Combistick lot17](https://propstoreauction.com/lot-details/index/catalog/359/lot/118654/Lot-17-AVP-ALIEN-VS-PREDATOR-2004-Predator-Combistick) — objet de production. Lance ADI argent/cuivre ; distinguer lance métallique finale et arme organique improvisée de Lex.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-099 — Alien tail spear

**Présence actuelle :** ACTIF. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Lance de queue active après alliance, forme et tenue stylisées.

**Observé dans les sources :** Lance xénomorphe et bouclier de crâne utilisables après l’alliance ; formes corrigées dans le rendu.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-tail-spear.svg`.

**Description historique, non requalifiée à elle seule :** Lance improvisée par Scar à partir de la queue d'un xénomorphe.

**Apparence à relever et comparer**

- Pointe/segment caudal organique
- hampe/ligatures
- prise de Lex
- longueur relative au corps.

**Inconnues explicites**

- Construction hors champ
- dimensions physiques
- variantes de prop.

**Variantes distinctes**

- Fabriquée/remise
- portée
- combat final.

**Propriétaire et rôle :** Lex après remise par Scar.

**Emplacement et phase :** Hunter puis icebattle, jamais avant acquisition.

**Pièces à produire**

- Lance individuelle
- attache main
- état porté/non porté.

**Animations selon le rôle et les plans**

- Remise, idle, marche et attaque déjà permise.

**Critères d’acceptation propres à cet élément**

- Pointe organique distincte du métal Yautja
- mains et sens corrects
- apparition après alliance
- comparaison au même état source.

**Continuité à préserver**

- Ne pas remplacer par la lance de l’Ancien098.

**Dépendances :** AVP2004-100, AVP2004-192, AVP2004-001.

**Raccord à la matrice canon 132 :** `weapon_lex_tail` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-100 — Alien head shield

**Présence actuelle :** ACTIF. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Bouclier actif, mais proportions et prise non certifiées.

**Observé dans les sources :** Bouclier de crâne allongé utilisable de face après l’alliance ; tenue et dégâts restent des choix de gameplay.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-shield.svg`.

**Description historique, non requalifiée à elle seule :** Bouclier improvisé à partir d'une tête xénomorphe, donné à Lex.

**Apparence à relever et comparer**

- Crâne allongé, bord, surface exosquelettique
- prise visible
- orientation devant Lex.

**Inconnues explicites**

- Dos/attaches cachés
- dimensions
- usure exacte.

**Variantes distinctes**

- Remis
- porté
- garde
- combat final.

**Propriétaire et rôle :** Lex, après fabrication/remise par Scar.

**Emplacement et phase :** Hunter/icebattle ; garde selon règles actuelles.

**Pièces à produire**

- Bouclier alpha
- face interne si documentée
- attache main/bras.

**Animations selon le rôle et les plans**

- Remise, garde, marche et réaction à l’impact.

**Critères d’acceptation propres à cet élément**

- Silhouette du prop source
- bras/mains ancrés
- dos inconnu non inventé comme fait
- dégâts restent choix de jeu.

**Continuité à préserver**

- Pas un bouclier métallique ou biomask Yautja.

**Dépendances :** AVP2004-099, AVP2004-192, AVP2004-001.

**Raccord à la matrice canon 132 :** `weapon_lex_shield` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-101 — Heckler & Koch G36C expedition rifle

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

G36C scénique, configurations fusionnées dans film-g36c.

**Observé dans les sources :** Fusil avec poignée supérieure, chargeur et accessoires ; silhouettes armées et râtelier. Pas utilisable par Lex dans cette version.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-g36c.svg`.

**Description historique, non requalifiée à elle seule :** Fusil compact modifié utilisé par l'équipe de sécurité de Weyland.

**Apparence à relever et comparer**

- Fusil court, crosse, chargeur, poignée et canon
- accessoires et porteur du plan.

**Inconnues explicites**

- Sous-modèle
- optique/lampe/câbles
- variante sans accessoires à prouver.

**Variantes distinctes**

- Configuration par porteur attesté
- posé
- porté/visé.

**Propriétaire et rôle :** Sécurité de l’expédition, noms à attribuer par plan.

**Emplacement et phase :** Gear/landing/sacrifice/weapons ; hors inventaire Lex.

**Pièces à produire**

- Fusil
- accessoires si variantes
- attaches deux mains.

**Animations selon le rôle et les plans**

- Portage/visée et tir scénique si attesté.

**Critères d’acceptation propres à cet élément**

- Prop et accessoires conformes aux références
- prise à deux mains
- pas d’arme joueur nouvelle
- variété réelle distinguée du nombre de lignes.

**Continuité à préserver**

- Ne pas substituer un pulse rifle de Marines.

**Dépendances :** AVP2004-102, AVP2004-130, AVP2004-020.

**Raccord à la matrice canon 132 :** `weapon_g36` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S26 — IMFDB — Alien vs. Predator](https://www.imfdb.org/wiki/Alien_vs._Predator) — identification secondaire illustrée. Beretta84FS, Desert Eagle MkVII, G36C modifié, SPSh ; calibres/capacités discutés ne deviennent pas automatiquement gameplay canon.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-102 — Modified G36C with optics and lights

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Configuration accessoirisée fusionnée avec101.

**Observé dans les sources :** Fusil avec poignée supérieure, chargeur et accessoires ; silhouettes armées et râtelier. Pas utilisable par Lex dans cette version.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-g36c.svg`.

**Description historique, non requalifiée à elle seule :** Configuration accessoirisée du fusil de l'expédition.

**Apparence à relever et comparer**

- Modèle/position des accessoires
- supports, hauteur de l’optique et câble
- direction de lumière.

**Inconnues explicites**

- Marques
- nombre de pièces
- lampe versus laser
- porteur.

**Variantes distinctes**

- Configuration attestée
- allumé/éteint
- base différente seulement prouvée.

**Propriétaire et rôle :** Agent du plan, identité à qualifier.

**Emplacement et phase :** Mêmes lieux que101, fenêtres et porteurs à préciser.

**Pièces à produire**

- Optique
- éclairage/laser réel
- support
- fusil base.

**Animations selon le rôle et les plans**

- Suivi rigide de l’arme et activation selon scène.

**Critères d’acceptation propres à cet élément**

- Pas d’accessoire déduit du mot modified
- implantation sourcée
- effet issu du bon module
- variantes comptées si différence réelle.

**Continuité à préserver**

- Pas d’optique moderne non référencée ni d’équipement des Marines.

**Dépendances :** AVP2004-101, AVP2004-130.

**Raccord à la matrice canon 132 :** `weapon_g36` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S26 — IMFDB — Alien vs. Predator](https://www.imfdb.org/wiki/Alien_vs._Predator) — identification secondaire illustrée. Beretta84FS, Desert Eagle MkVII, G36C modifié, SPSh ; calibres/capacités discutés ne deviennent pas automatiquement gameplay canon.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-103 — IMI Desert Eagle Mark VII

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Desert Eagle scénique ; libellé MarkVII et attribution à vérifier.

**Observé dans les sources :** Arme et laser vert représentés. Aucun tir jouable de Miller n’est ajouté par cette passe.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-desert-eagle.svg`.

**Description historique, non requalifiée à elle seule :** Pistolet de gros calibre associé à certains agents de sécurité.

**Apparence à relever et comparer**

- Profil culasse/canon/poignée, pontet, finition et accessoire
- main du porteur.

**Inconnues explicites**

- Sous-modèle
- calibre non inféré
- répartition sécurité/Miller.

**Variantes distinctes**

- Posé
- porté
- abandonné
- laser séparé104.

**Propriétaire et rôle :** Sécurité/Miller selon source.

**Emplacement et phase :** Gear/weapons/cocoonhall ; aucun nouveau tir de Miller implicitement livré.

**Pièces à produire**

- Pistolet
- laser
- prise
- état abandonné.

**Animations selon le rôle et les plans**

- Tenue/pose, chute si scène reconstituée.

**Critères d’acceptation propres à cet élément**

- Sous-modèle étayé
- silhouette comparée
- même objet conservé à l’abandon
- pas d’effet tir sans raccord.

**Continuité à préserver**

- Ne devient pas un pistolet équipable par Lex.

**Dépendances :** AVP2004-104, AVP2004-005, AVP2004-006.

**Raccord à la matrice canon 132 :** `weapon_desert_eagle` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S26 — IMFDB — Alien vs. Predator](https://www.imfdb.org/wiki/Alien_vs._Predator) — identification secondaire illustrée. Beretta84FS, Desert Eagle MkVII, G36C modifié, SPSh ; calibres/capacités discutés ne deviennent pas automatiquement gameplay canon.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-104 — Desert Eagle green laser sight

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Laser vert dessiné avec le pistolet, pas pièce/effet qualifié séparément.

**Observé dans les sources :** Arme et laser vert représentés. Aucun tir jouable de Miller n’est ajouté par cette passe.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-desert-eagle.svg`.

**Description historique, non requalifiée à elle seule :** Module laser vert monté sur le Desert Eagle.

**Apparence à relever et comparer**

- Corps du module, montage et couleur contextualisée
- point/faisceau réellement visible.

**Inconnues explicites**

- Côté du montage
- point versus faisceau
- intensité
- modèle commercial.

**Variantes distinctes**

- Éteint
- allumé
- toujours attaché au bon pistolet.

**Propriétaire et rôle :** Porteur du Desert Eagle, pas viseur Yautja.

**Emplacement et phase :** Scènes de103, pas activation sur toutes les armes humaines.

**Pièces à produire**

- Module
- attache
- point/faisceau séparé.

**Animations selon le rôle et les plans**

- Suivi de visée et allumage attestés.

**Critères d’acceptation propres à cet élément**

- Axe correct
- pas triple point Yautja
- effet occulté par décor
- couleur/forme comparées.

**Continuité à préserver**

- La couleur ne prouve pas un modèle commercial.

**Dépendances :** AVP2004-103.

**Raccord à la matrice canon 132 :** `weapon_desert_eagle` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S26 — IMFDB — Alien vs. Predator](https://www.imfdb.org/wiki/Alien_vs._Predator) — identification secondaire illustrée. Beretta84FS, Desert Eagle MkVII, G36C modifié, SPSh ; calibres/capacités discutés ne deviennent pas automatiquement gameplay canon.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-105 — Beretta 84FS Cheetah

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Beretta exposé sans porteur ni modèle certifiés par gros plan.

**Observé dans les sources :** Arme de poing exposée dans le râtelier. Attribution nominative et gros plans à confirmer.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-beretta.svg`.

**Description historique, non requalifiée à elle seule :** Arme de poing compacte visible dans l'arsenal humain.

**Apparence à relever et comparer**

- Pistolet compact, proportions, finition et pontet du prop lisible.

**Inconnues explicites**

- Modèle84FS
- porteur
- accessoires
- faiblesse de référence secondaire.
- La matrice de recherche attribue un Beretta nickel à Rousseau ; rattacher cette attribution à un plan avant de remplacer la réserve du catalogue.

**Variantes distinctes**

- Prop de table
- tenu si attesté.

**Propriétaire et rôle :** Équipe armée, nom à confirmer.

**Emplacement et phase :** Gear actuellement ; autres lieux à qualifier.

**Pièces à produire**

- Pistolet
- attache si porté.

**Animations selon le rôle et les plans**

- Aucun tir requis pour un prop
- manipulation si scène.

**Critères d’acceptation propres à cet élément**

- Modèle lisible sur référence
- attribution nominative réservée
- objet repose sur la table.

**Continuité à préserver**

- Aucune récompense pistolet pour Lex.

**Dépendances :** AVP2004-020.

**Raccord à la matrice canon 132 :** `weapon_beretta` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S26 — IMFDB — Alien vs. Predator](https://www.imfdb.org/wiki/Alien_vs._Predator) — identification secondaire illustrée. Beretta84FS, Desert Eagle MkVII, G36C modifié, SPSh ; calibres/capacités discutés ne deviennent pas automatiquement gameplay canon.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-106 — SPSh-44 flare pistol

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Lance-fusées scénique ; identification SPSh44 et usage à confirmer.

**Observé dans les sources :** Pistolet de détresse et cartouche représentés ; ne remplace pas le lancer F existant et n’ajoute pas une nouvelle arme jouable.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-flare-pistol.svg`.

**Description historique, non requalifiée à elle seule :** Pistolet lance-fusées utilisé dans l'environnement arctique.

**Apparence à relever et comparer**

- Canon basculant, poignée et finition
- chargement si montré.

**Inconnues explicites**

- Modèle exact
- porteur
- fonctionnement hors champ.

**Variantes distinctes**

- Fermé
- ouvert si attesté
- chargé/déchargé.

**Propriétaire et rôle :** Expédition, propriétaire à attribuer.

**Emplacement et phase :** Gear ; action source distincte du lancer F existant.

**Pièces à produire**

- Pistolet
- charnière
- cartouche107
- attache.

**Animations selon le rôle et les plans**

- Chargement/fermeture/tir seulement si scène nécessaire.

**Critères d’acceptation propres à cet élément**

- Cartouche compatible
- départ aligné
- distinction du lance-piton109
- commande existante inchangée sans nouvelle conception.

**Continuité à préserver**

- Bouvetøya relève du cadre antarctique
- corriger la mention arctique héritée.

**Dépendances :** AVP2004-107, AVP2004-112.

**Raccord à la matrice canon 132 :** `weapon_flare_pistol` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S26 — IMFDB — Alien vs. Predator](https://www.imfdb.org/wiki/Alien_vs._Predator) — identification secondaire illustrée. Beretta84FS, Desert Eagle MkVII, G36C modifié, SPSh ; calibres/capacités discutés ne deviennent pas automatiquement gameplay canon.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-107 — Flare cartridge

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

La cartouche renvoie à l’image du pistolet sans munition individuelle.

**Observé dans les sources :** Pistolet de détresse et cartouche représentés ; ne remplace pas le lancer F existant et n’ajoute pas une nouvelle arme jouable.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-flare-pistol.svg`.

**Description historique, non requalifiée à elle seule :** Munition éclairante du pistolet de détresse.

**Apparence à relever et comparer**

- Forme/culot, échelle au logement et marquages lisibles.

**Inconnues explicites**

- Type, dimensions, couleur et inscription
- cartouche visible ou inférée.

**Variantes distinctes**

- Posée
- chargée
- douille si montrée.

**Propriétaire et rôle :** Expédition, compatible avec106.

**Emplacement et phase :** Gear/scène de chargement ; pas ressource nouvelle par défaut.

**Pièces à produire**

- Cartouche
- logement
- douille si nécessaire.

**Animations selon le rôle et les plans**

- Insertion/retrait/éjection du plan.

**Critères d’acceptation propres à cet élément**

- Échelle de chargement cohérente
- aucun marquage inventé
- simple nécessité mécanique non comptée comme apparition écran.

**Continuité à préserver**

- Ne remplace pas les fusées lancées actuelles.

**Dépendances :** AVP2004-106.

**Raccord à la matrice canon 132 :** `weapon_flare_pistol` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S26 — IMFDB — Alien vs. Predator](https://www.imfdb.org/wiki/Alien_vs._Predator) — identification secondaire illustrée. Beretta84FS, Desert Eagle MkVII, G36C modifié, SPSh ; calibres/capacités discutés ne deviennent pas automatiquement gameplay canon.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-108 — Lex's ice axe

**Présence actuelle :** ACTIF. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Piolet de Lex actif ; modèle et gestuelle stylisés.

**Observé dans les sources :** Piolet utilisable après équipement ; modèle précis et gestuelle stylisés.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-iceaxe.svg`.

**Description historique, non requalifiée à elle seule :** Piolet d'alpinisme utilisé comme outil et arme de fortune.

**Apparence à relever et comparer**

- Courbure du manche, pic/panne, dragonne et couleurs
- fixation au harnais.

**Inconnues explicites**

- Modèle
- côté de prise
- costume recrutement/expédition
- usage outil/arme.

**Variantes distinctes**

- Au harnais
- tenu
- action par phase.

**Propriétaire et rôle :** Lex, outil personnel.

**Emplacement et phase :** Gear/station après équipement ; recrutement distinct.

**Pièces à produire**

- Piolet
- attache harnais
- prise
- pic lisible.

**Animations selon le rôle et les plans**

- Prise/rangement et gestes existants à recaler.

**Critères d’acceptation propres à cet élément**

- Pic orienté par rapport à la main
- changements de sens cohérents
- harnais stable
- portée/collider non changés par l’image.

**Continuité à préserver**

- Piolet distinct du lance-piton109.

**Dépendances :** AVP2004-001, AVP2004-133, AVP2004-187.

**Raccord à la matrice canon 132 :** `prop_ice_axes` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S26 — IMFDB — Alien vs. Predator](https://www.imfdb.org/wiki/Alien_vs._Predator) — identification secondaire illustrée. Beretta84FS, Desert Eagle MkVII, G36C modifié, SPSh ; calibres/capacités discutés ne deviennent pas automatiquement gameplay canon.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-109 — Climbing piton gun

**Présence actuelle :** ACTIF. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Lance-piton final fonctionnel, prop et chargement à référencer.

**Observé dans les sources :** Lance-piton du final avec projectile, ligne et ancrage ; pas un grappin utilisable partout.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-piton.svg`.

**Description historique, non requalifiée à elle seule :** Lance-piton de l'équipe, utilisé contre la Reine lors du combat final.

**Apparence à relever et comparer**

- Corps/poignée/sortie du piton
- ligne/bobine/ancrage
- mains de Lex.

**Inconnues explicites**

- Modèle/dimensions
- points d’attache
- recharge hors champ.

**Variantes distinctes**

- Préparé
- tenu
- tiré
- accroché
- après usage.

**Propriétaire et rôle :** Lex au combat final.

**Emplacement et phase :** Gear/tanks/icebattle ; mécanique limitée aux conditions actuelles.

**Pièces à produire**

- Lanceur
- piton
- câble110
- attache main.

**Animations selon le rôle et les plans**

- Visée/tir/recharge et impact synchronisés.

**Critères d’acceptation propres à cet élément**

- Départ à l’embout
- câble attaché
- impact/état latched concordent
- état conservé en sauvegarde/reprise.

**Continuité à préserver**

- Pas un grappin universel
- fin par chaîne/cuve préservée.

**Dépendances :** AVP2004-110, AVP2004-044, AVP2004-198, AVP2004-209.

**Raccord à la matrice canon 132 :** `prop_rope` (contexte, composant ou variante ; pas une équivalence canon complète) ; `prop_harness` (contexte, composant ou variante ; pas une équivalence canon complète) ; `loc_queen_surface` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S26 — IMFDB — Alien vs. Predator](https://www.imfdb.org/wiki/Alien_vs._Predator) — identification secondaire illustrée. Beretta84FS, Desert Eagle MkVII, G36C modifié, SPSh ; calibres/capacités discutés ne deviennent pas automatiquement gameplay canon.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-110 — Piton cable and anchor

**Présence actuelle :** ACTIF. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Câble/ancrage associés au lanceur, sans pièces de fidélité distinctes.

**Observé dans les sources :** Lance-piton du final avec projectile, ligne et ancrage ; pas un grappin utilisable partout.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-piton.svg`.

**Description historique, non requalifiée à elle seule :** Câble et ancrage associés au lance-piton.

**Apparence à relever et comparer**

- Trajet de ligne et ses deux extrémités
- fixation
- matériau et épaisseur relative.

**Inconnues explicites**

- Longueur physique
- trajet hors cadre
- distinction câble/chaîne.

**Variantes distinctes**

- Libre
- tirée
- tendue
- attachée
- rompue si attestée.

**Propriétaire et rôle :** Lex, points d’ancrage du final.

**Emplacement et phase :** Tanks/icebattle et mécanisme existant.

**Pièces à produire**

- Câble
- piton
- ancrage
- chaîne séparée si autre pièce.

**Animations selon le rôle et les plans**

- Déploiement et tension, suivi des extrémités.

**Critères d’acceptation propres à cet élément**

- Extrémités sur objets réels
- pas de traversée incohérente du corps
- reprise exacte
- couplage final observé.

**Continuité à préserver**

- Ne pas confondre câble du piton et chaîne qui entraîne la Reine.

**Dépendances :** AVP2004-109, AVP2004-162, AVP2004-209.

**Raccord à la matrice canon 132 :** `prop_rope` (contexte, composant ou variante ; pas une équivalence canon complète) ; `prop_water_tank` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S26 — IMFDB — Alien vs. Predator](https://www.imfdb.org/wiki/Alien_vs._Predator) — identification secondaire illustrée. Beretta84FS, Desert Eagle MkVII, G36C modifié, SPSh ; calibres/capacités discutés ne deviennent pas automatiquement gameplay canon.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-111 — Expedition combat knife

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Le couteau humain utilise la dague Yautja086.

**Observé dans les sources :** Couteau utilitaire présenté dans le matériel ; ce n’est pas un nouveau mode de combat au couteau.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-dagger.svg`.

**Description historique, non requalifiée à elle seule :** Couteau utilitaire porté par les agents de sécurité.

**Apparence à relever et comparer**

- Lame/manche/fourreau du couteau humain attesté
- portage du personnage.

**Inconnues explicites**

- Modèle, porteur, variantes, silhouette trop petite.

**Variantes distinctes**

- Rangé
- tenu si montré
- table comme adaptation explicitée.

**Propriétaire et rôle :** Sécurité humaine, porteur à attribuer.

**Emplacement et phase :** Gear, pas nouveau mode de combat pour Lex.

**Pièces à produire**

- Couteau distinct
- fourreau
- attache ceinture/main.

**Animations selon le rôle et les plans**

- Manipulation attestée seulement.

**Critères d’acceptation propres à cet élément**

- Image distincte de086
- provenance humaine
- support/main cohérent
- aucune décoration Yautja ajoutée.

**Continuité à préserver**

- Les lames du film ne sont pas interchangeables.

**Dépendances :** AVP2004-086, AVP2004-130.

**Raccord à la matrice canon 132 :** aucun équivalent qualifié ; aucun identifiant inventé.

**Sources et portée**

- [S26 — IMFDB — Alien vs. Predator](https://www.imfdb.org/wiki/Alien_vs._Predator) — identification secondaire illustrée. Beretta84FS, Desert Eagle MkVII, G36C modifié, SPSh ; calibres/capacités discutés ne deviennent pas automatiquement gameplay canon.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-112 — Improvised torch / flare

**Présence actuelle :** ACTIF. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Fusées de diversion actives ; torche/fusée regroupe des objets potentiellement différents.

**Observé dans les sources :** Fusées lancées pour la diversion ; toutes les variantes de torches du film ne sont pas reproduites.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-flare.svg`.

**Description historique, non requalifiée à elle seule :** Source lumineuse utilisée comme moyen de défense dans la pyramide.

**Apparence à relever et comparer**

- Type exact de bâton/torche/fusée
- extrémité brûlante, flamme et prise.

**Inconnues explicites**

- Commerciale versus improvisée
- manche
- couleur sous éclairage.

**Variantes distinctes**

- Éteinte
- tenue allumée
- lancée
- au sol
- consommée.

**Propriétaire et rôle :** Lex pour la diversion, autres porteurs à identifier.

**Emplacement et phase :** Gear/nursery ; trajectoire F et ressources préservées.

**Pièces à produire**

- Objet par variante prouvée
- lumière séparée
- traces utiles.

**Animations selon le rôle et les plans**

- Allumage/lancer/chute/extinction.

**Critères d’acceptation propres à cet élément**

- Torche et cartouche distinctes
- flamme attachée au bon bout
- collisions reprises
- lumière contrôlée.

**Continuité à préserver**

- Les variantes ne deviennent pas toutes des armes autonomes de Lex.

**Dépendances :** AVP2004-151, AVP2004-106, AVP2004-107.

**Raccord à la matrice canon 132 :** `prop_flare` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S26 — IMFDB — Alien vs. Predator](https://www.imfdb.org/wiki/Alien_vs._Predator) — identification secondaire illustrée. Beretta84FS, Desert Eagle MkVII, G36C modifié, SPSh ; calibres/capacités discutés ne deviennent pas automatiquement gameplay canon.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

## Props

### AVP2004-075 — Elder biomask

**Présence actuelle :** A_VERIFIER. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Le biomask de l’Ancien est incertain ; elder reste démasqué.

**Observé dans les sources :** Une pièce ADI décrite par Propstore est un casque de Scar redécoré pour exposition. Cela ne prouve pas son port à l’écran ; l’Ancien est ici sans masque.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Masque porté par l'Ancien Yautja.

**Apparence à relever et comparer**

- Objet de production attribué
- différences éventuelles avec Scar
- état du costume dans le plan final.

**Inconnues explicites**

- Port écran non établi
- accessoire redécoré/exposé versus costume filmique
- faces cachées.

**Variantes distinctes**

- Pièce de production documentée
- état écran non masqué conservé.

**Propriétaire et rôle :** Ancien final, pas Lex.

**Emplacement et phase :** Aucun masque ajouté à elder sans preuve de port.

**Pièces à produire**

- Dossier de provenance
- candidat séparé d’exposition si pertinent.

**Animations selon le rôle et les plans**

- Aucun retrait/port de masque animé sans plan.

**Critères d’acceptation propres à cet élément**

- Provenance de l’objet et usage écran sont deux champs
- scène finale inchangée
- ressemblance Scar n’est pas preuve de biomask Elder canon.

**Continuité à préserver**

- Ne pas déduire une variante écran d’un accessoire de présentation.

**Dépendances :** AVP2004-030, AVP2004-072.

**Raccord à la matrice canon 132 :** `char_elder` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S09 — HeroProp — Elder ceremonial mask](https://heroprop.com/product/alien-vs-predator-predator-ceremonial-mask/) — objet attribué à la production. Masque doré à détails argentés et ouverture de bouche ; affectation exacte à vérifier dans la finale.
- [S05 — Propstore — Scar bio-mask lot833](https://propstore.com/product/avp-alien-vs-predator-2004/lot-833-scars-ian-whyte-predator-bio-mask/) — objet de production. Masque argenté, visière quadrillée, détails latéraux ; dimensions d’accessoire uniquement.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-076 — Ancient Predator biomask

**Présence actuelle :** A_VERIFIER. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Les biomasks anciens ne sont pas reconstruits.

**Observé dans les sources :** Masques du flashback non reconstruits. Ne pas les assimiler aux trois jeunes chasseurs.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Masques des chasseurs du flashback antique.

**Apparence à relever et comparer**

- Contour frontal/profil de chaque modèle du flashback
- orifices et reliefs
- attache au costume.

**Inconnues explicites**

- Nombre de modèles
- faces cachées
- masque portable versus motif mural.

**Variantes distinctes**

- Un identifiant par masque visible distinct
- dommage si attesté.

**Propriétaire et rôle :** Chasseur ancien identifié par plan.

**Emplacement et phase :** Flashback, pas coffre des chasseurs contemporains.

**Pièces à produire**

- PNG individuel
- attache tête
- correspondance porteur.

**Animations selon le rôle et les plans**

- Suivi de tête
- retrait seulement si montré.

**Critères d’acceptation propres à cet élément**

- Source par modèle
- absence de copie moderne non justifiée
- échelle relative tête/masque
- statue distincte d’un acteur.

**Continuité à préserver**

- Ne pas classer une sculpture comme équipement portable.

**Dépendances :** AVP2004-031, AVP2004-032, AVP2004-201.

**Raccord à la matrice canon 132 :** `char_historic_predators` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S30 — AVP Galaxy — Concept Art](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/concept-art/) — reproduction de conception. Concepts armes/lieux/engins/vaisseau ; inclut des intentions abandonnées.
- [S31 — AVP Galaxy — Storyboards](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/storyboards/) — reproduction de préparation. Cadrage et trajectoires préparatoires ; pas preuve du montage final ni de sa géométrie.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-089 — Cloaking device

**Présence actuelle :** DOCUMENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Le camouflage est documenté, sans simulation de l’effet depuis Lex.

**Observé dans les sources :** Camouflage, vision thermique et vision xénomorphe restent documentés, non simulés dans le point de vue de Lex.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/scar.svg`.

**Description historique, non requalifiée à elle seule :** Camouflage optique personnel des chasseurs.

**Apparence à relever et comparer**

- Distorsion du fond, contour et transition2004
- résidus lumineux
- silhouette camouflée.

**Inconnues explicites**

- Amplitude/durée non mesurées
- fonctionnement hors champ
- pouvoir de perception distinct du rendu.

**Variantes distinctes**

- Visible
- transition
- camouflé
- réapparition.

**Propriétaire et rôle :** Chasseur effectivement montré camouflé.

**Emplacement et phase :** Scène/acteur qualifié ; pas commande de camouflage pour Lex.

**Pièces à produire**

- Masque d’acteur
- distorsion du fond réel
- transitions.

**Animations selon le rôle et les plans**

- Activation/désactivation avec collisions d’acteur conservées.

**Critères d’acceptation propres à cet élément**

- Fond réellement déformé
- alpha seul non présenté comme effet fidèle
- perception et apparence séparées
- reprise stable.

**Continuité à préserver**

- Aucun nouveau pouvoir offert à Lex.

**Dépendances :** AVP2004-027, AVP2004-028, AVP2004-029.

**Raccord à la matrice canon 132 :** `char_scar` (contexte, composant ou variante ; pas une équivalence canon complète) ; `char_celtic` (contexte, composant ou variante ; pas une équivalence canon complète) ; `char_chopper` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S02 — MPC — Alien Vs Predator](https://www.mpcvfx.com/en/filmography/alien-vs-predator/) — fabricant VFX. Créatures, reine, vaisseau et environnements ; modèles numériques associés aux effets pratiques.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-090 — Thermal vision mode

**Présence actuelle :** DOCUMENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

La vision thermique n’est pas une vue simulée ; scar ne la représente pas.

**Observé dans les sources :** Camouflage, vision thermique et vision xénomorphe restent documentés, non simulés dans le point de vue de Lex.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/scar.svg`.

**Description historique, non requalifiée à elle seule :** Mode de vision thermique vu à travers le biomask.

**Apparence à relever et comparer**

- Palette et contraste du plan subjectif2004
- traitement chaud/froid
- interface réellement visible.

**Inconnues explicites**

- Symboles/palette exacte
- valeurs de température
- cadence non relevées.

**Variantes distinctes**

- Vue normale
- thermique
- transition attestée.

**Propriétaire et rôle :** Point de vue Yautja identifié.

**Emplacement et phase :** Interlude subjectif distinct de la caméra habituelle de Lex.

**Pièces à produire**

- Couches de traitement thermique
- masques
- interface sourcée.

**Animations selon le rôle et les plans**

- Visée/transition montrées, sans HUD inventé.

**Critères d’acceptation propres à cet élément**

- Comparaison au plan2004
- attribution chaud/froid fondée sur la scène
- aucun texte technique fabriqué
- flashes/accessibilité contrôlés.

**Continuité à préserver**

- Ne pas donner un biomask à Lex pour justifier la vue.

**Dépendances :** AVP2004-072, AVP2004-091, AVP2004-079.

**Raccord à la matrice canon 132 :** `char_scar` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S02 — MPC — Alien Vs Predator](https://www.mpcvfx.com/en/filmography/alien-vs-predator/) — fabricant VFX. Créatures, reine, vaisseau et environnements ; modèles numériques associés aux effets pratiques.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-091 — Alien vision mode

**Présence actuelle :** DOCUMENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Le mode anti-xénomorphe est documentaire, sans rendu dédié.

**Observé dans les sources :** Camouflage, vision thermique et vision xénomorphe restent documentés, non simulés dans le point de vue de Lex.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/scar.svg`.

**Description historique, non requalifiée à elle seule :** Filtre de vision adapté à la détection des xénomorphes.

**Apparence à relever et comparer**

- Codage de cible, fond/contours et interface dans le plan
- différence observable avec le thermique.

**Inconnues explicites**

- Couleurs/symboles
- détection hors champ
- version d’œuvre.

**Variantes distinctes**

- Vue de référence
- cible acquise/perdue si attestée.

**Propriétaire et rôle :** Vision du chasseur, pas yeux du xénomorphe.

**Emplacement et phase :** Scène subjective séparée du regard de Lex.

**Pièces à produire**

- Filtre/couches
- silhouettes de cible
- interface référencée.

**Animations selon le rôle et les plans**

- Acquisition et perte selon scène.

**Critères d’acceptation propres à cet élément**

- Ne pas confondre vision Alien et mode Yautja
- palette comparée
- pas d’extension silencieuse de l’IA/ciblage.

**Continuité à préserver**

- Aucun mode importé d’AVPR ou des jeux sans source2004.

**Dépendances :** AVP2004-090, AVP2004-077, AVP2004-079.

**Raccord à la matrice canon 132 :** `char_scar` (contexte, composant ou variante ; pas une équivalence canon complète) ; `creature_warrior` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S02 — MPC — Alien Vs Predator](https://www.mpcvfx.com/en/filmography/alien-vs-predator/) — fabricant VFX. Créatures, reine, vaisseau et environnements ; modèles numériques associés aux effets pratiques.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-092 — Predator medical kit

**Présence actuelle :** A_VERIFIER. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Le kit médical Yautja n’est pas prouvé dans le périmètre2004.

**Observé dans les sources :** Kit, fluide bleu et agrafeuse : présence dans AVP 2004 à contrôler sur une image précise ; ne pas importer automatiquement des autres films Predator/AVPR.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Kit permettant à Scar de traiter ses brûlures acides.

**Apparence à relever et comparer**

- Boîtier, fermeture, compartiments et outils si un plan les montre
- emplacement sur costume.

**Inconnues explicites**

- Œuvre/personnage d’origine
- absence possible du montage
- contenu non visible.

**Variantes distinctes**

- Fermé/ouvert seulement après preuve
- dossier autre œuvre sinon.

**Propriétaire et rôle :** Propriétaire à qualifier.

**Emplacement et phase :** Aucune scène de soin ou room ajoutée tant que référence non résolue.

**Pièces à produire**

- D’abord source
- puis boîtier et outils attestés.

**Animations selon le rôle et les plans**

- Ouverture/manipulation seulement si montrées dans2004.

**Critères d’acceptation propres à cet élément**

- Plan du bon film
- aucun mélange d’outils d’autres épisodes
- sans preuve conserver A_VERIFIER.

**Continuité à préserver**

- Ne pas faire soigner Scar avec le kit de Wolf ou Predator2.

**Dépendances :** AVP2004-093, AVP2004-094, AVP2004-035.

**Raccord à la matrice canon 132 :** aucun équivalent qualifié ; aucun identifiant inventé.

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-093 — Blue medical fluid / coagulant

**Présence actuelle :** A_VERIFIER. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Le fluide bleu/coagulant reste non qualifié.

**Observé dans les sources :** Kit, fluide bleu et agrafeuse : présence dans AVP 2004 à contrôler sur une image précise ; ne pas importer automatiquement des autres films Predator/AVPR.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Substance bleue utilisée dans le traitement de Scar.

**Apparence à relever et comparer**

- Contenant, couleur contextualisée et état physique
- application réellement visible.

**Inconnues explicites**

- Existence dans2004
- fonction chimique
- couleur sous éclairage.

**Variantes distinctes**

- Contenant fermé
- produit visible si attesté.

**Propriétaire et rôle :** Propriétaire à qualifier avec le kit.

**Emplacement et phase :** Aucun placement ou soin ajouté par défaut.

**Pièces à produire**

- Contenant
- effet visuel séparé si applicable.

**Animations selon le rôle et les plans**

- Écoulement/application du plan, pas mécanique de guérison implicite.

**Critères d’acceptation propres à cet élément**

- Référence du bon film
- nom descriptif tant que fonction inconnue
- couleur n’est pas preuve chimique.

**Continuité à préserver**

- Ne pas traiter tout fluide bleu de franchise comme coagulant de Scar.

**Dépendances :** AVP2004-092, AVP2004-094.

**Raccord à la matrice canon 132 :** aucun équivalent qualifié ; aucun identifiant inventé.

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-094 — Medical stapler / surgical tool

**Présence actuelle :** A_VERIFIER. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Agrafeuse/outil chirurgical non prouvé pour2004.

**Observé dans les sources :** Kit, fluide bleu et agrafeuse : présence dans AVP 2004 à contrôler sur une image précise ; ne pas importer automatiquement des autres films Predator/AVPR.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Instrument de fermeture des blessures du kit Yautja.

**Apparence à relever et comparer**

- Mâchoires, prise et mécanisme si attestés
- relation au contenant.

**Inconnues explicites**

- Œuvre/porteur/usage
- géométrie cachée
- action de suture éventuellement absente.

**Variantes distinctes**

- Repos
- utilisation seulement avec plan.

**Propriétaire et rôle :** Propriétaire réservé.

**Emplacement et phase :** Pas d’opération de soin de Scar ajoutée sans preuve.

**Pièces à produire**

- Outil
- attache main
- effet de contact si nécessaire.

**Animations selon le rôle et les plans**

- Mouvement mécanique du plan, pas ciseaux génériques.

**Critères d’acceptation propres à cet élément**

- Provenance2004
- fonction distinguée des autres accessoires
- aucun détail chirurgical inventé comme fait.

**Continuité à préserver**

- Ne pas importer un outil de Wolf/AVPR ou Predator2.

**Dépendances :** AVP2004-092, AVP2004-093.

**Raccord à la matrice canon 132 :** aucun équivalent qualifié ; aucun identifiant inventé.

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-095 — Ritual marking knife

**Présence actuelle :** A_VERIFIER. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Le couteau de marquage est une désignation à résoudre, possiblement un fragment xénomorphe.

**Observé dans les sources :** Fonction précise à confronter à un plan : ne pas confondre un fragment de doigt xénomorphe et une arme rituelle.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Lame utilisée pour marquer la peau avec le sang acide.

**Apparence à relever et comparer**

- Objet au contact, prise et trace
- nature organique ou métallique
- côté du geste.

**Inconnues explicites**

- Lame versus doigt/fragment
- détail hors champ
- trajet exact.

**Variantes distinctes**

- Avant contact
- contact
- marque après geste.

**Propriétaire et rôle :** Scar, puis scène de marque de Lex selon plan.

**Emplacement et phase :** Marquage, pas nouvelle arme du râtelier.

**Pièces à produire**

- Objet correctement identifié
- couche de marque
- attache main.

**Animations selon le rôle et les plans**

- Geste bref et ordre avant/après.

**Critères d’acceptation propres à cet élément**

- Nature de l’objet démontrée
- forme/côté de la marque comparés
- pas confusion avec cicatrice du filet.

**Continuité à préserver**

- Ne pas remplacer un fragment de doigt par une dague parce que le geste est rituel.

**Dépendances :** AVP2004-036, AVP2004-193, AVP2004-215, AVP2004-086.

**Raccord à la matrice canon 132 :** `char_scar` (contexte, composant ou variante ; pas une équivalence canon complète) ; `char_lex` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S04 — Propstore — Scar costume 69075](https://propstore.com/product/avp-alien-vs-predator-2004/scar-predator-ian-whyte-creature-costume/) — costume de production. Équipement ADI ; épines faciales retirées après tournage pour AVPR. Ne pas reproduire cette altération de conservation.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-118 — Drill-head assembly

**Présence actuelle :** A_VERIFIER. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

La tête de forage est un alias generator, sans pièce indépendante identifiée.

**Observé dans les sources :** Correction : le tunnel est déjà ouvert à l’arrivée ; le matériel humain ne le creuse pas. Désignation « foreuse thermique » et assemblage précis du catalogue à vérifier.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/generator.svg`.

**Description historique, non requalifiée à elle seule :** Tête de forage thermique descendant à travers la glace.

**Apparence à relever et comparer**

- Terminal de la machine réellement visible
- attaches et matériau.

**Inconnues explicites**

- Existence/fonction
- silhouette
- dimension
- pièce seulement supposée par le mot foreuse.

**Variantes distinctes**

- Attachée
- séparée si montrée.

**Propriétaire et rôle :** Machine de Quinn si confirmée.

**Emplacement et phase :** Station/bore suivant la source.

**Pièces à produire**

- Tête
- montage
- protection uniquement visible.

**Animations selon le rôle et les plans**

- Rotation/mouvement seulement s’il est montré.

**Critères d’acceptation propres à cet élément**

- Pièce identifiée
- attache compatible avec machine
- ne pas compter une pièce indépendante si pas représentée.

**Continuité à préserver**

- Ne pas convertir le générateur en forage de science-fiction inventé.

**Dépendances :** AVP2004-117, AVP2004-146.

**Raccord à la matrice canon 132 :** `loc_tunnel_mouth` (contexte, composant ou variante ; pas une équivalence canon complète) ; `char_quinn` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-123 — Pyramid elevator / rotating transport chamber

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Ascenseur/chambre rotative renvoie à film-egg-rail ; fonctions différentes regroupées.

**Observé dans les sources :** Transport d’œufs visible ; le catalogue fusionne peut-être plusieurs mécanismes. Pas d’ascenseur libre certifié.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-egg-rail.svg`.

**Description historique, non requalifiée à elle seule :** Mécanisme mobile interne transportant personnages et œufs.

**Apparence à relever et comparer**

- Limites de chambre, blocs, rails, axe et accès du mécanisme montré.

**Inconnues explicites**

- Ascenseur indépendant ou blocs mobiles ?
- géométrie
- confusion convoyeur d’œufs.

**Variantes distinctes**

- Mécanisme attesté
- positions
- rails156 séparés.

**Propriétaire et rôle :** Pyramide.

**Emplacement et phase :** Pivot/eggworks ; aucune liaison verticale nouvelle sans preuve et recette.

**Pièces à produire**

- Pièces mobiles
- supports
- ouvertures attachées aux murs.

**Animations selon le rôle et les plans**

- Déplacement source ou adaptation étiquetée
- collision synchronisée.

**Critères d’acceptation propres à cet élément**

- Source par fonction
- rail non rebaptisé ascenseur
- arrivée dégagée
- aller-retour
- bloc ne se ferme pas sur les acteurs.

**Continuité à préserver**

- Aucune porte au milieu d’une pièce pour représenter un ascenseur.

**Dépendances :** AVP2004-156, AVP2004-207, AVP2004-208.

**Raccord à la matrice canon 132 :** `loc_moving_maze` (contexte, composant ou variante ; pas une équivalence canon complète) ; `prop_egg_transport` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S33 — John Lee — Senior model maker, Alien vs Predator](https://www.johnleemodelmaker.me/avp.aspx) — fabricant primaire. Photos satellite, navire miniature15pieds et machineReine1/3 ; plusieurs stades de fabrication, détails finaux à contrôler.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S31 — AVP Galaxy — Storyboards](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/storyboards/) — reproduction de préparation. Cadrage et trajectoires préparatoires ; pas preuve du montage final ni de sa géométrie.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-124 — Alien Queen rising platform

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Hoist de la Reine simplifié ; chaînes, volume et élévation à qualifier.

**Observé dans les sources :** Palan et plateforme de captivité visibles ; levage complet et géométrie exacte non reproduits.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-queen-hoist.svg`.

**Description historique, non requalifiée à elle seule :** Plateforme mécanique maintenant puis libérant la Reine.

**Apparence à relever et comparer**

- Plateforme/support, entretoises et ancrages
- ovipositeur
- architecture de chambre.

**Inconnues explicites**

- Dimensions
- points cachés
- course
- nombre de chaînes.

**Variantes distinctes**

- Entravée
- montée
- libération
- support vide.

**Propriétaire et rôle :** Mécanisme de la Reine, aucun vaisseau.

**Emplacement et phase :** Queenhold ; ovipositeur avant bombe et libération conservés.

**Pièces à produire**

- Support
- chaînes
- attaches corps/architecture
- masques d’occlusion.

**Animations selon le rôle et les plans**

- Montée/oscillation/rupture montrées
- support distinct du corps.

**Critères d’acceptation propres à cet élément**

- Deux extrémités ancrées pour chaque chaîne
- échelle comparée
- libération modifie les attaches
- adaptation explicitée si mesure absente.

**Continuité à préserver**

- Ne pas classer comme vaisseau ancien121.

**Dépendances :** AVP2004-044, AVP2004-062, AVP2004-063, AVP2004-196.

**Raccord à la matrice canon 132 :** `prop_queen_restraints` (référence d’objet ou d’identité correspondante ; qualification propre encore requise) ; `loc_queen_chamber` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S16 — studioADI — Tests1/3 Scale Puppet Queen](https://www.youtube.com/watch?v=BC_2vNVpZBQ) — fabricant effets. Reine et ovipositeur de la chambre de ponte ; échelle de la maquette explicitée.
- [S17 — studioADI — Building The Mini Queen BTS](https://www.youtube.com/watch?v=D3jkx-HSxsk) — fabricant effets. Construction, variantes et sac de ponte ; le plan final prime sur le test.
- [S33 — John Lee — Senior model maker, Alien vs Predator](https://www.johnleemodelmaker.me/avp.aspx) — fabricant primaire. Photos satellite, navire miniature15pieds et machineReine1/3 ; plusieurs stades de fabrication, détails finaux à contrôler.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-132 — Handheld flashlight

**Présence actuelle :** DOCUMENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

La lampe exacte est documentaire ; l’éclairage général ne constitue pas cet objet.

**Observé dans les sources :** Éclairage général conservé, mais lampe de poche exacte non identifiée comme objet autonome. Non comptée comme nouvelle lampe physique.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Lampe portative utilisée dans les galeries.

**Apparence à relever et comparer**

- Corps, tête, poignée/fixation et porteur
- couleur du faisceau contextualisée.

**Inconnues explicites**

- Lampe tenue versus frontale
- modèle
- scènes et variantes.

**Variantes distinctes**

- Éteinte
- allumée
- tenue/posée si montré.

**Propriétaire et rôle :** Porteur humain identifié.

**Emplacement et phase :** Scène source, sans dupliquer la frontale131.

**Pièces à produire**

- Lampe
- attache main/support
- cône séparé.

**Animations selon le rôle et les plans**

- Allumage/manipulation
- commande L préservée tant que mécanique inchangée.

**Critères d’acceptation propres à cet élément**

- Objet identifiable
- main et faisceau alignés
- aucune pièce flottante
- lampe physique distincte de lumière de scène.

**Continuité à préserver**

- Ne pas compter un cône lumineux seul comme nouvel asset matériel.

**Dépendances :** AVP2004-131, AVP2004-163.

**Raccord à la matrice canon 132 :** `prop_lights` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-144 — Body camera / helmet camera

**Présence actuelle :** DOCUMENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Les caméras portatives ne prouvent pas une bodycam/helmetcam.

**Observé dans les sources :** Caméra portée à contrôler sur le costume ; les caméras exposées sur la table sont portatives et ne suffisent pas à valider une bodycam.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Caméra de terrain portée pendant l'exploration.

**Apparence à relever et comparer**

- Module réellement fixé, support, câble et orientation optique.

**Inconnues explicites**

- Caméra versus lampe/radio
- porteur
- fixation
- présence réelle.

**Variantes distinctes**

- Montée
- retirée uniquement si attestée.

**Propriétaire et rôle :** Personnage identifié, pas toutes les tenues.

**Emplacement et phase :** Costume et chapitre du porteur confirmé.

**Pièces à produire**

- Module
- support
- variante de costume
- vue enregistrée si nécessaire.

**Animations selon le rôle et les plans**

- Suivi corps/tête
- aucun pouvoir de surveillance ajouté.

**Critères d’acceptation propres à cet élément**

- Module identifié comme caméra
- optique orientée correctement
- pièce portée attestée séparément de143.

**Continuité à préserver**

- Pas de bodycam moderne générique pour combler le doute.

**Dépendances :** AVP2004-143, AVP2004-131, AVP2004-141.

**Raccord à la matrice canon 132 :** `char_expedition_extras` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-146 — Thermal drill control console

**Présence actuelle :** A_VERIFIER. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Console de forage remplacée par un générateur générique.

**Observé dans les sources :** Correction : le tunnel est déjà ouvert à l’arrivée ; le matériel humain ne le creuse pas. Désignation « foreuse thermique » et assemblage précis du catalogue à vérifier.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/generator.svg`.

**Description historique, non requalifiée à elle seule :** Interface de la foreuse.

**Apparence à relever et comparer**

- Pupitre, boutons/écran/câbles du matériel montré
- position opérateur.

**Inconnues explicites**

- Fonction/modèle
- texte affiché
- lien à machine117.

**Variantes distinctes**

- Repos
- affichage
- fonctionnement attesté.

**Propriétaire et rôle :** Équipe de Quinn si confirmée.

**Emplacement et phase :** Station/bore auprès de la machine, hors du passage.

**Pièces à produire**

- Console
- support
- câbles
- écran référencé.

**Animations selon le rôle et les plans**

- Action opérateur et signalisation du plan.

**Critères d’acceptation propres à cet élément**

- Console et machine de la même référence
- pas d’écran inventé présenté comme canon
- collision au pied et interaction accessible.

**Continuité à préserver**

- N’est pas à l’origine du tunnel préexistant.

**Dépendances :** AVP2004-117, AVP2004-118, AVP2004-017.

**Raccord à la matrice canon 132 :** `loc_tunnel_mouth` (contexte, composant ou variante ; pas une équivalence canon complète) ; `char_quinn` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-147 — Drill operator protective gear

**Présence actuelle :** A_VERIFIER. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Quinn a une silhouette, mais sa protection de travail n’est pas qualifiée.

**Observé dans les sources :** Silhouette de Quinn ajoutée. Modèle précis de la tenue de forage non certifié.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Équipement de protection des foreurs.

**Apparence à relever et comparer**

- Coupe et volumes des vêtements
- protections tête/mains/pieds
- harnais et outils visibles.

**Inconnues explicites**

- Marques/attaches/matières
- changement de tenue station/tunnel.

**Variantes distinctes**

- Tenue station
- tenue travail si distincte.

**Propriétaire et rôle :** Quinn ; assistant séparé si identifié.

**Emplacement et phase :** Station/bore et fenêtres existantes.

**Pièces à produire**

- Pièces propres
- accessoires attachés
- variantes justifiées.

**Animations selon le rôle et les plans**

- Travail/descente/marche compatibles avec les couches.

**Critères d’acceptation propres à cet élément**

- Costume de Quinn, pas ouvrier générique
- identité conservée
- états station/tunnel cohérents.

**Continuité à préserver**

- Une tenue supplémentaire n’est pas un personnage supplémentaire.

**Dépendances :** AVP2004-008, AVP2004-017, AVP2004-213.

**Raccord à la matrice canon 132 :** `char_quinn` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-164 — Expedition food and ration packs

**Présence actuelle :** DOCUMENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Rations citées sans paquet identifié.

**Observé dans les sources :** Rations citées dans le catalogue ; aucun sachet précisément identifié et indépendant n’est ajouté à cette livraison.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Rations transportées par l'équipe.

**Apparence à relever et comparer**

- Conditionnement montré, taille relative main/boîte et marquages lisibles.

**Inconnues explicites**

- Présence, marque, type de ration, contenu hors champ.

**Variantes distinctes**

- Fermé
- ouvert si montré.

**Propriétaire et rôle :** Expédition ou équipage selon scène.

**Emplacement et phase :** Repas/stockage attesté, pas consommable de survie automatique.

**Pièces à produire**

- Paquet individuel
- contenu visible
- support de rangement.

**Animations selon le rôle et les plans**

- Manipulation scénique
- pas de faim inventée.

**Critères d’acceptation propres à cet élément**

- Paquet sourcé
- logo non halluciné
- objet et mécanique de consommation séparés.

**Continuité à préserver**

- Ne pas importer une ration de Marines coloniaux.

**Dépendances :** AVP2004-020, AVP2004-246.

**Raccord à la matrice canon 132 :** `char_expedition_extras` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

## Véhicules

### AVP2004-114 — Weyland expedition helicopter

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

L’hélicoptère SVG est simplifié aux deux extrémités du transport.

**Observé dans les sources :** Hélicoptère visible aux points d’embarquement ; liaison de transport, pas porte entre le navire et la banquise.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-helicopter.svg`.

**Description historique, non requalifiée à elle seule :** Hélicoptère utilisé pour acheminer l'équipe vers la zone de fouille.

**Apparence à relever et comparer**

- Fuselage/queue, rotors, train, portes/hublots et livrée du modèle montré.

**Inconnues explicites**

- Sous-modèle
- immatriculation
- intérieur
- nombre d’appareils.

**Variantes distinctes**

- Embarquement
- posé
- vol si scène produite
- rotor selon état.

**Propriétaire et rôle :** Transport de l’expédition, pilote à identifier.

**Emplacement et phase :** Maru↔landing, trajet abrégé et réciproque.

**Pièces à produire**

- Profil individuel
- rotors
- porte si animée
- ombre.

**Animations selon le rôle et les plans**

- Rotors, embarquement/sortie selon besoin, sans conduite libre.

**Critères d’acceptation propres à cet élément**

- Même appareil aux deux points
- porte/sol compatibles
- rotors hors des personnes
- mode mouvement réduit conserve l’accès lisible.

**Continuité à préserver**

- Aucune porte architecturale directe entre navire et île.

**Dépendances :** AVP2004-113, AVP2004-212.

**Raccord à la matrice canon 132 :** `vehicle_helicopter` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-115 — Snowcat tracked vehicle

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Le Snowcat SVG ne représente pas la miniature de production avec détail suffisant.

**Observé dans les sources :** Chenillé représenté sur la neige ; pas de conduite libre.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-snowcat.svg`.

**Description historique, non requalifiée à elle seule :** Véhicule chenillé pour les déplacements sur la glace.

**Apparence à relever et comparer**

- PistenBully Weyland : chenilles, cabine, plateau, lame, antenne et balises orange
- decals de miniature à rapprocher du film.

**Inconnues explicites**

- Modèle et marquages exacts au plan
- face cachée
- nombre/disposition des galets
- chargement.

**Variantes distinctes**

- Stationné
- convoi/départ si attestés
- cargaison distincte.

**Propriétaire et rôle :** Expédition.

**Emplacement et phase :** Landing, actuellement x520,y77 ; passages vers station/hélicoptère dégagés.

**Pièces à produire**

- Profil individuel
- chenilles/galets si animation
- cargaison/phares référencés.

**Animations selon le rôle et les plans**

- Prop statique ou roulement pour une scène justifiée.

**Critères d’acceptation propres à cet élément**

- Identité par source primaire
- rapport cabine/plateau comparé
- chenilles/feux corrects
- alpha/contact au sol
- collision changée seulement après recette.

**Continuité à préserver**

- Pas Snowcat générique ou motoneige de remplacement
- candidat textuel ne certifie pas la miniature.

**Dépendances :** AVP2004-116, AVP2004-168, AVP2004-170.

**Raccord à la matrice canon 132 :** `vehicle_snowcat` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S13 — Propstore — Weyland Antarctic snowcat lot460](https://propstoreauction.com/lot-details/index/catalog/496/lot/192510/460-Light-Up-Weyland-Antarctic-Snowcat-Model-Miniature-AVP-ALIEN-VS-PREDATOR-2004) — miniature de production. PistenBully, lame, antenne, feux orange, inscriptions WI-PBOO3-A/AJ-2 ; ne pas convertir dimensions de vitrine en dimensions du véhicule.

**Candidat lié à cette fiche :** `assets/openai/sprites/avp2004-production-v001/snowcat-avp2004-v001.png` ; génération `text-only`, SHA-256 `6c7b3b7840660de29c8a71c7324d71b116964cceadc704719cdd37fd949bad94`.

Chenilles, cabine, plateau, lame et feux présents. Rapport cabine/plateau, nombre de feux/galets et livrée restent à corriger par photo ; inscriptions non dessinées volontairement. Pas de véhicule pilotable livré.

Ce candidat ne modifie ni la présence historique du catalogue ni le runtime.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-116 — Expedition snowmobiles

**Présence actuelle :** A_VERIFIER. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Motoneiges ni présentes ni identifiées avec certitude.

**Observé dans les sources :** Motoneiges : variante exacte et présence dans le montage à confirmer avant de prétendre une intégration fidèle.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Motoneiges et petits véhicules arctiques de soutien.

**Apparence à relever et comparer**

- Appareil visible dans le bon montage
- skis/chenille/carénage et livrée.

**Inconnues explicites**

- Présence effective
- modèle/nombre
- confusion Snowcat/traîneau.

**Variantes distinctes**

- Stationnée
- transport seulement si montré.

**Propriétaire et rôle :** Expédition si confirmée.

**Emplacement et phase :** Landing/station uniquement après référence.

**Pièces à produire**

- Véhicule individuel du modèle exact
- cargaison si nécessaire.

**Animations selon le rôle et les plans**

- Déplacement seulement dans la scène justifiée.

**Critères d’acceptation propres à cet élément**

- Plan montrant une motoneige autonome
- silhouette distincte du Snowcat
- pas double comptage d’une remorque.

**Continuité à préserver**

- Un environnement enneigé ne prouve pas la présence de motoneiges.

**Dépendances :** AVP2004-115, AVP2004-168.

**Raccord à la matrice canon 132 :** `vehicle_additional_transport` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-117 — Thermal drill rig

**Présence actuelle :** A_VERIFIER. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

La foreuse humaine pointe vers generator ; sa nature n’est pas qualifiée.

**Observé dans les sources :** Correction : le tunnel est déjà ouvert à l’arrivée ; le matériel humain ne le creuse pas. Désignation « foreuse thermique » et assemblage précis du catalogue à vérifier.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/generator.svg`.

**Description historique, non requalifiée à elle seule :** Foreuse verticale construisant le tunnel jusqu'à la pyramide.

**Apparence à relever et comparer**

- Machine réellement installée près de Quinn
- châssis/câbles/poste
- relation au bord du puits.

**Inconnues explicites**

- Dénomination foreuse thermique
- fonction exacte
- origine du tunnel.

**Variantes distinctes**

- Machine identifiée
- fonctionnement montré.

**Propriétaire et rôle :** Équipe de Quinn, fonction à préciser.

**Emplacement et phase :** Station/bore, tunnel préexistant conservé.

**Pièces à produire**

- Machine distincte du générateur
- supports
- câbles
- emprise au sol.

**Animations selon le rôle et les plans**

- Action attestée, pas forage complet du tunnel sans preuve.

**Critères d’acceptation propres à cet élément**

- Machine humaine distinguée du tunnel
- silhouette source
- aucun modèle inventé
- passage libre.

**Continuité à préserver**

- L’expédition trouve le tunnel déjà ouvert.

**Dépendances :** AVP2004-008, AVP2004-017, AVP2004-118, AVP2004-146.

**Raccord à la matrice canon 132 :** `loc_tunnel_mouth` (contexte, composant ou variante ; pas une équivalence canon complète) ; `char_quinn` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

## Vaisseaux

### AVP2004-113 — Piper Maru icebreaker

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Le Piper Maru est un lieu, sans sprite autonome de coque dans les145SVG.

**Observé dans les sources :** Pont et passerelle accessibles. Coque entière, cabines et navigation maritime non reconstruits.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Navire brise-glace transportant l'expédition à Bouvetøya.

**Apparence à relever et comparer**

- Coque, superstructure, ponts, fenêtres et équipements du navire filmé
- livrée lisible
- miniature John Lee.

**Inconnues explicites**

- Proue/poupe hors plan
- détails masqués
- dimensions physiques
- différences miniature/décor.

**Variantes distinctes**

- Profil référencé
- pont/passerelle séparés
- situation dans glace/mer.

**Propriétaire et rôle :** Navire et équipage, distincts des passagers.

**Emplacement et phase :** Maru/bridge ; liaison vers landing en hélicoptère.

**Pièces à produire**

- Coque individuelle
- superstructure
- accès
- mer/glace séparées.

**Animations selon le rôle et les plans**

- Mouvement scénique ou fond fixe
- hélicoptère distinct.

**Critères d’acceptation propres à cet élément**

- Profil comparé au navire/miniature
- pont à échelle cohérente
- accès dans la façade
- inscriptions lisibles sourcées
- candidat généré contrôlé avant admission.

**Continuité à préserver**

- Aucune navigation maritime libre livrée par la silhouette.

**Dépendances :** AVP2004-018, AVP2004-019, AVP2004-114, AVP2004-210, AVP2004-211.

**Raccord à la matrice canon 132 :** `ship_piper_maru` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S33 — John Lee — Senior model maker, Alien vs Predator](https://www.johnleemodelmaker.me/avp.aspx) — fabricant primaire. Photos satellite, navire miniature15pieds et machineReine1/3 ; plusieurs stades de fabrication, détails finaux à contrôler.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.
- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.

**Candidat lié à cette fiche :** `assets/openai/sprites/avp2004-production-v001/piper-maru-avp2004-v001.png` ; génération `image-conditioned`, SHA-256 `af035524b7d63ef535c84a490edc72dea780a5116cd73b46baca5831a7d5079c`.

Coque entière, ouverture et rampe reliées au navire. La projection de profil, les fenêtres et détails peu visibles dans le plan nocturne sont des reconstructions. Comparer à la miniature John Lee avant admission. Marge de tête faible autour du mât.

Ce candidat ne modifie ni la présence historique du catalogue ni le runtime.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-119 — Predator mothership

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Le vaisseau est représenté par architecture/scène Canvas, sans coque autonome qualifiée.

**Observé dans les sources :** Silhouette lointaine du vaisseau au jugement. Coque et intérieur complets non reconstruits.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Grand vaisseau Yautja arrivant au-dessus de la zone.

**Apparence à relever et comparer**

- Silhouette2004, volumes, ouvertures et lumières
- accès de récupération
- surface.

**Inconnues explicites**

- Dimensions
- faces cachées
- plan complet
- appareil122 séparé ou même engin.

**Variantes distinctes**

- Extérieur final
- entrée
- intérieur184 distinct
- plan orbital si attesté.

**Propriétaire et rôle :** Chasseurs contemporains et équipage33.

**Emplacement et phase :** Elder puis vessel épilogue, non navigable.

**Pièces à produire**

- Coque
- ouverture
- plans d’occlusion
- intérieur distinct.

**Animations selon le rôle et les plans**

- Apparition/départ et porte d’après le plan.

**Critères d’acceptation propres à cet élément**

- Source de coque2004
- intérieur/extérieur compatibles
- entrée à échelle du portage de Scar
- pas de doublon sous122.

**Continuité à préserver**

- Ne pas importer vaisseau AVPR/Predator2 ou inventer planète d’origine
- S35 est piste secondaire seulement.

**Dépendances :** AVP2004-033, AVP2004-122, AVP2004-184, AVP2004-200.

**Raccord à la matrice canon 132 :** `ship_mothership` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S02 — MPC — Alien Vs Predator](https://www.mpcvfx.com/en/filmography/alien-vs-predator/) — fabricant VFX. Créatures, reine, vaisseau et environnements ; modèles numériques associés aux effets pratiques.
- [S30 — AVP Galaxy — Concept Art](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/concept-art/) — reproduction de conception. Concepts armes/lieux/engins/vaisseau ; inclut des intentions abandonnées.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.
- [S35 — AVP Central — Predator Spaceships](https://www.avpcentral.com/predator-spaceships) — compilation fan multi-œuvres. Image légendée Mothership from Alien vs.Predator ; texte mélange films2004/2007 et jeu2010. Ne certifie pas provenance du frame/yautja-empire.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-120 — Predator drop pods / entry capsules

**Présence actuelle :** SCENE. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Capsules d’entrée en SVG, attribution/transition incomplètes.

**Observé dans les sources :** Capsule représentée après l’arrivée des chasseurs ; descente atmosphérique non animée.

**Asset actuel :** `scripts/dlc/avp-2004/web/assets/film-drop-pod.svg`.

**Description historique, non requalifiée à elle seule :** Capsules utilisées par les jeunes chasseurs pour rejoindre la surface.

**Apparence à relever et comparer**

- Coque, ouverture et attaches des capsules identifiées
- rapport aux chasseurs.

**Inconnues explicites**

- Nombre/dimensions
- intérieur
- arrivée au sol versus plan orbital.

**Variantes distinctes**

- Fermée
- ouverte
- posée selon plans.

**Propriétaire et rôle :** Chasseurs du trio2004.

**Emplacement et phase :** Landing aprèschapitre7 dans la source, phase à confronter au récit.

**Pièces à produire**

- Capsule individuelle
- ouverture
- arrivée séparée.

**Animations selon le rôle et les plans**

- Descente/ouverture si attestées.

**Critères d’acceptation propres à cet élément**

- Objet réellement identifié
- nombre/porteurs documentés
- pas d’obstacle ajouté au passage
- scène distincte d’un véhicule utilisable.

**Continuité à préserver**

- Pas de déplacement joueur en capsule implicite.

**Dépendances :** AVP2004-027, AVP2004-028, AVP2004-029, AVP2004-119.

**Raccord à la matrice canon 132 :** `ship_pods` (référence d’objet ou d’identité correspondante ; qualification propre encore requise).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S30 — AVP Galaxy — Concept Art](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/concept-art/) — reproduction de conception. Concepts armes/lieux/engins/vaisseau ; inclut des intentions abandonnées.
- [S31 — AVP Galaxy — Storyboards](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/storyboards/) — reproduction de préparation. Cadrage et trajectoires préparatoires ; pas preuve du montage final ni de sa géométrie.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-121 — Predator ancient spacecraft

**Présence actuelle :** ABSENT. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Le vaisseau ancien du flashback est absent.

**Observé dans les sources :** Vaisseau du flashback ancien non reconstruit. Ce n’est pas la plateforme de la Reine (ID 124).

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Vaisseau représenté dans le flashback historique.

**Apparence à relever et comparer**

- Silhouette dans le plan ancien
- cadrage et matière
- échelle relative à architecture/chasseurs.

**Inconnues explicites**

- Même appareil que le moderne ?
- faces cachées
- dimensions physiques.

**Variantes distinctes**

- Plan du flashback
- silhouette individuelle
- aucun intérieur sans source.

**Propriétaire et rôle :** Chasseurs anciens.

**Emplacement et phase :** Flashback, pas nouvelle destination à pied depuis elder/vessel.

**Pièces à produire**

- Vaisseau ou silhouette de scène
- couche de perspective.

**Animations selon le rôle et les plans**

- Mouvement/lumières montrés.

**Critères d’acceptation propres à cet élément**

- Référence ancienne identifiée
- différence moderne explicitée
- aucune plateforme de Reine prise pour un appareil.

**Continuité à préserver**

- Ne pas confondre avec124, plateforme de la Reine.

**Dépendances :** AVP2004-031, AVP2004-032, AVP2004-201, AVP2004-119.

**Raccord à la matrice canon 132 :** `loc_historical_city` (contexte, composant ou variante ; pas une équivalence canon complète) ; `ship_mothership` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S30 — AVP Galaxy — Concept Art](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/concept-art/) — reproduction de conception. Concepts armes/lieux/engins/vaisseau ; inclut des intentions abandonnées.
- [S31 — AVP Galaxy — Storyboards](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/storyboards/) — reproduction de préparation. Cadrage et trajectoires préparatoires ; pas preuve du montage final ni de sa géométrie.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-122 — Predator ceremonial recovery craft

**Présence actuelle :** A_VERIFIER. **Qualification :** réservé — forme et usage à qualifier par source primaire et plan, état exact non certifié.

Un véhicule de récupération distinct du mothership n’est pas établi.

**Observé dans les sources :** Véhicule de récupération distinct du vaisseau principal : identité autonome non établie. Ne pas inventer un appareil supplémentaire.

**Asset actuel :** aucun identifiant d’image autonome affecté à cette fiche dans le catalogue.

**Description historique, non requalifiée à elle seule :** Partie du vaisseau utilisée lors de la récupération de Scar.

**Apparence à relever et comparer**

- Séquence complète de récupération
- silhouette et accès
- raccord des plans.

**Inconnues explicites**

- Second appareil ou angles du même ?
- modèle et nom non confirmés.

**Variantes distinctes**

- Un seul appareil tant que distinction non prouvée
- état du même vaisseau le cas échéant.

**Propriétaire et rôle :** Chasseurs finaux.

**Emplacement et phase :** Elder/vessel ; aucun engin supplémentaire par défaut.

**Pièces à produire**

- Dossier d’identité avant un nouveau PNG.

**Animations selon le rôle et les plans**

- Accès/retrait après résolution.

**Critères d’acceptation propres à cet élément**

- Les raccords démontrent une autonomie avant nouvelid
- sinon renvoi119
- dimensions non mesurées.

**Continuité à préserver**

- Ne pas gonfler l’inventaire avec deux vues du même objet.

**Dépendances :** AVP2004-119, AVP2004-184, AVP2004-033.

**Raccord à la matrice canon 132 :** `ship_mothership` (contexte, composant ou variante ; pas une équivalence canon complète).

**Sources et portée**

- [S24 — AVP Galaxy — From Script to Screen](https://www.avpgalaxy.net/avp-movies/avp-movie/from-script-to-screen/) — analyse secondaire. Variantes de noms, scènes, prologue et roman ; garder montage/source associés à chaque entrée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

## Terrain

### AVP2004-BIBLE-TERRAIN-STONE — Pierre architecturale

**Présence actuelle :** MATERIAU_GAMEPLAY. **Qualification :** adaptation de gameplay connue ; référence de surface à établir.

Matériau de gameplay présent ; surface filmique, texture et métrique non qualifiées 1:1.

**Apparence à relever et comparer**

- Modules de pierre, joints et usure
- motifs et direction de lumière propres à chaque plan.

**Inconnues explicites**

- Mur et sol ne sont pas la même texture
- dimensions des dalles non mesurées
- glyphes à qualifier.

**Variantes distinctes**

- Dalles sèches
- plaques mobiles distinctes.

**Propriétaire et rôle :** Environnement ; paramètres de simulation distincts de l’apparence.

**Emplacement et phase :** 

**Pièces à produire**

- Textures ou modules individuels propres aux lieux référencés
- Bords et transitions selon les surfaces

**Animations selon le rôle et les plans**

- Effets de contact/surface seulement si nécessaires et justifiés

**Critères d’acceptation propres à cet élément**

- Joints continus aux raccords
- plaque mobile et collision concordent
- motif généré jamais présenté comme traduction authentifiée.

**Continuité à préserver**

- Les valeurs de bruit et vitesse sont des choix de jeu, pas des mesures physiques du film.
- Préserver les ouvertures, lignes de passage et supports ; aucune porte de décoration sans destination.

**Dépendances :** .

**Raccord à la matrice canon 132 :** `terrain_stone` (surface ou contexte ; ne prouve pas chaque texture du runtime).

**Sources et portée**

- [S19 — Propstore — Seven Antarctic Pyramid Tiles](https://propstore.com/product/avp-alien-vs-predator-2004/set-of-seven-antarctic-pyramid-tiles/) — décor de production. Motifs de dalles attestés ; ne démontre pas plan complet du labyrinthe.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-BIBLE-TERRAIN-METAL — Métal du navire, machines et passerelles

**Présence actuelle :** MATERIAU_GAMEPLAY. **Qualification :** adaptation de gameplay connue ; référence de surface à établir.

Matériau de gameplay présent ; surface filmique, texture et métrique non qualifiées 1:1.

**Apparence à relever et comparer**

- Tôle, grille et poutre propres au lieu
- oxydation, peinture et rainures.

**Inconnues explicites**

- Métal maritime et mécanismes antiques distincts
- épaisseur physique inconnue.

**Variantes distinctes**

- Métal du navire
- structures de pyramide
- matériel humain selon source.

**Propriétaire et rôle :** Environnement ; paramètres de simulation distincts de l’apparence.

**Emplacement et phase :** maru, station, workshop, engine, sacrifice, weapons, weights, pivot, gantry, icebattle

**Pièces à produire**

- Textures ou modules individuels propres aux lieux référencés
- Bords et transitions selon les surfaces

**Animations selon le rôle et les plans**

- Effets de contact/surface seulement si nécessaires et justifiés

**Critères d’acceptation propres à cet élément**

- Échelle cohérente sous les pieds
- grilles avec support
- bruit du jeu reste une paramétrisation.

**Continuité à préserver**

- Les valeurs de bruit et vitesse sont des choix de jeu, pas des mesures physiques du film.
- Préserver les ouvertures, lignes de passage et supports ; aucune porte de décoration sans destination.

**Dépendances :** ground-01, ground-03, ground-05, ground-06, ground-10, ground-12, ground-13, ground-14, ground-22, ground-24.

**Raccord à la matrice canon 132 :** `ship_piper_maru` (surface ou contexte ; ne prouve pas chaque texture du runtime) ; `prop_whaling_equipment` (surface ou contexte ; ne prouve pas chaque texture du runtime).

**Sources et portée**

- [S33 — John Lee — Senior model maker, Alien vs Predator](https://www.johnleemodelmaker.me/avp.aspx) — fabricant primaire. Photos satellite, navire miniature15pieds et machineReine1/3 ; plusieurs stades de fabrication, détails finaux à contrôler.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-BIBLE-TERRAIN-WATER — Eau de sol et zones humides

**Présence actuelle :** MATERIAU_GAMEPLAY. **Qualification :** adaptation de gameplay connue ; référence de surface à établir.

Matériau de gameplay présent ; surface filmique, texture et métrique non qualifiées 1:1.

**Apparence à relever et comparer**

- Surface, profondeur apparente, reflets et contact aux dalles du plan.

**Inconnues explicites**

- Eau peu profonde du gameplay distincte de la mer finale
- profondeur non mesurée.

**Variantes distinctes**

- Sol humide
- flaque/eau peu profonde
- mer comme scène distincte.

**Propriétaire et rôle :** Environnement ; paramètres de simulation distincts de l’apparence.

**Emplacement et phase :** cellar, incubator, drain

**Pièces à produire**

- Textures ou modules individuels propres aux lieux référencés
- Bords et transitions selon les surfaces

**Animations selon le rôle et les plans**

- Effets de contact/surface seulement si nécessaires et justifiés

**Critères d’acceptation propres à cet élément**

- Limites eau/sol lisibles
- traversabilité conforme à collision
- aucun reflet ou profondeur inventés comme mesure du film.

**Continuité à préserver**

- Les valeurs de bruit et vitesse sont des choix de jeu, pas des mesures physiques du film.
- Préserver les ouvertures, lignes de passage et supports ; aucune porte de décoration sans destination.

**Dépendances :** ground-07, ground-21, ground-23.

**Raccord à la matrice canon 132 :** `terrain_sea` (surface ou contexte ; ne prouve pas chaque texture du runtime).

**Sources et portée**

- [S02 — MPC — Alien Vs Predator](https://www.mpcvfx.com/en/filmography/alien-vs-predator/) — fabricant VFX. Créatures, reine, vaisseau et environnements ; modèles numériques associés aux effets pratiques.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-BIBLE-TERRAIN-SHARDS — Gravats et fragments

**Présence actuelle :** MATERIAU_GAMEPLAY. **Qualification :** adaptation de gameplay connue ; référence de surface à établir.

Matériau de gameplay présent ; surface filmique, texture et métrique non qualifiées 1:1.

**Apparence à relever et comparer**

- Origine du fragment, taille relative, densité et implantation.

**Inconnues explicites**

- Shards ne prouve pas une texture unique
- pierre/glace/métal à distinguer
- empreintes non mesurées.

**Variantes distinctes**

- Petits fragments
- blocs structurels séparés
- débris après événement attesté.

**Propriétaire et rôle :** Environnement ; paramètres de simulation distincts de l’apparence.

**Emplacement et phase :** bore, forecourt, sacrifice, press, duel, glyphs, hunter

**Pièces à produire**

- Textures ou modules individuels propres aux lieux référencés
- Bords et transitions selon les surfaces

**Animations selon le rôle et les plans**

- Effets de contact/surface seulement si nécessaires et justifiés

**Critères d’acceptation propres à cet élément**

- Rien ne bloque une interaction
- grands blocs ont leur emprise
- pas de fragments flottants
- texture et silhouette concordent.

**Continuité à préserver**

- Les valeurs de bruit et vitesse sont des choix de jeu, pas des mesures physiques du film.
- Préserver les ouvertures, lignes de passage et supports ; aucune porte de décoration sans destination.

**Dépendances :** ground-08, ground-09, ground-11, ground-15, ground-16, ground-17, ground-18.

**Raccord à la matrice canon 132 :** `terrain_rubble` (surface ou contexte ; ne prouve pas chaque texture du runtime).

**Sources et portée**

- [S02 — MPC — Alien Vs Predator](https://www.mpcvfx.com/en/filmography/alien-vs-predator/) — fabricant VFX. Créatures, reine, vaisseau et environnements ; modèles numériques associés aux effets pratiques.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-BIBLE-TERRAIN-RESIN — Résine de ruche

**Présence actuelle :** MATERIAU_GAMEPLAY. **Qualification :** adaptation de gameplay connue ; référence de surface à établir.

Matériau de gameplay présent ; surface filmique, texture et métrique non qualifiées 1:1.

**Apparence à relever et comparer**

- Filaments, couches, brillance et attaches aux murs/cocons.

**Inconnues explicites**

- Épaisseur et motifs hors champ
- résine distincte du sang acide.

**Variantes distinctes**

- Sol résineux
- mur
- cocon attaché comme objet séparé.

**Propriétaire et rôle :** Environnement ; paramètres de simulation distincts de l’apparence.

**Emplacement et phase :** service, nursery

**Pièces à produire**

- Textures ou modules individuels propres aux lieux référencés
- Bords et transitions selon les surfaces

**Animations selon le rôle et les plans**

- Effets de contact/surface seulement si nécessaires et justifiés

**Critères d’acceptation propres à cet élément**

- Surface ancrée
- passage lisible
- cocons/trous gardent leur profondeur
- texture ne valide pas un ennemi.

**Continuité à préserver**

- Les valeurs de bruit et vitesse sont des choix de jeu, pas des mesures physiques du film.
- Préserver les ouvertures, lignes de passage et supports ; aucune porte de décoration sans destination.

**Dépendances :** ground-19, ground-20.

**Raccord à la matrice canon 132 :** `terrain_resin` (surface ou contexte ; ne prouve pas chaque texture du runtime) ; `prop_cocoons` (surface ou contexte ; ne prouve pas chaque texture du runtime).

**Sources et portée**

- [S14 — Propstore — Xenomorph Alien Egg](https://propstore.com/product/avp-alien-vs-predator-2004/xenomorph-alien-egg/) — objet de production. Œuf AVP ; trous de manipulation et vieillissement ne sont pas des détails diégétiques.
- [S16 — studioADI — Tests1/3 Scale Puppet Queen](https://www.youtube.com/watch?v=BC_2vNVpZBQ) — fabricant effets. Reine et ovipositeur de la chambre de ponte ; échelle de la maquette explicitée.
- [S34 — AVP Galaxy — Official Production Stills](https://www.avpgalaxy.net/avp-movies/avp-movie/gallery/production-stills/) — republication de photos de production. Portraits/personnages2004 identifiés ; les légendes restent à recouper pour secondaires.

**État de nouvelle production :** spécification rédigée ; aucun nouveau fichier individuel confirmé dans le manifeste de ce lot.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

### AVP2004-BIBLE-TERRAIN-SNOW — Neige et glace de Bouvetøya

**Présence actuelle :** MATERIAU_GAMEPLAY. **Qualification :** adaptation de gameplay connue ; référence de surface à établir.

Matériau de gameplay présent ; surface filmique, texture et métrique non qualifiées 1:1.

**Apparence à relever et comparer**

- Grain, accumulation, traces, glace exposée et relief
- contact aux bâtiments.

**Inconnues explicites**

- Matériau snow de gameplay ne certifie pas la glace
- pente/météo/distances non mesurées.

**Variantes distinctes**

- Neige compacte
- poudreuse
- glace nue référencée séparément.

**Propriétaire et rôle :** Environnement ; paramètres de simulation distincts de l’apparence.

**Emplacement et phase :** landing, station

**Pièces à produire**

- Textures ou modules individuels propres aux lieux référencés
- Bords et transitions selon les surfaces

**Animations selon le rôle et les plans**

- Effets de contact/surface seulement si nécessaires et justifiés

**Critères d’acceptation propres à cet élément**

- Raccords sans répétition flagrante
- props au sol
- traces sous les pieds
- tunnel/falaise structurellement cohérents sans cotes inventées.

**Continuité à préserver**

- Les valeurs de bruit et vitesse sont des choix de jeu, pas des mesures physiques du film.
- Préserver les ouvertures, lignes de passage et supports ; aucune porte de décoration sans destination.

**Dépendances :** ground-02, ground-04.

**Raccord à la matrice canon 132 :** `terrain_snow` (surface ou contexte ; ne prouve pas chaque texture du runtime) ; `terrain_glacier` (surface ou contexte ; ne prouve pas chaque texture du runtime) ; `terrain_tunnel_ice` (surface ou contexte ; ne prouve pas chaque texture du runtime) ; `terrain_cavern_ice` (surface ou contexte ; ne prouve pas chaque texture du runtime).

**Sources et portée**

- [S02 — MPC — Alien Vs Predator](https://www.mpcvfx.com/en/filmography/alien-vs-predator/) — fabricant VFX. Créatures, reine, vaisseau et environnements ; modèles numériques associés aux effets pratiques.
- [S22 — Norwegian Polar Institute — Bouvetøya](https://npolar.no/en/themes/bouvetoya/) — autorité géographique. Île volcanique/glaciaire de l’océan Austral, au nord de60°S ; hors Antarctique strict, différence avec le vocabulaire du film.

**Candidat lié à cette fiche :** `assets/openai/sprites/avp2004-production-v001/glacier-face-avp2004-v001.png` ; génération `text-only`, SHA-256 `86af606156957fd985e67a2d578fa881844deb4fd129acb219752385296a8704`.

Module de matière et de silhouette original. Raccords non testés, répétition non garantie, aucun collider défini. Ne reproduit pas une paroi mesurée du film.

Module de glacier original ; il ne remplace pas les six matériaux du moteur.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

## Planète

### AVP2004-BIBLE-PLANET-EARTH — Terre — cadre géographique

**Présence actuelle :** DOSSIER_ABSENT. **Qualification :** cadre Terre documentable ; reconstruction planétaire1:1 non obtenue.

Aucune fiche planète ni asset planétaire autonome dans le registre 250.

**Apparence à relever et comparer**

- Terre comme cadre des lieux humains ; vue orbitale uniquement selon les plans du montage.
- Bouvetøya et lieux de recrutement/surveillance documentés séparément.

**Inconnues explicites**

- Échelle et carte complète du film non mesurées.
- Planète d’origine Yautja non établie.
- Coordonnées fictionnelles, éclairage orbital et routes de voyage à ne pas inventer.
- Localisation héritée Italie versus proposition Teotihuacan à résoudre par source.

**Variantes distinctes**

- Fiche géographique
- Image orbitale si référencée
- Carte de continuité narrative sans métrique inventée

**Propriétaire et rôle :** Cadre planétaire ; aucun inventaire ni véhicule de Lex.

**Emplacement et phase :** Introduction/transition attestées ; pas de système de voyage interplanétaire.

**Pièces à produire**

- Fiche Terre sourcée
- Image individuelle si utile à un plan
- Carte des lieux avec transports maritime/aérien/narratif explicites

**Animations selon le rôle et les plans**

- Transition orbitale du plan seulement

**Critères d’acceptation propres à cet élément**

- Bouvetøya n’est ni une planète ni un lieu arctique.
- Lieux et versions séparément sourcés.
- Géographie générale distincte de l’implantation originale de la pyramide.
- Aucune planète Yautja, LV-426 ou LV-223 ajoutée sans référence de ce périmètre.

**Continuité à préserver**

- Le vaisseau final ne prouve pas une destination nommée.
- Ne pas fusionner les autres continuités ou Tantalus2204 au récit2004.

**Dépendances :** AVP2004-168, AVP2004-187, AVP2004-186, AVP2004-113, AVP2004-119.

**Raccord à la matrice canon 132 :** `planet_earth` (cadre planétaire, pas carte géographique certifiée).

**Sources et portée**

- [S22 — Norwegian Polar Institute — Bouvetøya](https://npolar.no/en/themes/bouvetoya/) — autorité géographique. Île volcanique/glaciaire de l’océan Austral, au nord de60°S ; hors Antarctique strict, différence avec le vocabulaire du film.
- [S23 — Smithsonian Global Volcanism Program — Bouvet](https://volcano.si.edu/volcano.cfm?vn=386020) — autorité géologique. Complément terrain réel ; ne certifie aucun décor fictionnel.
- [NASA_EARTH — NASA — The Blue Marble](https://science.nasa.gov/resource/the-blue-marble/) — référence naturelle primaire. Aucune photo NASA fournie à la génération ; aucune géographie générée certifiée.

**Candidat lié à cette fiche :** `assets/openai/sprites/avp2004-production-v001/earth-avp2004-v001.png` ; génération `text-only`, SHA-256 `0f63616322aa67e9a8c0366857622128f00a92917399807250fa1e63edb75b3b`.

Afrique, Atlantique et calotte australe reconnaissables. Aucun relevé des côtes, nuages, orientation ou éclairage du plan AVP ; cette image ne sert pas de carte de navigation ni de géographie certifiée.

Ce candidat ne modifie ni la présence historique du catalogue ni le runtime.

**Mesures :** dimensions physiques non mesurées ; proportions, pivot et attaches à relever sur la référence. **Raccord :** non activé et non observé en jeu pour cette nouvelle production.

## Annexe — 44 lieux

Les largeurs sont des unités du jeu ; les niveaux sont relatifs. Les 23 lieux/fonctions adaptés et les 21 annexes originales ne constituent pas un relevé métrique du film.

| ID | Lieu | Qualification | Niveau | Largeur de jeu | Accès |
| --- | --- | --- | --- | --- | --- |
| maru | Piper Maru · Pont | Lieu / fonction du film, dimensions adaptées | 0 | 1800 | brief, gear, landing, bridge |
| brief | Salle des cartes | Raccord ou annexe de gameplay original | 0 | 1300 | maru |
| gear | Local d’expédition | Raccord ou annexe de gameplay original | 0 | 1300 | maru |
| landing | Bouvetøya · Zone d’arrivée | Lieu / fonction du film, dimensions adaptées | 0 | 1900 | maru, station |
| station | Station baleinière · Rue centrale | Lieu / fonction du film, dimensions adaptées | 0 | 2400 | landing, office, workshop, infirmary, bore, tanks, engine |
| office | Bureau du contremaître | Raccord ou annexe de gameplay original | 0 | 1350 | station, tower, dormitory |
| workshop | Atelier des baleiniers | Raccord ou annexe de gameplay original | 0 | 1600 | station, mess, cellar |
| bore | Tunnel thermique | Lieu / fonction du film, dimensions adaptées | -1 | 2000 | station, forecourt |
| forecourt | Pyramide · Parvis enfoui | Lieu / fonction du film, dimensions adaptées | -2 | 2300 | bore, vestibule |
| vestibule | Vestibule des trois peuples | Raccord ou annexe de gameplay original | -2 | 1650 | forecourt, sacrifice, pivot, balcony |
| sacrifice | Chambre des sacrifices | Lieu / fonction du film, dimensions adaptées | -2 | 1900 | vestibule, ossuary |
| ossuary | Ossuaire | Lieu / fonction du film, dimensions adaptées | -2 | 1450 | sacrifice, weapons |
| weapons | Chambre des armes | Lieu / fonction du film, dimensions adaptées | -2 | 1750 | ossuary, pivot |
| pivot | Croisée mobile | Lieu / fonction du film, dimensions adaptées | -3 | 2050 | weapons, press, vestibule, weights, shaft |
| press | Couloir de l’étau | Lieu / fonction du film, dimensions adaptées | -3 | 1750 | pivot, duel, weights |
| duel | Salle du filet | Lieu / fonction du film, dimensions adaptées | -3 | 2200 | press, glyphs, cloister |
| glyphs | Galerie du rite | Lieu / fonction du film, dimensions adaptées | -3 | 1800 | duel, refuge, hunter, astrarium |
| refuge | Dernier abri | Raccord ou annexe de gameplay original | -3 | 1400 | glyphs, trophies, balcony |
| hunter | Hall du chasseur | Lieu / fonction du film, dimensions adaptées | -3 | 1950 | glyphs, service |
| service | Passage sous les dalles | Raccord ou annexe de gameplay original | -4 | 1600 | hunter, nursery, incubator |
| nursery | Nurserie | Lieu / fonction du film, dimensions adaptées | -4 | 2150 | service, queenhold, trophies, incubator, gantry, cocoonhall |
| queenhold | Chambre de la Reine | Lieu / fonction du film, dimensions adaptées | -4 | 2300 | nursery, gantry |
| tanks | Cuves de la station | Lieu / fonction du film, dimensions adaptées | 0 | 1900 | station, icebattle |
| icebattle | Bord de la banquise | Lieu / fonction du film, dimensions adaptées | 0 | 2300 | tanks, elder |
| elder | Le jugement des chasseurs | Lieu / fonction du film, dimensions adaptées | 0 | 1700 | icebattle |
| vessel | Vaisseau · Épilogue | Lieu / fonction du film, dimensions adaptées | 0 | 1600 | Épilogue sans porte |
| infirmary | Infirmerie de la station | Raccord ou annexe de gameplay original | 0 | 1200 | station |
| trophies | Galerie des trophées | Raccord ou annexe de gameplay original | -3 | 1550 | refuge, nursery |
| engine | Station · Salle des machines | Raccord ou annexe de gameplay original | 0 | 1750 | station, cellar |
| tower | Station · Tour radio | Raccord ou annexe de gameplay original | 1 | 1400 | office |
| weights | Salle des contrepoids | Raccord ou annexe de gameplay original | -2 | 2100 | pivot, press, cloister |
| astrarium | Chambre des cycles | Raccord ou annexe de gameplay original | -2 | 1650 | glyphs |
| incubator | Conduite d’incubation | Raccord ou annexe de gameplay original | -3 | 1850 | service, nursery, drain, eggworks |
| gantry | Passerelle des entraves | Raccord ou annexe de gameplay original | -3 | 2050 | nursery, queenhold, drain |
| dormitory | Station · Dortoir des baleiniers | Raccord ou annexe de gameplay original | 1 | 1650 | office, mess |
| mess | Station · Réfectoire | Raccord ou annexe de gameplay original | 1 | 1750 | dormitory, workshop |
| cellar | Station · Cave des réserves | Raccord ou annexe de gameplay original | -1 | 1800 | engine, workshop |
| balcony | Pyramide · Balcon des bâtisseurs | Raccord ou annexe de gameplay original | -2 | 1850 | refuge, vestibule |
| drain | Pyramide · Drain de la citerne | Raccord ou annexe de gameplay original | -3 | 1850 | incubator, gantry |
| cloister | Pyramide · Galerie des niches | Raccord ou annexe de gameplay original | -2 | 2050 | weights, duel |
| bridge | Piper Maru · Passerelle | Lieu / fonction du film, dimensions adaptées | 0 | 1900 | maru |
| shaft | Pyramide · Puits central | Lieu / fonction du film, dimensions adaptées | -3 | 2200 | pivot |
| eggworks | Pyramide · Distribution des œufs | Lieu / fonction du film, dimensions adaptées | -3 | 2100 | incubator |
| cocoonhall | Pyramide · Salle des cocons | Lieu / fonction du film, dimensions adaptées | -4 | 1950 | nursery |

## Annexe — 52 liaisons réciproques

L’audit statique a été exécuté avant l’interruption de l’environnement, sur b0df1877 : fonction blocked réelle, rayon 15, grille 8, zéro erreur observée. Il ne teste pas les dalles mobiles, les phases complètes, les priorités d’interaction ni un parcours navigateur. Les accès du navire restent un transport, les liens extérieurs des chemins et les transitions du puits des cordes.

| Liaison | Face aller : x/y, type, ancre | Face retour : x/y, type, ancre | Delta | Conditions |
| --- | --- | --- | --- | --- |
| link-brief--maru | maru : 520/65, door, back | brief : 105/144, door, left | 0 / 0 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-gear--maru | maru : 1150/65, door, back | gear : 105/144, door, left | 0 / 0 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-landing--maru | maru : 1695/144, transport, right | landing : 105/144, transport, left | 0 / 0 | jalons gear/gear ; phases null/null ; raccourcis —/— |
| link-bridge--maru | maru : 850/65, door, back | bridge : 105/144, door, left | 0 / 0 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-landing--station | landing : 1795/144, path, right | station : 105/144, path, left | 0 / 0 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-office--station | station : 500/65, door, back | office : 105/144, door, left | 0 / 0 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-station--workshop | station : 1050/65, door, back | workshop : 105/144, door, left | 0 / 0 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-infirmary--station | station : 1530/65, door, back | infirmary : 105/144, door, left | 0 / 0 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-bore--station | station : 2295/144, rope, right | bore : 105/144, rope, left | -1 / 1 | jalons radio/radio ; phases null/null ; raccourcis —/— |
| link-station--tanks | station : 2110/225, path, front | tanks : 105/144, path, left | 0 / 0 | jalons escaped/escaped ; phases null/null ; raccourcis —/— |
| link-engine--station | station : 1770/225, door, front | engine : 105/144, door, left | 0 / 0 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-office--tower | office : 1190/144, stair-up, right | tower : 105/144, stair-down, left | 1 / -1 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-dormitory--office | office : 800/65, stair-up, back | dormitory : 105/144, stair-down, left | 1 / -1 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-mess--workshop | workshop : 1470/65, stair-up, right | mess : 1645/144, stair-down, right | 1 / -1 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-cellar--workshop | workshop : 730/65, stair-down, back | cellar : 1695/144, stair-up, right | -1 / 1 | jalons —/— ; phases null/null ; raccourcis cellar-hatch/cellar-hatch |
| link-bore--forecourt | bore : 1895/144, rope, right | forecourt : 105/144, rope, left | -1 / 1 | jalons rope/rope ; phases null/null ; raccourcis —/— |
| link-forecourt--vestibule | forecourt : 2195/144, door, right | vestibule : 105/144, door, left | 0 / 0 | jalons facade/facade ; phases null/null ; raccourcis —/— |
| link-sacrifice--vestibule | vestibule : 1545/144, door, right | sacrifice : 105/144, door, left | 0 / 0 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-pivot--vestibule | vestibule : 650/65, stair-down, back | pivot : 620/65, stair-up, back | -1 / 1 | jalons plasma/plasma ; phases [1,2]/[1,2] ; raccourcis —/— |
| link-balcony--vestibule | vestibule : 970/65, gallery, back | balcony : 1745/144, gallery, right | 0 / 0 | jalons ritual/ritual ; phases null/null ; raccourcis balcony-return/balcony-return |
| link-ossuary--sacrifice | sacrifice : 1795/144, door, right | ossuary : 105/144, door, left | 0 / 0 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-ossuary--weapons | ossuary : 1345/144, door, right | weapons : 105/144, door, left | 0 / 0 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-pivot--weapons | weapons : 1645/144, stair-down, right | pivot : 105/144, stair-up, left | -1 / 1 | jalons plasma/plasma ; phases null/null ; raccourcis —/— |
| link-pivot--press | pivot : 1945/144, door, right | press : 105/144, door, left | 0 / 0 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-pivot--weights | pivot : 1500/65, stair-up, back | weights : 105/144, stair-down, left | 1 / -1 | jalons plasma/plasma ; phases null/null ; raccourcis —/— |
| link-pivot--shaft | pivot : 1290/65, door, back | shaft : 105/144, door, left | 0 / 0 | jalons plasma/plasma ; phases null/null ; raccourcis —/— |
| link-duel--press | press : 1645/144, door, right | duel : 105/144, door, left | 0 / 0 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-press--weights | press : 630/65, stair-up, back | weights : 1995/144, stair-down, right | 1 / -1 | jalons plasma/plasma ; phases null/null ; raccourcis —/— |
| link-duel--glyphs | duel : 2095/144, door, right | glyphs : 105/144, door, left | 0 / 0 | jalons duel/duel ; phases null/null ; raccourcis —/— |
| link-cloister--duel | duel : 580/65, stair-up, back | cloister : 1945/144, stair-down, right | 1 / -1 | jalons cycle/cycle ; phases null/null ; raccourcis —/— |
| link-glyphs--refuge | glyphs : 700/65, door, back | refuge : 105/144, door, left | 0 / 0 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-glyphs--hunter | glyphs : 1695/144, door, right | hunter : 105/144, door, left | 0 / 0 | jalons weyland/weyland ; phases null/null ; raccourcis —/— |
| link-astrarium--glyphs | glyphs : 1380/65, stair-up, back | astrarium : 105/144, stair-down, left | 1 / -1 | jalons ritual/ritual ; phases null/null ; raccourcis —/— |
| link-refuge--trophies | refuge : 850/65, door, back | trophies : 105/144, door, left | 0 / 0 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-balcony--refuge | refuge : 1275/144, stair-up, right | balcony : 105/144, stair-down, left | 1 / -1 | jalons ritual/ritual ; phases null/null ; raccourcis —/— |
| link-hunter--service | hunter : 1845/144, stair-down, right | service : 105/144, stair-up, left | -1 / 1 | jalons alliance/alliance ; phases null/null ; raccourcis —/— |
| link-nursery--service | service : 1495/144, door, right | nursery : 105/144, door, left | 0 / 0 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-incubator--service | service : 590/65, stair-up, back | incubator : 105/144, stair-down, left | 1 / -1 | jalons alliance/alliance ; phases null/null ; raccourcis —/— |
| link-nursery--queenhold | nursery : 2045/144, door, right | queenhold : 105/144, door, left | 0 / 0 | jalons sebastian/sebastian ; phases null/null ; raccourcis —/— |
| link-nursery--trophies | nursery : 600/65, stair-up, back | trophies : 1000/65, stair-down, back | 1 / -1 | jalons alliance/alliance ; phases [0,2]/[0,2] ; raccourcis —/— |
| link-incubator--nursery | nursery : 1200/65, stair-up, back | incubator : 1745/144, stair-down, right | 1 / -1 | jalons alliance/alliance ; phases null/null ; raccourcis —/— |
| link-gantry--nursery | nursery : 1450/65, stair-up, back | gantry : 105/144, stair-down, left | 1 / -1 | jalons sebastian/sebastian ; phases null/null ; raccourcis —/— |
| link-cocoonhall--nursery | nursery : 850/65, door, back | cocoonhall : 105/144, door, left | 0 / 0 | jalons alliance/alliance ; phases null/null ; raccourcis —/— |
| link-gantry--queenhold | queenhold : 850/65, stair-up, back | gantry : 1945/144, stair-down, right | 1 / -1 | jalons sebastian/sebastian ; phases null/null ; raccourcis —/— |
| link-icebattle--tanks | tanks : 1795/144, path, right | icebattle : 105/144, path, left | 0 / 0 | jalons chain/chain ; phases null/null ; raccourcis —/— |
| link-elder--icebattle | icebattle : 2195/144, path, right | elder : 105/144, path, left | 0 / 0 | jalons queen/queen ; phases null/null ; raccourcis —/— |
| link-cellar--engine | engine : 1550/70, stair-down, back | cellar : 105/144, stair-up, left | -1 / 1 | jalons —/— ; phases null/null ; raccourcis —/— |
| link-cloister--weights | weights : 1760/65, door, back | cloister : 105/144, door, left | 0 / 0 | jalons cycle/cycle ; phases null/null ; raccourcis —/— |
| link-drain--incubator | incubator : 470/65, duct, back | drain : 105/144, duct, left | 0 / 0 | jalons alliance/alliance ; phases null/null ; raccourcis —/— |
| link-eggworks--incubator | incubator : 1390/65, door, back | eggworks : 105/144, door, left | 0 / 0 | jalons alliance/alliance ; phases null/null ; raccourcis —/— |
| link-drain--gantry | gantry : 1610/65, gallery, back | drain : 1745/144, gallery, right | 0 / 0 | jalons sebastian/sebastian ; phases null/null ; raccourcis —/— |
| link-dormitory--mess | dormitory : 1545/144, door, right | mess : 105/144, door, left | 0 / 0 | jalons —/— ; phases null/null ; raccourcis —/— |

Le JSON conserve les deux faces complètes, matériaux, dimensions de cadre, ancre, conditions et raccourcis. La prochaine recette doit observer seuil, support visible, arrivée, aller-retour, état des compagnons et reprise de sauvegarde. Une connexion correcte dans les données ne suffit pas à certifier sa reproduction à l’écran.
