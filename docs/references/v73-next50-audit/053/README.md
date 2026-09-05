# Albino Ovomorph053 — candidat normalisé, non accepté

Revue finale de cette passe, 2026-09-05. **Les contrôles techniques passent; les raccords artistiques ne passent pas encore.** Aucun runtime, STATE ou registre partagé modifié par cette sous-tâche. L’agent principal a conservé les prompts exacts et archivé les deux anciennes sources rejetées. Aucune revendication de modèle albinos officiel ou de fidélité1:1.

## Livré

Quatre clips de huit poses originales distinctes : sealed6fps en boucle, opening8fps, hatch10fps et destroyed10fps sans boucle. Masters actifs1774×887, atlas RGBA sans perte1024×2048, cellules256×256,32 poses uniques et aucune interpolation ni duplication ajoutée.

Atlas SHA256 : `07d6fc48fc446fcf8ec6b806e9fc2cdfa088f242b1c1dcd6e586d2844e826169`.
Packscale unique :0.452138331.
Facteurs par clip : sealed1; opening1.014463; hatch1.191748; destroyed1.006148.

Les32 racines utilisent le centre de coque basse et le vrai appui visible, incertitude±4pixels source. Les appuis normalisés atteignent tous la limite y240; les3pixels de padding alpha nul de l’extracteur sont retirés par l’option explicite `--trim-transparent-padding`, sans déplacer la racine et sans retirer de pixel visible.

La calibration comporte27 sections transversales de coque basse, à100pixels au-dessus de l’appui, vérifiées sur les sources annotées : toutes les poses sealed/opening/hatch, et seulement les trois premières poses destroyed dont la coque basse est encore intacte. On ne calibre ni sur les pétales écartés, ni sur les restes aplatis. Les petites flexions du matériau restent dessinées, avec une seule correction uniforme par clip.

## Corrections et défauts réellement constatés

- OpeningR1 avait une contraction brusque de coque entre les poses4 et5 : section basse227,228,229,232 puis207,206,205,201pixels. Cette source a été rejetée et archivée par l’agent principal.
- OpeningR2 actif corrige ce défaut interne : section basse238 à246pixels, sans rupture à mi-planche. Le raccord sealed→opening est cohérent à l’échelle commune.
- HatchR2 actif commence déjà ouvert, ne referme jamais l’œuf et ne contient aucun facehugger dessiné. La bosse rose de la pose2 est la membrane interne; le parasite doit rester un acteur distinct.
- Le pétale de hatch pose3 déborde de21pixels source sur la cellule précédente. L’attribution majoritaire vérifiée le conserve intégralement dans la bonne pose; aucun pétale coupé, collage avec la pose voisine ou clipping de cellule dans l’atlas final.
- **OpeningR2→hatchR2 reste bloquant :** largeur visible146→180pixels au raccord (+23%), avec un changement de volume et de dessin des lèvres. La coque est calibrée, mais la fin de l’ouverture ne rejoint pas encore la véritable forme à quatre pétales étalés de la première éclosion. Il faut une future ouverture dont la dernière pose rejoint exactement ce début, sans rétrécir sa coque.
- **Hatch→destroyed reste bloquant :** destroyed commence fermé. Faire entrer un œuf déjà ouvert dans la pose1 de mort le refermerait artificiellement. Il faut une entrée de mort contextuelle réellement vérifiée ou une planche de destruction depuis l’état ouvert. Aucun raccourci runtime n’est appliqué ici.

Voir `transitions.jpg` : les quatre raccords sont rendus à la même échelle, sur le même canevas et au même appui. Ne pas accepter le profil avant correction des deux derniers points. L’agent principal a choisi de conserver ce candidat non accepté dans cette livraison, sans lancer un R3 maintenant.

## Transparence et contrôle visuel

Les32 poses ont été inspectées sur `atlas-dark.jpg` et `atlas-pale.jpg`. Aucun fond blanc parasite ou halo magenta évident observé. Les seuils stricts donnent0pixel magenta restant; aucune neutralisation supplémentaire ni suppression de noyau magenta interne n’a été nécessaire. Cette mesure ne prétend pas détecter toute couleur artistique possible. Les sources PNG n’ont pas été retouchées par la normalisation.

Les quatre références du profil001 ont été examinées et restent inchangées. Taille biologique/collisions dans une vraie salle restent à vérifier lors d’une future intégration; ne pas convertir la cellule256px en hitbox ni utiliser la largeur maximale des pétales comme diamètre du corps.

## Vérification navigateur réelle

Lecteur de diagnostic autonome `index.html` / `player.mjs`, qui réutilise les fonctions de timeline/calibration du lecteur V66 existant. Testé sur127.0.0.1:4173 dans la session indépendante `atf-v73-egg`, fermée après QA.

Les indices0–7 ont été observés pour chacun des quatre clips à100% de vitesse. Sealed boucle; opening, hatch et destroyed terminent et restent sur la pose8. Miroir gauche contrôlé sur hatch. Canvas de contenu256px,258px avec sa bordure CSS. Aucun overlay d’erreur ou erreur navigateur observé. Capture réelle : `browser-hatch.png`.

Cette page n’accepte, ne publie ni n’intègre l’ennemi. Le lecteur valide la lecture des images, pas le combat, la navigation ou les collisions.

## Reproduction

```powershell
py -3 scripts/process-v66-enemy-batch.py --profile enemy-053-albino-ovomorph --anchor-review docs/references/v73-next50-audit/053/anchor-review.fragment.json --scale-review docs/references/v73-next50-audit/053/scale-review.fragment.json --safe-reassign-cell-fragments --remove-enclosed-magenta-matte --remove-enclosed-magenta-aa-fringe --remove-magenta-spill --trim-transparent-padding
py -3 scripts/process-v66-enemy-batch.py --profile enemy-053-albino-ovomorph --check
```

Les fragments autonomes et les quatre overlaysR2 sont liés par SHA256 dans les métadonnées. Conserver leurs fins de ligne LF. Un master remplacé exige une nouvelle mesure de ses appuis et de sa coque; ne pas changer les registres globaux pour finaliser ce profil.

Les suffixes `source-inspection-r1/r2` et `source-diagnostic-r1/r2` désignent les passes d’audit : l’auditR1 utilisait déjà hatchR2, mais encore openingR1. Le renderer retrouve l’ancien opening dans son archive pour reproduire la première preuve.

## Tests du pipeline et non-régression

Le normaliseur et le validateur Node autorisent désormais **sealed uniquement pour animationFamily=egg** comme référence d’échelle; toutes les autres familles conservent idle et leurs preuves historiques. Aucun facteur arbitraire ou baseline non mesuré n’est autorisé.

- `--check`053 :PASS32 poses,0finding; reconstruction des pixels depuis les sources, racines, mesures et options enregistrées.
- Validation Node des sources/échelle/ancrages053 :PASS, sans événement d’acceptation.
- Tests Python historiques :36PASS.
- Tests Python autonomes/padding/œuf :11PASS, exécutés par le wrapper Node.
- Suite Node ciblée :81tests,80PASS,1ignoré car le poste ne permet pas de créer le symlink de la fixture.
- Non-régression `--check`001,016 et020 :PASS32 poses chacun.
- `node --check player.mjs` et `git diff --check` des fichiers de pipeline :PASS.
