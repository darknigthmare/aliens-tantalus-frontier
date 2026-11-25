/* Read-only register plus local, interruptible commands. No remote interaction. */
(function(root){'use strict';
root.ROP_DUCTS_UI=function({getSim,openDialog,closeDialog,events,esc}){
 const V=root.ROP_DUCTS,D=root.ROP_DATA;
 function panel(focus=null){
  const sim=getSim(),s=sim.s,local=D.ducts.mouths.filter(d=>d.room===s.room);
  const card=d=>{const v=s.ducts.mouths[d.id],other=V.other(d.id),action=v.state==='closed'?'open':'close',why=V.reason(sim,d.id,action),listen=V.reason(sim,d.id,'listen');
   return `<article class="duct-card ${focus===d.id?'selected':''}"><div class="duct-code" aria-hidden="true">${d.code}</div><div><span class="tiny">GAINE TECHNIQUE · PAS UN PASSAGE JOUEUR</span><h3>${esc(d.label)}</h3><p class="duct-status">${v.state==='closed'?'VERROUILLÉE':v.state==='broken'?'GRILLE ARRACHÉE':'OUVERTE'} · ${Math.ceil(v.hp)} %</p><p>La conduite rejoint ${esc(sim.roomName(other.room))}. Le verrou est local. Une créature déjà engagée peut forcer sa sortie.</p><div class="duct-actions"><button data-duct-id="${d.id}" data-duct-action="listen" ${listen?'disabled':''}>${esc(listen||'ÉCOUTER · 1,7 s')}</button><button data-duct-id="${d.id}" data-duct-action="${action}" ${why?'disabled':''}>${esc(why||(action==='close'?'VERROUILLER · 2 s':'LIBÉRER · 1,2 s'))}</button></div></div></article>`;};
  const records=s.ducts.reports.slice().reverse().map(r=>{const d=V.mouths.get(r.id);return `<li><b>${d.code} · ${esc(sim.roomName(d.room))}</b><span>${esc(V.wording(r))}</span><small>Relevé il y a ${Math.floor(s.elapsed-r.when)} s de simulation. Non actualisé à distance.</small></li>`;}).join('');
  openDialog('ducts','Dans le souffle des gaines',`<p class="duct-lead">Verrouillez ou écoutez uniquement la grille à portée. Le menu se lit en pause ; la manœuvre se déroule ensuite dans le monde, sans protection contre les attaques.</p><div class="duct-grid">${local.map(card).join('')||'<p>Aucune grille technique dans cette pièce. Les conduits de Newt sont un réseau distinct.</p>'}</div><aside class="defense-warning"><strong>Un bruit n’est pas une position exacte.</strong><p>Le détecteur marine situe un écho à la bouche proche, pas la créature dans toute la colonie. Une grille ne protège pas contre une arrivée par une porte ou un autre itinéraire.</p></aside><h3>Vos douze derniers relevés</h3><ul class="duct-records">${records||'<li>Aucune écoute effectuée. Les observations s’obtiennent sur place.</li>'}</ul>`,[{label:'RETOUR AU TERRAIN',primary:true,run:()=>closeDialog()}],false,sim.room.name.toUpperCase()+' / TOUCHE 4');
  for(const b of document.querySelectorAll('[data-duct-action]'))b.onclick=()=>{if(sim.useDuct(b.dataset.ductId,b.dataset.ductAction)){closeDialog();events();}};
 }
 return {panel};
};
})(globalThis);
