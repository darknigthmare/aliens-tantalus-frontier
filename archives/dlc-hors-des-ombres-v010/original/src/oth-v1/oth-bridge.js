/** Additive launcher: isolated runtime, no mutation of the host campaign registry. */
const ID='oth-marion-launcher-v1';
function install(){
 const panel=document.querySelector('[data-panel="operations"]');
 if(!panel||document.getElementById(ID))return;
 const card=document.createElement('article');card.id=ID;card.className='panel';
 card.style.cssText='margin:20px 0;padding:24px;border:1px solid #716749;background:linear-gradient(120deg,#122321,#10191d);color:#dedfd4;';
 const kicker=document.createElement('p');kicker.textContent='ARCHIVES · CHRONIQUE DU MARION';kicker.style.cssText='font-size:11px;letter-spacing:.16em;color:#d2bd7f';
 const title=document.createElement('h3');title.textContent='ALIEN — Hors des ombres';
 const text=document.createElement('p');text.textContent='Le Marion ne répond plus. Retrouvez Hoop et Ripley entre l’orbite de LV-178 et ses profondeurs. La chronique dispose de son propre carnet de sauvegarde.';
 const button=document.createElement('button');button.type='button';button.className='button primary';button.textContent='Ouvrir la chronique';
 button.addEventListener('click',()=>{document.getElementById('quick-save')?.click();window.location.assign('/dlc/alien-hors-des-ombres/index.html?from=tantalus');});
 card.append(kicker,title,text,button);const anchor=panel.querySelector('.section-intro');if(anchor)anchor.after(card);else panel.prepend(card);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
