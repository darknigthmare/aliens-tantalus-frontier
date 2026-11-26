# Covenant V016 — production, bible et reprise vérifiable

## État publié

Cette continuation ajoute 16 PNG originaux, conservés indépendamment de la panne de l’environnement de travail. Les 103 PNG V011–V014 restent inchangés. Les nouvelles images sont toutes au catalogue dans cette branche : **119 images, 72 admissions runtime et 47 images de catalogue**. Les cinq cycles complets et leurs 40 phases restent ceux de V014.

L’intégration locale avait relié le rocher de berge à `landing-light2`, mais ses derniers tests n’ont pas pu être exécutés. Aucun fichier de simulation, registre runtime ou rendu inachevé n’est repris dans la branche publiée. Le nombre local 73 ne décrit donc pas cette publication.

## Images produites

| Domaine | Fichiers | Portée |
|---|---|---|
| Personnage | David hôte, poses 01/02/05/06/07 | Cycle incomplet, cinq cartes individuelles |
| Accessoires | Deux capots de générateur, cabestan final, mât extérieur, cryopod des Ingénieurs | Concepts/composants de production distincts |
| Terrains | Souche du Juggernaut, dalle rocheuse, rocher de berge, herbe du site brûlé | Adaptations 2D guidées par références |
| Véhicule | Audi lunar quattro de face, état promotionnel éclairé | Vues constructeur/promotion, profil latéral absent |

Les prompts exacts récupérés, les sources et les limites accompagnent le manifeste. Les empreintes des PNG ont été recalculées depuis les données du générateur et comparées aux blobs Git sauvegardés. Les images sont enregistrées sans redimensionnement ni retouche locale.

## Complément détaillé de la bible

Le générateur `scripts/build-covenant-bible-v016.py` reprend le JSON V014, les nouveaux manifestes et le registre runtime réellement publié. Il conserve les identifiants historiques et enrichit les fiches avec des contrats de production. Une reconstruction du générateur après panne doit être exécutée et vérifiée avant livraison de ses sorties.

| Catégorie | Prescription de production |
|---|---|
| Personnages | Identité et tenue par scène, distinction EVA/IVA, asymétries, mains/équipement, états manquants et consommateur exact. Les cinq poses David ne ferment pas le besoin de marche complète. |
| Lieux | 57 fiches spatiales, 67 connexions et 134 seuils existants ; plans de passage, profondeur, couches de rendu et continuité des scènes. Aucun raccord imaginaire ajouté. |
| Armes | 7 familles documentées, 4 jouables ; apparences/variantes, portage et limites de référence. Toujours aucun nouveau PNG d’arme ; refus antérieurs conservés. |
| Props | 126 familles et 630 occurrences ; variantes d’état, dimensions dans le jeu, éléments animés et correspondances limitées à des instances. Les concepts de production restent séparés des familles génériques. |
| Véhicules | Lander One, Lifter et rover distingués ; silhouette, composants visibles, vues manquantes et portée des promotions officielles. |
| Vaisseaux | Covenant et ses configurations, Juggernaut, appareils des Ingénieurs et candidats non résolus ; vues extérieures et éléments de décor non confondus. |
| Terrains | 16 familles ; modules et matières, silhouettes, transitions, profondeur, bordures de passage et références propres à chaque site. |
| Planètes | 3 fiches ; Planet 4, Origae-6 et Terre gardent leurs preuves et usages distincts. Aucune surface canonique d’Origae-6 n’est inventée. |

Le registre conserve **315 références**, **23 profils** et les jeux de données historiques. Les fiches peuvent se recouper : leurs comptes ne s’additionnent pas en objets uniques. Les contrats décrivent des besoins de production ; ils ne sont pas un compte de PNG livrés.

## Sources et corrections

- [FBFX — Alien: Covenant](https://www.fbfx.co.uk/film-alien-covenant) distingue l’EVA lourde portée par Tennessee et Ankor des combinaisons IVA.
- [Lithgow Arms](https://www.lithgowarms.com/rise-up-f90-featuring-in-pacific-rim-movie-sequel/) confirme l’utilisation de la base F90 dans le film ; cela ne certifie pas chaque montage d’accessoires.
- [Audi France](https://media.audifrance.fr/le-rover-lunaire-audi-lunar-quattro-a-lecran-dans-le-film-alien-covenant/) documente le rover et son court promotionnel. La photo A173663 ne montre pas le véhicule et est écartée comme preuve de sa forme.
- [Tony Drew](https://www.tonydrew.com.au/film) distingue les concepts de capots, le cabestan final, le mât extérieur et les éléments de décor du Juggernaut issus de Prometheus.
- [FXGuide / MPC](https://www.fxguide.com/fxfeatured/alien-covenant-by-land-and-air/) fournit des vues de production du paysage de l’épave. Le cliché `levi-deadforest-1578` appartient au site du Lander détruit et ne sert pas à la forêt du Juggernaut.

## Limites maintenues

**Aucune fidélité 1:1 n’est certifiée.** Les formes cachées, mesures physiques, mouvements et détails reconstruits restent explicitement qualifiés. Film cinéma, bonus officiel, concept de production et adaptation jouable ne sont pas fusionnés.

La phase David03 a été refusée en sortie par la génération ; 04/08 n’ont pas été tentées ensuite. Les cinq poses conservées ne forment pas un cycle activable. Les sept familles d’armes restent sans PNG et les refus antérieurs ne sont pas relancés.

Le détourage a été inspecté avant la panne ; plusieurs poses David gardent des résidus d’alpha faibles. Les dimensions natives et les octets ont ensuite été revérifiés en mémoire. Aucun succès final Chromium, Excel V016 ou pack hors ligne V016 n’est présumé.

## Reprise

Le workflow `Covenant V016 reference bible` exécute le générateur à partir de la base V014, contrôle les comptes et les identifiants, puis archive les documents générés avec les images originales. Il utilise des permissions de lecture et ne modifie pas la branche.

Les quatre formats V014 restent consultables jusqu’à publication des nouvelles sorties vérifiées. Le classeur Excel V016 local est un brouillon et n’est pas livré comme final.

Les commandes de reprise de l’environnement sont conservées avec le suivi de cette conversation. Elles ne remplacent pas les validations de ce dépôt.
