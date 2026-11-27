const drill = (id, title, briefing, objectives, options = {}) => Object.freeze({
  id, title, briefing, objectives: Object.freeze(objectives), ...options,
});

export const XENO_TRIALS_NEW_DRILLS_V210 = Object.freeze([
  drill('intro-rearm', 'Départ après la présentation',
    'Passez une présentation. Attendez la fin du décompte, approchez la cible puis appuyez de nouveau sur Frappe légère.',
    ['Passer une présentation', 'Toucher après un nouvel appui'], { showIntroV210: true }),
  drill('low-defense', 'Défendre en posture basse',
    'Tenez d’abord la garde debout. Après le premier impact, maintenez Garde et Accroupir pour bloquer la frappe basse suivante.',
    ['Mettre la garde debout à l’épreuve', 'Bloquer une frappe basse en posture basse'], { pressure: 'low' }),
  drill('landing-evasion', 'Esquive à la réception',
    'Sautez avec le Prowler. Déclenchez Esquive au dernier instant avant de toucher le sol pour sortir en déplacement.',
    ['Effectuer un saut', 'Déclencher l’esquive en retrouvant le sol'], { playerId: 'prowler' }),
]);
