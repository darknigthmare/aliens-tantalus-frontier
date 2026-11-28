// Original project drawings. Film/edition fidelity and game balance are separate.
// Exact actor/profile/variant admission; no borrowed body or palette fallback.
export const XENO_TRIALS_REFERENCED_ART_V231 = Object.freeze([
  {
    "fighterId": "mire-v210-predalien-avpr",
    "profileId": "design-v210-predalien-avpr",
    "kind": "neutral",
    "sha256": "dc9dec47f5dccd1c1a42f4390b9cf050ee8b80043f43bed89d77c43f28bab792",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      29,
      14,
      1470,
      1011
    ],
    "rootX": 1067,
    "rootY": 1010,
    "sourceFacing": 1,
    "statureHeight": 997,
    "variant": null,
    "path": "/assets/openai/xeno-trials-v231/predalien-avpr-neutral.png",
    "canonExact": false,
    "visualRevision": 231,
    "sourceStatus": "provisional-film-adaptation",
    "sourceWork": "Aliens vs. Predator: Requiem (2007) · Reconstitution MIRE",
    "stagingHeight": 179,
    "bodyWidth": 80,
    "bodyHeight": 162,
    "biology": "hybrid"
  },
  {
    "fighterId": "mire-v210-predalien-avpr",
    "profileId": "design-v210-predalien-avpr",
    "kind": "select",
    "sha256": "8a317bc91b466e5ea0f24da4f1d5deb229ee9ec703e84b0ec2a9151b8ce4db17",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      120,
      16,
      1442,
      994
    ],
    "rootX": 970,
    "rootY": 993,
    "sourceFacing": 1,
    "statureHeight": 997,
    "variant": null,
    "path": "/assets/openai/xeno-trials-v231/predalien-avpr-select.png",
    "canonExact": false,
    "visualRevision": 231,
    "sourceStatus": "provisional-film-adaptation",
    "sourceWork": "Aliens vs. Predator: Requiem (2007) · Reconstitution MIRE"
  },
  {
    "fighterId": "mire-v210-predalien-avpr",
    "profileId": "design-v210-predalien-avpr",
    "kind": "intro",
    "sha256": "8b118b863dbe80c3dbcb76b34b9424c1a1d7456646eb3cbcde73d3f90f88f348",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      42,
      138,
      1527,
      937
    ],
    "rootX": 920,
    "rootY": 936,
    "sourceFacing": 1,
    "statureHeight": 997,
    "variant": null,
    "path": "/assets/openai/xeno-trials-v231/predalien-avpr-intro.png",
    "canonExact": false,
    "visualRevision": 231,
    "sourceStatus": "provisional-film-adaptation",
    "sourceWork": "Aliens vs. Predator: Requiem (2007) · Reconstitution MIRE"
  },
  {
    "fighterId": "mire-v210-predalien-avpr",
    "profileId": "design-v210-predalien-avpr",
    "kind": "victory",
    "sha256": "7a804377b94601d8530fcbd4f83bae31c02a159363d00b74d68bfd863bcdc04a",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      159,
      10,
      1461,
      1007
    ],
    "rootX": 990,
    "rootY": 1005,
    "sourceFacing": 1,
    "statureHeight": 997,
    "variant": null,
    "path": "/assets/openai/xeno-trials-v231/predalien-avpr-victory.png",
    "canonExact": false,
    "visualRevision": 231,
    "sourceStatus": "provisional-film-adaptation",
    "sourceWork": "Aliens vs. Predator: Requiem (2007) · Reconstitution MIRE"
  },
  {
    "fighterId": "mire-v210-striker",
    "profileId": "design-v210-striker",
    "kind": "neutral",
    "sha256": "b44db527d7d533434ecf492a7d2e971a335913ba103fc9a03a85d10fa3cfed90",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      192,
      65,
      1319,
      962
    ],
    "rootX": 718,
    "rootY": 960,
    "sourceFacing": 1,
    "statureHeight": 896,
    "variant": null,
    "path": "/assets/openai/xeno-trials-v231/striker-neutral.png",
    "canonExact": false,
    "visualRevision": 231,
    "sourceStatus": "original-mire-role-adaptation",
    "sourceWork": "AFE2 · Interprétation MIRE",
    "stagingHeight": 180,
    "bodyWidth": 80,
    "bodyHeight": 166,
    "biology": "pathogen"
  }
].map(plate => Object.freeze({ ...plate, alphaBounds: Object.freeze(plate.alphaBounds) })));
const bodies = new Map(XENO_TRIALS_REFERENCED_ART_V231.filter(plate => plate.kind === 'neutral').map(plate => {
  const { sourceWidth, sourceHeight, alphaBounds, stagingHeight } = plate;
  const renderHeight = stagingHeight / ((alphaBounds[3] - alphaBounds[1]) / sourceHeight);
  return [plate.fighterId, Object.freeze({ ...plate, id: plate.profileId,
    pivot: Object.freeze({ x: plate.rootX / sourceWidth, y: plate.rootY / sourceHeight }),
    renderWidth: renderHeight * sourceWidth / sourceHeight, renderHeight })];
}));
export const getXenoTrialsReferencedResearchArtV231 = id => bodies.get(id) || null;
export function getXenoTrialsReferencedPresentationPlateV231(kind, id, variant = null) {
  return XENO_TRIALS_REFERENCED_ART_V231.find(plate => plate.kind === kind && plate.fighterId === id
    && plate.variant === variant) || null;
}
export const getXenoTrialsReferencedAssetsV231 = () => [...new Set(XENO_TRIALS_REFERENCED_ART_V231.map(plate => plate.path))];
