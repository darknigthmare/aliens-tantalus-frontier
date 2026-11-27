#!/usr/bin/env python3
"""Consolidate Covenant V015 and V016, then describe the V017 source/runtime state.

Historical bibles, PNGs and manifests are inputs only. Source statements remain
dated evidence; current availability comes from original files and the registry.
No renderer, geometry, image pixels, game state or historical document is edited.
"""
import argparse
import copy
import importlib.util
import json
import sys
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("covenant_bible_v016", HERE / "build-covenant-bible-v016.py")
PREVIOUS = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PREVIOUS)
BASE = PREVIOUS.BASE
DOMAINS = PREVIOUS.DOMAINS
VERSION, RELEASE = "0.17.0", "v017"
HISTORICAL_DOMAINS = DOMAINS + ["referenceRegister", "connections", "thresholds", "propInstances"]
UNION_FIELDS = {"sourceUrls", "sourceRefs", "sourceReferences", "constraints", "limits",
                "sourceReferenceIds", "referenceIds", "additionalSources"}
CANDIDATE_CHARACTERS = {"shaw-crossing", "engineer-civilian", "ankor-eva-heavy"}
LIVE_PROPS = {"console", "navigationdisplay", "crane", "freight-cart", "freight-rail", "freight-dock",
              "maintenance-fan", "stone-crown", "hydraulic-lever", "counterweight", "sluice-gauge"}


def unique(items):
    out = []
    for value in items:
        if value is not None and value != "" and value not in out:
            out.append(copy.deepcopy(value))
    return out


def ids(rows):
    return [row["id"] for row in rows]


def path_in_repo(path, repo):
    return str(path.resolve().relative_to(repo))


def native_content(repo):
    text = (repo / "modules/covenant/dlc/covenant/content.js").read_text()
    prefix = "(function(root){const data="
    if not text.startswith(prefix):
        raise ValueError("Unrecognized native content wrapper")
    return json.loads(text[len(prefix):text.rfind(";if(typeof module")])


def remember(row, field):
    if field in row:
        row.setdefault("baselineFieldValuesV017", {}).setdefault(field, copy.deepcopy(row[field]))


def merge_record(target, incoming):
    """Prefer V016 current fields, retain every conflicting V015 field explicitly."""
    for key, value in incoming.items():
        if key not in target:
            target[key] = copy.deepcopy(value)
        elif target[key] != value:
            target.setdefault("historicalFieldValuesV015", {})[key] = copy.deepcopy(value)
            if key in UNION_FIELDS and isinstance(value, list) and isinstance(target[key], list):
                target[key] = unique(target[key] + value)


def merge_baselines(v016, v015, paths, repo):
    data = copy.deepcopy(v016)
    merged_fields = 0
    for domain in HISTORICAL_DOMAINS:
        target = {row["id"]: row for row in data[domain]}
        for row in v015.get(domain, []):
            if row["id"] in target:
                before = set(target[row["id"]])
                merge_record(target[row["id"]], row)
                merged_fields += len(set(target[row["id"]]) - before)
            else:
                data[domain].append(copy.deepcopy(row))
                target[row["id"]] = data[domain][-1]
    for key in ["worldReferenceCorrections", "sourceSnapshots", "unresolvedAnnouncements"]:
        data[key] = unique(data.get(key, []) + v015.get(key, []))
    data["sources"]["continuationV015"] = copy.deepcopy(v015.get("v015Sources", []))
    data["v015ProductionLinks"] = copy.deepcopy(v015.get("v015ProductionLinks", []))
    data["catalogueCycles"] = copy.deepcopy(v015.get("catalogueCycles", []))
    metadata_keys = [key for key in v015 if key not in v016]
    data["historicalV015Metadata"] = {key: copy.deepcopy(v015[key]) for key in metadata_keys}
    data["historicalReleaseAssets"] = {
        "v015": copy.deepcopy(v015.get("newAssets", [])),
        "v016": copy.deepcopy(v016.get("newAssets", [])),
    }
    data["sourceReleaseHistoryV017"] = [
        {"version": source["version"], "date": source.get("date"), "path": path_in_repo(path, repo),
         "sha256": BASE.sha(path), "summary": copy.deepcopy(source["summary"]),
         "status": source.get("status", source.get("continuationV016", {}).get("status")),
         "policy": copy.deepcopy(source.get("policy", []))}
        for source, path in zip([v016, v015], paths)
    ]
    data["continuationV017"] = {
        "status": "awaiting-final-manifest", "requestDomains":
        ["personnages", "lieux", "armes", "props", "véhicules", "vaisseaux", "terrains", "planètes"],
        "mergePolicy": "V016 conserve ses contrats ; les compléments V015 sont réunis par identifiant. "
                       "Les valeurs différentes sont conservées comme assertions historiques datées.",
        "baselinePaths": [path_in_repo(path, repo) for path in paths],
        "mergedAdditionalFieldCount": merged_fields,
        "historicalCountsAreNotCurrentCounts": True,
    }
    return data


