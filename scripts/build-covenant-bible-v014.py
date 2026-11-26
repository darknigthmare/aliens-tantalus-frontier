#!/usr/bin/env python3
"""Render the Covenant V014 bible from its canonical source-only JSON."""
import argparse
import copy
import hashlib
import html
import json
import re
import struct
from pathlib import Path


def read(path):
    return json.loads(Path(path).read_text())


def write(path, data):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def plain(value):
    if value is None:
        return ""
    if isinstance(value, bool):
        return "Oui" if value else "Non"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return "\n".join(plain(x) for x in value)
    if isinstance(value, dict):
        return "\n".join(str(k) + " : " + plain(v) for k, v in value.items() if v is not None and v != [] and v != "")
    return str(value)


def source_urls(record):
    found = []
    def walk(obj, key=""):
        if isinstance(obj, dict):
            for k, v in obj.items():
                if k in ["generationPrompt", "prompt", "runtimeExit", "sourceDefinition"]:
                    continue
                walk(v, k)
        elif isinstance(obj, list):
            for v in obj:
                walk(v, key)
        elif isinstance(obj, str) and obj.startswith(("https://", "http://")):
            if not any(x in obj for x in ["bing.com/images/search", "google.com/search"]):
                found.append(obj)
    walk(record)
    return list(dict.fromkeys(found))


def unique_text(items):
    return list(dict.fromkeys(plain(x).strip() for x in items if plain(x).strip()))


def repo_safe(value, base, repo):
    """Keep reproducible references and omit transient execution locators."""
    if isinstance(value, dict):
        result={}
        for k,v in value.items():
            if k=='source' and isinstance(v,str) and v.startswith('/home/'):
                v=value.get('url') or 'Référence visuelle documentée dans le manifeste associé.'
            result[k]=repo_safe(v,base,repo)
        return result
    if isinstance(value, list):
        return [repo_safe(v, base, repo) for v in value]
    if isinstance(value, str):
        value=value.replace(str(repo)+"/", "").replace(str(base)+"/", "")
        value=re.sub(r'https?://i\.ytimg\.com/sb/([^/]+)/[^\s"<>]*', r'https://www.youtube.com/watch?v=\1', value)
        if '/workspace/' in value or '/home/agent/' in value or re.search(r'exec-[0-9a-f]{8}-',value):
            raise ValueError("Transient execution locator remains in canonical bible")
    return value


def normalized_asset_index(assets, repo, runtime):
    admitted={a['id']:a for a in runtime['assets']}
    cycle_owner={aid:c for c in runtime.get('cycles',[]) for aid in c['frames']}
    result=[]
    for a in assets:
        path=repo/a['path']; raw=path.read_bytes()
        if raw[:8] != b'\x89PNG\r\n\x1a\n':
            raise ValueError('Asset is not a PNG: '+a['id'])
        width,height=struct.unpack('>II',raw[16:24])
        digest=hashlib.sha256(raw).hexdigest()
        q=a.get('alphaQA',{})
        claimed=a.get('sha256',q.get('sha256'))
        if claimed and claimed!=digest:
            raise ValueError('Asset hash differs from source manifest: '+a['id'])
        bind=admitted.get(a['id']); cycle=cycle_owner.get(a['id'])
        if bind:
            admission=('npc-cycle-frame' if cycle and cycle.get('consumer')=='npc' else
                       'player-cycle-frame' if cycle else 'room-background' if bind['kind']=='background' else 'runtime-'+bind['kind'])
        else:
            admission='catalogue-only'
        row={k:copy.deepcopy(a[k]) for k in ['id','path','category','kind','title','label','limitations','scope'] if k in a}
        row.update(width=width,height=height,bytes=len(raw),sha256=digest,runtimeAdmission=admission,
                   metadataSource='Original PNG bytes and current runtime manifest',verified1to1=False)
        row['releaseGroup']=re.search(r'alien-covenant-(v\d+)/',a['path']).group(1)
        if bind:
            row['runtimeBinding']={k:copy.deepcopy(bind[k]) for k in ['kind','key','state','rooms','actors'] if k in bind}
        if cycle:row['cycleId']=cycle['id']
        result.append(row)
    if set(admitted)-{x['id'] for x in result}:
        raise ValueError('Runtime references an asset absent from production manifests')
    return result


