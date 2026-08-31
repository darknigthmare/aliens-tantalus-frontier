# V66 lot002 - Foundry Crusher : candidat normalise, non accepte

Revue : Codex finish_source_review, 2026-08-31.

## Etat final apres corrections OpenAI ciblees

Trois editions via l'outil ImageGen integre, sans API ni retouche procedurale :
`move-r2`, `death-r2`, puis `move-r3`. Prompts et evenements dedies sont
sauvegardes ; chaque resultat a ete copie immediatement, et chaque source
remplacee reste sous `rejected/`. Les positions et identites ont ete controlees
visuellement ; les seize racines move/death puis les huit racines move-r3
ont ete reverifiees sur les contacts marques et leurs nouveauxSHA.

Sources actives :

- move-r3 : `d2c2298d564cf34a3634cc87bc4f5281f232a98d893daab0222e33c0f95ac110`.
- death-r2 : `5ac18d2a917b208ba42181583051be803b01718b676b683a8130559d4cdc08d8`.
- Les autres clips restent idle-r2, attack initial, charge-r3.

Atlas final candidat SHA256 :
`1907ae2541aa92fb5a10feb2a1cd9db1a360f3613f1ebcb0cf3babcbf2d51329`.
Preuve d'ancrage des40poses SHA256 :
`614982015ac098a490273b2f4055429f179bf0e5696c7a676fa247a7bc8b332d`.
Reconstruction et `--check` passent :40poses uniques, aucunefinding technique.
Le detourage strict a retire4247pixelscore et3875pixelsAA, soit8122pixels.

Les huit poses normalisees de marche et de mort ont ete inspectees. Le
diagnostic opaque rose descend de167a142indices, avec marche1/2 de16/19a4/7.
Il reste des points roses au cou et aux articulations : mort2/3 comporte7/12
indices, charge6 en comporte10. La correction a donc apporte une amelioration
partielle, pas un detourage parfait. Les petites variations de volume et la
fluidite en lecture animee restent aussi a accepter. Le candidat conserve
`pending-visual-review`, `runtimeIntegrated:false` et `canonExact:false`.
Ne pas declarer ce profil pret au runtime ni masquer ces reserves.

## Premier candidat et revue physique initiale (historique)

- Les cinq masters actifs `idle`, `move`, `attack`, `death`, `charge` ont ete
  inspectes visuellement : 40poses, toujours vers la droite. La revision idle-r2
  n'a plus l'appendice dorsal parasite ; charge-r3 garde les appuis au sol,
  les compressions5/6 puis les recuperations7/8.
- Quarante reperes de cage thoracique derriere l'epaule ont ete mesures
  manuellement, projetes sur leur ligne d'appui et verifies une seconde fois
  sur les cinq contacts annotes. La queue et la crete ne fixent jamais rootX.
  Les coordonnees incluent le garde de trois pixels du detourage et une
  incertitude manuelle de six pixels source.
- `V66_BATCH_002_ANCHOR_REVIEW.json` contient les40reperes, les cinqSHA source
  et les chemins des contacts. Cette revue valide l'ancrage physique seulement.
- La commande suivante a produit un vrai atlas RGBA lossless de1024x2560,
  cinqclips WebP1024x512 et leurs apercus GIF :

```powershell
py scripts/process-v66-enemy-batch.py --profile enemy-026-foundry-crusher --safe-reassign-cell-fragments --remove-enclosed-magenta-matte --remove-enclosed-magenta-aa-fringe
```

Atlas : `assets/openai/sprites/normalized/enemy-profiles-v66/enemy-026-foundry-crusher.webp`.
SHA256 : `43a08d014da0f848a8842d8a34e2a8471ea0d51ec753205814dd96c5ca8b23cc`.
Metadonnees : `assets/openai/sprites/metadata/v66/enemy-026-foundry-crusher.json`.
Statut : `pending-visual-review`, `runtimeIntegrated:false`, `canonExact:false`.
Les pixels source ont ete conserves ; aucune pose interpolee ou dupliquee.

## Limites observees sur le premier candidat (historique)

L'atlas a ete inspecte dans son ensemble, puis les deux premieres poses de
marche en zoom3x. Des marques roses persistent sous la crete, et plus
ponctuellement pres des membres dans les autres clips. Le sujet verrouille
est noir/brun : ces couleurs ne sont pas une intention de design validee.

Les DEUX options existantes ont deja ete utilisees :4834pixels de coeur magenta
et4008pixels de frange dans le rayon strict de2pixels source, soit8842au total.
L'algorithme n'a pas ete elargi. Le test diagnostique `alpha>=128`, `R-G>50`,
`B-G>50` trouve167pixels fortement colores dans l'atlas ; il s'agit d'indices
de revue, pas d'un masque autorisant une suppression automatique. Les poses
marche1/2 contiennent respectivement16/19indices et mort3 en contient14.
Certaines couleurs sont opaques et ne sont donc pas seulement du RGB cache
sous alpha nul. Ne pas declarer le detourage visuellement propre.

La frappe et la charge presentent aussi des variations de volume apparent a
revoir en lecture animee ; les reperes anatomiques ne certifient ni une
fluidite finale, ni une equivalence canonique1:1. Ces points empechent
l'acceptation artistique et l'integration runtime a ce stade.

## Verifications

- `--profile enemy-026-foundry-crusher --check` :40poses, aucunfinding technique.
- `--batch batch-001 --check` :5profils,160poses, aucunfinding ; pilote inchange.
- `node --test tests/enemy-batch-production-v66.test.mjs tests/enemy-batch-normalizer-v66.test.mjs` :19tests passes.
- `scripts/render-v66-source-anchor-review.py` rend les cinq contacts depuis
  les coordonnees manuelles et refuse unSHA source change. Il ne modifie
  ni master, ni statut de revue.

Aucun evenement accepted/integrated, aucune modification runtime, aucun
commit ou deploiement. Les sources restent issues d'OpenAI ImageGen ; prompts
et evenements dans les dossiers `v66-batch-002-prompts/events` du profil026.
