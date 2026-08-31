# V66 lot002 - Lurker : correction des chevauchements

Deux editions via OpenAI ImageGen integre, sans API ni retouche procedurale :
`attack-r2` et `death-r2`. Les huit poses par clip ont ete conservees et reduites
dans leurs cellules4x2 ; les silhouettes completes, queues comprises, sont
visibles. Les masters precedents restent sous `rejected/attack-pre-r2.png`
et `rejected/death-pre-r2.png`. Prompts et evenements sont sauvegardes.

Le controle direct `audit_image` sur les deux nouveaux masters1774x887RGB
passe sans reassignment : huit poses extraites et distinctes par clip,
aucun contact aux bords, aucunfinding technique. LesSHA ont ete compares
avant et apres lecture. Aucun rapport global n'a ete reecrit.

- Attaque SHA : `33f6091cee6dcec3d53fd61bf639b5f3264996c74ff65b6ac213b872cc25f6af`.
- Mort SHA : `4abb55a2ba39aead122340e683235807f5bfe7a8e4fd514aabcc07ed5bbf9a1f`.

Les marges demandees de15a18% ne sont PAS partout obtenues : minimum4,5%
pour l'attaque et8,56% pour la mort. Les debordements bloquant l'extraction
sont corriges, mais il ne faut pas presenter la consigne de marge comme
integralement respectee. La reduction des sources exige encore une mesure
d'echelle entre idle/move et attack/death, ainsi que des ancrages physiques
et une revue des cycles avant acceptation. Pas de certification1:1, aucun
atlas011 accepte ou integre. Aucune modification deREFS/STATE/QUEUE/runtime.

Preuve detaillee : `V66_BATCH_002_LURKER_GEOMETRY_REVIEW.json`.

