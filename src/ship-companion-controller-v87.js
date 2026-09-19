import { SHIP_PORT_DEFINITION_V87 as PORT, requestShipPortDockV87, requestShipPortUndockV87,
  abortShipPortDockV87, stepShipPortV87, canAccessPortCounterV87, getShipPortSafetyCodeV87 } from './ship-port-state-v87.js';
import { SHIP_PORT_ANNEX_V87, SHIP_PORT_MEETINGS_V87, SHIP_PORT_VENDORS_V87, getShipPortInteractionV87 } from './ship-port-room-v87.js';
import { SHIP_ANIMAL_DEFINITIONS_V87, SHIP_ANIMAL_OFFERS_V87, acquireShipAnimalV87, getShipAnimalOfferMembersV87 } from './ship-animal-state-v87.js';
import { getShipAnimalHabitatsV87, getShipAnimalRoomInteractionV87 } from './ship-animal-habitat-v87.js';
import { SHIP_ANIMAL_ATLASES_V87, isShipAnimalAtlasReadyV87, drawShipAnimalV87 } from './ship-animal-art-v87.js';
import { stepShipAnimalRoutinesV87, sampleShipAnimalRoutinesV87,
  petShipAnimalV87, observeShipAnimalEnclosureV87 } from './ship-animal-routines-v87.js';
import { drawShipAnimalEnclosuresV87, drawShipBondedCarrierV87, isShipAnimalEnclosureAtlasReadyV87 } from './ship-animal-enclosure-art-v87.js';
import { drawShipAnimalTerrariumV87, drawShipMicaCarrierV87, isShipAnimalTerrariumAtlasReadyV87 } from './ship-animal-terrarium-art-v87.js';
import { createShipAnimalHabitatGraphV87 } from './ship-animal-habitat-graph-v87.js';
import { initializeShipAnimalDeliveryV87, pickupShipAnimalDeliveryV87, stepShipAnimalDeliveryV87,
  receiveShipAnimalDeliveryV87, sampleShipAnimalDeliveriesV87, dropShipAnimalDeliveryV87 } from './ship-animal-delivery-v87.js';
import { ShipPortUiV87 } from './ship-port-ui-v87.js';
import { drawPortPropV87 } from './ship-port-art-v87.js';
import { sampleShipCarrierPresentationV87 } from './ship-carrier-presentation-v87.js';
import { HUB_DECKS } from './hub-game.js';

const clone = value => structuredClone(value);
const id = prefix => prefix + ':' + crypto.randomUUID();
const movingPort = save => ['approach', 'docking', 'undocking'].includes(save.shipPortV1?.phase);
const ready = image => image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
/** Render-only interpolation between validated poses, never ownership or travel. */
export function sampleCompanionPresentationV87(actor, previous, remainder = 0, { paused = false, reducedMotion = false } = {}) {
  const dt = Number.isFinite(remainder) ? Math.max(0, Math.min(.2, remainder)) : 0;
  const result = { ...actor, elapsed: reducedMotion ? 0 : actor.elapsed + (paused ? 0 : dt) };
  if (paused || reducedMotion || !previous || !['animalId', 'roomId', 'deckId', 'clipId', 'facing'].every(key => previous[key] === actor[key])
    || ![previous.x, previous.y, actor.x, actor.y].every(Number.isFinite)
    || Math.abs(previous.x - actor.x) > 32 || Math.abs(previous.y - actor.y) > 32) return result;
  const alpha = dt / .2;
  result.x = previous.x + (actor.x - previous.x) * alpha;
  result.y = previous.y + (actor.y - previous.y) * alpha;
  return result;
}
const textFor = code => ({
  'insufficient-credits': 'Crédits insuffisants.', 'habitat-unavailable': 'Équipez le logement compatible dans l’accueil animalier.',
  'care-unavailable': 'Les moyens de soin ne sont pas disponibles.', 'vendor-inaccessible': 'Le comptoir est inaccessible.',
  'animal-busy': 'Laissez-lui finir son activité.', 'pet-cooldown': 'Laissez-lui un moment avant une nouvelle caresse.',
  'manifest-transfer-incomplete': 'Terminez l’arrivée du compagnon avant le largage.',
  'infestation-active': 'Confinement biologique : accès civil suspendu.', 'crisis-active': 'Crise à bord : rendez-vous suspendu.'
}[code] || `Action indisponible : ${code}.`);