def load_manifests(data, repo, draft):
    current_path = repo / f"assets/openai/sprites/alien-covenant-{RELEASE}/manifest.json"
    if not current_path.exists() and not draft:
        raise ValueError("The final V017 manifest is required before generating deliverables")
    manifests, assets, receipts = [], [], []
    for path in sorted((repo / "assets/openai/sprites").glob("alien-covenant-v0*/manifest.json")):
        release = path.parent.name.removeprefix("alien-covenant-")
        if not "v011" <= release <= RELEASE:
            continue
        manifest = BASE.read(path)
        if manifest.get("schemaVersion") != 1 or not isinstance(manifest.get("assets"), list):
            raise ValueError("Invalid production manifest: " + str(path))
        for asset in manifest["assets"]:
            row = copy.deepcopy(asset)
            row["_sourceManifest"] = path_in_repo(path, repo)
            row["_sourceRelease"] = release
            assets.append(row)
        manifests.append((release, manifest))
        receipts.append({"path": path_in_repo(path, repo), "sha256": BASE.sha(path), "pngs": len(manifest["assets"])})
    if len(set(ids(assets))) != len(assets):
        raise ValueError("Duplicate asset identifiers across production manifests")
    runtime = BASE.read(repo / "dlc/covenant/sprites-v011.json")
    data["assetIndex"] = BASE.normalized_asset_index(assets, repo, runtime)
    data["sourceManifests"] = receipts
    manifest = next((m for release, m in manifests if release == RELEASE), {})
    data["newAssets"] = [
        {**{k: copy.deepcopy(v) for k, v in a.items() if k not in {"prompt", "generationPrompt", "localPath"}},
         "promptSource": {"path": path_in_repo(current_path, repo), "assetId": a["id"]}}
        for a in manifest.get("assets", [])
    ]
    continuation = data["continuationV017"]
    for key in ["referenceCorrections", "deferred", "generationFailures", "generationRejections", "blocked",
                "incompleteCycles", "blockedCarriedForward", "notAttemptedAfterRelatedOutputRejection",
                "runtimePromotions", "runtimeAdoptions", "validationEvidence", "placementReview"]:
        if key in manifest:
            continuation[key] = copy.deepcopy(manifest[key])
    for correction in manifest.get("referenceCorrections", []):
        if correction not in data["worldReferenceCorrections"]:
            data["worldReferenceCorrections"].append(copy.deepcopy(correction))
    candidates = {row["id"]: row for row in data["supplementalCandidates"]}
    reference_ids = set(ids(data["referenceRegister"]))
    for addition in manifest.get("supplementalCandidates", []):
        rid = addition["id"]
        if rid in candidates:
            candidates[rid]["sourceSupplementV017"] = copy.deepcopy(addition)
            continue
        if not all(addition.get(k) for k in ["name", "scope", "sourceDescription"]) or not BASE.source_urls(addition):
            raise ValueError("Candidate needs attributed name, scope, description and source: " + rid)
        if set(PREVIOUS.record_refs(addition)) - reference_ids:
            raise ValueError("Unknown ACOV reference in candidate: " + rid)
        row = copy.deepcopy(addition)
        row.update(verified1to1=False, currentConsumer=None)
        row.setdefault("generationState", "documented-production-reference")
        data["supplementalCandidates"].append(row)
        candidates[rid] = row
    return manifests, assets, runtime, manifest


def production_links(asset, records):
    link = asset.get("bibleLinks", {})
    candidates = list(asset.get("bibleRecordIds", [])) + list(asset.get("relatedBibleIds", []))
    candidates += list(asset.get("referenceIds", [])) + list(asset.get("sourceReferenceIds", []))
    candidates += list(asset.get("documentaryRoomIds", []))
    if asset.get("profileId"):
        candidates.append(asset["profileId"])
    if asset.get("rendererKey"):
        candidates.append(asset["rendererKey"])
    if asset.get("family"):
        candidates.append(asset["family"])
    if isinstance(link, dict):
        for key in ["recordIds", "referenceIds", "roomIds", "familyIds"]:
            candidates += link.get(key, [])
        if link.get("family"):
            candidates.append(link["family"])
    elif isinstance(link, list):
        candidates += [v for v in link if isinstance(v, str)]
    return [rid for rid in unique(candidates) if rid in records]