def assemble(base, repo):
    people_path = base / "research/v014/people-props/BIBLE_PERSONNAGES_ARMES_PROPS_V014.json"
    world_path = base / "research/v014/world/world-bible.json"
    remaining_path = base / "research/v014/world/remaining-reference-details.json"
    p, w, extra = read(people_path), read(world_path), read(remaining_path)
    manifest = read(repo / "assets/openai/sprites/alien-covenant-v014/manifest.json")
    current_assets = []
    manifest_receipts = []
    for v in ["v011", "v012", "v013", "v014"]:
        path = repo / f"assets/openai/sprites/alien-covenant-{v}/manifest.json"
        m = read(path)
        current_assets.extend(m["assets"])
        manifest_receipts.append({"path":str(path.relative_to(repo)), "sha256":sha(path), "pngs":len(m["assets"])})
    refs = {x["id"]:copy.deepcopy(x) for x in p["sourceReferenceIndex"]}
    for row in p.get("ownedSourceReferenceDetails", []):
        refs[row["id"]].update(copy.deepcopy(row))
    for row in w["referenceEntries"]:
        refs[row["id"]]["worldAudit"] = copy.deepcopy(row)
        related=[]
        for domain in ['rooms','vehicles','planets']:
            for detail in w[domain]:
                if row['id'] not in detail.get('sourceReferenceIds',[]):
                    continue
                slim={k:copy.deepcopy(detail[k]) for k in ['id','name','scope','description','scopeQualification','missingAssets','constraints','nextAction','roomIds'] if k in detail}
                impl=detail.get('existingImplementation',{})
                slim['existingImplementation']={k:copy.deepcopy(v) for k,v in impl.items() if k in ['native','generatedAssetIds','existingPng','admission','theme','view','visual','roomIds','renderNote']}
                slim['domain']=domain
                related.append(slim)
        refs[row['id']]['worldRelatedDetails']=related
    if isinstance(extra, list):
        extra_rows = extra
    else:
        extra_rows = next((extra[k] for k in ["items","entries","referenceEntries","details","records"] if isinstance(extra.get(k),list)), [])
    if not extra_rows:
        raise ValueError("Missing detailed remaining reference rows")
    for row in extra_rows:
        refs[row["id"]]["continuationAudit"] = copy.deepcopy(row)
        if row.get('sourceClaimCorrection'):
            refs[row['id']]['inheritedDescription']=refs[row['id']].get('description')
            refs[row['id']]['description']=row['description']
            refs[row['id']]['sourceClaimCorrection']=row['sourceClaimCorrection']
    correction_path=base/'research/v014/people-props/REFERENCE_CORRECTIONS_FINAL_V014.json'
    if correction_path.exists():
        correction=read(correction_path)
        for item in correction.get('affectedReferences',[]):
            refs[item['id']]['primarySourceClarification']={
                'correction':item['correction'],'source':correction['source'],
                'observation':correction['observation'],'samplingLimitation':correction['samplingLimitation']}
    profiles = copy.deepcopy(p["characterProfiles"])
    walter = next(x for x in profiles if x["id"] == "walter")
    walter["missingStates"] = [x for x in walter["missingStates"] if x.get("state") != "walk"]
    walter["currentV014Update"] = {
        "assetIds":[f"walter-walk-{i:02d}" for i in range(1,9)],
        "consumer":"walter-cryo", "room":"cryo", "state":"walk",
        "admission":"Mouvement effectif observé par le rendu, huit images décodées, mains libres, au sol.",
        "notCovered":["walter-injured","walter-field","autres présences","course","poses armées"],
        "angularFrequency":manifest["cycles"][0]["angularFrequency"],
        "animationFidelity1to1":False
    }
    for key in ["availableImageStates","runtimeImageStates"]:
        if isinstance(walter.get(key),list) and "walk" not in walter[key]:
            walter[key].append("walk")
    if isinstance(walter.get("runtimePngIds"),list):
        walter["runtimePngIds"] += [f"walter-walk-{i:02d}" for i in range(1,9)]
    walter["walkCycles"] = list(walter.get("walkCycles",[])) + [copy.deepcopy(manifest["cycles"][0])]
    walter["nextAction"] = "Revoir la continuité visuelle de la marche et ses contacts ; les autres états et profils de Walter conservent leurs besoins propres."
    for row in refs.values():
        if "walter" in row.get("linkedInventoryProfiles",[]):
            row["currentV014Update"] = copy.deepcopy(walter["currentV014Update"])
        row["verified1to1"] = False
    refs["ACOV-290"]["currentV014Update"] = {
        "assetIds":["portrait-shaw-the-crossing"],
        "scope":"Portrait tête-épaules du bonus officiel The Crossing seulement.",
        "doesNotComplete":["costume intégral","pose de gameplay","scène complète","plans du montage cinéma"]
    }
    refs["ACOV-017"]["relatedArtworkFromOtherScope"] = {
        "assetId":"portrait-shaw-the-crossing", "scope":"Bonus The Crossing",
        "note":"Complément de bible ; ne clôt pas cette fiche du montage cinéma."
    }
    walter_ref=refs['ACOV-016']
    for detail in walter_ref.get('existingDetailed',[]):
        if detail.get('profile')=='walter':
            detail['pngIds']=list(dict.fromkeys(detail.get('pngIds',[])+walter['currentV014Update']['assetIds']))
            detail['walkCycles']=[copy.deepcopy(manifest['cycles'][0])]
    for detail in walter_ref.get('missingDetailed',[]):
        if detail.get('profile')=='walter':
            detail['states']=[s for s in detail.get('states',[]) if s.get('state')!='walk']
    walter_ref['missingDetailed']=[d for d in walter_ref.get('missingDetailed',[]) if d.get('states') or d.get('profile')!='walter']
    walter_ref['relatedExistingPngIds']=list(dict.fromkeys(walter_ref.get('relatedExistingPngIds',[])+walter['currentV014Update']['assetIds']))
    walter_ref['nextAction']='Marche tenue de bord couverte uniquement pour walter-cryo dans cryo ; les états armés, la course et les profils terrain/blessé gardent leurs besoins distincts.'
    walter_ref['missingDetailed'].append({'profile':'walter','states':[{'state':'other-consumers-and-motion-states','reason':'Le cycle courant ne couvre que walter-cryo/cryo au sol, mains libres ; course, autres consommateurs et autres tenues restent hors de cette admission.'}]})
    refs['ACOV-017']['missingDetailed']=[{'state':'cinema-scope-not-covered-by-bonus-portrait','reason':'Le portrait tête-épaules The Crossing est produit au catalogue ; il ne fournit ni corps vivant dans le film cinéma, ni dépouille, ni silhouette intégrale de gameplay.'}]
    refs['ACOV-017']['nextAction']='Conserver la distinction entre le portrait du bonus désormais produit et la fiche cinéma ; ne pas substituer cette image aux restes de Shaw.'
    refs['ACOV-027']['missingDetailed']=[{'state':'covered-remains-support-and-placement','reason':'Séparer le support, la couverture et la fiche narrative ; le portrait The Crossing produit au catalogue ne représente pas le prop coveredremains.'}]
    refs['ACOV-027']['nextAction']='Documenter support, couverture et emplacement des restes ; garder le portrait The Crossing dans son périmètre de bonus.'
    candidates = copy.deepcopy(p["supplementalCandidates"])
    new_ids = {a["id"] for a in manifest["assets"]}
    for row in candidates:
        asset_id='portrait-shaw-the-crossing' if row['id']=='shaw-crossing' else row['id']
        if asset_id in new_ids:
            row["generationState"] = "generated-catalogue-only-v014"
            row["currentAssetIds"] = [asset_id]
        if row['id']=='shaw-crossing':
            row['appearanceAndVariants']=row.get('selection',row.get('dimensions',''))
            row['neededStates']=[]
            row['currentV014Update']={'assetIds':[asset_id],'admission':'catalogue-only','scope':'Portrait tête-épaules du prologue The Crossing ; aucun consommateur de campagne.'}
            row['nextAction']='Conserver ce portrait dans le catalogue du prologue ; costume entier et plans cinéma ne sont pas couverts.'
    for candidate in candidates:
        targets={'shaw-crossing':['ACOV-017'],'engineer-civilian':['ACOV-020','ACOV-021']}.get(candidate['id'],[])
        for rid in targets:
            refs[rid].setdefault('supplementalCharacterCandidates',[]).append(copy.deepcopy(candidate))
    weapons=copy.deepcopy(p['weaponFamilies'])
    for weapon in weapons:
        weapon['visualBrief']=unique_text(refs[i].get('appearanceAndVariants',refs[i].get('description','')) for i in weapon.get('sourceReferenceIds',[]) if i in refs)
        weapon['constraints']=list(weapon.get('constraints',[]))+['Identification et apparence issues des références associées, parfois secondaires ; aucune certification visuelle 1:1 ni nouvelle génération de sujet bloqué.']
    rooms = copy.deepcopy(w["rooms"])
    landing = next(r for r in rooms if r["id"] == "landing")
    landing["currentV014Update"] = {
        "assetId":"background-planet4-lake", "layer":"ciel lointain",
        "admission":"landing uniquement, avant sol, arbres, acteurs, props et seuils natifs.",
        "doesNotComplete":["sol jouable","rive","portes","Lander","autres salles"]
    }
    ship_ids = {"VEH-COVENANT","VEH-JUGGERNAUT","VEH-MOTHER-TUG","VEH-UNDERPLAZA","VEH-LASTSIGNS"}
    component_ids = {"PART-SAILS","PART-LIFTER-COCKPIT","SITE-DOCKINGBAY","PROP-TERRAFORMERS"}
    vehicles = [x for x in w["vehicles"] if x["id"] not in ship_ids | component_ids]
    ships = [x for x in w["vehicles"] if x["id"] in ship_ids]
    components = [x for x in w["vehicles"] if x["id"] in component_ids]
    prop_instances = []
    prop_families = copy.deepcopy(p["propFamilies"])
    for family in prop_families:
        prop_instances.extend(family.pop("instances"))
        family["instanceIds"] = [x["id"] for x in prop_instances if x["family"] == family["id"]]
    all_ids = [x["id"] for x in current_assets]
    assert len(all_ids) == len(set(all_ids))
    assert len(refs) == 315 and len(rooms) == 57 and len(prop_instances) == 630
    assert len({x["id"] for x in prop_instances}) == 630
    runtime=read(repo/'dlc/covenant/sprites-v011.json')
    asset_index=normalized_asset_index(current_assets,repo,runtime)
    current_runtime=sum(a['runtimeAdmission']!='catalogue-only' for a in asset_index)
    result = {
        "schemaVersion":1, "title":"Alien: Covenant — bible détaillée et manques",
        "version":"0.14.0", "date":"2026-11-26", "baselineCommit":"91db26589399405c4896130b469920cb2abc8fcb",
        "scope":"Registre récupéré de 315 références et contenu du module Covenant, enrichis par les sources de production consultées. Pas de certification plan par plan de tout le film.",
        "verified1to1":False,
        "policy":[
            "Film cinéma, bonus officiel, test, production et adaptation jouable restent distincts.",
            "Un PNG produit, une admission au rendu et une mécanique jouable sont des états différents.",
            "Les images d’origine V011 à V013 conservent leurs octets.",
            "Un état, une famille de surface ou une tâche de recherche n’équivaut pas à un PNG à produire.",
            "Aucune valeur du jeu ne décrit une cote filmique ou une caractéristique d’arme réelle.",
            "Les refus antérieurs de génération ne sont pas relancés ou contournés.",
            "Les codes et noms de source sont conservés ; une assertion héritée non recoupée reste explicitement incertaine."
        ],
        "summary":{
            "referenceEntries":315,"characterProfiles":23,"humanIdentitiesInProfiles":17,
            "namedIdentitiesIncludingSeparateShawPortrait":18,
            "sourceCharacterEntries":38,"biologyReferenceEntries":49,
            "weaponFamilies":7,"playableWeapons":4,"propFamilies":126,"propInstances":630,
            "filmCandidatePropFamilies":50,"spatialRecords":57,"campaignRecords":56,
            "independentTableaux":1,"distinctPhysicalSiteKeysIncludingTableau":55,
            "connections":67,"thresholds":134,"terrainFamilies":16,"planetEntries":3,
            "transportRecordsIncludingComponentsAndUnresolvedGroups":12,
            "pngs":len(current_assets),"newPngs":len(manifest["assets"]),
            "runtimePngs":current_runtime,"catalogueOnlyPngs":len(current_assets)-current_runtime,
            "playerWalkCycles":4,"npcWalkCycles":1,"animationPhases":40,
            "movingNpcProfilesWithoutWalkPng":15,"unconsumedProfilesWithoutWalk":3,
            "playerProfilesWithoutRunPng":4,"certified1to1Images":0,
            "worldWorkItemsNotPngCount":len(w["missingWork"])
        },
        "sourceSnapshots":[
            {"label":"Audit personnages/armes/props V013, enrichissement documentaire V014","sha256":sha(people_path)},
            {"label":"Audit monde V014","sha256":sha(world_path)},
            {"label":"Détails des autres références","sha256":sha(remaining_path)},
            {"path":"modules/covenant/dlc/covenant/content.js","sha256":sha(repo/"modules/covenant/dlc/covenant/content.js")}
        ],
        "sourceManifests":manifest_receipts,
        "bibleConnections":{
            "main":"docs/narrative/CAMPAGNE_PRINCIPALE.md",
            "existingConsolidationPullRequest":"https://github.com/darknigthmare/aliens-tantalus-frontier/pull/68",
            "existingConsolidationCommit":"16686e8681cc0370db3fa3df2967704ef1862155",
            "existingCovenantNote":"https://github.com/darknigthmare/aliens-tantalus-frontier/blob/16686e8681cc0370db3fa3df2967704ef1862155/docs/narrative/dlc/alien-covenant.md",
            "currentPullRequest":"https://github.com/darknigthmare/aliens-tantalus-frontier/pull/71",
            "policy":"Annexe liée depuis la bible principale ; la branche de consolidation PR68 n’est pas écrasée."
        },
        "characterProfiles":profiles,"weaponFamilies":weapons,
        "propFamilies":prop_families,"supplementalCandidates":candidates,
        "rooms":rooms,"vehicles":vehicles,"ships":ships,"worldComponents":components,
        "terrains":w["terrains"],"planets":w["planets"],
        "referenceRegister":list(refs.values()),"connections":w["connections"],"thresholds":w["thresholds"],
        "propInstances":prop_instances,"worldMissingWork":w["missingWork"],
        "worldReferenceCorrections":w.get("referenceCorrections",[]),
        "unresolvedAnnouncements":w.get("unresolvedAnnouncements",[]),
        "sources":{"peopleAndProps":p["sources"],"world":w["sources"]},
        "newAssets":[{**{k:copy.deepcopy(v) for k,v in a.items() if k not in ['generationPrompt','prompt']},
                      'promptSource':{'path':'assets/openai/sprites/alien-covenant-v014/manifest.json','assetId':a['id']}}
                     for a in manifest['assets']],
        "assetIndex":asset_index,
        "remainingReferenceDetailReceipt":{k:v for k,v in extra.items() if k not in ["items","entries","referenceEntries","details","records"]} if isinstance(extra,dict) else {}
    }
    return repo_safe(result,base,repo)


