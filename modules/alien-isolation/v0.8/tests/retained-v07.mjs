import {CONTENT} from '../src/content.js';
// Count retained historical content separately from newly authored v0.8 content.
// All behavioral tests continue to exercise the complete current engine/content.
export const RETAINED={...CONTENT,
 rooms:CONTENT.rooms.filter(r=>!r.addedV08).map(r=>({...r,props:r.props.filter(p=>!p.addedV08)})),
 links:CONTENT.links.filter(x=>!x.addedV08), optional:CONTENT.optional.filter(x=>!x.addedV08),
 logs:CONTENT.logs.filter(x=>!x.addedV08), ducts:CONTENT.ducts.filter(x=>!x.addedV08),
 rules:CONTENT.rules.filter(x=>!x.startsWith('SPACE08/'))};
