/** Source-only River of Pain production bible. Recovered after executor interruption. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const productionKinds=new Set(['character_study','environment_study','vehicle_study','ship_study','terrain_study','world_study','equipment_study']);
function validateProductionManifest(manifest,{recordIds,sourceIds}={}){
 const require=(condition,message)=>{if(!condition)throw Error('Production bible: '+message);};
 const string=value=>typeof value==='string'&&value.trim().length>0;
 const strings=value=>Array.isArray(value)&&value.every(string);
 require(manifest&&manifest.schema===1&&manifest.id==='river-of-pain-bible-production-assets','unsupported registry');
 require(manifest.usage==='bible_only','registry usage must remain bible_only');
 require(Array.isArray(manifest.assets)&&manifest.assets.length<=512,'invalid asset list');
 const ids=new Set(),files=new Set();
 for(const a of manifest.assets){
  require(a&&typeof a==='object','invalid asset');
  require(typeof a.id==='string'&&/^prod-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.id)&&!ids.has(a.id),'duplicate or invalid asset id');ids.add(a.id);
  require(typeof a.file==='string'&&/^production\/[a-z0-9]+(?:-[a-z0-9]+)*\.png$/.test(a.file)&&!files.has(a.file),'duplicate or invalid PNG path');files.add(a.file);
  require(a.usage==='bible_only'&&productionKinds.has(a.kind),'invalid production usage or kind: '+a.id);
  require(string(a.title)&&string(a.chronology),'title and chronology required: '+a.id);
  require(Array.isArray(a.targets)&&a.targets.length>0&&a.targets.length<=32,'invalid targets: '+a.id);
  const targets=new Set();
  for(const target of a.targets){
   require(target&&typeof target.recordId==='string'&&/^rop:[a-z_]+:[a-z0-9_-]+$/.test(target.recordId),'invalid record target: '+a.id);
   require(!targets.has(target.recordId)&&['subject','context'].includes(target.role),'duplicate target or invalid role: '+a.id);targets.add(target.recordId);
   if(recordIds)require(recordIds.has(target.recordId),'unknown record '+target.recordId);
  }
  require(strings(a.sourceIds)&&a.sourceIds.length>0&&new Set(a.sourceIds).size===a.sourceIds.length,'invalid sources: '+a.id);
  if(sourceIds)for(const id of a.sourceIds)require(sourceIds.has(id),'unknown source '+id);
  require(Array.isArray(a.sourceClaims)&&a.sourceClaims.length>0&&a.sourceClaims.every(c=>c&&a.sourceIds.includes(c.sourceId)&&string(c.claim)),'source claims required: '+a.id);
  require(strings(a.interpretations)&&a.interpretations.length>0,'interpretations required: '+a.id);
  require(typeof a.sha256==='string'&&/^[a-f0-9]{64}$/.test(a.sha256),'invalid SHA-256: '+a.id);
  require(Number.isSafeInteger(a.bytes)&&a.bytes>0,'measured byte count required: '+a.id);
  require(a.pixels&&['width','height'].every(k=>Number.isSafeInteger(a.pixels[k])&&a.pixels[k]>0&&a.pixels[k]<=16384),'measured PNG dimensions required: '+a.id);
  require(a.generation&&string(a.generation.tool)&&string(a.generation.prompt)&&/^\d{4}-\d{2}-\d{2}$/.test(a.generation.createdOn),'generation provenance required: '+a.id);
  require(a.generation.referenceUrls===undefined||strings(a.generation.referenceUrls),'invalid generation references: '+a.id);
  require(a.scale===null||(a.scale&&typeof a.scale==='object'&&!Array.isArray(a.scale)&&a.scale.officialMeasurements===false),'scale must be null or explicitly authored: '+a.id);
  require(a.validation&&['pending','reviewed_with_limitations'].includes(a.validation.visual)&&a.validation.fidelity1to1==='not_certified'&&strings(a.validation.notes),'distinct visual review required: '+a.id);
 }
 return manifest;
}

function buildBible(data,manifest,notes,options={}) {
 const dlc='dlc/fleuve-de-la-douleur',visual=dlc+'/visual-v1',output=visual+'/bible';
 const categories=['personnages','lieux','armes_equipements','props','vehicules','vaisseaux','terrains','planetes'];
 const labels={personnages:'Personnages et créatures',lieux:'Lieux',armes_equipements:'Armes et équipements',props:'Props et mobilier',vehicules:'Véhicules',vaisseaux:'Vaisseaux',terrains:'Terrains et matériaux',planetes:'Planètes et satellites'};
 const sources=[...data.sources,...notes.sources],sourceIds=new Set(sources.map(s=>s.id)),records=[];
 const unique=x=>[...new Set(x)],roomById=new Map(data.rooms.map(r=>[r.id,r]));
 const historical=(category,id)=>data.fidelity.coverage.find(r=>r.category===category&&r.id===id);
 const assetsFor=(category,id)=>manifest.assets.filter(a=>a.category===category&&a.targetIds.includes(id));
 const assetMap=new Map(manifest.assets.map(a=>{
  const metadata=options.assetMetadata?.[a.id]||{};
  return[a.id,{id:a.id,file:visual+'/'+a.file,sha256:a.sha256,bytes:metadata.bytes??null,pixels:metadata.pixels??null,
   alphaBounds:a.bounds,anchor:a.anchor,displayHeight:a.height,pose:a.pose,facing:a.facing,weapon:a.weapon,state:a.state,
   fidelity:a.fidelity,validation:{source:metadata.validation||'sha256_et_ancrages_lus_dans_manifeste_non_recalcules',visualComparison:'not_certified'}}];
 }));
 function make(category,id,name,detail={}){
  const defaultStatus={definition:'documented',generation:'no_png',integration:'native_procedural',automaticValidation:'data_inventory_only',visualValidation:'not_certified',fidelity1to1:'not_certified'};
  const entry={description:'',provenance:'adaptation_du_projet',sourceIds:[],sourcePaths:[dlc+'/src/river-of-pain/data.js'],
   chronology:'Campagne coloniale 2179 ; dialogues et parcours adaptés.',appearance:'',gameplay:'',locations:[],dimensions:null,placement:null,
   assetIds:[],missing:[],acceptance:[],...detail,id:'rop:'+category+':'+id,nativeId:id,category,name,status:{...defaultStatus,...detail.status}};
  entry.assetIds=unique(entry.assetIds);
  entry.assets=entry.assetIds.map(assetId=>{if(!assetMap.has(assetId))throw Error('Unknown asset '+assetId);return assetMap.get(assetId);});
  if(entry.assets.length){entry.status.generation='png_present';entry.status.automaticValidation=options.validationMode||'registre_et_liens_verifies_octets_non_relus';}
  for(const sourceId of entry.sourceIds)if(!sourceIds.has(sourceId))throw Error('Unknown source '+sourceId);
  records.push(entry);return entry;
 }
 for(const a of Object.values(data.appearances)){
  const id=a.id,p=data.characters[id],n=notes.characters[id]||{},original=a.identity==='original';
  const actorAssets=assetsFor('person',id),contacts=data.canonicalContacts.filter(c=>c.actorId===id);
  make('personnages',id,a.name,{
   description:n.description||p?.role||(original?'Colon original des interactions locales.':'Personnage nommé avec profil spécifique.'),
   provenance:original?'creation_originale_du_projet':'identite_roman_apparence_partiellement_interpretee',
   sourceIds:unique([...(historical('personnage',id)?.sources||[]),...(n.sourceIds||[])]),
   appearance:[a.visualStatus,n.appearance].filter(Boolean).join(' '),
   chronology:n.chronology||'Variante 2179. Un passage situé en 2173 ne valide pas automatiquement la tenue ou la scène de 2179.',
   gameplay:p?'Jouable. '+p.role+'. Arme de base : '+(p.weapon||'aucune')+'.':'Personnage de scène/contact ; un portrait ne crée pas une campagne jouable.',
   locations:unique([...data.rooms.filter(r=>r.objects.some(o=>o.actorId===id)).map(r=>r.id),...contacts.map(c=>c.room),...data.chapters.filter(c=>c.character===id).map(c=>c.start)]),
   dimensions:{modelHeight:a.height,bodyScale:a.build,units:'unites_logiques_du_rendu_pas_centimetres'},
   placement:{anchor:'ligne_des_pieds',contacts,nativePalette:{skin:a.skin,hair:a.hair,top:a.color,pants:a.pants},wardrobe:a.wardrobe,hairstyle:a.hairstyle},
   assetIds:actorAssets.map(a=>a.id),
   missing:[...(n.missing||[]),'Cycles de marche/course et transitions complets absents du registre PNG.','Accroupissement, interaction, blessure, franchissement et actions d’arme applicables à produire puis raccorder.','Comparer visage, costume, proportions et détails asymétriques aux références de la période.'],
   acceptance:['Un PNG entier par pose, avec la bonne identité.','Conserver pieds, proportions et attaches d’équipement.','Vérifier les états animés et la sauvegarde/reprise.'],
   status:{integration:actorAssets.length?'png_selectif_repli_natif_pour_etats_absents':'native_procedural'}
  });
 }
 for(const r of data.life.residents){
  make('personnages',r.id,r.name,{
   description:r.role,provenance:'creation_originale_du_projet',
   appearance:'Profil original : coiffure '+r.hair+', outil '+r.tool+', palette '+r.color+'. Aucune identité de roman revendiquée.',
   gameplay:'Résident mobile, phases '+r.minPhase+' à '+r.maxPhase+'. Échanges : '+r.topics.map(t=>t.label).join(' ; ')+'.',
   locations:[r.room],dimensions:{modelHeight:r.height,units:'unites_logiques_du_rendu'},
   placement:{points:r.points,refuge:r.refuge,accessory:r.tool,anchor:'ligne_des_pieds'},
   assetIds:assetsFor('person',r.id).map(a=>a.id),
   missing:['Marche et transitions vers le refuge à produire ; seul état fixe en PNG.','Posture de peur et interaction métier sans double outil.'],
   acceptance:['Conserver le bon accessoire ; retirer son doublon natif uniquement quand le PNG est dessiné.','Nom et chemin restent propres au résident.'],
   status:{integration:'png_idle_selectif_repli_natif_en_mouvement',fidelity1to1:'non_applicable_identite_originale'}
  });
 }
 for(const p of notes.missingCharacters)make('personnages',p.id,p.name,{
  description:p.description,provenance:p.provenance||'personnage_atteste_extrait_roman',sourceIds:p.sourceIds,
  appearance:p.appearance||'Visage, costume précis et couleurs à documenter.',
  chronology:p.chronology||'Conserver scène, époque et rôle du roman ; aucune insertion automatique dans la colonie.',
  gameplay:'Fiche de production manquante ; ni profil ni spawn ajouté par la bible.',locations:p.locations||[],supersedesHistoricalGroup:p.group||null,
  missing:['Profil en jeu, PNG runtime et états propres à la scène à produire.','Placement, interactions et séquence à intégrer après validation des sources.'],
  acceptance:['Ne pas utiliser un comédien de doublage comme visage canonique sans preuve.','Préserver grade, métier, époque et localisation.'],
  status:{definition:'reference_documented',integration:'absent',automaticValidation:'source_reference_only'}
 });
 for(const c of [
  {id:'adult',name:'Xénomorphe adulte',description:'Patrouille, recherche, poursuite et préparation d’attaque natives.',missing:['Marche, course, attaque, recul, entrée par conduit et mort à produire.']},
  {id:'facehugger',name:'Facehugger',description:'Créature basse ; le PNG existant couvre seulement le repos.',missing:['Locomotion, bond/attaque, recul, conduit et défaite absents du registre PNG.']}
 ])make('personnages',c.id,c.name,{
  description:c.description,provenance:'creature_franchise_adaptee_au_jeu',sourceIds:unique(['S1',...(notes.creatures?.[c.id]?.sourceIds||[])]),
  appearance:[notes.creatures?.[c.id]?.appearance,'Comparer silhouette, membres, queue, matière et échelle aux références dédiées.'].filter(Boolean).join(' '),
  gameplay:'La pose immobile ne remplace pas les animations d’attaque ou locomotion.',
  locations:data.encounters.filter(e=>e.kind===c.id).map(e=>e.room),assetIds:assetsFor('creature',c.id).map(a=>a.id),missing:[...(!assetsFor('creature',c.id).length?['PNG individuel absent ; variante de crâne et proportions à documenter.']:[]),...c.missing,...(notes.creatures?.[c.id]?.missing||[])],
  generationAttempts:notes.creatures?.[c.id]?.generationAttempts||[],
  acceptance:['Conserver hitboxes, signaux d’attaque et comportement natif.'],
  status:{integration:assetsFor('creature',c.id).length?'png_idle_selectif_repli_natif':'native_procedural'}
 });
 for(const r of data.rooms){
  const old=historical('lieu',r.id);
  const objectives=data.chapters.flatMap(c=>c.objectives.filter(o=>o.room===r.id).map(o=>({...o,chapterId:c.id,chapter:c.title})));
  make('lieux',r.id,r.name,{
   description:r.building+', niveau '+r.floor+'. Repère : '+r.landmark+'.',
   provenance:'lieu_reconstitue_plan_original_non_cote',sourceIds:old?.sources||[],
   appearance:'Famille '+r.architecture.style+', variante '+r.architecture.variant+', ambiance '+r.light+'. '+(old?.note||''),
   gameplay:objectives.length?objectives.map(o=>o.chapterId+' : '+o.label).join(' ; '):'Circulation, exploration ou service relié au plan existant.',
   locations:[r.id],dimensions:{authoredMetres:r.dimensionsM,widthModelUnits:r.width,navigableZ:[r.minZ,r.maxZ],officialMeasurements:false},
   placement:{map:r.map,floor:r.floor,layers:r.layerPlan,parallax:r.architecture.parallax,portals:r.portals,spawns:r.spawns,objectives,propIds:r.props.map(p=>p.id)},
   missing:['Décor final et parallaxe propres au lieu à produire ; rendu actuel largement procédural.','Vérifier chaque seuil, sa cloison, l’arrivée dégagée et l’aller-retour en jeu.','Plans et dimensions officiels non établis par les sources consultées.'],
   acceptance:['Porte intégrée à un support visible et physiquement accessible.','Changements d’étage avec un accès approprié ; scènes orbitales séparées.','Mesures listées = modèle du projet, jamais cotation officielle revendiquée.']
  });
 }
 for(const r of data.fidelity.coverage.filter(r=>r.category==='lieu'&&!roomById.has(r.id)))make('lieux',r.id,r.title,{
  description:r.note,provenance:'sequence_roman_absente_du_parcours',sourceIds:r.sources,
  appearance:'Vue de référence, matériaux, échelle et circulation à documenter.',
  chronology:'Scène indépendante de la carte coloniale ; ellipse de récit explicite.',
  gameplay:'Lieu manquant ; aucune porte locale vers Hadley’s Hope.',
  missing:['Décor, acteurs, objectifs et transitions propres à la scène absents.','Références et plan architectural à établir.'],
  acceptance:['Ne jamais relier Gateway ou la récupération spatiale à LV-426 par une porte.'],
  status:{definition:'reference_documented',integration:'absent',automaticValidation:'source_reference_only'}
 });
 const propKinds=unique(data.rooms.flatMap(r=>r.props.map(p=>p.kind))).sort(),phaseKinds=unique(data.rooms.flatMap(r=>r.phaseDressing.map(p=>p.kind))).sort();
 const typeCategory={tractor:'vehicules',shuttle:'vaisseaux',wreck:'vaisseaux',rock:'terrains','rock-fragment':'terrains',resin:'terrains',rib:'terrains'};
 for(const kind of unique([...propKinds,...phaseKinds])){
  const category=typeCategory[kind]||'props',text=notes.props[kind]||[kind,'Élément de décor du projet.'],custom=notes.propNotes[kind]||{};
  const instances=data.rooms.flatMap(r=>r.props.filter(p=>p.kind===kind).map(p=>({room:r.id,...p})));
  const phases=data.rooms.flatMap(r=>r.phaseDressing.filter(p=>p.kind===kind).map(p=>({room:r.id,...p})));
  const assets=assetsFor('prop',kind),physical=instances.filter(p=>p.collidable||p.footprint),eligible=instances.filter(p=>!p.collidable&&!p.footprint);
  const row=options.envelopes?.[kind],envelope=row?{left:row[0],right:row[1],top:row[2],bottom:row[3],width:row[1]-row[0],height:row[3]-row[2],centerX:(row[0]+row[1])/2,mountHeight:-row[3]}:null;
  const own=['natal-unit','white-monitor','named-doctor','planter','plant'].includes(kind)?['R1']:['wreck','pilot-seat'].includes(kind)?['R2']:[];
  const record=make(category,'prop-'+kind,text[0],{
   description:text[1]+' '+instances.length+' placement(s) de base'+(phases.length?' et '+phases.length+' de phase':'')+'.',
   provenance:custom.provenance||(own.length?'repere_source_forme_et_implantation_adaptees':'forme_et_implantation_originales_du_projet'),
   sourceIds:unique([...own,...(custom.sourceIds||[])]),
   appearance:[custom.appearance||'Silhouette et palette de la famille locale ; détails non sourcés explicitement adaptés.',...assets.map(a=>a.fidelity.note)].join(' '),
   gameplay:'Décor '+(physical.length?'avec '+physical.length+' exemplaire(s) physique(s) conservés sous rendu natif':'sans collision pour ses instances de base')+'. '+(custom.gameplay||''),
   locations:unique([...instances.map(p=>p.room),...phases.map(p=>p.room)]),
   dimensions:{nativeEnvelope:envelope,physicalFootprints:physical.map(p=>({id:p.id,room:p.room,footprint:p.footprint||null})),units:'coordonnees_logiques ; z = profondeur_normalisee'},
   placement:{nativeKind:kind,instances,phaseInstances:phases,allowedDecorativeIds:assets.length?eligible.map(p=>p.id):[],mounts:unique(instances.map(p=>p.mount||'renderer'))},
   assetIds:assets.map(a=>a.id),
   missing:[...(assets.length?[]:['PNG runtime individuel absent.']),...(physical.length?['Habillage des exemplaires physiques à concevoir sans réduire emprise ou interactions.']:[]),...(phases.length?['Variantes et raccords de phase à contrôler.']:[]),...(custom.missing||[]),'Comparer échelle et montage en contexte ; référence filmique exacte non certifiée.'],
   acceptance:['Conserver chaque identifiant, coordonnée, couche et empreinte.','Objets muraux ou suspendus reliés à leur support ; aucune obstruction illogique.','Préserver légendes, témoins et retours d’interaction natifs.'],
   status:{integration:assets.length?'png_decoratif_selectif':'native_procedural'}
  });
  if(kind==='tractor')record.relatedRecordIds=['rop:vehicules:prospector-01'];
 }
 const equipmentIds=unique([...data.armory.weapons.map(w=>w.id),...(notes.additionalEquipmentIds||[]),...Object.keys(data.life.items),'tracker','weld','light',
  ...data.fidelity.coverage.filter(r=>r.category==='équipement'&&!['rover','natal','p5000','tools'].includes(r.id)).map(r=>r.id)]);
 for(const id of equipmentIds){
  const definition=data.life.items[id],weapon=data.armory.weapons.find(w=>w.id===id),old=historical('équipement',id),custom=notes.equipment[id]||{},assets=[...assetsFor('item',id),...assetsFor('weapon',id)];
  const unsupported=['cutter','scanner','suit','grappler','smartgun','sentry','pistol','shotgun'].includes(id),uncertain=['smartgun','sentry','pistol','shotgun'].includes(id);
  make('armes_equipements',id,custom.name||weapon?.name||definition?.label||old?.title||id,{
   description:custom.description||old?.note||'Équipement du système d’inventaire colonial.',
   provenance:uncertain?'presence_dans_ce_recit_a_verifier':custom.provenance||(old?.sources.length?'reference_identifiee_implementation_adaptee':'equipement_de_gameplay'),
   sourceIds:unique([...(old?.sources||[]),...(custom.sourceIds||[])]),
   appearance:[custom.appearance,...assets.map(a=>a.fidelity.note)].filter(Boolean).join(' ')||'Silhouette, pièces et marquages à documenter.',
   gameplay:weapon?weapon.evidence+'. Règles de jeu : '+JSON.stringify(data.armory.rules)+'.':unsupported?'Aucun objet jouable spécifique livré dans ce DLC.':'Objet ou commande natif. '+(definition?JSON.stringify(definition):old?.status||''),
   locations:weapon?[data.armory.rack.room]:custom.locations||[],
   dimensions:definition?{inventoryRules:definition,physicalMeasurement:'non_documentee'}:null,
   placement:weapon?{rack:data.armory.rack,attachment:'mains_et_point_de_tir_natifs'}:{attachment:unsupported?'a_definir_selon_scene_source':'inventaire_et_interaction_existants'},
   assetIds:assets.map(a=>a.id),
   generationAttempts:custom.generationAttempts||[],
   missing:[...(assets.length?[]:['PNG individuel et vues utiles absents.']),...(weapon?['Poses tenue, visée, tir et rechargement à produire pour les personnages admissibles.']:[]),...(unsupported?[uncertain?'Présence dans River of Pain non confirmée ; ne pas ajouter par analogie avec Aliens.':'Scène spatiale et fonctionnalités propres absentes du parcours.']:[]),...(custom.missing||[])],
   acceptance:['Une forme filmique ne prouve pas sa dotation dans le roman.','Conserver portée, ressources, règles et sauvegardes natives.'],
   status:{definition:uncertain?'needs_primary_evidence':'documented',integration:unsupported?'absent':assets.length?'png_inventaire':'native_procedural'}
  });
 }
 for(const id of unique(data.life.residents.map(r=>r.tool)).filter(id=>!equipmentIds.includes(id)))make('armes_equipements','resident-'+id,notes.accessoryNames[id]||id,{
  description:'Accessoire métier inclus dans certains PNG humains, sans sprite autonome.',provenance:'creation_originale_du_projet',
  appearance:'Conserver outil, prise et échelle propres au résident.',gameplay:'Ne crée pas un objet récupérable.',
  locations:unique(data.life.residents.filter(r=>r.tool===id).map(r=>r.room)),placement:{residentIds:data.life.residents.filter(r=>r.tool===id).map(r=>r.id)},
  assetIds:manifest.assets.filter(a=>a.category==='person'&&a.accessory===id).map(a=>a.id),
  missing:['Vues individuelles et attaches modulaires pour les animations métier.'],
  acceptance:['Ne pas doubler un outil déjà inclus dans le corps.'],
  status:{integration:'inclus_dans_png_personnage_et_rendu_natif',fidelity1to1:'non_applicable_accessoire_original'}
 });
 make('vehicules',data.mobility.rover.id,data.mobility.rover.name,{
  description:'Tracteur pilotable entre piste et plateau, distinct des véhicules statiques.',
  provenance:'vehicule_de_gameplay_reference_generale_du_roman',sourceIds:['R1','R5'],
  appearance:'Cabine, châssis et train roulant adaptés ; concept Daihotai ne prouve pas cette identité.',
  gameplay:'Conduite, montée/descente, batterie, freinage et réparation. '+JSON.stringify(data.mobility.rules),
  locations:data.mobility.rooms,dimensions:{width:data.mobility.rover.width,height:data.mobility.rover.height,depth:data.mobility.rover.depth,units:'unites_du_modele'},
  placement:{initial:data.mobility.rover,routes:data.mobility.links,stations:data.mobility.stations,replacedStaticCopies:data.mobility.replacedStaticCopies},
  missing:['Châssis et états de conduite PNG absents.','Vues, train roulant, conducteur et accès à produire.','Modèle précis de la scène à confirmer.'],
  acceptance:['Conserver empreinte et voies accessibles.','Ne pas réintroduire les copies statiques supprimées par la mobilité.']
 });
 for(const v of notes.vehicles)make('vehicules',v.id,v.name,{
  ...v,provenance:v.provenance||'reference_externe_non_integree',gameplay:'Référence ; aucun véhicule additionnel créé.',
  missing:['Référence de scène et version exacte à confirmer.','Vues, pivots, parties mobiles, accès et collision à produire.'],
  acceptance:['Un modèle terrestre ne devient pas une navette ; sa forme filmique ne prouve pas sa présence dans le roman.'],
  status:{definition:'reference_documented',integration:'absent',automaticValidation:'source_reference_only'}
 });
 for(const s of notes.ships)make('vaisseaux',s.id,s.name,{
  ...s,provenance:'sequence_source_forme_detaillee_a_documenter',gameplay:'Vaisseau/scène indépendant de la circulation coloniale.',
  missing:['Extérieur, intérieur pertinent, accès et transitions à produire.','Nom et modèle gardés non établis sans source.'],
  acceptance:['Pas de porte locale entre scène spatiale et Hadley’s Hope.','Déplacement par séquence ou ellipse cohérente.'],
  status:{definition:'reference_documented',integration:'absent',automaticValidation:'source_reference_only'}
 });
 for(const style of unique(data.rooms.map(r=>r.architecture.style)).sort()){
  const rooms=data.rooms.filter(r=>r.architecture.style===style),text=notes.materials[style]||[style,'Famille de matériaux du rendu natif.'];
  make('terrains','material-'+style,text[0],{
   description:text[1],provenance:'direction_artistique_et_materiaux_du_projet',
   appearance:'Sols, murs et plafond propres à la famille. Variantes : '+unique(rooms.map(r=>r.architecture.variant)).join(', ')+'.',
   gameplay:'Aucune nouvelle collision ou vitesse sans règle explicitement liée à une surface.',
   locations:rooms.map(r=>r.id),placement:{roomLayers:rooms.map(r=>({room:r.id,layers:r.layerPlan,parallax:r.architecture.parallax,safeFloor:r.architecture.safeFloor}))},
   missing:['Textures sans couture et couches de profondeur finales absentes du registre.','Raccords seuil/sol/mur, variantes dégradées et éclairage à produire.'],
   acceptance:['Échelle de détail cohérente entre salles adjacentes.','Aucune ouverture traversable suggérée sans passage réel.','Les couches proches ne masquent pas acteurs et arrivées.']
  });
 }
 for(const s of data.mobility.surfaces)make('terrains',s.id,s.label,{
  description:'Surface routière du système de mobilité.',provenance:'regle_de_terrain_originale_du_projet',
  appearance:s.id.includes('gravel')?'Granulats meubles et raccord diffus au sol rocheux.':'Ornières alignées sur le passage, relief adapté au véhicule.',
  gameplay:'Vitesse plafonnée à '+s.speedLimit+' unités logiques/s.',locations:[s.room],
  dimensions:{widthModelUnits:s.w,navigableZ:[s.minZ,s.maxZ]},placement:s,
  missing:['Texture individuelle et transitions latérales à produire.'],
  acceptance:['Zone visuelle identique à la zone de ralentissement.','Ne pas déduire la collision des pixels.']
 });
 make('planetes','lv426','LV-426 / Acheron — lune de Hadley’s Hope',{
  description:'Lune du récit, territoire de la colonie et de l’épave.',provenance:'cadre_du_roman_confirme_par_editeur',sourceIds:['S1','R1'],
  appearance:'Roche, poussière et météo sévère à l’échelle des scènes. Relief global, taille et carte planétaire non mesurés dans ces sources.',
  chronology:'Prologue 2173 et campagne 2179 à distinguer.',gameplay:'Monde de référence ; aucun vol spatial libre ou globe détaillé intégré.',
  locations:data.rooms.map(r=>r.id),dimensions:{officialDiameterKm:null,worldMap:'non_etablie'},
  missing:['Vue orbitale, globe et grand terrain à référencer puis produire.','Itinéraires colonie/prospection/processeurs/épave à recouper.'],
  acceptance:['Ne pas importer LV-178, Planet 4 ou Origae-6.','Qualifier LV-426 de lune ; coordonnées du jeu non officielles.'],
  status:{definition:'reference_documented',integration:'cadre_narratif_sans_asset_orbital',automaticValidation:'source_reference_only'}
 });
 for(const e of notes.extraRecords)make(e.category,e.id,e.name,{...e,status:{definition:'reference_documented',integration:'absent',automaticValidation:'source_reference_only'}});
 const ids=records.map(r=>r.id);
 if(ids.length!==new Set(ids).size)throw Error('Duplicate bible id');
 if(records.some(r=>!r.id.startsWith('rop:'+r.category+':')))throw Error('Unstable identifier');
 const productionManifest=validateProductionManifest(options.productionManifest||{schema:1,id:'river-of-pain-bible-production-assets',usage:'bible_only',assets:[]},{recordIds:new Set(ids),sourceIds});
 const productionAssets=productionManifest.assets.map(a=>{
  const metadata=options.productionMetadata?.[a.id];
  if(!metadata||metadata.validation!=='file_sha256_and_png_dimensions_verified')throw Error('Production PNG bytes not verified: '+a.id);
  if(metadata.bytes!==a.bytes||metadata.pixels.width!==a.pixels.width||metadata.pixels.height!==a.pixels.height)throw Error('Production PNG metadata mismatch: '+a.id);
  return {...a,file:output+'/'+a.file,viewerFile:a.file,validation:{...a.validation,file:metadata.validation}};
 });
 for(const record of records){
  record.productionAssets=productionAssets.filter(a=>a.targets.some(t=>t.recordId===record.id)).map(a=>({...a,relation:a.targets.find(t=>t.recordId===record.id).role}));
  record.productionAssetIds=record.productionAssets.map(a=>a.id);
  if(record.productionAssets.length)record.sourcePaths=unique([...record.sourcePaths,output+'/PRODUCTION_ASSETS.json']);
  record.productionStatus={generation:record.productionAssets.some(a=>a.relation==='subject')?'illustration_present':record.productionAssets.length?'context_image_only':'no_production_image',usage:'bible_only',fidelity1to1:'not_certified'};
 }
 const placements=records.flatMap(r=>r.placement?.instances||[]),phasePlacements=records.flatMap(r=>r.placement?.phaseInstances||[]);
 if(placements.length!==data.rooms.reduce((n,r)=>n+r.props.length,0))throw Error('Placement coverage');
 if(phasePlacements.length!==data.rooms.reduce((n,r)=>n+r.phaseDressing.length,0))throw Error('Phase coverage');
 const linked=new Set(records.flatMap(r=>r.assetIds));for(const a of manifest.assets)if(!linked.has(a.id))throw Error('Unlinked asset '+a.id);
 const summary={records:records.length,byCategory:Object.fromEntries(categories.map(c=>[c,records.filter(r=>r.category===c).length])),pngFiles:manifest.assets.length,
  recordsWithPng:records.filter(r=>r.assetIds.length).length,recordsWithoutPng:records.filter(r=>!r.assetIds.length).length,
  productionPngFiles:productionAssets.length,recordsWithProductionPng:records.filter(r=>r.productionAssets.length).length,
  recordsWithPrimaryProductionPng:records.filter(r=>r.productionAssets.some(a=>a.relation==='subject')).length,
  recordsWithProductionContextOnly:records.filter(r=>r.productionAssets.length&&!r.productionAssets.some(a=>a.relation==='subject')).length,
  recordsWithAnyPng:records.filter(r=>r.assetIds.length||r.productionAssets.length).length,
  recordsWithoutAnyPng:records.filter(r=>!r.assetIds.length&&!r.productionAssets.length).length,
  recordsWithDedicatedPng:records.filter(r=>r.assetIds.length||r.productionAssets.some(a=>a.relation==='subject')).length,
  recordsWithoutDedicatedPng:records.filter(r=>!r.assetIds.length&&!r.productionAssets.some(a=>a.relation==='subject')).length,
  imageCoverageByCategory:Object.fromEntries(categories.map(category=>{const rows=records.filter(r=>r.category===category);return[category,{runtime:rows.filter(r=>r.assetIds.length).length,production:rows.filter(r=>r.productionAssets.length).length,productionSubject:rows.filter(r=>r.productionAssets.some(a=>a.relation==='subject')).length,withoutAny:rows.filter(r=>!r.assetIds.length&&!r.productionAssets.length).length,withoutDedicated:rows.filter(r=>!r.assetIds.length&&!r.productionAssets.some(a=>a.relation==='subject')).length}];})),
  nativeHumanProfiles:Object.keys(data.appearances).length+data.life.residents.length,playableCharacters:Object.keys(data.characters).length,
  rooms:data.rooms.length,directedPortals:data.rooms.reduce((n,r)=>n+r.portals.length,0),
  undirectedLinks:new Set(data.rooms.flatMap(r=>r.portals.map(p=>[r.id,p.to].sort().join('|')))).size,
  propFamilies:propKinds.length,propPlacements:placements.length,phaseDressingFamilies:phaseKinds.length,phaseDressingPlacements:phasePlacements.length,confirmed1to1Records:0};
 const bible={schema:1,id:'river-of-pain-detailed-bible',revision:'2026-11-26.3',title:'Fleuve de la Douleur — bible de production détaillée',
  baseline:{branch:'codex/river-of-pain-props-v2',commit:'0adf04e16e38adbb325cf297727bb414dc8df646',recoveredVersion:data.manifest.version,...options.provenance},
  scope:'Profils humains et créatures natifs, lieux, props et placements, équipements, mobilité, matériaux et mondes du DLC récupéré, avec les manquants identifiés dans les sources consultées.',
  limitations:['Le roman intégral et tous les plans officiels n’ont pas été consultés ; exhaustivité canonique complète non certifiée.','PNG présent ne signifie pas animation complète, intégration dans tous les états ou fidélité 1:1.','Les dimensions du modèle sont des choix du projet sauf preuve indépendante.','La bible documente des contenus manquants sans les injecter au runtime.','Les anciens rapports v0.9 restent historiques.',options.validationMode==='file_sha256_and_png_dimensions_verified'?'Les PNG ont été relus par le générateur local : SHA-256, signature, taille et dimensions contrôlés. Cela ne certifie pas leur fidélité visuelle.':'Dans cette reconstruction distante, dimensions globales et tailles non relues sont null ; SHA-256 et ancrages proviennent du manifeste. Le générateur local peut les vérifier depuis les PNG.'],
  chronology:notes.chronology,exclusions:notes.exclusions,sourcePolicy:'Extrait primaire en priorité ; film/accessoire/concept pour les seuls faits qu’ils établissent ; interprétations identifiées.',
  categories:labels,summary,sources,records,
  production:{registry:output+'/PRODUCTION_ASSETS.json',usage:'bible_only',assets:productionAssets,policy:'Illustrations documentaires. Les liens de contexte sont identifiés ; aucune illustration ne modifie le statut d’intégration en jeu ou ne certifie une fidélité 1:1.'},
  spatialAudit:{links:data.rooms.flatMap(r=>r.portals.map(p=>({room:r.id,...p}))),portalCorrectionsInherited:data.portalClearanceCorrections,
   constraints:['Porte rattachée à une structure visible.','Approche et arrivée dégagées.','Seuil et destination cohérents.','Scènes spatiales séparées.','Passage d’escorté et voie de civière préservés.']}};
 const fmt=v=>typeof v==='object'?JSON.stringify(v):String(v??'Non documenté');
 const sourceLinks=ids=>ids.length?ids.map(id=>'['+id+']('+sources.find(s=>s.id===id).url+')').join(', '):'Données du projet ; référence externe précise non établie.';
 const md=['# '+bible.title,'','Révision '+bible.revision+' · Base récupérée '+data.manifest.version,'',bible.scope,'','## État de production','',
  '**'+summary.records+' fiches**, **'+summary.pngFiles+' PNG runtime**, **'+summary.productionPngFiles+' illustrations de production**, **'+summary.recordsWithoutDedicatedPng+' fiches sans image du sujet**, **'+summary.recordsWithoutAnyPng+' fiches sans aucune image**, **'+summary.rooms+' salles**, **'+summary.undirectedLinks+' connexions**, **'+summary.propFamilies+' familles de props**, **'+summary.propPlacements+' placements** et **'+summary.phaseDressingPlacements+' détails de phase**.','',
  'Définition, génération, intégration et validations restent distinctes. Les illustrations de production servent à la bible ; leur présence ne modifie pas l’intégration en jeu. Aucun statut de fidélité 1:1 n’est certifié.','',
  '| Domaine | Fiches | Avec PNG runtime | Avec illustration de production | Sujet illustré en production | Sans image du sujet | Sans aucune image |','| --- | ---: | ---: | ---: | ---: | ---: | ---: |',...categories.map(c=>{const p=summary.imageCoverageByCategory[c];return'| '+labels[c]+' | '+summary.byCategory[c]+' | '+p.runtime+' | '+p.production+' | '+p.productionSubject+' | '+p.withoutDedicated+' | '+p.withoutAny+' |';}),'',
  '## Continuité','',...notes.chronology.map(r=>'- **'+r.date+'** : '+r.description+' ('+r.sourceIds.join(', ')+').'),'',
  '## Limites documentaires','',...bible.limitations.map(t=>'- '+t),'','## Règles de raccordement','',...bible.spatialAudit.constraints.map(t=>'- '+t),'',
  'Le HTML propose filtres et aperçus. Le JSON conserve toutes les coordonnées, connexions et métadonnées.',''];
 for(const c of categories){
  md.push('## '+labels[c],'');
  for(const r of records.filter(r=>r.category===c)){
   md.push('### '+r.name,'','Identifiant : `'+r.id+'`','',r.description,'',
    '**Provenance :** '+r.provenance+'. Références : '+sourceLinks(r.sourceIds),'',
    '**Apparence :** '+r.appearance,'','**Chronologie :** '+r.chronology,'','**Jeu :** '+r.gameplay,'',
    '**Localisation :** '+(r.locations.length?r.locations.map(id=>roomById.get(id)?.name||id).join(' ; '):'Hors parcours ou scène à préciser.'),'',
    '**Dimensions et ancrage :** '+(r.dimensions?fmt(r.dimensions):'Mesures précises non documentées.'),'',
    '**État :** génération = '+r.status.generation+' ; intégration = '+r.status.integration+' ; automatique = '+r.status.automaticValidation+' ; visuel = '+r.status.visualValidation+'.','',
    '**PNG runtime :** '+(r.assets.length?r.assets.map(a=>'['+a.id+'](../'+a.file.slice(visual.length+1)+') — '+(a.pixels?a.pixels.width+' × '+a.pixels.height:'dimensions globales non relues')+', pose '+a.pose+', ancre '+a.anchor.x+'/'+a.anchor.y).join(' ; '):'Aucun PNG runtime individuel référencé.'),'',
    '**Production documentaire :** '+r.productionStatus.generation+'.','',
    ...r.productionAssets.flatMap(a=>['#### Illustration de production — '+a.title,'','!['+a.title+']('+a.viewerFile+')','',
     '**Rôle :** '+(a.relation==='subject'?'sujet principal de la fiche':'contexte visuel associé, sans livraison du sujet propre à la fiche')+'. **Fichier :** `'+a.id+'` ; '+a.pixels.width+' × '+a.pixels.height+' ; '+a.bytes+' octets.','',
     '**Sources :** '+sourceLinks(a.sourceIds),'',...a.sourceClaims.map(c=>'- '+c.claim+' ('+c.sourceId+').'),'',
     '**Interprétations :**','',...a.interpretations.map(t=>'- '+t),'','**Chronologie :** '+a.chronology,'',
     '**Échelle :** '+(a.scale?fmt(a.scale):'Aucune échelle physique, ancre ou ligne de sol certifiée.'),'',
     '**Validation :** fichier = '+a.validation.file+' ; revue visuelle = '+a.validation.visual+' ; fidélité 1:1 = '+a.validation.fidelity1to1+'.','',...a.validation.notes.map(t=>'- '+t),'']),
    ...(r.generationAttempts?.length?['**Tentatives sans nouvelle livraison :**','',...r.generationAttempts.map(a=>'- '+a.date+' — '+a.note),'']:[]),
    '**À compléter :**','',...r.missing.map(t=>'- '+t),'','**Contrôles attendus :**','',...r.acceptance.map(t=>'- '+t),'');
   if(r.placement?.portals)md.push('**Connexions :**','','| Accès | Destination | Montage | x / z | Condition |','| --- | --- | --- | --- | --- |',...r.placement.portals.map(p=>'| '+p.id+' | '+(roomById.get(p.to)?.name||p.to)+' | '+(p.architecture?.mount||p.kind)+' | '+p.x+' / '+p.z+' | '+(p.requires||(p.childOnly?'enfant':'selon phase'))+' |'),'');
   if(r.placement?.instances?.length)md.push('**Placements exacts :**','','| Identifiant | Salle | x / z | Couche / montage | Physique |','| --- | --- | --- | --- | --- |',...r.placement.instances.map(p=>'| '+p.id+' | '+p.room+' | '+p.x+' / '+p.z+' | '+p.layer+' / '+(p.mount||'renderer')+' | '+(p.collidable||p.footprint?'oui':'non')+' |'),'');
  }
 }
 md.push('## Sources','',...sources.map(s=>'### '+s.id+' — '+s.title+'\n\n'+s.url+'\n\nType : '+s.type+'. Usage : '+s.use+'\n'),'## Reconstruction','','```sh','node scripts/build-river-of-pain-bible.mjs','```','','Le générateur contrôle les identifiants, références et couvertures. En mode local il relit également les PNG et vérifie leurs empreintes. Une recette en jeu reste distincte.','');
 const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
 const encoded=JSON.stringify(bible).replaceAll('<','\\u003c');
 const html=`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fleuve de la Douleur — Bible détaillée</title>
<style>
:root{color-scheme:dark;--bg:#0e171b;--panel:#17262b;--text:#e8eeec;--muted:#b3c4c7;--line:#365158;--accent:#a8d2bf}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.6 system-ui,sans-serif}a{color:#a5d8ef}header,main,footer{max-width:1260px;margin:auto;padding:28px}header{padding-top:44px}h1{font-size:clamp(28px,4vw,46px);line-height:1.13;margin:14px 0}h2{font-size:25px}h3{font-size:21px;margin:0 0 6px}p{margin:10px 0}.eyebrow{color:var(--accent);letter-spacing:.08em;font-size:13px;text-transform:uppercase}.intro{max-width:980px;color:var(--muted)}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:24px 0}.stat{background:var(--panel);border:1px solid var(--line);padding:16px}.stat strong{font-size:27px;display:block;color:var(--accent)}.stat span{color:var(--muted);font-size:13px}.controls{position:sticky;top:0;background:#0e171bf5;padding:16px 0;border-bottom:1px solid var(--line);z-index:2;display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px}input,select{width:100%;background:#1d3037;color:var(--text);border:1px solid #527079;border-radius:5px;padding:11px;font:inherit}label{font-size:13px;color:var(--muted)}label span{display:block;margin-bottom:5px}.count{color:var(--muted);margin:16px 0}.card{background:var(--panel);border:1px solid var(--line);border-radius:7px;padding:23px;margin-bottom:16px}.record-header{display:flex;justify-content:space-between;gap:18px;align-items:start}.id{font:12px/1.5 ui-monospace,monospace;color:var(--muted);overflow-wrap:anywhere}.category{font-size:12px;color:var(--accent);border:1px solid #4c766b;padding:4px 9px;border-radius:3px}.content-grid{display:grid;grid-template-columns:1fr 240px;gap:24px}.images{display:flex;gap:12px;overflow:auto;max-width:100%;align-items:start}.images figure{margin:0;min-width:170px;max-width:220px}.images img{object-fit:contain;width:100%;height:230px;background:repeating-conic-gradient(#27373d 0% 25%,#34484e 0% 50%) 50%/18px 18px;border:1px solid #526a70;border-radius:4px}.images figcaption{font-size:11px;color:var(--muted);overflow-wrap:anywhere}.production{border:1px solid #47615b;background:#12231f;padding:18px;margin:18px 0}.production h4{margin:0 0 12px;font-size:18px;color:var(--accent)}.production-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:22px}.production figure{margin:0;min-width:0}.production img{display:block;width:100%;height:auto;max-height:460px;object-fit:contain;background:#0b1517;border:1px solid var(--line);border-radius:4px}.production figcaption{margin-top:8px;font-size:12px;color:var(--muted);overflow-wrap:anywhere}.production ul{padding-left:22px}.attempts{border-left:3px solid #d0b57a;padding-left:14px}.missing{background:#2f2c24;border-left:3px solid #d0b57a;padding:10px 15px;margin:15px 0}.missing h4{margin:0;color:#e1c894;font-size:14px}.missing ul{margin:6px 0 0;padding-left:21px}.details{border-top:1px solid var(--line);margin-top:15px;padding-top:8px}summary{cursor:pointer;color:var(--accent);padding:7px 0}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;background:#101e24;padding:16px;max-height:420px;overflow:auto}.status{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}.status span{overflow-wrap:anywhere;max-width:100%;font:12px/1.45 ui-monospace,monospace;background:#223940;border:1px solid #405f67;padding:5px 8px}.references{color:var(--muted);font-size:13px}.sources{display:grid;gap:13px}.source{padding:16px;background:var(--panel);border:1px solid var(--line)}.source a{overflow-wrap:anywhere}.small{font-size:13px;color:var(--muted)}button{background:#b3d5c3;color:#0e211b;border:0;border-radius:4px;padding:10px 18px;font:inherit;cursor:pointer}.page-controls{display:flex;gap:16px;align-items:center;margin:22px 0}button:disabled{opacity:.4;cursor:default}@media(max-width:750px){.stats{grid-template-columns:repeat(2,minmax(0,1fr))}header,main,footer{padding:18px}.controls{grid-template-columns:1fr;position:relative}.content-grid,.production-grid{grid-template-columns:1fr}.record-header{display:block}.category{display:inline-block;margin-top:10px}.images img{height:200px}.card{padding:17px}}@media print{.controls,.page-controls{display:none}.card{break-inside:avoid}body,.card{background:white;color:black}a{color:#234}.images img{height:140px}}
</style></head><body><header><div class="eyebrow">Aliens Tantalus Frontier / River of Pain</div><h1>Fleuve de la Douleur<br>Bible de production détaillée</h1><p class="intro">Personnages, lieux, armes, props, véhicules, vaisseaux, terrains et mondes. Chaque fiche relie contenu existant, références et éléments à produire.</p><div id="stats" class="stats"></div><p class="small">Révision ${escape(bible.revision)}. Les images présentes ne certifient pas une fidélité 1:1. Les dimensions du modèle sont des choix du projet. Les métadonnées non relues restent signalées comme inconnues.</p><p><a href="BIBLE_FLEUVE_DOULEUR.md">Version Markdown</a> · <a href="BIBLE_FLEUVE_DOULEUR.json">Données JSON</a> · <a href="../GALLERY.html">Galerie PNG</a></p></header><main><section><h2>Continuité et périmètre</h2><div id="timeline"></div><details class="details"><summary>Raccordements et exclusions</summary><div id="rules"></div></details></section><section><div class="controls"><label><span>Recherche dans les fiches</span><input id="search" type="search" placeholder="Nom, salle, manque…"></label><label><span>Domaine</span><select id="category"><option value="">Tous les domaines</option></select></label><label><span>État des images</span><select id="coverage"><option value="">Toutes les fiches</option><option value="missing">Sans PNG runtime</option><option value="png">Avec PNG runtime</option><option value="production">Avec illustration de production</option><option value="production-subject">Sujet illustré en production</option><option value="dedicated-missing">Sans image du sujet</option><option value="none">Sans aucune image</option><option value="absent">Absent du parcours</option></select></label></div><p id="count" class="count" aria-live="polite"></p><div id="records"></div><div class="page-controls"><button id="prev">Précédent</button><span id="page"></span><button id="next">Suivant</button></div></section><section><h2>Sources et limites d’usage</h2><div id="sources" class="sources"></div></section></main><footer class="small">Document de production. Les archives historiques et sauvegardes restent conservées. Une fiche manquante n’est pas déclarée jouable.</footer><script id="bible-data" type="application/json">${encoded}</script><script>
const bible=JSON.parse(document.getElementById('bible-data').textContent);const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);const sourceById=Object.fromEntries(bible.sources.map(s=>[s.id,s]));const roomNames=Object.fromEntries(bible.records.filter(r=>r.category==='lieux').map(r=>[r.nativeId,r.name]));const search=document.getElementById('search'),cat=document.getElementById('category'),coverage=document.getElementById('coverage');let page=0;const pageSize=20;let filtered=[];
document.getElementById('stats').innerHTML=[['Fiches',bible.summary.records],['PNG runtime',bible.summary.pngFiles],['Illustrations de production',bible.summary.productionPngFiles],['Salles',bible.summary.rooms],['Connexions',bible.summary.undirectedLinks],['Placements de props',bible.summary.propPlacements],['Fiches sans image du sujet',bible.summary.recordsWithoutDedicatedPng],['Fiches sans aucune image',bible.summary.recordsWithoutAnyPng]].map(([l,v])=>'<div class="stat"><strong>'+v+'</strong><span>'+esc(l)+'</span></div>').join('');Object.entries(bible.categories).forEach(([id,label])=>cat.add(new Option(label+' ('+bible.summary.byCategory[id]+')',id)));document.getElementById('timeline').innerHTML=bible.chronology.map(r=>'<p><strong>'+esc(r.date)+'</strong> — '+esc(r.description)+'</p>').join('');document.getElementById('rules').innerHTML='<ul>'+bible.spatialAudit.constraints.concat(bible.exclusions).map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>';document.getElementById('sources').innerHTML=bible.sources.map(s=>'<article class="source"><strong>'+esc(s.id+' — '+s.title)+'</strong><p>'+esc(s.use)+'</p><a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.url)+'</a><p class="small">'+esc(s.type)+'</p></article>').join('');
function referencesHtml(ids){return ids.map(id=>'<a href="'+esc(sourceById[id].url)+'" target="_blank" rel="noopener">'+esc(id)+'</a>').join(', ')||'Données du projet ; référence externe précise non établie.';}
function productionHtml(r){return r.productionAssets.map(a=>'<section class="production" data-production-asset="'+esc(a.id)+'"><h4>Illustration de production — '+esc(a.title)+'</h4><div class="production-grid"><figure><a href="'+esc(a.viewerFile)+'"><img loading="lazy" decoding="async" src="'+esc(a.viewerFile)+'" width="'+a.pixels.width+'" height="'+a.pixels.height+'" alt="'+esc(a.title)+'"></a><figcaption>'+esc(a.id)+' · '+a.pixels.width+' × '+a.pixels.height+' · '+a.bytes+' octets<br>'+(a.relation==='subject'?'Sujet principal de la fiche':'Contexte visuel associé ; le sujet propre à la fiche reste à produire')+'</figcaption></figure><div><p><strong>Sources.</strong> '+referencesHtml(a.sourceIds)+'</p><ul>'+a.sourceClaims.map(c=>'<li>'+esc(c.claim)+' ('+esc(c.sourceId)+')</li>').join('')+'</ul><p><strong>Interprétations.</strong></p><ul>'+a.interpretations.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul><p><strong>Chronologie.</strong> '+esc(a.chronology)+'</p><p class="small">Revue visuelle : '+esc(a.validation.visual)+' ; fidélité 1:1 : '+esc(a.validation.fidelity1to1)+'. Usage documentaire ; intégration en jeu inchangée.</p>'+a.validation.notes.map(t=>'<p class="small">'+esc(t)+'</p>').join('')+'</div></div><details class="details"><summary>Fichier, échelle et provenance de génération</summary><pre>'+esc(JSON.stringify({sha256:a.sha256,pixels:a.pixels,bytes:a.bytes,scale:a.scale,generation:a.generation,validation:a.validation},null,2))+'</pre></details></section>').join('');}
function recordHtml(r){const refs=referencesHtml(r.sourceIds);const images=r.assets.map(a=>'<figure><a href="../'+esc(a.file.split('/visual-v1/')[1])+'"><img loading="lazy" src="../'+esc(a.file.split('/visual-v1/')[1])+'" alt="'+esc(r.name+' — '+a.pose)+'"></a><figcaption>'+esc(a.id)+'<br>'+(a.pixels?a.pixels.width+' × '+a.pixels.height:'Dimensions globales non relues')+' ; '+esc(a.pose)+'<br>Ancre '+a.anchor.x+' / '+a.anchor.y+'</figcaption></figure>').join('');const attempts=r.generationAttempts?.length?'<div class="attempts"><p><strong>Tentatives sans nouvelle livraison</strong></p><ul>'+r.generationAttempts.map(a=>'<li>'+esc(a.date+' — '+a.note)+'</li>').join('')+'</ul></div>':'';return '<article class="card" id="'+esc(r.id)+'"><div class="record-header"><div><h3>'+esc(r.name)+'</h3><div class="id">'+esc(r.id)+'</div></div><span class="category">'+esc(bible.categories[r.category])+'</span></div><div class="status"><span>PNG runtime : '+esc(r.status.generation)+'</span><span>Production : '+esc(r.productionStatus.generation)+'</span><span>Intégration : '+esc(r.status.integration)+'</span><span>Visuel : '+esc(r.status.visualValidation)+'</span></div><div class="'+(images?'content-grid':'')+'"><div><p>'+esc(r.description)+'</p><p><strong>Apparence.</strong> '+esc(r.appearance)+'</p><p><strong>Jeu.</strong> '+esc(r.gameplay)+'</p><p><strong>Chronologie.</strong> '+esc(r.chronology)+'</p><p><strong>Localisation.</strong> '+esc(r.locations.map(id=>roomNames[id]||id).join(' ; ')||'Hors parcours ou scène à préciser.')+'</p><p class="references">Provenance : '+esc(r.provenance)+'<br>Sources : '+refs+'</p></div>'+(images?'<div class="images">'+images+'</div>':'')+'</div>'+productionHtml(r)+attempts+'<div class="missing"><h4>À compléter</h4><ul>'+r.missing.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></div><details class="details"><summary>Dimensions, placements et connexions</summary><pre>'+esc(JSON.stringify({dimensions:r.dimensions,placement:r.placement},null,2))+'</pre></details><details class="details"><summary>Critères de validation et provenance des images</summary><ul>'+r.acceptance.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul><pre>'+esc(JSON.stringify({status:r.status,assets:r.assets,productionStatus:r.productionStatus,productionAssets:r.productionAssets,generationAttempts:r.generationAttempts},null,2))+'</pre></details></article>';}
function coverageMatches(r){switch(coverage.value){case 'missing':return !r.assets.length;case 'png':return r.assets.length>0;case 'production':return r.productionAssets.length>0;case 'production-subject':return r.productionAssets.some(a=>a.relation==='subject');case 'dedicated-missing':return !r.assets.length&&!r.productionAssets.some(a=>a.relation==='subject');case 'none':return !r.assets.length&&!r.productionAssets.length;case 'absent':return r.status.integration==='absent';default:return true;}}
function render(reset){if(reset)page=0;const q=search.value.trim().toLocaleLowerCase('fr');filtered=bible.records.filter(r=>(!cat.value||r.category===cat.value)&&coverageMatches(r)&&(!q||JSON.stringify(r).toLocaleLowerCase('fr').includes(q)));const pages=Math.max(1,Math.ceil(filtered.length/pageSize));page=Math.min(page,pages-1);document.getElementById('records').innerHTML=filtered.slice(page*pageSize,(page+1)*pageSize).map(recordHtml).join('')||'<p>Aucune fiche ne correspond à ces filtres.</p>';document.getElementById('count').textContent=filtered.length+' fiche(s) sur '+bible.summary.records;document.getElementById('page').textContent='Page '+(page+1)+' / '+pages;document.getElementById('prev').disabled=page===0;document.getElementById('next').disabled=page>=pages-1;}
search.addEventListener('input',()=>render(true));cat.addEventListener('change',()=>render(true));coverage.addEventListener('change',()=>render(true));document.getElementById('prev').onclick=()=>{page--;render(false)};document.getElementById('next').onclick=()=>{page++;render(false)};render(true);
</script></body></html>`;
 return {bible,json:JSON.stringify(bible,null,2)+'\n',markdown:md.join('\n'),html};
}

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dlc='dlc/fleuve-de-la-douleur',visual=dlc+'/visual-v1',output=visual+'/bible';
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sha256=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const modelText=read(dlc+'/src/river-of-pain/data.js');
const data=JSON.parse(modelText.split('const data = ')[1].split(';\nif(typeof module')[0]);
const manifestText=read(visual+'/sprite-manifest.json'),manifest=JSON.parse(manifestText);
const notesText=read(output+'/EDITORIAL_NOTES.json'),notes=JSON.parse(notesText);
const productionText=read(output+'/PRODUCTION_ASSETS.json'),productionManifest=validateProductionManifest(JSON.parse(productionText));
const distribution=JSON.parse(read('scripts/river-of-pain-manifest.json'));
if(!distribution.visualSourceFiles.includes(output+'/PRODUCTION_ASSETS.json'))throw Error('Production registry is not admitted as a source file');
const admittedProduction=distribution.visualSourceFiles.filter(file=>file.startsWith(output+'/production/')).sort();
const declaredProduction=productionManifest.assets.map(a=>output+'/'+a.file).sort();
if(JSON.stringify(admittedProduction)!==JSON.stringify(declaredProduction))throw Error('Production PNG paths differ from exact source admission');
const publicPaths=new Set([...distribution.runtimeFiles,...distribution.visualAssets.map(a=>a.path)]);
if([output+'/PRODUCTION_ASSETS.json',...declaredProduction].some(file=>publicPaths.has(file)))throw Error('Production bible assets must stay outside the public runtime');
const context={module:{exports:{}}};
vm.runInNewContext(read(visual+'/sprite-loader.js'),context);
context.module.exports.validateManifest(manifest);
const envelopes=Object.fromEntries(Object.entries(context.module.exports.propLayouts).map(([id,e])=>[id,[e.left,e.right,e.top,e.bottom]]));
const assetMetadata={};
for(const asset of manifest.assets){
 const bytes=fs.readFileSync(path.join(root,visual,asset.file));
 if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Not PNG: '+asset.file);
 if(sha256(bytes)!==asset.sha256)throw Error('PNG hash mismatch: '+asset.file);
 assetMetadata[asset.id]={bytes:bytes.length,pixels:{width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)},validation:'file_sha256_and_png_dimensions_verified'};
}
const productionMetadata={};
for(const asset of productionManifest.assets){
 let file=root;
 for(const segment of (output+'/'+asset.file).split('/')){file=path.join(file,segment);if(fs.lstatSync(file).isSymbolicLink())throw Error('Symbolic link in production PNG path: '+asset.file);}
 if(!fs.statSync(file).isFile())throw Error('Production PNG is not a regular file: '+asset.file);
 const bytes=fs.readFileSync(file);
 if(bytes.length<33||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||bytes.subarray(12,16).toString()!=='IHDR')throw Error('Not PNG: '+asset.file);
 if(sha256(bytes)!==asset.sha256)throw Error('Production PNG hash mismatch: '+asset.file);
 productionMetadata[asset.id]={bytes:bytes.length,pixels:{width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)},validation:'file_sha256_and_png_dimensions_verified'};
}
const result=buildBible(data,manifest,notes,{assetMetadata,envelopes,productionManifest,productionMetadata,validationMode:'file_sha256_and_png_dimensions_verified',
 provenance:{rebuildMode:'local_png_bytes_verified',currentSourceHashes:{model:sha256(modelText),manifest:sha256(manifestText),notes:sha256(notesText),production:sha256(productionText)}}});
fs.mkdirSync(path.join(root,output),{recursive:true});
fs.writeFileSync(path.join(root,output,'BIBLE_FLEUVE_DOULEUR.json'),result.json);
fs.writeFileSync(path.join(root,output,'BIBLE_FLEUVE_DOULEUR.md'),result.markdown);
fs.writeFileSync(path.join(root,output,'BIBLE_FLEUVE_DOULEUR.html'),result.html);
console.log(JSON.stringify({output,...result.bible.summary},null,2));