def concise_existing(row):
    if "currentV014Update" in row:
        update = row["currentV014Update"]
    else:
        update = None
    parts = []
    for key in ["existingSummary","currentConsumer","availableImageStates","runtimeImageStates","runtimePngIds","existingPngIds","existingDirectPngIds","relatedPngIdsNotBlanketCoverage","relatedExistingPngIds","relatedArtworkFromOtherScope","runtimeCoverage","runtimeEligibleInstances","existingDetailed","familyAnimationAudit"]:
        if key in row and row[key] not in [None,[],{},""]:
            parts.append(key + " : " + plain(row[key]))
    impl = row.get("existingImplementation")
    if isinstance(impl,dict):
        impl = {k:v for k,v in impl.items() if k in ["native","generatedAssetIds","admission","theme","view","chapter","widthGameUnits","visual","roomIds"]}
    if impl:
        parts.append(plain(impl))
    if update:
        parts.append("Ajout V014 : " + plain(update))
    for related in row.get('worldRelatedDetails',[]):
        if related.get('existingImplementation'):
            parts.append(related['id']+' — '+related['name']+' : '+plain(related['existingImplementation']))
    return "\n".join(parts) or "Présence documentaire ; consulter le mapping et ses limites."


def common(row, kind):
    raw=row
    # Projection used by all readable outputs; original audits remain in raw.
    row=copy.deepcopy(row)
    for key in ['worldAudit','continuationAudit']:
        row.update(copy.deepcopy(raw.get(key,{})))
    related=raw.get('worldRelatedDetails',[])
    missing = row.get("missingDetailed", row.get("missingStates",row.get("missingVisualStates",row.get("missingAssets",[]))))
    if related:
        if not isinstance(missing,list):missing=[missing] if missing else []
        missing += [{'record':x['id'],'missingAssets':x['missingAssets']} for x in related if x.get('missingAssets')]
    if kind == "Props" and not missing:
        missing = [row.get("missingDefinition",""),"États à spécifier : " + plain(row.get("requiredStatesToSpecify",[]))]
    if kind=='Profils' and not missing and not row.get('currentConsumer'):
        missing=[{'state':'consumer-not-defined','reason':'Consommateur absent ; états à spécifier si ce profil est intégré. Aucun cycle obligatoire déduit.'}]
    linked_appearance=unique_text(x.get('existingImplementation',{}).get('visual',{}).get('rule',x.get('description','')) for x in related)
    appearance = row.get("appearanceAndVariants",row.get("visualBrief",linked_appearance or row.get("description",row.get("sourceDescription",""))))
    locations = row.get("roomIds",row.get("rooms",row.get("resolvedScenes",row.get("currentRoomIds",row.get("scene",[])))))
    if row.get("playerRooms"):
        locations = [r["id"]+" — "+r["name"] for r in row["playerRooms"]]
    constraints = row.get("constraints",row.get("limits",[]))
    if not isinstance(constraints,list):constraints=[constraints]
    constraints=unique_text(constraints+row.get('limitsOfProof',[])+[row.get(k,'') for k in ['costumeConstraint','functionAndConstraint','limitation','normalizationNote','scopeQualification','evidenceLevel','sourceClaimCorrection','referenceReviewLimit','primarySourceClarification']]+[c for x in related for c in x.get('constraints',[])])
    next_action=row.get('nextAction') or unique_text(x.get('nextAction','') for x in related) or 'Recouper la référence propre à cette entrée et choisir un consommateur exact.'
    sources=source_urls(raw)
    if not sources:
        sources=['https://github.com/darknigthmare/aliens-tantalus-frontier/blob/91db26589399405c4896130b469920cb2abc8fcb/modules/covenant/dlc/covenant/content.js']
        constraints.append('Source citée : données de gameplay du projet au commit récupéré ; ce lien ne constitue pas une preuve filmique.')
    return {
        "id":row["id"],"name":row.get("name",row.get("label",row["id"])),"group":kind,
        "scope":plain(row.get("scope",row.get("categoryLabel","À préciser"))),
        "description":plain(row.get("description",row.get("narrativePurpose",row.get("role",row.get("sourceDescription",""))))),
        "appearance":plain(appearance),"existing":concise_existing(row),
        "missing":plain(missing),"constraints":plain(constraints),
        "locations":plain(locations),"nextAction":plain(next_action),
        "sources":sources,"referenceIds":row.get("sourceReferenceIds",row.get("referenceIds",[])),
        "details":raw
    }