def reconcile_assets(data, assets, runtime, manifest, original):
    current = {a["id"]: a for a in data["assetIndex"]}
    raw_assets = {a["id"]: a for a in assets}
    records = {r["id"]: r for domain in DOMAINS + ["referenceRegister"] for r in data[domain]}
    instances = {r["id"]: r for r in data["propInstances"]}
    old_runtime = {r["id"]: r for r in original["assetIndex"] if r.get("runtimeBinding")}
    bindings = {r["id"]: r for r in runtime["assets"]}
    for aid, previous in old_runtime.items():
        if aid not in current or current[aid].get("runtimeBinding") != previous["runtimeBinding"]:
            raise ValueError("Historical runtime binding was removed or changed: " + aid)
    for asset in assets:
        release = asset["_sourceRelease"]
        if release < "v015":
            continue
        record_ids = production_links(asset, records)
        if release == RELEASE and not record_ids:
            raise ValueError("V017 image is not connected to any bible record: " + asset["id"])
        for rid in record_ids:
            row = records[rid]
            update = row.setdefault("currentV017Update", {
                "assetIds": [], "assetAdmissions": {}, "sourceUrls": [],
                "scope": "État consolidé actuel ; les ajouts historiques gardent leur date et leur portée."})
            update["assetIds"] = unique(update["assetIds"] + [asset["id"]])
            update["assetAdmissions"][asset["id"]] = current[asset["id"]]["runtimeAdmission"]
            update["sourceUrls"] = unique(update["sourceUrls"] + BASE.source_urls(asset))
    promoted = []
    for aid, binding in bindings.items():
        if aid in old_runtime or binding["kind"] != "prop":
            continue
        oid = binding["key"]
        if oid not in instances or binding.get("rooms") != [instances[oid]["room"]]:
            raise ValueError("New prop binding must target one exact existing occurrence: " + aid)
        occurrence = instances[oid]
        if occurrence.get("suppressionReasons") or occurrence.get("forcedProceduralReasons"):
            raise ValueError("A suppressed or native-only occurrence cannot be marked covered: " + oid)
        for field in ["selectedPngId", "runtimeEligibleWhenVisibleAndLoaded", "status"]:
            remember(occurrence, field)
        for key in ["directFamilyPngIds", "runtimeMatchedPngIds"]:
            occurrence[key] = unique(occurrence.get(key, []) + [aid])
        occurrence.update(selectedPngId=aid, runtimeEligibleWhenVisibleAndLoaded=True, status="png-runtime-eligible")
        proof = {"assetId": aid, "occurrenceId": oid, "room": occurrence["room"],
                 "scope": "Cette occurrence seule ; coordonnées, dimensions et solidité natives conservées."}
        occurrence["currentV017Admission"] = proof
        promoted.append(proof)
        for rid in [occurrence["family"], occurrence["room"]]:
            row = records[rid]
            update = row.setdefault("currentV017Update", {
                "assetIds": [], "assetAdmissions": {}, "sourceUrls": [],
                "scope": "État consolidé actuel ; admission limitée au consommateur déclaré."})
            update["assetIds"] = unique(update["assetIds"] + [aid])
            update["assetAdmissions"][aid] = current[aid]["runtimeAdmission"]
            update["sourceUrls"] = unique(update["sourceUrls"] + BASE.source_urls(raw_assets[aid]))
            update["occurrenceIds"] = unique(update.get("occurrenceIds", []) + [oid])
    data["continuationV017"]["admittedExistingOccurrences"] = promoted
    for family in data["propFamilies"]:
        rows = [r for r in data["propInstances"] if r["family"] == family["id"]]
        eligible = sum(bool(r.get("runtimeEligibleWhenVisibleAndLoaded")) for r in rows)
        suppressed = sum(bool(r.get("suppressionReasons")) for r in rows)
        native = sum(not r.get("suppressionReasons") and bool(r.get("forcedProceduralReasons")) for r in rows)
        family.update(runtimeEligibleInstances=eligible, missingRuntimeInstances=len(rows) - eligible,
                      runtimeCoverage="full" if eligible == len(rows) else "partial" if eligible else "none")
        family["coverageAccountingV017"] = {
            "total": len(rows), "eligiblePngInstances": eligible, "suppressedInstances": suppressed,
            "nativeRequiredInstances": native, "otherNonPngInstances": len(rows) - eligible - suppressed - native,
            "meaning": "Une occurrence sans PNG peut être masquée ou native par contrat. "
                       "Ce total n’est pas une commande de produire un PNG pour chaque occurrence."}
        family["existingDirectPngIds"] = unique(family.get("existingDirectPngIds", []) +
                                               [r["selectedPngId"] for r in rows if r.get("selectedPngId")])
    for candidate in data["supplementalCandidates"]:
        found = unique(candidate.get("currentAssetIds", []) +
                       candidate.get("currentV014Update", {}).get("assetIds", []) +
                       candidate.get("currentV016Update", {}).get("assetIds", []) +
                       candidate.get("currentV017Update", {}).get("assetIds", []))
        found = [aid for aid in found if aid in current]
        if not found:
            continue
        for field in ["generationState", "currentAssetIds", "neededStates"]:
            remember(candidate, field)
        candidate["currentAssetIds"] = found
        candidate["generationState"] = ("generated-runtime-scoped" if any(aid in bindings for aid in found)
                                         else "generated-catalogue-only")
        required = candidate.get("neededStates", [])
        candidate["requiredStateSpecificationV017"] = copy.deepcopy(required)
        candidate["availableStates"] = unique(s for aid in found for s in raw_assets[aid].get("availableStates", []))
        if candidate["id"] not in CANDIDATE_CHARACTERS:
            satisfied = [s for s in required if s in candidate["availableStates"]
                         or s in {"isolated-static", "isolated-static-catalogue"}]
        else:
            satisfied = [s for s in required if s in candidate["availableStates"]]
        candidate["satisfiedProductionStatesV017"] = satisfied
        candidate["missingStates"] = [s for s in required if s not in satisfied]
        candidate.setdefault("nextAction", "Conserver les images produites et leur attribution. Qualifier séparément les vues, "
                             "états ou consommateurs encore absents ; aucune intégration implicite.")
    for row in records.values():
        update = row.get("currentV017Update")
        if update:
            admissions = {"catalogue-only" if v == "catalogue-only" else "runtime-scoped"
                          for v in update["assetAdmissions"].values()}
            update["admission"] = next(iter(admissions)) if len(admissions) == 1 else "mixed-runtime-and-catalogue"


