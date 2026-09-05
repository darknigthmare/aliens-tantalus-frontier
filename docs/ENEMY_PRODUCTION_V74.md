# Production ennemis V74

Suite du lot V73 figé de50 profils,007 à057 sauf020. Cette passe corrige et intègre des profils existants ; elle ne prétend pas terminer les571 ennemis ni un jeu commercial complet.

## Corrections livrées

- **016 Burster** : atlas dédié32 poses, corps88×88, rendu256×256 sans étirement. Télégraphe de compression0,5s, une seule explosion, fin de pression puis mort tenue. Les obstacles, cibles, équipiers, coques et restaurations sont testés. L'effet de souffle reste composé des particules du moteur ; une planche bitmap d'explosion dédiée reste à produire.
- **050 Korari Stalker** : atlas dédié32 poses, quadrupède corps96×60, rendu288×288. Anticipation3/12s, morsure à4/12s, bond borné, cibles verrouillées. Portée symétrique, coques larges traitées depuis leur surface et mort persistante après restauration. Identité originale du projet, pas créature canonique1:1.
- **Bestiaire** : les3ou4silhouettes partagent un facteur responsive et une seule ligne de sol. Légende séparée et lisible. Vérification à1280×720,1280×900 et390×844.
- **049 Wild Boar Host** : correction mesurée du rétrécissement relatif de l'attaque, à partir des mêmes axes anatomiques. Une seule application du facteur résiduel ; aucun PNG source modifié. Le rangement commun réduit les autres clips de 4,6 %, l'attaque restant pixel-identique. Le candidat conserve une frange violette sombre : pas d'acceptation finale ni d'intégration.
- **054 Albino Facehugger** : deux vrais essais OpenAI de nettoyage d'attaque conservés avec prompts exacts et empreintes. R1 refusé pour faux damier transparent ; R2 refusé pour ajour entre doigts rempli de matière opaque rose/ivoire avec résidu violet. Ni la source ni l'atlas actifs ne sont remplacés.

## État vérifiable et travail restant

L'état courant est calculé dans `references/V74_ENEMY_PROGRESS.json` par `node scripts/enemy-progress-v74.mjs --check`. Le snapshotV73 est préservé comme historique. Sources présentes, provenance vérifiée, normalisation technique et intégration finale sont comptées séparément.

Les deux nouveaux profils intégrés rejoignent055 dans ce lot : **3 sur 50 intégrés,47 encore non finalisés**. Il y a216 sources présentes,41 normalisations actuelles et4 anciens prompts exacts encore manquants pour048. Ces nombres ne certifient ni alpha final ni fidélité graphique. Globalement, le manifeste complémentaire contient10 atlas / 320 poses (9 V66 + Facehugger V65), sans compter deux fois le manifeste historiqueV64.

Priorités restantes : franges049 ; ajour054 ; provenance048 à régénérer ; contrôles artistiques et contrats jouables des autres profils ; effet bitmap d'explosion016. Les autres dettes du hub, PNJ, props, véhicules, campagnes et conversations restent ouvertes. Aucun statut `complete` global n'est ajouté.

## Preuves

- `references/v74-enemy-fixes/016/README.md` et `050/FINAL_QA.md` : recettes du vrai moteur dans des scènes isolées, pas une partie entière de campagne.
- `references/v74-enemy-fixes/catalog/README.md` : parcours réel du bestiaire et captures6 tailles/sujets.
- `references/v74-enemy-fixes/049/FINAL_QA.md` : échelle corrigée, réserve alpha conservée.
- `references/v74-enemy-fixes/054/README_R2_BLOCKED.md` : refus de la retouche après le vrai détourage final.
- `references/v74-enemy-fixes/release/` : décisions individuelles et renouvellement des preuves des anciens atlas inchangés.

Les compétences ImageGen et vérification navigateur ont imposé de conserver les essais ratés hors runtime et de contrôler les images réellement affichées. Les sources, prompts, candidats et diagnostics restent hors build public. Aucun fichier utilisateur préexistant n'a été supprimé.
