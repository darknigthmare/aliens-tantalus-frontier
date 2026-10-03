/** Independent byte admission after four-background visual review. Generator
 * metadata alone cannot publish a candidate or invent motion/source fidelity. */
export const REVIEWED_EQUIPMENT_V122 = Object.freeze([
  ['assets/openai/equipment/v122-weapons/x1-fireball-native-v122.png','d61a4b4f448fae631c493aabc35ad0184d1d6cc0279d4427656aa6b8f232e7c6',1998,787],
  ['assets/openai/equipment/v122-weapons/lem-stg24-storm-rifle-native-v122.png','a554af8aaf2fbaf72ea32f1d125f20add0791423d6c819e94bdc9f466abf06e8',1931,814],
  ['assets/openai/equipment/v122-weapons/u1a2-gl-conversion-native-v122.png','448a261a794757ac1f9cf933fbf4afc0e62ea5c5763a7e7cefc470d1308ef2ba',1983,793],
  ['assets/openai/equipment/v122-weapons/4c2-astra-native-v122.png','ea36651e4c3e839c53f4c7e3f542cb16f4feef9e2037b151a5f4832659ce9ba6',1774,887],
  ['assets/openai/equipment/v122-weapons/2b1-vajra-native-v122.png','c23714df373d28ac445417212a6ccad277f6b1825c257938b8cfc34443d23cb8',2087,753],
  ['assets/openai/equipment/v122-weapons/6a-jaipur-smg-native-v122.png','b3dde005b2c2c65f3a73f15f850f7a72067bad48dcff6b6fc13f9cb6ec019dfb',1672,941],
  ['assets/openai/equipment/v122-weapons/8a7-dambulla-machine-pistol-native-v122.png','94304d95c05fa31f491f4c6e954f17abfaf70a8623bbc77fe37ba862d5d1feca',1774,887],
  ['assets/openai/equipment/v122-vehicles/covenant-terraforming-truck-reference-native-v122.png','5e70e3d9721fcf056ecc3db84a557b25acd0a48d8074acc20ccd2579c729cbd2',1717,916]
].map(([path,sha256,width,height])=>Object.freeze({path,sha256,width,height})));
const reviewed = new Map(REVIEWED_EQUIPMENT_V122.map(file=>[`/${file.path}`,file]));
export function isEquipmentAdmittedV122(profile) {
  const file=reviewed.get(profile?.path);
  return Boolean(file && file.sha256===profile.sha256 && file.width===profile.sourceWidth
    && file.height===profile.sourceHeight && profile.reviewStatus==='accepted-static-adaptation'
    && profile.canonExact===false && profile.animationStatus==='missing');
}
