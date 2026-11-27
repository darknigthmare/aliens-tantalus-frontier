// V185 automatic translation layer (owner request, 2026-11-06: "tout d'un coup").
// The game keeps writing French. When English is chosen, this layer replaces
// known French text where the player sees it: DOM text nodes, a few attributes
// and Canvas 2D text. Unknown text is left in French. Nothing here touches the
// save, game rules or identifiers; it only changes what is displayed.
import { currentLanguageV185, LANGUAGE_EVENT_V185 } from './i18n-v185.js';
import { XENO_TRIALS_ORIGINAL_ARENAS_V193 } from './xeno-trials-original-arenas-v193.js';
import { XENO_TRIALS_REFERENCED_STAGES_V196 } from './xeno-trials-referenced-stages-v196.js';
import { XENO_TRIALS_PRIORITY_STAGES_V198 } from './xeno-trials-priority-stages-v198.js';
import { XENO_TRIALS_ICONIC_STAGES_V194 } from './xeno-trials-iconic-stages-v194.js';

const ATTRIBUTES = Object.freeze(['placeholder', 'aria-label', 'title', 'alt']);
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE', 'NOSCRIPT']);
const CACHE_LIMIT = 4000;
const arenaLabels = new Map([
  ...XENO_TRIALS_ORIGINAL_ARENAS_V193,
  ...XENO_TRIALS_ICONIC_STAGES_V194,
  ...XENO_TRIALS_REFERENCED_STAGES_V196,
  ...XENO_TRIALS_PRIORITY_STAGES_V198
].flatMap(({ label, labelEn }) => [
  [label, labelEn],
  [label.toUpperCase(), labelEn.toUpperCase()]
]));
const trialLabels = new Map([
  ['Filtres du registre', 'Roster filters'],
  ['SPÉCIMEN AFFECTÉ', 'ASSIGNED SPECIMEN'],
  ['CIBLE D’ESSAI', 'TRIAL TARGET'],
  ['AFFECTATION VERROUILLÉE', 'ASSIGNMENT LOCKED'],
  ['Dossier de combat', 'Combat dossier'],
  ['Autorisation d’essai', 'Trial clearance'],
  ['Désignation de la cible', 'Target designation'],
  ['Ce spécimen ne répond pas aux critères de l’évaluation.', 'This specimen does not meet the trial requirements.'],
  ['Débloquez le spécimen dans le registre pour l’affecter.', 'Unlock this specimen in the roster to assign it.'],
  ['MODÈLE ORIGINAL MIRE', 'ORIGINAL MIRE MODEL'],
  ['DOSSIERS EXPÉRIMENTAUX MIRE', 'MIRE EXPERIMENTAL FILES'],
  ['LANCER L’ÉPREUVE ASYMÉTRIQUE', 'START ASYMMETRIC TRIAL'],
  ['ESSAYER LE SPÉCIMEN', 'TEST SPECIMEN'],
  ['OBJECTIF DE LABORATOIRE', 'LAB OBJECTIVE'],
  ['MODÈLE À VALIDER', 'MODEL UNDER REVIEW'],
  ['V · PARADE', 'V · PARRY'],
  ['Parer au dernier moment', 'Parry just before contact'],
  ['Deuxième signature', 'Second signature'],
  ['Troisième signature', 'Third signature'],
  ['PARADE', 'PARRY'],
  ['OUVERTURE', 'OPENING'],
  ['RIPOSTE · GARDE + SUPER', 'COUNTER · GUARD + SUPER'],
  ['La commande de saut déclenche un franchissement au sol.', 'The jump button performs a grounded dash.'],
  ['FRANCHIR', 'DASH'],
  ['Franchir au sol', 'Dash on the ground'],
  ['V pour parer au contact · C + V contre une frappe basse · Après une parade, Garde + Super pour riposter avec un spécimen compatible et la jauge pleine.', 'V to parry on contact · C + V against a low strike · After a parry, press Guard + Super with a compatible fighter and a full meter to counter.'],
  ['H / O pour les signatures disponibles · Manette · Stick droit vers le bas pour parer, gauche / droite pour les signatures.', 'H / O for available signatures · Controller · Right stick down to parry, left / right for signatures.'],
  ['C · BAS', 'C · CROUCH'],
  ['MAJ · ESQUIVE', 'SHIFT · EVADE'],
  ['U · ANTI-AIR', 'U · ANTI-AIR'],
  ['S’accroupir', 'Crouch'],
  ['Esquiver', 'Evade'],
  ['Frappe anti-aérienne', 'Anti-air strike'],
  ['C maintenu pour s’accroupir · C + J pour frapper bas · Maj + direction pour esquiver · J en esquive avant pour avancer en frappant · U pour contrer un saut.', 'Hold C to crouch · C + J to strike low · Shift + direction to evade · J during a forward evade to strike on approach · U to counter a jump.'],
  ['Manette · Stick gauche vers le bas pour s’accroupir · R3 pour esquiver · Stick droit vers le haut pour contrer un saut.', 'Controller · Left stick down to crouch · R3 to evade · Right stick up to counter a jump.'],
  ['Super dessiné', 'Drawn super'],
  ['ATELIERS DE SIMULATION', 'PRACTICE DRILLS'],
  ['Prise de proximité', 'Close-range grab'],
  ['Approchez le Commando au contact. Maintenez Garde et appuyez sur Lourde, puis laissez la cible résister.', 'Close in on the Commando. Hold Guard and press Heavy, then let the target resist.'],
  ['Saisir le Commando au sol', 'Grab the grounded Commando'],
  ['Observer sa libération', 'Watch the target break free'],
  ['Sortir de la prise au sol', 'Escape a grounded grab'],
  ['Laissez le Warrior vous saisir. Une fois immobilisé, maintenez Garde sans relâcher jusqu’à la libération.', 'Let the Warrior grab you. Once restrained, hold Guard until you break free.'],
  ['Subir la prise du Warrior', 'Get caught in the Warrior’s grab'],
  ['Se libérer en maintenant Garde', 'Hold Guard to break free'],
  ['PRISE EN COURS', 'GRAB IN PROGRESS'],
  ['Contrer la prise au sol', 'Counter a grounded grab'],
  ['Laissez le Warrior vous saisir. Maintenez Garde et appuyez sur Rapide au signal, puis gardez Garde enfoncée.', 'Let the Warrior grab you. Hold Guard and press Light at the cue, then keep holding Guard.'],
  ['Subir la prise au sol', 'Get caught in the grounded grab'],
  ['Déclencher le contre avec Garde et Rapide', 'Start the counter with Guard and Light'],
  ['Maintenir Garde jusqu’au dégagement', 'Keep holding Guard until you break free'],
  ['RAPIDE MAINTENANT', 'PRESS LIGHT NOW'],
  ['MAINTENEZ GARDE', 'HOLD GUARD'],
  ['CONTRE EN COURS', 'COUNTER IN PROGRESS'],
  ['CONTRE · GARDE + RAPIDE', 'COUNTER · GUARD + LIGHT'],
  ['GARDE · SORTIE STANDARD', 'GUARD · STANDARD ESCAPE'],
  ['Reculer sous une frappe', 'Evade a strike low'],
  ['Attendez que le Runner arme sa frappe lourde. Maintenez Bas et appuyez sur Esquive sans direction, puis laissez passer la frappe.', 'Wait for the Runner to wind up a heavy strike. Hold Crouch and press Evade without a direction, then let the strike pass.'],
  ['Laisser le contact armer une frappe à portée', 'Wait for an attack in range'],
  ['Déclencher le recul bas avant la frappe', 'Evade low before the strike lands'],
  ['Éviter la frappe lourde', 'Avoid the heavy strike'],
  ['Reculer en gardant', 'Retreat while guarding'],
  ['Attendez la frappe lourde du Warrior. Maintenez Garde et reculez avec la direction opposée au contact.', 'Wait for the Warrior’s heavy strike. Hold Guard and move away from your opponent.'],
  ['Reculer en tenant la garde', 'Move back while holding Guard'],
  ['Bloquer la frappe pendant le recul', 'Block the strike while retreating'],
  ['Mesurer la portée du Super II', 'Measure Super II range'],
  ['Restez en place. Essayez Garde + Super sans parade, puis parez la frappe de la Reine et recommencez. Sa portée dépasse la vôtre.', 'Stay in place. Try Guard + Super without a parry, then parry the Queen and try again. Her strike reaches farther than yours.'],
  ['Confirmer le refus sans débiter la jauge', 'Verify the rejected attempt keeps the meter'],
  ['Parer une frappe puis lancer le Super II', 'Parry a strike and use Super II'],
  ['Laisser passer la riposte hors portée', 'Let the counter miss from out of range'],
  ['Dégager la zone annoncée', 'Evacuate the marked hazard'],
  ['Rejoignez la zone marquée dès l’alerte. Sortez avant son activation et restez à l’abri jusqu’à la fin du danger.', 'Reach the marked zone when the warning appears. Leave before it activates and stay clear until the danger passes.'],
  ['Repérer et atteindre la zone d’alerte', 'Find and reach the warning zone'],
  ['Quitter la zone avant l’activation', 'Leave the area before activation'],
  ['Attendre la fin du cycle sans exposition', 'Wait out the cycle without exposure'],
  ['QUITTER LA ZONE', 'LEAVE THE AREA'],
  ['Interrompre le barrage', 'Interrupt the barrage'],
  ['Le Warden a la jauge pleine. Interrompez son super par une frappe légère avant le premier tir.', 'The Warden starts with full meter. Interrupt its Super with a light attack before the first shot.'],
  ['Observer le débit du super', 'Watch the Super meter drain'],
  ['Interrompre le Warden', 'Interrupt the Warden'],
  ['Attendre la fin de la fenêtre sans dégât tardif', 'Wait out the window without any late damage'],
  ['SUPER ADVERSE EN PRÉPARATION', 'OPPONENT SUPER WINDUP'],
  ['Clore une victoire', 'Close out a victory'],
  ['Remportez le duel à un point de vie, puis passez la présentation finale.', 'Win the one-hit duel, then skip the final presentation.'],
  ['Obtenir un verdict de victoire', 'Win the duel'],
  ['Passer la présentation finale', 'Skip the final presentation'],
  ['FERMER LA PRÉSENTATION FINALE', 'CLOSE THE FINAL PRESENTATION'],
  ['Tenir jusqu’aux renforts', 'Hold for reinforcements'],
  ['Neutralisez les cinq contacts de la première vague. Restez dans l’arène jusqu’à l’arrivée de la seconde.', 'Defeat all five contacts in the first wave. Stay in the arena until the second wave arrives.'],
  ['Neutraliser la première vague', 'Clear the first wave'],
  ['Voir les renforts entrer dans l’arène', 'Wait for the reinforcements to enter the arena'],
  ['Frappe en descente', 'Descending strike'],
  ['Approchez la Reine avec le Runner. Sautez à portée, puis frappez léger pendant la descente.', 'Approach the Queen as the Runner. Jump within range, then use a light attack on the way down.'],
  ['Déclencher une frappe en descente', 'Start a descending strike'],
  ['Toucher la cible avec cette frappe', 'Land the strike on the target'],
  ['Se relever après une rupture', 'Recover from a guard break'],
  ['Tenez la garde jusqu’à sa rupture. Relâchez ensuite Garde et réarmez-la à l’approche du redressement.', 'Hold Guard until it breaks. Release it, then press Guard again as you are about to get back up.'],
  ['Subir la rupture de garde', 'Take a guard break'],
  ['Se relever par un nouvel appui sur Garde', 'Get up with a fresh Guard press'],
  ['RELÂCHEZ GARDE', 'RELEASE GUARD'],
  ['MAINTENANT', 'NOW'],
  ['Départ après la présentation', 'Starting after the introduction'],
  ['Passez une présentation. Attendez la fin du décompte, approchez la cible puis appuyez de nouveau sur Frappe légère.', 'Skip an introduction. Wait for the countdown to end, then approach the target and press Light Attack again.'],
  ['Passer une présentation', 'Skip an introduction'],
  ['Toucher après un nouvel appui', 'Land a hit with a fresh button press'],
  ['PRÉSENTATION TERMINÉE', 'INTRODUCTION ENDED'],
  ['REJOUER POUR LA PASSER', 'REPLAY TO SKIP IT'],
  ['Défendre en posture basse', 'Crouching defense'],
  ['Tenez d’abord la garde debout. Après le premier impact, maintenez Garde et Accroupir pour bloquer la frappe basse suivante.', 'Start with a standing guard. After the first impact, hold Guard and Crouch to block the next low strike.'],
  ['Mettre la garde debout à l’épreuve', 'Test a standing guard'],
  ['Bloquer une frappe basse en posture basse', 'Block a low strike while crouching'],
  ['FRAPPE BASSE EN COURS', 'LOW STRIKE IN PROGRESS'],
  ['Esquive à la réception', 'Landing evade'],
  ['Sautez avec le Prowler. Déclenchez Esquive au dernier instant avant de toucher le sol pour sortir en déplacement.', 'Jump with the Prowler. Press Evade just before touching down to evade on landing.'],
  ['Effectuer un saut', 'Jump'],
  ['Déclencher l’esquive en retrouvant le sol', 'Evade on landing'],
  ['DESCENTE EN COURS', 'DESCENDING'],
  ['LABORATOIRES MIRE', 'MIRE LABORATORIES'],
  ['OUVRIR LE LABORATOIRE', 'OPEN LABORATORY'],
  ['Veille Ovomorph', 'Ovomorph watch'],
  ['Calibrez les trois balises. Traversez rapidement la zone centrale pour maintenir la veille.', 'Calibrate the three beacons. Cross the central zone quickly to maintain the watch.'],
  ['Lecture du Cocon', 'Cocoon reading'],
  ['Rejoignez chaque capteur et maintenez Interagir pendant sa fenêtre ouverte.', 'Reach each sensor and hold Interact during its open window.'],
  ['Transit Tadpole', 'Tadpole transit'],
  ['Ouvrez les trois sas depuis leurs consoles, puis attendez l’arrivée de l’écho au bout du circuit.', 'Open the three gates from their consoles, then wait for the echo to reach the end of the circuit.'],
  ['Objectifs de laboratoire', 'Laboratory objectives'],
  ['Action en cours', 'Action in progress'],
  ['Q/D ou flèches · E pour interagir · P ou Échap pour la pause · Croix ou stick et A à la manette.', 'A/D or arrows · E to interact · P or Escape to pause · D-pad or stick and A on controller.'],
  ['OBSERVATION VALIDÉE', 'OBSERVATION VERIFIED'],
  ['SAUVEGARDE REFUSÉE', 'SAVE FAILED'],
  ['VEILLE ROMPUE', 'WATCH BROKEN'],
  ['CALIBRER LA BALISE SIGNALÉE', 'CALIBRATE THE MARKED BEACON'],
  ['ZONE DE VEILLE', 'WATCH ZONE'],
  ['CIRCULEZ', 'KEEP MOVING'],
  ['FENÊTRE OUVERTE', 'WINDOW OPEN'],
  ['MAINTENIR INTERAGIR', 'HOLD INTERACT'],
  ['OUVRIR LE SAS SIGNALÉ', 'OPEN THE MARKED GATE'],
  ['TRANSIT DE L’ÉCHO EN COURS', 'ECHO IN TRANSIT'],
  ['RELEVÉ DES CONTACTS ET COMMANDES', 'CONTACT AND INPUT LOG'],
  ['Partie', 'Metric'],
  ['Impacts infligés', 'Impacts dealt'],
  ['PV infligés', 'Damage dealt'],
  ['Blocages effectués', 'Blocks performed'],
  ['Ruptures provoquées', 'Guard breaks dealt'],
  ['Parades effectuées', 'Parries performed'],
  ['ENREGISTRER MES COMMANDES', 'RECORD MY INPUTS'],
  ['Durée d’enregistrement', 'Recording length'],
  ['SAUVEGARDER LA SÉQUENCE', 'SAVE RECORDING'],
  ['ARRÊTER L’ENREGISTREMENT', 'STOP RECORDING'],
  ['Enregistrement non sauvegardé.', 'Recording could not be saved.'],
  ['Séquence trop courte.', 'Recording too short.'],
  ['Séquence prête à sauvegarder.', 'Recording ready to save.'],
  ['Enregistrement en cours.', 'Recording in progress.'],
  ['Séquence sauvegardée. Sélectionnez Enregistrement en boucle pour la rejouer.', 'Recording saved. Select Loop recording to play it back.'],
  ['Enregistrez jusqu’à huit secondes pour les rejouer en miroir sur la cible.', 'Record up to eight seconds and play it back in mirror on the target.'],
  ['Enregistrement en boucle', 'Loop recording'],
  ['Évacuation acide', 'Escape the acid'],
  ['La Reine projette de l’acide. Après le premier contact avec une flaque, quittez la zone au sol pour éviter la pulsation suivante.', 'The Queen fires acid. After the first contact with a pool, leave the affected floor to avoid the next pulse.'],
  ['Repérer une flaque acide', 'Locate an acid pool'],
  ['Subir le premier contact au sol', 'Take the first floor contact'],
  ['Sortir de la flaque et éviter la pulsation suivante', 'Leave the pool and avoid the next pulse'],
  ['Riposte sans spécial', 'Punish without special attacks'],
  ['Les techniques spéciales sont verrouillées. Bloquez une attaque légale du Spitter, puis touchez-le avec une frappe légère.', 'Special attacks are disabled. Block a legal attack from the Spitter, then land a light strike.'],
  ['Bloquer une frappe de l’IA', 'Block a strike from the AI'],
  ['Égalité au gong', 'Draw at the bell'],
  ['Le contact reproduit vos gestes en miroir. Engagez une frappe simultanée au contact ou attendez le gong à santé égale.', 'The target mirrors your controls. Trade a simultaneous strike at close range or wait for the bell with equal health.'],
  ['Obtenir une manche nulle', 'Draw a round'],
  ['Terminer sur une égalité confirmée', 'Finish the match in a draw'],
  ['Reprendre après une manche', 'Return for the next round'],
  ['Remportez la manche d’ouverture. Laissez ensuite la cible prendre sa revanche, puis retrouvez vos appuis en troisième manche.', 'Win the opening round, then let the target take the second round. Return to your feet for round three.'],
  ['Remporter la première manche', 'Win round one'],
  ['Perdre la deuxième manche', 'Lose round two'],
  ['Reprendre le combat en troisième manche', 'Resume the fight in round three'],
  ['Interrompre l’armement', 'Interrupt the windup'],
  ['Le Warrior arme sa percussion de queue. Restez à portée et placez une frappe légère pendant l’anticipation.', 'The Warrior winds up a tail strike. Stay in range and land a light attack during the windup.'],
  ['Observer l’armement de la percussion', 'Watch for the tail windup'],
  ['Interrompre la frappe avant le contact', 'Interrupt the strike before it connects'],
  ['PERCUSSION EN COURS', 'TAIL STRIKE IN PROGRESS'],
  ['Parade de précision', 'Timed parry'],
  ['Laissez le contact avancer. Déclenchez Parade juste avant sa frappe lourde, puis ripostez pendant son ouverture.', 'Let the target approach. Parry just before the heavy strike lands, then punish during the opening.'],
  ['Dévier une frappe lourde', 'Parry a heavy strike'],
  ['Toucher pendant l’ouverture', 'Land a strike during the opening'],
  ['Super de riposte', 'Super riposte'],
  ['Le Warden est prêté avec sa jauge pleine. Parez la frappe lourde, puis maintenez Garde et déclenchez Super pendant l’ouverture.', 'The Warden starts with full meter. Parry the heavy strike, then hold Guard and use Super during the opening.'],
  ['Créer une ouverture par une parade', 'Open the opponent up with a parry'],
  ['Dépenser la jauge en riposte', 'Spend the Super meter on a riposte'],
  ['Toucher avec le Heurt de contention', 'Land the Containment Clash'],
  ['Banc libre', 'Free practice'],
  ['BANC LIBRE', 'FREE PRACTICE'],
  ['Banc libre en cours.', 'Free practice in progress.'],
  ['Banc libre terminé.', 'Free practice complete.'],
  ['Choisissez vos spécimens, l’arène et le comportement de la cible. Tous les spécimens sont prêtés pour la séance.', 'Choose both specimens, the arena and the target’s behavior. All specimens are available on loan for practice.'],
  ['Essayez vos techniques dans les conditions sélectionnées.', 'Practice your techniques under the selected conditions.'],
  ['Votre spécimen', 'Your specimen'],
  ['Spécimen adverse', 'Opponent specimen'],
  ['Comportement adverse', 'Opponent behavior'],
  ['Difficulté de l’IA', 'AI difficulty'],
  ['Secondes par manche', 'Seconds per round'],
  ['Manches gagnantes', 'Rounds to win'],
  ['Intelligence native', 'Native AI'],
  ['Cible immobile', 'Stationary target'],
  ['Garde haute', 'Standing guard'],
  ['Sauts répétés', 'Repeat jumps'],
  ['Miroir de vos commandes', 'Mirror your controls'],
  ['Super chargé au départ', 'Start with a full Super meter'],
  ['Désactiver les attaques spéciales', 'Disable special attacks'],
  ['LANCER LE BANC LIBRE', 'START FREE PRACTICE'],
  ['RECOMMENCER L’ATELIER', 'RESTART PRACTICE'],
  ['Réglages du banc libre non sauvegardés.', 'Free practice settings could not be saved.'],
  ['Entraînez-vous aux contacts, à la garde et aux techniques spéciales sur les bancs d’essai MIRE.', 'Practice strikes, defense and special techniques in the MIRE test arena.'],
  ['Atelier de simulation', 'Practice drill'],
  ['Objectifs de l’atelier', 'Drill objectives'],
  ['ATELIERS VALIDÉS', 'DRILLS PASSED'],
  ['SIMULATION SANS PRIME', 'UNRANKED PRACTICE'],
  ['LANCER L’ATELIER', 'START DRILL'],
  ['ATELIER', 'PRACTICE'],
  ['ATELIER VALIDÉ', 'DRILL PASSED'],
  ['EXERCICE INTERROMPU', 'DRILL INTERRUPTED'],
  ['RETOUR AUX ATELIERS', 'BACK TO DRILLS'],
  ['SAUVEGARDE À RÉESSAYER', 'RETRY SAVE'],
  ['RÉESSAYER LA SAUVEGARDE', 'RETRY SAVE'],
  ['Liaison visuelle interrompue. Relancez l’atelier.', 'Visual link interrupted. Restart the drill.'],
  ['Atelier indisponible.', 'Drill unavailable.'],
  ['Suivez l’objectif de l’atelier. La pause suspend la simulation.', 'Follow the drill objective. Pausing freezes the simulation.'],
  ['Calibrage de la portée', 'Strike range'],
  ['Frappez d’abord depuis la ligne de départ. Rapprochez-vous ensuite de la cible immobile.', 'Throw a strike from the starting line. Then approach the stationary target.'],
  ['Faire manquer une attaque légère', 'Miss with a light attack'],
  ['Toucher avec une attaque légère', 'Land a light attack'],
  ['Tenir la garde', 'Hold your guard'],
  ['Attendez que le contact s’approche. Maintenez Garde pendant ses frappes.', 'Wait for the target to approach. Hold Guard through its attacks.'],
  ['Bloquer une frappe', 'Block a strike'],
  ['Bloquer une seconde frappe', 'Block a second strike'],
  ['Esquive verticale', 'Jump evasion'],
  ['Laissez le contact approcher. Sautez quand il arme sa frappe lourde.', 'Let the target approach. Jump as it winds up its heavy attack.'],
  ['Faire manquer une frappe lourde en sautant', 'Jump over a heavy attack'],
  ['FRAPPE LOURDE EN COURS', 'HEAVY ATTACK IN PROGRESS'],
  ['Rupture de garde', 'Guard break'],
  ['Le contact tient sa garde avec une réserve réduite. Approchez et enchaînez deux frappes lourdes.', 'The target is guarding with low stamina. Close the gap and land two heavy attacks.'],
  ['Provoquer une rupture de garde', 'Break the target’s guard'],
  ['Sortie de saisie', 'Grapple escape'],
  ['Attendez la prise du Prowler. Dès la capture, maintenez Garde jusqu’à la libération.', 'Wait for the Prowler to grab you. Hold Guard after it grabs you to break free.'],
  ['Subir la saisie', 'Get caught in a grapple'],
  ['Sortir en maintenant Garde', 'Hold Guard to escape'],
  ['Attaque basse', 'Low strike'],
  ['Rapprochez-vous, maintenez Accroupir et déclenchez une frappe légère face au contact en garde.', 'Approach the guarding target, then hold Crouch and use a light attack.'],
  ['Toucher sous la garde haute', 'Strike below a standing guard'],
  ['Interception aérienne', 'Anti-air interception'],
  ['Laissez le contact s’approcher. Déclenchez Anti-air lorsqu’il saute près de vous.', 'Let the target approach. Use Anti-air when it jumps near you.'],
  ['Intercepter un contact en l’air', 'Intercept an airborne target'],
  ['CONTACT EN L’AIR', 'AIRBORNE TARGET'],
  ['Attaque en avançant', 'Advancing strike'],
  ['Approchez de la cible. Orientez Esquive vers elle, puis déclenchez une frappe légère avant la fin du déplacement.', 'Approach the target. Evade toward it, then use a light attack before the movement ends.'],
  ['Engager une esquive vers l’avant', 'Start a forward evade'],
  ['Toucher en sortie d’esquive', 'Land a strike during the evade'],
  ['Barrage de contrôle', 'Control barrage'],
  ['Le Warden est prêté avec sa jauge pleine. Restez au sol, alignez la cible et déclenchez le super.', 'The Warden is loaned to you with a full meter. Stay grounded, line up the target, and use your Super.'],
  ['Dépenser la jauge du super', 'Spend the Super meter'],
  ['Toucher avec une salve', 'Land a volley'],
  ['F · VERROU FINAL', 'F · FINAL RESTRAINT'],
  ['Verrou final en cours.', 'Final restraint in progress.'],
  ['Victoire confirmée. Verrou final disponible avec F.', 'Victory confirmed. Press F for the final restraint.'],
  ['F · APPUI DE CONTRÔLE', 'F · BOOT RESTRAINT'],
  ['Appui de contrôle en cours.', 'Boot restraint in progress.'],
  ['Victoire confirmée. Appui de contrôle disponible avec F.', 'Victory confirmed. Press F for the boot restraint.'],
  ['F · ISOLER LE CIRCUIT', 'F · ISOLATE THE CIRCUIT'],
  ['Isolation du circuit en cours.', 'Circuit isolation in progress.'],
  ['Victoire confirmée. Isolation du circuit disponible avec F.', 'Victory confirmed. Press F to isolate the circuit.'],
  ['VERROU FINAL', 'FINAL RESTRAINT'],
  ['F · APPUI DE GRIFFE', 'F · CLAW RESTRAINT'],
  ['Appui de griffe en cours.', 'Claw restraint in progress.'],
  ['Victoire confirmée. Appui de griffe disponible avec F.', 'Victory confirmed. Press F for the claw restraint.'],
  ['F · PRESSION DU POING', 'F · KNUCKLE HOLD'],
  ['Pression du poing en cours.', 'Knuckle hold in progress.'],
  ['Victoire confirmée. Pression du poing disponible avec F.', 'Victory confirmed. Press F for the knuckle hold.'],
  ['F · FERMER LA VANNE', 'F · CLOSE THE VALVE'],
  ['Fermeture de la vanne en cours.', 'Valve closure in progress.'],
  ['Victoire confirmée. Fermeture de la vanne disponible avec F.', 'Victory confirmed. Press F to close the valve.'],
  ['F · ISOLER LA PURGE', 'F · ISOLATE THE PURGE'],
  ['Isolation de la purge en cours.', 'Purge isolation in progress.'],
  ['Victoire confirmée. Isolation de la purge disponible avec F.', 'Victory confirmed. Press F to isolate the purge.'],
  ['F · VERROUILLER LE VOLET', 'F · LOCK THE SHUTTER'],
  ['Verrouillage du volet en cours.', 'Shutter locking in progress.'],
  ['Victoire confirmée. Verrouillage du volet disponible avec F.', 'Victory confirmed. Press F to lock the shutter.'],
  ['F · OUVRIR LE DRAIN', 'F · OPEN THE DRAIN'],
  ['Ouverture du drain en cours.', 'Drain opening in progress.'],
  ['Victoire confirmée. Ouverture du drain disponible avec F.', 'Victory confirmed. Press F to open the drain.'],
  ['F · CONFIRMER LA NEUTRALISATION', 'F · CONFIRM NEUTRALIZATION'],
  ['CONFIRMER LA NEUTRALISATION', 'CONFIRM NEUTRALIZATION'],
  ['Victoire confirmée. Vérification du spécimen disponible avec F.', 'Victory confirmed. Press F to check the specimen.'],
  ['Vérification du spécimen en cours.', 'Checking the specimen.'],
  ['F · ISOLER LE SECTEUR', 'F · ISOLATE THE SECTOR'],
  ['ISOLER LE SECTEUR', 'ISOLATE THE SECTOR'],
  ['Victoire confirmée. Balises d’isolement disponibles avec F.', 'Victory confirmed. Press F to use the isolation beacons.'],
  ['Fermeture du périmètre de sécurité.', 'Securing the perimeter.'],
  ['F · REJOINDRE LA BALISE', 'F · APPROACH THE BEACON'],
  ['REJOINDRE LA BALISE', 'APPROACH THE BEACON'],
  ['Victoire confirmée. Approche de la balise disponible avec F.', 'Victory confirmed. Press F to approach the beacon.'],
  ['Approche et isolement du secteur.', 'Approaching the beacon and isolating the sector.'],
  ['F · APPROCHER AU CONTACT', 'F · APPROACH FOR RESTRAINT'],
  ['APPROCHER AU CONTACT', 'APPROACH FOR RESTRAINT'],
  ['Victoire confirmée. Approche au contact disponible avec F.', 'Victory confirmed. Press F to approach for restraint.'],
  ['Approche et contrôle du spécimen.', 'Approaching and restraining the specimen.'],
  ['ISOLEMENT DES CIRCUITS DE PRESSION', 'PRESSURE CIRCUIT ISOLATION'],
  ['ISOLEMENT DU REFROIDISSEMENT', 'COOLANT ISOLATION'],
  ['ISOLEMENT', 'ISOLATION'],
  ['CIRCUITS ISOLÉS', 'CIRCUITS ISOLATED'],
  ['Validation de sécurité', 'Safety confirmation'],
  ['Coupez les deux circuits dans l’ordre indiqué, puis validez la mise en sécurité au dernier poste.', 'Isolate both circuits in the indicated order, then confirm safety at the final terminal.'],
  ['TRANSFERT SOUS TENSION', 'LIVE CARGO TRANSFER'],
  ['RAMPE DE TRANSFERT', 'TRANSFER RAMP'],
  ['RAMPE ARMÉE', 'RAMP ARMED'],
  ['RAMPES HORS TENSION', 'RAMPS OFFLINE'],
  ['Rapportez les caissons au dépôt. Chaque caisson arme la rampe de sa voie jusqu’à sa livraison. Traversez entre les décharges ou sautez par-dessus.',
    'Return each crate to the depot. A crate arms its route’s ramp until delivery. Cross between pulses or jump over the discharge.'],
  ['APPUI DE CONTRÔLE', 'BOOT RESTRAINT'],
  ['BASCULE DES SAS', 'AIRLOCK RELAY'],
  ['TENAILLE DU QUAI', 'DOCK CROSS-FIRE'],
  ['SAS OUEST', 'WEST AIRLOCK'],
  ['SAS EST', 'EAST AIRLOCK'],
  ['DEUX SAS', 'BOTH AIRLOCKS'],
  ['ÉCLAIREURS', 'SCOUTS'],
  ['APPUI À DISTANCE', 'RANGED SUPPORT'],
  ['PINCE', 'PINCER'],
  ['LIGNE D’ASSAUT', 'ASSAULT LINE'],
  ['Trois vagues faibles. Le sas ouest ouvre en premier, puis le sas est. La dernière vague entre par les deux côtés.',
    'Three fragile waves. The west airlock opens first, followed by the east airlock. The final wave enters from both sides.'],
  ['Profitez de la pause entre les vagues pour changer de position. Repliez-vous vers le centre quand les deux sas s’ouvrent.',
    'Reposition between waves. Fall back toward the center when both airlocks open.'],
  ['Deux accès livrent des éclaireurs, puis l’accès est fournit des tireurs. L’assaut final vient de l’ouest.',
    'Scouts enter from both sides before marksmen arrive from the east. The final assault comes from the west.'],
  ['Surveillez les deux accès au départ. Fermez la distance sur les tireurs à l’est avant de vous tourner vers la ligne ouest.',
    'Watch both entrances at the start. Close on the marksmen to the east before turning toward the west assault line.'],
  ['APPUI DE GRIFFE', 'CLAW RESTRAINT'],
  ['Frappes aériennes dessinées', 'Drawn aerial attacks'],
  ['Spéciale dessinée', 'Drawn special'],
  ['REPRENDRE LE DUEL CONSERVÉ', 'RESUME SAVED DUEL'],
  ['RECOMMENCER DEPUIS LA PREMIÈRE MANCHE', 'RESTART FROM ROUND ONE'],
  ['REPRISE CONSERVÉE · ÉTAT DU DUEL ENREGISTRÉ', 'CHECKPOINT SAVED · DUEL STATE RECORDED'],
  ['Duel restauré. Reprenez avec P, Start ou le bouton Reprendre.', 'Duel restored. Resume with P, Start or the Resume button.'],
  ['Duel sauvegardé. Retrouvez la manche, la santé et le chrono enregistrés.', 'Duel saved. Resume with your saved round, health and timer.'],
  ['FENÊTRE VERTE', 'GREEN WINDOW'],
  ['FENÊTRE FERMÉE', 'WINDOW CLOSED'],
  ['PRESSION DU CONFINEMENT', 'CONTAINMENT PRESSURE'],
  ['SORTIE DE ZONE', 'CLEAR THE HAZARD']
]);

