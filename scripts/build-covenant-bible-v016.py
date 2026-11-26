#!/usr/bin/env python3
"""Extend the checked-in Covenant bible while preserving historical records.

The continuation is derived from repository manifests and exact runtime
admissions. It changes documentation, never source PNG pixels or game state.
The source was reconstructed after an executor disconnect; run it and verify
its outputs before publishing generated documents.
"""
import argparse
import copy
import importlib.util
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("covenant_bible_v014", HERE / "build-covenant-bible-v014.py")
BASE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BASE)
VERSION = "0.16.0"
RELEASE = "v016"
DOMAINS = ["characterProfiles", "rooms", "weaponFamilies", "propFamilies", "supplementalCandidates", "vehicles", "ships", "worldComponents", "terrains", "planets"]
SOURCE_FX = "https://www.fbfx.co.uk/film-alien-covenant"
SOURCE_F90 = "https://www.lithgowarms.com/rise-up-f90-featuring-in-pacific-rim-movie-sequel/"
SOURCE_AUDI = "https://media.audifrance.fr/le-rover-lunaire-audi-lunar-quattro-a-lecran-dans-le-film-alien-covenant/"
SOURCE_HENLEY = "https://www.artofvfx.com/alien-covenant-charley-henley-production-vfx-supervisor-mpc/"


def unique(items):
    return list(dict.fromkeys(x for x in items if x))


def append_unique(row, key, value):
    if value not in row.setdefault(key, []):
        row[key].append(value)


def record_refs(row):
    return unique(row.get("sourceReferenceIds", []) + row.get("referenceIds", []))


def room_ids(row):
    ids = row.get("roomIds", row.get("rooms", []))
    if not isinstance(ids, list):
        ids = []
    ids = [x if isinstance(x, str) else x.get("id") for x in ids]
    ids += [x["id"] for x in row.get("playerRooms", [])]
    ids += [x["room"] for x in row.get("actors", [])]
    impl = row.get("existingImplementation", {})
    if isinstance(impl, dict):
        ids += impl.get("roomIds", [])
    return unique(ids)


def factual_clarifications(data):
    sources = [
        {"id": "V016-FBFX", "url": SOURCE_FX, "type": "primary-costume-fabricator", "checked": "2026-11-26",
         "finding": "Le fabricant attribue l’EVA lourde jaune à Tennessee et Ankor et la distingue des combinaisons IVA légères. Le gant comporte un outil laser de récit.",
         "limit": "Le texte du fabricant ne fournit ni une animation latérale ni toutes les pièces vues dans chaque plan."},
        {"id": "V016-LITHGOW", "url": SOURCE_F90, "type": "primary-prop-base-manufacturer", "checked": "2026-11-26",
         "finding": "Lithgow confirme que le F90 a été utilisé dans Alien: Covenant, en collaboration avec l’armurier John Bowring.",
         "limit": "Cette confirmation porte sur la base de l’accessoire. Elle ne valide pas à elle seule chaque accessoire ajouté, désignation diégétique ou variante du film."},
        {"id": "V016-AUDI", "url": SOURCE_AUDI, "type": "primary-vehicle-manufacturer", "checked": "2026-11-26",
         "finding": "Audi confirme le Lunar Quattro associé à la mission et distingue un court promotionnel réalisé avec Fox dans la baie de terraformation.",
         "limit": "L’annonce constructeur ne remplace pas un relevé plan par plan du montage cinéma. Les images du court gardent leur attribution promotionnelle."},
    ]
    data.setdefault("sources", {})["continuationV016"] = sources
    lookup = {x["id"]: x for x in data["referenceRegister"]}
    for ids, source in [
        (["ACOV-001", "ACOV-126", "ACOV-127"], sources[0]),
        (["ACOV-093", "ACOV-094", "ACOV-096"], sources[1]),
        (["ACOV-124", "ACOV-188", "ACOV-306"], sources[2]),
    ]:
        for rid in ids:
            if rid in lookup:
                lookup[rid]["primarySourceReviewV016"] = copy.deepcopy(source)
    for row in data["weaponFamilies"]:
        if row["id"] in ["f90", "sl40"]:
            row["primarySourceReviewV016"] = copy.deepcopy(sources[1])
            append_unique(row, "constraints", "La source constructeur confirme la base F90 ; les ajouts, variantes SL40 et noms diégétiques restent à recouper sur les accessoires du film.")
    for row in data["characterProfiles"]:
        if row["id"] in ["ankor", "tennessee-eva", "daniels-eva"]:
            row["primarySourceReviewV016"] = copy.deepcopy(sources[0])
    for row in data["vehicles"]:
        if row["id"] == "VEH-AUDI":
            append_unique(row, "sourceUrls", SOURCE_AUDI)
            row["primarySourceReviewV016"] = copy.deepcopy(sources[2])
        if row["id"] in ["VEH-LANDER", "VEH-LIFTER"]:
            row["productionDistinctionV016"] = {
                "source": SOURCE_HENLEY,
                "statement": "Le superviseur VFX distingue le Covenant, le Lander et le Lifter. Une base de conception partagée ne justifie pas d’échanger leurs ponts, cabines, rampes ou gréements.",
                "evidenceType": "direct-production-interview; inherited-reference-reviewed",
            }
    if not any(x["id"] == "ankor-eva-heavy" for x in data["supplementalCandidates"]):
        data["supplementalCandidates"].append({
            "id": "ankor-eva-heavy", "name": "Ankor — combinaison EVA lourde jaune",
            "scope": "film-costume-confirmed-by-fabricator",
            "sourceReferenceIds": ["ACOV-001", "ACOV-127"], "source": SOURCE_FX,
            "sourceType": "primary-costume-fabricator",
            "sourceDescription": "FBFX confirme que la combinaison lourde jaune est portée par Tennessee et Ankor. La variante d’Ankor doit conserver son identité et son état de costume.",
            "appearanceAndVariants": "EVA rigide jaune articulée, casque technique à éclairage intégré, joints mécaniques, gant avec outil de récit. Les marquages et la tête d’Ankor nécessitent encore leurs vues exactes.",
            "currentConsumer": None, "generationState": "documented-variant-no-dedicated-sprite",
            "neededStates": ["reference-locked-full-body", "scene-specific-pose-after-consumer-selection"],
            "doesNotCover": ["ankor-expedition", "tennessee-eva", "daniels-eva"],
            "limits": ["Un costume confirmé par texte n’est pas un sprite produit.",
                       "Ne pas copier la tête de Tennessee ni remplacer la tenue d’expédition d’Ankor.",
                       "Aucun nouvel acteur ou état de gameplay n’est créé par cette fiche."],
            "nextAction": "Choisir un plan montrant Ankor dans cette EVA et le consommateur exact avant une production dédiée.",
            "verified1to1": False,
        })


