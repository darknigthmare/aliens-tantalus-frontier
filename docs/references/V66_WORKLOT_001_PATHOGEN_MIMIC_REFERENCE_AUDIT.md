# V66 — audit de référence `enemy-040-pathogen-mimic`

Profil : `enemy-040-pathogen-mimic` (`Pathogen Mimic`)
Lot : `batch-003` / `worklot-001`
Date : `2026-09-01`
Statut : verrou de référence terminé localement, non fusionné. Aucune génération, normalisation, acceptation ou intégration runtime.

## Décision

`Pathogen Mimic` est une création de gameplay d’*Aliens: Tantalus Frontier*. La présentation officielle Pathogen inspectée nomme Runner, Blight, Brute et Queen, mais aucun ennemi nommé Pathogen Mimic. Cette absence est un constat limité à cette source, pas une prétention d’inventaire exhaustif de toute la franchise. Le profil est donc `PROJECT_ADAPTATION` / `NO_DIRECT_PUBLISHED_MODEL`, avec `canonExact=false`.

L’autorité positive est le prédécesseur Tantalus V54 et son prompt conservé. Les sources Cold Iron servent uniquement à encadrer le vocabulaire de matière Pathogen. Elles ne justifient ni une morphologie 1:1, ni une copie de Reine, ni une affirmation canonique.

| Élément | Contexte externe vérifié | Verrou Tantalus positif |
| --- | --- | --- |
| Nom | Aucun `Pathogen Mimic` dans la présentation Pathogen inspectée | Nom et profil propres au projet. |
| Matière | Infection pâle, forte, asymétrique et nuancée dans le langage de production Cold Iron | Chair fongique pâle, sacs compacts, côtes rompues et sinew humide. |
| Anatomie | Aucune anatomie officielle de Mimic disponible | Torse humain dérivé étiré; exactement deux bras et deux jambes; demi-redressé et bas. |
| Animation | Aucune animation officielle de Mimic disponible | Poursuite traînée rapide, slash/morsure courte, rupture contenue puis mort terminale. |
| Exactitude | Aucune correspondance directe | `canonExact=false`; revue contre le design Tantalus, pas contre un modèle externe fictif. |

## Sources et portée