/** One active hub owner; all ownership/state changes are committed before rendering. */
export class ShipCompanionControllerV87 {
  constructor({ hub, saveSystem, isActive, toast, documentRef = document }) {
    Object.assign(this, { hub, saveSystem, isActive, toast, documentRef });
    this.tickRemainder = 0; this.graph = null; this.ownerStamp = null; this.lastFailure = null;
    this.previousActors = [];
    this.carriedPresentationV87 = null; this.carryFrameDeltaV87 = 0;
    this.images = new Map(Object.entries(SHIP_ANIMAL_ATLASES_V87).map(([animalId, atlas]) => {
      const image = new Image(); image.src = atlas.path; return [animalId, image];
    }));
    this.ui = new ShipPortUiV87({ documentRef, getModel: () => this.model(),
      onAction: action => this.uiAction(action), onClose: () => {
        if (this.isActive()) { this.hub.resume(); this.hub.canvas?.focus?.({ preventScroll: true }); }
      } });
    hub.onCompanionTickV87 = delta => this.tick(delta);
    hub.drawCompanionsV87 = ctx => this.draw(ctx);
    hub.drawCarriedCompanionV87 = ctx => this.drawCarried(ctx);
    hub.getCompanionInteractionV87 = () => this.interaction();
  }

  stamp() { const save = this.saveSystem.data; return `${this.saveSystem.profile}:${save.createdAt}:${save.onboardingV84?.identity?.id || ''}`; }
  close() { this.ui.close({ notify: false }); this.tickRemainder = 0; this.previousActors = [];
    this.carriedPresentationV87 = null; this.carryFrameDeltaV87 = 0; }
  player() {
    const { hub } = this, p = hub.player;
    return p ? { alive: p.alive, hubId: hub.currentAnnexV71?.()?.id === PORT.counterRoomId ? PORT.id : 'tantalus', roomId: hub.currentAnnexV71?.()?.id || hub.currentRoom?.()?.id,
      deckId: HUB_DECKS[hub.state?.deck]?.id, x: p.x + p.w / 2, y: p.y + p.h } : null;
  }
  context() { return { careReady: true, manifestReady: true, physical: this.player(), paused: false, dialogueOpen: false }; }
  safe() { return !getShipPortSafetyCodeV87(this.saveSystem.data, this.context()); }
  sync() {
    const context = this.hub.npcRoutineContextV62;
    if (context?.save) { context.save.shipAnimalsV1 = clone(this.saveSystem.data.shipAnimalsV1);
      context.save.shipPortV1 = clone(this.saveSystem.data.shipPortV1); }
    this.hub.statusKey = '';
  }
  commit(result) {
    if (!this.isActive() || this.ownerStamp !== this.stamp()) return false;
    if (!result?.ok) { this.toast(textFor(result?.code || 'invalid-action')); return false; }
    if (!result.changed) return true;
    const p = this.hub.player, current = this.saveSystem.data;
    const commercialV71 = { ...clone(this.hub.hubCommercialStateV71) };
    if (this.hub.currentAnnexV71?.()) Object.assign(commercialV71,
      { annexPositionX: Math.round(p.x), annexPositionY: Math.round(p.y), annexClimbing: Boolean(p.climbing) });
    try {
      const pose = this.player();
      const previousActors = sampleShipAnimalRoutinesV87(current, { roomId: pose?.roomId, deckId: pose?.deckId, graph: this.graph });
      this.saveSystem.commit({ shipAnimalsV1: result.save.shipAnimalsV1 ?? current.shipAnimalsV1,
        shipPortV1: result.save.shipPortV1 ?? current.shipPortV1,
        galaxy: result.save.galaxy ?? current.galaxy,
        hub: { ...clone(current.hub), deck: this.hub.state.deck,
          positionX: this.hub.currentAnnexV71?.() ? current.hub.positionX : Math.round(p.x),
          roomId: this.hub.state.roomId, commercialV71 } });
      this.previousActors = previousActors;
      this.sync(); this.lastFailure = null; return true;
    } catch (error) {
      if (this.lastFailure !== error.message) this.toast('Enregistrement refusé : ' + error.message);
      this.lastFailure = error.message; this.hub.stop(false); return false;
    }
  }