TERRAIN_PLANS = {
    "TERR-SHIP": ("Panneaux métalliques, caillebotis et joints industriels",
                  "Segments de sol et cloisons séparés ; états normal, alarme et avarie à sélectionner par salle ; panneaux d’écran laissés aux systèmes actifs.",
                  "Aligner joints, chants et ouvertures sur la grille existante ; séparer le décor de fond des collisions et des portes."),
    "TERR-LANDER": ("Plancher, parois et structure des modules humains",
                    "Kit Lander One séparé du pont du Lifter. La même base industrielle de production ne permet pas de réemployer toutes les pièces.",
                    "Rampe, quai et cabine appartiennent au véhicule identifié et au bon état narratif."),
    "TERR-EVA": ("Coque extérieure et voiles",
                 "Tôle, supports et membranes en couches ; état des voiles repliées ou déployées lié à l’apparition documentée.",
                 "Ne pas transformer une vue extérieure de catalogue en plateforme de marche ni en collision."),
    "TERR-LAKE": ("Berge humide et lointains montagneux",
                  "Panorama lointain, végétation proche, rive et surface d’eau sont distincts. Un fond de lac ne clôt pas les besoins de sol.",
                  "Conserver la rive jouable, les pieds des acteurs, l’horizon et l’accès au Lander."),
    "TERR-WHEAT": ("Tiges, épis et terre du champ",
                   "Touffes de céréales à silhouettes séparées, bande de sol et lointain ; point de vue de la salle conservé.",
                   "Les tiges devant le joueur ne doivent masquer ni sortie ni contact au sol ; aucune faune ajoutée comme fait canonique."),
    "TERR-FOREST": ("Sous-bois humide et sporophores",
                    "Sols, troncs, racines et colonies de spores indépendants ; phase de libération des spores réservée à l’événement prévu.",
                    "Garder la source du danger et son rayon lisibles ; la présence de spores dans un fond peint ne crée pas une zone de dégâts."),
    "TERR-GORGE": ("Roches, pentes et ravines",
                   "Plaques rocheuses, bord de ravin et végétation selon la référence ; pas de mesure d’escarpement déduite d’une seule image.",
                   "Le bord visuel accompagne le passage natif et laisse les points d’arrivée libres."),
    "TERR-WRECK": ("Forêt brisée autour du Juggernaut",
                   "Arbres rompus, débris et structure de l’épave en couches ; distinguer l’extérieur organique de l’intérieur biomécanique.",
                   "La brèche doit relier le site extérieur à la bonne entrée du vaisseau, sans porte isolée devant le décor."),
    "TERR-BURN": ("Sol incendié et fragments de Lander One",
                  "Épave, braises, fumée et sol noirci sont des états indépendants ; référence de destruction nécessaire.",
                  "Aucune coque intacte ne remplace l’état brûlé ; feu et fumée restent raccordés à leur événement et à la lisibilité du parcours."),
    "TERR-REEDS": ("Roseaux et clairière sombre",
                   "Touffes et silhouettes de bord de champ sur alpha ; ciel, brume et végétation conservés en plans séparés.",
                   "Les éléments au premier plan ne couvrent pas en permanence les acteurs ni le passage vers la cité."),
    "TERR-STONE": ("Pierre monumentale des Ingénieurs",
                   "Dalles, gradins, piliers et passages aux proportions de la salle ; usure et teintes relues par décor.",
                   "Un arc ou un seuil visible reçoit une ouverture cohérente ; l’échelle monumentale n’agrandit pas les personnages."),
    "TERR-GARDEN": ("Terre et végétation du jardin clos",
                    "Sol cultivé, murs et plantes documentées séparés ; aucun biome planétaire global déduit de ce petit lieu.",
                    "Maintenir l’enclos et ses seuils ; les props d’étude restent des objets distincts du sol."),
    "TERR-BIOMECH": ("Coque intérieure biomécanique du Juggernaut",
                     "Nervures, parois et interfaces comme modules d’un vaisseau ; palette et matériau distincts du Covenant.",
                     "Raccorder les surfaces à la brèche et à la chambre de navigation sans adopter un sas métallique humain."),
    "TERR-HYDRAULIC": ("Pierre et ouvrages des annexes hydrauliques",
                       "Dalles, canaux et mécanismes selon les données de l’adaptation ; qualification originale conservée.",
                       "Flux, leviers, contrepoids et contacts restent dynamiques ; aucune scène originale présentée comme plan cinéma."),
    "TERR-WEATHER": ("Lisières et creux du parcours adapté",
                     "Racines, sol et végétation liés à chaque annexe ; vent et particules animés à part.",
                     "Distinguer le kit inspiré des paysages du film de la géométrie inventée pour le jeu."),
    "TERR-WHITE": ("Surfaces du prologue d’activation",
                   "Sol et parois clairs avec une lumière douce ; mobilier, statue et personnages restent des éléments séparés.",
                   "Garder ce tableau autonome ; le blanc du décor ne devient pas un raccord géographique vers le Covenant."),
}


