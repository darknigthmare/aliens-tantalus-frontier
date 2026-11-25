// The preserved standalone game owns its simulation and persistence. This shell
// adds only navigation and focus; it never reads or writes either game's saves.
export function mountRiverOfPainShell(documentRef = globalThis.document) {
  const frame = documentRef?.getElementById('river-of-pain-game');
  const returnLink = documentRef?.getElementById('river-return-tantalus');
  const focusButton = documentRef?.getElementById('river-focus-game');
  const loading = documentRef?.getElementById('river-loading');
  if (!frame || !returnLink || !focusButton) return null;
  let gameWindow = null;
  const capture = { capture: true };
  const focusGame = () => {
    frame.focus();
    frame.contentWindow?.focus();
  };
  const focusReturn = event => {
    if (event.code !== 'F6' || event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    returnLink.focus();
  };
  const bindGameWindow = () => {
    gameWindow?.removeEventListener('keydown', focusReturn, capture);
    gameWindow = frame.contentWindow;
    gameWindow?.addEventListener('keydown', focusReturn, capture);
    if (loading) loading.hidden = true;
  };
  focusButton.addEventListener('click', focusGame);
  frame.addEventListener('load', bindGameWindow);
  documentRef.addEventListener('keydown', focusReturn, capture);
  // A cached local page may finish before this module evaluates. Never bind
  // about:blank and declare the game loaded before its actual document exists.
  if (frame.contentDocument?.readyState === 'complete' && frame.contentDocument.URL !== 'about:blank') bindGameWindow();
  return {
    focusGame,
    dispose() {
      focusButton.removeEventListener('click', focusGame);
      frame.removeEventListener('load', bindGameWindow);
      documentRef.removeEventListener('keydown', focusReturn, capture);
      gameWindow?.removeEventListener('keydown', focusReturn, capture);
    }
  };
}

if (globalThis.document?.querySelector('[data-river-shell]')) mountRiverOfPainShell();