  refreshGraph() {
    // Rebuild from the authoritative Habitat geometry, even when loading on
    // another deck; never reuse Engineering collisions for resident routines.
    this.graph = createShipAnimalHabitatGraphV87({
      doorStates: this.hub.state?.deck === 1 ? this.hub.doorStates : this.graph?.doors,
      annexDoor: { progress: this.hub.annexTransitionV71?.annexId === 'animal-care' ? this.hub.annexTransitionV71.progress : 0 }
    });
    return this.graph;
  }

  model() {
    const save = this.saveSystem.data, state = save.shipPortV1;
    const habitats = getShipAnimalHabitatsV87(save);
    const physical = getShipPortInteractionV87(this.hub);
    const vendorId = physical?.vendorId || 'station-shop';
    const atShop = this.player()?.roomId === PORT.counterRoomId && physical?.action === 'ship-port:shop';
    const art = this.hub.getAnnexAssetGroupV71(PORT.counterRoomId);
    const shopReady = ['far', 'prop', 'door', 'vendor'].every(role => ready(art?.get(role)));
    return { phase: state?.phase || 'undocked', progress: state?.durationSeconds ? state.elapsedSeconds / state.durationSeconds : 0,
      vendorId, vendorName: SHIP_PORT_VENDORS_V87[vendorId]?.name,
      canDock: ['undocked', 'departed'].includes(state?.phase) && this.safe(),
      canUndock: state?.phase === 'docked' && this.player()?.roomId === 'dropship-hangar',
      // Maneuver progress is not a pending transaction: abort must stay usable.
      // Actions commit synchronously; the dialog owns its submitting/double-click lock.
      busy: false, reducedMotion: save.settings?.reducedMotion === true,
      message: this.ui?.mode === 'shop' ? 'Rencontrez un compagnon, consultez son dossier et vérifiez son logement avant de signer.' : PORT.costLabel + ' ' + PORT.timingLabel,
      offers: Object.values(SHIP_ANIMAL_OFFERS_V87).filter(offer => offer.vendorId === vendorId).map(offer => {
        const animalIds = getShipAnimalOfferMembersV87(offer);
        const members = animalIds.map(id => SHIP_ANIMAL_DEFINITIONS_V87[id]);
        const definition = members[0];
        const habitat = habitats.find(entry => entry.id === definition.defaultHabitatId);
        const owned = animalIds.some(id => Boolean(save.shipAnimalsV1?.animals?.[id]));
        const conditions = [];
        if (!atShop || !canAccessPortCounterV87(save) || !this.safe()) conditions.push('Comptoir physique inaccessible ou accès civil suspendu.');
        if (!habitat?.installed) conditions.push('Équipez le logement dans l’accueil animalier.');
        const reservations = Object.values(save.shipAnimalsV1?.reservations || {});
        if (habitat && reservations.filter(entry => entry.habitatId === habitat.id).length + animalIds.length > habitat.capacity && !owned)
          conditions.push(animalIds.length > 1 ? 'Deux places libres sont requises dans le même parc.' : 'Ce logement individuel est déjà réservé.');
        const careCapacity = Math.min(8, habitats.filter(entry => entry.installed).reduce((sum, entry) => sum + entry.capacity, 0));
        if (!owned && reservations.length + animalIds.length > careCapacity) conditions.push('Capacité de soin insuffisante pour tous les membres.');
        if (!shopReady || animalIds.some(id => !isShipAnimalAtlasReadyV87(id, this.images.get(id)))) conditions.push('Images en cours de chargement.');
        if (animalIds.length > 1 && !isShipAnimalEnclosureAtlasReadyV87(art?.get('enclosure')))
          conditions.push('Parc et caisse à deux compartiments en cours de chargement.');
        if (animalIds.includes('animal-mica') && !isShipAnimalTerrariumAtlasReadyV87(art?.get('terrarium')))
          conditions.push('Terrarium et caisse de Mica en cours de chargement.');
        if (save.galaxy?.resources?.credits < offer.costCredits) conditions.push('Crédits insuffisants.');
        if (save.hub?.systems?.supplies < 1) conditions.push('Ravitaillement de soin insuffisant.');
        if (save.shipAnimalsV1?.stock?.[offer.id]?.status !== 'available') conditions.push(owned ? 'Déjà acquis dans cette campagne.' : 'Offre indisponible.');
        return { ...definition, animalId: definition.id, animalIds, members, offerId: offer.id, vendorId: offer.vendorId,
          groupIndivisible: animalIds.length > 1, name: members.map(member => member.name).join(' et '), costCredits: offer.costCredits,
          habitatLabel: habitat?.label || definition.habitatType, conditions, owned, canBuy: !conditions.length };
      }) };
  }