// The English catalog (~600 kB) is loaded only when English is chosen, so a
// French session downloads and parses nothing more.
const exact = new Map();
const upper = new Map();
const english = new Set();
let compiled = [];
let loading = null;
const cache = new Map();

// Patterns: French templates with {0}, {1}… holes. Holes are translated again
// when they are themselves known French text (room names, labels).
const escapeRegex = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const compilePatterns = patterns => Object.entries(patterns).map(([fr, en]) => {
  const parts = fr.split(/\{(\d+)\}/);
  let source = '^';
  const order = [];
  parts.forEach((part, index) => {
    if (index % 2) { source += '(.+?)'; order.push(Number(part)); } else source += escapeRegex(part);
  });
  return { regex: new RegExp(source + '$', 'su'), order, en, upperRegex: new RegExp(source.toUpperCase() + '$', 'su') };
}).sort((a, b) => b.regex.source.length - a.regex.source.length);

/** Fill the lookup tables from a catalog module (exported for tests). */
export function useCatalogV185({ EN_CATALOG_V185: catalog = {}, EN_PATTERNS_V185: patterns = {} } = {}) {
  exact.clear(); upper.clear(); english.clear(); cache.clear();
  for (const [fr, en] of Object.entries(catalog)) {
    exact.set(fr, en); english.add(en);
    if (fr !== fr.toUpperCase()) { upper.set(fr.toUpperCase(), en.toUpperCase()); english.add(en.toUpperCase()); }
  }
  compiled = compilePatterns(patterns);
  return autoCatalogSizeV185();
}

