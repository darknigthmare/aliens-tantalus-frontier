/* Additive launcher only. It does not patch Tantalus GameEngine or SaveSystem. */
(()=>{
 'use strict';
 const ownScript=document.currentScript;
 const href=new URL('JOUER_ALIEN_EARTH_V11.html',ownScript?.src||document.baseURI).href;
 const add=()=>{
  if(document.getElementById('alien-earth-v11-launcher-style'))return;
  const title=document.getElementById('title-menu'),ops=document.querySelector('[data-panel="operations"]');
  if(!title&&!ops){console.warn('Alien: Earth : points d’entrée du jeu hôte introuvables.');return;}
  const style=document.createElement('style');style.id='alien-earth-v11-launcher-style';
  style.textContent='.ae-v11-entry{display:block;border:1px solid #bcbe9166;background:#172b2d;color:#e4dbc0;padding:14px 18px;text-decoration:none;line-height:1.5;letter-spacing:.03em;font:500 14px Arial,sans-serif}.ae-v11-entry:hover{background:#2c4140}.ae-v11-entry small{display:block;font-size:11px;color:#a7b8aa;letter-spacing:0;margin-top:4px}#alien-earth-v11-card{margin:20px 0;border-left:3px solid #d6c388}#title-menu .ae-v11-entry{margin-top:8px;font-size:12px}';
  document.head.append(style);
  const entry=(id,caption,sub)=>{const a=document.createElement('a');a.id=id;a.className='ae-v11-entry';a.href=href;a.target='_blank';a.rel='noopener noreferrer';a.append(document.createTextNode(caption));if(sub){const small=document.createElement('small');small.textContent=sub;a.append(small);}return a;};
  if(title&&!document.getElementById('alien-earth-v11-title'))title.append(entry('alien-earth-v11-title','ALIEN: EARTH','Campagne additionnelle · saison 1 · fidélité renforcée'));
  if(ops&&!document.getElementById('alien-earth-v11-card'))ops.append(entry('alien-earth-v11-card','ALIEN: EARTH — Les enfants de Neverland','Ouvrir la campagne dans un autre onglet. Sauvegarde indépendante de la campagne stratégique.'));
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add,{once:true});else add();
})();
