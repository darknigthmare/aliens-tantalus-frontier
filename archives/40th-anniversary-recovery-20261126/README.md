# Alien 40th Anniversary — archives sources récupérées

Ce dossier conserve les **six archives originales v0.1.0 à v0.6.0**, soit **174 243 911 octets**. Elles couvrent les six épisodes du DLC. Les octets originaux sont divisés en 20 fragments de 10 Mio maximum ; aucun ZIP n'est recompressé ou modifié.

## Contenu

- `MANIFEST.json` : noms, tailles et SHA-256 des six originaux ; tailles, SHA-256 et SHA Git de chaque fragment.
- `parts/` : fragments des archives originales.
- `documents/` : 13 documents de la version v0.6.0, extraits sans modification pour lecture directe, dont les deux codex, les changements, les sources et les décomptes.
- `restore.py` : reconstruction vérifiée, refusant de remplacer un fichier différent.

## Reconstitution

Depuis ce dossier :

```sh
python3 restore.py /chemin/vers/une/sortie
```

Le script vérifie chaque partie, puis la taille et le SHA-256 de chaque ZIP complet avant de rendre le fichier disponible. Une archive déjà présente et identique est conservée ; une archive différente provoque un arrêt.

## Vérifications

Les six ZIP ont passé leur vérification CRC intégrale ; aucune entrée à chemin dangereux ni lien symbolique n'a été trouvée. Les empreintes complètes et des fragments sont relevées. La reconstruction physique des six originaux est vérifiée avant publication.

Le reçu distant précise la vérification finale des objets Git. Ces contrôles prouvent la conservation des octets. Ils ne constituent pas un essai de jeu.

## Limites et reprise

L'ancien commit local d'intégration `1f39f0f2c41e6a8c80eca4fd5481b92ac372972d` et son bundle préparé ne sont pas retrouvés dans l'environnement repris. Ce dossier restaure les six sources historiques ; il ne prétend pas restituer ce commit d'intégration.

Aucun menu, moteur, renderer ou fichier actif n'est remplacé. L'intégration de la v0.6.0 et l'admission exacte des sources doivent être traitées avant une fusion destinée au jeu. La fidélité visuelle 1:1 n'est pas certifiée.

Aucune archive locale ni persistante n'a été supprimée par cette publication. Une suppression ultérieure exige la correspondance exacte du fichier concerné avec les originaux et les objets distants vérifiés.