/** Load the English catalog once; resolves when the tables are ready. */
export function loadCatalogV185() {
  loading ??= import('./i18n-en-catalog-v185.js').then(useCatalogV185).catch(error => { loading = null; throw error; });
  return loading;
}


function fromPatterns(text) {
  for (const pattern of compiled) {
    for (const [regex, toUpper] of [[pattern.regex, false], [pattern.upperRegex, true]]) {
      const match = regex.exec(text);
      if (!match) continue;
      const values = [];
      pattern.order.forEach((slot, index) => { values[slot] = translateCore(match[index + 1], 2); });
      const result = pattern.en.replace(/\{(\d+)\}/g, (all, slot) => values[Number(slot)] ?? all);
      return toUpper ? result.toUpperCase() : result;
    }
  }
  return null;
}

function translateWhole(text) {
  if (exact.has(text)) return exact.get(text);
  if (upper.has(text)) return upper.get(text);
  return arenaLabels.get(text) ?? trialLabels.get(text) ?? fromPatterns(text);
}

// Messages are often joined: "ERREUR · A. B." Translate each known piece,
// split on " · " and between sentences; unknown pieces stay French.
function translateCore(text, depth = 0) {
  // Generic contact patterns would absorb the beacon's window label into an
  // untranslated placeholder. Keep its independent telemetry fields separate.
  if (depth < 2 && /(?:^| · )FENÊTRE (?:VERTE|FERMÉE) · /u.test(text)) {
    return text.split(' · ').map(piece => translateCore(piece, depth + 1)).join(' · ');
  }
  const whole = translateWhole(text);
  if (whole != null) return whole;
  if (depth > 1) return text;
  for (const separator of [' · ', /(?<=[.!?…])\s+(?=[A-ZÀ-Ý«])/u]) {
    const pieces = text.split(separator);
    if (pieces.length < 2) continue;
    const translated = pieces.map(piece => translateCore(piece, depth + 1));
    if (translated.some((piece, index) => piece !== pieces[index])) return translated.join(typeof separator === 'string' ? separator : ' ');
  }
  return text;
}

