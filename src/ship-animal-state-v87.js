// These individuals are original Tantalus companions, not named canon animals.
export const SHIP_ANIMAL_CATALOG_REVISION_V87 = 3;
export const SHIP_ANIMAL_DEFINITIONS_V87 = Object.freeze({
  'animal-moka': Object.freeze({ id: 'animal-moka', name: 'Moka', familyId: 'cat-domestic',
    visualId: 'original-moka', nature: 'biological', habitatType: 'cat-berth', defaultHabitatId: 'moka-berth-v87',
    appearance: 'Chat roux adulte aux oreilles arrondies.',
    biography: 'A vécu près du comptoir d’un atelier de docking. Son foyer ferme après une réaffectation du personnel.',
    traits: Object.freeze(['sociable', 'observateur', 'casanier']) }),
  'animal-brume': Object.freeze({ id: 'animal-brume', name: 'Brume', familyId: 'dog-companion',
    visualId: 'original-brume', nature: 'biological', habitatType: 'dog-berth', defaultHabitatId: 'brume-berth-v87',
    appearance: 'Chienne grise de taille moyenne au museau clair.',
    biography: 'Habituée aux voyages courts sur une navette civile. Un transfert de propriété documenté permet son adoption.',
    traits: Object.freeze(['calme', 'prudente', 'sociable']) }),
  'animal-luciole': Object.freeze({ id: 'animal-luciole', name: 'Luciole', familyId: 'cat-domestic',
    visualId: 'original-luciole', nature: 'biological', habitatType: 'cat-berth', defaultHabitatId: 'luciole-berth-v87',
    appearance: 'Chatte blanche et rousse, queue touffue, silhouette compacte.',
    biography: 'Sa famille a demandé son placement après un départ vers une installation qui ne pouvait plus l’héberger.',
    traits: Object.freeze(['sociable', 'joueuse', 'prudente']),
    preferences: Object.freeze({ likes: 'Une balle légère', avoids: 'Les portes qui claquent' }) }),
  'animal-noisette': Object.freeze({ id: 'animal-noisette', name: 'Noisette', familyId: 'rabbit-domestic',
    visualId: 'original-noisette', nature: 'biological', habitatType: 'small-pen', defaultHabitatId: 'noisette-cafe-pen-v87',
    bondedGroupId: 'noisette-cafe', appearance: 'Lapin brun clair, oreilles droites.',
    biography: 'Premier membre d’un duo placé ensemble après l’évacuation d’un habitat civil.',
    traits: Object.freeze(['prudent', 'calme', 'sociable']),
    preferences: Object.freeze({ likes: 'Le parc partagé avec Café', avoids: 'La séparation de son partenaire' }) }),
  'animal-cafe': Object.freeze({ id: 'animal-cafe', name: 'Café', familyId: 'rabbit-domestic',
    visualId: 'original-cafe', nature: 'biological', habitatType: 'small-pen', defaultHabitatId: 'noisette-cafe-pen-v87',
    bondedGroupId: 'noisette-cafe', appearance: 'Lapin brun foncé, nez clair, silhouette différente de Noisette.',
    biography: 'Second membre du duo ; son dossier et ses états restent individuels malgré une offre groupée.',
    traits: Object.freeze(['curieux', 'calme', 'joueur']),
    preferences: Object.freeze({ likes: 'Le parc partagé avec Noisette', avoids: 'Le portage soudain' }) }),
  'animal-tic': Object.freeze({ id: 'animal-tic', name: 'Tic', familyId: 'rat-domestic',
    visualId: 'original-tic', nature: 'biological', habitatType: 'small-pen', defaultHabitatId: 'tic-tac-pen-v87',
    bondedGroupId: 'tic-tac', appearance: 'Rat domestique gris clair, oreilles rondes.',
    biography: 'Vit avec Tac dans un habitat civil sécurisé ; adoption groupée.',
    traits: Object.freeze(['curieux', 'sociable', 'prudent']),
    preferences: Object.freeze({ likes: 'Explorer son parc avec Tac', avoids: 'L’isolement forcé' }) }),
  'animal-tac': Object.freeze({ id: 'animal-tac', name: 'Tac', familyId: 'rat-domestic',
    visualId: 'original-tac', nature: 'biological', habitatType: 'small-pen', defaultHabitatId: 'tic-tac-pen-v87',
    bondedGroupId: 'tic-tac', appearance: 'Rat domestique brun et blanc, silhouette trapue.',
    biography: 'Compagnon de Tic, identité et familiarité propres.',
    traits: Object.freeze(['calme', 'sociable', 'observateur']),
    preferences: Object.freeze({ likes: 'Un refuge partagé', avoids: 'Les manipulations trop rapides' }) })
});
export const SHIP_ANIMAL_OFFERS_V87 = Object.freeze({
  'offer-animal-moka': Object.freeze({ id: 'offer-animal-moka', animalId: 'animal-moka', vendorId: 'station-shop', costCredits: 220 }),
  'offer-animal-brume': Object.freeze({ id: 'offer-animal-brume', animalId: 'animal-brume', vendorId: 'station-shop', costCredits: 300 }),
  'offer-animal-luciole': Object.freeze({ id: 'offer-animal-luciole', animalId: 'animal-luciole', vendorId: 'station-shop', costCredits: 220 }),
  'offer-noisette-cafe': Object.freeze({ id: 'offer-noisette-cafe', animalIds: Object.freeze(['animal-noisette', 'animal-cafe']),
    bondedGroupId: 'noisette-cafe', groupIndivisible: true, vendorId: 'colony-shelter', costCredits: 260 }),
  'offer-tic-tac': Object.freeze({ id: 'offer-tic-tac', animalIds: Object.freeze(['animal-tic', 'animal-tac']),
    bondedGroupId: 'tic-tac', groupIndivisible: true, vendorId: 'colony-shelter', costCredits: 240 })
});
export const SHIP_ANIMAL_LOCATION_KINDS_V87 = Object.freeze(['transit', 'intake', 'acclimating', 'resident', 'stasis', 'boarding']);
const own = (value, key) => Boolean(value && Object.hasOwn(value, key));
const record = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const clone = value => structuredClone(value);
const finite = value => typeof value === 'number' && Number.isFinite(value);
const nonnegative = value => finite(value) && value >= 0;
const integer = value => Number.isSafeInteger(value) && value >= 0;
const id = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9:._-]{0,95}$/.test(value)
  && !['constructor', 'prototype', '__proto__'].includes(value);
