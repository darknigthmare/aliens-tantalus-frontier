# Consolidation des PR — 4 novembre 2026

## Périmètre

Cette intégration reprend les huit PR ouvertes de `darknigthmare/aliens-tantalus-frontier` et le `main` observé au commit `fbaa8ec4b2f3248bd1fd0206cc709641657b66db`. Les merges locaux conservent les huit têtes comme ancêtres. La publication et les résultats de validation du nouvel assemblage doivent être constatés séparément.

| PR | Tête reprise | Apport conservé |
| --- | --- | --- |
| #30 | `59565c39b1636461326c851dcb3b83f807bbc2b0` | Snapshot public et CSV de références ; contenu intégral conservé dans l'archive documentaire revue. |
| #31 | `13bfd54893337ed485895d5f029f7c5846cda4f3` | Identités et 1 217 correspondances historiques conservées dans le snapshot documentaire. |
| #32 | `691dce04217565f017d51b14b440fb3f3b178b71` | Import/export et consultation documentaire, avec les corrections de contrat apportées par #36. |
| #33 | `8996fca229d2f27991262c685e87e21283a51921` | Registre de 88 fiches, 22 sources et 15 correspondances proposées conservé hors du client. |
| #34 | `b9886eccb7ea7fa9ea3c29230240965f54eea015` | Observation Trials et parcours physiques Inez/Jun, dont les témoins historiques restent distincts. |
| #35 | `0ef85cc54b90d0196bdd6f6d0909de694e74c19c` | Correction syntaxique du codex, déjà présente dans la façade revue #36. |
| #36 | `e4ea86d54602e9ea08b169d4053a86565548386f` | Façade documentaire commune, contrats d'import/export, consultation des sources et accès physique Durandal. |
| #37 | `01c764a61e6ce7481acc3910685756b35141ee14` | Parcours Trials à 0/200 ms, fixtures vérifiées, interruption de Cal et preuves de parcours. |

## Choix de résolution

La façade de #36 est conservée. Les trois anciennes façades concurrentes et leurs guides devenus obsolètes sont remplacés par les données archivées et le guide courant `ALIEN_BASE_SYNC.md`. La comparaison des objets exportés de #30 et #31 avec `ALIEN_BASE_SOURCE_SNAPSHOTS_20261102.json` donne une égalité intégrale ; le CSV #30 est identique octet par octet. Le registre PR7 archivé est égal au catalogue de #33. Ces comparaisons justifient la conservation des données sans réactiver les anciennes API concurrentes.

Le client utilise 46 dossiers détaillés, 200 fiches d'armes, 84 identités maîtres et 45 propositions de rapprochement. Les propositions restent en attente. La conservation des anciens catalogues n'est pas une affirmation que toutes leurs lignes sont consultables ou jouables dans le client.

Les chaînes de preuve de #34/#37, de #36 et de l'intégration des outils IA sur `main` ont une base commune, mais des successeurs différents. Leur jonction doit déclarer les différentes branches et les octets de l'assemblage, sans transformer un ancien résultat en preuve de la nouvelle version. Les classeurs et témoins historiques restent conservés.

## Corrections nouvelles

### Export des œuvres d'origine

L'export AFE2 remplaçait `sourceGame` sur ses 35 lignes par le nom du jeu consommateur. Il conserve désormais la provenance d'origine et ajoute `exportedFromGame`. Les provenances inconnues de `siren`, `gasbag` et `wey-yu-worker` restent `null`. Les identifiants, profils et statuts ne changent pas. Le nouveau test échoue sur l'ancien export et réussit après correction ; il vérifie également l'absence de mutation des catalogues vivants.

### Parcours Trials et sortie de duel

La dernière exécution CI de #37 réussissait la capture Guardian puis laissait le combat avancer pendant les exports d'images et les lectures retardées. Le duel pouvait se terminer avant la demande d'abandon ; l'attente d'une clôture par abandon expirait alors sur un résultat natif déjà attribué. Le correctif maintient l'observation des phases réelles, protège les exports par la pause publique et conserve comme erreur explicite tout résultat qui survient avant le point attendu. Un résultat natif n'est jamais réécrit en abandon.