- [Cold Iron Studios — Pathogen Deep Dive](https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/) : source primaire pour le périmètre nommé de la présentation et le contexte de mutation Pathogen. Elle ne fournit aucun modèle anatomique de Mimic.
- [Xbox Wire — entretien avec Ashley Stegon, Senior Character Artist chez Cold Iron](https://news.xbox.com/en-us/2022/08/30/the-aliens-fireteam-elite-pathogen-expansion-is-available-now/) : source de production pour la doctrine de matière — infection lisible, force conservée, asymétrie narrative, pâleur avec variation subtile. Le propos vise la Reine; sa couronne, son anatomie, son échelle et ses attaques sont hors périmètre.
- `docs/prompts/V54_IMAGEGEN_WAVE.md` : verrou positif Tantalus conservé — chair fongique pâle, torse humain dérivé étiré, griffes asymétriques, côtes rompues, sacs pathogènes, sinew humide et locomotion rapide à demi redressée.
- `docs/ART_PROVENANCE_V54.md` : provenance OpenAI du master projet et trace des deux variantes rejetées pour franchissement/coupe de cellules.

Aucun bitmap externe n’a été téléchargé, incorporé ou copié. Les sources officielles sont de la documentation; le design positif vient des assets/provenances du projet.

## Prédécesseur Tantalus V54

| Fichier | Preuve technique | Usage autorisé |
| --- | --- | --- |
| `assets/openai/sprites/enemies/pathogen-mimic-action-sheet.png` | 1254×1254 RGB; SHA-256 `d544f4e79cb922d4a3f695d640d19ef50f2cf47b2e0d437fb0b077370420ec9f` | Identité, palette et grandes phases d’action; jamais une source V66 à recopier. |
| `assets/openai/sprites/normalized/enemies/pathogen-mimic-action-sheet.png` | 1024×1024 RGBA; SHA-256 `f5b8525e9c0f4d03c30e6c671d129b0e7147878de4ce9647ac78e5800ec631c2` | Mesures de cellule, appui et enveloppe gameplay. |

Le normalisé historique a quatre poses par ligne. Les bornes alpha donnent : idle 176–194×95–151 px, move 199–207×85–96 px, attack 134–224×87–115 px, death 148–195×41–101 px. Les 16 cellules terminent à `y=239`. La hausse de hauteur d’une pose idle, l’allonge d’attaque et la largeur du cadavre montrent pourquoi la boîte englobante ne peut pas régler l’échelle inter-clips.

Contrat runtime historique : rendu 132×96, pivot `creature-ground`, hitbox `pathogen-mimic-large` `(24,52,208,188)`. La grande hitbox est un héritage de gameplay; elle ne doit pas faire grandir l’anatomie V66.

## Verrou d’identité et de topologie

- Un seul poursuivant bas, penché vers l’avant et demi-redressé, avec torse humain dérivé étiré, taille endommagée, membres traînants et tête petite mais reconnaissable.
- Exactement deux épaules/deux bras/deux mains griffues et deux hanches/deux jambes/deux pieds. Les côtes rompues, tendons, sacs et excroissances fongiques restent de la surface; ils ne deviennent jamais des membres.
- Griffes asymétriques et placement des sacs stables entre les 32 poses. L’asymétrie ne permet ni changement de côté ni redesign d’un clip à l’autre.
- Chair fongique gris-ivoire pâle, nuances beige meurtri/rose froid, sinew humide et sacs compacts. Pas de glow néon, de magenta anatomique ou de zombie vêtu générique.
- Une bouche anatomique déformée permet une morsure courte. Aucun dôme lisse, tube dorsal ou piston d’inner jaw xénomorphe séparé.
- Aucune queue, masse-poing de Brute, couronne de Reine, armure, vêtement, arme ou équipement.
- Profil de gameplay orthographique strictement tourné à droite.

## Échelle et racine physique

L’échelle future doit venir de mesures anatomiques répétables :

1. mesurer la corde thoracique entre le repère postérieur scapula/racine de côte et l’encoche antérieure du sternum;
2. recouper la distance entre les articulations hanche et épaule sur au moins deux poses comparables par clip;
3. exclure griffes, côtes saillantes, gonflement des sacs, boîtes englobantes et largeur du cadavre;
4. ne renseigner `sourceScaleByClip` qu’après une revue de calibration documentée.

La racine corporelle est le bassin projeté sous l’appui chargé. Une griffe qui frôle le sol n’est ni une jambe ni un pivot. Pendant l’attaque, le pied arrière et le bassin portent la séquence; dans la mort, la racine passe au contact bassin/torse du corps terminal, jamais à un sac rompu ou à une griffe éloignée.

## Contrat des quatre planches V66

Chaque planche doit être 2:1, grille invisible 4×2, huit poses uniques en ordre ligne-major, sujet complet dans chaque cellule, profil droit, identité/échelle commune, alpha réel ou magenta uniforme `#FF00FF`. L’historique V54 impose une vigilance renforcée : tout corps, griffe, côte, tendon ou fragment qui touche/franchit une cellule bloque la source avant normalisation.

| Clip | Contrat chronologique | Interdiction critique |
| --- | --- | --- |
| `idle`, 6 fps boucle | repos bas → twitch → respiration → léger lever de tête → alerte → détente des sacs → retour neutre | Pas de marche, de station humaine droite ou de mutation topologique. |
| `move`, 12 fps boucle | contact → abaissement/traînée → passage → pose → propulsion du bassin → alternance → fermeture de cycle | Pas de marche militaire, sprint de Drone quadrupède ou translation entre cellules. |
| `attack`, 12 fps non-bouclé | garde → compression → armement de griffe → slash → contact → morsure courte/impact → suivi → récupération | Pas d’inner jaw séparée, projectile, queue ou membre d’attaque surnuméraire. |
| `death`, 10 fps non-bouclé | impact létal → stagger → rupture contenue d’un sac → thorax plie → perte d’appui → contact → corps terminal | Pas d’explosion totale, dissolution, nuage détaché, repousse ou pose finale vivante. |

## Conflits résolus et portes restantes

- L’ID contractuel reste **exactement** `enemy-040-pathogen-mimic`.
- La famille de queue `biped` est conservée comme catégorie technique, mais elle ne doit pas imposer une marche droite générique : le mouvement positif est bas, traîné et rapide.
- Le texte générique actuel autorise une frappe d’inner jaw. Le verrou local exige slash + morsure anatomique courte; la queue n’est volontairement pas modifiée dans ce sous-lot.
- Le profil est prêt pour une fusion ultérieure du fragment `profiles.enemy-040-pathogen-mimic`. Cette fusion ne vaut ni génération, ni acceptation.
- Après fusion/réinitialisation autorisée : persister les prompts, produire exactement quatre planches, auditer les 32 cellules, vérifier topologie/sacs/asymétrie, mesurer thorax/racines, puis seulement normaliser et soumettre à la revue visuelle.

Ce document ne modifie aucun global, queue, state, metadata, asset normalisé, fichier runtime, profil 035–038 ou état Git.
