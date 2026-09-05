# Art V72 — OpenAI intégré et candidats séparés

Date : 5 septembre 2026. Mode : outil intégré OpenAI ImageGen, sans appel API de génération externe. Les prompts effectivement envoyés sont conservés dans `references/V72_IMAGEGEN_PROMPTS.json`. Les fichiers image ont été sauvegardés depuis les octets PNG retournés par l’outil lorsque sa sauvegarde automatique locale a échoué.

## Table de commandement intégrée

Source : `assets/openai/sprites/frames/v72/props/operations-table-side-v72-source.png`.

SHA-256 : `e82aa014e331c4e81a02256b9642d21f726ab58013e5b28d65e36ac051230c03`.

Export runtime : `assets/openai/hub/props/operations-table-side-v72.webp`, SHA-256 `0b92ad29b041fd218b791aa5659a71360b3c55af24b2368bb7ce0a8941c1be92`.

Vue frontale orthographique, objet indépendant, vrai canal alpha. Le traitement technique réutilise l’extracteur V66 ; il ne redessine pas l’objet et conserve son aspect natif. Rapport et reconstruction déterministe : `scripts/process-hub-table-v72.py --check`, `assets/openai/hub/props/operations-table-side-v72-report.json`. Rendu520×82,63px avec pieds visibles au sol. Il s’agit d’une adaptation originale pour le projet, pas d’une certification de copie1:1 d’une référence officielle.

## Albino Dust Runner083 — quatre clips candidats, zéro promotion

Référence de silhouette : Dust Runner031 du projet. Quadrupède bas, longue queue, crâne sans yeux, chitinisation albinos ; cette variante est explicitement une adaptation `canonExact:false`.

| Clip | Fichier dans `assets/openai/sprites/frames/v72/enemy-083-albino-dust-runner/` | SHA-256 |
|---|---|---|
| Attente | `idle-candidate.png` | `d2c204d02e45aab38ade7cf517add763ad0ec66bbaf318d6d40fb1712383b56e` |
| Mouvement | `move-candidate.png` | `e90dc97640a22fe5bd7f321b26f94516eb53f862211e360703fa04a71e8e740d` |
| Attaque | `attack-candidate.png` | `60d78f435c45a415532fb6f9f7e662c2935c212867574198b0545d878213ae42` |
| Mort corrigée | `death-final.png` | `f52761ada2630209cc144c8fabef33d53ca96c15211f4b61b9692f0c06d19c02` |

L’autre `death-candidate.png` est rejeté : le modèle avait produit une posture d’attente, pas une mort. Les quatre premiers essais à damier opaque sont conservés hors livraison, dans le dossier de récupération sur D:. Les corrections ont été faites avec ImageGen ; aucun damier n’a été considéré comme une transparence réelle.

Quatre feuilles de huit poses, quatre GIF de contrôle et un atlas combiné de32poses ont été techniquement extraits, mais restent **candidate-only**. Le cycle de course est encore trop proche de l’attente. Racines physiques, échelle inter-clips, timing d’impact et continuité doivent être approuvés avant toute intégration. Voir `references/V72_083_CANDIDATE_QA.md` et le rapport `qa-candidates/candidate-qa.json`.

Ces sources ne sont ni copiées dans les chemins actifs V66 ni comptées comme profils acceptés/intégrés. La queue existante n’est pas modifiée pour gonfler artificiellement sa progression. Les maîtres et candidats V72 sont exclus du build et de Vercel ; seul le nouveau prop accepté est chargé en jeu.
