const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const point = (x, y) => ({ x, y });

/** Film references identify garments, not a claim of photographic/pixel
 * identity. Original props, later replicas and licensed figures are kept
 * distinct. None of the reference photographs is shipped as game art. */
export const PLAYER_COLONIAL_REFERENCES_V129 = freeze([
  { id: 'hudson-original', kind: 'screen-used-prop-collection',
    url: 'https://propstore.com/product/aliens-1986/lot-21-harry-harris-collection-pvt-hudsons-bill-paxton-uscm-costume/',
    note: 'Hudson cuirass/helmet; collection contains some garments from other performers.' },
  { id: 'harris-armor', kind: 'original-prop-owner-documentation',
    url: 'https://harryharris.com/armour.htm',
    note: 'Thin painted plates; the rigid gorget was never used for filming.' },
  { id: 'harris-bdu', kind: 'original-prop-owner-documentation',
    url: 'https://harryharris.com/bdu.htm',
    note: 'Separate fabric camouflage; Hudson film calendar has 3 by 4 boxes. The sprite calendar remains simplified, not exact.' },
  { id: 'harris-insignia', kind: 'original-prop-owner-documentation',
    url: 'https://harryharris.com/patches.htm',
    note: 'Screaming Eagle on the right shoulder; US flag on the left. Shared limb views simplify fine inscriptions.' },
  { id: 'hicks-replica', kind: 'terry-english-replica-2013',
    url: 'https://propstore.com/product/aliens-1986/terry-english-replica-corporal-hicks-body-armour/',
    note: 'Hicks heart and padlock reference, not a screen-used color calibration.' },
  { id: 'shoulder-lamp', kind: 'screen-used-prop-collection',
    url: 'https://propstore.com/product/aliens-1986/lot-28-harry-harris-collection-uscm-shoulder-torch-pack/',
    note: 'Lamp only; the accompanying later pouch and power supply are excluded.' },
  { id: 'vasquez-smartgunner', kind: 'licensed-neca-figure',
    url: 'https://necaonline.com/2016/08/closer-look-aliens-series-9-action-figures-vasquez-frost-and-albino/',
    note: 'Smartgun harness, bare arms with narrow cloth ties, fingerless gloves and bandana; not the later BDU outfit.' },
  { id: 'vasquez-eyepiece', kind: 'screen-matched-original-prop',
    url: 'https://propstore.com/product/aliens-1986/lot-7-pvt-vasquezs-jenette-goldstein-screen-matched-m56-smartgun-eye-piece/',
    note: 'Flat angular olive eyecup, distinct temple camera, coiled cable and microphone; no Drake painted eyeball.' }
]);
const asset = (kind, imageKey, width, height, sha256) => ({
  id: `player.echo9-marine.colonial-v129.${kind}`, kind, rigType: 'echo9', imageKey,
  path: `/assets/openai/sprites/player/colonial-v129/uscm-${kind}-v129.png`,
  sourceWidth: width, sourceHeight: height, width, height, sha256,
  sourceFacing: kind === 'torso-left' ? -1 : 1, exact: false,
  visualStatus: 'film-reference-separated-costume', sourceWork: 'Aliens (1986)',
  provenance: 'film-reference-adaptation'
});
/** Original imagegen outputs, copied without pixel edits or resampling.
 * Native dimensions vary; all rectangles below are measured in those PNGs.
 * Both torso views have genuinely empty neck and arm apertures. */
export const PLAYER_COLONIAL_RIG_ASSETS_V129 = freeze([
  asset('torso-right', 'playerColonialTorsoRightV129', 1086, 1448,
    '6be09c3d5ef197b0e1d343c530ec70a2eb13b03c1d2c7ca620c96f8dc7218cc5'),
  asset('torso-left', 'playerColonialTorsoLeftV129', 1086, 1448,
    'fa59fadaec087164f757f9fb274d537ed4f9f49fb39de04ca02f7d011d5197ad'),
  asset('arms', 'playerColonialArmsV129', 1254, 1254,
    '394cf81c59065d8dfd26ece4ec60146b3ac60754ae4863b9464947566b6aa4ad'),
  asset('legs', 'playerColonialLegsV129', 1254, 1254,
    '862d7afa275ee54d78e031d68ed461255804b3b5ad4d7534ba8fa2018a99165f'),
  asset('head-back', 'playerColonialHeadBackV129', 1536, 1024,
    '2f8aed2e99d6be9108aaf07d809cf0ff093bab0fa83219b5205b19ef58091cf5')
]);
const [RIGHT, LEFT, ARMS, LEGS, ATTACHMENTS] = PLAYER_COLONIAL_RIG_ASSETS_V129;
const part = (bounds, extra = {}) => ({
  alphaBounds: bounds, width: bounds[2] - bounds[0],
  source: { x: bounds[0] - 2, y: bounds[1] - 2,
    width: bounds[2] - bounds[0] + 4, height: bounds[3] - bounds[1] + 4 }, ...extra
});
const segment = (bounds, proximal, distal) => part(bounds, {
  proximal: point(...proximal), distal: point(...distal)
});
const torso = (bounds, near, far, waist) => part(bounds, {
  joints: { near: point(...near), far: point(...far), waist: point(...waist) }
});
const torsoSet = (definitions, image) => Object.fromEntries(['upright', 'forward', 'compact']
  .map((family, i) => [family, { asset: image, part: torso(...definitions[i]) }]));