const placeKeys = ['hubId', 'roomId', 'deckId', 'x', 'y'];
const isPlace = value => record(value) && id(value.hubId) && id(value.roomId) && id(value.deckId)
  && finite(value.x) && finite(value.y) && Object.keys(value).every(key => placeKeys.includes(key));
const samePlace = (left, right) => placeKeys.every(key => left?.[key] === right?.[key]);
const asPlace = location => Object.fromEntries(placeKeys.map(key => [key, location[key]]));
const sameLocation = (left, right) => left?.kind === right?.kind && (left.kind === 'transit'
  ? left.edgeId === right.edgeId && left.progress === right.progress && samePlace(left.from, right.from) && samePlace(left.to, right.to)
  : samePlace(left, right) && left.containerId === right.containerId && left.facilityId === right.facilityId);
export function getShipAnimalOfferMembersV87(offerOrId) {
  const offer = typeof offerOrId === 'string' ? SHIP_ANIMAL_OFFERS_V87[offerOrId] : offerOrId;
  return offer?.animalIds ? [...offer.animalIds] : offer?.animalId ? [offer.animalId] : [];
}
const offerFor = animalId => Object.values(SHIP_ANIMAL_OFFERS_V87).find(offer => getShipAnimalOfferMembersV87(offer).includes(animalId));
const exactMembers = (value, expected) => Array.isArray(value) && value.length === expected.length && value.every((v, i) => v === expected[i]);
const memberFields = offer => offer.groupIndivisible ? { animalIds: getShipAnimalOfferMembersV87(offer) } : { animalId: offer.animalId };
const entryMembers = entry => Array.isArray(entry?.animalIds) ? entry.animalIds : [entry?.animalId];
const hasOfferMembers = (entry, offer) => offer.groupIndivisible
  ? entry.animalId === undefined && exactMembers(entry.animalIds, offer.animalIds)
  : entry.animalId === offer.animalId && entry.animalIds === undefined;
function coherentGroupLocations(locations) {
  const first = locations[0];
  return locations.every(location => location.kind === first.kind && (first.kind === 'transit'
    ? location.edgeId === first.edgeId && location.progress === first.progress && samePlace(location.from, first.from)
      && ['hubId', 'deckId', 'roomId'].every(key => location.to[key] === first.to[key])
    : ['hubId', 'deckId', 'roomId'].every(key => location[key] === first[key])));
}

/** Individual anchor in an enclosure, or the unchanged single-animal berth. */
export function getShipAnimalHabitatLocationV87(habitat, animalId) {
  if (!habitat) return null;
  const location = habitat.memberLocations?.[animalId];
  return location ? { ...habitat.location, ...location } : habitat.designatedGroupId ? null : clone(habitat.location);
}

