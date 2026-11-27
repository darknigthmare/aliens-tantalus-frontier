/* Additive launcher only: no native campaign records or saves are modified. */
(function(){'use strict';
 const current=document.currentScript;
 const entry=current?.dataset.covenantEntry||new URL('index.html?from=tantalus',current?.src||location.href).href;
 if(window.__ATF_COVENANT_LAUNCHER_V1__)return;
 window.__ATF_COVENANT_LAUNCHER_V1__=true;
 const style=document.createElement('style');style.id='covenant-launcher-style';
 style.textContent='[data-covenant-entry]{border:1px solid #84987066;background:#14251d;padding:22px;margin:20px 0;color:#d5d8bd}[data-covenant-entry] h3{font:28px Georgia,serif;margin:0 0 12px}[data-covenant-entry] p{line-height:1.6;max-width:720px}[data-covenant-entry] button{padding:12px 18px;background:#c4c59e;color:#122218;border:0;border-radius:3px;cursor:pointer}';
 document.head.append(style);
 function button(id,label){const b=document.createElement('button');b.id=id;b.type='button';b.textContent=label;b.dataset.covenantTarget=entry;b.addEventListener('click',()=>location.assign(entry));return b;}
 function attach(){
  const menu=document.getElementById('title-menu');if(menu&&!document.getElementById('title-covenant'))menu.append(button('title-covenant','ALIEN: COVENANT'));
  const operations=document.querySelector('[data-panel="operations"]');
  if(operations&&!operations.querySelector('[data-covenant-entry]')){
   const card=document.createElement('section');card.dataset.covenantEntry='1';card.setAttribute('aria-label','Campagne Alien Covenant');
   const h=document.createElement('h3');h.textContent='Alien: Covenant — Le paradis perdu';
   const p=document.createElement('p');p.textContent='Une voix humaine. Un monde silencieux. Retrouvez le Covenant dans une campagne indépendante de douze chapitres, avec sa propre archive de progression.';
   card.append(h,p,button('operations-covenant','Commencer l’expédition'));
   const intro=operations.querySelector('.section-intro');if(intro)intro.after(card);else operations.prepend(card);
  }
 }
 let queued=false;const watch=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;attach()})});
 attach();watch.observe(document.body,{childList:true,subtree:true});
})();
