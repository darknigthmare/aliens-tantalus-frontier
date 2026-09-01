# V66 — audit de référence `enemy-039-abomination`

Profil : `enemy-039-abomination` (`Abomination`)
Lot : `batch-003` / `worklot-001`
Date : `2026-09-01`
Statut : verrou de référence terminé localement, non fusionné. Aucune génération, normalisation, acceptation ou intégration runtime.

## Décision

Le nom runtime **Abomination** est conservé, mais son autorité visuelle est le **Pathogen Brute** d’*Aliens: Fireteam Elite — Pathogen*. Il s’agit d’une adaptation Tantalus `PROJECT_ADAPTATION` / `DERIVED_FROM_EXTERNAL_MODEL`, jamais de l’Abomination Predalien d’*Aliens vs. Predator* et jamais d’une promesse de reproduction 1:1. `canonExact` reste donc `false`.

| Élément | Canon / source licenciée | Adaptation Tantalus verrouillée |
| --- | --- | --- |
| Nom positif externe | `Pathogen Brute` | `Abomination` reste l’identifiant d’affichage du projet. |
| Nature | Xénomorphe muté non identifié | Proportions de gameplay, silhouette latérale et animation complète sont propres au projet. |
| Fonction distinctive | Deux énormes excroissances en forme de poings; slam direct et frappe du sol créant une onde de choc | Marche lourde à appui possible sur les masses; une attaque V66 en double slam, sans effet peint dans la planche. |
| Matière Pathogen | Infection pâle, forte et asymétrique dans le langage de production Cold Iron | Chair gris-ivoire, croûtes sombres et asymétrie stable adaptées à la lisibilité metroidvania. |
| Exactitude | Aucune source ne certifie les futurs pixels | `canonExact=false`; contrôle de fidélité par invariants, pas par copie d’un screenshot. |

## Sources et portée