export function isShipAnimalLocationValidV87(location) {
  if (!record(location) || !SHIP_ANIMAL_LOCATION_KINDS_V87.includes(location.kind)) return false;
  if (location.kind === 'transit') return id(location.edgeId) && isPlace(location.from) && isPlace(location.to)
    && !samePlace(location.from, location.to) && nonnegative(location.progress) && location.progress <= 1
    && Object.keys(location).every(key => ['kind', 'edgeId', 'from', 'to', 'progress'].includes(key));
  const extra = location.kind === 'stasis' ? 'containerId' : location.kind === 'boarding' ? 'facilityId' : null;
  return isPlace(asPlace(location)) && (!extra || id(location[extra]))
    && Object.keys(location).every(key => key === 'kind' || placeKeys.includes(key) || key === extra);
}

export function createEmptyShipAnimalStateV87() {
  return { schema: 1, catalogRevision: SHIP_ANIMAL_CATALOG_REVISION_V87, revision: 0, animals: {},
    stock: Object.fromEntries(Object.values(SHIP_ANIMAL_OFFERS_V87).map(offer =>
      [offer.id, { ...memberFields(offer), status: 'available' }])),
    reservations: {}, receipts: {}, transitions: {}, lastSimulationTime: 0, quarantined: [], diagnostics: [] };
}

function validAnimal(value, key) {
  const definition = own(SHIP_ANIMAL_DEFINITIONS_V87, key) && SHIP_ANIMAL_DEFINITIONS_V87[key];
  const offer = definition && offerFor(key);
  return definition && record(value) && value.id === key && value.familyId === definition.familyId
    && value.visualId === definition.visualId && value.nature === definition.nature
    && (!definition.bondedGroupId || value.bondedGroupId === definition.bondedGroupId)
    && typeof value.name === 'string' && value.name.trim().length > 0 && value.name.length <= 64
    && !/[\u0000-\u001f]/.test(value.name) && id(value.habitatId)
    && isShipAnimalLocationValidV87(value.location) && record(value.acquisition)
    && id(value.acquisition.transactionId) && value.acquisition.offerId === offer.id
    && value.acquisition.vendorId === offer.vendorId && integer(value.acquisition.costCredits)
    && nonnegative(value.acquisition.simulationTime) && integer(value.revision)
    && nonnegative(value.lastSimulationTime) && record(value.needs)
    && ['comfort', 'rest', 'satiety', 'social', 'health'].every(key => nonnegative(value.needs[key]) && value.needs[key] <= 100)
    && record(value.links) && Array.isArray(value.eventIds) && value.eventIds.every(id);
}
function validReceipt(value, key) {
  const offer = record(value) && own(SHIP_ANIMAL_OFFERS_V87, value.offerId) && SHIP_ANIMAL_OFFERS_V87[value.offerId];
  return id(key) && offer && value.transactionId === key && hasOfferMembers(value, offer)
    && id(value.habitatId) && integer(value.costCredits) && nonnegative(value.simulationTime) && integer(value.revision);
}
function validStock(value, key) {
  const offer = own(SHIP_ANIMAL_OFFERS_V87, key) && SHIP_ANIMAL_OFFERS_V87[key];
  return offer && record(value) && hasOfferMembers(value, offer)
    && ['available', 'sold', 'unavailable'].includes(value.status)
    && (value.status !== 'sold' || id(value.transactionId));
}
function validReservation(value, key) {
  return own(SHIP_ANIMAL_DEFINITIONS_V87, key) && record(value) && value.animalId === key
    && id(value.habitatId) && value.slots === 1;
}
function validTransition(value, key) {
  if (record(value) && value.animalIds !== undefined) {
    const offer = own(SHIP_ANIMAL_OFFERS_V87, value.offerId) && SHIP_ANIMAL_OFFERS_V87[value.offerId];
    return id(key) && offer?.groupIndivisible && value.transactionId === key && hasOfferMembers(value, offer)
      && SHIP_ANIMAL_LOCATION_KINDS_V87.includes(value.fromKind) && record(value.locationsByAnimalId)
      && exactMembers(Object.keys(value.locationsByAnimalId), offer.animalIds)
      && offer.animalIds.every(member => isShipAnimalLocationValidV87(value.locationsByAnimalId[member]))
      && coherentGroupLocations(offer.animalIds.map(member => value.locationsByAnimalId[member]))
      && nonnegative(value.simulationTime) && integer(value.revision);
  }
  return id(key) && record(value) && value.transactionId === key && own(SHIP_ANIMAL_DEFINITIONS_V87, value.animalId)
    && SHIP_ANIMAL_LOCATION_KINDS_V87.includes(value.fromKind) && isShipAnimalLocationValidV87(value.location)
    && nonnegative(value.simulationTime) && integer(value.revision);
}