const torsoIds = ['torso-uscm-v129', 'torso-hicks-v129', 'torso-hudson-v129', 'torso-smartgunner-v129'];
const rightTorsos = [
  [ [[7,10,355,343],[73,157],[302,136],[193,315]],
    [[375,19,720,352],[439,168],[662,151],[557,324]],
    [[757,62,1082,363],[818,194],[1027,168],[924,332]] ],
  [ [[7,367,355,699],[73,514],[302,493],[193,672]],
    [[379,373,726,707],[443,521],[667,505],[559,680]],
    [[756,411,1084,721],[817,542],[1029,518],[924,690]] ],
  [ [[7,725,355,1060],[73,873],[302,851],[193,1033]],
    [[377,736,725,1069],[441,884],[666,867],[559,1042]],
    [[756,772,1082,1083],[817,903],[1027,879],[924,1052]] ],
  [ [[43,1075,329,1414],[73,1178],[291,1148],[186,1377]],
    [[399,1080,699,1418],[438,1186],[654,1163],[547,1384]],
    [[760,1115,1065,1431],[806,1210],[1019,1175],[908,1397]] ]
];
const leftTorsos = [
  [ [[22,4,358,338],[302,153],[63,132],[187,309]],
    [[363,18,691,349],[635,164],[411,148],[524,321]],
    [[736,43,1069,353],[1009,182],[786,165],[900,327]] ],
  [ [[19,355,361,692],[305,503],[63,485],[188,665]],
    [[360,368,698,702],[641,514],[410,498],[527,674]],
    [[726,396,1070,713],[1011,536],[778,519],[900,685]] ],
  [ [[16,712,361,1057],[305,863],[62,843],[188,1029]],
    [[358,729,699,1066],[641,878],[408,862],[527,1039]],
    [[726,759,1067,1077],[1008,900],[778,882],[900,1049]] ],
  [ [[33,1068,326,1409],[291,1177],[66,1135],[175,1376]],
    [[368,1081,669,1412],[630,1189],[410,1155],[514,1379]],
    [[736,1106,1049,1426],[1002,1210],[776,1177],[896,1393]] ]
];
export const PLAYER_COLONIAL_TORSOS_V129 = freeze(Object.fromEntries(torsoIds.map((id, i) =>
  [id, { right: torsoSet(rightTorsos[i], RIGHT), left: torsoSet(leftTorsos[i], LEFT) }])));
export const getPlayerColonialTorsoV129 = (id, facing = 1, family = 'upright') =>
  PLAYER_COLONIAL_TORSOS_V129[id]?.[facing < 0 ? 'left' : 'right']?.[family] || null;

export const PLAYER_COLONIAL_ARM_PARTS_V129 = freeze({
  'arms-uscm-v129': {
    near: {
      upper: segment([113,19,295,315],[211,60],[220,275]),
      fore: segment([402,18,601,305],[457,55],[565,270]),
      grip: segment([707,90,905,292],[759,121],[810,220]),
      service: segment([1030,132,1160,316],[1080,171],[1101,246])
    },
    far: {
      upper: segment([113,334,307,621],[223,371],[188,584]),
      fore: segment([393,332,578,606],[520,372],[435,566]),
      grip: segment([680,403,884,597],[827,435],[773,529]),
      service: segment([995,435,1149,620],[1090,482],[1046,554])
    }
  },
  'arms-smartgunner-v129': {
    near: {
      upper: segment([113,637,299,925],[202,675],[240,883]),
      fore: segment([401,639,607,904],[447,675],[566,868]),
      grip: segment([695,698,898,901],[747,727],[798,831]),
      service: segment([1035,742,1175,925],[1093,785],[1109,856])
    },
    far: {
      upper: segment([104,940,290,1226],[222,977],[158,1178]),
      fore: segment([381,938,586,1206],[533,978],[425,1167]),
      grip: segment([685,1014,880,1206],[823,1046],[775,1142]),
      service: segment([988,1051,1158,1226],[1090,1098],[1038,1171])
    }
  }
});
export function getPlayerColonialArmsV129(id) {
  const parts = PLAYER_COLONIAL_ARM_PARTS_V129[id];
  return parts ? { asset: ARMS, parts } : null;
}
const pelvis = (bounds, waist, near, far) => part(bounds, {
  waist: point(...waist), near: point(...near), far: point(...far)
});
const boot = (bounds, ankle, sole, heel, toe) => part(bounds, {
  ankle: point(...ankle), proximal: point(...ankle), distal: point(...sole),
  sole: point(...sole), heel: point(...heel), toe: point(...toe)
});
/** Contact pivots sit on opaque cloth/soles. Several pieces cross nominal
 * grid rows; the measured rectangle includes each whole boot and greave. */
