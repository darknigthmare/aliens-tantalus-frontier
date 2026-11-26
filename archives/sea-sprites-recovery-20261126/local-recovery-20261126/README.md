# La Mer des Chagrins — 31 originaux historiques non actifs

Ce lot conserve **31 fichiers originaux, soit 31 000 937 octets**, dans une archive source. Il complète les dix PNG publiés au commit `a6519a3d564ad4176c87daf796037c9ec013a496` de la [PR #58](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/58), sans les dupliquer.

| Famille | Fichiers | Octets | Statut |
|---|---:|---:|---|
| Anciennes phases Decker | 2 | 3 366 707 | Remplacées ; aucune réactivation |
| Générations non sélectionnées | 7 | 12 620 334 | Itérations historiques, non admises au rendu |
| Anciens codes et bibles | 15 | 5 866 895 | Instantanés non appliqués aux fichiers actifs |
| Captures QA | 7 | 9 147 001 | Preuves historiques, sans nouvelle validation revendiquée |

Le [manifeste](MANIFEST.json) donne les chemins, tailles, SHA-256, identités Git et statuts de chaque original. Les noms de génération absents et les décisions de revue manquantes ne sont pas reconstitués. Les deux phases Decker remplacées conservent ce statut. Aucun de ces fichiers n’est certifié fidèle 1:1 et aucun nouveau cycle d’animation complet n’est revendiqué.

## Limites et admission

Les copies sous `snapshot/` restent des documents d’archive : leur code n’est importé par aucun module actif. Les images ne sont ajoutées ni au catalogue actif ni aux bindings du renderer. Le manifeste runtime publié reste strictement inchangé : 172 entrées, dont les 160 antérieures et les douze fichiers de la publication ciblée des dix PNG. Les six anciennes captures déjà publiées ne sont pas recopiées.

L’admission réutilise exclusivement le registre exact `../ADMISSION_MANIFEST.json` et son empreinte indépendante dans `scripts/mer-des-chagrins-recovery-admission-20261126.mjs`. Les 151 anciennes entrées sont conservées. Les 33 nouveaux membres sont les 31 originaux, ce README et le manifeste. La politique générale du dépôt et le filtre de build conservent leurs règles : toute l’archive reste exclue de la distribution construite.

## Vérifications reproductibles

Depuis la racine du dépôt :

```sh
npm run test:mer-des-chagrins-recovery
node --test scripts/verify-mer-des-chagrins-visual-admission-20261126.mjs
node --input-type=module -e "import { verifyMerRecoveryArchive20261126 } from './scripts/mer-des-chagrins-recovery-admission-20261126.mjs'; console.log(await verifyMerRecoveryArchive20261126(process.cwd()));"
```

Ces contrôles portent sur les admissions, l’intégrité des octets, l’exclusion du build et la conservation du manifeste runtime. Ils ne constituent pas une nouvelle QA navigateur ni une validation du build complet.
