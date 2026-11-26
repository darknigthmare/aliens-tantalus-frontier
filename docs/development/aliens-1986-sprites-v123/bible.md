# Aliens (1986) — Bible de suivi V123

**Deux nouveaux PNG natifs ; le catalogue passe de 164 à 166 images.** La sentinelle reçoit sa vue frontale manquante et le Warrior sa pose de marche vers la droite. Chaque fichier contient un seul objet ou personnage, avec son alpha d’origine.

| Identifiant | Dimensions | Octets | Raccord dans le rendu existant |
| --- | ---: | ---: | --- |
| `sentry-aim-front` | 1536 × 1024 | 1 617 328 | Secteur frontal 2 du sélecteur V118 ; huit directions désormais fournies |
| `warrior-walk-right` | 1536 × 1024 | 1 802 161 | Sélecteur V116 lorsque le Warrior possède une route ; une pose statique |

## Intégration et portée

Les deux identifiants étaient déjà reconnus par les sélecteurs historiques. Le supplément enrichit leur registre d’images. Les sources de rendu V116 et V118 restent identiques. Le repli procédural pendant le chargement ou après échec demeure disponible. La pose du Warrior n’est pas un cycle complet de marche ; la simulation, la géométrie, les combats, la progression et les sauvegardes gardent leurs règles.

## Références et fidélité

La vue frontale utilise le sprite avant-droit V118 et une photographie de la sentinelle de production publiée par Propstore. La pose du Warrior conserve l’identité, la tête striée, les proportions et la caméra du sprite idle existant. Les silhouettes, pivots, pieds et détails ont été inspectés. Les vues nouvelles et leur mouvement restent interprétatifs : **la fidélité exacte 1:1 au film n’est pas certifiée**.

Les sept manifestes V116 à V122 sont conservés avec leurs empreintes. Les deux PNG sont copiés octet pour octet depuis leur sortie native. Aucun redimensionnement, détourage ou changement d’alpha par script n’est effectué. Le maximum d’alpha mesuré vaut 254, et des franges de faible opacité restent présentes ; cette propriété réelle figure dans le manifeste et le registre de génération.

## Fichiers de reprise

[Galerie](index.html) · [Bible complète JSON](bible.json) · [Bible de suivi](bible.md) · [Manifeste](manifest.json) · [Prompts et provenance](generation-ledger.json) · [Références](references.md) · [Vérifications](verification.json).

## Vérifications

Les empreintes, dimensions, alpha et limites alpha ≥ 128 des deux originaux sont mesurés. Les résultats complets sont archivés dans `verification.json`.

- **665/665 tests historiques** et **41/41 tests d’intégration** réussis. Les 350 assertions de présentation, dont 22 V123, sont incluses dans ces 41 tests.
- **33/33 contrôles Chromium réel** réussis : 18 dans le contexte normal, 15 lorsque les requêtes des deux nouveaux PNG sont volontairement interrompues ; 14 états préparés par contexte.
- Huit directions de sentinelle, interpolation vers la face, marche du Warrior en direct et en miroir, priorités idle/attaque/mort, échelle et ancrages confirmés. Les secours de chargement et d’échec reproduisent les pixels du dessin V114 natif.
- Admission des 166 PNG et des 1 159 fichiers de récupération historique réussie. Build DLC isolé V123 réussi ; les archives de récupération restent exclues du build.
- Le contrôle global du dépôt reste bloqué par les 105 JPG historiques absents de ce checkout partiel. Sa règle est conservée ; le résultat du build DLC isolé ne vaut pas validation du build global.

Les états de test sont explicitement préparés dans des sessions natives. Ces contrôles ne constituent ni une campagne complète ni un cycle d’animation complet, et ne certifient pas la fidélité artistique 1:1.

## Manques maintenus

Les nouvelles générations ne récupèrent pas les octets historiques signalés perdus. Les listes de 20 PNG, 53 documents et 19 sources de poses ne sont pas clôturées ; elles peuvent se recouper. Hicks blessé, les poses attaque/mort du Facehugger, les cycles complets, les familles de terrain et les parcours encore absents restent ouverts dans la bible.

## Continuité des huit catégories

La bible JSON conserve les personnages, lieux, armes, props, véhicules, vaisseaux, terrains et planètes du catalogue V122. Ses 164 enregistrements d’images restent identiques ; les deux entrées V123 sont ajoutées à la fin. Le Warrior passe de trois à quatre poses disponibles, avec une seule image par pose. Les huit orientations de sentinelle utilisent toujours le même sélecteur et ses miroirs. Les 25 salles, 20 liens, 40 seuils, 25 portes internes, 202 volumes et 135 placements de props ne sont pas augmentés par ce supplément.

Les reçus de vérification antérieurs restent rattachés à leur version. Les compteurs de cycles complets validés et de sprites certifiés exacts au film restent tous deux à zéro.
