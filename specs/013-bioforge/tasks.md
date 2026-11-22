# Tâches : Bioforge, laboratoire de confinement

## Ce lot

- [x] T001 Audit de level design avec parcours réel depuis le hub, captures 1366×768 et 390×844 (`docs/development/BIOFORGE_AUDIT_V188.md`)
- [x] T002 Zones, accessoires nommés, interactions, cuves et rapports ; validation géométrique et d'accès (`src/bioforge-lab-layout-v188.js`)
- [x] T003 Stations `bioforge-control`, `bioforge-purge`, `bioforge-return` et cabine de sortie déplacées hors des battants de porte (`src/bioforge-level-v80.js`)
- [x] T004 Présentation en primitives : cloisons pleine hauteur, plafonds à hauteur humaine, signalétique, lumières, passerelles et échelles visibles, galerie d'observation, cuves, tableau d'admission, invites, HUD à droite, voile de premier plan allégé (`src/bioforge-lab-render-v188.js`)
- [x] T005 Liquide, bulles, brume, givre et braises par le pool VFX V188 ; type `bubble` et emplacement `liquid-bubble`
- [x] T006 Mixin `withBioforgeContainmentLabV188` ajouté en fin de chaîne : promenade sans session, sortie physique après purge, décontamination de sortie, interactions en lecture seule, aucune écriture périodique (`src/bioforge-lab-runtime-v188.js`, `src/bioforge-runtime-v80.js`)
- [x] T007 Raccordement de l'application : armement à l'ouverture de la vue, terminal demandé par la console, retour au hub par la porte, terminal réduit pendant la marche (`src/app.js`, `src/bioforge-ui-v80.js`)
- [x] T008 Terminal mobile sans chevauchement (`bioforge-v80.css`)
- [x] T009 Textes FR/EN (bloc relu du catalogue, delta Tantalus)
- [x] T010 Suite Node `scripts/verify-bioforge-lab-v188.mjs` (dans `test:priorities:v188`) et parcours Chromium `scripts/qa-bioforge-lab-v188.mjs` (`qa:bioforge:v188`)
- [x] T011 Mesure du coût de rendu avant/après dans la même scène
- [x] T012 Bible, audit de contenu, questions du propriétaire

## Reste (non livré, à ne pas déclarer terminé)

- [ ] T101 Images définitives des emplacements `bioforge-lab-*` et `liquid-bubble` (primitives Canvas aujourd'hui ; aucune image générée).
- [ ] T102 Galerie d'observation praticable : exige d'agrandir le monde (validateurs V87 et V132 bornés à 2880 px) et une migration de sauvegarde.
- [ ] T103 Quête `ship-bioforge` « Ce qu'on garde en vie » : débat Inez / BISHOP-9, présence des PNJ dans la galerie, choix de conservation des spécimens ; aucun code n'existe.
- [ ] T104 Reprise exacte pendant la sortie : une sauvegarde en phase `return` repart de la salle de contrôle, retour par le terminal.
- [ ] T105 Lisibilité mobile du canvas (390 px : marine ≈ 28 px) : zoom ou cadrage dédié à définir.
- [ ] T106 Son des cycles (sas, décontamination, incinérateur).
- [ ] T107 Escalade des échelles par l'opérateur (les passerelles restent réservées aux spécimens).
