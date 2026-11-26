# Archives historiques DLC — récupération du 26 novembre 2026

Cette sauvegarde conserve les octets des ZIP originaux. Les fragments sont des segments contigus de 10 Mio au maximum, sans recompression. Chaque manifeste conserve la taille et le SHA256 de l'original, ainsi que la taille, le SHA256 et l'identifiant Git de chaque fragment. ZIP_CONTENTS.json inventorie chaque membre dans son ordre d'origine avec son CRC32 et son SHA256. Le contrôle CRC de tous les membres a réussi avant publication.

La PR est une continuation de la sauvegarde #73, associée à Résurrection/Earth #68 et Blackout #54. Aucun contenu de ces archives n'est déclaré intégré au jeu par cette sauvegarde. Les occurrences PNG peuvent se répéter entre versions. L'égalité binaire au fichier source ne constitue pas une certification artistique 1:1.

## Reconstruction exacte

Depuis la racine du dépôt :

```sh
node archives/dlc-historical-recovery-20261126/reconstruct.mjs
node archives/dlc-historical-recovery-20261126/reconstruct.mjs alien-resurrection/v117 /tmp/tantalus-restored
```

La première commande vérifie les fragments et recompose le flux SHA256 de chaque original sans créer une copie supplémentaire. La seconde écrit le ZIP original et refuse d'écraser un fichier existant. Choisir dans INDEX.json l'identifiant de l'archive à restaurer. Aucune archive n'est décompressée automatiquement et aucun de ses scripts n'est exécuté.

## Périmètre et reste à traiter

INDEX.json maintient la liste complète des 284 candidats trouvés hors des 29 manifestes comparés au début de cette reprise. Cette comparaison initiale n'était pas une recherche exhaustive dans toutes les branches GitHub. Un candidat en attente peut donc déjà être sauvegardé ailleurs. Il reste en attente jusqu'à vérification de sa présence exacte ou à conservation effective de ses octets.

Les premiers packs Résurrection et les versions Earth/Blackout ont fait l'objet d'une recherche de leurs noms exacts dans les arbres main, Mer, Covenant et Blackout. Les reçus de chaque lot consignent la portée et les contrôles effectués. Les identifiants privés de stockage et les chemins locaux de travail ne sont pas publiés.

L'admission du dépôt utilise une liste fermée de chemins, tailles et SHA256 dans scripts/historical-archive-admissions-20261126.mjs. Les fichiers inconnus sous ce répertoire, les changements d'octets et les types de chemins incorrects sont refusés. La racine archives reste exclue du build public par le filtre déjà présent. Les reçus historiques des audits AVP/Fiorina restent inchangés ; une étape distincte prolonge seulement le vérificateur de chemins source.

Aucune suppression de fichier source persistant, fusion de PR ou modification de runtime n'est effectuée par cette sauvegarde.
