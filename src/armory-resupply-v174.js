/** V174 armory resupply counter.
 * Original Tantalus economy tuning; not a claim about AFE/AFE2 costs.
 * Existing save schema 52 fields ONLY: player.ammo, galaxy.resources,
 * strategy.serial/log, statistics.procurements. No invented magazines or
 * unlocked weapon entries. The caller persists atomically via SaveSystem.
 */
export const ARMORY_RESUPPLY_SCHEMA_V174 = 174;
const freezeDeep = x => { if (x && typeof x === 'object' && !Object.isFrozen(x)) {
  Object.values(x).forEach(freezeDeep); Object.freeze(x); } return x; };
export const ARMORY_RESUPPLY_CATALOG_V174 = freezeDeep([
  { id:'supply-primary-60',label:'Lot de munitions principales',ammoKey:'primary',quantity:60,credits:120,
    notes:'Ravitaillement de réserve. Ne matérialise pas un magasin de M41A.' },
  { id:'supply-secondary-24',label:'Lot de munitions secondaires',ammoKey:'secondary',quantity:24,credits:90,
    notes:'Stock générique historique ; calibre exact selon la dotation en mission.' },
  { id:'supply-grenade-2',label:'Lot de grenades',ammoKey:'grenades',quantity:2,credits:220,
    notes:'Charge générique du manifeste ; ne certifie aucune grenade canonique.' }
]);
const byId = new Map(ARMORY_RESUPPLY_CATALOG_V174.map(x => [x.id,x]));
const asInt = value => Number.isSafeInteger(value) && value >= 0 && value <= 999999;
const registered = s => s && typeof s === 'object' && !Array.isArray(s);
const validSave = save => registered(save) && registered(save.player?.ammo)
  && registered(save.strategy) && Array.isArray(save.strategy.log)
  && Array.isArray(save.strategy.unlockedResearchIds) && registered(save.galaxy?.resources)
  && registered(save.statistics) && asInt(save.strategy.serial)
  && asInt(save.statistics.procurements) && asInt(save.galaxy.resources.credits);
const validStock = (save, entry) => validSave(save) && asInt(save.player.ammo[entry.ammoKey]);
const price = (save, entry) => Math.ceil((entry.credits
  * (save.strategy.unlockedResearchIds.includes('ship-logistics') ? .85 : 1)) / 10) * 10;
export function quoteArmoryResupplyV174(save, skuId) {
  const entry = byId.get(skuId);
  if (!entry || !validStock(save, entry)) return null;
  const credits = price(save, entry), current = save.player.ammo[entry.ammoKey];
  return { id:entry.id, label:entry.label, ammoKey:entry.ammoKey,
    quantity:entry.quantity, current, after:current+entry.quantity, credits,
    purchasable:!save.strategy.currentOperation && !save.recoveryNeeded
      && current+entry.quantity<=999999 && save.galaxy.resources.credits>=credits
      && save.strategy.serial<999999 && save.statistics.procurements<999999,
    notes:entry.notes };
}
export function purchaseArmoryResupplyV174(save, skuId) {
  const quote = quoteArmoryResupplyV174(save, skuId);
  if (!quote) throw new Error('Référence de ravitaillement inconnue.');
  if (save.strategy.currentOperation) throw new Error('Ravitaillement verrouillé pendant une opération.');
  if (save.recoveryNeeded) throw new Error('Sauvegarde à récupérer avant acquisition.');
  if (quote.after>999999) throw new Error('Capacité de réserve atteinte.');
  if (save.galaxy.resources.credits<quote.credits) throw new Error('Crédits insuffisants.');
  if (!quote.purchasable) throw new Error('Ravitaillement indisponible.');
  // All failure conditions were checked before the first in-place mutation.
  // SaveSystem.runTimedMutation captures a rollback and commits one candidate.
  save.player.ammo[quote.ammoKey]=quote.after;
  save.galaxy.resources.credits-=quote.credits;
  save.strategy.serial++;
  save.statistics.procurements++;
  const receipt='armory-v174:'+save.strategy.serial+':'+quote.id;
  const row={id:receipt,type:'resupply',title:quote.label,day:save.clock?.day||1,
    hour:save.clock?.hour||0,risk:0,incident:false,
    result:quote.quantity+' unités '+quote.ammoKey+' achetées, '+quote.credits+' CR débités.'};
  save.strategy.log.unshift(row);
  save.strategy.log=save.strategy.log.slice(0,40);
  return {ok:true,receipt,quote,remainingCredits:save.galaxy.resources.credits};
}
const escape = str => String(str).replace(/[&<>"']/g,c=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[c]);
export function renderArmoryResupplyV174(save){
  return '<section class="panel" id="armory-resupply-v174" aria-label="Ravitaillement armurerie">'
    + '<h3>RAVITAILLEMENT · COMPTOIR LOGISTIQUE</h3>'
    + '<p>Lots de munitions pour la prochaine opération · gestion de réserve historique. '
    + 'Les chargeurs physiques restent propres aux armes en mission.</p>'
    + '<div class="catalog-grid">'+ARMORY_RESUPPLY_CATALOG_V174.map(row=>{
      const q=quoteArmoryResupplyV174(save,row.id);
      const disabled=!q?.purchasable;
      const label=q?.purchasable?'ACHETER · '+q.credits+' CR'
        : save?.strategy?.currentOperation?'OPÉRATION ACTIVE'
          : !q?'INDISPONIBLE':'CAPACITÉ OU CRÉDITS INSUFFISANTS';
      return '<article class="catalog-card"><span class="eyebrow">RAVITAILLEMENT</span>'
        +'<h4>'+escape(row.label)+'</h4><p>+'+row.quantity
        +' · en réserve : '+escape(q?.current??'—')+'</p>'
        +'<footer><span>'+escape(row.notes)+'</span>'
        +'<button type="button" class="button compact" data-armory-resupply-v174="'
        +escape(row.id)+'"'+(disabled?' disabled':'')+'>'+escape(label)+'</button>'
        +'</footer></article>';
    }).join('')+'</div></section>';
}
