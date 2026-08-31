# V66 — Reef Stalker inter-clip scale and support review

## Verdict

L’identité et la direction sont cohérentes sur les 32 poses actives, mais une calibration inter-clip reste utile avant normalisation. La différence importante concerne `move`, environ **9,2 % plus petit** qu’`idle` sur le dôme crânien. `attack` et `death` sont déjà à moins de 2 % du niveau d’`idle`.

La priorité supérieure reste l’ancrage physique : entre les poses 3 et 4, le point le plus bas de la silhouette remonte de 24 à 65,5 px selon le clip. Une correction d’échelle seule ne supprimera pas ce saut.

## Mesure anatomique

Invariant : corde longitudinale du dôme crânien dorsal lisse, depuis son apex postérieur à la jonction nucale jusqu’à la pointe rostrale. Deux poses latérales comparables ont été mesurées par clip dans les coordonnées locales des cellules sources. Incertitude manuelle estimée : ±3 px par extrémité.

| Clip | Mesures | Médiane | Facteur `idle / clip` proposé |
| --- | ---: | ---: | ---: |
| `idle` | 94,34 px ; 97,08 px | 95,71 px | 1,000000 |
| `move` | 89,81 px ; 85,44 px | 87,63 px | 1,092275 |
| `attack` | 98,23 px ; 94,92 px | 96,58 px | 0,991027 |
| `death` | 93,61 px ; 94,89 px | 94,25 px | 1,015502 |

Calibration candidate :

```json
{
  "idle": 1.0,
  "move": 1.092275,
  "attack": 0.991027,
  "death": 1.015502
}
```

Le facteur `move` est la correction matérielle. Les corrections `attack` et `death` se trouvent dans l’ordre de grandeur de l’incertitude manuelle ; elles doivent être confirmées après génération de l’atlas, pas interprétées comme une validation artistique.

## Appuis et placement source

Le tableau utilise le pixel de premier plan le plus bas de chaque cellule comme indice conservateur. Ce n’est pas une racine physique validée.

| Clip | Médiane rangée 0 | Médiane rangée 1 | Saut 3 → 4 |
| --- | ---: | ---: | ---: |
| `idle` | 402 px | 378 px | −24 px |
| `move` | 388 px | 339 px | −49 px |
| `attack` | 364,5 px | 299 px | −65,5 px |
| `death` | 401,5 px | 337,5 px | −64 px |

Le contrat source cible approximativement `y = 346 px` (`groundCellRatio = 0,78`). Les écarts opposés entre les deux rangées prouvent qu’il faut des ancres physiques par pose. `attack` exige en plus sa réassignation intercellule sûre déjà documentée : l’extracteur par défaut reste bloqué sur les poses 2 à 5.

## Direction et continuité macroscopique

- Les quatre clips et leurs 32 poses restent orientés vers la droite.
- Le quadrupède bas, le dôme aveugle, les côtes biomécaniques, les plaques dorsales basses, les quatre membres et la queue complète à lame terminale restent identifiables.
- `idle` forme une respiration/préparation subtile ; `move` alterne compression et extension ; `attack` présente anticipation, bond, extension et retour ; `death` descend jusqu’à une position couchée irréversible.
- Aucun échange d’identité ou retournement gauche/droite n’a été constaté. La continuité fine, le rythme et les boucles restent toutefois à contrôler sur GIF après ancrage.

## Suite nécessaire

1. Injecter la calibration uniquement via le registre d’échelle revu, sans modifier les PNG sources.
2. Extraire `attack` avec la preuve de réassignation sûre existante.
3. Normaliser les quatre clips avec des racines physiques explicites.
4. Refaire contacts/GIF, mesurer le dôme dans l’atlas et contrôler appuis, transition 3 → 4 et coutures de boucle.

Aucune source, prompt, événement, référence, queue, registre, `STATE`, manifeste ou donnée runtime n’a été modifiée, acceptée ou intégrée par cette revue.