def base_brief(row, domain):
    return {
        "domain": domain, "recordId": row["id"], "scope": row.get("scope", row.get("categoryLabel", "périmètre hérité")),
        "basis": "Spécification de production de l’adaptation, dérivée des fiches et consommateurs existants ; aucune nouvelle cote de film.",
        "sourceReferenceIds": record_refs(row), "roomIds": room_ids(row),
        "referenceRequirement": "Conserver une vue de référence attribuée et inspectée pour le sujet, le costume, le lieu et l’état concernés. Une source textuelle seule ne clôt pas la fidélité visuelle.",
        "deliveryContract": "Un sujet ou une pose par PNG natif ; taille et empreinte enregistrées. Les éléments détourés conservent leur alpha ; panoramas opaques déclarés séparément.",
        "reviewState": "documented-requirements; not-a-claim-of-production-or-gameplay-completion",
    }


def build_production_briefs(data):
    room_lookup = {r["id"]: r for r in data["rooms"]}
    thresholds_by_room = {}
    for t in data["thresholds"]:
        thresholds_by_room.setdefault(t["from"], []).append(t)
    count = 0
    for domain in DOMAINS:
        for row in data[domain]:
            b = base_brief(row, domain)
            if domain == "characterProfiles":
                b.update(
                    appearanceLock=row.get("visualBrief"), identity=row.get("identity"), costumeConstraint=row.get("costumeConstraint"),
                    consumers=[{"actorId": a["id"], "room": a["room"], "speedGameUnits": a.get("speed"), "identity": a.get("identity")} for a in row.get("actors", [])],
                    missingStates=copy.deepcopy(row.get("missingStates", [])),
                    animationContract="Avant un cycle, fixer bassin, ligne des pieds, hauteur apparente et sens. Contacts opposés et passages doivent former un cycle lisible ; les bras restent cohérents avec l’objet réellement porté.",
                    acceptanceChecks=["Comparer visage, silhouette, tenue et accessoires à la variante de référence.",
                                      "Observer toutes les phases dans les deux directions au consommateur déclaré, sans changer la route ni la vitesse de simulation.",
                                      "Conserver le rendu natif si le cycle est incomplet ou si l’état, la salle ou l’acteur ne sont pas admis."],
                )
                if row["id"] == "walter-injured":
                    b["asymmetryLock"] = "La main anatomique gauche est absente. Une réflexion horizontale brute ne doit pas déplacer cette absence sur la droite. Walter et David déguisé restent des identités de scène distinctes."
                if not row.get("currentConsumer"):
                    b["consumerConstraint"] = "Aucun consommateur actuel : définir la scène avant de demander un cycle complet."
                if row.get("incompleteCatalogueSequenceV016"):
                    b["incompleteCatalogueSequence"] = copy.deepcopy(row["incompleteCatalogueSequenceV016"])
            elif domain == "rooms":
                impl = row.get("existingImplementation", {})
                gates = []
                for t in thresholds_by_room.get(row["id"], []):
                    e = t["runtimeExit"]
                    th = e.get("threshold", {})
                    gates.append({"thresholdId": t["id"], "to": t["to"], "destination": room_lookup[t["to"]]["name"],
                                  "type": th.get("type"), "support": th.get("support"),
                                  "contact": th.get("contact", {"x": e.get("x"), "z": e.get("z")}),
                                  "rationale": th.get("rationale"), "status": "preserved-game-data; requires-visual-and-physical-review"})
                b.update(
                    physicalSite=row.get("physicalSite"), timeState=row.get("timeState"),
                    terrainIds=row.get("terrainIds", []), camera=impl.get("view"), layers=impl.get("design", {}).get("layers", []),
                    nativeVisualRule=impl.get("visual", {}).get("rule"), thresholdPlan=gates,
                    missingAssets=copy.deepcopy(row.get("missingAssets", [])), interactiveObjects=impl.get("propIds", []),
                    acceptanceChecks=["Chaque ouverture correspond au support et au contact de son seuil ; aucune porte libre au milieu d’une pièce.",
                                      "Le nouveau fond reste derrière les acteurs, les accessoires interactifs et les seuils.",
                                      "Vérifier arrivée dégagée, interaction, aller-retour et reprise de sauvegarde après intégration.",
                                      "Les vues d’un même site partagent leur structure ; les états narratifs ne deviennent pas de nouveaux lieux."],
                )
            elif domain == "weaponFamilies":
                if not row.get("scope"):
                    row["scope"] = "famille visuelle du module ; désignation filmique héritée à recouper"
                    b["scope"] = row["scope"]
                b.update(
                    appearanceLock=copy.deepcopy(row.get("visualBrief", [])), consumers=row.get("consumers", []),
                    missingStates=row.get("missingVisualStates", []), playable=row.get("playable", False),
                    generationState=row.get("generationState"),
                    integrationContract="La silhouette de l’accessoire, les attaches de main et les états du jeu doivent être définis ensemble. Aucune valeur du jeu n’est une spécification mécanique d’arme réelle.",
                    acceptanceChecks=["Conserver la famille, la finition et les accessoires de la référence du film.",
                                      "Une pose mains vides n’est pas une pose armée.",
                                      "Conserver le blocage de génération enregistré ; cette fiche n’autorise aucune nouvelle tentative sur un sujet refusé."],
                )
            elif domain == "propFamilies":
                instances = [p for p in data["propInstances"] if p["family"] == row["id"]]
                b.update(
                    appearanceLock=row.get("visualBrief"), requiredStates=row.get("requiredStatesToSpecify", []),
                    occurrenceIds=[p["id"] for p in instances],
                    omittedOccurrences=[p["id"] for p in instances if p.get("suppressionReasons")],
                    placementContract="Choisir le support de chaque occurrence dans sa salle : sol, paroi, console, table ou équipement porté. Les coordonnées et volumes natifs restent ceux de l’adaptation.",
                    acceptanceChecks=["Ne pas réactiver une occurrence supprimée.",
                                      "Admettre le PNG sur une occurrence exacte après comparaison de forme, vue et état.",
                                      "Conserver les parties vivantes du mécanisme et le repli natif."],
                )
                if row["category"] == "structure_or_live_mechanism" or any(s in row.get("requiredStatesToSpecify", []) for s in ["live-display-content", "arm-articulation"]):
                    b["layerContract"] = "Séparer habillage statique, écran/indicateur, articulation et état interactif ; une image aplatie ne remplace pas un mécanisme vivant."
                elif row["category"] == "gameplay_original":
                    b["layerContract"] = "Création de l’adaptation : préserver sa fonction et son style, sans la convertir en objet canonique du film."
                elif row["category"] == "environment_or_effect":
                    b["layerContract"] = "Les effets et silhouettes d’ambiance restent séparés des obstacles, acteurs et dangers de simulation."
                else:
                    b["layerContract"] = "Objet isolé dans son état choisi. Ombre portée et éclairage de salle composés séparément si le moteur le permet."
            elif domain in ["vehicles", "ships", "worldComponents"]:
                b.update(
                    states=copy.deepcopy(row.get("states", [])), missingAssets=copy.deepcopy(row.get("missingAssets", [])),
                    silhouetteContract="Conserver l’identité de l’appareil, l’angle observé, le nombre d’éléments visibles et la séparation coque/cabine/équipement mobile. Aucune pièce masquée n’est déclarée mesurée.",
                    acceptanceChecks=["Rattacher chaque vue au véhicule ou composant exact et à son état narratif.",
                                      "Les concepts de production et images promotionnelles conservent leur qualification.",
                                      "Une vue de catalogue n’active ni une scène jouable, ni un véhicule, ni une collision."],
                )
                b["identityLock"] = {
                    "VEH-LANDER": "Lander One : navette de l’expédition. Ses vues intactes, médicales et détruites sont des états distincts.",
                    "VEH-LIFTER": "Lifter : engin de charge et d’extraction. Pont ouvert, cabine et grue ne sont pas ceux du Lander.",
                    "VEH-AUDI": "Lunar Quattro : référence du constructeur et bonus promotionnel distingués. Ne pas déduire un profil caché des seules vues avant.",
                    "VEH-COVENANT": "Covenant : vaisseau interstellaire humain. Un mât ou capot de production ne couvre pas sa silhouette entière.",
                    "VEH-JUGGERNAUT": "Juggernaut : états en vol et épave séparés ; un module de production n’atteste pas tous les plans du montage.",
                    "VEH-MOTHER-TUG": "Groupe non résolu : une mention de production ne suffit pas à reconstruire une silhouette entière.",
                    "VEH-UNDERPLAZA": "Groupe sous la place : préserver l’incertitude de la fiche et éviter une entité indépendante inventée.",
                    "VEH-LASTSIGNS": "Revendication liée au bonus : vérifier la source exacte avant toute nouvelle silhouette de navette.",
                }.get(row["id"], "Ce composant reste rattaché à son parent ; il n’est pas compté comme un nouveau vaisseau.")
            elif domain == "terrains":
                material, layers, placement = TERRAIN_PLANS[row["id"]]
                if not row.get("scope"):
                    row["scope"] = "kit original de l’adaptation" if row["id"] in ["TERR-HYDRAULIC", "TERR-WEATHER"] else "famille visuelle liée au film ; découpage du jeu adapté"
                    b["scope"] = row["scope"]
                b.update(materials=material, layerContract=layers, placementContract=placement,
                         missingAssets=copy.deepcopy(row.get("missingAssets", [])),
                         acceptanceChecks=["Conserver vue, échelle apparente et palette des salles concernées.",
                                           "Tester les raccords de tuiles seulement pour les pièces destinées à être répétées.",
                                           "Ne pas intégrer au sol des portes, objets interactifs ou silhouettes d’acteurs peints dans la texture."])
            elif domain == "planets":
                b.update(missingAssets=copy.deepcopy(row.get("missingAssets", [])),
                         acceptanceChecks=["Identifier la planète et la portée de la source.",
                                           "Ne déduire ni continents cachés, coordonnées ou biomes d’un seul cadrage.",
                                           "Relier le visuel aux lieux connus sans fabriquer une géographie officielle complète."])
                b["representationContract"] = {
                    "PLANET-4": "Vue orbitale de catalogue et environnements de l’expédition à suivre séparément. Le panorama de berge n’est ni une carte planétaire ni une preuve d’Origae-6.",
                    "PLANET-ORIGAE6": "Destination narrative. Aucun sol, colonie, biome, faune ou flore n’est produit comme canonique sans représentation primaire identifiée.",
                    "PLANET-EARTH": "Contexte du prologue et des archives humaines. Pas de surface planétaire ou de nouvelle campagne déduite du seul décor d’activation.",
                }[row["id"]]
            else:
                b.update(appearanceLock=row.get("appearanceAndVariants", row.get("sourceDescription")),
                         missingStates=row.get("neededStates", []), generationState=row.get("generationState"),
                         consumer=row.get("currentConsumer"),
                         acceptanceChecks=["Conserver la portée film, bonus ou conception indiquée.",
                                           "Sélectionner une variante de référence unique, sans fusionner les propositions de production.",
                                           "Vérifier la photo ou le plan avant d’ajouter un consommateur de jeu."])
            row["productionBriefV016"] = b
            count += 1
    for ref in data["referenceRegister"]:
        ref["productionBindingsV016"] = [{"domain": domain, "id": row["id"]} for domain in DOMAINS for row in data[domain] if ref["id"] in record_refs(row)]
    return count