  handle(interaction) {
    if (!this.isActive()) return false;
    this.ownerStamp = this.stamp();
    if (interaction.action === 'ship-port:locked') { this.toast('Passerelle fermée. Utilisez le pupitre d’amarrage au sol du hangar.'); return true; }
    if (interaction.action === 'ship-port:shop' || interaction.action === 'ship-port:terminal') {
      const checked = getShipPortInteractionV87(this.hub);
      if (checked?.action !== interaction.action) return false;
      try { this.hub.pause(); } catch (error) { this.toast('Pause non enregistrée : ' + error.message); return false; }
      const opened = this.ui.open({ mode: interaction.action.endsWith('shop') ? 'shop' : 'terminal', animalId: interaction.animalId });
      if (!opened) { this.hub.resume(); this.toast('Le dialogue ne peut pas être affiché sur ce navigateur.'); }
      return Boolean(opened);
    }
    if (interaction.action === 'ship-animal:observe') {
      const checked = getShipAnimalRoomInteractionV87(this.hub, this.saveSystem.data);
      if (checked?.action !== interaction.action || checked.habitatId !== interaction.habitatId || !this.safe()) return false;
      const result = observeShipAnimalEnclosureV87(this.saveSystem.data, { habitatId: interaction.habitatId },
        { player: this.player(), graph: this.refreshGraph() });
      if (!result.ok) { this.toast(textFor(result.code)); return false; }
      const activities = { rest: 'au repos', idle: 'au repos', walk: 'explore son habitat', eat: 'se nourrit', sleep: 'dort', climbUp: 'grimpe sur son support', climbDown: 'redescend de son support' };
      this.toast(result.animals.length ? result.animals.map(animal => animal.name + ' : ' + (activities[animal.activity] || animal.activity)).join(' · ')
        : 'Parc équipé. Aucun résident arrivé pour le moment.');
      return true; // Observation has no reward, time advancement or persistence side effect.
    }
    const verified = this.interaction();
    if (!verified || verified.action !== interaction.action || verified.animalId !== interaction.animalId) return false;
    const save = this.saveSystem.data, player = this.player();
    const context = { player, portAccessible: canAccessPortCounterV87(save) && this.safe(),
      transferBlocked: !this.safe(), simulationTime: save.shipAnimalsV1.lastSimulationTime };
    if (interaction.action === 'ship-animal:pickup') return this.commit(pickupShipAnimalDeliveryV87(save, { animalId: interaction.animalId }, context));
    if (interaction.action === 'ship-animal:receive') return this.commit(receiveShipAnimalDeliveryV87(save, { animalId: interaction.animalId }, context));
    if (interaction.action === 'ship-animal:pet') {
      if (!this.safe()) { this.toast('Contact suspendu pendant la mise en sécurité.'); return false; }
      const success = this.commit(petShipAnimalV87(save, { animalId: interaction.animalId, eventId: id('pet') }, { player, graph: this.refreshGraph() }));
      if (success) this.toast('Contact accepté.'); return success;
    }
    return false;
  }

