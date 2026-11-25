/* Original extension data. These maintenance events and Amanda's escape are
   authored for this fan prototype, not claimed to exist in the original game. */
(()=>{'use strict';
 const D=BO_DATA;
 D.version='0.4.0';D.schema=4;D.subtitle=D.edition='Le dernier relais';
 const settings=[
  ['power',4,'Régulateur en surcharge','Isoler le régulateur','La fuite électrique consomme 3,3 % de batterie par minute.'],
  ['signal',1,'Relais vidéo instable','Recâbler le relais','La caméra locale et les nouveaux échos de cette pièce sont indisponibles.'],
  ['steam',3,'Fuite de vapeur','Purger la conduite','Les déplacements ralentissent de 40 % et les travaux de 30 % dans cette pièce.'],
  ['power',4,'Alimentation du laboratoire','Dériver le circuit','La fuite électrique consomme 3,3 % de batterie par minute.'],
  ['steam',1,'Chauffage sous pression','Fermer le collecteur','Les déplacements ralentissent de 40 % et les travaux de 30 % dans cette pièce.'],
  ['signal',4,'Brouillage du bus optique','Réaligner le relais','La caméra locale et les nouveaux échos de cette pièce sont indisponibles.'],
  ['power',3,'Décharge du sas auxiliaire','Séparer les départs','La fuite électrique consomme 3,3 % de batterie par minute.']
 ];
 D.chapters.forEach((ch,i)=>{
  const [kind,slot,title,job,effect]=settings[i],id=ch.id+'-maintenance';
  ch.incident={id,kind,room:ch.rooms[slot],title,effect,warningAt:48+i*8,delay:10};
  ch.services.push({id,room:ch.incident.room,kind:'incident',title:job,effect:'Réparation ou prévention définitive de cet incident. '+effect,duration:10,specialist:'Studwick'});
 });
 D.escape={length:2640,exit:2550,start:85,enemyStart:-240,time:90,
  gates:[{x:650,seconds:2,label:'CLOISON A'},{x:1540,seconds:2.5,label:'CLOISON B'},{x:2190,seconds:3,label:'CLOISON C'}],
  fan:{x:1150,period:7,active:3}};
 const rules=[
 ['Six ordres embarqués','Chaque équipier possède une file de six consignes : déplacement, attente, cachette, objectif désigné, annexe ou réparation de caméra. Une consigne est transmise avant son exécution.'],
 ['File et liaison coupée','Une file déjà transmise continue pendant le scellement du refuge ; les nouveaux ordres distants sont refusés. Aucun seuil fermé n’est ignoré.'],
 ['Attendre dans une cachette','Une cachette termine son ordre à l’arrivée. Placez ensuite une attente de 1 à 30 secondes pour conserver le couvert avant le déplacement suivant.'],
 ['Ordre manuel prioritaire','Déplacement direct, arrêt, soin, binôme et nouvel ordre immédiat interrompent la file. Le repli prudent la suspend jusqu’à une reprise explicite.'],
 ['Objectif désigné','Une intervention en file conserve son identifiant. Elle attend son tour, ou est ignorée si elle est déjà terminée ; jamais elle ne résout un autre terminal à sa place.'],
 ['Route condamnée','La file attend une route praticable. Aucune téléportation ou ouverture de porte automatique. Le plan colore la route ouverte calculée et annonce un tronçon bloqué.'],
 ['Balayage toutes les 2,5 secondes','Le capteur réalise un balayage périodique. Il indique une pièce, pas les coordonnées exactes d’un Alien hors caméra.'],
 ['Échos datés','Un contact non renouvelé reste huit secondes, avec son âge et la mention ÉCHO. Une absence d’écho ne certifie pas une pièce sûre.'],
 ['Accord caméra','Changer de caméra impose 0,65 seconde d’accord. Une caméra coupée, brouillée ou cassée ne révèle aucune silhouette ennemie.'],
 ['Trois caméras épinglées','Le tour de veille alterne jusqu’à trois caméras toutes les quatre secondes. Il utilise un seul flux et un seul canal, pas trois flux simultanés.'],
 ['Maintenance préventive','Un opérateur peut traiter l’incident avant son déclenchement. Dix secondes de travail au terminal le préviennent pour le reste du secteur.'],
 ['Sept incidents annoncés','Chaque secteur possède un incident déterministe, annoncé dix secondes avant son activation. Trois familles se répartissent les sept secteurs ; ce ne sont pas sept mécaniques distinctes.'],
 ['Surcharge électrique','Une surcharge active draine 0,055 point de batterie par seconde. La maintenance arrête le drain ; les canaux ne changent pas et aucune porte ne se ferme arbitrairement.'],
 ['Vapeur','La fuite ralentit humains et Aliens à 60 % de leur vitesse dans la pièce, et réduit les travaux à 70 %. Elle produit un bruit local périodique mais ne tue pas arbitrairement.'],
 ['Relais brouillé','Le brouillage retire seulement la caméra et les nouveaux échos de la pièce touchée. Un ancien écho reste explicitement daté jusqu’à expiration.'],
 ['Blessures et annexes','Le malus de blessure, la tension, le binôme et la vapeur s’appliquent aussi aux travaux annexes. Le soin consomme toujours sa trousse seulement à l’achèvement.'],
 ['Amanda quitte sa console','Après douze secondes d’amarrage, le point de vue passe à Amanda. La traversée originale est continue et latérale ; elle ne rajoute pas de pièces aux 56 salles de surveillance.'],
 ['Trois manivelles physiques','Amanda doit approcher chaque cloison et maintenir Utiliser, immobile. Le travail partiel est conservé. Une porte non ouverte bloque physiquement sa traversée.'],
 ['Ventilateur cyclique','Le ventilateur bloque trois secondes sur un cycle de sept. Un indicateur annonce la prochaine coupure. Il bloque aussi le poursuivant, sans infliger de dégâts cachés.'],
 ['Poursuite finale','Une silhouette poursuit Amanda dans le même conduit. Les trois cloisons se referment automatiquement derrière Amanda et retardent la silhouette deux secondes chacune lorsqu’elle les atteint ; elle ne se téléporte jamais devant Amanda.'],
 ['Reprise de fuite','Un échec dans le conduit permet de reprendre seulement la fuite, en conservant les survivants du Haldin et les résultats de la campagne. Les tentatives sont comptées.'],
 ['Sauvegarde v4 transactionnelle','Les files, incidents, observations et manivelles sont validés sur une instance isolée avant import. Un fichier refusé ne modifie pas la partie courante.'],
 ['Ancienne fin conservée','Une sauvegarde v1, v2 ou v3 déjà gagnée reste gagnée. Une ancienne partie active accède au nouveau final ; sa maintenance peut être encore à faire.'],
 ['Pause réelle','Balayage, accord vidéo, attentes, incidents et poursuite s’arrêtent en pause. La perte de focus relâche aussi les touches de la fuite.']
 ];
 const prior=D.rules.length;
 rules.forEach(([title,text],i)=>D.rules.push({id:'blackout-v4-rule-'+(i+1),name:title,text}));
 D.chapters.forEach(ch=>D.rules.push({id:ch.incident.id,name:ch.incident.title,text:`${ch.name} · ${ch.incident.effect} Préalerte après ${ch.incident.warningAt} secondes, activation dix secondes plus tard. Le terminal de ${D.rooms.find(r=>r.id===ch.incident.room).name} permet de réparer ou prévenir l’incident.`}));
})();
