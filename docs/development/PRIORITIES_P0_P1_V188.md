# Lot V188 : priorités P0 et P1 de la bible

Document de développement, uniquement dans les sources. Les priorités et les valeurs proposées se trouvent au [§56 de la bible](../narrative/CAMPAGNE_PRINCIPALE.md). Ce document décrit ce qui a été raccordé, comment le vérifier et ce qui reste ouvert.

## Cadre

- Décisions du propriétaire du 2026-11-12 :
  - classement P0/P1 validé ;
  - levée de la protection de `src/save.js` ;
  - valeurs chiffrées proposées par Claude, marquées **[PROPOSÉ]** ;
  - outils IA commités dans un commit séparé.
- Chaîne d'audit : `scripts/audit-tantalus-priorities-v188.mjs` prolonge V183 → V187.
  - Chaque fichier existant modifié reçoit un reçu exact (prédécesseur à `803db26`, successeur actuel).
  - Les préservations de V187 passent maintenant par cette chaîne.
- Sauvegarde : tous les nouveaux champs sont **additifs**. Une sauvegarde ancienne reçoit une valeur par défaut et ne perd rien. Le `saveSchema` reste 52. Les nouveaux champs sont :
  - `storyCampaignV188` ;
  - `reactiveLinesV188` ;
  - `player.originV188` ;
  - dans `settings` : `crewPermadeathV188`, `customDifficultyV188`, `colorblindV188`, `textScaleV188` et `keyBindingsV188`.
- Outils IA :
  - Spec Kit et Claude Code Game Studios ont été adoptés aux révisions de `.ai-tools/sources.json`.
  - Leurs 644 fichiers sont listés avec leur empreinte dans `.ai-tools/adopted-v188.json`. Ils restent source uniquement et sont refusés dans un build.
  - Superpowers est un plugin du client : il a été chargé pour la session à la révision vérifiée, sans être commité.

## Ce qui est raccordé

| # | Module | Raccordement |
| --- | --- | --- |
| P0-1 | `src/story-campaign-v188.js` | Étape de la première heure dérivée des machines existantes. QZ-18 est planifié après Port-Méridien. Objectif du hub. Compte rendu marqué lu aux Opérations. |
| P0-2 | `src/audio-cues-v188.js`, `scripts/generate-audio-v188.mjs` | 40 bruitages WAV synthétisés hors ligne, branchés aux événements, aux pas selon le sol, au tir par arme et au clic à vide. |
| P0-3 | `src/audio.js`, `src/audio-assets-v77.js` | Ambiances alerte, boss, fins et calme pilotées par le directeur de tension et les boss. Repli sur les musiques existantes. |
| P0-4 | `src/mission-objective-panel-v188.js` | Objectifs en pause et avec la touche M (O sert au tir de J2 en coop), en FR et EN. |
| P0-5 | `src/combat-feel-v188.js` | Secousse par tir, marqueur d'impact, recul de 4 px et confirmation d'élimination, tous soumis au réglage de secousses. |
| P0-6 | `src/tension-director-v188.js` | Intensité, pic et relâche garantie. Les vagues de horde attendent la phase de montée. |
| P0-7 | `src/tension-director-v188.js` | Faux échos du détecteur en Horreur et en Tension, avec leur source révélée à l'approche. |
| P0-8 | `src/mission-register-v188.js` | Registre par mission. Sauvegarde libre hors combat ou terminal de 3 s selon le registre. |
| P1-1 | `src/caste-behaviors-v188.js` | Drone qui recule devant l'arme, rôdeur qui attend puis contourne, embusqué immobile puis bondissant. |
| P1-2 | `src/run-options-v188.js`, `src/save.js` | Mort définitive au choix : blessure grave de 3 jours au lieu du mémorial. Elle peut être désactivée, jamais réactivée. |
| P1-3 | `src/run-options-v188.js`, créateur | 20 origines, `origin-20` par défaut. Capacités raccordées : `origin-13` et `origin-18`. |
| P1-4 | `src/run-options-v188.js`, `src/game-runtime.js` | Difficulté `custom` : six valeurs bornées et récompense calculée. |
| P1-5 | `src/accessibility-v188.js` | Mode daltonien, taille du texte, sous-titres de 17 sons, remappage de 14 actions. |
| P1-6 | `src/reactive-lines-v188.js` | Répliques après une mission ratée, une perte de colons ou un retour blessé, sans répétition pendant 3 jours. |

## Mesure du tir (P0-5)

Scène commune : `scripts/verify-combat-feel-v188.mjs`. Une cible est placée à 260 px et le joueur tire en continu pendant 1,5 s, avec la passe désactivée puis activée.

| Mesure | Avant | Après |
| --- | --- | --- |
| Tirs acceptés | 12 | 12 |
| Santé restante de la cible | 200 | 200 |
| Secousse maximale | 0 | 0,07 (amplitude ≈ 0,5 px au réglage par défaut) |
| Confirmations d'impact | 0 | 10 |
| Recul cumulé de la cible | 0 px | 40 px |

Avec la réduction des mouvements activée, aucune secousse n'est produite et les marqueurs d'impact restent. Ces chiffres décrivent la quantité de retours ajoutés. Ils ne prouvent pas une meilleure sensation : celle-ci reste à juger en test de jeu (§53.11).

