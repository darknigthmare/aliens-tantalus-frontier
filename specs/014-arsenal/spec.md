# Spécification : complétion de l’arsenal (alimentations, rechargements, VFX, armes manquantes)

**Spec** : `014-arsenal` | **Date** : 2026-11-22 | **Demande** : « toujours avec une fidélité 1:1 comme le reste, améliorer et compléter toutes les armes disponibles et manquantes avec leurs chargeurs, VFX, etc. » | **Sources de vérité** : `docs/arsenal/README.md`, `docs/arsenal/data/*.csv`, `docs/arsenal/weapon_system_contract_v1.json`, modules `src/weapon-*` | **Inventaire** : `docs/development/ARSENAL_COMPLETION_V188.md`

## Contexte

Le catalogue compte 178 armes (40 identités d’origine et leurs 106 finitions, 32 ajouts V116–V122). Le CSV maître de l’arsenal consigne l’alimentation de 71 identités ; la garde V193 n’admet un chargeur physique détachable que pour les quatre M41A et refuse d’en inventer pour M56, M240, M37A2, M83 et revolver. Le contrat V171 des alimentations spécialisées (tube, barillet, bande, réservoir, tir unique) existait sans raccord au moteur ; les tirs des armes d’action V131 (fusils à pompe, lance-flammes, roquettes, énergie) n’atteignaient pas le passage de bouche V188 ; les capacités historiques générées donnaient 72 roquettes dans le tube d’un M83 ou 44 chambres à un .357. La règle du projet interdit de déclarer une fidélité « 1:1 ».

## Exigences

- **FR-001 Inventaire.** Un tableau source (`docs/development/ARSENAL_COMPLETION_V188.md`, admission exacte, hors build) couvre chaque arme du catalogue et les armes de la franchise absentes (index de recherche V171, dossiers V170, médias demandés) : modèle, rôle, alimentation + capacité (source), modes/cadence (source ou [PROPOSÉ]), rechargement, VFX de bouche/éjection/impact, son, art tenu, chargeur au sol, statut de fidélité.
- **FR-002 Contrat lisible.** Un profil gelé par identifiant du catalogue (`src/weapon-arsenal-v188.js`) expose ces paramètres au moteur et au stand de tir de développement (lecture seule, résolution par identifiant exact).
- **FR-003 Politique d’alimentation.** Chargeur physique détachable et ramassage au sol uniquement avec preuve propre au modèle (inchangé : quatre M41A). Les autres armes utilisent l’alimentation documentée par le CSV avec son propre rechargement, sinon [À DÉFINIR].
- **FR-004 Pont natif.** Tube, barillet, bande, réservoir et tir unique fonctionnent en mission pour les armes du lot A : pompe après chaque tir, insertion cartouche par cartouche interruptible, étuis retenus jusqu’au rechargement, remplacement de bande/réservoir, une roquette par tube ; somme munitions + réserve conservée ; sauvegarde/reprise ; désactivation `arsenalFeedsV188: false`.
- **FR-005 VFX et audio.** Effets émis seulement après un tir accepté, par les couches existantes (`weapon-effects-v124`, `vfx-v188`) ; aucune douille pour M41A/M56/flammes/roquettes ; sons choisis parmi les indices V188 existants.
- **FR-006 Armes ajoutées.** Ajouts en fin de catalogue avec identifiants neufs (194–196), sans renuméroter ; identité citée ; aucune plaque → non achetables par la règle existante de l’armurerie (levée pour ces trois identifiants le 2026-11-23 : achetables derrière une plaque provisoire dessinée, voir FR-010), silhouette Canvas derrière un emplacement nommé ; reliés au profil, à la maîtrise, à l’index de recherche et au registre V170.
- **FR-007 Sauvegardes.** Champs additifs (`arsenalFeedV188`, schéma 188) ; anciennes sauvegardes et identifiants intacts ; `src/save.js` inchangé.
- **FR-008 Tests.** Suite Node dans `test:weapons` ; parcours Chromium tirant chaque arme du lot A en mission, 0 erreur.

## Fidélité

Rien n’est « 1:1 ». Documenté : alimentation/munition par identité (CSV maître), munitions M41A/M56 (reçus V124), classes « Shotgun » et « Flamethrower » d’*Alien: Isolation* (manuel Feral), fusil à pompe de Hicks (*Aliens*, 1986 ; identification Ithaca 37 par l’IMFDB, source secondaire). Adapté [PROPOSÉ] : capacités, cadences, temps de pompe et de rechargement, choix des effets et des sons. À définir : plaques natives, animations, chambrages, sons propres.

## Périmètre du lot

Lot A vérifié : armes USCM 001–017 et leurs finitions, revolver .357 (prototype V171) et ses finitions, ajouts 194–196 (75 identifiants). Hors lot : voir `tasks.md`.

## Décisions du propriétaire du 2026-11-23

- **FR-010 Plaque provisoire.** Les identifiants 194–196 sont achetables à l’armurerie au prix de la règle ordinaire. Leur fiche montre une plaque provisoire dessinée en Canvas derrière l’emplacement nommé `armory-plaque-provisional-<id>` ; aucune image n’est ajoutée et la plaque ne vaut pas art livré. Elles portent la même admission que le lot B (`admissionV188: 'provisional-plaque-purchasable'`) : une seule plaque, une seule porte d’achat.
- **FR-011 Pompe manuelle en option.** La pompe reste automatique par défaut (0,4 s [PROPOSÉ]). Un réglage additif active la pompe manuelle : action dédiée réaffectable (B par défaut), bouton tactile, invite texte ; même délai minimal ; l’équipier reste en automatique.
- Capacités (une roquette par tube, 6 chambres pour le .357, capacité de base pour les finitions) : conservées.
