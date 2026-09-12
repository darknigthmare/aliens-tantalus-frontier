# V79 — Scène titre orbitale modulaire

Date de validation locale : 2026-09-12. Branche : `codex/v52-physical-worlds`. Baseline publiée : `44d5ae3` (V78).

## Composition jouable

- L’écran titre ne dépend plus exclusivement du composite V61 : espace, étoiles, nébuleuse, planète, atmosphère, nuages, structures orbitales, trafic, débris, premier plan et VFX sont des surfaces indépendantes.
- Dix-huit bitmaps originaux OpenAI, contrôlés techniquement et visuellement, alimentent trois presets : Acheron, Ceto et Mire-9.
- Chaque image masque seulement son calque procédural homologue après un événement de chargement réussi. Un fichier absent ou illisible conserve donc une scène complète ; un navigateur sans composition CSS revient au bitmap V61 réel.
- Aucun des 35 slots encore manquants dans le contrat de 53 assets n’est simulé ou exposé au runtime.

## Modes et sélection

- `Full` anime toutes les strates acceptées, `Reduced` retire les couches secondaires et ralentit les mouvements, `Static` garde une composition complète sans animation.
- `prefers-reduced-motion` et le réglage interne forcent le mode statique.
- Acheron, Ceto et Mire-9, y compris leurs variantes de contenu, ouvrent le preset correspondant. Les autres sauvegardes gardent une sélection déterministe par profil et graine ; un choix explicite persisté reste prioritaire.
- Les variables de placement planète/atmosphère/nuages et les recadrages couvrent bureau, portrait et paysage compact.
- Le transport orbital a été réduit/décalé pour rendre la planète lisible ; le titre remet désormais `scrollLeft` à zéro après focus, ouverture et resize afin d’éviter tout recadrage persistant.

## Version et cache

- Le package, le runtime visible, le contrat `RELEASE`, le `build-info.json` généré et le cache PWA portent tous `79.0.0`.
- Le shell précache les modules V79, mais les bitmaps lourds restent chargés et mis en cache à la demande.

## Périmètre honnête

Cette release ne revendique pas les vingt planètes ni les 53 assets terminés. Le premier lot accepté compte 18 fichiers ; 35 slots restent à produire et valider. La dette plus large des ennemis, portraits, audio et conversations historiques reste ouverte.
