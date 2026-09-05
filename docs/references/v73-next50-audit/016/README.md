# Burster016 — récupération technique et revue artistique V73

Revue du 2026-09-05. **Candidat normalisé, pas ennemi accepté ni intégré.** Les quatre masters OpenAI existants sont conservés byte-for-byte. Aucun registre partagé, contrat runtime ou état de production modifié par cette sous-tâche. Aucune fidélité1:1 certifiée.

## Livré et vérifié

- Quatre clips de huit poses distinctes : idle6fps, move12fps, attack12fps, death10fps; aucune duplication ou interpolation ajoutée.
- Les32 racines thorax/appui ont été réexaminées sur les sources et les quatre planches annotées. Incertitude déclarée±10pixels source. La méthode erronément décrite comme Prowler aérien dans l’ancienne preuve est remplacée par la vraie convention quadrupède/appui au sol.
- Douze mesures manuelles de la même corde longitudinale de carapace crânienne, trois par clip,±6pixels source. Les boursouflures, la mâchoire ouverte, les membres et la queue ne définissent pas l’échelle. Facteurs relatifs à idle :1;1.047649;1.040246;1.052948.
- Registre de preuves autonome : `anchor-review.fragment.json` et `scale-review.fragment.json`, chacun limité à ce seul profil. Les quatre JPG annotés sont signés dans les métadonnées. Modifier une source, une mesure, une racine ou une image de preuve invalide la validation.
- Atlas RGBA sans perte1024×2048,32 cellules256×256; packscale0.474857258. SHA256 : `3ad1538aef3dd62354950f7cf7f63e875ff2cd6688bfb06c8f2fa9abf80ff3df`.
- Détourage strict :15881pixels de noyau magenta et6215pixels de frange AA retirés;33pixels de contamination magenta stricte neutralisés après redimensionnement;0restant au seuil strict. Cela ne signifie pas zéro teinte sombre violette artistique. Les valeurs préalables d’un ancien atlas ne sont pas comparables pixel-à-pixel après recalibration.
- `--check` reconstruit l’atlas en mémoire à partir des masters et des options enregistrées :PASS32poses,0finding. Les sources PNG n’ont pas été retouchées.

## Vérification navigateur réelle

Lecteur local existant `docs/references/v66-batch-002-player/index.html` sur127.0.0.1:4173. Session indépendante `atf-v73-burster`, fermée après contrôle. Canvas affiché à256pixels dans le DOM de diagnostic, sans modifier le lecteur.

Les quatre clips ont chacun parcouru les indices0–7 à100% de vitesse. Idle et move continuent en boucle; attack et death se terminent sur7 et se mettent en pause. Le miroir gauche a été contrôlé sur la pose de pression7/8. Aucun overlay d’erreur ni erreur navigateur observé. Captures : `browser-idle.png`, `browser-attack-pressure-left.png`, `browser-attack-full.png`. Ce lecteur indique explicitement «non intégré par cette page» : ce n’est pas une preuve de combat ou de collision en jeu.

Visuellement, l’identité reste celle du même quadrupède olive/noir à poches jaune-vert, queue unique et crâne bombé. Les membres alternent en locomotion et les huit poses sont lisibles; aucune glissade liée à un changement de pivot de queue n’est introduite. La résolution de la photographie NECA et les écarts de matière ne permettent pas une promesse1:1.

## Condition restante avant acceptation

**Attack est une préparation/compression, pas une explosion dessinée.** La pose7/8 est le maximum de gueule ouverte/pression; la dernière pose se tasse et ne constitue pas à elle seule une détonation. Il faut soit remplacer ce clip par une vraie planche d’explosion, soit le connecter explicitement à un effet et une mort du runtime au moment de pression (index6, environ0.5s à12fps). Ne pas compter la fiche comme terminée avant d’avoir vérifié cette action réelle et ses collisions.

Le code actuel appelle immédiatement `detonateEnemy` au contact dans `src/game-v51-runtime.js` et `src/game-v52-runtime.js`. Une future correction doit préserver un télégraphe visible, une seule explosion, puis l’état mort; vérifier les routes de dégâts joueur, véhicule et équipier séparément. La méthode actuelle route un non-véhicule vers `damagePlayer`, ce qui doit être revu pour les membres d’escouade. Aucun correctif runtime n’est inclus ici.

Une boîte physique mondiale et une comparaison en salle avec le joueur restent à mesurer au niveau du corps, hors queue. Le cadre complet256px ne doit pas être pris pour la taille biologique.

## Reproduction

```powershell
py -3 scripts/process-v66-enemy-batch.py --profile enemy-016-burster --anchor-review docs/references/v73-next50-audit/016/anchor-review.fragment.json --scale-review docs/references/v73-next50-audit/016/scale-review.fragment.json --safe-reassign-cell-fragments --remove-enclosed-magenta-matte --remove-enclosed-magenta-aa-fringe --remove-magenta-spill
py -3 scripts/process-v66-enemy-batch.py --profile enemy-016-burster --check
```

Ne pas fusionner ces fragments dans les documents globaux : leurs chemins exacts sont enregistrés sous `metadata.normalizationReviewPaths` et sont utilisés par les validations Python et Node d’acceptation. Préserver LF pour les JSON liés par empreinte.

## Durcissement du pipeline livré en parallèle

`--anchor-review` et `--scale-review` exigent un profil explicite, des JSON repo-relatifs confinés, un seul profil et le bon batch, sources/mesures/racines/preuves strictement valides. Le défaut historique est inchangé. `acceptedEvidence` appelle déjà le validateur de revue d’échelle; son adaptation couvre désormais aussi la preuve d’ancrage autonome, sans modification de STATE.

Option supplémentaire demandée pour049/050 : `--trim-transparent-padding`, désactivée et absente des métadonnées historiques par défaut. Elle recadre uniquement les marges de alpha exactement nul avant le packing à racine physique, conserve alpha1, enregistre le rectangle source resserré et les marges supprimées pour chaque pose et rejoue l’opération dans `--check`. Elle ne déplace pas un appui pour accommoder trois pixels de padding vide. Cette option n’a pas été appliquée à016 ni aux atlas déjà publiés.

Tests :36tests Python historiques PASS;10tests Python autonomes/padding PASS; contrôle de non-régression du vrai profil020K-Series PASS32poses. La suite Node ciblée couvre l’acceptation et ses preuves, incluant le wrapper des tests Python; le test de symlink est ignoré lorsque les privilèges Windows ne permettent pas de créer un lien symbolique.