- [Cold Iron Studios — Pathogen Deep Dive](https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/) : source primaire positive. Elle nomme le Pathogen Brute, le décrit comme un Xénomorphe muté, verrouille les deux masses-poings et la frappe du sol à onde de choc.
- [Cold Iron Studios — Release Notes](https://www.aliensfireteamelite.com/en/releasenotes/) : confirme la terminologie et signale une correction de glissade du Brute lorsqu’il est étourdi; cette mention renforce le contrôle de grounding, sans fournir un cycle de sprite.
- [Xbox Wire — entretien avec Ashley Stegon, Senior Character Artist chez Cold Iron](https://news.xbox.com/en-us/2022/08/30/the-aliens-fireteam-elite-pathogen-expansion-is-available-now/) : source de production limitée au langage de matière Pathogen. L’artiste explique, pour la Reine, une infection asymétrique, une force conservée et une peau pâle aux couleurs subtiles. Aucune anatomie de Reine n’est transposée au Brute.
- `docs/references/V56_ENEMY_REFERENCE_MATRIX.json` : contrat local antérieur qui classe déjà Abomination en adaptation du Pathogen Brute et exclut explicitement l’homonyme Predalien.

Aucun bitmap externe n’a été téléchargé, incorporé ou copié. Les pages et images officielles servent uniquement à vérifier les noms, la fonction, la matière et les frontières d’identité.

## Prédécesseur Tantalus V56

| Fichier | Preuve technique | Usage autorisé |
| --- | --- | --- |
| `assets/openai/sprites/enemies/abomination-pathogen-brute-action-sheet-v56.png` | 1536×1024 RGBA; SHA-256 `d62dcb4f3b37374ba91ee316152ebaa00bdf6b00a4dcee9ee55c323f91188ae5` | Palette, silhouette générale et intention d’action seulement. |
| `assets/openai/sprites/normalized/enemies/abomination-pathogen-brute-action-sheet-v56.png` | 1024×1024 RGBA; SHA-256 `0a85ccaa6f18c8e72eef25a0feb208be5c94b291934ffc621b524b6c86cfab58` | Mesures de cellule, appui et enveloppe gameplay; jamais une source V66 à dupliquer. |

Le normalisé historique a quatre poses par ligne. Les bornes alpha donnent : idle 156–164×150–153 px, move 166–191×127–143 px, attack 145–224×117–164 px, death 157–204×36–124 px. Les 16 cellules terminent à `y=239`, cohérent avec la garde basse de 16 px. La grande largeur de l’attaque et du cadavre est liée à la pose; elle ne peut pas déterminer l’échelle anatomique.

Contrat runtime historique : rendu 190×132, pivot `creature-ground`, hitbox `crusher-large` `(24,100,216,140)`. Cette boîte reste une décision de gameplay, pas une mesure canonique.

## Verrou d’identité et de topologie

- Un seul individu très large, bas et massif, à petite tête enchâssée entre des épaules hypertrophiées.
- Exactement deux jambes et deux bras continus; chaque bras se termine par une seule énorme excroissance anatomique en forme de poing. Les deux masses restent identifiables et attachées dans les 32 poses.
- Chair organique Pathogen gris-ivoire avec accents beige meurtri, rose froid discret et croûtes sombres. L’asymétrie est stable d’un clip à l’autre; l’infection ne doit pas lire comme une décomposition faible.
- Aucun équipement, armure, vêtement, projectile ou arme portée. Les masses ne sont ni des gantelets ni des marteaux.
- Aucune queue, aucun long dôme de Drone, aucune couronne de Reine, aucun canon dorsal, aucune mandibule/dreadlock/technologie Yautja.
- Profil de gameplay orthographique strictement tourné à droite. Aucun raccourci frontal, retournement, changement de caméra ou changement de proportions.

## Échelle et racine physique

L’échelle V66 devra être mesurée après génération, jamais devinée à partir des boîtes englobantes :

1. mesurer le même diamètre couture-à-couture sur la masse-poing la moins occultée, dans au moins deux poses comparables par clip;
2. recouper avec la corde crânienne entre la pointe de mâchoire et la racine postérieure du crâne;
3. exclure l’extension totale des bras, l’éventuelle onde de choc, la largeur de la pose et la largeur du cadavre;
4. ne renseigner `sourceScaleByClip` qu’après une revue documentée des mesures.

La racine corporelle est la projection du bassin/centre de masse sur le plan de support. Un poing planté est un contact secondaire, pas le pivot. L’attaque conserve un appui arrière lisible; la mort finit ancrée sous le torse effondré, jamais sous l’extrémité d’une excroissance.

## Contrat des quatre planches V66

Chaque planche doit être 2:1, grille invisible 4×2, huit poses uniques en ordre ligne-major, sujet complet dans chaque cellule, profil droit, identité/échelle commune, alpha réel ou magenta uniforme `#FF00FF`. Tout contact ou chevauchement de cellule bloque la source.

| Clip | Contrat chronologique | Interdiction critique |
| --- | --- | --- |
| `idle`, 6 fps boucle | repos lourd → respiration → tension d’une masse → alerte → transfert de poids → retour neutre | Pas de marche, pas de saut d’échelle, pas de masse supplémentaire. |
| `move`, 12 fps boucle | contact pied → pose d’une masse → transfert du centre → récupération → alternance → fermeture de cycle | Pas de glissade, sprint de Drone ou galop quadrupède. |
| `attack`, 12 fps non-bouclé | appui → recul du poids → armement des deux bras → accélération → double impact au sol → suivi → récupération | Pas de griffe/inner-jaw générique; l’onde de choc reste un événement gameplay, pas un cercle/VFX peint. |
| `death`, 10 fps non-bouclé | impact létal → recul → appui qui cède → genoux/torse tombent → contact → pose terminale | Pas d’explosion, dissolution, excroissance détachée ou récupération vivante. |

## Conflits résolus et portes restantes

- L’ID contractuel reste **exactement** `enemy-039-abomination`; le fichier historique `abomination-pathogen-brute` est une preuve locale, pas un nouvel ID de queue.
- Le texte générique actuel de la queue autorise une attaque de griffe ou d’inner jaw. Le verrou local la remplace par le double slam, mais la queue n’est volontairement pas modifiée dans ce sous-lot.
- Le profil est prêt pour une fusion ultérieure du fragment `profiles.enemy-039-abomination`. Il n’est pas autorisé à passer directement à l’acceptation.
- Après fusion/réinitialisation autorisée : persister chaque prompt avant ImageGen, produire exactement quatre planches, auditer 32 cellules, mesurer masses/crâne, revoir les racines, puis seulement normaliser et soumettre à la revue visuelle.

Ce document ne modifie aucun global, queue, state, metadata, asset normalisé, fichier runtime, profil 035–038 ou état Git.
