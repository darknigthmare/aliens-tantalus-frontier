/* Source-only documentation builder. It reads the immutable game and reviewed
 * visual inventory; it never edits the simulation, images or admissions. */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../', import.meta.url));
const directory = resolve(repo, 'docs/mer-des-chagrins-20261126');
const jsonPath = resolve(directory, 'BIBLE.json');
const manifestPath = 'dlc/sea-of-sorrows-visual/SPRITE_MANIFEST.json';
const categoryIds = ['personnages', 'lieux', 'armes', 'props', 'vehicules', 'vaisseaux', 'terrain', 'planete'];
const args = new Set(process.argv.slice(2));
for (const arg of args) assert.ok(['--check', '--refresh-assets'].includes(arg), 'Unknown argument: ' + arg);
assert.ok(!(args.has('--check') && args.has('--refresh-assets')), 'Refresh and check are separate operations.');
const read = path => readFileSync(resolve(repo, path));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
const manifest = JSON.parse(read(manifestPath));
const text = value => value == null ? '' : String(value);
const html = value => text(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const md = value => text(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const arr = value => Array.isArray(value) ? value : [];
const anchor = id => 'fiche-' + id.replace(/[^a-z0-9_-]/gi, '-');
const localLink = path => '../../' + path;
const relativeFile = path => {
  assert.equal(typeof path, 'string', 'File path must be a string.');
  assert.ok(path && !isAbsolute(path) && !/[\\\0\r\n]/.test(path) && path.split('/').every(p => p && p !== '.' && p !== '..'), 'Unsafe documentation file path: ' + path);
  const result = resolve(repo, path);
  assert.ok(!relative(repo, result).startsWith('..'), 'Documentation path leaves repository.');
  return result;
};
const readable = value => typeof value === 'string' ? value : value == null ? 'Non renseigné' : JSON.stringify(value);
const unique = values => [...new Set(values)];

function assetRecord(asset, previous) {
  return {
    id: asset.id, path: asset.path, width: asset.width, height: asset.height,
    sizeBytes: asset.sizeBytes, sha256: asset.sha256,
    surfaces: arr(asset.runtimeSurfaces), metadata: asset.metadata,
    provenance: asset.provenance?.kind || 'non renseignée',
    visualStatus: 'interprétation graphique du projet',
    integrationNote: previous?.integrationNote || 'Surfaces déclarées par le manifeste ; présence naturelle et observation à lire dans la fiche associée.',
    observedEvidence: previous?.observedEvidence || null,
  };
}
if (args.has('--refresh-assets')) {
  const previous = new Map(arr(data.assets).map(a => [a.id, a]));
  data.assets = manifest.assets.map(a => assetRecord(a, previous.get(a.id)));
  data.coverage.manifestAssetCount = manifest.assets.length;
  data.coverage.manifestImageBytes = manifest.assets.reduce((sum, a) => sum + a.sizeBytes, 0);
  data.coverage.manifestSha256 = hash(read(manifestPath));
  const source = data.sources.find(s => s.path === manifestPath);
  if (source) source.sha256 = data.coverage.manifestSha256;
  for (const entry of data.entries) {
    const prefixes = arr(entry.art.assetPrefixes);
    entry.art.assetIds = unique([...arr(entry.art.assetIds), ...data.assets.filter(a => prefixes.some(p => a.id === p || a.id.startsWith(p + '-'))).map(a => a.id)]).sort();
    if (entry.art.assetIds.length && entry.art.status === 'Sans PNG individuel associé') entry.art.status = 'PNG associé ; intégration distincte';
  }
  const assigned = new Set(data.entries.flatMap(e => arr(e.art.assetIds)));
  data.coverage.unassignedAssetIds = data.assets.filter(a => !assigned.has(a.id)).map(a => a.id);
}

function validate() {
  assert.equal(data.schemaVersion, 1);
  assert.equal(data.sourceOnly, true);
  assert.equal(data.scope.fullNovelCompared, false);
  assert.deepEqual(data.categories.map(c => c.id), categoryIds, 'The eight requested categories must remain explicit.');
  const sources = new Map(data.sources.map(s => [s.id, s]));
  assert.equal(sources.size, data.sources.length, 'Duplicate source id.');
  for (const source of sources.values()) {
    assert.ok(source.title && source.kind && source.scope, 'Incomplete source: ' + source.id);
    assert.ok(source.path || source.url, 'Source lacks locator: ' + source.id);
    if (source.path) assert.ok(existsSync(relativeFile(source.path)), 'Missing local source: ' + source.path);
    if (source.url) assert.equal(new URL(source.url).protocol, 'https:', 'Only explicit HTTPS source links are used.');
  }
  const sourceRefs = (refs, owner) => {
    assert.ok(arr(refs).length, 'Unreferenced evidence: ' + owner);
    for (const ref of refs) assert.ok(sources.has(ref), 'Unknown source ' + ref + ' on ' + owner);
  };
  const facts = new Map(data.facts.map(f => [f.id, f]));
  assert.equal(facts.size, data.facts.length, 'Duplicate fact id.');
  for (const fact of facts.values()) {
    assert.ok(fact.claim && fact.status && fact.subjectId, 'Incomplete sourced fact: ' + fact.id);
    sourceRefs(fact.sourceRefs, fact.id);
  }
  for (const source of sources.values()) {
    if (!source.maxDerivedWords) continue;
    const words = data.facts.filter(f => f.sourceRefs.includes(source.id)).map(f => f.claim).join(' ').trim().split(/\s+/).filter(Boolean).length;
    assert.ok(words <= source.maxDerivedWords, 'Evidence paraphrase exceeds source budget: ' + source.id);
  }
  const assets = new Map(data.assets.map(a => [a.id, a]));
  assert.equal(assets.size, data.assets.length, 'Duplicate art id.');
  const current = new Map(manifest.assets.map(a => [a.id, a]));
  assert.equal(assets.size, current.size, 'Art inventory changed; refresh the bible deliberately.');
  for (const asset of assets.values()) {
    const expected = current.get(asset.id);
    assert.ok(expected, 'Unknown art: ' + asset.id);
    for (const key of ['path', 'width', 'height', 'sha256', 'sizeBytes']) assert.equal(asset[key], expected[key], 'Outdated art field ' + asset.id + ':' + key);
    assert.match(asset.sha256, /^[a-f0-9]{64}$/);
    const stat = statSync(relativeFile(asset.path));
    assert.ok(stat.isFile(), 'Art link is not a regular file.');
    assert.equal(stat.size, asset.sizeBytes, 'Art size differs from the reviewed inventory.');
    assert.deepEqual(asset.surfaces, arr(expected.runtimeSurfaces), 'Art surface drift: ' + asset.id);
    assert.deepEqual(asset.metadata, expected.metadata, 'Art anchor drift: ' + asset.id);
  }
  const entries = new Map(data.entries.map(e => [e.id, e]));
  assert.equal(entries.size, data.entries.length, 'Duplicate bible entry.');
  for (const category of data.categories) assert.ok(data.entries.some(e => e.category === category.id), 'Empty category: ' + category.id);
  const gaps = new Map(data.gaps.map(g => [g.id, g]));
  assert.equal(gaps.size, data.gaps.length, 'Duplicate backlog item.');
  for (const entry of entries.values()) {
    assert.ok(categoryIds.includes(entry.category) && entry.label && entry.summary, 'Incomplete entry: ' + entry.id);
    assert.ok(entry.provenance?.classification && entry.game?.status && entry.art?.status, 'Missing evidence/art/game status: ' + entry.id);
    assert.ok(entry.game.description && entry.art.description && entry.production?.brief, 'Empty production dossier: ' + entry.id);
    sourceRefs(entry.sourceRefs, entry.id);
    for (const id of arr(entry.factIds)) assert.ok(facts.has(id), 'Unknown fact ' + id + ' on ' + entry.id);
    for (const id of arr(entry.art.assetIds)) assert.ok(assets.has(id), 'Missing art reference ' + id + ' on ' + entry.id);
    for (const id of arr(entry.backlogIds)) assert.ok(gaps.has(id), 'Unknown backlog item ' + id);
    for (const id of arr(entry.relatedEntryIds)) assert.ok(entries.has(id), 'Unknown related entry ' + id);
    for (const room of arr(entry.game.rooms)) assert.ok(entries.has(room) && entries.get(room).subtype === 'salle', 'Unknown room ' + room);
  }
  for (const id of data.coverage.baselineEntryIds) assert.ok(entries.has(id), 'Baseline inventory entry omitted: ' + id);
  assert.equal(new Set(data.coverage.baselineEntryIds).size, data.coverage.baselineEntryIds.length, 'Duplicate baseline inventory id.');
  const campaign = JSON.parse(read('dlc/sea-of-sorrows/data/campaign.json'));
  assert.deepEqual(data.nativeIndex.chapters.map(c => c.id), campaign.chapters.map(c => c.id), 'Chapter concordance drift.');
  assert.deepEqual(data.nativeIndex.edges, campaign.edges, 'Campaign edge concordance drift.');
  assert.deepEqual(data.nativeIndex.codex.map(c => c.id), campaign.codex.map(c => c.id), 'Codex concordance drift.');
  for (const gap of gaps.values()) {
    assert.ok(gap.title && gap.kind && gap.priority && gap.acceptance, 'Incomplete backlog: ' + gap.id);
    sourceRefs(gap.sourceRefs, gap.id);
    for (const id of arr(gap.entryIds)) assert.ok(entries.has(id), 'Unknown backlog entry ' + id);
  }
  const assigned = new Set(data.entries.flatMap(e => arr(e.art.assetIds)));
  assert.deepEqual(data.coverage.unassignedAssetIds || [], data.assets.filter(a => !assigned.has(a.id)).map(a => a.id), 'Unassigned art must be explicit.');
  assert.equal(data.coverage.manifestAssetCount, manifest.assets.length);
  assert.equal(data.coverage.manifestSha256, hash(read(manifestPath)), 'Manifest changed; refresh the documentation snapshot.');
  return { sources, facts, assets, entries, gaps };
}
const index = validate();
if (args.has('--refresh-assets')) writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n');
const sourceLink = source => source.url || localLink(source.path);
const refsMd = refs => arr(refs).map(id => `[${md(index.sources.get(id).title)}](${sourceLink(index.sources.get(id))})`).join(' · ');
const refsHtml = refs => arr(refs).map(id => `<a href="${html(sourceLink(index.sources.get(id)))}">${html(index.sources.get(id).title)}</a>`).join(' · ');
const listMd = values => arr(values).map(v => '- ' + md(v)).join('\n');
const listHtml = values => arr(values).length ? '<ul>' + values.map(v => '<li>' + html(v) + '</li>').join('') + '</ul>' : '';
const factsFor = entry => arr(entry.factIds).map(id => index.facts.get(id));
const classify = entry => entry.provenance.classification;
const properties = entry => arr(entry.game.properties);
const assetSummary = asset => `${asset.width} × ${asset.height} px · hauteur de présentation ${asset.metadata.worldHeight} unités · ${asset.surfaces.join(', ') || 'aucune surface déclarée'}`;
const technicalAnchors = asset => Object.entries(asset.metadata).filter(([key]) => /Anchor$|^pivot$|^crop$|^apertureBounds$/.test(key)).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(' ; ');

function renderMarkdown() {
  const lines = [
    '# ' + data.title, '', data.subtitle, '',
    `**Document de production — sources uniquement.** Révision ${data.revision}. Base de lecture : ${data.baseCommit}.`, '',
    '## Périmètre et niveau de preuve', '', data.scope.description, '',
    listMd(data.scope.boundaries), '',
    `Cette édition comprend **${data.entries.length} fiches**, **${data.assets.length} PNG référencés** et **${data.gaps.length} tâches ou limites explicites**. Le nombre de références ne certifie ni une présence naturelle dans une scène, ni une vérification visuelle de chaque image.`, '',
    `Ouvrir [la bible consultable](BIBLE.html) pour la recherche, les filtres et les aperçus. [BIBLE.json](BIBLE.json) contient les données éditoriales et leurs références.`, '',
    '## Les huit catégories', '', '| Catégorie | Fiches | Périmètre |', '| --- | ---: | --- |',
    ...data.categories.map(c => `| [${md(c.label)}](#${c.id}) | ${data.entries.filter(e => e.category === c.id).length} | ${md(c.description)} |`), '',
    '## Lire les états', '', listMd(data.stateGuide), '',
    '## État de la vérification', '', ...data.evidence.map(e => `- **${md(e.label)}** — ${md(e.description)} ${refsMd(e.sourceRefs)}`), '',
    '<a id="preuves"></a>', '', '## Registre des faits externes', '',
    'Chaque constat est formulé une seule fois ici. Les fiches renvoient à son identifiant et conservent les détails propres au jeu séparément. Le statut indique exactement ce que la source permet de conclure.', '',
    ...data.facts.flatMap(f => [`<a id="fait-${f.id}"></a>`, '', `### ${f.id} · ${f.subjectId}`, '', `**${f.status}** — ${f.claim}`, '', refsMd(f.sourceRefs), '']),
  ];
  for (const category of data.categories) {
    lines.push(`<a id="${category.id}"></a>`, '', '## ' + category.label, '', category.description, '');
    for (const entry of data.entries.filter(e => e.category === category.id)) {
      lines.push(`<a id="${anchor(entry.id)}"></a>`, '', `### ${entry.label} — ${entry.id}`, '', entry.summary, '',
        `**Sous-type :** ${entry.subtype}. **Statut du sujet :** ${classify(entry)}.`, '',
        '#### Faits vérifiés et limites de continuité', '');
      const facts = factsFor(entry);
      if (facts.length) for (const fact of facts) lines.push(`- [${fact.id} · ${fact.subjectId}](#fait-${fact.id}) — ${fact.status}.`);
      else lines.push('Aucun fait primaire supplémentaire n’est authentifié pour cette fiche. Les éléments ci-dessous décrivent le projet.');
      if (entry.provenance.notes?.length) lines.push('', listMd(entry.provenance.notes));
      if (entry.provenance.locators?.length) lines.push('', 'Repères dans les sources du projet :', '', listMd(entry.provenance.locators));
      lines.push('', '#### Présence et comportement dans le jeu', '', `**État :** ${entry.game.status}.`, '', entry.game.description || '', '');
      if (entry.game.runtimeIds?.length) lines.push('Identifiants natifs : ' + entry.game.runtimeIds.map(id => '`' + id + '`').join(', ') + '.', '');
      if (entry.game.rooms?.length) lines.push('Salles concernées : ' + entry.game.rooms.join(', ') + '.', '');
      if (properties(entry).length) lines.push('| Propriété | Valeur du projet |', '| --- | --- |', ...properties(entry).map(p => `| ${md(p.label)} | ${md(readable(p.value))} |`), '');
      if (entry.game.states?.length) lines.push('États et conditions :', '', listMd(entry.game.states), '');
      if (entry.game.mechanics?.length) lines.push('Règles et interactions :', '', listMd(entry.game.mechanics), '');
      lines.push('#### Direction artistique et intégration', '', `**État artistique :** ${entry.art.status}.`, '', entry.art.description || '', '');
      const assets = arr(entry.art.assetIds).map(id => index.assets.get(id));
      if (assets.length) for (const asset of assets) lines.push(`- [${asset.id}](${localLink(asset.path)}) — ${assetSummary(asset)}. ${asset.integrationNote}`);
      else lines.push('Aucun PNG individuel associé à cette fiche ; une représentation native, une mention ou une absence peut néanmoins exister selon l’état indiqué plus haut.');
      if (entry.art.notes?.length) lines.push('', listMd(entry.art.notes));
      if (entry.production?.brief) lines.push('', '**Consigne de réalisation :** ' + entry.production.brief);
      if (entry.production?.invariants?.length) lines.push('', 'Invariants à préserver :', '', listMd(entry.production.invariants));
      if (entry.production?.unknowns?.length) lines.push('', 'À confirmer :', '', listMd(entry.production.unknowns));
      if (entry.backlogIds?.length) lines.push('', 'Tâches liées : ' + entry.backlogIds.map(id => `[${md(index.gaps.get(id).title)}](#${anchor(id)})`).join(' · ') + '.');
      if (entry.relatedEntryIds?.length) lines.push('', 'Fiches liées : ' + entry.relatedEntryIds.map(id => `[${md(index.entries.get(id).label)}](#${anchor(id)})`).join(' · ') + '.');
      lines.push('', '**Sources de la fiche :** ' + refsMd(entry.sourceRefs), '');
    }
  }
  lines.push('<a id="concordance"></a>', '', '## Concordance du contenu natif', '', data.nativeIndex.description, '',
    `Les ${data.nativeIndex.chapters.length} chapitres sont des divisions de campagne. Les ${data.nativeIndex.edges.length} liaisons décrivent le graphe du jeu. Les ${data.nativeIndex.codex.length} entrées de codex restent un index ; une notice de mécanique ne devient pas un objet de fiction supplémentaire.`, '',
    '### Chapitres de campagne', '', '| ID | Chapitre du jeu | Objectifs |', '| --- | --- | --- |',
    ...data.nativeIndex.chapters.map(c => `| ${c.id} | ${c.number}. ${md(c.title)} | ${c.objectiveIds.map(id => `[${id}](#${anchor(id)})`).join(', ')} |`), '',
    '### Graphe des passages', '', '| Liaison | Départ | Arrivée | Mode | Retour | Conditions natives |', '| --- | --- | --- | --- | --- | --- |',
    ...data.nativeIndex.edges.map(e => `| ${e.id} | [${e.a}](#${anchor(e.a)}) | [${e.b}](#${anchor(e.b)}) | ${md(e.kind)} | ${e.bidirectional ? 'oui' : 'non'} | ${md([e.gate && 'drapeau ' + e.gate, e.after && 'après ' + e.after].filter(Boolean).join(' ; ') || 'aucune')} |`), '',
    '### Index du codex', '', '| ID | Notice | Catégorie native | Classification native | Salle |', '| --- | --- | --- | --- | --- |',
    ...data.nativeIndex.codex.map(c => `| ${c.id} | ${md(c.title)} | ${md(c.category)} | ${md(c.classification || c.status || 'non précisée')} | ${md(c.room || '—')} |`), '',
    '**Source :** ' + refsMd(['campaign']), '');
  lines.push('## Registre complet des images', '', 'Les dimensions, pivots et points d’attache ci-dessous proviennent du manifeste courant. Les coordonnées sont des pixels de l’image entière ; les images originales restent inchangées.', '');
  for (const asset of data.assets) lines.push(`### ${asset.id}`, '', `[Ouvrir le PNG](${localLink(asset.path)}) · ${assetSummary(asset)}.`, '', asset.integrationNote, '',
    `- Chemin : ${asset.path}`, `- Provenance technique : ${asset.provenance}`, `- SHA-256 : ${asset.sha256}`, `- Taille : ${asset.sizeBytes} octets`, `- Géométrie : ${technicalAnchors(asset)}`, '');
  if (data.coverage.unassignedAssetIds?.length) lines.push('Images restant à rattacher à une fiche : ' + data.coverage.unassignedAssetIds.join(', ') + '.', '');
  lines.push('## Backlog et inconnues', '', 'Ce registre recense les manques détectables dans les données examinées. Il ne prétend pas énumérer les personnages, objets ou scènes de l’intégralité du roman.', '');
  for (const gap of data.gaps) lines.push(`<a id="${anchor(gap.id)}"></a>`, '', `### ${gap.priority} · ${gap.title}`, '', `**Type :** ${gap.kind}. **État :** ${gap.status || 'ouvert'}.`, '', gap.description || '', '', '**Critère de fermeture :** ' + gap.acceptance, '', '**Sources :** ' + refsMd(gap.sourceRefs), '');
  lines.push('## Sources et méthode', '');
  for (const source of data.sources) lines.push(`### ${source.id} — ${source.title}`, '', `**Nature :** ${source.kind}. **Portée :** ${source.scope}`, '', `[Consulter la source](${sourceLink(source)})`, '', source.limitations || '', '');
  lines.push('## Régénérer et contrôler', '', '```sh', 'node scripts/generate-mer-bible-20261126.mjs', 'node scripts/generate-mer-bible-20261126.mjs --check', 'node scripts/generate-mer-bible-20261126.mjs --refresh-assets', '```', '',
    'Le premier appel produit Markdown et HTML depuis le JSON. Le contrôle vérifie les références, les huit catégories, les fichiers liés, le manifeste courant et la reproduction exacte des deux sorties. Le rafraîchissement des images met à jour le registre et les préfixes explicitement associés ; une image sans fiche est signalée, jamais déclarée intégrée par déduction. Aucun de ces appels ne modifie le DLC original, les images ou les règles d’admission.', '');
  return lines.join('\n');
}

function gallery(assets) {
  return '<div class="asset-grid">' + assets.map(asset => `<figure><a href="${html(localLink(asset.path))}" title="Ouvrir ${html(asset.id)}"><img src="${html(localLink(asset.path))}" alt="${html(asset.id)} — interprétation du projet" loading="lazy" decoding="async" width="${asset.width}" height="${asset.height}"></a><figcaption><strong>${html(asset.id)}</strong><br>${html(assetSummary(asset))}<br>${html(asset.integrationNote)}</figcaption></figure>`).join('') + '</div>';
}
function renderEntry(entry) {
  const assets = arr(entry.art.assetIds).map(id => index.assets.get(id)), facts = factsFor(entry);
  const search = JSON.stringify(entry) + ' ' + facts.map(f => f.subjectId).join(' ');
  const state = assets.length ? 'png' : 'sans-png';
  return `<details class="entry" id="${anchor(entry.id)}" data-category="${entry.category}" data-art="${state}" data-search="${html(search)}"><summary><span><small>${html(entry.subtype)} · ${html(entry.id)}</small><strong>${html(entry.label)}</strong></span><span class="badge">${html(entry.art.status)}</span></summary><div class="entry-body"><p class="lead">${html(entry.summary)}</p><p class="classification">${html(classify(entry))}</p><h4>Faits vérifiés et limites de continuité</h4>${facts.length ? '<ul>' + facts.map(f => `<li><a href="#fait-${html(f.id)}">${html(f.id)} · ${html(f.subjectId)}</a> — ${html(f.status)}</li>`).join('') + '</ul>' : '<p>Aucun fait primaire supplémentaire authentifié pour cette fiche. Les éléments suivants décrivent le projet.</p>'}${listHtml(entry.provenance.notes)}${entry.provenance.locators?.length ? '<details><summary>Repères dans les sources du projet</summary>' + listHtml(entry.provenance.locators) + '</details>' : ''}<h4>Présence et comportement dans le jeu</h4><p><strong>${html(entry.game.status)}</strong> — ${html(entry.game.description)}</p>${entry.game.runtimeIds?.length ? '<p class="ids">Identifiants : ' + entry.game.runtimeIds.map(html).join(', ') + '</p>' : ''}${entry.game.rooms?.length ? '<p>Salles : ' + entry.game.rooms.map(html).join(', ') + '</p>' : ''}${properties(entry).length ? '<dl class="properties">' + properties(entry).map(p => '<dt>' + html(p.label) + '</dt><dd>' + html(readable(p.value)) + '</dd>').join('') + '</dl>' : ''}${listHtml(entry.game.states)}${listHtml(entry.game.mechanics)}<h4>Direction artistique et intégration</h4><p>${html(entry.art.description)}</p>${assets.length ? gallery(assets) : '<p class="notice">Aucun PNG individuel associé. Lire le statut pour distinguer dessin natif, mention et élément non représenté.</p>'}${listHtml(entry.art.notes)}${entry.production?.brief ? '<p><strong>Consigne de réalisation.</strong> ' + html(entry.production.brief) + '</p>' : ''}${entry.production?.invariants?.length ? '<h5>Invariants</h5>' + listHtml(entry.production.invariants) : ''}${entry.production?.unknowns?.length ? '<h5>À confirmer</h5>' + listHtml(entry.production.unknowns) : ''}${entry.backlogIds?.length ? '<p>Tâches : ' + entry.backlogIds.map(id => '<a href="#' + anchor(id) + '">' + html(index.gaps.get(id).title) + '</a>').join(' · ') + '</p>' : ''}${entry.relatedEntryIds?.length ? '<p>Fiches liées : ' + entry.relatedEntryIds.map(id => '<a href="#' + anchor(id) + '">' + html(index.entries.get(id).label) + '</a>').join(' · ') + '</p>' : ''}<p class="sources">Sources : ${refsHtml(entry.sourceRefs)}</p></div></details>`;
}
function concordanceHtml() {
  const table = (headers, rows) => '<div class="table-scroll"><table><thead><tr>' + headers.map(h => '<th>' + html(h) + '</th>').join('') + '</tr></thead><tbody>' + rows.map(row => '<tr>' + row.map(value => '<td>' + html(value) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
  return '<section id="concordance" class="appendix"><h2>Concordance du contenu natif</h2><p>' + html(data.nativeIndex.description) + '</p><details><summary>' + data.nativeIndex.chapters.length + ' chapitres de campagne</summary>' + table(['ID', 'Chapitre du jeu', 'Objectifs'], data.nativeIndex.chapters.map(c => [c.id, c.number + '. ' + c.title, c.objectiveIds.join(', ')])) + '</details><details><summary>' + data.nativeIndex.edges.length + ' liaisons du graphe</summary>' + table(['Liaison', 'Départ', 'Arrivée', 'Mode', 'Retour', 'Conditions'], data.nativeIndex.edges.map(e => [e.id, e.a, e.b, e.kind, e.bidirectional ? 'oui' : 'non', [e.gate && 'drapeau ' + e.gate, e.after && 'après ' + e.after].filter(Boolean).join(' ; ') || 'aucune'])) + '</details><details><summary>' + data.nativeIndex.codex.length + ' notices du codex</summary><p>Les classifications reproduisent le registre local. Elles ne constituent pas une nouvelle preuve externe et les notices de mécaniques ne sont pas converties en objets diégétiques.</p>' + table(['ID', 'Notice', 'Catégorie native', 'Classification native', 'Salle'], data.nativeIndex.codex.map(c => [c.id, c.title, c.category, c.classification || c.status || 'non précisée', c.room || '—'])) + '</details><p class="sources">' + refsHtml(['campaign']) + '</p></section>';
}
function factsHtml() {
  return '<section id="preuves" class="appendix"><h2>Registre des faits externes</h2><p>Chaque constat apparaît une fois. Les fiches renvoient ici pour distinguer extrait, index, déclaration d’auteur et adaptation audio.</p>' + data.facts.map(f => '<article id="fait-' + html(f.id) + '"><h3>' + html(f.id) + ' · ' + html(f.subjectId) + '</h3><p class="badge">' + html(f.status) + '</p><p>' + html(f.claim) + '</p><p class="sources">' + refsHtml(f.sourceRefs) + '</p></article>').join('') + '</section>';
}
function renderHtml() {
  const sections = data.categories.map(category => `<section class="category" id="${category.id}" aria-labelledby="title-${category.id}"><header><p class="eyebrow">${html(category.label)}</p><h2 id="title-${category.id}">${html(category.label)} <span>${data.entries.filter(e => e.category === category.id).length} fiches</span></h2><p>${html(category.description)}</p></header>${data.entries.filter(e => e.category === category.id).map(renderEntry).join('')}</section>`).join('');
  const backlog = data.gaps.map(g => `<details class="gap" id="${anchor(g.id)}"><summary><span class="priority">${html(g.priority)}</span> ${html(g.title)}</summary><div><p><strong>${html(g.kind)} · ${html(g.status || 'ouvert')}</strong></p><p>${html(g.description)}</p><p><strong>Critère de fermeture.</strong> ${html(g.acceptance)}</p><p class="sources">${refsHtml(g.sourceRefs)}</p></div></details>`).join('');
  const sources = data.sources.map(s => `<li id="source-${html(s.id)}"><strong>${html(s.title)}</strong> <span class="badge">${html(s.kind)}</span><p>${html(s.scope)}</p><p>${html(s.limitations)}</p><a href="${html(sourceLink(s))}">Consulter la source</a></li>`).join('');
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${html(data.title)}</title><style>
:root{color-scheme:dark;--bg:#101c21;--panel:#182a30;--line:#355057;--text:#e4e7dd;--muted:#aec1bc;--accent:#e0c28d;--teal:#8acbb9}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.6 system-ui,sans-serif}a{color:var(--teal);text-underline-offset:.2em}a:hover{color:#fff}header.hero{padding:52px max(24px,calc((100vw - 1260px)/2));background:linear-gradient(115deg,#273c40,#13242b);border-bottom:1px solid var(--line)}.eyebrow{text-transform:uppercase;letter-spacing:.14em;font-size:.75rem;color:var(--accent)}h1{font:600 clamp(2rem,4vw,3.9rem)/1.12 Georgia,serif;max-width:980px;margin:.4em 0}h2{font:500 2rem/1.2 Georgia,serif;margin:.2em 0 .6em}h2 span{font:500 .9rem system-ui;color:var(--muted);white-space:nowrap}h3,h4{color:var(--accent)}h4{margin:2em 0 .6em}h5{font-size:1rem;margin:1em 0 .3em}.hero>p{max-width:980px}.stats{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}.stats span{border:1px solid #57716d;padding:10px 16px;background:#101c2144}.layout{max-width:1308px;margin:auto;display:grid;grid-template-columns:220px minmax(0,1fr);gap:34px;padding:32px 24px}aside nav{position:sticky;top:20px}nav a{display:block;padding:7px 0;text-decoration:none}nav .divider{border-top:1px solid var(--line);margin-top:14px;padding-top:14px}main{min-width:0}.intro,.toolbar,.category,.appendix{margin:0 0 32px}.intro{padding:24px;border:1px solid var(--line);background:#15252b}.notice{color:var(--muted);border-left:3px solid var(--accent);padding-left:16px}.toolbar{display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px;padding:18px;background:var(--panel);border:1px solid var(--line)}label{display:grid;gap:5px;font-size:.85rem}input,select,button{font:inherit;color:var(--text);background:#0c1c22;border:1px solid #547079;border-radius:3px;padding:9px 10px;min-width:0}button{cursor:pointer}button:hover{background:#28464b}button:focus-visible,a:focus-visible,input:focus-visible,summary:focus-visible,select:focus-visible{outline:3px solid var(--accent);outline-offset:3px}.tools{grid-column:1/-1;display:flex;gap:10px;align-items:center;flex-wrap:wrap}.tools p{margin:0 0 0 auto;color:var(--muted);font-size:.85rem}.category>header{padding:10px 0 14px;border-bottom:1px solid var(--line);margin-bottom:16px}.category>header p:last-child{color:var(--muted)}details.entry,details.gap{border:1px solid var(--line);margin:10px 0;background:var(--panel);scroll-margin-top:24px}summary{cursor:pointer;padding:16px 20px}.entry summary{display:flex;justify-content:space-between;align-items:center;gap:16px}.entry summary>span:first-child{display:grid;gap:3px}.entry summary strong{font-size:1.1rem}.entry summary small{color:var(--muted);font-size:.75rem}.entry[open]>summary,.gap[open]>summary{border-bottom:1px solid var(--line)}.entry-body,.gap>div{padding:8px 22px 24px}.lead{font-size:1.06rem}.badge{font-size:.73rem;padding:3px 8px;border:1px solid #6a8075;color:#d5dcc3;line-height:1.4}.classification{color:var(--teal);font-size:.86rem}.sources{display:block;font-size:.77rem;color:var(--muted);margin-top:10px}.sources a{margin-right:6px}.properties{display:grid;grid-template-columns:minmax(120px,1fr) 2fr;gap:1px;background:var(--line);border:1px solid var(--line)}dt,dd{padding:8px 10px;margin:0;background:#14252b;overflow-wrap:anywhere}dt{color:var(--muted)}.ids{font: .78rem/1.6 ui-monospace,monospace;color:var(--muted)}.asset-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:12px}.asset-grid figure{margin:0;min-width:0;border:1px solid var(--line);background:#0e2026}.asset-grid img{display:block;width:100%;height:220px;object-fit:contain;background:radial-gradient(ellipse at 50% 45%,#314647,#112329 70%);padding:8px}.asset-grid figcaption{padding:10px;font-size:.73rem;overflow-wrap:anywhere}.asset-grid strong{color:var(--accent)}ul,ol{padding-left:22px}li{margin:.45em 0}.priority{display:inline-block;color:var(--accent);min-width:32px}.source-list>li{padding:16px 0;border-bottom:1px solid var(--line)}.source-list p{font-size:.9rem;margin:.5em 0}.commands{white-space:pre-wrap;overflow-wrap:anywhere;background:#07171c;padding:18px;border:1px solid var(--line);font-size:.8rem}.table-scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:.85rem}th,td{text-align:left;padding:9px;border-bottom:1px solid var(--line);vertical-align:top}th{color:var(--accent)}#preuves article{border-bottom:1px solid var(--line);padding:6px 0 16px;scroll-margin-top:20px}footer{padding:24px;text-align:center;color:var(--muted);font-size:.8rem;border-top:1px solid var(--line)}[hidden]{display:none!important}@media(max-width:850px){.layout{grid-template-columns:1fr}.layout aside nav{position:static;display:flex;gap:14px;flex-wrap:wrap}nav .divider{border:0;padding:7px 0;margin:0}.toolbar{grid-template-columns:1fr}.entry summary{align-items:flex-start;flex-direction:column}.properties{grid-template-columns:1fr}header.hero{padding:28px 24px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}@media print{body{background:white;color:black;font:11pt/1.4 serif}.hero{background:white!important;color:black}.layout{display:block;max-width:none;padding:0}aside,.toolbar,footer{display:none}.entry,.intro,.gap{background:white!important;color:black;border-color:#888;break-inside:avoid}h1,h2,h3,h4,h5,a,.classification,.badge,.sources,.notice{color:black!important}.asset-grid img{background:#eee}.asset-grid img{height:150px}dt,dd{background:white}summary{font-weight:bold}.badge{border-color:#888}}
</style></head><body><header class="hero"><p class="eyebrow">Aliens Tantalus Project · document de production</p><h1>${html(data.title)}</h1><p>${html(data.subtitle)}</p><p class="notice">Sources uniquement. Les sujets attestés, les choix de jeu et les détails encore inconnus sont séparés dans chaque fiche.</p><div class="stats"><span><strong>8</strong> catégories</span><span><strong>${data.entries.length}</strong> fiches</span><span><strong>${data.assets.length}</strong> PNG référencés</span><span><strong>${data.gaps.length}</strong> tâches et limites</span></div></header><div class="layout"><aside><nav aria-label="Sections de la bible">${data.categories.map(c => '<a href="#' + c.id + '">' + html(c.label) + '</a>').join('')}<a class="divider" href="#preuves">Faits externes</a><a href="#concordance">Concordance native</a><a href="#registre-images">Registre des images</a><a href="#backlog">Backlog et inconnues</a><a href="#sources">Sources et méthode</a><a href="BIBLE.md">Version Markdown</a><a href="BIBLE.json">Données JSON</a></nav></aside><main><section class="intro"><h2>Périmètre</h2><p>${html(data.scope.description)}</p>${listHtml(data.scope.boundaries)}<details><summary>Lire les états et les preuves</summary>${listHtml(data.stateGuide)}${data.evidence.map(e => '<p><strong>' + html(e.label) + '</strong> — ' + html(e.description) + '<span class="sources">' + refsHtml(e.sourceRefs) + '</span></p>').join('')}</details></section><section class="toolbar" aria-label="Recherche dans les fiches"><label>Rechercher un nom, un ID, une règle<input id="search" type="search" placeholder="Decker, s33, mousse, inconnu…"></label><label>Catégorie<select id="category"><option value="">Toutes les catégories</option>${data.categories.map(c => '<option value="' + c.id + '">' + html(c.label) + '</option>').join('')}</select></label><label>Illustrations associées<select id="art"><option value="">Tous les états</option><option value="png">Avec PNG associé</option><option value="sans-png">Sans PNG individuel</option></select></label><div class="tools"><button id="expand" type="button">Déplier les fiches visibles</button><button id="collapse" type="button">Replier les fiches</button><button id="reset" type="button">Réinitialiser</button><p id="count" aria-live="polite">${data.entries.length} fiches</p></div></section>${sections}${factsHtml()}${concordanceHtml()}<section id="registre-images" class="appendix"><h2>Registre complet des images</h2><p>Les surfaces déclarées ne prouvent pas à elles seules une présence naturelle dans une salle. La fiche distingue raccordement, appel naturel et observation.</p><details><summary>Ouvrir les ${data.assets.length} aperçus — chargement à la demande</summary>${gallery(data.assets)}</details><details><summary>Empreintes et coordonnées source</summary>${data.assets.map(a => '<p><strong>' + html(a.id) + '</strong><br><span class="ids">' + html(a.sha256) + '</span><br>' + html(technicalAnchors(a)) + '</p>').join('')}</details></section><section id="backlog" class="appendix"><h2>Backlog et inconnues</h2><p>Manques détectables dans les données et les sources examinées ; aucune exhaustivité de l’intégralité du roman n’est revendiquée.</p>${backlog}</section><section id="sources" class="appendix"><h2>Sources et méthode</h2><ol class="source-list">${sources}</ol><h3>Régénérer et contrôler</h3><pre class="commands">node scripts/generate-mer-bible-20261126.mjs
node scripts/generate-mer-bible-20261126.mjs --check
node scripts/generate-mer-bible-20261126.mjs --refresh-assets</pre><p>Le générateur ne modifie ni simulation, ni images, ni admissions. Ce fichier, le Markdown et le JSON restent des documents de développement exclus du build public.</p></section></main></div><footer>Révision ${html(data.revision)} · base ${html(data.baseCommit)} · le texte intégral du roman n’a pas été confronté.</footer><script>
(() => { 'use strict';
 const search=document.getElementById('search'),category=document.getElementById('category'),art=document.getElementById('art'),count=document.getElementById('count');
 const entries=[...document.querySelectorAll('.entry')],sections=[...document.querySelectorAll('.category')];
 const normalize=value=>value.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLocaleLowerCase('fr');
 const searchable=new Map(entries.map(entry=>[entry,normalize(entry.dataset.search)]));
 function update(){const tokens=normalize(search.value).split(/\\s+/).filter(Boolean);let visible=0;for(const entry of entries){entry.hidden=!!(category.value&&entry.dataset.category!==category.value||art.value&&entry.dataset.art!==art.value||tokens.some(token=>!searchable.get(entry).includes(token)));if(!entry.hidden)visible++;}for(const section of sections)section.hidden=![...section.querySelectorAll('.entry')].some(entry=>!entry.hidden);count.textContent=visible+' / '+entries.length+' fiches';}
 for(const control of [search,category,art])control.addEventListener('input',update);
 document.getElementById('expand').addEventListener('click',()=>entries.filter(e=>!e.hidden).forEach(e=>e.open=true));
 document.getElementById('collapse').addEventListener('click',()=>entries.forEach(e=>e.open=false));
 document.getElementById('reset').addEventListener('click',()=>{search.value='';category.value='';art.value='';update();});
 function reveal(){const id=decodeURIComponent(location.hash.slice(1));if(!id)return;const target=document.getElementById(id);if(!target)return;if(target.classList.contains('entry')){search.value='';category.value='';art.value='';update();target.open=true;}if(target.classList.contains('gap'))target.open=true;}
 window.addEventListener('hashchange',reveal);reveal();
})();
</script></body></html>\n`;
}
const outputs = new Map([[resolve(directory, 'BIBLE.md'), renderMarkdown()], [resolve(directory, 'BIBLE.html'), renderHtml()]]);
for (const [path, bytes] of outputs) {
  if (args.has('--check')) assert.equal(readFileSync(path, 'utf8'), bytes, 'Generated bible output is stale: ' + relative(repo, path));
  else writeFileSync(path, bytes);
}
console.log(JSON.stringify({ mode: args.has('--check') ? 'check' : args.has('--refresh-assets') ? 'refresh-assets' : 'generate', categories: data.categories.length, entries: data.entries.length, assets: data.assets.length, facts: data.facts.length, sources: data.sources.length, gaps: data.gaps.length, unassignedAssets: data.coverage.unassignedAssetIds || [], outputs: [...outputs.keys()].map(path => relative(repo, path)), sourceOnly: true }, null, 2));
