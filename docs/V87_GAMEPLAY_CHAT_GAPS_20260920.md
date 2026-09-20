# V87 — Trois conversations gameplay relues le 20 septembre 2026

Document privé, exclu du dépôt public, du build, du cache PWA et de toute pièce jointe publique.

## Portée et preuve de lecture

Projet confirmé par `list_projects` : **Aliens tantalus project**, `g-p-6a945bfa0d3c8191befd9a84068b90a4`.
Inventaire connu inchangé : 26 IDs du ledger V76 et trois récents V87, soit 29, sans exhaustivité certifiée.
La fenêtre globale `list_threads` est limitée à 50 tâches ; elle ne remplace pas un inventaire complet du projet.
Les trois lectures ci-dessous ciblent des chats du ledger, différents des trois chats récents animations/REFUGE/PALISADE.

Base privée publiée contrôlée : `f27e6bbb9d8f7e1b5f1348ef878f8d91ff9907da`.
Commit public contrôlé : `4f318e43c2b5ed61d2be644f0cd9588ff8435ed9`.
Les modifications animales du tour courant ne sont pas utilisées pour annoncer une nouvelle livraison. Mica reste en cours.
La passe est documentaire : lecture ChatGPT et code, aucune implémentation, génération, simulation navigateur, publication ou accès au navigateur utilisateur.

| Titre exact retourné | Chat ID | Messages et complétude |
| --- | --- | --- |
| Hordes d’ennemis'occasionnelles | `6a9e030f-a2c4-83ed-9832-259fa7a7b0c0` | Utilisateur `1d0e3aff-167f-4f6c-abdd-0408a8871d85` ; réponse `b8164eb2-5fe1-4bbf-8f2d-5eeb00f50789`, 13 566 caractères, complète. |
| Proposer mécaniques HUD Alien | `6a999dca-3efc-83eb-907a-623f11cf2388` | Utilisateur `a1af61cf-6982-439a-8dd2-a0a9f6f538e7` ; réponse `d5c2171a-44f0-4331-8a70-6d4437e404e8`, 18 638 caractères, complète. |
| Idée spawn ennemis Tentalus | `6a98c871-61ac-83ed-be5c-600c473690e2` | Trois tours : réponses `09ea1070-d386-45b8-8b82-1a3daeda49b6` (12 885 caractères, complète), `7b22d4a6-9dea-4e13-91e4-29316cde35dc` (20 000 caractères, tronquée), `30f8ad22-d125-4862-80dc-98e07de369e5` (16 651 caractères, complète). |

Les trois résultats ont `attachments=[]`, `nextCursor=null`, `hasMore=false`.
Aucune URL HTTP(S) n'est exposée dans leurs messages. HUD et BIOFORGE ont chacun quatre références internes `chatgpt-content-reference` indices 1–4 ; ce ne sont pas des liens de téléchargement utilisables.
La pagination terminée ne restaure pas la fin tronquée de la réponse intermédiaire BIOFORGE.
Aucun nouvel export source intégral n'est créé par ce rapport : il conserve une synthèse contrôlée et les identifiants des messages lus.

## 1. Hordes occasionnelles : système encore non identifié

La demande utilisateur porte sur des hordes de xénomorphes basiques tuables en une balle et des nuées, occasionnelles mais réellement massives.
La réponse développe un contrat cohérent sans transformer ce mode de rencontre en nouvelle espèce canonique :

- Profil de rencontre horde indépendant de l'espèce ; un impact de balle valide suffit, même avec une arme secondaire ou un tir allié. Les standards gardent leurs résistances.
- Densité simultanée réelle ; chaque assaillant compté peut être touché, tuer et mourir. Des dizaines à l'écran et une centaine sur un événement sont des objectifs à mesurer, pas un benchmark déjà atteint.
- Arrivées annoncées par sol, plafond, conduits ou passerelles, compatibles avec les chemins, jamais sur le joueur.
- Événements défense, percée, fuite ou neutralisation d'une source ; fin explicite, temps de respiration et absence de vague infinie dissimulée.
- Arbitrage des dégâts de contact, pas de chaîne de QTE, acidité/cadavres limités, munitions et issue compatibles avec l'objectif.
- Récompense liée à l'événement, pas farming de chaque créature.

Exemple proposé par la source : « Rupture du sas C-12 », attente d'un ascenseur, première marée, arrivée secondaire au plafond, puis extraction possible sans tuer chaque ennemi restant.

**Contrôle code.** Recherche ciblée dans `src` et `tests` des termes `horde`, `Horde`, `oneHit`, `one-hit`, `hordeProfile`, `continuous-horde` : seulement la promesse APC `last-course-tantalus`, `implementationStatus: 'partial'`, `playable: false`, `requiredMechanics: ['lane-driving', 'continuous-horde', ...]` dans `src/special-operations-v67.js:187–190`.
Les entrées de faune/comportement nommées `swarm` ne prouvent pas le directeur, la densité ou la règle one-hit : `src/game-runtime.js:52` les classe comme `pouncer`.
Conclusion bornée : aucun système couvrant ce contrat identifié dans le code examiné ; pas de prétention à démontrer l'absence de tout comportement équivalent sous n'importe quel nom.