def reconcile_cycles(data, assets, manifests, runtime):
    by_asset = {a["id"]: a for a in assets}
    runtime_cycles = {c["id"]: c for c in runtime.get("cycles", [])}
    definitions = {}
    for release, manifest in manifests:
        for cycle in manifest.get("cycles", []) + manifest.get("catalogueCycles", []):
            record = copy.deepcopy(cycle)
            record["sourceRelease"] = release
            definitions[record["id"]] = record
    for cycle in data.get("catalogueCycles", []):
        definitions.setdefault(cycle["id"], copy.deepcopy(cycle))
    for cycle in runtime_cycles.values():
        definitions.setdefault(cycle["id"], copy.deepcopy(cycle))
    published, frame_owners = [], {}
    for cycle in definitions.values():
        frames = cycle.get("frames", [])
        if len(frames) != 8 or len(set(frames)) != 8 or any(aid not in by_asset for aid in frames):
            raise ValueError("Declared complete cycle lacks eight unique published frames: " + cycle["id"])
        if frames != [cycle["id"] + "-" + str(n).zfill(2) for n in range(1, 9)]:
            raise ValueError("Unexpected phase identities/order in complete cycle: " + cycle["id"])
        for aid in frames:
            if aid in frame_owners:
                raise ValueError("A phase belongs to two declared cycles: " + aid)
            frame_owners[aid] = cycle["id"]
        admitted = runtime_cycles.get(cycle["id"])
        enabled = admitted is not None
        if enabled and admitted["frames"] != frames:
            raise ValueError("Published and runtime cycle frames differ: " + cycle["id"])
        cycle["publishedComplete"] = True
        cycle["runtimeEnabled"] = enabled
        cycle["qualificationV017"] = ("complete-published-cycle-with-runtime-admission" if enabled
                                      else "eight-published-frames-catalogue-only-runtime-animation-not-validated")
        if not enabled:
            cycle["runtimeIntegrated"] = False
        published.append(cycle)
    data["publishedCyclesV017"] = published
    data["catalogueCycles"] = [copy.deepcopy(c) for c in published if not c["runtimeEnabled"]]
    incomplete = copy.deepcopy(data.get("continuationV016", {}).get("incompleteCharacterSequences", []))
    for release, manifest in manifests:
        grouped = {}
        for asset in manifest.get("assets", []):
            descriptor = asset.get("incompleteCycle")
            if descriptor:
                row = grouped.setdefault(descriptor["id"], {**copy.deepcopy(descriptor), "assetIds": [],
                    "rendererKey": asset.get("rendererKey", asset.get("profileId")), "state": asset.get("state")})
                row["assetIds"].append(asset["id"])
        for row in grouped.values():
            row.update(suppliedFrames=len(row["assetIds"]), runtimeEnabled=False, sourceRelease=release)
            if any(aid in {a["id"] for a in runtime["assets"]} for aid in row["assetIds"]):
                raise ValueError("Incomplete sequence has runtime frames: " + row["id"])
            incomplete = [old for old in incomplete if old["id"] != row["id"]] + [row]
    data["incompleteCharacterSequencesV017"] = incomplete
    profiles = {p["id"]: p for p in data["characterProfiles"]}
    for profile in profiles.values():
        key = profile["id"]
        previous_walk_ids = {c["id"] for c in profile.get("walkCycles", [])}
        owned = [c for c in published if c.get("key", c.get("rendererKey")) == key]
        served = [c for c in runtime_cycles.values() if c.get("key", c.get("rendererKey")) == key]
        for field in ["availableImageStates", "runtimeImageStates", "runtimePngIds", "walkCycles", "missingStates"]:
            remember(profile, field)
        profile["walkCycles"] = [copy.deepcopy(c) for c in served if c.get("state") == "walk"]
        profile["publishedWalkCyclesV017"] = [copy.deepcopy(c) for c in owned if c.get("state") == "walk"]
        profile["catalogueWalkCyclesV017"] = [copy.deepcopy(c) for c in owned if not c["runtimeEnabled"]]
        profile["availableImageStates"] = unique(profile.get("availableImageStates", []) + [c["state"] for c in owned])
        selected = [a for a in runtime["assets"] if a["kind"] == "human" and a["key"] == key]
        profile["runtimeImageStates"] = unique(a["state"] for a in selected)
        profile["runtimePngIds"] = [a["id"] for a in selected]
        production_states = {c["state"] for c in owned}
        profile["missingStates"] = [s for s in profile.get("missingStates", []) if s.get("state") not in production_states]
        profile["integrationPendingStatesV017"] = [
            {"state": c["state"], "cycleId": c["id"], "assetIds": c["frames"],
             "reason": "Les huit PNG existent. Les pivots, transitions et consommateurs doivent être validés avant admission."}
            for c in owned if not c["runtimeEnabled"]]
        if not profile.get("currentConsumer") and profile["missingStates"]:
            profile["conditionalRequirementsV017"] = [
                {**copy.deepcopy(s), "condition": "Définir un consommateur réel avant de considérer cet état requis.",
                 "reason": "Exigence héritée d’un profil sans acteur courant, à réévaluer si une scène utilise cet état. "
                           "Aucune génération liée à une arme refusée n’est relancée."}
                for s in profile["missingStates"]]
            profile["missingStates"] = []
        if profile["integrationPendingStatesV017"]:
            remember(profile, "nextAction")
            profile["nextAction"] = ("Contrôler le cycle déjà produit pour l’acteur et la tenue déclarés. "
                                     "Le rendu actuel reste celui du registre ; ne pas produire un doublon de ces huit phases.")
        new_walks = [c for c in profile["walkCycles"] if c["id"] not in previous_walk_ids]
        if new_walks:
            remember(profile, "nextAction")
            actor_ids = unique(actor for c in new_walks for actor in c.get("actors", []))
            room_ids = unique(room for c in new_walks for room in c.get("rooms", []))
            profile["nextAction"] = (
                "Conserver le cycle de marche déjà produit pour " + ", ".join(actor_ids or [key]) +
                " dans " + ", ".join(room_ids or [r["id"] for r in profile.get("playerRooms", [])]) +
                ". Vérifier les huit phases dans les deux sens, les contacts et les transitions du consommateur déclaré. "
                "Les autres actions et tenues demandent leurs propres références ; aucun doublon de ce cycle n’est requis.")
        profile["producedCycleLimitsV017"] = []
        for cycle in owned:
            source_frames = [by_asset[aid] for aid in cycle["frames"]]
            limits = unique(limit for a in source_frames for limit in a.get("limitations", []))
            receipt_notes = [limit for limit in limits if isinstance(limit, str)
                             and "ce reçu ne prétend pas" in limit and "intégrateur" in limit]
            profile["producedCycleLimitsV017"].append({
                "cycleId": cycle["id"], "sourceRelease": cycle.get("sourceRelease"),
                "runtimeEnabled": cycle["runtimeEnabled"],
                "sourceScopes": unique(a.get("scope") for a in source_frames),
                "currentVisualLimitations": [limit for limit in limits if limit not in receipt_notes],
                "historicalGenerationReceiptNotes": receipt_notes,
                "receiptQualification": "Les notes du reçu décrivent la génération. L’admission courante est celle du registre runtime.",
            })
        profile["incompleteCatalogueSequencesV017"] = [copy.deepcopy(c) for c in incomplete if c.get("rendererKey") == key]
    for ref in data["referenceRegister"]:
        linked = [profiles[k] for k in ref.get("linkedInventoryProfiles", []) if k in profiles]
        if not linked:
            continue
        ref["currentProfileStatesV017"] = [
            {"profile": p["id"], "availableImageStates": p["availableImageStates"],
             "runtimeImageStates": p["runtimeImageStates"], "runtimePngIds": p["runtimePngIds"],
             "catalogueCycles": [c["id"] for c in p["catalogueWalkCyclesV017"]],
             "missingStates": copy.deepcopy(p["missingStates"]),
             "integrationPendingStates": copy.deepcopy(p["integrationPendingStatesV017"])}
            for p in linked]
        remember(ref, "missingDetailed")
        linked_ids = {p["id"] for p in linked}
        ref["missingDetailed"] = [x for x in ref.get("missingDetailed", []) if x.get("profile") not in linked_ids]
        ref["missingDetailed"] += [{"profile": p["id"], "states": copy.deepcopy(p["missingStates"]),
                                   "integrationPending": copy.deepcopy(p["integrationPendingStatesV017"])}
                                  for p in linked if p["missingStates"] or p["integrationPendingStatesV017"]]
        ref["relatedExistingPngIds"] = unique(ref.get("relatedExistingPngIds", []) +
                                            [aid for p in linked for c in p["publishedWalkCyclesV017"] for aid in c["frames"]])