def groups(data):
    result = []
    definitions = [
        ("Personnages",[r for r in data["referenceRegister"] if r["category"]=="Personnage"]),
        ("Profils",data["characterProfiles"]),("Lieux",data["rooms"]),("Armes",data["weaponFamilies"]),
        ("Props",data["propFamilies"]+[r for r in data["supplementalCandidates"] if r['id'] not in {'shaw-crossing','engineer-civilian'}]),
        ("Véhicules",data["vehicles"]),("Vaisseaux",data["ships"]),
        ("Composants",data["worldComponents"]),("Terrains",data["terrains"]),("Planètes",data["planets"]),
        ("Biologie",[r for r in data["referenceRegister"] if r["category"]=="Xénomorphe / biologie"]),
        ("Références",data["referenceRegister"])
    ]
    for title, rows in definitions:
        result.append({"name":title,"rows":[common(r,title) for r in rows]})
    return result


def markdown(data, gs):
    lines=["# Alien: Covenant — Bible détaillée V0.14","",
           "Cette annexe relie les personnages, lieux, armes, props, véhicules, vaisseaux, terrains et planètes au contenu récupéré du jeu et à ses références. Les identifiants et les manques sont conservés dans le JSON associé.","",
           "## État de la livraison","",
           "| Mesure | Valeur |","|---|---:|"]
    labels={"referenceEntries":"Références du registre","characterProfiles":"Profils d’apparence","weaponFamilies":"Familles d’armes","propFamilies":"Familles de props","propInstances":"Occurrences de props","spatialRecords":"Entrées spatiales (56 campagne + 1 tableau)","distinctPhysicalSiteKeysIncludingTableau":"Clés de site distinctes, tableau compris","connections":"Liaisons de jeu","thresholds":"Seuils orientés","terrainFamilies":"Familles de terrain","planetEntries":"Fiches planétaires","pngs":"PNG cumulés","newPngs":"Nouveaux PNG","runtimePngs":"PNG admis dans le rendu","catalogueOnlyPngs":"PNG de catalogue","certified1to1Images":"Images certifiées identiques à 1:1"}
    for k,label in labels.items():
        lines.append("| "+label+" | "+str(data["summary"][k])+" |")
    lines += ["","Les fiches de transport comprennent des groupes non résolus, des composants et un espace d’amarrage. Elles ne désignent pas douze véhicules jouables. Les 154 tâches monde sont des familles ou travaux de revue, pas un nombre de PNG manquants.","",
              "## Conventions",""]
    lines += ["- "+x for x in data["policy"]]
    lines += ["","## Raccord à la bible du jeu","",
              "[Bible principale](../narrative/CAMPAGNE_PRINCIPALE.md). [Fiche de consolidation existante](%s). [PR de cette continuation](%s)." % (data["bibleConnections"]["existingCovenantNote"],data["bibleConnections"]["currentPullRequest"]),
              "","Les fichiers HTML et XLSX constituent des vues de consultation et de suivi. Le JSON conserve les données complètes, les 630 occurrences et les 134 seuils sans perte.",""]
    field_labels=[("scope","Périmètre"),("description","Description et rôle"),("appearance","Apparence et variantes"),("existing","Existant et ajout courant"),("missing","Manques"),("constraints","Contraintes"),("locations","Salles et scènes"),("nextAction","Prochaine action")]
    for g in gs:
        lines += ["## "+g["name"],""]
        for r in g["rows"]:
            lines += ["### "+r["id"]+" — "+r["name"],""]
            for key,label in field_labels:
                if r[key]:
                    lines += ["**"+label+"**","",r[key],""]
            if r["referenceIds"]:
                lines += ["Références : "+", ".join(r["referenceIds"])+".",""]
            if r["sources"]:
                lines += ["Sources :",""]+["- "+u for u in r["sources"]]+[""]
    lines += ["## Liaisons et seuils","",
              "Les coordonnées ci-dessous sont celles du jeu. Elles ne représentent pas des dimensions de décors du film.","",
              "| Seuil | De | Vers | Support | Contact x | Contact z |","|---|---|---|---|---:|---:|"]
    for t in data["thresholds"]:
        e=t["runtimeExit"]; q=e.get("threshold",{}); c=q.get("contact",{})
        lines.append("| "+ " | ".join(str(x) for x in [t["id"],t["from"],t["to"],q.get("support",""),c.get("x",e.get("x","")),c.get("z",e.get("z",""))])+" |")
    lines += ["","## Occurrences de props","",
              "| ID | Famille | Salle | x | z | Largeur jeu | Hauteur jeu | PNG sélectionné |","|---|---|---|---:|---:|---:|---:|---|"]
    for p in data["propInstances"]:
        lines.append("| "+" | ".join(str(x) for x in [p["id"],p["family"],p["room"],p.get("x",""),p.get("z",""),p.get("widthGameUnits",""),p.get("heightGameUnits",""),p.get("selectedPngId") or "Rendu natif / conditionnel"])+" |")
    lines += ["","## Héritage non récupéré","",plain(data["unresolvedAnnouncements"]),"",
              "## Corrections et limites des références monde","",plain(data["worldReferenceCorrections"]),""]
    return "\n".join(lines)


