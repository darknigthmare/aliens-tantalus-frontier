/** Fixed reference adaptations, never new action atlases or certified geometry.
 * Explicit catalogue IDs are the only saved-identity bindings. */
const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
};
const shared = {
  sheetId: null, clipSet: null, visualMode: 'static-pose', animationStatus: 'missing',
  availableStates: ['idle'], missingStates: ['action', 'reload', 'service'],
  referenceStatus: 'PRODUCTION_REFERENCE_RECONSTRUCTION', sourceWork: 'Aliens: Fireteam Elite',
  sourceProvenance: 'artbully-production-artist-portfolio',
  referenceUrl: 'https://www.artbully.co/aliens-fireteam-elite-weapons-gallery',
  referenceLabel: 'Art Bully Productions — modèles produits pour Aliens: Fireteam Elite',
  identityVerified: true, canonExact: false, approximate: true,
  identityStatus: 'reference-reconstruction', geometryStatus: 'reference-reconstruction-not-certified',
  displaySizingPolicy: 'catalog-layout-not-physical-metric-scale', release: 'v121',
  sourceFacing: 1, reviewStatus: 'accepted-static-adaptation',
  reviewScope: 'local-image-and-rgba-inspected-independent-public-admission-required',
  referenceCaveat: 'Vue primaire du prestataire de production inspectée. La plaque est une adaptation fixe ; proportions, détails, dimensions et statistiques ne sont pas certifiés 1:1.'
};
export const M94_IMPACT_GRENADE_PROFILE_V121 = freeze({
  ...shared, baseNumber: 13, catalogId: 'weapon-013',
  catalogIds: ['weapon-013-m94-impact-grenade', 'weapon-053-m94-impact-grenade-field',
    'weapon-093-m94-impact-grenade-veteran', 'weapon-133-m94-impact-grenade-prototype'],
  name: 'M94 Impact Grenade', canonicalName: 'M94 Impact Grenade', category: 'explosive',
  imageKey: 'weaponV121:13',
  path: '/assets/openai/equipment/v121-weapons/m94-impact-grenade-native-v121.png',
  rawPath: '/assets/openai/equipment/v121-weapons/m94-impact-grenade-native-v121.png',
  sha256: '840eb72be8546252f22a428a6724ee6f1a020fd67695c372b7271d4fad338b93',
  sourceWidth: 1926, sourceHeight: 816,
  alphaBounds: [32,81,1915,753], alphaBoundsThreshold: 16,
  gripPivot: {x:620/1926,y:540/816}, muzzlePivot: {x:1890/1926,y:360/816},
  width: 116, height: 116*816/1926,
  referenceImageUrl: 'https://images.squarespace-cdn.com/content/v1/52fd313ee4b0b3c32132e9de/1648070612848-YR3C6RPF1OQX2DYAVJ85/_M94%2BImpact%2BGrenade_HP.jpg',
  designationStatus: 'official-name-variation-not-model-equivalence', relatedDesignation: 'M94 Impact Launcher',
  legacyAnimation: {imageKey:'weaponV61:13',sheetId:'weapon.m94-impact-grenade.action',
    path:'/assets/openai/sprites/normalized/weapons/m94-impact-grenade-action-sheet.png'},
  fallbackReason: 'Lanceur M94 à tambour d’après la vue primaire Art Bully. Pose fixe ; les quatre finitions partagent cette plaque, et l’atlas historique reste conservé. Détails non certifiés 1:1. Le nom Impact Launcher n’ajoute pas un second modèle.'
});
export const TYPE76_AUTO_SHOTGUN_PROFILE_V121 = freeze({
  ...shared, baseNumber:148, catalogId:'weapon-148', catalogIds:['weapon-148-type-76-auto-shotgun'],
  name:'Type 76 Auto Shotgun', canonicalName:'Type 76 Auto Shotgun', category:'shotgun',
  imageKey:'weaponV121:148',path:'/assets/openai/equipment/v121-weapons/type76-auto-shotgun-native-v121.png',
  rawPath:'/assets/openai/equipment/v121-weapons/type76-auto-shotgun-native-v121.png',
  sha256:'b439b38a3141ad27e6b71944f6537fdbd1b4ad32609e7c71709552f248adaec6',
  sourceWidth:1828,sourceHeight:860,alphaBounds:[63,92,1797,779],alphaBoundsThreshold:16,
  gripPivot:{x:160/1828,y:540/860},muzzlePivot:{x:1770/1828,y:330/860},
  width:104,height:104*860/1828,
  referenceImageUrl:'https://images.squarespace-cdn.com/content/v1/52fd313ee4b0b3c32132e9de/1648070564571-T0TBHJZ5WSVZWUBY4RB5/_Type%2B76%2BAuto%2BShotgun_HP.jpg',
  legacyAnimation:null,
  fallbackReason:'Type 76 sur vue primaire Art Bully : receiver allongé, fenêtre latérale, frein de bouche et brace inférieur conservés. Adaptation fixe non certifiée 1:1 ; aucune animation historique ni nouvelle action dédiée pour cette addition.'
});
export const L59_MINIGUN_PROFILE_V121 = freeze({
  ...shared,baseNumber:150,catalogId:'weapon-150',catalogIds:['weapon-150-l59-minigun'],
  name:'L59 Minigun',canonicalName:'L59 Minigun',category:'heavy',imageKey:'weaponV121:150',
  path:'/assets/openai/equipment/v121-weapons/l59-minigun-native-v121.png',
  rawPath:'/assets/openai/equipment/v121-weapons/l59-minigun-native-v121.png',
  sha256:'3cfaf7b683141bbb78f4f721646d3abba3dd0a408017f1fc102df355ebdb2dca',
  sourceWidth:2048,sourceHeight:768,alphaBounds:[39,116,1970,661],alphaBoundsThreshold:16,
  gripPivot:{x:200/2048,y:350/768},muzzlePivot:{x:1938/2048,y:370/768},
  width:132,height:132*768/2048,
  referenceImageUrl:'https://images.squarespace-cdn.com/content/v1/52fd313ee4b0b3c32132e9de/1648070525498-LY7N6WYULX1J1UPLM0BU/_L59%2BMinigun_HP.jpg',
  legacyAnimation:null,
  fallbackReason:'L59 sur vue primaire Art Bully : cluster rotatif, poignée supérieure, anneaux de maintien et tambour conservés. Adaptation fixe non certifiée 1:1 ; aucune animation historique ni nouvelle action dédiée pour cette addition.'
});
export const M12_RPG_PROFILE_V121 = freeze({
  ...shared,baseNumber:149,catalogId:'weapon-149',catalogIds:['weapon-149-m12-rpg'],
  name:'M12 RPG',canonicalName:'M12 RPG',category:'heavy',imageKey:'weaponV121:149',
  path:'/assets/openai/equipment/v121-weapons/m12-rpg-native-v121.png',
  rawPath:'/assets/openai/equipment/v121-weapons/m12-rpg-native-v121.png',
  sha256:'f6457723ff7a988c36994e6ebdc8d7139b60c08be7ba1b978e3014dfc4803d3a',
  sourceWidth:2152,sourceHeight:731,alphaBounds:[21,76,2138,706],alphaBoundsThreshold:16,
  gripPivot:{x:220/2152,y:420/731},muzzlePivot:{x:2100/2152,y:320/731},
  width:126,height:126*731/2152,
  referenceImageUrl:'https://images.squarespace-cdn.com/content/v1/52fd313ee4b0b3c32132e9de/1648070400901-LCKYDLZAI8JANJ2BJBUZ/_M12%2BRPG%2BLauncher_HP.jpg',
  legacyAnimation:null,
  fallbackReason:'M12 sur vue primaire Art Bully : tube, poignée supérieure, carter ajouré et tambour arrière conservés. Modèle distinct des M5 et M6B ; adaptation fixe non certifiée 1:1, sans nouvelle animation.'
});
export const LEM_MP11_STORMSURGE_PROFILE_V121 = freeze({
  ...shared,baseNumber:151,catalogId:'weapon-151',catalogIds:['weapon-151-lem-mp11-stormsurge'],
  name:'LEM MP11 Stormsurge',canonicalName:'LEM MP11 Stormsurge',category:'smg',imageKey:'weaponV121:151',
  path:'/assets/openai/equipment/v121-weapons/lem-mp11-stormsurge-native-v121.png',
  rawPath:'/assets/openai/equipment/v121-weapons/lem-mp11-stormsurge-native-v121.png',
  sha256:'a15f55c7bc5298f78690d84709a9d24ed6b25acd65a5f4b85c7faafb6691c273',
  sourceWidth:1774,sourceHeight:887,alphaBounds:[38,136,1752,836],alphaBoundsThreshold:16,
  gripPivot:{x:590/1774,y:690/887},muzzlePivot:{x:1720/1774,y:370/887},
  width:94,height:94*887/1774,
  referenceImageUrl:'https://images.squarespace-cdn.com/content/v1/52fd313ee4b0b3c32132e9de/1648070426628-6SUTAD3TA9HUAUDXJAUF/_LEM%2BMP11%2BStormsurge_HP.jpg',
  legacyAnimation:null,
  fallbackReason:'LEM MP11 sur vue primaire Art Bully : bullpup compact, ouverture ronde de poignée, fenêtre et poignée avant conservés. Adaptation fixe non certifiée 1:1, sans nouvelle animation.'
});
const fromInspectedPlate = row => freeze({
  ...shared,...(row.referenceMetadata||{}),baseNumber:row.number,catalogId:'weapon-'+String(row.number).padStart(3,'0'),catalogIds:row.catalogIds||[row.id],
  sourceFacing:row.sourceFacing??shared.sourceFacing,
  name:row.name,canonicalName:row.canonicalName||row.name,category:row.category,imageKey:'weaponV121:'+row.number,
  path:'/assets/openai/equipment/v121-weapons/'+row.file+'-native-v121.png',
  rawPath:'/assets/openai/equipment/v121-weapons/'+row.file+'-native-v121.png',
  sha256:row.sha256,sourceWidth:row.width,sourceHeight:row.height,
  alphaBounds:row.alphaBounds,alphaBoundsThreshold:16,
  gripPivot:{x:row.grip[0]/row.width,y:row.grip[1]/row.height},
  muzzlePivot:{x:row.muzzle[0]/row.width,y:row.muzzle[1]/row.height},
  width:row.displayWidth,height:row.displayWidth*row.height/row.width,
  referenceImageUrl:row.referenceImageUrl||'https://images.squarespace-cdn.com/content/v1/52fd313ee4b0b3c32132e9de/'+row.referenceSuffix,
  legacyAnimation:row.legacyAnimation||null,
  fallbackReason:row.notes+' Adaptation fixe non certifiée 1:1, sans nouvelle animation.'
});
const inspectedAdditionalPlates = [
  {
    "number": 152,
    "id": "weapon-152-type-99-incinerator",
    "name": "Type 99 Incinerator",
    "file": "type99-incinerator",
    "category": "flame",
    "displayWidth": 116,
    "grip": [
      560,
      600
    ],
    "muzzle": [
      1700,
      280
    ],
    "referenceSuffix": "1648070446253-L80TVWUAVLHNGCPX57BC/_Tipe%2B99%2BIncinerator_HP.jpg",
    "notes": "Double poignée, réservoir arrière incliné, fenêtres latérales et tuyau de brûleur conservés.",
    "sha256": "9334d881ac9ab97930cab7769567253891ebc6fd6196a24a7f10ac539b4d5dbf",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      29,
      159,
      1758,
      790
    ]
  },
  {
    "number": 153,
    "id": "weapon-153-am-16-gruppa",
    "name": "AM-16 Gruppa",
    "file": "am16-gruppa",
    "category": "rifle",
    "displayWidth": 112,
    "grip": [
      220,
      620
    ],
    "muzzle": [
      1690,
      350
    ],
    "referenceSuffix": "1648070495693-6IE1RK95CI2AUIAFOG23/_AM-16%2BGruppa_HP.jpg",
    "notes": "Receiver ajouré, traverses de carter, rail et canon prolongé conservés.",
    "sha256": "cf70113aa18225ba6c0cae69d665f12544a3d40b719c74246e26c0752cd86d9e",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      51,
      199,
      1731,
      773
    ]
  },
  {
    "number": 154,
    "id": "weapon-154-microburst",
    "name": "Microburst",
    "file": "microburst",
    "category": "heavy",
    "displayWidth": 128,
    "grip": [
      270,
      530
    ],
    "muzzle": [
      1700,
      375
    ],
    "referenceSuffix": "1648070809340-MGZ9N2F7RCDDVPWTCDOJ/_Microburst_HP.jpg",
    "notes": "Grand carter rectangulaire, poignée supérieure, tambour et crosse ajourée conservés.",
    "sha256": "87bb9d8d6dbb1a28acf600aaccd5136bbbbed7f8e439931561826bafeba1e93a",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      19,
      199,
      1740,
      751
    ]
  },
  {
    "number": 155,
    "id": "weapon-155-rapid-responder",
    "name": "Rapid Responder",
    "file": "rapid-responder",
    "category": "smg",
    "displayWidth": 90,
    "grip": [
      620,
      680
    ],
    "muzzle": [
      1690,
      360
    ],
    "referenceSuffix": "1648070625761-SXJP4ZJKEDG71UVCTYDR/_Rapid%2BResponder_HP.jpg",
    "notes": "Bullpup compact, gros cylindre avant, carter triangulé et viseur reflex conservés.",
    "sha256": "c0b3be048c82fd61eefec437b7a31e16cf0c88730cc58bca4abf270aaba008cb",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      50,
      120,
      1728,
      828
    ]
  },
  {
    "number": 156,
    "id": "weapon-156-type-21-tactical-shotgun",
    "name": "Type 21 Tactical Shotgun",
    "file": "type21-tactical-shotgun",
    "category": "shotgun",
    "displayWidth": 104,
    "grip": [
      160,
      640
    ],
    "muzzle": [
      1620,
      390
    ],
    "referenceSuffix": "1648070641312-7UFEJ44HU7GBK32FTP79/_Type%2B21%2BTactical%2BShotgun_HP.jpg",
    "notes": "Fenêtre allongée, chambre avant ouverte, double trou de bouche et poignée verticale conservés.",
    "sha256": "6cec7c17fa33121866046dd96536036f14c22361d837faeb6f4884f40355626f",
    "width": 1672,
    "height": 941,
    "alphaBounds": [
      44,
      132,
      1654,
      841
    ]
  },
  {
    "number": 157,
    "id": "weapon-157-kramer-short-barrel",
    "name": "Kramer Short-Barrel",
    "file": "kramer-short-barrel",
    "category": "shotgun",
    "displayWidth": 92,
    "grip": [
      280,
      600
    ],
    "muzzle": [
      1700,
      390
    ],
    "referenceSuffix": "1648070690070-PCXU00JCNQUSKE23ZECC/_Kramer%2BShort%2BBarrel_HP.jpg",
    "notes": "Corps court, chambre polygonale à blocs, poignée rainurée et cylindre inférieur conservés.",
    "sha256": "f0105c3425d5ff1f27b0e8c247fe5646cc782a98ca38fe8ba8bea77da3237663",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      39,
      167,
      1733,
      748
    ]
  },
  {
    "number": 158,
    "id": "weapon-158-n79-eva-laser",
    "name": "N79 EVA Laser",
    "file": "n79-eva-laser",
    "category": "sidearm",
    "displayWidth": 80,
    "grip": [
      510,
      760
    ],
    "muzzle": [
      1450,
      420
    ],
    "referenceSuffix": "1648070720082-RECTOXWCJC8ZTORAQHE5/_N79%2BEVA%2BLaser_HP.jpg",
    "notes": "Double cage d’émetteur, tuyau latéral, chambre supérieure et fenêtre conservés.",
    "sha256": "153956540d0fe530607c7b1176350309438e53adf94b049756115ee870cf7b69",
    "width": 1536,
    "height": 1024,
    "alphaBounds": [
      52,
      183,
      1506,
      928
    ]
  },
  {
    "number": 159,
    "id": "weapon-159-l33-pike",
    "name": "L33 Pike",
    "file": "l33-pike",
    "category": "rifle",
    "displayWidth": 126,
    "grip": [
      145,
      580
    ],
    "muzzle": [
      1880,
      330
    ],
    "referenceSuffix": "1648070731016-WW340VMNKY80T6WGWLVY/_L33%2BPike_HP.jpg",
    "notes": "Lunette angulaire, fenêtre allongée, long canon et brace inférieur replié conservés.",
    "sha256": "b2451a99ba835df00f4f949e1d7233d467bcdad9c4e0d4c6bf438f1f1c2112b3",
    "width": 1945,
    "height": 808,
    "alphaBounds": [
      31,
      132,
      1928,
      677
    ]
  },
  {
    "number": 160,
    "id": "weapon-160-eds-93-zadak",
    "name": "EDS-93 Zadak Plasma Discharger",
    "file": "eds93-zadak-plasma-discharger",
    "category": "energy",
    "displayWidth": 120,
    "grip": [
      480,
      600
    ],
    "muzzle": [
      1860,
      360
    ],
    "referenceSuffix": "1692313579237-DB92X90LYEV3FB9EVFAZ/EDS-93-Zadak-Plasma-Discharger_HP.jpg",
    "notes": "Double émetteur, carter ajouré, crosse et témoin cyan conservés.",
    "sha256": "855f30d62951a4b58736c54a181dc8e0796911af659c9d9e374ef079125b7f96",
    "width": 1942,
    "height": 809,
    "alphaBounds": [
      42,
      142,
      1898,
      705
    ]
  },
  {
    "number": 161,
    "id": "weapon-161-thunderbolt-mk2",
    "name": "Thunderbolt Mk.2 Autocannon",
    "file": "thunderbolt-mk2-autocannon",
    "category": "heavy",
    "displayWidth": 132,
    "grip": [
      230,
      530
    ],
    "muzzle": [
      1720,
      440
    ],
    "referenceSuffix": "1692313579781-9GE4HBFWGBXTU7XMUWT8/Thunderbolt-Mk-2-Autocannon_HP.jpg",
    "notes": "Tambour, tubes supérieur et inférieur, canon central et poignée supérieure conservés.",
    "sha256": "d1b4bb491d7c9dcae1e03dce94a3119fd4fa8f707da41a22ba8e2d757806eab3",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      10,
      237,
      1765,
      717
    ]
  },
  {
    "number": 162,
    "id": "weapon-162-x45-bombard",
    "name": "X45 Bombard",
    "canonicalName": "X45 Bombard Flechette Rifle",
    "file": "x45-bombard",
    "category": "rifle",
    "displayWidth": 128,
    "grip": [
      430,
      585
    ],
    "muzzle": [
      1730,
      410
    ],
    "referenceSuffix": "1692313581845-QLL5EFJHPC0XB59SR5GJ/X45-Bombard_HP.jpg",
    "notes": "Chambre cyan, compteur, long tube, brace latéral et bullpup conservés.",
    "sha256": "d952532fb21e81eb99a93de5da34564c03adf124a385ba285db5b4d3b1f6732d",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      21,
      249,
      1757,
      677
    ]
  },
  {
    "number": 163,
    "id": "weapon-163-svat-92-sokol",
    "name": "SVAT-92 Sokol",
    "file": "svat92-sokol",
    "category": "rifle",
    "displayWidth": 118,
    "grip": [
      330,
      470
    ],
    "muzzle": [
      1840,
      310
    ],
    "referenceSuffix": "1692313582807-A1WTL1TWP4A2QKBZ72TC/SVAT-92-Sokol_HP.jpg",
    "notes": "Crosse sculptée, chambre triangulée, poignée ajourée et frein fendu conservés.",
    "sha256": "0eee4d29286bdc5a8f722912b791fa9f69f7000f8a311fb5ce24ab764a8c0df7",
    "width": 1923,
    "height": 818,
    "alphaBounds": [
      45,
      207,
      1885,
      600
    ]
  },
  {
    "number": 164,
    "id": "weapon-164-mark-7-mod2-cqb",
    "name": "Mark 7 Mod 2 CQB Pistol",
    "file": "mark7-mod2-cqb-pistol",
    "category": "sidearm",
    "displayWidth": 76,
    "sourceFacing": -1,
    "grip": [
      1050,
      650
    ],
    "muzzle": [
      130,
      220
    ],
    "referenceSuffix": "1692313584063-91PAZA1PGMFZ8OIHRI2C/Mark-7-Mod-2-CQB-Pistol_HP.jpg",
    "notes": "Compteur arrière, canon court fileté, évents, molette et long chargeur conservés. Fichier primaire intitulé Mark 7 ; cartouche de travail de l’image : Handgun MachinePistol Armat B.",
    "sha256": "4ddc8a543b7e5a2f3a7643aaa911bf58c4e0562f5bb83a05cd6c84dcfa75f0a7",
    "width": 1536,
    "height": 1024,
    "alphaBounds": [
      104,
      43,
      1432,
      999
    ]
  },
  {
    "number": 165,
    "id": "weapon-165-m51-breaching-scattergun",
    "name": "M51 Breaching Scattergun",
    "file": "m51-breaching-scattergun",
    "category": "shotgun",
    "displayWidth": 112,
    "grip": [
      485,
      480
    ],
    "muzzle": [
      1970,
      325
    ],
    "referenceSuffix": "1692313585434-W97YVMXEHRJVOQ8EUHVX/M51_Breaching_Scattergun_HP.jpg",
    "notes": "Crosse large, trois tubes avant, double rangée d’évents et pompe cannelée conservés.",
    "sha256": "70ba01fe490034eb2da1804268f0362028a6d2676315a6fbbfd42186c2b62749",
    "width": 2032,
    "height": 774,
    "alphaBounds": [
      61,
      157,
      1991,
      611
    ]
  },
  {
    "number": 34,
    "name": "Sonic Harpoon",
    "file": "sonic-harpoon",
    "category": "launcher",
    "displayWidth": 110,
    "grip": [
      350,
      620
    ],
    "muzzle": [
      1670,
      380
    ],
    "notes": "Crosse triangulée, poignée brune, tubes perforés, chambre cylindrique inférieure et anneau avant du modèle historique préservés.",
    "sha256": "fb927f7990b207e5307b66806912ac2aea2488af4eb5e852bc4d3352ee730881",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      67,
      104,
      1712,
      839
    ],
    "catalogIds": [
      "weapon-034-sonic-harpoon",
      "weapon-074-sonic-harpoon-field",
      "weapon-114-sonic-harpoon-veteran"
    ],
    "referenceMetadata": {
      "projectOriginal": true,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-original-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/sonic-harpoon-action-sheet.png",
      "referenceLabel": "Atlas original Tantalus inspecté — reconstruction native du modèle du projet",
      "referenceStatus": "PROJECT_ORIGINAL_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "project-original-not-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Création originale Tantalus reconstruite depuis son atlas historique réellement inspecté. Aucun modèle officiel, dimension physique ou détail 1:1 n’est attesté."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/sonic-harpoon-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:34",
      "sheetId": "weapon.sonic-harpoon.action",
      "path": "/assets/openai/sprites/normalized/weapons/sonic-harpoon-action-sheet.png"
    }
  },
  {
    "number": 35,
    "name": "Neuro-Link Disruptor",
    "file": "neuro-link-disruptor",
    "category": "sidearm",
    "displayWidth": 82,
    "grip": [
      310,
      790
    ],
    "muzzle": [
      1410,
      370
    ],
    "notes": "Poignée compacte, câble supérieur, indicateurs et cage double d’émetteur du modèle historique préservés.",
    "sha256": "b12a981651396ff32e4e3b7fcd1a02e17221b6deeb550487f79d087cc8d74c43",
    "width": 1536,
    "height": 1024,
    "alphaBounds": [
      72,
      151,
      1490,
      969
    ],
    "catalogIds": [
      "weapon-035-neuro-link-disruptor",
      "weapon-075-neuro-link-disruptor-field",
      "weapon-115-neuro-link-disruptor-veteran"
    ],
    "referenceMetadata": {
      "projectOriginal": true,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-original-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/neuro-link-disruptor-action-sheet.png",
      "referenceLabel": "Atlas original Tantalus inspecté — reconstruction native du modèle du projet",
      "referenceStatus": "PROJECT_ORIGINAL_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "project-original-not-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Création originale Tantalus reconstruite depuis son atlas historique réellement inspecté. Aucun modèle officiel, dimension physique ou détail 1:1 n’est attesté."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/neuro-link-disruptor-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:35",
      "sheetId": "weapon.neuro-link-disruptor.action",
      "path": "/assets/openai/sprites/normalized/weapons/neuro-link-disruptor-action-sheet.png"
    }
  },
  {
    "number": 36,
    "name": "Ripper Acid Projector",
    "file": "ripper-acid-projector",
    "category": "launcher",
    "displayWidth": 112,
    "grip": [
      290,
      730
    ],
    "muzzle": [
      1460,
      400
    ],
    "notes": "Double réservoir sous le carter, tuyaux, deux brides verticales et ensemble de buses du modèle historique préservés.",
    "sha256": "8434d1837e335ecac54da0dffbdbba7d32c5d28b2cef32e88a062e13a5e3a84e",
    "width": 1536,
    "height": 1024,
    "alphaBounds": [
      53,
      144,
      1509,
      904
    ],
    "catalogIds": [
      "weapon-036-ripper-acid-projector",
      "weapon-076-ripper-acid-projector-field",
      "weapon-116-ripper-acid-projector-veteran"
    ],
    "referenceMetadata": {
      "projectOriginal": true,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-original-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/ripper-acid-projector-action-sheet.png",
      "referenceLabel": "Atlas original Tantalus inspecté — reconstruction native du modèle du projet",
      "referenceStatus": "PROJECT_ORIGINAL_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "project-original-not-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Création originale Tantalus reconstruite depuis son atlas historique réellement inspecté. Aucun modèle officiel, dimension physique ou détail 1:1 n’est attesté."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/ripper-acid-projector-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:36",
      "sheetId": "weapon.ripper-acid-projector.action",
      "path": "/assets/openai/sprites/normalized/weapons/ripper-acid-projector-action-sheet.png"
    }
  },
  {
    "number": 37,
    "name": "Reef Caster",
    "file": "reef-caster",
    "category": "launcher",
    "displayWidth": 112,
    "grip": [
      415,
      650
    ],
    "muzzle": [
      1625,
      420
    ],
    "notes": "Carter cannelé bleu-gris, chambre ronde, lignes cyan et petit réservoir inférieur du modèle historique préservés.",
    "sha256": "bee1050553f060ef0f9900f43a968acb092d5228f95b7bf7397274bfd83c429c",
    "width": 1717,
    "height": 916,
    "alphaBounds": [
      57,
      100,
      1673,
      812
    ],
    "catalogIds": [
      "weapon-037-reef-caster",
      "weapon-077-reef-caster-field",
      "weapon-117-reef-caster-veteran"
    ],
    "referenceMetadata": {
      "projectOriginal": true,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-original-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/reef-caster-action-sheet.png",
      "referenceLabel": "Atlas original Tantalus inspecté — reconstruction native du modèle du projet",
      "referenceStatus": "PROJECT_ORIGINAL_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "project-original-not-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Création originale Tantalus reconstruite depuis son atlas historique réellement inspecté. Aucun modèle officiel, dimension physique ou détail 1:1 n’est attesté."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/reef-caster-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:37",
      "sheetId": "weapon.reef-caster.action",
      "path": "/assets/openai/sprites/normalized/weapons/reef-caster-action-sheet.png"
    }
  },
  {
    "number": 38,
    "name": "Foundry Nailgun",
    "file": "foundry-nailgun",
    "category": "sidearm",
    "displayWidth": 86,
    "grip": [
      270,
      740
    ],
    "muzzle": [
      1460,
      350
    ],
    "notes": "Corps rectangulaire noir, indicateur orange, poignée inclinée, magasin droit et bague de nez du modèle historique préservés.",
    "sha256": "b9d9f3ff375fa0e3c653985cf87b80cc7e5fac9bd7f44f04288c63b75ff2489b",
    "width": 1536,
    "height": 1024,
    "alphaBounds": [
      81,
      60,
      1499,
      969
    ],
    "catalogIds": [
      "weapon-038-foundry-nailgun",
      "weapon-078-foundry-nailgun-field",
      "weapon-118-foundry-nailgun-veteran"
    ],
    "referenceMetadata": {
      "projectOriginal": true,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-original-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/foundry-nailgun-action-sheet.png",
      "referenceLabel": "Atlas original Tantalus inspecté — reconstruction native du modèle du projet",
      "referenceStatus": "PROJECT_ORIGINAL_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "project-original-not-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Création originale Tantalus reconstruite depuis son atlas historique réellement inspecté. Aucun modèle officiel, dimension physique ou détail 1:1 n’est attesté."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/foundry-nailgun-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:38",
      "sheetId": "weapon.foundry-nailgun.action",
      "path": "/assets/openai/sprites/normalized/weapons/foundry-nailgun-action-sheet.png"
    }
  },
  {
    "number": 39,
    "name": "Cryo Lance",
    "file": "cryo-lance",
    "category": "launcher",
    "displayWidth": 110,
    "grip": [
      155,
      515
    ],
    "muzzle": [
      1670,
      350
    ],
    "notes": "Poignée-crosse fermée, carter ivoire, tuyau cuivre, réservoir horizontal et deux branches avant du modèle historique préservés.",
    "sha256": "8599767e4e32b13f9345f1f630a27ee388279f299369ad25541f52235e7d0c58",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      66,
      110,
      1731,
      799
    ],
    "catalogIds": [
      "weapon-039-cryo-lance",
      "weapon-079-cryo-lance-field",
      "weapon-119-cryo-lance-veteran"
    ],
    "referenceMetadata": {
      "projectOriginal": true,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-original-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/cryo-lance-action-sheet.png",
      "referenceLabel": "Atlas original Tantalus inspecté — reconstruction native du modèle du projet",
      "referenceStatus": "PROJECT_ORIGINAL_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "project-original-not-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Création originale Tantalus reconstruite depuis son atlas historique réellement inspecté. Aucun modèle officiel, dimension physique ou détail 1:1 n’est attesté."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/cryo-lance-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:39",
      "sheetId": "weapon.cryo-lance.action",
      "path": "/assets/openai/sprites/normalized/weapons/cryo-lance-action-sheet.png"
    }
  },
  {
    "number": 40,
    "name": "Pathogen Containment Projector",
    "file": "pathogen-containment-projector",
    "category": "launcher",
    "displayWidth": 110,
    "grip": [
      195,
      690
    ],
    "muzzle": [
      1430,
      315
    ],
    "notes": "Panneaux ivoire, poignée noire, chambre avant, réservoir inférieur et marquage de sécurité du modèle historique préservés.",
    "sha256": "743cbe44d5faf0e16db7d5b5fc9a6fc8d12ab36451bf710146799f527889e2c0",
    "width": 1536,
    "height": 1024,
    "alphaBounds": [
      58,
      129,
      1462,
      938
    ],
    "catalogIds": [
      "weapon-040-pathogen-containment-projector",
      "weapon-080-pathogen-containment-projector-field",
      "weapon-120-pathogen-containment-projector-veteran"
    ],
    "referenceMetadata": {
      "projectOriginal": true,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-original-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/pathogen-containment-projector-action-sheet.png",
      "referenceLabel": "Atlas original Tantalus inspecté — reconstruction native du modèle du projet",
      "referenceStatus": "PROJECT_ORIGINAL_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "project-original-not-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Création originale Tantalus reconstruite depuis son atlas historique réellement inspecté. Aucun modèle officiel, dimension physique ou détail 1:1 n’est attesté."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/pathogen-containment-projector-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:40",
      "sheetId": "weapon.pathogen-containment-projector.action",
      "path": "/assets/openai/sprites/normalized/weapons/pathogen-containment-projector-action-sheet.png"
    }
  },
  {
    "number": 29,
    "id": "weapon-029-cutting-torch",
    "name": "Cutting Torch",
    "file": "cutting-torch",
    "category": "tool",
    "displayWidth": 78,
    "grip": [
      360,
      650
    ],
    "muzzle": [
      1420,
      313
    ],
    "notes": "Silhouette et pièces du modèle historique Cutting Torch préservées ; géométrie canonique externe non attestée.",
    "sha256": "23739cc45fc220dd1e691ee3a3311c6a38d7e0f3f11b9d911b2be0042b90848c",
    "width": 1536,
    "height": 1024,
    "alphaBounds": [
      117,
      23,
      1448,
      1003
    ],
    "catalogIds": [
      "weapon-029-cutting-torch",
      "weapon-069-cutting-torch-field",
      "weapon-109-cutting-torch-veteran"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/cutting-torch-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu, depuis son atlas historique réellement inspecté. Aucun accessoire précis du film ou du jeu source, dimension physique ou détail 1:1 ne sont certifiés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/cutting-torch-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:29",
      "sheetId": "weapon.cutting-torch.action",
      "path": "/assets/openai/sprites/normalized/weapons/cutting-torch-action-sheet.png"
    }
  },
  {
    "number": 30,
    "id": "weapon-030-maintenance-jack",
    "name": "Maintenance Jack",
    "file": "maintenance-jack",
    "category": "tool",
    "displayWidth": 54,
    "grip": [
      510,
      1230
    ],
    "muzzle": [
      510,
      195
    ],
    "notes": "Silhouette et pièces du modèle historique Maintenance Jack préservées ; géométrie canonique externe non attestée.",
    "sha256": "4ebbb14a20213b5f0ebe196a7be8c370d46449f73d3a727fc7c8b2436c3c0980",
    "width": 1024,
    "height": 1536,
    "alphaBounds": [
      319,
      74,
      704,
      1460
    ],
    "catalogIds": [
      "weapon-030-maintenance-jack",
      "weapon-070-maintenance-jack-field",
      "weapon-110-maintenance-jack-veteran"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/maintenance-jack-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu, depuis son atlas historique réellement inspecté. Aucun accessoire précis du film ou du jeu source, dimension physique ou détail 1:1 ne sont certifiés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/maintenance-jack-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:30",
      "sheetId": "weapon.maintenance-jack.action",
      "path": "/assets/openai/sprites/normalized/weapons/maintenance-jack-action-sheet.png"
    }
  },
  {
    "number": 31,
    "id": "weapon-031-fire-axe",
    "name": "Fire Axe",
    "file": "fire-axe",
    "category": "melee",
    "displayWidth": 56,
    "grip": [
      505,
      1160
    ],
    "muzzle": [
      880,
      280
    ],
    "notes": "Silhouette et pièces du modèle historique Fire Axe préservées ; géométrie canonique externe non attestée.",
    "sha256": "ff6bb728e9252e4d8f9ad23277d6e8aa0f5ddf07df72d41e79aea8674dc0bbac",
    "width": 1024,
    "height": 1536,
    "alphaBounds": [
      145,
      95,
      901,
      1472
    ],
    "catalogIds": [
      "weapon-031-fire-axe",
      "weapon-071-fire-axe-field",
      "weapon-111-fire-axe-veteran"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/fire-axe-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu, depuis son atlas historique réellement inspecté. Aucun accessoire précis du film ou du jeu source, dimension physique ou détail 1:1 ne sont certifiés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/fire-axe-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:31",
      "sheetId": "weapon.fire-axe.action",
      "path": "/assets/openai/sprites/normalized/weapons/fire-axe-action-sheet.png"
    }
  },
  {
    "number": 32,
    "id": "weapon-032-combat-knife",
    "name": "Combat Knife",
    "file": "combat-knife",
    "category": "melee",
    "displayWidth": 72,
    "sourceFacing": 1,
    "grip": [
      470,
      425
    ],
    "muzzle": [
      1640,
      440
    ],
    "notes": "Spécimen du couteau de Hicks (Scalemead Survival) choisi comme représentation de l’entrée générique Combat Knife, sans attester leur équivalence canonique.",
    "sha256": "4e1275cf266ce70532a524dd1c11a8b259c28621b41f655db495c9d45626f3b6",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      74,
      289,
      1699,
      596
    ],
    "catalogIds": [
      "weapon-032-combat-knife",
      "weapon-072-combat-knife-field",
      "weapon-112-combat-knife-veteran"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Aliens (1986)",
      "sourceProvenance": "production-prop-auction-photograph",
      "referenceSource": "photographed-production-specimen",
      "referenceUrl": "https://propstoreauction.com/lot-details/index/catalog/359/lot/118646/Lot-9-ALIENS-1986-Corporal-Dwayne-Hicks-Michael-Biehn-Knife",
      "referenceLabel": "Spécimen de production inspecté",
      "referenceStatus": "PRODUCTION_SPECIMEN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "reference-reconstruction-not-certified",
      "referenceCaveat": "Photographie Propstore du couteau de Hicks inspectée. L’entrée Combat Knife est générique : le spécimen choisi est représentatif, pas une identité nominale canonique prouvée. Détails et dimensions du rendu non certifiés."
    },
    "referenceImageUrl": "https://propstoreauction.com/images/lot/6783/678353_xl.jpg?ts=1746211596",
    "legacyAnimation": {
      "imageKey": "weaponV61:32",
      "sheetId": "weapon.combat-knife.action",
      "path": "/assets/openai/sprites/normalized/weapons/combat-knife-action-sheet.png"
    }
  },
  {
    "number": 14,
    "id": "weapon-014-m40-hedp-grenade",
    "name": "M40 HEDP Grenade",
    "file": "m40-hedp-grenade",
    "category": "explosive",
    "displayWidth": 46,
    "sourceFacing": 1,
    "grip": [
      620,
      770
    ],
    "muzzle": [
      620,
      175
    ],
    "notes": "Silhouette et pièces du modèle historique M40 HEDP Grenade préservées ; géométrie canonique externe non attestée.",
    "sha256": "a98e3ab91ac3c644250cc89253641260f12384c9be3c705c977e2cabca58ccee",
    "width": 1217,
    "height": 1293,
    "alphaBounds": [
      420,
      112,
      801,
      1183
    ],
    "catalogIds": [
      "weapon-014-m40-hedp-grenade",
      "weapon-054-m40-hedp-grenade-field",
      "weapon-094-m40-hedp-grenade-veteran",
      "weapon-134-m40-hedp-grenade-prototype"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Aliens (1986)",
      "sourceProvenance": "production-prop-dealer-photograph",
      "referenceSource": "photographed-production-specimen",
      "referenceUrl": "https://heroprop.com/product/aliens-hero-m40-hdep-grenade/",
      "referenceLabel": "Spécimen de production inspecté",
      "referenceStatus": "PRODUCTION_SPECIMEN_ADAPTATION",
      "identityVerified": true,
      "identityStatus": "reference-reconstruction",
      "geometryStatus": "reference-reconstruction-not-certified",
      "referenceCaveat": "Spécimen de production réellement inspecté. Adaptation fixe non certifiée 1:1 ; géométrie, détails et dimensions du rendu ne sont pas attestés."
    },
    "referenceImageUrl": "https://heroprop.com/wp-content/uploads/2019/09/Aliens-Hero-Movie-Prop-M40-HDEP-Grenade-600x588.jpg",
    "legacyAnimation": {
      "imageKey": "weaponV61:14",
      "sheetId": "weapon.m40-hedp-grenade.action",
      "path": "/assets/openai/sprites/normalized/weapons/m40-hedp-grenade-action-sheet.png"
    }
  },
  {
    "number": 33,
    "id": "weapon-033-stun-baton",
    "name": "Stun Baton",
    "file": "stun-baton",
    "category": "melee",
    "displayWidth": 92,
    "sourceFacing": 1,
    "grip": [
      210,
      450
    ],
    "muzzle": [
      1700,
      403
    ],
    "notes": "Silhouette et pièces du modèle historique Stun Baton préservées ; géométrie canonique externe non attestée.",
    "sha256": "d9169e399eaf556ad885e5a69bc25cb1b0a0c8d476a49352f4644e0e9f230657",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      79,
      349,
      1719,
      553
    ],
    "catalogIds": [
      "weapon-033-stun-baton",
      "weapon-073-stun-baton-field",
      "weapon-113-stun-baton-veteran"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/stun-baton-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu depuis son atlas historique inspecté. Géométrie canonique externe, dimension physique et détails 1:1 non attestés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/stun-baton-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:33",
      "sheetId": "weapon.stun-baton.action",
      "path": "/assets/openai/sprites/normalized/weapons/stun-baton-action-sheet.png"
    }
  },
  {
    "number": 2,
    "id": "weapon-002-m41a2-pulse-rifle",
    "name": "M41A2 Pulse Rifle",
    "file": "m41a2-pulse-rifle",
    "category": "rifle",
    "displayWidth": 112,
    "sourceFacing": 1,
    "grip": [
      520,
      550
    ],
    "muzzle": [
      1690,
      340
    ],
    "notes": "Silhouette et pièces du modèle historique M41A2 Pulse Rifle préservées ; géométrie canonique externe non attestée.",
    "sha256": "9f129e6552bc5b0075b01f97d1145ae5cfd71a1e1e3e11a538dc8c947ad8d7bc",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      59,
      43,
      1720,
      841
    ],
    "catalogIds": [
      "weapon-002-m41a2-pulse-rifle",
      "weapon-042-m41a2-pulse-rifle-field",
      "weapon-082-m41a2-pulse-rifle-veteran",
      "weapon-122-m41a2-pulse-rifle-prototype"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/m41a2-pulse-rifle-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu depuis son atlas historique inspecté. Géométrie canonique externe, dimension physique et détails 1:1 non attestés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/m41a2-pulse-rifle-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:2",
      "sheetId": "weapon.m41a2-pulse-rifle.action",
      "path": "/assets/openai/sprites/normalized/weapons/m41a2-pulse-rifle-action-sheet.png"
    }
  },
  {
    "number": 3,
    "id": "weapon-003-m4a3-service-pistol",
    "name": "M4A3 Service Pistol",
    "file": "m4a3-service-pistol",
    "category": "sidearm",
    "displayWidth": 74,
    "sourceFacing": 1,
    "grip": [
      340,
      620
    ],
    "muzzle": [
      1430,
      200
    ],
    "notes": "Silhouette et pièces du modèle historique M4A3 Service Pistol préservées ; géométrie canonique externe non attestée.",
    "sha256": "62ba5b4a5f999fb7bd7854c2326c73ce052f106dcb7b9050a7f803765d0632e3",
    "width": 1536,
    "height": 1024,
    "alphaBounds": [
      92,
      115,
      1454,
      934
    ],
    "catalogIds": [
      "weapon-003-m4a3-service-pistol",
      "weapon-043-m4a3-service-pistol-field",
      "weapon-083-m4a3-service-pistol-veteran",
      "weapon-123-m4a3-service-pistol-prototype"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/m4a3-service-pistol-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu depuis son atlas historique inspecté. Géométrie canonique externe, dimension physique et détails 1:1 non attestés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/m4a3-service-pistol-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:3",
      "sheetId": "weapon.m4a3-service-pistol.action",
      "path": "/assets/openai/sprites/normalized/weapons/m4a3-service-pistol-action-sheet.png"
    }
  },
  {
    "number": 7,
    "id": "weapon-007-m37a2-pump-shotgun",
    "name": "M37A2 Pump Shotgun",
    "file": "m37a2-pump-shotgun",
    "category": "shotgun",
    "displayWidth": 104,
    "sourceFacing": 1,
    "grip": [
      160,
      680
    ],
    "muzzle": [
      1450,
      365
    ],
    "notes": "Silhouette et pièces du modèle historique M37A2 Pump Shotgun préservées ; géométrie canonique externe non attestée.",
    "sha256": "48ce84beec207e5c5f76ff907e12b402a725baa51f38ec92283d9964adca8a5a",
    "width": 1536,
    "height": 1024,
    "alphaBounds": [
      46,
      266,
      1490,
      872
    ],
    "catalogIds": [
      "weapon-007-m37a2-pump-shotgun",
      "weapon-047-m37a2-pump-shotgun-field",
      "weapon-087-m37a2-pump-shotgun-veteran",
      "weapon-127-m37a2-pump-shotgun-prototype"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/m37a2-pump-shotgun-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu depuis son atlas historique inspecté. Géométrie canonique externe, dimension physique et détails 1:1 non attestés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/m37a2-pump-shotgun-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:7",
      "sheetId": "weapon.m37a2-pump-shotgun.action",
      "path": "/assets/openai/sprites/normalized/weapons/m37a2-pump-shotgun-action-sheet.png"
    }
  },
  {
    "number": 8,
    "id": "weapon-008-m39-submachine-gun",
    "name": "M39 Submachine Gun",
    "file": "m39-submachine-gun",
    "category": "smg",
    "displayWidth": 92,
    "sourceFacing": 1,
    "grip": [
      635,
      650
    ],
    "muzzle": [
      1475,
      355
    ],
    "notes": "Silhouette et pièces du modèle historique M39 Submachine Gun préservées ; géométrie canonique externe non attestée.",
    "sha256": "2ba072ac8c7903856a3db09ac0ede5efa17ce9bedd921f9c4d65ade3e10925f1",
    "width": 1536,
    "height": 1024,
    "alphaBounds": [
      48,
      128,
      1510,
      948
    ],
    "catalogIds": [
      "weapon-008-m39-submachine-gun",
      "weapon-048-m39-submachine-gun-field",
      "weapon-088-m39-submachine-gun-veteran",
      "weapon-128-m39-submachine-gun-prototype"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/m39-submachine-gun-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu depuis son atlas historique inspecté. Géométrie canonique externe, dimension physique et détails 1:1 non attestés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/m39-submachine-gun-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:8",
      "sheetId": "weapon.m39-submachine-gun.action",
      "path": "/assets/openai/sprites/normalized/weapons/m39-submachine-gun-action-sheet.png"
    }
  },
  {
    "number": 9,
    "id": "weapon-009-m42a-scope-rifle",
    "name": "M42A Scope Rifle",
    "file": "m42a-scope-rifle",
    "category": "sniper",
    "displayWidth": 118,
    "sourceFacing": 1,
    "grip": [
      470,
      620
    ],
    "muzzle": [
      1690,
      385
    ],
    "notes": "Silhouette et pièces du modèle historique M42A Scope Rifle préservées ; géométrie canonique externe non attestée.",
    "sha256": "26afb15185c318b1bb221ec3e9cb95ea65f9caeff0d29c3503ec80362cf498c5",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      57,
      129,
      1718,
      758
    ],
    "catalogIds": [
      "weapon-009-m42a-scope-rifle",
      "weapon-049-m42a-scope-rifle-field",
      "weapon-089-m42a-scope-rifle-veteran",
      "weapon-129-m42a-scope-rifle-prototype"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/m42a-scope-rifle-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu depuis son atlas historique inspecté. Géométrie canonique externe, dimension physique et détails 1:1 non attestés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/m42a-scope-rifle-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:9",
      "sheetId": "weapon.m42a-scope-rifle.action",
      "path": "/assets/openai/sprites/normalized/weapons/m42a-scope-rifle-action-sheet.png"
    }
  },
  {
    "number": 22,
    "id": "weapon-022-bolt-gun",
    "name": "Bolt Gun",
    "file": "bolt-gun",
    "category": "tool",
    "displayWidth": 108,
    "sourceFacing": 1,
    "grip": [
      160,
      670
    ],
    "muzzle": [
      1710,
      350
    ],
    "notes": "Silhouette et pièces du modèle historique Bolt Gun préservées ; géométrie canonique externe non attestée.",
    "sha256": "65753073200fabecff4fec1fd43775a9104689a322415179198cf2da07325105",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      47,
      61,
      1742,
      839
    ],
    "catalogIds": [
      "weapon-022-bolt-gun",
      "weapon-062-bolt-gun-field",
      "weapon-102-bolt-gun-veteran",
      "weapon-142-bolt-gun-prototype"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/bolt-gun-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu depuis son atlas historique inspecté. Géométrie canonique externe, dimension physique et détails 1:1 non attestés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/bolt-gun-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:22",
      "sheetId": "weapon.bolt-gun.action",
      "path": "/assets/openai/sprites/normalized/weapons/bolt-gun-action-sheet.png"
    }
  },
  {
    "number": 10,
    "id": "weapon-010-m6b-rocket-launcher",
    "name": "M6B Rocket Launcher",
    "file": "m6b-rocket-launcher",
    "category": "launcher",
    "displayWidth": 120,
    "sourceFacing": 1,
    "grip": [
      430,
      740
    ],
    "muzzle": [
      1420,
      420
    ],
    "notes": "Silhouette et pièces du modèle historique M6B Rocket Launcher préservées ; géométrie canonique externe non attestée.",
    "sha256": "a555e6a1c451640c9b31c9669898d29be36f8e5cc37db9862145617d681252a3",
    "width": 1536,
    "height": 1024,
    "alphaBounds": [
      70,
      139,
      1488,
      893
    ],
    "catalogIds": [
      "weapon-010-m6b-rocket-launcher",
      "weapon-050-m6b-rocket-launcher-field",
      "weapon-090-m6b-rocket-launcher-veteran",
      "weapon-130-m6b-rocket-launcher-prototype"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/m6b-rocket-launcher-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu depuis son atlas historique inspecté. Géométrie canonique externe, dimension physique et détails 1:1 non attestés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/m6b-rocket-launcher-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:10",
      "sheetId": "weapon.m6b-rocket-launcher.action",
      "path": "/assets/openai/sprites/normalized/weapons/m6b-rocket-launcher-action-sheet.png"
    }
  },
  {
    "number": 11,
    "id": "weapon-011-m83-sadar",
    "name": "M83 SADAR",
    "file": "m83-sadar",
    "category": "launcher",
    "displayWidth": 124,
    "sourceFacing": 1,
    "grip": [
      700,
      795
    ],
    "muzzle": [
      1620,
      480
    ],
    "notes": "Silhouette et pièces du modèle historique M83 SADAR préservées ; géométrie canonique externe non attestée.",
    "sha256": "5d764dd303c4c293687564e1219423b842cd06a41402bdde8ac03419ba697dfc",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      136,
      70,
      1650,
      834
    ],
    "catalogIds": [
      "weapon-011-m83-sadar",
      "weapon-051-m83-sadar-field",
      "weapon-091-m83-sadar-veteran",
      "weapon-131-m83-sadar-prototype"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/m83-sadar-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu depuis son atlas historique inspecté. Géométrie canonique externe, dimension physique et détails 1:1 non attestés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/m83-sadar-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:11",
      "sheetId": "weapon.m83-sadar.action",
      "path": "/assets/openai/sprites/normalized/weapons/m83-sadar-action-sheet.png"
    }
  },
  {
    "number": 12,
    "id": "weapon-012-m5-rpg",
    "name": "M5 RPG",
    "file": "m5-rpg",
    "category": "launcher",
    "displayWidth": 118,
    "sourceFacing": 1,
    "grip": [
      620,
      790
    ],
    "muzzle": [
      1440,
      430
    ],
    "notes": "Silhouette et pièces du modèle historique M5 RPG préservées ; géométrie canonique externe non attestée.",
    "sha256": "d30c7ce62ccf5aa75d628e1f15554fb54ff05e6b0e214864b6885ede02f7bbb7",
    "width": 1536,
    "height": 1024,
    "alphaBounds": [
      90,
      148,
      1479,
      905
    ],
    "catalogIds": [
      "weapon-012-m5-rpg",
      "weapon-052-m5-rpg-field",
      "weapon-092-m5-rpg-veteran",
      "weapon-132-m5-rpg-prototype"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/m5-rpg-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu depuis son atlas historique inspecté. Géométrie canonique externe, dimension physique et détails 1:1 non attestés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/m5-rpg-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:12",
      "sheetId": "weapon.m5-rpg.action",
      "path": "/assets/openai/sprites/normalized/weapons/m5-rpg-action-sheet.png"
    }
  },
  {
    "number": 17,
    "id": "weapon-017-f44aa-pulse-rifle",
    "name": "F44AA Pulse Rifle",
    "file": "f44aa-pulse-rifle",
    "category": "rifle",
    "displayWidth": 112,
    "sourceFacing": 1,
    "grip": [
      600,
      620
    ],
    "muzzle": [
      1700,
      370
    ],
    "notes": "Silhouette et pièces du modèle historique F44AA Pulse Rifle préservées ; géométrie canonique externe non attestée.",
    "sha256": "5d4dbeb0712cd7ace1db9422cd2d79256173350de396be132eb0aa214a1fc793",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      55,
      136,
      1738,
      802
    ],
    "catalogIds": [
      "weapon-017-f44aa-pulse-rifle",
      "weapon-057-f44aa-pulse-rifle-field",
      "weapon-097-f44aa-pulse-rifle-veteran",
      "weapon-137-f44aa-pulse-rifle-prototype"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/f44aa-pulse-rifle-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu depuis son atlas historique inspecté. Géométrie canonique externe, dimension physique et détails 1:1 non attestés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/f44aa-pulse-rifle-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:17",
      "sheetId": "weapon.f44aa-pulse-rifle.action",
      "path": "/assets/openai/sprites/normalized/weapons/f44aa-pulse-rifle-action-sheet.png"
    }
  },
  {
    "number": 18,
    "id": "weapon-018-type-88-heavy-assault-rifle",
    "name": "Type 88 Heavy Assault Rifle",
    "file": "type-88-heavy-assault-rifle",
    "category": "rifle",
    "displayWidth": 118,
    "sourceFacing": 1,
    "grip": [
      640,
      600
    ],
    "muzzle": [
      1680,
      410
    ],
    "notes": "Silhouette et pièces du modèle historique Type 88 Heavy Assault Rifle préservées ; géométrie canonique externe non attestée.",
    "sha256": "841c80931af1b961b7efa0c9d12384ddd82d06f7006f2fe851675918e146f88d",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      62,
      45,
      1717,
      845
    ],
    "catalogIds": [
      "weapon-018-type-88-heavy-assault-rifle",
      "weapon-058-type-88-heavy-assault-rifle-field",
      "weapon-098-type-88-heavy-assault-rifle-veteran",
      "weapon-138-type-88-heavy-assault-rifle-prototype"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/type-88-heavy-assault-rifle-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu depuis son atlas historique inspecté. Géométrie canonique externe, dimension physique et détails 1:1 non attestés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/type-88-heavy-assault-rifle-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:18",
      "sheetId": "weapon.type-88-heavy-assault-rifle.action",
      "path": "/assets/openai/sprites/normalized/weapons/type-88-heavy-assault-rifle-action-sheet.png"
    }
  },
  {
    "number": 19,
    "id": "weapon-019-ak-4047-pulse-rifle",
    "name": "AK-4047 Pulse Rifle",
    "file": "ak-4047-pulse-rifle",
    "category": "rifle",
    "displayWidth": 110,
    "sourceFacing": 1,
    "grip": [
      370,
      630
    ],
    "muzzle": [
      1450,
      430
    ],
    "notes": "Silhouette et pièces du modèle historique AK-4047 Pulse Rifle préservées ; géométrie canonique externe non attestée.",
    "sha256": "ca67d401200d677089d5c340bb2278db022057d5084c91f01db92d39169635d1",
    "width": 1536,
    "height": 1024,
    "alphaBounds": [
      45,
      246,
      1498,
      876
    ],
    "catalogIds": [
      "weapon-019-ak-4047-pulse-rifle",
      "weapon-059-ak-4047-pulse-rifle-field",
      "weapon-099-ak-4047-pulse-rifle-veteran",
      "weapon-139-ak-4047-pulse-rifle-prototype"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/ak-4047-pulse-rifle-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu depuis son atlas historique inspecté. Géométrie canonique externe, dimension physique et détails 1:1 non attestés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/ak-4047-pulse-rifle-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:19",
      "sheetId": "weapon.ak-4047-pulse-rifle.action",
      "path": "/assets/openai/sprites/normalized/weapons/ak-4047-pulse-rifle-action-sheet.png"
    }
  },
  {
    "number": 21,
    "id": "weapon-021-357-magnum-revolver",
    "name": ".357 Magnum Revolver",
    "file": "357-magnum-revolver",
    "category": "sidearm",
    "displayWidth": 78,
    "sourceFacing": 1,
    "grip": [
      310,
      730
    ],
    "muzzle": [
      1460,
      300
    ],
    "notes": "Silhouette et pièces du modèle historique .357 Magnum Revolver préservées ; géométrie canonique externe non attestée.",
    "sha256": "b560e6a1a496e733f990288a163e91e35465b0b23e166a66e27d4fccf3ce9bad",
    "width": 1536,
    "height": 1024,
    "alphaBounds": [
      53,
      82,
      1502,
      985
    ],
    "catalogIds": [
      "weapon-021-357-magnum-revolver",
      "weapon-061-357-magnum-revolver-field",
      "weapon-101-357-magnum-revolver-veteran",
      "weapon-141-357-magnum-revolver-prototype"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/357-magnum-revolver-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu depuis son atlas historique inspecté. Géométrie canonique externe, dimension physique et détails 1:1 non attestés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/357-magnum-revolver-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:21",
      "sheetId": "weapon.357-magnum-revolver.action",
      "path": "/assets/openai/sprites/normalized/weapons/357-magnum-revolver-action-sheet.png"
    }
  },
  {
    "number": 24,
    "id": "weapon-024-harpoon-gun",
    "name": "Harpoon Gun",
    "file": "harpoon-gun",
    "category": "grappling",
    "displayWidth": 96,
    "sourceFacing": 1,
    "grip": [
      270,
      770
    ],
    "muzzle": [
      1420,
      420
    ],
    "notes": "Silhouette et pièces du modèle historique Harpoon Gun préservées ; géométrie canonique externe non attestée.",
    "sha256": "4cb7a2e213def1116d63ecd1ac50c3364717e5e00956c6c36631b83ca1ad80e5",
    "width": 1536,
    "height": 1024,
    "alphaBounds": [
      130,
      151,
      1468,
      936
    ],
    "catalogIds": [
      "weapon-024-harpoon-gun",
      "weapon-064-harpoon-gun-field",
      "weapon-104-harpoon-gun-veteran",
      "weapon-144-harpoon-gun-prototype"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/asso-400-harpoon-gun-action-sheet-v63.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu depuis son atlas historique inspecté. Géométrie canonique externe, dimension physique et détails 1:1 non attestés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/asso-400-harpoon-gun-action-sheet-v63.png",
    "legacyAnimation": {
      "imageKey": "weaponV63:24",
      "sheetId": "weapon.asso-400-harpoon-gun.action.v63",
      "path": "/assets/openai/sprites/normalized/weapons/asso-400-harpoon-gun-action-sheet-v63.png"
    }
  },
  {
    "number": 26,
    "id": "weapon-026-combi-stick",
    "name": "Combi-Stick",
    "file": "combi-stick",
    "category": "melee",
    "displayWidth": 124,
    "sourceFacing": 1,
    "grip": [
      1080,
      340
    ],
    "muzzle": [
      2050,
      350
    ],
    "notes": "Silhouette et pièces du modèle historique Combi-Stick préservées ; géométrie canonique externe non attestée.",
    "sha256": "b471d53a1aed6ef7cc9499546aa9e43c2bb8b2e6497c4e14eaaa52471a3a75b5",
    "width": 2172,
    "height": 724,
    "alphaBounds": [
      85,
      259,
      2087,
      446
    ],
    "catalogIds": [
      "weapon-026-combi-stick",
      "weapon-066-combi-stick-field",
      "weapon-106-combi-stick-veteran",
      "weapon-146-combi-stick-prototype"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/combi-stick-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu depuis son atlas historique inspecté. Géométrie canonique externe, dimension physique et détails 1:1 non attestés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/combi-stick-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:26",
      "sheetId": "weapon.combi-stick.action",
      "path": "/assets/openai/sprites/normalized/weapons/combi-stick-action-sheet.png"
    }
  },
  {
    "number": 27,
    "id": "weapon-027-smart-disc",
    "name": "Smart Disc",
    "file": "smart-disc",
    "category": "melee",
    "displayWidth": 70,
    "sourceFacing": 1,
    "grip": [
      740,
      530
    ],
    "muzzle": [
      1170,
      535
    ],
    "notes": "Silhouette et pièces du modèle historique Smart Disc préservées ; géométrie canonique externe non attestée.",
    "sha256": "d698e110b295b5b125ad59d2ad4e33fbb15e34a8deeac5d342fefcd3053d1c7d",
    "width": 1448,
    "height": 1086,
    "alphaBounds": [
      240,
      99,
      1208,
      990
    ],
    "catalogIds": [
      "weapon-027-smart-disc",
      "weapon-067-smart-disc-field",
      "weapon-107-smart-disc-veteran"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/smart-disc-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu depuis son atlas historique inspecté. Géométrie canonique externe, dimension physique et détails 1:1 non attestés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/smart-disc-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:27",
      "sheetId": "weapon.smart-disc.action",
      "path": "/assets/openai/sprites/normalized/weapons/smart-disc-action-sheet.png"
    }
  },
  {
    "number": 28,
    "id": "weapon-028-wrist-blades",
    "name": "Wrist Blades",
    "file": "wrist-blades",
    "category": "melee",
    "displayWidth": 88,
    "sourceFacing": 1,
    "grip": [
      280,
      500
    ],
    "muzzle": [
      1680,
      440
    ],
    "notes": "Silhouette et pièces du modèle historique Wrist Blades préservées ; géométrie canonique externe non attestée.",
    "sha256": "cb25bf1eaac13911b57f3cce5b285e0ea4c8796154372f72466be0923f68a36a",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      70,
      230,
      1718,
      690
    ],
    "catalogIds": [
      "weapon-028-wrist-blades",
      "weapon-068-wrist-blades-field",
      "weapon-108-wrist-blades-veteran"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Alien: Tantalus Frontier",
      "sourceProvenance": "project-historical-design-atlas",
      "referenceSource": "existing-project-design-not-external-canon",
      "referenceUrl": "/assets/openai/sprites/normalized/weapons/wrist-blades-action-sheet.png",
      "referenceLabel": "Atlas historique Tantalus inspecté — géométrie canonique externe non attestée",
      "referenceStatus": "PROJECT_DESIGN_ADAPTATION",
      "identityVerified": false,
      "identityStatus": "saved-catalog-identity-not-external-canon-attested",
      "geometryStatus": "project-design-reconstruction-not-canonical",
      "referenceCaveat": "Adaptation du design déjà présent dans le jeu depuis son atlas historique inspecté. Géométrie canonique externe, dimension physique et détails 1:1 non attestés."
    },
    "referenceImageUrl": "/assets/openai/sprites/normalized/weapons/wrist-blades-action-sheet.png",
    "legacyAnimation": {
      "imageKey": "weaponV61:28",
      "sheetId": "weapon.wrist-blades.action",
      "path": "/assets/openai/sprites/normalized/weapons/wrist-blades-action-sheet.png"
    }
  },
  {
    "number": 166,
    "id": "weapon-166-p649-hel",
    "name": "P.649 HEL",
    "file": "p649-hel",
    "category": "heavy",
    "displayWidth": 122,
    "sourceFacing": 1,
    "grip": [
      200,
      400
    ],
    "muzzle": [
      2120,
      315
    ],
    "notes": "P.649 HEL : carter long, cœur cylindrique, levier incliné, pivots et braces inférieurs préservés. Référence officielle complète de la saison 4 inspectée.",
    "sha256": "aa11d8b4d9cf5910b2093ec24af844533448c97fc68a6e1fb1362b73059c0f86",
    "width": 2172,
    "height": 724,
    "alphaBounds": [
      36,
      100,
      2135,
      591
    ],
    "catalogIds": [
      "weapon-166-p649-hel"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Aliens: Fireteam Elite",
      "sourceProvenance": "official-publisher-game-render",
      "referenceSource": "official-game-promotion",
      "referenceUrl": "https://www.aliensfireteamelite.com/en/community/afe-season-4-announce/",
      "referenceLabel": "Cold Iron Studios — vue officielle complète inspectée",
      "referenceStatus": "PRIMARY_GAME_RENDER_ADAPTATION",
      "identityVerified": true,
      "identityStatus": "official-reference-reconstruction",
      "geometryStatus": "reference-reconstruction-not-certified",
      "referenceCaveat": "Vue officielle complète réellement inspectée. Adaptation fixe non certifiée 1:1 ; détails, géométrie et dimensions physiques du PNG non attestés. Les valeurs de jeu sont un réglage original Tantalus."
    },
    "referenceImageUrl": "https://www.aliensfireteamelite.com/images/uploads/cfe588c977450076e2ec4f086653848f.jpg",
    "legacyAnimation": null
  },
  {
    "number": 167,
    "id": "weapon-167-dkt-59-misha",
    "name": "DKT-59 Misha",
    "file": "dkt-59-misha",
    "category": "sidearm",
    "displayWidth": 80,
    "sourceFacing": 1,
    "grip": [
      330,
      560
    ],
    "muzzle": [
      1850,
      270
    ],
    "notes": "DKT-59 Misha : silhouette du handgun, poignée ajourée, longues ouvertures triangulaires et bobine avant préservées. Référence officielle complète de la saison 4 inspectée.",
    "sha256": "d3e42bdb44210d893344432d0342509853c16b8286d8d6d565dc23773b3db858",
    "width": 1918,
    "height": 820,
    "alphaBounds": [
      63,
      109,
      1871,
      749
    ],
    "catalogIds": [
      "weapon-167-dkt-59-misha"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Aliens: Fireteam Elite",
      "sourceProvenance": "official-publisher-game-render",
      "referenceSource": "official-game-promotion",
      "referenceUrl": "https://www.aliensfireteamelite.com/en/community/afe-season-4-announce/",
      "referenceLabel": "Cold Iron Studios — vue officielle complète inspectée",
      "referenceStatus": "PRIMARY_GAME_RENDER_ADAPTATION",
      "identityVerified": true,
      "identityStatus": "official-reference-reconstruction",
      "geometryStatus": "reference-reconstruction-not-certified",
      "referenceCaveat": "Vue officielle complète réellement inspectée. Adaptation fixe non certifiée 1:1 ; détails, géométrie et dimensions physiques du PNG non attestés. Les valeurs de jeu sont un réglage original Tantalus."
    },
    "referenceImageUrl": "https://www.aliensfireteamelite.com/images/uploads/cfe588c977450076e2ec4f086653848f.jpg",
    "legacyAnimation": null
  },
  {
    "number": 168,
    "id": "weapon-168-evi-87-zvezda",
    "name": "EVI-87 Zvezda Plasma Rifle",
    "file": "evi-87-zvezda",
    "category": "rifle",
    "displayWidth": 116,
    "sourceFacing": 1,
    "grip": [
      650,
      640
    ],
    "muzzle": [
      1860,
      420
    ],
    "notes": "EVI-87 Zvezda : crosse profonde, poignée inclinée et cœur énergétique cyan/violet sous braces triangulaires préservés. Vue officielle complète de la saison 2 inspectée.",
    "sha256": "c0492d907651675b8189c8119f39cc15f17cc15e23d4fd0b4cab4edc55a05fe9",
    "width": 1920,
    "height": 819,
    "alphaBounds": [
      29,
      143,
      1910,
      746
    ],
    "catalogIds": [
      "weapon-168-evi-87-zvezda"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Aliens: Fireteam Elite",
      "sourceProvenance": "official-publisher-game-render",
      "referenceSource": "official-game-promotion",
      "referenceUrl": "https://www.aliensfireteamelite.com/en/community/afe-season-2/",
      "referenceLabel": "Cold Iron Studios — vue officielle complète inspectée",
      "referenceStatus": "PRIMARY_GAME_RENDER_ADAPTATION",
      "identityVerified": true,
      "identityStatus": "official-reference-reconstruction",
      "geometryStatus": "reference-reconstruction-not-certified",
      "referenceCaveat": "Vue officielle complète réellement inspectée. Adaptation fixe non certifiée 1:1 ; détails, géométrie et dimensions physiques du PNG non attestés. Les valeurs de jeu sont un réglage original Tantalus."
    },
    "referenceImageUrl": "https://www.aliensfireteamelite.com/images/uploads/ef215054fd214408d7b376b37c732c47.png",
    "legacyAnimation": null
  },
  {
    "number": 169,
    "id": "weapon-169-ppz-49-vol",
    "name": "PPZ-49 Vol",
    "file": "ppz-49-vol",
    "category": "smg",
    "displayWidth": 100,
    "sourceFacing": 1,
    "grip": [
      600,
      625
    ],
    "muzzle": [
      1720,
      340
    ],
    "notes": "PPZ-49 Vol : crosse triangulée, longue poignée avant, grip incliné, chargeur prolongé et mécanismes sous carter ajouré préservés. Vue officielle complète de la saison 2 inspectée.",
    "sha256": "9e50bbeb6d9d10d56c9700637cd46261c1ac4f0885f76b78aa4c761fed1756d0",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      56,
      182,
      1743,
      793
    ],
    "catalogIds": [
      "weapon-169-ppz-49-vol"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Aliens: Fireteam Elite",
      "sourceProvenance": "official-publisher-game-render",
      "referenceSource": "official-game-promotion",
      "referenceUrl": "https://www.aliensfireteamelite.com/en/community/afe-season-2/",
      "referenceLabel": "Cold Iron Studios — vue officielle complète inspectée",
      "referenceStatus": "PRIMARY_GAME_RENDER_ADAPTATION",
      "identityVerified": true,
      "identityStatus": "official-reference-reconstruction",
      "geometryStatus": "reference-reconstruction-not-certified",
      "referenceCaveat": "Vue officielle complète réellement inspectée. Adaptation fixe non certifiée 1:1 ; détails, géométrie et dimensions physiques du PNG non attestés. Les valeurs de jeu sont un réglage original Tantalus."
    },
    "referenceImageUrl": "https://www.aliensfireteamelite.com/images/uploads/ef215054fd214408d7b376b37c732c47.png",
    "legacyAnimation": null
  },
  {
    "number": 170,
    "id": "weapon-170-frontier-revolver",
    "name": "Frontier Revolver",
    "file": "frontier-revolver",
    "category": "sidearm",
    "displayWidth": 80,
    "sourceFacing": 1,
    "grip": [
      340,
      650
    ],
    "muzzle": [
      1720,
      240
    ],
    "notes": "Frontier Revolver : grand barillet, grip arrondi, marteau incliné et long carter avant ventilé préservés. Modèle distinct du revolver .357 historique. Vue officielle complète de la saison 2 inspectée.",
    "sha256": "4c128455b90fd3159896f872336ff81a7fb4d7f7188bdcc69f34ac55a237b7ab",
    "width": 1774,
    "height": 887,
    "alphaBounds": [
      132,
      48,
      1747,
      847
    ],
    "catalogIds": [
      "weapon-170-frontier-revolver"
    ],
    "referenceMetadata": {
      "projectOriginal": false,
      "sourceWork": "Aliens: Fireteam Elite",
      "sourceProvenance": "official-publisher-game-render",
      "referenceSource": "official-game-promotion",
      "referenceUrl": "https://www.aliensfireteamelite.com/en/community/afe-season-2/",
      "referenceLabel": "Cold Iron Studios — vue officielle complète inspectée",
      "referenceStatus": "PRIMARY_GAME_RENDER_ADAPTATION",
      "identityVerified": true,
      "identityStatus": "official-reference-reconstruction",
      "geometryStatus": "reference-reconstruction-not-certified",
      "referenceCaveat": "Vue officielle complète réellement inspectée. Adaptation fixe non certifiée 1:1 ; détails, géométrie et dimensions physiques du PNG non attestés. Les valeurs de jeu sont un réglage original Tantalus."
    },
    "referenceImageUrl": "https://www.aliensfireteamelite.com/images/uploads/ef215054fd214408d7b376b37c732c47.png",
    "legacyAnimation": null
  }
];
export const WEAPON_ADDITIONAL_NATIVE_PROFILES_V121 = freeze(inspectedAdditionalPlates.map(fromInspectedPlate));
export const TYPE99_INCINERATOR_PROFILE_V121 = WEAPON_ADDITIONAL_NATIVE_PROFILES_V121.find(p=>p.baseNumber===152);
export const AM16_GRUPPA_PROFILE_V121 = WEAPON_ADDITIONAL_NATIVE_PROFILES_V121.find(p=>p.baseNumber===153);

