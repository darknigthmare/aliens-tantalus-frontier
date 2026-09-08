import { getTacticalReloadHudV77 } from './tactical-reload-v77.js';

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const positive = (value, fallback) => Number.isFinite(value) && value > 0 ? value : fallback;

function visibleOverlayRectV77(document, viewport, selector) {
  const element = document?.querySelector?.(selector);
  if (!element || element.hidden || element.getAttribute?.('aria-hidden') === 'true') return null;
  const style = viewport?.getComputedStyle?.(element);
  if (style?.display === 'none' || ['hidden', 'collapse'].includes(style?.visibility) || style?.opacity === '0') return null;
  const rect = element.getBoundingClientRect?.();
  if (!rect || !(rect.width > 0) || !(rect.height > 0) || !Number.isFinite(rect.left) || !Number.isFinite(rect.top)) return null;
  return { left: rect.left, top: rect.top, right: rect.left + rect.width, bottom: rect.top + rect.height, width: rect.width, height: rect.height };
}

function overlayClearanceV77(engine, rect, viewport, cssHeight, groupLeft, groupRight) {
  const document = engine.canvas?.ownerDocument;
  const measured = typeof document?.querySelector === 'function' && Number.isFinite(rect?.left) && Number.isFinite(rect?.top);
  const result = { measured, topCss: 0, bottomCss: cssHeight, toolbar: null, touch: null };
  if (!measured) return result;
  const intersects = (overlay) => overlay && overlay.right > rect.left + groupLeft && overlay.left < rect.left + groupRight
    && overlay.bottom > rect.top && overlay.top < rect.top + cssHeight;
  result.toolbar = visibleOverlayRectV77(document, viewport, '#retreat-mission')
    || visibleOverlayRectV77(document, viewport, '.game-toolbar');
  result.touch = visibleOverlayRectV77(document, viewport, '.mission-touch-controls');
  // Rectangles are viewport-relative; subtract the canvas letterbox offset,
  // not a fixed viewport margin, before finding its genuinely usable band.
  if (intersects(result.toolbar)) result.topCss = clamp(result.toolbar.bottom - rect.top + 4, 0, cssHeight);
  if (intersects(result.touch)) result.bottomCss = clamp(result.touch.top - rect.top - 4, 0, cssHeight);
  return result;
}

/** Coordinates are canvas pixels; css boxes make the actual on-screen sizes inspectable. */
export function getTacticalReloadLayoutV77(engine) {
  const canvasWidth = positive(engine.canvas?.width, 1280);
  const canvasHeight = positive(engine.canvas?.height, 720);
  const rect = engine.canvas?.getBoundingClientRect?.();
  const scale = positive(rect?.width, canvasWidth) / canvasWidth;
  const cssWidth = canvasWidth * scale;
  const cssHeight = canvasHeight * scale;
  const compact = cssWidth < 960;
  const viewport = engine.canvas?.ownerDocument?.defaultView || globalThis.window;
  const narrowLandscape = positive(viewport?.innerWidth, Infinity) <= 520
    && positive(viewport?.innerWidth, 0) > positive(viewport?.innerHeight, Infinity);
  const count = engine.coopEnabled ? 2 : 1;
  const stacked = count > 1 && cssWidth < 640;
  const gutterCss = compact ? 12 : 18 * scale;
  const gapCss = stacked ? 8 : 20;
  const rows = stacked ? count : 1;
  const heightCss = Math.min(56, Math.max(1, (cssHeight - (rows - 1) * gapCss) / rows));
  const totalHeightCss = rows * heightCss + (rows - 1) * gapCss;
  const requestedTouchReserveCss = compact ? (narrowLandscape ? 120 : 70) : 0;
  const touchReserveCss = Math.min(requestedTouchReserveCss, Math.max(0, cssHeight - totalHeightCss - 2 * gutterCss));
  const availableWidthCss = Math.max(1, cssWidth - 2 * gutterCss);
  const widthCss = Math.min(352, stacked || count === 1 ? availableWidthCss : Math.max(1, (availableWidthCss - gapCss) / count));
  const desiredY = compact ? cssHeight - touchReserveCss - gutterCss - totalHeightCss : 548 * scale;
  let originY = clamp(desiredY, 0, Math.max(0, cssHeight - totalHeightCss));
  const overlayClearance = overlayClearanceV77(engine, rect, viewport, cssHeight,
    gutterCss, Math.min(cssWidth, gutterCss + (stacked ? widthCss : count * widthCss + (count - 1) * gapCss)));
  overlayClearance.availableCss = Math.max(0, overlayClearance.bottomCss - overlayClearance.topCss);
  overlayClearance.fits = overlayClearance.availableCss >= totalHeightCss;
  if (overlayClearance.measured && overlayClearance.fits) {
    originY = clamp(originY, overlayClearance.topCss, overlayClearance.bottomCss - totalHeightCss);
  }
  const boxes = Array.from({ length: count }, (_, index) => {
    const css = {
      x: clamp(gutterCss + (stacked ? 0 : index * (widthCss + gapCss)), 0, Math.max(0, cssWidth - widthCss)),
      y: originY + (stacked ? index * (heightCss + gapCss) : 0),
      width: widthCss, height: heightCss
    };
    return { index, role: index ? 'coop' : 'player', x: css.x / scale, y: css.y / scale, width: css.width / scale, height: css.height / scale, css };
  });
  return {
    scale, cssWidth, cssHeight, compact, stacked, landscapeRecommended: cssWidth < 640,
    touchReserveCss, requestedTouchReserveCss, narrowLandscape, gutterCss, gapCss, totalHeightCss, overlayClearance, boxes,
    font: { title: 12 / scale, body: 11 / scale }
  };
}