Le bouton d'abandon n'est offert que pour un ticket encore ouvert. Un duel terminé conserve son résultat et ses récompenses lors de la reprise et de la fermeture de l'interface de pause.

La première suite générale a révélé un double de test du compteur de super-attaque qui contournait le constructeur sans fournir l'accès à la progression. Il reçoit désormais une progression native, un getter et des gardes qui font échouer toute transaction déclenchée par le rendu. Le runtime conserve son contrat. Les deux fichiers complets de tests supers/navigation passent ensuite sans filtre, soit 65 tests, y compris le contrôle documentaire V148.

### Accès aux annexes

La continuation traite les quatre croisements de silhouettes restants de #36 : briefing/archives MIRE, cryogénie/capsules, médical/morgue et quarantaine/Bioforge. Les vrais paliers bas et leurs échelles sont déplacés ensemble ; les supports supérieurs, conduits, dimensions et appariements des portes restent conservés. Les équipements concernés suivent leurs supports. Le registre historique des 100 détails V177 reste intact ; le seul déplacement nouveau de `T177-I05` reçoit une transition documentaire séparée.

Les 83 contrôles ciblés couvrent les sauvegardes sur les anciens paliers et échelles, la chute par gravité native sans téléportation, la montée/descente et le passage dans les deux sens. Ils passent avec la physique et les commandes natives, dans un harnais Node utilisant un double Canvas. Les quatre nouveaux contrôles de dégagement échouent avec l'ancienne géométrie. Aucun rôle d'équipement n'est perdu dans les 35 compositions ; le chariot cryo existant `stasis-supplies` redevient admis, portant le recensement de 304 à 305.

La recette navigateur supplémentaire est branchée sur `ship-v165` et inclut également Durandal pour contrôler l'ensemble des cinq accès réunis. Elle prévoit 15 scénarios, dix passages aller/retour, dix reprises d'anciennes poses et 50 captures natives. Ces nombres décrivent sa couverture attendue ; son résultat effectif appartient au rapport Actions du commit exécuté.

## Validation du nouvel assemblage

Le tableau constate les vérifications locales effectuées avant publication. Les résultats ultérieurs de construction et de recette navigateur sont ceux des rapports GitHub Actions du commit réellement exécuté et de la description de la PR de consolidation. Les succès historiques de #34 et #36 ne sont pas transférés à cette branche.

| Contrôle | État |
| --- | --- |
| Ascendance des huit têtes | Vérifiée localement après les merges |
| Parité des catalogues historiques | Vérifiée depuis les objets Git et les snapshots conservés |
| Régression de provenance AFE2 | Ancien code en échec ; correction validée par les suites ciblées |
| Succession des historiques V162/V163/V165 | 56 tests ciblés réussis, zéro échec |
| Première suite Node complète, avant les quatre portes | 4 034 réussites, un échec et une fixture facultative ignorée ; 214 fichiers uniques, 1 187,6 s. L'échec du double UI du compteur de super-attaque a été reproduit puis corrigé. |
| Supers et navigation après correction | 65 tests réussis sur les deux fichiers complets, sans exclusion |
| Géométrie des quatre portes | 83 tests ciblés réussis dans le checkout du correctif ; 66 tests des six fichiers modifiés rejoués et réussis sur l'assemblage ; régression démontrée sur les quatre anciennes géométries |
| Suite Node complète sur l'assemblage final | Verdict attendu du workflow Release du commit publié |
| Contrôle des sources | Réussi : 2 454 fichiers, 1 426 ressources et aucun document privé admis |
| Build et distribution | Résultats associés au commit publié dans la PR de consolidation et dans Actions |
| Parcours navigateur concernés | Rapports natifs du commit publié ; aucune exécution navigateur locale revendiquée |
| Workflows GitHub de la consolidation | Verdicts effectifs disponibles après publication ; chaque résultat reste lié à son commit |

## Compléments après la première exécution GitHub