def audit_native_structure(data, native):
    rooms = {r["id"]: r for r in native["rooms"]}
    exits = {e["id"]: (r, e) for r in native["rooms"] for e in r["exits"]}
    if set(exits) != {t["exitId"] for t in data["thresholds"]}:
        raise ValueError("Native exits and documented thresholds differ")
    for threshold in data["thresholds"]:
        room, exit_ = exits[threshold["exitId"]]
        if threshold["from"] != room["id"] or threshold["runtimeExit"] != exit_:
            raise ValueError("Threshold differs from native content: " + threshold["id"])
        if exit_["threshold"]["contact"] != {"x": exit_["x"], "z": exit_["z"]}:
            raise ValueError("Contact differs from native exit: " + exit_["id"])
    pairs = {}
    for room, exit_ in exits.values():
        pair = tuple(sorted([room["id"], exit_["to"]]))
        pairs.setdefault(pair, []).append(exit_["id"])
        if not any(other["to"] == room["id"] for other in rooms[exit_["to"]]["exits"]):
            raise ValueError("Nonreciprocal native connection: " + exit_["id"])
    if len(pairs) != len(data["connections"]) or any(len(v) != 2 for v in pairs.values()):
        raise ValueError("Connection pair cardinality changed")
    for row in data["propInstances"]:
        prop = next((p for p in rooms[row["room"]]["props"] if p["id"] == row["id"]), None)
        if prop != row["sourceDefinition"]:
            raise ValueError("Documented occurrence differs from native geometry: " + row["id"])
    return {"method": "Static comparison against native content; no browser or playthrough claim",
            "rooms": len(rooms), "connections": len(pairs), "thresholds": len(exits),
            "nativeOccurrenceDefinitionsPreserved": len(data["propInstances"]),
            "isolatedTableaux": [r["id"] for r in native["rooms"] if r.get("tableau") and not r["exits"]],
            "allThresholdContactsMatchExitCoordinates": True}


def make_briefs(data, native):
    # Reuse the established 257-domain contract without overwriting its V016 evidence.
    working = copy.deepcopy(data)
    count = PREVIOUS.build_production_briefs(working)
    native_rooms = {r["id"]: r for r in native["rooms"]}
    for domain in DOMAINS:
        temporary = {r["id"]: r for r in working[domain]}
        for row in data[domain]:
            brief = copy.deepcopy(temporary[row["id"]]["productionBriefV016"])
            if domain == "rooms":
                brief["scenePropIds"] = brief.pop("interactiveObjects", [])
                brief["actionIds"] = [a["id"] for a in native_rooms[row["id"]]["actions"]]
                brief["roomIds"] = [row["id"]]
                brief["interactionQualification"] = ("Les props comprennent des décors et supports. Les actions portent "
                    "leurs propres identifiants ; les commandes des systèmes natifs restent distinctes.")
            elif domain == "supplementalCandidates":
                brief["missingStates"] = copy.deepcopy(row.get("missingStates", row.get("neededStates", [])))
                brief["availableAssetIds"] = copy.deepcopy(row.get("currentAssetIds", []))
                brief["requiredStateSpecification"] = copy.deepcopy(row.get("requiredStateSpecificationV017", row.get("neededStates", [])))
            elif domain == "characterProfiles":
                brief["integrationPendingStates"] = copy.deepcopy(row.get("integrationPendingStatesV017", []))
                brief["conditionalRequirements"] = copy.deepcopy(row.get("conditionalRequirementsV017", []))
                brief["publishedWalkCycles"] = [c["id"] for c in row.get("publishedWalkCyclesV017", [])]
                brief["runtimeWalkCycles"] = [c["id"] for c in row.get("walkCycles", [])]
                brief["producedCycleLimits"] = copy.deepcopy(row.get("producedCycleLimitsV017", []))
            elif domain == "propFamilies":
                brief["coverageAccounting"] = copy.deepcopy(row["coverageAccountingV017"])
            brief["basis"] += " État courant recalculé dans la consolidation V017."
            row["productionBriefV017"] = brief
    refs = {r["id"]: r for r in working["referenceRegister"]}
    for ref in data["referenceRegister"]:
        ref["productionBindingsV017"] = copy.deepcopy(refs[ref["id"]]["productionBindingsV016"])
    return count