/** Pure migration: no inferred ownership, no downgrade of a newer schema, no discarded bad records. */
export function migrateShipAnimalStateV87(raw) {
  if (raw === undefined || raw === null) return createEmptyShipAnimalStateV87();
  if (record(raw) && Number.isInteger(raw.schema) && raw.schema > 1) return clone(raw);
  const state = createEmptyShipAnimalStateV87();
  const quarantine = (path, code, original) => {
    if (!state.quarantined.some(entry => entry.path === path && entry.code === code)) {
      state.quarantined.push({ path, code, original: clone(original) });
      state.diagnostics.push({ path, code });
    }
  };
  if (!record(raw) || raw.schema !== 1) {
    quarantine('shipAnimalsV1', 'invalid-registry', raw);
    for (const stock of Object.values(state.stock)) stock.status = 'unavailable';
    return state;
  }
  // Unknown same-schema metadata is retained, never interpreted as another ownership list.
  for (const [key, value] of Object.entries(raw)) if (!own(state, key)) Object.defineProperty(state, key,
    { value: clone(value), writable: true, enumerable: true, configurable: true });
  if (Array.isArray(raw.quarantined) && raw.quarantined.every(entry => record(entry) && typeof entry.path === 'string' && typeof entry.code === 'string')) state.quarantined = clone(raw.quarantined);
  else if (raw.quarantined !== undefined) quarantine('quarantined', 'invalid-quarantine', raw.quarantined);
  if (Array.isArray(raw.diagnostics) && raw.diagnostics.every(entry => record(entry) && typeof entry.path === 'string' && typeof entry.code === 'string')) state.diagnostics.push(...clone(raw.diagnostics));
  else if (raw.diagnostics !== undefined) quarantine('diagnostics', 'invalid-diagnostics', raw.diagnostics);
  const catalogRevision = raw.catalogRevision === undefined ? 1 : raw.catalogRevision;
  if (!Number.isSafeInteger(catalogRevision) || catalogRevision < 1 || catalogRevision > SHIP_ANIMAL_CATALOG_REVISION_V87) {
    state.catalogRevision = clone(raw.catalogRevision);
    quarantine('catalogRevision', 'unsupported-catalog-revision', raw.catalogRevision);
  }
  for (const field of ['revision', 'lastSimulationTime']) {
    if ((field === 'revision' ? integer : nonnegative)(raw[field])) state[field] = raw[field];
    else quarantine(field, 'invalid-clock-or-revision', raw[field]);
  }
  const validators = { animals: validAnimal, stock: validStock, reservations: validReservation,
    receipts: validReceipt, transitions: validTransition };
  for (const [bucket, validate] of Object.entries(validators)) {
    state[bucket] = {};
    if (!record(raw[bucket])) { quarantine(bucket, 'invalid-bucket', raw[bucket]); continue; }
    for (const [key, value] of Object.entries(raw[bucket])) {
      if (validate(value, key)) state[bucket][key] = clone(value);
      else quarantine(`${bucket}.${key}`, 'invalid-entry', value);
    }
  }
  const remove = (bucket, key, code) => {
    quarantine(`${bucket}.${key}`, code, state[bucket][key]);
    delete state[bucket][key];
  };
  // Resolve all linked records now, so repeating migration produces the same result.
  let changed = true;
  while (changed) {
    changed = false;
    for (const [key, animal] of Object.entries(state.animals)) {
      const receipt = state.receipts[animal.acquisition.transactionId];
      const reservation = state.reservations[key];
      const stock = state.stock[animal.acquisition.offerId];
      const members = getShipAnimalOfferMembersV87(offerFor(key));
      const groupConsistent = members.every(member => {
        const partner = state.animals[member];
        return partner && partner.habitatId === animal.habitatId
          && partner.acquisition.transactionId === animal.acquisition.transactionId
          && coherentGroupLocations([animal.location, partner.location]);
      });
      if (!receipt || !entryMembers(receipt).includes(key) || !groupConsistent || receipt.habitatId !== animal.habitatId
        || receipt.costCredits !== animal.acquisition.costCredits || !reservation
        || reservation.habitatId !== animal.habitatId || stock?.status !== 'sold'
        || stock.transactionId !== animal.acquisition.transactionId) {
        remove('animals', key, 'inconsistent-acquisition'); changed = true;
      }
    }
    for (const bucket of ['receipts', 'reservations', 'transitions']) {
      for (const [key, entry] of Object.entries(state[bucket])) {
        if (entryMembers(entry).some(member => !state.animals[member]
          || (bucket === 'receipts' && state.animals[member].acquisition.transactionId !== key))) {
          remove(bucket, key, 'orphaned-record'); changed = true;
        }
      }
    }
    for (const [key, stock] of Object.entries(state.stock)) {
      if (stock.status === 'sold' && entryMembers(stock).some(member => !state.animals[member])) {
        remove('stock', key, 'orphaned-stock'); changed = true;
      }
    }
  }
  for (const offer of Object.values(SHIP_ANIMAL_OFFERS_V87)) if (!own(state.stock, offer.id)) {
    // Only genuinely new offers may be added by an older catalogue migration.
    // Existing missing stock, or any trace of a prior member, can never restock.
    const members = getShipAnimalOfferMembersV87(offer);
    const introduced = offer.groupIndivisible ? 3 : offer.id === 'offer-animal-luciole' ? 2 : 1;
    const priorMember = members.some(member => own(raw.animals, member) || own(raw.reservations, member))
      || ['receipts', 'transitions'].some(bucket => Object.values(record(raw[bucket]) ? raw[bucket] : {})
        .some(entry => entry?.offerId === offer.id || entryMembers(entry).some(member => members.includes(member))))
      || state.quarantined.some(entry => entry.path.includes(offer.id) || members.some(member => entry.path.includes(member)));
    if (Number.isSafeInteger(catalogRevision) && catalogRevision >= 1 && catalogRevision < introduced && record(raw.stock)
      && !own(raw.stock, offer.id) && !priorMember) {
      state.stock[offer.id] = { ...memberFields(offer), status: 'available' };
      continue;
    }
    if (!state.quarantined.some(entry => entry.path === `stock.${offer.id}`)) quarantine(`stock.${offer.id}`, 'missing-stock', undefined);
    state.stock[offer.id] = { ...memberFields(offer), status: 'unavailable' };
  }
  return state;
}

