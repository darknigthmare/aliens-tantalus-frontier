// V188 — dedicated colour-blind palette for gameplay signals drawn on Canvas
// (bible §45.1, §53.8). With the option off, every token returns the exact
// colour the game drew before. With any colour-blind mode, state signals use
// Okabe–Ito colours that also differ in brightness, so locked / open / closed
// stay apart for protanopia, deuteranopia and tritanopia.

const token = (off, safe) => Object.freeze([off, safe]);
export const SIGNAL_PALETTE_V188 = Object.freeze({
  'door-locked': token('#d04f47', '#d55e00'), 'door-open': token('#83d99e', '#56b4e9'), 'door-closed': token('#d6ac59', '#f0e442'),
  'hub-door-open': token('#7ed49a', '#56b4e9'), 'hub-door-closed': token('#d2a957', '#f0e442'),
  'bulkhead-open': token('#85c4a1', '#56b4e9'), 'bulkhead-locked': token('#b76853', '#d55e00'), 'bulkhead-closed': token('#c7ad6b', '#f0e442'),
  'bioforge-door-open': token('#426c54', '#2f6f9f'), 'bioforge-door-locked': token('#733e3e', '#8a4a00'),
  'relay-door-open': token('#b9d5a5', '#56b4e9'), 'relay-door-closed': token('#d1a358', '#e69f00'),
  'guide-ok': token('#8fceaf', '#56b4e9'), 'guide-blocked': token('#edb279', '#e69f00')
});
// Groups whose members must stay distinguishable from each other.
export const SIGNAL_GROUPS_V188 = Object.freeze([
  ['door-locked', 'door-open', 'door-closed'], ['hub-door-open', 'hub-door-closed'],
  ['bulkhead-open', 'bulkhead-locked', 'bulkhead-closed'], ['bioforge-door-open', 'bioforge-door-locked'],
  ['relay-door-open', 'relay-door-closed'], ['guide-ok', 'guide-blocked']
].map(Object.freeze));

export function colorblindPaletteActiveV188(document = globalThis.document) {
  const mode = document?.documentElement?.dataset?.colorblindV188;
  return Boolean(mode) && mode !== 'off';
}
export function signalColorV188(name, document = globalThis.document) {
  const entry = SIGNAL_PALETTE_V188[name];
  if (!entry) throw new Error(`Unknown signal colour: ${name}`);
  return entry[colorblindPaletteActiveV188(document) ? 1 : 0];
}