/** Translate one French string to English when it is known; otherwise return it unchanged. */
export function autoTranslateV185(text) {
  if (typeof text !== 'string' || currentLanguageV185() !== 'en') return text;
  const trimmed = text.trim();
  if (trimmed.length < 2 || english.has(trimmed)) return text;
  let result = cache.get(trimmed);
  if (result === undefined) {
    result = translateCore(trimmed);
    if (cache.size >= CACHE_LIMIT) cache.clear();
    cache.set(trimmed, result);
  }
  if (result === trimmed) return text;
  const lead = text.match(/^\s*/)[0];
  const trail = text.match(/\s*$/)[0];
  return lead + result + trail;
}

export function autoCatalogSizeV185() { return { exact: exact.size, patterns: compiled.length }; }

// Keep both sides of each change. The game can reuse a node for another message
// while English is active; only restore text still owned by this layer.
const originalText = new WeakMap();
const originalAttributes = new WeakMap();

function skipped(node) {
  for (let element = node.nodeType === 1 ? node : node.parentElement; element; element = element.parentElement) {
    if (SKIP_TAGS.has(element.tagName) || element.isContentEditable || element.hasAttribute?.('data-i18n-skip')) return true;
  }
  return false;
}

function translateTextNode(node) {
  const value = node.nodeValue;
  if (originalText.get(node)?.translated === value) return;
  originalText.delete(node);
  if (!value || !value.trim() || skipped(node)) return;
  const translated = autoTranslateV185(value);
  if (translated !== value) { originalText.set(node, { french: value, translated }); node.nodeValue = translated; }
}