export const PLAYER_COLONIAL_LEG_DEFINITIONS_V129 = freeze({
  'legs-uscm-v129': { asset: LEGS, parts: {
    pelvis: pelvis([55,73,313,269],[184,139],[107,223],[266,223]),
    near: {
      upper: segment([405,47,608,322],[484,91],[536,287]),
      lower: segment([721,48,866,332],[799,103],[788,295]),
      boot: boot([1022,177,1212,338],[1080,262],[1151,336],[1042,320],[1191,321])
    },
    far: {
      upper: segment([87,363,300,620],[169,408],[244,583]),
      lower: segment([433,352,576,631],[515,405],[490,595]),
      boot: boot([715,487,902,638],[770,567],[838,636],[735,620],[882,620])
    }
  } },
  'legs-smartgunner-v129': { asset: LEGS, parts: {
    pelvis: pelvis([54,694,314,887],[184,762],[107,845],[267,843]),
    near: {
      upper: segment([402,658,608,939],[486,704],[537,903]),
      lower: segment([719,663,863,940],[799,710],[788,904]),
      boot: boot([1022,802,1212,959],[1080,886],[1153,956],[1042,942],[1191,942])
    },
    far: {
      upper: segment([81,936,304,1201],[169,981],[244,1165]),
      lower: segment([426,946,570,1205],[507,990],[490,1170]),
      boot: boot([717,1061,916,1216],[772,1147],[851,1214],[738,1198],[896,1198])
    }
  } }
});
const helmet = (bounds, ear, sourceFacing, scale = .7) => ({ asset: ATTACHMENTS,
  part: part(bounds, { ear: point(...ear), sourceFacing, fitScale: scale }) });
export const PLAYER_COLONIAL_HELMETS_V129 = freeze({
  'helmet-uscm-v129': {
    right: helmet([54,12,369,255],[157,181],1),
    left: helmet([43,261,377,506],[256,425],-1)
  },
  'helmet-hicks-v129': {
    right: helmet([417,11,737,256],[520,181],1),
    left: helmet([426,262,750,512],[632,426],-1)
  },
  'helmet-hudson-v129': {
    right: helmet([800,12,1119,257],[901,181],1),
    left: helmet([795,265,1125,508],[1007,427],-1)
  },
  'headband-vasquez-v129': {
    right: helmet([1187,24,1500,254],[1297,165],1,.66),
    left: helmet([1184,273,1519,498],[1403,412],-1,.66)
  }
});
export const getPlayerColonialHelmetV129 = (id, facing = 1) =>
  PLAYER_COLONIAL_HELMETS_V129[id]?.[facing < 0 ? 'left' : 'right'] || null;
const back = (bounds, mount, sourceFacing, scaleX, scaleY) => ({ asset: ATTACHMENTS,
  part: part(bounds, { mount: point(...mount), sourceFacing, scaleX, scaleY }) });
export const PLAYER_COLONIAL_BACKS_V129 = freeze({
  'back-shoulder-lamp-v129': {
    right: back([420,521,732,729],[578,636],1,.11,.29),
    left: back([47,516,356,729],[193,634],-1,.11,.29)
  },
  'back-hicks-scabbard-v129': {
    right: back([825,503,1104,741],[919,559],1,.12,.36),
    left: back([1197,503,1472,743],[1378,559],-1,.12,.36)
  },
  'back-smartgun-harness-v129': {
    right: back([44,731,359,1012],[170,797],1,.12,.28),
    left: back([420,730,732,1013],[603,797],-1,.12,.28)
  }
});
export const getPlayerColonialBackV129 = (id, facing = 1) =>
  PLAYER_COLONIAL_BACKS_V129[id]?.[facing < 0 ? 'left' : 'right'] || null;
