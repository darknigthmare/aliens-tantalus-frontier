#!/usr/bin/env python3
"""Build the focused V018 continuation without rewriting the frozen V017 bible."""
from pathlib import Path
import hashlib
import html
import json

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/covenant'
SOURCE = 'assets/openai/sprites/alien-covenant-v018/manifest.json'


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def main():
    source_bytes = (ROOT / SOURCE).read_bytes()
    manifest = json.loads(source_bytes)
    prior_path = DOC / 'BIBLE_COVENANT_V017.json'
    prior_bytes = prior_path.read_bytes()
    previous = json.loads(prior_bytes)
    side = manifest['assets'][0]
    candidate = manifest['documentaryCandidates'][0]
    summary = dict(previous['summary'])
    summary.update(pngs=155, newPngs=1, runtimePngs=81, catalogueOnlyPngs=74,
                   newRuntimeAdmissions=0, currentRuntimeVersion='0.17.0',
                   documentaryCandidatesOutsideProduction=1, newPrimaryReferenceImages=4,
                   completedWorldFamiliesInThisContinuation=0, certified1to1Images=0)
    asset_index = []
    for version in range(11, 19):
        path = f'assets/openai/sprites/alien-covenant-v{version:03}/manifest.json'
        data = json.loads((ROOT / path).read_text())
        for row in data['assets']:
            asset_index.append({key: row.get(key) for key in ('id', 'title', 'path', 'width', 'height', 'bytes', 'sha256')}
                               | {'sourceManifest': path, 'verified1to1': False,
                                  'sha256': row.get('sha256', row.get('alphaQA', {}).get('sha256'))})
    runtime = json.loads((ROOT / 'dlc/covenant/sprites-v011.json').read_text())
    runtime_ids = {row['id'] for row in runtime['assets']}
    for row in asset_index:
        row['currentAdmission'] = 'runtime' if row['id'] in runtime_ids else 'catalogue-only'
    assert len(asset_index) == len({row['id'] for row in asset_index}) == 155
    assert all(isinstance(row['sha256'], str) and len(row['sha256']) == 64 for row in asset_index)
    assert len(runtime_ids) == 81
    assert candidate['id'] not in {row['id'] for row in asset_index}
    bible = {
        'schemaVersion': 1, 'title': 'Alien: Covenant — annexe de continuation V018',
        'version': '0.18.0', 'date': '2026-11-26', 'documentKind': 'focused-continuation-addendum',
        'baselineCommit': manifest['baselineCommit'], 'verified1to1': False,
        'inherits': {'path': 'docs/covenant/BIBLE_COVENANT_V017.json',
                     'sha256': hashlib.sha256(prior_bytes).hexdigest(),
                     'scope': 'Base exhaustive conservée. Les domaines sans modification héritent de V017 ; cette annexe ne les déclare pas achevés.'},
        'sourceManifest': {'path': SOURCE, 'sha256': hashlib.sha256(source_bytes).hexdigest()},
        'summary': summary, 'coverage': manifest['coverage'], 'assetIndex': asset_index,
        'newAssets': [side], 'documentaryCandidates': [candidate], 'primaryReferences': manifest['references'],
        'roomUpdates': [{'roomId': 'cargo', 'referenceIds': ['ACOV-211'],
                         'availableCatalogueAssetIds': [side['id']],
                         'unselectedDocumentaryCandidateIds': [candidate['id']],
                         'geometryChanged': False, 'thresholdsChanged': False,
                         'missingWorkIds': ['ROOM-cargo-1', 'ROOM-cargo-2'],
                         'status': 'partial-production; main-door-revision-required; runtime-review-open'}],
        'missingWorkUpdates': manifest['missingWorkDisposition'],
        'continuationContract': manifest['continuationContract'],
        'remainingWork': [
            'Reprendre les proportions et la distribution du graphisme rouge de la grande porte ; le candidat reste hors production.',
            'Documenter séparément tout état fermé du sas latéral ou ouvert de la grande porte avant de produire un autre état.',
            'Valider un consommateur existant, la projection, le passage, les collisions et les interactions avant une admission dans le rendu.',
            'Les trois états intermédiaires de l’iris du Juggernaut restent manquants ; les deux vues historiques sont conservées.',
        ],
        'certification': 'Aucune fidélité 1:1 certifiée. Un original retenu au catalogue et un candidat documentaire ne terminent pas la famille de décor.'
    }
    write_json(DOC / 'BIBLE_COVENANT_V018.json', bible)
    sources = '\n'.join(f"- **{r['id']} — {r['creator']}** : [{r['file']}]({r['url']}). {r['description']}" for r in manifest['references'])
    md = f'''# Alien: Covenant — continuation V018 : portes de la baie

Cette annexe prolonge la [bible exhaustive V017](BIBLE_COVENANT_V017.md), conservée avec ses quatre formats et ses empreintes. Elle ajoute **un sprite retenu au catalogue** : le sas latéral orange de la baie de terraformation, avec son panneau entrouvert observé sur la photographie du plateau. Une grande porte fermée reste **un candidat documentaire à réviser**, conservé séparément.

L’inventaire de production contient maintenant **155 PNG : 81 dans le rendu et 74 au catalogue**. Le candidat de grande porte n’entre pas dans ces 155 images. Les **154 originaux historiques**, **46 fichiers récupérés** et **16 candidats historiques** restent inchangés. Aucun rejet n’est promu. **Aucune fidélité 1:1 n’est certifiée.**

## Registre de cette continuation

| Élément | Statut | Dimensions natives | Taille | Admission dans le jeu |
|---|---|---:|---:|---|
| [Sas latéral orange](../../{side['path']}) | Retenu au catalogue | {side['width']} × {side['height']} | {side['bytes']:,} octets | Aucune |
| [Grande porte terminale](v018-candidates/{candidate['id']}.png) | Candidat à réviser, hors production | {candidate['width']} × {candidate['height']} | {candidate['bytes']:,} octets | Aucune |

Les fichiers sont les sorties PNG natives du générateur : alpha conservé, sans redimensionnement ni retouche des pixels. Les quatre prompts exacts, les références ordonnées, les empreintes et les deux essais écartés figurent dans le [manifeste V018](../../{SOURCE}). Les essais écartés sont identifiés sans ajouter leurs images au catalogue. Le [registre de provenance](PROVENANCE_V018.json) épingle les manifestes précédents, les documents V017 et les fichiers du moteur.

## Sas latéral : ce qui est documenté

La photographie **JAC_9576** de Jacinta Leong montre le sas orange au premier plan gauche. Le modèle **Cam001** confirme son organisation générale. La reconstruction conserve le carter orange, le socle gris, le cadre circulaire segmenté, les blocs de verrouillage, les nervures intérieures, les quatre embouts visibles sur chaque côté, l’écran incliné à gauche et l’éclairage rouge supérieur. Le panneau orange reste visible contre le côté gauche du passage, comme sur la photographie ; le seuil métallique est inclus.

Le passage est réellement transparent : la sonde de contrôle au pixel **(648, 694)** mesure un alpha nul. Le contour utile au seuil alpha ≥ 32 est **[70, 32, 1139, 1277]**. Aucun pixel du bord n’a un alpha supérieur à 16 ; le maximum mesuré au bord est 1, conservé dans l’original.

L’écran, sa microtypographie, certaines jonctions et les épaisseurs sont interprétés. La photographie en perspective ne fournit pas de métrique complète. Le sprite n’est lié à aucune collision, commande ni traversée ; son ouverture transparente ne crée pas une sortie du jeu.

## Grande porte : pourquoi elle reste à réviser

Le plan de Tony Drew documente **la grande ouverture terminale**, distincte du sas circulaire orange. La photographie **160601** de Leong apporte les surfaces grises et rouges de la porte fermée au fond du décor. Le modèle **Cam001** est une référence de forme complémentaire, dont les matériaux ne doivent pas être pris pour les couleurs définitives.

Le candidat a un contour utile de **1526 × 658 pixels**, soit **2,319:1**. L’objectif d’environ **2,8:1**, estimé par lecture de l’élévation publiée, donne un écart de rapport d’environ **−17,17 %**. Cette comparaison est indicative, sans valeur de mesure architecturale certifiée. La répartition du graphisme rouge est simplifiée en un grand croisement ; les panneaux, poignées et marques de surface demandent aussi une reprise. Le centre du vantail mesure un alpha natif de **253/255** : il paraît fermé, mais cette opacité n’est pas strictement maximale et reste signalée sans correction des pixels.

La première tentative présentait un rapport de **3,675:1** et trop de flèches répétées ; la dernière atteignait **3,413:1**. Ces deux tentatives sont exclues. Le candidat conservé constitue une étape documentaire et **ne satisfait pas le contrat de production de la grande porte**.

## Raccord à la bible et au moteur

Les deux sujets se rapportent au décor `cargo`, à la référence historique `ACOV-211` et aux travaux `ROOM-cargo-1` et `ROOM-cargo-2`. `ROOM-cargo-1` reste partiellement produit ; `ROOM-cargo-2` reste ouvert. La simulation, les **67 liaisons**, **134 seuils** et **630 occurrences de props** restent inchangés. Les **261 contrats de production** de la base restent disponibles ; cette annexe ne transforme pas un élément graphique en nouvelle pièce traversable.

La distribution utilise toujours le manifeste runtime **0.17.0**, avec six cycles et 48 phases. Ni le sas retenu, ni le candidat de porte, ni les prompts n’entrent dans le build. Le contrôle d’admission autorise les chemins source explicitement revus et refuse les autres fichiers dans ces dossiers.

Les trois états intermédiaires de l’iris du Juggernaut restent manquants. Ses états fermé et ouvert historiques gardent leur statut de catalogue, sans animation ajoutée.

## Références primaires inspectées

{sources}

Ces images de référence restent liées à leurs auteurs. Leurs octets ne sont pas republiés dans ce lot ; leurs dimensions, liens et SHA-256 sont conservés pour l’identification.

## Livrables et vérification

- [Lecture visuelle avec fonds de contrôle](BIBLE_COVENANT_V018.html).
- [Inventaire courant et annexe structurée](BIBLE_COVENANT_V018.json).
- [Mesures d’alpha](qa/v018/alpha.json) et [suivi des contrôles](SPRITES_V018_STATUS.md).
- [PR 79](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/79), sans fusion.
'''
    (DOC / 'BIBLE_COVENANT_V018.md').write_text(md)
    cards = []
    for row in [side, candidate]:
        selected = row['productionSelected']
        title = 'Sas latéral orange' if selected else 'Grande porte terminale'
        badge = 'Retenu au catalogue' if selected else 'Candidat à réviser · hors production'
        src = '../../' + row['path']
        limits = ''.join('<li>' + html.escape(t) + '</li>' for t in row['visualReview']['limits'])
        note = 'Passage central transparent ; panneau orange entrouvert comme sur le plateau.' if selected else 'Rapport visible 2,319:1 ; objectif indicatif ≈ 2,8:1. Écart ≈ −17,17 %. Graphisme rouge à reprendre.'
        cards.append(f'<article class="card"><div class="card-head"><span class="badge {"good" if selected else "review"}">{badge}</span><h2>{title}</h2></div><div class="image-stage"><img src="{src}" alt="{html.escape(row["title"])}" data-asset="{row["id"]}"></div><div class="detail"><p>{note}</p><p class="meta">{row["width"]} × {row["height"]} · PNG RGBA natif · {row["bytes"]:,} octets</p><ul>{limits}</ul><a href="{src}">Ouvrir le PNG original</a><details><summary>Empreinte SHA-256</summary><code>{row["sha256"]}</code></details></div></article>')
    reference_links = ''.join(f'<li><a href="{html.escape(r["url"],quote=True)}">{html.escape(r["creator"]+" — "+r["file"])}</a><p>{html.escape(r["description"])}</p></li>' for r in manifest['references'])
    page = '''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Covenant V018 — portes de la baie</title><style>
:root{color-scheme:dark;font-family:Inter,Arial,sans-serif;background:#0b1319;color:#e7eeef}*{box-sizing:border-box}body{margin:0}main{max-width:1280px;margin:auto;padding:38px 28px 60px}header{border-bottom:1px solid #30434b;padding-bottom:24px}.eyebrow{text-transform:uppercase;letter-spacing:.18em;font-size:12px;color:#84bdc7}h1{font-size:34px;line-height:1.2;margin:12px 0 16px;max-width:920px}h2{font-size:22px;line-height:1.3;margin:14px 0}p,li{line-height:1.6}a{color:#8cd6e1}header p{max-width:980px;color:#bed0d7}.stats{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}.stats span{padding:10px 13px;background:#172832;border:1px solid #30434b;border-radius:7px}.toolbar{display:flex;align-items:center;gap:10px;margin:23px 0;flex-wrap:wrap}.toolbar span{margin-right:8px}button{font:inherit;cursor:pointer;border:1px solid #5b7480;background:#13242d;color:#e7eeef;border-radius:5px;padding:8px 14px}button[aria-pressed=true]{background:#28616d;border-color:#8cd6e1}.cards{display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:start}.card{background:#132129;border:1px solid #34434c;border-radius:10px;overflow:hidden}.card-head{padding:20px 22px 8px}.badge{font-size:12px;font-weight:bold;border-radius:20px;padding:6px 10px;display:inline-block}.good{background:#164c40;color:#b6ecd5}.review{background:#5e4020;color:#ffe0ac}.image-stage{height:510px;display:flex;align-items:center;justify-content:center;padding:14px;background:repeating-conic-gradient(#22313a 0% 25%,#17232c 0% 50%) 0 0/28px 28px}.image-stage img{display:block;max-height:100%;max-width:100%;object-fit:contain}body[data-bg=light] .image-stage{background:#f0f0eb}body[data-bg=dark] .image-stage{background:#080c10}.detail{padding:18px 22px 25px}.detail p{margin:0 0 13px}.meta{font-size:13px;color:#9eb8c3}.detail ul{padding-left:21px;font-size:14px;color:#c2d1d7}.detail details{margin-top:16px;font-size:13px}.detail code{display:block;overflow-wrap:anywhere;margin-top:10px;color:#b3d1d8}section.notes{margin-top:30px;background:#132129;border:1px solid #34434c;border-radius:10px;padding:22px 26px}section.notes p{color:#c2d1d7}section.notes li{margin-bottom:12px;overflow-wrap:anywhere}footer{margin-top:26px;color:#9eb8c3;font-size:13px}@media(max-width:760px){main{padding:25px 16px}.cards{grid-template-columns:1fr}h1{font-size:28px}.image-stage{height:430px}}
</style></head><body data-bg="checker"><main><header><div class="eyebrow">Alien: Covenant · continuation V018</div><h1>Deux portes documentées, deux états de revue distincts</h1><p>Un sas latéral orange retenu au catalogue et une grande porte terminale conservée comme candidat à réviser. Les originaux natifs gardent leur alpha. Aucune fidélité 1:1 n’est certifiée.</p><div class="stats"><span><strong>155</strong> PNG de production</span><span><strong>81</strong> dans le rendu</span><span><strong>74</strong> au catalogue</span><span><strong>1</strong> candidat hors production</span></div></header><div class="toolbar" role="group" aria-label="Fond d’inspection des PNG"><span>Fond d’inspection</span><button data-bg="checker" aria-pressed="true">Damier</button><button data-bg="light" aria-pressed="false">Clair</button><button data-bg="dark" aria-pressed="false">Sombre</button></div><div class="cards">__CARDS__</div><section class="notes"><h2>Famille de décor encore ouverte</h2><p>Les sujets se rattachent à la baie <code>cargo</code>, à <code>ACOV-211</code> et aux travaux <code>ROOM-cargo-1</code> / <code>ROOM-cargo-2</code>. La grande porte demande une reprise de proportions et de graphisme. Les raccords, interactions, collisions et seuils du jeu sont conservés.</p><p>Les 154 PNG précédents, 46 fichiers récupérés et 16 candidats historiques restent intacts. La distribution utilise toujours les 81 PNG de son manifeste 0.17.0. Aucun de ces deux nouveaux fichiers n’est admis dans le jeu.</p><p><a href="BIBLE_COVENANT_V018.md">Lire l’annexe détaillée</a> · <a href="BIBLE_COVENANT_V018.json">Inventaire structuré</a> · <a href="BIBLE_COVENANT_V017.html">Bible exhaustive V017</a> · <a href="SPRITES_V018_STATUS.md">Contrôles et limites</a></p></section><section class="notes"><h2>Références primaires</h2><ul>__REFERENCES__</ul><p>Le plan de Tony Drew décrit la grande ouverture terminale ; il ne documente pas le sas orange. Les fichiers de référence restent liés à leurs auteurs.</p></section><footer>Une image par sujet ou tentative. Pixels et transparence natifs préservés ; aucune retouche après génération. Les deux essais exclus sont identifiés dans le manifeste sans publication de leurs PNG.</footer></main><script>for(const button of document.querySelectorAll('button[data-bg]'))button.addEventListener('click',()=>{document.body.dataset.bg=button.dataset.bg;for(const other of document.querySelectorAll('button[data-bg]'))other.setAttribute('aria-pressed',String(other===button))});</script></body></html>'''
    page = page.replace('__CARDS__', ''.join(cards)).replace('__REFERENCES__', reference_links)
    (DOC / 'BIBLE_COVENANT_V018.html').write_text(page + '\n')
    print(json.dumps({'ok': True, 'productionPngs': len(asset_index), 'runtimePngs': len(runtime_ids), 'candidateCountedAsProduction': False}))


if __name__ == '__main__':
    main()