## Vérifications

Toutes les suites listées ci-dessous ont été exécutées.

- Suites V188 dans `npm run test:priorities:v188` :
  - audit et outils ;
  - registre, tension et faux échos ;
  - tranche et objectifs ;
  - audio ;
  - tir ;
  - options de partie ;
  - accessibilité ;
  - répliques ;
  - castes.
- Elles s'appuient sur le vrai `GameEngine`, avec seulement les API du navigateur remplacées (`scripts/engine-host-v188.mjs`). Elles appellent aussi les vrais `beginOperation` et `resolveOperation`.
- Suite complète de référence `npm run test:all` :

  | Commit | Tests | Réussis | Échecs | Ignorés |
  | --- | --- | --- | --- | --- |
  | `main` (`803db26`) | 4 103 | 4 102 | 0 | 1 |
  | `e485f0a` | 4 130 | 4 129 | 0 | 1 |

  Le résultat de la tête finale figure dans la description de la branche.
- `npm run check`, `npm run build` et `npm run check:built` réussissent. Les 11 nouveaux modules d'exécution sont ajoutés à la coquille hors ligne de `sw.js`. `npm run i18n:check` donne 6 074 textes exacts et 441 modèles.
- Chromium, sur le serveur `scripts/dev.mjs` :
  - chargement de l'app sans erreur de console ;
  - présence des réglages ;
  - nouvelle partie par le créateur : l'origine choisie et la mort définitive désactivée sont enregistrées dans la sauvegarde ;
  - libellés anglais affichés après le changement de langue.

## Passe 2 (2026-11-12)

| Point | Résultat |
| --- | --- |
| Plafond (P1-1) | Un drone éligible sur trois s'accroche sous une vraie plateforme située 200 à 420 px au-dessus de son sol. Il reste immobile, donc invisible au détecteur, et il est dessiné à l'envers. Il se laisse tomber sur le joueur qui passe dessous ou quand il est touché. Il quitte le plafond si un autre système le déplace. Pas de plafond dans les missions Ruche ni dans les chapitres `special-`. |
| Terminal (P0-8) | Une console de remplacement est dessinée en primitives Canvas, sans image, au checkpoint sécurisé, avec l'invite « TERMINAL · SAUVEGARDER » à portée. |
| Fins (P0-3) | L'ambiance `ending` joue au Commandement une fois les quatre chapitres jouables de Cocyte terminés. |
| Touche des objectifs (P0-4) | C'est maintenant M, car O sert au tir de J2 en coop locale. Le remappage couvre 14 actions, avec Viser (Maj) et S'accroupir (Z). |
| Tranche (P0-1) | Les joueurs passent par le Commandement (table tactique), où QZ-18 était 112ᵉ sur 121 ordres. Il est désormais en tête, marqué ★ et présélectionné. Les objectifs nomment la table tactique de la salle de briefing. |
| Origines (P1-3) | 16 capacités sur 19 sont raccordées : 01, 02, 04 à 10, 12 à 15, 17 à 19. |
| Taille du texte (P1-5) | Les 108 tailles en `px` des écrans du joueur suivent le réglage. |
| Répliques (P1-6) | La réplique récente est reprise pendant 3 jours dans « La dernière sortie » du panneau d'équipage. |

QA Chromium de la passe 2, à partir d'une sauvegarde injectée « Port-Méridien terminé » :
- objectif du hub correct ;
- sortie vers le Commandement : « ★ QZ-18 · LE DERNIER RELAIS » en tête et présélectionné ;
- plan opérationnel affiché ;
- `plannedCampaignId` enregistré ;
- aucune erreur de console.

## Limites et travail restant

- **Musiques** : les quatre ambiances jouent la musique existante tant que les morceaux Flow du propriétaire manquent (§53.2).
- **Terminal de sauvegarde** : la console est un placeholder en primitives Canvas. L'art définitif reste à produire par le propriétaire.
- **Origines** : les 19 capacités sont raccordées. Les solutions pour 03, 11 et 16 sont décrites au §56.6, encore **[PROPOSÉ]**. Le fil du dossier caviardé (§2.4.3) attend le hub Asphodèle.
- **Origines raccordées par adaptation** :
  - 02 : convoi de survivants, faute d'escorte civile en mission ;
  - 14 : conduit fermé au chalumeau, faute de casiers ;
  - 19 : « couloir étroit » mesuré comme un plafond à moins de 140 px au-dessus de la tête.
- **Castes** : les mouvements ajoutés restent bornés au sol courant.
- **Mode daltonien** : correction de couleur globale (canvas et panneaux). Une palette Canvas dédiée n'est pas faite.
- **Répliques** : le texte est repris en français dans la réponse du mess. La réponse complète est dynamique et ne passe donc pas par le catalogue anglais.
- **Frontier Forge** : les tailles de texte de l'outil d'édition ne suivent pas le réglage, car leurs octets sont épinglés.
- **Non mesuré** : le test de la tranche par 3 à 5 joueurs (§53.11), le ressenti du tir, la peur et la durée de la première heure.