  uiAction(action) {
    if (!this.isActive() || this.ownerStamp !== this.stamp()) { this.close(); return false; }
    const save = this.saveSystem.data, physical = getShipPortInteractionV87(this.hub);
    let result;
    if (['dock', 'undock', 'abort'].includes(action.type)) {
      if (physical?.action !== 'ship-port:terminal') return false;
      const request = { transactionId: id('port'), portId: PORT.id };
      const context = { ...this.context(), authorization: { granted: true, portId: PORT.id, sectorId: PORT.sectorId,
        campaignHours: (save.clock.day - 1) * 24 + save.clock.hour } };
      result = action.type === 'dock' ? requestShipPortDockV87(save, request, context)
        : action.type === 'undock' ? requestShipPortUndockV87(save, request, context) : abortShipPortDockV87(save, request, context);
    } else if (action.type === 'buy') {
      if (physical?.action !== 'ship-port:shop') return false;
      const offerModel = this.model().offers.find(entry => action.offerId ? entry.offerId === action.offerId : entry.animalIds.includes(action.animalId));
      if (!offerModel?.canBuy) { this.toast(offerModel?.conditions.join(' ') || 'Offre indisponible.'); return false; }
      if (offerModel.vendorId !== physical.vendorId) return false;
      const definition = SHIP_ANIMAL_DEFINITIONS_V87[offerModel.animalId];
      const habitats = getShipAnimalHabitatsV87(save);
      const habitat = habitats.find(entry => entry.id === definition.defaultHabitatId);
      const meeting = SHIP_PORT_MEETINGS_V87.find(entry => entry.animalId === definition.id);
      result = acquireShipAnimalV87(save, { offerId: meeting.offerId, habitatId: habitat.id,
        transactionId: 'adopt:' + offerModel.offerId + ':' + save.shipPortV1.sessionId.split(':').at(-1) }, {
        vendorAccessible: true, vendorId: physical.vendorId, artReadyIds: offerModel.animalIds, habitats: getShipAnimalHabitatsV87(save),
        care: { available: save.hub.systems.supplies > 0,
          capacity: habitats.filter(entry => entry.installed).reduce((sum, entry) => sum + entry.capacity, 0) },
        simulationTime: save.shipAnimalsV1.lastSimulationTime,
        transit: { edgeId: 'carried-port-to-habitat', from: { hubId: PORT.id, roomId: PORT.counterRoomId,
          deckId: 'engineering', x: meeting.x, y: 624 }, to: habitat.location }
      });
      if (result.ok && result.changed) result = initializeShipAnimalDeliveryV87(result.save, { animalId: definition.id });
    } else return false;
    const success = this.commit(result);
    if (success) { this.ui.close(); this.toast(action.type === 'buy' ? 'Contrat enregistré. Prenez la caisse près de l’espace de rencontre avec E.' : 'Manœuvre enregistrée. Reprenez le contrôle du hangar pour la laisser se dérouler.'); }
    else this.ui.refresh();
    return success;
  }