La première publication de la PR #39 utilise la tête `12637ec3684b48cfda68a06f018b16a931b0b17b`. Actions a exécuté le candidat de fusion `beb32ba348e63c8bf82ab6a7a83def78005afac1`, dont l'arbre `1d401c7dba00b943c7c2cb375ba857ccd5d4cd98` est identique à celui de cette tête. Les trois workflows Forge, Gameplay et Alien_base réussissent. Les deux autres conservent leurs échecs réels :

- Release : 4 047 tests Node réussis, zéro échec et une fixture physique V175 facultative ignorée, sur 214 fichiers uniques. Sources, build, distribution, service worker et isolation des comptes passent. Parmi les 26 rapports navigateur, 25 réussissent ; la sortie d'annexe d'Idris échoue dans `qa-npc-service-routes-v161.py`. La suite n'a donc pas encore qualifié son retour ni les cas suivants de Leila.
- Excel : 14 jobs sur 15 réussissent. Dans ship, V165 passe 121 contrôles/20 captures et V177 passe 497 contrôles/98 captures, avec 200/200 ajouts visibles. V182 réussit 13 scénarios sur 15 et conserve 233 contrôles/48 captures ; deux comparaisons de données interrompent les retours de Durandal et des capsules. Les 48 PNG sont vérifiés par empreinte et inspectés. Les dix reprises historiques réussissent.
- Trials : les deux modes 0 ms et 200 ms passent chacun 77 contrôles sur six duels avec les mêmes six Save. Chaque mode comprend 36 images de jeu et six planches de comparaison déclarées. Les pauses de récupération conservent leurs ticks après au moins 54 ticks natifs observés. Les deux parcours de Cal et les parcours physiques des autres PNJ restent associés à leurs rapports propres.

### Attendu complet des portes appariées

L'oracle V182 reconstruisait les sockets sans les métadonnées `id` et `bidirectional` ajoutées par les décorateurs du Hub. Les deux entrées natives réussissaient, avec des faces, dimensions et positions correctes, mais l'égalité complète des objets échouait. L'attendu est désormais obtenu depuis les quatre décorateurs de production, dans l'ordre de `app.js`. La comparaison reste intégrale et les 20 fonctions Python de parcours et d'assertion sont conservées. Les huit reçus de passage déjà disponibles correspondent après correction ; une nouvelle exécution navigateur doit encore réaliser les deux retours manquants.

### Réponse native à chaque demande de sortie V161

La trace du premier échec relève une vérification de disponibilité réussie, une seule touche E et une attente de 45 secondes sans sortie. L'état final ne permet pas d'attribuer avec certitude la cause à l'instant de la touche. Une fenêtre de course est néanmoins reproduite avec le véritable Hub et un PNJ natif : en 100 ms entre lecture et E, le passant entre dans la projection de retour, puis le moteur refuse normalement la demande. L'ancien pilote ne retente pas la sortie après le départ physique du passant.

Le nouveau pilote observe la réponse synchrone du moteur après chaque vrai keydown. Il n'autorise une nouvelle tentative qu'après un nouveau refus natif explicite, conserve cette tentative dans le rapport et ne renvoie aucune touche après acceptation. L'arrivée dans la pièce parente doit être attestée par le reçu natif. Disponibilité, tentatives et passage partagent toujours le même budget total de 45 secondes.

La suite V161 complète passe 21/21 après correction. Le nouveau cas de course échoue avec l'ancien pilote ; le passant immobile et la transition acceptée dont le host cesse de délivrer des frames restent des échecs à 45 secondes. Les doubles DOM/Canvas/RAF du harnais Node sont déclarés ; aucune méthode du moteur n'est remplacée. Ces contrôles ne requalifient pas rétroactivement le premier run GitHub.

## Travaux encore distincts

L'intégration ne transforme pas les 129 propositions d'armes en équipements admis, ni les 18 tenues sans visuel équipable en tenues terminées. Les trois profils AFE2 inconnus, les rapprochements à documenter, les archives primaires manquantes et les validations artistiques restent ouverts. Aucun statut de fidélité canonique ou artistique 1:1 n'est accordé par une fusion de code.
