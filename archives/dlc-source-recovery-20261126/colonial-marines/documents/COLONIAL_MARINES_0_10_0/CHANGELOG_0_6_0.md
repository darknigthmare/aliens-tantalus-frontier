# 0.6.0 — Ligne de rupture

Base : 0.5.0 vérifiée par SHA-256. Quinze chapitres, 85 pièces, trois arènes conservés.

## Combat et terrain

- Sentinelles : 160 PV, projectiles alliés physiques, dégâts hostiles/acidité/grenade, ciblage local et état hors service conservant les réserves.
- Thermique : +10 par tir, −14/s simulée, verrou 100 → 35, veille manuelle sans remise à zéro.
- Réparation dans le monde : E 3,2 s, ou 6 s depuis zéro ; un kit à la fin pour +90 PV, aucun rechargement ni refroidissement instantané. Maintien annulable et non sérialisé.
- Kits distincts de la construction : plafond trois, attribution selon le paquetage, réserves de campagne, nouveau produit Bug Hunt à 180 crédits.
- Brûlure M240 : durée 2,4 s, six pulsations de six dégâts de base, renouvellement sans empilement. Raven/Reine exclus.
- Briefing de la prochaine vague en préparation, issu du même générateur que les apparitions.
- Jauges structure/thermique et états visuels ; correction du recouvrement O’Neal/escorte dans le HUD.

## Persistance et distribution

- Champ fieldVersion=1 et namespace V6 ; migration des trois reprises réelles 0.5, anciennes clés intactes. Imports actuels invalides refusés sans guérison silencieuse.
- game/field.js intégré explicitement dans Engine, le HTML autonome et l’installateur réversible.
- 51 tests Node supplémentaires (245 au total), 31 nouveaux contrôles Chromium. Neuf agents rejoués avec empreintes de code.
- 116 règles de codex, 42 captures légendées, 85 fiches de campagne et trois d’arène. Les préparations visuelles ne sont pas des preuves de parcours humain.

Statut : module autonome, non fusionné nativement à Tantalus. Aucun push/déploiement. Navigation native bloquée dans le navigateur de test, stockage simulé explicitement distingué.
