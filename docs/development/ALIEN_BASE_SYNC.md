# Alien_base — projection documentaire revue V1

Le jeu garde une seule passerelle documentaire : `src/alien-base-bridge-v1.js`, réexportée par `src/content.js`. Elle consulte un snapshot public statique ; le navigateur n’accède ni au dépôt privé ni à ses identifiants d’accès. Elle n’instancie aucun ennemi/objet, ne change aucune statistique et n’écrit aucun ID de sauvegarde.

## Autorité des sources

Les quatre entrées ont été réellement relues via l’API GitHub à la tête `284e9da402b5be0da3f561459ea96224e9d59b6c` de [Alien_base PR9](https://github.com/darknigthmare/alien_base/pull/9). Leurs octets et la projection sont épinglés dans `ALIEN_BASE_SOURCE_AUTHORITY_V1`, dans le script de synchronisation. Il s’agit d’une référence documentaire revue pour cette projection technique ; ce n’est pas une validation canonique de ses rapprochements.

| Fichier Alien_base | SHA-256 des octets relus |
| --- | --- |
| `catalog/entities-v1.json` | `78a27e5a0391ac829a36eff9a9bb6a8b5a7dc72ce1ca40c231d30a3251514534` |
| `catalog/weapons-v1.json` | `d2299c96c3cf8dd1eff566b131203e7c398c00c35cff8dc0401b176f0fdd3425` |
| `data/catalog.v1.json` | `c224b2ee7cd3368b59a43d24db6b9aa1c2d09e538cb9f4227f62e60bae660548` |
| `links/tantalus-entity-links.v1.json` | `80274744c38de5e966b33c2f209a9a4d3c8e37013c099326d3de5bd3e9938f4c` |

Le `sourceRevision` des deux catalogues importés désigne leur **catalogue Tantalus d’origine**, `d41b5fc120da2e7a5938308f9d3c852d20e53cc5`. Ce SHA n’existe pas comme commit Alien_base. Le snapshot distingue donc `upstreamCommit` et `gameCatalogBaselineCommit` ; leurs sens ne sont pas interchangeables.

## Identités et états conservés

La projection comprend 46 dossiers `ab:*`, 200 fiches d’armes, 84 fiches maîtres et 45 **propositions** de rapprochement. Les 45 propositions portent `source-version-review-pending`, y compris celles dont la relation s’appelle `reviewed-identity-alias` ; aucun de ces rapprochements n’est activé. Les 84 maîtres conservent `media_appearance_to_verify_per_variant` et la fiche UPP demeure sans rapprochement.

- `resolveAlienBaseDossierV1()` accepte un ID documentaire ou un alias local explicitement présent dans le dossier ; aucun rapprochement par nom.
- `resolveAlienBaseMasterEntityV1()` ne résout que les IDs maîtres exacts. Un ID local ou `ab:*` avec proposition en attente renvoie `null`.
- `resolveAlienBaseIdentityProposalV1()` expose la proposition, sa relation et son état pour la consultation de développement. Cette fonction n’active aucun alias.
- `resolveAlienBaseGameMappingV1()` sépare `masterId` de `candidateMasterId`, la présence dans les catalogues de jeu et la recherche documentaire. La présence dans le catalogue ne certifie aucune variante d’œuvre.

Les 129 armes `proposed-*` restent `research-only`. Aucun achat, gain d’inventaire, sprite, rig, IA ou contenu jouable supplémentaire ne découle de ces fiches. Neuf dossiers sur 46 contiennent des liens de référence ; les autres ne deviennent pas sourcés par la seule présence de leur nom.

Tous les objets du snapshot, y compris les métadonnées et les tableaux imbriqués, sont gelés dès l’import du module. Les catalogues Tantalus et leurs sauvegardes restent propriétaires du gameplay.

## Consultation du catalogue

`CatalogWorkbenchV62` sert l’armurerie, les ennemis et les véhicules de l’application (ce n’est pas un panneau réservé à l’éditeur). Le joueur voit l’œuvre et les liens documentaires disponibles. Les IDs maîtres, les états techniques, les relations proposées et les limites de certification restent dans l’aperçu développeur. Une proposition en attente n’est jamais présentée comme une identité partagée validée.

## Import hors ligne

```bash
node scripts/sync-alien-base-v1.mjs --base ../alien_base
node scripts/sync-alien-base-v1.mjs --base ../alien_base --check
npm run test:alien-base
```

Le script exige les quatre fichiers **aux octets revus ci-dessus**. Il valide aussi leurs types imbriqués, énumérations, IDs uniques, références et correspondances locales ; la projection normalisée possède ses propres empreintes. Une différence bloque l’écriture avant de remplacer le fichier existant. Pour intégrer une nouvelle révision, relire les sources et mettre à jour explicitement le manifeste et ses tests dans une PR ; ne pas réépingler automatiquement des entrées inconnues.

## Export Tantalus vers la recherche

```bash
node scripts/export-alien-base-tantalus-v1.mjs --out ../alien_base/imports/tantalus/live-catalog-v1.json
```

L’export reprend les catalogues vivants et le suivi AFE2 en séparant `identity` de `gameplayTuning`. Il s’agit d’un audit à rapprocher manuellement ; il ne certifie ni le canon, ni les variantes procédurales, ni les visuels. Il n’ajoute rien automatiquement à Alien_base.

## Validation et frontières

`test:alien-base` participe au runner Node dédupliqué `test:all`. Il couvre la reproductibilité, les IDs, les propositions non admises, l’immuabilité profonde, les entrées adversariales, la provenance et la séparation joueur/développeur. Les documents, outils et workflow sont réservés aux sources ; seuls les modules documentaires nécessaires au client et leur cache hors ligne appartiennent à la distribution. Aucun brut privé n’est ajouté au build.

Les correspondances distinctes des PR30/31/33 ne sont pas fusionnées par leur nom. Les preuves de campagne, les sept trajets PNJ, les recettes d’armes, les classeurs V177/V178 et les archives Blackout/Earth/V10 gardent leurs états propres. Aucun résultat navigateur, fidélité artistique 1:1 ou recette humaine n’est affirmé par ces tests Node.

## Revue v2 du 2 novembre 2026 — sans admission automatique

La branche `main` d'Alien_base reste au commit `878da267b12496128faed63bd448ac8cbb19bae8`, tandis que la [PR #21](https://github.com/darknigthmare/alien_base/pull/21) propose **652 identités et 1 217 bindings Tantalus** au commit `d2ff9fef4df40934f35796b9fe361e65315d1ac2`. Les PR #22, #23 et #24 restent non fusionnées et ne remplacent pas `main`.

La [PR Alien_base #9](https://github.com/darknigthmare/alien_base/pull/9) contient le rapport `links/tantalus-registry-v2-review.v1.json` avec les SHA Git des fichiers lus. La jointure exacte des 45 anciens liens produit **38 candidats par identifiant local**, six liens de personnages sans identifiant local et une référence Ripley sans binding v2. Neuf armes et un véhicule, plus trois candidats AFE2, restent à documenter sans les rendre automatiquement jouables.

`resolveAlienBaseRegistryV2CandidateV1(localId)` expose ces 38 candidats **uniquement comme des propositions**. Ils sont affichés dans le codex en **mode développeur** ; le rendu joueur, les stats et les sauvegardes ne changent pas. Pour `enemy-004-drone-big-chap`, `bio.xenomorph.big-chap` ne se confond pas avec l'archétype générique `bio.xenomorph.drone` sans preuve morphologique. La CI `test:alien-base` vérifie les invariants, sans prétendre homologuer la fidélité 1:1.
