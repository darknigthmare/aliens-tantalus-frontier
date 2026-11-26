/** Optional menu link. Call explicitly from the host after installing the standalone files.
 * This is NOT a native Operation/GameEngine adapter. It does not share save data.
 */
export function attachIsolationLauncher(container, url='/dlc/alien-isolation/index.html') {
  if (!(container instanceof HTMLElement)) throw new TypeError('Conteneur HTML requis.');
  const target=new URL(url,document.baseURI);
  if(target.origin!==location.origin)throw new Error('Le lanceur doit rester sur la même origine.');
  const link=document.createElement('a');
  link.href=target.href;
  link.textContent='ALIEN: ISOLATION — Dernière transmission';
  link.dataset.dlc='tantalus.alien-isolation';
  link.title='Ouvrir le prototype autonome ; sauvegarde séparée.';
  container.append(link);
  return ()=>link.remove();
}