## 2. BIOFORGE : vrai socle, composition et portée limitées

La première demande exige une zone fermée dont les ennemis ne peuvent sortir, avec choix des espèces et quantités.
Les réponses visibles demandent en plus :

- Zone d'observation, terminal, arène physique et sas interverrouillés.
- Composition multi-espèces, file éditable, annulation/purge, renforts, vagues et modes d'arrivée.
- Quantité totale distincte du maximum d'acteurs simultanés.
- Registre de profils réellement compatibles et artistiquement prêts ; pas un catalogue encyclopédique rendu artificiellement jouable.
- Ni créature royale réduite pour entrer ni aquatique déplacée sur sol sec.
- Isolation campagne, pas de récompense farmable, purge des descendants et projectiles, reprise sûre.

### Ce qui existe et ce qui bloque réellement

Le runtime BIOFORGE, le niveau, le sas, les profils validés, les sessions et la purge existent ; ce rapport ne les réduit pas à un placeholder.

| Point contrôlé | Preuve locale | Limite |
| --- | --- | --- |
| Liste sélectionnable | `src/bioforge-session-v80.js:32–65` | Onze profils terrestres explicitement sélectionnés, pas 571 profils accessibles. |
| Configuration | `src/bioforge-session-v80.js:127–146` | Un seul `profileId` ; quantité refusée si >12 ou au-delà du budget 12. |
| File | `src/bioforge-session-v80.js:156–167` | Toutes les entrées ont le même `selection.profileId`. |
| Démarrage | `src/bioforge-session-v80.js:433–490` | Une session porte un profil et un budget global uniques. |
| Contrôles UI | `src/bioforge-ui-v80.js:137–148`, `:183–185` | Sélecteur/quantité uniques, désactivés pendant la session ; pas d'éditeur de composition active. |
| Horloge runtime | `src/bioforge-runtime-v80.js:550–563` | Impression puis combat, pas impression progressive simultanée au combat. |
| Tir | `src/bioforge-runtime-v80.js:629–632` | Refus hors phase `combat`. |
| Historique | `src/bioforge-session-v80.js:573–607` | Résultat et records attribués à `session.profileId`, donc à repenser pour plusieurs profils. |

**Risque d'une extension naïve :** relever seulement la quantité puis attendre qu'une place active se libère pendant `printing` pourrait bloquer la session, puisque ni le tir ni la simulation de combat ne sont alors actifs. Cette observation est une contrainte du prochain lot, pas un bug ajouté ni un échec du périmètre V80 monoprofil actuel.

### Assets annoncés, pas récupérés

La réponse finale annonce 666 entrées de production : 571 atlas ennemis et 95 visuels BIOFORGE, environ 26 984 frames, 16 familles et 53 lots. Ce sont les chiffres de la source et non des mesures de production actuelle.
Exemples de noms effectivement lisibles : `bioforge-aquatic-far.webp`, `bioforge-printer-chamber-xl.webp`, `echo9-marine-bioforge-interaction.webp`, `inez-harlow-bioforge-operator.webp`, `bishop-9-bioforge-operator.webp`.
Ni leur fichier ni le manifeste/Excel BIOFORGE annoncé ne sont exposés par cette lecture. Aucun nom de fichier ne doit être présenté comme téléchargé.
Le tableau de production ancien de cette réponse ne constitue pas un audit artistique actuel des atlas déjà ajoutés depuis.

## 3. HUD, couverture, torche et autodestruction : écarts ciblés

La source demande un HUD contextuel Alien, équipements physiques vulnérabilisants, terminal rétro, carte pression/portes/énergie/caméras, couverture active, torche qui modifie la carte et autodestruction qui modifie réellement le niveau.

Acquis réels : `alien-survival-runtime-v70.js`, `alien-survival-systems-v70.js`, UI/visuels associés ; soudure temporisée/interrompable, corrosion, pression, double autorisation et décompte d'autodestruction.

- **Torche** : `beginAlienSurvivalWeldV70`, `src/alien-survival-runtime-v70.js:618–641`, refuse toute porte autre que `cargo-bulkhead` (:623). Kit, scan CCTV, route alternative, portée, interruption et intégrité sont réels. Aucun actionneur inverse de découpe/dessoudage dans ce module. Le contrat générique portes/grilles/conduits/fuites/câbles reste plus vaste.
- **Autodestruction** : armement :935–956 et décompte :959–980. Deux autorisations et préconditions physiques existent. Aucune fenêtre d'annulation avant point de non-retour identifiée ; la fonction d'annulation présente :645 traite l'action de soudure, pas l'autodestruction.
- **Couverture** : `src/game-v51-runtime.js:848` calcule `inCover` à partir de l'accroupissement et d'un abri ; :1439–1441 applique une réduction des dégâts. Il existe donc une couverture de base. Les états dédiés pour regarder/tirer de côté, tirer à l'aveugle, franchir et enchaîner les abris n'ont pas été identifiés dans le périmètre examiné.

