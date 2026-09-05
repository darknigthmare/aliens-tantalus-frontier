# V72 — Combat Synthetic 042 : atlas candidat préparé

2026-09-05. **Normalisation technique livrée, acceptation et intégration non terminées.** Aucun appel ImageGen : cette passe assemble les cinq vraies sources OpenAI existantes. Aucun fichier global de référence, ancrage, échelle, queue, état, manifeste ou runtime n'est modifié.

## Livrables réels

- Atlas WebP RGBA lossless 1024×2560, 4×10 cellules256, garde16, 40 poses distinctes : `assets/openai/sprites/normalized/enemy-profiles-v66/enemy-042-combat-synthetic.webp`.
- Cinq WebP sous `assets/openai/sprites/normalized/enemy-clips-v66/enemy-042-combat-synthetic/` : idle, move, attack, death, reload.
- Six GIF sous `assets/openai/sprites/previews/v66/enemy-042-combat-synthetic/` : les cinq clips et all.gif.
- Métadonnée : `assets/openai/sprites/metadata/v66/enemy-042-combat-synthetic.json`.

Soit **13 fichiers techniques**, pas 13 ennemis ni cinq nouvelles générations. Les masters, prompts et événements restent intacts.

## Contrôles exécutés

Inspection réelle des cinq sources, des cinq overlays historiques d'ancrage, des overlays métriques move/death et des clips normalisés move/reload sur fond sombre. Affichage PIL en mémoire après échec ACL de `view_image`, sans retouche ni sauvegarde des sources. Pas de test de combat/déplacement runtime ni de certification de fluidité par un simple contact.

```powershell
py scripts/process-v66-enemy-batch.py --profile enemy-042-combat-synthetic --remove-enclosed-magenta-matte --remove-enclosed-magenta-aa-fringe --remove-magenta-spill
py scripts/process-v66-enemy-batch.py --profile enemy-042-combat-synthetic --check
```

Résultat : 40 poses, zéro finding, zéro acceptation automatique. Extraction stricte 8/8 par clip, **sans transfert entre cellules**. Fond intérieur identifié : 3238 pixels de cœur magenta +4907 pixels de frange bornée. Le despill existant neutralise98 pixels après redimensionnement ; zéro strict-spill restant. Aucune pose interpolée/dupliquée ni anatomie redessinée. Des teintes fuchsia plus sombres restent toutefois visibles localement au cou/à l'arme ; le détecteur strict n'est pas une preuve de perfection visuelle.

## Portes par clip

| Clip | Observation réelle | Suite |
|---|---|---|
| idle | Identité blindée sombre, carabine conservée, scan de tête et stance stable. | Base comparative, boucle runtime non certifiée. |
| move | Strides et flexion visibles, plus lisibles que Red019 ; alternance/retour des appuis à revoir en playback. | Source sensiblement plus petite que l'idle ; calibrer et contrôler le cycle complet. |
| attack | Arme montée, visée, recul, retour ; carabine présente. | Calage du tir réel et stabilité inter-clips ; aucun tir runtime testé. |
| death | Perte d'appui, genou, chute, corps couché ; arme retenue. | Source plus petite avant la chute ; ne pas mesurer la largeur du cadavre pour calibrer. |
| reload | Arme présente dans les huit poses ; extraction/manipulation/action/retour. | **Passage ancien/nouveau chargeur comprimé entre poses4–5**, à clarifier ou revoir agrandi avant acceptation. |

## Échelle et racines : examinées, pas signées automatiquement

Les fragments dans `docs/references/v66-worklot-001-combat-synthetic-review/enemy-042-combat-synthetic/` fournissent40 candidats de racine et15 mesures. Leurs cinq SHA source correspondent encore aux masters actuels. Les cinq overlays de racine ont été inspectés ; les40 repères restent dans les bornes extraites. Ce contrôle ne prouve pas le bassin physique et chaque appui : aucun ancien `reviewed-candidate-*` n'est transformé en `reviewed`.

Les40 `sourceBounds` historiques sont de1–3px plus courts en bas que l'extraction actuelle. **Ne pas déplacer automatiquement les pieds** : appui solide, liseré semi-transparent et boîte de découpe sont distincts. Réémettre les overlays sur le détourage retenu et revoir les repères corporels, sans recopier `bbox.bottom`.

Mesures historiques du même chord crânien, relues sur les overlays move/death : médianes idle73px, move60px, attack67px, death63px, reload70px. Propositions : move×1,216667 et death×1,158730 ; attack×1,089552 et reload×1,042857 restent à apprécier selon l'incertitude des poses. **Aucun facteur appliqué** et aucune correction par pose inventée. Une vraie décision de calibration et un contrôle de marges/racines restent requis.

Métadonnée volontairement honnête : cinq facteurs1, échelle de pack unique0,603773585, ancrage `pending`,40 placements `pending-body-root-review`, `pending-visual-review`, `runtimeIntegrated:false`, `canonExact:false`. Cet atlas de QA expose les défauts ; il n'est pas branché au jeu.

## Empreintes et suite

- Atlas : `81c6e10eda53ca3b95edf60c9967102aded8392a7f3fd495e9b1d79f62c6ee7b`.
- Métadonnée : `01f5232eb7f451ac74008bf6783e90fc0d8fb5968bcf915a9e2f48251a3873ee`.
- Les cinq SHA source et ceux des clips/previews sont dans la métadonnée et passent `--check`.

Priorité : échelle move/death, chargeur lisible,40 racines sur le détourage retenu, résidus sombres et playback inter-clips. Ensuite seulement fusion de fragments réellement revus, reconstruction, acceptation et intégration. Le personnage reste l'adaptation originale Tantalus documentée, pas un modèle canonique unique certifié1:1.
