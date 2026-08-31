# V66 — Production ennemie par lots reprenables

## Lots de travail de 202 — demande du 31 août 2026

La coordination utilise maintenant des groupes figés de **202 profils**, et
non 202 images. `V66_ENEMY_WORKLOTS_202.json` superpose les groupes
202 / 202 / 161 aux lots techniques ci-dessous. Les cinq profils du pilote
déjà intégrés et le Facehugger V65 restent exclus. Les `batchId`, chemins,
ordinaux, verrous et preuves existants ne sont ni déplacés ni renumérotés.

Le premier groupe couvre les profils 007 à 208 : **872 planches requises**.
Ses membres ne glissent pas vers les groupes suivants lorsqu'un profil est
intégré. `npm run batch:v66:worklots` relit les preuves actuelles et distingue
références, générations, acceptations et intégrations ; cette commande est
en lecture seule et ne génère aucune image. Une régénération n'est pas une
planche supplémentaire. Les nouvelles retouches non sélectionnées restent
séparées de ces comptes et ne remplacent pas les sources calibrées.

La partition de stockage historique de 20 décrite ci-dessous reste en place.
Les 202 profils sont une unité de coordination, pas une promesse de 202
ennemis automatiquement terminés ni une certification de fidélité 1:1.

Le roster contient **571 profils / 55 archetypes**. Le Facehugger standard V65
est une base deja integree, pas une nouvelle production V66. Les **570 autres
profils sont repartis en 30 lots : le pilote historique de 5 profils, puis
28 lots de 20 et un dernier reliquat de 5**. Les contrats actuels demandent
**2 457 planches sources**, et non 500 images deja terminees : une planche est
un clip de huit poses, plusieurs planches forment un atlas de profil.

Le premier lot contient Ovomorph, Chestburster, Drone / Big Chap, Warrior et
Runner. Il demande 20 planches sources / 160 poses. Les variantes ne recoivent
jamais automatiquement l'image du profil standard.

La taille de production vaut desormais **20 ennemis par lot**, pas 20
planches. `batch-001` reste definitivement le pilote de cinq profils, avec
ses IDs, ordinaux, chemins sources, verrous, prompts et preuves inchanges.
`batch-002` couvre exactement `enemy-007-praetorian` a
`enemy-026-foundry-crusher` : **87 planches / 696 poses**. `batch-003` reprend
aux profils027..046, et ainsi de suite. `batch-030` contient les profils567..571
et demande22planches. Aucun profil n'est duplique ou omis; le Facehugger V65
ne redevient jamais un travail V66 a generer.

## Migration des anciens lots de cinq

`init` migre la partition historique de114lots vers30lots sans reserialiser
le fichier d'etat existant, sans toucher aux references ni aux pixels.
Les evenements et leurs empreintes restent identiques octet pour octet.
La migration est deterministe et une seconde execution est idempotente.

Avant toute ecriture, elle refuse de deplacer un profil ayant deja un
evenement de production, une source, un atlas ou des metadonnees a son ancien
chemin. Ce refus protege aussi les sources reelles pas encore enregistrees.
Il faut alors conserver/traiter explicitement l'ancien emplacement; ne pas
effacer l'historique ni copier les preuves pour contourner le controle.
Les cinq profils integres du pilote restent donc proteges, tout comme un
travail partiel du lot002 dont les chemins restent inchanges.

## Commandes

```powershell
node scripts/enemy-batch-production.mjs init
node scripts/enemy-batch-production.mjs status --batch batch-002
node scripts/enemy-batch-production.mjs dry-run --batch batch-002
node scripts/enemy-batch-production.mjs check
py scripts/process-v66-enemy-batch.py --batch batch-002 --dry-run
py scripts/process-v66-enemy-batch.py --profile enemy-001-ovomorph
py scripts/process-v66-enemy-batch.py --profile enemy-001-ovomorph --check
```

Reproduction exacte de la preparation retenue pour le lot001 (apres revue des sources, des echelles et des160racines physiques) :

