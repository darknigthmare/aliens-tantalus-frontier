(function (root) {
  'use strict';
  const labels = {
    characters: 'Personnages', decor: 'Décors', obstacles: 'Obstacles',
    creatures: 'Créatures', corpses: 'Restes', equipment: 'Équipement',
    weapons: 'Armes', effects: 'Effets', devices: 'Dispositifs', doors: 'Portes',
    objectives: 'Objectifs', organic: 'Organismes', parasites: 'Parasites', stretchers: 'Brancards',
  };
  const names = {
    foam: 'Mousse', cryo: 'Capsule de stase', valve: 'Vanne', crate: 'Caisse',
    rack: 'Râtelier', pipe: 'Canalisation', rib: 'Nervure', resin: 'Résine',
    'silica-rubble': 'Débris de silice', facehugger: 'Facehugger', sensor: 'Capteur',
    normal: 'Parasite standard', royal: 'Parasite royal', 'bulkhead-frame': 'Cadre de cloison',
    'bulkhead-panel': 'Panneau de cloison', 'decker-ready': 'Decker · prêt',
    'decker-crouch': 'Decker · accroupi', 'decker-crouch-ready': 'Decker · accroupi, prêt',
    'decker-dodge': 'Decker · esquive', 'decker-dodge-ready': 'Decker · esquive, prêt',
    'manning-ready': 'Manning · prêt',
    'decker-walk-a': 'Decker · marche, contact A', 'decker-walk-b': 'Decker · marche, contact B',
    filter: 'Masque respiratoire', medkit: 'Trousse de terrain', radio: 'Radio de liaison',
    tracker: 'Détecteur de mouvement', lamp: 'Lampe personnelle',
    'light-panel': 'Commande d’éclairage', 'shutter-control': 'Commande de cloison',
    acid: 'Nappe d’acide', flame: 'Flamme', impact: 'Impact', muzzle: 'Éclair de bouche', spark: 'Étincelles',
  };
  const $ = id => document.getElementById(id);
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const title = (id, entry) => entry.label || names[id] || id.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/-/g, ' ').replace(/^./, x => x.toUpperCase());
  const entries = Object.entries(root.SoSArtPack?.assets || {}).flatMap(([group, values]) =>
    Object.entries(values).map(([id, entry]) => ({ group, id, entry, title: title(id, entry) }))
  ).filter(({ entry }) => /^sprites\/[a-z-]+\/[A-Za-z0-9-]+\.png$/.test(entry.src));
  let category = 'all';
  let opener = null;
  const count = $('count');
  const grid = $('grid');
  const dialog = $('detail');
  const cards = entries.map(item => {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.asset = item.group + '/' + item.id;
    const preview = document.createElement('button');
    preview.type = 'button';
    preview.className = 'preview';
    preview.setAttribute('aria-label', 'Agrandir : ' + item.title);
    const img = document.createElement('img');
    img.src = item.entry.src;
    img.alt = item.title;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = item.entry.width;
    img.height = item.entry.height;
    img.addEventListener('error', () => { card.dataset.error = 'true'; });
    preview.append(img);
    preview.addEventListener('click', () => {
      opener = preview;
      $('detail-title').textContent = item.title;
      $('detail-image').src = item.entry.src;
      $('detail-image').alt = item.title;
      $('detail-meta').textContent = (labels[item.group] || item.group) + ' · ' + item.entry.width + ' × ' + item.entry.height + ' px';
      $('detail-download').href = item.entry.src;
      $('detail-download').download = item.group + '-' + item.id + '.png';
      dialog.showModal();
    });
    const caption = document.createElement('div');
    caption.className = 'caption';
    const heading = document.createElement('h2');
    heading.textContent = item.title;
    const meta = document.createElement('p');
    meta.textContent = (labels[item.group] || item.group) + ' · ' + item.entry.width + ' × ' + item.entry.height;
    const download = document.createElement('a');
    download.href = item.entry.src;
    download.download = item.group + '-' + item.id + '.png';
    download.textContent = 'Télécharger le PNG';
    caption.append(heading, meta, download);
    card.append(preview, caption);
    grid.append(card);
    return { ...item, card, search: normalize(item.title + ' ' + item.id + ' ' + item.group + ' ' + labels[item.group]) };
  });
  const filterButtons = [];
  function applyFilter() {
    const query = normalize($('search').value.trim());
    let shown = 0;
    for (const item of cards) {
      const visible = (category === 'all' || category === item.group) && (!query || item.search.includes(query));
      item.card.hidden = !visible;
      if (visible) shown++;
    }
    count.textContent = shown + ' / ' + cards.length + ' sprites';
    $('empty').hidden = shown !== 0;
    for (const [key, button] of filterButtons) button.setAttribute('aria-pressed', String(key === category));
  }
  for (const group of ['all', ...new Set(entries.map(item => item.group))]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = group === 'all' ? 'Tout voir' : labels[group] || group;
    button.dataset.category = group;
    button.addEventListener('click', () => { category = group; applyFilter(); });
    $('filters').append(button);
    filterButtons.push([group, button]);
  }
  $('search').addEventListener('input', applyFilter);
  for (const button of document.querySelectorAll('button[data-backdrop]')) {
    button.addEventListener('click', () => {
      document.body.dataset.backdrop = button.dataset.backdrop;
      for (const other of document.querySelectorAll('button[data-backdrop]')) other.setAttribute('aria-pressed', String(other === button));
    });
  }
  $('close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { $('detail-image').removeAttribute('src'); opener?.focus(); });
  applyFilter();
})(globalThis);