def summarize(data, assets, runtime, manifest, original):
    summary = data["summary"]
    profiles, rooms, refs = data["characterProfiles"], data["rooms"], data["referenceRegister"]
    cycles = runtime.get("cycles", [])
    moving = [p for p in profiles if p.get("movingActorIds")]
    unintegrated = [c for c in data["publishedCyclesV017"] if not c["runtimeEnabled"]]
    old_runtime = {a["id"] for a in original["assetIndex"] if a.get("runtimeBinding")}
    summary.update(
        referenceEntries=len(refs), characterProfiles=len(profiles),
        humanIdentitiesInProfiles=len({p["identity"] for p in profiles if p["id"] != "walter-injured"}),
        sourceCharacterEntries=sum(r["category"] == "Personnage" for r in refs),
        biologyReferenceEntries=sum(r["category"] == "Xénomorphe / biologie" for r in refs),
        weaponFamilies=len(data["weaponFamilies"]), playableWeapons=sum(bool(r["playable"]) for r in data["weaponFamilies"]),
        propFamilies=len(data["propFamilies"]), propInstances=len(data["propInstances"]), spatialRecords=len(rooms),
        campaignRecords=sum(r["id"] not in {"whiteroom"} for r in rooms), independentTableaux=sum(r["id"] == "whiteroom" for r in rooms),
        distinctPhysicalSiteKeysIncludingTableau=len({r["physicalSite"] for r in rooms}),
        connections=len(data["connections"]), thresholds=len(data["thresholds"]), terrainFamilies=len(data["terrains"]),
        planetEntries=len(data["planets"]), transportRecordsIncludingComponentsAndUnresolvedGroups=sum(len(data[k]) for k in ["vehicles", "ships", "worldComponents"]),
        pngs=len(assets), newPngs=len(manifest.get("assets", [])), runtimePngs=len(runtime["assets"]),
        catalogueOnlyPngs=len(assets) - len(runtime["assets"]), currentRuntimeVersion=runtime["release"],
        newRuntimeAdmissions=len({a["id"] for a in runtime["assets"]} - old_runtime),
        playerWalkCycles=sum(c.get("consumer") != "npc" and c["state"] == "walk" for c in cycles),
        npcWalkCycles=sum(c.get("consumer") == "npc" and c["state"] == "walk" for c in cycles),
        animationPhases=sum(len(c["frames"]) for c in cycles), servedCycles=len(cycles),
        publishedWalkCycles=len(data["publishedCyclesV017"]),
        publishedAnimationPhases=sum(len(c["frames"]) for c in data["publishedCyclesV017"]),
        availableUnintegratedNpcCycles=len(unintegrated), availableUnintegratedNpcPhases=sum(len(c["frames"]) for c in unintegrated),
        movingNpcProfilesWithoutIntegratedWalkPng=sum(not p["walkCycles"] for p in moving),
        movingNpcProfilesWithoutPublishedWalkPng=sum(not p["publishedWalkCyclesV017"] for p in moving),
        playerProfilesWithoutRunPng=sum(bool(p["playerRooms"]) and "run" not in p["availableImageStates"] for p in profiles),
        worldWorkItemsNotPngCount=len(data["worldMissingWork"]),
        supplementalCandidates=len(data["supplementalCandidates"]),
        supplementalObjectCandidates=sum(c["id"] not in CANDIDATE_CHARACTERS for c in data["supplementalCandidates"]),
        documentaryObjectRecordsV015=len(data.get("v015ProductionLinks", [])),
        incompleteCharacterSequencePngs=sum(len(c["assetIds"]) for c in data["incompleteCharacterSequencesV017"]),
        certified1to1Images=0,
    )
    summary["movingNpcProfilesWithoutWalkPng"] = summary["movingNpcProfilesWithoutIntegratedWalkPng"]
    summary["namedIdentitiesIncludingSeparateShawPortrait"] = summary["humanIdentitiesInProfiles"] + int(any(
        c["id"] == "shaw-crossing" and c.get("currentAssetIds") for c in data["supplementalCandidates"]))
    summary["animationImagesIncludingIncomplete"] = (summary["publishedAnimationPhases"] +
                                                     summary["incompleteCharacterSequencePngs"])
    data["summaryDefinitions"] = {
        "humanIdentitiesInProfiles": "Identités nommées, en réunissant les costumes. Le profil blessé Walter / David selon la scène n’est pas une personne supplémentaire.",
        "animationPhases": "Phases dans les cycles du registre runtime actuel.",
        "publishedAnimationPhases": "Phases des cycles complets publiés, y compris ceux qui restent au catalogue.",
        "movingNpcProfilesWithoutWalkPng": "Alias historique : profils mobiles sans marche intégrée.",
        "movingNpcProfilesWithoutPublishedWalkPng": "Profils mobiles sans ensemble publié complet de huit phases.",
        "availableUnintegratedNpcCycles": "Cycles complets publiés qui ne sont pas admis dans le runtime.",
        "animationImagesIncludingIncomplete": "Phases des cycles complets publiés, plus poses des séquences incomplètes conservées au catalogue.",
        "worldWorkItemsNotPngCount": "Tâches de référence, de variantes ou de revue ; pas un nombre de PNG à générer.",
    }
    for name, value in [("newPngs", summary["newPngs"]), ("cumulativePngs", summary["pngs"]),
                        ("runtimePngs", summary["runtimePngs"]), ("cataloguePngs", summary["catalogueOnlyPngs"])]:
        if name in manifest.get("summary", {}) and manifest["summary"][name] != value:
            raise ValueError("Manifest count disagrees with measured source/runtime state: " + name)


