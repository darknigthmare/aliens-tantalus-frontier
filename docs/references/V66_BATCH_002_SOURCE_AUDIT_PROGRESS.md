# V66 lot002 - audit technique des sources candidates

## Cloture technique du lot : 2026-08-31 18:15:04 UTC

Root a relance l'audit apres les dernieres corrections : **87/87 sources
presentes, 50 extractions directes et 37 par reattribution courte prouvee,
zero extraction bloquee**. Les87SHA sont distincts. Toutes les sources sont
sur magenta opaque ;40presentent des indices conservateurs de contact de
bord. Aucun profil002 accepte ou integre. Les chiffres72/87 et les huit
blocages ci-dessous sont un instantane historique, pas l'etat final.

Le rapportJSON et les87contacts ont ete actualises sans modifier les masters.
Voir `V66_BATCH_002_DELIVERY.md` pour les20profils et les reserves artistiques.

Responsable : agent source_qa, 2026-08-31. Instantane provisoire : les artistes
continuent a produire des sources apres cette mesure. Relancer l'audit pour
actualiser les comptes, qui ne sont ni une acceptation ni une integration.

## Outil livre

`py scripts/audit-v66-batch-sources.py --batch batch-002 --probe-safe-reassignment`

Le script ne modifie aucun master. Il ecrit uniquement le rapport
`docs/references/V66_BATCH_002_SOURCE_AUDIT.json` et des contacts diagnostiques
numerotes dans `assets/openai/sprites/previews/v66/batch-002/source-audit/`.
Le SHA256 de chaque source est controle avant et apres la lecture.

Sont mesures : dimensions, mode RGB/RGBA, alpha reel, indices de damier opaque,
matte magenta, huit partitions nominales 4x2, hashes distincts, contact des
bords et resultat du vrai extracteur par defaut. La sonde optionnelle reutilise
en memoire les regles existantes de 90% d'appartenance et 15% de debordement
maximum. Elle ne normalise aucun fichier et ne change aucun seuil.

Ces mesures ne certifient ni huit sujets corrects, ni fidelite1:1, ni animation
fluide, ni bonne anatomie, ni ancrages physiques. Une extraction techniquement
possible reste un candidat en attente de revue et d'integration.

## Instantane mesure par source_qa : 2026-08-31 17:48:53 UTC

- 20profils,87planches attendues ;72presentes et15manquantes a cet instant.
- Les72masters sont sur magenta ;32extractions directes passent et32autres
  passent la sonde de court debordement.
- Huit sources etaient bloquees par appartenance de composant ambigue :
  Queen idle/move, Spitter death, Lurker attack/death, Carrier release,
  SpecimenSix move, FoundryDrone death. Ces resultats sont horodates :
  les artistes ont continue ensuite, root effectue l'audit global final.
- Aucun profil du lot002 accepte automatiquement ou ajoute au runtime.

## Complement Foundry Crusher

Voir `V66_BATCH_002_FOUNDRY_CRUSHER_REVIEW.md` :40racines physiques mesurees
et inspectees, atlas candidatRGBA40poses effectivement produit,5clips etGIF.
Trois editions ImageGen supplementaires corrigent partiellement la couleur
parasite sur move/death. Des traces roses subsistent ; ce profil n'est PAS
accepte. Les anciens masters et les preuves de generation sont conserves.
`--profile enemy-026-foundry-crusher --check` passe, comme le lot001inchange.
20testsNode cibles (production, normaliseur, audit sources) passent.

Le contact NeuroXeno idle a ete inspecte visuellement : les queues des poses4/8
depassent legerement a gauche de leur cellule nominale, sans amputation du
master. La sonde confirme une appartenance courte prouvable. Cela ne valide
pas la continuite du cycle, son pivot ou son echelle.

## Correction isolee et regressions

Le normaliseur derive maintenant `V66_BATCH_NNN_ANCHOR_REVIEW.json` du batchId
valide. Le lot002 ne peut plus chercher ses racines dans le fichier001.
Le chemin001, sa structure de preuve et tous ses pixels sont inchanges.

Verifications effectuees :

- 23tests Node cibles passes (dont les enveloppes Python normaliseur/audit).
- 10tests Python du nouvel audit et 20tests Python du normaliseur passes.
- `py scripts/process-v66-enemy-batch.py --batch batch-001 --check` :
  5profils,160poses, aucun finding.
- `node scripts/enemy-batch-production.mjs check` : OK ; preuve de38planches
  generees a cet instant, incluant20du lot001. Le fichier d'etat n'a pas ete
  modifie par cet audit ; des sources candidates existent sans enregistrement.

Pas de test navigateur, pas de commit, pas de deploiement effectues ici.
