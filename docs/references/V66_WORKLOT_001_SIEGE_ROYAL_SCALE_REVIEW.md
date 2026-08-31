# V66 Worklot 001 — Siege Royal — revue d'échelle post-génération

Date: 2026-09-01
Profil: `enemy-029-siege-royal`
Statut: **QA indépendante en lecture seule; facteurs recommandés, non appliqués.**
Coordonnées: cellule source nominale 4×2, origine locale en haut à gauche, frames numérotées 1 à 8.

## Sources liées

| Clip | Source active | SHA-256 |
|---|---|---|
| idle | `assets/openai/sprites/frames/v66/batch-003/enemy-029-siege-royal/idle.png` | `a12e669ecfbd74c2de48dd489fad48f13c6e42f2a45264a4cdf3b58cb7bb7ed7` |
| move | `assets/openai/sprites/frames/v66/batch-003/enemy-029-siege-royal/move.png` | `0037f1b3c4122167c34b0b0ca007af965ca7233ef364b80c3c6ee5f74c097428` |
| attack | `assets/openai/sprites/frames/v66/batch-003/enemy-029-siege-royal/attack.png` | `36bc0974fe0ca4fd71095aacd769f918e8c5341571f9ae3e94f759cbe5ff3db7` |
| death | `assets/openai/sprites/frames/v66/batch-003/enemy-029-siege-royal/death.png` | `d4c431b653bb0970c48865019eaf89d9e1e4bfac389203670bc7333b3dbe77d9` |
| tail-strike | `assets/openai/sprites/frames/v66/batch-003/enemy-029-siege-royal/tail-strike.png` | `077720bedb662b154c7979f8360f2416e4858b6c00c10bf9c9c6f0646fd7002f` |

## Invariant et méthode

L'invariant retenu est la **longueur de la plaque crânienne principale**: chord entre la pointe postérieure de la lame supérieure de la crête et le bord antérieur du dôme, au-dessus de la mâchoire. Cette structure rigide reste lisible en profil droit et ne dépend ni de l'écartement des jambes, ni de la courbe de queue, ni de l'affaissement du torse.

Procédure:

1. Deux poses strictement de profil et à crête dégagée ont été inspectées visuellement pour chaque clip.
2. Dans une ROI crânienne définie en coordonnées de cellule, le matte rose/magenta connecté a été exclu; la plus grande composante sombre continue a isolé le crâne.
3. Dans une bande de 32 px sous le sommet détecté de la crête, les deux extrémités robustes de la plaque ont été relevées. Un endpoint devait occuper au moins deux pixels verticaux afin d'exclure une frange antialias isolée.
4. La longueur déclarée est la distance euclidienne entre endpoints. Incertitude estimée: ±2 px par mesure, liée au bord antialias et au léger changement d'inclinaison de tête.
5. Le facteur candidat est `médiane idle / médiane clip`. L'idle reste donc le baseline à `1.0`.

Le masque et la ROI servent uniquement à reproduire le relevé des landmarks déjà inspectés; aucune source n'a été retouchée ou rééchantillonnée.

## Mesures anatomiques

| Clip | Frame | Endpoint postérieur | Endpoint antérieur | Longueur |
|---|---:|---:|---:|---:|
| idle | 1 | `(313,246)` | `(382,248)` | 69.029 px |
| idle | 8 | `(125,120)` | `(192,123)` | 67.067 px |
| move | 1 | `(279,192)` | `(363,195)` | 84.054 px |
| move | 8 | `(138,130)` | `(219,129)` | 81.006 px |
| attack | 1 | `(250,240)` | `(326,242)` | 76.026 px |
| attack | 8 | `(181,132)` | `(254,132)` | 73.000 px |
| death | 1 | `(284,247)` | `(356,251)` | 72.111 px |
| death | 2 | `(198,266)` | `(275,270)` | 77.104 px |
| tail-strike | 1 | `(259,238)` | `(328,239)` | 69.007 px |
| tail-strike | 8 | `(138,116)` | `(205,119)` | 67.067 px |

## Recommandation `sourceScaleByClip`

| Clip | Médiane plaque | Écart vs idle avant correction | Facteur recommandé | Médiane projetée |
|---|---:|---:|---:|---:|
| idle | 68.048 px | baseline | **1.000000** | 68.048 px |
| move | 82.530 px | +21.28 % | **0.824526** | 68.048 px |
| attack | 74.513 px | +9.50 % | **0.913235** | 68.048 px |
| death | 74.607 px | +9.64 % | **0.912082** | 68.048 px |
| tail-strike | 68.037 px | −0.02 % | **1.000000** | 68.037 px |

Valeur recommandée:

```json
{
  "idle": 1.0,
  "move": 0.824526,
  "attack": 0.913235,
  "death": 0.912082,
  "tail-strike": 1.0
}
```

La valeur brute du tail-strike serait `1.000160`; elle est volontairement ramenée à `1.0`, car l'écart de 0.011 px est très inférieur à l'incertitude du landmark. Ces facteurs doivent être revalidés par le pipeline contre les SHA ci-dessus avant application.

## Appuis et contact

Contrôle visuel:

- **idle:** les deux pieds restent plantés; aucune dérive d'appui.
- **move:** alternance d'appui lisible, avec au moins un pied porteur par frame; pas de quadrupédie.
- **attack:** base bipède bracée pendant l'anticipation, l'extension et la récupération; aucun saut involontaire.
- **death:** la nature de l'appui change volontairement de pieds vers genou/main, puis flanc/corps. Il ne faut pas forcer un root de pied constant après la frame 3.
- **tail-strike:** pieds bracés pendant le balayage; le point le plus bas peut être la queue et ne doit pas remplacer l'ancre physique du pied.

Contrôle des enveloppes basses heuristiques par rangée (utile uniquement comme alerte, pas comme root anatomique):

| Clip | Bas frames 1–4 | Étendue | Bas frames 5–8 | Étendue | Interprétation |
|---|---|---:|---|---:|---|
| idle | `355,355,355,355` | 0 px | `228,228,228,228` | 0 px | appui parfaitement stable |
| move | `333,334,333,334` | 1 px | `269,270,270,270` | 1 px | appui locomotion stable |
| attack | `357,358,357,356` | 2 px | `247,246,247,247` | 1 px | base bracée stable |
| death | `378,378,382,384` | 6 px | `225,228,233,230` | 8 px | variation attendue pendant la chute |
| tail-strike | `348,350,343,347` | 7 px | `220,220,220,222` | 2 px | queue influence l'enveloppe; pieds à ancrer séparément |

## Conclusion et limites

La mesure anatomique confirme un écart d'échelle réel du move et, plus modérément, de l'attack et du death. L'enveloppe globale seule aurait confondu posture et échelle; les facteurs ci-dessus reposent sur la plaque crânienne rigide.

Cette revue ne constitue ni une preuve d'acceptation, ni une normalisation, ni une intégration runtime. Aucun facteur n'a été appliqué, aucune source n'a été modifiée et aucun registre, queue, STATE, manifeste ou atlas global n'a été touché. L'étape suivante doit vérifier les SHA, appliquer les facteurs en mémoire ou dans le normaliseur autorisé, puis recontrôler landmarks, appuis, bords de cellule et RGBA résultants avant toute acceptation.
