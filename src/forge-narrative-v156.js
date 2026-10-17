/** Bounded, data-only terminal stories for Forge documents and playtest sessions.
 * Effects can only validate authored objectives. No campaign, script or storage API. */
export const FORGE_NARRATIVE_LIMITS_V156 = Object.freeze({ terminals: 64, nodes: 8, choices: 2, text: 600 });
const id = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}$/.test(value);
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const fail = message => { throw new Error(`Récit Forge : ${message}`); };
const text = (value, max, name) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u0008\u000b-\u001f\u007f]/.test(value)) fail(`${name} invalide (${max} caractères maximum).`);
  return value.trim();
};
export function parseForgeNarrativeV156(raw, type, layer) {
  if (raw === undefined) return undefined;
  if (type !== 'terminal' || ['background', 'foreground'].includes(layer)) fail('un récit doit appartenir à un terminal physique.');
  if (!record(raw) || raw.schema !== 1 || !Array.isArray(raw.nodes) || !raw.nodes.length || raw.nodes.length > 8 || !id(raw.start)) fail('1 à 8 nœuds requis.');
  const ids = new Set();
  const nodes = raw.nodes.map(node => {
    if (!record(node) || !id(node.id) || ids.has(node.id) || !Array.isArray(node.choices) || node.choices.length > 2) fail('nœud ou choix invalide/dupliqué.');
    ids.add(node.id); const choices = new Set();
    return { id: node.id, text: text(node.text, 600, 'texte'), choices: node.choices.map(choice => {
      if (!record(choice) || !id(choice.id) || choices.has(choice.id) || (choice.next !== null && !id(choice.next))) fail('choix invalide/dupliqué.');
      choices.add(choice.id);
      const result = { id: choice.id, label: text(choice.label, 100, 'réponse'), next: choice.next };
      for (const key of ['requiresObjectiveId', 'rewardObjectiveId']) if (choice[key] !== undefined) {
        if (!id(choice[key])) fail('référence d’objectif invalide.');
        result[key] = choice[key];
      }
      return result;
    }) };
  });
  if (!ids.has(raw.start) || nodes.some(node => node.choices.some(choice => choice.next !== null && !ids.has(choice.next)))) fail('destination de réponse introuvable.');
  const visiting = new Set(), visited = new Set();
  function visit(nodeId) {
    if (visiting.has(nodeId)) fail('les boucles de dialogue ne sont pas autorisées.');
    if (visited.has(nodeId)) return;
    visiting.add(nodeId);
    for (const choice of nodes.find(node => node.id === nodeId).choices) if (choice.next !== null) visit(choice.next);
    visiting.delete(nodeId); visited.add(nodeId);
  }
  // Draft pages may be temporarily unlinked while editing; cycles are rejected
  // across the entire document, including those draft pages.
  for (const node of nodes) visit(node.id);
  return { schema: 1, title: text(raw.title, 100, 'titre'), start: raw.start, nodes };
}
export function validateForgeNarrativeReferencesV156(rooms, externalObjectiveIds = new Set()) {
  const objectives = new Set(rooms.flatMap(room => room.cells.filter(cell => cell.type === 'objective' && !['background', 'foreground'].includes(cell.layer)).map(cell => cell.id)));
  const terminals = rooms.flatMap(room => room.cells.filter(cell => cell.narrative));
  if (terminals.length > 64) fail('64 terminaux narratifs maximum.');
  for (const cell of terminals) for (const node of cell.narrative.nodes) for (const choice of node.choices) {
    for (const key of ['requiresObjectiveId', 'rewardObjectiveId']) if (choice[key] && !objectives.has(choice[key]) && !externalObjectiveIds.has(choice[key])) fail(`objectif « ${choice[key]} » introuvable.`);
    if (choice.requiresObjectiveId && choice.requiresObjectiveId === choice.rewardObjectiveId) fail('une réponse ne peut pas exiger sa propre récompense.');
  }
}
export function defaultForgeNarrativeV156() {
  return { schema: 1, title: 'Journal du secteur', start: 'briefing', nodes: [
    { id: 'briefing', text: 'Le secteur attend vos instructions. Quelle procédure transmettre ?', choices: [
      { id: 'continue', label: 'Transmettre le rapport', next: 'report' },
      { id: 'leave', label: 'Consulter les consignes', next: 'instructions' }
    ] },
    { id: 'report', text: 'Rapport transmis. Vous pouvez reprendre le parcours.', choices: [] },
    { id: 'instructions', text: 'Vérifiez les objectifs indiqués avant de poursuivre.', choices: [] }
  ] };
}
const authoredCell = (session, cellId) => session?.project.rooms.find(room => room.id === session.currentRoomId)?.cells
  .find(cell => cell.id === cellId && cell.narrative);
const stateOf = (session, cellId) => (session?.narrativeV156 || []).find(entry => entry.cellId === cellId);
export function openForgeNarrativeV156(session, cellId) {
  const cell = authoredCell(session, cellId);
  if (!cell) return null;
  session.narrativeV156 ||= [];
  let state = stateOf(session, cellId);
  if (!state) { state = { cellId, nodeId: cell.narrative.start, history: [] }; session.narrativeV156.push(state); }
  return forgeNarrativeViewV156(session, cellId);
}
export function forgeNarrativeViewV156(session, cellId) {
  const cell = authoredCell(session, cellId), state = stateOf(session, cellId);
  if (!cell || !state) return null;
  const node = cell.narrative.nodes.find(entry => entry.id === state.nodeId);
  // A null cursor is a completed exchange; reopening shows its last page.
  const last = node || cell.narrative.nodes.find(entry => entry.id === state.history.at(-1)?.nodeId);
  if (!last) return null;
  return { cellId, title: cell.narrative.title, nodeId: last.id, text: last.text,
    finished: !node || !node.choices.length,
    choices: !node ? [] : node.choices.map(choice => ({ ...choice,
      available: !choice.requiresObjectiveId || session.completedObjectives.includes(choice.requiresObjectiveId) })) };
}
export function chooseForgeNarrativeV156(session, cellId, choiceId) {
  const cell = authoredCell(session, cellId), state = stateOf(session, cellId);
  const node = cell?.narrative.nodes.find(entry => entry.id === state?.nodeId);
  const choice = node?.choices.find(entry => entry.id === choiceId);
  if (!choice) return { ok: false, reason: 'choice-unavailable' };
  if (choice.requiresObjectiveId && !session.completedObjectives.includes(choice.requiresObjectiveId)) return { ok: false, reason: 'objective-required', objectiveId: choice.requiresObjectiveId };
  if (state.history.length >= 8) return { ok: false, reason: 'story-budget' };
  const rewarded = choice.rewardObjectiveId && !session.completedObjectives.includes(choice.rewardObjectiveId) ? choice.rewardObjectiveId : null;
  if (rewarded) session.completedObjectives.push(rewarded);
  state.history.push({ nodeId: node.id, choiceId: choice.id });
  state.nodeId = choice.next;
  return { ok: true, rewardedObjectiveId: rewarded, view: forgeNarrativeViewV156(session, cellId) };
}

/** Copies remap references only when the target objective is in the same copy. */
export function remapForgeNarrativeObjectivesV156(cells, mapping) {
  for (const cell of cells) if (cell.narrative) for (const node of cell.narrative.nodes) for (const choice of node.choices)
    for (const key of ['requiresObjectiveId', 'rewardObjectiveId']) if (mapping.has(choice[key])) choice[key] = mapping.get(choice[key]);
  return cells;
}
