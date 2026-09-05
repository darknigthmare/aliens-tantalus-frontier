# V73 — Albino Drone 056 / Albino Warrior 057 : diagnostic final

Statut : **candidats bloqués, aucune acceptation ni intégration faite par cet audit**.
Sources actives inchangées ; aucun seuil global, registre, STATE, runtime ou revue globale modifié.

## Périmètre réellement regardé

- 057 : quatre sources complètes, huit poses chacune ; surimpressions des cellules et composantes refusées ; dérivés move/death et comparaison agrandie du corps original après détourage.
- 056 : source move complète, sa planche normalisée existante, comparaison des poses 1 et 5. Ce n’est pas une recette complète des quatre clips 056.
- Contrat 057 : adaptation albinos du Warrior 005, pas une nouvelle espèce canonique. Identité attendue : crâne long à reliefs, corps bipède biomécanique maigre, bras/jambes appariés, tubes dorsaux, queue unique, palette ivoire et rose-taupe. Aucune fidélité canonique 1:1 n’est certifiée ici.
- Les agrandissements de diagnostic sont au plus proche voisin et ne deviennent pas des assets de jeu.

## 057 : cause exacte des rejets de cellules

Dimensions des quatre sources : 1774 × 887 RGB. Le découpage uniforme 4 × 2 place les séparations vers x444/887/1330 et y444. Certains appendices ou corps traversent cette grille alors que les poses restent séparables visuellement.

| Clip | Composantes refusées (indices internes, base zéro) | Attribution observée |
| --- | --- | --- |
| idle | aucune | Les huit poses restent attribuables par la grille actuelle ; cela ne valide pas le détourage ni l’animation. |
| move | 122 : 225 px, part propriétaire 86,67 % ; 413 : 2 138 px, 73,39 % | Extrémité de queue de la pose 4 et segment courbe de queue de la pose 8, pas deux ennemis fusionnés. |
| attack | 96 : 3 416 px, 84,22 % ; 137 : 347 px, 58,21 % | Queue de la pose 4 et prolongement de la mâchoire intérieure de la pose 5 vers la cellule suivante. |
| death | 0 / 1 / 3 / 16 : 39 282 / 34 475 / 31 608 / 29 097 px ; parts 88,64 / 82,45 / 78,82 / 67,18 % | Les quatre corps de la première ligne descendent sous y444 jusqu’à environ y497 ; les têtes de la deuxième ligne ne commencent qu’à environ y619. Pas de fusion entre ces deux rangées. |

Les valeurs détaillées, limites exclusives et comptages par cellule se trouvent dans `component-qa.json`. Les PNG `*.component-overlay.png` montrent la grille et les composantes refusées ; `*.rejected-components.png` isolent ces mêmes pixels.

Une attribution spécifique par séparateurs placés dans les intervalles vides a été testée :

- move : y444, x444/855/1265 ;
- attack : y444, séparateurs x444/845/1265 en haut ; en bas x515 au-dessus de y620 puis x444 sous y620, avec x845/1250 pour les autres limites ;
- death : y558, x432/850/1292.

Aucune composante issue du premier détourage n’est découpée, aucune pose ne chevauche une autre, et chaque déplacement est entier sans redimensionnement. Mais **cela ne suffit pas à rendre les dérivés acceptables** : le premier détourage détruit déjà du dessin.

## 057 : échec de conservation anatomique, dérivés refusés

Preuve directement regardée : `enemy-057.move1-source-vs-key-damage.png`.

Sur la pose 1 originale, le coude/avant-bras éloigné, le tibia avant et le pied arrière sont continus. Après le détourage existant, de grands morceaux disparaissent. Des contours de queue et de tubes sont également érodés. Il ne s’agit donc pas seulement d’une frange magenta.

La fonction actuelle `border_connected_magenta` de `scripts/process-v65-enemy-profile-art.py` reconnaît un magenta connecté au bord avec min(R,B)-G ≥ 25 et |R-B| ≤ 140 ; ses deux passes de bord utilisent min(R,B)-G ≥ 10 et |R-B| ≤ 165. Cette sélection est trop proche de la palette rose-taupe de ce dessin. Aucune modification de cette fonction n’a été faite.

