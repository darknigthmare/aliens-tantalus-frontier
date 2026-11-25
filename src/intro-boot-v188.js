// V188 — runs before the first paint (classic script in <head>).
// 1. A reload in the same browser session shows the short starfield fade, never the credit text.
// 2. The title's star bitmaps start loading now; the credit's stars fade in only once both are
//    decoded (or failed), so they never pop in. They are the same files the title menu shows.
(() => {
  const root = document.documentElement;
  try { if (sessionStorage.getItem('atf-intro-seen-v188') === '1') root.dataset.introV188 = 'short'; } catch { /* storage optional */ }
  const sources = ['/assets/openai/ui/title/v79/stars/stars-01-distant-field.png', '/assets/openai/ui/title/v79/stars/stars-02-near-sparks.png'];
  let settled = 0;
  const settle = () => { settled += 1; if (settled === sources.length) root.dataset.introStarsV188 = 'ready'; };
  for (const src of sources) {
    const image = new Image(); let done = false;
    const once = () => { if (!done) { done = true; settle(); } };
    image.onload = () => (image.decode ? image.decode().then(once, once) : once());
    image.onerror = once; image.src = src;
  }
})();