function translateAttributes(element) {
  if (skipped(element)) return;
  for (const name of ATTRIBUTES) {
    const value = element.getAttribute?.(name);
    const saved = originalAttributes.get(element) || {};
    if (saved[name]?.translated === value) continue;
    delete saved[name];
    if (!value) continue;
    const translated = autoTranslateV185(value);
    if (translated === value) continue;
    saved[name] = { french: value, translated };
    originalAttributes.set(element, saved);
    element.setAttribute(name, translated);
  }
}

function walk(root, documentRef) {
  if (!root) return;
  if (root.nodeType === 3) { translateTextNode(root); return; }
  if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
  if (root.nodeType === 1) translateAttributes(root);
  const walker = documentRef.createTreeWalker(root, 5 /* SHOW_ELEMENT | SHOW_TEXT */);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === 3) translateTextNode(node); else translateAttributes(node);
  }
}

function restore(root, documentRef) {
  const restoreNode = node => {
    if (node.nodeType === 3) {
      const saved = originalText.get(node);
      if (saved?.translated === node.nodeValue) node.nodeValue = saved.french;
      originalText.delete(node);
    } else {
      const saved = originalAttributes.get(node);
      if (saved) {
        for (const [name, { french, translated }] of Object.entries(saved)) {
          if (node.getAttribute(name) === translated) node.setAttribute(name, french);
        }
        originalAttributes.delete(node);
      }
    }
  };
  restoreNode(root);
  const walker = documentRef.createTreeWalker(root, 5);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) restoreNode(node);
}