def readable_groups(data):
    groups = PREVIOUS.readable_groups(data)
    # Give each V015 object its own readable row rather than duplicating six full
    # object dossiers inside the bridge, console, vehicle and reference cells.
    props = next(g for g in groups if g["name"] == "Props")
    documentary_rows = []
    existing_ids = {row["id"] for row in props["rows"]}
    for source in data.get("v015ProductionLinks", []):
        if source["id"] in existing_ids:
            continue
        record = copy.deepcopy(source)
        record.update(name=source["title"], scope="Référence de production V015 ; objet de catalogue non intégré",
                      description=source["appearance"], visualBrief=source["appearance"],
                      existingSummary=source["existing"], missingStates=[source["remaining"]],
                      roomIds=source.get("documentaryRoomIds", []),
                      constraints=[source.get("admissionReview", {}).get("reason", ""),
                                   "Fiche d’objet documentaire ; ne crée pas une nouvelle famille du moteur."],
                      sourceReferenceIds=source.get("referenceIds", []))
        documentary_rows.append(BASE.common(record, "Props"))
    props["rows"][len(data["propFamilies"]):len(data["propFamilies"])] = documentary_rows
    for group in groups:
        for row in group["rows"]:
            detail = row["details"]
            brief = detail.get("productionBriefV017", {})
            if brief:
                row["nextAction"] += "\nProduction V017 : " + " ".join(brief.get("acceptanceChecks", []))
            update = detail.get("currentV015Update")
            if update:
                row["existing"] += "\nHistorique V015 : " + BASE.plain({k: v for k, v in update.items()
                    if k in {"assetIds", "pendingAssetIds", "status", "runtimeIntegrated", "scope"}})
                objects = update.get("objects", [])
                if objects:
                    row["existing"] += "\nDossiers liés : " + "; ".join(
                        str(obj.get("id", obj.get("title", "dossier"))) for obj in objects)
            update = detail.get("currentV017Update")
            if update:
                row["existing"] += "\nÉtat consolidé V017 : " + BASE.plain({k: v for k, v in update.items() if k != "sourceUrls"})
            if detail.get("currentAssetIds"):
                row["existing"] += "\nImages produites : " + ", ".join(detail["currentAssetIds"])
                if detail.get("missingStates") == [] and "requiredStateSpecificationV017" in detail:
                    row["missing"] = ("Les états statiques documentaires demandés sont produits. "
                                      "Les autres vues, la conformité au décor final et un éventuel consommateur "
                                      "restent des revues distinctes ; aucune intégration implicite.")
            if detail.get("doesNotCover"):
                row["constraints"] += "\nPérimètres non couverts : " + BASE.plain(detail["doesNotCover"])
            if detail.get("catalogueWalkCyclesV017"):
                row["existing"] += "\nCycles complets de catalogue : " + "; ".join(
                    c["id"] + " — huit PNG présents, hors runtime" for c in detail["catalogueWalkCyclesV017"])
            if detail.get("integrationPendingStatesV017"):
                row["missing"] += "\nIntégration à vérifier : " + BASE.plain(detail["integrationPendingStatesV017"])
            if detail.get("conditionalRequirementsV017"):
                row["constraints"] += "\nExigences conditionnelles : " + BASE.plain(detail["conditionalRequirementsV017"])
            if detail.get("coverageAccountingV017"):
                row["constraints"] += "\nComptage : " + BASE.plain(detail["coverageAccountingV017"])
            if group["name"] == "Profils":
                actor_locations = [a["id"] + " — " + a["room"] + " (" + a.get("roomName", a["room"]) + ")"
                                   for a in detail.get("actors", [])]
                if actor_locations:
                    row["locations"] += ("\n" if row["locations"] else "") + "Acteurs de cette apparence : " + "; ".join(actor_locations)
                if detail.get("existingVisualLimitations"):
                    row["constraints"] += "\nLimites des images statiques héritées : " + BASE.plain(detail["existingVisualLimitations"])
                for cycle in detail.get("producedCycleLimitsV017", []):
                    if cycle["sourceScopes"]:
                        row["constraints"] += "\nPortée de " + cycle["cycleId"] + " : " + BASE.plain(cycle["sourceScopes"])
                    if cycle["currentVisualLimitations"]:
                        row["constraints"] += "\nLimites visuelles déclarées avec ce cycle : " + BASE.plain(cycle["currentVisualLimitations"])
            row["sources"] = unique(row["sources"] + BASE.source_urls(detail))
    return groups