HTML = r"""<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Alien: Covenant — Bible V0.14</title><style>
:root{color-scheme:dark;--bg:#10191c;--panel:#19282e;--line:#385057;--text:#e1e9e8;--dim:#a6babd;--accent:#d9b775}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.55 system-ui,sans-serif}header,main{max-width:1450px;margin:auto;padding:24px}header{border-bottom:1px solid var(--line)}h1{font-size:clamp(25px,4vw,42px);margin:4px 0}h2{font-size:23px}h3{font-size:17px;margin:0}.muted,small{color:var(--dim)}a{color:#a9d2dd}button,input,select{font:inherit;color:inherit;background:#21343a;border:1px solid #597077;border-radius:6px;padding:10px}button{cursor:pointer}button:hover{border-color:var(--accent)}.controls{display:flex;gap:10px;flex-wrap:wrap;margin:16px 0}input{min-width:240px;flex:1}.stats{display:flex;gap:20px;flex-wrap:wrap;margin:18px 0}.stats strong{font-size:25px;color:var(--accent);display:block}.layout{display:grid;grid-template-columns:minmax(270px,370px) minmax(0,1fr);gap:22px}.list{display:flex;flex-direction:column;gap:8px;max-height:78vh;overflow:auto}.entry{text-align:left}.entry small{display:block}.entry[aria-current=true]{border-color:var(--accent);background:#30444a}.detail{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:22px;min-height:350px}.field{margin-top:20px}.field h3{color:var(--accent)}.field p{white-space:pre-wrap;margin:6px 0;overflow-wrap:anywhere}.gallery{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0}.gallery figure{margin:0;width:min(240px,100%)}.gallery img{width:100%;height:180px;object-fit:contain;background:linear-gradient(45deg,#27363a 25%,transparent 25%,transparent 75%,#27363a 75%),linear-gradient(45deg,#27363a 25%,#1c292e 25%,#1c292e 75%,#27363a 75%);background-size:20px 20px;background-position:0 0,10px 10px}.gallery figcaption{font-size:12px;overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.5 ui-monospace,monospace}details{margin-top:24px;border-top:1px solid var(--line);padding-top:12px}.notice{max-width:1050px;color:var(--dim)}@media(max-width:800px){header,main{padding:16px}.layout{grid-template-columns:1fr}.list{max-height:34vh}.detail{padding:16px}}
</style><header><small>ALIENS — TANTALUS FRONTIER</small><h1>Alien: Covenant</h1><p>Bible détaillée et manques · V0.14 · 26 novembre 2026</p><div class="stats" id="stats"></div><p class="notice">Les entrées distinguent film, bonus, production et adaptation jouable. Un asset présent au catalogue ne devient pas automatiquement jouable. Les références héritées restent à recouper lorsqu’une preuve précise manque. Fidélité identique à 1:1 non certifiée.</p><p><a href="BIBLE_COVENANT_V014.xlsx">Ouvrir le tableur</a> · <a href="BIBLE_COVENANT_V014.md">Version texte</a> · <a href="BIBLE_COVENANT_V014.json">Données complètes</a> · <a href="https://github.com/darknigthmare/aliens-tantalus-frontier/pull/71">PR de continuation</a></p></header>
<main><div class="controls"><select id="group" aria-label="Catégorie"></select><input id="search" type="search" placeholder="Nom, identifiant, salle ou manque…" aria-label="Rechercher dans la bible"><button id="reset">Réinitialiser</button></div><p id="count" class="muted"></p><div class="layout"><nav class="list" id="list" aria-label="Fiches"></nav><article class="detail" id="detail"></article></div></main>
<script id="bible-data" type="application/json">__PAYLOAD__</script><script>
"use strict";
const data=JSON.parse(document.getElementById("bible-data").textContent), group=document.getElementById("group"), search=document.getElementById("search"), list=document.getElementById("list"), detail=document.getElementById("detail"), assets=new Map(data.assets.map(a=>[a.id,a]));
const labels={scope:"Périmètre",description:"Description et rôle",appearance:"Apparence et variantes",existing:"Existant et ajout V014",missing:"Manques",constraints:"Contraintes",locations:"Salles et scènes",nextAction:"Prochaine action"};
function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
for(const g of data.groups){const o=node("option",g.name+" ("+g.rows.length+")");o.value=g.name;group.append(o);}
for(const [label,key] of [["PNG cumulés","pngs"],["Nouveaux PNG","newPngs"],["PNG admis","runtimePngs"],["Références suivies","referenceEntries"]]){const x=node("div");x.append(node("strong",String(data.summary[key])),node("span",label));document.getElementById("stats").append(x);}
let selected="";
function assetIds(row){const found=new Set();function walk(v){if(typeof v==="string"&&assets.has(v))found.add(v);else if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==="object")Object.values(v).forEach(walk);}walk(row.details);return [...found];}
function show(row){selected=row.id;detail.replaceChildren(node("small",row.group+" · "+row.id),node("h2",row.name));const images=assetIds(row);if(images.length){const gallery=node("div",undefined,"gallery");for(const id of images){const asset=assets.get(id),fig=node("figure"),im=document.createElement("img");im.alt=asset.title||asset.label||id;im.loading="lazy";let fallback=false;im.onerror=()=>{if(!fallback){fallback=true;im.src="../../"+asset.path;}else{im.alt="Image accessible dans le pack de sprites : "+id;im.onerror=null;}};im.src="../sprites/"+id+".png";fig.append(im,node("figcaption",id));gallery.append(fig);}detail.append(gallery);}for(const [key,label] of Object.entries(labels)){if(row[key]){const f=node("section",undefined,"field");f.append(node("h3",label),node("p",row[key]));detail.append(f);}}if(row.sources.length){const s=node("section",undefined,"field");s.append(node("h3","Sources"));for(const url of row.sources){const p=node("p"),a=node("a",url);a.href=url;a.target="_blank";a.rel="noopener noreferrer";p.append(a);s.append(p);}detail.append(s);}const raw=node("details");raw.append(node("summary","Données détaillées de la fiche"),node("pre",JSON.stringify(row.details,null,2)));detail.append(raw);for(const b of list.children)b.setAttribute("aria-current",String(b.dataset.id===selected));}
function render(){const g=data.groups.find(g=>g.name===group.value),q=search.value.trim().toLocaleLowerCase("fr");const rows=g.rows.filter(r=>!q||JSON.stringify(r).toLocaleLowerCase("fr").includes(q));list.replaceChildren();document.getElementById("count").textContent=rows.length+" fiche(s) affichée(s) dans "+g.name+". Les catégories sont des vues de consultation ; leurs comptes ne s’additionnent pas en personnages ou lieux uniques.";for(const r of rows){const b=node("button",undefined,"entry");b.dataset.id=r.id;b.append(node("strong",r.name),node("small",r.id+" · "+r.scope));b.onclick=()=>show(r);list.append(b);}const active=rows.find(r=>r.id===selected)||rows[0];if(active)show(active);else detail.replaceChildren(node("p","Aucune fiche ne correspond à cette recherche."));}
group.onchange=render;search.oninput=render;document.getElementById("reset").onclick=()=>{search.value="";render();};render();
</script></html>"""