function failure(save, code, diagnostics = []) { return { ok: false, code, changed: false, save: clone(save), diagnostics: clone(diagnostics) }; }
function loadTransaction(save) {
  const state = migrateShipAnimalStateV87(save?.shipAnimalsV1);
  if (state.schema !== 1) return { error: 'unsupported-schema', state };
  if (state.quarantined.length) return { error: 'state-needs-review', state };
  return { state };
}
function accessAllowed(context, animal, from, to) {
  if (typeof context.canTransition !== 'function') return false;
  try { return context.canTransition({ animal: clone(animal), from: clone(from), to: clone(to) }) === true; }
  catch { return false; }
}

/** Prepare one complete transaction. The caller must durably commit result.save before publishing it. */
export function acquireShipAnimalV87(save, request = {}, context = {}) {
  if (!record(save) || !record(request) || !record(context) || !id(request.transactionId) || !own(SHIP_ANIMAL_OFFERS_V87, request.offerId)) return failure(save, 'invalid-request');
  const { state, error } = loadTransaction(save);
  if (error) return failure(save, error, state.diagnostics);
  const offer = SHIP_ANIMAL_OFFERS_V87[request.offerId];
  if (offer.groupIndivisible) return acquireGroup(save, request, context, state, offer);
  const definition = SHIP_ANIMAL_DEFINITIONS_V87[offer.animalId];
  if (own(state.transitions, request.transactionId)) return failure(save, 'transaction-conflict');
  if (own(state.receipts, request.transactionId)) {
    const receipt = state.receipts[request.transactionId];
    if (receipt.offerId !== offer.id || receipt.habitatId !== request.habitatId) return failure(save, 'transaction-conflict');
    return { ok: true, code: 'already-applied', changed: false, save: clone(save), receipt: clone(receipt), animal: clone(state.animals[offer.animalId]) };
  }
  if (own(state.animals, offer.animalId)) return failure(save, 'already-owned');
  if (state.stock[offer.id]?.status !== 'available') return failure(save, 'sold-or-unavailable');
  if (context.vendorAccessible !== true) return failure(save, 'vendor-inaccessible');
  if (!Array.isArray(context.artReadyIds) || !context.artReadyIds.includes(offer.animalId)) return failure(save, 'art-not-ready');
  const habitats = Array.isArray(context.habitats) ? context.habitats : [];
  const habitat = habitats.find(candidate => candidate?.id === request.habitatId);
  if (!habitat || habitat.installed !== true || habitat.type !== definition.habitatType
    || (habitat.designatedAnimalId !== undefined && habitat.designatedAnimalId !== definition.id)
    || !id(habitat.id) || !integer(habitat.capacity) || !isPlace(habitat.location)) return failure(save, 'habitat-unavailable');
  const reserved = Object.values(state.reservations);
  if (reserved.filter(entry => entry.habitatId === habitat.id).length >= habitat.capacity) return failure(save, 'habitat-full');
  if (context.care?.available !== true || !integer(context.care.capacity) || reserved.length >= Math.min(8, context.care.capacity)) return failure(save, 'care-unavailable');
  const credits = save.galaxy?.resources?.credits;
  if (!integer(credits) || credits < offer.costCredits) return failure(save, 'insufficient-credits');
  const simulationTime = context.simulationTime ?? 0;
  if (!nonnegative(simulationTime) || simulationTime < state.lastSimulationTime) return failure(save, 'invalid-simulation-time');
  const location = { ...clone(context.transit || {}), kind: 'transit', progress: 0 };
  if (!isShipAnimalLocationValidV87(location) || !samePlace(location.to, habitat.location)) return failure(save, 'invalid-transit');
  const revision = state.revision + 1;
  if (!integer(revision)) return failure(save, 'invalid-revision');
  const receipt = { transactionId: request.transactionId, offerId: offer.id, animalId: offer.animalId,
    habitatId: habitat.id, costCredits: offer.costCredits, simulationTime, revision };
  const animal = { id: definition.id, name: definition.name, familyId: definition.familyId,
    visualId: definition.visualId, nature: definition.nature, provenance: 'original-tantalus',
    habitatId: habitat.id, location, acquisition: { transactionId: request.transactionId, offerId: offer.id,
      vendorId: offer.vendorId, costCredits: offer.costCredits, simulationTime },
    activity: 'transport', needs: { comfort: 100, rest: 100, satiety: 100, social: 75, health: 100 },
    links: {}, preferences: {}, eventIds: [], personalObjectId: null, revision: 1, lastSimulationTime: simulationTime };
  state.animals[animal.id] = animal;
  state.stock[offer.id] = { status: 'sold', animalId: animal.id, transactionId: request.transactionId };
  state.reservations[animal.id] = { animalId: animal.id, habitatId: habitat.id, slots: 1 };
  state.receipts[request.transactionId] = receipt;
  state.revision = revision;
  state.lastSimulationTime = simulationTime;
  const candidate = clone(save);
  candidate.galaxy.resources.credits -= offer.costCredits;
  candidate.shipAnimalsV1 = state;
  return { ok: true, code: 'acquired', changed: true, save: candidate, animal: clone(animal), receipt: clone(receipt) };
}

