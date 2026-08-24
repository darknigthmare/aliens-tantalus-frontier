export const VEHICLE_VISUAL_FITS_V56 = Object.freeze([
  'Standard',
  'Recon',
  'Assault',
  'Rescue',
  'Colonial',
  'Frontier',
  'Prototype',
  'Apex'
]);

const makeProfile = ({
  key,
  baseNumber,
  catalogSlug,
  catalogName,
  family,
  sheetId,
  imageKey,
  filename,
  hitbox,
  renderWidth,
  renderHeight,
  referenceStatus = 'CANON_REFERENCE'
}) => Object.freeze({
  key,
  baseNumber,
  catalogSlug,
  catalogName,
  family,
  sheetId,
  imageKey,
  filename,
  rawPath: `/assets/openai/sprites/vehicles/${filename}`,
  path: `/assets/openai/sprites/normalized/vehicles/${filename}`,
  clipSet: 'vehicle-action-v56',
  pivot: 'vehicle-ground',
  hitbox,
  renderWidth,
  renderHeight,
  sourceFacing: 1,
  referenceStatus,
  clipRoles: Object.freeze({
    idle: 'idle',
    move: 'move',
    action: 'action',
    damage: 'damage'
  })
});

export const VEHICLE_VISUAL_PROFILES_V56 = Object.freeze({
  m40Ridgeway: makeProfile({
    key: 'm40Ridgeway',
    baseNumber: 5,
    catalogSlug: 'm40-ridgeway-tank',
    catalogName: 'M40 Ridgeway Heavy Tank',
    family: 'ground',
    sheetId: 'vehicle.m40-ridgeway-heavy-tank.action.v56',
    imageKey: 'm40RidgewayV56',
    filename: 'm40-ridgeway-heavy-tank-action-sheet.png',
    hitbox: 'm40-ridgeway-hull',
    renderWidth: 292,
    renderHeight: 150
  }),
  ud4bCheyenne: makeProfile({
    key: 'ud4bCheyenne',
    baseNumber: 10,
    catalogSlug: 'ud-4b-dropship',
    catalogName: 'UA Northridge UD-4B Cheyenne',
    family: 'air',
    sheetId: 'vehicle.ud4b-cheyenne-dropship.action.v56',
    imageKey: 'ud4bCheyenneV56',
    filename: 'ud-4b-cheyenne-dropship-action-sheet.png',
    hitbox: 'ud4b-dropship-hull',
    renderWidth: 300,
    renderHeight: 154
  }),
  narcissus: makeProfile({
    key: 'narcissus',
    baseNumber: 13,
    catalogSlug: 'uscss-nostromo-shuttle',
    catalogName: 'Narcissus - Nostromo Lifeboat',
    family: 'space',
    sheetId: 'vehicle.narcissus-lifeboat.action.v56',
    imageKey: 'narcissusV56',
    filename: 'narcissus-lifeboat-action-sheet.png',
    hitbox: 'narcissus-lifeboat-hull',
    renderWidth: 286,
    renderHeight: 130
  }),
  landerOne: makeProfile({
    key: 'landerOne',
    baseNumber: 14,
    catalogSlug: 'uscss-covenant-lander',
    catalogName: 'Lander One - Class E Lander-Type Drop Shuttle',
    family: 'air',
    sheetId: 'vehicle.lander-one-class-e.action.v56',
    imageKey: 'landerOneV56',
    filename: 'lander-one-class-e-action-sheet.png',
    hitbox: 'lander-one-hull',
    renderWidth: 300,
    renderHeight: 164
  }),
  rt01: makeProfile({
    key: 'rt01',
    baseNumber: 15,
    catalogSlug: 'uscss-prometheus-rover',
    catalogName: 'RT Series Group Transport / RT01',
    family: 'ground',
    sheetId: 'vehicle.rt01-group-transport.action.v56',
    imageKey: 'rt01V56',
    filename: 'rt01-group-transport-action-sheet.png',
    hitbox: 'rt01-transport-hull',
    renderWidth: 286,
    renderHeight: 142
  }),
  nr9Euv01: makeProfile({
    key: 'nr9Euv01',
    baseNumber: 16,
    catalogSlug: 'atv-survey-rover',
    catalogName: 'NR-9 Series All Terrain Vehicle / EUV01',
    family: 'ground',
    sheetId: 'vehicle.nr9-euv01-atv.action.v56',
    imageKey: 'nr9Euv01V56',
    filename: 'nr-9-euv01-atv-action-sheet.png',
    hitbox: 'nr9-euv01-hull',
    renderWidth: 250,
    renderHeight: 160
  }),
  daihotai: makeProfile({
    key: 'daihotai',
    baseNumber: 18,
    catalogSlug: 'acheron-colony-tractor',
    catalogName: 'Daihotai Tractor / Colony Tractor',
    family: 'ground',
    sheetId: 'vehicle.daihotai-tractor.action.v56',
    imageKey: 'daihotaiV56',
    filename: 'daihotai-tractor-action-sheet.png',
    hitbox: 'daihotai-tractor-hull',
    renderWidth: 270,
    renderHeight: 176
  }),
  eva7c: makeProfile({
    key: 'eva7c',
    baseNumber: 19,
    catalogSlug: 'submersible-survey-skiff',
    catalogName: 'Weyland EVA-7C Series Pressure Pod',
    family: 'submersible',
    sheetId: 'vehicle.eva7c-pressure-pod.action.v56',
    imageKey: 'eva7cV56',
    filename: 'eva-7c-pressure-pod-action-sheet.png',
    hitbox: 'eva7c-pressure-pod-hull',
    renderWidth: 240,
    renderHeight: 190
  }),
  combatPowerLoader: makeProfile({
    key: 'combatPowerLoader',
    baseNumber: 8,
    catalogSlug: 'combat-power-loader',
    catalogName: 'Combat Power Loader',
    family: 'exosuit',
    sheetId: 'vehicle.combat-power-loader.action.v56',
    imageKey: 'combatPowerLoaderV56',
    filename: 'combat-power-loader-action-sheet.png',
    hitbox: 'combat-power-loader-frame',
    renderWidth: 156,
    renderHeight: 194,
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  ua571Carrier: makeProfile({
    key: 'ua571Carrier',
    baseNumber: 12,
    catalogSlug: 'ua-571-remote-sentry-carrier',
    catalogName: 'UA-571 Remote Sentry Carrier',
    family: 'ground',
    sheetId: 'vehicle.ua571-remote-sentry-carrier.action.v56',
    imageKey: 'ua571CarrierV56',
    filename: 'ua-571-remote-sentry-carrier-action-sheet.png',
    hitbox: 'ua571-carrier-hull',
    renderWidth: 214,
    renderHeight: 128,
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  seegsonTram: makeProfile({
    key: 'seegsonTram',
    baseNumber: 17,
    catalogSlug: 'seegson-maintenance-tram',
    catalogName: 'Seegson Maintenance Tram',
    family: 'rail',
    sheetId: 'vehicle.seegson-maintenance-tram.action.v56',
    imageKey: 'seegsonTramV56',
    filename: 'seegson-maintenance-tram-action-sheet.png',
    hitbox: 'seegson-tram-hull',
    renderWidth: 268,
    renderHeight: 142,
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  crucibleCrawler: makeProfile({
    key: 'crucibleCrawler',
    baseNumber: 23,
    catalogSlug: 'crucible-caravan-crawler',
    catalogName: 'Crucible Caravan Crawler',
    family: 'ground',
    sheetId: 'vehicle.crucible-caravan-crawler.action.v56',
    imageKey: 'crucibleCrawlerV56',
    filename: 'crucible-caravan-crawler-action-sheet.png',
    hitbox: 'crucible-crawler-hull',
    renderWidth: 300,
    renderHeight: 160,
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  uscmAssaultGunship: makeProfile({
    key: 'uscmAssaultGunship',
    baseNumber: 25,
    catalogSlug: 'uscm-assault-gunship',
    catalogName: 'USCM Assault Gunship',
    family: 'air',
    sheetId: 'vehicle.uscm-assault-gunship.action.v56',
    imageKey: 'uscmAssaultGunshipV56',
    filename: 'uscm-assault-gunship-action-sheet.png',
    hitbox: 'assault-gunship-hull',
    renderWidth: 290,
    renderHeight: 146,
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  orbitalLifeboat: makeProfile({
    key: 'orbitalLifeboat',
    baseNumber: 26,
    catalogSlug: 'orbital-lifeboat',
    catalogName: 'Orbital Lifeboat',
    family: 'space',
    sheetId: 'vehicle.orbital-lifeboat.action.v56',
    imageKey: 'orbitalLifeboatV56',
    filename: 'orbital-lifeboat-action-sheet.png',
    hitbox: 'orbital-lifeboat-hull',
    renderWidth: 280,
    renderHeight: 136,
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  colonyCargoLifter: makeProfile({
    key: 'colonyCargoLifter',
    baseNumber: 27,
    catalogSlug: 'colony-cargo-lifter',
    catalogName: 'Colony Cargo Lifter',
    family: 'air',
    sheetId: 'vehicle.colony-cargo-lifter.action.v56',
    imageKey: 'colonyCargoLifterV56',
    filename: 'colony-cargo-lifter-action-sheet.png',
    hitbox: 'cargo-lifter-hull',
    renderWidth: 270,
    renderHeight: 142,
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  executiveShuttle: makeProfile({
    key: 'executiveShuttle',
    baseNumber: 28,
    catalogSlug: 'weyland-yutani-executive-shuttle',
    catalogName: 'Weyland-Yutani Executive Shuttle',
    family: 'space',
    sheetId: 'vehicle.weyland-yutani-executive-shuttle.action.v56',
    imageKey: 'executiveShuttleV56',
    filename: 'weyland-yutani-executive-shuttle-action-sheet.png',
    hitbox: 'executive-shuttle-hull',
    renderWidth: 286,
    renderHeight: 148,
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  uppCombatAerodyne: makeProfile({
    key: 'uppCombatAerodyne',
    baseNumber: 29,
    catalogSlug: 'upp-combat-aerodyne',
    catalogName: 'UPP Combat Aerodyne',
    family: 'air',
    sheetId: 'vehicle.upp-combat-aerodyne.action.v56',
    imageKey: 'uppCombatAerodyneV56',
    filename: 'upp-combat-aerodyne-action-sheet.png',
    hitbox: 'upp-aerodyne-hull',
    renderWidth: 286,
    renderHeight: 134,
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  hyperdyneCarrier: makeProfile({
    key: 'hyperdyneCarrier',
    baseNumber: 30,
    catalogSlug: 'hyperdyne-synthetic-carrier',
    catalogName: 'Hyperdyne Synthetic Carrier',
    family: 'ground',
    sheetId: 'vehicle.hyperdyne-synthetic-carrier.action.v56',
    imageKey: 'hyperdyneCarrierV56',
    filename: 'hyperdyne-synthetic-carrier-action-sheet.png',
    hitbox: 'hyperdyne-carrier-hull',
    renderWidth: 280,
    renderHeight: 130,
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  processorElevator: makeProfile({
    key: 'processorElevator',
    baseNumber: 32,
    catalogSlug: 'atmospheric-processor-elevator',
    catalogName: 'Atmospheric Processor Elevator',
    family: 'rail',
    sheetId: 'vehicle.atmospheric-processor-elevator.action.v56',
    imageKey: 'processorElevatorV56',
    filename: 'atmospheric-processor-elevator-action-sheet.png',
    hitbox: 'processor-elevator-cage',
    renderWidth: 190,
    renderHeight: 220,
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  maglevPersonnelCar: makeProfile({
    key: 'maglevPersonnelCar',
    baseNumber: 33,
    catalogSlug: 'maglev-personnel-car',
    catalogName: 'Maglev Personnel Car',
    family: 'rail',
    sheetId: 'vehicle.maglev-personnel-car.action.v56',
    imageKey: 'maglevPersonnelCarV56',
    filename: 'maglev-personnel-car-action-sheet.png',
    hitbox: 'maglev-car-hull',
    renderWidth: 288,
    renderHeight: 108,
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  ripperSiegeLoader: makeProfile({
    key: 'ripperSiegeLoader',
    baseNumber: 36,
    catalogSlug: 'ripper-siege-loader',
    catalogName: 'Ripper Siege Loader',
    family: 'exosuit',
    sheetId: 'vehicle.ripper-siege-loader.action.v56',
    imageKey: 'ripperSiegeLoaderV56',
    filename: 'ripper-siege-loader-action-sheet.png',
    hitbox: 'ripper-siege-loader-frame',
    renderWidth: 170,
    renderHeight: 200,
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  cetoPatrolBoat: makeProfile({
    key: 'cetoPatrolBoat',
    baseNumber: 20,
    catalogSlug: 'ceto-patrol-boat',
    catalogName: 'Ceto Patrol Boat',
    family: 'marine',
    sheetId: 'vehicle.ceto-patrol-boat.action.v56',
    imageKey: 'cetoPatrolBoatV56',
    filename: 'ceto-patrol-boat-action-sheet.png',
    hitbox: 'ceto-patrol-boat-hull',
    renderWidth: 300,
    renderHeight: 154,
    referenceStatus: 'PROJECT_ORIGINAL'
  }),
  tantalusCommandSkiff: makeProfile({
    key: 'tantalusCommandSkiff',
    baseNumber: 21,
    catalogSlug: 'tantalus-command-skiff',
    catalogName: 'Tantalus Command Skiff',
    family: 'hover',
    sheetId: 'vehicle.tantalus-command-skiff.action.v56',
    imageKey: 'tantalusCommandSkiffV56',
    filename: 'tantalus-command-skiff-action-sheet.png',
    hitbox: 'tantalus-command-skiff-hull',
    renderWidth: 286,
    renderHeight: 142,
    referenceStatus: 'PROJECT_ORIGINAL'
  }),
  echo9ReconBike: makeProfile({
    key: 'echo9ReconBike',
    baseNumber: 22,
    catalogSlug: 'echo-9-recon-bike',
    catalogName: 'Echo-9 Recon Bike',
    family: 'ground',
    sheetId: 'vehicle.echo-9-recon-bike.action.v56',
    imageKey: 'echo9ReconBikeV56',
    filename: 'echo-9-recon-bike-action-sheet.png',
    hitbox: 'echo9-recon-bike-frame',
    renderWidth: 224,
    renderHeight: 164,
    referenceStatus: 'PROJECT_ORIGINAL'
  }),
  neuroXenoTransportRig: makeProfile({
    key: 'neuroXenoTransportRig',
    baseNumber: 24,
    catalogSlug: 'neuro-xeno-transport-rig',
    catalogName: 'Neuro-Xeno Transport Rig',
    family: 'ground',
    sheetId: 'vehicle.neuro-xeno-transport-rig.action.v56',
    imageKey: 'neuroXenoTransportRigV56',
    filename: 'neuro-xeno-transport-rig-action-sheet.png',
    hitbox: 'neuro-xeno-transport-rig-hull',
    renderWidth: 270,
    renderHeight: 166,
    referenceStatus: 'PROJECT_ORIGINAL'
  }),
  miningBoreCrawler: makeProfile({
    key: 'miningBoreCrawler',
    baseNumber: 31,
    catalogSlug: 'mining-bore-crawler',
    catalogName: 'Mining Bore Crawler',
    family: 'ground',
    sheetId: 'vehicle.mining-bore-crawler.action.v56',
    imageKey: 'miningBoreCrawlerV56',
    filename: 'mining-bore-crawler-action-sheet.png',
    hitbox: 'mining-bore-crawler-hull',
    renderWidth: 294,
    renderHeight: 140,
    referenceStatus: 'PROJECT_ORIGINAL'
  }),
  iceDriller: makeProfile({
    key: 'iceDriller',
    baseNumber: 34,
    catalogSlug: 'ice-driller',
    catalogName: 'Ice Driller',
    family: 'ground',
    sheetId: 'vehicle.ice-driller.action.v56',
    imageKey: 'iceDrillerV56',
    filename: 'ice-driller-action-sheet.png',
    hitbox: 'ice-driller-hull',
    renderWidth: 288,
    renderHeight: 144,
    referenceStatus: 'PROJECT_ORIGINAL'
  }),
  reefHydrofoil: makeProfile({
    key: 'reefHydrofoil',
    baseNumber: 35,
    catalogSlug: 'reef-hydrofoil',
    catalogName: 'Reef Hydrofoil',
    family: 'marine',
    sheetId: 'vehicle.reef-hydrofoil.action.v56',
    imageKey: 'reefHydrofoilV56',
    filename: 'reef-hydrofoil-action-sheet.png',
    hitbox: 'reef-hydrofoil-hull',
    renderWidth: 286,
    renderHeight: 130,
    referenceStatus: 'PROJECT_ORIGINAL'
  })
});

export const VEHICLE_VISUAL_KEYS_V56 = Object.freeze(Object.keys(VEHICLE_VISUAL_PROFILES_V56));
export const VEHICLE_VISUAL_CHASSIS_COUNT_V56 = VEHICLE_VISUAL_KEYS_V56.length;

const slugFit = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-');
const descriptors = Object.values(VEHICLE_VISUAL_PROFILES_V56).flatMap((profile) =>
  VEHICLE_VISUAL_FITS_V56.map((fit, fitIndex) => {
    const catalogNumber = profile.baseNumber + fitIndex * 36;
    const fitSuffix = fitIndex === 0 ? '' : `-${slugFit(fit)}`;
    return Object.freeze({
      catalogId: `vehicle-${String(catalogNumber).padStart(3, '0')}-${profile.catalogSlug}${fitSuffix}`,
      catalogName: fitIndex === 0 ? profile.catalogName : `${profile.catalogName} - ${fit}`,
      fit,
      exact: fitIndex === 0,
      profile
    });
  })
);

export const VEHICLE_VISUAL_VARIANTS_V56 = Object.freeze(
  Object.fromEntries(descriptors.map((descriptor) => [descriptor.catalogId, descriptor]))
);
export const VEHICLE_VISUAL_PROFILE_COUNT_V56 = descriptors.length;

const descriptorByName = new Map(descriptors.map((descriptor) => [descriptor.catalogName, descriptor]));
const profileBySheetId = new Map(
  Object.values(VEHICLE_VISUAL_PROFILES_V56).map((profile) => [profile.sheetId, profile])
);

export function resolveVehicleVisualProfileV56(source = {}) {
  const id = typeof source?.id === 'string' ? source.id.trim() : '';
  const name = typeof source?.name === 'string' ? source.name.trim() : '';
  const directSheetId = typeof source?.sheetId === 'string' ? source.sheetId.trim() : '';
  const descriptor = id ? VEHICLE_VISUAL_VARIANTS_V56[id] : descriptorByName.get(name);
  const directProfile = profileBySheetId.get(directSheetId);
  const profile = descriptor?.profile || directProfile;
  if (!profile) return null;
  const exact = descriptor ? descriptor.exact : true;
  return Object.freeze({
    ...profile,
    catalogId: descriptor?.catalogId || id || null,
    resolvedCatalogName: descriptor?.catalogName || name || profile.catalogName,
    fit: descriptor?.fit || source.fit || 'Standard',
    identityStatus: exact ? (profile.referenceStatus === 'CANON_REFERENCE' ? 'exact' : profile.referenceStatus === 'PROJECT_ORIGINAL' ? 'project-original' : 'project-adaptation') : 'authored-family',
    identityVerified: exact,
    canonExact: exact && profile.referenceStatus === 'CANON_REFERENCE',
    approximate: !exact,
    fallbackReason: exact
      ? null
      : `The ${descriptor.fit} fit reuses the dedicated ${profile.catalogName} chassis; its fit-specific equipment is not drawn separately yet.`
  });
}

const finite = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

export function resolveVehicleVisualAnimationV56(source = {}) {
  const profile = resolveVehicleVisualProfileV56(source);
  if (!profile) return null;
  const requested = typeof source.visualClip === 'string' ? source.visualClip : source.clipId;
  if (Object.values(profile.clipRoles).includes(requested)) {
    return Object.freeze({
      sheetId: profile.sheetId,
      clipId: requested,
      visualKey: profile.key
    });
  }
  const damaged = source.destroyed === true
    || finite(source.v52HurtClock) > 0
    || finite(source.hurtClock) > 0
    || (finite(source.maxHull) > 0 && finite(source.hull) / finite(source.maxHull) < 0.28);
  const acting = source.firing === true
    || source.attacking === true
    || source.launching === true
    || source.sensorDeploying === true
    || finite(source.actionClock) > 0
    || finite(source.workClock) > 0
    || finite(source.v52TurretClock) > 0;
  const moving = source.moving === true || Math.abs(finite(source.vx)) > 8 || Math.abs(finite(source.vy)) > 8;
  const role = damaged ? 'damage' : acting ? 'action' : moving ? 'move' : 'idle';
  return Object.freeze({
    sheetId: profile.sheetId,
    clipId: profile.clipRoles[role],
    visualKey: profile.key
  });
}