Les références graphiques internes, la proposition de trois polices et les icônes annoncées ne valent pas preuve de fichiers produits ou intégrés. Aucun nouvel audit visuel complet du HUD n'est revendiqué ici.

## 4. Prochain lot proposé : BIOFORGE-MIX-A, non codé dans cette passe

But borné : une composition terrestre réellement mixte et une file totale plus longue que le nombre simultané, jouables dans l'arène existante, sans élargir silencieusement le registre à des créatures non validées.
Ce lot ne clôt ni les hordes massives de campagne, ni les 571 profils, ni les cellules aquatiques/royales.

### Contrat proposé à valider avant implémentation

1. **État canonique.** Ajouter une composition ordonnée de lignes `{lineId, profileId, quantity}`, un plafond total distinct et un budget simultané. Proposition initiale de sécurité : total ≤48, nombre simultané ≤12 et somme des coûts actifs ≤12 ; ces valeurs sont un choix de production proposé, pas une prescription du chat. Conserver les onze profils validés et les seuils de coût/compatibilité.
2. **Compatibilité.** Convertir explicitement une ancienne configuration `{profileId, quantity}` en une ligne. Reprendre les anciennes sessions sans relancer l'impression ni perdre records/historique. Ne pas changer la clé de sauvegarde ou créer une seconde source de vérité ; traiter les données futures/corrompues selon le contrat de sauvegarde existant.
3. **Ordonnanceur réel.** Laisser tourner combat et impression progressive ensemble une fois le sas fermé. Attendre une capacité active disponible sans perdre le timer ni consommer l'entrée. L'identité de chaque spécimen vient de sa ligne, pas de `session.profileId`. Un spawn échoué ne devient pas une créature comptée. Identifiants stables et événements idempotents après reprise.
4. **Descendants.** Revalider les Ovomorphes/descendants déjà autorisés et compter réellement les acteurs actifs ; réserver une capacité ou différer l'éclosion si nécessaire. Ne pas garantir le plafond en ne comptant que les entrées de file principales.
5. **Terminal.** Ajouter/supprimer/modifier/réordonner les lignes avant lancement, montrer total/en attente/imprimés/vivants et le budget actif, prévisualiser chaque identité au bon ratio. Garder la purge accessible et un retour interdit avant nettoyage. Les renforts pendant une session, les presets et les modes chronométrés peuvent former MIX-B : les afficher explicitement non livrés par MIX-A, sans boutons factices.
6. **Résultat.** Une session se termine après file épuisée et menace active neutralisée ; historique global unique plus compteurs par profil réellement imprimé/neutralisé. Pas d'expérience, butin ou progression de campagne. Préserver le budget d'équipement de l'entraînement et vérifier qu'une composition légale ne crée pas de blocage de munitions.

### Raccords réels à étendre

- `src/bioforge-session-v80.js` : validation, normalisation, construction de file, démarrage, progression, résultat, reprise.
- `src/bioforge-runtime-v80.js` : `resolveBioforgeConfigurationV80`, démarrage/reprise, `advanceBioforgePhaseV80`, `update`, `fire`, spawning, purge.
- `src/bioforge-ui-v80.js` et markup existant : composition et compteurs ; `src/app.js:387–419` pour le passage du contrat au terminal.
- `src/save.js:2008` : consommation du sanitizer existant, migration testée ; pas de duplication de stockage.
- Tests existants `bioforge-session-v80`, `bioforge-save-v80`, `bioforge-runtime-v80`, `bioforge-ui-v80`, `bioforge-app-v80`, `bioforge-aim-v83` et harnais `browser-bioforge-v80.mjs`.

### Critères de sortie proposés

- Exemple réel de trois profils et 18 spécimens totaux, plafond inférieur au total ; profils visuellement distincts et bon nombre réellement créé, pas 18 variantes du même corps.
- Mesure de l'actif et des coûts à chaque tick, y compris descendants ; zéro dépassement, zéro spawn fantôme et zéro blocage d'impression.
- Tir, dommages et IA fonctionnels avant la fin de la file ; pause/chargement sans avancement clandestin.
- Sauvegarde/reprise pendant impression avec vivants ; aucun doublon, zéro réapparition d'un mort, records attribués aux bons profils.
- Anciennes sauvegardes monoprofil, mort, interruption, abort/purge et fermeture du terminal restent sûrs.
- Purge complète de tous les profils/descendants/projectiles ; sas jamais simultanément ouverts, aucune fuite vers le hub.
- Parcours navigateur physique terminal → sas → combat mixte → purge → retour et rechargement, avec captures/rendu réel et contrôles campagne inchangée.

## Conclusion

Trois sources existantes sont mieux couvertes documentairement, mais leurs manques ne sont pas transformés en fonctionnalités par ce rapport.
Sept compagnons et REFUGE restent les acquis publiés à la base citée. Mica en cours, PALISADE, animations denses, hordes et extensions BIOFORGE/HUD demeurent des sujets distincts.
Pas de nouveau fichier récupéré, pas d'audit prétendument exhaustif, pas de nouvelle certification de jeu commercial complet ou de fidélité 1:1.
