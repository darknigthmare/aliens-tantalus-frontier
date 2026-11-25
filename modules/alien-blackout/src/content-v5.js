/* Original gameplay rules for the reconstructed v0.5, not canonical Blackout data. */
(()=>{'use strict';
 const D=BO_DATA;D.version='0.5.0';D.schema=5;D.subtitle=D.edition='Ne laisser personne';
 D.rescue={reviveSeconds:8,pickupSeconds:2,carryFactor:.55,bleed:{recit:65,survie:50,cauchemar:38},lockerCheck:4.5,lockerLock:20};
 const injuryRule=D.rules.find(r=>r.id==='BO-V3-8');if(injuryRule)injuryRule.text='Le premier contact prolongé blesse. Un blessé marche et intervient à 75 % de sa capacité. Au prochain contact létal, sa seule chance de secours permet une mise au sol ; si elle est déjà utilisée, le contact est mortel. La blessure et la chance utilisée persistent entre secteurs.';
 const rows=[
 ['Une seconde chance, pas une vie gratuite','Après une première blessure, le prochain contact met l’équipier au sol. Il dispose de 65 / 50 / 38 secondes selon la difficulté. Une seule mise au sol récupérable par personne et par campagne ; après réanimation, un nouveau contact létal reste mortel.'],
 ['Un sauveteur doit venir','Sélectionnez un équipier valide, choisissez un patient puis Secourir. Le sauveteur marche par les portes ouvertes et contourne les obstacles. Le soin exige une proximité de 48 unités et une ligne dégagée.'],
 ['Trousse consommée à la fin','Huit secondes de réanimation immobile, sans menace visible ni signalement récent. Une trousse commune est consommée une seule fois à l’achèvement. Le patient revient blessé, pas indemne.'],
 ['Interrompre un secours','Un ordre immédiat, une menace ou la perte du patient interrompt les gestes sans consommation. Un déplacement volontaire annule le secours ; une menace conserve sa destination mais remet les gestes à zéro.'],
 ['Porter sans téléporter','Deux secondes à proximité pour soulever le patient. Le porteur utilise la même navigation et les mêmes collisions. Le patient suit sa position physique ; une cloison fermée bloque les deux.'],
 ['Un porteur n’est pas un opérateur','Porter réduit la vitesse à 55 % de sa valeur courante, avant les blessures et la vapeur. Seuls déplacement, arrêt et dépose sont possibles ; ni cachette, ni terminal, ni binôme pendant le portage.'],
 ['Le portage ne soigne pas','Le compte à rebours continue au même rythme en transport. Déposer ne restaure ni santé ni délai. Une trousse reste nécessaire pour remettre le patient sur pied.'],
 ['Personne au sol au transfert','Le sas ne transfère pas un patient inconscient. Déposez et réanimez avant de continuer. Aucun patient ne disparaît silencieusement au changement de secteur.'],
 ['Une mission de secours par sauveteur','Un patient ne peut pas être traité ou soulevé simultanément par deux équipiers. Le dernier stock de trousse n’est pas réservé gratuitement ; sa disponibilité est revérifiée à la fin du geste.'],
 ['Perdre le porteur','Si le porteur est mis au sol ou meurt, le patient est déposé à sa position actuelle. Les liens de portage sont nettoyés immédiatement.'],
 ['Fouille fondée sur un indice','L’Alien peut inspecter le casier le plus proche de sa dernière observation. Il choisit ce point d’après le lieu observé, jamais d’après la position actuelle d’un personnage invisible.'],
 ['Patrouille des casiers','Après une présence prolongée sans cible visible, la menace contrôle les emplacements à tour de rôle, occupés ou non. Une cachette n’est donc pas une immunité permanente.'],
 ['Une fouille prend du temps','La menace rejoint physiquement le casier puis inspecte pendant 4,5 secondes. L’annonce parvient par une caméra disponible ou un équipier proche ; aucune position distante cachée n’est révélée.'],
 ['Découvert ne signifie pas tué','Une fouille terminée révèle l’occupant du casier contrôlé. Elle ne lui inflige pas directement de dégâts. L’attaque suivante suit les distances et les règles de contact habituelles.'],
 ['Une cachette compromise','Après contrôle, l’emplacement est inutilisable pendant vingt secondes. Rejoindre une cachette dans une autre pièce reste possible. La durée diminue même sans caméra.'],
 ['Interphone et fouille','Un leurre audible suffisamment fort situé ailleurs peut interrompre une inspection. Sa répétition perd toujours de son efficacité ; la diversion n’est pas garantie si le stimulus n’atteint plus le seuil.'],
 ['Sauvegarde des urgences','Mise au sol, délai restant, gestes de secours, portage et inspections sont enregistrés. Les liens réciproques et les positions sont vérifiés avant toute modification de la partie courante.'],
 ['Migration sans résurrection','Les exports v1 à v4 sont acceptés dans un emplacement v5 séparé. Les morts restent morts ; les personnes vivantes importées disposent de leur chance de secours v5.'],
 ['Files et urgences','Démarrer un secours annule la file du sauveteur. Les files des patients sont vidées. Les gestes déjà engagés continuent pendant une coupure radio ; aucune nouvelle consigne distante n’y est acceptée.'],
 ['Contrôles distincts','Les situations préparées pour tester le secours ou inspecter une salle ne sont pas des parties gagnées. Le rapport indique séparément tests isolés, parcours complets et captures.']];
 for(const [i,[name,text]]of rows.entries())D.rules.push({id:`blackout-v5-${String(i+1).padStart(2,'0')}`,name,text});
})();
