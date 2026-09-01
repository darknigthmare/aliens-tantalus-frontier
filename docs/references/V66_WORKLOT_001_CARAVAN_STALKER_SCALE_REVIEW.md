# V66 — Caravan Stalker scale and motion review

## Verdict

Les quatre sources actives sont des candidates 4 × 2 en 1774 × 887. Elles contiennent chacune huit poses distinctes, regardent vers la droite et passent l’extracteur strict en 8/8 sans contact nominal. L’ancienne pose d’idle redressée a été rejetée : la source active reste quadrupède sur les huit poses.

L’échelle dessinée varie entre les clips. La mesure porte sur un invariant rigide — la corde visible de la plaque crânienne entre la couture nucale postérieure et la pointe rostrale — et non sur la boîte englobante du corps, qui change avec la course, l’attaque et la chute.

| Clip | Longueur crânienne frame 0 | Facteur relatif à idle |
| --- | ---: | ---: |
| idle | 66,24 px | 1,000000 |
| move | 89,36 px | 0,741314 |
| attack | 65,73 px | 1,007710 |
| death | 87,82 px | 0,754297 |

Incertitude manuelle estimée : ±5 px par extrémité. Ces facteurs servent à produire un atlas candidat cohérent ; ils ne constituent ni une acceptation artistique ni une prétention 1:1 canon.

## Mouvement et placement

- idle : respiration/alerte basse, quatre appuis plausibles, aucun redressement bipède.
- move : cycle quadrupède complet avec alternance de contacts.
- attack : approche basse, bref redressement arrière autorisé pour frapper, puis récupération sur quatre appuis.
- death : perte d’appui irréversible, chute et tassement final.

Les rangées sources n’utilisent pas une ligne de sol locale uniforme. Les écarts conservateurs pose 3 → 4 vont d’environ 78,5 px à 152 px selon le clip. Le normaliseur peut corriger ce placement pour une prévisualisation technique, mais des racines physiques revues pose par pose restent obligatoires avant validation d’animation, hitboxes ou runtime.

## Rejets conservés

Sept sources rejetées restent archivées : trois layouts carrés, un idle techniquement propre mais trop redressé, un idle quadrupède avec indices de contact de cellule, une attaque débordante et une mort avec indices conservateurs de bord. Aucun rejet n’est promu silencieusement.

## Suite obligatoire

1. Appliquer les facteurs uniquement via le pipeline de normalisation tracé.
2. Produire atlas, planches-contact et GIF candidats.
3. Revoir les racines physiques, la couture de boucle, les appuis et le timing des hitboxes.
4. Ne marquer accepted et runtimeIntegrated qu’après ces contrôles.
