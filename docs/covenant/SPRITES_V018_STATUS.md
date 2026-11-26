# Covenant V018 — suivi de production

Le lot contient **un sprite retenu au catalogue** et **un candidat documentaire à réviser**. Le sas latéral orange est retenu ; la grande porte terminale reste hors production en raison de son rapport de silhouette et de son graphisme rouge. Les deux autres essais de grande porte sont identifiés dans le manifeste et leurs PNG restent exclus.

## Comptes

| Périmètre | Nombre |
|---|---:|
| PNG historiques de production préservés | 154 |
| Nouveau PNG retenu au catalogue | 1 |
| Production cumulée | 155 |
| PNG dans le rendu, inchangés | 81 |
| PNG de production au catalogue | 74 |
| Candidat documentaire nouveau, hors production | 1 |
| Fichiers récupérés historiques préservés | 46 |
| Candidats historiques compris dans la récupération | 16 |
| Familles de décor déclarées terminées | 0 |
| Certifications 1:1 | 0 |

## Contrôles effectués

Les mesures des PNG originaux figurent dans [alpha.json](qa/v018/alpha.json). Les résultats suivants ont été obtenus sur le lot local préparé à partir de `dc9d0a5bb36266ab0baad616644198b856141c61` ; ils ne constituent pas un résultat CI distant.

| Contrôle | Résultat |
|---|---|
| `node scripts/verify-covenant-v018.mjs` | Réussi : 154 originaux, 46 fichiers récupérés et moteur préservés ; candidat hors production ; chemins et octets altérés refusés ; distribution refusée |
| `python scripts/verify-covenant-v018-alpha.py` | Réussi : deux PNG RGBA natifs mesurés sans écriture de pixels ; passage du sas alpha 0 ; candidat de porte alpha 253 au centre ; aucun pixel de bord >16 |
| `node scripts/verify-covenant-v017-preservation.mjs` | Réussi sur le périmètre historique V017 : 154 PNG et 81 admissions inchangés |
| `node scripts/verify-covenant-local-recovery-20261126.mjs` | Réussi : 46 fichiers, 32 263 702 octets, 16 candidats historiques et aucune promotion |
| `node scripts/build-covenant-v011.mjs --check` | Réussi : bundle reproduit, 81 PNG contrôlés |
| `node --test scripts/verify-covenant-integration-v011.mjs` | 18 tests réussis, aucun échec ; build autonome sans admission des nouveaux originaux |
| Catalogue dans Chromium | Deux images chargées, trois fonds testés, aucun débordement horizontal à 390 px, aucune erreur de page |
| Reproductibilité documentaire | JSON, Markdown et HTML reconstruits à l’identique |
| Garde générale sur les fichiers changés | 20 chemins et leurs textes validés ; seules les deux métadonnées de prompts sont épinglées par SHA-256 |

La [preuve navigateur](qa/v018/browser.json) distingue cette inspection du catalogue d’un parcours de jeu. L’[aperçu](qa/v018/catalogue-desktop.png) est une capture du navigateur ; il ne remplace aucun original. Le workflow V018 rejoue les contrôles de sources, d’alpha et de reproductibilité documentaire à la publication.

## Correction du premier passage CI

Le [premier passage V018](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/45870747775) sur `e73deaff30a3fd9e837f987e137a65e0a2255dda` a échoué parce que le checkout partiel n’incluait pas le dossier du workflow lui-même. Le vérificateur demandait sa présence parmi les sources ; le fichier était présent localement mais absent du runner.

Le correctif ajoute `.github/workflows` au checkout partiel et vérifie que toutes les sources contrôlées sont couvertes par ses entrées. Les contrôles d’existence et d’intégrité restent actifs. Aucun PNG, manifeste de production, document de bible ni fichier runtime n’est modifié par cette correction. Le statut distant courant est suivi dans la PR ; ce document ne transfère pas un succès d’une ancienne tête à une nouvelle.

## Limites de validation

Aucun parcours de jeu supplémentaire n’est revendiqué : le code runtime, le manifeste de rendu, les collisions et les connexions sont inchangés. L’inspection du catalogue vérifie l’affichage des deux originaux sur plusieurs fonds, pas une traversée de porte.

Le rapport visible du candidat de grande porte est **2,319:1**, pour une cible indicative **≈ 2,8:1**, soit **−17,17 %** sur le rapport. Cette cible est une lecture approximative du plan, sans certification de métrique. La répartition du motif rouge reste aussi à reprendre. La famille `ROOM-cargo-1` est partiellement produite et `ROOM-cargo-2` reste ouverte.

Les références de production, prompts exacts, entrées non retenues et règles d’admission figurent dans le [manifeste](../../assets/openai/sprites/alien-covenant-v018/manifest.json), la [bible V018](BIBLE_COVENANT_V018.md) et la [provenance](PROVENANCE_V018.json).