  tick(delta) {
    if (!this.isActive() || this.documentRef.hidden || this.ui.isOpen || !this.hub.running) return;
    const stamp = this.stamp();
    if (this.ownerStamp !== stamp) { this.ownerStamp = stamp; this.tickRemainder = 0; this.graph = null; this.previousActors = [];
      this.carriedPresentationV87 = null; this.carryFrameDeltaV87 = 0; }
    const save = this.saveSystem.data;
    if (!movingPort(save) && !Object.keys(save.shipAnimalsV1?.animals || {}).length) return;
    this.carryFrameDeltaV87 = Number.isFinite(delta) ? Math.max(0, Math.min(.25, delta)) : 0;
    this.tickRemainder += this.carryFrameDeltaV87;
    if (this.tickRemainder < .2) return;
    const dt = .2; this.tickRemainder -= dt;
    let next = save, changed = false;
    if (movingPort(save)) {
      const result = stepShipPortV87(next, { dtSeconds: dt, simulationTime: next.shipPortV1.lastSimulationTime + dt }, this.context());
      if (result.ok && result.changed) { next = result.save; changed = true; }
    }
    const targetTime = next.shipAnimalsV1.lastSimulationTime + dt;
    const graph = this.refreshGraph();
    if (graph?.valid) {
      const result = stepShipAnimalRoutinesV87({ shipAnimalsV1: next.shipAnimalsV1 }, { delta: dt, simulationTime: targetTime, graph,
        paused: !this.safe() });
      if (result.ok && result.changed) { next = { ...next, shipAnimalsV1: result.save.shipAnimalsV1 }; changed = true; }
    }
    const delivered = stepShipAnimalDeliveryV87({ shipAnimalsV1: next.shipAnimalsV1 }, { delta: dt, simulationTime: targetTime },
      { player: this.player(), paused: false, transferBlocked: !this.safe() || Boolean(this.hub.annexTransitionV71) });
    if (!delivered.ok) {
      if (delivered.code === 'discontinuous-carry') {
        const carried = sampleShipAnimalDeliveriesV87(save).find(entry => entry.carried);
        if (carried) {
          const dropped = dropShipAnimalDeliveryV87(save, { animalId: carried.animalId }, { reason: 'carrier-discontinuity' });
          if (dropped.ok) {
            if (this.commit(dropped)) this.toast('La caisse est restée au dernier point de transport validé. Revenez à proximité et appuyez sur E pour la reprendre.');
            return; // Failed persistence already stops safely and reports its cause.
          }
        }
      }
      this.toast('Transport suspendu sans déplacement de la caisse : ' + delivered.code);
      this.hub.stop(false); return;
    }
    if (delivered.ok && delivered.changed) { next = { ...next, shipAnimalsV1: delivered.save.shipAnimalsV1 }; changed = true; }
    if (changed) this.commit({ ok: true, changed: true, save: next });
  }

  interaction() {
    const player = this.player();
    if (!player?.alive || this.hub.annexTransitionV71) return null;
    const dropped = sampleShipAnimalDeliveriesV87(this.saveSystem.data).find(entry => entry.phase === 'awaiting-recovery'
      && entry.roomId === player.roomId && entry.deckId === player.deckId
      && Math.abs(entry.x - player.x) <= 85 && Math.abs(entry.y - player.y) <= 12);
    const names = unit => (unit.animalIds || [unit.animalId]).map(id => SHIP_ANIMAL_DEFINITIONS_V87[id].name.toUpperCase()).join(' ET ');
    if (dropped) return { action: 'ship-animal:pickup', animalId: dropped.animalId,
      prompt: 'E — REPRENDRE LA CAISSE DE ' + names(dropped) };
    for (const delivery of sampleShipAnimalDeliveriesV87(this.saveSystem.data)) {
      const animal = this.saveSystem.data.shipAnimalsV1.animals[delivery.animalId];
      if (delivery.phase === 'awaiting-pickup' && player.roomId === delivery.roomId
        && player.deckId === delivery.deckId && Math.abs(player.x - delivery.x) <= 85 && Math.abs(player.y - delivery.y) <= 12)
        return { action: 'ship-animal:pickup', animalId: animal.id, prompt: 'E — PRENDRE LA CAISSE DE ' + names(delivery) };
      const habitat = getShipAnimalHabitatsV87(this.saveSystem.data).find(entry => entry.id === animal.habitatId);
      const receivingPoint = habitat?.receivingPoint || habitat?.location;
      if (delivery.carried && player.roomId === habitat?.location.roomId
        && Math.abs(player.x - receivingPoint.x) <= 85 && Math.abs(player.y - receivingPoint.y) <= 12)
        return { action: 'ship-animal:receive', animalId: animal.id, prompt: 'E — DÉPOSER ET CONTRÔLER ' + names(delivery) };
    }
    for (const animal of Object.values(this.saveSystem.data.shipAnimalsV1?.animals || {})) {
      if (['enclosure-volume', 'terrarium-volume'].includes(getShipAnimalHabitatsV87(this.saveSystem.data).find(habitat => habitat.id === animal.habitatId)?.navigationDomain)) continue;
      if (animal.location.kind === 'resident' && animal.location.roomId === player.roomId && animal.location.deckId === player.deckId
        && Math.abs(animal.location.x - player.x) <= 70 && Math.abs(animal.location.y - player.y) <= 12)
        return { action: 'ship-animal:pet', animalId: animal.id, prompt: 'E — PROPOSER UN CONTACT À ' + animal.name.toUpperCase() };
    }
    return null;
  }