```powershell
py scripts/process-v66-enemy-batch.py --batch batch-001 --safe-reassign-cell-fragments --remove-enclosed-magenta-matte --remove-enclosed-magenta-aa-fringe
py scripts/process-v66-enemy-batch.py --batch batch-001 --check
node scripts/sync-sprite-manifest-v66.mjs --check
```

Ces options ne valent pas autorisation automatique pour les lots suivants. Le detourage interieur doit etre prouve et revu pour leurs couleurs. Les franges ne peuvent etre retirees qu'a deux pixels source du coeur magenta verifie ; voir `V66_ENCLOSED_MATTE_REVIEW.md`. Les images sources restent intactes. Refaire une normalisation apres acceptation peut invalider les empreintes et impose une nouvelle revue ; ne pas remplacer silencieusement un atlas integre.

Les fichiers textuels de preuve sont en LF, fixes par `.gitattributes`, et les JSON du normaliseur sont ecrits en LF. La verification de l'index Git avant publication doit retrouver les memes SHA-256 que l'historique de production, y compris sous Windows.

`init` reconstruit la file deterministe depuis `ENEMIES` et les references, mais
ne supprime jamais l'etat existant. `dry-run`, `status` et `check` ne generent
aucune image et ne font aucun appel API. La generation reelle reste effectuee
avec l'outil OpenAI ImageGen; le pipeline ne pretend pas disposer d'un moteur
autonome de milliers d'appels.

## Verrou de reference

`V66_ENEMY_BATCH_REFERENCES.json` contient un objet `profiles` indexe par ID.
Chaque reference prete doit donner `status: reviewed`, `urls` HTTPS,
`localPaths`, `designLock`, `reviewer`, `reviewedAt` et `canonExact: false`.
Le verrou doit preciser la version canonique, le crane, les membres, la queue,
les materiaux, la palette et la vue de gameplay. Une simple URL non examinee
ne constitue pas une revue. Les variantes systemiques/concepts sans design
canonique propre restent des adaptations, jamais une fidelite 1:1 certifiee.

La file fournit pour chaque clip son prompt complet, le hash du prompt, le
hash du verrou, les references et les chemins reels. Un verrou modifie
invalide la provenance de generation precedente jusqu'a nouvelle revue.

## Etapes honnetes et persistantes

`V66_ENEMY_BATCH_STATE.json` contient un historique append-only de decisions.
Chaque decision doit avoir un `actor` et une note explicite. Les ecritures CLI
sont atomiques. Les statuts sont recalcules a partir des dernieres preuves :

- `pending-reference` : aucun verrou de design examine.
- `ready-generation` : reference examinee, aucune generation attestee.
- `generated` : au moins un clip reel dispose de sa provenance ImageGen et
  de son hash source. Le nombre de clips realise/requis reste affiche.
- `review-rejected` : la revue refuse explicitement le candidat.
- `accepted` : tous les clips sont attestes, normalises et controles
  visuellement sur les huit criteres; pas encore une integration runtime.
- `integrated` : atlas accepte, plus registre runtime, test et journal de
  verification avec hashes et commande reussie.

Une image presente sur disque ou un JSON de normalisation ne suffit jamais
pour passer a `accepted` ou `integrated`. Un clip regenere remplace la preuve
active de ce clip en preservant l'historique. Une nouvelle generation apres
un rejet retourne a `generated`, pas a `accepted`.

Enregistrer une decision via un petit fichier JSON reel, puis :

```powershell
node scripts/enemy-batch-production.mjs record --event chemin/decision.json
```

Generation : `kind: generated`, `profileId`, `clipId`, `provider: OpenAI
ImageGen`, `generationId`, `actor`, `note` et `actualPromptText` ou
`actualPromptPath`. Un usage exact du prompt de la file peut etre atteste par
`usedQueuePrompt: true`. Le prompt reel est conserve separement du contrat;
le pipeline calcule les hashes et ne pretend pas que son prompt de file a ete
utilise lorsque la generation a recu un prompt different.
Acceptation : `kind: accepted` et `review` contenant `identity`, `anatomy`,
`direction`, `scale`, `clipSemantics`, `continuity`, `alpha`, `cellBounds`,
tous explicitement vrais apres inspection. Integration : `kind: integrated`
avec `runtimeEvidence` contenant `result: pass`, `command`, `registry.path`,
`test.path`, `log.path`. Les fichiers de preuve doivent exister; leurs hashes
sont verifies aux lectures suivantes. Aucun statut ne certifie du pixel 1:1.