def refresh_assets(data, repo, draft):
    new_manifest_path = repo / f"assets/openai/sprites/alien-covenant-{RELEASE}/manifest.json"
    if not new_manifest_path.exists() and not draft:
        raise ValueError("V016 manifest is required; --draft may be used only before production is complete")
    manifests, assets = [], []
    for path in sorted((repo / "assets/openai/sprites").glob("alien-covenant-v0*/manifest.json")):
        version = path.parent.name.removeprefix("alien-covenant-")
        if not ("v011" <= version <= RELEASE):
            continue
        source = BASE.read(path)
        assets.extend(source["assets"])
        manifests.append({"path": str(path.relative_to(repo)), "sha256": BASE.sha(path), "pngs": len(source["assets"])})
    if len({a["id"] for a in assets}) != len(assets):
        raise ValueError("Duplicate asset identifiers across manifests")
    runtime = BASE.read(repo / "dlc/covenant/sprites-v011.json")
    data["assetIndex"] = BASE.normalized_asset_index(assets, repo, runtime)
    data["sourceManifests"] = manifests
    manifest = BASE.read(new_manifest_path) if new_manifest_path.exists() else {}
    new = manifest.get("assets", [])
    continuation = data["continuationV016"]
    continuation["referenceCorrections"] = copy.deepcopy(manifest.get("referenceCorrections", []))
    for key in ["generationFailures", "generationRejections", "deferred", "blocked", "incompleteCycles", "blockedCarriedForward", "notAttemptedAfterRelatedOutputRejection"]:
        if key in manifest:
            continuation[key] = [{k: copy.deepcopy(v) for k, v in r.items() if k not in ["prompt", "generationPrompt"]} for r in manifest[key]]
    correction_targets = {"CORR-V016-AUDI-A173663": ["VEH-AUDI", "ACOV-124"],
                          "CORR-V016-1578-CONFIRMED": ["TERR-BURN"],
                          "CORR-V016-BAVARI-CONCEPT": ["VEH-MOTHER-TUG"]}
    all_records = {r["id"]: r for domain in DOMAINS + ["referenceRegister"] for r in data[domain]}
    for correction in manifest.get("referenceCorrections", []):
        if not any(r.get("id") == correction.get("id") for r in data["worldReferenceCorrections"]):
            data["worldReferenceCorrections"].append(copy.deepcopy(correction))
        for rid in correction_targets.get(correction.get("id"), []):
            all_records[rid].setdefault("sourceCorrectionsV016", []).append(copy.deepcopy(correction))
    candidates = {r["id"]: r for r in data["supplementalCandidates"]}
    reference_ids = {r["id"] for r in data["referenceRegister"]}
    for addition in manifest.get("supplementalCandidates", []):
        rid = addition["id"]
        if rid in candidates:
            candidates[rid]["sourceSupplementV016"] = copy.deepcopy(addition)
            continue
        if not all(addition.get(k) for k in ["name", "scope", "sourceDescription"]):
            raise ValueError("New candidate is missing its name, scope or source description: " + rid)
        if not BASE.source_urls(addition):
            raise ValueError("New candidate has no attributed source: " + rid)
        if set(record_refs(addition)) - reference_ids:
            raise ValueError("New candidate references an unknown ACOV identifier: " + rid)
        candidate = copy.deepcopy(addition)
        candidate.update(verified1to1=False, currentConsumer=None)
        candidate.setdefault("generationState", "documented-production-reference")
        data["supplementalCandidates"].append(candidate)
        candidates[rid] = candidate
    data["newAssets"] = [{
        **{k: copy.deepcopy(v) for k, v in a.items() if k not in ["prompt", "generationPrompt", "localPath"]},
        "promptSource": {"path": str(new_manifest_path.relative_to(repo)), "assetId": a["id"]},
    } for a in new]
    current = {a["id"]: a for a in data["assetIndex"]}
    runtime_ids = {a["id"] for a in runtime["assets"]}
    cycles = runtime.get("cycles", [])
    changed_profiles = set()
    for profile in data["characterProfiles"]:
        owned = [c for c in cycles if c.get("key") == profile["id"] or c.get("rendererKey") == profile["id"]]
        if owned:
            previous = copy.deepcopy({k: profile.get(k) for k in ["walkCycles", "availableImageStates", "runtimeImageStates", "runtimePngIds", "missingStates", "nextAction"]})
            profile["walkCycles"] = copy.deepcopy([c for c in owned if c.get("state") == "walk"])
            supplied_states = unique(c.get("state") for c in owned)
            for key in ["availableImageStates", "runtimeImageStates"]:
                for state in supplied_states:
                    append_unique(profile, key, state)
            profile["missingStates"] = [s for s in profile.get("missingStates", []) if s.get("state") not in supplied_states]
            for cycle in owned:
                for aid in cycle["frames"]:
                    append_unique(profile, "runtimePngIds", aid)
            if previous["walkCycles"] != profile["walkCycles"]:
                profile["baselineProductionStatusV016"] = previous
                changed_profiles.add(profile["id"])
                profile["nextAction"] = "Relire le cycle admis au consommateur, dans les deux directions et aux transitions d’état. Couvrir séparément les autres états encore manquants et conserver le repli natif."
    profiles = {r["id"]: r for r in data["characterProfiles"]}
    for reference in data["referenceRegister"]:
        linked = reference.get("linkedInventoryProfiles", [])
        if not changed_profiles.intersection(linked):
            continue
        reference["baselineProductionStatusV016"] = {k: copy.deepcopy(reference.get(k, [])) for k in ["existingDetailed", "missingDetailed", "relatedExistingPngIds"]}
        for detail in reference.get("existingDetailed", []):
            profile = profiles.get(detail.get("profile"))
            if profile:
                detail.update(pngIds=copy.deepcopy(profile.get("runtimePngIds", [])), walkCycles=copy.deepcopy(profile.get("walkCycles", [])), currentConsumer=profile.get("currentConsumer"))
        reference["missingDetailed"] = [copy.deepcopy(r) for r in reference.get("missingDetailed", []) if r.get("profile") not in changed_profiles]
        reference["missingDetailed"] += [{"profile": pid, "states": copy.deepcopy(profiles[pid]["missingStates"])} for pid in linked if pid in changed_profiles and profiles[pid].get("missingStates")]
        for pid in linked:
            for aid in profiles.get(pid, {}).get("runtimePngIds", []):
                append_unique(reference, "relatedExistingPngIds", aid)
    records = {row["id"]: row for domain in DOMAINS + ["referenceRegister"] for row in data[domain]}
    occurrences = {r["id"]: r for r in data["propInstances"]}
    runtime_assets = {r["id"]: r for r in runtime["assets"]}
    changed_families = set()
    for asset in new:
        ids = unique(asset.get("bibleRecordIds", []) + asset.get("relatedBibleIds", []))
        admitted_occurrences, planned_occurrences = [], []
        for oid in asset.get("bibleOccurrenceIds", []):
            if oid not in occurrences:
                raise ValueError("Unknown occurrence for generated image: " + oid)
            occurrence = occurrences[oid]
            binding = runtime_assets.get(asset["id"])
            if not binding:
                planned_occurrences.append(oid)
                occurrence["catalogueCandidateV016"] = {"assetId": asset["id"], "admission": "catalogue-only", "scope": "Emplacement envisagé ; aucune modification du rendu courant."}
                ids = unique(ids + [occurrence["family"], occurrence["room"]])
                continue
            if binding.get("kind") != "prop" or binding.get("key") not in [occurrence["family"], oid]:
                raise ValueError("Occurrence has no matching runtime prop binding: " + oid)
            if binding.get("rooms") and occurrence["room"] not in binding["rooms"]:
                raise ValueError("Occurrence lies outside admitted rooms: " + oid)
            if occurrence.get("suppressionReasons") or occurrence.get("forcedProceduralReasons"):
                raise ValueError("A suppressed or procedural occurrence cannot be marked as covered: " + oid)
            occurrence["baselineRenderStatusV016"] = {k: copy.deepcopy(occurrence.get(k)) for k in ["selectedPngId", "runtimeEligibleWhenVisibleAndLoaded", "status"]}
            for key in ["directFamilyPngIds", "runtimeMatchedPngIds"]:
                append_unique(occurrence, key, asset["id"])
            occurrence.update(selectedPngId=asset["id"], runtimeEligibleWhenVisibleAndLoaded=True, status="png-runtime-eligible")
            occurrence["currentV016Admission"] = {"assetId": asset["id"], "scope": "Cette occurrence exacte seulement ; les autres occurrences restent indépendantes."}
            changed_families.add(occurrence["family"])
            admitted_occurrences.append(oid)
            ids = unique(ids + [occurrence["family"], occurrence["room"]])
        for rid in ids:
            if rid not in records:
                raise ValueError("Unknown bible record for generated image: " + rid)
            target = records[rid]
            update = target.setdefault("currentV016Update", {"assetIds": [], "scope": "Vues particulières seulement ; les autres états et les demandes de référence restent ouverts."})
            append_unique(update, "assetIds", asset["id"])
            update.setdefault("assetAdmissions", {})[asset["id"]] = current[asset["id"]]["runtimeAdmission"]
            update["sourceUrls"] = unique(update.get("sourceUrls", []) + BASE.source_urls(asset))
            for oid in admitted_occurrences:
                append_unique(update, "occurrenceIds", oid)
            for oid in planned_occurrences:
                append_unique(update, "plannedOccurrenceIds", oid)
    for fid in changed_families:
        family = records[fid]
        instances = [r for r in data["propInstances"] if r["family"] == fid]
        count = sum(bool(r.get("runtimeEligibleWhenVisibleAndLoaded")) for r in instances)
        family.update(runtimeEligibleInstances=count, missingRuntimeInstances=len(instances) - count,
                      runtimeCoverage="full" if count == len(instances) else "partial" if count else "none")
        for instance in instances:
            if instance.get("selectedPngId"):
                append_unique(family, "existingDirectPngIds", instance["selectedPngId"])
    for row in records.values():
        update = row.get("currentV016Update")
        if update:
            admissions = {"catalogue-only" if x == "catalogue-only" else "runtime-scoped" for x in update["assetAdmissions"].values()}
            update["admission"] = next(iter(admissions)) if len(admissions) == 1 else "mixed-runtime-and-catalogue"
    incomplete = {}
    for asset in new:
        if asset.get("incompleteCycle"):
            sequence = asset["incompleteCycle"]
            group = incomplete.setdefault(sequence["id"], {**copy.deepcopy(sequence), "assetIds": [], "rendererKey": asset.get("rendererKey"), "state": asset.get("state")})
            group["assetIds"].append(asset["id"])
    for sequence in incomplete.values():
        if any(aid in runtime_ids for aid in sequence["assetIds"]):
            raise ValueError("An incomplete catalogue cycle must not have runtime frames")
        sequence["suppliedFrames"] = len(sequence["assetIds"])
        sequence["runtimeEnabled"] = False
        profile = profiles[sequence["rendererKey"]]
        profile["incompleteCatalogueSequenceV016"] = copy.deepcopy(sequence)
        profile["nextAction"] = "Conserver les poses de catalogue et la marche procédurale existante. Le cycle incomplet reste hors rendu ; la phase refusée et les phases non tentées restent documentées sans nouvelle tentative."
        for refid in record_refs(profile):
            records[refid]["incompleteCatalogueSequenceV016"] = copy.deepcopy(sequence)
    continuation["incompleteCharacterSequences"] = list(incomplete.values())
    summary = data["summary"]
    summary.update(
        pngs=len(assets), newPngs=len(new), runtimePngs=len(runtime_ids), catalogueOnlyPngs=len(assets) - len(runtime_ids),
        playerWalkCycles=sum(c.get("consumer") != "npc" and c.get("state") == "walk" for c in cycles),
        npcWalkCycles=sum(c.get("consumer") == "npc" and c.get("state") == "walk" for c in cycles),
        animationPhases=sum(len(c["frames"]) for c in cycles), certified1to1Images=0,
    )
    summary["movingNpcProfilesWithoutWalkPng"] = sum(bool(p.get("movingActorIds")) and any(s.get("state") == "walk" for s in p.get("missingStates", [])) for p in data["characterProfiles"])
    summary["playerProfilesWithoutRunPng"] = sum(bool(p.get("playerRooms")) and any(s.get("state") == "run" for s in p.get("missingStates", [])) for p in data["characterProfiles"])
    summary["supplementalCandidates"] = len(data["supplementalCandidates"])
    summary["supplementalObjectCandidates"] = sum(r["id"] not in {"shaw-crossing", "engineer-civilian", "ankor-eva-heavy"} for r in data["supplementalCandidates"])
    summary["incompleteCharacterSequencePngs"] = sum(len(r["assetIds"]) for r in incomplete.values())
    claims = manifest.get("summary", {})
    for claim, actual in [("newPngs", summary["newPngs"]), ("cumulativePngs", summary["pngs"]),
                          ("runtimePngs", summary["runtimePngs"]), ("cataloguePngs", summary["catalogueOnlyPngs"])]:
        if claim in claims and claims[claim] != actual:
            raise ValueError("Manifest count differs from actual source/runtime data: " + claim)
    return runtime


