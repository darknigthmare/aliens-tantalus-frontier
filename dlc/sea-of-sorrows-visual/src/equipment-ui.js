/* Presentation-only additions to the original equipment screen. Native
 * buttons, inventory, input, persistence and the campaign shell stay owners
 * of all actions. This module only reads their current state. */
(function (root) {
  'use strict';
  if (!root.SoSRenderer || !root.SoSArtPack || root.SoSEquipmentArt) return;
  const doc = root.document;
  if (typeof doc?.getElementById !== 'function') return;
  const content = doc.getElementById('panelContent'), panel = doc.getElementById('panel');
  if (!content || !panel) return;
  const pack = root.SoSArtPack.assets;
  const safeSource = /^sprites\/(equipment|weapons)\/[a-z0-9-]+\.png$/;
  const element = (tag, className, text) => {
    const el = doc.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  function describe(game) {
    const state = game?.state, p = game?.p;
    if (!state || !p) return null;
    const tracker = Boolean(state.inventory?.tracker);
    return {
      lamp: { available: true, status: p.lamp ? 'Allumée' : 'Éteinte' },
      tracker: { available: tracker, status: tracker ? (p.trackerOn ? 'Lecture active' : 'En veille') : 'Non disponible' },
      // The radio has no separate inventory slot or battery in this campaign.
      // Do not invent a stock, connection quality or an acquisition event.
      radio: { available: true, status: 'Communications de mission' },
    };
  }
  function illustrate(host, category, id, glyph = false) {
    if (!host || host.querySelector('[data-sos-sprite]')) return;
    const a = pack[category]?.[id];
    if (!a || !safeSource.test(a.src) || !Number.isInteger(a.width) || !Number.isInteger(a.height)
        || a.width < 1 || a.height < 1 || a.width > 16384 || a.height > 16384) return;
    const figure = element('span', glyph ? 'sos-item-image' : 'sos-equipment-image');
    figure.dataset.sosSprite = category + '/' + id;
    figure.setAttribute('aria-hidden', 'true');
    const img = element('img');
    img.alt = ''; img.width = a.width; img.height = a.height;
    img.decoding = 'async'; img.hidden = true;
    img.onload = () => {
      if (img.naturalWidth !== a.width || img.naturalHeight !== a.height) { img.onerror(); return; }
      img.hidden = false; figure.dataset.state = 'ready';
      if (glyph) host.classList.add('sos-item-ready');
    };
    img.onerror = () => {
      img.hidden = true; figure.dataset.state = 'unavailable';
      if (glyph) host.classList.remove('sos-item-ready');
    };
    figure.append(img); host.prepend(figure); img.src = a.src;
  }
  function decorate(game) {
    if (!panel.classList.contains('open')) return;
    const values = describe(game);
    if (!values) return;
    const kit = doc.getElementById('useKit'), filter = doc.getElementById('useFilter');
    if (kit && filter && content.contains(kit) && content.contains(filter)) {
      illustrate(kit.closest('.loadout')?.querySelector('.itemGlyph'), 'equipment', 'medkit', true);
      const respirator = filter.closest('.loadout');
      illustrate(respirator?.querySelector('.itemGlyph'), 'equipment', 'filter', true);
      // The supplied PNG is the complete respirator, not a detached cartridge.
      const heading = respirator?.querySelector('h3');
      if (heading && heading.textContent !== 'Protection respiratoire') heading.textContent = 'Protection respiratoire';
      if (respirator && !respirator.querySelector('.sos-respirator-caption')) {
        respirator.append(element('small', 'sos-respirator-caption', 'Masque illustré · nombre de cartouches en réserve ci-dessus.'));
      }
      let tools = content.querySelector('#sos-equipment-tools');
      if (!tools) {
        tools = element('section', 'sos-tools'); tools.id = 'sos-equipment-tools';
        tools.setAttribute('aria-labelledby', 'sos-tools-title');
        const title = element('h3', '', 'Outils de terrain'); title.id = 'sos-tools-title'; tools.append(title);
        const grid = element('div', 'sos-tools-grid'); tools.append(grid);
        const definitions = [
          ['lamp', 'Lampe personnelle', 'L’éclairage suit la lampe portée et son réglage actuel.'],
          ['tracker', 'Détecteur de mouvement', 'Les contacts et leur portée restent ceux du détecteur de terrain.'],
          ['radio', 'Radio de liaison', 'Les communications accompagnent les dialogues et les ordres de l’expédition.'],
        ];
        for (const [id, name, description] of definitions) {
          const card = element('article', 'sos-tool'); card.dataset.tool = id;
          illustrate(card, 'equipment', id);
          card.append(element('h4', '', name), element('p', 'sos-tool-status'), element('p', 'sos-tool-description', description));
          grid.append(card);
        }
        content.append(tools);
      }
      for (const card of tools.querySelectorAll('[data-tool]')) {
        const value = values[card.dataset.tool];
        const status = card.querySelector('.sos-tool-status');
        if (status.textContent !== value.status) status.textContent = value.status;
        card.dataset.available = String(value.available);
      }
    }
    // Existing equip buttons keep their handlers and native availability guards.
    for (const button of content.querySelectorAll('[data-equip]')) {
      const card = button.closest('.referenceCard');
      illustrate(card, 'weapons', button.dataset.equip);
    }
  }
  const nativeDraw = root.SoSRenderer.prototype.draw;
  root.SoSRenderer.prototype.draw = function (...args) {
    const result = nativeDraw.apply(this, args);
    if (this.canvas?.id === 'scene') decorate(this.game);
    return result;
  };
  root.SoSEquipmentArt = Object.freeze({ version: 1, describe, decorate });
})(globalThis);
