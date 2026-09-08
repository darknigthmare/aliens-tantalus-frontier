# Catalogue des armes — correction M41A V77

Le test navigateur a utilisé le vrai descripteur `WEAPONS[0]`, sans lui imposer les valeurs d’une fixture. Il a révélé un M41A à1cartouche,2tirs/s et0,8s de rechargement. L’origine est la recette modulo de `content-core-v50.js`, pas le nouveau système de rechargement.

La correction explicite couvre uniquement le M41A et ses trois finitions de projet : capacité99,7,7tirs/s et1,45s de rechargement. La cadence et le temps sont des valeurs d’équilibrage déjà présentes dans `buildWeaponRuntime`, pas des mesures du film. La capacité99 correspond à la référence M41A documentée dans [IMFDB — Aliens](https://www.imfdb.org/index.php/Aliens), consultée le8septembre2026 ; cette source secondaire distingue la capacité de99 du chargement à95 mentionné par le manuel technique. Aucun chargeur n’est artificiellement rempli lors d’une reprise.

Les IDs, prix dépendants, acquisitions, marques et autres caractéristiques ne sont pas renommés. Les142autres entrées conservent leur état antérieur avec `statsPolicy: legacy-generated-pending-review`. La présence de ce marqueur n’est pas une validation de leurs chiffres : le reste du catalogue exige un audit par famille et source, notamment les armes de poing. M41A2 n’est pas assimilé au M41A.

Tests : `tests/weapon-catalog-v77.test.mjs`, tests tactiques du moteur de production et QA navigateur sur le catalogue réel. Ce correctif ciblé ne clôt pas l’équilibrage complet ni les fonctions secondaires encore absentes de l’arsenal.