/** One indivisible purchase: all prerequisites precede every candidate mutation. */
function acquireGroup(save, request, context, state, offer) {
  const members = getShipAnimalOfferMembersV87(offer);
  if (own(state.transitions, request.transactionId)) return failure(save, 'transaction-conflict');
  if (own(state.receipts, request.transactionId)) {
    const receipt = state.receipts[request.transactionId];
    if (receipt.offerId !== offer.id || receipt.habitatId !== request.habitatId) return failure(save, 'transaction-conflict');
    return { ok: true, code: 'already-applied', changed: false, save: clone(save), receipt: clone(receipt),
      animals: members.map(member => clone(state.animals[member])) };
  }
  if (members.some(member => own(state.animals, member))) return failure(save, 'already-owned');
  if (state.stock[offer.id]?.status !== 'available') return failure(save, 'sold-or-unavailable');
  if (context.vendorAccessible !== true || context.vendorId !== offer.vendorId) return failure(save, 'vendor-inaccessible');
  if (!Array.isArray(context.artReadyIds) || !members.every(member => context.artReadyIds.includes(member))) return failure(save, 'art-not-ready');
  const habitat = Array.isArray(context.habitats) && context.habitats.find(h => h?.id === request.habitatId);
  if (!habitat || habitat.installed !== true || habitat.type !== 'small-pen'
    || habitat.designatedGroupId !== offer.bondedGroupId || habitat.navigationDomain !== 'enclosure-volume'
    || !members.every(member => SHIP_ANIMAL_DEFINITIONS_V87[member].defaultHabitatId === habitat.id)
    || !integer(habitat.capacity) || habitat.capacity > 2 || !isPlace(habitat.location)
    || !Array.isArray(habitat.compatibleFamilyIds)
    || !members.every(member => habitat.compatibleFamilyIds.includes(SHIP_ANIMAL_DEFINITIONS_V87[member].familyId)))
    return failure(save, 'habitat-unavailable');
  const bounds = habitat.enclosureBounds;
  const places = Object.fromEntries(members.map(member => [member, getShipAnimalHabitatLocationV87(habitat, member)]));
  if (!record(bounds) || !['x', 'y', 'w', 'h'].every(key => finite(bounds[key])) || bounds.w <= 0 || bounds.h <= 0
    || members.some(member => !isPlace(places[member])
      || ['hubId', 'deckId', 'roomId'].some(key => places[member][key] !== habitat.location[key])
      || places[member].x <= bounds.x || places[member].x >= bounds.x + bounds.w
      || places[member].y < bounds.y || places[member].y > bounds.y + bounds.h)
    || samePlace(places[members[0]], places[members[1]])) return failure(save, 'habitat-unavailable');
  const reserved = Object.values(state.reservations);
  if (reserved.filter(entry => entry.habitatId === habitat.id).length + members.length > habitat.capacity)
    return failure(save, 'habitat-full');
  if (context.care?.available !== true || !integer(context.care.capacity)
    || reserved.length + members.length > Math.min(8, context.care.capacity)) return failure(save, 'care-unavailable');
  if (!integer(save.galaxy?.resources?.credits) || save.galaxy.resources.credits < offer.costCredits)
    return failure(save, 'insufficient-credits');
  const time = context.simulationTime ?? 0;
  if (!nonnegative(time) || time < state.lastSimulationTime) return failure(save, 'invalid-simulation-time');
  const transit = { ...clone(context.transit || {}), kind: 'transit', progress: 0 };
  if (!isShipAnimalLocationValidV87(transit) || !samePlace(transit.to, habitat.location)) return failure(save, 'invalid-transit');
  const revision = state.revision + 1;
  if (!integer(revision)) return failure(save, 'invalid-revision');
  const receipt = { transactionId: request.transactionId, offerId: offer.id, ...memberFields(offer),
    habitatId: habitat.id, costCredits: offer.costCredits, simulationTime: time, revision };
  for (const member of members) {
    const definition = SHIP_ANIMAL_DEFINITIONS_V87[member];
    const animal = { id: member, name: definition.name, familyId: definition.familyId,
      visualId: definition.visualId, nature: definition.nature, provenance: 'original-tantalus',
      bondedGroupId: offer.bondedGroupId, habitatId: habitat.id, location: { ...clone(transit), to: places[member] },
      // This is contract provenance, never an additional individual debit. Only the receipt is an accounting entry.
      acquisition: { transactionId: request.transactionId, offerId: offer.id, vendorId: offer.vendorId,
        costCredits: offer.costCredits, simulationTime: time },
      activity: 'transport', needs: { comfort: 100, rest: 100, satiety: 100, social: 75, health: 100 },
      links: {}, preferences: clone(definition.preferences), eventIds: [], personalObjectId: null, revision: 1, lastSimulationTime: time };
    state.animals[member] = animal;
    state.reservations[member] = { animalId: member, habitatId: habitat.id, slots: 1 };
  }
  state.stock[offer.id] = { status: 'sold', ...memberFields(offer), transactionId: request.transactionId };
  state.receipts[request.transactionId] = receipt; state.revision = revision; state.lastSimulationTime = time;
  const candidate = clone(save); candidate.galaxy.resources.credits -= offer.costCredits; candidate.shipAnimalsV1 = state;
  return { ok: true, code: 'acquired', changed: true, save: candidate,
    animals: members.map(member => clone(state.animals[member])), receipt: clone(receipt) };
}