def table_payload(data, gs):
    headers=["Identifiant","Nom","Périmètre","Description / rôle","Apparence / variantes","Existant / ajout V014","Manques","Salles / scènes","Contraintes","Prochaine action","Sources"]
    tables=[{"name":g["name"],"headers":headers,"rows":[[r[k] if k!="sources" else "\n".join(r[k]) for k in ["id","name","scope","description","appearance","existing","missing","locations","constraints","nextAction","sources"]] for r in g["rows"]]} for g in gs]
    tables.append({"name":"Seuils","headers":["ID","De","Vers","Liaison","Type","Support","Matériau","Contact x (jeu)","Contact z (jeu)","Justification","Validation restante"],"rows":[[r["id"],r["from"],r["to"],r["connectionId"],r["runtimeExit"].get("threshold",{}).get("type",""),r["runtimeExit"].get("threshold",{}).get("support",""),r["runtimeExit"].get("threshold",{}).get("material",""),r["runtimeExit"].get("x"),r["runtimeExit"].get("z"),r["runtimeExit"].get("threshold",{}).get("rationale",""),r["validationNeed"]] for r in data["thresholds"]]})
    tables.append({"name":"Occurrences","headers":["ID","Famille","Salle","x (jeu)","z (jeu)","Largeur (jeu)","Hauteur (jeu)","Solide","PNG sélectionné","État","Raisons / limites"],"rows":[[r["id"],r["family"],r["room"],r.get("x"),r.get("z"),r.get("widthGameUnits"),r.get("heightGameUnits"),r.get("solid",False),r.get("selectedPngId") or "",r.get("status",""),plain(r.get("suppressionReasons",[])+r.get("forcedProceduralReasons",[])+r.get("conditionalFallbackReasons",[]))] for r in data["propInstances"]]})
    tables.append({"name":"Production","headers":["ID","Catégorie","Admission","Chemin source","Largeur px","Hauteur px","Octets","SHA256","Périmètre","Limites","Lot"],"rows":[[r["id"],r.get("category",r.get("kind","")),r.get("runtimeAdmission","historique"),r["path"],r.get("width"),r.get("height"),r.get("bytes"),r.get("sha256",""),r.get("scope",""),plain(r.get("limitations",[])),r.get('releaseGroup','')] for r in data["assetIndex"]]})
    return {"title":data["title"],"version":data["version"],"summary":data["summary"],"policy":data["policy"],"tables":tables}


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--assemble-inputs",type=Path)
    parser.add_argument("--root",type=Path,default=Path(__file__).resolve().parents[1])
    parser.add_argument("--tables-out",type=Path)
    args=parser.parse_args()
    folder=args.root/"docs/covenant";canonical=folder/"BIBLE_COVENANT_V014.json"
    if args.assemble_inputs:
        data=assemble(args.assemble_inputs,args.root)
        write(canonical,data)
    else:
        data=read(canonical)
    gs=groups(data)
    (folder/"BIBLE_COVENANT_V014.md").write_text(markdown(data,gs))
    payload={"summary":data["summary"],"groups":gs,"assets":data["assetIndex"]}
    encoded=json.dumps(payload,ensure_ascii=False,separators=(",",":")).replace("<","\\u003c")
    (folder/"BIBLE_COVENANT_V014.html").write_text(HTML.replace("__PAYLOAD__",encoded))
    if args.tables_out:
        write(args.tables_out,table_payload(data,gs))
    print(json.dumps({"bible":str(canonical),"groups":{g["name"]:len(g["rows"]) for g in gs},"summary":data["summary"]},ensure_ascii=False))


if __name__ == "__main__":
    main()
