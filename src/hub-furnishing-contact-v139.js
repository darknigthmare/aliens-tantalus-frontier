const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};

/** Historical contact fallbacks for the immutable original V136/V137 crops.
 * Current admitted cells supply their own footSourceY and take precedence.
 * Last alpha>=192 row plus one defines the physical foot; padding does not. */
export const HUB_FURNISHING_CONTACTS_V139=freeze({
  136:{'sterile-cabinet':333,'medical-trolley':394,'galley-rack':302,'personal-shelf':190,'tool-board':351,'data-cabinet':361},
  137:{'crew-berth':240,'galley-unit':256,'food-refrigerator':312,'sanitary-unit':302,'engine-pump':254,
    'filtration-skid':275,'cockpit-seat':313,'service-conduits':157,'emergency-cabinet':241},
  assets:{
    '/assets/openai/hub/props/cryopod.png':{sourceWidth:241,sourceHeight:131,footSourceY:121,capacityScale:110/138},
    '/assets/openai/hub/props/bunk-module.png':{sourceWidth:228,sourceHeight:170,footSourceY:159,capacityScale:110/115}
  }
});

export function getHubFurnishingFootSourceV139(atlas,cell){
  if(Number.isFinite(cell?.footSourceY))return cell.footSourceY;
  return HUB_FURNISHING_CONTACTS_V139[atlas]?.[cell?.id]??cell?.source?.h??null;
}

/** The source rectangle still paints its original alpha fringe below contact.
 * Placement limits use the physical foot; reservations retain the full image
 * rectangle, so this cannot make a neighbour pass through painted furniture. */
export function getHubFurnishingPlacementBoundsV139(entry){
  if(entry?.mountBoundsV139)return{...entry.mountBoundsV139};
  if(entry?.support!=='rear-floor'||!Number.isFinite(entry.contactYV139))return entry;
  return{...entry,h:entry.contactYV139-entry.y};
}