Les trois essais `*.owned-rearranged.png` conservent exactement les pixels ayant survécu au premier détourage, **pas l’ensemble des pixels anatomiques du PNG original**. Les preuves ont été corrigées pour rendre cette distinction explicite : `reviewStatus: rejected-matte-damages-anatomy`, `safeAsProductionSource: false`, `rawAnatomicalPixelsPreserved: false`.

| Essai refusé | Pixels après premier détourage | Perte supplémentaire après seconde extraction | Découpage géométrique seulement |
| --- | ---: | ---: | --- |
| move | 214 519 | 15 764 | 8 poses, passe |
| attack | 249 897 | 8 232 | 8 poses, passe |
| death | 229 909 | 2 950 | 8 poses, passe |

Ces nombres supplémentaires ne mesurent pas toute l’anatomie déjà détruite lors de la première passe. Aucun certificat de conservation « lossless » de l’art original n’est délivré. Les trois PNG restent des **preuves rejetées**, jamais des sources à adopter.

Correction nécessaire : détourage natif/protégé avec conservation anatomique vérifiée, ou nouvelle source dont le fond est séparé sans ambiguïté. Une future préparation doit refaire l’attribution des poses à partir de cette matière intacte ; ne pas recycler les essais amputés. Ne pas réduire les exigences globales pour faire passer ces fichiers.

## Animation et identité

### 057

- Idle : variations faibles, forme générale cohérente avec le modèle fourni. Pas une validation anatomique détaillée des 32 poses.
- Move : huit poses différentes ne suffisent pas à former une marche. Entre les poses 1 et 5, la jambe de premier plan reste derrière et l’autre reste devant ; le cycle complet ne démontre pas le croisement / échange d’appui attendu. Flexions de genou et mouvements de queue présents, mais locomotion non acceptée.
- Attack : projection puis retrait visibles de la mâchoire intérieure, notamment aux poses 3–6. La pose 5 comporte une très longue tige fine à petite extrémité ; sa forme doit être comparée au modèle verrouillé avant acceptation. Le corps reste proche de l’attitude idle ; aucune attaque dynamique complète n’est certifiée.
- Death : effondrement réellement dessiné : station debout, flexion, appui sur les bras, agenouillement puis corps couché. La disposition de la première rangée empêche le découpage actuel. Ce clip n’est pas accepté à cause du problème de détourage et des mesures physiques encore absentes.
- Racines et échelle : non mesurées. Aucun centrage de bbox présenté comme appui anatomique, aucune échelle supposée et aucune revue physique fabriquée.

### 056

La comparaison `enemy-056-057-move-half-cycle-source-comparison.png` montre les poses 1 et 5 des deux profils. Pour 056 également, la jambe de premier plan reste derrière à mi-cycle ; les huit poses montrent flexion / levée de talon sans démontrer une alternance complète. La planche move normalisée consultée semble beaucoup plus intacte que celle détournée du 057 ; **la destruction de matte de 057 n’est pas attribuée à 056 sans preuve**.

L’animation de déplacement de 056 reste à corriger / revoir. L’existence de ses 32 poses normalisées ne vaut pas acceptation artistique de ses quatre clips.

## Sources actives et frontières de livraison

Tous les fichiers écrits par cette sous-tâche sont dans `docs/references/v73-next50-audit/056-057/`. Les sources batch-004 restent inchangées. Aucun atlas / metadata 057 accepté n’a été créé, aucun dérivé 056 modifié, aucun événement de génération / acceptation enregistré.

SHA-256 des quatre sources 057 :

- idle : `0cf38f5986871769d773ff674fd75599c8d9bf1de51618c1cc03abf571a9d142`
- move : `78fd107ace41e663459bd3d3ca9b3f023a5fdb4570dac91c144657eceb3c8624`
- attack : `d67345fda357822d434294ef05de9dc7c885597ea7f62f2b4f762f0c90963599`
- death : `395c7173fa43b09d6b3fe1a42f82c0c7af91bae7f88c0d5f46ba61b1d51fda22`

Scripts reproductibles du diagnostic : `diagnose-warrior-components.py`, `rearrange-warrior-reviewed-ownership.py` (explicitement REJECTED), `render-warrior-rejection-evidence.py`. Leurs sorties ont été relues ; les images de comparaison ont été réellement affichées. Le succès géométrique des huit poses n’est pas présenté comme un succès de production.