function phaseAllowed(animal, next, context) {
  const previous = animal.location;
  if (previous.kind === 'transit') {
    if (next.kind === 'transit') return previous.edgeId === next.edgeId && samePlace(previous.from, next.from)
      && samePlace(previous.to, next.to) && next.progress >= previous.progress;
    return next.kind === 'intake' && previous.progress === 1 && context.transportComplete === true
      && samePlace(previous.to, next);
  }
  if (previous.kind === 'intake') return next.kind === 'acclimating' && context.arrivalCheckPassed === true && samePlace(previous, next);
  if (previous.kind === 'acclimating') return next.kind === 'resident' && context.acclimationComplete === true && samePlace(previous, next);
  if (previous.kind === 'boarding') return next.kind === 'transit' && context.transferAuthorized === true
    && samePlace(previous, next.from) && next.progress === 0;
  if (previous.kind === 'stasis') return next.kind === 'intake' && context.transferAuthorized === true && samePlace(previous, next);
  if (previous.kind === 'resident') {
    if (next.kind === 'resident') return true;
    if (next.kind === 'transit') return context.transferAuthorized === true && samePlace(previous, next.from) && next.progress === 0;
    return ['stasis', 'boarding'].includes(next.kind) && context.transferAuthorized === true
      && context.physicalArrivalConfirmed === true && samePlace(previous, next);
  }
  return false;
}