def readable_groups(data):
    gs = BASE.groups(data)
    candidates = {x["id"]: x for x in data["supplementalCandidates"] if x["id"] == "ankor-eva-heavy"}
    for group in gs:
        if group["name"] == "Props":
            group["rows"] = [r for r in group["rows"] if r["id"] not in candidates]
        if group["name"] == "Personnages":
            group["rows"] += [BASE.common(r, "Personnages") for r in candidates.values()]
        for row in group["rows"]:
            detail = row["details"]
            brief = detail.get("productionBriefV016", {})
            if brief:
                additions = [brief[k] for k in ["animationContract", "asymmetryLock", "consumerConstraint", "layerContract", "silhouetteContract", "identityLock", "representationContract", "placementContract"] if brief.get(k)]
                if brief.get("thresholdPlan"):
                    additions.append("Seuils à préserver : " + " ; ".join(t["thresholdId"] + " vers " + t["to"] + " sur " + str(t.get("support")) for t in brief["thresholdPlan"]) + ".")
                row["nextAction"] += "\nProduction V016 : " + " ".join(additions or brief.get("acceptanceChecks", []))
            review = detail.get("primarySourceReviewV016")
            if review:
                row["description"] += "\nPrécision de source V016 : " + review["finding"]
                row["constraints"] += "\n" + review["limit"]
            if detail.get("currentV016Update"):
                update = {k: v for k, v in detail["currentV016Update"].items() if k != "sourceUrls"}
                row["existing"] += "\nAjout V016 : " + BASE.plain(update)
            if detail.get("incompleteCatalogueSequenceV016"):
                row["existing"] += "\nSéquence incomplète de catalogue V016 : " + BASE.plain(detail["incompleteCatalogueSequenceV016"])
            if detail.get("sourceCorrectionsV016"):
                row["constraints"] += "\nCorrections de référence V016 : " + BASE.plain(detail["sourceCorrectionsV016"])
            row["sources"] = unique(row["sources"] + BASE.source_urls(detail))
    return gs


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=HERE.parent)
    parser.add_argument("--baseline", type=Path)
    parser.add_argument("--baseline-commit", default="806a9c387477b5d972846df92016ac3537b3f402")
    parser.add_argument("--tables-out", type=Path)
    parser.add_argument("--draft", action="store_true")
    args = parser.parse_args()
    repo = args.root.resolve()
    folder = repo / "docs/covenant"
    baseline = args.baseline or folder / "BIBLE_COVENANT_V014.json"
    if not baseline.is_absolute():
        baseline = repo / baseline
    original = BASE.read(baseline)
    data = copy.deepcopy(original)
    data.update(version=VERSION, date="2026-11-26", baselineCommit=args.baseline_commit, verified1to1=False)
    data["bibleConnections"]["pullRequestRoleV016"] = "Lien hérité vers la PR de base ; la continuation V016 est préparée sur une branche complémentaire."
    data["continuationV016"] = {
        "baselineBible": str(baseline.relative_to(repo)), "baselineSha256": BASE.sha(baseline),
        "baselineVersion": original["version"],
        "status": "draft-awaiting-manifest" if args.draft else "reference-guided-partial-continuation",
        "requestDomains": ["personnages", "lieux", "armes", "props", "véhicules", "vaisseaux", "terrains", "planètes"],
        "scope": "Compléments de production et de source sur le registre existant. Les phases, occurrences et vues thématiques ne s’additionnent pas en entités uniques.",
    }
    data["policy"] = [x for x in data["policy"] if not x.startswith("Les images d’origine")]
    data["policy"].append("Les PNG et manifestes historiques gardent leurs octets. Le lot courant est relié explicitement aux fiches qu’il illustre.")
    factual_clarifications(data)
    refresh_assets(data, repo, args.draft)
    brief_count = build_production_briefs(data)
    data["continuationV016"].update(productionBriefCount=brief_count,
        domainRecordCounts={k: len(data[k]) for k in DOMAINS}, thresholdPlans=len(data["thresholds"]))
    historical = ["referenceRegister", "characterProfiles", "rooms", "weaponFamilies", "propFamilies", "vehicles",
                  "ships", "worldComponents", "terrains", "planets", "connections", "thresholds", "propInstances"]
    for domain in historical:
        if {r["id"] for r in original[domain]} != {r["id"] for r in data[domain]}:
            raise ValueError("Historical identifier set changed: " + domain)
    if not {r["id"] for r in original["supplementalCandidates"]}.issubset({r["id"] for r in data["supplementalCandidates"]}):
        raise ValueError("A historical supplemental candidate disappeared")
    data = BASE.repo_safe(data, repo, repo)
    BASE.write(folder / "BIBLE_COVENANT_V016.json", data)
    groups = readable_groups(data)
    markdown = BASE.markdown(data, groups).replace("# Alien: Covenant — Bible détaillée V0.14", "# Alien: Covenant — Bible détaillée V0.16", 1)
    markdown = markdown.replace("[PR de cette continuation]", "[PR de base de cette continuation]", 1)
    introduction = (
        "\n## Compléments de cette continuation\n\n"
        f"{brief_count} fiches disposent d’un contrat de production V016 : apparence à conserver, consommateurs, états à couvrir, placement et validation. Les 57 lieux détaillent leurs seuils existants ; aucun raccord de campagne n’est ajouté par la bible.\n\n"
        "Les sources primaires précisent la variante EVA d’Ankor, la base F90 et la portée promotionnelle du rover Audi. Les manques de géométrie, d’animation et de référence restent ouverts tant qu’une preuve propre ne les clôt pas.\n"
    )
    if data["continuationV016"].get("incompleteCharacterSequences"):
        introduction += "\nLes cinq poses de David sont conservées au catalogue. La phase 03 a été refusée par le générateur ; les phases 04 et 08 n’ont pas été tentées après ce refus. Le cycle n’est pas admis dans le rendu et la marche procédurale existante demeure active.\n"
    markdown = markdown.replace("\n## Conventions", introduction + "\n## Conventions", 1)
    (folder / "BIBLE_COVENANT_V016.md").write_text(markdown)
    payload = {"summary": data["summary"], "groups": groups, "assets": data["assetIndex"]}
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    template = BASE.HTML.replace("V0.14", "V0.16").replace("V014", "V016")
    (folder / "BIBLE_COVENANT_V016.html").write_text(template.replace("__PAYLOAD__", encoded))
    if args.tables_out:
        tables = BASE.table_payload(data, groups)
        for table in tables["tables"]:
            table["headers"] = [h.replace("Existant / ajout V014", "Existant / continuation") for h in table["headers"]]
        BASE.write(args.tables_out, tables)
    print(json.dumps({"version": VERSION, "baseline": str(baseline.relative_to(repo)),
        "briefs": brief_count, "summary": data["summary"], "groups": {g["name"]: len(g["rows"]) for g in groups}}, ensure_ascii=False))


if __name__ == "__main__":
    main()
