# V66 — audit de référence `enemy-035-trilobite-echo`

Statut : phase référence terminée localement, verrou non fusionné, aucune génération ImageGen, aucune acceptation ni intégration runtime.

## Conclusion

Le `Trilobite Echo` doit rester une `PROJECT_ADAPTATION`, jamais une réplique canon 1:1. Son ancre est le Trilobite adulte de *Prometheus*, mais « Echo » est une lignée propre à *Aliens: Tantalus Frontier*. Le verrou de production retient **exactement sept tentacules primaires**, attachés indépendamment autour d’un seul manteau central, ainsi qu’un seul appareil d’implantation ventral. Cette règle remplace toute ambiguïté de la plaque V56.

## Hiérarchie des références

- [20th Century Studios — Prometheus](https://www.20thcenturystudios.com/movies/prometheus) : source écran et continuité primaire.
- [Weta FX — Prometheus](https://www.wetafx.co.nz/films/filmography/prometheus) : source de production VFX pour l’attaque finale et la peau translucide rendue par diffusion sous-cutanée.
- [NECA — Engineer vs. Trilobite](https://necaonline.com/2012/10/coming-soon-prometheus-battle-damaged-engineer-vs-trilobite-2-pack-is-toys-r-us-exclusive/) : sculpture licenciée montrant un grappler massif aux membres flexibles; la figurine fait presque 17 pouces d’envergure à côté d’un Engineer de presque 9 pouces.
- [Neville Page via Blue Screen Reveals](https://bluescreenreveals.com/neville-page-designing-sci-fi-creatures-characters/) : intention de design la plus précise — sept tentacules au final, locomotion puissante de type appui sur phalanges et ouverture physiologique centrale.
- [Computer Graphics World — Beauty and the Beast](https://www.cgw.com/Press-Center/Web-Exclusives/2012/Beauty-and-the-Beast.aspx) : adulte d’environ 14 pieds d’envergure, déformation musculaire, plis longitudinaux et différence de surface entre tension et compression.
- [Monster Legacy — Prometheus](https://monsterlegacy.net/2013/03/04/prometheus-trilobite-deacon-hammerpede-alien/) : recoupement des propos de production sur les sept tentacules, la puissance de levage et la chair pâle inspirée de céphalopodes conservés au formol.

Les images de ces pages restent des références d’étude. Aucune image officielle, photo de figurine, texture ou frame du film n’a été téléchargée ou intégrée.

## Audit V56 local

La source projet `assets/openai/sprites/enemies/trilobite-echo-action-sheet-v56.png` est une RGBA 1402×1122 (`SHA-256 40dcfb27…9796a32`). Sa version runtime normalisée est une RGBA 1024×1024 (`SHA-256 73c43b03…4926f77`) en 4×4 : idle, chase, attack, death.

Points conservés :

- manteau central mou, chair ivoire/rose humide et veines discrètes ;
- lecture latérale droite constante ;
- silhouette basse et large ;
- grammaire globale curl/alerte, crawl, grapple/implantation, effondrement.

Points non fiables :

- les bras se fusionnent ou disparaissent sous les chevauchements et ne prouvent pas un compte constant ;
- certaines poses ressemblent à un calmar pointu doté d’une tête ;
- les petits filaments d’attaque ne sont pas clairement séparés des bras porteurs ;
- quatre poses par action sont insuffisantes pour les animations V66 à huit poses.

Mesure sur les cellules normalisées de 256 px :

| Rangée | médiane L×H | maximum L×H |
|---|---:|---:|
| idle | 150,5×93,5 px | 203×121 px |
| move | 199×88 px | 208×97 px |
| attack | 190,5×106,5 px | 200×133 px |
| death | 190×68 px | 224×112 px |

Les 16 silhouettes finissent à `y=240`, cohérent avec la garde basse de 16 px. Le runtime actuel déclare 184×104 px et le hitbox `trilobite-sprawl` mesure 216×114 px. V66 doit conserver cette classe d’échelle, sans recopier les débordements accidentels de V56.

## Verrou identité et topologie

- Un manteau central unique, mou, sans tête, yeux, squelette, torso ni morphologie humanoïde.
- **Sept tentacules primaires exactement**, chacun continu de sa base musculaire à une extrémité effilée et recourbée.
- Les sept bases sont disposées dans un ordre circulaire immuable autour d’un même anneau basal. Aucune fusion, bifurcation, disparition, permutation ou apparition entre poses.
- Ces sept membres sont les seuls bras longs porteurs : appui, crawl, levage et grapple.
- Un seul appareil physiologique ventral à replis compacts. Il peut présenter un organe d’implantation court pendant le contact, mais ne crée jamais un huitième tentacule.
- Orientation droite : l’ouverture et la portée d’attaque visent l’écran droit, les supports arrière restent plantés. Jamais de rosace face caméra.
- Chair ivoire, beige rosé, translucide et humide; tension plus claire/brillante, compression plus sombre/rugueuse dans les plis.

Le reportage VFX évoque six ou sept bras visibles dans les plans complexes, tandis que Neville Page explicite une décision de design à sept. Le verrou choisit sept : c’est l’intention directe du designer et la seule topologie déterministe pour une animation de jeu.

## Échelle gameplay et racine

Le Trilobite adulte du film est une créature d’environ 14 pieds d’envergure; cette valeur reste un contexte biologique, pas une consigne de rendre le sprite gigantesque. Le profil Echo reste un apex bas : cible relâchée 184×104 px, hitbox existant 216×114 px, action maximale 216×136 px. Par rapport au visuel marin 110×148 px, cela représente environ 1,67 fois sa largeur et 0,70 fois sa hauteur.

L’invariant inter-clips sera la longueur du manteau entre le centroïde des attaches radiales arrière et l’ouverture antérieure fermée — jamais la bounding box ni la portée variable des tentacules. Aucun facteur `sourceScaleByClip` n’est autorisé avant mesure de vraies sources générées.

La racine physique est la projection du centre de l’anneau d’attache sur le plan de sol, pas le bout le plus bas ou le plus éloigné d’un tentacule. Idle/move gardent au moins trois appuis; attack garde au moins deux bras arrière en support; death finit sous le manteau effondré. Le pivot `[128,240]` est seulement le précédent de file et devra être revu pose par pose.

## Contrat des quatre animations V66

| Clip | Cadence | Chronologie verrouillée |
|---|---:|---|
| idle | 6 fps, boucle | neutre fermé → compression/inspiration → petite levée → tension des appuis → alerte → relâche → descente → retour |
| move | 12 fps, boucle | ancrage arrière → portée avant → pose avant → transfert → traction du manteau → portée opposée → pose opposée → récupération |
| attack | 12 fps, non-bouclé | alerte → compression → ancrage arrière → deux bras avant s’étendent → grapple → ouverture/implantation courte → rétraction → fermeture |
| death | 10 fps, non-bouclé | impact létal → recul → premiers appuis perdus → chute du manteau → relâchement → impact sol → bras mous/repliés → tas terminal immobile |

Chaque clip exigera une plaque 2:1, grille 4×2, huit poses chronologiques distinctes, profil droit, corps complet, matte uniforme `#FF00FF` ou vrai alpha. Chaque silhouette reste dans 72 % de la largeur et 52 % de la hauteur de sa cellule, avec au moins 12 % de vide sur chaque bord — cible opérationnelle 55 px pour une source 1774×887.

## Interdits critiques

- huitième bras, bras manquant/fusionné/bifurqué, changement d’attache ou nouveau membre pendant l’attaque ;
- dôme xénomorphe, tubes dorsaux, queue-lame, double mâchoire, yeux, crâne ou adulte xénomorphe noir ;
- poulpe bleu réaliste, ventouses dominantes, carapace de trilobite fossile ou Facehugger miniature ;
- projectile acide, arme, équipement, filament détaché, explosion ou démembrement gratuit ;
- cadrage gauche, vue frontale, rotation caméra, dérive de perspective ou copie d’un plan exact du film ;
- crop, contact de séparation de cellule, décor, sol, ombre, texte, logo, UI ou watermark.

## État de sortie

Le fragment machine correspondant est `docs/references/V66_WORKLOT_001_TRILOBITE_ECHO_REFERENCE.json`. Il ne modifie aucun registre global, QUEUE, STATE, référence partagée, runtime ou autre profil. Le prochain jalon est une revue/éventuelle fusion par le parent, puis l’écriture des quatre prompts; aucune génération n’a été lancée pendant cette phase.