/** Explicit persisted progress only; drawing, wall-clock absence and loading cannot finish a stage. */
export function transitionShipAnimalV87(save, request = {}, context = {}) {
  if (!record(save) || !record(request) || !record(context) || !id(request.transactionId) || !own(SHIP_ANIMAL_DEFINITIONS_V87, request.animalId)
    || !isShipAnimalLocationValidV87(request.location)) return failure(save, 'invalid-request');
  const { state, error } = loadTransaction(save);
  if (error) return failure(save, error, state.diagnostics);
  if (own(state.receipts, request.transactionId)) return failure(save, 'transaction-conflict');
  if (own(state.transitions, request.transactionId)) {
    const receipt = state.transitions[request.transactionId];
    if (receipt.animalId !== request.animalId || !sameLocation(receipt.location, request.location)) return failure(save, 'transaction-conflict');
    return { ok: true, code: 'already-applied', changed: false, save: clone(save), receipt: clone(receipt), animal: clone(state.animals[request.animalId]) };
  }
  const animal = state.animals[request.animalId];
  if (!animal) return failure(save, 'animal-not-owned');
  // Enclosure routines move individual residents inside their validated sub-volume.
  // The public logistics API must never publish one half of a bonded transition.
  if (animal.bondedGroupId) return failure(save, 'group-transition-required');
  if (!integer(state.revision + 1) || !integer(animal.revision + 1)) return failure(save, 'invalid-revision');
  const simulationTime = context.simulationTime ?? state.lastSimulationTime;
  if (!nonnegative(simulationTime) || simulationTime < state.lastSimulationTime) return failure(save, 'invalid-simulation-time');
  if (!phaseAllowed(animal, request.location, context)) return failure(save, 'invalid-phase');
  if (!accessAllowed(context, animal, animal.location, request.location)) return failure(save, 'access-denied');
  const receipt = { transactionId: request.transactionId, animalId: animal.id, fromKind: animal.location.kind,
    location: clone(request.location), simulationTime, revision: state.revision + 1 };
  animal.location = clone(request.location);
  animal.activity = request.location.kind === 'resident' ? 'rest' : request.location.kind;
  animal.revision += 1;
  animal.lastSimulationTime = simulationTime;
  state.transitions[request.transactionId] = receipt;
  state.revision += 1;
  state.lastSimulationTime = simulationTime;
  const candidate = clone(save);
  candidate.shipAnimalsV1 = state;
  return { ok: true, code: 'transitioned', changed: true, save: candidate, receipt: clone(receipt), animal: clone(animal) };
}

/** All members change logistics stage together; there is no caller bypass for a partial pair. */
export function transitionShipAnimalGroupV87(save, request = {}, context = {}) {
  const offer = record(request) && own(SHIP_ANIMAL_OFFERS_V87, request.offerId) && SHIP_ANIMAL_OFFERS_V87[request.offerId];
  if (!record(save) || !record(context) || !offer?.groupIndivisible || !id(request.transactionId)
    || !record(request.locationsByAnimalId)) return failure(save, 'invalid-request');
  const members = getShipAnimalOfferMembersV87(offer);
  const locations = request.locationsByAnimalId;
  if (Object.keys(locations).length !== members.length || members.some(member => !own(locations, member)
    || !isShipAnimalLocationValidV87(locations[member]))) return failure(save, 'invalid-request');
  if (!coherentGroupLocations(members.map(member => locations[member]))) return failure(save, 'group-transition-required');
  const { state, error } = loadTransaction(save);
  if (error) return failure(save, error, state.diagnostics);
  if (own(state.receipts, request.transactionId)) return failure(save, 'transaction-conflict');
  if (own(state.transitions, request.transactionId)) {
    const receipt = state.transitions[request.transactionId];
    if (receipt.offerId !== offer.id || !members.every(member => sameLocation(receipt.locationsByAnimalId?.[member], locations[member])))
      return failure(save, 'transaction-conflict');
    return { ok: true, code: 'already-applied', changed: false, save: clone(save), receipt: clone(receipt),
      animals: members.map(member => clone(state.animals[member])) };
  }
  if (members.some(member => !own(state.animals, member))) return failure(save, 'animal-not-owned');
  const animals = members.map(member => state.animals[member]);
  // A permissive access callback is not a navigation certificate. A resident's
  // coordinates may only change through the enclosure routine, not this API.
  if (animals.some(animal => animal.location.kind === 'resident' && locations[animal.id].kind === 'resident'
    && !samePlace(animal.location, locations[animal.id]))) return failure(save, 'enclosure-routine-required');
  const time = context.simulationTime ?? state.lastSimulationTime;
  if (!nonnegative(time) || time < state.lastSimulationTime) return failure(save, 'invalid-simulation-time');
  if (!integer(state.revision + 1) || animals.some(animal => !integer(animal.revision + 1))) return failure(save, 'invalid-revision');
  if (animals.some(animal => !phaseAllowed(animal, locations[animal.id], context))) return failure(save, 'invalid-phase');
  if (animals.some(animal => !accessAllowed(context, animal, animal.location, locations[animal.id]))) return failure(save, 'access-denied');
  const receipt = { transactionId: request.transactionId, offerId: offer.id, ...memberFields(offer),
    fromKind: animals[0].location.kind,
    locationsByAnimalId: Object.fromEntries(members.map(member => [member, clone(locations[member])])), simulationTime: time, revision: state.revision + 1 };
  for (const animal of animals) {
    animal.location = clone(locations[animal.id]); animal.activity = animal.location.kind === 'resident' ? 'rest' : animal.location.kind;
    animal.revision += 1; animal.lastSimulationTime = time;
  }
  state.transitions[request.transactionId] = receipt; state.revision += 1; state.lastSimulationTime = time;
  const candidate = clone(save); candidate.shipAnimalsV1 = state;
  return { ok: true, code: 'transitioned', changed: true, save: candidate, receipt: clone(receipt), animals: clone(animals) };
}
