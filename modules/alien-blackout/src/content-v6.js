/* Original gameplay extension. No changes to official franchise canon are implied. */
(()=>{'use strict';
 const D=BO_DATA;D.version='0.6.0';D.schema=6;D.subtitle=D.edition='Fenêtres de secours';
 D.field={stock:3,deploySeconds:3,delays:[5,10,15],life:10,pulseEvery:2,weight:8};
 const rows=[
 ['Un protocole de secours complet','Organiser le secours transmet : rejoindre le patient, lever pendant deux secondes, transporter jusqu’au point de soins choisi, déposer, puis réanimer pendant huit secondes. Aucun geste ne téléporte ni ne soigne instantanément.'],
 ['Le lieu de soins est un choix, pas une garantie','Chaque pièce possède quatre points de soins dégagés calculés sur la même géométrie que la marche. Une croix au sol indique le point visé. Le point n’apporte ni invulnérabilité ni trousse gratuite.'],
 ['Éviter les salles signalées','Les marquages manuels excluent une salle des itinéraires de secours uniquement. Ils ne ferment pas de porte et ne modifient pas les trajets de l’Alien ou des ordres ordinaires. Le sauveteur peut quitter une pièce marquée où il se trouve déjà.'],
 ['Échos prudents et temporaires','L’option éviter les contacts récents exclut les pièces des contacts caméra/capteur âgés de moins de trois secondes. Elle n’interroge aucune position hostile cachée. Le départ reste quittable ; le point d’arrivée peut être bloqué.'],
 ['Recalculer sans traverser les cloisons','Les routes de secours se recalculent sur les portes ouvertes à chaque passage. Si toutes les routes sont exclues ou fermées, le sauveteur attend. Le délai du patient continue. Aucun détour par les gaines.'],
 ['Une estimation qui montre ses limites','La durée prévue additionne les distances de navigation locales, l’allure, les blessures, la vapeur actuellement active, le portage et les dix secondes de gestes. Elle ignore les changements futurs, les attaques et l’attente imposée par une menace. La marge n’est jamais une promesse.'],
 ['Annuler sans jeter le patient','Un ordre immédiat ou le contrôle direct annule le protocole. Si le patient est déjà porté, il reste porté jusqu’à Déposer. Le protocole ne reprend pas tout seul après cette annulation.'],
 ['Une mission reçue survit à la coupure radio','Une fois transmis, le protocole de secours continue pendant les neuf secondes de scellement. L’arrêt local devant une menace et les collisions restent actifs. Aucun nouvel ordre distant n’est autorisé sans liaison.'],
 ['Des balises vraiment posées','L’équipage dispose de trois balises acoustiques pour toute la campagne. Poser exige trois secondes immobiles et hors menace. La balise prend la position exacte de l’opérateur ; elle n’apparaît jamais dans la caméra à distance.'],
 ['Choisir le retard avant de partir','Le retard choisi de cinq, dix ou quinze secondes commence après la pose. La balise émet ensuite pendant dix secondes. Le compte à rebours est indépendant de la liaison et s’arrête pendant une pause de jeu.'],
 ['Le stock est débité à la fin','Une pose interrompue par un déplacement ou une menace ne consomme rien. À l’achèvement, le stock est vérifié à nouveau. Plusieurs poses simultanées ne créent pas de balise gratuite. Les trois balises ne sont pas renouvelées au secteur suivant.'],
 ['Une diversion, pas un ordre donné à l’Alien','Une balise active produit une impulsion sonore toutes les deux secondes. La propagation suit l’acoustique existante et les portes. Une cible directement vue peut rester prioritaire. Poser près d’un blessé peut aggraver le risque.'],
 ['Ni travail ni cachette pendant la pose','Un personnage au sol, porteur ou sous soin ne peut pas poser une balise. La pose révèle l’opérateur et suspend son activité. Aucune pose pendant la fuite finale d’Amanda.'],
 ['Retour au point de secteur','Recommencer restaure le stock et les compteurs de balises disponibles à l’entrée du secteur. Les balises actives et les marquages locaux sont réinitialisés, sans rembourser les dépenses des secteurs précédents.'],
 ['Restaurer une intervention de terrain','Le format v6 conserve les étapes du secours, les marquages, le stock, les poses partielles et les minuteries des balises. L’import v1 à v5 reste possible. Toute incohérence est rejetée avant de remplacer la partie en cours.'],
 ['Lire la progression, pas les intentions cachées','Le panneau affiche approche, portage, réanimation et attente. La carte montre les points de soins, les marquages et les balises déjà posées par l’équipage. Elle n’affiche aucun but secret de l’Alien.']
 ];
 rows.forEach(([name,text],i)=>D.rules.push({id:'BO-V6-'+(i+1),name,text}));
})();
