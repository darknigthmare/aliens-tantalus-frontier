
/* Original, optional staging locations. They confer no armour, healing or safety. */
(function(G){'use strict';const D=G.AVP_DATA;
D.version='0.9.0';D.schema = 10;D.releaseName='Sortir de la ligne de feu';D.subtitle='Sortir de la ligne de feu.';
D.evacuationRules={pickupTime:.85,pickupRadius:86,minSeparation:24,minStamina:14,
 scar:{speed:.42,drain:5.2},sebastian:{speed:.56,drain:3.5},rest:5,
 // Low service ducts, exposed boss arenas and transport embarkations are excluded.
 excludedRooms:['bore','service','incubator','drain','queenhold','icebattle','elder','vessel'],
 excludedLinks:['maru--landing','landing--maru']};
D.evacuationSpots=[
 {id:'depose-parvis',room:'forecourt',x:1495,y:144,title:'Le palier balisé',after:'facade',text:'Retrouver la zone du matériel de descente. Le palier ne bloque pas un poursuivant ; vérifier la pièce avant de relever le blessé.'},
 {id:'depose-vestibule',room:'vestibule',x:1180,y:144,title:'Le retrait du vestibule',after:'facade',text:'Écarter le blessé de la porte axiale. Une ligne de repli au même niveau rejoint le parvis ; le balcon ne permet pas de descendre un blessé inconscient.'},
 {id:'depose-niches',room:'cloister',x:1370,y:144,title:'Le renfoncement des niches',after:'plasma',text:'Un point de regroupement au milieu des niches. Il ne soigne personne et ne compte pas comme une cachette.'},
 {id:'depose-refuge',room:'refuge',x:1030,y:144,title:'Derrière le dernier seuil',after:'plasma',text:'Une pièce avec une porte commandable. Déposer le blessé, puis fermer le vantail ou commencer le secours : les mains de Lex doivent être libres.'},
 {id:'depose-chasseur',room:'hunter',x:680,y:144,title:'Le dégagement du chasseur',after:'alliance',text:'Un emplacement éloigné du passage sous les dalles. Rejoindre le dernier abri par la galerie est possible à pied ; le conduit est trop bas pour la traction.'},
 {id:'depose-cuves',room:'tanks',x:830,y:144,title:'Le quai des réserves',after:'escaped',text:'Un dernier point de dépose avant la banquise. Scar doit être relevé avant de s’engager dans le combat final.'}
];
const rules=[
 ['approche','Rejoindre le blessé','Maintenir Maj + I pendant 0,85 seconde près d’un compagnon à terre. Sur écran tactile, maintenir Déplacer. Une position distante ou derrière un obstacle est refusée.','hunter'],
 ['mains','Les deux mains occupées','Pendant la traction, marcher et commander la lampe restent possibles. Frapper, parer, soigner, fouiller et actionner un mécanisme demandent un dépôt préalable. I ou Déposer relâche le blessé.','hunter'],
 ['poids','Scar pèse plus lourd','La traction de Scar est plus lente et dépense davantage d’endurance que celle de Sebastian. Accélérer ou esquiver ne contourne pas cette limitation.','hunter'],
 ['paire','Deux corps, un même passage','Les déplacements testent le volume de Lex, celui du blessé et la liaison entre eux. Un corps retenu par une cloison bloque la paire. Aucun ragdoll ni corde physique n’est simulé.','refuge'],
 ['portage','Un seuil à franchir ensemble','Seuls les accès au même étage, ouverts et assez dégagés, autorisent un transfert. Les positions d’arrivée sont près de la porte réciproque et les blessures sont conservées.','refuge'],
 ['vertical','Relever avant de grimper','Escaliers entre étages, échelles, rappels, palans et conduits bas refusent la traction. I après le dépôt permet le secours gratuit, puis le compagnon utilise le passage normalement.','balcony'],
 ['fatigue','Ne pas attendre l’épuisement','La marche dépense l’endurance. À l’arrêt, la récupération est lente. À zéro ou lorsqu’un coup blesse Lex, elle lâche prise à la position atteinte, sans consommation de trousse.','hunter'],
 ['traces','La friction laisse un bruit','La traction crée des sons à son emplacement réel et dépend de la matière du sol. Une créature peut enquêter sur ce bruit ; le blessé n’est pas une diversion distante.','glyphs'],
 ['depose','Un point de dépose n’est pas une protection','Les six points balisés servent au regroupement. Ils ne soignent pas, ne repoussent pas les ennemis et ne rendent pas invulnérable. Seules les protections physiques du lieu comptent.','vestibule'],
 ['memoire','Une évacuation sans doublon','L’identité du compagnon et sa santé sont conservées lors d’un passage. La paire reste attachée après un chargement valide, mais les touches et une prise partielle ne sont jamais restaurées.','refuge'],
 ['carte','Le chemin praticable','Pendant une traction, la flèche du repère utilise seulement des pièces connues et les accès autorisés au blessé. Une destination inaccessible ne déclenche pas de déplacement rapide.','cloister'],
 ['histoire','Le récit garde ses conditions','Déposer un blessé ne valide ni relevé, ni objectif, ni fin de mission. Les présences debout requises par le récit restent obligatoires.','tanks']
];
D.codex.push(...rules.map(([id,title,text,unlockRoom])=>({id:'evac-'+id,category:'Évacuation',title,text,unlockRoom})),...D.evacuationSpots.map(s=>({id:s.id,category:'Évacuation',title:s.title,text:s.text,unlockRoom:s.room})));
})(globalThis);