function patchCanvas(globalRef) {
  const prototype = globalRef.CanvasRenderingContext2D?.prototype;
  if (!prototype || prototype.__atfI18nV185) return;
  for (const name of ['fillText', 'strokeText', 'measureText']) {
    const original = prototype[name];
    if (typeof original !== 'function') continue;
    prototype[name] = function translatedCanvasText(text, ...rest) { return original.call(this, autoTranslateV185(text), ...rest); };
  }
  Object.defineProperty(prototype, '__atfI18nV185', { value: true });
}

/** Install the layer once in the browser: canvas text, initial DOM and later changes. */
export function installAutoTranslationV185({ documentRef = globalThis.document, globalRef = globalThis } = {}) {
  if (!documentRef?.body || !globalRef.MutationObserver) return false;
  patchCanvas(globalRef);
  let applying = false;
  const run = () => {
    if (applying) return;
    applying = true;
    try { if (currentLanguageV185() === 'en') walk(documentRef.body, documentRef); else restore(documentRef.body, documentRef); }
    finally { applying = false; }
  };
  const apply = () => {
    if (currentLanguageV185() !== 'en') { run(); return; }
    loadCatalogV185().then(run).catch(() => { /* Offline without the catalog: the game stays in French. */ });
  };
  const observer = new globalRef.MutationObserver(records => {
    if (applying || currentLanguageV185() !== 'en') return;
    applying = true;
    try {
      for (const record of records) {
        if (record.type === 'characterData') translateTextNode(record.target);
        else if (record.type === 'attributes') translateAttributes(record.target);
        else for (const node of record.addedNodes) walk(node, documentRef);
      }
    } finally { applying = false; }
  });
  observer.observe(documentRef.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTES });
  documentRef.addEventListener(LANGUAGE_EVENT_V185, apply);
  apply();
  return true;
}