## Contrats et normalisation

Les contrats sont indexes par archetype explicite, jamais par le champ
`behavior` cyclique du catalogue. L'oeuf a `sealed/opening/hatch/destroyed`;
les quatre autres profils du lot initial ont `idle/move/attack/death`.
Les familles futures ont leurs actions propres : reine et coup de queue,
tireur et recharge, synthetique et blessure non lethale, nage, tentacules,
charge ou liberation de parasites. Elles restent du travail en attente tant
que leurs vrais clips n'ont pas ete produits et branches.

Des exceptions d'archetype priment sur la famille generique : l'attaque du
Praetorian garde exactement deux bras principaux et sa couronne verrouillee,
sans petits bras de reine. Le Xenoborg vise/tire avec ses canons laser greffes
aux avant-bras; son clip `reload` garde cet ID mais anime une recharge des
condensateurs et l'evacuation thermique, jamais un changement de chargeur ou
une arme tenue en main. Ces exceptions s'appliquent aussi a leurs variantes,
sans modifier les contrats des cinq profils du pilote deja integres.

Sources : `assets/openai/sprites/frames/v66/batch-NNN/<profileId>/<clip>.png`.
Chaque source est exactement 2:1, 4 colonnes x 2 lignes, huit poses. Une
alpha native est conservee; sinon seul le magenta prouve est detoure par les
primitives V65. Le normaliseur n'invente, n'interpole, ne duplique, ne miroirise
et ne redessine aucun membre. Il conserve les masters et leurs hashes.

Tous les clips d'un profil partagent la meme resolution source, une echelle
unique, le pivot et des marges de cellule. L'atlas lossless WebP dispose d'une
grille dynamique de 4 colonnes et 2 lignes par clip. Les WebP de clips et GIF
de revue proviennent exactement de cet atlas, pas de generations differentes.
Les 8 poses doivent etre distinctes; les hashes ne prouvent toutefois ni la
qualite de l'animation, ni la fidelite anatomique.

Une correction manuelle d'echelle entre clips peut etre specifiee dans la
reference par `sourceScaleByClip: { idle: 1, move: 1.05 }`. Elle exige
`scaleCalibrationReview` avec `note`, `reviewer`, `reviewedAt` et `evidencePaths`.
Les preuves doivent mesurer une partie rigide comparable (crane, largeur de
base de l'oeuf), pas la boite englobante variable d'une pose accroupie ou morte.
Les facteurs sont positifs, explicites et inclus dans le hash du verrou. Le
normaliseur applique chaque facteur a toutes les poses de son clip, puis une
seule echelle finale globale; un seul reechantillonnage est effectue. Il
enregistre `sourceScale`, `appliedScale`, les mesures et les hashes de preuves.
Les valeurs absentes valent1. Aucune correction automatique par pose ou
reconstruction d'anatomie n'est pratiquee.

Par defaut, un sujet qui touche une limite de cellule est refuse. Le mode
`--safe-reassign-cell-fragments` autorise seulement un debordement connecte
dont >=90% de la composante appartient a une cellule, avec une excursion
maximale de 15% d'une dimension de cellule. Chaque transfert est documente
(coordonnees, nombre de pixels, hash RGBA, preuve de connexion). Aucun pixel
de premier plan n'est perdu ou redessine; deux sujets connectes de maniere
ambigue restent refuses. La revue visuelle demeure obligatoire.

La normalisation inscrit toujours `acceptanceStatus: pending-visual-review`,
`runtimeIntegrated: false`, `canonExact: false`. Seul l'historique de revue et
d'integration peut etablir l'avancement reel; les sources candidates, rejetees
et les atlas non acceptes ne doivent jamais etre publies par la build.
