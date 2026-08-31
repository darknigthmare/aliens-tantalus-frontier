# V66 batch001 — captured integration test output

Date: 2026-08-31. Exit code: 0. This is a Node engine/asset verification, not browser gameplay QA.

Command:

```text
node --test tests/enemy-batch-animation-integration-v66.test.mjs tests/enemy-batch-level-regression-v66.test.mjs tests/enemy-ovomorph-status-production-v66.test.mjs tests/enemy-v66-production-access.test.mjs tests/enemy-facehugger-child-physics-v66.test.mjs
```

Captured process output:

```text
✔ V66 batch001: les cinq profils acceptes resolvent leurs propres plaques de32poses (2.5558ms)
✔ lookup V66: ID exact prioritaire, aucun emprunt par nom contradictoire, variante ou espèce voisine (1.1957ms)
✔ enemy-001-ovomorph: la fabrique derive la physique de la hitbox calibree et conserve le sol (0.6929ms)
✔ enemy-001-ovomorph: drawEnemy V51 utilise la cellule globale et le pivot V66 sans etirement (1.839ms)
✔ enemy-003-chestburster: la fabrique derive la physique de la hitbox calibree et conserve le sol (0.1402ms)
✔ enemy-003-chestburster: drawEnemy V51 utilise la cellule globale et le pivot V66 sans etirement (0.2732ms)
✔ enemy-004-drone-big-chap: la fabrique derive la physique de la hitbox calibree et conserve le sol (0.1617ms)
✔ enemy-004-drone-big-chap: drawEnemy V51 utilise la cellule globale et le pivot V66 sans etirement (0.2289ms)
✔ enemy-005-warrior: la fabrique derive la physique de la hitbox calibree et conserve le sol (0.1828ms)
✔ enemy-005-warrior: drawEnemy V51 utilise la cellule globale et le pivot V66 sans etirement (0.3113ms)
✔ enemy-006-runner: la fabrique derive la physique de la hitbox calibree et conserve le sol (0.1524ms)
✔ enemy-006-runner: drawEnemy V51 utilise la cellule globale et le pivot V66 sans etirement (0.2343ms)
✔ enemy-003-chestburster: resolver et sampler parcourent les32cellules sans changer d identite (0.5774ms)
✔ enemy-003-chestburster: premier rendu tardif et horloge graphique decalee respectent l impact combat5/12 (1.1672ms)
✔ enemy-003-chestburster: blessure ne montre pas un cadavre et mort prime sur attaque obsolete (0.1663ms)
✔ enemy-004-drone-big-chap: resolver et sampler parcourent les32cellules sans changer d identite (0.26ms)
✔ enemy-004-drone-big-chap: premier rendu tardif et horloge graphique decalee respectent l impact combat5/12 (0.263ms)
✔ enemy-004-drone-big-chap: blessure ne montre pas un cadavre et mort prime sur attaque obsolete (0.0713ms)
✔ enemy-005-warrior: resolver et sampler parcourent les32cellules sans changer d identite (0.2755ms)
✔ enemy-005-warrior: premier rendu tardif et horloge graphique decalee respectent l impact combat5/12 (0.2294ms)
✔ enemy-005-warrior: blessure ne montre pas un cadavre et mort prime sur attaque obsolete (0.0702ms)
✔ enemy-006-runner: resolver et sampler parcourent les32cellules sans changer d identite (0.2348ms)
✔ enemy-006-runner: premier rendu tardif et horloge graphique decalee respectent l impact combat5/12 (0.4196ms)
✔ enemy-006-runner: blessure ne montre pas un cadavre et mort prime sur attaque obsolete (0.0488ms)
✔ V66 mouvement reel: la collision V51 ne laisse pas le Runner en idle quand x avance (0.1841ms)
✔ V66 alerte immobile: aucune marche sur place quand aucun deplacement n a eu lieu (0.1136ms)
✔ sample accepte uniquement les frames globales appartenant au clip demande (0.462ms)
✔ Ovomorph sealed: les8poses proviennent de l horloge du cycle meme sans rendu precedent (0.2749ms)
✔ Ovomorph opening: les8poses proviennent de l horloge du cycle meme sans rendu precedent (0.1522ms)
✔ Ovomorph hatch: les8poses proviennent de l horloge du cycle meme sans rendu precedent (0.0875ms)
✔ Ovomorph destroyed: les8poses proviennent de l horloge du cycle meme sans rendu precedent (0.0854ms)
✔ Ovomorph spent: la derniere pose hatch23 reste verrouillee sans reouverture graphique (0.157ms)
✔ Ovomorph mort avant update: deathClock du vrai moteur pilote destroyed et jamais hatch (0.1702ms)
✔ Ovomorph cycle reel: opening puis hatch libere un acteur V65 distinct et spent reste stable (1.2829ms)
✔ Level ladder: annulation AVANT super combat a l instant precis de l impact (0.8691ms)
✔ Level surface-height: annulation AVANT super combat a l instant precis de l impact (0.2772ms)
✔ navigation ladder: aucun impact avant annulation dans le vrai flux V52 (3.5493ms)
✔ navigation lift: aucun impact avant annulation dans le vrai flux V52 (0.5534ms)
✔ production avec PNJ le plus proche: ladder annule avant l impact, sans contourner Level (0.417ms)
✔ production avec PNJ le plus proche: lift annule avant l impact, sans contourner Level (0.2243ms)
✔ production avec PNJ le plus proche: upstairs-target annule avant l impact, sans contourner Level (0.5141ms)
✔ production Runner contre PNJ: le vide entre deux plateformes interrompt le bond avant tout degat (0.7122ms)
✔ changement d etage64px a5/12: la navigation annule avant la melee pourtant encore a portee verticale (0.318ms)
✔ cible escouade verrouillee: chef dead ne detourne pas le combat ou la navigation (0.4222ms)
✔ cible escouade verrouillee: chef in-vent ne detourne pas le combat ou la navigation (0.3219ms)
✔ cible escouade verrouillee: chef upstairs ne detourne pas le combat ou la navigation (0.3386ms)
✔ cible escouade verrouillee: chef closer-decoy ne detourne pas le combat ou la navigation (0.2142ms)
✔ coop verrouille: un PNJ plus proche et le joueur en conduit ne remplacent pas sa cible (0.2813ms)
✔ cible PNJ invalidee: annule le verrou sans transferer le coup a un autre membre (0.318ms)
✔ Runner au bord du vide: chaque sous-pas valide son support avant tout impact (0.4057ms)
✔ Runner limite du monde: un bond ne frappe jamais depuis une position hors limites (1.3233ms)
✔ ennemi mort ladder: aucun deplacement ni navigation ni impact residuel (0.8807ms)
✔ ennemi mort upstairs-target: aucun deplacement ni navigation ni impact residuel (0.2014ms)
✔ ennemi mort no-target: aucun deplacement ni navigation ni impact residuel (0.2029ms)
✔ le factory du Facehugger standard utilise le vrai corps V65 et conserve son ancre au sol (1.5136ms)
✔ un enfant réel éclot et avance sous 30px libres, puis sa vraie largeur bloque une paroi de 2px (2.1539ms)
✔ 27px libres refusent cette place et utilisent le côté réellement dégagé, sans traverser le plafond (0.2269ms)
✔ production player, Level=true: brouillage4s expire exactement une fois puis eclosion unique (3.8645ms)
✔ production player, Level=false: brouillage4s expire exactement une fois puis eclosion unique (0.4489ms)
✔ production squad, Level=true: brouillage4s expire exactement une fois puis eclosion unique (0.4057ms)
✔ production squad, Level=false: brouillage4s expire exactement une fois puis eclosion unique (0.3219ms)
✔ stun et brouillage au milieu de opening preservent le curseur et n avancent que le temps libre (0.3255ms)
✔ jammedClock: hatch suspendu ne libere pas sous effet, reprend au meme curseur puis ne duplique pas (0.4026ms)
✔ jammedClock: un appel direct ne contourne pas la suspension a la frame de liberation (0.3157ms)
✔ staggerClock: hatch suspendu ne libere pas sous effet, reprend au meme curseur puis ne duplique pas (0.2659ms)
✔ staggerClock: un appel direct ne contourne pas la suspension a la frame de liberation (0.2488ms)
✔ detruire un oeuf suspendu joue la destruction au lieu de le ressusciter ou retarder la mort (0.2808ms)
✔ la readylist V66 pointe vers les octets et les160racines effectivement revus (13.8535ms)
✔ les cinq profils du lotV66 sont accessibles au mêmeatlas depuis résolutionmission et laboratoire (1.7016ms)
✔ le vrai moteur nepréchargeaucunennemiV66audémarrage et charge seulement les atlas demandés (1.1221ms)
ℹ tests 70
ℹ suites 0
ℹ pass 70
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 268.5697
```