  draw(ctx) {
    const player = this.player(), save = this.saveSystem.data;
    if (!player) return;
    const graph = this.refreshGraph();
    const portArt = this.hub.ensureAnnexAssetsV71(PORT.counterRoomId), enclosure = portArt?.get('enclosure');
    const terrariumImage = portArt?.get('terrarium');
    const inCare = player.roomId === 'animal-care';
    const actors = sampleShipAnimalRoutinesV87(save, { roomId: player.roomId, deckId: player.deckId, graph });
    const drawActor = actor => {
      const previous = this.ownerStamp === this.stamp() ? this.previousActors?.find(entry => entry.animalId === actor.animalId) : null;
      const visual = sampleCompanionPresentationV87(actor, previous, this.tickRemainder,
        { paused: !this.hub.running || this.documentRef.hidden || this.ui.isOpen, reducedMotion: save.settings?.reducedMotion === true });
      drawShipAnimalV87(ctx, this.images.get(actor.animalId), visual);
    };
    if (inCare) drawShipAnimalEnclosuresV87(ctx, enclosure, save, 'back');
    if (inCare) drawShipAnimalTerrariumV87(ctx, terrariumImage, save, 'back');
    if (inCare && isShipAnimalEnclosureAtlasReadyV87(enclosure)) actors.filter(actor => actor.enclosed && actor.animalId !== 'animal-mica').forEach(drawActor);
    if (inCare && isShipAnimalTerrariumAtlasReadyV87(terrariumImage)) actors.filter(actor => actor.animalId === 'animal-mica').forEach(drawActor);
    if (inCare) drawShipAnimalEnclosuresV87(ctx, enclosure, save, 'front');
    if (inCare) drawShipAnimalTerrariumV87(ctx, terrariumImage, save, 'front');
    actors.filter(actor => !actor.enclosed).forEach(drawActor);
    const props = portArt?.get('prop');
    for (const delivery of sampleShipAnimalDeliveriesV87(save)) {
      if (!delivery.carried && player.roomId === delivery.roomId && player.deckId === delivery.deckId) {
        if (delivery.animalIds?.length === 2) drawShipBondedCarrierV87(ctx, enclosure, { x: delivery.x - 42, width: 84, bottom: delivery.y });
        else if (delivery.animalId === 'animal-mica') drawShipMicaCarrierV87(ctx, terrariumImage, { x: delivery.x - 28, width: 56, bottom: delivery.y });
        else drawPortPropV87(ctx, props, 'carrier', { x: delivery.x - 28, width: 56, bottom: delivery.y });
      }
    }
  }
  drawCarried(ctx) {
    if (!this.isActive() || this.ownerStamp !== this.stamp()) { this.carriedPresentationV87 = null; return; }
    const player = this.player();
    const delivery = sampleShipAnimalDeliveriesV87(this.saveSystem.data).find(entry => entry.carried
      && entry.roomId === player?.roomId && entry.deckId === player?.deckId);
    this.carriedPresentationV87 = sampleShipCarrierPresentationV87(delivery, player, {
      remainder: this.tickRemainder, frameDelta: this.carryFrameDeltaV87,
      facing: this.hub.player?.facing, previous: this.carriedPresentationV87,
      paused: !this.hub.running || this.documentRef.hidden || this.ui.isOpen,
      transitioning: Boolean(this.hub.annexTransitionV71)
    });
    if (!this.carriedPresentationV87) return;
    const art = this.hub.ensureAnnexAssetsV71(PORT.counterRoomId);
    if (delivery.animalIds?.length === 2) drawShipBondedCarrierV87(ctx, art?.get('enclosure'), this.carriedPresentationV87.bounds);
    else if (delivery.animalId === 'animal-mica') drawShipMicaCarrierV87(ctx, art?.get('terrarium'), this.carriedPresentationV87.bounds);
    else drawPortPropV87(ctx, art?.get('prop'), 'carrier', this.carriedPresentationV87.bounds);
  }
}