export const WEAPON_NATIVE_PROFILES_V121 = freeze([M94_IMPACT_GRENADE_PROFILE_V121,TYPE76_AUTO_SHOTGUN_PROFILE_V121,M12_RPG_PROFILE_V121,L59_MINIGUN_PROFILE_V121,LEM_MP11_STORMSURGE_PROFILE_V121,...WEAPON_ADDITIONAL_NATIVE_PROFILES_V121]);
export const WEAPON_NATIVE_ASSETS_V121 = freeze(Object.fromEntries(
  WEAPON_NATIVE_PROFILES_V121.map(profile=>[profile.imageKey,profile.path])
));
export const WEAPON_NATIVE_CATALOG_IDS_V121 = freeze(WEAPON_NATIVE_PROFILES_V121.flatMap(profile=>profile.catalogIds));
const byId = new Map(), byAlias = new Map();
for (const profile of WEAPON_NATIVE_PROFILES_V121) {
  for (const id of profile.catalogIds) {
    const number = Number(id.match(/^weapon-(\d{3})-/)[1]);
    const value = {profile,number}; byId.set(id,value); byId.set(`weapon-${String(number).padStart(3,'0')}`,value);
  }
  for (const alias of [profile.imageKey,profile.name,profile.canonicalName]) byAlias.set(alias,profile);
}
export function resolveNativeWeaponProfileV121(source={}) {
  if (!source || typeof source!=='object' || Array.isArray(source)) return null;
  const id=String(source.id||'').trim(); let profile,number;
  if (id) { const value=byId.get(id); if (!value) return null; ({profile,number}=value); }
  else {
    const aliases=[source.imageKey,source.name,source.canonicalName].filter(value=>value!=null && String(value).trim()).map(value=>String(value).trim());
    if (!aliases.length) return null; const matches=aliases.map(alias=>byAlias.get(alias));
    if (matches.some(value=>!value) || new Set(matches).size!==1) return null;
    profile=matches[0]; number=profile.baseNumber;
  }
  return freeze({...profile,catalogNumber:number,exact:true,authoredFamily:number!==profile.baseNumber});
}