def markdown_asset_links(markdown, groups, assets):
    """Expose the same originals as HTML through URLs valid in both the repository and the pack."""
    by_id = {asset["id"]: asset for asset in assets}
    source_url = "https://github.com/darknigthmare/aliens-tantalus-frontier/blob/codex/covenant-bible-v016/"
    seen_headings = set()
    for group in groups:
        for row in group["rows"]:
            heading = "### " + row["id"] + " — " + row["name"] + "\n\n"
            if heading in seen_headings:
                continue
            seen_headings.add(heading)
            found = []
            def walk(value):
                if isinstance(value, str) and value in by_id and value not in found:
                    found.append(value)
                elif isinstance(value, list):
                    for item in value:
                        walk(item)
                elif isinstance(value, dict):
                    for item in value.values():
                        walk(item)
            walk(row["details"])
            if not found:
                continue
            links = "**Images disponibles**\n\n" + "\n".join(
                "- [" + aid + "](" + source_url + by_id[aid]["path"] + ") — " + by_id[aid]["runtimeAdmission"]
                for aid in found) + "\n\n"
            # Some records intentionally occur in more than one thematic view.
            markdown = markdown.replace(heading, heading + links)
    return markdown


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=HERE.parent)
    parser.add_argument("--baseline", type=Path, default=Path("docs/covenant/BIBLE_COVENANT_V016.json"))
    parser.add_argument("--merge-baseline", type=Path, default=Path("docs/covenant/BIBLE_COVENANT_V015.json"))
    parser.add_argument("--baseline-commit", default="2539d67020950b5ebcd269413729ec7acec7eb76")
    parser.add_argument("--pull-request-url")
    parser.add_argument("--tables-out", type=Path)
    parser.add_argument("--draft", action="store_true")
    parser.add_argument("--check-only", action="store_true")
    args = parser.parse_args()
    repo = args.root.resolve()
    paths = [p if p.is_absolute() else repo / p for p in [args.baseline, args.merge_baseline]]
    original, other = [BASE.read(p) for p in paths]
    data = merge_baselines(original, other, paths, repo)
    manifests, assets, runtime, manifest = load_manifests(data, repo, args.draft)
    data.update(version=VERSION, date=manifest.get("date", "2026-11-26"), baselineCommit=args.baseline_commit,
                verified1to1=False, status="draft" if args.draft else "reference-guided-partial-continuation")
    data["policy"].append("V017 consolide les originaux V015 et V016. Une image publiée, un cycle complet et une admission runtime sont trois états distincts.")
    data["bibleConnections"]["pullRequestRoleV017"] = "Consolidation et continuation ; les liens historiques restent datés dans les sources."
    review_url = args.pull_request_url or manifest.get("documentationPullRequestUrl")
    if review_url:
        if not review_url.startswith("https://github.com/darknigthmare/aliens-tantalus-frontier/pull/"):
            raise ValueError("Unexpected documentation pull-request URL")
        data["bibleConnections"]["historicalCurrentPullRequestBeforeV017"] = data["bibleConnections"].get("currentPullRequest")
        data["bibleConnections"]["currentPullRequest"] = review_url
    reconcile_assets(data, assets, runtime, manifest, original)
    reconcile_cycles(data, assets, manifests, runtime)
    native = native_content(repo)
    audit = audit_native_structure(data, native)
    brief_count = make_briefs(data, native)
    summarize(data, assets, runtime, manifest, original)
    continuation = data["continuationV017"]
    continuation.update(status=data["status"], productionBriefCount=brief_count,
                        domainRecordCounts={k: len(data[k]) for k in DOMAINS},
                        thresholdPlans=len(data["thresholds"]), nativeStructureAudit=audit)
    for source in [original, other]:
        for domain in HISTORICAL_DOMAINS:
            if not set(ids(source[domain])).issubset(set(ids(data[domain]))):
                raise ValueError("Historical identifiers lost: " + domain)
    if data["summary"]["referenceEntries"] != 315:
        raise ValueError("The 315 reference identifiers must be preserved")
    data = BASE.repo_safe(data, repo, repo)
    result = {"version": VERSION, "draft": args.draft, "briefs": brief_count, "summary": data["summary"],
              "sourceManifests": data["sourceManifests"], "nativeStructureAudit": audit}
    if args.check_only:
        print(json.dumps(result, ensure_ascii=False))
        return
    if args.draft:
        raise ValueError("Draft mode is inspection only; use --draft --check-only, never publish draft documents")
    folder = repo / "docs/covenant"
    BASE.write(folder / "BIBLE_COVENANT_V017.json", data)
    groups = readable_groups(data)
    markdown = BASE.markdown(data, groups).replace("# Alien: Covenant — Bible détaillée V0.14", "# Alien: Covenant — Bible détaillée V0.17", 1)
    introduction = (
        "\n## Consolidation V015, V016 et continuation V017\n\n"
        f"{brief_count} fiches disposent d’un contrat de production actuel. "
        f"{data['summary']['pngs']} PNG existent, dont {data['summary']['runtimePngs']} admis au runtime "
        f"et {data['summary']['catalogueOnlyPngs']} au catalogue. "
        f"{data['summary']['publishedWalkCycles']} cycles complets sont publiés ; "
        f"{data['summary']['servedCycles']} sont admis au runtime.\n\n"
        "Les 315 références et les identifiants historiques sont conservés. Les sources V015 et V016 restent datées. "
        "Les cycles Ricks et Oram sont des ensembles publiés à qualifier, sans admission implicite. "
        "Les poses incomplètes de David restent au catalogue et les refus enregistrés sont conservés.\n\n"
        "Les props de chaque scène sont séparés des actions natives. Une occurrence masquée ou tenue procédurale "
        "par son contrat ne devient pas automatiquement une image à produire. Les portes, les sols et les collisions "
        "gardent leurs définitions du jeu ; aucune métrique de décor filmique n’est certifiée.\n"
    )
    markdown = markdown.replace("\n## Conventions", introduction + "\n## Conventions", 1)
    markdown = markdown_asset_links(markdown, groups, data["assetIndex"])
    (folder / "BIBLE_COVENANT_V017.md").write_text(markdown)
    payload = {"summary": data["summary"], "groups": groups, "assets": data["assetIndex"]}
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    template = BASE.HTML.replace("V0.14", "V0.17").replace("V014", "V017")
    template = template.replace("Existant et ajout V017", "Existant et état consolidé")
    if review_url:
        template = template.replace("https://github.com/darknigthmare/aliens-tantalus-frontier/pull/71", review_url)
    else:
        template = template.replace("PR de continuation</a>", "PR historique de base</a>")
    (folder / "BIBLE_COVENANT_V017.html").write_text(template.replace("__PAYLOAD__", encoded))
    if args.tables_out:
        tables = BASE.table_payload(data, groups)
        for table in tables["tables"]:
            table["headers"] = [h.replace("Existant / ajout V014", "Existant / continuation") for h in table["headers"]]
        BASE.write(args.tables_out, tables)
    result["groups"] = {g["name"]: len(g["rows"]) for g in groups}
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()