const fitMonospace = (text, width, fontSize) => {
  const limit = Math.max(1, Math.floor(width / (fontSize * 0.62)));
  return text.length <= limit ? text : text.slice(0, Math.max(0, limit - 1)) + '…';
};

/** Compact personal readouts stay legible when the 1280px game is fitted to a phone. */
export function drawTacticalReloadHudV77(engine, ctx) {
  const layout = getTacticalReloadLayoutV77(engine);
  const pixel = 1 / layout.scale;
  for (const { index, role, x, y, width, height } of layout.boxes) {
    const actor = engine[role];
    const state = getTacticalReloadHudV77(actor);
    if (!state.visible && !state.bonusRemaining) continue;
    const padding = Math.min(12 * pixel, width / 6);
    const barX = x + padding;
    const barY = y + 29 * pixel;
    const barWidth = width - 2 * padding;
    const colors = { normal: '#91cbb1', success: '#8de9ad', perfect: '#ffe8a2', failed: '#ff9a7e' };
    ctx.save();
    ctx.fillStyle = 'rgba(3, 10, 8, .94)'; ctx.fillRect(x, y, width, height);
    ctx.lineWidth = pixel;
    ctx.strokeStyle = colors[state.result] || '#91cbb1'; ctx.strokeRect(x + 0.5 * pixel, y + 0.5 * pixel, width - pixel, height - pixel);
    ctx.font = `bold ${layout.font.title}px monospace`; ctx.fillStyle = colors[state.result] || '#91cbb1';
    const key = index ? 'T / X' : 'R / X';
    const label = state.visible ? state.label : 'CHARGEUR PARFAIT · ' + state.bonusRemaining + ' TIRS';
    ctx.fillText(fitMonospace((index ? 'J2 · ' : '') + label.toUpperCase(), barWidth, layout.font.title), x + padding, y + 19 * pixel);
    if (state.visible) {
      ctx.fillStyle = '#24352d'; ctx.fillRect(barX, barY, barWidth, 9 * pixel);
      ctx.fillStyle = '#528d68'; ctx.fillRect(barX + barWidth * state.successWindow[0], barY, barWidth * (state.successWindow[1] - state.successWindow[0]), 9 * pixel);
      ctx.fillStyle = '#fff0be'; ctx.fillRect(barX + barWidth * state.perfectWindow[0], barY - 2 * pixel, barWidth * (state.perfectWindow[1] - state.perfectWindow[0]), 13 * pixel);
      const cursor = state.attemptCursor ?? state.cursor;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(barX + barWidth * cursor - pixel, barY - 4 * pixel, 2 * pixel, 17 * pixel);
      ctx.fillStyle = '#c6d8cf'; ctx.font = `${layout.font.body}px monospace`;
      const footer = state.canAttempt ? key + ' · SECONDE PRESSION' : state.phase === 'reloading' ? 'RÉCUPÉRATION · ' + state.remaining.toFixed(1) + ' S' : state.bonusRemaining ? '+15 % · ' + state.bonusRemaining + ' TIRS MAX.' : state.phase === 'cancelled' ? 'MUNITIONS CONSERVÉES' : 'PRÊT';
      ctx.fillText(fitMonospace(footer, barWidth, layout.font.body), x + padding, y + height - 7 * pixel);
    } else {
      ctx.fillStyle = '#c6d8cf'; ctx.font = `${layout.font.body}px monospace`;
      const footer = layout.compact ? '+15 % · X / □ RECHARGER' : '+15 % AUX PROCHAINS TIRS · X / □ RECHARGER';
      ctx.fillText(fitMonospace(footer, barWidth, layout.font.body), x + padding, y + 39 * pixel);
    }
    ctx.restore();
  }
}
